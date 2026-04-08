#!/usr/bin/env node
/**
 * Deterministic Spec Spot-Check
 *
 * Takes a product slug + category, identifies the 3–5 specs that feed the
 * deterministic score positioning code, and compares them against the
 * verified_specs SQLite table. Flags any mismatches.
 *
 * No LLM calls — pure lookup and comparison.
 *
 * Usage:
 *   node scripts/spec_spot_check.js <product_slug> <category>
 *   node scripts/spec_spot_check.js rohl_shaws_rc3618 sinks
 *   node scripts/spec_spot_check.js pella_250_series_double_hung windows
 */

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

// ─── Config ──────────────────────────────────────────────────────────────────

const BASE_DIR = path.join(__dirname, '..');
const CALIBRATION_DIR = path.join(BASE_DIR, 'calibration');
const DB_PATH = path.join(BASE_DIR, 'residentialist.db');

// Spec names that feed the deterministic scorer, per category.
// These are the specs from calibration config that affect scoring position.
const SCORING_SPECS = {
  windows:           ['u_factor', 'shgc', 'frame_material', 'dp_rating', 'air_infiltration'],
  sinks:             ['body_material', 'basin_depth', 'mounting_type', 'warranty_years', 'construction_method'],
  faucets:           ['valve_type', 'flow_rate_gpm', 'finish', 'body_material', 'warranty_years'],
  tile:              ['pei_rating', 'water_absorption', 'thickness', 'body_material'],
  toilets:           ['gpf_flush_volume', 'map_score', 'flush_performance', 'warranty_years'],
  dishwashers:       ['noise_level_dba', 'dry_system', 'rack_material', 'warranty_years'],
  refrigerators:     ['compressor_type', 'capacity_cubic_feet', 'energy_star', 'warranty_years'],
  wall_ovens:        ['convection_type', 'capacity_cubic_feet', 'self_clean_method', 'warranty_years'],
  ranges_cooktops:   ['btu_rating', 'burner_count', 'oven_capacity', 'warranty_years'],
  range_hoods:       ['cfm_rating', 'sone_level', 'motor_type', 'warranty_years'],
  water_heaters:     ['btu_input', 'first_hour_rating', 'energy_factor', 'warranty_years'],
  hvac:              ['seer_rating', 'tonnage', 'hspf', 'warranty_years'],
  lighting_control:  ['max_load_watts', 'protocol', 'dimmer_type', 'warranty_years'],
  motorized_shades:  ['motor_type', 'max_width', 'noise_level', 'warranty_years'],
  cabinets:          ['construction_type', 'box_material', 'door_style', 'warranty_years'],
  hardwood_flooring: ['thickness', 'wear_layer', 'janka_hardness', 'warranty_years'],
  exterior_doors:    ['u_factor', 'material', 'impact_rating', 'warranty_years'],
  countertops:       ['material_type', 'heat_resistance_f', 'scratch_resistance_mohs', 'porosity', 'certification_safety', 'repairability', 'warranty_years'],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Load calibration product data for a slug from calibration/{category}/config.json.
 * Also falls back to the score_{category}_calibration.js file.
 */
function loadCalibrationProduct(category, slug) {
  // Try calibration config.json first
  const configPath = path.join(CALIBRATION_DIR, category, 'config.json');
  if (fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      const products = config.calibration_products || [];
      const product = products.find(p => p.slug === slug);
      if (product) return product;
    } catch (e) {
      console.log(`  ⚠️  Failed to parse ${configPath}: ${e.message}`);
    }
  }

  // Fallback: parse score_{category}_calibration.js
  const calibJsPath = path.join(BASE_DIR, `score_${category}_calibration.js`);
  if (fs.existsSync(calibJsPath)) {
    try {
      const content = fs.readFileSync(calibJsPath, 'utf8');
      return parseProductFromCalibJs(content, slug);
    } catch (e) {
      console.log(`  ⚠️  Failed to parse ${calibJsPath}: ${e.message}`);
    }
  }

  return null;
}

/**
 * Parse a single product from a calibration JS file.
 */
