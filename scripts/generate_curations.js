#!/usr/bin/env node
/**
 * Generate curation JSON files from deep dive outputs + calibration config.
 * 
 * Usage: node scripts/generate_curations.js <category>
 * 
 * Reads: calibration/{category}/config.json, knowledge/{category}/deep_dive_*.md
 * Writes: calibration/{category}/curation_files/{slug}_curation.json
 */

const fs = require('fs');
const path = require('path');

// Resolve the project root relative to this script's location.
// Works on any machine regardless of absolute path.
const ROOT = path.resolve(__dirname, '..');
const category = process.argv[2];

if (!category) {
  console.error('Usage: node scripts/generate_curations.js <category>');
  process.exit(1);
}

const configPath = path.join(ROOT, 'calibration', category, 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const curationDir = path.join(ROOT, 'calibration', category, 'curation_files');
fs.mkdirSync(curationDir, { recursive: true });

const knowledgeDir = path.join(ROOT, 'knowledge', category);

// Extract key data points from deep dive text
function extractSources(deepDiveText, productName) {
  const sources = [];
  let id = 1;

  // Extract sections by heading
  const sections = deepDiveText.split(/^#{2,3}\s+/m).filter(s => s.trim().length > 50);
  
  // Create sources from meaningful sections
  const topicMap = {
    'FRAME': ['quality', 'durability'],
    'GLASS': ['performance'],
    'IGU': ['performance'],
    'HARDWARE': ['durability', 'quality'],
    'WEATHERSTRIP': ['performance'],
    'WEATHER': ['performance'],
    'SEAL': ['durability'],
    'WARRANTY': ['durability'],
    'RELIABILITY': ['durability'],
    'CONSTRUCTION': ['quality'],
    'BODY': ['quality'],
    'MATERIAL': ['quality'],
    'FINISH': ['quality', 'durability'],
    'CARTRIDGE': ['durability', 'quality'],
    'COMPOSITION': ['quality'],
    'RESISTANCE': ['performance', 'durability'],
    'DURABILITY': ['durability'],
    'PERFORMANCE': ['performance'],
    'MANUFACTURING': ['quality'],
    'CORPORATE': ['quality'],
    'SAFETY': ['quality'],
    'CERTIFICATION': ['quality'],
    'POROSITY': ['durability'],
    'DRAWER': ['durability', 'quality'],
    'HINGE': ['durability'],
    'BOX': ['quality'],
    'SHELF': ['quality'],
    'SPRAY': ['performance'],
    'PARTS': ['durability'],
    'SERVICE': ['durability'],
    'STRUCTURAL': ['performance']
  };

  for (const section of sections) {
    const firstLine = section.split('\n')[0].trim().toUpperCase();
    let topics = ['quality'];
    let pool = 'A';
    let column = 'expert';
    
    for (const [keyword, topicList] of Object.entries(topicMap)) {
      if (firstLine.includes(keyword)) {
        topics = topicList;
        break;
      }
    }

    // Get first meaningful paragraph as snippet (skip headers and caveats)
    const paragraphs = section.split('\n\n')
      .filter(p => p.trim().length > 40 && !p.startsWith('#') && !p.startsWith('*') && !p.startsWith('---'))
      .map(p => p.replace(/\n/g, ' ').trim());
    
    if (paragraphs.length === 0) continue;
    
    const snippet = paragraphs[0].substring(0, 400);
    
    // Determine pool based on source type
    if (snippet.toLowerCase().includes('consumer reports') || snippet.toLowerCase().includes('yale')) pool = 'S';
    else if (snippet.toLowerCase().includes('starcraft') || snippet.toLowerCase().includes('matt risinger')) pool = 'S';
    else if (snippet.toLowerCase().includes('reddit') || snippet.toLowerCase().includes('forum')) { pool = 'B'; column = 'forum'; }
    else if (snippet.toLowerCase().includes('manufacturer') || snippet.toLowerCase().includes('spec')) pool = 'A';

    sources.push({
      id: `SRC-${String(id).padStart(3, '0')}`,
      source_name: `Deep Dive Analysis — ${firstLine.substring(0, 60)}`,
      url: 'deep_dive_synthesis',
      platform: 'other',
      column,
      snippet,
      pool,
      classification: 'score',
      classification_reason: `Deep dive component analysis for ${productName}.`,
      topics,
      verification_relevance: 'relevant'
    });
    id++;
    
    if (id > 12) break; // Cap at 12 sources per product
  }

  return sources;
}

console.log(`\nGenerating curation files for: ${category}`);
console.log(`Products: ${config.calibration_products.length}`);
console.log();

for (const product of config.calibration_products) {
  // Find matching deep dive file
  const possibleSlugs = [
    product.slug,
    product.slug + '_dh',
    product.slug.replace(/_/g, '_')
  ];
  
  let deepDiveText = '';
  let deepDiveFile = '';
  
  for (const slug of possibleSlugs) {
    const filePath = path.join(knowledgeDir, `deep_dive_${slug}.md`);
    if (fs.existsSync(filePath)) {
      deepDiveText = fs.readFileSync(filePath, 'utf8');
      deepDiveFile = filePath;
      break;
    }
  }
  
  // Also check curation dir for existing sources.json
  const existingCurationPath = path.join(ROOT, 'curation', `${product.slug}_sources.json`);
  let existingSources = [];
  if (fs.existsSync(existingCurationPath)) {
    try {
      const existing = JSON.parse(fs.readFileSync(existingCurationPath, 'utf8'));
      existingSources = existing.sources || [];
    } catch(e) {}
  }

  // Generate sources from deep dive or use existing
  let sources;
  if (existingSources.length > 0) {
    sources = existingSources;
    console.log(`  📋 ${product.name}: Using ${existingSources.length} existing curated sources`);
  } else if (deepDiveText) {
    sources = extractSources(deepDiveText, product.name);
    console.log(`  🔍 ${product.name}: Extracted ${sources.length} sources from deep dive (${deepDiveFile})`);
  } else {
    sources = [{
      id: 'SRC-001',
      source_name: `Calibration Config — ${product.name}`,
      url: 'calibration_config',
      platform: 'other',
      column: 'expert',
      snippet: product.rationale || product.outlook_rationale || 'Product calibrated based on research consensus.',
      pool: 'A',
      classification: 'score',
      classification_reason: 'Calibration-level assessment.',
      topics: ['quality', 'durability', 'performance'],
      verification_relevance: 'relevant'
    }];
    console.log(`  ⚠️  ${product.name}: No deep dive found — using calibration rationale`);
  }

  const curationFile = {
    product: product.name,
    report_date: new Date().toISOString().substring(0, 10),
    sources,
    bottom_line: product.rationale || `${product.name} is a Tier ${product.tier} product (${config.tier_ranges[product.tier].label}) with a target score of ${product.target}/100.`,
    scoring_notes: {
      sources_scored: sources.filter(s => s.classification === 'score').map(s => s.id),
      sources_report_only: sources.filter(s => s.classification === 'report_only').map(s => s.id),
      sources_quarantined: [],
      pool_distribution: {
        pool_S: sources.filter(s => s.pool === 'S').length,
        pool_A: sources.filter(s => s.pool === 'A').length,
        pool_B: sources.filter(s => s.pool === 'B').length,
        pool_C: sources.filter(s => s.pool === 'C').length
      }
    },
    product_slug: product.slug,
    product_name: product.name,
    manufacturer_slug: product.slug.split('_')[0],
    deep_dive_date: new Date().toISOString().substring(0, 10),
    structuring_model: 'auto_generated_v2',
    curation_status: 'curated',
    curation_date: new Date().toISOString().substring(0, 10),
    human_overrides: [],
    platform_disclosure: product.platform_disclosure || config.platform_disclosures?.find(d => d.toLowerCase().includes(product.slug.split('_')[0])) || null,
    outlook: product.outlook,
    outlook_rationale: product.outlook_rationale || product.rationale
  };

  const outPath = path.join(curationDir, `${product.slug}_curation.json`);
  fs.writeFileSync(outPath, JSON.stringify(curationFile, null, 2));
  console.log(`  ✅ Written: ${outPath}`);
}

console.log(`\nDone! ${config.calibration_products.length} curation files generated.`);
