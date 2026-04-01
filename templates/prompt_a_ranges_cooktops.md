# The Residentialist — Ranges & Cooktops Category Research Queries
## Gas Ranges/Cooktops (4 Passes) + Induction Cooktops/Ranges (4 Passes)
### Created April 1, 2026

---

## Naming Convention

- `prompt_a_{category}.md` = Research queries (Pass 1-4, run before any product is scored)
- `prompt_b_{category}.md` = Per-product deep dive prompts (run after config is built)

Study completed category query files before drafting new ones. The specificity level in these queries — naming component suppliers, referencing known platform sharing, asking about specific failure modes — is the standard. Generic placeholder queries produce generic results.

**Reference files for expected specificity:** `templates/prompt_a_refrigerators.md`, `templates/prompt_a_dishwashers.md`

---

## Scope

- **Gas ranges** — pro-style (36"/48"/60"), slide-in (30"/36"), freestanding (30") — gas-only and dual-fuel (gas top + electric oven)
- **Gas cooktops** — built-in, all sizes
- **Induction cooktops** — built-in, all sizes
- **Induction ranges** — slide-in and freestanding
- **Wall ovens** — excluded (separate category, separate purchase decision)
- **Electric radiant cooktops/ranges** — excluded for now (commoditized, minimal differentiation, add later if needed)

Gas and induction are treated as **separate technology types within one category**, each with its own full 4-pass research cycle and its own spec field block in the config. Neither borrows passes from the other.

---

## Pre-Research Brand Landscape

### Gas Ranges & Cooktops

**Tier 1 candidates:** Wolf (Sub-Zero Group — dual-stacked sealed burners, infrared broiler, dual convection), BlueStar (Prizer-Painter — open burners up to 25K BTU, commercial heritage, RNB/Platinum series)
**Tier 2 candidates:** Thermador (BSH — Star Burner, ExtraLow simmer), Miele (HR series), JennAir (Whirlpool luxury — DualVertiFlame), Viking (Middleby — documented reliability questions)
**Tier 3 candidates:** KitchenAid (Whirlpool), Bosch (BSH), Monogram (GE/Haier), GE Café, Bertazzoni, Fisher & Paykel, Dacor (Samsung)
**Tier 4 candidates:** GE Profile, Samsung, LG, Frigidaire Gallery
**Tier 5 candidates:** GE base, Whirlpool base, Amana, Frigidaire base, Hotpoint

### Induction Cooktops & Ranges

**Tier 1 candidates:** Thermador (BSH — Freedom Induction, full-surface FlexInduction?), Wolf (Sub-Zero Group), Miele (KM series — PowerFlex, TempControl)
**Tier 2 candidates:** JennAir (Whirlpool — Noir/Rise induction), Monogram (GE/Haier), Gaggenau (BSH — flex induction, modular cooktops)
**Tier 3 candidates:** Bosch (BSH — likely platform shared with Thermador), KitchenAid (Whirlpool), GE Café, GE Profile, Fisher & Paykel, Dacor (Samsung)
**Tier 4 candidates:** Samsung, LG, Frigidaire Gallery
**Tier 5 candidates:** GE base, Whirlpool base, Frigidaire base

### Known Platform Sharing to Investigate

- **BSH:** Thermador / Bosch / Gaggenau — same burner assemblies? Same induction coils? Same gas valves? Same oven cavity?
- **Whirlpool Corp:** JennAir / KitchenAid / Whirlpool / Maytag / Amana — part-by-part shared vs differentiated?
- **GE Appliances (Haier):** Monogram / Café / Profile / GE — same oven cavity across tiers?
- **Middleby:** Viking — standalone platform or shared Middleby commercial components?
- **Samsung:** Samsung / Dacor — same convergence as refrigerators (Samsung DA-prefix parts in Dacor chassis)?

### Pool S Candidate

Yale Appliance (Steve Sheinkopf) — service rate data for cooking products. Secondary: repair tech YouTube channels doing range teardowns (Renew Appliance Repair, etc.).

---

# ═══════════════════════════════════════════════
# PART 1: GAS RANGES & COOKTOPS — 4 PASSES
# ═══════════════════════════════════════════════

## Gas Pass 1 — Landscape Survey

**Purpose:** Discover what gets measured, who measures it, where the scores live for gas cooking products.

**Run in:** Perplexity Deep Research (separate fresh session)

