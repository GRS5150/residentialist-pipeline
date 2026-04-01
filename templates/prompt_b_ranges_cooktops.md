# Ranges & Cooktops — Per-Product Deep Dive Prompt (prompt_b)

**Scope:** Pro-style and premium residential ranges (gas, dual-fuel, induction) and built-in cooktops.
**Pool S:** Yale Appliance (Steve Sheinkopf) — gas range service rates, induction service rates

---

# Master Query

```
I'm building an independent product intelligence platform that scores residential ranges and cooktops on Quality, Performance, Durability, and Material Safety. I need a comprehensive component-level analysis of [PRODUCT NAME].

CRITICAL COMPONENT ANALYSIS — BURNER / HEATING SYSTEM:

FOR GAS PRODUCTS:
- Burner type: dual-stacked sealed, open cast, star pattern, standard sealed, or stamped aluminum?
- Burner manufacturer: Sabaf (Lumezzane, Italy), in-house, or other? Name the supplier.
- Maximum BTU per burner? Total cooktop BTU? Number of burners?
- Minimum simmer BTU? How is simmer achieved (precision valve, orifice sizing, burner geometry)?
- Gas valve manufacturer: Robertshaw, Honeywell/Resideo, White-Rodgers/Emerson, Copreci, Sabaf integrated? Name the supplier.
- Igniter type: silicon carbide (flat/round), silicon nitride, or electronic spark? Expected lifespan?
- Igniter manufacturer: Norton/Saint-Gobain, or other?
- Grate material: continuous cast iron, individual cast iron, or porcelain-coated stamped?
- Grate weight — total weight is a proxy for material quality.

FOR INDUCTION PRODUCTS:
- Number of cooking zones? Zone configuration (fixed, flex, bridge, full-surface)?
- Maximum wattage per zone? Total wattage?
- Induction coil supplier: E.G.O., in-house, or other?
- IGBT module supplier: Infineon, STMicroelectronics, or other?
- Glass-ceramic surface: Schott CERAN, other manufacturer?
- Power board architecture — modular or integrated?
- Documented power board failures or inverter issues?
- Boost mode duration and limitations?

OVEN SECTION (ranges only — skip for cooktop-only products):
- Convection system: true European (dedicated ring element + fan) or fan-assisted?
- Single fan or dual fan? System name (Wolf VertiCross, Miele TwinPower, etc.)
- Convection fan motor supplier: EBM-Papst, Fasco/Regal-Beloit, in-house?
- Infrared broiler or gas/electric standard broiler?
- Oven cavity material: true porcelain enamel, stainless, painted?
- Self-clean: pyrolytic, steam, or manual only?
- Temperature sensor: RTD or thermocouple?
- Control board/ERC manufacturer?

CONSTRUCTION & QUALITY:
- Body construction: welded stainless, bolt-together, or stamped?
- Control type: knobs (metal vs plastic), touchscreen, membrane?
- Knob-to-stem connection: D-shaft, splined, or set-screw? (affects replacement cost)
- Door engineering: spring-loaded vs soft-close hinges?
- Pro-style vs residential-style: is this genuine commercial-derived construction or cosmetic pro-style?

CROSS-CATEGORY PLATFORM SHARING (CRITICAL):
- Does this range oven section use the same cavity, convection system, control board, and heating elements as the brand's wall oven?
- If YES: which specific components are shared? This creates a mandatory platform disclosure in both the range and wall oven reports.
- Does this cooktop share components with the brand's range cooktop section?

RELIABILITY & SERVICE DATA:
- Yale Appliance service rate for this brand's gas ranges or induction cooktops (if available)
- Consumer Reports reliability data
- Most common repair for this specific product (igniter, control board, valve, element, inverter)
- Field-documented failure patterns from r/appliancerepair, repair technician forums
- Parts availability: OEM and aftermarket? Lead time? Cost?
- Service network: how easy to find a qualified repair technician?

WARRANTY:
- Full warranty (years, parts + labor)
- Extended warranty on specific components?
- Warranty exclusion patterns?

BUSINESS MODEL & MANUFACTURING:
- Where manufactured? (specific factory city/country)
- Platform sharing within brand family?
- Corporate parent and ownership structure
- Parts commitment horizon?

SAFETY:
- Any active safety recalls or CPSC complaints?
- Gas leak incidents documented?
- Door glass shatter incidents?
- Control knob fire hazard (Samsung recall pattern)?

Prioritize sources from: Yale Appliance (Pool S), Consumer Reports, Town Appliance, Orvilles.com, CNET, Reviewed.com, r/appliancerepair, RepairClinic, repair technician YouTube. Cite all sources.
```

