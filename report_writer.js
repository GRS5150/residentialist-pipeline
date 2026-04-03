/**
 * THE RESIDENTIALIST — Report Writer (Step 4)
 * Calls Claude Sonnet to generate editorial content.
 * Reads ALL sources (score + report_only) for full context.
 * Does NOT affect the score — purely editorial.
 */

const Anthropic = require('@anthropic-ai/sdk');

let anthropic = null;

function getClient() {
  if (!anthropic) {
    anthropic = new Anthropic();
  }
  return anthropic;
}

/**
 * Format all sources (score + report_only) for the editorial prompt.
 */
function formatAllSources(sources) {
  if (!sources || sources.length === 0) return 'No sources available.';

  return sources
    .filter(s => s.classification !== 'quarantine') // exclude quarantined
    .map(s => {
      let entry = `[${s.id}] ${s.source_name} (${s.classification}, pool ${s.pool})`;
      if (s.snippet) entry += `\n  ${s.snippet}`;
      return entry;
    }).join('\n\n');
}

/**
 * Format verified specs.
 */
function formatSpecs(specs) {
  if (!specs || typeof specs !== 'object') return 'No verified specs available.';
  return Object.entries(specs).map(([key, value]) => {
    const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    if (typeof value === 'object' && value !== null) return `${label}: ${JSON.stringify(value)}`;
    return `${label}: ${value}`;
  }).join('\n');
}

/**
 * Format manufacturer data.
 */
function formatManufacturer(manufacturer) {
  if (!manufacturer) return { warranty: 'Not available.', service: 'Not available.' };

  let warranty = 'Not available.';
  if (manufacturer.warranty_program) {
    warranty = typeof manufacturer.warranty_program === 'object'
      ? JSON.stringify(manufacturer.warranty_program, null, 2)
      : String(manufacturer.warranty_program);
  }

  let service = 'Not available.';
  if (manufacturer.service_network) {
    service = typeof manufacturer.service_network === 'object'
      ? JSON.stringify(manufacturer.service_network, null, 2)
      : String(manufacturer.service_network);
  }

  return { warranty, service };
}

/**
 * Format category pain points for context.
 */
function getPainPoints(category) {
  const { getPainPoints: getConfigPainPoints } = require('./config_loader');
  const points = getConfigPainPoints(category);
  if (points.length > 0) return points.join('\n- ');

  // Fallback
  return 'No category-specific pain points configured.';
}

/**
 * Build the report writer prompt.
 */
function buildPrompt(curation, manufacturer, auditResult, scoreResult) {
  const category = scoreResult.category || 'windows';
  const productName = curation.product_name || curation.product || 'Unknown Product';
  const operationType = curation.operation_type || (category === 'windows' ? 'DH' : '');
  const productLabel = operationType ? `${productName} (${operationType})` : productName;
  const allSources = formatAllSources(curation.sources);
  const specs = formatSpecs(curation.verified_specs);
  const mfg = formatManufacturer(manufacturer);
  const painPoints = getPainPoints(category);

  // Include red flags
  let redFlagSection = '';
  if (curation.red_flags && curation.red_flags.length > 0) {
    redFlagSection = '\nDOCUMENTED RED FLAGS:\n' +
      curation.red_flags.map(f => `- [${f.type}] ${f.description}\n  Relevance: ${f.relevance_to_250_series || 'Unknown'}`).join('\n');
  }

  return `You are writing a product report for The Residentialist, an independent rating platform for residential building products.

PRODUCT: ${productLabel}
SCORE: ${scoreResult.display_score}/100 — ${scoreResult.product_label}
QUALITY: ${auditResult.quality_approved}/10 | DURABILITY: ${auditResult.durability_approved}/10 | PERFORMANCE: ${auditResult.performance_approved}/10

ALL EVIDENCE (including report-only context):
${allSources}

MANUFACTURER WARRANTY:
${mfg.warranty}

MANUFACTURER SERVICE REPUTATION:
${mfg.service}

VERIFIED SPECS:
${specs}
${redFlagSection}

CATEGORY PAIN POINTS (for reference):
- ${painPoints}

Generate the following in JSON format:

{
  "product_summary": "2-3 sentence overview of this product — what it is, who it's for, and the key takeaway. Write for a homeowner, not an engineer.",
  
  "warranty_reality": {
    "beats_expectations": ["things about the warranty that are better than industry standard"],
    "underperforms_expectations": ["things that fall short of what buyers would assume"],
    "surprises": ["hidden terms, gotchas, unusual conditions"]
  },
  
  "buyer_considerations": [
    {
      "text": "Plain language, max 200 chars. Must be something that costs unexpected money, creates a time-sensitive risk, or contradicts a reasonable expectation.",
      "gate": 1
    }
  ],
  
  "serviceability_summary": "One line about the practical reality of getting service and parts for this product",
  
  "price_positioning": "MUST be one of exactly these phrases: 'Strong value for the category' OR 'Priced mid-range for [tier] [category]' OR 'Premium pricing, justified by materials and construction' OR 'Premium pricing, partially justified' OR 'Overpriced relative to performance' OR 'Budget option with expected trade-offs'",
  
  "material_health_summary": "Brief assessment of material safety based on certifications, frame material, and any chemical concerns"
}

RULES:
- Buyer considerations: maximum 3 items. Each must pass the Consumer Impact Test (unexpected cost, time-sensitive risk, or contradicts reasonable expectation).
- Price positioning: use ONLY one of the six approved phrases listed above. Do not invent new phrases.
- Warranty Reality: be specific. "20-year glass warranty" is not a surprise. "Non-transferable warranty that dies when you sell the house" IS a surprise.
- Write for a homeowner building or renovating a home, not for a contractor.
- Keep the product summary factual and balanced. Do not oversell or undersell.`;
}

