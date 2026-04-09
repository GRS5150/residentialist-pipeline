#!/usr/bin/env node
/**
 * Red-Team Audit — Single Sonnet Call Per Product
 *
 * Sends one Claude Sonnet call per product with the full product file
 * (curation + deep dive + score output) and asks:
 * "What would embarrass us if we published this?"
 *
 * Three failure modes:
 *   1. Hallucinated specs — specs not supported by source material
 *   2. Unsupported strong claims — bold assertions without cited evidence
 *   3. Scoring contradictions — tier placement that contradicts the reasoning
 *
 * Usage:
 *   node scripts/red_team_audit.js <product_slug> <category>
 *   node scripts/red_team_audit.js rohl_shaws_rc3618 sinks
 */

const fs = require('fs');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');

// ─── Config ──────────────────────────────────────────────────────────────────

const BASE_DIR = path.join(__dirname, '..');
const CALIBRATION_DIR = path.join(BASE_DIR, 'calibration');
const CURATION_DIR = path.join(BASE_DIR, 'curation');
const DEEP_DIVES_DIR = path.join(BASE_DIR, 'deep_dives');
const OUTPUTS_DIR = path.join(BASE_DIR, 'outputs');

const SONNET_MODEL = 'claude-sonnet-4-20250514';

// ─── ENV Loading ─────────────────────────────────────────────────────────────

function loadEnvVar(name) {
  try {
    const envPath = path.join(BASE_DIR, '.env');
    const env = fs.readFileSync(envPath, 'utf8');
    const match = env.match(new RegExp(`^${name}=(.+)$`, 'm'));
    return match ? match[1].trim() : process.env[name];
  } catch {
    return process.env[name];
  }
}

const ANTHROPIC_API_KEY = loadEnvVar('ANTHROPIC_API_KEY');
if (ANTHROPIC_API_KEY) process.env.ANTHROPIC_API_KEY = ANTHROPIC_API_KEY;
const anthropic = new Anthropic();

// ─── File Discovery ──────────────────────────────────────────────────────────

function findCurationFile(category, slug) {
  // Check calibration/{cat}/curation_files/
  const curationDir = path.join(CALIBRATION_DIR, category, 'curation_files');
  if (fs.existsSync(curationDir)) {
    const files = fs.readdirSync(curationDir).filter(f => f.endsWith('.json') && f.includes(slug));
    if (files.length) return path.join(curationDir, files[0]);
  }

  // Check root curation/
  if (fs.existsSync(CURATION_DIR)) {
    const files = fs.readdirSync(CURATION_DIR).filter(f =>
      f.endsWith('.json') && f.includes(slug) &&
      (f.includes('_sources') || f.includes('_curation')) &&
      !f.includes('pipeline_progress')
    );
    if (files.length) return path.join(CURATION_DIR, files[0]);
  }

  return null;
}

function findDeepDive(slug) {
  const deepDiveDir = path.join(DEEP_DIVES_DIR, slug);
  if (!fs.existsSync(deepDiveDir)) return null;

  const result = {};
  const rawPath = path.join(deepDiveDir, 'raw_perplexity_report.md');
  const structPath = path.join(deepDiveDir, 'structured_output.json');

  if (fs.existsSync(rawPath)) result.raw = fs.readFileSync(rawPath, 'utf8');
  if (fs.existsSync(structPath)) {
    try { result.structured = JSON.parse(fs.readFileSync(structPath, 'utf8')); } catch {}
  }

  return (result.raw || result.structured) ? result : null;
}

