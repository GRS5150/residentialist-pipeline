#!/usr/bin/env node
/**
 * Exterior Doors — Curation File Generator
 * Reads deep dive outputs from knowledge/exterior_doors/ and structures
 * them into pipeline-format JSON curation files using Sonnet.
 *
 * Usage: cd /Users/Residentialist/.openclaw/workspace/residentialist
 *        export ANTHROPIC_API_KEY=$(grep ANTHROPIC_API_KEY .env | cut -d= -f2)
 *        /usr/local/bin/node build_curation_exterior_doors.js
 */

const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const client = new Anthropic();

const WORKSPACE = __dirname;
const INPUT_DIR = path.join(WORKSPACE, 'knowledge', 'exterior_doors');
const OUTPUT_DIR = path.join(WORKSPACE, 'calibration', 'exterior_doors', 'curation_files');

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const STRUCTURING_PROMPT = `You are a product evidence structurer for the Residentialist product intelligence platform. Your job is to take raw research output and structure it into the pipeline JSON curation file format.

CATEGORY: Exterior Doors
AXIS WEIGHTS: Quality=0.40, Durability=0.35, Performance=0.25

SOURCE POOL DEFINITIONS:
- Pool S (1.50x): VACANT for exterior doors
- Pool A (1.00x): Green Building Advisor (GBA), Fine Homebuilding (FHB), Consumer Reports, NFRC Database
- Pool B (0.75x): Houzz professional threads, r/Carpentry, r/HomeImprovement (professional contributors), YouTube installer/contractor channels
- Pool C (0.40x): Homeowner reviews, ConsumerAffairs, individual forum posts

CLASSIFICATION RULES:
- "score": Finding that affects tier classification and axis scoring
- "report_only": Finding relevant to buyers but doesn't affect score (lawsuits, corporate structure, Material Safety items). Lawsuits ALWAYS report_only.
- "quarantine": Finding that is unverified, potentially wrong product, or off-topic

COLUMN MAPPING:
- "expert": Professional sources (GBA, FHB, trade publications, contractor forums)
- "review": Review organizations (Consumer Reports, independent reviewers)
- "forum": Homeowner forums, Reddit owner threads, individual reviews

OUTPUT FORMAT: A valid JSON curation file matching this schema exactly:
{
  "product": "Full Product Name",
  "report_date": "2026",
  "sources": [
    {
      "id": "SRC-001",
      "source_name": "Source Name",
      "url": "https://...",
      "platform": "gba|fhb|reddit|houzz|youtube|consumerreports|other",
      "column": "expert|review|forum",
      "snippet": "What this source says about the product",
      "pool": "A|B|C",
      "classification": "score|report_only|quarantine",
      "classification_reason": "Why",
      "topics": ["quality", "performance", "durability", "specs", "service"],
      "verification_relevance": "relevant"
    }
  ],
  "bottom_line": "Summary paragraph",
  "scoring_notes": {
    "sources_scored": ["SRC-001"],
    "sources_report_only": [],
    "sources_quarantined": [],
    "pool_distribution": { "pool_S": 0, "pool_A": 0, "pool_B": 0, "pool_C": 0 }
  },
  "product_slug": "slug",
  "product_name": "Display Name",
  "manufacturer_slug": "manufacturer",
  "operation_type": null,
  "deep_dive_date": "2026-04-01",
  "structuring_model": "claude-sonnet-4-6",
  "auto_classification_summary": { "total": 0, "score": 0, "report_only": 0, "quarantine": 0 },
  "curation_status": "staged",
  "human_overrides": []
}

RULES:
- Extract EVERY substantive finding as a separate source entry
- Each source gets its own SRC-XXX identifier
- Assign pool based on source type, not content quality
- Map topics to relevant axes (quality, performance, durability, specs, service)
- Corporate structure findings = report_only
- Warranty details = score (affects durability axis)
- Manufacturing location = report_only
- NFRC test data = score (affects performance axis)  
- Professional installer opinions = score (affects tier placement)
- Minimum 10 sources per product, maximum 40
- Every finding must have a specific snippet — not generic descriptions

Output ONLY the JSON, no markdown wrapping, no explanation.`;

