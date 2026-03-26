#!/usr/bin/env node
/**
 * THE RESIDENTIALIST — Spec Verifier
 * Extracts spec claims from curation, verifies via Perplexity targeted lookup,
 * attempts PDF Tier 1 extraction, populates verified_specs table.
 *
 * Usage:
 *   node spec_verifier.js <product_slug>
 *   node spec_verifier.js --batch
 */

require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const Anthropic = require('@anthropic-ai/sdk');

const WORKSPACE = __dirname;
const CURATION_DIR = path.join(WORKSPACE, 'curation');
const DB_PATH = path.join(WORKSPACE, 'residentialist.db');
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

let anthropic = null;
function getClient() {
  if (!anthropic) anthropic = new Anthropic();
  return anthropic;
}

const SPEC_NAMES = [
  'u_factor', 'shgc', 'air_infiltration', 'dp_rating',
  'glass_warranty', 'structural_warranty', 'labor_warranty',
  'warranty_transferable', 'frame_material', 'glazing_layers'
];

// ─── EU→US Conversion ───────────────────────────────────────────────────────

function convertToUS(specName, rawValue, rawUnit, testStandard) {
  const val = parseFloat(rawValue);

  // U-factor: EU W/m²·K → US BTU/hr·ft²·°F
  if (specName === 'u_factor' && (rawUnit || '').includes('W/m') || testStandard === 'EN_673' || testStandard === 'CE') {
    if (!isNaN(val)) {
      return { normalized: (val * 0.176).toFixed(3), unit: 'BTU/hr·ft²·°F', method: 'multiply_0.176', note: `EU Uw ${val} W/m²·K → US ${(val * 0.176).toFixed(3)}` };
    }
  }

  // Air infiltration: EN 12207 class → cfm/ft²
  if (specName === 'air_infiltration' && (testStandard === 'EN_12207' || (rawUnit || '').includes('EN_class'))) {
    const classMap = { '4': '0.03', '3': '0.10', '2': '0.22', '1': '0.35' };
    const cls = String(rawValue).replace(/[^1-4]/g, '');
    if (classMap[cls]) {
      return { normalized: classMap[cls], unit: 'cfm/ft²', method: 'en12207_equivalency_map', note: `EN Class ${cls} mapped to ≤${classMap[cls]} cfm/ft² (approximate)` };
    }
  }

  // DP rating: EN 12210 class → psf
  if (specName === 'dp_rating' && (testStandard === 'EN_12210' || (rawUnit || '').includes('EN_class'))) {
    const cls = String(rawValue).replace(/[^1-5]/g, '');
    const classMap = { '5': '60', '4': '52', '3': '37', '2': '25', '1': '15' };
    if (classMap[cls]) {
      return { normalized: classMap[cls], unit: 'psf', method: 'en12210_equivalency_map', note: `EN Class ${cls} → ~DP${classMap[cls]} (approximate)` };
    }
    // If raw value is in Pa, convert: 1 psf = 47.88 Pa
    if ((rawUnit || '').includes('Pa') && !isNaN(val)) {
      return { normalized: Math.round(val / 47.88).toString(), unit: 'psf', method: 'pa_to_psf', note: `${val} Pa → DP${Math.round(val / 47.88)}` };
    }
  }

  // No conversion needed — direct
  return { normalized: String(rawValue), unit: rawUnit || '', method: 'direct', note: null };
}

// ─── Step 1: Extract claims from curation ───────────────────────────────────

async function extractClaims(curation) {
  const client = getClient();
  const productName = curation.product_name || curation.product || 'Unknown';

  // Gather spec data from curation
  const specsSection = curation.verified_specs ? JSON.stringify(curation.verified_specs, null, 2) : 'None';
  const warrantySection = curation.warranty_reality ? JSON.stringify(curation.warranty_reality, null, 2) : 'None';
  const sourceSummaries = (curation.sources || [])
    .filter(s => s.classification === 'score' || s.classification === 'report_only')
    .map(s => `[${s.id}] ${s.source_name}: ${(s.snippet || '').substring(0, 200)}`)
    .join('\n');

  const prompt = `Read the following curation data for ${productName}. Extract every specific, verifiable specification claim.

VERIFIED SPECS SECTION:
${specsSection}

WARRANTY SECTION:
${warrantySection}

SOURCE SNIPPETS:
${sourceSummaries}

Return as JSON:
{
  "claims": [
    {"spec_name": "u_factor", "claimed_value": "0.24", "claimed_unit": "BTU/hr·ft²·°F", "source_in_curation": "Expert source #3"},
    {"spec_name": "glass_warranty", "claimed_value": "20", "claimed_unit": "years", "source_in_curation": "Manufacturer website"},
    {"spec_name": "warranty_transferable", "claimed_value": "no", "claimed_unit": "yes/no", "source_in_curation": "Warranty page"}
  ]
}

Valid spec_names: ${SPEC_NAMES.join(', ')}.
Only include verifiable specs (numbers, durations, yes/no facts). Do not include subjective claims.`;

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    });
    const text = response.content[0].text;
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]).claims || [];
  } catch (err) {
    console.warn(`[SPEC_VERIFIER] Claim extraction failed: ${err.message}`);
  }
  return [];
}

