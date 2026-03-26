/**
 * Three-part fix:
 * 1. Add progress file writes to bot_orchestrator_v3.js at each bot stage
 * 2. Add GET /api/curation/:slug/pipeline-status endpoint to dashboard_server.js
 * 3. Fix runSelected() toast + add polling progress in curation.js
 */
const fs = require('fs');
const path = require('path');

const WORKSPACE = '/Users/Residentialist/.openclaw/workspace/residentialist';
const PUBLIC = path.join(WORKSPACE, 'dashboard', 'public');

// ═══════════════════════════════════════════════════════════════════════════════
// PART 1: Add progress file writes to bot_orchestrator_v3.js
// ═══════════════════════════════════════════════════════════════════════════════

const orchPath = path.join(WORKSPACE, 'bot_orchestrator_v3.js');
let orch = fs.readFileSync(orchPath, 'utf8');

// Add a progress writer function after the sendTelegram function
if (!orch.includes('function writeProgress')) {
  const insertAfter = "function sendTelegram(message) {";
  const progressFunc = `
// ── Pipeline Progress Tracker ────────────────────────────────────────────────
function writeProgress(outputDir, slug, step, total, botName, status) {
  const progressPath = path.join(outputDir, 'PIPELINE_PROGRESS.json');
  const data = {
    slug, step, total, current_bot: botName, status,
    started_at: global._pipelineStartTime || new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  try { fs.writeFileSync(progressPath, JSON.stringify(data, null, 2)); } catch(e) {}
  // Also write to curation dir for easy lookup by slug
  const curationProgressPath = path.join(__dirname, 'curation', slug + '_pipeline_progress.json');
  try { fs.writeFileSync(curationProgressPath, JSON.stringify(data, null, 2)); } catch(e) {}
}

`;
  orch = orch.replace(insertAfter, progressFunc + insertAfter);
  console.log('[PART 1a] ✅ writeProgress function added');
} else {
  console.log('[PART 1a] Already has writeProgress');
}

// Add progress writes at each bot stage
// Bot 1 (or skip)
if (!orch.includes("writeProgress(outputDir, productSlug, 1")) {
  // After skipBot1 synthetic output
  orch = orch.replace(
    `console.log(\`[ORCHESTRATOR] SKIP BOT 1: Using synthetic findings from curation pipeline`,
    `global._pipelineStartTime = new Date().toISOString();\n    writeProgress(outputDir, productSlug, 1, 6, 'Bot 1 (Skipped)', 'running');\n    console.log(\`[ORCHESTRATOR] SKIP BOT 1: Using synthetic findings from curation pipeline`
  );
  // After normal Bot 1 call
  if (orch.includes("bot1Output = await runBot('Bot 1 (Consensus)'")) {
    orch = orch.replace(
      "bot1Output = await runBot('Bot 1 (Consensus)'",
      "global._pipelineStartTime = global._pipelineStartTime || new Date().toISOString();\n    writeProgress(outputDir, productSlug, 1, 6, 'Bot 1 (Research)', 'running');\n    bot1Output = await runBot('Bot 1 (Consensus)'"
    );
  }
  console.log('[PART 1b] ✅ Bot 1 progress write added');
}

// Bot 2
if (!orch.includes("writeProgress(outputDir, productSlug, 2")) {
  orch = orch.replace(
    "[ORCHESTRATOR] Running Bot 2 (Evaluator)...",
    "[ORCHESTRATOR] Running Bot 2 (Evaluator)...');\n  writeProgress(outputDir, productSlug, 2, 6, 'Bot 2 (Evaluator)', 'running');\n  console.log('"
  );
  // Fix: the above creates a double console.log. Let me use a different approach.
}

// Actually, let me use a simpler approach - insert writeProgress calls before each runBot call
// Find patterns like "const bot2Output = await runBot" and insert writeProgress before them

