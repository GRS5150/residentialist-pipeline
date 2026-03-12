# THE RESIDENTIALIST — Methodology & Scoring Rules
**Owner:** Ray Shapley | **Last updated:** March 12, 2026
**Purpose:** Complete scoring methodology, calibration data, bot prompts, and category knowledge files.

**File structure:**
- This file: Scoring rules, calibration data, bot prompts, category knowledge, principles
- `config.json`: Infrastructure settings, model assignments, file paths, pending decisions
- `.env`: Credentials (API keys, tokens) — never committed to git
- `.js files`: All pipeline code — tracked in git

---

## TABLE OF CONTENTS

1. What The Residentialist Is
2. The Category Build Methodology (How New Categories Are Created)
3. Bot Architecture (The Evaluation Pipeline) — includes Adversarial Verification Bot (Bot 4, future build) and Evaluation Pass Independence Rule
4. Scoring Framework
5. Letter Grade System and Outlook Modifiers
6. Value Context and Asset Class Framework — Value Indicator, Geographic Cost Normalization, NAHB bootstrap → proprietary replacement, Production Report anchoring, Builder Database
7. Knowledge Files
8. Calibration Rules and Watch Items
9. Certification Gate Checks
10. Findings System (Red/Yellow)
11. Business Model Taxonomy
12. Source Hierarchy by Category
13. Two-Layer Report Structure (Front-End / Back-End)
14. Category Expansion Plan
15. Technical Infrastructure
16. Calibration Data (Completed Products)
17. AI Transfer Test Results
18. Known Gaps and Pending Improvements
19. Key Principles and Philosophy

---

## 1. WHAT THE RESIDENTIALIST IS

The Residentialist is a searchable product intelligence database for residential construction products. It serves homebuyers — particularly those building custom homes ($1M+) or undertaking major remodels ($100K+) — as well as buyers of production homes who want to understand exactly what's in their spec sheet.

The database evaluates products across three independent axes:

- **Reliability** — Does this product work without breaking during its expected lifespan?
- **Durability** — How long will it last, and can it be maintained and repaired?
- **Material Safety** — What is this product made of, and what does that mean for the people living with it?

Each product receives letter grades on all three axes, an overall score, and an outlook modifier (Strong / Stable / Conditional). Products are evaluated at the specific LINE and CONFIGURATION level — not the brand level. KraftMaid base particleboard ≠ KraftMaid Vantage plywood. This specificity is a core differentiator.

The target at launch is approximately 500-600 products across all categories.

### Business Model

- Reports are sold to homebuyers (pricing under revision from $597 base, two tiers planned)
- Two report types: Production Reports (for spec home buyers) and Custom Reports (for custom build selections)
- Revenue also comes from a credit-based access system for the searchable database
- YouTube channel component provides content marketing and education

### Target Customer

The primary lens for every evaluation is: **"I'm buying this for my home. What should I expect from this product over the next 5, 10, 15, 20 years?"**

---

## 2. THE CATEGORY BUILD METHODOLOGY

This is the process for launching a new product category in the database. It was developed through experience building faucets and cabinets, and formalized as a repeatable workflow.

### Step 1: Source Gathering (AI-led, Ray-reviewed)
The AI assistant identifies the best independent sources for the category:
- Independent professional reviewers (the "StarCraft equivalent" for each category)
- Professional installer/technician forums
- Trade publications
- Regulatory databases (NFRC, CARB, FDA, EPA, CPSC)
- Manufacturer spec sheets (for verification only, never trusted at face value)

Consumer review sites (Amazon reviews, Google reviews, Yelp) are **excluded entirely** from the evaluation pipeline.

**Source landscape by category (known):**

| Category | Primary Independent Source | Data Quality |
|---|---|---|
| Faucets | StarCraft Independent Reviews | Exceptional — straw-buyer testing, teardowns, 15+ years |
| Cabinets | Main Line Kitchen Design / Paul McAlary | Strong — detailed quality ratings, configuration-specific |
| Appliances | Yale Appliance | Strong — publishes real service/failure rate data by brand |
| HVAC | BuildingScience.com, HVAC-Talk forums | Moderate — field data from technicians |
| Windows | Jay Johnson / WindowPurchase.com, NFRC, AAMA/FGIA | Good — component taxonomy from Jay Johnson (47/232 transcripts processed), dual certification ecosystem. Gap: no teardown authority. 185 transcripts pending for v2 update. 7 products calibrated, v1.1 rubrics. |
| Flooring | NWFA standards, forum data | Fragmented — no single authority |
| Countertops | Awaiting Ray's source list | Fragmented — no single authority identified yet |
| Roofing | Forum data, manufacturer data | Fragmented |

### Step 2: NotebookLM Education (Ray-led)
Before building the evaluation framework, Ray uses Google NotebookLM to absorb the source material:

1. **General category NotebookLM** — Loaded with the broadest, best sources for the category. Ray listens to the generated audio overview to become fluent in vocabulary, brand landscape, construction basics, quality hierarchies, and common failure modes. This is PREP, not content.

2. **Specific topic NotebookLMs** — For each planned video or deep-dive area within the category, a dedicated NotebookLM is loaded with narrow, deep source material. These make Ray an authority on specific stories.

**Why this matters:** Listening reveals nuances that reading misses. The labor warranty gap in faucets was caught during NotebookLM audio listening, not during the initial framework build from reading. This step produces a better-educated calibration partner, which produces a more accurate evaluation system.

### Step 3: Knowledge File Construction (AI + Ray collaborative)
The AI builds category-specific knowledge files containing:
- Hardware/component hierarchies (e.g., Blum → Grass → Hettich → DTC → unbranded for cabinets)
- Material quality tiers
- Business model taxonomy for that category's manufacturers
- Known failure patterns from professional sources
- Warranty structure analysis
- Certification requirements
- Calibration benchmarks from independent sources

Ray reviews and pushes back based on his construction experience and NotebookLM education.

### Step 4: Bot Prompt Adaptation (AI-led)
The universal bot prompts (Consensus, Evaluator, Material Safety) are adapted for the new category. The core architecture and rules don't change — only category-specific details (what components matter, what the hierarchies are, what "premium" means in this category).

### Step 5: Calibration (AI + Ray collaborative)
Run 4-6 products through the full pipeline spanning the quality spectrum — from builder-grade through premium:
- Check scores against independent professional benchmarks
- Catch scoring drift, double-counting, and anchoring errors
- Ray pushes back on anything that doesn't feel right based on domain experience
- Prompts and knowledge files are adjusted until scores align with professional consensus

**Critical rule:** A category does NOT launch until the scores feel honest. The first few reports in a new category will be less precise than mature categories, and that's acceptable — but they must still be more rigorous than anything else available to the consumer.

### Step 6: Volume Production
Once calibrated, products flow through the pipeline. The VA runs the bots, Ray reviews outputs (shifting from operator to editor). Each product scored creates a benchmark for the next one — the database compounds.

---

## 3. BOT ARCHITECTURE (THE EVALUATION PIPELINE)

Each product is evaluated by three (eventually four) separate AI instances. **Independence is critical** — the bots do not see each other's output during evaluation. This prevents anchoring and creates built-in error-checking when scores are compared.

### Bot 1: Consensus Bot (Research Layer)

**Role:** Research what the trade actually thinks about a specific product at a specific configuration level.

**Key characteristics:**
- Searches professional sources following the source hierarchy
- Does NOT score — research only
- Has NO category-specific knowledge file (runs lean, does its own research)
- Always researches the specific LINE and CONFIGURATION, not just the brand
- Consumer review sites excluded entirely
- Outputs confidence level (High / Moderate / Low) based on data availability

**Output format (structured report):**
- Business Model Type classification
- Professional Consensus summary
- Key Components (identified with manufacturer where possible)
- Common Failure Modes (product-specific vs. category-generic)
- Parts & Serviceability assessment
- Warranty Structure (consolidated — one section, all warranty info)
- Red Findings and Yellow Findings
- Sources Consulted (with methodology notes)
- Confidence Level
- Notes

**Warranty Structure section format (required):**
```
WARRANTY STRUCTURE:
- Body/Structure: [duration]
- Cartridge/Primary Wear Component: [duration] (vs industry standard)
- Finish: [duration] (vs industry standard)
- Other components: [duration]
- Labor coverage: [Parts only / Parts + labor]
- Transferable: [Yes/No]
- Parts availability guarantee: [duration or backward compatibility record]
- Industry standard comparison: [summary]
- Buyer impact: [one sentence]
```

### Bot 2: Evaluator Bot (Construction Quality Scoring)

**Role:** Read the Consensus Bot output and score against a calibrated framework.

**Key characteristics:**
- Scores on two independent axes: Reliability and Durability
- Uses a category-specific knowledge file
- Is SCORING, not researching — uses evidence provided by the Consensus Bot
- Outputs letter grades (client-facing) backed by decimal scores (internal calibration)
- Includes an Outlook modifier (Strong / Stable / Conditional)
- Expected Lifespan estimate when evidence supports it

**Scoring framework detailed in Section 4 below.**

### Bot 3: Material Safety Bot v2 (Health/Safety Flag Search)

**Role:** Answer the buyer's question: **"Has anyone credible identified a health or safety concern with this product that I should know about?"**

**Key characteristics:**
- Operates as an INDEPENDENT axis — separate from reliability and durability
- Uses category-specific knowledge file for calibrated rules on known material class concerns
- Searches for FLAGS from credible sources, NOT GAPS in theoretical chemical perfection
- Three possible outputs: Rated (score 1-10), Not Rated with Manufacturer Confidence Profile, Not Rated with Insufficient Information
- Does NOT evaluate: occupational health, environmental impact, sustainability, aesthetics, supply chain ethics
- Tone: Straightforward safety advisor. If nobody credible has raised a concern, say so clearly. If someone has, state specifically what it is and what the buyer can do.

**The Core Question:** "Has anyone credible said there's something I should worry about?" That's it. The bot searches for flags. It reports what it finds — or reports that nobody's raised concerns. It does not invent concerns that no credible source has identified.

**Critical rules:**
- **Manufacturing vs Consumer Hazard Rule (unchanged):** Score ONLY risks to the occupant living with the installed product. Manufacturing hazards (silicosis, factory dust, fabrication exposure) are excluded.
- **Flag-hunting, not gap-hunting:** If no credible source has raised a concern, that IS the finding. Don't invent concerns by probing theoretical gaps in certification testing scope.
- **Proprietary formulation + independent certification = no penalty.** Trade secrets with validated test results are NOT safety evasion. (Certification Sufficiency Rule)
- **Class-universal characteristics are NOT product findings.** Heat in quartz, sealing in granite — these belong in Material Class Profile, not individual findings. (Class-Universal Issue Rule)
- **"No news" ≠ "good news."** Products without any evaluation get Not Rated, not a high score. Not Rated products receive a Manufacturer Confidence Profile (narrative context about company history, regulatory environment, track record) so the buyer can assess their own comfort level. Manufacturer profile is NARRATIVE, not a backdoor scoring system — country of origin does not become a number.

**Scoring scale (Rated products only):**
- **9-10:** No credible concerns identified. Certifications present. No Healthy Homes Radar flags on the installed product.
- **7-8:** Concern identified but manageable. Credible source flagged something specific with a clear path to managing it (e.g., specify PFAS-free sealer).
- **5-6:** Concern identified, not clearly managed. Certifications absent when material class has known active concerns. No evidence this product manages known risks.
- **3-4:** Significant concerns. Multiple credible flags. Key certifications missing.
- **1-2:** Known hazard. Confirmed unsafe. Recalled. Contamination documented.

**What counts as a flag:** A Healthy Homes Radar organization identified a specific exposure pathway. An independent tester documented a measurable concern. A certification body declined or revoked certification. Multiple building science professionals raised the same concern.

**What does NOT count as a flag:** Theoretical gaps in certification testing scope (e.g., "Greenguard doesn't test semi-VOCs"). Proprietary formulation when testing validates the output. Manufacturing/occupational hazards. Consumer complaints without professional substantiation. Prop 65 warnings on compliant products.

**Material Safety Investigation Sequence:**

The Material Safety Bot is a researcher and synthesizer of expert assessments. It is NOT an independent health evaluator. It does not model chemical transmission through materials, calculate exposure rates, or evaluate competing scientific claims. It finds what qualified experts and testing bodies have already determined, and applies those findings to the score.

**Critical: Search by product name first, not by material decomposition.** The bot's first action is always to search for the specific product (e.g., "IKEA SEKTION cabinets") in the healthy homes ecosystem — Declare database, C2C registry, Greenguard product search, BBI discussions, Pharos. If someone has already evaluated this product, the bot uses their finding. The bot does NOT decompose a product into raw materials and then try to assess whether formaldehyde would pass through a melamine laminate or whether styrene off-gasses from a resin binder. That is a job for a toxicologist with testing equipment, not an AI with search results.

**Step 1 — Search for product-level evidence.** Has this specific product been evaluated by an independent body? Sources at this tier, in order of weight:
- **Emission test certifications:** Greenguard/Greenguard Gold, CARB Phase 2 compliance, UL emission testing. These are chamber-measured data — someone put this product in a room and measured what came off it. Strongest evidence available.
- **Material health certifications:** Cradle to Cradle Material Health Certificate (Bronze/Silver/Gold/Platinum), ILFI Declare label (Red List Free / LBC Compliant / Declared). These are third-party-verified ingredient disclosures assessed against health criteria.
- **Published evaluations by the healthy homes community:** Building Biology Institute consultants, Habitable (formerly Healthy Building Network) / Pharos database, Harvard Healthy Buildings Program published research.

If product-level evidence exists, it anchors the score. The bot synthesizes the findings and assigns a score with high confidence.

**Step 2 — Search for brand/line-level or material-class evidence.** Maybe nobody evaluated the exact SKU, but the healthy homes community or testing bodies have evaluated the brand's product line, or calibrated scoring rules exist for this material class in the category knowledge file. Examples: IKEA's cabinet material practices have been discussed broadly by building biology sources. Particleboard with melamine containment has calibrated scoring rules in the cabinets knowledge file. The bot applies these with a note about the evidence level.

**Step 3 — No expert evaluation exists. Flag for human review.** The bot does NOT assign a Material Safety score. It documents what it found:
- What raw materials are present (substrate, binder, finish, sealant)
- Which substances appear on the ILFI Red List, Priority List, or Watch List
- What emission certifications exist or are absent (CARB, Greenguard)
- The absence of independent health evaluation for this product

The bot outputs: **"Material Safety — Unreviewed. Recommend human review before scoring."** The back-end report includes the bot's research notes so the human reviewer has a head start.

**Human review feedback loop:** Every human review of a flagged product generates scoring guidance that enters the category knowledge file. After Ray reviews 5-10 particleboard products with melamine containment, a rule emerges and gets codified. The bot now has calibrated guidance for the next one and doesn't need to flag it. Flag volume is highest at category launch and shrinks as the knowledge file matures.

**Healthy Homes Radar — Reference Organizations:**

The Material Safety Bot uses these organizations as its scope-setting filter for what health concerns are worth investigating. If a substance or material is on their radar, the bot investigates. If it's not on anyone's radar, the bot notes the absence. These are the leading-edge voices in residential health science:

- **International Living Future Institute (ILFI):** Maintains the Red List (worst-in-class substances, 12,500+ entries), Priority List (6,600+ entries, likely future Red List), and Watch List (210+ entries, under research). Updated annually with the Living Building Challenge standard. The three-tier list structure (Watch → Priority → Red) provides a built-in confidence gradient.
- **Habitable (formerly Healthy Building Network):** Operates the Pharos database — the research engine behind the ILFI Red List. Scientists and researchers identifying problematic chemicals and collaborating on safer alternatives.
- **Building Biology Institute (BBI):** Certified Building Biology Environmental Consultants focused specifically on human health in the built environment. German origin (Baubiologie). Tends toward caution — if they're raising a concern, it's worth investigating.
- **Harvard Healthy Buildings Program:** Dr. Joseph Allen's research group at Harvard T.H. Chan School of Public Health. Academic rigor, published peer-reviewed research, not industry-funded.
- **Cradle to Cradle Products Innovation Institute:** Material Health Certificate program evaluates products through independent toxicologists against 24 human and environmental health metrics.
- **Greenguard / UL Environment:** Emission certification based on chamber testing. Greenguard Gold thresholds are stricter than standard (≤220 μg/m³ total VOCs, formaldehyde ≤7.3 ppb). Testing-based, not opinion-based. Pass/fail system — does NOT disclose exact emission levels (known limitation). Does NOT test for semi-VOCs (phthalates, biocides, flame retardants) or heavy metals. Annual retesting required.
- **My Chemical-Free House (Corinne Segura):** Certified Building Biologist (BBI). Independent practitioner who does hands-on product testing — sealer PFAS testing, countertop health evaluations, VOC measurement, green certification analysis. Not an organization — an individual BBI-certified practitioner with the most comprehensive independent health evaluation of residential surfaces available. Category-specific Material Safety authority for countertops and sealers. Her work identified PFAS in mainstream stone sealers and tested PFAS-free alternatives.
- **StarCraft Independent Faucet Reviews:** Category-specific Material Safety authority for faucets. Not a health testing organization — a teardown-based material verification authority. StarCraft physically disassembles faucets purchased anonymously through retail channels, identifies every component's material composition, traces manufacturing origin through customs records, and documents marketing claims that contradict physical findings. When StarCraft identifies ZAMAK in a pressurized water path or confirms "not every component is brass," that is physical evidence equivalent to a BBI practitioner identifying a substance in a building product. StarCraft's material verification role is unique — no other independent source provides this level of component-by-component material identification for faucets. Also serves as the primary quality/reliability authority for faucets (see Source Hierarchy, Section 12).
- **Jay Johnson / WindowPurchase.com:** Category-specific EVALUATION authority for windows (component taxonomy, not material safety). Independent window consultant since 2001. 232 educational videos, 3 published books, 10,000+ consulting clients, Chicago Tribune consultant. Has visited manufacturing facilities in US, Germany, and Canada. Provides component-level evaluation framework: casement hardware mounting, pivot bar quality, weather stripping type/quantity/attachment, glazing bead construction, lift rail durability, sash depth, locking systems, spacer systems, and IGU quality indicators. Does NOT do anonymous straw-buyer teardowns like StarCraft — works from factory visits, industry knowledge, and 25+ years of consulting experience. Endorses Gilkey Windows (Cincinnati/Chicago/Louisville). Brand-agnostic in educational content. His "650 manufacturers dumbing down to wholesale to dealers" insight parallels StarCraft's Marketeer classification for faucets.
- **Green Science Policy Institute:** Independent research organization focused on identifying harmful chemicals in consumer products and building materials. Confirmed PFAS presence in specific product categories. Research-driven, not industry-funded.

**Recognized European Certifications:**

European certifications carry equivalent weight to US certifications in the Material Safety assessment. Several are stricter than US equivalents:

- **EU REACH Compliance:** The EU's chemical regulation framework, generally stricter than US EPA. Any product sold in the EU market operates under REACH. A product with EU market presence has passed a more rigorous chemical regulatory environment than US-only products.
- **German Blue Angel (Blauer Engel):** One of the oldest and most respected ecolabels globally (est. 1978). Covers emissions, hazardous substances, and environmental impact. Rigorous criteria, independently verified. Carries equivalent weight to Greenguard Gold.
- **French A+ Emissions Rating:** France's mandatory VOC emissions labeling system for building products. A+ is the highest rating. Similar to Greenguard Gold but it is a REGULATORY REQUIREMENT, not voluntary. Products sold in France must carry this label.
- **Nordic Swan Ecolabel:** Scandinavian lifecycle certification including chemical safety. Strict criteria, well-respected.
- **CE Marking:** Baseline European market access. Confirms regulatory compliance but is NOT a quality differentiator by itself. Presence = legal to sell in EU. Absence = not in EU market.

**Radar interpretation rules:**
- **On the ILFI Red List:** Confirmed concern. Bot must evaluate exposure pathway for this product. Score impact depends on whether the substance reaches the occupant in the installed state (see IKEA Paradox and containment rules).
- **On the ILFI Priority or Watch List, or actively discussed by BBI / Harvard / Habitable:** Active concern. Bot scores conservatively and the report is transparent about the state of the evidence. Report cites the source: "This substance is on the ILFI Priority List" or "Building Biology Institute identifies this as a concern."
- **Investigated — not currently on radar:** Multiple independent bodies studied this concern and found negligible consumer risk, and the healthy homes community (BBI, Passive House practitioners, ILFI ecosystem) is not actively discussing it. Example: granite countertop radiation/radon — EPA, Health Canada, AARST, Health Physics Society all studied it with large sample sizes (including a million-sample Monte Carlo simulation) and found no meaningful contribution to indoor radon levels. The healthy homes community has moved on. Not a finding. Not a score impact. The bot notes the concern exists in public discourse and states why it does not affect the score. **This status is not permanent.** If the radar organizations reopen the discussion based on new evidence, the concern moves back to "active" and gets scored accordingly. The nature of science is that the question always remains open — "not currently on radar" means the best available evidence and the most health-conscious voices in the industry have examined this and found no cause for concern at this time.
- **Not yet studied (novel material):** A relatively new substance or material with no expert evaluation in a residential context. This is different from "investigated — not currently on radar." Unknown is not safe — it's unknown. Bot flags for human review.
- **Not yet studied (established material):** A material with decades of widespread residential use and no concerns from anyone in the healthy homes community. Example: fired porcelain, solid hardwood, natural quartzite. The absence of concern after long use history is itself a data point. Treat as low-concern, score normally. If a concern later emerges from the radar organizations, it moves to "active concern."

**Important: The radar organizations set investigation scope. They do not set scores.** BBI flagging a concern means "investigate this for this product." It does not mean "penalize this product." The score reflects the actual exposure pathway for the occupant after investigation, not the volume of concern in the community. The radar tells the bot what to look at. Containment, certifications, and exposure pathways determine the number.

### Bot 4: Adversarial Verification Bot (FUTURE BUILD)

**Role:** Quality control layer that sits between the three evaluation bots and the final report. Acts as a skeptic that checks the work.

**Status:** Spec'd out by Ray, timing deferred to post-launch. Currently Ray/VA serve as the manual verification layer.