```
Who independently tests residential gas ranges and gas cooktops, and what do they measure?

I'm building a product intelligence platform that scores residential gas ranges and gas cooktops on Quality, Performance, Durability, and Material Safety. I need to understand the testing landscape before I score anything. Scope includes pro-style ranges (36"/48"/60"), slide-in and freestanding ranges (30"/36") in gas and dual-fuel (gas top + electric oven), and built-in gas cooktops. No induction, no electric radiant, no wall ovens.

Specifically:

1. What standardized tests exist for residential gas ranges and gas cooktops? (ANSI Z21.1/CSA 1.1 for gas cooking, UL 858 for electric ovens in dual-fuel units, DOE cooking products energy test procedures, any ASTM test methods for burner efficiency or oven temperature accuracy, AGA certification requirements, CSA standards for Canadian market)

2. What are the measurable performance specs with real numeric spread across brands? I need continuous metrics, not binary pass/fail. What specs create meaningful differentiation between premium (Wolf, BlueStar, Thermador pro-style) and builder-grade (GE, Frigidaire, Amana)?

Think specifically about:
- Maximum BTU per burner AND true simmer capability (minimum stable flame — is it 500 BTU, 750 BTU, 1000 BTU? This spread matters enormously)
- BTU range ratio: highest burner to lowest stable simmer on the same unit. What ratio do premium ranges achieve vs builder-grade?
- Burner count and configuration: power burner BTU, standard burner BTU, simmer burner BTU, total cooktop BTU
- Oven temperature accuracy and uniformity: ±5°F vs ±25°F — who measures this and how?
- Oven preheat time to 350°F: what is the spread across brands?
- Broiler output: infrared wattage (Wolf) vs gas broiler BTU vs electric broiler in dual-fuel — how is output measured and what are the numeric ranges?
- Broiler coverage uniformity across the oven width
- Convection performance: actual measured temperature uniformity with convection on, single vs dual fan, true European convection (dedicated element around fan) vs fan-assist
- Oven capacity: usable cubic feet (not marketed cubic feet)
- Self-clean cycle: maximum temperature, duration, effectiveness, and component stress implications

3. Who does independent comparative testing of gas ranges/cooktops? (Consumer Reports range testing methodology, Reviewed.com, Yale Appliance reliability data for cooking, RTINGS if they cover cooking, Good Housekeeping Institute, any independent labs doing BTU verification or oven temp uniformity testing, any YouTube teardown channels pulling ranges apart)

4. What reliability data exists in the public domain for gas ranges and cooktops? (Yale Appliance service rates by brand — do they publish range-specific rates separate from other cooking products? J.D. Power appliance studies, repair tech consensus from r/appliancerepair and Appliantology, published failure rates by form factor — do pro-style ranges fail more or less than slide-in ranges? Do gas cooktops have different failure profiles than ranges?)

5. What are the key construction differentiators between premium and builder-grade gas ranges?

Think specifically about:
- Burner material and construction: sealed cast brass (Wolf) vs open cast iron (BlueStar) vs sealed stamped aluminum vs sealed stamped steel — what is the actual material hierarchy and why?
- Grate construction: continuous heavy cast iron (weight? 30+ lbs?) vs individual porcelain-coated cast iron vs stamped steel — what is the quality signal?
- Oven cavity: porcelain-on-steel gauge, full stainless interior, rolled vs welded seams, insulation type and thickness
- Cooktop base: single-piece stainless vs multi-piece, gauge, drip tray design
- Control knobs: metal with positive detents vs plastic, infinite vs discrete positions
- Door construction: triple-pane glass vs dual-pane, spring hinge quality, number of hinges
- Gas manifold: brass fittings vs aluminum — does this matter for longevity?
- Backsplash/trim: integrated stainless vs separate piece, weld quality
- For pro-style specifically: leg levelers, back panel access for service, depth of unit

6. Are there any independent reviewers doing physical teardowns or side-by-side component analysis of gas ranges? Anyone pulling burner assemblies apart, measuring actual BTU output vs rated, testing oven temperature accuracy over time with data loggers, comparing gas valve quality across brands, or documenting internal construction differences between price tiers?

7. Material Safety context for gas cooking: What does the current independent research say about indoor air quality impacts from gas cooking? (NO2, CO, PM2.5, formaldehyde, benzene emissions during cooking) What are the key studies? Is there a meaningful difference in emissions between brands or burner types, or is this a gas-vs-not-gas issue? Note: this is for report-only Material Safety disclosure, not scoring.

Focus on sources that a product rating organization could cite with confidence. Skip marketing materials and manufacturer claims. I need the testing infrastructure, not the sales pitch.
```

---

## Gas Pass 2 — Component Deep Dive

**Purpose:** Go inside the machines. Name the component suppliers, map the platform sharing, understand failure modes at part level for gas cooking products.

**Run in:** Perplexity Deep Research (separate fresh session)

