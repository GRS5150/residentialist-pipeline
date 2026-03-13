/**
 * THE RESIDENTIALIST — Bot Orchestrator v3
 * Sequences Bot 1 (Consensus) → Bot 2 (Evaluator) → Bot 3 (Material Safety) → Bot 4 (Challenge)
 * Halts pipeline at any FLAG from Challenge Bot.
 *
 * v3 changes: JSON validation for Bots 2-3, structured output, PIPELINE_STATUS.json
 *
 * Usage:
 *   node bot_orchestrator_v3.js <product_name> <config> <research_file_1> [research_file_2] ...
 *
 * Example:
 *   node bot_orchestrator_v3.js "Marvin Integrity DH" DH ./inputs/marvin_integrity_research.md
 *
 * Outputs to: ./outputs/<product_slug>_pipeline_<timestamp>/
 */

const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');
const { validate: deterministicValidate } = require('./deterministic_validator');
// sendTelegram defined locally to avoid circular dependency with auto_runner
const https = require('https');
function sendTelegram(message) {
  return new Promise((resolve) => {
    try {
      const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
      const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
      const body = JSON.stringify({ chat_id: CHAT_ID, text: message, parse_mode: 'Markdown' });
      const options = { hostname: 'api.telegram.org', path: `/bot${TOKEN}/sendMessage`, method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } };
      const req = https.request(options, (res) => { res.on('data', () => {}); res.on('end', resolve); });
      req.on('error', () => resolve());
      req.write(body); req.end();
    } catch(e) { resolve(); }
  });
}

// ─── MATERIAL CEILING TABLE ───────────────────────────────────────────────────
// Single source of truth for 2B Materials Durability ceilings.
// Injected directly into Bot 2's prompt — not a rule to interpret, a hard fact.
// Update this table to update the entire pipeline.
const MATERIAL_CEILINGS = {
  'pultruded fiberglass': { base: 9, ceiling: 10 },
  'ultrex':               { base: 9, ceiling: 10 },
  'aluminum-clad wood':   { base: 8, ceiling: 9  },  // extruded
  'aluminum clad wood':   { base: 8, ceiling: 9  },
  'roll-form':            { base: 7, ceiling: 8  },
  'vinyl-clad wood':      { base: 7, ceiling: 8  },
  'composite':            { base: 6, ceiling: 7  },
  'fibrex':               { base: 6, ceiling: 7  },
  'proprietary':          { base: 6, ceiling: 7  },
  'vinyl':                { base: 5, ceiling: 6  },
  'aluminum':             { base: 5, ceiling: 6  },
};

function getMaterialCeiling(materialClass) {
  if (!materialClass) return { base: 5, ceiling: 6, label: 'Unknown — defaulting to vinyl' };
  const lower = materialClass.toLowerCase();
  for (const [key, vals] of Object.entries(MATERIAL_CEILINGS)) {
    if (lower.includes(key)) {
      return { ...vals, label: materialClass };
    }
  }
  // Default to most conservative if unrecognized
  return { base: 5, ceiling: 6, label: materialClass + ' (unrecognized — defaulting to vinyl)' };
}

require('dotenv').config({ path: '/Users/Residentialist/.openclaw/workspace/residentialist/.env' });

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── BOT OUTPUT VALIDATOR (v3 — JSON-aware) ─────────────────────────────────
// Replaces verifyBotOutput from v2. For Bot 1: validates non-empty markdown.
// For Bots 2-6: validates and parses JSON output.

function validateBotOutput(output, botName, productName, outputDir) {
  // For Bot 1: output is markdown (web search makes JSON unreliable). Validate non-empty.
  if (botName === 'Bot 1 (Consensus)') {
    if (!output || output.length < 300) {
      throw new Error(`BOT FAILURE: ${botName} output too short (${output?.length || 0} chars)`);
    }
    return true;
  }

  // For Bots 2-6: output should be JSON. Try to parse it.
  try {
    const parsed = JSON.parse(output);
    // Bot 2 must have scores
    if (botName === 'Bot 2 (Evaluator)' && !parsed.scores) {
      throw new Error('Bot 2 output missing scores object');
    }
    // Bot 3 must have material_safety
    if (botName === 'Bot 3 (Material Safety)' && parsed.material_safety_score === undefined) {
      throw new Error('Bot 3 output missing material_safety_score');
    }
    return parsed;
  } catch (e) {
    if (e instanceof SyntaxError) {
      // JSON parse failed — try to extract JSON from markdown-wrapped response
      const jsonMatch = output.match(/```json\n?([\s\S]*?)\n?```/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[1]);
          return parsed;
        } catch (e2) {
          // Fall through to error
        }
      }
      throw new Error(`BOT FAILURE: ${botName} did not return valid JSON. Raw output starts with: ${output.substring(0, 200)}`);
    }
    throw e;
  }
}

// ─── DATA COMPLETENESS CHECKER ───────────────────────────────────────────────
// Runs after Bot 1. Pure deterministic — no API calls, no AI.
// Checks whether critical data targets were found in Bot 1's output.
// On missing fields: fires Telegram warning and logs gap file.
// Does NOT halt pipeline — Bot 2 handles midpoint scoring for gaps.
// Purpose: catch Bot 1 search failures BEFORE they silently enter scoring.

const REQUIRED_FIELDS = {
  windows: [
    { field: 'U-Factor',         signals: ['u-factor', 'u factor', 'ufactor'],              source: 'NFRC certification database' },
    { field: 'SHGC',             signals: ['shgc', 'solar heat gain'],                       source: 'NFRC certification database' },
    { field: 'Air Infiltration', signals: ['air infiltration', 'air leakage', 'cfm/ft'],     source: 'NFRC / AAMA certification' },
    { field: 'AAMA/NAFS Class',   signals: ['aama', 'nafs', 'csa a440', 'performance class', 'performance grade', 'design pressure', 'en 14351'],  source: 'AAMA/NAFS/EN certification directory' },
    { field: 'Frame Material',   signals: ['frame material', 'material class', 'vinyl', 'fibrex', 'fiberglass', 'wood', 'aluminum'], source: 'manufacturer spec sheet' },
    { field: 'Warranty',         signals: ['warranty', 'limited lifetime', 'year warrant'],  source: 'manufacturer warranty documentation' },
    { field: 'Energy Star',      signals: ['energy star', 'energystar'],                     source: 'energystar.gov certified products' },
  ],
};

// Mandatory URL fetches by manufacturer — Bot 1 should hit these directly.
// These are logged as warnings if Bot 1 did not reference them.
const MANDATORY_SOURCES = {
  windows: {
    'andersen':  ['andersenwindows.com', 'nfrcratings'],
    'marvin':    ['marvin.com', 'nfrc'],
    'pella':     ['pella.com', 'nfrc'],
    'milgard':   ['milgard.com', 'nfrc'],
    'simonton':  ['simonton.com', 'nfrc'],
    'jeld-wen':  ['jeld-wen.com', 'nfrc'],
    'reliabilt': ['nfrc', 'lowes.com'],
    'window world': ['windowworld.com'],
    'alpen':     ['alpenwindows.com', 'nfrc'],
    'provia':    ['proviaproducts.com'],
    'cgi':       ['cgiwindows.com', 'nfrc'],
    'sierra pacific': ['sierrapacificwindows.com', 'nfrc'],
    'loewen':     ['loewen.com', 'nafs', 'csa'],
    'inline':     ['inlinefiberglass.com', 'nafs'],
  },
};

