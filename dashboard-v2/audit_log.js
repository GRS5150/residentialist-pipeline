/**
 * Audit Log — Per-product action history
 *
 * Stores a JSON log file per product at:
 *   dashboard-v2/audit_history/{category}/{productSlug}.json
 *
 * Each entry: { timestamp, action, detail, scoreBefore, scoreAfter, user }
 */

const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, 'audit_history');

/**
 * Ensure log directory exists for a category.
 */
function ensureDir(category) {
  const dir = path.join(LOG_DIR, category);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

/**
 * Get the log file path for a product.
 */
function logPath(category, productSlug) {
  return path.join(ensureDir(category), `${productSlug}.json`);
}

/**
 * Read the full audit log for a product.
 * Returns { product_slug, history: [...] }
 */
function getLog(category, productSlug) {
  const filePath = logPath(category, productSlug);
  if (!fs.existsSync(filePath)) {
    return { product_slug: productSlug, history: [] };
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return { product_slug: productSlug, history: [] };
  }
}

/**
 * Append an entry to the audit log.
 *
 * @param {string} category - Category slug
 * @param {string} productSlug - Product slug
 * @param {object} entry - { action, detail, scoreBefore?, scoreAfter?, user? }
 * @returns {object} The full log entry that was written
 */
function appendLog(category, productSlug, entry) {
  const log = getLog(category, productSlug);

  const fullEntry = {
    timestamp: new Date().toISOString(),
    action: entry.action,
    detail: entry.detail,
    scoreBefore: entry.scoreBefore ?? null,
    scoreAfter: entry.scoreAfter ?? null,
    user: entry.user || 'ray'
  };

  log.history.push(fullEntry);

  const filePath = logPath(category, productSlug);
  fs.writeFileSync(filePath, JSON.stringify(log, null, 2), 'utf8');

  return fullEntry;
}

/**
 * Get all logs for a category (for batch views).
 */
function getCategoryLogs(category) {
  const dir = path.join(LOG_DIR, category);
  if (!fs.existsSync(dir)) return {};

  const logs = {};
  for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.json'))) {
    const slug = file.replace('.json', '');
    try {
      logs[slug] = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
    } catch { /* skip */ }
  }
  return logs;
}

module.exports = { getLog, appendLog, getCategoryLogs };
