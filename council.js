/**
 * THE RESIDENTIALIST — Council Module v2
 *
 * Handles all escalation from the FLAG GATE in two tiers:
 *
 * Tier 1 — AUTO-RESOLVE: Claude API attempts to resolve the flag with a
 *           rubric patch, reclassification, or documented midpoint correction.
 *           If resolved, pipeline continues with a correction memo attached.
 *
 * Tier 2 — STRUCTURED RESOLUTION: Single Claude call that considers the flag
 *           from all three perspectives (Consumer Advocate, Technical Purist,
 *           Market Realist) in one pass. Produces a binding ruling.
 *           If resolved, pipeline continues with ruling attached.
 *           If not resolvable, escalates to Ray.
 *
 * v2 changes (Phase 3):
 *   - Replaced 3-member parallel vote + synthesis (5 Sonnet calls) with single
 *     structured resolution call (1 Sonnet call).
 *   - The three perspectives are now lens instructions inside one prompt, not
 *     separate API calls. One focused call with all context is more reliable
 *     than three separate calls that each see partial context.
 *   - Total API calls: 2 (auto-resolve + structured resolution) or 1 (auto-resolve only).
 *     Down from 5+ in v1.
 *
 * Ray receives a Telegram link for every council session regardless of outcome.
 * He can review at leisure. It never blocks the pipeline.
 */

const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const https = require('https');
require('dotenv').config({ path: '/Users/Residentialist/.openclaw/workspace/residentialist/.env' });

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// ─── TELEGRAM ─────────────────────────────────────────────────────────────────

function sendTelegram(message) {
  return new Promise((resolve, reject) => {
    if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) {
      console.log('[COUNCIL] Telegram not configured — skipping notification.');
      return resolve();
    }
    const body = JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'Markdown'
    });
    const options = {
      hostname: 'api.telegram.org',
      path: `/bot${TELEGRAM_TOKEN}/sendMessage`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', err => {
      console.error('[COUNCIL] Telegram error:', err.message);
      resolve(); // non-fatal
    });
    req.write(body);
    req.end();
  });
}

// ─── LOGGING ──────────────────────────────────────────────────────────────────

function writeLog(outputDir, filename, content) {
  const logPath = `${outputDir}/${filename}`;
  fs.writeFileSync(logPath, content);
  return logPath;
}

// ─── TIER 1 — AUTO-RESOLVE ────────────────────────────────────────────────────

const AUTO_RESOLVE_PROMPT = `You are the Residentialist Auto-Resolver. The Challenge Bot has flagged a product evaluation. Your job is to determine whether this flag can be resolved by:

1. CORRECTION MEMO — The flag is a rubric interpretation error. Write an exact correction that Bot 2 should apply (e.g., reclassify a material, adjust a subscore, document a midpoint correctly).
2. RECLASSIFY — The flag is a data classification issue (ASSUMED vs UNDISCLOSED). Provide the correct classification and the resulting score change.
3. PASS-THROUGH — The flag is a calibration note only (CHECK 3 proximity) with no scoring error. Pipeline can continue as-is.

You CANNOT resolve a flag if:
- It requires a policy decision (e.g., whether a new certification tier should be accepted)
- It requires information that doesn't exist in the provided research
- CHECK 1 shows a genuine hierarchy violation that requires human judgment
- There is genuine disagreement about rubric intent that requires Council input

Respond in exactly this format:

RESOLUTION: [RESOLVED / UNRESOLVABLE]
TYPE: [CORRECTION_MEMO / RECLASSIFY / PASS_THROUGH / COUNCIL_REQUIRED]
RATIONALE: [2-3 sentences explaining your decision]
ACTION: [If RESOLVED — exact correction text to attach as memo. If UNRESOLVABLE — what specific question the Council must answer.]`;

