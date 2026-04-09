# Bosch 800 Series Dishwasher (SHP78CM5N) — Independent Component-Level Quality Assessment
**Assessment Date:** March 2026 | **Target Model:** SHP78CM5N (current production variant) | **Platform:** BSH North America

***
## Executive Summary
The Bosch 800 Series (SHP78CM5N) represents BSH's mid-premium tier: genuinely well-engineered in several key areas (BLDC motor, zeolite drying, full stainless tub, ball-bearing rack system, 4-part leak protection) but with documented weaknesses (heater relay board failure mode, semi-passive upper spray architecture, non-separable motor-pump assembly, and a three-stage manual filter that is the same part used all the way down to the 100 Series). At its MSRP of ~$1,499, it occupies a defensible position against KitchenAid and GE Profile competitors while maintaining meaningful cost and serviceability advantages over Miele. Yale Appliance's 2025 data from 33,190 service calls places Bosch at a 7.8% first-year service rate, second only to Miele (5.6%) in the premium tier. Lab testing by Reviewed.com produced a 99.97% cleaning score and confirmed the industry's best drying on plastics via CrystalDry. The primary structural risk in this product is the integrated BLDC motor-pump assembly (no separable components) and a control board architecture with a historically documented heater relay solder joint failure mode that persists across BSH board generations.[^1][^2][^3][^4][^5][^6]

***
## Motor & Pump Assembly
### Motor Type and Supplier
The SHP78CM5N uses a **BLDC (brushless DC) motor with an integrated inverter drive**, confirmed by the Bosch direct OEM part description for the current circulation assembly: "Heat pump BLDC, TP3, w/ hose clamp, motor suspension strap" (part 12008381, $131.50 from Bosch.com). This is a three-phase permanent magnet motor controlled by the main control board's onboard inverter — not a separate external inverter module.[^7]

**Motor supplier:** BSH has not publicly disclosed the OEM motor supplier for the 800 Series. The **Sisme Group** (Italy) is the strongest candidate based on published specifications: Sisme's dishwasher BLDC motor line uses a three-phase brushless design with stainless steel shaft, co-moulded magnetic ring rotor designed for water contact operation, needle-wound stator, 73×73mm stator frame, output up to 70W, rotation speed up to 4,200 RPM, and pump capacities of 20–70 L/min — specifications that match BSH's published performance envelope precisely. However, this cross-reference is architectural/geometric inference; no BSH supplier disclosure or third-party teardown has confirmed Sisme as the actual vendor for the current production run. Alternative candidates include Welling and EBM-Papst; the motor is in-line with BSH's European sourcing history.[^8]
### Circulation Pump: Part Numbers, Architecture, and Pricing
The SHP78CM5N uses an **integrated motor-pump-heater assembly** — the motor is physically co-molded into the pump housing and cannot be separated from the pump body for individual component replacement. This is a deliberate design choice that reduces seal points and improves energy efficiency but eliminates the option for motor-only replacement.[^9]

Multiple pump assemblies span the product line, reflecting generational transitions:

| Part Number | Description | Price (Bosch Direct) | Compatible Brands |
|---|---|---|---|
| **12008381** | Heat pump BLDC, current SHP78CM5N | $131.50[^7] | Bosch, Thermador[^10] |
| **00442548** | Circulating Pump, legacy/cross-line | $345.99[^11] | Bosch, Thermador, Gaggenau, Kenmore[^12] |
| **00665510** | Circulating Pump, mid-generation | ~$305–335 (retailer) | Bosch, Thermador, Gaggenau[^13] |
| **00753351** | Heat Pump w/ heater (replaces 00746094) | $274.50[^14] | Bosch[^15] |

The newer 12008381 assembly at $131.50 (Bosch direct) is notably less expensive than the legacy 00442548 at $345.99 — likely reflecting the newer, more integrated design. The "newer generation" pump reported at $334 special-order in the query prompt appears to correspond to the 00665510 or 00753351 range; current Bosch direct pricing for 00753351 is $274.50.[^14][^11]

The confirmed cross-listing of 00442548 across Bosch/Thermador/Gaggenau/Kenmore validates the BSH platform-sharing model at the part-number level: the same pump serves four brands sold at vastly different price points.[^16][^12]
### Drain Pump: Type, Part Numbers, and Pricing
The drain pump is an **AC synchronous type** — confirmed by published specs: 120V~, 60Hz, 9-vane impeller, 44W, 0.8A. This is a commodity-adjacent design.[^17][^18]

Key drain pump part numbers:
- **00642239**: Current production, 9-vane, 120V/60Hz, $143.50 (Bosch direct). Cross-listed for Bosch/Thermador/Kenmore. A commodity part in the broadest sense — the same motor and impeller geometry appears across multiple Bosch/BSH generations.[^19][^18]
- **00167082**: Earlier generation, 44W, 0.8A; also cross-listed Bosch/Thermador/Kenmore.[^17]
- **00631200**: Listed at PartSelect for newer 800 Series variants (~$43.74).[^20]

The drain pump is serviceable without uninstalling the dishwasher — access is through the toe kick and a simple quarter-turn lock mechanism. This is meaningfully easier than circulation pump replacement, which requires full uninstallation and base separation.[^21][^22]
### Pump Failure Modes and Repair Costs
Documented failure modes by technicians:[^23][^24][^25]
1. **Impeller jam** from debris bypassing a clogged or improperly seated filter — the most common presentation. Causes loss of wash pressure and error codes E22/E25.
2. **Motor bearing seizure** — presents as a humming motor with no impeller rotation; resistance felt when manually turning impeller. Confirmed by r/appliancerepair technicians.[^23]
3. **Run capacitor failure** (for older induction-type motors in legacy models) — a $14 aftermarket capacitor was confirmed as a fix on older Bosch models. Note: this applies to older AC induction motors, not the current BLDC design.[^26]
4. **Shaft seal leak** — water intrusion into motor winding, leading to winding failure and complete pump replacement.

No documented filter-bypass-to-pump-failure chain has been specifically confirmed for the SHP78CM5N's filter design, but the mechanism is well-established for manual mesh filter platforms generally: a neglected or improperly reinstalled filter allows food particles to reach the pump impeller.[^27][^23]

**Repair cost estimates:**
- Circulation pump (parts only): $131.50–$345.99 depending on generation[^11][^7]
- Circulation pump (parts + labor): $400–$600; labor is significant because full uninstallation is required[^28]
- Drain pump (parts only): $43–$143[^18][^20]
- Drain pump (parts + labor): ~$250–$350 (accessible without full uninstall)[^29]

***
## Control Board & Electronics
### Architecture: Dual-Board Design
The Bosch 800 Series uses a **dual-board architecture**: a separate **main control board** (manages motor, heater relay, water valves, sensors) and a separate **UI/control module** (manages the touch interface and display). These are two distinct, independently replaceable parts.[^30][^31]

The UI module (e.g., part 11031054 — confirmed cross-listed for Bosch/Thermador/Gaggenau) is the module users interact with. The main control board is behind the door panel and handles the logic and power switching.[^30]
### Cross-Brand Part Number Verification
The following BSH control board and UI parts are confirmed cross-listed across Bosch, Thermador, and Gaggenau:

| Part Number | Type | Cross-Listed Brands | Source |
|---|---|---|---|
| **00746432** | Control Unit | Bosch, Thermador, Gaggenau | [^32][^33] |
| **00676960** | Control Board | Bosch, Thermador, Gaggenau | [^34] |
| **00475225** | Control/Fascia Panel | Bosch, Thermador, Gaggenau | [^31][^35] |
| **11031054** | Control Module (UI) | Bosch, Thermador, Gaggenau | [^30] |

These are not merely compatible across brands — they are the **same OEM parts** manufactured to the same specification. A Thermador DWHD buyer paying ~$2,500+ gets the same control module as a Bosch 800 Series buyer at $1,499. This is platform economics in practice.[^1]

