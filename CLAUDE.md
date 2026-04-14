# The Residentialist — Scoring Pipeline

> **Quick reference for Claude.** For the full agent operating manual (orchestration rules, escalation triggers, self-annealing, autonomy levels) read `AGENTS.md`. For new-category construction read `CATEGORY_ONBOARDING_RITUAL.md`.

---

## What This Is

**The Residentialist** is an independent residential product intelligence platform. It scores products across 17 categories (windows, faucets, cabinets, tile, HVAC, etc.) on **Quality, Durability, and Performance** using a deterministic, evidence-based methodology. No manufacturer pays for or influences any rating.

This repo is the **data pipeline** — research, scoring, and import tooling. The public website lives in a companion repo: `GRS5150/residentialist-web`.

---

## Infrastructure

| Resource | Value |
|---|---|
| Mac Mini (Tailscale) | `Residentialist@100.66.157.103` |
| Node.js path | `/usr/local/bin/node` (v25.8.0) |
| Project root | `/Users/Residentialist/.openclaw/workspace/residentialist` |
| SQLite database | `residentialist.db` (in project root) |
| Supabase (PostgreSQL) | Connection string in `.env` as `DATABASE_URL` — Supabase free tier, `aws-1-us-east-1` region |
| API keys | All secrets in `.env` (never committed). Load with `dotenv`. |

**All pipeline commands run on the Mac Mini via SSH.** Never run pipeline scripts locally.

---

## Directory Structure

```
residentialist/
├── CLAUDE.md                     <- This file
├── AGENTS.md                     <- Full agent operating manual (read this)
├── CATEGORY_ONBOARDING_RITUAL.md <- Step-by-step guide for new categories
├── RESIDENTIALIST.md             <- Project overview for AI bootstrapping
├── methodology.md                <- Public-facing scoring methodology
│
├── calibration/                  <- Per-category scoring configs + calibration scripts
│   └── {category}/
│       ├── config.json           <- Product list, weights, tier anchors, manufacturer_domains
│       └── score_*.js            <- Deterministic calibration validator
│
├── curation/                     <- Source curation JSONs (pipeline_progress + sources files)
│   └── {product_slug}_sources.json
│   └── {product_slug}_pipeline_progress.json
│
├── knowledge/                    <- Category research files (required before scoring)
│   ├── system/                   <- System docs: unified_system_doc_v10.md, schema refs
│   └── {category}/               <- Per-category: eval guide, materials safety, rubrics, brief
│
├── output/                       <- Generated investigator reports (EXCLUDED from git)
│   └── investigators/{category}/
│
├── scripts/                      <- Utility and pipeline scripts
│   ├── run_full_pipeline.sh      <- Orchestrates full pipeline for a category (use nohup)
│   ├── run_research.js           <- 4-pass Perplexity research -> knowledge files
│   ├── run_investigator.js       <- Runs Claude investigator, writes final product reports
│   ├── run_deep_dives.js         <- Per-product deep dives (Perplexity)
│   ├── generate_curations.js     <- Builds curation source files from research
│   ├── run_full_audit.js         <- Full quality audit across all categories
│   ├── spec_spot_check.js        <- Deterministic spec validation against DB
│   ├── tag_source_independence.js <- Tags sources as independent/manufacturer
│   ├── red_team_audit.js         <- LLM-based hallucination/contradiction audit
│   ├── source_registry.js        <- Source registry management
│   └── archive/                  <- Retired scripts (do not use)
│
├── schemas/                      <- JSON schemas for product data structures
├── templates/                    <- Prompt templates for research passes
├── data/                         <- Static reference data (price ranges, etc.)
├── evidence/                     <- Source evidence archives
├── logs/                         <- Pipeline run logs (excluded from git)
├── deep_dives/                   <- Deep-dive research output
│
├── deterministic_scorer.js       <- Core scoring engine
├── deterministic_validator.js    <- Validates scores against calibration targets
├── score_from_curation_v2.js     <- Scores a product from its curation sources
├── haiku_auditor.js              <- Claude Haiku audit bot
├── sonnet_scorer.js              <- Claude Sonnet scoring bot
│
├── .env                          <- ALL secrets (never committed)
└── residentialist.db             <- SQLite database (never committed)
```