```
I'm building an independent product intelligence platform that scores residential gas ranges and gas cooktops at the component level. I've already mapped the testing landscape and brand hierarchy. Now I need to understand the actual components inside these products — who makes them, how they differ, and what fails.

BURNERS — THE COMPONENT HIERARCHY (this is the cartridge/compressor equivalent for gas cooking):
- Who manufactures range and cooktop burners? Are they made in-house by the appliance OEM or sourced from specialist burner manufacturers?
- Sabaf (Lumezzane, Italy) is the major independent burner OEM — which US-market brands use Sabaf-manufactured burners? (Bertazzoni is likely Sabaf — confirm. Fisher & Paykel? Dacor? Others?) What tiers of Sabaf burners exist (standard brass, high-efficiency, professional series) and what are the spec differences?
- Wolf dual-stacked sealed burners: manufactured in-house at the Sub-Zero Group Madison WI facility, or sourced? What is the mechanical design — two concentric flame rings with independent gas feeds? What makes this different from competitors who claim "dual ring" or "dual flame" burners? What specific alloy are they cast from? Brass? What brass alloy?
- BlueStar open burners: confirm these are single-piece castings. What alloy? Cast at the Reading PA factory or sourced? What is the flame pattern — how many ports, what is the port-to-port spacing? Why do chefs and serious cooks prefer open burners for wok cooking and high-heat searing?
- Thermador Star Burner: BSH in-house design or sourced? 5-arm star geometry — what is the actual flame distribution advantage vs a conventional round sealed burner? Is the Star Burner shared with any Bosch cooking products, or Thermador-exclusive?
- Viking burners: manufactured at the Greenwood MS plant? Shared across 5 Series and 7 Series, or different assemblies? What changed under Middleby ownership?
- JennAir DualVertiFlame: Whirlpool in-house design? What makes it mechanically different — dual vertical flame paths?
- For builder-grade (GE, Whirlpool, Samsung, LG, Frigidaire): stamped aluminum sealed burners — who stamps them? In-house or commodity supplier? Are they all essentially interchangeable commodity parts?
- What are the documented burner failure modes? (Igniter failure is the #1 repair call — but what about: burner cap warping from thermal cycling, orifice clogging from boil-overs, flame spreader corrosion, venturi tube blockage, simmer valve deterioration, flash tube blockage between burners, spark electrode fouling)

GAS VALVES — THE HIDDEN DIFFERENTIATOR:
- Who manufactures residential range gas valves? (Robertshaw, Honeywell/Resideo, White-Rodgers/Emerson, Sabaf integrated valve systems, Bertelli, Copreci — name every supplier you can identify)
- Which brands use which gas valve suppliers? Map brand to valve supplier.
- Do pro-style ranges (Wolf, BlueStar, Thermador, Viking) use fundamentally different gas valves than 30" slide-in ranges from the same parent company? Or is it the same valve with different knob cosmetics?
- What is the spec difference between a premium gas valve and a commodity one? (Brass stem vs zinc/pot metal stem, number of simmer positions, detent mechanism, leak rate tolerance, thermal rating, cycle life if published)
- Do some gas valves enable finer simmer control than others at the component level? (Is Wolf's 500 BTU simmer a function of the valve precision, the orifice sizing, or the dual-stack burner geometry?)
- What are the documented gas valve failure modes? (Stem seizure from grease/corrosion, internal gas leak past seat, knob-to-stem interface wear/stripping, grease intrusion into valve body, spring fatigue on self-closing safety valves)
- Gas valve replacement cost by brand? Is it a $40 part with $200 labor, or $200+ part? Are gas valves standard/interchangeable across brands using the same supplier, or proprietary to each model?

IGNITERS — THE #1 REPAIR ITEM:
- Who manufactures range igniters? (Norton/Saint-Gobain has been the dominant hot surface igniter (HSI) manufacturer for decades — are they still? Who else supplies the US market?)
- Silicon carbide (carborundum) flat igniters vs silicon carbide round igniters vs silicon nitride igniters — what is the actual reliability hierarchy?
- Which brands use which igniter type? Do any premium brands use a demonstrably more durable igniter?
- Some European brands (Miele, possibly others) use electronic spark ignition rather than HSI — is spark ignition more reliable long-term? Why don't US brands use it?
- Typical igniter lifespan by type: silicon carbide documented at 3-7 year average failure — verify. Silicon nitride rated 2-3x longer — verify with repair tech data.
- Is the igniter a universal commodity part ($15-40 at PartSelect/RepairClinic) or are some brands using proprietary igniters?
- Do all burner igniters on a given range share the same part number, or are they position-specific (oven igniter different from cooktop igniter, etc.)?
- What does a typical igniter replacement cost by brand? (parts + labor breakdown)
- Oven igniters vs cooktop igniters: same failure rates or different?

OVEN CAVITY & CONVECTION (for ranges with ovens):
- Convection fan motors: Who manufactures them? (EBM-Papst, Fasco/Regal-Beloit, in-house — name supplier by brand if known)
- True European convection (dedicated heating element surrounding fan, third element) vs fan-assist (fan circulates heat from top/bottom elements): which brands use which system? Is this the same split as the burner hierarchy (premium = true, builder = fan-assist)?
- Wolf VertiCross dual convection: two fans with two independent heating elements — is this mechanically unique or do other brands offer genuine dual-fan systems? What is the actual airflow pattern (vertical cross-flow vs horizontal)?
- Thermador convection: same fan assembly and cavity geometry as Bosch ovens, or different? This is the platform sharing question for the oven side of dual-fuel.
- Oven temperature sensors: RTD/thermistor vs thermocouple — which type is more accurate and more durable? Which brands use which?
- Self-clean systems: pyrolytic (850-900°F) — what is the documented component stress? (Door lock mechanism failure, gasket degradation, control board stress from thermal cycling, wiring harness heat damage, porcelain crazing) How often does a self-clean cycle trigger a failure?
- Steam clean vs AquaLift: Do these actually work, or are they marketing responses to pyrolytic self-clean complaints?
- Oven door hinge mechanisms: documented failure modes? (Spring fatigue, hinge arm cracking, soft-close damper failure) Which brands use the most robust hinge systems?
- What gauge steel is the oven cavity across price tiers? Is there a measurable difference between a Wolf or BlueStar cavity and a GE or Frigidaire cavity?
- Oven insulation: fiberglass batting — is there a meaningful thickness/density difference between premium and builder-grade? Does this affect outer cabinet temperature or energy efficiency measurably?

CONTROL BOARDS & ELECTRONICS:
- Who manufactures range control boards / Electronic Range Controls (ERC)? (Name PCB suppliers by brand — same question as dishwashers where we found Continental and Bitron)
- Are range electronics simpler and more reliable than dishwasher electronics (less water exposure, fewer sensors), or do they have their own failure patterns from thermal cycling?
- Touch panel / capacitive interfaces vs mechanical knob-only controls: what is the long-term reliability difference? Do touch panels fail from heat exposure on ranges specifically?
- For dual-fuel ranges: the electric oven side has its own control board — is this a shared architecture with standalone wall ovens from the same brand?
- Documented control board failure modes for ranges: relay failure, membrane keypad degradation, capacitor aging from heat cycling, solder joint cracking from thermal expansion, power surge damage
- Control board replacement cost by brand?

GRATES, KNOBS & EXTERIOR HARDWARE:
- Continuous cast iron grates: What is the weight of a full grate set across brands? (Wolf's 48" grate set vs Samsung's 30" — is there a 3x weight difference?)
- Are grates enameled or bare cast iron by brand? Does enamel crack from thermal cycling?
- Knob construction: solid metal (stainless, zinc alloy, brass) vs plastic with metal cap vs full plastic — which brands use which? Knob detent mechanism (ball-detent vs friction-fit)?
- Are knob stems and valves integrated or separable? (If a knob breaks, is it a $30 knob replacement or a $200 valve replacement?)

PLATFORM SHARING — SPECIFIC COMPONENT MAP:
- BSH (Thermador / Bosch / Gaggenau): Part-by-part — same burner assemblies? Same gas valves? Same oven cavity and convection system? Same control boards? Where does Thermador genuinely differentiate at the component level vs cosmetics and feature lockout?
- Whirlpool Corp (JennAir / KitchenAid / Whirlpool / Maytag / Amana): Which range components are shared? Does the JennAir pro-style range use the same oven cavity as KitchenAid? Same gas valves? Same igniters? Where does JennAir differentiate beyond aesthetics?
- GE Appliances/Haier (Monogram / Café / Profile / GE): Is the Monogram pro-style range a genuinely different platform or a GE/Café range with premium trim? Same oven cavity across all four tiers?
- Middleby (Viking): Viking was the pioneer of residential pro-style — does it still manufacture its own burners/castings, or has Middleby shifted to sourced components?
- Samsung (Samsung / Dacor): Same pattern as refrigerators? Samsung DA-prefix part numbers inside Dacor range chassis?

SUPPLY CHAIN & PARTS ECOSYSTEM:
- Which brands have range/cooktop parts widely stocked at Marcone, RepairClinic, PartSelect, independent distributors?
- Which brands require authorized channels or direct ordering?
- Wolf: parts availability through Sub-Zero Group's certified service network — accessible or factory-bottlenecked?
- BlueStar: small-volume manufacturer in Reading PA — are parts readily available or long-lead?
- Viking: parts availability trajectory since Middleby acquisition — improving, stable, or degrading?
- Miele: US parts network for cooking products — same challenge as other Miele categories?
- Average cost of the five most common gas range repairs by brand:
  (1) Igniter replacement — cooktop and oven separately
  (2) Gas valve replacement
  (3) Control board / ERC replacement
  (4) Oven temperature sensor replacement
  (5) Convection fan motor replacement
- Average sealed system / gas line repair cost by brand?

Prioritize sources from: repair technician communities (r/appliancerepair, Appliantology, ApplianceBlog), teardown videos, component manufacturer spec sheets (Sabaf, Robertshaw, Honeywell), parts distributor catalogs (Marcone, RepairClinic, PartSelect), trade publications. Cite all sources.
```

