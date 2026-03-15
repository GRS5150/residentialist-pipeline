/**
 * Phase 6b: Relevance Classifier
 * Full-page AI classification to filter false-positive sources.
 *
 * PROBLEM: Brave snippet-based classification (~160 chars) cannot distinguish
 * "Sierra Pacific Windows" from "Sierra Pacific GM truck lawsuit" or
 * "sierra.com Prop 65 warning." These false positives poison scores.
 *
 * SOLUTION: Fetch each page's full text, send to Haiku with a focused prompt:
 * "Is this page specifically about [Product] by [Manufacturer]?"
 * Binary YES/NO. Pages that fail get excluded from scoring.
 *
 * COST: ~$0.06/product (150 pages × ~2K tokens × Haiku pricing)
 * LATENCY: ~30-45 seconds (parallel batches of 5)
 *
 * Usage:
 *   const { classifyRelevance } = require('./relevance_classifier');
 *   const filtered = await classifyRelevance(sources, 'Sierra Pacific', 'Sierra Pacific', 'windows');
 *
 * Author: Phase 6b build — March 15, 2026
 */

'use strict';

const https = require('https');
const http  = require('http');
const zlib  = require('zlib');
const { URL } = require('url');

// ─── CONFIGURATION ────────────────────────────────────────────────────────────

// Haiku model for classification (cheapest, fastest)
const CLASSIFIER_MODEL = 'claude-haiku-4-5-20251001';

// Page fetch limits
const MAX_PAGE_BYTES     = 100000;   // 100KB raw HTML max download
const MAX_TEXT_CHARS     = 8000;     // 8K chars of extracted text sent to Haiku
const FETCH_TIMEOUT_MS   = 8000;     // 8s timeout per page fetch
const HAIKU_TIMEOUT_MS   = 15000;    // 15s timeout for Haiku call

// Concurrency
const CONCURRENT_FETCHES = 5;        // Parallel page fetches
const CONCURRENT_HAIKU   = 5;        // Parallel Haiku calls
const FETCH_DELAY_MS     = 200;      // Small delay between fetch batches

// Retry
const MAX_RETRIES        = 1;        // 1 retry on transient failures

// ─── DOMAINS THAT SKIP CLASSIFICATION ─────────────────────────────────────────
// These are always relevant (certification DBs, known trade forums with site: queries)
// or always classified by domain rules already.

const SKIP_CLASSIFICATION_DOMAINS = [
  // Certification databases — always relevant data sources
  'nfrc.org',
  'energystar.gov',
  'aama.net',
  'declare.living-future.org',
  'database.passivehouse.com',
  'recalls.cpsc.gov',
  'cpsc.gov',
  'greenguard.org',
  'ul.com',
  // Manufacturer sites — if they came back in a product search, they're relevant
  'andersenwindows.com',
  'marvin.com',
  'pella.com',
  'milgard.com',
  'simonton.com',
  'jeld-wen.com',
  'lfrp.com',              // Loewen
  'sierrapacificwindows.com',
  'plygem.com',
  'alpenwindows.com',
  'weathershield.com',
  'lincolnwindows.com',
  'harveywindows.com',
  'windowworld.com',
  'provia.com',
  'proviaproducts.com',
  // Direct-fetch known sources (Phase 1)
  'windowpurchase.com',     // Jay Johnson — always relevant
  'thewindowdog.com',       // Always relevant (even though demoted)
];

// ─── HTML TO TEXT EXTRACTION ──────────────────────────────────────────────────

/**
 * Strip HTML tags, scripts, styles, and extract readable text.
 * Cheap and fast — no DOM parsing needed for classification.
 *
 * @param {string} html — raw HTML string
 * @returns {string} — plain text
 */
