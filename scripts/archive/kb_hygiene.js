const fs = require('fs');
const path = require('path');

const WORKSPACE = '/Users/Residentialist/.openclaw/workspace/residentialist';
const KNOWLEDGE_DIR = path.join(WORKSPACE, 'knowledge');
const DB_PATH = path.join(WORKSPACE, 'residentialist.db');

// Thresholds
const MAX_KB_CHARS_PER_CATEGORY = 200000; // warn above 200K chars
const MEMO_STALE_DAYS = 14; // correction memos older than 14 days
const FILE_UNUSED_DAYS = 30; // files not referenced in 30 days

function getCategories() {
  try {
    return fs.readdirSync(KNOWLEDGE_DIR).filter(d => 
      fs.statSync(path.join(KNOWLEDGE_DIR, d)).isDirectory() && d !== '.git'
    );
  } catch (e) { return []; }
}

function getFiles(categoryDir) {
  try {
    return fs.readdirSync(categoryDir)
      .filter(f => fs.statSync(path.join(categoryDir, f)).isFile())
      .map(f => ({
        name: f,
        path: path.join(categoryDir, f),
        size: fs.statSync(path.join(categoryDir, f)).size,
        modified: fs.statSync(path.join(categoryDir, f)).mtime
      }));
  } catch (e) { return []; }
}

// Detect versioned file groups (e.g., rubrics_v5.md + rubrics_v6.md)
function findDuplicateVersions(files) {
  const issues = [];
  const groups = {};
  
  for (const f of files) {
    // Match patterns like _v5.md, _v1.1.md, _v2.md
    const match = f.name.match(/^(.+?)_v(\d+(?:\.\d+)?)\.md$/);
    if (match) {
      const base = match[1];
      const version = match[2];
      if (!groups[base]) groups[base] = [];
      groups[base].push({ name: f.name, version, size: f.size });
    }
  }
  
  for (const [base, versions] of Object.entries(groups)) {
    if (versions.length > 1) {
      // Sort by version descending
      versions.sort((a, b) => parseFloat(b.version) - parseFloat(a.version));
      const latest = versions[0];
      const stale = versions.slice(1);
      const reclaimable = stale.reduce((sum, v) => sum + v.size, 0);
      issues.push({
        type: 'DUPLICATE_VERSION',
        message: `${base}: ${versions.length} versions found. Latest: ${latest.name}. Stale: ${stale.map(s => s.name).join(', ')}`,
        reclaimable
      });
    }
  }
  return issues;
}

// Detect old correction memos
function findStaleMemos(files) {
  const issues = [];
  const now = new Date();
  const threshold = MEMO_STALE_DAYS * 24 * 60 * 60 * 1000;
  
  for (const f of files) {
    if (f.name.includes('correction_memo') || f.name.includes('_memo')) {
      const age = now - f.modified;
      const ageDays = Math.floor(age / (24 * 60 * 60 * 1000));
      if (age > threshold) {
        issues.push({
          type: 'STALE_MEMO',
          message: `${f.name}: ${ageDays} days old (threshold: ${MEMO_STALE_DAYS} days)`,
          reclaimable: f.size
        });
      }
    }
  }
  return issues;
}

// Check total KB size per category
function checkCategorySize(files, category) {
  const totalChars = files.reduce((sum, f) => sum + f.size, 0);
  const totalTokens = Math.round(totalChars / 4);
  if (totalChars > MAX_KB_CHARS_PER_CATEGORY) {
    return {
      type: 'SIZE_WARNING',
      message: `${category}/ total: ${(totalChars / 1000).toFixed(0)}K chars (~${(totalTokens / 1000).toFixed(1)}K tokens). Threshold: ${(MAX_KB_CHARS_PER_CATEGORY / 1000).toFixed(0)}K chars`,
      reclaimable: 0
    };
  }
  return null;
}

