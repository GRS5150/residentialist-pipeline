# HVAC Category — Phase 1 Research Queries
## Scope: Central Air Conditioners & Heat Pumps (Split Systems)
### Created April 1, 2026

**Run with:** `node scripts/run_research.js hvac`

**Scope:** Residential central air conditioning and heat pump systems (split systems — outdoor condenser/heat pump unit + indoor air handler/evaporator coil). NOT furnaces (separate category), NOT mini-splits/ductless (separate category), NOT packaged/rooftop units, NOT window units, NOT portable AC. The outdoor unit is the scored product. Indoor air handlers scored separately only if they meaningfully differ within a brand family.

**Output files:**
- `knowledge/hvac/hvac_testing_framework.md` (Pass 1)
- `knowledge/hvac/hvac_component_analysis.md` (Pass 2)
- `knowledge/hvac/hvac_hierarchy_top.md` (Pass 3)
- `knowledge/hvac/hvac_hierarchy_bottom.md` (Pass 4)

---

## Pass 1 — Testing Landscape

**Purpose:** Discover what gets measured, who measures it, where the scores live.

**Run in:** Perplexity Deep Research

```
Who independently tests residential central air conditioners and heat pumps, and what do they measure?

I'm building a product intelligence platform that scores residential central AC and heat pump systems (split systems only — outdoor condenser + indoor air handler) on Quality, Performance, Durability, and Material Safety. I need to understand the testing landscape before I score anything.

Specifically:

1. What standardized tests and ratings exist for residential central AC and heat pump systems? I need the full standards landscape:
   - AHRI certification and what it actually tests (Standard 210/240 for cooling, 340/360 for commercial, AHRI 210/240-2023 with SEER2/EER2/HSPF2 transition)
   - DOE test procedures (10 CFR 430 Appendix M/M1 — what changed between SEER and SEER2?)
   - ENERGY STAR specifications and version history for central AC and heat pumps (what qualifies? CEE tiers?)
   - ASHRAE standards (15, 34 for refrigerants; 90.1 for efficiency baselines)
   - UL/CSA safety standards (UL 1995, CSA C22.2)
   - ACCA Manual J/S/D (load calculation, equipment selection, duct design) — how do these affect real-world performance vs rated performance?
   - ARI 270 for sound rating (what does the sound rating number actually measure, and how does it differ from dBA at the unit?)

2. What are the measurable performance specs with real numeric spread across brands? I need continuous metrics, not binary pass/fail. What specs create meaningful differentiation between premium and builder-grade?
   - SEER2 range across current products (what's the real spread — minimum code 14.3 up to what maximum?)
   - HSPF2 for heat pumps (what's the spread?)
   - EER2 (peak cooling efficiency — does this differentiate more than SEER2 at the top?)
   - Sound rating (dBA at outdoor unit — what's the range from quietest variable-speed to loudest single-stage?)
   - Heating capacity at 47°F and at 17°F (for heat pumps — how much does capacity drop and does it vary by brand/technology?)
   - COP at various outdoor temperatures (coefficient of performance — what's the real spread between brands?)
   - Minimum operating temperature (for heat pumps — some work to -13°F, some stop at 0°F. Massive differentiation.)
   - Static pressure capability (does max ESP vary meaningfully between brands?)
   - Refrigerant charge sensitivity (how much does performance degrade with improper charge — does this vary by expansion device type?)

3. Who does independent comparative testing? (Consumer Reports, any independent labs, HVAC trade publications doing side-by-side testing or teardowns, YouTube channels doing refrigerant-side analysis)

4. What reliability data exists in the public domain? (Any service rate databases like Yale Appliance has for kitchen appliances? Repair tech consensus from r/HVAC? Manufacturer-published warranty claim rates? Any J.D. Power or equivalent satisfaction/reliability studies for HVAC brands?)

5. What are the key construction differentiators between premium and builder-grade central AC/heat pump systems?
   - Compressor type (single-stage fixed-speed, two-stage, variable-speed/inverter) — who makes the compressors? (Copeland/Emerson, Danfoss, Mitsubishi, Bristol/NIDEC, Tecumseh, proprietary)
   - Condenser coil construction (copper tube/aluminum fin, all-aluminum microchannel, spine fin) — what are the durability and serviceability tradeoffs?
   - Expansion device (fixed orifice, TXV thermostatic expansion valve, EEV electronic expansion valve) — which brands use which?
   - Cabinet construction (galvanized steel, louvered fins vs mesh guard, powder coat quality, base pan drainage)
   - Fan motor (PSC, ECM, variable-speed brushless DC)
   - Control board sophistication (basic relay, communicating/proprietary protocol, open standard)

6. Are there any independent reviewers doing physical teardowns or side-by-side component analysis of central AC/heat pump systems — someone doing the equivalent of what StarCraft Reviews does for faucets? Any HVAC YouTube channels that go inside the units and compare components at the part level?

Focus on sources that a product rating organization could cite with confidence. Skip marketing materials and manufacturer claims. I need the testing infrastructure, not the sales pitch.
```

