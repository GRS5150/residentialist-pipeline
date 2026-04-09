/**
 * Actions — File write operations for the dashboard workbench
 *
 * Each action:
 *   1. Reads the target file
 *   2. Creates a .bak backup
 *   3. Makes the change
 *   4. Writes the file back
 *   5. Appends to audit log
 *
 * All actions return { success: true, ... } or { error: '...' }
 */

const fs = require('fs');
const path = require('path');
const { appendLog } = require('./audit_log');

// ── Helpers ─────────────────────────────────────────────────────────────────

function readJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJSON(filePath, data) {
  // Create .bak backup before writing
  if (fs.existsSync(filePath)) {
    fs.copyFileSync(filePath, filePath + '.bak');
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function findCurationFile(workspace, category, productSlug) {
  const curationDir = path.join(workspace, 'calibration', category, 'curation_files');
  if (fs.existsSync(curationDir)) {
    const files = fs.readdirSync(curationDir).filter(f => f.endsWith('.json'));
    const match = files.find(f => f.includes(productSlug));
    if (match) return path.join(curationDir, match);
  }

  // Legacy locations
  const calibDir = path.join(workspace, 'calibration', category);
  if (fs.existsSync(calibDir)) {
    const files = fs.readdirSync(calibDir).filter(f =>
      f.endsWith('.json') && f.includes(productSlug) &&
      (f.includes('_sources') || f.includes('_curation')) &&
      !f.includes('pipeline_progress') && f !== 'config.json'
    );
    if (files.length) return path.join(calibDir, files[0]);
  }

  const curationRoot = path.join(workspace, 'curation');
  if (fs.existsSync(curationRoot)) {
    const files = fs.readdirSync(curationRoot).filter(f =>
      f.endsWith('.json') && f.includes(productSlug) &&
      (f.includes('_sources') || f.includes('_curation'))
    );
    if (files.length) return path.join(curationRoot, files[0]);
  }

  return null;
}

// ── Remove Source ───────────────────────────────────────────────────────────

/**
 * Remove a source from a product's curation file.
 *
 * @param {string} workspace - Base workspace path
 * @param {string} category - Category slug
 * @param {string} productSlug - Product slug
 * @param {string} sourceId - Source ID (e.g., "SRC-001") or source name
 * @returns {object} { success, removedSource, remainingCount }
 */
function removeSource(workspace, category, productSlug, sourceId) {
  const curationPath = findCurationFile(workspace, category, productSlug);
  if (!curationPath) {
    return { error: `Curation file not found for ${category}/${productSlug}` };
  }

  try {
    const data = readJSON(curationPath);

    if (!Array.isArray(data.sources)) {
      return { error: 'Curation file does not have a sources array' };
    }

    const before = data.sources.length;
    const removed = data.sources.find(s =>
      s.id === sourceId || s.source_name === sourceId
    );

    if (!removed) {
      return { error: `Source "${sourceId}" not found` };
    }

    data.sources = data.sources.filter(s =>
      s.id !== sourceId && s.source_name !== sourceId
    );

    writeJSON(curationPath, data);

    appendLog(category, productSlug, {
      action: 'remove_source',
      detail: `Removed source: "${removed.source_name}" (${removed.classification || 'unclassified'})`,
      user: 'ray'
    });

    return {
      success: true,
      removedSource: removed.source_name,
      remainingCount: data.sources.length
    };

  } catch (err) {
    return { error: `Failed to remove source: ${err.message}` };
  }
}

// ── Remove Claim ────────────────────────────────────────────────────────────

/**
 * Remove a specific claim/note from a product's calibration config.
 *
 * @param {string} workspace - Base workspace path
 * @param {string} category - Category slug
 * @param {string} productSlug - Product slug
 * @param {string} claimText - The claim text to remove (partial match)
 * @returns {object} { success, removedClaim }
 */
function removeClaim(workspace, category, productSlug, claimText) {
  const calibPath = path.join(workspace, 'calibration', category, 'config.json');
  if (!fs.existsSync(calibPath)) {
    return { error: `Calibration config not found for ${category}` };
  }

  try {
    const data = readJSON(calibPath);
    const products = data.calibration_products || [];
    const product = products.find(p => p.slug === productSlug);

    if (!product) {
      return { error: `Product "${productSlug}" not found in calibration config` };
    }

    if (!Array.isArray(product.notes)) {
      return { error: 'Product has no notes array' };
    }

    const beforeCount = product.notes.length;
    const searchLower = claimText.toLowerCase();
    const removed = product.notes.find(n => n.toLowerCase().includes(searchLower));

    if (!removed) {
      return { error: `Claim not found: "${claimText.substring(0, 80)}"` };
    }

    product.notes = product.notes.filter(n => !n.toLowerCase().includes(searchLower));

    writeJSON(calibPath, data);

    appendLog(category, productSlug, {
      action: 'remove_claim',
      detail: `Removed claim: "${removed.substring(0, 120)}"`,
      user: 'ray'
    });

    return {
      success: true,
      removedClaim: removed,
      remainingCount: product.notes.length
    };

  } catch (err) {
    return { error: `Failed to remove claim: ${err.message}` };
  }
}

// ── Add Source ───────────────────────────────────────────────────────────────

/**
 * Add a new source to a product's curation file.
 *
 * @param {string} workspace - Base workspace path
 * @param {string} category - Category slug
 * @param {string} productSlug - Product slug
 * @param {object} sourceData - { name, url, summary, classification, column? }
 * @returns {object} { success, newSource, totalCount }
 */
function addSource(workspace, category, productSlug, sourceData) {
  const curationPath = findCurationFile(workspace, category, productSlug);
  if (!curationPath) {
    return { error: `Curation file not found for ${category}/${productSlug}` };
  }

  try {
    const data = readJSON(curationPath);

    if (!Array.isArray(data.sources)) {
      data.sources = [];
    }

    // Generate next source ID
    const maxId = data.sources
      .map(s => parseInt((s.id || '').replace('SRC-', ''), 10))
      .filter(n => !isNaN(n))
      .reduce((max, n) => Math.max(max, n), 0);

    const newSource = {
      id: `SRC-${String(maxId + 1).padStart(3, '0')}`,
      source_name: sourceData.name,
      url: sourceData.url || 'N/A',
      platform: 'other',
      column: sourceData.column || 'expert',
      snippet: sourceData.summary || '',
      pool: null,
      classification: (sourceData.classification || 'independent').toLowerCase(),
      classification_reason: 'Added via dashboard — Find Better Source',
      topics: [],
      verification_relevance: 'pending'
    };

    data.sources.push(newSource);
    writeJSON(curationPath, data);

    appendLog(category, productSlug, {
      action: 'add_source',
      detail: `Added source: "${sourceData.name}" (${newSource.classification}) via Find Better Source`,
      user: 'ray'
    });

    return {
      success: true,
      newSource,
      totalCount: data.sources.length
    };

  } catch (err) {
    return { error: `Failed to add source: ${err.message}` };
  }
}

// ── Flag for Research ───────────────────────────────────────────────────────

/**
 * Flag a product for re-research on a specific topic.
 * Appends to flagged_for_research.json queue.
 */
function flagForResearch(workspace, category, productSlug, topic) {
  const flagPath = path.join(workspace, 'flagged_for_research.json');
  let queue = [];
  if (fs.existsSync(flagPath)) {
    try { queue = JSON.parse(fs.readFileSync(flagPath, 'utf8')); } catch { queue = []; }
  }

  const entry = {
    category,
    product_slug: productSlug,
    topic,
    flagged_at: new Date().toISOString(),
    status: 'pending',
    flagged_by: 'ray'
  };

  queue.push(entry);
  fs.writeFileSync(flagPath, JSON.stringify(queue, null, 2), 'utf8');

  appendLog(category, productSlug, {
    action: 'flag_research',
    detail: `Flagged for re-research: "${topic}"`,
    user: 'ray'
  });

  return { success: true, entry, queueLength: queue.length };
}

// ── Accept As-Is ────────────────────────────────────────────────────────────

/**
 * Accept a flagged item as-is after human review.
 */
function acceptAsIs(workspace, category, productSlug, detail) {
  appendLog(category, productSlug, {
    action: 'accept_as_is',
    detail: `Reviewed and accepted: "${detail}"`,
    user: 'ray'
  });

  return { success: true, detail };
}

// ── Batch Actions ───────────────────────────────────────────────────────────

/**
 * Execute a batch action across multiple products.
 *
 * @param {string} workspace - Base workspace path
 * @param {string} category - Category slug
 * @param {string} action - 'accept_as_is' | 'flag_research'
 * @param {Array} products - [{ slug, detail }]
 * @returns {object} { success, results: [...] }
 */
function batchAction(workspace, category, action, products) {
  const results = [];

  for (const { slug, detail, topic } of products) {
    try {
      let result;
      if (action === 'accept_as_is') {
        result = acceptAsIs(workspace, category, slug, detail);
      } else if (action === 'flag_research') {
        result = flagForResearch(workspace, category, slug, topic || detail);
      } else {
        result = { error: `Unknown batch action: ${action}` };
      }
      results.push({ slug, ...result });
    } catch (err) {
      results.push({ slug, error: err.message });
    }
  }

  return {
    success: results.every(r => r.success),
    totalProcessed: results.length,
    results
  };
}

module.exports = {
  removeSource,
  removeClaim,
  addSource,
  flagForResearch,
  acceptAsIs,
  batchAction,
  findCurationFile
};
