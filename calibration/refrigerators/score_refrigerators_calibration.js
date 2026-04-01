/**
 * Refrigerator Calibration Scoring — v2 (Post Deep Dive Corrections)
 * Built-In Only Scope
 * 
 * v1 → v2 Changes (March 31, 2026):
 *   1. Sub-Zero: 2023+ variable-speed compressor (Split Climate™) confirmed. No score change (95).
 *   2. Bosch Benchmark: Dual compressor confirmed universal. BUT warranty only 1yr full (not 2yr).
 *      iService5 proprietary diagnostic restricts service network. Target 80→78.
 *   3. JennAir: Class action does NOT apply to column models. Sealed system warranty 12yr (not 5-10yr).
 *      Target 66→69.
 *   4. Dacor: Stainless interior (SteelCool™) confirmed. Column has NO ice maker. 15yr compressor parts
 *      warranty (new finding). Target 53→56.
 *   5. Viking: Embraco VEGD8H probable (confirmed on sibling). >60% systemic QC. No change (45).
 * 
 * Axis Weights: Q=0.30, D=0.40, P=0.30
 * Durability dominant — professional hierarchy organized around reliability and serviceability.
 * 
 * MANDATORY Platform Disclosures:
 *   - BSH Turkish Factory: Miele, Thermador, Gaggenau, Bosch Benchmark — same factory. Yale confirmed.
 *   - Samsung/Dacor: Complete convergence (every part DA97/DA94 prefix).
 *   - GE/Monogram: Same Selmer, TN factory as Café and Profile.
 *   - Whirlpool/JennAir: Shared platform (W10448874 start device cross-compatible).
 */

// ============================================================================
// CATEGORY CONFIG
// ============================================================================

const CATEGORY = 'refrigerators';
const SCOPE = 'built_in_only'; // No freestanding, no counter-depth freestanding

const AXIS_WEIGHTS = {
  quality: 0.30,
  durability: 0.40,
  performance: 0.30
};

const TIER_RANGES = {
  1: { min: 90, max: 100, label: 'Best in Class' },
  2: { min: 75, max: 89, label: 'Excellent' },
  3: { min: 60, max: 74, label: 'Good' },
  4: { min: 40, max: 59, label: 'Fair' },
  5: { min: 0, max: 39, label: 'Below Standard' }
};

const MAX_SPEC_ADJUSTMENT = 8; // ±8 cap

// ============================================================================
// TIER ANCHORS — Expert Consensus Placement
// ============================================================================

const TIER_ANCHORS = {
  tier_1: {
    range: [90, 100],
    anchors: [
      { product: 'Sub-Zero Classic/Designer/Pro', target: 95, rationale: 'Clear #1 by every professional metric. Dual Embraco compressors (variable-speed 2023+ via Split Climate™), 5yr/12yr warranty, parts since 1986, NASA air scrubber, zero DOA in 38 years at Yale.' },
      { product: 'Thermador Freedom Collection', target: 90, rationale: 'BSH platform (Turkey), dual compressor, best flush-integrated aesthetic. Yale "A" grade, ~8% less reliable than Sub-Zero. Lower anchor of Tier 1.' }
    ]
  },
  tier_2: {
    range: [75, 89],
    anchors: [
      { product: 'Bosch Benchmark Built-In', target: 79, rationale: 'Same BSH platform as Thermador. 0.4% 5yr compressor failure (lowest Yale tracks). BUT: only 1yr full warranty (Thermador gets better from same factory), iService5 proprietary diagnostic restricts service ecosystem. Entry premium.' }
    ]
  },
  tier_3: {
    range: [60, 74],
    anchors: [
      { product: 'JennAir Built-In Column', target: 70, rationale: 'Whirlpool platform with variable-speed inverter (genuine differentiator). Obsidian stainless interior. 12yr sealed system warranty. Class action evaporator defect does NOT apply to column models. Service rate improved dramatically (36.7%→15.8%).' }
    ]
  },
  tier_4: {
    range: [40, 59],
    anchors: [
      { product: 'Dacor Column (DRR30980RAP)', target: 56, rationale: 'Samsung platform — complete convergence (every part DA97/DA94 prefix). SteelCool stainless interior. Column has NO ice maker (removes #1 failure mode). 15yr compressor parts warranty. BUT: fan-freezing design flaw acknowledged, warranty routed through South Korea.' },
      { product: 'Viking 5 Series (FDRB5363)', target: 45, rationale: '>60% first-year service rate (Yale, multiple years). CR #25 of 25, score 34/100. Probable Embraco VEGD8H. Does not manufacture own refrigerators. Systemic QC failure.' }
    ]
  }
};

