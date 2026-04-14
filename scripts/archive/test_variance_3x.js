/**
 * Test Variance — Run Andersen E-Series 3 times, collect scores for comparison
 * Usage: node test_variance_3x.js
 */
const { runWithAutoCorrection } = require("./auto_runner");
const db = require("./db");
const fs = require("fs");

const RUNS = 3;
const results = [];

async function main() {
  console.log("=== VARIANCE TEST: Andersen E-Series x3 ===");
  
  for (let i = 1; i <= RUNS; i++) {
    console.log(`\n--- RUN ${i}/${RUNS} ---`);
    
    // Delete score so pipeline will run
    const sqlDb = db.getDb();
    const rows = sqlDb.prepare("SELECT s.id FROM scores s JOIN products p ON s.product_id = p.id WHERE p.product_name = ?").all("Andersen E-Series");
    rows.forEach(r => sqlDb.prepare("DELETE FROM scores WHERE id = ?").run(r.id));
    
    try {
      const result = await runWithAutoCorrection("Andersen E-Series", "DH", "windows");
      
      // Extract scores from the output dir
      if (result.outputDir && fs.existsSync(result.outputDir + "/DETERMINISTIC_SCORES.json")) {
        const ds = JSON.parse(fs.readFileSync(result.outputDir + "/DETERMINISTIC_SCORES.json", "utf8"));
        const bot2 = JSON.parse(fs.readFileSync(fs.readdirSync(result.outputDir).filter(f => f.includes("bot2_evaluator") && f.endsWith(".json"))[0] ? result.outputDir + "/" + fs.readdirSync(result.outputDir).find(f => f.includes("bot2_evaluator") && f.endsWith(".json")) : "", "utf8"));
        
        results.push({
          run: i,
          outputDir: result.outputDir,
          status: result.status,
          overall: bot2.overall_score,
          quality: bot2.scores?.quality?.axis_score,
          durability: bot2.scores?.durability?.axis_score,
          performance: bot2.scores?.performance?.axis_score,
          mfg_quality: ds.manufacturing_quality?.score,
          prof_consensus: ds.professional_consensus?.score,
          mat_durability: ds.materials_durability?.score,
          repairability: ds.repairability?.score,
          component_quality: bot2.scores?.quality?.component_quality?.score,
          frame_longevity: bot2.scores?.durability?.frame_longevity?.score,
          thermal: bot2.scores?.performance?.thermal?.score,
          structural: bot2.scores?.performance?.structural?.score,
          air_water: bot2.scores?.performance?.air_water?.score,
        });
      } else {
        results.push({ run: i, status: result.status, error: "No output dir or missing DETERMINISTIC_SCORES.json" });
      }
    } catch (err) {
      results.push({ run: i, status: "ERROR", error: err.message });
    }
  }
  
  // Print comparison
  console.log("\n\n=== VARIANCE RESULTS ===");
  console.log(JSON.stringify(results, null, 2));
  
  // Calculate variance for each subscore
  if (results.filter(r => r.overall).length >= 2) {
    const scoreKeys = ["overall", "quality", "durability", "performance", "mfg_quality", "prof_consensus", "mat_durability", "repairability", "component_quality", "frame_longevity", "thermal", "structural", "air_water"];
    console.log("\n=== VARIANCE ANALYSIS ===");
    for (const key of scoreKeys) {
      const vals = results.map(r => r[key]).filter(v => v != null);
      if (vals.length >= 2) {
        const min = Math.min(...vals);
        const max = Math.max(...vals);
        const range = Math.round((max - min) * 100) / 100;
        const avg = Math.round(vals.reduce((a,b) => a+b, 0) / vals.length * 100) / 100;
        const status = range <= 0.5 ? "PASS" : range <= 1.0 ? "MARGINAL" : "FAIL";
        console.log(`${key.padEnd(20)} min=${min} max=${max} range=${range} avg=${avg} ${status}`);
      }
    }
  }
  
  // Save results
  fs.writeFileSync("/Users/Residentialist/.openclaw/workspace/residentialist/outputs/variance_test_results.json", JSON.stringify(results, null, 2));
  console.log("\nResults saved to outputs/variance_test_results.json");
  db.close();
}

main().catch(err => {
  console.error("FATAL:", err);
  db.close();
  process.exit(1);
});
