
/**
 * WEIGHT OPTIMIZER — The Residentialist
 * Grid searches axis weights (Quality, Durability, Performance)
 * against 6 benchmark products to find combinations that land
 * all products correctly in their expected bands.
 *
 * Locked benchmark scores from last clean pipeline runs.
 * Reliabilt excluded — score is structurally clamped, not weight-driven.
 *
 * Run: node weight_optimizer.js
 * Results sent to Telegram on completion.
 */

require('dotenv').config({ path: '/Users/Residentialist/.openclaw/workspace/residentialist/.env' });
const https = require('https');

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// ── LOCKED BENCHMARK SCORES ─────────────────────────────────────────────────
// Source: last clean bot2 evaluator runs, March 2026
const BENCHMARKS = [
  { name: 'Andersen 400 Series', Q: 6.73, D: 7.39, P: 7.10, tier: 'Premium',   min: 7.0, max: 10.0 },
  { name: 'Marvin Integrity',    Q: 8.075,D: 8.0625,P: 6.80, tier: 'Premium',   min: 7.0, max: 10.0 },
  { name: 'Pella 250 Series',    Q: 6.43, D: 7.13, P: 6.77, tier: 'Mid-range', min: 5.0, max: 6.9  },
  { name: 'Jeld-Wen V-2500',     Q: 5.00, D: 6.19, P: 6.10, tier: 'Mid-range', min: 5.0, max: 6.9  },
  { name: 'Milgard Tuscany',     Q: 6.05, D: 7.90, P: 6.80, tier: 'Mid-range', min: 5.0, max: 6.9  },
  { name: 'Window World 4000',   Q: 5.20, D: 4.50, P: 4.20, tier: 'Budget',    min: 0.0, max: 4.9  },
];

// Current weights for reference
const CURRENT_WEIGHTS = { wQ: 1/3, wD: 1/3, wP: 1/3 };

function score(product, wQ, wD, wP) {
  return (product.Q * wQ) + (product.D * wD) + (product.P * wP);
}

function inBand(s, min, max) {
  return s >= min && s <= max;
}

function bandDistance(s, min, max) {
  if (s < min) return min - s;
  if (s > max) return s - max;
  return 0;
}

function evaluate(wQ, wD, wP) {
  let inBandCount = 0;
  let totalDistance = 0;
  const scores = [];

  for (const b of BENCHMARKS) {
    const s = Math.round(score(b, wQ, wD, wP) * 100) / 100;
    const hit = inBand(s, b.min, b.max);
    const dist = bandDistance(s, b.min, b.max);
    inBandCount += hit ? 1 : 0;
    totalDistance += dist;
    scores.push({ name: b.name, score: s, tier: b.tier, hit, dist });
  }

  return { inBandCount, totalDistance: Math.round(totalDistance * 1000) / 1000, scores };
}

// ── GRID SEARCH ──────────────────────────────────────────────────────────────
// Step 0.05 — 231 combinations where wQ+wD+wP=1.0
const STEP = 0.05;
const results = [];

for (let qInt = 0; qInt <= 100; qInt += Math.round(STEP * 100)) {
  for (let dInt = 0; dInt <= 100 - qInt; dInt += Math.round(STEP * 100)) {
    const pInt = 100 - qInt - dInt;
    if (pInt < 0) continue;
    const wQ = qInt / 100;
    const wD = dInt / 100;
    const wP = pInt / 100;
    const result = evaluate(wQ, wD, wP);
    results.push({ wQ, wD, wP, ...result });
  }
}

// Sort: most in-band first, then lowest total distance
results.sort((a, b) => {
  if (b.inBandCount !== a.inBandCount) return b.inBandCount - a.inBandCount;
  return a.totalDistance - b.totalDistance;
});

const currentResult = evaluate(CURRENT_WEIGHTS.wQ, CURRENT_WEIGHTS.wD, CURRENT_WEIGHTS.wP);
const top10 = results.slice(0, 10);

// ── FORMAT REPORT ─────────────────────────────────────────────────────────────
function pct(w) { return Math.round(w * 100) + '%'; }

let report = '🔬 *WEIGHT OPTIMIZER RESULTS*\n';
report += `_Grid search: ${results.length} combinations tested_\n\n`;

report += `*Current Weights* Q:${pct(CURRENT_WEIGHTS.wQ)} D:${pct(CURRENT_WEIGHTS.wD)} P:${pct(CURRENT_WEIGHTS.wP)}\n`;
report += `→ ${currentResult.inBandCount}/6 in band | distance: ${currentResult.totalDistance}\n\n`;

report += `*Top 10 Combinations:*\n`;
report += `_Rank | Q% | D% | P% | In-Band | Distance_\n`;

top10.forEach((r, i) => {
  const marker = r.inBandCount === 6 ? '✅' : r.inBandCount >= 5 ? '🟡' : '🔴';
  report += `${marker} #${i+1}: Q:${pct(r.wQ)} D:${pct(r.wD)} P:${pct(r.wP)} | ${r.inBandCount}/6 | ${r.totalDistance}\n`;
});

report += '\n*Best Combo Detail:*\n';
const best = top10[0];
report += `Q:${pct(best.wQ)} D:${pct(best.wD)} P:${pct(best.wP)}\n`;
best.scores.forEach(s => {
  const icon = s.hit ? '✅' : '❌';
  report += `${icon} ${s.name}: ${s.score} (${s.tier})\n`;
});

report += '\nReply with the rank # you want to lock, or WEIGHTS Q% D% P% to set custom.';

// Save results JSON
const fs = require('fs');
const outPath = '/Users/Residentialist/.openclaw/workspace/residentialist/weight_optimizer_results.json';
fs.writeFileSync(outPath, JSON.stringify({ timestamp: new Date().toISOString(), tested: results.length, top10, current: { weights: CURRENT_WEIGHTS, result: currentResult } }, null, 2));
console.log('[OPTIMIZER] Results saved to', outPath);
console.log('[OPTIMIZER] Best:', `Q:${pct(best.wQ)} D:${pct(best.wD)} P:${pct(best.wP)}`, `${best.inBandCount}/6 in band`);

// ── SEND TELEGRAM ─────────────────────────────────────────────────────────────
function sendTelegram(text) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: 'Markdown' });
    const req = https.request({
      hostname: 'api.telegram.org',
      path: `/bot${TOKEN}/sendMessage`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    }, res => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

sendTelegram(report)
  .then(() => { console.log('[OPTIMIZER] Telegram report sent.'); process.exit(0); })
  .catch(err => { console.error('[OPTIMIZER] Telegram error:', err.message); process.exit(1); });
