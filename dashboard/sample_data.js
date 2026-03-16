/**
 * Sample data for Residentialist Score Dashboard
 * Used as fallback when SQLite DB or output files are not available
 */

const SAMPLE_PRODUCTS = [
  { id: 1, product_name: "Alpen Zenith ZR-7", product_line: "Zenith", category: "Double Hung", overall_score: 8.24, quality_score: 7.37, durability_score: 8.71, performance_score: 8.70, material_safety_score: 9.2, material_class: "Pultruded fiberglass", config: "Double Hung" },
  { id: 2, product_name: "Marvin Signature Ultimate DH", product_line: "Signature Ultimate", category: "Double Hung", overall_score: 7.71, quality_score: 7.49, durability_score: 7.68, performance_score: 8.00, material_safety_score: 7.5, material_class: "Extruded aluminum-clad wood", config: "Double Hung" },
  { id: 3, product_name: "Loewen DH", product_line: "Loewen", category: "Double Hung", overall_score: 7.47, quality_score: 7.04, durability_score: 7.80, performance_score: 7.60, material_safety_score: 7.8, material_class: "Douglas fir / aluminum-clad", config: "Double Hung" },
  { id: 4, product_name: "Andersen 400 Series DH", product_line: "400 Series", category: "Double Hung", overall_score: 6.81, quality_score: 6.50, durability_score: 7.10, performance_score: 6.85, material_safety_score: 6.5, material_class: "Composite (Fibrex)", config: "Double Hung" },
  { id: 5, product_name: "Pella Impervia DH", product_line: "Impervia", category: "Double Hung", overall_score: 7.12, quality_score: 6.80, durability_score: 7.50, performance_score: 7.10, material_safety_score: 7.0, material_class: "Pultruded fiberglass", config: "Double Hung" },
  { id: 6, product_name: "Pella 350 Series DH", product_line: "350 Series", category: "Double Hung", overall_score: 4.91, quality_score: 4.50, durability_score: 5.20, performance_score: 5.10, material_safety_score: 4.8, material_class: "Vinyl", config: "Double Hung" },
  { id: 7, product_name: "Marvin Elevate DH", product_line: "Elevate", category: "Double Hung", overall_score: 7.35, quality_score: 7.10, durability_score: 7.50, performance_score: 7.48, material_safety_score: 7.2, material_class: "Fiberglass-clad wood", config: "Double Hung" },
  { id: 8, product_name: "Andersen E-Series DH", product_line: "E-Series", category: "Double Hung", overall_score: 7.55, quality_score: 7.30, durability_score: 7.65, performance_score: 7.73, material_safety_score: 7.3, material_class: "Extruded aluminum-clad wood", config: "Double Hung" },
  { id: 9, product_name: "Harvey Tribute DH", product_line: "Tribute", category: "Double Hung", overall_score: 5.42, quality_score: 5.10, durability_score: 5.60, performance_score: 5.60, material_safety_score: 5.5, material_class: "Vinyl", config: "Double Hung" },
  { id: 10, product_name: "Milgard Ultra Fiberglass DH", product_line: "Ultra", category: "Double Hung", overall_score: 6.93, quality_score: 6.60, durability_score: 7.20, performance_score: 7.00, material_safety_score: 7.1, material_class: "Pultruded fiberglass", config: "Double Hung" },
  { id: 11, product_name: "Jeld-Wen Siteline DH", product_line: "Siteline", category: "Double Hung", overall_score: 5.88, quality_score: 5.50, durability_score: 6.10, performance_score: 6.10, material_safety_score: 5.8, material_class: "Aluminum-clad wood", config: "Double Hung" },
  { id: 12, product_name: "Paradigm Casement", product_line: "Paradigm", category: "Casement", overall_score: 4.52, quality_score: 4.20, durability_score: 4.80, performance_score: 4.60, material_safety_score: 4.5, material_class: "Vinyl", config: "Casement" },
  { id: 13, product_name: "Andersen 100 Series DH", product_line: "100 Series", category: "Double Hung", overall_score: 5.67, quality_score: 5.40, durability_score: 5.80, performance_score: 5.85, material_safety_score: 5.6, material_class: "Composite (Fibrex)", config: "Double Hung" },
  { id: 14, product_name: "Pella Lifestyle DH", product_line: "Lifestyle", category: "Double Hung", overall_score: 6.45, quality_score: 6.20, durability_score: 6.60, performance_score: 6.58, material_safety_score: 6.3, material_class: "Aluminum-clad wood", config: "Double Hung" },
  { id: 15, product_name: "Renewal by Andersen DH", product_line: "Renewal", category: "Double Hung", overall_score: 5.33, quality_score: 5.00, durability_score: 5.50, performance_score: 5.55, material_safety_score: 5.3, material_class: "Composite (Fibrex)", config: "Double Hung" },
  { id: 16, product_name: "Sierra Pacific DH", product_line: "Sierra Pacific", category: "Double Hung", overall_score: 6.78, quality_score: 6.50, durability_score: 7.00, performance_score: 6.88, material_safety_score: 6.8, material_class: "Aluminum-clad wood", config: "Double Hung" },
  { id: 17, product_name: "Integrity from Marvin Ultrex DH", product_line: "Ultrex", category: "Double Hung", overall_score: 7.18, quality_score: 6.90, durability_score: 7.40, performance_score: 7.28, material_safety_score: 7.0, material_class: "Pultruded fiberglass / wood", config: "Double Hung" },
  { id: 18, product_name: "Ply Gem Pro Series DH", product_line: "Pro Series", category: "Double Hung", overall_score: 4.15, quality_score: 3.90, durability_score: 4.40, performance_score: 4.20, material_safety_score: 4.2, material_class: "Vinyl", config: "Double Hung" },
  { id: 19, product_name: "MI Windows V3000 DH", product_line: "V3000", category: "Double Hung", overall_score: 4.38, quality_score: 4.10, durability_score: 4.60, performance_score: 4.50, material_safety_score: 4.3, material_class: "Vinyl", config: "Double Hung" },
  { id: 20, product_name: "Kolbe VistaLuxe DH", product_line: "VistaLuxe", category: "Double Hung", overall_score: 7.62, quality_score: 7.40, durability_score: 7.75, performance_score: 7.73, material_safety_score: 7.6, material_class: "Extruded aluminum-clad wood", config: "Double Hung" }
];

