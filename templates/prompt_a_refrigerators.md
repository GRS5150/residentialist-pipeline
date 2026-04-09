# The Residentialist — Refrigerator Category Research Queries
## Built-In Only — No Freestanding, No Counter-Depth Freestanding
### Created March 31, 2026

---

## Naming Convention

- `prompt_a_{category}.md` = Research queries (Pass 1-4, run before any product is scored)
- `prompt_b_{category}.md` = Per-product deep dive prompts (run after config is built)

Study completed category query files before drafting new ones. The specificity level in these queries — naming component suppliers, referencing known platform sharing, asking about specific failure modes — is the standard. Generic placeholder queries produce generic results.

---

## Pass 1 — Landscape Survey (Query 1)

**Purpose:** Discover what gets measured, who measures it, where the scores live.

```
Who independently tests residential built-in refrigerators and what do they measure?

I'm building a product intelligence platform that scores residential built-in refrigerators on Quality, Performance, Durability, and Material Safety. I need to understand the testing landscape before I score anything. Built-in only — no freestanding, no counter-depth freestanding.

Specifically:

1. What standardized tests exist for residential built-in refrigerators? (DOE energy testing, AHAM HRF-1, UL/CSA, ENERGY STAR, any relevant ASTM or IEC standards)

2. What are the measurable performance specs with real numeric spread across brands? I need continuous metrics, not binary pass/fail. What specs create meaningful differentiation between premium built-in (Sub-Zero, True) and entry built-in (Bosch Benchmark, Dacor)? Think: temperature stability, recovery time after door open, humidity control, energy consumption, noise levels, usable vs total capacity.

3. Who does independent comparative testing? (Consumer Reports, Reviewed.com, Yale Appliance reliability data, any labs doing side-by-side built-in testing or teardowns)

4. What reliability data exists in the public domain? (Yale Appliance service rates for built-in brands, J.D. Power appliance studies, repair tech consensus from r/appliancerepair, any manufacturer-published MTBF or warranty claim rates)

5. What are the key construction differentiators between premium built-in and entry built-in refrigerators? (compressor type and count, sealed system design, cabinet/liner materials, insulation type and thickness, hinge engineering, ice maker construction, air management systems, control board sophistication)

6. Are there any independent reviewers doing physical teardowns or side-by-side component analysis of built-in refrigerators — someone doing the equivalent of what StarCraft Reviews does for faucets?

Focus on sources that a product rating organization could cite with confidence. Skip marketing materials and manufacturer claims. I need the testing infrastructure, not the sales pitch.
```

**Save output as:** `knowledge/refrigerators/refrigerators_testing_framework.md`

---

## Pass 2 — Component Deep Dive (Query 2)

**Purpose:** Go inside the machines. Name the component suppliers, map the platform sharing, understand the failure modes at part level.

```
I'm building an independent product intelligence platform that scores residential built-in refrigerators at the component level. I've already mapped the testing landscape and brand hierarchy. Now I need to understand the actual components inside these products — who makes them, how they differ, and what fails. Built-in only.

COMPRESSORS & SEALED SYSTEMS:
- Who manufactures the compressors in each major built-in brand? (Embraco/Nidec, Secop/NRCA, LG inverter, Samsung digital inverter, proprietary)
- Which brands use single vs dual compressor systems? What's the actual performance difference in temperature stability and cross-contamination?
- Sub-Zero's dual compressor + dual evaporator — is the compressor proprietary or sourced? Who makes it?
- Which brands use variable-speed/inverter compressors vs fixed-speed?
- What are the documented compressor failure modes and typical lifespan by brand?
- Refrigerant types by brand (R-600a, R-134a, R-290) — any meaningful reliability or performance differences?

CONTROL SYSTEMS & ELECTRONICS:
- Who manufactures the main control boards for each brand? (Continental, Midea, in-house)
- Which brands share control board platforms within their parent company? (BSH: Thermador/Gaggenau/Bosch Benchmark, Whirlpool: JennAir/KitchenAid, Samsung: Dacor/Samsung)
- What are the most common control board failure modes? (relay failure, capacitor aging, moisture intrusion, display failures)
- Which brands have known motherboard/control issues in current production?

CABINET & INSULATION:
- What insulation types are used? (cyclopentane-blown polyurethane, vacuum insulation panels, standard polyurethane foam)
- Which brands use vacuum insulation panels and where?
- Cabinet materials: stainless interior vs plastic liner vs aluminum — which brands use which?
- Door hinge engineering: which brands use spring-loaded vs hydraulic vs cam-action hinges?

ICE MAKERS & WATER SYSTEMS:
- Who manufactures the ice makers? (Samsung in-house, LG in-house, Whirlpool in-house, third-party)
- Which ice makers have the highest documented failure rates?
- Sub-Zero's ice maker vs integrated competitors — component-level differences?

PLATFORM SHARING — SPECIFIC COMPONENT MAP:
- BSH family (Thermador/Gaggenau/Bosch Benchmark): Which specific refrigeration components are identical? Compressors, boards, fans, thermistors — go part by part.
- Whirlpool family (JennAir/KitchenAid/Whirlpool): Same depth.
- Samsung/Dacor: What Dacor refrigerator components are Samsung-sourced?
- GE/Monogram: What's shared with GE Profile?
- Middleby/Viking: Who actually manufactures Viking refrigerators now?

PARTS & SERVICE ECOSYSTEM:
- Which brands have parts widely stocked at independent distributors?
- Which brands require ordering direct or have known parts delays?
- Sub-Zero parts availability and lead times vs competitors?
- Which brands have the densest authorized service networks for built-in refrigerators?
- Average sealed system repair cost by brand?

Prioritize sources from: repair technician communities, teardown videos, component manufacturer spec sheets, parts distributor catalogs, trade publications. Cite all sources.
```

