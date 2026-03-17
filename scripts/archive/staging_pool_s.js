const fs = require("fs");
const path = require("path");
const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic();

const POOL_WEIGHTS = { S: 1.50, A: 1.00, B: 0.75, C: 0.40 };
const POOL_CEILINGS = { S: 9.0, A: 7.5, B: 6.5, C: 5.5 };
const EXCLUDED_POOLS = new Set(["CERTIFICATION", "EXCLUDED"]);

const REC_VALUES = {
  strong_recommend: 1.0, recommend: 0.6, neutral: 0, caution: -0.6, avoid: -1.0
};

// ============================================================
// BAD POOL A SOURCES TO REMOVE (same as v4_clean)
// ============================================================
const BAD_SOURCES = {
  "Marvin Signature Ultimate": [
    "fine-homebuilding-summit-2025",
    "what-is-building-science",
    "budget-friendly-windows-that-you-can"
  ],
  "Reliabilt 3500": [
    "fine-homebuilding-summit-2025",
    "whats-definition-green-building"
  ],
  "Window World 4000": [
    "window-weatherstripping",
    "what-would-you-consider-to-be-a-pretty-good-window",
    "the-bs-beer-show-the-wondrous-world-of-windows",
    "greenbuildingadvisor-com",
    "a-buyers-guide-to-windows",
    "european-windows-that-open-outwards",
    "do-europeans-make-better-windows-than-we-do"
  ],
  "Andersen 400 Series": [
    "pella-impervia-casement-windows"
  ],
  "Pella Impervia": []
};

function isBadSource(src, productName) {
  const badFrags = BAD_SOURCES[productName] || [];
  if (badFrags.length === 0) return false;
  const url = (src.url || "").toLowerCase();
  for (const frag of badFrags) {
    if (url.includes(frag.toLowerCase())) return true;
  }
  return false;
}

// ============================================================
// POOL S: CURATED EXPERT COMPARISON SOURCES
// These are real professional comparison/ranking sources where
// credible installers or specialists have directly compared
// multiple premium window brands.
//
// Source 1: Summit Construction Group (MN installer, 50-point scale reviews)
//   - scgmn.com/window-reviews/
//   - Marvin Ultimate: 47.5/50, Quality 10/10
//   - Andersen E-Series: 47/50 (but 400 Series: 38/50, Quality 8/10)
//   - Pella Reserve: 47/50 (Architect: 43.5/50, Lifestyle: 42.5/50)
//   - No coverage of Window World or Reliabilt
//
// Source 2: Argo Glass & Windows expert note
//   - argowindowrepair.com/blog/window/best-window-brands
//   - Expert explicitly states: "Andersen and Marvin offer higher quality than Pella"
//   - Technical basis: extruded vs rolled aluminum, delamination history
//   - No coverage of Window World or Reliabilt
//
// Source 3: Weatherguard Construction (brand-neutral contractor)
//   - wgccinc.com/window-brand-comparison-pella-marvin-andersen-kolbe
//   - Marvin: "premium customization," luxury positioning
//   - Andersen: "strongest brand trust and composite technology"
//   - Pella: "innovation and value" (positioned as accessible tier)
//   - No coverage of Window World or Reliabilt
// ============================================================

