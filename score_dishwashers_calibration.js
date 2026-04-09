#!/usr/bin/env node
/**
 * Dishwasher Calibration Scoring Script — v1
 *
 * 6 calibration products with specs populated from Perplexity testing framework
 * and competitive hierarchy research. Geometric mean scoring
 * with Q=0.30, D=0.40, P=0.30.
 *
 * KEY SOURCES:
 * - Yale Appliance 2026 service rate data (33,190 real service calls)
 * - Reviewed.com lab cleaning scores (AHAM/IEC protocols)
 * - EPA ENERGY STAR certified product database
 * - StarCraft equivalent: Yale Appliance (Pool S for dishwashers)
 *
 * Usage: node score_dishwashers_calibration.js
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
    name: 'Miele G7000 Series',
    slug: 'miele_g7000',
    target: 95,
    tier: 'Tier 1',

    specs: {
      // Quality
      tub_material: 'stainless_steel',         // adj: +1
      motor_type: 'brushless_inverter',        // adj: +1
      filter_type: 'manual_mesh',              // adj: +1
      spray_arm_architecture: '3_full_arms',   // adj: +1 (top, middle, bottom — dedicated upper arm)
      third_rack: 'flat_tray',                 // adj: 0 (3D fold-down cutlery tray — functional but no wash jets)
      rack_adjustability: 'loaded_adjustable', // adj: +1 (only brand with middle rack adjustable while loaded)

      // Performance
      noise_dba: 42,                           // adj: +1 (42-44 dBA range, Extra Quiet mode to 37)
      drying_technology: 'fan_plus_auto_open', // adj: +1 (CleanDry fan + AutoOpen door)
      energy_kwh_year: 205,                    // adj: +1 (~200-210 kWh)
      water_gal_per_cycle: 3.0,               // adj: 0 (within 2.9-3.2 range)

      // Durability
      yale_service_rate_pct: 5.6,             // adj: +2 (best in category, 2026 data)
      manufacturer_design_life_years: 20,      // adj: +1 (5,600 cycles tested)
      warranty_years: 2,                       // adj: +1 (standard; 5-year on top models)
      service_network_coverage: 'regional_or_limited', // adj: 0 (limited independent service centers in US)
      parts_availability: 'proprietary_available',     // adj: 0 (proprietary, available but expensive, 90-day part warranty)

      // Material Safety (report only)
      nsf_ansi_184_certified: true,
      ul_749_compliant: true,
      tub_material_food_grade: true,
    },

    // Quality adj: +1+1+1+1+0+1 = +5
    // Performance adj: +1+1+1+0 = +3
    // Durability adj: +2+1+1+0+0 = +4
    spec_adj: { quality: 5, performance: 3, durability: 4, total: 12, capped_total: 8 },

    axis_scores: { quality: 9.6, durability: 9.4, performance: 9.5 },

    notes: [
      'Best-in-category service rate: 5.6% (Yale 2026, down from 20.5% in 2020)',
      'Only brand testing to 20-year design life (5,600 wash cycles)',
      'Vertically integrated German manufacturing — controls tolerances across full supply chain',
      '3 full independent spray arms — dedicated top arm over upper rack',
      'Only brand with middle rack adjustable while loaded',
      '3D fold-down cutlery tray creates clearance for tall items on second rack',
      'AutoDos with PowerDisk: precision detergent dispensing eliminates common user-error failure mode',
      'CleanDry fan-assisted + AutoOpen drying — excellent for ceramics/glass, Bosch beats on plastics',
      'WEAKNESS: Proprietary parts, expensive repairs, 90-day part warranty after repair',
      'WEAKNESS: Historical volatility — 20.5% service rate in 2020, likely bad component generation',
      'WEAKNESS: 2-year standard US warranty undercuts 20-year design life claim (5-year on top models)',
    ],

    report_fields: {
      corporate_parent: 'Miele & Cie. KG — family-owned (Gütersloh, Germany). 4th generation.',
      outlook: 'Strong',
    },
  },

  {
    name: 'Bosch 800 Series',
    slug: 'bosch_800',
    target: 91,
    tier: 'Tier 1',

    specs: {
      // Quality
      tub_material: 'stainless_steel',         // adj: +1
      motor_type: 'brushless_inverter',        // adj: +1
      filter_type: 'manual_mesh',              // adj: +1
      spray_arm_architecture: '2_arms_plus_sprinkler', // adj: 0
      third_rack: 'flat_tray',                 // adj: 0 (MyWay flexible utensil tray)
      rack_adjustability: 'multi_position',    // adj: 0 (RackMatic 6 configurations)

      // Performance
      noise_dba: 42,                           // adj: +1
      drying_technology: 'zeolite',            // adj: +2 (CrystalDry — best for plastics)
      energy_kwh_year: 199,                    // adj: +1
      water_gal_per_cycle: 3.15,              // adj: 0

      // Durability
      yale_service_rate_pct: 7.8,             // adj: +1
      manufacturer_design_life_years: 10,      // adj: 0 (7-10 year documented)
      warranty_years: 1,                       // adj: 0
      service_network_coverage: 'national_independent_widely_stocked', // adj: +1
      parts_availability: 'widely_stocked',    // adj: 0 (every independent tech works on Bosch)

      // Material Safety (report only)
      nsf_ansi_184_certified: true,
      ul_749_compliant: true,
      tub_material_food_grade: true,
    },

    // Quality adj: +1+1+1+0+0+0 = +3
    // Performance adj: +1+2+1+0 = +4
    // Durability adj: +1+0+0+1+0 = +2
    spec_adj: { quality: 3, performance: 4, durability: 2, total: 9, capped_total: 8 },

    axis_scores: { quality: 9.0, durability: 9.2, performance: 9.1 },

    notes: [
      'CrystalDry zeolite drying: volcanic mineral absorbs moisture, releases heat to 176°F — measurably best for plastics',
      'Yale 2026 service rate 7.8% — consistent, improving trend (was 10.4% in 2018)',
      'BSH platform (New Bern, NC factory since 1997). Shares platform with Thermador and Gaggenau.',
      'PowerControl spray arm for targeted cleaning of heavily soiled items',
      'Reviewed.com: 99.97% soil removal on Heavy cycle — near-perfect cleaning',
      'RackMatic: 3 positions × 2 heights = 6 rack configurations',
      'Manual mesh filter — quieter operation, requires periodic user maintenance',
      'STRENGTH: Universal parts + every independent tech works on them = best serviceability ecosystem',
      'Steve Sheinkopf/Yale: "If you care about plastics drying, get the 800. If you just need a great dishwasher, the 500 is the better value."',
      'CAVEAT: Reddit 2025 threads report control board issues on 2023-2024 production runs — monitor',
    ],

    report_fields: {
      corporate_parent: 'BSH Home Appliances (Bosch und Siemens Hausgeräte). Robert Bosch GmbH subsidiary.',
      bsh_platform_disclosure: 'Bosch, Thermador, and Gaggenau dishwashers share the same BSH platform. Service rate spread across all three brands is 0.4% (7.7-8.1%). Price differences reflect features and finishes, not structural differences.',
      outlook: 'Strong',
    },
  },

  {
    name: 'KitchenAid Premium (M-series)',
    slug: 'kitchenaid_premium',
    target: 83,
    tier: 'Tier 2',

    specs: {
      // Quality
      tub_material: 'stainless_steel',         // adj: +1
      motor_type: 'brushless_inverter',        // adj: +1
      filter_type: 'manual_mesh',              // adj: +1 (two-stage manual filter on premium)
      spray_arm_architecture: '2_arms_plus_sprinkler', // adj: 0 (4 levels of wash action, but architecturally 2 arms + dedicated second-rack jets)
      third_rack: 'with_wash_jets',            // adj: +1 (360° Max Jets — largest third rack, rotating wash jets, unique feature)
      rack_adjustability: 'multi_position',    // adj: 0

      // Performance
      noise_dba: 44,                           // adj: +1
      drying_technology: 'fan_plus_auto_open', // adj: +1 (ProDry fan-assisted)
      energy_kwh_year: 220,                    // adj: 0 (within 211-240 range)
      water_gal_per_cycle: 3.1,               // adj: 0

      // Durability
      yale_service_rate_pct: 8.2,             // adj: +1
      manufacturer_design_life_years: null,    // adj: 0 (not published — skip per scoring rule)
      warranty_years: 1,                       // adj: 0
      service_network_coverage: 'national_independent_widely_stocked', // adj: +1 (Whirlpool service network — broadest in US)
      parts_availability: 'widely_stocked',    // adj: 0 (most widely stocked parts supply chain in US via Whirlpool)

      // Material Safety (report only)
      nsf_ansi_184_certified: true,
      ul_749_compliant: true,
      tub_material_food_grade: true,
    },

    // Quality adj: +1+1+1+0+1+0 = +4
    // Performance adj: +1+1+0+0 = +2
    // Durability adj: +1+0+0+1+0 = +2
    spec_adj: { quality: 4, performance: 2, durability: 2, total: 8, capped_total: 8 },

    axis_scores: { quality: 8.2, durability: 8.4, performance: 8.3 },

    notes: [
      'Largest third rack in category with 360° Max Jets — rotating wash jets in the rack (unique among brands)',
      '4 levels of wash action: second rack gets dedicated jet coverage',
      'Yale 2026 service rate 8.2% (was 7.4% in 2025 — slight increase but still in safe range)',
      'Whirlpool platform — broadest US parts supply chain, every local supply house stocks parts',
      'Repair techs rate alongside Bosch as the two "safe buy" brands for US repairability',
      'ProDry fan-assisted drying — good for ceramics/glass, behind Bosch zeolite on plastics',
      'Two-stage manual filter on premium models — finer filtration than standard',
      'Better maximum loading flexibility than Bosch; Bosch better on quiet operation and plastic drying',
      'No published design life — cannot score that field (skip per scoring rule)',
    ],

    report_fields: {
      corporate_parent: 'KitchenAid — brand of Whirlpool Corporation',
      platform_disclosure: 'KitchenAid uses Whirlpool manufacturing platform. Whirlpool standard models share the underlying platform at lower specs.',
      outlook: 'Stable',
    },
  },

  {
    name: 'Bosch 300 Series',
    slug: 'bosch_300',
    target: 70,
    tier: 'Tier 3',

    specs: {
      // Quality
      tub_material: 'stainless_steel',         // adj: +1 (full stainless on 300+)
      motor_type: 'brushless_inverter',        // adj: +1
      filter_type: 'manual_mesh',              // adj: +1
      spray_arm_architecture: '2_arms_plus_sprinkler', // adj: 0
      third_rack: 'flat_tray',                 // adj: 0 (basic silverware tray)
      rack_adjustability: 'multi_position',    // adj: 0 (basic height adjustment, less than 800 RackMatic)

      // Performance
      noise_dba: 46,                           // adj: 0 (45-50 range)
      drying_technology: 'auto_open',          // adj: 0 (AutoAir — door pops open, NOT zeolite)
      energy_kwh_year: 235,                    // adj: 0
      water_gal_per_cycle: 3.2,               // adj: 0

      // Durability
      yale_service_rate_pct: 7.8,             // adj: +1 (same BSH platform reliability)
      manufacturer_design_life_years: 10,      // adj: 0
      warranty_years: 1,                       // adj: 0
      service_network_coverage: 'national_independent_widely_stocked', // adj: +1
      parts_availability: 'widely_stocked',    // adj: 0

      // Material Safety (report only)
      nsf_ansi_184_certified: true,
      ul_749_compliant: true,
      tub_material_food_grade: true,
    },

    // Quality adj: +1+1+1+0+0+0 = +3
    // Performance adj: 0+0+0+0 = 0
    // Durability adj: +1+0+0+1+0 = +2
    spec_adj: { quality: 3, performance: 0, durability: 2, total: 5, capped_total: 5 },

    axis_scores: { quality: 7.2, durability: 6.9, performance: 7.0 },

    notes: [
      'Same BSH platform as 800 — cleaning performance nearly identical per Yale',
      'Full stainless tub — this is where Bosch separates from builder-grade',
      'AutoAir drying (door pops open) — NOT zeolite. Adequate for ceramics, weak on plastics.',
      '46 dBA — audible in open-concept kitchen, below the quiet threshold',
      'Basic third rack — silverware tray only, no wash jets, less adjustable than 500/800',
      'The premium from 300→800 buys: drying technology, noise reduction, rack flexibility. NOT cleaning.',
      'Professional quality floor: Bosch 500 at ~$900-1,000 most-cited by pros. 300 at ~$700-800 sits just below.',
      'Yale/Steve Sheinkopf: "If you just need a great dishwasher, the 500 is the better value" — 300 is the entry to that value range',
    ],

    report_fields: {
      corporate_parent: 'BSH Home Appliances (Robert Bosch GmbH)',
      bsh_platform_disclosure: 'Same BSH platform as Bosch 800, Benchmark, Thermador, and Gaggenau. Service rate spread across all BSH brands: 0.4%.',
      outlook: 'Strong',
    },
  },

  {
    name: 'Whirlpool (standard)',
    slug: 'whirlpool_standard',
    target: 57,
    tier: 'Tier 4',

    specs: {
      // Quality
      tub_material: 'plastic',                 // adj: -2 (standard Whirlpool uses plastic tub)
      motor_type: 'induction',                 // adj: 0 (mid-tier motor)
      filter_type: 'grinder',                  // adj: -1 (self-cleaning with grinder — louder, zero maintenance)
      spray_arm_architecture: '2_arms',        // adj: -1
      third_rack: 'none',                      // adj: -1 (standard Whirlpool, no third rack)
      rack_adjustability: 'fixed',             // adj: -1

      // Performance
      noise_dba: 53,                           // adj: -1 (audible range)
      drying_technology: 'heated_element',     // adj: -2 (resistance coil, energy-intensive)
      energy_kwh_year: 240,                    // adj: 0 (at ENERGY STAR threshold)
      water_gal_per_cycle: 3.5,               // adj: -1

      // Durability
      yale_service_rate_pct: null,             // adj: 0 (not in Yale dataset — skip)
      manufacturer_design_life_years: 10,      // adj: 0
      warranty_years: 1,                       // adj: 0
      service_network_coverage: 'national_independent_widely_stocked', // adj: +1 (Whirlpool = broadest service network)
      parts_availability: 'universal',         // adj: +1 (most widely stocked parts in entire US appliance industry)

      // Material Safety (report only)
      nsf_ansi_184_certified: false,
      ul_749_compliant: true,
      tub_material_food_grade: false,          // plastic, BPA-free claimed but not independently certified
    },

    // Quality adj: -2+0-1-1-1-1 = -6
    // Performance adj: -1-2+0-1 = -4
    // Durability adj: 0+0+0+1+1 = +2
    spec_adj: { quality: -6, performance: -4, durability: 2, total: -8, capped_total: -8 },

    axis_scores: { quality: 5.8, durability: 5.7, performance: 5.6 },

    notes: [
      'Not in Yale dataset — Yale is premium-focused, sells negligible Whirlpool volume',
      'Repair tech consensus: acceptable, not great. Simplest mechanical designs with fewer failure points.',
      'STRENGTH: Most widely stocked parts in US appliance industry. Broadest service network.',
      'Most likely failure (drain pump) is cheap and easy to fix — repair techs cite this consistently',
      'Plastic tub — louder, less heat retention for drying, can absorb odors over time',
      'Heated element drying — energy-intensive, works but behind all premium drying technologies',
      'Self-cleaning grinder filter — zero maintenance but louder and less effective than manual mesh',
      'No third rack, fixed racks — minimal loading flexibility',
      'Cleaning and drying performance solidly average',
      'At similar price points, repair techs recommend Bosch 300/500 over Whirlpool',
    ],

    report_fields: {
      corporate_parent: 'Whirlpool Corporation',
      platform_disclosure: 'KitchenAid uses the same Whirlpool platform at higher specs.',
      outlook: 'Stable',
    },
  },

  {
    name: 'Samsung (mid-range)',
    slug: 'samsung_mid',
    target: 44,
    tier: 'Tier 4',

    specs: {
      // Quality
      tub_material: 'stainless_steel',         // adj: +1 (Samsung mid-range uses stainless)
      motor_type: 'brushless_inverter',        // adj: +1
      filter_type: 'self_cleaning_mesh',       // adj: 0
      spray_arm_architecture: '2_arms_plus_sprinkler', // adj: 0
      third_rack: 'flat_tray',                 // adj: 0
      rack_adjustability: 'multi_position',    // adj: 0

      // Performance
      noise_dba: 44,                           // adj: +1 (Samsung specs competitive on paper)
      drying_technology: 'auto_open',          // adj: 0 (AutoRelease door)
      energy_kwh_year: 225,                    // adj: 0
      water_gal_per_cycle: 3.1,               // adj: 0

      // Durability — where Samsung collapses
      yale_service_rate_pct: null,             // adj: 0 (not in Yale dataset)
      manufacturer_design_life_years: null,    // adj: 0 (not published)
      warranty_years: 1,                       // adj: 0
      service_network_coverage: 'proprietary_limited_service', // adj: -2 (few authorized independent service centers nationally)
      parts_availability: 'proprietary_limited', // adj: -2 (proprietary parts, owners in many markets cannot get repairs)

      // Material Safety (report only)
      nsf_ansi_184_certified: false,
      ul_749_compliant: true,
      tub_material_food_grade: true,
    },

    // Quality adj: +1+1+0+0+0+0 = +2
    // Performance adj: +1+0+0+0 = +1
    // Durability adj: 0+0+0-2-2 = -4
    spec_adj: { quality: 2, performance: 1, durability: -4, total: -1, capped_total: -1 },

    axis_scores: { quality: 4.4, durability: 4.2, performance: 4.8 },

    notes: [
      'Hardest "no" in the category — unanimous across repair techs, Yale, independent retailers, owner forums',
      'NOT in Yale dataset — Yale premium-focused, does not sell Samsung in volume',
      'Independent repair analysis: 20-22% failure rate within first 5 years',
      'PRIMARY PROBLEM: Service ecosystem. Proprietary parts + few authorized independent service centers.',
      'Owners in many US markets literally cannot get their Samsung dishwasher repaired',
      'Specific failure modes: water-wall belt mechanism, rack degradation (tray dissolving, racks bending), frequent error codes, higher leak incidence',
      'Scores BELOW Whirlpool despite better paper specs because serviceability is catastrophic',
      'Whirlpool plastic tub with universal parts > Samsung stainless tub with no repair path',
      'Samsung Quality axis (4.6) docked severely despite decent components because parts ecosystem makes quality meaningless if you cannot maintain the product',
      'This product is the clearest example of where service ecosystem IS the score',
    ],

    report_fields: {
      corporate_parent: 'Samsung Electronics Co., Ltd.',
      outlook: 'Conditional',
    },
  },
];

// ─── Score All Products ────────────────────────────────────────────────────────

function scoreProduct(product) {
  const { quality, durability, performance } = product.axis_scores;
  const overall = geoMean(quality, durability, performance);
  const display = Math.round(overall * 10);
  const delta = display - product.target;
  const label = getLabel(display);
  return { overall, display, delta, label };
}

// ─── Main ──────────────────────────────────────────────────────────────────────

function main() {
  console.log('\n' + '='.repeat(60));
  console.log('DISHWASHER CALIBRATION SCORING RUN — v1');
  console.log('='.repeat(60));
  console.log('Weights: Q=0.30, D=0.40, P=0.30');
  console.log('Method: Geometric mean, no axis stretch (v1.0)');
  console.log('');

  let allPass = true;
  for (const product of CALIBRATION_PRODUCTS) {
    const result = scoreProduct(product);
    const pass = result.delta === 0;
    const flag = pass ? '✓' : Math.abs(result.delta) <= 1 ? '~' : '✗';
    if (!pass) allPass = false;
    console.log(`${flag} ${product.name.padEnd(32)} | Q:${product.axis_scores.quality} D:${product.axis_scores.durability} P:${product.axis_scores.performance} | ${result.display} (target ${product.target}, delta ${result.delta >= 0 ? '+' : ''}${result.delta}) | ${result.label}`);
  }

  console.log('');
  console.log(allPass ? '✓ ALL TARGETS HIT EXACTLY' : '~ See deltas above — adjust axis scores');
  console.log('');
}

main();
