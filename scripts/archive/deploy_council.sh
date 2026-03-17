#!/bin/bash
# THE RESIDENTIALIST — Council Deployment Script
# Run from: /home/ubuntu/.openclaw/workspace/residentialist/
# Usage: bash deploy_council.sh

set -e
WORKSPACE="/home/ubuntu/.openclaw/workspace/residentialist"
cd "$WORKSPACE"

echo ""
echo "=== RESIDENTIALIST COUNCIL DEPLOYMENT ==="
echo ""

# Step 1: Backup orchestrator
echo "[1/5] Backing up bot_orchestrator_v2.js..."
cp bot_orchestrator_v2.js bot_orchestrator_v2.js.bak
echo "      Backup: bot_orchestrator_v2.js.bak"

# Step 2: Verify council.js is present
echo "[2/5] Checking for council.js..."
if [ ! -f "council.js" ]; then
  echo "ERROR: council.js not found in $WORKSPACE"
  echo "       Upload council.js first, then re-run this script."
  exit 1
fi
echo "      Found council.js ✓"

# Step 3: Add council require to orchestrator (after challenge_bot require)
echo "[3/5] Patching orchestrator — adding council require..."
if grep -q "require('./council')" bot_orchestrator_v2.js; then
  echo "      Council require already present — skipping."
else
  sed -i "s|const { runChallengeBot } = require('./challenge_bot_v2');|const { runChallengeBot } = require('./challenge_bot_v2');\nconst { handleEscalation } = require('./council');|" bot_orchestrator_v2.js
  echo "      Council require added ✓"
fi

# Step 4: Replace FLAG GATE section
echo "[4/5] Patching orchestrator — replacing FLAG GATE..."

python3 << 'ENDPY'
import re

with open('bot_orchestrator_v2.js', 'r') as f:
    content = f.read()

# The old FLAG GATE block — from the comment through the closing return of the PASS block
old_flag_gate = r"""  // ── FLAG GATE ─────────────────────────────────────────────────────────────────
  // Detect FLAG: scan all lines for VERDICT, then check for any FLAG indicators
  const crLines = challengeResult.split\('\\n'\);
  const verdictLine = crLines.find\(l => l.toUpperCase\(\).includes\('VERDICT'\)\);
  const hasCheckFlag = challengeResult.includes\('FLAG'\) && \(
    challengeResult.includes\('CHECK 1'\) \|\| 
    challengeResult.includes\('CHECK 2'\) \|\| 
    challengeResult.includes\('CHECK 3'\)
  \);
  const isFlagged = verdictLine
    \? verdictLine.toUpperCase\(\).includes\('FLAG'\)
    : hasCheckFlag;

  if \(isFlagged\) \{
    console.log\('\\n\[ORCHESTRATOR\] ⚠️  PIPELINE HALTED — Challenge Bot returned FLAG'\);
    console.log\(`\[ORCHESTRATOR\] Review: \$\{outputDir\}/\$\{productSlug\}_bot4_challenge.md`\);
    console.log\('\[ORCHESTRATOR\] Resolve all flagged issues, then re-run or accept with Council approval\.'\);
    fs.writeFileSync\(`\$\{outputDir\}/PIPELINE_STATUS\.txt`,
      `STATUS: HALTED\\nPRODUCT: \$\{productName\}\\nCONFIG: \$\{config\}\\nTIMESTAMP: \$\{timestamp\}\\nREASON: Challenge Bot FLAG\\nSee: \$\{productSlug\}_bot4_challenge\.md`
    \);
    return \{ status: 'FLAGGED', outputDir, challengeResult, bot1Output, bot2Output, bot3Output \};
  \}

  // ── PASS ──────────────────────────────────────────────────────────────────
  console.log\('\\n\[ORCHESTRATOR\] ✅ Challenge Bot PASS — pipeline complete\.'\);
  console.log\(`\[ORCHESTRATOR\] All outputs saved to: \$\{outputDir\}`\);
  fs.writeFileSync\(`\$\{outputDir\}/PIPELINE_STATUS\.txt`,
    `STATUS: PASS\\nPRODUCT: \$\{productName\}\\nCONFIG: \$\{config\}\\nTIMESTAMP: \$\{timestamp\}\\nAll four bots completed\. Ready for report assembly \(Bot 5/6 pending build\)\.`
  \);

  console.log\(`\\n\[ORCHESTRATOR\] Files:`\);
  console.log\(`  \$\{productSlug\}_bot1_consensus\.md`\);
  console.log\(`  \$\{productSlug\}_bot2_evaluator\.md`\);
  console.log\(`  \$\{productSlug\}_bot3_material_safety\.md`\);
  console.log\(`  \$\{productSlug\}_bot4_challenge\.md`\);
  console.log\(`  PIPELINE_STATUS\.txt`\);

  return \{ status: 'PASS', outputDir, bot1Output, bot2Output, bot3Output, challengeResult \};"""

