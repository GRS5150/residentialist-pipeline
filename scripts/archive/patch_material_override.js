/**
 * Patch: Add product-specific material class overrides to bot_orchestrator_v3.js
 *
 * For multi-material manufacturers like Sierra Pacific, Bot 1's material class
 * extraction returns "Multiple offerings available" which breaks Bot 2's scoring.
 * This adds a hardcoded override table for known products.
 *
 * Run: node patch_material_override.js
 */

const fs = require('fs');
const path = require('path');

const ORCH_PATH = path.join(__dirname, 'bot_orchestrator_v3.js');

let code = fs.readFileSync(ORCH_PATH, 'utf-8');

// Insert the override table + check before the extractMaterialClass call
const oldBlock = `  // ── MATERIAL CLASS LOCK ───────────────────────────────────────────────────
  const materialLock = extractMaterialClass(bot1Output);`;

const newBlock = `  // ── MATERIAL CLASS LOCK ───────────────────────────────────────────────────
  // Product-specific overrides for multi-material manufacturers
  // (Bot 1 finds multiple lines and returns "Multiple offerings available")
  const MATERIAL_CLASS_OVERRIDES = {
    'sierra pacific': { rawText: 'Aluminum-Clad Wood', source: 'correction_memo_override', note: 'H3/CSM line — flagship aluminum-clad product' },
  };
  const overrideKey = productName.toLowerCase().trim();
  let materialLock;
  if (MATERIAL_CLASS_OVERRIDES[overrideKey]) {
    const override = MATERIAL_CLASS_OVERRIDES[overrideKey];
    materialLock = { found: true, rawText: override.rawText, source: override.source };
    console.log(\`[ORCHESTRATOR] Material class OVERRIDE: \${override.rawText} (\${override.note})\`);
  } else {
    materialLock = extractMaterialClass(bot1Output);
  }`;

code = code.replace(oldBlock, newBlock);

fs.writeFileSync(ORCH_PATH, code);
console.log(`[PATCH] bot_orchestrator_v3.js patched (${code.length} bytes)`);

// Verify
if (code.includes('MATERIAL_CLASS_OVERRIDES') && code.includes('correction_memo_override')) {
  console.log('  ✓ Material class override table added');
} else {
  console.error('  ✗ Patch may not have applied');
  process.exit(1);
}
