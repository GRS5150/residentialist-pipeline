/**
 * THE RESIDENTIALIST — Deep Dive Pipeline
 * Orchestrates: check manufacturer → call Perplexity → call Sonnet → save to curation
 * 
 * Usage:
 *   const { runProductDeepDive } = require('./deep_dive_pipeline');
 *   await runProductDeepDive('Pella 250 Series', 'double_hung');
 * 
 * CLI:
 *   node deep_dive_pipeline.js "Pella 250 Series" "double_hung"
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { checkManufacturer, detectManufacturer, runManufacturerSearch, runManufacturerRefresh } = require('./manufacturer_manager');
const { structureDeepDive } = require('./sonnet_structurer');

const WORKSPACE = __dirname;
const DEEP_DIVES_DIR = path.join(WORKSPACE, 'deep_dives');
const CURATION_DIR = path.join(WORKSPACE, 'curation');
const TEMPLATES_DIR = path.join(WORKSPACE, 'templates');
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

const RATE_LIMIT = {
  maxRetries: 3,
  retryDelay: 30000  // 30 seconds on failure
};

// Ensure directories exist
[DEEP_DIVES_DIR, CURATION_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

/**
 * Slugify a product name.
 */
function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

/**
 * Run a complete product deep dive.
 * 1. Check/update manufacturer data
 * 2. Call Perplexity for product deep dive
 * 3. Structure with Sonnet
 * 4. Save to curation
 */
