# Water Heaters — Per-Product Deep Dive Prompt (prompt_b) — v1

**Scope:** Tankless gas, storage tank (gas/electric), and heat pump water heaters.
**Pool S:** VACANT — Yale Appliance does not sell or service water heaters.
**Pass 2 Intelligence Applied:** This prompt uses specific component details from Pass 2 research — heat exchanger materials, anode rod types, glass lining technologies, platform sharing intelligence.

---

# Master Query

```
I'm building an independent product intelligence platform that scores residential water heaters on Quality, Performance, Durability, and Material Safety. I need a comprehensive component-level analysis of [PRODUCT NAME].

CRITICAL: DETERMINE SUB-TYPE FIRST
- Is this a tankless gas, storage tank (gas/electric), or heat pump water heater?
- Answer ALL applicable sections below. Skip sections marked [TANKLESS ONLY], [TANK ONLY], or [HEAT PUMP ONLY] if not applicable.

=== TANKLESS-SPECIFIC COMPONENT ANALYSIS [TANKLESS ONLY] ===

HEAT EXCHANGER:
- Material: copper primary, stainless steel, or dual stainless? Rinnai uses copper primary + stainless secondary in condensing. Navien uses dual stainless. Noritz uses dual stainless. Confirm for THIS product.
- Copper thermal conductivity ~401 W/mK vs stainless ~16 W/mK — does this affect real-world heat transfer efficiency for this model?
- Condensing or non-condensing? If condensing: what does the secondary HX capture? What is the condensate pH?
- Heat exchanger warranty: how many years? Any CONDITIONS? Navien drops from 15yr to 5yr with uncontrolled recirculation — confirm for this product.
- Documented failure modes: scale buildup, stress cracking from thermal cycling, pinhole leaks from acidic condensate?
- Replacement cost estimate for heat exchanger

BURNER SYSTEM:
- Burner type: premix metal fiber (Rinnai SENSEI), premix stamped, or atmospheric?
- Who supplies the burner assembly?
- Gas valve manufacturer: Honeywell/Resideo, SIT Group, Dungs?
- Ignition type: direct spark, hot surface? Flame rod sensor type and MTBF?
- Low NOx rating? ppm level?

FAN/BLOWER:
- Motor supplier: EBM-Papst (premium), commodity?
- Brushless DC or AC?
- Noise level at max firing rate?

RECIRCULATION:
- Built-in pump and buffer tank (Navien ComfortFlow)?
- Compatible with external pump (Rinnai Circ-Logic)?
- Timer/aquastat/temperature-based activation?

=== TANK-SPECIFIC COMPONENT ANALYSIS [TANK ONLY] ===

TANK CONSTRUCTION:
- Glass lining technology: Bradford White Vitraglas, A.O. Smith Blue Diamond, Rheem standard, or other? What differentiates these at the material science level?
- Steel gauge: what thickness? Does this differ from retail-grade models of the same brand?
- Insulation: type, R-value, thickness? Non-CFC foam standard?

ANODE ROD:
- Type: magnesium (standard), aluminum (budget), powered titanium (non-depleting), stainless steel (A.O. Smith CoreGard)?
- Number of anode rods: 1 (standard) or 2 (premium)? Hex head accessible?
- Expected depletion rate in average water conditions
- Replacement cost and DIY accessibility

DRAIN VALVE:
- Material: brass (pro-grade) or plastic (retail)?
- Full-port or reduced-port?

GAS CONTROL:
- Gas valve manufacturer: Honeywell/Resideo or Robertshaw?
- Electronic ignition, standing pilot, piezo?
- Millivolt system (no external electricity required — works in power outages)?
- ICON-style intelligent gas control with LED diagnostics?

SEDIMENT MANAGEMENT:
- Self-cleaning / self-agitating system? Bradford White Hydrojet, A.O. Smith DynaClean, Rheem self-cleaning?
- Dip tube design: standard or anti-siphon?

=== HEAT PUMP-SPECIFIC COMPONENT ANALYSIS [HEAT PUMP ONLY] ===

COMPRESSOR:
- Compressor type and manufacturer: scroll, rotary, reciprocating?
- Refrigerant: R-134a (current standard), R-290 (propane — newer), R-410A?
- COP at rated conditions? COP at low ambient temperature (40°F)?
- Compressor warranty

EVAPORATOR:
- Coil type: copper-fin-aluminum, all-aluminum?
- Air filter system: top-mount, side-mount?
- Corrosion resistance in high-humidity environments?

OPERATING MODES:
- Heat pump only (max efficiency, slower recovery)
- Hybrid (heat pump + electric backup)
- Electric only (backup, fastest recovery, lowest efficiency)
- Vacation/away mode

AMBIENT REQUIREMENTS:
- Operating temperature range: what is the minimum ambient for heat pump operation?
- Space requirements: ft³ of air volume needed for optimal operation?
- Does the unit cool and dehumidify the surrounding space? Is this beneficial (basement) or problematic (small closet)?

=== SHARED SYSTEMS (ALL PRODUCTS) ===

CONTROL SYSTEM:
- Display: LED diagnostic, digital, or basic?
- Error code system: how many diagnostic codes? Are they user-readable or tech-only?
- WiFi/smart connectivity: Rinnai Control-R, Navien NaviLink, Rheem EcoNet, or none?
- Temperature adjustment: knob, digital, app?

RELIABILITY & SERVICE DATA:
- Pool S VACANT for water heaters — NO Yale Appliance equivalent exists
- Consumer Reports reliability data if available
- r/Plumbing professional consensus on this brand/model
- Most common failure mode and typical repair cost
- Parts availability: universal (every plumber stocks them) vs brand-specific (order through manufacturer)

WARRANTY:
- Heat exchanger warranty (tankless)
- Tank warranty (tank/heat pump)
- Parts warranty
- Labor warranty
- Conditional terms (Navien recirc condition, Bradford White BUILTBEST upgrade)?

PLATFORM SHARING (MANDATORY INVESTIGATION):
- A.O. Smith / State / American Water Heaters: same parent company (A. O. Smith Corp, NYSE: AOS). Which components shared?
- Rheem / Ruud / Richmond: same parent (Paloma Industries). Platform sharing?
- Bradford White: independent? Any rebadged products?
- Rinnai: Japanese-engineered, US-assembled (Griffin, GA). Component sourcing?
- Navien: Korean (Kyungdong Group). Component sourcing?
- Noritz: Japanese (Kobe). US assembly?

MANUFACTURING:
- Specific factory location
- Corporate parent chain
- Any recent acquisitions, ownership changes, or manufacturing moves?

SAFETY:
- Gas: ANSI Z21.10.1/CSA 4.1 compliance, FVIR certification, CO risk with proper venting
- Electric: UL 174 compliance
- Heat pump: UL 1995 compliance, refrigerant handling
- CPSC recalls or complaints for this specific model?

Prioritize sources from: Consumer Reports, AHRI certification data, r/Plumbing, r/HVAC, professional plumber YouTube (Roger Wakefield, ThePlumberGuy), RepairClinic, manufacturer spec sheets, WaterHeaterHub, StructureTech. Cite all sources.
```

