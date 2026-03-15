/**
 * Phase 6a: Source Parser
 * Systematic source discovery for The Residentialist pipeline.
 *
 * Replaces ad-hoc Bot 1 web searches with checklist-driven per-source queries.
 * Each known source type is queried individually using the Brave Search API,
 * then results are classified into Pool A / B / C based on domain rules.
 *
 * CURRENT: Uses Brave search snippets (~160 chars) for source classification.
 * FUTURE (Phase 6b): Full page fetching + AI classification for deeper accuracy.
 * See ROADMAP.md for Phase 6b trigger conditions and scope estimate.
 *
 * Usage (module):
 *   const { parseSourcesForProduct } = require('./source_parser');
 *   const result = await parseSourcesForProduct('Loewen', 'DH', 'windows');
 *
 * Usage (CLI):
 *   node source_parser.js "Loewen" DH windows
 *   node source_parser.js "Andersen E-Series" DH windows [existing_evidence.json]
 */

'use strict';

const https    = require('https');
const zlib     = require('zlib');
const fs       = require('fs');
const path     = require('path');
const querystring = require('querystring');
const { URL }  = require('url');

// ─── CONFIGURATION ────────────────────────────────────────────────────────────

const BRAVE_API_URL  = 'https://api.search.brave.com/res/v1/web/search';
const BRAVE_API_KEY  = process.env.BRAVE_SEARCH_API_KEY;
const CHECKLIST_DIR  = path.join(__dirname, 'source_checklists');

// Delays (ms)
const BRAVE_DELAY_MS  = 1100; // 1.1s between Brave calls (max 1 req/sec)
const FETCH_DELAY_MS  = 500;  // 0.5s between URL fetches
const RATE_LIMIT_WAIT = 5000; // 5s wait on 429

// ─── POOL CLASSIFICATION TABLES ───────────────────────────────────────────────

/**
 * Pool A — Professional building science communities.
 * Ceiling: 7.5
 */
const POOL_A_DOMAINS = [
  'greenbuildingadvisor.com',
  'finehomebuilding.com',
  'jlconline.com',
  'buildingscience.com',
];

/**
 * Pool B — Verified trade professionals (YouTube installer channels,
 * Reddit power users [qualification handled by reddit_power_users.js],
 * Passive House community sources).
 * Ceiling: 6.5
 */
const POOL_B_DOMAINS = [
  'youtube.com',
  'youtu.be',
  'passivehouse.com',
  'phius.org',
  'windowpurchase.com', // Jay Johnson — independent trade reviewer
];

/**
 * Known YouTube installer channels that qualify for Pool B.
 * Matched against the video title or channel name (case-insensitive).
 * All other YouTube results default to Pool C.
 */
const POOL_B_CHANNELS = [
  'matt risinger',
  'brennan enterprises',
  'smith house',
  'windows on washington',
  'home renovision',
  'fine homebuilding', // FHB video content
];

/**
 * Pool C — Consumer sources (always discounted, some permanently demoted).
 * Ceiling: 5.5
 */
const POOL_C_DOMAINS = [
  'houzz.com',
  'trustpilot.com',
  'thewindowdog.com',         // Permanently demoted per Residentialist rules
  'todayshomeowner.com',
  'thisoldhouse.com',
  'replacementwindowreviews.co',
  'replacementwindowdiscussions.com',
  'consumeraffairs.com',
  'yelp.com',
  'bbb.org',
  'home.google.com',
  'homedepot.com',
  'lowes.com',
];

/**
 * Certification / data-only domains — not scored as Pool A/B/C.
 * Treated as authoritative data sources for certifications and performance data.
 */
const CERTIFICATION_DOMAINS = [
  'nfrc.org',
  'energystar.gov',
  'aama.net',
  'declare.living-future.org',
  'database.passivehouse.com',
  'recalls.cpsc.gov',
  'cpsc.gov',
  'greenguard.org',
  'ul.com',
];

// ─── MANUFACTURER EXTRACTION ──────────────────────────────────────────────────

/**
 * Map of product names to their manufacturer names.
 * Keys are lowercase trimmed product names (or prefixes).
 * extractManufacturer() uses this table first, then falls back to first word.
 */
const MANUFACTURER_MAP = {
  // Andersen
  'andersen e-series':         'Andersen',
  'andersen a-series':         'Andersen',
  'andersen 100 series':       'Andersen',
  'andersen 200 series':       'Andersen',
  'andersen 400 series':       'Andersen',
  'renewal by andersen':       'Andersen',
  // Marvin
  'marvin signature ultimate': 'Marvin',
  'marvin signature modern':   'Marvin',
  'marvin signature':          'Marvin',
  'marvin integrity':          'Marvin',
  'marvin clad':               'Marvin',
  'marvin essential':          'Marvin',
  // Pella
  'pella 250 series':          'Pella',
  'pella 350 series':          'Pella',
  'pella architect series':    'Pella',
  'pella impervia':            'Pella',
  'pella reserve':             'Pella',
  // Loewen
  'loewen':                    'Loewen',
  // Ply Gem
  'ply gem pro series':        'Ply Gem',
  'ply gem':                   'Ply Gem',
  // Reliabilt
  'reliabilt 3500':            'Reliabilt',
  'reliabilt':                 'Reliabilt',
  // Milgard
  'milgard tuscany':           'Milgard',
  'milgard trinsic':           'Milgard',
  'milgard ultra':             'Milgard',
  'milgard style line':        'Milgard',
  'milgard':                   'Milgard',
  // Simonton
  'simonton reflections 5500': 'Simonton',
  'simonton reflections':      'Simonton',
  'simonton prism':            'Simonton',
  'simonton':                  'Simonton',
  // Jeld-Wen
  'jeld-wen v-2500':           'Jeld-Wen',
  'jeld-wen v-4500':           'Jeld-Wen',
  'jeld-wen w-2500':           'Jeld-Wen',
  'jeld-wen':                  'Jeld-Wen',
  // Sierra Pacific
  'sierra pacific':            'Sierra Pacific',
  // Window World
  'window world 4000':         'Window World',
  'window world':              'Window World',
  // Alpen
  'alpen zenith zr-7':         'Alpen',
  'alpen zenith':              'Alpen',
  'alpen':                     'Alpen',
  // Harvey
  'harvey tribute':            'Harvey',
  'harvey classic':            'Harvey',
  'harvey':                    'Harvey',
  // Lincoln
  'lincoln windows':           'Lincoln',
  'lincoln':                   'Lincoln',
  // Weather Shield
  'weather shield':            'Weather Shield',
};

/**
 * Extract the manufacturer name from a product name string.
 * Checks the MANUFACTURER_MAP first (longest match wins),
 * then falls back to the first word of the product name.
 *
 * @param {string} productName — e.g. "Andersen E-Series", "Loewen"
 * @returns {string} — e.g. "Andersen", "Loewen"
 */
