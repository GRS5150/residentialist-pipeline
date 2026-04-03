/**
 * THE RESIDENTIALIST — Sonnet Structurer (v2)
 * Takes raw Perplexity deep dive report and structures it into JSON via Claude Sonnet.
 * Applies auto-classification rules.
 * 
 * v2 improvements:
 *   - Requests JSON inside ```json code fences for reliable extraction
 *   - Uses jsonrepair as fallback for malformed JSON
 *   - Falls back to two-call split strategy for very large reports
 *   - Increased max_tokens to 16000 for large source arrays
 * 
 * Usage:
 *   const { structureDeepDive } = require('./sonnet_structurer');
 *   const structured = await structureDeepDive(rawReport, productName, operationType);
 */

const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

let jsonrepair;
try {
  jsonrepair = require('jsonrepair').jsonrepair;
} catch (e) {
  // jsonrepair not installed — will try without it
  jsonrepair = null;
}

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Prompt Templates ──────────────────────────────────────────────────────────

const STRUCTURING_PROMPT = `You are structuring a product deep dive report for the Residentialist scoring pipeline. Parse the raw report and produce a JSON object.

CRITICAL: Wrap your entire JSON output in \`\`\`json code fences. Do not include any text before the opening fence or after the closing fence.

For each source found in the report, create an entry with:
- id: sequential (SRC-001, SRC-002, etc.)
- source_name: name of the source
- url: direct URL (if available, otherwise "not_available")
- platform: reddit / houzz / gba / fhb / youtube / trade_pub / review_site / bbb / other
- column: expert / review / forum
- snippet: 50 words max summarizing what this source says about the product
- pool: estimate the source pool (S / A / B / C) based on these rules:
  - Pool S (1.50x): Known expert comparison sources with structured scoring
  - Pool A (1.00x): Credentialed professionals, trade publications, independent testing
  - Pool B (0.75x): Published reviews, dealer content, sponsored but knowledgeable sources
  - Pool C (0.40x): Individual forum posts, Reddit comments, Houzz threads, BBB complaints
- classification: score / report_only / quarantine
- classification_reason: brief explanation
- topics: array of relevant topics (quality, durability, performance, warranty, service, value, legal, specs)

Auto-classification rules:
- Expert source with clear product opinion → "score"
- Published review with specs or testing data → "score"
- Forum post describing physical product defect with corroborating pattern → "score"
- Forum post about sales process, dealer experience → "report_only"
- Single forum complaint with no corroboration → "quarantine"
- Source about a different product line → "quarantine"
- Source about installation quality, not product quality → "report_only"
- Manufacturer marketing content → "quarantine"
- Legal/lawsuit information, class actions, settlements, recalls → ALWAYS "report_only" regardless of other factors. Legal sources must never be classified as "score".

Also extract:
- consensus_matrix: array of topics with expert/review/forum columns and agreement level
- warranty_reality: object with beats_expectations, underperforms_expectations, and surprises arrays
- verified_specs: object with u_factor, shgc, air_infiltration, frame_material, glass, dp_rating, stc, etc.
- red_flags: array of any lawsuits, recalls, FTC actions, or stability concerns
- bottom_line: the synthesis summary from the deep dive

Remember: wrap everything in \`\`\`json code fences.`;

const SOURCES_ONLY_PROMPT = `You are extracting structured source data from a product deep dive report. Parse ONLY the sources and return a JSON object with a single key "sources" containing an array.

CRITICAL: Wrap your entire JSON output in \`\`\`json code fences.

For each source found in the report, create an entry with:
- id: sequential (SRC-001, SRC-002, etc.)
- source_name, url, platform, column, snippet (50 words max), pool (S/A/B/C), classification (score/report_only/quarantine), classification_reason, topics

Pool rules: S=expert comparison, A=credentialed professional, B=published review, C=forum post.
Classification rules: expert opinion→score, review with data→score, corroborated defect→score, sales/service→report_only, single complaint→quarantine, different product→quarantine, marketing→quarantine, lawsuits/class actions/settlements/recalls→ALWAYS report_only.

Return ONLY {"sources": [...]} wrapped in \`\`\`json code fences.`;

const ANALYSIS_ONLY_PROMPT = `You are extracting analysis data from a product deep dive report. Do NOT extract individual sources — only the aggregate analysis.

CRITICAL: Wrap your entire JSON output in \`\`\`json code fences.

Extract:
- consensus_matrix: array of {topic, experts, reviews, forums, agreement} for key product attributes
- warranty_reality: {beats_expectations: [...], underperforms_expectations: [...], surprises: [...]}
- verified_specs: {u_factor, shgc, air_infiltration, frame_material, glass, dp_rating, stc, etc.}
- red_flags: array of strings for lawsuits, recalls, FTC actions, stability concerns
- bottom_line: single string synthesis summary

Return ONLY the JSON object with these five keys, wrapped in \`\`\`json code fences.`;