---

## Gas Pass 3 — Competitive Hierarchy: Top

**Purpose:** Establish where the top gas range/cooktop brands sit relative to each other.

**Run in:** Perplexity Deep Research (separate fresh session)

```
How do professionals rank the top residential gas range and gas cooktop brands against each other?

Specifically comparing Wolf, BlueStar, Thermador, Miele, JennAir, and Viking pro-style and premium gas ranges (36" and 48" gas and dual-fuel). What separates the best from the merely excellent?

I need the professional hierarchy for gas cooking products — not marketing positioning. Specifically:

1. Wolf vs BlueStar — the core Tier 1 debate for gas cooking. Wolf brings dual-stacked sealed burners, infrared broiler, dual VertiCross convection, and Sub-Zero Group build quality and service infrastructure. BlueStar brings open burners at 22K-25K BTU, Prizer-Painter commercial heritage, RNB and Platinum series differentiation, and a customization story (750+ color options, French door configs). How do professionals (kitchen designers, installers, repair technicians) actually rank these head to head? What do chefs and serious home cooks who have cooked on both report about real cooking performance? Is the open-vs-sealed burner question a genuine performance split, or a preference/cooking style choice where both are Tier 1?

2. Thermador pro-style (Pro Harmony, Pro Grand): Where does it sit relative to Wolf and BlueStar? The Star Burner is a distinctive design, ExtraLow simmer claims very low flame. But is the overall build quality competitive at the component level? Does the BSH platform help (German engineering, scale) or hurt (cost optimization that Sub-Zero Group and Prizer-Painter don't face)? What is Thermador's current service rate for pro ranges per Yale Appliance?

3. Miele ranges (HR series): German build quality reputation, clean design, limited US model range. How does the US service and parts ecosystem compare to Wolf and BlueStar? Is it a genuine Tier 1 gas range competitor or a Tier 2 product with Tier 1 pricing? Do kitchen designers regularly specify Miele ranges the way they specify Miele dishwashers?

4. Viking pro-style ranges: Viking created the residential pro-range category in the 1980s. Well-documented reliability issues have emerged since the Middleby acquisition. Where does Viking actually sit now in professional estimation — living off historical reputation, improving under new management, or declining? What is the current Yale Appliance service rate for Viking ranges? What do repair technicians say about Viking range reliability in 2024-2025 production? Do kitchen designers still specify Viking?

5. JennAir RISE/NOIR pro-style ranges: Whirlpool Corporation's luxury platform. DualVertiFlame burner technology, chromium infused griddle. Genuine premium competitor, or KitchenAid with luxury aesthetics? How do professionals compare JennAir pro-style to Wolf, BlueStar, and Thermador at the construction and component level?

6. For built-in gas cooktops specifically: Is the gas cooktop hierarchy the same as the range hierarchy? Does Wolf make a standout gas cooktop? What about Gaggenau Vario modular gas cooktops — where do those sit? Are there any cooktop-only brands or models that outperform their range counterparts?

Focus on professional installer opinions, independent service/reliability data (especially Yale Appliance cooking product service rates), and construction-level differences — not marketing claims. What do the people who install, service, and repair these products daily say about relative quality?
```

---

## Gas Pass 4 — Competitive Hierarchy: Middle and Bottom

**Purpose:** Establish where the line falls between good and mediocre gas ranges, and what sits at the floor.

**Run in:** Perplexity Deep Research (separate fresh session)

