/**
 * THE RESIDENTIALIST — Deterministic Scorer
 * Computes 5 reformed subscores from Bot 2's classification output using
 * lookup tables and formulas instead of LLM judgment.
 *
 * Reformed subscores:
 *   1A component_quality      — Deterministic components (60%) + tier classification (40%)
 *   1B manufacturing_quality  — Complaint Severity Framework
 *   1C professional_consensus — Source-Weighted Formula
 *   2B materials_durability   — Fixed Adjustment Menu
 *   2C repairability          — Component Scoring
 *
 * Unchanged subscores (still scored by Bot 2):
 *   2A frame_longevity, 3A thermal, 3B structural, 3C air_water
 *
 * NON-DISCLOSURE POLICY (March 14, 2026):
 * Products are NEVER penalized for not disclosing component specifications.
 * When a component is "unknown", the scorer uses class-conditional priors —
 * the typical/expected component for that material class — instead of a flat
 * midpoint penalty. This is based on the Bayesian approach: P(component | material_class)
 * gives the best unbiased estimate. The transparency report (Rule 15 in Bot 2)
 * documents what was and wasn't disclosed for the reader.
 *
 * Research basis: Bayesian class-conditional imputation, S&P Global ESG two-track
 * scoring model, Grossman-Milgrom disclosure theory, Manski minimax-regret bounds.
 *
 * MATERIAL CLASS RECOGNITION:
 * getMaterialPriorTier() maps material strings to prior tiers. Recognized:
 *   - vinyl, pvc → vinyl tier
 *   - fiberglass, fibreglass, pultrude, duracast → fiberglass tier
 *   - composite, fibrex → fiberglass tier (treated as mid-high)
 *   - wood, clad, aluminum → wood_clad tier
 *   - Unknown/unrecognized → vinyl tier (most conservative)
 * If adding a new material class, update BOTH this file AND bot_orchestrator_v3.js
 * (MATERIAL_CEILINGS table + extractMaterialClass keywords).
 *
 * CHANGE LOG:
 *   March 14, 2026: Added 'duracast' to getMaterialPriorTier (fiberglass tier)
 *   March 13, 2026: Class-conditional priors replaced flat 5.0 "unknown" penalties
 *   March 13, 2026: Removed SEAL_UNKNOWN from materials durability adjustments
 */

// ─── COMPONENT QUALITY (1A) — Deterministic Components + Tier Classification ─
// 60% deterministic from component lookups, 40% from a categorical quality tier.
// Bot 2 provides the component identifications and a quality_tier classification.
// The deterministic scorer computes the final score.
//
// "unknown" values use CLASS-CONDITIONAL PRIORS instead of a flat 5.0 penalty.
// The prior is the typical component for the product's material class.
// This prevents penalizing manufacturers for non-disclosure while still
// rewarding manufacturers who prove they use premium components.

const SPACER_SCORES = {
  one_piece_stainless: 10,
  warm_edge_foam: 8,
  warm_edge_hybrid: 8,
  multi_piece_stainless: 7,
  four_piece_aluminum: 4,
  // "unknown" is no longer here — handled by class-conditional priors below
};

const BALANCE_SCORES = {
  constant_force: 10,  // AAMA Class 5
  class_4: 9,
  coil_spring: 8,      // Class 3
  block_and_tackle: 7, // Class 2
  class_1: 5,
  // "unknown" is no longer here — handled by class-conditional priors below
};

const WEATHERSTRIP_ATTACHMENT_SCORES = {
  channeled: 10,
  integrated: 10,
  mechanically_fastened: 8,
  adhesive: 6,
  // "unknown" is no longer here — handled by class-conditional priors below
};

const WEATHERSTRIP_COVERAGE_SCORES = {
  triple: 10,
  double: 8,
  partial: 6,
  // "unknown" is no longer here — handled by class-conditional priors below
};

const GLAZING_BEAD_SCORES = {
  double_wall_integrated: 10,
  single_wall_snap: 6,
  no_glazing_bead: 5,
  // "unknown" is no longer here — handled by class-conditional priors below
};

// ─── CLASS-CONDITIONAL PRIORS ─────────────────────────────────────────────────
// When a component is "unknown", use the expected value for that material class.
// These are derived from industry norms: what components are typical for
// premium wood/clad, fiberglass, and vinyl windows respectively.
//
// Material class normalization: maps various material class strings from the
// orchestrator's MATERIAL_CEILINGS table to one of three prior tiers.

