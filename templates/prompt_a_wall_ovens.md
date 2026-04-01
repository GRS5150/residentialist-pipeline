# Wall Ovens — Phase 1 Research Queries (prompt_a)
## Category Onboarding — Pass 1 through Pass 4

**Scope:** Built-in wall ovens only (single, double, combination/speed). No freestanding ranges, no cooktops, no countertop ovens.

**Run these four queries in Perplexity (sonar-deep-research) in order. Review all four outputs together before building config.**

**Naming:** `prompt_a` = research queries (this file). `prompt_b` = per-product deep dive prompts (built after config).

---

## PASS 1 — Landscape Survey

```
Who independently tests residential built-in wall ovens and what do they measure?

I'm building a product intelligence platform that scores residential built-in wall ovens on Quality, Performance, Durability, and Material Safety. I need to understand the testing landscape before I score anything. Built-in wall ovens only — no freestanding ranges.

Specifically:

1. What standardized tests exist for residential built-in wall ovens? (list relevant standards bodies — UL 858, IEC 60350-1, ASTM, AHAM, DOE energy test procedure 10 CFR 430 Subpart B Appendix I, CSA C358, any others)

2. What are the measurable performance specs with real numeric spread across brands? I need continuous metrics, not binary pass/fail. What specs create meaningful differentiation between premium (Wolf, Miele, Thermador) and builder-grade (Whirlpool, Samsung, LG)? Think: temperature accuracy and uniformity across the cavity (±°F from setpoint, rack-to-rack delta), preheat time to 350°F, broiler max temperature and recovery, convection distribution evenness, baking evenness scores, self-cleaning max temperature and duration, steam generation capacity (for steam ovens), energy consumption (kWh per standard test load), usable cavity volume vs stated capacity.

3. Who does independent comparative testing? (Consumer Reports oven baking/broiling/convection tests, Reviewed.com, CNET, Good Housekeeping Institute baking tests, Yale Appliance reliability data, any labs doing side-by-side wall oven testing or teardowns)

4. What reliability data exists in the public domain? (Yale Appliance service rates for wall oven brands, J.D. Power appliance studies, repair tech consensus from r/appliancerepair, any manufacturer-published MTBF or warranty claim rates for wall ovens specifically vs ranges)

5. What are the key construction differentiators between premium built-in and builder-grade wall ovens? (cavity material — true porcelain enamel vs painted steel vs stainless, insulation thickness and type, heating element construction and wattage, convection fan/element design — true European convection vs standard convection vs dual-fan, door hinge engineering — soft-close vs spring-loaded, rack design and glide mechanism — telescoping ball-bearing vs wire guides, control board sophistication, door glass layers — 2/3/4 pane)

6. Are there any independent reviewers doing physical teardowns or side-by-side component analysis of wall ovens — someone doing the equivalent of what StarCraft Reviews does for faucets?

Focus on sources that a product rating organization could cite with confidence. Skip marketing materials and manufacturer claims. I need the testing infrastructure, not the sales pitch.
```

**Save output as:** `knowledge/wall_ovens/wall_ovens_testing_framework.md`

---

## PASS 2 — Component Deep Dive

**Purpose:** Go inside the machines. Name the component suppliers, map the platform sharing, understand the failure modes at part level.

