#!/usr/bin/env node
/**
 * generate_curations.js — Source-Registry-Driven Curation Builder
 *
 * Reads from knowledge/{category}/sources_registry.json (NOT markdown).
 * Applies quality filters before writing:
 *   - Excludes manufacturer's own domains (not independent)
 *   - Excludes bare root domains (no meaningful path)
 *   - Proper column classification (forum/review/expert)
 *   - Domain deduplication (max 2 URLs per domain)
 *   - Pool-sorted output (S → A → B → C)
 *   - Capped at MAX_SOURCES per product
 *
 * Fails loudly if a product has zero sources after filtering.
 *
 * Usage: node scripts/generate_curations.js <category>
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT     = path.resolve(__dirname, '..');
const category = process.argv[2];

if (!category) {
  console.error('Usage: node scripts/generate_curations.js <category>');
  process.exit(1);
}

const configPath   = path.join(ROOT, 'calibration', category, 'config.json');
const curationDir  = path.join(ROOT, 'calibration', category, 'curation_files');
const registryPath = path.join(ROOT, 'knowledge', category, 'sources_registry.json');

// ── Config ────────────────────────────────────────────────────────────────────

const MAX_SOURCES       = 25;   // max sources per product curation
const MAX_PER_DOMAIN    = 2;    // max URLs from the same domain per curation

// High-value domains exempt from MAX_PER_DOMAIN.
// These are independent sources with published methodology where multiple
// articles add genuine editorial value, not single-source spam.
const DOMAIN_CAP_WHITELIST = new Set([
  'yaleappliance.com',          // Pool A — independent service data, published methodology
  'blog.yaleappliance.com',     // same org, blog subdomain
  'consumerreports.org',        // Pool S — independent lab testing
  'finehomebuilding.com',       // Pool A — professional trade publication
  'jlconline.com',              // Pool A — Journal of Light Construction
  'buildingscience.com',        // Pool A — Building Science Corporation
  'greenbuildingadvisor.com',   // Pool A — building science
]);

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

// ── Manufacturer domain map ───────────────────────────────────────────────────
// Loaded from config.manufacturer_domains — no hardcoded domains here.
// Each category config maps product slugs → arrays of domains belonging to
// that manufacturer and its corporate parent. See calibration/*/config.json.

// Low-value domains to always exclude regardless of product
const ALWAYS_EXCLUDE_DOMAINS = [
  'amazon.com', 'ebay.com', 'walmart.com', 'target.com', 'wayfair.com',
  'overstock.com', 'costco.com', 'samsclub.com', 'bhphotovideo.com',
  'pinterest.com', 'instagram.com', 'facebook.com', 'twitter.com', 'x.com',
  'tiktok.com', 'linkedin.com',
  'yelp.com', 'trustpilot.com', 'sitejabber.com', 'bbb.org',
  'google.com', 'bing.com', 'yahoo.com',
  'takywj.com', // Chinese hardware affiliate spam
];

// ── URL parsing helpers ───────────────────────────────────────────────────────

function getHostname(url) {
  try { return new URL(url).hostname.replace(/^www\./, '').toLowerCase(); } catch { return ''; }
}

function getPathname(url) {
  try { return new URL(url).pathname; } catch { return ''; }
}

function hasMeaningfulPath(url) {
  // Bare root domains (e.g. https://chesapeakeplywood.com) have no useful path
  const p = getPathname(url).replace(/\/$/, '');
  return p.length > 1; // anything beyond just "/"
}

// ── Column classification ─────────────────────────────────────────────────────