const CLASS_PRIORS = {
  // Premium wood and aluminum-clad wood — highest tier components expected
  wood_clad: {
    spacer: 8.0,                // Warm-edge hybrid or stainless typical; aluminum unheard of
    balance: 8.0,               // Constant force (10) or quality block-and-tackle (7); ~8 average
    weatherstrip_attachment: 8.0, // Channeled (10) or mechanical (8); adhesive not used
    weatherstrip_coverage: 8.0, // Double (8) or triple (10) universal at this tier
    glazing_bead: 7.0,          // Mix of integrated (10) and snap-in (6)
    tier_standard: 6.0,         // "standard" tier baseline for this class (up from 5.0)
  },
  // Fiberglass — mid-high tier, energy-focused
  fiberglass: {
    spacer: 7.0,                // Warm-edge common but some use multi-piece stainless
    balance: 7.0,               // Block-and-tackle typical for fiberglass DH
    weatherstrip_attachment: 7.0, // Mechanically fastened typical
    weatherstrip_coverage: 8.0, // Double standard for energy-focused products
    glazing_bead: 6.0,          // Single-wall snap typical for fiberglass
    tier_standard: 5.5,         // Slightly above base
  },
  // Vinyl — broadest range, conservative priors
  vinyl: {
    spacer: 6.0,                // Range from warm-edge (8) to aluminum (4); 6 is class average
    balance: 7.0,               // Block-and-tackle (7) most common in vinyl DH
    weatherstrip_attachment: 7.0, // Range from mechanical (8) to adhesive (6)
    weatherstrip_coverage: 7.0, // Most have double; budget may have partial
    glazing_bead: 6.0,          // Single-wall snap near-universal in vinyl
    tier_standard: 5.0,         // Vinyl baseline (unchanged)
  },
};

// Map material class strings to prior tier keys
function getMaterialPriorTier(materialClass) {
  const mc = (materialClass || '').toLowerCase();
  // IMPORTANT: Order matters. Check compound terms BEFORE simple ones.
  // 'vinyl-clad wood' must match wood_clad (has wood core), not vinyl.
  // 'fiberglass-clad wood' must match wood_clad, not fiberglass.
  if (mc.includes('vinyl-clad wood') || mc.includes('vinyl clad wood')) return 'wood_clad';  // Wood core = premium priors
  if (mc.includes('fiberglass-clad wood') || mc.includes('fiberglass clad wood')) return 'wood_clad';
  if (mc.includes('vinyl') || mc.includes('pvc')) return 'vinyl';
  if (mc.includes('fiberglass') || mc.includes('fibreglass') || mc.includes('pultrude') || mc.includes('duracast')) return 'fiberglass';
  if (mc.includes('composite') || mc.includes('fibrex')) return 'fiberglass'; // Composite treated as fiberglass tier
  // Wood, clad, aluminum-clad, wood-clad all map to premium tier
  if (mc.includes('wood') || mc.includes('clad') || mc.includes('aluminum')) return 'wood_clad';
  // Default to vinyl (most conservative) if material class is unknown
  return 'vinyl';
}

// Get the class-conditional prior score for an unknown component
function getClassPrior(component, materialClass) {
  const tier = getMaterialPriorTier(materialClass);
  const priors = CLASS_PRIORS[tier] || CLASS_PRIORS.vinyl;
  return priors[component] || 6.0; // Ultimate fallback
}

// Quality tier for the 40% judgment portion — Binary system to eliminate
// classification ambiguity. If you can't prove it's premium, it's standard.
// "standard" baseline is now class-conditional instead of flat 5.0.
const QUALITY_TIER_PREMIUM = 8.5;  // Documented premium hardware, professional praise, no QC issues

function getStandardTierScore(materialClass) {
  const tier = getMaterialPriorTier(materialClass);
  const priors = CLASS_PRIORS[tier] || CLASS_PRIORS.vinyl;
  return priors.tier_standard;
}

