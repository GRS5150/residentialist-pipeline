/**
 * Residentialist Score Dashboard Server
 * Serves API endpoints + static frontend
 * Port: 7824
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const url = require('url');

// ── Configuration ───────────────────────────────────────────────────────────
const PORT = 7824;
let WORKSPACE = process.env.RESIDENTIALIST_WORKSPACE || path.resolve(__dirname, '..');
// Auto-detect: if DB not found at workspace root, try /residentialist subdirectory
if (!fs.existsSync(path.join(WORKSPACE, 'residentialist.db')) && fs.existsSync(path.join(WORKSPACE, 'residentialist', 'residentialist.db'))) {
  WORKSPACE = path.join(WORKSPACE, 'residentialist');
}
const DB_PATH = path.join(WORKSPACE, 'residentialist.db');
const OUTPUTS_DIR = path.join(WORKSPACE, 'outputs');
const PUBLIC_DIR = path.join(__dirname, 'public');

// ── Phase 2 Directories ─────────────────────────────────────────────────────
const CURATION_DIR = path.join(WORKSPACE, 'curation');
const DEEP_DIVES_DIR = path.join(WORKSPACE, 'deep_dives');
const MANUFACTURERS_DIR = path.join(WORKSPACE, 'manufacturers');
[CURATION_DIR, DEEP_DIVES_DIR, MANUFACTURERS_DIR].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });

let deterministicScorer = null;
let deepDiveQueue = null;
try { deterministicScorer = require('../deterministic_scorer'); } catch (e) { console.log('[DASHBOARD] deterministicScorer not available:', e.message); }
try { deepDiveQueue = require('../deep_dive_queue'); } catch (e) { console.log('[DASHBOARD] deepDiveQueue not available'); }

// ── Sample Data Fallback ────────────────────────────────────────────────────
const sampleData = require('./sample_data');
const USE_SAMPLE = !fs.existsSync(DB_PATH);

if (USE_SAMPLE) {
  console.log('[DASHBOARD] No DB found at', DB_PATH, '— using sample data');
} else {
  console.log('[DASHBOARD] Connected to DB at', DB_PATH);
}

// ── SQLite Helper ───────────────────────────────────────────────────────────
function queryDB(sql) {
  try {
    const result = execSync(`sqlite3 -json "${DB_PATH}" "${sql.replace(/"/g, '\\"')}"`, {
      cwd: WORKSPACE,
      encoding: 'utf-8',
      timeout: 5000
    });
    return JSON.parse(result || '[]');
  } catch (e) {
    console.error('[DB ERROR]', e.message);
    return [];
  }
}

// ── File Helpers ────────────────────────────────────────────────────────────
function productSlugVariants(productName) {
  // Generate multiple slug variants to handle naming mismatches between DB and filesystem.
  // DB names like "E-Series" become e_series but dirs use "eseries". "ZR-7" becomes zr_7 but dirs use "zr7".
  // "JELD-WEN" becomes jeld_wen but dirs use "jeldwen".
  const base = productName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
  const variants = new Set([base]);
  // Without trailing _dh (old pipeline dirs had _dh suffix, new ones don't)
  if (base.endsWith('_dh')) variants.add(base.slice(0, -3));
  // Collapse isolated single-char segments: e_series -> eseries, zr_7 -> zr7
  const collapsed = base.replace(/(?<=_)([a-z0-9])_/g, '$1').replace(/_([a-z0-9])$/g, '$1');
  variants.add(collapsed);
  if (collapsed.endsWith('_dh')) variants.add(collapsed.slice(0, -3));
  // Also try hyphenated-word collapse: jeld_wen -> jeldwen (original word had hyphen)
  // We detect this by checking if the original name had hyphens
  if (productName.includes('-')) {
    const hyphenCollapsed = productName.toLowerCase().replace(/-/g, '').replace(/[^a-z0-9]+/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
    variants.add(hyphenCollapsed);
  }
  // Also try removing _dh then collapsing
  const noDh = base.replace(/_dh$/, '');
  if (noDh !== base) {
    variants.add(noDh);
    const collapsedNoDh = noDh.replace(/(?<=_)([a-z0-9])_/g, '$1').replace(/_([a-z0-9])$/g, '$1');
    variants.add(collapsedNoDh);
  }
  return [...variants];
}

function findLatestRunDir(productName) {
  if (!fs.existsSync(OUTPUTS_DIR)) return null;
  const slugs = productSlugVariants(productName);
  const dirs = fs.readdirSync(OUTPUTS_DIR)
    .filter(d => {
      const lower = d.toLowerCase();
      return slugs.some(slug => lower.includes(slug));
    })
    .sort((a, b) => {
      // Sort by embedded timestamp (YYYY-MM-DDTHH-MM-SS), newest first
      const tsA = (a.match(/\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}/) || [''])[0];
      const tsB = (b.match(/\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}/) || [''])[0];
      return tsB.localeCompare(tsA);
    });
  // Prefer the newest dir that has DETERMINISTIC_SCORES.json (complete run)
  const complete = dirs.find(d => fs.existsSync(path.join(OUTPUTS_DIR, d, 'DETERMINISTIC_SCORES.json')));
  if (complete) return path.join(OUTPUTS_DIR, complete);
  // Fall back to newest dir even without DETERMINISTIC_SCORES
  return dirs.length > 0 ? path.join(OUTPUTS_DIR, dirs[0]) : null;
}

function readJsonFile(dir, pattern) {
  if (!dir || !fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir);
  const match = files.find(f => {
    if (typeof pattern === 'string') return f === pattern;
    return pattern.test(f);
  });
  if (!match) return null;
  try {
    return JSON.parse(fs.readFileSync(path.join(dir, match), 'utf-8'));
  } catch (e) {
    return null;
  }
}

function getQuarantineStats(product) {
  const slug = product.slug || product.product_name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  const evidenceDir = path.join(WORKSPACE, 'evidence');
  const evData = readJsonFile(evidenceDir, new RegExp(slug + '.*\\.json$'));
  if (!evData) return { count: 0, reasons: {} };
  const sources = (evData.professional_consensus && evData.professional_consensus.sources) || [];
  const quarantined = sources.filter(s => s.quarantined && !s.restored);
  const reasons = {};
  quarantined.forEach(s => {
    const r = s.quarantine_reason || 'unknown';
    reasons[r] = (reasons[r] || 0) + 1;
  });
  return { count: quarantined.length, reasons };
}


// ── Evidence File Helper ────────────────────────────────────────────────────
const EVIDENCE_DIR = path.join(WORKSPACE, 'evidence');

function findEvidenceFile(productName) {
  if (!fs.existsSync(EVIDENCE_DIR)) return null;
  const slugs = productSlugVariants(productName);
  const files = fs.readdirSync(EVIDENCE_DIR).filter(f => f.endsWith('.json'));
  const match = files.find(f => {
    const lower = f.toLowerCase();
    return slugs.some(slug => lower.includes(slug));
  });
  if (!match) return null;
  return path.join(EVIDENCE_DIR, match);
}

function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => {
      try { resolve(JSON.parse(Buffer.concat(chunks).toString())); }
      catch (e) { reject(e); }
    });
    req.on('error', reject);
  });
}

function getSourceUrlMap(productName) {
  // Build a lookup: source_name → url from the evidence file
  if (!fs.existsSync(EVIDENCE_DIR)) return {};
  const slugs = productSlugVariants(productName);
  const files = fs.readdirSync(EVIDENCE_DIR).filter(f => f.endsWith('.json'));
  const match = files.find(f => {
    const lower = f.toLowerCase();
    return slugs.some(slug => lower.includes(slug));
  });
  if (!match) return {};
  try {
    const data = JSON.parse(fs.readFileSync(path.join(EVIDENCE_DIR, match), 'utf-8'));
    const urlMap = {};
    const pc = data.professional_consensus;
    if (pc && pc.sources) {
      for (const src of pc.sources) {
        if (src.url && src.name) {
          urlMap[src.name] = src.url;
        }
      }
    }
    return urlMap;
  } catch (e) {
    return {};
  }
}

// Score tier labels
function getScoreTier(score) {
  if (score == null) return null;
  if (score >= 90) return 'Best in Class';
  if (score >= 75) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Below Standard';
}

// Price Integrity labels
function getPriceIntegrityLabel(pi) {
  const labels = {
    exceeds: { label: 'Strong value for the category', detail: 'Delivers more quality than its price tier suggests', css: 'pi-exceeds' },
    meets: { label: 'Priced mid-range for this category', detail: 'Quality matches what you pay', css: 'pi-meets' },
    below: { label: 'Overpriced relative to performance', detail: 'Quality falls short of its price point', css: 'pi-below' }
  };
  return labels[pi] || null;
}


// ── Manufacturer Source Filter ──────────────────────────────────────────────
// Server-side filter to reclassify manufacturer-own sources in pool_details.
// Catches contamination from pre-fix scoring data until products are re-scored.
const MANUFACTURER_DOMAINS = {
  'Andersen':      ['andersenwindows.com', 'andersen.com', 'renewalbyandersen.com'],
  'Marvin':        ['marvin.com'],
  'Pella':         ['pella.com'],
  'Loewen':        ['loewen.com'],
  'Milgard':       ['milgard.com'],
  'Jeld-Wen':      ['jeld-wen.com'],
  'Simonton':      ['simonton.com'],
  'Sierra Pacific': ['sierrapacificwindows.com'],
  'Alpen':         ['alpenwindows.com'],
  'Ply Gem':       ['plygem.com'],
  'Window World':  ['windowworldinc.com', 'windowworld.com'],
  'Harvey':        ['harveywindows.com', 'harveybp.com'],
  'Lincoln':       ['lincolnwindows.com'],
  'Weather Shield': ['weathershield.com'],
};
const MANUFACTURER_YT_CHANNELS = [
  'loewen windows', 'loewenwindows', 'marvin windows', 'andersen windows',
  'pella windows', 'milgard windows', 'jeld-wen', 'simonton windows',
  'weather shield', 'lincoln windows', 'harvey windows', 'alpen windows',
  'sierra pacific windows', 'window world'
];

function filterManufacturerSources(poolDetails, productName) {
  if (!poolDetails || !productName) return poolDetails;
  // Extract manufacturer from product name (first word or known mapping)
  const pLower = productName.toLowerCase();
  let mfg = null;
  const mfgMap = {
    'andersen': 'Andersen', 'marvin': 'Marvin', 'pella': 'Pella',
    'loewen': 'Loewen', 'milgard': 'Milgard', 'jeld-wen': 'Jeld-Wen',
    'simonton': 'Simonton', 'sierra pacific': 'Sierra Pacific',
    'alpen': 'Alpen', 'ply gem': 'Ply Gem', 'window world': 'Window World',
    'harvey': 'Harvey', 'lincoln': 'Lincoln', 'weather shield': 'Weather Shield',
    'reliabilt': 'Reliabilt'
  };
  for (const [prefix, name] of Object.entries(mfgMap)) {
    if (pLower.startsWith(prefix)) { mfg = name; break; }
  }
  if (!mfg) return poolDetails;

  const mfgDomains = MANUFACTURER_DOMAINS[mfg] || [];
  const mfgLower = mfg.toLowerCase();

  function isManufacturerOwn(src) {
    const srcUrl = src.url || '';
    try {
      const domain = new URL(srcUrl).hostname.replace(/^www\./, '').toLowerCase();
      // Check manufacturer domains
      if (mfgDomains.some(d => domain === d || domain.endsWith('.' + d))) return true;
      // Check manufacturer YouTube channels and manufacturer-titled videos
      if (domain === 'youtube.com' || domain === 'youtu.be') {
        const nameLower = (src.name || '').toLowerCase();
        if (MANUFACTURER_YT_CHANNELS.some(ch => nameLower.includes(ch))) return true;
        // Also catch videos titled with manufacturer name (e.g., "YouTube — Loewen Double Hung")
        if (nameLower.includes(mfgLower + ' ') || nameLower.includes('— ' + mfgLower + ' ') || nameLower.includes('- ' + mfgLower + ' ')) return true;
      }
      // Check if domain contains manufacturer name
      if (mfgLower.length >= 4 && domain.includes(mfgLower)) return true;
    } catch (e) {}
    return false;
  }

  // Move manufacturer-own sources from their current pool to excluded
  if (!poolDetails.excluded) poolDetails.excluded = { count: 0, sources: [] };
  for (const poolKey of Object.keys(poolDetails)) {
    if (poolKey === 'excluded') continue;
    const pd = poolDetails[poolKey];
    if (!pd || !pd.sources) continue;
    const keep = [];
    for (const src of pd.sources) {
      if (isManufacturerOwn(src)) {
        poolDetails.excluded.sources.push({ ...src, pool: 'excluded', source_type: 'manufacturer_own' });
      } else {
        keep.push(src);
      }
    }
    pd.sources = keep;
    pd.count = keep.length;
  }
  poolDetails.excluded.count = poolDetails.excluded.sources.length;
  return poolDetails;
}

// ── MIME Types ───────────────────────────────────────────────────────────────
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff'
};

const activeJobs = new Map();

// ── API Routes ──────────────────────────────────────────────────────────────
async function handleAPI(req, res, parsedUrl) {

  const pathname = parsedUrl.pathname;

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
  const curationSlugMatch = pathname.match(/^\/api\/curation\/([^/]+)$/);
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
  const classifyMatch = pathname.match(/^\/api\/curation\/([^/]+)\/classify$/);
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
  const bulkClassifyMatch = pathname.match(/^\/api\/curation\/([^/]+)\/bulk-classify$/);
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
  const releaseMatch = pathname.match(/^\/api\/curation\/([^/]+)\/release$/);
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

  // GET /api/curation/:slug/pipeline-status — poll pipeline progress
  const pipelineStatusMatch = pathname.match(/^\/api\/curation\/([^/]+)\/pipeline-status$/);
  if (pipelineStatusMatch && req.method === 'GET') {
    const slug = pipelineStatusMatch[1];
    const progressPath = path.join(CURATION_DIR, slug + '_pipeline_progress.json');
    try {
      if (fs.existsSync(progressPath)) {
        const progress = JSON.parse(fs.readFileSync(progressPath, 'utf8'));
        sendJSON(res, progress);
      } else {
        sendJSON(res, { status: 'idle', message: 'No pipeline running' });
      }
    } catch (err) {
      sendJSON(res, { status: 'error', message: err.message });
    }
    return true;
  }

    // POST /api/curation/:slug/rescore — run scoring pipeline on curated product
  const rescoreMatch = pathname.match(/^\/api\/curation\/([^/]+)\/rescore$/);
  if (rescoreMatch && req.method === 'POST') {
    try {
      const slug = rescoreMatch[1];
      const curationFile = path.join(CURATION_DIR, slug + '_sources.json');
      const deepDiveDir = path.join(path.dirname(CURATION_DIR), 'deep_dives', slug);

      // Check if this product has a curation file (deep dive path)
      if (fs.existsSync(curationFile) && fs.existsSync(deepDiveDir)) {
        // Fork score_from_curation_v2.js as a child process (pipeline takes minutes)
        const { fork } = require('child_process');
        const pipelinePath = path.join(WORKSPACE, 'score_from_curation_v2.js');

        if (!fs.existsSync(pipelinePath)) {
          sendJSON(res, { error: 'score_from_curation_v2.js not found' }, 500);
          return true;
        }

        console.log(`[RESCORE] Forking curation pipeline for: ${slug}`);
        const child = fork(pipelinePath, [slug], {
          cwd: WORKSPACE,
          env: { ...process.env, OPENCLAW_WORKSPACE: WORKSPACE },
          stdio: ['pipe', 'pipe', 'pipe', 'ipc']
        });

        let logOutput = '';
        child.stdout.on('data', d => { logOutput += d.toString(); console.log(`[PIPELINE:${slug}] ${d.toString().trim()}`); });
        child.stderr.on('data', d => { logOutput += d.toString(); console.error(`[PIPELINE:${slug}] ERR: ${d.toString().trim()}`); });

        child.on('exit', (code) => {
          console.log(`[PIPELINE:${slug}] Exited with code: ${code}`);
          // Save log to output for debugging
          const logPath = path.join(WORKSPACE, 'curation', slug + '_pipeline_log.txt');
          try { fs.writeFileSync(logPath, logOutput); } catch (e) {}
        });

        sendJSON(res, {
          started: true,
          message: `Pipeline started for ${slug} (Bot 2 → Scorer → Council)`,
          note: 'Pipeline runs in background. Check curation list for updated score.'
        });
      } else if (deterministicScorer) {
        // No curation file — use existing Bot 2 output for rescore
        let result;
        if (typeof deterministicScorer.rescoreProduct === 'function') {
          result = deterministicScorer.rescoreProduct(slug, 'windows');
        } else {
          sendJSON(res, { error: 'No scoring function available' }, 500);
          return true;
        }
        if (result && typeof result.then === 'function') result = await result;
        sendJSON(res, result || { success: true });
      } else {
        sendJSON(res, { error: 'Neither curation file nor scorer module available' }, 500);
      }
    } catch (err) {
      console.error('[RESCORE ERROR]', err);
      sendJSON(res, { error: err.message }, 500);
    }
    return true;
  }

    // POST /api/deepdive/start — start full pipeline (deep dive → V2 score) via nohup
  if (pathname === '/api/deepdive/start' && req.method === 'POST') {
    try {
      const body = await readBody(req);
      if (!body.product_name) { sendJSON(res, { error: 'product_name required' }, 400); return true; }
      const productName = body.product_name;
      const operationType = body.operation_type || 'double_hung';
      const slug = productName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') + '_' + operationType;

      // Write initial progress so polling starts immediately
      const progressPath = path.join(CURATION_DIR, `${slug}_pipeline_progress.json`);
      fs.writeFileSync(progressPath, JSON.stringify({
        slug, step: 0, total: 6, current_bot: 'Starting full pipeline...', status: 'running',
        updated: new Date().toISOString(), phase: 'starting'
      }, null, 2));

      // Launch full_pipeline.js as a detached nohup background process
      const logPath = path.join(WORKSPACE, 'deep_dives', `${slug}_pipeline.log`);
      const fullPipelinePath = path.join(WORKSPACE, 'full_pipeline.js');
      const { spawn } = require('child_process');
      const nodePath = process.execPath; // use same node binary that runs the dashboard
      const child = spawn('nohup', [nodePath, fullPipelinePath, productName, operationType], {
        cwd: WORKSPACE,
        detached: true,
        stdio: ['ignore', fs.openSync(logPath, 'a'), fs.openSync(logPath, 'a')],
        env: { ...process.env }
      });
      child.unref();

      console.log(`[DASHBOARD] Full pipeline launched for "${productName}" (${operationType}), PID=${child.pid}, log=${logPath}`);
      sendJSON(res, { success: true, message: 'Full pipeline launched (deep dive → scoring)', product: productName, slug, pid: child.pid });
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
  const mfgMatch = pathname.match(/^\/api\/manufacturer\/([^/]+)$/);
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
  const historyMatch = pathname.match(/^\/api\/score-history\/([^/]+)$/);
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


  // GET /api/products
  if (pathname === '/api/products' && req.method === 'GET') {
    let products;
    if (USE_SAMPLE) {
      products = sampleData.SAMPLE_PRODUCTS;
    } else {
      products = queryDB(
        "SELECT id, product_name, product_line, category, overall_score, quality_score, durability_score, performance_score, material_safety_score, material_class, config, price_amount, price_unit, price_reference_spec, price_note, price_integrity FROM products WHERE overall_score IS NOT NULL AND (status IS NULL OR status != 'rejected') ORDER BY overall_score DESC"
      );
    }
    // Add computed fields
    products = products.map(p => ({
      ...p,
      grade: sampleData.applySafetyCap(sampleData.getGrade(p.overall_score), p.material_safety_score),
      outlook: sampleData.getOutlook(p.overall_score)
    ,
      score_tier: getScoreTier(p.overall_score),
      price_amount: p.price_amount,
      price_unit: p.price_unit,
      price_reference_spec: p.price_reference_spec,
      price_note: p.price_note,
      price_integrity: p.price_integrity,
      price_integrity_label: getPriceIntegrityLabel(p.price_integrity)}));
    sendJSON(res, products);
    return true;
  }

  // GET /api/product/:id/sources
  const sourcesMatch = pathname.match(/^\/api\/product\/(\d+)\/sources$/);
  if (sourcesMatch && req.method === 'GET') {
    const id = parseInt(sourcesMatch[1]);
    let product;
    if (USE_SAMPLE) {
      product = sampleData.SAMPLE_PRODUCTS.find(p => p.id === id);
    } else {
      const rows = queryDB(`SELECT * FROM products WHERE id = ${id}`);
      product = rows[0];
    }
    if (!product) { sendJSON(res, { error: 'Not found' }, 404); return true; }

    // Try real output files first
    const runDir = findLatestRunDir(product.product_name);
    const detScores = readJsonFile(runDir, 'DETERMINISTIC_SCORES.json');
    let poolDetails;
    if (detScores && detScores.professional_consensus && detScores.professional_consensus.pool_details) {
      poolDetails = detScores.professional_consensus.pool_details;
    } else {
      // Try curation sources (V2 pipeline)
      const productSlugForSrc = product.product_name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
      let curationData = null;
      const srcVariants = [productSlugForSrc + '_double_hung', productSlugForSrc];
      for (const sv of srcVariants) {
        const cp = path.join(CURATION_DIR, sv + '_sources.json');
        if (fs.existsSync(cp)) { try { curationData = JSON.parse(fs.readFileSync(cp, 'utf8')); } catch(e) {} break; }
      }
      // Also try glob match
      if (!curationData && fs.existsSync(CURATION_DIR)) {
        const cFiles = fs.readdirSync(CURATION_DIR).filter(f => f.endsWith('_sources.json'));
        const slugBase = productSlugForSrc.replace(/_/g, '');
        const match = cFiles.find(f => f.replace(/_/g, '').includes(slugBase));
        if (match) { try { curationData = JSON.parse(fs.readFileSync(path.join(CURATION_DIR, match), 'utf8')); } catch(e) {} }
      }

      if (curationData && curationData.sources && curationData.sources.length > 0) {
        // Build pool_details from curation sources with real names
        const pools = {};
        for (const src of curationData.sources) {
          if (src.classification === 'quarantine') continue;
          const poolKey = src.pool || 'C';
          if (!pools[poolKey]) pools[poolKey] = { count: 0, sources: [] };
          pools[poolKey].sources.push({
            name: src.source_name || src.id,
            url: src.url || '',
            summary: src.snippet || '',
            pool: poolKey,
            platform: src.platform || 'other',
            classification: src.classification
          });
          pools[poolKey].count = pools[poolKey].sources.length;
        }
        poolDetails = pools;
      } else {
        const generated = sampleData.generateDetailedScores(product);
        poolDetails = generated.professional_consensus.pool_details;
      }
    }
    // Merge URLs from evidence file into pool_details sources
    const urlMap = getSourceUrlMap(product.product_name);
    if (poolDetails && Object.keys(urlMap).length > 0) {
      for (const poolKey of Object.keys(poolDetails)) {
        const pd = poolDetails[poolKey];
        if (pd && pd.sources) {
          pd.sources = pd.sources.map(src => {
            const url = urlMap[src.name];
            return url ? { ...src, url } : src;
          });
        }
      }
    }
    // Filter out manufacturer-own sources that leaked into consensus pools
    filterManufacturerSources(poolDetails, product.product_name);
    // Merge quarantine status from evidence file into pool_details sources
    const evidencePathForQ = findEvidenceFile(product.product_name);
    if (evidencePathForQ) {
      try {
        const evData = JSON.parse(fs.readFileSync(evidencePathForQ, 'utf-8'));
        const evSources = (evData.professional_consensus && evData.professional_consensus.sources) || [];
        // Build a set of quarantined source names and URLs
        const qNames = new Set();
        const qUrls = new Set();
        evSources.forEach(s => {
          if (s.quarantined && !s.restored) {
            if (s.name) qNames.add(s.name.toLowerCase().trim());
            if (s.url) qUrls.add(s.url.toLowerCase().trim());
          }
        });
        // Mark matching sources in pool_details
        for (const poolKey of Object.keys(poolDetails)) {
          const pd = poolDetails[poolKey];
          if (pd && pd.sources) {
            pd.sources.forEach(src => {
              const sName = (src.name || '').toLowerCase().trim();
              const sUrl = (src.url || '').toLowerCase().trim();
              if (qNames.has(sName) || (sUrl && qUrls.has(sUrl))) {
                src.is_quarantined = true;
              }
            });
          }
        }
      } catch(e) { /* ignore errors, quarantine status is optional */ }
    }
    sendJSON(res, { product_name: product.product_name, pool_details: poolDetails });
    return true;
  }

  // GET /api/product/:id/quarantine
  const quarantineMatch = pathname.match(/^\/api\/product\/(\d+)\/quarantine$/);
  if (quarantineMatch && req.method === 'GET') {
    const id = parseInt(quarantineMatch[1]);
    let product;
    if (USE_SAMPLE) {
      product = sampleData.SAMPLE_PRODUCTS.find(p => p.id === id);
    } else {
      const rows = queryDB(`SELECT * FROM products WHERE id = ${id}`);
      product = rows[0];
    }
    if (!product) { sendJSON(res, { error: 'Not found' }, 404); return true; }

    const evidencePath = findEvidenceFile(product.product_name);
    if (!evidencePath) {
      sendJSON(res, { product_name: product.product_name, quarantined: [], restored: [], total_sources: 0, active_count: 0 });
      return true;
    }
    try {
      const data = JSON.parse(fs.readFileSync(evidencePath, 'utf-8'));
      const sources = (data.professional_consensus && data.professional_consensus.sources) || [];
      const quarantined = sources.filter(s => s.quarantined && s.restored !== true).map(s => ({
        id: s.id, name: s.name, pool: s.pool, url: s.url,
        quarantine_reason: s.quarantine_reason, quarantined_at: s.quarantined_at,
        summary: (s.summary || '').replace(/<[^>]+>/g, ' ').substring(0, 200)
      }));
      const restored = sources.filter(s => s.quarantined && s.restored === true).map(s => ({
        id: s.id, name: s.name, pool: s.pool, url: s.url, quarantine_reason: s.quarantine_reason
      }));
      const active = sources.filter(s => !s.quarantined || s.restored === true).length;
      sendJSON(res, { product_name: product.product_name, quarantined, restored, total_sources: sources.length, active_count: active });
    } catch (e) {
      sendJSON(res, { error: 'Failed to read evidence file' }, 500);
    }
    return true;
  }

  // POST /api/product/:id/quarantine/restore
  const restoreMatch = pathname.match(/^\/api\/product\/(\d+)\/quarantine\/restore$/);
  if (restoreMatch && req.method === 'POST') {
    const id = parseInt(restoreMatch[1]);
    let product;
    if (USE_SAMPLE) {
      product = sampleData.SAMPLE_PRODUCTS.find(p => p.id === id);
    } else {
      const rows = queryDB(`SELECT * FROM products WHERE id = ${id}`);
      product = rows[0];
    }
    if (!product) { sendJSON(res, { error: 'Not found' }, 404); return true; }

    parseRequestBody(req).then(body => {
      const sourceId = body && body.source_id;
      if (!sourceId) { sendJSON(res, { error: 'Missing source_id' }, 400); return; }

      const evidencePath = findEvidenceFile(product.product_name);
      if (!evidencePath) { sendJSON(res, { error: 'No evidence file' }, 404); return; }

      try {
        const data = JSON.parse(fs.readFileSync(evidencePath, 'utf-8'));
        const sources = (data.professional_consensus && data.professional_consensus.sources) || [];
        const src = sources.find(s => s.id === sourceId);
        if (!src) { sendJSON(res, { error: 'Source not found' }, 404); return; }
        src.restored = true;
        fs.writeFileSync(evidencePath, JSON.stringify(data, null, 2));
        console.log(`[QUARANTINE] Restored source ${sourceId} for ${product.product_name}`);
        sendJSON(res, { success: true, source_id: sourceId });
      } catch (e) {
        sendJSON(res, { error: 'Failed to restore source' }, 500);
      }
    }).catch(() => {
      sendJSON(res, { error: 'Invalid request body' }, 400);
    });
    return true;
  }

  // GET /api/product/:id
  const productMatch = pathname.match(/^\/api\/product\/(\d+)$/);
  if (productMatch && req.method === 'GET') {
    const id = parseInt(productMatch[1]);
    let product, scoreHistory;

    if (USE_SAMPLE) {
      product = sampleData.SAMPLE_PRODUCTS.find(p => p.id === id);
      scoreHistory = sampleData.SAMPLE_SCORE_HISTORY[id] || [
        { scored_at: new Date().toISOString(), overall_score: product ? product.overall_score : 0, quality_score: product ? product.quality_score : 0, durability_score: product ? product.durability_score : 0, performance_score: product ? product.performance_score : 0, confidence: "HIGH", undisclosed_count: 2 }
      ];
    } else {
      const rows = queryDB(`SELECT * FROM products WHERE id = ${id}`);
      product = rows[0];
      scoreHistory = queryDB(`SELECT * FROM scores WHERE product_id = ${id} ORDER BY scored_at DESC LIMIT 5`)
        .map(s => ({
          ...s,
          overall_score: s.overall || s.overall_score,
          quality_score: s.quality || s.quality_score,
          durability_score: s.durability || s.durability_score,
          performance_score: s.performance || s.performance_score,
          confidence: s.data_confidence || s.confidence || 'UNKNOWN'
        }));
    }

    if (!product) { sendJSON(res, { error: 'Not found' }, 404); return true; }

    // Try real output files
    const qStats = getQuarantineStats(product);
    const runDir = findLatestRunDir(product.product_name);
    const detScoresRaw = readJsonFile(runDir, 'DETERMINISTIC_SCORES.json');
    const bot2 = readJsonFile(runDir, /bot2_evaluator\.json$/) || sampleData.generateBot2Findings(product);
    let bot3 = readJsonFile(runDir, /bot3_material_safety\.json$/);
    if (!bot3 && detScoresRaw && detScoresRaw.health_label) {
      // V2 pipeline — construct material health from DETERMINISTIC_SCORES + REPORT
      const reportData = readJsonFile(runDir, 'REPORT.json');
      const healthLabel = detScoresRaw.health_label;
      const materialClass = (product.material_class || '').toLowerCase();
      // Vinyl baseline: 7.0-7.5 (Moderate)
      let healthScore = materialClass.includes('vinyl') || materialClass.includes('pvc') ? 7.2
        : materialClass.includes('fiberglass') ? 8.5
        : materialClass.includes('wood') ? 7.8
        : materialClass.includes('composite') || materialClass.includes('fibrex') ? 7.0
        : materialClass.includes('aluminum') ? 7.5
        : 7.0;
      bot3 = {
        material_safety_score: healthScore,
        grade: healthLabel,
        tier: healthLabel,
        flags: healthScore < 7.0 ? ['PVC content in frame material'] : [],
        certifications_found: healthScore >= 8.0 ? ['ENERGY STAR Certified', 'NFRC Certified', 'GREENGUARD'] : ['ENERGY STAR Certified', 'NFRC Certified'],
        buyer_note: (reportData && reportData.material_health_summary) || '',
        reasoning: (reportData && reportData.material_health_summary) || ''
      };
    }
    if (!bot3) bot3 = sampleData.generateBot3MaterialSafety(product);
    const pipeline = readJsonFile(runDir, 'PIPELINE_STATUS.json') || { status: 'PASS', corrections: [], outlook: sampleData.getOutlook(product.overall_score) };

    // Merge deterministic scores with bot2 scores structure
    // Bot2 has the axes structure (quality/durability/performance with sub-scores)
    // Deterministic scores have the accurate calculated values
    let detScores;
    if (detScoresRaw && bot2 && bot2.scores) {
      // Use bot2 structure as base, overlay deterministic values
      detScores = {
        ...detScoresRaw,
        overall: product.overall_score,
        grade: sampleData.getGrade(product.overall_score),
        outlook: bot2.outlook || pipeline.outlook || sampleData.getOutlook(product.overall_score),
        outlook_detail: bot2.reasoning_summary || '',
        material_safety: (bot3 && bot3.material_safety_score) || product.material_safety_score,
        scores: {
          quality: {
            ...bot2.scores.quality,
            axis_score: product.quality_score || bot2.scores.quality.axis_score,
            component_quality: {
              ...(bot2.scores.quality.component_quality || {}),
              score: (detScoresRaw.component_quality && detScoresRaw.component_quality.score) || (bot2.scores.quality.component_quality && bot2.scores.quality.component_quality.score),
            },
            manufacturing_quality: {
              ...(bot2.scores.quality.manufacturing_quality || {}),
              score: (detScoresRaw.manufacturing_quality && detScoresRaw.manufacturing_quality.score) || (bot2.scores.quality.manufacturing_quality && bot2.scores.quality.manufacturing_quality.score),
            },
            professional_consensus: {
              ...(bot2.scores.quality.professional_consensus || {}),
              score: (detScoresRaw.professional_consensus && detScoresRaw.professional_consensus.score) || (bot2.scores.quality.professional_consensus && bot2.scores.quality.professional_consensus.score),
              quarantined_count: qStats.count,
              quarantine_reasons: qStats.reasons,
            }
          },
          durability: {
            ...bot2.scores.durability,
            axis_score: product.durability_score || bot2.scores.durability.axis_score,
            frame_longevity: bot2.scores.durability.frame_longevity || {},
            materials_durability: {
              ...(bot2.scores.durability.materials_durability || {}),
              score: (detScoresRaw.materials_durability && detScoresRaw.materials_durability.score) || (bot2.scores.durability.materials_durability && bot2.scores.durability.materials_durability.score),
              base: detScoresRaw.materials_durability && detScoresRaw.materials_durability.base,
              adjustments: detScoresRaw.materials_durability && detScoresRaw.materials_durability.adjustments,
            },
            repairability: {
              ...(bot2.scores.durability.repairability || {}),
              score: (detScoresRaw.repairability && detScoresRaw.repairability.score) || (bot2.scores.durability.repairability && bot2.scores.durability.repairability.score),
            }
          },
          performance: {
            ...bot2.scores.performance,
            axis_score: product.performance_score || bot2.scores.performance.axis_score
          }
        }
      };
    } else if (detScoresRaw) {
      // No bot2 — build structure from deterministic + product table
      // Load V2 pipeline data: SONNET_SCORES.json for reasoning, curation for source names
      const sonnetScores = readJsonFile(runDir, 'SONNET_SCORES.json');
      const reportData = readJsonFile(runDir, 'REPORT.json');

      // Try to load curation sources for real source names
      let curationSources = [];
      const productSlug = product.product_name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
      const curationVariants = [productSlug + '_double_hung', productSlug, productSlug.replace(/_series$/, '')];
      for (const cv of curationVariants) {
        const cPath = path.join(CURATION_DIR, cv + '_sources.json');
        if (fs.existsSync(cPath)) {
          try {
            const cData = JSON.parse(fs.readFileSync(cPath, 'utf8'));
            curationSources = (cData.sources || []).filter(s => s.classification === 'score');
          } catch (e) {}
          break;
        }
      }
      // Also try glob match
      if (curationSources.length === 0 && fs.existsSync(CURATION_DIR)) {
        const cFiles = fs.readdirSync(CURATION_DIR).filter(f => f.endsWith('_sources.json'));
        const slugBase = productSlug.replace(/_/g, '');
        const match = cFiles.find(f => f.replace(/_/g, '').includes(slugBase));
        if (match) {
          try {
            const cData = JSON.parse(fs.readFileSync(path.join(CURATION_DIR, match), 'utf8'));
            curationSources = (cData.sources || []).filter(s => s.classification === 'score');
          } catch (e) {}
        }
      }

      // Build source key_sources display from curation or sonnet
      const qualitySources = sonnetScores && sonnetScores.quality ? (sonnetScores.quality.key_sources || []).join(', ') : '';
      const durabilitySources = sonnetScores && sonnetScores.durability ? (sonnetScores.durability.key_sources || []).join(', ') : '';
      const performanceSources = sonnetScores && sonnetScores.performance ? (sonnetScores.performance.key_sources || []).join(', ') : '';

      // Build reasoning from Sonnet
      const qReasoning = sonnetScores && sonnetScores.quality ? (sonnetScores.quality.reasoning || []).join('\n\n') : '';
      const dReasoning = sonnetScores && sonnetScores.durability ? (sonnetScores.durability.reasoning || []).join('\n\n') : '';
      const pReasoning = sonnetScores && sonnetScores.performance ? (sonnetScores.performance.reasoning || []).join('\n\n') : '';

      detScores = {
        ...detScoresRaw,
        overall: product.overall_score,
        grade: sampleData.getGrade(product.overall_score),
        outlook: pipeline.outlook || sampleData.getOutlook(product.overall_score),
        outlook_detail: reportData ? (reportData.product_summary || '') : '',
        material_safety: (bot3 && bot3.material_safety_score) || product.material_safety_score,
        sonnet_scores: sonnetScores || null,
        curation_sources: curationSources,
        scores: {
          quality: {
            axis_score: product.quality_score,
            component_quality: detScoresRaw.component_quality || {},
            manufacturing_quality: detScoresRaw.manufacturing_quality || {},
            professional_consensus: detScoresRaw.professional_consensus || {},
            reasoning: qReasoning,
            key_sources: qualitySources
          },
          durability: {
            axis_score: product.durability_score,
            frame_longevity: { score: 0, reasoning: dReasoning ? dReasoning.split('\n\n')[0] : '' },
            materials_durability: detScoresRaw.materials_durability || { reasoning: dReasoning },
            repairability: detScoresRaw.repairability || { reasoning: dReasoning ? dReasoning.split('\n\n').slice(-1)[0] : '' },
            reasoning: dReasoning,
            key_sources: durabilitySources
          },
          performance: {
            axis_score: product.performance_score,
            thermal: { score: 0, reasoning: pReasoning ? pReasoning.split('\n\n')[0] : '' },
            structural: { score: 0, reasoning: pReasoning ? pReasoning.split('\n\n')[1] || '' : '' },
            air_water: { score: 0, reasoning: pReasoning ? pReasoning.split('\n\n').slice(-1)[0] : '' },
            reasoning: pReasoning,
            key_sources: performanceSources
          }
        }
      };
    } else {
      detScores = sampleData.generateDetailedScores(product);
    }

    sendJSON(res, {
      product,
      score_history: scoreHistory,
      deterministic_scores: detScores,
      bot2_findings: bot2,
      bot3_material_safety: bot3,
      pipeline_status: pipeline,
      run_dir: runDir ? path.basename(runDir) : null
    });
    return true;
  }


  // POST /api/pipeline/run
  if (pathname === '/api/pipeline/run' && req.method === 'POST') {
    parseRequestBody(req).then(body => {
      const { product_name, category, config } = body || {};
      if (!product_name) { sendJSON(res, { error: 'Missing product_name' }, 400); return; }
      const jobId = Date.now();
      const pipelineCode = "const p = require('../bot_orchestrator_v3'); p.runPipeline('" + product_name + "', '" + (config || '') + "');";
      const child = require('child_process').spawn('node', ['-e', pipelineCode], { cwd: path.join(__dirname, '..'), detached: true, stdio: 'ignore' });
      child.unref();
      activeJobs.set(jobId, { product_name, category, config, status: 'running', startedAt: new Date() });
      sendJSON(res, { success: true, job_id: jobId });
    }).catch(() => { sendJSON(res, { error: 'Invalid request body' }, 400); });
    return true;
  }

  // GET /api/products/:id/quarantine
  const productsQuarantineMatch = pathname.match(/^\/api\/products\/(\d+)\/quarantine$/);
  if (productsQuarantineMatch && req.method === 'GET') {
    const id = parseInt(productsQuarantineMatch[1]);
    let product;
    if (USE_SAMPLE) {
      product = sampleData.SAMPLE_PRODUCTS.find(p => p.id === id);
    } else {
      const rows = queryDB(`SELECT * FROM products WHERE id = ${id}`);
      product = rows[0];
    }
    if (!product) { sendJSON(res, { error: 'Not found' }, 404); return true; }
    const evidencePath = findEvidenceFile(product.product_name);
    if (!evidencePath) {
      sendJSON(res, { product_name: product.product_name, sources: [], quarantined_count: 0, active_count: 0 });
      return true;
    }
    try {
      const data = JSON.parse(fs.readFileSync(evidencePath, 'utf-8'));
      const sources = (data.professional_consensus && data.professional_consensus.sources) || [];
      const result = sources.map(s => ({
        name: s.name,
        pool: s.pool,
        sentiment: s.sentiment,
        summary: (s.summary || '').replace(/<[^>]+>/g, ' ').substring(0, 200),
        quarantined: !!s.quarantined,
        quarantine_reason: s.quarantine_reason || null,
        restored: !!s.restored
      }));
      const quarantined_count = result.filter(s => s.quarantined && !s.restored).length;
      const active_count = result.filter(s => !s.quarantined || s.restored).length;
      sendJSON(res, { product_name: product.product_name, sources: result, quarantined_count, active_count });
    } catch (e) {
      sendJSON(res, { error: 'Failed to read evidence file' }, 500);
    }
    return true;
  }

  // POST /api/products/:id/quarantine/restore
  const productsRestoreMatch = pathname.match(/^\/api\/products\/(\d+)\/quarantine\/restore$/);
  if (productsRestoreMatch && req.method === 'POST') {
    const id = parseInt(productsRestoreMatch[1]);
    let product;
    if (USE_SAMPLE) {
      product = sampleData.SAMPLE_PRODUCTS.find(p => p.id === id);
    } else {
      const rows = queryDB(`SELECT * FROM products WHERE id = ${id}`);
      product = rows[0];
    }
    if (!product) { sendJSON(res, { error: 'Not found' }, 404); return true; }
    parseRequestBody(req).then(body => {
      const source_indices = (body && body.source_indices) || [];
      if (!Array.isArray(source_indices)) { sendJSON(res, { error: 'source_indices must be an array' }, 400); return; }
      const evidencePath = findEvidenceFile(product.product_name);
      if (!evidencePath) { sendJSON(res, { error: 'No evidence file' }, 404); return; }
      try {
        const data = JSON.parse(fs.readFileSync(evidencePath, 'utf-8'));
        const sources = (data.professional_consensus && data.professional_consensus.sources) || [];
        let restored_count = 0;
        source_indices.forEach(idx => {
          if (sources[idx]) { sources[idx].restored = true; restored_count++; }
        });
        fs.writeFileSync(evidencePath, JSON.stringify(data, null, 2));
        sendJSON(res, { success: true, restored_count });
      } catch (e) {
        sendJSON(res, { error: 'Failed to restore sources' }, 500);
      }
    }).catch(() => { sendJSON(res, { error: 'Invalid request body' }, 400); });
    return true;
  }

  // POST /api/products/:id/quarantine/add
  const productsQuarantineAddMatch = pathname.match(/^\/api\/products\/(\d+)\/quarantine\/add$/);
  if (productsQuarantineAddMatch && req.method === "POST") {
    const id = parseInt(productsQuarantineAddMatch[1]);
    let product;
    if (USE_SAMPLE) {
      product = sampleData.SAMPLE_PRODUCTS.find(p => p.id === id);
    } else {
      const rows = queryDB(`SELECT * FROM products WHERE id = ${id}`);
      product = rows[0];
    }
    if (!product) { sendJSON(res, { error: "Not found" }, 404); return true; }
    parseRequestBody(req).then(body => {
      const source_entries = (body && body.source_entries) || [];
      const source_names = (body && body.source_names) || [];
      if (source_entries.length === 0 && source_names.length === 0) {
        sendJSON(res, { error: "source_entries or source_names required" }, 400); return;
      }
      const evidencePath = findEvidenceFile(product.product_name);
      if (!evidencePath) { sendJSON(res, { error: "No evidence file" }, 404); return; }
      
      try {
        const data = JSON.parse(fs.readFileSync(evidencePath, "utf-8"));
        const sources = (data.professional_consensus && data.professional_consensus.sources) || [];
        let quarantined_count = 0;
        
        // Build URL and name sets for matching
        const urlSet = new Set();
        const nameSet = new Set();
        if (source_entries.length > 0) {
          source_entries.forEach(e => {
            if (e.url) urlSet.add(e.url.toLowerCase().trim());
            if (e.name) nameSet.add(e.name.toLowerCase().trim());
          });
        } else {
          source_names.forEach(n => nameSet.add(n.toLowerCase().trim()));
        }
        console.log('[Q-ADD] URLs:', urlSet.size, 'Names:', nameSet.size, 'product:', product.product_name);
        console.log('[Q-ADD] Evidence:', sources.length, 'total,', sources.filter(s=>!s.quarantined).length, 'active');
        
        sources.forEach((s, idx) => {
          if (s.quarantined) return;
          
          // Strategy 1: URL match (most reliable)
          if (s.url && urlSet.has(s.url.toLowerCase().trim())) {
            console.log('[Q-ADD] URL match:', s.name, s.url);
            s.quarantined = true;
            s.quarantine_reason = 'manual';
            s.quarantined_at = new Date().toISOString();
            quarantined_count++;
            return;
          }
          
          // Strategy 2: Name substring match
          const sName = (s.name || '').toLowerCase().trim();
          for (const n of nameSet) {
            if (sName === n || sName.includes(n) || n.includes(sName)) {
              console.log('[Q-ADD] Name match:', s.name);
              s.quarantined = true;
              s.quarantine_reason = 'manual';
              s.quarantined_at = new Date().toISOString();
              quarantined_count++;
              return;
            }
          }
          
          // Strategy 3: URL domain+path partial match
          if (s.url) {
            const sUrl = s.url.toLowerCase();
            for (const u of urlSet) {
              try {
                const sDom = new URL(sUrl).hostname.replace(/^www\./, '');
                const rDom = new URL(u).hostname.replace(/^www\./, '');
                if (sDom === rDom) {
                  const sPath = new URL(sUrl).pathname;
                  const rPath = new URL(u).pathname;
                  if (sPath === rPath || sPath.includes(rPath) || rPath.includes(sPath)) {
                    console.log('[Q-ADD] Domain+path match:', s.url);
                    s.quarantined = true;
                    s.quarantine_reason = 'manual';
                    s.quarantined_at = new Date().toISOString();
                    quarantined_count++;
                    return;
                  }
                }
              } catch(e) {}
            }
          }
        });
        
        if (quarantined_count === 0) {
          console.log('[Q-ADD] NO MATCHES! URLs sent:', Array.from(urlSet).slice(0,2));
          console.log('[Q-ADD] Names sent:', Array.from(nameSet).slice(0,2));
          console.log('[Q-ADD] Sample evidence:', sources.filter(s=>!s.quarantined).slice(0,2).map(s=>({n:s.name?.substring(0,50), u:s.url?.substring(0,50)})));
        }
        
        fs.writeFileSync(evidencePath, JSON.stringify(data, null, 2));
        console.log('[Q-ADD] Quarantined', quarantined_count, 'of', source_entries.length || source_names.length, 'requested');
        sendJSON(res, { success: true, quarantined_count });
      } catch (e) {
        console.error('[Q-ADD] Error:', e.message);
        sendJSON(res, { error: "Failed to update evidence file" }, 500);
      }
    }).catch(() => { sendJSON(res, { error: "Invalid request body" }, 400); });
    return true;
  }

  // GET /api/products/:id/report-preview
  const reportPreviewMatch = pathname.match(/^\/api\/products\/(\d+)\/report-preview$/);
  if (reportPreviewMatch && req.method === 'GET') {
    const id = parseInt(reportPreviewMatch[1]);
    let product;
    if (USE_SAMPLE) {
      product = sampleData.SAMPLE_PRODUCTS.find(p => p.id === id);
    } else {
      const rows = queryDB(`SELECT * FROM products WHERE id = ${id}`);
      product = rows[0];
    }
    if (!product) { sendJSON(res, { error: 'Not found' }, 404); return true; }
    const overall_score = product.overall_score || 0;
    const tier = sampleData.getGrade ? sampleData.getGrade(overall_score) : (overall_score >= 85 ? 'A' : overall_score >= 70 ? 'B' : overall_score >= 55 ? 'C' : 'D');
    const red_flags = [];
    const yellow_flags = [];
    const evPath = findEvidenceFile(product.product_name);
    if (evPath) {
      try {
        const evData = JSON.parse(fs.readFileSync(evPath, 'utf-8'));
        const evSources = (evData.professional_consensus && evData.professional_consensus.sources) || [];
        evSources.forEach(s => {
          if (s.flags) {
            (s.flags.red || []).forEach(f => red_flags.push(f));
            (s.flags.yellow || []).forEach(f => yellow_flags.push(f));
          }
        });
      } catch (e) {}
    }
    const runDir2 = findLatestRunDir(product.product_name);
    const bot2findings = readJsonFile(runDir2, /bot2_evaluator\.json$/);
    if (bot2findings && bot2findings.findings) {
      (bot2findings.findings.red || []).forEach(f => { if (!red_flags.includes(f)) red_flags.push(f); });
      (bot2findings.findings.yellow || []).forEach(f => { if (!yellow_flags.includes(f)) yellow_flags.push(f); });
    }
    const scores = {
      quality: product.quality_score || 0,
      durability: product.durability_score || 0,
      performance: product.performance_score || 0,
      safety: product.material_safety_score || 0
    };
    const what_we_love = [];
    const things_to_watch = [];
    if (overall_score >= 60) {
      [['Quality', scores.quality], ['Durability', scores.durability], ['Performance', scores.performance], ['Safety', scores.safety]].forEach(([name, score]) => {
        if (score > 70) what_we_love.push({ title: name, text: `Scores well at ${score}/100 on ${name.toLowerCase()} metrics.` });
      });
    }
    [['Quality', scores.quality], ['Durability', scores.durability], ['Performance', scores.performance], ['Safety', scores.safety]].forEach(([name, score]) => {
      if (score < 60) things_to_watch.push({ title: name, text: `Scores below average at ${score}/100 on ${name.toLowerCase()} metrics.` });
    });
    yellow_flags.forEach(f => things_to_watch.push({ title: 'Note', text: f }));
    red_flags.forEach(f => things_to_watch.push({ title: 'Warning', text: f }));
    sendJSON(res, { product_name: product.product_name, overall_score, tier, what_we_love, things_to_watch, findings: { red: red_flags, yellow: yellow_flags }, scores });
    return true;
  }

  // ── Calibration API Routes ────────────────────────────────────────────────
  // GET /api/calibration/:category/products — list all products for a category
  const calibListMatch = pathname.match(/^\/api\/calibration\/([^/]+)\/products$/);
  if (calibListMatch && req.method === 'GET') {
    try {
      const category = calibListMatch[1];
      const calibDir = path.join(WORKSPACE, 'calibration', category, 'curation_files');
      if (!fs.existsSync(calibDir)) { sendJSON(res, []); return true; }
      const files = fs.readdirSync(calibDir).filter(f => f.endsWith('_curation.json'));
      const products = files.map(f => {
        try {
          const data = JSON.parse(fs.readFileSync(path.join(calibDir, f), 'utf8'));
          const sn = data.scoring_notes || {};
          const poolDist = sn.pool_distribution || {};
          return {
            slug: data.product_slug || f.replace('_curation.json',''),
            product_name: data.product_name || data.product || f.replace('_curation.json','').replace(/_/g,' '),
            manufacturer_slug: data.manufacturer_slug || '',
            overall_score: data.product?.overall_score || null,
            curation_status: data.curation_status || 'staged',
            curation_date: data.curation_date || null,
            deep_dive_date: data.deep_dive_date || null,
            source_count: (data.sources || []).length,
            scored_count: (sn.sources_scored || []).length,
            report_only_count: (sn.sources_report_only || []).length,
            quarantined_count: (sn.sources_quarantined || []).length,
            pool_distribution: poolDist,
            outlook: data.outlook || null
          };
        } catch { return null; }
      }).filter(Boolean);
      sendJSON(res, products);
    } catch (err) { sendJSON(res, { error: err.message }, 500); }
    return true;
  }

  // GET /api/calibration/:category/product/:slug — full curation data
  const calibProductMatch = pathname.match(/^\/api\/calibration\/([^/]+)\/product\/([^/]+)$/);
  if (calibProductMatch && req.method === 'GET') {
    try {
      const category = calibProductMatch[1];
      const slug = calibProductMatch[2];
      const calibDir = path.join(WORKSPACE, 'calibration', category, 'curation_files');
      const filePath = path.join(calibDir, slug + '_curation.json');
      if (!fs.existsSync(filePath)) { sendJSON(res, { error: 'Not found' }, 404); return true; }
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      sendJSON(res, data);
    } catch (err) { sendJSON(res, { error: err.message }, 500); }
    return true;
  }

  // POST /api/calibration/:category/product/:slug/classify — reclassify a source
  const calibClassifyMatch = pathname.match(/^\/api\/calibration\/([^/]+)\/product\/([^/]+)\/classify$/);
  if (calibClassifyMatch && req.method === 'POST') {
    try {
      const category = calibClassifyMatch[1];
      const slug = calibClassifyMatch[2];
      const body = await readBody(req);
      const calibDir = path.join(WORKSPACE, 'calibration', category, 'curation_files');
      const filePath = path.join(calibDir, slug + '_curation.json');
      if (!fs.existsSync(filePath)) { sendJSON(res, { error: 'Not found' }, 404); return true; }
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const source = (data.sources || []).find(s => s.id === body.source_id);
      if (!source) { sendJSON(res, { error: 'Source not found' }, 404); return true; }
      // Update the source classification
      source.classification = body.classification;
      // Update scoring_notes lists
      const sn = data.scoring_notes || {};
      sn.sources_scored = (sn.sources_scored || []).filter(id => id !== body.source_id);
      sn.sources_report_only = (sn.sources_report_only || []).filter(id => id !== body.source_id);
      sn.sources_quarantined = (sn.sources_quarantined || []).filter(id => id !== body.source_id);
      if (body.classification === 'score') sn.sources_scored.push(body.source_id);
      else if (body.classification === 'report_only') sn.sources_report_only.push(body.source_id);
      else if (body.classification === 'quarantine') sn.sources_quarantined.push(body.source_id);
      data.scoring_notes = sn;
      if (!data.human_overrides) data.human_overrides = [];
      data.human_overrides.push({ source_id: body.source_id, action: 'classify', new_value: body.classification, timestamp: new Date().toISOString() });
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      sendJSON(res, { success: true, source });
    } catch (err) { sendJSON(res, { error: err.message }, 500); }
    return true;
  }

  return false;
}

