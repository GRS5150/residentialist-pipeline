// Database wrapper for SQLite
// Used by API routes to query Mission Control data

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.env.DATABASE_PATH || '/home/ubuntu/.openclaw/workspace/residentialist/residentialist.db';

let db = null;

function getDb() {
  if (!db) {
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
  }
  return db;
}

// Evaluations queries
const evaluations = {
  getQueue: () => {
    const stmt = getDb().prepare(`
      SELECT * FROM evaluations 
      WHERE status = 'Queued'
      ORDER BY created_at ASC
    `);
    return stmt.all();
  },

  getPipeline: () => {
    const stmt = getDb().prepare(`
      SELECT * FROM evaluations 
      WHERE status IN ('Bot1_Running', 'Bot1_Done', 'Bot2_Running', 'Bot2_Done', 'Bot3_Running', 'Bot3_Done')
      ORDER BY updated_at DESC
    `);
    return stmt.all();
  },

  getCompleted: () => {
    const stmt = getDb().prepare(`
      SELECT * FROM evaluations 
      WHERE status IN ('Ready_To_Generate', 'Report_Generated', 'Pending_Sync', 'Synced')
      ORDER BY completed_at DESC NULLS LAST, updated_at DESC
    `);
    return stmt.all();
  },

  getById: (eval_id) => {
    const stmt = getDb().prepare('SELECT * FROM evaluations WHERE eval_id = ?');
    return stmt.get(eval_id);
  },

  create: (productName, productLine, configuration, category, priority = 'Normal') => {
    const eval_id = `eval_${category}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const stmt = getDb().prepare(`
      INSERT INTO evaluations (eval_id, product_name, product_line, configuration, category, priority, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(eval_id, productName, productLine, configuration, category, priority, 'Queued');
    return eval_id;
  },

  updateStatus: (eval_id, newStatus) => {
    const stmt = getDb().prepare(`
      UPDATE evaluations 
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE eval_id = ?
    `);
    stmt.run(newStatus, eval_id);
  },

  updateScores: (eval_id, quality, durability, performance, overall) => {
    const stmt = getDb().prepare(`
      UPDATE evaluations 
      SET quality_score = ?, durability_score = ?, performance_score = ?, overall_score = ?, 
          updated_at = CURRENT_TIMESTAMP
      WHERE eval_id = ?
    `);
    stmt.run(quality, durability, performance, overall, eval_id);
  },

  updateMaterialSafety: (eval_id, score) => {
    const stmt = getDb().prepare(`
      UPDATE evaluations 
      SET material_safety_score = ?, updated_at = CURRENT_TIMESTAMP
      WHERE eval_id = ?
    `);
    stmt.run(score, eval_id);
  }
};

// Spec sheets queries
const specSheets = {
  getReviewQueue: () => {
    const stmt = getDb().prepare(`
      SELECT * FROM spec_sheets 
      WHERE status = 'Pending_Review'
      ORDER BY created_at DESC
    `);
    return stmt.all();
  },

  getById: (spec_id) => {
    const stmt = getDb().prepare('SELECT * FROM spec_sheets WHERE spec_id = ?');
    const row = stmt.get(spec_id);
    if (row && row.extracted_products) {
      row.extracted_products = JSON.parse(row.extracted_products);
    }
    if (row && row.extraction_summary) {
      row.extraction_summary = JSON.parse(row.extraction_summary);
    }
    return row;
  },

  approve: (spec_id, reviewNotes = '') => {
    const stmt = getDb().prepare(`
      UPDATE spec_sheets 
      SET status = 'Approved', review_timestamp = CURRENT_TIMESTAMP, review_notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE spec_id = ?
    `);
    stmt.run(reviewNotes, spec_id);
  },

  discard: (spec_id, reviewNotes = '') => {
    const stmt = getDb().prepare(`
      UPDATE spec_sheets 
      SET status = 'Discarded', review_timestamp = CURRENT_TIMESTAMP, review_notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE spec_id = ?
    `);
    stmt.run(reviewNotes, spec_id);
  }
};

// Activity log queries
const activity = {
  getRecent: (limit = 50) => {
    const stmt = getDb().prepare(`
      SELECT * FROM activity_log 
      ORDER BY created_at DESC 
      LIMIT ?
    `);
    return stmt.all(limit);
  },

  getForEval: (eval_id, limit = 20) => {
    const stmt = getDb().prepare(`
      SELECT * FROM activity_log 
      WHERE eval_id = ?
      ORDER BY created_at DESC 
      LIMIT ?
    `);
    return stmt.all(eval_id, limit);
  },

  getForSpec: (spec_id, limit = 20) => {
    const stmt = getDb().prepare(`
      SELECT * FROM activity_log 
      WHERE spec_id = ?
      ORDER BY created_at DESC 
      LIMIT ?
    `);
    return stmt.all(spec_id, limit);
  }
};

module.exports = {
  getDb,
  evaluations,
  specSheets,
  activity
};
