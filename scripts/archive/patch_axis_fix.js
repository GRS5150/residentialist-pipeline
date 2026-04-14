const fs = require("fs");
const filePath = "/Users/Residentialist/.openclaw/workspace/residentialist/auto_runner.js";
let code = fs.readFileSync(filePath, "utf8");

const oldCode = `function extractAxisScores(result) {
  if (result.bot2Parsed && result.bot2Parsed.quality_score != null) {
    return {
      quality: result.bot2Parsed.quality_score,
      durability: result.bot2Parsed.durability_score || null,
      performance: result.bot2Parsed.performance_score || null
    };
  }`;

const newCode = `function extractAxisScores(result) {
  // Primary path: structured JSON from Bot 2 (scores.{axis}.axis_score)
  const s = result.bot2Parsed && result.bot2Parsed.scores;
  if (s && s.quality && s.quality.axis_score != null) {
    return {
      quality: s.quality.axis_score,
      durability: s.durability ? s.durability.axis_score : null,
      performance: s.performance ? s.performance.axis_score : null
    };
  }
  // Legacy path: flat fields (quality_score, durability_score, performance_score)
  if (result.bot2Parsed && result.bot2Parsed.quality_score != null) {
    return {
      quality: result.bot2Parsed.quality_score,
      durability: result.bot2Parsed.durability_score || null,
      performance: result.bot2Parsed.performance_score || null
    };
  }`;

if (!code.includes("result.bot2Parsed.quality_score")) {
  console.log("ERROR: Could not find old code to replace");
  process.exit(1);
}

code = code.replace(oldCode, newCode);
fs.writeFileSync(filePath, code);
console.log("PATCHED: extractAxisScores now checks scores.{axis}.axis_score first");
