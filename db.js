/**
 * THE RESIDENTIALIST — db.js
 * Phase 5: Product Database (SQLite)
 *
 * Works with the existing residentialist.db schema:
 *   - products: existing table (product_name, product_line, category, scores)
 *   - scores: new table for per-run scoring history
 *   - findings: new table for spec-level detail
 *   - run_history: new table for pipeline run metadata
 *
 * The existing products table has columns:
 *   id, airtable_id, product_name, product_line, category,
 *   overall_score, quality_score, durability_score, performance_score,
 *   material_safety_score, rubric_version, eval_id, last_synced
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const WORKSPACE = '/Users/Residentialist/.openclaw/workspace/residentialist';
const DB_PATH = path.join(WORKSPACE, 'residentialist.db');

let _db = null;

function getDb() {
  if (_db) return _db;
  _db = new Database(DB_PATH);
  _db.pragma('journal_mode = WAL');
  _db.pragma('foreign_keys = ON');
  ensureNewTables();
  return _db;
}

function ensureNewTables() {
  const db = _db;

  // Add 'config' column to products if missing (existing schema uses product_line)
  const cols = db.prepare("PRAGMA table_info(products)").all().map(c => c.name);
  if (!cols.includes('config')) {
    db.exec("ALTER TABLE products ADD COLUMN config TEXT DEFAULT 'DH'");
  }

  // Add 'material_group' column for clad vs non-clad separation (March 14, 2026)
  // Groups: 'clad' (wood-clad, fiberglass), 'non-clad' (vinyl, composite, aluminum)
  // Ray confirmed: rate clad and non-clad separately.
  if (!cols.includes('material_group')) {
    db.exec("ALTER TABLE products ADD COLUMN material_group TEXT DEFAULT NULL");
  }
  if (!cols.includes('material_class')) {
    db.exec("ALTER TABLE products ADD COLUMN material_class TEXT DEFAULT NULL");
  }
  // Add 'status' column: 'active' (default), 'rejected', 'on_hold'
  // Rejected products are excluded from scoring and reports.
  if (!cols.includes('status')) {
    db.exec("ALTER TABLE products ADD COLUMN status TEXT DEFAULT 'active'");
  }
  if (!cols.includes('status_reason')) {
    db.exec("ALTER TABLE products ADD COLUMN status_reason TEXT DEFAULT NULL");
  }

  // Create new Phase 5 tables if they don't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL REFERENCES products(id),
      overall REAL,
      grade TEXT,
      outlook TEXT,
      quality REAL,
      durability REAL,
      performance REAL,
      data_confidence TEXT,
      undisclosed_count INTEGER DEFAULT 0,
      source TEXT DEFAULT 'pipeline',
      run_dir TEXT,
      scored_at TEXT DEFAULT (datetime('now')),
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS findings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      score_id INTEGER NOT NULL REFERENCES scores(id),
      axis TEXT NOT NULL,
      spec TEXT NOT NULL,
      value REAL,
      evidence TEXT,
      confidence TEXT
    );

    CREATE TABLE IF NOT EXISTS run_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL REFERENCES products(id),
      run_dir TEXT,
      status TEXT NOT NULL,
      attempts INTEGER DEFAULT 1,
      error_count INTEGER DEFAULT 0,
      self_corrected INTEGER DEFAULT 0,
      duration_seconds INTEGER,
      started_at TEXT DEFAULT (datetime('now')),
      completed_at TEXT,
      notes TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_scores_product ON scores(product_id);
    CREATE INDEX IF NOT EXISTS idx_scores_scored_at ON scores(scored_at);
    CREATE INDEX IF NOT EXISTS idx_findings_score ON findings(score_id);
    CREATE INDEX IF NOT EXISTS idx_run_history_product ON run_history(product_id);
  `);
}

// ── Material group mapping (clad vs non-clad) ──────────────────────────────
// Ray confirmed March 14, 2026: rate clad and non-clad products separately.
// 'clad' = wood-clad (aluminum/vinyl cladding over wood) + fiberglass
// 'non-clad' = vinyl, composite, aluminum
// Material class is the specific material; material_group is the display grouping.

const MATERIAL_GROUP_MAP = {
  // Clad / Premium group — wood-core with protective cladding + full fiberglass
  'aluminum-clad wood':     'clad',
  'wood-clad, aluminum':    'clad',
  'wood-clad':              'clad',
  'vinyl-clad wood':        'clad',    // Wood core = clad group (e.g., Andersen 400)
  'fiberglass-clad wood':   'clad',    // Fiberglass cladding over wood
  'pultruded fiberglass':   'clad',
  'fiberglass':             'clad',
  'ultrex':                 'clad',
  'duracast':               'clad',
  // Non-clad / Standard group — no wood core
  'composite':              'non-clad',
  'fibrex':                 'non-clad',
  'vinyl':                  'non-clad',
  'aluminum':               'non-clad',
};

function getMaterialGroup(materialClass) {
  if (!materialClass) return null;
  const lower = materialClass.toLowerCase().trim();
  for (const [key, group] of Object.entries(MATERIAL_GROUP_MAP)) {
    if (lower.includes(key)) return group;
  }
  return null; // Unknown — will be classified when evidence file is created
}

/**
 * Set material class and group for a product.
 * Called by the orchestrator after material class is determined.
 */