// ── Response Helpers ────────────────────────────────────────────────────────

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

function sendJSON(res, data, status = 200) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(body);
}

function serveStatic(res, filePath) {
  const ext = path.extname(filePath);
  const mime = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
      return;
    }
    res.writeHead(200, {
      'Content-Type': mime,
      'Cache-Control': 'no-cache'
    });
    res.end(data);
  });
}

// ── HTTP Server ─────────────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  // API routes
  if (pathname.startsWith('/api/')) {
    if (!(await handleAPI(req, res, parsedUrl))) {
      sendJSON(res, { error: 'Unknown endpoint' }, 404);
    }
    return;
  }

  // Static file serving
  let filePath;
  if (pathname === '/' || pathname === '/index.html') {
    filePath = path.join(PUBLIC_DIR, 'index.html');
  } else if (pathname === '/curation' || pathname === '/curation.html') {
    filePath = path.join(PUBLIC_DIR, 'curation.html');
  } else if (pathname.startsWith('/curation-product') || pathname === '/curation-product.html') {
    filePath = path.join(PUBLIC_DIR, 'curation-product.html');
  } else if (pathname === '/manufacturer' || pathname === '/manufacturer.html') {
    filePath = path.join(PUBLIC_DIR, 'manufacturer.html');
  } else if (pathname.startsWith('/product/') || pathname === '/product.html') {
    filePath = path.join(PUBLIC_DIR, 'product.html');
  } else {
    filePath = path.join(PUBLIC_DIR, pathname);
  }

  // Security: prevent directory traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  serveStatic(res, filePath);
});

server.listen(PORT, () => {
  console.log(`[DASHBOARD] Residentialist Score Dashboard running at http://localhost:${PORT}`);
  console.log(`[DASHBOARD] Workspace: ${WORKSPACE}`);
  console.log(`[DASHBOARD] Mode: ${USE_SAMPLE ? 'SAMPLE DATA' : 'LIVE DB'}`);
});
