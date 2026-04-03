# The Residentialist — Category Onboarding Ritual
## Standard operating procedure for adding a new product category
### Created March 30, 2026

---

## Purpose

This document defines the exact sequence for bringing a new product category online in the Residentialist scoring pipeline. Every category that has been successfully built (17 categories locked as of April 2, 2026) followed this sequence. Deviating from the order — especially building spec fields before running the research — causes rescoring.

**Rule: Research FIRST (four passes), hierarchy SECOND, config THIRD. This order is non-negotiable.**

---

## Pre-Work: What You Need Before Starting

- [ ] Category identified and named (matches `configs/{category}.json` naming)
- [ ] At least one known expert authority for the category (equivalent to StarCraft for faucets, Yale Appliance for dishwashers, Karin Kirk for countertops)
- [ ] Rough sense of 5-6 calibration products spanning Tier 1 through Tier 4 (top, upper-mid, lower-mid, bottom)
- [ ] Sightings data reviewed to confirm which brands appear in real listings (optional but recommended)
- [ ] For uncertain categories: Run Perplexity scoreability assessment (see below)

### Scoreability Pre-Qualification (Added April 2, 2026)
For categories where you're unsure if the methodology fits, run this prompt through Perplexity before committing pipeline time:
```
I'm building a product intelligence platform that scores residential building products on Quality, Durability, and Performance using measurable specs and professional consensus. Before I commit to scoring a category, I need to understand if it's scorable.

Category: [CATEGORY NAME]

Answer these 5 questions:
1. What are the primary products/brands a buyer encounters in $1M-5M new construction homes?
2. Are there measurable specs with real spread between brands?
3. What do professional installers/integrators complain about?
4. Is this a product or a service?
5. What's the failure mode after 3-5 years?
```
If the answer to #4 is "mostly a service" and #2 comes back thin, the category is NOT scorable with this methodology. Example: Whole-home control (Control4/Crestron/Savant) was assessed April 2 and determined to be editorial-only, not scored.

---

## Phase 1: Research (Perplexity Deep Dive — 4 queries, four-pass system)

### File Naming Convention
- Research queries: `templates/prompt_a_{category}.md` (contains all 4 pass queries)
- Per-product deep dive prompts: `templates/prompt_b_{category}.md` (master template + product-specific sections)
- Before drafting prompt_a for a new category, ALWAYS study prompt_a files from completed categories (e.g., `prompt_a_refrigerators.md`, `prompt_a_hardwood_flooring.md`) to match the expected specificity level and format.

### Research Gate (NON-NEGOTIABLE)
Before building ANY config, calibration, or curation files:
1. ALL FOUR knowledge files must exist in `knowledge/{category}/`
2. Web searches are NOT a substitute for Perplexity research. Ever.
3. If Perplexity fails, retry. If it keeps failing, STOP and tell Ray.

### Why Two Passes

Pass 1 identifies the landscape — what gets tested, who tests it, what the general construction tiers are. It gives you category-level knowledge: "brushless inverter motors are better than brushed motors."

Pass 2 goes component-level — who makes the specific components, what are the supplier names, what exactly fails and why. It gives you scoring-level knowledge: "Nidec makes BSH's motors, Askoll makes the pumps, the Continental PCB is shared across the entire Bosch lineup."

The difference matters because Pass 2 is what tells you:
- Which specific component names to hunt for in per-product deep dives
- Whether your spec fields are measuring the right things
- Where the real differentiation lives (it might not be where Pass 1 suggested)

**Faucet example:** We walked into faucets already knowing cartridges were THE spec because the old system's knowledge files and StarCraft's body of work had already done the equivalent of Pass 2. For every NEW category, you need to do this work explicitly.

---

### Pass 1 — Landscape Survey (Query 1)

**Purpose:** Discover what gets measured, who measures it, where the scores live. This identifies the CATEGORIES of things that matter.

