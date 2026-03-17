
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Redirect stdout/stderr to log file
const logStream = fs.createWriteStream('/tmp/batch_rescore.log', { flags: 'a' });
const origLog = console.log;
const origErr = console.error;
console.log = (...args) => { const msg = args.join(' '); logStream.write(msg + '\n'); origLog(...args); };
console.error = (...args) => { const msg = args.join(' '); logStream.write('[ERROR] ' + msg + '\n'); origErr(...args); };

async function main() {
  try {
    console.log('[BATCH-WRAPPER] Starting at ' + new Date().toISOString());
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

    const results = [];
    for (let i = 0; i < PRODUCTS.length; i++) {
      const product = PRODUCTS[i];
      console.log('\n[BATCH] --- ' + (i + 1) + '/' + PRODUCTS.length + ': ' + product + ' ---');
      try {
        const result = await runWithAutoCorrection(product, 'DH', 'windows', [], { force: true });
        results.push({ product, status: result.status });
        console.log('[BATCH] ' + product + ': ' + result.status);
      } catch (err) {
        results.push({ product, status: 'ERROR', error: err.message });
        console.error('[BATCH] ' + product + ': ERROR - ' + err.message);
      }
    }

    console.log('\n[BATCH] === COMPLETE ===');
    console.log('[BATCH] ' + results.filter(r => r.status === 'PASS').length + '/' + PRODUCTS.length + ' passed');

    fs.writeFileSync(
      path.join(__dirname, 'outputs', 'phase9_rescore_summary.json'),
      JSON.stringify({ timestamp: new Date().toISOString(), results }, null, 2)
    );

    db.close();
    console.log('[BATCH-WRAPPER] Finished at ' + new Date().toISOString());
  } catch (err) {
    console.error('[BATCH-WRAPPER] FATAL: ' + err.message + '\n' + err.stack);
    process.exit(1);
  }
}

main();