```
I'm building an independent product intelligence platform that scores residential built-in wall ovens at the component level. I've already mapped the testing landscape and brand hierarchy. Now I need to understand the actual components inside these products — who makes them, how they differ, and what fails. Built-in wall ovens only.

HEATING ELEMENTS & THERMAL SYSTEMS:
- Who manufactures the heating elements in each major wall oven brand? (Watt Miser/Backer EHP, Chromalox, Watlow, Tutco, in-house — name the specific supplier for each brand)
- What are the wattage specs for bake elements, broil elements, and convection elements across brands? What's the real spread?
- Which brands use hidden bake elements (sealed under cavity floor) vs exposed?
- True European convection (separate heating element around the fan) vs fan-assisted convection (fan circulates heat from standard bake/broil elements) — which brands use which system? Name the specific design for Wolf, Miele, Thermador, Bosch, JennAir, KitchenAid, GE/Café/Monogram, Samsung, LG, Viking, Dacor.
- Convection fan suppliers: Who makes the convection fans? (EBM-Papst, Fasco/Regal-Beloit, in-house — name the specific supplier and fan type for each brand)
- Dual-fan convection systems — which brands offer them, what are the real performance benefits?
- Steam generation systems: Which brands have true steam injection (boiler/reservoir) vs humidity-only? Who makes the steam generators?

CONTROL SYSTEMS & ELECTRONICS:
- Who manufactures the main control boards / ERC (Electronic Range Control) for each brand? (BSH in-house, Whirlpool in-house, Continental, Midea, Samsung in-house, Electrolux/Frigidaire — who makes their ERCs?)
- Which brands share ERC/control board platforms within their parent company? (BSH: Bosch/Thermador/Gaggenau, Whirlpool: JennAir/KitchenAid, Samsung: Dacor/Samsung, GE: Monogram/Café/Profile)
- What are the most common control board/ERC failure modes in wall ovens? (relay failure on bake/broil circuits, temperature sensor drift, touchscreen/membrane failure, moisture intrusion from self-clean cycles, capacitor aging)
- Pyrolytic self-clean stress on electronics: Does running self-clean at 850-950°F cause documented damage to control boards, temperature sensors, or door lock mechanisms? Which brands have known self-clean-related failure patterns?
- Which brands have known control board or electronic issues in current-generation production?
- Temperature sensor types: RTD (resistance temperature detector) vs thermocouple vs thermistor — which brands use which? What's the accuracy and drift rate difference? RTD is generally more accurate — does that map to premium vs builder-grade?

CAVITY & CONSTRUCTION:
- Cavity materials: true porcelain enamel (fired), painted enamel coating, bare stainless steel — which brands use which? Which survive repeated pyrolytic self-cleaning cycles without degrading, discoloring, or flaking?
- Self-cleaning technology: pyrolytic (high heat ~900°F) vs catalytic vs steam clean — specific max temperatures by brand. Documented cavity damage patterns from repeated pyrolytic cycles (enamel crazing, gasket degradation, door lock mechanism failure, hidden element warping)?
- Door construction: How many glass panes (2/3/4)? What type of glass? Door hinges: spring-loaded vs soft-close hydraulic — by brand.
- Rack engineering: telescoping ball-bearing full-extension racks vs partial-extension vs wire guides. Who supplies the rack glide systems?

PLATFORM SHARING — SPECIFIC COMPONENT MAP:
- BSH family (Bosch/Thermador/Gaggenau): Which wall oven components are identical across brands? Cavity, heating elements, control boards, convection fans, sensors, racks — go part by part. Where does Thermador differentiate from Bosch 800?
- Whirlpool family (JennAir/KitchenAid/Whirlpool): Same depth. What makes a JennAir wall oven different from KitchenAid internally?
- Samsung/Dacor: What Dacor wall oven components are Samsung-sourced?
- GE family (Monogram/Café/GE Profile): Same depth — what's actually different across the lineup?
- Sub-Zero/Wolf: Is the Wolf wall oven designed and manufactured in-house? Which components are sourced?
- Middleby/Viking: Who actually manufactures Viking wall ovens now?

CROSS-CATEGORY PLATFORM SHARING — WALL OVEN vs RANGE:
This is critical. For each brand family, I need to know whether the wall oven and the freestanding/dual-fuel range share the same oven components:
- Wolf: Is the Wolf wall oven cavity the same cavity as the Wolf dual-fuel range oven? Same convection fans (EBM-Papst or other), same ERC/control board, same temperature sensor, same heating elements?
- Thermador/Bosch: Is the Thermador wall oven cavity identical to the Thermador range oven section? Same BSH control board?
- Miele: Same question — wall oven vs range oven section. Same convection system?
- JennAir/KitchenAid: Wall oven vs range — same Whirlpool oven platform?
- GE/Monogram/Café: Wall oven vs range — same oven cavity and electronics?
- Samsung/Dacor: Wall oven vs range oven section — same platform?
- Viking: Wall oven vs range — same components?
If components ARE shared, that's a mandatory platform disclosure in both the wall oven AND range category reports — and deep dive findings from one category will cross-validate the other.

PARTS & SERVICE ECOSYSTEM:
- Which brands have parts widely stocked at independent distributors?
- Which brands require ordering direct or have known parts delays?
- Which brands have the densest authorized service networks for wall ovens?
- What are the most common wall oven repairs? (heating element replacement, ERC/control board replacement, door hinge/lock mechanism, igniter for gas models, temperature sensor — RTD vs thermocouple replacement frequency?)
- Average heating element replacement cost and availability by brand?
- Wolf/Sub-Zero parts availability and lead times vs competitors?
- Which ERC/control boards are interchangeable across brands within the same corporate family?

Prioritize sources from: repair technician communities, teardown videos, component manufacturer spec sheets (EBM-Papst, Fasco, Chromalox, Watlow), parts distributor catalogs, trade publications. Cite all sources.
```

