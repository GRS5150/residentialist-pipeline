'use strict';
/**
 * source_registry.js — shared helper for run_research.js and run_deep_dives.js
 *
 * Writes citation URLs returned by Perplexity directly into
 * knowledge/{category}/sources_registry.json at the moment of capture.
 * This replaces the downstream markdown-parsing approach.
 */

const fs   = require('fs');
const path = require('path');

const ROOT     = path.resolve(__dirname, '..');
const KNOW_DIR = path.join(ROOT, 'knowledge');

const NOISE_RE = [
  /\.(png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|css|js)(\?|$)/i,
  /google\.com\/(search|url|imgres)/i,
  /bing\.com\/search/i,
  /facebook\.com\/(sharer|share)/i,
  /twitter\.com\/intent/i,
  /perplexity\.ai|pplx\.ai/i,
];

function isNoisy(url) {
  return NOISE_RE.some(p => p.test(url));
}

function guessPool(url) {
  const u = url.toLowerCase();
  if (/consumerreports\.org|capitaltesting\.org|epa\.gov|nist\.gov|energy\.gov|energystar\.gov/.test(u)) return 'S';
  if (/acs\.org|pubmed|ncbi\.nlm|springer|elsevier|tandfonline|wiley/.test(u)) return 'S';
  if (/kcma\.org|awinet\.org|nkba\.org|nfrc\.org|aama\.net|nsf\.org|wqa\.org|asme\.org|iapmo\.org|mapflush\.org/.test(u)) return 'A';
  if (/woodworkingnetwork\.com|finehomebuilding\.com|jlconline\.com|mainlinekitchendesign\.com|yaleappliance\.com/.test(u)) return 'A';
  if (/\.gov\/|\.edu\//.test(u)) return 'A';
  if (/houzz\.com|thisoldhouse\.com|bobvila\.com|architecturaldigest\.com/.test(u)) return 'B';
  if (/reddit\.com|quora\.com/.test(u)) return 'B';
  if (/trustpilot\.com|yelp\.com|consumeraffairs\.com|bbb\.org/.test(u)) return 'C';
  if (/youtube\.com/.test(u)) return 'C';
  return 'B';
}

function nameFromUrl(url) {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, '');
    const parts = u.pathname.split('/').filter(Boolean);
    const slug = (parts.slice(-1)[0] || '').replace(/[-_]/g, ' ').replace(/\.\w+$/, '');
    return slug.length > 4 ? `${host} — ${slug.substring(0, 60)}` : host;
  } catch { return url.substring(0, 80); }
}

function institutionFromUrl(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; }
}

/**
 * Append citation URLs to the source registry for a category.
 *
 * @param {string} category   - e.g. "cabinets"
 * @param {string[]} citations - URLs from Perplexity response
 * @param {string} capturedFrom - "research_pass_1" | "deep_dive" etc.
 * @param {string|null} productSlug - null for category-scope
 */
function appendToRegistry(category, citations, capturedFrom, productSlug = null) {
  const registryPath = path.join(KNOW_DIR, category, 'sources_registry.json');

  // Load existing
  let existing = [];
  if (fs.existsSync(registryPath)) {
    try { existing = JSON.parse(fs.readFileSync(registryPath, 'utf8')); } catch {}
  }
  const existingUrls = new Set(existing.map(s => s.url));

  const now = new Date().toISOString();
  let added = 0;

  for (const url of citations) {
    const clean = url.replace(/[.,;:)\]]+$/, '').trim();
    if (!clean || clean.length < 16 || isNoisy(clean) || existingUrls.has(clean)) continue;

    existingUrls.add(clean);
    existing.push({
      url: clean,
      name: nameFromUrl(clean),
      institution: institutionFromUrl(clean),
      source_pool: guessPool(clean),
      scope: productSlug ? 'product' : 'category',
      products: productSlug ? [productSlug] : [],
      axes: ['Q'],           // conservative default; curators can refine
      captured_from: capturedFrom,
      captured_at: now,
      verified: false,
    });
    added++;
  }

  if (added > 0) {
    fs.mkdirSync(path.join(KNOW_DIR, category), { recursive: true });
    fs.writeFileSync(registryPath, JSON.stringify(existing, null, 2));
  }

  return added;
}

module.exports = { appendToRegistry };
