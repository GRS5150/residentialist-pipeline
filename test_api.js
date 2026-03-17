const http = require("http");
function get(path) {
  return new Promise((resolve, reject) => {
    http.get("http://localhost:7824" + path, res => {
      let data = "";
      res.on("data", c => data += c);
      res.on("end", () => resolve(JSON.parse(data)));
    }).on("error", reject);
  });
}
async function main() {
  const products = await get("/api/products");
  console.log("Products:", products.length);
  const marvin = products.find(p => p.product_name && p.product_name.includes("Marvin"));
  if (marvin) {
    console.log("Marvin ID:", marvin.id, marvin.product_name);
    const q = await get("/api/product/" + marvin.id + "/quarantine");
    console.log("Quarantine:", q.total_sources, "total,", q.active_count, "active,", q.quarantined.length, "quarantined,", q.restored.length, "restored");
    if (q.quarantined.length > 0) {
      console.log("Sample:", q.quarantined[0].name, "-", q.quarantined[0].quarantine_reason);
    }
  } else {
    console.log("No Marvin product found. First 3:", products.slice(0,3).map(p => p.product_name));
  }
}
main().catch(e => console.error(e));