---

## Pass 2 — Component Deep Dive

**Purpose:** Go inside the machines. Name the component suppliers, map the platform sharing, understand the failure modes at part level.

**Run in:** Perplexity Deep Research

```
I'm building an independent product intelligence platform that scores residential central air conditioners and heat pumps at the component level. I've already mapped the testing landscape and brand hierarchy. Now I need to understand the actual components inside these products — who makes them, how they differ, and what fails. Split systems only (outdoor condenser/heat pump + indoor air handler).

COMPRESSORS:
- Who manufactures the compressors in each major residential brand?
  - Carrier/Bryant: Copeland scroll (which specific models — ZP vs ZPK vs ZPD for variable-speed?)
  - Trane/American Standard: Copeland or proprietary Climatuff? Which models exactly?
  - Lennox: Copeland? Danfoss? Both depending on line?
  - Goodman/Amana/Daikin: Which compressor in each product line? When Daikin acquired Goodman, did they switch to Daikin compressors or keep Copeland?
  - Rheem/Ruud: Copeland or Bristol/NIDEC? Which specific models?
  - York/Johnson Controls: Which compressor supplier?
  - Bosch IDS/Climate 5000: Inverter compressor — who makes it?
  - MRCOOL/MrCool: Who supplies their compressors?
- For variable-speed/inverter units: which brands use true DC inverter compressors vs modulating compressors? What's the actual technical difference?
- Copeland scroll market share: Do they supply 60%+ of the residential market? Which brands DON'T use Copeland?
- Documented compressor failure modes by type: scroll tip seal wear, liquid slugging damage, internal relief valve failure — which are most common and brand-specific?
- Compressor lifespan data: MTBF or median years to failure by compressor type (single-stage scroll vs two-stage vs inverter)

CONDENSER COILS:
- Copper tube/aluminum fin (traditional) vs all-aluminum microchannel — which brands use which?
  - Carrier: Switched to microchannel on some lines — which ones? (Infinity? Performance? Both?)
  - Lennox: Some microchannel — which lines?
  - Trane: Spine Fin coil technology — how is it different from standard copper/aluminum? Performance vs durability tradeoff?
  - Goodman/Daikin: Traditional copper/aluminum across the board, or any microchannel?
  - Rheem: Any microchannel adoption?
- Microchannel reliability: What do repair techs say about microchannel coil durability vs traditional? Corrosion issues in coastal/chemical environments? Repair vs replace economics?
- Coil coating/corrosion protection: WeatherShield, Quantum coil, BlueShield — which brands use which coatings? Do they meaningfully extend coil life?

EXPANSION DEVICES:
- Fixed orifice (piston) vs TXV vs EEV — which brands use which on which product lines?
- Does expansion device type meaningfully affect real-world efficiency and reliability?
- TXV failure modes: sensing bulb migration, power head failure — how common?
- EEV advantages for variable-speed systems — is EEV required for true variable-speed, or do some use TXV?

CONTROL BOARDS & COMMUNICATING SYSTEMS:
- Carrier: Infinity communicating system — proprietary protocol. What does it actually control? Which board is the brain?
- Trane: ComfortLink II — proprietary protocol. Same questions.
- Lennox: iComfort — proprietary protocol. Same questions.
- Goodman: ComfortBridge or ComfortNet — how does this compare to Carrier/Trane/Lennox communicating?
- York: Hx3 communicating — same depth.
- Which brands lock you into proprietary thermostats vs allowing standard 24V thermostat wiring?
- Control board failure modes: which brands have documented board failures? Power surge sensitivity? Moisture intrusion?

FAN MOTORS:
- PSC (permanent split capacitor) vs ECM (electronically commutated motor) vs variable-speed — which brands use which?
- ECM efficiency advantage (65-75% efficiency vs PSC 40-50%) — consistent across brands?
- Who manufactures the fan motors? (Regal Rexnord/GE Industrial, Nidec, Broad-Ocean, proprietary)
- Fan blade design: which brands use composite vs stamped steel? Does it matter for noise and efficiency?

PLATFORM SHARING — SPECIFIC COMPONENT MAP:
- Carrier/Bryant/Heil/International Comfort Products (ICP) family: Which components are identical? Carrier Infinity vs Bryant Evolution — same compressor, same board, different badge?
- Trane/American Standard family: Which components differ between Trane XV and American Standard AccuComfort? Same unit, different badge?
- Goodman/Amana/Daikin family: Since Daikin acquired Goodman (2012), which Daikin technology has migrated into Goodman/Amana? Are Daikin Fit/DX-Series substantially different from Goodman/Amana at the component level?
- Rheem/Ruud family: Same unit, different distribution channel (Rheem = contractor, Ruud = wholesale/supply house)?
- York/Coleman/Luxaire/Champion/Johnson Controls: Which are badge-engineered from the same platform?
- Lennox: Does Lennox badge-engineer from anyone, or is everything their own platform?

PARTS & SERVICE ECOSYSTEM:
- Which brands have parts widely stocked at independent distributors vs proprietary distribution?
- Carrier: Available everywhere? Or Carrier-certified distributor only for certain parts?
- Lennox: Known for proprietary distribution — how restrictive is it really?
- Goodman: GEMAIRE + independent distribution — broadest parts availability?
- Parts pricing: Are replacement coils, control boards, compressors similarly priced across brands, or are some dramatically more expensive?
- Refrigerant transition: R-410A phase-down timeline. Which brands have already transitioned to R-454B (A2L mildly flammable)? Which are still selling R-410A units? Does this affect the buyer (service availability, future refrigerant cost)?

Prioritize sources from: HVAC repair technician communities (r/HVAC, HVAC-Talk), teardown videos, component manufacturer spec sheets, parts distributor catalogs (Carrier Enterprise, Ferguson, Johnstone Supply), trade publications (ACHR News, HPAC Engineering, The NEWS). Cite all sources.
```

