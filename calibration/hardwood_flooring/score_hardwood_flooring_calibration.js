#!/usr/bin/env node
/**
 * Hardwood Flooring Calibration Scoring Script — v1 (Pre-Deep Dive)
 *
 * Scope: Solid and Engineered Hardwood Flooring (factory-finished)
 * 8 calibration products (4 solid, 4 engineered), all targets must hit exactly (delta = 0)
 * White Oak normalized across all products for apples-to-apples comparison.
 *
 * Usage: node score_hardwood_flooring_calibration.js
 * Created: April 1, 2026
 */

const fs = require('fs');
const path = require('path');

// ─── Weights ───────────────────────────────────────────────────────────────────

const WEIGHTS = { quality: 0.35, durability: 0.35, performance: 0.30 };

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
    name: 'Carlisle Wide Plank White Oak (Solid, 3/4")',
    slug: 'carlisle_solid_white_oak',
    sub_type: 'solid',
    target: 94,
    tier: 'Tier 1',

    specs: {
      // Quality
      sub_type: 'solid_3_4',                              // adj: 0
      veneer_thickness_mm: 'N/A',                         // solid — field omitted
      veneer_cut_method: 'N/A',                           // solid — field omitted
      core_construction: 'N/A',                           // solid — field omitted
      solid_thickness_inches: 'three_quarter',            // adj: +1
      species_janka_hardness: 1360,                       // adj: 0 (1300-1799)
      species_grade: 'clear_select_and_better',           // adj: +1
      finish_system: 'uv_cured_aluminum_oxide_premium',   // adj: +2
      milling_precision: 'precision_tight_tolerance',     // adj: +1
      source_traceability: 'single_source_us_canada',     // adj: +1

      // Performance
      dimensional_stability: 'good_solid_kiln_dried',     // adj: 0
      refinishing_potential: 'unlimited_solid_3_4',        // adj: +2
      moisture_resistance: 'standard_solid',              // adj: -1
      installation_versatility: 'nail_staple_only',       // adj: -1
      finish_scratch_resistance: 'excellent',             // adj: +1
      radiant_heat_compatibility: 'not_recommended',      // adj: -1

      // Durability
      finish_warranty_years: 35,                          // adj: +2 (est. premium finish)
      structural_warranty_years: 'lifetime',              // adj: +2
      delamination_risk: 'N/A',                           // solid — no delamination
      cupping_crowning_resistance: 'good_solid_kiln_dried_acclimated', // adj: 0
      nwfa_nofma_certified: 'nwfa_member',                // adj: 0 (member, not certified — need to confirm)
      formaldehyde_compliance: 'carb_phase_2_certified_greenguard', // adj: +1 (solid wood = inherently low VOC)
      warranty_claim_process: 'dealer_supported',         // adj: +1
    },

    // Quality adj: 0+N/A+N/A+N/A+1+0+1+2+1+1 = +6
    // Performance adj: 0+2-1-1+1-1 = 0
    // Durability adj: +2+2+N/A+0+0+1+1 = +6
    spec_adj: { quality: 6, performance: 0, durability: 6, total: 12, capped_total: 8 },

    axis_scores: { quality: 9.6, durability: 9.3, performance: 9.4 },

    notes: [
      'Carlisle Wide Plank: Heritage custom manufacturer since 1966 — Stoddard, NH',
      'Single-source US manufacturing with Appalachian white oak',
      'Select & Better grade — fewest natural defects',
      'Wide plank 5" to 10"+ widths — artisanal quality standard',
      'Precision kiln-dried to 6-8% MC target',
      '3/4" solid = unlimited refinishing potential over 50-100 year lifespan',
      'STRENGTH: Artisanal benchmark — "Rolls Royce of solid hardwood"',
      'STRENGTH: Single-source traceability, Appalachian sourcing',
      'WEAKNESS: Wide plank solid more susceptible to dimensional movement than engineered',
      'WEAKNESS: Not recommended for radiant heat, basements, or concrete subfloors',
      'WEAKNESS: Premium pricing $10-25/sqft — 3-5x volume solid',
      'WEAKNESS: Long lead times for custom orders',
    ],

    report_fields: {
      corporate_parent: 'Carlisle Wide Plank Floors — independent, privately held. Stoddard, NH.',
      outlook: 'Stable',
      manufacturing: 'Stoddard, New Hampshire — single-source US manufacturing since 1966.',
      platform_sharing: 'None — independent manufacturer, no badge engineering.',
    },
  },

  {
    name: 'Mirage Sweet Memories White Oak (Engineered, 5/8")',
    slug: 'mirage_sweet_memories',
    sub_type: 'engineered',
    target: 91,
    tier: 'Tier 1',

    specs: {
      // Quality
      sub_type: 'engineered_thick_veneer',                // adj: 0
      veneer_thickness_mm: 3.5,                           // adj: +1 (3.0-3.9)
      veneer_cut_method: 'sawn',                          // adj: +1
      core_construction: 'multi_ply_baltic_birch',        // adj: +2
      solid_thickness_inches: 'N/A',                      // engineered — field omitted
      species_janka_hardness: 1360,                       // adj: 0 (White Oak)
      species_grade: 'select_natural',                    // adj: 0 (Sweet Memories = natural character)
      finish_system: 'uv_cured_aluminum_oxide_premium',   // adj: +2 (NanoLinx = premium)
      milling_precision: 'precision_tight_tolerance',     // adj: +1
      source_traceability: 'single_source_us_canada',     // adj: +1 (Québec)

      // Performance
      dimensional_stability: 'excellent_multi_ply_cross_grain', // adj: +1
      refinishing_potential: 'one_to_two_sandings',       // adj: 0 (3.5mm = 1-2 proper sandings)
      moisture_resistance: 'standard_engineered',         // adj: 0
      installation_versatility: 'all_methods_all_substrates', // adj: +1
      finish_scratch_resistance: 'excellent',             // adj: +1 (NanoLinx)
      radiant_heat_compatibility: 'certified_compatible', // adj: +1

      // Durability
      finish_warranty_years: 35,                          // adj: +2
      structural_warranty_years: 'lifetime',              // adj: +2
      delamination_risk: 'no_documented_patterns',        // adj: +1
      cupping_crowning_resistance: 'excellent_engineered_multi_ply', // adj: +1
      nwfa_nofma_certified: 'nwfa_member',                // adj: 0
      formaldehyde_compliance: 'carb_phase_2_certified_greenguard', // adj: +1
      warranty_claim_process: 'dealer_supported',         // adj: +1
    },

    // Quality adj: 0+1+1+2+N/A+0+0+2+1+1 = +8 (capped at 8)
    // Performance adj: +1+0+0+1+1+1 = +4
    // Durability adj: +2+2+1+1+0+1+1 = +8 (capped at 8)
    spec_adj: { quality: 8, performance: 4, durability: 8, total: 20, capped_total: 8 },

    axis_scores: { quality: 9.3, durability: 9.0, performance: 9.1 },

    notes: [
      'Mirage: Québec precision manufacturer — gold standard for factory-finished engineered',
      '3.5mm sawn white oak veneer on multi-ply Baltic birch core',
      'NanoLinx finish technology — 7+ coats UV-cured aluminum oxide with nano-particle enhancement',
      '35-year finish warranty, lifetime structural warranty',
      'Greenguard Gold certified, CARB Phase 2 compliant',
      'STRENGTH: Tightest milling tolerance in category per installer consensus',
      'STRENGTH: Baltic birch core = gold standard for dimensional stability',
      'STRENGTH: Certified for radiant heat, compatible with all subfloor types',
      'WEAKNESS: 3.5mm veneer limits refinishing to 1-2 proper sandings (not unlimited like 3/4" solid)',
      'WEAKNESS: Premium pricing $8-14/sqft — 2-3x volume engineered',
      'WEAKNESS: Sweet Memories wire-brushed texture reduces effective sanding depth',
    ],

    report_fields: {
      corporate_parent: 'Boa-Franc Inc. (Mirage brand) — independent, privately held. St-Georges, Québec, Canada.',
      outlook: 'Strong',
      manufacturing: 'St-Georges, Québec, Canada — single-source Canadian manufacturing.',
      platform_sharing: 'None — independent manufacturer, no badge engineering.',
    },
  },

  {
    name: 'Mercier Design+ White Oak (Engineered, 5/8")',
    slug: 'mercier_design_plus',
    sub_type: 'engineered',
    target: 82,
    tier: 'Tier 2',

    specs: {
      // Quality
      sub_type: 'engineered_thick_veneer',
      veneer_thickness_mm: 3.0,                           // adj: +1 (3.0-3.9)
      veneer_cut_method: 'sawn',                          // adj: +1
      core_construction: 'multi_ply_hardwood',            // adj: +1
      solid_thickness_inches: 'N/A',
      species_janka_hardness: 1360,                       // adj: 0
      species_grade: 'select_natural',                    // adj: 0
      finish_system: 'uv_cured_aluminum_oxide_premium',   // adj: +2 (Generations finish)
      milling_precision: 'precision_tight_tolerance',     // adj: +1
      source_traceability: 'single_source_us_canada',     // adj: +1 (Québec)

      // Performance
      dimensional_stability: 'excellent_multi_ply_cross_grain', // adj: +1
      refinishing_potential: 'one_to_two_sandings',       // adj: 0 (3mm = 1-2 sandings)
      moisture_resistance: 'standard_engineered',         // adj: 0
      installation_versatility: 'all_methods_all_substrates', // adj: +1
      finish_scratch_resistance: 'good',                  // adj: 0
      radiant_heat_compatibility: 'certified_compatible', // adj: +1

      // Durability
      finish_warranty_years: 35,                          // adj: +2
      structural_warranty_years: 'lifetime',              // adj: +2
      delamination_risk: 'no_documented_patterns',        // adj: +1
      cupping_crowning_resistance: 'excellent_engineered_multi_ply', // adj: +1
      nwfa_nofma_certified: 'nwfa_member',                // adj: 0
      formaldehyde_compliance: 'carb_phase_2_certified_greenguard', // adj: +1
      warranty_claim_process: 'dealer_supported',         // adj: +1
    },

    spec_adj: { quality: 7, performance: 3, durability: 8, total: 18, capped_total: 8 },

    axis_scores: { quality: 8.4, durability: 8.1, performance: 8.1 },

    notes: [
      'Mercier: Québec manufacturer, 70+ years — direct Mirage competitor',
      '3mm sawn white oak veneer on multi-ply hardwood core',
      'Generations finish with Greenguard Gold certification',
      'Strong installer consensus — slightly below Mirage on milling precision',
      'Design+ is premium line with wider style options',
      'STRENGTH: 70+ year manufacturing heritage, strong warranty',
      'STRENGTH: FSC-certified options available',
      'WEAKNESS: Core is multi-ply hardwood, not Baltic birch — slightly less premium substrate',
      'WEAKNESS: Finish scratch resistance rated "good" vs Mirage "excellent" per installer feedback',
    ],

    report_fields: {
      corporate_parent: 'Mercier Wood Flooring — independent, privately held. Montmagny, Québec, Canada.',
      outlook: 'Strong',
      manufacturing: 'Montmagny, Québec, Canada.',
      platform_sharing: 'None — independent manufacturer.',
    },
  },

  {
    name: 'Lauzon Designer White Oak (Engineered, 5/8")',
    slug: 'lauzon_designer',
    sub_type: 'engineered',
    target: 79,
    tier: 'Tier 2',

    specs: {
      // Quality
      sub_type: 'engineered_thick_veneer',
      veneer_thickness_mm: 3.0,                           // adj: +1
      veneer_cut_method: 'sawn',                          // adj: +1
      core_construction: 'multi_ply_hardwood',            // adj: +1
      solid_thickness_inches: 'N/A',
      species_janka_hardness: 1360,                       // adj: 0
      species_grade: 'select_natural',                    // adj: 0
      finish_system: 'uv_cured_aluminum_oxide_standard',  // adj: +1 (Titanium — strong but not NanoLinx-level)
      milling_precision: 'precision_tight_tolerance',     // adj: +1
      source_traceability: 'single_source_us_canada',     // adj: +1 (Québec)

      // Performance
      dimensional_stability: 'excellent_multi_ply_cross_grain', // adj: +1
      refinishing_potential: 'one_to_two_sandings',       // adj: 0
      moisture_resistance: 'standard_engineered',         // adj: 0
      installation_versatility: 'all_methods_all_substrates', // adj: +1
      finish_scratch_resistance: 'good',                  // adj: 0
      radiant_heat_compatibility: 'certified_compatible', // adj: +1

      // Durability
      finish_warranty_years: 35,                          // adj: +2
      structural_warranty_years: 'lifetime',              // adj: +2
      delamination_risk: 'no_documented_patterns',        // adj: +1
      cupping_crowning_resistance: 'excellent_engineered_multi_ply', // adj: +1
      nwfa_nofma_certified: 'nwfa_member',                // adj: 0
      formaldehyde_compliance: 'carb_phase_2_certified_greenguard', // adj: +1
      warranty_claim_process: 'dealer_supported',         // adj: +1
    },

    spec_adj: { quality: 6, performance: 3, durability: 8, total: 17, capped_total: 8 },

    axis_scores: { quality: 8.1, durability: 7.8, performance: 7.9 },

    notes: [
      'Lauzon: Québec manufacturer — third in the Canadian trio (Mirage > Mercier > Lauzon)',
      '3mm sawn white oak veneer on multi-ply hardwood core',
      'Pure Genius air-purifying technology — TiO2 photocatalyst breaks down ambient VOCs',
      'Titanium finish — aluminum oxide UV-cured but rated below NanoLinx on scratch resistance',
      'STRENGTH: Pure Genius is genuinely differentiated technology (air purification)',
      'STRENGTH: Strong warranty infrastructure',
      'WEAKNESS: Narrower distribution than Mirage/Mercier',
      'WEAKNESS: Finish ranked third of the three Canadian brands by installers',
    ],

    report_fields: {
      corporate_parent: 'Lauzon Distinctive Hardwood Flooring — independent, privately held. Papineauville, Québec, Canada.',
      outlook: 'Stable',
      manufacturing: 'Papineauville, Québec, Canada.',
      platform_sharing: 'None — independent manufacturer.',
    },
  },

  {
    name: 'Somerset Character White Oak (Solid, 3/4")',
    slug: 'somerset_character',
    sub_type: 'solid',
    target: 67,
    tier: 'Tier 3',

    specs: {
      // Quality
      sub_type: 'solid_3_4',                              // adj: 0
      veneer_thickness_mm: 'N/A',
      veneer_cut_method: 'N/A',
      core_construction: 'N/A',
      solid_thickness_inches: 'three_quarter',            // adj: +1
      species_janka_hardness: 1360,                       // adj: 0
      species_grade: 'number_1_common_character',         // adj: 0 (Character = #1 Common)
      finish_system: 'uv_cured_aluminum_oxide_standard',  // adj: +1 (AlumaPLUS)
      milling_precision: 'standard',                      // adj: 0
      source_traceability: 'single_source_us_canada',     // adj: +1 (Somerset, KY)

      // Performance
      dimensional_stability: 'good_solid_kiln_dried',     // adj: 0
      refinishing_potential: 'unlimited_solid_3_4',        // adj: +2
      moisture_resistance: 'standard_solid',              // adj: -1
      installation_versatility: 'nail_staple_only',       // adj: -1
      finish_scratch_resistance: 'good',                  // adj: 0
      radiant_heat_compatibility: 'not_recommended',      // adj: -1

      // Durability
      finish_warranty_years: 25,                          // adj: +1 (25-34)
      structural_warranty_years: 25,                      // adj: +1
      delamination_risk: 'N/A',
      cupping_crowning_resistance: 'good_solid_kiln_dried_acclimated', // adj: 0
      nwfa_nofma_certified: 'certified',                  // adj: +1
      formaldehyde_compliance: 'carb_phase_2_compliant',  // adj: 0 (solid = inherently compliant)
      warranty_claim_process: 'standard_manufacturer',    // adj: 0
    },

    spec_adj: { quality: 3, performance: -1, durability: 3, total: 5, capped_total: 5 },

    axis_scores: { quality: 6.7, durability: 6.8, performance: 6.6 },

    notes: [
      'Somerset: Somerset, KY US manufacturer — Appalachian hardwood',
      'NWFA/NOFMA certified — independently inspected manufacturing standards',
      'Character grade = #1 Common equivalent — moderate natural marks',
      'AlumaPLUS aluminum oxide finish — solid standard finish',
      'Good value mid-tier solid hardwood — $4-7/sqft',
      'STRENGTH: NWFA/NOFMA certified — quality signal',
      'STRENGTH: Single-source US manufacturing, Appalachian sourcing',
      'STRENGTH: 3/4" solid = unlimited refinishing potential',
      'WEAKNESS: Standard milling — not precision-grade like Carlisle',
      'WEAKNESS: Character grade = more natural variation (some buyers prefer this)',
      'WEAKNESS: Not radiant heat compatible, not recommended for basements',
    ],

    report_fields: {
      corporate_parent: 'Somerset Hardwood Flooring — independent, privately held. Somerset, KY.',
      outlook: 'Stable',
      manufacturing: 'Somerset, Kentucky — single-source US manufacturing.',
      platform_sharing: 'None — independent manufacturer.',
    },
  },

  {
    name: 'Shaw Repel White Oak (Engineered, 1/2")',
    slug: 'shaw_repel',
    sub_type: 'engineered',
    target: 64,
    tier: 'Tier 3',

    specs: {
      // Quality
      sub_type: 'engineered_thick_veneer',                // adj: 0 (2mm is borderline)
      veneer_thickness_mm: 2.0,                           // adj: 0 (2.0-2.9)
      veneer_cut_method: 'sawn',                          // adj: +1
      core_construction: 'plywood_standard',              // adj: 0
      solid_thickness_inches: 'N/A',
      species_janka_hardness: 1360,                       // adj: 0
      species_grade: 'select_natural',                    // adj: 0
      finish_system: 'uv_cured_aluminum_oxide_standard',  // adj: +1 (ScufResist Platinum)
      milling_precision: 'standard',                      // adj: 0
      source_traceability: 'multi_source_identified',     // adj: 0

      // Performance
      dimensional_stability: 'excellent_multi_ply_cross_grain', // adj: +1
      refinishing_potential: 'screen_recoat_only',        // adj: -1 (2mm = screen/recoat, not full sanding)
      moisture_resistance: 'enhanced_water_resistant',    // adj: +1 (Repel technology)
      installation_versatility: 'all_methods_all_substrates', // adj: +1
      finish_scratch_resistance: 'good',                  // adj: 0
      radiant_heat_compatibility: 'compatible_with_conditions', // adj: 0

      // Durability
      finish_warranty_years: 25,                          // adj: +1
      structural_warranty_years: 'lifetime',              // adj: +2
      delamination_risk: 'rare_isolated',                 // adj: 0
      cupping_crowning_resistance: 'excellent_engineered_multi_ply', // adj: +1
      nwfa_nofma_certified: 'nwfa_member',                // adj: 0
      formaldehyde_compliance: 'carb_phase_2_certified_greenguard', // adj: +1
      warranty_claim_process: 'dealer_supported',         // adj: +1
    },

    spec_adj: { quality: 2, performance: 2, durability: 6, total: 10, capped_total: 8 },

    axis_scores: { quality: 6.3, durability: 6.6, performance: 6.3 },

    notes: [
      'Shaw Industries (Berkshire Hathaway subsidiary) — massive distribution and warranty infrastructure',
      '2mm sawn white oak veneer — limits refinishing to screen and recoat only',
      'Repel water-resistant technology — edge and surface moisture treatment',
      'ScufResist Platinum aluminum oxide finish — competent standard grade',
      '1/2" total thickness — standard engineered construction',
      'STRENGTH: Shaw distribution — available at every flooring retailer in the US',
      'STRENGTH: Repel water-resistant technology is genuine engineering, not just marketing',
      'STRENGTH: Lifetime structural warranty with Berkshire Hathaway backing',
      'WEAKNESS: 2mm veneer is the threshold — not premium, limits longevity',
      'WEAKNESS: Standard milling — adequate but not precision-grade',
      'WEAKNESS: Shaw may be prioritizing LVP (luxury vinyl plank) over hardwood investment',
    ],

    report_fields: {
      corporate_parent: 'Shaw Industries Group, Inc. — subsidiary of Berkshire Hathaway Inc.',
      outlook: 'Strong',
      manufacturing: 'Dalton, GA and multiple US facilities.',
      platform_sharing: 'Shaw/Anderson Tuftex share platform. Report must disclose.',
    },
  },

  {
    name: 'Bruce Dundee White Oak (Solid, 3/4")',
    slug: 'bruce_dundee',
    sub_type: 'solid',
    target: 52,
    tier: 'Tier 4',

    specs: {
      // Quality
      sub_type: 'solid_3_4',                              // adj: 0
      veneer_thickness_mm: 'N/A',
      veneer_cut_method: 'N/A',
      core_construction: 'N/A',
      solid_thickness_inches: 'three_quarter',            // adj: +1
      species_janka_hardness: 1360,                       // adj: 0
      species_grade: 'number_1_common_character',         // adj: 0
      finish_system: 'uv_cured_aluminum_oxide_standard',  // adj: +1 (Dura-Shield)
      milling_precision: 'loose_tolerance_filler_needed', // adj: -1
      source_traceability: 'multi_source_identified',     // adj: 0

      // Performance
      dimensional_stability: 'good_solid_kiln_dried',     // adj: 0
      refinishing_potential: 'unlimited_solid_3_4',        // adj: +2
      moisture_resistance: 'standard_solid',              // adj: -1
      installation_versatility: 'nail_staple_only',       // adj: -1
      finish_scratch_resistance: 'fair',                  // adj: -1
      radiant_heat_compatibility: 'not_recommended',      // adj: -1

      // Durability
      finish_warranty_years: 15,                          // adj: 0 (15-24)
      structural_warranty_years: 25,                      // adj: +1
      delamination_risk: 'N/A',
      cupping_crowning_resistance: 'good_solid_kiln_dried_acclimated', // adj: 0
      nwfa_nofma_certified: 'nwfa_member',                // adj: 0
      formaldehyde_compliance: 'carb_phase_2_compliant',  // adj: 0
      warranty_claim_process: 'standard_manufacturer',    // adj: 0
    },

    spec_adj: { quality: 1, performance: -2, durability: 1, total: 0, capped_total: 0 },

    axis_scores: { quality: 5.2, durability: 5.4, performance: 5.0 },

    notes: [
      'Bruce (AHF Products): Legacy brand — widest distribution for US hardwood flooring',
      'Dundee = volume leader for builder-grade 3/4" solid white oak',
      'Dura-Shield aluminum oxide finish — standard, not premium',
      '2-1/4" to 3-1/4" strip (traditional narrow width)',
      'STRENGTH: 3/4" solid = unlimited refinishing — the wood itself is fine',
      'STRENGTH: Widest availability — every home center, every distributor',
      'STRENGTH: Commodity pricing $3-5/sqft',
      'WEAKNESS: Milling precision is the primary complaint — loose tolerance, requires more filler',
      'WEAKNESS: Finish quality declining per installer consensus',
      'WEAKNESS: AHF Products post-Armstrong reorganization — quality perception declining',
      'WEAKNESS: Basic 15-year finish warranty vs 35-year premium',
      'Represents the builder-grade floor that every buyer should understand',
    ],

    report_fields: {
      corporate_parent: 'AHF Products (formerly Armstrong Flooring). Brands: Bruce, Armstrong, Hartco.',
      outlook: 'Uncertain — post-bankruptcy reorganization',
      manufacturing: 'Beverly, WV and Somerset, KY (multiple US plants).',
      platform_sharing: 'Bruce/Armstrong/Hartco share AHF Products manufacturing platform. Report must disclose.',
    },
  },

  {
    name: 'Bruce Hydropel White Oak (Engineered, 3/8")',
    slug: 'bruce_hydropel',
    sub_type: 'engineered',
    target: 46,
    tier: 'Tier 4',

    specs: {
      // Quality
      sub_type: 'engineered_thin_veneer',                 // adj: -1
      veneer_thickness_mm: 1.2,                           // adj: -2 (<2.0)
      veneer_cut_method: 'rotary_peeled',                 // adj: -1
      core_construction: 'hdf_core',                      // adj: 0
      solid_thickness_inches: 'N/A',
      species_janka_hardness: 1360,                       // adj: 0
      species_grade: 'select_natural',                    // adj: 0
      finish_system: 'uv_cured_urethane',                 // adj: 0
      milling_precision: 'standard',                      // adj: 0 (click-lock is more consistent)
      source_traceability: 'multi_source_identified',     // adj: 0

      // Performance
      dimensional_stability: 'excellent_multi_ply_cross_grain', // adj: +1 (HDF is stable)
      refinishing_potential: 'not_refinishable',          // adj: -2 (1.2mm = not refinishable)
      moisture_resistance: 'enhanced_water_resistant',    // adj: +1 (Hydropel technology)
      installation_versatility: 'all_methods_all_substrates', // adj: +1 (click-lock versatile)
      finish_scratch_resistance: 'fair',                  // adj: -1
      radiant_heat_compatibility: 'compatible_with_conditions', // adj: 0

      // Durability
      finish_warranty_years: 15,                          // adj: 0 (15-24)
      structural_warranty_years: 25,                      // adj: +1
      delamination_risk: 'rare_isolated',                 // adj: 0
      cupping_crowning_resistance: 'excellent_engineered_multi_ply', // adj: +1 (HDF stable)
      nwfa_nofma_certified: 'nwfa_member',                // adj: 0
      formaldehyde_compliance: 'carb_phase_2_compliant',  // adj: 0
      warranty_claim_process: 'standard_manufacturer',    // adj: 0
    },

    // Quality adj: -1-2-1+0+N/A+0+0+0+0+0 = -4
    // Performance adj: +1-2+1+1-1+0 = 0
    // Durability adj: 0+1+0+1+0+0+0 = +2
    spec_adj: { quality: -4, performance: 0, durability: 2, total: -2, capped_total: -2 },

    axis_scores: { quality: 4.4, durability: 4.9, performance: 4.5 },

    notes: [
      'Bruce Hydropel (AHF Products): Water-resistant engineered technology on thin-veneer product',
      '1.2mm rotary-peeled veneer — NOT refinishable, replace-when-worn product',
      '3/8" total thickness — click-lock floating floor',
      'HDF core — more moisture-vulnerable than plywood but uniform for click-lock',
      'STRENGTH: Hydropel water resistance technology',
      'STRENGTH: Click-lock installation = DIY-friendly, any subfloor',
      'STRENGTH: Commodity pricing $3-5/sqft',
      'WEAKNESS: 1.2mm rotary veneer is the quality cliff — at this thickness, refinishing is impossible',
      'WEAKNESS: Rotary-peeled grain pattern looks manufactured, not natural',
      'WEAKNESS: Effectively a "real wood laminate" — hardwood veneer on HDF, replace when worn',
      'WEAKNESS: AHF Products post-bankruptcy concerns',
      'This is the floor below which "it\'s not really hardwood anymore" per professional consensus',
    ],

    report_fields: {
      corporate_parent: 'AHF Products (formerly Armstrong Flooring). Brands: Bruce, Armstrong, Hartco.',
      outlook: 'Uncertain — post-bankruptcy reorganization',
      manufacturing: 'Multiple AHF facilities — confirm specific plant for Hydropel.',
      platform_sharing: 'Bruce/Armstrong/Hartco share AHF Products manufacturing platform. Report must disclose.',
    },
  },
];