async function runProductDeepDive(productName, operationType, options = {}) {
  const category = options.category || 'windows';
  const slug = operationType ? slugify(productName) + '_' + slugify(operationType) : slugify(productName);
  const productDir = path.join(DEEP_DIVES_DIR, slug);
  const processingLog = { product: productName, operation_type: operationType, slug, steps: [], errors: [] };

  console.log(`\n${'='.repeat(60)}`);
  console.log(`[DEEP DIVE] Starting: ${productName} (${operationType || 'general'})`);
  console.log(`${'='.repeat(60)}`);

  // Create product directory
  if (!fs.existsSync(productDir)) fs.mkdirSync(productDir, { recursive: true });

  try {
    // ── Step 1: Manufacturer check ─────────────────────────────────
    const mfgSlug = detectManufacturer(productName);
    const mfgStatus = checkManufacturer(mfgSlug);
    processingLog.steps.push({ step: 'manufacturer_check', status: mfgStatus.status, action: mfgStatus.action });

    console.log(`[DEEP DIVE] Manufacturer: ${mfgSlug} — Status: ${mfgStatus.status} (${mfgStatus.days_old || 'N/A'} days old)`);

    if (mfgStatus.action === 'full_search') {
      console.log(`[DEEP DIVE] Running full manufacturer search for ${mfgSlug}...`);
      const mfgData = await retryWithBackoff(() => 
        runManufacturerSearch(mfgSlug, PERPLEXITY_API_KEY), 'manufacturer_search');
      processingLog.steps.push({ step: 'manufacturer_search', type: 'full', duration_ms: mfgData.search_duration_ms });
    } else if (mfgStatus.action === 'light_refresh') {
      console.log(`[DEEP DIVE] Running light refresh for ${mfgSlug}...`);
      const mfgData = await retryWithBackoff(() => 
        runManufacturerRefresh(mfgSlug, PERPLEXITY_API_KEY), 'manufacturer_refresh');
      processingLog.steps.push({ step: 'manufacturer_refresh', type: 'light', duration_ms: mfgData?.last_refresh?.duration_ms });
    } else {
      console.log(`[DEEP DIVE] Manufacturer data fresh, skipping.`);
    }

    // ── Step 2: Perplexity product deep dive ───────────────────────
    console.log(`[DEEP DIVE] Calling Perplexity Sonar Deep Research...`);
    const rawReport = await retryWithBackoff(() => callPerplexity(productName, operationType, category), 'perplexity_search');
    
    // Save raw report
    const rawPath = path.join(productDir, 'raw_perplexity_report.md');
    fs.writeFileSync(rawPath, rawReport);
    console.log(`[DEEP DIVE] Raw report saved: ${rawPath} (${rawReport.length} chars)`);
    processingLog.steps.push({ step: 'perplexity_search', chars: rawReport.length });

    // ── Step 3: Sonnet structuring ─────────────────────────────────
    console.log(`[DEEP DIVE] Structuring with Sonnet...`);
    const structured = await retryWithBackoff(() => 
      structureDeepDive(rawReport, productName, operationType || 'general'), 'sonnet_structuring');
    
    // Save structured output
    const structuredPath = path.join(productDir, 'structured_output.json');
    fs.writeFileSync(structuredPath, JSON.stringify(structured, null, 2));
    console.log(`[DEEP DIVE] Structured output saved: ${structuredPath}`);
    processingLog.steps.push({ 
      step: 'sonnet_structuring',
      sources: structured.auto_classification_summary?.total || 0,
      cost_estimate: structured.structuring_cost_estimate || 0
    });

    // ── Step 4: Save to curation ──────────────────────────────────
    const curationPath = path.join(CURATION_DIR, `${slug}_sources.json`);
    fs.writeFileSync(curationPath, JSON.stringify(structured, null, 2));
    console.log(`[DEEP DIVE] Curation file saved: ${curationPath}`);
    processingLog.steps.push({ step: 'curation_save', path: curationPath });

    // ── Step 5: Update DB status ──────────────────────────────────
    try {
      updateProductStatus(slug, 'staged');
      processingLog.steps.push({ step: 'db_update', status: 'staged' });
    } catch (dbErr) {
      console.warn(`[DEEP DIVE] DB update failed (non-critical): ${dbErr.message}`);
      processingLog.errors.push({ step: 'db_update', error: dbErr.message });
    }

    // ── Save processing log ───────────────────────────────────────
    processingLog.completed = true;
    processingLog.completed_at = new Date().toISOString();
    const logPath = path.join(productDir, 'processing_log.json');
    fs.writeFileSync(logPath, JSON.stringify(processingLog, null, 2));

    console.log(`\n[DEEP DIVE] ✅ Complete: ${productName}`);
    console.log(`  Sources: ${structured.auto_classification_summary?.total || '?'}`);
    console.log(`  Score: ${structured.auto_classification_summary?.score || '?'} | ` +
      `Report: ${structured.auto_classification_summary?.report_only || '?'} | ` +
      `Quarantine: ${structured.auto_classification_summary?.quarantine || '?'}`);

    return { success: true, slug, structured, processingLog };

  } catch (err) {
    console.error(`\n[DEEP DIVE] ❌ Failed: ${productName} — ${err.message}`);
    processingLog.completed = false;
    processingLog.error = err.message;
    processingLog.error_at = new Date().toISOString();

    const logPath = path.join(productDir, 'processing_log.json');
    fs.writeFileSync(logPath, JSON.stringify(processingLog, null, 2));

    try { updateProductStatus(slug, 'error'); } catch (_) {}

    return { success: false, slug, error: err.message, processingLog };
  }
}

/**
 * Call Perplexity Sonar Deep Research API for a product.
 */
