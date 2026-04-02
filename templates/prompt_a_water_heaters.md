# Water Heaters — Research Queries (prompt_a) — v1

**Category:** water_heaters
**Sub-types:** Tankless (gas), Tank (gas/electric), Heat Pump (electric)
**Pool S:** VACANT — Yale Appliance does not sell or service water heaters.
**Created:** 2026-04-01

---

## Pass 1 — Landscape Survey (Testing Framework)

```
Who independently tests residential water heaters and what do they measure?

I'm building a product intelligence platform that scores residential water heaters on Quality, Performance, Durability, and Material Safety. I need to understand the testing landscape before I score anything. This category covers three sub-types: tankless gas, storage tank (gas/electric), and heat pump water heaters.

Specifically:

1. What standardized tests exist for residential water heaters? (DOE 10 CFR Part 430 Appendix E, AHRI certification, ANSI Z21.10.1 for gas, UL 174 for electric, UL 1995 for heat pump, ASHRAE 118.1, CSA 4.1)

2. What are the measurable performance specs with real numeric spread across brands? I need continuous metrics, not binary pass/fail. What specs create meaningful differentiation between premium and builder-grade?
   - UEF (Uniform Energy Factor) — what is the actual range across sub-types?
   - GPM (gallons per minute) for tankless — what range exists?
   - First Hour Rating for tank — what range exists?
   - Recovery rate (GPH at 90°F rise) for tank
   - Temperature rise capability for tankless at various flow rates
   - COP (Coefficient of Performance) for heat pump
   - Standby loss for tank
   - Noise (dBA) for heat pump and tankless

3. Who does independent comparative testing? (Consumer Reports, DOE ENERGY STAR testing, AHRI third-party certification labs, any independent teardown reviewers?)

4. What reliability data exists in the public domain? (first-year failure rates, common repair databases, plumber consensus data, warranty claim rates)

5. What are the key construction differentiators between premium and builder-grade water heaters?
   - Tankless: heat exchanger material (copper vs stainless), condensing vs non-condensing, burner design, gas valve manufacturer, PCB quality
   - Tank: glass lining quality (Vitraglas, Blue Diamond), anode rod type (magnesium, aluminum, powered titanium), steel gauge, drain valve material, heat trap nipples
   - Heat pump: compressor type, refrigerant, evaporator coil, COP range, ambient operating range

6. Are there any independent reviewers doing physical teardowns or side-by-side component analysis — someone doing the equivalent of what StarCraft Reviews does for faucets?

Focus on sources that a product rating organization could cite with confidence. Skip marketing materials and manufacturer claims. I need the testing infrastructure, not the sales pitch.
```

**Output:** Save as `knowledge/water_heaters/water_heaters_testing_framework.md`

---

## Pass 2 — Component Deep Dive

