#!/usr/bin/env node
/**
 * backfill_source_registry.js
 *
 * One-time backfill: reads all existing knowledge/{category}/*.md files,
 * extracts URLs from Citation blocks and inline links, classifies each
 * source, and writes knowledge/{category}/sources_registry.json.
 *
 * Pass 1-4 files  → scope: "category"
 * deep_dive_* files → scope: "product"
 *
 * Usage: node scripts/backfill_source_registry.js [category]
 *        node scripts/backfill_source_registry.js          (all categories)
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT     = path.resolve(__dirname, '..');
const KNOW_DIR = path.join(ROOT, 'knowledge');

// ── Helpers ──────────────────────────────────────────────────────────────────

const URL_RE = /https?:\/\/[^\s\)>\]",]+/g;

// Noise URLs to skip (tracking pixels, CDN assets, pagination, etc.)
const NOISE_PATTERNS = [
  /\.(png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|css|js)(\?|$)/i,
  /google\.com\/(search|url|imgres)/i,
  /bing\.com\/search/i,
  /facebook\.com\/(sharer|share)/i,
  /twitter\.com\/intent/i,
  /linkedin\.com\/share/i,
  /pinterest\.com\/pin/i,
  /cdn\./i,
  /static\./i,
  /assets\./i,
  /\/wp-content\/uploads\//i,
  /perplexity\.ai/i,
  /pplx\.ai/i,
];

function isNoisy(url) {
  return NOISE_PATTERNS.some(p => p.test(url));
}

// Guess pool tier from domain/path heuristics
function guessPool(url, text) {
  const u = url.toLowerCase();
  // S-tier: lab/testing bodies, gov agencies with specific data
  if (/consumerreports\.org|capitaltesting\.org|epa\.gov|nist\.gov|energy\.gov|energystar\.gov/.test(u)) return 'S';
  if (/acs\.org|journals\.|pubmed|ncbi\.nlm|springer|elsevier|tandfonline|wiley/.test(u)) return 'S';
  // A-tier: industry certification bodies, major trade pubs, known expert sites
  if (/kcma\.org|awinet\.org|nkba\.org|nfrc\.org|aama\.net|nsf\.org|wqa\.org|asme\.org/.test(u)) return 'A';
  if (/woodworkingnetwork\.com|fdmc|finehomebuilding\.com|jlconline\.com/.test(u)) return 'A';
  if (/mainlinekitchendesign\.com|yaleappliance\.com|mapflush\.org|iapmo\.org/.test(u)) return 'A';
  if (/\.gov\/|\.edu\//.test(u)) return 'A';
  // B-tier: reviews, professional associations, known outlets
  if (/houzz\.com|thisoldhouse\.com|bobvila\.com|architecturaldigest\.com/.test(u)) return 'B';
  if (/reddit\.com|quora\.com/.test(u)) return 'B';
  if (/nari\.org|asid\.org|iida\.org/.test(u)) return 'B';
  // C-tier: consumer aggregators, social, forums
  if (/trustpilot\.com|yelp\.com|consumeraffairs\.com|bbb\.org/.test(u)) return 'C';
  if (/youtube\.com|facebook\.com|instagram\.com/.test(u)) return 'C';
  // Default A for institutional-looking domains, B otherwise
  return u.includes('.com') ? 'B' : 'A';
}

// Guess which axes a source informs from surrounding text or URL
function guessAxes(url, surroundingText) {
  const t = (surroundingText || '').toLowerCase();
  const axes = new Set();
  if (/quality|construction|material|finish|joinery|build/.test(t)) axes.add('Q');
  if (/durability|life|failure|wear|cycle|warranty|longevity|reliable/.test(t)) axes.add('D');
  if (/performance|flow|pressure|efficiency|rating|test|measur/.test(t)) axes.add('P');
  if (/safety|formaldehyde|carb|voc|greenguard|emission|toxic|lead|pfas/.test(t)) axes.add('MS');
  if (axes.size === 0) axes.add('Q'); // default
  return Array.from(axes);
}

// Derive a readable name from a URL
function nameFromUrl(url) {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, '');
    const parts = u.pathname.split('/').filter(Boolean);
    const slug = parts.slice(-1)[0] || '';
    const readableSlug = slug.replace(/[-_]/g, ' ').replace(/\.\w+$/, '');
    return readableSlug.length > 4
      ? `${host} — ${readableSlug.substring(0, 60)}`
      : host;
  } catch {
    return url.substring(0, 80);
  }
}

function institutionFromUrl(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

// ── Core extraction ───────────────────────────────────────────────────────────

function extractFromFile(filePath, passTag, productSlug) {
  const text = fs.readFileSync(filePath, 'utf8');
  const results = [];
  const seen = new Set();

  // Parse the ## Citations block — this is the numbered list Perplexity returned.
  // Format: "1. https://example.com/actual-article\n2. https://..."
  const citationMatch = text.match(/## Citations\n([\s\S]+)$/);
  let urls;

  if (citationMatch) {
    // Citation block exists — use ONLY these URLs. They are what Perplexity cited.
    urls = [];
    const lines = citationMatch[1].split('\n');
    for (const line of lines) {
      // Match numbered citation lines: "1. https://..." or "- https://..."
      const urlMatch = line.match(/^\s*(?:\d+[\.\)]\s*|[-*]\s*)?(https?:\/\/[^\s\)>\]",]+)/);
      if (urlMatch) {
        const clean = urlMatch[1].replace(/[.,;:)\]]+$/, '');
        if (clean.length > 16 && !isNoisy(clean)) {
          urls.push(clean);
        }
      }
    }
  } else {
    // No citation block — old file format. Fall back to inline URL extraction.
    const allMatches = text.match(URL_RE) || [];
    urls = [];
    for (const u of allMatches) {
      const clean = u.replace(/[.,;:)\]]+$/, '');
      if (clean.length > 16 && !isNoisy(clean) && !seen.has(clean)) {
        urls.push(clean);
        seen.add(clean);
      }
    }
  }

  for (const url of urls) {
    if (seen.has(url)) continue;
    seen.add(url);

    // Get surrounding context for axis inference
    const idx = text.indexOf(url);
    const context = idx >= 0
      ? text.substring(Math.max(0, idx - 100), idx + 100)
      : '';

    results.push({
      url,
      name: nameFromUrl(url),
      institution: institutionFromUrl(url),
      source_pool: guessPool(url, context),
      scope: productSlug ? 'product' : 'category',
      products: productSlug ? [productSlug] : [],
      axes: guessAxes(url, context),
      captured_from: passTag,
      captured_at: new Date().toISOString(),
      verified: false,
      in_citation_block: !!citationMatch,
    });
  }

  return results;
}

// ── Process one category ──────────────────────────────────────────────────────

function processCategory(category) {
  const catDir = path.join(KNOW_DIR, category);
  if (!fs.existsSync(catDir)) {
    console.error(`  No knowledge directory for: ${category}`);
    return null;
  }

  const files = fs.readdirSync(catDir).filter(f => f.endsWith('.md'));
  // Clean start — rebuild registry from scratch using citation blocks
  const registryPath = path.join(catDir, 'sources_registry.json');
  const existingUrls = new Set();

  const passMap = {
    'testing_framework': 'research_pass_1',
    'component_analysis': 'research_pass_2',
    'hierarchy_top':      'research_pass_3',
    'hierarchy_bottom':   'research_pass_4',
    'eval_knowledge':     'research_pass_1',
    'material_safety':    'research_pass_1',
  };

  let catAdded = 0, prodAdded = 0;
  const allNew = [];

  for (const fname of files) {
    if (fname === 'sources_registry.json') continue;
    const fpath = path.join(catDir, fname);

    let passTag = 'research_pass_1';
    let productSlug = null;

    if (fname.startsWith('deep_dive_')) {
      productSlug = fname.replace('deep_dive_', '').replace('.md', '');
      passTag = 'deep_dive';
    } else {
      // Match pass tag from filename
      for (const [key, tag] of Object.entries(passMap)) {
        if (fname.includes(key)) { passTag = tag; break; }
      }
    }

    const sources = extractFromFile(fpath, passTag, productSlug);
    for (const src of sources) {
      if (!existingUrls.has(src.url)) {
        existingUrls.add(src.url);
        allNew.push(src);
        if (src.scope === 'category') catAdded++;
        else prodAdded++;
      }
    }
  }

  fs.writeFileSync(registryPath, JSON.stringify(allNew, null, 2));

  return {
    category,
    files: files.length,
    totalSources: allNew.length,
    catSources: allNew.filter(s => s.scope === 'category').length,
    prodSources: allNew.filter(s => s.scope === 'product').length,
    citationBlock: allNew.filter(s => s.in_citation_block).length,
  };
}

// ── Main ──────────────────────────────────────────────────────────────────────

function main() {
  const targetCat = process.argv[2];
  const categories = targetCat
    ? [targetCat]
    : fs.readdirSync(KNOW_DIR).filter(d =>
        fs.statSync(path.join(KNOW_DIR, d)).isDirectory() && d !== 'system'
      ).sort();

  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║  SOURCE REGISTRY BACKFILL                                    ║');
  console.log(`║  Categories: ${String(categories.length).padEnd(47)}║`);
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  const results = [];
  for (const cat of categories) {
    process.stdout.write(`  ${cat}...`);
    const r = processCategory(cat);
    if (r) {
      results.push(r);
      console.log(` ${r.totalSources} sources (${r.catSources} cat / ${r.prodSources} prod, ${r.citationBlock} from citation blocks)`);
    }
  }

  console.log('\n' + '─'.repeat(90));
  console.log(
    `${'Category'.padEnd(22)} ${'Total'.padStart(7)} ${'Cat-scope'.padStart(10)} ${'Prod-scope'.padStart(11)} ${'CitBlock'.padStart(9)} ${'Files'.padStart(6)}`
  );
  console.log('─'.repeat(90));
  let grandTotal = 0, grandCat = 0, grandProd = 0, grandCit = 0;
  for (const r of results) {
    console.log(
      `${r.category.padEnd(22)} ${String(r.totalSources).padStart(7)} ${String(r.catSources).padStart(10)} ${String(r.prodSources).padStart(11)} ${String(r.citationBlock).padStart(9)} ${String(r.files).padStart(6)}`
    );
    grandTotal += r.totalSources;
    grandCat   += r.catSources;
    grandProd  += r.prodSources;
    grandCit   += r.citationBlock;
  }
  console.log('─'.repeat(90));
  console.log(
    `${'TOTAL'.padEnd(22)} ${String(grandTotal).padStart(7)} ${String(grandCat).padStart(10)} ${String(grandProd).padStart(11)} ${String(grandCit).padStart(9)}`
  );
  console.log('\nDone. Check knowledge/{category}/sources_registry.json\n');
}

main();