```
Where do professionals draw the line between a good residential gas range and a mediocre one? Which brands sit on that line?

Specifically: How do professionals rank KitchenAid, Bosch, Monogram, GE Café, Bertazzoni, Fisher & Paykel, Dacor, GE Profile, Samsung, LG, Frigidaire Gallery, and base-tier GE, Whirlpool, Amana, Frigidaire, and Hotpoint gas ranges in the professional hierarchy?

I need: reliability/service data where available (especially Yale Appliance service rates for cooking), professional installer and repair technician opinions on construction quality, known reliability problems by brand, which brands professionals actively warn against, and where the floor of acceptable quality sits for gas ranges.

Specific questions:

1. KitchenAid vs Bosch 30" gas slide-in: These are the two brands most commonly specified when someone wants "quality but not pro-style." Which do kitchen designers and installers actually prefer? What are the construction differences — burner quality, oven cavity gauge, grate weight, knob construction, convection system? Is one meaningfully better built, or are they interchangeable at this tier?

2. Monogram vs GE Café gas ranges: Both GE Appliances/Haier brands. Does the Monogram pro-style range use a genuinely different platform than the Café, or is this GE's version of BSH platform sharing? What does Monogram get you at the component level that Café doesn't? Is the Monogram premium justified?

3. Bertazzoni: Italian manufacturer, beautiful European design, Sabaf burners (verify). What do US repair technicians say about reliability and parts availability? Is this a genuine quality competitor with Italian craftsmanship, or a style-first brand with a thin US service ecosystem? How does the oven cavity and convection system compare to similarly-priced US brands?

4. Fisher & Paykel ranges and cooktops: New Zealand heritage, now Haier-owned. Where does it sit in the professional hierarchy for gas cooking? Are these specified by designers, or mostly consumer-direct purchases? US parts availability?

5. Dacor (Samsung-owned) gas ranges: Same question as refrigerators — is Dacor a genuinely premium brand or Samsung internals with luxury cosmetics? Do repair technicians see Samsung part numbers inside Dacor ranges? Has anything changed since the Samsung acquisition?

6. Samsung and LG gas ranges: What is the actual professional consensus for cooking products specifically? Samsung has documented reliability and service ecosystem problems in dishwashers and refrigerators — does this pattern extend to gas ranges? Are Samsung ranges more reliable than Samsung dishwashers, or the same story? LG gas ranges — better or worse than Samsung? Do either have cooking-specific problems?

7. The builder-grade floor: GE base, Whirlpool base, Amana, Frigidaire base, Hotpoint. Where is the line between "acceptable for a quality home" and "builder-grade filler"? Is there a builder-grade gas range that professionals consider surprisingly competent for the price? Are all builder-grade 30" gas ranges essentially the same product with different logos?

8. Gas cooktop-specific: For built-in gas cooktops in the mid-tier (Bosch, KitchenAid, GE Café, Samsung, LG): is the hierarchy the same as slide-in ranges, or do some brands make better standalone cooktops than ranges?

Focus on the line between "good enough for a quality home" and "builder-grade filler." What brands do kitchen designers refuse to specify? What brands do repair techs dread working on? What brands do repair techs say "that's actually decent for the price"?
```

---

# ═══════════════════════════════════════════════
# PART 2: INDUCTION COOKTOPS & RANGES — 4 PASSES
# ═══════════════════════════════════════════════

## Induction Pass 1 — Landscape Survey

**Purpose:** Discover what gets measured, who measures it, where the scores live for induction cooking products. Induction has its own testing infrastructure, performance metrics, and failure modes that are completely different from gas.

**Run in:** Perplexity Deep Research (separate fresh session)

```
Who independently tests residential induction cooktops and induction ranges, and what do they measure?

I'm building a product intelligence platform that scores residential induction cooktops and induction ranges on Quality, Performance, Durability, and Material Safety. I need to understand the testing landscape for induction cooking specifically — not gas, not electric radiant. Scope includes built-in induction cooktops (all sizes) and induction ranges (slide-in and freestanding, 30" and 36").

Specifically:

1. What standardized tests exist for residential induction cooking products? (UL 858 for electric cooking, IEC 60335-2-6 and IEC 60335-2-9 for induction-specific safety, DOE energy test procedures for induction, any ASTM methods specific to induction performance, EMC/EMI standards for electromagnetic emissions, FCC Part 18 for RF emissions from induction coils)

2. What are the measurable performance specs with real numeric spread across induction brands? I need continuous metrics, not binary pass/fail. What specs create meaningful differentiation between premium (Thermador, Wolf, Miele) and mid-tier (Bosch, KitchenAid, GE) and entry (Samsung, LG, Frigidaire) induction?

Think specifically about:
- Maximum wattage per zone and total cooktop wattage (3,700W per zone common — but what is the actual sustained power vs boost power? Boost durations vary: 10 min, 20 min, unlimited?)
- Power boost specifications: wattage, duration limit, cooldown requirement
- Time to boil: watt-hours to bring 6 quarts of water from 70°F to 212°F — this is the standard benchmark. What is the actual spread across brands?
- Minimum simmer capability: lowest stable wattage per zone (100W? 200W? 500W?). Can it hold chocolate at 110°F without scorching? This is the induction equivalent of the gas simmer BTU question.
- Zone flexibility: FlexInduction / bridge elements / full-surface induction — how are these tested and compared?
- Magnetic field uniformity: does the entire zone heat evenly, or are there hot spots at the coil center? Who measures this?
- Pan detection: minimum pan diameter, magnetic material sensitivity, how quickly does it detect pan removal? False activation/deactivation rates?
- Noise: induction coil hum/buzz at various power levels (this is a significant consumer complaint). What frequencies, what dBA levels? Does it vary by brand, pan material, or power level? Who measures this objectively?
- Cooling fan noise: induction cooktops require active cooling fans for the electronics. Fan dBA at various power levels. Do fans continue running after cooking ends, and for how long?
- Power sharing: when multiple zones are active, how does the cooktop allocate total available amperage? Do some zones get deprioritized? Is the total cooktop wattage actually available simultaneously or is it a shared budget?
- Residual heat indication: accuracy and duration of surface temperature warning
- Response time: how quickly does temperature change when power level is adjusted? (This is induction's core advantage over gas — quantify it)
- Energy efficiency: what percentage of input energy reaches the pan? (Induction claims ~85-90% vs gas at ~40% — who verifies this?)

3. Who does independent comparative testing of induction cooktops and ranges? (Consumer Reports, Reviewed.com, RTINGS, Yale Appliance, Good Housekeeping Institute — do any of them have induction-specific test protocols? Any independent labs or researchers publishing comparative induction data? Any cooking science channels doing rigorous induction comparisons with measurements?)

4. What reliability data exists in the public domain for induction cooktops specifically? (Yale Appliance service rates for induction — do they break this out separately from gas cooking? J.D. Power data, repair tech consensus on induction failure rates vs gas, any manufacturer-published reliability data)

5. What are the key construction differentiators between premium and budget induction cooktops?

Think specifically about:
- Glass-ceramic surface: Schott Ceran vs EuroKera vs other suppliers — does the glass grade matter? Thickness differences? Impact resistance ratings?
- Coil count and size: larger coils for better field coverage vs smaller coils with electronic pan tracking?
- Coil construction: copper winding gauge and pattern, ferrite core design
- Power electronics: IGBT (Insulated Gate Bipolar Transistor) quality, heatsink design, capacitor ratings
- Cooling system: fan size, airflow design, thermal management of power electronics
- UI/controls: touch capacitive, magnetic slider/knob (TFT display), physical knob — does interface choice affect reliability?
- Frame and mounting: flush mount vs raised edge, stainless vs plastic trim

6. Are there any independent reviewers doing physical teardowns of induction cooktops? Anyone documenting the internal coil assemblies, power electronics, and component quality differences between brands? This would be extremely valuable — the interior of an induction cooktop is essentially invisible to the consumer.

7. What are the electrical installation requirements that differentiate induction products? (40A vs 50A circuit, 208V vs 240V performance difference, wire gauge requirements, dedicated circuit needs) Do some induction cooktops perform noticeably worse on 208V commercial power vs 240V residential?

Focus on sources that a product rating organization could cite with confidence. Skip marketing materials and manufacturer claims. I need the testing infrastructure, not the sales pitch.
```

