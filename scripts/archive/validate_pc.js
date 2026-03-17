// Validate PC pool distributions and score PC directly from evidence files
// This doesn't need the full orchestrator — it exercises the PC scoring logic standalone
const fs = require('fs');
const path = require('path');

// Inline the PC scoring logic from deterministic_scorer.js for standalone testing
const POOL_WEIGHTS = { S: 1.50, A: 1.00, B: 0.75, C: 0.40 };
const POOL_CEILINGS = { S: 10, A: 10, B: 6.5, C: 5.5 };
const EXCLUDED_POOLS = ['CERTIFICATION', 'EXCLUDED'];

const PER_SOURCE_C_WEIGHTS = {
  'consumeraffairs.com': 0.25, 'yelp.com': 0.20, 'bbb.org': 0.30,
  'trustpilot.com': 0.25, 'home.google.com': 0.20, 'homedepot.com': 0.15,
  'lowes.com': 0.15, 'thewindowdog.com': 0.10,
};

function extractDomain(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; }
}

function scorePCFromEvidence(sources) {
  if (!sources || sources.length === 0) return { score: 5.0, note: 'No sources' };

  const scoreable = sources.filter(s => {
    const pool = (s.pool || 'unknown').toUpperCase();
    return !EXCLUDED_POOLS.includes(pool) && pool !== 'UNKNOWN';
  });

  if (scoreable.length === 0) return { score: 5.0, note: 'No scoreable sources' };

  let totalWeight = 0, positiveWeight = 0, negativeWeight = 0;
  const poolCounts = {};
  
  for (const src of scoreable) {
    const pool = (src.pool || 'C').toUpperCase();
    poolCounts[pool] = (poolCounts[pool] || 0) + 1;
    
    let baseWeight = POOL_WEIGHTS[pool] || 0.40;
    // Per-source C weight overrides
    if (pool === 'C') {
      const domain = extractDomain(src.url || '');
      if (PER_SOURCE_C_WEIGHTS[domain]) baseWeight = PER_SOURCE_C_WEIGHTS[domain];
    }
    
    totalWeight += baseWeight;
    const sentiment = (src.sentiment || '').toLowerCase();
    if (sentiment === 'positive' || sentiment === 'mixed-positive') positiveWeight += baseWeight;
    else if (sentiment === 'negative' || sentiment === 'mixed-negative') negativeWeight += baseWeight;
    else positiveWeight += baseWeight * 0.5; // neutral = 50% positive
  }

  const consensusRatio = totalWeight > 0 ? positiveWeight / totalWeight : 0.5;
  
  // Blended ceiling
  let ceilingWeightSum = 0, ceilingSum = 0;
  for (const [pool, count] of Object.entries(poolCounts)) {
    const w = POOL_WEIGHTS[pool] || 0.40;
    const c = POOL_CEILINGS[pool] || 5.5;
    ceilingWeightSum += w * count;
    ceilingSum += c * w * count;
  }
  const blendedCeiling = ceilingWeightSum > 0 ? ceilingSum / ceilingWeightSum : 5.5;

  // Confidence multiplier
  const n = scoreable.length;
  let confidence;
  if (n < 3) confidence = 0.30;
  else if (n <= 5) confidence = 0.50;
  else if (n <= 10) confidence = 0.70;
  else if (n <= 20) confidence = 0.85;
  else confidence = 1.00;

  const score = Math.min(5.0 + consensusRatio * 2.5 * confidence, blendedCeiling);

  return {
    score: Math.round(score * 100) / 100,
    method: 'deterministic_all_pool_v2',
    totalSources: sources.length,
    scoredSources: scoreable.length,
    poolCounts,
    consensusRatio: Math.round(consensusRatio * 1000) / 1000,
    confidence,
    blendedCeiling: Math.round(blendedCeiling * 100) / 100,
  };
}

// Main
const evidenceDir = path.join(__dirname, 'evidence');
const files = fs.readdirSync(evidenceDir).filter(f => f.endsWith('.json'));

for (const f of files) {
  const data = JSON.parse(fs.readFileSync(path.join(evidenceDir, f)));
  const sources = data.professional_consensus?.sources || [];
  
  // Pool distribution
  const dist = {};
  for (const s of sources) dist[s.pool] = (dist[s.pool] || 0) + 1;
  
  const pc = scorePCFromEvidence(sources);
  
  console.log(`${f}:`);
  console.log(`  Pools: ${JSON.stringify(dist)}`);
  console.log(`  PC Score: ${pc.score} | Scored: ${pc.scoredSources}/${pc.totalSources} | Confidence: ${pc.confidence}`);
  console.log(`  Consensus: ${pc.consensusRatio} | Ceiling: ${pc.blendedCeiling}`);
  console.log('');
}