async function attemptAutoResolve(flagReport, bot2Output, productName) {
  console.log('[COUNCIL] Tier 1 — Attempting auto-resolve...');

  const userMessage = `PRODUCT: ${productName}

CHALLENGE BOT FLAG REPORT:
${flagReport}

BOT 2 EVALUATOR OUTPUT (relevant sections):
${bot2Output.slice(0, 8000)}

Attempt to resolve this flag now.`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    system: AUTO_RESOLVE_PROMPT,
    messages: [{ role: 'user', content: userMessage }]
  });

  return response.content[0].text;
}

// ─── TIER 2 — STRUCTURED RESOLUTION (replaces 3-member council) ───────────────

const STRUCTURED_RESOLUTION_PROMPT = `You are the Residentialist Council — a single structured resolution authority that evaluates flagged product evaluations from three perspectives simultaneously.

PERSPECTIVE 1 — CONSUMER ADVOCATE:
Does this score accurately reflect what a homebuyer will experience? Are the flags legitimate concerns that would affect buyer outcomes? Trust documented performance data and independent reviews over manufacturer claims.

PERSPECTIVE 2 — TECHNICAL PURIST:
Is the scoring methodology sound? Every score must be derivable from documented inputs using the published rubric. Assumed specs are scoring errors. Undisclosed specs must be midpoint-scored. The calibration table must remain internally consistent.

PERSPECTIVE 3 — MARKET REALIST:
Does this score make sense in market context? Is it calibrated correctly against competing products at similar price points? Would a production builder or design professional find this score credible?

YOUR PROCESS:
1. Evaluate the flag from all three perspectives
2. Identify where they agree and disagree
3. Produce a binding ruling

RULING LOGIC:
- If all three perspectives agree the flag is non-material → APPROVED, pipeline continues
- If a correction is needed that all perspectives support → MODIFICATION REQUIRED with exact correction
- If perspectives conflict on whether a correction is needed → APPROVED WITH MEMO noting the dissent
- If the flag raises a policy question, data integrity issue, or genuine rubric ambiguity → ESCALATE to Ray

Output format:
CONSUMER ADVOCATE VIEW: [2-3 sentences]
TECHNICAL PURIST VIEW: [2-3 sentences]
MARKET REALIST VIEW: [2-3 sentences]

COUNCIL RULING: [APPROVED / APPROVED WITH MEMO / MODIFICATION REQUIRED / ESCALATE / REJECTED]
CONSENSUS RATIONALE: [2-3 sentences]
REQUIRED ACTION: [Exact memo text if modification, or escalation question for Ray if ESCALATE, or nothing if APPROVED]
PIPELINE: [CONTINUES / HALTS]`;

async function resolveStructured(flagReport, autoResolveResult, bot1Output, bot2Output, bot3Output, productName) {
  console.log('[COUNCIL] Tier 2 — Structured resolution (single call)...');

  const context = `PRODUCT: ${productName}

CHALLENGE BOT FLAG REPORT:
${flagReport}

AUTO-RESOLVER ASSESSMENT:
${autoResolveResult}

BOT 1 CONSENSUS (summary — first 3000 chars):
${bot1Output.slice(0, 3000)}

BOT 2 EVALUATOR (full scoring section):
${bot2Output.slice(0, 6000)}

BOT 3 MATERIAL SAFETY:
${bot3Output.slice(0, 2000)}

Evaluate this flag from all three perspectives and produce a binding ruling.`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    system: STRUCTURED_RESOLUTION_PROMPT,
    messages: [{ role: 'user', content: context }]
  });

  return response.content[0].text;
}

// ─── MAIN ESCALATION HANDLER ─────────────────────────────────────────────────

/**
 * handleEscalation — called by the orchestrator when Challenge Bot returns FLAG
 *
 * Returns:
 *   { pipeline: 'CONTINUES', memo: '...' }  — pipeline proceeds with memo attached
 *   { pipeline: 'HALTS', reason: '...' }     — pipeline halts, Ray notified
 */