// Universal safety check sources — checked for every product regardless of category
const SAFETY_CHECK_SOURCES = [
  { name: 'CPSC Recalls',           domain: 'recalls.cpsc.gov',          signal: 'recalls.cpsc.gov' },
  { name: 'EPA Safer Choice',       domain: 'epa.gov/saferchoice',        signal: 'epa.gov' },
  { name: 'California Prop 65',     domain: 'p65warnings.ca.gov',         signal: 'prop 65' },
  { name: 'ILFI Declare Database',  domain: 'declare.living-future.org',  signal: 'declare' },
  { name: 'Greenguard',             domain: 'ul.com/resources/greenguard', signal: 'greenguard' },
];

async function runDataCompletenessCheck(bot1Output, productName, category, outputDir) {
  console.log('[COMPLETENESS] Running data completeness check...');
  const lowerOutput = bot1Output.toLowerCase();
  const lowerProduct = productName.toLowerCase();
  const gaps = [];
  const warnings = [];

  // 1. Required field check
  const fields = REQUIRED_FIELDS[category] || REQUIRED_FIELDS.windows;
  for (const { field, signals, source } of fields) {
    const found = signals.some(s => lowerOutput.includes(s));
    if (!found) {
      gaps.push({ field, source, severity: 'GAP' });
      console.warn(`[COMPLETENESS] GAP: ${field} not found in Bot 1 output (expected from ${source})`);
    }
  }

  // 2. Mandatory source check
  const sources = MANDATORY_SOURCES[category] || MANDATORY_SOURCES.windows;
  for (const [mfr, domains] of Object.entries(sources)) {
    if (lowerProduct.includes(mfr)) {
      for (const domain of domains) {
        if (!lowerOutput.includes(domain)) {
          warnings.push(`Manufacturer source not referenced: ${domain} (expected for ${mfr} products)`);
          console.warn(`[COMPLETENESS] WARN: Expected source not referenced — ${domain}`);
        }
      }
    }
  }

  // 3. Universal safety source check
  for (const { name, signal } of SAFETY_CHECK_SOURCES) {
    if (!lowerOutput.includes(signal)) {
      warnings.push(`Safety source not checked: ${name}`);
    }
  }

  // Write gap report
  const gapReport = [
    `# DATA COMPLETENESS REPORT`,
    `Product: ${productName}`,
    `Category: ${category}`,
    `Timestamp: ${new Date().toISOString()}`,
    ``,
    gaps.length === 0 ? '## ALL REQUIRED FIELDS FOUND ✓' : `## DATA GAPS (${gaps.length})`,
    ...gaps.map(g => `- **${g.field}**: Not found in Bot 1 output. Expected source: ${g.source}`),
    ``,
    warnings.length === 0 ? '## ALL MANDATORY SOURCES REFERENCED ✓' : `## SOURCE WARNINGS (${warnings.length})`,
    ...warnings.map(w => `- ${w}`),
  ].join('\n');

  fs.writeFileSync(`${outputDir}/DATA_COMPLETENESS.txt`, gapReport);

  // Fire Telegram if gaps found
  if (gaps.length > 0 || warnings.length > 0) {
    const msg = [
      `⚠️ *DATA GAPS — ${productName}*`,
      gaps.length > 0 ? `*Missing fields (${gaps.length}):* ${gaps.map(g => g.field).join(', ')}` : '',
      warnings.length > 0 ? `*Source warnings (${warnings.length}):* Bot 1 may have missed mandatory URLs` : '',
      `_Midpoint scoring will apply for gaps. Review DATA_COMPLETENESS.txt before accepting score._`,
    ].filter(Boolean).join('\n');
    await sendTelegram(msg);
    console.warn(`[COMPLETENESS] ⚠️ ${gaps.length} gaps, ${warnings.length} warnings — Telegram sent`);
  } else {
    console.log('[COMPLETENESS] ✓ All required fields found, all mandatory sources referenced');
  }

  return { gaps, warnings };
}


// ─── KNOWLEDGE FILES ──────────────────────────────────────────────────────────
const KNOWLEDGE_BASE_DIR = '/Users/Residentialist/.openclaw/workspace/residentialist/knowledge/windows';

function loadKnowledgeFiles() {
  const files = {};
  try {
    const entries = fs.readdirSync(KNOWLEDGE_BASE_DIR);
    for (const entry of entries) {
      const fullPath = path.join(KNOWLEDGE_BASE_DIR, entry);
      if (!fs.statSync(fullPath).isFile()) continue;
      files[entry] = fs.readFileSync(fullPath, 'utf8');
    }
    console.log(`[ORCHESTRATOR] Loaded ${Object.keys(files).length} knowledge file(s): ${Object.keys(files).join(', ')}`);
  } catch (err) {
    console.error(`[ORCHESTRATOR] Warning: Could not load knowledge files: ${err.message}`);
  }
  return files;
}


// ─── MATERIAL CLASS EXTRACTOR ─────────────────────────────────────────────────
// Parses Bot 1 output to lock material classification before Bot 2 runs.
// Prevents Bot 2 from silently reclassifying a product's material.

function extractMaterialClass(bot1Output) {
  const lines = bot1Output.split('\n');

  // Look for explicit material class statements in Bot 1's PRODUCT OVERVIEW section
  const patterns = [
    /material\s+class\s*[:—]\s*(.+)/i,
    /frame\s+material\s*[:—]\s*(.+)/i,
    /material\s+type\s*[:—]\s*(.+)/i,
    /construction\s*[:—]\s*(.+frame.+|vinyl|wood|fiberglass|aluminum|composite)/i,
  ];

  for (const line of lines) {
    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) {
        const raw = match[1].trim().replace(/[*_]/g, '').split('(')[0].trim();
        if (raw.length > 2 && raw.length < 80) {
          return { found: true, rawText: raw, source: 'bot1_product_overview' };
        }
      }
    }
  }

  // Secondary: scan for material keywords near "window" mentions
  const materialKeywords = [
    { pattern: /vinyl\s+window|vinyl\s+frame|vinyl\s+construction/i, label: 'Vinyl' },
    { pattern: /aluminum.clad\s+wood|clad.wood|wood.clad/i, label: 'Aluminum-clad wood' },
    { pattern: /fiberglass\s+frame|pultruded\s+fiberglass|ultrex/i, label: 'Pultruded fiberglass' },
    { pattern: /all.wood|wood\s+frame|wood\s+window/i, label: 'Wood' },
    { pattern: /aluminum\s+frame|aluminum\s+window|non.clad\s+aluminum/i, label: 'Aluminum' },
    { pattern: /fibrex|composite\s+frame/i, label: 'Composite/Fibrex' },
  ];

  for (const line of lines) {
    for (const kw of materialKeywords) {
      if (kw.pattern.test(line)) {
        return { found: true, rawText: kw.label, source: 'bot1_keyword_scan' };
      }
    }
  }

  return { found: false, rawText: 'UNDETERMINED', source: 'not_found' };
}

// ─── BOT SYSTEM PROMPTS ───────────────────────────────────────────────────────