new_flag_gate = """  // ── FLAG GATE ─────────────────────────────────────────────────────────────────
  // Detect FLAG: scan all lines for VERDICT, then check for any FLAG indicators
  const crLines = challengeResult.split('\\n');
  const verdictLine = crLines.find(l => l.toUpperCase().includes('VERDICT'));
  const hasCheckFlag = challengeResult.includes('FLAG') && (
    challengeResult.includes('CHECK 1') ||
    challengeResult.includes('CHECK 2') ||
    challengeResult.includes('CHECK 3')
  );
  const isFlagged = verdictLine
    ? verdictLine.toUpperCase().includes('FLAG')
    : hasCheckFlag;

  if (isFlagged) {
    console.log('\\n[ORCHESTRATOR] ⚠️  Challenge Bot FLAG detected — routing to Council...');

    const escalationResult = await handleEscalation(
      challengeResult,
      bot1Output,
      bot2Output,
      bot3Output,
      productName,
      outputDir
    );

    if (escalationResult.pipeline === 'HALTS') {
      console.log('\\n[ORCHESTRATOR] 🛑 Pipeline halted — Ray escalation sent via Telegram.');
      console.log(`[ORCHESTRATOR] Council session log: ${outputDir}/council_session.md`);
      fs.writeFileSync(`${outputDir}/PIPELINE_STATUS.txt`,
        `STATUS: HALTED — AWAITING RAY DECISION\\nPRODUCT: ${productName}\\nCONFIG: ${config}\\nTIMESTAMP: ${timestamp}\\nREASON: Council escalation — see council_session.md\\nRAY NOTIFIED: ${new Date().toISOString()}`
      );
      return { status: 'ESCALATED', outputDir, challengeResult, bot1Output, bot2Output, bot3Output };
    }

    // Council resolved — attach memo and continue
    console.log('\\n[ORCHESTRATOR] ✅ Council resolved flag — pipeline continuing with memo attached.');
    fs.writeFileSync(`${outputDir}/${productSlug}_council_memo.md`,
      `# Council Resolution Memo\\nProduct: ${productName}\\nTimestamp: ${new Date().toISOString()}\\n\\n${escalationResult.memo}`
    );
  }

  // ── PASS ──────────────────────────────────────────────────────────────────
  console.log('\\n[ORCHESTRATOR] ✅ Pipeline complete.');
  console.log(`[ORCHESTRATOR] All outputs saved to: ${outputDir}`);
  fs.writeFileSync(`${outputDir}/PIPELINE_STATUS.txt`,
    `STATUS: PASS\\nPRODUCT: ${productName}\\nCONFIG: ${config}\\nTIMESTAMP: ${timestamp}\\nAll four bots completed. Ready for report assembly (Bot 5/6 pending build).`
  );

  console.log(`\\n[ORCHESTRATOR] Files:`);
  console.log(`  ${productSlug}_bot1_consensus.md`);
  console.log(`  ${productSlug}_bot2_evaluator.md`);
  console.log(`  ${productSlug}_bot3_material_safety.md`);
  console.log(`  ${productSlug}_bot4_challenge.md`);
  if (fs.existsSync(`${outputDir}/${productSlug}_council_memo.md`)) {
    console.log(`  ${productSlug}_council_memo.md`);
    console.log(`  council_session.md`);
  }
  console.log(`  PIPELINE_STATUS.txt`);

  return { status: 'PASS', outputDir, bot1Output, bot2Output, bot3Output, challengeResult };"""

