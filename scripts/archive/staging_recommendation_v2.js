const fs = require("fs");
const path = require("path");
const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic();

const POOL_WEIGHTS = { S: 1.50, A: 1.00, B: 0.75, C: 0.40 };
const POOL_CEILINGS = { S: 9.0, A: 7.5, B: 6.5, C: 5.5 };
const EXCLUDED_POOLS = new Set(["CERTIFICATION", "EXCLUDED"]);
const SENTIMENT_3 = { positive: 1, mixed: 0, negative: -1 };

// New recommendation scale
const REC_VALUES = {
  strong_recommend: 1.0,
  recommend: 0.6,
  neutral: 0,
  caution: -0.6,
  avoid: -1.0,
  not_applicable: null  // factual/spec content — skip
};

// ─── STAGE 1+2 COMBINED: Classify recommendation signal ─────────────────────
async function classifyRecommendationBatch(sources, productName) {
  const results = new Map();
  const batchSize = 20;
  
  for (let i = 0; i < sources.length; i += batchSize) {
    const batch = sources.slice(i, i + batchSize);
    const numbered = batch.map((s, idx) => 
      `${i + idx}: [Pool ${(s.pool||"C").toUpperCase()}] ${(s.summary || "No summary").replace(/<[^>]+>/g, " ").substring(0, 300)}`
    ).join("\n");

    const resp = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [{
        role: "user",
        content: `You are evaluating sources about "${productName}" windows.

For each snippet, answer ONE question: Based on this source, would a knowledgeable professional recommend this product?

Classify each as:
- strong_recommend: Clear, explicit endorsement. "This is the best window in its class." "I install these in my own home." "Highly recommend." Professional praise without meaningful quality reservations.
- recommend: Positive overall, would suggest it. Mentions strengths that outweigh any noted weaknesses. "Excellent craftsmanship but expensive" = recommend (price is not a quality issue). "Very solid product, minor cosmetic issues" = recommend.
- neutral: Genuinely ambivalent or balanced. Equal strengths and weaknesses on quality. Cannot determine a recommendation direction.
- caution: Would warn buyers about real quality/durability/performance issues. "Some reports of seal failures" / "QC has slipped" / "mixed results in the field."
- avoid: Clear warning against the product. Major defects, patterns of failure, professional consensus to stay away.
- not_applicable: Source is purely factual (specs, certifications, installation guides, warranty terms, product descriptions) with NO evaluative judgment. Contains no recommendation signal.

IMPORTANT:
- Price/value complaints are NOT quality issues. "Overpriced but beautifully made" = recommend.
- A professional noting both strengths and weaknesses but still choosing to install/specify it = recommend.
- An owner who is happy with the product = recommend. An owner who regrets the purchase due to quality = caution or avoid.
- Technical specs with no opinion = not_applicable.

Reply ONLY with lines like: 0:recommend

${numbered}`
      }]
    });

    const lines = resp.content[0].text.trim().split("\n");
    for (const line of lines) {
      const match = line.match(/^(\d+)\s*:\s*(strong_recommend|recommend|neutral|caution|avoid|not_applicable)/i);
      if (match) {
        results.set(parseInt(match[1]), match[2].toLowerCase());
      }
    }
    process.stdout.write(`  Classified ${Math.min(i + batchSize, sources.length)}/${sources.length}\r`);
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