---

## PRODUCT: Rinnai RU199iN SENSEI Condensing Tankless
slug: rinnai_ru199in
SENSEI series — Rinnai's flagship residential condensing tankless. Dual stainless steel heat exchangers, 0.95 UEF, 199K BTU, 11 GPM max. Japanese engineering (Nagoya), US assembly at Griffin, Georgia plant. Circ-Logic technology for external recirculation. 15yr HX warranty (residential). Rinnai appeared 78 times in luxury home real estate listings — this is the brand luxury builders specify by name. Investigate: Is the heat exchanger manufactured in-house in Japan or sourced? Burner type — is the SENSEI metal fiber premix or stamped? Gas valve supplier — Honeywell/Resideo or Japanese OEM? Fan motor — EBM-Papst or commodity? PCB supplier? Error code system? Parts availability through US distribution vs direct-from-Rinnai? How does the Griffin, GA assembly operation work — are components shipped from Japan and assembled, or is there US-sourced content? Technician training requirements — does servicing Rinnai require specific certification?

## PRODUCT: Navien NPE-240A2 Condensing Tankless
slug: navien_npe240a2
Navien's premium condensing tankless. Dual stainless steel heat exchangers, 0.96 UEF, 199.9K BTU, 11.2 GPM max. Built-in ComfortFlow recirculation pump + buffer tank = instant hot water, no cold water sandwich. NaviLink WiFi diagnostics. CRITICAL INVESTIGATION: Navien warranty drops from 15yr to 5yr HX with uncontrolled recirculation — what constitutes "uncontrolled" and how is this enforced? Korean manufacturing (Kyungdong Navien, Seoul). Navien has captured significant US market share from Rinnai — how? Lower price? Better features? More aggressive marketing? Investigate: burner supplier, gas valve supplier, PCB manufacturer, fan motor. ComfortFlow buffer tank — how large is it? Does it add failure points? Navien error code system — are there documented pattern failures (error codes that appear repeatedly)? Parts availability in US — is Navien's US parts network as established as Rinnai's?

