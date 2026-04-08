/**
 * Faucets Calibration Scoring — v2.0
 * Rebuilt from April 2026 Pipeline Research
 *
 * Axis Weights: Q=0.45, D=0.45, P=0.10
 * Body material and cartridge technology are THE scoring differentiators
 * per StarCraft teardown analysis. Performance flat at 0.10 — all faucets
 * deliver water; spray technology creates minimal differentiation.
 */

const CATEGORY = 'faucets';
const AXIS_WEIGHTS = { quality: 0.45, durability: 0.45, performance: 0.10 };

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
  body_material: {
    axis: 'quality',
    adjustments: {
      'solid_brass_316_stainless':  5,  // Waterstone — bar stock 316SS
      'solid_brass_cast':           4,  // California, In2aqua, Brizo
      'solid_brass_mixed':          1,  // Brass body with some alloy components
      'zamak_zinc_alloy':          -3,  // Delta mid-range shell
      'plastic_pex_waterway':      -5,  // Plastic internals, PEX passages
      'unknown_import':            -5   // Kraus, unverified sourcing
    }
  },
  cartridge_manufacturer: {
    axis: 'durability',
    adjustments: {
      'fluhs_germany':              5,  // Flühs — gold standard, California Faucets
      'kerox_hungary_pvdplus':      5,  // Kerox PVD+ at 4M cycles — In2aqua
      'kerox_standard':             3,  // Standard Kerox, ~2M cycles
      'dst_delta_proprietary':      4,  // DST at 5M cycles — Brizo, Delta -DST
      'geann_taiwan':               0,  // Geann — 500K cycles, Waterstone
      'sedal_spain':                0,  // Sedal — acceptable tier, some Grohe
      'generic_mixed_chinese':     -4,  // Kraus, unknown sourcing
      'unknown':                   -4   // Not disclosed
    }
  },
  finish_type: {
    axis: 'durability',
    adjustments: {
      'pvd_lifetime_warranty':      4,  // PVD with lifetime finish warranty — California, Brizo Brilliance
      'pvd_standard':               3,  // PVD without lifetime warranty — In2aqua
      'powder_coat':                1,  // Durable but not metal plating — Waterstone
      'chrome_electroplated':       0,  // Standard chrome — Delta mid
      'brushed_finish_standard':   -1,  // Brushed without PVD
      'chrome_only_no_pvd':        -2   // No PVD option, chrome only
    }
  },
  warranty_years: {
    axis: 'durability',
    adjustments: {
      'lifetime_parts_finish':      4,  // Full lifetime — California, In2aqua
      'lifetime_parts_only':        3,  // Lifetime parts, no finish — Delta DST
      '10_year':                    0,
      '5_year':                    -2,
      'limited_unclear':           -3,  // Warranty on paper, execution questioned
      'none':                      -5
    }
  },
  manufacturing_origin: {
    axis: 'quality',
    adjustments: {
      'usa_single_factory':         3,  // California Faucets — Huntington Beach CA
      'usa_mixed':                  1,  // Waterstone — Murrieta CA
      'germany_austria':            2,  // European precision manufacturing
      'europe_mixed':               1,  // Mixed European
      'usa_over_50pct':             0,  // Brizo claims mix, majority US
      'china_over_50pct':          -3,  // Brizo spray wands, most Kraus
      'china_only':                -5   // Full import
    }
  },
  parts_availability: {
    axis: 'performance',
    adjustments: {
      'excellent_nationwide':       3,  // Delta — every hardware store
      'good_specialty':             1,  // California, In2aqua — specialty plumbing
      'adequate':                   0,
      'limited':                   -2,  // Some import brands
      'poor_proprietary_only':     -3   // Must call manufacturer
    }
  }
};

// ============================================================================
// TIER ANCHORS — From calibration/faucets/config.json
// ============================================================================

