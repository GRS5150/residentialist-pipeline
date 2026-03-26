/**
 * THE RESIDENTIALIST — Deterministic Scorer
 * Standalone scoring module with geometric mean, axis stretch, calibration config loading.
 * 
 * Replaces inline arithmetic scoring with configurable geometric-mean-based scoring.
 * Same weights, same inputs, different math — balanced products score close to arithmetic average,
 * imbalanced products get pulled down.
 * 
 * Usage:
 *   const { computeScore, rescoreProduct, getLabel } = require('./deterministic_scorer');
 *   const result = computeScore({ quality_score: 7.5, durability_score: 8.0, performance_score: 7.8 }, 'windows');
 */

const fs = require('fs');
const path = require('path');

const WORKSPACE = process.env.OPENCLAW_WORKSPACE || '/home/ubuntu/.openclaw/workspace/residentialist';
const CALIBRATION_DIR = path.join(WORKSPACE, 'calibration');
const CURATION_DIR = path.join(WORKSPACE, 'curation');

// ─── Label System ──────────────────────────────────────────────────────────────

const LABELS = [
  { label: 'Best in Class', min: 90, max: 100 },
  { label: 'Excellent',     min: 75, max: 89 },
  { label: 'Good',          min: 60, max: 74 },
  { label: 'Fair',          min: 40, max: 59 },
  { label: 'Below Standard', min: 0,  max: 39 }
];

function getLabel(displayScore) {
  for (const tier of LABELS) {
    if (displayScore >= tier.min && displayScore <= tier.max) {
      return tier.label;
    }
  }
  return 'Below Standard';
}

// ─── Calibration Config Loading ────────────────────────────────────────────────

function loadCalibrationConfig(category) {
  const configPath = path.join(CALIBRATION_DIR, category, 'config.json');
  if (fs.existsSync(configPath)) {
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }
  return null;
}

function loadWeights(category) {
  const config = loadCalibrationConfig(category);
  if (config && config.parameters && config.parameters.axis_weights) {
    return config.parameters.axis_weights;
  }
  // Default fallback
  return { quality: 0.35, durability: 0.35, performance: 0.30 };
}

// ─── Geometric Mean ────────────────────────────────────────────────────────────

/**
 * Compute weighted geometric mean of axis scores.
 * Scores are on 0-10 scale internally.
 * 
 * The geometric mean naturally penalizes imbalanced products:
 * A window with great durability but poor quality doesn't "average out."
 * Same methodology the UN HDI uses (adopted 2010).
 */
function geometricMean(quality, durability, performance, weights) {
  // Floor at 0.01 to prevent log(0) — a score of 0 is essentially impossible
  const q = Math.max(quality / 10, 0.01);
  const d = Math.max(durability / 10, 0.01);
  const p = Math.max(performance / 10, 0.01);

  const geo = Math.pow(q, weights.quality) *
              Math.pow(d, weights.durability) *
              Math.pow(p, weights.performance);

  return geo * 10; // back to 0-10 scale
}

/**
 * Legacy arithmetic weighted average (for comparison/fallback).
 */
function arithmeticMean(quality, durability, performance, weights) {
  return quality * weights.quality + durability * weights.durability + performance * weights.performance;
}

// ─── Axis Stretch ──────────────────────────────────────────────────────────────

/**
 * Stretch axis scores to use more of the 0-10 scale.
 * Best product should score 9.0-9.5+ on strongest axis.
 * Budget products should score honestly low on weakest axis.
 */
function stretchAxis(rawScore, ceilingBonus, floorPenalty, categoryMin, categoryMax) {
  // Guard against equal min/max
  if (categoryMax - categoryMin < 0.01) return rawScore;

  // Normalize to 0-1 within the category range
  const normalized = (rawScore - categoryMin) / (categoryMax - categoryMin);

  // Apply stretch
  const newFloor = Math.max(3.0, categoryMin - floorPenalty);
  const newCeiling = Math.min(10.0, categoryMax + ceilingBonus);

  return newFloor + normalized * (newCeiling - newFloor);
}

// ─── Category Ceilings ─────────────────────────────────────────────────────────

/**
 * Apply category ceiling to an axis score.
 * For categories where an axis doesn't differentiate, cap its contribution.
 * Windows: all 1.0 (all axes differentiate).
 */
function applyCeiling(axisScore, ceiling) {
  return axisScore * ceiling;
}

