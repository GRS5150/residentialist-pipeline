#!/usr/bin/env node
/**
 * Dishwasher Calibration Scoring Script — v2 (Post Deep Dive)
 *
 * CORRECTIONS APPLIED (March 31, 2026):
 * - Miele: noise 39-40 dBA (was 42), energy 210 (was 205), water 3.2 (was 3.0),
 *   NSF 184 NOT confirmed (report only). No axis score changes.
 * - Bosch 800: energy 240 kWh (was 199), perf adj +3 (was +4). P axis lowered.
 * - KitchenAid: motor is PSC AC induction NOT brushless (MAJOR), filter is
 *   self-cleaning NOT manual mesh (MAJOR), energy 270 kWh (was 220).
 *   Quality adj +2 (was +4), Perf adj +1 (was +2). Target 81 (was 83).
 * - Bosch 300: drying is PureDry NOT AutoAir (CRITICAL), energy 269 (was 235),
 *   water 3.5 (was 3.2). Perf adj -3 (was 0). Target 67 (was 70).
 * - Whirlpool: COMPLETE REWRITE. WDT750SAKZ is stainless tub (not plastic),
 *   PMSM motor (not induction), manual mesh filter (not grinder), 3 spray zones
 *   (not 2 arms), has third rack, adjustable racks, 47 dBA (not 53).
 *   Target 64 (was 57). Tier 3 (was Tier 4).
 * - Samsung: parts_availability corrected proprietary_limited→proprietary_available
 *   (known correction), noise 46 dBA mid-range (was 44). Target 47 (was 44).
 *
 * Usage: node score_dishwashers_calibration_v2.js
 */

const fs = require('fs');
const path = require('path');

// ─── Weights ───────────────────────────────────────────────────────────────────

const WEIGHTS = { quality: 0.30, durability: 0.40, performance: 0.30 };

// ─── Geometric Mean ────────────────────────────────────────────────────────────

function geoMean(q, d, p) {
  const qn = Math.max(q / 10, 0.01);
  const dn = Math.max(d / 10, 0.01);
  const pn = Math.max(p / 10, 0.01);
  return Math.pow(qn, WEIGHTS.quality) *
         Math.pow(dn, WEIGHTS.durability) *
         Math.pow(pn, WEIGHTS.performance) * 10;
}

function getLabel(score) {
  if (score >= 90) return 'Best in Class';
  if (score >= 75) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Below Standard';
}

// ─── Calibration Products ────────────────────────────────────────────────────

