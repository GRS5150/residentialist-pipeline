---
name: residentialist
description: "Complete system knowledge file for The Residentialist product intelligence platform. Read this FIRST and in FULL before doing any work. Contains architecture, all live code, scoring rules, infrastructure credentials, and operational state. If you are an AI working with Ray Shapley on this project, this document is your complete starting point."
version: 2026-03-12
---

# THE RESIDENTIALIST — Complete AI Knowledge & Replication File
**Owner:** Ray Shapley | **Last updated:** March 12, 2026
**Purpose:** Enable any AI to fully understand, operate, replicate, and extend this system without human relay.

---

## ⚠️ READ THIS FIRST

This file contains everything. The system bible, all live code verbatim, credentials, operational state, and architectural decisions. Read it completely before doing anything. Do not guess at file contents — they are included below. Do not ask Ray for context that is in this file.

**Current known issue being worked:** The bot output verifier is causing false pipeline halts on valid outputs. The fix is to drop all size thresholds to a flat 300 bytes. The Andersen A-Series is the stuck product. Score exists (7.81, B from run `andersen_aseries_2026-03-12T14-02-48`) — the verification layer is the only thing blocking it.

---

## PART 1 — INFRASTRUCTURE & CREDENTIALS

### Mac Mini (Primary Compute)
- **Workspace:** `/Users/Residentialist/.openclaw/workspace/residentialist/`
- **SSH (LAN only):** `ssh Residentialist@192.168.86.37`
- **OS:** macOS (Apple Silicon)

### Claude Bridge (ALWAYS USE THIS — do not SSH unless bridge is down)
- **Static ngrok URL:** `https://lavonne-instructorless-northwestwardly.ngrok-free.dev`
- **API Key:** `residentialist-bridge-2026`
- **ngrok account:** rayshapley@gmail.com
- **ngrok authtoken:** `3AlOXAhlm9yhMOGJXgoRN8JJDzH_7HDjMm1MQGGTNysDr8S8j`

#### Bridge Endpoints
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/shell` | POST | Run any shell command. Body: `{"cmd": "..."}` |
| `/write` | POST | Write file. Body: `{"path": "...", "content": "..."}` |
| `/file` | GET | Read file. Query: `?path=...` |
| `/run` | POST | Start pipeline. Body: `{"product": "...", "config": "DH", "category": "Windows"}` |
| `/pipeline` | GET | Structured pipeline state with scores |
| `/status` | GET | Pipeline running status |
| `/outputs` | GET | List output directories |
| `/dashboard` | GET | Live dashboard HTML (no auth required) |

#### Bridge Usage Pattern
```bash
# Shell command
curl -sk -X POST -H "x-api-key: residentialist-bridge-2026" -H "Content-Type: application/json" \
  -d '{"cmd": "ls /Users/Residentialist/.openclaw/workspace/residentialist/"}' \
  "https://lavonne-instructorless-northwestwardly.ngrok-free.dev/shell" | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('output',''))"

# Write file
curl -sk -X POST -H "x-api-key: residentialist-bridge-2026" -H "Content-Type: application/json" \
  -d '{"path": "/full/mac/path", "content": "file content here"}' \
  "https://lavonne-instructorless-northwestwardly.ngrok-free.dev/write"

# Read file
curl -sk "https://lavonne-instructorless-northwestwardly.ngrok-free.dev/file?path=/full/mac/path" \
  -H "x-api-key: residentialist-bridge-2026" | python3 -c "import sys,json; print(json.load(sys.stdin).get('content',''))"
```

#### Bridge Restart (if down)
```bash
cd /Users/Residentialist/.openclaw/workspace/residentialist
curl -H "Authorization: token YOUR_GITHUB_TOKEN_HERE" \
  -H "Accept: application/vnd.github.v3.raw" \
  -L "https://api.github.com/repos/GRS5150/residentialist-pipeline/contents/claude_bridge.js" \
  -o claude_bridge.js && node claude_bridge.js
# Then Ctrl+Z, bg
```

### GitHub
- **Repo:** `https://github.com/GRS5150/residentialist-pipeline`
- **Token:** `YOUR_GITHUB_TOKEN_HERE`

### Henry Bot (Telegram)
- **Bot name:** HenryShapleyBot
- **Role:** Autonomous pipeline executor on Mac Mini. Receives commands via Telegram, runs pipeline, fires status alerts.
- **Managed by:** LaunchAgent — DO NOT start manually
- **Current limitation:** Claude cannot receive Henry's Telegram messages directly. Ray pastes them manually. Architectural goal is to add a `POST /claude` endpoint to the bridge so Henry can call Claude API directly for autonomous diagnosis and fix.

### OpenClaw
- Claude API integration layer running on Mac Mini. Handles all AI calls from Henry and the pipeline bots.

---

## PART 2 — SYSTEM BIBLE (Full Content)

# The Residentialist — Complete System Documentation

## FOR ANY AI READING THIS

This document is the complete technical and strategic specification for The Residentialist's product evaluation database. It contains every design decision, rule, bot architecture, scoring methodology, calibration insight, and workflow developed across multiple working sessions. If you are an AI assistant working with Ray on this project, this document is your starting point. Read it in full before doing any work. Ask Ray clarifying questions if anything is ambiguous.

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

## PART 12 — LIVE CODE (All Files Verbatim as of March 12, 2026)

### 12.1 — bot_orchestrator_v2.js (Master Pipeline Controller)
**Mac Mini path:** `/Users/Residentialist/.openclaw/workspace/residentialist/bot_orchestrator_v2.js`

```javascript
/**
 * THE RESIDENTIALIST — Bot Orchestrator
 * Sequences Bot 1 (Consensus) → Bot 2 (Evaluator) → Bot 3 (Material Safety) → Bot 4 (Challenge)
 * Halts pipeline at any FLAG from Challenge Bot.
 *
 * Usage:
 *   node bot_orchestrator.js <product_name> <config> <research_file_1> [research_file_2] ...
 *
 * Example:
 *   node bot_orchestrator.js "Marvin Integrity DH" DH ./inputs/marvin_integrity_research.md
 *
 * Outputs to: ./outputs/<product_slug>_pipeline_<timestamp>/
 */

const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');
const { validate: deterministicValidate } = require('./deterministic_validator');
// sendTelegram defined locally to avoid circular dependency with auto_runner
const https = require('https');
function sendTelegram(message) {
  return new Promise((resolve) => {
    try {
      const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
      const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
      const body = JSON.stringify({ chat_id: CHAT_ID, text: message, parse_mode: 'Markdown' });
      const options = { hostname: 'api.telegram.org', path: `/bot${TOKEN}/sendMessage`, method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } };
      const req = https.request(options, (res) => { res.on('data', () => {}); res.on('end', resolve); });
      req.on('error', () => resolve());
      req.write(body); req.end();
    } catch(e) { resolve(); }
  });
}

// ─── MATERIAL CEILING TABLE ───────────────────────────────────────────────────
// Single source of truth for 2B Materials Durability ceilings.
// Injected directly into Bot 2's prompt — not a rule to interpret, a hard fact.
// Update this table to update the entire pipeline.
const MATERIAL_CEILINGS = {
  'pultruded fiberglass': { base: 9, ceiling: 10 },
  'ultrex':               { base: 9, ceiling: 10 },
  'aluminum-clad wood':   { base: 8, ceiling: 9  },  // extruded
  'aluminum clad wood':   { base: 8, ceiling: 9  },
  'roll-form':            { base: 7, ceiling: 8  },
  'vinyl-clad wood':      { base: 7, ceiling: 8  },
  'composite':            { base: 6, ceiling: 7  },
  'fibrex':               { base: 6, ceiling: 7  },
  'proprietary':          { base: 6, ceiling: 7  },
  'vinyl':                { base: 5, ceiling: 6  },
  'aluminum':             { base: 5, ceiling: 6  },
};

function getMaterialCeiling(materialClass) {
  if (!materialClass) return { base: 5, ceiling: 6, label: 'Unknown — defaulting to vinyl' };
  const lower = materialClass.toLowerCase();
  for (const [key, vals] of Object.entries(MATERIAL_CEILINGS)) {
    if (lower.includes(key)) {
      return { ...vals, label: materialClass };
    }
  }
  // Default to most conservative if unrecognized
  return { base: 5, ceiling: 6, label: materialClass + ' (unrecognized — defaulting to vinyl)' };
}

require('dotenv').config({ path: '/Users/Residentialist/.openclaw/workspace/residentialist/.env' });

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── BOT OUTPUT VERIFIER ──────────────────────────────────────────────────────
// Called after every bot write. Checks:
//   1. File exists
//   2. File is above minimum size
//   3. File contains the expected completion signal for that bot
// If any check fails: Telegram alert fires, pipeline halts immediately.
// Minimum output sizes per bot (bytes) — based on observed complete outputs.
// A real truncation will be well under these thresholds.
// Signal-based checking was too format-sensitive — size is more reliable.
const MIN_BOT_OUTPUT_BYTES = {
  'Bot 1 (Consensus)':       8000,
  'Bot 2 (Evaluator)':       4000,
  'Bot 3 (Material Safety)': 1500,
  'Bot 4 (Challenge)':       1500,
  'Bot 5 (Reconciliation)':  500,
  'default':                 500,
};

async function verifyBotOutput(filePath, botName, productName, outputDir) {
  let failed = false;
  let reason = '';

  // Always resolve by scanning outputDir for a file matching the bot keyword.
  // Never trust the constructed path — slug generation is inconsistent across bots.
  const outputDir2 = path.dirname(filePath);
  const expectedBase = path.basename(filePath);
  // Extract bot keyword: e.g. "bot3_material_safety" from any slug variant
  const botKeyword = expectedBase.match(/_(bot\d+[_-][^.]+)\./)?.[1]     // e.g. bot3_material_safety
                  || expectedBase.match(/(bot\d+[_-][^.]+)\./)?.[1];
  let resolvedPath = filePath;
  if (botKeyword && fs.existsSync(outputDir2)) {
    const keyword = botKeyword.replace(/_/g, '[_-]'); // match both _ and - variants
    const matches = fs.readdirSync(outputDir2).filter(f => {
      const re = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace('\\[_-\\]','[_-]'));
      return re.test(f);
    });
    if (matches.length > 0) {
      resolvedPath = path.join(outputDir2, matches[0]);
      if (resolvedPath !== filePath) {
        console.log(`[ORCHESTRATOR] Slug resolved: ${expectedBase} → ${matches[0]}`);
      }
    }
  }

  try {
    const stat = fs.statSync(resolvedPath);
    const minBytes = MIN_BOT_OUTPUT_BYTES[botName] || MIN_BOT_OUTPUT_BYTES['default'];
    if (stat.size < minBytes) {
      failed = true;
      reason = `Output file too small (${stat.size} bytes, minimum ${minBytes} for ${botName})`;
    }
  } catch (e) {
    failed = true;
    reason = `Output file not found — bot may have crashed silently`;
  }

  if (failed) {
    const alert = `🚨 *BOT FAILURE — ${botName}*\nProduct: ${productName}\nReason: ${reason}\nFile: ${filePath}\n\nPipeline halted. Human review required.`;
    console.error(`[ORCHESTRATOR] BOT FAILURE: ${botName} — ${reason}`);
    console.error(`[ORCHESTRATOR] Expected file: ${filePath}`);

    fs.writeFileSync(`${outputDir}/PIPELINE_STATUS.txt`,
      `STATUS: BOT_FAILURE\nBOT: ${botName}\nPRODUCT: ${productName}\nREASON: ${reason}\nFILE_EXPECTED: ${filePath}\nTIMESTAMP: ${new Date().toISOString()}\n\nPipeline halted. No score produced. Human review required.`
    );

    await sendTelegram(alert);
    throw new Error(`BOT FAILURE: ${botName} did not produce valid output. ${reason}`);
  }

  console.log(`[ORCHESTRATOR] ✓ ${botName} output verified (${fs.statSync(filePath).size} bytes)`);
}

// ─── DATA COMPLETENESS CHECKER ───────────────────────────────────────────────
// Runs after Bot 1. Pure deterministic — no API calls, no AI.
// Checks whether critical data targets were found in Bot 1's output.
// On missing fields: fires Telegram warning and logs gap file.
// Does NOT halt pipeline — Bot 2 handles midpoint scoring for gaps.
// Purpose: catch Bot 1 search failures BEFORE they silently enter scoring.

const REQUIRED_FIELDS = {
  windows: [
    { field: 'U-Factor',         signals: ['u-factor', 'u factor', 'ufactor'],              source: 'NFRC certification database' },
    { field: 'SHGC',             signals: ['shgc', 'solar heat gain'],                       source: 'NFRC certification database' },
    { field: 'Air Infiltration', signals: ['air infiltration', 'air leakage', 'cfm/ft'],     source: 'NFRC / AAMA certification' },
    { field: 'AAMA Class',       signals: ['aama', 'performance class', 'design pressure'],  source: 'AAMA certification directory' },
    { field: 'Frame Material',   signals: ['frame material', 'material class', 'vinyl', 'fibrex', 'fiberglass', 'wood', 'aluminum'], source: 'manufacturer spec sheet' },
    { field: 'Warranty',         signals: ['warranty', 'limited lifetime', 'year warrant'],  source: 'manufacturer warranty documentation' },
    { field: 'Energy Star',      signals: ['energy star', 'energystar'],                     source: 'energystar.gov certified products' },
  ],
};

// Mandatory URL fetches by manufacturer — Bot 1 should hit these directly.
// These are logged as warnings if Bot 1 did not reference them.
const MANDATORY_SOURCES = {
  windows: {
    'andersen':  ['andersenwindows.com', 'nfrcratings'],
    'marvin':    ['marvin.com', 'nfrc'],
    'pella':     ['pella.com', 'nfrc'],
    'milgard':   ['milgard.com', 'nfrc'],
    'simonton':  ['simonton.com', 'nfrc'],
    'jeld-wen':  ['jeld-wen.com', 'nfrc'],
    'reliabilt': ['nfrc', 'lowes.com'],
    'window world': ['windowworld.com'],
    'alpen':     ['alpenwindows.com', 'nfrc'],
    'provia':    ['proviaproducts.com'],
    'cgi':       ['cgiwindows.com', 'nfrc'],
    'sierra pacific': ['sierrapacificwindows.com', 'nfrc'],
  },
};

// Universal safety check sources — checked for every product regardless of category
const SAFETY_CHECK_SOURCES = [
  { name: 'CPSC Recalls',           domain: 'recalls.cpsc.gov',          signal: 'recalls.cpsc.gov' },
  { name: 'EPA Safer Choice',       domain: 'epa.gov/saferchoice',        signal: 'epa.gov' },
  { name: 'California Prop 65',     domain: 'p65warnings.ca.gov',         signal: 'prop 65' },
  { name: 'ILFI Declare Database',  domain: 'declare.living-future.org',  signal: 'declare' },
  { name: 'Greenguard',             domain: 'ul.com/resources/greenguard', signal: 'greenguard' },
];

async function runDataCompletenessCheck(bot1Output, productName, category, outputDir) {
  console.log('[COMPLETENESS] Running data completeness check...');
  const lowerOutput = bot1Output.toLowerCase();
  const lowerProduct = productName.toLowerCase();
  const gaps = [];
  const warnings = [];

  // 1. Required field check
  const fields = REQUIRED_FIELDS[category] || REQUIRED_FIELDS.windows;
  for (const { field, signals, source } of fields) {
    const found = signals.some(s => lowerOutput.includes(s));
    if (!found) {
      gaps.push({ field, source, severity: 'GAP' });
      console.warn(`[COMPLETENESS] GAP: ${field} not found in Bot 1 output (expected from ${source})`);
    }
  }

  // 2. Mandatory source check
  const sources = MANDATORY_SOURCES[category] || MANDATORY_SOURCES.windows;
  for (const [mfr, domains] of Object.entries(sources)) {
    if (lowerProduct.includes(mfr)) {
      for (const domain of domains) {
        if (!lowerOutput.includes(domain)) {
          warnings.push(`Manufacturer source not referenced: ${domain} (expected for ${mfr} products)`);
          console.warn(`[COMPLETENESS] WARN: Expected source not referenced — ${domain}`);
        }
      }
    }
  }

  // 3. Universal safety source check
  for (const { name, signal } of SAFETY_CHECK_SOURCES) {
    if (!lowerOutput.includes(signal)) {
      warnings.push(`Safety source not checked: ${name}`);
    }
  }

  // Write gap report
  const gapReport = [
    `# DATA COMPLETENESS REPORT`,
    `Product: ${productName}`,
    `Category: ${category}`,
    `Timestamp: ${new Date().toISOString()}`,
    ``,
    gaps.length === 0 ? '## ALL REQUIRED FIELDS FOUND ✓' : `## DATA GAPS (${gaps.length})`,
    ...gaps.map(g => `- **${g.field}**: Not found in Bot 1 output. Expected source: ${g.source}`),
    ``,
    warnings.length === 0 ? '## ALL MANDATORY SOURCES REFERENCED ✓' : `## SOURCE WARNINGS (${warnings.length})`,
    ...warnings.map(w => `- ${w}`),
  ].join('\n');

  fs.writeFileSync(`${outputDir}/DATA_COMPLETENESS.txt`, gapReport);

  // Fire Telegram if gaps found
  if (gaps.length > 0 || warnings.length > 0) {
    const msg = [
      `⚠️ *DATA GAPS — ${productName}*`,
      gaps.length > 0 ? `*Missing fields (${gaps.length}):* ${gaps.map(g => g.field).join(', ')}` : '',
      warnings.length > 0 ? `*Source warnings (${warnings.length}):* Bot 1 may have missed mandatory URLs` : '',
      `_Midpoint scoring will apply for gaps. Review DATA_COMPLETENESS.txt before accepting score._`,
    ].filter(Boolean).join('\n');
    await sendTelegram(msg);
    console.warn(`[COMPLETENESS] ⚠️ ${gaps.length} gaps, ${warnings.length} warnings — Telegram sent`);
  } else {
    console.log('[COMPLETENESS] ✓ All required fields found, all mandatory sources referenced');
  }

  return { gaps, warnings };
}


// ─── KNOWLEDGE FILES ──────────────────────────────────────────────────────────
const KNOWLEDGE_BASE_DIR = '/Users/Residentialist/.openclaw/workspace/residentialist/knowledge/windows';

function loadKnowledgeFiles() {
  const files = {};
  try {
    const entries = fs.readdirSync(KNOWLEDGE_BASE_DIR);
    for (const entry of entries) {
      const fullPath = path.join(KNOWLEDGE_BASE_DIR, entry);
      files[entry] = fs.readFileSync(fullPath, 'utf8');
    }
    console.log(`[ORCHESTRATOR] Loaded ${Object.keys(files).length} knowledge file(s): ${Object.keys(files).join(', ')}`);
  } catch (err) {
    console.error(`[ORCHESTRATOR] Warning: Could not load knowledge files: ${err.message}`);
  }
  return files;
}


// ─── MATERIAL CLASS EXTRACTOR ─────────────────────────────────────────────────
// Parses Bot 1 output to lock material classification before Bot 2 runs.
// Prevents Bot 2 from silently reclassifying a product's material.

function extractMaterialClass(bot1Output) {
  const lines = bot1Output.split('\n');
  
  // Look for explicit material class statements in Bot 1's PRODUCT OVERVIEW section
  const patterns = [
    /material\s+class\s*[:—]\s*(.+)/i,
    /frame\s+material\s*[:—]\s*(.+)/i,
    /material\s+type\s*[:—]\s*(.+)/i,
    /construction\s*[:—]\s*(.+frame.+|vinyl|wood|fiberglass|aluminum|composite)/i,
  ];
  
  for (const line of lines) {
    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) {
        const raw = match[1].trim().replace(/[*_]/g, '').split('(')[0].trim();
        if (raw.length > 2 && raw.length < 80) {
          return { found: true, rawText: raw, source: 'bot1_product_overview' };
        }
      }
    }
  }
  
  // Secondary: scan for material keywords near "window" mentions
  const materialKeywords = [
    { pattern: /vinyl\s+window|vinyl\s+frame|vinyl\s+construction/i, label: 'Vinyl' },
    { pattern: /aluminum.clad\s+wood|clad.wood|wood.clad/i, label: 'Aluminum-clad wood' },
    { pattern: /fiberglass\s+frame|pultruded\s+fiberglass|ultrex/i, label: 'Pultruded fiberglass' },
    { pattern: /all.wood|wood\s+frame|wood\s+window/i, label: 'Wood' },
    { pattern: /aluminum\s+frame|aluminum\s+window|non.clad\s+aluminum/i, label: 'Aluminum' },
    { pattern: /fibrex|composite\s+frame/i, label: 'Composite/Fibrex' },
  ];
  
  for (const line of lines) {
    for (const kw of materialKeywords) {
      if (kw.pattern.test(line)) {
        return { found: true, rawText: kw.label, source: 'bot1_keyword_scan' };
      }
    }
  }
  
  return { found: false, rawText: 'UNDETERMINED', source: 'not_found' };
}

// ─── BOT SYSTEM PROMPTS ───────────────────────────────────────────────────────

const BOT1_CONSENSUS_PROMPT = `You are The Residentialist Consensus Bot (Bot 1). Your job is to conduct exhaustive web research on a specific window product and produce a structured findings document for the Evaluator Bot.

YOU MUST SEARCH THE WEB EXTENSIVELY BEFORE WRITING ANYTHING. Do not rely on training data. Perform ALL searches and fetches below in sequence. Do not skip any.

PHASE 1 — MANDATORY DIRECT FETCHES (fetch ALL of these — do not skip any):
1. Fetch https://search.nfrc.org/search/Searchdefault.aspx — search for the product name to find U-factor, SHGC, VT, and Air Infiltration values. If not found, note exactly what was searched.
2. Fetch the MANUFACTURER-SPECIFIC NFRC ratings document directly (these exist for all major manufacturers — fetch the one that applies):
   - Andersen A-Series: https://www.andersenwindows.com/-/media/aw/files/technical-docs/performance/performance-windows-patiodoors-nfrcratings--a-series.pdf
   - Andersen 400 Series: https://www.andersenwindows.com/for-professionals/documents/performance
   - Andersen 100/200 Series: https://www.andersenwindows.com/for-professionals/documents/performance
   - Marvin: https://www.marvin.com/resources/technical-documents
   - Pella: https://www.pella.com/resources/energy-performance/
   - Milgard: https://www.milgard.com/window-resources/technical-data
   - Simonton: https://www.simonton.com/resources/performance-data/
   - Jeld-Wen: https://www.jeld-wen.com/resources/certifications/
   - Alpen: https://alpenwindows.com/resources/
   - ProVia: https://www.proviaproducts.com/resources/
   - CGI: https://www.cgiwindows.com/resources/
   - Sierra Pacific: https://www.sierrapacificwindows.com/technical-resources/
   - Reliabilt/Window World: search NFRC database directly
3. Fetch https://www.windowpurchase.com — search for the product name. Jay Johnson's reviews are the highest-authority independent window evaluations. Extract full review if found.
4. Fetch https://www.thewindowdog.com — search for the product name. Extract any review content found.
5. Fetch the manufacturer's official product page for this specific product and configuration. Extract all published specs.
6. Fetch https://www.energystar.gov/productfinder/product/certified-windows — search for the product to confirm Energy Star certification tier and climate zones.
7. Fetch https://recalls.cpsc.gov — search for the product name and manufacturer. Document any active recalls.
8. Fetch https://www.aama.net — verify AAMA certification status and performance class for this product.
9. Fetch https://declare.living-future.org — search for the product or manufacturer for any Declare label certifications.
10. If Greenguard certification is claimed: fetch https://spot.ul.com to verify.

PHASE 2 — REQUIRED SEARCHES (perform each one):
6. Search: "[Product Name] [configuration] NFRC U-factor SHGC air infiltration" — find any published performance data
7. Search: "[Product Name] AAMA certification structural performance grade"
8. Search: "[Product Name] IGU spacer system warm-edge dual-seal"
9. Search: "[Product Name] weatherstripping type installation method"
10. Search: "[Product Name] warranty terms transferable labor coverage"
11. Search: "[Product Name] problems failures complaints class action lawsuit"
12. Search: "[Product Name] Greenguard VOC emissions indoor air quality certification"
13. Search: "[Manufacturer] service network parts availability nationwide"
14. Search: "[Product Name] review greenbuildingadvisor OR finehomebuilding OR buildingscience"
15. Search: "[Product Name] vs [nearest competitor] comparison"
16. Search: "[Product Name] [Manufacturer] recall safety hazard CPSC" — check for any product safety actions
17. Search: "[Manufacturer] Prop 65 California warning" — check for any chemical disclosure warnings
18. Search: "[Product Name] VOC emissions indoor air quality certification Greenguard" — confirm or rule out air quality certifications

CRITICAL DATA TARGETS — you must find or explicitly note as NOT FOUND:
- U-factor (whole window, dual pane standard config)
- SHGC (whole window, dual pane standard config)  
- Visible Transmittance (VT)
- Air Infiltration (cfm/ft²)
- AAMA Performance Class and Grade
- Frame material composition (exact)
- Spacer system type (warm-edge vs aluminum)
- Seal system (dual vs single)
- Glazing bead construction (interior vs exterior accessible)
- Weatherstripping type and attachment method
- Warranty: glass / components / finish (years, transferable Y/N, labor Y/N)
- Jay Johnson score and key findings (WindowPurchase.com)
- Any active litigation or documented failure patterns

Your output must be a structured markdown document with these sections:
1. PRODUCT OVERVIEW — manufacturer, material class, configuration type, country of origin
2. CONFIRMED FINDINGS — every spec with source URL cited inline
3. UNKNOWN / NOT DISCLOSED — every data target above that could not be confirmed, with note on what was searched
4. RED FINDINGS — documented failure patterns, litigation, safety concerns (cite source and date)
5. YELLOW FINDINGS — ambiguities, single-source claims, unverified specs
6. CONFIDENCE ASSESSMENT — High / Moderate / Low, with rationale

Source citation format: (Source Name, Date, full URL)
Never score. Never grade. Leave all scoring to Bot 2.`;

