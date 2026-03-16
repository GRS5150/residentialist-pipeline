/**
 * THE RESIDENTIALIST — auto_runner.js (v3 + Phase 4 diagnosis + Phase 5 DB + Phase 6a source parser)
 * Queue & Batch Runner with self-correction loop.
 *
 * v3: JSON structured output from orchestrator
 * Phase 4: Auto-diagnosis before alerting Ray
 * Phase 5: Write scores to SQLite DB after each successful run
 *          Check "already scored?" before starting pipeline
 * Phase 6a: Source parser runs before pipeline to discover/update evidence
 *           Requires BRAVE_SEARCH_API_KEY in .env. Skips gracefully if missing.
 * Phase 6b: Relevance classifier filters false positives via full-page Haiku AI.
 *           Added March 15, 2026.
 *
 * FLOW: Source Parser (6a) → Bot 1 (Research) → Bot 2 (Scoring) → Deterministic Scorer
 *       → Bot 3 (Material Safety) → Bot 4 (Challenge) → Bot 5 (Reconciliation)
 *
 * AXIS WEIGHTS (LOCKED March 11 2026 — Ray Shapley):
 *   Quality 35% | Durability 35% | Performance 30% — NEVER equal thirds.
 *   Deterministic override: always recalculate overall from axis scores,
 *   never trust AI arithmetic.
 *
 * CHANGE LOG:
 *   March 14, 2026: Phase 6a source parser integration
 *   March 14, 2026: Evidence pin policy fix — CERTIFICATION_FLOOR no longer pins
 *   March 14, 2026: Performance axis weights fixed (was equal thirds)
 *   March 14, 2026: Fiberglass-as-vinyl bug fix in orchestrator
 *   March 16, 2026: Phase 9 — Deterministic outlook + yellow finding reform
 *                    extractOutlook() now prefers orchestrator's deterministicOutlook
 *                    over Bot 2's judgment-based outlook
 */

const { runPipeline } = require('./bot_orchestrator_v3');
const { selfCorrect } = require('./self_corrector');
const { diagnose, executeAutoFix, diagLog } = require('./diagnose');
const { parseSourcesForProduct, buildEvidenceFile } = require('./source_parser');
const db = require('./db');
const fs = require('fs');
const path = require('path');
const https = require('https');
require('dotenv').config({path: '/Users/Residentialist/.openclaw/workspace/residentialist/.env'});
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const MAX_ATTEMPTS = 2;
const MAX_ERROR_RETRIES = 3;

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

// ── SCORE EXTRACTION ─────────────────────────────────────────────────────────

function extractScore(result) {
  if (result.bot2Parsed && result.bot2Parsed.overall_score != null) {
    return String(result.bot2Parsed.overall_score);
  }
  const o = result.bot2Output || '';
  const m = o.match(/[Oo]verall[:\s*]*(\d+\.\d+)/) || o.match(/(\d+\.\d+)\s*\/\s*10/);
  return m ? m[1] : '?';
}

function extractGrade(result) {
  if (result.bot2Parsed && result.bot2Parsed.grade) {
    return result.bot2Parsed.grade;
  }
  const o = result.bot2Output || '';
  const m = o.match(/[Gg]rade[:\s*]*([A-C][+-]?)/) || o.match(/\b([A-C][+-])\b/);
  return m ? m[1] : '';
}

function extractOutlook(result) {
  // Phase 9: Prefer deterministic outlook computed by orchestrator (criteria-based)
  // over Bot 2's judgment-based outlook. Falls back to Bot 2 for backward compat.
  if (result.deterministicOutlook) {
    return result.deterministicOutlook;
  }
  if (result.bot2Parsed && result.bot2Parsed.outlook) {
    return result.bot2Parsed.outlook;
  }
  return '';
}

