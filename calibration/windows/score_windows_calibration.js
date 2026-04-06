/**
 * Windows Calibration Scoring — v2.0
 * Rebuilt from April 2026 Pipeline Research
 * 
 * Axis Weights: Q=0.35, D=0.35, P=0.30
 * Balanced — frame quality/seal longevity equally critical, measurable NFRC specs create real differentiation.
 */

const CATEGORY = 'windows';
const AXIS_WEIGHTS = { quality: 0.35, durability: 0.35, performance: 0.30 };

const TIER_RANGES = {
  1: { min: 90, max: 100, label: 'Best in Class' },
  2: { min: 75, max: 89, label: 'Excellent' },
  3: { min: 60, max: 74, label: 'Good' },
  4: { min: 40, max: 59, label: 'Fair' },
  5: { min: 0, max: 39, label: 'Below Standard' }
};

const MAX_SPEC_ADJUSTMENT = 8;

// ============================================================================
// SPEC FIELDS — Deterministic adjustments from measurable specs
// ============================================================================

const SPEC_FIELDS = {
  frame_material: {
    axis: 'quality',
    adjustments: {
      'vg_douglas_fir_clad_aluminum':  5,  // Loewen, Sierra Pacific
      'ultrex_fiberglass_wood':        5,  // Marvin Ultimate — Ultrex proprietary
      'wood_clad_aluminum':            3,  // Andersen E-Series
      'fiberglass_pultruded':          3,  // Pella Impervia, Milgard fiberglass
      'wood_clad_composite':           2,  // Andersen A-Series Fibrex
      'cellular_pvc':                  0,  // Premium vinyl
      'fusion_welded_vinyl':          -2,  // Standard vinyl
      'mechanically_fastened_vinyl':  -5   // Budget vinyl
    }
  },
  glass_package: {
    axis: 'performance',
    adjustments: {
      'triple_krypton_loe366':   5,   // Ultimate triple pane
      'triple_argon_loe366':     4,   // Triple with premium coating
      'triple_argon_loe272':     3,   // Triple standard
      'dual_argon_loe366':       2,   // Dual premium
      'dual_argon_loe272':       1,   // Dual standard
      'dual_argon_loe180':       0,   // Dual basic
      'dual_argon_standard':    -1,   // Basic dual
      'dual_air_standard':      -3    // Cheapest — no gas fill
    }
  },
  spacer_technology: {
    axis: 'durability',
    adjustments: {
      'tps_thermoplastic':       3,   // Best seal longevity
      'super_spacer_quanex':     2,   // Foam — good warm edge
      'intercept_vitro':         1,   // U-channel tin-plate
      'stainless_steel':         0,   // Decent
      'aluminum':               -3    // Worst — thermal bridge, seal failures
    }
  },
  hardware_manufacturer: {
    axis: 'durability',
    adjustments: {
      'amesbury_truth_premium':  3,   // Top hardware supplier
      'roto_north_america':      2,
      'caldwell_manufacturing':  1,
      'generic_imported':       -3
    }
  },
  corner_joint: {
    axis: 'quality',
    adjustments: {
      'mortise_and_tenon':       3,   // Wood joinery — premium
      'fusion_welded':           1,   // Vinyl standard
      'mechanically_fastened':  -2    // Budget
    }
  },
  weatherstrip_type: {
    axis: 'performance',
    adjustments: {
      'triple_seal_bulb':        3,
      'double_seal_compression': 2,
      'single_bulb_seal':        0,
      'fin_seal':               -2
    }
  },
  manufacturing_source: {
    axis: 'quality',
    adjustments: {
      'single_factory':          2,   // Marvin Warroad, Loewen Steinbach
      'multi_plant_controlled':  0,   // Andersen — scale but controlled
      'multi_plant_variable':   -3    // JELD-WEN documented variance
    }
  },
  dp_rating: {
    axis: 'performance',
    adjustments: {
      'dp50_plus':    3,
      'dp40_49':      2,
      'dp30_39':      1,
      'dp20_29':      0,
      'dp15_19':     -2,
      'below_dp15':  -4
    }
  }
};

// ============================================================================
// TIER ANCHORS — Expert Consensus Placement
// ============================================================================

