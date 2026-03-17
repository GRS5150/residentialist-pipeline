const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const dbPath = path.join('/Users/Residentialist/.openclaw/workspace/residentialist', 'residentialist.db');
const db = new Database(dbPath);

// Check escalations
const escalations = db.prepare("SELECT id, product, type, created_at FROM escalations").all();
console.log('=== ESCALATIONS ===');
console.log(JSON.stringify(escalations, null, 2));

// Check batch log
console.log('\n=== BATCH LOG (last 40 lines) ===');
try {
  const log = fs.readFileSync('/tmp/batch_rescore.log', 'utf8');
  const lines = log.trim().split('\n');
  console.log(lines.slice(-40).join('\n'));
} catch(e) {
  console.log('No batch log found at /tmp/batch_rescore.log');
}

// Check scores table for recently updated entries
console.log('\n=== RECENT SCORES (last 5 updated) ===');
try {
  const scores = db.prepare("SELECT product, overall_score, letter_grade, outlook, updated_at FROM scores ORDER BY updated_at DESC LIMIT 5").all();
  console.log(JSON.stringify(scores, null, 2));
} catch(e) {
  console.log('Error reading scores:', e.message);
}

db.close();