const POOL_S_SOURCES = {
  "Marvin Signature Ultimate": [
    {
      pool: "S",
      source_name: "Summit Construction Group",
      url: "https://scgmn.com/window-reviews/",
      summary: "Marvin Ultimate: 47.5/50 overall. Quality & Durability 10/10, Appearance 10/10, Thermal 9.5/10, Customizability 10/10, Value 8/10. 'One of the highest grade windows available on the market. Virtually unmatched in customizability, build construction, performance, longevity and finished look. If you are looking for the absolute best window available on the market, look no further.' Compared to Andersen E-Series: 'on par' but Marvin's service/warranty dept 'more impressive.'",
      _preset_rec: "strong_recommend"
    },
    {
      pool: "S",
      source_name: "Argo Glass Expert",
      url: "https://argowindowrepair.com/blog/window/best-window-brands",
      summary: "Window repair specialist expert note: 'Andersen and Marvin offer a higher-quality product than Pella.' Marvin uses extruded aluminum with interlocking keys into LVL wood core. Superior construction allows expansion/contraction without delamination.",
      _preset_rec: "strong_recommend"
    },
    {
      pool: "S",
      source_name: "Weatherguard Construction",
      url: "https://wgccinc.com/window-brand-comparison-pella-marvin-andersen-kolbe",
      summary: "Brand-neutral contractor comparison. Marvin: 'premium customization' and 'best for design-conscious homeowners and architecturally significant projects.' Positioned at the luxury tier among the big three.",
      _preset_rec: "strong_recommend"
    }
  ],
  "Andersen 400 Series": [
    {
      pool: "S",
      source_name: "Summit Construction Group",
      url: "https://scgmn.com/window-reviews/",
      summary: "Andersen 400 Series: 38/50 overall. Quality & Durability 8/10, Appearance 8/10, Thermal 9.5/10, Customizability 5/10, Value 7.5/10. Mid-tier Andersen line. Fibrex composite construction. E-Series (47/50) is their premium tier comparable to Marvin Ultimate, but the 400 is positioned as a solid mid-range product.",
      _preset_rec: "recommend"
    },
    {
      pool: "S",
      source_name: "Argo Glass Expert",
      url: "https://argowindowrepair.com/blog/window/best-window-brands",
      summary: "Window repair specialist expert note: 'Andersen and Marvin offer a higher-quality product than Pella.' Andersen's Eagle line uses extruded aluminum with interlocking keys into LVL wood core. Note: this applies to their clad lines, the 400 uses Fibrex composite which is a different construction approach.",
      _preset_rec: "recommend"
    },
    {
      pool: "S",
      source_name: "Weatherguard Construction",
      url: "https://wgccinc.com/window-brand-comparison-pella-marvin-andersen-kolbe",
      summary: "Brand-neutral contractor comparison. Andersen: 'strongest brand trust and composite technology.' Fibrex material 2x stronger than vinyl. Extensive product range from 100-series through E-series. 400 is their mid-tier workhorse.",
      _preset_rec: "recommend"
    }
  ],
  "Pella Impervia": [
    {
      pool: "S",
      source_name: "Summit Construction Group",
      url: "https://scgmn.com/window-reviews/",
      summary: "Pella Impervia not directly reviewed but comparable Pella lines: Pella Architect 43.5/50 (Durability 8/10), Pella Lifestyle 42.5/50 (Durability 7/10). Pella Reserve at top (47/50) but 'exterior cladding slightly less durable than Marvin or Andersen E-Series.' Pella uses rolled aluminum vs extruded on some lines.",
      _preset_rec: "recommend"
    },
    {
      pool: "S",
      source_name: "Argo Glass Expert",
      url: "https://argowindowrepair.com/blog/window/best-window-brands",
      summary: "Window repair specialist expert note: 'All three companies make high-quality windows. However, Andersen and Marvin offer a higher-quality product than Pella.' Pella uses rolled aluminum glued to wood core. 'Pella has had issues in the past with their glued rolled aluminum delaminating, which allowed water to seep into the wood core.'",
      _preset_rec: "recommend"
    },
    {
      pool: "S",
      source_name: "Weatherguard Construction",
      url: "https://wgccinc.com/window-brand-comparison-pella-marvin-andersen-kolbe",
      summary: "Brand-neutral contractor comparison. Pella: 'leads in innovative features and value.' Positioned as the accessible/value tier among the big three. Strongest in feature innovation and budget flexibility.",
      _preset_rec: "recommend"
    }
  ],
  // No expert comparison sources cover Window World or Reliabilt —
  // which is itself a signal (budget products don't generate expert comparison content)
  "Window World 4000": [],
  "Reliabilt 3500": []
};