function findLatestScoreOutput(slug) {
  if (!fs.existsSync(OUTPUTS_DIR)) return null;

  const dirs = fs.readdirSync(OUTPUTS_DIR)
    .filter(d => d.startsWith(slug.replace(/_double_hung|_casement/g, '').replace(/_/g, '_')))
    .sort()
    .reverse();

  // Try each matching directory (latest first)
  for (const dir of dirs) {
    const outputDir = path.join(OUTPUTS_DIR, dir);
    if (!fs.statSync(outputDir).isDirectory()) continue;

    const result = {};
    const detPath = path.join(outputDir, 'DETERMINISTIC_SCORES.json');
    const sonPath = path.join(outputDir, 'SONNET_SCORES.json');
    const repPath = path.join(outputDir, 'REPORT.json');

    if (fs.existsSync(detPath)) {
      try { result.deterministic = JSON.parse(fs.readFileSync(detPath, 'utf8')); } catch {}
    }
    if (fs.existsSync(sonPath)) {
      try { result.sonnet = JSON.parse(fs.readFileSync(sonPath, 'utf8')); } catch {}
    }
    if (fs.existsSync(repPath)) {
      try { result.report = JSON.parse(fs.readFileSync(repPath, 'utf8')); } catch {}
    }

    if (Object.keys(result).length > 0) {
      result.outputDir = dir;
      return result;
    }
  }

  return null;
}

function findCalibrationProduct(category, slug) {
  const configPath = path.join(CALIBRATION_DIR, category, 'config.json');
  if (!fs.existsSync(configPath)) return null;
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    return (config.calibration_products || []).find(p => p.slug === slug) || null;
  } catch { return null; }
}

// ─── Prompt Construction ─────────────────────────────────────────────────────

