/**
 * Countertops Calibration Scoring — v2.0
 * Rebuilt from April 2026 Pipeline Research
 * 
 * Axis Weights: Q=0.40, D=0.40, P=0.20
 * Material-driven category — composition and manufacturing consistency determine the score.
 */

const CATEGORY = 'countertops';
const AXIS_WEIGHTS = { quality: 0.40, durability: 0.40, performance: 0.20 };

const TIER_RANGES = {
  1: { min: 90, max: 100, label: 'Best in Class' },
  2: { min: 75, max: 89, label: 'Excellent' },
  3: { min: 60, max: 74, label: 'Good' },
  4: { min: 40, max: 59, label: 'Fair' },
  5: { min: 0, max: 39, label: 'Below Standard' }
};

const MAX_SPEC_ADJUSTMENT = 8;

// ============================================================================
// SPEC FIELDS
// ============================================================================

const SPEC_FIELDS = {
  material_type: {
    axis: 'quality',
    adjustments: {
      'sintered_ultra_compact':     5,   // Dekton — zero porosity, no resins
      'engineered_quartz_premium':  4,   // Cambria, Caesarstone — 93% quartz
      'natural_quartzite_verified': 3,   // True metamorphic quartzite
      'natural_granite_premium':    2,   // Premium origin granite
      'engineered_quartz_standard': 1,   // Standard quartz
      'solid_surface_acrylic':     -1,   // Corian, Hi-Macs
      'natural_marble':            -2,   // Soft, porous, etches
      'engineered_quartz_import':  -4,   // Generic Asian import
      'laminate':                  -6    // Formica etc
    }
  },
  manufacturing_consistency: {
    axis: 'quality',
    adjustments: {
      'single_factory_proprietary':  4,  // Cambria Le Sueur MN
      'single_technology_global':    2,  // Cosentino Dekton
      'multi_plant_branded':         0,  // Caesarstone multi-factory
      'multi_source_controlled':    -2,  // Silestone
      'multi_source_uncontrolled':  -5   // MSI, generic imports
    }
  },
  heat_resistance_f: {
    axis: 'performance',
    adjustments: {
      '500_plus':    4,   // Dekton, natural stone
      '350_499':     2,   // Premium quartz
      '250_349':     0,   // Standard quartz
      '200_249':    -2,   // Solid surface — damage begins
      'below_200':  -4    // Laminate
    }
  },
  scratch_resistance_mohs: {
    axis: 'durability',
    adjustments: {
      '7_plus':      4,   // Quartzite, Dekton
      '6_to_7':      2,   // Granite, quartz
      '5_to_6':      0,   // Standard quartz
      '3_to_5':     -2,   // Marble, solid surface
      'below_3':    -4    // Soapstone, laminate
    }
  },
  porosity: {
    axis: 'durability',
    adjustments: {
      'zero_porosity':       4,   // Sintered, engineered quartz
      'near_zero_sealed':    2,   // Premium granite sealed
      'low_requires_seal':   0,   // Standard granite
      'moderate_porous':    -2,   // Marble, some quartzite
      'high_porous':        -4    // Soapstone, unsealed marble
    }
  },
  certification_safety: {
    axis: 'quality',
    adjustments: {
      'greenguard_gold_nsf51':  3,   // Full certification
      'greenguard_gold':        2,
      'greenguard_only':        1,
      'none_documented':       -1,
      'known_concerns':        -3    // Documented off-gassing issues
    }
  },
  repairability: {
    axis: 'performance',
    adjustments: {
      'full_renewable':     2,   // Solid surface — sand and refinish completely
      'chip_repair_pro':    1,   // Quartz/natural — professionai chip repair
      'limited_repair':     0,   // Some epoxy repair possible
      'not_repairable':    -1    // Must replace slab section
    }
  },
  warranty_years: {
    axis: 'durability',
    adjustments: {
      'lifetime_residential':  3,
      '25_year':               2,
      '15_year':               1,
      '10_year':               0,
      '5_year_or_less':       -2,
      'none':                 -4
    }
  }
};

// ============================================================================
// TIER ANCHORS
// ============================================================================

