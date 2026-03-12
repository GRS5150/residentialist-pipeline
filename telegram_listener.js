/**
 * THE RESIDENTIALIST — telegram_listener.js (Phase 6)
 * Henry's Telegram command interface.
 *
 * Phase 4: DIAGNOSE, LOGS, auto-diagnosis on errors
 * Phase 6: SPEC command, document upload → auto-parse, SPECS list
 */

const { runWithAutoCorrection, sendTelegram } = require('./auto_runner');
const { diagnose, executeAutoFix, diagLog } = require('./diagnose');
const fs = require('fs');
const path = require('path');
const https = require('https');
require('dotenv').config({path: '/Users/Residentialist/.openclaw/workspace/residentialist/.env'});
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = String(process.env.TELEGRAM_CHAT_ID);
const WORKSPACE = '/Users/Residentialist/.openclaw/workspace/residentialist';
const SPEC_UPLOAD_DIR = path.join(WORKSPACE, 'spec_uploads');
let lastUpdateId = 0;
let activePipelines = new Set();
let lastError = null; // Track last error for manual DIAGNOSE command

// Ensure spec upload dir
if (!fs.existsSync(SPEC_UPLOAD_DIR)) fs.mkdirSync(SPEC_UPLOAD_DIR, { recursive: true });

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

// ── Telegram File Download ───────────────────────────────────────────────────

function getFileInfo(fileId) {
  return new Promise((resolve, reject) => {
    const options = { hostname: 'api.telegram.org', path: `/bot${TOKEN}/getFile?file_id=${fileId}`, method: 'GET' };
    const req = https.request(options, (res) => {
      let data = ''; res.on('data', c => data += c);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch(e) { reject(e); } });
    });
    req.on('error', reject); req.end();
  });
}

function downloadFile(filePath, savePath) {
  return new Promise((resolve, reject) => {
    const url = `https://api.telegram.org/file/bot${TOKEN}/${filePath}`;
    https.get(url, (res) => {
      const stream = fs.createWriteStream(savePath);
      res.pipe(stream);
      stream.on('finish', () => { stream.close(); resolve(savePath); });
    }).on('error', reject);
  });
}

function parseCommand(text) {
  const runMatch = text.match(/^RUN\s+"([^"]+)"\s+(\w+)\s+(\w+)/i);
  if (runMatch) return { cmd: 'RUN', product: runMatch[1], config: runMatch[2].toUpperCase(), category: runMatch[3].toLowerCase() };
  if (/^STATUS$/i.test(text.trim())) return { cmd: 'STATUS' };
  if (/^HELP$/i.test(text.trim())) return { cmd: 'HELP' };
  if (/^DIAGNOSE$/i.test(text.trim())) return { cmd: 'DIAGNOSE' };
  if (/^LOGS?\s*(\w*)/i.test(text.trim())) {
    const m = text.trim().match(/^LOGS?\s*(\w*)/i);
    return { cmd: 'LOGS', file: (m[1] || 'diagnose').toLowerCase() };
  }
  const rulingMatch = text.match(/^RULING\s+(YELLOW|RED|PASS|REJECT)\s*(.*)$/i);
  if (rulingMatch) return { cmd: 'RULING', decision: rulingMatch[1].toUpperCase(), notes: rulingMatch[2].trim() };
  if (/^RESUME$/i.test(text.trim())) return { cmd: 'RESUME' };
  if (/^RERUN\s+"([^"]+)"\s+(\w+)\s+(\w+)/i.test(text)) { const m = text.match(/^RERUN\s+"([^"]+)"\s+(\w+)\s+(\w+)/i); return { cmd: 'RERUN', product: m[1], config: m[2].toUpperCase(), category: m[3].toLowerCase() }; }
  const queueMatch = text.match(/^QUEUE\s+(.+)/is);
  if (queueMatch) {
    const items = queueMatch[1].split(',').map(s => s.trim()).map(item => { const m = item.match(/"([^"]+)"\s+(\w+)\s+(\w+)/); return m ? { product: m[1], config: m[2].toUpperCase(), category: m[3].toLowerCase() } : null; }).filter(Boolean);
    if (items.length > 0) return { cmd: 'QUEUE', items };
  }

  // Phase 6: SPEC command
  const specMatch = text.match(/^SPEC\s+(.+)/i);
  if (specMatch) {
    const specArgs = specMatch[1].trim();
    // SPEC /path/to/file.pdf [--builder "Name"] [--address "123 Main"]
    const filePart = specArgs.match(/^"?([^"]+?)"?\s*(--|$)/);
    const builderMatch = specArgs.match(/--builder\s+"([^"]+)"/i);
    const addressMatch = specArgs.match(/--address\s+"([^"]+)"/i);
    return {
      cmd: 'SPEC',
      file: filePart ? filePart[1].trim() : specArgs,
      builder: builderMatch ? builderMatch[1] : null,
      address: addressMatch ? addressMatch[1] : null
    };
  }

  // Phase 6: SPECS list command
  if (/^SPECS$/i.test(text.trim())) return { cmd: 'SPECS' };

  return null;
}