---

## Pass 3 — Competitive Hierarchy: Top

**Purpose:** Establish where the top brands sit relative to each other.

**Run in:** Perplexity (sonar-pro)

```
How do HVAC professionals rank the top residential central air conditioner and heat pump brands against each other?

Specifically comparing Carrier Infinity, Trane XV/XR, Lennox XC/SL series, Daikin DX-series, Bosch IDS 2.0/Climate 5000, and any other brands that professionals consider top-tier for residential split systems.

I need to understand:

1. Variable-speed/inverter hierarchy: Among the brands offering true variable-speed central units (Carrier Greenspeed/Infinity, Trane XV20i, Lennox SL28XCV, Daikin DX20VC, Bosch IDS 2.0) — which do HVAC contractors and installers actually prefer and why? What separates the best variable-speed central system from the merely good?

2. Two-stage hierarchy: Among two-stage units (Carrier Performance, Trane XR17, Lennox XC17, etc.) — how do contractors rank these against each other? Is two-stage meaningfully better than single-stage for comfort, or is the jump to variable-speed the only one that matters?

3. Reliability rankings from professionals: Which top-tier brand do repair technicians see the fewest callbacks on? Which brands' variable-speed technology has the most field complaints? Are inverter boards a reliability concern for any specific brand?

4. Heat pump specific: For the heat pump versions of these top units — which brands have the best cold-weather performance? Which ones maintain capacity best as outdoor temp drops? Is the Carrier Infinity heat pump or Trane XV20i heat pump meaningfully better than the other in heating mode?

5. Installation quality sensitivity: Which brands are most forgiving of mediocre installation, and which require a skilled installer to deliver on their rated performance? This matters because the product is only as good as the installation.

6. Warranty comparison: Compare warranty terms at the top tier — compressor warranty (5, 10, 12 years), parts warranty, labor warranty. Which brands have the most contractor-friendly warranty process vs which brands fight claims?

7. The Lennox question: Lennox has a reputation for being the most technologically advanced (lowest SEER2 units, quietest operation) but also the most proprietary and expensive to service. How do contractors reconcile this? Do they recommend Lennox to homeowners despite the proprietary ecosystem, or steer them away?

Focus on professional installer opinions, independent service/reliability data, and construction-level differences — not marketing claims. What do HVAC professionals who install and service these products daily say about relative quality?
```

---

## Pass 4 — Competitive Hierarchy: Middle and Bottom

**Purpose:** Establish where the line falls between good and mediocre, and what sits at the floor.

**Run in:** Perplexity (sonar-pro)

