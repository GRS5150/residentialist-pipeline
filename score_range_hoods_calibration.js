#!/usr/bin/env node
/**
 * Range Hood Calibration Scoring — v1
 *
 * Key category decisions:
 * 1. Performance dominant (P=0.45) — CFM and sone rating create massive spread
 * 2. Vent-A-Hood Magic Lung centrifugal blower = heritage benchmark
 * 3. BSH platform sharing likely for Thermador/Bosch hoods
 * 4. Pool S vacant — no single dominant independent hood reviewer
 * 5. HVI certification = independent CFM/sone verification
 *
 * Products: 6 spanning Tier 1–4
 * Weights: Q=0.30, D=0.25, P=0.45
 * Method: Geometric mean, no axis stretch
 *
 * Usage: /usr/local/bin/node score_range_hoods_calibration.js
 */

// ─── Weights & Tier Ranges ─────────────────────────────────────────────────────

const WEIGHTS = { quality: 0.30, durability: 0.25, performance: 0.45 };

function geoMean(q, d, p) {
  const qn = Math.max(q, 0.01) / 10;
  const dn = Math.max(d, 0.01) / 10;
  const pn = Math.max(p, 0.01) / 10;
  return Math.pow(qn, WEIGHTS.quality) * Math.pow(dn, WEIGHTS.durability) * Math.pow(pn, WEIGHTS.performance) * 10;
}

function getLabel(score) {
  if (score >= 90) return 'Best in Class';
  if (score >= 75) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Below Standard';
}

// ─── Calibration Products ──────────────────────────────────────────────────────

