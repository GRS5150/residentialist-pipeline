# The Residentialist — Pipeline Roadmap
**Last updated:** March 14, 2026

## Completed Phases

### Phase 1 — Foundation
Git init, mega-file split, Claude Bridge, Telegram listener, auto-runner.

### Phase 2 — Structured Output
v3 orchestrator, JSON output from Bot 2, deterministic validator, Bot 6 report assembly.

### Phase 3 — Cost Optimization
Reconciliation capped at 1 round, council single-call, max 4 Sonnet calls per product.

### Phase 4 — Auto-Diagnosis
`diagnose.js`, auto-fix whitelist, hard rules bypass Claude for known patterns.

### Phase 5 — Database & Evidence
SQLite DB, evidence files, class-conditional priors, non-disclosure policy,
evidence normalization, source dedup, Reddit power users.

### Phase 6a — Source Parser
**Deployed:** March 14, 2026 | **Commit:** `c59c8e5`

Checklist-driven per-source queries using Brave Search API. Each known source
type queried individually, results classified into Pool A / B / C based on
domain rules. Uses snippet text (~160 chars) for classification. Integrated
into auto_runner.js.

**Requires:** `BRAVE_SEARCH_API_KEY` in `.env` on Mac Mini (Ray has key, not yet installed).

---

## Planned / In Progress

### Phase 6b — Full Page Fetching + AI Classification

**Status:** Planned — revisit when snippet-based classification shows errors
**Priority:** Upgrade when needed — not urgent while snippets are accurate
**Trigger:** If source misclassification causes scoring errors, this is the fix

#### What it does
Replace snippet-based source classification with full page fetching and AI-driven
content extraction. Instead of relying on the ~160-character snippet from Brave
search results, Phase 6b would:

1. Fetch the full HTML page for each discovered source URL
2. Extract the relevant content (article text, forum post, review body)
3. Send extracted content to an AI classifier to determine:
   - Pool classification (A/B/C) based on actual content, not just domain
   - Sentiment analysis from full context
   - Price-bias detection from complete text
   - Specific claims extraction (U-factors, complaint details, etc.)

#### Why wait
- Snippets are working well enough for pool classification (domain-based rules)
- Full page fetching adds significant latency (fetch + parse per URL)
- AI classification per page adds cost (~$0.01-0.03 per page with Haiku)
- We need real error data to know WHERE snippets fail before optimizing

#### When to build
- Source parser misclassifies Pool A content as Pool C (or vice versa)
- Sentiment derived from snippets contradicts what the full page says
- Bot 2 makes scoring errors traceable to incomplete source data
- Ray or the pipeline identifies a pattern of snippet-related inaccuracies

#### Estimated scope
- URL fetching module with timeout, retry, robots.txt respect
- HTML-to-text extraction (readability algorithm)
- AI classification prompt (Haiku-class model)
- Integration with existing source_parser.js (swap snippet → full text)
- ~200-400 lines of new code, 1-2 day build

#### Cost estimate
- Per product scored: ~15-30 page fetches × $0.01-0.03 each = $0.15-0.90 in AI
- Adds ~30-60 seconds of latency per product (page fetch + AI calls)
- Brave API cost unchanged (same queries, just fetching result URLs too)

---

### Clad vs Non-Clad Separate Ratings

**Status:** Confirmed by Ray — needs implementation
**Priority:** Medium — affects accuracy of mixed-product-line brands

Products with clad and non-clad variants should be rated separately (e.g.,
Marvin Ultimate vs Marvin Signature). Currently scored as a single product.

**Implementation notes:**
- May need evidence files per variant
- Material class lock already handles this per-run
- Main change is ensuring the product catalog treats them as distinct entries

---

### Escalation Dashboard

**Status:** Ray requested — not yet designed
**Priority:** Medium — quality of life improvement

Replace Telegram-based escalation alerts with a back-end dashboard that presents
decisions cleanly. Ray said: "It would be really nice if the dashboard just
presented this on the back end or something for me."

**What it would show:**
- Products with disagreements between Bot 1 and Bot 2
- Specific decisions needed (e.g., "Pin NFRC values?", "Approve material class?")
- Decision buttons or forms instead of Telegram message parsing
- History of past decisions for audit trail

**Implementation notes:**
- `dashboard.html` already exists as a basic scores viewer
- Would need new endpoints on the bridge for decision queue
- Could integrate with the existing reconciliation bot output

---

### Evidence File Auto-Upgrade

**Status:** Not yet designed — emerged from NFRC fix
**Priority:** Low — the CERTIFICATION_FLOOR pass-through handles this for now

When Phase 6a source parser or Bot 1 finds actual published values (NFRC U-factor,
AAMA test results, etc.) for a product that currently has CERTIFICATION_FLOOR in
its evidence file, automatically upgrade the evidence file to PUBLISHED with the
actual value.

Currently, the fix is that CERTIFICATION_FLOOR evidence doesn't pin (Bot 2 passes
through). A full auto-upgrade would also update the evidence file itself so it
stays current.

---

### Faucets Category

**Status:** On hold per Ray's instruction
**Priority:** Deferred

Windows-only for now. Faucet scoring infrastructure exists (knowledge files,
eval knowledge) but Ray has explicitly deferred this.

---

## Bug Fixes Applied This Session (March 14, 2026)

### Fiberglass-as-Vinyl (FIXED)
`MATERIAL_CEILINGS` table only had `'pultruded fiberglass'` — no plain
`'fiberglass'` entry. Duracast fiberglass fell through to vinyl default.
Added `'fiberglass'` and `'duracast'` entries. Also added to
`getMaterialPriorTier()` and `extractMaterialClass()`.

### Evidence Pin Blocking Real Data (FIXED)
Evidence file performance pins were too aggressive — pinned CERTIFICATION_FLOOR
placeholders even when Bot 1 found real NFRC values. Fixed: pins now only
activate for PUBLISHED/BOUNDED evidence levels.

### Performance Axis Equal Thirds (FIXED)
Evidence-pinned performance axis recalculation was using `(th + st + aw) / 3`.
Fixed to use rubric weights: Thermal 35%, Structural 25%, Air & Water 40%.
