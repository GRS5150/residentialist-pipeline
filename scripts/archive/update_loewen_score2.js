const Database = require("better-sqlite3");
const db = new Database("/Users/Residentialist/.openclaw/workspace/residentialist/residentialist.db");

const pipelineQuality = 8.0;
const correctedDurability = 7.88;
const pipelinePerformance = 8.8;
const correctedOverall = (pipelineQuality * 0.35) + (correctedDurability * 0.35) + (pipelinePerformance * 0.30);
const roundedOverall = Math.round(correctedOverall * 100) / 100;
console.log("Corrected Overall:", roundedOverall);

function getGrade(score) {
  if (score >= 9.5) return "A+";
  if (score >= 9.0) return "A";
  if (score >= 8.5) return "A-";
  if (score >= 8.0) return "B+";
  if (score >= 7.5) return "B";
  if (score >= 7.0) return "B-";
  if (score >= 6.5) return "C+";
  if (score >= 6.0) return "C";
  if (score >= 5.5) return "C-";
  if (score >= 5.0) return "D+";
  if (score >= 4.5) return "D";
  if (score >= 4.0) return "D-";
  return "F";
}

const grade = getGrade(roundedOverall);
console.log("Grade:", grade);

const product = db.prepare("SELECT id FROM products WHERE product_name = ?").get("Loewen");
if (!product) { console.log("Not found"); process.exit(1); }
console.log("Product ID:", product.id);

db.prepare("UPDATE scores SET quality = ?, durability = ?, performance = ?, overall = ?, grade = ?, outlook = ?, run_dir = ?, scored_at = datetime(now) WHERE product_id = ?").run(pipelineQuality, correctedDurability, pipelinePerformance, roundedOverall, grade, "Strong", "loewen_2026-03-13T05-56-40", product.id);

console.log("Updated:", roundedOverall, grade, "Q:", pipelineQuality, "D:", correctedDurability, "P:", pipelinePerformance);
db.close();
