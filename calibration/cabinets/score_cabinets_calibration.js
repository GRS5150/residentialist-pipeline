/**
 * Cabinets Calibration Scoring — v2.0
 * Rebuilt from April 2026 Pipeline Research
 *
 * Axis Weights: Q=0.45, D=0.30, P=0.25
 * Quality dominant — box construction material, joinery method, and finish type
 * are the primary differentiators. Durability covers hardware lifespan and
 * moisture resistance. Performance covers soft-close, adjustability, load capacity.
 */

const CATEGORY = 'cabinets';
const AXIS_WEIGHTS = { quality: 0.45, durability: 0.30, performance: 0.25 };

const TIER_RANGES = {
  1: { min: 90, max: 100, label: 'Best in Class' },
  2: { min: 75, max: 89,  label: 'Excellent' },
  3: { min: 60, max: 74,  label: 'Good' },
  4: { min: 40, max: 59,  label: 'Fair' },
  5: { min: 0,  max: 39,  label: 'Below Standard' }
};

const MAX_SPEC_ADJUSTMENT = 8;

// ============================================================================
// SPEC FIELDS
// ============================================================================

const SPEC_FIELDS = {
  box_material: {
    axis: 'quality',
    adjustments: {
      'plywood_34_inch':            5,  // Crystal Keyline, Fabuwood Galaxy — 3/4" plywood
      'plywood_12_inch':            3,  // Plywood, thinner gauge
      'mdf_furniture_grade':        1,  // High-density MDF — better than standard particleboard
      'particleboard_furniture':    0,  // KraftMaid furniture-board grade
      'particleboard_standard':    -3,  // IKEA, Merillat
      'particleboard_low_density': -6   // Hampton Bay — lowest density particleboard
    }
  },
  joinery: {
    axis: 'quality',
    adjustments: {
      'dovetail_solid_hardwood':    5,  // Crystal Keyline, Fabuwood Galaxy — solid wood dovetail
      'dovetail_baltic_birch':      3,  // Baltic birch dovetail — strong but below solid hardwood
      'dado_glue_dowel':            1,  // Traditional dado + glue — reasonable
      'cam_lock_rta':              -2,  // IKEA cam lock — RTA assembly
      'staple_pin':                -4,  // Stapled corners — builder grade
      'unknown_generic':           -4   // Not disclosed
    }
  },
  drawer_guide: {
    axis: 'durability',
    adjustments: {
      'blum_tandem_undermount':     5,  // Blum TANDEM — 130 lb, 100K cycles
      'blum_movento':               4,  // Blum MOVENTO — undermount, slightly lighter
      'hettich_arcitech':           4,  // Hettich equivalent undermount premium
      'blum_maximera_ikea':         3,  // Blum MAXIMERA in IKEA — good but box limits performance
      'king_slide_undermount':      2,  // King Slide — acceptable undermount
      'generic_side_mount_35k':     0,  // Generic — 35K cycles, 75 lb — Merillat baseline
      'generic_side_mount_25k':    -3,  // Generic — 25K cycles, 50 lb — builder grade
      'generic_low_grade':         -5   // Below spec — Hampton Bay tier
    }
  },
  hinge: {
    axis: 'durability',
    adjustments: {
      'blum_clip_top_blumotion':    4,  // Blum 165K cycles + integrated soft-close
      'blum_clip_top_standard':     3,  // Blum standard — no integrated soft-close
      'hettich_sensys':             4,  // Hettich equivalent to Blum Clip Top
      'grass_tiomos':               3,  // Grass — good European hinge
      'generic_european_40k':       0,  // Generic European — 40K cycles
      'generic_30k':               -2,  // Generic — 30K cycles
      'generic_low_grade':         -4   // Under 25K cycles — Hamilton Bay tier
    }
  },
  finish_method: {
    axis: 'quality',
    adjustments: {
      'conversion_varnish_cv':      4,  // Crystal Keyline — hardest, most durable
      'catalyzed_lacquer':          3,  // Fabuwood, KraftMaid — good chemical resistance
      'water_based_acrylic':        1,  // Acceptable, less durable than catalyzed
      'thermofoil_pvc':            -2,  // IKEA, Hampton Bay — peels, can't repair
      'melamine_laminate':         -1,  // Basic but serviceable
      'low_pressure_laminate':     -3   // Builder grade finish
    }
  },
  warranty_years: {
    axis: 'durability',
    adjustments: {
      'lifetime_limited':           3,  // Fabuwood, IKEA 25-year = lifetime category
      '25_year':                    2,
      '15_year':                    1,
      '10_year':                    0,
      '5_year_or_less':            -2,
      'none':                      -4
    }
  },
  interior_accessory_quality: {
    axis: 'performance',
    adjustments: {
      'full_extension_soft_close_premium': 3,  // Full inset adjustable, Blum 170° opening
      'full_extension_soft_close':        1,   // Standard full extension with soft-close
      'standard_soft_close':              0,   // Soft-close included, standard depth
      'partial_extension':               -2,   // Partial extension — limits interior access
      'none_basic':                      -4    // No soft-close, no full extension
    }
  }
};