function extractAxisScores(result) {
  // Primary path: structured JSON from Bot 2 (scores.{axis}.axis_score)
  const s = result.bot2Parsed && result.bot2Parsed.scores;
  if (s && s.quality && s.quality.axis_score != null) {
    return {
      quality: s.quality.axis_score,
      durability: s.durability ? s.durability.axis_score : null,
      performance: s.performance ? s.performance.axis_score : null
    };
  }
  // Legacy path: flat fields (quality_score, durability_score, performance_score)
  if (result.bot2Parsed && result.bot2Parsed.quality_score != null) {
    return {
      quality: result.bot2Parsed.quality_score,
      durability: result.bot2Parsed.durability_score || null,
      performance: result.bot2Parsed.performance_score || null
    };
  }
  const o = result.bot2Output || '';

  // Extract axis score from markdown text using multiple patterns
  function extractAxis(name) {
    // Pattern: "**Quality:** C- (4.70)" or "Quality: C+ (6.43/10)"
    const p1 = new RegExp(name + '[^0-9]*([A-F][+-]?)\\s*\\(?([0-9]+\\.?[0-9]*)(?:/10)?', 'i');
    const m1 = o.match(p1);
    if (m1 && m1[2]) return parseFloat(m1[2]);

    // Pattern: "Quality Calculation:" or "Quality:" followed by "= X.XX" or "**X.XX**"
    const section = new RegExp(name + '\\s*(?:Calculation|Score)?[:\\s][\\s\\S]{0,500}?(?:=|Score:)\\s*\\*{0,2}([0-9]+\\.?[0-9]*)\\*{0,2}', 'i');
    const m2 = o.match(section);
    if (m2) return parseFloat(m2[1]);

    return null;
  }

  const quality = extractAxis('Quality');
  const durability = extractAxis('Durability');
  const performance = extractAxis('Performance');

  if (quality != null || durability != null || performance != null) {
    return { quality, durability, performance };
  }

  // Fallback: extract from "Overall = (X + Y + Z)" line
  const overallMatch = o.match(/Overall.*?=.*?\(([0-9.]+)\s*[+]\s*([0-9.]+)\s*[+]\s*([0-9.]+)\s*\)/i);
  if (overallMatch) {
    return {
      quality: parseFloat(overallMatch[1]),
      durability: parseFloat(overallMatch[2]),
      performance: parseFloat(overallMatch[3])
    };
  }

  return { quality: null, durability: null, performance: null };
}

// ── DETERMINISTIC SCORE RECALCULATION ────────────────────────────────────────
// LOCKED WEIGHTS (March 11 2026 — Ray Shapley): Quality 35%, Durability 35%, Performance 30%
// Never trust the AI arithmetic. Always recalculate from axis scores.
const AXIS_WEIGHTS = { quality: 0.35, durability: 0.35, performance: 0.30 };

function recalculateOverall(axis) {
  if (axis.quality == null || axis.durability == null || axis.performance == null) return null;
  const q = parseFloat(axis.quality);
  const d = parseFloat(axis.durability);
  const p = parseFloat(axis.performance);
  if (isNaN(q) || isNaN(d) || isNaN(p)) return null;
  return Math.round((q * AXIS_WEIGHTS.quality + d * AXIS_WEIGHTS.durability + p * AXIS_WEIGHTS.performance) * 100) / 100;
}

function assignGrade(score) {
  if (score == null) return '?';
  if (score >= 9.5) return 'A+';
  if (score >= 9.0) return 'A';
  if (score >= 8.5) return 'A-';
  if (score >= 8.0) return 'B+';
  if (score >= 7.5) return 'B';
  if (score >= 7.0) return 'B-';
  if (score >= 6.5) return 'C+';
  if (score >= 6.0) return 'C';
  if (score >= 5.5) return 'C-';
  if (score >= 5.0) return 'D+';
  if (score >= 4.5) return 'D';
  if (score >= 4.0) return 'D-';
  return 'F';
}



