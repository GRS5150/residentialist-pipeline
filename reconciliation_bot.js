/**
 * THE RESIDENTIALIST — Reconciliation Bot (Bot 5) v3
 *
 * Runs after Bot 2 (Evaluator) and before the FLAG GATE.
 * Compares Bot 1 (Consensus/research) and Bot 2 (Evaluator/scoring) outputs.
 *
 * If they agree: tags evaluation HIGH CONFIDENCE, pipeline continues.
 *
 * If they disagree: runs exactly 1 round of structured debate.
 *   Bot 1 perspective challenges Bot 2 scoring.
 *   Bot 2 perspective defends or revises.
 *   Synthesis determines outcome.
 *
 * If debate resolves: produces a RECONCILED output with confidence tag.
 * If debate does not resolve in 1 round: escalates to Council.
 *
 * v2 changes (Phase 3):
 *   - Capped at 1 debate round (was 3). One focused pass is more reliable
 *     than 3 rounds of incremental revision.
 *   - If 1 round can't resolve it, a human should see it anyway.
 *   - Max API calls: 4 (1 detector + 1 Bot1 advocate + 1 Bot2 advocate + 1 synthesis)
 *     Down from worst-case 10 (1 detector + 3 rounds × 3 calls).
 *
 * v3 changes (Phase 7b — March 15, 2026):
 *   - SCOPE NARROWING: Excludes deterministic subscores from debate.
 *     Since Phase 7, five subscores are computed by deterministic formulas
 *     that override Bot 2's LLM output. Debating these is pointless — the
 *     deterministic scorer will replace whatever Bot 2 wrote anyway.
 *     Bot 5 now only debates subscores Bot 2 still controls.
 *   - Root cause: Before v3, the same product would randomly HALT or PASS
 *     across runs because Bot 5 would sometimes flag deterministic subscores
 *     as "disagreements" and sometimes not — pure LLM variance.
 *
 * v3.1 changes (Phase 9 — March 16, 2026):
 *   - BLANKET EXCLUSION: Material hierarchy ceiling violations and axis
 *     weight arithmetic are now excluded from debate regardless of which
 *     subscore they surface in. v3 excluded by subscore number (1A,1B,etc)
 *     but Haiku would still flag ceiling logic when it appeared in commentary
 *     about in-scope subscores like 2A Frame Longevity. This caused false
 *     escalations (e.g., Alpen batch re-score). The fix teaches the detector
 *     that ceiling enforcement is deterministic system territory by concept,
 *     not just by subscore label.
 */

const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
require('dotenv').config({ path: '/Users/Residentialist/.openclaw/workspace/residentialist/.env' });

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── DISAGREEMENT DETECTOR ────────────────────────────────────────────────────

