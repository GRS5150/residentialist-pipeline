#!/usr/bin/env node
/**
 * THE RESIDENTIALIST — Batch Deep Dive Runner
 * Processes 25 products sequentially through full_pipeline.js
 * Logs results, handles failures gracefully, 10s delay between products.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const WORKSPACE = __dirname;
const DB_PATH = path.join(WORKSPACE, 'residentialist.db');
const LOG_PATH = path.join(WORKSPACE, 'batch_results.log');
const NODE_PATH = process.execPath;
const DELAY_BETWEEN_PRODUCTS_MS = 10000;

const PRODUCTS = [
  // EXISTING — need real deep dives to replace old scores
  { name: 'Loewen', op: 'casement' },
  { name: 'Marvin Signature Ultimate', op: 'casement' },
  { name: 'Marvin Signature Ultimate', op: 'double_hung' },
  { name: 'Marvin Integrity', op: 'double_hung' },
  { name: 'Pella Impervia', op: 'casement' },
  { name: 'Andersen E-Series', op: 'casement' },
  { name: 'Andersen A-Series', op: 'double_hung' },
  { name: 'Sierra Pacific', op: 'double_hung' },
  { name: 'Simonton Reflections 5500', op: 'double_hung' },
  { name: 'JELD-WEN V2500', op: 'double_hung' },
  { name: 'Milgard Tuscany', op: 'double_hung' },
  { name: 'Ply Gem Pro Series', op: 'double_hung' },
  { name: 'Window World 4000', op: 'double_hung' },
  { name: 'Alpen Zenith ZR-7', op: 'casement' },
  // NEW — calibration targets and range fillers
  { name: 'Kolbe Ultra Series', op: 'casement' },
  { name: 'Marvin Elevate', op: 'double_hung' },
  { name: 'Marvin Essential', op: 'double_hung' },
  { name: 'Windsor Pinnacle Select', op: 'double_hung' },
  { name: 'Andersen E-Series', op: 'double_hung' },
  { name: 'Pella Lifestyle', op: 'double_hung' },
  { name: 'Milgard Trinsic', op: 'casement' },
  { name: 'Ply Gem Mira', op: 'double_hung' },
  { name: 'Harvey Tribute', op: 'double_hung' },
  { name: 'MI Windows 1620', op: 'double_hung' },
  { name: 'Sunrise Restorations', op: 'double_hung' },
];

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  fs.appendFileSync(LOG_PATH, line + '\n');
}

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

async function runProduct(product, index) {
  const { name, op } = product;
  const slug = slugify(name) + '_' + slugify(op);
  const startTime = Date.now();

  log(`\n[${ index + 1}/${PRODUCTS.length}] ━━━ ${name} (${op}) ━━━`);

  try {
    const result = execSync(
      `${NODE_PATH} full_pipeline.js "${name}" ${op}`,
      { cwd: WORKSPACE, encoding: 'utf-8', timeout: 600000, env: { ...process.env } }
    );

    const elapsed = Math.round((Date.now() - startTime) / 1000);

    // Extract score from progress file
    const progressPath = path.join(WORKSPACE, 'curation', `${slug}_pipeline_progress.json`);
    let score = '?', label = '?', sources = '?';
    if (fs.existsSync(progressPath)) {
      try {
        const progress = JSON.parse(fs.readFileSync(progressPath, 'utf8'));
        score = progress.score || '?';
        label = progress.label || '?';
      } catch (_) {}
    }

    // Get source count from curation file
    const curationPath = path.join(WORKSPACE, 'curation', `${slug}_sources.json`);
    if (fs.existsSync(curationPath)) {
      try {
        const curation = JSON.parse(fs.readFileSync(curationPath, 'utf8'));
        sources = (curation.sources || []).filter(s => s.classification === 'score').length;
      } catch (_) {}
    }

    log(`  ✅ ${name}: ${score}/100 (${label}) — ${sources} score sources — ${elapsed}s`);
    return { name, op, score, label, sources, elapsed, status: 'success' };

  } catch (err) {
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    const errMsg = (err.stderr || err.message || '').substring(0, 200);

    // Check if it was an evidence guard rejection
    if (errMsg.includes('INSUFFICIENT EVIDENCE')) {
      log(`  ⚠️  ${name}: INSUFFICIENT EVIDENCE — ${elapsed}s`);
      return { name, op, score: 'N/A', label: 'insufficient_evidence', sources: '<5', elapsed, status: 'insufficient_evidence' };
    }

    log(`  ❌ ${name}: FAILED — ${errMsg} — ${elapsed}s`);
    return { name, op, score: 'ERR', label: 'failed', sources: '?', elapsed, status: 'failed', error: errMsg };
  }
}

async function main() {
  const batchStart = Date.now();

  // Clear log
  fs.writeFileSync(LOG_PATH, '');
  log('═══════════════════════════════════════════════════════════════════');
  log('  RESIDENTIALIST BATCH DEEP DIVE — 25 Products');
  log('  Started: ' + new Date().toISOString());
  log('═══════════════════════════════════════════════════════════════════');

  const results = [];

  for (let i = 0; i < PRODUCTS.length; i++) {
    const result = await runProduct(PRODUCTS[i], i);
    results.push(result);

    // 10 second delay between products (except after last)
    if (i < PRODUCTS.length - 1) {
      log(`  ⏳ Waiting 10s before next product...`);
      await new Promise(r => setTimeout(r, DELAY_BETWEEN_PRODUCTS_MS));
    }
  }

  // ── Summary ──────────────────────────────────────────────────────────
  const batchElapsed = Math.round((Date.now() - batchStart) / 1000);
  const succeeded = results.filter(r => r.status === 'success').length;
  const failed = results.filter(r => r.status === 'failed').length;
  const insufficient = results.filter(r => r.status === 'insufficient_evidence').length;

  log('\n\n═══════════════════════════════════════════════════════════════════');
  log('  BATCH RESULTS');
  log('═══════════════════════════════════════════════════════════════════');
  log(`  Total: ${PRODUCTS.length} | Succeeded: ${succeeded} | Failed: ${failed} | Insufficient: ${insufficient}`);
  log(`  Total time: ${Math.round(batchElapsed / 60)} minutes`);
  log('');
  log('  ' + 'Product'.padEnd(35) + 'Type'.padEnd(14) + 'Score'.padStart(6) + '  ' + 'Label'.padEnd(18) + 'Sources'.padStart(8) + '  Time');
  log('  ' + '─'.repeat(95));

  for (const r of results) {
    log('  ' + r.name.padEnd(35) + r.op.padEnd(14) + String(r.score).padStart(6) + '  ' + (r.label || '').padEnd(18) + String(r.sources).padStart(8) + '  ' + r.elapsed + 's');
  }

  // ── Database Summary ─────────────────────────────────────────────────
  log('\n\n═══════════════════════════════════════════════════════════════════');
  log('  FULL DATABASE SUMMARY (all products, sorted by score)');
  log('═══════════════════════════════════════════════════════════════════');

  try {
    const Database = require('better-sqlite3');
    const db = new Database(DB_PATH, { readonly: true });
    const rows = db.prepare(`
      SELECT product_name, overall_score, product_label, health_label, deep_dive_status
      FROM products
      WHERE overall_score IS NOT NULL
      ORDER BY overall_score DESC
    `).all();
    db.close();

    log('');
    log('  ' + 'Product'.padEnd(35) + 'Score'.padStart(6) + '  ' + 'Label'.padEnd(18) + 'Health'.padEnd(18) + 'Status');
    log('  ' + '─'.repeat(95));

    for (const row of rows) {
      log('  ' + (row.product_name || '').padEnd(35) + String(row.overall_score || '').padStart(6) + '  ' + (row.product_label || '').padEnd(18) + (row.health_label || '').padEnd(18) + (row.deep_dive_status || ''));
    }
  } catch (err) {
    log('  DB query failed: ' + err.message);
  }

  log('\n═══════════════════════════════════════════════════════════════════');
  log('  BATCH COMPLETE');
  log('═══════════════════════════════════════════════════════════════════');
}

main().catch(err => {
  log('FATAL: ' + err.message);
  process.exit(1);
});