function htmlToText(html) {
  if (!html || typeof html !== 'string') return '';

  let text = html;

  // Remove script and style blocks entirely
  text = text.replace(/<script[\s\S]*?<\/script>/gi, ' ');
  text = text.replace(/<style[\s\S]*?<\/style>/gi, ' ');
  text = text.replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ');

  // Remove HTML comments
  text = text.replace(/<!--[\s\S]*?-->/g, ' ');

  // Remove all HTML tags
  text = text.replace(/<[^>]+>/g, ' ');

  // Decode common HTML entities
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&#x27;/g, "'");
  text = text.replace(/&#x2F;/g, '/');
  text = text.replace(/&hellip;/g, '...');
  text = text.replace(/&mdash;/g, '—');
  text = text.replace(/&ndash;/g, '–');
  text = text.replace(/&#\d+;/g, ' ');   // remaining numeric entities
  text = text.replace(/&\w+;/g, ' ');    // remaining named entities

  // Collapse whitespace
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}

// ─── PAGE FETCHER ─────────────────────────────────────────────────────────────

/**
 * Fetch a page's content and extract text.
 * Handles redirects (up to 3), gzip/deflate, and timeouts.
 *
 * @param {string} urlStr — the URL to fetch
 * @returns {Promise<{text: string, status: number, error: string|null}>}
 */
function fetchPageText(urlStr, redirectsLeft = 3) {
  return new Promise((resolve) => {
    let resolved = false;
    function safeResolve(val) {
      if (!resolved) { resolved = true; resolve(val); }
    }

    // Hard timeout — kills everything after FETCH_TIMEOUT_MS regardless of state
    const hardTimer = setTimeout(() => {
      safeResolve({ text: '', status: 0, error: 'Hard timeout' });
      try { if (req) req.destroy(); } catch (_) {}
    }, FETCH_TIMEOUT_MS + 2000); // 2s grace on top of socket timeout

    let req;
    try {
      const parsedUrl = new URL(urlStr);
      const isHttps = parsedUrl.protocol === 'https:';
      const lib = isHttps ? https : http;

      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (isHttps ? 443 : 80),
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate',
        },
        timeout: FETCH_TIMEOUT_MS,
      };

      req = lib.request(options, (res) => {
        // Handle redirects
        if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
          res.resume(); // drain response
          clearTimeout(hardTimer);
          if (redirectsLeft <= 0) {
            safeResolve({ text: '', status: res.statusCode, error: 'Too many redirects' });
            return;
          }
          let redirectUrl = res.headers.location;
          if (redirectUrl.startsWith('/')) {
            redirectUrl = `${parsedUrl.protocol}//${parsedUrl.hostname}${redirectUrl}`;
          }
          fetchPageText(redirectUrl, redirectsLeft - 1).then(safeResolve);
          return;
        }

        if (res.statusCode !== 200) {
          res.resume();
          clearTimeout(hardTimer);
          safeResolve({ text: '', status: res.statusCode, error: `HTTP ${res.statusCode}` });
          return;
        }

        // Handle compression
        let stream = res;
        const encoding = (res.headers['content-encoding'] || '').toLowerCase();
        if (encoding === 'gzip') {
          stream = res.pipe(zlib.createGunzip());
        } else if (encoding === 'deflate') {
          stream = res.pipe(zlib.createInflate());
        } else if (encoding === 'br') {
          stream = res.pipe(zlib.createBrotliDecompress());
        }

        let data = '';
        let bytes = 0;

        stream.on('data', (chunk) => {
          bytes += chunk.length;
          if (bytes <= MAX_PAGE_BYTES) {
            data += chunk;
          }
          // Stop reading if we've hit the limit
          if (bytes > MAX_PAGE_BYTES) {
            try { req.destroy(); } catch (_) {}
          }
        });

        stream.on('end', () => {
          clearTimeout(hardTimer);
          const text = htmlToText(data).slice(0, MAX_TEXT_CHARS);
          safeResolve({ text, status: 200, error: null });
        });

        stream.on('error', (err) => {
          clearTimeout(hardTimer);
          // If we destroyed the request due to size limit, still use what we got
          if (data.length > 0) {
            const text = htmlToText(data).slice(0, MAX_TEXT_CHARS);
            safeResolve({ text, status: 200, error: null });
          } else {
            safeResolve({ text: '', status: 0, error: err.message });
          }
        });
      });

      req.on('error', (err) => {
        clearTimeout(hardTimer);
        safeResolve({ text: '', status: 0, error: err.message });
      });

      req.on('timeout', () => {
        clearTimeout(hardTimer);
        try { req.destroy(); } catch (_) {}
        safeResolve({ text: '', status: 0, error: 'Socket timeout' });
      });

      req.end();
    } catch (err) {
      clearTimeout(hardTimer);
      safeResolve({ text: '', status: 0, error: err.message });
    }
  });
}

// ─── HAIKU CLASSIFIER ─────────────────────────────────────────────────────────

