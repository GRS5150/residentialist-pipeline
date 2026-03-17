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
function handleAPI(req, res, parsedUrl) {
  const pathname = parsedUrl.pathname;

  // GET /api/products
  if (pathname === '/api/products' && req.method === 'GET') {
    let products;
    if (USE_SAMPLE) {
      products = sampleData.SAMPLE_PRODUCTS;
    } else {
      products = queryDB(
        "SELECT id, product_name, product_line, category, overall_score, quality_score, durability_score, performance_score, material_safety_score, material_class, config FROM products WHERE overall_score IS NOT NULL AND (status IS NULL OR status != 'rejected') ORDER BY overall_score DESC"
      );
    }
    // Add computed fields
    products = products.map(p => ({
      ...p,
      grade: sampleData.applySafetyCap(sampleData.getGrade(p.overall_score), p.material_safety_score),
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
  return false;
}

// ── Response Helpers ────────────────────────────────────────────────────────
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
const server = http.createServer((req, res) => {
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
