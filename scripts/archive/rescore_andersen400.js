/**
 * Rescore Andersen 400 Series with corrected material class (Vinyl-Clad Wood).
 * Uses existing Bot 2 output but applies new material tier system.
 * Writes updated scores to DB and outputs new DETERMINISTIC_SCORES.json.
 */

const fs = require('fs');
const path = require('path');

const WORKSPACE = '/Users/Residentialist/.openclaw/workspace/residentialist';
const RUN_DIR = path.join(WORKSPACE, 'outputs/andersen_400_series_2026-03-14T21-58-42');

// Load the deterministic scorer (has updated getMaterialPriorTier)
const { computeDeterministicScores } = require(path.join(WORKSPACE, 'deterministic_scorer.js'));

// Load the bot orchestrator for getMaterialCeiling (has updated MATERIAL_CEILINGS)
// We need to extract the getMaterialCeiling function and MATERIAL_CEILINGS
// Since bot_orchestrator_v3 doesn't export getMaterialCeiling, we replicate it from the file

// Read the MATERIAL_CEILINGS from bot_orchestrator_v3.js
const orchSource = fs.readFileSync(path.join(WORKSPACE, 'bot_orchestrator_v3.js'), 'utf8');

// Extract MATERIAL_CEILINGS object (it's defined as a const)
const ceilingsMatch = orchSource.match(/const MATERIAL_CEILINGS\s*=\s*\{([\s\S]*?)\n\};\s*\n/);
if (!ceilingsMatch) {
  console.error('ERROR: Could not extract MATERIAL_CEILINGS from bot_orchestrator_v3.js');
  process.exit(1);
}

// We'll eval the ceilings - but safer to just hardcode the current tier system
const MATERIAL_CEILINGS = {
  'pultruded fiberglass': { base: 9, ceiling: 10 },
  'ultrex':               { base: 9, ceiling: 10 },
  'fiberglass':           { base: 9, ceiling: 10 },
  
  'aluminum-clad wood':             { base: 8, ceiling: 9 },
  'aluminum-clad wood (extruded aluminum)': { base: 8, ceiling: 9 },
  'fiberglass-clad wood':           { base: 8, ceiling: 9.5 },
  
  'roll-form aluminum-clad wood':   { base: 7, ceiling: 8 },
  'aluminum clad (roll-form)':      { base: 7, ceiling: 8 },
  
  'vinyl-clad wood':                { base: 7.5, ceiling: 8.5 },
  'perma-shield':                   { base: 7.5, ceiling: 8.5 },
  
  'composite':            { base: 7, ceiling: 8 },
  'composite/fibrex':     { base: 7, ceiling: 8 },
  'fibrex':               { base: 7, ceiling: 8 },
  
  'vinyl':                { base: 6, ceiling: 7 },
  
  'wood':                 { base: 5, ceiling: 6 },
  'aluminum':             { base: 5, ceiling: 6 },
};

