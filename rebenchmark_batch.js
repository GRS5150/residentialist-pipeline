const { runWithAutoCorrection } = require("./auto_runner");

async function main() {
  console.log("=== REDDIT SOURCE RE-BENCHMARK ===");
  console.log("Time: " + new Date().toISOString());
  console.log("");
  
  const products = [
    { name: "Loewen", config: "DH", category: "windows" },
    { name: "Andersen E-Series", config: "DH", category: "windows" }
  ];
  
  for (const p of products) {
    console.log("============================================================");
    console.log("STARTING: " + p.name + " (" + p.config + ")");
    console.log("Time: " + new Date().toISOString());
    console.log("============================================================");
    
    try {
      const result = await runWithAutoCorrection(p.name, p.config, p.category);
      console.log("");
      console.log("FINISHED: " + p.name + " — " + (result.status || "unknown"));
      console.log("Time: " + new Date().toISOString());
    } catch(e) {
      console.log("ERROR: " + p.name + " — " + e.message);
    }
    console.log("");
  }
  
  console.log("============================================================");
  console.log("RE-BENCHMARK COMPLETE");
  console.log("Time: " + new Date().toISOString());
  console.log("============================================================");
}

main().catch(e => { console.error("Fatal:", e.message); process.exit(1); });
