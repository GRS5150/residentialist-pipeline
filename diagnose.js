/**
 * THE RESIDENTIALIST — diagnose.js
 * Phase 4: Henry ↔ Claude Communication — Auto-diagnosis & self-fix
 *
 * When the pipeline hits an error, this module:
 *   1. Sends the error context to Claude for diagnosis
 *   2. If the fix is on the auto-fix whitelist, executes it
 *   3. If not, escalates to Ray via Telegram
 *
 * Auto-fix whitelist (safe, reversible actions only):
 *   - RETRY: re-run the same pipeline step
 *   - RESTART_PIPELINE: re-run the full pipeline from scratch
 *   - RESTART_PROCESS: restart telegram_listener or bridge
 *   - CLEAR_TEMP: remove stale temp/lock files
 *   - SKIP: skip this product (e.g., duplicate, already scored)
 *
 * Anything else → ESCALATE to Ray
 */

const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
require('dotenv').config({ path: '/Users/Residentialist/.openclaw/workspace/residentialist/.env' });

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const WORKSPACE = '/Users/Residentialist/.openclaw/workspace/residentialist';
const LOG_FILE = path.join(WORKSPACE, 'diagnose.log');

const ALLOWED_ACTIONS = ['RETRY', 'RESTART_PIPELINE', 'RESTART_PROCESS', 'CLEAR_TEMP', 'SKIP'];

const DIAGNOSIS_PROMPT = `You are the Residentialist Diagnostic Engine. You receive error reports from the pipeline and determine the correct fix.

RULES:
1. Analyze the error, stack trace, and context provided.
2. Respond with EXACTLY one JSON object (no markdown, no explanation):
{
  "action": "<ACTION>",
  "reason": "<one-line explanation>",
  "detail": "<optional additional context>"
}

ALLOWED ACTIONS (auto-fixable — no human needed):
- RETRY — Transient error (API timeout, rate limit, network glitch). Safe to re-run the same step.
- RESTART_PIPELINE — Corrupted intermediate state. Start the pipeline fresh for this product.
- RESTART_PROCESS — A long-running process (telegram_listener, bridge) has become unresponsive.
- CLEAR_TEMP — Stale lock files or temp artifacts blocking execution. Remove them and retry.
- SKIP — This product cannot be scored (e.g., discontinued, not a real product, already scored).

ESCALATE (requires Ray):
- ESCALATE — Anything you're not confident about: unknown errors, data integrity issues, scoring anomalies, calibration conflicts, infrastructure problems you can't diagnose, or repeated failures.

BIAS TOWARD ESCALATE. If in doubt, escalate. Ray would rather get a message than have the system silently make a bad call.

Common patterns:
- "ANTHROPIC_API_KEY" or "401" or "authentication" → likely .env issue → ESCALATE (config change needed)
- "ECONNREFUSED" or "ETIMEDOUT" or "socket hang up" → RETRY (transient network)
- "rate_limit" or "429" → RETRY (with note about backoff)
- "UNDETERMINED" in bot output → RETRY (model sometimes outputs prose on first try)
- "Cannot read properties of null" after bot step → RESTART_PIPELINE (corrupted state)
- "ENOENT" on a temp file → CLEAR_TEMP
- Repeated RETRY failures (attempt > 2) → ESCALATE
- Score wildly different from calibration → ESCALATE
- Any error you haven't seen before → ESCALATE`;

function diagLog(msg) {
  const line = `[DIAGNOSE] ${new Date().toISOString()} ${msg}`;
  console.log(line);
  try { fs.appendFileSync(LOG_FILE, line + '\n'); } catch (e) {}
}

/**
 * Diagnose an error and return a recommended action.
 * @param {Object} params
 * @param {string} params.error - Error message or stack trace
 * @param {string} params.context - What was happening (e.g., "Bot 2 evaluation of Pella 250 DH")
 * @param {number} params.attempt - How many times this has already been retried (0 = first failure)
 * @param {string} [params.product] - Product name if applicable
 * @param {string} [params.step] - Pipeline step (bot1, bot2, bot3, bot4, bot5, bot6, council, etc.)
 * @returns {Promise<{action: string, reason: string, detail: string, autoFixed: boolean}>}
 */