const BOT1_CONSENSUS_PROMPT = `You are The Residentialist Consensus Bot (Bot 1). Your job is to conduct exhaustive web research on a specific window product and produce a structured findings document for the Evaluator Bot.

YOU MUST SEARCH THE WEB EXTENSIVELY BEFORE WRITING ANYTHING. Do not rely on training data. Perform ALL searches and fetches below in sequence. Do not skip any.

PHASE 1 — MANDATORY DIRECT FETCHES (fetch ALL of these — do not skip any):
1. Fetch https://search.nfrc.org/search/Searchdefault.aspx — search for the product name to find U-factor, SHGC, VT, and Air Infiltration values. If not found, note exactly what was searched.
2. Fetch the MANUFACTURER-SPECIFIC NFRC ratings document directly (these exist for all major manufacturers — fetch the one that applies):
   - Andersen A-Series: https://www.andersenwindows.com/-/media/aw/files/technical-docs/performance/performance-windows-patiodoors-nfrcratings--a-series.pdf
   - Andersen 400 Series: https://www.andersenwindows.com/for-professionals/documents/performance
   - Andersen 100/200 Series: https://www.andersenwindows.com/for-professionals/documents/performance
   - Marvin: https://www.marvin.com/resources/technical-documents
   - Pella: https://www.pella.com/resources/energy-performance/
   - Milgard: https://www.milgard.com/window-resources/technical-data
   - Simonton: https://www.simonton.com/resources/performance-data/
   - Jeld-Wen: https://www.jeld-wen.com/resources/certifications/
   - Alpen: https://alpenwindows.com/resources/
   - ProVia: https://www.proviaproducts.com/resources/
   - CGI: https://www.cgiwindows.com/resources/
   - Sierra Pacific: https://www.sierrapacificwindows.com/technical-resources/
   - Reliabilt/Window World: search NFRC database directly
3. Fetch https://www.windowpurchase.com — search for the product name. Jay Johnson's reviews are the highest-authority independent window evaluations. Extract full review if found.
4. Fetch https://www.thewindowdog.com — search for the product name. Extract any review content found.
5. Fetch the manufacturer's official product page for this specific product and configuration. Extract all published specs.
6. Fetch https://www.energystar.gov/productfinder/product/certified-windows — search for the product to confirm Energy Star certification tier and climate zones.
7. Fetch https://recalls.cpsc.gov — search for the product name and manufacturer. Document any active recalls.
8. Fetch https://www.aama.net — verify AAMA certification status and performance class for this product.
9. Fetch https://declare.living-future.org — search for the product or manufacturer for any Declare label certifications.
10. If Greenguard certification is claimed: fetch https://spot.ul.com to verify.

PHASE 2 — REQUIRED SEARCHES (perform each one):
6. Search: "[Product Name] [configuration] NFRC U-factor SHGC air infiltration" — find any published performance data
7. Search: "[Product Name] AAMA certification structural performance grade"
8. Search: "[Product Name] IGU spacer system warm-edge dual-seal"
9. Search: "[Product Name] weatherstripping type installation method"
10. Search: "[Product Name] warranty terms transferable labor coverage"
11. Search: "[Product Name] problems failures complaints class action lawsuit"
12. Search: "[Product Name] Greenguard VOC emissions indoor air quality certification"
13. Search: "[Manufacturer] service network parts availability nationwide"
14. Search: "[Product Name] review greenbuildingadvisor OR finehomebuilding OR buildingscience"
15. Search: "[Product Name] vs [nearest competitor] comparison"
16. Search: "[Product Name] [Manufacturer] recall safety hazard CPSC" — check for any product safety actions
17. Search: "[Manufacturer] Prop 65 California warning" — check for any chemical disclosure warnings
18. Search: "[Product Name] VOC emissions indoor air quality certification Greenguard" — confirm or rule out air quality certifications

PHASE 2B — INTERNATIONAL STANDARDS SEARCH (perform if manufacturer is non-US or sells internationally):
19i. Search: "[Manufacturer] NAFS CSA A440 performance grade structural test" — Canadian fenestration standard (harmonized with AAMA)
20i. Search: "[Manufacturer] EN 14351-1 CE marking window performance" — European fenestration standard
21i. Search: "[Manufacturer] Passive House Institute PHI certified window" — search PHI component database
22i. Search: "[Manufacturer] performance data air water structural test results" — find manufacturer-published test data pages
23i. Search: site:database.passivehouse.com "[Manufacturer]" — check PHI certified components database directly

INTERNATIONAL STANDARDS RECOGNITION — CRITICAL:
First-world nation standards are ALL meaningful. You must search for and recognize:
- US: AAMA, NFRC, ENERGY STAR, Florida Building Code, IRC
- Canada: NAFS/CSA A440 (this IS the same harmonized standard as AAMA — a CW-PG70 under NAFS equals a CW-PG70 under AAMA), NRCan, ENERGY STAR Canada
- Europe: CE marking per EN 14351-1, EN 673 (thermal), EN 12567, Passive House Institute (PHI) Darmstadt certification, RAL quality marks
- UK: BS 6375, PAS 24, BFRC (British Fenestration Rating Council), BBA, BSI Kitemark
- Australia/NZ: WERS (Window Energy Rating Scheme), AS 2047

DO NOT assume a manufacturer lacks certifications just because you cannot find AAMA or NFRC data. Canadian manufacturers test to NAFS/CSA A440 — the exact same structural and air/water tests. European manufacturers test to EN standards. Report what you find under the standard it was tested to. DO NOT attempt to convert between standards (e.g., European U-values use different test conditions than NFRC U-values). Report each value with its standard clearly noted.

PHASE 3 — FIELD SOURCE RESEARCH (Reddit trade professionals):
19. Search: site:reddit.com "[Product Name]" window install review — find installer/contractor opinions
20. Search: site:reddit.com "[Manufacturer]" windows quality problems — find field complaints and praise
21. Search: site:reddit.com "[Product Name]" OR "[Manufacturer]" r/homeimprovement OR r/construction OR r/homebuilding — broader trade discussion

PHASE 3B — SPECIALTY FORUM RESEARCH (high-performance building community):
25. Search: site:greenbuildingadvisor.com "[Manufacturer]" OR "[Product Name]" — GBA is a paywall community of architects, energy consultants, and serious builders. Treat GBA contributors as closer to Expert Authorities (Category 2) than field sources.
26. Search: site:reddit.com/r/PassiveHouse "[Manufacturer]" OR "[Product Name]" — passive house community (energy nerds, not tradespeople)
27. Search: site:reddit.com/r/buildingscience "[Manufacturer]" OR "[Product Name]" — building science enthusiasts
28. Search: site:finehomebuilding.com "[Manufacturer]" "[Product Name]" forum — professional builder forum
29. Search: "[Manufacturer]" "[Product Name]" site:greenbuildingforum.co.uk OR site:greenbuildingtalk.com — UK/European green building forums (especially useful for European manufacturers)

GBA and r/PassiveHouse sources should be categorized separately from general Reddit in your output. These communities self-select for people who accept that high-performance windows cost more — they have minimal price-bias noise and discuss actual U-values, SHGC, air tightness, and installation methodology.
22. For each Reddit user found expressing a substantive product opinion, assess their qualification:
    - Check their karma (visible on profile), account age, and subreddit activity
    - Look for technical vocabulary (specific components, installation practices, failure modes)
    - Check if they discuss multiple brands (not single-brand advocate)
    - Disqualify if they show commercial affiliation, referral links, or astroturfing patterns
    - Pre-qualified users from verified_field_sources.json in the knowledge base do NOT need re-qualification
23. Record each qualified field source opinion with: username, estimated credibility (1-10), their product verdict, and key reasoning
24. If 3+ qualified field sources are found for this product, note the trimmed mean sentiment and whether it agrees or diverges from publication/certification signals

7. FIELD SOURCE OPINIONS — qualified Reddit/forum professionals found, their product verdicts, credibility assessment, and whether field consensus agrees with or diverges from publication/certification signals. If no qualified field sources found, note "No qualified field sources identified for this product."
8. INTERNATIONAL CERTIFICATIONS — list ALL certifications found from any first-world nation, with the standard clearly identified (e.g., "NAFS CW-PG70" not just "PG70", "EN 14351-1 CE marked" not just "CE marked"). Note the country/standard for each. Do NOT convert between standards.
9. SPECIALTY FORUM FINDINGS — separate section for GBA, r/PassiveHouse, r/buildingscience opinions. These are higher-authority than general Reddit and should be clearly distinguished.

CRITICAL DATA TARGETS — you must find or explicitly note as NOT FOUND:
- U-factor (whole window, dual pane standard config)
- SHGC (whole window, dual pane standard config)
- Visible Transmittance (VT)
- Air Infiltration (cfm/ft²)
- AAMA Performance Class and Grade
- Frame material composition (exact)
- Spacer system type (warm-edge vs aluminum)
- Seal system (dual vs single)
- Glazing bead construction (interior vs exterior accessible)
- Weatherstripping type and attachment method
- Warranty: glass / components / finish (years, transferable Y/N, labor Y/N)
- Jay Johnson score and key findings (WindowPurchase.com)
- Any active litigation or documented failure patterns

Your output must be a structured markdown document with these sections:
1. PRODUCT OVERVIEW — manufacturer, material class, configuration type, country of origin
2. CONFIRMED FINDINGS — every spec with source URL cited inline
3. UNKNOWN / NOT DISCLOSED — every data target above that could not be confirmed, with note on what was searched
4. RED FINDINGS — documented failure patterns, litigation, safety concerns (cite source and date)
5. YELLOW FINDINGS — ambiguities, single-source claims, unverified specs
6. CONFIDENCE ASSESSMENT — High / Moderate / Low, with rationale

Source citation format: (Source Name, Date, full URL)
Never score. Never grade. Leave all scoring to Bot 2.`;

