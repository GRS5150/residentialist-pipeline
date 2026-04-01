#!/usr/bin/env node
/**
 * Ranges & Cooktops Calibration Scoring — v1 (Pre Deep Dive)
 *
 * 7 calibration products: 3 gas, 2 induction, 2 mixed-tier
 * Weights: Q=0.30, D=0.35, P=0.35
 * Method: Geometric mean, no axis stretch
 *
 * Usage: /usr/local/bin/node score_ranges_cooktops_calibration.js
 */

const WEIGHTS = { quality: 0.30, durability: 0.35, performance: 0.35 };

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

const CALIBRATION_PRODUCTS = [
  {
    name: 'Wolf Pro-Style Gas Range (36"/48")',
    slug: 'wolf_gas_range',
    target: 94,
    tier: 'Tier 1',
    specs: {
      fuel_type: 'gas_pro_style',
      burner_type_gas: 'dual_stacked_sealed',
      grate_material_gas: 'continuous_cast_iron_heavy',
      oven_convection_system: 'dual_fan_true_european',
      source_traceability: 'single_source_manufacturing',
      max_burner_btu_gas: 20000,
      simmer_min_btu_gas: 500,
      oven_temp_uniformity_delta_f: 5,
      broiler_type: 'infrared',
      boil_time_water_test: 'good',
      warranty_years_full: 2,
      service_network_coverage: 'factory_certified_network',
      parts_availability: 'proprietary_available',
      control_board_reliability: 'proven_reliable',
      igniter_type_gas: 'silicon_nitride',
    },
    spec_adj: { quality: 7, performance: 6, durability: 4, total: 17, capped_total: 8 },
    axis_scores: { quality: 9.6, durability: 9.2, performance: 9.5 },
    notes: [
      'Tier 1 consensus: Yale, Town Appliance, installer community all rank Wolf at or near top',
      'Dual-stacked sealed burners: 500 BTU simmer to 20K sear — benchmark low-end control',
      'VertiCross dual convection + infrared broiler — pro-grade oven section',
      'Sub-Zero Group build quality, Fitchburg WI manufacturing',
      '2yr full warranty — best in pro-style ranges',
      'STRENGTH: Sealed burners = easier maintenance than open burners (BlueStar)',
      'WEAKNESS: Not in Yale gas range service data, proprietary parts',
    ],
    report_fields: {
      corporate_parent: 'Sub-Zero Group, Inc. — privately held (Fitchburg, WI)',
      outlook: 'Strong',
      manufacturing: 'Fitchburg, Wisconsin',
      cross_category: 'TBD — verify oven section component sharing with Wolf wall oven',
    },
  },

  {
    name: 'BlueStar Platinum Gas Range',
    slug: 'bluestar_platinum',
    target: 91,
    tier: 'Tier 1',
    specs: {
      fuel_type: 'gas_pro_style',
      burner_type_gas: 'open_cast_commercial',
      grate_material_gas: 'continuous_cast_iron_heavy',
      oven_convection_system: 'true_european_single_fan',
      source_traceability: 'single_source_manufacturing',
      max_burner_btu_gas: 25000,
      simmer_min_btu_gas: 750,
      oven_temp_uniformity_delta_f: 8,
      broiler_type: 'infrared',
      boil_time_water_test: 'excellent',
      warranty_years_full: 1,
      service_network_coverage: 'regional_or_limited',
      parts_availability: 'proprietary_available',
      control_board_reliability: 'proven_reliable',
      igniter_type_gas: 'silicon_nitride',
    },
    spec_adj: { quality: 6, performance: 7, durability: 2, total: 15, capped_total: 8 },
    axis_scores: { quality: 9.3, durability: 8.7, performance: 9.4 },
    notes: [
      'Tier 1 for raw power: open burners up to 25K BTU, commercial heritage',
      'Reading, PA manufacturing — single-source US production',
      '1,000+ color customization options',
      'Open burners = higher maintenance but superior high-heat performance and wok cooking',
      'STRENGTH: Highest BTU in residential — 25K benchmark',
      'WEAKNESS: Open burners require more cleaning/maintenance than Wolf sealed',
      'WEAKNESS: 1yr warranty (vs Wolf 2yr), regional service network',
    ],
    report_fields: {
      corporate_parent: 'Prizer Estes (Reading, PA) — privately held',
      outlook: 'Strong',
      manufacturing: 'Reading, Pennsylvania',
    },
  },

  {
    name: 'Thermador Pro Grand Gas Range',
    slug: 'thermador_pro_grand',
    target: 83,
    tier: 'Tier 2',
    specs: {
      fuel_type: 'gas_pro_style',
      burner_type_gas: 'star_burner',
      grate_material_gas: 'continuous_cast_iron_heavy',
      oven_convection_system: 'true_european_single_fan',
      source_traceability: 'multi_source_identified',
      max_burner_btu_gas: 18000,
      simmer_min_btu_gas: 500,
      oven_temp_uniformity_delta_f: 7,
      broiler_type: 'gas_standard',
      boil_time_water_test: 'good',
      warranty_years_full: 1,
      service_network_coverage: 'national_independent_widely_stocked',
      parts_availability: 'widely_stocked',
      control_board_reliability: 'standard',
      igniter_type_gas: 'silicon_carbide',
    },
    spec_adj: { quality: 4, performance: 3, durability: 2, total: 9, capped_total: 8 },
    axis_scores: { quality: 8.5, durability: 8.0, performance: 8.3 },
    notes: [
      'BSH platform — Star burners, ExtraLow simmer, steam-assist oven options',
      'Strong features at lower price than Wolf/BlueStar',
      'BSH parts widely stocked, broad service network',
      'STRENGTH: Most features for the money in pro-style tier',
      'WEAKNESS: Top burner BTU (18K) lower than Wolf (20K) and BlueStar (25K)',
      'PLATFORM DISCLOSURE: BSH shared platform with Bosch and Gaggenau',
    ],
    report_fields: {
      corporate_parent: 'BSH Home Appliances (Robert Bosch GmbH)',
      bsh_platform_disclosure: 'BSH shared platform. Thermador Pro Harmony is a lower tier of the same platform.',
      outlook: 'Strong',
      manufacturing: 'BSH multi-factory',
    },
  },

  {
    name: 'Thermador Freedom Induction Cooktop (36")',
    slug: 'thermador_freedom_induction',
    target: 81,
    tier: 'Tier 2',
    specs: {
      fuel_type: 'induction',
      induction_system: 'full_surface_multi_element',
      oven_convection_system: null,
      source_traceability: 'multi_source_identified',
      induction_max_watts: 4600,
      boil_time_water_test: 'excellent',
      yale_service_rate_pct: 4.9,
      warranty_years_full: 1,
      service_network_coverage: 'national_independent_widely_stocked',
      parts_availability: 'widely_stocked',
      control_board_reliability: 'standard',
    },
    spec_adj: { quality: 3, performance: 4, durability: 1, total: 8, capped_total: 8 },
    axis_scores: { quality: 8.3, durability: 7.8, performance: 8.2 },
    notes: [
      '48 individual 3-inch heating elements — cookware placement anywhere on surface',
      '63% more effective cooking area than fixed-zone induction',
      'Full-surface technology is genuinely differentiated (not rebadged Bosch)',
      'BSH induction service rate: Thermador 4.9%, Bosch 1.7%, Gaggenau 0%',
      'STRENGTH: Most innovative induction in residential market',
      'WEAKNESS: Complex electronics — touchscreen lag documented, early unit failures',
      'WEAKNESS: Cooktop only — no oven section to score',
      'PLATFORM: BSH shares some induction components with Bosch, but Freedom hardware is unique',
    ],
    report_fields: {
      corporate_parent: 'BSH Home Appliances (Robert Bosch GmbH)',
      outlook: 'Strong',
      manufacturing: 'BSH production (E.G.O. coils, Infineon IGBTs, Schott CERAN glass)',
    },
  },

  {
    name: 'Bosch 800 Induction Cooktop (36")',
    slug: 'bosch_800_induction',
    target: 70,
    tier: 'Tier 3',
    specs: {
      fuel_type: 'induction',
      induction_system: 'flex_zone_bridgeable',
      oven_convection_system: null,
      source_traceability: 'multi_source_identified',
      induction_max_watts: 3700,
      boil_time_water_test: 'good',
      yale_service_rate_pct: 1.7,
      warranty_years_full: 1,
      service_network_coverage: 'national_independent_widely_stocked',
      parts_availability: 'widely_stocked',
      control_board_reliability: 'proven_reliable',
    },
    spec_adj: { quality: 2, performance: 1, durability: 4, total: 7, capped_total: 7 },
    axis_scores: { quality: 7.0, durability: 7.2, performance: 6.8 },
    notes: [
      'BSH platform — shares core components (power boards, IGBTs) with Thermador',
      'Yale induction service rate 1.7% — BEST in induction category',
      'FlexInduction zones allow bridging for large cookware',
      'STRENGTH: Most reliable induction cooktop per Yale data',
      'STRENGTH: BSH parts universally stocked, every independent tech works on BSH',
      'WEAKNESS: No full-surface innovation (that\'s Thermador Freedom)',
      'WEAKNESS: 3700W max — standard, not top-tier power',
      'PLATFORM: Shares BSH induction platform with Thermador (core electronics)',
    ],
    report_fields: {
      corporate_parent: 'BSH Home Appliances (Robert Bosch GmbH)',
      bsh_platform_disclosure: 'Bosch 800 shares BSH induction platform core components with Thermador and Gaggenau. Thermador Freedom has unique full-surface hardware.',
      outlook: 'Strong',
      manufacturing: 'BSH production',
    },
  },

  {
    name: 'GE Café Gas Slide-In Range',
    slug: 'ge_cafe_gas',
    target: 64,
    tier: 'Tier 3',
    specs: {
      fuel_type: 'gas_standard',
      burner_type_gas: 'sealed_standard',
      grate_material_gas: 'individual_cast_iron',
      oven_convection_system: 'true_european_single_fan',
      source_traceability: 'multi_source_identified',
      max_burner_btu_gas: 18000,
      simmer_min_btu_gas: 1000,
      oven_temp_uniformity_delta_f: 10,
      broiler_type: 'gas_standard',
      boil_time_water_test: 'good',
      yale_service_rate_pct: 11.7,
      warranty_years_full: 1,
      service_network_coverage: 'national_owned',
      parts_availability: 'universal',
      control_board_reliability: 'standard',
      igniter_type_gas: 'silicon_carbide',
    },
    spec_adj: { quality: 1, performance: 0, durability: 1, total: 2, capped_total: 2 },
    axis_scores: { quality: 6.4, durability: 6.4, performance: 6.4 },
    notes: [
      'Yale gas range service rate 11.7% — above 6.9% category average',
      'Surprising: base GE (4.8%) is MORE reliable than Café (11.7%)',
      'GE owned national service network = strongest service ecosystem',
      'Selmer TN platform shared with Monogram/Profile/GE base',
      'STRENGTH: Best service ecosystem — owned network, universal parts',
      'WEAKNESS: 11.7% service rate is concerning for a "premium" brand',
      'WEAKNESS: Standard sealed burners, no pro-style differentiation',
      'PLATFORM DISCLOSURE: GE Café shares platform with Monogram, Profile, GE base',
    ],
    report_fields: {
      corporate_parent: 'GE Appliances (Haier Group subsidiary since 2016)',
      ge_platform_disclosure: 'Monogram, Café, Profile, GE base share Selmer, TN factory platform.',
      outlook: 'Stable',
      manufacturing: 'Selmer, Tennessee',
    },
  },

  {
    name: 'Samsung Gas Slide-In Range',
    slug: 'samsung_gas',
    target: 45,
    tier: 'Tier 4',
    specs: {
      fuel_type: 'gas_standard',
      burner_type_gas: 'sealed_standard',
      grate_material_gas: 'individual_cast_iron',
      oven_convection_system: 'fan_assisted',
      source_traceability: 'multi_source_identified',
      max_burner_btu_gas: 18000,
      simmer_min_btu_gas: 1200,
      oven_temp_uniformity_delta_f: 15,
      broiler_type: 'gas_standard',
      boil_time_water_test: 'fair',
      yale_service_rate_pct: null,
      warranty_years_full: 1,
      service_network_coverage: 'proprietary_limited_service',
      parts_availability: 'proprietary_available',
      control_board_reliability: 'pattern_failures',
      igniter_type_gas: 'silicon_carbide',
    },
    spec_adj: { quality: -1, performance: -2, durability: -5, total: -8, capped_total: -8 },
    axis_scores: { quality: 4.6, durability: 4.2, performance: 4.6 },
    notes: [
      'Cross-category service ecosystem problems carry over from dishwashers, refrigerators, wall ovens',
      'Control board pattern failures documented across Samsung appliance categories',
      'Samsung range recall: 1.1M units for fire hazard (CPSC 2024) — cross-category safety signal',
      'STRENGTH: Features (WiFi, Air Fry, smart connectivity)',
      'STRENGTH: Parts available at RepairClinic — technician availability is the real gap',
      'WEAKNESS: Service ecosystem catastrophic — contracted network, thin coverage',
      'WEAKNESS: Control board reliability is worst in category',
      'WEAKNESS: 1.1M unit fire recall is a material safety concern',
    ],
    report_fields: {
      corporate_parent: 'Samsung Electronics Co., Ltd.',
      outlook: 'Conditional',
      manufacturing: 'Newberry, South Carolina; South Korea; Vietnam',
      samsung_cross_category: 'Samsung range recall (1.1M units, CPSC 2024). Dacor likely Samsung-sourced.',
    },
  },
];

