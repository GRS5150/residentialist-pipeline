const fs = require("fs");
const path = require("path");
const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic();

const POOL_WEIGHTS = { S: 1.50, A: 1.00, B: 0.75, C: 0.40 };
const POOL_CEILINGS = { S: 9.0, A: 7.5, B: 6.5, C: 5.5 };
const EXCLUDED_POOLS = new Set(["CERTIFICATION", "EXCLUDED"]);
const SENTIMENT_3 = { positive: 1, mixed: 0, negative: -1 };
const SENTIMENT_5 = {
  strong_positive: 1.0,
  moderate_positive: 0.5,
  neutral: 0,
  moderate_negative: -0.5,
  strong_negative: -1.0
};

// Batch classify sources with Haiku — send groups of 20 at a time
async function classifyBatch(sources, productName) {
  const results = new Map();
  const batchSize = 20;
  
  for (let i = 0; i < sources.length; i += batchSize) {
    const batch = sources.slice(i, i + batchSize);
    const numbered = batch.map((s, idx) => 
      `${i + idx}: ${(s.summary || "No summary").replace(/<[^>]+>/g, " ").substring(0, 300)}`
    ).join("\n");

    const resp = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [{
        role: "user",
        content: `You are classifying review/source snippets about "${productName}" windows into 5 sentiment levels.

The 5 levels:
- strong_positive: Unqualified praise, clear endorsement, no caveats
- moderate_positive: Mostly positive with minor caveats, or positive tone despite mentioning price/tradeoffs. "Excellent but expensive" = moderate_positive
- neutral: Purely factual/technical with no opinion, balanced pros and cons, or no real signal
- moderate_negative: Mostly critical with minor positives, or negative tone with some redeeming notes
- strong_negative: Severe criticism, warnings to avoid, reports of major failures

IMPORTANT: Technical specs without opinion (NFRC labels, U-factor descriptions, warranty terms) = neutral.
A source praising the product but noting price = moderate_positive, NOT neutral.
A source with problems but acknowledging some positives = moderate_negative.

Classify each snippet. Reply ONLY with lines like: 0:moderate_positive

${numbered}`
      }]
    });

    const lines = resp.content[0].text.trim().split("\n");
    for (const line of lines) {
      const match = line.match(/^(\d+)\s*:\s*(strong_positive|moderate_positive|neutral|moderate_negative|strong_negative)/);
      if (match) {
        results.set(parseInt(match[1]), match[2]);
      }
    }
    
    process.stdout.write(`  Classified ${Math.min(i + batchSize, sources.length)}/${sources.length}\r`);
  }
  console.log();
  return results;
}

