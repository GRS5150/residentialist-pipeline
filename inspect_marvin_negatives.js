const fs = require("fs");
const path = require("path");
const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic();
const EXCLUDED_POOLS = new Set(["CERTIFICATION", "EXCLUDED"]);

const BAD_SOURCES = [
  "fine-homebuilding-summit-2025",
  "what-is-building-science",
  "budget-friendly-windows-that-you-can"
];

async function main() {
  const d = JSON.parse(fs.readFileSync(path.join(__dirname, "evidence", "marvin_signature_ultimate_dh.json")));
  const allSources = d.professional_consensus?.sources || [];
  
  // Clean bad Pool A
  const sources = allSources.filter(s => {
    const pool = (s.pool || "C").toUpperCase();
    if (pool === "A") {
      const url = (s.url || "").toLowerCase();
      return !BAD_SOURCES.some(f => url.includes(f));
    }
    return true;
  });

  const scoreable = sources.filter(s => {
    const pool = (s.pool || "C").toUpperCase();
    return !EXCLUDED_POOLS.has(pool) && pool !== "UNKNOWN";
  });

  // Classify
  const results = new Map();
  const batchSize = 20;
  for (let i = 0; i < scoreable.length; i += batchSize) {
    const batch = scoreable.slice(i, i + batchSize);
    const numbered = batch.map((s, idx) =>
      `${i + idx}: [Pool ${(s.pool||"C").toUpperCase()}] ${(s.summary || "No summary").replace(/<[^>]+>/g, " ").substring(0, 300)}`
    ).join("\n");

    const resp = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1500,
      messages: [{
        role: "user",
        content: `You are evaluating sources about "Marvin Signature Ultimate" windows for a PRODUCT QUALITY rating.

STEP 1: Is this source about the PRODUCT'S INHERENT QUALITY? Filter out sources about:
- Installation workmanship (sloppy trim, bad caulking, contractor errors)
- Delivery, lead times, or supply chain
- Customer service or sales experience
- Price, value, or cost comparisons
- Regulatory boilerplate (Prop 65, generic certifications)
- Historical issues that have been resolved
- Pure technical specs with no opinion

STEP 2: For qualifying sources, would a knowledgeable professional recommend this product based on its quality?

Classify each as:
- strong_recommend: Clear enthusiastic endorsement of product quality.
- recommend: Positive on quality overall. "Excellent craftsmanship but expensive" = recommend.
- neutral: Genuinely ambivalent about product quality.
- caution: Real concerns about product quality, durability, or reliability.
- avoid: Severe product quality problems.
- skip: NOT about product quality.

Reply ONLY with lines like: 0:recommend

${numbered}`
      }]
    });

    const lines = resp.content[0].text.trim().split("\n");
    for (const line of lines) {
      const match = line.match(/^(\d+)\s*:\s*(strong_recommend|recommend|neutral|caution|avoid|skip)/i);
      if (match) results.set(parseInt(match[1]), match[2].toLowerCase());
    }
  }

  // Print only negative-classified sources
  console.log("=== MARVIN NEGATIVE SOURCES (caution/avoid) ===\n");
  let negCount = 0;
  for (let j = 0; j < scoreable.length; j++) {
    const cls = results.get(j) || "skip";
    const s = scoreable[j];
    if (cls === "caution" || cls === "avoid") {
      negCount++;
      const pool = (s.pool || "C").toUpperCase();
      const summary = (s.summary || "").replace(/<[^>]+>/g, " ").substring(0, 180);
      const url = (s.url || "no url").substring(0, 90);
      console.log(`  ${negCount}. [${cls.toUpperCase()}] Pool ${pool}`);
      console.log(`     ${url}`);
      console.log(`     ${summary}`);
      console.log("");
    }
  }
  console.log(`\nTotal negatives: ${negCount}`);
  
  // Also show Pool A results
  console.log("\n=== POOL A CLASSIFICATIONS ===\n");
  for (let j = 0; j < scoreable.length; j++) {
    const s = scoreable[j];
    if ((s.pool || "C").toUpperCase() === "A") {
      const cls = results.get(j) || "skip";
      const summary = (s.summary || "").replace(/<[^>]+>/g, " ").substring(0, 180);
      console.log(`  [${cls.toUpperCase()}] ${(s.url || "").substring(0, 90)}`);
      console.log(`     ${summary}`);
      console.log("");
    }
  }
}

main().catch(e => { console.error(e); process.exit(1); });
