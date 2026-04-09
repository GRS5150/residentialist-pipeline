#!/usr/bin/env node
/**
 * Faucet Calibration Scoring Script — v2 (Post-Deep-Dive Corrections)
 *
 * 6 calibration products with specs verified against Perplexity deep dives
 * and StarCraft Independent Reviews data. Geometric mean scoring
 * with Q=0.45, D=0.45, P=0.10.
 *
 * KEY CORRECTIONS FROM DEEP DIVES (March 30, 2026):
 * - Waterstone uses Geann on ALL configs (not Flühs on two-handle). Collapsed to one product.
 * - California Faucets splits: Flühs (two-handle) + Kerox (single-handle), not Flühs everywhere.
 *   Still best cartridge sourcing in category (both Tier 1-2). PE acquisition noted.
 * - In2aqua is assembler/specifier, not manufacturer. Splits: Kerox PVD+ (single) + Flühs (two).
 * - Delta outer shell is ZAMAK/zinc on most models. Water flows through PEX, never contacts zinc.
 *   -1 dock: good innovation but not solid construction.
 * - Brizo: not all models use DST. Some use Sedal/unknown. Plastic spray wands.
 * - Kraus: uses some Kerox/Flühs on certain models but won't disclose which. 5yr cartridge warranty.
 *
 * Usage: node score_faucets_calibration.js
 */

const fs = require('fs');
const path = require('path');

// ─── Weights ───────────────────────────────────────────────────────────────────

const WEIGHTS = { quality: 0.45, durability: 0.45, performance: 0.10 };

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

// ─── Calibration Products ──────────────────────────────────────────────────────

