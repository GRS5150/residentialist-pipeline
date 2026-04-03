# The Residentialist -- Unified System Document
## April 2, 2026 -- Drop this file into every new session for full context

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
- Tailscale IP: 100.66.157.103 (permanent, works from anywhere -- USE THIS, NOT LOCAL IP)
- Local IP: 192.168.86.37 (UNRELIABLE -- frequently times out, do not use)
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
- Local staging directory: `~/residentialist-staging/` (all generated files land here first)
- Deploy script: `~/deploy-to-mini.sh` (SCPs files to Mac Mini workspace)
- CLAUDE.md in project root (workflow rules + research gate, auto-read by Claude Code)

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
- **Tile:** Q=0.35, D=0.35, P=0.30
- **Lighting Control:** Q=0.40, D=0.30, P=0.30
- **Range Hoods:** Q=0.30, D=0.25, P=0.45

### How a New Category Gets Calibrated (Step 0)

Full process documented in `CATEGORY_ONBOARDING_RITUAL.md`. Four-pass research system (landscape survey, component deep dive, hierarchy top, hierarchy bottom) is mandatory. Research FIRST, hierarchy SECOND, config THIRD. This order is non-negotiable.

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

### MASTER STATUS TABLE (as of April 2, 2026)

| # | Category | Products | Research (4-pass) | Deep Dives | Investigator | Git | Status |
|---|----------|----------|---|---|---|---|---|
| 1 | Windows | 32 | Pre-existing knowledge | Pre-existing | Partial (3 tested) | Yes | LOCKED |
| 2 | Countertops | 6 | Pre-existing knowledge | Pre-existing | Pending | Yes | LOCKED |
| 3 | Cabinets | 6 | Pre-existing knowledge | Pre-existing | 6/6 done | Yes | LOCKED |
| 4 | Faucets | 6 | StarCraft = de facto Pass 2 | Pre-existing | 6/6 done | Yes | LOCKED |
| 5 | Dishwashers | 6 | Rebuilt April 2 | Rebuilt April 2 | Rebuilt April 2 | Yes | LOCKED |
| 6 | Refrigerators | 6 | Rebuilt April 2 | Rebuilt April 2 | Rebuilt April 2 | Yes | LOCKED |
| 7 | Wall Ovens | 6 | Full 4-pass | Full deep dives | 6/6 done | Yes | LOCKED |
| 8 | Ranges/Cooktops | 7 | Full 4-pass | Full deep dives | 7/7 done | Yes | LOCKED |
| 9 | Toilets | 6 | Full 4-pass | Full deep dives | 6/6 done | Yes | LOCKED |
| 10 | HVAC | 6 | Full 4-pass | Rebuilt April 2 | Rebuilt April 2 | Yes | LOCKED |
| 11 | Hardwood Flooring | 8 | Full 4-pass | Full deep dives | 8/8 done | Yes | LOCKED |
| 12 | Exterior Doors | 7 | Rebuilt April 2 | Rebuilt April 2 | Rebuilt April 2 | Yes | LOCKED |
| 13 | Water Heaters | 7 | Rebuilt April 2 | Rebuilt April 2 | Rebuilt April 2 | Yes | LOCKED |
| 14 | Sinks | 7 | Rebuilt April 2 | Rebuilt April 2 | Rebuilt April 2 | Yes | LOCKED |
| 15 | Tile | 7 | Rebuilt April 2 | Rebuilt April 2 | Rebuilt April 2 | Yes | LOCKED |
| 16 | Lighting Control | 7 | Rebuilt April 2 | Rebuilt April 2 | Rebuilt April 2 | Yes | LOCKED |
| 17 | Range Hoods | 6 | Rebuilt April 2 | Rebuilt April 2 | Rebuilt April 2 | Yes | LOCKED |

**Total: 17 categories LOCKED. ~116 products scored.**

**April 2 Research Rebuild:** 8 categories (tile, sinks, lighting_control, range_hoods, water_heaters, dishwashers, refrigerators, exterior_doors) were discovered to have curation files built from Claude Code web searches instead of proper Perplexity research. All 8 had their full 4-pass research run, prompt_b templates rebuilt with real component names from Pass 2, per-product deep dives re-run through Perplexity, curation files rebuilt from sourced evidence, and investigator reports regenerated. Research gate rule added to CLAUDE.md to prevent recurrence.

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
- Note: Original deep dives (4/6) failed due to Perplexity ECONNRESET on April 1. Full research + deep dives rebuilt April 2 via run_full_pipeline.sh.

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