// ─── Score All Products ────────────────────────────────────────────────────────

console.log('='.repeat(80));
console.log('HARDWOOD FLOORING CALIBRATION — v1 (Pre-Deep Dive)');
console.log('Scope: Solid & Engineered Hardwood Flooring (Factory-Finished, White Oak Normalized)');
console.log(`Weights: Q=${WEIGHTS.quality}, D=${WEIGHTS.durability}, P=${WEIGHTS.performance}`);
console.log('='.repeat(80));
console.log();

let allHit = true;
const results = [];

for (const p of CALIBRATION_PRODUCTS) {
  const { quality, durability, performance } = p.axis_scores;
  const overall = geoMean(quality, durability, performance);
  const display = Math.round(overall * 10);
  const delta = display - p.target;
  const label = getLabel(display);

  if (delta !== 0) allHit = false;

  results.push({
    name: p.name,
    target: p.target,
    display,
    delta,
    quality,
    durability,
    performance,
    raw: overall,
    label,
    tier: p.tier,
    sub_type: p.sub_type,
  });

  console.log(`${p.name}`);
  console.log(`  Type: ${p.sub_type.toUpperCase()} | Tier: ${p.tier} | Target: ${p.target} | Score: ${display} | Delta: ${delta >= 0 ? '+' : ''}${delta}`);
  console.log(`  Axes: Q=${quality} D=${durability} P=${performance} | Raw: ${overall.toFixed(4)}`);
  console.log(`  Label: ${label}`);
  console.log(`  Spec adj: Q=${p.spec_adj.quality}, P=${p.spec_adj.performance}, D=${p.spec_adj.durability} (total=${p.spec_adj.total}, capped=${p.spec_adj.capped_total})`);
  console.log();
}

