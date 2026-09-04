# Nightly Scoring Runner — Spec for Claude Code (Mac Mini, Layer 2)

## Purpose
Keep building the product-scoring database in the background, category by category, without Ray running each session by hand. Ray blesses anchors and escalations; the runner does the work.

## Model tier
- Production runs (research, curation, scoring): Sonnet tier. Cheap, high volume, this is nearly all the work.
- Escalations only (calibration gate failure, proposing a new anchor, a product that can't reach the 5-source minimum): Opus/Fable tier. Called rarely, by the runner itself, not scheduled.
- The deterministic calculator (score_calculator.js) does the actual math either way — model tier affects research quality, not scoring math.

## Nightly loop
1. Pull the repo.
2. Read market_context/scoring-queue-*.txt files. Take the first TODO line.
3. Run it through RESIDENTIALIST_UNIFIED_SYSTEM_DOC_v9.md method: research → curation schema → calibration gate (rescore one benched anchor blind, must land within ±3) → score_calculator.js → market_context/lookup.py for the price-band line (report-only).
4. If the gate fails: STOP that category, write the drift to PENDING_RULING.json, move to the next TODO line in a different category if one exists.
5. Mark the line SCORED, commit.
6. Repeat until nightly time/token budget is spent, or queue is empty.

## Anchor proposals (new — not yet in v9 docs)
Anchors are NOT chosen by Ray. An anchor is proposed only when evidence is overwhelming and one-directional on QUALITY (not price/value — see word-line ruling Sept 4). When the runner finds a candidate:
- Compile the evidence pile (sources, dates, direct claims)
- Tag every claim QUALITY or VALUE; only QUALITY claims count toward anchor eligibility
- Write the proposal to PENDING_RULING.json with the evidence
- Ray approves or rejects in the weekly/3-day digest — never invents the anchor himself

## Monthly integrity check (automated, not Ray's job)
First run of the month: blind-rescore every current anchor. Compare to its benched score. >3 point drift → write to PENDING_RULING.json, do not auto-correct. This replaces a human doing it by hand.

## Digest cadence
Every 3 days, produce a short digest: what got scored, what's stuck in PENDING_RULING.json, any anchor proposals awaiting approval. Delivered via [Ray's chosen channel — Telegram/email, confirm].

## Category priority (current queue order)
1. Windows & Doors — market_context/scoring-queue-windows-doors.txt (built Sept 4; 41 TODO / 17 already scored)
2. Cabinets, Appliances (refrigerators/wall ovens/ranges/dishwashers), Water Heaters, HVAC, Faucets/Toilets, Hardwood, Countertops, Roofing (metal only), Pool Equipment — queue files to be generated the same way (rank by market_context mentions, exclude tile per Sept 4 ruling)

## Guardrails (unchanged from v9 / repo rulings)
- Min 5 sources or refuse to score
- Never sell or take commission on scored products
- Market-context line is report-only, never folds into the score
- Everything commits back to the repo; nothing lives only in a chat session
