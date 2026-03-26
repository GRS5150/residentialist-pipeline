/**
 * THE RESIDENTIALIST — Rerun Sonnet Structuring
 * Re-runs ONLY the Sonnet structuring step on an existing raw Perplexity report.
 * Does NOT re-call Perplexity.
 * 
 * Usage: node rerun_sonnet.js "Pella 250 Series" "double_hung"
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '/home/ubuntu/.openclaw/workspace/residentialist/.env' });

const { structureDeepDive } = require('./sonnet_structurer');

const WORKSPACE = process.env.OPENCLAW_WORKSPACE || '/home/ubuntu/.openclaw/workspace/residentialist';
const DEEP_DIVES_DIR = path.join(WORKSPACE, 'deep_dives');
const CURATION_DIR = path.join(WORKSPACE, 'curation');

// Ensure curation dir exists
if (!fs.existsSync(CURATION_DIR)) fs.mkdirSync(CURATION_DIR, { recursive: true });

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.log('Usage: node rerun_sonnet.js "Product Name" [operation_type]');
    process.exit(1);
  }

  const productName = args[0];
  const operationType = args[1] || 'double_hung';
  const slug = slugify(productName) + (operationType ? '_' + slugify(operationType) : '');
  const productDir = path.join(DEEP_DIVES_DIR, slug);
  const rawPath = path.join(productDir, 'raw_perplexity_report.md');

  if (!fs.existsSync(rawPath)) {
    console.error(`[RERUN] Raw report not found: ${rawPath}`);
    process.exit(1);
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`[RERUN] Re-structuring: ${productName} (${operationType})`);
  console.log(`[RERUN] Using existing raw report: ${rawPath}`);
  console.log(`${'='.repeat(60)}`);

  const rawReport = fs.readFileSync(rawPath, 'utf8');
  console.log(`[RERUN] Raw report: ${rawReport.length} chars`);

  try {
    const structured = await structureDeepDive(rawReport, productName, operationType);

    // Save structured output
    const structuredPath = path.join(productDir, 'structured_output.json');
    fs.writeFileSync(structuredPath, JSON.stringify(structured, null, 2));
    console.log(`\n[RERUN] ✅ Structured output saved: ${structuredPath}`);

    // Save to curation
    const curationPath = path.join(CURATION_DIR, `${slug}_sources.json`);
    fs.writeFileSync(curationPath, JSON.stringify(structured, null, 2));
    console.log(`[RERUN] ✅ Curation file saved: ${curationPath}`);

    // Update processing log
    const logPath = path.join(productDir, 'processing_log.json');
    let log = {};
    if (fs.existsSync(logPath)) {
      log = JSON.parse(fs.readFileSync(logPath, 'utf8'));
    }
    log.completed = true;
    log.completed_at = new Date().toISOString();
    log.rerun_sonnet = true;
    log.error = undefined;
    log.error_at = undefined;
    log.steps = log.steps || [];
    log.steps.push({
      step: 'sonnet_structuring_rerun',
      sources: structured.auto_classification_summary?.total || 0,
      strategy: structured.structuring_strategy || 'single_call',
      cost_estimate: structured.structuring_cost_estimate || 0
    });
    fs.writeFileSync(logPath, JSON.stringify(log, null, 2));

    // Print summary
    console.log(`\n[RERUN] Summary:`);
    console.log(`  Sources: ${structured.auto_classification_summary?.total || 0}`);
    console.log(`    Score: ${structured.auto_classification_summary?.score || 0}`);
    console.log(`    Report: ${structured.auto_classification_summary?.report_only || 0}`);
    console.log(`    Quarantine: ${structured.auto_classification_summary?.quarantine || 0}`);
    console.log(`  Strategy: ${structured.structuring_strategy || 'single_call'}`);
    console.log(`  Duration: ${Math.round(structured.structuring_duration_ms / 1000)}s`);
    console.log(`  Cost est: $${(structured.structuring_cost_estimate || 0).toFixed(4)}`);
    if (structured.bottom_line) {
      console.log(`  Bottom line: ${structured.bottom_line.substring(0, 200)}...`);
    }

  } catch (err) {
    console.error(`\n[RERUN] ❌ Failed: ${err.message}`);
    process.exit(1);
  }
}

main();