const DISAGREEMENT_DETECTOR_PROMPT = `You are the Residentialist Reconciliation Bot. Your first job is to compare the research output from Bot 1 (Consensus) and the scoring output from Bot 2 (Evaluator) and identify any genuine disagreements.

CRITICAL — SCOPE RESTRICTION:
The following subscores are computed by a DETERMINISTIC FORMULA after Bot 2 runs.
Bot 2's scores for these are OVERRIDDEN and DO NOT appear in the final output.
You MUST NOT flag disagreements about these subscores — they are out of scope:

  EXCLUDED FROM DEBATE (deterministic overrides):
  - 1A Component Quality (formula-scored from material class + spec data)
  - 1B Manufacturing Quality (formula-scored from complaint patterns)
  - 1C Professional Consensus (formula-scored from evidence file pool analysis)
  - 2B Materials/Durability (formula-scored from material class ceiling tables)
  - 2C Market Quality / Warranty (formula-scored from complaint data + warranty terms)

  IN SCOPE FOR DEBATE (Bot 2 still controls these):
  - 2A Frame Longevity (Bot 2 judgment on expected lifespan)
  - 3A Thermal Performance (Bot 2 scoring of U-factor/SHGC data)
  - 3B Structural Performance (Bot 2 scoring of DP rating, AAMA certification)
  - 3C Air/Water/Sound Performance (Bot 2 scoring of infiltration, water resistance)
  - Material Safety (Bot 3 handles this — not part of Bot 2 debate)

Only flag disagreements about IN SCOPE subscores. If all disagreements fall in the EXCLUDED list, output VERDICT: AGREEMENT.

A GENUINE DISAGREEMENT exists when:
- Bot 2 scores an IN SCOPE subscore positively but Bot 1 found no supporting data for it
- Bot 2 ignores or underweights a finding that Bot 1 explicitly flagged as significant (for IN SCOPE subscores)
- Bot 2 treats a spec as confirmed that Bot 1 listed as UNKNOWN or NOT DISCLOSED (for IN SCOPE subscores)
- Bot 2 draws a conclusion that contradicts a source Bot 1 cited (for IN SCOPE subscores)
- Bot 1 found a RED or YELLOW finding relevant to an IN SCOPE subscore that Bot 2 did not address

NOT a disagreement:
- Bot 2 applying rubric judgment to data Bot 1 provided (this is expected)
- Bot 2 scoring at midpoint for undisclosed specs Bot 1 could not find (this is correct methodology)
- Minor phrasing differences that don't affect scores
- ANY disagreement about component quality, manufacturing quality, professional consensus, materials/durability, or market quality (these are deterministic — out of scope)

BLANKET EXCLUSIONS — DETERMINISTIC SYSTEM TERRITORY:
The following logic is ALWAYS handled by the deterministic scoring system, even when it surfaces in commentary about in-scope subscores. NEVER flag these as disagreements regardless of context:
- Material hierarchy ceiling violations (e.g., vinyl capped at X, fiberglass capped at Y)
- Material class ceiling tables and their application to any subscore
- Axis weight arithmetic (the 35/35/30 weighting formula and its outputs)
- Any score being capped or constrained because of material classification
If Bot 2 mentions a material ceiling in the context of an in-scope subscore (like 2A Frame Longevity), that ceiling enforcement is still deterministic territory — do NOT flag it.

Output format:

RECONCILIATION ASSESSMENT
Product: [name]

AGREEMENT AREAS: [list subscore areas where Bot 1 data and Bot 2 scoring are consistent]

DISAGREEMENT AREAS: [list each genuine IN SCOPE disagreement with specific reference to Bot 1 finding vs Bot 2 scoring decision, or state "None — all differences fall within deterministic override scope"]

VERDICT: [AGREEMENT — no reconciliation needed] or [DISAGREEMENT — reconciliation required]

If DISAGREEMENT: number each disagreement item clearly (1, 2, 3...) for debate reference.`;

// ─── DEBATE PROMPTS ───────────────────────────────────────────────────────────

const BOT1_ADVOCATE_PROMPT = `You are speaking from the perspective of the Residentialist Consensus Bot (Bot 1). You conducted the web research on this product. You are now in a structured debate with the Evaluator Bot (Bot 2) about specific disagreements in how the research was used.

IMPORTANT: This debate is ONLY about performance subscores (frame longevity, thermal, structural, air/water/sound). Component quality, manufacturing quality, professional consensus, materials/durability, and market quality are scored by deterministic formulas and are NOT part of this debate.

Your job: For each disagreement item, explain what the research actually found and why you believe the Evaluator Bot either missed it, misapplied it, or drew an unsupported conclusion. Be specific — cite the exact source or finding from your research output.

You are not trying to score the product. You are defending the integrity of the research findings.

Be direct and specific. Reference exact findings. Do not hedge.`;

const BOT2_ADVOCATE_PROMPT = `You are speaking from the perspective of the Residentialist Evaluator Bot (Bot 2). You scored this product using the deterministic rubric. You are now in a structured debate with the Consensus Bot (Bot 1) about specific disagreements.

IMPORTANT: This debate is ONLY about performance subscores (frame longevity, thermal, structural, air/water/sound). Component quality, manufacturing quality, professional consensus, materials/durability, and market quality are scored by deterministic formulas and are NOT part of this debate.

Your job: For each disagreement item, explain your scoring decision — either defend it with rubric justification, or acknowledge that Bot 1's research finding should have changed your score and state what the corrected score would be.

If you are revising a score, state: REVISION: [subscore] changes from [old] to [new] because [reason].
If you are defending a score, state: DEFENDED: [subscore] stands because [rubric justification].

Be specific. Reference the rubric rules that governed your decision.`;

