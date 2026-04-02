#!/usr/bin/env node
/**
 * Lighting Control Calibration Scoring — v1 (Pre Deep Dive)
 *
 * 7 calibration products: 2 HomeWorks, 1 RadioRA3, 1 Savant, 1 Control4, 1 Caseta, 1 Leviton
 * Weights: Q=0.40, D=0.30, P=0.30
 * Method: Geometric mean, no axis stretch
 * Pool S: VACANT (no independent comparative testing source for lighting control systems)
 *
 * Category note: Lighting control is scored as SYSTEMS, not individual switches.
 * Lutron dominates — 334 luxury listing sightings.
 * Quality dominant (0.40) — system architecture and switch aesthetics drive the professional hierarchy.
 * Performance NOT flat — tunable white, dimming depth, scene complexity create real spread.
 *
 * Usage: /usr/local/bin/node score_lighting_control_calibration.js
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
    name: 'Lutron HomeWorks QSX (with Ketra)',
    slug: 'lutron_homeworks_qsx_ketra',
    target: 95,
    tier: 'Tier 1',
    specs: {
      system_architecture: 'panelized_wired_plus_wireless',
      dimming_protocol: 'proprietary_precision_high_end',
      switch_aesthetic_options: 'designer_collection_exclusive',
      keypad_capability: 'custom_engraved_scene_multibutton',
      source_traceability: 'single_source_manufacturing',
      device_zone_capacity: '10000_plus',
      tunable_white_color: 'full_spectrum_tunable_ketra',
      dimming_depth: '0_1_pct_smooth_flicker_free',
      scene_automation_complexity: 'conditional_logic_timeclock_astronomical',
      integration_depth: 'native_av_hvac_security_shading',
      communication_reliability: 'wired_backbone_wireless_redundancy',
      processor_architecture: 'dedicated_processor_redundant',
      warranty_years: 8,
      installer_certification_required: 'factory_certified_dealer_required',
      parts_service_availability: 'manufacturer_direct_plus_dealer_network',
      system_longevity_track_record: '20_plus_year_proven',
    },
    axis_scores: { quality: 9.7, durability: 9.3, performance: 9.5 },
    notes: [
      'Lutron flagship — panelized lighting control with wired QS Link backbone',
      '10,000+ device capacity — handles largest estates',
      'Ketra tunable lighting: 1,400K-10,000K, 16.7M colors, >90 CRI at all CCTs',
      'Color Lock technology: one-step MacAdam ellipse precision maintained over lifetime',
      'Natural Light: automatic circadian shifting (energizing AM → relaxing PM)',
      'Natural Dimming: warm shift as intensity decreases (like incandescent)',
      'Exclusive Palladiom (metal flush-mount) and Alisse (hand-finished, 40+ metal finishes) keypads',
      'QS Link wired backbone + Clear Connect Type X wireless = dual-path reliability',
      'Astronomical timeclock, conditional logic, integration with shading/HVAC/security/AV',
      '8-year component warranty, Lutron-certified installer required',
      'Coopersburg, PA headquarters, global manufacturing (identified)',
      'STRENGTH: Only system offering true tunable spectrum lighting with Color Lock precision',
      'STRENGTH: Panelized architecture = physically cannot lose communication signal',
      'WEAKNESS: Highest cost system ($50K-200K+ for whole-home). New construction preferred.',
      'WEAKNESS: Ketra fixtures are proprietary — not compatible with other systems',
    ],
    report_fields: {
      corporate_parent: 'Lutron Electronics Co., Inc. — privately held, family-owned, Coopersburg, PA',
      outlook: 'Strong',
      manufacturing: 'Coopersburg, PA (HQ) + global manufacturing facilities',
      market_data: '334 Lutron sightings in luxury home listings — dominant category presence',
    },
  },

  {
    name: 'Lutron HomeWorks QSX (Standard)',
    slug: 'lutron_homeworks_qsx',
    target: 92,
    tier: 'Tier 1',
    specs: {
      system_architecture: 'panelized_wired_plus_wireless',
      dimming_protocol: 'proprietary_precision_high_end',
      switch_aesthetic_options: 'designer_collection_exclusive',
      keypad_capability: 'custom_engraved_scene_multibutton',
      source_traceability: 'single_source_manufacturing',
      device_zone_capacity: '10000_plus',
      tunable_white_color: 'fixed_color_temperature',
      dimming_depth: '0_1_pct_smooth_flicker_free',
      scene_automation_complexity: 'conditional_logic_timeclock_astronomical',
      integration_depth: 'native_av_hvac_security_shading',
      communication_reliability: 'wired_backbone_wireless_redundancy',
      processor_architecture: 'dedicated_processor_redundant',
      warranty_years: 8,
      installer_certification_required: 'factory_certified_dealer_required',
      parts_service_availability: 'manufacturer_direct_plus_dealer_network',
      system_longevity_track_record: '20_plus_year_proven',
    },
    axis_scores: { quality: 9.4, durability: 9.3, performance: 9.0 },
    notes: [
      'Same panelized architecture as Ketra variant but with standard (non-tunable) fixtures',
      '10,000+ device capacity, QS Link wired + Clear Connect wireless',
      'Palladiom/Alisse keypads available — same aesthetic excellence',
      'Full scene programming, astronomical timeclock, conditional logic',
      'Dimming to 0.1% flicker-free on compatible loads',
      'No Ketra = no tunable white/color control (dependent on individual fixture CCT)',
      'Same reliability, same wired backbone, same 8-year warranty',
      'STRENGTH: All the architectural benefits of HomeWorks without Ketra price premium',
      'STRENGTH: Can upgrade to Ketra later by adding Ketra fixtures and N-QS processor',
      'WEAKNESS: Without Ketra, loses the #1 performance differentiator (tunable spectrum)',
      'WEAKNESS: Still requires new construction or major renovation for panel installation',
    ],
    report_fields: {
      corporate_parent: 'Lutron Electronics Co., Inc. — privately held, family-owned, Coopersburg, PA',
      outlook: 'Strong',
      manufacturing: 'Coopersburg, PA (HQ) + global manufacturing facilities',
    },
  },

  {
    name: 'Lutron RadioRA 3',
    slug: 'lutron_radiora3',
    target: 84,
    tier: 'Tier 2',
    specs: {
      system_architecture: 'dedicated_wireless_mesh_proprietary',
      dimming_protocol: 'proprietary_clear_connect',
      switch_aesthetic_options: 'professional_multiple_lines',
      keypad_capability: 'scene_capable_multibutton',
      source_traceability: 'single_source_manufacturing',
      device_zone_capacity: '200_per_processor',
      tunable_white_color: 'fixed_color_temperature',
      dimming_depth: '1_pct_smooth',
      scene_automation_complexity: 'conditional_logic_timeclock_astronomical',
      integration_depth: 'native_shading_plus_third_party',
      communication_reliability: 'proprietary_rf_dedicated_band',
      processor_architecture: 'dedicated_processor_single',
      warranty_years: 8,
      installer_certification_required: 'factory_certified_dealer_required',
      parts_service_availability: 'manufacturer_direct_plus_dealer_network',
      system_longevity_track_record: '10_plus_year_proven',
    },
    axis_scores: { quality: 8.5, durability: 8.5, performance: 8.2 },
    notes: [
      'Best retrofit lighting control system on the market',
      '200 devices/processor (100 Type X + 100 Type A), expandable with multiple processors',
      'Clear Connect Type X wireless — proprietary, dedicated band, no WiFi interference',
      'Sunnata touch dimmers, Maestro dimmers, seeTouch keypads — professional aesthetic options',
      'Requires Lutron-certified installer with Lutron Designer software access',
      'Full scene programming with astronomical timeclock and conditional logic',
      'Native integration with Lutron shading + third-party via Lutron Connect Bridge',
      'No panelized option — all distributed (each switch at the wall)',
      'No Ketra support (HomeWorks exclusive)',
      'STRENGTH: Professional-grade Lutron reliability WITHOUT new construction requirement',
      'STRENGTH: 8-year warranty, same as HomeWorks. Lutron stands behind it equally.',
      'WEAKNESS: 200 device limit per processor (large homes need multiple processors)',
      'WEAKNESS: No Ketra tunable technology — that is HomeWorks exclusive',
    ],
    report_fields: {
      corporate_parent: 'Lutron Electronics Co., Inc. — privately held, family-owned, Coopersburg, PA',
      outlook: 'Strong',
      manufacturing: 'Coopersburg, PA (HQ) + global manufacturing facilities',
    },
  },

  {
    name: 'Savant Lighting System',
    slug: 'savant_lighting',
    target: 80,
    tier: 'Tier 2',
    specs: {
      system_architecture: 'dedicated_wireless_mesh_proprietary',
      dimming_protocol: 'proprietary_clear_connect',
      switch_aesthetic_options: 'professional_multiple_lines',
      keypad_capability: 'scene_capable_multibutton',
      source_traceability: 'single_source_manufacturing',
      device_zone_capacity: '200_per_processor',
      tunable_white_color: 'tunable_white_basic',
      dimming_depth: '1_pct_smooth',
      scene_automation_complexity: 'conditional_logic_timeclock_astronomical',
      integration_depth: 'native_av_hvac_security_shading',
      communication_reliability: 'proprietary_rf_dedicated_band',
      processor_architecture: 'dedicated_processor_single',
      warranty_years: 3,
      installer_certification_required: 'factory_certified_dealer_required',
      parts_service_availability: 'dealer_network_only',
      system_longevity_track_record: '10_plus_year_proven',
    },
    axis_scores: { quality: 8.2, durability: 7.8, performance: 8.0 },
    notes: [
      'Whole-home automation platform with integrated lighting layer',
      'TrueImage: customizable switch displays show actual scene images',
      'Premium app UI — often cited as best-in-class user experience',
      'Apple ecosystem integration (Apple TV as host option)',
      'Native AV + climate + security + lighting orchestration — strongest whole-home integration',
      'Savant Lighting products (dimmers, switches) use proprietary Bluetooth mesh',
      'Many integrators pair Savant brain + Lutron lighting hardware — MATERIAL FINDING',
      '3-year standard warranty (shorter than Lutron 8-year)',
      'STRENGTH: Best unified whole-home automation UX — lighting + AV + climate in one app',
      'STRENGTH: TrueImage displays on switches are genuinely innovative',
      'WEAKNESS: Lighting hardware is newest to market — thinner field track record than Lutron',
      'WEAKNESS: 3-year warranty vs Lutron 8-year signals less manufacturer confidence in hardware longevity',
      'WEAKNESS: Professional integrators frequently recommend Savant automation + Lutron lighting — Savant own lighting hardware not yet the default',
    ],
    report_fields: {
      corporate_parent: 'Savant Systems, Inc. — privately held, Hyannis, MA',
      outlook: 'Stable',
      manufacturing: 'Hyannis, Massachusetts',
      platform_disclosure: 'Professional integrators frequently pair Savant automation platform with Lutron lighting hardware, using Savant as the brain and Lutron as the muscle for lighting control.',
    },
  },

  {
    name: 'Control4 Lighting (Snap One)',
    slug: 'control4_lighting',
    target: 67,
    tier: 'Tier 3',
    specs: {
      system_architecture: 'zigbee_zwave_mesh',
      dimming_protocol: 'zigbee_certified',
      switch_aesthetic_options: 'professional_multiple_lines',
      keypad_capability: 'custom_engraved_scene_multibutton',
      source_traceability: 'multi_source_identified',
      device_zone_capacity: '200_per_processor',
      tunable_white_color: 'fixed_color_temperature',
      dimming_depth: '1_pct_smooth',
      scene_automation_complexity: 'conditional_logic_timeclock_astronomical',
      integration_depth: 'native_av_hvac_security_shading',
      communication_reliability: 'zigbee_zwave_mesh',
      processor_architecture: 'dedicated_processor_single',
      warranty_years: 2,
      installer_certification_required: 'factory_certified_dealer_required',
      parts_service_availability: 'dealer_network_only',
      system_longevity_track_record: '20_plus_year_proven',
    },
    axis_scores: { quality: 6.5, durability: 6.8, performance: 6.9 },
    notes: [
      'Comprehensive home automation with integrated lighting — broadest third-party device support',
      'Zigbee mesh: every powered device is a repeater, improving coverage',
      'Hybrid wireless + panelized options available',
      'Custom engraved configurable keypads — strong aesthetic offering',
      'Dealer-channel only — professional installation required',
      'OS 3 interface — unified control of lighting + AV + security + climate',
      'Founded 2003, acquired by Snap One 2019',
      '2-year standard warranty — shortest in calibration set',
      'STRENGTH: Broadest third-party integration ecosystem — works with more devices than any competitor',
      'STRENGTH: 22+ year track record, largest installed base among automation platforms',
      'WEAKNESS: Zigbee shared-spectrum (2.4 GHz) — less reliable than Lutron Clear Connect dedicated band',
      'WEAKNESS: Lighting is one of many capabilities, not the core focus — integrators note Lutron lighting is superior on dimming precision',
      'WEAKNESS: 2-year warranty is weakest in the category',
    ],
    report_fields: {
      corporate_parent: 'Snap One Holdings Corp. — publicly traded (NASDAQ: SNPO, acquired by Resideo 2024), Charlotte, NC',
      outlook: 'Conditional',
      outlook_notes: 'Acquired by Resideo Technologies (Honeywell spin-off) in 2024. Integration ongoing. Product roadmap uncertainty during corporate integration.',
      manufacturing: 'Salt Lake City, UT (engineering) + contract manufacturing',
      platform_disclosure: 'Control4 acquired by Snap One in 2019, then Snap One acquired by Resideo Technologies (Honeywell Home spin-off) in 2024. Two ownership changes in 5 years — corporate stability is a legitimate buyer concern.',
    },
  },

  {
    name: 'Lutron Caseta',
    slug: 'lutron_caseta',
    target: 64,
    tier: 'Tier 3',
    specs: {
      system_architecture: 'dedicated_wireless_mesh_proprietary',
      dimming_protocol: 'proprietary_clear_connect',
      switch_aesthetic_options: 'standard_decora_style',
      keypad_capability: 'single_zone_dimmer_only',
      source_traceability: 'single_source_manufacturing',
      device_zone_capacity: '75',
      tunable_white_color: 'no_color_control',
      dimming_depth: '1_pct_smooth',
      scene_automation_complexity: 'basic_scenes',
      integration_depth: 'third_party_api_only',
      communication_reliability: 'proprietary_rf_dedicated_band',
      processor_architecture: 'hub_based',
      warranty_years: 8,
      installer_certification_required: 'diy_installation',
      parts_service_availability: 'manufacturer_direct_plus_dealer_network',
      system_longevity_track_record: '10_plus_year_proven',
    },
    axis_scores: { quality: 6.5, durability: 6.8, performance: 5.8 },
    notes: [
      'Lutron entry-level — DIY-friendly, no neutral wire required (most models)',
      '75 device maximum per Smart Hub — hard limit, cannot expand',
      'Clear Connect RF — same proprietary reliable protocol as RadioRA/HomeWorks',
      'Pico remotes: wireless button remotes mountable anywhere (eliminates 3-way wiring)',
      'Diva and Claro switch styles only — no seeTouch/Sunnata/Palladiom keypads',
      'Smart Bridge hub is single point of failure',
      'Basic scenes via Lutron app, HomeKit/Alexa/Google integration',
      'No professional scene programming (no Lutron Designer)',
      'PD-6WCL: up to 150W LED / 600W incandescent. PD-5NE: up to 250W LED / 500W inc.',
      'STRENGTH: Lutron Clear Connect reliability in a DIY package — more reliable than any WiFi switch',
      'STRENGTH: 8-year warranty matches HomeWorks — Lutron stands behind every tier',
      'WEAKNESS: 75-device limit makes it unsuitable for whole-home specification in larger homes',
      'WEAKNESS: No premium keypad options — locked into standard Decora-style switches',
      'WEAKNESS: Basic app-only scenes — no astronomical timeclock, no conditional logic',
    ],
    report_fields: {
      corporate_parent: 'Lutron Electronics Co., Inc. — privately held, family-owned, Coopersburg, PA',
      outlook: 'Strong',
      manufacturing: 'Coopersburg, PA (HQ) + global manufacturing facilities',
    },
  },

  {
    name: 'Leviton Decora Smart Wi-Fi',
    slug: 'leviton_decora_smart',
    target: 47,
    tier: 'Tier 4',
    specs: {
      system_architecture: 'wifi_based',
      dimming_protocol: 'wifi_generic',
      switch_aesthetic_options: 'basic_smart_switch',
      keypad_capability: 'single_zone_dimmer_only',
      source_traceability: 'multi_source_identified',
      device_zone_capacity: 'per_switch_no_system',
      tunable_white_color: 'no_color_control',
      dimming_depth: '5_pct_standard',
      scene_automation_complexity: 'basic_scenes',
      integration_depth: 'app_only_limited',
      communication_reliability: 'wifi_dependent',
      processor_architecture: 'cloud_dependent',
      warranty_years: 5,
      installer_certification_required: 'diy_installation',
      parts_service_availability: 'retail_replacement',
      system_longevity_track_record: '5_plus_year_market',
    },
    axis_scores: { quality: 4.6, durability: 5.0, performance: 4.5 },
    notes: [
      'Wi-Fi based smart dimmer/switch — individual devices, not a system',
      'Relies on home Wi-Fi router — subject to network congestion and firmware issues',
      'My Leviton app for scheduling and basic scenes',
      'Decora styling — standard in residential construction',
      'Requires neutral wire (limits retrofit in older homes)',
      'No dedicated lighting protocol — shares bandwidth with all WiFi devices',
      'No custom keypads, no multi-button scenes, no whole-home programming',
      'Voice assistant integration (Alexa, Google, HomeKit)',
      '5-year warranty (Leviton is established electrical manufacturer, 100+ year company)',
      'STRENGTH: Leviton is a respected electrical manufacturer — these are UL-listed, well-built switches',
      'STRENGTH: No hub required — simpler setup for single-room use cases',
      'WEAKNESS: WiFi dependency = router failure takes down all smart controls',
      'WEAKNESS: Not a lighting SYSTEM — individual switches with an app. No scene programming depth.',
      'WEAKNESS: Cloud-dependent features (some functions require Leviton cloud service)',
    ],
    report_fields: {
      corporate_parent: 'Leviton Manufacturing Co., Inc. — privately held, Melville, NY (founded 1906)',
      outlook: 'Stable',
      manufacturing: 'Global manufacturing, US headquarters in Melville, NY',
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
  console.log('LIGHTING CONTROL CALIBRATION SCORING — v1 (Pre Deep Dive)');
  console.log('='.repeat(70));
  console.log('Weights: Q=0.40, D=0.30, P=0.30');
  console.log('Method: Geometric mean, no axis stretch');
  console.log('Pool S: VACANT (no independent comparative testing source)');
  console.log('Products: 2 HomeWorks + 1 RadioRA3 + 1 Savant + 1 Control4 + 1 Caseta + 1 Leviton');
  console.log('Category: Systems (not individual switches)');
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
