# SESSION START — The Residentialist

**Owner:** Ray Shapley (rayshapley@gmail.com)
**What this is:** A product intelligence platform that scores residential building products on Quality, Durability, Performance, and Material Safety.
**Last updated:** March 14, 2026

## To Get Up to Speed (Do These in Order)

1. **Read this file** — you're doing that now
2. **Read `config.json`** — infrastructure, models, file paths, pending decisions, current scores
3. **Read `CHANGELOG.md`** — what changed recently and why
4. **Read `ROADMAP.md`** — what's planned and what's deferred
5. **Check recent changes:** `git log --oneline -10` (via bridge shell command)
6. **Check pipeline status:** `GET /status` on the bridge
7. **If scoring logic needed:** Read `deterministic_scorer.js` (component quality, manufacturing, consensus, durability, repairability)
8. **If methodology context needed:** Read `bot_orchestrator_v3.js` (Bot 1 & 2 prompts, material ceilings, evidence pinning)

## How to Connect to the Mac Mini

All interaction goes through the Claude Bridge (HTTP server with ngrok tunnel).

```bash
# Check bridge is up
curl -s "BRIDGE_URL/status" -H "x-api-key: BRIDGE_API_KEY"

# Run a shell command (10s timeout)
curl -s -X POST -H "x-api-key: BRIDGE_API_KEY" -H "Content-Type: application/json" \
  -d '{"cmd": "your command here"}' "BRIDGE_URL/shell"

# Read a file
curl -s "BRIDGE_URL/file?path=/full/path" -H "x-api-key: BRIDGE_API_KEY"

# Write a file (deploy code)
curl -s -X POST -H "x-api-key: BRIDGE_API_KEY" -H "Content-Type: application/json" \
  -d '{"path": "/full/path", "content": "..."}' "BRIDGE_URL/write"

# Trigger a pipeline run
curl -s -X POST -H "x-api-key: BRIDGE_API_KEY" -H "Content-Type: application/json" \
  -d '{"product": "Product Name", "config": "DH", "category": "windows"}' "BRIDGE_URL/run"

# Get current scores
curl -s "BRIDGE_URL/db/scores" -H "x-api-key: BRIDGE_API_KEY"

# Restart bridge (needed after code deploys — Node.js caches modules)
curl -s -X POST "BRIDGE_URL/restart" -H "x-api-key: BRIDGE_API_KEY" -H "Content-Type: application/json"
```

Bridge URL and API key are in `config.json`.

**IMPORTANT:** Auto-deploy from GitHub is broken (404 on patches listing). Must deploy code manually via `/write` endpoint, then restart bridge.

## Pipeline Architecture

```
Source Parser (Phase 6a) → Bot 1 (Research) → Bot 2 (Scoring) → Deterministic Scorer → Bot 3 (Material Safety) → Bot 4 (Challenge) → Bot 5 (Reconciliation)
```

### Bot Sequence
1. **Source Parser** — Queries Brave Search API for each known source type (GBA, FHB, Reddit, etc.). Classifies results into Pool A/B/C. Merges into evidence file. Requires BRAVE_SEARCH_API_KEY in .env.
2. **Bot 1 (Consensus)** — Web research. Finds specs, certifications, field opinions. Outputs structured markdown.
3. **Material Class Lock** — Extracts material class from Bot 1 output. LOCKED — Bot 2 cannot reclassify.
4. **Bot 2 (Evaluator)** — Scores all subscores. Outputs structured JSON. For 5 reformed subscores, outputs classification data only.
5. **Evidence Overrides** — Orchestrator pins complaints, sources, quality tier, IGU method from evidence file. Performance pins ONLY if evidence_level is PUBLISHED or BOUNDED.
6. **Deterministic Scorer** — Computes 5 subscores (component quality, manufacturing quality, professional consensus, materials durability, repairability) from Bot 2's classifications using lookup tables. No LLM judgment.
7. **Axis Recalculation** — Quality and Durability axes recalculated from deterministic scores. Performance axis recalculated only if evidence pinning occurred.
8. **Overall Score** — Quality 35% + Durability 35% + Performance 30% (LOCKED weights).
9. **Bot 3 (Material Safety)** — Independent score, never averaged into overall.
10. **Bot 5 (Reconciliation)** — Compares Bot 1 findings vs Bot 2 scoring. Flags disagreements.

