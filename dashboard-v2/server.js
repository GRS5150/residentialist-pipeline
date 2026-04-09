/**
 * THE RESIDENTIALIST — Product Intelligence Workbench
 *
 * A visual layer + action workbench over the entire product database.
 * Reads configs, calibration, curation, knowledge, and audit data.
 * Supports source inspection (Haiku), source finding (Perplexity),
 * and file-write actions (remove/add sources, remove claims, etc).
 *
 * Usage:
 *   node server.js
 *   RESIDENTIALIST_WORKSPACE=/path/to/workspace node server.js
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const { buildAuditData } = require('./audit_parser');
const { normalizeSources, groupSourcesByColumn, extractBottomLine } = require('./source_normalizer');
const { inspectSource } = require('./inspector');
const { findBetterSource } = require('./source_finder');
const { previewScore } = require('./score_engine');
const { removeSource, removeClaim, addSource, flagForResearch, acceptAsIs, batchAction } = require('./actions');
const { getLog, getCategoryLogs } = require('./audit_log');

// ── Configuration ───────────────────────────────────────────────────────────

const PORT = process.env.PORT || 7825;
let WORKSPACE = process.env.RESIDENTIALIST_WORKSPACE || path.resolve(__dirname, '..');

// Load .env if present
const envPath = path.join(WORKSPACE, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx > 0) {
        const key = trimmed.substring(0, eqIdx).trim();
        const val = trimmed.substring(eqIdx + 1).trim();
        if (!process.env[key]) process.env[key] = val;
      }
    }
  }
}

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY || '';

const CONFIGS_DIR = path.join(WORKSPACE, 'configs');
const CALIBRATION_DIR = path.join(WORKSPACE, 'calibration');
const CURATION_ROOT = path.join(WORKSPACE, 'curation');
const KNOWLEDGE_DIR = path.join(WORKSPACE, 'knowledge');
const PUBLIC_DIR = path.join(__dirname, 'public');

// Active categories (default view)
const ACTIVE_CATEGORIES = new Set([
  'windows', 'refrigerators', 'dishwashers', 'ranges_cooktops',
  'hvac', 'water_heaters', 'hardwood_flooring', 'cabinets',
  'faucets', 'toilets'
]);

// ── In-Memory Cache ─────────────────────────────────────────────────────────

let DATA = {
  categories: {},
  audit: null,
  lastRefresh: null
};

// ── Data Aggregation ────────────────────────────────────────────────────────

function refreshData() {
  console.log('[REFRESH] Rebuilding data cache...');
  const start = Date.now();

  const categories = {};

  // 1. Discover categories from configs
  const configFiles = fs.readdirSync(CONFIGS_DIR).filter(f => f.endsWith('.json'));

  for (const configFile of configFiles) {
    const slug = configFile.replace('.json', '');
    try {
      const config = JSON.parse(fs.readFileSync(path.join(CONFIGS_DIR, configFile), 'utf8'));
      categories[slug] = {
        slug,
        name: formatCategoryName(slug),
        config: {
          axisWeights: config.axis_weights || {},
          compositeMethod: config.composite_method || 'geometric_mean',
          tierRanges: config.tier_ranges || {},
          notes: config.notes || ''
        },
        products: [],
        productCount: 0,
        knowledgeFiles: [],
        isActive: ACTIVE_CATEGORIES.has(slug)
      };
    } catch (e) {
      console.log(`[REFRESH] Failed to parse config ${configFile}: ${e.message}`);
    }
  }

  // 2. Load calibration products for each category
  for (const slug of Object.keys(categories)) {
    const calibPath = path.join(CALIBRATION_DIR, slug, 'config.json');
    if (fs.existsSync(calibPath)) {
      try {
        const calibConfig = JSON.parse(fs.readFileSync(calibPath, 'utf8'));
        const products = calibConfig.calibration_products || [];

        categories[slug].products = products.map(p => {
          // Find and load curation data
          const curationPath = findCurationFile(slug, p.slug);
          const curationData = curationPath ? loadJSON(curationPath) : null;
          const sources = normalizeSources(curationData);
          const sourcesByColumn = groupSourcesByColumn(sources);
          const bottomLine = extractBottomLine(curationData);

          return {
            name: p.name,
            slug: p.slug,
            subType: p.sub_type || null,
            tier: p.tier || null,
            target: p.target || null,
            axisScores: p.axis_scores || curationData?.axis_scores || {},
            specAdj: p.spec_adj || {},
            specs: p.specs || {},
            notes: p.notes || '',
            corporateParent: p.corporate_parent || null,
            outlook: p.outlook || null,
            outlookRationale: p.outlook_rationale || null,
            sourceCount: sources.length,
            sources,
            sourcesByColumn,
            bottomLine,
            hasCuration: !!curationData
          };
        });

        categories[slug].productCount = categories[slug].products.length;
      } catch (e) {
        console.log(`[REFRESH] Failed to parse calibration for ${slug}: ${e.message}`);
      }
    }

    // 3. Load knowledge file metadata
    const knowledgeDir = path.join(KNOWLEDGE_DIR, slug);
    if (fs.existsSync(knowledgeDir)) {
      try {
        categories[slug].knowledgeFiles = fs.readdirSync(knowledgeDir)
          .filter(f => f.endsWith('.md'))
          .map(f => {
            const stats = fs.statSync(path.join(knowledgeDir, f));
            return {
              filename: f,
              size: stats.size,
              isDeepDive: f.includes('deep_dive'),
              modified: stats.mtime
            };
          });
      } catch (e) { /* skip */ }
    }
  }

  // 4. Build audit data from three sources (curation independence, SQLite specs, red-team reports)
  const auditResult = buildAuditData(WORKSPACE, categories);

  DATA = {
    categories,
    audit: { date: auditResult.latestRedTeamDate },
    lastRefresh: new Date().toISOString()
  };

  const elapsed = Date.now() - start;
  const totalProducts = Object.values(categories).reduce((s, c) => s + c.productCount, 0);
  console.log(`[REFRESH] Done in ${elapsed}ms — ${Object.keys(categories).length} categories, ${totalProducts} products`);
}