function extractManufacturer(productName) {
  if (!productName || typeof productName !== 'string') return '';

  const lower = productName.trim().toLowerCase();

  // Find the longest key that matches the start of (or equals) the product name
  let bestMatch = '';
  let bestKey   = '';
  for (const [key, mfg] of Object.entries(MANUFACTURER_MAP)) {
    if (lower === key || lower.startsWith(key + ' ') || lower.startsWith(key + '-')) {
      if (key.length > bestKey.length) {
        bestKey   = key;
        bestMatch = mfg;
      }
    }
  }
  if (bestMatch) return bestMatch;

  // Fallback: first "word" (split on space or hyphen), Title-cased
  const first = productName.trim().split(/[\s-]/)[0];
  return first.charAt(0).toUpperCase() + first.slice(1);
}

// ─── DOMAIN EXTRACTION ────────────────────────────────────────────────────────

/**
 * Extract the registered domain from a URL string.
 * Returns null if the URL is unparseable.
 *
 * @param {string} urlStr
 * @returns {string|null} — e.g. "greenbuildingadvisor.com"
 */
function extractDomain(urlStr) {
  try {
    const u = new URL(urlStr);
    // Strip leading 'www.' for matching
    return u.hostname.replace(/^www\./, '').toLowerCase();
  } catch (_) {
    return null;
  }
}

// ─── SOURCE CLASSIFICATION ────────────────────────────────────────────────────

/**
 * Classify a search result into Pool A / B / C / certification / unknown.
 * Also applies basic sentiment and price-bias detection via keyword matching.
 *
 * @param {string} url
 * @param {string} title
 * @param {string} description
 * @returns {{ pool: 'A'|'B'|'C'|'certification'|'unknown', source_type: string,
 *             sentiment: 'positive'|'negative'|'mixed',
 *             price_bias: boolean,
 *             is_reddit: boolean,
 *             youtube_channel: string|null }}
 */
function classifySource(url, title, description) {
  const domain   = extractDomain(url) || '';
  const titleL   = (title       || '').toLowerCase();
  const descL    = (description || '').toLowerCase();
  const combined = titleL + ' ' + descL;

  // ── Pool determination ─────────────────────────────────────────────────────

  let pool        = 'unknown';
  let source_type = 'web';
  let youtube_channel = null;

  if (CERTIFICATION_DOMAINS.some(d => domain === d || domain.endsWith('.' + d))) {
    pool        = 'certification';
    source_type = 'certification_db';
  } else if (POOL_A_DOMAINS.some(d => domain === d || domain.endsWith('.' + d))) {
    pool        = 'A';
    source_type = 'professional_forum';
  } else if (domain === 'reddit.com' || domain.endsWith('.reddit.com')) {
    // Reddit classification deferred — reddit_power_users.js handles qualification.
    // Raw result is Pool C by default; upgrading to Pool B happens post-power-user check.
    pool        = 'C';
    source_type = 'reddit';
  } else if (domain === 'youtube.com' || domain === 'youtu.be') {
    // Check known installer channels
    const matchedChannel = POOL_B_CHANNELS.find(ch => combined.includes(ch));
    if (matchedChannel) {
      pool           = 'B';
      source_type    = 'youtube_installer';
      youtube_channel = matchedChannel;
    } else {
      pool        = 'C';
      source_type = 'youtube_consumer';
    }
  } else if (POOL_B_DOMAINS.some(d => domain === d || domain.endsWith('.' + d))) {
    pool        = 'B';
    source_type = 'professional_reviewer';
  } else if (POOL_C_DOMAINS.some(d => domain === d || domain.endsWith('.' + d))) {
    pool        = 'C';
    source_type = 'consumer';
  } else {
    // Default unknown — will be included with pool='unknown' for editorial review
    pool        = 'unknown';
    source_type = 'web';
  }

  // ── Sentiment (keyword-based) ──────────────────────────────────────────────

  const positiveKeywords = [
    'recommend', 'excellent', 'great', 'best', 'love', 'impressive',
    'high performance', 'quality', 'durable', 'reliable', 'premium',
    'well made', 'well-made', 'never had a call back', 'highly recommend',
    'good product', 'pleased', 'happy', 'satisfied', 'worth it',
    'outperform', 'superior', 'solid', 'endorse', 'preferred',
  ];
  const negativeKeywords = [
    'problem', 'issue', 'complaint', 'defect', 'failure', 'failed',
    'recall', 'lawsuit', 'avoid', 'worst', 'terrible', 'poor quality',
    'cheap', 'broke', 'broken', 'leaking', 'leak', 'condensation',
    'mold', 'rot', 'warped', 'cracked', 'gaps', 'draft', 'drafty',
    'dissatisfied', 'disappointed', 'regret', 'warning', 'beware',
    'class action', 'defective',
  ];
  const mixedKeywords = [
    'mixed', 'some issues', 'mostly good', 'decent', 'okay', 'ok',
    'average', 'pros and cons', 'on the other hand', 'however',
    'but', 'although', 'concerns', 'could be better',
  ];

  const posScore = positiveKeywords.filter(kw => combined.includes(kw)).length;
  const negScore = negativeKeywords.filter(kw => combined.includes(kw)).length;

  let sentiment;
  if (posScore > 0 && negScore === 0) {
    sentiment = 'positive';
  } else if (negScore > 0 && posScore === 0) {
    sentiment = 'negative';
  } else if (negScore > 0 && posScore > 0) {
    sentiment = 'mixed';
  } else if (mixedKeywords.some(kw => combined.includes(kw))) {
    sentiment = 'mixed';
  } else {
    // No signal — default to mixed (neutral)
    sentiment = 'mixed';
  }

  // ── Price-bias detection ───────────────────────────────────────────────────
  // Flag sources that score premium products against mass-market price expectations.

  const priceBiasKeywords = [
    'overpriced', 'not worth', 'too expensive', 'way too much',
    'cheaper alternative', 'better value', 'price point',
    'bang for your buck', 'bang for the buck',
    'for the price', 'at this price', 'at that price',
  ];
  // Also flag known price-biased domains permanently
  const priceBiasDomains = [
    'todayshomeowner.com',
    'thewindowdog.com',
    'replacementwindowreviews.co',
  ];

  const price_bias =
    priceBiasKeywords.some(kw => combined.includes(kw)) ||
    priceBiasDomains.some(d => domain === d || domain.endsWith('.' + d));

  const is_reddit = source_type === 'reddit';

  return { pool, source_type, sentiment, price_bias, is_reddit, youtube_channel };
}

// ─── COMPLAINT / CERTIFICATION / PERFORMANCE EXTRACTION ──────────────────────