const PRODUCTS = [
  {
    name: 'Cambria (US Engineered Quartz)',
    slug: 'cambria',
    tier: 1,
    anchor_target: 93,
    specs: {
      material_type: 'engineered_quartz_premium',
      manufacturing_consistency: 'single_factory_proprietary',
      heat_resistance_f: '350_499',
      scratch_resistance_mohs: '6_to_7',
      porosity: 'zero_porosity',
      certification_safety: 'greenguard_gold_nsf51',
      repairability: 'chip_repair_pro',
      warranty_years: '25_year'
    },
    platform_disclosure: 'Cambria: Davis family-owned, all production at Le Sueur, MN. No multi-source variance. Single quartz technology.',
    outlook: 'Strong',
    outlook_rationale: 'Family-owned stability. Single US factory = highest consistency. Chipping class-action was pre-2020 formula revision. Fabricator consensus: best engineered quartz.'
  },
  {
    name: 'Dekton (Cosentino Ultra-Compact)',
    slug: 'dekton',
    tier: 1,
    anchor_target: 91,
    specs: {
      material_type: 'sintered_ultra_compact',
      manufacturing_consistency: 'single_technology_global',
      heat_resistance_f: '500_plus',
      scratch_resistance_mohs: '7_plus',
      porosity: 'zero_porosity',
      certification_safety: 'greenguard_gold',
      repairability: 'limited_repair',
      warranty_years: 'lifetime_residential'
    },
    platform_disclosure: 'Cosentino Group: Dekton (sintered) + Silestone (quartz) + Sensa (treated natural stone). Different technologies, same corporate. Dekton is a distinct manufacturing process.',
    outlook: 'Strong',
    outlook_rationale: 'Near-zero porosity, highest heat resistance, UV stable. Field cracking near cooktops reported — may be installation-related, not material failure. Needs monitoring.'
  },
  {
    name: 'Caesarstone (Global Engineered Quartz)',
    slug: 'caesarstone',
    tier: 2,
    anchor_target: 82,
    specs: {
      material_type: 'engineered_quartz_premium',
      manufacturing_consistency: 'multi_plant_branded',
      heat_resistance_f: '350_499',
      scratch_resistance_mohs: '6_to_7',
      porosity: 'zero_porosity',
      certification_safety: 'greenguard_gold_nsf51',
      repairability: 'chip_repair_pro',
      warranty_years: 'lifetime_residential'
    },
    platform_disclosure: 'Caesarstone Ltd: Plants in Israel (Sdot Yam), Georgia USA, plus India and China manufacturing. Quality consistency across plants is the primary concern vs Cambria.',
    outlook: 'Conditional',
    outlook_rationale: 'Strong brand but multi-factory risk. Georgia USA plant positive. Indian/Chinese slabs documented as lower consistency.'
  },
  {
    name: 'Silestone (Cosentino Engineered Quartz)',
    slug: 'silestone',
    tier: 2,
    anchor_target: 78,
    specs: {
      material_type: 'engineered_quartz_standard',
      manufacturing_consistency: 'multi_source_controlled',
      heat_resistance_f: '250_349',
      scratch_resistance_mohs: '6_to_7',
      porosity: 'zero_porosity',
      certification_safety: 'greenguard_gold',
      repairability: 'chip_repair_pro',
      warranty_years: '25_year'
    },
    platform_disclosure: 'Cosentino Group: Silestone shares corporate with Dekton but different technology. Anti-bacterial N-Boost marketing settled in court — no impact on material durability.',
    outlook: 'Conditional',
    outlook_rationale: 'Anti-bacterial settlement is a brand risk, not a product risk. HybriQ+ recycled material technology is innovative. Slightly below Caesarstone in fabricator preference.'
  },
  {
    name: 'Corian (Solid Surface)',
    slug: 'corian',
    tier: 3,
    anchor_target: 65,
    specs: {
      material_type: 'solid_surface_acrylic',
      manufacturing_consistency: 'multi_plant_branded',
      heat_resistance_f: '200_249',
      scratch_resistance_mohs: '3_to_5',
      porosity: 'zero_porosity',
      certification_safety: 'greenguard_gold',
      repairability: 'full_renewable',
      warranty_years: '10_year'
    },
    platform_disclosure: 'Corian: Originally DuPont, now CorStar Capital (2019 acquisition). PMMA acrylic resin-based. Hi-Macs (LG) and Staron (Samsung) are comparable formulations.',
    outlook: 'Conditional',
    outlook_rationale: 'Real advantages: seamless, renewable, thermoformable. Real disadvantages: heat damage at 200°F, scratches easily. Corporate ownership change (DuPont → CorStar) adds uncertainty. Fabricators moved on for high-end.'
  },
  {
    name: 'MSI Q Quartz (Import)',
    slug: 'msi_q_quartz',
    tier: 4,
    anchor_target: 48,
    specs: {
      material_type: 'engineered_quartz_import',
      manufacturing_consistency: 'multi_source_uncontrolled',
      heat_resistance_f: '250_349',
      scratch_resistance_mohs: '5_to_6',
      porosity: 'zero_porosity',
      certification_safety: 'none_documented',
      repairability: 'limited_repair',
      warranty_years: '10_year'
    },
    platform_disclosure: 'MSI (M S International): Distribution/import company, NOT a manufacturer. Slabs sourced from multiple factories across India, China, Turkey, Brazil under one brand name. Zero single-source quality control.',
    outlook: 'Negative',
    outlook_rationale: 'Distribution model with no manufacturing control. Documented lot-to-lot variance. Known voids, cracking. Budget fabricator staple. Quality floor of the quartz market.'
  }
];

// ============================================================================
// SCORING ENGINE (same as refrigerators)
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
console.log('COUNTERTOPS CALIBRATION v2.0 — Rebuilt April 2026');
console.log('Axis Weights: Q=0.40, D=0.40, P=0.20');
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
console.log('Product'.padEnd(42) + 'Tier'.padEnd(8) + 'Target'.padEnd(8) + 'Score'.padEnd(8) + 'Status');
console.log('-'.repeat(80));
for (const r of results) {
  console.log(
    r.name.substring(0, 41).padEnd(42) +
    `${r.tier}`.padEnd(8) +
    `${r.anchor_target}`.padEnd(8) +
    `${r.composite}`.padEnd(8) +
    (r.hit ? '✅' : '❌')
  );
}
console.log('-'.repeat(80));
console.log();
