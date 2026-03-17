/**
 * V5 Source Quarantine Module
 *
 * Runs noise reduction filters on professional consensus sources.
 * Sources are never deleted — they're quarantined with metadata fields.
 * Human overrides (restored: true) always take precedence.
 *
 * Filters (in order):
 *   1. Bad Pool A — known misassigned expert sources
 *   2. Dedup — same URL or same event (Haiku classifier)
 *   3. Cross-product — wrong product line (Haiku classifier, Pool C only)
 *   4. Lawsuit 10-year cutoff — stale legal actions
 */

const Anthropic = require('@anthropic-ai/sdk');
const path = require('path');

const client = new Anthropic();
const HAIKU_MODEL = 'claude-haiku-4-5-20251001';

// ─── FILTER 1: BAD POOL A ─────────────────────────────────────────────────────

function filterBadPoolA(sources, productSlug, rules) {
  const badRules = rules.bad_pool_a?.[productSlug] || [];
  if (badRules.length === 0) return sources;

  let count = 0;
  for (const src of sources) {
    if (src.restored === true) continue;
    if (src.quarantined) continue;

    const pool = (src.pool || 'C').toUpperCase();
    if (pool !== 'A') continue;

    for (const rule of badRules) {
      const fieldValue = (src[rule.field] || '').toLowerCase();
      const matchValue = rule.match.toLowerCase();
      if (fieldValue.includes(matchValue)) {
        src.quarantined = true;
        src.quarantine_reason = 'bad_pool_a';
        src.quarantined_at = new Date().toISOString();
        count++;
        break;
      }
    }
  }

  if (count > 0) console.log(`[QUARANTINE] Bad Pool A: quarantined ${count} source(s)`);
  return sources;
}

// ─── FILTER 2 & 3: DEDUP + CROSS-PRODUCT (combined Haiku pass) ────────────────