function classifyColumn(src) {
  const u = (src.url || '').toLowerCase();
  const host = getHostname(src.url);

  // Forums / community discussion
  if (/reddit\.com|houzz\.com\/discussions|quora\.com|forums?\.|discuss\.|community\./.test(u)) return 'forum';
  if (/consumeraffairs\.com|gardenweb|doityourself\.com/.test(u)) return 'forum';

  // Video (review/demo, not expert)
  if (/youtube\.com|vimeo\.com/.test(u)) return 'review';

  // Consumer review aggregators
  if (/trustpilot|sitejabber|yelp|bbb\.org|consumerreports\.org/.test(u)) return 'review';

  // Known expert / trade / institutional
  if (/kcma\.org|awinet\.org|nkba\.org|nfrc\.org|aama\.net|nsf\.org|wqa\.org|asme\.org/.test(u)) return 'expert';
  if (/\.gov\/|\.edu\//.test(u)) return 'expert';
  if (/woodworkingnetwork\.com|finehomebuilding\.com|jlconline\.com|thisoldhouse\.com/.test(u)) return 'expert';
  if (/yaleappliance\.com|mainlinekitchendesign\.com|mapflush\.org|iapmo\.org/.test(u)) return 'expert';
  if (/blum\.com|grass\.eu|hettich\.com|salice\.com/.test(u)) return 'expert'; // hardware mfrs (independent from cabinet mfrs)
  if (/arb\.ca\.gov|epa\.gov|energy\.gov|energystar\.gov|cpsc\.gov/.test(u)) return 'expert';

  // Pool C → forum
  if (src.source_pool === 'C') return 'forum';

  // Pool S independent labs → expert
  if (src.source_pool === 'S') return 'expert';

  // Default B→review, A→expert
  return src.source_pool === 'A' ? 'expert' : 'review';
}

// ── Pool sort order ───────────────────────────────────────────────────────────

const POOL_ORDER = { S: 0, A: 1, B: 2, C: 3 };

function poolRank(src) {
  return POOL_ORDER[src.source_pool] ?? 4;
}

// ── Quality filter ────────────────────────────────────────────────────────────

/**
 * Build the set of manufacturer domains to exclude for a given product.
 * Reads from config.manufacturer_domains (populated per-category in config.json).
 * Includes the product's own domains PLUS all sibling brand domains that share
 * a corporate parent — none of those are independent sources.
 */
function buildManufacturerDomains(productSlug) {
  const mfrMap = config.manufacturer_domains || {};
  const domains = new Set();

  // 1. This product's own manufacturer domains
  const ownDomains = mfrMap[productSlug] || [];
  ownDomains.forEach(d => domains.add(d));

  // 2. Find sibling brands that share a corporate parent domain.
  //    If Merillat owns masterbrand.com, and KraftMaid also owns masterbrand.com,
  //    then kraftmaid.com is not independent for Merillat scoring either.
  const ownParents = new Set(ownDomains);
  for (const [slug, slugDomains] of Object.entries(mfrMap)) {
    if (slug === productSlug) continue;
    // Check if any domain overlaps (shared parent)
    const hasSharedParent = slugDomains.some(d => ownParents.has(d));
    if (hasSharedParent) {
      slugDomains.forEach(d => domains.add(d));
    }
  }

  return domains;
}

// Non-content URL patterns: navigation/metadata pages, not articles
const NON_CONTENT_PATHS = [
  /\/author\//i, /\/authors?\/?$/i,
  /\/about\/?$/i, /\/about-us/i,
  /\/contact\/?$/i,
  /\/tag\//i, /\/tags?\/?$/i,
  /\/category\//i, /\/categories\/?$/i,
  /\/search/i,
  /\/login/i, /\/signup/i, /\/register/i,
  /\/subscribe/i, /\/newsletter/i,
  /\/privacy/i, /\/terms/i, /\/legal/i,
  /\/sitemap/i,
  /\/feed\/?$/i, /\/rss/i,
  /\/page\/\d+$/i,
  /\/comment-page/i, /\/comments?\/?$/i,
  /\/share\//i, /\/print\//i, /\/embed\//i, /\/amp\/?$/i,
  /\/cdn-cgi\//i, /\/wp-admin/i, /\/wp-login/i,
  /\?replytocom=/i, /\?share=/i,
  /#respond$/i, /#comments$/i,
];

function isNonContentPath(url) {
  return NON_CONTENT_PATHS.some(p => p.test(url));
}

function filterSources(sources, productSlug, productName) {
  const mfrDomains    = buildManufacturerDomains(productSlug);
  const alwaysExclude = new Set(ALWAYS_EXCLUDE_DOMAINS);
  const domainCount   = {};
  const filtered      = [];
  const dropped       = { dead: 0, nonContent: 0, manufacturer: 0, alwaysExclude: 0, bareRoot: 0, domainCap: 0, total: 0 };

  for (const src of sources) {
    const host = getHostname(src.url);
    dropped.total++;

    // 0. Dead links (verified by verify_source_registry.js)
    if (src.verify_status === 'dead') {
      dropped.dead++;
      continue;
    }

    // 0b. Non-content pages (author profiles, about pages, tag indexes)
    if (src.verify_status === 'non-content' || isNonContentPath(src.url)) {
      dropped.nonContent++;
      continue;
    }

    // 1. Always-exclude domains
    if (alwaysExclude.has(host)) {
      dropped.alwaysExclude++;
      continue;
    }

    // 2. Manufacturer's own site — not independent
    if (mfrDomains.has(host)) {
      dropped.manufacturer++;
      continue;
    }

    // 3. Bare root domain — no path = low signal
    if (!hasMeaningfulPath(src.url)) {
      dropped.bareRoot++;
      continue;
    }

    // 4. Domain deduplication cap (whitelisted domains exempt)
    domainCount[host] = (domainCount[host] || 0) + 1;
    if (domainCount[host] > MAX_PER_DOMAIN && !DOMAIN_CAP_WHITELIST.has(host)) {
      dropped.domainCap++;
      continue;
    }

    filtered.push(src);
  }

  return { filtered, dropped };
}

// ── Source type classifier ────────────────────────────────────────────────────

const FORUM_DOMAINS = ['houzz.com', 'reddit.com', 'contractortalk.com', 'gardenweb.com', 'diychatroom.com', 'hvac-talk.com'];

// Domains that always produce evaluative content (independent reviewers)
const REVIEWER_DOMAINS = [
  'blog.yaleappliance.com', 'yaleappliance.com',
  'designerappliances.com', 'consumeraffairs.com',
  'kitchencabinetsreviews.com', 'appliancesconnection.com',
  'ajmadison.com', 'orvilles.com', 'friedmansappliance.com',
  'mychemicalfreehouse.net', 'oakabode.com',
  'stoveshield.com', 'elizabethannehome.com',
  'buildwithrise.com', 'progress-builders.com',
  'mainlinekitchendesign.com',
];

function classifySourceType(url, name) {
  const lower = url.toLowerCase();
  const nameLower = (name || '').toLowerCase();
  const host = (() => { try { return new URL(url).hostname.replace(/^www\./, '').toLowerCase(); } catch { return ''; } })();

  // Company profiles
  if (host === 'encyclopedia.com' || host === 'wikipedia.org' || host.endsWith('.wikipedia.org')) return 'company_profile';

  // Spec sheets / catalogs / brochures
  if (/catalog|specbook|spec-book|spec_book|brochure|spec\.pdf|specification/i.test(lower)) return 'spec_sheet';
  if (/Classic-Catalog|SpecBook|Brochure/i.test(lower)) return 'spec_sheet';

  // Historical / archival
  if (/retrorenovation\.com|1946|archiv|historical/i.test(lower)) return 'historical';

  // Teardowns
  if (/teardown|disassembl|take-apart|take_apart/i.test(lower)) return 'teardown';

  // Comparisons
  if (/\bvs\b|compared|comparison|versus|side-by-side/i.test(lower) || /\bvs\b|compared|comparison/i.test(nameLower)) return 'comparison';

  // Forums
  if (FORUM_DOMAINS.some(d => host === d || host.endsWith('.' + d))) return 'forum_discussion';
  if (/\/forum\/|\/forums\/|\/discussion|\/thread/i.test(lower)) return 'forum_discussion';
  // Houzz discussions are forums even without /discussion/ in path
  if (host === 'houzz.com' || host.endsWith('.houzz.com')) return 'forum_discussion';

  // Reviews — explicit patterns
  if (/review|rating|rated|firsthand|hands-on|tested/i.test(lower) || /review|rating/i.test(nameLower)) return 'review';
  // Evaluative content patterns (worth-it, best-X, pros-cons, should-you-buy)
  if (/worth-it|worth-the|is-.*-worth|are-.*-worth|best-.*-20\d\d|pros-.*cons|should-you-buy|buying-guide/i.test(lower)) return 'review';
  // Known reviewer domains → always review
  if (REVIEWER_DOMAINS.some(d => host === d || host.endsWith('.' + d))) return 'review';

  // Legal / recall / class action — evaluative (safety evidence)
  if (/class-action|classaction|cpsc\.gov\/recalls|lawsuit|recall/i.test(lower)) return 'review';

  // YouTube — treat as review if product-scoped (these are product evaluation videos)
  if (host === 'youtube.com' || host === 'youtu.be' || host.endsWith('.youtube.com')) return 'review';

  // BBB profiles — consumer review aggregator
  if (host === 'bbb.org' || host.endsWith('.bbb.org')) return 'review';

  return 'other';
}

// ── Claim generator ──────────────────────────────────────────────────────────

function generateClaim(regSrc, sourceType) {
  const name = regSrc.name || regSrc.institution || '';
  const url = regSrc.url || '';
  const host = (() => { try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; } })();

  // Non-evaluative types get empty claims
  if (['spec_sheet', 'company_profile', 'historical'].includes(sourceType)) return '';

  // For reviews/comparisons/forums/teardowns, generate a descriptive claim
  if (sourceType === 'review') {
    return `Independent review of this product published on ${host}.`;
  }
  if (sourceType === 'comparison') {
    return `Comparison evaluating this product against competitors on ${host}.`;
  }
  if (sourceType === 'forum_discussion') {
    return `Contractor or consumer discussion with firsthand experience on ${host}.`;
  }
  if (sourceType === 'teardown') {
    return `Physical teardown or component analysis published on ${host}.`;
  }

  // 'other' — might still be evaluative but can't confirm
  return '';
}

