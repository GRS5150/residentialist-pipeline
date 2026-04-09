# Residentialist Pipeline — Agent Bootstrap

> **Read this first.** This workspace controls the Residentialist product scoring pipeline.

## What This Is

AI-powered product intelligence platform that independently evaluates residential building products. 17 categories locked (windows, tile, HVAC, etc.), more being built. You are helping build and maintain this pipeline.

## Where The Code Lives

The pipeline runs on a **Mac Mini** (not this local machine). All commands execute via SSH:

```bash
ssh Residentialist@100.66.157.103
```

Project directory: `/Users/Residentialist/.openclaw/workspace/residentialist`

## First Steps In Any Session

1. SSH into the Mac Mini
2. Read `AGENTS.md` in the project root — it has full instructions, architecture, and rules
3. Read `CATEGORY_ONBOARDING_RITUAL.md` if building a new category
4. Read `knowledge/system/unified_system_doc_v10.md` for scoring methodology and system context
5. Look at a reference config (e.g., `configs/sinks.json`) to understand the format

## Common Tasks

**Build a new category:**
Follow the onboarding ritual. Research → config → calibration → curation → investigator.

**⚠️ CRITICAL: Fire and forget. Do NOT babysit pipeline runs.**
Research takes 12-24 minutes. Deep dives take longer. Launch the pipeline in the background and RETURN IMMEDIATELY. Do not poll logs. Do not sleep-and-check. Do not wait for completion.

```bash
# Launch — this is ONE command, then you're done
ssh Residentialist@100.66.157.103 "cd /Users/Residentialist/.openclaw/workspace/residentialist && nohup bash scripts/run_full_pipeline.sh {category} > logs/{category}.log 2>&1 &"
```

Tell the user: "Pipeline launched. Check back in 20-30 minutes."

**Check pipeline progress (only when the user asks):**
```bash
ssh Residentialist@100.66.157.103 "tail -20 /Users/Residentialist/.openclaw/workspace/residentialist/logs/{category}.log"
```

**Add products to an existing category:**
Update `calibration/{category}/config.json`, add curation files, re-run investigator.
**`manufacturer_domains` is required** for every product in config.json. Maps each product slug to an array of domains belonging to that manufacturer and its corporate parent. The curation filter uses this to exclude non-independent sources. Example:
```json
"manufacturer_domains": {
  "merillat_classic": ["merillat.com", "masterbrand.com", "fortunebrands.com"],
  "kraftmaid_base": ["kraftmaid.com", "masterbrand.com", "fortunebrands.com"]
}
```

## Rules

- **Research gate:** All four knowledge files must exist before building configs. Non-negotiable.
- **Autonomy:** Once a plan is approved, build without asking permission at each step.
- **Scoring integrity:** Never modify locked calibration targets without explicit approval.