function scorePC(sources, getSentimentValue) {
  const poolGroups = { S: [], A: [], B: [], C: [] };
  let excludedCount = 0;

  for (const src of sources) {
    const pool = (src.pool || "C").toUpperCase();
    if (EXCLUDED_POOLS.has(pool) || pool === "UNKNOWN") { excludedCount++; continue; }
    if (poolGroups[pool]) poolGroups[pool].push(src);
    else poolGroups.C.push(src);
  }

  let weightedSum = 0, totalWeight = 0, effectiveSources = 0;

  for (const poolKey of ["S", "A", "B", "C"]) {
    const poolSources = poolGroups[poolKey];
    if (poolSources.length === 0) continue;
    const poolWeight = POOL_WEIGHTS[poolKey];

    for (const src of poolSources) {
      let credWeight = 1.0;
      if (poolKey === "C") {
        const cs = src._credibility_screen;
        if (cs) {
          const isTrade = cs.claims_trade_experience === true;
          const isTech = cs.has_technical_claims === true;
          const isBias = cs.price_bias_detected === true;
          if (isBias) credWeight = 0.50;
          else if (isTrade && isTech) credWeight = 0.75;
          else if (isTrade || isTech) credWeight = 0.50;
          else credWeight = 0.25;
        } else credWeight = 0.50;
      }

      const sentimentValue = getSentimentValue(src);
      const finalWeight = poolWeight * credWeight;
      weightedSum += finalWeight * sentimentValue;
      totalWeight += finalWeight;
      if (finalWeight > 0) effectiveSources++;
    }
  }

  const consensusRatio = totalWeight > 0 ? weightedSum / totalWeight : 0;
  const confidence = effectiveSources >= 21 ? 1.00 :
                     effectiveSources >= 11 ? 0.85 :
                     effectiveSources >= 6  ? 0.70 :
                     effectiveSources >= 3  ? 0.50 : 0.30;

  const base = 5.0 + (consensusRatio * 2.5 * confidence);

  let ceilWS = 0, ceilWT = 0;
  for (const pk of ["S", "A", "B", "C"]) {
    if (poolGroups[pk].length === 0) continue;
    const pw = POOL_WEIGHTS[pk];
    const contrib = poolGroups[pk].length * pw;
    ceilWS += POOL_CEILINGS[pk] * contrib;
    ceilWT += contrib;
  }
  const blendedCeiling = ceilWT > 0 ? ceilWS / ceilWT : 5.5;
  const score = Math.min(base, blendedCeiling);

  return {
    score: Math.round(Math.max(1.0, Math.min(10.0, score)) * 100) / 100,
    consensusRatio: Math.round(consensusRatio * 1000) / 1000,
    confidence,
    effectiveSources,
    blendedCeiling: Math.round(blendedCeiling * 100) / 100,
    poolCounts: { S: poolGroups.S.length, A: poolGroups.A.length, B: poolGroups.B.length, C: poolGroups.C.length }
  };
}

