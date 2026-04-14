/**
 * THE RESIDENTIALIST — Production Rescore Script (Mac Mini)
 * Reads axis scores from DB (0-100 scale), converts to 0-10 for geometric mean scorer,
 * computes new scores with stretch, and updates DB. Prints before/after table.
 * 
 * Run: node rescore_production.js [--dry-run]
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const WORKSPACE = process.env.OPENCLAW_WORKSPACE || '/Users/Residentialist/.openclaw/workspace/residentialist';
const DB_PATH = path.join(WORKSPACE, 'residentialist.db');
const { computeScore, getLabel, arithmeticMean, loadWeights, loadCalibrationConfig } = require('./deterministic_scorer');

const DRY_RUN = process.argv.includes('--dry-run');

const db = new Database(DB_PATH);

// Get all products with scores
const products = db.prepare(`
  SELECT id, product_name, overall_score, quality_score, durability_score, performance_score, product_label
  FROM products 
  WHERE quality_score IS NOT NULL AND durability_score IS NOT NULL AND performance_score IS NOT NULL
  ORDER BY overall_score DESC
`).all();

console.log(`\n${'═'.repeat(130)}`);
console.log(`  THE RESIDENTIALIST — Production Rescore: Arithmetic → Geometric Mean${DRY_RUN ? ' [DRY RUN]' : ''}`);
console.log(`${'═'.repeat(130)}`);

const config = loadCalibrationConfig('windows');
console.log(`\n  Calibration: ${config?.version || 'default'}`);
console.log(`  Weights: ${JSON.stringify(loadWeights('windows'))}`);
console.log(`  Products to rescore: ${products.length}\n`);

const results = [];

for (const p of products) {
  // DB stores scores as 0-100 integers. Convert to 0-10 scale for scorer.
  const q10 = p.quality_score / 10;
  const d10 = p.durability_score / 10;
  const p10 = p.performance_score / 10;

  // Old score (simple arithmetic mean, already in DB as overall_score 0-100)
  const oldScore = p.overall_score;
  const oldLabel = p.product_label || getLabel(oldScore);

  // New geometric score
  const newResult = computeScore({
    quality_score: q10,
    durability_score: d10,
    performance_score: p10
  }, 'windows');

  results.push({
    id: p.id,
    name: p.product_name,
    q: p.quality_score,
    d: p.durability_score,
    p: p.performance_score,
    q_stretched: Math.round(newResult.axes_after_stretch.quality * 10),
    d_stretched: Math.round(newResult.axes_after_stretch.durability * 10),
    p_stretched: Math.round(newResult.axes_after_stretch.performance * 10),
    old_score: oldScore,
    old_label: oldLabel,
    new_score: newResult.display_score,
    new_label: newResult.product_label,
    delta: newResult.display_score - oldScore
  });
}

// Sort by new score descending
results.sort((a, b) => b.new_score - a.new_score);

// Print table
const header = `${'Product'.padEnd(32)} | ${'Q'.padStart(3)} | ${'D'.padStart(3)} | ${'P'.padStart(3)} | ${'Q→'.padStart(3)} | ${'D→'.padStart(3)} | ${'P→'.padStart(3)} | ${'Old'.padStart(4)} | ${'Old Label'.padEnd(16)} | ${'New'.padStart(4)} | ${'New Label'.padEnd(16)} | ${'Δ'.padStart(4)}`;
console.log(header);
console.log('─'.repeat(130));

for (const r of results) {
  const name = r.name.padEnd(32).slice(0, 32);
  const q = r.q.toString().padStart(3);
  const d = r.d.toString().padStart(3);
  const p = r.p.toString().padStart(3);
  const qs = r.q_stretched.toString().padStart(3);
  const ds = r.d_stretched.toString().padStart(3);
  const ps = r.p_stretched.toString().padStart(3);
  const old = r.old_score.toString().padStart(4);
  const oldLabel = r.old_label.padEnd(16);
  const nw = r.new_score.toString().padStart(4);
  const newLabel = r.new_label.padEnd(16);
  const delta = (r.delta >= 0 ? '+' : '') + r.delta.toString();
  console.log(`${name} | ${q} | ${d} | ${p} | ${qs} | ${ds} | ${ps} | ${old} | ${oldLabel} | ${nw} | ${newLabel} | ${delta.padStart(4)}`);
}

console.log('─'.repeat(130));
console.log(`\n  LEGEND: Q/D/P = Raw axis (0-100) | Q→/D→/P→ = After stretch (0-100) | Old/New = Composite (0-100) | Δ = Change\n`);

// Summary stats
const deltas = results.map(r => r.delta);
const avgDelta = deltas.reduce((a, b) => a + b, 0) / deltas.length;
const minDelta = Math.min(...deltas);
const maxDelta = Math.max(...deltas);
const newSpread = results[0]?.new_score - results[results.length - 1]?.new_score;
const oldSpread = Math.max(...results.map(r => r.old_score)) - Math.min(...results.map(r => r.old_score));

console.log(`  Summary:`);
console.log(`    Products rescored:   ${results.length}`);
console.log(`    Avg score change:    ${avgDelta >= 0 ? '+' : ''}${avgDelta.toFixed(1)}`);
console.log(`    Min change:          ${minDelta >= 0 ? '+' : ''}${minDelta}`);
console.log(`    Max change:          ${maxDelta >= 0 ? '+' : ''}${maxDelta}`);
console.log(`    Old spread:          ${oldSpread} points (${Math.min(...results.map(r => r.old_score))}–${Math.max(...results.map(r => r.old_score))})`);
console.log(`    New spread:          ${newSpread} points (${results[results.length - 1]?.new_score}–${results[0]?.new_score})`);
console.log(`    Spread change:       ${newSpread - oldSpread >= 0 ? '+' : ''}${newSpread - oldSpread} points`);

// Label distribution changes
const oldLabels = {};
const newLabels = {};
const labelChanges = [];
for (const r of results) {
  oldLabels[r.old_label] = (oldLabels[r.old_label] || 0) + 1;
  newLabels[r.new_label] = (newLabels[r.new_label] || 0) + 1;
  if (r.old_label !== r.new_label) {
    labelChanges.push(`    ${r.name}: ${r.old_label} → ${r.new_label}`);
  }
}
console.log(`\n  Label Distribution (Old → New):`);
for (const label of ['Best in Class', 'Excellent', 'Good', 'Fair', 'Below Standard']) {
  console.log(`    ${label.padEnd(16)}: ${(oldLabels[label]||0).toString().padStart(2)} → ${(newLabels[label]||0).toString().padStart(2)}`);
}
if (labelChanges.length) {
  console.log(`\n  Label Changes:`);
  labelChanges.forEach(c => console.log(c));
}

// If not dry run, update the DB
if (!DRY_RUN) {
  console.log(`\n  Updating database...`);
  const updateStmt = db.prepare(`
    UPDATE products SET 
      overall_score = ?, 
      product_label = ?, 
      score_version = COALESCE(score_version, 0) + 1,
      last_rescored = datetime('now'),
      calibration_version = ?
    WHERE id = ?
  `);

  const insertHistory = db.prepare(`
    INSERT INTO score_history (product_slug, action, old_score, new_score, notes, created_at)
    VALUES (?, 'rescore_geometric', ?, ?, ?, datetime('now'))
  `);

  const transaction = db.transaction(() => {
    for (const r of results) {
      updateStmt.run(r.new_score, r.new_label, config?.version || 'default', r.id);
      const slug = r.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
      insertHistory.run(slug, r.old_score, r.new_score, `Geometric mean rescore: ${r.old_score} → ${r.new_score} (Δ${r.delta >= 0 ? '+' : ''}${r.delta})`);
    }
  });

  transaction();
  console.log(`  ✅ ${results.length} products updated, score_history records created.`);
} else {
  console.log(`\n  [DRY RUN] No database changes made.`);
}

db.close();
console.log('');