const CALIBRATION_PRODUCTS = [
  {
    name: 'Vent-A-Hood PRH Series',
    slug: 'vent_a_hood_prh',
    target: 95,
    tier: 'Tier 1',

    specs: {
      // Quality
      body_material: '304_stainless_steel',           // +2
      filter_type: 'centrifugal_capture_no_filter',   // +2 (Magic Lung — grease captured by centrifugal force)
      construction_method: 'welded_seamless',          // +1
      lighting_quality: 'led_dimmable_high_output',    // +1
      blower_engineering: 'centrifugal_sealed_ball_bearing', // +2
      source_traceability: 'single_source_manufacturing',   // +1 (Houston TX since 1933)

      // Performance
      cfm_airflow_max: 600,                            // +1 (600-899 range)
      sone_rating_at_max: 3.0,                         // +1 (2.1-4.0 range — remarkable for internal blower)
      capture_area_coverage: 'oversized_6plus_inches',  // +1
      duct_size_inches: 10,                             // +1
      speed_control: 'variable_infinite',               // +1
      external_blower_option: 'not_available',          // 0 (internal blower is the product philosophy)

      // Durability
      motor_warranty_years: 'lifetime',                 // +2
      motor_type_longevity: 'centrifugal_sealed_ball_bearing', // +1 (30+ year documented service life)
      grease_management_system: 'self_cleaning_centrifugal',   // +2
      parts_availability: 'proprietary_available',       // 0 (direct from Houston factory)
      service_network_coverage: 'factory_certified_network',   // 0
    },

    spec_adj: { quality: 9, performance: 5, durability: 5, total: 19, capped_total: 8 },
    axis_scores: { quality: 9.7, durability: 9.2, performance: 9.6 },

    notes: [
      'Heritage brand — founded 1933 in Houston TX, still family-operated, still USA-manufactured',
      'Patented Magic Lung centrifugal blower captures grease BEFORE it reaches the fan',
      'Blower stays clean — documented 30+ year service life per owner reports',
      'No traditional filters required — grease collects in removable tray',
      'Whisper-quiet: ~3 sones at 600 CFM (internal blower) — competitive with external blower setups',
      'All 304 stainless steel construction, welded seamless',
      'Lifetime motor warranty — strongest in category',
      'STRENGTH: The only hood where the blower self-cleans — fundamentally different architecture',
      'STRENGTH: USA manufacturing with direct factory support since 1933',
      'WEAKNESS: No external blower option — philosophy is "internal blower done right"',
      'WEAKNESS: Lower max CFM than external-blower-equipped competitors at comparable price',
      'WEAKNESS: Proprietary parts — must go through Vent-A-Hood directly',
    ],

    report_fields: {
      corporate_parent: 'Vent-A-Hood, Ltd. — family-owned (Houston, TX). Founded 1933.',
      outlook: 'Strong',
      manufacturing: 'Houston, Texas. All manufacturing in-house since 1933.',
      heritage: 'Oldest residential range hood manufacturer in the United States. Patented the residential range hood concept.',
    },
  },

  {
    name: 'Wolf Pro Ventilation',
    slug: 'wolf_pro_ventilation',
    target: 91,
    tier: 'Tier 1',

    specs: {
      // Quality
      body_material: '304_stainless_steel',            // +2
      filter_type: 'stainless_steel_baffle',           // +1
      construction_method: 'welded_seamless',          // +1
      lighting_quality: 'led_dimmable_high_output',    // +1
      blower_engineering: 'centrifugal_sealed_ball_bearing', // +2
      source_traceability: 'single_source_manufacturing',   // +1 (Sub-Zero/Wolf ecosystem)

      // Performance
      cfm_airflow_max: 750,                            // +1 (600-899 range)
      sone_rating_at_max: 4.5,                         // 0 (4.1-6.0 range — louder than Vent-A-Hood)
      capture_area_coverage: 'oversized_6plus_inches', // +1
      duct_size_inches: 10,                             // +1
      speed_control: 'variable_infinite',               // +1
      external_blower_option: 'available_remote_or_inline', // +1

      // Durability
      motor_warranty_years: 2,                          // -1 (1-2 range, but 2yr is best-in-class for major appliance standard)
      motor_type_longevity: 'centrifugal_sealed_ball_bearing', // +1
      grease_management_system: 'baffle_dishwasher_safe',     // +1
      parts_availability: 'proprietary_available',       // 0 (Sub-Zero/Wolf parts commitment)
      service_network_coverage: 'factory_certified_network',  // 0
    },

    spec_adj: { quality: 8, performance: 5, durability: 1, total: 14, capped_total: 8 },
    axis_scores: { quality: 9.3, durability: 8.8, performance: 9.1 },

    notes: [
      'Sub-Zero/Wolf ecosystem — factory-certified service network, strong parts commitment',
      'Centrifugal blower with sealed ball bearings — professional grade',
      'Stainless baffle filters — dishwasher safe, effective grease capture',
      '2-year full warranty — matches Wolf range warranty',
      'Dual-blower option on 48" and 60" models for high-BTU Wolf ranges',
      'External blower option available (remote or in-line)',
      'STRENGTH: Designed to pair perfectly with Wolf ranges — CFM-to-BTU matching engineered',
      'STRENGTH: Sub-Zero/Wolf parts commitment and factory-certified service',
      'WEAKNESS: Noisier than Vent-A-Hood at comparable CFM',
      'WEAKNESS: Motor warranty shorter than Vent-A-Hood lifetime warranty',
      'WEAKNESS: Premium pricing for what is technically a strong but not revolutionary blower design',
    ],

    report_fields: {
      corporate_parent: 'Sub-Zero Group, Inc. — privately held (Fitchburg, WI)',
      outlook: 'Strong',
      manufacturing: 'Sub-Zero/Wolf manufacturing ecosystem. Fitchburg, Wisconsin area.',
      wolf_pairing: 'Designed specifically to pair with Wolf ranges. Wolf recommends matching hood-to-range for optimal ventilation.',
    },
  },

  {
    name: 'Zephyr Tempest II',
    slug: 'zephyr_tempest_ii',
    target: 82,
    tier: 'Tier 2',

    specs: {
      // Quality
      body_material: '430_stainless_steel',            // +1
      filter_type: 'stainless_steel_baffle',           // +1
      construction_method: 'welded_standard',          // 0
      lighting_quality: 'led_dimmable_high_output',    // +1
      blower_engineering: 'centrifugal_standard',      // +1
      source_traceability: 'multi_source_identified',  // 0 (designed SF, manufactured China — disclosed)

      // Performance
      cfm_airflow_max: 650,                             // +1 (with internal; up to 1200 with BLB external)
      sone_rating_at_max: 5.0,                          // 0 (4.1-6.0 range with internal blower)
      capture_area_coverage: 'matched_to_cooktop',      // 0
      duct_size_inches: 8,                               // 0
      speed_control: 'multi_speed_4_plus',               // 0
      external_blower_option: 'available_remote_or_inline', // +1 (BLB series — key differentiator)

      // Durability
      motor_warranty_years: 3,                           // 0 (3-4 range)
      motor_type_longevity: 'centrifugal_standard',      // not sealed ball bearing
      grease_management_system: 'baffle_dishwasher_safe', // +1
      parts_availability: 'proprietary_available',       // 0
      service_network_coverage: 'regional_or_limited',   // 0
    },

    spec_adj: { quality: 4, performance: 2, durability: 1, total: 7, capped_total: 7 },
    axis_scores: { quality: 8.2, durability: 8.0, performance: 8.3 },

    notes: [
      'San Francisco-based — appeared 26 times in luxury listings (strong market presence)',
      'External blower option (BLB series) is the key differentiator — 1200+ CFM with sub-1-sone hood noise',
      'Stainless baffle filters — dishwasher safe',
      'Good industrial design — clean lines, modern aesthetic, popular with designers',
      'Designed in San Francisco, manufactured in China (disclosed and consistent)',
      'STRENGTH: External blower option enables extremely high CFM with near-silent hood operation',
      'STRENGTH: Strong presence in luxury market — designers specify Zephyr regularly',
      'WEAKNESS: Manufactured in China — not comparable to Vent-A-Hood/Wolf USA manufacturing',
      'WEAKNESS: Internal blower noise is mediocre without external blower upgrade',
      'WEAKNESS: Limited service network compared to Broan-NuTone ecosystem',
      'NOTE: Score is for internal blower configuration. External blower combo is a different product per Rule 19.',
    ],

    report_fields: {
      corporate_parent: 'Zephyr Ventilation — privately held (San Francisco, CA)',
      outlook: 'Stable',
      manufacturing: 'Designed in San Francisco, CA. Manufactured in China.',
      luxury_presence: '26 sightings in luxury real estate listings — established in high-end residential market.',
    },
  },

  {
    name: 'Thermador HPCN Series',
    slug: 'thermador_hpcn',
    target: 76,
    tier: 'Tier 2',

    specs: {
      // Quality
      body_material: '430_stainless_steel',            // +1
      filter_type: 'stainless_steel_baffle',           // +1
      construction_method: 'welded_standard',          // 0
      lighting_quality: 'led_fixed',                    // 0
      blower_engineering: 'centrifugal_standard',      // +1
      source_traceability: 'multi_source_identified',  // 0 (BSH multi-factory)

      // Performance
      cfm_airflow_max: 600,                             // +1 (600-899 range)
      sone_rating_at_max: 5.5,                          // 0 (4.1-6.0 range)
      capture_area_coverage: 'matched_to_cooktop',      // 0
      duct_size_inches: 8,                               // 0
      speed_control: 'multi_speed_4_plus',               // 0
      external_blower_option: 'available_remote_or_inline', // +1

      // Durability
      motor_warranty_years: 1,                           // -1 (1-2 range)
      motor_type_longevity: 'centrifugal_standard',      // not sealed ball bearing
      grease_management_system: 'baffle_dishwasher_safe', // +1
      parts_availability: 'widely_stocked',              // 0 (BSH parts widely available)
      service_network_coverage: 'national_independent_widely_serviced', // +1 (BSH service network)
    },

    spec_adj: { quality: 3, performance: 2, durability: 0, total: 5, capped_total: 5 },
    axis_scores: { quality: 7.8, durability: 7.5, performance: 7.6 },

    notes: [
      'BSH platform — Thermador hoods likely share blower components with Bosch hoods',
      'Integrated with Thermador cooking products — range matching guide provided',
      'Stainless baffle filters — dishwasher safe',
      'BSH parts widely stocked through independent service network',
      'PLATFORM DISCLOSURE: BSH platform sharing likely with Bosch hoods — deep dive must confirm',
      'STRENGTH: BSH service ecosystem is strong — parts widely available, independent techs familiar',
      'STRENGTH: External blower option available for noise-sensitive installations',
      'WEAKNESS: No distinguishing blower technology — standard centrifugal',
      'WEAKNESS: Shorter warranty than Wolf/Vent-A-Hood',
      'WEAKNESS: Product exists primarily to complete the Thermador kitchen package, not as ventilation leader',
    ],

    report_fields: {
      corporate_parent: 'BSH Home Appliances (Robert Bosch GmbH)',
      bsh_platform_disclosure: 'Thermador hoods likely share blower and filter components with Bosch hoods. BSH platform sharing confirmed in dishwasher, refrigerator, and wall oven categories.',
      outlook: 'Strong',
      manufacturing: 'BSH multi-factory network.',
    },
  },

  {
    name: 'Broan-NuTone Elite E60E30SS',
    slug: 'broan_elite_e60e',
    target: 64,
    tier: 'Tier 3',

    specs: {
      // Quality
      body_material: '430_stainless_steel',            // +1
      filter_type: 'aluminum_mesh',                     // -1
      construction_method: 'riveted_assembled',        // -1
      lighting_quality: 'led_fixed',                    // 0
      blower_engineering: 'centrifugal_standard',      // +1
      source_traceability: 'multi_source_identified',  // 0 (Nortek, multiple factories)

      // Performance
      cfm_airflow_max: 650,                             // +1 (600-899 range)
      sone_rating_at_max: 5.5,                          // 0 (4.1-6.0 range)
      capture_area_coverage: 'matched_to_cooktop',      // 0
      duct_size_inches: 8,                               // 0
      speed_control: '3_speed',                          // 0
      external_blower_option: 'available_remote_or_inline', // +1

      // Durability
      motor_warranty_years: 1,                           // -1 (1-2 range)
      motor_type_longevity: 'centrifugal_standard',      // not sealed ball bearing
      grease_management_system: 'mesh_washable',          // 0
      parts_availability: 'universal',                    // +1 (available at any hardware store)
      service_network_coverage: 'national_independent_widely_serviced', // +1 (any appliance tech)
    },

    spec_adj: { quality: 0, performance: 2, durability: 0, total: 2, capped_total: 2 },
    axis_scores: { quality: 6.4, durability: 6.4, performance: 6.4 },

    notes: [
      'Broan-NuTone (Nortek) — largest US range hood manufacturer, volume leader',
      'Elite is Broan premium line — stainless body, LED lighting, adequate CFM',
      'Aluminum mesh filters — functional but must be cleaned frequently, not dishwasher-recommended',
      'Riveted construction — grease accumulation at joints',
      'External blower option available',
      'STRENGTH: Universal parts availability — any hardware store, any appliance tech',
      'STRENGTH: 650 CFM is adequate for standard + some pro-style ranges',
      'WEAKNESS: Mesh filters clog faster and are less effective than baffle filters',
      'WEAKNESS: Riveted construction creates grease traps',
      'WEAKNESS: No distinguishing blower technology or build quality premium',
      'NOTE: Broan-NuTone makes more range hoods than anyone in the US — they ARE the market midpoint',
    ],

    report_fields: {
      corporate_parent: 'Nortek, Inc. (Broan-NuTone LLC subsidiary)',
      outlook: 'Stable',
      manufacturing: 'Multiple US factories. Hartford, WI headquarters.',
    },
  },

  {
    name: 'Broan-NuTone F40000 Series',
    slug: 'broan_f40000',
    target: 47,
    tier: 'Tier 4',

    specs: {
      // Quality
      body_material: 'painted_steel',                   // 0
      filter_type: 'aluminum_mesh',                     // -1
      construction_method: 'riveted_assembled',        // -1
      lighting_quality: 'incandescent',                 // -1
      blower_engineering: 'axial_fan',                  // -1
      source_traceability: 'multi_source_identified',  // 0

      // Performance
      cfm_airflow_max: 210,                             // -1 (200-399 range)
      sone_rating_at_max: 6.5,                           // -1 (6.1-8.0 range)
      capture_area_coverage: 'undersized_narrower_than_cooktop', // -1 (30" over 30" = no overhang)
      duct_size_inches: 6,                               // 0
      speed_control: '2_speed_or_single',               // -1
      external_blower_option: 'not_available',          // 0

      // Durability
      motor_warranty_years: 1,                           // -1 (1-2 range)
      motor_type_longevity: 'axial_standard',            // -1
      grease_management_system: 'mesh_washable',          // 0
      parts_availability: 'universal',                    // +1 (available everywhere)
      service_network_coverage: 'national_independent_widely_serviced', // +1
    },

    spec_adj: { quality: -4, performance: -4, durability: -1, total: -9, capped_total: -8 },
    axis_scores: { quality: 4.9, durability: 4.6, performance: 4.7 },

    notes: [
      'Builder-grade floor — the hood installed in every tract home in America',
      '210 CFM cannot adequately ventilate even a standard 30-inch range at high heat',
      '6.5 sones at max = loud enough to prevent use during conversation',
      'Axial fan — cheaper, louder, less efficient, shorter life than centrifugal',
      'Incandescent lighting — short bulb life, adds heat, 40W max',
      'Painted steel body — will chip and discolor in high-heat/grease environment',
      'Aluminum mesh filters that clog rapidly',
      '~$60 retail — the cheapest hood a builder can specify',
      'STRENGTH: Universal parts availability — $15 replacement filters, $25 replacement motors',
      'STRENGTH: Simple enough that anyone can install and service',
      'WEAKNESS: 210 CFM physically cannot clear cooking fumes from any serious cooking',
      'WEAKNESS: 6.5 sones discourages actual use — homeowners turn it off',
      'WEAKNESS: Painted steel body degrades in kitchen environment',
      'NOTE: This IS the American builder-grade baseline. Vent-A-Hood PRH costs 15-20x more.',
    ],

    report_fields: {
      corporate_parent: 'Nortek, Inc. (Broan-NuTone LLC subsidiary)',
      outlook: 'Stable',
      manufacturing: 'Multiple factories. Same parent as Broan Elite.',
      builder_context: '~$60 retail. The de facto national builder standard for range ventilation.',
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
  console.log('\n' + '='.repeat(70));
  console.log('RANGE HOOD CALIBRATION SCORING RUN — v1');
  console.log('='.repeat(70));
  console.log('Weights: Q=0.30, D=0.25, P=0.45');
  console.log('Method: Geometric mean, no axis stretch');
  console.log('Performance dominant — CFM/sone spread is the primary differentiator');
  console.log('');

  let allPass = true;
  for (const product of CALIBRATION_PRODUCTS) {
    const result = scoreProduct(product);
    const pass = result.delta === 0;
    const flag = pass ? '✓' : Math.abs(result.delta) <= 1 ? '~' : '✗';
    if (!pass) allPass = false;
    console.log(`${flag} ${product.name.padEnd(36)} | Q:${product.axis_scores.quality} D:${product.axis_scores.durability} P:${product.axis_scores.performance} | ${result.display} (target ${product.target}, delta ${result.delta >= 0 ? '+' : ''}${result.delta}) | ${product.tier} | ${result.label}`);
  }

  console.log('');
  console.log(allPass ? '✓ ALL TARGETS HIT EXACTLY' : '~ See deltas above — adjust axis scores');
  console.log('');
  console.log('─'.repeat(70));
  console.log('KEY CATEGORY DECISIONS:');
  console.log('  Performance dominant (P=0.45): CFM spans 210-1200+, sones span 0.5-8+');
  console.log('  Pool S: VACANT — no dominant independent hood reviewer');
  console.log('  Heritage brand: Vent-A-Hood (Houston TX, 1933, Magic Lung centrifugal)');
  console.log('  BSH platform sharing: Thermador/Bosch hoods (confirm in deep dive)');
  console.log('  Zephyr: 26x in luxury listings, external blower differentiator');
  console.log('');
}

main();
