const { runPipeline } = require('./bot_orchestrator_v2');
const { selfCorrect } = require('./self_corrector');
const https = require('https');
require('dotenv').config({path: '/Users/Residentialist/.openclaw/workspace/residentialist/.env'});
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const MAX_ATTEMPTS = 2;
function sendTelegram(message) {
  return new Promise((resolve) => {
    try {
      const body = JSON.stringify({ chat_id: CHAT_ID, text: message, parse_mode: 'Markdown' });
      const options = { hostname: 'api.telegram.org', path: `/bot${TOKEN}/sendMessage`, method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } };
      const req = https.request(options, (res) => { res.on('data', () => {}); res.on('end', resolve); });
      req.on('error', () => resolve());
      req.write(body); req.end();
    } catch(e) { resolve(); }
  });
}
function extractScore(o) { const m = o.match(/[Oo]verall[:\s*]*(\d+\.\d+)/) || o.match(/(\d+\.\d+)\s*\/\s*10/); return m ? m[1] : '?'; }
function extractGrade(o) { const m = o.match(/[Gg]rade[:\s*]*([A-C][+-]?)/) || o.match(/\b([A-C][+-])\b/); return m ? m[1] : ''; }
function summarizeFlags(o) { return o.split('\n').filter(l => l.includes('FLAG') && l.includes('###')).slice(0,3).map(l => l.replace(/#+\s*/,'').trim()).join('\n'); }
function generateDataConfidence(bot2Output, challengeOutput) {
  const warnMatches = challengeOutput.match(/\*\*WARN\*\*[^\n]*/g) || [];
  const warns = warnMatches.map(w => w.replace(/\*\*/g,'').replace(/^WARN[:\s]*/i,'').trim());
  const undisclosedCount = (challengeOutput.match(/UNDISCLOSED/gi) || []).length;
  let confidence = undisclosedCount > 7 ? 'Low' : undisclosedCount > 4 ? 'Moderate' : 'High';
  let section = `\n---\n## DATA CONFIDENCE: ${confidence.toUpperCase()}\n\n`;
  if (undisclosedCount > 0) {
    section += `**${undisclosedCount} spec(s) scored at midpoint due to manufacturer non-disclosure:**\n`;
    warns.forEach(w => { section += `- ${w}\n`; });
    section += `\n_Midpoint scoring (5.0/10) applied where manufacturer does not publish specifications. Scores hold center until data is available._\n`;
  } else {
    section += `All scored specifications confirmed from manufacturer documentation, independent databases, or Council-approved memos.\n`;
  }
  return section;
}
async function runWithAutoCorrection(productName, config, category, researchFiles = []) {
  console.log(`\n[AUTO-RUNNER] Starting: ${productName} (${config})`);
  await sendTelegram(`🔄 *Pipeline starting*\n${productName} — ${config}`);
  let attempt = 0;
  while (attempt <= MAX_ATTEMPTS) {
    attempt++;
    let result;
    try { result = await runPipeline(productName, config, researchFiles); }
    catch (err) { await sendTelegram(`❌ *Pipeline error — ${productName}*\n${err.message.slice(0,300)}`); throw err; }
    if (result.status === 'PASS') {
      const score = extractScore(result.bot2Output || '');
      const grade = extractGrade(result.bot2Output || '');
      const note = attempt > 1 ? `\n_(self-corrected after ${attempt-1} attempt${attempt>2?'s':''})_` : '';
      if (result.outputDir && result.bot2Output) {
        const fs = require('fs');
        fs.appendFileSync(`${result.outputDir}/PIPELINE_STATUS.txt`, generateDataConfidence(result.bot2Output, result.challengeResult || ''));
      }
      await sendTelegram(`✅ *PASS — ${productName} (${config})*\nScore: *${score}/10*  Grade: *${grade}*${note}`);
      return result;
    }
    if (attempt <= MAX_ATTEMPTS) {
      await sendTelegram(`⚠️ *FLAG — ${productName}*\nAttempt ${attempt}/${MAX_ATTEMPTS} — self-correcting...\n${summarizeFlags(result.challengeResult||'').slice(0,200)}`);
      const correction = await selfCorrect(productName, config, category, result.bot1Output||'', result.bot2Output||'', result.challengeResult||'');
      if (correction.action === 'escalate') {
        await sendTelegram(`🚨 *ESCALATION — ${productName}*\n\n${correction.reason.slice(0,600)}\n\n_Open Claude and review. Pipeline halted._`);
        return { status: 'ESCALATED', productName, config, reason: correction.reason };
      }
    }
  }
  await sendTelegram(`🚨 *ESCALATION — ${productName}*\nFailed after ${MAX_ATTEMPTS} attempts. Human review required.`);
  return { status: 'ESCALATED', productName, config };
}
module.exports = { runWithAutoCorrection, sendTelegram, generateDataConfidence };
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 3) { console.log('Usage: node auto_runner.js "Product Name" CONFIG category'); process.exit(1); }
  runWithAutoCorrection(args[0], args[1], args[2], args.slice(3))
    .then(r => process.exit(r.status === 'PASS' ? 0 : 1))
    .catch(err => { console.error('[AUTO-RUNNER] FATAL:', err); process.exit(1); });
}
