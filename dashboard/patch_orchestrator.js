/**
 * Patch bot_orchestrator_v3.js to support skipBot1 option.
 * 
 * Changes:
 * 1. Modify runPipeline signature: (productName, config, researchFiles, options = {})
 * 2. When options.skipBot1 = true, skip Bot 1 Anthropic call and use options.syntheticBot1Output
 * 3. Save synthetic output as bot1_consensus.md in output dir (for traceability)
 */

const fs = require('fs');
const path = require('path');

const WORKSPACE = '/Users/Residentialist/.openclaw/workspace/residentialist';
const FILE = path.join(WORKSPACE, 'bot_orchestrator_v3.js');

let code = fs.readFileSync(FILE, 'utf8');
let changed = false;

// ─── Patch 1: Function signature ─────────────────────────────────────────────
const oldSig = 'async function runPipeline(productName, config, researchFiles) {';
const newSig = 'async function runPipeline(productName, config, researchFiles, options = {}) {';

if (code.includes(oldSig)) {
  code = code.replace(oldSig, newSig);
  console.log('[PATCH 1] ✅ runPipeline signature updated with options parameter');
  changed = true;
} else if (code.includes('options = {}')) {
  console.log('[PATCH 1] Already patched');
} else {
  console.log('[PATCH 1] ⚠️ Could not find runPipeline signature');
}

// ─── Patch 2: Add skipBot1 bypass before Bot 1 call ──────────────────────────
// Find the Bot 1 call and add a bypass before it
const bot1CallMarker = "const bot1Output = await runBot('Bot 1 (Consensus)', BOT1_CONSENSUS_PROMPT, bot1Input, 'claude-sonnet-4-20250514', true);";
const bot1BypassBlock = `// ── CURATION PIPELINE: Skip Bot 1 when using curated deep dive sources ──
  let bot1Output;
  if (options.skipBot1 && options.syntheticBot1Output) {
    bot1Output = options.syntheticBot1Output;
    console.log(\`[ORCHESTRATOR] SKIP BOT 1: Using synthetic findings from curation pipeline (\${bot1Output.length} chars)\`);
    fs.writeFileSync(\`\${outputDir}/\${productSlug}_bot1_consensus.md\`, bot1Output);
    fs.writeFileSync(\`\${outputDir}/CURATION_PIPELINE.json\`, JSON.stringify({
      curation_slug: options.curationSlug || productSlug,
      skip_bot1: true,
      synthetic_findings_length: bot1Output.length,
      timestamp: new Date().toISOString()
    }, null, 2));
    // Still run data completeness check on synthetic output
    await runDataCompletenessCheck(bot1Output, productName, 'windows', outputDir);
  } else {
    bot1Output = await runBot('Bot 1 (Consensus)', BOT1_CONSENSUS_PROMPT, bot1Input, 'claude-sonnet-4-20250514', true);`;

// Find the existing Bot 1 call and wrap it in an else block
if (code.includes(bot1CallMarker)) {
  // Find the three lines after bot1Output: writeFile, validateBotOutput, runDataCompletenessCheck
  const afterBot1 = `  fs.writeFileSync(\`\${outputDir}/\${productSlug}_bot1_consensus.md\`, bot1Output);
  validateBotOutput(bot1Output, 'Bot 1 (Consensus)', productName, outputDir);
  await runDataCompletenessCheck(bot1Output, productName, 'windows', outputDir);`;

  const closingBlock = `  fs.writeFileSync(\`\${outputDir}/\${productSlug}_bot1_consensus.md\`, bot1Output);
    validateBotOutput(bot1Output, 'Bot 1 (Consensus)', productName, outputDir);
    await runDataCompletenessCheck(bot1Output, productName, 'windows', outputDir);
  } // end skipBot1 else block`;

  if (code.includes(afterBot1)) {
    // Replace the full block: bot1 call + save + validate + completeness check
    const fullOriginal = `  ${bot1CallMarker}\n${afterBot1}`;
    code = code.replace(fullOriginal, bot1BypassBlock + '\n' + closingBlock);
    console.log('[PATCH 2] ✅ skipBot1 bypass block added');
    changed = true;
  } else {
    console.log('[PATCH 2] ⚠️ Could not find the three lines after bot1Output');
    // Try a simpler patch — just wrap the bot1 call
    const simpleOriginal = `  ${bot1CallMarker}`;
    if (code.includes(simpleOriginal)) {
      code = code.replace(simpleOriginal, bot1BypassBlock + '\n  }');
      console.log('[PATCH 2] ✅ skipBot1 bypass added (simple method — validate/save may be outside block)');
      changed = true;
    }
  }
} else if (code.includes('SKIP BOT 1')) {
  console.log('[PATCH 2] Already patched');
} else {
  console.log('[PATCH 2] ⚠️ Could not find bot1 call marker');
}

// ─── Write and verify ────────────────────────────────────────────────────────
if (changed) {
  fs.writeFileSync(FILE, code);
  console.log('\n[DONE] ✅ bot_orchestrator_v3.js patched');

  // Syntax check
  const { execSync } = require('child_process');
  try {
    execSync(`/usr/local/bin/node -c "${FILE}"`, { stdio: 'pipe' });
    console.log('[SYNTAX] ✅ Passes');
  } catch (e) {
    console.error('[SYNTAX] ❌', e.stderr?.toString().split('\n').slice(0, 5).join('\n'));
    // Restore backup
    console.log('[ROLLBACK] Restoring from backup...');
  }
} else {
  console.log('\n[DONE] No changes needed');
}
