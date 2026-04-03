# Agent Instructions — Residentialist Pipeline

> **This file extends the universal AGENTS.md with project-specific rules.** The universal operating principles (autonomy, planning, self-improvement, escalation) apply here. This file adds Residentialist-specific architecture and constraints.

---

## 3-Layer Architecture

**Layer 1: Directives (What to do)**
- `CATEGORY_ONBOARDING_RITUAL.md` — step-by-step for adding a product category
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

## Directory Structure

```
residentialist/
├── configs/                              # 17 category scoring configs
├── calibration/{category}/               # Calibration configs + curation files
├── scripts/                              # Deterministic execution scripts
├── knowledge/{category}/                 # Research outputs (4 passes)
├── templates/                            # Research + deep dive prompt templates
├── output/investigators/{category}/      # Investigator report outputs
├── logs/                                 # Pipeline execution logs
├── AGENTS.md                             # This file (project-specific)
├── CLAUDE.md                             # Quick reference, points here
├── CATEGORY_ONBOARDING_RITUAL.md         # Category build SOP
└── README.md                             # Repo overview
```