**Important note on applicability to SHP78CM5N specifically:** The part numbers above are confirmed cross-listed; however, the exact main control board for the SHP78CM5N's production variants requires model-specific verification. The SHP78CM5N/22 parts diagram at Encompass and PartSelect does not list a dedicated "main control board" part — the control panel assembly (e.g., 9001811133/20004345 for SHP78CM5N/25) functions as the primary interface, and the underlying main board is accessed through it. BSH has not publicized a stand-alone main board part number for the current CrystalDry-equipped 800 Series in searchable distributor catalogs in the same way as older generations.[^36]
### PCB Manufacturer
BSH has not disclosed its PCB/electronics subcontract manufacturer for the 800 Series board. The architecture (through-hole relay on a single or double-sided PCB with conformal coating) is consistent with tier-2 European electronics suppliers; candidates frequently cited in industry circles include Bitron (Italy), but this is unverified for the current generation. The relay component itself is a standard automotive/industrial relay with well-characterized failure modes (see below).
### Failure Modes: Heater Relay Solder Joint
The **primary documented control board failure mode** is overheating of the heater relay → thermal cycling → solder joint fracture at the relay legs → loss of heating function, often presenting as a cycle that never completes or a "1" error indicating insufficient water temperature. This has been documented on Bosch dishwashers across multiple board generations, first publicly described on YouTube repair channels in 2012 and still referenced in 2024–2025 technician forums.[^37][^4][^38]

The root cause is the relay itself running at near-maximum rated current over its lifespan, which heats the solder joint to the point of fatigue failure — the joint fails before the relay contacts fail. This is not a cold solder joint in the assembly-defect sense; it is thermal fatigue from years of normal operation. The repair is a $2–5 component-level re-solder (often confirmed effective as a temporary fix) but the relay should be replaced to prevent recurrence. UpFix specifically addresses this failure mode in their Bosch board repairs.[^3][^38]

**Additional documented failure modes:**
- Control board dead after power surge/outage
- Dim or non-responsive display (UI module failure, separate from main board)
- Moisture/steam intrusion at the board connector — more common in high-humidity installations without proper ventilation gaps
### UpFix Board Repair
UpFix lists **97 Bosch dishwasher control board SKUs** as of March 2026. Repair pricing: **$159.99** (current sale price, from $219.99 list), with a 3–5 business day turnaround and 2-year warranty. This is significantly cheaper than OEM board replacement ($200–$300+ for the part alone). UpFix has confirmed component-level repair capability for Bosch boards including relay replacement.[^39][^40]
### Replacement: Plug-and-Play
Board replacement on the Bosch 800 Series is **plug-and-play** — no factory reprogramming, dealer-only unlock codes, or diagnostic adapter is required. Independent technicians can install parts sourced from any authorized distributor. This is a meaningful serviceability advantage over some competitors that require proprietary scan tools for board initialization.[^30][^31]
### Parts Availability and Repair Cost
Parts are stocked at: RepairClinic, PartSelect, AppliancePartsPros, Home Depot Parts, eReplacementParts, Marcone, Reliable Parts, and Encompass — with same-day shipping on stocked items. Bosch does not restrict distribution to authorized channels only; the brand's parts ecosystem is one of the most accessible in the industry for independent repair.[^41][^42]

**Control board repair cost:**
- UpFix component-level repair: $159.99[^40]
- OEM replacement board (parts only): $200–$300+
- Parts + independent labor: $400–$600[^43]

***
## Tub & Structural Construction
### Tub Material
**Full stainless steel tub — confirmed** for the SHP78CM5N. The Bosch 800 Series has a stainless interior on all four walls and the base. This is a distinguishing feature from the Bosch 100 Series (hybrid tub with plastic base). A full stainless tub serves two functions: (1) superior durability and resistance to staining/odor retention vs. plastic, and (2) better condensation drying performance due to stainless steel's higher thermal conductivity relative to plastic — the cold walls help condense moisture off dishes.[^44][^45][^46]

**Tub gauge:** BSH does not publish the stainless gauge in specification sheets. Industry standard for premium dishwasher tubs is typically 18-gauge (1mm), but this has not been independently measured for the current SHP78CM5N production run.
### Base/Sump Assembly
The sump area uses a **plastic sump housing integrated with a stainless tub floor**. The tub bottom is stainless; the pump-sump assembly below the tub is plastic (standard for the industry — stainless sumps exist only in commercial/restaurant equipment). The plastic sump housing is the part that contains the drain pump, circulation pump, and filter assembly.[^22]
### Door Balance System
The door balance uses a **nylon-coated steel cable with torsion springs** — confirmed by available OEM parts. The door cable (part 00610087, $8.76 at PartSelect) is the tension element; springs are sold separately or as a kit. Anchor points use plastic retainer clips in the door frame. This is standard European dishwasher door balance architecture.[^47]

**Documented failure point:** Door cables and springs are a known wear item, though less commonly reported as a failure mode on the 800 Series specifically compared to some competitor brands. Replacement parts are inexpensive ($8.76–$30 for cable; kits ~$15–$30) and accessible to DIYers. No specific recall or design defect campaign has been identified for the SHP78CM5N door balance.[^48]

***
## Drying System
### CrystalDry: Technology and Component Analysis
The Bosch 800 Series uses **CrystalDry** — a zeolite-based sorption drying system that is the defining feature differentiating the 800 Series from the 500 Series (which uses AutoAir door-pop drying).[^46][^49]

**Operating principle:** At end of wash cycle, a fan draws moist air from the tub into a sealed chamber in the dishwasher base containing zeolite beads. Zeolite adsorbs moisture (up to ~20% of its own weight), releasing energy as heat in the process. The hot, dry air is circulated back into the tub, drying dishes. During the next wash cycle, the heating element "regenerates" the zeolite by baking out the accumulated moisture as steam — this is why CrystalDry has an energy consumption overhead not present in pure condensation systems.[^50]

**Temperature:** Up to **176°F (80°C) at the zeolite chamber level** — confirmed by Bosch official documentation and the EPA Energy Star presentation. This is the source temperature inside the zeolite container; dish surface temperatures will be lower than this.[^51][^52][^50]

**Zeolite type:** BSH's wiki on zeolite drying states that "zeolite is a mineral that occurs naturally in volcanic rock and is produced synthetically for technical use" — meaning BSH uses a combination of natural and synthetic zeolite, or chooses based on availability. The specific mineral type (clinoptilolite vs. synthetic A-type or Y-type) and the supplier have **not been disclosed by BSH**. The BSH zeolite development was conducted in collaboration with the Center for Applied Energy Research in Dillingen, Germany. No third-party teardown has identified the zeolite supplier.[^53]

**Physical location:** Sealed chamber in the **base of the dishwasher**, below and behind the sump area.[^51][^50]

**Lifetime:** Never needs replacement or recharging — the regeneration cycle ensures indefinite use life under normal conditions. BSH has not published mean-time-to-failure data for the zeolite chamber integrity over 10–15+ year design life.[^51]
### Drying Technology by Bosch Series
| Series | Drying Technology | Plastic Drying |
|---|---|---|
| 100 Series | PureDry (condensation, hybrid tub) | Poor |
| 300 Series | PureDry (condensation) | Fair |
| 500 Series | AutoAir (door auto-opens post-cycle) | Good |
| **800 Series** | **CrystalDry (zeolite active drying)** | **Excellent** |
| Benchmark | CrystalDry | Excellent |

Yale Appliance states CrystalDry is **40% better drying than AutoAir** on plastics. Reviewed.com confirms: "not a bead of water left, even on plastics" after a wash cycle.[^6][^49]
### Condensation Drying and Tub Material
A full stainless tub is necessary for effective condensation drying (moisture migrates toward the cooler stainless walls). The Bosch 100 Series hybrid tub (plastic base) degrades condensation performance — this is explicitly documented by Yale Appliance. The 800 Series full stainless tub maximizes both CrystalDry performance (hot air circulates through a more thermally stable environment) and the baseline condensation effect.[^46]
### NSF/ANSI 184 Sanitization
The SHP78CM5N is **NSF/ANSI 184 certified**. The official use and care manual confirms sanitize cycle maintains temperature at **151°F–160°F** for the final rinse under the Heavy/Intensive program. The sanitize option on compatible cycles maintains approximately **158°F for at least 20 minutes**, achieving 5-log (99.999%) bacteria reduction. This meets the NSF/ANSI 184 residential dishwasher sanitization standard.[^45][^54][^55][^52][^56]