async function handleCommand(cmd, chatId) {
  if (cmd.cmd === 'RUN') {
    const key = `${cmd.product}-${cmd.config}`;
    if (activePipelines.has(key)) { await reply(chatId, `⏳ *${cmd.product}* is already running.`); return; }
    activePipelines.add(key);
    await reply(chatId, `🚀 Starting: *${cmd.product}* (${cmd.config}) — ${cmd.category}`);
    runWithAutoCorrection(cmd.product, cmd.config, cmd.category)
      .catch(err => {
        lastError = { error: err.message, product: cmd.product, config: cmd.config, category: cmd.category, timestamp: new Date().toISOString() };
        sendTelegram(`❌ Fatal: ${err.message.slice(0,200)}`);
      })
      .finally(() => activePipelines.delete(key));

  } else if (cmd.cmd === 'QUEUE') {
    await reply(chatId, `📋 Queue: ${cmd.items.length} products\n${cmd.items.map((i,n)=>`${n+1}. ${i.product} (${i.config})`).join('\n')}`);
    for (const item of cmd.items) {
      const key = `${item.product}-${item.config}`;
      if (!activePipelines.has(key)) {
        activePipelines.add(key);
        await runWithAutoCorrection(item.product, item.config, item.category)
          .catch(err => {
            lastError = { error: err.message, product: item.product, config: item.config, category: item.category, timestamp: new Date().toISOString() };
            sendTelegram(`❌ Fatal: ${err.message.slice(0,200)}`);
          })
          .finally(() => activePipelines.delete(key));
      }
    }

  } else if (cmd.cmd === 'STATUS') {
    const running = activePipelines.size > 0 ? `\n\n*Running:*\n${[...activePipelines].join('\n')}` : '\n\nNo active pipelines.';
    const errorInfo = lastError ? `\n\n*Last error:* ${lastError.product} at ${lastError.timestamp}\n${lastError.error.slice(0,100)}` : '';
    // Add spec stats
    let specInfo = '';
    try {
      const db = require('./db');
      const stats = db.getSpecStats();
      if (stats.total > 0) specInfo = `\n\n📋 *Specs:* ${stats.total} parsed, ${stats.totalProducts} products found`;
    } catch(e) {}
    await reply(chatId, `✅ *Henry is online*${running}${errorInfo}${specInfo}`);

  } else if (cmd.cmd === 'HELP') {
    await reply(chatId, `*Henry Commands:*\n\n*RUN* "Product Name" CONFIG category\n_Example: RUN "Marvin Integrity" DH windows_\n\n*QUEUE* "Product 1" DH windows, "Product 2" DH windows\n\n*SPEC* /path/to/file.pdf [--builder "Name"]\n_Parse a builder spec sheet_\n\n*SPECS* — list parsed spec sheets\n\n📎 _Upload a PDF/CSV directly — auto-parses as spec sheet_\n\n*RULING* YELLOW|RED|PASS|REJECT [notes]\n*RESUME* — resume halted pipeline\n*RERUN* "Product" CONFIG category\n*STATUS* — active pipelines + stats\n*DIAGNOSE* — re-diagnose last error\n*LOGS* [diagnose|bridge|deploy|telegram|spec]\n*HELP* — this message`);

  } else if (cmd.cmd === 'DIAGNOSE') {
    if (!lastError) {
      await reply(chatId, '_No recent errors to diagnose._');
      return;
    }
    await reply(chatId, `🔍 *Diagnosing last error...*\n${lastError.product} — ${lastError.error.slice(0,100)}`);
    const diag = await diagnose({
      error: lastError.error,
      context: `Manual diagnosis request for ${lastError.product}`,
      attempt: 0,
      product: lastError.product,
      step: 'manual'
    });
    await reply(chatId, `*Diagnosis:* ${diag.action}\n*Reason:* ${diag.reason}${diag.detail ? '\n*Detail:* ' + diag.detail : ''}\n*Auto-fixable:* ${diag.autoFixed ? 'Yes' : 'No'}`);

  } else if (cmd.cmd === 'LOGS') {
    const logMap = {
      diagnose: path.join(WORKSPACE, 'diagnose.log'),
      bridge: '/Users/Residentialist/bridge.log',
      deploy: '/Users/Residentialist/deploy.log',
      telegram: '/Users/Residentialist/telegram.log',
      spec: path.join(WORKSPACE, 'spec_parser.log')
    };
    const logPath = logMap[cmd.file] || logMap.diagnose;
    try {
      const { execSync } = require('child_process');
      const tail = execSync(`tail -15 "${logPath}"`, { timeout: 5000 }).toString();
      await reply(chatId, `*${cmd.file} log (last 15 lines):*\n\`\`\`\n${tail.slice(0,3500)}\n\`\`\``);
    } catch (e) {
      await reply(chatId, `_Could not read ${cmd.file} log: ${e.message}_`);
    }

  } else if (cmd.cmd === 'RULING') {
    var rulingFile = path.join(WORKSPACE, 'PENDING_RULING.json');
    var ruling = { decision: cmd.decision, notes: cmd.notes, timestamp: new Date().toISOString(), actioned: false };
    fs.writeFileSync(rulingFile, JSON.stringify(ruling, null, 2));
    await reply(chatId, '⚖️ *Ruling recorded: ' + cmd.decision + '*\n' + (cmd.notes ? '_' + cmd.notes + '_\n' : '') + '\nPipeline will resume on next check cycle. Use RESUME to force immediately.');

  } else if (cmd.cmd === 'RESUME') {
    var resumeFile = path.join(WORKSPACE, 'RESUME_SIGNAL');
    fs.writeFileSync(resumeFile, new Date().toISOString());
    await reply(chatId, '▶️ *Resume signal sent.* Pipeline will pick up on next cycle.');

  } else if (cmd.cmd === 'RERUN') {
    const key = cmd.product + '-' + cmd.config;
    if (activePipelines.has(key)) { await reply(chatId, '⏳ *' + cmd.product + '* is already running.'); return; }
    activePipelines.add(key);
    await reply(chatId, '🔄 Rerunning: *' + cmd.product + '* (' + cmd.config + ')');
    runWithAutoCorrection(cmd.product, cmd.config, cmd.category)
      .catch(function(err) {
        lastError = { error: err.message, product: cmd.product, config: cmd.config, category: cmd.category, timestamp: new Date().toISOString() };
        sendTelegram('❌ Fatal: ' + err.message.slice(0,200));
      })
      .finally(function() { activePipelines.delete(key); });

  // ── Phase 6: SPEC command ──────────────────────────────────────────────────
  } else if (cmd.cmd === 'SPEC') {
    const filePath = cmd.file.startsWith('/') ? cmd.file : path.join(WORKSPACE, cmd.file);
    if (!fs.existsSync(filePath)) {
      await reply(chatId, `❌ File not found: _${cmd.file}_\n\nTip: Upload a PDF/CSV directly to this chat, or use:\nSPEC /full/path/to/file.pdf`);
      return;
    }
    await reply(chatId, `📋 *Parsing spec sheet...*\n${path.basename(filePath)}`);

    try {
      const { parseSpecSheet, formatTelegramMessage } = require('./spec_parser');
      let autoQueue = true;
      try {
        const config = JSON.parse(fs.readFileSync(path.join(WORKSPACE, 'config.json'), 'utf8'));
        if (config.spec_ingestion && config.spec_ingestion.auto_queue_specs === false) autoQueue = false;
      } catch(e) {}

      const result = await parseSpecSheet(filePath, {
        builder: cmd.builder,
        address: cmd.address,
        autoQueue
      });

      // Save to DB
      try {
        const db = require('./db');
        db.saveSpecSheet({
          source: 'telegram',
          builder: cmd.builder || result.summary?.source,
          address: cmd.address || result.summary?.property,
          products: result.products,
          ambiguous: result.ambiguous,
          summary: result.summary
        });
      } catch(e) { console.error('[SPEC] DB save error:', e.message); }

      await reply(chatId, formatTelegramMessage(result));
    } catch(e) {
      await reply(chatId, `❌ *Spec parse error:* ${e.message.slice(0, 300)}`);
    }

  // ── Phase 6: SPECS list command ────────────────────────────────────────────
  } else if (cmd.cmd === 'SPECS') {
    try {
      const db = require('./db');
      const specs = db.getSpecSheets(10);
      const stats = db.getSpecStats();
      if (specs.length === 0) {
        await reply(chatId, '📋 *No spec sheets parsed yet.*\n\nUpload a PDF/CSV or use:\nSPEC /path/to/file.pdf');
        return;
      }
      let msg = `📋 *Spec Sheets (${stats.total} total)*\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      for (const s of specs) {
        const products = s.extracted_products || [];
        const scored = products.filter(p => p.db_status === 'scored').length;
        const total = products.length;
        msg += `\n• *${s.builder_name || s.source || 'Unknown'}*`;
        if (s.property_address) msg += `\n  📍 ${s.property_address}`;
        msg += `\n  ${total} products (${scored} scored) — ${s.status}`;
        msg += `\n  _${s.created_at}_\n`;
      }
      msg += `\n*Totals:* ${stats.totalProducts} products across ${stats.total} sheets`;
      await reply(chatId, msg);
    } catch(e) {
      await reply(chatId, `❌ ${e.message.slice(0, 200)}`);
    }
  }
}

// ── Phase 6: Document Upload Handler ─────────────────────────────────────────

async function handleDocumentUpload(msg) {
  const doc = msg.document;
  const fileName = doc.file_name || 'upload';
  const ext = path.extname(fileName).toLowerCase();

  // Only handle PDF, CSV, and common image formats
  const supportedExts = ['.pdf', '.csv', '.jpg', '.jpeg', '.png', '.webp'];
  if (!supportedExts.includes(ext)) {
    await reply(msg.chat.id, `📎 Received _${fileName}_ but I can only parse PDF, CSV, JPG, and PNG files.`);
    return;
  }

  await reply(msg.chat.id, `📎 *Received:* ${fileName}\n📋 Downloading and parsing as spec sheet...`);

  try {
    // Download file from Telegram
    const fileInfo = await getFileInfo(doc.file_id);
    if (!fileInfo.ok || !fileInfo.result.file_path) {
      await reply(msg.chat.id, `❌ Could not download file from Telegram.`);
      return;
    }

    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const savePath = path.join(SPEC_UPLOAD_DIR, `${Date.now()}_${safeName}`);
    await downloadFile(fileInfo.result.file_path, savePath);

    // Parse it
    const { parseSpecSheet, formatTelegramMessage } = require('./spec_parser');
    let autoQueue = true;
    try {
      const config = JSON.parse(fs.readFileSync(path.join(WORKSPACE, 'config.json'), 'utf8'));
      if (config.spec_ingestion && config.spec_ingestion.auto_queue_specs === false) autoQueue = false;
    } catch(e) {}

    // Check if caption has builder/address info
    const caption = msg.caption || '';
    const builderMatch = caption.match(/builder[:\s]+["']?([^"'\n]+)/i);
    const addressMatch = caption.match(/address[:\s]+["']?([^"'\n]+)/i);

    const result = await parseSpecSheet(savePath, {
      builder: builderMatch ? builderMatch[1].trim() : null,
      address: addressMatch ? addressMatch[1].trim() : null,
      autoQueue
    });

    // Save to DB
    try {
      const db = require('./db');
      db.saveSpecSheet({
        source: 'telegram_upload',
        builder: result.summary?.source,
        address: result.summary?.property,
        products: result.products,
        ambiguous: result.ambiguous,
        summary: result.summary
      });
    } catch(e) { console.error('[SPEC] DB save error:', e.message); }

    await reply(msg.chat.id, formatTelegramMessage(result));
  } catch(e) {
    await reply(msg.chat.id, `❌ *Parse error:* ${e.message.slice(0, 300)}`);
  }
}

// ── Phase 6: Photo Upload Handler (for feature sheet images) ─────────────────

async function handlePhotoUpload(msg) {
  // Get the largest photo version
  const photos = msg.photo;
  const largest = photos[photos.length - 1];

  await reply(msg.chat.id, `📸 *Received photo*\n📋 Parsing as spec/feature sheet...`);

  try {
    const fileInfo = await getFileInfo(largest.file_id);
    if (!fileInfo.ok || !fileInfo.result.file_path) {
      await reply(msg.chat.id, `❌ Could not download photo from Telegram.`);
      return;
    }

    const savePath = path.join(SPEC_UPLOAD_DIR, `${Date.now()}_photo.jpg`);
    await downloadFile(fileInfo.result.file_path, savePath);

    const { parseSpecSheet, formatTelegramMessage } = require('./spec_parser');
    let autoQueue = true;
    try {
      const config = JSON.parse(fs.readFileSync(path.join(WORKSPACE, 'config.json'), 'utf8'));
      if (config.spec_ingestion && config.spec_ingestion.auto_queue_specs === false) autoQueue = false;
    } catch(e) {}

    const caption = msg.caption || '';
    const builderMatch = caption.match(/builder[:\s]+["']?([^"'\n]+)/i);
    const addressMatch = caption.match(/address[:\s]+["']?([^"'\n]+)/i);

    const result = await parseSpecSheet(savePath, {
      builder: builderMatch ? builderMatch[1].trim() : null,
      address: addressMatch ? addressMatch[1].trim() : null,
      autoQueue
    });

    try {
      const db = require('./db');
      db.saveSpecSheet({
        source: 'telegram_photo',
        builder: result.summary?.source,
        address: result.summary?.property,
        products: result.products,
        ambiguous: result.ambiguous,
        summary: result.summary
      });
    } catch(e) {}

    await reply(msg.chat.id, formatTelegramMessage(result));
  } catch(e) {
    await reply(msg.chat.id, `❌ *Parse error:* ${e.message.slice(0, 300)}`);
  }
}

// ── Main Poll Loop ───────────────────────────────────────────────────────────

async function poll() {
  console.log('[HENRY] Telegram listener online (Phase 6 — spec ingestion).');
  await sendTelegram('🟢 *Henry is online*\nPhase 6: Spec sheet ingestion active.\nUpload a PDF/CSV or send HELP.');
  while (true) {
    try {
      const updates = await getUpdates();
      if (updates.ok && updates.result.length > 0) {
        for (const update of updates.result) {
          lastUpdateId = update.update_id;
          const msg = update.message;
          if (!msg) continue;
          if (String(msg.chat.id) !== CHAT_ID) continue;

          // Phase 6: Handle document uploads (PDF, CSV, etc.)
          if (msg.document) {
            await handleDocumentUpload(msg);
            continue;
          }

          // Phase 6: Handle photo uploads (feature sheet images)
          if (msg.photo && msg.photo.length > 0) {
            await handlePhotoUpload(msg);
            continue;
          }

          // Text commands
          if (!msg.text) continue;
          const cmd = parseCommand(msg.text.trim());
          if (cmd) { await handleCommand(cmd, msg.chat.id); }
          else { await reply(msg.chat.id, '_Unknown command. Send HELP._'); }
        }
      }
    } catch (err) { console.error('[HENRY] Poll error:', err.message); await new Promise(r => setTimeout(r, 5000)); }
  }
}
poll();
