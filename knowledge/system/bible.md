# The Residentialist — Complete System Documentation

## FOR ANY AI READING THIS

This document is the complete technical and strategic specification for The Residentialist's product evaluation database. It contains every design decision, rule, bot architecture, scoring methodology, calibration insight, and workflow developed across multiple working sessions. If you are an AI assistant working with Ray on this project, this document is your starting point. Read it in full before doing any work. Ask Ray clarifying questions if anything is ambiguous.

---

## TABLE OF CONTENTS

1. What The Residentialist Is
2. The Category Build Methodology (How New Categories Are Created)
3. Bot Architecture (The Evaluation Pipeline)
4. Scoring Framework
5. Letter Grade System and Outlook Modifiers
6. Knowledge Files
7. Calibration Rules and Watch Items
8. The Adversarial Verification Bot (Bot 4 — Future Build)
9. Certification Gate Checks
10. Findings System (Red/Yellow)
11. Business Model Taxonomy
12. Source Hierarchy by Category
13. Category Expansion Plan
14. Technical Infrastructure
15. File Organization
16. Calibration Data (Completed Products)
17. Known Gaps and Pending Improvements
18. Key Principles and Philosophy

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
| Windows | NFRC ratings, GreenBuildingAdvisor | Moderate — standardized performance data |
| Flooring | NWFA standards, forum data | Fragmented — no single authority |
| Countertops | Forum data, trade publications | Fragmented |
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

### Bot 3: Material Safety Bot (Health/Toxicity Scoring)

**Role:** Evaluate health, chemical exposure, and material safety concerns independently.

**Key characteristics:**
- Operates as an INDEPENDENT axis — separate from reliability and durability
- Uses a separate category-specific material safety knowledge file
- Evaluates: materials in contact pathways (water, food, air), certification status, chemical exposure risks, finish safety, standing water contamination potential
- Does NOT evaluate: occupational health, environmental impact, sustainability, aesthetics, supply chain ethics
- Tone: Materials analyst with data. Not an environmental advocate. Not a fear-monger. Frame findings as relative positioning, not scare tactics.

**Critical rules:**
- "Insufficient Material Data" if material composition data is unavailable or unverifiable — do NOT estimate scores based on brand reputation
- Minimum evidence threshold: At least 2 of 3 must be confirmable: (1) material composition of primary contact surfaces, (2) operating temperature range, (3) at least one independent source addressing material behavior at those temperatures
- **Substrate Category Separation Rule (cabinets):** Plywood products must score at least 2 points above particleboard products. Containment can narrow the gap by max 1 point but cannot eliminate it.
- **Score Equivalence Rule:** If two products have different containment ratings but receive the same score, the bot must explicitly justify why.
- **IKEA Paradox:** Sealed cheap material can outperform unsealed expensive material on actual occupant exposure. Score what reaches the occupant, not just what's in the panel.

