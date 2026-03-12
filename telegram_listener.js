const { runWithAutoCorrection, sendTelegram } = require('./auto_runner');
const fs = require('fs');
const path = require('path');
const https = require('https');
require('dotenv').config({path: '/Users/Residentialist/.openclaw/workspace/residentialist/.env'});
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = String(process.env.TELEGRAM_CHAT_ID);
let lastUpdateId = 0;
let activePipelines = new Set();
function getUpdates() {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ offset: lastUpdateId + 1, timeout: 30, allowed_updates: ['message'] });
    const options = { hostname: 'api.telegram.org', path: `/bot${TOKEN}/getUpdates`, method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } };
    const req = https.request(options, (res) => { let data = ''; res.on('data', c => data += c); res.on('end', () => { try { resolve(JSON.parse(data)); } catch(e) { reject(e); } }); });
    req.on('error', reject); req.write(body); req.end();
  });
}
function reply(chatId, text) {
  return new Promise((resolve) => {
    const body = JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' });
    const options = { hostname: 'api.telegram.org', path: `/bot${TOKEN}/sendMessage`, method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } };
    const req = https.request(options, (res) => { res.on('data', ()=>{}); res.on('end', resolve); });
    req.on('error', () => resolve()); req.write(body); req.end();
  });
}
function parseCommand(text) {
  const runMatch = text.match(/^RUN\s+"([^"]+)"\s+(\w+)\s+(\w+)/i);
  if (runMatch) return { cmd: 'RUN', product: runMatch[1], config: runMatch[2].toUpperCase(), category: runMatch[3].toLowerCase() };
  if (/^STATUS$/i.test(text.trim())) return { cmd: 'STATUS' };
  if (/^HELP$/i.test(text.trim())) return { cmd: 'HELP' };
  const rulingMatch = text.match(/^RULING\s+(YELLOW|RED|PASS|REJECT)\s*(.*)$/i);
  if (rulingMatch) return { cmd: 'RULING', decision: rulingMatch[1].toUpperCase(), notes: rulingMatch[2].trim() };
  if (/^RESUME$/i.test(text.trim())) return { cmd: 'RESUME' };
  if (/^RERUN\s+"([^"]+)"\s+(\w+)\s+(\w+)/i.test(text)) { const m = text.match(/^RERUN\s+"([^"]+)"\s+(\w+)\s+(\w+)/i); return { cmd: 'RERUN', product: m[1], config: m[2].toUpperCase(), category: m[3].toLowerCase() }; }
  const queueMatch = text.match(/^QUEUE\s+(.+)/is);
  if (queueMatch) {
    const items = queueMatch[1].split(',').map(s => s.trim()).map(item => { const m = item.match(/"([^"]+)"\s+(\w+)\s+(\w+)/); return m ? { product: m[1], config: m[2].toUpperCase(), category: m[3].toLowerCase() } : null; }).filter(Boolean);
    if (items.length > 0) return { cmd: 'QUEUE', items };
  }
  return null;
}
async function handleCommand(cmd, chatId) {
  if (cmd.cmd === 'RUN') {
    const key = `${cmd.product}-${cmd.config}`;
    if (activePipelines.has(key)) { await reply(chatId, `⏳ *${cmd.product}* is already running.`); return; }
    activePipelines.add(key);
    await reply(chatId, `🚀 Starting: *${cmd.product}* (${cmd.config}) — ${cmd.category}`);
    runWithAutoCorrection(cmd.product, cmd.config, cmd.category).catch(err => sendTelegram(`❌ Fatal: ${err.message.slice(0,200)}`)).finally(() => activePipelines.delete(key));
  } else if (cmd.cmd === 'QUEUE') {
    await reply(chatId, `📋 Queue: ${cmd.items.length} products\n${cmd.items.map((i,n)=>`${n+1}. ${i.product} (${i.config})`).join('\n')}`);
    for (const item of cmd.items) {
      const key = `${item.product}-${item.config}`;
      if (!activePipelines.has(key)) { activePipelines.add(key); await runWithAutoCorrection(item.product, item.config, item.category).catch(err => sendTelegram(`❌ Fatal: ${err.message.slice(0,200)}`)).finally(() => activePipelines.delete(key)); }
    }
  } else if (cmd.cmd === 'STATUS') {
    const running = activePipelines.size > 0 ? `\n\n*Running:*\n${[...activePipelines].join('\n')}` : '\n\nNo active pipelines.';
    await reply(chatId, `✅ *Henry is online*${running}`);
  } else if (cmd.cmd === 'HELP') {
    await reply(chatId, `*Henry Commands:*\n\n*RUN* "Product Name" CONFIG category\n_Example: RUN "Marvin Integrity" DH windows_\n\n*QUEUE* "Product 1" DH windows, "Product 2" DH windows\n\n*RULING* YELLOW|RED|PASS|REJECT [notes]\n_Example: RULING YELLOW ClassAction not verified_\n\n*RESUME* — resume halted pipeline\n*RERUN* "Product" CONFIG category — rerun from scratch\n*STATUS* — active pipelines\n*HELP* — this message`);
  } else if (cmd.cmd === 'RULING') {
    var rulingFile = '/Users/Residentialist/.openclaw/workspace/residentialist/PENDING_RULING.json';
    var ruling = { decision: cmd.decision, notes: cmd.notes, timestamp: new Date().toISOString(), actioned: false };
    fs.writeFileSync(rulingFile, JSON.stringify(ruling, null, 2));
    await reply(chatId, '⚖️ *Ruling recorded: ' + cmd.decision + '*\n' + (cmd.notes ? '_' + cmd.notes + '_\n' : '') + '\nPipeline will resume on next check cycle. Use RESUME to force immediately.');
  } else if (cmd.cmd === 'RESUME') {
    var resumeFile = '/Users/Residentialist/.openclaw/workspace/residentialist/RESUME_SIGNAL';
    fs.writeFileSync(resumeFile, new Date().toISOString());
    await reply(chatId, '▶️ *Resume signal sent.* Pipeline will pick up on next cycle.');
  } else if (cmd.cmd === 'RERUN') {
    const key = cmd.product + '-' + cmd.config;
    if (activePipelines.has(key)) { await reply(chatId, '⏳ *' + cmd.product + '* is already running.'); return; }
    activePipelines.add(key);
    await reply(chatId, '🔄 Rerunning: *' + cmd.product + '* (' + cmd.config + ')');
    runWithAutoCorrection(cmd.product, cmd.config, cmd.category).catch(function(err) { sendTelegram('❌ Fatal: ' + err.message.slice(0,200)); }).finally(function() { activePipelines.delete(key); });
  }
}
async function poll() {
  console.log('[HENRY] Telegram listener online.');
  await sendTelegram('🟢 *Henry is online*\nSend HELP for commands.');
  while (true) {
    try {
      const updates = await getUpdates();
      if (updates.ok && updates.result.length > 0) {
        for (const update of updates.result) {
          lastUpdateId = update.update_id;
          const msg = update.message;
          if (!msg || !msg.text) continue;
          if (String(msg.chat.id) !== CHAT_ID) continue;
          const cmd = parseCommand(msg.text.trim());
          if (cmd) { await handleCommand(cmd, msg.chat.id); }
          else { await reply(msg.chat.id, '_Unknown command. Send HELP._'); }
        }
      }
    } catch (err) { console.error('[HENRY] Poll error:', err.message); await new Promise(r => setTimeout(r, 5000)); }
  }
}
poll();