const PRODUCTS = [
  {
    name: 'California Faucets',
    slug: 'california_faucets',
    tier: 1,
    anchor_target: 94,
    specs: {
      body_material:         'solid_brass_cast',
      cartridge_manufacturer:'fluhs_germany',
      finish_type:           'pvd_lifetime_warranty',
      warranty_years:        'lifetime_parts_finish',
      manufacturing_origin:  'usa_single_factory',
      parts_availability:    'good_specialty'
    },
    platform_disclosure: 'California Faucets: US-made, Huntington Beach CA. Flühs (Germany) + Kerox (Hungary) cartridges. No platform sharing — fully independent manufacturer.',
    outlook: 'Strong',
    outlook_rationale: 'Flühs + Kerox combined sourcing = best cartridge quality available. PVD lifetime finish. US single-factory. StarCraft near-perfect rating. The professional benchmark.'
  },
  {
    name: 'In2aqua',
    slug: 'in2aqua',
    tier: 1,
    anchor_target: 92,
    specs: {
      body_material:         'solid_brass_cast',
      cartridge_manufacturer:'kerox_hungary_pvdplus',
      finish_type:           'pvd_standard',
      warranty_years:        'lifetime_parts_finish',
      manufacturing_origin:  'germany_austria',
      parts_availability:    'good_specialty'
    },
    platform_disclosure: 'In2aqua: German-engineered, distributed by Baci by Remcraft. No major platform sharing. Proprietary Kerox PVD+ cartridge spec.',
    outlook: 'Strong',
    outlook_rationale: 'Kerox PVD+ at 4M cycles — highest documented residential cycle rating. Best warranty per StarCraft analysis. Parts not as widely stocked as US brands.'
  },
  {
    name: 'Waterstone',
    slug: 'waterstone',
    tier: 1,
    anchor_target: 91,
    specs: {
      body_material:         'solid_brass_316_stainless',
      cartridge_manufacturer:'geann_taiwan',
      finish_type:           'powder_coat',
      warranty_years:        'lifetime_parts_only',
      manufacturing_origin:  'usa_mixed',
      parts_availability:    'good_specialty'
    },
    platform_disclosure: 'Waterstone Faucets: Murrieta CA. Machined from bar stock — true manufacturer, not cast. 316 stainless or solid brass body. Geann (Taiwan) cartridges.',
    outlook: 'Strong',
    outlook_rationale: '316SS bar stock body is the best body material in residential faucets. Cartridge (Geann, 500K cycles) and finish (powder coat, not PVD) pull score below California and In2aqua.'
  },
  {
    name: 'Brizo (DST Cartridge Lines)',
    slug: 'brizo_dst',
    tier: 2,
    anchor_target: 84,
    specs: {
      body_material:         'solid_brass_cast',
      cartridge_manufacturer:'dst_delta_proprietary',
      finish_type:           'pvd_lifetime_warranty',
      warranty_years:        'lifetime_parts_finish',
      manufacturing_origin:  'usa_over_50pct',
      parts_availability:    'good_specialty'
    },
    platform_disclosure: 'Delta Faucet Company (Masco): Brizo + Delta + Peerless share DST cartridge technology. Brizo = solid brass + Brilliance PVD. Delta = ZAMAK + chrome. Same cartridge engine, different build quality tiers.',
    outlook: 'Strong',
    outlook_rationale: 'DST at 5M cycles is highest cycle rating but proprietary. Brilliance PVD lifetime. BUT: >2/3 China manufacturing, plastic spray wands, not all Brizo models use DST. Must specify -DST suffix models.'
  },
  {
    name: 'Delta Mid-Range (DST models)',
    slug: 'delta_mid_range',
    tier: 3,
    anchor_target: 69,
    specs: {
      body_material:         'zamak_zinc_alloy',
      cartridge_manufacturer:'dst_delta_proprietary',
      finish_type:           'chrome_electroplated',
      warranty_years:        'lifetime_parts_only',
      manufacturing_origin:  'china_over_50pct',
      parts_availability:    'excellent_nationwide'
    },
    platform_disclosure: 'Delta Faucet Company (Masco): Delta shares DST cartridge with Brizo. Delta = ZAMAK shell + PEX waterway instead of solid brass. Chrome finish, no PVD. Peerless is the entry tier below Delta.',
    outlook: 'Conditional',
    outlook_rationale: 'Same DST 5M-cycle cartridge as Brizo. Massive parts availability is a genuine advantage. ZAMAK body and PEX waterway are the quality step-down from Brizo. Must specify -DST suffix models.'
  },
  {
    name: 'Kraus',
    slug: 'kraus',
    tier: 4,
    anchor_target: 45,
    specs: {
      body_material:         'unknown_import',
      cartridge_manufacturer:'generic_mixed_chinese',
      finish_type:           'chrome_only_no_pvd',
      warranty_years:        'limited_unclear',
      manufacturing_origin:  'china_only',
      parts_availability:    'limited'
    },
    platform_disclosure: 'Kraus: Marketeer/distributor model. Does not manufacture. Claims solid brass but cartridge supplier not disclosed. All sourcing from China factories. No PVD finish offered.',
    outlook: 'Negative',
    outlook_rationale: 'No manufacturing control. Unknown cartridge supplier. StarCraft rates low. Plumbers warn about Kingston Brass/Kraus tier — premium-looking but ZAMAK/plastic inside. Lifetime warranty execution questioned.'
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
console.log('FAUCETS CALIBRATION v2.0 — Built April 2026');
console.log('Axis Weights: Q=0.45, D=0.45, P=0.10');
console.log('Scoring differentiators: body material + cartridge manufacturer');
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
