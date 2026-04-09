# The Residentialist — Unified System Document
## March 31, 2026 — Drop this file into every new session for full context

---

## 1. WHAT THIS IS

The Residentialist is an AI-powered product intelligence platform that independently evaluates residential building products. Owner: Ray Shapley (Austin, TX). The platform scores products using expert consensus anchor placement, verified specifications, and corroborated field evidence. The commercial model is spec quality assessment reports for high-end homebuyers and the real estate agents who serve them.

### Business Positioning
The core insight: there is an invisible quality layer in every home transaction that nobody is measuring. A home inspection checks that things work. An appraisal checks what things are worth based on comps. Nobody checks whether the products in a $3 million home are actually $3 million home products. The Residentialist fills that gap.

No JD Power equivalent exists for residential building products — not for countertops, not for cabinets, not for any category. The Perplexity testing framework research for both countertops and cabinets explicitly confirmed this gap. The Residentialist is building the first standardized, publicly accessible rating system for residential product quality.

### Revenue Model (Launch)
- Spec quality reports: $500 per assessment (buyer or agent submits product list, receives scored report)
- YouTube channel: "Does this home's quality match its price?" — model home walkthroughs with scoring
- Agent referrals: Agents who learn the system through content send buyer referrals (25% referral fee, ~$8-15K/transaction)
- Design center consultations: $299-499 pre-appointment buyer prep (future)

### Revenue Model (Future)
- Realtor membership program ($500-1K/year)
- National referral network
- Manufacturer data licensing (Year 2+)
- Builder certification program

---

## 2. INFRASTRUCTURE

**Mac Mini (Residentialist) — PRODUCTION:**
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
- ⚠️ Contains files not on Residentialist Mac Mini: `/Users/raysahpley/Documents/residentialist-phase2/score_cabinets_calibration.js` (cabinet calibration script). These need to be committed to GitHub repo — see Infrastructure Consolidation section.

**EC2 (Spec-Crawler — Active):** 18.218.122.54 (us-east-2, t2.micro, 1GB RAM).
- SSH key: `~/.ssh/residentialist-key.pem` on Ray's main Mac
- Spec-crawler codebase: `/home/ubuntu/spec-crawler/` (TypeScript, separate from pipeline repo, NO version control)
- Main database: `/home/ubuntu/spec-crawler/data/spec-crawler.json` (~41MB, single JSON file — FileStorage class with 2-second debounce writes)
- Scan state: `/home/ubuntu/spec-crawler/data/national-scan-state.json` (tracks metro scan progress, allows resume after restart)
- Runtime: pm2 running compiled bundle at `/home/ubuntu/spec-crawler/dist/index.cjs`
- ✅ ~~**CRITICAL RISK:**~~ Nightly S3 backup configured March 30, 2026. Backs up to `s3://residentialist-knowledge/backups/spec-crawler/` at 2:00 AM UTC daily, 30-day retention. Script: `/home/ubuntu/spec-crawler/backup-to-s3.sh`. Code still has no git repo — that's a separate task.
- ⚠️ **OOM constraint:** 1GB RAM means always stop pm2 before building. Scan uses ~120MB of ~700MB available. Concurrent build + scan = OOM crash.
- Data: 35,700+ product sightings and growing, across national metro scan
- NOT the scoring pipeline. Separate codebase from Residentialist Mac Mini.

**Database:** SQLite at `residentialist.db`
- Tables: products (now with category column), score_history, deep_dive_log, verified_specs, pdf_escalation_queue, sighting_builders, sighting_listings, builder_sightings
- Builder sightings data: Originally 5,244 product sightings imported to ./data/spec-crawler.json. EC2 spec-crawler has since grown to 35,700+ sightings via national metro scan.

**API Keys (in .env on Mac Mini):**
- Anthropic API (Sonnet + Haiku)
- Perplexity API (sonar-deep-research model)

### Mac Mini Node.js Path
- Node.js on Residentialist Mac Mini is at `/usr/local/bin/node` (v25.8.0). NOT at `/opt/homebrew/bin/node`.
- When running scripts via SSH, use full path: `/usr/local/bin/node script.js`
- The `ANTHROPIC_API_KEY` is stored in `/Users/Residentialist/.openclaw/workspace/residentialist/.env` and must be explicitly loaded when running via SSH:
  `export ANTHROPIC_API_KEY=$(grep ANTHROPIC_API_KEY .env | cut -d= -f2) && /usr/local/bin/node script.js`

---

## 3. SCORING METHODOLOGY

### The Four-Axis System

Every product is evaluated on four axes. Three are scored numerically. One is report-only.

**Quality (Scored)** — Is this product well-made? Component construction, manufacturing precision, professional consensus among installers and specifiers.

**Performance (Scored)** — Does this product do its primary job well? Category-specific measurables. The performance axis varies by category — it is NOT universally flat. Windows: U-factor, SHGC, air infiltration, noise reduction, DP rating. Countertops: heat resistance (massive cross-class spread from ~200°F laminate to 1,472°F sintered stone), scratch resistance (Mohs 2-8), stain resistance, water absorption. Cabinets: hardware cycle ratings (25,000-200,000), slide load capacity (35-170 lbs). Faucets: Performance is essentially flat (axis compresses). Each category defines what Performance means.

**Durability (Scored)** — Will it last, and can it be fixed? Longevity, materials quality, repairability, warranty reality. A product can be high quality but low durability (well-made but materials degrade quickly).

**Material Safety (Report Only)** — Is it safe for the people living with it? Flag-based, not gap-based. If nobody credible has raised a concern, it reports "Excellent" or "Good." If someone has, it reports what was found. Material Safety does NOT affect the composite score. Health certifications (Greenguard Gold, NSF 51, CARB Phase 2, etc.) belong in the Material Safety report section only — they do not contribute to the composite score. This rule was stress-tested during countertop calibration when binary cert checkboxes inflated all premium products equally. Products excluded entirely only for genuinely dangerous issues (illegal faucets, active recalls). Labels: Excellent / Good / Moderate / Concern.

### Axis Weights by Category
Axis weights are category-specific, set during calibration to reflect where meaningful variation exists:
- **Windows:** Q=0.35, D=0.35, P=0.30
- **Countertops:** Determined by pipeline config (Performance has more spread than initially assumed)
- **Cabinets:** Q=0.45, D=0.30, P=0.25 (Quality dominant — box construction, joinery, finish carry most variation)
- **Faucets:** Q=0.45, D=0.45, P=0.10 (Performance essentially flat — all faucets deliver water at regulated rates)
- **Dishwashers:** Q=0.30, D=0.40, P=0.30 (Durability dominant — professional hierarchy organized around "which ones break." Performance NOT flat — noise, drying tech, and cleaning scores create real spread.)
- **Refrigerators (Built-In):** Q=0.30, D=0.40, P=0.30 (Durability dominant — same pattern as dishwashers. Performance NOT flat — temperature uniformity, noise, humidity retention, usable capacity all have real spread.)

### How a New Category Gets Calibrated (Step 0 — Two-Pass Research + Hierarchy)

Before any product is scored in a new category, Ray and Claude complete the following. The lesson from countertops: do the testing framework research FIRST, then the hierarchy, then build the config with correct spec fields from day one. This prevents rescoring. The lesson from dishwashers: a single landscape survey is insufficient — a second pass at component level is needed to identify the named suppliers, part numbers, and failure modes that drive scoring decisions.

**Full process documented in `CATEGORY_ONBOARDING_RITUAL.md` — drop that file into any session where a new category is being started.**

**The process (summary):**

1. **Pass 1 — Landscape survey (Perplexity Query 1).** What gets measured, who measures it, where the scores live. Find the standardized tests, independent testing bodies, and any reviewers doing teardowns or comparative testing. This identifies the Pool S candidate (if one exists) and defines the CATEGORIES of things that matter — but at surface level.

2. **Pass 2 — Component deep dive (Perplexity Query 2).** Go inside the products. Name the specific component suppliers (e.g., Askoll pumps, Sisme motors, Flühs cartridges). Map platform sharing at the part-number level. Understand failure modes at component level. This is what transforms a landscape survey into a knowledge file you can score from. Pass 2 tells you which specific component names to hunt for in per-product deep dives.

3. **Run competitive hierarchy research (Perplexity Queries 3-4).** Two queries using expert sources and professional consensus:
   - **Top:** "How do professionals rank [top brands] against each other? Who's the best and why?"
   - **Bottom:** "Where do professionals draw the line between good and mediocre? What brands sit on that line? What's the floor of acceptable quality?"

3. **Review together.** Ray and Claude review the Perplexity output, check the sources, and apply judgment. This is where Ray's industry experience catches anything the research got wrong.

4. **Build the category config.** Using the testing framework to define spec fields with continuous metrics, and the hierarchy to set tier anchors. The config includes: tier anchors with target scores, spec fields with adjustment rules, source pools, axis weights, and category-specific scoring rules. This is saved as `configs/{category}.json` and `calibration/{category}/config.json`.

5. **Score calibration products.** Run 6 products through the pipeline. Compare to targets. If scores land outside acceptable range, diagnose whether the issue is spec field design, anchor placement, or a genuine surprise in the data. Do NOT manually adjust scores.

6. **Save all research.** Perplexity output saved to `tier_anchor_calibration_[category].md`. This is the evidence trail for every anchor placement.

**This is a Claude-to-Ray cue.** When setting up any new category, Claude should prompt Ray: "Before we score anything, we need to run the testing framework query, then the hierarchy queries, then build the config. Let's start with who's testing these products."

### How a Product Gets Its Score (Pipeline — Automated)

**Step 1 — Perplexity Deep Dive (3-6 min, ~$0.50-2.00)**
One deep dive per product LINE. Siblings share curation files. Deep dive prompts are category-specific — `templates/prompt_b_countertop.md`, `templates/prompt_b_cabinets.md`, etc.

**Step 2 — Sonnet Structuring (30-60 sec)**
Structures the raw deep dive into three columns: Expert / Review / Forum. Auto-classifies each finding as Score / Report Only / Quarantine. Lawsuits auto-classified as Report Only (never Score). Source pool definitions are category-specific from the config.

**Step 3 — Source Verification (Haiku, ~3 sec/source)**
Confirms each source is actually about THIS specific product.

**Step 4 — Spec Verification (Sonnet + Perplexity targeted lookup)**
Extracts spec claims, verifies against manufacturer sites. Populates verified_specs table. Spec fields are category-specific from the config. 3-tier PDF escalation for gated content.

**Step 5 — Human Curation (optional)**
Three-column dashboard, click-to-reclassify findings between Score / Report Only / Quarantine.