// ── Convert registry entry → curation source object ──────────────────────────

function toSourceEntry(regSrc, id) {
  const isProduct = (regSrc.scope || 'category') === 'product';
  const sourceType = isProduct ? classifySourceType(regSrc.url, regSrc.name) : undefined;
  const claim = isProduct ? generateClaim(regSrc, sourceType) : undefined;

  const entry = {
    id,
    source_name: regSrc.name || regSrc.institution || regSrc.url.substring(0, 60),
    url: regSrc.url,
    platform: 'other',
    column: classifyColumn(regSrc),
    snippet: '',  // curator fills in via inspector
    pool: regSrc.source_pool || 'B',
    scope: regSrc.scope || 'category',
    classification: regSrc.scope === 'category' ? 'independent' : 'score',
    classification_reason: `Captured from ${regSrc.captured_from}. Scope: ${regSrc.scope}.`,
    topics: regSrc.axes || ['quality'],
    verification_relevance: 'relevant',
    captured_from: regSrc.captured_from,
    verified: regSrc.verified || false,
  };

  if (isProduct) {
    entry.source_type = sourceType;
    entry.claim = claim;
  }

  return entry;
}

// ── Split registry by scope ───────────────────────────────────────────────────

const categorySources = registry.filter(s => s.scope === 'category');
const productSources  = registry.filter(s => s.scope === 'product');