***
## Filtration System
### Filter Architecture
The Bosch 800 Series uses a **three-stage manual filter system**: a cylindrical coarse filter assembly containing an inner microfilter, plus a flat fine mesh filter surrounding it. The three components are:[^57][^58]
1. **Coarse filter** (cylindrical outer housing) — captures large food particles
2. **Fine filter** (flat mesh beneath the coarse assembly) — intercepts medium particles
3. **Microfilter** (fine inner mesh inside the cylinder) — traps fine particulate

**This is a manual filter — no self-cleaning mechanism and no hard food disposer/grinder.** Bosch's official manual recommends inspection after each wash cycle. The absence of a grinder produces lower noise levels (no grinder grinding) and eliminates pre-ground food particles from re-depositing on dishes.[^57]
### Cross-Line Part Sharing
**Confirmed:** The same filter assembly is used across the Bosch 100, 300, 500, 800, and Benchmark Series. The microfilter part number 00645038 ($40.91 at PartSelect) is a common part across the entire BSH North American dishwasher line. This is a significant serviceability advantage and also means any quality issue with the filter design affects all Bosch tier levels equally.[^59][^20]

**Filter mesh material:** Stainless steel fine mesh within a plastic housing. The coarse filter body is food-grade plastic.
### Filter-to-Pump Failure Chain
The failure chain is well-documented for manual filter platforms: (1) filter neglected or incorrectly reinstalled → (2) food debris bypasses into sump → (3) debris reaches pump impeller → (4) impeller jam or gradual bearing abrasion. r/appliancerepair technicians confirm this is the leading cause of circulation pump failure on Bosch dishwashers. The three-stage filter design provides good retention when maintained, but the manual requirement creates a single point of user-maintenance failure.[^27][^23][^24]

***
## Spray Arm Architecture
### Configuration
The Bosch 800 Series uses **two independently rotating spray arms** (lower rack and middle rack) plus a **passive overhead sprinkler/fill tube** supplying the third rack area and upper tub coverage. This is **not** the same as Miele's architecture of three full independent rotating arms.[^60][^61]

- **Lower spray arm:** Plastic construction. Houses the **PowerControl** motorized sector — a rotating section of the lower arm that can redirect wash intensity to one of four quadrants of the lower rack, controllable via the Home Connect app.[^62][^63]
- **Upper spray arm (middle rack level):** Standard rotating plastic arm.[^64]
- **Upper fill tube / third-rack sprinkler:** A fixed supply tube that feeds a sprinkler distributing water to the third rack and overhead coverage. Part 00745855/11018097 (fill tube) and 00745856 (spray arm top with inlet pipe). This is not a true third spray arm — it is a passive distribution system.[^61]

**Wash levels:** 5 levels confirmed.[^65]
### Spray Arm Materials
All spray arms are **plastic** construction — this is universal across all consumer dishwasher brands including Miele at this price tier. Stainless spray arms exist only in commercial equipment.

***
## Rack System
### Overview
| Feature | SHP78CM5N Specification |
|---|---|
| Number of racks | 3 |
| Place setting capacity | 16[^54] |
| Third rack type | Flexible 3rd Rack with adjustable tines + wash jets from fill tube above[^54][^45] |
| Middle rack adjustability | RackMatic: 9 positions, 3 height levels[^66] |
| Can middle rack adjust while loaded? | Yes — "one-step" adjustment while loaded[^67] |
| Glide system | EasyGlide Plus: ball-bearing wheels on all three racks[^68] |
| Tine coating | Nylon (standard at this price tier) |
### RackMatic vs. Miele
Miele claims its FlexLine rack as unique for ease-of-adjustment. Bosch's RackMatic does allow adjustment while loaded, but Yale Appliance notes Miele racks have "more flexible adjustment points and better tine designs for securing silverware" compared to Bosch across the line. This is a subjective loading ergonomics distinction rather than a functional performance gap.[^69][^67]

The **third rack** on the 800 Series ("Flexible 3rd Rack" / "MyWay rack" on some variants) accommodates deeper items like cups and bowls via fold-down wings — a meaningful upgrade over the flat silverware tray on the 300 Series.[^59]

***
## Noise
### Manufacturer Rating and Validation
Manufacturer-rated: **42 dBA**. Consumer Reports rates the noise performance **"excellent"** in its independent testing. A user-conducted real-time decibel meter test of a running 800 Series confirmed the rating is consistent with real-world performance. The dishwasher is rated as the quietest Bosch line below the Benchmark (38 dBA).[^1][^45][^46][^70][^71]
### Noise Reduction Architecture
Contributors to the 42 dBA rating:
1. **BLDC motor** — significantly quieter than AC induction motors due to absence of magnetic hum at line frequency and smooth torque delivery
2. **Full stainless tub** — higher mass and damping compared to plastic; stainless tub acts as a resonance damper
3. **Multi-layer insulation blanket** — fiberglass acoustic insulation wraps the exterior of the tub, confirmed during circulation pump replacement procedures[^22]
4. **Manual filter** — no food grinder eliminates grinding noise; this is a primary reason Bosch's noise ratings consistently outperform grinder-equipped American brands
5. **Integrated motor-pump design** — fewer mechanical seal faces reduces vibration transmission paths

***
## Energy & Water
| Metric | Value | Standard |
|---|---|---|
| Annual energy consumption | 240 kWh/year[^45][^72] | US Federal Standard: 307 kWh/yr |
| % better than federal standard | 22%[^72] | — |
| Water use per cycle | 3.2 gallons[^44][^72] | Industry average: 3–6 gal |
| ENERGY STAR certified | Yes[^72][^45] | — |
| ENERGY STAR Most Efficient | Not confirmed for current model | — |

The 240 kWh/year figure is from the EPA ENERGY STAR certified product database for the SHP78CM5N — not a manufacturer-estimated figure. CrystalDry's regeneration cycle adds a modest energy overhead (small heating element to bake zeolite dry), but the overall annual consumption remains well below the federal standard.[^50][^72]

***
## Leak Protection: AquaStop
The Bosch 800 Series includes **24/7 AquaStop** — a 4-part leak protection system, not a simple float switch:[^66][^73][^74]

1. **Double-walled supply hose** — any leak within the hose is contained in the outer wall and drained safely rather than flooding under the unit
2. **Electronic safety valve** at the water inlet — cuts off water supply within seconds of leak detection, even when the machine is off (passive protection from residual pressure)[^75]
3. **Base pan** — sealed tray beneath the tub designed to contain any internal leak and direct it to the sensor
4. **Float switch sensor** in the base pan — rising water lifts the float, triggering the electronic valve and activating the drain pump to evacuate accumulated water[^73][^76]

This system triggers the **E15 error code** when water is detected in the base pan. The AquaStop hose is VDE Class A+ certified for flood prevention, validated against 72-hour continuous water exposure. This is a meaningfully more robust system than the single-float-switch-only designs found in most mid-tier American brands.[^74][^20]

***
## Reliability & Service Data
### Yale Appliance Service Rate (Primary Dataset)
Yale Appliance (Boston/Cape Cod/Southern NH market) is the most consistently cited source for appliance-specific service rate data. Their 2025 analysis covers 33,190 real service calls:[^2]

| Brand | 2025 Service Rate | 2024 Service Rate | 2023 Service Rate | 2020 Service Rate |
|---|---|---|---|---|
| Miele | 5.6% | ~10.1% | — | — |
| Bosch Benchmark | 7.7% | — | — | — |
| **Bosch** | **7.8%** | **5.9%** | **5.1%** | **11.1%** |
| Thermador | 8.1% | 5.9% | 5.9% | 14.5% |
| KitchenAid | 8.2% | — | — | — |
| LG | 11.6% | 4.0% | 3.5% | 6.2% |

Sources:[^77][^78][^2]

Note: Yale's 2025 data shows Bosch at 7.8% (slight increase from 5.9% in 2024), which Yale explicitly attributes to volume changes and normal statistical variation rather than a quality degradation trend. The 2026 Yale video specifically notes Bosch and Thermador "share the same platform and show nearly identical reliability".[^79][^2]
### Design Life
Multiple independent sources and repair professionals cite a **12–15 year expected lifespan** for the Bosch 800 Series under normal maintenance. This is above the industry average of 8–10 years for standard dishwashers. BSH has not published an official MTBF specification.[^80][^81][^82]
### Parts Availability Commitment
BSH has not published a formal parts availability guarantee (e.g., "10 years from production end") in US documentation. Parts for models going back to the early 2000s remain stocked at Marcone and Encompass, suggesting a de facto 15+ year support window.

