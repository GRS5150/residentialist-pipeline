
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'residentialist.db');
const conn = new Database(dbPath);

// Count before
const before = conn.prepare("SELECT COUNT(*) as c FROM run_history WHERE status = 'ESCALATED'").get();
console.log('Escalated records before cleanup:', before.c);

// Delete all ESCALATED run_history records
const result = conn.prepare("DELETE FROM run_history WHERE status = 'ESCALATED'").run();
console.log('Deleted:', result.changes, 'records');

// Count after
const after = conn.prepare("SELECT COUNT(*) as c FROM run_history WHERE status = 'ESCALATED'").get();
console.log('Escalated records after cleanup:', after.c);

// Also clean up the orphaned vinyl-dh Window World product if it still exists
const wwDup = conn.prepare("SELECT id, product_name, config, category FROM products WHERE config = 'VINYL-DH'").all();
for (const row of wwDup) {
    console.log('Removing duplicate product:', row.product_name, row.config);
    conn.prepare("DELETE FROM scores WHERE product_id = ?").run(row.id);
    conn.prepare("DELETE FROM runs WHERE product_id = ?").run(row.id);
    conn.prepare("DELETE FROM run_history WHERE product_id = ?").run(row.id);
    conn.prepare("DELETE FROM products WHERE id = ?").run(row.id);
}

// Summary
const stats = conn.prepare("SELECT COUNT(*) as products FROM products").get();
const scores = conn.prepare("SELECT COUNT(*) as scores FROM scores").get();
const runs = conn.prepare("SELECT COUNT(*) as runs FROM run_history").get();
console.log('\nDB after cleanup:');
console.log('  Products:', stats.products);
console.log('  Scores:', scores.scores);
console.log('  Runs:', runs.runs);
console.log('  Escalations:', after.c);

conn.close();
console.log('\nCleanup complete.');
