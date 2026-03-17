# Phase 7: Deterministic Professional Consensus Scorer

**Date:** March 15, 2026 (evening session)  
**Commit:** `47dca99` on main  
**Files changed:** `deterministic_scorer.js`, `bot_orchestrator_v3.js`  
**Stats:** 257 insertions, 168 deletions

---

## Problem

Professional consensus (1C) was the last subscore still relying on Bot 2's LLM judgment. The evidence file contained 156 sources for Milgard Tuscany, but Bot 2 only cited 6 in its output. This happened because:

1. The entire evidence file (98K chars, ~79K tokens) was injected into Bot 2's context
2. 93% of that file was professional consensus sources
3. Bot 2 suffered from attention decay — sources in the middle of the context were effectively invisible
4. Bot 2 "believed" it was being thorough, but its output showed only 6 of 156 sources

This made the PC score non-deterministic and source-dependent on which sources happened to catch Bot 2's attention.

---

## Solution

Made professional consensus fully deterministic — the 6th and final reformed subscore.

### What changed

#### 1. New all-pool weighted scorer (`deterministic_scorer.js`)

**Old system (v1):** "Highest pool wins" — the scorer found the highest available pool (A, B, or C), used only those sources, and applied that pool's ceiling. No blending.

**New system (v2):** All pools contribute simultaneously with tiered authority weights:

| Pool | Weight | Ceiling | Description |
|------|--------|---------|-------------|
| S | 1.50 | 9.0 | True testing authorities (reserved) |
| A | 1.00 | 7.5 | Expert forums (GBA, FHB, JLC, BSC) |
| B | 0.75 | 6.5 | Verified trade pros (Jay Johnson, channels) |
| C | 0.40 | 5.5 | Consumer feedback (Reddit, forums, reviews) |
| Certification | — | — | Excluded (certs are not opinions) |
| Unknown | 0.40 | 5.5 | Treated as Pool C |

**Per-source credibility weights** (Pool C only, from Phase 6d screen):
- Trade + Technical, no bias: 0.75
- Trade OR Technical: 0.50
- Neither: 0.25
- Price bias detected: 0.50 floor

**Confidence multiplier** (dampens score when few sources):
- <3 sources: 0.30
- 3-5: 0.50
- 6-10: 0.70
- 11-20: 0.85
- 21+: 1.00

**Blended ceiling:** Weighted average of pool ceilings based on contribution weight. Prevents Pool C from inflating scores beyond what experts support.

**Formula:** `score = min(5.0 + consensusRatio × 2.5 × confidence, blendedCeiling)`

#### 2. Evidence data passed to scorer (`bot_orchestrator_v3.js`)

Added `evidenceData` as 4th parameter to `computeDeterministicScores()`. When present, the PC scorer reads sources directly from the evidence file — guaranteed to see all of them. Falls back to Bot 2's output for products without evidence files.

#### 3. PC sources stripped from Bot 2 injection (`bot_orchestrator_v3.js`)

Before injecting the evidence file into Bot 2's prompt, the orchestrator now replaces the `professional_consensus` section with a lightweight note. Bot 2 no longer sees PC sources at all.

**Impact:**
- Evidence file injection: 97,664 → 6,879 chars (**93% reduction**)
- Bot 2 total input tokens: ~79K → ~51K (**37% reduction**)
- Cost savings: ~$0.04-0.06 per run on input tokens
- Near-zero risk of premature `end_turn` (the bug that caused the Milgard failure earlier today)

#### 4. Removed PC pinning and credibility merge (`bot_orchestrator_v3.js`)

The old code pinned evidence file sources onto Bot 2's output and merged credibility tags from the evidence file onto those sources. This was needed because the scorer read from Bot 2's output. Since the scorer now reads from the evidence file directly (which already has credibility tags), both operations are obsolete. Replaced with audit trail notes.

---

## Validation

**Test product:** Milgard Tuscany DH

| Metric | Previous (v1) | Phase 7 (v2) |
|--------|---------------|---------------|
| PC method | pool_based_source_system | deterministic_all_pool_v2 |
| Sources scored | 6 | 150 |
| PC score | 5.42 | 5.10 |
| Bot 2 input tokens | ~79,000 | ~51,000 |
| Bot 2 stop_reason | end_turn (1,747 tokens) | end_turn (1,747 tokens) |
| Bot 2 truncation | None | None |
| Evidence injection chars | 97,664 | 6,879 |

