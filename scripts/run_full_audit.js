#!/usr/bin/env node
/**
 * THE RESIDENTIALIST — Full Database Audit Bot
 *
 * Audits every scored product across all categories with three checks:
 *   1. Spec Verification      — Perplexity sonar-pro vs manufacturer data
 *   2. Claim Traceability     — Haiku: every claim traced to source material
 *   3. Source Independence     — Haiku: classify source independence ratio
 *
 * Usage:
 *   node scripts/run_full_audit.js
 *   node scripts/run_full_audit.js --categories "sinks,tile"
 *   node scripts/run_full_audit.js --products "blanco_ikon_33,rohl_shaws_rc3618"
 *
 * Run overnight:
 *   nohup /usr/local/bin/node scripts/run_full_audit.js > logs/full_audit.log 2>&1 &
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');
const notify = require('./notify');

// ============================================================================
// CONFIG
// ============================================================================

const BASE_DIR = path.join(__dirname, '..');
const CONFIGS_DIR = path.join(BASE_DIR, 'configs');
const CALIBRATION_DIR = path.join(BASE_DIR, 'calibration');
const KNOWLEDGE_DIR = path.join(BASE_DIR, 'knowledge');
const OUTPUT_DIR = path.join(BASE_DIR, 'output', 'audit');

const HAIKU_MODEL = 'claude-haiku-4-5-20251001';
const PERPLEXITY_MODEL = 'sonar-pro';
const PERPLEXITY_DELAY_MS = 2000;
const MAX_RETRIES = 3;
const RETRY_DELAYS = [15000, 30000, 60000];

// ============================================================================
// ENV LOADING (matches run_full_pipeline.sh pattern)
// ============================================================================

function loadEnvVar(name) {
  try {
    const envPath = path.join(BASE_DIR, '.env');
    const env = fs.readFileSync(envPath, 'utf8');
    const match = env.match(new RegExp(`^${name}=(.+)$`, 'm'));
    return match ? match[1].trim() : process.env[name];
  } catch {
    return process.env[name];
  }
}

const PERPLEXITY_API_KEY = loadEnvVar('PERPLEXITY_API_KEY');
const ANTHROPIC_API_KEY = loadEnvVar('ANTHROPIC_API_KEY');

// Set for SDK
if (ANTHROPIC_API_KEY) process.env.ANTHROPIC_API_KEY = ANTHROPIC_API_KEY;

const anthropic = new Anthropic();

// ============================================================================
// CLI ARGS
// ============================================================================

function parseArgs() {
  const args = process.argv.slice(2);
  let categories = null;
  let products = null;

  for (const arg of args) {
    if (arg.startsWith('--categories=')) {
      categories = arg.replace('--categories=', '').split(',').map(s => s.trim()).filter(Boolean);
    } else if (arg.startsWith('--categories')) {
      const idx = args.indexOf(arg);
      if (idx + 1 < args.length && !args[idx + 1].startsWith('--')) {
        categories = args[idx + 1].replace(/"/g, '').split(',').map(s => s.trim()).filter(Boolean);
      }
    } else if (arg.startsWith('--products=')) {
      products = arg.replace('--products=', '').split(',').map(s => s.trim()).filter(Boolean);
    } else if (arg.startsWith('--products')) {
      const idx = args.indexOf(arg);
      if (idx + 1 < args.length && !args[idx + 1].startsWith('--')) {
        products = args[idx + 1].replace(/"/g, '').split(',').map(s => s.trim()).filter(Boolean);
      }
    }
  }

  return { categories, products };
}

// ============================================================================
// PERPLEXITY API (matches run_research.js pattern)
// ============================================================================

async function callPerplexity(query) {
  if (!PERPLEXITY_API_KEY) throw new Error('PERPLEXITY_API_KEY not set');

  const payload = JSON.stringify({
    model: PERPLEXITY_MODEL,
    messages: [{ role: 'user', content: query }]
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.perplexity.ai',
      path: '/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`Perplexity API ${res.statusCode}: ${data.substring(0, 500)}`));
          return;
        }
        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.message?.content || '';
          const citations = parsed.citations || [];
          resolve({ content, citations });
        } catch (e) {
          reject(new Error(`Parse error: ${e.message}`));
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(120000, () => { req.destroy(); reject(new Error('Timeout (2 min)')); });
    req.write(payload);
    req.end();
  });
}

async function callPerplexityWithRetry(query) {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await callPerplexity(query);
    } catch (err) {
      const isRetryable = err.message.includes('ECONNRESET') ||
                          err.message.includes('ETIMEDOUT') ||
                          err.message.includes('ECONNREFUSED') ||
                          err.message.includes('socket hang up') ||
                          err.message.includes('Timeout') ||
                          err.message.includes('429');
      if (!isRetryable || attempt === MAX_RETRIES) throw err;
      const delay = RETRY_DELAYS[attempt];
      console.log(`    ⚠️  Perplexity ${err.message} — retrying in ${delay / 1000}s (${attempt + 1}/${MAX_RETRIES})`);
      await sleep(delay);
    }
  }
}

// ============================================================================
// HAIKU API (matches haiku_auditor.js pattern)
// ============================================================================

async function callHaiku(prompt, maxTokens = 2048) {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await anthropic.messages.create({
        model: HAIKU_MODEL,
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: prompt }]
      });
      return response.content[0]?.text || '';
    } catch (err) {
      const isRetryable = err.status === 429 || err.status === 529 || err.status >= 500;
      if (!isRetryable || attempt === MAX_RETRIES) throw err;
      const delay = RETRY_DELAYS[attempt];
      console.log(`    ⚠️  Haiku ${err.message} — retrying in ${delay / 1000}s (${attempt + 1}/${MAX_RETRIES})`);
      await sleep(delay);
    }
  }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ============================================================================
// CATEGORY & PRODUCT DISCOVERY
// ============================================================================

function discoverCategories(filterCategories) {
  const configFiles = fs.readdirSync(CONFIGS_DIR).filter(f => f.endsWith('.json'));
  let categories = configFiles.map(f => f.replace('.json', ''));

  if (filterCategories) {
    categories = categories.filter(c => filterCategories.includes(c));
  }

  return categories.sort();
}

function loadCategoryProducts(category) {
  // Primary: calibration config
  const calibConfigPath = path.join(CALIBRATION_DIR, category, 'config.json');
  if (fs.existsSync(calibConfigPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(calibConfigPath, 'utf8'));
      if (config.calibration_products?.length) {
        return config.calibration_products;
      }
    } catch (e) {
      console.log(`    ⚠️  Failed to parse ${calibConfigPath}: ${e.message}`);
    }
  }

  // Fallback: parse calibration JS to extract products array
  const calibJsPath = path.join(BASE_DIR, `score_${category}_calibration.js`);
  if (fs.existsSync(calibJsPath)) {
    try {
      return parseCalibrationJs(calibJsPath);
    } catch (e) {
      console.log(`    ⚠️  Failed to parse ${calibJsPath}: ${e.message}`);
    }
  }

  // Last resort: category config
  const categoryConfigPath = path.join(CONFIGS_DIR, `${category}.json`);
  if (fs.existsSync(categoryConfigPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(categoryConfigPath, 'utf8'));
      // Some category configs have products list
      if (config.products?.length) return config.products;
    } catch (e) { /* skip */ }
  }

  return [];
}

