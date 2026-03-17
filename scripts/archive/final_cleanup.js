const db = require("./db");
const sqlDb = db.getDb();

// Delete the bad Ply Gem entry (the one with null axes)
const badPly = sqlDb.prepare("SELECT s.id, s.overall, s.quality, s.run_dir FROM scores s JOIN products p ON s.product_id = p.id WHERE p.product_name LIKE '%Ply Gem%' AND s.quality IS NULL").all();
badPly.forEach(s => {
  console.log("Deleting bad Ply Gem: id=" + s.id + " O=" + s.overall + " Q=" + s.quality + " run=" + s.run_dir);
  sqlDb.prepare("DELETE FROM scores WHERE id = ?").run(s.id);
});

// Now backfill Andersen E-Series from JSON
const fs = require("fs");
const path = require("path");
const outDir = "/Users/Residentialist/.openclaw/workspace/residentialist/outputs";

// Check Andersen - use the run_dir from its score
const andersen = sqlDb.prepare("SELECT s.id, s.run_dir, s.quality, s.durability, s.performance FROM scores s JOIN products p ON s.product_id = p.id WHERE p.product_name LIKE '%Andersen E%'").get();
if (andersen) {
  console.log("\nAndersen current: Q=" + andersen.quality + " D=" + andersen.durability + " P=" + andersen.performance + " run=" + andersen.run_dir);
  
  // Read the JSON for this run
  const jsonPath = path.join(outDir, andersen.run_dir);
  const jsonFiles = fs.readdirSync(jsonPath).filter(f => f.endsWith("_bot2_evaluator.json"));
  if (jsonFiles.length > 0) {
    const data = JSON.parse(fs.readFileSync(path.join(jsonPath, jsonFiles[0]), "utf8"));
    const q = data.scores.quality.axis_score;
    const d = data.scores.durability.axis_score;
    const p = data.scores.performance.axis_score;
    const overall = Math.round((q * 0.35 + d * 0.35 + p * 0.30) * 100) / 100;
    console.log("From JSON: Q=" + q + " D=" + d + " P=" + p + " -> O=" + overall);
    
    // Update if needed
    if (andersen.quality != q || andersen.durability != d || andersen.performance != p) {
      function assignGrade(score) {
        if (score >= 9.5) return "A+"; if (score >= 9.0) return "A"; if (score >= 8.5) return "A-";
        if (score >= 8.0) return "B+"; if (score >= 7.5) return "B"; if (score >= 7.0) return "B-";
        if (score >= 6.5) return "C+"; if (score >= 6.0) return "C"; if (score >= 5.5) return "C-";
        if (score >= 5.0) return "D+"; if (score >= 4.5) return "D"; if (score >= 4.0) return "D-";
        return "F";
      }
      const grade = assignGrade(overall);
      sqlDb.prepare("UPDATE scores SET quality=?, durability=?, performance=?, overall=?, grade=? WHERE id=?")
        .run(q, d, p, overall, grade, andersen.id);
      console.log("Updated Andersen to O=" + overall + " " + grade);
    }
  }
}

// Final state
const final = sqlDb.prepare("SELECT p.product_name as name, s.overall, s.grade, s.quality, s.durability, s.performance FROM scores s JOIN products p ON s.product_id = p.id ORDER BY s.overall DESC").all();
console.log("\n=== FINAL CLEAN DB ===");
final.forEach(s => {
  console.log("  " + s.name + ": " + s.overall + " " + s.grade + " | Q=" + s.quality + " D=" + s.durability + " P=" + s.performance);
});