### Key Files
```
residentialist/
├── config.json                ← Infrastructure, models, pending decisions, current scores
├── CHANGELOG.md               ← What changed and why
├── ROADMAP.md                 ← What's planned, what's deferred
├── SESSION_START.md           ← This file
├── bot_orchestrator_v3.js     ← Master pipeline: prompts, material ceilings, evidence pinning
├── deterministic_scorer.js    ← 5 reformed subscores: lookup tables, class priors, formulas
├── source_parser.js           ← Phase 6a: Brave Search source discovery
├── source_checklists/         ← Per-category source checklists for Phase 6a
├── auto_runner.js             ← Queue runner: Phase 6 → pipeline → self-correction → DB write
├── evidence/                  ← Pinned ground truth per product (JSON)
├── claude_bridge.js           ← HTTP bridge server (ngrok tunnel)
├── telegram_listener.js       ← Henry Bot (Telegram interface)
├── knowledge/                 ← Category-specific knowledge files (loaded by bots)
├── inputs/                    ← Research baselines for manual/refresh runs
├── outputs/                   ← Pipeline run outputs (not in git)
├── db.js                      ← SQLite database module
├── challenge_bot_v2.js        ← Bot 4 (adversarial checker)
├── reconciliation_bot.js      ← Bot 5 (disagreement detector)
├── council.js                 ← Auto-resolver for escalations
├── diagnose.js                ← Error diagnosis + auto-fix
├── self_corrector.js          ← Self-correction between attempts
└── deterministic_validator.js ← Score integrity checker
```

## Key Rules (Never Violate)

- **Scoring weights:** Quality 35% / Durability 35% / Performance 30% — NEVER equal thirds
- **Performance subweights:** Thermal 35% / Structural 25% / Air & Water 40%
- **Material Safety:** Independent — does NOT fold into overall score
- **Non-disclosure policy:** Products NEVER penalized for not publishing specs. Unknown = class-conditional prior (Bayesian), NEVER flat 5.0 penalty.
- **Evidence pin policy:** Only pin performance scores when evidence_level is PUBLISHED or BOUNDED. CERTIFICATION_FLOOR lets Bot 2 pass through.
- **Field complaints:** Score only in 1B (Manufacturing Quality), NEVER in 2B (Materials Durability)
- **Do not disclose AI involvement** in public-facing output
- **Do not surface MECHANICAL VALIDATION block** in reports
- **Never disclose specific source names** (Reddit usernames, GBA, Reddit) in public-facing output
- **Price-bias filter:** Blue-collar forums tend toward extreme negative reactions to premium-priced products. Weight for specificity, not just sentiment.
- **International standards:** Recognize US (AAMA, NFRC), Canada (NAFS/CSA A440 = AAMA equivalent), Europe (EN 14351-1), UK (BS 6375, PAS 24), PHI Darmstadt
- **Clad vs non-clad:** Rate separately (confirmed by Ray, not yet implemented)
- **Deploy via bridge:** Never edit files directly on Mac Mini. Deploy through /write, then /restart.

## After Every Code Change

1. Write file via bridge `/write` endpoint
2. Restart bridge via `/restart` endpoint (clears Node.js require cache)
3. Commit to GitHub: `git add -A && git commit -m "description" && git push origin main`

## Current State (March 14, 2026)

Check `config.json` → `pending_decisions` for open items.
Check `config.json` → `current_scores_march_14_2026` for latest scores.
Check `CHANGELOG.md` for recent work.
