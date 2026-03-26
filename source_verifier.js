/**
 * THE RESIDENTIALIST — Source Verifier (Step 2.5)
 * Runs after Sonnet structuring, before scoring.
 * Two checks per source classified as "score":
 *   1. HTTP HEAD — dead links get quarantined
 *   2. Haiku relevance check — wrong_product quarantined, installation/brand_general → report_only
 */

require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

let anthropic = null;
function getClient() {
  if (!anthropic) anthropic = new Anthropic();
  return anthropic;
}

const LINK_TIMEOUT_MS = 5000;
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// ─── Link Check ────────────────────────────────────────────────────────────────

async function checkLink(url) {
  if (!url || !url.startsWith('http')) return { ok: false, reason: 'invalid_url', code: 0 };

  // Use GET with Range header (many sites reject HEAD with 404/403/405)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), LINK_TIMEOUT_MS);

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'User-Agent': USER_AGENT, 'Range': 'bytes=0-512' },
      redirect: 'follow',
      signal: controller.signal
    });
    clearTimeout(timeout);

    const code = response.status;
    // Drain body to avoid memory leak
    try { await response.text(); } catch (_) {}

    if (code >= 200 && code < 400) return { ok: true, code };
    if (code === 403) return { ok: true, code }; // Anti-bot, page likely exists
    if (code === 404) return { ok: false, reason: 'not_found', code };
    if (code >= 500) return { ok: false, reason: `server_error_${code}`, code };
    return { ok: true, code };
  } catch (err) {
    if (err.name === 'AbortError') return { ok: false, reason: 'timeout', code: 0 };
    return { ok: false, reason: 'connection_error', code: 0 };
  }
}

// ─── Haiku Relevance Check ─────────────────────────────────────────────────────

async function checkRelevance(source, productName, operationType) {
  const client = getClient();
  // Extract manufacturer name (first word of product name usually)
  const mfgName = productName.split(' ')[0];

  const prompt = `Does this source help evaluate ${productName} (${operationType} window)?

Source: ${source.source_name}
Snippet: ${(source.snippet || '').substring(0, 300)}

Answer ONE word:
- "relevant" — DEFAULT ANSWER. Use this if the source mentions ${productName}, or mentions ${mfgName}, or compares window brands/products, or discusses material properties relevant to this product type, or contains specs/reviews/testing data applicable to this product. When in doubt, answer "relevant".
- "wrong_product" — ONLY if the source is specifically reviewing or testing a DIFFERENT named product (e.g., a source about "${mfgName} [different model]" when we are scoring ${productName}) and contains zero information applicable to ${productName}.
- "installation" — ONLY if the source is purely about installation technique with absolutely no product quality or performance content.

Do NOT use "brand_general". That category does not exist.

One word answer:`;

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 10,
      messages: [{ role: 'user', content: prompt }]
    });
    const answer = response.content[0].text.trim().toLowerCase().replace(/[^a-z_]/g, '');
    if (['relevant', 'wrong_product', 'installation'].includes(answer)) return answer;
    // Anything else (including brand_general) defaults to relevant
    return 'relevant';
  } catch (err) {
    console.warn(`[VERIFIER] Haiku relevance check failed for ${source.id}: ${err.message}`);
    return 'relevant'; // fail-open
  }
}

// ─── Main Verify Function ──────────────────────────────────────────────────────

/**
 * Verify sources in a curation file. Modifies the curation object in place.
 * @param {object} curation - Parsed curation file (modified in place)
 * @param {object} options - { skipLinkCheck, skipRelevanceCheck, productName, operationType }
 * @returns {object} Stats: { total, checked, dead_links, wrong_product, installation, brand_general, reclassified }
 */