// Remove the broken double-insert attempt
if (orch.includes("[ORCHESTRATOR] Running Bot 2 (Evaluator)...');\n  writeProgress")) {
  orch = orch.replace(
    "[ORCHESTRATOR] Running Bot 2 (Evaluator)...');\n  writeProgress(outputDir, productSlug, 2, 6, 'Bot 2 (Evaluator)', 'running');\n  console.log('",
    "[ORCHESTRATOR] Running Bot 2 (Evaluator)..."
  );
}

// Use a cleaner approach: insert before the Bot 2 runBot call
if (!orch.includes("writeProgress(outputDir, productSlug, 2")) {
  orch = orch.replace(
    "const bot2Output = await runBot('Bot 2 (Evaluator)'",
    "writeProgress(outputDir, productSlug, 2, 6, 'Bot 2 (Evaluator)', 'running');\n  const bot2Output = await runBot('Bot 2 (Evaluator)'"
  );
  console.log('[PART 1c] ✅ Bot 2 progress write added');
}

// Bot 3
if (!orch.includes("writeProgress(outputDir, productSlug, 3")) {
  orch = orch.replace(
    "const bot3Output = await runBot('Bot 3 (Material Safety)'",
    "writeProgress(outputDir, productSlug, 3, 6, 'Bot 3 (Material Safety)', 'running');\n  const bot3Output = await runBot('Bot 3 (Material Safety)'"
  );
  console.log('[PART 1d] ✅ Bot 3 progress write added');
}

// Bot 4 (Challenge) - uses runChallengeBot
if (!orch.includes("writeProgress(outputDir, productSlug, 4")) {
  const challengeCall = "const challengeResult = await runChallengeBot(";
  if (orch.includes(challengeCall)) {
    orch = orch.replace(
      challengeCall,
      "writeProgress(outputDir, productSlug, 4, 6, 'Bot 4 (Challenge)', 'running');\n  " + challengeCall
    );
    console.log('[PART 1e] ✅ Bot 4 progress write added');
  }
}

// Bot 5 (Reconciliation) - uses runReconciliationBot
if (!orch.includes("writeProgress(outputDir, productSlug, 5")) {
  const reconCall = "const reconciliationResult = await runReconciliationBot(";
  if (orch.includes(reconCall)) {
    orch = orch.replace(
      reconCall,
      "writeProgress(outputDir, productSlug, 5, 6, 'Bot 5 (Reconciliation)', 'running');\n  " + reconCall
    );
    console.log('[PART 1f] ✅ Bot 5 progress write added');
  }
}

// Council
if (!orch.includes("writeProgress(outputDir, productSlug, 6")) {
  const councilCall = "const councilResult = await handleEscalation(";
  if (orch.includes(councilCall)) {
    orch = orch.replace(
      councilCall,
      "writeProgress(outputDir, productSlug, 6, 6, 'Council', 'running');\n    " + councilCall
    );
    console.log('[PART 1g] ✅ Council progress write added');
  } else {
    console.log('[PART 1g] ⚠️ Council call not found');
  }
}

// Pipeline complete marker  
if (!orch.includes("writeProgress(outputDir, productSlug, 6, 6, 'Complete'")) {
  orch = orch.replace(
    "[ORCHESTRATOR] Pipeline complete.",
    "[ORCHESTRATOR] Pipeline complete.');\n  writeProgress(outputDir, productSlug, 6, 6, 'Complete', 'done');\n  console.log('"
  );
  console.log('[PART 1h] ✅ Pipeline complete progress write added');
}

fs.writeFileSync(orchPath, orch);

// Syntax check
const { execSync } = require('child_process');
try {
  execSync(`/usr/local/bin/node -c "${orchPath}"`, { stdio: 'pipe' });
  console.log('[PART 1] SYNTAX ✅');
} catch (e) {
  console.error('[PART 1] SYNTAX ❌', e.stderr?.toString().split('\n').slice(0, 5).join('\n'));
}

