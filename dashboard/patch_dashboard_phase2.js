/**
 * Patch script: adds Phase 2 curation/deepdive/manufacturer routes to the production dashboard server.
 * Run on Mac Mini: node patch_dashboard_phase2.js
 */

const fs = require('fs');
const path = require('path');

const WORKSPACE = process.env.RESIDENTIALIST_WORKSPACE || '/Users/Residentialist/.openclaw/workspace/residentialist';
const SERVER_PATH = path.join(WORKSPACE, 'dashboard', 'dashboard_server.js');
const INDEX_PATH = path.join(WORKSPACE, 'dashboard', 'public', 'index.html');

// ─── Backup ──────────────────────────────────────────────────────────────────
fs.copyFileSync(SERVER_PATH, SERVER_PATH + '.pre_phase2_patch');
console.log('[PATCH] Backed up dashboard_server.js');

let code = fs.readFileSync(SERVER_PATH, 'utf8');

// ─── 1. Add Phase 2 directories and requires after existing config ────────
const configInsert = `
// ── Phase 2 Directories ─────────────────────────────────────────────────────
const CURATION_DIR = path.join(WORKSPACE, 'curation');
const DEEP_DIVES_DIR = path.join(WORKSPACE, 'deep_dives');
const MANUFACTURERS_DIR = path.join(WORKSPACE, 'manufacturers');
[CURATION_DIR, DEEP_DIVES_DIR, MANUFACTURERS_DIR].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });

let deterministicScorer = null;
let deepDiveQueue = null;
try { deterministicScorer = require('../deterministic_scorer'); } catch (e) { console.log('[DASHBOARD] deterministicScorer not available:', e.message); }
try { deepDiveQueue = require('../deep_dive_queue'); } catch (e) { console.log('[DASHBOARD] deepDiveQueue not available'); }
`;

// Insert after the PUBLIC_DIR line
if (!code.includes('CURATION_DIR')) {
  code = code.replace(
    /const PUBLIC_DIR = .*;\n/,
    match => match + configInsert
  );
  console.log('[PATCH] Added Phase 2 config and directories');
} else {
  console.log('[PATCH] Phase 2 config already present');
}

