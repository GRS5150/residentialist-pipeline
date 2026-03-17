const D = require("better-sqlite3");
const db = new D("residentialist.db");

// Check scores table structure
const cols = db.prepare("PRAGMA table_info(scores)").all();
console.log("Scores columns:", cols.map(c => c.name).join(", "));

// Check all products by category
const products = db.prepare("SELECT product_name, category, overall_score, material_class FROM products ORDER BY category, product_name").all();
console.log("\nAll products by category:");
let lastCat = "";
products.forEach(p => {
  if (p.category !== lastCat) { console.log("\n--- " + (p.category || "uncategorized") + " ---"); lastCat = p.category; }
  console.log("  " + p.product_name + " | score: " + (p.overall_score || "none") + " | material: " + (p.material_class || "none"));
});

db.close();