function scoreComponentQuality(data, materialClass) {
  const report = { subscore: 'component_quality', method: 'deterministic_components_plus_class_priors' };
  const priorTier = getMaterialPriorTier(materialClass);
  report.prior_tier = priorTier;

  // Helper: look up score with class-conditional prior for unknowns
  function lookupWithPrior(value, scoreTable, componentName) {
    const normalized = (value || 'unknown').toLowerCase().replace(/[\s-]+/g, '_');
    if (normalized === 'unknown' || !scoreTable[normalized]) {
      const prior = getClassPrior(componentName, materialClass);
      return { score: prior, source: 'class_prior', disclosed: false };
    }
    return { score: scoreTable[normalized], source: 'disclosed', disclosed: true };
  }

  // 60% — Deterministic component scores (with class priors for unknowns)
  const spacerResult = lookupWithPrior(data.spacer_system, SPACER_SCORES, 'spacer');
  const balanceResult = lookupWithPrior(data.balance_system, BALANCE_SCORES, 'balance');
  const wsAttachResult = lookupWithPrior(data.weatherstrip_attachment, WEATHERSTRIP_ATTACHMENT_SCORES, 'weatherstrip_attachment');
  const wsCoverageResult = lookupWithPrior(data.weatherstrip_coverage, WEATHERSTRIP_COVERAGE_SCORES, 'weatherstrip_coverage');
  const glazingBeadResult = lookupWithPrior(data.glazing_bead, GLAZING_BEAD_SCORES, 'glazing_bead');

  const allResults = [spacerResult, balanceResult, wsAttachResult, wsCoverageResult, glazingBeadResult];
  const deterministicScore = allResults.reduce((sum, r) => sum + r.score, 0) / 5;
  const disclosedCount = allResults.filter(r => r.disclosed).length;
  const undisclosedCount = 5 - disclosedCount;

  // 40% — Quality tier classification (binary: premium or standard)
  const rawTier = (data.quality_tier || 'standard').toLowerCase().replace(/[\s-]+/g, '_');
  const tier = rawTier === 'premium' ? 'premium' : 'standard';
  const judgmentScore = tier === 'premium' ? QUALITY_TIER_PREMIUM : getStandardTierScore(materialClass);
  if (rawTier !== 'premium' && rawTier !== 'standard') {
    report.warning = `Mapped quality_tier "${data.quality_tier}" to standard (binary system)`;
  }

  report.components = {
    spacer: { value: data.spacer_system, score: spacerResult.score, source: spacerResult.source },
    balance: { value: data.balance_system, score: balanceResult.score, source: balanceResult.source },
    weatherstrip_attachment: { value: data.weatherstrip_attachment, score: wsAttachResult.score, source: wsAttachResult.source },
    weatherstrip_coverage: { value: data.weatherstrip_coverage, score: wsCoverageResult.score, source: wsCoverageResult.source },
    glazing_bead: { value: data.glazing_bead, score: glazingBeadResult.score, source: glazingBeadResult.source },
  };
  report.deterministic_score = Math.round(deterministicScore * 100) / 100;
  report.quality_tier = tier;
  report.judgment_score = judgmentScore;
  report.disclosed_components = disclosedCount;
  report.undisclosed_components = undisclosedCount;
  if (undisclosedCount > 0) {
    report.non_disclosure_note = `${undisclosedCount} of 5 components not disclosed by manufacturer — scored using class-conditional priors for ${priorTier} material class`;
  }

  // Final: 60% deterministic + 40% tier
  const raw = (deterministicScore * 0.60) + (judgmentScore * 0.40);
  report.score = Math.round(Math.max(1.0, Math.min(10.0, raw)) * 100) / 100;
  return report;
}

// ─── MANUFACTURING QUALITY (1B) — Pattern-Based Complaint Assessment ─────────
//
// CHANGE LOG:
//   March 15, 2026 (Fix B): Added BUSINESS_MODEL_MAP lookup table.
//     Products with null business_model now resolve via this map instead of
//     defaulting to assembler (7.0). Follows MATERIAL_CLASS_OVERRIDES pattern.
//   March 15, 2026 (Fix C): Replaced per-complaint deduction math with
//     pattern-based assessComplaintPattern(). Ray's principle: detect PATTERNS,
//     not individual complaints. A one-off from 2013 isn't significant; five
//     lawsuits spanning years IS significant. Haiku's systemic flag and year
//     metadata are used to assess pattern severity.

const BUSINESS_MODEL_BASE = {
  manufacturer_own_factory: 8.0,
  manufacturer_licensed: 7.5,
  assembler: 7.0,
  specifier: 6.0,
  marketeer: 4.0,
  rebrander: 3.0,
};

// Fix B: Product-level business model lookup table.
// When source_parser can't determine business_model from web search,
// this provides the ground truth. Same pattern as MATERIAL_CLASS_OVERRIDES.
// Key: lowercase product name (must match product_name in DB).
const BUSINESS_MODEL_MAP = {
  'sierra pacific':        'manufacturer_own_factory',  // Owns plants in Merced/Red Bluff CA
  'andersen 400 series':   'manufacturer_own_factory',  // Andersen Corporation — Bayport MN
  'andersen 100 series':   'manufacturer_own_factory',  // Andersen Corporation — Renewal line
  'andersen e-series':     'manufacturer_own_factory',  // Andersen Eagle line
  'jeld-wen v-2500':       'manufacturer_own_factory',  // Jeld-Wen — own factories worldwide
  'milgard tuscany':       'manufacturer_own_factory',  // Milgard (MI Windows) — own factories
  'pella 250 series':      'manufacturer_own_factory',  // Pella Corporation — Pella IA
  'pella impervia':        'manufacturer_own_factory',  // Pella Corporation
  'marvin signature ultimate': 'manufacturer_own_factory', // Marvin — Warroad MN
  'loewen':                'manufacturer_own_factory',  // Loewen — Steinbach MB Canada
  'alpen zr-7':            'manufacturer_own_factory',  // Alpen HPP — Louisville CO
  'simonton reflections 5500': 'manufacturer_own_factory', // Simonton (Cornerstone) — own plants
  'reliabilt 3500':        'rebrander',                  // Lowe's store brand — manufactured by various
  'ply gem pro series':    'manufacturer_own_factory',  // Ply Gem (Cornerstone Building Brands)
};

