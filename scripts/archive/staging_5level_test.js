// Staging test: 5-level directional sentiment vs 3-bucket
// Compares PC scores for Marvin Signature Ultimate and Window World 4000

const fs = require("fs");
const path = require("path");

// ─── EXISTING 3-BUCKET SYSTEM (from deterministic_scorer.js) ─────────────────
const POOL_WEIGHTS = { S: 1.50, A: 1.00, B: 0.75, C: 0.40 };
const POOL_CEILINGS = { S: 9.0, A: 7.5, B: 6.5, C: 5.5 };
const EXCLUDED_POOLS = new Set(["CERTIFICATION", "EXCLUDED"]);

const SENTIMENT_3 = { positive: 1, mixed: 0, negative: -1 };

// ─── NEW 5-LEVEL SYSTEM ──────────────────────────────────────────────────────
const SENTIMENT_5 = {
  strong_positive: 1.0,
  moderate_positive: 0.5,
  neutral: 0,
  moderate_negative: -0.5,
  strong_negative: -1.0
};

// 5-level keyword classifier
function classify5Level(summary) {
  if (!summary) return "neutral";
  const text = summary.toLowerCase().replace(/<[^>]+>/g, " ");

  const strongPosWords = [
    "excellent", "outstanding", "exceptional", "best in class", "best-in-class",
    "superior", "top tier", "top-tier", "highest", "industry leading",
    "industry-leading", "world class", "unmatched", "highly recommend",
    "love these", "love this", "love my", "perfect", "flawless",
    "impressive", "incredible", "fantastic", "phenomenal"
  ];
  const posWords = [
    "recommend", "great", "good", "solid", "reliable", "durable",
    "well made", "well-made", "well built", "well-built", "pleased",
    "happy", "satisfied", "worth", "premium", "quality",
    "strong", "endorse", "preferred", "nice", "performs well",
    "high performance", "high-performance", "energy efficient",
    "comfortable", "beautiful", "attractive", "sturdy"
  ];
  const negWords = [
    "problem", "issue", "complaint", "defect", "failure", "failed",
    "recall", "lawsuit", "avoid", "worst", "terrible", "poor",
    "cheap", "broke", "broken", "leaking", "leak", "condensation",
    "mold", "rot", "warped", "cracked", "gaps", "draft", "drafty",
    "disappointed", "regret", "warning", "beware", "class action",
    "defective", "dissatisfied", "nightmare", "horrible"
  ];
  const strongNegWords = [
    "worst", "terrible", "horrible", "nightmare", "avoid at all cost",
    "class action", "lawsuit", "recall", "safety hazard", "dangerous",
    "do not buy", "never again", "complete failure", "total failure"
  ];
  const hedgeWords = [
    "but", "however", "although", "though", "except", "caveat",
    "concern", "on the other hand", "downside", "drawback",
    "not without", "mixed", "pros and cons"
  ];

  const strongPosHits = strongPosWords.filter(w => text.includes(w)).length;
  const posHits = posWords.filter(w => text.includes(w)).length;
  const negHits = negWords.filter(w => text.includes(w)).length;
  const strongNegHits = strongNegWords.filter(w => text.includes(w)).length;
  const hedgeHits = hedgeWords.filter(w => text.includes(w)).length;

  // Strong negative: multiple strong neg signals or neg with no pos
  if (strongNegHits >= 2 || (negHits >= 3 && posHits === 0)) return "strong_negative";
  
  // Strong positive: strong pos words with no negatives or hedges
  if (strongPosHits >= 1 && negHits === 0 && hedgeHits === 0) return "strong_positive";
  if (posHits >= 3 && negHits === 0 && hedgeHits === 0) return "strong_positive";

  // Moderate positive: positive signal with hedges, OR positive outweighs negative
  if (posHits > 0 && negHits === 0 && hedgeHits > 0) return "moderate_positive";
  if (posHits > negHits && posHits >= 1) return "moderate_positive";
  if (strongPosHits >= 1 && (negHits > 0 || hedgeHits > 0)) return "moderate_positive";

  // Moderate negative: negative outweighs positive
  if (negHits > posHits && negHits >= 1) return "moderate_negative";
  if (negHits > 0 && posHits === 0 && strongNegHits === 0) return "moderate_negative";

  // Neutral: no signal or perfectly balanced
  return "neutral";
}

