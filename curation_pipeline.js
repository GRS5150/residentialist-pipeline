#!/usr/bin/env node
/**
 * Curation Pipeline — Deep Dive → Bot 2 Adapter
 *
 * Replaces Bot 1 (research) with curated deep dive sources.
 * Loads curated 'score' sources from the curation file, formats them
 * as a synthetic Bot 1 findings document, then runs the normal pipeline:
 *   Bot 2 (axis evaluations) → Bot 3 (material safety) → Scorer → Bot 4 → Bot 5 → Council
 *
 * Usage:
 *   node curation_pipeline.js <curation_slug>
 *   node curation_pipeline.js pella_250_series_double_hung
 *
 * The curation slug corresponds to:
 *   - curation/<slug>_sources.json (curated sources with classifications)
 *   - deep_dives/<slug>/raw_perplexity_report.md (raw research)
 *   - deep_dives/<slug>/structured_output.json (structured data)
 */

const fs = require('fs');
const path = require('path');

const WORKSPACE = process.env.OPENCLAW_WORKSPACE ||
  (fs.existsSync('/Users/Residentialist/.openclaw/workspace/residentialist/residentialist.db')
    ? '/Users/Residentialist/.openclaw/workspace/residentialist'
    : '/home/ubuntu/.openclaw/workspace/residentialist');

const CURATION_DIR = path.join(WORKSPACE, 'curation');
const DEEP_DIVES_DIR = path.join(WORKSPACE, 'deep_dives');
const OUTPUTS_DIR = path.join(WORKSPACE, 'outputs');

// ─── Build synthetic Bot 1 findings from curated sources + raw report ────────

function buildSyntheticBot1Output(curationData, structuredOutput, rawReport) {
  const productName = curationData.product_name || structuredOutput.product || 'Unknown Product';
  const scoreSources = (curationData.sources || structuredOutput.sources || [])
    .filter(s => s.classification === 'score');
  const reportSources = (curationData.sources || structuredOutput.sources || [])
    .filter(s => s.classification === 'report_only');

  // Group score sources by topic for structured findings
  const topicGroups = {};
  for (const src of scoreSources) {
    const topics = src.topics || ['general'];
    for (const topic of topics) {
      if (!topicGroups[topic]) topicGroups[topic] = [];
      topicGroups[topic].push(src);
    }
  }

  // Build consensus matrix section
  const consensusMatrix = structuredOutput.consensus_matrix || [];
  let consensusSection = '';
  if (consensusMatrix.length > 0) {
    consensusSection = '\n## CONSENSUS MATRIX\n\n';
    for (const row of consensusMatrix) {
      consensusSection += `### ${row.topic}\n`;
      if (row.experts) consensusSection += `- **Expert view**: ${row.experts}\n`;
      if (row.reviews) consensusSection += `- **Reviews**: ${row.reviews}\n`;
      if (row.forums) consensusSection += `- **Forums**: ${row.forums}\n`;
      consensusSection += `- **Agreement level**: ${row.agreement || 'moderate'}\n\n`;
    }
  }

  // Build verified specs section
  const specs = structuredOutput.verified_specs || {};
  let specsSection = '';
  const specEntries = Object.entries(specs).filter(([k, v]) => v != null);
  if (specEntries.length > 0) {
    specsSection = '\n## VERIFIED SPECIFICATIONS\n\n';
    for (const [key, value] of specEntries) {
      specsSection += `- **${key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}**: ${value}\n`;
    }
    specsSection += '\n';
  }

  // Build red flags section
  const redFlags = structuredOutput.red_flags || [];
  let redFlagsSection = '';
  if (redFlags.length > 0) {
    redFlagsSection = '\n## RED FLAGS\n\n';
    for (const flag of redFlags) {
      redFlagsSection += `- ⚠️ ${flag}\n`;
    }
    redFlagsSection += '\n';
  }

  // Build warranty section
  const warranty = structuredOutput.warranty_reality || {};
  let warrantySection = '';
  if (Object.keys(warranty).length > 0) {
    warrantySection = '\n## WARRANTY REALITY\n\n';
    if (warranty.beats_expectations?.length) {
      warrantySection += '### Beats Expectations\n';
      for (const item of warranty.beats_expectations) warrantySection += `- ✓ ${item}\n`;
    }
    if (warranty.underperforms_expectations?.length) {
      warrantySection += '### Underperforms Expectations\n';
      for (const item of warranty.underperforms_expectations) warrantySection += `- ⚠ ${item}\n`;
    }
    if (warranty.surprises?.length) {
      warrantySection += '### Surprises\n';
      for (const item of warranty.surprises) warrantySection += `- ★ ${item}\n`;
    }
    warrantySection += '\n';
  }

  // Build source evidence sections organized by topic
  let sourceEvidenceSection = '\n## FIELD SOURCE OPINIONS\n\n';
  for (const [topic, sources] of Object.entries(topicGroups)) {
    sourceEvidenceSection += `### ${topic.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}\n\n`;
    for (const src of sources) {
      sourceEvidenceSection += `**${src.source_name}** (${src.platform || 'unknown'}, Pool ${src.pool || 'B'})\n`;
      if (src.url) sourceEvidenceSection += `URL: ${src.url}\n`;
      sourceEvidenceSection += `${src.snippet || ''}\n\n`;
    }
  }

  // Build the bottom line
  const bottomLine = curationData.bottom_line || structuredOutput.bottom_line || '';

  // Determine material class from structured data
  const verifiedSpecs = structuredOutput.verified_specs || {};
  let materialClass = verifiedSpecs.frame_material || verifiedSpecs.material_class || '';
  if (!materialClass) {
    // Try to infer from product name or specs
    const productLower = (curationData.product_name || '').toLowerCase();
    const specText = JSON.stringify(verifiedSpecs).toLowerCase();
    if (specText.includes('vinyl') || specText.includes('pvc') || specText.includes('extruded rigid')) materialClass = 'Vinyl';
    else if (specText.includes('fiberglass') || specText.includes('pultruded')) materialClass = 'Fiberglass';
    else if (specText.includes('aluminum-clad wood') || specText.includes('aluminium-clad')) materialClass = 'Aluminum-clad wood';
    else if (specText.includes('wood')) materialClass = 'Wood';
    else if (specText.includes('aluminum') || specText.includes('aluminium')) materialClass = 'Aluminum';
    else materialClass = 'Unknown — see specs above';
  }
  console.log(`[CURATION PIPELINE] Detected material class: ${materialClass}`);

  // Assemble synthetic Bot 1 output
  const synthetic = `# ${productName} — Deep Dive Research Findings

## PRODUCT OVERVIEW

**Source**: Deep dive research via Perplexity (curated through Residentialist Curation Pipeline)
**Sources analyzed**: ${scoreSources.length} scoring sources, ${reportSources.length} report-only sources
**Research date**: ${curationData.deep_dive_date || new Date().toISOString().slice(0, 10)}

## BOTTOM LINE

${bottomLine}

${specsSection}${consensusSection}${warrantySection}${redFlagsSection}${sourceEvidenceSection}

## MATERIAL CLASS

${materialClass}

IMPORTANT: The material class above is the verified classification for this product from the deep dive curation. Any references to other material classes in the raw research below may pertain to competitor products or different product lines — they should NOT override this classification.

---

## RAW DEEP DIVE RESEARCH

${rawReport}
`;

  return synthetic;
}

