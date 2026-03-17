/**
 * Calculate Price Integrity for all products in a category.
 * Compares each product's score against peers at similar price points.
 * 
 * Usage: node scripts/calculate_price_integrity.js [--dry-run] [--category windows]
 * 
 * Cost: $0 — pure math, no LLM calls.
 */
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '..', 'residentialist.db');
const CONFIG_PATH = path.join(__dirname, '..', 'price_reference.json');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const categoryArg = args.find((a, i) => args[i - 1] === '--category') || null;

// Load config
const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
const piConfig = config.price_integrity;

const db = new Database(DB_PATH);

// Get products with both scores and prices
let query = `SELECT id, product_name, category, overall_score, price_amount, price_unit, price_reference_spec
             FROM products 
             WHERE overall_score IS NOT NULL AND price_amount IS NOT NULL AND price_amount > 0`;
if (categoryArg) query += ` AND category = '${categoryArg}'`;
query += ` ORDER BY category, price_amount`;

const products = db.prepare(query).all();

if (products.length === 0) {
  console.log('[PRICE-INTEGRITY] No products with both scores and prices found.');
  console.log('  Run price_scraper.js first, or seed prices manually.');
  db.close();
  process.exit(0);
}

console.log(`[PRICE-INTEGRITY] Calculating for ${products.length} products${categoryArg ? ` in category: ${categoryArg}` : ''}...`);

// Group by category
const byCategory = {};
for (const p of products) {
  if (!byCategory[p.category]) byCategory[p.category] = [];
  byCategory[p.category].push(p);
}

const update = db.prepare('UPDATE products SET price_integrity = ? WHERE id = ?');
let updated = 0;

for (const [category, catProducts] of Object.entries(byCategory)) {
  console.log(`\n  Category: ${category} (${catProducts.length} products)`);
  
  for (const product of catProducts) {
    // Find peers: products within ±X% of this product's price
    const priceLow = product.price_amount * (1 - piConfig.peer_price_range_pct / 100);
    const priceHigh = product.price_amount * (1 + piConfig.peer_price_range_pct / 100);
    
    const peers = catProducts.filter(p => 
      p.id !== product.id && 
      p.price_amount >= priceLow && 
      p.price_amount <= priceHigh
    );
    
    let integrity;
    let reason;
    
    if (peers.length === 0) {
      // No peers — compare against category average score
      const avgScore = catProducts.reduce((sum, p) => sum + p.overall_score, 0) / catProducts.length;
      const diff = product.overall_score - avgScore;
      
      if (diff >= piConfig.exceeds_threshold) {
        integrity = 'exceeds';
        reason = `Score ${product.overall_score} is ${diff.toFixed(0)}pts above category avg ${avgScore.toFixed(0)} (no price peers)`;
      } else if (diff <= piConfig.below_threshold) {
        integrity = 'below';
        reason = `Score ${product.overall_score} is ${Math.abs(diff).toFixed(0)}pts below category avg ${avgScore.toFixed(0)} (no price peers)`;
      } else {
        integrity = 'meets';
        reason = `Score ${product.overall_score} is within range of category avg ${avgScore.toFixed(0)} (no price peers)`;
      }
    } else {
      // Compare against peer average
      const peerAvg = peers.reduce((sum, p) => sum + p.overall_score, 0) / peers.length;
      const diff = product.overall_score - peerAvg;
      
      if (diff >= piConfig.exceeds_threshold) {
        integrity = 'exceeds';
        reason = `Score ${product.overall_score} is ${diff.toFixed(0)}pts above ${peers.length} peer avg ${peerAvg.toFixed(0)} ($${priceLow.toFixed(0)}-$${priceHigh.toFixed(0)} range)`;
      } else if (diff <= piConfig.below_threshold) {
        integrity = 'below';
        reason = `Score ${product.overall_score} is ${Math.abs(diff).toFixed(0)}pts below ${peers.length} peer avg ${peerAvg.toFixed(0)} ($${priceLow.toFixed(0)}-$${priceHigh.toFixed(0)} range)`;
      } else {
        integrity = 'meets';
        reason = `Score ${product.overall_score} within range of ${peers.length} peer avg ${peerAvg.toFixed(0)} ($${priceLow.toFixed(0)}-$${priceHigh.toFixed(0)} range)`;
      }
    }
    
    const label = piConfig.labels[integrity].label;
    console.log(`    ${product.product_name}: $${product.price_amount} → ${label}`);
    console.log(`      ${reason}`);
    
    if (!dryRun) {
      update.run(integrity, product.id);
      updated++;
    }
  }
}

if (dryRun) {
  console.log('\n[PRICE-INTEGRITY] Dry run — no changes written.');
} else {
  console.log(`\n[PRICE-INTEGRITY] Updated ${updated} products.`);
}

db.close();