// Main audit
function runAudit() {
  const categories = getCategories();
  const allIssues = [];
  const summary = { categories: 0, files: 0, totalChars: 0, issues: 0 };
  
  for (const cat of categories) {
    const catDir = path.join(KNOWLEDGE_DIR, cat);
    const files = getFiles(catDir);
    summary.categories++;
    summary.files += files.length;
    summary.totalChars += files.reduce((sum, f) => sum + f.size, 0);
    
    const dupes = findDuplicateVersions(files);
    const stale = findStaleMemos(files);
    const sizeWarn = checkCategorySize(files, cat);
    
    const catIssues = [...dupes, ...stale];
    if (sizeWarn) catIssues.push(sizeWarn);
    
    if (catIssues.length > 0) {
      allIssues.push({ category: cat, issues: catIssues });
    }
  }
  
  summary.issues = allIssues.reduce((sum, c) => sum + c.issues.length, 0);
  return { summary, findings: allIssues };
}

// Format for Telegram
function formatTelegram(result) {
  const { summary, findings } = result;
  
  if (findings.length === 0) {
    return null; // No issues = no notification
  }
  
  let msg = `🧹 KB HYGIENE CHECK\n`;
  msg += `${summary.categories} categories, ${summary.files} files, ~${Math.round(summary.totalChars / 4000)}K tokens\n\n`;
  
  let totalReclaimable = 0;
  
  for (const cat of findings) {
    msg += `📁 ${cat.category}/\n`;
    for (const issue of cat.issues) {
      const icon = issue.type === 'DUPLICATE_VERSION' ? '📋' :
                   issue.type === 'STALE_MEMO' ? '📝' : '⚠️';
      msg += `${icon} ${issue.message}\n`;
      totalReclaimable += issue.reclaimable;
    }
    msg += '\n';
  }
  
  if (totalReclaimable > 0) {
    msg += `💰 Reclaimable: ~${Math.round(totalReclaimable / 4000)}K tokens ($${(totalReclaimable / 4 / 1000000 * 3).toFixed(3)}/run input cost)`;
  }
  
  return msg;
}

// Format for console/log
function formatConsole(result) {
  const { summary, findings } = result;
  
  console.log('=== KB HYGIENE REPORT ===');
  console.log(`Categories: ${summary.categories}`);
  console.log(`Files: ${summary.files}`);
  console.log(`Total: ${(summary.totalChars / 1000).toFixed(0)}K chars (~${Math.round(summary.totalChars / 4000)}K tokens)`);
  console.log(`Issues: ${summary.issues}`);
  console.log('');
  
  if (findings.length === 0) {
    console.log('✅ No issues found. Knowledge base is clean.');
    return;
  }
  
  for (const cat of findings) {
    console.log(`--- ${cat.category}/ ---`);
    for (const issue of cat.issues) {
      console.log(`  [${issue.type}] ${issue.message}`);
    }
  }
}

// Send Telegram notification
async function sendTelegram(message) {
  if (!message) return;
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.log('Telegram not configured — skipping notification');
    return;
  }
  
  const https = require('https');
  const data = JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML' });
  
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.telegram.org',
      path: `/bot${token}/sendMessage`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('Telegram notification sent');
          resolve();
        } else {
          console.log('Telegram error:', body);
          resolve(); // Don't fail on notification error
        }
      });
    });
    req.on('error', e => { console.log('Telegram error:', e.message); resolve(); });
    req.write(data);
    req.end();
  });
}

// Run
const result = runAudit();
formatConsole(result);

const telegramMsg = formatTelegram(result);
if (process.argv.includes('--notify')) {
  require('dotenv').config({ path: path.join(WORKSPACE, '.env') });
  sendTelegram(telegramMsg).then(() => process.exit(0));
} else {
  if (telegramMsg) console.log('\n--- Telegram message (use --notify to send) ---\n' + telegramMsg);
  else console.log('\n✅ No Telegram notification needed — KB is clean.');
}
