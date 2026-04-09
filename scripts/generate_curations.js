#!/usr/bin/env node
/**
 * generate_curations.js — Source-Registry-Driven Curation Builder
 *
 * Reads from knowledge/{category}/sources_registry.json (NOT markdown).
 * For each product:
 *   1. All scope:"category" sources  → apply to every product
 *   2. All scope:"product" sources matching this slug → add
 *   3. Writes calibration/{category}/curation_files/{slug}_curation.json
 *
 * Fails loudly if a product has zero sources — no placeholder allowed.
 *
 * Usage: node scripts/generate_curations.js <category>
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT        = path.resolve(__dirname, '..');
const category    = process.argv[2];

if (!category) {
  console.error('Usage: node scripts/generate_curations.js <category>');
  process.exit(1);
}

const configPath   = path.join(ROOT, 'calibration', category, 'config.json');
const curationDir  = path.join(ROOT, 'calibration', category, 'curation_files');
const registryPath = path.join(ROOT, 'knowledge', category, 'sources_registry.json');

// ── Load inputs ───────────────────────────────────────────────────────────────

if (!fs.existsSync(configPath)) {
  console.error(`ERROR: Config not found: ${configPath}`);
  process.exit(1);
}

if (!fs.existsSync(registryPath)) {
  console.error(`ERROR: sources_registry.json not found for category: ${category}`);
  console.error(`Run first: node scripts/backfill_source_registry.js ${category}`);
  process.exit(1);
}

const config   = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));

fs.mkdirSync(curationDir, { recursive: true });

// ── Split registry by scope ───────────────────────────────────────────────────

const categorySources = registry.filter(s => s.scope === 'category');
const productSources  = registry.filter(s => s.scope === 'product');

console.log(`\nGenerating curation files for: ${category}`);
console.log(`Products: ${config.calibration_products.length}`);
console.log(`Registry: ${registry.length} sources (${categorySources.length} cat-scope, ${productSources.length} prod-scope)`);
console.log();

// ── Map pool heuristic → column ───────────────────────────────────────────────

function poolToColumn(src) {
  if (src.scope === 'product') {
    const u = (src.url || '').toLowerCase();
    if (/reddit|houzz|forum|discuss|community/.test(u)) return 'forum';
    if (/trustpilot|yelp|consumeraffairs|bbb/.test(u)) return 'forum';
    return src.source_pool === 'C' ? 'forum' : 'review';
  }
  return 'expert'; // category-scope sources are always expert-tier institutional
}

// ── Convert registry entry → curation source object ──────────────────────────

function toSourceEntry(regSrc, id) {
  return {
    id,
    source_name: regSrc.name || regSrc.institution || regSrc.url.substring(0, 60),
    url: regSrc.url,
    platform: 'other',
    column: poolToColumn(regSrc),
    snippet: '',                   // curator fills in after inspector run
    pool: regSrc.source_pool || 'B',
    classification: regSrc.scope === 'category' ? 'independent' : 'score',
    classification_reason: `Captured from ${regSrc.captured_from}. Scope: ${regSrc.scope}.`,
    topics: regSrc.axes || ['quality'],
    verification_relevance: 'relevant',
    captured_from: regSrc.captured_from,
    verified: regSrc.verified || false,
  };
}

// ── Process each product ──────────────────────────────────────────────────────

let totalWritten = 0;
let totalSourcesBefore = 0;
let totalSourcesAfter  = 0;
let placeholdersEliminated = 0;

for (const product of config.calibration_products) {
  const slug = product.slug;

  // 1. Category-scope sources (institutional — apply to every product)
  const catEntries = categorySources;

  // 2. Product-scope sources matching this slug
  const prodEntries = productSources.filter(s =>
    s.products && s.products.includes(slug)
  );

  const combinedRegistry = [...catEntries, ...prodEntries];

  if (combinedRegistry.length === 0) {
    // Check if existing curation exists we can preserve
    const existing = path.join(curationDir, `${slug}_curation.json`);
    if (fs.existsSync(existing)) {
      console.log(`  ⚠️  ${product.name}: 0 registry sources — preserving existing curation`);
      continue;
    }
    console.error(`  ❌ ${product.name}: No sources in registry and no existing curation. Run backfill first.`);
    process.exit(1);
  }

  // Load existing curation to detect placeholders before overwriting
  const existingPath = path.join(curationDir, `${slug}_curation.json`);
  let existingSources = [];
  if (fs.existsSync(existingPath)) {
    try {
      existingSources = JSON.parse(fs.readFileSync(existingPath, 'utf8')).sources || [];
    } catch {}
  }
  const prevPlaceholders = existingSources.filter(s => s.url === 'deep_dive_synthesis').length;
  totalSourcesBefore += existingSources.length;
  placeholdersEliminated += prevPlaceholders;

  // Build fresh source list from registry
  const sources = combinedRegistry.map((s, i) => toSourceEntry(s, `SRC-${String(i + 1).padStart(3, '0')}`));
  totalSourcesAfter += sources.length;

  // Pool distribution
  const poolDist = { pool_S: 0, pool_A: 0, pool_B: 0, pool_C: 0 };
  for (const s of sources) {
    const k = `pool_${s.pool}`;
    if (k in poolDist) poolDist[k]++;
  }

  const curationFile = {
    product:              product.name,
    report_date:          new Date().toISOString().substring(0, 10),
    sources,
    bottom_line:          product.rationale || `${product.name} — Tier ${product.tier} product. Target score: ${product.target}/100.`,
    scoring_notes: {
      sources_scored:       sources.filter(s => s.classification === 'score').map(s => s.id),
      sources_report_only:  sources.filter(s => s.classification !== 'score').map(s => s.id),
      sources_quarantined:  [],
      pool_distribution:    poolDist,
    },
    product_slug:         slug,
    product_name:         product.name,
    manufacturer_slug:    slug.split('_')[0],
    deep_dive_date:       new Date().toISOString().substring(0, 10),
    structuring_model:    'source_registry_v1',
    curation_status:      'curated',
    curation_date:        new Date().toISOString().substring(0, 10),
    human_overrides:      [],
    platform_disclosure:  product.platform_disclosure || null,
    outlook:              product.outlook || null,
    outlook_rationale:    product.outlook_rationale || product.rationale || null,
  };

  fs.writeFileSync(existingPath, JSON.stringify(curationFile, null, 2));
  console.log(`  ✅ ${product.name}: ${sources.length} sources (${catEntries.length} cat + ${prodEntries.length} prod)${prevPlaceholders > 0 ? ` — removed ${prevPlaceholders} placeholders` : ''}`);
  totalWritten++;
}

// ── Summary ───────────────────────────────────────────────────────────────────

console.log('\n' + '─'.repeat(60));
console.log(`Products written:          ${totalWritten}/${config.calibration_products.length}`);
console.log(`Sources before:            ${totalSourcesBefore}`);
console.log(`Sources after:             ${totalSourcesAfter}`);
console.log(`Placeholders eliminated:   ${placeholdersEliminated}`);
console.log('─'.repeat(60));
console.log('\nDone!\n');
