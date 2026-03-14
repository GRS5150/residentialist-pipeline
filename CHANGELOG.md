# The Residentialist — Changelog

## March 14, 2026 (Session: Perplexity Computer)

### Phase 6a — Source Parser (Built & Deployed)
**Commit:** `c59c8e5`
- Built `source_parser.js` (1,496 lines, 33 self-tests passing)
- Checklist-driven per-source queries using Brave Search API
- Each known source type queried individually, results classified into Pool A/B/C by domain rules
- Integrated into `auto_runner.js` — runs before pipeline, merges into evidence files
- Created `source_checklists/windows.json` with 15+ source types
- Uses snippet text (~160 chars) for classification — see Phase 6b in ROADMAP.md for full-page upgrade path
- Requires `BRAVE_SEARCH_API_KEY` in `.env` (Ray has the key, needs to paste it)

### Fiberglass-as-Vinyl Bug Fix
**Commit:** `03406fc`
- **Root cause:** `MATERIAL_CEILINGS` table only had `'pultruded fiberglass'` — no plain `'fiberglass'` entry. When Bot 1 extracts "Fiberglass (proprietary Duracast composite)", the substring match fails because "pultruded" isn't in the input. Falls through to vinyl default (base 5, ceiling 6 instead of base 9, ceiling 10).
- **Fix:** Added `'fiberglass'` and `'duracast'` entries to MATERIAL_CEILINGS in `bot_orchestrator_v3.js`
- **Also:** Added `duracast` to `getMaterialPriorTier()` in `deterministic_scorer.js` and `extractMaterialClass()` keyword scanner
- **Also:** Added `console.warn` when material class falls through to default — will catch future unrecognized materials

### Evidence Pin Policy Fix (NFRC Values Blocked)
**Commit:** `03406fc`
- **Root cause:** Evidence file `pella_impervia_dh.json` had `u_factor: null, evidence_level: "CERTIFICATION_FLOOR", score: 6`. The orchestrator pinned this score=6 over Bot 2's output — even though Bot 1 found actual NFRC values (U-factor 0.48, SHGC 0.58-0.59). Stale placeholder blocked real data.
- **Fix:** Evidence file performance pins now only activate when `evidence_level` is `PUBLISHED` or `BOUNDED` (actual hard data). `CERTIFICATION_FLOOR` and lower let Bot 2's score pass through.
- **Policy:** This is a universal fix — applies to ALL products, not just Pella Impervia. Any evidence file with CERTIFICATION_FLOOR performance data will let Bot 2 upgrade the score when it finds real values.

### Performance Axis Weight Fix
**Commit:** `03406fc`
- Evidence-pinned performance axis recalculation was using equal thirds (`(th + st + aw) / 3`)
- Fixed to use actual rubric weights: Thermal 35%, Structural 25%, Air & Water 40%

### Batch Rescore Results (overnight March 13-14)
- 6 of 7 products passed successfully with new class-conditional priors
- Pella Impervia escalated (fiberglass-as-vinyl bug + NFRC pin bug)
- Final scores recorded in `config.json` → `current_scores_march_14_2026`

### Documentation
- Created `ROADMAP.md` — Phase 6b trigger conditions, clad/non-clad, dashboard, faucets
- Created `CHANGELOG.md` — this file
- Updated `SESSION_START.md` — current architecture, pipeline flow, key files
- Updated `config.json` — pending decisions, current scores, build status, file map
- Updated `pella_impervia_dh.json` — session notes, policy annotations

---

## March 13, 2026 (Session: Perplexity Computer)

### Class-Conditional Priors (Non-Disclosure Policy)
**Commit:** `0ef15ff`
- Replaced flat 5.0 "unknown" penalties with Bayesian class-conditional priors
- Three material tiers: wood_clad, fiberglass, vinyl — each with expected component profiles
- Non-disclosure is NEVER a penalty — products get the typical score for their material class
- `SEAL_UNKNOWN` deduction removed from Materials Durability allowed adjustments
- Research basis: Bayesian imputation, S&P Global ESG model, Grossman-Milgrom disclosure theory
- Ray's directive: "them leaving something out for business reasons doesn't affect the durability or quality to the end user"

### Evidence Normalization
**Commit:** `1685d6f`
- Thermal performance evidence normalized across evidence files

### Source Dedup + Reddit Power Users
**Commit:** `0927524`
- Professional consensus deduplicates sources by name (pinned evidence takes precedence over Bot 2 discoveries)
- Reddit power user identification module

### Reddit 403 Fix
**Commit:** `e24a54a`
- Fixed Reddit returning 403 errors during Bot 1 research

---

## Earlier Sessions (Pre-March 13)

### Phase 5 — Database & Evidence System
- SQLite database (`db.js`) with scores, runs, stats tables
- Migration script (`migrate_to_db.js`) from flat files to DB
- Bridge endpoints: `/db/scores`, `/db/stats`
- Pipeline writes scores to DB after successful runs
- "Already scored?" check prevents redundant pipeline runs
- Evidence files (`evidence/*.json`) — pinned ground truth per product

### Phase 4 — Auto-Diagnosis
- `diagnose.js` — error triage with auto-fix whitelist
- Hard rules bypass Claude for known error patterns
- `/diagnose` bridge endpoint

### Phase 3 — Cost Optimization
- Reconciliation capped at 1 debate round (was 3)
- Council reduced to single structured call (was 3-member vote + synthesis)
- Max 4 Sonnet calls per product for reconciliation

### Phase 2 — Structured Output
- v3 orchestrator with JSON output from Bot 2
- Deterministic validator for score integrity
- Bot 6 report assembly updated

### Phase 1 — Foundation
- Git init, mega-file split, baseline commit
- Claude Bridge (`claude_bridge.js`) with ngrok tunnel
- Telegram listener (`telegram_listener.js`) — "Henry Bot"
- Auto-runner (`auto_runner.js`) with self-correction loop

---

## Known Issues & Deferred Items

| Item | Status | Notes |
|------|--------|-------|
| Pella Impervia rescore | WAITING | Needs rescore after fiberglass + NFRC fix |
| Brave API key | WAITING | Ray has key, needs to paste for .env |
| Clad vs non-clad ratings | CONFIRMED | Rate separately — not yet implemented |
| Escalation dashboard | REQUESTED | Ray wants back-end dashboard, not Telegram clutter |
| Phase 6b (full page fetch) | PLANNED | Build when snippet errors surface |
| Faucets category | ON HOLD | Per Ray's instruction |
| Alpen ZR-7 conflict | WAITING | 8.70 vs 9.1 — Ray must resolve |
| Simonton 5500 conflict | WAITING | 6.9 vs 6.2 — Ray must resolve |
| Pella 350 | REJECTED | Vinyl PVC, not aluminum-clad wood |
