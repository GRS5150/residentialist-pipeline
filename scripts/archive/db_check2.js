const fs = require("fs");
for (const f of ["scores.db", "products.db", "residentialist.db"]) {
  try {
    const db = require("better-sqlite3")(f);
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type = ?").all("table");
    console.log(f + ":", tables.map(t => t.name).join(", "));
    db.close();
  } catch(e) { console.log(f + ": error", e.message); }
}