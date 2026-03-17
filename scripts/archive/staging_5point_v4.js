const fs = require("fs");
const path = require("path");
const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic();

const POOL_WEIGHTS = { S: 1.50, A: 1.00, B: 0.75, C: 0.40 };
const POOL_CEILINGS = { S: 9.0, A: 7.5, B: 6.5, C: 5.5 };
const EXCLUDED_POOLS = new Set(["CERTIFICATION", "EXCLUDED"]);

// --- V3 BASELINE: binary recommend/caution ---
const REC_VALUES_V3 = {
  strong_recommend: 1.0, recommend: 0.6, neutral: 0, caution: -0.6, avoid: -1.0
};

// --- V4 NEW: 5-point nuanced scale ---
// Maps the AI's +2/+1/0/-1/-2 to sentiment values
const FIVE_POINT_VALUES = {
  "+2": 1.0,
  "+1": 0.5,
  "0":  0.0,
  "-1": -0.5,
  "-2": -1.0
};

// For display mapping
const FIVE_POINT_LABELS = {
  "+2": "strong_endorse",
  "+1": "positive_nuance",
  "0":  "balanced",
  "-1": "minor_caution",
  "-2": "strong_negative"
};

const SENTIMENT_3 = { positive: 1, mixed: 0, negative: -1 };

// V3 classifier (unchanged from recommendation_v3)
async function classifyBatchV3(sources, productName) {
  const results = new Map();
  const batchSize = 20;
  for (let i = 0; i < sources.length; i += batchSize) {
    const batch = sources.slice(i, i + batchSize);
    const numbered = batch.map((s, idx) =>
      `${i + idx}: [Pool ${(s.pool||"C").toUpperCase()}] ${(s.summary || "No summary").replace(/<[^>]+>/g, " ").substring(0, 300)}`
    ).join("\n");

    const resp = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1500,
      messages: [{
        role: "user",
        content: `You are evaluating sources about "${productName}" windows for a PRODUCT QUALITY rating.

STEP 1: Is this source about the PRODUCT'S INHERENT QUALITY? Filter out sources about:
- Installation workmanship (sloppy trim, bad caulking, contractor errors)
- Delivery, lead times, or supply chain
- Customer service or sales experience
- Price, value, or cost comparisons
- Regulatory boilerplate (Prop 65, generic certifications)
- Historical issues that have been resolved (old lawsuits, past recalls that led to design changes)
- Pure technical specs with no opinion

STEP 2: For qualifying sources, would a knowledgeable professional recommend this product based on its quality?

Classify each as:
- strong_recommend: Clear enthusiastic endorsement of product quality.
- recommend: Positive on quality overall. "Excellent craftsmanship but expensive" = recommend.
- neutral: Genuinely ambivalent about product quality.
- caution: Real concerns about product quality, durability, or reliability.
- avoid: Severe product quality problems.
- skip: NOT about product quality.

Reply ONLY with lines like: 0:recommend

${numbered}`
      }]
    });

    const lines = resp.content[0].text.trim().split("\n");
    for (const line of lines) {
      const match = line.match(/^(\d+)\s*:\s*(strong_recommend|recommend|neutral|caution|avoid|skip)/i);
      if (match) results.set(parseInt(match[1]), match[2].toLowerCase());
    }
    process.stdout.write(`  V3 classified ${Math.min(i + batchSize, sources.length)}/${sources.length}\r`);
  }
  console.log();
  return results;
}

