/**
 * THE RESIDENTIALIST — Bot Orchestrator
 * Sequences Bot 1 (Consensus) → Bot 2 (Evaluator) → Bot 3 (Material Safety) → Bot 4 (Challenge)
 * Halts pipeline at any FLAG from Challenge Bot.
 *
 * Usage:
 *   node bot_orchestrator.js <product_name> <config> <research_file_1> [research_file_2] ...
 *
 * Example:
 *   node bot_orchestrator.js "Marvin Integrity DH" DH ./inputs/marvin_integrity_research.md
 *
 * Outputs to: ./outputs/<product_slug>_pipeline_<timestamp>/
 */

const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '/home/ubuntu/.openclaw/workspace/residentialist/.env' });

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── KNOWLEDGE FILES ──────────────────────────────────────────────────────────
const KNOWLEDGE_BASE_DIR = '/home/ubuntu/.openclaw/workspace/residentialist/knowledge/windows';

function loadKnowledgeFiles() {
  const files = {};
  try {
    const entries = fs.readdirSync(KNOWLEDGE_BASE_DIR);
    for (const entry of entries) {
      const fullPath = path.join(KNOWLEDGE_BASE_DIR, entry);
      files[entry] = fs.readFileSync(fullPath, 'utf8');
    }
    console.log(`[ORCHESTRATOR] Loaded ${Object.keys(files).length} knowledge file(s): ${Object.keys(files).join(', ')}`);
  } catch (err) {
    console.error(`[ORCHESTRATOR] Warning: Could not load knowledge files: ${err.message}`);
  }
  return files;
}

// ─── BOT SYSTEM PROMPTS ───────────────────────────────────────────────────────

const BOT1_CONSENSUS_PROMPT = `You are The Residentialist Consensus Bot (Bot 1). Your job is to synthesize all available research into a structured findings document for the Evaluator Bot. You do not score. You do not assign grades. You identify what is confirmed, what is unknown, and what requires a flag.

Your output must be a structured markdown document with these sections:
1. PRODUCT OVERVIEW — manufacturer, material class, configuration type, country of origin
2. CONFIRMED FINDINGS — every spec, certification, test result, or expert opinion with its source cited
3. UNKNOWN / NOT DISCLOSED — every spec that could not be confirmed from any available source
4. RED FINDINGS — documented failure patterns, litigation, safety concerns (cite source and date)
5. YELLOW FINDINGS — ambiguities, single-source claims, unverified specs (explain why flagged)
6. CONFIDENCE ASSESSMENT — High / Moderate / Low, with rationale

Source citation format: (Source Name, Year/Date, URL or description if no URL)
Never score. Never grade. Leave all scoring to Bot 2.`;

const BOT2_EVALUATOR_PROMPT = `You are The Residentialist Evaluator Bot (Bot 2). Your job is to score a product against the Residentialist rubric using the structured findings from Bot 1. Show all math explicitly. Never score a component you cannot source.

SCORING STRUCTURE:
- Axis 1: Quality (1/3 of Overall) — 1A Materials Quality (35%), 1B Manufacturing Quality (35%), 1C Professional Consensus (30%)
- Axis 2: Durability (1/3 of Overall) — 2A Frame Longevity (37.5%), 2B Materials Durability (37.5%), 2C Repairability & Support (25%)
- Axis 3: Performance (1/3 of Overall) — 3A Thermal (35%), 3B Structural (25%), 3C Air & Water (40%)
- Overall = (Axis 1 + Axis 2 + Axis 3) / 3

GRADE SCALE: A+ (9.5-10) | A (9.0-9.4) | A- (8.5-8.9) | B+ (8.0-8.4) | B (7.5-7.9) | B- (7.0-7.4) | C+ (6.5-6.9) | C (6.0-6.4)

MATERIAL HIERARCHY — 2B BASE SCORES (base scores, not ceilings — adjustments operate above AND below the base):
- Pultruded fiberglass (Ultrex/equivalent): base 9
- Aluminum-clad wood (extruded aluminum): base 8
- Aluminum-clad wood (roll-form aluminum): base 7
- Vinyl-clad wood: base 7
- Composite/proprietary (Fibrex/equivalent): base 6. Max documented adjustment: +1 for published composition/longevity data. Net 2B cannot exceed 7.
- Vinyl: base 5
- Aluminum (non-clad): base 5
- Adjustment always requires independent citation — manufacturer claim alone is insufficient.
- Tier overlap is intentional: a well-documented aluminum-clad product can reach the same net 2B as a baseline fiberglass product.

CRITICAL RULES:
1. Every score must cite a source. Unknown = 5 with flag.
2. No double-counting — each concern scores in ONE axis only.
3. Professional Consensus (1C) hard ceiling: 7.5.
4. Show all arithmetic for every weighted calculation.
5. Score the standard production configuration, not premium upgrade options.
6. Composite/Fibrex net 2B ceiling = 7. Show base + adjustments explicitly.`;