// ─── Step 2: Perplexity targeted verification ───────────────────────────────

async function perplexityVerify(productName, manufacturer) {
  if (!PERPLEXITY_API_KEY) {
    console.warn('[SPEC_VERIFIER] No Perplexity API key — skipping verification lookup');
    return null;
  }

  const mfgName = manufacturer || productName.split(' ')[0];

  const prompt = `Go to the official manufacturer product page for ${productName} by ${mfgName}.
Find and report ONLY the following verified specifications:
1. NFRC-certified U-factor (or EN Uw value if European)
2. NFRC-certified SHGC
3. AAMA air infiltration rating (or EN 12207 class if European)
4. Design pressure / DP rating (or EN 12210 class if European)
5. Glass/seal warranty — exact years and whether transferable
6. Structural/frame warranty — exact years
7. Labor warranty — exact years, included or not
8. Frame material

For each spec found:
- State the exact value
- Provide the exact URL where you found it
- State whether it came from the manufacturer's website, NFRC database, a downloadable PDF spec sheet, or a third-party source

For each spec NOT found on official sources, state: "NOT FOUND ON OFFICIAL SOURCES"

IMPORTANT — PDF HANDLING:
If you encounter a PDF spec sheet, technical data sheet, or warranty document:
- If you CAN read it: extract the specs and note "Source: PDF at [URL]"
- If you CANNOT read it: Report it as: "PDF_FOUND_NOT_READ: [URL] — [reason]"

Do NOT guess. Do NOT infer from reviews or forum posts. Only report what is published on official manufacturer or certification body pages.

Return as JSON:
{
  "specs": [
    {"spec_name": "u_factor", "value": "0.24", "unit": "BTU/hr·ft²·°F", "source_url": "https://...", "source_type": "nfrc_database", "test_standard": "NFRC"},
    {"spec_name": "glass_warranty", "value": "20", "unit": "years", "source_url": "https://...", "source_type": "manufacturer_website", "test_standard": "manufacturer"}
  ],
  "not_found": ["shgc", "air_infiltration"],
  "pdfs_not_read": [
    {"url": "https://...", "reason": "download button"}
  ]
}`;

  const REFUSAL_PHRASES = ['i cannot perform', 'real-time web search', 'limitations of my search'];
  const MAX_ATTEMPTS = 2;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'sonar-deep-research',
          messages: [{ role: 'user', content: prompt }]
        })
      });

      if (!response.ok) {
        console.warn(`[SPEC_VERIFIER] Perplexity error: ${response.status}`);
        return null;
      }

      const data = await response.json();
      const text = data.choices[0].message.content;

      // Check for refusal
      const textLower = text.toLowerCase();
      if (text.length < 3000 && REFUSAL_PHRASES.some(p => textLower.includes(p))) {
        console.warn(`[SPEC_VERIFIER] Perplexity refused (attempt ${attempt})`);
        if (attempt < MAX_ATTEMPTS) { await new Promise(r => setTimeout(r, 30000)); continue; }
        return null;
      }

      // Parse JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try { return JSON.parse(jsonMatch[0]); } catch (e) {
          // Try jsonrepair
          try {
            const { jsonrepair } = require('jsonrepair');
            return JSON.parse(jsonrepair(jsonMatch[0]));
          } catch (e2) {}
        }
      }

      // If we can't parse JSON, try to extract specs from text
      console.warn(`[SPEC_VERIFIER] Could not parse Perplexity JSON — returning raw text for manual review`);
      return { raw_text: text, specs: [], not_found: SPEC_NAMES, pdfs_not_read: [] };

    } catch (err) {
      console.warn(`[SPEC_VERIFIER] Perplexity call failed: ${err.message}`);
      return null;
    }
  }
  return null;
}

