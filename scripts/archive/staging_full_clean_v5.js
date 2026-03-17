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
// STEP 1: BAD POOL A SOURCES (misassigned, not about product)
// ============================================================
const BAD_POOL_A = {
  "Marvin Signature Ultimate": [
    "fine-homebuilding-summit-2025",
    "what-is-building-science",
    "budget-friendly-windows-that-you-can"
  ],
  "Andersen 400 Series": [
    "pella-impervia-casement-windows"
  ],
  "Pella Impervia": []
};

// ============================================================
// STEP 2: DEDUP — Sources citing the same underlying event
// We use Haiku to identify duplicate events, then keep only 1
// ============================================================

// STEP 3: CROSS-PRODUCT FILTER — Complaints about wrong product line
// e.g., Elevate complaints scored against Signature Ultimate

// Steps 2 & 3 combined into one Haiku pass for efficiency
async function cleanPoolC(sources, productName) {
  // Only process sources that might be negative (save API calls)
  const poolC = [];
  const poolCIndices = [];
  for (let i = 0; i < sources.length; i++) {
    const pool = (sources[i].pool || "C").toUpperCase();
    if (pool === "C") {
      poolC.push(sources[i]);
      poolCIndices.push(i);
    }
  }

  if (poolC.length === 0) return { cleaned: sources, deduped: 0, crossProduct: 0 };

  // Build summaries for Haiku
  const numbered = poolC.map((s, idx) => {
    const summary = (s.summary || "").replace(/<[^>]+>/g, " ").substring(0, 250);
    const url = (s.url || "no url").substring(0, 100);
    return `${idx}: ${url}\n   ${summary}`;
  }).join("\n");

  const resp = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 3000,
    messages: [{
      role: "user",
      content: `You are auditing evidence sources for "${productName}" windows. Review each source and flag problems.

FLAG each source with ONE of:
- OK — Source is about ${productName} and provides unique information
- DUPLICATE:X — This source describes the same event/issue as source X (give the index of the earlier source). Common: multiple sources referencing the same lawsuit, recall, or specific incident.
- WRONG_PRODUCT — This source is primarily about a DIFFERENT product line (e.g., complaints about "Marvin Elevate" should not be scored against "Marvin Signature Ultimate"; complaints about "Andersen Renewal" should not be scored against "Andersen 400 Series")
- RESOLVED_REPEAT — This source describes a historical issue (lawsuit, recall, defect) that has been publicly resolved AND is already captured by another source. One reference to a resolved issue is fine; multiple references to the same resolved issue are duplicates.

Reply ONLY with lines like: 0:OK or 3:DUPLICATE:1 or 7:WRONG_PRODUCT

${numbered}`
    }]
  });

  const flags = new Map();
  const lines = resp.content[0].text.trim().split("\n");
  for (const line of lines) {
    const okMatch = line.match(/^(\d+)\s*:\s*OK/i);
    if (okMatch) { flags.set(parseInt(okMatch[1]), "OK"); continue; }
    const dupMatch = line.match(/^(\d+)\s*:\s*(DUPLICATE|RESOLVED_REPEAT)/i);
    if (dupMatch) { flags.set(parseInt(dupMatch[1]), "DUPLICATE"); continue; }
    const wrongMatch = line.match(/^(\d+)\s*:\s*WRONG_PRODUCT/i);
    if (wrongMatch) { flags.set(parseInt(wrongMatch[1]), "WRONG_PRODUCT"); continue; }
  }

  // Build removal set
  const removeIndices = new Set();
  let dedupCount = 0, crossCount = 0;
  const removedDetails = [];

  for (const [idx, flag] of flags) {
    if (flag === "DUPLICATE") {
      removeIndices.add(poolCIndices[idx]);
      dedupCount++;
      removedDetails.push({ flag: "DEDUP", url: (poolC[idx].url || "").substring(0, 80), summary: (poolC[idx].summary || "").replace(/<[^>]+>/g, " ").substring(0, 120) });
    } else if (flag === "WRONG_PRODUCT") {
      removeIndices.add(poolCIndices[idx]);
      crossCount++;
      removedDetails.push({ flag: "WRONG_PROD", url: (poolC[idx].url || "").substring(0, 80), summary: (poolC[idx].summary || "").replace(/<[^>]+>/g, " ").substring(0, 120) });
    }
  }

  const cleaned = sources.filter((_, i) => !removeIndices.has(i));

  return { cleaned, deduped: dedupCount, crossProduct: crossCount, removedDetails };
}