async function callPerplexity(productName, operationType, category) {
  if (!PERPLEXITY_API_KEY) {
    throw new Error('PERPLEXITY_API_KEY not set in .env');
  }

  // Load prompt template based on category
  const { getPromptTemplatePath } = require('./config_loader');
  const templatePath = getPromptTemplatePath(category || 'windows');
  let prompt = fs.readFileSync(templatePath, 'utf8');
  prompt = prompt.replace(/\{\{PRODUCT_NAME\}\}/g, productName);
  prompt = prompt.replace(/\{\{OPERATION_TYPE\}\}/g, operationType || 'general');

  const REFUSAL_PHRASES = [
    'i cannot perform',
    'real-time web search',
    'cannot do',
    'i cannot do',
    'i cannot access',
    'cannot perform the real-time',
    'limitations of my search',
    'i need to be direct',
    'which approach would be most useful',
  ];
  const MIN_REPORT_LENGTH = 5000;
  const MAX_ATTEMPTS = 3;
  const RETRY_DELAY_MS = 30000;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const startTime = Date.now();
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'sonar-deep-research',
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Perplexity API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const report = data.choices[0].message.content;
    const duration = Date.now() - startTime;

    console.log(`[PERPLEXITY] Attempt ${attempt}/${MAX_ATTEMPTS}: ${report.length} chars in ${Math.round(duration / 1000)}s`);

    // Check for refusal or insufficient response
    const reportLower = report.toLowerCase();
    const isRefusal = REFUSAL_PHRASES.some(phrase => reportLower.includes(phrase));
    const isTooShort = report.length < MIN_REPORT_LENGTH;

    if (isRefusal || isTooShort) {
      const reason = isRefusal ? 'refusal detected' : `too short (${report.length} chars < ${MIN_REPORT_LENGTH})`;
      console.warn(`[PERPLEXITY] ⚠️ Bad response on attempt ${attempt}: ${reason}`);
      if (attempt < MAX_ATTEMPTS) {
        console.log(`[PERPLEXITY] Retrying in ${RETRY_DELAY_MS / 1000}s...`);
        await new Promise(r => setTimeout(r, RETRY_DELAY_MS));
        continue;
      }
      console.error(`[PERPLEXITY] ❌ All ${MAX_ATTEMPTS} attempts returned bad responses. Using last response.`);
    } else {
      console.log(`[PERPLEXITY] ✅ Deep Research complete (attempt ${attempt})`);
    }

    return report;
  }
}

/**
 * Retry a function with exponential backoff.
 */
async function retryWithBackoff(fn, label) {
  for (let attempt = 1; attempt <= RATE_LIMIT.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === RATE_LIMIT.maxRetries) {
        throw new Error(`${label} failed after ${RATE_LIMIT.maxRetries} attempts: ${err.message}`);
      }
      const delay = RATE_LIMIT.retryDelay * attempt;
      console.warn(`[RETRY] ${label} attempt ${attempt} failed: ${err.message}. Retrying in ${delay / 1000}s...`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

/**
 * Update product status in DB (best-effort).
 */
function updateProductStatus(slug, status) {
  try {
    const Database = require('better-sqlite3');
    const dbPath = process.env.DATABASE_PATH || path.join(WORKSPACE, 'residentialist.db');
    const db = new Database(dbPath);
    
    // Try to update existing product
    const result = db.prepare(
      'UPDATE products SET deep_dive_status = ?, deep_dive_date = ? WHERE product_name LIKE ?'
    ).run(status, new Date().toISOString(), `%${slug.replace(/_/g, '%')}%`);
    
    db.close();
    
    if (result.changes === 0) {
      console.log(`[DB] No matching product found for slug: ${slug} (this is OK for new products)`);
    }
  } catch (err) {
    throw err;
  }
}

// ── CLI entry point ───────────────────────────────────────────────────────────
if (require.main === module) {
  const args = process.argv.slice(2);

  // Parse --category flag
  let category = 'windows';
  const categoryIdx = args.indexOf('--category');
  if (categoryIdx !== -1 && args[categoryIdx + 1]) {
    category = args[categoryIdx + 1];
    args.splice(categoryIdx, 2);
  }

  if (args.length < 1) {
    console.log('Usage: node deep_dive_pipeline.js "Product Name" [operation_type] [--category windows|countertops]');
    console.log('Example: node deep_dive_pipeline.js "Pella 250 Series" "double_hung"');
    console.log('Example: node deep_dive_pipeline.js "Cambria Brittanicca" --category countertops');
    process.exit(1);
  }

  const productName = args[0];
  const operationType = category === 'windows' ? (args[1] || 'double_hung') : null;

  runProductDeepDive(productName, operationType, { category })
    .then(result => {
      if (result.success) {
        console.log(`\nDone! Curation file at: curation/${result.slug}_sources.json`);
      } else {
        console.error(`\nFailed: ${result.error}`);
        process.exit(1);
      }
    })
    .catch(err => {
      console.error(`Fatal error: ${err.message}`);
      process.exit(1);
    });
}

module.exports = { runProductDeepDive };