**Five checks (from Ray's spec):**
1. Is the failure mode real?
2. Is the alternative comparable?
3. Are scores internally consistent?
4. Is confidence honest?
5. Did we miss anything?

**Why it's deferred:**
- Needs 30-50 real evaluations to calibrate flag rate (target: 10-25%) and reject rate (target: below 5%)
- Needs real-time web search to independently verify claims — can't be a simple Claude Project
- Needs to be an agent with tools — this is a Henry-on-Mac-Mini job
- Currently only ~10 products have been fully evaluated

**Build sequence:**
1. ~~Airtable~~ — done
2. ~~Three Claude Project bots~~ — done
3. Run products through pipeline manually — current phase
4. Launch with Ray/VA as verification layer
5. Stand up Henry on Mac Mini
6. Build adversarial verifier as Henry's first real job — using the spec plus calibration data from manual QC catches

**Why it matters long-term:** The adversarial bot becomes even MORE critical for categories with weak independent data sources. In categories where there's no StarCraft equivalent, the verification bot is the last check against scoring drift and undetected errors.

### Evaluation Pass Independence — Subagent Architecture

The three-bot independence principle is structural, not aspirational. In production, each evaluation pass runs as a **separate subagent** — three independent AI instances that cannot see each other's output. Each subagent receives only the system bible and the product name. Each runs its pass and saves output to a file. Outputs are assembled afterward. This is structurally equivalent to three different analysts working in separate rooms.

**Phasing:**

- **Calibration Phase (current):** Single-conversation mode is acceptable because every output gets full human review. Ray is reading every score, every finding, every piece of reasoning. Independence is enforced by attention, not architecture.
- **Volume Production (mandatory switch):** Subagent mode becomes mandatory when either condition is met: (1) moving to scale (batch evaluations), or (2) human review shifts from full-read to spot-check. At that point, performed independence is no longer sufficient — it must be structural.

**Assembly Logic Principle:** The assembly step that combines the three outputs should look for **disagreement**, not consensus. When Reliability and Durability passes diverge on the same component or finding, that divergence is signal, not noise. The assembly logic must flag divergence explicitly. It should never smooth or average conflicting assessments without documenting the conflict and the resolution.

---

## 4. SCORING FRAMEWORK

### Axis 1: Reliability (1-10)
**"Does this product work without breaking during its expected lifespan?"**

Reliability measures PERFORMANCE, not longevity. A budget product that works perfectly for 5-7 years scores HIGH on reliability. Reliability is about whether it breaks, not when it wears out.

**Component Quality (30% of Reliability)**
What is known about the quality of internal components? Score based on EVIDENCE.
- Confirmed premium component for application = 9-10
- Confirmed quality component = 7-8
- Unknown component with no documented failures = 8-8.5 (performing; identity unknown is transparency issue, not reliability issue)
- Unknown component with documented failures = 5-7
- Confirmed generic/defective component = 1-4

**Failure Patterns (40% of Reliability)** — Most important reliability subscore
What actually breaks in the field? Score based on DOCUMENTED failures ONLY.
- No documented product-specific failures = 9-10
- One partial failure pattern (some units, one component) = 8-8.5
- One widespread or two partial patterns = 6-7
- Multiple documented patterns = 4-5
- Systemic/widespread or recalls = 1-3

**Professional Consensus (30% of Reliability)**
What do independent professionals say?
- Strong positive ("buy without reservation") = 8-10
- Generally positive with minor caveats = 7-8
- Mixed or limited data = 5-6
- Negative consensus = 3-4
- Professionals actively warn against = 1-2

**Professional Consensus Ceiling Rule:** If two or more independent professional sources actively recommend competing products over this one at the same or lower price, Professional Consensus cannot score above 7.5.

### Axis 2: Durability (1-10)
**"How long will this product last, and can it be maintained and repaired?"**

Durability measures LONGEVITY and SERVICEABILITY. A product can be highly reliable (works while it works) but have low durability (won't last long, can't be fixed).

**Longevity (37.5% of Durability)**
- 20+ year expected lifespan with premium materials = 9-10
- 15-20 years = 7-8
- 10-15 years = 5-6
- 5-10 years = 3-4
- Under 5 years or documented premature degradation = 1-2

**Materials (37.5% of Durability)**
Category-specific material hierarchies apply. Examples:
- Faucets: 316 SS body = 10, solid brass + PVD = 8-9, brass + chrome = 7-8, ambiguous "metal" = 4-5, confirmed ZAMAK = 1-3
- Cabinets: NAF plywood + catalyzed varnish = 9-10, standard plywood = 7-8, particleboard with good containment = 5-6, thin particleboard = 3-4

**Repairability & Support (25% of Durability)** — Intentionally weighted LOWER than Longevity and Materials
Prevents strong parts programs from masking weak substrates (the KraftMaid problem).

Two sub-dimensions:
1. **Actual Repairability (primary weight):** Parts track record, vertical integration, component sourcing, DIY feasibility, manufacturer behavior over time
2. **Formal Warranty Protection (secondary weight):** Warranty duration, coverage scope, transferability, parts availability guarantee, labor coverage

**Critical insight:** Warranty paper is evidence, not the final word. When direct evidence of actual repairability exists (parts track record, vertical integration), it outweighs the warranty document. A short warranty on a product with 112 years of backward-compatible parts (Chicago Faucets) is a documentation gap, not a support gap.

**Labor warranty coverage** (identified gap, pending implementation): Currently the system evaluates warranty holistically but does NOT explicitly distinguish between parts-only warranties and parts-plus-labor warranties. Since plumber labor for a cartridge replacement runs $200-400 even when the part is free, this is a real cost differential that should be scored. Only one known faucet brand (California Faucets per StarCraft data) offers parts AND labor coverage.

### Axis 3: Material Safety (1-10)
Scored by the Material Safety Bot independently. See Bot 3 description above.

### Overall Score
Average of Reliability and Durability. Material Safety is reported separately — it does NOT fold into the overall score.

### Benchmarks

**Reliability:**
- 9-10: Near-zero documented failures. Professionals recommend without hesitation.
- 8-8.5: Mostly flawless. One minor or partial failure pattern.
- 7-7.5: Solid with 2-3 documented issues. "Good but not great."
- 5-6: Adequate. Multiple issues documented. Mixed professional opinion.
- 3-4: Problematic. Widespread failures. Professionals express concern.
- 1-2: Unreliable. Systemic failures or "do not install."

**Durability:**
- 9-10: 20+ year lifespan. Premium materials throughout. Fully repairable. Lifetime warranty with real backing.
- 7-8: 15-20 year lifespan. Solid materials. Good repairability.
- 5-6: 10-15 years. Acceptable materials with cost optimization. Adequate warranty.
- 3-4: 5-10 years. Material concerns, short warranties, approaching disposable.
- 1-2: Under 5 years. Disposable by design. No parts, no repair path.

---

## 5. LETTER GRADE SYSTEM AND OUTLOOK MODIFIERS

### Letter Grade Scale (Client-Facing)
Decimal scores are kept internally for calibration. The client sees letter grades.

| Grade | Score Range | Meaning |
|---|---|---|
| A+ | 9.5-10 | Exceptional — near-zero concerns |
| A | 9.0-9.4 | Excellent — minor considerations only |
| A- | 8.5-8.9 | Very good — one or two real but manageable gaps |
| B+ | 8.0-8.4 | Good — solid product with identifiable limitations |
| B | 7.5-7.9 | Above average — works well, some concerns |
| B- | 7.0-7.4 | Decent — adequate with notable gaps |
| C | 6.0-6.9 | Average — gets the job done, real tradeoffs |
| D | 4.0-5.9 | Below average — significant concerns |
| F | Below 4.0 | Fail — do not install |

**Important:** This is NOT an academic grading scale. A 5/10 is the dead center of the market — average, not failing. The scale measures where a product sits in the full spectrum from worst to best. Think Michelin stars: zero stars doesn't mean bad, it means normal.

### Outlook Modifiers (Replaces Flag System)
Each product gets a one-word outlook instead of colored flags:

- **Strong** — No material concerns. Buy with confidence. (Replaces old "Green flag")
- **Stable** — Minor considerations the buyer should understand. Excellent product with one or two things to look into. (Replaces old "mild Yellow")
- **Conditional** — Specific circumstances the buyer must understand before committing. Read the notes carefully. (Replaces old "strong Yellow" or "near Red")

**Why this replaced colored flags:** The old Green/Yellow/Red system gave Chicago Faucets (9.4 overall, minor warranty documentation gap) the same Yellow flag as Kraus (6.0 overall, real quality problems). The outlook modifier communicates severity through the score itself and nuance through the outlook word.

### No "Verified" Designation on Individual Reports
Originally considered a "Residentialist Verified" designation for products scoring A- or higher on both axes. Removed because: if evaluating a Lennar spec home where every product is builder-grade, nothing earns the designation, and the report feels like a failure document. The scores and outlook do the work. The "Verified" concept may live on a website "recommended" list — marketing, not the paid report.

---

## 6. VALUE CONTEXT AND ASSET CLASS FRAMEWORK

The quality scores (Reliability, Durability, Material Safety) measure absolute construction quality. They do not adjust for price. A $3,000 cabinet package and a $50,000 cabinet package are scored against the same standard. This is intentional — buyers need to know the actual quality of what's going into their home.

But absolute quality alone doesn't answer the question buyers actually ask: **"Is this good for what I'm paying?"** The Value Context system answers that question without contaminating the quality score.

### Layer 1: Value Indicator (Product-Level)

Every evaluated product receives a **Value Indicator** alongside its quality scores. This is a five-level scale based on the ratio between quality score and price tier:

| Value Indicator | Meaning |
|---|---|
| **Exceptional Value** | Quality score significantly exceeds what the price tier typically delivers |
| **Strong Value** | Quality score meaningfully above price tier expectations |
| **Fair Value** | Quality score aligns with price tier — you're getting what you pay for |
| **Weak Value** | Quality score below what the price tier should deliver |
| **Poor Value** | Quality score significantly below price tier — overpaying for what you're getting |

**Example from calibration data:**
- Fabuwood Galaxy: B+ (8.1) at Price Level 2 → **Exceptional Value** (performing two tiers above its price point)
- KraftMaid Base: B- (7.2) at Price Level 4 → **Weak Value** (scoring at Price Level 2-3 quality despite Price Level 4 cost)
- Crystal Keyline/Encore: A (8.7) at Price Level 5 → **Fair Value** (top-tier quality at top-tier price — you're getting what you pay for)

**Critical rule:** The Value Indicator is a SEPARATE field. It never modifies the quality score. A Fabuwood Galaxy is still a B+ — it doesn't become an A because it's a good deal. The quality score tells you what you're getting. The Value Indicator tells you whether the price makes sense.

### Layer 2: Asset Class Context (Report-Level)

Reports include expected score ranges based on the home's construction cost tier. This gives buyers a frame of reference for what quality level is normal at their price point.

**Production Reports** state: "At this construction cost per square foot, cabinets in this price range typically fall in the C to B- range. Your spec'd cabinets scored [X]."

**Custom Reports** compare options: "Option A is B+ and Exceptional Value. Option B is A- and Fair Value. Both are above the expected range for your build tier."

This context appears in the report narrative. It is not a score modifier.

### Geographic Cost Normalization

Expected quality ranges are pegged to **construction cost per square foot**, not home sale price. This neutralizes land cost premiums that vary wildly by market.

A $200/sqft build in Los Angeles and a $200/sqft build in Tulsa should use the same cabinet quality. The home prices will be dramatically different because land costs are different, but the construction budget per square foot — the money actually going into materials and labor — tells you what quality tier the builder is working in.

**Construction Cost Lookup Table (calibrate against Austin first, then apply nationally):**

| Construction Cost/Sqft | Expected Score Range | Typical Home Context |
|---|---|---|
| Under $125/sqft | D to C | Entry-level production, builder-grade throughout |
| $125–$175/sqft | C to B- | Standard production, some upgraded selections |
| $175–$250/sqft | B- to B+ | Upper production or entry custom |
| $250–$350/sqft | B to A- | Custom builds, curated selections |
| $350+/sqft | A- to A | High custom / luxury, premium throughout |

**Important:** These are expected ranges, not requirements. A production home at $150/sqft with B+ cabinets is a great sign — flag it as above-tier. A custom build at $300/sqft with C cabinets is a red flag — the builder is cutting corners on a discretionary category.

**For Production Reports:** Construction cost per square foot is derived from the home price minus estimated land value. NAHB allocation percentages provide the expected budget share for each category (cabinets 4.5%, HVAC 6.3%, etc.).

**For Custom Reports:** The buyer typically knows their construction budget and square footage directly. Land is a separate line item. Construction cost per square foot is a given, not a derivation.

### Allocation Benchmarks: NAHB Bootstrap → Proprietary Replacement

**The problem with third-party allocation data:** NAHB's Construction Cost Breakdown (cabinets/countertops 4.5%, HVAC 6.3%, interior finishes 24.1%) is based on 41 production builder respondents building typical single-family homes nationally. RSMeans Residential Cost Data offers four-tier segmentation (economy/average/custom/luxury) with 13,000+ line items, but bundles categories differently than The Residentialist evaluates them (e.g., "Specialties" combines kitchen cabinets, countertops, sinks, and water heaters into one line). Neither source maps cleanly to what buyers actually need to know, and neither reflects Austin-specific builder behavior.

**The solution: use NAHB as bootstrap data, then replace it with proprietary allocation intelligence built from real spec sheets.**

**Phase 1 — Bootstrap (Launch):**
NAHB allocation percentages serve as the initial Asset Class Context benchmarks. When a report says "at this price point, cabinets typically represent about 4.5% of construction cost," that's NAHB talking. It's directionally correct for production and good enough to launch with. For custom reports, NAHB percentages are framed as "what's typical in production" reference points, not benchmarks — custom allocation is fluid by design.

**Phase 2 — Accumulation:**
Every spec sheet that comes through the evaluation pipeline has its allocation percentages calculated as a byproduct of the work already being done. A production build comes in at $400K with a $12K cabinet package — that's 3% of total. A custom build has a $650K construction contract with $45K cabinets — that's 6.9%. Each becomes a data point, segmented by price-per-sqft tier and report type (production vs custom).

**Phase 3 — Replacement:**
Once a tier has enough real data points, NAHB drops off. Confidence thresholds:
- **Under 10 spec sheets in a tier:** NAHB is the reference. Reports cite "industry benchmark data."
- **10–24 spec sheets:** Blended. Reports cite "industry benchmarks validated against [X] builds analyzed in this price range."
- **25+ spec sheets:** NAHB drops entirely. Reports cite "based on [X] builds analyzed in the $[range] price range in [market]."

**Why this is better than renting third-party data:**
- Allocation percentages are a byproduct of evaluations already being performed — zero incremental data collection effort
- Data segments naturally by price-per-sqft tier and market
- After 50 production spec sheets in Austin, nobody else has "here's what builders in Austin actually spend on cabinets at the $200/sqft tier"
- The data compounds monthly and becomes a proprietary moat
- RSMeans remains available as a cross-reference for validation but is not a dependency

**Key insight from NAHB and RSMeans:** Structural categories (foundation, framing, basic mechanical systems) hold relatively steady across all tiers and home types. Discretionary categories (cabinets, countertops, fixtures, finishes) shift dramatically — RSMeans data shows Specialties going from 2.71% at Economy to 10.72% at Luxury, a near-4x increase. This confirms that third-party averages are least useful for exactly the categories The Residentialist evaluates, and proprietary data from real spec sheets is the only path to accurate benchmarks.

### Production vs Custom Report Separation

Production and custom homes operate on fundamentally different economic mechanics. The report system must respect this.

**Production homes:**
- Land cost is baked into the sale price — buyer sees one number
- Builder controls all selections within a cost envelope
- NAHB allocation percentages work as expected benchmarks
- Construction cost per square foot is derived (sale price minus estimated land value)
- Value Indicator compares against what's typical at this builder's price point

**Custom homes:**
- Land is a separate transaction from the construction contract
- Buyer (or architect) drives selections — allocation is fluid by design
- NAHB norms become reference points, not benchmarks
- Construction cost per square foot is a known input, not a derivation
- Value Indicator compares against absolute quality-to-price ratio

**Hard rule:** Never compare custom to production on a price-per-foot basis. A custom home at $350/sqft and a production home at $350/sqft are not comparable — the custom number represents construction only while the production number may include land, margin structure, and community infrastructure.

### Production Report Anchoring: Community-Level, Not Model-Level

When a production builder specs a community, they make one set of product decisions for that entire community. The Timberlake Origins in the $350K floor plan are the same Timberlake Origins in the $500K floor plan — the bigger house just has more linear feet of the same cabinet. Quality doesn't change with square footage. The product evaluation is identical across all models in a community.

**Anchoring rules:**

1. **The spec sheet is community-level.** One spec sheet per community, not per floor plan. Five floor plans at different prices but same spec = one evaluation, one data point.

2. **The Value Indicator anchors to the community, not the model.** Reports state: "Builder X's Riverside Ranch community ($350K–$500K) specs Timberlake Origins cabinets. These score [grade]. At this community's price range, that represents [Value Indicator]."

3. **Allocation math uses base price and base square footage.** The base price represents the builder's minimum cost structure for that community. Upgrades from there are mostly square footage, not product quality. Base price ÷ base square footage = the price-per-sqft that slots into the lookup table.

4. **Price per square foot is the true anchor, not sticker price.** Two communities can both start at $500K but tell completely different stories:
   - Community A: $500K base, 2,000 sqft = $250/sqft → upper production, expect B- to B+ range
   - Community B: $500K base, 900 sqft = $556/sqft → luxury tier, expect A- to A range
   If both communities spec the same builder-grade cabinet, the Value Indicator fires very differently. At $250/sqft it's expected. At $556/sqft it's a red flag.

5. **Upgrade packages are separate evaluations.** If a builder offers "standard cabinets are Merillat, upgrade package is KraftMaid for $8K more," those are two evaluations with two Value Indicators at the same community price point. This is a powerful buyer comparison: "the standard package scores D and the upgrade scores B-. Here's whether the $8K is worth it."

**Multi-builder comparison format:** Overlapping communities compared side by side.
- Builder A, Community X ($350K–$500K): Timberlake Origins, B-, base $250/sqft
- Builder B, Community Y ($380K–$520K): Fabuwood Galaxy, B+, base $230/sqft
- Builder C, Community Z ($400K–$550K): Merillat Classic, D, base $275/sqft

Same price neighborhood, three different cabinet decisions, immediately visible.

### Builder Database: Community Record Structure

Every production community that enters the evaluation pipeline creates a record in the builder database. This is the minimum viable data capture:

| Field | Description | Example |
|---|---|---|
| **Builder** | Builder name | Lennar |
| **Community** | Community name | Riverside Ranch |
| **Market** | Metro area | Austin / Hill Country |
| **Base Price** | Lowest-priced model | $385,000 |
| **Base Sqft** | Square footage of base model | 1,850 sqft |
| **Derived: $/Sqft** | Base price ÷ base sqft | $208/sqft |
| **Spec Sheet** | Products at standard level | Timberlake Origins, Moen Adler, etc. |
| **Upgrade Packages** | If offered, list with price delta | KraftMaid upgrade +$8K |
| **Date Captured** | When spec sheet was obtained | March 2026 |

**For custom builds**, the record is simpler because the buyer provides the numbers directly:

| Field | Description | Example |
|---|---|---|
| **Builder** | Builder or GC name | Heritage Custom Homes |
| **Project Type** | Custom / Semi-Custom | Custom |
| **Market** | Metro area | Austin / Hill Country |
| **Construction Contract** | Total construction budget (excl. land) | $650,000 |
| **Planned Sqft** | Planned square footage | 2,600 sqft |
| **Derived: $/Sqft** | Contract ÷ sqft | $250/sqft |
| **Selections** | Products being evaluated | Crystal Keyline, Thermador, etc. |
| **Date Captured** | When evaluation was performed | March 2026 |

**Data accumulation:** Every evaluation passively feeds the proprietary allocation database. Over time, these records reveal patterns — "builders at $200–250/sqft in Austin almost always spec Timberlake or Merillat" and "builders at $300+ start showing Fabuwood or equivalent." Those patterns become the allocation benchmarks that replace NAHB and are unavailable from any third-party source.

**RSMeans as cross-reference (not dependency):** RSMeans Residential Cost Data with Austin City Cost Index localization is available for spot-checking proprietary allocation data against industry-standard cost models. It is not a primary data source for the evaluation system. The allocation percentages from real spec sheets in the Austin market will always be more accurate than national models with location factors applied.

---

## 7. KNOWLEDGE FILES

### Structure
Each category has separate knowledge files for the Evaluator Bot and Material Safety Bot. The Consensus Bot has NO knowledge file — it runs lean and does its own research.

```
The Residentialist/
├── Prompts/
│   ├── consensus_bot.md           (universal — same across categories)
│   ├── evaluator_bot.md           (universal framework)
│   └── material_safety_bot.md     (universal framework)
├── Knowledge/
│   ├── Faucets/
│   │   ├── eval_knowledge.md
│   │   └── material_safety_knowledge.md
│   ├── Cabinets/
│   │   ├── eval_knowledge.md
│   │   └── material_safety_knowledge.md
│   ├── Countertops/
│   │   └── eval_knowledge.md              (v0.1 — includes Material Class Profiles, Mislabeled Stone Rule, Material Safety rules. Combined file at launch — may split eval/safety later.)
│   ├── Windows/
│   │   ├── eval_knowledge.md
│   │   └── material_safety_knowledge.md
│   └── [Category]/
│       ├── eval_knowledge.md
│       └── material_safety_knowledge.md
└── Changelog/
    └── calibration_log.md         (running log of every scoring fix)
```

### What Knowledge Files Contain (Category-Specific)

**Evaluator Knowledge File:**
- Component/hardware hierarchies with scoring guidance
- Material quality tiers with scoring ranges
- Business model taxonomy for that category's manufacturers
- Known failure pattern data from professional sources
- Warranty structure analysis and red flags
- Certification requirements
- Calibration benchmarks (what scores specific benchmark products should receive)
- Market tier mapping (which brands compete at which price level)
- Category-specific scoring rules

**Material Safety Knowledge File:**
- Material exposure pathways specific to the category
- Chemical/toxicity hierarchies (e.g., NAF → ULEF → CARB Phase 2 for formaldehyde in cabinets)
- Certification requirements (NSF, FDA, CARB, etc.)
- Known material concerns by product type
- Substrate/material scoring methodology
- Containment assessment guidance

### Faucet-Specific Knowledge (Partially Built)

**Cartridge tier hierarchy (application-specific — this is critical):**
- **Premium Tier: Flühs (Germany)** — Dominates two-handle cartridges. Using Flühs for a two-handle = optimal = 9-10.
- **Premium Tier: Kerox (Hungary)** — Dominates single-handle mixer cartridges. Using Kerox for a single-handle mixer = optimal = 9-10.
- Flühs and Kerox are co-equals for their respective applications. A manufacturer using Kerox for single-handle and Flühs for two-handle is making the BEST choice for each application, not settling.
- **Quality Tier: Geann, Sedal** = 7-8
- **Generic/Unknown** = flag for investigation

**Business model taxonomy:**
- Manufacturer (vertically integrated): Makes own components (Chicago Faucets, Waterstone)
- Assembler: Selects premium components, assembles to own designs (California Faucets)
- Marketeer/Importer: Sources from OEM factories, may misrepresent as manufacturer (Kraus)

**Red flag checklist:**
- No UPC/cUPC certification
- No NSF/ANSI 61 certification
- No NSF/ANSI 372 certification (lead-free) — THIS WAS MISSING, needs to be added
- ZAMAK confirmed in water path
- Cartridge manufacturer won't be disclosed
- "Lifetime warranty" with 5-year parts availability (structural contradiction)
- No replacement parts available through normal channels
- Active CPSC recalls

### Cabinet-Specific Knowledge (Built)

**Hardware hierarchy:**
Blum → Grass → Hettich/Salice → DTC → unbranded

**Substrate scoring:**
NAF plywood → standard plywood → ULEF particleboard → CARB Phase 2 particleboard → unknown

**Formaldehyde emission hierarchy:**
- NAF (No Added Formaldehyde): 0 ppm added — score 9-10
- ULEF (Ultra Low Emitting Formaldehyde): 0.01-0.03 ppm — score 7-8
- CARB Phase 2 compliant plywood: 0.05 ppm max — score 6-7
- CARB Phase 2 compliant particleboard: 0.09 ppm max — score 4-5
- Unknown adhesive system: score 3-4

---

## 8. CALIBRATION RULES AND WATCH ITEMS

These are known scoring tendencies discovered during calibration. They are built into the Evaluator Bot prompt as explicit guardrails.

### Rule 1: Score Within Product Category
Always score against others in the same specific category. A pull-down kitchen faucet is scored against pull-down kitchen faucets — NOT fixed-spout faucets. Category-inherent characteristics (more moving parts, more complexity) are category realities, not product flaws.

### Rule 2: Application-Specific Component Selection
Cartridge (faucets) and hardware (cabinets) selection should be scored based on whether the manufacturer chose the best option for that specific application, not on absolute tier position.

### Rule 3: Finish Scoring Reflects Best Available Option
If a product offers PVD finishes (most durable), score based on PVD option. Non-PVD selections having shorter lifespans is buyer choice, not a product limitation.

### Rule 4: No Double-Counting
**This is the most critical calibration rule.** Every concern gets scored in ONE place:
- Warranty gaps → Repairability & Support (Durability) ONLY
- Component unknowns → Component Quality (Reliability) ONLY
- Material ambiguity → Materials (Durability) ONLY
- Cost optimization → Materials (Durability) ONLY, unless it has led to documented failures
- Documented failures → Failure Patterns (Reliability) ONLY

If the same concern is penalizing two subscores, stop and route it to the one place it belongs.

### Rule 5: Reliability ≠ Durability
Reliability measures whether it BREAKS. Durability measures how long it LASTS and whether it can be FIXED. A faucet that works flawlessly for 7 years then degrades = HIGH reliability, LOW durability.

### WATCH: Reliability Dragged Down by Transparency Issues
**Problem:** Bot penalizes Reliability for component unknowns (undisclosed cartridge) even when no documented failures exist. Unknown cartridge = transparency problem, not reliability problem.
**Rule:** Component Quality scores unknown-but-performing components at 8-8.5. Sourcing concern belongs in Repairability & Support under Durability.
**Example:** Kraus — one real failure pattern (spray head), cartridge not failing, body not failing. Expected Reliability: ~7.5-8.

### WATCH: Warranty Paper Overriding Actual Repairability
**Problem:** Bot scored Chicago Faucets at 7.0 Repairability because of 5-year cartridge warranty, despite having the best actual repairability in the industry (parts to 1913, own foundry, own cartridge).
**Rule:** Actual repairability evidence outweighs warranty paper. Short warranty + 112 years of backward-compatible parts = 8.5-9.5 on Repairability. Warranty concern flagged as finding, not as score penalty.

### WATCH: Finding Fragmentation
**Problem:** Warranty mentioned in Professional Consensus, Parts & Serviceability, Yellow Findings, and Notes. Evaluator Bot picks up fragments from three places and counts them as separate concerns.
**Rule:** Consolidate related findings. Multiple symptoms of the same root concern = ONE finding:
- All finish-related issues = ONE finding about finish technology
- All warranty language issues = ONE finding about warranty structure
- All transparency issues = ONE finding about component transparency

### WATCH: Professional Consensus Inflation
**Problem:** KraftMaid scored 8.0 Professional Consensus despite professionals actively recommending alternatives.
**Rule:** Professional Consensus ceiling at 7.5 when two or more independent sources recommend competing products at the same or lower price.

### WATCH: Repairability Masking Weak Materials
**Problem:** KraftMaid's 9.0 Repairability pulled Durability to 7.0, obscuring the reality that its materials and longevity both scored 6.0.
**Fix:** Durability weighted 37.5% Longevity, 37.5% Materials, 25% Repairability instead of equal thirds.

### Rule 6: Mislabeled Stone Rule (Countertops)
**Problem:** The natural stone industry frequently mislabels marble and dolomitic marble as "quartzite" or "soft quartzite." "Soft quartzite" is a fictional marketing term — it does not exist as a geological category. Known examples: Fantasy Brown (also Mascavo/Canyon Dawn), Super White, Shadow Storm — all marketed as quartzite, all actually dolomitic marble.
**Rule:** If the bot encounters the term "soft quartzite" or any stone from the Known Mislabeled Stones list (maintained in the Countertop Knowledge File), it reclassifies the material as marble/dolomitic marble and evaluates it under the marble Material Class Profile. The stone is not penalized for being marble — it is evaluated honestly as marble. The mislabeling itself is a Yellow Finding because the buyer's durability expectations are being set incorrectly (Mohs 3-5 marble vs Mohs 7 quartzite). If the mislabeling originates from a builder spec sheet, the Yellow Finding is strengthened — the builder is misrepresenting the product.
**Why it matters:** A buyer who thinks they're getting quartzite and receives dolomitic marble will experience etching from acidic kitchen substances and blame the product. The product isn't bad — the expectation was set wrong.

### Rule 7: Benchmark Ceiling Rule (Calibrated March 3, 2026 — Cambria Brittanicca)
**Problem:** First calibration run scored the acknowledged best product in the engineered quartz class at 8.75/10 — leaving it in the middle of the A- range when nothing realistically scores higher.
**Rule:** The best product in a material class occupies the top of the achievable range (9.0-9.8), not the middle. If a product IS the benchmark, it should score like the benchmark. Other products in the class are measured against it, so its score sets the ceiling.

### Rule 8: Certification Sufficiency Rule (Calibrated March 3, 2026 — Cambria Brittanicca)
**Problem:** Material Safety Bot docked points from Cambria for proprietary resin formulation despite Greenguard Gold, NSF 51, and ILFI Declare all independently verifying the product as safe.
**Rule:** When a product holds a primary health certification (Greenguard Gold or equivalent) PLUS at least one additional independent certification (NSF 51, Declare, C2C, Blue Angel, French A+), proprietary formulation is NOT a score drag. Trade secrets are not safety evasion when independent testing validates the output. Remaining opacity noted in back-end, not reflected in score.

### Rule 9: Class-Universal Issue Rule (Calibrated March 3, 2026 — Cambria Brittanicca)
**Problem:** Heat sensitivity was flagged as a Yellow Finding on Cambria Brittanicca, but ALL engineered quartz has heat sensitivity. Every quartz product would get the same finding.
**Rule:** Characteristics that apply to every product in a material class belong in the Material Class Profile as educational context. They do NOT repeat as Yellow Findings on individual products. Heat for quartz, sealing for granite, etching for marble — these are class realities, not product deficiencies. Individual products only get findings for things that differentiate them FROM their class.

### Rule 10: Complaint Scale Rule (Calibrated March 3, 2026 — Cambria Brittanicca)
**Problem:** BBB cracking complaints were considered as a potential Yellow Finding for Cambria, but without complaint-to-sales ratio, there's no way to assess whether a few dozen complaints against hundreds of thousands of slabs sold represents a pattern.
**Rule:** Consumer complaints without complaint-to-sales ratio are noted in Consensus Bot evidence but do not become Findings unless (a) the pattern is clearly systemic (widespread professional acknowledgment), or (b) independently verified by a professional or technical source. Isolated complaints are data, not findings.

### Rule 11: Transparency Leader Rule (Calibrated March 3, 2026 — Cambria Brittanicca)
**Problem:** Cambria participates in HPD, Declare, Greenguard, NSF, and mindful MATERIALS — more transparency programs than nearly any competitor — but was still docked for remaining undisclosed resin components.
**Rule:** Companies that participate in more transparency programs than their competitors are NOT penalized for remaining proprietary gaps when independent certifications validate the product. You don't punish the most transparent player in the room for not being perfectly transparent.

### Rule 12: Material Safety Bot Reframe (Calibrated March 3, 2026 — Cambria Brittanicca)
**Problem:** The Material Safety Bot was designed to find gaps in chemical/health perfection, then dock for each gap. This produced a structural score drag on well-certified products — Cambria with five health certifications scored 8.0 Material Safety, same neighborhood as products with one certification. The gap-hunting approach drowned out the actual signal.
**Structural Change:** Material Safety Bot v2 is fundamentally reframed. The core question changes from "How close to theoretical chemical perfection is this product?" to **"Has anyone credible identified a health or safety concern I should know about?"** The bot searches for FLAGS from Healthy Homes Radar organizations, not GAPS in certification coverage. Products with certifications and no credible flags score 9-10. Products with identified but manageable concerns score 7-8. Products without evaluation get "Not Rated" with a Manufacturer Confidence Profile instead of a made-up number. See updated Bot 3 description in Section 3 and the standalone Material Safety Bot v2 Universal prompt.

### Rule 13: Adjacent Product Rule (Calibrated March 3, 2026 — Ubatuba Granite, White Ice Granite)
**Problem:** The Material Safety Bot was docking granite scores (to 7.0-7.5) because most mainstream stone sealers contain PFAS, and granite requires sealing. This penalized an inert geological material for the chemistry of a separate product the buyer independently selects. Equivalent to docking a house score because someone might paint it with lead paint.
**Rule:** The Material Safety score reflects the product being evaluated, not companion products the buyer may pair with it. When an adjacent product (sealer, adhesive, cleaner, grout, etc.) has a documented health concern, that concern goes in **Yellow Findings as a buyer advisory**, not into the Material Safety score. The advisory should name the concern, confirm that safe alternatives exist, and recommend the buyer specify accordingly.
**Exception:** If NO safe alternative exists for a functionally required companion product — meaning the product literally cannot be used safely as intended — then the adjacent product concern CAN affect the Material Safety score. This exception protects buyers from situations where a product has no safe use pathway. As of this writing, PFAS-free stone sealers exist and have been independently tested, so granite's PFAS sealer concern is an advisory, not a score impact.
**Calibration impact:** Ubatuba Granite Material Safety 7.5 → 9.5. White Ice Granite Material Safety 7.0 → 9.5. Both receive Yellow Finding: "Granite requires periodic sealing. Most mainstream stone sealers contain PFAS (per- and polyfluoroalkyl substances). Specify a PFAS-free sealer for food preparation surfaces. Tested alternatives are commercially available."

### Rule 14: Certification Tier Rule (Calibrated March 3, 2026 — Caesarstone Calacatta Maximus, MSI Q Premium)
**Problem:** The Material Safety Bot was docking Caesarstone (to 9.0) because its standard quartz line carries Greenguard rather than Greenguard Gold, and docking MSI (to 9.0) because MSI lacks voluntary transparency programs (Declare, HPD) despite holding Greenguard Gold + NSF 51. Both are examples of gap-hunting that Rule 12 was designed to eliminate — the bot was scoring based on certification tier differences rather than asking whether anyone credible had flagged a concern.
**Rule:** The Material Safety Bot does NOT dock for certification tier differences (e.g., Greenguard vs Greenguard Gold) when both tiers confirm the underlying concern is managed and no credible source has flagged the lower tier as insufficient. Similarly, the absence of voluntary transparency programs (Declare, HPD, mindful MATERIALS) does NOT drag the Material Safety score when primary health certifications (Greenguard Gold, NSF 51, or equivalents) are present and no credible flags exist. Voluntary transparency programs are noted positively in the Consensus Bot narrative but do not create a Material Safety differential.
**Calibration impact:** Caesarstone Calacatta Maximus Material Safety 9.0 → 9.5. MSI Q Premium Material Safety 9.0 → 9.5.

### Rule 15: Certification Floor Rule (Calibrated March 3, 2026 — Faucet Material Safety v2 Rerun, All Six Products)
**Problem:** The v1 Material Safety Bot scored faucets on a 1-5 scale using gap-hunting logic: California Faucets docked for "bismuth-brass long-term data still accumulating," In2aqua docked for "ZAMAK in non-pressurized parts" (standard industry practice, not in water path), Pfister and American Standard docked for "less transparency about specific components," and Kraus docked to 2/5 for marketing accuracy concerns and Marketeer material variability. All six products hold NSF 61, NSF 372, and UPC certifications. No credible Healthy Homes Radar source had flagged a consumer health concern for any of them.
**Rule:** For products in categories with mandatory safety certifications (NSF 61/372 for faucets, Greenguard/NSF 51 for countertops), all certified products with no credible health flags start at 9.5 on Material Safety. The certification IS the evidence. Deductions below 9.5 require a credible, documented flag from a Healthy Homes Radar source that identifies a concern the certification does not address. Component transparency, manufacturing control, and material consistency are quality/durability concerns that belong in the Evaluator Bot, not Material Safety — UNLESS a specific material in the water pathway has been identified as a health hazard (e.g., confirmed ZAMAK in pressurized water path = Red Finding regardless of certification status). Material Safety can exceed 9.5 when a product eliminates a class-level exposure pathway entirely (stainless steel contacts eliminating brass leaching, sintered stone eliminating resin off-gassing) or carries voluntary health transparency certifications beyond regulatory requirements (Declare label, C2C Material Health).
**Cross-category validation:** This mirrors countertop calibration exactly. Countertops: all certified products with no flags → 9.5, Dekton (no resin, no sealer) → 9.8. Faucets: all certified products with no flags → 9.5, Waterstone (stainless contacts, no brass leaching) → 9.8. Material Safety differentiates between material CLASSES, not between BRANDS within a material class when all are certified and no flags exist.
**Calibration impact:** California Faucets 4/5 → 9.5. In2aqua 4/5 → 9.5. Pfister 3/5 → 9.5. American Standard 3/5 → 9.5. Kraus 2/5 → 9.5. Waterstone 5/5 → 9.8.

---

## 9. CERTIFICATION GATE CHECKS

**This section represents a newly identified requirement (current session) that needs to be built into the pipeline.**

### The Problem
If a faucet enters the database without required US certifications, that's not just a quality concern — it's a legality and insurance liability issue. An uncertified fixture installed in a home could result in insurance claim denial if water damage occurs.

### Required Certifications (Faucets — US Market)

1. **UPC/cUPC** — Legal to install. Listed with IAPMO. Required by code in all US jurisdictions.
2. **NSF/ANSI 61** — Safe for drinking water contact. Verifies materials don't leach contaminants above thresholds.
3. **NSF/ANSI 372** — Lead-free compliance. Verifies weighted average lead content ≤ 0.25%.

### How This Should Work in the Pipeline
- **Gate check, not a finding.** The Consensus Bot should verify all three certifications as its FIRST action before doing any other research.
- If any certification is missing or unverifiable: immediate Red finding, prominent flag in the report
- The report should explicitly state the insurance liability angle: "Installing an uncertified fixture may result in code violations and potential insurance claim denial for water damage."
- This is a "stop everything" concern — no point spending 45 minutes on cartridge hierarchy research if the product isn't legal to install

### Current Gap
- UPC/cUPC and NSF/ANSI 61 are in the current red flag checklist
- NSF/ANSI 372 (lead-free) is NOT in the current red flag list — needs to be added
- None of them are positioned as a gate check that fires before the full evaluation
- Insurance liability framing is completely absent from the system

---

## 10. FINDINGS SYSTEM (RED / YELLOW)

### Red Findings (Disqualifying)
Safety, legality, or fundamental quality concerns. Reserved for products that should NOT be installed.

Examples:
- ZAMAK confirmed in water path
- Missing required certifications (UPC, NSF/ANSI 61, NSF/ANSI 372)
- Active CPSC recalls
- Documented health hazards
- Contraband products (no verifiable origin, no factory address)

**A low score alone does NOT make a product Red.** A 4/10 budget faucet with proper certifications and no safety issues is Yellow, not Red.

### Yellow Findings (Buyer Awareness)
Gaps, weaknesses, or opacity concerns that negatively affect the buyer's purchase decision.

Examples:
- Undisclosed cartridge/component manufacturer
- Short warranties relative to industry standard
- Material ambiguity ("metal" instead of specifying alloy)
- Manufacturer misrepresentation (calling themselves a manufacturer when they're an importer)
- Parts availability limits (5-year guarantee with "lifetime" warranty)
- Non-transferable warranty

**Filter rule:** Only include findings that negatively affect the buyer's purchase decision. Company-facing observations with no buyer impact go to Notes or are omitted. Every Yellow finding must answer: "Would a homeowner change their mind or negotiate differently because of this?"

### Consolidation Rules
Before counting findings for outlook determination, consolidate related items:
- All finish-related issues → ONE finding about finish technology/durability
- All warranty language issues → ONE finding about warranty structure
- All transparency issues → ONE finding about component transparency

Count DISTINCT root concerns, not symptoms.

---

## 11. BUSINESS MODEL TAXONOMY

This taxonomy applies across categories and is a key predictor of parts lifecycle and long-term serviceability.

### Manufacturer (Vertically Integrated)
Makes own components. Controls the supply chain.
- **Parts lifecycle prediction:** 20+ years. Own cartridge/component designs, own manufacturing.
- **Examples:** Chicago Faucets (own foundry, own cartridge), Waterstone (316 SS, manufacturer-direct)
- **Faucet implication:** Cartridge designs owned by manufacturer = parts availability for decades

### Assembler
Selects premium components, assembles to own designs at own facility.
- **Parts lifecycle prediction:** Effectively indefinite for key wear components, because they use established cartridge/hardware manufacturers (Kerox, Flühs, Blum) whose products outlive any single brand.
- **Examples:** California Faucets (Kerox/Flühs cartridges, assembled in Huntington Beach, CA)
- **Key insight:** An assembler who sources from Tier 1/2 component manufacturers has BETTER parts availability than a vertically integrated manufacturer, because the components are independently sourceable.

### Marketeer/Importer
Sources from OEM factories (often rotating Chinese suppliers). May misrepresent as manufacturer.
- **Parts lifecycle prediction:** 3-7 year parts window. No control over or commitment to the supply chain. When the OEM changes or the model is discontinued, parts evaporate.
- **Examples:** Kraus ("manufactured from pure fantasy" per StarCraft — calls itself a manufacturer but sources from overseas OEMs)
- **Faucet implication:** Undisclosed cartridge from unknown OEM = when manufacturer discontinues support, independent sourcing becomes impossible. "Lifetime warranty" with 5-year parts availability = structural contradiction.

### Scoring Implication
Business model type should PREDICT how Repairability & Support is scored:
- Manufacturer-owned designs: assume long-term parts availability unless evidence contradicts
- Assembler with premium components: assume indefinite availability of wear components
- Marketeer/Importer: assume 3-7 year parts window and score accordingly in Repairability & Support

---

## 12. SOURCE HIERARCHY (UNIVERSAL)

For every category, sources are prioritized in this order:

1. **Independent professional reviewers** with demonstrated methodology (StarCraft, McAlary, Yale Appliance)
2. **Professional installer/technician forums** (TerryLove, PlumbingZone, WOODWEB, Contractor Talk, HVAC-Talk)
3. **Identifiable professionals on generalist platforms** (named contractors/designers on Houzz)
4. **Regulatory and standards databases** (NFRC, CARB, CPSC, FDA, EPA, NSF)
5. **Manufacturer spec sheets** — for factual verification ONLY, never trusted at face value
6. **Trade publications** (Kitchen & Bath Business, ACHR News, JLC)

**EXCLUDED ENTIRELY:** Amazon reviews, Google reviews, Yelp, consumer review aggregators, social media, influencer content.

**Single-source risk:** If one source provides >50% of the evaluation evidence (as StarCraft does for faucets), that dependency should be noted. Mitigation: cross-reference with professional forums as an independent check.

---

## 13. TWO-LAYER REPORT STRUCTURE (FRONT-END / BACK-END)

Every product evaluation produces two documents: a client-facing front-end report and an internal back-end report. These serve different audiences and have different information security requirements.

### Front-End Report (Client-Facing)

**Audience:** Homebuyers, production home buyers reading spec sheets, custom build clients making selections.

**Length:** ~2 pages.

**Contains:**
- Product identification (name, configuration, price range, business model classification)
- Certification gate status (PASS/FAIL on required certifications)
- Scores: Reliability, Durability, Overall (letter grades), Material Safety (1-10), Outlook
- Expected lifespan with three scenarios tied to specific conditions (water chemistry, usage patterns, household size)
- Consolidated Yellow/Red findings stated in plain language — what the buyer needs to know
- Benchmark comparison table showing where this product sits against calibrated peers
- Bottom line narrative: 2-3 sentences a homeowner can act on

**Does NOT contain:**
- Subscore breakdowns or weighting math
- Source evaluation or confidence methodology
- Calibration comparisons to prior evaluations
- Scoring reasoning or trade-off analysis
- Validation checks
- Finding consolidation audit trail
- Any proprietary methodology details

**Tone:** Authoritative but accessible. A homeowner with no construction background reads this and understands exactly what they're buying and what to expect.

### Back-End Report (Internal / Builder / Content-Prep)

**Audience:** Ray (content preparation), builders generating reports for clients, internal QC.

**Length:** 8-12 pages.

**Contains everything in the front-end report PLUS:**
- Full subscore breakdowns with reasoning for each score
- Component Quality math showing how blended scores were calculated (e.g., cartridge vs spray head weighting)
- Failure pattern documentation with specific sources
- Professional Consensus analysis with competing product citations
- Material Safety detailed assessment (what supports and prevents higher/lower scores)
- Calibration delta showing how scores compare to prior benchmarks
- Mechanical validation checks (certification gate, ceiling rule, weighting verification, double-counting audit, Material Safety independence)
- Finding consolidation audit trail (what was merged, what was moved to Notes, what was dismissed)
- "What we investigated and dismissed" section (claims that were checked and found to be anecdotal or unsupported)
- Competitive positioning detail
- Narrative explanations of scoring decisions written in prose

**CRITICAL — INFORMATION SECURITY ON THE BACK-END REPORT:**

The back-end report is for INTERNAL use and trusted builder partners. It must NOT expose:
- The three-bot architecture or pipeline structure
- Scoring weights (30/40/30 for Reliability, 37.5/37.5/25 for Durability)
- Specific calibration rules by name (Professional Consensus ceiling rule, no-double-counting rule, substrate separation rule)
- Knowledge file contents or structure
- The mechanical validation checklist format
- How the bots interact or that there ARE multiple bots

**What IS acceptable to include:**
- The reasoning behind scores ("we scored Component Quality at 7.75 because the Kerox cartridge is premium but the ABS spray head is a documented weak point")
- Source citations (StarCraft, McAlary, CPSC — these are public sources)
- Competitive comparisons to benchmark products
- The finding consolidation rationale ("these three warranty-related items share the same root concern")
- General statements about methodology ("evaluated against professional sources, manufacturer documentation, and regulatory databases")

**The line:** Show the WHAT and the WHY. Never show the HOW. A competitor reading the back-end report should understand that the evaluation is rigorous and well-sourced. They should NOT be able to reverse-engineer the scoring framework, bot architecture, or calibration methodology.

### Why Two Layers

**For Ray as content creator:** The back-end report is script prep. Load it into NotebookLM, listen to the generated audio, and you can talk about any product on camera without notes. The prose-heavy narrative explanations are specifically designed for NotebookLM audio generation — conversational writing converts to great audio, dense tables don't.

**For builders generating client reports:** The back end is their credibility layer. When a client asks "why did this score a B-minus," the builder pulls up the back end and sees the reasoning. They become the expert in the room without having done the research themselves.

**For NotebookLM optimization:** The back-end report should be written in analyst-briefing prose, not spreadsheet format. Example: "The Component Quality score reflects a genuine tension in this product. The Kerox K-35 cartridge is premium — it's the same cartridge California Faucets uses in faucets costing five times more. But Kraus paired it with an ABS plastic spray head that StarCraft identifies as a constant source of failure complaints..." This narrative style generates excellent training audio.

**For QC and calibration:** The back-end validation section catches scoring drift before it reaches the client. The delta-from-prior-calibration check ensures consistency across evaluations over time.

---

## 14. CATEGORY EXPANSION PLAN

### Phase 1 — Launch Database (14 unique buildouts + consolidations)

**Kitchen:**
1. Cabinets ✅ (6 products calibrated)
2. Countertops 🔨 (Knowledge file v1.0, three bot prompts built, Henry packet ready. Calibration runs next — 6 suggested products across quartz/granite/sintered.)
3. Faucets — kitchen (partially built, needs targeted updates)
4. Sinks — kitchen
5. Appliances — cooking (range/oven)
6. Appliances — dishwasher
7. Appliances — refrigerator

**Bath:**
8. Toilets
9. Tub/shower units
10. Shower fixtures (may fold into faucets framework)

**Surfaces:**
11. Flooring
12. Interior paint

**Envelope:**
13. Windows
14. Roofing (shingle/metal brands, not systems)

**Mechanical:**
15. HVAC
16. Water heaters

**Light coverage (reference tiers, not full buildout):**
17. Interior doors (hollow core vs solid core — half-day build)

**Consolidations running on existing frameworks:**
- Bath cabinets = kitchen cabinet framework
- Bath faucets = kitchen faucet framework
- Bath countertops = kitchen countertop framework

### Phase 2
- Exterior siding (Hardie vs LP SmartSide vs real wood vs engineered vs vinyl)
- Garage door openers (LiftMaster vs Chamberlain vs Genie)
- Exterior doors

### Phase 3
- Lighting fixtures
- Ceiling fans
- Cabinet hardware (outdoor matters more than indoor)
- Garage doors (insulated vs non)

### Cut
- Insulation (application-dependent, not product-comparable)
- Exterior paint (too application-dependent)

### Time Estimates
- Pipeline automation build: 8-12 hours
- Per category buildout: ~6 hours average (gets faster as framework bugs are eliminated)
- 14 real buildouts × 6 hours = ~85 hours of category building
- 500 products × 5 minutes review (post-automation) = ~42 hours
- Total to launch-ready: ~170 hours

---

## 15. TECHNICAL INFRASTRUCTURE

### Current State
- **Claude Projects:** Three bot projects (Consensus, Evaluator, Material Safety) for each active category, with prompts in project instructions and knowledge files uploaded
- **Workflow:** VA starts new chat in each project, pastes product info, bots run sequentially, outputs are manually assembled
- **Airtable:** Database backend for storing evaluations
- **EC2 Instance:** 18.218.122.54 (us-east-2) — Henry bot runs on OpenClaw via this instance with Telegram pairing

### Target State (Pipeline Automation)
- API script chains three bots: Consensus → Evaluator + Material Safety in parallel → assembled output
- Mechanical validation checks built into script:
  - Score spread consistency against calibrated products
  - Professional Consensus ceiling rule compliance
  - Durability weighting calculation verification
  - Material safety substrate separation rule compliance
  - Certification gate check
- Henry on Telegram sends batched reports for Ray's review
- Ray's role shifts from operator (running bots) to editor (reviewing outputs)

### Claude Project Setup (Per Category)
Each category gets three Claude Projects:

1. **Consensus Bot — [Category]**
   - Instructions: Universal consensus bot prompt
   - Files: None (runs lean)

2. **Evaluator Bot — [Category]**
   - Instructions: Universal evaluator bot prompt
   - Files: Category-specific eval_knowledge.md

3. **Material Safety Bot — [Category]**
   - Instructions: Universal material safety bot prompt
   - Files: Category-specific material_safety_knowledge.md

The VA's workflow: Open project → Start new chat → Paste product info → Copy output → Move to next bot.

---

## 16. CALIBRATION DATA (COMPLETED PRODUCTS)

### Faucets (4 products calibrated)

| Product | Reliability | Durability | Overall | Material Safety | Outlook |
|---|---|---|---|---|---|
| Chicago Faucets 786 | A+ (9.7) | A (9.0) | A (9.4) | — | Strong |
| California Faucets Corsano K51-100SQ | A (9.3) | A- (8.6) | A (9.0) | 9/10 | Strong |
| Waterstone 5600 | A- (8.8) | B+ (8.4) | A- (8.6) | — | Stable |
| Kraus Bolden KPF-1610SS | B- (7.45) | D (4.5) | C (5.98) | 6/10 | Conditional |

**Key calibration insights from faucets:**
- Chicago Faucets: Best-built faucet, worst warranty documentation. 5-year cartridge warranty but parts backward-compatible to 1913. Score actual repairability, not warranty paper.
- California Faucets: Best overall package. Kerox cartridge, solid brass, PVD available, strong service, only known brand offering parts AND labor warranty coverage.
- Waterstone: Best body (316 SS), finish technology gaps (no PVD on all finishes). Stable outlook.
- Kraus: Real product, looks good to consumers, but Kerox K-35 cartridge wrapped in ABS plastic spray head (documented failure point), "metal" body (not "brass"), 5-year parts availability with "lifetime" warranty, confirmed parts discontinuation on sister model KPF-1630SS. Masco/Delta affiliate since 2020 ($103M acquisition) but has NOT adopted Delta's warranty terms, parts infrastructure, or manufacturing standards. Conditional outlook.
- Kraus retest insight: Component Quality should show blended math when a product has premium and weak components coexisting (Kerox 9.5 × 55% + ABS spray head 5.0 × 45% = 7.75). The spray head in a pull-down faucet is not a secondary component — it's the primary user-contact component.

### Cabinets (6 products calibrated)

| Product | Overall | Material Safety | Price Level |
|---|---|---|---|
| Timberlake Origins | D (4.7) | 4/10 | Builder |
| Merillat Classic | D (5.3) | 4/10 | Builder-Prod |
| IKEA SEKTION | C+ (6.6) | 5/10 | Budget RTA |
| KraftMaid Base (particleboard) | B- (~7.2) | 5/10 | Price Level 4 |
| Fabuwood Galaxy | B+ (~8.1) | 7/10 | Price Level 2 |
| Crystal Keyline/Encore | A (~8.7) | 9/10 | Price Level 5 |

**Key calibration insights from cabinets:**
- Fabuwood vs Crystal Component Quality: NOT equivalent despite identical hardware (both Blum, dovetail). Crystal manufactures doors in-house with documented catalyzed conversion varnish. Fabuwood's doors are pre-fab overseas with undisclosed finish chemistry.
- KraftMaid Repairability masking: 9.0 repairability was pulling Durability to 7.0, obscuring 6.0 on both Longevity and Materials. Fixed by changing Durability weights.
- IKEA Paradox: Better containment (full melamine) but MDF doors with highest emission limits. Superior sealing offset by inferior substrate on doors. 5/10 = same as KraftMaid.
- Professional Consensus must match what pros actually say: KraftMaid pros say "adequate but buy something else" = 7.0-7.5, not 8.0.

### Windows (7 products calibrated — v1.1 rubrics)

| Product | Config | Overall | Grade | Material Safety | Outlook |
|---|---|---|---|---|---|
| Alpen Zenith ZR-7 | CSM | 8.70 | A- | — | Strong |
| Marvin Elevate | DH | 8.20 | B+ | — | Strong |
| Andersen A-Series | DH | 7.93 | B | — | Stable |
| Internorm KF 410 | CSM | 7.84 | B | 8.5 | Stable |
| Pella Lifestyle Series | CSM | 7.80 | B | — | Stable |
| Pella Architect Series | CSM | 7.80 | B | — | Conditional |
| Andersen 400 Series | DH | 7.47 | B- | — | Stable |
| JW Siteline | DH | 7.00 | B- | — | Conditional |
| JW V-2500 | DH | 5.70 | C | — | Conditional |

**Key calibration insights from windows:**
- Alpen Zenith ZR-7: Passive House certified, triple-pane, top-tier spacer and IGU. Highest performer in calibration set. Sets the ceiling for the category.
- Marvin Elevate: Best traditional luxury option. Ultrex fiberglass + wood interior. Excellent component quality and serviceability. No PHI certification but strong NFRC performance data.
- Andersen A-Series: Flagship domestic production window. Fibrex composite DH. **Corrected March 8, 2026** — prior score 8.12 (B+) revised to 7.93 (B) after 2B Materials Durability correction (7.31→6.80). Durability downgrade was arithmetic error, not product deficiency. Repairability (9.0) and serviceability infrastructure remain industry-leading. The gap vs. Marvin Elevate (0.27 points) now more accurately reflects the Fibrex composite vs. Ultrex fiberglass material difference.
- Internorm KF 410: European import, PHI certified, tilt-turn. First product evaluated under v1.1 rubrics. Performance score jumped +1.87 from v1.0 (7.00→8.87) when EN 12207 Class 4 and PHI U-Factor accepted properly. Material Safety 8.5 — PVC frame with Greenguard Gold, managed concern.
- Pella Lifestyle Series: Premium fiberglass, CSM config. Strong performer, close to Marvin Elevate in overall. Good domestic serviceability.
- Pella Architect Series/Reserve: Aluminum-clad wood CSM. Score 7.80 (B), Conditional outlook. Performance standout: AI 0.05 cfm/ft² (score 10), CW50 structural (score 10). Durability suppressed by wood rot class action (MDL 1:13-F-02514, 2014). Post-2012 design revisions unverified by independent source — Conditional outlook until confirmed. Ties Pella Lifestyle at 7.80 despite being a tier above it; validated by component transparency gaps (spacer type, glazing bead, weatherstripping attachment all undisclosed) holding Quality to 7.0.
- Andersen 400 Series: Primary calibration anchor. DH config. The "builder grade adjacent" product that most consumers consider an upgrade. Fibrex composite — proprietary material, serviceability penalty applies. Score reflects real-world limitations.
- JW Siteline: Entry-level Jeld-Wen wood-clad. Wholesale-to-dealer business model. Yellow Finding: HWE (Harvest West Elm) involvement — brand eval automatic Yellow Finding per Rule 11-B.
- JW V-2500: Builder-grade vinyl. Sets the floor for the calibration set. Lowest component quality, minimal serviceability, thin data on independent performance verification.

**Windows-specific calibration rules established:**
- PHI/PHIUS U-Factor: Tier 1 source, no penalty. Score 9-10 range.
- EN 12207 Class 4 air infiltration: Scores 10 (0.034-0.036 cfm/ft² equivalent). Class 3 floor = 7.
- CE structural class scale: Class 5=8, Class 4=7, Class 3=6, CE only (no class)=5, no cert=4.
- Delta-T penalty: -0.5 for CE-only products (was -1.0 in v1.0). PHI: no penalty.
- Principle 13: Highest certified standard governs when multiple certs cover same metric.
- Principle 14: Geographic trust filter — EU/US/Canada/UK accepted; China CCC and Russia GOST not accepted.
- Jay Johnson 404 Rule: A missing URL from Jay Johnson's site is not a data gap for European products. Absence finding only for US-market active products.
- HWE Enforcement Rule: Brand eval = automatic Yellow Finding. Not a performance metric penalty.

---

## 17. AI TRANSFER TEST RESULTS

On February 28, 2026, the system bible was given to a separate AI instance (not the one that built it) to test whether the documentation was sufficient for a cold-start AI to run the evaluation pipeline independently.

### Test Product
Kraus KPF-1610SS Bolden — chosen because it's the product that proves whether the system catches problems, not just praises good products.

### Results Summary
The test AI produced a complete evaluation across three iterations (initial, feedback, corrected final). Key outcomes:

**What transferred successfully on first attempt:**
- Certification gate check fired first (including NSF/ANSI 372 which was only recently added)
- Marketeer classification applied correctly
- Professional Consensus ceiling rule triggered and applied
- Durability weighting (37.5/37.5/25) calculated correctly
- No double-counting across subscores
- Material Safety scored independently
- Benchmark comparison against calibrated products included
- Bottom line narrative was honest and fair to both the product's strengths and weaknesses
- Caught the 5-year parts discontinuation on sister model KPF-1630SS

**What required correction (took 2-3 iterations):**
- Finding consolidation: initially produced 7 findings, needed to be pushed to 4 consolidated root concerns. The consolidation rules were in the bible but the AI didn't apply them aggressively enough on first pass.
- Unverified claims: stated Kraus was a Masco/Delta subsidiary without citing a source. When challenged, it found and cited the actual SEC filing, press release, and Kraus announcement — the claim was correct, just unsourced initially. Lesson: the bible should emphasize that ALL business model and corporate structure claims must be sourced.
- Lifespan scenario specificity: gave generic adverse/median/best case labels without tying them to conditions. When told to tie them to water chemistry and usage patterns, it did so correctly.
- Component Quality blending: scored 8.0 without showing math. When pushed, it produced a defensible 55/45 cartridge-to-spray-head weighting with explicit reasoning. The math should be shown in every evaluation.
- Body/spout leak claim: initially cited as a second failure cluster, later corrected to anecdotal after being challenged. Lesson: the distinction between documented widespread patterns and individual anecdotal reports needs reinforcement.

**What the test AI added that we hadn't built:**
- Mechanical validation section with inline checks (score spread, weighting math, double-counting audit, ceiling rule compliance, calibration delta). This was essentially a lightweight adversarial bot running as part of the report assembly. Worth incorporating permanently.
- NSF/ANSI/CAN 61 Q ≤ 1 (2024 revised, 5× stricter lead criterion) as a check — needs verification but if real, should be added to the knowledge file.
- Explicit "Findings Removed or Folded" audit trail showing what was consolidated and why.

### Final Scores vs Prior Calibration

| Axis | Prior Calibration | Test AI (Corrected) | Delta |
|---|---|---|---|
| Reliability | B (7.5) | B- (7.45) | -0.05 |
| Durability | D (5.0) | D (4.5) | -0.5 |
| Overall | C (6.0) | C (5.98) | -0.02 |
| Material Safety | — | 6/10 | New |
| Outlook | Conditional | Conditional | Match |

The Reliability delta of 0.05 is within rounding. The Durability delta of 0.5 is attributable to the documented KPF-1630SS parts discontinuation case providing concrete evidence for lower Repairability scoring. Overall lands at essentially the same place.

### Key Takeaway
The system bible successfully transfers. A cold-start AI reached calibration-quality output within 3 iterations. The areas requiring correction (finding consolidation, source verification, showing math) suggest these should be emphasized more prominently in the bible or reinforced in the bot prompts.

### Rules to Reinforce Based on Transfer Test
1. **All corporate structure and business model claims must cite a specific source.** No "reportedly" or "believed to be."
2. **Component Quality must show blended math** when a product has components at different quality tiers. The formula and weighting rationale should be visible in every back-end report.
3. **Failure pattern claims must distinguish documented widespread patterns from individual anecdotal cases.** One Reddit post is not a pattern. Three independent reports of the same failure mode is.
4. **Finding consolidation should be aggressive.** Default to fewer consolidated findings, not more. When in doubt, merge.
5. **Mechanical validation checks should be standard** in every back-end report (score spread, weighting math, ceiling rule compliance, double-counting audit, calibration delta).

---

## 18. KNOWN GAPS AND PENDING IMPROVEMENTS

### Faucet System Updates Needed

1. **Labor warranty coverage** — Add as explicit factor in Repairability & Support. Distinguish parts-only vs parts-plus-labor. Currently not scored anywhere.

2. **NSF/ANSI 372 (lead-free)** — Add to red flag checklist. Currently missing.

3. **Certification gate check** — Reposition certification verification as a FIRST action, not a finding discovered mid-evaluation. Include insurance liability framing.

4. **Plastic stems as explicit durability flag** — Currently a bullet point under Materials. Should be elevated to a specific red/yellow flag: plastic stem = disposability signal.

5. **Business model → parts lifecycle rule** — Exists in pieces. Needs explicit statement: Manufacturer-owned designs = 20+ years parts. Premium assembler = effectively indefinite. Marketeer = 3-7 year window.

6. **Proprietary vs standard parts scoring** — Partially covered through cartridge identification. Should explicitly score in Repairability: faucet using standard Kerox cartridge (sourced through multiple channels) vs proprietary cartridge (single source, no alternatives).

### System-Wide Updates Needed

7. **Evaluator Bot output format update** — Needs to output letter grades + outlook modifier instead of decimal scores + colored flags. Prompt partially updated but not finalized across all category versions.

8. **Report templates** — Two-layer structure defined (Section 13): front-end client report (~2 pages) and back-end internal report (8-12 pages). Structure and information security rules are documented. Actual templates for both layers have not been built yet. The Kraus corrected evaluation serves as a working prototype for the back-end report. Front-end template needs to be designed and tested.

9. **Cross-category consistency** — As more categories are built, scoring calibration needs cross-checking. An A in faucets should represent comparable quality confidence as an A in cabinets.

### Value Context System Updates Needed

10. **Value Indicator calibration** — The five-level Value Indicator scale (Exceptional through Poor) needs formal thresholds defining how many score points above/below price tier expectations triggers each level. Current examples (Fabuwood = Exceptional, KraftMaid = Weak) are intuitive but not yet formalized as rules.

11. **Construction cost per sqft lookup table validation** — The expected score ranges by construction cost tier (Section 6) are estimated from calibration experience. Need to validate against real Austin-area builds as proprietary allocation data accumulates. RSMeans available as cross-reference.

12. **Production vs Custom report templates** — The Two-Layer Report Structure (Section 13) needs separate template variants for Production and Custom reports. Asset Class Context narrative, NAHB reference framing, and Value Indicator presentation differ between the two report types.

13. **Builder database infrastructure** — Community record structure is defined (Section 6) but the actual database has not been built. Needs: data entry workflow, allocation percentage auto-calculation, tier segmentation logic, and confidence threshold tracking (10/25 spec sheet milestones for NAHB replacement).

14. **Proprietary allocation data pipeline** — The spec-sheet-to-allocation-percentage calculation needs to be formalized. Define exactly which line items from a builder spec sheet map to which evaluation categories. Handle bundled items (e.g., builder quotes "kitchen package" without breaking out cabinets vs countertops vs appliances separately).

### Material Safety Investigation Framework — Gaps

15. **Healthy Homes Radar — initial product coverage audit** — For each evaluated category, audit which products have existing Declare labels, C2C Material Health Certificates, or Greenguard certifications. This determines how many products can be scored via Step 1 (product-level evidence) vs Step 2 (calibrated rules) vs Step 3 (human review flag). Start with countertops as the pilot category.

16. **Countertop calibration — COMPLETE (6/6 products).** Knowledge file v1.0 complete. Three bot prompts built (Consensus v1, Evaluator v1 — Material Safety v1 superseded by universal Material Safety Bot v2). All six calibration products run and scored with fourteen calibration rules (Rules 1-14). Products: Cambria Brittanicca (A, 9.28), Dekton Aura 15 (A-, 8.94), Caesarstone Calacatta Maximus (B+, 8.46), Ubatuba Granite (B+, 8.33), MSI Q Premium (B, 7.95), White Ice Granite (B, 7.84). All Material Safety scores finalized at 9.5 (certified products with no credible flags) or 9.8 (Dekton — sintered stone, no resin, no sealers, headroom reserved for brand differentiation). Remaining knowledge gaps: Breton manufacturing verification, sealer taxonomy expansion, fabricator quality markers, full mislabeled stones list, species-by-species butcher block hierarchy.

17. **Faucet Material Safety Bot rerun (COMPLETE)** — Material Safety Bot v2 (flag-hunting) replaces v1 (gap-hunting) across all categories. All six calibrated faucet products rescored under v2 philosophy. Results: Waterstone 9.8 (stainless steel contacts eliminate brass leaching pathway), all other certified products 9.5 (no credible health flags). Certification Floor Rule (Rule 15) established. Cross-category pattern confirmed: Material Safety differentiates material classes, not brands within a class when all are certified.

18. **Front-end report template** — Back-end report structure is proven (Cambria calibration run). Front-end buyer-facing report (2-3 pages) needs to be designed — format, tone, level of detail. Should read like a sharp product review, not a research paper.

19. **Universal Material Safety Bot v2 prompt** — Standalone prompt file built. Needs to be integrated into Henley's countertop category packet (replacing the countertop-specific Material Safety Bot v1 prompt). Also needs to replace faucet Material Safety Bot v2 prompt. This is now a UNIVERSAL prompt — same prompt works across all categories, with category-specific rules coming from the knowledge file.

---

## 19. KEY PRINCIPLES AND PHILOSOPHY

### On Scoring
- Be honest. A 5 is not a bad score — it means "acceptable with caveats."
- Defend the gap between a score and 10 with specific reasons a homeowner would care about.
- Score the PRODUCT, not the brand reputation. Never inflate for famous brands. Never deflate for unknown brands.
- Price does not affect the score directly. The Value Indicator (Section 6) communicates price-to-quality ratio as a separate field — never as a score modifier.
- A product with high reliability and low durability tells an important story: "It works while it works, but it won't last long and you can't fix it." State this clearly.

### On Confidence
- If the Consensus Bot flags "Low confidence — limited data," the report says so. Honest confidence calibration protects the brand better than a confident-sounding answer built on weak evidence.
- The first few reports in a new category will be less precise than mature categories. That's acceptable. They'll still be more rigorous than anything else available.
- Each report makes the next one better. The database compounds.

### On Independence
- Three-bot independence is non-negotiable. The bots must not see each other's output during evaluation.
- In volume production, independence must be structural (separate subagent instances), not performed (single conversation with instructions to ignore prior output). See Section 3 for phasing rules.
- The Material Safety score must remain independent from construction quality scores. Buyers who care about health read it; buyers who don't, skip it. Nobody's overall score is affected by health concerns they may not weight.
- Assembly logic flags divergence between passes. Disagreement is signal, not noise.

### On Value Context
- The quality score answers "how good is this?" The Value Indicator answers "is this good for the price?" These are different questions and must remain separate fields.
- Never adjust a quality score because a product is a good deal or overpriced. A B+ is a B+ regardless of what it costs.
- Asset Class Context gives buyers a frame of reference, not a judgment. "Products in this tier typically score C to B-" is context. "This product should score higher because of the price" is contamination.
- Geographic normalization uses construction cost per square foot, not home sale price. Land premiums are noise for product quality evaluation.
- Production and custom reports use different economic mechanics. Never compare them on price per foot.

### On The Human Layer
- The AI can research, score, and run rules. It cannot know that an import assembler shouldn't match a domestic manufacturer on component quality — Ray knows that because he grew up framing houses.
- The calibration process requires Ray pushing back on scores that don't feel right. This must happen for every new category launch.
- The adversarial verification bot will eventually automate some QC, but domain judgment remains human.

### On The Competitive Moat
- Knowledge files contain proprietary scoring frameworks, not just public information
- Calibration data compounds — every product scored creates a benchmark for the next
- Line-level specificity (not brand-level) produces intelligence nobody else has
- The health/toxicity layer is a differentiator no competitor offers
- After 50 reports in a category, The Residentialist IS the independent authority for that category

### On What This Isn't
- This is not Consumer Reports (they test user experience — spray coverage, flow rate, noise)
- This is not a review site (no consumer reviews, no star ratings from buyers)
- This is not brand evaluation (it's product-at-configuration evaluation)
- This is not a recommendation engine (it scores and explains — the buyer decides)

---

## APPENDIX A: PROMPT VERSION HISTORY

- **Consensus Bot v1:** Initial framework with research structure and output format.
- **Consensus Bot v2 (current for faucets):** Added certification gate check as STEP 0 (cUPC, NSF/ANSI 61, NSF/ANSI 372), insurance liability framing, requirement to cite sources for business model claims, labor warranty in WARRANTY STRUCTURE, failure pattern sourcing requirements.
- **Evaluator Bot v1:** Initial framework, equal Reliability/Durability weighting, no calibration rules
- **Evaluator Bot v2:** Added calibration rules (no double-counting, category scoring, application-specific cartridge). Tested with California Faucets and Kraus.
- **Evaluator Bot v3:** Added Calibration Watch List, fixed Repairability & Support to weight actual repairability over warranty paper, added finding consolidation rules, added Yellow finding buyer-impact filter.
- **Evaluator Bot v4 (current for faucets):** Fixed Durability weights to 37.5/37.5/25 (was 35/30/35). Added: business model → parts lifecycle rule, Component Quality blended math requirement, plastic stems as durability flag, labor warranty as explicit Repairability factor, proprietary vs standard parts scoring, expected lifespan tied to conditions, Professional Consensus ceiling rule. All rules from v3 retained.
- **Evaluator Bot — Cabinets (current):** Adapted framework for cabinets. Professional Consensus ceiling rule added. Durability reweighted (37.5/37.5/25). Substrate separation rule in Material Safety Bot.
- **Material Safety Bot v1:** Initial framework for faucets.
- **Material Safety Bot v2 (current for faucets):** Added certification hard gate (score cannot exceed 4/10 if missing primary certs), NSF/ANSI/CAN 61 Q ≤ 1 (2024 revised) check, explicit score defense requirements (what supports AND what prevents higher), ABS spray head formulation opacity guidance.
- **Material Safety Bot — Cabinets:** Added substrate category minimum separation rule, score equivalence justification rule.
- **Countertop Knowledge File v0.1:** Initial framework — 10 Material Class Profiles (Engineered Quartz, Granite, Quartzite, Marble, Solid Surface, Sintered Stone, Laminate, Butcher Block, Concrete, Stainless Steel). Two-layer evaluation structure (Material Class Profile not ranked + within-class product scoring). Mislabeled Stone Rule. No Cross-Class Ranking Rule. Countertop-specific Material Safety rules per material class. Awaiting source list and calibration.
- **v4.5 (March 3, 2026):** Material Safety Bot v2 — STRUCTURAL REFRAME. Bot's core question changed from "How close to theoretical chemical perfection?" to "Has anyone credible identified a health concern?" Flag-hunting replaces gap-hunting. Three-tier output: Rated (score 1-10), Not Rated with Manufacturer Confidence Profile, Not Rated with Insufficient Information. Six new calibration rules from Cambria Brittanicca first run: Benchmark Ceiling (Rule 7), Certification Sufficiency (Rule 8), Class-Universal Issue (Rule 9), Complaint Scale (Rule 10), Transparency Leader (Rule 11), Material Safety Reframe (Rule 12). Added European certifications to recognized list: EU REACH, German Blue Angel, French A+, Nordic Swan, CE Marking. Added Green Science Policy Institute to Healthy Homes Radar. Universal Material Safety Bot v2 prompt built as standalone file. Cambria Brittanicca rescored: Quality 8.75→9.41, Durability 8.65→9.15, Material Safety 8.0→9.5. Faucet Material Safety Bot flagged for rewrite and rerun under v2 philosophy.
- **v5.0 (March 7, 2026):** Windows calibration COMPLETE — 7 products scored under v1.1 rubrics. Full Windows evaluation system in Appendix D. Major rubric updates from council Items 10/11/12:
  - **Item 10-A:** PHI/PHIUS certified U-Factor is Tier 1 source — no approximation penalty. EN 673 (lab standard, not field standard) gets +0.02 delta-T adjustment.
  - **Item 10-B:** EN 12207 Class 4 air infiltration accepted as AI input. Correct conversion: ~0.034–0.036 cfm/ft² = score 10. Class 3 certification floor = 7. (Prior v1.0 conversion of 0.10–0.16 cfm/ft² was wrong — superseded.)
  - **Item 10-C:** CE structural certification floor raised to class-based scale: Class 5=8, Class 4=7, Class 3=6, CE only (no class)=5, no cert=4.
  - **Item 10-D:** Delta-T penalty reduced from −1.0 to −0.5 for CE-only products. PHI certified: no penalty.
  - **Item 10-E (Principle 13):** Highest certified standard governs when multiple certifications cover the same metric.
  - **Item 10-F (Principle 14):** Geographic trust filter — EU/US/Canada/UK certification bodies accepted. China CCC and Russia GOST not accepted.
  - **Item 11-A:** Full three-tier source hierarchy formalized for windows (Jay Johnson Tier 1A → NFRC/AAMA Tier 1B → manufacturer spec Tier 2 → third-party installer Tier 3).
  - **Item 11-B:** Jay Johnson 404 Rule — missing URL from Jay Johnson's site is NOT a data gap for European imports. Absence finding only for US-market active products.
  - **Item 11-B:** HWE Enforcement Rule — Brand evaluation = automatic Yellow Finding. Not a performance metric penalty.
  - **Item 11-C/D:** Four-criterion standard for future source assignment established.
  - **Item 12-A:** Certification tier hierarchy finalized: Tier 1 = Declare/C2C; Tier 2 = Greenguard Gold/Section 01350/SCS; Tier 3 = VinylPlus/FSC/WDMA; Noise certs = Prop 65/Title 24/CARB.
  - **Item 12-B:** Material Safety source tier hierarchy with peer-reviewed literature split rule (consumer vs. manufacturing exposure).
  - **Item 12-C:** Corinne Segura special rule — Tier 1 with corroboration requirement. Segura-only = investigation flag only, no score impact.
  - **KF 410 rescore:** Internorm KF 410 rescored under v1.1 — Performance 7.00→8.87, Overall 7.22→7.84 (B-→B), Material Safety 8.8→8.5. Changes driven by PHI U-Factor accepted (no penalty), EN 12207 Class 4 now scores 10, Jay Johnson Yellow Finding removed (European import, absence expected).
  - Windows calibration table: 7 products from Alpen Zenith A- (8.70) to JW V-2500 C (5.70). Full range from Passive House certified to builder-grade vinyl.

- **v4.8 (March 4, 2026):** Windows category build INITIATED — both knowledge files at v1. Eval Knowledge v1 built from 47 Jay Johnson (WindowPurchase.com) transcripts + previous research. Covers: NFRC vs AAMA/FGIA dual-rating system, frame material taxonomy (wood, wood-clad, vinyl, fiberglass, composite, aluminum), component-level evaluation points from Jay Johnson (casement hardware, pivot bars, weather stripping, glazing beads, lift rails, sash depth, locking systems, patio door inset depth), glass package evaluation (IGU construction, edge deletion, spacer systems, Low-E coatings), seal failure as primary long-term failure mode, warranty evaluation framework, exterior finish evaluation (foils vs paint vs capstock, Delta E, dark color caution), SHGC debunking, business model classification (true manufacturer vs wholesale-to-dealer), performance tiers (Tier 1 traditional luxury through Tier 4 builder-grade), six calibration products recommended (Marvin Ultimate, Zola Thermo Clad, Alpen Zenith, Pella 250, Andersen 400, Gilkey). Material Safety Knowledge v1: no StarCraft equivalent exists for windows (gap category). PVC off-gassing = Managed Concern / Yellow Advisory. Spray foam gap fill = Active Flag / Yellow Finding via Rule 13. Certification Floor applied: Greenguard Gold + no flags = 9.5, vinyl without emissions cert = 8.8, vinyl with Greenguard Gold = 9.2. Jay Johnson elevated to category-specific evaluation authority (component taxonomy, not material safety). 185 additional transcripts pending — v2 update planned. Three production-ready categories (Countertops, Faucets) + one in-progress (Windows).
- **v4.7 (March 3, 2026):** Faucet Material Safety v2 rerun COMPLETE — all six calibrated faucet products rescored under flag-hunting philosophy. New calibration rule: Certification Floor Rule (Rule 15) — certified products with no credible health flags start at 9.5; exceeded only when product eliminates class-level exposure pathway (stainless steel contacts, sintered stone). Faucet v2 scores: Waterstone 9.8, California Faucets 9.5, In2aqua 9.5, Pfister 9.5, American Standard 9.5, Kraus 9.5. Cross-category pattern validated: countertops and faucets both show Material Safety differentiating material classes, not brands within a class. Known Gaps item 17 marked COMPLETE. Two production-ready categories: Countertops (6 products, 14 calibration rules) and Faucets (6 products, 15 calibration rules).
- **v4.6 (March 3, 2026):** Countertop calibration COMPLETE — all six products scored. Two new calibration rules: Adjacent Product Rule (Rule 13) — Material Safety scores the product, not companion products; PFAS sealer concern for granite becomes Yellow Finding advisory, not score impact. Certification Tier Rule (Rule 14) — no docking for certification tier differences when both tiers confirm concern is managed. Material Safety scores revised: Ubatuba 7.5→9.5, White Ice 7.0→9.5, Caesarstone 9.0→9.5, MSI 9.0→9.5, Dekton 10→9.8 (headroom reserved for sintered stone brand differentiation). Final calibration table: Cambria A/9.28, Dekton A-/8.94, Caesarstone B+/8.46, Ubatuba B+/8.33, MSI B/7.95, White Ice B/7.84. Known Gaps item 16 updated to COMPLETE.
- **v4.4 (March 3, 2026):** Countertop Knowledge File upgraded to v1.0 — Greenguard Gold certification mechanics (pass/fail limitation, 220 μg/m³ threshold, no semi-VOC coverage, brands carrying it), PFAS in stone sealers (exposure pathway, confirmed PFAS-free alternatives, scoring rules), Habitable/Informed countertop product guidance integration, antimicrobial marketing rule (no credit), low-silica manufacturing vs consumer distinction, recycled content caution, Material Safety Baseline Orientation table. Added Corinne Segura / My Chemical-Free House to Healthy Homes Radar as BBI-certified category-specific Material Safety authority for countertops. Updated Greenguard/UL entry with detailed threshold information. Built three countertop bot prompts (Consensus v1, Evaluator v1, Material Safety v1) in Henry Packet. Added Appendix C for countertop evaluation system. Suggested first 6 calibration products. Countertop category ready for calibration runs.

---

*Last updated: March 8, 2026 (v6.0 — A-Series 2B correction, Pella Architect added, Challenge Bot v2, bot_orchestrator.js built.)*
*This document should be updated whenever new categories are calibrated, new rules are added, or structural changes are made to the evaluation pipeline.*

- **v6.0 (March 8, 2026):** Windows calibration table updated — Andersen A-Series DH added at corrected score (7.93 B), Pella Architect Series CSM added (7.80 B, Conditional). A-Series 2B correction: prior score 7.31 invalid (exceeds Composite/Fibrex max of 7); corrected to 6.80 per documented path (base 6 + published data − glazing bead serviceability + dual seal + judgment). Durability drops 8.56→7.99, Overall drops 8.12→7.93 (B+ → B). Reweighting deferred — Marvin-Andersen gap now 0.27 points; current 37.5/37.5/25 weights remain in effect. Council rulings: (1) Material hierarchy = base scores not ceilings (3-0 unanimous). (2) Pella Architect 2B arithmetic valid (base 8, +1 extruded, -1 wood rot, net 8.1). (3) Challenge Bot Check 1 false positive confirmed and fixed in Challenge Bot v2 — now checks NET FINAL 2B only, not intermediate arithmetic. Rubric v6 issued with five documentation actions: base score clarification language, tier overlap acknowledgment, A-Series FLAG scope note, Pella Lifestyle transparency notation, Architect CSM calculation path shown. Bot Orchestrator v1 built — sequences Bot 1→2→3→4 with FLAG gate. Six-bot architecture approved; Bots 5 and 6 pending.
- **v5.0 (March 7, 2026):** Windows calibration COMPLETE. 7 products scored under v1.1 rubrics. Major rubric updates from council Items 10/11/12: PHI/PHIUS Tier 1 source, EN 12207 Class 4 = score 10, CE class-based structural scale, geographic trust filter, Jay Johnson 404 Rule, HWE enforcement, Corinne Segura special rule. KF 410 rescored 7.22→7.84. Full Windows evaluation system in Appendix D. Three production-ready categories: Faucets, Countertops, Windows.

## APPENDIX B: COMPLETE FAUCET EVALUATION PROMPTS AND KNOWLEDGE FILES

These are the production-ready prompts and knowledge files for running faucet evaluations. If you are an AI running evaluations from this bible, use these exact prompts. They incorporate all calibration fixes, rule additions, and lessons from the AI transfer test.

**Version:** v4.3 (March 3, 2026)
**Status:** Production-ready for faucets

---

### B1. CONSENSUS BOT — PLUMBING FIXTURES (v2)

```markdown
# Consensus Bot — Plumbing Fixtures

## Your Role
You are the Consensus Bot for The Residentialist, a product intelligence service. Your job is to research what professionals, repair technicians, and independent testers say about a specific plumbing fixture product. You are the RESEARCH layer — you gather what the field thinks. You do not score products. You do not make recommendations. You gather evidence.

## When Given a Product

### STEP 0: CERTIFICATION GATE CHECK (ALWAYS FIRST)
Before doing ANY product research, verify the following three certifications. This is the first action for every evaluation — not a finding discovered mid-research.

**Required certifications (all three must be present):**
1. **cUPC** (ASME A112.18.1 / CSA B125.1) — Legal to install. Verified by IAPMO or CSA.
2. **NSF/ANSI 61** — Safe materials in contact with drinking water.
3. **NSF/ANSI 372** — Lead-free compliance (≤0.25% weighted average).

**How to verify:**
- Check IAPMO UPC product listing directory
- Check manufacturer documentation and spec sheets
- Check retailer listings (Ferguson, QualityBath) for certification badges
- If certifications are claimed but cannot be independently verified, note as "Claimed, unverified"

**Gate results:**
- **CLEAR:** All three certifications confirmed from verifiable sources. Proceed to full evaluation.
- **CONDITIONAL:** One or more certifications claimed but not independently verified. Proceed with evaluation but flag as Yellow Finding.
- **FAIL:** One or more certifications missing or confirmed absent. This is a RED FINDING. Complete the gate check documentation but note that this product carries installation risk.

**Insurance liability framing:** A faucet installed without proper cUPC certification may void homeowner's insurance coverage for water damage claims. This is not a theoretical concern — insurance adjusters verify certification status during claims processing. Missing cUPC = potential claim denial for any water damage from the fixture.

**Report gate results at the top of your output before any other research.**

### STEP 1: Research Professional Consensus
Search for professional consensus on the product's reliability, build quality, and common failure modes. Prioritize:
- Independent tester findings (StarCraft Reviews, MaP Testing)
- Repair technician forums (TerryLove.com, plumbing contractor discussions)
- Professional plumber opinions and field reports
- Building science sources
- Avoid consumer review sites (Amazon, Home Depot reviews, Reddit homeowner posts). These are noise, not signal.
- Consumer review platforms may be consulted ONLY for failure-mode identification when professional sources are insufficient. If used, note that explicitly and do not treat consumer reports as authoritative.

### STEP 2: Identify the Manufacturer's Business Model Type
Classify the manufacturer AND cite your evidence for the classification:
- **Manufacturer** — Designs, engineers, and builds their own products with proprietary components. Evidence: own factory address, own component designs, vertical integration documentation.
- **Assembler** — Builds products from third-party components in their own facility. Evidence: factory location confirmed, but components sourced from known suppliers.
- **Specifier** — Designs products but outsources all manufacturing. Evidence: design in one country, manufacturing in another, QC protocols documented.
- **Marketeer** — Buys finished products from OEM factories and applies their brand. Evidence: no factory, import records show OEM sourcing, StarCraft or trade publication identification.
- **Retail Rebrander** — Relabels existing products under a store brand.

**CRITICAL: All business model classifications must cite at least one specific source.** Do not classify based on assumption. If you cannot verify the business model, state "Unverified — insufficient public documentation" and note what evidence is available. An incorrect business model classification undermines the entire evaluation.

**Corporate ownership:** If the brand has been acquired by or is a subsidiary of a larger corporation, document this with the specific source (SEC filing, press release, trade publication). Note whether the acquisition has changed the brand's warranty terms, parts infrastructure, or manufacturing standards.

### STEP 3: Document Product Details
- What cartridge technology does it use? (Flühs, Kerox, Geann, generic ceramic disc, other)
- What is the body material? (Solid brass, lead-free brass, ZAMAK/zinc alloy, plastic, stainless steel, ambiguous "metal")
- What are the known common failure modes?
- What do repair technicians say about parts availability and serviceability?
- Are there any known quality control issues or batch defects?
- What is the general professional reputation of the brand?

## Output Format
Structure your response exactly as follows:

PRODUCT: [Full product name and model]
BRAND: [Brand name]
BUSINESS MODEL TYPE: [Manufacturer / Assembler / Specifier / Marketeer / Retail Rebrander] — [Source for classification]
CORPORATE PARENT: [If applicable — parent company, acquisition date, source]

CERTIFICATION GATE CHECK:
- cUPC: [PASS / FAIL / Unverified] — [Source]
- NSF/ANSI 61: [PASS / FAIL / Unverified] — [Source]
- NSF/ANSI 372: [PASS / FAIL / Unverified] — [Source]
- Gate Result: [CLEAR / CONDITIONAL / FAIL]
- Insurance Note: [If FAIL or CONDITIONAL, note the liability implication]

PROFESSIONAL CONSENSUS:
[2-4 paragraphs summarizing what the professional field says about this product. Cite specific sources where possible — "StarCraft teardown found..." or "Multiple technicians on TerryLove report..."]

KEY COMPONENTS:
- Cartridge: [Type and manufacturer if known — cite source for identification]
- Body Material: [Material and any concerns — note if spec sheet is ambiguous]
- Finish: [Type and durability notes]
- Other Notable: [Anything else relevant — spray head material, stem material, connector types]

FAILURE MODE ANALYSIS:

Product-Specific Failures:
[Consolidate related failures into single entries. Two symptoms of the same component failing = one failure, not two. For each, note:]
- [Failure description — which component, what happens]
- Severity: [Critical / Moderate / Minor / Trivial]
  - Critical: Renders product non-functional or creates safety risk
  - Moderate: Impairs core function, requires professional repair or part replacement
  - Minor: Cosmetic or partial function loss, simple fix
  - Trivial: Nuisance only, user-fixable in minutes with basic tools
- Prevalence: [Widespread / Some Units / Rare / Isolated Reports]
- Timeline: [When does this typically appear?]
- Source: [Where this failure is documented]
[If none: "No product-specific failures documented."]

**IMPORTANT: Distinguish documented widespread patterns from individual anecdotal cases.** One Reddit post describing a failure is anecdotal. Three independent reports of the same failure mode from different sources is a pattern. Label accordingly.

Category-Universal Maintenance:
[Issues that affect ALL products in this category, not specific to this product.]

Not Documented:
[Explicitly state what HASN'T been found. Absence of failure data is positive reliability evidence.]

PARTS & SERVICEABILITY:
[Can a homeowner or plumber get replacement parts? Are cartridges proprietary or independently sourceable? How does the manufacturer handle out-of-warranty support?]
- Cartridge sourcing: [Proprietary (manufacturer-only) / Standard (independently sourceable) / Unknown]
- Parts channels: [Manufacturer-direct, dealers, hardware stores, third-party]
- Post-warranty behavior: [Does manufacturer support products beyond warranty period? Any documented cases?]

WARRANTY STRUCTURE:
[Consolidate ALL warranty information into this single section.]
- Body/Structure: [Duration]
- Cartridge: [Duration — note if below lifetime industry standard]
- Finish: [Duration — note if below lifetime industry standard]
- Other components: [Duration and which components — flag any high-failure component with short warranty]
- Labor coverage: [Yes / No / Partial — this is a significant differentiator]
- Transferable: [Yes / No]
- Parts availability guarantee: [Duration, or note if backward-compatible/unlimited]
- Industry comparison: [One sentence — how does this warranty compare to residential industry standard?]
- Buyer impact: [One sentence — what does this mean practically for the homeowner?]

RED FINDINGS:
- [Safety, legality, or disqualifying concerns — ZAMAK confirmed in water path, missing required certifications, contraband status, active recalls, documented health hazards]
- [If none: "No red findings."]

YELLOW FINDINGS:
- [Gaps, weaknesses, or opacity that NEGATIVELY AFFECT THE BUYER]
- ONLY include findings that a homeowner would need to weigh before committing.
- DO NOT list individual warranty durations as separate findings. If warranty is below standard, list ONE consolidated finding.
- Each finding must pass this test: "Would a homeowner change their mind or negotiate differently because of this?" If no, move to NOTES.
- [If none: "No yellow findings."]

SOURCES CONSULTED:
- [Source 1 — what it contributed]
- [Source 2 — what it contributed]

CONFIDENCE LEVEL: [High / Medium / Low — based on how much independent data exists]
NOTES: [Anything the Evaluator Bot should know that doesn't fit above]

## Critical Rules
- You are gathering EVIDENCE, not making judgments. The Evaluator Bot scores. You research.
- **CERTIFICATION GATE CHECK IS ALWAYS STEP 0.** Before you research anything else, verify cUPC, NSF/ANSI 61, and NSF/ANSI 372.
- **All business model and corporate structure claims must cite specific sources.** No "reportedly" or "believed to be."
- Prioritize what TECHNICIANS and INDEPENDENT TESTERS say over what CONSUMERS say.
- **Consolidate related failures.** Same component, same root cause = ONE failure with multiple symptoms.
- **Distinguish patterns from anecdotes.** Label failure prevalence honestly based on source count and independence.
- **Separate product-specific failures from category-universal maintenance.**
- **State what ISN'T failing.** The "Not Documented" section is critical.
- **Weight severity honestly.** A set screw is Trivial. A spray head leak is Moderate.
- **Filter findings through the buyer's lens.** Every yellow finding should affect a buying decision.
- **All warranty information goes in WARRANTY STRUCTURE.** Include labor coverage explicitly.
- **Exclude regulatory noise.** Prop 65 labels on compliant products are not findings.
- Never rely on manufacturer marketing claims as evidence. Note them only to flag discrepancies.
- The lens is always: "What would a homeowner need to know about this product BEFORE committing to it?"
```

---

### B2. EVALUATOR BOT — PLUMBING FIXTURES (v4)

```markdown
# Evaluator Bot — Plumbing Fixtures

## Your Role
You are the Evaluator Bot for The Residentialist, a product intelligence service. Your job is to SCORE products on reliability and durability using the Consensus Bot's research output and your knowledge files. You are the ANALYSIS layer — you take evidence and produce structured scores with reasoning. You do not research. You evaluate.

## Input
You will receive the Consensus Bot's research output for a product. This includes certification gate results, professional consensus, key components, common failure modes, parts/serviceability assessment, warranty structure, findings, and source information.

## CRITICAL CALIBRATION RULES

### Rule 1: Score Within Product Category
Always score a product against others in its specific product category. A pull-down kitchen faucet is scored against other pull-down kitchen faucets — NOT against fixed-spout faucets, lavatory faucets, or any other category. Every product category has inherent design characteristics (a pull-down has more moving parts than a fixed spout). These are category realities, not product flaws. Ask: "Is this among the best pull-down kitchen faucets available?"

### Rule 2: Cartridge Selection Is Application-Specific
The cartridge tier list (Flühs → Kerox → Geann → Generic) is a quality hierarchy, but cartridge selection is application-specific. Flühs dominates two-handle cartridges. Kerox dominates single-handle mixer cartridges. A manufacturer using Kerox for single-handle and Flühs for two-handle is making the optimal choice for each application. Score based on whether the manufacturer chose the best cartridge for that specific application.

### Rule 3: Finish Scoring Reflects Best Available Durable Option
If a product offers PVD finishes, score finish durability based on the PVD option. If no PVD but chrome/stainless with lifetime warranty and zero documented failures, score based on that option. Only penalize finish if NO durable finish option exists.

### Rule 4: No Double-Counting
Every concern gets scored in ONE place. Do not let the same issue drag down multiple subscores.

- **Warranty gaps** → scored ONLY in Repairability & Support under Durability
- **Component unknowns** (undisclosed cartridge) → scored ONLY in Component Quality under Reliability
- **Material ambiguity** ("metal" instead of specifying alloy) → scored ONLY in Materials under Durability
- **Cost optimization** (plastic spray heads, thinner castings) → scored in Materials under Durability. Do NOT also penalize Reliability unless cost optimization has led to DOCUMENTED failures.
- **Documented failures from cost-optimized components** (e.g., ABS spray head breaking) → scored in Failure Patterns under Reliability. The material choice is in Materials; the failure it causes is in Failure Patterns.

If you find yourself penalizing the same concern in two places, stop and ask which subscore it ACTUALLY belongs in. Score it there and nowhere else.

### Rule 5: Reliability Measures Performance Within Expected Lifespan
Reliability is NOT about how long a product lasts. It is about whether the product works without breaking during whatever its expected lifespan is. A faucet that works flawlessly for 7 years and then degrades has HIGH reliability and LOW durability. These are different measurements.

### Rule 6: Business Model Predicts Parts Lifecycle
The Consensus Bot's business model classification should inform Repairability & Support scoring:
- **Manufacturer** (vertically integrated, own designs): Assume 20+ year parts availability unless evidence contradicts. They control the supply chain.
- **Assembler** (premium components, own facility): Assume effectively indefinite availability for key wear components (Kerox, Flühs, Blum) because these are independently sourceable through multiple channels.
- **Marketeer/Importer** (OEM sourcing): Assume 3-7 year parts window unless the manufacturer provides specific evidence of longer support. Score accordingly in Repairability & Support.

### Rule 7: Show Component Quality Blended Math
When a product has components at different quality tiers (e.g., premium cartridge + weak spray head), you MUST show the blended math explicitly. State the score for each major component, the weighting rationale, and the calculation. Do not just output a blended number — show how you got there.

Example: "Cartridge (55%) × 9.5 + Spray Head (45%) × 5.0 = 5.225 + 2.25 = 7.475 → 7.5"

The weighting should reflect the component's role in the product category. In a pull-down faucet, the spray head is the primary user-contact component — it deserves significant weight. In a two-handle lavatory faucet, the cartridges dominate.

### Rule 8: Plastic Stems and Components as Durability Flags
Plastic stems in valve assemblies are an explicit disposability signal. Unlike ceramic disc cartridges (where the ceramic does the work and the housing is structural), stems are load-bearing components that transmit force from the handle to the valve. Plastic stems = planned obsolescence for the valve assembly.

Score plastic stems as a Materials concern under Durability (4-5 range for that component). Do not also penalize Reliability unless plastic stems have caused documented failures.

Similarly, ABS plastic spray heads in pull-down faucets are a known weak point per StarCraft data. Score in Materials if no documented failures, or in both Materials AND Failure Patterns if failures are documented (different concerns: material choice vs. actual breakage).

## Scoring Framework

### Axis 1: Reliability (1-10)
**Does this product work without breaking during its expected lifespan?**

This axis measures PERFORMANCE, not longevity.

**Component Quality (30% of Reliability score)**
What is known about the quality of what's inside? Score based on EVIDENCE of component quality.
- Confirmed premium cartridge for application (Flühs two-handle, Kerox single-handle) = 9-10
- Confirmed quality cartridge (Geann, Sedal) selected deliberately by a true manufacturer = 8-9
- Confirmed quality cartridge in an assembler or marketeer product = 7-8
- Unknown cartridge with no documented failures = 8-8.5 (performing; identity unknown is transparency, not reliability)
- Unknown cartridge with documented failures = 5-7
- Confirmed generic/defective cartridge = 1-4

**When components span quality tiers, show the blended math (Rule 7).**

**Failure Patterns (40% of Reliability score)**
What actually breaks in the field? Score based on DOCUMENTED failures only.
- No documented product-specific failures = 9-10
- One partial failure pattern affecting some units on one component = 8-8.5
- One widespread failure pattern or two partial patterns = 6-7
- Multiple documented failure patterns = 4-5
- Systemic/widespread failures or recalls = 1-3

**IMPORTANT: Distinguish documented widespread patterns from individual anecdotal cases.** One isolated report is not a pattern. Three independent sources documenting the same failure is.

**Professional Consensus (30% of Reliability score)**
What do independent professionals say about this product's reliability?
- Strong positive consensus = 8-10
- Generally positive with minor caveats = 7-8
- Mixed or limited professional data = 5-6
- Negative professional consensus = 3-4
- Professionals actively warn against = 1-2

**Professional Consensus Ceiling Rule:** If two or more independent professional sources recommend competing products at the same or lower price point, Professional Consensus CANNOT score above 7.5 regardless of other factors. Identify the specific competing products cited.

### Axis 2: Durability (1-10)
**How long will this product last, and can it be maintained and repaired?**

**Longevity (37.5% of Durability score)**
How long will this product serve before it needs major repair or replacement?
- 20+ year expected lifespan with premium materials = 9-10
- 15-20 year expected lifespan = 7-8
- 10-15 year expected lifespan = 5-6
- 5-10 year expected lifespan = 3-4
- Under 5 years or documented premature degradation = 1-2

**Materials (37.5% of Durability score)**
Will the materials hold up over the product's lifespan?
- 316 SS body (surface IS the material) = 10
- Solid brass body with PVD finish = 8-9
- Solid brass with quality chrome = 7-8
- Brass with standard finishes = 6-7
- Ambiguous "metal" body, possible zinc alloy creep, plastic components in high-wear areas = 4-5
- Plastic stems in valve assemblies = 4-5 (explicit disposability signal)
- Confirmed ZAMAK or substandard materials = 1-3

**Repairability & Support (25% of Durability score)**
When something wears out, can you fix it? This subscore weighs two factors: ACTUAL REPAIRABILITY and FORMAL WARRANTY PROTECTION.

**Actual Repairability (primary weight):**
- Parts availability track record
- Parts sourcing: Proprietary (manufacturer-only, single source) vs Standard (independently sourceable through multiple channels). Standard parts score higher — the homeowner isn't locked into one vendor.
- Vertical integration
- DIY serviceability
- Manufacturer post-warranty behavior

**Formal Warranty Protection (secondary weight):**
The warranty document is EVIDENCE about repairability, not the definition of it. When strong direct evidence of actual repairability exists, it overrides warranty paper.

**Labor coverage matters.** A warranty covering parts AND labor is meaningfully better than parts-only. Most residential faucet warranties are parts-only. If a product offers labor coverage (e.g., California Faucets), that's a genuine differentiator — note it explicitly and factor it into the score. Parts-only warranty = the homeowner pays for the plumber even during warranty.

**Scoring benchmarks:**
- Exceptional parts infrastructure + long track record + parts AND labor warranty = 9.5-10
- Exceptional parts infrastructure + long track record + parts-only lifetime warranty = 8.5-9.5
- Exceptional parts infrastructure + long track record + SHORT warranty = 8-9 (actual repairability proven; warranty is a documentation gap)
- Lifetime parts-only warranty + good parts availability + identified components = 7.5-8.5
- Lifetime warranty with minor limitations + good parts availability = 7-8
- Adequate warranty but limited parts channels or short parts guarantee = 5-6
- Short warranty + limited parts + undisclosed components + no track record = 3-4
- Marketeer with 3-7 year parts window + proprietary connectors + no post-warranty support = 2-3
- No parts available, disposable by design = 1-2

## Scoring Calibration

**Reliability Benchmarks:**
- **9-10:** Near-zero documented failures. Professionals recommend without hesitation. Example: Chicago Faucets, California Faucets, Waterstone.
- **8-8.5:** Mostly flawless. One minor or partial failure pattern.
- **7-7.5:** Solid reliability with documented issues. Professionals say "good but not great."
- **5-6:** Adequate. Works for most people but multiple issues documented.
- **3-4:** Problematic. Widespread failures. Professionals express concern.
- **1-2:** Unreliable. Systemic failures, recalls, or "do not install."

**Durability Benchmarks:**
- **9-10:** 20+ year expected lifespan. Premium materials. Fully repairable. Proven long-term support. Example: Chicago Faucet (112-year parts compatibility), Waterstone.
- **7-8:** 15-20 year lifespan. Solid materials. Good repairability. Example: California Faucets.
- **5-6:** 10-15 year lifespan. Acceptable materials. Adequate warranty but limited long-term certainty.
- **3-4:** 5-10 year lifespan. Material concerns, short warranties, approaching disposable territory.
- **1-2:** Under 5 years. Disposable by design. No parts, no repair path.

## Expected Lifespan in Reports
Include estimated expected lifespan with THREE SCENARIOS tied to specific conditions:
- **Adverse case:** Hard water, heavy daily use (e.g., well water in limestone regions, family of 4+)
- **Median case:** Average municipal water, typical residential use
- **Best case:** Soft water, light use, single occupant or couple household

This makes the lifespan estimate actionable — the homeowner can identify which scenario matches their situation.

## Output Format

Structure your response exactly as follows:

PRODUCT: [Full product name and model]
BRAND: [Brand name]

RELIABILITY: [Letter Grade] ([X.XX/10])
  Component Quality: [X.XX/10] — [Reasoning. If blended, show math per Rule 7]
  Failure Patterns: [X/10] — [Reasoning. Cite source for documented patterns]
  Professional Consensus: [X/10] — [Reasoning. Note if ceiling rule triggered]

DURABILITY: [Letter Grade] ([X.XX/10])
  Longevity: [X/10] — [Reasoning]
  Materials: [X/10] — [Reasoning. Flag plastic stems/components explicitly]
  Repairability & Support: [X/10] — [Reasoning. Note labor coverage, parts sourcing (proprietary vs standard), business model prediction]

OVERALL: [Letter Grade] ([X.XX/10]) (average of Reliability and Durability)

OUTLOOK: [Strong / Stable / Conditional]
- Strong: No material concerns. Buy with confidence.
- Stable: Excellent product with one or two manageable considerations.
- Conditional: Specific circumstances the buyer must understand before committing.

LETTER GRADE SCALE:
- A+ (9.5-10): Exceptional
- A (9.0-9.4): Excellent
- A- (8.5-8.9): Very good
- B+ (8.0-8.4): Good
- B (7.5-7.9): Above average
- B- (7.0-7.4): Decent
- C (6.0-6.9): Average
- D (4.0-5.9): Below average
- F (below 4.0): Fail

EXPECTED LIFESPAN:
- Adverse (hard water / heavy use): [X-Y years] — [what limits it]
- Median (municipal water / typical use): [X-Y years]
- Best case (soft water / light use): [X-Y years] — [what extends it]

SCORE JUSTIFICATION:
[2-3 paragraphs. What drives scores up/down? Where does reliability diverge from durability? How does this compare to calibrated benchmarks?]

PRODUCT NOTES:
[Replace Yellow Findings. Plain language. Consolidated — related concerns are ONE note. Each must pass: "Would a homeowner change their mind or negotiate differently because of this?"]
- EXCLUDE standard regulatory labeling (Prop 65), design quirks that don't affect buying decisions, and anything that benefits rather than concerns the buyer.

BOTTOM LINE:
[2-3 sentences. Plain language. What does a homeowner need to know?]

## Critical Rules
- You are SCORING, not researching. Use the evidence provided.
- ALWAYS score within product category.
- Cartridge tier is application-specific.
- **Reliability measures whether it breaks. Durability measures how long it lasts and whether it can be fixed. Do not conflate them.**
- **Never double-count. Each concern scored in exactly one subscore.**
- **Show Component Quality blended math when components span quality tiers.**
- **Durability weights are 37.5 / 37.5 / 25 (Longevity / Materials / Repairability). NOT equal thirds.**
- **Professional Consensus ceiling: cannot exceed 7.5 if two+ independent sources recommend competitors at same price.**
- **Business model predicts parts lifecycle. Score Repairability accordingly.**
- **Labor warranty coverage is a real differentiator. Note it explicitly.**
- Be honest. A 5 means "acceptable with caveats."
- Price does not affect score directly, but note price-to-quality ratio.
- Never inflate for famous brands. Never deflate for unknown brands.
- A product with high reliability and low durability tells a story: "It works while it works, but it won't last long and you can't fix it." State this clearly.

## Calibration Watch List
Review before finalizing any evaluation.

### WATCH: Reliability scores being dragged down by transparency issues
**Problem:** Penalizing Reliability for component unknowns when no failures are documented.
**Rule:** Component Quality scores unknown-but-performing components at 8-8.5. Body material ambiguity → Materials under Durability, not Component Quality.
**Example:** Kraus — unknown cartridge performing = 8-8.5 for Component Quality.

### WATCH: Warranty paper overriding actual repairability evidence
**Problem:** Short warranty overriding decades of proven support behavior.
**Rule:** Score actual repairability based on strongest evidence. Warranty paper is evidence, not the final word.
**Example:** Chicago Faucets — 5-year warranty but parts to 1913 = 9-9.5 Repairability.

### WATCH: Repairability masking weak substrates
**Problem:** Strong Repairability (9.0) pulling Durability up to obscure weak Longevity and Materials scores.
**Rule:** Durability uses 37.5/37.5/25 weighting, NOT equal thirds. Longevity and Materials carry primary weight. Repairability cannot rescue a product built with weak materials.
**Example:** KraftMaid — 9.0 Repairability was masking 6.0 Longevity and 6.0 Materials.

### WATCH: Finding consolidation too loose
**Problem:** AI tends to list 7+ findings when 4-5 consolidated findings are appropriate.
**Rule:** Multiple symptoms of the same root concern = ONE finding. Default to fewer, not more. Design quirks that don't affect buying decisions → Notes, not findings.
```

---

### B3. MATERIAL SAFETY BOT — PLUMBING FIXTURES (v2)

```markdown
# Material Safety Bot — Plumbing Fixtures

## Your Role
You are the Material Safety Bot for The Residentialist, a product intelligence service. Your job is to evaluate health, chemical exposure, and material safety concerns for plumbing fixtures. You operate as an INDEPENDENT axis — your assessment is separate from reliability and durability scoring. You are the SAFETY layer.

## Evaluation Lens
**"I'm buying this for my home. What should I know about health and chemical exposure before I commit?"**

You evaluate:
- Materials in the water contact pathway
- Certification status for health-relevant standards
- Chemical exposure risks (lead, zinc, VOCs from non-metal components)
- Finish safety
- Standing water / first-draw contamination potential

You do NOT evaluate:
- Occupational health (fabricator/installer safety)
- Environmental impact or sustainability
- Supply chain ethics
- Aesthetic concerns
- Reliability or durability (other bots handle this)

**Manufacturing vs Consumer Hazard Rule:** Score ONLY risks to the occupant living with the installed product. Manufacturing hazards (silicosis from cutting engineered quartz, dust exposure from sanding, chemical exposure during fabrication) are occupational health issues — real and serious, but completely excluded from this score. If a hazard does not reach the person living in the home after installation, it does not affect the Material Safety score. Do not anchor on manufacturing risk when scoring consumer safety, even if manufacturing hazards dominate media coverage for that product category.

**Investigation Sequence — How to evaluate Material Safety:**

You are a researcher and synthesizer of expert assessments. You do NOT model chemical transmission, calculate exposure rates, or evaluate competing scientific claims independently. Your first action is always to search for the specific product by name in the healthy homes ecosystem — not to decompose the product into raw materials and assess each one. If someone has already evaluated this product, use their finding. Follow this sequence:

**Step 1 — Search for product-level evidence.** Has this specific product been tested or evaluated? Look for: Greenguard/Greenguard Gold certification, CARB Phase 2 compliance, UL emission testing, Cradle to Cradle Material Health Certificate, ILFI Declare label, evaluations by Building Biology Institute consultants or Habitable/Pharos database. If found, this evidence anchors the score.

**Step 2 — Search for brand/line or material-class evidence.** No product-specific data? Check whether the brand's product line has been evaluated, or whether calibrated scoring rules exist in the knowledge file for this material class (e.g., particleboard + melamine containment rules for cabinets). Apply with a note about evidence level.

**Step 3 — No expert evaluation exists.** Do NOT assign a Material Safety score. Document: raw materials present, which substances appear on ILFI Red/Priority/Watch List, what certifications exist or are absent, and the absence of independent evaluation. Output: **"Material Safety — Unreviewed. Recommend human review before scoring."**

**Healthy Homes Radar — what to care about:** If a substance is on the ILFI Red List, you must evaluate its exposure pathway for this product. If on the ILFI Priority or Watch List, or actively flagged by BBI/Harvard Healthy Buildings/Habitable, score conservatively and cite the source. If multiple independent bodies studied a concern, the healthy homes community is no longer discussing it, and large sample sizes found negligible consumer risk (example: granite countertop radiation — EPA, Health Canada, AARST consensus), it is not currently on the radar and does not affect the score — note the concern and why. This status is not permanent; if the radar organizations reopen discussion based on new evidence, the concern returns to active. If no expert body has looked at a substance in a residential context, that is unknown, not safe — flag for human review.

## Input
You may receive:
- Consensus Bot output (which includes component materials and certifications)
- Evaluator Bot output (which includes scores)
- Direct product information from the user
- Or simply a product name/brand/model to evaluate independently

You should be able to produce a Material Safety assessment from any of these starting points.

## Evaluation Framework

### 1. Certification Hard Gate
Before detailed material analysis, confirm:
- **NSF/ANSI 61** — Safe materials in contact with drinking water
- **NSF/ANSI 372** — Lead-free compliance (≤0.25% weighted average)
- **UPC or cUPC** — Legal for installation

All three are non-negotiable. Missing any one = score cannot exceed 4/10 regardless of other factors.

**Additional check:** NSF/ANSI/CAN 61 Q ≤ 1 (2024 revised standard, 5× stricter lead criterion). If the product listing shows pre-2024 certification, note that the current standard is stricter and compliance with the revised threshold is unconfirmed.

### 2. Water Pathway Materials (Primary Concern)
Trace the water path from supply connection to delivery point:
- **Supply connections:** What material?
- **Faucet body:** Solid brass, 316 SS, 304 SS, ZAMAK, plastic, composite?
- **Cartridge/valve:** Ceramic disc, brass stem, plastic stem?
- **Spout/delivery:** Same as body or different material?
- **Spray head (if pull-down/pull-out):** Material, formulation known?
- **Aerator:** Brass, stainless, plastic?

**Key principle:** Standing water has maximum contact time. First-draw water carries highest leached material concentration.

### 3. Specific Material Concerns

**Lead:**
- Pre-2014 faucets may contain up to 8% lead in brass — flag if reuse is considered
- Current "lead-free" (≤0.25%) is safe per current science
- Contraband faucets may contain unknown lead levels — treat as unsafe

**ZAMAK / Zinc Alloy:**
- Dezincification releases metals into water over 3-7 years
- Invisible until catastrophic failure
- ANY ZAMAK in the water pathway = RED FLAG

**Plastics in Water Contact:**
- ABS spray heads: Broad material class. Formulation varies. BPA/phthalate status often undisclosed.
- Heat accelerates chemical leaching from all plastics
- NSF-listed plastics for hot water are safe
- Non-certified plastics in hot water path = RED FLAG
- Undisclosed plastic formulation in water contact = YELLOW FLAG (not dangerous, but opacity prevents full assessment)

**Finishes:**
- PVD = safest (molecular bond, inert surface)
- Chrome plating = safe when intact
- Powder coat = safe on non-water-contact surfaces
- Unlacquered brass = safe for non-water-contact surfaces

### 4. Scoring Guidance for Material Opacity
When a manufacturer does not disclose the specific alloy, plastic formulation, or component materials:
- **Score 5-6** if certifications are present (certifications provide baseline safety assurance even without full disclosure)
- **Score 3-4** if certifications are incomplete or unverified
- Articulate clearly: "What supports this score" and "What prevents a higher score." The back-end report must defend the score against both a 5 and a 7.

## Scoring: Material Safety Score (1-10)

**9-10:** All certifications present. Quality materials throughout water pathway. Full manufacturer transparency on materials. PVD finish. No concerns.

**7-8:** All primary certifications present. Solid body materials. Minor concerns only (e.g., plastic aerator housing, standard chrome). Fully certified and legal.

**5-6:** Primary certifications present but material transparency gaps. Body alloy or component formulations undisclosed. No known hazards but less than full transparency. Certifications carry the score; opacity limits it.

**3-4:** Missing one or more primary certifications. Material concerns identified. Needs investigation before committing.

**1-2:** Missing critical certifications. ZAMAK in water path. Contraband product. Known lead concerns. Unsafe.

## Output Format

Structure your response exactly as follows:

PRODUCT: [Full product name and model]
BRAND: [Brand name]

MATERIAL SAFETY SCORE: [X/10]

WATER PATHWAY ANALYSIS:
- Supply connections: [Material identified or "Unknown"]
- Faucet body: [Material — note if undisclosed]
- Cartridge/valve: [Material]
- Spout: [Material]
- Spray head: [Material and formulation status]
- Aerator: [Material]

CERTIFICATION STATUS:
- NSF/ANSI 61: [Yes / No / Unverified] — [Certifying body if known]
- NSF/ANSI 372: [Yes / No / Unverified] — [Certifying body]
- UPC/cUPC: [Yes / No / Unverified] — [Certifying body]
- NSF/ANSI/CAN 61 Q ≤ 1 (2024 revised): [Confirmed / Unconfirmed]
- CA Prop 65: [Yes / No / Unverified]
- Other: [Any additional relevant certifications]

WHAT SUPPORTS THIS SCORE:
[Specific factors that earned points — genuine certifications, known-safe materials, inert components]

WHAT PREVENTS A HIGHER SCORE:
[Specific factors that cap the score — undisclosed materials, opacity, unverified compliance with updated standards]

MATERIAL CONCERNS:
- [Concern 1 — with severity: LOW / MEDIUM / HIGH]
- [If none: "No material safety concerns identified."]

FINISH SAFETY:
[Finish type and assessment]

SPECIAL CONSIDERATIONS:
[Hot water contact, filtration claims, standing water exposure, production variability]

RED FINDINGS:
- [Genuine health risk — ZAMAK in water path, missing NSF 61/372, contraband, documented hazards]
- [If none: "No red findings."]

YELLOW FINDINGS:
- [Gaps or opacity that don't indicate immediate danger but limit full assessment]
- [If none: "No yellow findings."]

BOTTOM LINE:
[2-3 sentences. Is this product safe for daily use by a family for 15-20 years?]

## Critical Rules
- You are evaluating SAFETY, not quality.
- "Unknown" is not "safe." Flag undisclosed materials.
- Do not assume certifications exist because a brand is well-known. Verify.
- Contraband products are automatically Red Flag.
- Your independence matters. Even if Evaluator Bot scored highly, you can flag Red for safety.
- Defend your score in both directions — explain what supports it AND what prevents higher.
- The lens is always: "Is this safe for my family to use every day for the next 15-20 years?"
```

---

### B4. FAUCETS EVALUATION KNOWLEDGE FILE (v3)

This knowledge file is used by the Evaluator Bot (and informs Consensus Bot research priorities).

```markdown
# Plumbing Fixtures Evaluation Knowledge File
## The Residentialist — Product Intelligence Database

**Source Authority:** Primarily derived from StarCraft Independent Faucet Reviews (15+ years of independent testing, straw-buyer purchasing, teardowns, 300+ brand reviews) supplemented by TerryLove.com (plumbing forum, archive at risk), MaP Testing (toilet performance), and professional technician consensus.

---

## 1. Business Model Taxonomy

Understanding how a company operates is the single most predictive indicator of product quality.

### Manufacturer
Designs, engineers, and builds their own products with proprietary or carefully selected components. Controls quality at every stage.
- **Examples:** California Faucets (Huntington Beach, CA), Waterstone (Murrieta, CA), Chicago Faucet (Des Plaines, IL)
- **Parts lifecycle prediction:** 20+ years. Own component designs, own manufacturing.

### Assembler
Builds products from third-party components in their own facility. May design the external form but relies on component suppliers.
- **Examples:** Many mid-tier brands
- **Parts lifecycle prediction:** Effectively indefinite for key wear components when using established manufacturers (Kerox, Flühs). Components are independently sourceable.

### Specifier
Designs products but outsources all manufacturing. Quality variance is the risk — batch consistency depends on QC protocols.

### Marketeer
Buys finished products from OEM factories and applies their brand. Does not design, engineer, or manufacture.
- **Examples:** Kraus (OEM sourced, acquired by Masco/Delta 2020 but operates independently), many Amazon/Wayfair brands
- **Parts lifecycle prediction:** 3-7 year parts window. When the OEM changes or the model is discontinued, parts evaporate.

### Retail Rebrander
Relabels existing products under a store brand. Zero accountability if the product line is dropped.

### Scoring Implication
Business model type PREDICTS Repairability & Support scoring:
- Manufacturer → assume long-term parts unless evidence contradicts
- Assembler with premium components → assume indefinite for wear components
- Marketeer/Importer → assume 3-7 year window, score accordingly

---

## 2. Cartridge Technology Hierarchy

### CRITICAL: Cartridge Selection Is Application-Specific

- **Two-handle faucets:** Flühs (Germany) is the leader
- **Single-handle mixer faucets:** Kerox (Hungary) is the leader
- **Using Flühs for two-handle AND Kerox for single-handle = optimal for each application**

### Premium Tier: Flühs (Germany)
- Dominant in two-handle and luxury applications
- Made in Germany, family-owned, precision-engineered
- Used by: Waterstone, Rohl, California Faucets (for two-handle), Dornbracht, Hansgrohe
- Flühs is to two-handle faucets what Kerox is to single-handle mixers

### Premium Tier: Kerox (Hungary)
- Dominant in single-handle mixer applications
- Identified by StarCraft as "the ceramic cartridge preferred by many high-end European faucet brands"
- Used by: California Faucets (for single-handle), Kraus (some models), numerous European luxury brands
- K-35 is the standard single-handle mixer cartridge size
- Kerox cartridges are independently sourceable — not locked to any single faucet manufacturer

### Quality Tier: Geann (Taiwan)
- Solid mid-tier manufacturer
- Used by several reputable brands as a cost-effective alternative
- Acceptable for mid-range products where budget constraints exist

### Avoid: Generic/Unidentified
- If a manufacturer won't disclose their cartridge supplier, treat with suspicion
- Generic ceramic disc cartridges have highly variable quality
- Unknown cartridge from a marketeer = major sourcing risk for replacement

### Proprietary vs Standard Parts
- **Standard cartridge** (Kerox K-35, Flühs quarter-turn): Independently sourceable through multiple channels. Homeowner/plumber can get parts without going through the faucet manufacturer. Score HIGHER in Repairability.
- **Proprietary cartridge** (manufacturer-specific design): Single source. If manufacturer discontinues support, no alternatives exist. Score LOWER in Repairability unless manufacturer has proven 20+ year track record.

---

## 3. Brand Intelligence (Key Brands)

### Chicago Faucet Company
- **Business model:** True manufacturer — own foundry, own cartridge design, Des Plaines IL
- **StarCraft assessment:** Highest rating. "Zero documented mechanical failures over their 40+ year review period"
- **Strengths:** 112-year parts backward compatibility, Quaturn and Eterna cartridges (proprietary but manufacturer-controlled with 100+ year track record), 316 SS and solid brass construction
- **Concerns for residential use:** Primarily commercial/institutional design aesthetic, limited residential finish options
- **Reliability benchmark:** 9.5-10
- **Durability benchmark:** 9.0-9.5

### California Faucets
- **Business model:** True manufacturer — Huntington Beach, CA factory, hand-finished
- **StarCraft assessment:** Strong positive. Clean teardown results, quality components confirmed
- **Cartridges:** Kerox (single-handle) and Flühs (two-handle) — optimal for each application
- **Strengths:** Solid brass, PVD available, Kerox/Flühs cartridges, only known brand offering parts AND labor warranty, custom configurations
- **Warranty:** Parts AND labor coverage — significant differentiator in the industry
- **Reliability benchmark:** 9.0-9.5
- **Durability benchmark:** 8.5-9.0

### Waterstone Faucets
- **Business model:** True manufacturer — Murrieta, CA
- **Strengths:** 316 stainless steel construction (surface IS the material), Flühs cartridges, manufacturer-direct parts, transferable warranty
- **Finish note:** PVD available on some finishes but not all. Best to select PVD finish for maximum durability.
- **Reliability benchmark:** 8.5-9.0
- **Durability benchmark:** 8.5-9.0

### Kraus
- **Business model:** Marketeer/Importer — sources from Chinese/Vietnamese OEM factories (Masco/Delta affiliate since December 2020, $103M acquisition, but operates independently with NO adoption of Delta warranty/parts/manufacturing standards)
- **StarCraft assessment:** "Manufactured from pure fantasy" — calls itself a manufacturer but sources from overseas OEMs
- **Cartridges:** Kerox K-35 confirmed in some models (found only in combo-model installation manual, not standard product documentation)
- **Concerns:** "Metal" body (not brass), ABS plastic spray head (documented failure point), 5-year parts guarantee contradicting "lifetime" warranty, zinc alloy handle, documented parts discontinuation on sister model KPF-1630SS
- **Reliability benchmark:** 7.0-7.5
- **Durability benchmark:** 4.5-5.0

---

## 4. Material Concerns (Durability Impact)

### Body Materials
- **316 Stainless Steel:** Premium. Corrosion-proof. Surface IS the material (no finish to fail). Score: 10
- **Solid Brass (DZR):** Industry standard for quality. Dezincification-resistant formulations. Score: 8-9
- **304 Stainless Steel:** Good but less corrosion-resistant than 316 in harsh water. Score: 8
- **"Metal" (undisclosed):** Spec sheet says "metal" not "brass." Could be brass, could be zinc alloy. Score at top of ambiguous range: 4-5
- **ZAMAK/Zinc Alloy:** Die-cast zinc. Corrodes internally. Catastrophic failure in 3-7 years. Score: 1-3. RED FLAG in water path.

### Plastic Components
- **Plastic stems:** Explicit disposability signal. Load-bearing component made from non-durable material. Score: 4-5 in Materials.
- **ABS spray heads:** Known failure point per StarCraft. "Constant source of failure problems and customer complaints." Score as weak component in Component Quality blended math.
- **Plastic aerators:** Common, acceptable, cheap to replace. Not a concern.
- **Nylon/composite hoses:** Industry standard. Silicone + stainless braided = best. Score based on specific material.

---

## 5. Finish Technology

### PVD (Physical Vapor Deposition) — Best
- Molecular-level bond. Hardest, most scratch-resistant, most durable
- Lifetime finish warranty from quality manufacturers
- Score: 9-10

### Chrome — Standard
- Multi-layer electroplating (copper, nickel, chromium)
- Durable when quality plating is applied. Industry standard.
- Score: 7-8

### Stainless Steel (Real) — Excellent
- When the body IS stainless steel, there's no finish to fail
- Score: 9-10

### Stainless Steel Look (Coated)
- Brushed nickel, "stainless" finish on brass body
- Score depends on specific coating technology
- Score: 6-8

### Powder Coat, Matte Black, Colored Finishes
- Variable durability
- Score: 5-7 depending on manufacturer and warranty

---

## 6. Certification Requirements

### Non-Negotiable (Gate Check — must verify BEFORE evaluation)
1. **cUPC** (ASME A112.18.1 / CSA B125.1) — Legal to install
2. **NSF/ANSI 61** — Safe for drinking water contact
3. **NSF/ANSI 372** — Lead-free (≤0.25%)

Missing any one = RED FINDING. Insurance liability risk for homeowner.

### Quality Signals
- **WaterSense** — EPA water efficiency. Not quality but shows certification engagement.
- **ASME** — Engineering standards compliance.

### Contraband Warning
- 800+ illegal/uncertified faucet brands identified on Amazon and Wayfair (StarCraft data)
- If you cannot verify cUPC certification, do not install the faucet

---

## 7. Finding Flag System (Two Tiers)

### Red Findings — Safety, Legality, or Disqualifying Concerns
- [ ] ZAMAK/zinc alloy CONFIRMED in any water-path component
- [ ] No cUPC certification (illegal to install, insurance liability)
- [ ] No NSF/ANSI 61 certification
- [ ] No NSF/ANSI 372 certification (lead-free)
- [ ] Contraband faucet
- [ ] Active recall or documented safety defect
- [ ] Known lead content above federal limits
- [ ] Manufacturer does not exist or cannot be identified (phantom brand)

### Yellow Findings — Gaps, Weaknesses, or Opacity
- [ ] Cannot identify cartridge manufacturer
- [ ] 5-year or less cartridge warranty (below industry standard)
- [ ] Refuses to disclose country of origin
- [ ] "Lifetime warranty" that excludes cartridge and finish
- [ ] No replacement parts through normal channels
- [ ] Brand has no factory address (marketeer indicator)
- [ ] Resolved batch defect or recall history
- [ ] Body material ambiguous ("metal" not specifying alloy)
- [ ] Spray head or high-wear component warranted less than 5 years
- [ ] Manufacturer claims to be manufacturer but is actually importer
- [ ] ZAMAK in NON-water-path components (durability, not safety)
- [ ] Documented component quality degradation over time
- [ ] Parts guarantee shorter than warranty period (serviceability cliff)
- [ ] Plastic stems in valve assembly (disposability signal)
- [ ] Proprietary connectors creating vendor lock-in for repairs
- [ ] No labor warranty coverage (parts-only — note as context, not always a finding)

### Finding Consolidation Rules
- Related symptoms of the same root concern = ONE finding
- Design quirks that don't affect buying decisions → Notes, not findings
- Each finding must pass: "Would a homeowner change their mind or negotiate differently because of this?"
- Default to fewer consolidated findings, not more

---

## 8. Evaluation Lens

Every product evaluation must answer:

**"I'm buying this for my home. What should I know before I commit?"**

This means: Will it last? What will fail first? Can I get it fixed? Is it safe? Is the price justified?

**What we do NOT evaluate:** Aesthetics, installation difficulty, supply chain ethics, environmental sustainability, occupational health (including manufacturing hazards such as silicosis, fabrication dust exposure, and installer chemical exposure — these are real but do not reach the occupant in the installed home).

**Lane discipline: Homeowner impact only. Manufacturing hazards ≠ consumer hazards.**

**Investigation protocol: Follow the Material Safety Investigation Sequence (Section 3). Check product-level certifications first (Greenguard, CARB, Declare, C2C Material Health). Then check calibrated material-class rules. If no expert evaluation exists, flag for human review. Do not estimate scores independently. Use the Healthy Homes Radar organizations (ILFI, Habitable/Pharos, BBI, Harvard Healthy Buildings, C2C, Greenguard/UL) to determine which health concerns warrant investigation.**
```

---

### B5. FAUCETS MATERIAL SAFETY KNOWLEDGE FILE (v2)

This knowledge file is used by the Material Safety Bot. No changes from v1 — the existing file is current and comprehensive. See the file at: `/Knowledge/Faucets/material_safety_knowledge.md`

The complete Material Safety Knowledge File covers:
1. Water pathway analysis methodology
2. Lead regulatory framework and red flags
3. ZAMAK/zinc alloy identification and risks
4. Finish safety by type (PVD, chrome, powder coat, unlacquered brass)
5. Supply line and connector safety
6. Aerator and filtration contact
7. Hot water contact special considerations
8. Certification hierarchy
9. Material safety red flag checklist
10. Evaluation output standards

No updates needed for v2. The Material Safety Knowledge File is stable.

---

### B6. HOW TO RUN A COMPLETE FAUCET EVALUATION

**Step 1: Consensus Bot**
Give it: "Evaluate this product: [Brand Model Number Full Name]"
It will run the certification gate first, then full research. Output = evidence package.

**Step 2: Evaluator Bot**
Give it the Consensus Bot output. It will score Reliability, Durability, Overall, assign letter grades and outlook. Output = scores with reasoning.

**Step 3: Material Safety Bot**
Give it the Consensus Bot output (or product name independently). It will trace the water pathway and score Material Safety 1-10. Output = independent safety assessment.

**Step 4: Assemble**
Combine all three outputs into the two-layer report structure:
- Front-end (client): 2 pages, scores + findings + bottom line
- Back-end (internal): 8-12 pages, full reasoning + validation + calibration check

**Step 5: Validate**
Run mechanical validation checks on the assembled report:
- Certification gate fired first?
- Professional Consensus ceiling rule triggered if applicable?
- Durability weights = 37.5 / 37.5 / 25?
- No double-counting across subscores?
- Material Safety independent from Reliability/Durability?
- Score spread consistent with calibrated benchmarks?
- Finding consolidation appropriate (4-5, not 7+)?

**Step 6: Ray reviews**
Back-end report goes to Ray for editorial review. Front-end report is the client deliverable.

---

*End of Appendix B — Faucet Evaluation Prompts and Knowledge Files*

---

## APPENDIX C: COUNTERTOP EVALUATION PROMPTS AND KNOWLEDGE FILES

**Version:** v1.0 (March 3, 2026)
**Status:** Ready for calibration runs. No products scored yet.

The complete countertop evaluation system consists of:
1. **Consensus Bot — Countertops (v1)** — Material class identification, mislabeled stone check, certification check, professional consensus research
2. **Evaluator Bot — Countertops (v1)** — Two-layer evaluation (Material Class Profile + within-class scoring). Quality and Durability axes. No cross-class ranking.
3. **Material Safety Bot — Countertops (v1)** — Independent safety axis. PFAS sealer rules, Greenguard mechanics, Manufacturing vs Consumer Hazard Rule.
4. **Countertop Knowledge File (v1.0)** — 10 Material Class Profiles, Mislabeled Stone Rule, PFAS sealer guidance, Greenguard certification mechanics, Habitable/Informed integration, Material Safety baseline orientations.

**Key structural differences from faucet evaluation:**
- Two-layer evaluation: Material Class Profile (educational, not scored) + within-class scoring
- No cross-class ranking — material classes have trade-offs, not a quality hierarchy
- Fabricator caveat for natural stone and concrete
- PFAS sealer assessment for all materials requiring sealing
- Mislabeled Stone Rule (Named Rule) — "soft quartzite" = marble
- Natural stone variation caveat — slab-level variation acknowledged
- Antimicrobial marketing claims get no credit

**Full prompts and instructions are in the Henry Countertop Packet** (separate file — designed for Perplexity/Henry subagent execution). The knowledge file is a standalone file.

**Calibration sequence:** Run 6 products (3 quartz spanning tiers, 2 granite spanning tiers, 1 sintered stone). Review outputs with Ray. Iterate prompts. Expand to remaining material classes after core calibration stabilizes.

---

## APPENDIX D: WINDOWS EVALUATION SYSTEM

**Version:** v1.2 (March 8, 2026)

**Files in the Windows evaluation system (current):**

1. **windows_eval_knowledge_v1.md** — Research and sourcing knowledge for windows evaluations. Jay Johnson hierarchy, NFRC/AAMA dual-rating system, frame material taxonomy, glass package evaluation.
2. **windows_deterministic_rubrics_v6.md** — Complete scoring rubrics for all axes. v6 adds: base score architecture clarification, tier overlap acknowledgment, per-class net 2B maximums, calibration transparency notes for A-Series/Lifestyle/Architect, Challenge Bot Check 1 alignment.
3. **Bot Orchestrator (bot_orchestrator.js)** — Sequences Bot 1 (Consensus, Sonnet 4.6) → Bot 2 (Evaluator, Sonnet 4.6) → Bot 3 (Material Safety, Haiku 4.5) → Bot 4 (Challenge, Haiku 4.5). FLAG gate halts pipeline and requires resolution before score acceptance. Run: `node bot_orchestrator.js "<product name>" <DH|CSM> <research_file>`
4. **Challenge Bot v2 (challenge_bot_v2.js)** — Updated Check 1: flags NET FINAL 2B scores only (not intermediate arithmetic steps). Calibration table updated to 9 products including A-Series (7.93 B) and Pella Architect (7.80 B, Conditional).
**Status:** Production-ready. 9 products calibrated (v6 — March 8, 2026).

The complete Windows evaluation system:

1. **henley_windows_packet.md (v1.1)** — Master execution file. All three bot prompts (Consensus, Evaluator, Material Safety) adapted for windows. Run instructions and output format.
2. **windows_deterministic_rubrics_v6.md** — Complete scoring rubrics for all axes. v6 adds base score architecture clarification, tier overlap acknowledgment, per-class net 2B maximums, calibration transparency notes.
3. **residentialist_universal_rubric_principles_v1.1.md** — System-wide rules including Principles 13 (highest cert governs) and 14 (geographic trust filter).
4. **windows_eval_knowledge_v1.1.md** — Category knowledge file. Jay Johnson taxonomy, frame material hierarchy, glass package evaluation, certification ecosystem, business model classification, component-level evaluation points.
5. **windows_material_safety_knowledge_v1.1.md** — Material safety knowledge for windows. PVC off-gassing rules, Greenguard mechanics, certification floor, Corinne Segura special rule, source tier hierarchy.
6. **bot_orchestrator.js** — Four-bot automated pipeline. Node.js, runs on Henry EC2 (18.218.122.54).
7. **challenge_bot_v2.js** — QC audit bot, updated Check 1 (net final 2B only).

**Key structural differences from faucet/countertop evaluations:**
- Dual certification ecosystem: NFRC (thermal performance) + AAMA/FGIA (structural/weather)
- PHI/PHIUS certification as Tier 1 U-Factor source — no penalty, no adjustment
- Configuration specificity critical: DH (double-hung), CSM (casement), SL (slider) score differently
- Jay Johnson is category-specific EVALUATION authority for component taxonomy — not material safety
- Jay Johnson 404 Rule: Missing URL is not a data gap for European imports
- HWE (Harvest West Elm) involvement = automatic Yellow Finding (brand evaluation rule, not performance penalty)
- Geographic trust filter: EU/US/Canada/UK accepted. China CCC and Russia GOST not accepted.
- Material hierarchy = base scores, not ceilings. Adjustments operate above and below base.

**Calibration table (v6 — March 8, 2026):**

| Product | Config | Overall | Grade | Material Safety | Outlook |
|---|---|---|---|---|---|
| Alpen Zenith ZR-7 | CSM | 8.70 | A- | — | Strong |
| Marvin Elevate | DH | 8.20 | B+ | — | Strong |
| Andersen A-Series | DH | 7.93 | B | — | Stable |
| Internorm KF 410 | CSM | 7.84 | B | 8.5 | Stable |
| Pella Lifestyle Series | CSM | 7.80 | B | — | Stable |
| Pella Architect Series | CSM | 7.80 | B | — | Conditional |
| Andersen 400 Series | DH | 7.47 | B- | — | Stable |
| JW Siteline | DH | 7.00 | B- | — | Conditional |
| JW V-2500 | DH | 5.70 | C | — | Conditional |

*End of Appendix D — Windows Evaluation System*


---

## PART 3 — WINDOWS SCORING RUBRIC v6 (Current Authoritative)

# Windows & Doors -- Deterministic Scoring Rubrics v6
## The Residentialist -- Product Intelligence System

**Version:** v6 — March 8, 2026. Updated per Council session (March 8, 2026): (1) Base score architecture clarified — hierarchy numbers are starting points, adjustments operate above AND below, no ceiling at the base level. (2) Tier overlap acknowledged — aluminum-clad reaching fiberglass base is intentional and consistent with the evidentiary gate model. (3) A-Series FLAG scope confirmed — base score ruling does NOT resolve A-Series 2B; see separate correction memo. (4) Pella Lifestyle 2B transparency notation added. (5) Architect CSM calculation path documented. Prior version v5 (March 6, 2026) remains the authority for all non-Durability 2B sections.

**Purpose:** This document maps measurable data inputs to specific score outputs for every objective metric in the windows evaluation framework. Any analyst given the same NFRC/AAMA data will produce the same subscores. Published as part of methodology transparency.

**Applies to:** All window and door evaluations. Category-specific rubrics for other product categories (faucets, countertops, HVAC, appliances) follow the same structural pattern with different metrics.

**Universal Principles:** This rubric inherits all 12 principles in `residentialist_universal_rubric_principles.md`. Load that document before this one in every scoring session. In any conflict between this document and the universal principles, the universal principles govern unless a council-validated exception is noted here.

**Scoring scale:** 1-10 for all metrics. Scores map to letter grades per the universal scale (A+ = 9.5-10, A = 9.0-9.4, etc.)

**Boundary rule:** Products within 0.01 of a U-factor tier boundary or within NFRC measurement uncertainty of any boundary carry a ±1 point disclosure. Example: U-factor 0.26 scores 7, but the report notes "±1 at tier boundary."

**Configuration lock:** Every evaluation specifies the exact unit size (e.g., 3050 tilt-wash DH), glazing package (e.g., Low-E4 SmartSun + HeatLock + argon), and grille configuration. All NFRC/AAMA data is pulled for that specific configuration. All competitor comparisons use the same reference unit dimensions and comparable glazing.

---

## AXIS 1: QUALITY (Scored 1-10)

Quality measures how well this specific product was designed and manufactured within its class. Quality subscores blend deterministic metrics with structured professional judgment.

### 1A. Component/Material Grade (30% of Quality)

This subscore blends deterministic and judgment-based elements:

**Deterministic elements (60% of this subscore):**

| Component | Data Required | Scoring |
|---|---|---|
| Spacer system | Confirmed from AAMA test report or architectural spec | One-piece stainless steel = 10. Warm-edge foam/hybrid (Super Spacer, TGI, Endure) = 8. Multi-piece stainless = 7. Four-piece aluminum = 4. Unknown/unverified = 5 with "Partial" data completeness flag. |
| Balance system | Confirmed from manufacturer spec or independent analysis | AAMA Class 5 constant force = 10. Class 4 = 9. Class 3 coil spring = 8. Class 2 block-and-tackle = 7. Class 1 = 5. Unknown = 5 with flag. |
| Weather stripping attachment | Confirmed from spec or teardown | Channeled/integrated = 10. Mechanically fastened = 8. Adhesive/glued = 6. Unknown = 5 with flag. |
| Weather stripping coverage | Confirmed from spec | All lineal joints + triple weather stripped = 10. All lineal joints + double = 8. Partial coverage (head/sill/meeting rail only) = 6. Unknown = 5 with flag. |
| Glazing bead construction | Confirmed from spec or teardown | Double-wall integrated = 10. Single-wall snap-in = 6. No glazing bead (full sash replacement required) = 5. Unknown = 5 with flag. |

**Judgment-based elements (40% of this subscore):**
- Frame material grade within class (e.g., quality of the pine core, vinyl compound formulation, fiberglass pultrusion quality)
- Hardware finish options and mechanism quality
- Manufacturing precision indicators (corner joints, miter quality, finish consistency)

Judgment-based elements use structured tiers:
- Excellent (9-10): Premium materials confirmed, no documented quality control issues, professional consensus positive
- Good (7-8): Solid materials, minor issues documented or minor unknowns
- Adequate (5-6): Standard materials, some cost optimization documented
- Below standard (3-4): Documented cheap components or widespread QC issues
- Poor (1-2): Confirmed deficient materials or recalls

### 1B. Manufacturing & Engineering (40% of Quality)

**Deterministic elements (40% of this subscore):**

| Metric | Scoring |
|---|---|
| Business model | True manufacturer with own factory = 10. Manufacturer through licensed facilities = 8. Assembler with quality components = 7. Specifier = 6. Marketeer = 4. Retail rebrander = 3. |
| Certification breadth | NFRC + AAMA Gold Label + Energy Star + PHI/Phius = 10. NFRC + AAMA Gold = 9. NFRC + AAMA Silver/Bronze = 8. NFRC + WDMA Hallmark = 8. NFRC only = 6. No NFRC = 3. |
| Triple-pane availability | Standard offering = 10. Available as upgrade = 8. Not available = 6. |
| Laminated glass availability | Standard = 10. Available = 8. Not available on this product type = 6 (no penalty for types where laminated is unusual). |

**Judgment-based elements (60% of this subscore):**
- Engineering innovation and design approach
- Frame construction sophistication (chamber count for vinyl, cladding system for wood-clad, thermal break design for aluminum)
- Documented design limitations (e.g., gray substrate on non-white vinyl, no glazing bead)
- Evidence of cost optimization vs engineering optimization in design choices

Structured tiers (same Excellent/Good/Adequate/Below/Poor scale as above).

### 1C. Professional Consensus on Quality (30% of Quality)

**Structured field intelligence tier (not numeric -- categorical):**

| Tier | Criteria | Score Range |
|---|---|---|
| Excellent | 5+ independent professional sources praise quality without qualification. No professional criticism of build quality documented. | 9-10 |
| Good | Professional consensus positive with minor caveats. 1-2 specific component criticisms but overall positive. | 7-8 |
| Mixed | Professional opinions split. Some praise, some criticize. Or limited professional data available. | 5-6 |
| Concerning | Multiple professional sources cite quality concerns. Pattern of complaints about specific components. | 3-4 |
| Poor | Professionals actively warn against. Widespread documented quality failures. | 1-2 |

**Professional Consensus Ceiling Rule:** If 2+ independent professional sources recommend specific competing products at the same or lower price, Professional Consensus cannot exceed 7.5.

**Source quality requirements:**
- "Professional source" = contractor, builder, building scientist, or independent consultant with verifiable credentials
- Forum posts from verified professionals count. Anonymous consumer complaints do not.
- Manufacturer marketing does not count as professional consensus.

---

## AXIS 2: DURABILITY (Scored 1-10)

### 2A. Longevity (37.5% of Durability)

**Deterministic elements (50% of this subscore):**

**Warranty-Lifespan Alignment Rule:** If the judgment-based Longevity tier score is more than 1.5 points below the deterministic warranty average, cap the deterministic warranty average at the judgment score + 2. This prevents warranty paperwork from inflating Durability on products that won't survive long enough to use the warranty. A 20-year glass warranty on a product expected to last 12-18 years is functionally a 12-18 year warranty. This rule only triggers on products where warranty terms overpromise relative to field reality. The cap applies upward only -- it never deflates a score, only limits inflation. Threshold tightened from 2.0 to 1.5 points per council validation, March 2026.

| Metric | Scoring |
|---|---|
| Glass/IGU warranty | 25+ years = 10. 20 years = 8. 15 years = 7. 10 years = 6. 5 years = 4. Less than 5 = 2. |
| Non-glass component warranty | 20+ years = 10. 15 years = 9. 10 years = 8. 7 years = 7. 5 years = 6. Less than 5 = 4. |
| Exterior finish warranty | 20+ years = 10. 15 years = 9. 10 years = 8. 5 years = 6. Less than 5 = 4. |
| P1 chamber results (if available) | 20+ weeks = 10. 15-19 weeks = 9. 10-14 weeks = 8. 5-9 weeks = 6. Under 5 weeks = 4. Not published = no score (data completeness flag). |
| Proration | Non-prorated = 10. Prorated after 15+ years = 8. Prorated after 10 years = 6. Prorated after 5 years = 4. |

**Judgment-based elements (50% of this subscore):**
- Documented multi-decade installations and their condition
- Documented failure mode timeline (when do seals typically fail for this product?)
- Frame material longevity track record (wood rot history, vinyl degradation, fiberglass stability)

Structured tiers:
- 30+ year documented track record with minimal issues = 9-10
- 20-30 year track record, manageable issues = 7-8
- 15-20 year expected life, some documented degradation patterns = 5-6
- Under 15 years expected or widespread early failures = 3-4
- Under 10 years or documented premature failure pattern = 1-2

### 2B. Materials Durability (37.5% of Durability)

**BASE SCORE ARCHITECTURE — Council Ruling, March 8, 2026 (3-0 unanimous):**  
The numbers in the Frame Material table below are **base scores (starting points)**, not hard ceilings. Documented adjustments operate above AND below the base. The rubric conspicuously omits the explicit ceiling language it uses elsewhere (e.g., "Professional Consensus cannot exceed 7.5") — that omission is intentional. The evidentiary gate (not a score ceiling) is the inflation control: every positive adjustment requires independent citation. Manufacturer claims alone are insufficient.

**Tier overlap is intentional:** The best-documented aluminum-clad wood product may reach the same net 2B as a baseline fiberglass product. This reflects real quality differences that experienced builders and product specifiers recognize. It does not indicate a scoring error.

**Intermediate arithmetic is not a score:** When an adjustment path produces an intermediate value above the base (e.g., base 8 → +1 → 9 → -1 → net 8), the intermediate step is arithmetic, not a published score. The Challenge Bot checks NET FINAL scores only.

**Per-class maximums (net 2B cannot exceed these without exceptional documentation):**
- Composite/proprietary (Fibrex/equivalent): base 6 + max documented adjustment (+1) = net ceiling **7**
- Vinyl-clad wood: base 7, adjustment ±1
- Aluminum-clad wood (roll-form): base 7, adjustment ±1
- Aluminum-clad wood (extruded): base 8, adjustment ±1
- Pultruded fiberglass: base 9, adjustment ±1

**Deterministic elements (70% of this subscore):**

| Frame Material | Base Score | Adjustments |
|---|---|---|
| Fiberglass (pultruded) | 9 | +1 if thermal expansion matches glass (reduces seal stress) |
| Wood-clad, aluminum cladding (extruded) | 8 | +1 for documented cladding gauge and finish system. -1 if cladding system has documented failure pattern. Extruded vs. roll-form is a real quality distinction; the rubric captures it. |
| Wood-clad, aluminum cladding (roll-form) | 7 | +1 for documented longevity track record. -1 for documented failure pattern. |
| Wood-clad, vinyl cladding | 7 | +1 for documented longevity track record. -1 for documented color substrate issues on non-white. |
| Premium vinyl (foam-filled or 15+ chambers, welded corners) | 7 | +1 for documented titanium dioxide content and UV resistance data. |
| Standard vinyl (hollow, mechanical corners, fewer chambers) | 5 | -1 if documented UV degradation or warping pattern. |
| Composite/proprietary (Fibrex, etc.) | 6 | +1 for published composition and longevity data. -1 for documented serviceability limitations (e.g., no glazing bead = sash replacement only). **Net 2B ceiling: 7.** |
| Aluminum without thermal break | 4 | Thermal bridging inherently limits durability of seals and interior condensation management. |
| Aluminum with thermal break | 7 | Quality of thermal break determines adjustment (polyamide = +1, PVC = 0). |

| Seal System | Score Adjustment |
|---|---|
| Triple-pane with dual seal | +1 to base material score |
| Double-pane with dual seal | +0.5 |
| Double-pane with single seal | +0 |
| Seal system unknown | -0.5 with data completeness flag |

**CALIBRATION TRANSPARENCY NOTES (required for specific products in calibration set):**

*Pella Lifestyle Series CSM — 2B net 8.5:* Net 2B of 8.5 exceeds material class base of 8 (aluminum-clad wood). This is valid under base score architecture: +1 applied for extruded aluminum cladding (confirmed), seal system +0.5 applied, total deterministic = 9.5 → judgment brings to net 8.5. Intermediate value exceeds base before seal adjustment. Per base score architecture, the net is the governing number.

*Pella Architect Series/Reserve CSM — 2B net 8.1:* Base 8 (aluminum-clad wood, extruded aluminum confirmed) + 1 (extruded aluminum cladding, documented) − 1 (documented failure pattern: MDL Case 1:13-F-02514, 2014, water infiltration at sill/jamb gasket) = net 8, + 0.5 dual seal + judgment adjustment = 8.1. The +1 and −1 are independently documented and offsetting. Intermediate value of 9 (before −1 offset) is arithmetic, not a score.

*Andersen A-Series DH — 2B net 6.80 (corrected March 8, 2026):* Base 6 (Composite/Fibrex) + 1 (published composition and 25-year longevity data) = 7; glazing bead confirmed cosmetic-only per Andersen help center (sash replacement required); net deterministic 6.5 (including dual-seal +0.5, -1 serviceability captured in deterministic adjustment); judgment 7.5; final 2B = 6.80. Prior score of 7.31 was invalid — exceeds max achievable for composite class (7). See A-Series 2B Correction Memo for full arithmetic.



### 2C. Repairability & Support (25% of Durability)

**Deterministic elements (60% of this subscore):**

| Metric | Scoring |
|---|---|
| IGU replacement method | Glass-only swap via glazing bead = 10. Full sash replacement required = 6. Full window replacement required = 3. |
| Parts availability commitment | Parts guaranteed 20+ years = 10. 15 years = 8. 10 years = 7. 5 years = 5. No commitment = 4. |
| Labor warranty coverage | Parts + labor = 10. Parts only with low labor cost = 7. Parts only = 6. Limited parts coverage = 4. |
| Warranty transferability | Fully transferable, non-prorated = 10. Transferable, prorated = 7. Not transferable = 4. |
| Dealer/service network | Manufacturer-direct service = 10. Nationwide certified dealer network = 9. Regional dealer network = 7. Dealer-dependent, variable = 6. Limited/no service network = 4. |

**Judgment-based elements (40% of this subscore):**
- Documented warranty claims experience (how does the manufacturer actually handle claims?)
- Post-warranty parts availability track record
- Brand stability and company financial health

Structured tiers:
- Documented decades of parts availability + positive claims experience + $1B+ company = 9-10
- Good parts availability + generally positive claims experience + stable company = 7-8
- Adequate parts + mixed claims experience = 5-6
- Limited parts + difficult claims process or small/unstable company = 3-4
- No parts infrastructure or company stability concerns = 1-2

---

## AXIS 3: PERFORMANCE (Scored 1-10) -- Systems categories only

Performance measures how well the product does its primary job, based on independently certified test data.

### 3A. Thermal Performance (25% of Performance)

**100% deterministic. No judgment-based elements.**

| U-Factor (Total Unit, NFRC Certified) | Score |
|---|---|
| ≤0.15 | 10 |
| 0.16-0.18 | 9.5 |
| 0.19-0.20 | 9 |
| 0.21-0.23 | 8 |
| 0.24-0.25 | 7.5 |
| 0.26-0.28 | 7 |
| 0.29-0.30 | 6.5 |
| 0.31-0.33 | 6 |
| 0.34-0.36 | 5 |
| 0.37-0.40 | 4 |
| >0.40 | 3 |
| Not NFRC certified | 2 with Red Finding |

**Data requirement:** NFRC total-unit U-factor for the specific configuration and size being evaluated. Center-of-glass values are NOT acceptable. If total-unit is unavailable, score receives "Partial" data completeness with the center-of-glass value noted and a -1 adjustment applied as an approximation penalty.

**Accepted Tier 1 U-Factor sources (council-validated March 2026 — Item 10-A):**

| Source | Treatment | Notes |
|---|---|---|
| NFRC Certified Products Directory (whole-unit) | Score directly — no adjustment | Primary US standard |
| Passive House Institute (PHI) Certified Component | Score directly — no approximation penalty | PHI certification requires independent laboratory testing under ISO 12567. Rigorously audited. No delta-T adjustment penalty when PHI is the sole U-Factor source. |
| PHIUS (Passive House Institute US) certified component | Score directly — no approximation penalty | Same standing as PHI |
| EN 673 laboratory result (EU standard, Notified Body tested) | Apply +0.02 delta-T adjustment default | EN 673 uses 10°C delta-T vs NFRC 22.2°C delta-T. Products tested at lower delta-T typically report slightly better U-Factor. Add 0.02 to the published value before scoring. If manufacturer provides a site-specific delta-T correction, use that value instead. |

**PHI Tier 1 rationale:** PHI certification requires testing by an independent accredited laboratory using validated methodology. PHI-certified products carry real verified data — applying an approximation penalty when PHI data exists would penalize transparency. When both NFRC and PHI values are available, use the NFRC value (US market standard). When PHI is the only source, score from PHI value without penalty.

### 3B. Solar Heat Gain (10% of Performance)

**100% deterministic. Climate-zone adjusted.**

SHGC scoring depends on the climate zone of the intended installation. If evaluating for a general/national audience, score using Northern zone (heating-dominated) as default with Southern zone score noted.

| SHGC | Northern Zone Score (Heating) | Southern Zone Score (Cooling) |
|---|---|---|
| ≤0.20 | 6 (blocks beneficial solar gain) | 10 (excellent heat rejection) |
| 0.21-0.25 | 7 | 9 |
| 0.26-0.30 | 8 | 8 |
| 0.31-0.35 | 9 | 7 |
| 0.36-0.40 | 10 (maximum passive solar benefit) | 6 |
| >0.40 | 9 (diminishing returns, overheating risk) | 5 |

### 3C. Condensation Resistance (15% of Performance)

**100% deterministic.**

| CR Rating (NFRC) | Score |
|---|---|
| ≥70 | 10 |
| 60-69 | 9 |
| 50-59 | 8 |
| 40-49 | 7 |
| 30-39 | 6 |
| 20-29 | 5 |
| <20 | 4 |
| Not published | 5 with "Partial" data completeness flag and Yellow Finding for opacity. Not publishing an optional rating earns midpoint, not credit. |

### 3D. Air Infiltration (25% of Performance)

**100% deterministic. Scoring input determined by disclosure level per Universal Principle 3.**

**Air Infiltration — accepted input sources (council-validated March 2026 — Item 10-B):**

| Source | Treatment | Scoring Tier |
|---|---|---|
| NFRC certified AI value (cfm/ft²) | Score directly from table | Standard |
| EN 12207 Class 4 air permeability test | Convert to equivalent cfm/ft² and score. Class 4 = ≤0.10 m³/(h·m²) at 100 Pa. Area-referenced conversion: ~0.034–0.036 cfm/ft² → score 10. | Tier 2 — Yellow Finding noting non-NFRC source; no score cap |
| EN 12207 Class 3 or lower | Use as certification floor only — score 7 (Class 3 cert floor). Yellow Finding required. | Tier 2 floor |
| Energy Star certified, no specific value | Score from 0.30 certification floor | Standard |
| No certification, no value | Tier 2 — exclude and redistribute | N/A |

**EN 12207 conversion note:** EN 12207 uses area-referenced air permeability in m³/(h·m²) at 100 Pa. Class 4 (the highest EU residential grade) requires ≤0.10 m³/(h·m²). Converting to ASTM E283 cfm/ft² units: 0.10 m³/(h·m²) ÷ 196.85 (unit conversion) × 1.13 (pressure adjustment factor 100 Pa → 75 Pa ASTM) ≈ 0.034–0.036 cfm/ft². This is a score 10 input — EN 12207 Class 4 represents genuine high performance, not a weak certification. The prior briefing document stated 0.10–0.16 cfm/ft² for Class 4; that figure was incorrect (joint-length metric confused with area-referenced metric) and is superseded by this corrected conversion.

**What this means for "Not NFRC certified" products:** The "Not NFRC → score 2 with Red Finding" rule in Thermal Performance (3A) does NOT automatically apply to Air Infiltration for products certified under EN 12207 Class 4. EN 12207 Class 4 is accepted Tier 2 input for AI scoring. Products with no NFRC and no EN 12207 Class 4 still receive Tier 2 (exclude and redistribute) treatment for AI.



| Disclosure Level | Scoring Input | Treatment |
|---|---|---|
| Specific tested value published (e.g., 0.11 cfm/ft²) | The published value | Score directly from table below |
| Bounded threshold published (e.g., "<0.20" or "≤0.20") | The stated boundary value | Score from boundary value in table below |
| Energy Star certified, no specific value published | 0.30 cfm/ft² (Energy Star certification floor) | Score from 0.30 in table below. Not a penalty -- 0.30 is the only verified number available. Manufacturer may rescore at any time by publishing a specific value. |
| No Energy Star certification, no published value | N/A | Tier 2 -- exclude and redistribute weight |

**Step 2: Score from table using the input determined above.**

| Air Infiltration (ASTM E283, cfm/ft²) | Score |
|---|---|
| ≤0.10 | 10 |
| 0.11-0.13 | 9 |
| 0.14-0.16 | 8 |
| 0.17-0.20 | 7 |
| 0.21-0.25 | 6 |
| 0.26-0.30 | 5 |
| >0.30 | 4 |

**What this means in practice:**
- A manufacturer that publishes their specific tested value is scored on their actual performance.
- A manufacturer that publishes a bounded threshold (e.g., "<0.20") is scored from that boundary -- this is honest disclosure and earns no penalty.
- A manufacturer that holds Energy Star certification but publishes no AI value is scored at the certification floor of 0.30 (score: 5). They receive credit for being certified. They lose credit for not disclosing where in the certified range they actually land.
- Publishing a specific value can only help a manufacturer, never hurt them -- if their actual number is worse than 0.30, they should not be Energy Star certified.

**Note on "≤0.3" or "< 0.3" published claims:** A threshold publication that merely restates the Energy Star certification minimum (0.30) is not meaningful disclosure -- it tells the buyer nothing beyond what the certification already implies. Treat these as "no specific value published" and score from the 0.30 certification floor.

**Critical note:** Double-hung windows are inherently less airtight than casements due to physics (more seams, more weatherstrip length, no pull-in compression lock). This is a product-type characteristic, NOT a product defect. All AI scores are compared within configuration type (DH vs DH, casement vs casement). The report should note if casement versions of the same product line achieve significantly better air infiltration. Configuration is tagged on every evaluation file -- never compare across configurations in a score table without a clear notation.

### 3E. Structural Performance (15% of Performance)

**100% deterministic.**

| Performance Grade (AAMA/FGIA PG) | Score |
|---|---|
| PG50+ | 10 |
| PG45 | 9 |
| PG40 | 8 |
| PG35 | 7 |
| PG30 | 6 |
| PG25 | 5 |
| PG20 or below | 4 |
| CE marking + EN 14351-1 Class 5 | 8 with Yellow Finding (not AAMA/FGIA; European Notified Body certified) |
| CE marking + EN 14351-1 Class 4 | 7 with Yellow Finding (not AAMA/FGIA; European Notified Body certified) |
| CE marking + EN 14351-1 Class 3 | 6 with Yellow Finding (not AAMA/FGIA; European Notified Body certified) |
| CE marking only (class not documented) | 5 with Yellow Finding |
| Not AAMA/FGIA certified, no CE marking | 4 with Yellow Finding |

**CE marking rationale (council-validated March 2026 — Item 10-C):** CE marking under EN 14351-1 is mandatory for all windows sold in the EU since 2010 and requires independent Notified Body testing — the European equivalent of an AAMA-accredited laboratory. Scoring CE structural results at 4 (the no-certification floor) was incorrect. The class-based scale above reflects genuine structural performance certification at each tier. A ~1 point premium over equivalent AAMA PG levels reflects EN 14351-1's combined scope (structural load, water penetration, and air permeability in a single certification).

**European delta-T penalty rule (council-validated March 2026 — Item 10-D):**

| U-Factor source | Delta-T penalty |
|---|---|
| PHI or PHIUS certified | No penalty (see 10-A above) |
| CE only (no PHI), EN 673 tested | −0.5 score adjustment after table scoring |
| NFRC certified | No penalty (native protocol) |

The previous −1.0 penalty for CE-only products has been reduced to −0.5. Rationale: the EN 673 vs NFRC protocol difference is a methodological translation gap, not a product deficiency. A −1.0 penalty over-punished a product for not holding a US certification it was not designed to seek. The −0.5 adjustment preserves appropriate weighting for protocol differences without distorting the score beyond what the technical gap warrants.

**Note:** This scale is calibrated for residential applications where PG30-40 is typical. PG50+ exceeds residential requirements and earns full credit. Commercial/high-rise evaluations would use a different scale. Score the STANDARD Performance Grade for the evaluated configuration. If PG upgrades are available, note them in the report but do not score the upgrade unless the evaluation is specifically for the upgraded configuration.

### 3F. Visible Light Transmittance (10% of Performance)

**100% deterministic.**

| VT (NFRC Certified, Total Unit) | Score |
|---|---|
| ≥0.60 | 10 |
| 0.55-0.59 | 9 |
| 0.50-0.54 | 8 |
| 0.45-0.49 | 7 |
| 0.40-0.44 | 6 |
| 0.35-0.39 | 5 |
| <0.35 | 4 |

**Note:** VT is published on every NFRC label. Lower VT means less natural daylight enters the room. High-performance Low-E coatings and HeatLock coatings can reduce VT as a tradeoff for thermal performance. The report should note this tradeoff when VT scores below 7 alongside strong U-factor scores.

---

## MANDATORY PRE-SCORING SEARCH PROTOCOL

Before any metric is flagged as "Unknown/Unverified" or "Not published," the following search tiers must be exhausted in order. An "Undisclosed" flag is only defensible after Tiers 1-3 have been completed and documented.

### Tier 1: Primary Certified Databases (MANDATORY)
- NFRC Certified Products Directory (nfrc.org) for the exact configuration and size
- AAMA/FGIA Certified Products Database for structural performance data
- If data is found here, it is authoritative. Search complete for that metric.

### Tier 2: Manufacturer Technical Documentation (MANDATORY if Tier 1 incomplete)
- Manufacturer's professional/architectural specification guide (NOT the consumer brochure)
- Manufacturer's published NFRC performance tables on their website
- Manufacturer's AAMA test report if publicly accessible
- These are where spacer types, weather stripping details, balance system class, and detailed component specs typically live.

### Tier 3: Direct Manufacturer Inquiry (MANDATORY if Tier 2 incomplete)
- Contact manufacturer's technical support or architectural services department
- One email or phone call asking for the specific missing data point
- Document the inquiry date, contact method, and response (or non-response)
- A manufacturer that does not respond within 10 business days is documented as "Inquiry made [date], no response received"

### Tier 4: Building Science Community Sources (RECOMMENDED if Tiers 1-3 incomplete)
- GreenBuildingAdvisor articles and Q&A (e.g., Dana Dorsett identifying Cardinal LoE-i89)
- Fine Homebuilding technical content
- BuildingScience.com (Joe Lstiburek)
- Independent consultant analysis (Jay Johnson component identification, The Window Dog)
- Professional contractor forums (ContractorTalk, Houzz)

### Tier 1: "True Active Vagueness" -- SCORE FROM CERTIFICATION FLOOR
The company holds a certification that required testing this metric, has the data, and has published either nothing or a threshold that merely restates the certification minimum (e.g., "≤0.3 cfm/ft²" when that is the Energy Star floor). The certification floor is the only verified number available.
**Scoring rule:** Score from the certification floor using the standard deterministic rubric. For AI: Energy Star floor = 0.30 cfm/ft² → score 5. This is not a penalty -- it is the honest score anchored to what was actually verified. The manufacturer can improve their score at any time by publishing a specific tested value.
**Distinction from bounded threshold disclosure:** A manufacturer that publishes "<0.20" or "≤0.20" is making a meaningful claim that narrows the range below the certification minimum. That is honest disclosure -- score from the stated boundary value, not the certification floor. Only treat as Tier 1 when the published threshold offers no information beyond what the certification already implies.

### Tier 1.5: "Certified but Not in ADM" (Data Exists in Databases) -- SCORE FROM DATABASE
The metric does not appear in the manufacturer's printed ADM or spec sheets, but IS found in the NFRC Certified Products Directory, AAMA/FGIA database, or Energy Star certification records with a specific value.
**Scoring rule:** Score from the database value using the standard deterministic rubric. The data is public and verifiable -- it just wasn't in the printed literature. Data completeness grade reflects the extra research required but the score is not penalized.
**Important:** If the database contains a specific tested value (e.g., CR 55 in the NFRC CPD), that value governs. If the database confirms certification but does not contain a specific value for the metric, fall back to Tier 1 certification floor scoring -- never estimate from other subscores. Averaging other subscores to estimate an unknown metric is circular and non-reproducible and is no longer permitted.

### Tier 2: "Genuinely Not Found" (Optional Metric, No Data in Any Public Source) -- EXCLUDE AND REDISTRIBUTE
The metric is optional per NFRC (AL and CR are optional), does not appear in manufacturer documentation, is NOT found in the NFRC CPD, and is not required by the product's certification pathway. This is genuine absence, not strategic omission.
**Scoring rule:** EXCLUDE the metric from the Performance calculation. Redistribute weight proportionally across confirmed metrics. Product is not penalized for following normal industry practice. Data completeness grade reflects the gap. Maximum exclusion: if more than 50% of Performance weight would be excluded, the Performance axis is flagged "Insufficient Data" and excluded from the Overall score.
**Anti-gaming provision:** If the product is Energy Star certified, air leakage CANNOT be Tier 2 (Energy Star requires AL ≤0.3, so data exists). Classify as Tier 1.5 minimum. If more than 50% of the competitive set publishes a given optional metric, any product omitting it upgrades from Tier 2 to Tier 1.5.

### Mandatory NFRC CPD Cross-Check
Before classifying ANY metric as Tier 2, the analyst MUST search the NFRC Certified Products Directory for the manufacturer's product family. NFRC CPD contains certified values that may not appear in printed ADMs. If data is found in CPD, classify as Tier 1.5 and score from database values. This check is non-negotiable and must be documented in the Search Protocol Status table.

### Data Source Hierarchy for Tier Classification
| Priority | Source | Tier Classification |
|---|---|---|
| 1 | Manufacturer's printed ADM / spec sheets with specific value | Score normally from rubric table |
| 2 | NFRC Certified Products Directory (CPD) with specific value | Tier 1.5 -- score from database value |
| 3 | Energy Star / AAMA certification records with specific value | Tier 1.5 -- score from database value |
| 4 | Manufacturer publishes bounded threshold narrower than certification floor (e.g., "<0.20" when floor is 0.30) | Score from stated boundary value -- this is honest disclosure, no penalty |
| 5 | Certification held, no specific value in any public source | Tier 1 -- score from certification floor. Not a penalty, just the only verified number available. |
| 6 | No certification, no data found in any public source, metric is NFRC-optional | Tier 2 -- exclude and redistribute |
Every "Unknown/Unverified" or "Not published" flag must document what was searched:
- "CR rating: Not found in NFRC CPD [searched MM/DD/YYYY]. Not found in Andersen Professional Guide [document version/date]. Inquiry sent to Andersen Architectural Services [MM/DD/YYYY] -- [response status]."

### Maximum Source Age
- NFRC/AAMA certified data: No age limit (certification is current until decertified)
- Manufacturer technical documentation: Maximum 36 months from document date. Documents older than 36 months require verification that the product line has not changed.
- Field intelligence and forum data: Maximum 24 months (per staleness rule)

---

## FIELD INTELLIGENCE (Qualitative Layer -- NOT Scored Numerically)

Field intelligence is presented alongside numeric scores but does NOT affect them. It uses structured categorical tiers with published criteria.

### Tier Definitions

| Tier | Criteria | Minimum Evidence Threshold |
|---|---|---|
| **Excellent** | Professionals consistently praise this product with no meaningful criticism of field performance. | 5+ independent professional sources with positive assessment. Zero professional sources documenting patterns of field failure. |
| **Good** | Professional consensus positive. Minor field issues documented but not patterns. | 3+ independent professional sources positive. Issues documented are isolated, not patterns. |
| **Mixed** | Professional opinions split. Some positive, some negative. OR limited professional data available. | Documented positive AND negative professional assessments. OR fewer than 3 professional sources total. |
| **Concerning** | Multiple professional sources document field performance issues. Pattern of complaints evident. | 3+ independent professional sources documenting the same type of field issue. OR class action / regulatory action documented. |
| **Poor** | Professionals actively warn against this product based on field experience. | 5+ independent professional sources with negative assessment. OR active recall. |

### Field Intelligence Categories (reported separately)
- **Air tightness field experience:** What do installers and occupants report?
- **Seal longevity field experience:** Documented seal failure patterns and timelines?
- **Warranty claims experience:** How does the manufacturer handle claims in practice?
- **Installation sensitivity:** How dependent is performance on installer quality?
- **Parts availability experience:** Can parts actually be obtained when needed?

### Staleness rule
Field intelligence is dated. Maximum validity window is 24 months from the most recent source consulted. Reports older than 24 months carry a staleness flag.

---

## DATA COMPLETENESS GRADING

Every evaluation axis carries a data completeness indicator.

| Grade | Definition |
|---|---|
| **A (Complete)** | All required primary source data obtained and verified from NFRC CPD, AAMA/FGIA database, or manufacturer's AAMA-certified test report. |
| **B (Substantial)** | Most data from primary sources. 1-2 metrics from manufacturer documentation (not independently certified). |
| **C (Partial)** | Mix of primary and secondary sources. Some metrics estimated or approximated. Report notes which specific metrics are estimated. |
| **D (Limited)** | Key metrics unavailable. Multiple metrics scored with data completeness penalties. Report prominently flags limitations. |
| **F (Insufficient)** | Critical metrics missing. Product cannot be meaningfully scored on one or more axes. Axis marked "Not Rated" rather than estimated. |

---

## VALUE INDICATOR (Separate from Scores)

Value is reported separately and never affects the Quality, Durability, or Performance scores.

| Value Tier | Definition |
|---|---|
| **Exceptional Value** | Scores exceed price positioning by 1+ letter grade. Product performs like a B+ but is priced like a C+. |
| **Expected Value** | Scores match price positioning. You get what you pay for. |
| **Below Expected Value** | Scores fall below price positioning by 1+ letter grade. Product performs like a B- but is priced like a B+. |

Value assessment requires pricing data from dealer quotes, published MSRP, or documented market pricing. If pricing is unavailable, Value Indicator is "Not Assessed."

---

## OVERALL SCORE CALCULATION

Overall = (Quality + Durability + Performance) / 3

Each axis is weighted equally. The council recommended user-adjustable weights tied to buyer archetypes as a future enhancement, but v1 uses equal weighting for simplicity and defensibility.

**Future enhancement (planned):** Buyer archetype weighting:
- "Cold Climate Comfort" -- overweights Performance (thermal + air infiltration)
- "Coastal Durability" -- overweights Durability (structural + materials + weather resistance)
- "Budget Conscious" -- overweights Quality (component grade + value indicator)

---

## COMPETITIVE CALIBRATION REQUIREMENT

No product score is published in isolation. Every evaluation includes a minimum of 5 competing products scored with the same rubrics, same data source types, same reference unit dimensions, and same methodology.

**Rigid Reference Unit (by window type):**
- Double-Hung: 36" x 60" (3060), standard glazing package, no grilles
- Casement: 30" x 48" (3048), standard glazing package, no grilles
- Sliding Patio Door: 72" x 80" (6080), standard glazing package

All NFRC/AAMA data pulled for the reference unit size. If a manufacturer does not publish data for the exact reference size, the closest available size is used with a note.

**Glazing Comparability Standard:** For each product in the competitive set, use the manufacturer's standard Energy Star-qualifying glazing package as the comparison configuration. If a manufacturer offers multiple Energy Star packages, use the one most commonly specified in new construction for the relevant climate zone. Document the exact glazing package for each competitor. If standard packages differ significantly across competitors (e.g., one defaults to triple-pane, another to double-pane), score both the standard configuration and note the upgrade path available.

---

## VERSION HISTORY

- **v4 (March 6, 2026):** Four changes from council session and post-session methodology development. (1) Universal Principles reference added -- this rubric now inherits all 12 principles in `residentialist_universal_rubric_principles.md`. Load universal principles before this document in every scoring session. (2) Air Infiltration 3D completely rewritten per Universal Principle 3 (Certification Floor Scoring). Three-tier disclosure system replaces flat vague-reporting penalty: specific value scores from table; bounded threshold narrower than certification floor (e.g., "<0.20") scores from stated boundary; Energy Star certified with no specific value scores from certification floor (0.30 cfm/ft² → score 5). "Average of other subscores" method for unknown AI retired -- non-reproducible and circular. (3) Warranty-Lifespan Alignment Rule threshold tightened from 2.0 to 1.5 points per 2-1 council vote (Consumer Advocate + Technical Purist). (4) Tier 1 Active Vagueness redefined: threshold publications narrower than the certification minimum are honest disclosure, not vagueness. Only publications that restate the certification floor without adding information are Tier 1. Tier 1.5 updated: averaging other subscores to estimate unknown metrics is no longer permitted -- fall back to certification floor if no specific database value exists.
- **v3 (March 5, 2026):** Three-tier data treatment added per council validation. Tier 1 (active vagueness, score 5), Tier 1.5 (certified-but-not-in-ADM, score from database), Tier 2 (genuinely not found, exclude and redistribute with 50% maximum exclusion threshold). Mandatory NFRC CPD cross-check required before any Tier 2 classification. Anti-gaming provisions: Energy Star products cannot classify AL as Tier 2; metrics published by 50%+ of competitive set cannot be Tier 2. Data source hierarchy published. Warranty-Lifespan Alignment Rule added to Durability 2A at 2.0-point threshold.
- **v2 (March 5, 2026):** Council review fixes. (1) Unknown/unverified defaults dropped from 6-7 to 5 across all components. (2) Spacer double-count eliminated. (3) Air infiltration tiers recalibrated. (4) CR "not published" dropped from 6 to 5. (5) Structural PG recalibrated for residential. (6) VT added as new Performance subscore at 10% weight. (7) Mandatory pre-scoring search protocol added. (8) Glazing comparability standard defined.
- **v1 (March 5, 2026):** Initial rubric build. Council returned 7.1/10 average with specific implementation gaps identified.


---

## PART 4 — UNIVERSAL RUBRIC PRINCIPLES v1.1

# THE RESIDENTIALIST
# Universal Rubric Principles
# Version 1.0 — March 2026

---

## ABOUT THIS DOCUMENT

This document contains the foundational scoring principles that apply to every product category The Residentialist scores. It sits above all category-specific rubrics. Every category rubric inherits these principles automatically without restating them.

When a category rubric and this document conflict, this document governs unless the category rubric contains an explicit, council-validated exception with documented justification.

Load this document before any category-specific rubric in every scoring session.

---

## PRINCIPLE 1: THE THREE-AXIS FRAMEWORK

Every product scored by The Residentialist is evaluated on three equal axes:

- **Quality** — the materials, construction, and engineering of the product
- **Durability** — how long the product will last and how well it is supported over its life
- **Performance** — how well the product does its primary job, measured from certified data where available

Each axis is scored on a 1 to 10 scale. The overall score is the simple average of the three axis scores. No axis is weighted above the others unless a category-specific rubric contains a council-validated exception.

---

## PRINCIPLE 2: DATA GOVERNS JUDGMENT

When certified, third-party test data exists for a metric, that data governs the score. Professional judgment fills gaps only when hard data is genuinely unavailable after exhausting the four-tier search protocol. Judgment-based scores are always distinguished from deterministic scores in the evaluation file.

The hierarchy of data sources, in order of authority:

1. Third-party certified test data (NFRC, AAMA, AHRI, WaterSense, KCMA, UL, and equivalent bodies)
2. Manufacturer published technical documentation (ADMs, spec sheets, installation guides)
3. Direct manufacturer inquiry with documented response
4. Building science community consensus from credentialed sources

---

## PRINCIPLE 3: CERTIFICATION FLOOR SCORING

This is the foundational data treatment rule for all categories.

**The principle:** Certification is evidence. If a product holds a recognized third-party certification that requires a minimum or maximum threshold on any measurable metric, and the manufacturer has not published a specific value for that metric, the certification threshold is the scoring input -- not a penalty score, not a midpoint default.

**Why:** The certifying body verified that the product meets the threshold. That is real, audited information. Scoring from the certification floor gives the manufacturer credit for what was verified while accurately reflecting what is publicly known.

**How it works:**

| Disclosure Level | Treatment | Scoring Input |
|---|---|---|
| Specific tested value published | Score directly from published value | The published value |
| Bounded threshold published (e.g., "< 0.20") | Score from the boundary value stated | The boundary value |
| Certification held, no specific value published | Score from the certification floor | The minimum/maximum the certification requires |
| No certification, no published value | Tier 2 treatment -- exclude and redistribute weight | N/A |

**The incentive structure this creates:**
- Publish your specific number: scored on your actual performance
- Hold a certification but stay silent: scored at the certification floor
- No certification and no data: excluded from the metric entirely

This is not punitive. It is honest. A manufacturer that publishes their number cannot score worse than a manufacturer that stays silent, because the silent manufacturer is scored at the worst value their certification permits.

**Applies to all categories.** Examples by category:

- **Windows:** Energy Star AI certification floor is 0.30 cfm/ft². AAMA structural PG class defines minimum load ratings.
- **Faucets:** WaterSense certification floor is 1.5 gpm maximum flow. Lead-free certification defines maximum lead content.
- **HVAC:** Energy Star SEER2 certification defines minimum efficiency floors. AHRI certification defines rated capacity.
- **Appliances:** Energy Star defines maximum energy consumption floors by appliance type.
- **Cabinets:** KCMA certification defines minimum structural performance on load, cycle, and finish tests.

When a new category is added, the first task before scoring begins is to identify all relevant certifications and their measurable thresholds. These become the certification floor scoring inputs for that category.

---

## PRINCIPLE 4: THE THREE-TIER DATA TREATMENT

For metrics where no certification floor exists, or where data falls outside the certification floor framework, use the three-tier data treatment.

**Tier 1 — Active Vagueness:**
The manufacturer holds a certification that implies a specific metric was tested, has the data, and chooses not to publish it -- with no bounded threshold offered. The certification floor (Principle 3) governs. Score from the certification minimum. This is not a penalty score. It is the only verifiable number available.

*True Active Vagueness -- pre-Principle 3 definition -- is now retired for certified products. Principle 3 replaces it for any product holding a relevant certification.*

**Tier 1.5 — Certified But Not in ADM:**
Data exists in a third-party certification database (e.g., NFRC CPD, AHRI directory) but was not included in the manufacturer's printed materials. Score from the database value. Mandatory cross-check of the relevant certification database is required before any Tier 2 classification is applied.

**Tier 2 — Genuinely Not Found:**
The metric is optional, the product holds no relevant certification that covers it, and the value does not appear in any public source after exhausting all four tiers of the search protocol. Exclude the metric and redistribute its weight proportionally to the remaining scored metrics. Maximum 50% of axis weight may be excluded via Tier 2 treatment.

---

## PRINCIPLE 5: UNKNOWN DEFAULT IS MIDPOINT, NOT ABOVE AVERAGE

When a metric must be estimated and no certification floor or database value is available, the default score is 5 -- the midpoint of the scale. It is never above 5. A score above 5 requires positive evidence. Absence of negative evidence is not positive evidence.

---

## PRINCIPLE 6: THE WARRANTY-LIFESPAN ALIGNMENT RULE

When professional judgment on expected product lifespan scores 1.5 or more points below the warranty deterministic average, cap the warranty deterministic score at judgment plus 2.

This prevents a product with an aggressive warranty from scoring high on Durability when building science and field evidence indicate the product will not survive long enough to make full use of that warranty.

The cap applies upward only. It never inflates a score. It only limits inflation caused by warranty terms that exceed the product's realistic lifespan.

*Threshold: 1.5 points. Council-validated March 2026. Previous threshold was 2.0 points.*

---

## PRINCIPLE 7: PROFESSIONAL CONSENSUS HAS A CEILING

Professional consensus scores (Quality 1C and equivalent in other categories) cannot push a quality axis score above what the deterministic material and manufacturing subscores would support without extraordinary documented justification.

Professional consensus is a signal, not an override. A product beloved by professionals but built from inferior materials does not earn a top Quality score on sentiment alone.

---

## PRINCIPLE 8: FIELD INTELLIGENCE IS QUALITATIVE, NOT SCORED

Field intelligence -- contractor feedback, homeowner reports, forum discussions, warranty claim patterns -- is documented in every evaluation file but does not contribute to any scored axis. It appears in its own section, clearly separated from scored metrics.

Field intelligence informs the evaluation. It does not determine it.

---

## PRINCIPLE 9: GEOGRAPHIC FLAGS ARE SEPARATE FROM SCORES

Product scores reflect the product. Geographic or market-specific factors -- dealer network coverage, regional parts availability, local contractor familiarity -- do not affect the product score.

Where geographic factors materially affect a buyer's real-world experience of the product, a geographic flag is surfaced in the consumer-facing output. The flag is triggered by a deterministic threshold, not editorial judgment. The flag specifies the affected regions, the nature of the limitation, and any available remediation pathway.

*Geographic flag system: council-validated March 2026.*

---

## PRINCIPLE 10: SCORES REFLECT THE STANDARD CONFIGURATION

All scores are based on the manufacturer's standard Energy Star-qualifying configuration for that product type -- not the optimized upgrade package, not the worst base configuration, not a custom specification.

If no Energy Star qualification exists for a product type, score from the manufacturer's standard configuration as shipped to a typical buyer in the relevant market segment.

---

## PRINCIPLE 11: THE COMPARABILITY STANDARD

All products within a category are scored against the same rubric, the same scale, and the same data sources. A product cannot receive different scores from the same rubric based on who is scoring it or when it was scored.

When a methodology change is made, affected products are rescored under the updated rubric. Scores from different rubric versions are not directly comparable and should not appear in the same comparison table without a version notation.

---

## PRINCIPLE 12: COUNCIL VALIDATION GOVERNS METHODOLOGY CHANGES

No change to this document or any category rubric takes effect without council validation. A council session is required for:

- Any new universal principle
- Any change to an existing universal principle
- Any change to a category rubric that affects how products are scored
- Any new category rubric before the first product is scored

Minor clarifications that do not affect scoring outcomes may be made administratively with documentation. The threshold for "affects scoring outcomes" is whether any product in the calibration set would receive a different score under the clarified language.

---

## PRINCIPLE 13: HIGHEST CERTIFIED STANDARD GOVERNS

When a product holds multiple certifications covering the same metric (e.g., both NFRC and PHI U-Factor, or both AAMA PG and EN 14351-1 structural class), the most stringent certified result for each metric is the scoring input.

"Most stringent" means the result that reflects the highest verified performance level. For U-Factor: the lower number. For structural class: the higher class. For air infiltration: the lower cfm/ft² value.

**Why:** Each certification represents an independent audit of the product. If two independent audits produce different results for the same metric, the better-verified result (the more demanding test with the better outcome) is the more reliable indicator of actual performance. Discarding the better result to score from a weaker certification does not serve buyers.

**Constraint:** Both certifications must be independently verified as current, whole-unit (not center-of-glass), and for the same configuration. If configurations differ, document the difference and use the configuration closest to the evaluation unit. Do not mix results from different product configurations without disclosure.

*Council-validated March 2026 — Item 10-E.*

---

## PRINCIPLE 14: GEOGRAPHIC CERTIFICATION TRUST FILTER

Third-party certifications are accepted as scoring inputs based on the regulatory and laboratory oversight framework of the issuing jurisdiction.

| Jurisdiction | Acceptance Status | Notes |
|---|---|---|
| United States | Accepted — Full | NFRC, AAMA/FGIA, Energy Star, AHRI, WaterSense, KCMA, UL |
| European Union | Accepted — Full | CE marking, EN standards, PHI/ift Rosenheim — Notified Body testing framework |
| Canada | Accepted — Full | CSA, NRCan — equivalent oversight framework to US |
| United Kingdom | Accepted — Full | BFRC, BSI — post-EU departure framework with equivalent rigor |
| Other OECD members | Accepted — Review Required | Document the certifying body and oversight framework. Apply Yellow Finding if framework is not independently verifiable. |
| China | Not Accepted for Scoring | CCC (China Compulsory Certificate) is government-issued and not independently audited. May be noted in evaluation but does not contribute to any score. |
| Russia | Not Accepted for Scoring | GOST certification framework lacks independent oversight for scoring purposes. Same treatment as China CCC. |

**Rationale:** Scoring inputs require independent, audited verification. Certifications where the issuing body is government-controlled without independent laboratory oversight cannot be treated as equivalent to third-party audit frameworks. This does not mean products from these markets are inferior — it means the certification alone is not sufficient evidence for scoring. Other positive evidence (PHI, NFRC, field testing) may still apply.

*Council-validated March 2026 — Item 10-F.*

---

| Version | Date | Changes | Council Session |
|---|---|---|---|
| 1.0 | March 2026 | Initial document. Principles 1-12 established. Certification Floor Scoring (Principle 3) replaces Active Vagueness for certified products. Warranty-Lifespan threshold tightened to 1.5 points (Principle 6). Geographic flag system established (Principle 9). Three-tier data treatment updated (Principle 4). | Windows Methodology Lock Session, March 2026 |
| 1.1 | March 6, 2026 | Added Principles 13 and 14. Principle 13: Highest certified standard governs when multiple certifications cover the same metric. Principle 14: Geographic certification trust filter — EU, US, Canada, UK accepted at full standing; China CCC and Russia GOST not accepted for scoring. | Council Items 10-E, 10-F |

---

## PENDING ITEMS (Not Yet Resolved)

1. **Geographic flag trigger threshold:** Define the deterministic dealer coverage threshold that triggers a geographic serviceability flag. Pending council definition.
2. **Q5 premise correction:** The 0.16 vs 0.02 Alpen discrepancy is a DH vs casement product-type difference, not an NFRC vs AAMA protocol difference. Correct the methodology record.
3. **Q6 representativeness definition:** Define "representative calibration set" to require frame material type diversity, not just product count and grade spread.

---

*The Residentialist -- Internal Use Only*
*Universal Rubric Principles v1.1*


---

## PART 5 — WINDOWS EVALUATION KNOWLEDGE v1.2

# Windows Eval Knowledge File

**Category:** Windows and Doors — Windows
**Version:** v1.2 — March 11, 2026
**Status:** Production-ready. Source hierarchy updated per council Items 11-A through 11-D. IGU longevity research added (IGMA 25-year field study, NREL 2023 degradation review).

Give this file to Bot 1 (source hierarchy section only) and Bot 2 (full file).

---

## Source Authority Hierarchy

*Council-validated March 6, 2026 — Items 11-A, 11-B, 11-C, 11-D*

### Tier 1 — Governing Sources

| Source | Authority | Independence Basis |
|---|---|---|
| Jay Johnson / WindowPurchase.com | PRIMARY — component taxonomy, spacer hierarchy, hardware quality, comparative product evaluation, P1 Chamber testing | Direct sales model — paid by buyers, not manufacturers. No dealer referral revenue. No brand partnership income. Publicly documented. |
| Green Building Advisor (GBA) editorial experts | TIER 1 — independent building science professionals | Expert contributors are credentialed building scientists operating without manufacturer sponsorship in editorial contexts |
| Building Science Corporation / BSC (Lstiburek) | TIER 1 — technical publications | Academic and research funding basis; no product endorsement revenue |
| PHI / PHIUS | TIER 1 — passive house certification authority | Certification-body role; no commercial product interest |
| ift Rosenheim | TIER 1 — European window testing authority | Accredited independent laboratory; Notified Body status |

**Tier 1 scoring rule:** 2+ Tier 1 sources in agreement = consensus established. 1 Tier 1 source = strong evidence, not full consensus.

### Tier 2 — Contributing Sources

| Source | Authority | Limitation |
|---|---|---|
| Fine Homebuilding | Contractor and architect field experience | Advertiser relationships with window manufacturers preclude Tier 1 standing; editorial content is still credible but weighted lower |
| The Window Dog | Product research and comparison content | Dealer referral model (commercial adjacency to brands reviewed); content is useful for product identification and comparison, not for independent quality verdicts |
| Consumer Reports | Independent consumer testing | Methodology disputed in building science community for windows specifically; useful as corroborating source |
| IBHS (Insurance Institute for Business and Home Safety) | Structural and weather resistance testing | Specialized scope; high credibility within that scope |
| Jeff Ludy / Houston Window Experts | **Installation methodology, flashing practices, warranty mechanics, consumer education ONLY** | Authorized Marvin Infinity dealer with commercial referral relationships (jeffslist.com). NOT brand evaluation authority under any circumstances. |

**Tier 2 scoring rule:** 1 Tier 1 + 2+ Tier 2 sources in agreement = strong evidence. Tier 2 alone can corroborate but cannot establish a verdict.

### Tier 3 — Corroborating Sources Only

Houzz contractor threads, Reddit trade forums, BBB, Trustpilot, Angi, Yelp, homeowner reviews.

**Tier 3 scoring rule:** Tier 3 only = Professional Consensus cannot exceed 5. Cannot establish any scored verdict. Use for failure-mode identification and pattern detection only, labeled explicitly as non-authoritative.

**Tier governance:** Tier 1 governs over Tier 2 and Tier 3. When a Tier 1 source contradicts a Tier 2 or 3 source, document the conflict and score from the Tier 1 assessment with the contradiction noted.

Do NOT use: manufacturer marketing materials, Amazon/retailer reviews, HomeAdvisor/Angi for brand evaluation.

---

### Jay Johnson Special Access Rule (Item 11-B)

Jay Johnson is a **transcript-only source.** He does not maintain a publicly searchable article archive in the conventional sense. His assessments are captured in transcripts, interview recordings, and documented conversations.

- A 404 error, broken link, or absence from a web search result is NOT a data gap for Jay Johnson.
- If Jay Johnson has evaluated the specific product line and configuration, that transcript is authoritative Tier 1 evidence regardless of whether it is currently findable via web search.
- **Absence is a Yellow Finding ONLY for:** US-manufactured products in active production that are "actively distributed in the US" (meaning: available for purchase through at least one national or multi-regional dealer network, not a regional specialty import).
- **Absence is NOT a Yellow Finding for:** European import products (e.g., Internorm, Zola, Loewen) or products distributed through a single-region or specialty channel. Jay Johnson's absence from the European import product record is expected, not a data gap.

---

### Houston Window Experts Enforcement Rule (Item 11-C)

Any use of Jeff Ludy / Houston Window Experts content for brand evaluation, product quality judgment, or comparative product recommendation triggers an **automatic Yellow Finding** in the evaluation file.

Yellow Finding text: *"Houston Window Experts content used for brand evaluation. Jeff Ludy is an authorized Marvin Infinity dealer with commercial referral relationships. This source is approved for installation methodology only. Brand evaluation content from this source is not accepted."*

This rule applies regardless of whether the HWE assessment is positive or negative.

---

### Four-Criterion Standard for Future Source Tier Assignment (Item 11-D)

When a source not on the Tier 1/2/3 lists above is encountered and must be assigned, use these four criteria:

1. **Revenue model:** Does this source earn money from product sales, dealer referrals, manufacturer sponsorships, or affiliated commissions? Yes = cannot be Tier 1. No = eligible for Tier 1 review.
2. **Methodology transparency:** Does the source document how they evaluated the product (testing methods, inspection approach, data sources)? Yes = Tier 1/2 eligible. No = Tier 3.
3. **Credential verification:** Can the source's professional credentials (contractor license, engineering degree, building science certification) be independently verified? Yes = Tier 1/2 eligible. No = Tier 2/3.
4. **Peer standing:** Is the source cited by or respected within the building science community (GBA contributors, Lstiburek citations, PHI network)? Yes = Tier 1 eligible. Unknown = Tier 2.

**Assignment rules:**
- All four criteria pass = Tier 1 eligible. Document and note in evaluation.
- Criteria 1 fails (commercial interest) but 2-4 pass = Tier 2 maximum.
- Criteria 2 fails (no methodology) = Tier 3 regardless of others.
- Any new Tier 1 assignment must be noted in the evaluation file as "Provisional Tier 1 pending council validation."



---

## Frame Material Hierarchy

| Frame Type | Quality Range | Durability Range | Key Notes |
|---|---|---|---|
| Pultruded fiberglass | 8.5–9.5 | 9.0–10 | Expands/contracts same rate as glass; highest seal integrity; paintable; 50+ yr lifespan |
| Fiberglass composite | 8.0–9.0 | 8.5–9.5 | Similar to pultruded with minor manufacturing variation |
| Aluminum-clad wood (premium) | 7.5–9.0 | 7.5–9.0 | Best interior aesthetics; aluminum protects exterior; wood interior requires climate control |
| Aluminum-clad wood (standard) | 6.5–8.0 | 7.0–8.5 | Standard execution of the clad-wood approach |
| Premium vinyl (foam-filled, heavy-wall, multi-chamber) | 6.0–7.5 | 6.5–8.0 | Significant quality range within vinyl; foam fill + multi-chamber + heavy wall = real performance difference from builder-grade |
| Aluminum (thermal break) | 5.5–7.5 | 7.0–8.5 | Strong, durable; thermal performance limited by aluminum conductivity |
| Standard vinyl (mid-grade) | 4.5–6.0 | 5.5–7.0 | Most common residential replacement window |
| Builder-grade vinyl | 2.0–4.5 | 3.0–5.5 | Thin wall, single/double chamber, no reinforcement; minimum spec |
| Aluminum (no thermal break) | 2.0–4.0 | 6.0–8.0 | High durability but poor thermal performance; appropriate for commercial, not residential |

---

## Spacer System Hierarchy
*Source: Jay Johnson / WindowPurchase.com — established from P1 Chamber testing*

| Spacer Type | Quality Score | Notes |
|---|---|---|
| Super Spacer (foam) | 9–10 | Warm-edge; flexible; best seal longevity |
| TGI / Swiggle (foam-based) | 8–9 | Warm-edge; strong performance |
| Duralite / comparable foam-based | 8–9 | Warm-edge |
| Thermix / stainless steel warm-edge | 7–8 | Warm-edge; stiffer than foam but better than aluminum |
| Aluminum spacer | 4–5 | Thermal bridge; highest condensation risk; fastest seal degradation |

**Key principle from Jay Johnson:** Aluminum spacers are a significant quality downgrade. Any manufacturer using aluminum spacers in a product positioned as premium is cost-optimizing at the expense of long-term seal performance.

---

## IGU Longevity Research — Field Data

Two authoritative studies establish the deterministic basis for IGU seal scoring. Use these data points when scoring the Durability axis, specifically seal longevity and IGU certification subscores.

### IGMA / Lingnell 25-Year Field Study (1980–2005)
*Source: Insulating Glass Manufacturers Alliance (IGMA) with HUD. Published through Oak Ridge National Laboratory. Tier 1.*

~2,400 IGUs across 140+ buildings in 14 U.S. cities. Inspected at 10, 15, and 25 years.

**Failure rates by certification class at 25 years:**
| Certification Class | Failure Rate at 25 Years |
|---|---|
| CBA (highest) | 3.6% |
| C / CB (lower) | 14%+ (estimated 20%+ accounting for units already re-glazed before final inspection) |

A second phase (1990) tracked 10,944 CBA-certified units across 102 buildings: 1% failure rate at 15 years.

**Key findings:**
- 60% of all failures were caused by glazing systems that trapped water near the edge seal — meaning installation and drainage design, not the IGU itself, was the primary longevity killer
- Climate had almost no effect on failure rate — results were consistent across hot, cold, wet, dry, sea-level, and mountain locations
- CBA certification (now ASTM E2190) is the most predictive single indicator of IGU longevity

**Scoring implication:** ASTM E2190 (formerly CBA) certification is not a checkbox — it carries a documented 4x failure rate reduction over 25 years vs. uncertified or lower-certified units. Score it accordingly on the Durability axis. Products that do not publish IGU certification tier should be scored at midpoint on this subscore.

### NREL / University of Colorado IGU Degradation Review (2023)
*Source: National Renewable Energy Laboratory. Most current academic synthesis of IGU durability literature. Tier 1.*

**Key findings:**
- Commercial windows have a documented lifespan of 20–30 years vs. 50–60 year building life — windows are typically the first major envelope component to fail
- **Argon gas loss:** Ongoing from day one. A 32% increase in U-factor is possible from argon gas loss alone over the product's life. Aluminum spacers leak more than warm-edge (foam) spacers. Heat accelerates loss.
- **Sealant chemistry:** Silicone secondary sealants consistently outlast polysulphide sealants — better UV resistance, better elastic recovery, less temperature-dependent gas permeability
- No current accelerated test reliably predicts actual field lifespan — lab certification is necessary but not sufficient

**Scoring implication:** Silicone vs. polysulphide secondary sealant is a documented durability differentiator. When manufacturers disclose sealant chemistry, score silicone higher. When undisclosed, use midpoint — do not assume silicone. The 32% U-factor degradation from argon loss reinforces the warm-edge spacer scoring premium already in the Spacer System Hierarchy above.

### The Five Longevity Factors (Synthesis)
The combined field and laboratory data resolves to five factors that predict IGU longevity. A window with all five has documented near-zero failure risk at 25 years:

1. ASTM E2190 (CBA-class) certified insulating glass
2. Silicone secondary sealant (not polysulphide)
3. Warm-edge spacer (foam-based — Super Spacer, TGI, Duralite or equivalent)
4. Glazing system that drains water away from the edge seal (drainage design, not product spec — note as installation dependency)
5. Competent installer (plumb, level, properly flashed)

Factors 1–3 are product-scorable. Factor 4 is partially product-scorable (frame drainage design) and partially installation-dependent. Factor 5 is outside product scope — note as installation dependency in DATA CONFIDENCE section.

---

## Glass System Hierarchy

| Glass Configuration | Quality Score | Notes |
|---|---|---|
| Triple-pane + krypton + premium Low-E + warm-edge spacer | 9–10 | Passive house and extreme-climate spec |
| Double-pane + argon + Cardinal 366 + warm-edge spacer | 7.5–9 | Calibration benchmark tier (Marvin Elevate, Andersen 400 select configs) |
| Double-pane + argon + Cardinal 180/270 + warm-edge spacer | 6.5–7.5 | Standard quality residential |
| Double-pane + argon + Low-E + aluminum spacer | 5.5–6.5 | Adequate performance; seal longevity concern |
| Double-pane + no gas fill + Low-E | 4.5–5.5 | Below standard |
| Double-pane + no Low-E | 3.0–4.5 | Builder-grade |
| Single pane | 1.0–2.0 | Replacement target |

**Cardinal Glass note:** Dominant independent glass supplier for premium residential windows. Used by Marvin, Andersen, Pella. Cardinal Low-E line: 180 (one coat, highest VT), 270 (one coat, balanced), 366 (three coats, best solar control, standard in Northern/mixed climates). Evaluate proprietary Low-E products against Cardinal equivalents where data permits.

---

## Business Model Classification

| Type | Characteristics | Score Implication |
|---|---|---|
| True Manufacturer (integrated) | Designs and manufactures in own facilities. Controls frame extrusion, glass, hardware, assembly. | Highest confidence in component selection and QC |
| True Manufacturer (wholesale-to-dealer) | Manufactures product but requires authorized dealer for purchase and service. | Well-made products; service experience depends on dealer quality |
| Branded Assembler | Assembles from third-party components under own brand. | Component selection is the key evaluation point |
| Builder-Grade OEM | Manufactures for production builder spec. Optimized for cost-per-unit, not longevity. Often private-labeled. | Expect low Quality and Durability scores |
| Import Assembler | Sources components offshore, assembles and brands. | Evaluate parts availability carefully |

---

## Performance Tier Classification

| Tier | Description | Typical Overall Score |
|---|---|---|
| Tier 1 — Traditional Luxury | Marvin Ultimate, Sierra Pacific, Zola Thermo Clad, Alpen. Premium composite or all-wood. Full service ecosystem. | A- to A+ (8.5–10) |
| Tier 2 — Premium Production | Marvin Elevate, Pella Lifestyle Series, Andersen A-Series. Wood-clad or high-end composite. Wide dealer network. | B+ to A- (8.0–8.9) |
| Tier 3 — Quality Production | Andersen 400 Series, Pella 350 Series, JW Siteline. Mid-range wood-clad or premium vinyl. | B- to B+ (7.0–8.4) |
| Tier 4 — Builder-Grade | JW V-2500, stock vinyl, big-box replacement windows. Minimum spec. | C to B- (5.0–7.4) |

---

## Known Failure Patterns by Material Type

**Vinyl frames:**
- Yellowing and UV degradation: documented in older/cheaper vinyl; titanium dioxide content in premium vinyl significantly reduces this
- Warping under high heat: documented in thin-wall builder-grade near dark cladding or direct south/west exposure
- Hardware pull-out: documented in thin-wall vinyl where hardware anchors into soft material

**Aluminum-clad wood:**
- Wood rot at moisture entry points: primary failure mode when cladding seal fails at corners or exposed end grain
- Cladding joint failure: seal at aluminum-to-aluminum joints can fail over time

**All double-pane windows:**
- IGU seal failure (fogging): category-universal failure mode. IGMA 25-year field data shows 3.6% failure rate for ASTM E2190-certified units vs. 14–20%+ for lower-certified units. Warm-edge spacers, silicone sealant, and proper drainage design are the primary mitigating factors. Only score as product-specific concern if rate is elevated above category norm.
- Argon gas loss: ongoing from day one per NREL 2023 review. Aluminum spacers leak faster than warm-edge spacers. A 32% increase in U-factor is possible over product life from gas loss alone. This is a Performance axis degradation concern, not a Quality defect — note in DATA CONFIDENCE when spacer type is aluminum.

**Hardware:**
- DH balance failure: documented in budget DH windows; typically at 10-15 years
- Casement operator failure (gear wear): documented in high-cycle applications; premium multi-point operators more durable

---

## Calibration Benchmarks — Six Products

| Product | Config | Quality | Durability | Performance | Overall | Grade |
|---|---|---|---|---|---|---|
| Alpen Zenith ZR-7 | CSM | 9.1 | 9.1 | 8.0 | 8.7 | A- |
| Marvin Elevate | DH | 8.7 | 8.6 | 7.3 | 8.2 | B+ |
| Pella Lifestyle Series | CSM | 7.0 | 8.2 | 8.3 | 7.8 | B |
| Andersen 400 Series | DH | 7.3 | 7.9 | 7.2 | 7.47 | B- |
| JW Siteline | DH | 6.3 | 7.9 | 6.7 | 7.0 | B- |
| JW V-2500 | DH | 4.6 | 5.6 | 6.8 | 5.7 | C |

**Calibration notes:**

**Alpen Zenith ZR-7 (A-):** Pultruded fiberglass triple-pane benchmark. Sets the ceiling. Only products with premium frame material + triple-pane + exceptional specs reach A-range.

**Marvin Elevate (B+):** Performance 7.3 reflects Air Infiltration reclassification to Energy Star certification floor (0.30 → score 5) under Principle 3. Marvin does not publish DH AI data — strategic non-disclosure. Quality 8.7 and Durability 8.6 are the genuine strengths. The split profile is accurate.

**Pella Lifestyle (B):** Legitimate split profile — Quality 7.0, Performance 8.3. Strong published NFRC data with moderate construction quality. The split is the story.

**Andersen 400 (B-):** Air Infiltration scored 7 from "<0.20" bounded threshold. This is meaningful data — not Active Vagueness. Different from Marvin's complete non-publication.

**JW Siteline (B-):** Middle tier. Durability 7.9 reflects serviceable JW dealer network. Quality 6.3 reflects execution limitations.

**JW V-2500 (C):** Builder-grade floor. Quality 4.6 from thin-wall vinyl. Performance 6.8 relatively stronger — even builder-grade windows carry Energy Star ratings.

---

## Scoring Anchors

- **A-range (8.5+):** Premium product with no meaningful compromises. Appropriate in $1M+ custom build without apology.
- **B+ (8.0–8.4):** Strong premium product with one or two specific limitations.
- **B (7.5–7.9):** Solid quality production product.
- **B- (7.0–7.4):** Competent quality production product. Serviceable for most homeowners.
- **C-range (5.5–6.9):** Builder-grade to low-end production. Not what a quality-conscious buyer should accept in a custom build.
- **D-range and below:** Bottom of market or products with documented failures.


---

## PART 6 — WINDOWS MATERIAL SAFETY KNOWLEDGE v1.1

# Windows Material Safety Knowledge File

**Category:** Windows and Doors — Windows
**Version:** v1.1 — March 6, 2026
**Status:** Production-ready. Certification and source hierarchies updated per council Items 12-A, 12-B, 12-C.

Give this file to Bot 3 (Material Safety Bot) only.

---

## Category Safety Profile

Windows present a lower material safety risk profile than faucets (no water pathway) or cabinets (no formaldehyde-emitting panels in a contained space). The primary concerns are:

1. **PVC/vinyl frame chemistry** — Managed concern / Yellow Advisory for unverified products
2. **Installation foam chemistry** — Installation-dependent / Yellow Advisory (universal)
3. **Interior finish on wood interiors** — Minor concern; managed when Greenguard Gold certified

There is no Red Finding-level concern for installed windows manufactured to current US standards. No window frame material currently raises a disqualifying safety concern equivalent to ZAMAK in faucets or confirmed formaldehyde exceedances in cabinets.

---

---

## Certification Hierarchy

*Council-validated March 6, 2026 — Item 12-A*

### Cert Tier 1 — Full Ingredient Disclosure (Score floor: 9.5 if clean)

| Certification | Issuer | What It Covers |
|---|---|---|
| Declare Label — Red List Free | ILFI (International Living Future Institute) | Full ingredient disclosure; all Red List chemicals absent. Highest standard available. |
| Cradle to Cradle Gold or Platinum | C2C Products Innovation Institute | Full ingredient disclosure + material health scorecard |

**Rule:** Tier 1 cert + no active healthy homes flags = start at 9.5. Tier 1 cert with disclosed trace presence of any flag material = start at 9.0, document.

### Cert Tier 2 — Emissions Testing (Score floor: 9.0–9.2)

| Certification | Issuer | What It Covers |
|---|---|---|
| Greenguard Gold | UL | VOC emissions in children's product thresholds (stricter than standard Greenguard) |
| Greenguard (standard) | UL | VOC emissions standard |
| California Section 01350 / CDPH | California DTSC | VOC emissions — chamber testing at California standard (equivalent rigor to Greenguard Gold) |
| SCS Indoor Advantage Gold | SCS Global Services | VOC emissions — equivalent tier to Greenguard Gold |
| FloorScore | SCS Global Services | Flooring-specific; note for window sill materials only |

**Rule:** Tier 2 cert = score from the floor in the Certification Floors table. Do not apply additional penalty for absence of Tier 1 cert.

### Cert Tier 3 — Environmental Claim (Score floor: context-dependent, not a safety cert)

| Certification | What It Covers | Scoring Impact |
|---|---|---|
| VinylPlus Product Label | European vinyl sustainability program — recyclability, responsible sourcing | Minor positive signal; does not address stabilizer chemistry or consumer health. Note in evaluation, no score adjustment. |
| FSC / SFI | Timber sourcing chain of custody | Sustainability claim, not health claim. No score adjustment. |
| WDMA TM-1409 | Window industry testing standard — primarily structural/performance | Not a health certification. No score adjustment. |

### Noise — No Score Impact

The following appear on products and should not be treated as health findings, flags, or score adjustments:

- **Prop 65 (California):** Required on all products sold in California containing listed substances above threshold amounts. Presence of Prop 65 warning on a compliant product is not a health finding for scoring purposes.
- **California Title 24:** Energy code compliance. No health relevance.
- **CARB labels on compliant products:** Air Resources Board compliance at certified levels is positive confirmation. Do not flag as a health concern.

---

## Certification Floors

| Condition | Starting Score |
|---|---|
| Greenguard Gold + no active healthy homes flags | 9.5 |
| Greenguard standard + no active flags | 9.2 |
| No emissions cert, established US-manufactured vinyl | 8.8 |
| No emissions cert, non-US vinyl, undisclosed stabilizer chemistry | 8.0–8.5 |
| No emissions cert, wood interior, established brand | 8.5–9.0 |
| No emissions cert, fiberglass/composite, no flags | 9.0 |
| Active flag from credible healthy homes source | 5.0–7.0 (severity-dependent) |

---

## Frame Material Evaluations

### PVC / Vinyl — Managed Concern

**Background:** PVC manufacturing involves chlorinated chemistry and stabilizer additives. Historically, lead-based heat stabilizers were used in vinyl window production. The US window industry has transitioned to calcium-zinc (Ca-Zn) and tin-based stabilizers. This transition is industry-wide but not uniformly documented for all manufacturers.

**Healthy homes community position:** Building Biology Institute and Habitable/Pharos flag PVC as a concern material based on manufacturing impacts and additive chemistry. For INSTALLED vinyl windows specifically, the concern is lower than for soft PVC products (flooring, blinds) because:
- Hard PVC extrusions are chemically more stable than flexible PVC
- Window frame is behind glass, trim, and interior surfaces — not a primary air contact surface
- No significant off-gassing concern from cured, hard PVC extrusions has been identified by independent environmental health testing organizations for installed windows specifically

**Scoring guidance:**
- Greenguard Gold certified: 9.2
- Greenguard standard certified: 9.0
- No cert, US-manufactured: 8.8 (Ca-Zn stabilizers expected per current practice, unverified)
- No cert, non-US manufactured, undisclosed stabilizer: 8.0–8.5 (note uncertainty)
- Lead-based stabilizer confirmed: step down to 4.0–6.0 depending on interior exposure pathway

### Pultruded Fiberglass / Fiberglass Composite — Low Concern

**Position:** No active flags from healthy homes community for installed pultruded fiberglass or fiberglass composite window frames. Resin chemistry (styrene, MDI) is a manufacturing concern — not a consumer concern post-installation. Cured resin is inert.

**Scoring guidance:**
- Greenguard Gold certified: 9.5
- No certification, standard pultruded fiberglass: 9.0 (no active flags; low concern material class)

### Aluminum-Clad Wood — Conditional

**Position:** Aluminum exterior cladding — no health concern. Wood interior is the evaluation focus.

**Scoring guidance:**
- Greenguard Gold certified (covers frame and interior finish VOCs): 9.5
- No certification, established brand with documented low-VOC interior finish program: 9.0
- No certification, finish chemistry unverified: 8.5 (moderate uncertainty; note)
- If independent testing or credible source identifies VOC concern with interior finish: step down 5.0–7.0

### Aluminum — Low Concern

Anodized aluminum: inert. No off-gassing concern.
Powder coat on interior surfaces: factory-cured powder coat is stable and inert post-cure.
No significant consumer health concerns documented by healthy homes community for installed aluminum window frames.

**Scoring guidance:** 9.0–9.5 (Greenguard Gold: 9.5; no cert: 9.0)

---

## Glazing System Chemistry — Low Concern (Universal)

- Argon and krypton gas fills: inert noble gases. No health concern.
- Low-E coatings: microscopic metallic oxide layer bonded to glass surface. Not in contact with interior air. No exposure pathway. No concern.
- Spacer materials (butyl rubber primary seal, silicone or polyisobutylene secondary seal): no active flags from healthy homes community for installed, sealed IGU units.

Score: Not a differentiating factor. No concern to note for any standard double or triple-pane unit.

---

## Installation Foam and Sealants — Yellow Advisory (Universal Rule 13)

**This is the most active concern area for windows — but it is installation-dependent, not product-dependent.**

**The concern:** Spray polyurethane foam (gap fill used during window installation) off-gasses during curing:
- MDI (methylene diphenyl diisocyanate): respiratory sensitizer during application and curing
- Amine catalysts: irritant during curing
- Post-cure (24-48 hours minimum): foam is inert. No ongoing off-gassing.

Closed-cell spray foam: higher concern during cure than open-cell.

**Scoring rule:** Do NOT reduce the Material Safety score for this concern. It is installation-dependent — the product itself is not the hazard. The hazard is the installation practice.

**Always include this Yellow Advisory in Buyer Guidance section:**
> "Request your installer use pre-cured backer rod + sealant systems at interior-accessible surfaces, or ensure a minimum 24-48 hour ventilation period before occupancy if spray foam is used for gap fill."

---

## Interior Finish on Wood Interiors

**Concern:** Factory-applied stains, varnishes, and paints on wood window interiors may contain VOCs. High-VOC finishes off-gas into interior air — concern level depends on finish chemistry and cure state.

**Greenguard Gold:** Covers VOC off-gassing from factory-applied finishes. If product is Greenguard Gold certified, this concern is managed. Score at certification floor.

**No certification:**
- Established premium manufacturers (Marvin, Andersen, Sierra Pacific) use factory-applied low-VOC finish systems as standard practice. Moderate confidence without specific cert.
- Less established brands: note finish chemistry uncertainty.

---

## Healthy Homes Source Hierarchy

*Council-validated March 6, 2026 — Items 12-B, 12-C*

### Source Tier 1 — Institutional Authority (Directly Scoreable)

| Source | Basis |
|---|---|
| Building Biology Institute (BBI) | Accredited professional organization; published standards; peer network |
| Berkeley Analytical | Independent laboratory testing; peer-reviewed publications |
| Pharos / Habitable (formerly Healthy Building Network) | Chemical concern databases with documented methodology; institutional funding |
| ILFI Red List | Prescriptive ingredient prohibition list; rigorous chemical review process |
| Corinne Segura / My Chemical-Free House | See special rule below — Tier 1 with corroboration requirement |

**Tier 1 scoring rule:** A finding supported by 1+ Tier 1 source is scoreable. Document the source and the specific finding.

### Source Tier 2 — Contributing Evidence (Scoreable with Split Rule)

| Source | Limitation |
|---|---|
| Green Building Advisor healthy homes discussions | Editorial context; expert contributors may not have toxicology credentials |
| Environmental Working Group (EWG) | Advocacy organization; methodology sometimes disputed; useful for chemical identification |
| Peer-reviewed occupational health literature | **SPLIT REQUIRED** — see below |

**Peer-reviewed literature split rule:**
- **Consumer-exposure findings** (documented exposure pathway relevant to installed product in a home): directly scoreable as Tier 2.
- **Manufacturing-exposure findings** (occupational exposure during production — MDI, styrene, etc.): flag only, score as Tier 3. Rationale: manufacturing-exposure risk does not translate to consumer-exposure risk for cured, installed materials.

**Tier 2 scoring rule:** 2+ Tier 2 sources in agreement = corroborating evidence. 1 Tier 2 source alone = flag, not a finding.

### Source Tier 3 — Non-Scoring

Chemical sensitivity community forums, general consumer reviews, manufacturer health claims (self-reported, non-certified), and any source with a disclosed commercial interest in the outcome.

**Tier 3 rule:** Document if useful for pattern detection. Does not contribute to scores or findings.

---

### Corinne Segura / My Chemical-Free House — Special Rule (Item 12-C)

Corinne Segura holds Tier 1 standing with a **corroboration requirement.**

**Why the corroboration requirement:** Segura's assessments are calibrated to chemically hypersensitive individuals — a population with a significantly lower tolerance threshold than the general residential buyer. Her findings are rigorous within that population context but cannot be applied directly to a general residential audience without independent corroboration. She has no peer-reviewed publication record at this time.

**Application rules:**

| Scenario | Treatment |
|---|---|
| Segura-only finding, no corroboration | Generates investigation flag. Document in evaluation. No score impact. |
| Segura finding + 1 institutional Tier 1 corroboration (BBI, Berkeley Analytical, Pharos, ILFI) | Scoreable finding. Apply score impact per severity guidelines. |
| Segura finding + 2 Tier 2 corroborations | Scoreable finding. Apply score impact per severity guidelines. |
| Segura finding directly contradicted by Tier 1 institutional source | Document conflict. Apply conservative (midpoint) treatment. |

**Investigation flag text:** *"Healthy homes flag: [source] identifies a potential concern with [material/component]. Corroboration from a second independent source is required before this finding affects scores. Monitor: [description of concern]."*

---

## Healthy Homes Radar — Windows-Specific Sources

The following organizations are the relevant monitoring bodies for windows material safety concerns. For full source hierarchy and scoring rules, see the Source Tier table above.

- **Building Biology Institute (BBI):** Flags PVC as a concern material. Primary source for PVC/vinyl guidance. Tier 1.
- **Habitable / Pharos:** Maintains chemical concern databases. Relevant for stabilizer chemistry questions. Tier 1.
- **ILFI (International Living Future Institute):** Declare label and Red List. Tier 1 cert issuer.
- **Greenguard / UL:** Primary emissions certification for windows. Greenguard Gold is the relevant tier for residential scoring.
- **Corinne Segura / My Chemical-Free House:** Tier 1 with corroboration requirement (see special rule above). Useful for identifying emerging concerns and chemically-sensitive-population considerations.

---

## What Does NOT Count as a Flag

- PVC manufacturing emissions (occupational, not consumer)
- Argon or krypton gas fill concerns (inert gases)
- Low-E coating concerns (not in air contact)
- Installation foam concerns AFTER proper cure time (post-cure foam is inert)
- Theoretical gaps in certification testing scope
- Prop 65 warnings on compliant products
- Consumer complaints without professional substantiation


---

## PART 7 — VINYL FLOOR RULE (March 10 Bible Addition)

# Bible Update — Vinyl Material Scoring Rule
# Date: 2026-03-10
# Authority: Ray Shapley — anchored decision
# Status: LOCKED — do not modify without Ray approval

## VINYL MATERIAL CLASS SCORING RULE (FINAL)

### Materials Axis (Axis 2B)
- Base score: 5 (represents competent execution of vinyl material class)
- Ceiling: 6 (vinyl at its absolute best cannot equal aluminum-clad wood baseline of 7)
- Floor: UNCAPPED — evidence is the only limit

### Downward Adjustment Rule
Base score of 5 represents a vinyl window performing as expected for its material class.
To score BELOW base, each -0.5 deduction requires ONE documented RED finding.

Qualifying RED findings for downward adjustment:
- Documented manufacturing defects (professional teardown, independent testing)
- QC failures with cited evidence (not consumer complaints alone)
- Warranty infrastructure failure (bankruptcy, documented non-response pattern)
- Documented failure rates from independent or court-verified sources
- Professional installer refusal with cited evidence

NOT qualifying for downward adjustment:
- Unknown or undisclosed specifications (use midpoint methodology instead)
- Single consumer complaints without corroboration
- General category concerns not specific to this product
- YELLOW findings (credible but unverified)

### Upward Adjustment Rule
Base score of 5 can rise to ceiling of 6 with documented positive evidence:
- Multi-chamber construction confirmed by spec sheet: +0.5
- Fusion-welded corners confirmed (not claimed): +0.25
- UV stabilizer documentation confirmed: +0.25
- 20+ year independently verified field performance data: +0.5
- Combinations may reach ceiling of 6.0 maximum

### Overall Score
The overall score is UNCAPPED for vinyl products.
Performance and Safety axes are not subject to material class ceiling.
A vinyl window with exceptional NFRC ratings and clean safety profile
can achieve an overall score above 6 — pulled by Performance and Safety.
The ceiling applies to the Materials axis only, not the composite score.

### Philosophy
Base score = competent execution of the material class.
Evidence drives the score in both directions.
The ceiling preserves hierarchy integrity — the best vinyl window
should not claim the same Materials score as an average aluminum-clad product.
The uncapped floor ensures garbage products cannot hide behind their material class.

---

## PART 8 — CHALLENGE BOT VINYL RULES ADDENDUM

# Challenge Bot — Vinyl Scoring Rules Addendum
# Date: 2026-03-10
# LOCKED

## VINYL HIERARCHY CHECK — UPDATED RULES

When checking vinyl products on CHECK 1 (HIERARCHY):

1. Materials axis ceiling = 6.0. Flag any 2B score above 6.0.

2. Materials axis floor = UNCAPPED.
   Do NOT flag downward adjustments below 5.0 as hierarchy violations.
   Instead check: is each -0.5 deduction supported by a documented RED finding?
   If yes: PASS. If no: FLAG as unsupported adjustment.

3. Overall score ceiling = NONE. Do not flag overall scores above 6.0 for vinyl.
   Performance and Safety axes are not subject to the vinyl ceiling.

4. Undisclosed specs = midpoint methodology. Never a penalty deduction.
   Missing data goes to midpoint (5.0) with gap documented.
   Missing data does NOT qualify as a RED finding for downward adjustment.

---

## PART 9 — LOCKED BENCHMARK SCORES (Windows Category)

| Product | Q | D | P | Overall | Grade | Tier | Status |
|---------|---|---|---|---------|-------|------|--------|
| Alpen Zenith ZR-7 | — | — | — | 8.70–9.1* | A– | High Performance | ⚠️ Score conflict pending |
| Marvin Integrity DH | 8.075 | 8.0625 | 6.80 | **7.65** | B+ | Architectural | ✅ Locked |
| Andersen 400 Series DH | 6.73 | 7.39 | 7.10 | **7.07** | B | Architectural | ✅ Locked |
| Andersen 100 Series DH | — | — | — | **7.44** | B | Architectural | ✅ Locked |
| Andersen A-Series DH | — | — | — | **7.81** | B | Architectural | ⏳ Verifier blocking |
| Milgard Tuscany DH | 6.05 | 7.90 | 6.80 | **6.92** | B– | Premium Residential | ✅ Locked |
| Pella 250 Series DH | 6.43 | 7.13 | 6.77 | **6.78** | B– | Premium Residential | ✅ Locked |
| Simonton 5500 DH | — | — | — | **6.9** | B– | Premium Residential | ⚠️ Two scores (6.9 EC2, 6.2 Mac) |
| Jeld-Wen V-2500 DH | 5.00 | 6.19 | 6.10 | **5.76** | C+ | Premium Residential | ✅ Locked |
| Pella 350 Series DH | 4.50 | 4.94 | 5.29 | **4.91** | D+ | Mid-range | ✅ Locked |
| Reliabilt 3500 DH | — | — | — | **4.9** (clamped) | — | Budget | ✅ Locked |
| Window World 4000 DH | 5.20 | 4.50 | 4.20 | **4.63** | D | Budget | ✅ Locked |
| CGI Impact Windows DH | — | — | — | PASS | — | — | Score not cleanly extracted |
| ProVia Endure DH | — | — | — | FAILED | — | — | Council rejection: vinyl ceiling violation |

*Alpen: EC2 run = 9.1, Mac run = 8.70. Ray decision needed to lock one.

### Material Class Ceilings (Durability Axis, 2B Subscore)
| Material | Base Score | Hard Ceiling |
|----------|-----------|--------------|
| Pultruded fiberglass / Ultrex | 9 | 10 |
| Aluminum-clad wood (extruded) | 8 | 9 |
| Roll-form / Vinyl-clad wood | 7 | 8 |
| Composite / Fibrex / Proprietary | 6 | 7 |
| Vinyl / Aluminum | 5 | 6 |

---

## PART 10 — PENDING DECISIONS (Ray must resolve)

1. **Alpen ZR-7 score** — Lock at 8.70 (Mac run) or 9.1 (EC2 run)
2. **Simonton 5500 score** — Lock at 6.9 (EC2) or 6.2 (Mac reconciled)
3. **Andersen A-Series** — Run is stuck on verifier. Score of 7.81 from earlier run is valid. Decision: use it or force another run with fixed verifier
4. **ProVia Endure** — Council rejected for vinyl ceiling violation. Re-run after confirming ceiling enforcement in orchestrator
5. **CGI Impact Windows** — Score not extracted cleanly from PASS run. Need to pull it
6. **EC2 termination** — Ray to terminate instance 18.218.122.54 in AWS console (terminate, not stop)
7. **Verifier fix** — Drop all thresholds to flat 300 bytes (pending Ray approval)

---

## PART 11 — CRITICAL RULES (DO NOT VIOLATE)

- **Weighting is always 35/35/30** (Quality/Durability/Performance) — never equal thirds
- **Field complaints score only in 1B** (Manufacturing Quality) — never in 2B (Materials Durability)
- **Rule 11:** RED finding = score impact + disclosure required. YELLOW = disclosure only.
- **Do not disclose AI involvement** publicly in any report, interface, or communication
- **Do not show subscore weights** publicly
- **Do not surface MECHANICAL VALIDATION block** in reports — internal QC only
- **Safety content in reports** comes from FLAG CITATIONS table only — never from bot3 rationale block
- **Do not auto-adjust scores** toward external opinion or analyst consensus
- **Do not use pass/fail for material safety** — liability risk
- **LaunchAgent owns the Telegram listener** — do not start manually
- **Use exact PID** for bridge restart — never `pkill -f claude_bridge`
- **Always deploy to Mac Mini** before considering a change live — local `/tmp/` copies are drafts only

---

## PART 15 — REPORT DESIGN DECISIONS (Bot 6)

The report HTML/CSS is fully contained in `bot6_report_assembly_v2.js` (see Part 12.2). Key design decisions that must be preserved:

- **Safety tier label:** "Incomplete Disclosure" (not "Review Recommended")
- **Safety flag cells:** "Not Disclosed" (neutral gray) for medium severity, "Chemistry Concern" (red) for HIGH severity only
- **Lateral alternative label:** "↔ Same-Tier Option" in muted gray (not "↑ Better Value · Same Tier")
- **Score display:** Letter grade + numeric score + tier label
- **Three-axis breakdown:** Always shown, always 35/35/30 — weights not shown publicly
- **Mechanical validation block:** Internal only — never shown in output report
- **Safety sourcing:** From FLAG CITATIONS table in bot3 output — never from rationale prose

---
*This file was generated March 12, 2026 from live Mac Mini code via Claude Bridge.*
*To regenerate: ask Claude to pull all files via the bridge and rebuild this document.*