function summarizeFlags(o) {
  return o.split('\n').filter(l => l.includes('FLAG') && l.includes('###')).slice(0,3).map(l => l.replace(/#+\s*/,'').trim()).join('\n');
}

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
  return { section, confidence, undisclosedCount };
}

// ── MAIN RUNNER ──────────────────────────────────────────────────────────────

async function runWithAutoCorrection(productName, config, category, researchFiles = [], { force = false } = {}) {
  console.log(`\n[AUTO-RUNNER] Starting: ${productName} (${config})${force ? ' [FORCE RE-SCORE]' : ''}`);

  // Phase 5: Check if already scored (skip if --force)
  if (!force && db.isScored(productName, config)) {
    const existing = db.getScore(productName, config);
    console.log(`[AUTO-RUNNER] Already scored: ${productName} (${config}) — ${existing.overall} ${existing.grade}`);
    await sendTelegram(`ℹ️ *${productName} (${config})* already scored: *${existing.overall}/10 ${existing.grade}*\n_Use RERUN to re-score._`);
    return { status: 'ALREADY_SCORED', productName, config, existing };
  }
  if (force && db.isScored(productName, config)) {
    const existing = db.getScore(productName, config);
    console.log(`[AUTO-RUNNER] Force re-score: ${productName} (${config}) — previous: ${existing.overall} ${existing.grade}`);
    await sendTelegram(`🔁 *Force re-score*\n${productName} — previous: *${existing.overall}/10 ${existing.grade}*`);
  }

  await sendTelegram(`🔄 *Pipeline starting*\n${productName} — ${config}`);
  const startTime = Date.now();

  // ── Phase 6: Source Parser — discover/update evidence before scoring ──
  if (process.env.BRAVE_SEARCH_API_KEY) {
    try {
      console.log(`[AUTO-RUNNER] Phase 6: Running source parser for ${productName}...`);
      const productSlug = productName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
      const evidenceSlug = `${productSlug}_${config.toLowerCase()}`;
      const evidencePath = path.join(__dirname, 'evidence', `${evidenceSlug}.json`);

      let existingEvidence = null;
      try {
        existingEvidence = JSON.parse(fs.readFileSync(evidencePath, 'utf-8'));
        console.log(`[AUTO-RUNNER] Phase 6: Found existing evidence file — will merge`);
      } catch (e) {
        console.log(`[AUTO-RUNNER] Phase 6: No existing evidence file — will create new`);
      }

      const parserResult = await parseSourcesForProduct(productName, config, category, evidencePath);
      const sourceCount = (parserResult.sources || []).length;
      const poolA = (parserResult.sources || []).filter(s => s.pool === 'A').length;
      const poolB = (parserResult.sources || []).filter(s => s.pool === 'B').length;
      const poolC = (parserResult.sources || []).filter(s => s.pool === 'C').length;
      console.log(`[AUTO-RUNNER] Phase 6: Found ${sourceCount} sources (Pool A: ${poolA}, B: ${poolB}, C: ${poolC})`);

      // Build/merge evidence file
      const updatedEvidence = buildEvidenceFile(parserResult, existingEvidence);
      fs.mkdirSync(path.dirname(evidencePath), { recursive: true });
      fs.writeFileSync(evidencePath, JSON.stringify(updatedEvidence, null, 2));
      console.log(`[AUTO-RUNNER] Phase 6: Evidence file written to ${evidencePath}`);

      const rejected6b = (parserResult.meta?.phase_6b_rejected) || 0;
      if (sourceCount > 0) {
        const rejectedNote = rejected6b > 0 ? `\n🔍 Phase 6b: ${rejected6b} false positive(s) removed` : '';
        await sendTelegram(`📚 *Source parser complete*\n${productName}: ${sourceCount} sources found\nPool A: ${poolA} | B: ${poolB} | C: ${poolC}${rejectedNote}`);
      }
    } catch (err) {
      // Source parser failure is non-fatal — pipeline can still run with existing evidence
      console.error(`[AUTO-RUNNER] Phase 6 error (non-fatal): ${err.message}`);
      await sendTelegram(`⚠️ Source parser failed for ${productName} — continuing with existing evidence\n${err.message.slice(0, 150)}`);
    }
  } else {
    console.log('[AUTO-RUNNER] Phase 6: Skipped — no BRAVE_SEARCH_API_KEY in env');
  }

  let attempt = 0;
  let errorRetries = 0;

  while (attempt <= MAX_ATTEMPTS) {
    attempt++;
    let result;
    try { result = await runPipeline(productName, config, researchFiles); }
    catch (err) {
      // Phase 4: Diagnose before alerting Ray
      diagLog(`Pipeline error for ${productName}: ${err.message}`);
      const diag = await diagnose({
        error: err.message + '\n' + (err.stack || ''),
        context: `Pipeline execution for ${productName} (${config})`,
        attempt: errorRetries,
        product: productName,
        step: 'pipeline'
      });

      if (diag.autoFixed && diag.action === 'RETRY' && errorRetries < MAX_ERROR_RETRIES) {
        errorRetries++;
        await executeAutoFix(diag, { product: productName, config, category });
        diagLog(`Auto-retry ${errorRetries}/${MAX_ERROR_RETRIES} for ${productName}`);
        attempt--;
        continue;
      }

      if (diag.autoFixed && diag.action === 'RESTART_PIPELINE' && errorRetries < MAX_ERROR_RETRIES) {
        errorRetries++;
        await executeAutoFix(diag, { product: productName, config, category });
        diagLog(`Auto-restart pipeline for ${productName}`);
        attempt = 0;
        continue;
      }

      // Record failed run in DB
      const duration = Math.round((Date.now() - startTime) / 1000);
      db.saveRun({
        product: productName, config, status: 'ERROR',
        attempts: attempt, errorCount: errorRetries + 1,
        durationSeconds: duration, notes: `Error: ${err.message.slice(0, 200)}`
      });

      await sendTelegram(`❌ *Pipeline error — ${productName}*\n${diag.reason}\n\n_${err.message.slice(0,200)}_`);
      throw err;
    }

    errorRetries = 0;

    if (result.status === 'PASS') {
      const aiScore = extractScore(result);
      const aiGrade = extractGrade(result);
      const outlook = extractOutlook(result);
      const axis = extractAxisScores(result);

      // DETERMINISTIC OVERRIDE: Recalculate overall from axis scores using locked 35/35/30 weights
      const deterministicOverall = recalculateOverall(axis);
      const score = deterministicOverall != null ? String(deterministicOverall) : aiScore;
      const grade = deterministicOverall != null ? assignGrade(deterministicOverall) : aiGrade;
      if (deterministicOverall != null && Math.abs(deterministicOverall - parseFloat(aiScore)) > 0.1) {
        console.log('[AUTO-RUNNER] WEIGHT CORRECTION: AI said ' + aiScore + ' (' + aiGrade + '), recalculated to ' + score + ' (' + grade + ') using 35/35/30 weights');
      }
      const note = attempt > 1 ? `\n_(self-corrected after ${attempt-1} attempt${attempt>2?'s':''})_` : '';

      // Generate and append data confidence
      const { section, confidence, undisclosedCount } = generateDataConfidence(
        result.bot2Output || '', result.challengeResult || ''
      );
      if (result.outputDir && result.bot2Output) {
        const fs = require('fs');
        fs.appendFileSync(`${result.outputDir}/PIPELINE_STATUS.txt`, section);
      }

      // Phase 5: Save to database
      const duration = Math.round((Date.now() - startTime) / 1000);
      const overall = parseFloat(score);
      try {
        db.saveScore({
          product: productName, config, category,
          overall: isNaN(overall) ? null : overall,
          grade, outlook,
          quality: axis.quality, durability: axis.durability, performance: axis.performance,
          dataConfidence: confidence, undisclosedCount,
          source: 'pipeline',
          runDir: result.outputDir ? require('path').basename(result.outputDir) : null,
          notes: attempt > 1 ? `Self-corrected after ${attempt-1} attempt(s)` : null
        });
        db.saveRun({
          product: productName, config,
          runDir: result.outputDir ? require('path').basename(result.outputDir) : null,
          status: 'PASS', attempts: attempt, errorCount: 0,
          selfCorrected: attempt > 1, durationSeconds: duration
        });
        console.log(`[AUTO-RUNNER] Score saved to DB: ${productName} ${score} ${grade}`);

        // Save material class and group (clad vs non-clad) — March 14, 2026
        const materialClass = result.bot2Parsed?.locked_material_class
          || result.bot2Parsed?.scores?.durability?.materials_durability?.material_class
          || null;
        if (materialClass) {
          const matInfo = db.setMaterialInfo(productName, materialClass);
          console.log(`[AUTO-RUNNER] Material info: ${materialClass} → group: ${matInfo.materialGroup}`);
        }
      } catch (dbErr) {
        console.error(`[AUTO-RUNNER] DB write failed (non-fatal): ${dbErr.message}`);
      }

      const outlookStr = outlook ? `  Outlook: *${outlook}*` : '';
      await sendTelegram(`✅ *PASS — ${productName} (${config})*\nScore: *${score}/10*  Grade: *${grade}*${outlookStr}${note}`);
      return result;
    }

    if (attempt <= MAX_ATTEMPTS) {
      await sendTelegram(`⚠️ *FLAG — ${productName}*\nAttempt ${attempt}/${MAX_ATTEMPTS} — self-correcting...\n${summarizeFlags(result.challengeResult||'').slice(0,200)}`);
      const correction = await selfCorrect(productName, config, category, result.bot1Output||'', result.bot2Output||'', result.challengeResult||'');
      if (correction.action === 'escalate') {
        const duration = Math.round((Date.now() - startTime) / 1000);
        db.saveRun({
          product: productName, config, status: 'ESCALATED',
          attempts: attempt, durationSeconds: duration,
          notes: `Escalated: ${correction.reason.slice(0, 200)}`
        });
        await sendTelegram(`🚨 *ESCALATION — ${productName}*\n\n${correction.reason.slice(0,600)}\n\n_Open Claude and review. Pipeline halted._`);
        return { status: 'ESCALATED', productName, config, reason: correction.reason };
      }
    }
  }

  const duration = Math.round((Date.now() - startTime) / 1000);
  db.saveRun({
    product: productName, config, status: 'ESCALATED',
    attempts: MAX_ATTEMPTS, durationSeconds: duration,
    notes: 'Max attempts reached'
  });
  await sendTelegram(`🚨 *ESCALATION — ${productName}*\nFailed after ${MAX_ATTEMPTS} attempts. Human review required.`);
  return { status: 'ESCALATED', productName, config };
}

module.exports = { runWithAutoCorrection, sendTelegram, generateDataConfidence };

if (require.main === module) {
  const args = process.argv.slice(2);
  const forceFlag = args.includes('--force');
  const positional = args.filter(a => a !== '--force');
  if (positional.length < 3) { console.log('Usage: node auto_runner.js "Product Name" CONFIG category [--force]'); process.exit(1); }
  runWithAutoCorrection(positional[0], positional[1], positional[2], positional.slice(3), { force: forceFlag })
    .then(r => { db.close(); process.exit(r.status === 'PASS' ? 0 : 1); })
    .catch(err => {
      console.error('[AUTO-RUNNER] FATAL:', err);
      const fs = require('fs');
      try {
        fs.writeFileSync('/tmp/auto_runner_crash.log',
          `[${new Date().toISOString()}] FATAL: ${err.message}\n${err.stack}\n`);
      } catch(e) {}
      db.close();
      sendTelegram(`❌ *FATAL CRASH*\n${args[0]}\n${err.message.slice(0,300)}`).finally(() => process.exit(1));
    });
}
