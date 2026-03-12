const http = require('http');
const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const WORKSPACE = '/Users/Residentialist/.openclaw/workspace/residentialist';
const PORT = 7823;
const API_KEY = process.env.BRIDGE_API_KEY || 'residentialist-bridge-2026';

function log(msg) {
  const line = '[BRIDGE] ' + new Date().toISOString() + ' ' + msg;
  console.log(line);
  fs.appendFileSync('/Users/Residentialist/bridge.log', line + '\n');
}

function runCommand(cmd) {
  try {
    return { success: true, output: execSync(cmd, { cwd: WORKSPACE, timeout: 10000 }).toString() };
  } catch(e) {
    return { success: false, output: e.message };
  }
}

function readFile(filePath) {
  try {
    return { success: true, content: fs.readFileSync(filePath, 'utf8') };
  } catch(e) {
    return { success: false, error: e.message };
  }
}

function listOutputs() {
  try {
    const outputDir = path.join(WORKSPACE, 'outputs');
    const dirs = fs.readdirSync(outputDir).filter(f => fs.statSync(path.join(outputDir, f)).isDirectory());
    return dirs.sort().reverse().slice(0, 20);
  } catch(e) {
    return [];
  }
}

function getStatus() {
  const pipelineRunning = runCommand('pgrep -f auto_runner').success;
  const telegramRunning = runCommand('pgrep -f telegram_listener').success;
  const lastOutputs = listOutputs();
  const recentLog = runCommand('tail -20 /Users/Residentialist/deploy.log').output;
  return { pipelineRunning, telegramRunning, lastOutputs, recentLog, timestamp: new Date().toISOString() };
}

function gradeScale(s) {
  if (s >= 9.0) return 'A+'; if (s >= 8.5) return 'A';  if (s >= 8.0) return 'A-';
  if (s >= 7.5) return 'B+'; if (s >= 7.0) return 'B';  if (s >= 6.5) return 'B-';
  if (s >= 6.0) return 'C+'; if (s >= 5.5) return 'C';  if (s >= 5.0) return 'C-';
  if (s >= 4.5) return 'D+'; if (s >= 4.0) return 'D';  return 'F';
}