function setMaterialInfo(productName, materialClass) {
  const db = getDb();
  const normalized = normalizeProductName(productName);
  const group = getMaterialGroup(materialClass);
  db.prepare(`
    UPDATE products SET material_class = ?, material_group = ?
    WHERE LOWER(TRIM(product_name)) = ?
  `).run(materialClass, group, normalized);
  return { materialClass, materialGroup: group };
}

/**
 * Reject a product — removes from active scoring and reports.
 * Reason is logged for audit trail.
 */
function rejectProduct(productName, reason) {
  const db = getDb();
  const normalized = normalizeProductName(productName);
  db.prepare(`
    UPDATE products SET status = 'rejected', status_reason = ?
    WHERE LOWER(TRIM(product_name)) = ?
  `).run(reason, normalized);
  console.log(`[DB] Product rejected: ${productName} — ${reason}`);
}

/**
 * Put a product on hold (e.g., faucets category).
 */
function holdProduct(productName, reason) {
  const db = getDb();
  const normalized = normalizeProductName(productName);
  db.prepare(`
    UPDATE products SET status = 'on_hold', status_reason = ?
    WHERE LOWER(TRIM(product_name)) = ?
  `).run(reason, normalized);
}

// ── Product helpers ──────────────────────────────────────────────────────────

