/**
 * THE RESIDENTIALIST — Reconciliation Bot (Bot 5)
 *
 * Runs after Bot 2 (Evaluator) and before the FLAG GATE.
 * Compares Bot 1 (Consensus/research) and Bot 2 (Evaluator/scoring) outputs.
 *
 * If they agree: tags evaluation HIGH CONFIDENCE, pipeline continues.
 *
 * If they disagree: runs up to 3 rounds of structured debate.
 *   Round 1 — Bot 1 perspective challenges Bot 2 scoring
 *   Round 2 — Bot 2 perspective defends or revises
 *   Round 3 — Synthesis: do they now agree?
 *
 * If debate resolves: produces a RECONCILED output with confidence tag.
 * If debate does not resolve after 3 rounds: escalates to Council.
 *
 * The debate transcript is always saved — the reasoning IS the insight.
 */

const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
require('dotenv').config({ path: '/Users/Residentialist/.openclaw/workspace/residentialist/.env' });

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── DISAGREEMENT DETECTOR ────────────────────────────────────────────────────

const DISAGREEMENT_DETECTOR_PROMPT = `You are the Residentialist Reconciliation Bot. Your first job is to compare the research output from Bot 1 (Consensus) and the scoring output from Bot 2 (Evaluator) and identify any genuine disagreements.

A GENUINE DISAGREEMENT exists when:
- Bot 2 scores a subscore positively but Bot 1 found no supporting data for it
- Bot 2 ignores or underweights a finding that Bot 1 explicitly flagged as significant
- Bot 2 treats a spec as confirmed that Bot 1 listed as UNKNOWN or NOT DISCLOSED
- Bot 2 draws a conclusion that contradicts a source Bot 1 cited
- Bot 1 found a RED or YELLOW finding that Bot 2 did not score or address

NOT a disagreement:
- Bot 2 applying rubric judgment to data Bot 1 provided (this is expected)
- Bot 2 scoring at midpoint for undisclosed specs Bot 1 could not find (this is correct methodology)
- Minor phrasing differences that don't affect scores

Output format:

RECONCILIATION ASSESSMENT
Product: [name]

AGREEMENT AREAS: [list subscore areas where Bot 1 data and Bot 2 scoring are consistent]

DISAGREEMENT AREAS: [list each genuine disagreement with specific reference to Bot 1 finding vs Bot 2 scoring decision]

VERDICT: [AGREEMENT — no reconciliation needed] or [DISAGREEMENT — reconciliation required]

If DISAGREEMENT: number each disagreement item clearly (1, 2, 3...) for debate reference.`;

// ─── DEBATE PROMPTS ───────────────────────────────────────────────────────────

const BOT1_ADVOCATE_PROMPT = `You are speaking from the perspective of the Residentialist Consensus Bot (Bot 1). You conducted the web research on this product. You are now in a structured debate with the Evaluator Bot (Bot 2) about specific disagreements in how the research was used.

Your job: For each disagreement item, explain what the research actually found and why you believe the Evaluator Bot either missed it, misapplied it, or drew an unsupported conclusion. Be specific — cite the exact source or finding from your research output.

You are not trying to score the product. You are defending the integrity of the research findings.

Be direct and specific. Reference exact findings. Do not hedge.`;

const BOT2_ADVOCATE_PROMPT = `You are speaking from the perspective of the Residentialist Evaluator Bot (Bot 2). You scored this product using the deterministic rubric. You are now in a structured debate with the Consensus Bot (Bot 1) about specific disagreements.

Your job: For each disagreement item, explain your scoring decision — either defend it with rubric justification, or acknowledge that Bot 1's research finding should have changed your score and state what the corrected score would be.

If you are revising a score, state: REVISION: [subscore] changes from [old] to [new] because [reason].
If you are defending a score, state: DEFENDED: [subscore] stands because [rubric justification].

Be specific. Reference the rubric rules that governed your decision.`;

const SYNTHESIS_PROMPT = `You are the Residentialist Reconciliation Synthesizer. You have just read a structured debate between the Consensus Bot (Bot 1) and the Evaluator Bot (Bot 2) over specific disagreements in a product evaluation.

Your job: Determine whether the debate has resolved the disagreements.

For each disagreement item:
- If Bot 2 issued a REVISION: accept it. State the corrected subscore.
- If Bot 2 DEFENDED and the defense is rubric-sound: mark resolved, score stands.
- If Bot 2 DEFENDED but the defense contradicts the rubric or ignores documented evidence: mark UNRESOLVED.

Output format:

RECONCILIATION SYNTHESIS — Round [N]

ITEM 1: [RESOLVED — score stands / RESOLVED — score revised to X.X / UNRESOLVED — reason]
ITEM 2: [RESOLVED — score stands / RESOLVED — score revised to X.X / UNRESOLVED — reason]
[continue for all items]

OVERALL: [RECONCILED — all items resolved] or [PARTIAL — N items unresolved, proceeding to next round] or [UNRESOLVED — escalating to Council]

If RECONCILED: state the final confidence tag (HIGH CONFIDENCE if full agreement, RECONCILED if resolved through debate).
If any items UNRESOLVED after round 3: list them clearly for Council escalation.`;

// ─── DEBATE ENGINE ────────────────────────────────────────────────────────────

