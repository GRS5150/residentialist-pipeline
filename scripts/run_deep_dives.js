#!/usr/bin/env node
/**
 * Phase 5: Run Per-Product Perplexity Deep Dives for a category
 * 
 * Replaces: Ray copy-pasting 6 queries into Perplexity browser, waiting 3-6 min each.
 * 
 * Usage:
 *   export PERPLEXITY_API_KEY=$(grep PERPLEXITY_API_KEY .env | cut -d= -f2)
 *   /usr/local/bin/node scripts/run_deep_dives.js ranges_cooktops
 * 
 * Reads:   templates/prompt_b_{category}.md
 *          (expects ## MASTER TEMPLATE section + ## PRODUCT: Name sections)
 * 
 * Writes:  knowledge/{category}/deep_dive_{product_slug}.md  (one per product)
 * 
 * Notifies: Telegram when complete
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const notify = require('./notify');
const { appendToRegistry } = require('./source_registry');

const API_KEY = process.env.PERPLEXITY_API_KEY;
const MODEL = 'sonar-deep-research';
const TIMEOUT_MS = 600000; // 10 min per deep dive

// ============================================================================
// PARSE PROMPT_B FILE
// ============================================================================

/**
 * Parse a prompt_b template file into master template + product sections.
 * 
 * Expected format:
 *   ## MASTER TEMPLATE
 *   [query template text]
 * 
 *   ## PRODUCT: Product Name Here
 *   slug: product_slug_here
 *   [product-specific context paragraph]
 * 
 *   ## PRODUCT: Another Product
 *   slug: another_product
 *   [context]
 * 
 * Also handles the existing format where the master template is in a code block
 * and products are listed below with context paragraphs.
 */