## PRODUCT: Wolf Pro-Style Gas Range (36"/48")
slug: wolf_gas_range
Wolf Pro-Style is the Tier 1 consensus pick. Dual-stacked sealed burners with 500 BTU simmer to 20K sear — verify these specs. VertiCross dual convection in oven section — is this the same system as the Wolf M Series wall oven? Same control board? Same temperature sensor? This is the critical cross-category platform sharing question. Infrared broiler — verify vs standard gas broiler. Igniter type: confirm silicon nitride (longer-lasting) or silicon carbide. Gas valve supplier: Robertshaw or in-house? Manufactured in Fitchburg WI — confirm current. 2-year full warranty — confirm terms. Sub-Zero/Wolf factory-certified service network — coverage and response times. Town Appliance ranks Wolf #1 for serviceability — verify. r/appliancerepair tech opinions on Wolf ranges. Not in Yale gas range service data — any third-party reliability data?

## PRODUCT: BlueStar Platinum Gas Range
slug: bluestar_platinum
Open burners up to 25K BTU — verify max per burner. Commercial heritage — Reading PA manufacturing, confirm current. Prizer Estes privately held. Single-piece cast burners — alloy composition? Porcelain-enamel coating on newer Platinum models — verify. Open burner maintenance requirements vs Wolf sealed — document specific differences. Oven section: true European convection or fan-assisted? Infrared broiler? How does BlueStar's oven compare to Wolf's (VertiCross is Wolf's advantage)? Igniter type? Gas valve supplier? 1-year warranty — confirm terms. 1,000+ color customization — is this genuinely available or limited? Service network — BlueStar is smaller than Wolf/Sub-Zero, how easy to find qualified tech? Repair technician opinions on BlueStar quality and repairability. r/appliancerepair consensus.

## PRODUCT: Thermador Pro Grand Gas Range
slug: thermador_pro_grand
BSH platform. Star burners with ExtraLow simmer — verify vs Wolf 500 BTU. Steam-assist oven option — is this genuine steam injection or marketing? BSH shares platform with Bosch and Gaggenau — what specific range components are shared vs differentiated? Yale does NOT have Thermador-specific gas range service data — any available? BSH control board relay failure pattern from dishwasher category — does this carry over to range control boards? Gas valve supplier. Igniter type. Manufacturing location. 1-year warranty. Does the Thermador Pro Grand oven section share components with the Thermador wall oven? This is the critical cross-category question. Pro Harmony vs Pro Grand — what's actually different internally?

## PRODUCT: Thermador Freedom Induction Cooktop (36")
slug: thermador_freedom_induction
Full-surface induction with 48 individual 3-inch elements — verify architecture. 63% more cooking area claim — verify vs fixed-zone competitors. 4600W max — verify. Boil time sub-2 minutes documented — verify. 6.5-inch touchscreen — documented lag/responsiveness issues? Early unit out-of-box failures documented — current reliability? E.G.O. induction coils, Infineon IGBTs, Schott CERAN glass — verify component suppliers. Power board architecture — modular or integrated? Replacement cost for power board? Yale induction service rate 4.9% for Thermador — verify. BSH shares some induction components with Bosch BUT Freedom hardware is unique — confirm this differentiation at the component level. What exactly does Bosch 800 share vs not share with Freedom?

## PRODUCT: Bosch 800 Induction Cooktop (36")
slug: bosch_800_induction
BSH platform — shares core components with Thermador. Yale induction service rate 1.7% — BEST in induction category. Verify this data point. FlexInduction zones — how does bridging work? Power board shared with Thermador? Same IGBTs, same coils? 3700W max — confirm. Control interface — touch slider or touchscreen? Documented failure patterns? Parts availability through BSH network. Why is Bosch service rate (1.7%) so much better than Thermador (4.9%) if they share the platform? Is it because Freedom's complex full-surface electronics fail more? This is a key question.

## PRODUCT: GE Café Gas Slide-In Range
slug: ge_cafe_gas
Yale gas range service rate 11.7% for Café — above 6.9% category average. CRITICAL QUESTION: Why does base GE (4.8%) dramatically outperform Café (11.7%)? Is it feature complexity (WiFi, touchscreens, smart features) causing the failures? Or manufacturing quality differences? Selmer TN factory — what specific components does Café share with Monogram, Profile, and base GE? GE's owned national service network — strongest in industry, verify response times. Standard sealed burners — 18K BTU max? Igniter type. Gas valve supplier. Oven: true European convection on some models — which specific models? Control board/ERC — GE in-house or outsourced? Cross-category: Does the GE Café range oven section share components with GE wall ovens?

## PRODUCT: Samsung Gas Slide-In Range
slug: samsung_gas
CRITICAL: Samsung range recall 1.1M units for fire hazard (CPSC 2024, control knob fire issue). Document this recall fully. Cross-category pattern: control board failures, service ecosystem problems carry over from dishwashers, refrigerators, wall ovens. Fan-assisted convection (not true European) — verify. Standard sealed burners — max BTU? Igniter type? Gas valve supplier? Contracted repair network — technician availability is the real gap (parts ARE available at RepairClinic). Temperature sensor type. Oven cavity material. Dacor — confirm Samsung-sourced components. Yale does NOT have Samsung gas range service data — any available? LG comparison: Yale ranks LG at 5.5% (best non-GE) — how does Samsung compare? r/appliancerepair consensus on Samsung ranges.
