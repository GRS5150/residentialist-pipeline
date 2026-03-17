const D = require("better-sqlite3");
const db = new D("residentialist.db");

// Get the Andersen A-Series escalation
const esc = db.prepare(`
  SELECT rh.id, rh.status, rh.notes, rh.started_at, rh.run_dir, p.product_name, p.material_class
  FROM run_history rh
  JOIN products p ON rh.product_id = p.id
  WHERE rh.status = 'ESCALATED'
`).all();

console.log("ESCALATED entries:");
esc.forEach(e => {
  console.log("  Product:", e.product_name);
  console.log("  Material:", e.material_class);
  console.log("  Run dir:", e.run_dir);
  console.log("  Started:", e.started_at);
  console.log("  Notes:", (e.notes || "").slice(0, 500));
  console.log("");
});

// Check batch progress - how many products have run since batch start
const recentRuns = db.prepare(`
  SELECT p.product_name, rh.status, rh.started_at
  FROM run_history rh
  JOIN products p ON rh.product_id = p.id
  WHERE rh.started_at > '2026-03-16 17:00:00'
  ORDER BY rh.started_at ASC
`).all();

console.log("All batch runs so far:");
recentRuns.forEach(r => console.log("  " + r.started_at + " | " + r.product_name.padEnd(30) + " | " + r.status));

// Check if batch process still running
const { execSync } = require("child_process");
try {
  const ps = execSync("ps aux | grep batch_rescore | grep -v grep").toString().trim();
  console.log("\nBatch process:", ps ? "RUNNING" : "NOT RUNNING");
} catch(e) {
  console.log("\nBatch process: NOT RUNNING");
}

db.close();
