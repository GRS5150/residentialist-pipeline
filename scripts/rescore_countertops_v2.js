#!/usr/bin/env node
/**
 * Rescore all 6 countertop calibration products with v2 spec adjustments.
 * Uses TDS-verified specs from data/countertop_tds_specs.json.
 * Does NOT re-run deep dives or tier classification — reuses existing tier results.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');

const WORKSPACE = path.join(__dirname, '..');
const scoreCalculator = require(path.join(WORKSPACE, 'score_calculator'));

const tdsSpecs = JSON.parse(fs.readFileSync(path.join(WORKSPACE, 'data', 'countertop_tds_specs.json'), 'utf8'));

const products = [
  { name: 'Cambria Brittanicca', slug: 'cambria_brittanicca', material_class: 'engineered_quartz_premium' },
  { name: 'Dekton Aura 15', slug: 'dekton_aura_15', material_class: 'sintered_stone' },
  { name: 'Caesarstone Calacatta Maximus', slug: 'caesarstone_calacatta_maximus', material_class: 'engineered_quartz_branded' },
  { name: 'MSI Q Premium Calacatta Arno', slug: 'msi_q_premium_calacatta_arno', material_class: 'engineered_quartz_distributor' },
  { name: 'Ubatuba Granite', slug: 'ubatuba_granite', material_class: 'natural_granite_dark' },
  { name: 'White Ice Granite', slug: 'white_ice_granite', material_class: 'natural_granite_light' }
];

const targets = {
  'Cambria Brittanicca': { target: 95, low: 92, high: 97 },
  'Dekton Aura 15': { target: 91, low: 89, high: 93 },
  'Caesarstone Calacatta Maximus': { target: 82, low: 79, high: 85 },
  'MSI Q Premium Calacatta Arno': { target: 77, low: 74, high: 80 },
  'Ubatuba Granite': { target: 80, low: 77, high: 83 },
  'White Ice Granite': { target: 73, low: 70, high: 76 }
};

const results = [];

for (const p of products) {
  console.log('\n' + '='.repeat(60));
  console.log('RESCORING: ' + p.name);
  console.log('='.repeat(60));

  // Load existing tier result (from previous scoring run)
  const tierPath = path.join(WORKSPACE, 'output', p.slug, 'TIER_RESULT.json');
  if (!fs.existsSync(tierPath)) {
    console.error('No tier result for ' + p.slug + ' — skipping');
    results.push({ name: p.name, error: 'No tier result' });
    continue;
  }

  const tierResult = JSON.parse(fs.readFileSync(tierPath, 'utf8'));
  tierResult.category = 'countertops';

  // Build spec_highlights from TDS-verified data
  const tds = tdsSpecs[p.slug];
  if (!tds) {
    console.error('No TDS data for ' + p.slug + ' — skipping');
    results.push({ name: p.name, error: 'No TDS data' });
    continue;
  }

  const specHighlights = {
    heat_resistance_f: tds.heat_resistance_f,
    mohs_hardness: tds.mohs_hardness,
    water_absorption_pct: tds.water_absorption_pct,
    flexural_strength_psi: tds.flexural_strength_psi,
    impact_resistance: tds.impact_resistance,
    repairability: tds.repairability,
    warranty_transferable: tds.warranty_transferable === true,
    greenguard_gold: tds.greenguard_gold === true,
    nsf_51: tds.nsf_51 === true,
    certification_count: tds.certification_count || 0,
    domestic_manufacturing: tds.domestic_manufacturing === true,
    material_class: p.material_class
  };

  tierResult.spec_highlights = specHighlights;

  const outputDir = path.join(WORKSPACE, 'output', p.slug);
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  // Compute score
  const scoreResult = scoreCalculator.compute(tierResult, 'countertops', outputDir);
  scoreResult.product_name = p.name;
  scoreResult.category = 'countertops';
  scoreResult.material_class = p.material_class;

  fs.writeFileSync(path.join(outputDir, 'DETERMINISTIC_SCORES_v2.json'), JSON.stringify(scoreResult, null, 2));

  const t = targets[p.name];
  const inRange = scoreResult.display_score >= t.low && scoreResult.display_score <= t.high;

  console.log('[' + p.slug + '] Score: ' + scoreResult.display_score + ' | Target: ' + t.target + ' | Range: ' + t.low + '-' + t.high + ' | ' + (inRange ? 'IN RANGE' : 'OUT OF RANGE'));

  results.push({
    name: p.name,
    slug: p.slug,
    tier: tierResult.tier,
    tier_label: tierResult.tier_label,
    anchor: tierResult.closest_anchor,
    position: tierResult.above_or_below_anchor,
    score: scoreResult.display_score,
    grade: scoreResult.grade,
    label: scoreResult.product_label,
    target: t.target,
    low: t.low,
    high: t.high,
    inRange,
    spec_adjustment: scoreResult.spec_adjustment,
    spec_details: scoreResult.spec_details
  });
}

// Summary
console.log('\n' + '='.repeat(70));
console.log('  COUNTERTOP v2 RESCORE SUMMARY');
console.log('='.repeat(70));
console.log('Product'.padEnd(38) + 'Score'.padEnd(8) + 'Target'.padEnd(8) + 'Range'.padEnd(10) + 'SpecAdj'.padEnd(8) + 'Status');
console.log('-'.repeat(70));
for (const r of results) {
  if (r.error) {
    console.log(r.name.padEnd(38) + 'ERROR: ' + r.error);
    continue;
  }
  const status = r.inRange ? 'OK' : 'FLAG';
  console.log(r.name.padEnd(38) + String(r.score).padEnd(8) + String(r.target).padEnd(8) + (r.low + '-' + r.high).padEnd(10) + (r.spec_adjustment >= 0 ? '+' : '') + String(r.spec_adjustment).padEnd(7) + status);
}
console.log('='.repeat(70));

// Save results
fs.writeFileSync(path.join(WORKSPACE, 'output', 'countertop_rescore_v2_results.json'), JSON.stringify(results, null, 2));
console.log('\nResults saved to output/countertop_rescore_v2_results.json');
