const db = require("better-sqlite3")("residentialist.db");
const all = db.prepare("SELECT id, product_name, overall_score, quality_score, durability_score, performance_score, material_safety_score, category, config, material_class, material_group, status FROM products ORDER BY overall_score DESC NULLS LAST").all();
console.log(JSON.stringify(all));