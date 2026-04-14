import fs from "fs";

export default function handler(req, res) {
  var p = "/home/ubuntu/.openclaw/workspace/residentialist/outputs/benchmark_results.json";
  if (fs.existsSync(p)) {
    try {
      var data = JSON.parse(fs.readFileSync(p, "utf8"));
      res.status(200).json(data);
    } catch(e) {
      res.status(500).json({ error: "Failed to parse results", message: e.message });
    }
  } else {
    res.status(200).json({ message: "No benchmark results yet. Run benchmark_validator.js first.", results: [], pending: 0, aligned: 0, grayZone: 0, flagged: 0 });
  }
}