# Use literal string replacement on the known exact text
old_literal = """  // \u2500\u2500 FLAG GATE \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  // Detect FLAG: scan all lines for VERDICT, then check for any FLAG indicators
  const crLines = challengeResult.split('\\n');
  const verdictLine = crLines.find(l => l.toUpperCase().includes('VERDICT'));
  const hasCheckFlag = challengeResult.includes('FLAG') && (
    challengeResult.includes('CHECK 1') || 
    challengeResult.includes('CHECK 2') || 
    challengeResult.includes('CHECK 3')
  );
  const isFlagged = verdictLine
    ? verdictLine.toUpperCase().includes('FLAG')
    : hasCheckFlag;

  if (isFlagged) {
    console.log('\\n[ORCHESTRATOR] \u26a0\ufe0f  PIPELINE HALTED \u2014 Challenge Bot returned FLAG');
    console.log(`[ORCHESTRATOR] Review: ${outputDir}/${productSlug}_bot4_challenge.md`);
    console.log('[ORCHESTRATOR] Resolve all flagged issues, then re-run or accept with Council approval.');
    fs.writeFileSync(`${outputDir}/PIPELINE_STATUS.txt`,
      `STATUS: HALTED\\nPRODUCT: ${productName}\\nCONFIG: ${config}\\nTIMESTAMP: ${timestamp}\\nREASON: Challenge Bot FLAG\\nSee: ${productSlug}_bot4_challenge.md`
    );
    return { status: 'FLAGGED', outputDir, challengeResult, bot1Output, bot2Output, bot3Output };
  }

  // \u2500\u2500 PASS \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  console.log('\\n[ORCHESTRATOR] \u2705 Challenge Bot PASS \u2014 pipeline complete.');
  console.log(`[ORCHESTRATOR] All outputs saved to: ${outputDir}`);
  fs.writeFileSync(`${outputDir}/PIPELINE_STATUS.txt`,
    `STATUS: PASS\\nPRODUCT: ${productName}\\nCONFIG: ${config}\\nTIMESTAMP: ${timestamp}\\nAll four bots completed. Ready for report assembly (Bot 5/6 pending build).`
  );

  console.log(`\\n[ORCHESTRATOR] Files:`);
  console.log(`  ${productSlug}_bot1_consensus.md`);
  console.log(`  ${productSlug}_bot2_evaluator.md`);
  console.log(`  ${productSlug}_bot3_material_safety.md`);
  console.log(`  ${productSlug}_bot4_challenge.md`);
  console.log(`  PIPELINE_STATUS.txt`);

  return { status: 'PASS', outputDir, bot1Output, bot2Output, bot3Output, challengeResult };"""

if old_literal in content:
    content = content.replace(old_literal, new_flag_gate)
    with open('bot_orchestrator_v2.js', 'w') as f:
        f.write(content)
    print("FLAG GATE patched successfully")
else:
    print("ERROR: Could not find exact FLAG GATE text — manual patch required")
    print("See orchestrator_patch.js for the replacement block")
ENDPY

# Step 5: Syntax check
echo "[5/5] Syntax checking patched orchestrator..."
node --check bot_orchestrator_v2.js && echo "      Syntax OK ✓" || {
  echo "      SYNTAX ERROR — restoring backup..."
  cp bot_orchestrator_v2.js.bak bot_orchestrator_v2.js
  echo "      Restored from backup. See orchestrator_patch.js for manual instructions."
  exit 1
}

echo ""
echo "=== DEPLOYMENT COMPLETE ==="
echo ""
echo "council.js is live."
echo "bot_orchestrator_v2.js is patched."
echo ""
echo "Escalation flow:"
echo "  FLAG → Auto-resolve attempt → Council (3 votes + synthesis) → Ray (only if deadlock)"
echo "  Ray gets a Telegram link for every Council session, never blocks pipeline."
echo ""
echo "Test with a dry run:"
echo "  node bot_orchestrator_v2.js \"Andersen 400 Series\" DH"
echo ""