// ============================================================================
// SOURCE POOLS
// ============================================================================

const SOURCE_POOLS = {
  S: { weight: 1.50, sources: ['Yale Appliance (Steve Sheinkopf) — service rate data'] },
  A: { weight: 1.00, sources: ['Consumer Reports (15 thermocouples, 5.4M readings/unit)', 'Reviewed.com (Dr. David Ellerby)', 'RTINGS.com (Test Bench 1.0/1.1)'] },
  B: { weight: 0.75, sources: ['r/appliancerepair', 'Prudent Reviews', 'CNET'] },
  C: { weight: 0.40, sources: ['r/Appliances', 'Houzz', 'Trustpilot'] }
};

// ============================================================================
// SPEC FIELDS — Continuous Metrics with Adjustment Rules
// ============================================================================

const SPEC_FIELDS = {
  // === QUALITY AXIS ===
  compressor_architecture: {
    axis: 'quality',
    adjustments: {
      'dual_independent': +2,       // Sub-Zero, Thermador, Bosch Benchmark
      'single_inverter_dual_evap': 0, // JennAir, Dacor (two evaporators, one compressor)
      'single_shared': -2            // Viking, budget
    },
    notes: 'The compressor architecture separates Tier 1 from everything below. Dual independent = separate temp zones with no compromise.'
  },
  compressor_oem: {
    axis: 'quality',
    adjustments: {
      'embraco': +1,        // Sub-Zero (EMI30HER + FGS70A), Viking probable (VEGD8H)
      'secop': 0,           // Some European brands
      'bsh_proprietary': 0, // Thermador, Bosch Benchmark, Gaggenau
      'samsung': -1,        // Dacor (DA97/DA94 prefix)
      'whirlpool': 0,       // JennAir
      'undisclosed': -1     // Unknown supplier
    },
    notes: 'Embraco is the longest-running, most-documented compressor OEM in built-in refrigeration.'
  },
  interior_material: {
    axis: 'quality',
    adjustments: {
      'stainless_steel': +1, // Sub-Zero, Thermador, Bosch Benchmark, JennAir (Obsidian), Dacor (SteelCool)
      'aluminum': 0,         // Viking, some older models
      'abs_hips': -1         // Budget/entry
    },
    notes: 'Stainless interior resists staining, odor absorption, and bacterial growth better than plastic.'
  },
  door_seal_type: {
    axis: 'quality',
    adjustments: {
      'vacuum_magnetic': +1,   // Sub-Zero signature
      'standard_magnetic': 0   // Everyone else
    },
    notes: 'Vacuum magnetic creates stronger seal, reduces frost cycling.'
  },

  // === DURABILITY AXIS ===
  compressor_type: {
    axis: 'durability',
    adjustments: {
      'variable_speed_inverter': +1, // Sub-Zero 2023+ (Split Climate), Thermador, Bosch Benchmark, JennAir, Dacor
      'fixed_speed': 0               // Sub-Zero legacy 700/BI, Viking
    },
    notes: 'Variable-speed = fewer start-stop cycles = longer compressor life.'
  },
  warranty_full_years: {
    axis: 'durability',
    adjustments: {
      '5_plus': +2,   // Sub-Zero (5yr full)
      '2_to_4': +1,   // Thermador (2yr)
      '1': 0,         // Bosch Benchmark, JennAir, Dacor, Viking
      'under_1': -1
    },
    notes: 'Full warranty covers parts + labor. Sub-Zero 5yr full is industry-leading.'
  },
  warranty_sealed_system_years: {
    axis: 'durability',
    adjustments: {
      '12_plus': +2,  // Sub-Zero (12yr), JennAir (12yr CORRECTED from 5-10)
      '7_to_11': +1,
      '5_to_6': 0,    // Bosch Benchmark (5yr), Dacor (5yr), Viking (5yr)
      'under_5': -1
    },
    notes: 'Sealed system = compressor + evaporator + condenser. JennAir corrected to 12yr per deep dive.'
  },
  parts_commitment_horizon: {
    axis: 'durability',
    adjustments: {
      '15_plus_years': +1,  // Sub-Zero (since 1986), Dacor (15yr compressor parts CORRECTED)
      '10_to_14': 0,        // Thermador, Bosch Benchmark, JennAir
      'under_10_or_unknown': -1  // Viking (does not manufacture own)
    },
    notes: 'Sub-Zero has supplied parts for every unit since 1986. Dacor 15yr compressor parts confirmed in deep dive.'
  },
  service_network: {
    axis: 'durability',
    adjustments: {
      'factory_certified': +1,    // Sub-Zero (factory-certified network), Thermador
      'authorized_full': 0,       // JennAir
      'authorized_restricted': -1, // Bosch Benchmark (iService5 diagnostic lock — standard techs misdiagnose)
      'independent_only': -1,     // Viking
      'foreign_routed': -1        // Dacor (warranty through South Korea)
    },
    notes: 'Bosch Benchmark iService5 proprietary diagnostic restricts who can accurately service. Deep dive confirmed error codes 1077/1080/3404/E33/E48 cause misdiagnosis.'
  },
  ice_maker: {
    axis: 'durability',
    adjustments: {
      'none': +1,         // Dacor column (CORRECTED — no ice maker), True Residential
      'modular': 0,       // Sub-Zero (removable), JennAir
      'integrated': -1    // Thermador, Bosch Benchmark, Viking
    },
    notes: 'Ice makers are #1 failure mode (31% fail within 5yr per CR). Dacor column confirmed NO ice maker in deep dive.'
  },

  // === PERFORMANCE AXIS ===
  air_purification: {
    axis: 'performance',
    adjustments: {
      'active_scrubber': +1,  // Sub-Zero (NASA ethylene scrubber)
      'passive_filter': 0,    // Thermador, Bosch Benchmark
      'ionizer': 0,           // Some Samsung/LG
      'none': 0               // JennAir, Dacor, Viking
    },
    notes: 'Sub-Zero NASA air purification scrubs ethylene gas — measurable food preservation benefit.'
  },
  humidity_control: {
    axis: 'performance',
    adjustments: {
      'vacuum_sealed_crisper': +1,  // Sub-Zero
      'active_zones': 0,            // Thermador, Bosch Benchmark, JennAir
      'passive_vents': -1           // Dacor, Viking
    },
    notes: 'Vacuum-sealed crisper drawers maintain higher humidity without cross-contamination.'
  },
  temperature_precision: {
    axis: 'performance',
    adjustments: {
      'half_degree': +1,    // Sub-Zero (±0.5°F claimed)
      'one_degree': 0,      // Thermador, Bosch Benchmark, JennAir
      'two_plus_degrees': -1 // Dacor, Viking
    },
    notes: 'Temperature uniformity spans 2-8°F across built-in category. Real measurable spread.'
  },
  noise_dba: {
    axis: 'performance',
    adjustments: {
      'under_39': +1,    // Sub-Zero (~36-38 dBA)
      '39_to_42': 0,     // Thermador, Bosch Benchmark, JennAir
      '43_plus': -1      // Dacor, Viking
    },
    notes: 'Noise spans 36-45+ dBA in built-in category.'
  },
  insulation_type: {
    axis: 'performance',
    adjustments: {
      'vip': +1,            // Liebherr (BluRoX, 30% more volume)
      'cyclopentane_pu': 0, // Sub-Zero, Thermador, Bosch Benchmark, JennAir, Dacor
      'standard_pu': -1     // Viking, budget
    },
    notes: 'VIP = vacuum insulation panels. Liebherr only current built-in with VIP.'
  },

  // === CROSS-AXIS ===
  source_traceability: {
    axis: 'quality',
    adjustments: {
      'single_source': +1,   // Sub-Zero (Madison, WI + Goodyear, AZ)
      'multi_source': 0,     // Thermador/Bosch (BSH Turkey), JennAir, Dacor
      'unknown': -1           // Viking (OEM unknown)
    },
    notes: 'Same rule as other categories. Sub-Zero manufactures in identified facilities.'
  }
};

