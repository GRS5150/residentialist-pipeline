/**
 * THE RESIDENTIALIST — Deterministic Scorer Tests
 * Run: node test_scorer.js
 */

const {
  computeScore, getLabel, geometricMean, arithmeticMean,
  stretchAxis, applyCeiling, loadWeights, loadCalibrationConfig
} = require('./deterministic_scorer');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ ${message}`);
    passed++;
  } else {
    console.error(`  ❌ ${message}`);
    failed++;
  }
}

function approxEqual(a, b, tolerance = 0.5) {
  return Math.abs(a - b) <= tolerance;
}

console.log('\n=== DETERMINISTIC SCORER TESTS ===\n');

// ─── Label Tests ──────────────────────────────────────────────────────────────
console.log('Label mapping:');
assert(getLabel(95) === 'Best in Class', '95 → Best in Class');
assert(getLabel(90) === 'Best in Class', '90 → Best in Class');
assert(getLabel(82) === 'Excellent', '82 → Excellent');
assert(getLabel(75) === 'Excellent', '75 → Excellent');
assert(getLabel(65) === 'Good', '65 → Good');
assert(getLabel(60) === 'Good', '60 → Good');
assert(getLabel(50) === 'Fair', '50 → Fair');
assert(getLabel(40) === 'Fair', '40 → Fair');
assert(getLabel(30) === 'Below Standard', '30 → Below Standard');

// ─── Geometric Mean Tests ─────────────────────────────────────────────────────
console.log('\nGeometric mean:');
const weights = { quality: 0.35, durability: 0.35, performance: 0.30 };

// Balanced scores: geometric ≈ arithmetic
const geoBalanced = geometricMean(8, 8, 8, weights);
const arithBalanced = arithmeticMean(8, 8, 8, weights);
assert(approxEqual(geoBalanced, arithBalanced, 0.01), 
  `Balanced (8,8,8): geometric=${geoBalanced.toFixed(3)} ≈ arithmetic=${arithBalanced.toFixed(3)}`);

// Imbalanced: geometric < arithmetic (this is the key property)
const geoImbalanced = geometricMean(9, 5, 8, weights);
const arithImbalanced = arithmeticMean(9, 5, 8, weights);
assert(geoImbalanced < arithImbalanced,
  `Imbalanced (9,5,8): geometric=${geoImbalanced.toFixed(3)} < arithmetic=${arithImbalanced.toFixed(3)}`);

// Very imbalanced: bigger penalty
const geoVeryImbalanced = geometricMean(10, 3, 8, weights);
const arithVeryImbalanced = arithmeticMean(10, 3, 8, weights);
const penaltyMild = arithImbalanced - geoImbalanced;
const penaltySevere = arithVeryImbalanced - geoVeryImbalanced;
assert(penaltySevere > penaltyMild,
  `Higher imbalance = bigger penalty: mild=${penaltyMild.toFixed(3)}, severe=${penaltySevere.toFixed(3)}`);

// ─── Axis Stretch Tests ───────────────────────────────────────────────────────
console.log('\nAxis stretch:');
const stretched = stretchAxis(7.0, 1.2, 0.9, 5.35, 7.70);
assert(stretched > 7.0, `Stretch widens range: raw=7.0 → stretched=${stretched.toFixed(3)}`);

const stretchedMin = stretchAxis(5.35, 1.2, 0.9, 5.35, 7.70);
const stretchedMax = stretchAxis(7.70, 1.2, 0.9, 5.35, 7.70);
assert(stretchedMax > stretchedMin, `Stretch preserves order: min=${stretchedMin.toFixed(3)} < max=${stretchedMax.toFixed(3)}`);
assert(stretchedMax - stretchedMin > 7.70 - 5.35, `Stretch widens range: new=${(stretchedMax-stretchedMin).toFixed(3)} > old=${(7.70-5.35).toFixed(3)}`);

// ─── Category Ceiling Tests ───────────────────────────────────────────────────
console.log('\nCategory ceilings:');
assert(applyCeiling(8.0, 1.0) === 8.0, 'Ceiling 1.0 = no change');
assert(applyCeiling(8.0, 0.75) === 6.0, 'Ceiling 0.75 = capped');

// ─── Full Score Computation ───────────────────────────────────────────────────
console.log('\nFull score computation (windows):');
const result1 = computeScore({ quality_score: 7.5, durability_score: 8.0, performance_score: 7.8 }, 'windows');
console.log(`  Score: ${result1.display_score} — ${result1.product_label} (${result1.composite_method})`);
assert(result1.display_score >= 60 && result1.display_score <= 100, `Score in reasonable range: ${result1.display_score}`);
assert(result1.product_label !== null, `Label assigned: ${result1.product_label}`);
assert(result1.composite_method === 'geometric', `Uses geometric mean`);

const result2 = computeScore({ quality_score: 5.5, durability_score: 6.0, performance_score: 5.8 }, 'windows');
console.log(`  Budget score: ${result2.display_score} — ${result2.product_label}`);
assert(result2.display_score < result1.display_score, `Budget scores lower: ${result2.display_score} < ${result1.display_score}`);

// ─── Config Loading ───────────────────────────────────────────────────────────
console.log('\nConfig loading:');
const config = loadCalibrationConfig('windows');
if (config) {
  assert(config.version === 'windows_v1.0', `Config version: ${config.version}`);
  assert(config.parameters.composite_method === 'geometric', 'Config specifies geometric method');
  assert(config.parameters.axis_weights.quality === 0.35, 'Quality weight = 0.35');
} else {
  console.log('  ⚠ No calibration config found (expected if running outside workspace)');
}

const defaultWeights = loadWeights('nonexistent_category');
assert(defaultWeights.quality === 0.35, 'Default weights fallback: quality=0.35');
assert(defaultWeights.durability === 0.35, 'Default weights fallback: durability=0.35');
assert(defaultWeights.performance === 0.30, 'Default weights fallback: performance=0.30');

// ─── Summary ──────────────────────────────────────────────────────────────────
console.log(`\n${'='.repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
console.log('All tests passed! ✅\n');