**Template:**
```
Who independently tests residential [CATEGORY] and what do they measure?

I'm building a product intelligence platform that scores residential [CATEGORY] on Quality, Performance, Durability, and Material Safety. I need to understand the testing landscape before I score anything.

Specifically:

1. What standardized tests exist for residential [CATEGORY]? (list relevant standards bodies — ASTM, ANSI, AHAM, IEC, KCMA, NSF, DOE, etc.)

2. What are the measurable performance specs with real numeric spread across brands? I need continuous metrics, not binary pass/fail. What specs create meaningful differentiation between premium and builder-grade?

3. Who does independent comparative testing? (independent labs, consumer publications, professional reviewers doing teardowns or side-by-side analysis)

4. What reliability data exists in the public domain? (service rates, failure rate databases, repair tech consensus)

5. What are the key construction differentiators between premium and builder-grade [CATEGORY]? (materials, components, manufacturing methods that professionals cite as quality signals)

6. Are there any independent reviewers doing physical teardowns or side-by-side component analysis — someone doing the equivalent of what StarCraft Reviews does for faucets?

Focus on sources that a product rating organization could cite with confidence. Skip marketing materials and manufacturer claims. I need the testing infrastructure, not the sales pitch.
```

**Output:** Save as `knowledge/{category}/{category}_testing_framework.md`

**What you extract from this:**
- The CATEGORIES of differentiators (motor type, drying technology, filtration, etc.)
- Pool S/A/B/C candidates
- Whether Performance axis is flat or has real spread
- Initial axis weight guidance

---

### Pass 2 — Component Deep Dive (Query 2)

**Purpose:** Go inside the machines. Name the component suppliers, map the platform sharing, understand the failure modes at part level. This is what transforms a landscape survey into a knowledge file you can score from.

**Template structure** (adapt the specifics per category — the dishwasher and faucet examples show the pattern):

```
I'm building an independent product intelligence platform that scores residential [CATEGORY] at the component level. I've already mapped the testing landscape and brand hierarchy. Now I need to understand the actual components inside these products — who makes them, how they differ, and what fails.

[CRITICAL COMPONENT 1 — e.g., cartridges for faucets, motors for dishwashers, hardware for cabinets]:
- Who are the major suppliers/manufacturers of this component? (name every supplier you can identify)
- Which brands use which suppliers?
- What are the specific specs that differentiate premium from commodity? (cycle life, material grade, tolerance, etc.)
- What are the documented failure modes for this component?

[CRITICAL COMPONENT 2 — e.g., finish technology for faucets, control boards for dishwashers, box substrate for cabinets]:
- Same depth: suppliers, specs, failure modes, brand-by-brand mapping

[CRITICAL COMPONENT 3]:
- Same pattern

[PLATFORM SHARING — SPECIFIC COMPONENT MAP]:
- For each brand family (BSH, Whirlpool/KitchenAid, Masco/Delta/Brizo, MasterBrand, etc.):
  Which specific components are identical across the lineup? Go part by part.
- Are cross-brand component interchangeabilities known to repair technicians?

[SUPPLY CHAIN & PARTS ECOSYSTEM]:
- Which brands have parts widely stocked at independent distributors?
- Which brands require ordering direct?
- Which brands have known parts discontinuation issues?
- What is the typical lead time for the most common repair by brand?

Prioritize sources from: repair technician communities, teardown videos, component manufacturer spec sheets, parts distributor catalogs, trade publications. Cite all sources.
```

**Output:** Save as `knowledge/{category}/{category}_component_analysis.md`