```
Where do HVAC professionals draw the line between a good residential central air conditioner/heat pump and a mediocre one? Which brands sit on that line?

Specifically: How do professionals rank Goodman, Amana, Rheem, Ruud, York, Coleman, Heil, Tempstar, Comfortmaker, Day & Night, Payne, MRCOOL, and any other mid-to-low-tier central AC and heat pump brands in the professional hierarchy?

I need:

1. The Goodman/Amana question: Goodman is the volume king and now Daikin-owned. HVAC techs historically dismissed Goodman as "builder-grade throwaway." Has Daikin ownership (since 2012) meaningfully improved quality? Are current Goodman units genuinely better than pre-acquisition Goodman? Do contractors recommend Goodman now, or is the stigma still warranted? What about Amana — is it just Goodman with a different nameplate and better warranty?

2. Rheem/Ruud positioning: Where do contractors place Rheem in the hierarchy? Is Rheem the "Toyota Camry" of HVAC — not exciting but reliable? Or does Rheem have known quality issues? Rheem vs Goodman — which do contractors prefer and why? What about the Rheem Classic vs Prestige line — meaningful difference or badge engineering?

3. York/Johnson Controls: York Professional and York Residential — where do these sit? Johnson Controls also owns Coleman, Luxaire, Champion — are these all badge-engineered from the same platform? Do contractors view York as competitive with Carrier/Trane/Lennox, or a step below?

4. The ICP brands (Carrier family second tier): Heil, Tempstar, Comfortmaker, Day & Night, Payne — all International Comfort Products (ICP), owned by Carrier Global. How much Carrier DNA is in these units? Are they previous-generation Carrier platforms or completely different designs? Do contractors treat them as "Carrier for less money" or "not really Carrier"?

5. The builder-grade reality: In high-volume new construction ($300K-600K homes), which brands do builders actually install? Is it overwhelmingly Goodman, or do some builders use Carrier/Trane entry lines? What's the typical system in a $1M+ new build vs a $400K tract home?

6. MRCOOL and direct-to-consumer: MRCOOL is selling DIY central units through Home Depot. Are these taken seriously by HVAC professionals? Is the product genuinely competent or is it a liability? Who actually manufactures MRCOOL units?

7. Reliability at the bottom: Which brands do repair technicians see the MOST problems with? Which brands have the highest first-year callback rates? Are there brands that professionals actively refuse to install or service?

8. The "good enough" line: Where does the professional hierarchy draw the line between "acceptable for a quality home" and "builder-grade filler that will need replacing in 8-10 years"? Is there a price floor below which you're guaranteed mediocre equipment?

9. Parts availability and service: Which mid-tier brands have the best parts availability at supply houses? Which have the worst? Does proprietary vs open parts ecosystem affect the contractor's willingness to recommend a brand?

10. The warranty trap: Goodman/Amana offers lifetime compressor warranty. Is this genuinely valuable, or is it a marketing gimmick that's hard to actually claim? How does the warranty experience compare across mid-tier brands?

Focus on the line between "good enough for a quality home" and "builder-grade filler." What brands do HVAC contractors refuse to specify? What brands do repair techs see frequent problems with?
```

---

# EXECUTION NOTES

## Run Order

Run all 4 queries via `node scripts/run_research.js hvac`:
1. Pass 1 — Testing Landscape (sonar-deep-research)
2. Pass 2 — Component Deep Dive (sonar-deep-research)
3. Pass 3 — Hierarchy Top (sonar-pro)
4. Pass 4 — Hierarchy Bottom (sonar-pro)

## Post-Research Decisions (Phase 2)

After all 4 passes reviewed:
1. **Confirm spec fields** with continuous metrics from Pass 1-2
2. **Identify Pool S candidate** (if one exists — may be vacant like cabinets)
3. **Assign source pools** (S/A/B/C)
4. **Set axis weights** — likely Durability dominant (Q=0.30, D=0.40, P=0.30) like dishwashers/refrigerators, since the professional hierarchy organizes around "which ones break"
5. **Confirm calibration products** from Pass 3-4 hierarchy
6. Build `configs/hvac.json` and `calibration/hvac/config.json`
7. Build `templates/prompt_b_hvac.md` using named components from Pass 2

## Calibration Product Candidates (Confirm After Research)

| Product | Expected Tier | Type | Notes |
|---|---|---|---|
| Carrier Infinity 24VNA (variable-speed) | Tier 1 | Heat pump / AC | Greenspeed Intelligence, Copeland variable scroll, top of Carrier line |
| Trane XV20i / XV18 (variable-speed) | Tier 1 | Heat pump / AC | TruComfort variable-speed, professional anchor |
| Lennox SL28XCV / XC25 (variable-speed) | Tier 2 | AC | Most efficient on paper, proprietary ecosystem concern |
| Rheem Prestige RA20 (two-stage) | Tier 3 | AC | Mid-tier quality anchor, mainstream brand |
| Goodman GSXC18 / GSZC18 (two-stage) | Tier 3 | AC / Heat pump | Daikin-owned, high-volume, post-acquisition quality test |
| Goodman GSX14 / Builder-grade single-stage | Tier 4 | AC | Builder-grade floor, single-stage, fixed orifice |

**Note:** Research may reveal Daikin, Bosch, or York should replace one of these. Adjust after reviewing Pass 3-4.

---

*Draft April 1, 2026. Run before building config.*
