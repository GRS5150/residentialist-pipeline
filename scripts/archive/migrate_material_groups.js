#!/usr/bin/env node
/**
 * One-time migration: Seed material_class and material_group for existing products.
 * Run on Mac Mini after deploying updated db.js.
 *
 * Usage: node migrate_material_groups.js
 */

const db = require('./db');

const PRODUCT_MATERIALS = {
  'Alpen Zenith ZR-7':           'Pultruded Fiberglass',
  'Andersen E-Series':           'Aluminum-Clad Wood',
  'Andersen E-Series DH':        'Aluminum-Clad Wood',
  'Andersen A-Series':           'Aluminum-Clad Wood',
  'Andersen 400 Series':         'Composite',     // Fibrex composite
  'Andersen 100 Series':         'Composite',     // Fibrex composite
  'Loewen':                      'Aluminum-Clad Wood',
  'Marvin Signature Ultimate':   'Aluminum-Clad Wood',
  'Marvin Signature Ultimate DH':'Aluminum-Clad Wood',
  'Marvin Integrity':            'Fiberglass',    // Ultrex fiberglass
  'Pella Impervia':              'Fiberglass',    // Duracast fiberglass
  'Pella 250 Series':            'Vinyl',
  'Pella 350 Series':            'Vinyl',         // Vinyl PVC (NOT aluminum-clad wood — REJECT ruling)
  'Reliabilt 3500':              'Vinyl',
  'Ply Gem Pro Series':          'Vinyl',
  'Simonton Reflections 5500':   'Vinyl',
  'Window World 4000':           'Vinyl',
  'Jeld-Wen V-2500':             'Vinyl',
  'Milgard Tuscany':             'Vinyl',
  'Sierra Pacific':              'Aluminum-Clad Wood',
  'Bertazzoni Heritage':         null,            // Not a window — skip
};

console.log('=== Material Group Migration ===\n');

for (const [product, materialClass] of Object.entries(PRODUCT_MATERIALS)) {
  if (!materialClass) {
    console.log(`SKIP: ${product} (not a window product)`);
    continue;
  }
  const result = db.setMaterialInfo(product, materialClass);
  console.log(`${product}: ${materialClass} → ${result.materialGroup}`);
}

// Pella 350 REJECT ruling — Ray confirmed: vinyl PVC, not aluminum-clad wood.
// Product was misleadingly marketed. Should not appear in active rankings.
console.log('\n--- Pella 350 REJECT ruling ---');
db.rejectProduct('Pella 350 Series', 'REJECTED: Vinyl PVC construction, not aluminum-clad wood as marketed. Ray ruling March 14, 2026.');
console.log('Pella 350 Series: REJECTED');

console.log('\n=== Migration complete ===');

// Verify
const grouped = db.getScoresByGroup();
console.log(`\nClad products with scores: ${grouped.clad.length}`);
grouped.clad.forEach(p => console.log(`  ${p.name}: ${p.overall} ${p.grade} [${p.material_class}]`));
console.log(`\nNon-clad products with scores: ${grouped.non_clad.length}`);
grouped.non_clad.forEach(p => console.log(`  ${p.name}: ${p.overall} ${p.grade} [${p.material_class}]`));
if (grouped.unclassified.length) {
  console.log(`\nUnclassified products with scores: ${grouped.unclassified.length}`);
  grouped.unclassified.forEach(p => console.log(`  ${p.name}: ${p.overall} ${p.grade}`));
}

db.close();
