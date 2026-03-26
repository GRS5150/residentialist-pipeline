#!/usr/bin/env node
/**
 * score_from_curation.js — Standalone curation-to-score pipeline
 *
 * Usage: node score_from_curation.js <curation_slug> <category> <config>
 * Example: node score_from_curation.js pella_250_series_double_hung windows DH
 *
 * Flow:
 *   1. Reads curation/<slug>_sources.json
 *   2. Extracts 'score' sources → builds synthetic Bot 1 consensus
 *   3. Calls runPipeline() from bot_orchestrator_v3.js with skipBot1
 *   4. Pipeline writes output to outputs/<slug>_<timestamp>/
 *   5. Reads DETERMINISTIC_SCORES.json and writes to SQLite products.db
 */

const fs = require('fs');
const path = require('path');

const WORKSPACE = '/Users/Residentialist/.openclaw/workspace/residentialist';
const CURATION_DIR = path.join(WORKSPACE, 'curation');
const DEEP_DIVES_DIR = path.join(WORKSPACE, 'deep_dives');
const DB_PATH = path.join(WORKSPACE, 'products.db');

// ═══════════════════════════════════════════════════════════════════════════════
// Args
// ═══════════════════════════════════════════════════════════════════════════════
const [,, curationSlug, category, config] = process.argv;

if (!curationSlug || !config) {
  console.error('Usage: node score_from_curation.js <curation_slug> <category> <config>');
  console.error('Example: node score_from_curation.js pella_250_series_double_hung windows DH');
  process.exit(1);
}

// Derive product name from slug (strip config suffix like _double_hung)
const configSuffixes = ['_double_hung', '_casement', '_sliding', '_awning', '_picture', '_hopper', '_bay', '_bow'];
let productSlug = curationSlug;
for (const suffix of configSuffixes) {
  if (productSlug.endsWith(suffix)) {
    productSlug = productSlug.slice(0, -suffix.length);
    break;
  }
}
const productName = productSlug.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

console.log(`[SCORE_FROM_CURATION] Product: ${productName}`);
console.log(`[SCORE_FROM_CURATION] Config: ${config}`);
console.log(`[SCORE_FROM_CURATION] Curation slug: ${curationSlug}`);
console.log(`[SCORE_FROM_CURATION] Product slug: ${productSlug}`);

// ═══════════════════════════════════════════════════════════════════════════════
// Step 1: Read curation sources
// ═══════════════════════════════════════════════════════════════════════════════

const sourcesPath = path.join(CURATION_DIR, `${curationSlug}_sources.json`);
if (!fs.existsSync(sourcesPath)) {
  console.error(`[SCORE_FROM_CURATION] Sources file not found: ${sourcesPath}`);
  process.exit(1);
}

const sourcesRaw = JSON.parse(fs.readFileSync(sourcesPath, 'utf8'));
const allSources = Array.isArray(sourcesRaw) ? sourcesRaw : (sourcesRaw.sources || []);
const scoreSources = allSources.filter(s => s.classification === 'score');
const reportSources = allSources.filter(s => s.classification === 'report_only');

console.log(`[SCORE_FROM_CURATION] Sources: ${allSources.length} total, ${scoreSources.length} score, ${reportSources.length} report_only`);

if (scoreSources.length === 0) {
  console.error('[SCORE_FROM_CURATION] No score sources found. Nothing to score.');
  process.exit(1);
}

// ═══════════════════════════════════════════════════════════════════════════════
// Step 2: Load deep dive structured output and raw report
// ═══════════════════════════════════════════════════════════════════════════════

let structuredOutput = {};
let rawReport = '';

const structuredPath = path.join(DEEP_DIVES_DIR, curationSlug, 'structured_output.json');
const rawReportPath = path.join(DEEP_DIVES_DIR, curationSlug, 'raw_perplexity_report.md');