// V4 classifier: 5-point nuanced scale with expert tone awareness
async function classifyBatchV4(sources, productName) {
  const results = new Map();
  const batchSize = 20;
  for (let i = 0; i < sources.length; i += batchSize) {
    const batch = sources.slice(i, i + batchSize);
    const numbered = batch.map((s, idx) =>
      `${i + idx}: [Pool ${(s.pool||"C").toUpperCase()}] ${(s.summary || "No summary").replace(/<[^>]+>/g, " ").substring(0, 300)}`
    ).join("\n");

    const resp = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1500,
      messages: [{
        role: "user",
        content: `You are evaluating sources about "${productName}" windows for a PRODUCT QUALITY rating.

STEP 1 — RELEVANCE FILTER: Is this source about the PRODUCT'S INHERENT QUALITY? Filter out sources about:
- Installation workmanship (sloppy trim, bad caulking, contractor errors)
- Delivery, lead times, or supply chain
- Customer service or sales experience
- Price, value, or cost comparisons
- Regulatory boilerplate (Prop 65, generic certifications)
- Historical issues that have been resolved
- Pure technical specs with no opinion

STEP 2 — NUANCED SENTIMENT: For qualifying sources, classify the overall professional sentiment toward this product's build quality, durability, and engineering on this scale:

+2 = Strong endorsement. Clear enthusiasm for the product's quality, craftsmanship, or engineering. "Best in class," "our shop standard," "no contest."
+1 = Positive nuance. The product is treated as a serious contender among premium options. Discussion focuses on fine differences vs other good products, not whether it's good. Favorable comparisons, implicit respect. "Tighter tolerances than previous gen," "if you're in this ecosystem, this is the one."
 0 = Balanced. Genuinely mixed — real pros and cons on quality, no clear lean either way.
-1 = Minor caution. A relative drawback is noted but it's contextual or minor — not a fundamental quality problem. "Parts availability is worse than DeWalt," "finish isn't as refined as the Pella."
-2 = Strong negative. Fundamental quality, durability, or reliability concerns. Documented defect patterns. Professional consensus to avoid.

CRITICAL RULE: In expert/professional sources, if the product is being discussed as a serious option and the conversation is about fine differences vs other premium products, that is at minimum +1. The very act of expert comparison implies assumed quality. Do NOT classify nuanced expert comparison as 0 or negative unless a material flaw is highlighted.

For non-qualifying sources, output: skip

Reply ONLY with lines like: 0:+1 or 0:skip

${numbered}`
      }]
    });

    const lines = resp.content[0].text.trim().split("\n");
    for (const line of lines) {
      const match = line.match(/^(\d+)\s*:\s*(\+2|\+1|0|-1|-2|skip)/i);
      if (match) results.set(parseInt(match[1]), match[2].toLowerCase());
    }
    process.stdout.write(`  V4 classified ${Math.min(i + batchSize, sources.length)}/${sources.length}\r`);
  }
  console.log();
  return results;
}