**Save output as:** `knowledge/wall_ovens/wall_ovens_component_analysis.md`

---

## PASS 3 — Competitive Hierarchy: Top

**Purpose:** Establish where the top brands sit relative to each other.

```
How do professionals rank the top residential built-in wall oven brands against each other?

Specifically comparing Wolf, Miele, Thermador (Masterpiece and Professional series), Gaggenau, and JennAir built-in wall ovens (single and double). What separates the best from the merely excellent?

Focus on professional installer opinions, independent service/reliability data (especially Yale Appliance service rates for wall ovens), kitchen designer specifications, and construction-level differences — not marketing claims. What do appliance professionals, kitchen designers, and repair technicians who work with these products daily say about relative quality?

I'm interested in: heating system design (true European convection, dual fan, steam), temperature accuracy and uniformity, build quality and cavity material, self-cleaning durability, rack and hinge engineering, parts availability and serviceability, warranty backing and execution, control system reliability. Built-in wall ovens only (not ranges).

Where does Wolf actually stand vs Miele? Is the Thermador Professional wall oven meaningfully different from the Masterpiece series inside? Does Gaggenau justify its price premium over Thermador from the same BSH factory?
```

**Save output as:** `knowledge/wall_ovens/wall_ovens_hierarchy_top.md`

---

## PASS 4 — Competitive Hierarchy: Middle and Bottom

**Purpose:** Establish where the line falls between good and mediocre, and what sits at the floor.

```
Where do professionals draw the line between a good built-in wall oven and a mediocre one? Which brands sit on that line?

Specifically: How do professionals rank Bosch 800, KitchenAid, GE Café, GE Profile, Monogram, Dacor, Frigidaire Professional/Gallery, Samsung, LG, Viking, and any other built-in wall oven brands in the professional hierarchy?

I need: reliability/service data where available (especially Yale Appliance service rates for wall ovens), professional installer and repair technician opinions on construction quality, known reliability problems by brand (control board failures, element burnout rates, self-clean damage, door hinge failures, temperature calibration drift), which brands professionals actively warn against, and where the floor of acceptable quality sits for built-in wall ovens.

Focus on the line between "good enough for a quality kitchen" and "builder-grade filler in an expensive cabinet cutout." What brands do kitchen designers refuse to specify? What brands do repair techs dread servicing?

Which wall oven brands have the highest callback rates within the first year? Which brands have control board failures documented as a pattern (not one-off complaints)? Where do Samsung and LG wall ovens sit vs their refrigerator/dishwasher reputation?
```

**Save output as:** `knowledge/wall_ovens/wall_ovens_hierarchy_bottom.md`

---

## Calibration Product Candidates (Pre-Research)

Pending confirmation after research results reviewed:

| Tentative Tier | Brand/Product | Notes |
|---|---|---|
| Tier 1 | Wolf M Series | Sub-Zero group, dual VertiCross convection, professional standard |
| Tier 1 | Miele H7000 Series | European precision, true European convection, self-contained steam, in-house manufacturing |
| Tier 1-2 | Thermador Professional/Masterpiece | BSH platform — need to determine if Professional and Masterpiece differ internally |
| Tier 2 | JennAir Rise/Noir | Whirlpool luxury line — V2 convection, platform sharing map needed |
| Tier 2-3 | Bosch 800 Series | BSH platform entry — need hierarchy vs Thermador |
| Tier 3 | KitchenAid / GE Café | Mid-market — need hierarchy confirmation |
| Tier 4 | Samsung / LG | Volume brands — need reliability data |
| Tier 4 | Viking | Middleby — documented reliability concerns carry over from refrigerators? |

**Scope:** Built-in wall ovens only. No freestanding ranges, no countertop ovens.

**Axis weight hypothesis (pre-research):**
- Quality: 0.30 — Cavity construction, heating element design, rack/hinge engineering, manufacturing
- Durability: 0.35 — "Which ones break" drives professional hierarchy; service rate, parts ecosystem, warranty
- Performance: 0.35 — Temperature uniformity, convection effectiveness, preheat speed, self-cleaning, steam. NOT flat — real continuous metric spread across brands.

*Note: Axis weights are hypothesis. Research may reveal Durability is more dominant (like dishwashers/refrigerators) or Performance has less spread. Confirm after reviewing Pass 1-2.*

---

*Run these four queries in Perplexity in order. Review all four outputs together before building config.*