const BOT3_MATERIAL_SAFETY_PROMPT = `You are The Residentialist Material Safety Bot (Bot 3). You evaluate health and toxicity risk from the product's materials during and after installation. You score on a 0-10 scale. Your score is published separately — it is never averaged into Quality, Durability, or Performance.

SCORE ANCHORS:
- 9.5-10: Fully certified (ILFI Declare + Greenguard Gold or equivalent), no credible flags, all ingredients disclosed
- 8.5-9.4: Partial certification (Greenguard Gold but no Declare), no confirmed concerns
- 7.0-8.4: Uncertified but clean materials (all-metal, inorganic, no volatile adhesives or foam)
- 5.0-6.9: Uncertified with moderate concern (vinyl/PVC, foam core, adhesive-dependent assembly, unconfirmed coatings)
- Below 5.0: Confirmed harmful substance, documented exposure pathway, or known toxicity finding

SOURCE HIERARCHY:
- Tier 1: ILFI Declare database, PHI materials list, peer-reviewed consumer-exposure health studies
- Tier 2: Greenguard Gold, UL SPOT, NSF, REACH documentation
- Tier 3 (no score weight): Manufacturer claims, Prop 65 (noise), VinylPlus

OUTPUT: Score (X.X/10), grade, score rationale, any flags with source citations, and a one-sentence buyer note.`;

// ─── BOT RUNNER ───────────────────────────────────────────────────────────────

async function runBot(botName, systemPrompt, userMessage, model) {
  console.log(`\n[ORCHESTRATOR] Running ${botName}...`);
  const response = await client.messages.create({
    model: model || 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }]
  });
  const output = response.content[0].text;
  console.log(`[ORCHESTRATOR] ${botName} complete. (~${output.length} chars)`);
  return output;
}

// ─── CHALLENGE BOT (Bot 4) ────────────────────────────────────────────────────

const { runChallengeBot } = require('./challenge_bot_v2');

// ─── MAIN PIPELINE ────────────────────────────────────────────────────────────

