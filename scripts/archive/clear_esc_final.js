const D = require("better-sqlite3");
const db = new D("residentialist.db");

// Find escalated Alpen runs
const rows = db.prepare("SELECT rh.id, p.product_name, rh.status, rh.started_at FROM run_history rh JOIN products p ON rh.product_id = p.id WHERE rh.status = 'ESCALATED' AND p.product_name LIKE '%Alpen%'").all();
console.log("Found:", JSON.stringify(rows));

// Update status to CLEARED (not delete - preserve history)
if (rows.length > 0) {
  const r = db.prepare("UPDATE run_history SET status = 'CLEARED', notes = 'Cleared: material ceiling violation now handled by v3.1 blanket exclusion' WHERE id IN (" + rows.map(r => r.id).join(",") + ")").run();
  console.log("Updated:", r.changes, "rows");
}

// Verify
const remaining = db.prepare("SELECT rh.id, p.product_name, rh.status FROM run_history rh JOIN products p ON rh.product_id = p.id WHERE rh.status = 'ESCALATED'").all();
console.log("Remaining escalations:", JSON.stringify(remaining));

db.close();
