# SESSION START — The Residentialist

**Owner:** Ray Shapley (rayshapley@gmail.com)
**What this is:** A product intelligence platform that scores residential building products on Quality, Durability, Performance, and Material Safety.

## To Get Up to Speed (Do These in Order)

1. **Read this file** — you're doing that now
2. **Read `config.json`** — infrastructure, model assignments, file paths, pending decisions
3. **Check recent changes:** `git log --oneline -10` (via bridge shell command)
4. **Check pipeline status:** `GET /status` on the bridge
5. **If methodology context needed:** Read `methodology.md` (scoring rules, calibration data, bot prompts)

## How to Connect to the Mac Mini

All interaction goes through the Claude Bridge (HTTP server with ngrok tunnel).

```bash
# Check bridge is up
curl -sk "BRIDGE_URL/status" -H "x-api-key: BRIDGE_API_KEY"

# Run a shell command
curl -sk -X POST -H "x-api-key: BRIDGE_API_KEY" -H "Content-Type: application/json" \
  -d '{"cmd": "your command here"}' "BRIDGE_URL/shell"

# Read a file
curl -sk "BRIDGE_URL/file?path=/full/path" -H "x-api-key: BRIDGE_API_KEY"

# Write a file
curl -sk -X POST -H "x-api-key: BRIDGE_API_KEY" -H "Content-Type: application/json" \
  -d '{"path": "/full/path", "content": "..."}' "BRIDGE_URL/write"

# Trigger a pipeline run
curl -sk -X POST -H "x-api-key: BRIDGE_API_KEY" -H "Content-Type: application/json" \
  -d '{"product": "Product Name", "config": "DH", "category": "Windows"}' "BRIDGE_URL/run"
```

Bridge URL and API key are in `config.json`.

## File Structure

```
residentialist/
├── config.json              ← Infrastructure, models, file paths, pending decisions
├── methodology.md           ← Scoring rules, calibration data, bot prompts (THE IP)
├── .env                     ← Credentials (not in git)
├── SESSION_START.md         ← This file
├── bot_orchestrator_v2.js   ← Master pipeline controller
├── claude_bridge.js         ← HTTP bridge (ngrok tunnel)
├── bot6_report_assembly_v2.js ← Report generator
├── deterministic_validator.js ← Score integrity checker
├── challenge_bot_v2.js      ← Bot 4 (adversarial)
├── reconciliation_bot.js    ← Bot 5 (reconciliation)
├── council.js               ← Three-member auto-resolver
├── telegram_listener.js     ← Henry Bot (Telegram interface)
├── auto_runner.js           ← Queue & batch runner
├── knowledge/               ← Category-specific knowledge files
│   ├── windows/
│   ├── faucets/
│   ├── cabinets/
│   ├── countertops/
│   └── system/
├── outputs/                 ← Pipeline run outputs (not in git)
└── inputs/                  ← Research inputs for manual runs
```

## Key Rules (Never Violate)

- Scoring weights: Quality 35% / Durability 35% / Performance 30% — NEVER equal thirds
- Material Safety is independent — does NOT fold into overall score
- Field complaints score only in 1B (Manufacturing Quality), never 2B
- Do not disclose AI involvement publicly
- Do not surface MECHANICAL VALIDATION block in reports
- LaunchAgent owns the Telegram listener — do not start it manually
- Always deploy code through the bridge — never edit files directly on Mac Mini

## After Every Code Change

Git auto-commits and pushes. If you're making changes manually, commit:
```bash
cd /Users/Residentialist/.openclaw/workspace/residentialist
git add -A && git commit -m "description of change" && git push origin main
```

## Current State

Check `config.json` → `pending_decisions` for open items.
Check `git log --oneline -10` for recent work.