**Score breakdown for Milgard Tuscany (Phase 7):**
- Pool A: 5 sources (weight 1.0 each)
- Pool B: 1 source (weight 0.75)
- Pool C: 144 sources (weight 0.40 × credibility)
- Certification: 6 sources (excluded)
- Sentiment: 26 positive, 101 mixed, 23 negative
- Consensus ratio: 0.041 (slightly positive)
- Blended ceiling: 5.67 (dominated by Pool C volume)
- Final score: 5.10

**Other subscores (unchanged by Phase 7):**
- MQ: 5.75 (unchanged — same complaints)
- MD: 6.00 (unchanged — same material class)

---

## What This Fixes

1. **Every source counts.** 150 sources scored instead of 6. No more attention decay.
2. **Fully reproducible.** Same evidence file → same score, every time. No LLM judgment involved.
3. **93% context reduction for Bot 2.** Eliminates the biggest contributor to premature end_turn.
4. **Cost savings.** ~37% fewer input tokens per Bot 2 call.
5. **Completes the deterministic reform.** All 5 reformed subscores (1A, 1B, 1C, 2B, 2C) are now pure formulas. Bot 2's remaining role is frame_longevity (2A) and the three performance subscores (3A, 3B, 3C).

---

## Phase 7b: Unknown Pool Classification

**Date:** March 15, 2026 (late evening)  
**Commit:** `f5668e0` on main  
**Files changed:** `source_parser.js`, `patch_evidence_pools.js`, 7 evidence files  

### Problem

138 sources across 4 evidence files had `pool: unknown` — meaning the source parser couldn't classify their domains when evidence was originally collected. These defaulted to Pool C weight (0.40) but with no proper ceiling control.

Affected files:
- `andersen_100_series_dh.json` — 44 unknowns
- `andersen_400_series_dh.json` — 36 unknowns
- `jeldwen_v2500_dh.json` — 24 unknowns
- `sierra_pacific_dh.json` — 34 unknowns

### Solution

Systematically classified every unknown domain into the correct pool. Three-pass approach:

**Pass 1: Pool B — Trade publications (6 domains)**
- `usglassmag.com` — US Glass Magazine
- `architectmagazine.com` — Architect Magazine
- `buildshownetwork.com` — Build Show Network
- `inspectapedia.com` — InspectAPedia (building science reference)
- `woodworkingnetwork.com` — Woodworking Network
- `facilityexecutive.com` — Facility Executive

**Pass 2: Pool C — Consumer/dealer sites (13 new domains)**
- Product spec databases: `arcat.com`, `manualzz.com`
- Dealers/retailers: `fairvu.com`, `shepleywood.com`, `builddirect.com`
- Consumer blogs: `mychemicalfreehouse.net`, `jjonesdesignco.com`, `constructioncoverage.com`
- Tangential/false positives kept as C: `simplexhomes.com`, `mpglobalproducts.com`, `parlorcityfurniture.com`, `identifyparts.xyz`
- Typo variant: `replacementwindowsreviews.co`

**Pass 3: Excluded — Not professional opinions (33 new domains)**
- Manufacturer subsidiaries: `renewalbyandersen.com`, `renewalbyandersenreplacement.com`, `andersen.my.site.com`
- Manufacturer CDNs: `cmd-jeld-wen.s3.us-east-2.amazonaws.com`, `edge.sitecorecloud.io`, `images.thdstatic.com`
- Industry suppliers: `cardinalcorp.com`, `quanex.com`, `rochesterinsulatedglass.com`, `sierraglassfabrication.com`
- Regulatory: `energycodeace.com`, `glassforum.org`
- Press releases: `prnewswire.com`, `globenewswire.com`
- Legal: `casetext.com`, `lawgud.com`
- Local news: `twincities.com`, `bizjournals.com`, `pennlive.com`, `hbsdealer.com`, `appeal-democrat.com`, `redding.com`
- False positives: `naturepedic.com`, `reesehitches.com`, `sierra.com`, `sierrapacificfcu.org`, `sierrapacificsupply.com`, `cancer.org`, `en.wikipedia.org`, `naag.org`, `recalls-rappels.canada.ca`, `teachers.sheboygan.k12.wi.us`, `learnasyougrowccc.com`, `pmc.ncbi.nlm.nih.gov`, `business.pacificgrove.org`