console.log(`\nGenerating curation files for: ${category}`);
console.log(`Products: ${config.calibration_products.length}`);
console.log(`Registry: ${registry.length} sources (${categorySources.length} cat-scope, ${productSources.length} prod-scope)`);
console.log(`Quality filter: manufacturer domains excluded, max ${MAX_SOURCES} sources, max ${MAX_PER_DOMAIN}/domain`);
console.log();

// ── Process each product ──────────────────────────────────────────────────────

let totalWritten         = 0;
let totalSourcesBefore   = 0;
let totalSourcesAfter    = 0;
let placeholdersElim     = 0;

for (const product of config.calibration_products) {
  const slug = product.slug;

  // Combine category + product-specific sources (for stats only)
  const rawTotal = categorySources.length + productSources.filter(s => s.products && s.products.includes(slug)).length;

  // Sort by pool quality (S first, then A, B, C).
  // Within same pool, product-specific sources rank above category-scoped.
  const poolSort = (a, b) => {
    const poolDiff = poolRank(a) - poolRank(b);
    if (poolDiff !== 0) return poolDiff;
    const aProduct = (a.scope === 'product') ? 0 : 1;
    const bProduct = (b.scope === 'product') ? 0 : 1;
    return aProduct - bProduct;
  };

  // Apply quality filter to each scope independently
  const rawCat = categorySources.slice();
  const rawProd = productSources.filter(s => s.products && s.products.includes(slug));

  const filteredCat = filterSources(rawCat, slug, product.name);
  const filteredProd = filterSources(rawProd, slug, product.name);

  // Reservation: product sources get guaranteed slots (up to 10)
  const MAX_PRODUCT_SLOTS = 10;
  filteredProd.filtered.sort(poolSort);
  filteredCat.filtered.sort(poolSort);

  const prodSlice = filteredProd.filtered.slice(0, MAX_PRODUCT_SLOTS);
  const catSlotCount = MAX_SOURCES - prodSlice.length;
  const catSlice = filteredCat.filtered.slice(0, catSlotCount);

  // Merge product-first, then category; re-sort for display consistency
  const filtered = [...prodSlice, ...catSlice];
  filtered.sort(poolSort);

  const dropped = { mfr: (filteredCat.dropped?.mfr || 0) + (filteredProd.dropped?.mfr || 0) };

  // Cap at MAX_SOURCES
  const capped = filtered.slice(0, MAX_SOURCES);

  // Load existing curation for before-stats
  const existingPath = path.join(curationDir, `${slug}_curation.json`);
  let existingSources = [];
  if (fs.existsSync(existingPath)) {
    try { existingSources = JSON.parse(fs.readFileSync(existingPath, 'utf8')).sources || []; } catch {}
  }
  const prevPlaceholders = existingSources.filter(s => s.url === 'deep_dive_synthesis').length;
  totalSourcesBefore += existingSources.length;
  placeholdersElim   += prevPlaceholders;

  if (capped.length === 0) {
    if (fs.existsSync(existingPath)) {
      console.log(`  ⚠️  ${product.name}: 0 sources after filtering — preserving existing curation`);
      continue;
    }
    console.error(`  ❌ ${product.name}: 0 sources after filtering and no existing curation.`);
    process.exit(1);
  }

  // Build source entries
  const sources = capped.map((s, i) => toSourceEntry(s, `SRC-${String(i + 1).padStart(3, '0')}`));
  totalSourcesAfter += sources.length;

  // Pool distribution
  const poolDist = { pool_S: 0, pool_A: 0, pool_B: 0, pool_C: 0 };
  for (const s of sources) { const k = `pool_${s.pool}`; if (k in poolDist) poolDist[k]++; }

  // Column distribution for summary
  const colDist = {};
  for (const s of sources) colDist[s.column] = (colDist[s.column] || 0) + 1;

  const droppedMfr = (filteredCat.dropped?.manufacturer || 0) + (filteredProd.dropped?.manufacturer || 0);
  const droppedAlways = (filteredCat.dropped?.alwaysExclude || 0) + (filteredProd.dropped?.alwaysExclude || 0);
  const droppedBare = (filteredCat.dropped?.bareRoot || 0) + (filteredProd.dropped?.bareRoot || 0);
  const droppedCap = (filteredCat.dropped?.domainCap || 0) + (filteredProd.dropped?.domainCap || 0);

  const droppedNote = `mfr:${droppedMfr} always:${droppedAlways} bare:${droppedBare} cap:${droppedCap}`;

  const curationFile = {
    product:             product.name,
    report_date:         new Date().toISOString().substring(0, 10),
    sources,
    bottom_line:         product.rationale || `${product.name} — Tier ${product.tier} product. Target score: ${product.target}/100.`,
    scoring_notes: {
      sources_scored:      sources.filter(s => s.classification === 'score').map(s => s.id),
      sources_report_only: sources.filter(s => s.classification !== 'score').map(s => s.id),
      sources_quarantined: [],
      pool_distribution:   poolDist,
      filter_summary:      { raw: rawTotal, after_filter: filtered.length, capped: capped.length, dropped: { mfr: droppedMfr, always: droppedAlways, bare: droppedBare, cap: droppedCap } },
    },
    product_slug:         slug,
    product_name:         product.name,
    manufacturer_slug:    slug.split('_')[0],
    deep_dive_date:       new Date().toISOString().substring(0, 10),
    structuring_model:    'source_registry_v2',
    curation_status:      'curated',
    curation_date:        new Date().toISOString().substring(0, 10),
    human_overrides:      [],
    platform_disclosure:  product.platform_disclosure || null,
    outlook:              product.outlook || null,
    outlook_rationale:    product.outlook_rationale || product.rationale || null,
  };

  fs.writeFileSync(existingPath, JSON.stringify(curationFile, null, 2));

  const poolSummary = `S:${poolDist.pool_S} A:${poolDist.pool_A} B:${poolDist.pool_B} C:${poolDist.pool_C}`;
  const colSummary  = Object.entries(colDist).map(([k,v])=>`${k}:${v}`).join(' ');
  console.log(`  ✅ ${product.name}: ${sources.length} sources [${poolSummary}] [${colSummary}]`);
  console.log(`     dropped ${rawTotal - capped.length} — ${droppedNote}`);
  totalWritten++;
}

// ── Summary ───────────────────────────────────────────────────────────────────

console.log('\n' + '─'.repeat(65));
console.log(`Products written:          ${totalWritten}/${config.calibration_products.length}`);
console.log(`Sources before:            ${totalSourcesBefore}`);
console.log(`Sources after:             ${totalSourcesAfter}`);
console.log(`Placeholders eliminated:   ${placeholdersElim}`);
console.log('─'.repeat(65));
console.log('\nDone!\n');