---

## Induction Pass 2 — Component Deep Dive

**Purpose:** Go inside the machines. Name the component suppliers, map the platform sharing, understand failure modes at part level for induction cooking products. The component ecosystem for induction is completely different from gas — this is inverter boards and coil assemblies, not burners and gas valves.

**Run in:** Perplexity Deep Research (separate fresh session)

```
I'm building an independent product intelligence platform that scores residential induction cooktops and induction ranges at the component level. I've already mapped the testing landscape. Now I need to understand the actual components inside these products — who makes them, how they differ, and what fails. Induction only — not gas.

INDUCTION COILS — THE CORE COMPONENT:
- Who manufactures induction coil assemblies for residential cooktops? (EGO/E.G.O. Elektro-Gerätebau is the major European induction component supplier — confirm. Who else? Do any brands manufacture coils in-house?)
- EGO coil assemblies: Does EGO supply coils to Thermador, Bosch, Miele, and other BSH brands? What about non-BSH brands — does KitchenAid, GE, Samsung, or LG use EGO coils, or do they source elsewhere?
- What is the physical construction of an induction coil assembly? (Litz wire wound in flat spiral, ferrite core bars/shielding, temperature sensor integrated?) What varies between premium and commodity coils — wire gauge, winding density, ferrite quality?
- Coil diameter and its relationship to zone size — are larger coils inherently better for heat uniformity?
- FlexInduction / bridge zone / full-surface technology: How is this achieved at the coil level? Multiple small coils with electronic zone management vs fewer large coils? Who pioneered this and who licenses it?
- What are the documented coil failure modes? (Open circuit in winding, insulation breakdown, ferrite cracking from thermal shock, solder joint failure at wire termination)
- Are coils repairable or must the entire assembly be replaced? What does a coil assembly replacement cost?

POWER ELECTRONICS — INVERTER BOARDS AND IGBT MODULES:
- Who manufactures the inverter/power boards for residential induction cooktops? (This is the equivalent of the dishwasher control board question — name the PCB and power module suppliers by brand)
- IGBT (Insulated Gate Bipolar Transistor) modules: Who manufactures the IGBTs used in residential induction? (Infineon, ON Semiconductor, Fuji Electric, Mitsubishi, STMicroelectronics — which brands use which IGBT supplier?)
- What is the IGBT power rating hierarchy? Does a premium cooktop use higher-rated IGBTs than a budget one, or is the same silicon used with different heatsinking?
- Resonant capacitors: Are these film capacitors or electrolytic? What is the typical rated lifespan? Are capacitor failures a significant induction failure mode?
- Is the power board architecture shared within brand families? (Does a Thermador induction cooktop use the same inverter board as a Bosch induction cooktop? Same IGBT modules?)
- Full-surface induction (Thermador Freedom Induction, others): This requires more complex power electronics — how many independent inverter channels? Is the power management fundamentally different from a 4-zone cooktop?
- What are the documented power board failure modes? (IGBT burnout from overtemperature, capacitor aging/failure, relay failure, solder joint cracking from thermal cycling, power surge damage, cooling fan failure leading to cascading thermal damage)
- Power board replacement cost by brand? Is this a $300 part or a $1,000+ part?
- Can independent repair technicians work on induction power electronics, or is this factory/authorized-service-only territory?

GLASS-CERAMIC SURFACE:
- Who manufactures the glass-ceramic used in induction cooktops? (Schott Ceran is the dominant brand — do ALL induction cooktop manufacturers use Schott Ceran? Or do some use EuroKera, Nippon Electric Glass, or other suppliers?)
- What grades of Schott Ceran exist? (Schott lists CERAN Suprema, CERAN Hightrans, etc. — which grades go into premium vs budget cooktops? Does the grade affect scratch resistance, impact strength, or heat transmission?)
- Glass thickness: Is it the same across all brands, or do premium brands use thicker glass?
- What are the documented glass-ceramic failure modes? (Impact cracking from dropped objects, thermal stress cracking — is this a material defect or always user-caused? Scratching from cookware — does ceramic glass hardness vary by grade?)
- Glass replacement cost by brand?

COOLING SYSTEMS:
- Induction cooktops generate significant heat in the power electronics and require active cooling. What type of fan assemblies are used? (Axial fans, blower fans, EBM-Papst or other supplier?)
- How does cooling fan design differ between premium and budget models? (Number of fans, CFM, noise level, placement)
- Are cooling fan failures a significant reliability concern? What are the documented failure modes? (Bearing failure, dust accumulation, motor burnout)
- How does inadequate cooling affect component lifespan? (Overheated IGBTs degrade, capacitors age faster at higher temperatures)

CONTROL INTERFACE:
- Touch-capacitive controls: How do these work on an induction cooktop? (Projected capacitive through the glass, surface capacitive?) What are the failure modes? (Ghost touches from moisture/spills, sensor drift, ribbon cable failure)
- Magnetic slider knobs (Miele TempControl, others): Physical magnetic puck on glass surface — who pioneered this? Is it genuinely more reliable than touch?
- TFT display interfaces: Do these add a failure mode (display burnout, ribbon cable) or are they more reliable than membrane touch?

PLATFORM SHARING — INDUCTION-SPECIFIC:
- BSH (Thermador / Bosch / Gaggenau): Are the induction coil assemblies identical across all three brands? Same inverter boards? Same IGBT modules? Where does Thermador Freedom Induction genuinely differentiate from Bosch FlexInduction at the component level — or is it the same hardware with different firmware and UI?
- Gaggenau Vario modular induction vs Thermador Freedom full-surface — same underlying coil technology or different architecture?
- Whirlpool Corp (JennAir / KitchenAid / Whirlpool): Same induction platform across brands or differentiated? Who supplies the induction components — EGO, in-house, other?
- GE Appliances/Haier (Monogram / Café / Profile / GE): Do all GE-family induction products share a platform? Who supplies the coils and power electronics?
- Samsung (Samsung / Dacor): Same convergence pattern — Samsung induction internals inside Dacor?
- LG induction: in-house components or sourced? Any relationship to LG's commercial induction?

SUPPLY CHAIN & PARTS:
- Which brands have induction-specific replacement parts (coils, inverter boards, glass) widely stocked?
- Which brands require factory-direct parts ordering?
- Can independent repair techs diagnose and repair induction electronics, or is specialized training/equipment required? (Oscilloscope needed to diagnose resonant circuits?)
- Average cost of the three most common induction repairs by brand:
  (1) Power board / inverter board replacement
  (2) Glass-ceramic surface replacement
  (3) Coil assembly replacement
- Is "induction is too expensive to repair" a real concern, or a myth from early-generation products?

Prioritize sources from: repair technician communities (r/appliancerepair, Appliantology), teardown videos and photos, component manufacturer documentation (EGO, Schott, Infineon), parts distributor catalogs, induction-specific forums, trade publications, patent filings. Cite all sources.
```