**Save output as:** `knowledge/refrigerators/refrigerators_component_analysis.md`

---

## Pass 3 — Competitive Hierarchy: Top (Query 3)

**Purpose:** Establish where the top brands sit relative to each other.

```
How do professionals rank the top residential built-in refrigerator brands against each other?

Specifically comparing Sub-Zero, True Residential, Miele, Thermador (Freedom Collection), Gaggenau, and JennAir built-in columns and French doors. What separates the best from the merely excellent?

Focus on professional installer opinions, independent service/reliability data (especially Yale Appliance service rates), and construction-level differences — not marketing claims. What do appliance professionals, kitchen designers, and repair technicians who work with these products daily say about relative quality?

I'm interested in: compressor and sealed system quality, temperature stability, build quality and longevity, parts availability and serviceability, warranty backing and execution. Built-in models only.
```

**Save output as:** `knowledge/refrigerators/refrigerators_hierarchy_top.md`

---

## Pass 4 — Competitive Hierarchy: Middle and Bottom (Query 4)

**Purpose:** Establish where the line falls between good and mediocre, and what sits at the floor.

```
Where do professionals draw the line between a good built-in refrigerator and a mediocre one? Which brands sit on that line?

Specifically: How do professionals rank Bosch Benchmark, Fisher & Paykel, Monogram, Dacor, Viking, Samsung Bespoke built-in, and any other built-in brands in the professional hierarchy?

I need: reliability/service data where available (especially Yale Appliance service rates), professional installer and repair technician opinions on construction quality, known reliability problems by brand, which brands professionals actively warn against, and where the floor of acceptable quality sits for built-in refrigerators.

Focus on the line between "good enough for a luxury home" and "built-in price tag with freestanding reliability." What brands do kitchen designers and appliance specialists refuse to specify? What brands do repair techs dread seeing?
```

**Save output as:** `knowledge/refrigerators/refrigerators_hierarchy_bottom.md`

---

## Calibration Product Candidates (Pre-Research)

Pending confirmation after research results reviewed:

| Tentative Tier | Brand | Notes |
|---|---|---|
| Tier 1 | Sub-Zero | Universal professional anchor, dual compressor, built-in heritage |
| Tier 1 | True Residential | Commercial crossover, potential challenger |
| Tier 1-2 | Miele | European premium, needs hierarchy confirmation |
| Tier 2 | Thermador Freedom | BSH platform — platform sharing mapping needed |
| Tier 2 | JennAir | Whirlpool luxury line — platform sharing mapping needed |
| Tier 3 | Bosch Benchmark / Fisher & Paykel | Entry built-in — needs hierarchy confirmation |
| Tier 4 | Viking | Middleby — documented reliability concerns |

**Scope:** Built-in only. No freestanding, no counter-depth freestanding.

---

*Run these four queries in Perplexity in order. Review all four outputs together before building config.*
