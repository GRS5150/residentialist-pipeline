#!/usr/bin/env node
/**
 * Source Independence Tagger
 *
 * Reads the 4 Perplexity knowledge files for a category, extracts citation URLs,
 * classifies each file as "independent" or "manufacturer" based on URL domains,
 * and writes a `source_independence` field into the product's curation file.
 *
 * Usage:
 *   node scripts/tag_source_independence.js <product_slug> <category>
 *   node scripts/tag_source_independence.js pella_250_series_double_hung windows
 *
 * The field written is:
 *   "source_independence": "3/4 independent"
 *
 * Logic:
 *   - For each knowledge file with citations, extract all URLs
 *   - If >50% of URLs belong to the manufacturer domain, that file = "manufacturer"
 *   - Otherwise = "independent"
 *   - Files with no citations are counted as "no_sources" and excluded from the ratio
 */

const fs = require('fs');
const path = require('path');

// ─── Config ──────────────────────────────────────────────────────────────────

const BASE_DIR = path.join(__dirname, '..');
const KNOWLEDGE_DIR = path.join(BASE_DIR, 'knowledge');
const CURATION_DIR = path.join(BASE_DIR, 'curation');
const CALIBRATION_DIR = path.join(BASE_DIR, 'calibration');

// Known manufacturer domain fragments — matched against URL hostnames.
// The script also dynamically builds a list from the product slug.
const MANUFACTURER_DOMAIN_HINTS = [
  // Appliances — refrigerators, ranges, ovens, dishwashers
  'subzero-wolf', 'subzero', 'wolfappliance', 'thermador', 'bosch',
  'miele', 'jennair', 'jenn-air', 'dacor', 'viking', 'bertazzoni',
  'smeg', 'monogram', 'cafe', 'ge-appliances', 'whirlpool', 'maytag',
  'kitchenaid', 'frigidaire', 'electrolux', 'samsung', 'lg',
  // Plumbing — faucets, sinks, toilets
  'kohler', 'toto', 'americanstandard', 'american-standard',
  'deltafaucet', 'delta', 'brizo', 'moen', 'grohe', 'hansgrohe',
  'kallista', 'rohl', 'waterstone', 'californiafaucets', 'in2aqua',
  'blanco', 'kraus', 'waterworks', 'riobel', 'perrin-and-rowe',
  // Windows
  'marvin', 'andersenwindows', 'andersenwindows', 'pella', 'jeld-wen',
  'jeldwen', 'milgard', 'loewen', 'sierrapacificwindows',
  // Countertops
  'cambriausa', 'cambria', 'caesarstone', 'cosentino', 'silestone',
  'dekton', 'lapitec', 'neolith', 'msisurfaces', 'lgviatera',
  'hanwha', 'wilsonart', 'formica',
  // Cabinets
  'kraftmaid', 'diamond', 'aristokraft', 'merillat', 'decora',
  'masterbrand', 'americanwoodmark', 'fabuwood', 'waypoint',
  'timberlake', 'shenandoah', 'crystal', 'rutt', 'plainandfancy',
  // HVAC
  'trane', 'carrier', 'lennox', 'rheem', 'goodman', 'americanstandard',
  'york', 'daikin', 'mitsubishicomfort', 'fujitsugeneral',
  // Water heaters
  'rinnai', 'navien', 'noritz', 'bradford-white', 'bradfordwhite',
  'aosmith', 'a-osmith', 'rheem', 'bosch', 'stiebel-eltron',
  // Lighting / shade / control
  'lutron', 'savant', 'control4', 'leviton', 'crestron',
  'hunterdouglas', 'phantom', 'fenetex', 'somfy',
  // Flooring
  'carlisle', 'mirage', 'shaw', 'bruce', 'somerset', 'lauzon',
  'mercier', 'anderson-hardwood', 'mullican',
  // Tile
  'porcelanosa', 'daltile', 'marazzi', 'crossville', 'florida-tile',
  'american-olean', 'emser',
  // Range hoods
  'ventahood', 'zephyr', 'broan', 'best-by-broan', 'kobe', 'faber',
  'elica', 'futuro-futuro',
  // Exterior doors
  'thermatru', 'masonite', 'reliabilt', 'pella', 'jeldwen',
  'andersen', 'plastpro',
  // Generators
  'generac',
];