## PRODUCT: Noritz EZ111DV Condensing Tankless
slug: noritz_ez111dv
Noritz condensing tankless with top-mount water connections for easy tank-to-tankless retrofit. 0.98 UEF (highest in calibration set), dual stainless HX, 11.1 GPM, 199.9K BTU. 25yr HX warranty with NO conditions (best in class — vs Navien's conditional 15yr/5yr and Rinnai's 15yr). Japanese engineering (Kobe). Investigate: Why does Noritz have the best specs (0.98 UEF, 25yr warranty) but smaller US market share than Rinnai and Navien? Is it marketing, distribution, or a product positioning issue? Heat exchanger — manufactured in-house or sourced? Is the 25yr warranty backed by component quality or aggressive marketing? Parts availability in US — thinner than Rinnai? Professional installer familiarity — do techs know Noritz as well as Rinnai?

## PRODUCT: Bradford White RG250T6N (50 gal Tank)
slug: bradford_white_rg2
The professional plumber's top choice for tank water heaters. Professional-only distribution (NOT sold at Home Depot or Lowe's). Vitraglas proprietary glass enamel lining fused at 1600°F with Microban antimicrobial. Hydrojet Total Performance System for sediment control. ICON System millivolt gas control — works without ANY external electricity (genuine advantage during power outages). Defender Safety System (FVIR). Brass drain valve, tamper-resistant. 40K BTU, 50 gal, 81 gal FHR, 0.63 UEF (atmospheric). 6yr standard warranty, BUILTBEST extendable. US-made (Middleville MI / Niles MI). Bradford White is privately held (Ambler, PA). Investigate: Is Vitraglas genuinely superior to A.O. Smith Blue Diamond at the material science level, or marketing differentiation? Steel gauge — is Bradford White actually thicker than A.O. Smith ProLine? ICON millivolt system — is the Honeywell/Resideo gas control valve the same model used across all pro-grade tanks? Anode rod — magnesium standard, how does this compare to A.O. Smith's CoreGard stainless? Professional installer preference — is the "pro-only = better" claim supported by construction data?

## PRODUCT: Rheem ProTerra XE80 Heat Pump (80 gal)
slug: rheem_proterra
Rheem's flagship heat pump water heater. 4.07 UEF — highest efficiency in calibration set (though different DOE bin than gas products). 80 gal, 87 gal FHR. R-134a refrigerant. EcoNet WiFi with diagnostics and scheduling. 10yr warranty (longest tank warranty in set). Multiple operating modes: heat pump only, hybrid, electric backup, vacation. Compressor noise ~50-55 dBA. Montgomery, AL manufacturing. Investigate: Compressor type and supplier — is this a Copeland/Emerson scroll, rotary, or reciprocating? What is the COP at rated conditions vs at 40°F ambient? R-134a to R-290 transition — when? Control board — documented failure patterns? r/HVAC has some reports. EcoNet WiFi — does smart connectivity add reliability risk? How does this compare to A.O. Smith Voltex? Are they using the same compressor? Same evaporator coil design? Recovery time in heat pump-only mode vs hybrid mode? Installation requirements — does it need 750+ ft³ of air space?

## PRODUCT: A.O. Smith ProLine XE (50 gal Tank)
slug: ao_smith_proline_xe
A.O. Smith's professional-tier tank water heater. Blue Diamond glass lining with Microban antimicrobial. CoreGard stainless steel anode rod (marketed as superior to commodity sacrificial anodes). DynaClean sediment dip tube system. Available in atmospheric gas, power vent gas, and electric. 0.72 UEF (power vent gas). 6yr standard warranty. Ashland City, TN manufacturing. PLATFORM INVESTIGATION: A.O. Smith (NYSE: AOS) also owns State Water Heaters and American Water Heaters. Is a State Select XE the SAME tank with a different label? What components are shared? Are they manufactured on the same line? A.O. Smith also has Signature series at Lowe's — is ProLine XE genuinely different? What are the specific construction differences between ProLine (pro) and Signature (retail)? Steel gauge, anode rod quality, glass lining application, drain valve material? CoreGard stainless anode — does it actually outlast magnesium in controlled testing, or is this a marketing claim?

## PRODUCT: Rheem Performance Plus (50 gal Tank)
slug: rheem_performance_plus
Rheem's mid-tier retail tank, Home Depot exclusive channel. 9yr warranty (longest in retail tier). Self-cleaning system to reduce sediment. LED diagnostic display. Enhanced anode rod vs base Performance models. Brass drain valve on some SKUs. Available in gas and electric. UEF ~0.92 (electric). PLATFORM: Rheem, Ruud, Richmond = same parent company (Paloma Industries). CRITICAL INVESTIGATION: What is the actual construction difference between a Rheem Performance Plus (retail, $550-650) and a Rheem Professional (wholesale, $400-500)? Same factory? Same steel gauge? Same glass lining process? Same anode rod? r/Plumbing has extensive debate on this — what does the evidence say? Is the "pro vs retail" quality difference real or perception? Rheem's 9yr warranty vs Bradford White's 6yr — does longer warranty = better product, or does Bradford White's pro-only model mean fewer warranty claims because of professional installation? LED diagnostics — do these add electronic failure modes to an otherwise simple appliance?
