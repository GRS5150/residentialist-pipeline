/**
 * Telegram Notification Helper
 * 
 * Setup (one time, 2 minutes):
 *   1. Open Telegram, search @BotFather, send /newbot
 *   2. Name it "Residentialist Bot", copy the token
 *   3. Search @userinfobot, send /start — copy your chat ID
 *   4. Add to .env on Mac Mini:
 *        TELEGRAM_BOT_TOKEN=your_token_here
 *        TELEGRAM_CHAT_ID=your_chat_id_here
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

function loadEnvVar(name) {
  try {
    const envPath = path.join(__dirname, '..', '.env');
    const env = fs.readFileSync(envPath, 'utf8');
    const match = env.match(new RegExp(`^${name}=(.+)$`, 'm'));
    return match ? match[1].trim() : process.env[name];
  } catch {
    return process.env[name];
  }
}

async function notify(message) {
  const token = loadEnvVar('TELEGRAM_BOT_TOKEN');
  const chatId = loadEnvVar('TELEGRAM_CHAT_ID');

  console.log(`\n📱 NOTIFICATION: ${message}\n`);

  if (!token || !chatId) {
    console.log('   (Telegram not configured — add TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID to .env)\n');
    return false;
  }

  const payload = JSON.stringify({
    chat_id: chatId,
    text: `🏠 Residentialist\n\n${message}`
  });

  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'api.telegram.org',
      path: `/bot${token}/sendMessage`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
    }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { if (res.statusCode === 200) console.log('   ✅ Telegram sent'); resolve(res.statusCode === 200); });
    });
    req.on('error', () => resolve(false));
    req.write(payload);
    req.end();
  });
}

module.exports = notify;