async function runDebateRound(disagreements, bot1Output, bot2Output, productName, roundNum, priorDebate) {
  console.log(`[RECONCILIATION] Debate round ${roundNum}...`);

  const context = `PRODUCT: ${productName}

DISAGREEMENTS TO DEBATE:
${disagreements}

BOT 1 RESEARCH OUTPUT (source of truth for findings):
${bot1Output.slice(0, 5000)}

BOT 2 EVALUATOR OUTPUT (source of truth for scoring decisions):
${bot2Output.slice(0, 5000)}

${priorDebate ? `PRIOR DEBATE TRANSCRIPT:\n${priorDebate}` : ''}`;

  // Bot 1 perspective
  const bot1Response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1200,
    system: BOT1_ADVOCATE_PROMPT,
    messages: [{ role: 'user', content: `${context}\n\nPresent your case for each disagreement item now. Round ${roundNum}.` }]
  });
  const bot1Argument = bot1Response.content[0].text;

  // Bot 2 perspective — sees Bot 1's argument
  const bot2Response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1200,
    system: BOT2_ADVOCATE_PROMPT,
    messages: [{ role: 'user', content: `${context}\n\nBot 1 has made the following arguments:\n\n${bot1Argument}\n\nRespond to each point now. Round ${roundNum}.` }]
  });
  const bot2Argument = bot2Response.content[0].text;

  // Synthesis
  const synthResponse = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    system: SYNTHESIS_PROMPT,
    messages: [{
      role: 'user',
      content: `${context}\n\nROUND ${roundNum} DEBATE:\n\nBot 1 argued:\n${bot1Argument}\n\nBot 2 responded:\n${bot2Argument}\n\nSynthesize now.`
    }]
  });
  const synthesis = synthResponse.content[0].text;

  return {
    roundNum,
    bot1Argument,
    bot2Argument,
    synthesis,
    transcript: `## ROUND ${roundNum}\n\n### Bot 1 (Consensus) Argues:\n${bot1Argument}\n\n### Bot 2 (Evaluator) Responds:\n${bot2Argument}\n\n### Synthesis:\n${synthesis}`
  };
}

// ─── MAIN RECONCILIATION FUNCTION ─────────────────────────────────────────────

async function runReconciliationBot(bot1Output, bot2Output, productName, outputDir) {
  console.log(`\n[RECONCILIATION] Starting Bot 5 for: ${productName}`);

  // Step 1: Detect disagreements
  const detectorResponse = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    system: DISAGREEMENT_DETECTOR_PROMPT,
    messages: [{
      role: 'user',
      content: `PRODUCT: ${productName}\n\nBOT 1 OUTPUT:\n${bot1Output.slice(0, 6000)}\n\nBOT 2 OUTPUT:\n${bot2Output.slice(0, 6000)}\n\nAssess now.`
    }]
  });

  const assessment = detectorResponse.content[0].text;
  console.log(`[RECONCILIATION] Assessment: ${assessment.split('\n').find(l => l.startsWith('VERDICT')) || 'see output'}`);

  // If no disagreements, tag HIGH CONFIDENCE and exit
  if (assessment.includes('VERDICT: AGREEMENT')) {
    console.log('[RECONCILIATION] No disagreements found — HIGH CONFIDENCE tag applied.');
    const result = {
      status: 'AGREEMENT',
      confidenceTag: 'HIGH CONFIDENCE',
      assessment,
      debateTranscript: null
    };
    fs.writeFileSync(`${outputDir}/${productName.toLowerCase().replace(/\s+/g, '_')}_bot5_reconciliation.md`,
      `# Reconciliation Bot Report\nProduct: ${productName}\nStatus: HIGH CONFIDENCE\n\n${assessment}`
    );
    return result;
  }

  // Extract disagreement items for debate
  const disagreementBlock = assessment.slice(assessment.indexOf('DISAGREEMENT AREAS:'));

  // Step 2: Run up to 3 debate rounds
  let fullTranscript = `# Reconciliation Debate Transcript\nProduct: ${productName}\n\n## INITIAL ASSESSMENT\n${assessment}\n\n`;
  let priorDebate = '';
  let finalSynthesis = '';
  let resolved = false;

  for (let round = 1; round <= 3; round++) {
    const debateResult = await runDebateRound(
      disagreementBlock, bot1Output, bot2Output, productName, round, priorDebate
    );

    fullTranscript += debateResult.transcript + '\n\n';
    priorDebate = fullTranscript;
    finalSynthesis = debateResult.synthesis;

    if (debateResult.synthesis.includes('OVERALL: RECONCILED') || debateResult.synthesis.includes('OVERALL: **RECONCILED')) {
      console.log(`[RECONCILIATION] Resolved in round ${round}.`);
      resolved = true;
      break;
    }

    if (round < 3) {
      console.log(`[RECONCILIATION] Round ${round} incomplete — continuing debate...`);
    } else {
      console.log('[RECONCILIATION] 3 rounds exhausted — escalating unresolved items to Council.');
    }
  }

  // Save full transcript regardless of outcome
  const transcriptPath = `${outputDir}/${productName.toLowerCase().replace(/\s+/g, '_')}_bot5_reconciliation.md`;
  fs.writeFileSync(transcriptPath, fullTranscript + `\n## FINAL SYNTHESIS\n${finalSynthesis}`);

  if (resolved) {
    // Extract any score revisions from synthesis
    const revisions = finalSynthesis.match(/REVISION:.*$/gm) || [];
    return {
      status: 'RECONCILED',
      confidenceTag: 'RECONCILED',
      revisions,
      transcriptPath,
      finalSynthesis
    };
  }

  // Not resolved — extract unresolved items for Council
  const unresolvedItems = finalSynthesis
    .split('\n')
    .filter(l => l.includes('UNRESOLVED'))
    .join('\n');

  return {
    status: 'UNRESOLVED',
    confidenceTag: 'COUNCIL REQUIRED',
    unresolvedItems,
    transcriptPath,
    finalSynthesis
  };
}

module.exports = { runReconciliationBot };
