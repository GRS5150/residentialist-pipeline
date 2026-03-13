/**
 * THE RESIDENTIALIST — Deterministic Scorer
 * Computes 4 reformed subscores from Bot 2's classification output using
 * lookup tables and formulas instead of LLM judgment.
 *
 * Reformed subscores:
 *   1B manufacturing_quality  — Complaint Severity Framework
 *   1C professional_consensus — Source-Weighted Formula
 *   2B materials_durability   — Fixed Adjustment Menu
 *   2C repairability          — Component Scoring
 *
 * Unchanged subscores (still scored by Bot 2):
 *   1A component_quality, 2A frame_longevity, 3A thermal, 3B structural, 3C air_water
 */

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
  let base = 5.0 + (consensusRatio * 2.5);

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