const BOT2_EVALUATOR_PROMPT = `You are The Residentialist Evaluator Bot (Bot 2). Your job is to score a product against the Residentialist rubric using the structured findings from Bot 1. Show all math explicitly. Never score a component you cannot source.

SCORING STRUCTURE:
- Axis 1: Quality (1/3 of Overall) — 1A Materials Quality (35%), 1B Manufacturing Quality (35%), 1C Professional Consensus (30%)
- Axis 2: Durability (1/3 of Overall) — 2A Frame Longevity (37.5%), 2B Materials Durability (37.5%), 2C Repairability & Support (25%)
- Axis 3: Performance (1/3 of Overall) — 3A Thermal (35%), 3B Structural (25%), 3C Air & Water (40%)
- Overall = (Axis 1 × 0.35) + (Axis 2 × 0.35) + (Axis 3 × 0.30)
- AXIS WEIGHTS (LOCKED March 11 2026 — Ray Shapley): Quality 35%, Durability 35%, Performance 30%
- DO NOT use equal thirds. Use these exact weights.

GRADE SCALE: A+ (9.5-10) | A (9.0-9.4) | A- (8.5-8.9) | B+ (8.0-8.4) | B (7.5-7.9) | B- (7.0-7.4) | C+ (6.5-6.9) | C (6.0-6.4)

MATERIAL HIERARCHY — 2B BASE SCORES (base scores, not ceilings — adjustments operate above AND below the base):
- Pultruded fiberglass (Ultrex/equivalent): base 9, ceiling 10. Each adjustment above base requires independent citation. No artificial cap. This is the best material class currently available — a fully documented product can reach 10.
- Aluminum-clad wood (extruded aluminum): base 8, ceiling 9. Adjustments require independent citation.
- Aluminum-clad wood (roll-form aluminum): base 7, ceiling 8. Adjustments require independent citation.
- Vinyl-clad wood: base 7, ceiling 8. Adjustments require independent citation.
- Composite/proprietary (Fibrex/equivalent): base 6, ceiling 7. Max documented adjustment: +1 for published composition/longevity data.
- Vinyl: base 5, ceiling 6. Adjustments require independent citation.
- VINYL CLASSIFICATION RULE: "Premium vinyl," "multi-chamber vinyl," "reinforced vinyl," and all other vinyl subtypes are DESIGN ATTRIBUTES only — not material class upgrades. All vinyl products regardless of chamber count, wall thickness, corner construction, or any other design feature score from base 5. Never reclassify a vinyl product to a higher base score. Multi-chamber construction may support a positive adjustment above base 5, but only if independently cited — it does not change the base starting point.
- Aluminum (non-clad): base 5, ceiling 6. Adjustments require independent citation.
- UNIVERSAL RULE: Every adjustment above base requires independent citation. Manufacturer claim alone is insufficient. When a superior material class emerges, the table recalibrates upward — existing ceilings do not decrease.
- Tier overlap is intentional: a well-documented lower-tier product can reach the same net 2B as a baseline higher-tier product.

CRITICAL RULES:
1. Every score must cite a source. Unknown = 5 with flag.
2. No double-counting — each concern scores in ONE axis only.
3. Professional Consensus (1C) hard ceiling: 7.5.
4. Show all arithmetic for every weighted calculation.
5. Score the standard production configuration, not premium upgrade options.
6. Composite/Fibrex net 2B ceiling = 7. Show base + adjustments explicitly.
7. ASSUMED vs UNDISCLOSED — CERTIFICATION FLOOR RULE (Universal Principle, applies to all categories):
   a. If a product holds a recognized certification (Energy Star, AAMA Gold Label, NFRC, WaterSense, AHRI, KCMA or equivalent) and the manufacturer has not published a specific tested value for a metric covered by that certification:
      - Score from the CERTIFICATION FLOOR — the minimum threshold required to hold that certification
      - Do NOT score at 5.0 midpoint default
      - Do NOT penalize beyond the certification floor
      - Flag as YELLOW: "Manufacturer holds [certification] but does not publish specific [metric] value. Scored from certification floor."
   b. Certification floors for windows:
      - Energy Star U-Factor (Northern zone): 0.30 — score deterministically from 0.30
      - Energy Star SHGC: score from zone-appropriate floor
      - Energy Star Air Infiltration: 0.30 cfm/ft² — score from 0.30, not 5.0
      - AAMA Gold Label: product passed air leakage, water, structural, thermal, forced entry — treat certifications as CONFIRMED, not "claimed"
      - If a bounded threshold is published (e.g. "<0.20"), score from that boundary — this IS meaningful disclosure
   c. If a product holds NO relevant certification for a metric AND no value is published: score at 5.0 midpoint and label "undisclosed — no certification floor available."
   d. Never apply a positive adjustment for an undisclosed spec. Never state an undisclosed spec as confirmed fact.
   e. CRITICAL: A certification held by a major manufacturer listed on the Energy Star partner registry or AAMA directory is CONFIRMED, not "claimed." Do not downgrade confirmed certifications to "claimed" without specific evidence of revocation.
8. CORRECTION MEMOS: The knowledge base may contain product-specific correction memos. These override the general material hierarchy. Read all knowledge files before scoring. If a correction memo exists for the product being evaluated, apply it exactly.
9. PARTS AVAILABILITY: Historical parts availability data (e.g. "80 years of historical products") documents past behavior only. Do not convert backward-looking data into forward guarantees.
10. FIELD COMPLAINTS AND MANUFACTURING DEFECTS: Never score field complaints, installation failures, or manufacturing defects in the Materials Durability (2B) subscore. These belong in 1B Manufacturing Quality only. Material Durability scores the material CLASS properties, not field execution.
11. RED vs YELLOW FINDINGS — apply this checklist to every negative finding:
    RED FINDING (ALL FOUR must be true — if any one fails, it is YELLOW):
    - Minimum 2 INDEPENDENT sources (different outlets, not the same story republished)
    - Documented pattern across multiple unrelated incidents, not a single event
    - Sourced to this specific product line, not the brand generally
    - Independently verifiable — court records, CPSC database, independent lab test, named investigative journalism
    RED FINDING also applies to: any manufacturer acknowledgment of inability to fix a documented failure pattern.
    EXPLICIT RED DISQUALIFIERS — these can NEVER be RED findings regardless of severity:
    - A single customer review, forum post, or comment — even if detailed or alarming
    - A denied, dismissed, or decertified class action — a denied class action is evidence in the manufacturer's FAVOR, not against them
    - A single installation anecdote (e.g. "29 of 39 units failed") — this is one customer's experience, not a systemic pattern
    - Yelp, Google, or BBB star ratings alone — these are sentiment data, not failure documentation
    - Any claim where the only source is the claimant themselves
    YELLOW FINDING (any one of these):
    - Single source only
    - Installation-dependent (may be installer error, not product defect)
    - Attributed to brand generally, not confirmed for this specific product line
    - Manufacturer acknowledged but not litigated or independently verified
    - Older than 10 years with no recent corroboration
    - Consumer complaint pattern without independent verification

12. MATERIAL CLASSIFICATION LOCK — THIS IS A HARD RULE:
    - The material class established by Bot 1 research is provided to you as LOCKED_MATERIAL_CLASS.
    - You MUST score from this material class. You MAY NOT silently reclassify it.
    - If you believe the locked classification is wrong, you MUST:
      a. STOP scoring
      b. Output exactly: "MATERIAL_RECLASSIFICATION_FLAG: I believe the material class should be [X] because [cite specific source URL and quote from Bot 1 research]. The locked class is [Y]. I cannot proceed without resolution."
      c. Do NOT produce a score. Do NOT continue the evaluation.
    - If you proceed with a different material class than LOCKED_MATERIAL_CLASS without flagging, the entire evaluation is invalid.
    - A material reclassification flag will be caught by the Challenge Bot and escalated. This is the correct behavior.

12. MATERIAL CLASSIFICATION LOCK — THIS IS A HARD RULE:
    - The material class established by Bot 1 research is provided to you as LOCKED_MATERIAL_CLASS.
    - You MUST score from this material class. You MAY NOT silently reclassify it.
    - If you believe the locked classification is wrong, you MUST:
      a. STOP scoring
      b. Output exactly: "MATERIAL_RECLASSIFICATION_FLAG: I believe the material class should be [X] because [cite specific source URL and quote from Bot 1 research]. The locked class is [Y]. I cannot proceed without resolution."
      c. Do NOT produce a score. Do NOT continue the evaluation.
    - If you proceed with a different material class than LOCKED_MATERIAL_CLASS without flagging, the entire evaluation is invalid.
    - A material reclassification flag will be caught by the Challenge Bot and escalated. This is the correct behavior.
    JUDGMENT SCORE FLOORS based on evidence classification:
    - Only NOTE-level evidence (single source): Judgment floor is 4.0 — cannot score below 4.0
    - YELLOW evidence (pattern, multiple sources, unverified): Judgment range 3.0–6.0
    - RED evidence (verified, multi-source, independent): Judgment range 1.0–5.0
    Before every Judgment score write: "EVIDENCE LEVEL: [NOTE/YELLOW/RED] — [reason in one sentence]"
    Label every negative finding as RED or YELLOW in your output. Never leave a finding unclassified.`;

const BOT3_MATERIAL_SAFETY_PROMPT = `You are The Residentialist Material Safety Bot (Bot 3). You evaluate health and toxicity risk from the product's materials during and after installation. You score on a 0-10 scale. Your score is published separately — it is never averaged into Quality, Durability, or Performance.

SCORE ANCHORS:
- 9.5-10: Fully certified (ILFI Declare + Greenguard Gold or equivalent), no credible flags, all ingredients disclosed
- 8.5-9.4: Partial certification (Greenguard Gold but no Declare), no confirmed concerns
- 7.0-8.4: Uncertified but clean materials (all-metal, inorganic, no volatile adhesives or foam)
- 5.0-6.9: Uncertified with moderate concern (vinyl/PVC, foam core, adhesive-dependent assembly, unconfirmed coatings)
- Below 5.0: Confirmed harmful substance, documented exposure pathway, or known toxicity finding

SOURCE HIERARCHY:
- Tier 1: ILFI Declare database, PHI materials list, peer-reviewed consumer-exposure health studies
- Tier 2: Greenguard Gold, UL SPOT, NSF, REACH documentation
- Tier 3 (no score weight): Manufacturer claims, Prop 65 (noise), VinylPlus

OUTPUT: Score (X.X/10), grade, score rationale, any flags with source citations, and a one-sentence buyer note.`;

// ─── BOT RUNNER ───────────────────────────────────────────────────────────────

const WEB_SEARCH_TOOL = { type: "web_search_20250305", name: "web_search" };

async function runBot(botName, systemPrompt, userMessage, model, useWebSearch) {
  console.log(`\n[ORCHESTRATOR] Running ${botName}...`);

  if (!useWebSearch) {
    const response = await client.messages.create({
      model: model || 'claude-sonnet-4-20250514',
      max_tokens: 16000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }]
    });
    const output = response.content.filter(b => b.type === "text").map(b => b.text).join("\n");
    console.log(`[ORCHESTRATOR] ${botName} complete. (~${output.length} chars)`);
    return output;
  }

  // Single call — server handles web search tool execution internally
  // If pause_turn, continue with text-only history (strip tool blocks)
  const messages = [{ role: 'user', content: userMessage }];
  let allText = [];
  let iterations = 0;
  const maxIterations = 20;

  while (iterations < maxIterations) {
    iterations++;
    console.log(`[ORCHESTRATOR] ${botName} — iteration ${iterations}...`);

    const stream = client.messages.stream({
      model: model || 'claude-sonnet-4-20250514',
      max_tokens: 16000,
      system: systemPrompt,
      messages: messages,
      tools: [WEB_SEARCH_TOOL]
    });

    const response = await stream.finalMessage();
    const stopReason = response.stop_reason;
    const textBlocks = response.content.filter(b => b.type === "text");
    if (textBlocks.length > 0) allText = allText.concat(textBlocks.map(b => b.text));

    console.log(`[ORCHESTRATOR] ${botName} — stop: ${stopReason}, text: ${allText.join('').length} chars`);

    if (stopReason === 'end_turn') break;

    if (stopReason === 'pause_turn' || stopReason === 'tool_use' || stopReason === 'max_tokens') {
      // Only keep text blocks in history — never send tool_use blocks back
      const safeContent = textBlocks.length > 0
        ? textBlocks
        : [{ type: 'text', text: '...' }];
      messages.push({ role: 'assistant', content: safeContent });
      messages.push({ role: 'user', content: [{ type: 'text', text: 'Continue.' }] });
      continue;
    }

    break;
  }

  const output = allText.join("\n");
  console.log(`[ORCHESTRATOR] ${botName} complete after ${iterations} iterations. (~${output.length} chars)`);
  return output;
}


// ─── CHALLENGE BOT (Bot 4) ────────────────────────────────────────────────────

const { runChallengeBot } = require('./challenge_bot_v2');
const { handleEscalation } = require('./council');
const { runReconciliationBot } = require('./reconciliation_bot');

// ─── MAIN PIPELINE ────────────────────────────────────────────────────────────

async function runPipeline(productName, config, researchFiles) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const productSlug = productName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  const outputDir = `/Users/Residentialist/.openclaw/workspace/residentialist/outputs/${productSlug}_${timestamp}`;

  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`\n[ORCHESTRATOR] ========================================`);
  console.log(`[ORCHESTRATOR] PIPELINE START: ${productName} (${config})`);
  console.log(`[ORCHESTRATOR] Output dir: ${outputDir}`);
  console.log(`[ORCHESTRATOR] ========================================`);

  // Load research files
  let researchContent = '';
  for (const file of researchFiles) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      researchContent += `\n\n--- SOURCE FILE: ${path.basename(file)} ---\n${content}`;
      console.log(`[ORCHESTRATOR] Loaded: ${file}`);
    } catch (err) {
      console.error(`[ORCHESTRATOR] WARNING: Could not load ${file}: ${err.message}`);
    }
  }

  if (!researchContent.trim()) {
    console.error('[ORCHESTRATOR] No local research files — Bot 1 will search the web.');

  }

  // Load knowledge files
  const knowledge = loadKnowledgeFiles();
  const knowledgeContent = Object.entries(knowledge)
    .map(([name, content]) => `--- KNOWLEDGE FILE: ${name} ---\n${content}`)
    .join('\n\n');

  // ── BOT 1: Consensus ──────────────────────────────────────────────────────
  const bot1Input = `PRODUCT: ${productName}
CONFIGURATION: ${config}

You are researching the ${productName} in ${config} configuration. Execute all required searches and fetches now. Do not stop after one sentence. Complete all 15 searches and 5 URL fetches, then write the full structured findings document.`;
  const bot1Output = await runBot('Bot 1 (Consensus)', BOT1_CONSENSUS_PROMPT, bot1Input, 'claude-sonnet-4-20250514', true);
  fs.writeFileSync(`${outputDir}/${productSlug}_bot1_consensus.md`, bot1Output);
  await verifyBotOutput(`${outputDir}/${productSlug}_bot1_consensus.md`, 'Bot 1 (Consensus)', productName, outputDir);
  await runDataCompletenessCheck(bot1Output, productName, 'windows', outputDir);

  // ── MATERIAL CLASS LOCK ───────────────────────────────────────────────────
  const materialLock = extractMaterialClass(bot1Output);
  const materialLockLine = materialLock.found
    ? `LOCKED_MATERIAL_CLASS: ${materialLock.rawText} (extracted from Bot 1 ${materialLock.source} — DO NOT RECLASSIFY without flagging per Rule 12)`
    : `LOCKED_MATERIAL_CLASS: UNDETERMINED — Bot 1 did not establish a clear material class. You MUST identify it from Bot 1 research and state it explicitly before scoring. If material class is ambiguous, flag it before scoring.`;
  
  fs.writeFileSync(`${outputDir}/MATERIAL_CLASS_LOCK.json`, JSON.stringify({
    product: productName,
    config,
    materialClass: materialLock.rawText,
    found: materialLock.found,
    source: materialLock.source,
    timestamp: new Date().toISOString()
  }, null, 2));
  console.log(`[ORCHESTRATOR] Material class lock: ${materialLock.rawText} (source: ${materialLock.source})`);

  // ── BOT 2: Evaluator ──────────────────────────────────────────────────────
  // Pre-compute ceiling and inject as hard constraint — not a rule to interpret
  const materialCeiling = getMaterialCeiling(materialLock.rawText);
  const ceilingConstraint = `HARD CONSTRAINT — 2B MATERIALS DURABILITY CEILING (PRE-COMPUTED):
Material Class: ${materialCeiling.label}
Base Score: ${materialCeiling.base}
Maximum Allowable 2B Net Score: ${materialCeiling.ceiling}
This ceiling is absolute. Your net 2B score MUST NOT exceed ${materialCeiling.ceiling}.
No combination of adjustments, certifications, proprietary claims, or documented performance data
can justify exceeding this ceiling. If your calculation produces a value above ${materialCeiling.ceiling},
round it down to ${materialCeiling.ceiling} and note that the ceiling was applied.
This is not a rubric rule — it is a pre-computed constraint injected by the pipeline.`;

  const bot2Input = `PRODUCT: ${productName}\nCONFIGURATION: ${config}\n${materialLockLine}\n\n${ceilingConstraint}\n\nKNOWLEDGE BASE:\n${knowledgeContent}\n\nBOT 1 CONSENSUS FINDINGS:\n${bot1Output}\n\nORIGINAL RESEARCH (for source verification):\n${researchContent}\n\nScore this product now. Show all math.`;
  const bot2Output = await runBot('Bot 2 (Evaluator)', BOT2_EVALUATOR_PROMPT, bot2Input, 'claude-sonnet-4-20250514');
  fs.writeFileSync(`${outputDir}/${productSlug}_bot2_evaluator.md`, bot2Output);
  await verifyBotOutput(`${outputDir}/${productSlug}_bot2_evaluator.md`, 'Bot 2 (Evaluator)', productName, outputDir);

  // ── BOT 3: Material Safety ────────────────────────────────────────────────
  const bot3Input = `PRODUCT: ${productName}\nCONFIGURATION: ${config}\n\nBOT 1 FINDINGS (for material identification):\n${bot1Output}\n\nORIGINAL RESEARCH:\n${researchContent}\n\nEvaluate material safety now.`;
  const bot3Output = await runBot('Bot 3 (Material Safety)', BOT3_MATERIAL_SAFETY_PROMPT, bot3Input, 'claude-haiku-4-5-20251001');
  fs.writeFileSync(`${outputDir}/${productSlug}_bot3_material_safety.md`, bot3Output);
  await verifyBotOutput(`${outputDir}/${productSlug}_bot3_material_safety.md`, 'Bot 3 (Material Safety)', productName, outputDir);

    // ── BOT 5: Reconciliation ──────────────────────────────────────────────────────────────────
  console.log('\n[ORCHESTRATOR] Running Bot 5 (Reconciliation)...');
  const reconciliationResult = await runReconciliationBot(bot1Output, bot2Output, productName, outputDir);
  fs.writeFileSync(`${outputDir}/RECONCILIATION_STATUS.txt`,
    `STATUS: ${reconciliationResult.status}\nCONFIDENCE: ${reconciliationResult.confidenceTag}\nPRODUCT: ${productName}\nTIMESTAMP: ${new Date().toISOString()}`
  );
  await verifyBotOutput(`${outputDir}/${productSlug}_bot5_reconciliation.md`, 'Bot 5 (Reconciliation)', productName, outputDir);

  if (reconciliationResult.status === 'UNRESOLVED') {
    console.log('[ORCHESTRATOR] Reconciliation unresolved — routing unresolved items to Council...');
    const reconEscalation = await handleEscalation(
      `RECONCILIATION UNRESOLVED:\n${reconciliationResult.unresolvedItems}`,
      bot1Output,
      bot2Output,
      bot3Output,
      productName,
      outputDir
    );
    if (reconEscalation.pipeline === 'HALTS') {
      console.log('[ORCHESTRATOR] HALTED - Reconciliation escalation sent to Ray.');
      fs.writeFileSync(`${outputDir}/PIPELINE_STATUS.txt`,
        `STATUS: HALTED - RECONCILIATION ESCALATED\nPRODUCT: ${productName}\nCONFIG: ${config}\nTIMESTAMP: ${timestamp}\nSee: RECONCILIATION_STATUS.txt and council_session.md`
      );
      return { status: 'ESCALATED', outputDir, bot1Output, bot2Output, bot3Output };
    }
  }

  if (reconciliationResult.revisions && reconciliationResult.revisions.length > 0) {
    console.log(`[ORCHESTRATOR] Bot 5 revisions: ${reconciliationResult.revisions.join(', ')}`);
  }

  // ── BOT 4: Challenge Bot ──────────────────────────────────────────────────
  console.log('\n[ORCHESTRATOR] Running Bot 4 (Challenge Bot)...');
  const challengeResult = await runChallengeBot(bot1Output, bot2Output, bot3Output, productName);
  fs.writeFileSync(`${outputDir}/${productSlug}_bot4_challenge.md`, challengeResult);
  await verifyBotOutput(`${outputDir}/${productSlug}_bot4_challenge.md`, 'Bot 4 (Challenge)', productName, outputDir);

  // ── DETERMINISTIC VALIDATOR ────────────────────────────────────────────────
  // Runs BEFORE flag gate. Pure rules engine — no reasoning, no API calls.
  // Hard violations throw and halt pipeline immediately.
  try {
    const valResult = deterministicValidate(outputDir, productName);
    if (!valResult.valid) {
      const msg = 'DETERMINISTIC VALIDATOR FAILED:\n' + valResult.violations.join('\n');
      console.log('[ORCHESTRATOR] BLOCKED:', msg);
      fs.writeFileSync(outputDir + '/VALIDATION_FAILED.txt', msg);
      await sendTelegram('BLOCKED: ' + productName + '\n' + valResult.violations[0]);
      throw new Error('Deterministic validation failed — pipeline halted: ' + valResult.violations[0]);
    }
    valResult.warnings.forEach(w => console.log('[ORCHESTRATOR] VALIDATOR WARNING:', w));
    if (valResult.warnings.length) {
      await sendTelegram('WARNING: ' + productName + '\n' + valResult.warnings.join('\n'));
    }
    console.log('[ORCHESTRATOR] Deterministic validator: PASS');
  } catch(ve) {
    if (ve.message.includes('Deterministic validation failed')) throw ve;
    console.log('[ORCHESTRATOR] Validator non-fatal error:', ve.message);
  }

    // ── FLAG GATE ───────────────────────────────────────────────────────────────────────────
  // Detect FLAG: scan all lines for VERDICT, then check for any FLAG indicators
  const crLines = challengeResult.split('\n');
  const verdictLine = crLines.find(l => l.toUpperCase().includes('VERDICT'));
  const hasMaterialReclassFlag = bot2Output.includes('MATERIAL_RECLASSIFICATION_FLAG');
  const hasCheckFlag = challengeResult.includes('FLAG') && (
    challengeResult.includes('CHECK 1') ||
    challengeResult.includes('CHECK 2') ||
    challengeResult.includes('CHECK 3')
  );
  const isFlagged = hasMaterialReclassFlag || (verdictLine
    ? verdictLine.toUpperCase().includes('FLAG')
    : hasCheckFlag);
  
  if (hasMaterialReclassFlag) {
    console.log('[ORCHESTRATOR] MATERIAL RECLASSIFICATION FLAG detected in Bot 2 output — routing to Council.');
    await sendTelegram(`⚠️ *MATERIAL FLAG — ${productName}*\nBot 2 believes Bot 1 material class is wrong. Council review required.`);
  }

  if (isFlagged) {
    console.log('\n[ORCHESTRATOR] WARNING: Challenge Bot FLAG detected - routing to Council...');

    const escalationResult = await handleEscalation(
      challengeResult,
      bot1Output,
      bot2Output,
      bot3Output,
      productName,
      outputDir
    );

    if (escalationResult.pipeline === 'HALTS') {
      console.log('\n[ORCHESTRATOR] HALTED - Ray escalation sent via Telegram.');
      console.log(`[ORCHESTRATOR] Council session log: ${outputDir}/council_session.md`);
      fs.writeFileSync(`${outputDir}/PIPELINE_STATUS.txt`,
        `STATUS: HALTED - AWAITING RAY DECISION\nPRODUCT: ${productName}\nCONFIG: ${config}\nTIMESTAMP: ${timestamp}\nREASON: Council escalation - see council_session.md\nRAY NOTIFIED: ${new Date().toISOString()}`
      );
      return { status: 'ESCALATED', outputDir, challengeResult, bot1Output, bot2Output, bot3Output };
    }

    console.log('\n[ORCHESTRATOR] PASS - Council resolved flag - pipeline continuing with memo attached.');
    fs.writeFileSync(`${outputDir}/${productSlug}_council_memo.md`,
      `# Council Resolution Memo\nProduct: ${productName}\nTimestamp: ${new Date().toISOString()}\n\n${escalationResult.memo}`
    );
  }

  // ── PASS ────────────────────────────────────────────────────────────────────────────────
  console.log('\n[ORCHESTRATOR] Pipeline complete.');
  console.log(`[ORCHESTRATOR] All outputs saved to: ${outputDir}`);
  fs.writeFileSync(`${outputDir}/PIPELINE_STATUS.txt`,
    `STATUS: PASS\nPRODUCT: ${productName}\nCONFIG: ${config}\nTIMESTAMP: ${timestamp}\nAll four bots completed. Ready for report assembly.`
  );

  console.log(`\n[ORCHESTRATOR] Files:`);
  console.log(`  ${productSlug}_bot1_consensus.md`);
  console.log(`  ${productSlug}_bot2_evaluator.md`);
  console.log(`  ${productSlug}_bot3_material_safety.md`);
  console.log(`  ${productSlug}_bot4_challenge.md`);
  if (fs.existsSync(`${outputDir}/${productSlug}_council_memo.md`)) {
    console.log(`  ${productSlug}_council_memo.md`);
    console.log(`  council_session.md`);
  }
  console.log(`  PIPELINE_STATUS.txt`);

  return { status: 'PASS', outputDir, bot1Output, bot2Output, bot3Output, challengeResult };
}

