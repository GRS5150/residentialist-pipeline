/**
 * Score Engine — Lightweight score preview calculator
 *
 * Uses geometric mean formula matching the calibration scripts.
 * Reads axis weights from configs/{category}.json and product data from
 * calibration/{category}/config.json.
 *
 * Does NOT re-run the full calibration script — it calculates from
 * stored axis scores and spec adjustments only.
 */

const fs = require('fs');
const path = require('path');

/**
 * Calculate the geometric mean score from axis values and weights.
 * This matches the formula used in all score_*_calibration.js scripts.
 */
function geoMean(q, d, p, weights) {
  const w = {
    quality: weights.quality || 0.40,
    durability: weights.durability || 0.40,
    performance: weights.performance || 0.20
  };
  return Math.pow(q, w.quality) * Math.pow(d, w.durability) * Math.pow(p, w.performance) * 10;
}

/**
 * Determine tier from a composite score.
 */
function getTier(score) {
  if (score >= 90) return 1;
  if (score >= 75) return 2;
  if (score >= 60) return 3;
  if (score >= 40) return 4;
  return 5;
}

function tierLabel(tier) {
  const labels = { 1: 'Best in Class', 2: 'Excellent', 3: 'Good', 4: 'Fair', 5: 'Below Standard' };
  return labels[tier] || 'Unranked';
}

/**
 * Preview score change after a proposed modification.
 *
 * @param {string} workspace - Base workspace path
 * @param {string} category - Category slug
 * @param {string} productSlug - Product slug
 * @param {object} changes - What's changing:
 *   { type: 'remove_claim', axis: 'quality', specAdjDelta: -2 }
 *   { type: 'remove_source', independenceDelta: { independent: -1 } }
 * @returns {object} { scoreBefore, scoreAfter, tierBefore, tierAfter, delta, details }
 */
function previewScore(workspace, category, productSlug, changes) {
  // Load category config for weights
  const configPath = path.join(workspace, 'configs', `${category}.json`);
  let weights = { quality: 0.40, durability: 0.40, performance: 0.20 };
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    if (config.axis_weights) {
      weights = config.axis_weights;
    }
  } catch { /* use defaults */ }

  // Load calibration to find the product
  const calibPath = path.join(workspace, 'calibration', category, 'config.json');
  let product = null;
  try {
    const calib = JSON.parse(fs.readFileSync(calibPath, 'utf8'));
    product = (calib.calibration_products || []).find(p => p.slug === productSlug);
  } catch { /* */ }

  if (!product) {
    return { error: 'Product not found in calibration config' };
  }

  const axes = product.axis_scores || {};
  const specAdj = product.spec_adj || {};
  const q = axes.quality || 5;
  const d = axes.durability || 5;
  const p = axes.performance || 5;

  const scoreBefore = Math.round(geoMean(q, d, p, weights));
  const tierBefore = getTier(scoreBefore);

  let qAfter = q, dAfter = d, pAfter = p;
  let details = '';

  if (changes.type === 'remove_claim') {
    // Claim removal might affect spec adjustments
    const axis = changes.axis;
    const delta = changes.specAdjDelta || 0;

    if (axis === 'quality') {
      // Estimate: spec_adj contributes roughly proportionally to axis score
      // If we reduce spec_adj, axis score drops proportionally
      const currentAdj = specAdj.quality || 0;
      const adjRatio = currentAdj > 0 ? delta / currentAdj : 0;
      qAfter = Math.max(1, q + (adjRatio * (q - 5) * 0.3));
      details = `Quality axis adjusted: ${q.toFixed(1)} → ${qAfter.toFixed(1)} (spec adj change: ${delta})`;
    } else if (axis === 'durability') {
      const currentAdj = specAdj.durability || 0;
      const adjRatio = currentAdj > 0 ? delta / currentAdj : 0;
      dAfter = Math.max(1, d + (adjRatio * (d - 5) * 0.3));
      details = `Durability axis adjusted: ${d.toFixed(1)} → ${dAfter.toFixed(1)} (spec adj change: ${delta})`;
    } else if (axis === 'performance') {
      const currentAdj = specAdj.performance || 0;
      const adjRatio = currentAdj > 0 ? delta / currentAdj : 0;
      pAfter = Math.max(1, p + (adjRatio * (p - 5) * 0.3));
      details = `Performance axis adjusted: ${p.toFixed(1)} → ${pAfter.toFixed(1)} (spec adj change: ${delta})`;
    }
  } else if (changes.type === 'remove_source') {
    // Source removal doesn't change axis scores directly
    // Show independence ratio impact instead
    details = 'Source removal does not directly affect the composite score. Independence ratio may change.';
    qAfter = q;
    dAfter = d;
    pAfter = p;
  }

  const scoreAfter = Math.round(geoMean(qAfter, dAfter, pAfter, weights));
  const tierAfter = getTier(scoreAfter);

  return {
    scoreBefore,
    scoreAfter,
    tierBefore,
    tierAfter,
    tierLabelBefore: tierLabel(tierBefore),
    tierLabelAfter: tierLabel(tierAfter),
    delta: scoreAfter - scoreBefore,
    tierChanged: tierBefore !== tierAfter,
    details,
    weights
  };
}

module.exports = { previewScore, geoMean, getTier, tierLabel };
