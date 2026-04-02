#!/usr/bin/env node
/**
 * Water Heaters Calibration Scoring — v1 (Pre Deep Dive)
 *
 * 7 calibration products: 3 tankless, 2 tank, 1 heat pump, 1 retail tank
 * Weights: Q=0.30, D=0.40, P=0.30
 * Method: Geometric mean, no axis stretch
 * Pool S: VACANT (Yale does not cover water heaters)
 *
 * Usage: /usr/local/bin/node score_water_heaters_calibration.js
 */

const WEIGHTS = { quality: 0.30, durability: 0.40, performance: 0.30 };

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
    name: 'Rinnai RU199iN SENSEI Condensing Tankless',
    slug: 'rinnai_ru199in',
    sub_type: 'tankless_gas',
    target: 93,
    tier: 'Tier 1',
    specs: {
      sub_type: 'tankless_condensing',
      heat_exchanger_material_tankless: 'dual_stainless_steel',
      burner_system_gas: 'premix_metal_fiber',
      distribution_channel: 'professional_and_retail',
      source_traceability: 'single_source_manufacturing',
      uef_efficiency: 0.95,
      max_gpm_tankless: 11.0,
      temperature_rise_capability: 'excellent_high_demand',
      recirculation_system: 'compatible_external',
      noise_dba: 'standard_50_60',
      heat_exchanger_warranty_years_tankless: 15,
      expected_lifespan_years: '20_plus',
      scale_resistance_maintenance: 'maintenance_required_annual',
      parts_availability: 'brand_specific_available',
      service_network: 'brand_certified_network',
      control_board_reliability: 'proven_reliable_simple',
    },
    axis_scores: { quality: 9.5, durability: 9.2, performance: 9.4 },
    notes: [
      '78 luxury listing sightings — the tankless brand luxury builders name',
      'SENSEI series: dual stainless HX, 199K BTU, 11 GPM',
      'Japanese engineering (Nagoya), US assembly (Griffin, GA)',
      'Circ-Logic recirculation compatible — requires external pump',
      '15yr HX warranty (residential)',
      'Professional installer consensus = benchmark reliability',
      'STRENGTH: Proven field reliability — longest track record in US residential tankless',
      'WEAKNESS: No built-in recirculation (Navien has this)',
    ],
    report_fields: {
      corporate_parent: 'Rinnai Corporation — publicly traded (TSE: 5947), Nagoya, Japan',
      outlook: 'Strong',
      manufacturing: 'Nagoya, Japan (engineering) + Griffin, Georgia (US assembly)',
    },
  },

  {
    name: 'Navien NPE-240A2 Condensing Tankless',
    slug: 'navien_npe240a2',
    sub_type: 'tankless_gas',
    target: 91,
    tier: 'Tier 1',
    specs: {
      sub_type: 'tankless_condensing',
      heat_exchanger_material_tankless: 'dual_stainless_steel',
      burner_system_gas: 'premix_stamped',
      distribution_channel: 'professional_and_retail',
      source_traceability: 'multi_source_identified',
      uef_efficiency: 0.96,
      max_gpm_tankless: 11.2,
      temperature_rise_capability: 'excellent_high_demand',
      recirculation_system: 'built_in_pump_and_buffer',
      noise_dba: 'standard_50_60',
      smart_connectivity: 'wifi_with_diagnostics',
      heat_exchanger_warranty_years_tankless: 15,
      expected_lifespan_years: '20_plus',
      scale_resistance_maintenance: 'maintenance_required_annual',
      parts_availability: 'brand_specific_available',
      service_network: 'brand_certified_network',
      control_board_reliability: 'standard_electronic',
    },
    axis_scores: { quality: 9.3, durability: 8.6, performance: 9.5 },
    notes: [
      'Innovation leader — built-in ComfortFlow recirculation pump + buffer tank',
      'Dual stainless HX, 0.96 UEF, 11.2 GPM max',
      'NaviLink WiFi diagnostics',
      'CRITICAL WARRANTY: 15yr HX with controlled recirc, 5yr with uncontrolled — conditional warranty is a material disclosure',
      'Korean manufacturing (Kyungdong Navien)',
      'Highest turndown ratio in calibration set',
      'STRENGTH: Built-in recirculation eliminates cold water sandwich',
      'WEAKNESS: Conditional warranty — uncontrolled recirc drops from 15yr to 5yr',
      'WEAKNESS: More complex electronics than Rinnai = more potential failure points',
    ],
    report_fields: {
      corporate_parent: 'KD Navien Co., Ltd. — subsidiary of Kyungdong Group, Seoul, South Korea',
      outlook: 'Strong',
      manufacturing: 'Seoul, South Korea',
    },
  },

  {
    name: 'Noritz EZ111DV Condensing Tankless',
    slug: 'noritz_ez111dv',
    sub_type: 'tankless_gas',
    target: 82,
    tier: 'Tier 2',
    specs: {
      sub_type: 'tankless_condensing',
      heat_exchanger_material_tankless: 'dual_stainless_steel',
      burner_system_gas: 'premix_stamped',
      distribution_channel: 'professional_and_retail',
      source_traceability: 'multi_source_identified',
      uef_efficiency: 0.98,
      max_gpm_tankless: 11.1,
      temperature_rise_capability: 'excellent_high_demand',
      recirculation_system: 'compatible_external',
      noise_dba: 'standard_50_60',
      heat_exchanger_warranty_years_tankless: 25,
      expected_lifespan_years: '20_plus',
      scale_resistance_maintenance: 'maintenance_required_annual',
      parts_availability: 'brand_specific_available',
      service_network: 'brand_certified_network',
      control_board_reliability: 'standard_electronic',
    },
    axis_scores: { quality: 8.4, durability: 8.2, performance: 8.0 },
    notes: [
      '0.98 UEF — highest efficiency in calibration set',
      '25yr HX warranty — BEST in class, no conditions',
      'Top-mount connections for easy tank-to-tankless retrofit',
      'Japanese engineering (Kobe)',
      'STRENGTH: Industry-leading 25yr HX warranty with NO conditions',
      'STRENGTH: Highest UEF (0.98) in calibration set',
      'WEAKNESS: Smaller US market presence than Rinnai/Navien = narrower service/parts network',
      'WEAKNESS: No built-in recirculation system',
    ],
    report_fields: {
      corporate_parent: 'Noritz Corporation — publicly traded (TSE: 5943), Kobe, Japan',
      outlook: 'Strong',
      manufacturing: 'Kobe, Japan + US assembly',
    },
  },

  {
    name: 'Bradford White RG250T6N (50 gal Tank)',
    slug: 'bradford_white_rg2',
    sub_type: 'tank_gas',
    target: 80,
    tier: 'Tier 2',
    specs: {
      sub_type: 'tank_pro_grade',
      glass_lining_technology_tank: 'proprietary_premium',
      anode_rod_type_tank: 'magnesium_standard',
      drain_valve_material: 'brass',
      burner_system_gas: 'atmospheric',
      distribution_channel: 'professional_only',
      source_traceability: 'single_source_manufacturing',
      uef_efficiency: 0.63,
      first_hour_rating_tank: 81,
      noise_dba: 'quiet_under_50',
      tank_warranty_years: 6,
      expected_lifespan_years: '10_to_15',
      scale_resistance_maintenance: 'self_cleaning_or_resistant',
      parts_availability: 'universal_widely_stocked',
      service_network: 'national_professional_network',
      control_board_reliability: 'proven_reliable_simple',
      safety_system: 'advanced_fvir_certified',
    },
    axis_scores: { quality: 8.5, durability: 8.0, performance: 7.5 },
    notes: [
      'Professional plumber\'s top choice — pro-only distribution',
      'Vitraglas proprietary lining with Microban antimicrobial',
      'Hydrojet Total Performance System — reduces sediment buildup',
      'ICON millivolt gas control — WORKS WITHOUT ELECTRICITY (power outage advantage)',
      'Brass drain valve, tamper-resistant',
      'US-made, Middleville MI (and Niles, MI)',
      '6yr standard warranty, BUILTBEST extendable to 8-10yr',
      'STRENGTH: Pro-only = every unit professionally installed, no DIY shortcuts',
      'STRENGTH: Millivolt ignition = works during power outages',
      'WEAKNESS: 0.63 UEF — atmospheric gas is the least efficient technology in this set',
      'WEAKNESS: 6yr warranty is shorter than Rheem retail 9yr',
    ],
    report_fields: {
      corporate_parent: 'Bradford White Corporation — privately held, Ambler, PA',
      outlook: 'Strong',
      manufacturing: 'Middleville, Michigan / Niles, Michigan',
    },
  },

  {
    name: 'Rheem ProTerra XE80 Heat Pump (80 gal)',
    slug: 'rheem_proterra',
    sub_type: 'heat_pump',
    target: 78,
    tier: 'Tier 2',
    specs: {
      sub_type: 'heat_pump_premium',
      distribution_channel: 'professional_and_retail',
      source_traceability: 'multi_source_identified',
      uef_efficiency: 4.07,
      first_hour_rating_tank: 87,
      recirculation_system: 'not_compatible',
      noise_dba: 'standard_50_60',
      smart_connectivity: 'wifi_with_diagnostics',
      tank_warranty_years: 10,
      expected_lifespan_years: '10_to_15',
      scale_resistance_maintenance: 'maintenance_required_annual',
      parts_availability: 'brand_specific_available',
      service_network: 'national_professional_network',
      control_board_reliability: 'documented_issues',
    },
    axis_scores: { quality: 8.0, durability: 7.3, performance: 8.2 },
    notes: [
      '4.07 UEF — highest efficiency in entire calibration set (different DOE bin than gas)',
      'Heat pump technology: extracts heat from ambient air via compressor (like AC in reverse)',
      '80 gal tank, 87 gal FHR — largest capacity in set',
      'EcoNet WiFi with diagnostics and scheduling',
      'R-134a refrigerant (industry transition to R-290 pending)',
      '10yr warranty — longest tank warranty in set',
      'Multiple operating modes: heat pump only, hybrid, electric backup, vacation',
      'STRENGTH: Up to 75% energy savings vs standard electric tank',
      'STRENGTH: 10yr warranty signals manufacturer confidence',
      'WEAKNESS: Compressor adds mechanical complexity — documented control board issues',
      'WEAKNESS: ~50-55 dBA noise — not suitable for all installation locations',
      'WEAKNESS: Requires ambient temp 37-145°F — not for unheated garages in cold climates',
    ],
    report_fields: {
      corporate_parent: 'Rheem Manufacturing Company — privately held (Paloma Industries subsidiary), Atlanta, GA',
      outlook: 'Strong',
      manufacturing: 'Montgomery, Alabama',
    },
  },

  {
    name: 'A.O. Smith ProLine XE (50 gal Tank)',
    slug: 'ao_smith_proline_xe',
    sub_type: 'tank_gas',
    target: 67,
    tier: 'Tier 3',
    specs: {
      sub_type: 'tank_pro_grade',
      glass_lining_technology_tank: 'proprietary_premium',
      anode_rod_type_tank: 'stainless_steel_coregard',
      drain_valve_material: 'brass',
      burner_system_gas: 'premix_stamped',
      distribution_channel: 'professional_and_retail',
      source_traceability: 'multi_source_identified',
      uef_efficiency: 0.72,
      first_hour_rating_tank: 80,
      noise_dba: 'quiet_under_50',
      tank_warranty_years: 6,
      expected_lifespan_years: '10_to_15',
      scale_resistance_maintenance: 'self_cleaning_or_resistant',
      parts_availability: 'universal_widely_stocked',
      service_network: 'national_professional_network',
      control_board_reliability: 'standard_electronic',
      safety_system: 'standard_safety',
    },
    axis_scores: { quality: 6.8, durability: 6.6, performance: 6.8 },
    notes: [
      'Strong mid-tier tank — professional distribution available',
      'Blue Diamond glass lining with Microban',
      'CoreGard stainless steel anode (superior to commodity magnesium)',
      'DynaClean sediment dip tube system',
      '0.72 UEF — power vent gas (better than atmospheric)',
      '6yr standard warranty',
      'Ashland City, TN manufacturing',
      'PLATFORM: State and American Water Heaters are same parent company',
      'ProLine XE is above Signature (Lowe\'s retail) tier in A.O. Smith lineup',
      'STRENGTH: CoreGard stainless anode is a genuine longevity upgrade',
      'WEAKNESS: Platform shared with lower-tier State/American brands at different price points',
      'WEAKNESS: 6yr warranty matches Bradford White but without pro-only distribution assurance',
    ],
    report_fields: {
      corporate_parent: 'A. O. Smith Corporation — publicly traded (NYSE: AOS), Milwaukee, WI',
      platform_disclosure: 'A.O. Smith, State, and American Water Heaters are same parent company. Component sharing confirmed.',
      outlook: 'Strong',
      manufacturing: 'Ashland City, Tennessee',
    },
  },

  {
    name: 'Rheem Performance Plus (50 gal Tank)',
    slug: 'rheem_performance_plus',
    sub_type: 'tank_gas_electric',
    target: 61,
    tier: 'Tier 3',
    specs: {
      sub_type: 'tank_retail',
      glass_lining_technology_tank: 'standard_glass_enamel',
      anode_rod_type_tank: 'magnesium_standard',
      drain_valve_material: 'brass',
      burner_system_gas: 'atmospheric',
      distribution_channel: 'retail_only',
      source_traceability: 'multi_source_identified',
      uef_efficiency: 0.92,
      first_hour_rating_tank: 67,
      noise_dba: 'quiet_under_50',
      tank_warranty_years: 9,
      expected_lifespan_years: '10_to_15',
      scale_resistance_maintenance: 'self_cleaning_or_resistant',
      parts_availability: 'universal_widely_stocked',
      service_network: 'national_professional_network',
      control_board_reliability: 'standard_electronic',
      safety_system: 'standard_safety',
    },
    axis_scores: { quality: 6.2, durability: 6.0, performance: 6.2 },
    notes: [
      'Home Depot retail channel — upgraded retail tier',
      '9yr warranty — best in retail tier',
      'Self-cleaning system for reduced sediment',
      'LED diagnostics',
      'Enhanced anode rod vs base Performance models',
      'Brass drain valve on some SKUs',
      'UEF ~0.92 (electric version)',
      'PLATFORM: Rheem, Ruud, Richmond = same parent company',
      'STRENGTH: 9yr warranty exceeds most competitors\' retail tier',
      'STRENGTH: Universal parts — every plumber knows Rheem',
      'WEAKNESS: Retail distribution = component quality debate (pro vs retail)',
      'WEAKNESS: Standard glass enamel lining (no proprietary name like Vitraglas)',
    ],
    report_fields: {
      corporate_parent: 'Rheem Manufacturing Company — privately held (Paloma Industries subsidiary), Atlanta, GA',
      platform_disclosure: 'Rheem, Ruud, and Richmond are same parent company.',
      outlook: 'Stable',
      manufacturing: 'Multi-plant US manufacturing',
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
  console.log('WATER HEATERS CALIBRATION SCORING — v1 (Pre Deep Dive)');
  console.log('='.repeat(70));
  console.log('Weights: Q=0.30, D=0.40, P=0.30');
  console.log('Method: Geometric mean, no axis stretch');
  console.log('Pool S: VACANT (Yale does not cover water heaters)');
  console.log('Products: 3 tankless + 2 tank + 1 heat pump + 1 retail tank');
  console.log('');

  let allPass = true;
  for (const product of CALIBRATION_PRODUCTS) {
    const result = scoreProduct(product);
    const pass = result.delta === 0;
    const flag = pass ? '✓' : Math.abs(result.delta) <= 1 ? '~' : '✗';
    if (!pass) allPass = false;
    console.log(`${flag} ${product.name.padEnd(50)} | Q:${product.axis_scores.quality} D:${product.axis_scores.durability} P:${product.axis_scores.performance} | ${result.display} (target ${product.target}, Δ${result.delta >= 0 ? '+' : ''}${result.delta}) | ${product.tier} | ${result.label}`);
  }

  console.log('');
  console.log(allPass ? '✓ ALL TARGETS HIT EXACTLY' : '~ See deltas above — adjust axis scores');
  console.log('');
}

main();