if (fs.existsSync(structuredPath)) {
  structuredOutput = JSON.parse(fs.readFileSync(structuredPath, 'utf8'));
  console.log('[SCORE_FROM_CURATION] Loaded structured output');
}
if (fs.existsSync(rawReportPath)) {
  rawReport = fs.readFileSync(rawReportPath, 'utf8');
  console.log(`[SCORE_FROM_CURATION] Loaded raw report (${rawReport.length} chars)`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// Step 3: Build synthetic Bot 1 consensus
// ═══════════════════════════════════════════════════════════════════════════════

// Detect material class from structured output
const verifiedSpecs = structuredOutput.verified_specs || {};
let materialClass = verifiedSpecs.frame_material || verifiedSpecs.material_class || '';
if (!materialClass) {
  const specText = JSON.stringify(verifiedSpecs).toLowerCase();
  if (specText.includes('vinyl') || specText.includes('pvc') || specText.includes('extruded rigid')) materialClass = 'Vinyl';
  else if (specText.includes('fiberglass') || specText.includes('pultruded')) materialClass = 'Fiberglass';
  else if (specText.includes('aluminum-clad wood')) materialClass = 'Aluminum-clad wood';
  else if (specText.includes('wood')) materialClass = 'Wood';
  else if (specText.includes('aluminum')) materialClass = 'Aluminum';
  else materialClass = 'Unknown — see specs';
}
console.log(`[SCORE_FROM_CURATION] Material class: ${materialClass}`);

// Build the consensus document
let consensus = `# ${productName} — Deep Dive Research Consensus\n\n`;
consensus += `**Product:** ${productName}\n`;
consensus += `**Configuration:** ${config}\n`;
consensus += `**Category:** ${category || 'windows'}\n`;
consensus += `**Sources evaluated:** ${scoreSources.length} curated score sources\n\n`;

// Verified specifications
if (Object.keys(verifiedSpecs).length > 0) {
  consensus += `## VERIFIED SPECIFICATIONS\n\n`;
  for (const [key, value] of Object.entries(verifiedSpecs)) {
    consensus += `- **${key}:** ${typeof value === 'object' ? JSON.stringify(value) : value}\n`;
  }
  consensus += '\n';
}

// Material class declaration
consensus += `## MATERIAL CLASS\n\n`;
consensus += `${materialClass}\n\n`;
consensus += `IMPORTANT: The material class above is the verified classification from the deep dive curation. `;
consensus += `Any references to other material classes in the source data below may pertain to competitor products `;
consensus += `or different product lines — they should NOT override this classification.\n\n`;

// Curated score sources as evidence
consensus += `## CURATED EVIDENCE SOURCES\n\n`;
consensus += `The following ${scoreSources.length} sources have been individually reviewed and classified as scoring evidence.\n\n`;

for (let i = 0; i < scoreSources.length; i++) {
  const src = scoreSources[i];
  consensus += `### Source ${i + 1}: ${src.title || src.source_name || 'Untitled'}\n`;
  consensus += `- **URL:** ${src.url || 'N/A'}\n`;
  consensus += `- **Type:** ${src.source_type || src.type || 'unknown'}\n`;
  if (src.pool) consensus += `- **Pool:** ${src.pool}\n`;
  if (src.notes) consensus += `- **Curator notes:** ${src.notes}\n`;
  consensus += '\n';

  // Include the source content
  const content = src.content || src.summary || src.extracted_text || '';
  if (content) {
    consensus += content.substring(0, 8000) + '\n\n';
  }
  consensus += '---\n\n';
}

// Strict scoring boundary — do NOT include raw report (contains report_only sources)
consensus += `## SCORING BOUNDARY\n\n`;
consensus += `CRITICAL: The ${scoreSources.length} sources listed above are the ONLY sources approved for scoring.\n`;
consensus += `${reportSources.length} additional sources were classified as 'report_only' during curation and are EXCLUDED from scoring.\n`;
consensus += `Do NOT reference, cite, or factor in any information not present in the curated evidence sources above.\n`;
consensus += `If a finding (lawsuit, recall, complaint pattern) does not appear in the curated score sources, it must NOT affect axis scores.\n\n`;
consensus += `## PRODUCT SCOPE\n\n`;
consensus += `CRITICAL: Only evaluate findings that are specifically about the ${productName} ${config}.\n`;
consensus += `Do NOT penalize this product for lawsuits, recalls, defects, or complaints that apply to other product lines from the same manufacturer.\n`;
consensus += `A CPSC recall for sliding patio doors does NOT apply to double-hung windows.\n`;
consensus += `A class action about a different product series does NOT apply to the ${productName}.\n`;
consensus += `Each RED or YELLOW finding MUST cite a source that specifically names the ${productName} ${config} configuration.\n\n`;

if (rawReport) {
  console.log(`[SCORE_FROM_CURATION] Raw Perplexity report available (${rawReport.length} chars) — EXCLUDED from consensus to prevent report_only source leakage`);
}

console.log(`[SCORE_FROM_CURATION] Built synthetic Bot 1 consensus: ${consensus.length} chars`);

// ═══════════════════════════════════════════════════════════════════════════════
// Step 4: Write consensus to temp file and run pipeline
// ═══════════════════════════════════════════════════════════════════════════════

const tmpConsensusPath = path.join(WORKSPACE, 'inputs', `${productSlug}_curation_consensus.md`);
fs.mkdirSync(path.dirname(tmpConsensusPath), { recursive: true });
fs.writeFileSync(tmpConsensusPath, consensus);
console.log(`[SCORE_FROM_CURATION] Wrote consensus to: ${tmpConsensusPath}`);

// Write progress for polling
function writeProgress(step, total, botName, status) {
  const data = {
    slug: curationSlug,
    step, total,
    current_bot: botName,
    status,
    started_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  const progressPath = path.join(CURATION_DIR, `${curationSlug}_pipeline_progress.json`);
  try { fs.writeFileSync(progressPath, JSON.stringify(data, null, 2)); } catch (e) {}
  if (productSlug !== curationSlug) {
    const altPath = path.join(CURATION_DIR, `${productSlug}_pipeline_progress.json`);
    try { fs.writeFileSync(altPath, JSON.stringify(data, null, 2)); } catch (e) {}
  }
}

writeProgress(0, 6, 'Starting', 'running');

// ═══════════════════════════════════════════════════════════════════════════════
// Evidence file quarantine — prevent old evidence from leaking into pipeline
// ═══════════════════════════════════════════════════════════════════════════════

const EVIDENCE_DIR = path.join(WORKSPACE, 'evidence');

function quarantineEvidenceFiles() {
  const patterns = [
    `${productSlug}_${config.toLowerCase()}.json`,
    `${productSlug}_dh.json`,
    `${curationSlug}.json`
  ];
  const quarantined = [];
  for (const pattern of patterns) {
    const evidencePath = path.join(EVIDENCE_DIR, pattern);
    if (fs.existsSync(evidencePath)) {
      const bakPath = evidencePath + '.bak';
      fs.renameSync(evidencePath, bakPath);
      quarantined.push({ original: evidencePath, backup: bakPath });
      console.log(`[SCORE_FROM_CURATION] Quarantined evidence file: ${pattern} → ${pattern}.bak`);
    }
  }
  return quarantined;
}

function restoreEvidenceFiles(quarantined) {
  for (const { original, backup } of quarantined) {
    try {
      if (fs.existsSync(backup)) {
        fs.renameSync(backup, original);
        console.log(`[SCORE_FROM_CURATION] Restored evidence file: ${path.basename(original)}`);
      }
    } catch (e) {
      console.error(`[SCORE_FROM_CURATION] Failed to restore evidence file: ${e.message}`);
    }
  }
}

async function main() {
  let quarantined = [];
  try {
    const orchestrator = require('./bot_orchestrator_v3.js');

    // Quarantine old evidence files so Bot 2 only sees curated sources
    quarantined = quarantineEvidenceFiles();

    console.log('[SCORE_FROM_CURATION] Calling runPipeline...');
    writeProgress(1, 6, 'Bot 1 (Skipped — curated)', 'running');

    const result = await orchestrator.runPipeline(productName, config, [tmpConsensusPath], {
      skipBot1: true,
      curationSlug: curationSlug,
      category: category || 'windows'
    });

    console.log(`[SCORE_FROM_CURATION] Pipeline completed. Output: ${result?.outputDir || 'unknown'}`);
    writeProgress(6, 6, 'Complete', 'done');

    // Restore evidence files before DB update
    restoreEvidenceFiles(quarantined);
    quarantined = [];

    await updateDatabase(result?.outputDir);

  } catch (err) {
    console.error(`[SCORE_FROM_CURATION] Pipeline failed:`, err.message);
    writeProgress(0, 6, 'Error: ' + err.message.substring(0, 100), 'error');
    // Always restore evidence files on error
    restoreEvidenceFiles(quarantined);
    process.exit(1);
  }
}

async function updateDatabase(outputDir) {
  try {
    if (!outputDir) {
      const outputsDir = path.join(WORKSPACE, 'outputs');
      const dirs = fs.readdirSync(outputsDir)
        .filter(d => d.startsWith(productSlug + '_'))
        .sort()
        .reverse();
      if (dirs.length > 0) {
        outputDir = path.join(outputsDir, dirs[0]);
      }
    }

    if (!outputDir || !fs.existsSync(outputDir)) {
      console.error('[SCORE_FROM_CURATION] No output directory found');
      return;
    }

    console.log(`[SCORE_FROM_CURATION] Reading scores from: ${outputDir}`);

    let score = null, grade = null, outlook = null;
    let qualityScore = null, durabilityScore = null, performanceScore = null;
    let calibrationVersion = null;

    // Try DETERMINISTIC_SCORES.json (preferred — has geometric mean + axis stretch)
    const detScorePath = path.join(outputDir, 'DETERMINISTIC_SCORES.json');
    if (fs.existsSync(detScorePath)) {
      const det = JSON.parse(fs.readFileSync(detScorePath, 'utf8'));

      if (det.axis_scores) {
        qualityScore = det.axis_scores.quality?.final || det.axis_scores.quality?.raw;
        durabilityScore = det.axis_scores.durability?.final || det.axis_scores.durability?.raw;
        performanceScore = det.axis_scores.performance?.final || det.axis_scores.performance?.raw;
      }

      if (det.component_quality && det.manufacturing_quality && det.materials_durability) {
        const cq = det.component_quality.score || 0;
        const mq = det.manufacturing_quality.score || 0;
        const pc = det.professional_consensus?.score || 5;
        const md = det.materials_durability.score || 5;
        const rp = det.repairability?.score || 5;
        console.log(`[SCORE_FROM_CURATION] DETERMINISTIC subscores: CQ=${cq}, MQ=${mq}, PC=${pc}, MD=${md}, RP=${rp}`);
      }

      score = det.overall_score || det.final_score;
      grade = det.grade;
      calibrationVersion = det.calibration_version;
      if (score) console.log(`[SCORE_FROM_CURATION] From DETERMINISTIC_SCORES: score=${score}, grade=${grade}, method=${det.scoring_method}`);
    }

    // Try PIPELINE_STATUS.json
    if (!score) {
      const statusPath = path.join(outputDir, 'PIPELINE_STATUS.json');
      if (fs.existsSync(statusPath)) {
        const status = JSON.parse(fs.readFileSync(statusPath, 'utf8'));
        score = status.overall_score || status.scores?.overall_score;
        grade = grade || status.grade || status.scores?.grade;
        outlook = outlook || status.outlook || status.scores?.outlook;
        console.log(`[SCORE_FROM_CURATION] From PIPELINE_STATUS: score=${score}, grade=${grade}, outlook=${outlook}`);
      }
    }

    // Try bot2 evaluator output
    if (!score) {
      const bot2Files = fs.readdirSync(outputDir).filter(f => f.includes('bot2') && f.endsWith('.json'));
      for (const bf of bot2Files) {
        const bot2 = JSON.parse(fs.readFileSync(path.join(outputDir, bf), 'utf8'));
        score = score || bot2.overall_score;
        grade = grade || bot2.grade;
        outlook = outlook || bot2.outlook;

        // Pull axis scores from Bot 2 if not already from deterministic
        if (!qualityScore && bot2.scores?.quality?.axis_score) {
          qualityScore = bot2.scores.quality.axis_score;
          durabilityScore = bot2.scores.durability?.axis_score;
          performanceScore = bot2.scores.performance?.axis_score;
        }
      }
      if (score) console.log(`[SCORE_FROM_CURATION] From Bot 2: score=${score}, grade=${grade}, outlook=${outlook}`);
    }

    // Get outlook from PIPELINE_STATUS if not set
    if (!outlook) {
      const statusPath = path.join(outputDir, 'PIPELINE_STATUS.json');
      if (fs.existsSync(statusPath)) {
        const status = JSON.parse(fs.readFileSync(statusPath, 'utf8'));
        outlook = status.outlook || status.scores?.outlook || 'Unknown';
      }
    }

    if (!score) {
      console.log('[SCORE_FROM_CURATION] No score found in output files');
      return;
    }

    // Convert score to 0-100 display scale if on 0-10 scale
    const displayScore = score <= 10 ? Math.round(score * 10) : Math.round(score);

    // Map grade to product_label
    const gradeMap = {
      'A+': 'Best In Class', 'A': 'Best In Class', 'A-': 'Best In Class',
      'B+': 'Above Average', 'B': 'Above Average', 'B-': 'Above Average',
      'C+': 'Average', 'C': 'Average', 'C-': 'Average',
      'D+': 'Below Average', 'D': 'Below Average', 'D-': 'Below Average',
      'F': 'Inadequate'
    };
    const productLabel = gradeMap[grade] || 'Average';

    // Write to SQLite — use residentialist.db
    const dbPath = path.join(WORKSPACE, 'residentialist.db');
    if (!fs.existsSync(dbPath)) {
      console.error('[SCORE_FROM_CURATION] Database not found:', dbPath);
      return;
    }

    const Database = require('better-sqlite3');
    const db = new Database(dbPath);

    // Look up by product_name (not slug)
    let row = db.prepare('SELECT id, product_name, product_line FROM products WHERE product_name LIKE ? AND product_line = ?')
      .get('%' + productSlug.replace(/_/g, ' ').replace('pella ', 'Pella ') + '%', config);
    if (!row) {
      row = db.prepare('SELECT id, product_name, product_line FROM products WHERE product_name LIKE ?')
        .get('%' + productName + '%');
    }

    if (row) {
      db.prepare(`UPDATE products SET 
        overall_score = ?,
        quality_score = ?,
        durability_score = ?,
        performance_score = ?,
        product_label = ?,
        calibration_version = ?,
        score_version = score_version + 1,
        last_scored = datetime('now')
        WHERE id = ?`).run(
        displayScore,
        qualityScore ? Math.round(qualityScore * 10) : null,
        durabilityScore ? Math.round(durabilityScore * 10) : null,
        performanceScore ? Math.round(performanceScore * 10) : null,
        productLabel,
        calibrationVersion || 'curated_v1',
        row.id
      );
      console.log(`[SCORE_FROM_CURATION] ✅ DB updated: id=${row.id}, name=${row.product_name}, score=${displayScore}/100, grade=${grade}, label=${productLabel}`);
      console.log(`[SCORE_FROM_CURATION]    Axes: Q=${qualityScore ? Math.round(qualityScore*10) : '?'}, D=${durabilityScore ? Math.round(durabilityScore*10) : '?'}, P=${performanceScore ? Math.round(performanceScore*10) : '?'}`);
    } else {
      console.log(`[SCORE_FROM_CURATION] ⚠️ Product not found in DB. Tried: %${productName}%`);
      const allProducts = db.prepare('SELECT id, product_name, product_line FROM products WHERE category = ?').all(category || 'windows');
      console.log('[SCORE_FROM_CURATION] Available products:', allProducts.map(r => `${r.product_name} (${r.product_line})`).join(', '));
    }

    db.close();

  } catch (dbErr) {
    console.error('[SCORE_FROM_CURATION] DB update error:', dbErr.message);
  }
}

main();

