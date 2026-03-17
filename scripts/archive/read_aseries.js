const fs = require("fs");
const d = JSON.parse(fs.readFileSync("/Users/Residentialist/.openclaw/workspace/residentialist/outputs/andersen_aseries_2026-03-16T17-49-46/andersen_aseries_bot2_evaluator.json", "utf8"));

console.log("=== PERFORMANCE SCORES ===");
const perf = d.scores.performance;
console.log("Thermal:", JSON.stringify(perf.thermal, null, 2));
console.log("Structural:", JSON.stringify(perf.structural, null, 2));
console.log("Air/Water:", JSON.stringify(perf.air_water, null, 2));
console.log("Axis score:", perf.axis_score);

console.log("\n=== TRANSPARENCY REPORT ===");
if (d.transparency_report && d.transparency_report.performance_evidence) {
  d.transparency_report.performance_evidence.forEach(e => {
    console.log(e.subscore + " | evidence: " + e.evidence_level + " | metric: " + e.metric + " | published: " + e.published_value + " | score: " + e.score_given);
  });
}

console.log("\n=== FRAME LONGEVITY ===");
console.log(JSON.stringify(d.scores.durability.frame_longevity, null, 2));

console.log("\n=== CERTIFICATIONS ===");
console.log(JSON.stringify(d.scores.quality.manufacturing_quality.certifications, null, 2));

console.log("\n=== OVERALL ===");
console.log("Overall:", d.overall_score, "Grade:", d.grade);