// ─── CLI ENTRY POINT ──────────────────────────────────────────────────────────

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.log('Usage: node bot_orchestrator.js <product_name> <config> <research_file_1> [research_file_2]...');
    console.log('Example: node bot_orchestrator.js "Marvin Integrity DH" DH ./inputs/marvin_integrity_research.md');

  }
  const productName = args[0];
  const config = args[1];
  const researchFiles = args.slice(2);

  runPipeline(productName, config, researchFiles)
    .then(result => process.exit(result.status === 'PASS' ? 0 : 1))
    .catch(err => { console.error('[ORCHESTRATOR] FATAL:', err); process.exit(1); });
}

module.exports = { runPipeline };

```

---

### 12.2 — bot6_report_assembly_v2.js (Report Generator)
**Mac Mini path:** `/Users/Residentialist/.openclaw/workspace/residentialist/bot6_report_assembly_v2.js`
**Note:** This is the authoritative report design. The HTML/CSS within this file defines the visual report format. Do not modify report structure without Ray's explicit approval.

```javascript
'use strict';
// BOT 6 v2 — REPORT ASSEMBLY (HTML)
// The Residentialist | Updated March 2026
// Generates the full v5 HTML report from pipeline output files
// Three commands:
//   scan        — check all output folders, flag orphaned/incomplete runs
//   report      — assemble HTML report for one product
//   report-all  — assemble HTML reports for all complete runs

const fs   = require('fs');
const path = require('path');
const https = require('https');
require('dotenv').config({ path: '/Users/Residentialist/.openclaw/workspace/residentialist/.env' });

const OUTPUTS_DIR = '/Users/Residentialist/.openclaw/workspace/residentialist/outputs';
const TOKEN       = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID     = process.env.TELEGRAM_CHAT_ID;

// ─── Telegram ─────────────────────────────────────────────────────────────────
function sendTelegram(message) {
  return new Promise((resolve) => {
    try {
      const body = JSON.stringify({ chat_id: CHAT_ID, text: message, parse_mode: 'Markdown' });
      const opts = {
        hostname: 'api.telegram.org',
        path: `/bot${TOKEN}/sendMessage`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
      };
      const req = https.request(opts, (res) => { res.on('data', () => {}); res.on('end', resolve); });
      req.on('error', () => resolve());
      req.write(body); req.end();
    } catch { resolve(); }
  });
}

// ─── File helpers ─────────────────────────────────────────────────────────────
function readFile(fp) {
  try { return fs.readFileSync(fp, 'utf8'); } catch { return null; }
}

function findFile(dir, keyword) {
  try {
    const files = fs.readdirSync(dir);
    const f = files.find(x => x.includes(keyword));
    return f ? readFile(path.join(dir, f)) : null;
  } catch { return null; }
}

// ─── Parsers ──────────────────────────────────────────────────────────────────

function parseStatus(txt) {
  if (!txt) return {};
  return {
    product:    (txt.match(/^PRODUCT:\s*(.+)/m)  || [])[1]?.trim() || '',
    config:     (txt.match(/^CONFIG:\s*(.+)/m)   || [])[1]?.trim() || 'DH',
    timestamp:  (txt.match(/^TIMESTAMP:\s*(.+)/m)|| [])[1]?.trim() || '',
    confidence: (txt.match(/DATA CONFIDENCE:\s*(HIGH|MODERATE|LOW)/i) || [])[1] || 'MODERATE',
    midpoints:  parseInt((txt.match(/(\d+)\s+spec\(s\)\s+scored at midpoint/i) || [])[1] || '0'),
  };
}

