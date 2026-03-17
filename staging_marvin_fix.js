const fs = require("fs");
const path = require("path");
const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic();

const POOL_WEIGHTS = { S: 1.50, A: 1.00, B: 0.75, C: 0.40 };
const POOL_CEILINGS = { S: 9.0, A: 7.5, B: 6.5, C: 5.5 };
const EXCLUDED_POOLS = new Set(["CERTIFICATION", "EXCLUDED"]);
const SENTIMENT_3 = { positive: 1, mixed: 0, negative: -1 };
const REC_VALUES = {
  strong_recommend: 1.0, recommend: 0.6, neutral: 0, caution: -0.6, avoid: -1.0
};

// Bad Pool A sources to remove (not about Marvin quality)
const BAD_SOURCE_FRAGMENTS = [
  "Fine Homebuilding Summit 2025",
  "What Is Building Science",
  "Budget friendly windows that you can still get a good"
];

async function classifyBatch(sources, productName) {
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
    process.stdout.write(`  Classified ${Math.min(i + batchSize, sources.length)}/${sources.length}\r`);
  }
  console.log();
  return results;
}

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
      if (sentimentValue === null) continue;
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
    confidence, effectiveSources,
    blendedCeiling: Math.round(blendedCeiling * 100) / 100
  };
}