**Two tiers of health concerns (how they're treated):**

1. **Hard safety gate (binary):** Lead in water path, missing NSF certifications, active recalls, documented health hazards. If it fails, the product either doesn't get evaluated or gets an immediate Red finding. This is not a score — it's a gate.

2. **Material transparency score (1-10):** VOCs, formaldehyde, off-gassing at temperature, PFAs, material disclosure. This IS the scored axis. Lives alongside Reliability and Durability as a separate score. Buyers who care read it; buyers who don't skip it. Nobody's overall construction quality score gets affected by health concerns — they're independent.

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

## 6. KNOWLEDGE FILES

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

## 7. CALIBRATION RULES AND WATCH ITEMS

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

---

## 8. CERTIFICATION GATE CHECKS

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

## 9. FINDINGS SYSTEM (RED / YELLOW)

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

## 10. BUSINESS MODEL TAXONOMY

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

## 11. SOURCE HIERARCHY (UNIVERSAL)

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

## 12. CATEGORY EXPANSION PLAN

### Phase 1 — Launch Database (14 unique buildouts + consolidations)

**Kitchen:**
1. Cabinets ✅ (6 products calibrated)
2. Countertops
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

## 13. TECHNICAL INFRASTRUCTURE

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

## 14. CALIBRATION DATA (COMPLETED PRODUCTS)

### Faucets (4 products calibrated)

| Product | Reliability | Durability | Overall | Material Safety | Outlook |
|---|---|---|---|---|---|
| Chicago Faucets 786 | A+ (9.7) | A (9.0) | A (9.4) | — | Strong |
| California Faucets Corsano K51-100SQ | A (9.3) | A- (8.6) | A (9.0) | 9/10 | Strong |
| Waterstone 5600 | A- (8.8) | B+ (8.4) | A- (8.6) | — | Stable |
| Kraus Bolden KPF-1610SS | B (7.5) | D (5.0) | C (6.0) | — | Conditional |

**Key calibration insights from faucets:**
- Chicago Faucets: Best-built faucet, worst warranty documentation. 5-year cartridge warranty but parts backward-compatible to 1913. Score actual repairability, not warranty paper.
- California Faucets: Best overall package. Kerox cartridge, solid brass, PVD available, strong service, only known brand offering parts AND labor warranty coverage.
- Waterstone: Best body (316 SS), finish technology gaps (no PVD on all finishes). Stable outlook.
- Kraus: Real product, looks good to consumers, but undisclosed cartridge, "metal" body (not "brass"), 5-year parts availability with "lifetime" warranty, spray head failures. Conditional outlook.

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

---

## 15. KNOWN GAPS AND PENDING IMPROVEMENTS

### Faucet System Updates Needed

1. **Labor warranty coverage** — Add as explicit factor in Repairability & Support. Distinguish parts-only vs parts-plus-labor. Currently not scored anywhere.

2. **NSF/ANSI 372 (lead-free)** — Add to red flag checklist. Currently missing.

3. **Certification gate check** — Reposition certification verification as a FIRST action, not a finding discovered mid-evaluation. Include insurance liability framing.

4. **Plastic stems as explicit durability flag** — Currently a bullet point under Materials. Should be elevated to a specific red/yellow flag: plastic stem = disposability signal.

5. **Business model → parts lifecycle rule** — Exists in pieces. Needs explicit statement: Manufacturer-owned designs = 20+ years parts. Premium assembler = effectively indefinite. Marketeer = 3-7 year window.

6. **Proprietary vs standard parts scoring** — Partially covered through cartridge identification. Should explicitly score in Repairability: faucet using standard Kerox cartridge (sourced through multiple channels) vs proprietary cartridge (single source, no alternatives).

### System-Wide Updates Needed

7. **Evaluator Bot output format update** — Needs to output letter grades + outlook modifier instead of decimal scores + colored flags. Prompt partially updated but not finalized across all category versions.

8. **Report template** — The client-facing deliverable has not been designed. This is the document that combines all three bot outputs into what the buyer actually receives.

9. **Cross-category consistency** — As more categories are built, scoring calibration needs cross-checking. An A in faucets should represent comparable quality confidence as an A in cabinets.

---

## 16. KEY PRINCIPLES AND PHILOSOPHY

### On Scoring
- Be honest. A 5 is not a bad score — it means "acceptable with caveats."
- Defend the gap between a score and 10 with specific reasons a homeowner would care about.
- Score the PRODUCT, not the brand reputation. Never inflate for famous brands. Never deflate for unknown brands.
- Price does not affect the score directly, but price-to-quality ratio should be noted.
- A product with high reliability and low durability tells an important story: "It works while it works, but it won't last long and you can't fix it." State this clearly.

### On Confidence
- If the Consensus Bot flags "Low confidence — limited data," the report says so. Honest confidence calibration protects the brand better than a confident-sounding answer built on weak evidence.
- The first few reports in a new category will be less precise than mature categories. That's acceptable. They'll still be more rigorous than anything else available.
- Each report makes the next one better. The database compounds.

### On Independence
- Three-bot independence is non-negotiable. The bots must not see each other's output during evaluation.
- The Material Safety score must remain independent from construction quality scores. Buyers who care about health read it; buyers who don't, skip it. Nobody's overall score is affected by health concerns they may not weight.

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

## APPENDIX: PROMPT VERSION HISTORY

- **Evaluator Bot v1:** Initial framework, equal Reliability/Durability weighting, no calibration rules
- **Evaluator Bot v2:** Added calibration rules (no double-counting, category scoring, application-specific cartridge). Tested with California Faucets and Kraus.
- **Evaluator Bot v3 (current for faucets):** Added Calibration Watch List, fixed Repairability & Support to weight actual repairability over warranty paper, added finding consolidation rules, added Yellow finding buyer-impact filter.
- **Evaluator Bot — Cabinets (current):** Adapted framework for cabinets. Professional Consensus ceiling rule added. Durability reweighted (37.5/37.5/25). Substrate separation rule in Material Safety Bot.
- **Material Safety Bot v1:** Initial framework for faucets.
- **Material Safety Bot — Cabinets:** Added substrate category minimum separation rule, score equivalence justification rule.
- **Consensus Bot:** Minimal evolution. Added WARRANTY STRUCTURE consolidated output section. No knowledge file by design.

---

*Last updated: February 28, 2026*
*This document should be updated whenever new categories are calibrated, new rules are added, or structural changes are made to the evaluation pipeline.*