// ─── JSON Parsing with Repair ──────────────────────────────────────────────────

/**
 * Extract and parse JSON from a Sonnet response, with multiple fallback strategies.
 */
function parseJsonResponse(responseText) {
  // Strategy 1: Extract from ```json code fences
  const fenceMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
  if (fenceMatch) {
    try {
      return JSON.parse(fenceMatch[1]);
    } catch (e) {
      // Try jsonrepair on fenced content
      if (jsonrepair) {
        try {
          const repaired = jsonrepair(fenceMatch[1]);
          console.log('[SONNET] JSON repaired from code fence content');
          return JSON.parse(repaired);
        } catch (e2) { /* fall through */ }
      }
    }
  }

  // Strategy 2: Direct parse
  try {
    return JSON.parse(responseText);
  } catch (e) { /* fall through */ }

  // Strategy 3: Extract JSON object boundaries
  const start = responseText.indexOf('{');
  const end = responseText.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    const extracted = responseText.substring(start, end + 1);
    try {
      return JSON.parse(extracted);
    } catch (e) {
      // Strategy 4: jsonrepair on extracted content
      if (jsonrepair) {
        try {
          const repaired = jsonrepair(extracted);
          console.log('[SONNET] JSON repaired from extracted boundaries');
          return JSON.parse(repaired);
        } catch (e2) { /* fall through */ }
      }
    }
  }

  // Strategy 5: jsonrepair on full response
  if (jsonrepair) {
    try {
      const repaired = jsonrepair(responseText);
      console.log('[SONNET] JSON repaired from full response');
      return JSON.parse(repaired);
    } catch (e) { /* fall through */ }
  }

  throw new Error(`Failed to parse JSON from Sonnet response (${responseText.length} chars). First 300: ${responseText.substring(0, 300)}`);
}

// ─── Single-Call Structuring ───────────────────────────────────────────────────

async function structureSingleCall(rawReport, productName, operationType) {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 16000,
    messages: [
      {
        role: 'user',
        content: `${STRUCTURING_PROMPT}\n\nProduct: ${productName} ${operationType}\n\nRAW DEEP DIVE REPORT:\n${rawReport}`
      }
    ]
  });

  const responseText = response.content[0].text;
  const structured = parseJsonResponse(responseText);

  return {
    structured,
    inputTokens: response.usage?.input_tokens || 0,
    outputTokens: response.usage?.output_tokens || 0
  };
}

// ─── Two-Call Split Structuring ────────────────────────────────────────────────

async function structureTwoCalls(rawReport, productName, operationType) {
  console.log('[SONNET] Falling back to two-call split strategy...');

  // Call 1: Sources only
  console.log('[SONNET] Call 1/2: Extracting sources...');
  const sourcesResponse = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 12000,
    messages: [
      {
        role: 'user',
        content: `${SOURCES_ONLY_PROMPT}\n\nProduct: ${productName} ${operationType}\n\nRAW DEEP DIVE REPORT:\n${rawReport}`
      }
    ]
  });

  const sourcesData = parseJsonResponse(sourcesResponse.content[0].text);
  console.log(`[SONNET] Call 1/2: ${sourcesData.sources?.length || 0} sources extracted`);

  // Call 2: Analysis only
  console.log('[SONNET] Call 2/2: Extracting analysis...');
  const analysisResponse = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8000,
    messages: [
      {
        role: 'user',
        content: `${ANALYSIS_ONLY_PROMPT}\n\nProduct: ${productName} ${operationType}\n\nRAW DEEP DIVE REPORT:\n${rawReport}`
      }
    ]
  });

  const analysisData = parseJsonResponse(analysisResponse.content[0].text);
  console.log(`[SONNET] Call 2/2: Analysis extracted (${analysisData.consensus_matrix?.length || 0} consensus topics)`);

  // Merge results
  const structured = {
    sources: sourcesData.sources || [],
    consensus_matrix: analysisData.consensus_matrix || [],
    warranty_reality: analysisData.warranty_reality || {},
    verified_specs: analysisData.verified_specs || {},
    red_flags: analysisData.red_flags || [],
    bottom_line: analysisData.bottom_line || ''
  };

  return {
    structured,
    inputTokens: (sourcesResponse.usage?.input_tokens || 0) + (analysisResponse.usage?.input_tokens || 0),
    outputTokens: (sourcesResponse.usage?.output_tokens || 0) + (analysisResponse.usage?.output_tokens || 0),
    splitStrategy: true
  };
}

// ─── Main Entry Point ──────────────────────────────────────────────────────────

/**
 * Structure a raw deep dive report into scored JSON.
 */
