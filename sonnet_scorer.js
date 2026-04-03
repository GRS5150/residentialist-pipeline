/**
 * THE RESIDENTIALIST — Sonnet Scorer (Step 1) — Tier Classification v1
 * Calls Claude Sonnet to CLASSIFY a product into a tier (1-5).
 * No axis scores. No LLM math. Just classification + spec extraction.
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
 * Format sources by pool for the classification prompt.
 */
function formatSourcesByPool(sources) {
  const scoreSources = sources.filter(s => s.classification === 'score');

  const expert = scoreSources.filter(s => s.pool === 'S' || s.pool === 'A');
  const review = scoreSources.filter(s => s.pool === 'B');
  const forum = scoreSources.filter(s => s.pool === 'C');

  const formatGroup = (group) => {
    if (group.length === 0) return 'None available.';
    return group.map(s => {
      let entry = `[${s.id}] ${s.source_name}`;
      if (s.url) entry += `\n  URL: ${s.url}`;
      if (s.platform) entry += `\n  Platform: ${s.platform}`;
      if (s.snippet) entry += `\n  Evidence: ${s.snippet}`;
      if (s.topics && s.topics.length) entry += `\n  Topics: ${s.topics.join(', ')}`;
      return entry;
    }).join('\n\n');
  };

  return {
    expert: formatGroup(expert),
    review: formatGroup(review),
    forum: formatGroup(forum),
    totalScoreSources: scoreSources.length
  };
}

/**
 * Format verified specs for the prompt.
 */
function formatVerifiedSpecs(specs) {
  if (!specs || typeof specs !== 'object') return 'No verified specs available.';
  return Object.entries(specs).map(([key, value]) => {
    const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    if (typeof value === 'object' && value !== null) return `${label}: ${JSON.stringify(value)}`;
    return `${label}: ${value}`;
  }).join('\n');
}

/**
 * Format manufacturer data for the prompt.
 */
function formatManufacturer(manufacturer) {
  if (!manufacturer) return { warranty: 'Not available.', service: 'Not available.' };

  let warranty = 'Not available.';
  if (manufacturer.warranty_program) {
    const wp = manufacturer.warranty_program;
    const parts = [];
    if (wp.glass_warranty) parts.push(`Glass: ${wp.glass_warranty}`);
    if (wp.frame_warranty) parts.push(`Frame: ${wp.frame_warranty}`);
    if (wp.hardware_warranty) parts.push(`Hardware: ${wp.hardware_warranty}`);
    if (wp.transferable !== undefined) parts.push(`Transferable: ${wp.transferable ? 'Yes' : 'No'}`);
    if (wp.labor_coverage) parts.push(`Labor: ${wp.labor_coverage}`);
    if (wp.summary) parts.push(`Summary: ${wp.summary}`);
    warranty = parts.join('\n') || JSON.stringify(wp, null, 2);
  }

  let service = 'Not available.';
  if (manufacturer.service_network) {
    const sn = manufacturer.service_network;
    const parts = [];
    if (sn.coverage) parts.push(`Coverage: ${sn.coverage}`);
    if (sn.dealer_network) parts.push(`Dealer network: ${sn.dealer_network}`);
    if (sn.response_time) parts.push(`Response time: ${sn.response_time}`);
    if (sn.summary) parts.push(`Summary: ${sn.summary}`);
    service = parts.join('\n') || JSON.stringify(sn, null, 2);
  }

  return { warranty, service };
}

/**
 * Build the tier classification prompt for Claude Sonnet.
 */