const SAMPLE_SCORE_HISTORY = {
  1: [
    { scored_at: "2026-03-16T17:11:26Z", overall_score: 8.24, quality_score: 7.37, durability_score: 8.71, performance_score: 8.70, confidence: "HIGH", undisclosed_count: 2 },
    { scored_at: "2026-03-14T10:30:00Z", overall_score: 8.18, quality_score: 7.30, durability_score: 8.65, performance_score: 8.65, confidence: "HIGH", undisclosed_count: 3 },
    { scored_at: "2026-03-10T08:15:00Z", overall_score: 8.10, quality_score: 7.25, durability_score: 8.60, performance_score: 8.50, confidence: "MEDIUM", undisclosed_count: 4 }
  ],
  2: [
    { scored_at: "2026-03-16T15:00:00Z", overall_score: 7.71, quality_score: 7.49, durability_score: 7.68, performance_score: 8.00, confidence: "HIGH", undisclosed_count: 1 },
    { scored_at: "2026-03-12T11:00:00Z", overall_score: 7.65, quality_score: 7.40, durability_score: 7.60, performance_score: 7.95, confidence: "HIGH", undisclosed_count: 2 }
  ]
};

function generateDetailedScores(product) {
  const base = {
    product: product.product_name,
    material_class: product.material_class,
    component_quality: {
      components: {
        spacer: { value: product.overall_score > 7 ? "warm_edge_hybrid" : "standard_aluminum", score: Math.min(10, product.quality_score + 0.8), source: "disclosed" },
        balance: { value: product.overall_score > 7 ? "constant_force" : "block_and_tackle", score: product.quality_score + 0.3, source: product.overall_score > 7 ? "disclosed" : "class_prior" },
        weatherstrip: { value: product.overall_score > 7 ? "triple_fin_pile" : "standard_bulb", score: product.quality_score + 0.5, source: "disclosed" },
        glazing: { value: product.overall_score > 7 ? "triple_low_e_argon" : "dual_low_e", score: Math.min(10, product.quality_score + 1.2), source: "disclosed" },
        hardware: { value: "unknown", score: product.quality_score - 0.2, source: "class_prior" },
        screen: { value: product.overall_score > 7 ? "full_screen" : "half_screen", score: product.quality_score + 0.1, source: "disclosed" },
        sash_lock: { value: product.overall_score > 6 ? "cam_action" : "sweep_lock", score: product.quality_score + 0.2, source: product.overall_score > 6 ? "disclosed" : "class_prior" }
      },
      score: parseFloat((product.quality_score + 0.95).toFixed(2)),
      quality_tier: product.quality_score > 7 ? "premium" : product.quality_score > 6 ? "mid-range" : "budget"
    },
    manufacturing_quality: {
      score: parseFloat((product.quality_score + 0.6).toFixed(1)),
      business_model: product.quality_score > 7 ? "manufacturer_own_factory" : "manufacturer_contract",
      certifications: product.quality_score > 7 ? ["NFRC", "PASSIVE_HOUSE", "ENERGY_STAR", "AAMA_GOLD"] : product.quality_score > 6 ? ["NFRC", "ENERGY_STAR"] : ["NFRC"],
      complaint_pattern: {
        tier_label: product.quality_score > 7 ? "CLEAN" : product.quality_score > 6 ? "MINOR" : "MODERATE",
        deduction: product.quality_score > 7 ? 0 : product.quality_score > 6 ? -0.3 : -0.8
      }
    },
    professional_consensus: {
      score: parseFloat((product.quality_score - 1.85).toFixed(2)),
      pool_counts: {
        S: product.quality_score > 7 ? 0 : 0,
        A: Math.round(product.quality_score * 1.5),
        B: Math.round(product.quality_score * 0.3),
        C: Math.round(product.quality_score * 9),
        excluded: Math.round(product.quality_score * 3)
      },
      pool_details: generatePoolDetails(product)
    },
    scores: {
      quality: {
        axis_score: product.quality_score,
        component_quality: { score: parseFloat((product.quality_score + 0.95).toFixed(2)), weight: 0.40 },
        manufacturing_quality: { score: parseFloat((product.quality_score + 0.6).toFixed(1)), weight: 0.35 },
        professional_consensus: { score: parseFloat((product.quality_score - 1.85).toFixed(2)), weight: 0.25 }
      },
      durability: {
        axis_score: product.durability_score,
        frame_longevity: {
          score: parseFloat((product.durability_score + 0.5).toFixed(1)),
          reasoning: getDurabilityReasoning(product, "frame")
        },
        materials_durability: {
          score: parseFloat((product.durability_score + 0.8).toFixed(1)),
          base: parseFloat((product.durability_score + 0.3).toFixed(1)),
          adjustments: product.durability_score > 7 ? "+0.5 fiberglass bonus" : "no adjustments",
          reasoning: getDurabilityReasoning(product, "materials")
        },
        repairability: {
          score: parseFloat((product.durability_score - 1.9).toFixed(1)),
          classification_data: {
            warranty_transferable: product.overall_score > 7,
            labor_coverage: product.overall_score > 7.5 ? "limited" : "none",
            parts_availability: product.overall_score > 6.5 ? "good" : "limited",
            standard_sizes: product.overall_score > 6 ? true : false
          },
          reasoning: getDurabilityReasoning(product, "repairability")
        }
      },
      performance: {
        axis_score: product.performance_score,
        thermal: {
          score: parseFloat((product.performance_score + 0.3).toFixed(1)),
          reasoning: getPerformanceReasoning(product, "thermal")
        },
        structural: {
          score: parseFloat((product.performance_score - 1.7).toFixed(1)),
          reasoning: getPerformanceReasoning(product, "structural")
        },
        air_water: {
          score: parseFloat((product.performance_score + 1.3).toFixed(1)),
          reasoning: getPerformanceReasoning(product, "air_water")
        }
      }
    },
    overall: product.overall_score,
    grade: getGrade(product.overall_score),
    outlook: getOutlook(product.overall_score),
    outlook_detail: getOutlookDetail(product),
    material_safety: product.material_safety_score
  };
  return base;
}