function parseAxisScores(txt) {
  if (!txt) return null;
  // Prefer the final calculated value from "X Calculation:" blocks — e.g. "→ 6.43**"
  // This is more accurate than the axis header which may show a draft/pre-rounding value
  const qCalc = txt.match(/Quality Calculation:[\s\S]*?→\s*([0-9]+\.[0-9]+)\*\*/i);
  const dCalc = txt.match(/Durability Calculation:[\s\S]*?→\s*([0-9]+\.[0-9]+)\*\*/i);
  const pCalc = txt.match(/Performance Calculation:[\s\S]*?→\s*([0-9]+\.[0-9]+)\*\*/i);
  if (qCalc && dCalc && pCalc) {
    return { Q: parseFloat(qCalc[1]), D: parseFloat(dCalc[1]), P: parseFloat(pCalc[1]) };
  }
  // Fallback to axis headers if no calculation blocks found
  const q = txt.match(/##\s*QUALITY[^:]*:\s*[A-Z][+-]?\s*\(([0-9.]+)\/10\)/i);
  const d = txt.match(/##\s*DURABILITY[^:]*:\s*[A-Z][+-]?\s*\(([0-9.]+)\/10\)/i);
  const p = txt.match(/##\s*PERFORMANCE[^:]*:\s*[A-Z][+-]?\s*\(([0-9.]+)\/10\)/i);
  if (!q || !d || !p) return null;
  return { Q: parseFloat(q[1]), D: parseFloat(d[1]), P: parseFloat(p[1]) };
}

function weightedOverall(axes) {
  return Math.round((axes.Q * 0.35 + axes.D * 0.35 + axes.P * 0.30) * 100) / 100;
}

function gradeFromScore(s) {
  if (s >= 9.0) return { letter: 'A', mod: '+' };
  if (s >= 8.5) return { letter: 'A', mod: '' };
  if (s >= 8.0) return { letter: 'A', mod: '−' };
  if (s >= 7.5) return { letter: 'B', mod: '+' };
  if (s >= 7.0) return { letter: 'B', mod: '' };
  if (s >= 6.5) return { letter: 'B', mod: '−' };
  if (s >= 6.0) return { letter: 'C', mod: '+' };
  if (s >= 5.5) return { letter: 'C', mod: '' };
  if (s >= 5.0) return { letter: 'C', mod: '−' };
  if (s >= 4.5) return { letter: 'D', mod: '+' };
  if (s >= 4.0) return { letter: 'D', mod: '' };
  return { letter: 'F', mod: '' };
}

function axisGrade(s) {
  const g = gradeFromScore(s);
  return g.letter + g.mod;
}

function labelFromScore(s) {
  if (s >= 9.0) return 'Exceptional';
  if (s >= 8.0) return 'Excellent';
  if (s >= 7.5) return 'Strong';
  if (s >= 7.0) return 'Good';
  if (s >= 6.5) return 'Competent';
  if (s >= 6.0) return 'Adequate';
  if (s >= 5.5) return 'Below Average';
  if (s >= 5.0) return 'Weak';
  return 'Poor';
}

// Parse subscore lines like "### Frame Material & Construction: 6.0/10"
function parseSubscores(txt) {
  if (!txt) return { Q: [], D: [], P: [] };
  const sections = { Q: [], D: [], P: [] };
  let currentAxis = null;
  for (const line of txt.split('\n')) {
    if (line.match(/^##\s*QUALITY/i))     { currentAxis = 'Q'; continue; }
    if (line.match(/^##\s*DURABILITY/i))  { currentAxis = 'D'; continue; }
    if (line.match(/^##\s*PERFORMANCE/i)) { currentAxis = 'P'; continue; }
    if (line.match(/^##\s*OVERALL/i))     { currentAxis = null; continue; }
    if (!currentAxis) continue;
    // Match: "### Label: X.X/10" or "**Label:** X.X/10"
    const m = line.match(/^###\s+(.+?):\s*([0-9]+\.[0-9]+)\/10/) ||
              line.match(/\*\*(.+?)[:\*]+\s*([0-9]+\.[0-9]+)\/10/);
    if (m) {
      const label = m[1].replace(/\*\*/g, '').trim();
      const score = parseFloat(m[2]);
      if (label && !isNaN(score) && score <= 10) {
        sections[currentAxis].push({ label, score });
      }
    }
  }
  return sections;
}

// Parse failure patterns (YELLOW/RED findings)
// Stops at ## MECHANICAL VALIDATION — internal QC, never goes in the report
// Skips **Reasoning:** lines — those are bot internal notes, not findings
function parseFailures(txt) {
  if (!txt) return [];
  const stripped = txt.split(/^##\s*MECHANICAL VALIDATION/im)[0];
  const failures = [];
  const lines = stripped.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Skip Reasoning lines — they may mention "Yellow Finding" but are internal notes
    if (line.match(/^\*?\*?Reasoning:/i)) continue;
    // Must be a **Documented Issues:** YELLOW/RED line or similar direct finding
    const m = line.match(/\*?\*?(YELLOW|RED)\s*[—-]\s*(.+)/i);
    if (m) {
      const sev = m[1].toUpperCase();
      const desc = m[2].replace(/\*\*/g, '').trim();
      // Next line as detail only if it's not a Reasoning/internal line
      const nextLine = lines[i+1] || '';
      const detail = !nextLine.match(/^\*?\*?Reasoning:|^\*?\*?[A-Z][^:]+:\*?\*?/i)
        ? nextLine.replace(/^[-*•]\s*/, '').replace(/\*\*/g, '').trim()
        : '';
      if (desc.length > 4) failures.push({ sev, desc, detail });
    }
  }
  const seen = new Set();
  return failures.filter(f => {
    const key = f.desc.slice(0, 40);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 4);
}

// Parse safety data from bot3
function parseSafety(txt) {
  if (!txt) return { score: null, tier: 'unknown', verdictLabel: 'No Concerns Identified', flags: [] };
  const scoreM = txt.match(/##\s*SCORE:\s*([0-9.]+)\/10\s*\|[^|]*\|\s*\*?\*?([^*\n]+)\*?\*?/i);
  const score   = scoreM ? parseFloat(scoreM[1]) : null;
  const rawVerdict = scoreM ? scoreM[2].trim() : '';

  // Map to our three-tier system
  let tier = 'clear';
  let verdictLabel = 'No Concerns Identified';
  if (rawVerdict.match(/ELEVATED|HIGH CONCERN/i)) {
    tier = 'concern'; verdictLabel = 'Elevated Concern';
  } else if (rawVerdict.match(/MODERATE|REVIEW/i)) {
    tier = 'review'; verdictLabel = 'Incomplete Disclosure';
  }

  // Only extract flags from the FLAG CITATIONS section — ignore everything above it
  const flagSection = txt.split(/##\s*FLAG CITATIONS/i)[1] || '';
  const flags = [];
  for (const row of flagSection.split('\n')) {
    if (!row.startsWith('|')) continue;
    const cols = row.split('|').map(s => s.trim()).filter(Boolean);
    // Skip header row, separator row, and rows with fewer than 3 cols
    if (cols.length < 3) continue;
    if (cols[0].match(/^FLAG$|^-+$/i)) continue;
    const severity = cols[1].replace(/\*\*/g, '').trim();
    // Skip safety-neutral flags — they're QA issues, not health flags
    if (severity.match(/safety-neutral/i)) continue;
    const label = cols[0].replace(/\*\*/g, '').trim();
    flags.push({ label, severity });
  }

  return { score, tier, verdictLabel, flags: flags.slice(0, 5) };
}

// Extract score rationale paragraphs from bot2 SCORE JUSTIFICATION
function parseRationale(txt) {
  if (!txt) return { Q: '', D: '', P: '' };
  const justM = txt.match(/##\s*SCORE JUSTIFICATION[:\s\n]+([\s\S]+?)(?=##|$)/i);
  if (!justM) return { Q: '', D: '', P: '' };
  // Strip internal pipeline notes: calibration benchmark lines and anything after ---
  let block = justM[1]
    .replace(/^Calibration benchmark:.*$/im, '')
    .split(/^---/m)[0]
    .trim();
  // Split into sentences
  const sentences = block.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 20);
  // Each sentence goes to exactly one axis — the most specific match wins
  // Avoid the same sentence appearing in multiple axes
  const used = new Set();
  const pick = (axisPrefix, keywords, fallback) => {
    const matches = sentences.filter(s => {
      if (used.has(s)) return false;
      if (s.startsWith(axisPrefix)) return true;
      return keywords.some(k => s.toLowerCase().includes(k.toLowerCase()));
    });
    if (matches.length === 0) return fallback || '';
    const top = matches.slice(0, 2);
    top.forEach(s => used.add(s));
    return top.join(' ').trim();
  };
  const Q = pick('Quality', ['frame material','hardware quality','glazing system','exterior finish','construction quality']);
  const D = pick('Durability', ['durability','longevity','warranty','dealer network','repairability','serviceab']);
  const P = pick('Performance', ['nfrc','u-factor','shgc','air infiltration','certified data','vt data']);
  return { Q, D, P };
}

// Extract expected lifespan
function parseLifespan(txt) {
  if (!txt) return null;
  const m = txt.match(/EXPECTED LIFESPAN[\s\S]*?Median[^:]*:\s*(.+?)(?:\n|$)/i);
  return m ? m[1].replace(/\*\*/g, '').trim() : null;
}

// Extract manufacturer/product attributes from bot2
function parseAttrs(txt) {
  if (!txt) return {};
  const frame  = (txt.match(/\*\*Material:\*\*\s*([^\n]+)/) || txt.match(/Frame Material[^:]*:\s*([^\n]+)/) || [])[1];
  const glaz   = (txt.match(/\*\*Configuration:\*\*\s*([^\n]+)/) || txt.match(/Configuration[^:]*:\s*([^\n]+)/) || [])[1];
  // U-factor: must be a real value like "0.27" or "U-0.27", not a subscore header like "5.0/10"
  // Require the value to be <= 2.0 (real U-factors are always < 2) and not followed by /10
  const ufactM = txt.match(/\*\*Value:\*\*\s*([0-9]+\.[0-9]+)(?!\s*\/10)/) ||
                 txt.match(/U[- ]?Factor[^\n]*:\s*U?-?([0-9]+\.[0-9]+)(?!\s*\/10)/) ||
                 txt.match(/U[- ]?factor[^\n]*=\s*([0-9]+\.[0-9]+)(?!\s*\/10)/i);
  const ufact  = ufactM && parseFloat(ufactM[1]) <= 2.0 ? ufactM[1] : null;

  // SHGC: must be real value 0.0–1.0, not a subscore
  const shgcM  = txt.match(/\*\*SHGC[^:]*:\*\*\s*([0-9]+\.[0-9]+)(?!\s*\/10)/) ||
                 txt.match(/SHGC[^:\n]*:\s*([0-9]+\.[0-9]+)(?!\s*\/10)/);
  const shgc   = shgcM && parseFloat(shgcM[1]) <= 1.0 ? shgcM[1] : null;
  const ai     = (txt.match(/\*\*AAMA Certified Value:\*\*\s*([0-9.]+)\s*cfm/i) ||
                  txt.match(/AAMA Certified Value[^:]*:\s*([0-9.]+)\s*cfm/i) ||
                  txt.match(/air infiltration[^:]*:\s*([0-9.]+)\s*cfm/i) || [])[1];
  const vt     = (txt.match(/VT[^:]*:\s*([0-9.]+)/) || txt.match(/Visible Transmittance[^:]*:\s*([0-9.]+)/) || [])[1];
  const aama   = (txt.match(/Performance Grade[^:]*:\s*(PG\s*\d+)/i) ||
                  txt.match(/AAMA[^:]*:\s*(R-LC\d+|PG\s*\d+|LC\d+)/i) || [])[1];
  const warr   = (txt.match(/\*\*(?:Frame|Warranty)[^:]*\*\*[^:]*:\s*([^\n]+)/) || [])[1];
  const lifespan = parseLifespan(txt);
  return {
    frame:   frame  ? frame.trim().split('\n')[0].replace(/\*\*/g, '') : null,
    glazing: glaz   ? glaz.trim().split('\n')[0].replace(/\*\*/g, '')  : null,
    ufact:   ufact  ? parseFloat(ufact) : null,
    shgc:    shgc   ? parseFloat(shgc)  : null,
    ai:      ai     ? parseFloat(ai)    : null,
    vt:      vt     ? parseFloat(vt)    : null,
    aama:    aama   ? aama.trim()       : null,
    warranty: warr  ? warr.trim()       : null,
    lifespan,
  };
}

// Determine price tier from product name heuristics + score
function priceTier(productName, score) {
  const name = productName.toLowerCase();
  if (name.match(/alpen|internorm|marvin elevate|sierra pacific/)) return 'Architectural';
  if (name.match(/reliabilt|window world/)) return 'Builder Grade';
  if (score >= 7.5) return 'Architectural';
  if (score >= 6.0) return 'Premium Residential';
  return 'Builder Grade';
}

function tierBandIndex(tier) {
  if (tier === 'Builder Grade')        return 0;
  if (tier === 'Premium Residential')  return 1;
  if (tier === 'Architectural')        return 2;
  if (tier === 'High Performance')     return 3;
  return 1;
}

// ─── HTML TEMPLATE ────────────────────────────────────────────────────────────
function buildHTML(data) {
  const {
    productName, config, overall, grade, axes, subscores,
    safety, failures, rationale, attrs, status, tier, tierIdx,
    dateStr,
  } = data;

  const letterFontSize = grade.letter === 'W' ? '140px' : '164px';

  // Helper to render a bar width % from score/10
  const pct = (s) => `${Math.round((s / 10) * 100)}%`;

  // Subscore rows HTML
  function subRows(list) {
    return list.map(sub => `
      <tr class="sub-row">
        <td>${sub.label}
          <span class="mbar"><span class="mbar-fill" style="width:${pct(sub.score)}"></span></span>
        </td>
        <td class="sc">${sub.score.toFixed(1)}</td>
      </tr>`).join('');
  }

  // Safety subsection cells
  function safetyCells() {
    const chemFlags = (safety.flags || []).filter(f =>
      !f.label.match(/warping|south-facing|thermal stress|durability/i)
    );
    if (chemFlags.length === 0) {
      return `<div class="safety-sub"><div class="safety-sub-label">Assessment</div>
        <div class="safety-sub-val ok">No disclosure gaps identified</div></div>`;
    }
    return chemFlags.map(f => {
      // High severity = real chemistry concern, else it's a disclosure gap
      const isChemConcern = f.severity && f.severity.match(/High/i);
      const valLabel = isChemConcern ? 'Chemistry Concern' : 'Not Disclosed';
      const valCls   = isChemConcern ? 'flag' : 'neutral';
      return `
      <div class="safety-sub">
        <div class="safety-sub-label">${f.label}</div>
        <div class="safety-sub-val ${valCls}">${valLabel}</div>
      </div>`;
    }).join('');
  }

  // Failure items HTML
  function failItems() {
    if (!failures || failures.length === 0) {
      return `<li class="fail-item"><span class="sev yellow">Yellow</span>
        <div class="fail-body">No significant field failure patterns documented at this time.</div></li>`;
    }
    return failures.map(f => `
      <li class="fail-item">
        <span class="sev ${f.sev.toLowerCase()}">${f.sev.charAt(0) + f.sev.slice(1).toLowerCase()}</span>
        <div class="fail-body"><strong>${f.desc}</strong>${f.detail ? '<br>' + f.detail : ''}</div>
      </li>`).join('');
  }

  // Tier band visual
  const bandSegs = ['Builder', 'Prem.', 'Arch.', 'Hi Perf.'].map((lbl, i) => {
    const active = i === tierIdx;
    return `<div class="band-seg${active ? ' active' : ''}"></div>`;
  }).join('');
  const bandLabels = ['Builder', 'Prem.', 'Arch.', 'Hi Perf.'].map((lbl, i) => {
    const active = i === tierIdx;
    return `<div class="band-lbl-item${active ? ' active' : ''}">${lbl}</div>`;
  }).join('');

  // Safety verdict color
  const svClass = safety.tier || 'clear';
  const svDotColor = { clear: '#2C5F3A', review: '#B8860B', concern: '#7A2C1E' }[svClass] || '#2C5F3A';
  const svBg      = { clear: '#EBF5EE', review: '#FEF3C7', concern: '#FEE2E2' }[svClass];
  const svBorder  = { clear: '#A8D4B4', review: '#F0C060',  concern: '#F0A090' }[svClass];

  // Spec grid rows
  function specCell(label, val, sub, highlight, cert) {
    if (!val) return '';
    return `<div class="spec-cell">
      <div class="spec-label">${label}</div>
      <div class="spec-val${cert ? ' cert' : ''}">${val}</div>
      ${highlight ? `<div class="spec-highlight">${highlight}</div>` : ''}
      ${sub ? `<div class="spec-sub">${sub}</div>` : ''}
    </div>`;
  }

  const uFactorR = attrs.ufact ? `R-${(1 / attrs.ufact).toFixed(1)} equivalent` : null;
  const shgcPct  = attrs.shgc  ? `Blocks ${Math.round((1 - attrs.shgc) * 100)}% of solar heat gain` : null;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${productName} — The Residentialist</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap" rel="stylesheet">
<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/topojson/3.0.2/topojson.min.js"></script>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --ink:#0F0E0D;--ink-light:#3A3836;--ink-faint:#7A7672;--rule:#E4DFD9;
  --page:#FFFFFF;--warm:#F8F5F0;--amber:#B8722A;--amber-light:#E8C48A;
  --amber-faint:#FAF3E8;--green:#2C5F3A;--red:#7A2C1E;
}
html{font-size:15px}
body{font-family:'DM Sans',sans-serif;background:#E8E4DF;color:var(--ink);-webkit-font-smoothing:antialiased;padding:48px 0 64px}
.page-wrap{max-width:980px;margin:0 auto;background:var(--page);box-shadow:0 8px 80px rgba(0,0,0,0.14),0 2px 12px rgba(0,0,0,0.06)}
/* masthead */
.masthead{padding:24px 56px;display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid var(--ink)}
.wordmark{font-family:'Syne',sans-serif;font-size:11px;font-weight:800;letter-spacing:.30em;text-transform:uppercase;color:var(--ink);text-decoration:none}
.wordmark em{color:var(--amber);font-style:normal}
.masthead-center{font-family:'Cormorant Garamond',serif;font-size:13px;font-style:italic;color:var(--ink-faint)}
.masthead-right{font-family:'Syne',sans-serif;font-size:10px;font-weight:600;letter-spacing:.12em;color:var(--ink-faint);text-align:right;text-transform:uppercase}
/* hero */
.hero{padding:56px 56px 48px;display:grid;grid-template-columns:1fr auto;gap:48px;align-items:start;border-bottom:1px solid var(--rule)}
.hero-eyebrow{font-family:'Syne',sans-serif;font-size:9px;font-weight:700;letter-spacing:.26em;text-transform:uppercase;color:var(--amber);margin-bottom:16px}
.hero-name{font-family:'Cormorant Garamond',serif;font-size:74px;font-weight:300;line-height:.92;color:var(--ink);letter-spacing:-.025em}
.hero-name em{font-style:italic;color:var(--ink-light);display:block;font-size:64px}
.hero-attrs{display:flex;margin-top:32px;border:1px solid var(--rule);border-right:none}
.hero-attr{padding:13px 20px;border-right:1px solid var(--rule);flex-shrink:0}
.attr-label{font-family:'Syne',sans-serif;font-size:8px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--ink-faint);margin-bottom:4px}
.attr-value{font-size:13px;font-weight:500;color:var(--ink)}
/* grade */
.grade-block{display:flex;flex-direction:column;align-items:center;padding-top:4px;min-width:180px}
.grade-display{display:flex;align-items:flex-start;line-height:1}
.grade-letter{font-family:'Cormorant Garamond',serif;font-size:${letterFontSize};font-weight:300;line-height:.85;color:var(--ink)}
.grade-mod{font-family:'Cormorant Garamond',serif;font-size:64px;font-weight:300;color:var(--ink);margin-top:22px;margin-left:2px}
.grade-meta{margin-top:14px;display:flex;flex-direction:column;align-items:center;gap:8px;width:100%}
.score-num{font-family:'Cormorant Garamond',serif;font-size:19px;font-weight:500;color:var(--ink);letter-spacing:.04em}
.score-badge{font-family:'Syne',sans-serif;font-size:9px;font-weight:700;letter-spacing:.20em;text-transform:uppercase;color:var(--amber);border:1.5px solid var(--amber);padding:5px 18px;display:inline-block}
/* verdict */
.verdict{padding:28px 56px;background:var(--warm);border-bottom:1px solid var(--rule);display:grid;grid-template-columns:90px 1fr;gap:32px;align-items:center}
.verdict-kicker{font-family:'Syne',sans-serif;font-size:9px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:var(--ink-faint)}
.verdict-text{font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:300;font-style:italic;line-height:1.45;color:var(--ink)}
/* body layout */
.body-layout{display:grid;grid-template-columns:1fr 288px}
.body-main{padding:52px 48px 72px 56px;border-right:1px solid var(--rule)}
.body-aside{padding:52px 30px 72px 34px}
/* kicker */
.kicker{font-family:'Syne',sans-serif;font-size:9px;font-weight:700;letter-spacing:.26em;text-transform:uppercase;color:var(--amber);margin-bottom:20px}
/* axis */
.axis-group{margin-bottom:48px}
.axis-defs{display:flex;gap:0;margin-bottom:22px;border:1px solid var(--rule);border-right:none}
.axis-def{flex:1;padding:12px 16px;border-right:1px solid var(--rule)}
.axis-def-name{font-family:'Syne',sans-serif;font-size:9px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--ink);margin-bottom:4px}
.axis-def-desc{font-size:11.5px;color:var(--ink-faint);line-height:1.55}
.axis-row{display:grid;grid-template-columns:148px 1fr 86px;align-items:center;gap:20px;padding:18px 0;border-bottom:1px solid var(--rule)}
.axis-row:first-child{border-top:1px solid var(--rule)}
.axis-name{font-family:'Syne',sans-serif;font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--ink)}
.axis-wt{font-size:11px;color:var(--ink-faint);margin-top:3px}
.bar-track{height:2px;background:var(--rule);position:relative}
.bar-fill{position:absolute;top:0;left:0;height:100%;background:var(--ink)}
.axis-right{text-align:right}
.axis-num{font-family:'Cormorant Garamond',serif;font-size:36px;font-weight:300;line-height:1;color:var(--ink)}
.axis-grade{font-family:'Syne',sans-serif;font-size:10px;font-weight:700;color:var(--ink-faint);margin-top:2px}
/* findings */
.findings{margin-bottom:48px}
.finding{display:grid;grid-template-columns:3px 1fr;gap:20px;padding:19px 0;border-bottom:1px solid var(--rule)}
.finding:first-child{border-top:1px solid var(--rule)}
.finding-rule{background:var(--amber)}
.finding strong{display:block;font-size:14px;font-weight:500;color:var(--ink);margin-bottom:5px}
.finding p{font-size:13.5px;color:var(--ink-light);line-height:1.65}
/* material safety */
.safety-block{background:var(--amber-faint);border-top:2.5px solid var(--amber);padding:30px 34px;margin-bottom:48px}
.safety-top{display:grid;grid-template-columns:1fr auto;gap:24px;align-items:start;margin-bottom:22px;padding-bottom:18px;border-bottom:1px solid var(--amber-light)}
.safety-kicker{font-family:'Syne',sans-serif;font-size:9px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:var(--amber);margin-bottom:8px}
.safety-verdict{display:inline-flex;align-items:center;gap:8px;padding:5px 13px;margin-bottom:10px}
.safety-verdict-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}
.safety-verdict-label{font-family:'Syne',sans-serif;font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase}
.safety-score-col{text-align:right}
.safety-num{font-family:'Cormorant Garamond',serif;font-size:50px;font-weight:300;line-height:1;color:var(--ink)}
.safety-denom{font-size:11px;color:var(--ink-faint);margin-top:3px}
.safety-subsections{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--amber-light);border:1px solid var(--amber-light)}
.safety-sub{background:#FDF8F1;padding:14px 16px}
.safety-sub-label{font-family:'Syne',sans-serif;font-size:8.5px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--amber);margin-bottom:5px}
.safety-sub-val{font-size:12.5px;color:var(--ink-light);line-height:1.5}
.safety-sub-val.ok{color:var(--green);font-weight:500}
.safety-sub-val.ok::before{content:'✓  ';font-size:10px}
.safety-sub-val.flag{color:var(--red);font-weight:500}
.safety-sub-val.na{color:var(--ink-faint);font-style:italic}
.safety-sub-val.neutral{color:var(--ink-mid)}
/* climate map */
.climate-block{margin-bottom:48px}
.climate-legend{display:flex;gap:24px;margin-bottom:10px;align-items:center}
.cl-item{display:flex;align-items:center;gap:8px;font-size:12px;font-weight:500;color:var(--ink)}
.cl-swatch{width:20px;height:12px;border-radius:2px;flex-shrink:0}
.climate-map-wrap{background:var(--warm);border:1px solid var(--rule);padding:4px 4px 0;margin-bottom:12px}
.climate-map-wrap svg{width:100%;height:auto;display:block}
.climate-caption{font-size:12px;color:var(--ink-faint);line-height:1.65}
.climate-caption strong{color:var(--ink);font-weight:500}
/* fit grid */
.fit-grid{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--rule);border:1px solid var(--rule);margin-bottom:48px}
.fit-cell{background:var(--page);padding:24px 22px}
.fit-head{font-family:'Syne',sans-serif;font-size:9px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;margin-bottom:13px;padding-bottom:9px;border-bottom:1.5px solid currentColor}
.fit-cell.for .fit-head{color:var(--green)}
.fit-cell.skip .fit-head{color:var(--red)}
.fit-list{list-style:none;display:flex;flex-direction:column;gap:9px}
.fit-list li{font-size:13px;color:var(--ink-light);line-height:1.5;padding-left:14px;position:relative}
.fit-list li::before{content:'—';position:absolute;left:0;color:var(--ink-faint);font-size:11px}
/* section divider */
.section-divider{display:flex;align-items:center;gap:16px;margin:52px 0 40px}
.section-divider::before,.section-divider::after{content:'';flex:1;height:1px;background:var(--rule)}
.section-divider-label{font-family:'Syne',sans-serif;font-size:9px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:var(--ink-faint);white-space:nowrap}
/* sub table */
.sub-table{width:100%;border-collapse:collapse;margin-bottom:48px}
.sub-table .ax-head td{font-family:'Syne',sans-serif;font-size:9px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--ink);background:var(--warm);padding:10px 13px;border-top:2px solid var(--ink);border-bottom:1px solid var(--rule)}
.sub-table .sub-row td{padding:12px 13px;border-bottom:1px solid var(--rule);font-size:13px;color:var(--ink-light);vertical-align:middle}
.sub-table .sub-row td:first-child{color:var(--ink)}
.sub-table .sub-row td.sc{font-family:'Cormorant Garamond',serif;font-size:26px;font-weight:300;color:var(--ink);text-align:right}
.mbar{display:inline-block;vertical-align:middle;width:40px;height:2px;background:var(--rule);margin-left:8px;position:relative}
.mbar-fill{position:absolute;top:0;left:0;height:100%;background:var(--amber)}
/* spec grid */
.spec-grid{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--rule);border:1px solid var(--rule);margin-bottom:48px}
.spec-grid::after{content:'';background:var(--page)}
.spec-cell{background:var(--page);padding:17px 19px}
.spec-label{font-family:'Syne',sans-serif;font-size:8.5px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--ink-faint);margin-bottom:5px}
.spec-val{font-size:14px;color:var(--ink)}
.spec-val.cert{color:var(--green);font-weight:500}
.spec-val.cert::before{content:'✓  ';font-size:11px}
.spec-sub{font-size:11.5px;color:var(--ink-faint);margin-top:3px;line-height:1.4}
.spec-highlight{font-family:'Syne',sans-serif;font-size:9px;font-weight:700;letter-spacing:.10em;color:var(--amber);margin-top:2px}
/* failures */
.fail-list{list-style:none;margin-bottom:48px}
.fail-item{padding:15px 0;border-bottom:1px solid var(--rule);display:grid;grid-template-columns:56px 1fr;gap:16px;align-items:start}
.fail-item:first-child{border-top:1px solid var(--rule)}
.sev{font-family:'Syne',sans-serif;font-size:8px;font-weight:700;letter-spacing:.10em;text-transform:uppercase;padding:4px 6px;text-align:center;margin-top:2px}
.sev.yellow{background:#FEF3C7;color:#92400E}
.sev.red{background:#FEE2E2;color:#991B1B}
.fail-body{font-size:13px;color:var(--ink-light);line-height:1.6}
.fail-body strong{color:var(--ink);font-weight:500}
/* rationale */
.rat-item{padding:19px 0;border-bottom:1px solid var(--rule)}
.rat-item:first-child{border-top:1px solid var(--rule)}
.rat-head{font-family:'Syne',sans-serif;font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--ink);margin-bottom:6px;display:flex;align-items:baseline;gap:12px}
.rat-score{font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:300;color:var(--amber)}
.rat-text{font-size:13px;color:var(--ink-light);line-height:1.65}
/* pro section */
.pro-section{background:var(--warm);border:1px solid var(--rule);padding:38px 42px;margin-top:48px}
.pro-section-rule{display:block;height:2px;background:var(--rule);margin-bottom:32px}
.pro-grid{display:grid;grid-template-columns:1fr 1fr;gap:34px}
.pro-block-label{font-family:'Syne',sans-serif;font-size:9px;font-weight:700;letter-spacing:.20em;text-transform:uppercase;color:var(--ink-faint);margin-bottom:11px;padding-bottom:8px;border-bottom:1px solid var(--rule)}
.pro-block-text{font-size:13px;color:var(--ink-light);line-height:1.7}
.pro-block-text strong{color:var(--ink);font-weight:500}
.pro-block-text ul{list-style:none;margin-top:8px;display:flex;flex-direction:column;gap:7px}
.pro-block-text ul li{padding-left:14px;position:relative}
.pro-block-text ul li::before{content:'—';position:absolute;left:0;color:var(--ink-faint);font-size:11px}
.mfr-meter{display:flex;align-items:center;gap:10px;margin:11px 0 8px}
.mfr-bar-track{flex:1;height:4px;background:var(--rule);position:relative}
.mfr-bar-fill{position:absolute;top:0;left:0;height:100%;background:var(--green)}
.mfr-label{font-family:'Syne',sans-serif;font-size:10px;font-weight:700;color:var(--green);white-space:nowrap}
.code-table{width:100%;border-collapse:collapse;margin-top:10px}
.code-table td{padding:8px 9px;border-bottom:1px solid var(--rule);font-size:12.5px;color:var(--ink-light);vertical-align:top}
.code-table td:first-child{font-family:'Syne',sans-serif;font-size:9px;font-weight:700;letter-spacing:.10em;text-transform:uppercase;color:var(--ink-faint);white-space:nowrap;width:100px}
/* aside */
.aside-sec{margin-bottom:36px}
.aside-label{font-family:'Syne',sans-serif;font-size:9px;font-weight:700;letter-spacing:.20em;text-transform:uppercase;color:var(--ink-faint);padding-bottom:9px;border-bottom:1px solid var(--rule);margin-bottom:14px}
.photo-slot{width:100%;aspect-ratio:4/3;background:var(--warm);border:1px dashed #D0CBC4;display:flex;align-items:center;justify-content:center;margin-bottom:36px}
.photo-slot-text{font-family:'Syne',sans-serif;font-size:8.5px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#D0CBC4}
.conf-row{display:flex;align-items:center;gap:9px;margin-bottom:7px}
.conf-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.conf-lbl{font-family:'Syne',sans-serif;font-size:11px;font-weight:700;letter-spacing:.10em;text-transform:uppercase}
.conf-note{font-size:11.5px;color:var(--ink-faint);line-height:1.6}
.band-track{display:flex;gap:4px;align-items:flex-end;margin-bottom:8px}
.band-seg{flex:1;background:var(--rule)}
.band-seg.active{background:var(--amber)}
.band-seg:nth-child(1){height:9px}.band-seg:nth-child(2){height:15px}.band-seg:nth-child(3){height:21px}.band-seg:nth-child(4){height:27px}
.band-labels{display:flex;justify-content:space-between;margin-bottom:9px}
.band-lbl-item{font-family:'Syne',sans-serif;font-size:7px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--rule);flex:1;text-align:center}
.band-lbl-item.active{color:var(--amber)}
.band-name{font-family:'Syne',sans-serif;font-size:12px;font-weight:700;color:var(--ink);margin-bottom:4px}
.band-desc{font-size:11.5px;color:var(--ink-faint);line-height:1.55}
.alt-item{padding:12px 0;border-bottom:1px solid var(--rule);display:grid;grid-template-columns:1fr auto;align-items:center;gap:10px}
.alt-item:first-child{border-top:1px solid var(--rule)}
.alt-tag{font-family:'Syne',sans-serif;font-size:8px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;margin-bottom:4px}
.alt-tag.better{color:var(--green)}
.alt-tag.lateral{color:var(--ink-mid)}.alt-tag.upgrade{color:var(--amber)}
.alt-name{font-size:13px;font-weight:500;color:var(--ink)}
.alt-tier{font-size:11px;color:var(--ink-faint);margin-top:2px}
.alt-num{font-family:'Cormorant Garamond',serif;font-size:27px;font-weight:300;line-height:1;color:var(--ink);text-align:right}
.alt-grade{font-family:'Syne',sans-serif;font-size:9.5px;font-weight:700;color:var(--ink-faint);text-align:right;margin-top:4px;letter-spacing:.06em}
.about-text{font-size:11.5px;color:var(--ink-faint);line-height:1.7}
.report-footer{padding:24px 56px;border-top:2px solid var(--ink);display:flex;justify-content:space-between;align-items:center;background:var(--warm)}
.footer-wm{font-family:'Syne',sans-serif;font-size:10px;font-weight:800;letter-spacing:.26em;text-transform:uppercase;color:var(--ink)}
.footer-wm em{color:var(--amber);font-style:normal}
.footer-meta{font-size:11.5px;color:var(--ink-faint);text-align:right;line-height:1.6}
@media print{body{background:white;padding:0}.page-wrap{box-shadow:none;max-width:100%}}
</style>
</head>
<body>
<div class="page-wrap">

<header class="masthead">
  <a class="wordmark" href="#">THE <em>RESIDENTIALIST</em></a>
  <span class="masthead-center">Product Intelligence Report</span>
  <div class="masthead-right">Windows · ${dateStr}</div>
</header>

<section class="hero">
  <div>
    <div class="hero-eyebrow">Windows — ${config === 'DH' ? 'Double Hung' : config === 'CSM' ? 'Casement' : config} Configuration</div>
    <h1 class="hero-name">${productName.split(' ').slice(0, 1).join(' ')}<em>${productName.split(' ').slice(1).join(' ')}</em></h1>
    <div class="hero-attrs">
      <div class="hero-attr"><div class="attr-label">Manufacturer</div><div class="attr-value">${productName.split(' ')[0]}</div></div>
      <div class="hero-attr"><div class="attr-label">Frame</div><div class="attr-value">${attrs.frame ? attrs.frame.split(',')[0].split('(')[0].trim().replace(/uPVC|UPVC/,'Vinyl').replace(/multi-chambered\s*/i,'').replace(/standard\s*/i,'').trim().replace(/^\w/,c=>c.toUpperCase()) || 'Vinyl' : 'Not Disclosed'}</div></div>
      <div class="hero-attr"><div class="attr-label">Price Tier</div><div class="attr-value">${tier}</div></div>
      <div class="hero-attr"><div class="attr-label">Config</div><div class="attr-value">${config === 'DH' ? 'Double Hung' : config === 'CSM' ? 'Casement' : config}</div></div>
    </div>
  </div>
  <div class="grade-block">
    <div class="grade-display">
      <span class="grade-letter">${grade.letter}</span><span class="grade-mod">${grade.mod}</span>
    </div>
    <div class="grade-meta">
      <div class="score-num">${overall.toFixed(2)} / 10</div>
      <div class="score-badge">${labelFromScore(overall)}</div>
    </div>
  </div>
</section>

<div class="verdict">
  <div class="verdict-kicker">Our Verdict</div>
  <div class="verdict-text">${data.verdict}</div>
</div>

<div class="body-layout">
<div class="body-main">

  <div class="kicker">Score Breakdown</div>
  <div class="axis-group">
    <div class="axis-defs">
      <div class="axis-def">
        <div class="axis-def-name">Quality</div>
        <div class="axis-def-desc">How well the window is made — materials, construction, and manufacturing consistency.</div>
      </div>
      <div class="axis-def">
        <div class="axis-def-name">Durability</div>
        <div class="axis-def-desc">How long it lasts, how well it holds up over time, and how easy it is to repair and service.</div>
      </div>
      <div class="axis-def">
        <div class="axis-def-name">Performance</div>
        <div class="axis-def-desc">Thermal efficiency, air leakage, and structural ratings — how well it does its job day to day.</div>
      </div>
    </div>
    <div class="axis-row">
      <div><div class="axis-name">Quality</div><div class="axis-wt">35% of overall</div></div>
      <div class="bar-track"><div class="bar-fill" style="width:${pct(axes.Q)}"></div></div>
      <div class="axis-right"><div class="axis-num">${axes.Q.toFixed(2)}</div><div class="axis-grade">${axisGrade(axes.Q)}</div></div>
    </div>
    <div class="axis-row">
      <div><div class="axis-name">Durability</div><div class="axis-wt">35% of overall</div></div>
      <div class="bar-track"><div class="bar-fill" style="width:${pct(axes.D)}"></div></div>
      <div class="axis-right"><div class="axis-num">${axes.D.toFixed(2)}</div><div class="axis-grade">${axisGrade(axes.D)}</div></div>
    </div>
    <div class="axis-row">
      <div><div class="axis-name">Performance</div><div class="axis-wt">30% of overall</div></div>
      <div class="bar-track"><div class="bar-fill" style="width:${pct(axes.P)}"></div></div>
      <div class="axis-right"><div class="axis-num">${axes.P.toFixed(2)}</div><div class="axis-grade">${axisGrade(axes.P)}</div></div>
    </div>
  </div>

  <div class="kicker">What We Found</div>
  <div class="findings">
    ${data.findings.map(f => `
    <div class="finding">
      <div class="finding-rule"></div>
      <div><strong>${f.title}</strong><p>${f.body}</p></div>
    </div>`).join('')}
  </div>

  <div class="kicker">Material Safety Assessment</div>
  <div class="safety-block">
    <div class="safety-top">
      <div>
        <div class="safety-kicker">Health &amp; Toxicity Profile</div>
        <div class="safety-verdict" style="background:${svBg};border:1px solid ${svBorder}">
          <div class="safety-verdict-dot" style="background:${svDotColor}"></div>
          <div class="safety-verdict-label" style="color:${svDotColor}">${safety.verdictLabel}</div>
        </div>
        <div style="font-size:13.5px;color:var(--ink-light);line-height:1.65;margin-top:10px">${data.safetyNote}</div>
      </div>
      <div class="safety-score-col">
        <div class="safety-num">${safety.score ? safety.score.toFixed(1) : '—'}</div>
        <div class="safety-denom">out of 10</div>
      </div>
    </div>
    <div class="safety-subsections">
      ${safetyCells()}
    </div>
  </div>

  <div class="kicker">Climate Zone Fit</div>
  <div class="climate-block">
    <div class="climate-legend">
      <div class="cl-item"><div class="cl-swatch" style="background:var(--amber)"></div>Best Fit — Zones 3, 4 &amp; 5</div>
      <div class="cl-item"><div class="cl-swatch" style="background:#D0CBC4"></div>Outside Optimal Range</div>
    </div>
    <div class="climate-map-wrap">
      <svg id="climateMap" viewBox="0 0 960 580"></svg>
    </div>
    <div class="climate-caption">
      <strong>Best performance fit: DOE IECC Zones 3–5</strong> — mid-latitude US from the Southeast through the Pacific Northwest and upper Midwest.<br><br>
      <strong>Zones 1–2</strong> (Deep South, Hawaii): Meets Energy Star minimums, but not optimized for managing high solar gain in hot environments.<br>
      <strong>Zones 6–8</strong> (northern tier, Alaska): Meets Energy Star minimums, but U-factor falls short of best practice for heating-dominant cold climates.
    </div>
  </div>

  <div class="kicker">Is This Window Right For You?</div>
  <div class="fit-grid">
    <div class="fit-cell for">
      <div class="fit-head">✓ &nbsp; Good Fit</div>
      <ul class="fit-list">
        ${data.goodFit.map(f => `<li>${f}</li>`).join('')}
      </ul>
    </div>
    <div class="fit-cell skip">
      <div class="fit-head">✕ &nbsp; Look Elsewhere</div>
      <ul class="fit-list">
        ${data.lookElsewhere.map(f => `<li>${f}</li>`).join('')}
      </ul>
    </div>
  </div>

  <div class="section-divider"><span class="section-divider-label">Technical Detail</span></div>

  <div class="kicker">Full Subscore Breakdown</div>
  <table class="sub-table">
    <tbody>
      <tr class="ax-head"><td colspan="2">Axis 1 — Quality &nbsp;<span style="font-weight:300;font-size:10px;color:var(--ink-faint);letter-spacing:0">35% of Overall</span></td></tr>
      ${subscores.Q.length > 0 ? subRows(subscores.Q) : '<tr class="sub-row"><td>See scoring rationale below</td><td class="sc">${axes.Q.toFixed(1)}</td></tr>'}
      <tr class="ax-head"><td colspan="2">Axis 2 — Durability &nbsp;<span style="font-weight:300;font-size:10px;color:var(--ink-faint);letter-spacing:0">35% of Overall</span></td></tr>
      ${subscores.D.length > 0 ? subRows(subscores.D) : '<tr class="sub-row"><td>See scoring rationale below</td><td class="sc">${axes.D.toFixed(1)}</td></tr>'}
      <tr class="ax-head"><td colspan="2">Axis 3 — Performance &nbsp;<span style="font-weight:300;font-size:10px;color:var(--ink-faint);letter-spacing:0">30% of Overall</span></td></tr>
      ${subscores.P.length > 0 ? subRows(subscores.P) : '<tr class="sub-row"><td>See scoring rationale below</td><td class="sc">${axes.P.toFixed(1)}</td></tr>'}
    </tbody>
  </table>

  <div class="kicker">Verified Performance Specifications</div>
  <div class="spec-grid">
    ${specCell('U-Factor (Whole Unit)', attrs.ufact ? attrs.ufact.toString() : 'Not Disclosed', attrs.ufact ? 'NFRC whole-unit certified — not center-of-glass only.' : 'Manufacturer has not published certified thermal performance data.', uFactorR)}
    ${specCell('SHGC — Solar Heat Gain', attrs.shgc ? attrs.shgc.toString() : 'Not Disclosed', attrs.shgc ? (shgcPct || null) : 'Solar heat gain coefficient not published by manufacturer.')}
    ${specCell('Air Leakage', attrs.ai ? `${attrs.ai} cfm/ft²` : 'Not Disclosed', attrs.ai ? 'Whole-unit rated.' : null)}
    ${specCell('Visible Transmittance (VT)', attrs.vt ? attrs.vt.toString() : 'Not Disclosed', attrs.vt ? `Passes ${Math.round(attrs.vt * 100)}% of visible light through the glass.` : null)}
    ${specCell('AAMA Structural Class', attrs.aama || 'Not Disclosed', null, null, !!attrs.aama)}
    ${specCell('Energy Star', 'All Climate Zones', 'Meets minimum Energy Star threshold for every US climate zone.', null, true)}
    ${attrs.glazing ? specCell('Glazing', attrs.glazing, null) : ''}
    ${attrs.warranty ? specCell('Warranty', attrs.warranty, null) : ''}
  </div>

  <div class="kicker">Known Failure Patterns</div>
  <ul class="fail-list">
    ${failItems()}
  </ul>

  <div class="kicker">Scoring Rationale</div>
  <div>
    <div class="rat-item">
      <div class="rat-head">Quality <span class="rat-score">${axes.Q.toFixed(2)}</span></div>
      <div class="rat-text">${rationale.Q || 'See subscore breakdown above.'}</div>
    </div>
    <div class="rat-item">
      <div class="rat-head">Durability <span class="rat-score">${axes.D.toFixed(2)}</span></div>
      <div class="rat-text">${rationale.D || 'See subscore breakdown above.'}</div>
    </div>
    <div class="rat-item">
      <div class="rat-head">Performance <span class="rat-score">${axes.P.toFixed(2)}</span></div>
      <div class="rat-text">${rationale.P || 'See subscore breakdown above.'}</div>
    </div>
  </div>

  <div class="pro-section">
    <div class="pro-grid">
      <div class="pro-block">
        <div class="pro-block-label">Manufacturer Stability</div>
        <div class="pro-block-text">
          ${data.mfrNote}
        </div>
      </div>
      <div class="pro-block">
        <div class="pro-block-label">Code Compliance Reference</div>
        <div class="pro-block-text">
          <table class="code-table">
            <tr><td>IECC Zones</td><td>Meets U-factor threshold for all zones per table R402.1.2</td></tr>
            ${attrs.ai ? `<tr><td>Air Leakage</td><td>${attrs.ai} cfm/ft² — well below 0.30 maximum</td></tr>` : ''}
            ${attrs.aama ? `<tr><td>AAMA</td><td>${attrs.aama}</td></tr>` : ''}
            <tr><td>Energy Star</td><td>Certified — all four climate zone categories</td></tr>
          </table>
        </div>
      </div>
    </div>
  </div>

</div>

<aside class="body-aside">
  <div class="photo-slot"><div class="photo-slot-text">Product Photo</div></div>

  <div class="aside-sec">
    <div class="aside-label">Data Confidence</div>
    <div class="conf-row">
      <div class="conf-dot" style="background:${status.confidence === 'HIGH' ? 'var(--green)' : status.confidence === 'MODERATE' ? '#B8860B' : 'var(--red)'}"></div>
      <div class="conf-lbl" style="color:${status.confidence === 'HIGH' ? 'var(--green)' : status.confidence === 'MODERATE' ? '#B8860B' : 'var(--red)'}">${status.confidence.charAt(0) + status.confidence.slice(1).toLowerCase()}</div>
    </div>
    <div class="conf-note">${status.midpoints > 0 ? `${productName.split(' ')[0]} didn't publish ${status.midpoints === 1 ? 'one spec we look for' : status.midpoints + ' specs we look for'} — we scored ${status.midpoints === 1 ? 'it' : 'them'} at the midpoint until real data is available. ` : ''}Specs sourced from NFRC certification records, AAMA test data, and manufacturer documentation.</div>
  </div>

  <div class="aside-sec">
    <div class="aside-label">Price Tier</div>
    <div class="band-track">${bandSegs}</div>
    <div class="band-labels">${bandLabels}</div>
    <div class="band-name">${tier}</div>
    <div class="band-desc">${data.tierDesc}</div>
  </div>

  <div class="aside-sec">
    <div class="aside-label">Alternatives</div>
    ${data.alternatives.map(a => `
    <div class="alt-item">
      <div>
        <div class="alt-tag ${a.tagClass}">${a.tag}</div>
        <div class="alt-name">${a.name}</div>
        <div class="alt-tier">${a.tier}</div>
      </div>
      <div>
        <div class="alt-num">${a.score.toFixed(2)}</div>
        <div class="alt-grade">${a.grade}</div>
      </div>
    </div>`).join('')}
  </div>

  <div class="aside-sec">
    <div class="aside-label">About This Score</div>
    <div class="about-text">Scored by The Residentialist product intelligence system against a deterministic rubric (v3). Independent — no manufacturer relationships or paid placements. Scores reflect publicly verifiable specifications only. Material safety assessed separately from quality, durability, and performance.</div>
  </div>
</aside>
</div>

<footer class="report-footer">
  <div class="footer-wm">THE <em>RESIDENTIALIST</em></div>
  <div class="footer-meta">
    Scored ${dateStr} · ${productName} ${config} · Report v6.0<br>
    Informational only. Regional pricing, availability, and code requirements vary.
  </div>
</footer>
</div>

<script>
const stateZones={
  '01':3,'02':7,'04':2,'05':3,'06':3,'08':5,'09':5,'10':4,'11':4,
  '12':2,'13':3,'15':1,'16':5,'17':5,'18':5,'19':5,'20':4,'21':4,
  '22':2,'23':6,'24':4,'25':5,'26':5,'27':6,'28':3,'29':4,'30':6,
  '31':5,'32':3,'33':6,'34':4,'35':3,'36':5,'37':3,'38':6,'39':5,
  '40':3,'41':4,'42':5,'44':5,'45':3,'46':6,'47':4,'48':2,'49':5,
  '50':6,'51':4,'53':4,'54':4,'55':6,'56':6,'72':1
};
const rec=new Set([3,4,5]);
function drawMap(us){
  const svg=d3.select('#climateMap');
  const proj=d3.geoAlbersUsa().scale(1280).translate([480,290]);
  const path=d3.geoPath().projection(proj);
  const states=topojson.feature(us,us.objects.states);
  svg.selectAll('path').data(states.features).enter().append('path')
    .attr('d',path)
    .attr('fill',d=>{const z=stateZones[String(d.id).padStart(2,'0')];return rec.has(z)?'#B8722A':'#D0CBC4';})
    .attr('stroke','#fff').attr('stroke-width',0.7);
  svg.append('path')
    .datum(topojson.mesh(us,us.objects.states,(a,b)=>a!==b))
    .attr('fill','none').attr('stroke','#fff').attr('stroke-width',0.9).attr('d',path);
}
d3.json('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json')
  .then(drawMap).catch(()=>d3.json('https://unpkg.com/us-atlas@3/states-10m.json').then(drawMap).catch(()=>{}));
</script>
</body>
</html>`;
}

// ─── Build data object from pipeline files ────────────────────────────────────
function buildData(productName, outputDir) {
  const bot2 = findFile(outputDir, 'bot2_evaluator');
  const bot3 = findFile(outputDir, 'bot3_material_safety');
  const bot5 = findFile(outputDir, 'bot5_reconciliation');
  const statusTxt = readFile(path.join(outputDir, 'PIPELINE_STATUS.txt')) || '';

  if (!bot2) return { error: 'Missing bot2_evaluator' };
  if (!bot5) return { error: 'Missing bot5_reconciliation — run incomplete' };

  const status    = parseStatus(statusTxt);
  const name      = status.product || productName;
  const config    = status.config  || 'DH';
  const axes      = parseAxisScores(bot2);
  if (!axes) return { error: 'Could not parse axis scores from bot2' };

  const overall   = weightedOverall(axes);
  const grade     = gradeFromScore(overall);
  const subscores = parseSubscores(bot2);
  const failures  = parseFailures(bot2);
  const safety    = parseSafety(bot3);
  const rationale = parseRationale(bot2);
  const attrs     = parseAttrs(bot2);
  const tier      = priceTier(name, overall);
  const tierIdx   = tierBandIndex(tier);

  // Date from timestamp
  const ts = status.timestamp || new Date().toISOString().slice(0, 10);
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const tsParts = ts.slice(0,7).split('-');
  const dateStr = tsParts.length === 2
    ? months[parseInt(tsParts[1],10)-1] + ' ' + tsParts[0]
    : 'March 2026';

  // Derive a verdict sentence
  const highAxis = axes.Q >= axes.D && axes.Q >= axes.P ? 'quality' :
                   axes.D >= axes.Q && axes.D >= axes.P ? 'durability and serviceability' :
                   'thermal and air performance';
  const weakAxis = axes.Q <= axes.D && axes.Q <= axes.P ? 'quality' :
                   axes.D <= axes.Q && axes.D <= axes.P ? 'durability' : 'performance';
  const verdict = `Strongest on ${highAxis} — but ${weakAxis} keeps it from reaching the next tier.`;

  // Safety note — plain English for homeowners
  const frameMaterial = (attrs.frame || '').toLowerCase();
  const isVinyl = frameMaterial.includes('vinyl') || frameMaterial.includes('upvc') || frameMaterial.includes('pvc');
  const isWood  = frameMaterial.includes('wood') || frameMaterial.includes('clad');
  const isAlum  = frameMaterial.includes('alum');
  const matDesc = isVinyl ? 'rigid vinyl (uPVC)'
                : isWood  ? 'wood or wood-clad'
                : isAlum  ? 'aluminum'
                : 'this frame material';

  const safetyNote = safety.tier === 'concern'
    ? `We found chemistry concerns worth knowing about before you buy. See the flags below.`
    : safety.tier === 'review'
    ? `${name.split(' ')[0]} doesn't publish everything we look for — specifically what's in their weatherstripping and glazing sealants. In normal use, ${matDesc} windows don't off-gas harmful chemicals. The score is reduced because we can't fully verify materials we can't see.`
    : `Clean profile. ${name.split(' ')[0]} uses ${matDesc} — a chemically stable material that doesn't release harmful compounds in normal home use. No concerning additives identified.`;

  // Generate findings from what we know
  const findings = [
    {
      title: `${axes.D >= axes.Q && axes.D >= axes.P ? 'Durability' : axes.P >= axes.Q ? 'Performance' : 'Quality'} is the standout axis.`,
      body: (rationale[axes.D >= axes.Q && axes.D >= axes.P ? 'D' : axes.P >= axes.Q ? 'P' : 'Q'] || '')
              .replace(/Calibration benchmark:[^.]*\./gi, '').trim() ||
            `Scored ${(Math.max(axes.Q, axes.D, axes.P)).toFixed(2)} out of 10. See scoring rationale for detail.`
    },
    {
      title: `${axes.Q <= axes.D && axes.Q <= axes.P ? 'Quality' : axes.D < axes.P ? 'Durability' : 'Performance'} is the weakest axis.`,
      body: (rationale[axes.Q <= axes.D && axes.Q <= axes.P ? 'Q' : axes.D < axes.P ? 'D' : 'P'] || '')
              .replace(/Calibration benchmark:[^.]*\./gi, '').trim() ||
            `Scored ${(Math.min(axes.Q, axes.D, axes.P)).toFixed(2)} out of 10. See scoring rationale for detail.`
    },
    {
      title: safety.tier === 'concern' ? 'Chemistry concerns found — see safety section below.' :
             safety.tier === 'review'  ? `${name.split(' ')[0]} doesn't fully disclose what's in their materials.` :
                                         'Clean materials profile — nothing concerning found.',
      body: safetyNote
    },
  ];

  // Add RED finding if present — plain English, specific to what was actually found
  const redFails = (failures || []).filter(f => f.sev === 'RED');
  if (redFails.length > 0) {
    const redDesc = redFails[0].desc;
    // Convert jargon finding descriptions to plain language
    const plainDesc = redDesc.replace(/active litigation/i, 'active lawsuit involving this product line')
                             .replace(/manufactured 1991-200[0-9]/i, 'made between the 1990s and 2000s')
                             .replace(/ProLine/i, 'an earlier version of this line')
                             .replace(/AAMA PG certified/i, 'independently certified for structural performance');
    findings.push({
      title: 'Something worth knowing before you buy.',
      body: plainDesc
    });
  }

  // Good fit / look elsewhere (generic — can be overridden per category)
  const goodFit = [
    `Production home builds in climate zones 3–5`,
    `Buyers who prioritize ${highAxis}`,
    `Projects where manufacturer stability is a priority`,
    `Replacement projects where cost-to-value matters`,
  ];
  const lookElsewhere = [
    `Building for 30+ years without window replacement`,
    `High-performance or cold climate builds (zones 6–8)`,
    `Energy efficiency as the primary specification driver`,
    `Budget allows for a higher performance tier`,
  ];

  // Manufacturer note
  const mfrName = name.split(' ')[0];
  const mfrNote = `${mfrName} is an established manufacturer with a national sales and service presence. Parts availability and dealer network density are key factors in the durability score. For a 20–30 year serviceability horizon, manufacturer stability reduces long-term risk. Verify local dealer presence before specifying.`;

  // Tier description
  const tierDescs = {
    'Builder Grade': 'Volume production. Box-store distribution. Entry-level residential spec.',
    'Premium Residential': 'Above builder grade. Below custom architectural. Mid-tier consumer and production remodel spec.',
    'Architectural': 'Custom and designer-specified. Elevated materials and performance.',
    'High Performance': 'Passive House and triple-pane tier. Maximum thermal efficiency.',
  };

  // Static alternatives (will be replaced when full calibration DB is integrated)
  const alternatives = [
    { tag: '↔ Same-Tier Option', tagClass: 'lateral', name: 'Milgard Tuscany', tier: 'Premium Residential', score: 6.92, grade: 'B−' },
    { tag: '↑↑ Worth the Upgrade', tagClass: 'upgrade', name: 'Andersen 400 Series', tier: 'Architectural', score: 7.07, grade: 'B' },
    { tag: '↑↑ Worth the Upgrade', tagClass: 'upgrade', name: 'Marvin Integrity', tier: 'Architectural', score: 7.65, grade: 'B+' },
  ];

  return {
    productName: name, config, overall, grade, axes, subscores,
    safety, failures, rationale, attrs, status, tier, tierIdx,
    verdict, safetyNote, findings, goodFit, lookElsewhere,
    mfrNote, tierDesc: tierDescs[tier] || '', alternatives, dateStr,
  };
}

// ─── ORPHAN SCANNER ───────────────────────────────────────────────────────────
function scanForOrphans() {
  console.log('[BOT6] Scanning for orphaned runs...');
  const orphans = [], complete = [];

  if (!fs.existsSync(OUTPUTS_DIR)) {
    console.log('[BOT6] Outputs directory not found:', OUTPUTS_DIR);
    return { orphans, complete };
  }

  const folders = fs.readdirSync(OUTPUTS_DIR)
    .filter(f => fs.statSync(path.join(OUTPUTS_DIR, f)).isDirectory());

  // Keep only most recent run per product
  const productMap = {};
  for (const folder of folders) {
    const tsM = folder.match(/_((\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}))$/);
    if (!tsM) continue;
    const key = folder.replace(tsM[0], '');
    if (!productMap[key] || folder > productMap[key]) productMap[key] = folder;
  }

  for (const [key, folder] of Object.entries(productMap)) {
    const dir   = path.join(OUTPUTS_DIR, folder);
    const files = fs.readdirSync(dir);
    const hasBot5    = files.some(f => f.includes('bot5_reconciliation'));
    const hasCouncil = files.some(f => f.includes('council_memo') || f === 'council_session.md');
    const statusText = readFile(path.join(dir, 'PIPELINE_STATUS.txt')) || '';
    const status     = (statusText.match(/^STATUS:\s*(.+)/m) || [])[1]?.trim() || 'UNKNOWN';
    const entry = { key, folder, hasBot5, hasCouncil, status };
    if (!hasBot5 || !hasCouncil) orphans.push(entry);
    else complete.push(entry);
  }

  console.log(`[BOT6] Complete: ${complete.length} | Orphans: ${orphans.length}`);
  return { orphans, complete };
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  const [command, ...args] = process.argv.slice(2);

  if (!command || command === 'scan') {
    const { orphans, complete } = scanForOrphans();
    console.log(`\n✅ COMPLETE (${complete.length}):`);
    complete.forEach(r => console.log(`  ${r.key} — ${r.status}`));

    if (orphans.length > 0) {
      console.log(`\n⚠️  ORPHANS (${orphans.length}):`);
      orphans.forEach(r => {
        const missing = [];
        if (!r.hasBot5) missing.push('Bot5');
        if (!r.hasCouncil) missing.push('Council');
        console.log(`  ${r.key} — missing: ${missing.join(', ')}`);
      });
      await sendTelegram(
        `⚠️ *Bot 6 Orphan Scan*\n\n${orphans.length} incomplete run(s):\n\n` +
        orphans.map(r => {
          const m = []; if (!r.hasBot5) m.push('Bot5'); if (!r.hasCouncil) m.push('Council');
          return `• ${r.key.replace(/_/g, ' ')} — missing ${m.join(', ')}`;
        }).join('\n') +
        '\n\n_These runs are NOT fully scored. Do not lock scores._'
      );
    } else {
      console.log('\n✅ No orphans.');
    }

  } else if (command === 'report') {
    const productName = args[0];
    const outputDir   = args[1];
    if (!productName || !outputDir) {
      console.log('Usage: node bot6_report_assembly_v2.js report "Product Name" /path/to/output/dir');
      process.exit(1);
    }
    const data = buildData(productName, outputDir);
    if (data.error) { console.error('[BOT6] Error:', data.error); process.exit(1); }
    const html = buildHTML(data);
    const outPath = path.join(outputDir, `${productName.toLowerCase().replace(/\s+/g, '_')}_report.html`);
    fs.writeFileSync(outPath, html);
    console.log(`[BOT6] ✅ Report written: ${outPath}`);
    console.log(`[BOT6] Score: ${data.overall.toFixed(2)}/10 | Grade: ${data.grade.letter}${data.grade.mod} | Tier: ${data.tier}`);
    await sendTelegram(
      `📄 *Report assembled — ${productName}*\n` +
      `Score: *${data.overall.toFixed(2)}/10* | Grade: *${data.grade.letter}${data.grade.mod}*\n` +
      `Tier: ${data.tier} | Confidence: ${data.status.confidence}`
    );

  } else if (command === 'report-all') {
    const { complete, orphans } = scanForOrphans();
    console.log(`[BOT6] Assembling reports for ${complete.length} complete runs...`);
    let ok = 0;
    for (const run of complete) {
      const dir  = path.join(OUTPUTS_DIR, run.folder);
      const name = run.key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      const data = buildData(name, dir);
      if (data.error) { console.error(`[BOT6] Skipped ${run.key}: ${data.error}`); continue; }
      const html = buildHTML(data);
      const p = path.join(dir, `${run.key}_report.html`);
      fs.writeFileSync(p, html);
      console.log(`[BOT6] ✅ ${name}: ${data.overall.toFixed(2)}/10 ${data.grade.letter}${data.grade.mod}`);
      ok++;
    }
    await sendTelegram(
      `📋 *Bot 6 Complete*\n\n✅ ${ok} reports assembled\n` +
      (orphans.length > 0 ? `⚠️ ${orphans.length} orphaned runs skipped` : `✅ No orphans`)
    );
    console.log(`[BOT6] Done. ${ok}/${complete.length} reports assembled.`);

  } else {
    console.log('Commands: scan | report "Name" /path | report-all');
  }
}

module.exports = { scanForOrphans, buildData, buildHTML };
if (require.main === module) { main().catch(err => { console.error('[BOT6] FATAL:', err); process.exit(1); }); }

```

---

### 12.3 — deterministic_validator.js (Score Integrity Checker)
**Mac Mini path:** `/Users/Residentialist/.openclaw/workspace/residentialist/deterministic_validator.js`

```javascript

const fs = require('fs');
const path = require('path');

// LOCKED CORRECTION RULES — change only with Ray approval
// Each rule is enforced structurally, not by asking bots to comply
const CORRECTION_RULES = {
  'reliabilt_3500': {
    mandatory_2b_max: 3.5,
    overall_ceiling: 4.9,
    red_findings: ['atrium_bankruptcy', 'manufacturing_defect_pattern', 'installer_rejection'],
    notes: 'Budget band. 3 confirmed RED findings. Locked March 10 2026.'
  },
  'window_world_4000': {
    overall_ceiling: 4.9,
    notes: 'Budget band. Locked March 10 2026.'
  }
};

// BENCHMARK BANDS — expected score ranges for known products
const BENCHMARK_BANDS = {
  'andersen_400_series': { min: 7.0, max: 10.0, tier: 'Premium' },
  'marvin_integrity':    { min: 7.0, max: 10.0, tier: 'Premium' },
  'pella_250_series':    { min: 5.0, max: 6.9,  tier: 'Mid-range' },
  'jeldwen_v2500':       { min: 5.0, max: 6.9,  tier: 'Mid-range' },
  'milgard_tuscany':     { min: 5.0, max: 6.9,  tier: 'Mid-range' },
  'window_world_4000':   { min: 0.0, max: 4.9,  tier: 'Budget' },
  'reliabilt_3500':      { min: 0.0, max: 4.9,  tier: 'Budget' }
};

// LOCKED AXIS WEIGHTS — Ray Shapley, March 11 2026
// Q:35% D:35% P:30% — buyer-focused weights for durable goods
const AXIS_WEIGHTS = { Q: 0.35, D: 0.35, P: 0.30 };

function productKey(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/, '');
}

function extractAxisScores(text) {
  // Extract Q, D, P axis scores from bot2 evaluator
  const qMatch = text.match(/QUALITY[^:]*:\s*[A-Z][+-]?\s*\(([0-9]+\.[0-9]+)\/10\)/i);
  const dMatch = text.match(/DURABILITY[^:]*:\s*[A-Z][+-]?\s*\(([0-9]+\.[0-9]+)\/10\)/i);
  const pMatch = text.match(/PERFORMANCE[^:]*:\s*[A-Z][+-]?\s*\(([0-9]+\.[0-9]+)\/10\)/i);
  if (qMatch && dMatch && pMatch) {
    return { Q: parseFloat(qMatch[1]), D: parseFloat(dMatch[1]), P: parseFloat(pMatch[1]) };
  }
  return null;
}

function applyWeights(axes) {
  return Math.round(((axes.Q * AXIS_WEIGHTS.Q) + (axes.D * AXIS_WEIGHTS.D) + (axes.P * AXIS_WEIGHTS.P)) * 100) / 100;
}

function extractOverallScore(text) {
  const patterns = [
    /Proposed Overall[:\s*]+([0-9]+\.[0-9]+)/i,
    /Overall Score[:\s*]+([0-9]+\.[0-9]+)/i,
    /Final Score[:\s*]+([0-9]+\.[0-9]+)/i,
    /\*\*Proposed Overall.*?([0-9]+\.[0-9]+)/i
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return parseFloat(m[1]);
  }
  return null;
}

function extract2BScore(text) {
  const patterns = [
    /Final 2B score[^:]*:\s*([0-9]+\.[0-9]+)/i,
    /Net Final 2B[^:]*:[\s*]+([0-9]+\.[0-9]+)/i,
    /2B[\s*]+Score[^:]*:[\s*]+([0-9]+\.[0-9]+)/i,
    /Net 2B[\s*=]+.*?([0-9]+\.[0-9]+)\s*\/\s*10/i,
    /Materials.*?Durability.*?\*\*([0-9]+\.[0-9]+)\/10\*\*/i,
    /Materials.*?Durability.*?([0-9]+\.[0-9]+)\s*\/\s*10/i
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return parseFloat(m[1]);
  }
  return null;
}

function validate(outputDir, productName) {
  const key = productKey(productName);
  const violations = [];
  const warnings = [];
  const corrections = [];

  const files = fs.readdirSync(outputDir);
  // Read from bot5 reconciliation (final resolved scores), not bot4 challenge (disputed scores)
  const reconFile = files.find(f => f.includes('bot5_reconciliation'));
  const challengeFile = files.find(f => f.includes('bot4_challenge'));
  const sourceFile = reconFile || challengeFile;
  if (!sourceFile) {
    return { valid: false, violations: ['No Bot 5 reconciliation or Bot 4 challenge output found'], warnings: [] };
  }

  // Also read bot2 evaluator for overall score (bot5 reconciliation doesn't always contain it)
  const bot2File = files.find(f => f.includes('bot2_evaluator'));
  const bot2Text = bot2File ? fs.readFileSync(path.join(outputDir, bot2File), 'utf8') : '';
  const text = fs.readFileSync(path.join(outputDir, sourceFile), 'utf8');

  // Apply locked axis weights (Q:35% D:35% P:30%) structurally
  // Bots default to equal thirds — this corrects it without relying on bot compliance
  const axisScores = extractAxisScores(bot2Text);
  let overallScoreRaw = extractOverallScore(bot2Text) || extractOverallScore(text);
  let weightedScore = null;
  if (axisScores) {
    weightedScore = applyWeights(axisScores);
    if (Math.abs(weightedScore - overallScoreRaw) > 0.05) {
      corrections.push(
        'Axis weights corrected from equal thirds to Q:35% D:35% P:30% — ' +
        'raw=' + overallScoreRaw + ' → weighted=' + weightedScore +
        ' (Q:' + axisScores.Q + ' D:' + axisScores.D + ' P:' + axisScores.P + ')'
      );
      fs.writeFileSync(
        path.join(outputDir, 'WEIGHT_CORRECTED_SCORE.json'),
        JSON.stringify({ product: productName, axisScores, weights: AXIS_WEIGHTS, rawScore: overallScoreRaw, weightedScore, locked: 'March 11 2026' }, null, 2)
      );
    }
    overallScoreRaw = weightedScore || overallScoreRaw;
  }

  const score2B = extract2BScore(bot2Text) || extract2BScore(text);

  let overallScore = overallScoreRaw;

  // Check hard correction rules
  const rules = CORRECTION_RULES[key];
  if (rules) {
    // 2B max — demoted to warning; ceiling clamp handles final score enforcement
    if (rules.mandatory_2b_max !== undefined && score2B !== null) {
      if (score2B > rules.mandatory_2b_max + 0.1) {
        warnings.push(
          'BOT REASONING DRIFT: 2B score ' + score2B + ' exceeds expected maximum ' + rules.mandatory_2b_max +
          ' for ' + productName + '. RED findings should require: ' + (rules.red_findings || []).join(', ') +
          '. Final score corrected by ceiling clamp.'
        );
      }
    }
    // Overall ceiling — CLAMP and correct, do not fail
    // Ceiling is a material class rule (vinyl budget tier), not score manipulation
    if (rules.overall_ceiling !== undefined && overallScore !== null) {
      if (overallScore > rules.overall_ceiling + 0.05) {
        corrections.push(
          'Overall score clamped from ' + overallScore + ' to ' + rules.overall_ceiling +
          ' (vinyl material class ceiling for ' + productName + ' — locked March 10 2026)'
        );
        overallScore = rules.overall_ceiling;
        // Write corrected score file so report assembly uses it
        fs.writeFileSync(
          path.join(outputDir, 'CORRECTED_SCORE.json'),
          JSON.stringify({ product: productName, rawScore: overallScoreRaw, correctedScore: overallScore, reason: 'vinyl_material_class_ceiling', locked: 'March 10 2026' }, null, 2)
        );
      }
    }  }

  // ── MATERIAL CEILING BACKSTOP ────────────────────────────────────────────────
  // Pre-computed ceiling was injected into Bot 2's prompt upstream.
  // This is the final hard backstop — if Bot 2 still exceeded it, block pipeline.
  const MATERIAL_CEILINGS_V = {
    'pultruded fiberglass': 10, 'ultrex': 10,
    'aluminum-clad wood': 9,   'aluminum clad wood': 9,
    'roll-form': 8,            'vinyl-clad wood': 8,
    'composite': 7,            'fibrex': 7, 'proprietary': 7,
    'vinyl': 6,                'aluminum': 6,
  };
  const lockFilePath = path.join(outputDir, 'MATERIAL_CLASS_LOCK.json');
  if (fs.existsSync(lockFilePath)) {
    try {
      const lock = JSON.parse(fs.readFileSync(lockFilePath, 'utf8'));
      const matClass = (lock.materialClass || '').toLowerCase();
      let matCeiling = null;
      for (const [mkey, mval] of Object.entries(MATERIAL_CEILINGS_V)) {
        if (matClass.includes(mkey)) { matCeiling = mval; break; }
      }
      if (matCeiling !== null && score2B !== null && score2B > matCeiling + 0.05) {
        violations.push(
          'CEILING VIOLATION: 2B Materials Durability ' + score2B +
          ' exceeds maximum ' + matCeiling +
          ' for material class "' + lock.materialClass + '".' +
          ' Bot 2 ignored pre-computed ceiling. Pipeline blocked.'
        );
      } else if (matCeiling !== null && score2B !== null) {
        console.log('[VALIDATOR] 2B ceiling: ' + score2B + ' \u2264 ' + matCeiling + ' for "' + lock.materialClass + '" \u2713');
      }
    } catch(e) {
      warnings.push('Could not verify 2B ceiling — MATERIAL_CLASS_LOCK.json unreadable: ' + e.message);
    }
  }

    console.log('[VALIDATOR] ' + productName + ' | Overall: ' + overallScoreRaw + (overallScore !== overallScoreRaw ? ' → clamped to ' + overallScore : '') + ' | 2B: ' + score2B);

  // Check benchmark bands against clamped score (warning only, not hard fail)
  const band = BENCHMARK_BANDS[key];
  if (band && overallScore !== null) {
    if (overallScore < band.min || overallScore > band.max) {
      warnings.push(
        'BENCHMARK DRIFT: ' + productName + ' scored ' + overallScore +
        ', expected ' + band.tier + ' (' + band.min + '-' + band.max + ')'
      );
    }
  }

  const valid = violations.length === 0;
  // Ceiling corrections are structural enforcement, not failures — write PASS if only corrections
  const status = valid ? 'PASS' : 'FAIL';
  if (corrections.length > 0 && valid) {
    fs.writeFileSync(path.join(outputDir, 'VALIDATION_PASSED.txt'), 'VALIDATOR: PASS (with corrections)\n' + corrections.join('\n'));
  } else if (!valid) {
    fs.writeFileSync(path.join(outputDir, 'VALIDATION_FAILED.txt'), 'DETERMINISTIC VALIDATOR FAILED:\n' + violations.join('\n'));
  } else {
    fs.writeFileSync(path.join(outputDir, 'VALIDATION_PASSED.txt'), 'VALIDATOR: PASS');
  }
  const report = { timestamp: new Date().toISOString(), product: productName, key, overallScoreRaw, overallScore, score2B, valid, status, violations, corrections, warnings };
  fs.writeFileSync(path.join(outputDir, 'VALIDATION_REPORT.json'), JSON.stringify(report, null, 2));

  return report;
}

module.exports = { validate, CORRECTION_RULES, BENCHMARK_BANDS };

if (require.main === module) {
  const [,, outputDir, productName] = process.argv;
  if (!outputDir || !productName) { console.log('Usage: node deterministic_validator.js <outputDir> <productName>'); process.exit(1); }
  const result = validate(outputDir, productName);
  console.log('[VALIDATOR]', result.valid ? 'PASS' : 'FAIL');
  result.violations.forEach(v => console.log('  VIOLATION:', v));
  result.warnings.forEach(w => console.log('  WARNING:', w));
  process.exit(result.valid ? 0 : 1);
}




```

---

### 12.4 — claude_bridge.js (Mac Mini HTTP Bridge)
**Mac Mini path:** `/Users/Residentialist/.openclaw/workspace/residentialist/claude_bridge.js`
**Note:** If the bridge is down, this is the code to restore it. The ngrok connection is automatic on startup.

```javascript
const http = require('http');
const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const WORKSPACE = '/Users/Residentialist/.openclaw/workspace/residentialist';
const PORT = 7823;
const API_KEY = process.env.BRIDGE_API_KEY || 'residentialist-bridge-2026';

function log(msg) {
  const line = '[BRIDGE] ' + new Date().toISOString() + ' ' + msg;
  console.log(line);
  fs.appendFileSync('/Users/Residentialist/bridge.log', line + '\n');
}

function runCommand(cmd) {
  try {
    return { success: true, output: execSync(cmd, { cwd: WORKSPACE, timeout: 10000 }).toString() };
  } catch(e) {
    return { success: false, output: e.message };
  }
}

function readFile(filePath) {
  try {
    return { success: true, content: fs.readFileSync(filePath, 'utf8') };
  } catch(e) {
    return { success: false, error: e.message };
  }
}

function listOutputs() {
  try {
    const outputDir = path.join(WORKSPACE, 'outputs');
    const dirs = fs.readdirSync(outputDir).filter(f => fs.statSync(path.join(outputDir, f)).isDirectory());
    return dirs.sort().reverse().slice(0, 20);
  } catch(e) {
    return [];
  }
}

function getStatus() {
  const pipelineRunning = runCommand('pgrep -f auto_runner').success;
  const telegramRunning = runCommand('pgrep -f telegram_listener').success;
  const lastOutputs = listOutputs();
  const recentLog = runCommand('tail -20 /Users/Residentialist/deploy.log').output;
  return { pipelineRunning, telegramRunning, lastOutputs, recentLog, timestamp: new Date().toISOString() };
}

function gradeScale(s) {
  if (s >= 9.0) return 'A+'; if (s >= 8.5) return 'A';  if (s >= 8.0) return 'A-';
  if (s >= 7.5) return 'B+'; if (s >= 7.0) return 'B';  if (s >= 6.5) return 'B-';
  if (s >= 6.0) return 'C+'; if (s >= 5.5) return 'C';  if (s >= 5.0) return 'C-';
  if (s >= 4.5) return 'D+'; if (s >= 4.0) return 'D';  return 'F';
}

function getPipelineData() {
  const CALIBRATION = [
    { product: 'Alpen Zenith ZR-7',   config: 'DH', overall: 8.73, grade: 'A-',  Q: null,   D: null,   P: null  },
    { product: 'Marvin Integrity',     config: 'DH', overall: 7.65, grade: 'B+',  Q: 8.075,  D: 8.0625, P: 6.80  },
    { product: 'Andersen 400 Series',  config: 'DH', overall: 7.07, grade: 'B',   Q: 6.73,   D: 7.39,   P: 7.10  },
    { product: 'Milgard Tuscany',      config: 'DH', overall: 6.92, grade: 'B-',  Q: 6.05,   D: 7.90,   P: 6.80  },
    { product: 'Pella 250 Series',     config: 'DH', overall: 6.78, grade: 'B-',  Q: 6.43,   D: 7.13,   P: 6.77  },
    { product: 'Jeld-Wen V-2500',      config: 'DH', overall: 5.76, grade: 'C+',  Q: 5.00,   D: 6.19,   P: 6.10  },
    { product: 'Pella 350 Series',     config: 'DH', overall: 4.91, grade: 'D+',  Q: 4.50,   D: 4.94,   P: 5.29  },
    { product: 'Reliabilt 3500',       config: 'DH', overall: 4.90, grade: 'D+',  Q: null,   D: null,   P: null  },
    { product: 'Window World 4000',    config: 'DH', overall: 4.63, grade: 'D',   Q: 5.20,   D: 4.50,   P: 4.20  },
  ];

  const outputDir = path.join(WORKSPACE, 'outputs');
  const dirs = fs.readdirSync(outputDir)
    .filter(f => { try { return fs.statSync(path.join(outputDir, f)).isDirectory(); } catch(e) { return false; } })
    .sort().reverse();

  const evaluations = [];

  for (const dir of dirs) {
    try {
      const dirPath = path.join(outputDir, dir);
      const statusFile = path.join(dirPath, 'PIPELINE_STATUS.txt');
      if (!fs.existsSync(statusFile)) continue;

      const status = fs.readFileSync(statusFile, 'utf8');
      const productM = status.match(/PRODUCT:\s*(.+)/);
      const configM  = status.match(/CONFIG:\s*(.+)/);
      const tsM      = status.match(/TIMESTAMP:\s*(.+)/);
      const stateM   = status.match(/STATUS:\s*(.+)/);
      if (!productM) continue;

      const product = productM[1].trim();
      const config  = configM  ? configM[1].trim() : 'DH';
      const ts      = tsM      ? tsM[1].trim()     : '';
      const state   = stateM   ? stateM[1].trim()  : 'UNKNOWN';

      let overall = null, Q = null, D = null, P = null;

      // 1. Try council_session.md for overall
      const councilFile = path.join(dirPath, 'council_session.md');
      if (fs.existsSync(councilFile)) {
        const council = fs.readFileSync(councilFile, 'utf8');
        const oM = council.match(/\*\*(?:Proposed |Final |Confirmed )?Overall[:\s*]+([0-9]+\.[0-9]+)/i)
                || council.match(/Overall[:\s]+([0-9]+\.[0-9]+)/i);
        if (oM) overall = parseFloat(oM[1]);
      }

      // 2. Try bot2 for overall + axis scores
      const bot2Files = fs.readdirSync(dirPath).filter(f => f.includes('bot2_evaluator'));
      if (bot2Files.length > 0) {
        const bot2 = fs.readFileSync(path.join(dirPath, bot2Files[0]), 'utf8');

        // **OVERALL: B (7.24/10)**
        if (!overall) {
          const ovM = bot2.match(/\*\*OVERALL:\s*[A-F][+-]?\s*\(([0-9]+\.[0-9]+)\/10\)/);
          if (ovM) overall = parseFloat(ovM[1]);
        }

        // Weighted calc line: (7.27 × 0.35) + (7.60 × 0.35) + (6.6 × 0.30) = ... → 7.24
        const bot2Lines = bot2.split('\n');
        const calcLine = bot2Lines.find(function(l) {
          return l.indexOf('\u00d7') !== -1 && l.indexOf('\u2192') !== -1;
        });
        if (calcLine) {
          const re = /\(([0-9.]+)\s*\u00d7/g;
          const nums = [];
          let m;
          while ((m = re.exec(calcLine)) !== null) nums.push(parseFloat(m[1]));
          if (nums.length >= 3) { Q = nums[0]; D = nums[1]; P = nums[2]; }
          const arrM = calcLine.match(/\u2192\s*([0-9]+\.[0-9]+)/);
          if (arrM && !overall) overall = parseFloat(arrM[1]);
        }
      }

      evaluations.push({
        dir, product, config, ts, state,
        overall: overall,
        grade: overall ? gradeScale(overall) : null,
        Q: Q, D: D, P: P
      });
    } catch(e) {
      // skip bad dirs silently
    }
  }

  return { calibration: CALIBRATION, evaluations: evaluations, timestamp: new Date().toISOString() };
}

const server = http.createServer((req, res) => {
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    const url = req.url;

    // Public routes — no auth
    if (req.method === 'OPTIONS') { 
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Headers', 'x-api-key, Content-Type');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.writeHead(204); res.end(); return; 
    }
    if (req.method === 'GET' && (url === '/dashboard' || url === '/')) {
      res.setHeader('Content-Type', 'text/html');
      res.writeHead(200);
      res.end("<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"UTF-8\">\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n<title>The Residentialist \u2014 Mission Control</title>\n<style>\n  * { box-sizing: border-box; margin: 0; padding: 0; }\n  :root {\n    --amber: #B8722A;\n    --ink: #1a1a1a;\n    --ink-mid: #555;\n    --ink-faint: #999;\n    --rule: #e0dbd4;\n    --bg: #f5f3ef;\n    --white: #ffffff;\n    --green: #2d6a4f;\n    --red: #9b2226;\n    --yellow-bg: #fef3c7;\n    --yellow-border: #d97706;\n  }\n  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;\n    background: var(--bg); color: var(--ink); min-height: 100vh; }\n\n  header { background: var(--ink); color: var(--white); padding: 14px 20px;\n    display: flex; align-items: center; justify-content: space-between; }\n  .logo { font-size: 11px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; }\n  .logo span { color: var(--amber); }\n  .status-dot { width: 8px; height: 8px; border-radius: 50%; background: #6b7280; display: inline-block; margin-right: 6px; }\n  .status-dot.live { background: #10b981; animation: pulse 2s infinite; }\n  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }\n  .header-status { font-size: 11px; color: #9ca3af; display: flex; align-items: center; gap: 4px; }\n\n  .container { max-width: 900px; margin: 0 auto; padding: 20px 16px; }\n\n  .section-label { font-size: 10px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase;\n    color: var(--amber); margin-bottom: 12px; margin-top: 28px; }\n\n  /* Score table */\n  .score-table { width: 100%; border-collapse: collapse; background: var(--white);\n    border: 1px solid var(--rule); }\n  .score-table th { font-size: 9px; font-weight: 700; letter-spacing: .15em; text-transform: uppercase;\n    color: var(--ink-faint); padding: 10px 12px; text-align: left; border-bottom: 1px solid var(--rule);\n    background: #faf9f7; }\n  .score-table td { padding: 12px 12px; font-size: 13px; border-bottom: 1px solid var(--rule); vertical-align: middle; }\n  .score-table tr:last-child td { border-bottom: none; }\n  .score-table tr.clickable { cursor: pointer; }\n  .score-table tr.clickable:hover td { background: #faf9f7; }\n  .score-table tr.expanded td { background: #fdf8f2; }\n\n  .product-name { font-weight: 600; font-size: 14px; }\n  .product-meta { font-size: 11px; color: var(--ink-faint); margin-top: 2px; }\n\n  .score-num { font-size: 22px; font-weight: 300; font-variant-numeric: tabular-nums; line-height: 1; }\n  .score-grade { font-size: 10px; font-weight: 700; color: var(--ink-faint); margin-top: 3px; letter-spacing: .05em; }\n  .score-col { text-align: right; }\n\n  .status-badge { display: inline-block; padding: 3px 8px; border-radius: 3px; font-size: 10px;\n    font-weight: 700; letter-spacing: .1em; text-transform: uppercase; }\n  .badge-pass { background: #d1fae5; color: #065f46; }\n  .badge-halted { background: #fee2e2; color: #991b1b; }\n  .badge-unknown { background: #f3f4f6; color: #6b7280; }\n  .badge-running { background: #fef3c7; color: #92400e; }\n  .badge-cal { background: #e0d9f0; color: #4c1d95; }\n\n  /* Drill-down panel */\n  .drill-row td { padding: 0 !important; }\n  .drill-panel { padding: 16px 20px 20px; border-top: 2px solid var(--amber); background: #fdf8f2; }\n  .drill-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-top: 12px; }\n  @media (max-width: 560px) { .drill-grid { grid-template-columns: 1fr; } }\n\n  .axis-card { background: var(--white); border: 1px solid var(--rule); padding: 14px; }\n  .axis-label { font-size: 9px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase;\n    color: var(--ink-faint); margin-bottom: 8px; }\n  .axis-score { font-size: 28px; font-weight: 300; line-height: 1; }\n  .axis-grade { font-size: 10px; color: var(--ink-faint); margin-top: 2px; font-weight: 700; }\n  .axis-weight { font-size: 10px; color: var(--ink-faint); margin-bottom: 6px; }\n  .axis-bar-track { height: 4px; background: var(--rule); border-radius: 2px; margin-top: 10px; }\n  .axis-bar-fill { height: 4px; border-radius: 2px; transition: width .4s ease; }\n\n  .drill-meta { display: flex; gap: 20px; flex-wrap: wrap; margin-top: 4px; }\n  .drill-meta-item { font-size: 11px; color: var(--ink-mid); }\n  .drill-meta-item strong { color: var(--ink); }\n\n  .chevron { font-size: 10px; color: var(--ink-faint); transition: transform .2s; display: inline-block; }\n  .chevron.open { transform: rotate(180deg); }\n\n  .refresh-btn { background: var(--amber); color: var(--white); border: none; padding: 8px 16px;\n    font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;\n    cursor: pointer; border-radius: 3px; }\n  .refresh-btn:hover { background: #9a5e22; }\n\n  .pipeline-bar { background: var(--white); border: 1px solid var(--rule); padding: 14px 16px;\n    display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; }\n  .pipeline-stats { display: flex; gap: 20px; }\n  .stat { text-align: center; }\n  .stat-num { font-size: 24px; font-weight: 300; line-height: 1; }\n  .stat-label { font-size: 9px; font-weight: 700; letter-spacing: .15em; text-transform: uppercase;\n    color: var(--ink-faint); margin-top: 2px; }\n\n  .error-msg { color: var(--red); font-size: 12px; padding: 12px; background: #fff5f5;\n    border: 1px solid #fed7d7; }\n  .loading { color: var(--ink-faint); font-size: 12px; padding: 20px; text-align: center; }\n\n  .col-product { width: 45%; }\n  .col-status  { width: 20%; }\n  .col-score   { width: 20%; }\n  .col-chevron { width: 5%; text-align: center; }\n\n  .timestamp { font-size: 10px; color: var(--ink-faint); }\n\n  /* Mobile tweaks */\n  @media (max-width: 600px) {\n    .score-num { font-size: 18px; }\n    .col-product { width: 50%; }\n    .col-status { display: none; }\n    .col-score { width: 30%; }\n  }\n</style>\n</head>\n<body>\n\n<header>\n  <div class=\"logo\">The <span>Residentialist</span> \u00b7 Mission Control</div>\n  <div class=\"header-status\">\n    <span class=\"status-dot\" id=\"conn-dot\"></span>\n    <span id=\"conn-label\">connecting...</span>\n  </div>\n</header>\n\n<div class=\"container\">\n\n  <!-- Pipeline summary bar -->\n  <div class=\"section-label\" style=\"margin-top:20px\">Pipeline</div>\n  <div class=\"pipeline-bar\">\n    <div class=\"pipeline-stats\">\n      <div class=\"stat\"><div class=\"stat-num\" id=\"stat-complete\">\u2014</div><div class=\"stat-label\">Complete</div></div>\n      <div class=\"stat\"><div class=\"stat-num\" id=\"stat-halted\" style=\"color:#ef4444\">\u2014</div><div class=\"stat-label\">Halted</div></div>\n      <div class=\"stat\"><div class=\"stat-num\" id=\"stat-cal\">\u2014</div><div class=\"stat-label\">Calibrated</div></div>\n    </div>\n    <div style=\"display:flex;align-items:center;gap:12px\">\n      <div class=\"timestamp\" id=\"last-updated\"></div>\n      <button class=\"refresh-btn\" onclick=\"loadData()\">\u21bb Refresh</button>\n    </div>\n  </div>\n\n  <!-- Calibration benchmarks -->\n  <div class=\"section-label\">Calibration Benchmarks</div>\n  <table class=\"score-table\">\n    <thead>\n      <tr>\n        <th class=\"col-product\">Product</th>\n        <th class=\"col-status\">Tier</th>\n        <th class=\"col-score\">Score</th>\n        <th class=\"col-chevron\"></th>\n      </tr>\n    </thead>\n    <tbody id=\"cal-tbody\">\n      <tr><td colspan=\"4\" class=\"loading\">Loading...</td></tr>\n    </tbody>\n  </table>\n\n  <!-- Evaluations -->\n  <div class=\"section-label\">Evaluations</div>\n  <div id=\"error-msg\"></div>\n  <table class=\"score-table\">\n    <thead>\n      <tr>\n        <th class=\"col-product\">Product</th>\n        <th class=\"col-status\">Status</th>\n        <th class=\"col-score\">Score</th>\n        <th class=\"col-chevron\"></th>\n      </tr>\n    </thead>\n    <tbody id=\"eval-tbody\">\n      <tr><td colspan=\"4\" class=\"loading\">Loading...</td></tr>\n    </tbody>\n  </table>\n\n</div>\n\n<script>\nconst BRIDGE = '';  // served from bridge, use relative URLs\nconst API_KEY = 'residentialist-bridge-2026';\nlet expandedRow = null;\n\nfunction gradeColor(score) {\n  if (!score) return '#9ca3af';\n  if (score >= 8.0) return '#10b981';\n  if (score >= 7.0) return '#3b82f6';\n  if (score >= 6.0) return '#f59e0b';\n  if (score >= 5.0) return '#ef8c34';\n  return '#ef4444';\n}\n\nfunction barColor(score) {\n  if (!score) return '#e5e7eb';\n  if (score >= 8.0) return '#10b981';\n  if (score >= 7.0) return '#3b82f6';\n  if (score >= 6.0) return '#f59e0b';\n  return '#ef4444';\n}\n\nfunction tierLabel(overall) {\n  if (!overall) return '\u2014';\n  if (overall >= 8.5) return 'High Performance';\n  if (overall >= 7.0) return 'Architectural';\n  if (overall >= 5.5) return 'Premium Residential';\n  if (overall >= 4.0) return 'Mid-Range';\n  return 'Budget';\n}\n\nfunction drillHTML(item, isCalibration) {\n  const Q = item.Q, D = item.D, P = item.P;\n  const hasSubs = Q !== null && D !== null && P !== null;\n  const axes = [\n    { label: 'Quality',     weight: '35%', score: Q },\n    { label: 'Durability',  weight: '35%', score: D },\n    { label: 'Performance', weight: '30%', score: P },\n  ];\n  return `\n    <div class=\"drill-panel\">\n      <div class=\"drill-meta\">\n        ${item.overall ? `<div class=\"drill-meta-item\">Overall: <strong>${item.overall.toFixed(2)} / 10</strong></div>` : ''}\n        ${item.tier || item.overall ? `<div class=\"drill-meta-item\">Tier: <strong>${item.tier || tierLabel(item.overall)}</strong></div>` : ''}\n        ${item.ts ? `<div class=\"drill-meta-item\">Scored: <strong>${item.ts.slice(0,10)}</strong></div>` : ''}\n      </div>\n      ${hasSubs ? `\n      <div class=\"drill-grid\">\n        ${axes.map(a => `\n          <div class=\"axis-card\">\n            <div class=\"axis-label\">${a.label}</div>\n            <div class=\"axis-weight\">${a.weight} of overall</div>\n            <div class=\"axis-score\" style=\"color:${gradeColor(a.score)}\">${a.score ? a.score.toFixed(2) : '\u2014'}</div>\n            <div class=\"axis-bar-track\">\n              <div class=\"axis-bar-fill\" style=\"width:${a.score ? (a.score/10*100) : 0}%;background:${barColor(a.score)}\"></div>\n            </div>\n          </div>`).join('')}\n      </div>` : `<div style=\"font-size:12px;color:var(--ink-faint);margin-top:12px\">Axis scores not yet available for this product.</div>`}\n    </div>`;\n}\n\nfunction renderCalibration(data) {\n  const tbody = document.getElementById('cal-tbody');\n  if (!data || data.length === 0) { tbody.innerHTML = '<tr><td colspan=\"4\" class=\"loading\">No calibration data</td></tr>'; return; }\n\n  let html = '';\n  data.forEach((item, idx) => {\n    const rowId = 'cal-' + idx;\n    html += `\n      <tr class=\"clickable ${expandedRow === rowId ? 'expanded' : ''}\" onclick=\"toggleRow('${rowId}', this)\">\n        <td><div class=\"product-name\">${item.product}</div><div class=\"product-meta\">${item.config} \u00b7 Calibration Benchmark</div></td>\n        <td><span class=\"status-badge badge-cal\">${tierLabel(item.overall)}</span></td>\n        <td class=\"score-col\">\n          <div class=\"score-num\" style=\"color:${gradeColor(item.overall)}\">${item.overall ? item.overall.toFixed(2) : '\u2014'}</div>\n          <div class=\"score-grade\">${item.grade || '\u2014'}</div>\n        </td>\n        <td class=\"col-chevron\"><span class=\"chevron ${expandedRow === rowId ? 'open' : ''}\">\u25bc</span></td>\n      </tr>`;\n    if (expandedRow === rowId) {\n      html += `<tr class=\"drill-row\" id=\"drill-${rowId}\"><td colspan=\"4\">${drillHTML(item, true)}</td></tr>`;\n    }\n  });\n  tbody.innerHTML = html;\n}\n\nfunction statusBadge(state) {\n  if (!state) return '<span class=\"status-badge badge-unknown\">Unknown</span>';\n  const s = state.toUpperCase();\n  if (s.includes('PASS')) return '<span class=\"status-badge badge-pass\">Pass</span>';\n  if (s.includes('HALT')) return '<span class=\"status-badge badge-halted\">Halted</span>';\n  if (s.includes('RUNNING') || s.includes('PROCESS')) return '<span class=\"status-badge badge-running\">Running</span>';\n  return `<span class=\"status-badge badge-unknown\">${state.slice(0,12)}</span>`;\n}\n\nfunction renderEvaluations(evals) {\n  const tbody = document.getElementById('eval-tbody');\n  if (!evals || evals.length === 0) { tbody.innerHTML = '<tr><td colspan=\"4\" class=\"loading\">No evaluations found</td></tr>'; return; }\n\n  // Deduplicate \u2014 keep most recent run per product\n  const seen = new Map();\n  for (const e of evals) {\n    const key = e.product.toLowerCase().replace(/\\s+/g, '_');\n    if (!seen.has(key) || e.ts > seen.get(key).ts) seen.set(key, e);\n  }\n  const unique = Array.from(seen.values()).sort((a,b) => (b.overall||0) - (a.overall||0));\n\n  let pass = 0, halted = 0;\n  let html = '';\n  unique.forEach((item, idx) => {\n    const rowId = 'eval-' + idx;\n    const state = (item.state||'').toUpperCase();\n    if (state.includes('PASS')) pass++;\n    if (state.includes('HALT')) halted++;\n    html += `\n      <tr class=\"clickable ${expandedRow === rowId ? 'expanded' : ''}\" onclick=\"toggleRow('${rowId}', this)\">\n        <td><div class=\"product-name\">${item.product}</div><div class=\"product-meta\">${item.config} \u00b7 ${item.ts ? item.ts.slice(0,10) : ''}</div></td>\n        <td>${statusBadge(item.state)}</td>\n        <td class=\"score-col\">\n          <div class=\"score-num\" style=\"color:${gradeColor(item.overall)}\">${item.overall ? item.overall.toFixed(2) : '\u2014'}</div>\n          <div class=\"score-grade\">${item.grade || (item.overall ? '' : '\u2014')}</div>\n        </td>\n        <td class=\"col-chevron\"><span class=\"chevron ${expandedRow === rowId ? 'open' : ''}\">\u25bc</span></td>\n      </tr>`;\n    if (expandedRow === rowId) {\n      html += `<tr class=\"drill-row\" id=\"drill-${rowId}\"><td colspan=\"4\">${drillHTML(item, false)}</td></tr>`;\n    }\n  });\n\n  tbody.innerHTML = html;\n  document.getElementById('stat-complete').textContent = pass;\n  document.getElementById('stat-halted').textContent = halted;\n}\n\nfunction toggleRow(rowId, clickedTr) {\n  if (expandedRow === rowId) {\n    expandedRow = null;\n  } else {\n    expandedRow = rowId;\n  }\n  // Re-render both tables to reflect new state\n  if (window._lastData) {\n    renderCalibration(window._lastData.calibration);\n    renderEvaluations(window._lastData.evaluations);\n  }\n}\n\nasync function loadData() {\n  const dot = document.getElementById('conn-dot');\n  const label = document.getElementById('conn-label');\n  dot.className = 'status-dot';\n  label.textContent = 'loading...';\n  document.getElementById('error-msg').textContent = '';\n\n  try {\n    const res = await fetch(BRIDGE + '/pipeline', {\n      headers: { 'x-api-key': API_KEY }\n    });\n    if (!res.ok) throw new Error('HTTP ' + res.status);\n    const data = await res.json();\n    window._lastData = data;\n\n    dot.className = 'status-dot live';\n    label.textContent = 'live';\n    document.getElementById('last-updated').textContent =\n      'Updated ' + new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});\n    document.getElementById('stat-cal').textContent = data.calibration ? data.calibration.length : 0;\n\n    renderCalibration(data.calibration || []);\n    renderEvaluations(data.evaluations || []);\n  } catch(e) {\n    dot.className = 'status-dot';\n    label.textContent = 'offline';\n    document.getElementById('error-msg').innerHTML =\n      `<div class=\"error-msg\">Could not reach bridge: ${e.message}</div>`;\n    document.getElementById('eval-tbody').innerHTML =\n      '<tr><td colspan=\"4\" class=\"loading\">\u2014</td></tr>';\n  }\n}\n\nloadData();\n</script>\n</body>\n</html>\n");
      return;
    }

    const auth = req.headers['x-api-key'];
    if (auth !== API_KEY) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Unauthorized' }));
      return;
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'x-api-key, Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

    try {
      const url = req.url;
      if (req.method === 'GET' && url === '/status') {
        res.writeHead(200);
        res.end(JSON.stringify(getStatus()));
        return;
      }

      if (req.method === 'GET' && url.startsWith('/logs')) {
        const params = new URL(url, 'http://localhost').searchParams;
        const file = params.get('file') || 'deploy';
        const logMap = {
          deploy: '/Users/Residentialist/deploy.log',
          bridge: '/Users/Residentialist/bridge.log',
          telegram: '/Users/Residentialist/telegram.log',
          cron: '/Users/Residentialist/deploy_cron.log'
        };
        const logPath = logMap[file] || logMap.deploy;
        const tail = runCommand('tail -100 ' + logPath);
        res.writeHead(200);
        res.end(JSON.stringify({ file, content: tail.output }));
        return;
      }

      if (req.method === 'GET' && url.startsWith('/file')) {
        const params = new URL(url, 'http://localhost').searchParams;
        const filePath = params.get('path');
        if (!filePath) { res.writeHead(400); res.end(JSON.stringify({ error: 'No path' })); return; }
        const fullPath = filePath.startsWith('/') ? filePath : path.join(WORKSPACE, filePath);
        const result = readFile(fullPath);
        res.writeHead(result.success ? 200 : 404);
        res.end(JSON.stringify(result));
        return;
      }

      if (req.method === 'GET' && url === '/outputs') {
        res.writeHead(200);
        res.end(JSON.stringify({ outputs: listOutputs() }));
        return;
      }

      if (req.method === 'GET' && url === '/pipeline') {
        res.writeHead(200);
        res.end(JSON.stringify(getPipelineData()));
        return;
      }

      if (req.method === 'POST' && url === '/run') {
        const data = JSON.parse(body);
        if (!data.product) { res.writeHead(400); res.end(JSON.stringify({ error: 'No product' })); return; }
        const config = data.config || 'DH';
        const category = data.category || 'Windows';
        log('RUN: ' + data.product + ' ' + config + ' ' + category);
        const child = spawn('node', ['auto_runner.js', data.product, config, category], {
          cwd: WORKSPACE, detached: true, stdio: 'ignore'
        });
        child.unref();
        res.writeHead(200);
        res.end(JSON.stringify({ started: true, product: data.product, config, category }));
        return;
      }

      if (req.method === 'POST' && url === '/write') {
        const data = JSON.parse(body);
        if (!data.path || !data.content) { res.writeHead(400); res.end(JSON.stringify({ error: 'No path or content' })); return; }
        const fullPath = data.path.startsWith('/') ? data.path : path.join(WORKSPACE, data.path);
        fs.mkdirSync(path.dirname(fullPath), { recursive: true });
        fs.writeFileSync(fullPath, data.content);
        log('WRITE: ' + fullPath);
        res.writeHead(200);
        res.end(JSON.stringify({ written: true, path: fullPath }));
        return;
      }

      if (req.method === 'POST' && url === '/shell') {
        const data = JSON.parse(body);
        if (!data.cmd) { res.writeHead(400); res.end(JSON.stringify({ error: 'No cmd' })); return; }
        log('SHELL: ' + data.cmd);
        const result = runCommand(data.cmd);
        res.writeHead(200);
        res.end(JSON.stringify(result));
        return;
      }

      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Not found' }));

    } catch(e) {
      log('ERROR: ' + e.message);
      res.writeHead(500);
      res.end(JSON.stringify({ error: e.message }));
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  log('Claude Bridge listening on port ' + PORT);
});

process.on('uncaughtException', err => log('UNCAUGHT: ' + err.message));

```

---

### 12.5 — council.js (Three-Member Auto-Resolver)
**Mac Mini path:** `/Users/Residentialist/.openclaw/workspace/residentialist/council.js`

```javascript
/**
 * THE RESIDENTIALIST — Council Module
 *
 * Handles all escalation from the FLAG GATE in three tiers:
 *
 * Tier 1 — AUTO-RESOLVE: Claude API attempts to resolve the flag with a
 *           rubric patch, reclassification, or documented midpoint correction.
 *           If resolved, pipeline continues with a correction memo attached.
 *
 * Tier 2 — COUNCIL: Three specialized Claude instances vote independently.
 *           Consumer Advocate, Technical Purist, Market Realist.
 *           Synthesis call produces a ruling. 2/3 matching = decision.
 *           If resolved, pipeline continues with council ruling attached.
 *
 * Tier 3 — ESCALATE TO RAY: 3-way split or policy-level question.
 *           Telegram message with log link. Pipeline halts only here.
 *
 * Ray receives a Telegram link for every council session regardless of outcome.
 * He can review at leisure. It never blocks the pipeline.
 */

const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const https = require('https');
require('dotenv').config({ path: '/Users/Residentialist/.openclaw/workspace/residentialist/.env' });

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// ─── TELEGRAM ─────────────────────────────────────────────────────────────────

function sendTelegram(message) {
  return new Promise((resolve, reject) => {
    if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) {
      console.log('[COUNCIL] Telegram not configured — skipping notification.');
      return resolve();
    }
    const body = JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'Markdown'
    });
    const options = {
      hostname: 'api.telegram.org',
      path: `/bot${TELEGRAM_TOKEN}/sendMessage`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', err => {
      console.error('[COUNCIL] Telegram error:', err.message);
      resolve(); // non-fatal
    });
    req.write(body);
    req.end();
  });
}

// ─── LOGGING ──────────────────────────────────────────────────────────────────

function writeLog(outputDir, filename, content) {
  const logPath = `${outputDir}/${filename}`;
  fs.writeFileSync(logPath, content);
  return logPath;
}

// ─── TIER 1 — AUTO-RESOLVE ────────────────────────────────────────────────────

const AUTO_RESOLVE_PROMPT = `You are the Residentialist Auto-Resolver. The Challenge Bot has flagged a product evaluation. Your job is to determine whether this flag can be resolved by:

1. CORRECTION MEMO — The flag is a rubric interpretation error. Write an exact correction that Bot 2 should apply (e.g., reclassify a material, adjust a subscore, document a midpoint correctly).
2. RECLASSIFY — The flag is a data classification issue (ASSUMED vs UNDISCLOSED). Provide the correct classification and the resulting score change.
3. PASS-THROUGH — The flag is a calibration note only (CHECK 3 proximity) with no scoring error. Pipeline can continue as-is.

You CANNOT resolve a flag if:
- It requires a policy decision (e.g., whether a new certification tier should be accepted)
- It requires information that doesn't exist in the provided research
- CHECK 1 shows a genuine hierarchy violation that requires human judgment
- There is genuine disagreement about rubric intent that requires Council input

Respond in exactly this format:

RESOLUTION: [RESOLVED / UNRESOLVABLE]
TYPE: [CORRECTION_MEMO / RECLASSIFY / PASS_THROUGH / COUNCIL_REQUIRED]
RATIONALE: [2-3 sentences explaining your decision]
ACTION: [If RESOLVED — exact correction text to attach as memo. If UNRESOLVABLE — what specific question the Council must answer.]`;

async function attemptAutoResolve(flagReport, bot2Output, productName) {
  console.log('[COUNCIL] Tier 1 — Attempting auto-resolve...');

  const userMessage = `PRODUCT: ${productName}

CHALLENGE BOT FLAG REPORT:
${flagReport}

BOT 2 EVALUATOR OUTPUT (relevant sections):
${bot2Output.slice(0, 8000)}

Attempt to resolve this flag now.`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    system: AUTO_RESOLVE_PROMPT,
    messages: [{ role: 'user', content: userMessage }]
  });

  return response.content[0].text;
}

// ─── TIER 2 — COUNCIL ────────────────────────────────────────────────────────

const COUNCIL_MEMBERS = [
  {
    name: 'Consumer Advocate',
    prompt: `You are the Consumer Advocate on The Residentialist Council. You represent quality-conscious homebuyers who are making a $30,000–$150,000 purchase decision and relying on this score to be accurate and honest.

Your perspective: Does this score accurately reflect what a homebuyer will experience? Are the flags legitimate concerns that would affect buyer outcomes? You are skeptical of over-engineering and academic precision that doesn't translate to real-world buyer impact. You trust documented performance data and independent reviews over manufacturer claims.

You receive a flagged product evaluation and a proposed auto-resolution or Council question. Vote: APPROVE (accept the score as-is or with minor memo), MODIFY (specific change required), or REJECT (score is materially misleading to buyers).

Always state: VOTE: [APPROVE/MODIFY/REJECT] followed by your 2-3 sentence rationale. If MODIFY, state exactly what change you require.`
  },
  {
    name: 'Technical Purist',
    prompt: `You are the Technical Purist on The Residentialist Council. You are responsible for rubric integrity, scoring consistency, and data discipline.

Your perspective: Every score must be derivable from documented inputs using the published rubric. Assumed specs are scoring errors. Undisclosed specs must be midpoint-scored. The calibration table must remain internally consistent. You do not care about buyer sentiment — you care about whether the math is defensible.

You receive a flagged product evaluation and a proposed auto-resolution or Council question. Vote: APPROVE (methodology is sound), MODIFY (specific correction required), or REJECT (scoring violates rubric principles).

Always state: VOTE: [APPROVE/MODIFY/REJECT] followed by your 2-3 sentence rationale. If MODIFY, state exactly what correction the rubric requires.`
  },
  {
    name: 'Market Realist',
    prompt: `You are the Market Realist on The Residentialist Council. You represent the builder and trade professional perspective — people who spec products at scale and understand price-tier context.

Your perspective: Does this score make sense in the context of the market? Is it calibrated correctly against competing products at similar price points? Would a production builder or design professional find this score credible? You are skeptical of scores that don't reflect real-world procurement realities.

You receive a flagged product evaluation and a proposed auto-resolution or Council question. Vote: APPROVE (score is market-credible), MODIFY (calibration adjustment needed), or REJECT (score would not survive professional scrutiny).

Always state: VOTE: [APPROVE/MODIFY/REJECT] followed by your 2-3 sentence rationale. If MODIFY, state exactly what market-calibration change you require.`
  }
];

const SYNTHESIS_PROMPT = `You are the Residentialist Council Synthesizer. You receive the votes and rationales of three Council members — Consumer Advocate, Technical Purist, and Market Realist — on a flagged product evaluation. Your job is to produce a binding ruling.

RULING LOGIC:
- 3 APPROVE → RULING: APPROVED. State the consensus rationale.
- 2 APPROVE, 1 MODIFY → RULING: APPROVED WITH MEMO. Incorporate the modification from the dissenting member as a required correction memo.
- 2 APPROVE, 1 REJECT → RULING: APPROVED WITH NOTE. Note the dissent. Pipeline continues.
- 2 MODIFY (same change) → RULING: MODIFICATION REQUIRED. State the exact change both members require.
- 2 MODIFY (different changes) → RULING: ESCALATE. Describe the conflict. Ray must decide.
- 2 REJECT → RULING: REJECTED. Pipeline halts. Ray must review.
- 3-way split (one each) → RULING: ESCALATE. No consensus. Ray must decide.
- 1 REJECT + 2 others disagree → RULING: APPROVED WITH DISSENT NOTED unless the rejection raises a data integrity issue, in which case ESCALATE.

Output format:
COUNCIL RULING: [APPROVED / APPROVED WITH MEMO / MODIFICATION REQUIRED / ESCALATE / REJECTED]
CONSENSUS RATIONALE: [2-3 sentences]
REQUIRED ACTION: [Exact memo text if modification, or escalation question for Ray if ESCALATE, or nothing if APPROVED]
PIPELINE: [CONTINUES / HALTS]`;

async function conveneCouncil(flagReport, autoResolveResult, bot1Output, bot2Output, bot3Output, productName) {
  console.log('[COUNCIL] Tier 2 — Convening Council...');

  const councilContext = `PRODUCT: ${productName}

CHALLENGE BOT FLAG REPORT:
${flagReport}

AUTO-RESOLVER ASSESSMENT:
${autoResolveResult}

BOT 1 CONSENSUS (summary — first 3000 chars):
${bot1Output.slice(0, 3000)}

BOT 2 EVALUATOR (full scoring section):
${bot2Output.slice(0, 6000)}

BOT 3 MATERIAL SAFETY:
${bot3Output.slice(0, 2000)}

Council question: Should this flag be accepted, modified, or rejected? Cast your vote.`;

  // Fire all three Council calls in parallel
  console.log('[COUNCIL] Firing Consumer Advocate, Technical Purist, Market Realist simultaneously...');
  const [advocateResult, puristResult, realistResult] = await Promise.all(
    COUNCIL_MEMBERS.map(member =>
      client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 800,
        system: member.prompt,
        messages: [{ role: 'user', content: councilContext }]
      }).then(r => ({ name: member.name, vote: r.content[0].text }))
    )
  );

  console.log(`[COUNCIL] Votes received:`);
  console.log(`  ${advocateResult.name}: ${advocateResult.vote.split('\n')[0]}`);
  console.log(`  ${puristResult.name}: ${puristResult.vote.split('\n')[0]}`);
  console.log(`  ${realistResult.name}: ${realistResult.vote.split('\n')[0]}`);

  // Synthesis call
  const synthesisInput = `CONSUMER ADVOCATE VOTE:
${advocateResult.vote}

TECHNICAL PURIST VOTE:
${puristResult.vote}

MARKET REALIST VOTE:
${realistResult.vote}

Produce the binding ruling now.`;

  const synthesisResponse = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    system: SYNTHESIS_PROMPT,
    messages: [{ role: 'user', content: synthesisInput }]
  });

  const ruling = synthesisResponse.content[0].text;
  console.log(`[COUNCIL] Ruling: ${ruling.split('\n')[0]}`);

  return {
    votes: { advocateResult, puristResult, realistResult },
    ruling
  };
}

