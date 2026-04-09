#!/usr/bin/env node
/**
 * One-time migration: adds manufacturer_domains to every calibration config.
 * Maps each product slug → array of domains belonging to that manufacturer
 * and its corporate parent (not independent sources).
 */
'use strict';
const fs = require('fs');
const path = require('path');

const CAL = path.resolve(__dirname, '..', 'calibration');

// ── Master domain map ─────────────────────────────────────────────────────────
// Key: product slug (must match calibration_products[].slug exactly)
// Value: [brand domain, parent/corporate domain, ...]

const DOMAINS = {
  // ── cabinets ──
  crystal_keyline_custom: ['crystalcabinets.com'],
  fabuwood_galaxy: ['fabuwood.com'],
  kraftmaid_base: ['kraftmaid.com', 'masterbrand.com', 'fortunebrands.com'],
  ikea_sektion: ['ikea.com'],
  merillat_classic: ['merillat.com', 'masterbrand.com', 'fortunebrands.com'],
  hampton_bay: ['homedepot.com', 'hamptonbaykitchens.com'],
  timberlake_origins: ['timberlakecabinetry.com', 'masterbrand.com'],

  // ── countertops ──
  cambria: ['cambriausa.com', 'cambriaquartz.com'],
  dekton: ['dekton.com', 'cosentino.com'],
  caesarstone: ['caesarstone.com', 'caesarstoneus.com'],
  silestone: ['silestone.com', 'cosentino.com'],
  corian: ['corian.com', 'dupont.com', 'coriansurfaces.com'],
  msi_q_quartz: ['msisurfaces.com'],

  // ── dishwashers ──
  miele_g7000: ['mieleusa.com', 'miele.com'],
  bosch_800: ['bosch-home.com', 'bshg.com'],
  kitchenaid_kdtm604: ['kitchenaid.com', 'whirlpoolcorp.com'],
  bosch_300: ['bosch-home.com', 'bshg.com'],
  whirlpool_wdt750sakz: ['whirlpool.com', 'whirlpoolcorp.com'],
  samsung_dw80_mid: ['samsung.com'],

  // ── exterior_doors ──
  marvin_ultimate_entry: ['marvin.com'],
  thermatru_classiccraft: ['thermatru.com', 'fbhs.com', 'fortunebrands.com'],
  pella_reserve_entry: ['pella.com'],
  thermatru_benchmark: ['thermatru.com', 'fbhs.com', 'fortunebrands.com'],
  masonite_performance: ['masonite.com'],
  jeldwen_builders: ['jeld-wen.com'],
  reliabilt_entry: ['lowes.com'],

  // ── faucets ──
  california_faucets: ['calfaucets.com'],
  in2aqua: ['in2aqua.us', 'in2aqua.com'],
  waterstone: ['waterstonefaucets.com', 'waterstoneco.com'],
  brizo_dst: ['brizo.com', 'deltafaucet.com', 'masterbrand.com'],
  delta_mid_range: ['deltafaucet.com', 'masterbrand.com'],
  kraus: ['kraususa.com'],

  // ── hardwood_flooring ──
  carlisle_solid_white_oak: ['carlislewideplank.com'],
  mirage_sweet_memories: ['miragefloors.com'],
  mercier_design_plus: ['mercierwood.com'],
  lauzon_designer: ['lauzon.com', 'lauzonflooring.com'],
  somerset_character: ['somersetfloors.com', 'somersethardwoodflooring.com'],
  shaw_repel: ['shawfloors.com', 'shawcontract.com', 'engineeredfloors.com'],
  bruce_dundee: ['brucehardwoodfloors.com', 'armstrongflooring.com', 'abfloors.com'],
  bruce_hydropel: ['brucehardwoodfloors.com', 'armstrongflooring.com', 'abfloors.com'],

  // ── hvac ──
  carrier_infinity: ['carrier.com', 'carrierathome.com', 'carrierenterprise.com'],
  trane_xv: ['trane.com', 'tranehome.com'],
  lennox_sl28xcv: ['lennox.com', 'lennoxinternational.com'],
  rheem_prestige: ['rheem.com', 'rheemwater.com'],
  goodman_gsxc18: ['goodmanmfg.com', 'daikincomfort.com'],
  goodman_gsx14: ['goodmanmfg.com', 'daikincomfort.com'],

  // ── lighting_control ──
  lutron_homeworks_qsx_ketra: ['lutron.com', 'ketra.com'],
  lutron_homeworks_qsx: ['lutron.com'],
  lutron_radiora3: ['lutron.com'],
  savant_lighting: ['savant.com'],
  control4_lighting: ['control4.com', 'snapone.com', 'snapav.com'],
  lutron_caseta: ['lutron.com'],
  leviton_decora_smart: ['leviton.com'],

  // ── motorized_shades ──
  lutron_sivoia_qs_roller: ['lutron.com'],
  lutron_triathlon_roller: ['lutron.com'],
  lutron_palladiom_roller: ['lutron.com'],
  hunter_douglas_silhouette_pv: ['hunterdouglas.com'],
  somfy_sonesse_shade_store: ['somfy.com', 'theshadestore.com'],
  lutron_serena_roller: ['lutron.com'],
  hunter_douglas_duette_pv: ['hunterdouglas.com'],
  ikea_fyrtur: ['ikea.com'],

  // ── range_hoods ──
  vent_a_hood_prh: ['ventahood.com'],
  wolf_pro_ventilation: ['subzero-wolf.com', 'subzerowolf.com'],
  zephyr_tempest_ii: ['zephyronline.com'],
  thermador_hpcn: ['thermador.com', 'bshg.com'],
  broan_elite_e60e: ['broan.com', 'broan-nutone.com'],
  broan_f40000: ['broan.com', 'broan-nutone.com'],

  // ── ranges_cooktops ──
  wolf_gas_range: ['subzero-wolf.com', 'subzerowolf.com'],
  bluestar_platinum: ['bluestarcooking.com'],
  thermador_pro_grand: ['thermador.com', 'bshg.com'],
  thermador_freedom_induction: ['thermador.com', 'bshg.com'],
  bosch_800_induction: ['bosch-home.com', 'bshg.com'],
  ge_cafe_gas: ['cafeappliances.com', 'geappliances.com', 'geappliancesstore.com', 'haier.com'],
  samsung_gas: ['samsung.com'],

  // ── refrigerators ──
  sub_zero_classic_designer: ['subzero-wolf.com', 'subzerowolf.com'],
  thermador_freedom: ['thermador.com', 'bshg.com'],
  bosch_benchmark: ['bosch-home.com', 'bshg.com'],
  jennair_column: ['jennair.com', 'whirlpoolcorp.com'],
  dacor_column: ['dacor.com', 'samsung.com'],
  viking_5_series: ['vikingrange.com', 'middleby.com'],

  // ── sinks ──
  rohl_shaws_rc3618: ['rohlhome.com', 'rohlonline.com', 'fortunebrands.com'],
  kohler_whitehaven_k6489: ['kohler.com', 'us.kohler.com'],
  blanco_ikon_33: ['blanco.com', 'blancoamerica.com'],
  kohler_cairn_k8206: ['kohler.com', 'us.kohler.com'],
  kraus_standart_pro_30: ['kraususa.com'],
  kohler_caxton_k2210: ['kohler.com', 'us.kohler.com'],
  glacier_bay_dropin: ['homedepot.com'],

  // ── tile ──
  porcelanosa_dover_caliza: ['porcelanosa.com', 'porcelanosa-usa.com'],
  crossville_virtue: ['crossvilleinc.com'],
  daltile_panoramic: ['daltile.com', 'mohawkindustries.com'],
  marazzi_color_body: ['marazziusa.com', 'marazzi.it', 'mohawkindustries.com'],
  msi_aria_bianco: ['msisurfaces.com'],
  american_olean_theoretical_bold: ['americanolean.com', 'daltile.com', 'mohawkindustries.com'],
  merola_tile_hd: ['homedepot.com'],

  // ── toilets ──
  toto_neorest_nx2: ['totousa.com', 'toto.com'],
  toto_ultramax_ii: ['totousa.com', 'toto.com'],
  kohler_highline: ['kohler.com', 'us.kohler.com'],
  american_standard_champion4: ['americanstandard-us.com', 'lixil.com'],
  gerber_viper: ['gerberonline.com', 'globeunion.com'],
  glacier_bay_hd: ['homedepot.com'],

  // ── wall_ovens ──
  miele_h7000: ['mieleusa.com', 'miele.com'],
  wolf_m_series: ['subzero-wolf.com', 'subzerowolf.com'],
  thermador_masterpiece: ['thermador.com', 'bshg.com'],
  jennair_rise: ['jennair.com', 'whirlpoolcorp.com'],
  ge_cafe: ['cafeappliances.com', 'geappliances.com', 'haier.com'],
  samsung_flex_duo: ['samsung.com'],

  // ── water_heaters ──
  rinnai_ru199in: ['rinnai.us', 'rinnai.com'],
  navien_npe240a2: ['navieninc.com', 'navien.com'],
  noritz_ez111dv: ['noritz.com'],
  bradford_white_rg2: ['bradfordwhite.com'],
  rheem_proterra: ['rheem.com', 'rheemwater.com'],
  ao_smith_proline_xe: ['aosmith.com', 'hotwater.com'],
  rheem_performance_plus: ['rheem.com', 'rheemwater.com'],

  // ── windows ──
  marvin_ultimate: ['marvin.com'],
  loewen: ['loewen.com'],
  andersen_e_series: ['andersenwindows.com', 'andersencorp.com'],
  pella_architect: ['pella.com'],
  milgard_tuscany: ['milgard.com', 'miwd.com'],
  jeldwen_v2500: ['jeld-wen.com'],
};

// ── Apply to each config ──────────────────────────────────────────────────────

const cats = fs.readdirSync(CAL).filter(d => fs.existsSync(path.join(CAL, d, 'config.json'))).sort();

for (const cat of cats) {
  const cfgPath = path.join(CAL, cat, 'config.json');
  const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
  const products = cfg.calibration_products || [];

  const mfrDomains = {};
  let missing = [];

  for (const p of products) {
    if (DOMAINS[p.slug]) {
      mfrDomains[p.slug] = DOMAINS[p.slug];
    } else {
      missing.push(p.slug);
    }
  }

  if (missing.length > 0) {
    console.log(`  ⚠️  ${cat}: missing domains for: ${missing.join(', ')}`);
  }

  cfg.manufacturer_domains = mfrDomains;
  fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2) + '\n');
  console.log(`  ✅ ${cat}: ${Object.keys(mfrDomains).length} products mapped`);
}

console.log('\nDone. All configs updated with manufacturer_domains.');