// Summary
console.log('='.repeat(80));
console.log('CALIBRATION SUMMARY');
console.log('='.repeat(80));
console.log();
console.log('Product'.padEnd(55) + 'Type'.padEnd(12) + 'Target'.padEnd(8) + 'Score'.padEnd(8) + 'Delta'.padEnd(8) + 'Status');
console.log('-'.repeat(99));
for (const r of results) {
  const status = r.delta === 0 ? '✅' : `❌ (${r.delta >= 0 ? '+' : ''}${r.delta})`;
  console.log(r.name.padEnd(55) + r.sub_type.padEnd(12) + String(r.target).padEnd(8) + String(r.display).padEnd(8) + String(r.delta).padEnd(8) + status);
}
console.log();

if (allHit) {
  console.log('✅ ALL TARGETS HIT EXACTLY — CALIBRATION LOCKED');
} else {
  console.log('❌ TARGETS NOT MET — ADJUST AXIS SCORES');
}

// ─── Output calibration config ─────────────────────────────────────────────────

const configOutput = {
  category: 'hardwood_flooring',
  version: '1.0',
  axis_weights: WEIGHTS,
  composite_method: 'geometric_mean',
  calibration_products: CALIBRATION_PRODUCTS.map(p => ({
    name: p.name,
    slug: p.slug,
    sub_type: p.sub_type,
    target: p.target,
    tier: p.tier,
    axis_scores: p.axis_scores,
  })),
};

const configPath = path.join(__dirname, 'config.json');
fs.writeFileSync(configPath, JSON.stringify(configOutput, null, 2));
console.log(`\nCalibration config written to: ${configPath}`);