/**
 * Call Haiku to classify whether page text is about the target product.
 *
 * @param {Object} client — Anthropic SDK client instance
 * @param {string} pageText — extracted text from the page
 * @param {string} productName — e.g. "Sierra Pacific"
 * @param {string} manufacturer — e.g. "Sierra Pacific"
 * @param {string} category — e.g. "windows"
 * @param {string} url — for context
 * @param {string} title — Brave search result title
 * @returns {Promise<{relevant: boolean, confidence: string, reason: string}>}
 */
async function classifyWithHaiku(client, pageText, productName, manufacturer, category, url, title) {
  if (!pageText || pageText.length < 50) {
    return { relevant: false, confidence: 'low', reason: 'Page text too short or empty' };
  }

  const prompt = `You are a relevance classifier for a product research pipeline. Your ONLY job is to determine if this web page is specifically about the product being researched.

PRODUCT: "${productName}" by ${manufacturer}
CATEGORY: ${category}
PAGE URL: ${url}
SEARCH RESULT TITLE: ${title}

PAGE CONTENT (first ~8000 chars):
---
${pageText}
---

QUESTION: Is this page specifically about "${productName}" ${category} made by ${manufacturer}?

RULES:
- YES if the page discusses, reviews, or contains technical data about this specific product or manufacturer's ${category} products
- YES if it's a forum thread where this product is discussed (even if other products are also mentioned)
- NO if the product name appears only incidentally or in a list with no substantive content about it
- NO if "Sierra Pacific" refers to a region, truck, railroad, or anything other than Sierra Pacific Windows
- NO if the page is about a completely different product category (e.g., trucks, software, clothing) even if the manufacturer name appears
- NO if it's a generic article about ${category} that doesn't specifically discuss this product
- When in doubt, answer NO — it's better to miss a marginal source than include a false positive

Respond with ONLY a JSON object (no markdown, no explanation):
{"relevant": true/false, "confidence": "high"/"medium"/"low", "reason": "one sentence explanation"}`;

  try {
    const response = await client.messages.create({
      model: CLASSIFIER_MODEL,
      max_tokens: 150,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0]?.text?.trim() || '';

    // Parse JSON response
    try {
      // Handle potential markdown wrapping
      const jsonStr = text.replace(/^```json\n?/, '').replace(/\n?```$/, '');
      const parsed = JSON.parse(jsonStr);
      return {
        relevant: parsed.relevant === true,
        confidence: parsed.confidence || 'medium',
        reason: parsed.reason || 'No reason given',
      };
    } catch (parseErr) {
      // Fallback: look for true/false in the response
      const isRelevant = /\btrue\b/i.test(text) && !/\bfalse\b/i.test(text);
      return {
        relevant: isRelevant,
        confidence: 'low',
        reason: `JSON parse failed, inferred from text: ${text.slice(0, 100)}`,
      };
    }
  } catch (err) {
    // On API error, default to INCLUDE (don't throw away data on transient errors)
    return {
      relevant: true,
      confidence: 'low',
      reason: `Haiku API error: ${err.message} — defaulting to relevant`,
    };
  }
}

// ─── BATCH PROCESSING ─────────────────────────────────────────────────────────

/**
 * Process items in parallel batches.
 *
 * @param {Array} items
 * @param {number} batchSize
 * @param {Function} processFn — async function(item) => result
 * @param {number} delayMs — delay between batches
 * @returns {Promise<Array>}
 */
async function processBatches(items, batchSize, processFn, delayMs = 0) {
  const results = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(processFn));
    results.push(...batchResults);
    if (delayMs > 0 && i + batchSize < items.length) {
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
  return results;
}

// ─── DOMAIN EXTRACTION (local copy to avoid circular dependency) ──────────────

function extractDomain(urlStr) {
  try {
    const u = new URL(urlStr);
    return u.hostname.replace(/^www\./, '').toLowerCase();
  } catch (_) {
    return null;
  }
}

// ─── MAIN EXPORT: classifyRelevance ──────────────────────────────────────────

/**
 * Filter an array of source objects through the relevance classifier.
 *
 * For each source:
 * 1. Check if domain is in the skip list (auto-relevant)
 * 2. Fetch the full page text
 * 3. Send to Haiku for classification
 * 4. Return filtered array of relevant sources + a rejection log
 *
 * @param {Array<Object>} sources — array of source objects with url, title/name, description
 * @param {string} productName — e.g. "Sierra Pacific"
 * @param {string} manufacturer — e.g. "Sierra Pacific"
 * @param {string} category — e.g. "windows"
 * @param {Object} [options] — { anthropicApiKey, verbose }
 * @returns {Promise<{
 *   relevant: Array<Object>,
 *   rejected: Array<{source: Object, reason: string}>,
 *   stats: {total: number, relevant: number, rejected: number, skipped: number, fetchFailed: number}
 * }>}
 */
async function classifyRelevance(sources, productName, manufacturer, category, options = {}) {
  const Anthropic = require('@anthropic-ai/sdk');
  const apiKey = options.anthropicApiKey || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.warn('[RELEVANCE] No ANTHROPIC_API_KEY — skipping classification, returning all sources');
    return {
      relevant: sources,
      rejected: [],
      stats: { total: sources.length, relevant: sources.length, rejected: 0, skipped: sources.length, fetchFailed: 0 },
    };
  }

  const client = new Anthropic({ apiKey });
  const verbose = options.verbose !== false; // default true

  const relevant = [];
  const rejected = [];
  const stats = { total: sources.length, relevant: 0, rejected: 0, skipped: 0, fetchFailed: 0 };

  if (verbose) {
    console.log(`\n[RELEVANCE] ── Phase 6b: Relevance Classification ──`);
    console.log(`[RELEVANCE] Product: ${productName} | Manufacturer: ${manufacturer}`);
    console.log(`[RELEVANCE] Sources to classify: ${sources.length}`);
  }

  // Separate sources into skip-list and needs-classification
  const toClassify = [];
  const autoRelevant = [];

  for (const src of sources) {
    const domain = extractDomain(src.url || '');

    // Skip classification for known-good domains
    if (domain && SKIP_CLASSIFICATION_DOMAINS.some(d => domain === d || domain.endsWith('.' + d))) {
      autoRelevant.push(src);
      stats.skipped++;
      continue;
    }

    // Skip Phase 1 direct fetches (they were explicitly requested)
    if (src.phase === 'phase_1_direct_fetches') {
      autoRelevant.push(src);
      stats.skipped++;
      continue;
    }

    // Skip sources with no URL (shouldn't happen, but defensive)
    if (!src.url) {
      autoRelevant.push(src);
      stats.skipped++;
      continue;
    }

    toClassify.push(src);
  }

  if (verbose) {
    console.log(`[RELEVANCE] Auto-relevant (skip list): ${autoRelevant.length}`);
    console.log(`[RELEVANCE] Need classification: ${toClassify.length}`);
  }

  // Step 1: Fetch all pages in parallel batches
  if (verbose) console.log(`[RELEVANCE] Fetching ${toClassify.length} pages...`);

  const fetchResults = await processBatches(
    toClassify,
    CONCURRENT_FETCHES,
    async (src) => {
      const result = await fetchPageText(src.url);
      return { src, ...result };
    },
    FETCH_DELAY_MS
  );

  // Step 2: Classify each fetched page with Haiku
  if (verbose) console.log(`[RELEVANCE] Classifying with Haiku...`);

  const classificationResults = await processBatches(
    fetchResults,
    CONCURRENT_HAIKU,
    async ({ src, text, status, error }) => {
      // If fetch failed, default to INCLUDE (don't lose data on transient errors)
      if (error || !text || text.length < 50) {
        stats.fetchFailed++;
        if (verbose) console.log(`[RELEVANCE]   FETCH_FAIL: ${src.url?.slice(0, 80)} — ${error || 'empty page'} → INCLUDE`);
        return { src, relevant: true, reason: `Fetch failed: ${error || 'empty'} — defaulting to include` };
      }

      const classification = await classifyWithHaiku(
        client,
        text,
        productName,
        manufacturer,
        category,
        src.url,
        src.name || src.title || ''
      );

      if (verbose) {
        const tag = classification.relevant ? 'RELEVANT' : 'REJECTED';
        const conf = classification.confidence;
        console.log(`[RELEVANCE]   ${tag} (${conf}): ${src.url?.slice(0, 80)} — ${classification.reason?.slice(0, 80)}`);
      }

      return { src, ...classification };
    },
    0 // no delay between Haiku batches — API handles rate limiting
  );

  // Step 3: Split into relevant and rejected
  for (const result of classificationResults) {
    if (result.relevant) {
      // Tag the source with classification metadata
      result.src._relevance_check = {
        passed: true,
        confidence: result.confidence,
        reason: result.reason,
      };
      relevant.push(result.src);
      stats.relevant++;
    } else {
      rejected.push({ source: result.src, reason: result.reason, confidence: result.confidence });
      stats.rejected++;
    }
  }

  // Add auto-relevant sources
  for (const src of autoRelevant) {
    src._relevance_check = { passed: true, confidence: 'skip', reason: 'Domain in skip list' };
    relevant.push(src);
    stats.relevant++;
  }

  if (verbose) {
    console.log(`\n[RELEVANCE] ── Results ──`);
    console.log(`[RELEVANCE]   Total:        ${stats.total}`);
    console.log(`[RELEVANCE]   Relevant:     ${stats.relevant} (${stats.skipped} auto + ${stats.relevant - stats.skipped} classified)`);
    console.log(`[RELEVANCE]   Rejected:     ${stats.rejected}`);
    console.log(`[RELEVANCE]   Fetch failed: ${stats.fetchFailed} (included by default)`);

    if (rejected.length > 0) {
      console.log(`[RELEVANCE]   ── Rejected sources ──`);
      for (const r of rejected) {
        console.log(`[RELEVANCE]     ✗ ${r.source.url?.slice(0, 80)}`);
        console.log(`[RELEVANCE]       Reason: ${r.reason}`);
      }
    }
    console.log(`[RELEVANCE] ════════════════════════════════════\n`);
  }

  return { relevant, rejected, stats };
}