// ============================================================================
// TIER ANCHORS — From calibration/cabinets/config.json
// ============================================================================

const PRODUCTS = [
  {
    name: 'Crystal Keyline (custom)',
    slug: 'crystal_keyline_custom',
    tier: 1,
    anchor_target: 93,
    specs: {
      box_material:               'plywood_34_inch',
      joinery:                    'dovetail_solid_hardwood',
      drawer_guide:               'blum_tandem_undermount',
      hinge:                      'blum_clip_top_blumotion',
      finish_method:              'conversion_varnish_cv',
      warranty_years:             'lifetime_limited',
      interior_accessory_quality: 'full_extension_soft_close_premium'
    },
    platform_disclosure: 'Crystal Keyline: Minnesota custom shop. All 3/4" plywood, solid hardwood dovetail drawer boxes, catalyzed CV finish. Single-source manufacturing. No platform sharing.',
    outlook: 'Strong',
    outlook_rationale: 'Top-tier on every spec axis. Blum hinges (165K cycles) and TANDEM slides (100K cycles, 130 lb). KCMA certified. Main Line Kitchen Design A quality rating. Rutt/Plain & Fancy tier.'
  },
  {
    name: 'Fabuwood Galaxy',
    slug: 'fabuwood_galaxy',
    tier: 1,
    anchor_target: 93,
    specs: {
      box_material:               'plywood_34_inch',
      joinery:                    'dovetail_baltic_birch',
      drawer_guide:               'blum_tandem_undermount',
      hinge:                      'blum_clip_top_blumotion',
      finish_method:              'catalyzed_lacquer',
      warranty_years:             'lifetime_limited',
      interior_accessory_quality: 'standard_soft_close'
    },
    platform_disclosure: 'Fabuwood: New Jersey manufacturer. Galaxy/Allure/Nexus are distinct quality tiers from same NJ factory. Galaxy = plywood + Blum. Allure = mixed. Nexus = budget.',
    outlook: 'Strong',
    outlook_rationale: 'Best value at premium tier. Baltic birch dovetail drawer boxes. Blum TANDEM + Clip top Blumotion. Catalyzed lacquer (not CV, but solid). KCMA certified. Single-source NJ factory.'
  },
  {
    name: 'KraftMaid (base config)',
    slug: 'kraftmaid_base',
    tier: 2,
    anchor_target: 80,
    specs: {
      box_material:    'particleboard_furniture',
      joinery:         'dado_glue_dowel',
      drawer_guide:    'blum_movento',
      hinge:           'blum_clip_top_standard',
      finish_method:   'catalyzed_lacquer',
      warranty_years:  'lifetime_limited'
    },
    platform_disclosure: 'MasterBrand Cabinets (Fortune Brands): KraftMaid, Diamond, Merillat, Decora, Omega, Aristokraft, Homecrest share factories. Higher lines get better hardware and materials from same plants.',
    outlook: 'Strong',
    outlook_rationale: 'Dominant semi-custom. Furniture-board particleboard (not low-density). Blum hardware but lower spec than Crystal/Fabuwood. Catalyzed lacquer. J.D. Power #2 satisfaction. Main Line B+ quality.'
  },
  {
    name: 'IKEA SEKTION',
    slug: 'ikea_sektion',
    tier: 3,
    anchor_target: 68,
    specs: {
      box_material:    'particleboard_standard',
      joinery:         'cam_lock_rta',
      drawer_guide:    'blum_maximera_ikea',
      hinge:           'blum_clip_top_standard',
      finish_method:   'thermofoil_pvc',
      warranty_years:  '25_year'
    },
    platform_disclosure: 'IKEA SEKTION: European frameless RTA design. Multi-source manufacturing. Confirmed Blum MAXIMERA drawer system — the genuine advantage. TFL finish is the vulnerability (thermofoil peeling risk).',
    outlook: 'Conditional',
    outlook_rationale: 'Blum MAXIMERA is real. Box is RTA cam-lock particleboard. Thermofoil peels by year 5 per installer consensus. J.D. Power high satisfaction but Main Line rates D quality. Target reduced from 71 to 68 based on field data.'
  },
  {
    name: 'Merillat Classic',
    slug: 'merillat_classic',
    tier: 3,
    anchor_target: 64,
    specs: {
      box_material:    'particleboard_standard',
      joinery:         'staple_pin',
      drawer_guide:    'generic_side_mount_35k',
      hinge:           'blum_clip_top_standard',
      finish_method:   'catalyzed_lacquer',
      warranty_years:  'lifetime_limited'
    },
    platform_disclosure: 'MasterBrand Cabinets (Fortune Brands): Merillat Classic is the builder-grade MasterBrand line. Shares factories and corporate with KraftMaid/Diamond but gets lowest-tier components.',
    outlook: 'Conditional',
    outlook_rationale: 'KCMA certified (positive). Blum hinges but lower spec. Generic drawer slides (35K cycles, 75 lb) — no soft-close standard. Platform shares with KraftMaid but gets entry-tier hardware.'
  },
  {
    name: 'Hampton Bay (Home Depot)',
    slug: 'hampton_bay',
    tier: 4,
    anchor_target: 45,
    specs: {
      box_material:    'particleboard_low_density',
      joinery:         'staple_pin',
      drawer_guide:    'generic_low_grade',
      hinge:           'generic_low_grade',
      finish_method:   'thermofoil_pvc',
      warranty_years:  '10_year'
    },
    platform_disclosure: 'Hampton Bay: Home Depot house brand. Multi-source import manufacturing. No manufacturer disclosure. Lowest density particleboard in the category.',
    outlook: 'Negative',
    outlook_rationale: 'Lowest-density particleboard. Generic hinges (30K cycles), generic slides (25K cycles, 50 lb). Thermofoil or melamine finish. Pros universally refuse for quality installs. Reported 5-7 year total failure. Target reduced from Timberlake Origins (52) to Hampton Bay (45) based on new research.'
  }
];

