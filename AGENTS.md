# Agent Instructions — Residentialist Pipeline

> **Read this file first. It tells you everything you need to get up to speed.**

---

## Bootstrap (Read These to Get Context)

When starting a new session, read these files in order:
1. **This file** — project rules and infrastructure
2. `knowledge/system/unified_system_doc_v10.md` — full system context, scoring methodology, 20 scoring rules, category status
3. `CATEGORY_ONBOARDING_RITUAL.md` — step-by-step SOP for building a new category
4. A reference config (e.g., `configs/sinks.json`) — to see the format for a completed category

You do NOT need the user to paste anything. Everything is in the repo.

---

## Autonomy Rules

**Once a plan is approved, execute it. Do not ask for permission at each step.**

- Plan first, get approval, then build autonomously until the plan is complete.
- The only reasons to stop and ask:
  - The plan itself needs to change
  - Paid API usage beyond trivial amounts
  - A genuine judgment call the plan didn't anticipate
  - Something destructive and irreversible
- Default posture: build, don't ask.

---

## 3-Layer Architecture

**Layer 1: Directives (What to do)**
- `CATEGORY_ONBOARDING_RITUAL.md` — step-by-step for adding a product category
- `knowledge/system/unified_system_doc_v10.md` — system context and scoring rules
- `configs/{category}.json` — category scoring rules, spec fields, source pools
- `calibration/{category}/config.json` — calibration products, axis scores, targets

**Layer 2: Orchestration (You)**
- Read directives, call scripts in the right order, handle errors
- You don't query Perplexity manually — you run `scripts/run_research.js`

**Layer 3: Execution (Deterministic scripts)**
- `scripts/run_research.js` — Perplexity 4-pass research
- `scripts/run_deep_dives.js` — per-product deep dives
- `scripts/run_investigator.js` — unified investigator bot (writes to `output/investigators/{category}/`)
- `scripts/run_full_pipeline.sh` — full pipeline (background via nohup)
- `scripts/notify.js` — Telegram notifications

---

## Research Gate (NON-NEGOTIABLE)

Before building ANY config, calibration, or curation files:
1. All four knowledge files must exist in `knowledge/{category}/`
2. Web searches are NOT a substitute for Perplexity research. Ever.
3. If Perplexity fails, retry. If it keeps failing, STOP and report.

---

## Scoring Integrity

- Never modify a locked category's calibration targets without explicit approval
- Never auto-generate curation files — every product needs a real Perplexity deep dive
- The tier is the product. The number is sort order within the tier.
- Material Safety does not affect composite score. Report only.

---

## Infrastructure

- **Mac Mini (Production):** Tailscale IP `100.66.157.103` — always use this, not local IP
- **Node.js:** `/usr/local/bin/node` (v25.8.0)
- **API key loading:** `export ANTHROPIC_API_KEY=$(grep ANTHROPIC_API_KEY .env | cut -d= -f2)`
- **Background runs:** `nohup bash scripts/run_full_pipeline.sh {category} > logs/{category}.log 2>&1 &`
- **Check progress:** `tail -20 logs/{category}.log`

---

## Escalation Triggers

Stop and ask ONLY when:
- Requirements are ambiguous or two instructions contradict each other
- Execution fails 3+ times on the same step
- Paid API credits beyond trivial amounts
- Scope is growing beyond what was agreed
- Something destructive and irreversible
- A judgment call on tier placement, axis weights, or methodology

Default: build, don't ask.

---

## Directory Structure

```
residentialist/
├── configs/                              # 17 category scoring configs
├── calibration/{category}/               # Calibration configs + curation files
├── scripts/                              # Deterministic execution scripts
├── knowledge/{category}/                 # Research outputs (4 passes)
├── knowledge/system/                     # System docs and scoring rules
│   └── unified_system_doc_v10.md         # Full system context
├── templates/                            # Research + deep dive prompt templates
├── output/investigators/{category}/      # Investigator report outputs
├── logs/                                 # Pipeline execution logs
├── AGENTS.md                             # This file
├── CLAUDE.md                             # Quick reference, points here
├── CATEGORY_ONBOARDING_RITUAL.md         # Category build SOP
└── README.md                             # Repo overview
```
