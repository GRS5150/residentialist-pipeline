# The Residentialist -- Unified System Document
## April 1, 2026 -- Drop this file into every new session for full context

---

## 1. WHAT THIS IS

The Residentialist is an AI-powered product intelligence platform that independently evaluates residential building products. Owner: Ray Shapley (Austin, TX). The platform scores products using expert consensus anchor placement, verified specifications, and corroborated field evidence. The commercial model is spec quality assessment reports for high-end homebuyers and the real estate agents who serve them.

### Business Positioning
The core insight: there is an invisible quality layer in every home transaction that nobody is measuring. A home inspection checks that things work. An appraisal checks what things are worth based on comps. Nobody checks whether the products in a $3 million home are actually $3 million home products. The Residentialist fills that gap.

No JD Power equivalent exists for residential building products. The Residentialist is building the first standardized, publicly accessible rating system for residential product quality.

### Revenue Model (Launch)
- Spec quality reports: $500 per assessment (buyer or agent submits product list, receives scored report)
- YouTube channel: "Does this home's quality match its price?" -- model home walkthroughs with scoring
- Agent referrals: Agents who learn the system through content send buyer referrals (25% referral fee, ~$8-15K/transaction)
- Design center consultations: $299-499 pre-appointment buyer prep (future)

### Revenue Model (Future)
- Realtor membership program ($500-1K/year)
- National referral network
- Manufacturer data licensing (Year 2+)
- Builder certification program

---

## 2. INFRASTRUCTURE