// Recommendation classifier (V3 — same as what works on cleaned data)
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
- Historical issues that have been resolved
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
  const poolDetail = {};

  for (const poolKey of ["S", "A", "B", "C"]) {
    const poolSources = poolGroups[poolKey];
    if (poolSources.length === 0) continue;
    const poolWeight = POOL_WEIGHTS[poolKey];
    poolDetail[poolKey] = { count: 0, weighted: 0 };

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
      poolDetail[poolKey].count++;
      poolDetail[poolKey].weighted += finalWeight * sentimentValue;
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
    poolDetail
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
  console.log("  POOL S TEST: Cleaned data + Expert Comparison Sources");
  console.log("  - Bad Pool A sources removed");
  console.log("  - Pool S populated with curated expert comparisons");
  console.log("  - V3 recommendation classifier (unchanged)");
  console.log("===============================================================\n");

  const allResults = [];

  for (const prod of products) {
    console.log(`\n== ${prod.name} ========================================`);
    const data = JSON.parse(fs.readFileSync(path.join(__dirname, "evidence", prod.file)));
    const allSources = data.professional_consensus?.sources || [];

    // Step 1: Clean bad Pool A sources
    let removedCount = 0;
    const cleanedSources = allSources.filter(s => {
      const pool = (s.pool || "C").toUpperCase();
      if (pool === "A" && isBadSource(s, prod.name)) {
        removedCount++;
        return false;
      }
      return true;
    });

    // Step 2: Add Pool S expert comparison sources
    const poolSSources = POOL_S_SOURCES[prod.name] || [];
    const allSourcesWithS = [...cleanedSources, ...poolSSources];

    const poolACleaned = cleanedSources.filter(s => (s.pool || "C").toUpperCase() === "A").length;

    console.log(`  Original: ${allSources.length} | Cleaned: ${cleanedSources.length} (removed ${removedCount})`);
    console.log(`  Pool S added: ${poolSSources.length} | Pool A remaining: ${poolACleaned}`);
    console.log(`  Total with Pool S: ${allSourcesWithS.length}`);

    // Get scoreable (non-CERTIFICATION, non-EXCLUDED) — excluding Pool S for classification
    const scoreableNonS = allSourcesWithS.filter(s => {
      const pool = (s.pool || "C").toUpperCase();
      return !EXCLUDED_POOLS.has(pool) && pool !== "UNKNOWN" && pool !== "S";
    });

    // Classify non-S sources with Haiku
    console.log(`\n  Classifying ${scoreableNonS.length} non-S sources...`);
    const recMap = await classifyBatch(scoreableNonS, prod.name);

    const recDist = { strong_recommend: 0, recommend: 0, neutral: 0, caution: 0, avoid: 0, skip: 0 };
    const recByPool = {};
    for (let j = 0; j < scoreableNonS.length; j++) {
      const cls = recMap.get(j) || "skip";
      scoreableNonS[j]._rec = cls;
      recDist[cls] = (recDist[cls] || 0) + 1;
      if (cls !== "skip") {
        const p = (scoreableNonS[j].pool || "C").toUpperCase();
        if (!recByPool[p]) recByPool[p] = [];
        recByPool[p].push(cls);
      }
    }

    // Pool S sources use preset classifications (not sent through Haiku)
    for (const s of poolSSources) {
      s._rec = s._preset_rec;
    }

    const actionable = (scoreableNonS.length - recDist.skip) + poolSSources.length;

    // Score WITHOUT Pool S (baseline = cleaned V3)
    const scoreableSetNoS = new Set(scoreableNonS);
    const baselineScore = scorePC(cleanedSources, (src) => {
      if (!scoreableSetNoS.has(src)) return null;
      if (src._rec === "skip" || !src._rec) return null;
      return REC_VALUES[src._rec] !== undefined ? REC_VALUES[src._rec] : 0;
    });

    // Score WITH Pool S
    const scoreableSetAll = new Set([...scoreableNonS, ...poolSSources]);
    const poolSScore = scorePC(allSourcesWithS, (src) => {
      if (!scoreableSetAll.has(src)) return null;
      if (src._rec === "skip" || !src._rec) return null;
      return REC_VALUES[src._rec] !== undefined ? REC_VALUES[src._rec] : 0;
    });

    allResults.push({
      name: prod.name,
      removed: removedCount,
      poolSCount: poolSSources.length,
      poolACount: poolACleaned,
      baselineScore,
      poolSScore,
      recDist,
      recByPool,
      actionable,
      poolSRecs: poolSSources.map(s => s._preset_rec)
    });

    // Display
    const pos = recDist.strong_recommend + recDist.recommend;
    const neg = recDist.caution + recDist.avoid;
    console.log(`\n  Non-S classification: Quality: ${scoreableNonS.length - recDist.skip} | Rec: ${pos} | Warn: ${neg} | Skip: ${recDist.skip}`);
    for (const [pool, items] of Object.entries(recByPool).sort()) {
      console.log(`    Pool ${pool}: ${items.join(", ")}`);
    }
    if (poolSSources.length > 0) {
      console.log(`    Pool S: ${poolSSources.map(s => s._preset_rec).join(", ")}`);
    }

    console.log(`\n  Baseline (cleaned, no S): ${baselineScore.score} (ratio: ${baselineScore.consensusRatio}, eff: ${baselineScore.effectiveSources}, ceil: ${baselineScore.blendedCeiling})`);
    console.log(`  With Pool S:             ${poolSScore.score} (ratio: ${poolSScore.consensusRatio}, eff: ${poolSScore.effectiveSources}, ceil: ${poolSScore.blendedCeiling})`);
    console.log(`  DELTA: ${(poolSScore.score - baselineScore.score) >= 0 ? "+" : ""}${(poolSScore.score - baselineScore.score).toFixed(2)}`);
  }

  // Summary table
  console.log("\n\n===============================================================");
  console.log("  COMPARISON TABLE");
  console.log("===============================================================\n");
  console.log(`  ${"Product".padEnd(28)} ${"PoolS".padStart(5)} ${"Base".padStart(6)} ${"W/S".padStart(6)} ${"Delta".padStart(6)} ${"Ceil".padStart(6)} ${"Ratio".padStart(6)}`);
  console.log(`  ${"-".repeat(28)} ${"-".repeat(5)} ${"-".repeat(6)} ${"-".repeat(6)} ${"-".repeat(6)} ${"-".repeat(6)} ${"-".repeat(6)}`);

  const sorted = [...allResults].sort((a, b) => b.poolSScore.score - a.poolSScore.score);
  for (const r of sorted) {
    const delta = r.poolSScore.score - r.baselineScore.score;
    console.log(`  ${r.name.padEnd(28)} ${String(r.poolSCount).padStart(5)} ${r.baselineScore.score.toFixed(2).padStart(6)} ${r.poolSScore.score.toFixed(2).padStart(6)} ${((delta >= 0 ? "+" : "") + delta.toFixed(2)).padStart(6)} ${r.poolSScore.blendedCeiling.toFixed(2).padStart(6)} ${r.poolSScore.consensusRatio.toFixed(3).padStart(6)}`);
  }

  const baseScores = allResults.map(r => r.baselineScore.score);
  const sScores = allResults.map(r => r.poolSScore.score);
  const baseRange = Math.max(...baseScores) - Math.min(...baseScores);
  const sRange = Math.max(...sScores) - Math.min(...sScores);
  console.log(`\n  Score spread: Base ${baseRange.toFixed(2)} -> WithS ${sRange.toFixed(2)} (${sRange > baseRange ? "+" : ""}${(sRange - baseRange).toFixed(2)})`);

  const baseSorted = [...allResults].sort((a, b) => b.baselineScore.score - a.baselineScore.score);
  const sSorted = [...allResults].sort((a, b) => b.poolSScore.score - a.poolSScore.score);
  console.log(`\n  Base Ranking:  ${baseSorted.map((r, i) => `${i+1}. ${r.name} (${r.baselineScore.score})`).join(" | ")}`);
  console.log(`  Pool S Ranking: ${sSorted.map((r, i) => `${i+1}. ${r.name} (${r.poolSScore.score})`).join(" | ")}`);
  console.log("");

  fs.writeFileSync(
    path.join(__dirname, "outputs", "staging_pool_s_results.json"),
    JSON.stringify(allResults, null, 2)
  );
  console.log("  Results saved to outputs/staging_pool_s_results.json");
}

main().catch(e => { console.error(e); process.exit(1); });