/**
 * Resolve business model: check data.business_model first, then BUSINESS_MODEL_MAP,
 * then fall back to assembler (7.0).
 * @param {Object} data — manufacturing_quality data with business_model and product name
 * @param {string} [productName] — product name for lookup table match
 * @returns {{model: string, base: number, source: string}}
 */
function resolveBusinessModel(data, productName) {
  // 1. Check if Bot 2 / source parser provided a business_model
  const directModel = (data.business_model || '').toLowerCase().replace(/[\s-]+/g, '_');
  if (directModel && BUSINESS_MODEL_BASE[directModel] !== undefined) {
    return { model: directModel, base: BUSINESS_MODEL_BASE[directModel], source: 'bot2_classification' };
  }

  // 2. Check BUSINESS_MODEL_MAP by product name
  if (productName) {
    const key = productName.toLowerCase().trim();
    const mapped = BUSINESS_MODEL_MAP[key];
    if (mapped && BUSINESS_MODEL_BASE[mapped] !== undefined) {
      return { model: mapped, base: BUSINESS_MODEL_BASE[mapped], source: 'business_model_map' };
    }
  }

  // 3. Fallback to assembler
  return { model: 'assembler', base: 7.0, source: 'default_fallback' };
}

// Fix C: Pattern-based complaint assessment
// Instead of per-complaint deductions that max out caps, assess the PATTERN.
// Ray's principle: individual complaints are noise; patterns are signal.
//
// Tier 0: 0 verified complaints → no deduction
// Tier 1: 1-2 isolated, none recent (>5yr) → minimal (-0.25 to -0.5)
// Tier 2: 1-2, recent (within 5yr) → moderate (-0.5 to -1.0)
// Tier 3: 3+ spanning years, pattern active → significant (-1.5 to -2.5)
// Tier 4: 3+ but cold (nothing recent) → reduced (-0.5 to -1.0)
//
// Haiku's systemic flag shifts severity UP within the tier.
// Haiku's year metadata determines recency.

