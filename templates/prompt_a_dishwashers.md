# Dishwashers — Research Queries (prompt_a)

**Scope:** Residential dishwashers — built-in standard (24") and compact (18"). NOT commercial, NOT countertop, NOT portable.
**Sub-types:** standard_24, compact_18
**Pool S:** Yale Appliance (Steve Sheinkopf) — single-region service rate data (Boston area, premium skew)
**Created:** 2026-04-02

---

## Pass 1 — Landscape Survey

```
Who independently tests residential dishwashers and what do they measure?

I'm building a product intelligence platform that scores residential dishwashers on Quality, Performance, Durability, and Material Safety. I need to understand the testing landscape before I score anything.

Specifically:

1. What standardized tests exist for residential dishwashers? (DOE 10 CFR Part 430 Appendix C energy/water, AHAM DW-1 performance, IEC 60436 international, NSF/ANSI 184 residential, UL 749 safety, ENERGY STAR Most Efficient criteria — what do each of these actually test and what are the numeric ranges that create real differentiation?)

2. What are the measurable performance specs with real numeric spread across brands? I need continuous metrics, not binary pass/fail. What specs create meaningful differentiation between premium and builder-grade? (noise dBA — range from 37 to 56+, soil removal %, drying effectiveness by technology type, water consumption gal/cycle, energy kWh/yr, cycle time, number of spray arms, rack configurations, loading capacity place settings)

3. Who does independent comparative testing? (Consumer Reports, Yale Appliance service rate data, Reviewed.com, CNET, Good Housekeeping Institute, J.D. Power appliance reliability — any independent teardown reviewers doing component-level analysis?)

4. What reliability data exists in the public domain? (Yale Appliance publishes annual service rates by brand — this is the closest thing to Pool S data in this category. Consumer Reports reliability surveys. J.D. Power rankings. Common failure modes by component — motor, control board, pump, door latch, water inlet valve.)

5. What are the key construction differentiators between premium and builder-grade dishwashers? (motor type — brushless inverter vs PSC induction vs PMSM, tub material — stainless vs plastic, drying technology — zeolite vs AutoAir vs condensation vs heated element, filter type — self-cleaning vs manual mesh vs grinder, rack materials and glide type — ball-bearing vs nylon, control board quality, door hinge mechanism)

6. Are there any independent reviewers doing physical teardowns or side-by-side component analysis — someone doing the equivalent of what StarCraft Reviews does for faucets? Any dishwasher-specific teardown or repair channels that show what's inside these machines?

Focus on sources that a product rating organization could cite with confidence. Skip marketing materials and manufacturer claims. I need the testing infrastructure, not the sales pitch.
```

---

## Pass 2 — Component Deep Dive