const SYNTHESIS_PROMPT = `You are the Residentialist Reconciliation Synthesizer. You have just read a structured debate between the Consensus Bot (Bot 1) and the Evaluator Bot (Bot 2) over specific disagreements in a product evaluation.

IMPORTANT: This debate covers ONLY performance subscores (frame longevity, thermal, structural, air/water/sound). If any item references component quality, manufacturing quality, professional consensus, materials/durability, or market quality, mark it RESOLVED immediately — those are deterministic overrides, not debatable.

Your job: Determine whether the debate has resolved the disagreements.

For each disagreement item:
- If Bot 2 issued a REVISION: accept it. State the corrected subscore.
- If Bot 2 DEFENDED and the defense is rubric-sound: mark resolved, score stands.
- If Bot 2 DEFENDED but the defense contradicts the rubric or ignores documented evidence: mark UNRESOLVED.
- If the item is about a deterministic subscore (1A, 1B, 1C, 2B, 2C): mark RESOLVED — out of scope.
- If the item involves material hierarchy ceiling logic (material class caps, ceiling table enforcement) regardless of which subscore it references: mark RESOLVED — deterministic system territory.

Output format:

RECONCILIATION SYNTHESIS

ITEM 1: [RESOLVED — score stands / RESOLVED — score revised to X.X / UNRESOLVED — reason]
ITEM 2: [RESOLVED — score stands / RESOLVED — score revised to X.X / UNRESOLVED — reason]
[continue for all items]

OVERALL: [RECONCILED — all items resolved] or [UNRESOLVED — escalating to Council]

If RECONCILED: state the final confidence tag (HIGH CONFIDENCE if full agreement, RECONCILED if resolved through debate).
If any items UNRESOLVED: list them clearly for Council escalation.`;

// ─── DEBATE ENGINE (single round) ─────────────────────────────────────────────

async function runDebateRound(disagreements, bot1Output, bot2Output, productName) {
  console.log(`[RECONCILIATION] Debate round 1 (of 1)...`);

  const context = `PRODUCT: ${productName}\n\nDISAGREEMENTS TO DEBATE:\n${disagreements}\n\nBOT 1 RESEARCH OUTPUT (source of truth for findings):\n${bot1Output.slice(0, 5000)}\n\nBOT 2 EVALUATOR OUTPUT (source of truth for scoring decisions):\n${bot2Output.slice(0, 5000)}`;

  // Bot 1 perspective
  const bot1Response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2500,
    system: [{ type: 'text', text: BOT1_ADVOCATE_PROMPT, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: `${context}\n\nPresent your case for each disagreement item now.` }]
  });
  const bot1Argument = bot1Response.content[0].text;

  // Bot 2 perspective — sees Bot 1's argument
  const bot2Response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2500,
    system: [{ type: 'text', text: BOT2_ADVOCATE_PROMPT, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: `${context}\n\nBot 1 has made the following arguments:\n\n${bot1Argument}\n\nRespond to each point now.` }]
  });
  const bot2Argument = bot2Response.content[0].text;

  // Synthesis
  const synthResponse = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1000,
    system: [{ type: 'text', text: SYNTHESIS_PROMPT, cache_control: { type: 'ephemeral' } }],
    messages: [{
      role: 'user',
      content: `${context}\n\nDEBATE:\n\nBot 1 argued:\n${bot1Argument}\n\nBot 2 responded:\n${bot2Argument}\n\nSynthesize now.`
    }]
  });
  const synthesis = synthResponse.content[0].text;

  return {
    bot1Argument,
    bot2Argument,
    synthesis,
    transcript: `## ROUND 1\n\n### Bot 1 (Consensus) Argues:\n${bot1Argument}\n\n### Bot 2 (Evaluator) Responds:\n${bot2Argument}\n\n### Synthesis:\n${synthesis}`
  };
}

// ─── MAIN RECONCILIATION FUNCTION ─────────────────────────────────────────────

