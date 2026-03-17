const q = require("./source_quarantine");
console.log("Module loaded OK. Exports:", Object.keys(q));
const rules = require("./quarantine_rules.json");
console.log("Rules loaded OK. Bad Pool A products:", Object.keys(rules.bad_pool_a));
console.log("Pool S categories:", Object.keys(rules.pool_s_sources));
console.log("Pool S windows sources:", rules.pool_s_sources.windows.length);