// ─── Main pipeline entry point ───────────────────────────────────────────────

async function runCurationPipeline(curationSlug) {
  console.log(`\n[CURATION PIPELINE] ========================================`);
  console.log(`[CURATION PIPELINE] Starting: ${curationSlug}`);
  console.log(`[CURATION PIPELINE] ========================================`);

  // Step 1: Load curation data
  const curationPath = path.join(CURATION_DIR, `${curationSlug}_sources.json`);
  if (!fs.existsSync(curationPath)) {
    throw new Error(`Curation file not found: ${curationPath}`);
  }
  const curationData = JSON.parse(fs.readFileSync(curationPath, 'utf8'));
  const productName = curationData.product_name || curationSlug.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  console.log(`[CURATION PIPELINE] Product: ${productName}`);
  console.log(`[CURATION PIPELINE] Sources: ${(curationData.sources || []).length} total`);
  console.log(`[CURATION PIPELINE] Score sources: ${(curationData.sources || []).filter(s => s.classification === 'score').length}`);

  // Step 2: Load deep dive data
  const deepDiveDir = path.join(DEEP_DIVES_DIR, curationSlug);
  const rawReportPath = path.join(deepDiveDir, 'raw_perplexity_report.md');
  const structuredPath = path.join(deepDiveDir, 'structured_output.json');

  const rawReport = fs.existsSync(rawReportPath) ? fs.readFileSync(rawReportPath, 'utf8') : '';
  const structuredOutput = fs.existsSync(structuredPath) ? JSON.parse(fs.readFileSync(structuredPath, 'utf8')) : {};

  if (!rawReport) {
    console.warn('[CURATION PIPELINE] ⚠️ No raw Perplexity report found — using structured output only');
  }
  console.log(`[CURATION PIPELINE] Raw report: ${rawReport.length} chars`);
  console.log(`[CURATION PIPELINE] Structured output keys: ${Object.keys(structuredOutput).join(', ')}`);

  // Step 3: Build synthetic Bot 1 output
  const syntheticBot1 = buildSyntheticBot1Output(curationData, structuredOutput, rawReport);
  console.log(`[CURATION PIPELINE] Synthetic Bot 1 output: ${syntheticBot1.length} chars`);

  // Step 4: Extract config from slug (default double_hung)
  let config = 'DH';
  if (curationSlug.includes('casement')) config = 'Casement';
  else if (curationSlug.includes('sliding')) config = 'Slider';
  else if (curationSlug.includes('double_hung') || curationSlug.includes('_dh')) config = 'DH';

  // Step 5: Call the orchestrator with skipBot1
  const { runPipeline } = require(path.join(WORKSPACE, 'bot_orchestrator_v3.js'));

  console.log(`[CURATION PIPELINE] Calling runPipeline with skipBot1=true`);
  const result = await runPipeline(productName, config, [], {
    skipBot1: true,
    syntheticBot1Output: syntheticBot1,
    curationSlug: curationSlug,
    curationData: curationData,
  });

  console.log(`[CURATION PIPELINE] ========================================`);
  console.log(`[CURATION PIPELINE] COMPLETE: ${productName}`);
  console.log(`[CURATION PIPELINE] Status: ${result?.status || 'unknown'}`);
  console.log(`[CURATION PIPELINE] ========================================`);

  return result;
}

// ─── CLI entry point ─────────────────────────────────────────────────────────

if (require.main === module) {
  const slug = process.argv[2];
  if (!slug) {
    console.log('Usage: node curation_pipeline.js <curation_slug>');
    console.log('Example: node curation_pipeline.js pella_250_series_double_hung');
    process.exit(1);
  }
  runCurationPipeline(slug)
    .then(result => process.exit(result?.status === 'PASS' ? 0 : 1))
    .catch(err => { console.error('[CURATION PIPELINE] FATAL:', err); process.exit(1); });
}

module.exports = { runCurationPipeline, buildSyntheticBot1Output };
