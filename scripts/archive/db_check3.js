const db = require("better-sqlite3")("residentialist.db");
const total = db.prepare("SELECT COUNT(*) as c FROM products WHERE category = ?").get("windows").c;
const scored = db.prepare("SELECT COUNT(*) as c FROM products WHERE category = ? AND overall_score IS NOT NULL").get("windows").c;
console.log("Total windows:", total, "Scored:", scored);
const runs = db.prepare("SELECT product_name, status, started_at FROM run_history ORDER BY started_at DESC LIMIT 20").all();
runs.forEach(r => console.log(r.status, r.product_name, r.started_at));
const escalated = runs.filter(r => r.status === "ESCALATED");
if (escalated.length > 0) { console.log("\nESCALATIONS:"); escalated.forEach(r => console.log(r.product_name, r.started_at)); }
db.close();