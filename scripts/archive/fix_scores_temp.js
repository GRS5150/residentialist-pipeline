const Database = require('better-sqlite3');
const db = new Database('/Users/Residentialist/.openclaw/workspace/residentialist/residentialist.db');

// Delete bad entries
db.prepare('DELETE FROM scores WHERE name = ?').run('Pella 250 Series');
db.prepare('DELETE FROM scores WHERE name = ?').run('Loewen');
console.log('Deleted bad Pella and old Loewen entries');

// Check remaining
const remaining = db.prepare('SELECT name, overall, grade, quality, durability, performance FROM scores').all();
console.log('Remaining scores:', remaining.length);
remaining.forEach(r => console.log(` ${r.name}: ${r.overall} ${r.grade} Q=${r.quality} D=${r.durability} P=${r.performance}`));

db.close();
