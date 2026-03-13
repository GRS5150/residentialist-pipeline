const db = require("./db");
const sqlDb = db.getDb();
// Pella 250 has overall 5.86 but grade C+ -- should be C-
// Recalculate from axes: Q=5.67 * 0.35 + D=6.23 * 0.35 + P=5.67 * 0.30
const q = 5.67, d = 6.23, p = 5.67;
const overall = Math.round((q * 0.35 + d * 0.35 + p * 0.30) * 100) / 100;
console.log("Pella 250 recalc: " + overall);

// Fix the grade
function assignGrade(score) {
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
const grade = assignGrade(overall);
console.log("Correct grade: " + grade);

const row = sqlDb.prepare("SELECT s.id FROM scores s JOIN products p ON s.product_id = p.id WHERE p.product_name LIKE '%Pella 250%'").get();
if (row) {
  sqlDb.prepare("UPDATE scores SET overall = ?, grade = ? WHERE id = ?").run(overall, grade, row.id);
  console.log("Updated score id=" + row.id + " to O=" + overall + " " + grade);
}
