/**
 * patch_add_bot5.js
 * Run: node patch_add_bot5.js
 * Wires reconciliation_bot.js into bot_orchestrator_v2.js as Bot 5.
 * Runs after Bot 3, before the FLAG GATE.
 */

const fs = require('fs');
const path = '/home/ubuntu/.openclaw/workspace/residentialist/bot_orchestrator_v2.js';

let content = fs.readFileSync(path, 'utf8');

// ── PATCH 1: Add reconciliation require ──────────────────────────────────────
const councilRequire = "const { handleEscalation } = require('./council');";
const reconRequire = "const { runReconciliationBot } = require('./reconciliation_bot');";

if (content.includes(reconRequire)) {
  console.log('[PATCH 1] Reconciliation require already present — skipping.');
} else if (content.includes(councilRequire)) {
  content = content.replace(councilRequire, councilRequire + '\n' + reconRequire);
  console.log('[PATCH 1] Reconciliation require added.');
} else {
  console.error('[PATCH 1] ERROR: Could not find council require line.');
  process.exit(1);
}

// ── PATCH 2: Insert Bot 5 call after Bot 3, before Bot 4 ────────────────────
// Anchor: the challenge bot section header
const bot4Anchor = "// \u2500\u2500 BOT 4: Challenge Bot";

const bot5Block = [
  '  // \u2500\u2500 BOT 5: Reconciliation \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500',
  "  console.log('\\n[ORCHESTRATOR] Running Bot 5 (Reconciliation)...');",
  '  const reconciliationResult = await runReconciliationBot(bot1Output, bot2Output, productName, outputDir);',
  '  fs.writeFileSync(`${outputDir}/RECONCILIATION_STATUS.txt`,',
  '    `STATUS: ${reconciliationResult.status}\\nCONFIDENCE: ${reconciliationResult.confidenceTag}\\nPRODUCT: ${productName}\\nTIMESTAMP: ${new Date().toISOString()}`',
  '  );',
  '',
  "  if (reconciliationResult.status === 'UNRESOLVED') {",
  "    console.log('[ORCHESTRATOR] Reconciliation unresolved — routing unresolved items to Council...');",
  '    const reconEscalation = await handleEscalation(',
  '      `RECONCILIATION UNRESOLVED:\\n${reconciliationResult.unresolvedItems}`,',
  '      bot1Output,',
  '      bot2Output,',
  '      bot3Output,',
  '      productName,',
  '      outputDir',
  '    );',
  "    if (reconEscalation.pipeline === 'HALTS') {",
  "      console.log('[ORCHESTRATOR] HALTED - Reconciliation escalation sent to Ray.');",
  '      fs.writeFileSync(`${outputDir}/PIPELINE_STATUS.txt`,',
  '        `STATUS: HALTED - RECONCILIATION ESCALATED\\nPRODUCT: ${productName}\\nCONFIG: ${config}\\nTIMESTAMP: ${timestamp}\\nSee: RECONCILIATION_STATUS.txt and council_session.md`',
  '      );',
  "      return { status: 'ESCALATED', outputDir, bot1Output, bot2Output, bot3Output };",
  '    }',
  '  }',
  '',
  "  if (reconciliationResult.revisions && reconciliationResult.revisions.length > 0) {",
  "    console.log(`[ORCHESTRATOR] Bot 5 revisions: ${reconciliationResult.revisions.join(', ')}`);",
  '  }',
  '',
  `  // \u2500\u2500 BOT 4: Challenge Bot`
].join('\n');

if (content.includes(bot4Anchor)) {
  content = content.replace(bot4Anchor, bot5Block);
  console.log('[PATCH 2] Bot 5 inserted before Bot 4.');
} else {
  console.error('[PATCH 2] ERROR: Could not find Bot 4 anchor.');
  console.error('Looking for:', bot4Anchor);
  process.exit(1);
}

fs.writeFileSync(path, content, 'utf8');
console.log('[DONE] bot_orchestrator_v2.js patched with Bot 5.');
console.log('Run: node --check', path);