function normalizeProductName(name) {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

function getOrCreateProduct(name, config = 'DH', category = 'windows') {
  const db = getDb();
  const normalized = normalizeProductName(name);

  // Match on product_name (existing schema) — case-insensitive
  let product = db.prepare(`
    SELECT * FROM products
    WHERE LOWER(TRIM(product_name)) = ? AND LOWER(category) = ?
    LIMIT 1
  `).get(normalized, category.toLowerCase());

  if (!product) {
    const result = db.prepare(`
      INSERT INTO products (product_name, product_line, category, config)
      VALUES (?, ?, ?, ?)
    `).run(name.trim(), config.toUpperCase(), category.toLowerCase(), config.toUpperCase());
    product = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
  }

  return product;
}

// ── Score helpers ────────────────────────────────────────────────────────────

/**
 * Check if a product has been scored (in the scores table).
 */
function isScored(name, config = 'DH') {
  const db = getDb();
  const normalized = normalizeProductName(name);
  const row = db.prepare(`
    SELECT s.id FROM scores s
    JOIN products p ON s.product_id = p.id
    WHERE LOWER(TRIM(p.product_name)) = ?
    LIMIT 1
  `).get(normalized);
  return !!row;
}

/**
 * Get the latest score for a product.
 */
function getScore(name, config = 'DH') {
  const db = getDb();
  const normalized = normalizeProductName(name);
  return db.prepare(`
    SELECT p.product_name as name, p.config, p.category,
           s.overall, s.grade, s.outlook, s.quality, s.durability, s.performance,
           s.data_confidence, s.undisclosed_count, s.source, s.run_dir, s.scored_at, s.notes
    FROM scores s
    JOIN products p ON s.product_id = p.id
    WHERE LOWER(TRIM(p.product_name)) = ?
    ORDER BY s.scored_at DESC
    LIMIT 1
  `).get(normalized) || null;
}

/**
 * Save a new score. Does NOT overwrite — stores every run.
 */
function saveScore({
  product, config = 'DH', category = 'windows',
  overall, grade, outlook, quality, durability, performance,
  dataConfidence, undisclosedCount = 0, source = 'pipeline', runDir, notes
}) {
  const db = getDb();
  const p = getOrCreateProduct(product, config, category);

  // Also update the main products table for backward compatibility
  if (overall != null) {
    db.prepare(`
      UPDATE products SET overall_score = ?, quality_score = ?, durability_score = ?,
                          performance_score = ?, config = ?
      WHERE id = ?
    `).run(overall, quality, durability, performance, config.toUpperCase(), p.id);
  }

  const result = db.prepare(`
    INSERT INTO scores (product_id, overall, grade, outlook, quality, durability, performance,
                        data_confidence, undisclosed_count, source, run_dir, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(p.id, overall, grade, outlook, quality, durability, performance,
         dataConfidence, undisclosedCount, source, runDir, notes);

  return result.lastInsertRowid;
}

/**
 * Save findings (spec-level details) for a score.
 */
function saveFindings(scoreId, findings) {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO findings (score_id, axis, spec, value, evidence, confidence)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const tx = db.transaction((items) => {
    for (const f of items) {
      stmt.run(scoreId, f.axis, f.spec, f.value || null, f.evidence || null, f.confidence || null);
    }
  });
  tx(findings);
}

/**
 * Record a pipeline run.
 */
function saveRun({
  product, config = 'DH', runDir, status, attempts = 1,
  errorCount = 0, selfCorrected = false, durationSeconds, notes
}) {
  const db = getDb();
  const p = getOrCreateProduct(product, config);
  db.prepare(`
    INSERT INTO run_history (product_id, run_dir, status, attempts, error_count,
                             self_corrected, duration_seconds, completed_at, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), ?)
  `).run(p.id, runDir, status, attempts, errorCount, selfCorrected ? 1 : 0, durationSeconds, notes);
}

/**
 * Get all products with their latest scores, sorted by overall descending.
 */
function getAllScores() {
  const db = getDb();
  return db.prepare(`
    SELECT p.product_name as name, p.config, p.category,
           p.material_class, p.material_group, p.status,
           s.overall, s.grade, s.outlook, s.quality, s.durability, s.performance,
           s.data_confidence, s.source, s.run_dir, s.scored_at
    FROM products p
    LEFT JOIN scores s ON s.product_id = p.id
      AND s.scored_at = (SELECT MAX(s2.scored_at) FROM scores s2 WHERE s2.product_id = p.id)
    WHERE s.overall IS NOT NULL
      AND COALESCE(p.status, 'active') != 'rejected'
    ORDER BY s.overall DESC
  `).all();
}

/**
 * Get all scores grouped by material group (clad vs non-clad).
 * Returns { clad: [...], non_clad: [...], unclassified: [...] }
 */
function getScoresByGroup() {
  const all = getAllScores();
  return {
    clad: all.filter(s => s.material_group === 'clad'),
    non_clad: all.filter(s => s.material_group === 'non-clad'),
    unclassified: all.filter(s => !s.material_group)
  };
}

/**
 * Get scoring history for a product (all runs, most recent first).
 */
function getScoreHistory(name, config = 'DH') {
  const db = getDb();
  const normalized = normalizeProductName(name);
  return db.prepare(`
    SELECT s.overall, s.grade, s.outlook, s.quality, s.durability, s.performance,
           s.data_confidence, s.source, s.run_dir, s.scored_at, s.notes
    FROM scores s
    JOIN products p ON s.product_id = p.id
    WHERE LOWER(TRIM(p.product_name)) = ?
    ORDER BY s.scored_at DESC
  `).all(normalized);
}

/**
 * Get run history for a product.
 */
function getRunHistory(name, config = 'DH') {
  const db = getDb();
  const normalized = normalizeProductName(name);
  return db.prepare(`
    SELECT rh.run_dir, rh.status, rh.attempts, rh.error_count, rh.self_corrected,
           rh.duration_seconds, rh.started_at, rh.completed_at, rh.notes
    FROM run_history rh
    JOIN products p ON rh.product_id = p.id
    WHERE LOWER(TRIM(p.product_name)) = ?
    ORDER BY rh.started_at DESC
  `).all(normalized);
}

/**
 * Get DB stats summary.
 */
function getStats() {
  const db = getDb();
  const products = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
  const scores = db.prepare('SELECT COUNT(*) as count FROM scores').get().count;
  const runs = db.prepare('SELECT COUNT(*) as count FROM run_history').get().count;
  const avgScore = db.prepare('SELECT AVG(overall) as avg FROM scores WHERE overall IS NOT NULL').get().avg;
  return { products, scores, runs, avgScore: avgScore ? Math.round(avgScore * 100) / 100 : null };
}

// ── Phase 6: Spec Sheet Helpers ──────────────────────────────────────────────

/**
 * Save a parsed spec sheet record.
 */
function saveSpecSheet({
  specId, source = 'upload', builder = null, address = null, city = null,
  rawText = null, products = [], ambiguous = [], summary = null,
  aiCost = null
}) {
  const db = getDb();
  const id = specId || `spec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const existing = db.prepare('SELECT id FROM spec_sheets WHERE spec_id = ?').get(id);
  if (existing) {
    // Update existing
    db.prepare(`
      UPDATE spec_sheets SET
        source = ?, builder_name = ?, property_address = ?, property_city = ?,
        raw_text = ?, extracted_products = ?, extraction_summary = ?,
        categories_found = ?, items_needing_review = ?,
        status = 'Parsed', updated_at = datetime('now')
      WHERE spec_id = ?
    `).run(
      source, builder, address, city,
      rawText, JSON.stringify(products), JSON.stringify(summary),
      (products || []).filter(p => p.scoreable).length,
      (ambiguous || []).length,
      id
    );
    return id;
  }

  db.prepare(`
    INSERT INTO spec_sheets (spec_id, source, builder_name, property_address, property_city,
      raw_text, extracted_products, extraction_summary, categories_found, items_needing_review,
      status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Parsed')
  `).run(
    id, source, builder, address, city,
    rawText, JSON.stringify(products), JSON.stringify(summary),
    (products || []).filter(p => p.scoreable).length,
    (ambiguous || []).length
  );

  return id;
}

/**
 * Get all spec sheets, most recent first.
 */
function getSpecSheets(limit = 50) {
  const db = getDb();
  return db.prepare(`
    SELECT spec_id, source, builder_name, property_address, property_city,
           extracted_products, extraction_summary, categories_found,
           items_needing_review, status, created_at, updated_at
    FROM spec_sheets
    ORDER BY created_at DESC
    LIMIT ?
  `).all(limit).map(row => ({
    ...row,
    extracted_products: row.extracted_products ? JSON.parse(row.extracted_products) : [],
    extraction_summary: row.extraction_summary ? JSON.parse(row.extraction_summary) : null
  }));
}

/**
 * Get a single spec sheet by ID.
 */
function getSpecSheet(specId) {
  const db = getDb();
  const row = db.prepare('SELECT * FROM spec_sheets WHERE spec_id = ?').get(specId);
  if (!row) return null;
  return {
    ...row,
    extracted_products: row.extracted_products ? JSON.parse(row.extracted_products) : [],
    extraction_summary: row.extraction_summary ? JSON.parse(row.extraction_summary) : null,
    edited_products: row.edited_products ? JSON.parse(row.edited_products) : null
  };
}

/**
 * Update spec sheet status after review.
 */
function updateSpecSheetStatus(specId, status, notes = null) {
  const db = getDb();
  db.prepare(`
    UPDATE spec_sheets SET status = ?, review_notes = ?, updated_at = datetime('now')
    WHERE spec_id = ?
  `).run(status, notes, specId);
}

/**
 * Get spec sheet stats.
 */
function getSpecStats() {
  const db = getDb();
  const total = db.prepare('SELECT COUNT(*) as n FROM spec_sheets').get().n;
  const parsed = db.prepare("SELECT COUNT(*) as n FROM spec_sheets WHERE status = 'Parsed'").get().n;
  const reviewed = db.prepare("SELECT COUNT(*) as n FROM spec_sheets WHERE status = 'Reviewed'").get().n;
  const totalProducts = db.prepare(`
    SELECT SUM(categories_found) as n FROM spec_sheets
  `).get().n || 0;
  return { total, parsed, reviewed, totalProducts };
}

function close() {
  if (_db) { _db.close(); _db = null; }
}

module.exports = {
  getDb, isScored, getScore, saveScore, saveFindings, saveRun,
  getAllScores, getScoresByGroup, getScoreHistory, getRunHistory, getStats,
  getOrCreateProduct, close,
  // Material group helpers (clad vs non-clad)
  setMaterialInfo, getMaterialGroup, MATERIAL_GROUP_MAP,
  // Product status helpers
  rejectProduct, holdProduct,
  // Phase 6: Spec sheet helpers
  saveSpecSheet, getSpecSheets, getSpecSheet, updateSpecSheetStatus, getSpecStats
};
