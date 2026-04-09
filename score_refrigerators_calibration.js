// Residentialist — Refrigerator Calibration Scoring Script
// Built-in only. No freestanding, no counter-depth freestanding.
// Created March 31, 2026
// Axis weights: Q=0.30, D=0.40, P=0.30 (Durability dominant — professional hierarchy organized around reliability/serviceability)
// Post Phase 1-4 Perplexity research, pre deep-dive

const WEIGHTS = { Q: 0.30, D: 0.40, P: 0.30 };

function geoMean(Q, D, P) {
  return Math.round((Q ** WEIGHTS.Q) * (D ** WEIGHTS.D) * (P ** WEIGHTS.P) * 10);
}

const products = [
  {
    name: "Sub-Zero Classic/Designer Series",
    slug: "subzero_classic",
    tier: 1,
    target: 95,
    corporate_parent: "Sub-Zero Group (family-owned)",
    manufacturing: "Madison, WI and Phoenix, AZ (USA)",
    outlook: "Strong",
    platform_disclosure: "Proprietary platform. No shared manufacturing with any other brand.",
    // QUALITY (0.30): Dual independent Embraco compressors (EMI30HER + FGS70A, R-134a), fixed-speed by design.
    // Cam-action hinges tested 300K cycles (~20yr). Vacuum magnetic door gaskets + magnetic crisper isolation.
    // ABS plastic liner on Classic/Designer (Pro gets stainless) — minor knock.
    // Aluminum-framed glass shelves. US manufacturing (Wisconsin). Single-source, family-owned.
    // Pioneer of built-in category (~50 years). NASA-derived air scrubber is engineering quality signal.
    Q: 9.5,
    // DURABILITY (0.40): Best reliability in category — Yale: 8% more reliable than Thermador, zero DOA in 38 years.
    // 5yr full / 12yr sealed warranty (industry best). Parts back to 1986 (40+ years).
    // National factory-certified service network. 15-year parts availability commitment.
    // Sealed system lifespan 18-25+ years. Repair techs service 20+ year old units routinely.
    // Service costs: compressor $700-1500, sealed system $2000-3000+, but economically rational on $10-20K unit.
    D: 9.6,
    // PERFORMANCE (0.30): ±1°F temperature precision (industry best). Dual compressor = no cross-contamination.
    // NASA-derived air scrubber cycles every 20 min (ethylene, mold, bacteria). Vacuum-sealed doors.
    // Magnetic crisper drawers = physically isolated high-humidity microenvironment.
    // Yale Project Produce: Sub-Zero kept produce fresh dramatically longer than Bosch, Thermador, Beko, Samsung.
    // Split climate system (new): independent airflow to fridge and crisper drawers.
    // No ENERGY STAR Most Efficient (900 kWh/yr for built-in, 20-30% more than freestanding). Minor energy knock.
    P: 9.4,
    spec_adj: 0,
    specs: {
      compressor_architecture: "dual_independent_fixed_speed",
      compressor_oem: "Embraco (Nidec) — EMI30HER (fridge), FGS70A (freezer)",
      refrigerant: "R-134a",
      interior_material: "ABS plastic (Classic/Designer), Stainless steel (Pro only)",
      insulation: "Cyclopentane-blown polyurethane foam",
      door_seal: "Vacuum magnetic gasket + magnetic crisper drawers",
      hinge_type: "Cam-action, tested 300,000 cycles",
      air_purification: "NASA-derived ethylene/mold/bacteria scrubber (20-min cycle)",
      warranty_full: "5 years",
      warranty_sealed: "12 years (5yr full parts+labor, parts only yr 6-12)",
      parts_commitment: "15+ years after production end; parts available back to 1986",
      service_network: "National factory-certified technician network",
      yale_reliability: "~8% more reliable than Thermador; zero DOA in 38 years",
      expected_lifespan: "18-25+ years",
      noise_dba: "38-42 dBA (premium quiet range)",
      temperature_precision: "±1°F",
      ice_maker: "Modular, precision-tolerance, max-ice mode (known failure point but serviceable)"
    }
  },
  {
    name: "Thermador Freedom Collection",
    slug: "thermador_freedom",
    tier: 1,
    target: 90,
    corporate_parent: "BSH Home Appliances (Bosch Siemens Hausgeräte)",
    manufacturing: "Turkey (BSH factory — shared with Gaggenau, Bosch Benchmark, Miele refrigeration)",
    outlook: "Strong",
    platform_disclosure: "MANDATORY: Thermador, Gaggenau, Bosch Benchmark, and Miele built-in refrigeration manufactured in the same BSH factory in Turkey. Yale Appliance confirmed. Score separately per Rule 19 but disclose shared platform.",
    // QUALITY (0.30): Dual compressor (BSH platform), likely Secop/Embraco. Stainless steel interior standard.
    // Freedom Hinge (spring-loaded assist + SoftClose damper) — genuine engineering. Bottom-mounted compressor
    // enables true flush design (core design win over Sub-Zero Classic). ThermaFlex convertible drawers.
    // Turkish manufacturing. BSH multi-source platform. Diamond Ice. LCD + HomeConnect.
    Q: 9.2,
    // DURABILITY (0.40): Yale "A" grade. ~8% less reliable than Sub-Zero but still top-tier.
    // 2yr full / 5yr sealed warranty (industry average, well below Sub-Zero's 5/12).
    // BSH parts available through multiple distributors. International supply chain can extend lead times.
    // Compressor $433.50 direct. $179 flat + $20/6-min labor for factory service visit.
    // Expected lifespan 15-20 years.
    D: 8.8,
    // PERFORMANCE (0.30): Dual compressor = good temp stability, no cross-contamination.
    // Ethylene filter only (NOT active scrubber like Sub-Zero). No vacuum-sealed crispers.
    // ThermaFlex convertible drawers (0°F freezer ↔ 39°F fridge) — genuine functional differentiator.
    // Stainless interior conducts cold efficiently. Diamond Ice (slower melting).
    // Interior cameras, HomeConnect app monitoring. Best flush-integrated aesthetic in category.
    P: 9.1,
    spec_adj: 0,
    specs: {
      compressor_architecture: "dual_compressor_BSH_platform",
      compressor_oem: "Probable Secop/Embraco (BSH platform, not confirmed)",
      refrigerant: "Unconfirmed (R-134a or R-600a transition)",
      interior_material: "Stainless steel (standard across line)",
      insulation: "Cyclopentane-blown polyurethane foam",
      door_seal: "Freedom Hinge spring-loaded assist + SoftClose damper",
      hinge_type: "Freedom Hinge — flush design, auto door opening",
      air_purification: "Ethylene filter only (passive, not active scrubber)",
      warranty_full: "2 years",
      warranty_sealed: "5 years",
      parts_commitment: "BSH network; less certain than Sub-Zero over 20-year horizon",
      service_network: "BSH authorized service network",
      yale_reliability: "~8% less reliable than Sub-Zero; Yale grades 'A' for integrated",
      expected_lifespan: "15-20 years",
      noise_dba: "40-44 dBA",
      temperature_precision: "Not published (dual compressor, assumed ±2°F)",
      ice_maker: "Dual ice makers available; Diamond Ice feature"
    }
  },
  {
    name: "Bosch Benchmark Built-In",
    slug: "bosch_benchmark",
    tier: 2,
    target: 80,
    corporate_parent: "BSH Home Appliances (Bosch Siemens Hausgeräte)",
    manufacturing: "Turkey (BSH factory — same as Thermador/Gaggenau/Miele)",
    outlook: "Stable",
    platform_disclosure: "MANDATORY: Same BSH Turkish factory and shared compressor part numbers with Thermador and Gaggenau. Entry point to BSH premium tier.",
    // QUALITY (0.30): Same BSH platform as Thermador at entry-premium pricing.
    // Multi-zone cooling architecture. Proprietary error codes (1077, 1080, 3404, E33, E48)
    // that standard Bosch techs misdiagnose. Solid engineering but entry-level expression of BSH platform.
    // VitaFresh/FarmFresh humidity management. Turkish manufacturing.
    Q: 8.0,
    // DURABILITY (0.40): Bosch standard line 10.7-12.5% service rate (Benchmark not tracked separately).
    // The tech familiarity gap is a real durability hit — proprietary codes + proprietary BSH software
    // required for diagnosis. Standard Bosch techs misdiagnose Benchmark routinely.
    // 2yr full / 5yr sealed warranty. BSH parts network. Parts moderately stocked.
    D: 7.8,
    // PERFORMANCE (0.30): DynaCool/MultiAirFlow active circulation. VitaFresh humidity zones.
    // AutoAir door opening for moisture release. CrystalDry (if equipped).
    // Dual compressor on some models but NOT standard across Benchmark line.
    // Good temperature management but not at Sub-Zero/Thermador level of preservation tech.
    P: 8.2,
    spec_adj: 0,
    specs: {
      compressor_architecture: "BSH platform — dual on some models, not universal",
      compressor_oem: "BSH platform (Secop/Embraco probable)",
      refrigerant: "R-600a variants possible (Secop P-Series supports)",
      interior_material: "Not specified publicly; glass shelves with aluminum profile",
      insulation: "Cyclopentane-blown polyurethane foam",
      door_seal: "Standard magnetic gasket",
      hinge_type: "Standard BSH hinge system",
      air_purification: "None (FarmFresh/VitaFresh are humidity systems, not air purification)",
      warranty_full: "2 years",
      warranty_sealed: "5 years",
      parts_commitment: "BSH network; moderate stocking at distributors",
      service_network: "BSH authorized — but Benchmark requires proprietary diagnostic software and training most Bosch techs lack",
      yale_reliability: "10.7-12.5% (standard Bosch line; Benchmark not tracked separately)",
      expected_lifespan: "12-18 years",
      noise_dba: "42-44 dBA",
      temperature_precision: "Not published",
      ice_maker: "Standard BSH ice maker"
    }
  },
  {
    name: "JennAir Built-In Column",
    slug: "jennair_builtin",
    tier: 3,
    target: 66,
    corporate_parent: "Whirlpool Corporation",
    manufacturing: "USA (Whirlpool)",
    outlook: "Conditional",
    platform_disclosure: "MANDATORY: JennAir is Whirlpool Corporation. Compressor start device W10448874 cross-applies to Whirlpool, KitchenAid, Maytag, JennAir, Amana, Kenmore. Platform is shared. JennAir differentiates with variable-speed compressor and Obsidian interior.",
    // QUALITY (0.30): Whirlpool platform with genuine differentiators — variable-speed inverter compressor
    // (not shared with standard Whirlpool fixed-speed), Obsidian dark anodized aluminum interior.
    // RISE and NOIR aesthetic packages are well-designed. Nanotechnology shelving.
    // US manufacturing. But fundamentally a premium expression of a mass-market platform.
    Q: 6.8,
    // DURABILITY (0.40): JennAir service rate was 36.7% (2021) → 15.8% (2022). Dropped from Yale tracking.
    // Class-action lawsuit: evaporator-freezing defect across JennAir/KitchenAid/Whirlpool/Maytag French doors.
    // Trustpilot 1.3/5 (72+ reviews). Documented serial sealed system failures within 2-3 years.
    // 2yr full / 5-10yr sealed warranty. Whirlpool "W Service" network — broad but inconsistent execution.
    // Whirlpool parts ecosystem is the broadest in the industry — parts NOT the problem.
    D: 6.2,
    // PERFORMANCE (0.30): Variable-speed compressor provides tighter temp stability than fixed-speed.
    // Multi-zone temperature control. Obsidian interior. Smart connectivity.
    // Single compressor = shared airflow between compartments (humidity/odor transfer risk).
    // No air purification. No vacuum-sealed crispers.
    P: 7.0,
    spec_adj: 0,
    specs: {
      compressor_architecture: "single_variable_speed_inverter",
      compressor_oem: "Whirlpool platform (start device W10448874 shared across portfolio)",
      refrigerant: "Not publicly confirmed",
      interior_material: "Obsidian dark anodized aluminum",
      insulation: "Cyclopentane-blown polyurethane foam (assumed)",
      door_seal: "Standard magnetic gasket",
      hinge_type: "Standard",
      air_purification: "None",
      warranty_full: "2 years",
      warranty_sealed: "5-10 years (model dependent)",
      parts_commitment: "Whirlpool ecosystem — broadest in US market",
      service_network: "Whirlpool W Service — broad coverage, inconsistent execution for luxury tier",
      yale_reliability: "36.7% (2021), 15.8% (2022); dropped from tracking",
      expected_lifespan: "10-15 years (professionals expect major service by year 5-7)",
      noise_dba: "42-46 dBA",
      temperature_precision: "Not published",
      ice_maker: "Whirlpool in-house; broad aftermarket availability but documented failure mode"
    }
  },
  {
    name: "Dacor Column Refrigerator",
    slug: "dacor_column",
    tier: 4,
    target: 53,
    corporate_parent: "Samsung Electronics (acquired Dacor 2016)",
    manufacturing: "Samsung platform (all components Samsung DA97/DA94 prefix)",
    outlook: "Negative",
    platform_disclosure: "MANDATORY: Dacor is a Samsung appliance with premium cabinetry. Every major component (compressor DA97-17536B, control board DA94-04018G, ice maker DA97-17534A, cabinet frames DA97-series) carries Samsung part numbers. Parts and service route through Samsung channels. Warranty decisions routed through South Korea.",
    // QUALITY (0.30): Samsung Digital Inverter compressor (in-house manufactured, variable-speed).
    // Three-temperature-zone cooling (Precise Cooling Technology). Panel-ready.
    // But: complete Samsung convergence exposed — this is a Samsung refrigerator with a Dacor badge.
    // Pre-acquisition Dacor reputation was strong; post-acquisition quality perception declining.
    Q: 5.5,
    // DURABILITY (0.40): Samsung service ecosystem issues inherited fully.
    // Fan-freezing design flaw acknowledged as "known" by Dacor's own customer service.
    // Warranty routed through South Korea = days-long delays on urgent issues.
    // Samsung-authorized tech required for all Dacor service calls.
    // Parts broadly available through Samsung/Encompass/PartSelect network — parts NOT the problem.
    // Problem is service execution and warranty administration.
    // Samsung claims 21-year inverter compressor lifespan — unverified at scale for built-in.
    D: 5.0,
    // PERFORMANCE (0.30): Samsung Digital Inverter = good variable-speed temperature management.
    // Three independent temperature zones. SmartThings connectivity.
    // No air purification. No vacuum-sealed crispers. No dual independent sealed systems.
    // Samsung ice maker historically unreliable (DA97-17534A / DA97-18859A).
    P: 5.6,
    spec_adj: 0,
    specs: {
      compressor_architecture: "single_samsung_digital_inverter",
      compressor_oem: "Samsung in-house (DA97-17536B)",
      refrigerant: "Not publicly confirmed",
      interior_material: "Not publicly confirmed",
      insulation: "Cyclopentane-blown polyurethane foam (assumed)",
      door_seal: "Standard magnetic gasket",
      hinge_type: "Standard",
      air_purification: "None",
      warranty_full: "2 years (routed through Samsung/South Korea)",
      warranty_sealed: "5 years",
      parts_commitment: "Samsung global distribution — broad availability",
      service_network: "Samsung-authorized only; Dacor service now requires Samsung authorization",
      yale_reliability: "Samsung stopped being sold by Yale in 2023; Dacor not tracked separately",
      expected_lifespan: "12-18 years (if service ecosystem functional)",
      noise_dba: "Not published",
      temperature_precision: "Not published",
      ice_maker: "Samsung DA97-17534A — historically unreliable; documented CPSC complaints"
    }
  },
  {
    name: "Viking 5 Series Built-In",
    slug: "viking_5_series",
    tier: 4,
    target: 45,
    corporate_parent: "Middleby Corporation (26North Partners acquiring 51% stake, 2025)",
    manufacturing: "Greenwood, MS (Viking does NOT manufacture own refrigerators — sourced externally)",
    outlook: "Negative",
    platform_disclosure: "Viking does not manufacture its own refrigerators. Compressor OEM undisclosed. Post-Middleby (2013) quality decline widely documented. 26North Partners acquiring 51% stake in 2025 — ownership transition ongoing.",
    // QUALITY (0.30): Variable Speed DC Overdrive compressor (single, undisclosed OEM).
    // R-600a refrigerant (genuine environmental/efficiency positive). Pro Chill temperature management.
    // Plasmacluster Ion Air Purifier (licensed from Sharp).
    // But: does not manufacture own refrigerators, compressor OEM undisclosed,
    // post-Middleby quality decline widely documented by professionals and consumers.
    // One builder: 100% defect rate, 33% outright failure rate across 6 Viking appliances.
    Q: 5.0,
    // DURABILITY (0.40): >60% first-year service rate at Yale. CATASTROPHIC.
    // Wrong parts sent repeatedly. Multi-month warranty wait times.
    // 2yr full / 6yr sealed / 12yr limited sealed — competitive on paper, stressed in execution.
    // Parts regionally stocked but demand strained by failure volume.
    // Multiple retailers now actively advise against Viking.
    // "I would never buy Viking again" — contractor consensus.
    D: 3.8,
    // PERFORMANCE (0.30): R-600a provides 20-25% better COP than R-134a — genuine efficiency advantage.
    // Variable-speed DC compressor = good steady-state temperature management.
    // ±1°F claimed (unverified independently). Plasmacluster Ion air purification.
    // Single compressor = shared airflow (cross-contamination risk).
    // Pro Chill rapid pulldown feature.
    P: 5.2,
    spec_adj: 0,
    specs: {
      compressor_architecture: "single_variable_speed_DC",
      compressor_oem: "UNDISCLOSED — probable Secop, Embraco, or GMCC/Toshiba",
      refrigerant: "R-600a (isobutane) — low GWP, +20-25% COP vs R-134a",
      interior_material: "Not publicly confirmed",
      insulation: "Cyclopentane-blown polyurethane foam (assumed)",
      door_seal: "Standard magnetic gasket",
      hinge_type: "Not published",
      air_purification: "Plasmacluster Ion Air Purifier (Sharp licensed technology)",
      warranty_full: "2 years",
      warranty_sealed: "6 years full, 12 years limited",
      parts_commitment: "Regional stocking; next-day delivery claimed but strained by failure volume",
      service_network: "Viking/Middleby dealer network; independent techs face undisclosed-OEM barrier",
      yale_reliability: ">60% first-year service rate (multiple consecutive years post-Middleby)",
      expected_lifespan: "Unknown (Middleby era insufficient track record)",
      noise_dba: "Not published",
      temperature_precision: "±1°F claimed (unverified)",
      ice_maker: "Not documented separately"
    }
  }
];

