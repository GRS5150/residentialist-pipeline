# Pipeline Revival — September 2026 (read this first in any new session)

The March–April infrastructure (Mac Mini bots, Henry/EC2 orchestration,
Telegram) is RETIRED. The methodology is NOT. As of Sept 2026 the pipeline
runs as an AI conversation (Claude chat / Cowork / Claude Code) using this
repo as the single source of truth.

## How a session starts
1. Clone this repo (it is public): git clone https://github.com/GRS5150/residentialist-pipeline.git
2. Read RESIDENTIALIST_UNIFIED_SYSTEM_DOC_v9.md — the current method. v9 wins
   over v7/v8 and over anything a model remembers from old chats.
3. Load market_context/market-context-index.json for price-band context.

## How a product run works (replaces the 5-bot flow)
1. Deep research in-conversation (replaces Perplexity queue) → evidence sorted
   into the curation schema, sources tagged S/A/B/C per v9 pool weights.
2. All 20 Critical Scoring Rules in v9 apply unchanged. Min 5 sources or refuse.
3. Score via the deterministic calculator (score_calculator.js — run the code,
   never re-derive the math by hand).
4. Add market-context line via market_context/lookup.py (report-only, min 15).
5. Walk evidence from Ray's documented houses (data plates, install photos)
   enters as S-pool primary evidence.

## Calibration gate
Before scoring any NEW product in a session, rescore one benched product
blind (e.g. Marvin Signature, deep_dives/marvin_signature_ultimate_double_hung)
and confirm within ±3 of the benched score. Drift = stop and reconcile.

## End of session
Commit every new artifact (curation files, scores, index refreshes, doc
updates) back to this repo. Nothing lives only in a chat, a Drive file, or a
laptop. If the session can't push, produce the files and hand Ray a one-line
commit instruction for Claude Code on the Mac Mini.
