const D = require("better-sqlite3");
const db = new D("residentialist.db");
const { execSync } = require("child_process");

// Batch running?
let running = false;
try { running = execSync("ps aux | grep batch_rescore | grep -v grep").toString().trim().length > 0; } catch(e) {}
console.log("BATCH RUNNING:", running);

// All batch runs
const runs = db.prepare(`
  SELECT p.product_name, rh.status, rh.started_at
  FROM run_history rh JOIN products p ON rh.product_id = p.id
  WHERE rh.started_at > '2026-03-16 17:00:00'
  ORDER BY rh.started_at ASC
`).all();
console.log("\nBATCH RUNS (" + runs.length + "):");
runs.forEach(r => console.log("  " + r.started_at.slice(11,19) + " " + r.product_name.padEnd(28) + " " + r.status));

// Current product scores
console.log("\nCURRENT SCORES:");
const scores = db.prepare(`
  SELECT product_name, overall_score, quality_score, durability_score, performance_score
  FROM products WHERE (category = 'windows' OR category = 'vinyl-windows') AND overall_score IS NOT NULL
  ORDER BY overall_score DESC
`).all();
scores.forEach(s => console.log("  " + s.product_name.padEnd(28) + " " + (s.overall_score||0).toFixed(2) + "  Q:" + (s.quality_score||0).toFixed(2) + " D:" + (s.durability_score||0).toFixed(2) + " P:" + (s.performance_score||0).toFixed(2)));

// Escalations
const esc = db.prepare("SELECT p.product_name FROM run_history rh JOIN products p ON rh.product_id=p.id WHERE rh.status='ESCALATED'").all();
console.log("\nESCALATIONS:", esc.map(e => e.product_name).join(", ") || "none");

db.close();
