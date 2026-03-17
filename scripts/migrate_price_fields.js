/**
 * Migration: Add price fields to products table
 * Run: node scripts/migrate_price_fields.js
 */
const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'residentialist.db');
const db = new Database(DB_PATH);

const columns = [
  { name: 'price_amount', type: 'REAL' },
  { name: 'price_unit', type: 'TEXT' },
  { name: 'price_reference_spec', type: 'TEXT' },
  { name: 'price_note', type: 'TEXT' },
  { name: 'price_sources', type: 'TEXT' },
  { name: 'price_updated', type: 'DATETIME' },
  { name: 'price_integrity', type: 'TEXT' }
];

// Check existing columns
const existing = db.pragma('table_info(products)').map(c => c.name);
console.log('[MIGRATE] Existing columns:', existing.length);

let added = 0;
for (const col of columns) {
  if (existing.includes(col.name)) {
    console.log(`  ✓ ${col.name} already exists`);
  } else {
    db.exec(`ALTER TABLE products ADD COLUMN ${col.name} ${col.type}`);
    console.log(`  + Added ${col.name} (${col.type})`);
    added++;
  }
}

console.log(`\n[MIGRATE] Done. Added ${added} new columns.`);
db.close();