// ═══════════════════════════════════════════════════════════════════════════════
// PART 2: Add GET /api/curation/:slug/pipeline-status to dashboard_server.js
// ═══════════════════════════════════════════════════════════════════════════════

const serverPath = path.join(WORKSPACE, 'dashboard', 'dashboard_server.js');
let server = fs.readFileSync(serverPath, 'utf8');

if (!server.includes('pipeline-status')) {
  const insertBefore = '  // POST /api/curation/:slug/rescore';
  const statusRoute = `  // GET /api/curation/:slug/pipeline-status — poll pipeline progress
  const pipelineStatusMatch = pathname.match(/^\\/api\\/curation\\/([^/]+)\\/pipeline-status$/);
  if (pipelineStatusMatch && req.method === 'GET') {
    const slug = pipelineStatusMatch[1];
    const progressPath = path.join(CURATION_DIR, slug + '_pipeline_progress.json');
    try {
      if (fs.existsSync(progressPath)) {
        const progress = JSON.parse(fs.readFileSync(progressPath, 'utf8'));
        sendJSON(res, progress);
      } else {
        sendJSON(res, { status: 'idle', message: 'No pipeline running' });
      }
    } catch (err) {
      sendJSON(res, { status: 'error', message: err.message });
    }
    return true;
  }

  `;
  server = server.replace(insertBefore, statusRoute + insertBefore);
  fs.writeFileSync(serverPath, server);
  console.log('[PART 2] ✅ pipeline-status endpoint added');

  try {
    execSync(`/usr/local/bin/node -c "${serverPath}"`, { stdio: 'pipe' });
    console.log('[PART 2] SYNTAX ✅');
  } catch (e) {
    console.error('[PART 2] SYNTAX ❌', e.stderr?.toString().split('\n').slice(0, 5).join('\n'));
  }
} else {
  console.log('[PART 2] Already has pipeline-status');
}

// ═══════════════════════════════════════════════════════════════════════════════
// PART 3: Fix runSelected toast + add progress polling in curation.js
// ═══════════════════════════════════════════════════════════════════════════════

let curationJs = fs.readFileSync(path.join(PUBLIC, 'js', 'curation.js'), 'utf8');

// Replace the scoring section in runSelected to detect background pipeline
const oldScoringBlock = `      // Step 2: Trigger scoring pipeline (uses curated sources, skips Bot 1)
      showToast(\`Scoring \${slug.replace(/_/g, ' ')}...\`, 'success');
      const scoreRes = await fetch(\`\${API_BASE}/api/curation/\${slug}/rescore\`, { method: 'POST' });
      const scoreResult = await scoreRes.json();
      if (scoreResult.error) {
        showToast(\`Score failed for \${slug}: \${scoreResult.error}\`, 'error');
      } else {
        showToast(\`\${slug.replace(/_/g, ' ')}: scored \${scoreResult.new_score || 'done'}\`, 'success');
      }`;

const newScoringBlock = `      // Step 2: Trigger scoring pipeline (uses curated sources, skips Bot 1)
      showToast(\`Starting pipeline for \${slug.replace(/_/g, ' ')}...\`, 'success');
      const scoreRes = await fetch(\`\${API_BASE}/api/curation/\${slug}/rescore\`, { method: 'POST' });
      const scoreResult = await scoreRes.json();
      if (scoreResult.error) {
        showToast(\`Pipeline failed for \${slug}: \${scoreResult.error}\`, 'error');
      } else if (scoreResult.started) {
        showToast(\`Pipeline running for \${slug.replace(/_/g, ' ')} (3-5 min)\`, 'success');
        // Start polling for this product's progress
        startProgressPoll(slug);
      } else {
        showToast(\`\${slug.replace(/_/g, ' ')}: scored \${scoreResult.new_score || 'done'}\`, 'success');
      }`;

