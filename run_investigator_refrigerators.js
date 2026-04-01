/**
 * Refrigerator Investigator Bot Runner
 * Reads curation files + locked scores, calls Sonnet to produce buyer-facing report content.
 * 
 * Usage (on Mac Mini):
 *   export ANTHROPIC_API_KEY=$(grep ANTHROPIC_API_KEY .env | cut -d= -f2)
 *   /usr/local/bin/node run_investigator_refrigerators.js
 * 
 * Outputs:
 *   investigator_refrigerator_sub_zero.md
 *   investigator_refrigerator_thermador.md
 *   investigator_refrigerator_bosch_benchmark.md
 *   investigator_refrigerator_jennair.md
 *   investigator_refrigerator_dacor.md
 *   investigator_refrigerator_viking.md
 *   investigator_refrigerator_summary.md
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// CONFIG
// ============================================================================

const API_KEY = process.env.ANTHROPIC_API_KEY;
if (!API_KEY) {
  console.error('ERROR: ANTHROPIC_API_KEY not set. Run: export ANTHROPIC_API_KEY=$(grep ANTHROPIC_API_KEY .env | cut -d= -f2)');
  process.exit(1);
}

const MODEL = 'claude-sonnet-4-20250514';
const MAX_TOKENS = 4000;

const CURATION_DIR = path.join(__dirname, 'calibration/refrigerators/curation_files');
const OUTPUT_DIR = __dirname; // workspace root

const AXIS_WEIGHTS = { quality: 0.30, durability: 0.40, performance: 0.30 };

// Products with locked v2 scores and axis decompositions from calibration
const PRODUCTS = [
  {
    slug: 'sub_zero_classic_designer',
    file: 'sub_zero_classic_designer_curation.json',
    output: 'investigator_refrigerator_sub_zero.md',
    name: 'Sub-Zero Classic/Designer/Pro',
    composite: 95,
    tier: 1,
    tierLabel: 'Best in Class',
    axisScores: { quality: 95, durability: 96, performance: 93 },
    outlook: 'Strong',
    outlookRationale: 'Family-owned since 1945, dominant market share, 38-year zero-DOA record, no financial distress.',
    platformDisclosure: null
  },
  {
    slug: 'thermador_freedom',
    file: 'thermador_freedom_curation.json',
    output: 'investigator_refrigerator_thermador.md',
    name: 'Thermador Freedom Collection',
    composite: 90,
    tier: 1,
    tierLabel: 'Best in Class',
    axisScores: { quality: 91, durability: 90, performance: 90 },
    outlook: 'Strong',
    outlookRationale: 'BSH financially stable multinational. Strong US premium market position.',
    platformDisclosure: 'BSH Turkish Factory: Thermador, Bosch Benchmark, Gaggenau, and Miele built-in refrigeration manufactured in same BSH factory in Turkey. Yale confirmed.'
  },
  {
    slug: 'bosch_benchmark',
    file: 'bosch_benchmark_curation.json',
    output: 'investigator_refrigerator_bosch_benchmark.md',
    name: 'Bosch Benchmark Built-In',
    composite: 79,
    tier: 2,
    tierLabel: 'Excellent',
    axisScores: { quality: 81, durability: 78, performance: 79 },
    outlook: 'Strong',
    outlookRationale: 'BSH financially stable. Best compressor failure rate Yale tracks (0.4% at 5yr).',
    platformDisclosure: 'BSH Turkish Factory: Bosch Benchmark, Thermador, Gaggenau, and Miele built-in refrigeration manufactured in same BSH factory in Turkey. Benchmark is the entry point to the BSH platform.'
  },
  {
    slug: 'jennair_column',
    file: 'jennair_column_curation.json',
    output: 'investigator_refrigerator_jennair.md',
    name: 'JennAir Built-In Column',
    composite: 70,
    tier: 3,
    tierLabel: 'Good',
    axisScores: { quality: 70, durability: 71, performance: 69 },
    outlook: 'Conditional',
    outlookRationale: 'Whirlpool sold JennAir to Electrolux (2025). Integration uncertainty.',
    platformDisclosure: 'Whirlpool/JennAir: Shared platform. Start device W10448874 cross-applies across entire Whirlpool portfolio including KitchenAid.'
  },
  {
    slug: 'dacor_column',
    file: 'dacor_column_curation.json',
    output: 'investigator_refrigerator_dacor.md',
    name: 'Dacor Column (DRR30980RAP)',
    composite: 56,
    tier: 4,
    tierLabel: 'Fair',
    axisScores: { quality: 56, durability: 58, performance: 53 },
    outlook: 'Conditional',
    outlookRationale: 'Samsung committed to Dacor but US service infrastructure weak. Warranty routed through South Korea.',
    platformDisclosure: 'Samsung/Dacor: Complete component convergence. Every part carries Samsung DA97/DA94 prefix.'
  },
  {
    slug: 'viking_5_series',
    file: 'viking_5_series_curation.json',
    output: 'investigator_refrigerator_viking.md',
    name: 'Viking 5 Series (FDRB5363)',
    composite: 45,
    tier: 4,
    tierLabel: 'Fair',
    axisScores: { quality: 46, durability: 45, performance: 44 },
    outlook: 'Negative',
    outlookRationale: 'Middleby acquisition has not resolved systemic quality issues. >60% first-year service rate persists.',
    platformDisclosure: 'Viking does not manufacture its own refrigerators. OEM supplier(s) not publicly disclosed.'
  }
];

// ============================================================================
// INVESTIGATOR PROMPT
// ============================================================================

function buildInvestigatorPrompt(product, curationData) {
  const sources = curationData.sources || [];
  const scoredSources = sources.filter(s => s.classification === 'score');
  const reportOnlySources = sources.filter(s => s.classification === 'report_only');

  const sourceBlock = scoredSources.map(s =>
    `[${s.id}] (Pool ${s.pool}, ${s.column}) ${s.source_name}: ${s.snippet}`
  ).join('\n\n');

  const reportOnlyBlock = reportOnlySources.map(s =>
    `[${s.id}] (Report Only) ${s.source_name}: ${s.snippet}`
  ).join('\n\n');

  const platformBlock = product.platformDisclosure
    ? `\n\nMANDATORY PLATFORM DISCLOSURE (must appear in report):\n${product.platformDisclosure}`
    : '';

  return `You are an investigator analyzing a built-in refrigerator that has already been scored. Your job is to figure out what DROVE the score — not to produce or change it.

LOCKED SCORE: ${product.composite}/100 — Tier ${product.tier} (${product.tierLabel})
AXIS WEIGHTS: Quality=0.30, Durability=0.40, Performance=0.30
AXIS SCORES FROM CALIBRATION: Quality=${product.axisScores.quality}, Durability=${product.axisScores.durability}, Performance=${product.axisScores.performance}
CORPORATE OUTLOOK: ${product.outlook} — ${product.outlookRationale}
${platformBlock}

RULES:
1. The three scored axes MUST show real variance. If all three are within 3 points of each other, you have failed. Spread them based on where the evidence points.
2. The weighted average of your three axis scores should approximate the locked composite (${product.composite}), but individual axes can range significantly.
3. At least one specific strength and one specific deficiency must be identified, with evidence citations from the curation file.
4. Every claim must trace to a source ID from the curation file. No speculation. No fabricated evidence.
5. Material Safety is label-only (Excellent/Good/Moderate/Concern). Report separately.
6. Editorial guardrail: Report the evidence, let the score speak. A product scoring ${product.composite}/100 doesn't need editorial cheerleading or condemnation.
7. If a platform disclosure is listed above, it MUST appear in the report.
8. European brand evidence asymmetry: If this is a European-manufactured brand (Miele, BSH, Liebherr), note that lawsuit/complaint evidence is structurally thinner due to lower US volume and no EU class actions.

SCORED EVIDENCE:
${sourceBlock}

REPORT-ONLY EVIDENCE:
${reportOnlyBlock || '(none)'}

BOTTOM LINE FROM CURATION:
${curationData.bottom_line}

Produce the investigator report in this exact format:

## ${product.name} — Investigator Analysis
**Locked Score: ${product.composite}/100 — Tier ${product.tier} (${product.tierLabel})**

### Score Decomposition
| Axis | Score | Weight | Assessment |
|------|-------|--------|------------|
| Quality | [score] | 0.30 | [one-sentence assessment citing evidence] |
| Durability | [score] | 0.40 | [one-sentence assessment citing evidence] |
| Performance | [score] | 0.30 | [one-sentence assessment citing evidence] |
| Material Safety | [label] | report only | [one-sentence assessment] |

### Strengths
- **[Strength Name]**: [Specific evidence with source citation]
- **[Strength Name]**: [Specific evidence with source citation]

### Deficiencies
- **[Deficiency Name]**: [Specific evidence with source citation]
- **[Deficiency Name]**: [Specific evidence with source citation]

### What You Should Know
[2-3 paragraphs for a homebuyer. Plain English. No jargon without explanation. What matters about this product for someone putting it in their home.]

### Platform Disclosure
[If applicable — mandatory disclosure about shared manufacturing platforms]

### Corporate Outlook
[Outlook label and rationale]

### Repair Economics
[Most common failure mode, parts cost, total repair cost, whether repair is cost-justified]

### Score Justification
[2-3 sentences explaining why this product earned this specific score]`;
}

// ============================================================================
// API CALL
// ============================================================================

async function callSonnet(prompt) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`API error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  return data.content.map(c => c.text || '').join('');
}

// ============================================================================
// MAIN
// ============================================================================

async function runInvestigator() {
  console.log('='.repeat(70));
  console.log('REFRIGERATOR INVESTIGATOR BOT — Built-In Only');
  console.log(`Model: ${MODEL}`);
  console.log(`Curation dir: ${CURATION_DIR}`);
  console.log('='.repeat(70));
  console.log();

  // Verify curation files exist
  for (const product of PRODUCTS) {
    const filePath = path.join(CURATION_DIR, product.file);
    if (!fs.existsSync(filePath)) {
      console.error(`ERROR: Missing curation file: ${filePath}`);
      process.exit(1);
    }
  }
  console.log(`✅ All 6 curation files found\n`);

  const results = [];

  for (const product of PRODUCTS) {
    console.log(`--- ${product.name} (${product.composite}/100) ---`);
    const startTime = Date.now();

    // Read curation file
    const curationPath = path.join(CURATION_DIR, product.file);
    const curationData = JSON.parse(fs.readFileSync(curationPath, 'utf8'));

    // Build prompt and call API
    const prompt = buildInvestigatorPrompt(product, curationData);
    console.log(`  Calling Sonnet (${prompt.length} chars)...`);

    const report = await callSonnet(prompt);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`  ✅ Got response (${report.length} chars, ${elapsed}s)`);

    // Save individual report
    const outputPath = path.join(OUTPUT_DIR, product.output);
    fs.writeFileSync(outputPath, report);
    console.log(`  📄 Saved: ${product.output}`);

    results.push({
      name: product.name,
      composite: product.composite,
      tier: product.tier,
      tierLabel: product.tierLabel,
      axisScores: product.axisScores,
      outlook: product.outlook,
      reportFile: product.output,
      reportLength: report.length,
      elapsed: parseFloat(elapsed)
    });

    // Rate limit pause between calls
    if (PRODUCTS.indexOf(product) < PRODUCTS.length - 1) {
      console.log('  ⏳ Pausing 2s...\n');
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  // Build summary
  console.log('\n' + '='.repeat(70));
  console.log('BUILDING SUMMARY');
  console.log('='.repeat(70));

  let summary = `# Refrigerator Investigator Summary — Built-In Only\n`;
  summary += `**Generated:** ${new Date().toISOString()}\n`;
  summary += `**Model:** ${MODEL}\n`;
  summary += `**Category:** Refrigerators (Built-In Only)\n`;
  summary += `**Axis Weights:** Q=0.30, D=0.40, P=0.30\n\n`;

  summary += `## Calibration Scores (v2 — Post Deep Dive Corrections)\n\n`;
  summary += `| Product | Composite | Tier | Quality | Durability | Performance | Outlook |\n`;
  summary += `|---------|-----------|------|---------|------------|-------------|----------|\n`;
  for (const r of results) {
    summary += `| ${r.name} | ${r.composite} | ${r.tier} (${r.tierLabel}) | ${r.axisScores.quality} | ${r.axisScores.durability} | ${r.axisScores.performance} | ${r.outlook} |\n`;
  }

  summary += `\n## Mandatory Platform Disclosures\n\n`;
  summary += `- **BSH Turkish Factory:** Miele, Thermador, Gaggenau, and Bosch Benchmark built-in refrigeration manufactured in same BSH factory in Turkey. Yale confirmed.\n`;
  summary += `- **Samsung/Dacor:** Complete component convergence. Every part carries Samsung DA97/DA94 prefix.\n`;
  summary += `- **GE/Monogram:** Same Selmer, TN factory as Café and Profile.\n`;
  summary += `- **Whirlpool/JennAir:** Shared platform. Start device W10448874 cross-applies across portfolio.\n\n`;

  summary += `## Deep Dive Corrections (v1 → v2)\n\n`;
  summary += `- **Bosch Benchmark 80→79 (-1):** Warranty confirmed 1yr full (not 2yr). iService5 diagnostic restricts service.\n`;
  summary += `- **JennAir 66→70 (+4):** Sealed system warranty 12yr (not 5-10yr). Class action N/A to columns.\n`;
  summary += `- **Dacor 53→56 (+3):** Stainless interior confirmed. No ice maker. 15yr compressor parts warranty.\n\n`;

  summary += `## Individual Reports\n\n`;
  for (const r of results) {
    summary += `- \`${r.reportFile}\` (${r.reportLength} chars, ${r.elapsed}s)\n`;
  }

  summary += `\n## European Brand Evidence Asymmetry\n`;
  summary += `BSH products (Thermador, Bosch Benchmark, Gaggenau) and Miele have structurally thinner US lawsuit/complaint evidence due to lower install base and no EU class actions. Reports disclose this. No score impact.\n`;

  const summaryPath = path.join(OUTPUT_DIR, 'investigator_refrigerator_summary.md');
  fs.writeFileSync(summaryPath, summary);
  console.log(`\n📄 Summary saved: investigator_refrigerator_summary.md`);

  console.log('\n' + '='.repeat(70));
  console.log('✅ ALL 6 INVESTIGATOR REPORTS COMPLETE');
  console.log('='.repeat(70));
}

runInvestigator().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