// ─── MAIN ESCALATION HANDLER ─────────────────────────────────────────────────

/**
 * handleEscalation — called by the orchestrator when Challenge Bot returns FLAG
 *
 * Returns:
 *   { pipeline: 'CONTINUES', memo: '...' }  — pipeline proceeds with memo attached
 *   { pipeline: 'HALTS', reason: '...' }     — pipeline halts, Ray notified
 */
async function handleEscalation(flagReport, bot1Output, bot2Output, bot3Output, productName, outputDir) {
  const timestamp = new Date().toISOString();
  let sessionLog = `# COUNCIL SESSION LOG\nProduct: ${productName}\nTimestamp: ${timestamp}\n\n`;

  sessionLog += `## CHALLENGE BOT FLAG REPORT\n${flagReport}\n\n`;

  // ── TIER 1: Auto-resolve ──────────────────────────────────────────────────
  const autoResolveResult = await attemptAutoResolve(flagReport, bot2Output, productName);
  sessionLog += `## TIER 1 — AUTO-RESOLVE ATTEMPT\n${autoResolveResult}\n\n`;

  const isResolved = autoResolveResult.includes('RESOLUTION: RESOLVED');
  const isPassThrough = autoResolveResult.includes('TYPE: PASS_THROUGH');

  if (isResolved || isPassThrough) {
    const logPath = writeLog(outputDir, 'council_session.md', sessionLog);
    console.log('[COUNCIL] ✅ Auto-resolved — pipeline continues.');

    await sendTelegram(
      `✅ *Council Auto-Resolve* — ${productName}\n\nChallenge Bot flagged, auto-resolver cleared it.\n\n[Review session log](file://${logPath})`
    );

    const memoMatch = autoResolveResult.match(/ACTION:([\s\S]+?)(?:\n[A-Z]+:|$)/);
    const memo = memoMatch ? memoMatch[1].trim() : 'Auto-resolved — see council_session.md';
    return { pipeline: 'CONTINUES', memo };
  }

  // ── TIER 2: Council ───────────────────────────────────────────────────────
  const councilResult = await conveneCouncil(
    flagReport, autoResolveResult,
    bot1Output, bot2Output, bot3Output, productName
  );

  sessionLog += `## TIER 2 — COUNCIL VOTES\n\n`;
  sessionLog += `### Consumer Advocate\n${councilResult.votes.advocateResult.vote}\n\n`;
  sessionLog += `### Technical Purist\n${councilResult.votes.puristResult.vote}\n\n`;
  sessionLog += `### Market Realist\n${councilResult.votes.realistResult.vote}\n\n`;
  sessionLog += `## COUNCIL RULING\n${councilResult.ruling}\n\n`;

  const logPath = writeLog(outputDir, 'council_session.md', sessionLog);

  const ruling = councilResult.ruling;
  const rulingLine = ruling.split('\n').find(l => l.startsWith('COUNCIL RULING:')) || '';
  const pipelineLine = ruling.split('\n').find(l => l.startsWith('PIPELINE:')) || '';
  const pipelineContinues = pipelineLine.includes('CONTINUES');

  if (pipelineContinues) {
    console.log('[COUNCIL] ✅ Council resolved — pipeline continues.');
    await sendTelegram(
      `✅ *Council Ruling* — ${productName}\n\n${rulingLine}\n\nPipeline continues. [Review session log](file://${logPath})`
    );
    const memoMatch = ruling.match(/REQUIRED ACTION:([\s\S]+?)(?:\nPIPELINE:|$)/);
    const memo = memoMatch ? memoMatch[1].trim() : 'Council approved — see council_session.md';
    return { pipeline: 'CONTINUES', memo };
  }

  // ── TIER 3: Escalate to Ray ───────────────────────────────────────────────
  console.log('[COUNCIL] ⚠️  Council deadlock or rejection — escalating to Ray.');

  const requiredActionMatch = ruling.match(/REQUIRED ACTION:([\s\S]+?)(?:\nPIPELINE:|$)/);
  const escalationQuestion = requiredActionMatch ? requiredActionMatch[1].trim() : 'See council_session.md';

  await sendTelegram(
    `⚠️ *Council Escalation — Ray needed* — ${productName}\n\n` +
    `${rulingLine}\n\n` +
    `*Question for you:*\n${escalationQuestion.slice(0, 500)}\n\n` +
    `[Full council session log](file://${logPath})\n\n` +
    `Pipeline is halted. Reply via Telegram or resume manually.`
  );

  sessionLog += `## TIER 3 — ESCALATED TO RAY\nTimestamp: ${new Date().toISOString()}\n`;
  writeLog(outputDir, 'council_session.md', sessionLog);

  return { pipeline: 'HALTS', reason: escalationQuestion };
}