// Score all products
console.log("=== REFRIGERATOR CALIBRATION SCORES ===");
console.log(`Weights: Q=${WEIGHTS.Q}, D=${WEIGHTS.D}, P=${WEIGHTS.P}`);
console.log(`Scope: Built-in only. No freestanding, no counter-depth.\n`);

let allHit = true;

products.forEach(p => {
  const score = geoMean(p.Q, p.D, p.P);
  const delta = score - p.target;
  const status = delta === 0 ? "✅ HIT" : `❌ MISS (delta ${delta > 0 ? '+' : ''}${delta})`;
  
  if (delta !== 0) allHit = false;
  
  console.log(`${p.name}`);
  console.log(`  Tier ${p.tier} | Target: ${p.target} | Score: ${score} | ${status}`);
  console.log(`  Q=${p.Q} D=${p.D} P=${p.P} | Outlook: ${p.outlook}`);
  console.log(`  Corporate: ${p.corporate_parent}`);
  console.log(`  Manufacturing: ${p.manufacturing}`);
  console.log(`  Platform: ${p.platform_disclosure.substring(0, 100)}...`);
  console.log();
});

console.log("---");
if (allHit) {
  console.log("🎯 ALL TARGETS HIT EXACTLY");
} else {
  console.log("⚠️  SOME TARGETS MISSED — adjust axis scores");
}
