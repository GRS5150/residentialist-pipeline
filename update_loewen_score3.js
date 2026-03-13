const Database = require("better-sqlite3");
const db = new Database("/Users/Residentialist/.openclaw/workspace/residentialist/residentialist.db");

const Q = 8.0;
const D = 7.88;
const P = 8.8;
const O = Math.round((Q * 0.35 + D * 0.35 + P * 0.30) * 100) / 100;
const grade = O >= 8.0 ? "B+" : "B";
const ts = new Date().toISOString().replace("T", " ").slice(0, 19);
console.log("Score:", O, grade, "Q:", Q, "D:", D, "P:", P, "ts:", ts);

const product = db.prepare("SELECT id FROM products WHERE product_name = ?").get("Loewen");
if (!product) { console.log("Not found"); process.exit(1); }

const stmt = db.prepare("UPDATE scores SET quality = ?, durability = ?, performance = ?, overall = ?, grade = ?, outlook = ?, run_dir = ?, scored_at = ? WHERE product_id = ?");
stmt.run(Q, D, P, O, grade, "Strong", "loewen_2026-03-13T05-56-40", ts, product.id);
console.log("Done. Updated product_id:", product.id);
db.close();