function getMaterialCeiling(materialClass) {
  if (!materialClass) return { base: 5, ceiling: 7 };
  const key = materialClass.toLowerCase().trim();
  // Exact match first
  if (MATERIAL_CEILINGS[key]) return MATERIAL_CEILINGS[key];
  // Partial match
  for (const [k, v] of Object.entries(MATERIAL_CEILINGS)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return { base: 5, ceiling: 7 };
}

// Load Bot 2 parsed output
const bot2Path = path.join(RUN_DIR, 'andersen_400_series_bot2_evaluator.json');
const bot2Parsed = JSON.parse(fs.readFileSync(bot2Path, 'utf8'));

// Create corrected material lock — THIS IS THE KEY FIX
const materialLock = {
  found: true,
  rawText: 'Vinyl-clad wood',
  source: 'bot1_keyword_scan_corrected'
};

console.log('=== RESCORE: Andersen 400 Series ===');
console.log('Old material class: Wood');
console.log('New material class: Vinyl-clad wood');
console.log('Expected base: 7.5, ceiling: 8.5');
console.log('');

// Run deterministic scorer with corrected material class
const detScores = computeDeterministicScores(bot2Parsed, materialLock, getMaterialCeiling);

console.log('=== DETERMINISTIC SCORES ===');
console.log(JSON.stringify(detScores, null, 2));

// Calculate overall scores using Ray's weights: Q35/D35/P30
const qualityScore = (
  (detScores.component_quality.score * 0.35) +
  (detScores.manufacturing_quality.score * 0.35) +
  (detScores.professional_consensus.score * 0.30)
);

const durabilityScore = (
  (detScores.materials_durability.score * 0.60) +
  (detScores.repairability.score * 0.40)
);

// Performance score — get from existing pipeline output
const pipelineStatus = JSON.parse(fs.readFileSync(path.join(RUN_DIR, 'PIPELINE_STATUS.json'), 'utf8'));
const prevPerformance = 6.5; // from current DB

// Overall: Q35/D35/P30
const overallScore = (qualityScore * 0.35) + (durabilityScore * 0.35) + (prevPerformance * 0.30);

// Grade mapping
function getGrade(score) {
  if (score >= 9.0) return 'A+';
  if (score >= 8.5) return 'A';
  if (score >= 8.0) return 'A-';
  if (score >= 7.5) return 'B+';
  if (score >= 7.0) return 'B';
  if (score >= 6.5) return 'B-';
  if (score >= 6.0) return 'C+';
  if (score >= 5.5) return 'C';
  if (score >= 5.0) return 'C-';
  return 'D';
}

console.log('\n=== AXIS SCORES ===');
console.log('Quality axis:     ' + qualityScore.toFixed(2));
console.log('  Component:      ' + detScores.component_quality.score);
console.log('  Manufacturing:  ' + detScores.manufacturing_quality.score);
console.log('  Prof Consensus: ' + detScores.professional_consensus.score);
console.log('Durability axis:  ' + durabilityScore.toFixed(2));
console.log('  Materials:      ' + detScores.materials_durability.score);
console.log('  Repairability:  ' + detScores.repairability.score);
console.log('Performance axis: ' + prevPerformance);
console.log('');
console.log('=== OVERALL ===');
console.log('Score: ' + overallScore.toFixed(1));
console.log('Grade: ' + getGrade(overallScore));
console.log('');
console.log('=== MATERIAL DURABILITY DETAIL ===');
console.log('Material class:   ' + detScores.materials_durability.material_class);
console.log('Base:             ' + detScores.materials_durability.base);
console.log('Ceiling:          ' + detScores.materials_durability.ceiling);
console.log('Final:            ' + detScores.materials_durability.score);

// Save updated DETERMINISTIC_SCORES.json
const outPath = path.join(RUN_DIR, 'DETERMINISTIC_SCORES_RESCORED.json');
fs.writeFileSync(outPath, JSON.stringify(detScores, null, 2));
console.log('\nSaved: ' + outPath);

// Update MATERIAL_CLASS_LOCK.json
const lockPath = path.join(RUN_DIR, 'MATERIAL_CLASS_LOCK_RESCORED.json');
fs.writeFileSync(lockPath, JSON.stringify({
  product: 'Andersen 400 Series',
  config: 'DH',
  materialClass: 'Vinyl-clad wood',
  found: true,
  source: 'bot1_keyword_scan_corrected',
  timestamp: new Date().toISOString(),
  note: 'Rescored March 14, 2026 — material class corrected from Wood to Vinyl-clad wood'
}, null, 2));
console.log('Saved: ' + lockPath);

// Update the database
const db = require(path.join(WORKSPACE, 'db'));
const sqlDb = db.getDb();

// Update products table
sqlDb.prepare("UPDATE products SET material_class = ?, material_group = ?, overall_score = ?, quality_score = ?, durability_score = ?, performance_score = ? WHERE product_name = ?")
  .run('Vinyl-clad wood', 'wood_clad', Math.round(overallScore * 10) / 10, Math.round(qualityScore * 100) / 100, Math.round(durabilityScore * 100) / 100, prevPerformance, 'Andersen 400 Series');

// Update scores table
sqlDb.prepare("UPDATE scores SET overall = ?, grade = ?, quality = ?, durability = ?, performance = ?, notes = ? WHERE id = 85")
  .run(Math.round(overallScore * 10) / 10, getGrade(overallScore), Math.round(qualityScore * 100) / 100, Math.round(durabilityScore * 100) / 100, prevPerformance, 'Rescored March 14 2026 — material class corrected from Wood to Vinyl-clad wood, new tier system applied');

console.log('\nDatabase updated.');
console.log('Done!');