function assessComplaintPattern(complaints) {
  const report = { method: 'pattern_based_v2' };

  if (!complaints || complaints.length === 0) {
    report.tier = 0;
    report.tier_label = 'CLEAN';
    report.deduction = 0;
    report.rationale = 'No verified complaints';
    return report;
  }

  // Fix D (v2): Only count Haiku-verified complaints for scoring.
  // Three categories:
  //   1. Verified: has _verified_by === 'haiku_complaint_verification' → scored
  //   2. Rejected: has _verified_by === 'unverified_fallback' → excluded
  //   3. Never verified: no _verified_by field at all → not scored, but flagged
  //
  // Edge case: first-run products have no _verified_by on anything because
  // Haiku verification hasn't run yet. If we filter everything out, the
  // product looks artificially clean. So: if zero pass the gate AND there
  // are never-verified complaints, flag COMPLAINTS_PENDING_VERIFICATION.
  const allComplaints = complaints;
  const verified = complaints.filter(c =>
    c._verified_by && c._verified_by === 'haiku_complaint_verification'
  );
  const neverVerified = complaints.filter(c => !c._verified_by);
  const rejected = complaints.filter(c =>
    c._verified_by && c._verified_by !== 'haiku_complaint_verification'
  );

  report.verification_filter = {
    total_received: allComplaints.length,
    haiku_verified: verified.length,
    never_verified: neverVerified.length,
    rejected: rejected.length,
    note: verified.length === allComplaints.length
      ? 'All complaints are Haiku-verified'
      : neverVerified.length > 0 && verified.length === 0
        ? `${neverVerified.length} complaint(s) have not been through Haiku verification — pending`
        : `${verified.length} verified, ${neverVerified.length} never-verified (excluded), ${rejected.length} rejected`
  };

  // Use only verified complaints for pattern assessment
  complaints = verified;

  if (complaints.length === 0) {
    // Edge case: complaints exist but none are verified
    if (neverVerified.length > 0) {
      // First-run product or evidence file predates Haiku verification.
      // Do NOT score as CLEAN — flag for verification.
      report.tier = -1;
      report.tier_label = 'COMPLAINTS_PENDING_VERIFICATION';
      report.deduction = 0;
      report.rationale = `${neverVerified.length} complaint(s) awaiting Haiku verification — not scored yet`;
      console.warn(`[DETERMINISTIC] WARNING: ${neverVerified.length} complaints pending verification — score may change after verification pass`);
      return report;
    }
    report.tier = 0;
    report.tier_label = 'CLEAN';
    report.deduction = 0;
    report.rationale = `No verified complaints (${rejected.length} rejected by Haiku)`;
    return report;
  }

  const currentYear = new Date().getFullYear();
  const RECENCY_THRESHOLD = 5; // years

  // Analyze complaint properties (verified only)
  const total = complaints.length;
  const withYears = complaints.filter(c => c.year && typeof c.year === 'number');
  const recentComplaints = withYears.filter(c => (currentYear - c.year) <= RECENCY_THRESHOLD);
  const oldComplaints = withYears.filter(c => (currentYear - c.year) > RECENCY_THRESHOLD);
  const systemicCount = complaints.filter(c => c.systemic === true).length;
  const safetyCount = complaints.filter(c => (c.classification || '').toUpperCase() === 'SAFETY').length;
  const redCount = complaints.filter(c => (c.evidence_level || '').toUpperCase() === 'RED').length;

  // Determine span (how many distinct years)
  const years = withYears.map(c => c.year);
  const uniqueYears = [...new Set(years)];
  const yearSpan = uniqueYears.length >= 2 ? Math.max(...uniqueYears) - Math.min(...uniqueYears) : 0;

  report.analysis = {
    total_verified: total,
    with_year_data: withYears.length,
    recent: recentComplaints.length,
    old: oldComplaints.length,
    systemic: systemicCount,
    safety: safetyCount,
    red_evidence: redCount,
    unique_years: uniqueYears.sort(),
    year_span: yearSpan,
  };

  let deduction = 0;
  let tier, tierLabel, rationale;

  if (total >= 3 && recentComplaints.length > 0) {
    // TIER 3: 3+ complaints with at least one recent — active pattern
    tier = 3;
    tierLabel = 'ACTIVE_PATTERN';

    // Base: -1.5
    deduction = -1.5;

    // Severity modifiers
    if (systemicCount >= 2) deduction -= 0.5;    // Multiple systemic = worse
    if (safetyCount >= 1) deduction -= 0.25;      // Safety issues present
    if (redCount >= 2) deduction -= 0.25;          // Multiple official/red-level
    if (yearSpan >= 5) deduction -= 0.25;          // Long-running pattern

    // Cap at -2.5
    deduction = Math.max(deduction, -2.5);
    rationale = `${total} verified complaints spanning ${yearSpan}+ years, ${recentComplaints.length} recent, ${systemicCount} systemic`;

  } else if (total >= 3 && recentComplaints.length === 0) {
    // TIER 4: 3+ complaints but all old — cold pattern
    tier = 4;
    tierLabel = 'COLD_PATTERN';

    deduction = -0.5;
    if (systemicCount >= 2) deduction -= 0.25;
    if (safetyCount >= 1) deduction -= 0.25;
    deduction = Math.max(deduction, -1.0);
    rationale = `${total} verified complaints but none in last ${RECENCY_THRESHOLD} years — pattern appears resolved`;

  } else if (total >= 1 && recentComplaints.length > 0) {
    // TIER 2: 1-2 complaints, at least one recent
    tier = 2;
    tierLabel = 'RECENT_ISOLATED';

    deduction = -0.5;
    if (systemicCount >= 1) deduction -= 0.25;
    if (safetyCount >= 1) deduction -= 0.25;
    deduction = Math.max(deduction, -1.0);
    rationale = `${total} verified complaint(s), ${recentComplaints.length} recent — isolated but current`;

  } else {
    // TIER 1: 1-2 complaints, all old
    tier = 1;
    tierLabel = 'OLD_ISOLATED';

    deduction = -0.25;
    if (safetyCount >= 1) deduction -= 0.25;
    deduction = Math.max(deduction, -0.5);
    rationale = `${total} verified complaint(s), all older than ${RECENCY_THRESHOLD} years — minimal pattern`;
  }

  report.tier = tier;
  report.tier_label = tierLabel;
  report.deduction = Math.round(deduction * 100) / 100;
  report.rationale = rationale;

  return report;
}

function scoreManufacturingQuality(data, productName) {
  const report = { subscore: 'manufacturing_quality', method: 'pattern_based_complaint_assessment' };

  // Fix B: Resolve business model via lookup table
  const bm = resolveBusinessModel(data, productName);
  report.base = bm.base;
  report.business_model = bm.model;
  report.business_model_source = bm.source;
  if (bm.source === 'default_fallback') {
    report.warning = `business_model not found for "${productName || data.business_model}" — defaulting to assembler (7.0). Add to BUSINESS_MODEL_MAP.`;
  }

  // Certification bonus (unchanged)
  let certBonus = 0;
  const certs = (data.certifications || []).map(c => c.toUpperCase());
  const hasAAMA = certs.includes('AAMA_GOLD');
  const hasPHI = certs.includes('PHI') || certs.includes('PHIUS');
  if (hasAAMA && hasPHI) {
    certBonus = 0.75;
  } else if (hasAAMA) {
    certBonus = 0.5;
  } else if (hasPHI) {
    certBonus = 0.5;
  }
  certBonus = Math.min(certBonus, 1.0);
  report.cert_bonus = certBonus;

  // Fix C: Pattern-based complaint assessment
  const patternReport = assessComplaintPattern(data.complaints);
  report.complaint_pattern = patternReport;
  report.complaint_deductions = patternReport.deduction;

  // Final score
  const raw = report.base + certBonus + patternReport.deduction;
  report.score = Math.max(1.0, Math.min(10.0, Math.round(raw * 100) / 100));
  return report;
}