if (curationJs.includes(oldScoringBlock)) {
  curationJs = curationJs.replace(oldScoringBlock, newScoringBlock);
  console.log('[PART 3a] ✅ runSelected toast fixed');
} else {
  console.log('[PART 3a] ⚠️ Could not find scoring block in runSelected');
}

// Replace the final toast
curationJs = curationJs.replace(
  "showToast(`${slugs.length} product(s) released and scored`, 'success');",
  "showToast(`${slugs.length} product(s) released to pipeline`, 'success');"
);

// Add progress polling functions at the end (before Init section)
if (!curationJs.includes('startProgressPoll')) {
  const initMarker = '// ─── Init ─';
  const progressCode = `// ─── Pipeline Progress Polling ────────────────────────────────────────────────

const activePolls = {};

function startProgressPoll(slug) {
  if (activePolls[slug]) return; // Already polling
  activePolls[slug] = setInterval(() => pollProgress(slug), 10000);
  // Show initial status on the product row
  updateProductRowStatus(slug, 'Pipeline starting...', true);
}

async function pollProgress(slug) {
  try {
    const res = await fetch(\`\${API_BASE}/api/curation/\${slug}/pipeline-status\`);
    const progress = await res.json();

    if (progress.status === 'done') {
      updateProductRowStatus(slug, '✅ Scored', false);
      clearInterval(activePolls[slug]);
      delete activePolls[slug];
      // Refresh product list to show new score
      setTimeout(loadProducts, 2000);
    } else if (progress.status === 'running') {
      const label = \`Pipeline running... \${progress.current_bot} (\${progress.step}/\${progress.total})\`;
      updateProductRowStatus(slug, label, true);
    } else if (progress.status === 'error') {
      updateProductRowStatus(slug, '❌ Pipeline error', false);
      clearInterval(activePolls[slug]);
      delete activePolls[slug];
    }
    // idle = no pipeline running, keep polling briefly then stop
  } catch (err) {
    console.error('Progress poll error:', err);
  }
}

function updateProductRowStatus(slug, statusText, isActive) {
  // Find the product row by its checkbox data-slug
  const checkbox = document.querySelector(\`.checkbox[data-slug="\${slug}"]\`);
  if (!checkbox) return;
  const row = checkbox.closest('.product-row');
  if (!row) return;

  // Find or create the progress indicator
  let indicator = row.querySelector('.pipeline-progress');
  if (!indicator) {
    indicator = document.createElement('span');
    indicator.className = 'pipeline-progress';
    indicator.style.cssText = 'font-size:12px; padding:2px 8px; border-radius:4px; margin-left:8px;';
    // Insert before the Open button
    const btn = row.querySelector('.btn');
    if (btn) row.insertBefore(indicator, btn);
    else row.appendChild(indicator);
  }

  indicator.textContent = statusText;
  if (isActive) {
    indicator.style.background = 'var(--accent-blue, #3b82f6)';
    indicator.style.color = 'white';
    indicator.style.animation = 'pulse 2s infinite';
  } else {
    indicator.style.background = statusText.includes('✅') ? 'var(--accent-green, #22c55e)' : 'var(--accent-red, #ef4444)';
    indicator.style.color = 'white';
    indicator.style.animation = '';
  }
}

`;
  curationJs = curationJs.replace(initMarker, progressCode + initMarker);
  console.log('[PART 3b] ✅ Progress polling functions added');
} else {
  console.log('[PART 3b] Already has polling');
}

// Add a pulse animation to the CSS
const cssPath = path.join(PUBLIC, 'css', 'curation.css');
let css = fs.readFileSync(cssPath, 'utf8');
if (!css.includes('@keyframes pulse')) {
  css += `
/* Pipeline progress pulse animation */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
`;
  fs.writeFileSync(cssPath, css);
  console.log('[PART 3c] ✅ Pulse animation added to CSS');
}

fs.writeFileSync(path.join(PUBLIC, 'js', 'curation.js'), curationJs);

console.log('\n[DONE] All three parts applied');