/**
 * Parse JSON from LLM response.
 */
function parseJSON(text) {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
  else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
  if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
  cleaned = cleaned.trim();

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    try {
      const { jsonrepair } = require('jsonrepair');
      return JSON.parse(jsonrepair(cleaned));
    } catch (e2) {
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) {
        try { return JSON.parse(match[0]); } catch (e3) { /* fall through */ }
      }
      throw new Error(`Failed to parse Report Writer response as JSON: ${e.message}`);
    }
  }
}

/**
 * Validate price positioning against approved phrases.
 */
const APPROVED_PHRASES = [
  'Strong value for the category',
  'Budget option with expected trade-offs',
  'Overpriced relative to performance',
  'Premium pricing, justified by materials and construction',
  'Premium pricing, partially justified',
];
// Also allow "Priced mid-range for [tier] [category]" pattern
function validatePricePositioning(phrase) {
  if (APPROVED_PHRASES.includes(phrase)) return phrase;
  if (/^Priced mid-range for .+ .+$/.test(phrase)) return phrase;
  // Default fallback
  console.warn(`[REPORT_WRITER] Price positioning "${phrase}" not in approved list, defaulting`);
  return 'Priced mid-range for this category';
}

/**
 * Generate editorial report content.
 * @param {object} curation - Parsed curation file
 * @param {object|null} manufacturer - Parsed manufacturer file
 * @param {object} auditResult - Haiku audit output
 * @param {object} scoreResult - Score calculator output
 * @returns {object} Report content
 */
async function generate(curation, manufacturer, auditResult, scoreResult) {
  const client = getClient();
  const prompt = buildPrompt(curation, manufacturer, auditResult, scoreResult);
  const productName = curation.product_name || curation.product || 'Unknown';

  console.log(`[REPORT_WRITER] Generating editorial report for ${productName}...`);

  let result = null;
  let attempts = 0;
  const maxAttempts = 2;

  while (attempts < maxAttempts && !result) {
    attempts++;
    try {
      const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 3000,
        messages: [{ role: 'user', content: prompt }]
      });

      const text = response.content[0].text;
      result = parseJSON(text);

      console.log(`[REPORT_WRITER] Report generated (attempt ${attempts})`);

      // Validate required fields
      if (!result.product_summary || !result.warranty_reality || !result.buyer_considerations) {
        console.warn('[REPORT_WRITER] WARNING: Missing required fields, retrying...');
        result = null;
      }
    } catch (err) {
      console.error(`[REPORT_WRITER] Attempt ${attempts} failed: ${err.message}`);
      if (attempts >= maxAttempts) {
        // Return minimal fallback
        console.warn('[REPORT_WRITER] Report generation failed — returning minimal fallback');
        result = {
          product_summary: `${productName} scored ${scoreResult.display_score}/100 (${scoreResult.product_label}).`,
          warranty_reality: { beats_expectations: [], underperforms_expectations: [], surprises: [] },
          buyer_considerations: [],
          serviceability_summary: 'Service data not available',
          price_positioning: 'Priced mid-range for this category',
          material_health_summary: 'Material health data not available'
        };
      }
    }
  }

  // Validate and fix price positioning
  if (result.price_positioning) {
    result.price_positioning = validatePricePositioning(result.price_positioning);
  }

  // Enforce buyer consideration limits
  if (result.buyer_considerations && result.buyer_considerations.length > 3) {
    result.buyer_considerations = result.buyer_considerations.slice(0, 3);
  }

  // Add metadata
  result.product_name = productName;
  result.generated_at = new Date().toISOString();

  return result;
}

module.exports = { generate };
