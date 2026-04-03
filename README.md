# Residentialist Scoring Pipeline

AI-powered product intelligence platform that independently evaluates residential building products. Scores products using expert consensus, verified specifications, and corroborated field evidence.

## Quick Start

```bash
# Set API keys
export ANTHROPIC_API_KEY=$(grep ANTHROPIC_API_KEY .env | cut -d= -f2)
export PERPLEXITY_API_KEY=$(grep PERPLEXITY_API_KEY .env | cut -d= -f2)

# Run full pipeline for a category (background)
nohup bash scripts/run_full_pipeline.sh <category> > logs/<category>.log 2>&1 &

# Check progress
tail -20 logs/<category>.log
```

## Directory Structure

```
├── configs/                    # Category scoring configs (17 categories)
├── calibration/<category>/     # Calibration configs + curation files
│   ├── config.json
│   └── curation_files/*.json
├── knowledge/<category>/       # Research outputs (4-pass Perplexity)
├── templates/                  # Research + deep dive prompt templates
│   ├── prompt_a_<category>.md  # 4-pass research queries
│   └── prompt_b_<category>.md  # Per-product deep dive prompts
├── scripts/                    # Automation scripts
│   ├── run_research.js         # Perplexity research (Passes 1-4)
│   ├── run_deep_dives.js       # Per-product deep dives
│   ├── run_investigator.js     # Unified investigator bot (all categories)
│   ├── run_full_pipeline.sh    # Full pipeline: research → dives → investigator
│   └── notify.js               # Telegram notifications
├── output/investigators/       # Investigator report outputs by category
├── logs/                       # Pipeline execution logs
├── curation/                   # Legacy curation files (windows, countertops)
└── score_<category>_calibration.js  # Deterministic calibration scripts
```

## Categories (17 LOCKED)

Windows, Countertops, Cabinets, Faucets, Dishwashers, Refrigerators, Wall Ovens,
Ranges/Cooktops, Toilets, HVAC, Hardwood Flooring, Exterior Doors, Water Heaters,
Sinks, Tile, Lighting Control, Range Hoods

## Methodology

Four-axis scoring: Quality, Performance, Durability (scored), Material Safety (report-only).
Geometric mean composite. 5-tier system (90-100 Best in Class → 0-39 Below Standard).
See `CATEGORY_ONBOARDING_RITUAL.md` for adding new categories.

## Infrastructure

- **Mac Mini (Production):** Tailscale 100.66.157.103
- **EC2 (Spec-Crawler):** 18.218.122.54 (35,700+ product sightings)
- **Node:** /usr/local/bin/node (v25.8.0)
- **Database:** SQLite (residentialist.db)
