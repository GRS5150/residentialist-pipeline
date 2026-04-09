# CLAUDE CODE SESSION: Build Countertop Category Into Pipeline
## Drop this file into Claude Code on the Residentialist Mac Mini

---

## CRITICAL INSTRUCTION — READ THIS FIRST

You are going to ask me every question you need answered BEFORE you write a single line of code. Batch all your questions into ONE prompt at the start. Do not ask me anything after I answer that first batch — figure it out, make reasonable decisions, and document what you decided and why. If something fails, fix it. If you're unsure between two reasonable approaches, pick one and note it in a comment. I am leaving after I answer your initial questions and will not be available.

**The pattern you must follow:**
1. Read all context files and existing code
2. Ask me ALL questions in a single numbered list
3. Wait for my answers
4. Execute everything end to end with zero further input
5. Leave me a summary of what you did, what worked, what needs my review

**Things you are NOT allowed to stop and ask about:**
- File paths (look at the existing code and match the patterns)
- Which API model to use (check .env, match what windows uses)
- How to structure files (match existing patterns in the workspace)
- Error handling (use the same patterns as the existing pipeline)
- Whether to proceed after a non-critical warning

---

## WHAT YOU'RE BUILDING

The scoring pipeline at `/Users/Residentialist/.openclaw/workspace/residentialist/` currently scores windows. You are making it category-aware so it also scores countertops. The pipeline code should stay the same — it loads a config file per category that defines the anchors, source pools, spec fields, and adjustment rules.

### Input Files (copy these to the workspace first)
- `countertop_config.json` — machine-readable category config with anchors, source pools, spec fields, scoring rules
- `tier_anchor_calibration_countertops.md` — research and rationale (save to curation directory as reference)

### What Needs to Change

**1. Make the pipeline category-aware**
- Create a `configs/` directory in the workspace
- Move countertop_config.json there
- Create a matching `window_config.json` by extracting the current hardcoded window values into the same format
- Update pipeline scripts to read config by category parameter instead of hardcoded values
- Every script that currently has window-specific logic (anchors, spec fields, source pools, tier descriptions) should read from config instead

**2. Deep dive prompt — countertop steering**
- The Perplexity deep dive prompt needs to steer toward countertop-relevant topics when category=countertops
- Topics are in the config under `deep_dive_prompt_steering`
- The API call itself doesn't change — just the prompt content

**3. Sonnet structuring — countertop source pools**
- The three-column structuring (Expert / Review / Forum) needs to use countertop source pools when category=countertops
- Source pool definitions are in the config under `source_pools`

**4. Tier classification — countertop anchors**
- The 3x majority vote needs to compare against countertop anchors, not window anchors
- Anchor definitions are in the config under `tier_anchors`

**5. Spec verification — countertop specs**
- Spec fields to verify are in the config under `spec_fields`
- Not U-factor and DP rating — Mohs hardness, heat resistance, warranty terms, etc.

**6. Deterministic score calculator — countertop adjustments**
- Material class adjustments replace operation type adjustments (casement +3, etc.)
- Spec adjustment definitions are in the config under `deterministic_adjustments`
- The ±8 cap stays the same

**7. Run the six calibration deep dives**
- After the pipeline is category-aware, batch-run Perplexity deep dives for these six products:
  1. Cambria Brittanicca
  2. Dekton Aura 15
  3. Caesarstone Calacatta Maximus
  4. MSI Q Premium Calacatta Arno
  5. Ubatuba Granite
  6. White Ice Granite
- Save curation files in the standard location

**8. Score all six through the full pipeline**
- Run each through: Sonnet structuring → 3x majority vote → Haiku audit → deterministic score
- Compare results against target scores in the config under `calibration_products`
- Save a validation report showing: product, target score, actual score, pass/fail

---

## WHAT SUCCESS LOOKS LIKE

When I come back, I should see:
1. A `configs/` directory with `countertop_config.json` and `window_config.json`
2. Pipeline scripts updated to accept a `--category` flag (or equivalent)
3. Six countertop curation files in the curation directory
4. Six countertop products scored in the database
5. A validation report comparing actual scores to targets
6. A summary file documenting every decision you made and anything that needs my attention

### Acceptable Score Ranges (from calibration)
| Product | Target | Acceptable Range |
|---|---|---|
| Cambria Brittanicca | 95 | 92-97 |
| Dekton Aura 15 | 91 | 89-93 |
| Caesarstone Calacatta Maximus | 82 | 79-85 |
| Ubatuba Granite | 80 | 77-83 |
| MSI Q Premium Calacatta Arno | 77 | 74-80 |
| White Ice Granite | 73 | 70-76 |

If a score lands outside the acceptable range, DO NOT adjust it manually. Flag it in the validation report with the evidence from the curation file so I can review why.

---

## EXISTING CODE REFERENCE

Look at these files to understand current patterns:
- `full_pipeline.js` — orchestrator
- `deep_dive_pipeline.js` — Perplexity API calls
- `sonnet_structurer.js` — three-column evidence structuring
- `sonnet_scorer.js` — 3x majority vote tier classification
- `haiku_auditor.js` — contamination audit
- `score_calculator.js` — deterministic scoring
- `spec_verifier.js` — verified specs pipeline
- `run_batch_deep_dives.js` — batch processing
- `rescore_all_tiers.js` — batch rescore

Database: `residentialist.db` (SQLite)
Curation files: `curation_files/` or `curation/` directory

---

## BUDGET / RATE LIMITS

Six Perplexity deep dives (~$1-2 each = ~$6-12 total)
Six products × 3 Sonnet calls each for majority vote = 18 Sonnet calls
Six Haiku audit calls
Sonnet structuring calls

This is well within normal API budget. Do not stop to ask about cost.

---

## REMINDER

Ask me everything up front. One batch. Then run it all. Do not stop.
