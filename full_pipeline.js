#!/usr/bin/env node
/**
 * THE RESIDENTIALIST — Full Pipeline (Deep Dive → V2 Score)
 *
 * Chains:
 *   1. deep_dive_pipeline.js — Perplexity research → Sonnet structuring → curation file
 *   2. score_from_curation_v2.js — Sonnet scorer → Haiku auditor → Score calculator → Report writer
 *
 * Writes progress to curation/{slug}_pipeline_progress.json for dashboard polling.
 *
 * Usage:
 *   node full_pipeline.js "Andersen 400 Series" double_hung
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const WORKSPACE = __dirname;
const CURATION_DIR = path.join(WORKSPACE, 'curation');

// ── Progress Writer ─────────────────────────────────────────────────────────
function writeProgress(slug, step, total, label, status, extra = {}) {
  const progressPath = path.join(CURATION_DIR, `${slug}_pipeline_progress.json`);
  const data = {
    slug,
    step,
    total,
    current_bot: label,
    status,
    updated: new Date().toISOString(),
    ...extra
  };
  try {
    fs.writeFileSync(progressPath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.warn(`[FULL_PIPELINE] Could not write progress: ${err.message}`);
  }
}

// ── Slugify ─────────────────────────────────────────────────────────────────
function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);

  // Parse --category flag
  let category = 'windows';
  const categoryIdx = args.indexOf('--category');
  if (categoryIdx !== -1 && args[categoryIdx + 1]) {
    category = args[categoryIdx + 1];
    args.splice(categoryIdx, 2);
  }

  if (args.length < 1) {
    console.error('Usage: node full_pipeline.js "Product Name" [operation_type] [--category windows|countertops]');
    process.exit(1);
  }

  // Load category config
  const { loadConfig } = require('./config_loader');
  const categoryConfig = loadConfig(category);

  const productName = args[0];
  const operationType = category === 'windows' ? (args[1] || 'double_hung') : null;
  const slug = operationType
    ? slugify(productName) + '_' + slugify(operationType)
    : slugify(productName);
  const startTime = Date.now();

  console.log('\n' + '='.repeat(70));
  console.log(`[FULL_PIPELINE] ${productName}${operationType ? ' (' + operationType + ')' : ''} [${category}]`);
  console.log('='.repeat(70));
  console.log('[FULL_PIPELINE] Phase 1: Deep Dive (Perplexity → Sonnet structuring)');
  console.log('[FULL_PIPELINE] Phase 2: V2 Score (Sonnet scorer → Haiku auditor → Calculator → Report)');
  console.log('='.repeat(70) + '\n');

  // ── Phase 1: Deep Dive (or reuse existing curation from sibling variant) ──
  // One-deep-dive-per-product-line rule (windows only): if a curation file exists for a different
  // operation type of the same product line, copy it instead of running Perplexity.
  const productLineSlug = slugify(productName);
  let siblingCurationPath = null;
  if (categoryConfig.sibling_curation_reuse && operationType) {
    const opTypes = categoryConfig.operation_types || ['double_hung', 'casement', 'awning', 'sliding', 'picture'];
    for (const otherOp of opTypes) {
      if (otherOp === slugify(operationType)) continue;
      const siblingSlug = productLineSlug + '_' + otherOp;
      const siblingPath = path.join(CURATION_DIR, `${siblingSlug}_sources.json`);
      if (fs.existsSync(siblingPath)) {
        siblingCurationPath = siblingPath;
        console.log(`[FULL_PIPELINE] Found existing curation for sibling variant: ${siblingSlug}`);
        break;
      }
    }
  }

  const curationPath = path.join(CURATION_DIR, `${slug}_sources.json`);

  if (siblingCurationPath && !fs.existsSync(curationPath)) {
    // Copy sibling curation — same product line, same evidence, different op type
    console.log(`[FULL_PIPELINE] Copying sibling curation instead of running Perplexity`);
    console.log(`[FULL_PIPELINE]   From: ${siblingCurationPath}`);
    console.log(`[FULL_PIPELINE]   To:   ${curationPath}`);
    fs.copyFileSync(siblingCurationPath, curationPath);
    writeProgress(slug, 2, 6, 'Curation copied from sibling', 'running', { phase: 'deep_dive', reused: true });
  } else if (!fs.existsSync(curationPath)) {
    // No sibling, no existing curation — run full Perplexity deep dive
    writeProgress(slug, 1, 6, 'Perplexity Deep Research', 'running', { phase: 'deep_dive' });

    try {
      const { runProductDeepDive } = require('./deep_dive_pipeline');
      const ddResult = await runProductDeepDive(productName, operationType, { category });

      if (!ddResult.success) {
        const elapsed = Math.round((Date.now() - startTime) / 1000);
        console.error(`\n[FULL_PIPELINE] Deep dive FAILED after ${elapsed}s: ${ddResult.error}`);
        writeProgress(slug, 1, 6, 'Deep Dive Failed', 'error', { error: ddResult.error });
        process.exit(1);
      }

      const elapsed1 = Math.round((Date.now() - startTime) / 1000);
      const sources = ddResult.structured?.auto_classification_summary?.total || '?';
      console.log(`\n[FULL_PIPELINE] Phase 1 complete in ${elapsed1}s — ${sources} sources curated`);
    } catch (err) {
      console.error(`[FULL_PIPELINE] Deep dive crashed: ${err.message}`);
      writeProgress(slug, 1, 6, 'Deep Dive Crashed', 'error', { error: err.message });
      process.exit(1);
    }
  } else {
    console.log(`[FULL_PIPELINE] Curation file already exists, skipping deep dive`);
    writeProgress(slug, 2, 6, 'Using existing curation', 'running', { phase: 'deep_dive', reused: true });
  }

  // ── Step 2.5: Source Verification ─────────────────────────────────────────
  console.log('\n[FULL_PIPELINE] Step 2.5: Source Verification...\n');
  writeProgress(slug, 2, 7, 'Source Verifier', 'running', { phase: 'verification' });

  // Verify curation file exists
  if (!fs.existsSync(curationPath)) {
    console.error(`[FULL_PIPELINE] Curation file not found after deep dive: ${curationPath}`);
    writeProgress(slug, 2, 7, 'Curation file missing', 'error');
    process.exit(1);
  }

  try {
    const sourceVerifier = require('./source_verifier');
    const curationForVerify = JSON.parse(fs.readFileSync(curationPath, 'utf8'));
    const verifyStats = await sourceVerifier.verify(curationForVerify, { productName, operationType });
    fs.writeFileSync(curationPath, JSON.stringify(curationForVerify, null, 2));
    console.log(`[FULL_PIPELINE] Verification: ${verifyStats.reclassified} sources reclassified (${verifyStats.dead_links} dead, ${verifyStats.wrong_product} wrong_product, ${verifyStats.installation} installation, ${verifyStats.brand_general} brand_general)\n`);
  } catch (err) {
    console.warn(`[FULL_PIPELINE] Source verification failed (non-fatal): ${err.message}`);
  }

  // ── Step 2.75: Spec Verification ─────────────────────────────────────────
  console.log('[FULL_PIPELINE] Step 2.75: Spec Verification...');
  writeProgress(slug, 3, 8, 'Spec Verifier', 'running', { phase: 'verification' });
  try {
    const specVerifier = require('./spec_verifier');
    const specStats = await specVerifier.verifyProduct(slug, { skipPerplexity: false });
    if (specStats) {
      console.log(`[FULL_PIPELINE] Specs: ${specStats.verified} verified, ${specStats.conflicting} conflicting, ${specStats.unverified} unverified\n`);
    }
  } catch (err) {
    console.warn(`[FULL_PIPELINE] Spec verification failed (non-fatal): ${err.message}`);
  }

  // ── Phase 2: V2 Scoring Pipeline ────────────────────────────────────────
  console.log('[FULL_PIPELINE] Starting Phase 2: V2 Scoring...\n');
  writeProgress(slug, 4, 8, 'Sonnet Scorer', 'running', { phase: 'scoring' });

  // ── Evidence Guard: refuse to score with fewer than 5 score sources ──
  const curationCheck = JSON.parse(fs.readFileSync(curationPath, 'utf8'));
  const scoreSourceCount = (curationCheck.sources || []).filter(s => s.classification === 'score').length;
  if (scoreSourceCount < 5) {
    console.error(`[FULL_PIPELINE] ❌ INSUFFICIENT EVIDENCE: only ${scoreSourceCount} score sources (minimum 5 required)`);
    writeProgress(slug, 3, 6, 'Insufficient evidence', 'error', { score_sources: scoreSourceCount });
    // Update DB status
    try {
      const Database = require('better-sqlite3');
      const db = new Database(path.join(WORKSPACE, 'residentialist.db'));
      const productSlugSearch = slug.replace(/_double_hung|_casement|_awning|_sliding/g, '').replace(/_/g, '%');
      db.prepare("UPDATE products SET deep_dive_status = 'insufficient_evidence' WHERE LOWER(REPLACE(REPLACE(product_name, ' ', '_'), '-', '_')) LIKE ?").run(`%${productSlugSearch}%`);
      db.close();
    } catch (_) {}
    process.exit(1);
  }
  console.log(`[FULL_PIPELINE] Evidence check passed: ${scoreSourceCount} score sources`);

  try {
    // Load pipeline modules
    const sonnetScorer = require('./sonnet_scorer');
    const haikuAuditor = require('./haiku_auditor');
    const scoreCalculator = require('./score_calculator');
    const reportWriter = require('./report_writer');

    const curation = JSON.parse(fs.readFileSync(curationPath, 'utf8'));
    const productSlug = category === 'windows'
      ? slug.replace(/_double_hung|_casement|_awning|_sliding|_picture|_fixed/g, '')
      : slug;

    // Load manufacturer data
    const mfgSlug = curation.manufacturer_slug;
    const mfgPath = mfgSlug ? path.join(WORKSPACE, 'manufacturers', `${mfgSlug}.json`) : null;
    let manufacturer = null;
    if (mfgPath && fs.existsSync(mfgPath)) {
      manufacturer = JSON.parse(fs.readFileSync(mfgPath, 'utf8'));
    }

    // Output directory
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const outputDir = path.join(WORKSPACE, 'outputs', `${productSlug}_${timestamp}`);
    fs.mkdirSync(outputDir, { recursive: true });

    // Step 3: Sonnet Tier Classification
    writeProgress(slug, 3, 6, 'Sonnet Classifier', 'running', { phase: 'scoring' });
    console.log('[FULL_PIPELINE] Step 3/6: Sonnet Tier Classification...');
    const tierResult = await sonnetScorer.classify(curation, manufacturer, category);
    fs.writeFileSync(path.join(outputDir, 'SONNET_SCORES.json'), JSON.stringify(tierResult, null, 2));
    console.log(`[FULL_PIPELINE] Sonnet: Tier ${tierResult.tier} (${tierResult.tier_label}), anchor=${tierResult.closest_anchor}, position=${tierResult.above_or_below_anchor}`);

    // Step 4: Haiku Tier Audit
    writeProgress(slug, 4, 6, 'Haiku Auditor', 'running', { phase: 'scoring' });
    console.log('[FULL_PIPELINE] Step 4/6: Haiku Tier Audit...');
    const auditResult = await haikuAuditor.auditTier(tierResult, curation, slug);
    fs.writeFileSync(path.join(outputDir, 'HAIKU_AUDIT.json'), JSON.stringify(auditResult, null, 2));
    console.log(`[FULL_PIPELINE] Audit: tier_approved=${auditResult.tier_approved}, changed=${auditResult.tier_changed}, passed=${auditResult.audit_passed}`);

    // Step 5: Score Calculator (Tier-Based)
    writeProgress(slug, 5, 6, 'Score Calculator', 'running', { phase: 'scoring' });
    console.log('[FULL_PIPELINE] Step 5/6: Score Calculator (Tier-Based)...');
    const finalTier = auditResult.tier_changed ? auditResult.tier_approved : tierResult.tier;
    const tierResultWithAudit = { ...tierResult, tier: finalTier };
    const scoreResult = scoreCalculator.compute(tierResultWithAudit, category, outputDir);
    scoreResult.product_name = curation.product_name || productName;
    scoreResult.category = category;
    scoreResult.config = category === 'windows'
      ? (operationType === 'double_hung' ? 'DH' : (operationType || 'DH').toUpperCase())
      : (curation.material_class || 'default');

    // Add outlook modifier for countertops (Corporate Risk Rule)
    if (category === 'countertops' && categoryConfig.outlook_modifiers) {
      const { detectManufacturer: detectMfg } = require('./config_loader');
      const mfgSlug = detectMfg(productName, category);
      const outlookAssignments = categoryConfig.outlook_modifiers.current_assignments || {};
      for (const [key, outlook] of Object.entries(outlookAssignments)) {
        if (productName.toLowerCase().includes(key.toLowerCase()) || mfgSlug === key.toLowerCase()) {
          scoreResult.outlook_modifier = outlook;
          break;
        }
      }
      if (!scoreResult.outlook_modifier) scoreResult.outlook_modifier = 'Stable';
    }

    fs.writeFileSync(path.join(outputDir, 'DETERMINISTIC_SCORES.json'), JSON.stringify(scoreResult, null, 2));
    const outlookStr = scoreResult.outlook_modifier ? ` [Outlook: ${scoreResult.outlook_modifier}]` : '';
    console.log(`[FULL_PIPELINE] Score: ${scoreResult.display_score}/100 — Tier ${finalTier} (${scoreResult.product_label}) — ${scoreResult.grade}${outlookStr}`);

    // Step 6: Report Writer
    writeProgress(slug, 6, 6, 'Report Writer', 'running', { phase: 'scoring' });
    console.log('[FULL_PIPELINE] Step 6/6: Report Writer...');
    const reportResult = await reportWriter.generate(curation, manufacturer, tierResultWithAudit, scoreResult);
    fs.writeFileSync(path.join(outputDir, 'REPORT.json'), JSON.stringify(reportResult, null, 2));

    // ── Write to Database ──────────────────────────────────────────────
    try {
      const Database = require('better-sqlite3');
      const dbPath = path.join(WORKSPACE, 'residentialist.db');
      const db = new Database(dbPath);

      // Find product by flexible name matching + config
      const configMatch = operationType === 'double_hung' ? 'DH' : operationType;
      let product = db.prepare(
        `SELECT id, product_name FROM products WHERE LOWER(REPLACE(REPLACE(product_name, ' ', '_'), '-', '_')) LIKE ? AND LOWER(config) = LOWER(?)`
      ).get(`%${productSlug}%`, configMatch);

      if (!product) {
        // Try without config filter (single-variant products)
        product = db.prepare(
          `SELECT id, product_name FROM products WHERE LOWER(REPLACE(REPLACE(product_name, ' ', '_'), '-', '_')) LIKE ?`
        ).get(`%${productSlug}%`);
      }

      if (!product) {
        const simpleName = productName.replace(/\b\w/g, c => c.toUpperCase());
        product = db.prepare('SELECT id, product_name FROM products WHERE product_name LIKE ?').get(`%${simpleName.split(' ').slice(0, 3).join('%')}%`);
      }

      if (product) {
        db.prepare(`
          UPDATE products SET
            overall_score = ?, quality_score = ?, durability_score = ?, performance_score = ?,
            product_label = ?, health_label = ?,
            price_positioning = ?, serviceability_summary = ?, warranty_display = ?,
            calibration_version = ?, deep_dive_status = 'scored',
            score_version = score_version + 1, last_scored = datetime('now')
          WHERE id = ?
        `).run(
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

        // Score history
        try {
          db.prepare(`
            INSERT INTO score_history (product_slug, product_name, action, new_score, new_label, calibration_version, composite_method, notes)
            VALUES (?, ?, 'full_pipeline', ?, ?, ?, 'geometric', 'Scored by full_pipeline (deep_dive + v2_score)')
          `).run(slug, product.product_name, scoreResult.display_score, scoreResult.product_label, scoreResult.calibration_version || 'v2');
        } catch (_) {}

        // Buyer considerations
        try {
          const bcTable = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='buyer_considerations'").get();
          if (bcTable && reportResult.buyer_considerations) {
            db.prepare('DELETE FROM buyer_considerations WHERE product_id = ?').run(product.id);
            const insertBc = db.prepare('INSERT INTO buyer_considerations (product_id, text, gate_passed) VALUES (?, ?, ?)');
            for (const bc of reportResult.buyer_considerations) {
              insertBc.run(product.id, bc.text, bc.gate || 1);
            }
          }
        } catch (_) {}

        console.log(`[FULL_PIPELINE] DB updated: ${product.product_name} → ${scoreResult.display_score}/100 (${scoreResult.product_label})`);
      } else {
        console.warn(`[FULL_PIPELINE] Product not found in DB for slug: ${productSlug}`);
      }

      db.close();
    } catch (dbErr) {
      console.error(`[FULL_PIPELINE] DB error (non-fatal): ${dbErr.message}`);
    }

    // ── Pipeline Status ────────────────────────────────────────────────
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    fs.writeFileSync(path.join(outputDir, 'PIPELINE_STATUS.json'), JSON.stringify({
      status: 'COMPLETE',
      pipeline: 'full_pipeline',
      product: productName,
      slug,
      overall_score: scoreResult.display_score,
      grade: scoreResult.grade,
      product_label: scoreResult.product_label,
      quality: auditResult.quality_approved,
      durability: auditResult.durability_approved,
      performance: auditResult.performance_approved,
      elapsed_seconds: elapsed,
      completed_at: new Date().toISOString()
    }, null, 2));

    writeProgress(slug, 6, 6, 'Complete', 'done', {
      phase: 'complete',
      score: scoreResult.display_score,
      label: scoreResult.product_label,
      grade: scoreResult.grade,
      elapsed_seconds: elapsed
    });

    console.log('\n' + '='.repeat(70));
    console.log(`[FULL_PIPELINE] COMPLETE in ${elapsed}s`);
    console.log(`[FULL_PIPELINE] ${productName}: ${scoreResult.display_score}/100 (${scoreResult.product_label}) — ${scoreResult.grade}`);
    console.log(`[FULL_PIPELINE] Output: ${outputDir}`);
    console.log('='.repeat(70) + '\n');

  } catch (err) {
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    console.error(`\n[FULL_PIPELINE] V2 scoring FAILED after ${elapsed}s: ${err.message}`);
    console.error(err.stack);
    writeProgress(slug, 0, 6, 'Scoring Failed', 'error', { error: err.message });
    process.exit(1);
  }
}

main();