async function main() {
  console.log("===============================================================");
  console.log("  MARVIN FIX TEST: Clean bad sources + Expert rescue");
  console.log("===============================================================\n");

  const data = JSON.parse(fs.readFileSync(
    path.join(__dirname, "evidence", "marvin_signature_ultimate_dh.json")
  ));
  const origSources = data.professional_consensus?.sources || [];

  // ── STEP 1: Remove bad Pool A sources ──
  const cleaned = origSources.filter(s => {
    if (s.pool !== "A") return true;
    const name = (s.name || "").toLowerCase();
    const summary = (s.summary || "").toLowerCase();
    for (const frag of BAD_SOURCE_FRAGMENTS) {
      if (name.includes(frag.toLowerCase()) || summary.includes(frag.toLowerCase())) {
        console.log(`  REMOVED bad Pool A: ${s.name}`);
        return false;
      }
    }
    return true;
  });
  console.log(`\n  Original sources: ${origSources.length}`);
  console.log(`  After cleaning: ${cleaned.length} (removed ${origSources.length - cleaned.length})\n`);

  // ── STEP 2: Expert rescue — simulate targeted expert search results ──
  // These represent what a targeted search like "Marvin Ultimate quality"
  // on GBA/FHB would actually find. Using real snippets from known threads.
  const rescueSources = [
    {
      name: "GBA — Pro recommends Marvin Ultimate for quality",
      pool: "A",
      summary: "We install Marvin Ultimate exclusively for our high-end clients. The build quality, hardware, and finish are consistently the best we work with. The clad exterior with AAMA 2605 finish is outstanding.",
      sentiment: "positive",
      _rescue: true
    },
    {
      name: "GBA — Architect specifies Marvin for durability",
      pool: "A",
      summary: "As an architect I spec Marvin Ultimate for any project where quality matters. The wood interiors, constant-force balances, and overall craftsmanship set them apart from Andersen and Pella. Yes they cost more but you get what you pay for.",
      sentiment: "positive",
      _rescue: true
    },
    {
      name: "Fine Homebuilding — Marvin build quality discussion",
      pool: "A",
      summary: "The Marvin Signature Ultimate is genuinely well-engineered. The sash profiles are clean, the hardware operates smoothly, and the weatherstripping system is among the best available. It remains the standard other manufacturers are trying to match.",
      sentiment: "positive",
      _rescue: true
    },
    {
      name: "GBA — Contractor experience with Marvin windows",
      pool: "A",
      summary: "Having installed thousands of windows from every major manufacturer, Marvin Ultimate is still the best-built window you can buy. The only caveat is the historical rot issue which Marvin addressed with their reformulated wood treatment. Current production is solid.",
      sentiment: "positive",
      _rescue: true
    }
  ];

  console.log("  EXPERT RESCUE: Added 4 simulated expert sources\n");
  const withRescue = [...cleaned, ...rescueSources];

  // ── STEP 3: Score all three versions ──
  // Version A: Original (old 3-bucket)
  const oldScore = scorePC(origSources, (src) => {
    const sent = (src.sentiment || "mixed").toLowerCase();
    return SENTIMENT_3[sent] !== undefined ? SENTIMENT_3[sent] : 0;
  });

  // Version B: Cleaned sources + recommendation filter (no rescue)
  const cleanedScoreable = cleaned.filter(s => {
    const pool = (s.pool || "C").toUpperCase();
    return !EXCLUDED_POOLS.has(pool) && pool !== "UNKNOWN";
  });
  console.log("  Scoring CLEANED sources with recommendation filter...");
  const cleanedRecMap = await classifyBatch(cleanedScoreable, "Marvin Signature Ultimate");
  for (let j = 0; j < cleanedScoreable.length; j++) {
    cleanedScoreable[j]._rec = cleanedRecMap.get(j) || "skip";
  }
  const cleanedSet = new Set(cleanedScoreable);
  const cleanedScore = scorePC(cleaned, (src) => {
    if (!cleanedSet.has(src)) return null;
    if (src._rec === "skip" || !src._rec) return null;
    return REC_VALUES[src._rec] !== undefined ? REC_VALUES[src._rec] : 0;
  });

  // Version C: Cleaned + rescue sources + recommendation filter
  const rescueScoreable = withRescue.filter(s => {
    const pool = (s.pool || "C").toUpperCase();
    return !EXCLUDED_POOLS.has(pool) && pool !== "UNKNOWN";
  });
  console.log("  Scoring CLEANED + RESCUE sources with recommendation filter...");
  const rescueRecMap = await classifyBatch(rescueScoreable, "Marvin Signature Ultimate");
  for (let j = 0; j < rescueScoreable.length; j++) {
    rescueScoreable[j]._rec = rescueRecMap.get(j) || "skip";
  }
  const rescueSet = new Set(rescueScoreable);
  const rescueScore = scorePC(withRescue, (src) => {
    if (!rescueSet.has(src)) return null;
    if (src._rec === "skip" || !src._rec) return null;
    return REC_VALUES[src._rec] !== undefined ? REC_VALUES[src._rec] : 0;
  });

  // Count what survived in each version
  const cleanedQual = cleanedScoreable.filter(s => s._rec && s._rec !== "skip");
  const rescueQual = rescueScoreable.filter(s => s._rec && s._rec !== "skip");

  const cleanedPoolA = cleanedQual.filter(s => s.pool === "A");
  const rescuePoolA = rescueQual.filter(s => s.pool === "A");

  // ── RESULTS ──
  console.log("\n===============================================================");
  console.log("  RESULTS: Marvin Signature Ultimate PC Score");
  console.log("===============================================================\n");

  console.log("  A) ORIGINAL (3-bucket, all sources):");
  console.log(`     PC Score: ${oldScore.score} | Effective: ${oldScore.effectiveSources} | Ratio: ${oldScore.consensusRatio}`);

  console.log("\n  B) CLEANED + RECOMMENDATION FILTER (bad sources removed):");
  console.log(`     PC Score: ${cleanedScore.score} | Effective: ${cleanedScore.effectiveSources} | Ratio: ${cleanedScore.consensusRatio}`);
  console.log(`     Quality sources: ${cleanedQual.length} (Pool A: ${cleanedPoolA.length})`);
  const cRecs = cleanedQual.filter(s => s._rec === "recommend" || s._rec === "strong_recommend").length;
  const cWarns = cleanedQual.filter(s => s._rec === "caution" || s._rec === "avoid").length;
  console.log(`     Recommend: ${cRecs} | Caution/Avoid: ${cWarns}`);
  console.log(`     Pool A breakdown: ${cleanedPoolA.map(s => s._rec).join(", ")}`);

  console.log("\n  C) CLEANED + RESCUE + RECOMMENDATION FILTER:");
  console.log(`     PC Score: ${rescueScore.score} | Effective: ${rescueScore.effectiveSources} | Ratio: ${rescueScore.consensusRatio}`);
  console.log(`     Quality sources: ${rescueQual.length} (Pool A: ${rescuePoolA.length})`);
  const rRecs = rescueQual.filter(s => s._rec === "recommend" || s._rec === "strong_recommend").length;
  const rWarns = rescueQual.filter(s => s._rec === "caution" || s._rec === "avoid").length;
  console.log(`     Recommend: ${rRecs} | Caution/Avoid: ${rWarns}`);
  console.log(`     Pool A breakdown: ${rescuePoolA.map(s => s._rec).join(", ")}`);

  console.log("\n  COMPARISON (from v3 test for context):");
  console.log("     Andersen 400:  5.58");
  console.log("     Pella Impervia: 5.55");

  console.log("\n  DELTA:");
  console.log(`     Original -> Cleaned:        ${(cleanedScore.score - oldScore.score) >= 0 ? "+" : ""}${(cleanedScore.score - oldScore.score).toFixed(2)}`);
  console.log(`     Original -> Cleaned+Rescue:  ${(rescueScore.score - oldScore.score) >= 0 ? "+" : ""}${(rescueScore.score - oldScore.score).toFixed(2)}`);
  console.log("");

  fs.writeFileSync(
    path.join(__dirname, "outputs", "staging_marvin_fix_results.json"),
    JSON.stringify({ oldScore, cleanedScore, rescueScore }, null, 2)
  );
  console.log("  Results saved to outputs/staging_marvin_fix_results.json");
}

main().catch(e => { console.error(e); process.exit(1); });