function normalizeUrl(url) {
  if (!url) return '';
  try {
    const u = new URL(url);
    // Strip query params, hash, trailing slash
    return (u.origin + u.pathname).replace(/\/+$/, '').toLowerCase();
  } catch {
    return url.toLowerCase().replace(/[?#].*$/, '').replace(/\/+$/, '');
  }
}

function filterUrlDuplicates(sources) {
  const seenUrls = new Map(); // normalized URL → first source index
  let count = 0;

  for (let i = 0; i < sources.length; i++) {
    const src = sources[i];
    if (src.restored === true) continue;
    if (src.quarantined) continue;
    if (!src.url) continue;

    const norm = normalizeUrl(src.url);
    if (!norm) continue;

    if (seenUrls.has(norm)) {
      src.quarantined = true;
      src.quarantine_reason = 'dedup';
      src.quarantined_at = new Date().toISOString();
      count++;
    } else {
      seenUrls.set(norm, i);
    }
  }

  if (count > 0) console.log(`[QUARANTINE] URL dedup: quarantined ${count} source(s)`);
  return sources;
}

async function filterPoolCWithHaiku(sources, productName) {
  // Collect active Pool C sources for Haiku classification
  const poolC = [];
  const poolCIndices = [];
  for (let i = 0; i < sources.length; i++) {
    const src = sources[i];
    if (src.restored === true) continue;
    if (src.quarantined) continue;
    const pool = (src.pool || 'C').toUpperCase();
    if (pool === 'C') {
      poolC.push(src);
      poolCIndices.push(i);
    }
  }

  if (poolC.length === 0) return sources;

  // Build summaries for Haiku
  const numbered = poolC.map((s, idx) => {
    const summary = (s.summary || '').replace(/<[^>]+>/g, ' ').substring(0, 250);
    const url = (s.url || 'no url').substring(0, 100);
    return `${idx}: ${url}\n   ${summary}`;
  }).join('\n');

  let flags;
  try {
    const resp = await client.messages.create({
      model: HAIKU_MODEL,
      max_tokens: 3000,
      messages: [{
        role: 'user',
        content: `You are auditing evidence sources for "${productName}" windows. Review each source and flag problems.

FLAG each source with ONE of:
- OK — Source is about ${productName} and provides unique information
- DUPLICATE:X — This source describes the same event/issue as source X (give the index of the earlier source). Common: multiple sources referencing the same lawsuit, recall, or specific incident.
- WRONG_PRODUCT — This source is primarily about a DIFFERENT product line (e.g., complaints about "Marvin Elevate" should not be scored against "Marvin Signature Ultimate"; complaints about "Andersen Renewal" should not be scored against "Andersen 400 Series")
- RESOLVED_REPEAT — This source describes a historical issue (lawsuit, recall, defect) that has been publicly resolved AND is already captured by another source. One reference to a resolved issue is fine; multiple references to the same resolved issue are duplicates.

Reply ONLY with lines like: 0:OK or 3:DUPLICATE:1 or 7:WRONG_PRODUCT

${numbered}`
      }]
    });

    flags = new Map();
    const lines = resp.content[0].text.trim().split('\n');
    for (const line of lines) {
      const okMatch = line.match(/^(\d+)\s*:\s*OK/i);
      if (okMatch) { flags.set(parseInt(okMatch[1]), 'OK'); continue; }
      const dupMatch = line.match(/^(\d+)\s*:\s*(DUPLICATE|RESOLVED_REPEAT)/i);
      if (dupMatch) { flags.set(parseInt(dupMatch[1]), 'DUPLICATE'); continue; }
      const wrongMatch = line.match(/^(\d+)\s*:\s*WRONG_PRODUCT/i);
      if (wrongMatch) { flags.set(parseInt(wrongMatch[1]), 'WRONG_PRODUCT'); continue; }
    }
  } catch (err) {
    console.error(`[QUARANTINE] Haiku classification failed: ${err.message}`);
    console.log('[QUARANTINE] Skipping dedup/cross-product filters for this run');
    return sources;
  }

  let dedupCount = 0, crossCount = 0;
  for (const [idx, flag] of flags) {
    if (idx >= poolC.length) continue;
    const src = sources[poolCIndices[idx]];
    if (src.restored === true || src.quarantined) continue;

    if (flag === 'DUPLICATE') {
      src.quarantined = true;
      src.quarantine_reason = 'dedup';
      src.quarantined_at = new Date().toISOString();
      dedupCount++;
    } else if (flag === 'WRONG_PRODUCT') {
      src.quarantined = true;
      src.quarantine_reason = 'cross_product';
      src.quarantined_at = new Date().toISOString();
      crossCount++;
    }
  }

  if (dedupCount > 0) console.log(`[QUARANTINE] Haiku dedup: quarantined ${dedupCount} source(s)`);
  if (crossCount > 0) console.log(`[QUARANTINE] Cross-product: quarantined ${crossCount} source(s)`);
  return sources;
}

// ─── FILTER 4: LAWSUIT 10-YEAR CUTOFF ──────────────────────────────────────────

const LEGAL_TERMS = /\b(lawsuit|class.?action|legal.?action|settlement|litigation|sued|suing)\b/i;
const YEAR_PATTERN = /\b(19\d{2}|20[0-2]\d)\b/g;
const CUTOFF_YEAR = new Date().getFullYear() - 10; // 2016

function filterStaleLawsuits(sources) {
  let count = 0;
  for (const src of sources) {
    if (src.restored === true) continue;
    if (src.quarantined) continue;

    const summary = src.summary || '';
    if (!LEGAL_TERMS.test(summary)) continue;

    // Find year mentions in summary
    const years = [...summary.matchAll(YEAR_PATTERN)].map(m => parseInt(m[1]));
    if (years.length === 0) continue;

    // If ALL mentioned years are before the cutoff, quarantine
    const allOld = years.every(y => y < CUTOFF_YEAR);
    if (allOld) {
      src.quarantined = true;
      src.quarantine_reason = 'lawsuit_10yr';
      src.quarantined_at = new Date().toISOString();
      count++;
    }
  }

  if (count > 0) console.log(`[QUARANTINE] Lawsuit 10yr: quarantined ${count} source(s)`);
  return sources;
}

// ─── MAIN EXPORT ───────────────────────────────────────────────────────────────

/**
 * Run all quarantine filters on sources array.
 * Sources with restored: true are never quarantined.
 * Idempotent — already-quarantined sources are skipped by each filter.
 *
 * @param {Array} sources - professional_consensus.sources array
 * @param {string} productName - Human-readable product name (e.g., "Marvin Signature Ultimate")
 * @param {Object} config - { productSlug, rules } where rules is the parsed quarantine_rules.json
 * @returns {Array} Same array with quarantine fields added to filtered sources
 */
async function quarantineSources(sources, productName, config = {}) {
  if (!sources || sources.length === 0) return sources;

  const { productSlug, rules } = config;
  const rulesData = rules || loadDefaultRules();

  console.log(`[QUARANTINE] Running V5 filters on ${sources.length} sources for ${productName}`);

  // Filter 1: Bad Pool A
  if (productSlug) {
    filterBadPoolA(sources, productSlug, rulesData);
  }

  // Filter 2: URL dedup (deterministic, no API call)
  filterUrlDuplicates(sources);

  // Filter 3: Haiku-based dedup + cross-product (Pool C only)
  await filterPoolCWithHaiku(sources, productName);

  // Filter 4: Lawsuit 10-year cutoff
  filterStaleLawsuits(sources);

  // Report summary
  const quarantined = sources.filter(s => s.quarantined && s.restored !== true);
  const byReason = {};
  for (const s of quarantined) {
    byReason[s.quarantine_reason] = (byReason[s.quarantine_reason] || 0) + 1;
  }
  console.log(`[QUARANTINE] Total quarantined: ${quarantined.length}/${sources.length} — ${JSON.stringify(byReason)}`);

  return sources;
}

/**
 * Restore a quarantined source by ID. Sets restored: true so it won't be
 * re-quarantined on subsequent runs.
 */
function restoreSource(sources, sourceId) {
  const src = sources.find(s => s.id === sourceId);
  if (!src) {
    console.log(`[QUARANTINE] Source ${sourceId} not found`);
    return false;
  }
  src.restored = true;
  console.log(`[QUARANTINE] Restored source ${sourceId}`);
  return true;
}

function loadDefaultRules() {
  try {
    return require(path.join(__dirname, 'quarantine_rules.json'));
  } catch {
    console.log('[QUARANTINE] No quarantine_rules.json found, using empty rules');
    return { bad_pool_a: {}, pool_s_sources: {} };
  }
}

module.exports = { quarantineSources, restoreSource };