***
## Top 3 Documented Failure Modes (Technician Reports)
Based on r/appliancerepair, AppliancePartsPros forum, Yale Appliance service data, and repair video documentation:

**1. E24 Drainage Failure — Most Common**
Blocked drain pump impeller or clogged filter → water cannot drain → E24 code. Usually caused by food debris, labels, or glass shards reaching the pump through a neglected or improperly seated filter. Inexpensive to resolve if caught early (clean filter, clear impeller); costly if impeller damage has occurred. This is the #1 service call type for Bosch dishwashers.[^27]

**2. Control Board Heater Relay Failure**
Thermal fatigue at heater relay solder joint → dishwasher fails to heat → cycle never completes or produces error. Well-documented across multiple board generations since at least 2012. UpFix specifically addresses this as the primary Bosch board repair they perform. A late-2025 r/appliancerepair thread notes a screen inside the wash motor as an "emerging" failure pattern on newer units, suggesting the 2023–2024 production run may have a secondary motor intake screen issue separate from the legacy relay problem.[^37][^3][^4][^83]

**3. E15 Leak Detection / Inlet Valve Failure**
Water in base pan triggers E15, locks the unit in drain-only mode. Most common root cause: **faulty inlet valve that does not fully close**, allowing slow overfill into the base pan. Also caused by: hose leaks, excess detergent foam, shaft seal failure. Inlet valve replacement is a DIY-accessible repair (access valve part 10023852, $30.62 at PartSelect).[^20]

***
## Parts & Serviceability
### Independent Repair Accessibility
Bosch dishwashers are among the **most independently serviceable premium brands** in the US market. Key factors:

- **No proprietary diagnostic lock:** Test mode is entered via a documented key-dance sequence; error codes are readable without a dealer scan tool.[^84]
- **Plug-and-play board replacement:** No factory programming or cryptographic pairing required.[^30][^31]
- **Wide parts distribution:** Parts stocked at RepairClinic, PartSelect, AppliancePartsPros, Home Depot Parts, Marcone, Reliable Parts, Encompass — same-day shipping on stocked items.[^41][^42]
- **Extensive repair documentation:** AppliancePartsPros YouTube channel has model-specific replacement videos for virtually every Bosch component.[^33][^21][^31]

The main serviceability challenge is **circulation pump replacement**, which requires full uninstallation of the dishwasher and base-to-tub separation — a ~2-hour job for an experienced technician, longer for a first-timer.[^22]
### Typical Lead Times and Repair Costs
| Repair Type | Parts Cost | Total (Parts + Labor) | Lead Time |
|---|---|---|---|
| Drain pump (00642239) | $43–$143[^18][^20] | $250–$350 | Same-day shipping |
| Circulation pump (12008381) | $131.50[^7] | $400–$600[^28] | Same-day (Bosch direct) |
| Control board (UpFix repair) | $159.99[^40] | ~$350–$450 | 3–5 day repair + return |
| Door cable | $8.76–$30[^48][^47] | $100–$150 | Same-day |
| Inlet valve | ~$30[^20] | $150–$250 | Same-day |

***
## Warranty
| Coverage | Term | Notes |
|---|---|---|
| Full appliance (parts + labor) | 1 year[^85][^56] | First purchaser only |
| PCB, microprocessor, racks | Up to 5 years[^85][^86] | Parts only after year 1 |
| Inner tub liner (rust-through) | Lifetime[^85] | |
| Transferable? | **No**[^87] | Non-transferable |
| Extended warranty (Appliance Service Plan) | 1, 2, or 4 years additional[^85] | Purchased separately |

The 5-year coverage on the control board and microprocessor is the most valuable extended term — specifically covering the heater relay failure mode that typically manifests in years 3–7. The non-transferability clause is a meaningful limitation for buyers of homes with existing Bosch dishwashers.

***
## Business Model & Manufacturing
### Manufacturing Location
**New Bern, North Carolina, USA** — confirmed by BSH's official press releases and Bosch's US website. The New Bern facility has been manufacturing dishwashers since 1997 and recently surpassed 10 million units produced. BSH invested $32 million in a 100,000 sq. ft. expansion in 2019 and an additional $11 million in 2025 to expand the site into a cooking and dishwashing R&D/innovation hub with 199 new jobs.[^88][^89][^90][^91]
### Ownership
BSH (Bosch und Siemens Hausgeräte GmbH) became a **wholly owned subsidiary of Robert Bosch GmbH** on January 5, 2015, when Bosch acquired Siemens's 50% stake for approximately €3 billion. There have been no ownership changes since. BSH manufactures under the Bosch, Thermador, Gaggenau, Siemens, and Neff brands globally.[^92][^93][^94][^95]
### Platform Sharing
BSH's platform sharing is confirmed at the part-number level across Bosch, Thermador, and Gaggenau for:
- Control boards/modules: 00746432, 00676960, 00475225, 11031054 (all confirmed)[^32][^34][^30][^31]
- Circulation pump: 00442548 (Bosch/Thermador/Gaggenau/Kenmore)[^16][^12]
- Drain pump: 00642239 and 00167082 (Bosch/Thermador/Kenmore)[^17][^19]
- Filter: Same assembly across 100/300/500/800/Benchmark[^59]
- Spray arms: Cross-listed Bosch/Thermador/Gaggenau[^96]

The Thermador DWHD Star Sapphire ($2,400+) shares these core components with the $1,499 Bosch 800 Series. Key differentiation between BSH tiers is primarily aesthetics, noise insulation, and feature software — not fundamental mechanical components.

***
## Expert & Professional Opinion
### Yale Appliance / Steve Sheinkopf
Yale's expert position (2025–2026): The 800 Series is the "**best all-around performance without paying the Benchmark premium**". CrystalDry delivers 40% better drying on plastics vs. AutoAir (500 Series). Bosch placed **second in washing behind Miele** and **first in drying** in Yale's comparative testing. Yale recommends the 800 Series over the 500 for anyone who dries plastic containers regularly. For the quietest possible Bosch, the Benchmark (38 dBA) is preferred over the 800 (42 dBA).[^59][^46][^49][^97]
### Repair Technician Community (r/appliancerepair)
Technician consensus from r/appliancerepair (2024–2025):
- Bosch is consistently described as one of the more serviceable premium brands due to plug-and-play parts[^98]
- Most common tech call: E24 drainage (filter + drain pump)[^27]
- Heater relay board failure well-known across all generations[^37][^4]
- A December 2025 thread ("Bosch has officially Bosched their dishwashers") cites motor screen blockage as an emerging issue in newer production: "Most common failure is a screen inside the wash motor. Warranty would kick in at that point."[^83]
- General sentiment: Bosch remains one of the preferred brands to repair due to parts availability and straightforward diagnostic access
### Bosch 800 vs. Tier Above (Miele G7000) and Tier Below (Bosch 500)
| Dimension | Bosch 500 Series | **Bosch 800 Series** | Miele G7000 Series |
|---|---|---|---|
| Price | ~$999–$1,100 | **~$1,299–$1,499[^1]** | ~$1,699–$2,200 |
| Drying (plastics) | AutoAir — good | **CrystalDry — excellent[^6]** | AutoOpen + AutoDry — very good |
| Noise | 44 dBA[^46] | **42 dBA[^1]** | 38–40 dBA |
| Spray arms | 2 + passive top | **2 + passive top + PowerControl** | 3 full independent arms |
| Service rate (Yale 2025) | ~7.8% (Bosch brand) | **~7.8%[^2]** | 5.6%[^2] |
| Third rack | Flex rack | **MyWay/Flexible 3rd rack** | 3D MultiFlex tray |
| Parts ecosystem | Excellent | **Excellent[^41]** | Good (more dealer-dependent) |
| Warranty | 1 yr P+L | **1 yr P+L; 5 yr PCB[^85]** | 1 yr P+L (2 yr with installer) |
| Design life | 12–15 yr | **12–15 yr[^80]** | 20+ yr (Miele claim) |

