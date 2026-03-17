const fs = require("fs");
const path = require("path");
const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic();

const POOL_WEIGHTS = { S: 1.50, A: 1.00, B: 0.75, C: 0.40 };
const POOL_CEILINGS = { S: 9.0, A: 7.5, B: 6.5, C: 5.5 };
const EXCLUDED_POOLS = new Set(["CERTIFICATION", "EXCLUDED"]);

const REC_VALUES = {
  strong_recommend: 1.0,
  recommend: 0.6,
  neutral: 0,
  caution: -0.6,
  avoid: -1.0
};
const SENTIMENT_3 = { positive: 1, mixed: 0, negative: -1 };

// COMBINED: relevance filter + recommendation in one Haiku call
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

STEP 1: Is this source about the PRODUCT'S INHERENT QUALITY? Filter out sources that are about:
- Installation workmanship (sloppy trim, bad caulking, contractor errors)
- Delivery, lead times, or supply chain
- Customer service or sales experience  
- Price, value, or cost comparisons
- Regulatory boilerplate (Prop 65, generic certifications)
- Historical issues that have been resolved (old lawsuits, past recalls that led to design changes)
- Pure technical specs with no opinion

Only sources that discuss the PRODUCT ITSELF — its build quality, materials, engineering, durability, hardware, craftsmanship, or reliability — should be scored.

STEP 2: For qualifying sources, would a knowledgeable professional recommend this product based on its quality?

Classify each as:
- strong_recommend: Clear enthusiastic endorsement of product quality.
- recommend: Positive on product quality overall. May note minor issues but would still suggest it. "Excellent craftsmanship but expensive" = recommend.
- neutral: Genuinely ambivalent about product quality specifically.
- caution: Real concerns about product quality, durability, or reliability. Documented patterns of defects.
- avoid: Severe product quality problems. Professional consensus to stay away.
- skip: Source is NOT about product quality (installation, delivery, price, service, specs, historical/resolved issues).

Reply ONLY with lines like: 0:recommend

