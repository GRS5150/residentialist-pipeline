# Instructions

> **See `AGENTS.md` for the full agent operating manual.** This file exists for Claude Code compatibility. The canonical instructions live in AGENTS.md.

## Quick Reference

You operate in a 3-layer architecture: **Directives** (what to do) → **Orchestration** (you: decisions) → **Execution** (deterministic scripts).

### Research Gate (NON-NEGOTIABLE)
Before building ANY config, calibration, or curation files:
1. All four knowledge files must exist in `knowledge/{category}/`
2. Web searches are NOT a substitute for Perplexity research. Ever.
3. If Perplexity fails, retry. If it keeps failing, STOP and tell Ray.

### Deploy Workflow
1. Build files locally in `~/residentialist-staging/`
2. Deploy to Mac Mini: `bash ~/deploy-to-mini.sh <files>`
3. For pipeline runs: `nohup bash scripts/run_full_pipeline.sh {category} > logs/{category}.log 2>&1 &`
4. Return immediately. Check progress: `tail -20 logs/{category}.log`

### Infrastructure
- **Mac Mini:** Tailscale `100.66.157.103` (always use this, not local IP)
- **Node:** `/usr/local/bin/node` (v25.8.0)
- **API keys:** `export ANTHROPIC_API_KEY=$(grep ANTHROPIC_API_KEY .env | cut -d= -f2)`

### Key Scripts
- `scripts/run_research.js` — 4-pass Perplexity research
- `scripts/run_deep_dives.js` — per-product deep dives
- `scripts/run_investigator.js` — unified investigator (writes to `output/investigators/{category}/`)
- `scripts/run_full_pipeline.sh` — full pipeline (background via nohup)

For full operating principles, self-annealing rules, escalation triggers, and project-specific rules, read `AGENTS.md`.
