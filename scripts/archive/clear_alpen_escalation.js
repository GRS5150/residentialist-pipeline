const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.join('/Users/Residentialist/.openclaw/workspace/residentialist', 'residentialist.db');
const db = new Database(dbPath);

// Check for Alpen escalation
const rows = db.prepare("SELECT id, product, type, created_at FROM escalations WHERE product LIKE '%Alpen%'").all();
console.log('Alpen escalations found:', JSON.stringify(rows, null, 2));

if (rows.length > 0) {
  const result = db.prepare("DELETE FROM escalations WHERE product LIKE '%Alpen%'").run();
  console.log('Deleted:', result.changes, 'rows');
} else {
  console.log('No Alpen escalations to clear');
}

// Show remaining escalations
const remaining = db.prepare("SELECT id, product, type FROM escalations").all();
console.log('Remaining escalations:', JSON.stringify(remaining, null, 2));

db.close();
