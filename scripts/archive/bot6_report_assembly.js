'use strict';
// BOT 6 — REPORT ASSEMBLY
// The Residentialist | Locked March 11 2026
// Two jobs:
//   1. scanForOrphans()  — check all output folders, flag missing Bot5/council
//   2. assembleReport()  — build consumer-facing product report from pipeline outputs

const fs   = require('fs');
const path = require('path');
const https = require('https');
require('dotenv').config({ path: '/Users/Residentialist/.openclaw/workspace/residentialist/.env' });

const OUTPUTS_DIR = '/Users/Residentialist/.openclaw/workspace/residentialist/outputs';
const TOKEN       = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID     = process.env.TELEGRAM_CHAT_ID;

// ─── Telegram ────────────────────────────────────────────────────────────────
function sendTelegram(message) {
  return new Promise((resolve) => {
    try {
      const body = JSON.stringify({ chat_id: CHAT_ID, text: message, parse_mode: 'Markdown' });
      const opts = {
        hostname: 'api.telegram.org',
        path: `/bot${TOKEN}/sendMessage`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
      };
      const req = https.request(opts, (res) => { res.on('data', () => {}); res.on('end', resolve); });
      req.on('error', () => resolve());
      req.write(body); req.end();
    } catch (e) { resolve(); }
  });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function readFile(filePath) {
  try { return fs.readFileSync(filePath, 'utf8'); } catch { return null; }
}

function extractAxisScores(bot2Text) {
  const q = bot2Text.match(/QUALITY[^:]*:\s*[A-Z][+-]?\s*\(([0-9]+\.[0-9]+)\/10\)/i);
  const d = bot2Text.match(/DURABILITY[^:]*:\s*[A-Z][+-]?\s*\(([0-9]+\.[0-9]+)\/10\)/i);
  const p = bot2Text.match(/PERFORMANCE[^:]*:\s*[A-Z][+-]?\s*\(([0-9]+\.[0-9]+)\/10\)/i);
  if (q && d && p) return { Q: parseFloat(q[1]), D: parseFloat(d[1]), P: parseFloat(p[1]) };
  return null;
}

function applyWeights(axes) {
  return Math.round((axes.Q * 0.35 + axes.D * 0.35 + axes.P * 0.30) * 100) / 100;
}

function gradeFromScore(score) {
  if (score >= 9.0) return 'A+';
  if (score >= 8.5) return 'A';
  if (score >= 8.0) return 'A-';
  if (score >= 7.5) return 'B+';
  if (score >= 7.0) return 'B';
  if (score >= 6.5) return 'B-';
  if (score >= 6.0) return 'C+';
  if (score >= 5.5) return 'C';
  if (score >= 5.0) return 'C-';
  if (score >= 4.5) return 'D+';
  if (score >= 4.0) return 'D';
  return 'F';
}

function tierFromScore(score) {
  if (score >= 7.5) return 'Premium';
  if (score >= 5.5) return 'Mid-Range';
  return 'Budget';
}

function extractSafetyScore(bot3Text) {
  const m = bot3Text.match(/SCORE:\s*([0-9]+\.[0-9]+)\/10/i);
  return m ? parseFloat(m[1]) : null;
}

function extractSafetyGrade(bot3Text) {
  const m = bot3Text.match(/GRADE:\s*([A-F][+-]?[^)]*)/i);
  return m ? m[1].trim().split('\n')[0].trim() : null;
}

function extractDataConfidence(statusText) {
  const m = statusText.match(/DATA CONFIDENCE:\s*(HIGH|MODERATE|LOW)/i);
  return m ? m[1] : 'UNKNOWN';
}

function extractUndisclosedCount(statusText) {
  const m = statusText.match(/(\d+)\s+spec\(s\)\s+scored at midpoint/i);
  return m ? parseInt(m[1]) : 0;
}

function extractKeyFindings(bot2Text, label, count = 3) {
  // Pull subscore lines — lines with X.X/10 pattern
  const lines = bot2Text.split('\n');
  const findings = [];
  for (const line of lines) {
    if (line.match(/\*\*[^*]+\*\*.*\d+\.\d+\/10/)) {
      const clean = line.replace(/\*\*/g, '').replace(/\[.*?\]/g, '').trim();
      if (clean.length > 5) findings.push(clean);
    }
  }
  return findings.slice(0, count);
}