// ─── MATERIALS DURABILITY (2B) — Fixed Adjustment Menu ───────────────────────

const ALLOWED_ADJUSTMENTS = {
  AAMA_2605:               +0.5,
  DUAL_SEAL_IGU:           +0.5,
  PREMIUM_WOOD:            +0.5,
  THERMAL_EXPANSION_MATCH: +0.5,
  DOCUMENTED_LONGEVITY:    +0.5,
  KNOWN_FAILURE:           -1.0,
  SHORT_WARRANTY:          -0.5,
  LAMINATED_WOOD:          -0.5,
  NO_GLAZING_BEAD:         -0.5,
  // SEAL_UNKNOWN removed March 14, 2026 — non-disclosure policy.
  // Not disclosing seal type is not a product quality issue.
};

function scoreMaterialsDurability(data, getMaterialCeiling) {
  const report = { subscore: 'materials_durability', method: 'fixed_adjustment_menu' };

  // Get base and ceiling from the orchestrator's MATERIAL_CEILINGS table
  const materialInfo = getMaterialCeiling(data.material_class);
  report.material_class = data.material_class;
  report.base = materialInfo.base;
  report.ceiling = materialInfo.ceiling;

  // Sum allowed adjustments
  let adjustmentSum = 0;
  const appliedAdjustments = [];
  const ignoredAdjustments = [];

  for (const adj of (data.adjustments_found || [])) {
    const code = (adj.code || '').toUpperCase();
    const value = ALLOWED_ADJUSTMENTS[code];
    if (value !== undefined) {
      adjustmentSum += value;
      appliedAdjustments.push({ code, value, description: adj.description, source: adj.source });
    } else {
      ignoredAdjustments.push({ code, description: adj.description, note: 'Not in allowed adjustment list — ignored' });
    }
  }

  report.adjustments_applied = appliedAdjustments;
  report.adjustments_ignored = ignoredAdjustments;
  report.adjustment_sum = adjustmentSum;

  // Final = base + adjustments, clamped to [1.0, material_ceiling]
  const raw = materialInfo.base + adjustmentSum;
  report.score = Math.max(1.0, Math.min(materialInfo.ceiling, Math.round(raw * 100) / 100));
  report.ceiling_applied = raw > materialInfo.ceiling;
  return report;
}

// ─── REPAIRABILITY (2C) — Component Scoring ──────────────────────────────────

const PARTS_SCORE = { 20: 10, 15: 8, 10: 7, 5: 5, 0: 4 };
const GLASS_WARRANTY_SCORE = { 25: 10, 20: 8, 15: 7, 10: 6, 5: 4 };
const IGU_METHOD_SCORE = { glass_swap: 10, sash_replacement: 6, full_window: 3 };
const SERVICE_SCORE = { manufacturer_direct: 10, nationwide_dealer: 9, regional_dealer: 7, limited: 4 };

function lookupRange(value, table) {
  // For parts_availability and glass_warranty: find the highest key <= value
  const keys = Object.keys(table).map(Number).sort((a, b) => b - a);
  for (const k of keys) {
    if (value >= k) return table[k];
  }
  return table[keys[keys.length - 1]]; // lowest
}

function scoreRepairability(data) {
  const report = { subscore: 'repairability', method: 'component_scoring' };

  const parts = lookupRange(data.parts_availability_years || 0, PARTS_SCORE);
  const transfer = data.warranty_transferable ? 10 : 4;

  let labor;
  if (data.labor_coverage === 'full') labor = 10;
  else if (data.labor_coverage === 'partial') labor = 7;
  else labor = 5;

  const glassWarranty = lookupRange(data.warranty_length_glass_years || 0, GLASS_WARRANTY_SCORE);
  // Handle glass warranty < 5 years
  let glassScore = glassWarranty;
  if ((data.warranty_length_glass_years || 0) < 5) glassScore = 2;

  const iguMethod = IGU_METHOD_SCORE[data.igu_replacement_method] || 3;
  const service = SERVICE_SCORE[data.service_network] || 4;

  report.components = {
    parts_score: { value: data.parts_availability_years, score: parts, weight: 0.20 },
    transfer_score: { value: data.warranty_transferable, score: transfer, weight: 0.15 },
    labor_score: { value: data.labor_coverage, score: labor, weight: 0.15 },
    glass_warranty_score: { value: data.warranty_length_glass_years, score: glassScore, weight: 0.15 },
    igu_method_score: { value: data.igu_replacement_method, score: iguMethod, weight: 0.20 },
    service_score: { value: data.service_network, score: service, weight: 0.15 },
  };

  const raw = (parts * 0.20) + (transfer * 0.15) + (labor * 0.15) +
              (glassScore * 0.15) + (iguMethod * 0.20) + (service * 0.15);
  report.score = Math.round(raw * 100) / 100;
  return report;
}

