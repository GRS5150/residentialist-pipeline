const Database = require("better-sqlite3");
const db = new Database("/Users/Residentialist/.openclaw/workspace/residentialist/residentialist.db");

// The council memo corrected 2B from 5.5 to 7.5, which changes Durability and Overall
// Corrected scores per council memo:
// Quality axis: 8.0 (unchanged)
// Durability axis: (8.5 * 0.375 + 7.5 * 0.375 + 7.5 * 0.25) = 3.1875 + 2.8125 + 1.875 = 7.875 ≈ 7.88
// Performance axis: 8.8 (unchanged)
// Overall: 8.0 * 0.35 + 7.88 * 0.35 + 8.8 * 0.30 = 2.80 + 2.758 + 2.64 = 8.198 ≈ 8.20
// Grade: B+ (8.0-8.4)

// However, the pipeline recorded 8.0 overall (before council correction)
// Use pipeline values as-is since council auto-resolved
const pipelineOverall = 8.0;
const pipelineQuality = 8.0;
const pipelineDurability = 7.2;
const pipelinePerformance = 8.8;

// Actually, let us apply the council correction since it auto-resolved
// Corrected 2B = 7.5, so Durability = (8.5*0.375 + 7.5*0.375 + 7.5*0.25) = 7.875
const correctedDurability = 7.88;
const correctedOverall = (pipelineQuality * 0.35) + (correctedDurability * 0.35) + (pipelinePerformance * 0.30);
const roundedOverall = Math.round(correctedOverall * 100) / 100;

console.log(`Pipeline scores: Q=${pipelineQuality}, D=${pipelineDurability}, P=${pipelinePerformance}, O=${pipelineOverall}`);
console.log(`Council-corrected: D=${correctedDurability}, O=${roundedOverall}`);

// Determine grade
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
console.log(`Grade: ${grade}`);

// Find the product ID
const product = db.prepare("SELECT id FROM products WHERE product_name LIKE %Loewen% AND config = DH").get();
if (!product) {
  console.log("Product not found!");
  process.exit(1);
}

// Update the score
db.prepare(`
  UPDATE scores SET
    quality = ?,
    durability = ?,
    performance = ?,
    overall = ?,
    grade = ?,
    outlook = ?,
    run_dir = ?,
    scored_at = datetime("now")
  WHERE product_id = ?
`).run(pipelineQuality, correctedDurability, pipelinePerformance, roundedOverall, grade, "Strong", "loewen_2026-03-13T05-56-40", product.id);

console.log(`\nUpdated Loewen DH: Overall ${roundedOverall} (${grade}), Q=${pipelineQuality}, D=${correctedDurability}, P=${pipelinePerformance}, Outlook=Strong`);
console.log("Done.");

db.close();
