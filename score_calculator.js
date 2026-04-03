/**
 * THE RESIDENTIALIST — Score Calculator (Step 3) — Tier-Based v1
 * Pure math. No LLM calls.
 * Takes a tier classification + spec highlights → final 0-100 score.
 * Positions within tier based on anchor proximity and verified specs.
 */

const fs = require('fs');
const path = require('path');

// ─── Label System ──────────────────────────────────────────────────────────────

function getLabel(score) {
  if (score >= 90) return 'Best in Class';
  if (score >= 75) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Below Standard';
}

function getHealthLabel(score) {
  if (score >= 9.0) return 'Excellent';
  if (score >= 8.0) return 'Good';
  if (score >= 7.0) return 'Moderate';
  return 'Material Concern';
}

function getGrade(overallScore) {
  const table = [
    { min: 9.3, grade: 'A+' }, { min: 9.0, grade: 'A' }, { min: 8.7, grade: 'A-' },
    { min: 8.3, grade: 'B+' }, { min: 8.0, grade: 'B' }, { min: 7.7, grade: 'B-' },
    { min: 7.3, grade: 'C+' }, { min: 7.0, grade: 'C' }, { min: 6.7, grade: 'C-' },
    { min: 6.3, grade: 'D+' }, { min: 6.0, grade: 'D' }, { min: 5.7, grade: 'D-' },
    { min: 0, grade: 'F' },
  ];
  return table.find(g => overallScore >= g.min)?.grade || 'F';
}

// ─── Tier Ranges ───────────────────────────────────────────────────────────────

const TIER_RANGES = {
  1: { min: 90, max: 100, midpoint: 95 },
  2: { min: 75, max: 89, midpoint: 82 },
  3: { min: 60, max: 74, midpoint: 67 },
  4: { min: 40, max: 59, midpoint: 50 },
  5: { min: 0, max: 39, midpoint: 30 }
};

// ─── Anchor Positioning ────────────────────────────────────────────────────────

function anchorOffset(aboveOrBelow, range) {
  const upperHalf = range.max - range.midpoint;
  const lowerHalf = range.midpoint - range.min;
  const ab = (aboveOrBelow || '').toLowerCase().trim();

  if (ab === 'clearly above' || ab === 'well above') return Math.round(upperHalf * 0.6);
  if (ab === 'slightly above' || ab === 'above') return Math.round(upperHalf * 0.3);
  if (ab === 'equal' || ab === 'roughly equal' || ab === 'comparable') return 0;
  if (ab === 'matches anchor' || ab === 'matches exactly' || ab === 'exact match' || ab === 'equivalent') return 0;
  if (ab === 'slightly below' || ab === 'below') return -Math.round(lowerHalf * 0.3);
  if (ab === 'clearly below' || ab === 'well below') return -Math.round(lowerHalf * 0.6);
  return 0; // default: no offset
}

// ─── Spec Adjustments ──────────────────────────────────────────────────────────