const PRODUCTS = [
  { name: 'Marvin Signature Ultimate Entry Door', slug: 'marvin_ultimate_entry', manufacturer: 'marvin', file_slug: 'marvin_ultimate_entry' },
  { name: 'Therma-Tru Classic-Craft Premium (Fiberglass)', slug: 'thermatru_classiccraft', manufacturer: 'thermatru', file_slug: 'thermatru_classiccraft' },
  { name: 'Pella Reserve Entry Door', slug: 'pella_reserve_entry', manufacturer: 'pella', file_slug: 'pella_reserve_entry' },
  { name: 'Therma-Tru Benchmark Entry (Fiberglass)', slug: 'thermatru_benchmark', manufacturer: 'thermatru', file_slug: 'thermatru_benchmark' },
  { name: 'Masonite Performance Door System (Fiberglass)', slug: 'masonite_performance', manufacturer: 'masonite', file_slug: 'masonite_performance' },
  { name: 'JELD-WEN Builders Series (Steel/Fiberglass)', slug: 'jeldwen_builders', manufacturer: 'jeldwen', file_slug: 'jeldwen_builders' },
  { name: 'Reliabilt Entry Door (Lowe\'s)', slug: 'reliabilt_entry', manufacturer: 'reliabilt', file_slug: 'reliabilt_entry' },
];

async function buildCuration(product) {
  const inputFile = path.join(INPUT_DIR, `exterior_doors_deep_dive_${product.file_slug}.md`);
  
  if (!fs.existsSync(inputFile)) {
    console.log(`  ⚠ No deep dive file for ${product.slug}: ${inputFile}`);
    return null;
  }

  const rawContent = fs.readFileSync(inputFile, 'utf-8');
  console.log(`  Input: ${(rawContent.length / 1024).toFixed(1)}KB`);

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8000,
    system: STRUCTURING_PROMPT,
    messages: [{
      role: 'user',
      content: `Structure this deep dive research into a curation file.\n\nPRODUCT: ${product.name}\nSLUG: ${product.slug}\nMANUFACTURER: ${product.manufacturer}\n\nRAW RESEARCH:\n${rawContent.substring(0, 25000)}`
    }]
  });

  const output = response.content[0].text;
  
  // Parse and validate JSON
  let curation;
  try {
    // Try to extract JSON if wrapped in markdown
    const jsonMatch = output.match(/\{[\s\S]*\}/);
    curation = JSON.parse(jsonMatch ? jsonMatch[0] : output);
  } catch (e) {
    console.error(`  ✗ JSON parse error: ${e.message}`);
    // Save raw output for debugging
    fs.writeFileSync(path.join(OUTPUT_DIR, `${product.slug}_raw_structuring.txt`), output);
    return null;
  }

  // Validate required fields
  if (!curation.sources || curation.sources.length === 0) {
    console.error(`  ✗ No sources in structured output`);
    return null;
  }

  const outputFile = path.join(OUTPUT_DIR, `${product.slug}.json`);
  fs.writeFileSync(outputFile, JSON.stringify(curation, null, 2));
  
  const summary = curation.auto_classification_summary || {};
  console.log(`  ✓ ${curation.sources.length} sources (score:${summary.score || '?'}, report_only:${summary.report_only || '?'}, quarantine:${summary.quarantine || '?'})`);
  console.log(`  Saved: ${outputFile}`);
  
  return curation;
}

async function main() {
  console.log('Exterior Doors — Curation File Generator');
  console.log(`Input: ${INPUT_DIR}`);
  console.log(`Output: ${OUTPUT_DIR}`);
  console.log('');

  const results = [];

  for (const product of PRODUCTS) {
    console.log(`\nProcessing: ${product.name}`);
    const curation = await buildCuration(product);
    if (curation) {
      results.push({ name: product.name, sources: curation.sources.length });
    }
    
    // Rate limit
    await new Promise(r => setTimeout(r, 3000));
  }

  console.log('\n' + '='.repeat(60));
  console.log(`Curation files generated: ${results.length}/${PRODUCTS.length}`);
  for (const r of results) {
    console.log(`  ✓ ${r.name}: ${r.sources} sources`);
  }
  console.log('Done.');
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