function generatePoolDetails(product) {
  const pools = { A: { count: 0, sources: [] }, B: { count: 0, sources: [] }, C: { count: 0, sources: [] }, excluded: { count: 0, sources: [] } };
  const aCount = Math.round(product.quality_score * 1.5);
  const bCount = Math.round(product.quality_score * 0.3);
  const cCount = Math.round(product.quality_score * 9);
  const exCount = Math.round(product.quality_score * 3);

  const siteNames = [
    "GBA — Performance of " + product.product_name,
    "GBA — " + product.product_name + " Review Thread",
    "Energy Vanguard — " + product.product_name + " Analysis",
    "Fine Homebuilding — " + product.product_name + " Field Test",
    "JLC Online — " + product.product_name + " Installation Guide",
    "Building Science Corp — " + product.product_name + " Evaluation",
    "Houzz — " + product.product_name + " Owner Discussion",
    "Reddit r/homeimprovement — " + product.product_name + " Experience",
    "Contractor Talk — " + product.product_name + " Feedback",
    "This Old House — " + product.product_name + " Review",
    "Window Nerd Blog — " + product.product_name + " Deep Dive"
  ];
  const sentiments = ["positive", "mixed", "negative"];

  let srcIdx = 0;
  for (let i = 0; i < aCount; i++) {
    const s = sentiments[i % 3];
    pools.A.sources.push({
      name: siteNames[srcIdx % siteNames.length],
      pool: "A",
      sentiment: s,
      sentiment_value: s === "positive" ? 1 : s === "mixed" ? 0 : -1,
      pool_weight: 1,
      cred_weight: 1,
      final_weight: 1,
      contribution: s === "positive" ? 0.5 : s === "mixed" ? 0 : -0.5,
      price_bias: false,
      url: "https://example.com/source/" + (srcIdx + 1)
    });
    srcIdx++;
  }
  pools.A.count = aCount;

  for (let i = 0; i < bCount; i++) {
    const s = sentiments[(i + 1) % 3];
    pools.B.sources.push({
      name: "Houzz — " + product.product_name + " Discussion " + (i + 1),
      pool: "B",
      sentiment: s,
      sentiment_value: s === "positive" ? 1 : s === "mixed" ? 0 : -1,
      pool_weight: 0.6,
      cred_weight: 0.8,
      final_weight: 0.48,
      contribution: (s === "positive" ? 0.5 : s === "mixed" ? 0 : -0.5) * 0.48,
      price_bias: i === 0,
      url: "https://example.com/source/b" + (i + 1)
    });
  }
  pools.B.count = bCount;

  for (let i = 0; i < Math.min(cCount, 15); i++) {
    const s = sentiments[(i + 2) % 3];
    pools.C.sources.push({
      name: "Reddit r/homeimprovement — " + product.product_name + " Thread " + (i + 1),
      pool: "C",
      sentiment: s,
      sentiment_value: s === "positive" ? 1 : s === "mixed" ? 0 : -1,
      pool_weight: 0.3,
      cred_weight: 0.5,
      final_weight: 0.15,
      contribution: (s === "positive" ? 0.5 : s === "mixed" ? 0 : -0.5) * 0.15,
      price_bias: false,
      url: "https://example.com/source/c" + (i + 1)
    });
  }
  pools.C.count = cCount;

  for (let i = 0; i < Math.min(exCount, 5); i++) {
    pools.excluded.sources.push({
      name: "Low Quality Source " + (i + 1),
      pool: "excluded",
      sentiment: "mixed",
      sentiment_value: 0,
      pool_weight: 0,
      cred_weight: 0,
      final_weight: 0,
      contribution: 0,
      price_bias: false,
      reason: "Insufficient credibility"
    });
  }
  pools.excluded.count = exCount;

  return pools;
}