function buildPrompt(curation, manufacturer, category) {
  const { loadConfig, buildAnchorPromptText } = require('./config_loader');
  const config = loadConfig(category);

  const productName = curation.product_name || curation.product || 'Unknown Product';
  const operationType = curation.operation_type || (category === 'windows' ? 'DH' : 'N/A');
  const sources = formatSourcesByPool(curation.sources || []);
  const specs = formatVerifiedSpecs(curation.verified_specs);
  const mfg = formatManufacturer(manufacturer);

  // Include red flags
  let redFlagSection = '';
  if (curation.red_flags && curation.red_flags.length > 0) {
    const directFlags = curation.red_flags.filter(f =>
      !f.relevance_to_250_series?.toLowerCase().includes('indirect')
    );
    if (directFlags.length > 0) {
      redFlagSection = `\nDOCUMENTED RED FLAGS (directly relevant to this product):\n` +
        directFlags.map(f => `- [${f.type}] ${f.description}`).join('\n');
    }
  }

  // Build anchor text from config
  const anchorText = buildAnchorPromptText(config);

  // Build category-specific consideration text
  let considerationText;
  if (category === 'countertops') {
    considerationText = `Consider:
- Where does the weight of professional/fabricator opinion place this product?
- What material class is it? (sintered stone, engineered quartz, natural granite, solid surface, laminate)
- How does the warranty compare to the anchor products in each tier?
- Are there corroborated field issues (3+ independent reports of the same problem)?
- How do the verified specs (hardness, heat resistance, certifications) compare to the anchors?
- Is manufacturing domestic or multi-source? Is the company financially stable?`;
  } else {
    considerationText = `Consider:
- Where does the weight of professional opinion place this product?
- What material class is the frame? (aluminum-clad wood > fiberglass > composite > vinyl)
- How does the warranty compare to the anchor products in each tier?
- Are there corroborated field issues (3+ independent reports of the same problem)?
- How do the verified specs compare to the anchors?`;
  }

  // Build spec_highlights format based on category
  let specHighlightsExample;
  if (category === 'countertops') {
    specHighlightsExample = `  "spec_highlights": {
    "mohs_hardness": "7",
    "heat_resistance_f": "400",
    "water_absorption_pct": "0.02",
    "warranty_years": "999",
    "warranty_transferable": true,
    "greenguard_gold": true,
    "nsf_51": true,
    "requires_sealing": false,
    "domestic_manufacturing": true,
    "material_class": "engineered_quartz_premium"
  }`;
  } else {
    specHighlightsExample = `  "spec_highlights": {
    "u_factor": "0.27",
    "air_infiltration": "0.20",
    "dp_rating": "DP50",
    "warranty_transferable": true,
    "warranty_glass_years": 20,
    "warranty_labor_years": 2,
    "frame_material": "fiberglass"
  }`;
  }

  return `You are classifying a residential building product for The Residentialist rating platform.

PRODUCT: ${productName}
CATEGORY: ${category}
${category === 'windows' ? `OPERATION TYPE: ${operationType}` : ''}

CURATED EVIDENCE (only sources classified as "score"):

EXPERT SOURCES:
${sources.expert}

REVIEW SOURCES:
${sources.review}

FORUM SOURCES:
${sources.forum}

VERIFIED SPECS:
${specs}

WARRANTY TERMS:
${mfg.warranty}

MANUFACTURER SERVICE REPUTATION:
${mfg.service}
${redFlagSection}

REFERENCE ANCHORS — these are products with documented expert consensus. Use them to calibrate your classification:

${anchorText}

YOUR TASK: Based on the evidence provided, classify this product into ONE tier (1-5). This is about the PRODUCT LINE's quality level${category === 'windows' ? ', not the specific operation type' : ''}.

${considerationText}

CRITICAL RULES:
- Only use evidence about THIS SPECIFIC PRODUCT (${productName}), not other products from the same manufacturer
- If evidence is sparse but what exists is positive, classify based on available evidence, don't penalize for scarcity
- If expert consensus is strong (3+ credentialed sources agree), weight that heavily
- If experts and forum owners disagree, favor experts but note the disagreement
- A product that functions correctly and meets code with no documented defects is AT LEAST Tier 4
- CRITICAL: Lawsuits, class actions, recalls, and legal history do NOT affect tier placement. They are informational context only. Score the product based on its construction, specs, warranty terms, expert consensus, and corroborated field performance — not its legal history.

Respond in this exact JSON format:
{
  "tier": 3,
  "tier_label": "Good",
  "confidence": "high",
  "reasoning": "2-3 sentences explaining why this tier and not the one above or below",
  "closest_anchor": "anchor product name",
  "above_or_below_anchor": "slightly above",
  "key_evidence": ["source 1 finding", "source 2 finding", "source 3 finding"],
${specHighlightsExample},
  "source_flags": [
    {"source": "name", "issue": "This source is about a different product line"}
  ]
}`;
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
      throw new Error(`Failed to parse Sonnet response as JSON: ${e.message}`);
    }
  }
}

/**
 * Classify a product into a tier using Claude Sonnet.
 * @param {object} curation - Parsed curation file
 * @param {object|null} manufacturer - Parsed manufacturer file
 * @param {string} category - Product category (e.g., 'windows')
 * @returns {object} Tier classification result
 */
/**
 * Run a single tier classification call.
 */
async function singleClassify(client, prompt) {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    messages: [{ role: 'user', content: prompt }]
  });
  const text = response.content[0].text;
  const result = parseJSON(text);
  if (!result.tier || !result.tier_label || !result.reasoning) return null;
  return result;
}

/**
 * Normalize spec_highlights types.
 */
function normalizeSpecHighlights(sh) {
  if (!sh) return;
  if (typeof sh.warranty_transferable === 'string') {
    sh.warranty_transferable = sh.warranty_transferable.toLowerCase() === 'true' || sh.warranty_transferable.toLowerCase() === 'yes';
  }
  if (typeof sh.warranty_glass_years === 'string') sh.warranty_glass_years = parseInt(sh.warranty_glass_years) || null;
  if (typeof sh.warranty_labor_years === 'string') sh.warranty_labor_years = parseInt(sh.warranty_labor_years) || null;
  if (typeof sh.dp_rating === 'string') sh.dp_rating = sh.dp_rating.replace(/[^0-9.]/g, '');
  if (typeof sh.u_factor === 'string') {
    const uMatch = sh.u_factor.match(/[\d.]+/);
    if (uMatch) sh.u_factor = uMatch[0];
  }
  if (typeof sh.air_infiltration === 'string') {
    const aiMatch = sh.air_infiltration.match(/[\d.]+/);
    if (aiMatch) sh.air_infiltration = aiMatch[0];
  }
}