```
I'm building an independent product intelligence platform that scores residential water heaters at the component level. I've already mapped the testing landscape and brand hierarchy. Now I need to understand the actual components inside these products — who makes them, how they differ, and what fails.

HEAT EXCHANGERS (TANKLESS):
- Who manufactures heat exchangers for the major tankless brands? Do Rinnai, Navien, Noritz, Takagi manufacture their own, or are they sourced from OEM suppliers?
- Copper vs stainless steel heat exchangers: which brands use which? Rinnai uses copper primary + stainless secondary in condensing models. Navien uses dual stainless. Noritz uses dual stainless. Confirm and expand.
- What is the thermal conductivity difference between copper and stainless? (Copper ~401 W/mK vs stainless ~16 W/mK — nearly 25x). How does this affect real-world performance?
- Condensing vs non-condensing: what exactly is the secondary heat exchanger doing? Why does it drive UEF from 0.80 to 0.95+?
- Heat exchanger failure modes: scale buildup (hard water), stress cracking (thermal cycling), pinhole leaks (acidic condensate on copper), blockage
- Heat exchanger replacement cost by brand

BURNER SYSTEMS (TANKLESS GAS):
- Burner type: premix vs atmospheric, metal fiber vs stamped. Who supplies?
- Gas valve manufacturers: Honeywell, SIT Group, Dungs — which brands use which?
- Ignition: direct spark vs hot surface. Flame rod sensor — is this the same technology as range igniters?
- Fan/blower motor suppliers: EBM-Papst, SISME, commodity?

TANK CONSTRUCTION (STORAGE):
- Glass lining technology: Bradford White Vitraglas vs A.O. Smith Blue Diamond vs Rheem — are these meaningfully different or marketing names for the same glass-enamel process?
- Steel gauge: do brands actually differ? 16-gauge vs 20-gauge claims — verification?
- Anode rod comparison: magnesium vs aluminum vs powered (titanium). Which brands ship with which? Is the powered anode rod a genuine longevity upgrade or marketing?
- Drain valve: brass (Bradford White, A.O. Smith ProLine) vs plastic (retail models)
- Gas control valves: Honeywell (now Resideo) vs Robertshaw — are these the same Honeywell that makes HVAC controls?
- Thermocouple vs thermopile ignition systems — reliability difference?

HEAT PUMP COMPONENTS:
- Compressor type and supplier: Rheem ProTerra vs A.O. Smith Voltex — same compressor? Who manufactures?
- Refrigerant: R-134a vs R-290 (propane) — transition timeline?
- COP range: what separates a 3.0 COP unit from a 4.0+ COP unit? Real component differences?
- Control board reliability: documented failure patterns?
- Evaporator coil: copper-fin-aluminum vs all-aluminum? Corrosion in high-humidity environments?

PLATFORM SHARING:
- A.O. Smith, State, and American Water Heaters are all the same parent company. Which components are shared? Is a State XE the same as an A.O. Smith ProLine XE?
- Rheem, Ruud, and Richmond — same parent. Platform sharing?
- Bradford White — independent? Any shared components with other brands?
- Rinnai — does Rinnai manufacture in-house (Japan, USA) or outsource assembly?
- Navien — Korean manufacturing. Components in-house or sourced?

PARTS ECOSYSTEM:
- Which brands have parts widely stocked at independent distributors?
- Which brands require ordering direct?
- Common part numbers that cross-apply between brands?
- Typical repair cost for most common failure by sub-type

Prioritize sources from: repair technician communities (r/Plumbing, r/HVAC), teardown videos, component manufacturer spec sheets, parts distributor catalogs, trade publications. Cite all sources.
```

**Output:** Save as `knowledge/water_heaters/water_heaters_component_analysis.md`

---

## Pass 3 — Competitive Hierarchy: Top

```
How do professionals rank the top residential water heater brands against each other?

Specifically comparing:
TANKLESS: Rinnai, Navien, Noritz, Takagi
TANK: Bradford White, A.O. Smith (ProLine XE)
HEAT PUMP: Rheem ProTerra, A.O. Smith Voltex

What separates the best from the merely excellent? 

Focus on professional plumber/HVAC installer opinions, independent service/reliability data, and construction-level differences — not marketing claims. What do professionals who install and service these products daily say about relative quality?

Specific questions:
- Is Rinnai the "gold standard" for tankless? What does Navien do better? Where does Noritz fit?
- Is Bradford White genuinely better than A.O. Smith ProLine or is the pro-only distribution model creating perception bias?
- How does the Rheem ProTerra compare to the A.O. Smith Voltex for heat pump technology?
- Are there any brands that plumbers refuse to install or recommend against?
```

**Output:** Save as `knowledge/water_heaters/water_heaters_hierarchy_top.md`

---

## Pass 4 — Competitive Hierarchy: Middle and Bottom

```
Where do professionals draw the line between a good water heater and a mediocre one? Which brands sit on that line?

Specifically: How do professionals rank the following in the professional hierarchy?
- Rheem Performance Plus (Home Depot retail)
- A.O. Smith Signature (Lowe's retail)
- GE (Haier) water heaters
- Kenmore (sourced from A.O. Smith or Rheem)
- Whirlpool (private label)
- State/American (A.O. Smith sub-brands)
- Budget tankless: EcoSmart, Stiebel Eltron (electric), Camplux
- Budget tank: generic no-name, private label

I need: reliability data where available, professional installer opinions on construction quality, known reliability problems by brand, which brands professionals actively warn against, and where the floor of acceptable quality sits.

Focus on the line between "good enough for a quality home" and "builder-grade filler." What brands do plumbers refuse to spec? What is the cheapest thing a plumber would put their name on?
```

**Output:** Save as `knowledge/water_heaters/water_heaters_hierarchy_bottom.md`