const BOT2_EVALUATOR_PROMPT = `You are The Residentialist Evaluator Bot (Bot 2). Your job is to score a product against the Residentialist rubric using the structured findings from Bot 1. Show all math explicitly. Never score a component you cannot source.

SCORING STRUCTURE:
- Axis 1: Quality (35% of Overall) — 1A Materials Quality (35%), 1B Manufacturing Quality (35%), 1C Professional Consensus (30%)
- Axis 2: Durability (35% of Overall) — 2A Frame Longevity (37.5%), 2B Materials Durability (37.5%), 2C Repairability & Support (25%)
- Axis 3: Performance (30% of Overall) — 3A Thermal (35%), 3B Structural (25%), 3C Air & Water (40%)
- Overall = (Axis 1 × 0.35) + (Axis 2 × 0.35) + (Axis 3 × 0.30)
- AXIS WEIGHTS (LOCKED March 11 2026 — Ray Shapley): Quality 35%, Durability 35%, Performance 30%
- DO NOT use equal thirds. Use these exact weights.

GRADE SCALE: A+ (9.5-10) | A (9.0-9.4) | A- (8.5-8.9) | B+ (8.0-8.4) | B (7.5-7.9) | B- (7.0-7.4) | C+ (6.5-6.9) | C (6.0-6.4)

MATERIAL HIERARCHY — 2B BASE SCORES (base scores, not ceilings — adjustments operate above AND below the base):
- Pultruded fiberglass (Ultrex/equivalent): base 9, ceiling 10. Each adjustment above base requires independent citation. No artificial cap. This is the best material class currently available — a fully documented product can reach 10.
- Aluminum-clad wood (extruded aluminum): base 8, ceiling 9. Adjustments require independent citation.
- Aluminum-clad wood (roll-form aluminum): base 7, ceiling 8. Adjustments require independent citation.
- Vinyl-clad wood: base 7, ceiling 8. Adjustments require independent citation.
- Composite/proprietary (Fibrex/equivalent): base 6, ceiling 7. Max documented adjustment: +1 for published composition/longevity data.
- Vinyl: base 5, ceiling 6. Adjustments require independent citation.
- VINYL CLASSIFICATION RULE: "Premium vinyl," "multi-chamber vinyl," "reinforced vinyl," and all other vinyl subtypes are DESIGN ATTRIBUTES only — not material class upgrades. All vinyl products regardless of chamber count, wall thickness, corner construction, or any other design feature score from base 5. Never reclassify a vinyl product to a higher base score. Multi-chamber construction may support a positive adjustment above base 5, but only if independently cited — it does not change the base starting point.
- Aluminum (non-clad): base 5, ceiling 6. Adjustments require independent citation.
- UNIVERSAL RULE: Every adjustment above base requires independent citation. Manufacturer claim alone is insufficient. When a superior material class emerges, the table recalibrates upward — existing ceilings do not decrease.
- Tier overlap is intentional: a well-documented lower-tier product can reach the same net 2B as a baseline higher-tier product.

CRITICAL RULES:
1. Every score must cite a source. Unknown = 5 with flag.
2. No double-counting — each concern scores in ONE axis only.
3. Professional Consensus (1C) hard ceiling: 7.5.
4. Show all arithmetic for every weighted calculation.
5. Score the standard production configuration, not premium upgrade options.
6. Composite/Fibrex net 2B ceiling = 7. Show base + adjustments explicitly.
7. ASSUMED vs UNDISCLOSED — CERTIFICATION FLOOR RULE (Universal Principle, applies to all categories):
   a. If a product holds a recognized certification (Energy Star, AAMA Gold Label, NFRC, WaterSense, AHRI, KCMA or equivalent) and the manufacturer has not published a specific tested value for a metric covered by that certification:
      - Score from the CERTIFICATION FLOOR — the minimum threshold required to hold that certification
      - Do NOT score at 5.0 midpoint default
      - Do NOT penalize beyond the certification floor
      - Flag as YELLOW: "Manufacturer holds [certification] but does not publish specific [metric] value. Scored from certification floor."
   b. Certification floors for windows:
      - Energy Star U-Factor (Northern zone): 0.30 — score deterministically from 0.30
      - Energy Star SHGC: score from zone-appropriate floor
      - Energy Star Air Infiltration: 0.30 cfm/ft² — score from 0.30, not 5.0
      - AAMA Gold Label: product passed air leakage, water, structural, thermal, forced entry — treat certifications as CONFIRMED, not "claimed"
      - If a bounded threshold is published (e.g. "<0.20"), score from that boundary — this IS meaningful disclosure
   c. If a product holds NO relevant certification for a metric AND no value is published: score at 5.0 midpoint and label "undisclosed — no certification floor available."
   d. Never apply a positive adjustment for an undisclosed spec. Never state an undisclosed spec as confirmed fact.
   e. CRITICAL: A certification held by a major manufacturer listed on the Energy Star partner registry or AAMA directory is CONFIRMED, not "claimed." Do not downgrade confirmed certifications to "claimed" without specific evidence of revocation.
8. CORRECTION MEMOS: The knowledge base may contain product-specific correction memos. These override the general material hierarchy. Read all knowledge files before scoring. If a correction memo exists for the product being evaluated, apply it exactly.
9. PARTS AVAILABILITY: Historical parts availability data (e.g. "80 years of historical products") documents past behavior only. Do not convert backward-looking data into forward guarantees.
10. FIELD COMPLAINTS AND MANUFACTURING DEFECTS: Never score field complaints, installation failures, or manufacturing defects in the Materials Durability (2B) subscore. These belong in 1B Manufacturing Quality only. Material Durability scores the material CLASS properties, not field execution.
11. RED vs YELLOW FINDINGS — apply this checklist to every negative finding:
    RED FINDING (ALL FOUR must be true — if any one fails, it is YELLOW):
    - Minimum 2 INDEPENDENT sources (different outlets, not the same story republished)
    - Documented pattern across multiple unrelated incidents, not a single event
    - Sourced to this specific product line, not the brand generally
    - Independently verifiable — court records, CPSC database, independent lab test, named investigative journalism
    RED FINDING also applies to: any manufacturer acknowledgment of inability to fix a documented failure pattern.
    EXPLICIT RED DISQUALIFIERS — these can NEVER be RED findings regardless of severity:
    - A single customer review, forum post, or comment — even if detailed or alarming
    - A denied, dismissed, or decertified class action — a denied class action is evidence in the manufacturer's FAVOR, not against them
    - A single installation anecdote (e.g. "29 of 39 units failed") — this is one customer's experience, not a systemic pattern
    - Yelp, Google, or BBB star ratings alone — these are sentiment data, not failure documentation
    - Any claim where the only source is the claimant themselves
    YELLOW FINDING (any one of these):
    - Single source only
    - Installation-dependent (may be installer error, not product defect)
    - Attributed to brand generally, not confirmed for this specific product line
    - Manufacturer acknowledged but not litigated or independently verified
    - Older than 10 years with no recent corroboration
    - Consumer complaint pattern without independent verification

12. MATERIAL CLASSIFICATION LOCK — THIS IS A HARD RULE:
    - The material class established by Bot 1 research is provided to you as LOCKED_MATERIAL_CLASS.
    - You MUST score from this material class. You MAY NOT silently reclassify it.
    - If you believe the locked classification is wrong, you MUST:
      a. STOP scoring
      b. Output exactly: "MATERIAL_RECLASSIFICATION_FLAG: I believe the material class should be [X] because [cite specific source URL and quote from Bot 1 research]. The locked class is [Y]. I cannot proceed without resolution."
      c. Do NOT produce a score. Do NOT continue the evaluation.
    - If you proceed with a different material class than LOCKED_MATERIAL_CLASS without flagging, the entire evaluation is invalid.
    - A material reclassification flag will be caught by the Challenge Bot and escalated. This is the correct behavior.

12. MATERIAL CLASSIFICATION LOCK — THIS IS A HARD RULE:
    - The material class established by Bot 1 research is provided to you as LOCKED_MATERIAL_CLASS.
    - You MUST score from this material class. You MAY NOT silently reclassify it.
    - If you believe the locked classification is wrong, you MUST:
      a. STOP scoring
      b. Output exactly: "MATERIAL_RECLASSIFICATION_FLAG: I believe the material class should be [X] because [cite specific source URL and quote from Bot 1 research]. The locked class is [Y]. I cannot proceed without resolution."
      c. Do NOT produce a score. Do NOT continue the evaluation.
    - If you proceed with a different material class than LOCKED_MATERIAL_CLASS without flagging, the entire evaluation is invalid.
    - A material reclassification flag will be caught by the Challenge Bot and escalated. This is the correct behavior.

13. PRICE-BIAS FILTER FOR FIELD SOURCES — CRITICAL:
    When processing Reddit or forum opinions from qualified field sources, check for PRICE-ANCHORED NEGATIVITY:
    Price-bias indicators: "overpriced", "not worth the money", "paying for the name", "too expensive for what you get", "can get the same from X for half", "rich people windows", "markup is insane", "not worth it", "highway robbery", "better value in", "paying a premium for nothing"
    Genuine quality/durability/performance complaints: "leaks", "failed", "warranty claim", "rotted", "fogged units", "seal failure", "hard to operate", "drafty", "broke", "cracked", "callback", "replacement needed", "water damage", "mold"
    
    RULE: When negative field source sentiment co-occurs with price-bias language AND lacks specific quality/durability/performance complaints:
    a. Flag the opinion as "PRICE-BIAS DETECTED" in field source processing
    b. Reduce its weight by 50% on Quality, Durability, and Performance axes
    c. Note it as a value judgment, not a product quality judgment
    d. Do NOT discard it entirely — price-biased opinions may still contain legitimate secondary observations
    e. If the same source mixes price complaints with genuine failure reports (e.g., "overpriced AND the seals failed after 3 years"), weight the failure report at full value and flag only the price portion
    
    This filter exists because blue-collar tradespeople sometimes rate expensive products as "junk" when they mean "overpriced relative to alternatives" — a value judgment the Residentialist does not currently score.

14. INTERNATIONAL STANDARDS INTERPRETATION — CRITICAL:
    Bot 1 may report certifications from multiple national standards. Handle them as follows:
    
    a. NAFS/CSA A440 (Canadian) = EQUIVALENT to AAMA for structural and air/water performance.
       - CW-PG70 under NAFS = CW-PG70 under AAMA. Score identically.
       - Air infiltration levels: A1 (worst), A2 (moderate), A3 (best). A3 = highest possible rating = score 9-10 on air infiltration.
       - Water penetration values in Pascals: >700 Pa = excellent, 400-700 Pa = good, <400 Pa = moderate
       - Design Pressure (DP) ratings are directly comparable between NAFS and AAMA
    
    b. EN 14351-1 (European) = NOT directly comparable to NAFS/AAMA.
       - European U-values (Uw) are tested at 0°C exterior, NFRC at -18°C. European values will APPEAR better. DO NOT directly compare.
       - Instead: score European products within the European scale. Uw < 0.8 W/(m²K) = excellent, 0.8-1.2 = good, 1.2-1.6 = moderate, >1.6 = poor
       - Air permeability classes: Class 4 (best), Class 3, Class 2, Class 1 (worst)
       - Water tightness classes: higher number = better (e.g., E1200 > E600)
    
    c. PHI Certification (Passive House Institute):
       - phA+ (Uw ≤ 0.40) = premium tier, score 9.5-10 on thermal
       - phA (Uw ≤ 0.60) = excellent tier, score 9-9.5 on thermal  
       - phB (Uw ≤ 0.80) = good tier, score 8-9 on thermal
       - phC (Uw ≤ 1.00) = adequate tier, score 7-8 on thermal
       - A PHI-certified product has undergone rigorous independent testing. This is Tier 1 certification data.
    
    d. Florida Building Code registrations (FL#####) confirm products have passed hurricane/impact testing — score these as structural performance confirmation equivalent to AAMA/NAFS high wind zone compliance.
    
    e. NEVER penalize a product for "no AAMA certification" if it holds equivalent NAFS/CSA certification. They are literally the same standard with the same test procedures.
    
    JUDGMENT SCORE FLOORS based on evidence classification:
    - Only NOTE-level evidence (single source): Judgment floor is 4.0 — cannot score below 4.0
    - YELLOW evidence (pattern, multiple sources, unverified): Judgment range 3.0–6.0
    - RED evidence (verified, multi-source, independent): Judgment range 1.0–5.0
    Before every Judgment score write: "EVIDENCE LEVEL: [NOTE/YELLOW/RED] — [reason in one sentence]"
    Label every negative finding as RED or YELLOW in your output. Never leave a finding unclassified.

OUTPUT FORMAT — MANDATORY JSON:
You MUST output ONLY a valid JSON object. No markdown, no explanation outside the JSON. Use this exact schema:

{"product": "string", "config": "string", "locked_material_class": "string", "scores": {"quality": {"component_quality": {"score": 0.0, "reasoning": "string"}, "manufacturing_quality": {"score": 0.0, "reasoning": "string"}, "professional_consensus": {"score": 0.0, "reasoning": "string"}, "axis_score": 0.0}, "durability": {"frame_longevity": {"score": 0.0, "reasoning": "string"}, "materials_durability": {"score": 0.0, "base": 0, "adjustments": "string", "ceiling_applied": false, "reasoning": "string"}, "repairability": {"score": 0.0, "reasoning": "string"}, "axis_score": 0.0}, "performance": {"thermal": {"score": 0.0, "reasoning": "string"}, "structural": {"score": 0.0, "reasoning": "string"}, "air_water": {"score": 0.0, "reasoning": "string"}, "axis_score": 0.0}}, "overall_score": 0.0, "grade": "string", "outlook": "Strong|Stable|Conditional", "findings": {"red": [{"finding": "string", "source": "string"}], "yellow": [{"finding": "string", "source": "string"}]}, "expected_lifespan": {"adverse": "string", "median": "string", "best": "string"}, "reasoning_summary": "string"}`;

