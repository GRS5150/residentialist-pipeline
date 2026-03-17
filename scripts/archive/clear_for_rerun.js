const db = require("./db");
const sqlDb = db.getDb();

// Delete scores for Loewen and Andersen E-Series so they can be re-run
const products = ["Loewen", "Andersen E-Series"];
products.forEach(name => {
  const rows = sqlDb.prepare("SELECT s.id FROM scores s JOIN products p ON s.product_id = p.id WHERE p.product_name = ?").all(name);
  rows.forEach(r => {
    sqlDb.prepare("DELETE FROM scores WHERE id = ?").run(r.id);
    console.log("Deleted score for " + name + " (id=" + r.id + ")");
  });
});

// Verify
const remaining = sqlDb.prepare("SELECT p.product_name as name, s.overall, s.grade FROM scores s JOIN products p ON s.product_id = p.id ORDER BY s.overall DESC").all();
console.log("\nRemaining scores:");
remaining.forEach(s => console.log("  " + s.name + ": " + s.overall + " " + s.grade));