---

## Database

Two databases are in play:

### 1. SQLite — `residentialist.db` (local, Mac Mini only)
- Internal pipeline database
- Stores: pipeline runs, source registry, spec verifications, scores, audit results
- Never leaves the Mac Mini, never committed to git

### 2. Supabase PostgreSQL — public-facing website data
- Connection string: `DATABASE_URL` in `.env`
- Tables: `categories`, `products`, `product_specs`
- Populated by the import script in `residentialist-web`
- This is what the public website reads at build time

---

## Scoring Methodology (High Level)

The Residentialist uses a **deterministic Composite Score** on a 0-100 scale, divided into three pillars:

| Pillar | Weight (typical) | What it measures |
|---|---|---|
| **Quality** | ~40% | Build materials, certifications, fit/finish, manufacturing consistency |
| **Durability** | ~35% | Longevity, failure rates, installer feedback, warranty terms |
| **Performance** | ~25% | Function-specific metrics (energy efficiency, flow rate, R-value, etc.) |

**Tier assignments:**
- Tier 1: Premium / Best-in-class
- Tier 2: Upper-mid / Very Good
- Tier 3: Mid / Good
- Tier 4: Value / Adequate
- Tier 5: Budget / Below Average

**Evidence requirements:**
- Sources must be independent (no manufacturer content, no paid placements)
- Sources classified as Pool A (evaluative, scored) or Pool B (contextual)
- Source independence ratio tracked per product
- Minimum evidence thresholds per category

**Calibration:**
- Each category has `tier_anchors` in config.json — named products at known tier positions
- Calibration scripts verify the scoring engine reproduces anchor scores within tolerance
- Calibration targets are LOCKED — never modify without explicit Ray approval

---

## Key Scripts and How to Run Them

> CRITICAL: Long-running scripts MUST use `nohup ... &`. Do NOT wait inline. Return immediately.

### Full pipeline for a category
```bash
nohup bash scripts/run_full_pipeline.sh {category} > logs/{category}.log 2>&1 &
# Check progress only when asked:
tail -20 logs/{category}.log
```

### Research only (Perplexity 4-pass)
```bash
node scripts/run_research.js --category {category}
```

### Deep dives (per-product Perplexity)
```bash
node scripts/run_deep_dives.js --category {category}
```

### Run investigator (final product reports)
```bash
node scripts/run_investigator.js --category {category}
```

### Score from curation sources
```bash
node score_from_curation_v2.js --category {category}
```

### Quality audit (all categories)
```bash
node scripts/run_full_audit.js
```

### Load API keys before running LLM scripts
```bash
export ANTHROPIC_API_KEY=$(grep ANTHROPIC_API_KEY .env | cut -d= -f2)
export PERPLEXITY_API_KEY=$(grep PERPLEXITY_API_KEY .env | cut -d= -f2)
```

---

## How This Feeds the Website

The public website (GRS5150/residentialist-web) is a Next.js app that reads from Supabase PostgreSQL at build time.

**Import flow:**
1. Pipeline generates final product data (investigator reports + scores)
2. `residentialist-web/scripts/import-category.ts` reads the output and inserts into Supabase
3. Run: `npx ts-node scripts/import-category.ts --category {category}`
4. After import, trigger a Vercel redeploy (push a commit or redeploy from dashboard)

**Supabase schema (simplified):**
```
categories  (id, slug, name, status, display_order, product_count)
products    (id, category_id, slug, name, composite_score, tier, status, ...)
product_specs (id, product_id, key, value, unit, display_label)
```

**IMPORTANT: `DATABASE_URL` must be set in Vercel Environment Variables dashboard.**
It is NOT in git. It is NOT in the web repo. It is a manual dashboard step.

---

## Rules

- **Research gate:** All four knowledge files must exist in `knowledge/{category}/` before building configs. Non-negotiable.
- **No babysitting:** Launch pipeline in background, return immediately.
- **Scoring integrity:** Never modify locked calibration targets without explicit Ray approval.
- **Autonomy:** Once a plan is approved, execute without asking permission at each step.
- **Secrets stay local:** `.env`, `residentialist.db`, `output/`, `outputs/`, `logs/` never go to git.