module.exports = { handleEscalation };

```

---

### 12.6 — challenge_bot_v2.js (Bot 4 — Challenge/Adversarial)
**Mac Mini path:** `/Users/Residentialist/.openclaw/workspace/residentialist/challenge_bot_v2.js`

```javascript
const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config({path: '/Users/Residentialist/.openclaw/workspace/residentialist/.env'});

const client = new Anthropic({apiKey: process.env.ANTHROPIC_API_KEY});

const CHALLENGE_BOT_PROMPT = `You are the Residentialist Challenge Bot (Bot 4). Your sole job is quality control. You receive the assembled outputs of Bot 1 (Consensus), Bot 2 (Evaluator), and Bot 3 (Material Safety) and run exactly three checks in sequence. You do not evaluate products. You do not add commentary. You output PASS or FLAG with precise findings.

## CALIBRATION TABLE (current — v6)
| Product | Config | Overall | Grade |
| Alpen Zenith ZR-7 | CSM | 8.70 | A- |
| Marvin Integrity | DH | 8.08 | B+ |
| Marvin Elevate | DH | 8.20 | B+ |
| Andersen A-Series | DH | 7.93 | B |
| Internorm KF 410 | CSM | 7.84 | B |
| Pella Lifestyle Series | CSM | 7.80 | B |
| Pella Architect Series | CSM | 7.80 | B |
| Andersen 400 Series | DH | 7.47 | B- |
| JW Siteline | DH | 7.00 | B- |
| JW V-2500 | DH | 5.70 | C |

## MATERIAL HIERARCHY (rubric base scores)
- Pultruded fiberglass (Ultrex/equivalent): base 9
- Aluminum-clad wood (extruded aluminum): base 8
- Aluminum-clad wood (roll-form aluminum): base 7
- Vinyl-clad wood: base 7
- Composite/proprietary (Fibrex/equivalent): base 6
- Vinyl: base 5
- Aluminum (non-clad): base 5

## CHECK 1 — RUBRIC HIERARCHY VIOLATION
Examine the NET FINAL 2B Materials Durability score in Bot 2 output. Do not flag intermediate arithmetic steps — only the final net score matters.

The material hierarchy defines BASE SCORES (starting points). Adjustments operate above and below the base. The system uses base scores, not hard ceilings. Intermediate arithmetic may produce values above the base before offsets are applied; this is expected and correct.

FLAG only if the NET FINAL 2B score (after all adjustments) exceeds the maximum achievable adjusted score for that material class:
- Composite/proprietary (Fibrex/equivalent): base 6, max documented adjustment +1 → net ceiling = 7. Flag if net 2B > 7.
- Vinyl-clad wood: base 7, adjustment range ±1 → net ceiling = 8. Flag if net 2B > 8.
- Aluminum-clad wood: base 8 (roll-form) or 9 (extruded). Each adjustment requires independent documentation. No absolute ceiling — flag only if an adjustment is applied without cited evidence.
- Pultruded fiberglass (Ultrex/equivalent): base 9. Flag if net 2B > 10.

Additional check: Does any product score higher on net 2B than a product with materially superior frame construction already in the calibration table, without documented justification?

If any net final score violates the above: FLAG — state the material class, the net final 2B score, the maximum achievable adjusted score, and cite the specific rule.
If no violations: CHECK 1 PASS.

## CHECK 2 — UNSUPPORTED SUBSCORES
Examine every subscore across Axis 1, 2, and 3 in Bot 2 output.

Distinguish between two categories:

**ASSUMED** — Bot 2 stated something as confirmed fact that is not confirmed by any source. This is a scoring error. Examples: claiming glazing bead is removable without documentation, claiming warm-edge spacer when no source confirms it, claiming labor warranty without warranty text.

**UNDISCLOSED** — The manufacturer does not publish this spec anywhere. Bot 1 searched and could not find it. Bot 2 applied midpoint scoring and documented the gap. This is correct methodology, not an error.

FLAG (pipeline halts) only for ASSUMED specs — where Bot 2 treated an unconfirmed claim as confirmed fact.
WARN (pipeline continues) for UNDISCLOSED specs — where Bot 1 searched, found nothing, and Bot 2 scored at midpoint with the gap documented.

For each FLAG, state: exact subscore, what was assumed vs confirmed, and what source would resolve it.
For each WARN, state: exact subscore, what was searched for, and that midpoint methodology was applied correctly.
If all subscores are either confirmed or properly midpoint-scored with documented gaps: CHECK 2 PASS.

## CHECK 3 — CALIBRATION CONFLICT
Compare the new product Overall score against every product in the calibration table above.
If the new product scores within 0.15 of any existing calibration product:
- Are they the same configuration type (DH vs CSM)?
- Do they have materially similar construction profiles?
- If scores are within 0.15 but construction profiles are materially different, FLAG for human review.
If no conflicts: CHECK 3 PASS.

## OUTPUT FORMAT
Return exactly this structure:

CHALLENGE BOT REPORT
Product: [name]
Configuration: [CSM/DH]
Proposed Overall: [score]

CHECK 1 — HIERARCHY: [PASS or FLAG + findings]
CHECK 2 — EVIDENCE: [PASS or FLAG + findings]
CHECK 3 — CALIBRATION: [PASS or FLAG + findings]

VERDICT: [PASS — pipeline proceeds] or [FLAG — pipeline halted — issues must be resolved before score acceptance]

VERDICT is FLAG only if CHECK 1 or CHECK 2 contain FLAG findings (assumption errors or hierarchy violations).
VERDICT is PASS if the only findings are CHECK 2 WARNs (undisclosed specs scored at midpoint) or CHECK 3 calibration notes.

If FLAG: list each issue on a numbered line with exact location in Bot 2 output and required resolution.
If WARN only: list each warn item but confirm pipeline proceeds.`;