async function runReconciliationBot(bot1Output, bot2Output, productName, outputDir) {
  console.log(`\n[RECONCILIATION] Starting Bot 5 (v3) for: ${productName}`);

  // Step 1: Detect disagreements
  const detectorResponse = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1500,
    system: [{ type: 'text', text: DISAGREEMENT_DETECTOR_PROMPT, cache_control: { type: 'ephemeral' } }],
    messages: [{
      role: 'user',
      content: `PRODUCT: ${productName}\n\nBOT 1 OUTPUT:\n${bot1Output.slice(0, 6000)}\n\nBOT 2 OUTPUT:\n${bot2Output.slice(0, 6000)}\n\nAssess now.`
    }]
  });

  const assessment = detectorResponse.content[0].text;
  console.log(`[RECONCILIATION] Assessment: ${assessment.split('\n').find(l => l.startsWith('VERDICT')) || 'see output'}`);

  // If no disagreements, tag HIGH CONFIDENCE and exit
  const assessLower = assessment.toLowerCase();
  if (assessLower.includes('verdict: agreement') || assessLower.includes('verdict:** agreement') || (assessLower.includes('no genuine disagreement') && !assessLower.includes('disagreement areas:'))) {
    console.log('[RECONCILIATION] No in-scope disagreements found — HIGH CONFIDENCE tag applied.');
    const result = {
      status: 'AGREEMENT',
      confidenceTag: 'HIGH CONFIDENCE',
      assessment,
      debateTranscript: null
    };
    fs.writeFileSync(`${outputDir}/${productName.toLowerCase().replace(/\s+/g, '_')}_bot5_reconciliation.md`,
      `# Reconciliation Bot Report (v3)\nProduct: ${productName}\nStatus: HIGH CONFIDENCE\nScope: Performance subscores only (deterministic subscores excluded)\n\n${assessment}`
    );
    return result;
  }

  // Extract disagreement items for debate
  // Robust extraction: handle multiple heading formats (## DISAGREEMENT AREAS, DISAGREEMENT AREAS:, **DISAGREEMENT, etc.)
  let daIdx = assessment.search(/#{0,3}\s*\*{0,2}\s*DISAGREEMENT/i);
  if (daIdx === -1) {
    console.log("[RECONCILIATION] WARN: Could not find DISAGREEMENT heading — using second half of assessment");
    daIdx = Math.floor(assessment.length / 2);
  }
  const disagreementBlock = assessment.slice(daIdx);

  // Step 2: Run exactly 1 debate round
  const debateResult = await runDebateRound(
    disagreementBlock, bot1Output, bot2Output, productName
  );

  const fullTranscript = `# Reconciliation Debate Transcript (v3)\nProduct: ${productName}\nScope: Performance subscores only (1A, 1B, 1C, 2B, 2C excluded — deterministic)\n\n## INITIAL ASSESSMENT\n${assessment}\n\n${debateResult.transcript}\n\n## FINAL SYNTHESIS\n${debateResult.synthesis}`;

  // Save full transcript
  const transcriptPath = `${outputDir}/${productName.toLowerCase().replace(/\s+/g, '_')}_bot5_reconciliation.md`;
  fs.writeFileSync(transcriptPath, fullTranscript);

  const synthLower = debateResult.synthesis.toLowerCase();
  const resolved = synthLower.includes('overall: reconciled') ||
                   synthLower.includes('overall:** reconciled') ||
                   synthLower.includes('status**: **reconciled') ||
                   synthLower.includes('status: reconciled') ||
                   (synthLower.includes('reconciled') && !synthLower.includes('unresolved'));

  if (resolved) {
    console.log(`[RECONCILIATION] Resolved in 1 round.`);
    const revisions = debateResult.synthesis.match(/REVISION:.*$/gm) || [];
    return {
      status: 'RECONCILED',
      confidenceTag: 'RECONCILED',
      revisions,
      transcriptPath,
      finalSynthesis: debateResult.synthesis
    };
  }

  // Not resolved in 1 round — escalate to Council
  console.log('[RECONCILIATION] 1 round exhausted — escalating unresolved items to Council.');
  const unresolvedItems = debateResult.synthesis
    .split('\n')
    .filter(l => l.includes('UNRESOLVED'))
    .join('\n');

  return {
    status: 'UNRESOLVED',
    confidenceTag: 'COUNCIL REQUIRED',
    unresolvedItems,
    transcriptPath,
    finalSynthesis: debateResult.synthesis
  };
}

module.exports = { runReconciliationBot };