// ─── 2. Add readBody helper if not present ────────────────────────────────
if (!code.includes('function readBody')) {
  const readBodyCode = `
function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try { resolve(JSON.parse(body)); }
      catch { resolve({}); }
    });
    req.on('error', reject);
  });
}
`;
  // Insert before sendJSON
  code = code.replace(
    /function sendJSON\(/,
    readBodyCode + '\nfunction sendJSON('
  );
  console.log('[PATCH] Added readBody helper');
}

// ─── 3. Add Phase 2 curation routes into handleAPI ────────────────────────
const curationRoutes = `
  // ── Phase 2: Curation Routes ──────────────────────────────────────────

  // GET /api/curation — list all products with curation status
  if (pathname === '/api/curation' && req.method === 'GET') {
    try {
      const curationFiles = fs.existsSync(CURATION_DIR) ? fs.readdirSync(CURATION_DIR).filter(f => f.endsWith('_sources.json')) : [];
      const products = curationFiles.map(f => {
        try {
          const data = JSON.parse(fs.readFileSync(path.join(CURATION_DIR, f), 'utf8'));
          return {
            slug: f.replace('_sources.json', ''),
            product_name: data.product_name || f.replace('_sources.json', '').replace(/_/g, ' '),
            curation_status: data.curation_status || 'staged',
            total_sources: data.auto_classification_summary?.total || data.sources?.length || 0,
            score_sources: data.auto_classification_summary?.score || 0,
            report_only_sources: data.auto_classification_summary?.report_only || 0,
            quarantine_sources: data.auto_classification_summary?.quarantine || 0,
            deep_dive_date: data.deep_dive_date || null,
            bottom_line: data.bottom_line || '',
            manufacturer_slug: data.manufacturer_slug || ''
          };
        } catch { return null; }
      }).filter(Boolean);
      sendJSON(res, products);
    } catch (err) { sendJSON(res, { error: err.message }, 500); }
    return true;
  }

  // GET /api/curation/:slug — full curation data
  const curationSlugMatch = pathname.match(/^\\/api\\/curation\\/([^/]+)$/);
  if (curationSlugMatch && req.method === 'GET') {
    try {
      const slug = curationSlugMatch[1];
      const filePath = path.join(CURATION_DIR, slug + '_sources.json');
      if (!fs.existsSync(filePath)) { sendJSON(res, { error: 'Not found' }, 404); return true; }
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      sendJSON(res, data);
    } catch (err) { sendJSON(res, { error: err.message }, 500); }
    return true;
  }

  // POST /api/curation/:slug/classify — classify a single source
  const classifyMatch = pathname.match(/^\\/api\\/curation\\/([^/]+)\\/classify$/);
  if (classifyMatch && req.method === 'POST') {
    try {
      const slug = classifyMatch[1];
      const body = await readBody(req);
      const filePath = path.join(CURATION_DIR, slug + '_sources.json');
      if (!fs.existsSync(filePath)) { sendJSON(res, { error: 'Not found' }, 404); return true; }
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const source = data.sources?.find(s => s.id === body.source_id);
      if (!source) { sendJSON(res, { error: 'Source not found' }, 404); return true; }
      source.classification = body.classification;
      source.classification_reason = body.reason || source.classification_reason;
      if (!data.human_overrides) data.human_overrides = [];
      data.human_overrides.push({ source_id: body.source_id, action: 'classify', new_value: body.classification, timestamp: new Date().toISOString() });
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      sendJSON(res, { success: true, source });
    } catch (err) { sendJSON(res, { error: err.message }, 500); }
    return true;
  }

  // POST /api/curation/:slug/bulk-classify — bulk classify
  const bulkClassifyMatch = pathname.match(/^\\/api\\/curation\\/([^/]+)\\/bulk-classify$/);
  if (bulkClassifyMatch && req.method === 'POST') {
    try {
      const slug = bulkClassifyMatch[1];
      const body = await readBody(req);
      const filePath = path.join(CURATION_DIR, slug + '_sources.json');
      if (!fs.existsSync(filePath)) { sendJSON(res, { error: 'Not found' }, 404); return true; }
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      let changed = 0;
      for (const change of (body.changes || [])) {
        const source = data.sources?.find(s => s.id === change.source_id);
        if (source) { source.classification = change.classification; changed++; }
      }
      const summary = { total: data.sources.length, score: 0, report_only: 0, quarantine: 0, uncertain: 0 };
      for (const s of data.sources) {
        if (s.classification === 'score') summary.score++;
        else if (s.classification === 'report_only') summary.report_only++;
        else if (s.classification === 'quarantine') summary.quarantine++;
        else summary.uncertain++;
      }
      data.auto_classification_summary = summary;
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      sendJSON(res, { success: true, changed });
    } catch (err) { sendJSON(res, { error: err.message }, 500); }
    return true;
  }

  // POST /api/curation/:slug/release — release to pipeline
  const releaseMatch = pathname.match(/^\\/api\\/curation\\/([^/]+)\\/release$/);
  if (releaseMatch && req.method === 'POST') {
    try {
      const slug = releaseMatch[1];
      const filePath = path.join(CURATION_DIR, slug + '_sources.json');
      if (!fs.existsSync(filePath)) { sendJSON(res, { error: 'Not found' }, 404); return true; }
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      data.curation_status = 'released';
      data.curation_date = new Date().toISOString();
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      sendJSON(res, { success: true, status: 'released' });
    } catch (err) { sendJSON(res, { error: err.message }, 500); }
    return true;
  }

  // POST /api/deepdive/start — start single deep dive
  if (pathname === '/api/deepdive/start' && req.method === 'POST') {
    try {
      const body = await readBody(req);
      if (!body.product_name) { sendJSON(res, { error: 'product_name required' }, 400); return true; }
      const queue = deepDiveQueue ? deepDiveQueue.getQueue() : null;
      if (!queue) { sendJSON(res, { error: 'Queue module not loaded' }, 500); return true; }
      queue.addBatch([{ product_name: body.product_name, operation_type: body.operation_type || 'double_hung' }]);
      sendJSON(res, { success: true, message: 'Deep dive queued', product: body.product_name });
    } catch (err) { sendJSON(res, { error: err.message }, 500); }
    return true;
  }

  // GET /api/deepdive/status — queue status
  if (pathname === '/api/deepdive/status' && req.method === 'GET') {
    const queue = deepDiveQueue ? deepDiveQueue.getQueue() : null;
    if (!queue) { sendJSON(res, { processing: false, queued: 0 }); return true; }
    sendJSON(res, queue.getStatus());
    return true;
  }

  // GET /api/manufacturer/:slug — get manufacturer file
  const mfgMatch = pathname.match(/^\\/api\\/manufacturer\\/([^/]+)$/);
  if (mfgMatch && req.method === 'GET') {
    try {
      const slug = mfgMatch[1];
      const filePath = path.join(MANUFACTURERS_DIR, slug + '.json');
      if (!fs.existsSync(filePath)) { sendJSON(res, { error: 'Manufacturer not found' }, 404); return true; }
      sendJSON(res, JSON.parse(fs.readFileSync(filePath, 'utf8')));
    } catch (err) { sendJSON(res, { error: err.message }, 500); }
    return true;
  }

  // GET /api/score-history/:slug — get score history
  const historyMatch = pathname.match(/^\\/api\\/score-history\\/([^/]+)$/);
  if (historyMatch && req.method === 'GET') {
    try {
      const slug = historyMatch[1];
      const Database = require('better-sqlite3');
      const db = new Database(DB_PATH, { readonly: true });
      const rows = db.prepare('SELECT * FROM score_history WHERE product_slug = ? ORDER BY created_at DESC LIMIT 50').all(slug);
      db.close();
      sendJSON(res, rows);
    } catch (err) { sendJSON(res, []); }
    return true;
  }

  // ── End Phase 2 Routes ────────────────────────────────────────────────

`;

// Insert at the START of handleAPI, right after the function declaration line
if (!code.includes('Phase 2: Curation Routes')) {
  // Find handleAPI and its first meaningful line
  const handleAPILine = 'function handleAPI(req, res, parsedUrl) {';
  const handleAPIIdx = code.indexOf(handleAPILine);
  if (handleAPIIdx === -1) {
    console.error('[PATCH] ERROR: Could not find handleAPI function');
    process.exit(1);
  }

  // Find the opening brace and the next line
  const braceIdx = code.indexOf('{', handleAPIIdx + handleAPILine.length - 1);
  const nextLineIdx = code.indexOf('\n', braceIdx) + 1;

  // Read the existing first line(s) to preserve them  
  code = code.substring(0, nextLineIdx) + curationRoutes + code.substring(nextLineIdx);
  console.log('[PATCH] Added curation routes to handleAPI');
} else {
  console.log('[PATCH] Curation routes already present');
}

// ─── 4. Make handleAPI async (needed for readBody) ────────────────────────
if (!code.includes('async function handleAPI')) {
  code = code.replace('function handleAPI(', 'async function handleAPI(');
  console.log('[PATCH] Made handleAPI async');
}

// Also need to await it in the server handler
if (!code.includes('await handleAPI')) {
  code = code.replace(
    'if (!handleAPI(req, res, parsedUrl))',
    'if (!(await handleAPI(req, res, parsedUrl)))'
  );
  // Make the server callback async too
  code = code.replace(
    /const server = http\.createServer\((req, res)/,
    'const server = http.createServer(async (req, res)'
  );
  console.log('[PATCH] Made server handler async');
}

// ─── 5. Update static file serving to handle curation pages ──────────────
if (!code.includes('curation.html')) {
  code = code.replace(
    /} else if \(pathname\.startsWith\('\/product\/'\)/,
    `} else if (pathname === '/curation' || pathname === '/curation.html') {
    filePath = path.join(PUBLIC_DIR, 'curation.html');
  } else if (pathname.startsWith('/curation-product') || pathname === '/curation-product.html') {
    filePath = path.join(PUBLIC_DIR, 'curation-product.html');
  } else if (pathname === '/manufacturer' || pathname === '/manufacturer.html') {
    filePath = path.join(PUBLIC_DIR, 'manufacturer.html');
  } else if (pathname.startsWith('/product/')`
  );
  console.log('[PATCH] Added curation page routing');
}

// ─── Write ──────────────────────────────────────────────────────────────────
fs.writeFileSync(SERVER_PATH, code);
console.log(`[PATCH] ✅ Server patched (${code.split('\n').length} lines)`);

// ─── 6. Add nav tabs to index.html ──────────────────────────────────────────
let indexHtml = fs.readFileSync(INDEX_PATH, 'utf8');
if (!indexHtml.includes('curation.html')) {
  // Find the header-right div and add nav links before the submit button
  indexHtml = indexHtml.replace(
    /<a href="submit.html"/,
    `<a href="curation.html" class="nav-link" style="color: var(--text-muted); text-decoration: none; font-weight: 500; font-size: 0.85rem; padding: 6px 12px; transition: color 120ms;" onmouseover="this.style.color='var(--text-primary)'" onmouseout="this.style.color='var(--text-muted)'" >Curation</a>
      <a href="submit.html"`
  );
  fs.writeFileSync(INDEX_PATH, indexHtml);
  console.log('[PATCH] ✅ Added Curation nav tab to index.html');
} else {
  console.log('[PATCH] Nav tab already present');
}

console.log('\n[PATCH] Done! Restart the dashboard server to pick up changes.');
