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

// ─── STAGE 1: Classify opinion vs factual ────────────────────────────────────
async function classifyOpinionBatch(sources, productName) {
  const results = new Map();
  const batchSize = 25;
  
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
        content: `Classify each snippet about "${productName}" windows as OPINION or FACTUAL.

OPINION = contains evaluative judgment, recommendation, praise, criticism, or experience-based assessment.
Examples: "Excellent craftsmanship" / "I recommend" / "disappointing quality" / "best window I have installed" / "not worth the price" / "very pleased with" / "customers report problems"

FACTUAL = describes specs, certifications, features, technical data, installation instructions, or product attributes without judgment.
Examples: "AAMA 2605 certified" / "U-factor 0.28" / "dual-seal IGU" / "constant-force balances" / "triple weatherstripping" / "10-year warranty"

If a snippet contains BOTH opinion and factual content, classify as OPINION (the opinion is what matters for scoring).

Reply ONLY with lines like: 0:opinion

${numbered}`
      }]
    });

    const lines = resp.content[0].text.trim().split("\n");
    for (const line of lines) {
      const match = line.match(/^(\d+)\s*:\s*(opinion|factual)/i);
      if (match) {
        results.set(parseInt(match[1]), match[2].toLowerCase());
      }
    }
    process.stdout.write(`  [Stage 1] ${Math.min(i + batchSize, sources.length)}/${sources.length}\r`);
  }
  console.log();
  return results;
}

