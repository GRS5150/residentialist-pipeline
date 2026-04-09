# Dishwasher Pass 2 — Component Deep Dive
## Run in Perplexity Deep Dive after Pass 1 (testing framework landscape)

---

## Purpose

Pass 1 identified that motors, control boards, pump assemblies, drying systems, and filtration are the key differentiators in residential dishwashers. This query goes component-level: who makes the parts, what are the specific specs, what fails and why.

---

## Query (copy-paste into Perplexity):

```
I'm building an independent product intelligence platform that scores residential dishwashers at the component level. I've already mapped the testing landscape and brand hierarchy. Now I need to understand the actual components inside these machines — who makes them, how they differ, and what fails.

WASH MOTORS — THE COMPONENT HIERARCHY:
- Who are the major dishwasher motor manufacturers/suppliers? (Nidec, Askoll, EBM-Papst, Welling, in-house production — name every supplier you can identify)
- Which brands use which motor suppliers? Specifically: do Bosch, Miele, KitchenAid/Whirlpool, LG, Samsung, GE source motors externally or manufacture in-house?
- LG claims vertical motor manufacturing — verify. Do they make the actual motor or assemble from sourced components?
- Miele claims full vertical integration — verify for dishwasher motors specifically
- What is the actual spec difference between a brushless inverter motor and an induction motor in a dishwasher context? (efficiency %, rated lifespan in hours/cycles, noise contribution, variable speed capability)
- What is the typical motor lifespan by type in real-world dishwasher use? (MTBF data if available)
- What motor-related failure modes do repair technicians document? (bearing failure, winding failure, capacitor failure, control board communication failure)

CIRCULATION PUMPS & DRAIN PUMPS:
- Who manufactures dishwasher circulation pumps? (Askoll, Hanning, in-house — name suppliers by brand)
- Is the circulation pump integrated with the motor or a separate component?
- What is the drain pump architecture? (AC synchronous, DC brushless, impeller type)
- Drain pump is cited as the most common Whirlpool failure — what is the specific part, what does it cost, and why does it fail?
- Are Bosch and Miele drain pumps interchangeable across their lineups or model-specific?
- What does a circulation pump replacement cost by brand? (parts + labor)
- Frigidaire has documented pump bearing failures from shaft seal leaks — is this a design flaw specific to certain model years?

CONTROL BOARDS & ELECTRONICS:
- Who manufactures dishwasher control boards? (Continental, Bitron, in-house — name the PCB suppliers)
- Do Bosch 100/300/500/800/Benchmark share the same control board or different boards?
- Is the Thermador/Gaggenau control board the same as the Bosch board?
- What does KitchenAid/Whirlpool use and does it differ from standard Whirlpool?
- What are the specific control board failure modes? (relay failure, capacitor aging, solder joint cracking, moisture intrusion, firmware issues)
- Reddit 2025 threads report Bosch control board failures on 2023-2024 production — is this a known component batch issue? Has BSH acknowledged it?
- What does a control board replacement cost by brand? Can independent techs flash/reprogram boards or is authorized service required?
- Are control boards available as replacement parts through normal supply channels, or are they model-specific and hard to source?
- Samsung control board availability — is this part of the "repair impossible" problem?

DRYING SYSTEMS — COMPONENT DETAIL:
- CrystalDry / StarDry zeolite: What is the zeolite mineral? (clinoptilolite? synthetic zeolite?) Who supplies it? What is its rated lifespan? Does it degrade over time or is it truly permanent? Where is it physically located in the machine?
- Miele CleanDry: What specific fan/blower assembly does it use? What is the auto-open mechanism? Is the AutoDos PowerDisk system a reliability asset (eliminates user error) or a liability (adds a mechanical component that can fail)?
- Heated element drying: What wattage? What is the element lifespan? Is this the energy consumption driver that makes budget dishwashers more expensive to operate despite lower purchase price?
- Condensation drying: Does it require a stainless tub to work effectively? Is this why hybrid tubs (stainless walls, plastic bottom) exist on some models?

FILTRATION SYSTEMS:
- Manual mesh filters: Are they all the same? Does Bosch use the same filter across 100/300/500/800? Does Miele's filter differ in mesh gauge or material?
- Self-cleaning filters with grinders: What is the grinder mechanism? (hard food disposer — blade type, motor, noise contribution)
- KitchenAid's two-stage manual filter on premium models — what makes it "two-stage" vs standard single-stage mesh?
- Filter-related pump damage: Repair techs cite filter neglect as the #1 cause of premature failure. What is the actual mechanism? (debris bypasses filter → damages impeller → pump replacement needed?)

RACK SYSTEMS & MOVING PARTS:
- What are rack rollers/wheels typically made of? (nylon, Delrin, other polymers)
- LG's 2026 Yale service rate spike was attributed to "one specific roller component" — what component, what model, what was the failure mode?
- Miele's loaded-adjustable middle rack — what mechanism allows this? Is it a reliability risk?
- Third rack wash jets (KitchenAid 360° Max Jets) — is this a separate pump/motor or redirected from the main wash system?
- Rack tine coating durability — is vinyl-coated steel standard across all brands? Does Miele or Cove use different coating?

DOOR HINGE & BALANCE SYSTEM:
- What is the standard door balance mechanism? (nylon-coated steel cables + torsion springs?)
- This was identified as the most common mechanical wear component — what is the typical lifespan?
- Does balance cable quality differ across price tiers? (cable gauge, roller material, spring rating)
- Cost to replace door balance system by brand?

WATER INLET VALVE:
- Is this a commodity part or does it vary by brand?
- What is the typical failure mode? (solenoid failure, diaphragm failure, debris clogging)
- Is inlet valve failure the root cause of leak events?

PLATFORM SHARING — SPECIFIC COMPONENT MAP:
- BSH platform: Which specific components are identical across Bosch 100/300/500/800/Benchmark/Thermador/Gaggenau? (motor, pump, control board, tub, spray arms, door mechanism — go part by part)
- Whirlpool/KitchenAid platform: Same question — what is shared vs upgraded between standard Whirlpool and KitchenAid?
- GE/GE Profile/Café platform: Same question
- Are any cross-brand component interchangeabilities known to repair technicians? (e.g., "I can put a Bosch 800 control board in a Thermador")

SUPPLY CHAIN & PARTS ECOSYSTEM:
- Which brands have parts widely stocked at independent parts distributors (like Marcone, Reliable Parts)?
- Which brands require ordering direct from manufacturer?
- Which brands have known parts discontinuation issues?
- What is the typical lead time for a control board replacement by brand?
- Do authorized service centers have faster parts access than independent techs?

Prioritize sources from: repair technician communities (r/appliancerepair, AppliancePartsPros forum, RepairClinic), Yale Appliance technical content, appliance teardown videos (TWB YouTube, Technology Connections), component manufacturer spec sheets (Nidec, Askoll, Hanning), iFixit-style guides, trade publications (Appliance Design magazine, AHAM technical papers), parts distributor catalogs. Cite all sources.
```

---

## What to do with the output

This becomes the dishwasher equivalent of the faucet category's knowledge file. Combined with Pass 1 (testing framework landscape), it gives you:

1. **Named component suppliers** — the dishwasher equivalent of knowing "Flühs is German, Kerox is Hungarian, Geann is Taiwanese"
2. **Platform component maps** — exactly which parts are shared across BSH, Whirlpool, GE families
3. **Failure mode specificity** — not just "control board failures" but which boards, which failure mechanism, which brands
4. **Parts ecosystem data** — which brands you can actually get fixed, quantified
5. **Spec field validation** — confirms or corrects the spec fields in the config before deep dives run

Save output as: `knowledge/dishwashers/dishwashers_component_analysis.md`

After reviewing this output with Ray, update `configs/dishwashers.json` spec fields if the component data reveals differentiators we missed. THEN run the per-product deep dives.
