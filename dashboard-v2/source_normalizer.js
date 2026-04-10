/**
 * Source Normalizer
 * Unifies the three curation file schemas into a common source format.
 *
 * Schema 1 (modern): { sources: [{ source_name, url, snippet, pool, classification, column, ... }] }
 * Schema 2 (pool):   { source_pool_classification: { S: [...], A: [...], B: [...], C: [...] } }
 * Schema 3 (evidence): { evidence: { expert: [{ pool, source, claim }], review: [...], ... } }
 */

/**
 * Normalize sources from any curation file schema into a common format.
 * Returns: array of { source_name, url, pool, column, snippet, classification }
 */
function normalizeSources(curationData) {
  if (!curationData) return [];

  // Schema 1: Modern format — sources array already present
  if (Array.isArray(curationData.sources) && curationData.sources.length > 0) {
    return curationData.sources.map(s => ({
      source_name: s.source_name || s.name || 'Unknown',
      url: s.url || 'N/A',
      pool: s.pool || null,
      column: s.column || null,
      snippet: s.snippet || null,
      scope: s.scope || 'category',
      source_type: s.source_type || null,
      claim: s.claim || '',
      classification: s.classification || null,
      topics: s.topics || []
    }));
  }

  // Schema 2: source_pool_classification — { S: [...], A: [...], B: [...], C: [...] }
  if (curationData.source_pool_classification && typeof curationData.source_pool_classification === 'object') {
    const sources = [];
    const seen = new Set();
    for (const [pool, entries] of Object.entries(curationData.source_pool_classification)) {
      if (!Array.isArray(entries)) continue;
      for (const entry of entries) {
        const name = typeof entry === 'string' ? entry : (entry.source_name || entry.name || String(entry));
        if (name.includes('VACANT') || name.includes('N/A')) continue;
        const urlMatch = name.match(/https?:\/\/[^\s)>\]"']+/);
        const sourceName = name.replace(/\s*\(.*?\)\s*$/, '').trim();
        if (sourceName && !seen.has(sourceName.toLowerCase())) {
          seen.add(sourceName.toLowerCase());
          sources.push({
            source_name: sourceName,
            url: urlMatch ? urlMatch[0] : 'N/A',
            pool,
            column: null,
            snippet: null,
            classification: null,
            topics: []
          });
        }
      }
    }
    return sources;
  }

  // Schema 3: evidence format — { expert: [{ pool, source, claim }], review: [...], ... }
  if (curationData.evidence && typeof curationData.evidence === 'object') {
    const sources = [];
    const seen = new Set();
    for (const [column, entries] of Object.entries(curationData.evidence)) {
      if (!Array.isArray(entries)) continue;
      for (const entry of entries) {
        const name = entry.source || entry.source_name || '';
        if (name && !seen.has(name.toLowerCase())) {
          seen.add(name.toLowerCase());
          sources.push({
            source_name: name,
            url: entry.url || 'N/A',
            pool: entry.pool || null,
            column,
            snippet: entry.claim || entry.snippet || null,
            classification: null,
            topics: []
          });
        }
      }
    }
    return sources;
  }

  return [];
}

/**
 * Group sources by evidence column (expert, review, forum, field, manufacturer).
 */
function groupSourcesByColumn(sources) {
  const groups = {
    expert: [],
    review: [],
    forum: [],
    field: [],
    manufacturer: [],
    other: []
  };

  for (const src of sources) {
    const col = (src.column || 'other').toLowerCase();
    if (groups[col]) {
      groups[col].push(src);
    } else {
      groups.other.push(src);
    }
  }

  return groups;
}

/**
 * Extract the bottom_line summary from curation data.
 */
function extractBottomLine(curationData) {
  if (!curationData) return null;
  return curationData.bottom_line || curationData.scoring_notes || null;
}

module.exports = { normalizeSources, groupSourcesByColumn, extractBottomLine };
