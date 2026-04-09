# Range Hoods — Research Queries (prompt_a)

**Scope:** Residential range hoods — wall-mount, island, undercabinet, insert/liner. NOT commercial exhaust, NOT microwave-over-range units, NOT downdraft (scored separately if applicable).
**Sub-types:** wall_mount, island, undercabinet, insert_liner
**Pool S:** HVI Certified Products Directory (verified CFM and sone ratings)
**Created:** 2026-04-02

---

## Pass 1 — Landscape Survey

```
Who independently tests residential range hoods and what do they measure?

I'm building a product intelligence platform that scores residential range hoods on Quality, Performance, Durability, and Material Safety. I need to understand the testing landscape before I score anything.

Specifically:

1. What standardized tests exist for residential range hoods? (HVI 916 airflow/sound, HVI 915 sound measurement, UL 507 safety, ASHRAE 62.2 residential ventilation, ASTM E2231 kitchen exhaust, IRC M1503.4 makeup air requirements — what do each of these actually test and what are the numeric ranges that create real differentiation?)

2. What are the measurable performance specs with real numeric spread across brands? I need continuous metrics, not binary pass/fail. What specs create meaningful differentiation between premium and builder-grade? (CFM at various speed settings, sone ratings at various speeds, CFM-to-sone ratio efficiency, capture efficiency %, grease capture rate, static pressure performance, duct run tolerance)

3. Who does independent comparative testing? (HVI — Home Ventilating Institute, Consumer Reports, independent kitchen/ventilation reviewers, ASHRAE research, ventilation science publications, Fine Homebuilding/GBA coverage)

4. What reliability data exists in the public domain? (motor failure rates, service call patterns, common failure modes by blower type — centrifugal vs axial, bearing wear patterns, control board failure rates)

5. What are the key construction differentiators between premium and builder-grade range hoods? (blower type — centrifugal squirrel cage vs axial, bearing type — ball vs sleeve, motor winding quality, body gauge and grade — 304 vs 430 stainless vs painted steel, welded vs riveted construction, filter type — stainless baffle vs aluminum mesh, lighting — LED vs halogen vs incandescent)

6. Are there any independent reviewers doing physical teardowns or side-by-side performance testing — someone doing the equivalent of what StarCraft Reviews does for faucets? Any range hood-specific testing or teardown channels?

Focus on sources that a product rating organization could cite with confidence. Skip marketing materials and manufacturer claims. I need the testing infrastructure, not the sales pitch.
```

---

## Pass 2 — Component Deep Dive