const BOT3_MATERIAL_SAFETY_PROMPT = `You are The Residentialist Material Safety Bot (Bot 3). You evaluate health and toxicity risk from the product's materials during and after installation. You score on a 0-10 scale. Your score is published separately — it is never averaged into Quality, Durability, or Performance.

SCORE ANCHORS:
- 9.5-10: Fully certified (ILFI Declare + Greenguard Gold or equivalent), no credible flags, all ingredients disclosed
- 8.5-9.4: Partial certification (Greenguard Gold but no Declare), no confirmed concerns
- 7.0-8.4: Uncertified but clean materials (all-metal, inorganic, no volatile adhesives or foam)
- 5.0-6.9: Uncertified with moderate concern (vinyl/PVC, foam core, adhesive-dependent assembly, unconfirmed coatings)
- Below 5.0: Confirmed harmful substance, documented exposure pathway, or known toxicity finding

SOURCE HIERARCHY:
- Tier 1: ILFI Declare database, PHI materials list, peer-reviewed consumer-exposure health studies
- Tier 2: Greenguard Gold, UL SPOT, NSF, REACH documentation
- Tier 3 (no score weight): Manufacturer claims, Prop 65 (noise), VinylPlus

OUTPUT: Score (X.X/10), grade, score rationale, any flags with source citations, and a one-sentence buyer note.

OUTPUT FORMAT — MANDATORY JSON:
You MUST output ONLY a valid JSON object. No markdown. Use this exact schema:

{"product": "string", "material_safety_score": 0.0, "grade": "string", "tier": "string", "flags": [{"flag": "string", "source": "string", "severity": "HIGH|MEDIUM|LOW"}], "certifications_found": ["string"], "buyer_note": "string", "reasoning": "string"}`;

