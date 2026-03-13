/**
 * THE RESIDENTIALIST — Deterministic Scorer
 * Computes 4 reformed subscores from Bot 2's classification output using
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
 */

// ─── COMPONENT QUALITY (1A) — Deterministic Components + Tier Classification ─
// 60% deterministic from component lookups, 40% from a categorical quality tier.
// Bot 2 provides the component identifications and a quality_tier classification.
// The deterministic scorer computes the final score.

const SPACER_SCORES = {
  one_piece_stainless: 10,
  warm_edge_foam: 8,
  warm_edge_hybrid: 8,
  multi_piece_stainless: 7,
  four_piece_aluminum: 4,
  unknown: 5,
};

const BALANCE_SCORES = {
  constant_force: 10,  // AAMA Class 5
  class_4: 9,
  coil_spring: 8,      // Class 3
  block_and_tackle: 7, // Class 2
  class_1: 5,
  unknown: 5,
};

const WEATHERSTRIP_ATTACHMENT_SCORES = {
  channeled: 10,
  integrated: 10,
  mechanically_fastened: 8,
  adhesive: 6,
  unknown: 5,
};

const WEATHERSTRIP_COVERAGE_SCORES = {
  triple: 10,
  double: 8,
  partial: 6,
  unknown: 5,
};

const GLAZING_BEAD_SCORES = {
  double_wall_integrated: 10,
  single_wall_snap: 6,
  no_glazing_bead: 5,
  unknown: 5,
};

// Quality tier for the 40% judgment portion — 4 tiers, fixed midpoint scores
const QUALITY_TIER_SCORES = {
  premium: 9.5,        // Premium hardware, no QC issues, professional praise
  standard_plus: 7.5,  // Solid hardware, minor issues
  standard: 5.5,       // Industry-standard, some cost optimization
  below_standard: 3.5, // Documented cheap components or QC patterns
};

function scoreComponentQuality(data) {
  const report = { subscore: 'component_quality', method: 'deterministic_components_plus_tier' };

  // 60% — Deterministic component scores
  const spacer = SPACER_SCORES[(data.spacer_system || 'unknown').toLowerCase().replace(/[\s-]+/g, '_')] || SPACER_SCORES.unknown;
  const balance = BALANCE_SCORES[(data.balance_system || 'unknown').toLowerCase().replace(/[\s-]+/g, '_')] || BALANCE_SCORES.unknown;
  const wsAttach = WEATHERSTRIP_ATTACHMENT_SCORES[(data.weatherstrip_attachment || 'unknown').toLowerCase().replace(/[\s-]+/g, '_')] || WEATHERSTRIP_ATTACHMENT_SCORES.unknown;
  const wsCoverage = WEATHERSTRIP_COVERAGE_SCORES[(data.weatherstrip_coverage || 'unknown').toLowerCase().replace(/[\s-]+/g, '_')] || WEATHERSTRIP_COVERAGE_SCORES.unknown;
  const glazingBead = GLAZING_BEAD_SCORES[(data.glazing_bead || 'unknown').toLowerCase().replace(/[\s-]+/g, '_')] || GLAZING_BEAD_SCORES.unknown;

  // Component weights from rubric (equal weight among 5 components)
  const deterministicScore = (spacer + balance + wsAttach + wsCoverage + glazingBead) / 5;

  // 40% — Quality tier classification
  const tier = (data.quality_tier || 'standard').toLowerCase().replace(/[\s-]+/g, '_');
  const tierScore = QUALITY_TIER_SCORES[tier];
  if (tierScore === undefined) {
    report.warning = `Unknown quality_tier "${data.quality_tier}" — defaulting to standard (5.5)`;
  }
  const judgmentScore = tierScore !== undefined ? tierScore : QUALITY_TIER_SCORES.standard;

  report.components = {
    spacer: { value: data.spacer_system, score: spacer },
    balance: { value: data.balance_system, score: balance },
    weatherstrip_attachment: { value: data.weatherstrip_attachment, score: wsAttach },
    weatherstrip_coverage: { value: data.weatherstrip_coverage, score: wsCoverage },
    glazing_bead: { value: data.glazing_bead, score: glazingBead },
  };
  report.deterministic_score = Math.round(deterministicScore * 100) / 100;
  report.quality_tier = tier;
  report.judgment_score = judgmentScore;

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
  SEAL_UNKNOWN:            -0.5,
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

// ─── PROFESSIONAL CONSENSUS (1C) — Source-Weighted Formula ───────────────────

const TIER_WEIGHTS = { 1: 1.0, 2: 0.7, 3: 0.4 };
const SENTIMENT_VALUES = { positive: 1, mixed: 0, negative: -1 };

function scoreProfessionalConsensus(data) {
  const report = { subscore: 'professional_consensus', method: 'source_weighted_formula' };

  const sources = data.sources || [];
  if (sources.length === 0) {
    report.score = 5.0;
    report.note = 'No sources found — midpoint default';
    report.sources_processed = 0;
    return report;
  }

  let weightedSum = 0;
  let weightedCount = 0;
  const sourceDetails = [];

  for (const src of sources) {
    const tier = src.tier || 3;
    const tierWeight = TIER_WEIGHTS[tier] || 0.4;
    const sentiment = (src.sentiment || 'mixed').toLowerCase();
    const sentimentValue = SENTIMENT_VALUES[sentiment] !== undefined ? SENTIMENT_VALUES[sentiment] : 0;

    weightedSum += tierWeight * sentimentValue;
    weightedCount += tierWeight;

    sourceDetails.push({
      name: src.name,
      tier,
      sentiment,
      tier_weight: tierWeight,
      sentiment_value: sentimentValue,
      contribution: tierWeight * sentimentValue,
    });
  }

  const consensusRatio = weightedCount > 0 ? weightedSum / weightedCount : 0;

  // Confidence multiplier: dampens the effect when source count is low.
  // With 1 source, a single sentiment classification flip shouldn't swing 2.5 points.
  // 1 source: 0.3x effect (max ±0.75 from midpoint)
  // 2 sources: 0.5x effect (max ±1.25)
  // 3 sources: 0.7x effect (max ±1.75)
  // 4+ sources: 1.0x (full effect, max ±2.5)
  const confidenceMultiplier = sources.length >= 4 ? 1.0 :
                               sources.length === 3 ? 0.7 :
                               sources.length === 2 ? 0.5 : 0.3;
  let base = 5.0 + (consensusRatio * 2.5 * confidenceMultiplier);

  // Field source bonus
  let fieldBonus = 0;
  const fieldQualified = data.field_sources_qualified || 0;
  const fieldSentiment = (data.field_sentiment || '').toLowerCase();
  if (fieldQualified >= 3 && fieldSentiment === 'positive') {
    fieldBonus = 0.5;
  }

  let raw = base + fieldBonus;

  // Ceiling: 7.5 unless 6+ qualified sources push higher
  if (sources.length < 6) {
    raw = Math.min(raw, 7.5);
  }

  report.sources_processed = sources.length;
  report.source_details = sourceDetails;
  report.consensus_ratio = Math.round(consensusRatio * 1000) / 1000;
  report.confidence_multiplier = confidenceMultiplier;
  report.base = Math.round(base * 100) / 100;
  report.field_bonus = fieldBonus;
  report.ceiling_applied = raw < (base + fieldBonus);
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

  // 1A Component Quality
  const cqData = quality.component_quality || {};
  result.component_quality = scoreComponentQuality(cqData);

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
