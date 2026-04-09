#!/usr/bin/env node
/**
 * Motorized Shades Calibration Scoring — v1 (Pre Deep Dive)
 *
 * 8 calibration products: 3 Lutron (Sivoia QS, Triathlon, Palladiom), 2 Hunter Douglas, 1 Somfy, 1 Serena, 1 IKEA
 * Weights: Q=0.40, D=0.30, P=0.30
 * Method: Geometric mean, no axis stretch
 * Pool S: VACANT (no independent comparative testing source for motorized shades)
 *
 * Category note: Motorized shades scored as INDIVIDUAL PRODUCTS, not platforms.
 * Motor type is THE key differentiator (equivalent of cartridge for faucets).
 * Quality dominant (0.40) — motor type, protocol, and cassette build drive the professional hierarchy.
 * Performance NOT flat — noise level (dB), max width, integration depth create real spread.
 *
 * Usage: /usr/local/bin/node score_motorized_shades_calibration.js
 */

const WEIGHTS = { quality: 0.40, durability: 0.30, performance: 0.30 };

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
    name: 'Lutron Sivoia QS Roller Shade (HomeWorks)',
    slug: 'lutron_sivoia_qs_roller',
    target: 94,
    tier: 'Tier 1',
    specs: {
      motor_type: 'proprietary_hardwired_tube_motor',
      control_protocol: 'proprietary_rf_wired_backbone',
      cassette_housing_quality: 'premium_aluminum_recessed',
      mounting_hardware_quality: 'precision_machined_metal',
      source_traceability: 'single_source_manufacturing',
      noise_level_db: 'ultra_quiet_under_40db',
      max_shade_width_inches: '>=144',
      integration_depth: 'native_whole_home_scene_control',
      group_scene_control: 'multi_zone_conditional_astronomical',
      battery_life_or_power: 'hardwired_24v_unlimited',
      motor_cycle_life: '>=20000',
      communication_reliability: 'wired_backbone_rf_redundancy',
      warranty_years: 8,
      fabric_uv_durability: 'premium_certified_uv_resistant',
      parts_service_availability: 'manufacturer_direct_plus_dealer_network',
      motor_serviceability: 'field_replaceable_motor',
    },
    axis_scores: { quality: 9.6, durability: 9.4, performance: 9.3 },
    notes: [
      'Lutron flagship shade — hardwired 24V DC proprietary motor, ultra-quiet <40 dB',
      'QS Link wired backbone + Clear Connect RF = dual-path communication reliability',
      'Premium extruded aluminum cassette, precision mounting hardware',
      'Up to 144" width without center support (12 ft)',
      'Native scene integration with HomeWorks QSX — lighting + shading + HVAC in one button',
      'Astronomical timeclock, conditional logic, daylight harvesting sensor integration',
      '20,000+ motor cycles, 8-year warranty, field-replaceable motor modules',
      'Coopersburg, PA manufacturing (identified, single-source)',
      'STRENGTH: Unanimously ranked #1 by CEDIA integrators for luxury homes',
      'STRENGTH: Hardwired = no battery degradation, unlimited cycle life from power perspective',
      'WEAKNESS: Requires pre-wiring (new construction or renovation). Not retrofit-friendly.',
      'WEAKNESS: Highest cost ($800-2000+ per shade installed through dealer)',
    ],
    report_fields: {
      corporate_parent: 'Lutron Electronics Co., Inc. — privately held, family-owned, Coopersburg, PA',
      outlook: 'Strong',
      manufacturing: 'Coopersburg, PA (HQ) + global manufacturing facilities',
    }
  },
  {
    name: 'Lutron Triathlon Roller Shade (RadioRA 3)',
    slug: 'lutron_triathlon_roller',
    target: 90,
    tier: 'Tier 1',
    specs: {
      motor_type: 'proprietary_battery_tube_motor',
      control_protocol: 'proprietary_rf_wireless',
      cassette_housing_quality: 'aluminum_cassette_fascia',
      mounting_hardware_quality: 'precision_machined_metal',
      source_traceability: 'single_source_manufacturing',
      noise_level_db: 'quiet_40_45db',
      max_shade_width_inches: '>=144',
      integration_depth: 'native_whole_home_scene_control',
      group_scene_control: 'multi_zone_conditional_astronomical',
      battery_life_or_power: 'solar_rechargeable_3_plus_years',
      motor_cycle_life: '15000-19999',
      communication_reliability: 'proprietary_rf_dedicated_band',
      warranty_years: 8,
      fabric_uv_durability: 'premium_certified_uv_resistant',
      parts_service_availability: 'manufacturer_direct_plus_dealer_network',
      motor_serviceability: 'field_replaceable_motor',
    },
    axis_scores: { quality: 9.2, durability: 8.8, performance: 9.0 },
    notes: [
      'Lutron battery/solar shade — Clear Connect Type X wireless (same as RadioRA 3 lighting)',
      'Best battery-powered motorized shade per integrator consensus',
      'Solar panel option extends battery to 3-5 years in adequate light',
      'Up to 12x12 ft (144" width) — largest battery-powered shade available',
      'Full scene integration with RadioRA 3 or HomeWorks QSX systems',
      '~42 dB noise — slightly louder than hardwired QS but still whisper-quiet',
      '8-year warranty, Lutron dealer network support',
      'STRENGTH: Best retrofit option for luxury homes without shade pre-wiring',
      'STRENGTH: Same Lutron ecosystem integration as hardwired Sivoia QS',
      'WEAKNESS: Battery will need replacement/recharging every 3-5 years (solar) or 1-2 years (battery only)',
      'WEAKNESS: Slightly reduced max torque vs hardwired — very large/heavy shades may struggle',
    ],
    report_fields: {
      corporate_parent: 'Lutron Electronics Co., Inc. — privately held, family-owned, Coopersburg, PA',
      outlook: 'Strong',
      manufacturing: 'Coopersburg, PA (HQ) + global manufacturing facilities',
    }
  },
  {
    name: 'Lutron Palladiom Roller Shade',
    slug: 'lutron_palladiom_roller',
    target: 84,
    tier: 'Tier 2',
    specs: {
      motor_type: 'proprietary_hardwired_tube_motor',
      control_protocol: 'proprietary_rf_wired_backbone',
      cassette_housing_quality: 'premium_aluminum_recessed',
      mounting_hardware_quality: 'precision_machined_metal',
      source_traceability: 'single_source_manufacturing',
      noise_level_db: 'ultra_quiet_under_40db',
      max_shade_width_inches: '>=144',
      integration_depth: 'native_whole_home_scene_control',
      group_scene_control: 'multi_zone_conditional_astronomical',
      battery_life_or_power: 'hardwired_24v_unlimited',
      motor_cycle_life: '>=20000',
      communication_reliability: 'wired_backbone_rf_redundancy',
      warranty_years: 8,
      fabric_uv_durability: 'premium_certified_uv_resistant',
      parts_service_availability: 'manufacturer_direct_plus_dealer_network',
      motor_serviceability: 'field_replaceable_motor',
    },
    axis_scores: { quality: 8.8, durability: 8.2, performance: 8.2 },
    notes: [
      'Lutron ultra-modern shade — exposed bracket design (no fascia/pocket needed)',
      'Same Sivoia QS motor platform, same ultra-quiet operation',
      'Exclusive to HomeWorks QSX / RadioRA 3 systems',
      'Design-forward: minimalist exposed brackets for modern/contemporary interiors',
      'Tier 2 not Tier 1 because: exposed bracket design compromises light blocking (5-7mm gap at top vs sealed cassette). Aesthetic is design-specific (modern only). Note: fabric selection and motor are identical to Sivoia QS per manufacturer docs.',
      'STRENGTH: Genuinely premium construction, not just rebranded Sivoia — different bracket/housing engineering',
      'WEAKNESS: More limited fabric library than Sivoia QS. Aesthetic is polarizing — not for traditional interiors.',
      'WEAKNESS: Exposed bracket means no light-blocking cassette — less blackout capability',
    ],
    report_fields: {
      corporate_parent: 'Lutron Electronics Co., Inc. — privately held, family-owned, Coopersburg, PA',
      outlook: 'Strong',
      manufacturing: 'Coopersburg, PA (HQ) + global manufacturing facilities',
    }
  },
  {
    name: 'Hunter Douglas Silhouette PowerView Gen 3',
    slug: 'hunter_douglas_silhouette_pv',
    target: 80,
    tier: 'Tier 2',
    specs: {
      motor_type: 'proprietary_battery_tube_motor',
      control_protocol: 'ble_mesh_proprietary',
      cassette_housing_quality: 'standard_cassette',
      mounting_hardware_quality: 'stamped_metal_standard',
      source_traceability: 'single_source_manufacturing',
      noise_level_db: 'standard_45_50db',
      max_shade_width_inches: '96-119',
      integration_depth: 'native_automation_platform',
      group_scene_control: 'multi_zone_scheduled_scenes',
      battery_life_or_power: 'battery_rechargeable_1_3_years',
      motor_cycle_life: '10000-14999',
      communication_reliability: 'ble_mesh_or_zigbee',
      warranty_years: 5,
      fabric_uv_durability: 'premium_certified_uv_resistant',
      parts_service_availability: 'dealer_network_only',
      motor_serviceability: 'dealer_serviceable',
    },
    axis_scores: { quality: 8.2, durability: 7.8, performance: 8.0 },
    notes: [
      'Iconic sheer horizontal shade — Hunter Douglas signature product',
      'PowerView Gen 3: Bluetooth Low Energy mesh + Pebble hub',
      'Premium proprietary fabric (lifetime warranty), unique light-diffusing vanes',
      'Strong consumer brand recognition — widely recognized in luxury market',
      'Integration with Control4, Savant, Crestron via drivers',
      'STRENGTH: Unique shade type (no competitor matches Silhouette design). Premium fabric with lifetime warranty.',
      'STRENGTH: Strong dealer network (Gallery dealers), established brand with residential consumers',
      'WEAKNESS: BLE mesh scales less reliably than Lutron Clear Connect for large installations (20+ shades)',
      'WEAKNESS: Battery-powered with 1-2 year replacement cycle under daily use',
      'WEAKNESS: 5-year motor warranty vs Lutron 8-year. 3G Capital acquisition (2022) — corporate stability watch.',
    ],
    report_fields: {
      corporate_parent: 'Hunter Douglas N.V. — acquired by 3G Capital (2022), Rotterdam, Netherlands',
      outlook: 'Stable',
      manufacturing: 'Global manufacturing — Netherlands HQ, US operations',
    }
  },
  {
    name: 'Somfy Sonesse Custom Shade (The Shade Store)',
    slug: 'somfy_sonesse_shade_store',
    target: 78,
    tier: 'Tier 2',
    specs: {
      motor_type: 'oem_somfy_tube_motor',
      control_protocol: 'proprietary_rf_wireless',
      cassette_housing_quality: 'aluminum_cassette_fascia',
      mounting_hardware_quality: 'stamped_metal_standard',
      source_traceability: 'multi_source_identified',
      noise_level_db: 'quiet_40_45db',
      max_shade_width_inches: '>=144',
      integration_depth: 'native_automation_platform',
      group_scene_control: 'multi_zone_scheduled_scenes',
      battery_life_or_power: 'hardwired_24v_unlimited',
      motor_cycle_life: '15000-19999',
      communication_reliability: 'proprietary_rf_dedicated_band',
      warranty_years: 5,
      fabric_uv_durability: 'premium_certified_uv_resistant',
      parts_service_availability: 'dealer_network_only',
      motor_serviceability: 'field_replaceable_motor',
    },
    axis_scores: { quality: 8.0, durability: 7.6, performance: 7.8 },
    notes: [
      'Somfy Sonesse ULTRA 50 motor — industry benchmark OEM motor (~40-42 dB)',
      'Paired with The Shade Store premium fabrication and fabric library',
      'Hardwired or battery options available',
      'Somfy io-homecontrol two-way protocol (bidirectional shade position feedback)',
      'Integration with Control4, Savant, Crestron via drivers',
      'STRENGTH: Somfy Sonesse ULTRA is one of the quietest and most reliable motors available',
      'STRENGTH: The Shade Store offers extensive custom fabric, size, and configuration options',
      'WEAKNESS: Multi-source — motor is Somfy (France), fabrication is Shade Store (US). Quality depends partly on fabricator.',
      'WEAKNESS: Somfy RTS protocol (one-way) still common — must specify io for two-way feedback',
      'WEAKNESS: 5-year motor warranty, below Lutron 8-year',
    ],
    report_fields: {
      corporate_parent: 'Motor: Somfy SA (Cluses, France, public). Fabricator: The Shade Store (US, private).',
      outlook: 'Stable',
      manufacturing: 'Motor: Cluses, France (Somfy). Fabrication: US (The Shade Store)',
    }
  },
  {
    name: 'Lutron Serena Roller Shade',
    slug: 'lutron_serena_roller',
    target: 64,
    tier: 'Tier 3',
    specs: {
      motor_type: 'proprietary_battery_tube_motor',
      control_protocol: 'proprietary_rf_wireless',
      cassette_housing_quality: 'standard_cassette',
      mounting_hardware_quality: 'stamped_metal_standard',
      source_traceability: 'single_source_manufacturing',
      noise_level_db: 'standard_45_50db',
      max_shade_width_inches: '96-119',
      integration_depth: 'third_party_api_hub',
      group_scene_control: 'basic_group_control',
      battery_life_or_power: 'battery_rechargeable_1_3_years',
      motor_cycle_life: '10000-14999',
      communication_reliability: 'proprietary_rf_dedicated_band',
      warranty_years: 5,
      fabric_uv_durability: 'standard_commercial_grade',
      parts_service_availability: 'manufacturer_direct_plus_dealer_network',
      motor_serviceability: 'dealer_serviceable',
    },
    axis_scores: { quality: 6.5, durability: 6.2, performance: 6.5 },
    notes: [
      'Lutron consumer-direct roller shade — genuinely downmarket from Sivoia QS',
      'Different battery motor than Sivoia QS — louder (~48 dB), fewer cycles (~10,000)',
      'Clear Connect RF (consumer-grade), compatible with Caseta/RadioRA 3',
      'Consumer installation — no dealer required',
      'Limited integration: HomeKit, Alexa, Google, Caseta app. No deep scene programming.',
      'STRENGTH: Lutron reliability DNA and Clear Connect RF (still better than WiFi/Zigbee)',
      'STRENGTH: Consumer-direct pricing ($400-600) vs dealer-installed Sivoia ($800-2000+)',
      'WEAKNESS: Not luxury — integrators do not specify Serena for quality homes',
      'WEAKNESS: More limited fabric selection than Sivoia QS or custom fabricators',
      'WEAKNESS: Battery-only — no hardwired option, no solar panel option',
    ],
    report_fields: {
      corporate_parent: 'Lutron Electronics Co., Inc. — privately held, family-owned, Coopersburg, PA',
      outlook: 'Strong',
      manufacturing: 'Coopersburg, PA (HQ)',
    }
  },
  {
    name: 'Hunter Douglas Duette Architella PowerView',
    slug: 'hunter_douglas_duette_pv',
    target: 62,
    tier: 'Tier 3',
    specs: {
      motor_type: 'proprietary_battery_tube_motor',
      control_protocol: 'ble_mesh_proprietary',
      cassette_housing_quality: 'standard_cassette',
      mounting_hardware_quality: 'stamped_metal_standard',
      source_traceability: 'single_source_manufacturing',
      noise_level_db: 'standard_45_50db',
      max_shade_width_inches: '96-119',
      integration_depth: 'native_automation_platform',
      group_scene_control: 'multi_zone_scheduled_scenes',
      battery_life_or_power: 'battery_rechargeable_1_3_years',
      motor_cycle_life: '10000-14999',
      communication_reliability: 'ble_mesh_or_zigbee',
      warranty_years: 5,
      fabric_uv_durability: 'premium_certified_uv_resistant',
      parts_service_availability: 'dealer_network_only',
      motor_serviceability: 'dealer_serviceable',
    },
    axis_scores: { quality: 6.2, durability: 6.0, performance: 6.4 },
    notes: [
      'Hunter Douglas entry-level PowerView — cellular/honeycomb shade (Architella = double cell)',
      'PowerView Gen 3 Bluetooth mesh, Pebble hub',
      'Excellent energy efficiency — double-cell honeycomb design, good insulation',
      'Battery-powered, rechargeable packs (1-2 year replacement cycle under daily use)',
      'Legitimate motorized shade — not a gadget — but entry-tier within PowerView lineup',
      'STRENGTH: Superior energy efficiency (cellular design traps air). Premium fabric with lifetime warranty.',
      'STRENGTH: Strong consumer brand and dealer network (Gallery dealers)',
      'WEAKNESS: Entry-level PowerView — higher battery swap frequency, louder motor than Silhouette',
      'WEAKNESS: BLE mesh less robust for large installations vs Lutron Clear Connect',
      'WEAKNESS: 3G Capital acquisition (2022) — corporate stability monitoring',
    ],
    report_fields: {
      corporate_parent: 'Hunter Douglas N.V. — acquired by 3G Capital (2022), Rotterdam, Netherlands',
      outlook: 'Stable',
      manufacturing: 'Global manufacturing — Netherlands HQ, US operations',
    }
  },
  {
    name: 'IKEA FYRTUR',
    slug: 'ikea_fyrtur',
    target: 45,
    tier: 'Tier 4',
    specs: {
      motor_type: 'generic_tube_motor_branded',
      control_protocol: 'zigbee_zwave',
      cassette_housing_quality: 'standard_cassette',
      mounting_hardware_quality: 'plastic_injection_molded',
      source_traceability: 'unknown_undisclosed',
      noise_level_db: 'audible_over_50db',
      max_shade_width_inches: '<96',
      integration_depth: 'app_only_voice_assistant',
      group_scene_control: 'basic_group_control',
      battery_life_or_power: 'battery_rechargeable_1_3_years',
      motor_cycle_life: '<10000',
      communication_reliability: 'ble_mesh_or_zigbee',
      warranty_years: 1,
      fabric_uv_durability: 'commodity_residential',
      parts_service_availability: 'retail_replacement_only',
      motor_serviceability: 'non_serviceable_disposable',
    },
    axis_scores: { quality: 4.2, durability: 4.5, performance: 4.8 },
    notes: [
      'IKEA Zigbee 3.0 motorized roller shade — $100-180 price point',
      'DIRIGERA hub required (replaced TRADFRI gateway)',
      'Limited sizes (standard window widths only, ~55" max)',
      'USB-C rechargeable battery, 6-12 month battery life estimated',
      'Professional consensus: disposable entry point, 2-3 year motor life',
      'Zigbee 3.0 = local control possible (no cloud dependency), HomeKit/Alexa/Google compatible',
      'STRENGTH: Affordable entry point for renters and budget-conscious consumers',
      'STRENGTH: Zigbee local control — no cloud dependency (better than WiFi/Tuya)',
      'WEAKNESS: 1-year warranty, no repair — entire shade is the replacement unit',
      'WEAKNESS: Limited sizes, limited fabric (only blackout polyester available)',
      'WEAKNESS: Pros refuse to install — disposable product, not for quality homes',
      'WEAKNESS: Unknown motor manufacturer (undisclosed Chinese OEM)',
    ],
    report_fields: {
      corporate_parent: 'Inter IKEA Holding B.V. — Leiden, Netherlands',
      outlook: 'Stable',
      manufacturing: 'China (undisclosed OEM)',
    }
  },
];