// ─── PROFESSIONAL CONSENSUS (1C) — Pool-Based Source System ──────────────────
// Sources are classified into pools by Bot 2. The scorer picks the highest
// available pool, applies that pool's ceiling, and computes a weighted score.
// No blending between pools — clean fallback chain.
//
// Pool S: True testing authorities (e.g., StarCraft Custom for faucets). Ceiling 9.0.
//         Reserved for categories that have them. Empty for windows.
// Pool A: Expert forums — GBA, Fine Homebuilding, JLC, BSC. Ceiling 7.5.
// Pool B: Verified trade pros — Jay Johnson, curated Reddit pros, contractor forums. Ceiling 6.5.
// Pool C: General field feedback — unverified Reddit, homeowner forums, consumer reviews. Ceiling 5.5.
//         Sources with price_bias flag get 50% weight reduction.

const POOL_CEILINGS = { S: 9.0, A: 7.5, B: 6.5, C: 5.5 };
const POOL_PRIORITY = ['S', 'A', 'B', 'C'];
const SENTIMENT_VALUES = { positive: 1, mixed: 0, negative: -1 };

function scoreProfessionalConsensus(data) {
  const report = { subscore: 'professional_consensus', method: 'pool_based_source_system' };

  // Deduplicate sources by name — pinned evidence sources (with id) take precedence
  // over _new sources that Bot 2 found independently with the same name.
  const rawSources = data.sources || [];
  const seenNames = new Map();
  for (const src of rawSources) {
    const key = (src.name || '').toLowerCase().trim();
    if (!key) continue;
    const existing = seenNames.get(key);
    if (!existing) {
      seenNames.set(key, src);
    } else {
      // Keep the one with an id (pinned), or the first one seen
      if (src.id && !existing.id) {
        seenNames.set(key, src);
      }
    }
  }
  const sources = [...seenNames.values()];
  if (sources.length === 0) {
    report.score = 5.0;
    report.note = 'No sources found — midpoint default';
    report.confidence_flag = 'LOW_CONFIDENCE';
    report.confidence_message = 'Insufficient professional sources — score is a placeholder, not a verdict';
    report.sources_processed = 0;
    return report;
  }

  // Group sources by pool
  const poolGroups = { S: [], A: [], B: [], C: [] };
  for (const src of sources) {
    const pool = (src.pool || 'C').toUpperCase();
    if (poolGroups[pool]) {
      poolGroups[pool].push(src);
    } else {
      poolGroups.C.push(src); // Unknown pool defaults to C
    }
  }

  // Find the highest available pool (no blending)
  let activePool = null;
  let activeSources = [];
  for (const pool of POOL_PRIORITY) {
    if (poolGroups[pool].length > 0) {
      activePool = pool;
      activeSources = poolGroups[pool];
      break;
    }
  }

  const ceiling = POOL_CEILINGS[activePool] || 5.5;
  report.active_pool = activePool;
  report.pool_ceiling = ceiling;
  report.pool_counts = {
    S: poolGroups.S.length,
    A: poolGroups.A.length,
    B: poolGroups.B.length,
    C: poolGroups.C.length,
  };

  // Compute weighted sentiment from active pool sources
  let weightedSum = 0;
  let weightedCount = 0;
  const sourceDetails = [];

  for (const src of activeSources) {
    const sentiment = (src.sentiment || 'mixed').toLowerCase();
    const sentimentValue = SENTIMENT_VALUES[sentiment] !== undefined ? SENTIMENT_VALUES[sentiment] : 0;

    // Credibility-based weight for Pool C sources
    // If credibility screen ran (_credibility_screen exists), use tiered discount:
    //   Trade + Technical + no price bias → 25% discount (likely credible pro)
    //   Trade OR Technical → 50% discount (partial signal)
    //   Neither → 75% discount (likely noise)
    //   price_bias_detected on any source → 50% floor regardless
    // Fallback (no screen): original flat discount based on price_bias flag
    let weight = 1.0;
    if (activePool === 'C') {
      const cs = src._credibility_screen;
      if (cs) {
        const isTrade = cs.claims_trade_experience === true;
        const isTech = cs.has_technical_claims === true;
        const isBias = cs.price_bias_detected === true;

        if (isBias) {
          // Price-bias floor: never better than 50% discount
          weight = 0.5;
        } else if (isTrade && isTech) {
          // Likely credible professional — minimal discount
          weight = 0.75;
        } else if (isTrade || isTech) {
          // Partial credibility signal — standard discount
          weight = 0.5;
        } else {
          // No credibility signals — heavy discount
          weight = 0.25;
        }
      } else {
        // No credibility screen (legacy data) — use price_bias flag
        weight = src.price_bias ? 0.5 : 0.5; // flat 50% for Pool C without screen
      }
    }

    weightedSum += weight * sentimentValue;
    weightedCount += weight;

    const detail = {
      name: src.name,
      pool: activePool,
      sentiment,
      sentiment_value: sentimentValue,
      weight,
      price_bias: src.price_bias || false,
      contribution: weight * sentimentValue,
    };
    // Include credibility screen tags if available
    if (src._credibility_screen) {
      detail.credibility = {
        trade: src._credibility_screen.claims_trade_experience || false,
        technical: src._credibility_screen.has_technical_claims || false,
        price_bias: src._credibility_screen.price_bias_detected || false,
      };
    }
    sourceDetails.push(detail);
  }

  const consensusRatio = weightedCount > 0 ? weightedSum / weightedCount : 0;

  // Confidence multiplier: dampens effect when source count is low.
  // 1 source: 0.3x (max ±0.75 from midpoint)
  // 2 sources: 0.5x (max ±1.25)
  // 3 sources: 0.7x (max ±1.75)
  // 4+ sources: 1.0x (full effect, max ±2.5)
  const sourceCount = activeSources.length;
  const confidenceMultiplier = sourceCount >= 4 ? 1.0 :
                               sourceCount === 3 ? 0.7 :
                               sourceCount === 2 ? 0.5 : 0.3;

  // Base: midpoint + sentiment-driven swing (dampened by confidence)
  const base = 5.0 + (consensusRatio * 2.5 * confidenceMultiplier);

  // Apply pool ceiling
  const raw = Math.min(base, ceiling);

  // Confidence flag
  if (sourceCount <= 1) {
    report.confidence_flag = 'LOW_CONFIDENCE';
    report.confidence_message = 'Insufficient professional sources — score has limited reliability';
  } else if (sourceCount <= 2) {
    report.confidence_flag = 'MODERATE_CONFIDENCE';
    report.confidence_message = 'Limited professional sources — directional only';
  } else {
    report.confidence_flag = 'ADEQUATE';
  }

  report.sources_processed = sourceCount;
  report.source_details = sourceDetails;
  report.consensus_ratio = Math.round(consensusRatio * 1000) / 1000;
  report.confidence_multiplier = confidenceMultiplier;
  report.base_before_ceiling = Math.round(base * 100) / 100;
  report.ceiling_applied = base > ceiling;
  report.score = Math.round(Math.max(1.0, Math.min(10.0, raw)) * 100) / 100;
  return report;
}