The 800 Series vs. 500 upgrade is justified primarily for CrystalDry and the PowerControl spray arm. The step up to Miele G7000 buys meaningfully better noise, three true independent spray arms, superior rack flexibility (Miele FlexLine), and historically better long-term reliability — at a ~$400–$700 premium.

***
## Field Performance: Documented Issues After 2+ Years
### Common Owner-Reported Issues (2023–2026)
Based on r/Appliances, r/appliancerepair, and owner report aggregation:

1. **Control board/won't start failures** at 2–4 years — consistent with the heater relay failure mode. Multiple threads in 2024–2025 describe 800 Series units failing to start or complete cycles.[^99][^100][^101]
2. **Cleaning performance degradation** linked to filter neglect — owners reporting poor cleaning at 8–12 months, typically resolved by thorough filter cleaning.[^102]
3. **E15 / water in base** — inlet valve slow-leak or overfill — reported at varied ages, most commonly after 2–5 years.[^20]
4. **Door alignment / mounting bracket issues** — installation-related; Bosch's thin stainless door requires precise leveling and mounting; off-level installation leads to door seal issues.[^103]
5. **Excessive rinse aid consumption** reported by some owners when running CrystalDry cycles — this is a calibration issue, not a defect.[^103]
6. **Short-term failures** (< 6 months): One r/Appliances thread from March 2025 describes an 800 Series unit dying at 4 months — this is exceptional, not representative, and would fall under warranty.[^99]
7. **Motor screen blockage** (emerging, 2023–2024 production): r/appliancerepair technicians flagging a screen inside the wash motor assembly blocking and causing wash failure — covered under warranty at current production ages.[^83]
### Real-World Drying Performance
Reviewed.com: "not a bead of water left, even on plastics". Bosch 800 Series SGX78B55UC testing produced 100% dry dishes including plastics in every test cycle. Owner consensus confirms CrystalDry is the most effective plastic-drying system available in consumer dishwashers below Miele's price tier. The primary owner technique note: dishes must be angled to allow water runoff during the wash phase before CrystalDry activates.[^104][^6][^105]
### Real-World Cleaning Performance
Reviewed.com lab: **99.97% clean score**. Consumer Reports rates washing "very good". Yale testing: second only to Miele in cleaning performance, with Bosch outperforming LG, GE Profile, and KitchenAid in comparative tests. The PowerControl arm provides meaningful practical benefit for mixed loads — allowing heavy blast mode on one half of the lower rack while fine china on the other receives lighter coverage.[^5][^63][^97][^71]
### Customer Service Experience
Bosch factory service: flat $179 diagnostic fee + $20 per 6 minutes labor + parts for out-of-warranty calls (Canada pricing cited; US similar). Independent repair is fully viable and not discouraged by parts restrictions. Warranty claim experience per consumer forums: generally straightforward for clearly defective units, but owners report frustration when failures occur just post-warranty, and the non-transferability clause creates friction for second owners.[^85][^87][^106]

***
## Known Design Limitations and Open Research Questions
### Confirmed Limitations
- **Heater relay solder joint failure** is a multi-generation design issue that has not been visibly resolved through board redesigns documented in public forums
- **Integrated motor-pump assembly** precludes motor-only replacement; the 12008381 assembly at $131.50 is economical, but the repair labor cost (~$400–$600 total) is the primary barrier[^28]
- **Manual filter** requires consistent user maintenance; absent this, the filter-to-pump failure chain is a meaningful reliability risk
- **Non-transferable warranty** limits resale value benefit
### Unresolved/Unconfirmed Questions
- **Exact motor OEM supplier**: Sisme is the strongest candidate based on published motor specifications but is not confirmed by BSH disclosure or third-party teardown
- **PCB manufacturer**: Not disclosed by BSH; Bitron is a frequently cited candidate but unverified for current generation
- **Zeolite supplier and type**: BSH has not disclosed the specific zeolite supplier or whether natural (clinoptilolite) or synthetic zeolite is used in current production
- **Exact tub gauge**: BSH does not publish the steel gauge specification
- **Main control board part number for current SHP78CM5N production** (2024–2025 variants): Not confirmed in public distributor catalogs under a single searchable part number; current model likely uses a platform board distinct from the older 00746432/00676960 generation
- **Motor screen failure pattern** (2023–2024 production): Emerging issue noted by r/appliancerepair technicians but insufficient public data to confirm as a systemic defect vs. installation-related failures

---

## References