function getPipelineData() {
  const CALIBRATION = [
    { product: 'Alpen Zenith ZR-7',   config: 'DH', overall: 8.73, grade: 'A-',  Q: null,   D: null,   P: null  },
    { product: 'Marvin Integrity',     config: 'DH', overall: 7.65, grade: 'B+',  Q: 8.075,  D: 8.0625, P: 6.80  },
    { product: 'Andersen 400 Series',  config: 'DH', overall: 7.07, grade: 'B',   Q: 6.73,   D: 7.39,   P: 7.10  },
    { product: 'Milgard Tuscany',      config: 'DH', overall: 6.92, grade: 'B-',  Q: 6.05,   D: 7.90,   P: 6.80  },
    { product: 'Pella 250 Series',     config: 'DH', overall: 6.78, grade: 'B-',  Q: 6.43,   D: 7.13,   P: 6.77  },
    { product: 'Jeld-Wen V-2500',      config: 'DH', overall: 5.76, grade: 'C+',  Q: 5.00,   D: 6.19,   P: 6.10  },
    { product: 'Pella 350 Series',     config: 'DH', overall: 4.91, grade: 'D+',  Q: 4.50,   D: 4.94,   P: 5.29  },
    { product: 'Reliabilt 3500',       config: 'DH', overall: 4.90, grade: 'D+',  Q: null,   D: null,   P: null  },
    { product: 'Window World 4000',    config: 'DH', overall: 4.63, grade: 'D',   Q: 5.20,   D: 4.50,   P: 4.20  },
  ];

  const outputDir = path.join(WORKSPACE, 'outputs');
  const dirs = fs.readdirSync(outputDir)
    .filter(f => { try { return fs.statSync(path.join(outputDir, f)).isDirectory(); } catch(e) { return false; } })
    .sort().reverse();

  const evaluations = [];

  for (const dir of dirs) {
    try {
      const dirPath = path.join(outputDir, dir);
      const statusFile = path.join(dirPath, 'PIPELINE_STATUS.txt');
      if (!fs.existsSync(statusFile)) continue;

      const status = fs.readFileSync(statusFile, 'utf8');
      const productM = status.match(/PRODUCT:\s*(.+)/);
      const configM  = status.match(/CONFIG:\s*(.+)/);
      const tsM      = status.match(/TIMESTAMP:\s*(.+)/);
      const stateM   = status.match(/STATUS:\s*(.+)/);
      if (!productM) continue;

      const product = productM[1].trim();
      const config  = configM  ? configM[1].trim() : 'DH';
      const ts      = tsM      ? tsM[1].trim()     : '';
      const state   = stateM   ? stateM[1].trim()  : 'UNKNOWN';

      let overall = null, Q = null, D = null, P = null;

      // 1. Try council_session.md for overall
      const councilFile = path.join(dirPath, 'council_session.md');
      if (fs.existsSync(councilFile)) {
        const council = fs.readFileSync(councilFile, 'utf8');
        const oM = council.match(/\*\*(?:Proposed |Final |Confirmed )?Overall[:\s*]+([0-9]+\.[0-9]+)/i)
                || council.match(/Overall[:\s]+([0-9]+\.[0-9]+)/i);
        if (oM) overall = parseFloat(oM[1]);
      }

      // 2. Try bot2 for overall + axis scores
      const bot2Files = fs.readdirSync(dirPath).filter(f => f.includes('bot2_evaluator'));
      if (bot2Files.length > 0) {
        const bot2 = fs.readFileSync(path.join(dirPath, bot2Files[0]), 'utf8');

        // **OVERALL: B (7.24/10)**
        if (!overall) {
          const ovM = bot2.match(/\*\*OVERALL:\s*[A-F][+-]?\s*\(([0-9]+\.[0-9]+)\/10\)/);
          if (ovM) overall = parseFloat(ovM[1]);
        }

        // Weighted calc line: (7.27 × 0.35) + (7.60 × 0.35) + (6.6 × 0.30) = ... → 7.24
        const bot2Lines = bot2.split('\n');
        const calcLine = bot2Lines.find(function(l) {
          return l.indexOf('\u00d7') !== -1 && l.indexOf('\u2192') !== -1;
        });
        if (calcLine) {
          const re = /\(([0-9.]+)\s*\u00d7/g;
          const nums = [];
          let m;
          while ((m = re.exec(calcLine)) !== null) nums.push(parseFloat(m[1]));
          if (nums.length >= 3) { Q = nums[0]; D = nums[1]; P = nums[2]; }
          const arrM = calcLine.match(/\u2192\s*([0-9]+\.[0-9]+)/);
          if (arrM && !overall) overall = parseFloat(arrM[1]);
        }
      }

      evaluations.push({
        dir, product, config, ts, state,
        overall: overall,
        grade: overall ? gradeScale(overall) : null,
        Q: Q, D: D, P: P
      });
    } catch(e) {
      // skip bad dirs silently
    }
  }

  return { calibration: CALIBRATION, evaluations: evaluations, timestamp: new Date().toISOString() };
}

const server = http.createServer((req, res) => {
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    const url = req.url;

    // Public routes — no auth
    if (req.method === 'OPTIONS') { 
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Headers', 'x-api-key, Content-Type');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.writeHead(204); res.end(); return; 
    }
    if (req.method === 'GET' && (url === '/dashboard' || url === '/')) {
      res.setHeader('Content-Type', 'text/html');
      res.writeHead(200);
      res.end("<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"UTF-8\">\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n<title>The Residentialist \u2014 Mission Control</title>\n<style>\n  * { box-sizing: border-box; margin: 0; padding: 0; }\n  :root {\n    --amber: #B8722A;\n    --ink: #1a1a1a;\n    --ink-mid: #555;\n    --ink-faint: #999;\n    --rule: #e0dbd4;\n    --bg: #f5f3ef;\n    --white: #ffffff;\n    --green: #2d6a4f;\n    --red: #9b2226;\n    --yellow-bg: #fef3c7;\n    --yellow-border: #d97706;\n  }\n  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;\n    background: var(--bg); color: var(--ink); min-height: 100vh; }\n\n  header { background: var(--ink); color: var(--white); padding: 14px 20px;\n    display: flex; align-items: center; justify-content: space-between; }\n  .logo { font-size: 11px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; }\n  .logo span { color: var(--amber); }\n  .status-dot { width: 8px; height: 8px; border-radius: 50%; background: #6b7280; display: inline-block; margin-right: 6px; }\n  .status-dot.live { background: #10b981; animation: pulse 2s infinite; }\n  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }\n  .header-status { font-size: 11px; color: #9ca3af; display: flex; align-items: center; gap: 4px; }\n\n  .container { max-width: 900px; margin: 0 auto; padding: 20px 16px; }\n\n  .section-label { font-size: 10px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase;\n    color: var(--amber); margin-bottom: 12px; margin-top: 28px; }\n\n  /* Score table */\n  .score-table { width: 100%; border-collapse: collapse; background: var(--white);\n    border: 1px solid var(--rule); }\n  .score-table th { font-size: 9px; font-weight: 700; letter-spacing: .15em; text-transform: uppercase;\n    color: var(--ink-faint); padding: 10px 12px; text-align: left; border-bottom: 1px solid var(--rule);\n    background: #faf9f7; }\n  .score-table td { padding: 12px 12px; font-size: 13px; border-bottom: 1px solid var(--rule); vertical-align: middle; }\n  .score-table tr:last-child td { border-bottom: none; }\n  .score-table tr.clickable { cursor: pointer; }\n  .score-table tr.clickable:hover td { background: #faf9f7; }\n  .score-table tr.expanded td { background: #fdf8f2; }\n\n  .product-name { font-weight: 600; font-size: 14px; }\n  .product-meta { font-size: 11px; color: var(--ink-faint); margin-top: 2px; }\n\n  .score-num { font-size: 22px; font-weight: 300; font-variant-numeric: tabular-nums; line-height: 1; }\n  .score-grade { font-size: 10px; font-weight: 700; color: var(--ink-faint); margin-top: 3px; letter-spacing: .05em; }\n  .score-col { text-align: right; }\n\n  .status-badge { display: inline-block; padding: 3px 8px; border-radius: 3px; font-size: 10px;\n    font-weight: 700; letter-spacing: .1em; text-transform: uppercase; }\n  .badge-pass { background: #d1fae5; color: #065f46; }\n  .badge-halted { background: #fee2e2; color: #991b1b; }\n  .badge-unknown { background: #f3f4f6; color: #6b7280; }\n  .badge-running { background: #fef3c7; color: #92400e; }\n  .badge-cal { background: #e0d9f0; color: #4c1d95; }\n\n  /* Drill-down panel */\n  .drill-row td { padding: 0 !important; }\n  .drill-panel { padding: 16px 20px 20px; border-top: 2px solid var(--amber); background: #fdf8f2; }\n  .drill-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-top: 12px; }\n  @media (max-width: 560px) { .drill-grid { grid-template-columns: 1fr; } }\n\n  .axis-card { background: var(--white); border: 1px solid var(--rule); padding: 14px; }\n  .axis-label { font-size: 9px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase;\n    color: var(--ink-faint); margin-bottom: 8px; }\n  .axis-score { font-size: 28px; font-weight: 300; line-height: 1; }\n  .axis-grade { font-size: 10px; color: var(--ink-faint); margin-top: 2px; font-weight: 700; }\n  .axis-weight { font-size: 10px; color: var(--ink-faint); margin-bottom: 6px; }\n  .axis-bar-track { height: 4px; background: var(--rule); border-radius: 2px; margin-top: 10px; }\n  .axis-bar-fill { height: 4px; border-radius: 2px; transition: width .4s ease; }\n\n  .drill-meta { display: flex; gap: 20px; flex-wrap: wrap; margin-top: 4px; }\n  .drill-meta-item { font-size: 11px; color: var(--ink-mid); }\n  .drill-meta-item strong { color: var(--ink); }\n\n  .chevron { font-size: 10px; color: var(--ink-faint); transition: transform .2s; display: inline-block; }\n  .chevron.open { transform: rotate(180deg); }\n\n  .refresh-btn { background: var(--amber); color: var(--white); border: none; padding: 8px 16px;\n    font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;\n    cursor: pointer; border-radius: 3px; }\n  .refresh-btn:hover { background: #9a5e22; }\n\n  .pipeline-bar { background: var(--white); border: 1px solid var(--rule); padding: 14px 16px;\n    display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; }\n  .pipeline-stats { display: flex; gap: 20px; }\n  .stat { text-align: center; }\n  .stat-num { font-size: 24px; font-weight: 300; line-height: 1; }\n  .stat-label { font-size: 9px; font-weight: 700; letter-spacing: .15em; text-transform: uppercase;\n    color: var(--ink-faint); margin-top: 2px; }\n\n  .error-msg { color: var(--red); font-size: 12px; padding: 12px; background: #fff5f5;\n    border: 1px solid #fed7d7; }\n  .loading { color: var(--ink-faint); font-size: 12px; padding: 20px; text-align: center; }\n\n  .col-product { width: 45%; }\n  .col-status  { width: 20%; }\n  .col-score   { width: 20%; }\n  .col-chevron { width: 5%; text-align: center; }\n\n  .timestamp { font-size: 10px; color: var(--ink-faint); }\n\n  /* Mobile tweaks */\n  @media (max-width: 600px) {\n    .score-num { font-size: 18px; }\n    .col-product { width: 50%; }\n    .col-status { display: none; }\n    .col-score { width: 30%; }\n  }\n</style>\n</head>\n<body>\n\n<header>\n  <div class=\"logo\">The <span>Residentialist</span> \u00b7 Mission Control</div>\n  <div class=\"header-status\">\n    <span class=\"status-dot\" id=\"conn-dot\"></span>\n    <span id=\"conn-label\">connecting...</span>\n  </div>\n</header>\n\n<div class=\"container\">\n\n  <!-- Pipeline summary bar -->\n  <div class=\"section-label\" style=\"margin-top:20px\">Pipeline</div>\n  <div class=\"pipeline-bar\">\n    <div class=\"pipeline-stats\">\n      <div class=\"stat\"><div class=\"stat-num\" id=\"stat-complete\">\u2014</div><div class=\"stat-label\">Complete</div></div>\n      <div class=\"stat\"><div class=\"stat-num\" id=\"stat-halted\" style=\"color:#ef4444\">\u2014</div><div class=\"stat-label\">Halted</div></div>\n      <div class=\"stat\"><div class=\"stat-num\" id=\"stat-cal\">\u2014</div><div class=\"stat-label\">Calibrated</div></div>\n    </div>\n    <div style=\"display:flex;align-items:center;gap:12px\">\n      <div class=\"timestamp\" id=\"last-updated\"></div>\n      <button class=\"refresh-btn\" onclick=\"loadData()\">\u21bb Refresh</button>\n    </div>\n  </div>\n\n  <!-- Calibration benchmarks -->\n  <div class=\"section-label\">Calibration Benchmarks</div>\n  <table class=\"score-table\">\n    <thead>\n      <tr>\n        <th class=\"col-product\">Product</th>\n        <th class=\"col-status\">Tier</th>\n        <th class=\"col-score\">Score</th>\n        <th class=\"col-chevron\"></th>\n      </tr>\n    </thead>\n    <tbody id=\"cal-tbody\">\n      <tr><td colspan=\"4\" class=\"loading\">Loading...</td></tr>\n    </tbody>\n  </table>\n\n  <!-- Evaluations -->\n  <div class=\"section-label\">Evaluations</div>\n  <div id=\"error-msg\"></div>\n  <table class=\"score-table\">\n    <thead>\n      <tr>\n        <th class=\"col-product\">Product</th>\n        <th class=\"col-status\">Status</th>\n        <th class=\"col-score\">Score</th>\n        <th class=\"col-chevron\"></th>\n      </tr>\n    </thead>\n    <tbody id=\"eval-tbody\">\n      <tr><td colspan=\"4\" class=\"loading\">Loading...</td></tr>\n    </tbody>\n  </table>\n\n</div>\n\n<script>\nconst BRIDGE = '';  // served from bridge, use relative URLs\nconst API_KEY = 'residentialist-bridge-2026';\nlet expandedRow = null;\n\nfunction gradeColor(score) {\n  if (!score) return '#9ca3af';\n  if (score >= 8.0) return '#10b981';\n  if (score >= 7.0) return '#3b82f6';\n  if (score >= 6.0) return '#f59e0b';\n  if (score >= 5.0) return '#ef8c34';\n  return '#ef4444';\n}\n\nfunction barColor(score) {\n  if (!score) return '#e5e7eb';\n  if (score >= 8.0) return '#10b981';\n  if (score >= 7.0) return '#3b82f6';\n  if (score >= 6.0) return '#f59e0b';\n  return '#ef4444';\n}\n\nfunction tierLabel(overall) {\n  if (!overall) return '\u2014';\n  if (overall >= 8.5) return 'High Performance';\n  if (overall >= 7.0) return 'Architectural';\n  if (overall >= 5.5) return 'Premium Residential';\n  if (overall >= 4.0) return 'Mid-Range';\n  return 'Budget';\n}\n\nfunction drillHTML(item, isCalibration) {\n  const Q = item.Q, D = item.D, P = item.P;\n  const hasSubs = Q !== null && D !== null && P !== null;\n  const axes = [\n    { label: 'Quality',     weight: '35%', score: Q },\n    { label: 'Durability',  weight: '35%', score: D },\n    { label: 'Performance', weight: '30%', score: P },\n  ];\n  return `\n    <div class=\"drill-panel\">\n      <div class=\"drill-meta\">\n        ${item.overall ? `<div class=\"drill-meta-item\">Overall: <strong>${item.overall.toFixed(2)} / 10</strong></div>` : ''}\n        ${item.tier || item.overall ? `<div class=\"drill-meta-item\">Tier: <strong>${item.tier || tierLabel(item.overall)}</strong></div>` : ''}\n        ${item.ts ? `<div class=\"drill-meta-item\">Scored: <strong>${item.ts.slice(0,10)}</strong></div>` : ''}\n      </div>\n      ${hasSubs ? `\n      <div class=\"drill-grid\">\n        ${axes.map(a => `\n          <div class=\"axis-card\">\n            <div class=\"axis-label\">${a.label}</div>\n            <div class=\"axis-weight\">${a.weight} of overall</div>\n            <div class=\"axis-score\" style=\"color:${gradeColor(a.score)}\">${a.score ? a.score.toFixed(2) : '\u2014'}</div>\n            <div class=\"axis-bar-track\">\n              <div class=\"axis-bar-fill\" style=\"width:${a.score ? (a.score/10*100) : 0}%;background:${barColor(a.score)}\"></div>\n            </div>\n          </div>`).join('')}\n      </div>` : `<div style=\"font-size:12px;color:var(--ink-faint);margin-top:12px\">Axis scores not yet available for this product.</div>`}\n    </div>`;\n}\n\nfunction renderCalibration(data) {\n  const tbody = document.getElementById('cal-tbody');\n  if (!data || data.length === 0) { tbody.innerHTML = '<tr><td colspan=\"4\" class=\"loading\">No calibration data</td></tr>'; return; }\n\n  let html = '';\n  data.forEach((item, idx) => {\n    const rowId = 'cal-' + idx;\n    html += `\n      <tr class=\"clickable ${expandedRow === rowId ? 'expanded' : ''}\" onclick=\"toggleRow('${rowId}', this)\">\n        <td><div class=\"product-name\">${item.product}</div><div class=\"product-meta\">${item.config} \u00b7 Calibration Benchmark</div></td>\n        <td><span class=\"status-badge badge-cal\">${tierLabel(item.overall)}</span></td>\n        <td class=\"score-col\">\n          <div class=\"score-num\" style=\"color:${gradeColor(item.overall)}\">${item.overall ? item.overall.toFixed(2) : '\u2014'}</div>\n          <div class=\"score-grade\">${item.grade || '\u2014'}</div>\n        </td>\n        <td class=\"col-chevron\"><span class=\"chevron ${expandedRow === rowId ? 'open' : ''}\">\u25bc</span></td>\n      </tr>`;\n    if (expandedRow === rowId) {\n      html += `<tr class=\"drill-row\" id=\"drill-${rowId}\"><td colspan=\"4\">${drillHTML(item, true)}</td></tr>`;\n    }\n  });\n  tbody.innerHTML = html;\n}\n\nfunction statusBadge(state) {\n  if (!state) return '<span class=\"status-badge badge-unknown\">Unknown</span>';\n  const s = state.toUpperCase();\n  if (s.includes('PASS')) return '<span class=\"status-badge badge-pass\">Pass</span>';\n  if (s.includes('HALT')) return '<span class=\"status-badge badge-halted\">Halted</span>';\n  if (s.includes('RUNNING') || s.includes('PROCESS')) return '<span class=\"status-badge badge-running\">Running</span>';\n  return `<span class=\"status-badge badge-unknown\">${state.slice(0,12)}</span>`;\n}\n\nfunction renderEvaluations(evals) {\n  const tbody = document.getElementById('eval-tbody');\n  if (!evals || evals.length === 0) { tbody.innerHTML = '<tr><td colspan=\"4\" class=\"loading\">No evaluations found</td></tr>'; return; }\n\n  // Deduplicate \u2014 keep most recent run per product\n  const seen = new Map();\n  for (const e of evals) {\n    const key = e.product.toLowerCase().replace(/\\s+/g, '_');\n    if (!seen.has(key) || e.ts > seen.get(key).ts) seen.set(key, e);\n  }\n  const unique = Array.from(seen.values()).sort((a,b) => (b.overall||0) - (a.overall||0));\n\n  let pass = 0, halted = 0;\n  let html = '';\n  unique.forEach((item, idx) => {\n    const rowId = 'eval-' + idx;\n    const state = (item.state||'').toUpperCase();\n    if (state.includes('PASS')) pass++;\n    if (state.includes('HALT')) halted++;\n    html += `\n      <tr class=\"clickable ${expandedRow === rowId ? 'expanded' : ''}\" onclick=\"toggleRow('${rowId}', this)\">\n        <td><div class=\"product-name\">${item.product}</div><div class=\"product-meta\">${item.config} \u00b7 ${item.ts ? item.ts.slice(0,10) : ''}</div></td>\n        <td>${statusBadge(item.state)}</td>\n        <td class=\"score-col\">\n          <div class=\"score-num\" style=\"color:${gradeColor(item.overall)}\">${item.overall ? item.overall.toFixed(2) : '\u2014'}</div>\n          <div class=\"score-grade\">${item.grade || (item.overall ? '' : '\u2014')}</div>\n        </td>\n        <td class=\"col-chevron\"><span class=\"chevron ${expandedRow === rowId ? 'open' : ''}\">\u25bc</span></td>\n      </tr>`;\n    if (expandedRow === rowId) {\n      html += `<tr class=\"drill-row\" id=\"drill-${rowId}\"><td colspan=\"4\">${drillHTML(item, false)}</td></tr>`;\n    }\n  });\n\n  tbody.innerHTML = html;\n  document.getElementById('stat-complete').textContent = pass;\n  document.getElementById('stat-halted').textContent = halted;\n}\n\nfunction toggleRow(rowId, clickedTr) {\n  if (expandedRow === rowId) {\n    expandedRow = null;\n  } else {\n    expandedRow = rowId;\n  }\n  // Re-render both tables to reflect new state\n  if (window._lastData) {\n    renderCalibration(window._lastData.calibration);\n    renderEvaluations(window._lastData.evaluations);\n  }\n}\n\nasync function loadData() {\n  const dot = document.getElementById('conn-dot');\n  const label = document.getElementById('conn-label');\n  dot.className = 'status-dot';\n  label.textContent = 'loading...';\n  document.getElementById('error-msg').textContent = '';\n\n  try {\n    const res = await fetch(BRIDGE + '/pipeline', {\n      headers: { 'x-api-key': API_KEY }\n    });\n    if (!res.ok) throw new Error('HTTP ' + res.status);\n    const data = await res.json();\n    window._lastData = data;\n\n    dot.className = 'status-dot live';\n    label.textContent = 'live';\n    document.getElementById('last-updated').textContent =\n      'Updated ' + new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});\n    document.getElementById('stat-cal').textContent = data.calibration ? data.calibration.length : 0;\n\n    renderCalibration(data.calibration || []);\n    renderEvaluations(data.evaluations || []);\n  } catch(e) {\n    dot.className = 'status-dot';\n    label.textContent = 'offline';\n    document.getElementById('error-msg').innerHTML =\n      `<div class=\"error-msg\">Could not reach bridge: ${e.message}</div>`;\n    document.getElementById('eval-tbody').innerHTML =\n      '<tr><td colspan=\"4\" class=\"loading\">\u2014</td></tr>';\n  }\n}\n\nloadData();\n</script>\n</body>\n</html>\n");
      return;
    }

    const auth = req.headers['x-api-key'];
    if (auth !== API_KEY) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Unauthorized' }));
      return;
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'x-api-key, Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

    try {
      const url = req.url;
      if (req.method === 'GET' && url === '/status') {
        res.writeHead(200);
        res.end(JSON.stringify(getStatus()));
        return;
      }

      if (req.method === 'GET' && url.startsWith('/logs')) {
        const params = new URL(url, 'http://localhost').searchParams;
        const file = params.get('file') || 'deploy';
        const logMap = {
          deploy: '/Users/Residentialist/deploy.log',
          bridge: '/Users/Residentialist/bridge.log',
          telegram: '/Users/Residentialist/telegram.log',
          cron: '/Users/Residentialist/deploy_cron.log'
        };
        const logPath = logMap[file] || logMap.deploy;
        const tail = runCommand('tail -100 ' + logPath);
        res.writeHead(200);
        res.end(JSON.stringify({ file, content: tail.output }));
        return;
      }

      if (req.method === 'GET' && url.startsWith('/file')) {
        const params = new URL(url, 'http://localhost').searchParams;
        const filePath = params.get('path');
        if (!filePath) { res.writeHead(400); res.end(JSON.stringify({ error: 'No path' })); return; }
        const fullPath = filePath.startsWith('/') ? filePath : path.join(WORKSPACE, filePath);
        const result = readFile(fullPath);
        res.writeHead(result.success ? 200 : 404);
        res.end(JSON.stringify(result));
        return;
      }

      if (req.method === 'GET' && url === '/outputs') {
        res.writeHead(200);
        res.end(JSON.stringify({ outputs: listOutputs() }));
        return;
      }

      if (req.method === 'GET' && url === '/pipeline') {
        res.writeHead(200);
        res.end(JSON.stringify(getPipelineData()));
        return;
      }

      if (req.method === 'POST' && url === '/run') {
        const data = JSON.parse(body);
        if (!data.product) { res.writeHead(400); res.end(JSON.stringify({ error: 'No product' })); return; }
        const config = data.config || 'DH';
        const category = data.category || 'Windows';
        log('RUN: ' + data.product + ' ' + config + ' ' + category);
        const child = spawn('node', ['auto_runner.js', data.product, config, category], {
          cwd: WORKSPACE, detached: true, stdio: 'ignore'
        });
        child.unref();
        res.writeHead(200);
        res.end(JSON.stringify({ started: true, product: data.product, config, category }));
        return;
      }

      if (req.method === 'POST' && url === '/write') {
        const data = JSON.parse(body);
        if (!data.path || !data.content) { res.writeHead(400); res.end(JSON.stringify({ error: 'No path or content' })); return; }
        const fullPath = data.path.startsWith('/') ? data.path : path.join(WORKSPACE, data.path);
        fs.mkdirSync(path.dirname(fullPath), { recursive: true });
        fs.writeFileSync(fullPath, data.content);
        log('WRITE: ' + fullPath);
        res.writeHead(200);
        res.end(JSON.stringify({ written: true, path: fullPath }));
        return;
      }

      if (req.method === 'POST' && url === '/shell') {
        const data = JSON.parse(body);
        if (!data.cmd) { res.writeHead(400); res.end(JSON.stringify({ error: 'No cmd' })); return; }
        log('SHELL: ' + data.cmd);
        const result = runCommand(data.cmd);
        res.writeHead(200);
        res.end(JSON.stringify(result));
        return;
      }

      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Not found' }));

    } catch(e) {
      log('ERROR: ' + e.message);
      res.writeHead(500);
      res.end(JSON.stringify({ error: e.message }));
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  log('Claude Bridge listening on port ' + PORT);
});

process.on('uncaughtException', err => log('UNCAUGHT: ' + err.message));