async function main() {
  const products = [
    { file: "marvin_signature_ultimate_dh.json", name: "Marvin Signature Ultimate" },
    { file: "window_world_4000_dh.json", name: "Window World 4000" }
  ];

  console.log("═══════════════════════════════════════════════════════════════");
  console.log("  STAGING TEST: 3-Bucket vs 5-Level (Haiku AI Classification)");
  console.log("═══════════════════════════════════════════════════════════════\n");

  const results = [];

  for (const prod of products) {
    console.log(`── ${prod.name} ──────────────────────────────────────`);
    const data = JSON.parse(fs.readFileSync(path.join(__dirname, "evidence", prod.file)));
    const sources = data.professional_consensus?.sources || [];

    // Filter to scoreable only
    const scoreable = sources.filter(s => {
      const pool = (s.pool || "C").toUpperCase();
      return !EXCLUDED_POOLS.has(pool) && pool !== "UNKNOWN";
    });

    console.log(`  Total sources: ${sources.length}, Scoreable: ${scoreable.length}`);
    console.log("  Classifying with Haiku...");

    // Haiku classify all scoreable sources
    const classifications = await classifyBatch(scoreable, prod.name);

    // Build index map: scoreable sources by their position in the full array
    const scoreableIndices = [];
    let si = 0;
    for (let i = 0; i < sources.length; i++) {
      const pool = (sources[i].pool || "C").toUpperCase();
      if (!EXCLUDED_POOLS.has(pool) && pool !== "UNKNOWN") {
        scoreableIndices.push(i);
        si++;
      }
    }

    // Attach 5-level classification to sources
    for (let j = 0; j < scoreable.length; j++) {
      scoreable[j]._5level = classifications.get(j) || "neutral";
    }

    // Count distributions
    const dist3 = { positive: 0, mixed: 0, negative: 0 };
    const dist5 = { strong_positive: 0, moderate_positive: 0, neutral: 0, moderate_negative: 0, strong_negative: 0 };
    for (const s of scoreable) {
      const sent3 = (s.sentiment || "mixed").toLowerCase();
      dist3[sent3] = (dist3[sent3] || 0) + 1;
      dist5[s._5level] = (dist5[s._5level] || 0) + 1;
    }

    // Score with old 3-bucket
    const old = scorePC(sources, (src) => {
      const sent = (src.sentiment || "mixed").toLowerCase();
      return SENTIMENT_3[sent] !== undefined ? SENTIMENT_3[sent] : 0;
    });

    // Score with new 5-level (using Haiku classifications)
    // Need to map full sources array — non-scoreable get 0
    const haiku5Map = new Map();
    for (let j = 0; j < scoreable.length; j++) {
      haiku5Map.set(scoreable[j], scoreable[j]._5level);
    }
    const neu = scorePC(sources, (src) => {
      const level = haiku5Map.get(src);
      if (level) return SENTIMENT_5[level] !== undefined ? SENTIMENT_5[level] : 0;
      return 0; // excluded/unknown sources
    });

    results.push({ name: prod.name, old, neu, dist3, dist5 });

    // Migration table: how did each 3-bucket category redistribute?
    const migration = { positive: {}, mixed: {}, negative: {} };
    for (const s of scoreable) {
      const from = (s.sentiment || "mixed").toLowerCase();
      const to = s._5level;
      migration[from][to] = (migration[from][to] || 0) + 1;
    }

    console.log(`\n  3-BUCKET distribution:`);
    console.log(`    Positive: ${dist3.positive}  |  Mixed: ${dist3.mixed}  |  Negative: ${dist3.negative}`);
    console.log(`\n  5-LEVEL distribution (Haiku):`);
    console.log(`    Strong+: ${dist5.strong_positive}  |  Mod+: ${dist5.moderate_positive}  |  Neutral: ${dist5.neutral}  |  Mod-: ${dist5.moderate_negative}  |  Strong-: ${dist5.strong_negative}`);
    console.log(`\n  Migration (how 3-bucket categories redistributed):`);
    for (const [from, tos] of Object.entries(migration)) {
      const parts = Object.entries(tos).map(([t,c]) => `${t}:${c}`).join(", ");
      console.log(`    ${from} → ${parts}`);
    }
    console.log(`\n  3-BUCKET PC Score: ${old.score}  (ratio: ${old.consensusRatio}, ceiling: ${old.blendedCeiling})`);
    console.log(`  5-LEVEL PC Score: ${neu.score}  (ratio: ${neu.consensusRatio}, ceiling: ${neu.blendedCeiling})`);
    console.log(`  DELTA: ${(neu.score - old.score) >= 0 ? "+" : ""}${Math.round((neu.score - old.score) * 100) / 100}`);
    console.log("");
  }

  console.log("═══════════════════════════════════════════════════════════════");
  console.log("  SUMMARY");
  console.log("═══════════════════════════════════════════════════════════════");
  const oldSpread = Math.abs(results[0].old.score - results[1].old.score);
  const newSpread = Math.abs(results[0].neu.score - results[1].neu.score);
  console.log(`\n  Old spread (Marvin vs WW):  ${Math.round(oldSpread * 100) / 100}`);
  console.log(`  New spread (Marvin vs WW):  ${Math.round(newSpread * 100) / 100}`);
  console.log(`  Spread change:              ${newSpread > oldSpread ? "+" : ""}${Math.round((newSpread - oldSpread) * 100) / 100}`);
  console.log(`  Spread multiplier:          ${Math.round(newSpread / oldSpread * 100) / 100}x`);
  console.log(`\n  Old: Marvin ${results[0].old.score} vs Window World ${results[1].old.score}`);
  console.log(`  New: Marvin ${results[0].neu.score} vs Window World ${results[1].neu.score}`);
  console.log("");

  // Save full results
  fs.writeFileSync(
    path.join(__dirname, "outputs", "staging_5level_results.json"),
    JSON.stringify(results, null, 2)
  );
  console.log("  Full results saved to outputs/staging_5level_results.json");
}

main().catch(e => { console.error(e); process.exit(1); });