function extractReconciliationChanges(bot5Text) {
  const changes = [];
  const lines = bot5Text.split('\n');
  for (const line of lines) {
    if (line.match(/REVISION.*score.*change|score.*revised|changed from/i)) {
      changes.push(line.replace(/#+\s*/g, '').replace(/\*\*/g, '').trim());
    }
  }
  // Also catch ITEM: RESOLVED lines
  for (const line of lines) {
    if (line.match(/ITEM \d+: RESOLVED/i)) {
      changes.push(line.replace(/#+\s*/g, '').trim());
    }
  }
  return [...new Set(changes)].slice(0, 5);
}

function extractCouncilCorrections(councilText) {
  if (!councilText) return [];
  const lines = councilText.split('\n').filter(l => l.trim().length > 10);
  // Return the main body minus the header
  return lines.filter(l => !l.startsWith('#') && !l.startsWith('Product:') && !l.startsWith('Timestamp:')).slice(0, 4);
}

function extractBotOverallScore(bot2Text) {
  const patterns = [
    /OVERALL[:\s*]+([A-Z][+-]?\s*\([0-9]+\.[0-9]+)\/10/i,
    /Proposed Overall[:\s*]+([0-9]+\.[0-9]+)/i,
    /Overall Score[:\s*]+([0-9]+\.[0-9]+)/i,
    /Final Score[:\s*]+([0-9]+\.[0-9]+)/i,
  ];
  for (const p of patterns) {
    const m = bot2Text.match(p);
    if (m) {
      const numMatch = m[1].match(/([0-9]+\.[0-9]+)/);
      if (numMatch) return parseFloat(numMatch[1]);
    }
  }
  return null;
}

// ─── ORPHAN SCANNER ───────────────────────────────────────────────────────────
function scanForOrphans() {
  console.log('[BOT6] Scanning for orphaned runs...');
  const orphans = [];
  const complete = [];

  if (!fs.existsSync(OUTPUTS_DIR)) {
    console.log('[BOT6] Outputs directory not found:', OUTPUTS_DIR);
    return { orphans, complete };
  }

  const folders = fs.readdirSync(OUTPUTS_DIR)
    .filter(f => fs.statSync(path.join(OUTPUTS_DIR, f)).isDirectory());

  // Group by product — keep only most recent run per product
  const productMap = {};
  for (const folder of folders) {
    // folder format: product_name_YYYY-MM-DDTHH-MM-SS
    const tsMatch = folder.match(/_(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2})$/);
    if (!tsMatch) continue;
    const productKey = folder.replace(tsMatch[0], '');
    if (!productMap[productKey] || folder > productMap[productKey]) {
      productMap[productKey] = folder;
    }
  }

  for (const [productKey, folder] of Object.entries(productMap)) {
    const dir = path.join(OUTPUTS_DIR, folder);
    const files = fs.readdirSync(dir);

    const hasBot5    = files.some(f => f.includes('bot5_reconciliation'));
    const hasCouncil = files.some(f => f.includes('council_memo') || f === 'council_session.md');
    const hasStatus  = files.some(f => f === 'PIPELINE_STATUS.txt');

    const statusText = hasStatus ? readFile(path.join(dir, 'PIPELINE_STATUS.txt')) || '' : '';
    const statusLine = statusText.match(/^STATUS:\s*(.+)/m);
    const status     = statusLine ? statusLine[1].trim() : 'UNKNOWN';

    const entry = { productKey, folder, hasBot5, hasCouncil, status };

    if (!hasBot5 || !hasCouncil) {
      orphans.push(entry);
    } else {
      complete.push(entry);
    }
  }

  console.log(`[BOT6] Complete: ${complete.length} | Orphans: ${orphans.length}`);
  return { orphans, complete };
}

// ─── REPORT ASSEMBLER ─────────────────────────────────────────────────────────
function assembleReport(productName, outputDir) {
  console.log(`[BOT6] Assembling report: ${productName} from ${outputDir}`);

  const files = fs.readdirSync(outputDir);

  // Find each bot file
  const findFile = (keyword) => {
    const f = files.find(x => x.includes(keyword));
    return f ? readFile(path.join(outputDir, f)) : null;
  };

  const bot2Text    = findFile('bot2_evaluator');
  const bot3Text    = findFile('bot3_material_safety');
  const bot5Text    = findFile('bot5_reconciliation');
  const councilText = findFile('council_memo') || readFile(path.join(outputDir, 'council_session.md'));
  const statusText  = readFile(path.join(outputDir, 'PIPELINE_STATUS.txt')) || '';

  if (!bot2Text) {
    return { error: 'Missing bot2_evaluator — cannot assemble report.' };
  }
  if (!bot5Text) {
    return { error: 'Missing bot5_reconciliation — run is incomplete. Queue for rescore.' };
  }

  // Extract scores
  const axes         = extractAxisScores(bot2Text);
  const botOverall   = extractBotOverallScore(bot2Text);
  const weightedScore = axes ? applyWeights(axes) : botOverall;
  const finalScore   = weightedScore || botOverall || 0;
  const grade        = gradeFromScore(finalScore);
  const tier         = tierFromScore(finalScore);
  const safetyScore  = bot3Text ? extractSafetyScore(bot3Text) : null;
  const safetyGrade  = bot3Text ? extractSafetyGrade(bot3Text) : null;
  const confidence   = extractDataConfidence(statusText);
  const undisclosed  = extractUndisclosedCount(statusText);
  const reconcChanges = extractReconciliationChanges(bot5Text);
  const councilNotes  = extractCouncilCorrections(councilText);
  const timestamp    = statusText.match(/TIMESTAMP:\s*(.+)/)?.[1]?.trim() || new Date().toISOString();
  const config       = statusText.match(/CONFIG:\s*(.+)/)?.[1]?.trim() || 'DH';

  // ── Build the report ──
  const divider = '─'.repeat(60);

  let report = `# THE RESIDENTIALIST — PRODUCT EVALUATION REPORT
${divider}

## ${productName.toUpperCase()} [${config}]
**Overall Score: ${finalScore}/10 | Grade: ${grade} | Tier: ${tier}**
Evaluated: ${timestamp.replace('T', ' ').replace(/-\d{2}$/, '')}

${divider}

## SCORECARD

| Axis | Score | Weight | Contribution |
|------|-------|--------|-------------|
| Quality | ${axes?.Q ?? '—'}/10 | 35% | ${axes ? Math.round(axes.Q * 0.35 * 100) / 100 : '—'} |
| Durability | ${axes?.D ?? '—'}/10 | 35% | ${axes ? Math.round(axes.D * 0.35 * 100) / 100 : '—'} |
| Performance | ${axes?.P ?? '—'}/10 | 30% | ${axes ? Math.round(axes.P * 0.30 * 100) / 100 : '—'} |
| **OVERALL** | **${finalScore}/10** | — | **${grade}** |

**Material Safety Score: ${safetyScore ?? 'N/A'}/10** _(${safetyGrade ?? 'see safety report'}) — scored independently, not averaged into overall_

**Data Confidence: ${confidence}**${undisclosed > 0 ? ` — ${undisclosed} spec(s) scored at midpoint (manufacturer non-disclosure)` : ''}

${divider}

## RECONCILIATION NOTES
_What changed during Bot 1 ↔ Bot 2 debate:_

`;

  if (reconcChanges.length > 0) {
    reconcChanges.forEach(c => { report += `- ${c}\n`; });
  } else {
    report += `- No scoring changes — Bots 1 and 2 reached initial agreement\n`;
  }

  if (councilNotes.length > 0) {
    report += `\n**Council Corrections Applied:**\n`;
    councilNotes.forEach(n => { if (n.trim()) report += `- ${n.trim()}\n`; });
  }

  report += `
${divider}

## PIPELINE INTEGRITY
- Bot 5 Reconciliation: ✅ Complete
- Council Review: ${councilText ? '✅ Complete' : '⚠️ Not on file'}
- Weight Enforcement: 35% Quality / 35% Durability / 30% Performance (locked March 11 2026)
- Axis weights applied deterministically — not by AI calculation

${divider}

_Report assembled by Bot 6 — The Residentialist Pipeline_
_Scores represent deterministic rubric output. Not financial, legal, or construction advice._
`;

  return { report, finalScore, grade, tier, axes, safetyScore, confidence };
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'scan';

  if (command === 'scan') {
    // Orphan scan — check all output folders, alert on incomplete runs
    const { orphans, complete } = scanForOrphans();

    console.log(`\n✅ COMPLETE RUNS (${complete.length}):`);
    complete.forEach(r => console.log(`  ${r.productKey} — ${r.status}`));

    if (orphans.length > 0) {
      console.log(`\n⚠️  ORPHANED RUNS (${orphans.length}) — missing Bot5 or Council:`);
      orphans.forEach(r => {
        const missing = [];
        if (!r.hasBot5) missing.push('Bot5');
        if (!r.hasCouncil) missing.push('Council');
        console.log(`  ${r.productKey} — missing: ${missing.join(', ')} | status: ${r.status}`);
      });

      const msg = `⚠️ *Bot 6 Orphan Scan*\n\n` +
        `${orphans.length} incomplete run(s) detected:\n\n` +
        orphans.map(r => {
          const missing = [];
          if (!r.hasBot5) missing.push('Bot5');
          if (!r.hasCouncil) missing.push('Council');
          return `• ${r.productKey.replace(/_/g, ' ')} — missing ${missing.join(', ')}`;
        }).join('\n') +
        `\n\n_These products appear in the output folder but are NOT fully scored. Do not lock scores._`;
      await sendTelegram(msg);
    } else {
      console.log('\n✅ No orphans found — all runs complete.');
    }

  } else if (command === 'report') {
    // Assemble report for a specific product
    // Usage: node bot6_report_assembly.js report "Andersen 400 Series" /path/to/output/dir
    const productName = args[1];
    const outputDir   = args[2];

    if (!productName || !outputDir) {
      console.log('Usage: node bot6_report_assembly.js report "Product Name" /path/to/output/dir');
      process.exit(1);
    }

    const result = assembleReport(productName, outputDir);
    if (result.error) {
      console.error('[BOT6] Error:', result.error);
      process.exit(1);
    }

    // Write report file
    const reportPath = path.join(outputDir, `${productName.toLowerCase().replace(/\s+/g, '_')}_REPORT.md`);
    fs.writeFileSync(reportPath, result.report);
    console.log(`[BOT6] Report written: ${reportPath}`);
    console.log(`[BOT6] Score: ${result.finalScore}/10 | Grade: ${result.grade} | Tier: ${result.tier}`);

    await sendTelegram(
      `📄 *Report assembled — ${productName}*\n` +
      `Score: *${result.finalScore}/10* | Grade: *${result.grade}* | Tier: *${result.tier}*\n` +
      `Confidence: ${result.confidence}\n` +
      `Safety: ${result.safetyScore ?? 'N/A'}/10`
    );

  } else if (command === 'report-all') {
    // Assemble reports for all complete runs
    const { complete, orphans } = scanForOrphans();
    console.log(`[BOT6] Assembling reports for ${complete.length} complete runs...`);

    let successCount = 0;
    for (const run of complete) {
      const outputDir  = path.join(OUTPUTS_DIR, run.folder);
      const productName = run.productKey.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      const result = assembleReport(productName, outputDir);
      if (result.error) {
        console.error(`[BOT6] Skipped ${run.productKey}: ${result.error}`);
      } else {
        const reportPath = path.join(outputDir, `${run.productKey}_REPORT.md`);
        fs.writeFileSync(reportPath, result.report);
        console.log(`[BOT6] ✅ ${productName}: ${result.finalScore}/10 ${result.grade}`);
        successCount++;
      }
    }

    const summary = `📋 *Bot 6 Report Assembly Complete*\n\n` +
      `✅ ${successCount} reports assembled\n` +
      (orphans.length > 0 ? `⚠️ ${orphans.length} orphaned runs skipped` : `✅ No orphans`);
    await sendTelegram(summary);
    console.log(`[BOT6] Done. ${successCount}/${complete.length} reports assembled.`);

  } else {
    console.log('Usage:');
    console.log('  node bot6_report_assembly.js scan                          # check for orphans');
    console.log('  node bot6_report_assembly.js report "Name" /path/to/dir   # one product');
    console.log('  node bot6_report_assembly.js report-all                   # all complete runs');
  }
}

module.exports = { scanForOrphans, assembleReport };
main().catch(err => { console.error('[BOT6] FATAL:', err); process.exit(1); });
