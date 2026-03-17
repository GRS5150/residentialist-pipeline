const D = require("better-sqlite3");
const db = new D("residentialist.db");
const rows = db.prepare("SELECT p.product_name, rh.status, rh.started_at FROM run_history rh JOIN products p ON rh.product_id=p.id WHERE rh.started_at > '2026-03-16 15:00:00' ORDER BY rh.started_at DESC").all();
console.log("Recent runs (since 3pm UTC today):");
rows.forEach(r => console.log(r.product_name + " | " + r.status + " | " + r.started_at));
console.log("\nTotal:", rows.length, "runs");

// Check if batch_rescore process is running
const { execSync } = require("child_process");
try {
  const ps = execSync("ps aux | grep batch_rescore | grep -v grep").toString();
  console.log("\nbatch_rescore process:", ps || "NOT RUNNING");
} catch(e) {
  console.log("\nbatch_rescore process: NOT RUNNING");
}
db.close();
