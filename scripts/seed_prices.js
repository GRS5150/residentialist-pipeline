/**
 * Seed initial price data for window products.
 * Prices are approximate retail for 36x60 DH, product only (not installed).
 * Sources: manufacturer sites, authorized dealer pricing, industry publications.
 */
const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'residentialist.db');
const db = new Database(DB_PATH);

const now = new Date().toISOString();
const unit = 'per unit';
const refSpec = '36x60 DH';

// Approximate retail prices for 36x60 double-hung windows (product only)
// These represent mid-range pricing from manufacturer/dealer sources
const prices = {
  'Alpen Zenith ZR-7': { amount: 1450, note: 'High-performance fiberglass, triple-pane standard', sources: ['alpenhpp.com'] },
  'Marvin Integrity': { amount: 520, note: 'Ultrex fiberglass exterior', sources: ['marvin.com'] },
  'Andersen 400 Series': { amount: 385, note: 'Wood core, vinyl exterior', sources: ['andersenwindows.com'] },
  'Milgard Tuscany': { amount: 340, note: 'Vinyl, dual-pane', sources: ['milgard.com'] },
  'Pella 250 Series': { amount: 350, note: 'Vinyl, dual-pane', sources: ['pella.com'] },
  'Pella 350 Series': { amount: 280, note: 'Vinyl, dual-pane economy', sources: ['pella.com'] },
  'Reliabilt 3500': { amount: 210, note: 'Vinyl, builder grade', sources: ['lowes.com'] },
  'Window World 4000': { amount: 250, note: 'Vinyl, dual-pane', sources: ['windowworld.com'] },
  'Andersen 100 Series': { amount: 310, note: 'Fibrex composite', sources: ['andersenwindows.com'] },
  'Andersen A-Series': { amount: 680, note: 'Wood interior, Fibrex exterior', sources: ['andersenwindows.com'] },
  'Sierra Pacific': { amount: 610, note: 'Wood, aluminum-clad', sources: ['sierrapacificwindows.com'] },
  'Simonton Reflections 5500': { amount: 325, note: 'Vinyl, dual-pane', sources: ['simonton.com'] },
  'Pella Impervia': { amount: 550, note: 'Fiberglass, dual-pane', sources: ['pella.com'] },
  'Loewen': { amount: 1200, note: 'Douglas Fir, aluminum-clad premium', sources: ['lfrp.com'] },
  'Ply Gem Pro Series': { amount: 290, note: 'Vinyl, dual-pane', sources: ['plygem.com'] },
  'Andersen E-Series': { amount: 950, note: 'Custom wood, aluminum-clad architectural', sources: ['andersenwindows.com'] },
  'Marvin Signature Ultimate': { amount: 880, note: 'Wood, aluminum-clad premium', sources: ['marvin.com'] },
  'Marvin Signature Ultimate DH': { amount: 880, note: 'Wood, aluminum-clad premium', sources: ['marvin.com'] },
  'JELD-WEN V2500': { amount: 230, note: 'Vinyl, builder grade', sources: ['jeld-wen.com'] },
};

const update = db.prepare(`
  UPDATE products 
  SET price_amount = ?, price_unit = ?, price_reference_spec = ?, 
      price_note = ?, price_sources = ?, price_updated = ?
  WHERE product_name = ?
`);

let updated = 0;
for (const [name, data] of Object.entries(prices)) {
  const result = update.run(
    data.amount, unit, refSpec,
    data.note, JSON.stringify(data.sources), now,
    name
  );
  if (result.changes > 0) {
    console.log(`  ✓ ${name}: $${data.amount}`);
    updated++;
  } else {
    console.log(`  ✗ ${name}: not found in DB`);
  }
}

console.log(`\n[SEED] Updated ${updated} products with price data.`);
db.close();
