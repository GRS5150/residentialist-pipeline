/**
 * THE RESIDENTIALIST — Dashboard Server (Phase 2)
 * Serves curation dashboard and provides API endpoints for deep dive pipeline,
 * source curation, manufacturer management, and scoring.
 * 
 * Run: node dashboard/dashboard_server.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
require('dotenv').config({ path: '/home/ubuntu/.openclaw/workspace/residentialist/.env' });

const WORKSPACE = process.env.OPENCLAW_WORKSPACE || '/home/ubuntu/.openclaw/workspace/residentialist';
const PORT = process.env.DASHBOARD_PORT || 3456;
const PUBLIC_DIR = path.join(__dirname, 'public');
const CURATION_DIR = path.join(WORKSPACE, 'curation');
const MANUFACTURERS_DIR = path.join(WORKSPACE, 'manufacturers');
const DEEP_DIVES_DIR = path.join(WORKSPACE, 'deep_dives');

// Lazy-load modules (they may not exist during testing)
let deepDiveQueue, deterministicScorer;
try { deepDiveQueue = require('../deep_dive_queue'); } catch (e) { console.warn('[SERVER] deep_dive_queue not loaded:', e.message); }
try { deterministicScorer = require('../deterministic_scorer'); } catch (e) { console.warn('[SERVER] deterministic_scorer not loaded:', e.message); }

// Ensure directories exist
[CURATION_DIR, MANUFACTURERS_DIR, DEEP_DIVES_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ─── MIME Types ──────────────────────────────────────────────────────────────

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// ─── Helper Functions ────────────────────────────────────────────────────────

function sendJSON(res, data, status = 200) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(data));
}

function sendError(res, message, status = 500) {
  sendJSON(res, { error: message }, status);
}

async function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try { resolve(JSON.parse(body)); }
      catch (e) { reject(new Error('Invalid JSON body')); }
    });
    req.on('error', reject);
  });
}

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

// ─── API Routes ──────────────────────────────────────────────────────────────

const routes = {};

// GET /api/curation — list all products with curation status
routes['GET /api/curation'] = (req, res) => {
  try {
    const files = fs.readdirSync(CURATION_DIR).filter(f => f.endsWith('_sources.json'));
    const products = files.map(f => {
      const data = JSON.parse(fs.readFileSync(path.join(CURATION_DIR, f), 'utf8'));
      const needsReview = (data.sources || []).filter(s => 
        !s.classification || s.classification === 'uncertain'
      ).length;
      return {
        slug: data.product_slug || f.replace('_sources.json', ''),
        product_name: data.product_name || f.replace('_sources.json', ''),
        manufacturer_slug: data.manufacturer_slug,
        operation_type: data.operation_type,
        curation_status: data.curation_status || 'staged',
        deep_dive_date: data.deep_dive_date,
        total_sources: data.auto_classification_summary?.total || 0,
        score_sources: data.auto_classification_summary?.score || 0,
        report_only_sources: data.auto_classification_summary?.report_only || 0,
        quarantine_sources: data.auto_classification_summary?.quarantine || 0,
        needs_review: needsReview,
        display_score: data.display_score || null,
        product_label: data.product_label || null
      };
    });
    sendJSON(res, products);
  } catch (err) {
    sendError(res, err.message);
  }
};

// GET /api/curation/:slug — full curation data
routes['GET /api/curation/:slug'] = (req, res, params) => {
  try {
    const filePath = path.join(CURATION_DIR, `${params.slug}_sources.json`);
    if (!fs.existsSync(filePath)) return sendError(res, 'Product not found', 404);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    sendJSON(res, data);
  } catch (err) {
    sendError(res, err.message);
  }
};

// POST /api/curation/:slug/classify — classify a single source
routes['POST /api/curation/:slug/classify'] = async (req, res, params) => {
  try {
    const body = await readBody(req);
    const filePath = path.join(CURATION_DIR, `${params.slug}_sources.json`);
    if (!fs.existsSync(filePath)) return sendError(res, 'Product not found', 404);

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const source = data.sources.find(s => s.id === body.source_id);
    if (!source) return sendError(res, 'Source not found', 404);

    const oldClassification = source.classification;
    source.classification = body.classification;
    source.classification_reason = body.notes || source.classification_reason;
    source.classification_changed = oldClassification !== body.classification;
    source.classified_by = 'human';
    source.classified_at = new Date().toISOString();

    if (!data.human_overrides) data.human_overrides = [];
    data.human_overrides.push({
      source_id: body.source_id,
      old: oldClassification,
      new: body.classification,
      notes: body.notes,
      at: new Date().toISOString()
    });

    // Recompute summary
    const summary = { total: data.sources.length, score: 0, report_only: 0, quarantine: 0, uncertain: 0 };
    for (const s of data.sources) {
      if (s.classification === 'score') summary.score++;
      else if (s.classification === 'report_only') summary.report_only++;
      else if (s.classification === 'quarantine') summary.quarantine++;
      else summary.uncertain++;
    }
    data.auto_classification_summary = summary;

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    sendJSON(res, { success: true, source_id: body.source_id, classification: body.classification });
  } catch (err) {
    sendError(res, err.message);
  }
};

// POST /api/curation/:slug/bulk-classify — bulk classify sources
routes['POST /api/curation/:slug/bulk-classify'] = async (req, res, params) => {
  try {
    const body = await readBody(req);
    const filePath = path.join(CURATION_DIR, `${params.slug}_sources.json`);
    if (!fs.existsSync(filePath)) return sendError(res, 'Product not found', 404);

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    let changed = 0;

    for (const sourceId of body.source_ids) {
      const source = data.sources.find(s => s.id === sourceId);
      if (source && source.classification !== body.classification) {
        source.classification = body.classification;
        source.classified_by = 'human_bulk';
        source.classified_at = new Date().toISOString();
        changed++;
      }
    }

    // Recompute summary
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
  } catch (err) {
    sendError(res, err.message);
  }
};

// POST /api/curation/:slug/release — release to pipeline
routes['POST /api/curation/:slug/release'] = async (req, res, params) => {
  try {
    const filePath = path.join(CURATION_DIR, `${params.slug}_sources.json`);
    if (!fs.existsSync(filePath)) return sendError(res, 'Product not found', 404);

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    data.curation_status = 'released';
    data.curation_date = new Date().toISOString();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    sendJSON(res, { success: true, status: 'released' });
  } catch (err) {
    sendError(res, err.message);
  }
};

// POST /api/curation/:slug/rescore — recalculate score (no API calls)
routes['POST /api/curation/:slug/rescore'] = async (req, res, params) => {
  try {
    if (!deterministicScorer) return sendError(res, 'Scorer module not loaded', 500);
    const result = deterministicScorer.rescoreProduct(params.slug, 'windows');
    sendJSON(res, result);
  } catch (err) {
    sendError(res, err.message);
  }
};

// POST /api/curation/:slug/rerun — full pipeline rerun
routes['POST /api/curation/:slug/rerun'] = async (req, res, params) => {
  try {
    const { runProductDeepDive } = require('../deep_dive_pipeline');
    // Parse slug back to product name (best effort)
    const productName = params.slug.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    const result = await runProductDeepDive(productName, 'double_hung');
    sendJSON(res, result);
  } catch (err) {
    sendError(res, err.message);
  }
};

// POST /api/deepdive/start — start single deep dive
routes['POST /api/deepdive/start'] = async (req, res) => {
  try {
    const body = await readBody(req);
    if (!body.product_name) return sendError(res, 'product_name required', 400);

    const queue = deepDiveQueue ? deepDiveQueue.getQueue() : null;
    if (!queue) return sendError(res, 'Queue module not loaded', 500);

    queue.addBatch([{ product_name: body.product_name, operation_type: body.operation_type || 'double_hung' }]);
    sendJSON(res, { success: true, message: 'Deep dive queued', product: body.product_name });
  } catch (err) {
    sendError(res, err.message);
  }
};

// POST /api/deepdive/batch — start batch deep dive
routes['POST /api/deepdive/batch'] = async (req, res) => {
  try {
    const body = await readBody(req);
    if (!body.products || !Array.isArray(body.products)) return sendError(res, 'products array required', 400);

    const queue = deepDiveQueue ? deepDiveQueue.getQueue() : null;
    if (!queue) return sendError(res, 'Queue module not loaded', 500);

    queue.addBatch(body.products);
    sendJSON(res, { success: true, message: `${body.products.length} products queued` });
  } catch (err) {
    sendError(res, err.message);
  }
};

// GET /api/deepdive/status — get queue status
routes['GET /api/deepdive/status'] = (req, res) => {
  const queue = deepDiveQueue ? deepDiveQueue.getQueue() : null;
  if (!queue) return sendJSON(res, { processing: false, queued: 0 });
  sendJSON(res, queue.getStatus());
};

// GET /api/manufacturer/:slug — get manufacturer file
routes['GET /api/manufacturer/:slug'] = (req, res, params) => {
  try {
    const filePath = path.join(MANUFACTURERS_DIR, `${params.slug}.json`);
    if (!fs.existsSync(filePath)) return sendError(res, 'Manufacturer not found', 404);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    sendJSON(res, data);
  } catch (err) {
    sendError(res, err.message);
  }
};

// PUT /api/manufacturer/:slug — update manufacturer file
routes['PUT /api/manufacturer/:slug'] = async (req, res, params) => {
  try {
    const body = await readBody(req);
    const filePath = path.join(MANUFACTURERS_DIR, `${params.slug}.json`);
    let existing = {};
    if (fs.existsSync(filePath)) {
      existing = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
    const updated = { ...existing, ...body, last_updated: new Date().toISOString() };
    fs.writeFileSync(filePath, JSON.stringify(updated, null, 2));
    sendJSON(res, { success: true });
  } catch (err) {
    sendError(res, err.message);
  }
};

// GET /api/score-history/:slug — get score history for a product
routes['GET /api/score-history/:slug'] = (req, res, params) => {
  try {
    const Database = require('better-sqlite3');
    const dbPath = process.env.DATABASE_PATH || path.join(WORKSPACE, 'residentialist.db');
    const db = new Database(dbPath, { readonly: true });
    const rows = db.prepare(
      'SELECT * FROM score_history WHERE product_slug = ? ORDER BY created_at DESC LIMIT 50'
    ).all(params.slug);
    db.close();
    sendJSON(res, rows);
  } catch (err) {
    sendJSON(res, []);
  }
};

// ─── Route Matching ──────────────────────────────────────────────────────────

function matchRoute(method, pathname) {
  const key = `${method} ${pathname}`;
  if (routes[key]) return { handler: routes[key], params: {} };

  // Check parametric routes
  for (const [pattern, handler] of Object.entries(routes)) {
    const [routeMethod, routePath] = pattern.split(' ', 2);
    if (routeMethod !== method) continue;

    const routeParts = routePath.split('/');
    const pathParts = pathname.split('/');

    if (routeParts.length !== pathParts.length) continue;

    const params = {};
    let match = true;
    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i].startsWith(':')) {
        params[routeParts[i].slice(1)] = pathParts[i];
      } else if (routeParts[i] !== pathParts[i]) {
        match = false;
        break;
      }
    }

    if (match) return { handler, params };
  }

  return null;
}

// ─── HTTP Server ─────────────────────────────────────────────────────────────

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname;

  // CORS handling
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  // API routes
  if (pathname.startsWith('/api/')) {
    const route = matchRoute(req.method, pathname);
    if (route) {
      try {
        await route.handler(req, res, route.params);
      } catch (err) {
        sendError(res, err.message);
      }
    } else {
      sendError(res, 'Not found', 404);
    }
    return;
  }

  // Static file serving
  let filePath = pathname === '/' ? '/curation.html' : pathname;
  filePath = path.join(PUBLIC_DIR, filePath);

  // Security: prevent directory traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    return sendError(res, 'Forbidden', 403);
  }

  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || 'text/plain';

  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    } else {
      sendError(res, 'Not found', 404);
    }
  } catch (err) {
    sendError(res, err.message);
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🏠 THE RESIDENTIALIST — Curation Dashboard`);
  console.log(`   Running on http://0.0.0.0:${PORT}`);
  console.log(`   Workspace: ${WORKSPACE}\n`);
});

module.exports = server;