// Known independent domains — always classified independent regardless
const INDEPENDENT_DOMAINS = [
  'reddit.com', 'consumerreports.org', 'thisoldhouse.com', 'youtube.com',
  'houzz.com', 'bobvila.com', 'finehomebuilding.com', 'jlconline.com',
  'greenbuildingadvisor.com', 'energystar.gov', 'nfrc.org', 'asme.org',
  'nsf.org', 'icc-es.org', 'iapmo.org', 'ashrae.org', 'aama.org',
  'wikipedia.org', 'hud.gov', 'epa.gov', 'energy.gov',
  'familyhandyman.com', 'thespruce.com', 'lowes.com', 'homedepot.com',
  'plumbersforums.com', 'contractortalk.com', 'diychatroom.com',
  'angi.com', 'angieslist.com', 'bbb.org',
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Extract manufacturer domain fragments from a product slug and brand name.
 * e.g., "pella_250_series_double_hung" → ["pella"]
 * e.g., "kohler_whitehaven_k6489" → ["kohler"]
 */
function extractBrandDomains(slug, curationData) {
  const domains = [];

  // First word of slug is usually the brand
  const brandFromSlug = slug.split('_')[0].toLowerCase();
  if (brandFromSlug && brandFromSlug.length > 2) {
    domains.push(brandFromSlug);
  }

  // If curation data has product name, extract first word
  if (curationData && curationData.product) {
    const brandFromName = curationData.product.split(' ')[0].toLowerCase();
    if (brandFromName && brandFromName.length > 2 && !domains.includes(brandFromName)) {
      domains.push(brandFromName);
    }
  }
  if (curationData && curationData.product_name) {
    const brandFromName = curationData.product_name.split(' ')[0].toLowerCase();
    if (brandFromName && brandFromName.length > 2 && !domains.includes(brandFromName)) {
      domains.push(brandFromName);
    }
  }

  return domains;
}

/**
 * Extract citation URLs from a knowledge file's ## Citations section.
 * Falls back to extracting all URLs if no Citations section found.
 */
function extractCitationUrls(content) {
  const urls = [];

  // Look for ## Citations section
  const citationsMatch = content.match(/## Citations\s*\n([\s\S]*?)(?:\n##|\n---|\s*$)/);
  if (citationsMatch) {
    const citationsBlock = citationsMatch[1];
    const urlRegex = /https?:\/\/[^\s)>"'\]]+/g;
    let match;
    while ((match = urlRegex.exec(citationsBlock)) !== null) {
      urls.push(match[0]);
    }
    return urls;
  }

  // Fallback: extract all URLs from the file
  const urlRegex = /https?:\/\/[^\s)>"'\]]+/g;
  let match;
  while ((match = urlRegex.exec(content)) !== null) {
    urls.push(match[0]);
  }

  return urls;
}

/**
 * Extract hostname from a URL.
 */
function getHostname(url) {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    // Simple fallback for malformed URLs
    const match = url.match(/https?:\/\/(?:www\.)?([^/\s]+)/);
    return match ? match[1].toLowerCase() : '';
  }
}

/**
 * Classify a single knowledge file's citations.
 * Returns: "independent" | "manufacturer" | "no_sources"
 */
function classifyFile(filename, content, brandDomains) {
  const urls = extractCitationUrls(content);

  if (urls.length === 0) {
    return { classification: 'no_sources', urlCount: 0, mfgCount: 0, indCount: 0 };
  }

  let mfgCount = 0;
  let indCount = 0;

  for (const url of urls) {
    const hostname = getHostname(url);

    // Check if it's a known independent source
    if (INDEPENDENT_DOMAINS.some(d => hostname.includes(d))) {
      indCount++;
      continue;
    }

    // Check if it matches a manufacturer domain
    if (brandDomains.some(brand => hostname.includes(brand))) {
      mfgCount++;
      continue;
    }

    // Default: independent (most third-party sites, trade publications, etc.)
    indCount++;
  }

  const total = mfgCount + indCount;
  const mfgRatio = total > 0 ? mfgCount / total : 0;

  return {
    classification: mfgRatio > 0.5 ? 'manufacturer' : 'independent',
    urlCount: urls.length,
    mfgCount,
    indCount
  };
}

// ─── Knowledge File Discovery ────────────────────────────────────────────────

/**
 * Find the 4 standard Perplexity knowledge files for a category.
 * Pattern: {category}_{testing_framework,component_analysis,hierarchy_top,hierarchy_bottom}.md
 *
 * Falls back to: {category}_eval_knowledge.md and {category}_material_safety_knowledge.md
 * for older categories (windows, countertops, cabinets, faucets).
 */
function findKnowledgeFiles(category) {
  const knowledgeDir = path.join(KNOWLEDGE_DIR, category);
  if (!fs.existsSync(knowledgeDir)) {
    console.log(`  ⚠️  No knowledge directory: ${knowledgeDir}`);
    return [];
  }

  const allFiles = fs.readdirSync(knowledgeDir).filter(f => f.endsWith('.md'));

  // Standard 4-file pattern
  const standardSuffixes = ['_testing_framework.md', '_component_analysis.md', '_hierarchy_top.md', '_hierarchy_bottom.md'];
  const standardFiles = standardSuffixes
    .map(suffix => allFiles.find(f => f.endsWith(suffix)))
    .filter(Boolean);

  if (standardFiles.length >= 3) {
    return standardFiles.map(f => ({
      filename: f,
      path: path.join(knowledgeDir, f)
    }));
  }

  // Legacy pattern: eval_knowledge + material_safety_knowledge
  const legacyFiles = allFiles.filter(f =>
    f.includes('eval_knowledge') || f.includes('material_safety_knowledge')
  );

  if (legacyFiles.length > 0) {
    return legacyFiles.map(f => ({
      filename: f,
      path: path.join(knowledgeDir, f)
    }));
  }

  // Last resort: return all .md files
  return allFiles.map(f => ({
    filename: f,
    path: path.join(knowledgeDir, f)
  }));
}

// ─── Curation File Discovery ─────────────────────────────────────────────────

function findCurationFile(category, slug) {
  // Check calibration/{cat}/curation_files/ first
  const curationDir = path.join(CALIBRATION_DIR, category, 'curation_files');
  if (fs.existsSync(curationDir)) {
    const files = fs.readdirSync(curationDir).filter(f => f.endsWith('.json') && f.includes(slug));
    if (files.length) return path.join(curationDir, files[0]);
  }

  // Check root curation/ dir
  const rootCuration = path.join(CURATION_DIR);
  if (fs.existsSync(rootCuration)) {
    const files = fs.readdirSync(rootCuration).filter(f =>
      f.endsWith('.json') && f.includes(slug) &&
      (f.includes('_sources') || f.includes('_curation')) &&
      !f.includes('pipeline_progress')
    );
    if (files.length) return path.join(rootCuration, files[0]);
  }

  return null;
}

// ─── Main ────────────────────────────────────────────────────────────────────

function main() {
  const slug = process.argv[2];
  const category = process.argv[3];

  if (!slug || !category) {
    console.log('Usage: node scripts/tag_source_independence.js <product_slug> <category>');
    console.log('Example: node scripts/tag_source_independence.js pella_250_series_double_hung windows');
    process.exit(1);
  }

  console.log(`\n=== Source Independence Tagger ===`);
  console.log(`Product: ${slug}`);
  console.log(`Category: ${category}\n`);

  // Step 1: Find and load curation file
  const curationPath = findCurationFile(category, slug);
  if (!curationPath) {
    console.error(`❌ No curation file found for ${slug} in ${category}`);
    process.exit(1);
  }
  console.log(`📄 Curation file: ${curationPath}`);

  let curationData;
  try {
    curationData = JSON.parse(fs.readFileSync(curationPath, 'utf8'));
  } catch (e) {
    console.error(`❌ Failed to parse curation file: ${e.message}`);
    process.exit(1);
  }

  // Step 2: Build brand domain list
  const brandDomains = extractBrandDomains(slug, curationData);
  console.log(`🏭 Brand domains to match: ${brandDomains.join(', ')}`);

  // Step 3: Find knowledge files
  const knowledgeFiles = findKnowledgeFiles(category);
  if (knowledgeFiles.length === 0) {
    console.error(`❌ No knowledge files found for category: ${category}`);
    process.exit(1);
  }
  console.log(`📚 Knowledge files found: ${knowledgeFiles.length}\n`);

  // Step 4: Classify each file
  let independentCount = 0;
  let manufacturerCount = 0;
  let noSourcesCount = 0;
  const fileResults = [];

  for (const kf of knowledgeFiles) {
    const content = fs.readFileSync(kf.path, 'utf8');
    const result = classifyFile(kf.filename, content, brandDomains);

    if (result.classification === 'no_sources') {
      noSourcesCount++;
      console.log(`  ⬜ ${kf.filename}: no sources (skipped)`);
    } else if (result.classification === 'independent') {
      independentCount++;
      console.log(`  ✅ ${kf.filename}: INDEPENDENT (${result.indCount}/${result.urlCount} independent URLs)`);
    } else {
      manufacturerCount++;
      console.log(`  🏭 ${kf.filename}: MANUFACTURER (${result.mfgCount}/${result.urlCount} manufacturer URLs)`);
    }

    fileResults.push({ filename: kf.filename, ...result });
  }

  // Step 5: Compute ratio
  const totalClassified = independentCount + manufacturerCount;
  const ratioString = totalClassified > 0
    ? `${independentCount}/${totalClassified} independent`
    : 'no sources found';

  console.log(`\n📊 Source Independence: ${ratioString}`);

  // Step 6: Write back to curation file
  curationData.source_independence = ratioString;
  curationData.source_independence_details = fileResults.map(r => ({
    file: r.filename,
    classification: r.classification,
    urls_total: r.urlCount,
    urls_manufacturer: r.mfgCount,
    urls_independent: r.indCount
  }));
  curationData.source_independence_tagged_at = new Date().toISOString();

  fs.writeFileSync(curationPath, JSON.stringify(curationData, null, 2) + '\n');
  console.log(`\n✅ Written to: ${curationPath}`);
  console.log(`   source_independence: "${ratioString}"`);
}

main();