// ─── EXPORTS ──────────────────────────────────────────────────────────────────

module.exports = {
  classifyRelevance,
  fetchPageText,
  htmlToText,
  classifyWithHaiku,
  SKIP_CLASSIFICATION_DOMAINS,
};

// ─── CLI TEST ─────────────────────────────────────────────────────────────────

if (require.main === module) {
  const args = process.argv.slice(2);

  if (args[0] === '--test') {
    console.log('\n[SELF-TEST] Running relevance_classifier.js tests...\n');
    let passed = 0;
    let failed = 0;

    function assert(label, condition, detail) {
      if (condition) { console.log(`  ✓ ${label}`); passed++; }
      else { console.error(`  ✗ ${label}${detail ? ': ' + detail : ''}`); failed++; }
    }

    // Test 1: htmlToText
    const html = '<html><head><script>var x=1;</script><style>.a{color:red}</style></head><body><h1>Hello</h1><p>World &amp; stuff</p></body></html>';
    const text = htmlToText(html);
    assert('htmlToText strips tags and scripts', text.includes('Hello') && text.includes('World & stuff') && !text.includes('<'));
    assert('htmlToText removes script content', !text.includes('var x'));

    // Test 2: extractDomain
    assert('extractDomain works', extractDomain('https://www.greenbuildingadvisor.com/test') === 'greenbuildingadvisor.com');
    assert('extractDomain null on bad URL', extractDomain('not-a-url') === null);

    // Test 3: Skip list check
    const skipDomains = ['nfrc.org', 'energystar.gov', 'sierrapacificwindows.com'];
    for (const d of skipDomains) {
      assert(`${d} in skip list`, SKIP_CLASSIFICATION_DOMAINS.includes(d));
    }

    // Test 4: Page fetch (if network available)
    console.log('\n  [Network tests — may skip if offline]');
    fetchPageText('https://httpbin.org/html')
      .then(result => {
        assert('fetchPageText returns text', result.text.length > 0 && result.status === 200);
        console.log(`\n[SELF-TEST] ${passed} passed, ${failed} failed\n`);
        process.exit(failed > 0 ? 1 : 0);
      })
      .catch(() => {
        console.log('  [skipped network test]');
        console.log(`\n[SELF-TEST] ${passed} passed, ${failed} failed\n`);
        process.exit(failed > 0 ? 1 : 0);
      });
    return;
  }

  // Quick single-URL test
  if (args[0] === '--fetch') {
    const url = args[1];
    if (!url) { console.log('Usage: node relevance_classifier.js --fetch <url>'); process.exit(1); }
    fetchPageText(url).then(r => {
      console.log(`Status: ${r.status}, Error: ${r.error}`);
      console.log(`Text length: ${r.text.length}`);
      console.log(r.text.slice(0, 500));
    });
    return;
  }

  console.log('Usage:');
  console.log('  node relevance_classifier.js --test        Run self-tests');
  console.log('  node relevance_classifier.js --fetch <url> Test page fetch');
}