```
I'm building an independent product intelligence platform that scores residential dishwashers at the component level. I've already mapped the testing landscape and brand hierarchy. Now I need to understand the actual components inside these products — who makes them, how they differ, and what fails.

MOTOR SYSTEMS:
- Who manufactures dishwasher motors? Nidec (BSH — confirmed for Bosch/Thermador), Askoll (Whirlpool — confirmed PMSM), SISME, other suppliers?
- Brushless DC inverter vs PSC AC induction vs PMSM: which brands use which? What is the real efficiency and noise difference? What is the service life difference?
- Motor mounting: direct-drive vs belt-drive — which brands use which?
- Motor controller boards: who manufactures them? Continental AG (BSH — confirmed across entire Bosch lineup), other suppliers?

PUMP SYSTEMS:
- Circulation pump: Askoll (Whirlpool confirmed), Hanning? Who else?
- Drain pump: integrated or separate from circulation? OEM suppliers?
- Pump failure modes: seal failure, impeller wear, bearing noise — which brands have documented pump problems?

DRYING TECHNOLOGY:
- Zeolite: Bosch 800+ exclusive — what mineral, what regeneration cycle, does it genuinely outperform heated element drying? Energy overhead (240 kWh/yr for Bosch 800 vs 199 kWh/yr expected)?
- AutoAir (Bosch 500): door-crack mechanism — how does it work? Is it zeolite or just passive ventilation?
- PureDry condensation (Bosch 300, entry BSH): no active drying — just stainless tub condensation?
- Heated element drying: who still uses this? (KitchenAid, Whirlpool, Samsung) — energy impact?
- Fan-assisted drying: any brands use active fan circulation?

CONTROL BOARDS:
- Who manufactures control boards? Continental AG (BSH confirmed), other suppliers for Whirlpool/KitchenAid, Samsung, LG?
- Documented control board failure patterns by brand? Samsung control board issues? LG issues?
- OTA firmware update capability: which brands? Does this add failure modes?

RACK SYSTEMS:
- Ball-bearing rack glides: Bosch 800 (upper rack ONLY — BSH brochure confirmed, all-three-rack is Benchmark exclusive), KitchenAid SatinGlide Max — where exactly are ball-bearing glides used?
- Third rack designs: adjustable vs fixed, covered vs open
- Rack adjustment mechanisms: racking flexibility comparison

TUB CONSTRUCTION:
- Stainless steel tub: which brands across which price points? (Bosch all, Miele all, KitchenAid KDTM604+, Whirlpool WDT750+)
- Plastic/hybrid tub: which brands on budget lines?
- Tub thickness and quality: is there a measurable difference in stainless across brands?

PLATFORM SHARING:
- BSH: Bosch, Thermador, and Gaggenau share the same dishwasher platform. Yale confirmed 0.4% service rate spread. Which specific components are identical? (motor, control board, pump, filter — are any different?)
- Whirlpool/KitchenAid: same platform? What differentiates KitchenAid from Whirlpool internally?
- Samsung: which components are proprietary vs sourced? Parts availability assessment?
- LG: same questions — proprietary vs sourced components?
- Miele: fully vertical integration? Euskirchen factory — what's made in-house vs sourced?

PARTS ECOSYSTEM:
- Which brands have parts widely stocked at independent distributors?
- Which brands require ordering direct or have availability issues?
- Service network density: BSH contract network vs Whirlpool universal coverage vs Samsung's documented service ecosystem problems
- Typical repair cost for most common failure by brand

Prioritize sources from: repair technician communities (r/appliancerepair), Yale Appliance publications, teardown videos, component manufacturer spec sheets, parts distributor catalogs, trade publications. Cite all sources.
```

---

## Pass 3 — Competitive Hierarchy Top

```
How do professionals rank the top residential dishwasher brands against each other?

Specifically comparing Miele G7000 Series, Bosch 800 Series (SHP/SHV/SHX), Bosch Benchmark, Thermador Star Sapphire, Gaggenau 400 Series, and KitchenAid KDTM604 (M-series). What separates the best from the merely excellent?

Focus on:
- Yale Appliance service rate data — this is the anchor reliability metric. Miele 5.6%, Bosch 7.8%, Thermador ~8.2%, etc. Do other sources confirm these rankings?
- Independent drying technology comparison: zeolite (Bosch 800+) vs heated element (KitchenAid) vs Miele AutoOpen — which genuinely dries plastics best?
- Noise performance: verified dBA measurements, not just spec sheet claims. Who is actually the quietest?
- BSH platform disclosure: Bosch/Thermador/Gaggenau share the same platform — how much is truly different between them?
- Professional installer and kitchen designer opinions: what do professionals specify for $2-5M homes?
- Long-term reliability: which brands do repair technicians respect? Which do they dread servicing?

Focus on professional opinions, independent testing data, and service rate evidence — not marketing claims.
```

---

## Pass 4 — Competitive Hierarchy Bottom

```
Where do professionals draw the line between a good residential dishwasher and a mediocre one? Which brands sit on that line?

Specifically: How do professionals rank Bosch 300 Series, Bosch 100 Series, Whirlpool WDT750SAKZ, KitchenAid KDFE104 (entry), Samsung DW80 series, LG LDP/LDT series, Maytag MDB series, Frigidaire FDSH/FGIP series, GE Profile, GE standard, Beko, and Amana ADB series in the professional hierarchy?

I need: Yale service rate data where available, Consumer Reports reliability data, professional repair technician opinions on construction quality, known reliability problems by brand (Samsung's documented service ecosystem issues, LG compressor volatility), which brands professionals actively warn against, and where the floor of acceptable quality sits.

Focus on the line between "good enough for a quality home" and "builder-grade filler." What brands do kitchen designers and repair technicians refuse to recommend? Where does Samsung sit — does better paper specs matter when Consumer Reports says 23% failure rate and "cannot recommend"?
```

---

*Save outputs to `knowledge/dishwashers/dishwashers_testing_framework.md` (Pass 1), `knowledge/dishwashers/dishwashers_component_analysis.md` (Pass 2), `knowledge/dishwashers/dishwashers_hierarchy_top.md` (Pass 3), `knowledge/dishwashers/dishwashers_hierarchy_bottom.md` (Pass 4).*