// ─── Step 2.5 Tier 1: PDF Download + Sonnet ─────────────────────────────────

async function attemptPdfDownload(url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 15000
    }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        const redirectUrl = res.headers.location;
        if (!redirectUrl) { resolve({ success: false, reason: 'empty_redirect' }); return; }
        attemptPdfDownload(redirectUrl).then(resolve);
        return;
      }

      const contentType = res.headers['content-type'] || '';
      if (!contentType.includes('pdf') && !contentType.includes('octet-stream')) {
        res.destroy();
        resolve({ success: false, reason: 'not_pdf_content_type' });
        return;
      }

      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        if (buffer.slice(0, 5).toString().startsWith('%PDF')) {
          resolve({ success: true, buffer });
        } else {
          resolve({ success: false, reason: 'not_valid_pdf' });
        }
      });
    });
    req.on('error', () => resolve({ success: false, reason: 'network_error' }));
    req.on('timeout', () => { req.destroy(); resolve({ success: false, reason: 'timeout' }); });
  });
}

async function extractSpecsFromPdf(pdfBuffer, productName) {
  const client = getClient();
  const base64Pdf = pdfBuffer.toString('base64');

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'document',
            source: { type: 'base64', media_type: 'application/pdf', data: base64Pdf }
          },
          {
            type: 'text',
            text: `This is a spec sheet or warranty document for ${productName}.
Extract ONLY these specifications if present: ${SPEC_NAMES.join(', ')}.

Return JSON only:
{
  "specs_found": [
    {"spec_name": "u_factor", "value": "0.24", "unit": "BTU/hr·ft²·°F", "test_standard": "NFRC"}
  ],
  "specs_not_found": ["labor_warranty"]
}

Only report values explicitly stated in the document.`
          }
        ]
      }]
    });

    const text = response.content[0].text;
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
  } catch (err) {
    console.warn(`[SPEC_VERIFIER] PDF extraction failed: ${err.message}`);
  }
  return null;
}

// ─── Step 3: Compare claims vs verified, populate table ─────────────────────

function populateVerifiedSpecs(db, productSlug, claims, perplexityResult, pdfSpecs) {
  const upsert = db.prepare(`
    INSERT INTO verified_specs (product_slug, spec_name, raw_value, raw_unit, test_standard, normalized_value, normalized_unit, conversion_method, conversion_note, source_url, source_type, verified_date, verified_by, confidence, flag_note)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), 'bot', ?, ?)
    ON CONFLICT(product_slug, spec_name) DO UPDATE SET
      raw_value = excluded.raw_value, raw_unit = excluded.raw_unit, test_standard = excluded.test_standard,
      normalized_value = excluded.normalized_value, normalized_unit = excluded.normalized_unit,
      conversion_method = excluded.conversion_method, conversion_note = excluded.conversion_note,
      source_url = excluded.source_url, source_type = excluded.source_type,
      verified_date = datetime('now'), confidence = excluded.confidence, flag_note = excluded.flag_note,
      updated_at = datetime('now')
  `);

  const stats = { verified: 0, conflicting: 0, bot_found: 0, unverified: 0 };

  // Build lookup from Perplexity results
  const pxSpecs = {};
  if (perplexityResult && perplexityResult.specs) {
    for (const s of perplexityResult.specs) {
      pxSpecs[s.spec_name] = s;
    }
  }

  // Build lookup from PDF extractions
  const pdfLookup = {};
  if (pdfSpecs) {
    for (const s of (pdfSpecs.specs_found || [])) {
      pdfLookup[s.spec_name] = s;
    }
  }

  // Build lookup from claims
  const claimLookup = {};
  for (const c of claims) {
    claimLookup[c.spec_name] = c;
  }

  // Process all known spec names
  const allSpecs = new Set([...Object.keys(pxSpecs), ...Object.keys(claimLookup), ...Object.keys(pdfLookup)]);

  for (const specName of allSpecs) {
    const px = pxSpecs[specName];
    const claim = claimLookup[specName];
    const pdf = pdfLookup[specName];

    // Best source: Perplexity verified > PDF extraction > claim from curation
    let bestSource = px || pdf || null;
    let confidence = 'unverified';
    let flagNote = null;

    if (bestSource) {
      const rawValue = bestSource.value || bestSource.claimed_value || '';
      const rawUnit = bestSource.unit || bestSource.claimed_unit || '';
      const testStandard = bestSource.test_standard || 'manufacturer';
      const sourceUrl = bestSource.source_url || '';
      const sourceType = px ? (px.source_type || 'perplexity_lookup') : (pdf ? 'spec_sheet_pdf' : 'unverified');

      // Check for conflicts with deep dive claims
      if (claim && bestSource && px) {
        const claimVal = String(claim.claimed_value).toLowerCase().trim();
        const verifiedVal = String(rawValue).toLowerCase().trim();
        if (claimVal !== verifiedVal && claimVal !== '' && verifiedVal !== '') {
          confidence = 'conflicting';
          flagNote = `Deep dive claimed ${claim.claimed_value} ${claim.claimed_unit || ''}, verified source says ${rawValue} ${rawUnit}`;
          stats.conflicting++;
        } else {
          confidence = 'verified';
          stats.verified++;
        }
      } else if (px) {
        confidence = 'verified';
        stats.verified++;
      } else if (pdf) {
        confidence = 'bot_found';
        stats.bot_found++;
      } else {
        confidence = 'unverified';
        stats.unverified++;
      }

      // Convert to US units
      const conv = convertToUS(specName, rawValue, rawUnit, testStandard);

      upsert.run(
        productSlug, specName, rawValue, rawUnit, testStandard,
        conv.normalized, conv.unit, conv.method, conv.note,
        sourceUrl, sourceType, confidence, flagNote
      );
    } else if (claim) {
      // Only have a claim, no verification
      const conv = convertToUS(specName, claim.claimed_value, claim.claimed_unit, 'curation_claim');
      upsert.run(
        productSlug, specName, claim.claimed_value, claim.claimed_unit || '', 'curation_claim',
        conv.normalized, conv.unit, conv.method, conv.note,
        '', 'unverified', 'unverified', 'Not found on official sources — needs manual verification'
      );
      stats.unverified++;
    }
  }

  return stats;
}