${numbered}`
      }]
    });

    const lines = resp.content[0].text.trim().split("\n");
    for (const line of lines) {
      const match = line.match(/^(\d+)\s*:\s*(strong_recommend|recommend|neutral|caution|avoid|skip)/i);
      if (match) {
        results.set(parseInt(match[1]), match[2].toLowerCase());
      }
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
  console.log("  RECOMMENDATION + QUALITY-RELEVANCE FILTER TEST");
  console.log("  Q: Would a pro recommend this based on PRODUCT QUALITY?");
  console.log("  Filter: Exclude installation, delivery, price, service, specs");
  console.log("===============================================================\n");

  const allResults = [];

  for (const prod of products) {
    console.log(`-- ${prod.name} ------------------------------------`);
    const data = JSON.parse(fs.readFileSync(path.join(__dirname, "evidence", prod.file)));
    const sources = data.professional_consensus?.sources || [];

    const scoreable = sources.filter(s => {
      const pool = (s.pool || "C").toUpperCase();
      return !EXCLUDED_POOLS.has(pool) && pool !== "UNKNOWN";
    });
    console.log(`  Total: ${sources.length} | Scoreable: ${scoreable.length}`);

    const recMap = await classifyBatch(scoreable, prod.name);

    const recDist = { strong_recommend: 0, recommend: 0, neutral: 0, caution: 0, avoid: 0, skip: 0 };
    const recByPool = {};
    for (let j = 0; j < scoreable.length; j++) {
      const cls = recMap.get(j) || "skip";
      scoreable[j]._rec = cls;
      recDist[cls] = (recDist[cls] || 0) + 1;
      
      if (cls !== "skip") {
        const p = (scoreable[j].pool || "C").toUpperCase();
        if (!recByPool[p]) recByPool[p] = { total: 0, recs: {} };
        recByPool[p].total++;
        recByPool[p].recs[cls] = (recByPool[p].recs[cls] || 0) + 1;
      }
    }

    const actionable = scoreable.length - recDist.skip;

    const dist3 = { positive: 0, mixed: 0, negative: 0 };
    for (const s of scoreable) {
      const sent = (s.sentiment || "mixed").toLowerCase();
      dist3[sent] = (dist3[sent] || 0) + 1;
    }

    const oldScore = scorePC(sources, (src) => {
      const sent = (src.sentiment || "mixed").toLowerCase();
      return SENTIMENT_3[sent] !== undefined ? SENTIMENT_3[sent] : 0;
    });

    const scoreableSet = new Set(scoreable);
    const newScore = scorePC(sources, (src) => {
      if (!scoreableSet.has(src)) return null;
      if (src._rec === "skip" || !src._rec) return null;
      return REC_VALUES[src._rec] !== undefined ? REC_VALUES[src._rec] : 0;
    });

    allResults.push({ name: prod.name, oldScore, newScore, dist3, recDist, actionable });

    console.log(`\n  OLD (3-bucket, all ${scoreable.length} sources):`);
    console.log(`    Positive: ${dist3.positive} | Mixed: ${dist3.mixed} | Negative: ${dist3.negative}`);
    console.log(`    PC Score: ${oldScore.score} (ratio: ${oldScore.consensusRatio})`);

    console.log(`\n  NEW (quality-filtered recommendation, ${actionable} quality sources):`);
    console.log(`    Strong Rec: ${recDist.strong_recommend} | Recommend: ${recDist.recommend} | Neutral: ${recDist.neutral} | Caution: ${recDist.caution} | Avoid: ${recDist.avoid} | Skipped: ${recDist.skip}`);
    console.log(`    PC Score: ${newScore.score} (ratio: ${newScore.consensusRatio}, conf: ${newScore.confidence}, eff: ${newScore.effectiveSources})`);
    console.log(`    DELTA: ${(newScore.score - oldScore.score) >= 0 ? "+" : ""}${Math.round((newScore.score - oldScore.score) * 100) / 100}`);

    console.log(`\n  Quality sources by pool:`);
    for (const [pool, info] of Object.entries(recByPool).sort()) {
      const parts = Object.entries(info.recs).sort().map(([r,c]) => `${r}:${c}`).join(", ");
      console.log(`    Pool ${pool}: ${info.total} -- ${parts}`);
    }
    console.log("");
  }

  // Summary table
  console.log("===============================================================");
  console.log("  COMPARISON TABLE");
  console.log("===============================================================\n");
  console.log(`  ${"Product".padEnd(30)} ${"Old PC".padStart(7)} ${"New PC".padStart(7)} ${"Delta".padStart(7)} ${"Qual".padStart(5)} ${"Skip".padStart(5)} ${"Rec".padStart(5)} ${"Warn".padStart(5)}`);
  console.log(`  ${"-".repeat(30)} ${"-".repeat(7)} ${"-".repeat(7)} ${"-".repeat(7)} ${"-".repeat(5)} ${"-".repeat(5)} ${"-".repeat(5)} ${"-".repeat(5)}`);
  
  // Sort by new score descending
  const sorted = [...allResults].sort((a, b) => b.newScore.score - a.newScore.score);
  for (const r of sorted) {
    const pos = r.recDist.strong_recommend + r.recDist.recommend;
    const neg = r.recDist.caution + r.recDist.avoid;
    const delta = (r.newScore.score - r.oldScore.score);
    const deltaStr = (delta >= 0 ? "+" : "") + delta.toFixed(2);
    console.log(`  ${r.name.padEnd(30)} ${r.oldScore.score.toFixed(2).padStart(7)} ${r.newScore.score.toFixed(2).padStart(7)} ${deltaStr.padStart(7)} ${String(r.actionable).padStart(5)} ${String(r.recDist.skip).padStart(5)} ${String(pos).padStart(5)} ${String(neg).padStart(5)}`);
  }

  const oldScores = allResults.map(r => r.oldScore.score);
  const newScores = allResults.map(r => r.newScore.score);
  const oldRange = Math.max(...oldScores) - Math.min(...oldScores);
  const newRange = Math.max(...newScores) - Math.min(...newScores);
  console.log(`\n  Score range: ${oldRange.toFixed(2)} -> ${newRange.toFixed(2)} (${newRange > oldRange ? "+" : ""}${(newRange - oldRange).toFixed(2)})`);
  console.log("");

  fs.writeFileSync(
    path.join(__dirname, "outputs", "staging_recommendation_v3_results.json"),
    JSON.stringify(allResults, null, 2)
  );
  console.log("  Results saved to outputs/staging_recommendation_v3_results.json");
}

main().catch(e => { console.error(e); process.exit(1); });