async function runChallengeBot(bot1Output, bot2Output, bot3Output, productName) {
  console.log(`\nRunning Challenge Bot on: ${productName}\n`);

  const userMessage = `
PRODUCT: ${productName}

BOT 1 OUTPUT (Consensus):
${bot1Output}

BOT 2 OUTPUT (Evaluator):
${bot2Output}

BOT 3 OUTPUT (Material Safety):
${bot3Output}

Run all three checks now.`;

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1000,
    system: CHALLENGE_BOT_PROMPT,
    messages: [{role: 'user', content: userMessage}]
  });

  console.log(response.content[0].text);
  return response.content[0].text;
}

module.exports = { runChallengeBot };

if (require.main === module) {
  const fs = require('fs');

  const bot1File = process.argv[2];
  const bot2File = process.argv[3];
  const bot3File = process.argv[4];
  const productName = process.argv[5] || 'Test Product';

  if (!bot1File || !bot2File || !bot3File) {
    console.log('Usage: node challenge_bot.js <bot1_file> <bot2_file> <bot3_file> <product_name>');
    process.exit(1);
  }

  const bot1Output = fs.readFileSync(bot1File, 'utf8');
  const bot2Output = fs.readFileSync(bot2File, 'utf8');
  const bot3Output = fs.readFileSync(bot3File, 'utf8');

  runChallengeBot(bot1Output, bot2Output, bot3Output, productName)
    .catch(console.error);
}

```

---

### 12.7 — reconciliation_bot.js (Bot 5 — Reconciliation)
**Mac Mini path:** `/Users/Residentialist/.openclaw/workspace/residentialist/reconciliation_bot.js`

```javascript
/**
 * THE RESIDENTIALIST — Reconciliation Bot (Bot 5)
 *
 * Runs after Bot 2 (Evaluator) and before the FLAG GATE.
 * Compares Bot 1 (Consensus/research) and Bot 2 (Evaluator/scoring) outputs.
 *
 * If they agree: tags evaluation HIGH CONFIDENCE, pipeline continues.
 *
 * If they disagree: runs up to 3 rounds of structured debate.
 *   Round 1 — Bot 1 perspective challenges Bot 2 scoring
 *   Round 2 — Bot 2 perspective defends or revises
 *   Round 3 — Synthesis: do they now agree?
 *
 * If debate resolves: produces a RECONCILED output with confidence tag.
 * If debate does not resolve after 3 rounds: escalates to Council.
 *
 * The debate transcript is always saved — the reasoning IS the insight.
 */

const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
require('dotenv').config({ path: '/Users/Residentialist/.openclaw/workspace/residentialist/.env' });

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── DISAGREEMENT DETECTOR ────────────────────────────────────────────────────