**Step 6 — Tier Classification (Sonnet, 3x majority vote)**
Classifies product into Tier 1-5 against category-specific expert consensus anchors from the config. Three independent Sonnet calls, majority wins. 3/3 agree = high confidence, 2/3 = medium, split = low + flagged.

**Step 7 — Haiku Audit**
Checks for source contamination only. Cannot change tier for other reasons.

**Step 8 — Deterministic Score Calculator**
Reads category config. Uses anchor target scores (not tier midpoints) as starting point. Applies category-specific spec adjustments (±8 cap). Score clamped to tier range (never crosses tier boundaries).

**Step 9 — Investigator Bot (Sonnet, single call)**
Takes the locked composite score and the curation file. Produces four-axis decomposition (Quality, Performance, Durability scores + Material Safety label). Identifies specific strengths and deficiencies with evidence citations. Writes "What You Should Know" section for homebuyers. This step produces report content, not scoring input.

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
| S (Summit) | 1.50x | Category-specific elite independent sources |
| A (Expert) | 1.00x | Professional reviewers, building science experts, named contractors |
| B (Review) | 0.75x | Trade publications, experienced hands-on reviewers |
| C (Forum) | 0.40x | Reddit, Houzz, individual forum posts |

### Critical Scoring Rules
1. Lawsuits NEVER affect tier classification. Auto-classified as Report Only.
2. 3x majority vote on every tier classification.
3. One deep dive per product line. Variants share curation files.
4. Minimum 5 score sources or pipeline refuses to score. Products with insufficient data receive "Insufficient Data — Not Rated."
5. Forum negativity guardrail: DOWN requires 3+ independent reports AND expert contradiction.
6. No auto-generated curation. Every product needs a real Perplexity deep dive.
7. Tier placement + spec adjustments only (no axis stretch in v1.0).
8. Verified specs override deep dive claims. Conflicts skip the adjustment.
9. The tier is the product. The number is sort order within the tier.
10. Material Safety does not affect composite score. Report only. Health certifications (Greenguard Gold, NSF 51, CARB, etc.) belong in the Material Safety report section and do NOT contribute +1 or any other bonus to the composite.
11. Anchor calibration (Step 0) is a manual collaborative step between Ray and Claude, completed before any product is scored in a new category.
12. Investigator Bot editorial guardrail: Do not repeat inflammatory or absolute statements from sources. The number does the work.
13. Anchor products use evidence-based target scores from the calibration file, not tier midpoints.
14. **Source traceability (not "domestic manufacturing").** Products with single-source manufacturing or identifiable geological origin (quarried stone) earn +1. Multi-source products (25+ global suppliers, outsourced manufacturing) earn 0. Unknown source earns -1. The spec measures whether the buyer can trust that the slab/unit on their counter matches the specs on the data sheet.
15. **Corporate Risk Rule.** Outlook modifier (Strong/Stable/Conditional/Negative) attached to report. Does NOT change composite score. Prominently displayed. Buyer needs to know if warranty is backed by a viable company.
16. **N/A rule.** If a spec field doesn't apply to a material class or product type, the calculator skips it. No penalty, no bonus. Granite doesn't need emissions certification because there's no resin — that's N/A, not a missing cert.
17. **Score base configuration.** If a product has meaningful upgrade options (e.g., KraftMaid with vs without plywood upgrade), score the base config. Note upgrade availability and approximate score impact in the report.
18. **Warranty exclusion consistency rule.** If a warranty exclusion (e.g., water damage, humidity, improper installation) is industry-standard across all brands in a category, it does NOT reduce the warranty's adjustment score. Penalizing one brand for an exclusion that every competitor also carries is inconsistent. Score the warranty on term length and backing entity viability, not on boilerplate exclusions shared by all. (Added March 30, 2026 — identified during cabinet calibration when IKEA's 25-year warranty was penalized for moisture exclusions that every other scored brand also carries.)
19. **Score the product, not the brand.** Every distinct product configuration gets its own score. A brand name is not a product. Waterstone two-handle (Flühs cartridge) and Waterstone single-handle (Geann cartridge) are two different products with different scores. Kohler showroom and Kohler Home Depot are different products. Andersen 400 and Andersen E-Series are different products. If the internal components, construction method, or sourcing differ meaningfully between configurations under the same brand, they are separate scored products. The unit of scoring is the model/line/configuration, not the manufacturer. (Added March 30, 2026 — identified during faucet calibration when Waterstone's cartridge sourcing differs by handle type.)
20. **European brand evidence asymmetry rule.** Low-US-volume European brands (Miele, Liebherr, BSH products, etc.) have structurally thinner lawsuit and complaint evidence than high-volume US brands. Reasons: smaller US install base (class action lawyers go where the plaintiffs are), no US-style class actions in most EU countries, and regulatory enforcement data that lives in non-English-language databases. Reports MUST disclose this asymmetry for any European-manufactured brand. This does NOT affect the composite score — lawsuits are already Report Only per Rule 1. Do NOT search in other languages as a workaround; EU models have different components, voltages, refrigerants, and model numbers than US-market products. (Added March 31, 2026 — identified during refrigerator calibration when comparing lawsuit evidence density across Sub-Zero, BSH, and Miele.)

---

## 4. INVESTIGATOR BOT

### What It Does
After the composite score is locked by the deterministic pipeline, the Investigator Bot reads the curation file and produces the four-axis decomposition plus buyer-facing report content. It does NOT produce or change the composite score.

### Prompt Design Principles
- The bot is framed as an investigator, not a categorizer. Its job is to figure out what drove the score.
- An even split across axes is explicitly forbidden. If the three scored axes are within 3 points of each other, the prompt has failed.
- At least one strength and one deficiency must be identified for every product.
- Every claim must trace to evidence in the curation file. No speculation. No fabricated quotes.
- The three scored axes should roughly average to the locked composite but individual axes can range significantly.
- Material Safety is label-only, reported separately.
- **Editorial guardrail:** Report the evidence, let the score speak. A product scoring 28/100 doesn't need editorial condemnation.

### Validated Test Results (March 27, 2026 — Pre-Recalibration)
| Product | Composite | Quality | Performance | Durability | Safety | Verdict |
|---|---|---|---|---|---|---|
| Marvin Signature Ultimate DH | 99 | 85 | 100 | 100 | Excellent | Real variance, specific evidence |
| Andersen 400 Series DH | 69 | 62 | 72 | 73 | Good | Best output — hardware issues, seal lawsuit cited |
| Reliabilt 3500 DH | 28 | 22 | 35 | 27 | Good | Specific evidence with proper curation file |

**Post-recalibration:** Marvin rescored to 92-93 range (see Windows section). Investigator bot needs revalidation against new scores.

### Script Location
`run_investigator_test.js` in the workspace.

---

## 5. METHODOLOGY DEFENSIBILITY

### Public Disclosure (What We Say)
"Scores are derived from a proprietary methodology that synthesizes publicly available expert analysis, verified manufacturer specifications, and corroborated field performance data. No manufacturer funds or influences any rating."

### Framework: Disclose the what, protect the how
- Publish: Tier labels and what they mean, that we use anchor products, that specs are verified against manufacturer data, that no manufacturer pays for or influences ratings, that field evidence requires 3+ independent reports
- Protect: Source pool weights, spec adjustment formulas, ±8 cap, 3x majority vote mechanics, category-specific adjustments, which sources are in which pool

### Legal Position
- Editorial opinion, disclosed methodology (Michelin/JD Power precedent)
- Three-source corroboration refutes reckless disregard
- No undisclosed financial relationships
- "Evidence-based rating" language only

### Tradesperson Intelligence (Credibility Multiplier)
Target: 50-100 tradesperson conversations annually.

---

## 6. CATEGORY STATUS

### Windows — LOCKED, Recalibrated
- 32 products scored, 4 anchor products recalibrated (March 28, 2026)
- Pipeline is category-aware with `--category` flag
- Recalibrated scores: Marvin casement 93, Marvin DH 92, Loewen DH 91, Kolbe casement 90
- Investigator bot tested on 3 products — needs revalidation against new scores
- 140 verified specs, 66 conflicting, 124 unverified
- Anchor calibration file: `Marvin_Signature_Ultimate_in_the_Professional_Window_Hierarchy.md`
- Expert anchors (post-recalibration):
  - Tier 1 (97-100): Reserved for Passive House certified products (may be empty)
  - Tier 1 (94-97): Uni-Lux, Loewen Cyprium, Alpen Zenith
  - Tier 1 (90-93): Marvin Signature Ultimate (92-93), Loewen standard (91), Kolbe VistaLuxe (90)
  - Tier 2 (75-89): Andersen E-Series, Pella Impervia, etc.
  - Tier 3 (60-74): Andersen 400, Pella Lifestyle, etc.
  - Tier 4 (40-59): Simonton 5500, Pella 250, etc.
  - Tier 5 (0-39): Reliabilt 3500, MI Windows 1620
- Source pools: Summit Construction, Argo Glass, Weatherguard = S; GBA, FHB, Window Dog, Consumer Reports = A
- Config: `configs/windows.json`
- **Next:** Resolve 66 spec conflicts, revalidate investigator bot, add 15-20 more products for high-end coverage

### Countertops — LOCKED, 6 Calibration Products Scored
- Pipeline category-aware, config at `configs/countertops.json`
- 6 Perplexity deep dives completed (35K-64K chars each, 20-44 sources)
- 6 products scored through full pipeline, all in range or within +1

**Calibration Scores:**
| Product | Score | Target Range | Status |
|---|---|---|---|
| Cambria Brittanicca | 96 | 94-96 | OK |
| Dekton Aura 15 | 94 | 92-94 | OK |
| Caesarstone Calacatta Maximus | 86 | 84-87 | OK |
| Ubatuba Granite | 82 | 80-83 | OK |
| MSI Q Premium Calacatta Arno | 81 | 79-82 | OK |
| White Ice Granite | 74 | 72-76 | OK |

**Outlook Modifiers:**
- Cambria: Strong (family-owned, profitable, sole US manufacturer)
- Dekton: Strong (Cosentino multinational, stable)
- Caesarstone: **Conditional** (100% outsourced manufacturing Dec 2025, $137.5M net loss, 618 silicosis claims, $1.22 stock, targeting positive EBITDA Q3 2026)
- MSI: Stable (volume leader, diversified, private)

**Key Methodology Decisions Made During Countertop Build:**
- Performance axis is NOT flat across material classes. Heat resistance spans 200°F to 1,472°F. Mohs hardness spans 2-8. These are real, ASTM-verified continuous metrics.
- Spec fields use continuous ASTM-verified metrics (Mohs, heat resistance °F, water absorption %, flexural strength PSI, impact resistance) instead of binary pass/fail checkboxes. Binary checkboxes were tried first and inflated all premium products equally — rescored twice before landing on continuous metrics.
- Health certifications (Greenguard Gold, NSF 51) removed from composite spec adjustments. They are Material Safety report items only. The methodology says Material Safety is report-only; including certs in composite broke that rule.
- "Domestic manufacturing" renamed to "source traceability." Measures whether buyer can trust slab matches data sheet. Cambria (+1, single factory), Ubatuba granite (+1, identifiable geological formation), MSI (0, 25+ global suppliers), Caesarstone (0, 100% outsourced). This solved the problem where granite was unfairly penalized for not being "manufactured."
- Consumer Reports impact finding: Dekton was the only material that split entirely under heavy impact. This earns -2 impact adjustment, offsetting Dekton's +2 heat advantage. The net result: Dekton scores below Cambria despite superior material properties on most axes.
- Karin Kirk promoted to Pool S. Only independent, methodology-documented, multi-material comparative countertop test in the public domain. Geologist credentials, hands-on Mohs/stain/heat/acid testing.

**Countertop Scoring Rules:**
1. No Cross-Class Ranking Rule
2. Mislabeled Stone Rule (report flag)
3. PFAS Sealer = Yellow Finding (advisory, not score impact)
4. Manufacturing vs Consumer Hazard Rule (silicosis excluded)
5. Adjacent Product Rule (score installed product, not companion products)
6. Certification Tier Rule (no docking when both tiers confirm concern managed)
7. Corporate Risk Rule (Outlook modifier, does not change composite)

- Source pools: Karin Kirk = S (promoted from A); Consumer Reports = S (with caveats); Natural Stone Institute Testing Lab = A (new); FHB/GBA = A; Countertop Specialty = A; Fabricator forums = B; Granite Guy Inc = B
- Anchor calibration file: `tier_anchor_calibration_countertops.md`
- **Next:** Add Silestone, quartzite, marble, Corian, Formica, builder-grade quartz. Let sightings data inform which products to score next.

### Cabinets — LOCKED, 6 Calibration Products Scored, Deep Dives Complete
- Pipeline category-aware, config at `configs/cabinets.json` + `calibration/cabinets/config.json`
- Scored deterministically from known industry specs; Perplexity deep dives completed March 30, 2026
- 6 for 6 targets hit exactly
- Template ready: `templates/prompt_b_cabinets.md`
- **6 JSON curation files on Mac Mini** in `curation/` directory (crystal_keyline, fabuwood_galaxy, kraftmaid_base, ikea_sektion, merillat_classic, timberlake_origins) — manually structured from Perplexity browser output to match pipeline JSON schema
- Calibration script lives on Ray's Mac at `/Users/raysahpley/Documents/residentialist-phase2/score_cabinets_calibration.js` (NOT on Residentialist Mac Mini)

**Calibration Scores:**
| Product | Score | Target | Quality | Durability | Performance |
|---|---|---|---|---|---|
| Crystal Keyline (custom) | 93 | 93 | 9.5 | 9.0 | 9.2 |
| Fabuwood Galaxy | 91 | 91 | 9.2 | 9.0 | 9.0 |
| KraftMaid (base config) | 80 | 80 | 7.5 | 8.5 | 8.2 |
| IKEA SEKTION | 71 | 70→71 | 7.0 | 6.8 | 7.5 |
| Merillat Classic | 64 | 64 | 6.2 | 6.5 | 6.5 |
| Timberlake Origins | 52 | 52 | 5.0 | 5.5 | 5.1 |

**Key Methodology Decisions Made During Cabinet Build:**
- Cabinets are scored as a construction audit, not physical property measurements. The spec fields are: box substrate, drawer box joinery, drawer box material, finish type, back panel thickness, frame type, hinge cycle rating, drawer slide cycle rating, soft-close standard, KCMA certification, warranty type, source traceability.
- Axis weights: Quality=0.45, Durability=0.30, Performance=0.25. Quality dominant because box construction, joinery, and finish chemistry carry most variation.
- KCMA certification = floor, not differentiator. Having it = 0. Not having it = -2. 40-50% fail first attempt, so absence is meaningful.
- Framed vs frameless: conditional adjustment, NOT a hard cap. Framed = +1 (genuine structural benefit verified by KCMA base-front joint test data). Frameless + plywood = 0 (compensated by substrate). Frameless + particleboard = -1 (real vulnerability, stacks with substrate penalty). Main Line Kitchen Design's B-cap on all frameless was rejected as analytically overreaching when applied to premium European brands using plywood + Blum hardware.
- Fabuwood correctly placed in Tier 1 (91) based on expert consensus: A quality per Main Line, all-plywood standard, dovetail drawers, Blum hardware, KCMA + AWI Premium certified. The old system scored it B+ due to price-tier bias. The new system scores what it IS, not what it costs.
- MasterBrand corporate structure is a Material Finding (report section): Aristokraft, Merillat, KraftMaid, Diamond, Thomasville, Omega Dynasty, Omega Pinnacle are all same parent company. Thomasville = Diamond rebrand (Home Depot exclusive).
- Hardware brand IS the spec for cabinets. Blum MOVENTO (100K+ cycles, 170 lb capacity) vs generic side-mount (25K cycles, 35 lbs) is the cabinet equivalent of U-factor in windows.
- Pool S vacant for cabinets. No independent teardown source equivalent to StarCraft (faucets) or Karin Kirk (countertops).

**Cabinet Scoring Rules:**
1. Health certs report-only, no composite impact (CARB, TSCA, GREENGUARD Gold)
2. KCMA = floor (0 if yes, -2 if no)
3. Source traceability same as countertops
4. Score base configuration, note upgrade availability
5. Frame type conditional on substrate
6. Corporate structure = report finding
7. Hardware brand and grade = verifiable performance data
8. **Warranty scoring must be consistent on exclusions.** If an exclusion (e.g., water damage) is industry-standard across all brands, it does NOT reduce a warranty's score. IKEA's 25-year warranty was corrected from 0 to +1 (March 30, 2026) because the "limited scope" penalty was based on moisture exclusions that every other scored brand also carries. A 25-year warranty backed by a foundation-controlled entity with no going-concern risk deserves the same +1 as a lifetime limited warranty from a PE-owned manufacturer.

- Source pools: S = VACANT; Main Line Kitchen Design = A; IST Cabinets = A; KCMA data = A; Blum/Grass/Hettich catalogs = A; Reddit r/cabinetry = B; Houzz pro threads = B; YouTube teardown channels = B
- **Deep dive findings confirmed:** Timberlake Origins KCMA A161.1 active (Certificate 25160R, Feb 2026) — calibration already assumed true, no score change. Crystal Keyline MLKD rating is B+/B+ at PL4 (semi-custom), not A/A (which is Crystal custom line). Merillat Classic standard drawer joinery is rabbet+staple, NOT dovetail (dovetail is Deluxe upgrade only).
- **Next:** Run investigator bot against all 6 curation files, then add more products from sightings data
- ✅ Config extracted to JSON (March 30, 2026): `configs/cabinets.json` + `calibration/cabinets/config.json` now on Mac Mini disk. Previously only existed inside `score_cabinets_calibration.js`.

### Faucets — LOCKED, 6 Calibration Products Scored, Deep Dives Complete
- Full pipeline COMPLETE March 30, 2026: Step 0 → scoring → deep dives → deep dive corrections → rescoring → curation files → investigator bot
- Config package: `calibration/faucets/faucet_config_and_calibration_package.md` on Mac Mini
- Scoring script: `score_faucets_calibration.js` (v2 post-deep-dive) on Mac Mini + Ray's Mac
- Axis weights: Q=0.45, D=0.45, P=0.10 (Performance essentially flat)
- 6 JSON curation files on Mac Mini in `curation/`
- Investigator bot reports on Mac Mini: `investigator_faucet_*.md` + `investigator_faucet_summary.md`

**Calibration Scores (Post-Deep-Dive v2):**
| Product | Score | Tier | Key Spec |
|---|---|---|---|
| California Faucets | 94 | Tier 1 | Flühs (2-handle) + Kerox (1-handle), PVD lifetime, StarCraft near-perfect |
| In2aqua | 92 | Tier 1 | Kerox PVD+ 4M cycles (2-handle Flühs), best warranty per StarCraft |
| Waterstone | 91 | Tier 1 | 316 SS machined bar stock, Geann ALL configs (NOT Flühs), no PVD |
| Brizo DST | 84 | Tier 2 | DST 5M cycle cartridge, Brilliance PVD, >2/3 China manufacturing |
| Delta mid-range DST | 69 | Tier 3 | Same DST tech as Brizo, ZAMAK shell + PEX waterway (-1 dock), mass market |
| Kraus | 45 | Tier 4 | Marketeer, mixed cartridges (won't disclose which), 5yr cartridge warranty |

**CRITICAL Deep Dive Corrections (v1 → v2):**
- Waterstone: Uses Geann on ALL configurations including two-handle — NOT Flühs as knowledge file stated. Collapsed from 2 products to 1. Target dropped from 95 to 91.
- California Faucets: Splits cartridges — Flühs (two-handle) + Kerox (single-handle). NOT "Flühs everywhere." Still best combined cartridge sourcing. Moved UP to 94. PE acquisition by American Bath Group noted.
- In2aqua: Assembler/specifier, NOT manufacturer as knowledge file stated. Splits cartridges — Kerox PVD+ (single) + Flühs (two). Moved UP to 92.
- Delta: Outer shell is ZAMAK/zinc on most models. Water flows through PEX never contacts zinc. -1 dock: good innovation but not solid construction. Target 70→69.
- Brizo: Not all models use DST — some use Sedal (Chinese) or unknown cartridges. Must verify DST before purchase.
- StarCraft Pool S, source pools, faucet-specific scoring rules all documented in config package

- **Next:** Add products from sightings data, expand beyond calibration set
- ✅ Config extracted to JSON (March 30, 2026): `configs/faucets.json` + `calibration/faucets/config.json` now on Mac Mini disk. Previously only existed inside `score_faucets_calibration.js`.

### Dishwashers — LOCKED, 6 Calibration Products Scored, Deep Dives Complete, Investigator Run
- Config at `configs/dishwashers.json` + `calibration/dishwashers/config.json` on Mac Mini
- Calibration script v2: `calibration/dishwashers/score_dishwashers_calibration.js` on Mac Mini
- Investigator runner: `run_investigator_dishwashers.js` on Mac Mini
- Axis weights: Q=0.30, D=0.40, P=0.30 (Durability dominant — professional hierarchy organized around "which ones break")
- Deep dive prompt template: `templates/prompt_b_dishwashers.md`
- 6 for 6 targets hit exactly (v2, post deep dive corrections)

**Calibration Scores (v2 — Post Deep Dive Corrections):**
| Product | Score | Tier | Key Differentiator |
|---|---|---|---|
| Miele G7000 Series | 95 | Tier 1 | Yale 5.6% service rate (best), 20-yr design life, in-house motor (Euskirchen/ArcelorMittal), 3 spray arms, 15-yr parts guarantee |
| Bosch 800 Series | 91 | Tier 1 | CrystalDry zeolite (best plastic drying), 7.8% service rate, 99.97% soil removal, best premium serviceability |
| KitchenAid KDTM604 (M-series) | 81 | Tier 2 | 360° Max Jets third rack (unique), SatinGlide Max ball-bearing rails, Whirlpool service network. PSC induction motor (not brushless). |
| Bosch 300 Series | 67 | Tier 3 | Same BSH platform as 800 (identical core components), PureDry condensation only (NOT AutoAir), 46 dBA |
| Whirlpool WDT750SAKZ | 64 | Tier 3 | PMSM Askoll motor, SS tub, manual mesh filter, best water efficiency (2.5 gal), broadest parts ecosystem. CR 1/5 drying. |
| Samsung DW80 (mid-range) | 47 | Tier 4 | Service ecosystem trap — CR 23% failure/"cannot recommend", parts available but techs refuse, warranty execution adversarial |

**Deep Dive Corrections (6 major, March 31 2026):**
1. KitchenAid motor: brushless_inverter → PSC AC induction (run capacitor W10753070 confirms)
2. KitchenAid filter: manual_mesh → self_cleaning (True Self-Cleaning Filtration)
3. Bosch 300 drying: AutoAir → PureDry condensation only (AutoAir is 500+ exclusive)
4. Whirlpool: COMPLETE REWRITE — 8 spec fields wrong. SS tub (not plastic), PMSM motor (not induction), manual mesh (not grinder), 3 spray zones (not 2), has third rack, adjustable racks, 47 dBA (not 53), 2.5 gal/cycle (not 3.5). Target 57→64, Tier 4→Tier 3.
5. Samsung parts_availability: proprietary_limited → proprietary_available. Problem is tech availability, not parts. -2 stays on service_network_coverage.
6. Bosch 800 energy: 199 → 240 kWh/yr (EPA ENERGY STAR confirmed, CrystalDry regeneration overhead)

**Additional Spec Verification (March 31 2026):**
- Bosch 800 rack glides: EasyGlide ball-bearing on UPPER RACK ONLY (BSH brochure confirmed). All-three-rack ball-bearing is Benchmark exclusive. 300/500 are standard nylon.

**Key Methodology Decisions Made During Dishwasher Build:**
- Durability dominant (0.40) because professional hierarchy is organized almost entirely around reliability and serviceability. Yale service rate data is the most-cited metric across every source type.
- Performance NOT flat (unlike faucets): noise spans 37-56+ dBA, drying tech creates massive real-world spread (zeolite vs heated element), soil removal spans low-90s to 99.97%. Performance gets equal weight to Quality.
- BSH Platform Rule (new): Bosch, Thermador, and Gaggenau share the same dishwasher platform. Service rate spread across all three is 0.4% — noise, not differentiation. Each product line scored separately (Rule 19) but report MUST disclose shared platform.
- Thermador line split: Star Sapphire (zeolite) and Emerald/Sapphire (condensation drying) are different products with different scores per Rule 19.
- Yale service rate is Pool S but directional: single-region (Boston area), premium skew, Whirlpool/Frigidaire/Samsung absent. Disclosed in every report.
- Service ecosystem is a scored durability spec: parts availability + authorized service density directly affect functional lifespan. This is what separates Samsung (good paper specs, catastrophic serviceability) from Whirlpool (average specs, universal parts).
- Samsung scores below Whirlpool despite better components because serviceability IS the score for Tier 4.
- LG volatility rule: when single-year spike is attributed to one component, report both spike year and multi-year trend.

- Source pools: Yale Appliance (Steve Sheinkopf) = S; Consumer Reports, Reviewed.com, CNET, Good Housekeeping Institute, J.D. Power = A; r/appliancerepair, Prudent Reviews, repair YouTube = B; r/Appliances, Houzz = C
- Curation files: 6 JSON files at `calibration/dishwashers/curation_files/` on Mac Mini
- Investigator reports: 6 individual + 1 summary at workspace root on Mac Mini
- **Status:** Category complete through investigator stage. Ready for report template design.

### Refrigerators (Built-In Only) — IN PROGRESS, Step 0 Complete + Calibration Script Built, Deep Dives Run, Corrections Pending
- Scope: Built-in only. No freestanding, no counter-depth freestanding.
- Config pending: `configs/refrigerators.json` + `calibration/refrigerators/config.json` (not yet built)
- Calibration script v1: `score_refrigerators_calibration.js` on Mac Mini
- Axis weights: Q=0.30, D=0.40, P=0.30 (Durability dominant — professional hierarchy organized around reliability/serviceability, same pattern as dishwashers)
- Research queries: `templates/prompt_a_refrigerators.md` on Mac Mini
- Deep dive prompt template: `templates/prompt_b_refrigerators.md` on Mac Mini
- 4-pass Perplexity research complete (testing landscape, component deep dive, hierarchy top, hierarchy bottom)
- 6 deep dives complete, raw outputs saved to `knowledge/refrigerators/` on Mac Mini
- 6 for 6 targets hit exactly (v1, pre deep dive corrections)
- Deep dive corrections identified for 3 products (Bosch Benchmark, JennAir, Dacor) — v2 pending

**Calibration Scores (v1 — Pre Deep Dive Corrections):**
| Product | Score | Tier | Key Differentiator |
|---|---|---|---|
| Sub-Zero Classic/Designer | 95 | Tier 1 | Dual Embraco compressors (variable-speed on 2023+ via Split Climate), 5yr/12yr warranty, parts since 1986, NASA air scrubber, vacuum magnetic doors, zero DOA in 38 years at Yale |
| Thermador Freedom Collection | 90 | Tier 1 | BSH platform (Turkey), dual compressor, best flush-integrated aesthetic, Yale "A" grade, ~8% less reliable than Sub-Zero |
| Bosch Benchmark Built-In | 80 | Tier 2 | Same BSH platform as Thermador, entry premium. 0.4% 5yr compressor failure rate (lowest Yale tracks). BUT: proprietary error codes (1077/1080/3404/E33/E48) cause standard Bosch techs to misdiagnose. Requires iService5 restricted diagnostic platform. |
| JennAir Built-In Column | 66 | Tier 3 | Whirlpool platform (W10448874 cross-compatible), variable-speed inverter (genuine differentiator), Obsidian interior. Service rate: 36.7% (2021) → 15.8% (2022), dropped from Yale tracking. Class action evaporator defect does NOT apply to column models. |
| Dacor Column | 53 | Tier 4 | Samsung platform — COMPLETE convergence (every part DA97/DA94 prefix). SteelCool stainless interior. Fan-freezing design flaw acknowledged by Dacor. Warranty routed through South Korea. Column has NO ice maker (removes Samsung ice maker risk). |
| Viking 5 Series | 45 | Tier 4 | Probable Embraco VEGD-series compressor (confirmed on sibling VCSB5483SS). R-600a. >60% first-year service rate (Yale, multiple consecutive years). CR #25 of 25, score 34/100. Does not manufacture own refrigerators. |

**Deep Dive Corrections Identified (v1 → v2, March 31 2026):**
1. Sub-Zero: 2023+ Classic/Pro now use variable-speed compressor (Split Climate™) — legacy 700/BI remain fixed-speed Embraco. No score change (supports existing 95).
2. Bosch Benchmark: Dual compressor IS universal across all Benchmark built-ins (not "some models"). BUT warranty is only 1yr full (not 2yr assumed) — weaker than Thermador from same factory. Review target.
3. JennAir: Evaporator-freezing class action does NOT apply to column models (French door only). Sealed system warranty up to 12 years (not 5-10). Review target.
4. Dacor: Full stainless steel interior confirmed (SteelCool™). Column has NO ice maker. 15-year compressor parts warranty. Review target.
5. Viking: Compressor probable Embraco VEGD8H (confirmed on sibling model). >60% rate is systemic QC, not single-component. No score change.

**MANDATORY Platform Disclosures (every report in this category):**
- **BSH Turkish Factory:** Miele, Thermador, Gaggenau, and Bosch Benchmark built-in refrigeration is manufactured in the same BSH factory in Turkey. Yale Appliance confirmed. Score separately per Rule 19 but disclose shared platform prominently in every report.
- **Samsung/Dacor:** Complete component convergence. Every part carries Samsung DA97/DA94 prefix. Dacor is a Samsung appliance with premium cabinetry.
- **GE/Monogram:** Monogram = Café = GE Profile (same Selmer, TN factory). Reddit teardown confirmed same compressor, evaporator, and mainboard.
- **Whirlpool/JennAir:** JennAir = KitchenAid (shared platform). Compressor start device W10448874 cross-applies across entire Whirlpool portfolio.

**Key Methodology Decisions Made During Refrigerator Build:**
- Built-in only scope — no freestanding, no counter-depth freestanding. Target buyer at $2-5M homes is not shopping for freestanding.
- Durability dominant (0.40) — same pattern as dishwashers. Professional hierarchy organized around "which ones break and can you fix them." Yale service rate data is the anchor metric.
- Performance NOT flat: temperature uniformity (2-8°F spread), noise (38-45+ dBA), humidity retention, usable vs claimed capacity — all continuous metrics with real differentiation.
- The compressor is the cartridge equivalent. Dual independent compressor architecture separates Tier 1 from everything below.
- Service ecosystem is a scored durability spec: parts availability + service network density + parts commitment horizon.
- Pool S vacant for teardown — no StarCraft equivalent exists for built-in refrigerators. Yale Appliance is Pool S for service rate data.
- Ice makers are the #1 failure mode across the entire refrigerator category (31% fail within 5 years per CR). True Residential deliberately omits ice makers to improve reliability.
- European brand evidence asymmetry: Miele, BSH, Liebherr have structurally thinner lawsuit/complaint evidence due to lower US volume and no EU class actions. Reports disclose this. No score impact. Do NOT search in other languages (different components/voltages/model numbers).

- Source pools: Yale Appliance (Steve Sheinkopf) = S; Consumer Reports, Reviewed.com (Dr. David Ellerby), RTINGS.com = A; r/appliancerepair, Prudent Reviews, CNET = B; r/Appliances, Houzz, Trustpilot = C
- Knowledge files: 4 research pass outputs + 6 deep dive outputs at `knowledge/refrigerators/` on Mac Mini
- **Status:** Deep dives complete. 3 products need correction review. Configs not yet built. Curation files and investigator bot pending.
- **Next:** Build calibration v2 with deep dive corrections, then configs, curation files, investigator bot.

### Appliances — Early Work, Large Scope (Dishwashers LOCKED, Refrigerators in progress above)
- Dishwashers: LOCKED (see above). Refrigerators: IN PROGRESS (see above).
- Ranges/cooktops next after refrigerators locked.
- Each appliance subcategory is essentially its own category build
- Yale Appliance = primary independent source
- **Next:** Lock refrigerators, then start ranges/cooktops. Follow Category Onboarding Ritual.

### Flooring — Minimal Work
- Sparse expert landscape (no single authority, NWFA standards exist)
- **Next:** After appliances

---

## 7. PIPELINE ARCHITECTURE (Category-Aware)

### How the Pipeline Works Now
The pipeline accepts a `--category` flag. All category-specific logic (anchors, spec fields, source pools, adjustment rules) is read from config files, not hardcoded. Adding a new category means creating a config, not modifying pipeline code.

### Config Structure Per Category
- `configs/{category}.json` — Full category definition: tier anchors with target scores, spec fields with adjustment rules, source pools, axis weights, category-specific scoring rules, outlook modifiers
- `calibration/{category}/config.json` — Geometric mean params for axis scoring
- `templates/prompt_b_{category}.md` — Category-specific Perplexity deep dive steering

### Spec Adjustment Design Principle
Spec fields must use continuous metrics that create real spread within a tier — not binary pass/fail checkboxes. Binary checkboxes inflate all premium products equally and fail to differentiate. The lesson from countertop calibration: every premium quartz earned the same +5 from cert checkboxes. Continuous metrics (Mohs hardness, heat resistance °F, hardware cycle ratings) create meaningful spread because products genuinely differ on these measurements.

### Category-Specific Spec Fields
**Windows:** U-factor, SHGC, air infiltration, DP rating, noise reduction (STC), operation type adjustments
**Countertops:** Heat resistance °F, Mohs hardness, water absorption %, flexural strength PSI, impact resistance, repairability, stain resistance (Class 1-5), UV resistance, warranty transferable, source traceability
**Cabinets:** Box substrate, drawer box joinery, drawer box material, finish type, back panel thickness, frame type (conditional on substrate), hinge cycle rating, drawer slide cycle rating, slide load capacity, soft-close standard, KCMA certified, warranty type, source traceability
**Faucets:** Body material (316 SS/304 SS/brass/ZAMAK), body construction (machined/cast/die-cast), cartridge manufacturer (Flühs/Kerox/Geann/proprietary/generic/unknown), cartridge cycle life, finish type (PVD/chrome/powder coat), business model (manufacturer/assembler/specifier/marketeer/rebrander), warranty type, cartridge warranty included (yes/no), finish warranty, parts availability, source traceability, UPC/NSF certification (gate check — uncertified = excluded)
**Dishwashers:** Motor type (brushless inverter/PSC induction/PMSM), filter type (self-cleaning/manual mesh/grinder), drying technology (zeolite/AutoAir/PureDry condensation/heated element), tub material (stainless/plastic), spray zones, noise dBA, water efficiency gal/cycle, rack glide type (ball-bearing/nylon), third rack, adjustable racks, energy kWh/yr, service rate (Yale), parts ecosystem breadth, service network coverage, warranty type
**Refrigerators (Built-In):** Compressor architecture (dual independent/single inverter+dual evaporator/single shared), compressor OEM (Embraco/Secop/Samsung/undisclosed), compressor type (variable-speed inverter/fixed-speed), refrigerant (R-134a/R-600a/R-290), interior material (stainless steel/ABS/HIPS/aluminum), insulation type (cyclopentane PU/VIP/standard PU), door seal type (vacuum magnetic/standard magnetic), hinge type and cycle rating, air purification (active scrubber/passive filter/ionizer/none), humidity control (vacuum-sealed crisper/active zones/passive vents), temperature precision (±°F), ice maker (modular/integrated/none — note: ice makers are #1 failure mode), noise dBA, usable vs claimed capacity, parts commitment horizon (years), service network type (factory-certified/authorized/independent), warranty full years, warranty sealed system years, platform sharing disclosure, source traceability

---

## 8. BUILDER SIGHTINGS DATABASE

### What It Is
Product sightings extracted from real estate listings by the spec-crawler system. Each sighting is a product observed in a specific home at a specific price point in a specific market.

### Current Data
- **EC2 (live, growing):** 35,700+ product sightings via national metro scan. Running on EC2 at 18.218.122.54. Database: `/home/ubuntu/spec-crawler/data/spec-crawler.json`.
- **Mac Mini (static snapshot):** 5,244 product sightings across 941 listings from 323 builders (earlier export imported to `./data/spec-crawler.json`)
- Schema ready: sighting_builders, sighting_listings, builder_sightings tables created on Mac Mini
- EC2 scan is ongoing — sightings count continues to grow as new metros are scanned

### Data Quality (Verified March 27, 2026 — from original 5,244 snapshot)
| Category | Sightings | Brand ID Quality |
|---|---|---|
| Appliances | 1,131 | Strong — Wolf, Thermador, Sub-Zero well-identified |
| Flooring | 545 | Low — mostly "hardwood floors" with no brand |
| Plumbing | 503 | Mixed |
| Countertops | 441 | Low — mostly material type only ("quartz countertops") |
| Smart Home | 329 | Mixed — Lutron, Control4, Nest identified |
| Cabinets | 297 | Very low — 95% "custom cabinetry" with no brand |
| Lighting | 287 | Low — Visual Comfort identified, most generic |
| Windows | 266 | Moderate — Marvin, Andersen, Jeld-Wen, Pella identified |

### 74% of specs have no brand specified
This IS the opportunity. Listings say "quartz countertops" without naming the manufacturer.

### Product Queue Strategy (Decided March 28, 2026)
After calibration products are locked in each category, the sightings data informs which products to score next. Filter for sightings that actually name a brand — these are the products buyers encounter in real transactions. The high-end skew in listing data is an advantage: first revenue product is the $500 spec report for $2-5M home buyers, who are looking at exactly the brands that appear in luxury listing descriptions. Builder-grade backfill comes later for the agent membership product.

### Import Status
Static snapshot on Mac Mini at `./data/spec-crawler.json` (5,244 sightings). Import script ready (`import_sightings.js`). Not yet imported — waiting for all four launch categories (windows, countertops, cabinets, faucets) to be calibrated so the matching script can link sightings to scored products across categories simultaneously. When ready, a fresh export from EC2 (35,700+ sightings) should be pulled rather than using the older snapshot.

---

## 9. CONTENT STRATEGY

### YouTube Channel Format
"Does this home's quality match its price?" — repeatable, shareable, unlimited content supply.

Each video: Pull a listing (model home or sold home), identify 2-3 spec categories, run them through the scoring system on camera, show whether the finishes match the price point.

### Why This Format
- Demonstrates the scoring system working on real homes (live product demo)
- Endlessly repeatable (new listing every day)
- Puts builders on notice (drives certification demand)
- Viewers submit their own spec sheets (builds proprietary data)
- Positions the system as the star, not Ray as a personality
- Model homes are open to the public (no permission needed)
- Shorts cut themselves: "This $3M home has $54-rated windows"

### Content → Business Flywheel
Videos → viewer submissions → scored products → proprietary sightings data → more credible content → more submissions → agent awareness → referrals → spec report revenue

---

## 10. KEY PRINCIPLES

### Scoring Philosophy
- The tier is the product. The number is sort order within the tier. Don't present fine-grained gaps as precision claims.
- Expert consensus IS merit filtered through experience. It's not "the internet likes it" — it's structured synthesis of professional judgment.
- Disclose the framework, protect the formula. Michelin doesn't hand you inspector notes.
- Score what the product IS, not what it costs. Fabuwood at Tier 1 because the construction matches Tier 1. KraftMaid base at Tier 2 because the base construction is Tier 2.

### Methodology Decisions (Stress-Tested March 27-28, 2026)
- 80/20 split (expert consensus / spec adjustments) is correct.
- Tier crossing via specs is not allowed. The tier IS the expert judgment.
- Verified specs override deep dive claims. Conflicts skip the adjustment.
- Health certifications belong in Material Safety report only — not composite. Including them in composite broke the report-only rule and inflated premium products uniformly.
- Source traceability replaces domestic manufacturing. Measures supply chain accountability, applies fairly to quarried stone and single-factory manufactured products alike.
- Spec fields must use continuous metrics, not binary pass/fail. Binary checkboxes were tried on countertops and failed.
- Testing framework research BEFORE hierarchy research BEFORE config build. This sequence prevents building wrong spec fields and rescoring.

### What We Don't Do
- No VA verification step
- No $2,500 manually-verified reports
- No selling favorable scores
- No aesthetics, installation difficulty, or supply chain ethics evaluation
- Manufacturing hazards (silicosis, fabrication dust) excluded — only score what reaches the occupant
- No price scoring — we score the product, not its value proposition

### Working With Ray
- Wants direct answers, not hedging. If something is wrong, say so.
- Prefers creating over operating. Hires operators as soon as possible.
- Has a pattern of starting categories and moving on before they're locked. Flag this when it happens.
- Values systematic, scalable operations over high-touch service delivery.
- Requests direct pushback and honest assessment in strategic conversations.

---

## 11. IMMEDIATE PRIORITIES (as of March 31, 2026)

1. **✅ Rescore Marvin to 90-93** — DONE. Marvin casement 93, DH 92, Loewen 91, Kolbe 90.
2. **✅ Build Countertops** — DONE. 6 products calibrated, config locked, spec fields validated.
3. **✅ Build Cabinets** — DONE. 6 products calibrated, config locked, spec fields validated.
4. **✅ Run Perplexity deep dives for cabinet calibration products** — DONE March 30, 2026. Six individual deep dives run, structured into pipeline JSON curation files, transferred to Mac Mini.
5. **✅ Timberlake KCMA flag resolved** — Calibration already scored with KCMA=true. Deep dive confirmed active cert (Feb 2026). No score change.
6. **✅ IKEA warranty correction** — Warranty adjusted from 0 to +1. Exclusions (water damage) are industry-standard across all brands. 25-year term + foundation backing = +1. Durability axis 6.5→6.8, display score 70→71. Calibration script needs update.
7. **✅ KraftMaid/Merillat KCMA confirmed** — Cabinetworks Group relisted on KCMA website with downloadable A161.1 certificates for both brands. Calibration assumption of true was correct. No score change.
8. **✅ Run investigator bot on 6 cabinet products** — DONE March 30, 2026. All 6 products produced valid axis decompositions with evidence-traced findings. Summary on Mac Mini at `investigator_cabinet_summary.md`.
9. **✅ Faucets Step 0** — DONE March 30, 2026.
10. **✅ Faucets scoring, deep dives, corrections, investigator bot** — ALL DONE March 30, 2026. 6 products scored (v2 post-deep-dive corrections), curation files structured, investigator bot run. All four launch categories now locked.
11. **Add products from sightings data** — After all categories built, import sightings from EC2, match to scored products.
12. **Start YouTube Channel** — Model home walkthroughs in Austin. "Does this home's quality match its price?"
13. **Revalidate Investigator Bot** — Against recalibrated window scores and new countertop/cabinet scores.
14. **✅ Extract cabinet config to JSON** — DONE March 30, 2026. `configs/cabinets.json` + `calibration/cabinets/config.json` on Mac Mini. All 6 targets verified.
15. **✅ Extract faucet config to JSON** — DONE March 30, 2026. `configs/faucets.json` + `calibration/faucets/config.json` on Mac Mini. All 6 targets verified.
16. **✅ Dishwashers Step 0 + calibration script** — DONE March 31, 2026. Two-pass research (landscape + component deep dive), competitive hierarchy (top + bottom), config built, calibration script with 6/6 targets hit. Two-pass research system established as standard for all new categories.
17. **✅ Category Onboarding Ritual** — DONE March 31, 2026. Standardized operating procedure for new category builds. Includes two-pass research system, templates for all Perplexity queries, config/calibration/prompt file specifications. Saved as `CATEGORY_ONBOARDING_RITUAL.md`.
18. **✅ Report Design Brief** — DONE March 31, 2026. Specification for buyer-facing reports. Captures Pella 250 baseline, v2 improvements (What You Should Know, Repair Economics, Service Network, Platform Disclosure, Competitor Context, Warranty Reality), plain-English translation rules. Saved as `REPORT_DESIGN_BRIEF.md`.
19. **✅ Run dishwasher deep dives** — DONE March 31, 2026. All 6 deep dives processed against calibration script. 6 major corrections found and applied. Calibration v2 built with corrected targets (81, 67, 64, 47). Whirlpool promoted Tier 4→Tier 3.
20. **✅ Build dishwasher curation files** — DONE March 31, 2026. 6 JSON curation files built in pipeline format with three-column evidence (Expert/Review/Forum), source pools, verified specs, correction logs, failure modes. Deployed to Mac Mini at `calibration/dishwashers/curation_files/`.
21. **✅ Run dishwasher investigator bot** — DONE March 31, 2026. `run_investigator_dishwashers.js` created and run on Mac Mini. 6 investigator reports + summary saved to workspace root. All reports passed audit against curation files.
22. **✅ Verify Bosch 800 rack glide spec** — DONE March 31, 2026. BSH brochure confirms: 800 gets ball-bearing on upper rack only. All-three-rack ball-bearing is Benchmark exclusive. 300/500 are standard nylon. Curation file corrected.
23. **✅ Refrigerators Step 0 + calibration script** — DONE March 31, 2026. Built-in only scope. 4-pass Perplexity research (testing landscape, component deep dive, hierarchy top, hierarchy bottom). Config built, calibration script with 6/6 targets hit. Research queries saved as `templates/prompt_a_refrigerators.md`.
24. **✅ Run refrigerator deep dives** — DONE March 31, 2026. All 6 deep dives run in Perplexity using structured prompt_b template. Outputs saved to `knowledge/refrigerators/` on Mac Mini. 5 corrections identified across 3 products (Bosch Benchmark, JennAir, Dacor).
25. **Build refrigerator calibration v2** — Process deep dive corrections. 3 products need target review: Bosch Benchmark (dual compressor universal but warranty weaker), JennAir (class action doesn't apply to columns, 12yr sealed warranty), Dacor (stainless interior, no ice maker on column, 15yr compressor warranty).
26. **Build refrigerator configs** — `configs/refrigerators.json` + `calibration/refrigerators/config.json`. Mechanical — 15 min.
27. **Build refrigerator curation files** — Structure 6 deep dive outputs into pipeline JSON format.
28. **Run refrigerator investigator bot** — After calibration v2 locked.
29. **Update Category Onboarding Ritual** — Add `prompt_a` naming convention (research queries) vs `prompt_b` (per-product deep dives). Add instruction to study completed category queries before drafting new ones. Save all research queries to `templates/` as reference for expected specificity level.
30. **Start ranges/cooktops** — Next appliance subcategory after refrigerators locked. Follow Category Onboarding Ritual.

### LAUNCH ROADMAP (Defined March 30, 2026)

**MILESTONE: Five launch categories LOCKED + one in progress** — Windows (32 products), Countertops (6), Cabinets (6), Faucets (6), Dishwashers (6). Refrigerators (built-in only, 6 products) in progress — deep dives complete, corrections pending. Methodology proven across 5 categories. Pipeline works.

**Phase 1 — Build remaining categories at calibration depth (3-4 sessions)**
Each category: 5-6 calibration products, same Step 0 methodology, same pipeline. Go WIDE not deep.
- Appliances: dishwashers, ranges/cooktops, refrigerators (each is its own sub-category). Yale Appliance = primary authority. Dishwasher template exists from old system.
- HVAC: identify source landscape, testing standards, calibration products
- Flooring: carpet, tile, hardwood, luxury vinyl plank (4 sub-categories). Sparse expert landscape — NWFA standards exist.
- Toilets, sinks, hot water heaters: plumbing fixtures extension. StarCraft covers some. MaP Testing for toilets.
- Exterior doors: new category build
- Lighting/hardware: gas lanterns (luxury niche identified in sightings), Visual Comfort identified in sightings data
- Quartzite, marble, Corian, Formica: extend countertops category with additional material classes

**Phase 2 — Merge databases + build product matching**
- Connect EC2 spec-crawler sightings (35,700+) to Mac Mini scoring pipeline
- Build matching logic: sighting brand name → scored product in pipeline
- Products that match existing calibration → auto-score
- New brands identified → flagged for deep dive queue
- Brands without model numbers → flag brand for category expansion

**Phase 3 — Claude Vision scan across sightings**
- Run Claude Vision on listing photos from sightings database
- Identify: Sub-Zero model stickers, Marvin window labels, Kohler shapes, appliance model plates, etc.
- Expected hit rate varies: appliances high, faucets high, windows low
- Even 30% hit rate across 35K listings = 10K+ identified products
- This is the machine that builds scored inventory AND market intelligence simultaneously
- Do NOT start this until Phase 1 categories are built — Vision needs somewhere to route what it finds

**Phase 4 — MSRP tier data**
- Add basic retail pricing at time of scoring for each product
- NOT live price tracking (maintenance treadmill). Static MSRP tiers: "this is a $1,200 dishwasher vs a $3,500 dishwasher"
- Enables: price-tier comparisons, value assessments, "is this $3M home using $3M products?" analysis
- Enables: "30% of homes at this price point have this level of stove" market positioning

**Phase 5 — Report template design**
- Design publication-quality buyer report around REAL scored output (not hypothetical)
- Old system dishwasher report PDF exists as template reference
- Must include: product scores, axis decompositions, market positioning (percentile vs price tier), warranty/parts assessment, material safety flags, corporate outlook
- Must look beautiful — this is a premium product
- One or two days of work, but only after data pipeline produces real output

**Phase 6 — First YouTube video + first paid report**
- Model home walkthrough using real scores from real listings
- Scoring system is the star, not Ray as personality
- Shorts cut themselves: "This $3M home has $54-rated windows"
- Viewer submissions drive the flywheel: videos → submissions → scored products → data → credibility → referrals → revenue
- First paid spec report ($500) for a real buyer or agent

**What this produces when complete:**
- Full-home scoring across all major residential product categories
- Market intelligence: "30% of homes at this price point have this level of [product]"
- Comparative reports: two homes side by side, scored across every category
- Warranty and parts availability intelligence (European parts delays, etc.)
- Price-tier positioning: is this home's product quality consistent with its price?
- The data asset nobody else has: scored products × market frequency × price tiers

### NOT doing now (parked):
- Cloud migration of Mac Mini runtime (Mac Mini is stable — don't touch it)
- Design Center Scout app concept
- Native mobile app
- SaaS subscription model (Ray does not want this)
- High-touch consulting (Ray does not want this)

### Infrastructure Consolidation (Added March 30, 2026)

**Problem:** Files are scattered across three machines (Residentialist Mac Mini, Ray's Mac, EC2). Sessions regularly lose time searching for scripts and configs. EC2 spec-crawler database has zero backups on irreplaceable data.

**URGENT — ✅ DONE (March 30, 2026):**
- Nightly S3 backup of EC2 spec-crawler data configured. Backs up `spec-crawler.json` (41MB) and `national-scan-state.json` to `s3://residentialist-knowledge/backups/spec-crawler/` at 2:00 AM UTC daily. 30-day retention with auto-prune. Test run verified.

**This week (after faucets config locked, delegate to VA or Claude Code):**
- Push spec-crawler code to its own GitHub repo (separate from pipeline repo). EC2 code has no version control — if the instance dies, code is gone.
- Commit all pipeline assets to existing `GRS5150/residentialist-pipeline` repo: calibration scripts, configs, knowledge files, templates, system doc. Both Macs pull from same repo.
- ✅ ~~Extract cabinet config from `score_cabinets_calibration.js`~~ — DONE March 30, 2026. `configs/cabinets.json` + `calibration/cabinets/config.json` on Mac Mini.
- ✅ ~~Extract faucet config from `score_faucets_calibration.js`~~ — DONE March 30, 2026. `configs/faucets.json` + `calibration/faucets/config.json` on Mac Mini.

**After sightings import (when databases need to talk):**
- Build bridge between spec-crawler sightings DB (EC2) and scoring pipeline DB (Mac Mini SQLite). Matching logic: sightings with brand-identified products → scored products across all four launch categories.
- Decide whether sightings data migrates to Mac Mini or pipeline reads from EC2 via API.

**Not now:**
- Cloud migration of Mac Mini (dashboard, SQLite, pipeline execution). Current setup works. Tailscale provides remote access. Revisit only if Mac Mini becomes unreliable or team grows beyond Ray + VA.

**Rule of thumb going forward:** If a file matters, it's in a GitHub repo. If it's not in a repo, it doesn't exist as far as the system is concerned. Every working session ends with a commit of whatever was created.

---

## 12. FILE LOCATIONS ON MAC MINI

**Pipeline Code:** `/Users/Residentialist/.openclaw/workspace/residentialist/`
- `full_pipeline.js` — orchestrates everything (category-aware)
- `deep_dive_pipeline.js` — Perplexity API calls
- `sonnet_structurer.js` — three-column evidence structuring
- `sonnet_scorer.js` — 3x majority vote tier classification
- `haiku_auditor.js` — contamination audit
- `score_calculator.js` — deterministic scoring (category-aware, reads from config)
- `report_writer.js` — editorial content generation
- `spec_verifier.js` — verified specs pipeline
- `run_investigator_test.js` — investigator bot test script
- `run_batch_deep_dives.js` — batch processing
- `rescore_all_tiers.js` — batch rescore from existing curation
- `score_cabinets_calibration.js` — cabinet calibration scoring script
- `score_dishwashers_calibration.js` — dishwasher calibration scoring script
- `run_investigator_dishwashers.js` — dishwasher investigator bot runner (calls Sonnet against curation files)
- `score_refrigerators_calibration.js` — refrigerator calibration scoring script v1 (built-in only, 6/6 targets hit, pre deep dive corrections)

**Category Configs:** `configs/`
- `windows.json` — extracted from hardcoded values
- `countertops.json` — continuous ASTM-based spec fields
- `cabinets.json` — extracted from calibration script (March 30, 2026)
- `faucets.json` — extracted from calibration script (March 30, 2026)
- `dishwashers.json` — built from two-pass Perplexity research (March 31, 2026)
- `refrigerators.json` — NOT YET BUILT. Calibration script exists but config file needs extraction. (March 31, 2026)

**Calibration:** `calibration/{category}/config.json`
- `calibration/cabinets/config.json` — extracted March 30, 2026
- `calibration/faucets/config.json` — extracted March 30, 2026
- `calibration/dishwashers/config.json` — built March 31, 2026
- `calibration/dishwashers/score_dishwashers_calibration.js` — v2 post deep dive corrections (March 31, 2026)
- `calibration/dishwashers/curation_files/miele_g7000_curation.json`
- `calibration/dishwashers/curation_files/bosch_800_curation.json`
- `calibration/dishwashers/curation_files/kitchenaid_kdtm604_curation.json`
- `calibration/dishwashers/curation_files/bosch_300_curation.json`
- `calibration/dishwashers/curation_files/whirlpool_wdt750sakz_curation.json`
- `calibration/dishwashers/curation_files/samsung_dw80_mid_curation.json`

**Cabinet Calibration Script (on Ray's Mac + Residentialist Mac Mini):**
- `/Users/raysahpley/Documents/residentialist-phase2/score_cabinets_calibration.js` — contains all product specs, axis scores, adjustment rules, and geometric mean calculation. Config has been extracted to `configs/cabinets.json` and `calibration/cabinets/config.json` on Mac Mini (March 30, 2026).

**Templates:** `templates/`
- `prompt_b_product.md` — window-specific deep dive prompt
- `prompt_b_countertop.md` — countertop-specific deep dive prompt
- `prompt_b_cabinets.md` — cabinet-specific deep dive prompt
- `prompt_b_dishwashers.md` — dishwasher-specific deep dive prompt (post-Pass 2, with named component suppliers and part numbers)
- `prompt_a_refrigerators.md` — refrigerator 4-pass research queries (Pass 1-4, built-in only scope). NOTE: "prompt_a" = research queries, "prompt_b" = per-product deep dive prompts.
- `prompt_b_refrigerators.md` — refrigerator per-product deep dive prompt with named compressor OEMs, part numbers, platform maps, and failure modes from Pass 2

**Manufacturer Stubs:** `manufacturers/`
- Cambria, Cosentino (Dekton/Silestone), Caesarstone, MSI, natural_stone

**Database:** `residentialist.db` (SQLite, products table now has category column)
**Curation Files:** `curation/` (confirmed March 30, 2026 — 76 files for windows/countertops + 6 cabinet JSON files + 6 faucet JSON files. NOTE: `curation_files/` directory also exists but is empty.)
**Knowledge Files:** `knowledge/`
- `knowledge/cabinets/cabinets_eval_knowledge.md`
- `knowledge/cabinets/cabinets_material_safety_knowledge.md`
- `knowledge/dishwashers/dishwashers_component_analysis.md` — Pass 2 component deep dive (March 31, 2026)
- `knowledge/refrigerators/` — 4 research pass outputs + 6 deep dive outputs (March 31, 2026). Includes: testing landscape (Pass 1), component intelligence report (Pass 2 — Embraco compressor IDs, BSH platform part numbers, Samsung/Dacor convergence, Viking OEM identification), hierarchy top (Pass 3 — Sub-Zero/Thermador/Gaggenau/Miele/True/JennAir), hierarchy bottom (Pass 4 — Bosch Benchmark/F&P/Monogram/Dacor/Viking/Samsung Bespoke), plus 6 individual product deep dives.
**Standalone Documents (workspace root):**
- `CATEGORY_ONBOARDING_RITUAL.md` — Standard operating procedure for new category builds
- `REPORT_DESIGN_BRIEF.md` — Buyer-facing report format specification
**Spec Crawler Data:** `data/spec-crawler.json`
**Backups:** `/Users/Residentialist/residentialist_cleanup/backups/`
**GitHub:** GRS5150/residentialist-pipeline
**Output/Summaries:** `output/`
- `countertop_pipeline_summary.md`
- `countertop_rescore_summary.md`
- `countertop_final_rescore_summary.md`
- `cabinet_pipeline_summary.md`
**Investigator Reports (workspace root):**
- `investigator_dishwasher_miele_g7000.md`
- `investigator_dishwasher_bosch_800.md`
- `investigator_dishwasher_kitchenaid_kdtm604.md`
- `investigator_dishwasher_bosch_300.md`
- `investigator_dishwasher_whirlpool_wdt750sakz.md`
- `investigator_dishwasher_samsung_dw80_mid.md`
- `investigator_dishwasher_summary.md`

---

## 12.5 CURATION FILE FORMAT (Pipeline JSON Schema)

The Sonnet structurer (Step 2) outputs curation files as JSON. All downstream pipeline steps — source verification, spec verification, human curation dashboard, tier classification, Haiku audit, and investigator bot — consume this format. Manually structured curation files must match this schema exactly.

### File Location
- Windows: `curation/{product_slug}_{operation_type}_sources.json`
- Cabinets, countertops, faucets: `curation/{product_slug}_sources.json`

### Complete Schema

```json
{
  "product": "Full Product Name",
  "report_date": "2026",
  "sources": [
    {
      "id": "SRC-001",
      "source_name": "Human-readable source name",
      "url": "https://...",
      "platform": "youtube|reddit|houzz|gba|other",
      "column": "expert|review|forum",
      "snippet": "Substantive finding text — what this source says about the product",
      "pool": "S|A|B|C",
      "classification": "score|report_only|quarantine",
      "classification_reason": "Why this classification was assigned",
      "topics": ["quality", "performance", "durability", "specs", "service"],
      "verification_relevance": "relevant"
    }
  ],
  "bottom_line": "Summary paragraph synthesizing all scored evidence.",
  "scoring_notes": {
    "sources_scored": ["SRC-001", "SRC-002"],
    "sources_report_only": ["SRC-010"],
    "sources_quarantined": ["SRC-006"],
    "pool_distribution": {
      "pool_S": 0,
      "pool_A": 2,
      "pool_B": 7,
      "pool_C": 20
    }
  },
  "product_slug": "lowercase_underscore_name",
  "product_name": "Display Name",
  "manufacturer_slug": "lowercase_manufacturer",
  "operation_type": "casement|double_hung|null",
  "deep_dive_date": "2026-03-30",
  "structuring_duration_ms": 171408,
  "structuring_model": "claude-sonnet-4-6",
  "auto_classification_summary": {
    "total": 29,
    "score": 10,
    "report_only": 7,
    "quarantine": 12
  },
  "curation_status": "staged",
  "curation_date": null,
  "human_overrides": [],
  "structuring_cost_estimate": 0.16,
  "verification_date": "2026-03-23T19:45:07.877Z"
}
```

### Field Reference

| Field | Values | Notes |
|-------|--------|-------|
| `sources[].column` | `expert`, `review`, `forum` | Maps to three-column structure |
| `sources[].classification` | `score`, `report_only`, `quarantine` | Score = affects tier. Report Only = buyer report only. Quarantine = excluded |
| `sources[].pool` | `S`, `A`, `B`, `C` | Source weight (S=1.50x, A=1.00x, B=0.75x, C=0.40x) |
| `sources[].topics` | Array of: `quality`, `performance`, `durability`, `specs`, `service` | Relevant scoring axes |
| `operation_type` | `casement`, `double_hung`, or `null` | Windows only; null for other categories |
| `structuring_model` | `claude-sonnet-4-6` or `manual_structuring` | Pipeline-generated vs hand-built |
| `curation_status` | `staged`, `curated`, `scored` | Staged = awaiting review. Curated = human approved. Scored = score calculated |

### Manually Building Curation Files
When deep dives are run in Perplexity browser (not through the API), curation files must be manually structured to match this schema. Set `structuring_model` to `manual_structuring` and `structuring_duration_ms` / `structuring_cost_estimate` to `0`. All other fields must be populated identically to pipeline-generated files.

*Schema documented March 30, 2026 from production file: `marvin_signature_ultimate_double_hung_sources.json`*

---

## 12.6 CATEGORY ONBOARDING RITUAL

A standardized operating procedure exists for adding new product categories: `CATEGORY_ONBOARDING_RITUAL.md`. This document defines the exact sequence (two-pass research → hierarchy → config → calibration → deep dives → curation → scoring → investigation) and includes templates for all Perplexity queries, config files, and calibration scripts. Every successfully built category followed this sequence. The two-pass research system (landscape survey + component deep dive) was established during the dishwasher build and is now standard for all new categories. Drop this file into any session where a new category is being started.

**Template naming convention (established March 31, 2026):**
- `templates/prompt_a_{category}.md` = Research queries (Pass 1-4, run before any product is scored). These contain the category-specific Perplexity queries with named component suppliers, part numbers, and failure modes.
- `templates/prompt_b_{category}.md` = Per-product deep dive prompts (run after config is built). These contain the master template + product-specific context paragraphs.

**IMPORTANT: Before drafting research queries for a new category, study the completed `prompt_a_` files from previous categories.** The specificity level matters — naming Embraco compressor models, referencing BSH platform part numbers, asking about specific failure modes. Generic placeholder queries produce generic results. The refrigerator queries (`prompt_a_refrigerators.md`) are the current gold standard for expected specificity.

**TODO (not yet done):** Update `CATEGORY_ONBOARDING_RITUAL.md` itself with the prompt_a/prompt_b naming convention, the "study completed queries first" instruction, and the requirement to save all research queries to `templates/`.

File location: Root of workspace and in `templates/`.

---

## 12.7 REPORT DESIGN BRIEF

A standalone specification exists for the buyer-facing product quality report format: `REPORT_DESIGN_BRIEF.md`. Captures the current Pella 250 baseline report structure, v2 improvements (What You Should Know section, Repair Economics table, Service Network map, Platform Disclosure, Corporate Outlook, Competitor Context, Warranty Reality), plain-English translation rules, and what populates each section from the pipeline. Reference during Phase 5 (report template design) and investigator bot prompt development. Do NOT reference during scoring or calibration sessions.

File location: Root of workspace.

---

## 13. PRIOR SYSTEM REFERENCE

An older evaluation system exists with richer category knowledge files but lower reproducibility. Key assets:

- **System Bible v5** — Complete methodology document (2,300+ lines). Contains bot prompts, scoring frameworks, calibration rules 1-14, named rules, knowledge files for faucets and countertops.
- **Session Briefing** — Operational context describing old three-bot pipeline.
- **Expert Discovery Prompt** — Reusable template for finding Pool S/A/B sources.
- **Cabinet Expert Source Report** — 35+ sources evaluated, 10 recommended.
- **Countertop Expert Source Report** — 40+ sources evaluated, 10 recommended.
- **Dishwasher Report PDF** — Publication-quality sample report template.

Old system scores served as VALIDATION TARGETS for the new pipeline, not ground truth. All six countertop products and all six cabinet products were validated against old system rank ordering. Fabuwood was the one product that moved significantly (B+ old → Tier 1 new) because the old system had price-tier bias.

---

## 14. RESEARCH ARTIFACTS (Updated March 31, 2026)

### Countertop Research
- `tier_anchor_calibration_countertops.md` — Competitive hierarchy research, anchor placements, rationale
- `countertop_spec_fields_v2.md` — Redesigned spec fields with ASTM continuous metrics
- Perplexity testing framework output — ASTM standards, Mohs scale, EN 14617 series, ISO 10545, NEMA LD3, testing labs (NSI, Intertek, Capital Testing), Karin Kirk comparative test data

### Cabinet Research
- `cabinet_complete_build_package.md` — Full config, anchors, spec fields, framed/frameless decision, Claude Code session prompt
- Perplexity testing framework output — KCMA A161.1 (14 construction requirements, 8 test categories), ANSI/BHMA A156.9 (hardware grades), CARB Phase 2/TSCA Title VI (formaldehyde), AWI 0641 (commercial casework duty levels), hardware cycle/load data from Blum/Grass/Hettich/Accuride catalogs
- Perplexity competitive hierarchy output — Main Line Kitchen Design 157-brand framework, MasterBrand corporate structure, tier-by-tier brand placement, construction detail hierarchy
- Framed vs frameless research — KCMA test data showing higher frameless failure on base-front joint, European field performance (15-25+ year service life for premium frameless), conditional adjustment decision

### Cabinet Deep Dives (March 30, 2026)
- 6 individual Perplexity deep dives run for calibration products: Crystal Keyline (45 sources), Fabuwood Galaxy (49), KraftMaid base (47), IKEA SEKTION (58), Merillat Classic (52), Timberlake Origins (37)
- Raw deep dive outputs saved as .md files
- Pipeline-format JSON curation files created and transferred to Mac Mini `curation/` directory
- Batch summary file (7th file) discarded due to two data discrepancies: Crystal MLKD rating conflation (A/A vs B+/B+) and Merillat drawer joinery misattribution (dovetail attributed to standard tier, actually Deluxe only)
- Key discovery: Timberlake Origins re-certified KCMA A161.1 (Certificate 25160R, Feb 2026) after American Woodmark's Oct 2022 resignation

### Dishwasher Research (March 31, 2026)
- `knowledge/dishwashers/dishwashers_component_analysis.md` — Pass 2 component deep dive: named motor suppliers (Askoll, Sisme, Nidec, Hanning, Welling, EBM-Papst), BSH platform component map at part-number level (control boards 00746432/00676960/00475225/11031054, circulation pump 00442548 confirmed cross-brand), Whirlpool/KitchenAid platform map (Askoll M309 circulation pump, W10348269 drain pump shared across 10+ brands), Miele vertical integration confirmed (ArcelorMittal → Euskirchen → Uničov), control board failure modes (heater relay cold solder, capacitor aging, steam intrusion), filter-to-pump failure chain documented
- `Residential_Dishwasher_Testing_Landscape.md` — Pass 1 testing framework: DOE/AHAM/IEC/NSF standards, measurable spec fields with numeric spread (dBA 37-56+, kWh/yr, gal/cycle, soil removal %), independent testing organizations (CR, Reviewed.com, CNET, GHI), Yale Appliance service rate data (Pool S), construction differentiators, teardown gap confirmed
- Perplexity competitive hierarchy output (top) — BSH platform reality (Bosch/Thermador/Gaggenau share platform, 0.4% service rate spread), Miele structural reliability advantage (5.6%), Cove warranty leadership (5-year full), professional consensus
- Perplexity competitive hierarchy output (bottom) — Full brand positioning from repair tech consensus, Samsung service ecosystem trap documented, Whirlpool as acceptable floor, Fisher & Paykel/Café warning zone, professional "line" at Bosch 500
- `score_dishwashers_calibration.js` — 6 calibration products, all targets hit exactly (Q=0.30, D=0.40, P=0.30)
- `templates/prompt_b_dishwashers.md` — Structured deep dive prompt template with named components, part numbers, and supplier-specific questions for all 6 calibration products
- `CATEGORY_ONBOARDING_RITUAL.md` — Standardized two-pass category onboarding procedure, established during dishwasher build
- `REPORT_DESIGN_BRIEF.md` — Buyer-facing report format specification with v2 improvements

### Dishwasher Deep Dives & Investigator (March 31, 2026)
- 6 Perplexity deep dives processed: Miele G7000, Bosch 800, KitchenAid KDTM604, Bosch 300, Whirlpool WDT750SAKZ, Samsung DW80
- 6 major corrections applied (see Category Status section for full list)
- Calibration v2 built: `calibration/dishwashers/score_dishwashers_calibration.js`
- 6 curation files built in pipeline JSON format
- Investigator bot run: 6 reports + summary, all passed audit
- Bosch 800 rack glide spec verified via BSH brochure (ball-bearing upper rack only, Benchmark gets all three)

### Refrigerator Research (March 31, 2026)
- Scope: Built-in only. No freestanding, no counter-depth freestanding.
- Pass 1 (testing landscape): DOE/AHAM/UL standards (compliance-oriented, not differentiating), Consumer Reports (15 thermocouples, 5.4M readings/unit, 30+ days), RTINGS.com (Test Bench 1.0/1.1 — publishes actual numeric values, rare in category), Yale Appliance service rate data (Pool S), Reviewed.com (Dr. David Ellerby, food-temp sensors). Key finding: no StarCraft equivalent exists for built-in refrigerators — teardown gap confirmed. Pool S vacant for component analysis.
- Pass 2 (component deep dive): Sub-Zero compressor identified (Embraco EMI30HER + FGS70A, R-134a, fixed-speed legacy / variable-speed 2023+). BSH compressor part numbers cross-listed (00146062, 00146189, etc.) across Thermador/Gaggenau/Bosch Benchmark — platform confirmed. Samsung/Dacor complete convergence (every part DA97/DA94 prefix). Viking compressor probable Embraco VEGD8H (confirmed on sibling VCSB5483SS). GE Monogram shares Selmer TN factory with Profile/Café. Whirlpool/JennAir start device W10448874 cross-compatible. Liebherr identified as VIP (vacuum insulation panel) technology leader (BluRoX, 30% more volume).
- Pass 3 (hierarchy top): Sub-Zero clear Tier 1 by professional consensus. Thermador strong second (Yale "A" grade). Gaggenau = same BSH platform at higher price. Miele = BSH-sourced refrigeration from same Turkish factory. True Residential = exceptional build but unproven residential track record and thin service network. JennAir = premium price, mid-market Whirlpool platform.
- Pass 4 (hierarchy bottom): Viking >60% first-year service rate, CR #25 of 25 (34/100). Dacor = Samsung with premium badge. Samsung Bespoke = ~70% of CPSC complaints, Yale stopped selling. GE Monogram = sealed system failures ~year 5. Professional floor = Thermador/BSH platform.
- `score_refrigerators_calibration.js` — 6 calibration products, all targets hit exactly (Q=0.30, D=0.40, P=0.30)
- `templates/prompt_a_refrigerators.md` — 4-pass research queries with named component suppliers, part numbers, platform maps
- `templates/prompt_b_refrigerators.md` — Per-product deep dive prompts for all 6 calibration products with Pass 2 component intelligence

### Refrigerator Deep Dives (March 31, 2026)
- 6 Perplexity deep dives run: Sub-Zero Classic/Designer/Pro, Thermador Freedom, Bosch Benchmark, JennAir Column, Dacor Column (DRR30980RAP), Viking 5 Series (FDRB5363)
- 5 corrections identified across 3 products (Bosch Benchmark, JennAir, Dacor) — v2 calibration pending
- Key findings: Sub-Zero 2023+ transitioned to variable-speed compressor (Split Climate™). Bosch Benchmark dual compressor universal (not "some models"). JennAir class action doesn't apply to column models. Dacor column has full stainless interior (SteelCool™) and NO ice maker. Viking compressor probable Embraco VEGD8H.
- Critical discovery: BSH Turkish factory platform confirmed by Yale for ALL four brands (Miele, Thermador, Gaggenau, Bosch Benchmark). MANDATORY platform disclosure for every report.

---

*Last updated: March 31, 2026 (v8)*
*This document replaces v7 (RESIDENTIALIST_UNIFIED_SYSTEM_DOC_v7.md)*
*Changes in v8: Added refrigerator category (built-in only, Step 0 complete + calibration script v1 6/6 targets + 6 deep dives run + corrections identified), added Rule 20 (European brand evidence asymmetry — low US volume brands have thinner lawsuit evidence, disclose in reports, no score impact), added refrigerator axis weights and spec fields, added prompt_a/prompt_b naming convention to Section 12.6 with TODO to update CATEGORY_ONBOARDING_RITUAL.md, added mandatory BSH Turkish factory platform disclosure for Miele/Thermador/Gaggenau/Bosch Benchmark refrigerator reports, updated priorities (items 23-30), updated launch roadmap milestone (5 categories locked + 1 in progress), added refrigerator research artifacts and deep dive findings.*
*Next session: Build refrigerator calibration v2 (process deep dive corrections for Bosch Benchmark, JennAir, Dacor), then configs and curation files*
