const db = require("better-sqlite3")("residentialist.db");
for (const t of ["products", "run_history", "scores"]) {
  try {
    const info = db.prepare("PRAGMA table_info(" + t + ")").all();
    console.log(t + ":", info.map(c => c.name).join(", "));
  } catch(e) { console.log(t + " error:", e.message); }
}
const recent = db.prepare("SELECT * FROM run_history ORDER BY rowid DESC LIMIT 3").all();
console.log("\nRecent runs:"); recent.forEach(r => console.log(JSON.stringify(r)));
db.close();