// ============================================================
// STEP 4: POOL S — Expert comparison sources
// ============================================================
const POOL_S_SOURCES = {
  "Marvin Signature Ultimate": [
    {
      pool: "S",
      source_name: "Summit Construction Group",
      url: "https://scgmn.com/window-reviews/",
      summary: "Marvin Ultimate: 47.5/50 overall. Quality & Durability 10/10, Appearance 10/10. 'One of the highest grade windows available on the market. Virtually unmatched in customizability, build construction, performance, longevity and finished look.' Compared to Andersen E-Series: 'on par' but Marvin service/warranty 'more impressive.'",
      _preset_rec: "strong_recommend"
    },
    {
      pool: "S",
      source_name: "Argo Glass Expert",
      url: "https://argowindowrepair.com/blog/window/best-window-brands",
      summary: "Window repair specialist: 'Andersen and Marvin offer a higher-quality product than Pella.' Marvin uses extruded aluminum with interlocking keys into LVL wood core. Superior construction vs Pella's glued rolled aluminum.",
      _preset_rec: "strong_recommend"
    },
    {
      pool: "S",
      source_name: "Weatherguard Construction",
      url: "https://wgccinc.com/window-brand-comparison-pella-marvin-andersen-kolbe",
      summary: "Brand-neutral contractor: Marvin offers 'premium customization,' best for 'design-conscious homeowners and architecturally significant projects.' Positioned at luxury tier.",
      _preset_rec: "strong_recommend"
    }
  ],
  "Andersen 400 Series": [
    {
      pool: "S",
      source_name: "Summit Construction Group",
      url: "https://scgmn.com/window-reviews/",
      summary: "Andersen 400 Series: 38/50 overall. Quality 8/10, Appearance 8/10. Mid-tier Andersen line with Fibrex composite. Solid but not in the same class as Marvin Ultimate or Andersen E-Series (47/50).",
      _preset_rec: "recommend"
    },
    {
      pool: "S",
      source_name: "Argo Glass Expert",
      url: "https://argowindowrepair.com/blog/window/best-window-brands",
      summary: "Expert states Andersen and Marvin higher quality than Pella. Note: applies to Andersen clad lines (Eagle). The 400 uses Fibrex composite, different construction.",
      _preset_rec: "recommend"
    },
    {
      pool: "S",
      source_name: "Weatherguard Construction",
      url: "https://wgccinc.com/window-brand-comparison-pella-marvin-andersen-kolbe",
      summary: "Andersen: 'strongest brand trust and composite technology.' Fibrex 2x stronger than vinyl. 400 is mid-tier workhorse.",
      _preset_rec: "recommend"
    }
  ],
  "Pella Impervia": [
    {
      pool: "S",
      source_name: "Summit Construction Group",
      url: "https://scgmn.com/window-reviews/",
      summary: "Comparable Pella lines: Architect 43.5/50, Lifestyle 42.5/50. Pella Reserve top at 47/50 but 'exterior cladding slightly less durable than Marvin or Andersen E-Series.' Uses rolled aluminum on some lines.",
      _preset_rec: "recommend"
    },
    {
      pool: "S",
      source_name: "Argo Glass Expert",
      url: "https://argowindowrepair.com/blog/window/best-window-brands",
      summary: "Expert: 'All three make high-quality windows. However, Andersen and Marvin offer higher quality than Pella.' Pella uses rolled aluminum glued to wood core, has had delamination issues.",
      _preset_rec: "recommend"
    },
    {
      pool: "S",
      source_name: "Weatherguard Construction",
      url: "https://wgccinc.com/window-brand-comparison-pella-marvin-andersen-kolbe",
      summary: "Pella 'leads in innovative features and value.' Positioned as accessible/value tier among the big three.",
      _preset_rec: "recommend"
    }
  ]
};

// ============================================================
// RECOMMENDATION CLASSIFIER (V3 — proven to work)
// ============================================================
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

// ============================================================
// SCORING
// ============================================================
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

// ============================================================
// OVERALL SCORE CALCULATOR
// Quality subscores: 1A*0.35 + 1B*0.35 + 1C*0.30
// Overall: Quality*0.35 + Durability*0.35 + Performance*0.30
// ============================================================
const EXISTING_SCORES = {
  "Marvin Signature Ultimate": {
    "1A": 8.32, "1B": 8.25, "1C_old": 5.75,
    durability: 8.20, performance: 6.83,
    quality_old: 7.52, overall_old: 7.60
  },
  "Andersen 400 Series": {
    "1A": 6.96, "1B": 5.50, "1C_old": 5.23,
    durability: 7.25, performance: 6.43,
    quality_old: 5.93, overall_old: 6.54
  },
  "Pella Impervia": {
    "1A": 6.40, "1B": 7.75, "1C_old": 5.00,
    durability: 8.65, performance: 6.18,
    quality_old: 6.45, overall_old: 7.14
  }
};