async function structureDeepDive(rawReport, productName, operationType) {
  const slug = productName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  const manufacturerSlug = detectManufacturerFromName(productName);

  console.log(`[SONNET] Structuring deep dive for: ${productName}`);
  const startTime = Date.now();

  let result;

  // Try single-call first
  try {
    result = await structureSingleCall(rawReport, productName, operationType);
    console.log('[SONNET] Single-call structuring succeeded');
  } catch (singleError) {
    console.warn(`[SONNET] Single-call failed: ${singleError.message}`);
    // Fall back to two-call split
    try {
      result = await structureTwoCalls(rawReport, productName, operationType);
      console.log('[SONNET] Two-call split succeeded');
    } catch (splitError) {
      throw new Error(`Both single-call and two-call strategies failed. Single: ${singleError.message}. Split: ${splitError.message}`);
    }
  }

  const duration = Date.now() - startTime;
  const structured = result.structured;

  // Enrich with metadata
  structured.product_slug = slug;
  structured.product_name = productName;
  structured.manufacturer_slug = manufacturerSlug;
  structured.operation_type = operationType;
  structured.deep_dive_date = new Date().toISOString().split('T')[0];
  structured.structuring_duration_ms = duration;
  structured.structuring_model = 'claude-sonnet-4-6';
  if (result.splitStrategy) structured.structuring_strategy = 'two_call_split';

  // Force-reclassify legal sources as report_only (post-processing guard)
  const LEGAL_KEYWORDS = /\b(lawsuit|class.action|settlement|litigation|class action|recall|sued|plaintiff|defendant|court.finding|legal.action)\b/i;
  if (structured.sources && Array.isArray(structured.sources)) {
    for (const src of structured.sources) {
      if (src.classification === 'score') {
        const text = (src.source_name || '') + ' ' + (src.snippet || '') + ' ' + (src.classification_reason || '');
        if (LEGAL_KEYWORDS.test(text)) {
          src.classification = 'report_only';
          src.classification_reason = (src.classification_reason || '') + ' [auto-reclassified: legal/lawsuit sources are always report_only]';
        }
      }
    }
  }

  // Compute auto-classification summary
  if (structured.sources && Array.isArray(structured.sources)) {
    const summary = { total: structured.sources.length, score: 0, report_only: 0, quarantine: 0, uncertain: 0 };
    for (const src of structured.sources) {
      if (src.classification === 'score') summary.score++;
      else if (src.classification === 'report_only') summary.report_only++;
      else if (src.classification === 'quarantine') summary.quarantine++;
      else summary.uncertain++;
    }
    structured.auto_classification_summary = summary;
  }

  // Add curation metadata
  structured.curation_status = 'staged';
  structured.curation_date = null;
  structured.human_overrides = [];

  console.log(`[SONNET] Structuring complete in ${Math.round(duration / 1000)}s. ` +
    `${structured.auto_classification_summary?.total || 0} sources found ` +
    `(${structured.auto_classification_summary?.score || 0} score, ` +
    `${structured.auto_classification_summary?.report_only || 0} report_only, ` +
    `${structured.auto_classification_summary?.quarantine || 0} quarantine)`);

  // Estimate cost
  const inputTokens = result.inputTokens;
  const outputTokens = result.outputTokens;
  structured.structuring_cost_estimate =
    (inputTokens / 1000) * 0.003 + (outputTokens / 1000) * 0.015;

  return structured;
}

/**
 * Simple manufacturer detection from product name.
 * Checks both windows and countertops manufacturer maps.
 */
function detectManufacturerFromName(productName) {
  const name = productName.toLowerCase();

  // Combined map: windows + countertops
  const map = {
    // Windows
    'andersen': 'andersen', 'pella': 'pella', 'marvin': 'marvin',
    'milgard': 'milgard', 'jeld': 'jeld_wen', 'kolbe': 'kolbe',
    'windsor': 'windsor', 'simonton': 'simonton', 'reliabilt': 'reliabilt',
    'loewen': 'loewen', 'alpen': 'alpen', 'sierra': 'sierra_pacific',
    'provia': 'provia', 'cgi': 'cgi', 'window world': 'window_world',
    'ply gem': 'ply_gem',
    // Countertops
    'cambria': 'cambria', 'dekton': 'cosentino', 'silestone': 'cosentino',
    'caesarstone': 'caesarstone', 'msi': 'msi', 'ubatuba': 'natural_stone',
    'white ice': 'natural_stone', 'corian': 'dupont', 'formica': 'formica'
  };
  for (const [key, slug] of Object.entries(map)) {
    if (name.includes(key)) return slug;
  }
  return name.split(' ')[0].replace(/[^a-z0-9]/g, '_');
}

module.exports = { structureDeepDive };
