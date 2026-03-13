const { spawn } = require("child_process");
const fs = require("fs");
const args = process.argv.slice(2);
const child = spawn("node", ["auto_runner.js", ...args], {
  cwd: "/Users/Residentialist/.openclaw/workspace/residentialist",
  stdio: ["ignore", "pipe", "pipe"]
});
let out = "", err = "";
child.stdout.on("data", d => { out += d; process.stdout.write(d); });
child.stderr.on("data", d => { err += d; process.stderr.write(d); });
child.on("close", code => {
  fs.writeFileSync("/tmp/pipeline_test.log", "EXIT:" + code + "\nSTDOUT:\n" + out + "\nSTDERR:\n" + err);
});