// ─── Main verify function ───────────────────────────────────────────────────

async function verifyProduct(productSlug, options = {}) {
  const curationPath = path.join(CURATION_DIR, `${productSlug}_sources.json`);
  if (!fs.existsSync(curationPath)) {
    console.error(`[SPEC_VERIFIER] Curation file not found: ${curationPath}`);
    return null;
  }

  const curation = JSON.parse(fs.readFileSync(curationPath, 'utf8'));
  const productName = curation.product_name || curation.product || productSlug;
  const mfgSlug = curation.manufacturer_slug;

  console.log(`[SPEC_VERIFIER] ── ${productName} ──`);

  // Step 1: Extract claims
  console.log(`[SPEC_VERIFIER] Step 1: Extracting claims from curation...`);
  const claims = await extractClaims(curation);
  console.log(`[SPEC_VERIFIER]   ${claims.length} claims extracted`);

  // Step 2: Perplexity targeted verification
  let perplexityResult = null;
  if (!options.skipPerplexity) {
    console.log(`[SPEC_VERIFIER] Step 2: Perplexity verification lookup...`);
    perplexityResult = await perplexityVerify(productName, mfgSlug);
    if (perplexityResult && perplexityResult.specs) {
      console.log(`[SPEC_VERIFIER]   ${perplexityResult.specs.length} specs verified, ${(perplexityResult.not_found || []).length} not found`);
    } else {
      console.log(`[SPEC_VERIFIER]   Perplexity verification returned no structured data`);
    }
  }

  // Step 2.5: PDF Tier 1 — try downloading flagged PDFs
  let pdfSpecs = null;
  const pdfsToTry = (perplexityResult && perplexityResult.pdfs_not_read) || [];
  const Database = require('better-sqlite3');
  const db = new Database(DB_PATH);

  if (pdfsToTry.length > 0) {
    console.log(`[SPEC_VERIFIER] Step 2.5: Attempting ${pdfsToTry.length} PDF downloads (Tier 1)...`);
    for (const pdf of pdfsToTry) {
      const dlResult = await attemptPdfDownload(pdf.url);
      if (dlResult.success) {
        console.log(`[SPEC_VERIFIER]   ✅ Downloaded PDF: ${pdf.url} (${dlResult.buffer.length} bytes)`);
        const extracted = await extractSpecsFromPdf(dlResult.buffer, productName);
        if (extracted && extracted.specs_found && extracted.specs_found.length > 0) {
          pdfSpecs = extracted;
          console.log(`[SPEC_VERIFIER]   ✅ Extracted ${extracted.specs_found.length} specs from PDF`);

          // Mark as resolved in escalation queue
          db.prepare(`INSERT OR REPLACE INTO pdf_escalation_queue (product_slug, pdf_url, status, resolved_by, resolved_at)
            VALUES (?, ?, 'resolved', 'tier1_sonnet', datetime('now'))`).run(productSlug, pdf.url);
        }
      } else {
        console.log(`[SPEC_VERIFIER]   ⬇ PDF failed: ${pdf.url} — ${dlResult.reason}`);
        // Queue for Tier 2
        db.prepare(`INSERT OR IGNORE INTO pdf_escalation_queue (product_slug, pdf_url, spec_names_needed, reason, status)
          VALUES (?, ?, ?, ?, 'needs_browser')`).run(productSlug, pdf.url, JSON.stringify(SPEC_NAMES), pdf.reason || dlResult.reason);
      }
    }
  }

  // Step 3: Compare and populate
  console.log(`[SPEC_VERIFIER] Step 3: Populating verified_specs table...`);
  const stats = populateVerifiedSpecs(db, productSlug, claims, perplexityResult, pdfSpecs);
  console.log(`[SPEC_VERIFIER]   verified=${stats.verified}, conflicting=${stats.conflicting}, bot_found=${stats.bot_found}, unverified=${stats.unverified}`);

  db.close();
  return stats;
}

