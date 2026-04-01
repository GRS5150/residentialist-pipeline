#!/usr/bin/env node
/**
 * HVAC Calibration Scoring Script — v1 (Pre-Deep Dive)
 *
 * Scope: Central AC & Heat Pumps (split systems only)
 * 6 calibration products, all targets must hit exactly (delta = 0)
 *
 * Usage: node score_hvac_calibration.js
 * Created: April 1, 2026
 */

const fs = require('fs');
const path = require('path');

// ─── Weights ───────────────────────────────────────────────────────────────────

const WEIGHTS = { quality: 0.30, durability: 0.40, performance: 0.30 };

// ─── Geometric Mean ────────────────────────────────────────────────────────────

function geoMean(q, d, p) {
  const qn = Math.max(q / 10, 0.01);
  const dn = Math.max(d / 10, 0.01);
  const pn = Math.max(p / 10, 0.01);
  return Math.pow(qn, WEIGHTS.quality) *
         Math.pow(dn, WEIGHTS.durability) *
         Math.pow(pn, WEIGHTS.performance) * 10;
}

function getLabel(score) {
  if (score >= 90) return 'Best in Class';
  if (score >= 75) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Below Standard';
}

// ─── Calibration Products ────────────────────────────────────────────────────

const CALIBRATION_PRODUCTS = [
  {
    name: 'Carrier Infinity 24VNA (Variable-Speed)',
    slug: 'carrier_infinity',
    target: 94,
    tier: 'Tier 1',

    specs: {
      // Quality
      compressor_type: 'variable_speed_inverter',       // adj: +2
      compressor_oem: 'copeland_identified',             // adj: +1 (Copeland ZPD scroll, identified)
      condenser_coil_type: 'copper_tube_aluminum_fin',   // adj: +1 (traditional — some Carrier lines microchannel, but Infinity uses traditional)
      expansion_device: 'eev_electronic',                // adj: +1
      fan_motor_type: 'variable_speed_bldc',             // adj: +1
      cabinet_construction: 'heavy_gauge_galvanized_louvered', // adj: +1
      source_traceability: 'single_source_manufacturing', // adj: +1 (Charlotte NC / Collierville TN)

      // Performance
      seer2_rating: 24.0,                               // adj: +2 (>=22.0)
      hspf2_rating: 10.0,                               // adj: +2 (heat pump version — >=10.0)
      sound_rating_dba: 58,                              // adj: +2 (<=58)
      capacity_modulation_range: '25_to_100_pct',        // adj: +2
      cold_weather_performance: 'operates_to_neg15f_plus', // adj: +1 (heat pump version)

      // Durability
      warranty_compressor_years: 10,                     // adj: +1
      warranty_parts_years: 10,                          // adj: +1 (registered)
      warranty_claim_process: 'standard',                // adj: 0
      parts_availability: 'widely_stocked',              // adj: 0 (Carrier Enterprise, some restriction)
      service_network_density: 'national_certified',     // adj: 0 (certified dealer network)
      coil_corrosion_protection: 'factory_coating_proven', // adj: +1 (WeatherArmor)
      control_board_reliability: 'proven_reliable',      // adj: +1 (Infinity communicating system mature)
      refrigerant_type: 'r454b_a2l_ready',              // adj: +1 (newer models transitioning)
    },

    // Quality adj: +2+1+1+1+1+1+1 = +8 (capped at 8)
    // Performance adj: +2+2+2+2+1 = +9 (capped at 8)
    // Durability adj: +1+1+0+0+0+1+1+1 = +5
    spec_adj: { quality: 8, performance: 8, durability: 5, total: 21, capped_total: 8 },

    axis_scores: { quality: 9.5, durability: 9.3, performance: 9.6 },

    notes: [
      'Carrier Infinity: Greenspeed Intelligence with Copeland variable-speed scroll compressor',
      'Communicating system — Infinity thermostat controls all components as integrated system',
      'True variable-speed: 25-100% capacity range for precise comfort control',
      'SEER2 up to 24.0 — among highest for ducted split systems',
      'Sound: as low as 56-58 dBA outdoor (among quietest variable-speed)',
      'WeatherArmor cabinet with louvered coil guard — good outdoor durability',
      'Carrier Enterprise distribution — not as open as Goodman but widely available',
      'Carrier Global (parent) is Fortune 500, strong warranty backing',
      'WEAKNESS: Proprietary Infinity communicating system — standard 24V thermostat requires adapter kit',
      'WEAKNESS: Carrier Enterprise distribution creates some parts markup vs independent supply',
    ],

    report_fields: {
      corporate_parent: 'Carrier Global Corporation — independent publicly traded company (2020 UTC spinoff). Fortune 500. Headquarters: Palm Beach Gardens, FL.',
      outlook: 'Strong',
      manufacturing: 'Condenser units: Collierville, TN. Compressor: Copeland (Sidney, OH). Charlotte, NC facility.',
      platform_sharing: 'Carrier/Bryant/Heil/ICP family. Bryant Evolution = same compressor and board as Carrier Infinity, different thermostat software and badge. Report must disclose.',
    },
  },

  {
    name: 'Trane XV20i (Variable-Speed)',
    slug: 'trane_xv',
    target: 91,
    tier: 'Tier 1',

    specs: {
      // Quality
      compressor_type: 'variable_speed_inverter',       // adj: +2
      compressor_oem: 'copeland_identified',             // adj: +1 (some Trane lines use Climatuff but XV uses Copeland)
      condenser_coil_type: 'spine_fin',                  // adj: 0 (Trane Spine Fin — proprietary, different from traditional but acceptable)
      expansion_device: 'eev_electronic',                // adj: +1
      fan_motor_type: 'variable_speed_bldc',             // adj: +1
      cabinet_construction: 'heavy_gauge_galvanized_louvered', // adj: +1
      source_traceability: 'single_source_manufacturing', // adj: +1 (Tyler, TX)

      // Performance
      seer2_rating: 22.0,                               // adj: +2 (>=22.0)
      hspf2_rating: 10.0,                               // adj: +2 (heat pump version)
      sound_rating_dba: 60,                              // adj: +1 (59-66 range)
      capacity_modulation_range: '25_to_100_pct',        // adj: +2
      cold_weather_performance: 'operates_to_neg15f_plus', // adj: +1

      // Durability
      warranty_compressor_years: 12,                     // adj: +2 (Trane offers 12-year with registration)
      warranty_parts_years: 10,                          // adj: +1 (registered)
      warranty_claim_process: 'standard',                // adj: 0
      parts_availability: 'widely_stocked',              // adj: 0 (Trane Supply + independent)
      service_network_density: 'national_certified',     // adj: 0
      coil_corrosion_protection: 'factory_coating_proven', // adj: +1 (Spine Fin is inherently resistant)
      control_board_reliability: 'proven_reliable',      // adj: +1 (ComfortLink II mature)
      refrigerant_type: 'r454b_a2l_ready',              // adj: +1 (transitioning)
    },

    // Quality adj: +2+1+0+1+1+1+1 = +7
    // Performance adj: +2+2+1+2+1 = +8 (capped at 8)
    // Durability adj: +2+1+0+0+0+1+1+1 = +6
    spec_adj: { quality: 7, performance: 8, durability: 6, total: 21, capped_total: 8 },

    axis_scores: { quality: 9.2, durability: 9.1, performance: 9.1 },

    notes: [
      'Trane XV20i: TruComfort variable-speed, top-of-line Trane',
      'Most forgiving of installation quality per contractor consensus — robust build tolerates mediocre ductwork better',
      'Spine Fin coil: proprietary Trane design, inherently more corrosion-resistant than traditional fin/tube',
      '12-year compressor warranty (registered) — strongest in category',
      'Trane XV is the "durability anchor" — contractors cite fewest long-term issues',
      'WEAKNESS: SEER2 22.0 vs Carrier 24.0 and Lennox 28.0 — not the efficiency leader',
      'WEAKNESS: Spine Fin coil is proprietary — replacement must be Trane coil, not universal',
      'WEAKNESS: ComfortLink II communicating system is less flexible than Carrier Infinity for third-party integration',
    ],

    report_fields: {
      corporate_parent: 'Trane Technologies (formerly Ingersoll Rand) — publicly traded. Also owns American Standard.',
      outlook: 'Strong',
      manufacturing: 'Tyler, TX (primary). Compressor: Copeland sourced. Spine Fin coils in-house.',
      platform_sharing: 'Trane/American Standard family — different product tiers, NOT badge-engineered. American Standard is value tier with different component selection.',
    },
  },

  {
    name: 'Lennox SL28XCV (Variable-Speed)',
    slug: 'lennox_sl28xcv',
    target: 82,
    tier: 'Tier 2',

    specs: {
      // Quality
      compressor_type: 'variable_speed_inverter',       // adj: +2
      compressor_oem: 'copeland_identified',             // adj: +1 (Lennox uses Copeland)
      condenser_coil_type: 'copper_tube_aluminum_fin',   // adj: +1
      expansion_device: 'eev_electronic',                // adj: +1
      fan_motor_type: 'variable_speed_bldc',             // adj: +1
      cabinet_construction: 'heavy_gauge_galvanized_louvered', // adj: +1 (SilentComfort technology)
      source_traceability: 'single_source_manufacturing', // adj: +1 (proprietary Lennox platform)

      // Performance
      seer2_rating: 28.0,                               // adj: +2 (HIGHEST in category)
      hspf2_rating: 10.5,                               // adj: +2 (heat pump version)
      sound_rating_dba: 56,                              // adj: +2 (<=58 — quietest in category)
      capacity_modulation_range: '25_to_100_pct',        // adj: +2
      cold_weather_performance: 'operates_to_neg15f_plus', // adj: +1

      // Durability
      warranty_compressor_years: 10,                     // adj: +1
      warranty_parts_years: 10,                          // adj: +1 (registered)
      warranty_claim_process: 'claims_difficult',        // adj: -1 (Lennox rated hardest warranty process by contractors)
      parts_availability: 'highly_proprietary',          // adj: -2 (15-20% price premium, longer lead times, Lennox-only distributors)
      service_network_density: 'national_certified',     // adj: 0 (Lennox dealers, proprietary diagnostics)
      coil_corrosion_protection: 'factory_coating_proven', // adj: +1
      control_board_reliability: 'standard',             // adj: 0 (iComfort — advanced but more complex)
      refrigerant_type: 'r454b_a2l_ready',              // adj: +1
    },

    // Quality adj: +2+1+1+1+1+1+1 = +8 (capped at 8)
    // Performance adj: +2+2+2+2+1 = +9 (capped at 8)
    // Durability adj: +1+1-1-2+0+1+0+1 = +1
    spec_adj: { quality: 8, performance: 8, durability: 1, total: 17, capped_total: 8 },

    axis_scores: { quality: 8.5, durability: 7.5, performance: 9.0 },

    notes: [
      'Lennox SL28XCV: Industry-leading 28 SEER2 — highest efficiency ducted split system available',
      'Quietest variable-speed unit (56 dB) — SilentComfort technology',
      'Best-on-paper specs across the board — technological leader',
      'WEAKNESS: Proprietary ecosystem is the anchor that pulls this from Tier 1 to Tier 2',
      'WEAKNESS: Parts 15-20% more expensive than Carrier/Trane equivalents',
      'WEAKNESS: Longer lead times for replacement coils, boards — special order from Lennox-only distributors',
      'WEAKNESS: Warranty claims rated most difficult by contractor consensus — proprietary diagnostic requirements',
      'WEAKNESS: iComfort communicating system locks buyer into Lennox thermostat ecosystem',
      'Contractors reconcile best specs vs worst serviceability: recommend for long-term homeowners prioritizing energy bills, steer away for service-cost-conscious buyers',
      'The Lennox Paradox: best product, worst total cost of ownership in service years',
    ],

    report_fields: {
      corporate_parent: 'Lennox International Inc. — publicly traded (NYSE: LII). Headquarters: Richardson, TX.',
      outlook: 'Strong',
      manufacturing: 'Lennox proprietary platforms. Manufacturing in Stuttgart, AR and others.',
      platform_sharing: 'Lennox does NOT badge-engineer. Owns Armstrong (air handlers). Some component sharing within Lennox divisions only.',
    },
  },

  {
    name: 'Rheem Prestige RA20 (Two-Stage)',
    slug: 'rheem_prestige',
    target: 67,
    tier: 'Tier 3',

    specs: {
      // Quality
      compressor_type: 'two_stage',                     // adj: +1
      compressor_oem: 'copeland_identified',             // adj: +1 (Copeland scroll)
      condenser_coil_type: 'copper_tube_aluminum_fin',   // adj: +1
      expansion_device: 'txv_thermostatic',              // adj: 0
      fan_motor_type: 'ecm',                             // adj: 0
      cabinet_construction: 'standard_galvanized',       // adj: 0
      source_traceability: 'single_source_manufacturing', // adj: +1 (Fort Smith, AR)

      // Performance
      seer2_rating: 19.0,                               // adj: +1 (18.0-21.9)
      hspf2_rating: 9.0,                                // adj: +1 (heat pump version)
      sound_rating_dba: 65,                              // adj: +1 (59-66)
      capacity_modulation_range: '67_100_two_stage',     // adj: 0
      cold_weather_performance: 'operates_to_0f',        // adj: 0

      // Durability
      warranty_compressor_years: 10,                     // adj: +1 (registered)
      warranty_parts_years: 10,                          // adj: +1 (registered)
      warranty_claim_process: 'contractor_friendly',     // adj: +1 (Rheem rated claim-friendly)
      parts_availability: 'universal_multi_distributor', // adj: +1 (Rheem + independent supply houses)
      service_network_density: 'national_wide_independent', // adj: +1 (any contractor can service)
      coil_corrosion_protection: 'standard_no_coating',  // adj: 0
      control_board_reliability: 'standard',             // adj: 0
      refrigerant_type: 'r410a_current',                 // adj: 0
    },

    // Quality adj: +1+1+1+0+0+0+1 = +4
    // Performance adj: +1+1+1+0+0 = +3
    // Durability adj: +1+1+1+1+1+0+0+0 = +5
    spec_adj: { quality: 4, performance: 3, durability: 5, total: 12, capped_total: 8 },

    axis_scores: { quality: 6.6, durability: 6.8, performance: 6.7 },

    notes: [
      'Rheem Prestige: The "Toyota Camry" of HVAC per contractor consensus — not exciting but reliable',
      'Two-stage Copeland scroll — solid proven technology',
      'Best-in-class warranty claim process — Rheem rated most contractor-friendly',
      'Open parts ecosystem — any supply house stocks Rheem parts',
      'Any HVAC contractor can service — lowest service dependency of any brand',
      'Prestige line meaningfully outperforms Rheem Classic (not just badge engineering — different components and diagnostics)',
      'WEAKNESS: Not a technology leader — 19 SEER2 vs 22-28 for premium variable-speed',
      'WEAKNESS: Two-stage comfort is good but not variable-speed level (67/100% vs 25-100%)',
      'WEAKNESS: No communicating system sophistication — basic thermostat compatible but less integrated',
      'Represents the floor for "acceptable in a quality home" per professional consensus',
    ],

    report_fields: {
      corporate_parent: 'Rheem Manufacturing Company — privately held subsidiary of Paloma Industries (Japan). Also operates Ruud brand.',
      outlook: 'Stable',
      manufacturing: 'Fort Smith, AR (primary US manufacturing).',
      platform_sharing: 'Rheem/Ruud are same unit, different distribution. Ruud = wholesale/supply-house channel. Identical components.',
    },
  },

  {
    name: 'Goodman GSXC18 (Two-Stage)',
    slug: 'goodman_gsxc18',
    target: 64,
    tier: 'Tier 3',

    specs: {
      // Quality
      compressor_type: 'two_stage',                     // adj: +1
      compressor_oem: 'copeland_identified',             // adj: +1 (Copeland scroll on GSXC18)
      condenser_coil_type: 'copper_tube_aluminum_fin',   // adj: +1
      expansion_device: 'txv_thermostatic',              // adj: 0
      fan_motor_type: 'ecm',                             // adj: 0
      cabinet_construction: 'standard_galvanized',       // adj: 0
      source_traceability: 'single_source_manufacturing', // adj: +1 (Houston, TX / Fayetteville, TN)

      // Performance
      seer2_rating: 18.0,                               // adj: +1 (18.0-21.9)
      hspf2_rating: 8.5,                                // adj: +1 (heat pump version)
      sound_rating_dba: 68,                              // adj: 0 (67-72 range)
      capacity_modulation_range: '67_100_two_stage',     // adj: 0
      cold_weather_performance: 'operates_to_0f',        // adj: 0

      // Durability
      warranty_compressor_years: 99,                     // adj: +2 (lifetime compressor warranty — genuinely claimable post-Daikin)
      warranty_parts_years: 10,                          // adj: +1 (registered)
      warranty_claim_process: 'contractor_friendly',     // adj: +1 (Daikin warranty rated easy to claim)
      parts_availability: 'universal_multi_distributor', // adj: +1 (GEMAIRE, Ferguson, Johnstone — widest in industry)
      service_network_density: 'national_wide_independent', // adj: +1 (any contractor can service Goodman)
      coil_corrosion_protection: 'standard_no_coating',  // adj: 0
      control_board_reliability: 'standard',             // adj: 0
      refrigerant_type: 'r410a_current',                 // adj: 0
    },

    // Quality adj: +1+1+1+0+0+0+1 = +4
    // Performance adj: +1+1+0+0+0 = +2
    // Durability adj: +2+1+1+1+1+0+0+0 = +6
    spec_adj: { quality: 4, performance: 2, durability: 6, total: 12, capped_total: 8 },

    axis_scores: { quality: 6.2, durability: 6.7, performance: 6.3 },

    notes: [
      'Goodman GSXC18: Daikin-owned since 2012 — meaningfully improved quality vs pre-acquisition',
      'Lifetime compressor warranty — genuinely claimable (not a gimmick post-Daikin)',
      'Widest parts availability in the industry — GEMAIRE, Ferguson, Johnstone Supply all stock',
      'Any HVAC contractor can service — zero brand lock-in',
      'Volume leader in new construction — highest market share in residential HVAC',
      'Post-Daikin quality narrative: current units genuinely better, but stigma lingers among older techs',
      'WEAKNESS: Builder-grade perception — even GSXC18 (mid-tier) carries the Goodman stigma',
      'WEAKNESS: 18 SEER2 on two-stage — adequate but not impressive',
      'WEAKNESS: Sound 68 dBA — louder than Rheem Prestige and premium brands',
      'WEAKNESS: No communicating system sophistication comparable to Carrier/Trane/Lennox',
      'Amana is essentially rebadged Goodman with enhanced warranty — same unit, different nameplate + better warranty marketing',
    ],

    report_fields: {
      corporate_parent: 'Daikin Industries (Japan) — acquired Goodman in 2012. Also owns Amana (HVAC brand, NOT the appliance brand). World\'s largest HVAC manufacturer.',
      outlook: 'Strong',
      manufacturing: 'Houston, TX (primary). Fayetteville, TN (secondary).',
      platform_sharing: 'Goodman/Amana are same unit, different brand/warranty/distribution. Daikin Fit/DX is SEPARATE platform. Report must disclose Goodman=Amana.',
    },
  },

  {
    name: 'Goodman GSX14 (Single-Stage Builder-Grade)',
    slug: 'goodman_gsx14',
    target: 47,
    tier: 'Tier 4',

    specs: {
      // Quality
      compressor_type: 'single_stage',                  // adj: 0
      compressor_oem: 'copeland_identified',             // adj: +1 (Copeland single-stage scroll)
      condenser_coil_type: 'copper_tube_aluminum_fin',   // adj: +1
      expansion_device: 'fixed_orifice_piston',          // adj: -1
      fan_motor_type: 'psc',                             // adj: -1
      cabinet_construction: 'light_gauge_mesh_guard',    // adj: -1
      source_traceability: 'single_source_manufacturing', // adj: +1 (Houston TX)

      // Performance
      seer2_rating: 14.3,                               // adj: -1 (<15.0 — near code minimum)
      hspf2_rating: 7.5,                                // adj: 0 (7.5-8.4 — if heat pump version)
      sound_rating_dba: 74,                              // adj: -1 (>=73)
      capacity_modulation_range: '100_only_single_stage', // adj: -1
      cold_weather_performance: 'limited_below_25f',     // adj: -1 (if heat pump — limited cold weather)

      // Durability
      warranty_compressor_years: 99,                     // adj: +2 (lifetime compressor — even on base model)
      warranty_parts_years: 10,                          // adj: +1 (registered)
      warranty_claim_process: 'contractor_friendly',     // adj: +1
      parts_availability: 'universal_multi_distributor', // adj: +1
      service_network_density: 'national_wide_independent', // adj: +1
      coil_corrosion_protection: 'standard_no_coating',  // adj: 0
      control_board_reliability: 'standard',             // adj: 0
      refrigerant_type: 'r410a_current',                 // adj: 0
    },

    // Quality adj: 0+1+1-1-1-1+1 = 0
    // Performance adj: -1+0-1-1-1 = -4
    // Durability adj: +2+1+1+1+1+0+0+0 = +6
    spec_adj: { quality: 0, performance: -4, durability: 6, total: 2, capped_total: 2 },

    axis_scores: { quality: 4.5, durability: 5.5, performance: 4.1 },

    notes: [
      'Builder-grade floor — this is what goes in $300K-600K tract homes',
      'Single-stage on/off operation — no modulation, short cycles in oversized installs',
      '14.3 SEER2 — at or near code minimum (varies by region)',
      'Fixed orifice (piston) expansion — cheaper, less efficient, more charge-sensitive',
      'PSC fan motor — 40-50% efficiency vs 65-75% ECM',
      'Light gauge cabinet — adequate but not durable long-term',
      '8-10 year expected lifespan per repair tech consensus',
      'STRENGTH: Lifetime compressor warranty exists even on base model',
      'STRENGTH: Widest parts availability in industry — any supply house, any contractor',
      'STRENGTH: Simple design = fewer things to break (no communicating system, no inverter board)',
      'Represents the floor every buyer should know about: functional but no differentiation',
    ],

    report_fields: {
      corporate_parent: 'Daikin Industries (Japan) — same parent as GSXC18 above.',
      outlook: 'Strong',
      manufacturing: 'Houston, TX.',
      platform_sharing: 'Goodman/Amana badge engineering applies here too. Amana ASX14 = same unit.',
    },
  },
];