function computeSpecAdjustments(specs, tier, category) {
  let adjustment = 0;
  const details = [];

  if (!specs) return { adjustment: 0, details: ['No spec highlights available'] };

  if (category === 'countertops') {
    // ── v2 Countertop Spec Adjustments ──────────────────────────────────

    // PERFORMANCE: Heat resistance (continuous)
    const heatF = parseFloat(specs.heat_resistance_f);
    if (!isNaN(heatF)) {
      if (heatF >= 1000) { adjustment += 2; details.push(`Heat ${heatF}°F: hot-pan-proof (+2)`); }
      else if (heatF >= 300) { adjustment += 1; details.push(`Heat ${heatF}°F: moderate tolerance (+1)`); }
      else if (heatF >= 200) { details.push(`Heat ${heatF}°F: base (0)`); }
      else { adjustment -= 1; details.push(`Heat ${heatF}°F: heat-vulnerable (-1)`); }
    }

    // PERFORMANCE: Mohs hardness (continuous)
    const mohs = parseFloat(specs.mohs_hardness);
    if (!isNaN(mohs)) {
      if (mohs >= 7) { adjustment += 1; details.push(`Mohs ${mohs}: scratch-proof (+1)`); }
      else if (mohs >= 5) { details.push(`Mohs ${mohs}: base (0)`); }
      else { adjustment -= 1; details.push(`Mohs ${mohs}: scratches from normal use (-1)`); }
    }

    // PERFORMANCE: Water absorption (continuous)
    const waterAbs = parseFloat(specs.water_absorption_pct);
    if (!isNaN(waterAbs)) {
      if (waterAbs < 0.05) { adjustment += 1; details.push(`Water absorption ${waterAbs}%: virtually non-porous (+1)`); }
      else if (waterAbs <= 0.4) { details.push(`Water absorption ${waterAbs}%: within ASTM spec (0)`); }
      else { adjustment -= 1; details.push(`Water absorption ${waterAbs}%: above ASTM C615 max (-1)`); }
    }

    // PERFORMANCE: Impact resistance (categorical — test-based)
    const impact = (specs.impact_resistance || '').toLowerCase();
    if (impact === 'no_failures' || impact === 'pass' || impact === 'no failures') {
      adjustment += 1; details.push('Impact: confirmed safe in testing (+1)');
    } else if (impact === 'documented_failures' || impact === 'fail' || impact === 'split' || impact === 'documented failures') {
      adjustment -= 2; details.push('Impact: documented cracking/splitting (-2)');
    } else {
      details.push('Impact: no test data (0)');
    }

    // DURABILITY: Flexural strength (continuous)
    const flexural = parseFloat(specs.flexural_strength_psi);
    if (!isNaN(flexural)) {
      if (flexural >= 8000) { adjustment += 1; details.push(`Flexural ${flexural} psi: top-tier (+1)`); }
      else if (flexural >= 4000) { details.push(`Flexural ${flexural} psi: adequate (0)`); }
      else { adjustment -= 1; details.push(`Flexural ${flexural} psi: weakness under load (-1)`); }
    }

    // DURABILITY: Repairability (categorical)
    const repair = (specs.repairability || '').toLowerCase();
    if (repair === 'full') { adjustment += 1; details.push('Repairability: full — sand and buff (+1)'); }
    else if (repair === 'partial') { details.push('Repairability: partial — fill chips (0)'); }
    else if (repair === 'minimal' || repair === 'none') { adjustment -= 1; details.push(`Repairability: ${repair} — replace slab (-1)`); }

    // DURABILITY: Warranty transferable
    if (specs.warranty_transferable === true) {
      adjustment += 1; details.push('Warranty transferable (+1)');
    } else {
      details.push('Warranty not transferable (0)');
    }

    // QUALITY: Certification bundle — REMOVED from composite
    // Health certs (Greenguard Gold, NSF 51) are Material Safety report-only per methodology.
    // They do not affect composite score. Logged for transparency.
    const certCount = parseInt(specs.certification_count) || 0;
    const hasCerts = certCount > 0 || specs.greenguard_gold === true || specs.nsf_51 === true;
    if (hasCerts) {
      details.push(`Cert bundle (${certCount || 'some'} certs): report-only, no composite impact`);
    }

    // QUALITY: Source traceability (replaces domestic_manufacturing)
    const traceability = (specs.source_traceability || '').toLowerCase();
    if (traceability === 'single_source') {
      adjustment += 1; details.push('Source traceability: single_source (+1)');
    } else if (traceability === 'unknown') {
      adjustment -= 1; details.push('Source traceability: unknown (-1)');
    } else if (traceability === 'multi_source') {
      details.push('Source traceability: multi_source (0)');
    } else if (specs.domestic_manufacturing === true) {
      // Backward compat: old field maps to single_source
      adjustment += 1; details.push('Source traceability: single_source via domestic_manufacturing (+1)');
    } else {
      details.push('Source traceability: not specified (0)');
    }
  } else if (category === 'windows') {
    // U-factor
    const uFactor = parseFloat(specs.u_factor);
    if (!isNaN(uFactor)) {
      if (uFactor < 0.20) { adjustment += 3; details.push(`U-factor ${uFactor}: exceptional (+3)`); }
      else if (uFactor < 0.25) { adjustment += 1; details.push(`U-factor ${uFactor}: above average (+1)`); }
      else if (uFactor > 0.32) { adjustment -= 2; details.push(`U-factor ${uFactor}: below average (-2)`); }
      else if (uFactor > 0.28) { adjustment -= 1; details.push(`U-factor ${uFactor}: slightly below average (-1)`); }
      else { details.push(`U-factor ${uFactor}: average (0)`); }
    }

    // Air infiltration
    const airInf = parseFloat(specs.air_infiltration);
    if (!isNaN(airInf)) {
      if (airInf <= 0.02) { adjustment += 2; details.push(`Air infiltration ${airInf}: best in class (+2)`); }
      else if (airInf <= 0.10) { adjustment += 1; details.push(`Air infiltration ${airInf}: good (+1)`); }
      else if (airInf >= 0.30) { adjustment -= 2; details.push(`Air infiltration ${airInf}: at AAMA minimum (-2)`); }
      else if (airInf >= 0.20) { adjustment -= 1; details.push(`Air infiltration ${airInf}: below average (-1)`); }
      else { details.push(`Air infiltration ${airInf}: average (0)`); }
    }

    // DP rating — thresholds vary by operation type
    const dp = parseInt(specs.dp_rating);
    const opType = ((specs._operation_type || tierResult?.operation_type || '') + '').toLowerCase();
    if (!isNaN(dp)) {
      let dpAdj = 0;
      if (opType === 'slider' || opType === 'sliding') {
        if (dp >= 60) { dpAdj = 3; } else if (dp >= 45) { dpAdj = 2; } else if (dp >= 30) { dpAdj = 1; } else if (dp >= 20) { dpAdj = 0; } else { dpAdj = -2; }
      } else if (opType === 'double_hung' || opType === 'single_hung' || opType === 'dh') {
        if (dp >= 65) { dpAdj = 3; } else if (dp >= 50) { dpAdj = 2; } else if (dp >= 35) { dpAdj = 1; } else if (dp >= 25) { dpAdj = 0; } else { dpAdj = -2; }
      } else {
        // Fixed, casement, awning
        if (dp >= 70) { dpAdj = 3; } else if (dp >= 55) { dpAdj = 2; } else if (dp >= 40) { dpAdj = 1; } else if (dp >= 30) { dpAdj = 0; } else { dpAdj = -2; }
      }
      adjustment += dpAdj;
      details.push(`DP${dp} (${opType || 'default'}): ${dpAdj > 0 ? '+' : ''}${dpAdj}`);
    }

    // Warranty — transferability
    if (specs.warranty_transferable === false) {
      adjustment -= 2;
      details.push('Warranty non-transferable: significant negative (-2)');
    } else if (specs.warranty_transferable === true) {
      adjustment += 1;
      details.push('Warranty transferable (+1)');
    }

    // Warranty — labor coverage
    const laborYears = parseInt(specs.warranty_labor_years);
    if (!isNaN(laborYears)) {
      if (laborYears >= 10) { adjustment += 1; details.push(`Labor warranty ${laborYears}yr: strong (+1)`); }
      else if (laborYears <= 2) { adjustment -= 1; details.push(`Labor warranty ${laborYears}yr: minimal (-1)`); }
    }

    // Warranty — glass coverage
    const glassYears = parseInt(specs.warranty_glass_years);
    if (!isNaN(glassYears)) {
      if (glassYears >= 25) { adjustment += 1; details.push(`Glass warranty ${glassYears}yr: excellent (+1)`); }
      else if (glassYears < 10) { adjustment -= 1; details.push(`Glass warranty ${glassYears}yr: short (-1)`); }
    }

    // Frame material class relative to tier
    const material = (specs.frame_material || '').toLowerCase();
    if (tier >= 3) {
      if (material.includes('fiberglass') || material.includes('pultruded')) {
        adjustment += 1;
        details.push('Fiberglass frame in mid/lower tier: above-class material (+1)');
      }
    }
    if (tier <= 2) {
      if (material.includes('vinyl') || material.includes('pvc')) {
        adjustment -= 2;
        details.push('Vinyl frame in premium tier: below-class material (-2)');
      }
    }
  }

  // Cap total adjustment at ±8 points
  adjustment = Math.max(-8, Math.min(8, adjustment));

  return { adjustment, details };
}

