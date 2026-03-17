const Database = require('better-sqlite3');
const db = new Database('/Users/Residentialist/.openclaw/workspace/residentialist/residentialist.db');
const r = db.prepare("DELETE FROM escalations WHERE name LIKE '%Alpen%'").run();
console.log('Deleted:', r.changes);
const left = db.prepare("SELECT name FROM escalations").all();
console.log('Remaining:', JSON.stringify(left));
db.close();
