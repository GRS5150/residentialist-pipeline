const db = require('./db');
const sqlDb = db.getDb();
const rows = sqlDb.prepare('SELECT s.id FROM scores s JOIN products p ON s.product_id = p.id WHERE p.product_name = ?').all('Pella Impervia');
rows.forEach(r => {
  sqlDb.prepare('DELETE FROM scores WHERE id = ?').run(r.id);
  console.log('Deleted score id:', r.id);
});
console.log('Cleared', rows.length, 'scores for Pella Impervia');
