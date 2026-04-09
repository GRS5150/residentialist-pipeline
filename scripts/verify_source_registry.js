#!/usr/bin/env node
/**
 * verify_source_registry.js — URL verification and content quality check
 *
 * For each source in knowledge/{category}/sources_registry.json:
 *   1. HTTP HEAD/GET to check the URL is alive (200)
 *   2. Check the URL path for non-content patterns (/author/, /about/, /tag/, etc.)
 *   3. Mark each source with: verified: true/false, verify_status: 'live'|'dead'|'non-content'
 *   4. Rewrite the registry with verification results
 *
 * Usage: node scripts/verify_source_registry.js <category>
 *        node scripts/verify_source_registry.js              (all categories)
 */

'use strict';

const fs    = require('fs');
const path  = require('path');
const http  = require('http');
const https = require('https');

const ROOT     = path.resolve(__dirname, '..');
const KNOW_DIR = path.join(ROOT, 'knowledge');

// ── Non-content URL patterns ──────────────────────────────────────────────────
// These paths don't contain evaluative content — they're navigation/metadata pages

const NON_CONTENT_PATHS = [
  /\/author\//i,
  /\/authors?\/?$/i,
  /\/about\/?$/i,
  /\/about-us/i,
  /\/contact\/?$/i,
  /\/tag\//i,
  /\/tags?\/?$/i,
  /\/category\//i,
  /\/categories\/?$/i,
  /\/search/i,
  /\/login/i,
  /\/signup/i,
  /\/register/i,
  /\/subscribe/i,
  /\/newsletter/i,
  /\/privacy/i,
  /\/terms/i,
  /\/legal/i,
  /\/sitemap/i,
  /\/feed\/?$/i,
  /\/rss/i,
  /\/page\/\d+$/i,
  /\/comment-page/i,
  /\/comments?\/?$/i,
  /\/share\//i,
  /\/print\//i,
  /\/embed\//i,
  /\/amp\/?$/i,
  /\/cdn-cgi\//i,
  /\/wp-admin/i,
  /\/wp-login/i,
  /\?replytocom=/i,
  /\?share=/i,
  /#respond$/i,
  /#comments$/i,
];

function isNonContentPath(url) {
  return NON_CONTENT_PATHS.some(p => p.test(url));
}

// ── HTTP verification ─────────────────────────────────────────────────────────

function checkUrl(url, timeout = 10000) {
  return new Promise(resolve => {
    const protocol = url.startsWith('https') ? https : http;

    try {
      const req = protocol.request(url, {
        method: 'HEAD',
        timeout,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml',
        },
      }, res => {
        // Follow one redirect
        if ([301, 302, 307, 308].includes(res.statusCode) && res.headers.location) {
          resolve({ status: res.statusCode, redirect: res.headers.location, live: true });
        } else if (res.statusCode >= 200 && res.statusCode < 400) {
          resolve({ status: res.statusCode, live: true });
        } else {
          resolve({ status: res.statusCode, live: false });
        }
        res.resume(); // consume response
      });

      req.on('error', err => resolve({ status: 0, live: false, error: err.code || err.message }));
      req.on('timeout', () => { req.destroy(); resolve({ status: 0, live: false, error: 'TIMEOUT' }); });
      req.end();
    } catch (e) {
      resolve({ status: 0, live: false, error: e.message });
    }
  });
}

// ── Rate-limited batch verification ───────────────────────────────────────────

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function verifyCategory(category) {
  const registryPath = path.join(KNOW_DIR, category, 'sources_registry.json');

  if (!fs.existsSync(registryPath)) {
    console.log(`  No registry for ${category}`);
    return null;
  }

  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
  let live = 0, dead = 0, nonContent = 0, skipped = 0;

  for (let i = 0; i < registry.length; i++) {
    const src = registry[i];
    const url = src.url || '';

    // Skip already-verified URLs (idempotent re-runs)
    if (src.verified === true && src.verify_status === 'live') {
      skipped++;
      continue;
    }

    // Check for non-content path FIRST (no need to fetch)
    if (isNonContentPath(url)) {
      src.verified = false;
      src.verify_status = 'non-content';
      src.verify_reason = 'URL path indicates non-content page (author/about/tag/etc)';
      nonContent++;
      process.stdout.write('P');
      continue;
    }

    // HTTP check
    const result = await checkUrl(url);

    if (result.live) {
      src.verified = true;
      src.verify_status = 'live';
      src.verify_http = result.status;
      live++;
      process.stdout.write('.');
    } else {
      src.verified = false;
      src.verify_status = 'dead';
      src.verify_http = result.status;
      src.verify_reason = result.error || `HTTP ${result.status}`;
      dead++;
      process.stdout.write('X');
    }

    // Rate limit: 200ms between requests
    if (i < registry.length - 1) await sleep(200);
  }

  // Write updated registry
  fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));

  console.log();
  return { category, total: registry.length, live, dead, nonContent, skipped };
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const targetCat = process.argv[2];
  const categories = targetCat
    ? [targetCat]
    : fs.readdirSync(KNOW_DIR).filter(d =>
        fs.statSync(path.join(KNOW_DIR, d)).isDirectory() && d !== 'system'
      ).sort();

  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║  SOURCE REGISTRY — URL VERIFICATION                          ║');
  console.log(`║  Categories: ${String(categories.length).padEnd(47)}║`);
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  const results = [];
  for (const cat of categories) {
    process.stdout.write(`  ${cat}: `);
    const r = await verifyCategory(cat);
    if (r) {
      results.push(r);
      console.log(`  → ${r.live} live, ${r.dead} dead, ${r.nonContent} non-content, ${r.skipped} already verified`);
    }
  }

  console.log('\n' + '─'.repeat(85));
  console.log(`${'Category'.padEnd(22)} ${'Total'.padStart(7)} ${'Live'.padStart(6)} ${'Dead'.padStart(6)} ${'Non-Cnt'.padStart(8)} ${'Skip'.padStart(6)}`);
  console.log('─'.repeat(85));
  let gT=0, gL=0, gD=0, gN=0, gS=0;
  for (const r of results) {
    console.log(`${r.category.padEnd(22)} ${String(r.total).padStart(7)} ${String(r.live).padStart(6)} ${String(r.dead).padStart(6)} ${String(r.nonContent).padStart(8)} ${String(r.skipped).padStart(6)}`);
    gT += r.total; gL += r.live; gD += r.dead; gN += r.nonContent; gS += r.skipped;
  }
  console.log('─'.repeat(85));
  console.log(`${'TOTAL'.padEnd(22)} ${String(gT).padStart(7)} ${String(gL).padStart(6)} ${String(gD).padStart(6)} ${String(gN).padStart(8)} ${String(gS).padStart(6)}`);
  console.log(`\nDead and non-content sources are marked verified:false in the registry.`);
  console.log(`generate_curations.js will filter them out.\n`);
}

main().catch(err => { console.error('FATAL:', err); process.exit(1); });