async function handleEscalation(flagReport, bot1Output, bot2Output, bot3Output, productName, outputDir) {
  const timestamp = new Date().toISOString();
  let sessionLog = `# COUNCIL SESSION LOG\nProduct: ${productName}\nTimestamp: ${timestamp}\n\n`;

  sessionLog += `## CHALLENGE BOT FLAG REPORT\n${flagReport}\n\n`;

  // ── TIER 1: Auto-resolve ──────────────────────────────────────────────────
  const autoResolveResult = await attemptAutoResolve(flagReport, bot2Output, productName);
  sessionLog += `## TIER 1 — AUTO-RESOLVE ATTEMPT\n${autoResolveResult}\n\n`;

  const isResolved = autoResolveResult.includes('RESOLUTION: RESOLVED');
  const isPassThrough = autoResolveResult.includes('TYPE: PASS_THROUGH');

  if (isResolved || isPassThrough) {
    const logPath = writeLog(outputDir, 'council_session.md', sessionLog);
    console.log('[COUNCIL] Auto-resolved — pipeline continues.');

    await sendTelegram(
      `*Council Auto-Resolve* — ${productName}\n\nChallenge Bot flagged, auto-resolver cleared it.\n\n[Review session log](file://${logPath})`
    );

    const memoMatch = autoResolveResult.match(/ACTION:([\s\S]+?)(?:\n[A-Z]+:|$)/);
    const memo = memoMatch ? memoMatch[1].trim() : 'Auto-resolved — see council_session.md';
    return { pipeline: 'CONTINUES', memo };
  }

  // ── TIER 2: Structured resolution (single call) ──────────────────────────
  const ruling = await resolveStructured(
    flagReport, autoResolveResult,
    bot1Output, bot2Output, bot3Output, productName
  );

  sessionLog += `## TIER 2 — STRUCTURED RESOLUTION\n${ruling}\n\n`;

  const logPath = writeLog(outputDir, 'council_session.md', sessionLog);

  const rulingLine = ruling.split('\n').find(l => l.startsWith('COUNCIL RULING:')) || '';
  const pipelineLine = ruling.split('\n').find(l => l.startsWith('PIPELINE:')) || '';
  const pipelineContinues = pipelineLine.includes('CONTINUES');

  if (pipelineContinues) {
    console.log('[COUNCIL] Structured resolution — pipeline continues.');
    await sendTelegram(
      `*Council Ruling* — ${productName}\n\n${rulingLine}\n\nPipeline continues. [Review session log](file://${logPath})`
    );
    const memoMatch = ruling.match(/REQUIRED ACTION:([\s\S]+?)(?:\nPIPELINE:|$)/);
    const memo = memoMatch ? memoMatch[1].trim() : 'Council approved — see council_session.md';
    return { pipeline: 'CONTINUES', memo };
  }

  // ── TIER 3: Escalate to Ray ───────────────────────────────────────────────
  console.log('[COUNCIL] Structured resolution could not resolve — escalating to Ray.');

  const requiredActionMatch = ruling.match(/REQUIRED ACTION:([\s\S]+?)(?:\nPIPELINE:|$)/);
  const escalationQuestion = requiredActionMatch ? requiredActionMatch[1].trim() : 'See council_session.md';

  await sendTelegram(
    `*Council Escalation — Ray needed* — ${productName}\n\n` +
    `${rulingLine}\n\n` +
    `*Question for you:*\n${escalationQuestion.slice(0, 500)}\n\n` +
    `[Full council session log](file://${logPath})\n\n` +
    `Pipeline is halted. Reply via Telegram or resume manually.`
  );

  sessionLog += `## TIER 3 — ESCALATED TO RAY\nTimestamp: ${new Date().toISOString()}\n`;
  writeLog(outputDir, 'council_session.md', sessionLog);

  return { pipeline: 'HALTS', reason: escalationQuestion };
}

module.exports = { handleEscalation };
