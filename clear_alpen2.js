const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.join('/Users/Residentialist/.openclaw/workspace/residentialist', 'residentialist.db');
const db = new Database(dbPath);

// Delete by name
const result = db.prepare("DELETE FROM escalations WHERE name LIKE '%Alpen%'").run();
console.log('Deleted Alpen escalations:', result.changes);

// Verify empty
const remaining = db.prepare("SELECT name, status FROM escalations").all();
console.log('Remaining escalations:', JSON.stringify(remaining));

db.close();