### Results

138/138 unknowns classified → **0 unknowns remaining** across all 12 evidence files.

| Evidence File | Unknowns | → Pool B | → Pool C | → Excluded |
|---|---|---|---|---|
| andersen_100_series | 44 → 0 | 2 | 28 | 14 |
| andersen_400_series | 36 → 0 | 2 | 20 | 14 |
| jeldwen_v2500 | 24 → 0 | 2 | 14 | 8 |
| sierra_pacific | 34 → 0 | 1 | 14 | 19 |

### Validated PC Scores (post-7b)

| Product | Pool A | Pool B | Pool C | Excluded | Scored/Total | PC Score |
|---|---|---|---|---|---|---|
| Andersen 100 Series | 8 | 9 | 107 | 33 | 124/163 | 6.24 |
| Andersen 400 Series | 18 | 7 | 99 | 39 | 124/169 | 6.41 |
| JELD-WEN V2500 | 1 | 6 | 72 | 16 | 79/101 | 5.76 |
| Sierra Pacific | 22 | 3 | 65 | 43 | 90/139 | 6.42 |
| Milgard Tuscany | 5 | 6 | 102 | 37 | 113/156 | 6.04 |
| Loewen | 5 | 3 | 3 | 0 | 11/11 | 6.92 |

Score ordering makes sense: Loewen (premium, professional-heavy) > Sierra Pacific/Andersen 400 (strong Pool A presence) > Andersen 100/Milgard (consumer-dominated) > JELD-WEN (budget line).

---

## Phase 7b: Reconciliation Bot Scope Fix (v3)

**Date:** March 15, 2026 (late evening)  
**Commit:** `9f641b6` on main  
**File changed:** `reconciliation_bot.js`

### Problem

Bot 5 (Reconciliation) was the primary source of non-deterministic pipeline halts. The same product with the same data would randomly HALT or PASS across runs:

- Andersen E-Series: 7 HALTED out of ~25 runs
- Milgard Tuscany: 1 HALT in the most recent run
- Pella 250 Series: 3 HALTED runs
- Every product showed the pattern

**Root cause:** Bot 5 compared Bot 1 raw research against Bot 2 raw scoring, but 5 of 6 reformed subscores are now deterministic formula overrides (Phase 7). Bot 5 was debating scores that would be replaced anyway. Since the debate used an LLM (Haiku), it randomly found "disagreements" about deterministic subscores on some runs but not others.

The Milgard escalation transcript showed Bot 5 flagging:
- Item 4: Component Quality tier classification (1A — deterministic override)
- Item 5: Professional Consensus scoring (1C — deterministic override)

Both are computed by formulas. Bot 5 debated them anyway, couldn't resolve them (because Bot 2's LLM output naturally diverges from what the formula would produce), and escalated to Council.

### Solution

Updated all 4 reconciliation prompts (v2 → v3) to explicitly exclude deterministic subscores from debate scope:

**EXCLUDED from debate (deterministic overrides):**
- 1A Component Quality
- 1B Manufacturing Quality  
- 1C Professional Consensus
- 2B Materials/Durability
- 2C Market Quality / Warranty

**IN SCOPE for debate (Bot 2 still controls):**
- 2A Frame Longevity
- 3A Thermal Performance
- 3B Structural Performance
- 3C Air/Water/Sound Performance

All 4 prompts (disagreement detector, Bot 1 advocate, Bot 2 advocate, synthesis) now include explicit scope restrictions.

### Expected Impact

- Eliminates false escalations over deterministic subscores
- Reduces debate scope to 4 subscores instead of ~10
- Should significantly reduce HALT rate
- Maintains quality gate for the subscores Bot 2 actually controls

---

## Remaining Items

1. **`patch_evidence_pools.js` in .gitignore** — Utility script excluded from repo. Kept locally on Mac Mini for future evidence file maintenance.
2. **Batch re-run results** — 5 products re-running with Phase 7b fixes (pool classification + reconciliation scope). Results pending.