/**
 * Scan title + description for complaint signals.
 * Returns null if no complaint found, or a complaint object.
 *
 * @param {string} title
 * @param {string} description
 * @param {string} url
 * @returns {{ description: string, classification: string,
 *             evidence_level: 'RED'|'YELLOW', source: string }|null}
 */
function extractComplaint(title, description, url) {
  const combined = ((title || '') + ' ' + (description || '')).toLowerCase();

  const redKeywords   = ['recall', 'class action', 'lawsuit', 'cpsc', 'safety hazard', 'injury', 'fire'];
  const yellowKeywords = [
    'complaint', 'issue', 'defect', 'failure', 'failed', 'problem',
    'leak', 'condensation', 'mold', 'rot', 'warped', 'cracked',
    'broke', 'broken', 'gaps', 'draft', 'seal failure',
  ];

  const isRed    = redKeywords.some(kw => combined.includes(kw));
  const isYellow = yellowKeywords.some(kw => combined.includes(kw));

  if (!isRed && !isYellow) return null;

  return {
    description: (title || description || '').slice(0, 200),
    classification: isRed ? 'SAFETY' : 'STRUCTURAL_DEFECT',
    evidence_level: isRed ? 'RED' : 'YELLOW',
    source: url || 'web search result',
  };
}

/**
 * Scan title + description for certification signals.
 * Returns array of discovered certification strings.
 *
 * @param {string} title
 * @param {string} description
 * @returns {string[]}
 */
function extractCertifications(title, description) {
  const combined = ((title || '') + ' ' + (description || '')).toLowerCase();
  const found    = [];

  const certPatterns = [
    { keyword: 'nfrc',           cert: 'NFRC' },
    { keyword: 'energy star',    cert: 'ENERGY_STAR' },
    { keyword: 'energystar',     cert: 'ENERGY_STAR' },
    { keyword: 'aama',           cert: 'AAMA' },
    { keyword: 'csa a440',       cert: 'CSA_A440' },
    { keyword: 'nafs',           cert: 'NAFS' },
    { keyword: 'passive house',  cert: 'PASSIVE_HOUSE' },
    { keyword: 'phi certified',  cert: 'PHI' },
    { keyword: 'greenguard',     cert: 'GREENGUARD' },
    { keyword: 'wers',           cert: 'WERS' },
    { keyword: 'declare label',  cert: 'DECLARE' },
    { keyword: 'prop 65',        cert: 'PROP_65_WARNING' },
    { keyword: 'proposition 65', cert: 'PROP_65_WARNING' },
  ];

  for (const { keyword, cert } of certPatterns) {
    if (combined.includes(keyword) && !found.includes(cert)) {
      found.push(cert);
    }
  }
  return found;
}

/**
 * Scan title + description for performance data signals.
 * Extracts U-factor, SHGC, and air infiltration mentions.
 *
 * @param {string} title
 * @param {string} description
 * @returns {{ u_factor: string|null, shgc: string|null, air_infiltration: string|null }}
 */
function extractPerformanceData(title, description) {
  const combined = (title || '') + ' ' + (description || '');

  const data = {
    u_factor:        null,
    shgc:            null,
    air_infiltration: null,
  };

  // U-factor: "U-factor 0.22", "U=0.17", "U value: 0.25", "U-0.19"
  const uMatch = combined.match(/U[-\s](?:factor|value|=)?[\s:]*([0-9]+\.[0-9]+)/i) ||
                 combined.match(/U[-=]([0-9]+\.[0-9]+)/i);
  if (uMatch) data.u_factor = uMatch[1];

  // SHGC: "SHGC 0.25", "SHGC: 0.30"
  const shgcMatch = combined.match(/SHGC[\s:=]*([0-9]+\.[0-9]+)/i);
  if (shgcMatch) data.shgc = shgcMatch[1];

  // Air infiltration: "0.01 cfm/ft²", "cfm 0.02", "air infiltration 0.03"
  const airMatch = combined.match(/([0-9]+\.[0-9]+)\s*cfm/i) ||
                   combined.match(/air\s+infiltration[\s:=]*([0-9]+\.[0-9]+)/i);
  if (airMatch) data.air_infiltration = airMatch[1];

  return data;
}

/**
 * Scan title + description for component quality signals.
 * Returns a plain-text note about what was found.
 *
 * @param {string} title
 * @param {string} description
 * @returns {string|null}
 */
function extractComponentData(title, description) {
  const combined = ((title || '') + ' ' + (description || '')).toLowerCase();
  const signals  = [];

  const componentPatterns = [
    { keyword: 'stainless steel spacer',   label: 'stainless steel spacer' },
    { keyword: 'warm-edge spacer',         label: 'warm-edge spacer' },
    { keyword: 'super spacer',             label: 'Super Spacer (Edgetech)' },
    { keyword: 'intercept spacer',         label: 'Intercept spacer (PPG)' },
    { keyword: 'swiggle spacer',           label: 'Swiggle Seal spacer' },
    { keyword: 'dual seal',                label: 'dual-seal IGU' },
    { keyword: 'triple pane',              label: 'triple-pane available' },
    { keyword: 'triple-pane',              label: 'triple-pane available' },
    { keyword: 'cardinal glass',           label: 'Cardinal Glass IGU' },
    { keyword: 'guardian glass',           label: 'Guardian Glass IGU' },
    { keyword: 'pilkington',               label: 'Pilkington glass' },
    { keyword: 'solarban',                 label: 'SolarBan glass coating' },
    { keyword: 'low-e',                    label: 'Low-E coating' },
    { keyword: 'lowe',                     label: 'Low-E coating' }, // alternate spelling in descriptions
    { keyword: 'weatherstrip',             label: 'weatherstripping noted' },
    { keyword: 'fibrex',                   label: 'Fibrex composite material' },
    { keyword: 'pultruded fiberglass',     label: 'pultruded fiberglass frame' },
    { keyword: 'vinyl clad',               label: 'vinyl-clad' },
    { keyword: 'aluminum clad',            label: 'aluminum-clad' },
    { keyword: 'mortise and tenon',        label: 'mortise-and-tenon joinery' },
    { keyword: 'aama 2605',               label: 'AAMA 2605 Kynar coating' },
    { keyword: 'pvdf',                     label: 'PVDF paint system' },
    { keyword: 'kynar',                    label: 'Kynar 500 PVDF coating' },
    { keyword: 'douglas fir',              label: 'Coastal Douglas Fir core' },
  ];

  for (const { keyword, label } of componentPatterns) {
    if (combined.includes(keyword) && !signals.includes(label)) {
      signals.push(label);
    }
  }

  return signals.length > 0 ? signals.join(', ') : null;
}

/**
 * Scan title + description for repairability / warranty signals.
 *
 * @param {string} title
 * @param {string} description
 * @returns {{ warranty_years: string|null, transferable: boolean|null,
 *             igu_method: string|null, note: string|null }}
 */
