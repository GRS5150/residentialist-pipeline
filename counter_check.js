const D = require("better-sqlite3");
const db = new D("residentialist.db");

// Check for countertop products
const products = db.prepare("SELECT id, product_name, config, category, overall_score, quality_score, durability_score, performance_score, material_class, status FROM products WHERE category = 'countertops' OR category LIKE '%counter%'").all();
console.log("Countertop products:", JSON.stringify(products, null, 2));

// Also check scores table for countertops
const scores = db.prepare("SELECT * FROM scores WHERE product LIKE '%counter%' OR product LIKE '%quartz%' OR product LIKE '%granite%' OR product LIKE '%marble%' OR product LIKE '%Cambria%' OR product LIKE '%Caesarstone%' OR product LIKE '%Silestone%' OR product LIKE '%Dekton%'").all();
console.log("\nCountertop scores:", JSON.stringify(scores, null, 2));

// Check all categories
const cats = db.prepare("SELECT DISTINCT category FROM products").all();
console.log("\nAll categories:", JSON.stringify(cats));

// Check total product list
const allProducts = db.prepare("SELECT product_name, category, overall_score FROM products ORDER BY category, product_name").all();
console.log("\nAll products:");
allProducts.forEach(p => console.log(p.category + " | " + p.product_name + " | " + (p.overall_score || "no score")));

db.close();