function parseCalibrationJs(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  // Extract products array from JS — look for const products = [ ... ];
  const match = content.match(/const\s+products\s*=\s*\[([\s\S]*?)\n\];/);
  if (!match) return [];

  const productsBlock = match[1];
  const products = [];
  // Extract individual product objects
  const objRegex = /\{\s*\n([\s\S]*?)\n\s*\}/g;
  let m;
  while ((m = objRegex.exec(productsBlock)) !== null) {
    const block = m[1];
    const product = {};

    // Extract key fields with regex
    const nameMatch = block.match(/name:\s*['"`]([^'"`]+)['"`]/);
    const slugMatch = block.match(/slug:\s*['"`]([^'"`]+)['"`]/);
    const targetMatch = block.match(/target:\s*(\d+)/);
    const tierMatch = block.match(/tier:\s*(\d+)/);
    const qualityMatch = block.match(/quality:\s*([\d.]+)/);
    const durabilityMatch = block.match(/durability:\s*([\d.]+)/);
    const performanceMatch = block.match(/performance:\s*([\d.]+)/);

    if (nameMatch) product.name = nameMatch[1];
    if (slugMatch) product.slug = slugMatch[1];
    if (targetMatch) product.target = parseInt(targetMatch[1]);
    if (tierMatch) product.tier = parseInt(tierMatch[1]);
    if (qualityMatch) product.axis_scores = product.axis_scores || {};
    if (qualityMatch) product.axis_scores.quality = parseFloat(qualityMatch[1]);
    if (durabilityMatch) product.axis_scores = product.axis_scores || {};
    if (durabilityMatch) product.axis_scores.durability = parseFloat(durabilityMatch[1]);
    if (performanceMatch) product.axis_scores = product.axis_scores || {};
    if (performanceMatch) product.axis_scores.performance = parseFloat(performanceMatch[1]);

    // Extract notes array
    const notesMatch = block.match(/notes:\s*\[([\s\S]*?)\]/);
    if (notesMatch) {
      const notesStr = notesMatch[1];
      product.notes_text = notesStr.replace(/'/g, '').replace(/,\s*$/gm, '').trim();
    }

    // Extract specAdj
    const specAdjMatch = block.match(/specAdj:\s*\{([^}]+)\}/);
    if (specAdjMatch) {
      product.spec_adj_text = specAdjMatch[1].trim();
    }

    if (product.name && product.slug) {
      products.push(product);
    }
  }

  return products;
}

// ============================================================================
// CURATION FILE LOADING
// ============================================================================

function findCurationFile(category, slug) {
  // Check standard location: calibration/{cat}/curation_files/
  const curationDir = path.join(CALIBRATION_DIR, category, 'curation_files');
  if (fs.existsSync(curationDir)) {
    const files = fs.readdirSync(curationDir).filter(f => f.endsWith('.json'));
    const match = files.find(f => f.includes(slug));
    if (match) return path.join(curationDir, match);
  }

  // Check calibration/{cat}/ root (legacy — windows, countertops)
  const calibDir = path.join(CALIBRATION_DIR, category);
  if (fs.existsSync(calibDir)) {
    const files = fs.readdirSync(calibDir).filter(f =>
      f.endsWith('.json') && f.includes(slug) &&
      (f.includes('_sources') || f.includes('_curation')) &&
      !f.includes('pipeline_progress') && f !== 'config.json'
    );
    if (files.length) return path.join(calibDir, files[0]);
  }

  // Check root curation/ dir (legacy)
  const rootCurationDir = path.join(BASE_DIR, 'curation');
  if (fs.existsSync(rootCurationDir)) {
    const files = fs.readdirSync(rootCurationDir).filter(f =>
      f.endsWith('.json') && f.includes(slug) &&
      (f.includes('_sources') || f.includes('_curation'))
    );
    if (files.length) return path.join(rootCurationDir, files[0]);
  }

  return null;
}

function loadCurationData(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

// ============================================================================
// KNOWLEDGE FILE LOADING
// ============================================================================

function loadKnowledgeFiles(category, slug) {
  const knowledgeDir = path.join(KNOWLEDGE_DIR, category);
  if (!fs.existsSync(knowledgeDir)) return [];

  const files = fs.readdirSync(knowledgeDir).filter(f => f.endsWith('.md'));
  const results = [];

  for (const file of files) {
    const filePath = path.join(knowledgeDir, file);
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      // Prioritize product-specific deep dives, but include all files
      const isDeepDive = file.includes(slug) || file.includes('deep_dive');
      results.push({
        filename: file,
        content: content.substring(0, 30000), // Cap at 30k chars to avoid token limits
        isDeepDive,
        isProductSpecific: file.includes(slug)
      });
    } catch { /* skip unreadable files */ }
  }

  // Sort: product-specific first, then deep dives, then general
  results.sort((a, b) => {
    if (a.isProductSpecific !== b.isProductSpecific) return a.isProductSpecific ? -1 : 1;
    if (a.isDeepDive !== b.isDeepDive) return a.isDeepDive ? -1 : 1;
    return 0;
  });

  return results;
}

// ============================================================================
// CHECK 1: SPEC VERIFICATION
// ============================================================================

async function check1_specVerification(product, category) {
  const results = [];
  const productName = product.name;

  // Build list of key specs to verify
  const specsToVerify = identifyKeySpecs(product, category);

  if (specsToVerify.length === 0) {
    return { specs: [], note: 'No verifiable specs identified for this product' };
  }

  for (const spec of specsToVerify) {
    const query = `For ${productName}, what does the manufacturer's official specification sheet or product page state for ${spec.name}? Provide only the manufacturer-published value and the source URL. Do not use dealer or third-party sources.`;

    try {
      await sleep(PERPLEXITY_DELAY_MS);
      const response = await callPerplexityWithRetry(query);
      const mfgValue = response.content.trim();
      const sourceUrl = response.citations?.[0] || extractUrl(mfgValue) || 'N/A';

      // Use Haiku to compare (handles enum values vs prose descriptions)
      const status = await classifySpecMatchWithHaiku(spec.name, spec.value, mfgValue, productName);

      results.push({
        name: spec.name,
        calibrationValue: spec.value,
        manufacturerValue: mfgValue.substring(0, 200),
        sourceUrl: typeof sourceUrl === 'string' ? sourceUrl.substring(0, 150) : 'N/A',
        status
      });

      console.log(`      ${status === 'VERIFIED' ? '✅' : status === 'DISCREPANCY' ? '⚠️' : '❓'} ${spec.name}: ${status}`);
    } catch (err) {
      results.push({
        name: spec.name,
        calibrationValue: spec.value,
        manufacturerValue: `Error: ${err.message}`,
        sourceUrl: 'N/A',
        status: 'UNVERIFIABLE'
      });
      console.log(`      ❓ ${spec.name}: UNVERIFIABLE (${err.message})`);
    }
  }

  return { specs: results };
}

function identifyKeySpecs(product, category) {
  const specs = [];
  const productSpecs = product.specs || {};
  const notes = product.notes || product.notes_text || '';
  const notesStr = Array.isArray(notes) ? notes.join(' ') : notes;

  // Always try warranty
  if (productSpecs.warranty_years) {
    specs.push({ name: 'Warranty', value: String(productSpecs.warranty_years).replace(/_/g, ' ') });
  } else {
    const warrantyMatch = notesStr.match(/(\d+[\s-]*year|lifetime)\s*(?:limited\s*)?warranty/i);
    if (warrantyMatch) specs.push({ name: 'Warranty', value: warrantyMatch[0] });
  }

  // Primary material/construction
  if (productSpecs.body_material) {
    specs.push({ name: 'Body Material', value: String(productSpecs.body_material).replace(/_/g, ' ') });
  }

  // Category-specific primary dimension/performance specs
  const categorySpecMap = {
    range_hoods: ['cfm_rating', 'sone_level', 'max_cfm'],
    water_heaters: ['btu_input', 'first_hour_rating', 'energy_factor', 'gallons'],
    toilets: ['gpf_flush_volume', 'map_score', 'flush_performance'],
    hvac: ['seer_rating', 'tonnage', 'hspf'],
    dishwashers: ['noise_level_dba', 'energy_star_rating', 'cycles'],
    refrigerators: ['capacity_cubic_feet', 'energy_star'],
    wall_ovens: ['capacity_cubic_feet', 'convection_type'],
    lighting_control: ['max_load_watts', 'gang_compatibility'],
    motorized_shades: ['max_width', 'noise_level', 'motor_type'],
    tile: ['pei_rating', 'water_absorption', 'thickness'],
    sinks: ['basin_depth', 'mounting_type', 'body_material'],
    faucets: ['flow_rate_gpm', 'valve_type', 'finish'],
    windows: ['u_factor', 'shgc', 'frame_material'],
    countertops: ['material_type', 'thickness', 'heat_resistance'],
    ranges_cooktops: ['btu_rating', 'burner_count', 'oven_capacity'],
    cabinets: ['construction_type', 'box_material', 'door_style'],
    hardwood_flooring: ['thickness', 'wear_layer', 'janka_hardness'],
    exterior_doors: ['u_factor', 'material', 'impact_rating']
  };

  const catSpecs = categorySpecMap[category] || [];
  for (const specKey of catSpecs) {
    if (productSpecs[specKey]) {
      const name = specKey.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      // Avoid duplicates (e.g., body_material already added above)
      if (!specs.find(s => s.name === name)) {
        specs.push({ name, value: String(productSpecs[specKey]).replace(/_/g, ' ') });
      }
    }
  }

  // If we have fewer than 3 specs from structured data, try extracting from notes
  if (specs.length < 3 && notesStr) {
    // Look for numeric specs in notes
    const numericSpecs = notesStr.match(/\d+(?:\.\d+)?\s*(?:years?|dB[A]?|CFM|BTU|GPF|inches?|"|watts?|lbs?|°F|gauge)/gi);
    if (numericSpecs) {
      for (const ns of numericSpecs.slice(0, 3 - specs.length)) {
        const name = ns.replace(/[\d.]+\s*/, '').trim();
        if (!specs.find(s => s.name.toLowerCase().includes(name.toLowerCase()))) {
          specs.push({ name: `Spec: ${ns.trim()}`, value: ns.trim() });
        }
      }
    }
  }

  return specs.slice(0, 5); // Cap at 5 specs
}

async function classifySpecMatchWithHaiku(specName, calibValue, mfgResponse, productName) {
  // Quick checks for unverifiable responses
  const lower = (mfgResponse || '').toLowerCase();
  if (!mfgResponse || lower.includes('not found') || lower.includes('unable to find') ||
      lower.includes('could not find') || lower.includes('not available') ||
      lower.includes('no official') || lower.includes('no results')) {
    return 'UNVERIFIABLE';
  }

  // Use Haiku for semantic comparison — handles enum values vs prose
  const prompt = `Compare these two values for the "${specName}" specification of ${productName}.

Our database value: "${calibValue}"
Manufacturer's stated value: "${mfgResponse.substring(0, 500)}"

Do these values refer to the same thing? Consider that our database may use shorthand codes or enum-style values (e.g., "lifetime_limited" = "Limited Lifetime Warranty", "composite_premium" = "SILGRANIT premium granite composite", "apron_front_farmhouse" = "apron front farmhouse sink", "deep_10_plus_inches" = "9.25 inch deep basin").

Answer with exactly one word:
- VERIFIED — the values are consistent / refer to the same specification
- DISCREPANCY — the values are meaningfully different (e.g., different numbers, contradictory claims)
- UNVERIFIABLE — the manufacturer response doesn't contain a clear value for this spec`;

  try {
    const result = await callHaiku(prompt, 128);
    const upper = result.toUpperCase();
    if (upper.includes('VERIFIED')) return 'VERIFIED';
    if (upper.includes('DISCREPANCY')) return 'DISCREPANCY';
    return 'UNVERIFIABLE';
  } catch {
    // Fallback to simple string matching
    const normCalib = String(calibValue).toLowerCase().replace(/[_\s-]+/g, ' ').trim();
    const normMfg = mfgResponse.toLowerCase();
    if (normMfg.includes(normCalib)) return 'VERIFIED';
    const calibNums = normCalib.match(/[\d.]+/g);
    if (calibNums && calibNums.every(n => normMfg.includes(n))) return 'VERIFIED';
    return 'DISCREPANCY';
  }
}

function extractUrl(text) {
  const urlMatch = text.match(/https?:\/\/[^\s)>\]"']+/);
  return urlMatch ? urlMatch[0] : null;
}

// ============================================================================
// CHECK 2: CLAIM TRACEABILITY
// ============================================================================

async function check2_claimTraceability(product, category, curationData) {
  // Build content to extract claims from
  let claimSource = '';

  if (curationData) {
    // Use curation file content — bottom_line + sources snippets
    if (curationData.bottom_line) claimSource += curationData.bottom_line + '\n';
    if (curationData.sources) {
      for (const src of curationData.sources) {
        if (src.snippet) claimSource += src.snippet + '\n';
      }
    }
  }

  // Also use product notes from calibration
  const notes = product.notes || product.notes_text || '';
  const notesStr = Array.isArray(notes) ? notes.join('\n') : notes;
  if (notesStr) claimSource += '\n' + notesStr;

  if (!claimSource.trim()) {
    return { totalClaims: 0, sourced: 0, contradicted: 0, unsourced: 0, details: [], note: 'No claim source material found' };
  }

  // Step 1: Extract claims with Haiku
  console.log(`      Extracting claims...`);
  const extractPrompt = `Read the following curation file content. Extract every distinct factual claim made about this product. A claim is any statement that asserts something specific and verifiable about the product — a spec value, a comparison, a quality judgment with a stated reason, a field observation, a weakness, a strength. List each claim on its own line, numbered. Do not include subjective framing — only extract the factual assertions.

Do not extract lines that start with # or are section headers, product names, or formatting artifacts. Only extract substantive factual assertions.

Content: ${claimSource.substring(0, 8000)}`;

  let claimsText;
  try {
    claimsText = await callHaiku(extractPrompt, 4096);
  } catch (err) {
    return { totalClaims: 0, sourced: 0, contradicted: 0, unsourced: 0, details: [], note: `Claim extraction failed: ${err.message}` };
  }

  // Parse numbered claims
  const claims = claimsText.split('\n')
    .map(l => l.replace(/^\d+[\.\)]\s*/, '').trim())
    .filter(l => l.length > 10);

  if (claims.length === 0) {
    return { totalClaims: 0, sourced: 0, contradicted: 0, unsourced: 0, details: [], note: 'No claims extracted' };
  }

  console.log(`      ${claims.length} claims extracted, verifying against sources...`);

  // Step 2: Load knowledge files
  const knowledgeFiles = loadKnowledgeFiles(category, product.slug);

  if (knowledgeFiles.length === 0) {
    return {
      totalClaims: claims.length,
      sourced: 0,
      contradicted: 0,
      unsourced: claims.length,
      details: claims.map(c => ({ claim: c, status: 'UNSOURCED', note: 'No knowledge files found' })),
      note: 'No knowledge files available for verification'
    };
  }

  // Step 3: For each claim, check against knowledge files
  const details = [];
  let sourced = 0, contradicted = 0, unsourced = 0;

  // Split knowledge files: product-specific vs category-general
  // CRITICAL: Do NOT check other products' deep dives — they cause false contradictions
  const productFiles = knowledgeFiles.filter(kf => kf.isProductSpecific);
  const categoryFiles = knowledgeFiles.filter(kf => !kf.isDeepDive || kf.isProductSpecific);
  const relevantFiles = [...productFiles, ...categoryFiles.filter(kf => !productFiles.includes(kf))];

  for (const claim of claims) {
    let bestStatus = 'UNSOURCED';
    let bestEvidence = '';
    let bestSource = '';

    // Check against relevant knowledge files only (product-specific + category-wide, not other products' deep dives)
    for (const kf of relevantFiles) {
      // Only check first 15k chars of each file to stay within token limits
      const passage = kf.content.substring(0, 15000);

      const verifyPrompt = `Does the following source material contain evidence that supports, contradicts, or is irrelevant to this claim about ${product.name}?

Claim: "${claim}"

Source material: "${passage.substring(0, 6000)}"

IMPORTANT: Only answer CONTRADICTS if the source material directly and specifically contradicts THIS claim about THIS product. Do not confuse information about other products as contradicting a claim about this one.

A contradiction requires a DIRECT factual conflict on the same specific claim about the same specific product. Apply these rules strictly: Differences in specificity or scope are NOT contradictions. If the source says '15-year sealed system warranty with specific exclusions' and the claim says '15-year warranty,' that is a MATCH, not a contradiction. Conditional or qualified statements are NOT contradictions. A claim being MORE general than the source is NOT a contradiction. Only flag CONTRADICTS if the source directly and specifically says the opposite of what the claim states. When in doubt, answer IRRELEVANT, not CONTRADICTS.

Answer with exactly one of:
- SUPPORTS — the source material provides evidence for this claim
- CONTRADICTS — the source material provides evidence against this claim
- IRRELEVANT — the source material does not address this claim

If SUPPORTS or CONTRADICTS, quote the specific passage (max 50 words).`;

      try {
        const result = await callHaiku(verifyPrompt, 512);
        const resultUpper = result.toUpperCase();

        if (resultUpper.includes('SUPPORTS') && bestStatus !== 'CONTRADICTED') {
          bestStatus = 'SOURCED';
          bestEvidence = result.substring(0, 200);
          bestSource = kf.filename;
          break; // Found support, move to next claim
        } else if (resultUpper.includes('CONTRADICTS')) {
          bestStatus = 'CONTRADICTED';
          bestEvidence = result.substring(0, 200);
          bestSource = kf.filename;
          // Don't break — continue checking for possible contradiction resolution
        }
      } catch {
        // Haiku call failed for this file, continue to next
      }
    }

    if (bestStatus === 'SOURCED') sourced++;
    else if (bestStatus === 'CONTRADICTED') contradicted++;
    else unsourced++;

    details.push({
      claim: claim.substring(0, 200),
      status: bestStatus,
      evidence: bestEvidence,
      source: bestSource
    });
  }

  console.log(`      Results: ${sourced} SOURCED, ${unsourced} UNSOURCED, ${contradicted} CONTRADICTED`);

  return { totalClaims: claims.length, sourced, contradicted, unsourced, details };
}

// ============================================================================
// SOURCE NORMALIZATION — unify all curation schemas into a common sources array
// ============================================================================

/**
 * Normalizes sources from three curation file schemas:
 *   1. Old format:  { sources: [{ source_name, url, snippet, ... }] }
 *   2. Pool format: { source_pool_classification: { S: [...], A: [...], B: [...], C: [...] } }
 *   3. Evidence format: { evidence: { expert: [{ pool, source, claim }], review: [...], forum: [...] } }
 *
 * Returns: array of { source_name, url } objects (url may be 'N/A')
 */
function normalizeSources(curationData) {
  if (!curationData) return [];

  // Schema 1: Old format — sources array already present
  if (Array.isArray(curationData.sources) && curationData.sources.length > 0) {
    return curationData.sources;
  }

  // Schema 2: source_pool_classification — { S: [...], A: [...], B: [...], C: [...] }
  if (curationData.source_pool_classification && typeof curationData.source_pool_classification === 'object') {
    const sources = [];
    const seen = new Set();
    for (const [pool, entries] of Object.entries(curationData.source_pool_classification)) {
      if (!Array.isArray(entries)) continue;
      for (const entry of entries) {
        // Each entry is a string like "rinnai.us (manufacturer)" or "Consumer Reports (water heater ratings)"
        const name = typeof entry === 'string' ? entry : (entry.source_name || entry.name || String(entry));
        // Skip placeholder entries
        if (name.includes('VACANT') || name.includes('N/A')) continue;
        // Extract URL if embedded in the name
        const urlMatch = name.match(/https?:\/\/[^\s)>\]"']+/);
        const sourceName = name.replace(/\s*\(.*?\)\s*$/, '').trim();
        if (sourceName && !seen.has(sourceName.toLowerCase())) {
          seen.add(sourceName.toLowerCase());
          sources.push({
            source_name: sourceName,
            url: urlMatch ? urlMatch[0] : 'N/A',
            pool: pool
          });
        }
      }
    }
    return sources;
  }

  // Schema 3: evidence format — { expert: [{ pool, source, claim }], review: [...], forum: [...] }
  if (curationData.evidence && typeof curationData.evidence === 'object') {
    const sources = [];
    const seen = new Set();
    for (const [column, entries] of Object.entries(curationData.evidence)) {
      if (!Array.isArray(entries)) continue;
      for (const entry of entries) {
        const name = entry.source || entry.source_name || '';
        if (name && !seen.has(name.toLowerCase())) {
          seen.add(name.toLowerCase());
          sources.push({
            source_name: name,
            url: entry.url || 'N/A',
            pool: entry.pool || column
          });
        }
      }
    }
    return sources;
  }

  return [];
}

// ============================================================================
// CHECK 3: SOURCE INDEPENDENCE
// ============================================================================

async function check3_sourceIndependence(product, curationData) {
  let sources = normalizeSources(curationData);
  let sourceSchema = 'normalizeSources';

  // Fallback: if normalizeSources returned empty, try direct extraction
  if (!sources.length && curationData) {
    // Fallback 1: source_pool_classification  { S: [...], A: [...], B: [...], C: [...] }
    if (curationData.source_pool_classification && typeof curationData.source_pool_classification === 'object') {
      const seen = new Set();
      for (const [pool, entries] of Object.entries(curationData.source_pool_classification)) {
        if (!Array.isArray(entries)) continue;
        for (const entry of entries) {
          const name = typeof entry === 'string' ? entry : (entry.source_name || entry.name || String(entry));
          if (name.includes('VACANT') || name.includes('N/A')) continue;
          const urlMatch = name.match(/https?:\/\/[^\s)>\]"']+/);
          const sourceName = name.replace(/\s*\(.*?\)\s*$/, '').trim();
          if (sourceName && !seen.has(sourceName.toLowerCase())) {
            seen.add(sourceName.toLowerCase());
            sources.push({ source_name: sourceName, url: urlMatch ? urlMatch[0] : 'N/A', pool });
          }
        }
      }
      if (sources.length) sourceSchema = 'source_pool_classification (fallback)';
    }

    // Fallback 2: evidence  { expert: [{ pool, source, claim }], review: [...], forum: [...] }
    if (!sources.length && curationData.evidence && typeof curationData.evidence === 'object') {
      const seen = new Set();
      for (const [column, entries] of Object.entries(curationData.evidence)) {
        if (!Array.isArray(entries)) continue;
        for (const entry of entries) {
          const name = entry.source || entry.source_name || '';
          if (name && !seen.has(name.toLowerCase())) {
            seen.add(name.toLowerCase());
            sources.push({ source_name: name, url: entry.url || 'N/A', pool: entry.pool || column });
          }
        }
      }
      if (sources.length) sourceSchema = 'evidence (fallback)';
    }
  }

  if (!sources.length) {
    return { totalSources: 0, manufacturer: 0, affiliated: 0, independent: 0, ratio: 0, flag: 'CRITICAL', details: [], note: 'No sources found in any schema (sources[], source_pool_classification, evidence)' };
  }

  console.log(`      Source schema used: ${sourceSchema} → ${sources.length} sources`);

  // Extract brand name (first word of product name) — NOT corporate parent
  // e.g., "Blanco" from "Blanco IKON 33...", "Kohler" from "Kohler Whitehaven..."
  const brandName = product.name.split(' ')[0];
  // Also get the corporate parent for a more complete picture
  const corpParent = product.corporate_parent || '';

  console.log(`      Classifying ${sources.length} sources (brand: ${brandName})...`);

  const details = [];
  let mfgCount = 0, affCount = 0, indCount = 0;

  for (const src of sources) {
    const classifyPrompt = `Classify this source's relationship to the product manufacturer.

Product brand: "${brandName}"
Corporate parent: "${corpParent}"
Source name: "${src.source_name || 'Unknown'}"
Source URL: ${src.url || 'N/A'}

Answer with exactly one of:
- MANUFACTURER — this is the manufacturer's own website (e.g., ${brandName.toLowerCase()}.com), their official documentation, spec sheet, press release, or marketing material
- AFFILIATED — this is a dealer, distributor, installer, integrator, or authorized retailer that sells ${brandName} products and has a financial relationship with them
- INDEPENDENT — this source has no financial relationship with ${brandName} (e.g., Reddit posts, independent review sites, trade publications like This Old House or Residential Systems, consumer forums, certification bodies, professional plumbers/contractors sharing opinions)

Note: Reddit forums, independent review websites, trade magazines, and professional blogs are almost always INDEPENDENT unless they are official ${brandName} channels.`;

    try {
      // Pre-classify based on URL domain when clearly identifiable
      const url = (src.url || '').toLowerCase();
      const brandLower = brandName.toLowerCase();
      let preClassification = null;

      if (url.includes(`${brandLower}.com`) || url.includes(`${brandLower}.us`) || url.includes(`${brandLower}.co`)) {
        preClassification = 'MANUFACTURER';
      } else if (url.includes('reddit.com') || url.includes('thisoldhouse.com') || url.includes('consumerreports.com') ||
                 url.includes('youtube.com') || url.includes('houzz.com')) {
        preClassification = 'INDEPENDENT';
      }

      if (preClassification) {
        if (preClassification === 'MANUFACTURER') mfgCount++;
        else indCount++;
        details.push({
          source: src.source_name || src.url || 'Unknown',
          url: src.url || 'N/A',
          classification: preClassification
        });
      } else {
        const result = await callHaiku(classifyPrompt, 256);
        // Parse classification from the FIRST line of response
        const firstLine = result.split('\n')[0].toUpperCase();

        let classification = 'INDEPENDENT'; // default
        if (firstLine.includes('MANUFACTURER')) { classification = 'MANUFACTURER'; mfgCount++; }
        else if (firstLine.includes('AFFILIATED')) { classification = 'AFFILIATED'; affCount++; }
        else { indCount++; }

        details.push({
          source: src.source_name || src.url || 'Unknown',
          url: src.url || 'N/A',
          classification
        });
      }
    } catch {
      // Default to INDEPENDENT on error (conservative — doesn't inflate flags)
      indCount++;
      details.push({
        source: src.source_name || src.url || 'Unknown',
        url: src.url || 'N/A',
        classification: 'INDEPENDENT',
        note: 'Classification failed, defaulted to INDEPENDENT'
      });
    }
  }

  const total = sources.length;
  const ratio = total > 0 ? (indCount / total) : 0;
  const ratioPercent = (ratio * 100).toFixed(1);

  let flag = 'GREEN';
  if (ratio < 0.20) flag = 'CRITICAL';
  else if (ratio < 0.40) flag = 'RED';
  else if (ratio < 0.60) flag = 'YELLOW';

  console.log(`      Independence: ${ratioPercent}% — ${flag}`);

  return {
    totalSources: total,
    manufacturer: mfgCount,
    affiliated: affCount,
    independent: indCount,
    ratio: ratioPercent,
    flag,
    details
  };
}

// ============================================================================
// REPORT GENERATION
// ============================================================================

function formatProductReport(product, check1, check2, check3) {
  let report = '';
  report += `### ${product.name} (Score: ${product.target || 'N/A'}, Tier ${product.tier || 'N/A'})\n\n`;

  // Check 1: Spec Verification
  report += `#### Spec Verification\n`;
  if (check1.note) report += `*${check1.note}*\n\n`;
  if (check1.specs?.length) {
    report += `| Spec | Calibration Value | Manufacturer Value | Source URL | Status |\n`;
    report += `|---|---|---|---|---|\n`;
    for (const s of check1.specs) {
      const statusIcon = s.status === 'VERIFIED' ? '✅' : s.status === 'DISCREPANCY' ? '⚠️' : '❓';
      report += `| ${s.name} | ${s.calibrationValue} | ${s.manufacturerValue.substring(0, 80)} | ${s.sourceUrl.substring(0, 60)} | ${statusIcon} ${s.status} |\n`;
    }
  } else {
    report += `No specs verified.\n`;
  }
  report += `\n`;

  // Check 2: Claim Traceability
  report += `#### Claim Traceability\n`;
  if (check2.note) report += `*${check2.note}*\n\n`;
  report += `Total claims: ${check2.totalClaims}\n`;
  report += `- SOURCED: ${check2.sourced}\n`;
  report += `- UNSOURCED: ${check2.unsourced}\n`;
  report += `- CONTRADICTED: ${check2.contradicted}${check2.contradicted > 0 ? ' ⚠️ CRITICAL' : ''}\n\n`;

  if (check2.contradicted > 0) {
    report += `**CONTRADICTED claims:**\n`;
    for (const d of check2.details.filter(x => x.status === 'CONTRADICTED')) {
      report += `- Claim: "${d.claim}"\n  Source: ${d.source} — ${d.evidence}\n\n`;
    }
  }
  if (check2.unsourced > 0) {
    report += `**UNSOURCED claims:**\n`;
    for (const d of check2.details.filter(x => x.status === 'UNSOURCED')) {
      report += `- Claim: "${d.claim}"\n  No supporting passage found in any source file.\n\n`;
    }
  }

  // Check 3: Source Independence
  report += `#### Source Independence\n`;
  if (check3.note) report += `*${check3.note}*\n\n`;
  const flagIcon = { GREEN: '🟢', YELLOW: '🟡', RED: '🔴', CRITICAL: '🚨' }[check3.flag] || '❓';
  report += `Total sources: ${check3.totalSources}\n`;
  report += `- MANUFACTURER: ${check3.manufacturer} (${check3.totalSources ? ((check3.manufacturer / check3.totalSources) * 100).toFixed(1) : 0}%)\n`;
  report += `- AFFILIATED: ${check3.affiliated} (${check3.totalSources ? ((check3.affiliated / check3.totalSources) * 100).toFixed(1) : 0}%)\n`;
  report += `- INDEPENDENT: ${check3.independent} (${check3.totalSources ? ((check3.independent / check3.totalSources) * 100).toFixed(1) : 0}%)\n`;
  report += `Independence ratio: ${check3.ratio}% — ${flagIcon} ${check3.flag}\n\n`;

  if (check3.details?.length) {
    report += `Independent sources:\n`;
    for (const d of check3.details.filter(x => x.classification === 'INDEPENDENT')) {
      report += `- ${d.source}\n`;
    }
    report += `\nManufacturer/Affiliated sources:\n`;
    for (const d of check3.details.filter(x => x.classification !== 'INDEPENDENT')) {
      report += `- ${d.source} (${d.classification})\n`;
    }
  }
  report += `\n---\n\n`;

  return report;
}

function determineCategoryStatus(categoryResults) {
  let hasContradictions = false;
  let hasRedCriticalSource = false;
  let hasSpecDiscrepancies = false;
  let hasUnsourced = false;
  let hasYellowSource = false;

  for (const r of categoryResults) {
    if (r.check1?.specs?.some(s => s.status === 'DISCREPANCY')) hasSpecDiscrepancies = true;
    if (r.check2?.contradicted > 0) hasContradictions = true;
    if (r.check2?.unsourced > 0) hasUnsourced = true;
    if (r.check3?.flag === 'RED' || r.check3?.flag === 'CRITICAL') hasRedCriticalSource = true;
    if (r.check3?.flag === 'YELLOW') hasYellowSource = true;
  }

  if (hasContradictions || hasRedCriticalSource) return '🔴 ACTION';
  if (hasSpecDiscrepancies || hasUnsourced || hasYellowSource) return '⚠️ REVIEW';
  return '✅ CLEAN';
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const startTime = Date.now();
  const { categories: filterCategories, products: filterProducts } = parseArgs();

  console.log('='.repeat(70));
  console.log('RESIDENTIALIST — FULL DATABASE AUDIT');
  console.log(`Started: ${new Date().toISOString()}`);
  console.log('='.repeat(70));
  console.log();

  // Discover categories
  const categories = discoverCategories(filterCategories);
  console.log(`Categories to audit: ${categories.length} — ${categories.join(', ')}`);

  // Count total products for notification
  let totalProducts = 0;
  const categoryProductMap = {};
  for (const cat of categories) {
    let products = loadCategoryProducts(cat);
    if (filterProducts) {
      products = products.filter(p => filterProducts.includes(p.slug));
    }
    categoryProductMap[cat] = products;
    totalProducts += products.length;
  }

  console.log(`Total products to audit: ${totalProducts}\n`);

  // Notify start
  await notify(`Full database audit started — ${categories.length} categories, ~${totalProducts} products`);

  // Process each category
  const allCategoryResults = {};
  const dashboardRows = [];

  for (let ci = 0; ci < categories.length; ci++) {
    const category = categories[ci];
    const products = categoryProductMap[category];

    console.log('\n' + '='.repeat(70));
    console.log(`CATEGORY [${ci + 1}/${categories.length}]: ${category.toUpperCase()} (${products.length} products)`);
    console.log('='.repeat(70));

    if (products.length === 0) {
      console.log('  ⚠️  No products found, skipping.');
      dashboardRows.push({
        category,
        products: 0,
        specIssues: 0,
        contradictedClaims: 0,
        redCriticalFlags: 0,
        status: '⚠️ REVIEW'
      });
      continue;
    }

    const categoryResults = [];

    for (let pi = 0; pi < products.length; pi++) {
      const product = products[pi];
      console.log(`\n  --- [${pi + 1}/${products.length}] ${product.name} ---`);

      try {
        // Load curation data
        const curationPath = findCurationFile(category, product.slug);
        const curationData = curationPath ? loadCurationData(curationPath) : null;
        if (!curationData) {
          console.log(`    ⚠️  No curation file found for ${product.slug}`);
        }

        // Run three checks
        console.log('    Check 1: Spec Verification');
        const check1 = await check1_specVerification(product, category);

        console.log('    Check 2: Claim Traceability');
        const check2 = await check2_claimTraceability(product, category, curationData);

        console.log('    Check 3: Source Independence');
        const check3 = await check3_sourceIndependence(product, curationData);

        categoryResults.push({ product, check1, check2, check3 });
      } catch (err) {
        console.error(`    ❌ FAILED: ${err.message}`);
        categoryResults.push({
          product,
          check1: { specs: [], note: `Error: ${err.message}` },
          check2: { totalClaims: 0, sourced: 0, contradicted: 0, unsourced: 0, details: [], note: `Error: ${err.message}` },
          check3: { totalSources: 0, manufacturer: 0, affiliated: 0, independent: 0, ratio: 0, flag: 'CRITICAL', details: [], note: `Error: ${err.message}` }
        });
      }
    }

    allCategoryResults[category] = categoryResults;

    // Category summary
    const specIssues = categoryResults.reduce((sum, r) => sum + (r.check1?.specs?.filter(s => s.status === 'DISCREPANCY')?.length || 0), 0);
    const contradictedClaims = categoryResults.reduce((sum, r) => sum + (r.check2?.contradicted || 0), 0);
    const redCriticalFlags = categoryResults.reduce((sum, r) => sum + (['RED', 'CRITICAL'].includes(r.check3?.flag) ? 1 : 0), 0);
    const status = determineCategoryStatus(categoryResults);

    dashboardRows.push({
      category,
      products: products.length,
      specIssues,
      contradictedClaims,
      redCriticalFlags,
      status
    });

    const catSummary = `[${ci + 1}/${categories.length}] ${category} audit complete — ${status}`;
    console.log(`\n  ${catSummary}`);
    await notify(catSummary);
  }

  // ============================================================================
  // BUILD FINAL REPORT
  // ============================================================================

  const date = new Date().toISOString().split('T')[0];
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  let report = `# Residentialist Full Database Audit\n## ${date}\n\n---\n\n`;

  // Dashboard
  report += `## DASHBOARD SUMMARY\n\n`;
  report += `| Category | Products | Spec Issues | Contradicted Claims | Red/Critical Source Flags | Overall |\n`;
  report += `|---|---|---|---|---|---|\n`;

  for (const row of dashboardRows) {
    const catName = row.category.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    report += `| ${catName} | ${row.products} | ${row.specIssues} | ${row.contradictedClaims} | ${row.redCriticalFlags} | ${row.status} |\n`;
  }

  const cleanCount = dashboardRows.filter(r => r.status.includes('CLEAN')).length;
  const reviewCount = dashboardRows.filter(r => r.status.includes('REVIEW')).length;
  const actionCount = dashboardRows.filter(r => r.status.includes('ACTION')).length;
  const totalSpecIssues = dashboardRows.reduce((s, r) => s + r.specIssues, 0);
  const totalContradictions = dashboardRows.reduce((s, r) => s + r.contradictedClaims, 0);
  const totalRedFlags = dashboardRows.reduce((s, r) => s + r.redCriticalFlags, 0);

  report += `\n### Overall Status:\n`;
  report += `- ✅ CLEAN: ${cleanCount} categories — no issues found\n`;
  report += `- ⚠️ REVIEW: ${reviewCount} categories — minor issues, manual review recommended\n`;
  report += `- 🔴 ACTION: ${actionCount} categories — critical issues found, must fix before publication\n\n`;

  report += `### Flag Counts:\n`;
  report += `- Spec discrepancies found: ${totalSpecIssues}\n`;
  report += `- Contradicted claims found: ${totalContradictions}${totalContradictions > 0 ? ' (CRITICAL)' : ''}\n`;
  report += `- Source independence RED/CRITICAL flags: ${totalRedFlags}\n\n`;
  report += `---\n\n`;

  // Per-category reports
  for (const category of categories) {
    const catName = category.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    report += `## CATEGORY: ${catName}\n\n`;

    const results = allCategoryResults[category] || [];
    for (const r of results) {
      report += formatProductReport(r.product, r.check1, r.check2, r.check3);
    }
  }

  // Write report
  const reportFilename = `full_database_audit_${date}.md`;
  const reportPath = path.join(OUTPUT_DIR, reportFilename);
  fs.writeFileSync(reportPath, report);

  const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);

  console.log('\n' + '='.repeat(70));
  console.log(`✅ FULL DATABASE AUDIT COMPLETE`);
  console.log(`📄 Report: ${reportPath}`);
  console.log(`⏱️  Elapsed: ${elapsed} minutes`);
  console.log(`Dashboard: ${cleanCount} clean, ${reviewCount} review, ${actionCount} action`);
  console.log('='.repeat(70));

  // Final notification
  await notify(`Full audit complete (${elapsed} min). Dashboard: ${cleanCount} clean, ${reviewCount} review, ${actionCount} action. See output/audit/${reportFilename}`);
}

main().catch(err => {
  console.error('FATAL:', err);
  notify(`❌ Full audit FAILED: ${err.message}`).then(() => process.exit(1));
});
