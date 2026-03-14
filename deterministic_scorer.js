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

// ─── MANUFACTURING QUALITY (1B) — Complaint Severity Framework ───────────────

const BUSINESS_MODEL_BASE = {
  manufacturer_own_factory: 8.0,
  manufacturer_licensed: 7.5,
  assembler: 7.0,
  specifier: 6.0,
  marketeer: 4.0,
  rebrander: 3.0,
};

const COMPLAINT_DEDUCTIONS = {
  SAFETY:            { red: -1.0,  yellow: -0.5,  note: -0.5,  cap: -3.0 },
  STRUCTURAL_DEFECT: { red: -0.75, yellow: -0.25, note: -0.125, cap: -2.0 },
  DELIVERY:          { red: -0.5,  yellow: -0.5,  note: -0.25, cap: -1.5 },
  COSMETIC:          { red: -0.25, yellow: -0.25, note: -0.125, cap: -1.0 },
  INSTALL_DEPENDENT: { red: 0,     yellow: 0,     note: 0,     cap: 0 },
};

function scoreManufacturingQuality(data) {
  const report = { subscore: 'manufacturing_quality', method: 'complaint_severity_framework' };

  // Base score from business model
  const model = (data.business_model || '').toLowerCase().replace(/[\s-]+/g, '_');
  const base = BUSINESS_MODEL_BASE[model];
  if (base === undefined) {
    report.warning = `Unknown business_model "${data.business_model}" — defaulting to assembler (7.0)`;
  }
  report.base = base !== undefined ? base : 7.0;

  // Certification bonus
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

  // Complaint deductions
  let totalDeductions = 0;
  const complaintDetails = [];
  const capTrackers = {};

  for (const complaint of (data.complaints || [])) {
    const cls = (complaint.classification || '').toUpperCase();
    const rules = COMPLAINT_DEDUCTIONS[cls];
    if (!rules) {
      complaintDetails.push({ description: complaint.description, classification: cls, deduction: 0, note: 'Unknown classification — ignored' });
      continue;
    }

    const evidence = (complaint.evidence_level || 'NOTE').toUpperCase();
    let deduction;
    if (evidence === 'RED') {
      deduction = rules.red;
    } else if (evidence === 'YELLOW') {
      deduction = rules.yellow;
    } else {
      // NOTE-level: reduce deduction by 50%
      deduction = rules.note;
    }

    // Track per-classification cap
    if (!capTrackers[cls]) capTrackers[cls] = 0;
    const remainingCap = rules.cap - capTrackers[cls];
    if (remainingCap >= 0) {
      deduction = 0; // cap already hit (all deductions are negative, cap is negative)
    } else {
      deduction = Math.max(deduction, remainingCap); // don't exceed cap
    }
    capTrackers[cls] += deduction;
    totalDeductions += deduction;

    complaintDetails.push({
      description: complaint.description,
      classification: cls,
      evidence_level: evidence,
      deduction,
    });
  }

  report.complaint_deductions = totalDeductions;
  report.complaints = complaintDetails;

  // Final score
  const raw = report.base + certBonus + totalDeductions;
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

    // Price-bias filter: Pool C sources with price_bias flag get 50% weight
    let weight = 1.0;
    if (activePool === 'C' && src.price_bias) {
      weight = 0.5;
    }

    weightedSum += weight * sentimentValue;
    weightedCount += weight;

    sourceDetails.push({
      name: src.name,
      pool: activePool,
      sentiment,
      sentiment_value: sentimentValue,
      weight,
      price_bias: src.price_bias || false,
      contribution: weight * sentimentValue,
    });
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

  // 1B Manufacturing Quality
  const mfgData = quality.manufacturing_quality || {};
  result.manufacturing_quality = scoreManufacturingQuality(mfgData);

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
