const D = require("better-sqlite3");
const db = new D("residentialist.db");
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log("TABLES:", JSON.stringify(tables));

// Try each likely table
for (const t of tables) {
  try {
    const count = db.prepare("SELECT COUNT(*) as c FROM " + t.name).get();
    console.log(t.name + ": " + count.c + " rows");
    if (t.name.includes('escal') || t.name.includes('product') || t.name.includes('queue') || t.name.includes('run')) {
      const sample = db.prepare("SELECT * FROM " + t.name + " LIMIT 2").all();
      console.log("  sample:", JSON.stringify(sample).slice(0, 500));
    }
  } catch(e) {
    console.log(t.name + ": error - " + e.message);
  }
}
db.close();
