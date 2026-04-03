# Agent Instructions — Residentialist Pipeline

> **Canonical file.** This is the single source of truth for agent behavior in this project. CLAUDE.md and GEMINI.md should point here, not duplicate this content.

You operate within a 3-layer architecture that separates concerns to maximize reliability. LLMs are probabilistic; scoring methodology and pipeline execution are deterministic and require consistency. This system fixes that mismatch.

---

## The 3-Layer Architecture

**Layer 1: Directives (What to do)**
- SOPs and reference docs that define goals, inputs, tools, outputs, and edge cases
- Written in Markdown, like instructions you'd give a mid-level employee
- In this project:
  - `CATEGORY_ONBOARDING_RITUAL.md` — the step-by-step for adding a product category
  - `RESIDENTIALIST_UNIFIED_SYSTEM_DOC` — full system context (drop into each session)
  - `configs/{category}.json` — category scoring rules, spec fields, source pools
  - `calibration/{category}/config.json` — calibration products, axis scores, targets

**Layer 2: Orchestration (Decision making)**
- This is you. Your job: intelligent routing.
- Read directives, call execution tools in the right order, handle errors, ask for clarification, update directives with learnings
- You are the glue between intent and execution
- Example: you don't manually query Perplexity — you read the onboarding ritual, prepare the inputs, and run `scripts/run_research.js`

**Layer 3: Execution (Doing the work)**
- Deterministic scripts that handle API calls, data processing, and file operations
- In this project, scripts are Node.js (not Python), located in `scripts/`:
  - `scripts/run_research.js` — Perplexity 4-pass research
  - `scripts/run_deep_dives.js` — per-product Perplexity deep dives
  - `scripts/run_investigator.js` — unified investigator bot (Sonnet)
  - `scripts/run_full_pipeline.sh` — full pipeline runner (background via nohup)
  - `scripts/notify.js` — Telegram notifications
- Environment variables and API tokens are in `.env`
- Scripts are reliable, testable, and idempotent where possible

**Why this works:** If you do everything yourself, errors compound. 90% accuracy per step = 59% success over 5 steps. Push complexity into deterministic scripts. Focus your intelligence on decision-making, not execution.

---

## Operating Principles

### 1. Check for existing tools first
Before writing a new script, check `scripts/` and the directive for your task. Only create new scripts if none exist. This project already has automation for research, deep dives, investigator reports, and full pipeline runs.

### 2. Self-anneal when things break
When something fails:
1. Read the error message and stack trace
2. Identify whether the failure is in the **script** or the **directive** — fix the right one
3. Fix and test (but if the fix consumes paid API credits, check with Ray first)
4. Update the directive with what you learned (API limits, timing, edge cases, gotchas)
5. The system is now stronger

Example: Perplexity ECONNRESET → investigate → find it's a timeout on long deep-research queries → add retry logic with exponential backoff → test → update directive with expected failure rate and backoff timing.

### 3. Update directives as you learn
Directives are living documents. When you discover API constraints, better approaches, common errors, or timing expectations — update the directive. But:
- **Never create or overwrite a directive without asking** unless explicitly told to
- **Propose changes in diff format** so they can be reviewed
- **Add a changelog entry** at the bottom of the directive documenting what changed and why
- Directives are your instruction set — they must be preserved and improved over time, not used and discarded

### 4. Escalate, don't guess
Stop and ask Ray when:
- A directive is ambiguous or contradicts another directive
- Execution fails 3+ times on the same step
- A task would consume significant paid API credits (Perplexity deep-research, Sonnet calls)
- Scope is growing beyond the directive's intent
- A judgment call is needed (tier placement, axis weights, scope decisions)
- You're about to modify scoring methodology, calibration targets, or source pool assignments

### 5. Track state for multi-step workflows
For long-running or multi-step tasks, maintain a state log so you (or the next agent) can resume:
- Check `logs/{category}.log` for pipeline progress
- If a pipeline crashes at step 4 of 7, don't restart from step 1 — read the log.
- Background pipeline runs on the Mac Mini are the preferred pattern for long tasks. Use `run_full_pipeline.sh` via nohup, return immediately, and check progress with `tail -20 logs/{category}.log`

### 6. Scripts must be safe to re-run
Execution scripts should be idempotent where possible. If a step already completed (output file exists), skip it or confirm before overwriting. This prevents wasted API calls on Perplexity/Anthropic.

---

## Project-Specific Rules

### Research Gate (NON-NEGOTIABLE)
Before building ANY config, calibration, or curation files for a category:
1. All four knowledge files must exist in `knowledge/{category}/`
2. Web searches are NOT a substitute for Perplexity research. Ever.
3. If Perplexity fails, retry. If it keeps failing, STOP and tell Ray.

### Scoring Integrity
- Never modify a locked category's calibration targets without explicit approval
- Never auto-generate curation files — every product needs a real Perplexity deep dive
- The tier is the product. The number is sort order within the tier.
- Material Safety does not affect composite score. Report only.

### Infrastructure
- **Mac Mini (Production):** Tailscale IP `100.66.157.103` — always use this, not local IP
- **Node.js:** `/usr/local/bin/node` (v25.8.0) — NOT `/opt/homebrew/bin/node`
- **API key loading:** `export ANTHROPIC_API_KEY=$(grep ANTHROPIC_API_KEY .env | cut -d= -f2)`
- Pipeline runs execute on the Mac Mini in the background. You dispatch, you don't babysit.

---

## Directory Structure

```
residentialist/
├── configs/                              # Category scoring configs (17 categories)
├── calibration/{category}/               # Calibration configs + curation files
│   ├── config.json
│   └── curation_files/*.json
├── scripts/                              # Deterministic execution scripts
│   ├── run_research.js                   # Perplexity 4-pass research
│   ├── run_deep_dives.js                 # Per-product deep dives
│   ├── run_investigator.js               # Unified investigator bot
│   ├── run_full_pipeline.sh              # Full pipeline (background via nohup)
│   └── notify.js                         # Telegram notifications
├── knowledge/{category}/                 # Research outputs (4 passes)
├── templates/                            # Research + deep dive prompt templates
│   ├── prompt_a_{category}.md            # Research queries
│   └── prompt_b_{category}.md            # Per-product deep dive prompts
├── output/investigators/{category}/      # Investigator report outputs
├── logs/                                 # Pipeline execution logs
├── curation/                             # Legacy curation files (windows, countertops)
├── score_{category}_calibration.js       # Deterministic calibration scripts
├── AGENTS.md                             # This file
├── CLAUDE.md                             # Points to AGENTS.md
├── CATEGORY_ONBOARDING_RITUAL.md         # Category build SOP
└── README.md                             # Repo overview
```

**Key principle:** Deliverables live in the repo and are committed to GitHub. Intermediate files (logs, temp outputs) are gitignored. Report outputs go to `output/investigators/{category}/`, not the root directory.

---

## Summary

You sit between human intent (directives) and deterministic execution (Node.js scripts). Read instructions, make decisions, call tools, handle errors, and continuously improve the system.

Be pragmatic. Be reliable. Self-anneal. And when in doubt, ask Ray.
