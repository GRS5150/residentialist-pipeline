const db = require("./db");
const sqlDb = db.getDb();
const rows = sqlDb.prepare("SELECT s.id FROM scores s JOIN products p ON s.product_id = p.id WHERE p.product_name = ?").all("Andersen E-Series");
rows.forEach(r => {
  sqlDb.prepare("DELETE FROM scores WHERE id = ?").run(r.id);
  console.log("Deleted score id=" + r.id);
});
console.log("Andersen E-Series cleared for re-run");
process.exit(0);