// ============================================================================
// SCORE CALCULATION
// ============================================================================

console.log('');
console.log('═══════════════════════════════════════════════════════════');
console.log('  MOTORIZED SHADES — CALIBRATION SCORING v1');
console.log('  Weights: Q=0.40, D=0.30, P=0.30 | Method: Geometric Mean');
console.log('═══════════════════════════════════════════════════════════');
console.log('');

let allPass = true;

for (const product of CALIBRATION_PRODUCTS) {
  const { quality, durability, performance } = product.axis_scores;
  const rawScore = geoMean(quality, durability, performance);
  const composite = Math.round(rawScore * 10);
  const delta = composite - product.target;
  const label = getLabel(composite);
  const pass = delta === 0 ? '✅' : '❌';
  if (delta !== 0) allPass = false;

  console.log(`${pass} ${product.name}`);
  console.log(`   ${product.tier} | Q=${quality} D=${durability} P=${performance}`);
  console.log(`   Composite: ${composite} (raw: ${rawScore.toFixed(2)}) | Target: ${product.target} | Delta: ${delta > 0 ? '+' : ''}${delta} | ${label}`);
  console.log('');
}

console.log('═══════════════════════════════════════════════════════════');
if (allPass) {
  console.log('  ✅ ALL CALIBRATION TARGETS HIT — DELTA = 0');
} else {
  console.log('  ❌ CALIBRATION DELTAS PRESENT — ADJUST AXIS SCORES');
}
console.log('═══════════════════════════════════════════════════════════');
