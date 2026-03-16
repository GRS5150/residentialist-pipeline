/**
 * Phase 9 Batch Re-Score — runs all 17 windows sequentially with --force
 * Deployed to Mac Mini, runs via: node batch_rescore.js
 */

const { runWithAutoCorrection } = require('./auto_runner');
const db = require('./db');

const PRODUCTS = [
  'Alpen Zenith ZR-7',
  'Andersen 100 Series',
  'Andersen 400 Series',
  'Andersen A-Series',
  'Andersen E-Series',
  'JELD-WEN V2500',
  'Loewen',
  'Marvin Integrity',
  'Marvin Signature Ultimate',
  'Milgard Tuscany',
  'Pella 250 Series',
  'Pella Impervia',
  'Ply Gem Pro Series',
  'Reliabilt 3500',
  'Sierra Pacific',
  'Simonton Reflections 5500',
  'Window World 4000',
];

async function batchRescore() {
  console.log(`[BATCH] Phase 9 re-score: ${PRODUCTS.length} products`);
  const results = [];

  for (let i = 0; i < PRODUCTS.length; i++) {
    const product = PRODUCTS[i];
    console.log(`\n[BATCH] ─── ${i + 1}/${PRODUCTS.length}: ${product} ───`);
    try {
      const result = await runWithAutoCorrection(product, 'DH', 'windows', [], { force: true });
      results.push({ product, status: result.status, overall: result.bot2Parsed?.overall_score || null });
      console.log(`[BATCH] ${product}: ${result.status}`);
    } catch (err) {
      results.push({ product, status: 'ERROR', error: err.message });
      console.error(`[BATCH] ${product}: ERROR — ${err.message}`);
    }
  }

  console.log('\n[BATCH] ═══ COMPLETE ═══');
  console.log(`[BATCH] ${results.filter(r => r.status === 'PASS').length}/${PRODUCTS.length} passed`);
  for (const r of results) {
    console.log(`  ${r.product}: ${r.status}${r.overall ? ' (' + r.overall + ')' : ''}${r.error ? ' — ' + r.error : ''}`);
  }

  // Write summary file
  const fs = require('fs');
  const path = require('path');
  fs.writeFileSync(
    path.join(__dirname, 'outputs', 'phase9_rescore_summary.json'),
    JSON.stringify({ timestamp: new Date().toISOString(), results }, null, 2)
  );

  db.close();
}

batchRescore().catch(err => {
  console.error('[BATCH] FATAL:', err);
  db.close();
  process.exit(1);
});
