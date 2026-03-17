const db = require("./db");
const sqlDb = db.getDb();
// Delete entries with 0 or null overall
const bad = sqlDb.prepare("SELECT id, product_id, overall FROM scores WHERE overall = 0 OR overall IS NULL").all();
bad.forEach(s => {
  console.log("Deleting score id=" + s.id + " overall=" + s.overall);
  sqlDb.prepare("DELETE FROM scores WHERE id = ?").run(s.id);
});
console.log("Deleted " + bad.length + " bad entries");

// Also check the Pella 250 duplicate - keep only the one from the latest batch run
const pella = sqlDb.prepare("SELECT s.id, s.overall, s.run_dir FROM scores s JOIN products p ON s.product_id = p.id WHERE p.product_name LIKE '%Pella 250%' ORDER BY s.scored_at DESC").all();
console.log("\nPella 250 entries:", pella.length);
pella.forEach(s => console.log("  id=" + s.id + " O=" + s.overall + " run=" + s.run_dir));

// Show final state
const final = sqlDb.prepare("SELECT p.product_name as name, p.config, s.overall, s.grade, s.quality, s.durability, s.performance FROM scores s JOIN products p ON s.product_id = p.id ORDER BY s.overall DESC").all();
console.log("\n=== FINAL DB ===");
final.forEach(s => console.log("  " + s.name + ": " + s.overall + " " + s.grade + " | Q=" + s.quality + " D=" + s.durability + " P=" + s.performance));
