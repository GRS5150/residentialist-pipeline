const db = require("./db");
const sqlDb = db.getDb();

// Delete scores for products we need to re-run with Phase 7b pool fixes
const products = [
  "Milgard Tuscany",
  "Andersen 100 Series",
  "Andersen 400 Series",
  "JELD-WEN V2500",
  "Sierra Pacific"
];

products.forEach(name => {
  const rows = sqlDb.prepare("SELECT s.id FROM scores s JOIN products p ON s.product_id = p.id WHERE p.product_name = ?").all(name);
  if (rows.length === 0) {
    console.log("No score found for " + name + " — skipping");
  } else {
    rows.forEach(r => {
      sqlDb.prepare("DELETE FROM scores WHERE id = ?").run(r.id);
      console.log("Deleted score for " + name + " (id=" + r.id + ")");
    });
  }
});

// Verify
const remaining = sqlDb.prepare("SELECT p.product_name as name, s.overall, s.grade FROM scores s JOIN products p ON s.product_id = p.id ORDER BY s.overall DESC").all();
console.log("\nRemaining scores:");
remaining.forEach(s => console.log("  " + s.name + ": " + s.overall + " " + s.grade));
console.log("\nTotal remaining: " + remaining.length);