function parsePromptB(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');

  // Try structured format first: ## MASTER TEMPLATE + ## PRODUCT: Name
  const masterMatch = content.match(/^#{1,3}\s*MASTER\s+TEMPLATE\s*\n([\s\S]*?)(?=^#{1,3}\s*PRODUCT:|$)/im);

  if (masterMatch) {
    const masterTemplate = masterMatch[1].trim();
    const products = [];
    const productRegex = /^#{1,3}\s*PRODUCT:\s*(.+?)$/gim;
    const productMatches = [...content.matchAll(productRegex)];

    for (let i = 0; i < productMatches.length; i++) {
      const name = productMatches[i][1].trim();
      const startIdx = productMatches[i].index + productMatches[i][0].length;
      const endIdx = i + 1 < productMatches.length ? productMatches[i + 1].index : content.length;
      let section = content.substring(startIdx, endIdx).trim();

      // Extract slug if present
      const slugMatch = section.match(/^slug:\s*(\S+)/im);
      const slug = slugMatch ? slugMatch[1] : name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

      // Remove slug line from context
      if (slugMatch) section = section.replace(/^slug:\s*\S+\s*/im, '').trim();

      products.push({ name, slug, context: section });
    }

    return { masterTemplate, products };
  }

  // Fallback: try to extract from code block + product list
  // Look for code block as master template
  const codeBlockMatch = content.match(/```\n?([\s\S]*?)```/);
  if (codeBlockMatch) {
    const masterTemplate = codeBlockMatch[1].trim();

    // Look for product sections after the code block
    const afterCode = content.substring(codeBlockMatch.index + codeBlockMatch[0].length);
    const products = [];
    const productSections = afterCode.split(/^#{1,3}\s+/m).filter(s => s.trim());

    for (const section of productSections) {
      const firstLine = section.split('\n')[0].trim();
      if (firstLine.length > 3 && firstLine.length < 200) {
        const rest = section.substring(firstLine.length).trim();
        const slugMatch = rest.match(/^slug:\s*(\S+)/im);
        const slug = slugMatch ? slugMatch[1] : firstLine.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
        const context = slugMatch ? rest.replace(/^slug:\s*\S+\s*/im, '').trim() : rest;

        if (context.length > 20) {
          products.push({ name: firstLine, slug, context });
        }
      }
    }

    if (products.length > 0) return { masterTemplate, products };
  }

  throw new Error('Could not parse prompt_b file. Expected ## MASTER TEMPLATE + ## PRODUCT: sections, or a code block + product sections.');
}

// ============================================================================
// PERPLEXITY API
// ============================================================================

async function callPerplexity(query) {
  if (!API_KEY) throw new Error('PERPLEXITY_API_KEY not set');

  const payload = JSON.stringify({
    model: MODEL,
    messages: [{ role: 'user', content: query }]
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.perplexity.ai',
      path: '/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`Perplexity API ${res.statusCode}: ${data.substring(0, 500)}`));
          return;
        }
        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.message?.content || '';
          const citations = parsed.citations || [];
          resolve({ content, citations });
        } catch (e) {
          reject(new Error(`Parse error: ${e.message}`));
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(TIMEOUT_MS, () => { req.destroy(); reject(new Error('Timeout (10 min)')); });
    req.write(payload);
    req.end();
  });
}

/**
 * Retry wrapper — ECONNRESET and similar transient errors get retried
 * with exponential backoff. Deep research holds connections open 3-6 min.
 */
const MAX_RETRIES = 3;
const RETRY_DELAYS = [15000, 30000, 60000];

async function callPerplexityWithRetry(query) {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await callPerplexity(query);
    } catch (err) {
      const isRetryable = err.message.includes('ECONNRESET') ||
                          err.message.includes('ETIMEDOUT') ||
                          err.message.includes('ECONNREFUSED') ||
                          err.message.includes('socket hang up') ||
                          err.message.includes('Timeout');
      if (!isRetryable || attempt === MAX_RETRIES) throw err;
      const delay = RETRY_DELAYS[attempt];
      console.log(`  ⚠️  ${err.message} — retrying in ${delay / 1000}s (attempt ${attempt + 1}/${MAX_RETRIES})...`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const category = process.argv[2];
  if (!category) {
    console.error('Usage: node scripts/run_deep_dives.js <category_name>');
    console.error('Example: node scripts/run_deep_dives.js ranges_cooktops');
    process.exit(1);
  }

  const promptBPath = path.join(__dirname, '..', 'templates', `prompt_b_${category}.md`);
  if (!fs.existsSync(promptBPath)) {
    console.error(`ERROR: ${promptBPath} not found.`);
    console.error('Build the prompt_b file first (needs Pass 2 component data).');
    process.exit(1);
  }

  const outDir = path.join(__dirname, '..', 'knowledge', category);
  fs.mkdirSync(outDir, { recursive: true });

  console.log('='.repeat(70));
  console.log(`PHASE 5: DEEP DIVES — ${category.toUpperCase()}`);
  console.log(`Model: ${MODEL}`);
  console.log(`Input: ${promptBPath}`);
  console.log(`Output: ${outDir}/`);
  console.log('='.repeat(70));
  console.log();

  // Parse prompt_b
  const { masterTemplate, products } = parsePromptB(promptBPath);
  console.log(`Master template: ${masterTemplate.length} chars`);
  console.log(`Products: ${products.length}`);
  products.forEach(p => console.log(`  - ${p.name} (${p.slug})`));
  console.log();

  const results = [];

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const query = `${masterTemplate}\n\n---\n\nSPECIFIC PRODUCT: ${product.name}\n\n${product.context}`;
    const outFile = `deep_dive_${product.slug}.md`;
    const outPath = path.join(outDir, outFile);

    console.log(`--- [${i + 1}/${products.length}] ${product.name} ---`);
    console.log(`  Query: ${query.length} chars`);
    console.log(`  Calling Perplexity (3-6 min expected)...`);

    const startTime = Date.now();
    try {
      const result = await callPerplexityWithRetry(query);
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

      let output = `# ${product.name} — Deep Dive\n`;
      output += `*Generated: ${new Date().toISOString()}*\n`;
      output += `*Model: ${MODEL}*\n`;
      output += `*Category: ${category}*\n`;
      output += `*Response: ${result.content.length} chars, ${result.citations.length} sources*\n\n---\n\n`;
      output += result.content;

      if (result.citations.length > 0) {
        output += '\n\n---\n\n## Citations\n\n';
        result.citations.forEach((url, j) => { output += `${j + 1}. ${url}\n`; });
      }

      fs.writeFileSync(outPath, output);
      // Capture citations into source registry at point of return
      const regAdded = appendToRegistry(category, result.citations, 'deep_dive', product.slug);
      console.log(`  ✅ ${result.content.length} chars, ${result.citations.length} sources, ${elapsed}s`);
      if (regAdded > 0) console.log(`  📋 Registry: +${regAdded} product-scope sources → sources_registry.json`);
      console.log(`  📄 Saved: ${outFile}`);

      results.push({ name: product.name, slug: product.slug, chars: result.content.length, sources: result.citations.length, elapsed, file: outFile });
    } catch (err) {
      console.error(`  ❌ FAILED: ${err.message}`);
      results.push({ name: product.name, slug: product.slug, error: err.message });
    }

    if (i < products.length - 1) {
      console.log('  ⏳ Pausing 5s...\n');
      await new Promise(r => setTimeout(r, 5000));
    }
  }

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('DEEP DIVES COMPLETE');
  console.log('='.repeat(70));
  const succeeded = results.filter(r => !r.error);
  const failed = results.filter(r => r.error);
  console.log(`✅ ${succeeded.length}/${results.length} deep dives completed`);
  if (failed.length > 0) console.log(`❌ ${failed.length} failed: ${failed.map(f => f.name).join(', ')}`);

  for (const r of succeeded) {
    console.log(`  ${r.name}: ${r.chars} chars, ${r.sources} sources → ${r.file}`);
  }

  // Notify
  const totalChars = succeeded.reduce((a, r) => a + r.chars, 0);
  const totalSources = succeeded.reduce((a, r) => a + r.sources, 0);
  const msg = `PHASE 5 COMPLETE: ${category}\n\n` +
    `${succeeded.length}/${results.length} deep dives done.\n` +
    `Total: ${totalChars.toLocaleString()} chars, ${totalSources} sources\n\n` +
    succeeded.map(r => `${r.name}: ${r.chars} chars, ${r.sources} sources`).join('\n') +
    (failed.length > 0 ? `\n\n⚠️ ${failed.length} failed` : '') +
    `\n\n🔴 CHECKPOINT: Process corrections in Claude.ai, build v2 calibration + curation files, then run investigator.`;

  await notify(msg);
}

main().catch(err => { console.error('FATAL:', err); process.exit(1); });
