const D = require("better-sqlite3");
const db = new D("residentialist.db");
const r = db.prepare("UPDATE run_history SET status = 'CLEARED', notes = 'Cleared: All 4 disagreements were false alarms. Bot 2 correctly applied certification floors for 3B and 3C, professional consensus for 3A, and 2A frame longevity 8.5 is justified — Andersen publishes 30-year expected lifespan. Bot 1 missed the source.' WHERE id = 185").run();
console.log("Updated:", r.changes, "rows");
const remaining = db.prepare("SELECT p.product_name FROM run_history rh JOIN products p ON rh.product_id=p.id WHERE rh.status='ESCALATED'").all();
console.log("Remaining escalations:", remaining.length === 0 ? "none" : remaining.map(e => e.product_name).join(", "));
db.close();