// ─── SCORING ENGINE (same formula, different sentiment values) ────────────────
function scorePC(sources, sentimentMap, label) {
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
        } else {
          credWeight = 0.50;
        }
      }

      // Get sentiment value based on which system we are using
      let sentimentValue;
      if (label === "3-BUCKET") {
        const sent = (src.sentiment || "mixed").toLowerCase();
        sentimentValue = SENTIMENT_3[sent] !== undefined ? SENTIMENT_3[sent] : 0;
      } else {
        const sent5 = classify5Level(src.summary);
        sentimentValue = SENTIMENT_5[sent5] !== undefined ? SENTIMENT_5[sent5] : 0;
        // Store for reporting
        src._5level = sent5;
      }

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

  // Blended ceiling
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
    poolCounts: {
      S: poolGroups.S.length, A: poolGroups.A.length,
      B: poolGroups.B.length, C: poolGroups.C.length
    }
  };
}

// ─── RUN THE TEST ────────────────────────────────────────────────────────────
const products = [
  { file: "marvin_signature_ultimate_dh.json", name: "Marvin Signature Ultimate" },
  { file: "window_world_4000_dh.json", name: "Window World 4000" }
];

console.log("═══════════════════════════════════════════════════════════════");
console.log("  STAGING TEST: 3-Bucket vs 5-Level Directional Sentiment");
console.log("═══════════════════════════════════════════════════════════════\n");

const results = [];

for (const prod of products) {
  const data = JSON.parse(fs.readFileSync(
    path.join(__dirname, "evidence", prod.file)
  ));
  const sources = data.professional_consensus?.sources || [];

  // Deep copy sources for each test
  const sources3 = JSON.parse(JSON.stringify(sources));
  const sources5 = JSON.parse(JSON.stringify(sources));

  const old = scorePC(sources3, SENTIMENT_3, "3-BUCKET");
  const neu = scorePC(sources5, SENTIMENT_5, "5-LEVEL");

  // Count 5-level distribution
  const dist5 = { strong_positive: 0, moderate_positive: 0, neutral: 0, moderate_negative: 0, strong_negative: 0 };
  const dist3 = { positive: 0, mixed: 0, negative: 0 };
  for (const s of sources) {
    const pool = (s.pool || "C").toUpperCase();
    if (EXCLUDED_POOLS.has(pool) || pool === "UNKNOWN") continue;
    // 3-bucket
    const sent3 = (s.sentiment || "mixed").toLowerCase();
    dist3[sent3] = (dist3[sent3] || 0) + 1;
    // 5-level
    const sent5 = classify5Level(s.summary);
    dist5[sent5] = (dist5[sent5] || 0) + 1;
  }

  results.push({ name: prod.name, old, neu, dist3, dist5 });

  console.log(`── ${prod.name} ──────────────────────────────────────`);
  console.log(`\n  3-BUCKET sentiment distribution (scoreable only):`);
  console.log(`    Positive: ${dist3.positive}  |  Mixed: ${dist3.mixed}  |  Negative: ${dist3.negative}`);
  console.log(`\n  5-LEVEL sentiment distribution (scoreable only):`);
  console.log(`    Strong+: ${dist5.strong_positive}  |  Mod+: ${dist5.moderate_positive}  |  Neutral: ${dist5.neutral}  |  Mod-: ${dist5.moderate_negative}  |  Strong-: ${dist5.strong_negative}`);
  console.log(`\n  3-BUCKET PC Score: ${old.score}  (ratio: ${old.consensusRatio}, confidence: ${old.confidence}, ceiling: ${old.blendedCeiling})`);
  console.log(`  5-LEVEL PC Score: ${neu.score}  (ratio: ${neu.consensusRatio}, confidence: ${neu.confidence}, ceiling: ${neu.blendedCeiling})`);
  console.log(`  DELTA: ${(neu.score - old.score) >= 0 ? "+" : ""}${Math.round((neu.score - old.score) * 100) / 100}`);
  console.log("");
}

// Summary comparison
console.log("═══════════════════════════════════════════════════════════════");
console.log("  SUMMARY");
console.log("═══════════════════════════════════════════════════════════════");
const oldSpread = Math.abs(results[0].old.score - results[1].old.score);
const newSpread = Math.abs(results[0].neu.score - results[1].neu.score);
console.log(`\n  Old spread (Marvin vs WW):  ${Math.round(oldSpread * 100) / 100}`);
console.log(`  New spread (Marvin vs WW):  ${Math.round(newSpread * 100) / 100}`);
console.log(`  Spread improvement:         ${Math.round((newSpread - oldSpread) * 100) / 100} (${Math.round(newSpread/oldSpread * 100)}% of old)`);
console.log(`\n  Old: Marvin ${results[0].old.score} vs Window World ${results[1].old.score}`);
console.log(`  New: Marvin ${results[0].neu.score} vs Window World ${results[1].neu.score}`);
console.log("");
