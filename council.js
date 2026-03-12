/**
 * THE RESIDENTIALIST — Council Module
 *
 * Handles all escalation from the FLAG GATE in three tiers:
 *
 * Tier 1 — AUTO-RESOLVE: Claude API attempts to resolve the flag with a
 *           rubric patch, reclassification, or documented midpoint correction.
 *           If resolved, pipeline continues with a correction memo attached.
 *
 * Tier 2 — COUNCIL: Three specialized Claude instances vote independently.
 *           Consumer Advocate, Technical Purist, Market Realist.
 *           Synthesis call produces a ruling. 2/3 matching = decision.
 *           If resolved, pipeline continues with council ruling attached.
 *
 * Tier 3 — ESCALATE TO RAY: 3-way split or policy-level question.
 *           Telegram message with log link. Pipeline halts only here.
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

// ─── TIER 2 — COUNCIL ────────────────────────────────────────────────────────

const COUNCIL_MEMBERS = [
  {
    name: 'Consumer Advocate',
    prompt: `You are the Consumer Advocate on The Residentialist Council. You represent quality-conscious homebuyers who are making a $30,000–$150,000 purchase decision and relying on this score to be accurate and honest.

Your perspective: Does this score accurately reflect what a homebuyer will experience? Are the flags legitimate concerns that would affect buyer outcomes? You are skeptical of over-engineering and academic precision that doesn't translate to real-world buyer impact. You trust documented performance data and independent reviews over manufacturer claims.

You receive a flagged product evaluation and a proposed auto-resolution or Council question. Vote: APPROVE (accept the score as-is or with minor memo), MODIFY (specific change required), or REJECT (score is materially misleading to buyers).

Always state: VOTE: [APPROVE/MODIFY/REJECT] followed by your 2-3 sentence rationale. If MODIFY, state exactly what change you require.`
  },
  {
    name: 'Technical Purist',
    prompt: `You are the Technical Purist on The Residentialist Council. You are responsible for rubric integrity, scoring consistency, and data discipline.

Your perspective: Every score must be derivable from documented inputs using the published rubric. Assumed specs are scoring errors. Undisclosed specs must be midpoint-scored. The calibration table must remain internally consistent. You do not care about buyer sentiment — you care about whether the math is defensible.

You receive a flagged product evaluation and a proposed auto-resolution or Council question. Vote: APPROVE (methodology is sound), MODIFY (specific correction required), or REJECT (scoring violates rubric principles).

Always state: VOTE: [APPROVE/MODIFY/REJECT] followed by your 2-3 sentence rationale. If MODIFY, state exactly what correction the rubric requires.`
  },
  {
    name: 'Market Realist',
    prompt: `You are the Market Realist on The Residentialist Council. You represent the builder and trade professional perspective — people who spec products at scale and understand price-tier context.

Your perspective: Does this score make sense in the context of the market? Is it calibrated correctly against competing products at similar price points? Would a production builder or design professional find this score credible? You are skeptical of scores that don't reflect real-world procurement realities.

You receive a flagged product evaluation and a proposed auto-resolution or Council question. Vote: APPROVE (score is market-credible), MODIFY (calibration adjustment needed), or REJECT (score would not survive professional scrutiny).

Always state: VOTE: [APPROVE/MODIFY/REJECT] followed by your 2-3 sentence rationale. If MODIFY, state exactly what market-calibration change you require.`
  }
];

const SYNTHESIS_PROMPT = `You are the Residentialist Council Synthesizer. You receive the votes and rationales of three Council members — Consumer Advocate, Technical Purist, and Market Realist — on a flagged product evaluation. Your job is to produce a binding ruling.

RULING LOGIC:
- 3 APPROVE → RULING: APPROVED. State the consensus rationale.
- 2 APPROVE, 1 MODIFY → RULING: APPROVED WITH MEMO. Incorporate the modification from the dissenting member as a required correction memo.
- 2 APPROVE, 1 REJECT → RULING: APPROVED WITH NOTE. Note the dissent. Pipeline continues.
- 2 MODIFY (same change) → RULING: MODIFICATION REQUIRED. State the exact change both members require.
- 2 MODIFY (different changes) → RULING: ESCALATE. Describe the conflict. Ray must decide.
- 2 REJECT → RULING: REJECTED. Pipeline halts. Ray must review.
- 3-way split (one each) → RULING: ESCALATE. No consensus. Ray must decide.
- 1 REJECT + 2 others disagree → RULING: APPROVED WITH DISSENT NOTED unless the rejection raises a data integrity issue, in which case ESCALATE.

Output format:
COUNCIL RULING: [APPROVED / APPROVED WITH MEMO / MODIFICATION REQUIRED / ESCALATE / REJECTED]
CONSENSUS RATIONALE: [2-3 sentences]
REQUIRED ACTION: [Exact memo text if modification, or escalation question for Ray if ESCALATE, or nothing if APPROVED]
PIPELINE: [CONTINUES / HALTS]`;

async function conveneCouncil(flagReport, autoResolveResult, bot1Output, bot2Output, bot3Output, productName) {
  console.log('[COUNCIL] Tier 2 — Convening Council...');

  const councilContext = `PRODUCT: ${productName}

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

Council question: Should this flag be accepted, modified, or rejected? Cast your vote.`;

  // Fire all three Council calls in parallel
  console.log('[COUNCIL] Firing Consumer Advocate, Technical Purist, Market Realist simultaneously...');
  const [advocateResult, puristResult, realistResult] = await Promise.all(
    COUNCIL_MEMBERS.map(member =>
      client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 800,
        system: member.prompt,
        messages: [{ role: 'user', content: councilContext }]
      }).then(r => ({ name: member.name, vote: r.content[0].text }))
    )
  );

  console.log(`[COUNCIL] Votes received:`);
  console.log(`  ${advocateResult.name}: ${advocateResult.vote.split('\n')[0]}`);
  console.log(`  ${puristResult.name}: ${puristResult.vote.split('\n')[0]}`);
  console.log(`  ${realistResult.name}: ${realistResult.vote.split('\n')[0]}`);

  // Synthesis call
  const synthesisInput = `CONSUMER ADVOCATE VOTE:
${advocateResult.vote}

TECHNICAL PURIST VOTE:
${puristResult.vote}

MARKET REALIST VOTE:
${realistResult.vote}

Produce the binding ruling now.`;

  const synthesisResponse = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    system: SYNTHESIS_PROMPT,
    messages: [{ role: 'user', content: synthesisInput }]
  });

  const ruling = synthesisResponse.content[0].text;
  console.log(`[COUNCIL] Ruling: ${ruling.split('\n')[0]}`);

  return {
    votes: { advocateResult, puristResult, realistResult },
    ruling
  };
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
    console.log('[COUNCIL] ✅ Auto-resolved — pipeline continues.');

    await sendTelegram(
      `✅ *Council Auto-Resolve* — ${productName}\n\nChallenge Bot flagged, auto-resolver cleared it.\n\n[Review session log](file://${logPath})`
    );

    const memoMatch = autoResolveResult.match(/ACTION:([\s\S]+?)(?:\n[A-Z]+:|$)/);
    const memo = memoMatch ? memoMatch[1].trim() : 'Auto-resolved — see council_session.md';
    return { pipeline: 'CONTINUES', memo };
  }

  // ── TIER 2: Council ───────────────────────────────────────────────────────
  const councilResult = await conveneCouncil(
    flagReport, autoResolveResult,
    bot1Output, bot2Output, bot3Output, productName
  );

  sessionLog += `## TIER 2 — COUNCIL VOTES\n\n`;
  sessionLog += `### Consumer Advocate\n${councilResult.votes.advocateResult.vote}\n\n`;
  sessionLog += `### Technical Purist\n${councilResult.votes.puristResult.vote}\n\n`;
  sessionLog += `### Market Realist\n${councilResult.votes.realistResult.vote}\n\n`;
  sessionLog += `## COUNCIL RULING\n${councilResult.ruling}\n\n`;

  const logPath = writeLog(outputDir, 'council_session.md', sessionLog);

  const ruling = councilResult.ruling;
  const rulingLine = ruling.split('\n').find(l => l.startsWith('COUNCIL RULING:')) || '';
  const pipelineLine = ruling.split('\n').find(l => l.startsWith('PIPELINE:')) || '';
  const pipelineContinues = pipelineLine.includes('CONTINUES');

  if (pipelineContinues) {
    console.log('[COUNCIL] ✅ Council resolved — pipeline continues.');
    await sendTelegram(
      `✅ *Council Ruling* — ${productName}\n\n${rulingLine}\n\nPipeline continues. [Review session log](file://${logPath})`
    );
    const memoMatch = ruling.match(/REQUIRED ACTION:([\s\S]+?)(?:\nPIPELINE:|$)/);
    const memo = memoMatch ? memoMatch[1].trim() : 'Council approved — see council_session.md';
    return { pipeline: 'CONTINUES', memo };
  }

  // ── TIER 3: Escalate to Ray ───────────────────────────────────────────────
  console.log('[COUNCIL] ⚠️  Council deadlock or rejection — escalating to Ray.');

  const requiredActionMatch = ruling.match(/REQUIRED ACTION:([\s\S]+?)(?:\nPIPELINE:|$)/);
  const escalationQuestion = requiredActionMatch ? requiredActionMatch[1].trim() : 'See council_session.md';

  await sendTelegram(
    `⚠️ *Council Escalation — Ray needed* — ${productName}\n\n` +
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