// ─── CLI ────────────────────────────────────────────────────────────────────

if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.log('Usage: node spec_verifier.js <product_slug>');
    console.log('       node spec_verifier.js --batch [--skip-perplexity]');
    process.exit(1);
  }

  if (args[0] === '--batch') {
    const skipPerplexity = args.includes('--skip-perplexity');

    (async () => {
      const files = fs.readdirSync(CURATION_DIR)
        .filter(f => f.endsWith('_sources.json') && !f.includes('pipeline'))
        .sort();

      const totals = { verified: 0, conflicting: 0, bot_found: 0, unverified: 0 };
      const results = [];
      let processed = 0;

      for (const file of files) {
        const slug = file.replace('_sources.json', '');
        const stats = await verifyProduct(slug, { skipPerplexity });
        if (stats) {
          results.push({ slug, ...stats });
          for (const k of Object.keys(totals)) totals[k] += (stats[k] || 0);
        }
        processed++;

        // 10s delay between Perplexity calls
        if (!skipPerplexity && processed < files.length) {
          await new Promise(r => setTimeout(r, 10000));
        }
      }

      console.log('\n' + '═'.repeat(80));
      console.log('  BATCH VERIFICATION COMPLETE');
      console.log('═'.repeat(80));
      console.log(`  Products processed: ${processed}`);
      console.log(`  Verified:     ${totals.verified}`);
      console.log(`  Conflicting:  ${totals.conflicting}`);
      console.log(`  Bot found:    ${totals.bot_found}`);
      console.log(`  Unverified:   ${totals.unverified}`);
      console.log('═'.repeat(80));

      // Show conflicts
      const Database = require('better-sqlite3');
      const db = new Database(DB_PATH, { readonly: true });
      const conflicts = db.prepare("SELECT product_slug, spec_name, flag_note FROM verified_specs WHERE confidence = 'conflicting'").all();
      if (conflicts.length > 0) {
        console.log('\n  CONFLICTS REQUIRING REVIEW:');
        for (const c of conflicts) {
          console.log(`  ⚠️  ${c.product_slug} / ${c.spec_name}: ${c.flag_note}`);
        }
      }

      // Show PDF escalation queue
      const pdfQueue = db.prepare("SELECT product_slug, pdf_url, status FROM pdf_escalation_queue WHERE status != 'resolved'").all();
      if (pdfQueue.length > 0) {
        console.log(`\n  PDF ESCALATION QUEUE (${pdfQueue.length} items):`);
        for (const p of pdfQueue) {
          console.log(`  📄 ${p.product_slug}: ${p.pdf_url} [${p.status}]`);
        }
      }

      db.close();
    })();
  } else {
    const slug = args[0];
    const skipPerplexity = args.includes('--skip-perplexity');
    verifyProduct(slug, { skipPerplexity }).then(stats => {
      if (stats) console.log(`\nDone: ${JSON.stringify(stats)}`);
    });
  }
}

module.exports = { verifyProduct, convertToUS, SPEC_NAMES };