// ─── MAIN ENTRY POINT ───────────────────────────────────────────────────────

/**
 * Compute deterministic scores for the 4 reformed subscores.
 * @param {Object} bot2Parsed - Parsed Bot 2 JSON output (with classification data)
 * @param {Object} materialLock - Material lock info { rawText, found, source }
 * @param {Function} getMaterialCeiling - Function from orchestrator to look up material ceilings
 * @returns {Object} Scoring report with all 4 computed scores
 */
function computeDeterministicScores(bot2Parsed, materialLock, getMaterialCeiling) {
  const scores = bot2Parsed.scores || {};
  const quality = scores.quality || {};
  const durability = scores.durability || {};

  const result = {
    timestamp: new Date().toISOString(),
    method: 'deterministic_scorer_v1',
    product: bot2Parsed.product,
    material_class: materialLock.rawText,
  };

  // 1A Component Quality — pass material class for class-conditional priors
  const cqData = quality.component_quality || {};
  result.component_quality = scoreComponentQuality(cqData, materialLock.rawText);

  // 1B Manufacturing Quality — pass product name for BUSINESS_MODEL_MAP lookup (Fix B)
  const mfgData = quality.manufacturing_quality || {};
  result.manufacturing_quality = scoreManufacturingQuality(mfgData, bot2Parsed.product);

  // 1C Professional Consensus
  const pcData = quality.professional_consensus || {};
  result.professional_consensus = scoreProfessionalConsensus(pcData);

  // 2B Materials Durability
  const mdData = durability.materials_durability || {};
  // Use material class from lock if not provided in Bot 2 output
  if (!mdData.material_class && materialLock.rawText) {
    mdData.material_class = materialLock.rawText;
  }
  result.materials_durability = scoreMaterialsDurability(mdData, getMaterialCeiling);

  // 2C Repairability
  const repData = durability.repairability || {};
  result.repairability = scoreRepairability(repData);

  return result;
}

module.exports = { computeDeterministicScores };