async function runPipeline(productName, config, researchFiles) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const productSlug = productName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  const outputDir = `/home/ubuntu/.openclaw/workspace/residentialist/outputs/${productSlug}_${timestamp}`;

  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`\n[ORCHESTRATOR] ========================================`);
  console.log(`[ORCHESTRATOR] PIPELINE START: ${productName} (${config})`);
  console.log(`[ORCHESTRATOR] Output dir: ${outputDir}`);
  console.log(`[ORCHESTRATOR] ========================================`);

  // Load research files
  let researchContent = '';
  for (const file of researchFiles) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      researchContent += `\n\n--- SOURCE FILE: ${path.basename(file)} ---\n${content}`;
      console.log(`[ORCHESTRATOR] Loaded: ${file}`);
    } catch (err) {
      console.error(`[ORCHESTRATOR] WARNING: Could not load ${file}: ${err.message}`);
    }
  }

  if (!researchContent.trim()) {
    console.error('[ORCHESTRATOR] ABORT: No research content loaded.');
    process.exit(1);
  }

  // Load knowledge files
  const knowledge = loadKnowledgeFiles();
  const knowledgeContent = Object.entries(knowledge)
    .map(([name, content]) => `--- KNOWLEDGE FILE: ${name} ---\n${content}`)
    .join('\n\n');

  // ── BOT 1: Consensus ──────────────────────────────────────────────────────
  const bot1Input = `PRODUCT: ${productName}\nCONFIGURATION: ${config}\n\nKNOWLEDGE BASE:\n${knowledgeContent}\n\nRESEARCH INPUTS:\n${researchContent}\n\nSynthesize all findings now.`;
  const bot1Output = await runBot('Bot 1 (Consensus)', BOT1_CONSENSUS_PROMPT, bot1Input, 'claude-sonnet-4-20250514');
  fs.writeFileSync(`${outputDir}/${productSlug}_bot1_consensus.md`, bot1Output);

  // ── BOT 2: Evaluator ──────────────────────────────────────────────────────
  const bot2Input = `PRODUCT: ${productName}\nCONFIGURATION: ${config}\n\nKNOWLEDGE BASE:\n${knowledgeContent}\n\nBOT 1 CONSENSUS FINDINGS:\n${bot1Output}\n\nORIGINAL RESEARCH (for source verification):\n${researchContent}\n\nScore this product now. Show all math.`;
  const bot2Output = await runBot('Bot 2 (Evaluator)', BOT2_EVALUATOR_PROMPT, bot2Input, 'claude-sonnet-4-20250514');
  fs.writeFileSync(`${outputDir}/${productSlug}_bot2_evaluator.md`, bot2Output);

  // ── BOT 3: Material Safety ────────────────────────────────────────────────
  const bot3Input = `PRODUCT: ${productName}\nCONFIGURATION: ${config}\n\nBOT 1 FINDINGS (for material identification):\n${bot1Output}\n\nORIGINAL RESEARCH:\n${researchContent}\n\nEvaluate material safety now.`;
  const bot3Output = await runBot('Bot 3 (Material Safety)', BOT3_MATERIAL_SAFETY_PROMPT, bot3Input, 'claude-haiku-4-5-20251001');
  fs.writeFileSync(`${outputDir}/${productSlug}_bot3_material_safety.md`, bot3Output);

  // ── BOT 4: Challenge Bot ──────────────────────────────────────────────────
  console.log('\n[ORCHESTRATOR] Running Bot 4 (Challenge Bot)...');
  const challengeResult = await runChallengeBot(bot1Output, bot2Output, bot3Output, productName);
  fs.writeFileSync(`${outputDir}/${productSlug}_bot4_challenge.md`, challengeResult);

  // ── FLAG GATE ─────────────────────────────────────────────────────────────
  const isFlagged = challengeResult.includes('VERDICT: FLAG') || challengeResult.includes('FLAG — pipeline halted');

  if (isFlagged) {
    console.log('\n[ORCHESTRATOR] ⚠️  PIPELINE HALTED — Challenge Bot returned FLAG');
    console.log(`[ORCHESTRATOR] Review: ${outputDir}/${productSlug}_bot4_challenge.md`);
    console.log('[ORCHESTRATOR] Resolve all flagged issues, then re-run or accept with Council approval.');
    fs.writeFileSync(`${outputDir}/PIPELINE_STATUS.txt`,
      `STATUS: HALTED\nPRODUCT: ${productName}\nCONFIG: ${config}\nTIMESTAMP: ${timestamp}\nREASON: Challenge Bot FLAG\nSee: ${productSlug}_bot4_challenge.md`
    );
    return { status: 'FLAGGED', outputDir, challengeResult };
  }

  // ── PASS ──────────────────────────────────────────────────────────────────
  console.log('\n[ORCHESTRATOR] ✅ Challenge Bot PASS — pipeline complete.');
  console.log(`[ORCHESTRATOR] All outputs saved to: ${outputDir}`);
  fs.writeFileSync(`${outputDir}/PIPELINE_STATUS.txt`,
    `STATUS: PASS\nPRODUCT: ${productName}\nCONFIG: ${config}\nTIMESTAMP: ${timestamp}\nAll four bots completed. Ready for report assembly (Bot 5/6 pending build).`
  );

  console.log(`\n[ORCHESTRATOR] Files:`);
  console.log(`  ${productSlug}_bot1_consensus.md`);
  console.log(`  ${productSlug}_bot2_evaluator.md`);
  console.log(`  ${productSlug}_bot3_material_safety.md`);
  console.log(`  ${productSlug}_bot4_challenge.md`);
  console.log(`  PIPELINE_STATUS.txt`);

  return { status: 'PASS', outputDir, bot1Output, bot2Output, bot3Output, challengeResult };
}

// ─── CLI ENTRY POINT ──────────────────────────────────────────────────────────

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 3) {
    console.log('Usage: node bot_orchestrator.js <product_name> <config> <research_file_1> [research_file_2]...');
    console.log('Example: node bot_orchestrator.js "Marvin Integrity DH" DH ./inputs/marvin_integrity_research.md');
    process.exit(1);
  }
  const productName = args[0];
  const config = args[1];
  const researchFiles = args.slice(2);

  runPipeline(productName, config, researchFiles)
    .then(result => process.exit(result.status === 'PASS' ? 0 : 1))
    .catch(err => { console.error('[ORCHESTRATOR] FATAL:', err); process.exit(1); });
}

module.exports = { runPipeline };