function getDurabilityReasoning(product, type) {
  const r = {
    frame: {
      high: "Pultruded fiberglass frame offers exceptional longevity with minimal thermal expansion and high resistance to moisture, UV degradation, and structural fatigue over decades of service.",
      mid: "Wood core with aluminum cladding provides good longevity when properly maintained. Aluminum exterior resists weathering but wood interior requires periodic inspection.",
      low: "Vinyl frames have moderate lifespan expectations. Susceptible to thermal expansion cycling and UV degradation over time, particularly in extreme climates."
    },
    materials: {
      high: "Premium material selection throughout. Fiberglass offers superior dimensional stability and weather resistance. Warm-edge spacer system reduces condensation risk at glass edges.",
      mid: "Solid material choices with proven track record. Aluminum cladding protects against exterior elements while maintaining aesthetic appeal over time.",
      low: "Standard vinyl compound with basic UV stabilizers. Material durability is adequate for moderate climates but may show accelerated aging in extreme heat or cold."
    },
    repairability: {
      high: "Good parts availability through manufacturer network. Standard sizing allows for replacement sash options. Warranty is transferable, adding long-term value.",
      mid: "Replacement parts available through dealer network. Some proprietary components may require manufacturer-specific ordering with longer lead times.",
      low: "Limited repairability options. Proprietary components with restricted availability. Non-transferable warranty reduces long-term serviceability value."
    }
  };
  const level = product.durability_score > 7.5 ? "high" : product.durability_score > 6 ? "mid" : "low";
  return r[type][level];
}

