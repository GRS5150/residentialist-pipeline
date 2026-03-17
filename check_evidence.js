const d=require("./evidence/marvin_signature_ultimate_dh.json");
const pc=d.professional_consensus||{};
const srcs=pc.sources||[];
console.log("Total sources:", srcs.length);
console.log("Sample keys:", Object.keys(srcs[0]||{}));
console.log("Sample:", JSON.stringify(srcs[0], null, 2).slice(0,500));
console.log("---");
console.log("Top-level keys:", Object.keys(d));
