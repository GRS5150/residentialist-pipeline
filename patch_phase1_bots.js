/**
 * Phase 1: Bot 2 Service Reputation + Council Bot Consumer Impact Test
 * Run on Mac Mini: node patch_phase1_bots.js
 */
const fs = require('fs');
const path = require('path');

// ── Bot 2: Service Reputation Instruction ───────────────────────────────────
const ORCH_PATH = path.join(__dirname, 'bot_orchestrator_v3.js');
let orchCode = fs.readFileSync(ORCH_PATH, 'utf-8');

const BOT2_SERVICE_INSTRUCTION = `

When expert sources or curated evidence report consistent patterns of warranty claim difficulties, service responsiveness problems, or post-sale support failures for a brand, weight this evidence in the 1C Professional Consensus evaluation. Service reputation is a Professional Consensus signal, not a Durability signal. A brand with documented patterns of claim denials or service delays should see that reflected in Professional Consensus, even if the product itself tests well structurally.`;

// Find where Bot 2 prompt is constructed and add the instruction
// Look for bot2 prompt or evaluator prompt
const bot2PromptMarkers = [
  'bot2_prompt',
  'evaluator_prompt', 
  'BOT2_SYSTEM',
  'evaluatorPrompt',
  'bot 2',
  'evaluator system'
];

let bot2Patched = false;
for (const marker of bot2PromptMarkers) {
  const idx = orchCode.toLowerCase().indexOf(marker.toLowerCase());
  if (idx > 0) {
    // Find the next template literal or string that contains the prompt
    const searchArea = orchCode.substring(idx, idx + 2000);
    // Add instruction right after the first occurrence of this marker's string definition
    const promptEndIdx = searchArea.indexOf('`;');
    if (promptEndIdx > 0) {
      const insertPos = idx + promptEndIdx;
      orchCode = orchCode.slice(0, insertPos) + BOT2_SERVICE_INSTRUCTION + orchCode.slice(insertPos);
      bot2Patched = true;
      console.log(`[BOT2 ✓] Added service reputation instruction near "${marker}"`);
      break;
    }
  }
}

if (!bot2Patched) {
  // Fallback: add as a module-level constant for manual integration
  orchCode = `// Phase 1: Bot 2 Service Reputation Instruction
const BOT2_SERVICE_REPUTATION_INSTRUCTION = \`${BOT2_SERVICE_INSTRUCTION}\`;
` + orchCode;
  console.log('[BOT2 ~] Added as constant (needs manual integration into prompt)');
}

fs.writeFileSync(ORCH_PATH, orchCode);

// ── Council Bot: Consumer Impact Test Validation ────────────────────────────
const COUNCIL_PATH = path.join(__dirname, 'council.js');
if (fs.existsSync(COUNCIL_PATH)) {
  let councilCode = fs.readFileSync(COUNCIL_PATH, 'utf-8');
  
  // Add validation function at the end of the file
  const validationCode = `

// ── Phase 1: Consumer Impact Test Validation ────────────────────────────────
function validateBuyerConsideration(consideration) {
  const validGates = [1, 2, 3];
  const gateNames = { 1: 'Unexpected Cost', 2: 'Time-Sensitive Risk', 3: 'Contradicts Expectation' };

  if (!consideration.gate_passed || !validGates.includes(consideration.gate_passed)) {
    return { valid: false, reason: 'No gate specified or invalid gate' };
  }

  if (!consideration.text || consideration.text.length > 200) {
    return { valid: false, reason: 'Text missing or exceeds 200 characters' };
  }

  return { valid: true, gate_name: gateNames[consideration.gate_passed] };
}

// Load pain points index
function loadPainPoints(category) {
  const ppPath = require('path').join(__dirname, 'pain_points', category + '_pain_points.json');
  try {
    return JSON.parse(require('fs').readFileSync(ppPath, 'utf-8'));
  } catch(e) {
    console.log('[COUNCIL] No pain points file for category:', category);
    return null;
  }
}

if (typeof module !== 'undefined') {
  module.exports = { ...module.exports, validateBuyerConsideration, loadPainPoints };
}
`;

  // Check if already patched
  if (!councilCode.includes('validateBuyerConsideration')) {
    councilCode += validationCode;
    fs.writeFileSync(COUNCIL_PATH, councilCode);
    console.log('[COUNCIL ✓] Added validateBuyerConsideration and loadPainPoints');
  } else {
    console.log('[COUNCIL ~] Already patched');
  }
} else {
  console.log('[COUNCIL ✗] council.js not found at', COUNCIL_PATH);
}

console.log('\n[DONE] Bot patches complete');
