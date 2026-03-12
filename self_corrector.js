const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
require('dotenv').config({path: '/Users/Residentialist/.openclaw/workspace/residentialist/.env'});
const client = new Anthropic({apiKey: process.env.ANTHROPIC_API_KEY});
const KNOWLEDGE_BASE = '/Users/Residentialist/.openclaw/workspace/residentialist/knowledge';
const MEMO_INDEX = `${KNOWLEDGE_BASE}/system/correction_memo_index.md`;
const PROMPT = `You are the Residentialist Self-Corrector. A Challenge Bot FLAG has been triggered. Determine if it can be resolved by writing a correction memo, or requires human escalation.
MEMO CAN FIX: manufacturer non-disclosure of standard industry specs confirmed by implication (Energy Star cert, litigation record, price tier); historical data scoping errors.
REQUIRES ESCALATION: material hierarchy ceiling violations; calibration conflicts without documented justification; Bot 2 fabricated facts not in Bot 1; structural rubric disagreements.
If memo resolves all items, output starting with exactly: # MEMO: [Product] [Config] — Correction Memo
Include: Date, Status, Triggered by, FLAGGED ITEMS RESOLVED section, PRE-APPROVED ASSUMPTIONS table (Spec | Evidence Basis | Confidence), PIPELINE INSTRUCTION.
If any item requires escalation, output starting with exactly: ESCALATE:
Followed by clear explanation of what needs human review.`;
async function selfCorrect(productName, config, category, bot1Output, bot2Output, challengeOutput) {
  console.log(`[SELF-CORRECTOR] Analyzing FLAG for ${productName} (${config})...`);
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514', max_tokens: 4000, system: PROMPT,
    messages: [{ role: 'user', content: `PRODUCT: ${productName}\nCONFIG: ${config}\nCATEGORY: ${category}\n\nCHALLENGE BOT FLAG:\n${challengeOutput}\n\nBOT 1 RESEARCH:\n${bot1Output}\n\nBOT 2 SCORES (excerpt):\n${bot2Output.slice(0,3000)}` }]
  });
  const output = response.content.filter(b => b.type === 'text').map(b => b.text).join('\n');
  if (output.trimStart().startsWith('ESCALATE:')) {
    return { action: 'escalate', reason: output.replace(/^ESCALATE:\s*/i,'').trim() };
  }
  if (output.includes('# MEMO:')) {
    const memoContent = output.slice(output.indexOf('# MEMO:'));
    const slug = productName.toLowerCase().replace(/\s+/g,'_').replace(/[^a-z0-9_]/g,'');
    const filename = `${slug}_${config.toLowerCase()}_correction_memo.md`;
    const memoPath = `${KNOWLEDGE_BASE}/${category}/${filename}`;
    fs.writeFileSync(memoPath, memoContent);
    console.log(`[SELF-CORRECTOR] Memo written: ${memoPath}`);
    updateIndex(productName, config, category, filename, memoContent);
    return { action: 'memo_written', memoPath, memoContent, filename };
  }
  return { action: 'escalate', reason: 'Unrecognized format from self-corrector.' };
}
function updateIndex(productName, config, category, filename, memoContent) {
  const date = new Date().toISOString().slice(0,10);
  const rows = memoContent.match(/\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|/g) || [];
  const assumptions = rows.slice(2).map(r => r.split('|').map(c=>c.trim()).filter(Boolean)[0]).filter(a => a && a !== '---');
  const entry = `\n## ${productName} (${config}) — ${date}\n- **Category:** ${category}\n- **File:** \`${filename}\`\n- **Pre-approved specs:** ${assumptions.length > 0 ? assumptions.join(', ') : 'none'}\n- **Source:** Auto-generated\n`;
  if (!fs.existsSync(MEMO_INDEX)) {
    fs.writeFileSync(MEMO_INDEX, `# RESIDENTIALIST — CORRECTION MEMO INDEX\n\nAll product-specific correction memos and pre-approved assumptions.\n\n---\n` + entry);
  } else {
    fs.appendFileSync(MEMO_INDEX, entry);
  }
  console.log(`[SELF-CORRECTOR] Index updated.`);
}
module.exports = { selfCorrect };
