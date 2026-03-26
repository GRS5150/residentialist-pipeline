/**
 * THE RESIDENTIALIST — Phase 2 Database Migration
 * Adds deep dive tracking columns to the products table.
 * 
 * Run: node db_migrate_phase2.js
 */

const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config({ path: '/home/ubuntu/.openclaw/workspace/residentialist/.env' });

const WORKSPACE = process.env.OPENCLAW_WORKSPACE || '/home/ubuntu/.openclaw/workspace/residentialist';
const dbPath = process.env.DATABASE_PATH || path.join(WORKSPACE, 'residentialist.db');

console.log(`[MIGRATE] Opening database: ${dbPath}`);
const db = new Database(dbPath);

// Enable WAL mode for better concurrent access
db.pragma('journal_mode = WAL');

const migrations = [
  {
    name: 'add_deep_dive_status',
    sql: `ALTER TABLE products ADD COLUMN deep_dive_status TEXT DEFAULT 'never_run'`,
    check: () => {
      const cols = db.prepare("PRAGMA table_info(products)").all();
      return cols.some(c => c.name === 'deep_dive_status');
    }
  },
  {
    name: 'add_deep_dive_date',
    sql: `ALTER TABLE products ADD COLUMN deep_dive_date DATETIME DEFAULT NULL`,
    check: () => {
      const cols = db.prepare("PRAGMA table_info(products)").all();
      return cols.some(c => c.name === 'deep_dive_date');
    }
  },
  {
    name: 'add_curation_status',
    sql: `ALTER TABLE products ADD COLUMN curation_status TEXT DEFAULT NULL`,
    check: () => {
      const cols = db.prepare("PRAGMA table_info(products)").all();
      return cols.some(c => c.name === 'curation_status');
    }
  },
  {
    name: 'add_curation_date',
    sql: `ALTER TABLE products ADD COLUMN curation_date DATETIME DEFAULT NULL`,
    check: () => {
      const cols = db.prepare("PRAGMA table_info(products)").all();
      return cols.some(c => c.name === 'curation_date');
    }
  },
  {
    name: 'add_score_version',
    sql: `ALTER TABLE products ADD COLUMN score_version INTEGER DEFAULT 0`,
    check: () => {
      const cols = db.prepare("PRAGMA table_info(products)").all();
      return cols.some(c => c.name === 'score_version');
    }
  },
  {
    name: 'add_last_scored',
    sql: `ALTER TABLE products ADD COLUMN last_scored DATETIME DEFAULT NULL`,
    check: () => {
      const cols = db.prepare("PRAGMA table_info(products)").all();
      return cols.some(c => c.name === 'last_scored');
    }
  },
  {
    name: 'add_last_rescored',
    sql: `ALTER TABLE products ADD COLUMN last_rescored DATETIME DEFAULT NULL`,
    check: () => {
      const cols = db.prepare("PRAGMA table_info(products)").all();
      return cols.some(c => c.name === 'last_rescored');
    }
  },
  {
    name: 'add_product_label',
    sql: `ALTER TABLE products ADD COLUMN product_label TEXT DEFAULT NULL`,
    check: () => {
      const cols = db.prepare("PRAGMA table_info(products)").all();
      return cols.some(c => c.name === 'product_label');
    }
  },
  {
    name: 'add_health_label',
    sql: `ALTER TABLE products ADD COLUMN health_label TEXT DEFAULT NULL`,
    check: () => {
      const cols = db.prepare("PRAGMA table_info(products)").all();
      return cols.some(c => c.name === 'health_label');
    }
  },
  {
    name: 'add_calibration_version',
    sql: `ALTER TABLE products ADD COLUMN calibration_version TEXT DEFAULT NULL`,
    check: () => {
      const cols = db.prepare("PRAGMA table_info(products)").all();
      return cols.some(c => c.name === 'calibration_version');
    }
  },
  {
    name: 'create_score_history',
    sql: `CREATE TABLE IF NOT EXISTS score_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_slug TEXT NOT NULL,
      product_name TEXT,
      action TEXT NOT NULL,
      old_score REAL,
      new_score REAL,
      old_label TEXT,
      new_label TEXT,
      sources_changed INTEGER DEFAULT 0,
      calibration_version TEXT,
      composite_method TEXT,
      duration_ms INTEGER,
      cost REAL DEFAULT 0,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    check: () => {
      const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='score_history'").all();
      return tables.length > 0;
    }
  },
  {
    name: 'create_deep_dive_log',
    sql: `CREATE TABLE IF NOT EXISTS deep_dive_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_slug TEXT NOT NULL,
      product_name TEXT,
      status TEXT NOT NULL,
      sources_found INTEGER,
      sources_score INTEGER,
      sources_report_only INTEGER,
      sources_quarantine INTEGER,
      perplexity_cost REAL,
      sonnet_cost REAL,
      total_cost REAL,
      duration_ms INTEGER,
      error_message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    check: () => {
      const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='deep_dive_log'").all();
      return tables.length > 0;
    }
  }
];

// Run migrations
let applied = 0;
let skipped = 0;

for (const migration of migrations) {
  if (migration.check()) {
    console.log(`[MIGRATE] ⏭  ${migration.name} — already applied`);
    skipped++;
  } else {
    try {
      db.exec(migration.sql);
      console.log(`[MIGRATE] ✅ ${migration.name} — applied`);
      applied++;
    } catch (err) {
      console.error(`[MIGRATE] ❌ ${migration.name} — failed: ${err.message}`);
    }
  }
}

console.log(`\n[MIGRATE] Complete: ${applied} applied, ${skipped} skipped`);

// Verify
console.log('\n[MIGRATE] Products table columns:');
const cols = db.prepare("PRAGMA table_info(products)").all();
cols.forEach(c => console.log(`  ${c.cid}: ${c.name} (${c.type})`));

console.log('\n[MIGRATE] Tables:');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
tables.forEach(t => console.log(`  ${t.name}`));

db.close();
console.log('\n[MIGRATE] Done.');