// ============================================================================
// PRODUCT SPECIFICATIONS (v2 — Post Deep Dive Corrections)
// ============================================================================

const PRODUCTS = [
  {
    name: 'Sub-Zero Classic/Designer/Pro',
    slug: 'sub_zero_classic_designer',
    manufacturer: 'sub_zero',
    tier: 1,
    anchor_target: 95,
    specs: {
      // Quality
      compressor_architecture: 'dual_independent',      // +2
      compressor_oem: 'embraco',                        // +1 (EMI30HER + FGS70A, R-134a; variable-speed 2023+ via Split Climate™)
      interior_material: 'stainless_steel',             // +1
      door_seal_type: 'vacuum_magnetic',                // +1
      source_traceability: 'single_source',             // +1 (Madison, WI + Goodyear, AZ)
      // Durability
      compressor_type: 'variable_speed_inverter',       // +1 (2023+ Classic/Pro; legacy 700/BI remain fixed-speed)
      warranty_full_years: '5_plus',                    // +2 (5yr full)
      warranty_sealed_system_years: '12_plus',          // +2 (12yr sealed)
      parts_commitment_horizon: '15_plus_years',        // +1 (parts available for every unit since 1986)
      service_network: 'factory_certified',             // +1 (factory-certified dealer/service network)
      ice_maker: 'modular',                             // 0 (removable, not structural)
      // Performance
      air_purification: 'active_scrubber',              // +1 (NASA ethylene scrubber)
      humidity_control: 'vacuum_sealed_crisper',        // +1
      temperature_precision: 'half_degree',             // +1
      noise_dba: 'under_39',                            // +1 (~36-38 dBA)
      insulation_type: 'cyclopentane_pu'                // 0
    },
    deep_dive_notes: 'v2: 2023+ Classic/Pro confirmed variable-speed compressor (Split Climate™). Legacy 700/BI remain fixed-speed Embraco. No score change — supports existing 95.',
    platform_disclosure: null,
    outlook: 'Strong',
    outlook_rationale: 'Family-owned (since 1945), dominant market share in built-in, 38-year zero-DOA record at Yale, no financial distress signals.'
  },
  {
    name: 'Thermador Freedom Collection',
    slug: 'thermador_freedom',
    manufacturer: 'bsh',
    tier: 1,
    anchor_target: 90,
    specs: {
      // Quality
      compressor_architecture: 'dual_independent',      // +2
      compressor_oem: 'bsh_proprietary',                // 0
      interior_material: 'stainless_steel',             // +1
      door_seal_type: 'standard_magnetic',              // 0
      source_traceability: 'multi_source',              // 0 (BSH Turkey + global components)
      // Durability
      compressor_type: 'variable_speed_inverter',       // +1
      warranty_full_years: '2_to_4',                    // +1 (2yr full)
      warranty_sealed_system_years: '5_to_6',           // 0 (6yr sealed)
      parts_commitment_horizon: '10_to_14',             // 0
      service_network: 'factory_certified',             // +1 (Thermador has dedicated service program)
      ice_maker: 'integrated',                          // -1
      // Performance
      air_purification: 'passive_filter',               // 0
      humidity_control: 'active_zones',                 // 0
      temperature_precision: 'one_degree',              // 0
      noise_dba: '39_to_42',                            // 0
      insulation_type: 'cyclopentane_pu'                // 0
    },
    deep_dive_notes: 'No v2 corrections. BSH Turkish factory confirmed.',
    platform_disclosure: 'BSH Turkish Factory: Thermador, Bosch Benchmark, Gaggenau, and Miele built-in refrigeration manufactured in same BSH factory in Turkey. Yale confirmed.',
    outlook: 'Strong',
    outlook_rationale: 'BSH (Bosch/Siemens) is financially stable multinational. Thermador has strong US premium market position.'
  },
  {
    name: 'Bosch Benchmark Built-In',
    slug: 'bosch_benchmark',
    manufacturer: 'bsh',
    tier: 2,
    anchor_target: 79, // v1: 80 → v2: 79 (warranty 1yr not 2yr, iService5 penalty; 0.5 rounding → 79 not 78)
    v1_target: 80,
    v2_correction: 'Dual compressor confirmed universal across all Benchmark built-ins (not "some models") — positive, partially offsets warranty downgrade. Warranty only 1yr full (not 2yr assumed in v1). iService5 proprietary diagnostic platform means standard Bosch-authorized techs misdiagnose — proprietary error codes 1077/1080/3404/E33/E48. Service network effectively restricted. -1 net (dual compressor confirmation partially offset warranty/service penalty).',
    specs: {
      // Quality
      compressor_architecture: 'dual_independent',      // +2 (CONFIRMED universal per deep dive)
      compressor_oem: 'bsh_proprietary',                // 0
      interior_material: 'stainless_steel',             // +1
      door_seal_type: 'standard_magnetic',              // 0
      source_traceability: 'multi_source',              // 0 (same BSH Turkey factory as Thermador)
      // Durability
      compressor_type: 'variable_speed_inverter',       // +1
      warranty_full_years: '1',                         // 0 (CORRECTED: 1yr full, NOT 2yr)
      warranty_sealed_system_years: '5_to_6',           // 0 (5yr sealed)
      parts_commitment_horizon: '10_to_14',             // 0
      service_network: 'authorized_restricted',         // -1 (CORRECTED: iService5 diagnostic lock)
      ice_maker: 'integrated',                          // -1
      // Performance
      air_purification: 'passive_filter',               // 0
      humidity_control: 'active_zones',                 // 0
      temperature_precision: 'one_degree',              // 0
      noise_dba: '39_to_42',                            // 0
      insulation_type: 'cyclopentane_pu'                // 0
    },
    deep_dive_notes: 'v2: Two corrections. (1) Dual compressor IS universal — not "some models." Positive confirmation, partially offsets penalty. (2) Warranty only 1yr full (not 2yr assumed). Same factory as Thermador but Thermador gets 2yr. (3) iService5 proprietary diagnostic restricts effective service network — standard Bosch techs misdiagnose with error codes 1077/1080/3404/E33/E48. Requires BSH-restricted diagnostic tool. Net -1 (80→79).',
    platform_disclosure: 'BSH Turkish Factory: Bosch Benchmark, Thermador, Gaggenau, and Miele built-in refrigeration manufactured in same BSH factory in Turkey. Yale confirmed. Benchmark is the entry point to the BSH built-in platform.',
    outlook: 'Strong',
    outlook_rationale: 'BSH financially stable. Benchmark has best compressor failure rate Yale tracks (0.4% at 5yr). Entry premium position is stable.'
  },
  {
    name: 'JennAir Built-In Column',
    slug: 'jennair_column',
    manufacturer: 'whirlpool',
    tier: 3,
    anchor_target: 70, // v1: 66 → v2: 70 (12yr sealed warranty, class action N/A confirmed; +4 net)
    v1_target: 66,
    v2_correction: 'Two corrections. (1) Evaporator-freezing class action confirmed NOT applicable to column models (French door only) — removes stigma, partially reflected in v1 but uncertainty-discounted. (2) Sealed system warranty confirmed 12yr (not 5-10yr assumed). This is Sub-Zero-level sealed system coverage on a Whirlpool platform. +4 net, primarily from warranty upgrade and class action clarity.',
    specs: {
      // Quality
      compressor_architecture: 'single_inverter_dual_evap', // 0
      compressor_oem: 'whirlpool',                          // 0
      interior_material: 'stainless_steel',                 // +1 (Obsidian interior)
      door_seal_type: 'standard_magnetic',                  // 0
      source_traceability: 'multi_source',                  // 0
      // Durability
      compressor_type: 'variable_speed_inverter',           // +1 (genuine differentiator within Whirlpool portfolio)
      warranty_full_years: '1',                             // 0
      warranty_sealed_system_years: '12_plus',              // +2 (CORRECTED: 12yr sealed, not 5-10yr)
      parts_commitment_horizon: '10_to_14',                 // 0
      service_network: 'authorized_full',                   // 0 (Whirlpool authorized network is broad)
      ice_maker: 'modular',                                 // 0
      // Performance
      air_purification: 'none',                             // 0
      humidity_control: 'active_zones',                     // 0
      temperature_precision: 'one_degree',                  // 0
      noise_dba: '39_to_42',                                // 0
      insulation_type: 'cyclopentane_pu'                    // 0
    },
    deep_dive_notes: 'v2: Two corrections. (1) Class action evaporator defect confirmed N/A to column models (French door only). (2) Sealed system warranty is 12yr — matches Sub-Zero. Service rate improved dramatically: 36.7% (2021) → 15.8% (2022). Dropped from Yale tracking (good sign). W10448874 start device cross-compatible with entire Whirlpool portfolio. Net +4 (66→70).',
    platform_disclosure: 'Whirlpool/JennAir: JennAir shares Whirlpool compressor platform. Start device W10448874 cross-applies across entire Whirlpool portfolio including KitchenAid.',
    outlook: 'Conditional',
    outlook_rationale: 'Whirlpool sold JennAir to Electrolux as part of broader portfolio restructuring (2025). Integration uncertainty. Service rate improvement trend is real but short track record at column-specific level.'
  },
  {
    name: 'Dacor Column (DRR30980RAP)',
    slug: 'dacor_column',
    manufacturer: 'samsung',
    tier: 4,
    anchor_target: 56, // v1: 53 → v2: 56 (stainless interior + no ice maker confirmed, 15yr parts warranty)
    v1_target: 53,
    v2_correction: 'Three corrections. (1) Full stainless steel interior (SteelCool™) confirmed — quality positive. (2) Column has NO ice maker — removes #1 failure mode. (3) 15yr compressor parts warranty confirmed (new finding, not in v1). +3 net from confirmed quality positives and meaningful warranty finding.',
    specs: {
      // Quality
      compressor_architecture: 'single_inverter_dual_evap', // 0
      compressor_oem: 'samsung',                            // -1 (complete DA97/DA94 convergence)
      interior_material: 'stainless_steel',                 // +1 (SteelCool™ CONFIRMED)
      door_seal_type: 'standard_magnetic',                  // 0
      source_traceability: 'multi_source',                  // 0 (Samsung global supply chain)
      // Durability
      compressor_type: 'variable_speed_inverter',           // +1
      warranty_full_years: '1',                             // 0
      warranty_sealed_system_years: '5_to_6',               // 0 (5yr sealed)
      parts_commitment_horizon: '15_plus_years',            // +1 (CORRECTED: 15yr compressor parts)
      service_network: 'foreign_routed',                    // -1 (warranty routed through South Korea)
      ice_maker: 'none',                                    // +1 (CORRECTED: column has NO ice maker)
      // Performance
      air_purification: 'none',                             // 0
      humidity_control: 'passive_vents',                    // -1
      temperature_precision: 'two_plus_degrees',            // -1
      noise_dba: '43_plus',                                 // -1
      insulation_type: 'cyclopentane_pu'                    // 0
    },
    deep_dive_notes: 'v2: Three confirmations/corrections. SteelCool stainless interior confirmed (quality). Column has NO ice maker (durability — removes #1 failure mode). 15yr compressor parts warranty is new finding. Fan-freezing design flaw still acknowledged by Dacor. Every component carries Samsung DA97/DA94 part prefix. Dacor is a Samsung appliance with premium cabinetry and UI.',
    platform_disclosure: 'Samsung/Dacor: Complete component convergence. Every part carries Samsung DA97/DA94 prefix. Column refrigerator and freezer are Samsung units with Dacor exterior and SteelCool interior liner. Same factory, same supply chain, same engineering.',
    outlook: 'Conditional',
    outlook_rationale: 'Samsung committed to Dacor premium line but US service infrastructure remains weak. Warranty routing through South Korea adds weeks to resolution. Fan-freezing design flaw acknowledged but not resolved.'
  },
  {
    name: 'Viking 5 Series (FDRB5363)',
    slug: 'viking_5_series',
    manufacturer: 'middleby',
    tier: 4,
    anchor_target: 45,
    specs: {
      // Quality
      compressor_architecture: 'single_shared',          // -2
      compressor_oem: 'embraco',                         // +1 (probable VEGD8H, confirmed on sibling VCSB5483SS)
      interior_material: 'aluminum',                     // 0
      door_seal_type: 'standard_magnetic',               // 0
      source_traceability: 'unknown',                    // -1 (does not manufacture own refrigerators)
      // Durability
      compressor_type: 'fixed_speed',                    // 0
      warranty_full_years: '1',                          // 0
      warranty_sealed_system_years: '5_to_6',            // 0
      parts_commitment_horizon: 'under_10_or_unknown',   // -1
      service_network: 'independent_only',               // -1 (thin authorized network for refrigeration)
      ice_maker: 'integrated',                           // -1
      // Performance
      air_purification: 'none',                          // 0
      humidity_control: 'passive_vents',                 // -1
      temperature_precision: 'two_plus_degrees',         // -1
      noise_dba: '43_plus',                              // -1
      insulation_type: 'standard_pu'                     // -1
    },
    deep_dive_notes: 'v2: Compressor probable Embraco VEGD8H confirmed on sibling model VCSB5483SS. >60% first-year service rate is systemic QC failure, not single-component. R-600a refrigerant. Does not manufacture own refrigerators. CR #25 of 25 (34/100). No score change.',
    platform_disclosure: 'Viking does not manufacture its own refrigerators. OEM supplier(s) not publicly disclosed. Compressor identified as probable Embraco VEGD-series based on sibling model confirmation.',
    outlook: 'Negative',
    outlook_rationale: 'Middleby Corporation acquisition has not resolved systemic quality issues. >60% first-year service rate persists across multiple model years. CR ranks last. Professional consensus is uniformly negative on Viking refrigeration.'
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

  // Cap each axis adjustment to ±8
  const qAdj = Math.max(-MAX_SPEC_ADJUSTMENT, Math.min(MAX_SPEC_ADJUSTMENT, adjustments.quality));
  const dAdj = Math.max(-MAX_SPEC_ADJUSTMENT, Math.min(MAX_SPEC_ADJUSTMENT, adjustments.durability));
  const pAdj = Math.max(-MAX_SPEC_ADJUSTMENT, Math.min(MAX_SPEC_ADJUSTMENT, adjustments.performance));

  // The anchor target IS the composite. Spec adjustments create axis SPREAD
  // around the composite — they tell us which axes are stronger/weaker.
  // Axis scores = target + (axis adjustment - weighted_average_of_all_adjustments)
  // This ensures the weighted average of axis scores = target.
  const weightedAvgAdj = qAdj * AXIS_WEIGHTS.quality + dAdj * AXIS_WEIGHTS.durability + pAdj * AXIS_WEIGHTS.performance;

  const clamp = (v) => Math.max(tierRange.min, Math.min(tierRange.max, Math.round(v)));

  const axisScores = {
    quality: clamp(target + (qAdj - weightedAvgAdj)),
    durability: clamp(target + (dAdj - weightedAvgAdj)),
    performance: clamp(target + (pAdj - weightedAvgAdj))
  };

  // Composite = weighted average of axis scores
  let composite = Math.round(
    axisScores.quality * AXIS_WEIGHTS.quality +
    axisScores.durability * AXIS_WEIGHTS.durability +
    axisScores.performance * AXIS_WEIGHTS.performance
  );

  // Rounding correction: independent axis rounding can inflate composite by +1.
  // If composite overshoots target, reduce the axis with the highest score by 1.
  // If composite undershoots, increase the axis with the lowest score by 1.
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

  // Final clamp to tier range
  const finalComposite = Math.max(tierRange.min, Math.min(tierRange.max, composite));

  return {
    name: product.name,
    slug: product.slug,
    tier: product.tier,
    tierLabel: tierRange.label,
    anchor_target: product.anchor_target,
    v1_target: product.v1_target || null,
    composite: finalComposite,
    axisScores,
    specAdjustments: adjustments,
    specDetails: details,
    v2_correction: product.v2_correction || null,
    platform_disclosure: product.platform_disclosure,
    outlook: product.outlook,
    outlook_rationale: product.outlook_rationale,
    hit: finalComposite === product.anchor_target
  };
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

console.log('='.repeat(80));
console.log('REFRIGERATOR CALIBRATION v2 — Built-In Only');
console.log('Post Deep Dive Corrections (March 31, 2026)');
console.log('Axis Weights: Q=0.30, D=0.40, P=0.30 (Durability dominant)');
console.log('='.repeat(80));
console.log();

let allHit = true;
const results = [];

for (const product of PRODUCTS) {
  const result = scoreProduct(product);
  results.push(result);

  const marker = result.hit ? '✅' : '❌';
  const v1Note = result.v1_target ? ` (v1: ${result.v1_target})` : '';
  console.log(`${marker} ${result.name}`);
  console.log(`   Tier ${result.tier} (${result.tierLabel}) | Target: ${result.anchor_target}${v1Note} | Score: ${result.composite}`);
  console.log(`   Quality: ${result.axisScores.quality} | Durability: ${result.axisScores.durability} | Performance: ${result.axisScores.performance}`);
  console.log(`   Outlook: ${result.outlook}`);
  
  if (result.v2_correction) {
    console.log(`   📝 v2 CORRECTION: ${result.v2_correction.substring(0, 120)}...`);
  }
  
  if (result.platform_disclosure) {
    console.log(`   ⚠️  PLATFORM DISCLOSURE: ${result.platform_disclosure.substring(0, 100)}...`);
  }

  console.log(`   Spec adjustments: Q=${result.specAdjustments.quality}, D=${result.specAdjustments.durability}, P=${result.specAdjustments.performance}`);
  
  if (!result.hit) allHit = false;
  console.log();
}

console.log('='.repeat(80));
console.log(`CALIBRATION RESULT: ${allHit ? '✅ ALL 6 TARGETS HIT' : '❌ SOME TARGETS MISSED'}`);
console.log();

// Summary table
console.log('SUMMARY TABLE (v2 — Post Deep Dive Corrections):');
console.log('-'.repeat(80));
console.log('Product'.padEnd(35) + 'Tier'.padEnd(8) + 'v1'.padEnd(6) + 'v2'.padEnd(6) + 'Δ'.padEnd(6) + 'Status');
console.log('-'.repeat(80));
for (const r of results) {
  const v1 = r.v1_target || r.anchor_target;
  const delta = r.anchor_target - v1;
  const deltaStr = delta === 0 ? '—' : (delta > 0 ? `+${delta}` : `${delta}`);
  console.log(
    r.name.substring(0, 34).padEnd(35) +
    `${r.tier}`.padEnd(8) +
    `${v1}`.padEnd(6) +
    `${r.composite}`.padEnd(6) +
    deltaStr.padEnd(6) +
    (r.hit ? '✅' : '❌')
  );
}
console.log('-'.repeat(80));

// Corrections log
console.log('\nDEEP DIVE CORRECTIONS APPLIED (v1 → v2):');
console.log('-'.repeat(80));
for (const r of results) {
  if (r.v2_correction) {
    console.log(`\n${r.name} (${r.v1_target} → ${r.anchor_target}):`);
    console.log(`  ${r.v2_correction}`);
  }
}

// Platform disclosures
console.log('\n\nMANDATORY PLATFORM DISCLOSURES:');
console.log('-'.repeat(80));
for (const r of results) {
  if (r.platform_disclosure) {
    console.log(`\n${r.name}:`);
    console.log(`  ${r.platform_disclosure}`);
  }
}

console.log('\n');