// ─── Category Ranges ───────────────────────────────────────────────────────────

/**
 * Get min/max ranges per axis from DB or configuration.
 * These are used for axis stretch normalization.
 */
function getCategoryRanges(category) {
  // Try loading from calibration config
  const config = loadCalibrationConfig(category);
  if (config && config.parameters && config.parameters.category_ranges) {
    return config.parameters.category_ranges;
  }

  // Try computing from DB
  try {
    const Database = require('better-sqlite3');
    const dbPath = process.env.DATABASE_PATH || path.join(WORKSPACE, 'residentialist.db');
    const db = new Database(dbPath, { readonly: true });

    const row = db.prepare(`
      SELECT 
        MIN(quality_score) as q_min, MAX(quality_score) as q_max,
        MIN(durability_score) as d_min, MAX(durability_score) as d_max,
        MIN(performance_score) as p_min, MAX(performance_score) as p_max
      FROM evaluations 
      WHERE category = ? AND status = 'complete' 
        AND quality_score IS NOT NULL
    `).get(category === 'windows' ? 'Windows' : category);

    db.close();

    if (row && row.q_min != null) {
      return {
        quality: { min: row.q_min, max: row.q_max },
        durability: { min: row.d_min, max: row.d_max },
        performance: { min: row.p_min, max: row.p_max }
      };
    }
  } catch (err) {
    console.warn(`[SCORER] Could not load category ranges from DB: ${err.message}`);
  }

  // Hardcoded fallback based on current windows data
  // (Quality 53.5-77.0, Durability 59.1-88.2, Performance 55.0-91.3)
  return {
    quality: { min: 5.35, max: 7.70 },
    durability: { min: 5.91, max: 8.82 },
    performance: { min: 5.50, max: 9.13 }
  };
}

// ─── Main Scoring Function ─────────────────────────────────────────────────────

/**
 * Compute the final score for a product.
 * 
 * @param {Object} product - Must have quality_score, durability_score, performance_score (0-10 scale)
 * @param {string} category - Product category (e.g., 'windows')
 * @returns {Object} Scoring result with display_score, product_label, etc.
 */
function computeScore(product, category) {
  const weights = loadWeights(category);
  const config = loadCalibrationConfig(category);

  let q = product.quality_score;
  let d = product.durability_score;
  let p = product.performance_score;

  // Step 1: Apply axis stretch (if calibration config exists)
  let axesBeforeStretch = { quality: q, durability: d, performance: p };
  if (config && config.parameters && config.parameters.axis_stretch) {
    const stretch = config.parameters.axis_stretch;
    const ranges = getCategoryRanges(category);

    q = stretchAxis(q, stretch.quality_ceiling_bonus, stretch.quality_floor_penalty,
                     ranges.quality.min, ranges.quality.max);
    d = stretchAxis(d, stretch.durability_ceiling_bonus, stretch.durability_floor_penalty,
                     ranges.durability.min, ranges.durability.max);
    p = stretchAxis(p, stretch.performance_ceiling_bonus, stretch.performance_floor_penalty,
                     ranges.performance.min, ranges.performance.max);
  }

  // Step 2: Apply category ceilings
  if (config && config.parameters && config.parameters.category_ceilings) {
    q = applyCeiling(q, config.parameters.category_ceilings.quality);
    d = applyCeiling(d, config.parameters.category_ceilings.durability);
    p = applyCeiling(p, config.parameters.category_ceilings.performance);
  }

  // Step 3: Compute composite
  const compositeMethod = (config && config.parameters && config.parameters.composite_method) || 'geometric';
  let overall;
  if (compositeMethod === 'geometric') {
    overall = geometricMean(q, d, p, weights);
  } else {
    overall = arithmeticMean(q, d, p, weights);
  }

  // Step 4: Convert to 0-100 display scale
  const displayScore = Math.round(overall * 10);
  const label = getLabel(displayScore);

  return {
    overall_score: overall,
    display_score: displayScore,
    product_label: label,
    calibration_version: config ? config.version : 'default',
    composite_method: compositeMethod,
    weights_used: weights,
    axes_before_stretch: axesBeforeStretch,
    axes_after_stretch: { quality: q, durability: d, performance: p }
  };
}

// ─── Rescore ───────────────────────────────────────────────────────────────────