function buildRedTeamPrompt(productName, materials) {
  return `You are an adversarial quality reviewer for The Residentialist, an AI-powered product intelligence platform that evaluates residential building products. Your job is to find anything that would embarrass us if we published this product evaluation.

PRODUCT: ${productName}

Below is the complete product file — curation sources, deep dive research, and scoring output. Review everything and answer this question:

**"What would embarrass us if we published this?"**

Look specifically for these three failure modes:

### 1. HALLUCINATED SPECS
Any specification values (dimensions, ratings, certifications, performance numbers) that appear in the scoring or curation file but are NOT supported by the source material. Flag any spec that appears to be made up or copied from a different product.

### 2. UNSUPPORTED STRONG CLAIMS
Any bold or strong language ("best in class", "industry benchmark", "unmatched", "superior to all competitors", "the gold standard") that is not backed by cited evidence from an independent source. Marketing language that slipped through the curation process.

### 3. SCORING CONTRADICTIONS
Does the tier placement contradict the reasoning? For example:
- Tier 1 placement despite the reasoning describing significant flaws
- Low score despite all evidence being positive
- Axis scores that don't match the descriptions
- Spec adjustments that don't align with the actual specs listed

---

RESPOND WITH:

If issues are found, provide a **ranked list by severity** (most embarrassing first):

For each finding:
- **Severity**: CRITICAL / HIGH / MEDIUM / LOW
- **Type**: HALLUCINATED_SPEC / UNSUPPORTED_CLAIM / SCORING_CONTRADICTION
- **Finding**: What's wrong (1-2 sentences)
- **Evidence**: Quote the problematic text and explain why it's wrong

If nothing problematic is found, respond with:
**CLEAN** — No publishable embarrassments found. [Brief explanation of why the product file looks solid.]

---

PRODUCT FILE:

${materials}`;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const slug = process.argv[2];
  const category = process.argv[3];

  if (!slug || !category) {
    console.log('Usage: node scripts/red_team_audit.js <product_slug> <category>');
    console.log('Example: node scripts/red_team_audit.js rohl_shaws_rc3618 sinks');
    process.exit(1);
  }

  console.log(`\n=== Red-Team Audit ===`);
  console.log(`Product: ${slug}`);
  console.log(`Category: ${category}\n`);

  // Step 1: Gather all materials
  const sections = [];
  let productName = slug.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  // Curation file
  const curationPath = findCurationFile(category, slug);
  if (curationPath) {
    const curationData = JSON.parse(fs.readFileSync(curationPath, 'utf8'));
    productName = curationData.product || curationData.product_name || productName;
    sections.push(`## CURATION FILE (${path.basename(curationPath)})\n\n${JSON.stringify(curationData, null, 2)}`);
    console.log(`📄 Curation: ${path.basename(curationPath)}`);
  } else {
    console.log(`⚠️  No curation file found`);
  }

  // Calibration product (specs + notes)
  const calibProduct = findCalibrationProduct(category, slug);
  if (calibProduct) {
    sections.push(`## CALIBRATION PRODUCT DATA\n\n${JSON.stringify(calibProduct, null, 2)}`);
    productName = calibProduct.name || productName;
    console.log(`📦 Calibration: found (tier ${calibProduct.tier}, target ${calibProduct.target})`);
  } else {
    console.log(`⚠️  No calibration product found`);
  }

  // Deep dive
  const deepDive = findDeepDive(slug);
  if (deepDive) {
    if (deepDive.raw) {
      // Cap at 15k chars to stay within token limits
      sections.push(`## DEEP DIVE — RAW PERPLEXITY REPORT\n\n${deepDive.raw.substring(0, 15000)}`);
      console.log(`📋 Deep dive: raw report (${deepDive.raw.length} chars, capped at 15k)`);
    }
    if (deepDive.structured) {
      sections.push(`## DEEP DIVE — STRUCTURED OUTPUT\n\n${JSON.stringify(deepDive.structured, null, 2)}`);
      console.log(`📋 Deep dive: structured output`);
    }
  } else {
    console.log(`⚠️  No deep dive found`);
  }

  // Score output
  const scoreOutput = findLatestScoreOutput(slug);
  if (scoreOutput) {
    if (scoreOutput.deterministic) {
      sections.push(`## DETERMINISTIC SCORES\n\n${JSON.stringify(scoreOutput.deterministic, null, 2)}`);
      console.log(`📊 Scores: deterministic (tier ${scoreOutput.deterministic.tier}, score ${scoreOutput.deterministic.display_score})`);
    }
    if (scoreOutput.sonnet) {
      sections.push(`## SONNET SCORES\n\n${JSON.stringify(scoreOutput.sonnet, null, 2)}`);
      console.log(`📊 Scores: sonnet`);
    }
    if (scoreOutput.report) {
      sections.push(`## REPORT\n\n${JSON.stringify(scoreOutput.report, null, 2)}`);
      console.log(`📊 Report: found`);
    }
    console.log(`📁 Output dir: ${scoreOutput.outputDir}`);
  } else {
    console.log(`⚠️  No score output found`);
  }

  if (sections.length === 0) {
    console.error(`\n❌ No materials found for ${slug} in ${category}. Nothing to audit.`);
    process.exit(1);
  }

  // Step 2: Build the full materials document
  const materials = sections.join('\n\n---\n\n');
  console.log(`\n📏 Total materials: ${materials.length} chars`);

  // Step 3: Build prompt
  const prompt = buildRedTeamPrompt(productName, materials);
  console.log(`📤 Sending to Sonnet... (this may take 15-30 seconds)\n`);

  // Step 4: Call Sonnet
  try {
    const response = await anthropic.messages.create({
      model: SONNET_MODEL,
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }]
    });

    const result = response.content[0]?.text || '';

    console.log('═'.repeat(70));
    console.log('RED-TEAM AUDIT RESULTS');
    console.log('═'.repeat(70));
    console.log();
    console.log(result);
    console.log();
    console.log('═'.repeat(70));

    // Determine pass/fail
    const isClean = result.toUpperCase().includes('**CLEAN**') || result.toUpperCase().startsWith('CLEAN');
    const hasCritical = result.toUpperCase().includes('CRITICAL');

    if (isClean) {
      console.log(`\n✅ VERDICT: CLEAN`);
    } else if (hasCritical) {
      console.log(`\n🚨 VERDICT: CRITICAL FINDINGS — review required before publication`);
    } else {
      console.log(`\n⚠️  VERDICT: Findings detected — review recommended`);
    }

    // Save results
    const outputPath = path.join(BASE_DIR, 'output', 'audit', `red_team_${slug}_${new Date().toISOString().slice(0, 10)}.md`);
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const reportContent = `# Red-Team Audit: ${productName}\n## ${new Date().toISOString()}\n\n**Category:** ${category}\n**Slug:** ${slug}\n\n---\n\n${result}\n`;
    fs.writeFileSync(outputPath, reportContent);
    console.log(`\n📄 Saved: ${outputPath}`);

  } catch (err) {
    console.error(`\n❌ Sonnet call failed: ${err.message}`);
    process.exit(1);
  }
}

main();