function getPerformanceReasoning(product, type) {
  const r = {
    thermal: {
      high: "Excellent thermal performance with U-factor well below Energy Star thresholds. Triple-pane configuration with low-E coatings and argon fill delivers superior insulation value.",
      mid: "Good thermal performance meeting Energy Star requirements. Dual-pane low-E configuration provides adequate insulation for most climate zones.",
      low: "Basic thermal performance. Meets minimum code requirements but does not excel in extreme climates. Limited insulating glass options."
    },
    structural: {
      high: "Strong structural ratings with high design pressure values. Fiberglass frame provides excellent rigidity without thermal bridging penalties.",
      mid: "Adequate structural performance for standard residential applications. Meets design pressure requirements for most regions.",
      low: "Minimal structural margins. May not be suitable for high-wind zones or large opening sizes without additional reinforcement."
    },
    air_water: {
      high: "Outstanding air and water infiltration resistance. Multi-point locking system and premium weatherstripping create excellent seal integrity under pressure.",
      mid: "Good air and water resistance meeting standard residential requirements. Compression weatherstripping provides reliable seal in normal conditions.",
      low: "Meets minimum air infiltration standards. Water resistance adequate for sheltered installations but may be insufficient for exposed locations."
    }
  };
  const level = product.performance_score > 7.5 ? "high" : product.performance_score > 6 ? "mid" : "low";
  return r[type][level];
}

function getGrade(score) {
  if (score >= 9.3) return "A+";
  if (score >= 8.7) return "A";
  if (score >= 8.0) return "A-";
  if (score >= 7.7) return "B+";
  if (score >= 7.3) return "B";
  if (score >= 7.0) return "B-";
  if (score >= 6.7) return "C+";
  if (score >= 6.3) return "C";
  if (score >= 6.0) return "C-";
  if (score >= 5.7) return "D+";
  if (score >= 5.3) return "D";
  if (score >= 5.0) return "D-";
  return "F";
}

function getOutlook(score) {
  if (score >= 8.0) return "Strong";
  if (score >= 7.0) return "Positive";
  if (score >= 6.0) return "Stable";
  if (score >= 5.0) return "Watch";
  return "Concern";
}