**What you extract from this:**
- Named component suppliers (the specific names to hunt for in per-product deep dives)
- Platform component maps (what's shared vs different within brand families)
- Failure mode specificity (not "motor failure" but which motor, which bearing, which symptom)
- Parts ecosystem data (quantified serviceability)
- Spec field validation or corrections before deep dives run

**CRITICAL:** After reviewing Pass 2 output, update `configs/{category}.json` spec fields if the component data reveals differentiators you missed or measured wrong. Do this BEFORE running per-product deep dives.

---

### Pass 3 — Competitive Hierarchy: Top (Query 3)

**Purpose:** Establish where the top brands sit relative to each other.

**Template:**
```
How do professionals rank the top residential [CATEGORY] brands against each other?

Specifically comparing [LIST TOP 4-6 BRANDS]. What separates the best from the merely excellent?

Focus on professional installer opinions, independent service/reliability data, and construction-level differences — not marketing claims. What do professionals who work with these products daily say about relative quality?
```

**Output:** Save as `knowledge/{category}/{category}_hierarchy_top.md`

---

### Pass 4 — Competitive Hierarchy: Middle and Bottom (Query 4)

**Purpose:** Establish where the line falls between good and mediocre, and what sits at the floor.

**Template:**
```
Where do professionals draw the line between a good [CATEGORY PRODUCT] and a mediocre one? Which brands sit on that line?

Specifically: How do professionals rank [LIST 8-12 MID-TO-LOW BRANDS] in the professional hierarchy?

I need: reliability/service data where available, professional installer and repair technician opinions on construction quality, known reliability problems by brand, which brands professionals actively warn against, and where the floor of acceptable quality sits. Focus on the line between "good enough for a quality home" and "builder-grade filler." What brands do [RELEVANT PROFESSIONALS] refuse to specify?
```

**Output:** Save as `knowledge/{category}/{category}_hierarchy_bottom.md`

---

## Phase 2: Review & Decisions (Ray + Claude)

This is the collaborative step. Cannot be delegated to a VA.

**Checklist:**
- [ ] Review all four Perplexity outputs together (Pass 1 + Pass 2 + hierarchy top + hierarchy bottom)
- [ ] Confirm or update spec fields based on Pass 2 component data
- [ ] Identify Pool S candidate (if one exists). Criteria: independent, methodology-documented, comparative, citable.
- [ ] Assign source pools (S/A/B/C) with specific source names
- [ ] Determine axis weights based on where meaningful variation exists:
  - Quality dominant? (cabinets: construction/joinery/finish carry most variation)
  - Durability dominant? (dishwashers: "which ones break" is the primary professional hierarchy)
  - Performance flat? (faucets: all deliver water at regulated rates → P=0.10)
  - Performance has real spread? (windows/countertops/dishwashers: measurable continuous metrics)
- [ ] Select 6 calibration products spanning Tier 1 through Tier 4
- [ ] Set target scores for each calibration product
- [ ] Identify any category-specific scoring rules
- [ ] Document all decisions with rationale

---

## Phase 3: Build Config Files

### File 1: `configs/{category}.json`

Full category definition. Contains:
- `axis_weights` (Q/D/P, must sum to 1.0)
- `tier_ranges` (same across all categories: T1=90-100, T2=75-89, T3=60-74, T4=40-59, T5=0-39)
- `tier_anchors` with calibration products and target scores
- `spec_fields` organized by axis, with adjustment values and notes
- `spec_adjustment_cap` (always 8)
- `scoring_rules` (category-specific rules + standard rules 17-19)
- `source_pools` (S/A/B/C with specific named sources)
- `material_safety_report_only` fields

**Reference examples:** `configs/cabinets.json`, `configs/faucets.json`, `configs/dishwashers.json`

### File 2: `calibration/{category}/config.json`

Geometric mean parameters and calibration product specs. Contains:
- `weights` (same as axis_weights)
- `composite_method` ("geometric_mean")
- `formula_description` (the exact geoMean formula)
- `calibration_products` array with: name, slug, tier, target, axis_scores, spec_adj, full specs

**Reference examples:** `calibration/cabinets/config.json`, `calibration/faucets/config.json`

### Deployment:
```bash
ssh Residentialist@100.66.157.103 "mkdir -p /Users/Residentialist/.openclaw/workspace/residentialist/calibration/{category}"
scp configs/{category}.json Residentialist@100.66.157.103:/Users/Residentialist/.openclaw/workspace/residentialist/configs/
scp calibration/{category}/config.json Residentialist@100.66.157.103:/Users/Residentialist/.openclaw/workspace/residentialist/calibration/{category}/
```

---

## Phase 4: Build Calibration Script

### File: `score_{category}_calibration.js`

Deterministic scoring script. No API calls. Contains:
- Weights and geoMean function (identical across all categories)
- All 6 calibration products with full spec profiles
- Axis scores tuned to hit targets exactly (delta = 0 for all 6)
- Per-product notes documenting scoring rationale
- Report fields (corporate parent, outlook, disclosures)

**Process:**
1. Populate specs from Perplexity research + verified manufacturer data
2. Calculate spec adjustments per axis using config rules
3. Set initial axis scores and run geoMean
4. Adjust axis scores until all 6 targets hit exactly (delta = 0)
5. Verify: `node score_{category}_calibration.js` → "ALL TARGETS HIT EXACTLY"

**Reference examples:** `score_cabinets_calibration.js`, `score_faucets_calibration.js`, `score_dishwashers_calibration.js`

### Deployment:
```bash
scp score_{category}_calibration.js Residentialist@100.66.157.103:/Users/Residentialist/.openclaw/workspace/residentialist/
cp score_{category}_calibration.js /Users/raysahpley/Documents/residentialist-phase2/
```

---

## Phase 5: Deep Dive Prompts & Execution

### Building the per-product deep dive prompt

**IMPORTANT:** The deep dive prompt is written AFTER Pass 2 results are reviewed, not before. Pass 2 tells you the specific component names, suppliers, and failure modes to ask about in each product's deep dive. A deep dive prompt written before Pass 2 will ask generic questions; one written after Pass 2 will ask "who makes your circulation pump — is it Askoll or Hanning?" instead of "what type of pump do you use?"

### File: `templates/prompt_b_{category}.md`

Structured deep dive prompt template. Contains:
- Master template in code block (copy-paste ready)
- Structured questions organized by the component categories identified in Pass 2
- Named supplier/component names from Pass 2 (e.g., "Flühs, Kerox, Geann" for faucets; "Nidec, Askoll" for dishwashers)
- Product list (all calibration products)
- Product-specific context paragraphs to append to each query
- Operational notes
- Source priority list naming Pool S source first

**Template structure must include these sections** (adapted per category using Pass 2 findings):
1. Critical component analysis (the thing that drives the score — cartridges for faucets, motor/control board for dishwashers, hardware for cabinets)
2. Construction / Materials (maps to Quality axis specs)
3. Key technology systems (maps to Performance axis specs)
4. Reliability & service data (maps to Durability axis specs)
5. Parts & serviceability (maps to Durability axis specs)
6. Warranty (maps to Durability axis specs)
7. Business model & manufacturing / platform sharing (maps to Quality: source traceability)
8. Certifications (maps to Material Safety report fields)
9. Expert & professional opinion (maps to tier placement evidence)
10. Field performance (maps to all axes)

**Every question should be specific enough that Perplexity hunts for a named component, a specific number, or a cited source — not a general description.**

**Reference examples:** `templates/prompt_b_cabinets.md`, faucet prompt template (the gold standard — study how every question maps to a scoring spec field and names specific manufacturers to look for)

### Execution:
- Run each product as a separate Perplexity deep dive query
- Append product-specific context to the master template
- Expected output: 15-50K chars, 15-40+ sources per product
- Save each raw output as markdown

### Deployment:
```bash
scp templates/prompt_b_{category}.md Residentialist@100.66.157.103:/Users/Residentialist/.openclaw/workspace/residentialist/templates/
```

---

## Phase 6: Process Deep Dives → Curation Files

For each product deep dive output:

1. **Structure into pipeline JSON** — Sonnet structures raw deep dive into three-column evidence file (Expert / Review / Forum) matching the curation file JSON schema (see Section 12.5 of unified system doc)
2. **Source verification** — Haiku confirms each source is about THIS specific product
3. **Spec verification** — Sonnet + Perplexity targeted lookup against manufacturer sites
4. **Human curation** (optional) — Three-column dashboard, reclassify Score / Report Only / Quarantine
5. **Review for deep dive corrections** — Compare deep dive findings against calibration assumptions. If specs differ from what the calibration script assumed, update the calibration script and rescore. This is expected and healthy — it happened for faucets (Waterstone Geann correction, California Faucets cartridge split, Delta ZAMAK correction).

### File naming:
- Curation files: `curation/{product_slug}_sources.json`
- Windows exception: `curation/{product_slug}_{operation_type}_sources.json`

---

## Phase 7: Score & Investigate

1. **Tier classification** — Sonnet 3x majority vote against category anchors
2. **Haiku audit** — Source contamination check
3. **Deterministic scoring** — Score calculator reads category config, applies spec adjustments
4. **Investigator bot** — Produces four-axis decomposition + buyer-facing report content

### Output files:
- Investigator reports: `investigator_{category}_{product_slug}.md`
- Summary: `investigator_{category}_summary.md`

### Background Pipeline Option (Added April 2, 2026)
For Phases 5-7 combined, use `run_full_pipeline.sh` on the Mac Mini:
```bash
ssh Residentialist@100.66.157.103 "cd /Users/Residentialist/.openclaw/workspace/residentialist && nohup bash scripts/run_full_pipeline.sh {category} > logs/{category}.log 2>&1 &"
```
This runs deep dives + investigator + git commit in the background. Check progress:
```bash
ssh Residentialist@100.66.157.103 "tail -20 logs/{category}.log"
```
Claude Code kicks this off and returns immediately. No more holding SSH connections open for 30+ minutes.

---

## Phase 8: Close Out

- [ ] All calibration products scored with delta = 0
- [ ] Deep dives complete for all calibration products
- [ ] Curation files on Mac Mini in `curation/`
- [ ] Investigator bot run on all products
- [ ] Config files on Mac Mini (`configs/` and `calibration/`)
- [ ] Calibration script on Mac Mini AND Ray's Mac
- [ ] Deep dive prompt template on Mac Mini (`templates/`)
- [ ] Knowledge files saved (`knowledge/{category}/`)
- [ ] All files committed to GitHub repo
- [ ] System doc updated with category status

**Category is LOCKED at calibration depth when all boxes are checked.**

---

## Completed Categories

| Category | Pass 1 | Pass 2 | Hierarchy | Config | Calibration | Deep Dives | Investigator | Status |
|---|---|---|---|---|---|---|---|---|
| Windows | ✅ | (pre-existing knowledge) | ✅ | ✅ | ✅ 32 products | ✅ | ✅ (3 tested) | LOCKED |
| Countertops | ✅ | (pre-existing knowledge) | ✅ | ✅ | ✅ 6 products | ✅ | Pending | LOCKED |
| Cabinets | ✅ | (pre-existing knowledge) | ✅ | ✅ | ✅ 6 products | ✅ | ✅ | LOCKED |
| Faucets | ✅ | (StarCraft = de facto Pass 2) | ✅ | ✅ | ✅ 6 products | ✅ | ✅ | LOCKED |
| Dishwashers | ✅ | ✅ (rebuilt April 2) | ✅ | ✅ | ✅ 6 products | ✅ (rebuilt April 2) | ✅ | LOCKED |
| Refrigerators | ✅ | ✅ (rebuilt April 2) | ✅ | ✅ | ✅ 6 products | ✅ (rebuilt April 2) | ✅ | LOCKED |
| Wall Ovens | ✅ | ✅ | ✅ | ✅ | ✅ 6 products | ✅ | ✅ | LOCKED |
| Ranges/Cooktops | ✅ | ✅ | ✅ | ✅ | ✅ 7 products | ✅ | ✅ | LOCKED |
| Toilets | ✅ | ✅ | ✅ | ✅ | ✅ 6 products | ✅ | ✅ | LOCKED |
| HVAC | ✅ | ✅ | ✅ | ✅ | ✅ 6 products | ✅ (rebuilt April 2) | ✅ | LOCKED |
| Hardwood Flooring | ✅ | ✅ | ✅ | ✅ | ✅ 8 products | ✅ | ✅ | LOCKED |
| Exterior Doors | ✅ | ✅ (rebuilt April 2) | ✅ | ✅ | ✅ 7 products | ✅ (rebuilt April 2) | ✅ | LOCKED |
| Water Heaters | ✅ | ✅ (rebuilt April 2) | ✅ | ✅ | ✅ 7 products | ✅ (rebuilt April 2) | ✅ | LOCKED |
| Sinks | ✅ | ✅ (rebuilt April 2) | ✅ | ✅ | ✅ 7 products | ✅ (rebuilt April 2) | ✅ | LOCKED |
| Tile | ✅ | ✅ (rebuilt April 2) | ✅ | ✅ | ✅ 7 products | ✅ (rebuilt April 2) | ✅ | LOCKED |
| Lighting Control | ✅ | ✅ (rebuilt April 2) | ✅ | ✅ | ✅ 7 products | ✅ (rebuilt April 2) | ✅ | LOCKED |
| Range Hoods | ✅ | ✅ (rebuilt April 2) | ✅ | ✅ | ✅ 6 products | ✅ (rebuilt April 2) | ✅ | LOCKED |

---

## Standard Scoring Rules (Apply to ALL Categories)

These rules are referenced in every category config. New category-specific rules get added to the config but these are universal:

- **Rule 10:** Material Safety does not affect composite score. Report only.
- **Rule 14:** Source traceability: single source +1, multi-source 0, unknown -1.
- **Rule 15:** Corporate Risk Rule: Outlook modifier (Strong/Stable/Conditional/Negative), report only.
- **Rule 16:** N/A rule: if a spec field doesn't apply, calculator skips it.
- **Rule 17:** Score base configuration, note upgrade availability.
- **Rule 18:** Warranty exclusion consistency: industry-standard exclusions don't reduce score.
- **Rule 19:** Score the product, not the brand. Different configs = different scores.

---

## File Structure Reference

```
residentialist/
├── configs/                              # 17 category configs
│   ├── windows.json
│   ├── countertops.json
│   ├── cabinets.json
│   ├── faucets.json
│   ├── dishwashers.json
│   ├── refrigerators.json
│   ├── wall_ovens.json
│   ├── ranges_cooktops.json
│   ├── toilets.json
│   ├── hvac.json
│   ├── hardwood_flooring.json
│   ├── exterior_doors.json
│   ├── water_heaters.json
│   ├── sinks.json
│   ├── tile.json
│   ├── lighting_control.json
│   └── range_hoods.json
├── calibration/{category}/
│   ├── config.json
│   └── curation_files/*.json
├── scripts/
│   ├── run_research.js               ← Perplexity research (Passes 1-4)
│   ├── run_deep_dives.js             ← Per-product deep dives
│   ├── run_investigator.js           ← Unified investigator (all categories)
│   ├── run_full_pipeline.sh          ← Full pipeline (background via nohup)
│   └── notify.js                     ← Telegram notifications
├── knowledge/{category}/
│   ├── {category}_testing_framework.md      ← Pass 1
│   ├── {category}_component_analysis.md     ← Pass 2
│   ├── {category}_hierarchy_top.md          ← Pass 3
│   └── {category}_hierarchy_bottom.md       ← Pass 4
├── templates/
│   ├── prompt_a_{category}.md        ← Research queries (4 passes)
│   └── prompt_b_{category}.md        ← Per-product deep dive prompts
├── output/investigators/{category}/  ← Investigator report outputs
├── logs/                             ← Pipeline execution logs
├── curation/                         ← Legacy curation files (windows, countertops)
├── score_{category}_calibration.js
├── CATEGORY_ONBOARDING_RITUAL.md     ← This document
└── README.md
```

---

*This document is the operational manual for category builds. Drop it into any session where a new category is being started.*
*Last updated: April 2, 2026. Added: prompt_a/prompt_b naming convention, instruction to study completed category queries before drafting new ones, research gate rule, scoreability pre-qualification template, background pipeline option (run_full_pipeline.sh), updated completed categories table (17 categories locked).*