// ─── Score All Products ────────────────────────────────────────────────────────

console.log('='.repeat(70));
console.log('HVAC CALIBRATION — v1 (Pre-Deep Dive)');
console.log('Scope: Central AC & Heat Pumps (Split Systems)');
console.log(`Weights: Q=${WEIGHTS.quality}, D=${WEIGHTS.durability}, P=${WEIGHTS.performance}`);
console.log('='.repeat(70));
console.log();

let allHit = true;
const results = [];

for (const p of CALIBRATION_PRODUCTS) {
  const { quality, durability, performance } = p.axis_scores;
  const overall = geoMean(quality, durability, performance);
  const display = Math.round(overall * 10);
  const delta = display - p.target;
  const label = getLabel(display);

  if (delta !== 0) allHit = false;

  results.push({
    name: p.name,
    target: p.target,
    display,
    delta,
    quality,
    durability,
    performance,
    raw: overall,
    label,
    tier: p.tier,
  });

  console.log(`${p.name}`);
  console.log(`  Tier: ${p.tier} | Target: ${p.target} | Score: ${display} | Delta: ${delta >= 0 ? '+' : ''}${delta}`);
  console.log(`  Axes: Q=${quality} D=${durability} P=${performance} | Raw: ${overall.toFixed(2)}`);
  console.log(`  Label: ${label}`);
  console.log(`  Spec adj: Q=${p.spec_adj.quality}, P=${p.spec_adj.performance}, D=${p.spec_adj.durability} (total=${p.spec_adj.total}, capped=${p.spec_adj.capped_total})`);
  console.log();
}

// Summary
console.log('='.repeat(70));
console.log('CALIBRATION SUMMARY');
console.log('='.repeat(70));
console.log();
console.log('Product'.padEnd(45) + 'Target'.padEnd(8) + 'Score'.padEnd(8) + 'Delta'.padEnd(8) + 'Status');
console.log('-'.repeat(77));
for (const r of results) {
  const status = r.delta === 0 ? '✅' : `❌ (${r.delta >= 0 ? '+' : ''}${r.delta})`;
  console.log(r.name.padEnd(45) + String(r.target).padEnd(8) + String(r.display).padEnd(8) + String(r.delta).padEnd(8) + status);
}
console.log();

if (allHit) {
  console.log('✅ ALL TARGETS HIT EXACTLY — CALIBRATION LOCKED');
} else {
  console.log('❌ TARGETS NOT MET — ADJUST AXIS SCORES');
}
