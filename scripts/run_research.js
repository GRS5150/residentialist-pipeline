#!/usr/bin/env node
/**
 * Phase 1: Run Perplexity Research (Pass 1-4) for a category
 * 
 * Replaces: Ray copy-pasting 4 queries into Perplexity browser, waiting, saving results.
 * 
 * Usage:
 *   export PERPLEXITY_API_KEY=$(grep PERPLEXITY_API_KEY .env | cut -d= -f2)
 *   /usr/local/bin/node scripts/run_research.js ranges_cooktops
 * 
 * Reads:   templates/prompt_a_{category}.md (4 queries separated by ## PASS N headers)
 * Writes:  knowledge/{category}/{category}_testing_framework.md       (Pass 1)
 *          knowledge/{category}/{category}_component_analysis.md      (Pass 2)
 *          knowledge/{category}/{category}_hierarchy_top.md           (Pass 3)
 *          knowledge/{category}/{category}_hierarchy_bottom.md        (Pass 4)
 * Notifies: Telegram when complete
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const notify = require('./notify');
const { appendToRegistry } = require('./source_registry');

// ============================================================================
// CONFIG
// ============================================================================

const API_KEY = process.env.PERPLEXITY_API_KEY;
const TIMEOUT_MS = 600000; // 10 minutes per query (deep research takes time)

// ============================================================================
// PARSE PROMPT_A FILE
// ============================================================================

function parsePromptA(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const queries = {};

  // Match any of these formats:
  //   ## PASS 1 — Title
  //   ## Gas Pass 1 — Landscape Survey
  //   ## Induction Pass 2 — Component Deep Dive
  // Captures: [prefix (Gas/Induction/etc)] [pass number] [title]
  const passRegex = /^#{1,3}\s*(?:(\w+)\s+)?Pass\s+(\d+)\s*[—\-–:]?\s*(.*?)$/gim;
  const matches = [...content.matchAll(passRegex)];

  let seqNum = 0;
  for (let i = 0; i < matches.length; i++) {
    const prefix = matches[i][1] || ''; // "Gas", "Induction", or ""
    const subNum = parseInt(matches[i][2]); // 1-4 within group
    const title = matches[i][3]?.trim() || '';
    const startIdx = matches[i].index + matches[i][0].length;
    const endIdx = i + 1 < matches.length ? matches[i + 1].index : content.length;
    const queryText = content.substring(startIdx, endIdx).trim();

    if (queryText.length > 50) { // Sanity check — real queries are long
      seqNum++;
      queries[seqNum] = {
        query: queryText,
        prefix: prefix,
        subNum: subNum,
        title: title,
        label: prefix ? `${prefix} Pass ${subNum}` : `Pass ${subNum}`
      };
    }
  }

  return queries;
}

/**
 * Get the right Perplexity model for a pass based on its sub-number (1-4).
 * Pass 1-2 (landscape + components) = sonar-deep-research (complex, multi-step)
 * Pass 3-4 (hierarchy) = sonar-pro (always searches, better for ranking questions)
 */
function getModelForPass(subNum) {
  return (subNum <= 2) ? 'sonar-deep-research' : 'sonar-pro';
}

// ============================================================================
// PERPLEXITY API
// ============================================================================