async function verify(curation, options = {}) {
  const productName = options.productName || curation.product_name || curation.product || 'Unknown';
  const operationType = options.operationType || curation.operation_type || 'double_hung';
  const skipLinkCheck = options.skipLinkCheck || false;
  const skipRelevanceCheck = options.skipRelevanceCheck || false;

  const scoreSources = (curation.sources || []).filter(s => s.classification === 'score');
  const stats = {
    total: (curation.sources || []).length,
    score_sources: scoreSources.length,
    checked: 0,
    dead_links: 0,
    wrong_product: 0,
    installation: 0,
    brand_general: 0,
    reclassified: 0
  };

  console.log(`[VERIFIER] Checking ${scoreSources.length} score sources for ${productName}...`);

  for (const source of scoreSources) {
    stats.checked++;

    // Step 1: Link check
    if (!skipLinkCheck && source.url && source.url.startsWith('http')) {
      const linkResult = await checkLink(source.url);
      if (!linkResult.ok && linkResult.reason === 'not_found') {
        console.log(`[VERIFIER]   ❌ DEAD LINK [${source.id}] ${source.source_name} → ${linkResult.reason} (${linkResult.code})`);
        source.classification = 'quarantine';
        source.classification_reason = (source.classification_reason || '') + ` [verifier: dead_link, HTTP ${linkResult.code}]`;
        source.verification_status = 'dead_link';
        stats.dead_links++;
        stats.reclassified++;
        continue; // Skip relevance check for dead links
      }
      // Note: we don't quarantine 403 (anti-bot) or timeouts — page may still be real
    }

    // Step 2: Haiku relevance check
    if (!skipRelevanceCheck) {
      const relevance = await checkRelevance(source, productName, operationType);
      source.verification_relevance = relevance;

      if (relevance === 'wrong_product') {
        console.log(`[VERIFIER]   ⚠️  WRONG PRODUCT [${source.id}] ${source.source_name}`);
        source.classification = 'quarantine';
        source.classification_reason = (source.classification_reason || '') + ' [verifier: wrong_product]';
        stats.wrong_product++;
        stats.reclassified++;
      } else if (relevance === 'installation') {
        console.log(`[VERIFIER]   📋 INSTALLATION [${source.id}] ${source.source_name} → report_only`);
        source.classification = 'report_only';
        source.classification_reason = (source.classification_reason || '') + ' [verifier: installation_only]';
        stats.installation++;
        stats.reclassified++;
      }
      // brand_general category removed — comparative sources stay as score
    }
  }

  // Update auto_classification_summary
  if (curation.sources) {
    const summary = { total: curation.sources.length, score: 0, report_only: 0, quarantine: 0 };
    for (const src of curation.sources) {
      if (src.classification === 'score') summary.score++;
      else if (src.classification === 'report_only') summary.report_only++;
      else if (src.classification === 'quarantine') summary.quarantine++;
    }
    curation.auto_classification_summary = summary;
    curation.verification_date = new Date().toISOString();
  }

  console.log(`[VERIFIER] Done: ${stats.checked} checked, ${stats.dead_links} dead links, ${stats.wrong_product} wrong_product, ${stats.installation} installation, ${stats.brand_general} brand_general, ${stats.reclassified} reclassified`);

  return stats;
}

// ─── CLI ────────────────────────────────────────────────────────────────────────

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.log('Usage: node source_verifier.js <curation_slug> [--skip-links] [--skip-relevance]');
    console.log('       node source_verifier.js --batch');
    process.exit(1);
  }

  const WORKSPACE = __dirname;
  const CURATION_DIR = path.join(WORKSPACE, 'curation');

  if (args[0] === '--batch') {
    // Batch mode: verify all curation files
    (async () => {
      const files = fs.readdirSync(CURATION_DIR)
        .filter(f => f.endsWith('_sources.json') && !f.includes('pipeline'))
        .sort();

      const totals = { total: 0, checked: 0, dead_links: 0, wrong_product: 0, installation: 0, brand_general: 0, reclassified: 0 };
      const results = [];

      for (const file of files) {
        const slug = file.replace('_sources.json', '');
        console.log(`\n━━━ ${slug} ━━━`);
        const filePath = path.join(CURATION_DIR, file);
        const curation = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        const stats = await verify(curation);
        results.push({ slug, ...stats });

        // Save updated curation
        fs.writeFileSync(filePath, JSON.stringify(curation, null, 2));

        // Accumulate totals
        for (const k of Object.keys(totals)) totals[k] += stats[k];
      }

      console.log('\n\n' + '═'.repeat(80));
      console.log('  BATCH VERIFICATION COMPLETE');
      console.log('═'.repeat(80));
      console.log(`  Files checked:       ${files.length}`);
      console.log(`  Total sources:       ${totals.total}`);
      console.log(`  Score sources checked: ${totals.checked}`);
      console.log(`  Dead links:          ${totals.dead_links}`);
      console.log(`  Wrong product:       ${totals.wrong_product}`);
      console.log(`  Installation only:   ${totals.installation}`);
      console.log(`  Brand general:       ${totals.brand_general}`);
      console.log(`  Total reclassified:  ${totals.reclassified}`);
      console.log('═'.repeat(80));

      // Detail per product
      console.log('\n  ' + 'Product'.padEnd(45) + 'Checked'.padStart(8) + 'Dead'.padStart(6) + 'Wrong'.padStart(7) + 'Install'.padStart(8) + 'Brand'.padStart(7) + 'Reclass'.padStart(8));
      console.log('  ' + '─'.repeat(89));
      for (const r of results) {
        if (r.reclassified > 0) {
          console.log('  ' + r.slug.replace(/_/g, ' ').padEnd(45) +
            String(r.checked).padStart(8) +
            String(r.dead_links).padStart(6) +
            String(r.wrong_product).padStart(7) +
            String(r.installation).padStart(8) +
            String(r.brand_general).padStart(7) +
            String(r.reclassified).padStart(8));
        }
      }
    })();
  } else {
    const slug = args[0];
    const skipLinks = args.includes('--skip-links');
    const skipRelevance = args.includes('--skip-relevance');
    const filePath = path.join(CURATION_DIR, slug + '_sources.json');

    if (!fs.existsSync(filePath)) {
      console.error(`Curation file not found: ${filePath}`);
      process.exit(1);
    }

    (async () => {
      const curation = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const stats = await verify(curation, { skipLinkCheck: skipLinks, skipRelevanceCheck: skipRelevance });
      fs.writeFileSync(filePath, JSON.stringify(curation, null, 2));
      console.log('\nCuration file updated.');
    })();
  }
}

module.exports = { verify, checkLink, checkRelevance };