### Tile -- LOCKED (April 2, 2026)
- Scope: Porcelain and ceramic as sub-types within one category
- Config: `configs/tile.json` + `calibration/tile/config.json`
- Axis weights: Q=0.35, D=0.35, P=0.30
- Pool S: VACANT
- Key specs: PEI rating, water absorption, DCOF slip resistance
- Through-body > color body > white body > red body hierarchy as quality differentiator
- Manufacturer vs distributor distinction: MSI/Merola penalized for uncontrolled sourcing
- Italian vs US Marazzi disambiguated (same brand, different products, scored separately per Rule 19)
- Porcelanosa appeared 39 times in luxury home listings
- 7 for 7 targets hit exactly

**Calibration Scores:**
| Product | Score | Tier |
|---|---|---|
| Porcelanosa Dover Caliza | 94 | Tier 1 |
| Crossville Virtue | 91 | Tier 1 |
| Daltile Keystones | 82 | Tier 2 |
| Marazzi Italian (Treverklife) | 80 | Tier 2 |
| MSI Aria Bianco | 67 | Tier 3 |
| American Olean Theoretical | 65 | Tier 3 |
| Merola Tile HD | 45 | Tier 4 |

### Lighting Control -- LOCKED (April 2, 2026)
- Scope: Smart lighting control systems (not fixtures). Scored as systems, not individual switches.
- Config: `configs/lighting_control.json` + `calibration/lighting_control/config.json`
- Axis weights: Q=0.40, D=0.30, P=0.30 (Quality dominant: system architecture + switch aesthetics)
- Pool S: VACANT
- Key finding: Professional integrators pair Savant brain with Lutron lighting hardware, confirming Lutron lighting superiority
- Ketra tunable lighting is HomeWorks-exclusive (separate product per Rule 19)
- Lutron appeared 334 times in luxury home listings
- 7 for 7 targets hit exactly

**Calibration Scores:**
| Product | Score | Tier |
|---|---|---|
| Lutron HomeWorks QSX + Ketra | 95 | Tier 1 |
| Lutron HomeWorks QSX Standard | 92 | Tier 1 |
| Lutron RadioRA 3 | 84 | Tier 2 |
| Savant Lighting System | 80 | Tier 2 |
| Control4 Lighting (Snap One) | 67 | Tier 3 |
| Lutron Caseta | 64 | Tier 3 |
| Leviton Decora Smart WiFi | 47 | Tier 4 |

### Range Hoods -- LOCKED (April 2, 2026)
- Config: `configs/range_hoods.json` + `calibration/range_hoods/config.json`
- Axis weights: Q=0.30, D=0.25, P=0.45 (Performance dominant: CFM and sone rating are the primary differentiators)
- Pool S: VACANT
- Heritage brand: Vent-A-Hood (Houston TX, 1933, Magic Lung centrifugal blower)
- BSH platform sharing applies to Thermador/Bosch hoods
- Zephyr appeared 26 times in luxury home listings
- 6 for 6 targets hit exactly

**Calibration Scores:**
| Product | Score | Tier |
|---|---|---|
| Vent-A-Hood PRH Series | 95 | Tier 1 |
| Wolf Pro Ventilation | 91 | Tier 1 |
| Zephyr Tempest II | 82 | Tier 2 |
| Thermador HPCN Series | 76 | Tier 2 |
| Broan-NuTone Elite E60E30SS | 64 | Tier 3 |
| Broan-NuTone F40000 Series | 47 | Tier 4 |

### Categories Assessed But Not Yet Built
- **Motorized Screens/Shades** -- Confirmed scorable. Fenetex (hurricane-rated 185 MPH), MagnaTrack (75 MPH, magnet track), Apollo, Phantom. Wind rating, fabric openness, motor brand, track system are key specs. Ready to build.
- **Whole-Home Control** -- NOT scorable with current methodology. Control4/Savant/Crestron are platforms where installer quality matters more than hardware. Editorial content only, not a scored category.
- **Generators** -- Ready to build. Generac (179x in listings) dominates. Clean specs.
- **Fireplaces** -- Ready to build. Isokern (44x in listings). Gas/wood/electric split.
- **Ice Makers** -- Ready to build. Scotsman (45x in listings). Could be standalone or folded into refrigeration.
- **Water Treatment** -- Ready to build. Kinetico (34x), Culligan (24x). Softeners + whole-house filtration.
- **Window Treatments** -- Ready to build. Hunter Douglas (101x in listings). Blinds, shades, shutters.
- **Retractable Screens** -- Ready to build. Phantom (67x in listings). Separate from window treatments.