---

## Induction Pass 3 — Competitive Hierarchy: Top

**Purpose:** Establish where the top induction brands sit relative to each other.

**Run in:** Perplexity Deep Research (separate fresh session)

```
How do professionals rank the top residential induction cooktop and induction range brands against each other?

Specifically comparing Thermador, Wolf, Miele, Gaggenau, JennAir, and Monogram induction cooktops (built-in, 30" and 36"). What separates the best from the merely excellent in induction cooking?

I need the professional hierarchy for induction specifically — not gas cooking reputation carried over. Some brands that excel at gas ranges may be mediocre at induction, and vice versa. Specifically:

1. Thermador Freedom Induction: This is the full-surface induction technology — no fixed zones, place cookware anywhere. Is this genuinely the best induction technology available in residential, or is it a gimmick with practical limitations? How does it compare to fixed-zone induction from Wolf and Miele for actual cooking performance? What are the reliability implications of the more complex electronics? Yale Appliance service rate data for Thermador induction specifically?

2. Wolf induction cooktops: Sub-Zero Group build quality applied to induction. How does Wolf's induction technology compare to Thermador's at the component level? Is Wolf induction competitive with their gas range reputation, or is this a category where Wolf is catching up? Do kitchen designers specify Wolf induction as readily as Wolf gas?

3. Miele induction (KM series): PowerFlex zones, TempControl magnetic knob interface. Miele has deep European induction experience — does that translate to a better product in the US market? How does the US service ecosystem for Miele induction compare to BSH brands? Is Miele induction the equivalent of Miele dishwashers (genuine Tier 1), or closer to Miele refrigerators (premium but less dominant)?

4. Gaggenau induction (Vario series, full-surface CX models): BSH ultra-premium. Modular cooktops, full-surface options. Is this genuinely different from Thermador induction at the component level, or the same BSH platform with Gaggenau aesthetics and pricing? When would a designer specify Gaggenau over Thermador for induction?

5. JennAir induction: Whirlpool Corporation's luxury induction offering. Is JennAir induction genuinely competitive with BSH brands (Thermador, Bosch, Gaggenau), or is there a technology gap? What is the component-level story — who supplies JennAir's induction coils and power electronics?

6. Monogram induction: GE Appliances/Haier premium tier. Same question — where does it sit relative to BSH and Whirlpool induction platforms? Is there a genuine technology or build quality differentiation?

7. The induction-specific question: Is there a clear Tier 1 in induction the way Wolf and BlueStar define Tier 1 in gas, or is induction more compressed at the top? Are there brands that are Tier 2 in gas but Tier 1 in induction (or vice versa)?

Focus on professional opinions from kitchen designers, installers, and repair technicians who work with induction specifically. Independent service/reliability data for induction products. Construction and component differences — not features lists or marketing. Who makes the most reliable, best-performing induction cooktop that professionals actually trust?
```

---

## Induction Pass 4 — Competitive Hierarchy: Middle and Bottom

**Purpose:** Establish where the line falls between good and mediocre induction, and what sits at the floor.

**Run in:** Perplexity Deep Research (separate fresh session)