function scoreProduct(product) {
  const { quality, durability, performance } = product.axis_scores;
  const overall = geoMean(quality, durability, performance);
  const display = Math.round(overall * 10);
  const delta = display - product.target;
  const label = getLabel(display);
  return { overall, display, delta, label };
}

function main() {
  console.log('\n' + '='.repeat(70));
  console.log('RANGES & COOKTOPS CALIBRATION SCORING — v1 (Pre Deep Dive)');
  console.log('='.repeat(70));
  console.log('Weights: Q=0.30, D=0.35, P=0.35');
  console.log('Method: Geometric mean, no axis stretch');
  console.log('Products: 3 gas + 2 induction + 2 mixed-tier');
  console.log('');

  let allPass = true;
  for (const product of CALIBRATION_PRODUCTS) {
    const result = scoreProduct(product);
    const pass = result.delta === 0;
    const flag = pass ? '✓' : Math.abs(result.delta) <= 1 ? '~' : '✗';
    if (!pass) allPass = false;
    console.log(`${flag} ${product.name.padEnd(46)} | Q:${product.axis_scores.quality} D:${product.axis_scores.durability} P:${product.axis_scores.performance} | ${result.display} (target ${product.target}, Δ${result.delta >= 0 ? '+' : ''}${result.delta}) | ${product.tier} | ${result.label}`);
  }

  console.log('');
  console.log(allPass ? '✓ ALL TARGETS HIT EXACTLY' : '~ See deltas above — adjust axis scores');
  console.log('');
}

main();