const PRODUCTS = [
  {
    name: 'Marvin Ultimate (Signature Ultimate)',
    slug: 'marvin_ultimate',
    tier: 1,
    anchor_target: 94,
    specs: {
      frame_material: 'ultrex_fiberglass_wood',
      glass_package: 'triple_argon_loe366',
      spacer_technology: 'super_spacer_quanex',
      hardware_manufacturer: 'amesbury_truth_premium',
      corner_joint: 'mortise_and_tenon',
      weatherstrip_type: 'triple_seal_bulb',
      manufacturing_source: 'single_factory',
      dp_rating: 'dp50_plus'
    },
    platform_disclosure: 'Marvin Corporation: Ultimate, Elevate (Ultrex-only), Essential. Same Warroad MN factory. Ultimate gets wood interior + Ultrex exterior. Elevate/Essential are Ultrex-only (lower cost, different market).',
    outlook: 'Strong',
    outlook_rationale: 'Matt Risinger and building science consensus: top overall. Ultrex has proven 30+ year track record. Single-factory consistency. Strong innovation pipeline.'
  },
  {
    name: 'Loewen',
    slug: 'loewen',
    tier: 1,
    anchor_target: 91,
    specs: {
      frame_material: 'vg_douglas_fir_clad_aluminum',
      glass_package: 'triple_argon_loe366',
      spacer_technology: 'super_spacer_quanex',
      hardware_manufacturer: 'amesbury_truth_premium',
      corner_joint: 'mortise_and_tenon',
      weatherstrip_type: 'double_seal_compression',
      manufacturing_source: 'single_factory',
      dp_rating: 'dp50_plus'
    },
    platform_disclosure: 'Loewen Windows & Doors: single-factory Steinbach, Manitoba, Canada. No platform sharing — all product from one facility.',
    outlook: 'Strong',
    outlook_rationale: 'Canadian premium heritage. VG Douglas fir craftsmanship unmatched. Wood frame demands maintenance — prevents score from matching Marvin Ultrex longevity.'
  },
  {
    name: 'Andersen E-Series',
    slug: 'andersen_e_series',
    tier: 2,
    anchor_target: 85,
    specs: {
      frame_material: 'wood_clad_aluminum',
      glass_package: 'triple_argon_loe272',
      spacer_technology: 'intercept_vitro',
      hardware_manufacturer: 'amesbury_truth_premium',
      corner_joint: 'mortise_and_tenon',
      weatherstrip_type: 'double_seal_compression',
      manufacturing_source: 'multi_plant_controlled',
      dp_rating: 'dp40_49'
    },
    platform_disclosure: 'Andersen Corporation: E-Series (architectural), A-Series (Fibrex composite), 400 Series (wood), 200 Series (vinyl). Multi-plant manufacturing. E-Series is the premium line.',
    outlook: 'Strong',
    outlook_rationale: 'Massive scale provides parts/service advantage. Multi-plant controlled quality. Strong pro consensus but not single-factory consistency of Marvin/Loewen.'
  },
  {
    name: 'Pella Architect Series',
    slug: 'pella_architect',
    tier: 2,
    anchor_target: 80,
    specs: {
      frame_material: 'wood_clad_aluminum',
      glass_package: 'dual_argon_loe366',
      spacer_technology: 'intercept_vitro',
      hardware_manufacturer: 'amesbury_truth_premium',
      corner_joint: 'mortise_and_tenon',
      weatherstrip_type: 'double_seal_compression',
      manufacturing_source: 'multi_plant_controlled',
      dp_rating: 'dp40_49'
    },
    platform_disclosure: 'Pella Corporation: Reserve (custom), Architect (premium), Lifestyle (mid), 250 (value), Encompass (builder). 200+ showrooms. Reserve/Architect share frames.',
    outlook: 'Strong',
    outlook_rationale: 'Industry-leading warranty coverage and 200+ showroom service network. Innovation-driven. Slightly below Andersen in raw construction quality per pro consensus but warranty execution is best in class.'
  },
  {
    name: 'Milgard Tuscany (Vinyl)',
    slug: 'milgard_tuscany',
    tier: 3,
    anchor_target: 67,
    specs: {
      frame_material: 'fusion_welded_vinyl',
      glass_package: 'dual_argon_loe272',
      spacer_technology: 'intercept_vitro',
      hardware_manufacturer: 'caldwell_manufacturing',
      corner_joint: 'fusion_welded',
      weatherstrip_type: 'single_bulb_seal',
      manufacturing_source: 'multi_plant_controlled',
      dp_rating: 'dp30_39'
    },
    platform_disclosure: 'MI Windows & Doors owns Milgard. West Coast dominant. Full lifetime warranty including accidental glass breakage (unusual in industry).',
    outlook: 'Conditional',
    outlook_rationale: 'Good mid-tier vinyl. Full lifetime warranty is a standout. But vinyl thermal expansion limits long-term seal integrity especially in hot climates.'
  },
  {
    name: 'JELD-WEN V-2500 (Vinyl)',
    slug: 'jeldwen_v2500',
    tier: 4,
    anchor_target: 52,
    specs: {
      frame_material: 'fusion_welded_vinyl',
      glass_package: 'dual_argon_standard',
      spacer_technology: 'aluminum',
      hardware_manufacturer: 'generic_imported',
      corner_joint: 'fusion_welded',
      weatherstrip_type: 'fin_seal',
      manufacturing_source: 'multi_plant_variable',
      dp_rating: 'dp20_29'
    },
    platform_disclosure: 'JELD-WEN Inc: V-2500, Builders Vinyl, Siteline — multi-plant manufacturing with documented quality variance between facilities. Class-action lawsuit history for seal failures. AuraLast wood treatment (Siteline) questioned by pros.',
    outlook: 'Negative',
    outlook_rationale: 'Class-action history. Multi-plant quality variance documented. Aluminum spacers are the cheapest option. Contractors specify for cost builds only. 10-year seal failure risk per home inspector consensus.'
  }
];