const TIER_LABELS = { 1: 'Best in Class', 2: 'Excellent', 3: 'Good', 4: 'Fair', 5: 'Below Standard' };

/**
 * Classify a product into a tier using 3x majority vote.
 * @param {object} curation - Parsed curation file
 * @param {object|null} manufacturer - Parsed manufacturer file
 * @param {string} category - Product category
 * @returns {object} Tier classification result with vote metadata
 */
async function classify(curation, manufacturer, category) {
  const client = getClient();
  const prompt = buildPrompt(curation, manufacturer, category);
  const productName = curation.product_name || curation.product || 'Unknown';
  const scoreSourceCount = (curation.sources || []).filter(s => s.classification === 'score').length;

  console.log(`[SONNET_SCORER] Classifying ${productName} with ${scoreSourceCount} curated score sources (3x majority vote)...`);

  // Run 3 classification calls
  const runs = [];
  for (let i = 1; i <= 3; i++) {
    let result = null;
    let retries = 0;
    while (!result && retries < 2) {
      retries++;
      try {
        result = await singleClassify(client, prompt);
        if (result) {
          console.log(`[SONNET_SCORER]   Run ${i}: Tier ${result.tier} (${result.tier_label}), anchor=${result.closest_anchor}, position=${result.above_or_below_anchor}`);
        } else {
          console.warn(`[SONNET_SCORER]   Run ${i}: Invalid response, retrying...`);
        }
      } catch (err) {
        console.error(`[SONNET_SCORER]   Run ${i} attempt ${retries} failed: ${err.message}`);
        if (retries >= 2) throw err;
      }
    }
    if (result) runs.push(result);
  }

  if (runs.length === 0) {
    throw new Error('All 3 classification runs failed');
  }

  // Determine majority tier
  const tiers = runs.map(r => r.tier);
  const tierCounts = {};
  for (const t of tiers) tierCounts[t] = (tierCounts[t] || 0) + 1;

  let finalTier, votingConfidence, needsManualReview = false;
  const sortedTiers = Object.entries(tierCounts).sort((a, b) => b[1] - a[1]);

  if (runs.length === 3 && sortedTiers[0][1] === 3) {
    // All 3 agree
    finalTier = parseInt(sortedTiers[0][0]);
    votingConfidence = 'high';
    console.log(`[SONNET_SCORER] Vote: 3/3 agree → Tier ${finalTier} (high confidence)`);
  } else if (sortedTiers[0][1] >= 2) {
    // 2 of 3 agree
    finalTier = parseInt(sortedTiers[0][0]);
    votingConfidence = 'medium';
    console.log(`[SONNET_SCORER] Vote: 2/3 majority → Tier ${finalTier} (medium confidence)`);
  } else {
    // All different — take the middle tier
    const sorted = tiers.sort((a, b) => a - b);
    finalTier = sorted.length >= 2 ? sorted[1] : sorted[0]; // middle value
    votingConfidence = 'low';
    needsManualReview = true;
    console.log(`[SONNET_SCORER] Vote: 3-way split (${tiers.join(',')}) → middle Tier ${finalTier} (low confidence, flagged for review)`);
  }

  // Use the run that matches the winning tier as the base result (prefer first match)
  let result = runs.find(r => r.tier === finalTier) || runs[0];

  // Override tier and confidence with voting results
  result.tier = finalTier;
  result.tier_label = TIER_LABELS[finalTier] || 'Unknown';
  result.confidence = votingConfidence;

  // Add voting metadata
  result.voting = {
    runs: runs.map((r, i) => ({ run: i + 1, tier: r.tier, tier_label: r.tier_label, anchor: r.closest_anchor, position: r.above_or_below_anchor })),
    tiers_voted: tiers,
    tier_counts: tierCounts,
    unanimous: sortedTiers[0][1] === 3,
    needs_manual_review: needsManualReview
  };

  // Normalize spec highlights
  normalizeSpecHighlights(result.spec_highlights);

  // Add metadata
  result.product_name = productName;
  result.category = category;
  result.operation_type = curation.operation_type || 'double_hung';
  result.score_sources_used = scoreSourceCount;
  result.classified_at = new Date().toISOString();

  return result;
}

// Keep backward-compatible `score` export that wraps classify
async function score(curation, manufacturer, category) {
  return classify(curation, manufacturer, category);
}

module.exports = { classify, score };
