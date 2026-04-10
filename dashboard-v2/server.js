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

          // Compute evidence status from product-scoped sources
          const productScopedSources = sources.filter(s => s.scope === 'product');
          // Only qualifying types with evaluative claims count toward badge
          const QUALIFYING_TYPES = new Set(['review', 'comparison', 'forum_discussion', 'teardown']);
          const qualifyingSources = productScopedSources.filter(s =>
            QUALIFYING_TYPES.has(s.source_type) && s.claim && s.claim.length > 0
          );
          const qualifyingPoolBPlus = qualifyingSources.filter(s => ['S', 'A', 'B'].includes(s.pool));
          let evidenceStatus;
          if (qualifyingSources.length >= 5 && qualifyingPoolBPlus.length >= 2) {
            evidenceStatus = 'full_confidence';
          } else if (qualifyingSources.length >= 2 && qualifyingPoolBPlus.length >= 1) {
            evidenceStatus = 'scored_with_disclosure';
          } else {
            evidenceStatus = 'insufficient_evidence';
          }

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
            hasCuration: !!curationData,
            evidenceStatus,
            productSourceCount: productScopedSources.length,
            qualifyingSourceCount: qualifyingSources.length,
            qualifyingPoolBPlus: qualifyingPoolBPlus.length,
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
    evidenceStatus: p.evidenceStatus,
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
      evidenceStatus: product.evidenceStatus,
      productSourceCount: product.productSourceCount,
      qualifyingSourceCount: product.qualifyingSourceCount,
      qualifyingPoolBPlus: product.qualifyingPoolBPlus,
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
// FEATURE 2: ADD SOURCE
// ═══════════════════════════════════════════════════════════════════════════

