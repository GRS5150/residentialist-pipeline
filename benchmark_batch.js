const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const WORKSPACE = '/Users/Residentialist/.openclaw/workspace/residentialist';

const products = [
  { name: 'Reliabilt 3500', config: 'DH' },
  { name: 'Marvin Signature Ultimate', config: 'DH' },
  { name: 'Loewen', config: 'DH' },
  { name: 'Pella Impervia', config: 'DH' },
  { name: 'Ply Gem Pro Series', config: 'DH' },
  { name: 'Andersen E-Series', config: 'DH' }
];

function runProduct(product, config) {
  return new Promise((resolve, reject) => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`STARTING: ${product} (${config})`);
    console.log(`Time: ${new Date().toISOString()}`);
    console.log('='.repeat(60));

    const child = spawn('node', ['auto_runner.js', product, config, 'Windows'], {
      cwd: WORKSPACE,
      stdio: 'inherit'
    });

    child.on('close', (code) => {
      console.log(`\nFINISHED: ${product} — exit code ${code}`);
      console.log(`Time: ${new Date().toISOString()}`);
      resolve(code);
    });

    child.on('error', (err) => {
      console.error(`ERROR launching ${product}: ${err.message}`);
      resolve(1);
    });
  });
}

async function main() {
  console.log('BENCHMARK BATCH RUN');
  console.log(`Products: ${products.length}`);
  console.log(`Started: ${new Date().toISOString()}\n`);

  const results = [];
  for (const p of products) {
    const code = await runProduct(p.name, p.config);
    results.push({ product: p.name, exitCode: code, status: code === 0 ? 'PASS' : 'ESCALATED/ERROR' });
    // Brief pause between runs to let caches settle
    await new Promise(r => setTimeout(r, 3000));
  }

  console.log('\n' + '='.repeat(60));
  console.log('BATCH COMPLETE');
  console.log('='.repeat(60));
  results.forEach(r => console.log(`  ${r.product}: ${r.status} (exit ${r.exitCode})`));
  console.log(`\nFinished: ${new Date().toISOString()}`);
}

main().catch(e => console.error('BATCH FATAL:', e));