const CALIBRATION_PRODUCTS = [
  {
    name: 'California Faucets',
    slug: 'california_faucets',
    target: 94,
    tier: 'Tier 1',

    specs: {
      // Quality
      body_material: 'solid_brass',            // adj: +1
      body_construction: 'cast',               // adj: 0
      cartridge_manufacturer: 'fluhs_kerox',   // adj: +2 (Flühs two-handle Tier 1, Kerox single-handle Tier 2 — both top-tier)
      finish_type_best: 'pvd',                 // adj: +1 (25+ artisan finishes, lifetime PVD guarantee)
      business_model: 'assembler',             // adj: 0 (hand-assembles from selected components)
      source_traceability: 'single_source',    // adj: +1 (Huntington Beach, CA assembly)

      // Durability
      cartridge_cycle_life: 500000,            // adj: +2 (Flühs 500K+ / Kerox 500K)
      warranty_type: 'lifetime_limited',       // adj: +1
      cartridge_warranty_included: true,       // adj: 0 (lifetime on ceramic disc cartridges)
      finish_warranty: 'lifetime_pvd',         // adj: +1
      parts_availability: 'excellent',         // adj: +1

      // Performance
      spray_technology: 'standard',            // adj: 0
      flow_certification: 'watersense',        // adj: +1

      // Certifications (gate)
      upc_certified: true,
      nsf_61_certified: true,
      nsf_372_certified: true,

      material_safety_label: 'Excellent',
    },

    // Quality adj: +1+0+2+1+0+1 = +5
    // Durability adj: +2+1+0+1+1 = +5
    // Performance adj: 0+1 = +1
    spec_adj: { quality: 5, durability: 5, performance: 1, total: 11, capped_total: 8 },

    axis_scores: { quality: 9.5, durability: 9.3, performance: 9.2 },

    notes: [
      'DEEP DIVE CORRECTION: Cartridge splits by handle type — Flühs (two-handle) + Kerox (single-handle)',
      'Both cartridge sources are Tier 1-2 — best combined cartridge sourcing in category',
      'PVD finishes with lifetime guarantee — 25+ artisan finishes',
      'StarCraft: near-perfect score, Best Value NA Luxury 2023 + 2025 back-to-back',
      '"Only a handful of 300+ companies that do everything right" — StarCraft 2025',
      'Assembler: designs + hand-assembles from selected components in Huntington Beach CA',
      'CORPORATE RISK: Recently acquired by American Bath Group (PE-backed)',
      'Customer service rated outstanding by StarCraft, A+ BBB',
      'Non-transferable warranty; void for unauthorized-channel purchases',
    ],

    report_fields: {
      corporate_parent: 'California Faucets — acquired by American Bath Group (PE-backed). Founded 1988 by Fred Silverstein.',
      outlook: 'Stable', // Downgraded from Strong due to PE acquisition
    },
  },

  {
    name: 'In2aqua',
    slug: 'in2aqua',
    target: 92,
    tier: 'Tier 1',

    specs: {
      // Quality
      body_material: 'solid_brass',            // adj: +1
      body_construction: 'cast',               // adj: 0
      cartridge_manufacturer: 'kerox_pvd_plus_fluhs', // adj: +2 (Kerox PVD+ single-handle + Flühs two-handle — both top-tier)
      finish_type_best: 'chrome',              // adj: 0 (chrome, satin nickel, matte black, gold — no PVD finish)
      business_model: 'assembler',             // adj: 0 (CORRECTION: assembler/specifier, not manufacturer)
      source_traceability: 'single_source',    // adj: +1 (Holzgerlingen, Germany + Flühs does casting/machining)

      // Durability
      cartridge_cycle_life: 4000000,           // adj: +2 (PVD+ tested to 4M cycles — 560 years)
      warranty_type: 'lifetime_limited',       // adj: +1 ("best warranty in the industry" per StarCraft — GoPro warranty)
      cartridge_warranty_included: true,       // adj: 0 (no cartridge exclusion in warranty)
      finish_warranty: 'lifetime',             // adj: 0
      parts_availability: 'good',             // adj: 0 (Livermore CA logistics center, same-day dispatch)

      // Performance
      spray_technology: 'standard',            // adj: 0
      flow_certification: 'watersense',        // adj: +1 (all bathroom faucets)

      // Certifications
      upc_certified: true,
      nsf_61_certified: true,
      nsf_372_certified: true,

      material_safety_label: 'Excellent',
    },

    // Quality adj: +1+0+2+0+0+1 = +4
    // Durability adj: +2+1+0+0+0 = +3
    // Performance adj: 0+1 = +1
    spec_adj: { quality: 4, durability: 3, performance: 1, total: 8, capped_total: 8 },

    axis_scores: { quality: 9.2, durability: 9.2, performance: 9.0 },

    notes: [
      'DEEP DIVE CORRECTION: Assembler/specifier, not manufacturer',
      'DEEP DIVE CORRECTION: Cartridge splits — Kerox PVD+ (single-handle) + Flühs (two-handle)',
      'PVD+ = diamond-like carbon coating ON ceramic discs — eliminates lubricant dependency',
      'Independently tested to 4,000,000 cycles (560 years) — no visible wear',
      'M-Lock brass cartridge mounting collar — eliminates plastic collar flex/leak failure mode',
      'StarCraft Best Value European Luxury — 7 consecutive years (2016-2025)',
      'ZAMAK present but only in non-wetted ancillary parts (acceptable)',
      'Shower products sourced from Nikles Inter AG (Swiss) — not in2aqua-manufactured',
      'Small brand — thinner field data than domestic brands',
    ],

    report_fields: {
      corporate_parent: 'In2aqua — independent (Holzgerlingen, Germany)',
      outlook: 'Strong',
    },
  },

  {
    name: 'Waterstone',
    slug: 'waterstone',
    target: 91,
    tier: 'Tier 1',

    specs: {
      // Quality
      body_material: '316_ss',                // adj: +2 (also Eco-Brass on some models)
      body_construction: 'machined_bar_stock', // adj: +1 (monoblock — eliminates casting voids)
      cartridge_manufacturer: 'geann',         // adj: 0 (CORRECTION: Geann on ALL configs, not Flühs on two-handle)
      finish_type_best: 'powder_coat',         // adj: 0 (CORRECTION: NO PVD available — finishes are powder coat/lacquer, described as "semi-durable" by Waterstone themselves)
      business_model: 'manufacturer',          // adj: +1 (true manufacturer — machines own parts in-house)
      source_traceability: 'single_source',    // adj: +1 (Murrieta, CA — 140+ employees)

      // Durability
      cartridge_cycle_life: 500000,            // adj: +2 (Geann 500K+ tested)
      warranty_type: 'lifetime_limited',       // adj: +1 (lifetime functional warranty)
      cartridge_warranty_included: true,       // adj: 0 (explicitly covered)
      finish_warranty: 'limited',              // adj: 0 (decorative finishes are "semi-durable" — NOT lifetime on colored finishes)
      parts_availability: 'good',             // adj: 0 (direct from Waterstone only — not stocked at distributors)

      // Performance
      spray_technology: 'standard',            // adj: 0 (metal spray wands — above average but not proprietary tech)
      flow_certification: 'watersense',        // adj: +1

      // Certifications
      upc_certified: true,
      nsf_61_certified: true,
      nsf_372_certified: true,

      material_safety_label: 'Excellent',
    },

    // Quality adj: +2+1+0+0+1+1 = +5
    // Durability adj: +2+1+0+0+0 = +3
    // Performance adj: 0+1 = +1
    spec_adj: { quality: 5, durability: 3, performance: 1, total: 9, capped_total: 8 },

    axis_scores: { quality: 9.5, durability: 8.7, performance: 9.0 },

    notes: [
      'DEEP DIVE CORRECTION: Uses Geann cartridges on ALL configurations — two-handle AND single-handle',
      'Knowledge file incorrectly listed Flühs for two-handle — StarCraft explicitly confirms Geann throughout',
      'DEEP DIVE CORRECTION: No PVD finish technology — all decorative finishes are powder coat or lacquer',
      'Waterstone itself describes colored finishes as "semi-durable" — finish complaints dominate field failures',
      'Best body material in category: 316 marine-grade SS machined from bar stock (monoblock)',
      'True manufacturer — machines own parts in-house in Murrieta CA',
      'StarCraft: Best Value NA Luxury (alongside California Faucets)',
      'Customer service 4.6/5.0 per StarCraft — BUT Houzz/Reddit/Yelp show recurring service complaints',
      'Metal spray wands (not plastic) — above category standard',
      'Replacement parts only through direct Waterstone technical support, not distributed',
    ],

    report_fields: {
      corporate_parent: 'Waterstone Faucets LLC — founder-owned (Chris Kuran, President/CEO/Owner)',
      outlook: 'Strong',
    },
  },

  {
    name: 'Brizo (DST Cartridge Lines)',
    slug: 'brizo_dst',
    target: 84,
    tier: 'Tier 2',

    specs: {
      // Quality
      body_material: 'solid_brass',            // adj: +1 (brass valve body, some zinc decorative elements)
      body_construction: 'cast',               // adj: 0
      cartridge_manufacturer: 'proprietary_tested', // adj: +1 (DST — Kerox/Maruwa ceramic discs, diamond-coated, Delta-assembled)
      finish_type_best: 'pvd',                 // adj: +1 (Brilliance PVD by Vapor Technologies — "nearly indestructible")
      business_model: 'manufacturer',          // adj: +1 (Masco subsidiary, owns factories)
      source_traceability: 'multi_source',     // adj: 0 (>2/3 China — StarCraft reclassified to Asian category)

      // Durability
      cartridge_cycle_life: 5000000,           // adj: +2 (DST tested to 5M cycles — 700 years)
      warranty_type: 'lifetime_limited',       // adj: +1
      cartridge_warranty_included: true,       // adj: 0 (free replacement to original owner)
      finish_warranty: 'lifetime_pvd',         // adj: +1 (Brilliance PVD guaranteed)
      parts_availability: 'excellent',         // adj: +1 (Masco/Delta infrastructure)

      // Performance
      spray_technology: 'proprietary_advanced', // adj: +1 (MagneDock, ShieldSpray)
      flow_certification: 'watersense',        // adj: +1

      // Certifications
      upc_certified: true,
      nsf_61_certified: true,
      nsf_372_certified: true,

      material_safety_label: 'Good',
    },

    // Quality adj: +1+0+1+1+1+0 = +4
    // Durability adj: +2+1+0+1+1 = +5
    // Performance adj: +1+1 = +2
    spec_adj: { quality: 4, durability: 5, performance: 2, total: 11, capped_total: 8 },

    axis_scores: { quality: 8.0, durability: 8.8, performance: 8.5 },

    notes: [
      'DST cartridge: Kerox + Maruwa ceramic discs, diamond-coated, Delta-assembled in Morgantown KY',
      'NOT all Brizo models use DST — some use Sedal (Chinese-made) or unknown cartridges',
      'StarCraft: explicitly recommends verifying DST before purchasing any Brizo model',
      'Brilliance PVD finish by Vapor Technologies (Masco company) — proven nearly indestructible',
      'Manufacturing >2/3 China — StarCraft moved from NA to Asian luxury category',
      'Plastic spray wands on all kitchen models — below Waterstone (metal wands)',
      'Excellent tech + durability compromised by manufacturing migration and component inconsistency',
    ],

    report_fields: {
      corporate_parent: 'Brizo — division of Delta Faucet Co. (Masco Corporation)',
      outlook: 'Stable',
    },
  },

  {
    name: 'Delta Mid-Range (DST models)',
    slug: 'delta_mid_range',
    target: 69,
    tier: 'Tier 3',

    specs: {
      // Quality
      body_material: 'zamak_shell_pex_waterway', // adj: 0 (CORRECTION: outer shell is ZAMAK/zinc, water flows through PEX tubing never contacts zinc. Valve housing is brass. -1 dock from solid brass, +0 for PEX innovation = net 0)
      body_construction: 'die_cast',           // adj: -1 (zinc shell is die-cast)
      cartridge_manufacturer: 'proprietary_tested', // adj: +1 (DST on -DST models — same 5M cycle tech as Brizo)
      finish_type_best: 'chrome',              // adj: 0 (some Brilliance PVD available but not standard)
      business_model: 'manufacturer',          // adj: +1 (but primarily designer/assembler now — majority Asian OEM)
      source_traceability: 'multi_source',     // adj: 0 (majority China manufacturing)

      // Durability
      cartridge_cycle_life: 5000000,           // adj: +2 (DST on -DST models — same as Brizo)
      warranty_type: 'lifetime_limited',       // adj: +1
      cartridge_warranty_included: true,       // adj: 0 (free replacement to original owner)
      finish_warranty: 'limited',              // adj: 0
      parts_availability: 'excellent',         // adj: +1 (massive distribution network)

      // Performance
      spray_technology: 'standard',            // adj: 0
      flow_certification: 'watersense',        // adj: +1

      // Certifications
      upc_certified: true,
      nsf_61_certified: true,
      nsf_372_certified: true,

      material_safety_label: 'Good',
    },

    // Quality adj: 0-1+1+0+1+0 = +1
    // Durability adj: +2+1+0+0+1 = +4
    // Performance adj: 0+1 = +1
    spec_adj: { quality: 1, durability: 4, performance: 1, total: 6, capped_total: 6 },

    axis_scores: { quality: 6.4, durability: 7.4, performance: 7.0 },

    notes: [
      'DEEP DIVE CORRECTION: Outer shell is ZAMAK/die-cast zinc on most current models',
      'Water flows through PEX tubing — never contacts zinc shell. Valve housing is brass.',
      'Good engineering innovation (PEX waterway) but not solid brass construction — 1-point dock',
      'DST cartridge on -DST models shares same 5M cycle technology as Brizo',
      'NOT all Delta models use DST — Classics/Foundations use legacy ball valve (significantly worse)',
      'Critical: must specify -DST suffix models for Diamond Seal Technology',
      'Shifted from US manufacturer to primarily designer/assembler with Asian OEM fabrication',
      'Plastic spray wands, plastic cartridge housing (passes 500 psi ASME surge test)',
      'Massive parts availability — Home Depot, Lowes, plumbing supply everywhere',
    ],

    report_fields: {
      corporate_parent: 'Delta Faucet Company — division of Masco Corporation',
      outlook: 'Stable',
    },
  },

  {
    name: 'Kraus',
    slug: 'kraus',
    target: 45,
    tier: 'Tier 4',

    specs: {
      // Quality
      body_material: 'solid_brass',            // adj: +1 (claimed and generally confirmed for kitchen models)
      body_construction: 'cast',               // adj: 0
      cartridge_manufacturer: 'unknown_mixed', // adj: -3 (CORRECTION: uses Kerox, Flühs, Sedal, Kuching, Hain-Yo across catalog — but won't disclose which is in which faucet)
      finish_type_best: 'chrome',              // adj: 0
      business_model: 'marketeer',             // adj: -2
      source_traceability: 'unknown',          // adj: -1 (3-4 Chinese factories, none identified by name)

      // Durability
      cartridge_cycle_life: 500000,            // adj: +2 (when Kerox — but unknown which cartridge is installed)
      warranty_type: 'lifetime_limited',       // adj: +1 (headline — but see exclusions)
      cartridge_warranty_included: false,       // adj: -2 (5 years only — "not nearly adequate" per StarCraft)
      finish_warranty: 'limited',              // adj: 0
      parts_availability: 'limited',           // adj: -1 (5-year parts guarantee only)

      // Performance
      spray_technology: 'standard',            // adj: 0
      flow_certification: 'federal_only',      // adj: 0

      // Certifications
      upc_certified: true,
      nsf_61_certified: true,
      nsf_372_certified: true,

      material_safety_label: 'Good',
    },

    // Quality adj: +1+0-3+0-2-1 = -5
    // Durability adj: +2+1-2+0-1 = 0
    // Performance adj: 0+0 = 0
    spec_adj: { quality: -5, durability: 0, performance: 0, total: -5, capped_total: -5 },

    axis_scores: { quality: 3.8, durability: 5.0, performance: 5.5 },

    notes: [
      'DEEP DIVE CORRECTION: Actually uses some Kerox and Flühs cartridges on certain models',
      'Also uses Sedal (Chinese-made), Kuching, Hain-Yo — inconsistent across catalog',
      'Kraus does NOT disclose which cartridge is in which faucet — consumer cannot verify',
      'StarCraft: "We cannot guarantee that every faucet contains a good-quality ceramic cartridge"',
      '5-year cartridge warranty — "not nearly adequate" per StarCraft',
      '5-year parts availability guarantee only — long-term serviceability risk',
      'Marketeer importing from 3-4 identified Chinese factories',
      'No handles or base plates warranty at all (1-year on spray assemblies)',
      'Certified and legal — passes gate. Above contraband tier but bottom of legitimate market.',
    ],

    report_fields: {
      corporate_parent: 'Kraus USA Inc. — importer/marketeer (Port Washington, NY)',
      outlook: 'Conditional',
    },
  },
];

