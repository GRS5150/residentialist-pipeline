/**
 * patch_orchestrator.js
 * Run: node patch_orchestrator.js
 * Patches bot_orchestrator_v2.js to add Council escalation.
 */

const fs = require('fs');
const path = '/home/ubuntu/.openclaw/workspace/residentialist/bot_orchestrator_v2.js';

let content = fs.readFileSync(path, 'utf8');

// ── PATCH 1: Add council require after challenge_bot require ──────────────────
const challengeRequire = "const { runChallengeBot } = require('./challenge_bot_v2');";
const councilRequire = "const { handleEscalation } = require('./council');";

if (content.includes(councilRequire)) {
  console.log('[PATCH 1] Council require already present — skipping.');
} else if (content.includes(challengeRequire)) {
  content = content.replace(challengeRequire, challengeRequire + '\n' + councilRequire);
  console.log('[PATCH 1] Council require added.');
} else {
  console.error('[PATCH 1] ERROR: Could not find challenge_bot require line.');
  process.exit(1);
}

// ── PATCH 2: Replace FLAG GATE block ─────────────────────────────────────────

// Find the block by searching for unique anchor strings
const flagGateStart = content.indexOf('// \u2500\u2500 FLAG GATE');
const passBlockEnd_marker = "return { status: 'PASS', outputDir, bot1Output, bot2Output, bot3Output, challengeResult };";
const flagGateEnd = content.indexOf(passBlockEnd_marker) + passBlockEnd_marker.length;

if (flagGateStart === -1) {
  console.error('[PATCH 2] ERROR: Could not find FLAG GATE start.');
  process.exit(1);
}
if (flagGateEnd === -1) {
  console.error('[PATCH 2] ERROR: Could not find PASS block end.');
  process.exit(1);
}

console.log('[PATCH 2] FLAG GATE found at index', flagGateStart, 'to', flagGateEnd);

const newFlagGate = [
  '// \u2500\u2500 FLAG GATE \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500',
  '  // Detect FLAG: scan all lines for VERDICT, then check for any FLAG indicators',
  "  const crLines = challengeResult.split('\\n');",
  "  const verdictLine = crLines.find(l => l.toUpperCase().includes('VERDICT'));",
  "  const hasCheckFlag = challengeResult.includes('FLAG') && (",
  "    challengeResult.includes('CHECK 1') ||",
  "    challengeResult.includes('CHECK 2') ||",
  "    challengeResult.includes('CHECK 3')",
  '  );',
  '  const isFlagged = verdictLine',
  "    ? verdictLine.toUpperCase().includes('FLAG')",
  '    : hasCheckFlag;',
  '',
  '  if (isFlagged) {',
  "    console.log('\\n[ORCHESTRATOR] WARNING: Challenge Bot FLAG detected - routing to Council...');",
  '',
  '    const escalationResult = await handleEscalation(',
  '      challengeResult,',
  '      bot1Output,',
  '      bot2Output,',
  '      bot3Output,',
  '      productName,',
  '      outputDir',
  '    );',
  '',
  "    if (escalationResult.pipeline === 'HALTS') {",
  "      console.log('\\n[ORCHESTRATOR] HALTED - Ray escalation sent via Telegram.');",
  '      console.log(`[ORCHESTRATOR] Council session log: ${outputDir}/council_session.md`);',
  '      fs.writeFileSync(`${outputDir}/PIPELINE_STATUS.txt`,',
  '        `STATUS: HALTED - AWAITING RAY DECISION\\nPRODUCT: ${productName}\\nCONFIG: ${config}\\nTIMESTAMP: ${timestamp}\\nREASON: Council escalation - see council_session.md\\nRAY NOTIFIED: ${new Date().toISOString()}`',
  '      );',
  "      return { status: 'ESCALATED', outputDir, challengeResult, bot1Output, bot2Output, bot3Output };",
  '    }',
  '',
  "    console.log('\\n[ORCHESTRATOR] PASS - Council resolved flag - pipeline continuing with memo attached.');",
  '    fs.writeFileSync(`${outputDir}/${productSlug}_council_memo.md`,',
  '      `# Council Resolution Memo\\nProduct: ${productName}\\nTimestamp: ${new Date().toISOString()}\\n\\n${escalationResult.memo}`',
  '    );',
  '  }',
  '',
  '  // \u2500\u2500 PASS \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500',
  "  console.log('\\n[ORCHESTRATOR] Pipeline complete.');",
  '  console.log(`[ORCHESTRATOR] All outputs saved to: ${outputDir}`);',
  '  fs.writeFileSync(`${outputDir}/PIPELINE_STATUS.txt`,',
  '    `STATUS: PASS\\nPRODUCT: ${productName}\\nCONFIG: ${config}\\nTIMESTAMP: ${timestamp}\\nAll four bots completed. Ready for report assembly.`',
  '  );',
  '',
  "  console.log(`\\n[ORCHESTRATOR] Files:`);",
  '  console.log(`  ${productSlug}_bot1_consensus.md`);',
  '  console.log(`  ${productSlug}_bot2_evaluator.md`);',
  '  console.log(`  ${productSlug}_bot3_material_safety.md`);',
  '  console.log(`  ${productSlug}_bot4_challenge.md`);',
  '  if (fs.existsSync(`${outputDir}/${productSlug}_council_memo.md`)) {',
  '    console.log(`  ${productSlug}_council_memo.md`);',
  "    console.log(`  council_session.md`);",
  '  }',
  "  console.log(`  PIPELINE_STATUS.txt`);",
  '',
  "  return { status: 'PASS', outputDir, bot1Output, bot2Output, bot3Output, challengeResult };"
].join('\n');

content = content.slice(0, flagGateStart) + newFlagGate + content.slice(flagGateEnd);

fs.writeFileSync(path, content, 'utf8');
console.log('[PATCH 2] FLAG GATE replaced successfully.');
console.log('Done. Run: node --check', path);