/**
 * Rescore a product: recalculate from existing bot2 data without running any bots.
 * Cost: $0.00 (no API calls).
 * 
 * @param {string} productSlug - Product identifier
 * @param {string} category - Category (default: 'windows')
 * @returns {Object} { old_score, new_score, duration_ms }
 */
function rescoreProduct(productSlug, category = 'windows') {
  const startTime = Date.now();

  // Find the latest run directory for this product
  const outputsDir = path.join(WORKSPACE, 'outputs');
  const runs = fs.readdirSync(outputsDir)
    .filter(d => d.startsWith(productSlug))
    .sort()
    .reverse();

  if (runs.length === 0) {
    throw new Error(`No pipeline runs found for product: ${productSlug}`);
  }

  const latestRun = path.join(outputsDir, runs[0]);

  // Find the bot2 evaluator output
  const bot2File = fs.readdirSync(latestRun).find(f => f.includes('bot2'));
  if (!bot2File) {
    throw new Error(`No bot2 evaluator output found in: ${latestRun}`);
  }

  const bot2Content = fs.readFileSync(path.join(latestRun, bot2File), 'utf8');

  // Try to extract axis scores from bot2 output
  const scores = extractScoresFromBot2(bot2Content);
  if (!scores) {
    throw new Error(`Could not extract axis scores from bot2 output`);
  }

  // Compute new score
  const newResult = computeScore(scores, category);

  const duration = Date.now() - startTime;

  return {
    product_slug: productSlug,
    old_scores: scores,
    new_result: newResult,
    duration_ms: duration,
    run_dir: runs[0]
  };
}

/**
 * Extract quality/durability/performance scores from bot2 markdown output.
 * Parses the structured evaluator output for axis scores.
 * 
 * Tested formats:
 *   **Quality Calculation:** ... = **7.15/10**
 *   **QUALITY: C+ (6.05/10) [DH]**
 *   Overall = (7.15 + 7.82 + 6.8) / 3
 *   ## AXIS 1: QUALITY (7.75/10)
 */