// ─── Operation Type Adjustment ─────────────────────────────────────────────────

function operationTypeAdjustment(operationType) {
  const adjustments = {
    'casement': 3,
    'awning': 2,
    'double_hung': 0,
    'single_hung': -1,
    'slider': -1,
    'sliding': -1,
    'fixed': 4,
    'picture': 4
  };
  const op = (operationType || '').toLowerCase().replace(/[^a-z_]/g, '');
  return adjustments[op] || 0;
}

// ─── Derive Axis Scores for Display ────────────────────────────────────────────

function deriveAxisScores(tier, specs, overallScore) {
  const base = overallScore / 10;

  let quality = base;
  const material = ((specs && specs.frame_material) || '').toLowerCase();
  if (material.includes('wood') || material.includes('aluminum-clad')) quality += 0.5;
  else if (material.includes('fiberglass')) quality += 0.2;
  else if (material.includes('vinyl')) quality -= 0.3;

  let durability = base;
  if (specs && specs.warranty_transferable === true) durability += 0.3;
  if (specs && specs.warranty_transferable === false) durability -= 0.5;
  const glassYears = specs ? parseInt(specs.warranty_glass_years) : NaN;
  if (!isNaN(glassYears) && glassYears >= 20) durability += 0.3;

  let performance = base;
  const uFactor = specs ? parseFloat(specs.u_factor) : NaN;
  if (!isNaN(uFactor) && uFactor < 0.25) performance += 0.5;
  if (!isNaN(uFactor) && uFactor > 0.30) performance -= 0.3;

  return {
    quality: Math.round(Math.max(1, Math.min(10, quality)) * 10),
    durability: Math.round(Math.max(1, Math.min(10, durability)) * 10),
    performance: Math.round(Math.max(1, Math.min(10, performance)) * 10)
  };
}