**Mac Mini (Residentialist) -- PRODUCTION:**
- Tailscale IP: 100.66.157.103 (permanent, works from anywhere)
- Local IP: 192.168.86.37
- User: Residentialist, Password: 5150
- All pipeline code, database, and dashboard: `/Users/Residentialist/.openclaw/workspace/residentialist/`
- Claude Code installed directly on this machine
- Node: /usr/local/bin/node (v25.8.0)
- Dashboard: port 7824 (accessible at http://100.66.157.103:7824)
- Sleep disabled (sudo pmset -a sleep 0 disksleep 0)
- Nightly backups: 2 AM daily, 30-day DB snapshot retention, full workspace rsync
- GitHub: GRS5150/residentialist-pipeline (synced)

**Mac Mini (Ray's main):**
- Tailscale IP: 100.116.86.8
- User: raysahpley
- Claude Code / Antigravity runs here
- SSH to Residentialist: `ssh Residentialist@100.66.157.103`
- SSH to EC2: `ssh -i ~/.ssh/residentialist-key.pem ubuntu@18.218.122.54`

**EC2 (Spec-Crawler -- Active):** 18.218.122.54 (us-east-2, t2.micro, 1GB RAM).
- Spec-crawler codebase: `/home/ubuntu/spec-crawler/`
- Main database: `/home/ubuntu/spec-crawler/data/spec-crawler.json` (~41MB)
- Nightly S3 backup to `s3://residentialist-knowledge/backups/spec-crawler/` at 2:00 AM UTC daily
- Data: 35,700+ product sightings and growing, across national metro scan

**Database:** SQLite at `residentialist.db`

**API Keys (in .env on Mac Mini):**
- Anthropic API (Sonnet + Haiku)
- Perplexity API (sonar-deep-research + sonar-pro models)

### Mac Mini Node.js Path
- Node.js at `/usr/local/bin/node` (v25.8.0). NOT at `/opt/homebrew/bin/node`.
- API key loading: `export ANTHROPIC_API_KEY=$(grep ANTHROPIC_API_KEY .env | cut -d= -f2)`

---

## 3. SCORING METHODOLOGY

### The Four-Axis System

Every product is evaluated on four axes. Three are scored numerically. One is report-only.

**Quality (Scored)** -- Is this product well-made? Component construction, manufacturing precision, professional consensus among installers and specifiers.

**Performance (Scored)** -- Does this product do its primary job well? Category-specific measurables. The performance axis varies by category.

**Durability (Scored)** -- Will it last, and can it be fixed? Longevity, materials quality, repairability, warranty reality.

**Material Safety (Report Only)** -- Is it safe for the people living with it? Flag-based, not gap-based. Does NOT affect the composite score.

### Axis Weights by Category
Axis weights are category-specific, set during calibration to reflect where meaningful variation exists:
- **Windows:** Q=0.35, D=0.35, P=0.30
- **Countertops:** Determined by pipeline config
- **Cabinets:** Q=0.45, D=0.30, P=0.25
- **Faucets:** Q=0.45, D=0.45, P=0.10
- **Dishwashers:** Q=0.30, D=0.40, P=0.30
- **Refrigerators (Built-In):** Q=0.30, D=0.40, P=0.30
- **Wall Ovens:** Q=0.30, D=0.35, P=0.35
- **Ranges/Cooktops:** Q=0.30, D=0.35, P=0.35
- **Toilets:** Q=0.35, D=0.35, P=0.30
- **HVAC:** Q=0.30, D=0.40, P=0.30
- **Hardwood Flooring:** Q=0.35, D=0.35, P=0.30
- **Exterior Doors:** Q=0.40, D=0.35, P=0.25
- **Water Heaters:** Q=0.30, D=0.40, P=0.30
- **Sinks:** Q=0.45, D=0.45, P=0.10

### How a New Category Gets Calibrated (Step 0)

Full process documented in `CATEGORY_ONBOARDING_RITUAL.md`. Two-pass research system (landscape survey + component deep dive) is mandatory. Research FIRST, hierarchy SECOND, config THIRD. This order is non-negotiable.

### Tier Ranges
| Tier | Range | Label |
|---|---|---|
| 1 | 90-100 | Best in Class |
| 2 | 75-89 | Excellent |
| 3 | 60-74 | Good |
| 4 | 40-59 | Fair |
| 5 | 0-39 | Below Standard |

### Source Pool Weights
| Pool | Weight | Who |
|---|---|---|
| S (Star) | 1.50x | Independent authority with documented methodology |
| A (Expert) | 1.00x | Professional reviewers, building science experts |
| B (Review) | 0.75x | Trade publications, experienced reviewers |
| C (Forum) | 0.40x | Reddit, Houzz, individual forum posts |

### Critical Scoring Rules
1. Lawsuits NEVER affect tier classification. Auto-classified as Report Only.
2. 3x majority vote on every tier classification.
3. One deep dive per product line. Variants share curation files.
4. Minimum 5 score sources or pipeline refuses to score.
5. Forum negativity guardrail: DOWN requires 3+ independent reports AND expert contradiction.
6. No auto-generated curation. Every product needs a real Perplexity deep dive.
7. Tier placement + spec adjustments only (no axis stretch in v1.0).
8. Verified specs override deep dive claims. Conflicts skip the adjustment.
9. The tier is the product. The number is sort order within the tier.
10. Material Safety does not affect composite score. Report only.
11. Anchor calibration is a manual collaborative step.
12. Investigator Bot editorial guardrail: Do not repeat inflammatory statements. The number does the work.
13. Anchor products use evidence-based target scores from the calibration file.
14. Source traceability: single source +1, multi-source 0, unknown -1.
15. Corporate Risk Rule: Outlook modifier, report only, does NOT change composite score.
16. N/A rule: if a spec field doesn't apply, calculator skips it.
17. Score base configuration, note upgrade availability.
18. Warranty exclusion consistency: industry-standard exclusions don't reduce score.
19. Score the product, not the brand. Different configs = different scores.
20. European brand evidence asymmetry: low-US-volume European brands have thinner lawsuit evidence. Reports disclose this. No score impact.

---

## 4. INVESTIGATOR BOT

### What It Does
After the composite score is locked, the Investigator Bot reads the curation file and produces the four-axis decomposition plus buyer-facing report content. It does NOT produce or change the composite score.

### Prompt Design Principles
- Framed as an investigator, not a categorizer.
- An even split across axes is explicitly forbidden. If the three scored axes are within 3 points of each other, the prompt has failed.
- At least one strength and one deficiency must be identified for every product.
- Every claim must trace to evidence in the curation file. No speculation.
- Material Safety is label-only, reported separately.
- Editorial guardrail: Report the evidence, let the score speak.

### Company Background Section (Added April 1, 2026)
Every investigator report now includes a Company Background section covering:
- Founding year and ownership structure (family-owned, public, PE-backed, subsidiary)
- Corporate parent (if applicable)
- Where the product is manufactured
- Whether it shares manufacturing with other brands (platform disclosure)
- Recent ownership changes (acquisitions, PE activity)
- Financial health signals (profitable, distressed, bankruptcy risk)
- Whether this is a premium brand or a lower brand repositioned as premium

This was added to `scripts/run_investigator.js` on April 1, 2026. All 8 previously-completed categories (dishwashers, refrigerators, cabinets, faucets, wall ovens, ranges/cooktops, HVAC, toilets) were re-run through the updated investigator to add Company Background. Windows and countertops need config format updates before they can use the unified investigator script.

### Script Location
- `scripts/run_investigator.js` -- unified investigator for all categories (reads calibration config + curation files)
- Category-specific investigator scripts also exist for some categories (legacy pattern)

---

## 5. METHODOLOGY DEFENSIBILITY

### Public Disclosure (What We Say)
"Scores are derived from a proprietary methodology that synthesizes publicly available expert analysis, verified manufacturer specifications, and corroborated field performance data. No manufacturer funds or influences any rating."

### Framework: Disclose the what, protect the how
- Publish: Tier labels and what they mean, that we use anchor products, that specs are verified, that no manufacturer pays for or influences ratings, that field evidence requires 3+ independent reports
- Protect: Source pool weights, spec adjustment formulas, cap, majority vote mechanics, category-specific adjustments, which sources are in which pool

---

## 6. CATEGORY STATUS

### MASTER STATUS TABLE (as of April 1, 2026)

| # | Category | Products | Investigator | Company Background | Git | Status |
|---|----------|----------|---|---|---|---|
| 1 | Windows | 32 | Partial (3 tested) | Needs config update | Pre-existing | LOCKED |
| 2 | Countertops | 6 | Pending | Needs config update | Pre-existing | LOCKED |
| 3 | Cabinets | 6 | 6/6 done | Re-run April 1 | Yes | LOCKED |
| 4 | Faucets | 6 | 6/6 done | Re-run April 1 | Yes | LOCKED |
| 5 | Dishwashers | 6 | 6/6 done | Re-run April 1 | Yes | LOCKED |
| 6 | Refrigerators | 6 | 6/6 done | Re-run April 1 | Yes | LOCKED |
| 7 | Wall Ovens | 6 | 6/6 done | Re-run April 1 | Yes | LOCKED |
| 8 | Ranges/Cooktops | 7 | 7/7 done | Re-run April 1 | Yes | LOCKED |
| 9 | Toilets | 6 | 6/6 done | Re-run April 1 | Yes | LOCKED |
| 10 | HVAC | 6 | 6/6 done | Re-run April 1 | Yes | LOCKED |
| 11 | Hardwood Flooring | 8 | 8/8 done | Built-in | Yes | LOCKED |
| 12 | Exterior Doors | 7 | 7/7 done | Built-in | Yes | LOCKED |
| 13 | Water Heaters | 7 | 7/7 done | Built-in | Yes | LOCKED |
| 14 | Sinks | 7 | 7/7 done | Built-in | Yes | LOCKED |
| 15 | Tile | TBD | Pending | Pending | Pending | IN PROGRESS |

**Total: 14 categories LOCKED, 1 in progress. ~96 products scored.**

### Refrigerators (Built-In Only) -- LOCKED (April 1, 2026)
- Scope: Built-in only. No freestanding, no counter-depth freestanding.
- Config: `configs/refrigerators.json` + `calibration/refrigerators/config.json`
- Calibration script v2: `calibration/refrigerators/score_refrigerators_calibration.js`
- Axis weights: Q=0.30, D=0.40, P=0.30
- 6 for 6 targets hit exactly (v2, post deep dive corrections)

**Calibration Scores (v2 -- Post Deep Dive Corrections):**
| Product | Score | Tier | v1 Score | Change |
|---|---|---|---|---|
| Sub-Zero Classic/Designer/Pro | 95 | Tier 1 | 95 | No change |
| Thermador Freedom Collection | 90 | Tier 1 | 90 | No change |
| Bosch Benchmark Built-In | 79 | Tier 2 | 80 | -1 (warranty 1yr not 2yr, iService5 diagnostic lock) |
| JennAir Built-In Column | 70 | Tier 3 | 66 | +4 (12yr sealed warranty, class action N/A to columns) |
| Dacor Column (DRR30980RAP) | 56 | Tier 4 | 53 | +3 (stainless interior, no ice maker, 15yr parts warranty) |
| Viking 5 Series (FDRB5363) | 45 | Tier 4 | 45 | No change |

**MANDATORY Platform Disclosures:**
- BSH Turkish Factory: Miele, Thermador, Gaggenau, Bosch Benchmark -- same factory. Yale confirmed.
- Samsung/Dacor: Complete convergence (every part DA97/DA94 prefix).
- GE/Monogram: Same Selmer, TN factory as Cafe and Profile.
- Whirlpool/JennAir: Shared platform (W10448874 start device cross-compatible).

### Wall Ovens -- LOCKED (April 1, 2026)
- Scope: Built-in wall ovens only. No ranges, no countertop ovens.
- Config: `configs/wall_ovens.json` + `calibration/wall_ovens/config.json`
- Axis weights: Q=0.30, D=0.35, P=0.35
- 6 for 6 targets hit exactly
- Key finding: Yale wall oven service rate spread is TIGHTER than dishwashers (8.8-10.5% vs 5.6-23%)
- Platform disclosures: BSH (Thermador Masterpiece = Professional internally), Whirlpool/JennAir, GE/Monogram/Cafe

**Calibration Scores:**
| Product | Score | Tier |
|---|---|---|
| Miele H7000 Series | 95 | Tier 1 |
| Wolf M Series | 91 | Tier 1 |
| Thermador Masterpiece | 82 | Tier 2 |
| JennAir Rise | 76 | Tier 2 |
| GE Cafe | 65 | Tier 3 |
| Samsung Flex Duo | 47 | Tier 4 |

### Ranges/Cooktops -- LOCKED (April 1, 2026)
- Scope: Gas ranges + induction cooktops within one category (two sub-types, like gas/induction)
- Config: `configs/ranges_cooktops.json` + `calibration/ranges_cooktops/config.json`
- Axis weights: Q=0.30, D=0.35, P=0.35
- 7 for 7 targets hit exactly
- Electric radiant excluded (commoditized, no meaningful brand differentiation)
- Gas and induction scored within same framework -- fuel type does NOT create automatic tier advantage

**Calibration Scores:**
| Product | Score | Tier | Fuel |
|---|---|---|---|
| Wolf Pro-Style Gas Range | 94 | Tier 1 | Gas |
| BlueStar Platinum Gas Range | 91 | Tier 1 | Gas |
| Thermador Pro Grand Gas Range | 83 | Tier 2 | Gas |
| Thermador Freedom Induction (36") | 81 | Tier 2 | Induction |
| Bosch 800 Induction (36") | 70 | Tier 3 | Induction |
| GE Cafe Gas Slide-In | 64 | Tier 3 | Gas |
| Samsung Gas Slide-In | 45 | Tier 4 | Gas |

### Toilets -- LOCKED (April 1, 2026)
- Config: `configs/toilets.json` + `calibration/toilets/config.json`
- Axis weights: Q=0.35, D=0.35, P=0.30
- Pool S: MaP Testing (confirmed gold standard)
- 6 for 6 targets hit exactly

**Calibration Scores:**
| Product | Score | Tier |
|---|---|---|
| TOTO Neorest NX2 | 95 | Tier 1 |
| TOTO Ultramax II | 92 | Tier 1 |
| Kohler Highline Arc | 80 | Tier 2 |
| American Standard Champion 4 | 67 | Tier 3 |
| Gerber Viper | 64 | Tier 3 |
| Glacier Bay HD | 45 | Tier 4 |

### HVAC (Central AC + Heat Pumps) -- LOCKED (April 1, 2026)
- Config: `configs/hvac.json` + `calibration/hvac/config.json`
- Axis weights: Q=0.30, D=0.40, P=0.30
- Pool S: VACANT (no independent HVAC testing authority with published methodology)
- Key finding: Microchannel coils have 4-5x shorter lifespan than traditional -- major durability finding
- Platform sharing: Carrier/Bryant, Trane/American Standard, Goodman/Amana/Daikin, Rheem/Ruud, York/Coleman
- Note: 4/6 deep dives failed due to Perplexity ECONNRESET. Curation files built from research passes.

**Calibration Scores:**
| Product | Score | Tier |
|---|---|---|
| Carrier Infinity 24VNA | 94 | Tier 1 |
| Trane XV20i | 91 | Tier 1 |
| Lennox SL28XCV | 82 | Tier 2 |
| Rheem Prestige RA20 | 67 | Tier 3 |
| Goodman GSXC18 | 64 | Tier 3 |
| Goodman GSX14 | 47 | Tier 4 |

### Hardwood Flooring -- LOCKED (April 1, 2026)
- Scope: Solid and engineered as sub-types within one category (like casement/DH in windows)
- Config: `configs/hardwood_flooring.json` + `calibration/hardwood_flooring/config.json`
- Axis weights: Q=0.35, D=0.35, P=0.30
- Pool S: VACANT (NWFA standards exist but no independent comparative tester)
- Key spec for engineered: veneer thickness (4mm+ sawn = premium, <2mm rotary = quality cliff, not refinishable)
- 8 for 8 targets hit exactly

**Calibration Scores:**
| Product | Score | Tier | Type |
|---|---|---|---|
| Carlisle Wide Plank White Oak | 94 | Tier 1 | Solid |
| Mirage Sweet Memories White Oak | 91 | Tier 1 | Engineered |
| Mercier Design+ White Oak | 82 | Tier 2 | Engineered |
| Lauzon Designer White Oak | 79 | Tier 2 | Engineered |
| Somerset Character White Oak | 67 | Tier 3 | Solid |
| Shaw Repel White Oak | 64 | Tier 3 | Engineered |
| Bruce Dundee White Oak | 52 | Tier 4 | Solid |
| Bruce Hydropel White Oak | 46 | Tier 4 | Engineered |

### Exterior Doors -- LOCKED (April 1, 2026)
- Config: `configs/exterior_doors.json` + `calibration/exterior_doors/config.json`
- Axis weights: Q=0.40, D=0.35, P=0.25
- Pool S: VACANT (no independent comparative door tester exists)
- Scope: Residential exterior entry doors (fiberglass, steel, solid wood, iron/decorative). Excludes garage doors, sliding patio doors, storm doors.
- 7 for 7 targets hit exactly

**Calibration Scores:**
| Product | Score | Tier |
|---|---|---|
| Marvin Signature Ultimate Entry | 94 | Tier 1 |
| Therma-Tru Classic-Craft Premium | 91 | Tier 1 |
| Pella Reserve Entry | 80 | Tier 2 |
| Therma-Tru Benchmark Entry | 67 | Tier 3 |
| Masonite Performance Door System | 64 | Tier 3 |
| JELD-WEN Builders Series | 48 | Tier 4 |
| Reliabilt Entry (Lowes) | 40 | Tier 4 |

### Water Heaters -- LOCKED (April 1, 2026)
- Scope: Tankless + tank + heat pump as three sub-types within one category
- Config: `configs/water_heaters.json` + `calibration/water_heaters/config.json`
- Axis weights: Q=0.30, D=0.40, P=0.30
- Pool S: VACANT (Yale Appliance does NOT cover water heaters)
- Key findings: Rinnai appeared 78 times in luxury home listings. Navien 15yr warranty drops to 5yr with uncontrolled recirc. Noritz = sleeper (best UEF 0.98, best warranty 25yr unconditional).
- 7 for 7 targets hit exactly

**Calibration Scores:**
| Product | Score | Tier | Type |
|---|---|---|---|
| Rinnai RU199iN SENSEI | 93 | Tier 1 | Tankless |
| Navien NPE-240A2 | 91 | Tier 1 | Tankless |
| Noritz EZ111DV | 82 | Tier 2 | Tankless |
| Bradford White RG250T6N | 80 | Tier 2 | Tank |
| Rheem ProTerra XE80 | 78 | Tier 2 | Heat Pump |
| AO Smith ProLine XE | 67 | Tier 3 | Tank |
| Rheem Performance Plus | 61 | Tier 3 | Tank |

### Sinks -- LOCKED (April 1, 2026)
- Scope: Kitchen and bathroom sinks as sub-types within one category
- Config: `configs/sinks.json` + `calibration/sinks/config.json`
- Axis weights: Q=0.45, D=0.45, P=0.10
- Pool S: VACANT
- Performance essentially flat (like faucets -- all sinks drain water)
- 7 for 7 targets hit exactly

**Calibration Scores:**
| Product | Score | Tier | Type |
|---|---|---|---|
| Rohl Shaws Original Lancaster RC3618 | 94 | Tier 1 | Kitchen (fireclay) |
| Kohler Whitehaven K-6489 | 91 | Tier 1 | Kitchen (cast iron) |
| Blanco IKON 33 Silgranit | 83 | Tier 2 | Kitchen (composite) |
| Kohler Cairn K-8206 Neoroc | 80 | Tier 2 | Kitchen (composite) |
| Kraus Standart PRO KHU100-30 | 68 | Tier 3 | Kitchen (stainless) |
| Kohler Caxton K-2210 | 68 | Tier 3 | Bathroom (vitreous china) |
| Glacier Bay All-in-One VT3322A08 | 45 | Tier 4 | Kitchen (builder stainless) |

### Tile -- IN PROGRESS (April 1, 2026)
- Claude Code building end-to-end
- Porcelanosa appeared 39 times in luxury home listings
- PEI rating, water absorption, DCOF slip resistance are key specs
- Porcelain and ceramic as sub-types

### Categories NOT Yet Started
- LVP (luxury vinyl plank)
- Outdoor kitchens
- Lighting (Visual Comfort 95x, Lutron 334x in listings)
- Home automation (Control4 324x, Sonos 303x, Crestron 143x, Savant 88x in listings)
- Carpet
- Tubs/showers
- Garage doors
- Roofing

---

## 7. AUTOMATION TOOLKIT (Added April 1, 2026)

### What Changed
Category builds are now automated via scripts on the Mac Mini + Claude Code in Antigravity. Ray's manual involvement reduced from ~3 hours/category to ~30 min of checkpoint reviews.

### Scripts on Mac Mini (`scripts/`)
- `scripts/run_research.js` -- Runs Perplexity research passes (4+ per category). Supports `## Pass N`, `## Gas Pass N`, `## Induction Pass N` headers. Uses sonar-deep-research for Pass 1-2, sonar-pro for Pass 3-4. Has `--pass=3,4` flag for selective re-runs. Includes retry logic with 15s/30s/60s exponential backoff for ECONNRESET.
- `scripts/run_deep_dives.js` -- Runs per-product Perplexity deep dives from prompt_b templates. Parses `## MASTER TEMPLATE` + `## PRODUCT:` format, or code block + heading fallback. Has retry logic.
- `scripts/run_investigator.js` -- Unified investigator bot for any category. Reads `calibration/{category}/config.json` + `calibration/{category}/curation_files/`. Includes Company Background section. Auto-commits to git.
- `scripts/notify.js` -- Telegram notification helper. Pings Ray's phone at checkpoints.

### Perplexity Model Selection
- `sonar-deep-research`: Complex multi-step research (Pass 1-2). Takes 3-6 min, holds connection open. Triggers deep research pipeline for complex queries. Sometimes falls back to training data (0 citations) for simpler queries.
- `sonar-pro`: Always does real web search with citations. Better for ranking/hierarchy queries (Pass 3-4). ~15 sec per query.

### Known Issue: ECONNRESET
Perplexity's sonar-deep-research model holds HTTP connections open for 3-6 minutes. Network intermediaries sometimes reset the connection. Retry logic handles this automatically (3 attempts, 15s/30s/60s backoff). Not all deep dives succeed on first try -- this is expected.

### Workflow Per Category (Claude Code)
1. Open fresh Antigravity/Claude Code window
2. Drop in system doc + Onboarding Ritual
3. Tell Claude Code to build category end-to-end
4. Claude Code drafts prompt_a, runs research, builds config/calibration/prompt_b, runs deep dives, builds curation files, runs investigator, commits to git
5. Pauses only for genuine judgment calls (tier placement, axis weights, scope decisions)
6. Telegram pings at each checkpoint

### Telegram Setup
Bot token and chat ID in `.env` on Mac Mini:
- `TELEGRAM_BOT_TOKEN=...`
- `TELEGRAM_CHAT_ID=...`
Setup instructions in `AUTOMATION_SETUP.md`

---

## 8. BUILDER SIGHTINGS DATABASE

### Current Data
- **EC2 (live, growing):** 35,700+ product sightings via national metro scan
- **Mac Mini (static snapshot):** 5,244 product sightings

### Brand Frequency in Luxury Listings (April 1, 2026)
Top brands appearing 50+ times across 10,000+ scanned homes:
Wolf (2,181), Sub-Zero (1,432), Thermador (1,294), Miele (615), Bosch (596), Viking (537), KitchenAid (482), Lutron (334), Control4 (324), Sonos (303), Tesla (256), Pella (191), JennAir (189), Kohler (187), Generac (179), Trex (179), Nest (163), Dacor (160), Monogram (159), Ring (157), Crestron (143), California Closets (132), GE (132), Trane (120), Bertazzoni (115), Hardie (115), Fleetwood (111), LG (104), Cove (103), Gaggenau (103), Hunter Douglas (101), Visual Comfort (95), Andersen (95), Samsung (94), Cambria (89), Savant (88), Marvin (80), Rinnai (78), Fisher & Paykel (78), Toto (72), Carrier (64), Brizo (55), Whirlpool (53)

---

## 9. CONTENT STRATEGY

### YouTube Channel Format
"Does this home's quality match its price?" -- repeatable, shareable, unlimited content supply.

### NotebookLM Integration (Added April 1, 2026)
For category education, build NotebookLM packages:
- Paste calibration text as "Copied text" source
- Calibration text synthesizes all brand stories, failure modes, platform sharing, scores
- Audio instruction focuses hosts on stories and surprises, not dry spec readouts
- First package built: Refrigerators (BSH Turkish factory, Samsung/Dacor, Viking, Sub-Zero)

---

## 10. KEY PRINCIPLES

### Working With Ray
- Wants direct answers, not hedging. If something is wrong, say so.
- Prefers creating over operating. Hires operators as soon as possible.
- Values systematic, scalable operations over high-touch service delivery.
- Requests direct pushback and honest assessment.
- Does NOT want to be the middleman moving files between machines. Claude Code should run end-to-end on the Mac Mini. Ray's involvement is judgment calls only.

---

## 11. IMMEDIATE PRIORITIES (as of April 1, 2026)

**All items 1-28 from v8 are DONE.** Updated priority list:

1. **✅ Lock tile category** -- IN PROGRESS. Claude Code building.
2. **Build LVP category** -- Luxury vinyl plank. Fastest growing flooring in new construction.
3. **Build outdoor kitchens category** -- Ray has deep domain knowledge via Layer Cake.
4. **Build lighting category** -- Lutron (334x), Visual Comfort (95x) in listings.
5. **Build home automation category** -- Control4 (324x), Sonos (303x), Crestron (143x), Savant (88x) in listings.
6. **Update windows + countertops configs** -- Need calibration_products format to use unified investigator script.
7. **Re-run HVAC deep dives** -- 4/6 failed due to Perplexity ECONNRESET. Curation files built from research passes. Worth re-running when API is more stable.
8. **Start YouTube Channel** -- Model home walkthroughs in Austin.
9. **First paid spec report ($500)** -- Real buyer or agent.
10. **Merge sightings database** -- Connect EC2 spec-crawler to scoring pipeline.

### LAUNCH ROADMAP (Updated April 1, 2026)

**MILESTONE: 14 categories LOCKED, ~96 products scored, methodology proven across kitchen, bath, mechanical, surfaces, and envelope. Pipeline automated via Claude Code.**

**Phase 1 -- NEARLY COMPLETE. Build remaining categories:**
- Tile (in progress)
- LVP
- Outdoor kitchens
- Lighting
- Home automation
- Carpet (low priority)
- Tubs/showers
- Garage doors
- Roofing

**Phase 2-6 unchanged from v8.**

---

## 12. FILE LOCATIONS ON MAC MINI

**Pipeline Code:** `/Users/Residentialist/.openclaw/workspace/residentialist/`

**Automation Scripts:** `scripts/`
- `scripts/run_research.js` -- Perplexity research runner (4+ passes per category)
- `scripts/run_deep_dives.js` -- Perplexity deep dive runner (per-product)
- `scripts/run_investigator.js` -- Unified investigator bot (any category)
- `scripts/notify.js` -- Telegram notification helper

**Category Configs:** `configs/`
- `windows.json`, `countertops.json`, `cabinets.json`, `faucets.json`, `dishwashers.json`, `refrigerators.json`, `wall_ovens.json`, `ranges_cooktops.json`, `toilets.json`, `hvac.json`, `hardwood_flooring.json`, `exterior_doors.json`, `water_heaters.json`, `sinks.json`

**Calibration:** `calibration/{category}/`
- Each category has: `config.json`, `curation_files/*.json`, and optionally `score_{category}_calibration.js`

**Templates:** `templates/`
- `prompt_a_{category}.md` -- Research queries (Pass 1-4+)
- `prompt_b_{category}.md` -- Per-product deep dive prompts

**Knowledge Files:** `knowledge/{category}/`
- Research pass outputs + deep dive outputs for each category

**Curation Files:** Two patterns exist:
- New categories: `calibration/{category}/curation_files/`
- Legacy (windows, countertops, some cabinets/faucets): `curation/`

**GitHub:** GRS5150/residentialist-pipeline

---

## 12.5 CURATION FILE FORMAT (Pipeline JSON Schema)

See v8 for full schema. Key fields: sources[], bottom_line, scoring_notes, product_slug, platform_disclosure, outlook, outlook_rationale.

---

## 12.6 CATEGORY ONBOARDING RITUAL

Standardized operating procedure: `CATEGORY_ONBOARDING_RITUAL.md`

Template naming:
- `templates/prompt_a_{category}.md` = Research queries
- `templates/prompt_b_{category}.md` = Per-product deep dive prompts

---

*Last updated: April 1, 2026 (v9)*
*This document replaces v8*
*Changes in v9: Locked 9 new categories (refrigerators v2, wall ovens, ranges/cooktops, toilets, HVAC, hardwood flooring, exterior doors, water heaters, sinks). Added automation toolkit (run_research.js, run_deep_dives.js, run_investigator.js with Telegram notifications). Added Company Background section to investigator bot. Re-ran investigator on 8 categories with Company Background. Added Perplexity model selection (sonar-deep-research vs sonar-pro). Added retry logic for ECONNRESET. Added sightings brand frequency data. Added tile as in-progress. Updated all priorities and roadmap.*
*Tile building in Claude Code. Next: LVP, outdoor kitchens, lighting, home automation.*
