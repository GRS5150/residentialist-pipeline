const db = require("better-sqlite3")("scores.db");
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type = ?;").all("table");
console.log("Tables:", tables.map(t => t.name).join(", "));
try { const prods = db.prepare("SELECT product_name, overall_score FROM products ORDER BY overall_score DESC").all(); console.log("Products:", prods.length); prods.forEach(p => console.log(p.product_name, p.overall_score)); } catch(e) { console.log("No products table"); }
try { const runs = db.prepare("SELECT product_name, status, started_at FROM runs ORDER BY id DESC LIMIT 10").all(); runs.forEach(r => console.log(r.status, r.product_name, r.started_at)); } catch(e) { console.log("No runs table:", e.message); }