1. [SHP78CM5N Dishwasher | BOSCH US](https://www.bosch-home.com/us/en/product/dishwashers/top-controls/SHP78CM5N) - 800 Series Dishwasher 24'' Stainless Steel Anti-fingerprint. SHP78CM5N. 4.5 (4140). Answers: 35 ; Ov...

2. [5. Lg: 11.6%](https://blog.yaleappliance.com/most-reliable-dishwashers) - Top 5 most reliable dishwashers for 2026, ranked by service rate using 33,190 real repair calls acro...

3. [Bosch Dishwasher Heater Relay Repair Part 2 - YouTube](https://www.youtube.com/watch?v=3nLN3WO3RQY) - This video shows why the solder contact on the control board module overheats. The relay contacts ha...

4. [Bosch Dishwasher Heater Relay Repair Part 1 - YouTube](https://www.youtube.com/watch?v=Jb8gAnMb2zQ) - Video shows how to replace a defective heater relay on a control board module for a Bosch SHE44C dis...

5. [Bosch 800 series SHP78CM5N dishwasher review](https://www.reviewed.com/dishwashers/content/bosch-800-series-shp78cm5n-dishwasher-review) - In our lab tests, this Bosch got dishes 99.97% clean—practically spotless, from a testing perspectiv...

6. [The Best Dishwashers That Dry Your Dishes of 2026 - Reviewed](https://www.reviewed.com/dishwashers/best-right-now/the-best-dishwashers-that-dry-your-dishes) - The Bosch 800 Series SHP78CM5N is the best dishwasher that dries dishes. After a wash cycle there wa...

7. [12008381 Heat pump | BOSCH US](https://www.bosch-home.com/us/en/product/12008381) - Heat pump BLDC, TP3, w/ hose clamp, motor suspension strap. 12008381. $131.50.

8. [Electric Motors For Dishwashers - Sisme Group](https://sisme.it/en/motors-for-home-appliances/water-movement-motors/) - Three-phase brushless motor controlled by external inverter; · Stainless steel shaft; · Rotor with c...

9. [Does my dishwasher need a new motor or circulation pump?](https://www.facebook.com/groups/110936289745387/posts/1670055577166776/) - Check your water level and clean filter screen with soft brush make sure there's nothing caught in s...

10. [Official Bosch 12008381 Dishwasher Circulation Pump with Heater](https://www.partselect.com/PS11724988-Bosch-12008381-Dishwasher-Circulation-Pump-with-Heater.htm) - OEM 12008381 - Dishwasher Circulation Pump with Heater - replacement. We offer authentic parts, and ...

11. [00442548 Circulating Pump | BOSCH US](https://www.bosch-home.com/us/en/product/00442548) - Enter your Model Number above to view accessories and cleaners for your appliance. It can be found o...

12. [Official 00442548 Circulation Pump - Home Depot Repair Parts](https://www.appliancerepair.homedepot.com/HD8715481-Bosch-00442548-Circulation-Pump.htm) - Circulation Pump 00442548. Official part for Bosch, Thermador, Gaggenau, Kenmore. 8715481-1-M-Bosch-...

13. [00665510 Bosch Dishwasher Circulating Pump - Part Advantage](https://www.partadvantage.com/bos-00665510.html) - Engineered for compatibility with Bosch, Thermador, and Gaggenau appliances, this reliable part ensu...

14. [00753351 Heat pump | BOSCH US](https://www.bosch-home.com/us/en/product/00753351) - Heat pump 110-120 V,60 Hz, 3000 RPM, with seal ring, hose clamp Ferrit. 00753351. Replacement for. 0...

15. [Bosch 00753351 Dishwasher Circulation Pump with Heater ...](https://business.walmart.com/ip/Bosch-00753351-Dishwasher-Circulation-Pump-with-Heater-replaces-00746094-753351-Genuine-Original-Equipment-Manufacturer-OEM-part/13888371556) - Bosch 00753351 Dishwasher Circulation Pump with Heater (replaces ... Current price is USD$183.56$183...

16. [Bosch Dishwasher Circulation Pump Replacement | Repair Clinic](https://www.repairclinic.com/Shop-For-Parts/a9b129c36i355/New/Bosch-Dishwasher-Pump-Circulation-Pump-Parts) - Find a Bosch Dishwasher Circulation Pump replacement at Repair Clinic with same-day shipping, 365-da...

17. [Dishwasher Drain Pump for Bosch | McCombs Supply Co | 00167082](https://mccombssupply.com/exact-replacement-part-00167082-for-bosch-thermador-dishwasher-drain-pump/) - Exact Replacement Part number 00167082. Dishwasher Drain Pump. 44 Watts, 0.8 Amps, 120 Volts, 60Hz. ...

18. [00642239 Drain Pump | BOSCH US](https://www.bosch-home.com/us/en/product/00642239) - Drain Pump. 00642239. Replacement for. 00184178 · Check appliance compatibility · Specifications · M...

19. [00642239 Dishwasher Drain Pump Motor Replacement for Bosch ...](https://www.speedyapplianceparts.com/00642239-dishwasher-drain-pump-motor-replacement-for-bosch/) - Replacement drain pump motor used for some Bosch, Kenmore, and Thermador dishwasher models. Directly...

20. [Bosch Dishwasher SHP78CM5N/22 - OEM Parts & Repair Help](https://www.partselect.com/Models/SHP78CM5N!2F22/) - A complete guide to your SHP78CM5N/22 Bosch Dishwasher at PartSelect. We have model diagrams, OEM pa...

21. [How To: Bosch/Thermador/Gaggenau Drain Pump 00611332](https://www.youtube.com/watch?v=lF28hgv1Mgk) - 0:00 Introduction and Safety 0:30 Tools and Parts Overview 1:00 Remove Door Panels 1:45 Access Drain...

22. [Bosch Dishwasher Circulation Pump Replacement #442548](https://www.youtube.com/watch?v=FsjE7CTwUIk) - This video provides step-by-step instructions for replacing the circulation pump on Bosch dishwasher...

23. [Bosch Dishwasher Circulating Pump Not Working](https://www.reddit.com/r/appliancerepair/comments/1coiieo/bosch_dishwasher_circulating_pump_not_working/)

24. [Bosch dishwasher circulation issue - impeller+seal?](https://www.reddit.com/r/appliancerepair/comments/13xftfx/bosch_dishwasher_circulation_issue_impellerseal/)

25. [Bosch Error Code E-24, Drain Problem , Easy FIX, Resolved](https://www.youtube.com/watch?v=tHy05OiTcyI) - This is very easy to follow clear video of step by step. How to troubleshoot and FIX E24 code on dis...

26. [Bosch Not Washing - Circulation Pump?](https://www.reddit.com/r/appliancerepair/comments/16geg6d/bosch_not_washing_circulation_pump/)

27. [Most Common Bosch Dishwasher Repair Problems and How to Fix ...](https://promixappliance.com/post/bosch-dishwasher-common-problems) - Most Common Bosch Dishwasher Repair Problems and How to Fix Them ; Clogged dishwasher filter. Blocke...

28. [How Much Does It Cost to Repair Bosch Dishwashers?](https://howlongitlasts.com/repair-cost/how-much-does-it-cost-to-repair-bosch-dishwashers/) - Bosch dishwasher repairs vary more than many people expect, mainly because the machines use tightly ...

29. [Bosch Dishwasher Repair Guide: What Fails, Why, and ...](https://howlongitlasts.com/bosch-dishwasher-repair-guide-what-fails-why-and-how-much-it-costs-to-fix/) - Bosch dishwashers frequently face similar repair issues such as poor draining, insufficient cleaning...

30. [Bosch/Thermador/Gaggenau Dishwasher Control Module 11031054](https://www.youtube.com/watch?v=s_bbHS_3a7c) - 0:00 Introduction and Safety 1:15 Remove Door Handle 2:30 Disconnect Outer Panel 4:00 Remove Control...

31. [How To: Bosch/Thermador/Gaggenau Control Panel 00475225](https://www.youtube.com/watch?v=kA9IacIBCnU) - This Bosch/Thermador/Gaggenau made Dishwasher Control Panel replaces the following older part number...

32. [00746432 Bosch Dishwasher Control Unit | Home Depot Repair Parts](https://applianceparts.homedepot.ca/product/thermador_bosch_dishwasher_control_unit_00746432) - This is a genuine OEM part that works for some models of Bosch, Thermador, and Gaggenau models. The ...

33. [How To: Bosch/Thermador/Gaggenau Control Assembly 00746432](https://www.youtube.com/watch?v=7huGhPNYgwo) - 0:00 Introduction and Safety 1:30 Remove Door Panel 3:45 Disconnect Wiring Harnesses 5:15 Remove Han...

34. [How To: Bosch/Thermador/Gaggenau Control Board 00676960](https://www.youtube.com/watch?v=ZhcaX1WfG-w) - This Bosch/Thermador/Gaggenau made Dishwasher Control Board replaces the following older part number...

35. [00475225 Bosch Dishwasher Fascia Panel - Reliable Parts](https://www.reliableparts.com/bos-00475225.html) - This panel is crafted specifically for Bosch dishwashers but is also compatible with Thermador and G...

36. [New OEM Replacement for Bosch Dishwasher Control Panel ...](https://rabonservices.com/products/new-oem-replacement-for-bosch-dishwasher-control-panel-9001811133) - Item Specifics Condition: Open box Condition Description Brand Bosch Compatible Model SHP78CM5N/25 S...

37. [Bosch Control Board Repair Tips](https://www.youtube.com/watch?v=RLdi-PgvAnU) - I am showing general information that hopefully answers some of the many questions that I get about ...

38. [Bosch Dishwasher Doesn't Heat - 20 Cent Solution - Easy Fix](https://www.youtube.com/watch?v=FwxvBN1J7fg) - How to easily solder the heating relay on your Bosch Controller to get the heater working again. QUI...

39. [489004 Bosch Dishwasher Control Board Repair - UpFix](https://www.upfix.com/product/489004-bosch-dishwasher-control-board-repair/) - SKU: 24085. 489004 Bosch Dishwasher Control Board Repair. 0.0 star rating ... replace the part entir...

40. [BOSCH Dishwasher Control Board - UpFix](https://www.upfix.com/product-category/appliances/dishwasher/bosch-dishwasher/) - We will quickly repair your dishwasher control circuit board. We do more than just repair the part, ...

41. [Bosch Dishwasher Circulation Pump Motor Replacement](https://www.repairclinic.com/Shop-For-Parts/a9b129c53i2084/New/Bosch-Dishwasher-Motor-Circulation-Pump-Motor-Parts) - Find a Bosch Dishwasher Circulation Pump Motor replacement at Repair Clinic with same-day shipping, ...

42. [Bosch Dishwasher Main Control Board Replacement | Repair Clinic](https://www.repairclinic.com/Shop-For-Parts/a9b129c13i1995/New/Bosch-Dishwasher-Circuit-Board-Timer-Main-Control-Board-Parts) - Find a Bosch Dishwasher Main Control Board replacement at Repair Clinic with same-day shipping, 365-...

43. [Control board repair vs $1299 new Bosch from Costco - just upgrade?](https://www.reddit.com/r/appliancerepair/comments/1r2zcar/control_board_repair_vs_1299_new_bosch_from/) - Fix: $1100 (inflated price?) New upgraded dishwasher: $1299. $200 difference. Questions: Worth shopp...

44. [Bosch 800 Series 24 " Top Control Smart Built In Tub Dishwasher ...](https://www.bestbuy.com/product/bosch-800-series-24--top-control-smart-built-in-tub-dishwasher-with-3rd-rack-and-crystaldry-42-dba-stainless-steel/J3P322SZSY) - Specifications · Color Finish: Stainless steel · Product Height: 33 7/8 inches (The out of box heigh...

45. [[PDF] 24" Pocket Handle Dishwasher - Bosch](https://media3.bosch-home.com/Documents/20595211_SHP78CM5N%20Spec%20Sheet.pdf) - Tub material. Stainless Steel. Concealed water heating element. Yes. Leak ... 800 Series – Stainless...

46. [Bosch Dishwasher Buying Guide: 100 vs. 500 vs. 800 Series](https://www.youtube.com/watch?v=3ZEPjaHYWuw) - Download our FREE Dishwasher Buying Guide: https://blog.yaleappliance.com/free-dishwasher-buying-gui...

47. [Official Bosch 00610087 Dishwasher Door Cable – PartSelect.com](https://www.partselect.com/PS8727128-Bosch-00610087-Dishwasher-Door-Cable.htm) - OEM 00610087 - Dishwasher Door Cable - replacement. We offer authentic parts, and the expert advice ...

48. [Bosch Dishwasher Door Cable Replacement | Repair Clinic](https://www.repairclinic.com/Shop-For-Parts/a9b129c71i2734/New/Bosch-Dishwasher-Hinge-Door-Cable-Parts) - Find a Bosch Dishwasher Door Cable replacement at Repair Clinic with same-day shipping, 365-day retu...

49. [Best Bosch Dishwashers for 2025: Reliable Models & Ones to Avoidblog.yaleappliance.com › the-best-bosch-dishwashers-ratings-reviews-prices](https://blog.yaleappliance.com/the-best-bosch-dishwashers-ratings-reviews-prices) - Get expert-tested reviews on the best Bosch dishwashers for 2025. Compare models, drying tech & reli...

50. [Bosch](https://www.energystar.gov/sites/default/files/asset/document/3%20-%20ENERGY%20STAR%20Products%20-%20Energy%20Efficiency%20and%20High%20Performance%20-%20Bosch%20-%20508%20Compliant.pdf)

51. [Bosch Dishwashers CrystalDry™ Technology and Demonstration](https://www.youtube.com/watch?v=GKhsFROYqNQ) - Bosch's patented CrystalDry™ technology transforms moisture into heat to get dishes, including plast...

52. [[PDF] Use and Care Manual SHP78CM5N | Bosch](https://media3.bosch-home.com/Documents/9001641455_A.pdf) - NSF/ANSI 184 Certified residential dishwashers are not intended for licensed ... There is detergent ...

53. [Zeolite drying](https://wiki.bsh-group.com/en/wiki/Zeolite_drying)

54. [Bosch SHP78CM5N 800 Series 24 inch Smart Pocket Handle Built ...](https://www.homery.com/product/bosch-shp78cm5n) - The Bosch 24" Smart 800 Series Pocket Handle Built-In Dishwasher by Bosch comes with 16 Place Settin...

55. [How to Set Bosch Dishwasher to Sanitize - YouTube](https://www.youtube.com/watch?v=stmmkSCMjPA) - Task: Activate Sanitize for high-temperature cleaning. Steps to Perform: Select Cycle: Choose a comp...

56. [Bosch SHP78CM5N 800 Series 24 Inch Wide 16 Place Setting Built ...](https://www.fergusonhome.com/bosch-shp78cm5/s1855650) - Bosch 800 Series dishwashers now combines advanced cleaning with the ultimate dry. ... Covered under...

57. [Dishwasher](https://media3.bosch-home.com/Documents/9000723142_A.pdf)

58. [[PDF] Dishwasher - Bosch](https://media3.bosch-home.com/Documents/9000562447_A.pdf)

59. [Bosch Shv78cm3n](https://blog.yaleappliance.com/differences-between-bosch-dishwashers) - We evaluate the Bosch 100, 300, 500, 800, and Benchmark series dishwashers along with pros and cons ...

60. [[PDF] Use and Care Manual SHP78CM5N | Bosch](https://images.thdstatic.com/catalog/pdfImages/4f/4fab78e0-7e2b-5bd0-90c5-08810d2683d3.pdf) - Lower rack → Page 13. 3. Lower spray arm. The lower spray arm washes the dishware in the lower rack....

61. [Bosch Dishwasher How to Replace the Fill Tube and Upper Spray Arm](https://www.youtube.com/watch?v=rLrd1RkmITQ) - This is a Bosch Dishwasher model # SHE68T55UC/03, manufactured in 2014. I noticed that the dishes an...

62. [What's the Best Bosch Dishwasher for Your Kitchen?](https://www.consumerreports.org/appliances/dishwashers/the-best-bosch-dishwasher-for-your-kitchen-a1088085668/) - The 800 Series is part of the “premium” category and introduces Bosch's latest washing innovation: a...

63. [An up close look at the BOSCH 800 Series dishwashers ... - YouTube](https://www.youtube.com/watch?v=JMu0-raaYbs) - An up close look at the BOSCH 800 Series dishwashers!!! [Featuring the Bosch SHP78CM5N]. 128K views ...

64. [How to remove Spray Arms on Bosch Dishwasher & How ... - YouTube](https://www.youtube.com/watch?v=XOGvHyY6TN4) - ... show you how. I will remove the Dishwasher lower spray arm, the Dishwasher upper spray arm, give...

65. [800 Series Dishwasher with AquaStop - Custom Panel](https://www.rona.ca/en/product/bosch-800-series-dishwasher-with-aquastop-custom-panel-sgv68u53uc-30855191) - Bosch 800 Series dishwasher has a 44 dBA low-noise operation as well as a custom panel and hidden co...

66. [Bosch 800 Series 24-in Top Control Built-in Dishwasher ( Stainless ...](https://www.lowes.com/pd/Bosch-800-Series-Top-Control-24-in-Smart-Built-In-Dishwasher-Stainless-Steel-ENERGY-STAR-42-dBA/5014401301) - Bosch SHP78CM5N 800 Series 24-in Top Control Built-in Dishwasher ( Stainless steel ... Tub Material....

67. [How to use your Bosch Rackmatic® System](https://www.youtube.com/watch?v=aZ9Ggy_-bKo) - Rackmatic® makes loading simple.The RackMatic adjustable upper rack easily raises or lowers in just ...

68. [Bosch SHV78CM3N 800 Series 24 Inch Wide 16 Place Setting Built ...](https://www.fergusonhome.com/bosch-shv78cm/s1846067) - Bosch 800 Series dishwashers now combines advanced cleaning with the ultimate dry. The innovative an...

69. [Bosch vs Miele Dishwashers: Which Brand WINS in 2025?](https://www.youtube.com/watch?v=_wygSxGZnfw) - Download our FREE Dishwasher Buying Guide: https://blog.yaleappliance.com/free-dishwasher-buying-gui...

70. [Bosch 800 Series Dishwasher Review - Bosch 500 vs 800 Series](https://www.youtube.com/watch?v=ll5IlZ240b8&vl=en-US) - Thinking about upgrading your kitchen with a Bosch dishwasher? 

Wondering if the Bosch 800 Series i...

71. [Bosch 800 Series SHX78CM5N - Dishwashers - Consumer Reports](https://www.consumerreports.org/appliances/dishwashers/bosch-800-series-shx78cm5n/m410625/) - We've tested and reviewed products since 1936. Read CR's review of the Bosch 800 Series SHX78CM5N di...

72. [ENERGY STAR Certified Dishwashers | Bosch - SHP78CM](https://www.energystar.gov/productfinder/product/certified-residential-dishwashers/details/2408137) - Compare ENERGY STAR Certified Dishwashers, find rebates, and learn more.

73. [Your Guide to AquaStop: The Bosch Dishwasher Safety Feature](https://theproperkitchen.com/what-is-the-aquastop-on-a-bosch-dishwasher/) - In the realm of kitchen appliances, dishwashers have transformed how we tackle daily chores. Among t...

74. [How To Choose A Bosch Dishwasher With AquaStop](https://www.alibaba.com/product-insights/how-to-choose-a-bosch-dishwasher-with-aquastop-buying-guide.html) - A practical, expert-led guide to choosing the right Bosch dishwasher with AquaStop—covering safety, ...

75. [Bosch Dishwasher AquaStop - Leakage Protection](https://www.youtube.com/watch?v=X4_JBSpxNTU) - The AquaStop is a smart system that provides water leakage protection, provided that the dishwasher’...

76. [What Is AquaStop Technology In Bosch Dishwashers?](https://www.reliant.co.uk/blog/what-is-aquastop-technology-in-bosch-dishwashers/) - Wondering what the AquaStop technology in your Bosch dishwasher is? Then join us here to find out on...

77. [The 3 Most Reliable Dishwasher Brands (And 2 to Avoid)](https://prudentreviews.com/reliable-dishwasher-brands/) - In this guide, I highlight the most reliable dishwasher brands. I also reveal the least reliable bra...

78. [Best Dishwashers of 2026: The Surprising Winner You'll Want in ...](https://blog.yaleappliance.com/best-dishwasher-deals) - Looking for the best dishwasher in 2026? See how the top models wash, dry, and rack dishes in real h...

79. [The Most Reliable Dishwashers for 2026: 33,190 Service Calls Reveal Dishwasher Reliability](https://www.youtube.com/watch?v=wg4-mJ-na1c) - Download our FREE Dishwasher Buying Guide: https://blog.yaleappliance.com/free-dishwasher-buying-gui...

80. [How Long Do Bosch Dishwashers Last?](https://howlongitlasts.com/lifespan/how-long-do-bosch-dishwashers-last/) - Bosch dishwashers typically last 12–15 years. Learn lifespan factors, common repairs, and when repla...

81. [How Long Does a Bosch Dishwasher Last? - Kelly's Applianceswww.kellyshomecenter.com › blog › how-long-bosch-dishwasher-last](https://www.kellyshomecenter.com/blog/how-long-bosch-dishwasher-last) - Get the expected lifespan of a Bosch dishwasher and tips from experts on maintenance and care to max...

82. [Bosch Dishwasher Lifespan: How Long Do Dishwashers Lastwww.kellyshomecenter.com › blog › the-longevity-of-bosch-dishwashers-...](https://www.kellyshomecenter.com/blog/the-longevity-of-bosch-dishwashers-how-long-can-you-expect-them-to-last) - Discover how long Bosch dishwashers really last, when to repair or replace, and maintenance tips fro...

83. [Welp, Bosch has officially Bosched their dishwashers. I can no ...](https://www.reddit.com/r/appliancerepair/comments/1pzvb0j/welp_bosch_has_officially_bosched_their/) - Decent dishwasher. Most common failure is a screen inside the wash motor. Warranty would kick in at ...

84. [Bosch 800 Series Dishwasher Test Mode Guide - YouTube](https://www.youtube.com/watch?v=5BFoU27-8r4) - Knowing how to enter test mode on a Bosch 800 Series dishwasher is a handy troubleshooting tool when...

85. [What can you expect from your appliance’s warranty?](https://www.consumeraffairs.com/homeowners/bosch-dishwasher-warranty.html) - What can you expect from your appliance’s warranty?

86. [What can you expect from your manufacturer’s warranty?](https://www.consumeraffairs.com/homeowners/bosch-appliance-warranty.html) - What can you expect from your manufacturer’s warranty?

87. [Bosch Dishwasher Warranty - Complete Overview](https://www.youtube.com/watch?v=UU3FhomvB5s) - The basic Bosch warranty lasts for one year, and if you purchase an extended warranty, you can get u...

88. [BSH Home Appliances Corporation Opens Expanded Dishwasher Manufacturing Facility in New Bern, N.C. | BSH Home Appliances Corporation](https://www.bsh-group.com/us/press/press-releases/bsh-home-appliances-corporation-opens-expanded-dishwasher-manufacturing-facility-in-new-bern-nc) - Press Release Detail

89. [Where is this made? USA. – Q&A - Best Buy](https://www.bestbuy.com/site/questions/bosch-800-series-24-top-control-built-in-tub-dishwasher-with-3rd-rack-and-crystaldry-42-dba-stainless-steel/6360644/question/72999df9-4c92-39a0-a82d-1afd08d17c40) - Where is this made? USA. – Learn about Bosch - 800 Series 24" Top Control Built-In Stainless Steel T...

90. [BSH invests in N.C. manufacturing site](https://hbsdealer.com/bsh-invests-nc-manufacturing-site) - Bosch's appliance division looks to create an innovation hub.

91. [About Bosch Home Appliances](https://www.bosch-home.com/us/experience-bosch/about-bosch) - At Bosch, we know that everything our engineers touch, touches lives. See how the quality of a Bosch...

92. [Bosch Home Appliances Now Fully Owned by Bosch - Reviewed](https://www.reviewed.com/dishwashers/news/bosch-home-appliances-now-fully-owned-by-bosch) - The parent company of Bosch, Thermador, and Gaggenau home appliances is now entirely owned by Robert...

93. [Bosch completes acquisition of Siemens's share in BSH Bosch und ...](https://www.bosch-press.nl/pressportal/nl/en/press-release-621.html)

94. [Bosch to acquire Siemens' stake in BSH ...](https://press.siemens.com/global/en/pressrelease/bosch-acquire-siemens-stake-bsh-bosch-und-siemens-hausgerate-gmbh) - Purchase price of 50 percent stake to total €3 billion in addition to a distribution of €250 million...

95. [BSH Home Appliances Corporation: Welcome](https://www.bsh-group.com/us/) - Our home appliances brands like Bosch, Siemens, Gaggenau and Neff make life worldwide more enjoyable...

96. [Bosch Dishwasher Spray Arms | OEM Replacement Parts - PartSelect](https://www.partselect.com/Bosch-Dishwasher-Spray-Arms.htm) - This spray arm distributes water evenly throughout the interior to ensure thorough cleaning coverage...

97. [Does the Bosch 800 Series Dishwasher Really Clean?](https://www.youtube.com/watch?v=_0E1Gij2UlA) - Download our FREE Dishwasher Buying Guide: https://blog.yaleappliance.com/free-dishwasher-buying-gui...

98. [Looking for instructions for repairing a Bosch 800 series dishwasher](https://www.reddit.com/r/appliancerepair/comments/1qkv78w/looking_for_instructions_for_repairing_a_bosch/) - For a Bosch, you typically access the circulation pump by removing the right hand side panel, unplug...

99. [New Bosch 800 dishwasher failed after 4 months.](https://www.reddit.com/r/appliancerepair/comments/1jns0r0/new_bosch_800_dishwasher_failed_after_4_months/) - New Bosch 800 dishwasher failed after 4 months.

100. [Bosch 800 dishwasher won’t start](https://www.reddit.com/r/Appliances/comments/1gpy5c8/bosch_800_dishwasher_wont_start/) - Bosch 800 dishwasher won’t start

101. [Bosch 800 dishwasher not turning on.. bad board or part?](https://www.reddit.com/r/appliancerepair/comments/1ncw8ok/bosch_800_dishwasher_not_turning_on_bad_board_or/) - Bosch 800 dishwasher not turning on.. bad board or part?

102. [2024 Bosch 800 Dishwasher Not Cleaning Well : r/appliancerepair](https://www.reddit.com/r/appliancerepair/comments/1hjf4qm/2024_bosch_800_dishwasher_not_cleaning_well/) - I've had a Bosch dishwasher before, was a great appliance, but 8 months into this one and already ha...

103. [Four Problems with Bosch 800 Series Dishwasher - Are Bosch Appliances Reliable? #appliances #review](https://www.youtube.com/watch?v=LZWP-_WoNtc) - The Bosch 800 Dishwasher is the most expensive dishwasher I've ever owned, and it's also giving me t...

104. [Bosch 800 Series Dishwasher Review - YouTube](https://www.youtube.com/watch?v=ll5IlZ240b8) - ... Drying Test Results 07:08 - Spray Arm & Cleaning Performance 08 ... Bosch 800 Series Dishwasher ...

105. [Bosch 800 Series SGX78B55UC/13 Dishwasher review - Reviewed](https://www.reviewed.com/dishwashers/content/bosch-800-series-sgx78b55uc13-dishwasher-review) - After each cycle we tested, the SGX78B55UC/13 was able to get every dish 100% dry. Everything, plast...

106. [Servicer Finder - Bosch](https://www.bosch-home.ca/en/service/book-a-service) - Servicer Finder tool to find an authorized servicer.

