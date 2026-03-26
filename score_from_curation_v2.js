#!/usr/bin/env node
/**
 * THE RESIDENTIALIST — Score From Curation V2 (Entry Point)
 * 
 * New 4-step pipeline:
 *   1. Sonnet Scorer — estimate axis scores from curated evidence
 *   2. Haiku Auditor — audit scores for contamination & consistency
 *   3. Score Calculator — geometric mean + axis stretch → final score
 *   4. Report Writer — editorial content (warranty, considerations, etc.)
 *
 * Usage: node score_from_curation_v2.js <slug> <category> <config>
 * Example: node score_from_curation_v2.js pella_250_series_double_hung windows DH
 */

require('dotenv').config();

const fs = require('fs');
const path = require('path');

const WORKSPACE = __dirname;  // Scripts live in the workspace root
const DB_PATH = path.join(WORKSPACE, 'residentialist.db');

// Pipeline modules
const sonnetScorer = require('./sonnet_scorer');
const haikuAuditor = require('./haiku_auditor');
const scoreCalculator = require('./score_calculator');
const reportWriter = require('./report_writer');

// ═══════════════════════════════════════════════════════════════════════════════
// Args
// ═══════════════════════════════════════════════════════════════════════════════
const [,, curationSlug, category = 'windows', config = 'DH'] = process.argv;

if (!curationSlug) {
  console.error('Usage: node score_from_curation_v2.js <curation_slug> <category> <config>');
  console.error('Example: node score_from_curation_v2.js pella_250_series_double_hung windows DH');
  process.exit(1);
}

// Derive product slug (strip config suffix)
const productSlug = curationSlug.replace(/_double_hung|_casement|_awning|_sliding/g, '');

