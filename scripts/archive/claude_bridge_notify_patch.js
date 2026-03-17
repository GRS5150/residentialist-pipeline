// Patch: add /notify endpoint
const fs = require("fs");
const bridgePath = "/Users/Residentialist/.openclaw/workspace/residentialist/claude_bridge.js";
let src = fs.readFileSync(bridgePath, "utf8");
if (src.includes("/notify")) { console.log("Already patched"); process.exit(0); }
const notifyCode = `
      // POST /notify { message }
      if (req.method === "POST" && url === "/notify") {
        const data = JSON.parse(body);
        if (!data.message) { res.writeHead(400); res.end(JSON.stringify({ error: "No message" })); return; }
        const https = require("https");
        const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
        const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
        const tBody = JSON.stringify({ chat_id: CHAT_ID, text: data.message, parse_mode: "Markdown" });
        const opts = { hostname: "api.telegram.org", path: "/bot" + TOKEN + "/sendMessage", method: "POST", headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(tBody) } };
        const treq = https.request(opts, () => {});
        treq.on("error", () => {});
        treq.write(tBody); treq.end();
        log("NOTIFY: " + data.message.slice(0,100));
        res.writeHead(200);
        res.end(JSON.stringify({ sent: true }));
        return;
      }
`;
src = src.replace("res.writeHead(404);", notifyCode + "      res.writeHead(404);");
fs.writeFileSync(bridgePath, src);
console.log("Notify endpoint added");