function calcOverall(productName, newPC) {
  const s = EXISTING_SCORES[productName];
  const qualityNew = s["1A"] * 0.35 + s["1B"] * 0.35 + newPC * 0.30;
  const overallNew = qualityNew * 0.35 + s.durability * 0.35 + s.performance * 0.30;
  return {
    qualityOld: s.quality_old,
    qualityNew: Math.round(qualityNew * 100) / 100,
    overallOld: s.overall_old,
    overallNew: Math.round(overallNew * 100) / 100,
    durability: s.durability,
    performance: s.performance,
    pc_old: s["1C_old"],
    pc_new: newPC
  };
}


async function main() {
  const products = [
    { file: "marvin_signature_ultimate_dh.json", name: "Marvin Signature Ultimate" },
    { file: "andersen_400_series_dh.json", name: "Andersen 400 Series" },
    { file: "pella_impervia_dh.json", name: "Pella Impervia" }
  ];

  console.log("===============================================================");
  console.log("  V5 FULL CLEAN: All noise reduction + Pool S + Overall scores");
  console.log("  Step 1: Remove bad Pool A sources");
  console.log("  Step 2: Deduplicate repeated events in Pool C");
  console.log("  Step 3: Filter cross-product complaints from Pool C");
  console.log("  Step 4: Add Pool S expert comparison sources");
  console.log("  Step 5: Recommendation classifier + scoring");
  console.log("  Step 6: Calculate full Quality + Overall scores");
  console.log("===============================================================\n");

  const allResults = [];

  for (const prod of products) {
    console.log(`\n== ${prod.name} ========================================`);
    const data = JSON.parse(fs.readFileSync(path.join(__dirname, "evidence", prod.file)));
    const allSources = data.professional_consensus?.sources || [];

    // STEP 1: Clean bad Pool A
    const badFrags = BAD_POOL_A[prod.name] || [];
    let poolARemoved = 0;
    let step1Sources = allSources.filter(s => {
      const pool = (s.pool || "C").toUpperCase();
      if (pool === "A" && badFrags.length > 0) {
        const url = (s.url || "").toLowerCase();
        if (badFrags.some(f => url.includes(f.toLowerCase()))) {
          poolARemoved++;
          return false;
        }
      }
      return true;
    });
    console.log(`  Step 1 — Bad Pool A removed: ${poolARemoved}`);

    // STEPS 2 & 3: Dedup + cross-product filter on Pool C
    console.log(`  Steps 2-3 — Cleaning Pool C (dedup + cross-product)...`);
    const { cleaned: step23Sources, deduped, crossProduct, removedDetails } = await cleanPoolC(step1Sources, prod.name);
    console.log(`  Step 2 — Duplicates removed: ${deduped}`);
    console.log(`  Step 3 — Wrong product removed: ${crossProduct}`);
    if (removedDetails && removedDetails.length > 0) {
      for (const r of removedDetails) {
        console.log(`    [${r.flag}] ${r.url}`);
        console.log(`      ${r.summary}`);
      }
    }

    // STEP 4: Add Pool S
    const poolSSources = POOL_S_SOURCES[prod.name] || [];
    const finalSources = [...step23Sources, ...poolSSources];
    console.log(`  Step 4 — Pool S added: ${poolSSources.length}`);

    const totalRemoved = poolARemoved + deduped + crossProduct;
    console.log(`\n  Total: ${allSources.length} original -> ${step23Sources.length} cleaned + ${poolSSources.length} Pool S = ${finalSources.length}`);

    // STEP 5: Classify and score
    const scoreable = finalSources.filter(s => {
      const pool = (s.pool || "C").toUpperCase();
      return !EXCLUDED_POOLS.has(pool) && pool !== "UNKNOWN" && pool !== "S";
    });

    console.log(`\n  Step 5 — Classifying ${scoreable.length} non-S sources...`);
    const recMap = await classifyBatch(scoreable, prod.name);

    const recDist = { strong_recommend: 0, recommend: 0, neutral: 0, caution: 0, avoid: 0, skip: 0 };
    const recByPool = {};
    for (let j = 0; j < scoreable.length; j++) {
      const cls = recMap.get(j) || "skip";
      scoreable[j]._rec = cls;
      recDist[cls] = (recDist[cls] || 0) + 1;
      if (cls !== "skip") {
        const p = (scoreable[j].pool || "C").toUpperCase();
        if (!recByPool[p]) recByPool[p] = [];
        recByPool[p].push(cls);
      }
    }

    // Pool S preset
    for (const s of poolSSources) s._rec = s._preset_rec;

    const scoreableSetAll = new Set([...scoreable, ...poolSSources]);
    const pcScore = scorePC(finalSources, (src) => {
      if (!scoreableSetAll.has(src)) return null;
      if (src._rec === "skip" || !src._rec) return null;
      return REC_VALUES[src._rec] !== undefined ? REC_VALUES[src._rec] : 0;
    });

    // STEP 6: Calculate overall
    const overall = calcOverall(prod.name, pcScore.score);

    const actionable = (scoreable.length - recDist.skip) + poolSSources.length;
    const pos = recDist.strong_recommend + recDist.recommend;
    const neg = recDist.caution + recDist.avoid;

    allResults.push({
      name: prod.name,
      totalRemoved, poolARemoved, deduped, crossProduct,
      poolSCount: poolSSources.length,
      pcScore, recDist, actionable, recByPool,
      overall
    });

    console.log(`\n  Classification: Quality ${actionable} | Rec: ${pos} | Warn: ${neg} | Skip: ${recDist.skip}`);
    for (const [pool, items] of Object.entries(recByPool).sort()) {
      console.log(`    Pool ${pool}: ${items.join(", ")}`);
    }
    console.log(`    Pool S: ${poolSSources.map(s => s._preset_rec).join(", ")}`);

    console.log(`\n  PC Score: ${pcScore.score} (ratio: ${pcScore.consensusRatio}, eff: ${pcScore.effectiveSources}, ceil: ${pcScore.blendedCeiling})`);
    console.log(`  PC change: ${overall.pc_old} -> ${pcScore.score} (${(pcScore.score - overall.pc_old) >= 0 ? "+" : ""}${(pcScore.score - overall.pc_old).toFixed(2)})`);
    console.log(`\n  Quality: ${overall.qualityOld} -> ${overall.qualityNew}`);
    console.log(`  Overall: ${overall.overallOld} -> ${overall.overallNew}`);
  }

  // Summary
  console.log("\n\n===============================================================");
  console.log("  FINAL RESULTS");
  console.log("===============================================================\n");

  console.log(`  ${"Product".padEnd(28)} ${"PC Old".padStart(7)} ${"PC New".padStart(7)} ${"Q Old".padStart(7)} ${"Q New".padStart(7)} ${"O Old".padStart(7)} ${"O New".padStart(7)}`);
  console.log(`  ${"-".repeat(28)} ${"-".repeat(7)} ${"-".repeat(7)} ${"-".repeat(7)} ${"-".repeat(7)} ${"-".repeat(7)} ${"-".repeat(7)}`);

  const sorted = [...allResults].sort((a, b) => b.overall.overallNew - a.overall.overallNew);
  for (const r of sorted) {
    console.log(`  ${r.name.padEnd(28)} ${r.overall.pc_old.toFixed(2).padStart(7)} ${r.pcScore.score.toFixed(2).padStart(7)} ${r.overall.qualityOld.toFixed(2).padStart(7)} ${r.overall.qualityNew.toFixed(2).padStart(7)} ${r.overall.overallOld.toFixed(2).padStart(7)} ${r.overall.overallNew.toFixed(2).padStart(7)}`);
  }

  console.log("\n  --- FINAL OVERALL RANKINGS ---\n");
  for (let i = 0; i < sorted.length; i++) {
    const r = sorted[i];
    console.log(`  ${i + 1}. ${r.name}: ${r.overall.overallNew} (Quality ${r.overall.qualityNew} | Durability ${r.overall.durability} | Performance ${r.overall.performance})`);
  }

  const noiseReduction = allResults.map(r => `${r.name}: -${r.totalRemoved} sources (${r.poolARemoved} bad Pool A, ${r.deduped} dedup, ${r.crossProduct} wrong product) +${r.poolSCount} Pool S`);
  console.log("\n  --- NOISE REDUCTION SUMMARY ---\n");
  for (const line of noiseReduction) console.log(`  ${line}`);

  console.log("");
  fs.writeFileSync(
    path.join(__dirname, "outputs", "staging_v5_full_clean_results.json"),
    JSON.stringify(allResults, null, 2)
  );
  console.log("  Results saved to outputs/staging_v5_full_clean_results.json");
}

main().catch(e => { console.error(e); process.exit(1); });