// ─── Scoring ───────────────────────────────────────────────────────────────────

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
  console.log('\n' + '='.repeat(60));
  console.log('FAUCET CALIBRATION SCORING RUN — v2 (Post-Deep-Dive)');
  console.log('='.repeat(60));
  console.log('Weights: Q=0.45, D=0.45, P=0.10');
  console.log('Method: Geometric mean, no axis stretch (v1.0)');
  console.log('');
  console.log('CORRECTIONS FROM DEEP DIVES:');
  console.log('  - Waterstone: Geann on ALL configs (not Flühs). Collapsed to 1 product.');
  console.log('  - California Faucets: Flühs + Kerox split (not Flühs everywhere). PE acquisition.');
  console.log('  - In2aqua: Assembler/specifier (not manufacturer). Kerox PVD+ + Flühs split.');
  console.log('  - Delta: ZAMAK shell + PEX waterway (not solid brass). -1 dock.');
  console.log('');

  let allPass = true;
  for (const product of CALIBRATION_PRODUCTS) {
    const result = scoreProduct(product);
    const pass = result.delta === 0;
    const flag = pass ? '✓' : Math.abs(result.delta) <= 1 ? '~' : '✗';
    if (!pass) allPass = false;
    console.log(`${flag} ${product.name.padEnd(32)} | Q:${product.axis_scores.quality} D:${product.axis_scores.durability} P:${product.axis_scores.performance} | ${result.display} (target ${product.target}, delta ${result.delta >= 0 ? '+' : ''}${result.delta}) | ${result.label}`);
  }

  console.log('');
  console.log(allPass ? '✓ ALL TARGETS HIT EXACTLY' : '~ See deltas above — adjust axis scores');
  console.log('');
}

main();