```
Where do professionals draw the line between a good residential induction cooktop and a mediocre one? Which brands sit on that line?

Specifically: How do professionals rank Bosch, KitchenAid, GE Café, GE Profile, Fisher & Paykel, Dacor, Samsung, LG, Frigidaire Gallery, and any base-tier induction cooktops and ranges in the professional hierarchy?

I need: reliability/service data where available, professional installer and repair technician opinions on induction-specific construction quality, known reliability problems by brand, which brands professionals actively warn against for induction, and where the floor of acceptable induction quality sits.

Specific questions:

1. Bosch induction: BSH platform — likely shares substantial components with Thermador. If Thermador induction is Tier 1/2, does Bosch induction punch above its price point because of shared BSH technology? Or does Thermador genuinely differentiate at the component level? What does Bosch induction lose compared to Thermador — just features/UI, or actual hardware differences? This is the critical platform sharing question for induction buyers.

2. KitchenAid induction: Whirlpool's mid-tier induction offering. How does it compare to Bosch induction at similar price points? Is the Whirlpool induction platform competitive with BSH, or a generation behind? What do repair technicians say about KitchenAid induction reliability?

3. GE Café and GE Profile induction: Two tiers within GE/Haier. Is GE Profile induction genuinely a step down from Café, or the same product with different trim? How does GE's induction technology compare to BSH and Whirlpool platforms? Are there GE-specific induction problems?

4. Fisher & Paykel induction: Haier-owned, but different engineering origin than GE. Is there a distinct Fisher & Paykel induction platform, or is this converging with GE induction under Haier ownership?

5. Samsung and LG induction: Both Korean electronics giants with significant appliance divisions. Samsung has a troubled reputation in other appliance categories — does this extend to induction, or is induction simple enough that Samsung's execution is adequate? LG has stronger appliance reliability generally — does LG induction reflect that? Are Samsung and LG induction products competitive with BSH and Whirlpool, or a tier below?

6. Dacor induction (Samsung-owned): Same convergence question. Samsung induction inside Dacor chassis?

7. Budget induction floor: Frigidaire Gallery, GE base induction, any Whirlpool/Amana induction. Is budget induction ($1,000-1,500 range for 30" cooktops) genuinely usable, or does induction need a minimum investment to work well? Are there budget induction products that professionals consider surprisingly competent? Or does induction have a steeper quality floor than gas — meaning you need to spend a minimum amount to get acceptable performance?

8. Induction ranges specifically (slide-in and freestanding, not just cooktops): Is the hierarchy the same for induction ranges as induction cooktops? Some brands make great induction cooktops but don't offer induction ranges, or vice versa. Do the oven cavities in induction ranges differ from the same brand's gas/dual-fuel range ovens?

9. The reliability question for mid-tier induction: Induction has more complex electronics than gas. Does this mean mid-tier induction is LESS reliable than mid-tier gas (more to go wrong), or MORE reliable (no combustion, no gas valves, no igniters, fewer mechanical parts)? What does the repair tech data actually show?

Focus on the line between "good enough for a quality home" and "budget induction that will disappoint." What induction brands do kitchen designers refuse to specify? What induction brands do repair techs see frequent problems with? Is there a brand that is mediocre at gas but surprisingly good at induction?
```

---

# ═══════════════════════════════════════════════
# EXECUTION NOTES
# ═══════════════════════════════════════════════

## Run Order

Run all 8 queries in Perplexity Deep Research, each in a **separate fresh session**:

1. Gas Pass 1 — Landscape
2. Gas Pass 2 — Components
3. Gas Pass 3 — Hierarchy Top
4. Gas Pass 4 — Hierarchy Bottom
5. Induction Pass 1 — Landscape
6. Induction Pass 2 — Components
7. Induction Pass 3 — Hierarchy Top
8. Induction Pass 4 — Hierarchy Bottom

Paste each output back as it completes — don't wait to batch all 8.

If any pass reveals a testing body, teardown channel, component supplier, or failure mode not anticipated in subsequent passes, add a targeted follow-up query before moving to Phase 2.

## Post-Research Decisions (Phase 2)

After all 8 passes reviewed:

1. **Config structure decision:** One config file with gas and induction spec field blocks, or two separate configs? Passes will inform this.
2. **Tier anchor alignment:** Do gas and induction share tier anchors (Tier 1 = 90-100 for both), or does induction need its own anchor set?
3. **Format adjustment rules:** Do pro-style ranges get a format adjustment vs slide-in (similar to windows casement +3, DH +0)? Or is format a config field?
4. **Dual-fuel treatment:** Dual-fuel ranges have a gas cooktop + electric oven. Does the oven score use gas or induction oven specs? Likely gas oven specs since the cooktop drives the gas classification.
5. **Oven cavity cross-reference:** Compare oven findings from gas Pass 2 with wall oven category findings. Map shared platforms.
6. Build `configs/ranges_cooktops.json` and `calibration/ranges_cooktops/config.json`
7. Build `templates/prompt_b_ranges_cooktops.md` using named components from both Pass 2 outputs

## Calibration Product Candidates (Confirm After Passes)

### Gas Calibration

| Product | Expected Tier | Format | Notes |
|---|---|---|---|
| Wolf 36" Dual Fuel (DF366) | Tier 1 | Pro-style range | Anchor — dual-stacked, infrared broiler, dual convection |
| BlueStar RNB 36" | Tier 1 | Pro-style range | Open burner anchor — 25K BTU, commercial heritage |
| Thermador Pro Harmony 36" | Tier 2 | Pro-style range | BSH platform — Star Burner, investigate component sharing |
| KitchenAid 30" Slide-In Gas | Tier 3 | Slide-in range | Whirlpool mid-tier quality anchor |
| GE Café 30" Slide-In Gas | Tier 3 | Slide-in range | GE/Haier mid-tier — investigate Monogram platform sharing |
| Samsung 30" Slide-In Gas | Tier 4 | Slide-in range | Service ecosystem test |

### Induction Calibration

| Product | Expected Tier | Format | Notes |
|---|---|---|---|
| Thermador Freedom Induction 36" | Tier 1 | Built-in cooktop | BSH full-surface — anchor if warranted |
| Wolf Induction 36" | Tier 1-2 | Built-in cooktop | Sub-Zero Group — verify tier vs Thermador |
| Miele KM Induction 36" | Tier 1-2 | Built-in cooktop | European induction heritage |
| Bosch Induction 30" | Tier 2-3 | Built-in cooktop | BSH platform sharing test vs Thermador |
| KitchenAid Induction 30" | Tier 3 | Built-in cooktop | Whirlpool induction platform |
| Samsung Induction 30" | Tier 4 | Built-in cooktop | Budget induction floor test |

**Note:** Gas and induction each have 6 calibration candidates. If the config stays unified, we may run all 12. If it splits into two configs, each gets its own 6. Phase 2 decision.

---

*Run these eight queries in Perplexity in order. Review all outputs before building config.*