// ─── STAGE 2: 5-level sentiment on opinion sources only ──────────────────────
async function classifySentimentBatch(sources, indices, productName) {
  const results = new Map();
  const batchSize = 20;
  const items = indices.map(idx => ({ idx, src: sources[idx] }));
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const numbered = batch.map(item => 
      `${item.idx}: ${(item.src.summary || "No summary").replace(/<[^>]+>/g, " ").substring(0, 300)}`
    ).join("\n");

    const resp = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [{
        role: "user",
        content: `You are scoring review sentiment about "${productName}" windows for a QUALITY rating.

Classify each snippet into one of 5 sentiment levels:
- strong_positive: Clear, enthusiastic endorsement. No meaningful caveats about quality.
- moderate_positive: Mostly positive. May mention price or minor issues, but overall positive on QUALITY. "Excellent but expensive" = moderate_positive (price is not a quality flaw).
- neutral: Genuinely balanced or ambivalent. Equal positives and negatives about quality itself.
- moderate_negative: Mostly negative about quality, with minor positives.
- strong_negative: Severe quality criticism, warnings, failure reports.

IMPORTANT: We are rating PRODUCT QUALITY, not value-for-money. Price complaints do NOT reduce quality sentiment. "Overpriced but beautifully made" = moderate_positive.

Reply ONLY with lines like: 0:moderate_positive

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
    process.stdout.write(`  [Stage 2] ${Math.min(i + batchSize, items.length)}/${items.length}\r`);
  }
  console.log();
  return results;
}

// ─── SCORING ENGINE ──────────────────────────────────────────────────────────
function scorePC(sources, getSentimentValue) {
  const poolGroups = { S: [], A: [], B: [], C: [] };

  for (const src of sources) {
    const pool = (src.pool || "C").toUpperCase();
    if (EXCLUDED_POOLS.has(pool) || pool === "UNKNOWN") continue;
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
      if (sentimentValue === null) continue; // Skip factual sources
      
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
    blendedCeiling: Math.round(blendedCeiling * 100) / 100
  };
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
async function main() {
  const products = [
    { file: "marvin_signature_ultimate_dh.json", name: "Marvin Signature Ultimate" },
    { file: "window_world_4000_dh.json", name: "Window World 4000" }
  ];

  console.log("═══════════════════════════════════════════════════════════════");
  console.log("  TWO-STAGE STAGING TEST");
  console.log("  Stage 1: Opinion vs Factual filter (Haiku)");
  console.log("  Stage 2: 5-Level sentiment on opinions only (Haiku)");
  console.log("═══════════════════════════════════════════════════════════════\n");

  const allResults = [];

  for (const prod of products) {
    console.log(`── ${prod.name} ──────────────────────────────────────`);
    const data = JSON.parse(fs.readFileSync(path.join(__dirname, "evidence", prod.file)));
    const sources = data.professional_consensus?.sources || [];

    // Filter to scoreable
    const scoreable = sources.filter(s => {
      const pool = (s.pool || "C").toUpperCase();
      return !EXCLUDED_POOLS.has(pool) && pool !== "UNKNOWN";
    });
    console.log(`  Total: ${sources.length} | Scoreable: ${scoreable.length}`);

    // STAGE 1: Opinion vs factual
    console.log("  Running Stage 1: Opinion vs Factual...");
    const opinionMap = await classifyOpinionBatch(scoreable, prod.name);

    const opinionIndices = [];
    const factualIndices = [];
    for (let j = 0; j < scoreable.length; j++) {
      const cls = opinionMap.get(j) || "factual";
      scoreable[j]._content_type = cls;
      if (cls === "opinion") opinionIndices.push(j);
      else factualIndices.push(j);
    }
    console.log(`  Stage 1 result: ${opinionIndices.length} opinions, ${factualIndices.length} factual`);

    // STAGE 2: Sentiment on opinions only
    console.log("  Running Stage 2: 5-Level sentiment on opinions...");
    const sentimentMap = await classifySentimentBatch(scoreable, opinionIndices, prod.name);

    for (const [idx, sent] of sentimentMap) {
      scoreable[idx]._5level = sent;
    }

    // Count distributions
    const dist5 = { strong_positive: 0, moderate_positive: 0, neutral: 0, moderate_negative: 0, strong_negative: 0 };
    for (const idx of opinionIndices) {
      const s = scoreable[idx]._5level || "neutral";
      dist5[s]++;
    }

    const dist3 = { positive: 0, mixed: 0, negative: 0 };
    for (const s of scoreable) {
      const sent = (s.sentiment || "mixed").toLowerCase();
      dist3[sent] = (dist3[sent] || 0) + 1;
    }

    // Old score (3-bucket, all sources)
    const oldScore = scorePC(sources, (src) => {
      const sent = (src.sentiment || "mixed").toLowerCase();
      return SENTIMENT_3[sent] !== undefined ? SENTIMENT_3[sent] : 0;
    });

    // New score (5-level, opinions only)
    const scoreableSet = new Set(scoreable);
    const newScore = scorePC(sources, (src) => {
      if (!scoreableSet.has(src)) return null;
      if (src._content_type !== "opinion") return null; // Skip factual
      const level = src._5level || "neutral";
      return SENTIMENT_5[level] !== undefined ? SENTIMENT_5[level] : 0;
    });

    allResults.push({ name: prod.name, oldScore, newScore, dist3, dist5,
      opinionCount: opinionIndices.length, factualCount: factualIndices.length });

    // Show opinion sources by pool
    const opinionByPool = {};
    for (const idx of opinionIndices) {
      const p = (scoreable[idx].pool || "C").toUpperCase();
      const s = scoreable[idx]._5level || "neutral";
      if (!opinionByPool[p]) opinionByPool[p] = { total: 0, sentiments: {} };
      opinionByPool[p].total++;
      opinionByPool[p].sentiments[s] = (opinionByPool[p].sentiments[s] || 0) + 1;
    }

    console.log(`\n  OLD (3-bucket, all ${scoreable.length} sources):`);
    console.log(`    Positive: ${dist3.positive} | Mixed: ${dist3.mixed} | Negative: ${dist3.negative}`);
    console.log(`    PC Score: ${oldScore.score} (ratio: ${oldScore.consensusRatio}, conf: ${oldScore.confidence}, eff: ${oldScore.effectiveSources})`);
    
    console.log(`\n  NEW (5-level, ${opinionIndices.length} opinion sources only):`);
    console.log(`    Strong+: ${dist5.strong_positive} | Mod+: ${dist5.moderate_positive} | Neutral: ${dist5.neutral} | Mod-: ${dist5.moderate_negative} | Strong-: ${dist5.strong_negative}`);
    console.log(`    PC Score: ${newScore.score} (ratio: ${newScore.consensusRatio}, conf: ${newScore.confidence}, eff: ${newScore.effectiveSources})`);
    console.log(`    DELTA: ${(newScore.score - oldScore.score) >= 0 ? "+" : ""}${Math.round((newScore.score - oldScore.score) * 100) / 100}`);
    
    console.log(`\n  Opinion sources by pool:`);
    for (const [pool, info] of Object.entries(opinionByPool).sort()) {
      const parts = Object.entries(info.sentiments).sort().map(([s,c]) => `${s}:${c}`).join(", ");
      console.log(`    Pool ${pool}: ${info.total} sources — ${parts}`);
    }
    console.log("");
  }

  // Summary
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("  SUMMARY");
  console.log("═══════════════════════════════════════════════════════════════");
  const oldSpread = Math.abs(allResults[0].oldScore.score - allResults[1].oldScore.score);
  const newSpread = Math.abs(allResults[0].newScore.score - allResults[1].newScore.score);
  console.log(`\n  OLD: Marvin ${allResults[0].oldScore.score} vs Window World ${allResults[1].oldScore.score}  (spread: ${Math.round(oldSpread*100)/100})`);
  console.log(`  NEW: Marvin ${allResults[0].newScore.score} vs Window World ${allResults[1].newScore.score}  (spread: ${Math.round(newSpread*100)/100})`);
  console.log(`\n  Spread change: ${oldSpread.toFixed(2)} → ${newSpread.toFixed(2)} (${newSpread > oldSpread ? "+" : ""}${(newSpread - oldSpread).toFixed(2)})`);
  if (newSpread > oldSpread) console.log(`  ✓ Spread INCREASED by ${((newSpread/oldSpread - 1) * 100).toFixed(0)}%`);
  else console.log(`  ✗ Spread decreased by ${((1 - newSpread/oldSpread) * 100).toFixed(0)}%`);
  
  console.log(`\n  Sources used:`);
  console.log(`    Marvin:       ${allResults[0].oldScore.effectiveSources} → ${allResults[0].newScore.effectiveSources} (opinions only)`);
  console.log(`    Window World: ${allResults[1].oldScore.effectiveSources} → ${allResults[1].newScore.effectiveSources} (opinions only)`);
  console.log("");

  // Save
  fs.writeFileSync(
    path.join(__dirname, "outputs", "staging_twostage_results.json"),
    JSON.stringify(allResults, null, 2)
  );
  console.log("  Results saved to outputs/staging_twostage_results.json");
}

main().catch(e => { console.error(e); process.exit(1); });