### Categories NOT Yet Started
- LVP (luxury vinyl plank)
- Outdoor kitchens (Ray has deep domain knowledge via Layer Cake -- needs disclosure framework)
- Carpet (low priority)
- Tubs/showers
- Garage doors
- Roofing
- Door hardware (Emtek 31x in listings; Baldwin, Rocky Mountain Hardware at $1K-3K+ per set)

---

## 7. AUTOMATION TOOLKIT (Added April 1, 2026)

### What Changed
Category builds are now automated via scripts on the Mac Mini + Claude Code in Antigravity. Ray's manual involvement reduced from ~3 hours/category to ~30 min of checkpoint reviews.

### Scripts on Mac Mini (`scripts/`)
- `scripts/run_research.js` -- Runs Perplexity research passes (4+ per category). Supports `## Pass N`, `## Gas Pass N`, `## Induction Pass N` headers. Uses sonar-deep-research for Pass 1-2, sonar-pro for Pass 3-4. Has `--pass=3,4` flag for selective re-runs. Includes retry logic with 15s/30s/60s exponential backoff for ECONNRESET.
- `scripts/run_deep_dives.js` -- Runs per-product Perplexity deep dives from prompt_b templates. Parses `## MASTER TEMPLATE` + `## PRODUCT:` format, or code block + heading fallback. Has retry logic.
- `scripts/run_investigator.js` -- Unified investigator bot for any category. Reads `calibration/{category}/config.json` + `calibration/{category}/curation_files/`. Includes Company Background section. Auto-commits to git.
- `scripts/run_full_pipeline.sh` -- Full category pipeline runner (Added April 2, 2026). Runs research + deep dives + investigator + git commit for a single category. Designed to run in background via nohup. Includes research gate check. Usage: `nohup bash scripts/run_full_pipeline.sh {category} > logs/{category}.log 2>&1 &`
- `scripts/notify.js` -- Telegram notification helper. Pings Ray's phone at checkpoints.

