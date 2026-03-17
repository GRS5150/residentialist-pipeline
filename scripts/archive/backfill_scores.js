const fs = require("fs");
const path = require("path");
const db = require("./db");
const sqlDb = db.getDb();

const W = { quality: 0.35, durability: 0.35, performance: 0.30 };

function assignGrade(score) {
  if (score == null) return "?";
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

const outDir = "/Users/Residentialist/.openclaw/workspace/residentialist/outputs";

// Get all scores
const allScores = sqlDb.prepare("SELECT s.id, s.product_id, p.product_name as name, p.config, s.overall, s.grade, s.quality, s.durability, s.performance, s.run_dir FROM scores s JOIN products p ON s.product_id = p.id").all();

console.log("=== CURRENT DB STATE ===");
allScores.forEach(s => {
  console.log("  " + s.name + " (" + s.config + "): O=" + s.overall + " " + s.grade + " | Q=" + s.quality + " D=" + s.durability + " P=" + s.performance + " | run=" + s.run_dir);
});

// Step 1: Delete bad entries (overall > 10 or quality > 10)
const badEntries = allScores.filter(s => s.overall > 10 || (s.quality != null && s.quality > 10));
badEntries.forEach(s => {
  console.log("\nDELETING bad entry: " + s.name + " O=" + s.overall + " Q=" + s.quality + " (score id=" + s.id + ")");
  sqlDb.prepare("DELETE FROM scores WHERE id = ?").run(s.id);
});

// Step 2: Update entries with missing axes from their JSON files
const remaining = sqlDb.prepare("SELECT s.id, s.product_id, p.product_name as name, p.config, s.overall, s.grade, s.quality, s.durability, s.performance, s.run_dir FROM scores s JOIN products p ON s.product_id = p.id").all();

remaining.forEach(s => {
  if (s.quality != null && s.durability != null && s.performance != null) {
    console.log("\nSKIP " + s.name + ": axes OK Q=" + s.quality + " D=" + s.durability + " P=" + s.performance);
    return;
  }
  
  if (!s.run_dir) {
    console.log("\nSKIP " + s.name + ": no run_dir");
    return;
  }
  
  const runPath = path.join(outDir, s.run_dir);
  if (!fs.existsSync(runPath)) {
    console.log("\nSKIP " + s.name + ": run_dir missing: " + runPath);
    return;
  }
  
  const jsonFiles = fs.readdirSync(runPath).filter(f => f.endsWith("_bot2_evaluator.json"));
  if (jsonFiles.length === 0) {
    console.log("\nSKIP " + s.name + ": no bot2 JSON");
    return;
  }
  
  try {
    const data = JSON.parse(fs.readFileSync(path.join(runPath, jsonFiles[0]), "utf8"));
    const q = data.scores.quality.axis_score;
    const d = data.scores.durability.axis_score;
    const p = data.scores.performance.axis_score;
    
    const overall = Math.round((q * W.quality + d * W.durability + p * W.performance) * 100) / 100;
    const grade = assignGrade(overall);
    
    console.log("\nUPDATE " + s.name + ": Q=" + q + " D=" + d + " P=" + p + " -> O=" + overall + " " + grade + " (was O=" + s.overall + " " + s.grade + ")");
    
    sqlDb.prepare("UPDATE scores SET quality=?, durability=?, performance=?, overall=?, grade=? WHERE id=?")
      .run(q, d, p, overall, grade, s.id);
    
    // Also update products table
    sqlDb.prepare("UPDATE products SET overall_score=?, quality_score=?, durability_score=?, performance_score=? WHERE id=?")
      .run(overall, q, d, p, s.product_id);
  } catch(e) {
    console.log("\nERROR " + s.name + ": " + e.message);
  }
});

// Final state
console.log("\n=== UPDATED DB STATE ===");
const final = sqlDb.prepare("SELECT s.id, p.product_name as name, p.config, s.overall, s.grade, s.quality, s.durability, s.performance FROM scores s JOIN products p ON s.product_id = p.id ORDER BY s.overall DESC").all();
final.forEach(s => {
  console.log("  " + s.name + " (" + s.config + "): O=" + s.overall + " " + s.grade + " | Q=" + s.quality + " D=" + s.durability + " P=" + s.performance);
});
