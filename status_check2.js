const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const dbPath = path.join('/Users/Residentialist/.openclaw/workspace/residentialist', 'residentialist.db');
const db = new Database(dbPath);

let output = '';

// Check escalations
const escalations = db.prepare("SELECT id, product, type, created_at FROM escalations").all();
output += '=== ESCALATIONS ===\n' + JSON.stringify(escalations, null, 2) + '\n';

// Check batch log
try {
  const log = fs.readFileSync('/tmp/batch_rescore.log', 'utf8');
  const lines = log.trim().split('\n');
  output += '\n=== BATCH LOG (last 40 lines) ===\n' + lines.slice(-40).join('\n') + '\n';
} catch(e) {
  output += '\nNo batch log at /tmp/batch_rescore.log\n';
}

// Check scores
try {
  const scores = db.prepare("SELECT product, overall_score, letter_grade, outlook, updated_at FROM scores ORDER BY updated_at DESC LIMIT 5").all();
  output += '\n=== RECENT SCORES ===\n' + JSON.stringify(scores, null, 2) + '\n';
} catch(e) {
  output += '\nError reading scores: ' + e.message + '\n';
}

db.close();

// Write to a file we can read back
fs.writeFileSync('/Users/Residentialist/.openclaw/workspace/residentialist/status_output.txt', output);
console.log(output);
