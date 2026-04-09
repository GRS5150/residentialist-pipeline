#!/usr/bin/env node
/**
 * Exterior Doors — Build Remaining Curation Files
 * Runs for: Benchmark, Masonite, JELD-WEN, Reliabilt
 */

const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const client = new Anthropic();

const WORKSPACE = __dirname;
const INPUT_DIR = path.join(WORKSPACE, 'knowledge', 'exterior_doors');
const OUTPUT_DIR = path.join(WORKSPACE, 'calibration', 'exterior_doors', 'curation_files');

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const STRUCTURING_PROMPT = `You are a product evidence structurer for the Residentialist product intelligence platform. Structure raw research output into the pipeline JSON curation file format.

CATEGORY: Exterior Doors. AXIS WEIGHTS: Quality=0.40, Durability=0.35, Performance=0.25.

SOURCE POOLS: Pool S (1.50x) = VACANT. Pool A (1.00x) = GBA, FHB, Consumer Reports, NFRC. Pool B (0.75x) = Houzz pros, r/Carpentry, r/HomeImprovement pros, YouTube installers. Pool C (0.40x) = Owner reviews, ConsumerAffairs, individual forum posts.

CLASSIFICATION: "score" = affects tier/axes. "report_only" = for buyers but no score impact (lawsuits always report_only, corporate structure). "quarantine" = unverified/wrong product.

Output valid JSON matching the Residentialist curation schema with: product, report_date, sources[], bottom_line, scoring_notes, product_slug, product_name, manufacturer_slug, operation_type (null), deep_dive_date, structuring_model ("claude-sonnet-4-6"), auto_classification_summary, curation_status ("staged"), human_overrides ([]). Each source has: id, source_name, url, platform, column (expert/review/forum), snippet, pool, classification, classification_reason, topics[], verification_relevance. Output ONLY JSON.`;

const PRODUCTS = [
  { name: 'Therma-Tru Benchmark Entry (Fiberglass)', slug: 'thermatru_benchmark', manufacturer: 'thermatru', file_slug: 'thermatru_benchmark' },
  { name: 'Masonite Performance Door System (Fiberglass)', slug: 'masonite_performance', manufacturer: 'masonite', file_slug: 'masonite_performance' },
  { name: 'JELD-WEN Builders Series (Steel/Fiberglass)', slug: 'jeldwen_builders', manufacturer: 'jeldwen', file_slug: 'jeldwen_builders' },
  { name: 'Reliabilt Entry Door (Lowe\'s)', slug: 'reliabilt_entry', manufacturer: 'reliabilt', file_slug: 'reliabilt_entry' },
];

async function buildCuration(product) {
  const inputFile = path.join(INPUT_DIR, `exterior_doors_deep_dive_${product.file_slug}.md`);
  
  if (!fs.existsSync(inputFile)) {
    console.log(`  ⚠ No deep dive file for ${product.slug}`);
    return null;
  }

  // Check if already built
  const outputFile = path.join(OUTPUT_DIR, `${product.slug}.json`);
  if (fs.existsSync(outputFile)) {
    console.log(`  ⏩ Already exists, skipping`);
    return JSON.parse(fs.readFileSync(outputFile, 'utf-8'));
  }

  const rawContent = fs.readFileSync(inputFile, 'utf-8');
  // Cap input at 15KB to avoid timeout
  const input = rawContent.substring(0, 15000);
  console.log(`  Input: ${(rawContent.length / 1024).toFixed(1)}KB (using ${(input.length / 1024).toFixed(1)}KB)`);

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 6000,
    system: STRUCTURING_PROMPT,
    messages: [{
      role: 'user',
      content: `Structure this deep dive research into a curation file.\n\nPRODUCT: ${product.name}\nSLUG: ${product.slug}\nMANUFACTURER: ${product.manufacturer}\n\nRAW RESEARCH:\n${input}`
    }]
  });

  const output = response.content[0].text;
  
  let curation;
  try {
    const jsonMatch = output.match(/\{[\s\S]*\}/);
    curation = JSON.parse(jsonMatch ? jsonMatch[0] : output);
  } catch (e) {
    console.error(`  ✗ JSON parse error: ${e.message}`);
    fs.writeFileSync(path.join(OUTPUT_DIR, `${product.slug}_raw.txt`), output);
    return null;
  }

  if (!curation.sources || curation.sources.length === 0) {
    console.error(`  ✗ No sources in structured output`);
    return null;
  }

  fs.writeFileSync(outputFile, JSON.stringify(curation, null, 2));
  
  const summary = curation.auto_classification_summary || {};
  console.log(`  ✓ ${curation.sources.length} sources (score:${summary.score || '?'}, ro:${summary.report_only || '?'}, q:${summary.quarantine || '?'})`);
  return curation;
}

async function main() {
  console.log('Building remaining curation files...\n');

  for (const product of PRODUCTS) {
    console.log(`Processing: ${product.name}`);
    try {
      await buildCuration(product);
    } catch (e) {
      console.error(`  ✗ Error: ${e.message}`);
    }
    await new Promise(r => setTimeout(r, 2000));
  }

  // List all curation files
  const files = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.json'));
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Total curation files: ${files.length}`);
  files.forEach(f => console.log(`  ${f}`));
  console.log('Done.');
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