const CALIBRATION_PRODUCTS = [
  {
    name: 'Miele G7000 Series',
    slug: 'miele_g7000',
    target: 95,
    tier: 'Tier 1',

    specs: {
      // Quality
      tub_material: 'stainless_steel',         // adj: +1
      motor_type: 'brushless_dc_in_house',     // adj: +1 (in-house Euskirchen, ArcelorMittal electrical steel)
      filter_type: 'manual_mesh_3stage',       // adj: +1 (three-stage: coarse, fine, micro-fine)
      spray_arm_architecture: '3_full_arms',   // adj: +1 (lower, middle, upper — dedicated upper arm)
      third_rack: '3d_multiflex_tray',         // adj: 0 (adjustable H/W/D, no wash jets, cleaned by upper arm)
      rack_adjustability: 'loaded_adjustable',  // adj: +1 (only brand with middle rack adjustable while loaded — Miele FlexLine)

      // Performance — CORRECTED from deep dive
      noise_dba: 39,                           // adj: +1 (G7766=39, G7566=40, ExtraQuiet to 37)
      drying_technology: 'fan_plus_auto_open', // adj: +1 (CleanDry fan + AutoOpen door on G7766)
      energy_kwh_year: 210,                    // adj: +1 (CORRECTED from 205; still well under 240)
      water_gal_per_cycle: 3.2,               // adj: 0 (CORRECTED from 3.0)

      // Durability
      yale_service_rate_pct: 5.6,             // adj: +2 (best in category, 2026 data, down from 20.5% in 2020)
      manufacturer_design_life_years: 20,      // adj: +1 (5,600 cycles tested — development target, not guarantee)
      warranty_years: 2,                       // adj: +1 (2yr standard; 5yr on G7900)
      service_network_coverage: 'regional_or_limited', // adj: 0 (limited independent service, 4-6 week waits in low-density areas)
      parts_availability: 'proprietary_available',     // adj: 0 (proprietary, 15-year guarantee, expensive, 90-day part warranty)

      // Material Safety (report only)
      nsf_ansi_184_certified: false,           // CORRECTED: Rhine-Waal University cert ≠ NSF 184. Not confirmed.
      ul_749_compliant: true,
      tub_material_food_grade: true,
      sanitize_temp_f: 158,                    // SaniWash/Pots&Pans programs
    },

    // Quality adj: +1+1+1+1+0+1 = +5
    // Performance adj: +1+1+1+0 = +3
    // Durability adj: +2+1+1+0+0 = +4
    spec_adj: { quality: 5, performance: 3, durability: 4, total: 12, capped_total: 8 },

    axis_scores: { quality: 9.6, durability: 9.4, performance: 9.5 },

    notes: [
      'Best-in-category service rate: 5.6% (Yale 2026, down from 20.5% in 2020)',
      'Only brand testing to 20-year design life (5,600 wash cycles) — development target, not guarantee',
      'Vertically integrated: in-house motors (Euskirchen), ArcelorMittal electrical steel, Stäubli robotic assembly (Uničov)',
      '3 full independent spray arms — dedicated upper arm over upper rack',
      'Only brand with middle rack adjustable while loaded (FlexLine)',
      '3D MultiFlex cutlery tray — adjustable height/width/depth, cleaned by upper spray arm',
      'AutoDos 2.0 PowerDisk (2024+ production): substantive redesign of 1.0 which drove 2020 service spike',
      'CleanDry fan-assisted + AutoOpen drying — excellent for ceramics/glass, Bosch CrystalDry beats on plastics',
      '15-year parts availability guarantee (Miele USA published policy)',
      'WEAKNESS: Proprietary parts, expensive repairs ($500-800 circ pump), 90-day part warranty after repair',
      'WEAKNESS: Historical volatility — 20.5% service rate in 2020, AutoDos 1.0 correlation',
      'WEAKNESS: 2-year standard US warranty undercuts 20-year design life claim (5-year on G7900)',
      'WEAKNESS: Selective parts restriction to non-authorized techs in some markets — US still accessible',
      'NSF/ANSI 184 NOT independently confirmed for residential G7566/G7766 (Rhine-Waal ≠ NSF)',
    ],

    report_fields: {
      corporate_parent: 'Miele & Cie. KG — family-owned (Gütersloh, Germany). 4th generation. No platform sharing.',
      outlook: 'Strong',
      manufacturing: 'Motors: Euskirchen, Germany. Final assembly: Uničov, Czech Republic (Stäubli robotic lines).',
    },
  },

  {
    name: 'Bosch 800 Series',
    slug: 'bosch_800',
    target: 91,
    tier: 'Tier 1',

    specs: {
      // Quality
      tub_material: 'stainless_steel',         // adj: +1
      motor_type: 'bldc_inverter',             // adj: +1 (Sisme candidate, not confirmed)
      filter_type: 'manual_mesh_3stage',       // adj: +1 (same filter across 100-Benchmark)
      spray_arm_architecture: '2_arms_plus_sprinkler', // adj: 0 (2 rotating + passive overhead fill tube)
      third_rack: 'flexible_deep',             // adj: 0 (MyWay rack — deeper than flat tray, fold-down wings)
      rack_adjustability: 'rackmatic_9pos',    // adj: 0 (9 positions, 3 heights, CAN adjust while loaded)

      // Performance — CORRECTED
      noise_dba: 42,                           // adj: +1
      drying_technology: 'zeolite',            // adj: +2 (CrystalDry — best for plastics, 176°F)
      energy_kwh_year: 240,                    // adj: 0 (CORRECTED from 199 — EPA ENERGY STAR confirmed)
      water_gal_per_cycle: 3.2,               // adj: 0

      // Durability
      yale_service_rate_pct: 7.8,             // adj: +1 (2026 data, consistent improving trend)
      manufacturer_design_life_years: 13,      // adj: 0 (12-15 year consensus, BSH doesn't publish MTBF)
      warranty_years: 1,                       // adj: 0 (1yr P+L; 5yr PCB/racks parts-only)
      service_network_coverage: 'national_independent_widely_stocked', // adj: +1
      parts_availability: 'widely_stocked',    // adj: 0 (every independent tech works on Bosch)

      // Material Safety (report only)
      nsf_ansi_184_certified: true,            // Confirmed: 151-160°F final rinse, use and care manual
      ul_749_compliant: true,
      tub_material_food_grade: true,
      sanitize_temp_f: 158,
    },

    // Quality adj: +1+1+1+0+0+0 = +3
    // Performance adj: +1+2+0+0 = +3 (CORRECTED from +4: energy dropped)
    // Durability adj: +1+0+0+1+0 = +2
    spec_adj: { quality: 3, performance: 3, durability: 2, total: 8, capped_total: 8 },

    axis_scores: { quality: 9.0, durability: 9.2, performance: 9.0 },
    // P lowered from 9.1 to 9.0: energy correction (240 not 199)

    notes: [
      'CrystalDry zeolite drying: volcanic mineral absorbs moisture, releases heat to 176°F — measurably best for plastics',
      'Reviewed.com: 99.97% soil removal on Heavy cycle — near-perfect cleaning',
      'Yale 2026 service rate 7.8% — consistent improving trend (was 11.1% in 2020)',
      'BSH platform (New Bern, NC since 1997, 10M+ units). Shares platform with Thermador and Gaggenau.',
      'PowerControl spray arm: motorized sector redirects wash intensity to specific quadrants (Home Connect app)',
      'RackMatic: 9 positions, 3 heights, adjustable while loaded',
      'EasyGlide Plus ball-bearing wheels on all three racks',
      'STRENGTH: Universal parts + every independent tech works on them = best premium serviceability',
      'STRENGTH: 5-year warranty on PCB/microprocessor — covers the heater relay failure mode',
      'WEAKNESS: Heater relay solder joint fatigue — multi-generation board issue, UpFix addresses for $160',
      'WEAKNESS: Integrated motor-pump (no separate motor replacement), $131 assembly + labor',
      'WEAKNESS: Energy 240 kWh/yr — CrystalDry regeneration adds overhead vs. 199 kWh claimed in some sources',
      'CAVEAT: Reddit 2025 threads report motor screen blockage on 2023-2024 production — emerging, monitor',
    ],

    report_fields: {
      corporate_parent: 'BSH Home Appliances (Robert Bosch GmbH, 100% since 2015)',
      bsh_platform_disclosure: 'Bosch, Thermador, and Gaggenau dishwashers share the same BSH platform. Service rate spread: 0.4% (7.7-8.1%). Price differences reflect features and finishes, not structural differences.',
      outlook: 'Strong',
      manufacturing: 'New Bern, North Carolina. $32M expansion 2019, $11M expansion 2025.',
    },
  },

  {
    name: 'KitchenAid KDTM604 (M-series)',
    slug: 'kitchenaid_kdtm604',
    target: 81,          // CORRECTED from 83: motor and filter downgrades + sump weakness
    tier: 'Tier 2',

    specs: {
      // Quality — CORRECTED
      tub_material: 'stainless_steel',         // adj: +1
      motor_type: 'psc_ac_induction',          // adj: 0 (CORRECTED from brushless_inverter — PSC confirmed by run capacitor W10753070)
      filter_type: 'self_cleaning',            // adj: 0 (CORRECTED from manual_mesh — "True Self-Cleaning Filtration")
      spray_arm_architecture: '4_spray_levels', // adj: 0 (lower, lower-mid, upper, third-level via hydraulic manifold)
      third_rack: 'with_wash_jets',            // adj: +1 (360° Max Jets — largest third rack, rotating wash jets, unique)
      rack_adjustability: 'satinglide_max',    // adj: 0 (SatinGlide Max ball-bearing rails — KA exclusive within Whirlpool family)

      // Performance — CORRECTED
      noise_dba: 44,                           // adj: +1
      drying_technology: 'fan_plus_heated',    // adj: +1 (ProDry fan-assisted + recessed heating element)
      energy_kwh_year: 270,                    // adj: -1 (CORRECTED from 220 — Energy Guide W11650512B confirms)
      water_gal_per_cycle: 3.2,               // adj: 0

      // Durability
      yale_service_rate_pct: 8.2,             // adj: +1 (2026 data, was 7.4% in 2025)
      manufacturer_design_life_years: null,    // adj: 0 (not published, 10-15 yr industry consensus)
      warranty_years: 1,                       // adj: 0 (1yr P+L; 2-5yr parts on motor/board/racks/heater)
      service_network_coverage: 'national_independent_widely_stocked', // adj: +1 (Whirlpool service network)
      parts_availability: 'widely_stocked',    // adj: 0

      // Material Safety (report only)
      nsf_ansi_184_certified: true,            // Sani Rinse cycle confirmed, 156°F final rinse
      ul_749_compliant: true,
      tub_material_food_grade: true,
      sanitize_temp_f: 156,
    },

    // Quality adj: +1+0+0+0+1+0 = +2 (CORRECTED from +4: motor 0, filter 0)
    // Performance adj: +1+1-1+0 = +1 (CORRECTED from +2: energy -1)
    // Durability adj: +1+0+0+1+0 = +2 (unchanged)
    spec_adj: { quality: 2, performance: 1, durability: 2, total: 5, capped_total: 5 },

    axis_scores: { quality: 7.9, durability: 8.3, performance: 8.0 },
    // Q dropped from 8.2→7.9: motor not brushless, filter not manual mesh
    // D dropped from 8.4→8.3: sump/diverter seal is documented systemic failure
    // P dropped from 8.3→8.0: energy penalty

    notes: [
      '360° Max Jets third rack: hydraulic-manifold-fed rotating wash jets — largest third rack, unique feature',
      'SatinGlide Max ball-bearing rack rails — KitchenAid exclusive within Whirlpool family',
      'CORRECTED: Motor is PSC AC induction (not brushless) — confirmed by run capacitor W10753070',
      'CORRECTED: Filter is self-cleaning (not manual mesh) — "True Self-Cleaning Filtration"',
      'CORRECTED: Energy 270 kWh/yr (not 220) — at/above ENERGY STAR threshold',
      'Yale 2026 service rate 8.2% (was 7.4% in 2025 — slight increase, still safe range)',
      'Whirlpool platform (Findlay, Ohio) — broadest US parts supply chain',
      'ProDry fan-assisted drying: good for ceramics/glass, behind Bosch CrystalDry on plastics',
      'SYSTEMIC WEAKNESS: Diverter motor shaft seal fails — seal NOT sold separately. Requires full Sump & Motor Assembly replacement ($500-700 P+L). Most-cited failure mode by techs.',
      'Door balance link (8194001) — plastic anchor cracks, high recurrence. $10-15 part.',
      '2017 class action on earlier rack collapse (not KDTM604 generation)',
      'All 4 spray levels share one pump — pump pressure degradation reduces all levels simultaneously',
    ],

    report_fields: {
      corporate_parent: 'KitchenAid — brand of Whirlpool Corporation',
      platform_disclosure: 'KitchenAid uses Whirlpool manufacturing platform (Findlay, OH). Whirlpool standard models share the underlying platform at lower specs.',
      outlook: 'Stable',
    },
  },

  {
    name: 'Bosch 300 Series',
    slug: 'bosch_300',
    target: 67,          // CORRECTED from 70: PureDry (not AutoAir), worse energy/water
    tier: 'Tier 3',

    specs: {
      // Quality (unchanged — same BSH platform components)
      tub_material: 'stainless_steel',         // adj: +1 (full stainless on standard 24" 300 models)
      motor_type: 'bldc_inverter',             // adj: +1 (same BSH platform, Askoll confirmed OEM)
      filter_type: 'manual_mesh_3stage',       // adj: +1 (same filter as 800)
      spray_arm_architecture: '2_arms_plus_sprinkler', // adj: 0 (PrecisionWash, no PowerControl)
      third_rack: 'flat_tray',                 // adj: 0 (standard V-shape silverware tray, not deep)
      rack_adjustability: 'rackmatic_9pos',    // adj: 0 (same 9-position RackMatic as 500/800)

      // Performance — CORRECTED (3 spec corrections)
      noise_dba: 46,                           // adj: 0 (audible in open-concept, 4 dB louder than 800)
      drying_technology: 'condensation_only',  // adj: -1 (CRITICAL CORRECTION: PureDry, NOT AutoAir. AutoAir is 500+)
      energy_kwh_year: 269,                    // adj: -1 (CORRECTED from 235)
      water_gal_per_cycle: 3.5,               // adj: -1 (CORRECTED from 3.2)

      // Durability (unchanged — same BSH platform)
      yale_service_rate_pct: 7.8,             // adj: +1 (same platform-level rate)
      manufacturer_design_life_years: 13,      // adj: 0
      warranty_years: 1,                       // adj: 0 (identical warranty structure to 800)
      service_network_coverage: 'national_independent_widely_stocked', // adj: +1
      parts_availability: 'widely_stocked',    // adj: 0

      // Material Safety (report only)
      nsf_ansi_184_certified: true,
      ul_749_compliant: true,
      tub_material_food_grade: true,
    },

    // Quality adj: +1+1+1+0+0+0 = +3 (unchanged)
    // Performance adj: 0-1-1-1 = -3 (CORRECTED from 0: drying, energy, water all worse)
    // Durability adj: +1+0+0+1+0 = +2 (unchanged)
    spec_adj: { quality: 3, performance: -3, durability: 2, total: 2, capped_total: 2 },

    axis_scores: { quality: 7.2, durability: 6.9, performance: 6.0 },
    // P dropped from 7.0→6.0: PureDry (not AutoAir), worse energy, worse water

    notes: [
      'CRITICAL CORRECTION: Drying is PureDry (closed condensation only), NOT AutoAir. AutoAir is 500 Series+.',
      'PureDry: 79% bone dry (Reviewed.com lab) — good for non-plastics, plastics routinely damp',
      'Same BSH platform as 800 — cleaning performance nearly identical (99.35% Auto cycle)',
      'Same pump, motor, board, filter, sump, tub as 800 — all parts interchangeable',
      'Full stainless tub — where Bosch separates from builder-grade (100 has plastic base)',
      'AquaStop standard on 300+ — meaningful upgrade over 100 Series float-switch-only',
      '46 dBA — audible in open-concept kitchen, 4 dB louder than 800 (2.5× intensity)',
      '269 kWh/yr — modestly higher than 800 (240), CrystalDry regeneration savings absent',
      '3.5 gal/cycle — higher water consumption than 800 (3.2)',
      'The 300→800 premium buys: CrystalDry, 4 dB quieter, MyWay deep rack, PowerControl arm. NOT cleaning.',
      'No AutoAir door mechanism = no AutoAir failure mode (documented issue on 500 Series)',
      '5-year PCB warranty covers heater relay failure mode (same board, same failure pattern)',
      'Bosch 500 at ~$900-1,000 is the most-cited pro recommendation. 300 at ~$700-800 sits just below.',
    ],

    report_fields: {
      corporate_parent: 'BSH Home Appliances (Robert Bosch GmbH)',
      bsh_platform_disclosure: 'Same BSH platform as 800, Benchmark, Thermador, Gaggenau. Service rate spread: 0.4%.',
      outlook: 'Strong',
      manufacturing: 'New Bern, North Carolina.',
    },
  },

  {
    name: 'Whirlpool WDT750SAKZ',
    slug: 'whirlpool_wdt750sakz',
    target: 64,          // CORRECTED from 57: complete rewrite — product is far better than assumed
    tier: 'Tier 3',      // CORRECTED from Tier 4

    specs: {
      // Quality — COMPLETELY CORRECTED
      tub_material: 'stainless_steel',         // adj: +1 (CORRECTED from plastic — confirmed SS walls, plastic sump standard)
      motor_type: 'pmsm_brushless',            // adj: +1 (CORRECTED from induction — Askoll PMSM confirmed by Encompass "MP PMSM AW NAR ASKOLL")
      filter_type: 'manual_mesh_2stage',       // adj: +1 (CORRECTED from grinder — "Hard Food Disposer: false", manual 2-part mesh)
      spray_arm_architecture: '3_spray_zones',  // adj: 0 (CORRECTED from 2_arms — lower, upper, third-level W11039869)
      third_rack: 'flat_tray',                 // adj: 0 (CORRECTED from none — W11540175 flat utensil/cutlery tray)
      rack_adjustability: 'multi_position',    // adj: 0 (CORRECTED from fixed — upper rack 3-position adjustable)

      // Performance
      noise_dba: 47,                           // adj: 0 (CORRECTED from 53 — manufacturer rated, CR consistent)
      drying_technology: 'heated_element',     // adj: -2 (recessed element, CR 1/5 drying, worst in category)
      energy_kwh_year: 270,                    // adj: -1 (CORRECTED from 240 — NOT Energy Star certified)
      water_gal_per_cycle: 2.5,               // adj: +1 (CORRECTED from 3.5 — best water efficiency in calibration set)

      // Durability
      yale_service_rate_pct: null,             // adj: 0 (Yale stopped tracking — last data: 1.4-4.1% 2018-2022)
      manufacturer_design_life_years: null,    // adj: 0 (not published; 20-year tub warranty implies long expectation)
      warranty_years: 1,                       // adj: 0 (1yr P+L; 4yr electronic control parts-only; 20yr tub)
      service_network_coverage: 'national_independent_widely_stocked', // adj: +1 (broadest service network in US)
      parts_availability: 'universal',         // adj: +1 (most widely stocked parts in US appliance industry)

      // Material Safety (report only)
      nsf_ansi_184_certified: false,           // No Energy Star certification, no NSF 184 confirmed
      ul_749_compliant: true,
      tub_material_food_grade: true,           // stainless steel
    },

    // Quality adj: +1+1+1+0+0+0 = +3 (CORRECTED from -6)
    // Performance adj: 0-2-1+1 = -2 (CORRECTED from -4)
    // Durability adj: 0+0+0+1+1 = +2 (unchanged)
    spec_adj: { quality: 3, performance: -2, durability: 2, total: 3, capped_total: 3 },

    axis_scores: { quality: 6.8, durability: 6.5, performance: 5.8 },

    notes: [
      'COMPLETE REWRITE: WDT750SAKZ is dramatically better than v1 script assumed',
      'CORRECTED: Stainless steel tub (not plastic) — SS walls, standard plastic sump',
      'CORRECTED: PMSM brushless motor by Askoll (not AC induction) — confirmed by Encompass part listing',
      'CORRECTED: Manual mesh filter, no grinder (not grinder) — 2-part manual-clean, no food disposer',
      'CORRECTED: 3 spray zones with dedicated third-level arm W11039869 (not 2 arms)',
      'CORRECTED: Has third rack W11540175 (not none) — flat utensil/cutlery tray',
      'CORRECTED: 3-position adjustable upper rack (not fixed)',
      'CORRECTED: 47 dBA (not 53) — quiet by industry standards, not silent',
      'CORRECTED: 2.5 gal/cycle (not 3.5) — best water efficiency in calibration set',
      'NOT Energy Star certified — 270 kWh/yr at or above threshold (heated drying is the driver)',
      'Yale historical: 1.4-4.1% service rates (2018-2022) — better than current Bosch! But Yale stopped selling.',
      'Drain pump is the characteristic failure — cheap ($35-90), easy DIY, 30-min fix',
      'STRENGTH: Most widely stocked parts in US appliance industry. Broadest service network.',
      'STRENGTH: Whirlpool platform shared with KitchenAid, Maytag — massive installed base',
      'WEAKNESS: Drying is terrible — CR rated 1/5. Heated element, no condensation/zeolite/fan assist.',
      'WEAKNESS: Not Energy Star — heated drying drives 270 kWh/yr',
      'WEAKNESS: Plastic sump standard (not unique to Whirlpool — all residential dishwashers)',
      'Repair techs: "Get Bosch or Whirlpool. Decent compromise between luxury and reliability."',
      'At $499-599, competes meaningfully with Bosch 300 ($800-1000) — Bosch wins on drying/noise/platform.',
    ],

    report_fields: {
      corporate_parent: 'Whirlpool Corporation — only major US-based, US-owned appliance manufacturer',
      platform_disclosure: 'KitchenAid uses the same Whirlpool platform at higher specs.',
      outlook: 'Stable',
      manufacturing: 'Findlay, Ohio (est. 1967, World Class Manufacturing certified, $300M expansion 2025).',
      yale_historical: 'Yale last tracked: 1.4% (2018), 4.3% (2019), 2.6% (2020), 2.1% (2021), 4.1% (2022). Dropped from dataset due to distribution shift to big-box, NOT reliability.',
    },
  },

  {
    name: 'Samsung DW80 (mid-range)',
    slug: 'samsung_dw80_mid',
    target: 47,          // CORRECTED from 44: parts availability fix + noise adjustment
    tier: 'Tier 4',

    specs: {
      // Quality
      tub_material: 'stainless_steel',         // adj: +1
      motor_type: 'bldc_inverter',             // adj: +1 (in-house Samsung DD82 series design)
      filter_type: 'manual_mesh_3part',        // adj: 0 (manual-clean despite some "self-cleaning" marketing language)
      spray_arm_architecture: '3_spray_arms',  // adj: 0 (lower, middle, upper — standard rotating)
      third_rack: 'flat_tray',                 // adj: 0 (FlexTray cutlery tray — shallow)
      rack_adjustability: 'multi_position',    // adj: 0

      // Performance — CORRECTED
      noise_dba: 46,                           // adj: 0 (CORRECTED from 44 — DW80CG5450 mid-range = 46; 42 only on $799 DW80B7071)
      drying_technology: 'auto_open',          // adj: 0 (AutoRelease door — functional, plastics still wet)
      energy_kwh_year: 232,                    // adj: 0 (225-239 range, mid-point)
      water_gal_per_cycle: 3.2,               // adj: 0

      // Durability — CORRECTED (known Samsung fix)
      yale_service_rate_pct: null,             // adj: 0 (not in Yale dataset — Yale doesn't sell Samsung)
      manufacturer_design_life_years: null,    // adj: 0 (not published; 10-13 yr industry estimate)
      warranty_years: 1,                       // adj: 0 (1yr P+L; 5yr PCB + racking parts-only)
      service_network_coverage: 'proprietary_limited_service', // adj: -2 (contracted network, thin real coverage, techs refuse Samsung)
      parts_availability: 'proprietary_available', // adj: 0 (KNOWN CORRECTION from -2: parts ARE available at RepairClinic, PartSelect, Samsung direct)

      // Material Safety (report only)
      nsf_ansi_184_certified: true,            // Sanitize option confirmed, 163°F
      ul_749_compliant: true,
      tub_material_food_grade: true,
      sanitize_temp_f: 163,
    },

    // Quality adj: +1+1+0+0+0+0 = +2 (unchanged)
    // Performance adj: 0+0+0+0 = 0 (CORRECTED from +1: noise adj dropped)
    // Durability adj: 0+0+0-2+0 = -2 (CORRECTED from -4: parts_availability fixed)
    spec_adj: { quality: 2, performance: 0, durability: -2, total: 0, capped_total: 0 },

    axis_scores: { quality: 5.0, durability: 4.4, performance: 4.8 },
    // Q raised from 4.4→5.0: parts availability no longer penalizes quality
    // D raised from 4.2→4.4: parts fix removes -2 penalty, but service network still catastrophic
    // P stays similar: noise adjustment offsets slightly

    notes: [
      'KNOWN CORRECTION: parts_availability changed from proprietary_limited (-2) to proprietary_available (0). Parts ARE available at RepairClinic, PartSelect, AppliancePartsPros, Samsung direct.',
      'The problem is technician availability, not parts availability. -2 stays on service_network_coverage.',
      'CORRECTED: Noise 46 dBA for mid-range DW80CG5450 ($599); 42 dBA only on $799 DW80B7071',
      'Hardest "no" in category — unanimous across repair techs, Yale, independent retailers, forums',
      'Consumer Reports: 23% repair/serious problems — most repair-prone brand, "cannot recommend"',
      'Yale dropped Samsung: "nonexistent customer service and repair network"',
      'Samsung "Beyond Boundaries" claims 99% US coverage — contradicted by owner experiences (TX: 1 repair company for entire state)',
      'Contracted third-party network: sent Dish Network techs for washing machine recall repairs',
      'Sump cover plastic warping: creates circulation bypass → poor cleaning with no error code',
      'Rack coating degradation: 12-24 month onset, rust at 2-3 years. 5yr warranty claims routinely denied as "cosmetic."',
      'Class action investigation active (March 2026) on rack coating defects',
      'WaterWall belt fracture (premium models) — "it broke once, it is going to break again"',
      'Warranty claim process described as "actively adversarial" — denial on installation, receipt format, cosmetic grounds',
      'Scores BELOW Whirlpool despite better paper specs because service ecosystem is the functional score for Tier 4',
      'Whirlpool SS tub + universal parts + broadest network > Samsung SS tub + proprietary + no repair path',
    ],

    report_fields: {
      corporate_parent: 'Samsung Electronics Co., Ltd. — global conglomerate',
      outlook: 'Conditional',
      manufacturing: 'South Korea (premium), Vietnam (high-volume). Some models China/Thailand.',
      cr_designation: 'Consumer Reports: "Cannot recommend" — reliability flag overrides performance scores.',
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
  console.log('DISHWASHER CALIBRATION SCORING RUN — v2 (Post Deep Dive Corrections)');
  console.log('='.repeat(70));
  console.log('Weights: Q=0.30, D=0.40, P=0.30');
  console.log('Method: Geometric mean, no axis stretch');
  console.log('Deep dives: 6/6 processed, corrections applied');
  console.log('');

  let allPass = true;
  for (const product of CALIBRATION_PRODUCTS) {
    const result = scoreProduct(product);
    const pass = result.delta === 0;
    const flag = pass ? '✓' : Math.abs(result.delta) <= 1 ? '~' : '✗';
    if (!pass) allPass = false;
    console.log(`${flag} ${product.name.padEnd(36)} | Q:${product.axis_scores.quality} D:${product.axis_scores.durability} P:${product.axis_scores.performance} | ${result.display} (target ${product.target}, delta ${result.delta >= 0 ? '+' : ''}${result.delta}) | ${product.tier} | ${result.label}`);
  }

  console.log('');
  console.log(allPass ? '✓ ALL TARGETS HIT EXACTLY' : '~ See deltas above — adjust axis scores');
  console.log('');

  // Summary of changes
  console.log('─'.repeat(70));
  console.log('TARGET CHANGES:');
  console.log('  Miele G7000:   95 → 95 (no change)');
  console.log('  Bosch 800:     91 → 91 (no change)');
  console.log('  KitchenAid:    83 → 81 (motor/filter corrections, sump weakness)');
  console.log('  Bosch 300:     70 → 67 (PureDry not AutoAir, energy/water corrections)');
  console.log('  Whirlpool:     57 → 64 (complete rewrite — SS tub, PMSM, mesh filter)');
  console.log('  Samsung:       44 → 47 (parts availability fix, noise correction)');
  console.log('');
  console.log('TIER CHANGES:');
  console.log('  Whirlpool: Tier 4 → Tier 3');
  console.log('');
  console.log('MAJOR CORRECTIONS:');
  console.log('  1. KitchenAid motor: brushless_inverter → PSC AC induction');
  console.log('  2. KitchenAid filter: manual_mesh → self_cleaning');
  console.log('  3. Bosch 300 drying: AutoAir → PureDry (condensation only)');
  console.log('  4. Whirlpool: 8 spec fields corrected (complete product rewrite)');
  console.log('  5. Samsung parts: proprietary_limited → proprietary_available');
  console.log('  6. Bosch 800 energy: 199 → 240 kWh/yr');
  console.log('');
}

main();