function extractRepairabilityData(title, description) {
  const combined = ((title || '') + ' ' + (description || '')).toLowerCase();
  const result   = {
    warranty_years: null,
    transferable:   null,
    igu_method:     null,
    note:           null,
  };

  // Warranty years: "20-year", "lifetime warranty", "limited lifetime"
  const wMatch = combined.match(/(\d+)[-\s]year\s+warranty/i);
  if (wMatch) result.warranty_years = wMatch[1];
  if (combined.includes('lifetime warranty') || combined.includes('limited lifetime')) {
    result.warranty_years = 'lifetime';
  }

  // Transferable
  if (combined.includes('transferable')) result.transferable = true;
  if (combined.includes('non-transferable') || combined.includes('not transferable')) {
    result.transferable = false;
  }

  // IGU replacement method
  if (combined.includes('glass swap') || combined.includes('glass replacement')) {
    result.igu_method = 'glass_swap';
  }
  if (combined.includes('sash replacement') || combined.includes('replace sash')) {
    result.igu_method = 'sash_replacement';
  }
  if (combined.includes('full unit') || combined.includes('whole window')) {
    result.igu_method = 'full_unit';
  }

  const notes = [];
  if (result.warranty_years) notes.push(`${result.warranty_years}-year warranty`);
  if (result.transferable === true) notes.push('transferable');
  if (result.igu_method) notes.push(`IGU: ${result.igu_method}`);
  if (notes.length > 0) result.note = notes.join(', ');

  return result;
}

// ─── HTTP HELPERS ─────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Make a GET request using the native Node.js https module.
 * Returns the parsed JSON body or null on error.
 *
 * @param {string} hostname
 * @param {string} urlPath
 * @param {Object} headers
 * @returns {Promise<Object|null>}
 */
function httpsGet(hostname, urlPath, headers = {}) {
  return new Promise((resolve) => {
    const options = { hostname, path: urlPath, headers };

    const makeRequest = (retriesLeft) => {
      const req = https.get(options, (res) => {
        if (res.statusCode === 429) {
          console.log(`[BRAVE] Rate limited (429), waiting ${RATE_LIMIT_WAIT / 1000}s...`);
          res.resume();
          if (retriesLeft > 0) {
            setTimeout(() => makeRequest(retriesLeft - 1), RATE_LIMIT_WAIT);
          } else {
            resolve(null);
          }
          return;
        }

        if (res.statusCode !== 200) {
          console.log(`[BRAVE] HTTP ${res.statusCode} for ${urlPath.slice(0, 80)}`);
          res.resume();
          resolve(null);
          return;
        }

        // Handle gzip/deflate decompression
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
        stream.on('data', chunk => { data += chunk; });
        stream.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            console.log(`[BRAVE] JSON parse error`);
            resolve(null);
          }
        });
      });

      req.on('error', (err) => {
        console.log(`[BRAVE] Request error: ${err.message}`);
        if (retriesLeft > 0) {
          setTimeout(() => makeRequest(retriesLeft - 1), 2000);
        } else {
          resolve(null);
        }
      });

      req.setTimeout(15000, () => {
        req.destroy(new Error('Request timeout'));
      });
    };

    makeRequest(1); // 1 retry on 429
  });
}

// ─── BRAVE SEARCH ─────────────────────────────────────────────────────────────

/**
 * Execute a single Brave Web Search query.
 * Returns an array of result objects: { title, url, description, domain, age }.
 *
 * @param {string} query
 * @param {number} [count=10] — max 20 per Brave API docs
 * @returns {Promise<Array<{ title: string, url: string, description: string,
 *                           domain: string, age: string|null }>>}
 */
async function braveSearch(query, count = 10) {
  if (!BRAVE_API_KEY) {
    console.warn('[BRAVE] BRAVE_SEARCH_API_KEY not set — skipping search');
    return [];
  }

  const qs = querystring.stringify({
    q:           query,
    count:       Math.min(count, 20),
    country:     'us',
    search_lang: 'en',
  });

  const urlPath = `/res/v1/web/search?${qs}`;
  const headers = {
    'X-Subscription-Token': BRAVE_API_KEY,
    'Accept':               'application/json',
    'Accept-Encoding':      'gzip, deflate',
  };

  console.log(`[BRAVE] Querying: ${query.slice(0, 80)}...`);
  const data = await httpsGet('api.search.brave.com', urlPath, headers);
  if (!data) return [];

  const raw = data?.web?.results || [];
  return raw.map(r => ({
    title:       r.title       || '',
    url:         r.url         || '',
    description: r.description || '',
    domain:      extractDomain(r.url || '') || '',
    age:         r.age || null,
  }));
}

// ─── PLACEHOLDER SUBSTITUTION ─────────────────────────────────────────────────

/**
 * Substitute {product}, {manufacturer}, {config} placeholders in query strings.
 *
 * @param {string} query
 * @param {string} product
 * @param {string} manufacturer
 * @param {string} config
 * @returns {string}
 */
function substitutePlaceholders(query, product, manufacturer, config) {
  return query
    .replace(/\{product\}/g,      product)
    .replace(/\{manufacturer\}/g, manufacturer)
    .replace(/\{config\}/g,       config || '');
}

// ─── PHASE RUNNERS ────────────────────────────────────────────────────────────

/**
 * Run all queries for a given phase, applying placeholder substitution.
 * Returns a flat array of raw Brave search results (deduplicated by URL).
 *
 * @param {string}   phaseName
 * @param {string[]} queries
 * @param {string}   productName
 * @param {string}   manufacturer
 * @param {string}   config
 * @param {Set}      seenUrls — shared dedup set across phases
 * @returns {Promise<Array<{ title, url, description, domain, age, query }>>}
 */
async function runPhase(phaseName, queries, productName, manufacturer, config, seenUrls) {
  const results = [];

  console.log(`\n[SOURCE PARSER] ── Phase: ${phaseName} (${queries.length} queries) ──`);

  for (const rawQuery of queries) {
    const query = substitutePlaceholders(rawQuery, productName, manufacturer, config);

    let hits;
    try {
      hits = await braveSearch(query, 10);
    } catch (err) {
      console.log(`[SOURCE PARSER] Error in ${phaseName} query "${query.slice(0, 60)}": ${err.message}`);
      hits = [];
    }

    // Dedup and annotate
    for (const hit of hits) {
      if (!hit.url || seenUrls.has(hit.url)) continue;
      seenUrls.add(hit.url);
      results.push({ ...hit, query, phase: phaseName });
    }

    // Rate limit: wait between Brave API calls
    await sleep(BRAVE_DELAY_MS);
  }

  console.log(`[SOURCE PARSER] Phase ${phaseName}: ${results.length} unique results`);
  return results;
}

