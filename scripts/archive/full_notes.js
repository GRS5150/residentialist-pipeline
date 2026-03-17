const D = require("better-sqlite3");
const db = new D("residentialist.db");
const esc = db.prepare("SELECT notes FROM run_history WHERE id = 185").get();
console.log(esc.notes);
db.close();