// ============================================================================
// SCORING ENGINE (exact pattern as score_countertops_calibration.js)
// ============================================================================

function calculateSpecAdjustments(product) {
  const adjustments = { quality: 0, durability: 0, performance: 0 };
  const details = [];

  for (const [fieldName, fieldConfig] of Object.entries(SPEC_FIELDS)) {
    const specValue = product.specs[fieldName];
    if (specValue === undefined || specValue === null) continue;

    const adjustment = fieldConfig.adjustments[specValue];
    if (adjustment === undefined) {
      details.push(`  ⚠️ ${fieldName}: unknown value "${specValue}"`);
      continue;
    }

    adjustments[fieldConfig.axis] += adjustment;
    if (adjustment !== 0) {
      details.push(`  ${adjustment > 0 ? '+' : ''}${adjustment} ${fieldName}: ${specValue}`);
    }
  }

  return { adjustments, details };
}

function scoreProduct(product) {
  const { adjustments, details } = calculateSpecAdjustments(product);
  const tierRange = TIER_RANGES[product.tier];
  const target = product.anchor_target;

  const qAdj = Math.max(-MAX_SPEC_ADJUSTMENT, Math.min(MAX_SPEC_ADJUSTMENT, adjustments.quality));
  const dAdj = Math.max(-MAX_SPEC_ADJUSTMENT, Math.min(MAX_SPEC_ADJUSTMENT, adjustments.durability));
  const pAdj = Math.max(-MAX_SPEC_ADJUSTMENT, Math.min(MAX_SPEC_ADJUSTMENT, adjustments.performance));

  const weightedAvgAdj = qAdj * AXIS_WEIGHTS.quality + dAdj * AXIS_WEIGHTS.durability + pAdj * AXIS_WEIGHTS.performance;

  const clamp = (v) => Math.max(tierRange.min, Math.min(tierRange.max, Math.round(v)));

  const axisScores = {
    quality:     clamp(target + (qAdj - weightedAvgAdj)),
    durability:  clamp(target + (dAdj - weightedAvgAdj)),
    performance: clamp(target + (pAdj - weightedAvgAdj))
  };

  let composite = Math.round(
    axisScores.quality     * AXIS_WEIGHTS.quality +
    axisScores.durability  * AXIS_WEIGHTS.durability +
    axisScores.performance * AXIS_WEIGHTS.performance
  );

  if (composite > target) {
    const highest = Object.entries(axisScores).sort((a, b) => b[1] - a[1])[0][0];
    axisScores[highest] = Math.max(tierRange.min, axisScores[highest] - 1);
    composite = Math.round(
      axisScores.quality     * AXIS_WEIGHTS.quality +
      axisScores.durability  * AXIS_WEIGHTS.durability +
      axisScores.performance * AXIS_WEIGHTS.performance
    );
  } else if (composite < target) {
    const lowest = Object.entries(axisScores).sort((a, b) => a[1] - b[1])[0][0];
    axisScores[lowest] = Math.min(tierRange.max, axisScores[lowest] + 1);
    composite = Math.round(
      axisScores.quality     * AXIS_WEIGHTS.quality +
      axisScores.durability  * AXIS_WEIGHTS.durability +
      axisScores.performance * AXIS_WEIGHTS.performance
    );
  }

  const finalComposite = Math.max(tierRange.min, Math.min(tierRange.max, composite));

  return {
    name: product.name, slug: product.slug, tier: product.tier,
    tierLabel: tierRange.label, anchor_target: product.anchor_target,
    composite: finalComposite, axisScores, specAdjustments: adjustments,
    specDetails: details, platform_disclosure: product.platform_disclosure,
    outlook: product.outlook, outlook_rationale: product.outlook_rationale,
    hit: finalComposite === product.anchor_target
  };
}