// ─── Material Health ───────────────────────────────────────────────────────────

function computeHealthScore(specs, category) {
  const { getHealthScore } = require('./config_loader');

  if (category === 'countertops') {
    const materialClass = (specs && specs.material_class) || '';
    return getHealthScore(materialClass, category);
  }

  // Windows: use frame_material
  const material = ((specs && specs.frame_material) || '').toLowerCase();
  return getHealthScore(material, category);
}

// ─── Main Compute Function ─────────────────────────────────────────────────────

/**
 * Compute final score from tier classification + spec highlights.
 * @param {object} tierResult - Sonnet tier classification (possibly with Haiku-adjusted tier)
 * @param {string} category - Product category
 * @param {string} outputDir - Output directory (for compatibility)
 * @returns {object} Final score result
 */
function compute(tierResult, category, outputDir) {
  const tier = tierResult.tier;
  const specs = tierResult.spec_highlights || {};
  const aboveOrBelow = tierResult.above_or_below_anchor || 'equal';
  const operationType = tierResult.operation_type || 'double_hung';

  // Inject operation type into specs so DP rating calc can use it
  specs._operation_type = operationType;

  // Override specs with verified_specs from DB when available
  try {
    const Database = require('better-sqlite3');
    const dbPath = path.join(WORKSPACE, 'residentialist.db');
    if (fs.existsSync(dbPath)) {
      const db = new Database(dbPath, { readonly: true });
      const productSlug = (tierResult.product_name || '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') + '_' + operationType;
      const rows = db.prepare("SELECT spec_name, normalized_value, confidence FROM verified_specs WHERE product_slug = ?").all(productSlug);
      let overrideCount = 0;
      for (const row of rows) {
        if (row.confidence === 'conflicting') {
          console.log(`[SCORE_CALC] Skipping conflicting spec: ${row.spec_name} (needs review)`);
          continue;
        }
        if (row.confidence === 'verified' || row.confidence === 'bot_found') {
          const specMap = { u_factor: 'u_factor', shgc: 'shgc', air_infiltration: 'air_infiltration', dp_rating: 'dp_rating', warranty_transferable: 'warranty_transferable', glass_warranty: 'warranty_glass_years', labor_warranty: 'warranty_labor_years', frame_material: 'frame_material' };
          const targetKey = specMap[row.spec_name];
          if (targetKey) {
            const oldVal = specs[targetKey];
            if (row.spec_name === 'warranty_transferable') {
              specs[targetKey] = row.normalized_value === 'yes' || row.normalized_value === 'true';
            } else {
              specs[targetKey] = row.normalized_value;
            }
            if (String(oldVal) !== String(specs[targetKey])) {
              console.log(`[SCORE_CALC] Verified spec override: ${targetKey} ${oldVal} → ${specs[targetKey]} (${row.confidence})`);
              overrideCount++;
            }
          }
        }
      }
      db.close();
      if (overrideCount > 0) console.log(`[SCORE_CALC] ${overrideCount} spec(s) overridden from verified_specs`);
    }
  } catch (err) {
    // Non-fatal — fall back to Sonnet specs
  }

  if (!TIER_RANGES[tier]) {
    throw new Error(`Invalid tier: ${tier}`);
  }

  const range = TIER_RANGES[tier];

  // Start at anchor target score if available, otherwise tier midpoint
  let startScore = range.midpoint;
  const closestAnchor = (tierResult.closest_anchor || '').toLowerCase();
  try {
    const { loadConfig } = require('./config_loader');
    const config = loadConfig(category);
    const tierKey = 'tier_' + tier;
    const tierAnchors = config.tier_anchors?.[tierKey]?.anchors || [];
    for (const anchor of tierAnchors) {
      if (closestAnchor.includes(anchor.product.toLowerCase()) || anchor.product.toLowerCase().includes(closestAnchor)) {
        startScore = anchor.target_score;
        break;
      }
    }
  } catch (_) { /* fall back to midpoint */ }

  let score = startScore;

  // Position within tier based on anchor proximity
  const anchorAdj = anchorOffset(aboveOrBelow, range);
  score += anchorAdj;
  console.log(`[SCORE_CALC] Tier ${tier} (${range.min}-${range.max}), start=${startScore}${startScore !== range.midpoint ? ' (anchor target)' : ' (midpoint)'}, anchor="${aboveOrBelow}" → ${anchorAdj > 0 ? '+' : ''}${anchorAdj}`);

  // Spec adjustments
  const { adjustment: specAdj, details: specDetails } = computeSpecAdjustments(specs, tier, category);
  score += specAdj;
  console.log(`[SCORE_CALC] Spec adjustments: ${specAdj > 0 ? '+' : ''}${specAdj} (${specDetails.length} factors)`);
  for (const d of specDetails) console.log(`[SCORE_CALC]   ${d}`);

  // Operation type adjustment (windows only)
  let opAdj = 0;
  if (category === 'windows') {
    opAdj = operationTypeAdjustment(operationType);
    score += opAdj;
    if (opAdj !== 0) console.log(`[SCORE_CALC] Operation type "${operationType}": ${opAdj > 0 ? '+' : ''}${opAdj}`);
  }

  // Clamp to tier range, with reserved range enforcement for countertops
  let effectiveMax = range.max;
  if (category === 'countertops') {
    try {
      const { loadConfig } = require('./config_loader');
      const ctConfig = loadConfig('countertops');
      const tierEffMax = ctConfig.deterministic_adjustments?.tier_1_effective_max;
      if (tier === 1 && tierEffMax) {
        effectiveMax = tierEffMax;
      }
    } catch (_) {}
  }
  score = Math.max(range.min, Math.min(effectiveMax, score));
  console.log(`[SCORE_CALC] Final score: ${score}/100 (clamped to ${range.min}-${effectiveMax})`);

  const label = getLabel(score);
  const grade = getGrade(score / 10);
  const healthScore = computeHealthScore(specs, category);
  const healthLabel = getHealthLabel(healthScore);

  // Derive axis scores for display
  const axes = deriveAxisScores(tier, specs, score);

  const result = {
    display_score: score,
    product_label: label,
    health_label: healthLabel,
    grade: grade,
    tier: tier,
    tier_label: tierResult.tier_label,
    closest_anchor: tierResult.closest_anchor,
    above_or_below_anchor: aboveOrBelow,
    quality_raw: axes.quality / 10,
    durability_raw: axes.durability / 10,
    performance_raw: axes.performance / 10,
    quality_stretched: axes.quality / 10,
    durability_stretched: axes.durability / 10,
    performance_stretched: axes.performance / 10,
    anchor_adjustment: anchorAdj,
    spec_adjustment: specAdj,
    spec_details: specDetails,
    operation_type_adjustment: opAdj,
    method: 'tier_classification_v1',
    calibration_version: 'tier_v1',
    computed_at: new Date().toISOString()
  };

  return result;
}

module.exports = { compute, getLabel, getHealthLabel, getGrade, deriveAxisScores, operationTypeAdjustment, computeSpecAdjustments, TIER_RANGES };