function extractScoresFromBot2(bot2Content) {
  let q, d, p;

  // Strategy 1: Look for "**XX Calculation:** ... = **N.NN/10**"
  const qCalc = bot2Content.match(/\*\*Quality Calculation:\*\*.*?=\s*\*\*(\d+\.?\d*)\/10\*\*/i);
  const dCalc = bot2Content.match(/\*\*Durability Calculation:\*\*.*?=\s*\*\*(\d+\.?\d*)\/10\*\*/i);
  const pCalc = bot2Content.match(/\*\*Performance Calculation:\*\*.*?=\s*\*\*(\d+\.?\d*)\/10\*\*/i);
  if (qCalc && dCalc && pCalc) {
    return {
      quality_score: parseFloat(qCalc[1]),
      durability_score: parseFloat(dCalc[1]),
      performance_score: parseFloat(pCalc[1])
    };
  }

  // Strategy 2: Look for "**QUALITY: X (N.NN/10) [DH]**" summary lines
  const qSummary = bot2Content.match(/\*\*QUALITY:\s*\S+\s*\((\d+\.?\d*)\/10\)/i);
  const dSummary = bot2Content.match(/\*\*DURABILITY:\s*\S+\s*\((\d+\.?\d*)\/10\)/i);
  const pSummary = bot2Content.match(/\*\*PERFORMANCE:\s*\S+\s*\((\d+\.?\d*)\/10\)/i);
  if (qSummary && dSummary && pSummary) {
    return {
      quality_score: parseFloat(qSummary[1]),
      durability_score: parseFloat(dSummary[1]),
      performance_score: parseFloat(pSummary[1])
    };
  }

  // Strategy 3: Look for "Overall = (Q + D + P) / 3" line
  const overallLine = bot2Content.match(/Overall\s*=\s*\((\d+\.?\d*)\s*\+\s*(\d+\.?\d*)\s*\+\s*(\d+\.?\d*)\)\s*\/\s*3/i);
  if (overallLine) {
    return {
      quality_score: parseFloat(overallLine[1]),
      durability_score: parseFloat(overallLine[2]),
      performance_score: parseFloat(overallLine[3])
    };
  }

  // Strategy 4: Look for "## AXIS N: NAME (N.NN/10)" header
  const qAxis = bot2Content.match(/##\s*AXIS\s*1:\s*QUALITY\s*\((\d+\.?\d*)\/10\)/i);
  const dAxis = bot2Content.match(/##\s*AXIS\s*2:\s*DURABILITY\s*\((\d+\.?\d*)\/10\)/i);
  const pAxis = bot2Content.match(/##\s*AXIS\s*3:\s*PERFORMANCE\s*\((\d+\.?\d*)\/10\)/i);
  // Strategy 5: Broader match — any line containing "QUALITY: X (N.NN/10)" format
  // Handles: "QUALITY: C+ (6.1/10) [DH]", "## QUALITY: D+ (5.2/10)", "### QUALITY: C+ (6.8/10)"
  const qBroad = bot2Content.match(/QUALITY:\s*\S+\s*\((\d+\.?\d*)\/10\)/i);
  const dBroad = bot2Content.match(/DURABILITY:\s*\S+\s*\((\d+\.?\d*)\/10\)/i);
  const pBroad = bot2Content.match(/PERFORMANCE:\s*\S+\s*\((\d+\.?\d*)\/10\)/i);
  if (qBroad && dBroad && pBroad) {
    return {
      quality_score: parseFloat(qBroad[1]),
      durability_score: parseFloat(dBroad[1]),
      performance_score: parseFloat(pBroad[1])
    };
  }

  // Strategy 6: Two-axis fallback — performance excluded, average Q and D
  if (qBroad && dBroad && !pBroad) {
    const qVal = parseFloat(qBroad[1]);
    const dVal = parseFloat(dBroad[1]);
    // Use average of Q and D as performance fallback (conservative)
    return {
      quality_score: qVal,
      durability_score: dVal,
      performance_score: (qVal + dVal) / 2,
      performance_excluded: true
    };
  }

  return null;
}

// ─── Deterministic Scoring from Bot 2 Classifications ──────────────────────────

/**
 * Material base scores from the calibration hierarchy.
 * These are the starting points before adjustments.
 */
const MATERIAL_BASE_SCORES = {
  'vinyl': 5,
  'aluminum': 5.5,
  'wood': 7,
  'fiberglass': 7.5,
  'aluminum-clad wood': 8,
  'composite': 6.5,
};

/**
 * Material ceiling constraints — maximum net 2B (materials_durability) score.
 */
const MATERIAL_CEILINGS = {
  'vinyl': 7,
  'aluminum': 7,
  'wood': 9,
  'fiberglass': 9,
  'aluminum-clad wood': 10,
  'composite': 8,
};

/**
 * Component quality tier scores.
 */
const CQ_TIER_SCORES = {
  'premium': 8,
  'above_standard': 7,
  'standard': 5.5,
  'below_standard': 4,
  'unknown': 5,  // MIDPOINT per binary rule
};

/**
 * computeDeterministicScores — called by the orchestrator after Bot 2.
 * 
 * Accepts Bot 2's classifications (not scores) and deterministically computes
 * the 5 reformed subscores using rules, evidence data, and material hierarchy.
 *
 * @param {Object} bot2Parsed - Parsed Bot 2 evaluator JSON
 * @param {string} materialLock - Locked material class (e.g., 'Vinyl')
 * @param {Function|null} getMaterialCeiling - Optional function to get ceiling
 * @param {Object|null} evidenceData - Evidence file data (may be null if quarantined)
 * @returns {Object} 5 reformed subscores with scores and metadata
 */
function computeDeterministicScores(bot2Parsed, materialLock, getMaterialCeiling, evidenceData) {
  const scores = bot2Parsed.scores || {};
  // materialLock can be an object { found, rawText, source } or a plain string
  const rawMaterial = typeof materialLock === 'string' ? materialLock : (materialLock?.rawText || 'vinyl');
  const materialKey = rawMaterial.toLowerCase().trim();

  // ── 1. Component Quality (CQ) ───────────────────────────────────────────
  const cqData = scores.quality?.component_quality || {};
  const cqTier = (evidenceData?.component_quality?.tier || cqData.quality_tier || 'standard').toLowerCase();
  let cqScore = CQ_TIER_SCORES[cqTier] || CQ_TIER_SCORES['standard'];

  // Adjustments for specific documented features
  const weatherstripCoverage = cqData.weatherstrip_coverage || '';
  if (weatherstripCoverage === 'triple') cqScore += 0.3;
  else if (weatherstripCoverage === 'double') cqScore += 0.1;

  const balanceSystem = cqData.balance_system || '';
  if (balanceSystem === 'class_4' || balanceSystem === 'constant_force') cqScore += 0.2;

  // Cap at 10
  cqScore = Math.min(10, Math.round(cqScore * 10) / 10);

  // ── 2. Manufacturing Quality (MQ) ───────────────────────────────────────
  const mqData = scores.quality?.manufacturing_quality || {};
  let mqScore = 7; // base for manufacturer_own_factory

  const businessModel = mqData.business_model || '';
  if (businessModel === 'manufacturer_own_factory') mqScore = 7;
  else if (businessModel === 'contract_manufacturer') mqScore = 6;
  else if (businessModel === 'white_label') mqScore = 5;
  else mqScore = 6; // unknown defaults to mid

  // RED complaint adjustments
  const complaints = mqData.complaints || [];
  const redComplaints = complaints.filter(c => c.evidence_level === 'RED');
  const yellowComplaints = complaints.filter(c => c.evidence_level === 'YELLOW');

  // Only count complaints from curated score sources (not pinned evidence)
  for (const rc of redComplaints) {
    const isFromEvidence = (rc.source || '').toLowerCase().includes('pinned evidence');
    if (!isFromEvidence) {
      if (rc.classification === 'SAFETY') mqScore -= 1.5;
      else if (rc.classification === 'STRUCTURAL_DEFECT') mqScore -= 1.0;
      else mqScore -= 0.5;
    }
  }
  for (const yc of yellowComplaints) {
    const isFromEvidence = (yc.source || '').toLowerCase().includes('pinned evidence');
    if (!isFromEvidence) {
      mqScore -= 0.25;
    }
  }

  // Certification bonuses
  const certs = mqData.certifications || [];
  if (certs.includes('AAMA_GOLD_LABEL') || certs.includes('AAMA')) mqScore += 0.3;
  if (certs.includes('ENERGY_STAR')) mqScore += 0.2;

  mqScore = Math.max(2, Math.min(10, Math.round(mqScore * 10) / 10));

  // ── 3. Professional Consensus (PC) ──────────────────────────────────────
  const pcData = scores.quality?.professional_consensus || {};
  let pcScore = 5; // neutral default

  // Score from evidence file sources if available
  if (evidenceData?.professional_consensus?.sources?.length > 0) {
    const sources = evidenceData.professional_consensus.sources;
    let sentimentSum = 0;
    for (const src of sources) {
      if (src.sentiment === 'positive') sentimentSum += 1;
      else if (src.sentiment === 'mixed') sentimentSum += 0;
      else if (src.sentiment === 'negative') sentimentSum -= 1;
    }
    const avgSentiment = sentimentSum / sources.length;
    pcScore = 5 + (avgSentiment * 2.5); // maps -1..+1 to 2.5..7.5
  } else if (pcData.sources?.length > 0) {
    // Use Bot 2's source classifications
    const sources = pcData.sources;
    let sentimentSum = 0;
    let priceBiasCount = 0;
    for (const src of sources) {
      if (src.sentiment === 'positive') sentimentSum += 1;
      else if (src.sentiment === 'mixed') sentimentSum += 0;
      else if (src.sentiment === 'negative') sentimentSum -= 1;
      if (src.price_bias) priceBiasCount++;
    }
    const avgSentiment = sentimentSum / sources.length;
    pcScore = 5 + (avgSentiment * 2.5);

    // Penalty for insufficient source count
    if (sources.length < 3) pcScore -= 0.5;
    // Penalty for high price-bias ratio
    if (priceBiasCount > sources.length / 2) pcScore -= 0.5;
  }

  pcScore = Math.max(2, Math.min(10, Math.round(pcScore * 10) / 10));

  // ── 4. Materials Durability (MD) ────────────────────────────────────────
  const mdData = scores.durability?.materials_durability || {};
  const materialBase = MATERIAL_BASE_SCORES[materialKey] || 5;
  const ceilingResult = getMaterialCeiling ? getMaterialCeiling(rawMaterial) : null;
  // getMaterialCeiling can return an object { base, ceiling, label } or a number
  const materialCeiling = typeof ceilingResult === 'number' ? ceilingResult
    : (ceilingResult?.ceiling || MATERIAL_CEILINGS[materialKey] || 7);
  let mdScore = materialBase;

  // Adjustments from Bot 2 classifications
  const adjustments = mdData.adjustments_found || [];
  const adjustmentsApplied = [];

  for (const adj of adjustments) {
    const isFromEvidence = (adj.source || '').toLowerCase().includes('pinned evidence');
    if (isFromEvidence) continue; // skip pinned evidence adjustments

    if (adj.code === 'STRUCTURAL_DEFECT' || adj.code === 'RED_STRUCTURAL') {
      mdScore -= 1.0;
      adjustmentsApplied.push({ code: adj.code, value: -1.0, description: adj.description });
    } else if (adj.code === 'MULTI_CHAMBER') {
      mdScore += 0.5;
      adjustmentsApplied.push({ code: adj.code, value: 0.5, description: adj.description });
    } else if (adj.code === 'HEAT_FUSED') {
      mdScore += 0.3;
      adjustmentsApplied.push({ code: adj.code, value: 0.3, description: adj.description });
    }
  }

  // If no adjustments from Bot 2 but evidence has multi-chamber/construction data
  if (adjustmentsApplied.length === 0 && mdData.reasoning) {
    const reasoning = mdData.reasoning.toLowerCase();
    if (reasoning.includes('multi-chamber') || reasoning.includes('multichamber')) {
      mdScore += 0.5;
      adjustmentsApplied.push({ code: 'MULTI_CHAMBER_INFERRED', value: 0.5, description: 'Multi-chamber construction from Bot 2 reasoning' });
    }
  }

  // Apply ceiling
  const ceilingApplied = mdScore > materialCeiling;
  mdScore = Math.min(mdScore, materialCeiling);
  mdScore = Math.max(2, Math.round(mdScore * 10) / 10);

  // ── 5. Repairability (RP) ───────────────────────────────────────────────
  const rpData = scores.durability?.repairability || {};
  let rpScore = 5; // neutral default

  // IGU replacement method
  const igu = rpData.igu_replacement_method || '';
  if (igu === 'glass_swap') rpScore += 0.5;
  else if (igu === 'sash_replacement') rpScore -= 0.5;
  else if (igu === 'full_unit') rpScore -= 1.5;

  // Warranty
  const warrantyGlass = rpData.warranty_length_glass_years || 0;
  if (warrantyGlass >= 25) rpScore += 1.0;
  else if (warrantyGlass >= 20) rpScore += 0.5;
  else if (warrantyGlass >= 10) rpScore += 0;
  else rpScore -= 0.5;

  // Transferability
  if (rpData.warranty_transferable === true) rpScore += 0.5;
  else if (rpData.warranty_transferable === false) rpScore -= 0.3;

  // Service network
  const network = rpData.service_network || '';
  if (network === 'nationwide_dealer' || network === 'nationwide_direct') rpScore += 0.5;
  else if (network === 'regional') rpScore += 0;
  else rpScore -= 0.3;

  // Parts availability
  const partsYears = rpData.parts_availability_years || 0;
  if (partsYears >= 25) rpScore += 0.5;
  else if (partsYears >= 15) rpScore += 0.2;

  rpScore = Math.max(2, Math.min(10, Math.round(rpScore * 10) / 10));

  // ── Compute Axis Scores ─────────────────────────────────────────────────
  // Quality: CQ×0.35 + MQ×0.35 + PC×0.30
  const qualityAxis = Math.round(((cqScore * 0.35) + (mqScore * 0.35) + (pcScore * 0.30)) * 100) / 100;

  // Durability: FL×0.375 + MD×0.375 + RP×0.25
  // Frame longevity comes from Bot 2 (not reformed by deterministic scorer)
  const flScore = scores.durability?.frame_longevity?.score ?? 5;
  const durabilityAxis = Math.round(((flScore * 0.375) + (mdScore * 0.375) + (rpScore * 0.25)) * 100) / 100;

  // Performance: directly from Bot 2 (not reformed)
  const perfAxis = scores.performance?.axis_score
    || (((scores.performance?.thermal?.score ?? 5) +
         (scores.performance?.structural?.score ?? 5) +
         (scores.performance?.air_water?.score ?? 5)) / 3);
  const performanceAxis = Math.round(perfAxis * 100) / 100;

  // ── Load calibration config for geometric mean + axis stretch ───────────
  const calibConfig = loadCalibrationConfig('windows');
  const weights = calibConfig?.parameters?.axis_weights || { quality: 0.35, durability: 0.35, performance: 0.30 };
  const stretch = calibConfig?.parameters?.axis_stretch || {};

  // Apply axis stretch
  // Category ranges from existing scored products (approximate for windows DH)
  const categoryRanges = {
    quality: { min: 4.0, max: 8.5 },
    durability: { min: 4.5, max: 8.5 },
    performance: { min: 5.0, max: 9.0 },
  };

  const stretchedQ = stretchAxis(
    qualityAxis,
    stretch.quality_ceiling_bonus || 1.2,
    stretch.quality_floor_penalty || 0.9,
    categoryRanges.quality.min,
    categoryRanges.quality.max
  );
  const stretchedD = stretchAxis(
    durabilityAxis,
    stretch.durability_ceiling_bonus || 1.0,
    stretch.durability_floor_penalty || 1.5,
    categoryRanges.durability.min,
    categoryRanges.durability.max
  );
  const stretchedP = stretchAxis(
    performanceAxis,
    stretch.performance_ceiling_bonus || 1.2,
    stretch.performance_floor_penalty || 0.9,
    categoryRanges.performance.min,
    categoryRanges.performance.max
  );

  // Apply category ceilings
  const ceilings = calibConfig?.parameters?.category_ceilings || { quality: 1.0, durability: 1.0, performance: 1.0 };
  const finalQ = applyCeiling(stretchedQ, ceilings.quality);
  const finalD = applyCeiling(stretchedD, ceilings.durability);
  const finalP = applyCeiling(stretchedP, ceilings.performance);

  // Compute geometric mean
  const geoOverall = geometricMean(finalQ, finalD, finalP, weights);
  const displayScore = Math.round(geoOverall * 10); // 0-100 scale
  const overallScore = Math.round(geoOverall * 10) / 10; // 0-10 scale

  // Grade mapping
  const gradeTable = [
    { min: 9.3, grade: 'A+' }, { min: 9.0, grade: 'A' }, { min: 8.7, grade: 'A-' },
    { min: 8.3, grade: 'B+' }, { min: 8.0, grade: 'B' }, { min: 7.7, grade: 'B-' },
    { min: 7.3, grade: 'C+' }, { min: 7.0, grade: 'C' }, { min: 6.7, grade: 'C-' },
    { min: 6.3, grade: 'D+' }, { min: 6.0, grade: 'D' }, { min: 5.7, grade: 'D-' },
    { min: 0, grade: 'F' },
  ];
  const grade = gradeTable.find(g => overallScore >= g.min)?.grade || 'F';

  // ── Return results ──────────────────────────────────────────────────────
  return {
    component_quality: {
      score: cqScore,
      tier: cqTier,
      adjustments: { weatherstrip: weatherstripCoverage, balance: balanceSystem },
    },
    manufacturing_quality: {
      score: mqScore,
      business_model: businessModel,
      red_count: redComplaints.length,
      yellow_count: yellowComplaints.length,
      certifications: certs,
    },
    professional_consensus: {
      score: pcScore,
      source_count: (pcData.sources || []).length,
    },
    materials_durability: {
      score: mdScore,
      base: materialBase,
      material_class: rawMaterial,
      ceiling: materialCeiling,
      ceiling_applied: ceilingApplied,
      adjustments_applied: adjustmentsApplied,
    },
    repairability: {
      score: rpScore,
      igu_method: igu,
      warranty_glass_years: rpData.warranty_length_glass_years,
      warranty_transferable: rpData.warranty_transferable,
      service_network: network,
    },
    // Axis scores
    axis_scores: {
      quality: { raw: qualityAxis, stretched: Math.round(stretchedQ * 100) / 100, final: Math.round(finalQ * 100) / 100 },
      durability: { raw: durabilityAxis, stretched: Math.round(stretchedD * 100) / 100, final: Math.round(finalD * 100) / 100 },
      performance: { raw: performanceAxis, stretched: Math.round(stretchedP * 100) / 100, final: Math.round(finalP * 100) / 100 },
    },
    // Overall computed via geometric mean
    overall_score: overallScore,
    display_score: displayScore,
    grade: grade,
    scoring_method: 'geometric_mean_with_axis_stretch',
    calibration_version: calibConfig?.version || 'unknown',
  };
}

// ─── Module Exports ────────────────────────────────────────────────────────────

module.exports = {
  computeDeterministicScores,
  computeScore,
  rescoreProduct,
  getLabel,
  geometricMean,
  arithmeticMean,
  stretchAxis,
  applyCeiling,
  loadWeights,
  loadCalibrationConfig,
  getCategoryRanges,
  extractScoresFromBot2,
  LABELS
};
