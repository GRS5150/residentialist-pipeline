#!/usr/bin/env node
/**
 * Exterior Doors Calibration Scoring — v1
 * Deterministic scoring. No API calls.
 *
 * Axis weights: Q=0.40, D=0.35, P=0.25
 * Composite: Geometric mean
 * Pool S: VACANT (no independent comparative door tester)
 * Pool A: GBA, FHB, Consumer Reports, NFRC
 *
 * 7 calibration products spanning Tier 1 through Tier 4:
 *   Marvin Signature Ultimate Entry    → 94 (Tier 1)
 *   Therma-Tru Classic-Craft Premium   → 91 (Tier 1)
 *   Pella Reserve Entry                → 80 (Tier 2)
 *   Therma-Tru Benchmark              → 67 (Tier 3)
 *   Masonite Performance              → 64 (Tier 3)
 *   JELD-WEN Builders Series          → 48 (Tier 4)
 *   Reliabilt Entry (Lowe's)          → 40 (Tier 4)
 *
 * Usage: node score_exterior_doors_calibration.js
 */

// ─── Weights & Formula ─────────────────────────────────────────────────────────

const WEIGHTS = { quality: 0.40, durability: 0.35, performance: 0.25 };

function geoMean(q, d, p) {
  const qn = Math.max(q / 10, 0.001);
  const dn = Math.max(d / 10, 0.001);
  const pn = Math.max(p / 10, 0.001);
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
    name: 'Marvin Signature Ultimate Entry Door',
    slug: 'marvin_ultimate_entry',
    target: 94,
    tier: 'Tier 1',

    specs: {
      // Quality
      slab_construction: 'engineered_laminated_wood',    // adj: +2
      weatherstrip_system: 'multi_layer_adjustable_compression', // adj: +2
      threshold_system: 'adjustable_sill_with_dam',       // adj: +1
      hardware_grade: 'multipoint_lock_european',          // adj: +2
      hinge_grade: 'grade_1_stainless',                    // adj: +1
      core_insulation: 'N/A',                              // adj: N/A (solid wood/hybrid — no foam core)

      // Performance
      energy_u_factor: 0.18,                               // adj: +1 (with low-E IGU)
      air_infiltration: 0.08,                              // adj: +1
      glass_lite_quality: 'internally_glazed_low_e_triple', // adj: +2
      structural_dp_rating: 'DP50',                        // adj: +1

      // Durability
      slab_material_longevity: 'clad_wood_exterior_protected', // adj: +1
      finish_durability: 'factory_pvd_or_refinishable',    // adj: +1
      warranty_term: 'lifetime_full',                      // adj: +2
      parts_serviceability: 'dealer_network_full_parts',   // adj: +1
      weatherstrip_replacement_ease: 'field_replaceable_standard_kerf', // adj: +1
      channel_quality: 'dealer_pro_channel',               // adj: +1
    },

    spec_adj: { quality: 8, performance: 5, durability: 7 },

    axis_scores: { quality: 9.6, durability: 9.3, performance: 9.4 },

    notes: [
      'Architect default for $2-5M+ homes per hierarchy research',
      'Engineered laminated wood slabs resist warping better than solid planks (installer confirmed)',
      'Premium factory-integrated hardware: multipoint European lock system standard',
      'Refinishable UV-stable stains = 10+ year durability, field renewal possible',
      'Grade 1 stainless hinges, adjustable Endura-type sill',
      'High-end IGUs: triple-pane low-E options available, internally glazed',
      'Fortune Brands (NYSE: FBIN) backing — strong warranty entity',
      'Unlimited custom, 12-16 week lead time',
      'Installers praise warp resistance in humid climates',
      'Kolbe VistaLuxe and Loewen are peers at this tier — not yet calibrated',
    ],

    report_fields: {
      corporate_parent: 'Fortune Brands Innovations (NYSE: FBIN) — also owns Moen, Master Lock',
      outlook: 'Strong',
      manufacturing: 'Warroad, MN (family-founded 1912, vertically integrated). Premium custom facility.',
    },
  },

  {
    name: 'Therma-Tru Classic-Craft Premium (Fiberglass)',
    slug: 'thermatru_classiccraft',
    target: 91,
    tier: 'Tier 1',

    specs: {
      // Quality
      slab_construction: 'compression_molded_fiberglass',  // adj: +1
      weatherstrip_system: 'compression_kerf_with_corner_pads', // adj: +1
      threshold_system: 'adjustable_sill_with_dam',        // adj: +1
      hardware_grade: 'multipoint_lock_domestic',          // adj: +1
      hinge_grade: 'grade_1_steel',                        // adj: 0
      core_insulation: 'polyurethane_foam_high_density',   // adj: +1

      // Performance
      energy_u_factor: 0.15,                               // adj: +2 (solid panel with polyurethane core)
      air_infiltration: 0.09,                              // adj: +1
      glass_lite_quality: 'internally_glazed_low_e_double', // adj: +1
      structural_dp_rating: 'DP50',                        // adj: +1

      // Durability
      slab_material_longevity: 'fiberglass_rot_proof',     // adj: +2
      finish_durability: 'factory_stain_UV_stable',        // adj: +1
      warranty_term: 'lifetime_limited_or_50yr',           // adj: +1
      parts_serviceability: 'dealer_network_full_parts',   // adj: +1
      weatherstrip_replacement_ease: 'field_replaceable_standard_kerf', // adj: +1
      channel_quality: 'dealer_pro_channel',               // adj: +1
    },

    spec_adj: { quality: 5, performance: 5, durability: 7 },

    axis_scores: { quality: 9.2, durability: 9.2, performance: 9.0 },

    notes: [
      'AccuGrain compression-molded fiberglass = most realistic wood grain in fiberglass category',
      'Rot-proof slab is inherent material advantage over wood — key for coastal and humid climates',
      'Polyurethane foam core delivers R-5+ (fiberglass solid panel U-factor as low as 0.14-0.15)',
      'Multi-point lock system standard on Classic-Craft',
      '50-year/lifetime warranty — Fortune Brands (Therma-Tru parent) is same entity as Marvin',
      '<1% service call rate reported by professional installers',
      'AccuGrain skin distinguished from Smooth-Star (builder line) — completely different quality',
      'Classic-Craft is dealer-channel product — big-box gets Smooth-Star/Benchmark (different, lower spec)',
      'Professional consensus: best fiberglass entry door available',
    ],

    report_fields: {
      corporate_parent: 'Fortune Brands Innovations (NYSE: FBIN)',
      outlook: 'Strong',
      manufacturing: 'Butler, IN (primary), Maumee, OH (R&D). US manufacturing.',
    },
  },

  {
    name: 'Pella Reserve Entry Door',
    slug: 'pella_reserve_entry',
    target: 80,
    tier: 'Tier 2',

    specs: {
      // Quality
      slab_construction: 'compression_molded_fiberglass',  // adj: +1
      weatherstrip_system: 'compression_kerf_with_corner_pads', // adj: +1
      threshold_system: 'adjustable_sill_with_dam',        // adj: +1
      hardware_grade: 'single_deadbolt_grade_1',           // adj: 0
      hinge_grade: 'grade_1_steel',                        // adj: 0
      core_insulation: 'polyurethane_foam_standard',       // adj: 0

      // Performance
      energy_u_factor: 0.19,                               // adj: +1
      air_infiltration: 0.12,                              // adj: 0
      glass_lite_quality: 'internally_glazed_low_e_double', // adj: +1
      structural_dp_rating: 'DP35',                        // adj: 0

      // Durability
      slab_material_longevity: 'fiberglass_rot_proof',     // adj: +2
      finish_durability: 'factory_stain_UV_stable',        // adj: +1
      warranty_term: 'lifetime_limited_or_50yr',           // adj: +1
      parts_serviceability: 'dealer_network_full_parts',   // adj: +1
      weatherstrip_replacement_ease: 'field_replaceable_standard_kerf', // adj: +1
      channel_quality: 'mixed_dealer_bigbox',              // adj: 0
    },

    spec_adj: { quality: 3, performance: 2, durability: 6 },

    axis_scores: { quality: 8.0, durability: 8.0, performance: 8.0 },

    notes: [
      '#1 consumer trust brand (LifeStory Research 2026)',
      'Good fiberglass construction — like Therma-Tru mid, not Classic-Craft level',
      'R6+ rated door system with good sealing',
      'Family-owned (Pella Corporation, Pella IA) — strong warranty entity',
      'Pros rank below ProVia/Therma-Tru Classic-Craft, above JELD-WEN',
      'Semi-custom options, 8-12 week lead time',
      'Reserve is Pella premium line — 250 Series is builder grade (different product per Rule 19)',
      'Single deadbolt standard (not multipoint) separates from Tier 1',
      'Mixed channel (Pella showrooms + some big-box) — showroom product is full-spec',
    ],

    report_fields: {
      corporate_parent: 'Pella Corporation — family-owned since 1925',
      outlook: 'Strong',
      manufacturing: 'Pella, IA (headquarters and primary). Murray, KY. Carroll, IA.',
    },
  },

  {
    name: 'Therma-Tru Benchmark Entry (Fiberglass)',
    slug: 'thermatru_benchmark',
    target: 67,
    tier: 'Tier 3',

    specs: {
      // Quality
      slab_construction: 'standard_fiberglass',           // adj: 0
      weatherstrip_system: 'standard_compression',         // adj: 0
      threshold_system: 'standard_aluminum_sill',          // adj: 0
      hardware_grade: 'single_deadbolt_grade_2',           // adj: -1
      hinge_grade: 'grade_2',                              // adj: -1
      core_insulation: 'polyurethane_foam_standard',       // adj: 0

      // Performance
      energy_u_factor: 0.21,                               // adj: 0
      air_infiltration: 0.15,                              // adj: 0
      glass_lite_quality: 'externally_glazed_low_e',       // adj: 0
      structural_dp_rating: 'DP35',                        // adj: 0

      // Durability
      slab_material_longevity: 'fiberglass_rot_proof',     // adj: +2
      finish_durability: 'factory_paint_standard',         // adj: 0
      warranty_term: 'lifetime_limited_or_50yr',           // adj: +1
      parts_serviceability: 'dealer_network_full_parts',   // adj: +1
      weatherstrip_replacement_ease: 'field_replaceable_standard_kerf', // adj: +1
      channel_quality: 'mixed_dealer_bigbox',              // adj: 0
    },

    spec_adj: { quality: -2, performance: 0, durability: 5 },

    axis_scores: { quality: 6.8, durability: 6.8, performance: 6.5 },

    notes: [
      'Builder line of Therma-Tru — NOT Classic-Craft quality',
      'Thinner compression molding, less realistic grain than Classic-Craft',
      'Higher delamination risk than Classic-Craft (still fiberglass = rot-proof)',
      'Standard weatherstripping (not multi-layer/adjustable)',
      'Grade 2 hardware: single deadbolt, basic hinges',
      'Still Fortune Brands warranty — strong backing entity',
      'Professional quality floor: installers put Benchmark in $500K+ homes without hesitation',
      'Available through dealers and some big-box locations (mixed channel)',
      'More callbacks than Classic-Craft but significantly fewer than steel builder-grade',
      'Smooth-Star is below Benchmark — even thinner fiberglass',
    ],

    report_fields: {
      corporate_parent: 'Fortune Brands Innovations (NYSE: FBIN)',
      outlook: 'Stable',
      manufacturing: 'Same Fortune Brands facilities as Classic-Craft — different production line, lower spec.',
    },
  },

  {
    name: 'Masonite Performance Door System (Fiberglass)',
    slug: 'masonite_performance',
    target: 64,
    tier: 'Tier 3',

    specs: {
      // Quality
      slab_construction: 'standard_fiberglass',            // adj: 0
      weatherstrip_system: 'compression_kerf_with_corner_pads', // adj: +1
      threshold_system: 'standard_aluminum_sill',          // adj: 0
      hardware_grade: 'single_deadbolt_grade_2',           // adj: -1
      hinge_grade: 'grade_2',                              // adj: -1
      core_insulation: 'polyurethane_foam_standard',       // adj: 0

      // Performance
      energy_u_factor: 0.22,                               // adj: 0
      air_infiltration: 0.16,                              // adj: 0
      glass_lite_quality: 'externally_glazed_low_e',       // adj: 0
      structural_dp_rating: 'DP35',                        // adj: 0

      // Durability
      slab_material_longevity: 'fiberglass_rot_proof',     // adj: +2
      finish_durability: 'factory_paint_standard',         // adj: 0
      warranty_term: '20_year',                            // adj: 0
      parts_serviceability: 'manufacturer_direct_parts',   // adj: 0
      weatherstrip_replacement_ease: 'field_replaceable_proprietary', // adj: 0
      channel_quality: 'mixed_dealer_bigbox',              // adj: 0
    },

    spec_adj: { quality: -1, performance: 0, durability: 2 },

    axis_scores: { quality: 6.4, durability: 6.5, performance: 6.3 },

    notes: [
      'Solid mid-market door — innovative weatherstripping system edges out JELD-WEN',
      'Performance Door System is Masonite premium line — has better seals than standard Masonite',
      'Comparable to Therma-Tru Benchmark but better weatherstrip integration',
      'Grade 2 hardware standard — single deadbolt',
      'Fewer water intrusion issues than steel alternatives at same price',
      'Masonite International (TSX: MAS) — publicly traded, stable',
      'Minor finish fade at 7-10 years documented',
      'Parts through manufacturer direct or dealer channel',
      'Solidoor line is step below Performance — score separately per Rule 19',
    ],

    report_fields: {
      corporate_parent: 'Masonite International (TSX: MAS, publicly traded)',
      outlook: 'Stable',
      manufacturing: 'Multiple facilities across US, Canada, and Mexico. Masonite is a manufacturer, not assembler.',
    },
  },

  {
    name: 'JELD-WEN Builders Series (Steel/Fiberglass)',
    slug: 'jeldwen_builders',
    target: 48,
    tier: 'Tier 4',

    specs: {
      // Quality
      slab_construction: 'insulated_steel_22_24ga',        // adj: -1
      weatherstrip_system: 'basic_foam_magnetic',          // adj: -1
      threshold_system: 'composite_sill_basic',            // adj: 0
      hardware_grade: 'single_deadbolt_grade_2',           // adj: -1
      hinge_grade: 'grade_2',                              // adj: -1
      core_insulation: 'polyurethane_foam_standard',       // adj: 0

      // Performance
      energy_u_factor: 0.28,                               // adj: 0
      air_infiltration: 0.22,                              // adj: -1
      glass_lite_quality: 'standard_double_no_low_e',      // adj: -1
      structural_dp_rating: 'DP20',                        // adj: -2

      // Durability
      slab_material_longevity: 'steel_galvanized_coated',  // adj: 0
      finish_durability: 'factory_paint_standard',         // adj: 0
      warranty_term: '10_year',                            // adj: -1
      parts_serviceability: 'limited_parts_channel',       // adj: -1
      weatherstrip_replacement_ease: 'field_replaceable_proprietary', // adj: 0
      channel_quality: 'big_box_exclusive',                // adj: -1
    },

    spec_adj: { quality: -4, performance: -4, durability: -3 },

    axis_scores: { quality: 4.6, durability: 5.0, performance: 4.8 },

    notes: [
      'Builder-grade entry door: 22-24 gauge steel warps in direct sun',
      'AuraLast wood rot/delamination reputation hurt brand (windows worse than doors per JELD-WEN Rule)',
      'Water intrusion at corners documented — poor weld quality on some production runs',
      'Mexico-made lines are thinner and cheaper than US production',
      'Improved post-2020 but contractor wariness persists',
      'Big-box channel gets downgraded specs vs dealer-channel JELD-WEN (Siteline, Premium Steel)',
      'JELD-WEN Siteline fiberglass and Premium Steel are dealer-channel products — higher quality, different score per Rule 19',
      'JELD-WEN (NYSE: JELD) publicly traded',
      'High callback rate across Builders Series',
    ],

    report_fields: {
      corporate_parent: 'JELD-WEN Holding (NYSE: JELD) — publicly traded',
      outlook: 'Conditional',
      manufacturing: 'Multiple facilities US, Canada, Mexico. Builder-grade lines increasingly Mexico-sourced.',
      aura_last_note: 'AuraLast wood treatment had documented rot/delamination issues primarily in windows. Door products less affected but brand reputation carries. Report this finding.',
    },
  },

  {
    name: 'Reliabilt Entry Door (Lowe\'s)',
    slug: 'reliabilt_entry',
    target: 40,
    tier: 'Tier 4',

    specs: {
      // Quality
      slab_construction: 'insulated_steel_26ga',           // adj: -2
      weatherstrip_system: 'basic_foam_magnetic',          // adj: -1
      threshold_system: 'minimal_or_no_sill',              // adj: -1
      hardware_grade: 'single_deadbolt_grade_3',           // adj: -2
      hinge_grade: 'grade_3',                              // adj: -2
      core_insulation: 'polystyrene_foam',                 // adj: -1

      // Performance
      energy_u_factor: 0.35,                               // adj: -1
      air_infiltration: 0.28,                              // adj: -1
      glass_lite_quality: 'standard_double_no_low_e',      // adj: -1
      structural_dp_rating: 'DP20',                        // adj: -2

      // Durability
      slab_material_longevity: 'steel_thin_gauge_uncoated', // adj: -2
      finish_durability: 'field_paint_only',               // adj: -1
      warranty_term: 'less_than_10_year_or_none',          // adj: -2
      parts_serviceability: 'no_parts_support',            // adj: -2
      weatherstrip_replacement_ease: 'not_replaceable',    // adj: -2
      channel_quality: 'big_box_exclusive',                // adj: -1
    },

    spec_adj: { quality: -8, performance: -5, durability: -8 },

    axis_scores: { quality: 3.8, durability: 4.2, performance: 4.0 },

    notes: [
      'JELD-WEN-made big-box exclusive for Lowe\'s — downgraded specs across the board',
      '24-26 gauge steel — warps in sun, dents from hail or impact',
      'Thin fiberglass models delaminate at 3-7 years per contractor consensus',
      '50%+ service call rate per professional installer reports',
      'Pros refuse for quality homes — universally categorized as "disposable"',
      'Expected 5-8 year lifespan',
      'Weatherstrip fails at 2-5 years',
      'Parts effectively unavailable after 5 years of purchase',
      'Grade 3 hardware: lowest-grade deadbolt and hinges',
      'Polystyrene foam core (lower R-value than polyurethane)',
      'Highest callback rate in category',
      'For flips and rentals only per contractor consensus',
    ],

    report_fields: {
      corporate_parent: 'Manufactured by JELD-WEN for Lowe\'s (private label)',
      outlook: 'Conditional',
      manufacturing: 'Manufactured by JELD-WEN. Specific facility not disclosed — likely lowest-cost production line.',
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
  console.log('EXTERIOR DOORS CALIBRATION SCORING RUN — v1');
  console.log('='.repeat(70));
  console.log('Weights: Q=0.40, D=0.35, P=0.25');
  console.log('Method: Geometric mean, no axis stretch');
  console.log('Pool S: VACANT');
  console.log('');

  let allPass = true;
  for (const product of CALIBRATION_PRODUCTS) {
    const result = scoreProduct(product);
    const pass = result.delta === 0;
    const flag = pass ? '✓' : Math.abs(result.delta) <= 1 ? '~' : '✗';
    if (!pass) allPass = false;
    console.log(`${flag} ${product.name.padEnd(52)} | Q:${product.axis_scores.quality} D:${product.axis_scores.durability} P:${product.axis_scores.performance} | ${result.display} (target ${product.target}, delta ${result.delta >= 0 ? '+' : ''}${result.delta}) | ${product.tier} | ${result.label}`);
  }

  console.log('');
  console.log(allPass ? '✓ ALL TARGETS HIT EXACTLY' : '~ See deltas above — adjust axis scores');
  console.log('');
}

main();