async function diagnose({ error, context, attempt = 0, product = '', step = '' }) {
  diagLog(`Diagnosing: ${context} | attempt=${attempt} | product=${product} | step=${step}`);
  diagLog(`Error: ${String(error).slice(0, 500)}`);

  // Hard rules — don't even call Claude for these
  if (attempt >= 3) {
    diagLog('Hard rule: attempt >= 3 → ESCALATE');
    return {
      action: 'ESCALATE',
      reason: `Failed ${attempt} times. Auto-fix exhausted.`,
      detail: String(error).slice(0, 500),
      autoFixed: false
    };
  }

  // Rate limit — always retry with backoff, no need to ask Claude
  if (/rate.?limit|429|too many requests/i.test(String(error))) {
    diagLog('Hard rule: rate limit → RETRY');
    return {
      action: 'RETRY',
      reason: 'API rate limit hit. Will retry after backoff.',
      detail: '',
      autoFixed: true
    };
  }

  // Ask Claude for diagnosis
  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      system: DIAGNOSIS_PROMPT,
      messages: [{
        role: 'user',
        content: `ERROR REPORT:
Product: ${product || 'N/A'}
Step: ${step || 'N/A'}
Attempt: ${attempt}
Context: ${context}

Error:
${String(error).slice(0, 1500)}`
      }]
    });

    const raw = response.content.filter(b => b.type === 'text').map(b => b.text).join('');
    diagLog(`Claude response: ${raw.slice(0, 300)}`);

    // Parse JSON from response
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      diagLog('Could not parse JSON from Claude → ESCALATE');
      return { action: 'ESCALATE', reason: 'Diagnosis engine returned unparseable response.', detail: raw.slice(0, 300), autoFixed: false };
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const action = (parsed.action || '').toUpperCase();

    if (ALLOWED_ACTIONS.includes(action)) {
      diagLog(`Auto-fix: ${action} — ${parsed.reason}`);
      return { action, reason: parsed.reason || '', detail: parsed.detail || '', autoFixed: true };
    }

    // Anything not on whitelist → ESCALATE
    diagLog(`Action "${action}" not on whitelist → ESCALATE`);
    return {
      action: 'ESCALATE',
      reason: parsed.reason || 'Diagnosis recommended escalation.',
      detail: parsed.detail || '',
      autoFixed: false
    };

  } catch (diagErr) {
    // If the diagnosis itself fails, always escalate
    diagLog(`Diagnosis call failed: ${diagErr.message} → ESCALATE`);
    return {
      action: 'ESCALATE',
      reason: `Diagnosis engine error: ${diagErr.message}`,
      detail: '',
      autoFixed: false
    };
  }
}

/**
 * Execute an auto-fix action. Returns true if the fix was applied.
 */
async function executeAutoFix(diagnosis, { product, config, category } = {}) {
  const { action } = diagnosis;
  diagLog(`Executing auto-fix: ${action}`);

  switch (action) {
    case 'RETRY':
      // Caller handles retry — just wait for rate limit backoff if needed
      if (/rate.?limit|429/i.test(diagnosis.reason)) {
        diagLog('Backoff: waiting 30 seconds for rate limit');
        await new Promise(r => setTimeout(r, 30000));
      } else {
        diagLog('Backoff: waiting 5 seconds before retry');
        await new Promise(r => setTimeout(r, 5000));
      }
      return true;

    case 'RESTART_PIPELINE':
      diagLog('RESTART_PIPELINE — caller should re-invoke runWithAutoCorrection');
      return true;

    case 'RESTART_PROCESS':
      try {
        diagLog('Restarting telegram_listener...');
        execSync('pkill -f telegram_listener || true', { cwd: WORKSPACE, timeout: 5000 });
        execSync('nohup node telegram_listener.js >> /Users/Residentialist/telegram.log 2>&1 &', { cwd: WORKSPACE, timeout: 5000 });
        diagLog('telegram_listener restarted');
      } catch (e) {
        diagLog(`RESTART_PROCESS failed: ${e.message}`);
      }
      return true;

    case 'CLEAR_TEMP':
      try {
        const tempFiles = ['PENDING_RULING.json', 'RESUME_SIGNAL', '/tmp/auto_runner_crash.log'];
        for (const f of tempFiles) {
          const fp = f.startsWith('/') ? f : path.join(WORKSPACE, f);
          if (fs.existsSync(fp)) { fs.unlinkSync(fp); diagLog(`Cleared: ${fp}`); }
        }
      } catch (e) {
        diagLog(`CLEAR_TEMP partial failure: ${e.message}`);
      }
      return true;

    case 'SKIP':
      diagLog(`SKIP: ${product || 'unknown product'} — will not be scored`);
      return true;

    default:
      diagLog(`Unknown action: ${action} — not executing`);
      return false;
  }
}

module.exports = { diagnose, executeAutoFix, diagLog };