### Claude Code Workflow Infrastructure (Added April 2, 2026)
- **CLAUDE.md** -- In project root on Ray's Mac. Contains deploy rules and research gate. Auto-read by Claude Code on every session start.
- **~/residentialist-staging/** -- Local staging directory on Ray's Mac. All generated files land here first before deployment. Survives SSH failures.
- **~/deploy-to-mini.sh** -- One-liner SCP wrapper. Usage: `bash ~/deploy-to-mini.sh <files>`
- **Research Gate Rule** -- CLAUDE.md enforces: before building any config, calibration, or curation files, all four knowledge files must exist in `knowledge/{category}/`. Web searches are NOT a substitute for Perplexity research. Ever.

### Background Pipeline Workflow (Added April 2, 2026)
Claude Code's role is now dispatcher, not babysitter. For long-running operations:
1. Claude Code builds files locally in `~/residentialist-staging/`
2. Deploys to Mac Mini with `bash ~/deploy-to-mini.sh`
3. Kicks off `run_full_pipeline.sh` in background via nohup
4. Returns immediately to Ray
5. Mac Mini runs research + deep dives + investigator autonomously
6. Check progress: `ssh Residentialist@100.66.157.103 'tail -3 logs/*.log'`
7. Telegram notification on completion

This eliminates the failure mode where Claude Code holds SSH connections open for 30+ minutes during Perplexity deep dives and dies.

### Perplexity Model Selection
- `sonar-deep-research`: Complex multi-step research (Pass 1-2). Takes 3-6 min, holds connection open. Triggers deep research pipeline for complex queries. Sometimes falls back to training data (0 citations) for simpler queries.
- `sonar-pro`: Always does real web search with citations. Better for ranking/hierarchy queries (Pass 3-4). ~15 sec per query.

### Known Issue: ECONNRESET
Perplexity's sonar-deep-research model holds HTTP connections open for 3-6 minutes. Network intermediaries sometimes reset the connection. Retry logic handles this automatically (3 attempts, 15s/30s/60s backoff). Not all deep dives succeed on first try -- this is expected.

### Workflow Per Category (Claude Code)
1. Open fresh Antigravity/Claude Code window
2. Claude Code reads CLAUDE.md automatically (deploy rules + research gate)
3. Drop in system doc + Onboarding Ritual
4. Tell Claude Code to build category end-to-end
5. Claude Code verifies research gate (4 knowledge files exist), builds config/calibration/prompt_b
6. Deploys to Mac Mini, launches `run_full_pipeline.sh` in background via nohup
7. Returns immediately -- Mac Mini runs deep dives + investigator autonomously
8. Pauses only for genuine judgment calls (tier placement, axis weights, scope decisions)
9. Check progress: `ssh Residentialist@100.66.157.103 'tail -3 logs/{category}.log'`
10. Telegram pings at completion

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
- Does NOT want to be the middleman moving files between machines. Claude Code should build, deploy, and kick off background jobs. Ray's involvement is judgment calls only.
- Pipeline work should run on the Mac Mini in the background. Claude Code dispatches, it does not babysit.
- Web searches are NEVER a substitute for Perplexity research. The methodology's value is provable, independently-sourced evidence. Without it, the scores are just opinions.

---

## 11. IMMEDIATE PRIORITIES (as of April 2, 2026)

**All v9 items 1, 4, 7 are DONE (tile locked, lighting control locked, HVAC deep dives rebuilt).** Updated priority list:

1. **Build motorized screens/shades category** -- Confirmed scorable. Fenetex, MagnaTrack, Apollo, Phantom. Wind rating is the killer spec (25-185 MPH spread).
2. **Build generators category** -- Generac (179x in listings). Clean specs, tight brand landscape.
3. **Build ice makers category** -- Scotsman (45x). Small set, fast build.
4. **Build fireplaces category** -- Isokern (44x). Gas/wood/electric split.
5. **Build water treatment category** -- Kinetico (34x), Culligan (24x). Softeners + whole-house filtration.
6. **Build window treatments category** -- Hunter Douglas (101x). Blinds, shades, shutters.
7. **Build retractable screens category** -- Phantom (67x). Separate from window treatments.
8. **Build LVP category** -- Luxury vinyl plank. Fastest growing flooring in new construction.
9. **Build outdoor kitchens category** -- Ray has deep domain knowledge via Layer Cake. Needs disclosure framework.
10. **Update windows + countertops configs** -- Need calibration_products format to use unified investigator script.
11. **Start YouTube Channel** -- Model home walkthroughs in Austin.
12. **First paid spec report ($500)** -- Real buyer or agent.
13. **Merge sightings database** -- Connect EC2 spec-crawler to scoring pipeline.
14. **Scoreability pre-qualification** -- Run Perplexity scoreability prompt on uncertain categories before committing pipeline time. Template established April 2 (5 questions: brands in room, measurable specs, installer complaints, product vs service, failure modes).

### LAUNCH ROADMAP (Updated April 2, 2026)

**MILESTONE: 17 categories LOCKED, ~116 products scored, methodology proven across kitchen, bath, mechanical, surfaces, envelope, smart home, and ventilation. Pipeline fully automated with background execution on Mac Mini. Research integrity verified and rebuilt where needed.**

**Phase 1 -- Build remaining categories:**
- Motorized screens/shades
- Generators
- Ice makers
- Fireplaces
- Water treatment
- Window treatments
- Retractable screens
- LVP
- Outdoor kitchens
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
- `scripts/run_full_pipeline.sh` -- Full pipeline runner (research + deep dives + investigator + git commit). Background execution via nohup.
- `scripts/notify.js` -- Telegram notification helper

**Logs:** `logs/` -- Pipeline output logs per category. Check with `tail -3 logs/*.log`

**Category Configs:** `configs/`
- `windows.json`, `countertops.json`, `cabinets.json`, `faucets.json`, `dishwashers.json`, `refrigerators.json`, `wall_ovens.json`, `ranges_cooktops.json`, `toilets.json`, `hvac.json`, `hardwood_flooring.json`, `exterior_doors.json`, `water_heaters.json`, `sinks.json`, `tile.json`, `lighting_control.json`, `range_hoods.json`

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

*Last updated: April 2, 2026 (v10)*
*This document replaces v9*
*Changes in v10: Locked 3 new categories (tile, lighting control, range hoods -- 17 total). Rebuilt 8 categories with proper Perplexity 4-pass research (tile, sinks, lighting_control, range_hoods, water_heaters, dishwashers, refrigerators, exterior_doors -- all had curation files built from web searches instead of Perplexity evidence). Added run_full_pipeline.sh for background pipeline execution on Mac Mini. Added CLAUDE.md with research gate rule and deploy workflow. Added ~/residentialist-staging/ and ~/deploy-to-mini.sh on Ray's Mac. Documented scoreability assessment methodology for pre-qualifying categories. Assessed whole-home control as NOT scorable (editorial only). Assessed motorized screens/shades as scorable. Added categories to build queue: motorized screens, generators, ice makers, fireplaces, water treatment, window treatments, retractable screens. Updated Tailscale IP as primary (local IP unreliable). HVAC deep dives rebuilt. ~116 products scored across 17 categories.*