// ═══════════════════════════════════════════════════════════════════════════════
// Progress Writer
// ═══════════════════════════════════════════════════════════════════════════════
function writeProgress(step, total, label, status) {
  const progressPath = path.join(WORKSPACE, 'curation', `${curationSlug}_pipeline_progress.json`);
  const data = {
    slug: curationSlug,
    step,
    total: 4,
    current_bot: label,
    status,
    updated: new Date().toISOString()
  };
  try {
    fs.writeFileSync(progressPath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.warn(`[V2] Could not write progress: ${err.message}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Database Write
// ═══════════════════════════════════════════════════════════════════════════════
function writeToDatabase(slug, scoreResult, reportResult) {
  try {
    const dbPath = fs.existsSync(DB_PATH) ? DB_PATH : path.join(WORKSPACE, 'products.db');
    if (!fs.existsSync(dbPath)) {
      console.error('[V2] Database not found at:', dbPath);
      return;
    }

    const Database = require('better-sqlite3');
    const db = new Database(dbPath);

    // Find product by flexible name matching + config
    const searchName = productSlug.replace(/_/g, '%');
    const configLower = (config || 'DH').toLowerCase();
    const configMatch = configLower === 'dh' ? 'DH' : configLower;

    // First try: match name AND config (for products with multiple variants)
    let product = db.prepare(`
      SELECT id, product_name, product_line FROM products
      WHERE LOWER(REPLACE(REPLACE(product_name, ' ', '_'), '-', '_')) LIKE ?
      AND LOWER(config) = LOWER(?)
    `).get(`%${productSlug}%`, configMatch);

    if (!product) {
      // Second try: match name only (single-variant products)
      product = db.prepare(`
        SELECT id, product_name, product_line FROM products
        WHERE LOWER(REPLACE(REPLACE(product_name, ' ', '_'), '-', '_')) LIKE ?
      `).get(`%${productSlug}%`);
    }

    if (!product) {
      // Third try: simpler name match
      product = db.prepare('SELECT id, product_name, product_line FROM products WHERE product_name LIKE ?')
        .get(`%${productSlug.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).replace(/ Series.*/, ' Series')}%`);
    }

    if (product) {
      // Update existing product
      const stmt = db.prepare(`
        UPDATE products SET
          overall_score = ?,
          quality_score = ?,
          durability_score = ?,
          performance_score = ?,
          product_label = ?,
          health_label = ?,
          price_positioning = ?,
          serviceability_summary = ?,
          warranty_display = ?,
          calibration_version = ?,
          deep_dive_status = 'scored',
          score_version = score_version + 1,
          last_scored = datetime('now')
        WHERE id = ?
      `);
      stmt.run(
        scoreResult.display_score,
        Math.round(scoreResult.quality_raw * 10),
        Math.round(scoreResult.durability_raw * 10),
        Math.round(scoreResult.performance_raw * 10),
        scoreResult.product_label,
        scoreResult.health_label,
        reportResult.price_positioning || null,
        reportResult.serviceability_summary || null,
        reportResult.warranty_reality ? JSON.stringify(reportResult.warranty_reality) : null,
        scoreResult.calibration_version || 'v2',
        product.id
      );
      console.log(`[V2] ✅ DB updated: id=${product.id}, name=${product.product_name}, score=${scoreResult.display_score}/100, label=${scoreResult.product_label}`);

      // Write buyer considerations if table exists
      try {
        const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='buyer_considerations'").get();
        if (tableExists && reportResult.buyer_considerations) {
          db.prepare('DELETE FROM buyer_considerations WHERE product_id = ?').run(product.id);
          const insertConsideration = db.prepare('INSERT INTO buyer_considerations (product_id, text, gate_passed) VALUES (?, ?, ?)');
          for (const bc of reportResult.buyer_considerations) {
            insertConsideration.run(product.id, bc.text, bc.gate || 1);
          }
          console.log(`[V2] ✅ Wrote ${reportResult.buyer_considerations.length} buyer considerations`);
        }
      } catch (bcErr) {
        console.warn(`[V2] Could not write buyer considerations: ${bcErr.message}`);
      }

      // Write to score_history if table exists
      try {
        const historyExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='score_history'").get();
        if (historyExists) {
          db.prepare(`
            INSERT INTO score_history (product_slug, product_name, action, new_score, new_label, calibration_version, composite_method, notes)
            VALUES (?, ?, 'rescore_v2', ?, ?, ?, 'geometric', 'Scored by new_pipeline_v2')
          `).run(
            curationSlug,
            product.product_name,
            scoreResult.display_score,
            scoreResult.product_label,
            scoreResult.calibration_version || 'v2'
          );
          console.log(`[V2] ✅ Score history recorded`);
        }
      } catch (shErr) {
        console.warn(`[V2] Could not write score history: ${shErr.message}`);
      }

    } else {
      console.log(`[V2] ⚠️ Product not found in database. Slug search: %${productSlug}%`);
      const all = db.prepare('SELECT id, product_name FROM products WHERE category = ?').all(category);
      console.log(`[V2] Available products: ${all.map(r => r.product_name).join(', ')}`);
    }

    db.close();
  } catch (err) {
    console.error(`[V2] Database error: ${err.message}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main Pipeline
// ═══════════════════════════════════════════════════════════════════════════════
async function main() {
  const startTime = Date.now();
  console.log('\n[V2] ════════════════════════════════════════════════════════════');
  console.log(`[V2] NEW PIPELINE V2: ${curationSlug}`);
  console.log(`[V2] Category: ${category} | Config: ${config}`);
  console.log('[V2] ════════════════════════════════════════════════════════════\n');

  // ── Step 0: Load data ──────────────────────────────────────────────────
  const curationPath = path.join(WORKSPACE, 'curation', `${curationSlug}_sources.json`);
  if (!fs.existsSync(curationPath)) {
    console.error(`[V2] Curation file not found: ${curationPath}`);
    process.exit(1);
  }
  const curation = JSON.parse(fs.readFileSync(curationPath, 'utf8'));
  const productName = curation.product_name || curation.product || curationSlug;

  console.log(`[V2] Product: ${productName}`);
  const v2ScoreSourceCount = (curation.sources || []).filter(s => s.classification === 'score').length;
  console.log(`[V2] Sources: ${(curation.sources || []).length} total, ${v2ScoreSourceCount} score, ${(curation.sources || []).filter(s => s.classification === 'report_only').length} report_only`);

  // ── Evidence Guard: refuse to score with fewer than 5 score sources ──
  if (v2ScoreSourceCount < 5) {
    console.error(`[V2] ❌ INSUFFICIENT EVIDENCE: only ${v2ScoreSourceCount} score sources (minimum 5 required)`);
    console.error(`[V2] Set deep_dive_status to 'insufficient_evidence'. Re-run deep dive to get more sources.`);
    try {
      const Database = require('better-sqlite3');
      const db = new Database(path.join(WORKSPACE, 'residentialist.db'));
      const searchSlug = productSlug.replace(/_/g, '%');
      db.prepare("UPDATE products SET deep_dive_status = 'insufficient_evidence' WHERE LOWER(REPLACE(REPLACE(product_name, ' ', '_'), '-', '_')) LIKE ?").run(`%${searchSlug}%`);
      db.close();
    } catch (_) {}
    process.exit(1);
  }

  // Load manufacturer data
  const mfgSlug = curation.manufacturer_slug;
  const mfgPath = mfgSlug ? path.join(WORKSPACE, 'manufacturers', `${mfgSlug}.json`) : null;
  let manufacturer = null;
  if (mfgPath && fs.existsSync(mfgPath)) {
    manufacturer = JSON.parse(fs.readFileSync(mfgPath, 'utf8'));
    console.log(`[V2] Loaded manufacturer: ${manufacturer.manufacturer_name || mfgSlug}`);
  } else {
    console.log(`[V2] No manufacturer file found for: ${mfgSlug || 'unknown'}`);
  }

  // Create timestamped output directory
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const outputDir = path.join(WORKSPACE, 'outputs', `${productSlug}_${timestamp}`);
  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`[V2] Output dir: ${outputDir}\n`);

  try {
    // ── Step 1: Sonnet Tier Classification ──────────────────────────────────
    writeProgress(1, 4, 'Sonnet Classifier', 'running');
    console.log('[V2] ── Step 1: Sonnet Tier Classification ────────────────────');
    const tierResult = await sonnetScorer.classify(curation, manufacturer, category);
    fs.writeFileSync(path.join(outputDir, 'SONNET_SCORES.json'), JSON.stringify(tierResult, null, 2));
    console.log(`[V2] Step 1 complete: Tier ${tierResult.tier} (${tierResult.tier_label}), anchor=${tierResult.closest_anchor}, position=${tierResult.above_or_below_anchor}\n`);

    // ── Step 2: Haiku Tier Audit ──────────────────────────────────────────
    writeProgress(2, 4, 'Haiku Auditor', 'running');
    console.log('[V2] ── Step 2: Haiku Tier Audit ──────────────────────────────');
    const auditResult = await haikuAuditor.auditTier(tierResult, curation, curationSlug);
    fs.writeFileSync(path.join(outputDir, 'HAIKU_AUDIT.json'), JSON.stringify(auditResult, null, 2));
    console.log(`[V2] Step 2 complete: tier_approved=${auditResult.tier_approved}, changed=${auditResult.tier_changed}, passed=${auditResult.audit_passed}\n`);

    // ── Step 3: Score Calculator (Tier-Based) ─────────────────────────────
    writeProgress(3, 4, 'Score Calculator', 'running');
    console.log('[V2] ── Step 3: Score Calculator (Tier-Based) ─────────────────');
    // Apply audited tier if Haiku changed it
    const finalTier = auditResult.tier_changed ? auditResult.tier_approved : tierResult.tier;
    const tierResultWithAudit = { ...tierResult, tier: finalTier };
    const scoreResult = scoreCalculator.compute(tierResultWithAudit, category, outputDir);
    scoreResult.product_name = productName;
    scoreResult.category = category;
    scoreResult.config = config;
    fs.writeFileSync(path.join(outputDir, 'DETERMINISTIC_SCORES.json'), JSON.stringify(scoreResult, null, 2));
    console.log(`[V2] Step 3 complete: ${scoreResult.display_score}/100 (${scoreResult.product_label}) — ${scoreResult.grade}\n`);

    // ── Step 4: Report Writer ─────────────────────────────────────────────
    writeProgress(4, 4, 'Report Writer', 'running');
    console.log('[V2] ── Step 4: Report Writer ──────────────────────────────────');
    const reportResult = await reportWriter.generate(curation, manufacturer, tierResultWithAudit, scoreResult);
    fs.writeFileSync(path.join(outputDir, 'REPORT.json'), JSON.stringify(reportResult, null, 2));
    console.log(`[V2] Step 4 complete: summary=${(reportResult.product_summary || '').length} chars, considerations=${(reportResult.buyer_considerations || []).length}\n`);

    // ── Write Pipeline Status ─────────────────────────────────────────────
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    const pipelineStatus = {
      status: 'COMPLETE',
      product: productName,
      slug: curationSlug,
      config: config,
      category: category,
      overall_score: scoreResult.display_score,
      grade: scoreResult.grade,
      product_label: scoreResult.product_label,
      tier: finalTier,
      tier_label: scoreResult.tier_label,
      closest_anchor: scoreResult.closest_anchor,
      audit_passed: auditResult.audit_passed,
      tier_changed: auditResult.tier_changed,
      pipeline_version: 'tier_v1',
      elapsed_seconds: elapsed,
      completed_at: new Date().toISOString()
    };
    fs.writeFileSync(path.join(outputDir, 'PIPELINE_STATUS.json'), JSON.stringify(pipelineStatus, null, 2));
    fs.writeFileSync(path.join(outputDir, 'PIPELINE_STATUS.txt'),
      `${productName} | ${scoreResult.display_score}/100 | Tier ${finalTier} ${scoreResult.product_label} | ${scoreResult.grade} | ${elapsed}s`);

    // ── Write to Database ─────────────────────────────────────────────────
    console.log('[V2] ── Writing to Database ────────────────────────────────────');
    writeToDatabase(curationSlug, scoreResult, reportResult);

    // ── Done ──────────────────────────────────────────────────────────────
    writeProgress(4, 4, 'Complete', 'done');

    console.log('\n[V2] ════════════════════════════════════════════════════════════');
    console.log(`[V2] PIPELINE COMPLETE in ${elapsed}s`);
    console.log(`[V2] Score: ${scoreResult.display_score}/100 — Tier ${finalTier} (${scoreResult.product_label}) — ${scoreResult.grade}`);
    console.log(`[V2] Anchor: ${scoreResult.closest_anchor} (${scoreResult.above_or_below_anchor})`);
    console.log(`[V2] Adjustments: anchor=${scoreResult.anchor_adjustment}, specs=${scoreResult.spec_adjustment}, op_type=${scoreResult.operation_type_adjustment}`);
    console.log(`[V2] Output: ${outputDir}`);
    console.log('[V2] ════════════════════════════════════════════════════════════\n');

  } catch (err) {
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    console.error(`\n[V2] ❌ PIPELINE FAILED after ${elapsed}s: ${err.message}`);
    console.error(err.stack);

    writeProgress(0, 4, 'Failed', 'error');

    // Write error status
    fs.writeFileSync(path.join(outputDir, 'PIPELINE_STATUS.json'), JSON.stringify({
      status: 'FAILED',
      error: err.message,
      elapsed_seconds: elapsed,
      failed_at: new Date().toISOString()
    }, null, 2));

    process.exit(1);
  }
}

main();
