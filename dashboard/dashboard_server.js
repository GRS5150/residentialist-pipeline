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
const WORKSPACE = process.env.RESIDENTIALIST_WORKSPACE || path.resolve(__dirname, '..');
const DB_PATH = path.join(WORKSPACE, 'residentialist.db');
const OUTPUTS_DIR = path.join(WORKSPACE, 'outputs');
const PUBLIC_DIR = path.join(__dirname, 'public');

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
function findLatestRunDir(productName) {
  if (!fs.existsSync(OUTPUTS_DIR)) return null;
  const slug = productName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
  const dirs = fs.readdirSync(OUTPUTS_DIR)
    .filter(d => {
      const lower = d.toLowerCase();
      return lower.includes(slug) || slug.split('_').every(part => lower.includes(part));
    })
    .sort()
    .reverse();
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

// ── API Routes ──────────────────────────────────────────────────────────────
function handleAPI(req, res, parsedUrl) {
  const pathname = parsedUrl.pathname;

  // GET /api/products
  if (pathname === '/api/products' && req.method === 'GET') {
    let products;
    if (USE_SAMPLE) {
      products = sampleData.SAMPLE_PRODUCTS;
    } else {
      products = queryDB(
        "SELECT id, product_name, product_line, category, overall_score, quality_score, durability_score, performance_score, material_safety_score, material_class, config FROM products WHERE overall_score IS NOT NULL ORDER BY overall_score DESC"
      );
    }
    // Add computed fields
    products = products.map(p => ({
      ...p,
      grade: sampleData.getGrade(p.overall_score),
      outlook: sampleData.getOutlook(p.overall_score)
    }));
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
      const generated = sampleData.generateDetailedScores(product);
      poolDetails = generated.professional_consensus.pool_details;
    }
    sendJSON(res, { product_name: product.product_name, pool_details: poolDetails });
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
    const runDir = findLatestRunDir(product.product_name);
    const detScoresRaw = readJsonFile(runDir, 'DETERMINISTIC_SCORES.json');
    const bot2 = readJsonFile(runDir, /bot2_evaluator\.json$/) || sampleData.generateBot2Findings(product);
    const bot3 = readJsonFile(runDir, /bot3_material_safety\.json$/) || sampleData.generateBot3MaterialSafety(product);
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
      detScores = {
        ...detScoresRaw,
        overall: product.overall_score,
        grade: sampleData.getGrade(product.overall_score),
        outlook: pipeline.outlook || sampleData.getOutlook(product.overall_score),
        material_safety: (bot3 && bot3.material_safety_score) || product.material_safety_score,
        scores: {
          quality: {
            axis_score: product.quality_score,
            component_quality: detScoresRaw.component_quality || {},
            manufacturing_quality: detScoresRaw.manufacturing_quality || {},
            professional_consensus: detScoresRaw.professional_consensus || {}
          },
          durability: {
            axis_score: product.durability_score,
            frame_longevity: { score: 0, reasoning: '' },
            materials_durability: detScoresRaw.materials_durability || {},
            repairability: detScoresRaw.repairability || {}
          },
          performance: {
            axis_score: product.performance_score,
            thermal: { score: 0, reasoning: '' },
            structural: { score: 0, reasoning: '' },
            air_water: { score: 0, reasoning: '' }
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

  return false;
}

// ── Response Helpers ────────────────────────────────────────────────────────
function sendJSON(res, data, status = 200) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
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
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  // API routes
  if (pathname.startsWith('/api/')) {
    if (!handleAPI(req, res, parsedUrl)) {
      sendJSON(res, { error: 'Unknown endpoint' }, 404);
    }
    return;
  }

  // Static file serving
  let filePath;
  if (pathname === '/' || pathname === '/index.html') {
    filePath = path.join(PUBLIC_DIR, 'index.html');
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