```
I'm building an independent product intelligence platform that scores residential range hoods at the component level. I've already mapped the testing landscape and brand hierarchy. Now I need to understand the actual components inside these products — who makes them, how they differ, and what fails.

BLOWER/MOTOR SYSTEMS:
- Who manufactures blower motors for the major range hood brands? Vent-A-Hood (Magic Lung — proprietary centrifugal, Houston TX), Wolf (Sub-Zero/Wolf — Fitchburg WI?), Zephyr (OEM China — which factories?), Thermador/Bosch (BSH platform — shared with other BSH hoods?), Broan-NuTone (Nortek — largest US hood manufacturer), BEST by Broan?
- Centrifugal (squirrel cage) vs axial fan: which brands use which? What is the measurable performance difference in CFM delivery at equivalent sone levels?
- Ball bearing vs sleeve bearing motors: which brands use which? What is the documented service life difference? (ball bearing 50,000+ hrs vs sleeve 20,000?)
- Variable/infinite speed vs multi-speed vs single-speed: who uses electronic speed control vs mechanical? What motor controller ICs?
- External/remote blower options: which brands offer them? BLB series (Zephyr), VTR/PB series (Vent-A-Hood), PWB (Wolf) — CFM/sone specs with external vs internal blower?

FILTER SYSTEMS:
- Stainless steel baffle filters: who manufactures them? Are they truly different between brands or commodity components?
- Aluminum mesh filters: grease capture efficiency compared to baffle?
- Vent-A-Hood Magic Lung: filterless centrifugal capture — how does grease capture BEFORE the fan work? What is the documented grease capture rate vs traditional baffle filter?
- Charcoal recirculating filters: which brands rely on these? Effectiveness?

BODY CONSTRUCTION:
- Stainless steel grades: which brands use 304 (18/8 austenitic) vs 430 (ferritic — magnetic, less corrosion-resistant) vs painted steel?
- Body gauge: 18-gauge vs 20-gauge vs 22-gauge bodies — which brands at which gauge?
- Construction method: laser-welded seamless vs spot-welded vs riveted/mechanical assembly
- Liner/insert dimensions: standard sizing or proprietary?

CONTROL SYSTEMS:
- Electronic touch controls vs mechanical push-button vs rotary knob — reliability data?
- Heat sentry/auto-on sensors: which brands, which sensor type (thermistor, thermocouple)?
- Smart home integration: WiFi control options (Home Connect for BSH, Zephyr Connect) — do these add failure modes?

PLATFORM SHARING:
- BSH: Do Thermador, Bosch, and Gaggenau hoods share blowers, filters, or control boards? (BSH platform sharing is confirmed across dishwashers, refrigerators, wall ovens)
- Broan/NuTone/BEST: All Nortek — which components are shared across these three brands?
- Sub-Zero/Wolf: Does Wolf ventilation share components with Cove dishwashers or other Sub-Zero Group products?
- Zephyr: San Francisco design, China manufacturing — which OEM factories? Any components shared with private-label hoods?

PARTS ECOSYSTEM:
- Which brands have blower motors widely stocked at independent distributors?
- Which brands require ordering direct from manufacturer?
- Motor replacement cost by brand (parts + labor)?
- Filter replacement availability and cost?
- Typical service life before major repair?

Prioritize sources from: repair technician communities (r/appliancerepair, HVAC forums), HVI technical documentation, teardown videos, component manufacturer spec sheets, parts distributor catalogs, trade publications (CE Pro, Fine Homebuilding). Cite all sources.
```

---

## Pass 3 — Competitive Hierarchy Top

```
How do professionals rank the top residential range hood brands against each other?

Specifically comparing Vent-A-Hood, Wolf Pro Ventilation, Thermador (HPCN series), Zephyr (Tempest II / premium lines), and Viking Professional. What separates the best from the merely excellent?

Focus on:
- Professional kitchen designer specification preferences for $2-5M homes
- Independent service/reliability data — which premium hoods have the best track record?
- Construction-level differences — is Vent-A-Hood's Magic Lung centrifugal capture genuinely superior to traditional baffle systems?
- HVI-certified performance data comparison (CFM and sone ratings at equivalent speed settings)
- What do HVAC and ventilation professionals say about real-world capture effectiveness vs spec sheet claims?
- Long-term motor reliability: are centrifugal blowers genuinely more durable than axial fans?

Focus on professional installer opinions and independent testing data — not marketing claims. What do professionals who install and service these products daily say about relative quality?
```

---

## Pass 4 — Competitive Hierarchy Bottom

```
Where do professionals draw the line between a good residential range hood and a mediocre one? Which brands sit on that line?

Specifically: How do professionals rank Broan-NuTone (Elite series and standard), BEST by Broan, Cosmo, Hauslane, Proline, Cavaliere, FOTILE, Ancona, CIARRA, and generic Amazon/Home Depot private-label hoods in the professional hierarchy?

I need: HVI certification status per brand (many budget hoods are NOT HVI-certified — their CFM claims are unverified), professional installer opinions on construction quality, known reliability problems by brand, which brands professionals actively warn against, and where the floor of acceptable quality sits.

Focus on the line between "good enough for a quality home" and "builder-grade filler." What brands do kitchen designers and contractors refuse to specify? What is the absolute cheapest hood a professional would put their name on? Is Broan-NuTone Elite genuinely better than the standard Broan line, or is it marketing differentiation on the same platform?
```

---

*Save outputs to `knowledge/range_hoods/range_hoods_testing_framework.md` (Pass 1), `knowledge/range_hoods/range_hoods_component_analysis.md` (Pass 2), `knowledge/range_hoods/range_hoods_hierarchy_top.md` (Pass 3), `knowledge/range_hoods/range_hoods_hierarchy_bottom.md` (Pass 4).*
