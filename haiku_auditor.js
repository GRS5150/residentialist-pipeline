/**
 * THE RESIDENTIALIST — Haiku Auditor (Step 2) — Tier Audit v1
 * Calls Claude Haiku to audit Sonnet's tier classification.
 * Checks for contamination, anchor consistency, and missed evidence.
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
 * Build audit prompt for Haiku.
 */
function buildPrompt(tierResult, curation, slug) {
  const { loadConfig, buildAnchorPromptText } = require('./config_loader');
  const category = tierResult.category || curation.category || 'windows';
  const config = loadConfig(category);
  const anchorText = buildAnchorPromptText(config);

  const productName = curation.product_name || curation.product || slug;
  const operationType = curation.operation_type || (category === 'windows' ? 'DH' : 'N/A');

  // Build source list
  const sourceList = (curation.sources || []).map(s => {
    return `[${s.id}] ${s.source_name} — classification: ${s.classification}, pool: ${s.pool}${s.snippet ? ', snippet: ' + s.snippet.slice(0, 150) + '...' : ''}`;
  }).join('\n');

  // Format source flags from Sonnet
  const sourceFlags = (tierResult.source_flags || []).map(f => {
    return `- ${f.source}: ${f.issue}`;
  }).join('\n') || 'None flagged.';

  // Format key evidence
  const keyEvidence = (tierResult.key_evidence || []).map((e, i) => `${i + 1}. ${e}`).join('\n');

  return `You are auditing a product tier classification for The Residentialist.

PRODUCT: ${productName} (${operationType})

SONNET CLASSIFIED AS: Tier ${tierResult.tier} (${tierResult.tier_label})
CLOSEST ANCHOR: ${tierResult.closest_anchor} (${tierResult.above_or_below_anchor})
REASONING: ${tierResult.reasoning}
CONFIDENCE: ${tierResult.confidence}

KEY EVIDENCE CITED:
${keyEvidence}

SONNET FLAGGED THESE SOURCES:
${sourceFlags}

CURATED SOURCES AVAILABLE (for cross-reference):
${sourceList}

ANCHOR DEFINITIONS:
${anchorText}

Audit checklist:
1. Did Sonnet reference any source that is about a DIFFERENT product from this manufacturer? If yes, the tier may be wrong.
2. Did Sonnet reference any source classified as "report_only" or "quarantine"? Flag it.
3. Is the reasoning internally consistent with the tier chosen?
4. Did Sonnet miss obvious evidence from the curated sources?

CRITICAL OVERRIDE RULE: You may ONLY change the tier if you find evidence contamination — sources about the wrong product affecting the classification. Do NOT change the tier based on specs being better or worse than the anchor. Spec-based positioning is handled by the deterministic code, not by you. If you think the tier is wrong but there is no contamination, set tier_changed to false and explain in notes.

Respond in this exact JSON format:
{
  "tier_approved": 3,
  "tier_changed": false,
  "change_reason": null,
  "contamination_found": false,
  "contamination_details": null,
  "audit_passed": true,
  "notes": "Classification is consistent with evidence and anchor definitions"
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
      throw new Error(`Failed to parse Haiku response as JSON: ${e.message}`);
    }
  }
}

/**
 * Audit Sonnet's tier classification using Claude Haiku.
 * @param {object} tierResult - Sonnet's tier classification output
 * @param {object} curation - Parsed curation file
 * @param {string} slug - Product slug
 * @returns {object} Audit result with approved tier
 */
async function auditTier(tierResult, curation, slug) {
  const client = getClient();
  const prompt = buildPrompt(tierResult, curation, slug);
  const productName = curation.product_name || curation.product || slug;

  console.log(`[HAIKU_AUDITOR] Auditing tier for ${productName} (Tier ${tierResult.tier})...`);

  let result = null;
  let attempts = 0;
  const maxAttempts = 2;

  while (attempts < maxAttempts && !result) {
    attempts++;
    try {
      const response = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }]
      });

      const text = response.content[0].text;
      result = parseJSON(text);

      console.log(`[HAIKU_AUDITOR] Audit complete (attempt ${attempts}): tier_approved=${result.tier_approved}, changed=${result.tier_changed}, passed=${result.audit_passed}`);

      // Validate structure
      if (result.tier_approved === undefined) {
        console.warn('[HAIKU_AUDITOR] WARNING: Missing tier_approved, retrying...');
        result = null;
      }
    } catch (err) {
      console.error(`[HAIKU_AUDITOR] Attempt ${attempts} failed: ${err.message}`);
      if (attempts >= maxAttempts) {
        // Fall back to Sonnet's tier on total Haiku failure
        console.warn('[HAIKU_AUDITOR] Haiku audit failed — using Sonnet tier as-is');
        result = {
          tier_approved: tierResult.tier,
          tier_changed: false,
          change_reason: null,
          contamination_found: false,
          contamination_details: null,
          audit_passed: false,
          notes: 'Audit failed — using Sonnet tier as fallback'
        };
      }
    }
  }

  // Add metadata
  result.product_name = productName;
  result.audited_at = new Date().toISOString();

  if (result.tier_changed) {
    console.log(`[HAIKU_AUDITOR] TIER CHANGED: ${tierResult.tier} → ${result.tier_approved} (${result.change_reason})`);
  }

  if (result.contamination_found) {
    console.warn(`[HAIKU_AUDITOR] ⚠️ CONTAMINATION: ${result.contamination_details}`);
  }

  return result;
}

// Backward-compatible export
async function audit(sonnetResult, curation, slug) {
  return auditTier(sonnetResult, curation, slug);
}

module.exports = { auditTier, audit };