function parseProductFromCalibJs(content, slug) {
  // Find the product block by slug
  const slugPattern = new RegExp(`slug:\\s*['"\`]${slug}['"\`]`);
  const slugIndex = content.search(slugPattern);
  if (slugIndex === -1) return null;

  // Find the enclosing object
  let braceCount = 0;
  let start = slugIndex;
  while (start > 0 && content[start] !== '{') start--;

  let end = start;
  for (let i = start; i < content.length; i++) {
    if (content[i] === '{') braceCount++;
    if (content[i] === '}') braceCount--;
    if (braceCount === 0) { end = i + 1; break; }
  }

  const block = content.substring(start, end);

  // Extract key fields
  const product = { slug };
  const nameMatch = block.match(/name:\s*['"`]([^'"`]+)['"`]/);
  if (nameMatch) product.name = nameMatch[1];

  // Extract specs object if present
  const specsMatch = block.match(/specs:\s*\{([\s\S]*?)\n\s*\}/);
  if (specsMatch) {
    const specsBlock = specsMatch[1];
    product.specs = {};
    const specRegex = /(\w+):\s*['"`]([^'"`]+)['"`]/g;
    let m;
    while ((m = specRegex.exec(specsBlock)) !== null) {
      product.specs[m[1]] = m[2];
    }
  }

  // Extract notes
  const notesMatch = block.match(/notes:\s*\[([\s\S]*?)\]/);
  if (notesMatch) {
    product.notes_text = notesMatch[1].replace(/'/g, '').replace(/,\s*$/gm, '').trim();
  }

  return product;
}

/**
 * Query verified_specs from SQLite for a product slug.
 * Returns: { spec_name: { normalized_value, confidence, source_type } }
 */
function loadVerifiedSpecs(slug) {
  if (!fs.existsSync(DB_PATH)) {
    console.error(`❌ Database not found: ${DB_PATH}`);
    return {};
  }

  const db = new Database(DB_PATH, { readonly: true });
  const rows = db.prepare(
    'SELECT spec_name, normalized_value, confidence, source_type FROM verified_specs WHERE product_slug = ?'
  ).all(slug);
  db.close();

  const specs = {};
  for (const row of rows) {
    specs[row.spec_name] = {
      value: row.normalized_value,
      confidence: row.confidence,
      source_type: row.source_type
    };
  }
  return specs;
}

/**
 * Normalize a spec value for comparison.
 * Handles enum-style values (underscores → spaces), case, whitespace.
 */
function normalize(value) {
  if (value == null) return '';
  return String(value)
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/[^a-z0-9.\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Compare two spec values. Returns MATCH, MISMATCH, or LIKELY_MATCH.
 */
function compareSpecs(calibValue, dbValue) {
  const normCalib = normalize(calibValue);
  const normDb = normalize(dbValue);

  if (!normCalib || !normDb) return 'EMPTY';

  // Exact match after normalization
  if (normCalib === normDb) return 'MATCH';

  // One contains the other
  if (normCalib.includes(normDb) || normDb.includes(normCalib)) return 'LIKELY_MATCH';

  // Numeric comparison: extract numbers and compare
  const calibNums = normCalib.match(/[\d.]+/g);
  const dbNums = normDb.match(/[\d.]+/g);
  if (calibNums && dbNums) {
    // If all numbers from calibration appear in DB value, likely match
    const allPresent = calibNums.every(n => dbNums.includes(n));
    if (allPresent) return 'LIKELY_MATCH';
  }

  // Semantic equivalences for common spec patterns
  const equivalences = [
    [/lifetime/, /lifetime/],
    [/limited lifetime/, /lifetime limited/],
    [/fireclay/, /fire clay/],
    [/stainless/, /stainless steel/],
    [/vitreous china/, /vitreous/],
    [/apron front/, /farmhouse/],
    [/not published/, /not found/],
  ];

  for (const [a, b] of equivalences) {
    if ((a.test(normCalib) && b.test(normDb)) || (b.test(normCalib) && a.test(normDb))) {
      return 'LIKELY_MATCH';
    }
  }

  return 'MISMATCH';
}

// ─── Main ────────────────────────────────────────────────────────────────────

function main() {
  const slug = process.argv[2];
  const category = process.argv[3];

  if (!slug || !category) {
    console.log('Usage: node scripts/spec_spot_check.js <product_slug> <category>');
    console.log('Example: node scripts/spec_spot_check.js rohl_shaws_rc3618 sinks');
    process.exit(1);
  }

  console.log(`\n=== Deterministic Spec Spot-Check ===`);
  console.log(`Product: ${slug}`);
  console.log(`Category: ${category}\n`);

  // Step 1: Load calibration product
  const product = loadCalibrationProduct(category, slug);
  if (!product) {
    console.error(`❌ Product "${slug}" not found in calibration config for ${category}`);
    process.exit(1);
  }
  console.log(`📦 Product: ${product.name || slug}`);

  // Step 2: Identify scoring specs
  const scoringSpecNames = SCORING_SPECS[category] || [];
  const calibSpecs = product.specs || {};

  // Build the list of specs to check: intersection of scoring specs and product specs
  const specsToCheck = [];
  for (const specName of scoringSpecNames) {
    if (calibSpecs[specName] != null) {
      specsToCheck.push({ name: specName, calibValue: calibSpecs[specName] });
    }
  }

  // Also include any spec in calibSpecs that isn't in the standard list (catch extras)
  for (const [name, value] of Object.entries(calibSpecs)) {
    if (!specsToCheck.find(s => s.name === name)) {
      specsToCheck.push({ name, calibValue: value });
    }
  }

  if (specsToCheck.length === 0) {
    console.log(`\n⚠️  No specs found in calibration config for ${slug}`);
    console.log(`   Calibration may use notes-based scoring instead of structured specs.`);
    process.exit(0);
  }

  console.log(`🔍 Specs to check: ${specsToCheck.length}\n`);

  // Step 3: Load verified specs from DB
  const dbSpecs = loadVerifiedSpecs(slug);
  const dbSpecCount = Object.keys(dbSpecs).length;
  console.log(`💾 Verified specs in DB: ${dbSpecCount}\n`);

  // Step 4: Compare
  let matchCount = 0;
  let mismatchCount = 0;
  let notInDbCount = 0;
  let emptyCount = 0;

  console.log('─'.repeat(90));
  console.log(`${'Spec'.padEnd(30)} ${'Calibration'.padEnd(25)} ${'DB Value'.padEnd(25)} Status`);
  console.log('─'.repeat(90));

  for (const spec of specsToCheck) {
    const dbSpec = dbSpecs[spec.name];
    const dbValue = dbSpec ? dbSpec.value : null;

    let status;
    let statusIcon;

    if (!dbSpec) {
      status = 'NOT_IN_DB';
      statusIcon = '⬜';
      notInDbCount++;
    } else {
      status = compareSpecs(spec.calibValue, dbValue);
      if (status === 'MATCH' || status === 'LIKELY_MATCH') {
        statusIcon = '✅';
        matchCount++;
      } else if (status === 'EMPTY') {
        statusIcon = '⬜';
        emptyCount++;
      } else {
        statusIcon = '❌';
        mismatchCount++;
      }
    }

    const calibDisplay = String(spec.calibValue).substring(0, 23);
    const dbDisplay = dbValue ? String(dbValue).substring(0, 23) : '—';
    console.log(`${statusIcon} ${spec.name.padEnd(28)} ${calibDisplay.padEnd(25)} ${dbDisplay.padEnd(25)} ${status}`);
  }

  console.log('─'.repeat(90));

  // Summary
  console.log(`\n📊 Results:`);
  console.log(`   ✅ MATCH/LIKELY: ${matchCount}`);
  console.log(`   ❌ MISMATCH:     ${mismatchCount}`);
  console.log(`   ⬜ NOT_IN_DB:    ${notInDbCount}`);
  if (emptyCount > 0) console.log(`   ⬜ EMPTY:        ${emptyCount}`);

  if (mismatchCount === 0) {
    console.log(`\n✅ PASS — No mismatches found.`);
  } else {
    console.log(`\n⚠️  FAIL — ${mismatchCount} mismatch(es) detected. Review required.`);
    process.exit(1);
  }
}

main();