// Scoring function — supports caution cap for expert sources
function scorePC(sources, getSentimentValue, useCautionCap = false) {
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
      if (sentimentValue === null) continue;

      let finalWeight = poolWeight * credWeight;

      // CAUTION CAP (change #3): For expert-tier sources (Pool S or A) with minor
      // negative sentiment (-1 / caution), cap their weight at 1.0x instead of
      // full pool weight. This prevents one "only downside vs X is..." from
      // carrying disproportionate negative influence.
      if (useCautionCap && (poolKey === "S" || poolKey === "A")) {
        if (sentimentValue < 0 && sentimentValue >= -0.6) {
          // Minor caution — cap at 1.0x base weight
          finalWeight = Math.min(finalWeight, 1.0 * credWeight);
        }
      }

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


async function main() {
  const products = [
    { file: "pella_impervia_dh.json", name: "Pella Impervia" },
    { file: "andersen_400_series_dh.json", name: "Andersen 400 Series" },
    { file: "reliabilt_3500_dh.json", name: "Reliabilt 3500" },
    { file: "marvin_signature_ultimate_dh.json", name: "Marvin Signature Ultimate" },
    { file: "window_world_4000_dh.json", name: "Window World 4000" }
  ];

  console.log("===============================================================");
  console.log("  V4 TEST: 5-POINT NUANCED SCALE + EXPERT CAUTION CAP");
  console.log("  Change 1: +2/+1/0/-1/-2 with expert tone awareness");
  console.log("  Change 3: Minor caution from experts capped at 1.0x weight");
  console.log("===============================================================\n");

  const allResults = [];

  for (const prod of products) {
    console.log(`\n== ${prod.name} ========================================`);
    const data = JSON.parse(fs.readFileSync(path.join(__dirname, "evidence", prod.file)));
    const sources = data.professional_consensus?.sources || [];

    const scoreable = sources.filter(s => {
      const pool = (s.pool || "C").toUpperCase();
      return !EXCLUDED_POOLS.has(pool) && pool !== "UNKNOWN";
    });
    console.log(`  Total: ${sources.length} | Scoreable: ${scoreable.length}`);

    // Run V3 baseline
    console.log("\n  --- V3 Baseline (binary recommend/caution) ---");
    const v3Map = await classifyBatchV3(scoreable, prod.name);

    const v3Dist = { strong_recommend: 0, recommend: 0, neutral: 0, caution: 0, avoid: 0, skip: 0 };
    const v3ByPool = {};
    for (let j = 0; j < scoreable.length; j++) {
      const cls = v3Map.get(j) || "skip";
      scoreable[j]._v3rec = cls;
      v3Dist[cls] = (v3Dist[cls] || 0) + 1;
      if (cls !== "skip") {
        const p = (scoreable[j].pool || "C").toUpperCase();
        if (!v3ByPool[p]) v3ByPool[p] = [];
        v3ByPool[p].push(cls);
      }
    }

    const v3Actionable = scoreable.length - v3Dist.skip;
    const scoreableSet = new Set(scoreable);
    const v3Score = scorePC(sources, (src) => {
      if (!scoreableSet.has(src)) return null;
      if (src._v3rec === "skip" || !src._v3rec) return null;
      return REC_VALUES_V3[src._v3rec] !== undefined ? REC_VALUES_V3[src._v3rec] : 0;
    }, false);

    // Run V4
    console.log("  --- V4 New (5-point + caution cap) ---");
    const v4Map = await classifyBatchV4(scoreable, prod.name);

    const v4Dist = { "+2": 0, "+1": 0, "0": 0, "-1": 0, "-2": 0, "skip": 0 };
    const v4ByPool = {};
    for (let j = 0; j < scoreable.length; j++) {
      const cls = v4Map.get(j) || "skip";
      scoreable[j]._v4score = cls;
      v4Dist[cls] = (v4Dist[cls] || 0) + 1;
      if (cls !== "skip") {
        const p = (scoreable[j].pool || "C").toUpperCase();
        if (!v4ByPool[p]) v4ByPool[p] = [];
        v4ByPool[p].push(cls);
      }
    }

    const v4Actionable = scoreable.length - v4Dist.skip;
    const v4Score = scorePC(sources, (src) => {
      if (!scoreableSet.has(src)) return null;
      if (src._v4score === "skip" || !src._v4score) return null;
      return FIVE_POINT_VALUES[src._v4score] !== undefined ? FIVE_POINT_VALUES[src._v4score] : 0;
    }, true); // caution cap ON

    // Also score V4 WITHOUT caution cap for comparison
    const v4NoCap = scorePC(sources, (src) => {
      if (!scoreableSet.has(src)) return null;
      if (src._v4score === "skip" || !src._v4score) return null;
      return FIVE_POINT_VALUES[src._v4score] !== undefined ? FIVE_POINT_VALUES[src._v4score] : 0;
    }, false); // caution cap OFF

    allResults.push({
      name: prod.name,
      v3Score, v3Dist, v3Actionable, v3ByPool,
      v4Score, v4NoCap, v4Dist, v4Actionable, v4ByPool
    });

    // Display V3
    const v3Pos = v3Dist.strong_recommend + v3Dist.recommend;
    const v3Neg = v3Dist.caution + v3Dist.avoid;
    console.log(`\n  V3: Score ${v3Score.score} | Quality: ${v3Actionable} | Rec: ${v3Pos} | Warn: ${v3Neg}`);
    for (const [pool, items] of Object.entries(v3ByPool).sort()) {
      console.log(`    Pool ${pool}: ${items.join(", ")}`);
    }

    // Display V4
    const v4Pos = v4Dist["+2"] + v4Dist["+1"];
    const v4Neg = v4Dist["-1"] + v4Dist["-2"];
    console.log(`\n  V4 (with cap): Score ${v4Score.score} | Quality: ${v4Actionable} | Positive: ${v4Pos} | Negative: ${v4Neg}`);
    console.log(`  V4 (no cap):   Score ${v4NoCap.score}`);
    console.log(`    +2: ${v4Dist["+2"]} | +1: ${v4Dist["+1"]} | 0: ${v4Dist["0"]} | -1: ${v4Dist["-1"]} | -2: ${v4Dist["-2"]} | skip: ${v4Dist.skip}`);
    for (const [pool, items] of Object.entries(v4ByPool).sort()) {
      console.log(`    Pool ${pool}: ${items.join(", ")}`);
    }

    console.log(`\n  DELTA: V3 ${v3Score.score} -> V4(cap) ${v4Score.score} (${(v4Score.score - v3Score.score) >= 0 ? "+" : ""}${(v4Score.score - v3Score.score).toFixed(2)})`);
  }

  // Summary table
  console.log("\n\n===============================================================");
  console.log("  COMPARISON TABLE");
  console.log("===============================================================\n");
  console.log(`  ${"Product".padEnd(28)} ${"V3".padStart(6)} ${"V4cap".padStart(6)} ${"V4raw".padStart(6)} ${"Δv3→v4".padStart(7)} ${"CapFx".padStart(6)}`);
  console.log(`  ${"-".repeat(28)} ${"-".repeat(6)} ${"-".repeat(6)} ${"-".repeat(6)} ${"-".repeat(7)} ${"-".repeat(6)}`);

  const sorted = [...allResults].sort((a, b) => b.v4Score.score - a.v4Score.score);
  for (const r of sorted) {
    const delta = r.v4Score.score - r.v3Score.score;
    const capEffect = r.v4Score.score - r.v4NoCap.score;
    console.log(`  ${r.name.padEnd(28)} ${r.v3Score.score.toFixed(2).padStart(6)} ${r.v4Score.score.toFixed(2).padStart(6)} ${r.v4NoCap.score.toFixed(2).padStart(6)} ${(delta >= 0 ? "+" : "") + delta.toFixed(2).padStart(6)} ${(capEffect >= 0 ? "+" : "") + capEffect.toFixed(2).padStart(5)}`);
  }

  const v3Scores = allResults.map(r => r.v3Score.score);
  const v4Scores = allResults.map(r => r.v4Score.score);
  const v3Range = Math.max(...v3Scores) - Math.min(...v3Scores);
  const v4Range = Math.max(...v4Scores) - Math.min(...v4Scores);
  console.log(`\n  Score spread: V3 ${v3Range.toFixed(2)} -> V4 ${v4Range.toFixed(2)} (${v4Range > v3Range ? "+" : ""}${(v4Range - v3Range).toFixed(2)})`);

  // Rankings
  const v3Sorted = [...allResults].sort((a, b) => b.v3Score.score - a.v3Score.score);
  const v4Sorted = [...allResults].sort((a, b) => b.v4Score.score - a.v4Score.score);
  console.log(`\n  V3 Ranking: ${v3Sorted.map((r, i) => `${i+1}. ${r.name} (${r.v3Score.score})`).join(" | ")}`);
  console.log(`  V4 Ranking: ${v4Sorted.map((r, i) => `${i+1}. ${r.name} (${r.v4Score.score})`).join(" | ")}`);

  console.log("");

  fs.writeFileSync(
    path.join(__dirname, "outputs", "staging_v4_5point_results.json"),
    JSON.stringify(allResults, null, 2)
  );
  console.log("  Results saved to outputs/staging_v4_5point_results.json");
}

main().catch(e => { console.error(e); process.exit(1); });