function getOutlookDetail(product) {
  if (product.overall_score >= 8.0) return "Product demonstrates consistently strong performance across all measured axes. Professional consensus supports premium positioning. No material concerns identified.";
  if (product.overall_score >= 7.0) return "Product shows solid performance with minor areas for improvement. Market position is stable with positive trajectory in recent evaluations.";
  if (product.overall_score >= 6.0) return "Product meets baseline requirements but shows notable gaps in one or more scoring axes. Monitoring recommended for quality consistency.";
  if (product.overall_score >= 5.0) return "Product shows mixed results with significant scoring gaps. Several areas require attention. Below-average professional consensus noted.";
  return "Product demonstrates substantial concerns across multiple scoring axes. Below-market performance in key areas. Elevated risk profile for consumers.";
}

function generateBot2Findings(product) {
  const findings = { red: [], yellow: [] };
  if (product.overall_score < 5.5) {
    findings.red.push(
      { finding: "Below-market durability metrics indicate potential premature failure risk", source: "Statistical analysis of warranty claims data", category: "DEFECT" },
      { finding: "Multiple documented installation failure reports from certified contractors", source: "Contractor feedback database", category: "DEFECT" }
    );
  }
  if (product.overall_score < 7.0) {
    findings.yellow.push(
      { finding: "Mixed customer service experience reported across multiple channels", source: "Consumer review aggregation", category: "NOTE" }
    );
  }
  if (product.overall_score < 8.0) {
    findings.yellow.push(
      { finding: "Historical quality control concerns noted in professional forums", source: "GBA forum discussion", category: "NOTE" }
    );
  }
  if (product.material_class.toLowerCase().includes("vinyl")) {
    findings.yellow.push(
      { finding: "Vinyl frame material has inherent thermal expansion limitations", source: "Material science analysis", category: "NOTE" },
      { finding: "Limited color customization due to material constraints", source: "Product specification review", category: "NOTE" }
    );
  }
  const lifespan = product.durability_score > 7.5
    ? { adverse: "25-30 years", median: "35-40 years", best: "40+ years" }
    : product.durability_score > 6
    ? { adverse: "15-20 years", median: "25-30 years", best: "30-35 years" }
    : { adverse: "8-12 years", median: "15-20 years", best: "20-25 years" };
  return { findings, expected_lifespan: lifespan };
}

function generateBot3MaterialSafety(product) {
  const score = product.material_safety_score;
  return {
    material_safety_score: score,
    grade: score >= 9 ? "A" : score >= 8 ? "B+" : score >= 7 ? "B" : score >= 6 ? "C" : "D",
    tier: score >= 8.5 ? "Tier 1" : score >= 7 ? "Tier 2" : score >= 5.5 ? "Tier 3" : "Tier 4",
    flags: score < 6 ? ["PVC content in frame material", "Potential off-gassing concern"] : score < 7 ? ["Minor VOC considerations during manufacturing"] : [],
    certifications_found: score >= 8.5
      ? ["ILFI Declare Red List Approved", "PHIUS Passive House Certified", "GREENGUARD Gold", "Cradle to Cradle Bronze"]
      : score >= 7
      ? ["ENERGY STAR Certified", "NFRC Certified"]
      : ["NFRC Certified"],
    buyer_note: score >= 8
      ? "Excellent material safety profile. No Red List chemicals detected. Suitable for health-sensitive installations including schools and healthcare facilities."
      : score >= 6.5
      ? "Acceptable material safety profile for standard residential use. Some material components warrant consideration for chemically-sensitive individuals."
      : "Material safety concerns noted. PVC-based frame material may not be suitable for health-priority installations. Consider fiberglass or wood alternatives.",
    reasoning: score >= 8
      ? "Product uses premium, health-conscious materials throughout. Fiberglass frame avoids PVC concerns. Low-E coatings are inert and stable. No volatile adhesives detected in available documentation."
      : score >= 6.5
      ? "Standard material selection with no critical health concerns. Some components use industry-standard adhesives and sealants. Adequate for general residential application."
      : "Vinyl (PVC) frame material presents known concerns regarding chlorine content and potential plasticizer off-gassing, particularly when new and in high-temperature environments."
  };
}

module.exports = {
  SAMPLE_PRODUCTS,
  SAMPLE_SCORE_HISTORY,
  generateDetailedScores,
  generateBot2Findings,
  generateBot3MaterialSafety,
  getGrade,
  getOutlook
};