// ─── BOT RUNNER ───────────────────────────────────────────────────────────────

const WEB_SEARCH_TOOL = { type: "web_search_20250305", name: "web_search" };

async function runBot(botName, systemPrompt, userMessage, model, useWebSearch) {
  console.log(`\n[ORCHESTRATOR] Running ${botName}...`);

  if (!useWebSearch) {
    const response = await client.messages.create({
      model: model || 'claude-sonnet-4-20250514',
      max_tokens: 16000,
      system: [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: userMessage }]
    });
    const output = response.content.filter(b => b.type === "text").map(b => b.text).join("\n");
    console.log(`[ORCHESTRATOR] ${botName} complete. (~${output.length} chars)`);
    return output;
  }

  // Single call — server handles web search tool execution internally
  // If pause_turn, continue with text-only history (strip tool blocks)
  let messages = [{ role: 'user', content: userMessage }];
  let allText = [];
  let iterations = 0;
  const maxIterations = 20;

  while (iterations < maxIterations) {
    iterations++;
    console.log(`[ORCHESTRATOR] ${botName} — iteration ${iterations}...`);

    const stream = client.messages.stream({
      model: model || 'claude-sonnet-4-20250514',
      max_tokens: 16000,
      system: [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }],
      messages: messages,
      tools: [WEB_SEARCH_TOOL]
    });

    const response = await stream.finalMessage();
    const stopReason = response.stop_reason;
    const textBlocks = response.content.filter(b => b.type === "text");
    if (textBlocks.length > 0) allText = allText.concat(textBlocks.map(b => b.text));

    console.log(`[ORCHESTRATOR] ${botName} — stop: ${stopReason}, text: ${allText.join('').length} chars`);

    if (stopReason === 'end_turn') break;

    if (stopReason === 'pause_turn') {
      // Server-side tool execution paused — append assistant response AS-IS
      // The assistant turn contains server_tool_use + web_search_tool_result blocks
      // that must stay paired in conversation history. Just append and continue.
      messages.push({ role: 'assistant', content: response.content });
      continue;
    }

    if (stopReason === 'tool_use' || stopReason === 'max_tokens') {
      // Client-side tool use or token limit — existing behavior is fine
      const safeContent = textBlocks.length > 0
        ? textBlocks
        : [{ type: 'text', text: '...' }];
      messages.push({ role: 'assistant', content: safeContent });
      messages.push({ role: 'user', content: [{ type: 'text', text: 'Continue.' }] });
      continue;
    }

    break;
  }

  const output = allText.join("\n");
  console.log(`[ORCHESTRATOR] ${botName} complete after ${iterations} iterations. (~${output.length} chars)`);
  return output;
}


// ─── CHALLENGE BOT (Bot 4) ────────────────────────────────────────────────────

const { runChallengeBot } = require('./challenge_bot_v2');
const { handleEscalation } = require('./council');
const { runReconciliationBot } = require('./reconciliation_bot');

// ─── MAIN PIPELINE ────────────────────────────────────────────────────────────

