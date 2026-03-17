const { classifySource } = require("./source_parser");

const tests = [
  // Manufacturer sites — should be EXCLUDED
  ["https://www.loewen.com/products", "Loewen Products", "desc", "Loewen", "excluded"],
  ["https://technical.loewen.com/installation", "Loewen Install Guide", "desc", "Loewen", "excluded"],
  ["https://www.youtube.com/watch?v=abc123", "Loewen Windows - How We Build", "Loewen Windows channel", "Loewen", "excluded"],
  ["https://www.youtube.com/watch?v=def456", "@LoewenWindows video", "loewenwindows channel", "Loewen", "excluded"],
  ["https://www.marvin.com/windows", "Marvin Windows", "desc", "Marvin Integrity", "excluded"],
  
  // Independent sources — should NOT be excluded
  ["https://www.greenbuildingadvisor.com/article", "GBA Review", "desc", "Loewen", "A"],
  ["https://www.youtube.com/watch?v=xyz", "Matt Risinger reviews Loewen", "matt risinger", "Loewen", "B"],
  ["https://www.reddit.com/r/Homebuilding/abc", "Loewen windows review", "desc", "Loewen", "C"],
  ["https://www.houzz.com/discussions/abc", "Loewen discussion", "desc", "Loewen", "C"],
  
  // Without product name — should still catch static EXCLUDED_DOMAINS
  ["https://www.loewen.com/page", "Loewen Page", "desc", null, "excluded"],
  ["https://www.marvin.com/page", "Marvin Page", "desc", null, "excluded"],
];

let pass = 0, fail = 0;
for (const [url, title, desc, product, expectedPool] of tests) {
  const result = classifySource(url, title, desc, product);
  const ok = result.pool === expectedPool;
  if (ok) pass++; else fail++;
  console.log(ok ? "PASS" : "FAIL", `pool=${result.pool} expected=${expectedPool} type=${result.source_type}`, url.substring(0, 50));
}
console.log(`\n${pass} passed, ${fail} failed`);