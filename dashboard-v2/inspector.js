/**
 * Inspector Bot — Source analysis via Anthropic Haiku
 *
 * Reads a source's content (snippet, URL, name) alongside the product's
 * scoring notes and claims, then sends a structured prompt to Haiku for analysis.
 *
 * No SDK — uses native fetch to call the Anthropic Messages API.
 */

const HAIKU_MODEL = 'claude-haiku-4-5-20251001';
const MAX_TOKENS = 1500;

/**
 * Inspect a source against a product's scoring data.
 *
 * @param {string} apiKey - Anthropic API key
 * @param {object} product - Product data { name, notes, specs, axisScores, ... }
 * @param {object} source - Source data { source_name, url, snippet, classification, pool }
 * @returns {object} { blurb, strength, supportedClaims, unsupportedClaims, error? }
 */
async function inspectSource(apiKey, product, source) {
  if (!apiKey) {
    return { error: 'ANTHROPIC_API_KEY is not configured' };
  }

  const productNotes = Array.isArray(product.notes)
    ? product.notes.join('\n')
    : (product.notes || 'No scoring notes available.');

  const specsSummary = product.specs && Object.keys(product.specs).length
    ? Object.entries(product.specs).map(([k, v]) => `${k}: ${v}`).join('\n')
    : 'No specs on file.';

  const prompt = `You are an evidence analyst for The Residentialist, a product review publication. Analyze this source for the product "${product.name}".

SOURCE:
- Name: ${source.source_name}
- URL: ${source.url || 'N/A'}
- Classification: ${source.classification || 'Unknown'}
- Content snippet: ${(source.snippet || 'No snippet available.').substring(0, 1500)}

PRODUCT SCORING NOTES:
${productNotes}

PRODUCT SPECS:
${specsSummary}

Answer these questions:
1. What did this source say about ${product.name}? Summarize in 2-3 sentences.
2. What specific claims in our scoring does it support? List each one.
3. What claims does it NOT support or address? List each one.
4. Rate the source strength:
   - STRONG: Multiple specific claims directly supported with evidence
   - MODERATE: General direction supported but lacks specificity
   - WEAK: Tangentially relevant at best
5. Quote the most relevant passages (up to 3 short quotes).

Respond in this exact JSON format:
{
  "blurb": "2-3 sentence summary of what this source says about the product",
  "strength": "STRONG" | "MODERATE" | "WEAK",
  "supportedClaims": ["claim 1", "claim 2"],
  "unsupportedClaims": ["claim A", "claim B"],
  "keyQuotes": ["quote 1", "quote 2"]
}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: HAIKU_MODEL,
        max_tokens: MAX_TOKENS,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return { error: `Anthropic API error: ${response.status} — ${errText.substring(0, 200)}` };
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || '';

    // Parse JSON from the response — Haiku sometimes returns unescaped
    // newlines or quotes inside string values, so we sanitize first.
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return {
        blurb: text.substring(0, 500),
        strength: 'MODERATE',
        supportedClaims: [],
        unsupportedClaims: [],
        keyQuotes: [],
        raw: true
      };
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch (_parseErr) {
      // Sanitize: replace unescaped control characters inside the JSON block
      const sanitized = jsonMatch[0]
        .replace(/[\u0000-\u001F\u007F]/g, (ch) => {
          // Allow legitimate escapes: \n \r \t
          if (ch === '\n') return '\\n';
          if (ch === '\r') return '\\r';
          if (ch === '\t') return '\\t';
          return '';
        });
      try {
        parsed = JSON.parse(sanitized);
      } catch (_finalErr) {
        // Give up on JSON — return raw text as blurb
        return {
          blurb: text.substring(0, 500),
          strength: 'MODERATE',
          supportedClaims: [],
          unsupportedClaims: [],
          keyQuotes: [],
          raw: true
        };
      }
    }

    return {
      blurb: parsed.blurb || '',
      strength: parsed.strength || 'MODERATE',
      supportedClaims: Array.isArray(parsed.supportedClaims) ? parsed.supportedClaims : [],
      unsupportedClaims: Array.isArray(parsed.unsupportedClaims) ? parsed.unsupportedClaims : [],
      keyQuotes: Array.isArray(parsed.keyQuotes) ? parsed.keyQuotes : []
    };

  } catch (err) {
    return { error: `Inspector failed: ${err.message}` };
  }
}

module.exports = { inspectSource };