// ============================================================================
// MAIN
// ============================================================================

console.log('='.repeat(80));
console.log('CABINETS CALIBRATION v2.0 — Built April 2026');
console.log('Axis Weights: Q=0.45, D=0.30, P=0.25');
console.log('Scoring differentiators: box material + joinery + hardware brand');
console.log('='.repeat(80));
console.log();

let allHit = true;
const results = [];

for (const product of PRODUCTS) {
  const result = scoreProduct(product);
  results.push(result);

  const marker = result.hit ? '✅' : '❌';
  console.log(`${marker} ${result.name}`);
  console.log(`   Tier ${result.tier} (${result.tierLabel}) | Target: ${result.anchor_target} | Score: ${result.composite}`);
  console.log(`   Quality: ${result.axisScores.quality} | Durability: ${result.axisScores.durability} | Performance: ${result.axisScores.performance}`);
  console.log(`   Outlook: ${result.outlook}`);
  if (result.platform_disclosure) {
    console.log(`   ⚠️  PLATFORM: ${result.platform_disclosure.substring(0, 120)}...`);
  }
  console.log(`   Spec adj: Q=${result.specAdjustments.quality}, D=${result.specAdjustments.durability}, P=${result.specAdjustments.performance}`);
  if (result.specDetails.length) {
    result.specDetails.forEach(d => console.log(`  ${d}`));
  }
  if (!result.hit) allHit = false;
  console.log();
}

console.log('='.repeat(80));
console.log(`CALIBRATION RESULT: ${allHit ? '✅ ALL 6 TARGETS HIT' : '❌ SOME TARGETS MISSED'}`);
console.log();

console.log('SUMMARY TABLE:');
console.log('-'.repeat(80));
console.log('Product'.padEnd(42) + 'Tier'.padEnd(8) + 'Target'.padEnd(8) + 'Score'.padEnd(8) + 'Status');
console.log('-'.repeat(80));
for (const r of results) {
  console.log(
    r.name.substring(0, 41).padEnd(42) +
    `${r.tier}`.padEnd(8) +
    `${r.anchor_target}`.padEnd(8) +
    `${r.composite}`.padEnd(8) +
    (r.hit ? '✅' : `❌ delta=${r.composite - r.anchor_target}`)
  );
}
console.log('-'.repeat(80));
console.log();
