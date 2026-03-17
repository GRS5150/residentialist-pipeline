
const db = require('./db');
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'residentialist.db');
const conn = new Database(dbPath);

// Find and remove the duplicate vinyl-dh Window World entry
const rows = conn.prepare("SELECT p.id, p.product_name, p.config, p.category FROM products p WHERE LOWER(product_name) LIKE '%window world%'").all();
console.log('Window World product entries:', rows);

for (const row of rows) {
  if (row.config === 'VINYL-DH' || row.category === 'vinyl-windows') {
    console.log('Removing duplicate:', row);
    conn.prepare("DELETE FROM scores WHERE product_id = ?").run(row.id);
    conn.prepare("DELETE FROM runs WHERE product_id = ?").run(row.id);
    conn.prepare("DELETE FROM products WHERE id = ?").run(row.id);
    console.log('Deleted product_id', row.id);
  }
}

conn.close();
console.log('Cleanup done.');