// ─── CHECKLIST LOADER ─────────────────────────────────────────────────────────

/**
 * Load the source checklist for a given category from the source_checklists/ dir.
 *
 * @param {string} category — e.g. "windows"
 * @returns {Object} — parsed checklist JSON
 */
function loadChecklist(category) {
  const filePath = path.join(CHECKLIST_DIR, `${category}.json`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Checklist not found for category "${category}": ${filePath}`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

// ─── EVIDENCE FILE MERGE ──────────────────────────────────────────────────────

/**
 * Load an existing evidence file if the path is provided and the file exists.
 * Returns null if not found.
 *
 * @param {string|null} filePath
 * @returns {Object|null}
 */
function loadExistingEvidence(filePath) {
  if (!filePath) return null;
  const resolved = path.resolve(filePath);
  if (!fs.existsSync(resolved)) {
    console.log(`[SOURCE PARSER] No existing evidence at ${resolved} — starting fresh`);
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(resolved, 'utf8'));
  } catch (e) {
    console.log(`[SOURCE PARSER] Could not parse existing evidence: ${e.message}`);
    return null;
  }
}

/**
 * Merge parser results into an existing evidence file, preserving manually
 * pinned values. New discoveries are appended or logged as candidate additions.
 *
 * Rules:
 * - Existing sources[] are preserved as-is (never overwritten)
 * - New sources that are NOT already present (by URL or name) are appended
 * - Existing complaints[] preserved; new ones appended
 * - Existing certifications[] merged (union)
 * - Performance data: only filled in if the existing value is null
 * - Component/repairability notes: appended if new content found
 *
 * @param {Object} parserResult — output of parseSourcesForProduct()
 * @param {Object|null} existingEvidence — parsed existing evidence JSON
 * @returns {Object} — merged evidence file object
 */
function buildEvidenceFile(parserResult, existingEvidence) {
  const now = new Date().toISOString().slice(0, 10);

  // Start from existing or create fresh skeleton
  const base = existingEvidence ? JSON.parse(JSON.stringify(existingEvidence)) : {
    product:          parserResult.meta.productName,
    config:           parserResult.meta.config,
    category:         parserResult.meta.category,
    evidence_version: '2.0',
    created:          now,
    last_verified:    now,
    refresh_after_days: 90,
    manufacturing_quality: {
      business_model: null,
      certifications: [],
      complaints:     [],
    },
    professional_consensus: { sources: [] },
    component_quality:  { quality_tier: null, _note: null },
    repairability:      { igu_replacement_method: null, _note: null },
    performance: {
      thermal:    { u_factor: null, u_factor_source: null, evidence_level: null, score: null, note: null },
      structural: { aama_class: null, design_pressure: null, evidence_level: null, score: null, note: null },
      air_water:  { air_infiltration: null, evidence_level: null, score: null, note: null },
    },
  };

  base.last_verified = now;

  // ── Sources ────────────────────────────────────────────────────────────────

  const existingSourceNames = new Set(
    (base.professional_consensus?.sources || []).map(s => s.name?.toLowerCase() || '')
  );
  const existingSourceUrls = new Set(
    (base.professional_consensus?.sources || []).map(s => (s.url || '').toLowerCase())
  );

  let nextSourceId = (base.professional_consensus?.sources?.length || 0) + 1;
  const productCode = parserResult.meta.productName
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 6)
    .toUpperCase();

  for (const src of parserResult.sources) {
    const nameL = (src.name || '').toLowerCase();
    const urlL  = (src.url || '').toLowerCase();

    if (existingSourceNames.has(nameL) || (urlL && existingSourceUrls.has(urlL))) {
      continue; // Already present — preserve existing pin
    }

    const id = `PC-${productCode}-${String(nextSourceId).padStart(3, '0')}`;
    base.professional_consensus.sources.push({
      id,
      name:       src.name,
      pool:       src.pool,
      sentiment:  src.sentiment,
      summary:    src.summary || src.description?.slice(0, 200) || '',
      price_bias: src.price_bias,
      url:        src.url,
      _added_by:  'source_parser',
      _phase:     src.phase,
    });
    existingSourceNames.add(nameL);
    existingSourceUrls.add(urlL);
    nextSourceId++;
  }

  // ── Complaints ─────────────────────────────────────────────────────────────

  const existingComplaintDescs = new Set(
    (base.manufacturing_quality?.complaints || []).map(c => c.description?.toLowerCase() || '')
  );
  let nextComplaintId = (base.manufacturing_quality?.complaints?.length || 0) + 1;

  for (const complaint of parserResult.complaints) {
    const descL = complaint.description.toLowerCase();
    if (existingComplaintDescs.has(descL)) continue;
    const id = `MQ-${productCode}-${String(nextComplaintId).padStart(3, '0')}`;
    base.manufacturing_quality.complaints.push({ id, ...complaint, _added_by: 'source_parser' });
    existingComplaintDescs.add(descL);
    nextComplaintId++;
  }

  // ── Certifications ─────────────────────────────────────────────────────────

  const existingCerts = new Set(base.manufacturing_quality?.certifications || []);
  for (const cert of parserResult.certifications) {
    existingCerts.add(cert);
  }
  base.manufacturing_quality.certifications = [...existingCerts];

  // ── Performance data: fill nulls only ─────────────────────────────────────

  if (parserResult.performance?.thermal?.u_factor && !base.performance?.thermal?.u_factor) {
    base.performance.thermal.u_factor        = parserResult.performance.thermal.u_factor;
    base.performance.thermal.u_factor_source = parserResult.performance.thermal.u_factor_source;
  }
  if (parserResult.performance?.thermal?.shgc && !base.performance?.thermal?.shgc) {
    base.performance.thermal.shgc = parserResult.performance.thermal.shgc;
  }
  if (parserResult.performance?.air_water?.air_infiltration && !base.performance?.air_water?.air_infiltration) {
    base.performance.air_water.air_infiltration = parserResult.performance.air_water.air_infiltration;
  }

  // ── Component quality notes: append ───────────────────────────────────────

  if (parserResult.components?.note) {
    const existing = base.component_quality?._note || '';
    if (!existing.includes(parserResult.components.note)) {
      base.component_quality._note = existing
        ? `${existing} | Source parser added: ${parserResult.components.note}`
        : parserResult.components.note;
    }
  }

  // ── Repairability: fill nulls only ────────────────────────────────────────

  if (parserResult.repairability?.igu_method && !base.repairability?.igu_replacement_method) {
    base.repairability.igu_replacement_method = parserResult.repairability.igu_method;
  }
  if (parserResult.repairability?.note && !base.repairability?._note) {
    base.repairability._note = parserResult.repairability.note;
  }

  // ── Add parser metadata ───────────────────────────────────────────────────

  base._source_parser_meta = parserResult.meta;

  return base;
}

// ─── MAIN ENTRY POINT ─────────────────────────────────────────────────────────

/**
 * Parse all sources for a given product using the checklist-driven approach.
 *
 * Runs 5–6 phases of Brave searches based on the category checklist,
 * classifies each result, deduplicates, and returns a structured object.
 *
 * @param {string} productName        — e.g. "Loewen", "Andersen E-Series"
 * @param {string} config             — e.g. "DH" (double-hung)
 * @param {string} [category]         — e.g. "windows" (default: "windows")
 * @param {string} [existingEvidencePath] — Optional path to existing evidence JSON
 * @returns {Promise<{
 *   sources:        Array<Object>,
 *   complaints:     Array<Object>,
 *   certifications: string[],
 *   performance:    Object,
 *   components:     Object,
 *   repairability:  Object,
 *   meta:           Object,
 * }>}
 */
async function parseSourcesForProduct(productName, config, category, existingEvidencePath) {
  category = category || 'windows';
  config   = (config || '').toUpperCase();

  console.log(`\n[SOURCE PARSER] ════════════════════════════════════`);
  console.log(`[SOURCE PARSER] Product:      ${productName}`);
  console.log(`[SOURCE PARSER] Config:       ${config}`);
  console.log(`[SOURCE PARSER] Category:     ${category}`);
  console.log(`[SOURCE PARSER] ════════════════════════════════════`);

  const manufacturer = extractManufacturer(productName);
  console.log(`[SOURCE PARSER] Manufacturer: ${manufacturer}`);

  // Load checklist
  let checklist;
  try {
    checklist = loadChecklist(category);
  } catch (err) {
    console.error(`[SOURCE PARSER] FATAL: ${err.message}`);
    throw err;
  }

  // Load existing evidence (for merge later)
  const existingEvidence = loadExistingEvidence(existingEvidencePath || null);

  // Determine if international phase should run
  // Simple heuristic: run if manufacturer name suggests non-US origin
  const intlManufacturers = ['loewen', 'inline', 'inline windows', 'centra', 'accurate dorwin'];
  const isInternational   = intlManufacturers.some(m =>
    manufacturer.toLowerCase().includes(m) || productName.toLowerCase().includes(m)
  );

  // ── Build query list per phase ─────────────────────────────────────────────

  const phases = [];

  // Phase 2: Web searches
  if (checklist.phase_2_web_searches?.queries?.length > 0) {
    phases.push({
      name:    'phase_2_web_searches',
      queries: checklist.phase_2_web_searches.queries,
    });
  }

  // Phase 3: Reddit
  if (checklist.phase_3_reddit?.queries?.length > 0) {
    phases.push({
      name:    'phase_3_reddit',
      queries: checklist.phase_3_reddit.queries,
    });
  }

  // Phase 4: Professional forums
  if (checklist.phase_4_professional_forums?.queries?.length > 0) {
    phases.push({
      name:    'phase_4_professional_forums',
      queries: checklist.phase_4_professional_forums.queries,
    });
  }

  // Phase 5: YouTube installers
  if (checklist.phase_5_youtube_installers?.queries?.length > 0) {
    phases.push({
      name:    'phase_5_youtube_installers',
      queries: checklist.phase_5_youtube_installers.queries,
    });
  }

  // Phase 6: International (conditional)
  if (isInternational && checklist.phase_6_international?.queries?.length > 0) {
    console.log(`[SOURCE PARSER] Running Phase 6 International (${manufacturer} detected as non-US)`);
    phases.push({
      name:    'phase_6_international',
      queries: checklist.phase_6_international.queries,
    });
  }

  // Phase 1: Direct URL fetches are noted but not actually fetched here
  // (Phase 6b will add full page parsing; for now we note them as sources)
  const phase1Sources = buildPhase1Sources(checklist, manufacturer);

  // ── Run all phases ─────────────────────────────────────────────────────────

  const seenUrls      = new Set();
  const allRawResults = [];

  for (const phase of phases) {
    const phaseResults = await runPhase(
      phase.name,
      phase.queries,
      productName,
      manufacturer,
      config,
      seenUrls
    );
    allRawResults.push(...phaseResults);
  }

  console.log(`\n[SOURCE PARSER] Total raw results: ${allRawResults.length}`);

  // ── Classify and extract signals ──────────────────────────────────────────

  const sources        = [];
  const complaints     = [];
  const certifications = new Set();
  const perfData       = { u_factor: null, shgc: null, air_infiltration: null, sources: [] };
  const componentNotes = [];
  const repairNotes    = { warranty_years: null, transferable: null, igu_method: null };

  // Add Phase 1 direct fetch sources
  for (const src of phase1Sources) {
    sources.push(src);
  }

  for (const result of allRawResults) {
    const { title, url, description, phase } = result;

    // Skip empty/useless results
    if (!url || !title) continue;

    // Classify
    const cls = classifySource(url, title, description);

    // Skip certification-only domains for the source pool (handled separately)
    if (cls.pool === 'certification') {
      // Extract cert data from the snippet
      const certs = extractCertifications(title, description);
      certs.forEach(c => certifications.add(c));
      continue;
    }

    // Build source entry
    const sourceEntry = {
      name:        buildSourceName(url, title, cls),
      url,
      pool:        cls.pool,
      source_type: cls.source_type,
      sentiment:   cls.sentiment,
      price_bias:  cls.price_bias,
      description: description.slice(0, 300),
      phase,
      age:         result.age,
      ...(cls.youtube_channel ? { youtube_channel: cls.youtube_channel } : {}),
      ...(cls.is_reddit ? { _pending_power_user_check: true } : {}),
    };

    sources.push(sourceEntry);

    // Extract complaints
    const complaint = extractComplaint(title, description, url);
    if (complaint) complaints.push(complaint);

    // Extract certifications
    const certs = extractCertifications(title, description);
    certs.forEach(c => certifications.add(c));

    // Extract performance data
    const perf = extractPerformanceData(title, description);
    if (perf.u_factor && !perfData.u_factor) {
      perfData.u_factor = perf.u_factor;
      perfData.sources.push({ type: 'u_factor', url, title });
    }
    if (perf.shgc && !perfData.shgc) {
      perfData.shgc = perf.shgc;
      perfData.sources.push({ type: 'shgc', url, title });
    }
    if (perf.air_infiltration && !perfData.air_infiltration) {
      perfData.air_infiltration = perf.air_infiltration;
      perfData.sources.push({ type: 'air_infiltration', url, title });
    }

    // Extract component signals
    const components = extractComponentData(title, description);
    if (components) componentNotes.push(components);

    // Extract repairability data
    const repair = extractRepairabilityData(title, description);
    if (repair.igu_method && !repairNotes.igu_method) repairNotes.igu_method = repair.igu_method;
    if (repair.warranty_years && !repairNotes.warranty_years) repairNotes.warranty_years = repair.warranty_years;
    if (repair.transferable !== null && repairNotes.transferable === null) {
      repairNotes.transferable = repair.transferable;
    }
  }

  // ── Deduplicate sources by URL ─────────────────────────────────────────────
  // (seenUrls already handles dedup for Brave results, but phase1 sources
  //  might overlap with search results if Brave returns the same URLs)

  const finalSources   = [];
  const finalSourceUrls = new Set();
  for (const src of sources) {
    if (src.url && finalSourceUrls.has(src.url)) continue;
    if (src.url) finalSourceUrls.add(src.url);
    finalSources.push(src);
  }

  // ── Build component summary note ──────────────────────────────────────────

  const uniqueComponentNotes = [...new Set(componentNotes.join(', ').split(', '))].filter(Boolean);
  const componentNote = uniqueComponentNotes.length > 0
    ? uniqueComponentNotes.join(', ')
    : null;

  // ── Build repairability note ──────────────────────────────────────────────

  const repairNote = [
    repairNotes.warranty_years  ? `${repairNotes.warranty_years}-year warranty` : null,
    repairNotes.transferable === true  ? 'transferable' : null,
    repairNotes.transferable === false ? 'non-transferable' : null,
    repairNotes.igu_method ? `IGU replacement: ${repairNotes.igu_method}` : null,
  ].filter(Boolean).join('; ') || null;

  // ── Assemble result ───────────────────────────────────────────────────────

  const parserResult = {
    sources: finalSources,
    complaints,
    certifications: [...certifications],
    performance: {
      thermal: {
        u_factor:        perfData.u_factor,
        u_factor_source: perfData.sources.find(s => s.type === 'u_factor')?.url || null,
        shgc:            perfData.shgc,
      },
      air_water: {
        air_infiltration: perfData.air_infiltration,
      },
      structural: {
        aama_class:      null, // structural test data not extractable from snippets alone
        design_pressure: null,
      },
    },
    components: {
      note: componentNote,
    },
    repairability: {
      igu_method:      repairNotes.igu_method,
      warranty_years:  repairNotes.warranty_years,
      transferable:    repairNotes.transferable,
      note:            repairNote,
    },
    meta: {
      productName,
      config,
      category,
      manufacturer,
      isInternational,
      run_date:      new Date().toISOString(),
      total_sources: finalSources.length,
      pool_a_count:  finalSources.filter(s => s.pool === 'A').length,
      pool_b_count:  finalSources.filter(s => s.pool === 'B').length,
      pool_c_count:  finalSources.filter(s => s.pool === 'C').length,
      reddit_pending: finalSources.filter(s => s._pending_power_user_check).length,
      complaints_found: complaints.length,
      certifications_found: certifications.size,
    },
  };

  console.log(`\n[SOURCE PARSER] ── Results ──`);
  console.log(`[SOURCE PARSER]   Sources:      ${parserResult.meta.total_sources} (Pool A: ${parserResult.meta.pool_a_count}, B: ${parserResult.meta.pool_b_count}, C: ${parserResult.meta.pool_c_count})`);
  console.log(`[SOURCE PARSER]   Reddit:       ${parserResult.meta.reddit_pending} pending power-user check`);
  console.log(`[SOURCE PARSER]   Complaints:   ${parserResult.meta.complaints_found}`);
  console.log(`[SOURCE PARSER]   Certs found:  ${parserResult.certifications.join(', ') || 'none'}`);
  console.log(`[SOURCE PARSER]   U-factor:     ${parserResult.performance.thermal.u_factor || 'not found'}`);
  console.log(`[SOURCE PARSER] ════════════════════════════════════\n`);

  // ── Optionally build / merge evidence file ────────────────────────────────

  if (existingEvidence) {
    parserResult._merged_evidence = buildEvidenceFile(parserResult, existingEvidence);
  }

  return parserResult;
}

// ─── PHASE 1 HELPER ───────────────────────────────────────────────────────────

/**
 * Build Phase 1 "direct fetch" source entries from the checklist.
 * These are not searched via Brave — they are known authoritative URLs
 * that the pipeline should always include.
 *
 * @param {Object} checklist
 * @param {string} manufacturer
 * @returns {Array<Object>}
 */
function buildPhase1Sources(checklist, manufacturer) {
  const sources = [];
  const phase1  = checklist.phase_1_direct_fetches;
  if (!phase1) return sources;

  // Standard mandatory URLs
  for (const entry of (phase1.urls || [])) {
    if (!entry.url) continue;
    const cls = classifySource(entry.url, entry.purpose || '', '');
    sources.push({
      name:        entry.purpose || entry.url,
      url:         entry.url,
      pool:        cls.pool,
      source_type: cls.source_type,
      sentiment:   'mixed', // Unknown until fetched
      price_bias:  cls.price_bias,
      description: entry.purpose || '',
      phase:       'phase_1_direct_fetches',
      _requires_fetch: true, // Flag for Phase 6b full-page parsing
    });
  }

  // Manufacturer-specific URLs
  const mfgUrls = (phase1.manufacturer_urls || {})[manufacturer] || [];
  for (const mfgUrl of mfgUrls) {
    if (!mfgUrl) continue;
    sources.push({
      name:        `${manufacturer} official technical documentation`,
      url:         mfgUrl,
      pool:        'certification',
      source_type: 'manufacturer',
      sentiment:   'mixed',
      price_bias:  false,
      description: `Official ${manufacturer} technical/performance documentation`,
      phase:       'phase_1_direct_fetches',
      _requires_fetch: true,
    });
  }

  return sources;
}

// ─── SOURCE NAME BUILDER ─────────────────────────────────────────────────────

/**
 * Build a human-readable name for a source, combining domain and page context.
 *
 * @param {string} url
 * @param {string} title
 * @param {Object} cls — output of classifySource()
 * @returns {string}
 */
function buildSourceName(url, title, cls) {
  const domain = extractDomain(url) || url;

  const DOMAIN_LABELS = {
    'greenbuildingadvisor.com': 'GBA',
    'finehomebuilding.com':     'Fine Homebuilding',
    'jlconline.com':            'JLC Online',
    'buildingscience.com':      'Building Science Corp',
    'youtube.com':              cls.youtube_channel
      ? `YouTube (${cls.youtube_channel})`
      : 'YouTube',
    'youtu.be':                 'YouTube',
    'reddit.com':               'Reddit',
    'houzz.com':                'Houzz',
    'trustpilot.com':           'Trustpilot',
    'thewindowdog.com':         'TheWindowDog',
    'todayshomeowner.com':      "Today's Homeowner",
    'thisoldhouse.com':         'This Old House',
    'windowpurchase.com':       'WindowPurchase.com (Jay Johnson)',
    'nfrc.org':                 'NFRC',
    'energystar.gov':           'Energy Star',
    'aama.net':                 'AAMA',
    'passivehouse.com':         'Passive House Institute',
    'phius.org':                'PHIUS',
    'replacementwindowreviews.co': 'ReplacementWindowReviews',
    'replacementwindowdiscussions.com': 'ReplacementWindowDiscussions',
  };

  const label = DOMAIN_LABELS[domain] || domain;

  // Append a short context hint from the title (first 40 chars)
  const titleHint = (title || '').slice(0, 60).trim();
  if (titleHint && titleHint.toLowerCase() !== label.toLowerCase()) {
    return `${label} — ${titleHint}`;
  }
  return label;
}

// ─── EXPORTS ──────────────────────────────────────────────────────────────────

module.exports = {
  parseSourcesForProduct,
  buildEvidenceFile,
  classifySource,
  extractManufacturer,
  extractDomain,
  braveSearch,
  loadChecklist,
};

// ─── CLI + SELF-TEST ──────────────────────────────────────────────────────────

if (require.main === module) {
  const args = process.argv.slice(2);

  // Load .env (dotenv is installed per package.json)
  try {
    require('dotenv').config({ path: path.join(__dirname, '.env') });
  } catch (_) {
    // dotenv optional in test mode
  }

  // ── Self-test mode ───────────────────────────────────────────────────────
  if (args[0] === '--test') {
    console.log('\n[SELF-TEST] Running source_parser.js self-tests...\n');
    let passed = 0;
    let failed = 0;

    function assert(label, condition, detail) {
      if (condition) {
        console.log(`  ✓ ${label}`);
        passed++;
      } else {
        console.error(`  ✗ ${label}${detail ? ': ' + detail : ''}`);
        failed++;
      }
    }

    // Test 1: Checklist loads
    try {
      const cl = loadChecklist('windows');
      assert('Checklist loads (windows.json)',
        cl && cl.category === 'windows' && Array.isArray(cl.phase_2_web_searches?.queries));
    } catch (e) {
      assert('Checklist loads (windows.json)', false, e.message);
    }

    // Test 2: Manufacturer extraction — all known products
    const mfgTests = [
      ['Andersen E-Series',          'Andersen'],
      ['Andersen 100 Series',        'Andersen'],
      ['Marvin Signature Ultimate',  'Marvin'],
      ['Pella 250 Series',           'Pella'],
      ['Pella Impervia',             'Pella'],
      ['Loewen',                     'Loewen'],
      ['Ply Gem Pro Series',         'Ply Gem'],
      ['Reliabilt 3500',             'Reliabilt'],
      ['Milgard Tuscany',            'Milgard'],
      ['Simonton Reflections 5500',  'Simonton'],
      ['Jeld-Wen V-2500',            'Jeld-Wen'],
      ['Sierra Pacific',             'Sierra Pacific'],
      ['Window World 4000',          'Window World'],
      ['Alpen Zenith ZR-7',          'Alpen'],
    ];
    for (const [product, expected] of mfgTests) {
      const got = extractManufacturer(product);
      assert(`extractManufacturer("${product}") === "${expected}"`, got === expected,
        `got "${got}"`);
    }

    // Test 3: Pool classification — known domains
    const classTests = [
      ['https://www.greenbuildingadvisor.com/article/test', 'A'],
      ['https://www.finehomebuilding.com/2023/test',        'A'],
      ['https://www.jlconline.com/how-to/test',             'A'],
      ['https://www.buildingscience.com/documents/test',    'A'],
      ['https://www.youtube.com/watch?v=abc',               'C'],  // generic YouTube → C
      ['https://www.houzz.com/discussions/test',            'C'],
      ['https://www.trustpilot.com/review/test',            'C'],
      ['https://www.thewindowdog.com/test',                 'C'],
      ['https://www.nfrc.org/search',                       'certification'],
      ['https://www.energystar.gov/products',               'certification'],
      ['https://recalls.cpsc.gov/cgi-bin/test',             'certification'],
    ];
    for (const [url, expectedPool] of classTests) {
      const cls = classifySource(url, '', '');
      assert(`classifySource("${extractDomain(url)}") === Pool ${expectedPool}`,
        cls.pool === expectedPool, `got pool "${cls.pool}"`);
    }

    // Test 4: Pool B YouTube — installer channel detection
    const ytResult = classifySource(
      'https://www.youtube.com/watch?v=xyz',
      'Matt Risinger installs Loewen windows',
      'Professional window installation review'
    );
    assert('YouTube Matt Risinger → Pool B',
      ytResult.pool === 'B' && ytResult.source_type === 'youtube_installer');

    // Test 5: Price bias detection
    const pb = classifySource(
      'https://www.todayshomeowner.com/windows/review',
      'Loewen Windows Review',
      'Not worth the money at this price point'
    );
    assert('Price bias detected (todayshomeowner + keywords)', pb.price_bias === true);

    // Test 6: Sentiment classification
    const pos = classifySource(
      'https://www.finehomebuilding.com/test',
      'Loewen Windows',
      'I highly recommend these windows, excellent quality and reliable'
    );
    assert('Positive sentiment detected', pos.sentiment === 'positive');

    const neg = classifySource(
      'https://www.houzz.com/test',
      'Loewen window problems',
      'Defective seal, condensation issues, avoid this product'
    );
    assert('Negative sentiment detected', neg.sentiment === 'negative');

    // Test 7: Domain extraction
    assert('extractDomain works with www prefix',
      extractDomain('https://www.greenbuildingadvisor.com/article') === 'greenbuildingadvisor.com');
    assert('extractDomain returns null on bad URL',
      extractDomain('not-a-url') === null);

    // Test 8: extractManufacturer fallback
    const unknown = extractManufacturer('SomeNewBrand ProWindow');
    assert('extractManufacturer fallback to first word', unknown === 'SomeNewBrand');

    // Summary
    console.log(`\n[SELF-TEST] ${passed} passed, ${failed} failed`);
    if (failed > 0) {
      process.exit(1);
    } else {
      console.log('[SELF-TEST] All tests passed.\n');
    }
    return;
  }

  // ── Normal CLI mode ──────────────────────────────────────────────────────
  if (args.length < 2) {
    console.log('Usage:');
    console.log('  node source_parser.js "Product Name" DH [category] [existing_evidence.json]');
    console.log('  node source_parser.js --test');
    process.exit(1);
  }

  const [productArg, configArg, categoryArg, evidenceArg] = args;

  parseSourcesForProduct(
    productArg,
    configArg,
    categoryArg || 'windows',
    evidenceArg || null
  )
    .then(result => {
      console.log(JSON.stringify(result, null, 2));
    })
    .catch(err => {
      console.error('[FATAL]', err.message);
      process.exit(1);
    });
}
