/**
 * Source Finder — Find better sources via Perplexity sonar-pro
 *
 * Searches for independent professional reviews, testing data,
 * and certification information. Excludes manufacturer sources.
 *
 * No SDK — uses native fetch to call the Perplexity Chat Completions API.
 */

const PERPLEXITY_MODEL = 'sonar-pro';
const MAX_TOKENS = 1200;

/**
 * Find better independent sources for a product on a specific topic.
 *
 * @param {string} apiKey - Perplexity API key
 * @param {string} productName - Product name
 * @param {string} topic - Specific claim or topic to find sources for
 * @returns {object} { sources: [{ name, url, summary, suggestedClassification }], error? }
 */
async function findBetterSource(apiKey, productName, topic) {
  if (!apiKey) {
    return { error: 'PERPLEXITY_API_KEY is not configured' };
  }

  const prompt = `Find independent professional reviews, installer opinions, testing data, or certification information for "${productName}" regarding: ${topic}

Do not include manufacturer sources or dealer/retailer blogs.

For each source found, provide:
1. Source name (publication or author)
2. URL
3. Brief summary of what the source says (2-3 sentences)
4. Classification: INDEPENDENT (professional reviews, forums, testing labs), AFFILIATED (dealer networks, retail partners), or MANUFACTURER (brand's own content)

Respond in this exact JSON format:
{
  "sources": [
    {
      "name": "Source Name",
      "url": "https://...",
      "summary": "What the source says about this topic",
      "suggestedClassification": "independent"
    }
  ]
}

Find 3-5 sources. Only include sources with actual URLs you are confident exist.`;

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: PERPLEXITY_MODEL,
        max_tokens: MAX_TOKENS,
        messages: [
          {
            role: 'system',
            content: 'You are a research assistant finding independent sources for product reviews. Respond only in the requested JSON format.'
          },
          { role: 'user', content: prompt }
        ]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return { error: `Perplexity API error: ${response.status} — ${errText.substring(0, 200)}` };
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { sources: [], raw: text.substring(0, 500) };
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const sources = (parsed.sources || []).map(s => ({
      name: s.name || 'Unknown',
      url: s.url || '',
      summary: s.summary || '',
      suggestedClassification: (s.suggestedClassification || 'independent').toLowerCase()
    }));

    return { sources };

  } catch (err) {
    return { error: `Source finder failed: ${err.message}` };
  }
}

module.exports = { findBetterSource };