async function callPerplexity(query, model) {
  if (!API_KEY) throw new Error('PERPLEXITY_API_KEY not set');

  const payload = JSON.stringify({
    model: model,
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
 * Retry wrapper for Perplexity API calls.
 * ECONNRESET and similar transient errors get retried with exponential backoff.
 * sonar-deep-research holds the connection open for 3-6 minutes — long enough
 * for network intermediaries to reset it. Retrying usually succeeds.
 */
const MAX_RETRIES = 3;
const RETRY_DELAYS = [15000, 30000, 60000]; // 15s, 30s, 60s

async function callPerplexityWithRetry(query, model) {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await callPerplexity(query, model);
    } catch (err) {
      const isRetryable = err.message.includes('ECONNRESET') ||
                          err.message.includes('ETIMEDOUT') ||
                          err.message.includes('ECONNREFUSED') ||
                          err.message.includes('socket hang up') ||
                          err.message.includes('Timeout');

      if (!isRetryable || attempt === MAX_RETRIES) {
        throw err;
      }

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
  const args = process.argv.slice(2);
  const category = args.find(a => !a.startsWith('--'));
  const passFlag = args.find(a => a.startsWith('--pass='));
  const onlyPasses = passFlag ? passFlag.replace('--pass=', '').split(',').map(Number) : null;

  if (!category) {
    console.error('Usage: node scripts/run_research.js <category_name> [--pass=3,4]');
    console.error('Examples:');
    console.error('  node scripts/run_research.js ranges_cooktops          # run all 4 passes');
    console.error('  node scripts/run_research.js ranges_cooktops --pass=3,4  # re-run passes 3 and 4 only');
    process.exit(1);
  }

  const promptAPath = path.join(__dirname, '..', 'templates', `prompt_a_${category}.md`);
  if (!fs.existsSync(promptAPath)) {
    console.error(`ERROR: ${promptAPath} not found.`);
    console.error('Create the prompt_a file first (4 queries: Pass 1-4).');
    process.exit(1);
  }

  const outDir = path.join(__dirname, '..', 'knowledge', category);
  fs.mkdirSync(outDir, { recursive: true });

  console.log('='.repeat(70));
  console.log(`PHASE 1: PERPLEXITY RESEARCH — ${category.toUpperCase()}`);
  console.log(`Models: Landscape/Component = sonar-deep-research, Hierarchy = sonar-pro`);
  console.log(`Input: ${promptAPath}`);
  console.log(`Output: ${outDir}/`);
  if (onlyPasses) console.log(`Re-running passes: ${onlyPasses.join(', ')} only`);
  console.log('='.repeat(70));
  console.log();

  // Parse queries
  const queries = parsePromptA(promptAPath);
  let passNums = Object.keys(queries).map(Number).sort();

  // Filter to specific passes if --pass flag provided
  if (onlyPasses) {
    passNums = passNums.filter(n => onlyPasses.includes(n));
  }

  if (passNums.length === 0) {
    console.error('ERROR: No matching queries found.');
    console.error('Prompt_a file must have headers like "## Pass 1", "## Gas Pass 1", etc.');
    process.exit(1);
  }

  console.log(`Found ${passNums.length} passes:`);
  passNums.forEach(n => console.log(`  ${n}. ${queries[n].label} — ${queries[n].title}`));
  console.log();

  // Output file naming based on sub-number
  const SUB_NAMES = {
    1: 'testing_framework',
    2: 'component_analysis',
    3: 'hierarchy_top',
    4: 'hierarchy_bottom'
  };

  const results = [];

  for (const passNum of passNums) {
    const passInfo = queries[passNum];
    const model = getModelForPass(passInfo.subNum);
    const prefix = passInfo.prefix ? `${passInfo.prefix.toLowerCase()}_` : '';
    const suffix = SUB_NAMES[passInfo.subNum] || `pass${passInfo.subNum}`;
    const outFile = `${category}_${prefix}${suffix}.md`;
    const outPath = path.join(outDir, outFile);

    console.log(`--- [${passNum}] ${passInfo.label}: ${passInfo.title} ---`);
    console.log(`  Model: ${model}`);
    console.log(`  Query length: ${passInfo.query.length} chars`);
    console.log(`  Calling Perplexity ${model} (this may take 3-6 minutes)...`);

    const startTime = Date.now();
    try {
      const result = await callPerplexityWithRetry(passInfo.query, model);
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

      // Build output with citations
      let output = `# ${category.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} — ${passInfo.label}: ${passInfo.title}\n`;
      output += `*Generated: ${new Date().toISOString()}*\n`;
      output += `*Model: ${model}*\n`;
      output += `*Query length: ${passInfo.query.length} chars*\n`;
      output += `*Response length: ${result.content.length} chars*\n`;
      output += `*Sources: ${result.citations.length}*\n\n---\n\n`;
      output += result.content;

      if (result.citations.length > 0) {
        output += '\n\n---\n\n## Citations\n\n';
        result.citations.forEach((url, i) => {
          output += `${i + 1}. ${url}\n`;
        });
      }

      fs.writeFileSync(outPath, output);
      // Capture citations into source registry at point of return
      const passTag = `research_pass_${passInfo.subNum}`;
      const regAdded = appendToRegistry(category, result.citations, passTag, null);
      console.log(`  ✅ ${result.content.length} chars, ${result.citations.length} sources, ${elapsed}s`);
      if (result.citations.length === 0) {
        console.log(`  ⚠️  WARNING: 0 citations — response may be from training data, not web search`);
      }
      if (regAdded > 0) console.log(`  📋 Registry: +${regAdded} new sources → sources_registry.json`);
      console.log(`  📄 Saved: ${outFile}\n`);

      results.push({ pass: passNum, label: passInfo.label, chars: result.content.length, sources: result.citations.length, elapsed, file: outFile });
    } catch (err) {
      console.error(`  ❌ FAILED: ${err.message}\n`);
      results.push({ pass: passNum, label: passInfo.label, error: err.message });
    }

    // Pause between queries to be nice to the API
    if (passNums.indexOf(passNum) < passNums.length - 1) {
      console.log('  ⏳ Pausing 5s between queries...\n');
      await new Promise(r => setTimeout(r, 5000));
    }
  }

  // Summary
  console.log('='.repeat(70));
  console.log('RESEARCH COMPLETE');
  console.log('='.repeat(70));
  const succeeded = results.filter(r => !r.error);
  const failed = results.filter(r => r.error);
  console.log(`✅ ${succeeded.length}/${results.length} passes completed`);
  if (failed.length > 0) console.log(`❌ ${failed.length} failed: ${failed.map(f => `Pass ${f.pass}`).join(', ')}`);

  for (const r of succeeded) {
    console.log(`  Pass ${r.pass} (${r.label}): ${r.chars} chars, ${r.sources} sources → ${r.file}`);
  }

  // Notify
  const msg = `PHASE 1 COMPLETE: ${category}\n\n` +
    `${succeeded.length}/${results.length} research passes done.\n` +
    succeeded.map(r => `Pass ${r.pass}: ${r.chars} chars, ${r.sources} sources`).join('\n') +
    (failed.length > 0 ? `\n\n⚠️ ${failed.length} failed` : '') +
    `\n\n🔴 CHECKPOINT: Review research, build config + calibration in Claude.ai, then run deep dives.`;

  await notify(msg);
}

main().catch(err => { console.error('FATAL:', err); process.exit(1); });