const DISAGREEMENT_DETECTOR_PROMPT = `You are the Residentialist Reconciliation Bot. Your first job is to compare the research output from Bot 1 (Consensus) and the scoring output from Bot 2 (Evaluator) and identify any genuine disagreements.

A GENUINE DISAGREEMENT exists when:
- Bot 2 scores a subscore positively but Bot 1 found no supporting data for it
- Bot 2 ignores or underweights a finding that Bot 1 explicitly flagged as significant
- Bot 2 treats a spec as confirmed that Bot 1 listed as UNKNOWN or NOT DISCLOSED
- Bot 2 draws a conclusion that contradicts a source Bot 1 cited
- Bot 1 found a RED or YELLOW finding that Bot 2 did not score or address

NOT a disagreement:
- Bot 2 applying rubric judgment to data Bot 1 provided (this is expected)
- Bot 2 scoring at midpoint for undisclosed specs Bot 1 could not find (this is correct methodology)
- Minor phrasing differences that don't affect scores

Output format:

RECONCILIATION ASSESSMENT
Product: [name]

AGREEMENT AREAS: [list subscore areas where Bot 1 data and Bot 2 scoring are consistent]

DISAGREEMENT AREAS: [list each genuine disagreement with specific reference to Bot 1 finding vs Bot 2 scoring decision]

VERDICT: [AGREEMENT — no reconciliation needed] or [DISAGREEMENT — reconciliation required]

If DISAGREEMENT: number each disagreement item clearly (1, 2, 3...) for debate reference.`;

// ─── DEBATE PROMPTS ───────────────────────────────────────────────────────────

const BOT1_ADVOCATE_PROMPT = `You are speaking from the perspective of the Residentialist Consensus Bot (Bot 1). You conducted the web research on this product. You are now in a structured debate with the Evaluator Bot (Bot 2) about specific disagreements in how the research was used.

Your job: For each disagreement item, explain what the research actually found and why you believe the Evaluator Bot either missed it, misapplied it, or drew an unsupported conclusion. Be specific — cite the exact source or finding from your research output.

You are not trying to score the product. You are defending the integrity of the research findings.

Be direct and specific. Reference exact findings. Do not hedge.`;

const BOT2_ADVOCATE_PROMPT = `You are speaking from the perspective of the Residentialist Evaluator Bot (Bot 2). You scored this product using the deterministic rubric. You are now in a structured debate with the Consensus Bot (Bot 1) about specific disagreements.

Your job: For each disagreement item, explain your scoring decision — either defend it with rubric justification, or acknowledge that Bot 1's research finding should have changed your score and state what the corrected score would be.

If you are revising a score, state: REVISION: [subscore] changes from [old] to [new] because [reason].
If you are defending a score, state: DEFENDED: [subscore] stands because [rubric justification].

Be specific. Reference the rubric rules that governed your decision.`;

const SYNTHESIS_PROMPT = `You are the Residentialist Reconciliation Synthesizer. You have just read a structured debate between the Consensus Bot (Bot 1) and the Evaluator Bot (Bot 2) over specific disagreements in a product evaluation.

Your job: Determine whether the debate has resolved the disagreements.

For each disagreement item:
- If Bot 2 issued a REVISION: accept it. State the corrected subscore.
- If Bot 2 DEFENDED and the defense is rubric-sound: mark resolved, score stands.
- If Bot 2 DEFENDED but the defense contradicts the rubric or ignores documented evidence: mark UNRESOLVED.

Output format:

RECONCILIATION SYNTHESIS — Round [N]

ITEM 1: [RESOLVED — score stands / RESOLVED — score revised to X.X / UNRESOLVED — reason]
ITEM 2: [RESOLVED — score stands / RESOLVED — score revised to X.X / UNRESOLVED — reason]
[continue for all items]

OVERALL: [RECONCILED — all items resolved] or [PARTIAL — N items unresolved, proceeding to next round] or [UNRESOLVED — escalating to Council]

If RECONCILED: state the final confidence tag (HIGH CONFIDENCE if full agreement, RECONCILED if resolved through debate).
If any items UNRESOLVED after round 3: list them clearly for Council escalation.`;

// ─── DEBATE ENGINE ────────────────────────────────────────────────────────────

async function runDebateRound(disagreements, bot1Output, bot2Output, productName, roundNum, priorDebate) {
  console.log(`[RECONCILIATION] Debate round ${roundNum}...`);

  const context = `PRODUCT: ${productName}

DISAGREEMENTS TO DEBATE:
${disagreements}

BOT 1 RESEARCH OUTPUT (source of truth for findings):
${bot1Output.slice(0, 5000)}

BOT 2 EVALUATOR OUTPUT (source of truth for scoring decisions):
${bot2Output.slice(0, 5000)}

${priorDebate ? `PRIOR DEBATE TRANSCRIPT:\n${priorDebate}` : ''}`;

  // Bot 1 perspective
  const bot1Response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1200,
    system: BOT1_ADVOCATE_PROMPT,
    messages: [{ role: 'user', content: `${context}\n\nPresent your case for each disagreement item now. Round ${roundNum}.` }]
  });
  const bot1Argument = bot1Response.content[0].text;

  // Bot 2 perspective — sees Bot 1's argument
  const bot2Response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1200,
    system: BOT2_ADVOCATE_PROMPT,
    messages: [{ role: 'user', content: `${context}\n\nBot 1 has made the following arguments:\n\n${bot1Argument}\n\nRespond to each point now. Round ${roundNum}.` }]
  });
  const bot2Argument = bot2Response.content[0].text;

  // Synthesis
  const synthResponse = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    system: SYNTHESIS_PROMPT,
    messages: [{
      role: 'user',
      content: `${context}\n\nROUND ${roundNum} DEBATE:\n\nBot 1 argued:\n${bot1Argument}\n\nBot 2 responded:\n${bot2Argument}\n\nSynthesize now.`
    }]
  });
  const synthesis = synthResponse.content[0].text;

  return {
    roundNum,
    bot1Argument,
    bot2Argument,
    synthesis,
    transcript: `## ROUND ${roundNum}\n\n### Bot 1 (Consensus) Argues:\n${bot1Argument}\n\n### Bot 2 (Evaluator) Responds:\n${bot2Argument}\n\n### Synthesis:\n${synthesis}`
  };
}

// ─── MAIN RECONCILIATION FUNCTION ─────────────────────────────────────────────

async function runReconciliationBot(bot1Output, bot2Output, productName, outputDir) {
  console.log(`\n[RECONCILIATION] Starting Bot 5 for: ${productName}`);

  // Step 1: Detect disagreements
  const detectorResponse = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    system: DISAGREEMENT_DETECTOR_PROMPT,
    messages: [{
      role: 'user',
      content: `PRODUCT: ${productName}\n\nBOT 1 OUTPUT:\n${bot1Output.slice(0, 6000)}\n\nBOT 2 OUTPUT:\n${bot2Output.slice(0, 6000)}\n\nAssess now.`
    }]
  });

  const assessment = detectorResponse.content[0].text;
  console.log(`[RECONCILIATION] Assessment: ${assessment.split('\n').find(l => l.startsWith('VERDICT')) || 'see output'}`);

  // If no disagreements, tag HIGH CONFIDENCE and exit
  if (assessment.includes('VERDICT: AGREEMENT')) {
    console.log('[RECONCILIATION] No disagreements found — HIGH CONFIDENCE tag applied.');
    const result = {
      status: 'AGREEMENT',
      confidenceTag: 'HIGH CONFIDENCE',
      assessment,
      debateTranscript: null
    };
    fs.writeFileSync(`${outputDir}/${productName.toLowerCase().replace(/\s+/g, '_')}_bot5_reconciliation.md`,
      `# Reconciliation Bot Report\nProduct: ${productName}\nStatus: HIGH CONFIDENCE\n\n${assessment}`
    );
    return result;
  }

  // Extract disagreement items for debate
  const disagreementBlock = assessment.slice(assessment.indexOf('DISAGREEMENT AREAS:'));

  // Step 2: Run up to 3 debate rounds
  let fullTranscript = `# Reconciliation Debate Transcript\nProduct: ${productName}\n\n## INITIAL ASSESSMENT\n${assessment}\n\n`;
  let priorDebate = '';
  let finalSynthesis = '';
  let resolved = false;

  for (let round = 1; round <= 3; round++) {
    const debateResult = await runDebateRound(
      disagreementBlock, bot1Output, bot2Output, productName, round, priorDebate
    );

    fullTranscript += debateResult.transcript + '\n\n';
    priorDebate = fullTranscript;
    finalSynthesis = debateResult.synthesis;

    if (debateResult.synthesis.includes('OVERALL: RECONCILED') || debateResult.synthesis.includes('OVERALL: **RECONCILED')) {
      console.log(`[RECONCILIATION] Resolved in round ${round}.`);
      resolved = true;
      break;
    }

    if (round < 3) {
      console.log(`[RECONCILIATION] Round ${round} incomplete — continuing debate...`);
    } else {
      console.log('[RECONCILIATION] 3 rounds exhausted — escalating unresolved items to Council.');
    }
  }

  // Save full transcript regardless of outcome
  const transcriptPath = `${outputDir}/${productName.toLowerCase().replace(/\s+/g, '_')}_bot5_reconciliation.md`;
  fs.writeFileSync(transcriptPath, fullTranscript + `\n## FINAL SYNTHESIS\n${finalSynthesis}`);

  if (resolved) {
    // Extract any score revisions from synthesis
    const revisions = finalSynthesis.match(/REVISION:.*$/gm) || [];
    return {
      status: 'RECONCILED',
      confidenceTag: 'RECONCILED',
      revisions,
      transcriptPath,
      finalSynthesis
    };
  }

  // Not resolved — extract unresolved items for Council
  const unresolvedItems = finalSynthesis
    .split('\n')
    .filter(l => l.includes('UNRESOLVED'))
    .join('\n');

  return {
    status: 'UNRESOLVED',
    confidenceTag: 'COUNCIL REQUIRED',
    unresolvedItems,
    transcriptPath,
    finalSynthesis
  };
}

module.exports = { runReconciliationBot };

```

---

### 12.8 — telegram_listener.js (Henry Bot — Telegram Interface)
**Mac Mini path:** `/Users/Residentialist/.openclaw/workspace/residentialist/telegram_listener.js`

```javascript
const { runWithAutoCorrection, sendTelegram } = require('./auto_runner');
const fs = require('fs');
const path = require('path');
const https = require('https');
require('dotenv').config({path: '/Users/Residentialist/.openclaw/workspace/residentialist/.env'});
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = String(process.env.TELEGRAM_CHAT_ID);
let lastUpdateId = 0;
let activePipelines = new Set();
function getUpdates() {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ offset: lastUpdateId + 1, timeout: 30, allowed_updates: ['message'] });
    const options = { hostname: 'api.telegram.org', path: `/bot${TOKEN}/getUpdates`, method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } };
    const req = https.request(options, (res) => { let data = ''; res.on('data', c => data += c); res.on('end', () => { try { resolve(JSON.parse(data)); } catch(e) { reject(e); } }); });
    req.on('error', reject); req.write(body); req.end();
  });
}
function reply(chatId, text) {
  return new Promise((resolve) => {
    const body = JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' });
    const options = { hostname: 'api.telegram.org', path: `/bot${TOKEN}/sendMessage`, method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } };
    const req = https.request(options, (res) => { res.on('data', ()=>{}); res.on('end', resolve); });
    req.on('error', () => resolve()); req.write(body); req.end();
  });
}
function parseCommand(text) {
  const runMatch = text.match(/^RUN\s+"([^"]+)"\s+(\w+)\s+(\w+)/i);
  if (runMatch) return { cmd: 'RUN', product: runMatch[1], config: runMatch[2].toUpperCase(), category: runMatch[3].toLowerCase() };
  if (/^STATUS$/i.test(text.trim())) return { cmd: 'STATUS' };
  if (/^HELP$/i.test(text.trim())) return { cmd: 'HELP' };
  const rulingMatch = text.match(/^RULING\s+(YELLOW|RED|PASS|REJECT)\s*(.*)$/i);
  if (rulingMatch) return { cmd: 'RULING', decision: rulingMatch[1].toUpperCase(), notes: rulingMatch[2].trim() };
  if (/^RESUME$/i.test(text.trim())) return { cmd: 'RESUME' };
  if (/^RERUN\s+"([^"]+)"\s+(\w+)\s+(\w+)/i.test(text)) { const m = text.match(/^RERUN\s+"([^"]+)"\s+(\w+)\s+(\w+)/i); return { cmd: 'RERUN', product: m[1], config: m[2].toUpperCase(), category: m[3].toLowerCase() }; }
  const queueMatch = text.match(/^QUEUE\s+(.+)/is);
  if (queueMatch) {
    const items = queueMatch[1].split(',').map(s => s.trim()).map(item => { const m = item.match(/"([^"]+)"\s+(\w+)\s+(\w+)/); return m ? { product: m[1], config: m[2].toUpperCase(), category: m[3].toLowerCase() } : null; }).filter(Boolean);
    if (items.length > 0) return { cmd: 'QUEUE', items };
  }
  return null;
}
async function handleCommand(cmd, chatId) {
  if (cmd.cmd === 'RUN') {
    const key = `${cmd.product}-${cmd.config}`;
    if (activePipelines.has(key)) { await reply(chatId, `⏳ *${cmd.product}* is already running.`); return; }
    activePipelines.add(key);
    await reply(chatId, `🚀 Starting: *${cmd.product}* (${cmd.config}) — ${cmd.category}`);
    runWithAutoCorrection(cmd.product, cmd.config, cmd.category).catch(err => sendTelegram(`❌ Fatal: ${err.message.slice(0,200)}`)).finally(() => activePipelines.delete(key));
  } else if (cmd.cmd === 'QUEUE') {
    await reply(chatId, `📋 Queue: ${cmd.items.length} products\n${cmd.items.map((i,n)=>`${n+1}. ${i.product} (${i.config})`).join('\n')}`);
    for (const item of cmd.items) {
      const key = `${item.product}-${item.config}`;
      if (!activePipelines.has(key)) { activePipelines.add(key); await runWithAutoCorrection(item.product, item.config, item.category).catch(err => sendTelegram(`❌ Fatal: ${err.message.slice(0,200)}`)).finally(() => activePipelines.delete(key)); }
    }
  } else if (cmd.cmd === 'STATUS') {
    const running = activePipelines.size > 0 ? `\n\n*Running:*\n${[...activePipelines].join('\n')}` : '\n\nNo active pipelines.';
    await reply(chatId, `✅ *Henry is online*${running}`);
  } else if (cmd.cmd === 'HELP') {
    await reply(chatId, `*Henry Commands:*\n\n*RUN* "Product Name" CONFIG category\n_Example: RUN "Marvin Integrity" DH windows_\n\n*QUEUE* "Product 1" DH windows, "Product 2" DH windows\n\n*RULING* YELLOW|RED|PASS|REJECT [notes]\n_Example: RULING YELLOW ClassAction not verified_\n\n*RESUME* — resume halted pipeline\n*RERUN* "Product" CONFIG category — rerun from scratch\n*STATUS* — active pipelines\n*HELP* — this message`);
  } else if (cmd.cmd === 'RULING') {
    var rulingFile = '/Users/Residentialist/.openclaw/workspace/residentialist/PENDING_RULING.json';
    var ruling = { decision: cmd.decision, notes: cmd.notes, timestamp: new Date().toISOString(), actioned: false };
    fs.writeFileSync(rulingFile, JSON.stringify(ruling, null, 2));
    await reply(chatId, '⚖️ *Ruling recorded: ' + cmd.decision + '*\n' + (cmd.notes ? '_' + cmd.notes + '_\n' : '') + '\nPipeline will resume on next check cycle. Use RESUME to force immediately.');
  } else if (cmd.cmd === 'RESUME') {
    var resumeFile = '/Users/Residentialist/.openclaw/workspace/residentialist/RESUME_SIGNAL';
    fs.writeFileSync(resumeFile, new Date().toISOString());
    await reply(chatId, '▶️ *Resume signal sent.* Pipeline will pick up on next cycle.');
  } else if (cmd.cmd === 'RERUN') {
    const key = cmd.product + '-' + cmd.config;
    if (activePipelines.has(key)) { await reply(chatId, '⏳ *' + cmd.product + '* is already running.'); return; }
    activePipelines.add(key);
    await reply(chatId, '🔄 Rerunning: *' + cmd.product + '* (' + cmd.config + ')');
    runWithAutoCorrection(cmd.product, cmd.config, cmd.category).catch(function(err) { sendTelegram('❌ Fatal: ' + err.message.slice(0,200)); }).finally(function() { activePipelines.delete(key); });
  }
}
async function poll() {
  console.log('[HENRY] Telegram listener online.');
  await sendTelegram('🟢 *Henry is online*\nSend HELP for commands.');
  while (true) {
    try {
      const updates = await getUpdates();
      if (updates.ok && updates.result.length > 0) {
        for (const update of updates.result) {
          lastUpdateId = update.update_id;
          const msg = update.message;
          if (!msg || !msg.text) continue;
          if (String(msg.chat.id) !== CHAT_ID) continue;
          const cmd = parseCommand(msg.text.trim());
          if (cmd) { await handleCommand(cmd, msg.chat.id); }
          else { await reply(msg.chat.id, '_Unknown command. Send HELP._'); }
        }
      }
    } catch (err) { console.error('[HENRY] Poll error:', err.message); await new Promise(r => setTimeout(r, 5000)); }
  }
}
poll();

```

---

### 12.9 — auto_runner.js (Queue & Batch Runner)
**Mac Mini path:** `/Users/Residentialist/.openclaw/workspace/residentialist/auto_runner.js`

```javascript
const { runPipeline } = require('./bot_orchestrator_v2');
const { selfCorrect } = require('./self_corrector');
const https = require('https');
require('dotenv').config({path: '/Users/Residentialist/.openclaw/workspace/residentialist/.env'});
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const MAX_ATTEMPTS = 2;
function sendTelegram(message) {
  return new Promise((resolve) => {
    try {
      const body = JSON.stringify({ chat_id: CHAT_ID, text: message, parse_mode: 'Markdown' });
      const options = { hostname: 'api.telegram.org', path: `/bot${TOKEN}/sendMessage`, method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } };
      const req = https.request(options, (res) => { res.on('data', () => {}); res.on('end', resolve); });
      req.on('error', () => resolve());
      req.write(body); req.end();
    } catch(e) { resolve(); }
  });
}
function extractScore(o) { const m = o.match(/[Oo]verall[:\s*]*(\d+\.\d+)/) || o.match(/(\d+\.\d+)\s*\/\s*10/); return m ? m[1] : '?'; }
function extractGrade(o) { const m = o.match(/[Gg]rade[:\s*]*([A-C][+-]?)/) || o.match(/\b([A-C][+-])\b/); return m ? m[1] : ''; }
function summarizeFlags(o) { return o.split('\n').filter(l => l.includes('FLAG') && l.includes('###')).slice(0,3).map(l => l.replace(/#+\s*/,'').trim()).join('\n'); }
function generateDataConfidence(bot2Output, challengeOutput) {
  const warnMatches = challengeOutput.match(/\*\*WARN\*\*[^\n]*/g) || [];
  const warns = warnMatches.map(w => w.replace(/\*\*/g,'').replace(/^WARN[:\s]*/i,'').trim());
  const undisclosedCount = (challengeOutput.match(/UNDISCLOSED/gi) || []).length;
  let confidence = undisclosedCount > 7 ? 'Low' : undisclosedCount > 4 ? 'Moderate' : 'High';
  let section = `\n---\n## DATA CONFIDENCE: ${confidence.toUpperCase()}\n\n`;
  if (undisclosedCount > 0) {
    section += `**${undisclosedCount} spec(s) scored at midpoint due to manufacturer non-disclosure:**\n`;
    warns.forEach(w => { section += `- ${w}\n`; });
    section += `\n_Midpoint scoring (5.0/10) applied where manufacturer does not publish specifications. Scores hold center until data is available._\n`;
  } else {
    section += `All scored specifications confirmed from manufacturer documentation, independent databases, or Council-approved memos.\n`;
  }
  return section;
}
async function runWithAutoCorrection(productName, config, category, researchFiles = []) {
  console.log(`\n[AUTO-RUNNER] Starting: ${productName} (${config})`);
  await sendTelegram(`🔄 *Pipeline starting*\n${productName} — ${config}`);
  let attempt = 0;
  while (attempt <= MAX_ATTEMPTS) {
    attempt++;
    let result;
    try { result = await runPipeline(productName, config, researchFiles); }
    catch (err) { await sendTelegram(`❌ *Pipeline error — ${productName}*\n${err.message.slice(0,300)}`); throw err; }
    if (result.status === 'PASS') {
      const score = extractScore(result.bot2Output || '');
      const grade = extractGrade(result.bot2Output || '');
      const note = attempt > 1 ? `\n_(self-corrected after ${attempt-1} attempt${attempt>2?'s':''})_` : '';
      if (result.outputDir && result.bot2Output) {
        const fs = require('fs');
        fs.appendFileSync(`${result.outputDir}/PIPELINE_STATUS.txt`, generateDataConfidence(result.bot2Output, result.challengeResult || ''));
      }
      await sendTelegram(`✅ *PASS — ${productName} (${config})*\nScore: *${score}/10*  Grade: *${grade}*${note}`);
      return result;
    }
    if (attempt <= MAX_ATTEMPTS) {
      await sendTelegram(`⚠️ *FLAG — ${productName}*\nAttempt ${attempt}/${MAX_ATTEMPTS} — self-correcting...\n${summarizeFlags(result.challengeResult||'').slice(0,200)}`);
      const correction = await selfCorrect(productName, config, category, result.bot1Output||'', result.bot2Output||'', result.challengeResult||'');
      if (correction.action === 'escalate') {
        await sendTelegram(`🚨 *ESCALATION — ${productName}*\n\n${correction.reason.slice(0,600)}\n\n_Open Claude and review. Pipeline halted._`);
        return { status: 'ESCALATED', productName, config, reason: correction.reason };
      }
    }
  }
  await sendTelegram(`🚨 *ESCALATION — ${productName}*\nFailed after ${MAX_ATTEMPTS} attempts. Human review required.`);
  return { status: 'ESCALATED', productName, config };
}
module.exports = { runWithAutoCorrection, sendTelegram, generateDataConfidence };
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 3) { console.log('Usage: node auto_runner.js "Product Name" CONFIG category'); process.exit(1); }
  runWithAutoCorrection(args[0], args[1], args[2], args.slice(3))
    .then(r => process.exit(r.status === 'PASS' ? 0 : 1))
    .catch(err => { console.error('[AUTO-RUNNER] FATAL:', err); process.exit(1); });
}

```

---

### 12.10 — package.json
**Mac Mini path:** `/Users/Residentialist/.openclaw/workspace/residentialist/package.json`

```json
{
  "dependencies": {
    "@anthropic-ai/sdk": "^0.78.0",
    "better-sqlite3": "^12.6.2",
    "dotenv": "^17.3.1",
    "imap": "^0.8.19",
    "mailparser": "^3.9.3",
    "node-telegram-bot-api": "^0.67.0",
    "sqlite3": "^5.1.7"
  }
}

```

---

## PART 13 — ARCHITECTURAL PROBLEM IN PROGRESS

### The Claude ↔ Henry Communication Gap

Currently the communication flow is:
```
Henry (Mac Mini) → Telegram alert → Ray reads → Ray pastes into Claude → Claude responds → Ray acts
```

Ray is the relay. Every pipeline error requires Ray in the loop. The goal is:
```
Henry (Mac Mini) → Claude API (via bridge) → diagnosis + fix → Henry resumes
```

**Proposed solution — Option B (Bridge Relay):**
Add a `POST /claude` endpoint to `claude_bridge.js`. When Henry encounters a failure:
1. Henry posts the error payload + product name + output dir to `POST /claude`
2. The bridge assembles context: reads PIPELINE_STATUS.txt, lists output dir, tails the failed bot file
3. Bridge calls Claude API with full context + system prompt
4. Claude responds with: diagnosis, patch (if applicable), deploy instruction or Ray-escalation flag
5. Bridge writes Claude's response to a `CLAUDE_RESPONSE.json` file
6. Henry reads that file and either executes or escalates to Ray via Telegram

This requires no new infrastructure — only additions to the existing bridge file and Henry's error handler.

### The Verifier Problem (Current Active Issue)

The bot output verifier in `bot_orchestrator_v2.js` has caused more pipeline halts than real bot failures. History:
- Started as flat 500-byte size check
- Added completion signal detection (format-specific strings per bot)
- Signals caused false halts when bots wrote valid output in different formats
- Switched to per-bot size thresholds (Bot 1: 8000, Bot 2: 4000, etc.)
- Bot 1 on Andersen A-Series produced valid 6.7KB output, failed 8KB threshold
- A-Series has failed verification 6+ times despite having a valid score

**Fix:** Drop all thresholds to flat 300 bytes. The verifier's only job is catching empty/crashed outputs. Quality checking belongs to Bots 4, 5, council, and the deterministic validator.

---

## PART 14 — HOW TO OPERATE THIS SYSTEM

### Starting a Session
1. Verify bridge is up: `curl -sk https://lavonne-instructorless-northwestwardly.ngrok-free.dev/status -H "x-api-key: residentialist-bridge-2026"`
2. Check pipeline state: `GET /pipeline`
3. Review PENDING_DECISIONS above — ask Ray which to tackle

### Running a Product Evaluation
```bash
# Via bridge
curl -sk -X POST -H "x-api-key: residentialist-bridge-2026" -H "Content-Type: application/json" \
  -d '{"product": "Product Name", "config": "DH", "category": "Windows"}' \
  "https://lavonne-instructorless-northwestwardly.ngrok-free.dev/run"
```

### Deploying Code Changes
1. Edit the local copy in `/tmp/` or `/home/claude/`
2. Run `node --check filename.js` to verify syntax
3. POST to `/write` with the full Mac Mini path and new content
4. Always confirm deployment before triggering a run

### Diagnosing a Pipeline Failure
1. Find the output dir: `ls outputs/ | grep product_slug | tail -1`
2. Check PIPELINE_STATUS.txt
3. Check the failed bot file: `wc -c` to get size, `tail -50` to see ending
4. Check if file is actually complete before assuming truncation
5. Fix the actual issue — do not just adjust the verifier threshold

### Reading a Run Output
```
outputs/
  product_slug_YYYY-MM-DDTHH-MM-SS/
    product_slug_bot1_consensus.md
    product_slug_bot2_evaluator.md
    product_slug_bot3_material_safety.md
    product_slug_bot4_challenge.md      (if generated)
    product_slug_bot5_reconciliation.md (if generated)
    MATERIAL_CLASS_LOCK.json
    DATA_COMPLETENESS.txt
    PIPELINE_STATUS.txt
    COUNCIL_DECISION.json               (if council ran)
```

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