/**
 * Find a curation file across the three possible locations.
 */
function findCurationFile(category, slug) {
  const curationDir = path.join(CALIBRATION_DIR, category, 'curation_files');
  if (fs.existsSync(curationDir)) {
    const files = fs.readdirSync(curationDir).filter(f => f.endsWith('.json'));
    const match = files.find(f => f.includes(slug));
    if (match) return path.join(curationDir, match);
  }
  const calibDir = path.join(CALIBRATION_DIR, category);
  if (fs.existsSync(calibDir)) {
    const files = fs.readdirSync(calibDir).filter(f =>
      f.endsWith('.json') && f.includes(slug) &&
      (f.includes('_sources') || f.includes('_curation')) &&
      !f.includes('pipeline_progress') && f !== 'config.json'
    );
    if (files.length) return path.join(calibDir, files[0]);
  }
  if (fs.existsSync(CURATION_ROOT)) {
    const files = fs.readdirSync(CURATION_ROOT).filter(f =>
      f.endsWith('.json') && f.includes(slug) &&
      (f.includes('_sources') || f.includes('_curation'))
    );
    if (files.length) return path.join(CURATION_ROOT, files[0]);
  }
  return null;
}

function loadJSON(filePath) {
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch { return null; }
}

function formatCategoryName(slug) {
  return slug.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// ── Express Server ──────────────────────────────────────────────────────────

const app = express();

// JSON body parser for POST endpoints
app.use(express.json({ limit: '2mb' }));

// Static files
app.use(express.static(PUBLIC_DIR));

// CORS (for dev)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// ═══════════════════════════════════════════════════════════════════════════
// READ-ONLY ENDPOINTS (existing)
// ═══════════════════════════════════════════════════════════════════════════

// API: Overview — all categories with health indicators
app.get('/api/overview', (req, res) => {
  const showAll = req.query.all === 'true';

  const overview = Object.values(DATA.categories)
    .filter(cat => showAll || cat.isActive)
    .map(cat => ({
      slug: cat.slug,
      name: cat.name,
      productCount: cat.productCount,
      auditStatus: cat.auditStatus || 'unknown',
      auditStats: cat.auditStats || { specIssues: 0, redTeamFindings: 0, sourceFlags: 0 },
      axisWeights: cat.config.axisWeights,
      knowledgeFileCount: cat.knowledgeFiles.length,
      isActive: cat.isActive
    }));

  overview.sort((a, b) => a.name.localeCompare(b.name));

  const allCats = Object.values(DATA.categories);

  res.json({
    totalCategories: overview.length,
    totalProducts: overview.reduce((s, c) => s + c.productCount, 0),
    allCategoryCount: allCats.length,
    allProductCount: allCats.reduce((s, c) => s + c.productCount, 0),
    auditDate: DATA.audit?.date || null,
    lastRefresh: DATA.lastRefresh,
    showingAll: showAll,
    categories: overview
  });
});

// API: Single category with all products (card view)
app.get('/api/categories/:slug', (req, res) => {
  const cat = DATA.categories[req.params.slug];
  if (!cat) return res.status(404).json({ error: 'Category not found' });

  const products = cat.products.map(p => ({
    name: p.name,
    slug: p.slug,
    subType: p.subType,
    tier: p.tier,
    target: p.target,
    axisScores: p.axisScores,
    sourceCount: p.sourceCount,
    hasCuration: p.hasCuration,
    audit: p.audit ? {
      specStatus: p.audit.specVerification?.status || 'gray',
      redTeamVerdict: p.audit.redTeam?.verdict || null,
      sourceStatus: p.audit.sourceIndependence?.status || 'gray'
    } : null
  }));

  products.sort((a, b) => {
    if ((a.tier || 99) !== (b.tier || 99)) return (a.tier || 99) - (b.tier || 99);
    return (b.target || 0) - (a.target || 0);
  });

  res.json({
    slug: cat.slug,
    name: cat.name,
    config: cat.config,
    auditStatus: cat.auditStatus || 'unknown',
    auditStats: cat.auditStats || {},
    productCount: cat.productCount,
    knowledgeFiles: cat.knowledgeFiles,
    products
  });
});

// API: Full product detail
app.get('/api/products/:category/:slug', (req, res) => {
  const cat = DATA.categories[req.params.category];
  if (!cat) return res.status(404).json({ error: 'Category not found' });

  const product = cat.products.find(p => p.slug === req.params.slug);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  // Include audit history
  const auditHistory = getLog(req.params.category, req.params.slug);

  res.json({
    category: { slug: cat.slug, name: cat.name },
    product: {
      name: product.name,
      slug: product.slug,
      subType: product.subType,
      tier: product.tier,
      target: product.target,
      axisScores: product.axisScores,
      specAdj: product.specAdj,
      specs: product.specs,
      notes: product.notes,
      corporateParent: product.corporateParent,
      outlook: product.outlook,
      outlookRationale: product.outlookRationale,
      bottomLine: product.bottomLine,
      sourceCount: product.sourceCount,
      sources: product.sources,
      sourcesByColumn: product.sourcesByColumn,
      hasCuration: product.hasCuration,
      audit: product.audit || null,
      auditHistory: auditHistory.history
    }
  });
});

// API: Refresh data from filesystem
app.get('/api/refresh', (req, res) => {
  try {
    refreshData();
    res.json({ success: true, lastRefresh: DATA.lastRefresh });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// INSPECTOR BOT (Haiku)
// ═══════════════════════════════════════════════════════════════════════════

app.post('/api/inspect', async (req, res) => {
  const { category, productSlug, sourceId } = req.body;

  if (!category || !productSlug || !sourceId) {
    return res.status(400).json({ error: 'Missing category, productSlug, or sourceId' });
  }

  const cat = DATA.categories[category];
  if (!cat) return res.status(404).json({ error: 'Category not found' });

  const product = cat.products.find(p => p.slug === productSlug);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  const source = product.sources.find(s => s.id === sourceId || s.source_name === sourceId);
  if (!source) return res.status(404).json({ error: 'Source not found' });

  console.log(`[INSPECT] ${product.name} → ${source.source_name}`);
  const result = await inspectSource(ANTHROPIC_API_KEY, product, source);

  res.json(result);
});

// ═══════════════════════════════════════════════════════════════════════════
// FIND BETTER SOURCE (Perplexity)
// ═══════════════════════════════════════════════════════════════════════════

app.post('/api/find-source', async (req, res) => {
  const { productName, topic } = req.body;

  if (!productName || !topic) {
    return res.status(400).json({ error: 'Missing productName or topic' });
  }

  console.log(`[FIND-SOURCE] ${productName} → ${topic}`);
  const result = await findBetterSource(PERPLEXITY_API_KEY, productName, topic);

  res.json(result);
});

// ═══════════════════════════════════════════════════════════════════════════
// SCORE PREVIEW
// ═══════════════════════════════════════════════════════════════════════════

app.post('/api/score-preview', (req, res) => {
  const { category, productSlug, changes } = req.body;

  if (!category || !productSlug || !changes) {
    return res.status(400).json({ error: 'Missing category, productSlug, or changes' });
  }

  const result = previewScore(WORKSPACE, category, productSlug, changes);
  res.json(result);
});

// ═══════════════════════════════════════════════════════════════════════════
// ACTIONS (file writes)
// ═══════════════════════════════════════════════════════════════════════════

app.post('/api/actions/remove-source', (req, res) => {
  const { category, productSlug, sourceId } = req.body;
  if (!category || !productSlug || !sourceId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  console.log(`[ACTION] Remove source: ${category}/${productSlug} → ${sourceId}`);
  const result = removeSource(WORKSPACE, category, productSlug, sourceId);

  if (result.success) {
    // Refresh cache to reflect the change
    refreshData();
  }

  res.json(result);
});

app.post('/api/actions/remove-claim', (req, res) => {
  const { category, productSlug, claimText } = req.body;
  if (!category || !productSlug || !claimText) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  console.log(`[ACTION] Remove claim: ${category}/${productSlug} → "${claimText.substring(0, 60)}"`);
  const result = removeClaim(WORKSPACE, category, productSlug, claimText);

  if (result.success) refreshData();
  res.json(result);
});

app.post('/api/actions/add-source', (req, res) => {
  const { category, productSlug, sourceData } = req.body;
  if (!category || !productSlug || !sourceData) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  console.log(`[ACTION] Add source: ${category}/${productSlug} → "${sourceData.name}"`);
  const result = addSource(WORKSPACE, category, productSlug, sourceData);

  if (result.success) refreshData();
  res.json(result);
});

app.post('/api/actions/flag-research', (req, res) => {
  const { category, productSlug, topic } = req.body;
  if (!category || !productSlug || !topic) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  console.log(`[ACTION] Flag for research: ${category}/${productSlug} → "${topic}"`);
  const result = flagForResearch(WORKSPACE, category, productSlug, topic);
  res.json(result);
});

app.post('/api/actions/accept', (req, res) => {
  const { category, productSlug, detail } = req.body;
  if (!category || !productSlug || !detail) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  console.log(`[ACTION] Accept as-is: ${category}/${productSlug}`);
  const result = acceptAsIs(WORKSPACE, category, productSlug, detail);
  res.json(result);
});

app.post('/api/actions/batch', (req, res) => {
  const { category, action, products } = req.body;
  if (!category || !action || !products || !Array.isArray(products)) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  console.log(`[ACTION] Batch ${action}: ${category} → ${products.length} products`);
  const result = batchAction(WORKSPACE, category, action, products);

  if (result.success) refreshData();
  res.json(result);
});

// ═══════════════════════════════════════════════════════════════════════════
// AUDIT LOG
// ═══════════════════════════════════════════════════════════════════════════

app.get('/api/audit-log/:category/:slug', (req, res) => {
  const log = getLog(req.params.category, req.params.slug);
  res.json(log);
});

app.get('/api/audit-log/:category', (req, res) => {
  const logs = getCategoryLogs(req.params.category);
  res.json(logs);
});

// SPA fallback — serve index.html for all non-API routes
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
  }
});

// ── Start ───────────────────────────────────────────────────────────────────

refreshData();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n  ╔══════════════════════════════════════════════════════╗`);
  console.log(`  ║  RESIDENTIALIST — Product Intelligence Workbench     ║`);
  console.log(`  ║  http://localhost:${PORT}                              ║`);
  console.log(`  ║  Active categories: ${ACTIVE_CATEGORIES.size}                            ║`);
  console.log(`  ║  API keys: Haiku ${ANTHROPIC_API_KEY ? '✓' : '✗'} | Perplexity ${PERPLEXITY_API_KEY ? '✓' : '✗'}          ║`);
  console.log(`  ╚══════════════════════════════════════════════════════╝\n`);
});