async function runPipeline(productName, config, researchFiles) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const productSlug = productName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  const outputDir = `/Users/Residentialist/.openclaw/workspace/residentialist/outputs/${productSlug}_${timestamp}`;

  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`\n[ORCHESTRATOR] ========================================`);
  console.log(`[ORCHESTRATOR] PIPELINE START: ${productName} (${config})`);
  console.log(`[ORCHESTRATOR] Output dir: ${outputDir}`);
  console.log(`[ORCHESTRATOR] ========================================`);

  // Load research files
  let researchContent = '';
  for (const file of researchFiles) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      researchContent += `\n\n--- SOURCE FILE: ${path.basename(file)} ---\n${content}`;
      console.log(`[ORCHESTRATOR] Loaded: ${file}`);
    } catch (err) {
      console.error(`[ORCHESTRATOR] WARNING: Could not load ${file}: ${err.message}`);
    }
  }

  if (!researchContent.trim()) {
    console.error('[ORCHESTRATOR] No local research files — Bot 1 will search the web.');

  }

  // Load knowledge files
  const knowledge = loadKnowledgeFiles();
  const knowledgeContent = Object.entries(knowledge)
    .map(([name, content]) => `--- KNOWLEDGE FILE: ${name} ---\n${content}`)
    .join('\n\n');

  // ── BOT 1: Consensus ──────────────────────────────────────────────────────
  const bot1Input = `PRODUCT: ${productName}
CONFIGURATION: ${config}

You are researching the ${productName} in ${config} configuration. Execute all required searches and fetches now. Do not stop after one sentence. Complete all 15 searches and 5 URL fetches, then write the full structured findings document.`;
  const bot1Output = await runBot('Bot 1 (Consensus)', BOT1_CONSENSUS_PROMPT, bot1Input, 'claude-sonnet-4-20250514', true);
  fs.writeFileSync(`${outputDir}/${productSlug}_bot1_consensus.md`, bot1Output);
  validateBotOutput(bot1Output, 'Bot 1 (Consensus)', productName, outputDir);
  await runDataCompletenessCheck(bot1Output, productName, 'windows', outputDir);

  // ── MATERIAL CLASS LOCK ───────────────────────────────────────────────────
  const materialLock = extractMaterialClass(bot1Output);
  const materialLockLine = materialLock.found
    ? `LOCKED_MATERIAL_CLASS: ${materialLock.rawText} (extracted from Bot 1 ${materialLock.source} — DO NOT RECLASSIFY without flagging per Rule 12)`
    : `LOCKED_MATERIAL_CLASS: UNDETERMINED — Bot 1 did not establish a clear material class. You MUST identify it from Bot 1 research and state it explicitly before scoring. If material class is ambiguous, flag it before scoring.`;

  fs.writeFileSync(`${outputDir}/MATERIAL_CLASS_LOCK.json`, JSON.stringify({
    product: productName,
    config,
    materialClass: materialLock.rawText,
    found: materialLock.found,
    source: materialLock.source,
    timestamp: new Date().toISOString()
  }, null, 2));
  console.log(`[ORCHESTRATOR] Material class lock: ${materialLock.rawText} (source: ${materialLock.source})`);

  // ── BOT 2: Evaluator ──────────────────────────────────────────────────────
  // Pre-compute ceiling and inject as hard constraint — not a rule to interpret
  const materialCeiling = getMaterialCeiling(materialLock.rawText);
  const ceilingConstraint = `HARD CONSTRAINT — 2B MATERIALS DURABILITY CEILING (PRE-COMPUTED):
Material Class: ${materialCeiling.label}
Base Score: ${materialCeiling.base}
Maximum Allowable 2B Net Score: ${materialCeiling.ceiling}
This ceiling is absolute. Your net 2B score MUST NOT exceed ${materialCeiling.ceiling}.
No combination of adjustments, certifications, proprietary claims, or documented performance data
can justify exceeding this ceiling. If your calculation produces a value above ${materialCeiling.ceiling},
round it down to ${materialCeiling.ceiling} and note that the ceiling was applied.
This is not a rubric rule — it is a pre-computed constraint injected by the pipeline.`;

  const bot2Input = `PRODUCT: ${productName}\nCONFIGURATION: ${config}\n${materialLockLine}\n\n${ceilingConstraint}\n\nKNOWLEDGE BASE:\n${knowledgeContent}\n\nBOT 1 CONSENSUS FINDINGS:\n${bot1Output}\n\nORIGINAL RESEARCH (for source verification):\n${researchContent}\n\nScore this product now. Show all math.`;
  const bot2Output = await runBot('Bot 2 (Evaluator)', BOT2_EVALUATOR_PROMPT, bot2Input, 'claude-sonnet-4-20250514');
  const bot2Parsed = validateBotOutput(bot2Output, 'Bot 2 (Evaluator)', productName, outputDir);
  // Write the JSON
  fs.writeFileSync(`${outputDir}/${productSlug}_bot2_evaluator.json`, JSON.stringify(bot2Parsed, null, 2));
  // Also write human-readable version for debugging
  fs.writeFileSync(`${outputDir}/${productSlug}_bot2_evaluator_raw.md`, bot2Output);

  // ── BOT 3: Material Safety ────────────────────────────────────────────────
  const bot3Input = `PRODUCT: ${productName}\nCONFIGURATION: ${config}\n\nBOT 1 FINDINGS (for material identification):\n${bot1Output}\n\nORIGINAL RESEARCH:\n${researchContent}\n\nEvaluate material safety now.`;
  const bot3Output = await runBot('Bot 3 (Material Safety)', BOT3_MATERIAL_SAFETY_PROMPT, bot3Input, 'claude-haiku-4-5-20251001');
  const bot3Parsed = validateBotOutput(bot3Output, 'Bot 3 (Material Safety)', productName, outputDir);
  fs.writeFileSync(`${outputDir}/${productSlug}_bot3_material_safety.json`, JSON.stringify(bot3Parsed, null, 2));
  fs.writeFileSync(`${outputDir}/${productSlug}_bot3_material_safety_raw.md`, bot3Output);

    // ── BOT 5: Reconciliation ──────────────────────────────────────────────────────────────────
  console.log('\n[ORCHESTRATOR] Running Bot 5 (Reconciliation)...');
  const reconciliationResult = await runReconciliationBot(bot1Output, bot2Output, productName, outputDir);
  fs.writeFileSync(`${outputDir}/RECONCILIATION_STATUS.txt`,
    `STATUS: ${reconciliationResult.status}\nCONFIDENCE: ${reconciliationResult.confidenceTag}\nPRODUCT: ${productName}\nTIMESTAMP: ${new Date().toISOString()}`
  );

  if (reconciliationResult.status === 'UNRESOLVED') {
    console.log('[ORCHESTRATOR] Reconciliation unresolved — routing unresolved items to Council...');
    const reconEscalation = await handleEscalation(
      `RECONCILIATION UNRESOLVED:\n${reconciliationResult.unresolvedItems}`,
      bot1Output,
      bot2Output,
      bot3Output,
      productName,
      outputDir
    );
    if (reconEscalation.pipeline === 'HALTS') {
      console.log('[ORCHESTRATOR] HALTED - Reconciliation escalation sent to Ray.');
      fs.writeFileSync(`${outputDir}/PIPELINE_STATUS.txt`,
        `STATUS: HALTED - RECONCILIATION ESCALATED\nPRODUCT: ${productName}\nCONFIG: ${config}\nTIMESTAMP: ${timestamp}\nSee: RECONCILIATION_STATUS.txt and council_session.md`
      );
      return { status: 'ESCALATED', outputDir, bot1Output, bot2Output, bot3Output };
    }
  }

  if (reconciliationResult.revisions && reconciliationResult.revisions.length > 0) {
    console.log(`[ORCHESTRATOR] Bot 5 revisions: ${reconciliationResult.revisions.join(', ')}`);
  }

  // ── BOT 4: Challenge Bot ──────────────────────────────────────────────────
  console.log('\n[ORCHESTRATOR] Running Bot 4 (Challenge Bot)...');
  const challengeResult = await runChallengeBot(bot1Output, bot2Output, bot3Output, productName);
  fs.writeFileSync(`${outputDir}/${productSlug}_bot4_challenge.md`, challengeResult);

  // ── DETERMINISTIC VALIDATOR ────────────────────────────────────────────────
  // Runs BEFORE flag gate. Pure rules engine — no reasoning, no API calls.
  // Hard violations throw and halt pipeline immediately.
  try {
    const valResult = deterministicValidate(outputDir, productName);
    if (!valResult.valid) {
      const msg = 'DETERMINISTIC VALIDATOR FAILED:\n' + valResult.violations.join('\n');
      console.log('[ORCHESTRATOR] BLOCKED:', msg);
      fs.writeFileSync(outputDir + '/VALIDATION_FAILED.txt', msg);
      await sendTelegram('BLOCKED: ' + productName + '\n' + valResult.violations[0]);
      throw new Error('Deterministic validation failed — pipeline halted: ' + valResult.violations[0]);
    }
    valResult.warnings.forEach(w => console.log('[ORCHESTRATOR] VALIDATOR WARNING:', w));
    if (valResult.warnings.length) {
      await sendTelegram('WARNING: ' + productName + '\n' + valResult.warnings.join('\n'));
    }
    console.log('[ORCHESTRATOR] Deterministic validator: PASS');
  } catch(ve) {
    if (ve.message.includes('Deterministic validation failed')) throw ve;
    console.log('[ORCHESTRATOR] Validator non-fatal error:', ve.message);
  }

    // ── FLAG GATE ───────────────────────────────────────────────────────────────────────────
  // Detect FLAG: scan all lines for VERDICT, then check for any FLAG indicators
  const crLines = challengeResult.split('\n');
  const verdictLine = crLines.find(l => l.toUpperCase().includes('VERDICT'));
  const hasMaterialReclassFlag = bot2Output.includes('MATERIAL_RECLASSIFICATION_FLAG');
  const hasCheckFlag = challengeResult.includes('FLAG') && (
    challengeResult.includes('CHECK 1') ||
    challengeResult.includes('CHECK 2') ||
    challengeResult.includes('CHECK 3')
  );
  const isFlagged = hasMaterialReclassFlag || (verdictLine
    ? verdictLine.toUpperCase().includes('FLAG')
    : hasCheckFlag);

  if (hasMaterialReclassFlag) {
    console.log('[ORCHESTRATOR] MATERIAL RECLASSIFICATION FLAG detected in Bot 2 output — routing to Council.');
    await sendTelegram(`⚠️ *MATERIAL FLAG — ${productName}*\nBot 2 believes Bot 1 material class is wrong. Council review required.`);
  }

  if (isFlagged) {
    console.log('\n[ORCHESTRATOR] WARNING: Challenge Bot FLAG detected - routing to Council...');

    const escalationResult = await handleEscalation(
      challengeResult,
      bot1Output,
      bot2Output,
      bot3Output,
      productName,
      outputDir
    );

    if (escalationResult.pipeline === 'HALTS') {
      console.log('\n[ORCHESTRATOR] HALTED - Ray escalation sent via Telegram.');
      console.log(`[ORCHESTRATOR] Council session log: ${outputDir}/council_session.md`);
      fs.writeFileSync(`${outputDir}/PIPELINE_STATUS.txt`,
        `STATUS: HALTED - AWAITING RAY DECISION\nPRODUCT: ${productName}\nCONFIG: ${config}\nTIMESTAMP: ${timestamp}\nREASON: Council escalation - see council_session.md\nRAY NOTIFIED: ${new Date().toISOString()}`
      );
      return { status: 'ESCALATED', outputDir, challengeResult, bot1Output, bot2Output, bot3Output };
    }

    console.log('\n[ORCHESTRATOR] PASS - Council resolved flag - pipeline continuing with memo attached.');
    fs.writeFileSync(`${outputDir}/${productSlug}_council_memo.md`,
      `# Council Resolution Memo\nProduct: ${productName}\nTimestamp: ${new Date().toISOString()}\n\n${escalationResult.memo}`
    );
  }

  // ── PASS ────────────────────────────────────────────────────────────────────────────────
  console.log('\n[ORCHESTRATOR] Pipeline complete.');
  console.log(`[ORCHESTRATOR] All outputs saved to: ${outputDir}`);

  // Write structured PIPELINE_STATUS.json with extracted scores
  const statusData = {
    status: 'PASS',
    product: productName,
    config: config,
    timestamp: timestamp,
    scores: bot2Parsed?.scores || null,
    overall: bot2Parsed?.overall_score || null,
    grade: bot2Parsed?.grade || null,
    outlook: bot2Parsed?.outlook || null,
    material_safety: bot3Parsed?.material_safety_score || null,
  };
  fs.writeFileSync(`${outputDir}/PIPELINE_STATUS.json`, JSON.stringify(statusData, null, 2));
  // Keep the old text format too for backward compat
  fs.writeFileSync(`${outputDir}/PIPELINE_STATUS.txt`,
    `STATUS: PASS\nPRODUCT: ${productName}\nCONFIG: ${config}\nOVERALL: ${bot2Parsed?.overall_score}\nGRADE: ${bot2Parsed?.grade}\nOUTLOOK: ${bot2Parsed?.outlook}\nTIMESTAMP: ${timestamp}`);

  console.log(`\n[ORCHESTRATOR] Files:`);
  console.log(`  ${productSlug}_bot1_consensus.md`);
  console.log(`  ${productSlug}_bot2_evaluator.json`);
  console.log(`  ${productSlug}_bot2_evaluator_raw.md`);
  console.log(`  ${productSlug}_bot3_material_safety.json`);
  console.log(`  ${productSlug}_bot3_material_safety_raw.md`);
  console.log(`  ${productSlug}_bot4_challenge.md`);
  if (fs.existsSync(`${outputDir}/${productSlug}_council_memo.md`)) {
    console.log(`  ${productSlug}_council_memo.md`);
    console.log(`  council_session.md`);
  }
  console.log(`  PIPELINE_STATUS.json`);
  console.log(`  PIPELINE_STATUS.txt`);

  return { status: 'PASS', outputDir, bot1Output, bot2Output, bot3Output, challengeResult, bot2Parsed, bot3Parsed };
}

// ─── CLI ENTRY POINT ──────────────────────────────────────────────────────────

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.log('Usage: node bot_orchestrator_v3.js <product_name> <config> <research_file_1> [research_file_2]...');
    console.log('Example: node bot_orchestrator_v3.js "Marvin Integrity DH" DH ./inputs/marvin_integrity_research.md');

  }
  const productName = args[0];
  const config = args[1];
  const researchFiles = args.slice(2);

  runPipeline(productName, config, researchFiles)
    .then(result => process.exit(result.status === 'PASS' ? 0 : 1))
    .catch(err => { console.error('[ORCHESTRATOR] FATAL:', err); process.exit(1); });
}

module.exports = { runPipeline };
