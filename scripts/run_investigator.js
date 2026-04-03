#!/usr/bin/env node
/**
 * Phase 7: Run Investigator Bot for any category
 * 
 * Replaces: Building a per-category run_investigator_{category}.js each time.
 * 
 * Usage:
 *   export ANTHROPIC_API_KEY=$(grep ANTHROPIC_API_KEY .env | cut -d= -f2)
 *   /usr/local/bin/node scripts/run_investigator.js refrigerators
 * 
 * Reads:   calibration/{category}/config.json     (products, scores, axis weights)
 *          calibration/{category}/curation_files/  (one JSON per product)
 *          configs/{category}.json                 (source pools, platform disclosures)
 * 
 * Writes:  investigator_{category}_{product_slug}.md  (one per product)
 *          investigator_{category}_summary.md
 * 
 * Then: git add + commit + push
 * Notifies: Telegram when complete
 */

const fs = require('fs');
const path = require('path');
const notify = require('./notify');

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = 'claude-sonnet-4-20250514';
const MAX_TOKENS = 4000;

// ============================================================================
// API
// ============================================================================

async function callSonnet(prompt) {
  if (!ANTHROPIC_KEY) throw new Error('ANTHROPIC_API_KEY not set');

  const payload = JSON.stringify({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    messages: [{ role: 'user', content: prompt }]
  });

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: payload
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Anthropic API ${response.status}: ${errText.substring(0, 500)}`);
  }

  const data = await response.json();
  return data.content.map(c => c.text || '').join('');
}

// ============================================================================
// PROMPT BUILDER
// ============================================================================

function buildPrompt(product, curationData, categoryConfig) {
  const sources = curationData.sources || [];
  const scoredSources = sources.filter(s => s.classification === 'score');
  const reportOnlySources = sources.filter(s => s.classification === 'report_only');

  const sourceBlock = scoredSources.map(s =>
    `[${s.id}] (Pool ${s.pool}, ${s.column}) ${s.source_name}: ${s.snippet}`
  ).join('\n\n');

  const reportOnlyBlock = reportOnlySources.map(s =>
    `[${s.id}] (Report Only) ${s.source_name}: ${s.snippet}`
  ).join('\n\n');

  // Get platform disclosure from curation file or category config
  const platformDisclosure = curationData.platform_disclosure || '';
  const platformBlock = platformDisclosure
    ? `\n\nMANDATORY PLATFORM DISCLOSURE (must appear in report):\n${platformDisclosure}`
    : '';

  // Check for European brand asymmetry note
  const europeanNote = (categoryConfig?.category_specific_rules || [])
    .find(r => r.toLowerCase().includes('european brand'));
  const europeanBlock = europeanNote
    ? `\nNote: ${europeanNote}`
    : '';

  const weights = categoryConfig?.axis_weights || { quality: 0.30, durability: 0.40, performance: 0.30 };

  return `You are an investigator analyzing a product that has already been scored. Your job is to figure out what DROVE the score — not to produce or change it.

LOCKED SCORE: ${product.target}/100 — Tier ${product.tier}
AXIS WEIGHTS: Quality=${weights.quality}, Durability=${weights.durability}, Performance=${weights.performance}
AXIS SCORES FROM CALIBRATION: Quality=${product.axis_scores?.quality || "TBD"}, Durability=${product.axis_scores?.durability || "TBD"}, Performance=${product.axis_scores?.performance || "TBD"}
CORPORATE OUTLOOK: ${curationData.outlook || 'Not specified'} — ${curationData.outlook_rationale || ''}
${platformBlock}${europeanBlock}

RULES:
1. The three scored axes MUST show real variance. If all three are within 3 points of each other, you have failed.
2. The weighted average of your axis scores should approximate the locked composite (${product.target}), but individual axes can range significantly.
3. At least one specific strength and one specific deficiency must be identified, with evidence citations.
4. Every claim must trace to a source ID from the curation file. No speculation.
5. Material Safety is label-only (Excellent/Good/Moderate/Concern). Report separately.
6. Editorial guardrail: Report the evidence, let the score speak.
7. If a platform disclosure is listed above, it MUST appear in the report.
8. Company Background is REQUIRED for every product. The buyer wants to know who they're buying from.

SCORED EVIDENCE:
${sourceBlock}

REPORT-ONLY EVIDENCE:
${reportOnlyBlock || '(none)'}

BOTTOM LINE FROM CURATION:
${curationData.bottom_line || ''}

Produce the investigator report in this exact format:

## ${product.name} — Investigator Analysis
**Locked Score: ${product.target}/100 — Tier ${product.tier}**

### Score Decomposition
| Axis | Score | Weight | Assessment |
|------|-------|--------|------------|
| Quality | [score] | ${weights.quality} | [one-sentence assessment citing evidence] |
| Durability | [score] | ${weights.durability} | [one-sentence assessment citing evidence] |
| Performance | [score] | ${weights.performance} | [one-sentence assessment citing evidence] |
| Material Safety | [label] | report only | [one-sentence assessment] |

### Company Background
[Who owns this company? Founding year, ownership structure (family-owned, public, PE-backed, subsidiary). Corporate parent if applicable. Where is it manufactured? Does it share manufacturing with other brands? Has it been recently acquired or changed hands? Any financial health signals — profitable, distressed, bankruptcy risk? Is this a premium brand or a lower brand repositioned as premium? The buyer is spending thousands of dollars and deserves to know who stands behind the product.]

### Strengths
- **[Strength Name]**: [Specific evidence with source citation]

### Deficiencies
- **[Deficiency Name]**: [Specific evidence with source citation]

### What You Should Know
[2-3 paragraphs for a homebuyer]

### Platform Disclosure
[If applicable — shared manufacturing, shared components, badge-engineering]

### Corporate Outlook
[Outlook label and rationale]

### Repair Economics
[Most common failure, parts cost, repair cost, cost-justification]

### Score Justification
[2-3 sentences]`;
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const category = process.argv[2];
  if (!category) {
    console.error('Usage: node scripts/run_investigator.js <category_name>');
    process.exit(1);
  }

  const baseDir = path.join(__dirname, '..');
  const configPath = path.join(baseDir, 'calibration', category, 'config.json');
  const categoryConfigPath = path.join(baseDir, 'configs', `${category}.json`);
  const curationDir = path.join(baseDir, 'calibration', category, 'curation_files');

  // Load configs
  if (!fs.existsSync(configPath)) { console.error(`ERROR: ${configPath} not found`); process.exit(1); }
  if (!fs.existsSync(curationDir)) { console.error(`ERROR: ${curationDir} not found`); process.exit(1); }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const categoryConfig = fs.existsSync(categoryConfigPath) ? JSON.parse(fs.readFileSync(categoryConfigPath, 'utf8')) : {};
  // Output directory: output/investigators/{category}/
  const outputDir = path.join(baseDir, "output", "investigators", category);
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  const products = config.calibration_products || [];

  if (products.length === 0) {
    console.error('ERROR: No calibration_products found in config');
    process.exit(1);
  }

  console.log('='.repeat(70));
  console.log(`PHASE 7: INVESTIGATOR — ${category.toUpperCase()}`);
  console.log(`Model: ${MODEL}`);
  console.log(`Products: ${products.length}`);
  console.log('='.repeat(70));
  console.log();

  // Match curation files to products
  const curationFiles = fs.readdirSync(curationDir).filter(f => f.endsWith('.json'));
  console.log(`Curation files found: ${curationFiles.length}`);

  const results = [];

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const slug = product.slug;

    // Find matching curation file
    const curationFile = curationFiles.find(f => f.includes(slug));
    if (!curationFile) {
      console.error(`  ❌ No curation file found for ${slug}`);
      results.push({ name: product.name, error: 'No curation file' });
      continue;
    }

    const curationData = JSON.parse(fs.readFileSync(path.join(curationDir, curationFile), 'utf8'));
    const outputFile = `investigator_${category}_${slug}.md`;
    const outputDir2 = path.join(baseDir, "output", "investigators", category);
    const outputPath = path.join(outputDir2, outputFile);

    console.log(`--- [${i + 1}/${products.length}] ${product.name} (${product.target}/100) ---`);

    const prompt = buildPrompt(product, curationData, categoryConfig);
    console.log(`  Calling Sonnet (${prompt.length} chars)...`);

    const startTime = Date.now();
    try {
      const report = await callSonnet(prompt);
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

      fs.writeFileSync(outputPath, report);
      console.log(`  ✅ ${report.length} chars, ${elapsed}s`);
      console.log(`  📄 Saved: ${outputFile}`);

      results.push({ name: product.name, slug, target: product.target, chars: report.length, elapsed, file: outputFile });
    } catch (err) {
      console.error(`  ❌ FAILED: ${err.message}`);
      results.push({ name: product.name, slug, error: err.message });
    }

    if (i < products.length - 1) {
      console.log('  ⏳ Pausing 2s...\n');
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  // Build summary
  const succeeded = results.filter(r => !r.error);
  const summaryFile = `investigator_${category}_summary.md`;
  let summary = `# ${category.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} — Investigator Summary\n`;
  summary += `*Generated: ${new Date().toISOString()}*\n`;
  summary += `*Model: ${MODEL}*\n\n`;
  summary += `## Scores\n\n| Product | Score | Tier | Report |\n|---|---|---|---|\n`;
  for (const r of results) {
    if (r.error) {
      summary += `| ${r.name} | ERROR | — | ${r.error} |\n`;
    } else {
      summary += `| ${r.name} | ${r.target} | — | ${r.file} (${r.chars} chars) |\n`;
    }
  }
  fs.writeFileSync(path.join(outputDir, summaryFile), summary);

  console.log('\n' + '='.repeat(70));
  console.log(`✅ ${succeeded.length}/${results.length} INVESTIGATOR REPORTS COMPLETE`);
  console.log(`📄 Summary: ${summaryFile}`);
  console.log('='.repeat(70));

  // Git commit
  const { execSync } = require('child_process');
  try {
    execSync(`cd "${baseDir}" && git add output/investigators/${category}/ calibration/${category}/ configs/${category}.json 2>/dev/null`, { stdio: 'pipe' });
    execSync(`cd "${baseDir}" && git commit -m "${category} LOCKED: investigator reports, configs, curation files" 2>/dev/null`, { stdio: 'pipe' });
    execSync(`cd "${baseDir}" && git push 2>/dev/null`, { stdio: 'pipe' });
    console.log('\n✅ Committed and pushed to GitHub');
  } catch {
    console.log('\n⚠️ Git commit skipped (nothing to commit or not a repo)');
  }

  // Notify
  const msg = `PHASE 7 COMPLETE: ${category}\n\n` +
    `${succeeded.length}/${results.length} investigator reports done.\n\n` +
    succeeded.map(r => `${r.name}: ${r.target}/100 ✅`).join('\n') +
    `\n\n🟢 CHECKPOINT: Audit 1-2 reports. If clean, category is LOCKED.`;

  await notify(msg);
}

main().catch(err => { console.error('FATAL:', err); process.exit(1); });
