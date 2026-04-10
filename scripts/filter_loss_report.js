#!/usr/bin/env node
/**
 * Filter Loss Report — shows why product-scoped registry sources
 * were rejected during curation for specific products.
 */
const fs = require('fs');
const path = require('path');

const ROOT = process.env.WORKSPACE || path.resolve(__dirname, '..');
const CAL = path.join(ROOT, 'calibration');
const KNOW = path.join(ROOT, 'knowledge');

const QUALIFYING = new Set(['review', 'comparison', 'forum_discussion', 'teardown']);

const TARGETS = [
  // Full Confidence
  { cat: 'refrigerators',   slug: 'sub_zero_classic_designer',  label: 'Sub-Zero Classic' },
  { cat: 'ranges_cooktops', slug: 'wolf_gas_range',             label: 'Wolf Gas Range' },
  { cat: 'toilets',         slug: 'toto_neorest_nx2',           label: 'TOTO Neorest NX2' },
  { cat: 'wall_ovens',      slug: 'miele_h7000',                label: 'Miele H7000 Wall Oven' },
  { cat: 'sinks',           slug: 'kohler_whitehaven_k6489',    label: 'Kohler Whitehaven' },
  // Expected-Insufficient — premium brands
  { cat: 'dishwashers',      slug: 'miele_g7000',                label: 'Miele G7000 Dishwasher' },
  { cat: 'hvac',             slug: 'trane_xv',                   label: 'Trane XV20i' },
  { cat: 'hvac',             slug: 'carrier_infinity',           label: 'Carrier Infinity' },
  { cat: 'water_heaters',    slug: 'rinnai_ru199in',             label: 'Rinnai RU199iN' },
  { cat: 'lighting_control', slug: 'lutron_homeworks_qsx_ketra', label: 'Lutron HomeWorks QSX+Ketra' },
];

const ALWAYS_EXCLUDE = new Set([
  'google.com', 'facebook.com', 'twitter.com', 'instagram.com',
  'pinterest.com', 'linkedin.com', 'tiktok.com', 'amazon.com',
  'ebay.com', 'walmart.com', 'target.com', 'lowes.com',
  'homedepot.com', 'wayfair.com', 'wikipedia.org',
]);

const NON_CONTENT = [/\/author\//i, /\/about/i, /\/tag\//i, /\/category\//i, /\/contact/i, /\/privacy/i, /\/terms/i, /\/search/i, /\/account/i, /\/login/i, /\/cart/i, /\/checkout/i];

const MAX_PER_DOMAIN = 2;
const WHITELIST = new Set(['consumerreports.org', 'blog.yaleappliance.com', 'yaleappliance.com']);

function getHost(url) {
  try { return new URL(url).hostname.replace(/^www\./, '').toLowerCase(); } catch { return ''; }
}

function hasPath(url) {
  try { const u = new URL(url); return u.pathname && u.pathname !== '/' && u.pathname !== '/index.html'; } catch { return true; }
}

function isNonContent(url) {
  return NON_CONTENT.some(p => p.test(url));
}

for (const t of TARGETS) {
  const config = JSON.parse(fs.readFileSync(path.join(CAL, t.cat, 'config.json'), 'utf8'));
  const md = config.manufacturer_domains || {};

  // Build mfr domains for ALL products in this category (sibling filter)
  const mfrDomains = new Set();
  for (const domains of Object.values(md)) {
    if (Array.isArray(domains)) domains.forEach(d => mfrDomains.add(d.toLowerCase()));
  }

  // Registry product sources for this slug
  const regPath = path.join(KNOW, t.cat, 'sources_registry.json');
  if (!fs.existsSync(regPath)) { console.log(`═══ ${t.label} — NO REGISTRY ═══\n`); continue; }
  const reg = JSON.parse(fs.readFileSync(regPath, 'utf8'));
  const prodReg = reg.filter(s => s.scope === 'product' && s.products && s.products.includes(t.slug));

  // Curation product sources
  const curDir = path.join(CAL, t.cat, 'curation_files');
  let curProd = [];
  if (fs.existsSync(curDir)) {
    const files = fs.readdirSync(curDir).filter(f => f.includes(t.slug) && f.endsWith('_curation.json'));
    if (files.length) {
      const cur = JSON.parse(fs.readFileSync(path.join(curDir, files[0]), 'utf8'));
      curProd = (cur.sources || []).filter(s => s.scope === 'product');
    }
  }

  // Badge
  const qual = curProd.filter(s => QUALIFYING.has(s.source_type) && s.claim && s.claim.length > 0);
  const qualB = qual.filter(s => ['S', 'A', 'B'].includes(s.pool));
  const badge = qual.length >= 5 && qualB.length >= 2
    ? '● Full Confidence'
    : qual.length >= 2 && qualB.length >= 1
      ? '◐ Scored with Disclosure'
      : '○ Insufficient Evidence';

  console.log(`═══ ${t.label} [${badge}] ═══`);
  console.log(`Registry product sources: ${prodReg.length} | Curation product sources: ${curProd.length} | Qualifying: ${qual.length}\n`);

  // Find rejected URLs
  const curationUrls = new Set(curProd.map(s => s.url));
  const rejected = [];
  const domainCountTracker = {};

  for (const s of prodReg) {
    if (curationUrls.has(s.url)) continue;
    const host = getHost(s.url);
    let reason = 'unknown';

    if (s.verify_status === 'dead') {
      reason = 'dead_link';
    } else if (s.verify_status === 'non-content' || isNonContent(s.url)) {
      reason = 'non_content';
    } else if (ALWAYS_EXCLUDE.has(host)) {
      reason = 'always_excluded';
    } else if (mfrDomains.has(host)) {
      reason = 'manufacturer_domain';
    } else if (!hasPath(s.url)) {
      reason = 'bare_root';
    } else {
      domainCountTracker[host] = (domainCountTracker[host] || 0) + 1;
      const inCuration = curProd.filter(c => getHost(c.url) === host).length;
      if (inCuration >= MAX_PER_DOMAIN && !WHITELIST.has(host)) {
        reason = `domain_cap (${host} already has ${inCuration})`;
      } else if (domainCountTracker[host] + inCuration > MAX_PER_DOMAIN && !WHITELIST.has(host)) {
        reason = `domain_cap (${host} would exceed ${MAX_PER_DOMAIN})`;
      } else {
        reason = 'slot_overflow (capped at 10 product slots)';
      }
    }
    rejected.push({ url: s.url, host, pool: s.source_pool || '?', reason });
  }

  if (rejected.length === 0) {
    console.log('  No rejected product sources — all made it in.\n');
  } else {
    console.log(`  REJECTED (${rejected.length}):`);
    rejected.forEach((r, i) => {
      console.log(`  ${i + 1}. [${r.pool}] ${r.reason}`);
      console.log(`     ${r.url.substring(0, 130)}`);
    });

    const reasons = {};
    rejected.forEach(r => { const k = r.reason.split(' (')[0]; reasons[k] = (reasons[k] || 0) + 1; });
    console.log(`  Summary: ${Object.entries(reasons).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}:${v}`).join(', ')}`);
  }
  console.log();
}