app.post('/api/products/:category/:slug/add-source', (req, res) => {
  try {
    const { category, slug } = req.params;
    const { url, source_name, pool, axes, claim, column } = req.body;

    // Validate required fields
    if (!url || !source_name || !pool || !claim || !column) {
      return res.status(400).json({ error: 'Missing required fields: url, source_name, pool, claim, column' });
    }
    if (!axes || !Array.isArray(axes) || axes.length === 0) {
      return res.status(400).json({ error: 'At least one axis must be selected' });
    }

    // Find curation file
    const curationPath = findCurationFile(category, slug);
    if (!curationPath) {
      return res.status(404).json({ error: 'Curation file not found' });
    }

    // Load and modify
    const curationData = JSON.parse(fs.readFileSync(curationPath, 'utf8'));
    if (!curationData.sources) curationData.sources = [];

    // Classify source type from URL
    const urlLower = url.toLowerCase();
    let sourceType = 'other';
    try {
      const host = new URL(url).hostname.replace(/^www\./, '').toLowerCase();
      if (host === 'encyclopedia.com' || host.endsWith('wikipedia.org')) sourceType = 'company_profile';
      else if (/catalog|specbook|spec-book|brochure|specification/i.test(urlLower)) sourceType = 'spec_sheet';
      else if (/teardown|disassembl/i.test(urlLower)) sourceType = 'teardown';
      else if (/\bvs\b|compared|comparison|versus/i.test(urlLower)) sourceType = 'comparison';
      else if (['houzz.com','reddit.com','contractortalk.com','gardenweb.com','diychatroom.com','hvac-talk.com'].some(d => host === d || host.endsWith('.'+d))) sourceType = 'forum_discussion';
      else if (/\/forum\/|\/forums\/|\/thread/i.test(urlLower)) sourceType = 'forum_discussion';
      else if (/review|rating|firsthand|tested/i.test(urlLower)) sourceType = 'review';
      else if (/worth-it|worth-the|is-.*-worth|are-.*-worth|best-.*-20\d\d|pros-.*cons|should-you-buy|buying-guide/i.test(urlLower)) sourceType = 'review';
      else if (['blog.yaleappliance.com','yaleappliance.com','designerappliances.com','consumeraffairs.com','kitchencabinetsreviews.com','ajmadison.com','orvilles.com','friedmansappliance.com','stoveshield.com','elizabethannehome.com','oakabode.com'].some(d => host === d || host.endsWith('.'+d))) sourceType = 'review';
      else if (host === 'youtube.com' || host === 'youtu.be' || host.endsWith('.youtube.com')) sourceType = 'review';
      else if (/cpsc\.gov\/recalls|safety-recall|safety-bulletin/i.test(urlLower) || host === 'cpsc.gov' || host.endsWith('.cpsc.gov')) sourceType = 'safety_notice';
      else if (/class-action|classaction|lawsuit|settlement/i.test(urlLower) || host === 'classaction.org' || host === 'topclassactions.com' || host === 'plainsite.org') sourceType = 'legal';
      else if (host === 'bbb.org' || host.endsWith('.bbb.org')) sourceType = 'bbb_profile';
    } catch { /* invalid URL */ }

    const newId = `SRC-${String(curationData.sources.length + 1).padStart(3, '0')}`;
    const newSource = {
      id: newId,
      source_name,
      url,
      platform: 'other',
      column: column.toLowerCase(),
      snippet: '',
      pool: pool.toUpperCase(),
      scope: 'product',
      source_type: sourceType,
      claim,
      classification: 'score',
      classification_reason: 'Manually added via dashboard.',
      topics: axes.map(a => a.charAt(0).toUpperCase()),
      verification_relevance: 'relevant',
      captured_from: 'manual_entry',
      verified: false,
      manual_entry: true,
      added_date: new Date().toISOString(),
    };

    curationData.sources.push(newSource);
    fs.writeFileSync(curationPath, JSON.stringify(curationData, null, 2));

    refreshData();
    res.json({ success: true, source: newSource, message: `Source ${newId} added to ${slug}` });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// FEATURE 3: RE-SCORE
// ═══════════════════════════════════════════════════════════════════════════

app.post('/api/products/:category/:slug/rescore', (req, res) => {
  try {
    const { category, slug } = req.params;
    const { geoMean, getTier, tierLabel } = require('./score_engine');

    // Load axis weights
    const configPath = path.join(WORKSPACE, 'configs', `${category}.json`);
    let weights = { quality: 0.40, durability: 0.40, performance: 0.20 };
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      if (config.axis_weights) weights = config.axis_weights;
    } catch { /* use defaults */ }

    // Load calibration product
    const calibPath = path.join(CALIBRATION_DIR, category, 'config.json');
    const calib = JSON.parse(fs.readFileSync(calibPath, 'utf8'));
    const product = (calib.calibration_products || []).find(p => p.slug === slug);
    if (!product) {
      return res.status(404).json({ error: 'Product not found in calibration config' });
    }

    const axes = product.axis_scores || {};
    const q = axes.quality || 5;
    const d = axes.durability || 5;
    const p = axes.performance || 5;

    const newScore = Math.round(geoMean(q, d, p, weights));
    const newTier = getTier(newScore);

    // Update calibration config
    product.target = newScore;
    product.tier = newTier;
    fs.writeFileSync(calibPath, JSON.stringify(calib, null, 2));

    // Compute new evidence status from curation
    const curationPath = findCurationFile(category, slug);
    const curationData = curationPath ? JSON.parse(fs.readFileSync(curationPath, 'utf8')) : null;
    const sources = normalizeSources(curationData);
    const productScopedSources = sources.filter(s => s.scope === 'product');
    const QUALIFYING_TYPES = new Set(['review', 'comparison', 'forum_discussion', 'teardown']);
    const qualifyingSources = productScopedSources.filter(s =>
      QUALIFYING_TYPES.has(s.source_type) && s.claim && s.claim.length > 0
    );
    const qualifyingPoolBPlus = qualifyingSources.filter(s => ['S', 'A', 'B'].includes(s.pool));
    let evidenceStatus;
    if (qualifyingSources.length >= 5 && qualifyingPoolBPlus.length >= 2) {
      evidenceStatus = 'full_confidence';
    } else if (qualifyingSources.length >= 2 && qualifyingPoolBPlus.length >= 1) {
      evidenceStatus = 'scored_with_disclosure';
    } else {
      evidenceStatus = 'insufficient_evidence';
    }

    refreshData();
    res.json({
      success: true,
      score: newScore,
      tier: newTier,
      tierLabel: tierLabel(newTier),
      evidenceStatus,
      qualifyingSourceCount: qualifyingSources.length,
      qualifyingPoolBPlus: qualifyingPoolBPlus.length,
      axisScores: { quality: q, durability: d, performance: p },
      weights,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
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
