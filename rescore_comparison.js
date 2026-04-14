/**
 * THE RESIDENTIALIST — Rescore Comparison Script
 * Extracts axis scores from bot2 output files and compares old arithmetic vs new geometric scoring.
 * 
 * Run: node rescore_comparison.js
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '/home/ubuntu/.openclaw/workspace/residentialist/.env' });

const { computeScore, arithmeticMean, loadWeights, loadCalibrationConfig, extractScoresFromBot2 } = require('./deterministic_scorer');

const WORKSPACE = process.env.OPENCLAW_WORKSPACE || '/home/ubuntu/.openclaw/workspace/residentialist';
const OUTPUTS_DIR = path.join(WORKSPACE, 'outputs');

// Get all unique product slugs (use the latest run for each)
const allDirs = fs.readdirSync(OUTPUTS_DIR).filter(d => {
  return fs.statSync(path.join(OUTPUTS_DIR, d)).isDirectory();
}).sort();

// Group by product slug (strip timestamp)
const productRuns = {};
for (const dir of allDirs) {
  const match = dir.match(/^(.+?)_(\d{4}-\d{2}-\d{2}T.+)$/);
  if (match) {
    const slug = match[1];
    if (!productRuns[slug]) productRuns[slug] = [];
    productRuns[slug].push(dir);
  }
}

console.log(`\n${'═'.repeat(120)}`);
console.log(`  THE RESIDENTIALIST — Rescore Comparison: Arithmetic vs Geometric Mean`);
console.log(`${'═'.repeat(120)}`);
console.log(`\n  Calibration: ${loadCalibrationConfig('windows')?.version || 'default'}`);
console.log(`  Weights: ${JSON.stringify(loadWeights('windows'))}`);
console.log(`  Products found: ${Object.keys(productRuns).length}\n`);

const results = [];

for (const [slug, runs] of Object.entries(productRuns)) {
  // Skip test data
  if (slug === 'product_name') continue;

  // Try all runs, latest first, until we find one with extractable scores
  let scores = null;
  let usedRun = null;
  for (let i = runs.length - 1; i >= 0; i--) {
    const runDir = path.join(OUTPUTS_DIR, runs[i]);
    const files = fs.readdirSync(runDir);
    const bot2File = files.find(f => f.includes('bot2'));
    if (!bot2File) continue;

    const bot2Content = fs.readFileSync(path.join(runDir, bot2File), 'utf8');
    scores = extractScoresFromBot2(bot2Content);
    if (scores) {
      usedRun = runs[i];
      break;
    }
  }

  if (!scores) {
    console.log(`  ⚠ Could not extract scores from any run of: ${slug} (${runs.length} runs)`);
    continue;
  }

  // Compute old arithmetic score
  const weights = loadWeights('windows');
  const oldOverall = arithmeticMean(scores.quality_score, scores.durability_score, scores.performance_score, weights);
  const oldDisplay = Math.round(oldOverall * 10);

  // Compute new geometric score with stretch
  const newResult = computeScore(scores, 'windows');

  results.push({
    slug,
    run: usedRun,
    quality: scores.quality_score,
    durability: scores.durability_score,
    performance: scores.performance_score,
    old_overall: oldOverall,
    old_display: oldDisplay,
    new_overall: newResult.overall_score,
    new_display: newResult.display_score,
    new_label: newResult.product_label,
    delta: newResult.display_score - oldDisplay,
    method: newResult.composite_method,
    q_stretched: newResult.axes_after_stretch.quality,
    d_stretched: newResult.axes_after_stretch.durability,
    p_stretched: newResult.axes_after_stretch.performance
  });
}

// Sort by new score descending
results.sort((a, b) => b.new_display - a.new_display);

// Print table
const header = `${'Product'.padEnd(35)} | ${'Q'.padStart(5)} | ${'D'.padStart(5)} | ${'P'.padStart(5)} | ${'Q→'.padStart(5)} | ${'D→'.padStart(5)} | ${'P→'.padStart(5)} | ${'Old'.padStart(4)} | ${'New'.padStart(4)} | ${'Δ'.padStart(4)} | Label`;
console.log(header);
console.log('─'.repeat(120));

for (const r of results) {
  const name = r.slug.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).padEnd(35).slice(0, 35);
  const q = r.quality.toFixed(1).padStart(5);
  const d = r.durability.toFixed(1).padStart(5);
  const p = r.performance.toFixed(1).padStart(5);
  const qs = r.q_stretched.toFixed(1).padStart(5);
  const ds = r.d_stretched.toFixed(1).padStart(5);
  const ps = r.p_stretched.toFixed(1).padStart(5);
  const old = r.old_display.toString().padStart(4);
  const nw = r.new_display.toString().padStart(4);
  const delta = (r.delta >= 0 ? '+' : '') + r.delta.toString();
  console.log(`${name} | ${q} | ${d} | ${p} | ${qs} | ${ds} | ${ps} | ${old} | ${nw} | ${delta.padStart(4)} | ${r.new_label}`);
}

console.log('─'.repeat(120));
console.log(`\n  LEGEND: Q/D/P = Raw axis scores (0-10) | Q→/D→/P→ = After axis stretch | Old = Arithmetic (0-100) | New = Geometric+Stretch (0-100) | Δ = Change\n`);

// Summary stats
const deltas = results.map(r => r.delta);
const avgDelta = deltas.reduce((a, b) => a + b, 0) / deltas.length;
const minDelta = Math.min(...deltas);
const maxDelta = Math.max(...deltas);
const spread = results[0]?.new_display - results[results.length - 1]?.new_display;
const oldSpread = Math.max(...results.map(r => r.old_display)) - Math.min(...results.map(r => r.old_display));

console.log(`  Summary:`);
console.log(`    Products scored:     ${results.length}`);
console.log(`    Avg score change:    ${avgDelta >= 0 ? '+' : ''}${avgDelta.toFixed(1)}`);
console.log(`    Min change:          ${minDelta >= 0 ? '+' : ''}${minDelta}`);
console.log(`    Max change:          ${maxDelta >= 0 ? '+' : ''}${maxDelta}`);
console.log(`    Old spread:          ${oldSpread} points (${Math.min(...results.map(r => r.old_display))}–${Math.max(...results.map(r => r.old_display))})`);
console.log(`    New spread:          ${spread} points (${results[results.length - 1]?.new_display}–${results[0]?.new_display})`);
console.log(`    Spread change:       ${spread - oldSpread >= 0 ? '+' : ''}${spread - oldSpread} points (wider is better)`);
console.log('');