// ─── MAIN ────────────────────────────────────────────────────────────────────
async function main() {
  const products = [
    { file: "pella_impervia_dh.json", name: "Pella Impervia" },
    { file: "andersen_400_series_dh.json", name: "Andersen 400 Series" },
    { file: "reliabilt_3500_dh.json", name: "Reliabilt 3500" },
    { file: "marvin_signature_ultimate_dh.json", name: "Marvin Signature Ultimate" },
    { file: "window_world_4000_dh.json", name: "Window World 4000" }
  ];

  console.log("═══════════════════════════════════════════════════════════════");
  console.log("  RECOMMENDATION-BASED PC STAGING TEST");
  console.log("  Question: Would a knowledgeable professional recommend this?");
  console.log("═══════════════════════════════════════════════════════════════\n");

  const allResults = [];

  for (const prod of products) {
    console.log(`── ${prod.name} ──────────────────────────────────────`);
    const data = JSON.parse(fs.readFileSync(path.join(__dirname, "evidence", prod.file)));
    const sources = data.professional_consensus?.sources || [];

    const scoreable = sources.filter(s => {
      const pool = (s.pool || "C").toUpperCase();
      return !EXCLUDED_POOLS.has(pool) && pool !== "UNKNOWN";
    });
    console.log(`  Total: ${sources.length} | Scoreable: ${scoreable.length}`);
    console.log("  Classifying recommendation signals...");

    const recMap = await classifyRecommendationBatch(scoreable, prod.name);

    // Attach classifications
    const recDist = { strong_recommend: 0, recommend: 0, neutral: 0, caution: 0, avoid: 0, not_applicable: 0 };
    const recByPool = {};
    for (let j = 0; j < scoreable.length; j++) {
      const cls = recMap.get(j) || "not_applicable";
      scoreable[j]._rec = cls;
      recDist[cls]++;
      
      if (cls !== "not_applicable") {
        const p = (scoreable[j].pool || "C").toUpperCase();
        if (!recByPool[p]) recByPool[p] = { total: 0, recs: {} };
        recByPool[p].total++;
        recByPool[p].recs[cls] = (recByPool[p].recs[cls] || 0) + 1;
      }
    }

    const actionable = scoreable.length - recDist.not_applicable;

    // Old 3-bucket
    const dist3 = { positive: 0, mixed: 0, negative: 0 };
    for (const s of scoreable) {
      const sent = (s.sentiment || "mixed").toLowerCase();
      dist3[sent] = (dist3[sent] || 0) + 1;
    }

    const oldScore = scorePC(sources, (src) => {
      const sent = (src.sentiment || "mixed").toLowerCase();
      return SENTIMENT_3[sent] !== undefined ? SENTIMENT_3[sent] : 0;
    });

    // New recommendation-based
    const scoreableSet = new Set(scoreable);
    const newScore = scorePC(sources, (src) => {
      if (!scoreableSet.has(src)) return null;
      const rec = src._rec;
      if (!rec || rec === "not_applicable") return null;
      return REC_VALUES[rec] !== undefined ? REC_VALUES[rec] : 0;
    });

    allResults.push({ name: prod.name, oldScore, newScore, dist3, recDist, actionable });

    console.log(`\n  OLD (3-bucket, all ${scoreable.length} sources):`);
    console.log(`    Positive: ${dist3.positive} | Mixed: ${dist3.mixed} | Negative: ${dist3.negative}`);
    console.log(`    PC Score: ${oldScore.score} (ratio: ${oldScore.consensusRatio}, eff: ${oldScore.effectiveSources})`);

    console.log(`\n  NEW (recommendation-based, ${actionable} actionable sources):`);
    console.log(`    Strong Rec: ${recDist.strong_recommend} | Recommend: ${recDist.recommend} | Neutral: ${recDist.neutral} | Caution: ${recDist.caution} | Avoid: ${recDist.avoid} | N/A: ${recDist.not_applicable}`);
    console.log(`    PC Score: ${newScore.score} (ratio: ${newScore.consensusRatio}, conf: ${newScore.confidence}, eff: ${newScore.effectiveSources})`);
    console.log(`    DELTA: ${(newScore.score - oldScore.score) >= 0 ? "+" : ""}${Math.round((newScore.score - oldScore.score) * 100) / 100}`);

    console.log(`\n  Recommendation sources by pool:`);
    for (const [pool, info] of Object.entries(recByPool).sort()) {
      const parts = Object.entries(info.recs).sort().map(([r,c]) => `${r}:${c}`).join(", ");
      console.log(`    Pool ${pool}: ${info.total} — ${parts}`);
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
  console.log(`    Marvin:       ${allResults[0].oldScore.effectiveSources} → ${allResults[0].newScore.effectiveSources}`);
  console.log(`    Window World: ${allResults[1].oldScore.effectiveSources} → ${allResults[1].newScore.effectiveSources}`);

  // Recommendation ratios
  for (const r of allResults) {
    const pos = r.recDist.strong_recommend + r.recDist.recommend;
    const neg = r.recDist.caution + r.recDist.avoid;
    console.log(`    ${r.name}: ${pos} recommend vs ${neg} caution/avoid (${r.recDist.neutral} neutral)`);
  }
  console.log("");

  fs.writeFileSync(
    path.join(__dirname, "outputs", "staging_recommendation_v2_results.json"),
    JSON.stringify(allResults, null, 2)
  );
  console.log("  Results saved to outputs/staging_recommendation_v2_results.json");
}

main().catch(e => { console.error(e); process.exit(1); });