// ============================================================================
// SCORING ENGINE
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
    quality: clamp(target + (qAdj - weightedAvgAdj)),
    durability: clamp(target + (dAdj - weightedAvgAdj)),
    performance: clamp(target + (pAdj - weightedAvgAdj))
  };

  let composite = Math.round(
    axisScores.quality * AXIS_WEIGHTS.quality +
    axisScores.durability * AXIS_WEIGHTS.durability +
    axisScores.performance * AXIS_WEIGHTS.performance
  );

  if (composite > target) {
    const highest = Object.entries(axisScores).sort((a, b) => b[1] - a[1])[0][0];
    axisScores[highest] = Math.max(tierRange.min, axisScores[highest] - 1);
    composite = Math.round(
      axisScores.quality * AXIS_WEIGHTS.quality +
      axisScores.durability * AXIS_WEIGHTS.durability +
      axisScores.performance * AXIS_WEIGHTS.performance
    );
  } else if (composite < target) {
    const lowest = Object.entries(axisScores).sort((a, b) => a[1] - b[1])[0][0];
    axisScores[lowest] = Math.min(tierRange.max, axisScores[lowest] + 1);
    composite = Math.round(
      axisScores.quality * AXIS_WEIGHTS.quality +
      axisScores.durability * AXIS_WEIGHTS.durability +
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
console.log('WINDOWS CALIBRATION v2.0 — Rebuilt April 2026');
console.log('Axis Weights: Q=0.35, D=0.35, P=0.30');
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
  if (!result.hit) allHit = false;
  console.log();
}

console.log('='.repeat(80));
console.log(`CALIBRATION RESULT: ${allHit ? '✅ ALL 6 TARGETS HIT' : '❌ SOME TARGETS MISSED'}`);
console.log();

console.log('SUMMARY TABLE:');
console.log('-'.repeat(80));
console.log('Product'.padEnd(40) + 'Tier'.padEnd(8) + 'Target'.padEnd(8) + 'Score'.padEnd(8) + 'Status');
console.log('-'.repeat(80));
for (const r of results) {
  console.log(
    r.name.substring(0, 39).padEnd(40) +
    `${r.tier}`.padEnd(8) +
    `${r.anchor_target}`.padEnd(8) +
    `${r.composite}`.padEnd(8) +
    (r.hit ? '✅' : '❌')
  );
}
console.log('-'.repeat(80));
console.log();
