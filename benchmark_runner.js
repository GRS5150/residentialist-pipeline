
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');
require('dotenv').config({ path: '/Users/Residentialist/.openclaw/workspace/residentialist/.env' });

const WORKSPACE = '/Users/Residentialist/.openclaw/workspace/residentialist';
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const BENCHMARKS = [
  { name: 'Andersen 400 Series', config: 'DH', min: 7.0, max: 10.0, tier: 'Premium' },
  { name: 'Marvin Integrity',    config: 'DH', min: 7.0, max: 10.0, tier: 'Premium' },
  { name: 'Pella 250 Series',    config: 'DH', min: 5.0, max: 6.9,  tier: 'Mid-range' },
  { name: 'Jeld-Wen V-2500',     config: 'DH', min: 5.0, max: 6.9,  tier: 'Mid-range' },
  { name: 'Window World 4000',   config: 'DH', min: 0.0, max: 4.9,  tier: 'Budget' },
  { name: 'Reliabilt 3500',      config: 'DH', min: 0.0, max: 4.9,  tier: 'Budget' }
];

function sendTelegram(message) {
  return new Promise((resolve) => {
    try {
      const body = JSON.stringify({ chat_id: CHAT_ID, text: message, parse_mode: 'Markdown' });
      const opts = { hostname: 'api.telegram.org', path: '/bot' + TOKEN + '/sendMessage',
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } };
      const req = https.request(opts, (res) => { res.on('data', () => {}); res.on('end', resolve); });
      req.on('error', () => resolve());
      req.write(body); req.end();
    } catch(e) { resolve(); }
  });
}

function extractScore(text) {
  const m = text.match(/Proposed Overall[:\s*]+([0-9]+\.[0-9]+)/i) || text.match(/([0-9]+\.[0-9]+)\s*\/\s*10/);
  return m ? parseFloat(m[1]) : null;
}

function getLatestOutput(nameKey) {
  const outputDir = path.join(WORKSPACE, 'outputs');
  const dirs = fs.readdirSync(outputDir).filter(d => d.startsWith(nameKey)).sort().reverse();
  return dirs[0] ? path.join(outputDir, dirs[0]) : null;
}

async function runBenchmarks() {
  console.log('[BENCHMARK-RUNNER] Starting weekly run...');
  await sendTelegram('Weekly Benchmark Starting — ' + BENCHMARKS.length + ' products');

  const results = [];
  for (const p of BENCHMARKS) {
    const child = spawn('node', ['auto_runner.js', p.name, p.config, 'Windows'], { cwd: WORKSPACE, stdio: 'pipe' });
    await new Promise(resolve => { child.on('close', resolve); setTimeout(resolve, 300000); });

    const key = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    const dir = getLatestOutput(key);
    let score = null;
    if (dir) {
      const files = fs.readdirSync(dir);
      const cf = files.find(f => f.includes('bot4_challenge'));
      if (cf) score = extractScore(fs.readFileSync(path.join(dir, cf), 'utf8'));
    }
    const passed = score !== null && score >= p.min && score <= p.max;
    results.push({ ...p, score, passed });
    console.log('[BENCHMARK-RUNNER]', p.name + ':', score, passed ? 'PASS' : 'FAIL');
  }

  const passing = results.filter(r => r.passed);
  const failing = results.filter(r => !r.passed);
  let msg = '*Weekly Benchmark — ' + new Date().toLocaleDateString() + '*\n\n';
  results.forEach(r => { msg += (r.passed ? 'PASS' : 'FAIL') + ' ' + r.name + ' — ' + (r.score || '?') + '\n'; });
  msg += '\n*' + passing.length + '/' + results.length + ' aligned*';
  if (failing.length) {
    msg += '\n\nDRIFT DETECTED:\n';
    failing.forEach(r => { msg += r.name + ' scored ' + r.score + ', expected ' + r.min + '-' + r.max + '\n'; });
  }

  await sendTelegram(msg);
  fs.writeFileSync(path.join(WORKSPACE, 'benchmark_history.json'), JSON.stringify({ timestamp: new Date().toISOString(), results }, null, 2));
  console.log('[BENCHMARK-RUNNER] Done:', passing.length + '/' + results.length, 'passed');
}

runBenchmarks().catch(err => console.error('[BENCHMARK-RUNNER] Error:', err.message));
