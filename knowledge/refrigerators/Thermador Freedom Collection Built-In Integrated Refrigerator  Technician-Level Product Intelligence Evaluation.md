# Thermador Freedom Collection Built-In Integrated Refrigerator
## Product Intelligence Evaluation | Quality · Durability · Performance

**Scope:** 36", 42", and 48" Freedom Collection built-in integrated French door/multi-door models (T36BT, T42BT, T48BT series, including panel-ready T-IT and T-IT-NP variants). Data current as of March 2026. This report prioritizes verified technical data, service industry records, and parts distributor cross-references over marketing claims.

***

## Executive Summary

The Thermador Freedom Collection occupies a well-defined tier in the premium integrated refrigeration segment: technically sophisticated, well-engineered at the platform level, and backed by one of the most financially stable appliance manufacturers in the world, but consistently outperformed in long-term food preservation and reliability by Sub-Zero, its primary competitor. It earns Yale Appliance's highest category grade ("A") for integrated refrigeration and is competitive enough that Yale explicitly recommends considering it alongside Sub-Zero. However, its sealed system failure modes, parts availability volatility at 10–12 years, and documented customer service execution problems create meaningful long-term risk for a $8,000–$18,000 built-in appliance.[^1]

**Rating Context:** Sub-Zero is approximately 8% more reliable by Yale's first-year service data based on 1,500+ tracked units. Thermador is made on the same BSH Turkey platform as Gaggenau and Bosch Benchmark. All three share compressor part numbers, sealed system architecture, and distribution channels, differentiating primarily on exterior design, controls, and branding tier.[^1]

***

## 1. Compressor & Sealed System

### Architecture
The Freedom Collection uses a **dual-compressor, dual-evaporator** design — one compressor and evaporator for the fresh food section, one for the freezer section. This is confirmed across the T36BT, T42BT, and T48BT spec sheets, which list "Independent Cooling Systems: 2" and call out both "Dual Compressor" and "Dual Evaporators" as explicit features. The bottom-mounted compressor placement — chosen to achieve the fully flush-integrated panel design — is confirmed by Yale Appliance and distinguishes the Freedom platform from Sub-Zero's top-mounted configuration.[^2][^3]

### Compressor OEM
**The specific compressor OEM (Secop, Embraco/Nidec, or other) is not confirmed in publicly available documentation.** BSH cross-lists the following compressor part numbers across Bosch, Thermador, and Gaggenau built-in refrigerators via major distributors: 00146062, 00146189, 00146122, 00143289, 00145292, 00144840, and 00146098. The Thermador-branded compressor 00146098 (also replacing 00145923, 00145154, 00144975) is listed at $433.50 direct from Parts Town. Secop (formerly Danfoss) is the dominant OEM supplier to BSH for European residential platforms and produces an R600a K-Series specifically tailored for residential appliances; Embraco/Nidec is the other primary candidate. **No primary source — service manual, teardown, compressor nameplate photo — definitively confirms the OEM for current Freedom Collection production.** This is a documented gap.[^4][^5]

Inverter board part 00654622 is cross-referenced to select BSH refrigerator models. Whether this is a BSH-manufactured inverter or a third-party board (e.g., Secop variable-speed drive) is unconfirmed in publicly available data.

### Refrigerant
**Current US-market Freedom Collection models are very strongly indicated to use R600a (isobutane, GWP = 4), but this has not been confirmed from a primary source such as an actual rating plate photograph or Energy Star database refrigerant field for the Freedom Collection specifically.** The BSH group has committed to R600a across its residential refrigeration portfolio, BSH manuals state "R134a (HFC) or R600a (HC) (see the rating plate inside the appliance)", and Bosch brand's newer models explicitly use R600a per marketing and product documentation. The ENERGY STAR listing for T48BT120NS does not include a refrigerant field in the public-facing data retrieved. **Specifiers and technicians should physically check the rating plate on any Freedom Collection unit before sealed system work; the unit may carry R600a or, in older/transition production, R134a.**[^6][^7][^8]

If R600a is confirmed (highly probable for current production): the refrigerant requires HC-specific handling equipment, smaller charge weight (~40–80g per circuit in dual-compressor systems), and is classified flammable (A3) — mandating certified R600a recovery equipment and procedures. Most independent technicians in the US do not carry HC recovery tools, which directly elevates repair costs and limits the authorized service pool.

### Compressor Type
The Freedom Collection uses **variable-speed/inverter compressors** — confirmed by the existence of inverter board part 00654622 and by BSH's published commitment to inverter technology across its built-in refrigeration platform. Fixed-speed compressors are not used on current 900-series Freedom Collection models.[^9]

### Documented Sealed System Failure Modes
Based on technician community reports and consumer accounts:

- **Capillary tube restriction / refrigerant blockage:** The most frequently cited catastrophic failure mode. Technicians describe "capillary line liquids solidifying," causing restriction and forcing the compressor to overwork until it seizes. Once a restriction forms and the compressor has been stressed, the sealed system often cannot be economically repaired.[^10]
- **Evaporator tube pitting and refrigerant leak:** Confirmed in technician repair accounts, including a documented case where an evaporator was replaced and refrigerant recharged on a Freedom Column. Refrigerant leaks from pitted evaporator tubing are a failure mode consistent with the platform's age profile.[^10]
- **Drain line clogs causing evaporator freezeout:** A recurrent, lower-severity failure mode. Condensate drain tubes behind bottom panels clog (typically calcium deposits), causing water to back up and freeze around the evaporator, generating fan noise and ice buildup. This is a nuisance failure — repairable without sealed system work — but frequently misdiagnosed as evaporator failure at initial service.[^11][^12]
- **Compressor burnout following restriction:** When capillary tube restriction is not diagnosed and corrected quickly, the compressor runs hot and eventually fails. In at least one documented case, replacing both the compressor and evaporator still could not restore proper function due to an underlying sealed system seal issue.[^10]

### Sealed System Lifespan
No BSH-published or independent-test documented sealed system MTBF for the Freedom Collection is available in public data. The industry-standard reference point for sealed system failures — confirmed by appliance repair surveys — is that failures cluster between years 4 and 7, right at the boundary of the 5–6-year sealed system warranty window. BSH's 12-year sealed system warranty (parts only, years 7–12) implies the manufacturer's own actuarial expectation of failure in that window. Consumer reports from the Reddit/r/thermador and r/Appliances communities document sealed system failures at 10–12 years on Thermador built-in refrigerators, with some units effectively unrepairable at that age due to parts availability.[^13][^14][^15]

***

## 2. Control System & Electronics

### Control Board Manufacturer and Cross-Compatibility
Control boards on BSH refrigerators are manufactured under the BSH group's own production/OEM arrangement and are **shared across Bosch, Thermador, and Gaggenau products**. This is directly confirmed by Reliable Parts, which lists control unit part 12011148 as "designed specifically for Bosch, Thermador, and Gaggenau appliances". Video repair guides from AppliancePartsPros explicitly label control boards "Bosch/Thermador/Gaggenau" for multiple appliance categories. The main refrigerator control board (e.g., 00686588, listed compatible with Bosch B36IT models) is available through Genuine Replacement Parts and cross-lists across the BSH built-in refrigerator family.[^16][^17][^18][^19]

This cross-brand sharing is strategically significant for serviceability: it means parts are stocked across multiple supply channels and not orphaned to a single brand's dealer network. However, it also means a systemic control board failure mode would affect all three BSH brands simultaneously.

### Control Board Failure Modes
Based on technician community reports and Thermador consumer complaints:
- **Temperature sensor (thermistor) failure:** Triggers error codes (typically E01) causing incorrect temperature display and cooling behavior[^20]
- **Relay failure and capacitor aging:** Standard for inverter-board-adjacent electronics operating in a thermal cycling environment
- **Moisture intrusion:** Less common in refrigerators than in dishwashers, but cited in integrated installations where condensation management is imperfect
- **Display failure:** The TFT/LCD touchscreen is a higher-complexity component than traditional mechanical displays; failure rates increase with thermal cycling

### Diagnostic Modes and Error Codes
The Freedom Collection includes a built-in diagnostic/self-test mode. For the column series, holding specific button combinations (typically middle two buttons plus setup button for 3–5 seconds) with the freezer door removed accesses ice maker test cycle and component diagnostics. Error codes documented in community forums include:[^20]
- **E01:** Thermistor/temperature sensor fault
- **E02:** Ice maker or communication fault

Thermador does not require proprietary dealer-level software for basic diagnosis — the HomeConnect Wi-Fi integration allows remote diagnostic review via the BSH iService Remote platform, which also supports remote system upgrades.[^3]

### Control Board Replacement Cost
Control panel replacement cost ranges from **$100 to $400** for the panel assembly, with main control boards (PCBs) listed at approximately $150–$300 at major distributors. The Bosch/Thermador/Gaggenau cross-labeled control unit 12011148 is in stock at Reliable Parts.[^21]

***

## 3. Construction & Materials

### Interior
The Freedom Collection uses a **full stainless steel inner liner** as standard — confirmed in spec sheets for the T36BT, T42BT, and T48BT. This differentiates it from ABS or HIPS plastic interiors used in most consumer refrigerators. Thermador specifically cites the stainless interior as a thermal benefit (stainless absorbs cold faster than plastic), and Yale confirms it as a genuine differentiator.[^22][^3][^1]

### Insulation
BSH uses **cyclopentane-blown polyurethane (PU) foam insulation** as the standard across its premium built-in refrigeration line. Cyclopentane (C₅H₁₀) has zero ozone depletion potential and ultra-low GWP (<1), and is the industry standard blowing agent for premium residential refrigeration. No vacuum insulation panels (VIPs) are documented in Freedom Collection construction — VIPs are used in select European premium appliances but are not confirmed in BSH North American integrated refrigerators.[^23]

### Door Hinge
The **Freedom Hinge** (Thermador's proprietary branding) is a spring-loaded assist plus SoftClose hydraulic damper mechanism. It enables flush-to-cabinetry installation while providing assisted opening and controlled closing. Thermador's spec listings confirm "SoftClose® door hinges" and "SoftClose® drawers" across the line. No published cycle rating for the hinge has been located in publicly available documentation — this is a gap. The Bosch Benchmark line uses a different "OptiFlex Hinge" design that opens out and away from cabinetry, confirming that while the sealed systems are shared, the hinge and exterior mechanisms differ between BSH tiers.[^24][^25][^26][^3]

Yale notes that on the 48-inch six-door configuration, repeated opening and closing of multiple doors may lead to alignment issues over time, particularly in humid environments.[^2]

### Door Seal
Standard magnetic door seal — **not vacuum-sealed**. Sub-Zero's vacuum-assisted door seal is a genuine differentiator that Yale cites as a primary advantage for food preservation. Thermador's door closes with SoftClose damping but does not create a vacuum seal environment.[^1]

### Shelving
Tempered glass shelving is standard. No nanotechnology spill-congealing coating (Sub-Zero's differentiating shelf technology). Gallon door bins are adjustable to any level on the door for flexible storage.[^1]

### Cabinet Construction
Steel outer shell with cyclopentane PU foam fill and stainless steel inner liner. The unit is front-serviceable, meaning all sealed system components can be accessed from the front without pulling the unit — a meaningful serviceability advantage for built-in applications where wall or cabinet clearance is zero.[^3]

***

## 4. Air Management & Food Preservation

### Air Purification
The Freedom Collection includes a **passive ethylene filter** (replaceable cartridge, part 17007000, 6-month replacement cycle) that absorbs ethylene gas emitted by ripening produce. This is **not** an active air scrubber. Sub-Zero's air scrubber — a NASA-derived system that actively ionizes and neutralizes ethylene gases every 20 minutes — is a genuinely different and more effective technology. Yale specifically calls out this as a meaningful gap: "I am surprised Thermador did not duplicate this feature".[^3][^1]

### Humidity Control
ThermaFresh Pro drawers offer independently programmable temperature and humidity presets — 10 documented modes including Vegetables (32°F/High humidity), Fruit (32°F/Low), Meat (30°F/Low), Fish (30°F/Low), Deli, Cheese, Beverages, Mixed, Charcuterie, and Pastry. The ThermaFlex convertible drawer offers 7 preset modes from 0°F (full freezer) to 37°F (refrigerator), providing genuine flexibility for a dual-purpose compartment. These are active temperature/humidity controls, not vacuum-sealed crispers.[^3]

### Temperature Precision
The operating range for the refrigerator section is documented at **33°F to 43°F**; freezer drawers at **-7°F to 6°F**. SuperCool mode drives the refrigerator to approximately 34°F (-1°C) for up to 8 hours; SuperFreeze drives the freezer to -15°F (-26°C) for up to 8 hours. Maximum sound level is 39 dBA.[^3]

**Caution:** One verified consumer report on Best Buy reviews documents a Thermador technician explicitly stating that **±5°F variance is within the factory-specified range**, with one unit running 10°F above the set temperature. Thermador's own marketing and control settings claim high precision, but the factory-acknowledged tolerance is notably wide for a $10,000+ refrigerator. Independent temperature uniformity testing data from Consumer Reports is behind their paywall and not independently verifiable in this report.[^27]

### Produce Freshness vs. Competitors
Yale Appliance conducted a **4-week head-to-head produce freshness test** comparing Sub-Zero and Thermador columns. Result: Sub-Zero performed better, but Thermador was "fairly close out of the five refrigerator brands tested". No specific numerical scoring was published. Thermador ranked second in Yale's multi-brand test.[^1]

***

## 5. Reliability & Service Data

### Yale Appliance Data
Yale Appliance, the most frequently cited independent service-data source for the premium appliance segment, grades Thermador **"A" for integrated refrigeration**. However, Thermador does not appear in Yale's top 10 overall reliability list for 2026 (based on 33,190 first-year service calls across all appliance categories). Gaggenau, made in the same Turkish factory, achieved a **7.7% service rate** in the 2026 data. Bosch Benchmark achieved **7.8%** and standard Bosch **8.7%**. Thermador's absence from the overall top 10 may reflect category weighting (cooking appliances, which Thermador is heavy in, are high-service categories) rather than poor refrigerator-specific performance.[^28][^1]

The critical data point: **Sub-Zero is 8% more reliable than Thermador in built-in integrated refrigeration, based on 1,500+ units sold and serviced by Yale**. Both brands are described as "amongst the best in the industry for after-sales support."[^1]

Yale also notes that French door refrigerators are **"one of the most serviced categories"** across all brands, with ice maker issues being the primary driver.[^28]

### Consumer Reports
Consumer Reports tests the Thermador Freedom Collection T36BB820SS and T30BB820SS, but full reliability scores and predicted 5-year problem rates are behind the CR paywall. CR evaluates on thermostat performance, temperature uniformity, noise, ease of use, energy efficiency, crisper performance, and ice maker performance. An unverified Facebook reference suggests a CR score around 46 points for Thermador versus 81 for Monogram — this could not be independently confirmed and should be treated as directional only.[^29][^30]

### Common Failure Modes (Technician Community)
From r/appliancerepair, r/thermador, r/Appliances, and consumer complaint forums:

1. **Ice maker failure** — most frequently reported short-term issue. Includes frozen fill tubes, water filter clogs triggering no-ice conditions, wire arm sensor blockage, and temperature-related cycling issues.[^31][^32][^28][^20]
2. **Sealed system failure (years 4–12)** — capillary restriction, evaporator leak, and compressor burnout.[^13][^10]
3. **Drain line clog causing evaporator ice buildup** — classified as a maintenance failure but frequently requiring service.[^11]
4. **Control board / sensor failure** — thermistor failure (E01), relay issues, display malfunction.
5. **Parts on extended backorder** — documented at years 10–14 with some parts described as potentially permanently unavailable.[^14][^15][^33]

### First-Year vs. Long-Term Failure Patterns
First-year failures tend to be **ice maker related** (install-adjacent: water line pressure, filter, wire arm) and **software/calibration** (temperature settings, connectivity). Long-term failures (years 4–12) cluster around the **sealed system** — consistent with the appliance industry's documented failure clustering between years 4 and 7.[^13]

A Reddit post from December 2025 describes a 12-year-old complete Thermador kitchen becoming "effectively obsolete" due to unavailable parts for both the range and the column freezer. A separate October 2025 post describes a 10-year-old unit with a key part on backorder, with Thermador customer service eventually suggesting it "might never be back in stock".[^15][^33][^14]

### Repair Costs (Verified Estimates)
| Repair Type | Part Cost | Total with Labor (Est.) |
|---|---|---|
| Service visit (diagnostic only) | $179 flat + $20/6 min | $179–$260 (30-min diag) |
| Compressor (part only) | $300–$550[^34] | $800–$1,500+ with labor |
| Sealed system repair (full) | $350–$700 parts | $1,000–$2,000+ with labor |
| Control board / PCB | $150–$300[^21] | $350–$600 with labor |
| Ice maker assembly | $100–$300[^35] | $250–$500 with labor |
| Full sealed system on built-in (pull-out, second tech) | Parts + extra labor | $1,500–$2,500+ documented[^36] |

Thermador factory service visits are priced at a flat **$179 trip fee + $20 per 6-minute labor increment**; a 24-minute diagnosis plus 36-minute repair plus $10 part = $389, per Thermador's own published pricing. This is for Canada; US pricing is the same structure per the same document.[^37]

***

## 6. Ice Maker

### Manufacturer and Design
Ice maker part 00744441 (also 00747914, the newer replacement) and part 20006138 are stocked and labeled as **"Bosch (Thermador)" OEM parts** at Appliance Parts Group, Reliable Parts, and Lowe's appliance parts. This confirms that the ice maker is a **BSH-manufactured or BSH-procured component shared across the Bosch/Thermador/Gaggenau family** — not a Samsung, LG, or unrelated third-party module.[^38][^39][^40]

The Freedom Collection uses a **dual ice maker system** (Diamond/small ice + Cocktail/entertaining ice) on the 42" and 48" models. The 48" produces 4.5 lbs/day diamond ice and 2.6 lbs/day cocktail ice, with 11.7 lbs total storage capacity. The 36" produces diamond ice only.[^3]

### Ice Maker Modular/Replaceable Status
The ice maker assembly is a **modular, replaceable** component. Part 00744441 and its replacement 00747914 are standard stocked items at major distributors.[^35][^39]

### Common Ice Maker Failure Modes
- **Frozen fill tube:** Cold air from the freezer section freezes the water supply line — a French door refrigerator-wide issue confirmed by Yale as the leading ice maker failure mode[^28]
- **Water filter clog:** Dirty or expired water filter triggers no-ice-production or E02 error[^31]
- **Wire arm / level sensor blockage:** Ice bucket overfill condition falsely sensed, stopping production[^20]
- **Inlet valve failure:** No water delivered to ice maker mold
- **Thermal cycling fatigue:** In freeze-thaw cycling environments, ice maker components fatigue at the mold and motor over 5–10 years

Yale's 2026 data confirms ice makers are the #1 service issue across all French door refrigerators, not specific to Thermador.[^28]

### Documented Failure Rate
No specific failure rate for the Thermador Freedom Collection ice maker has been publicly published. The general refrigerator ice maker replacement cycle is referenced by PartSelect as 3–10 years depending on use and water quality.[^41]

***

## 7. Parts Availability & Serviceability

### Distribution Network
Thermador OEM parts are available through:
- **Factory direct:** thermador.com
- **Reliable Parts:** US distributor; claims same-day shipping on most Thermador OEM parts[^42][^43]
- **Part Advantage / PartSelect / ApplianceParts4All:** All carry BSH cross-listed parts
- **Encompass:** Major distributor; stocks BSH parts labeled under Bosch brand (cross-compatible)[^44]
- **Lowe's Appliance Parts, ReliableParts, Repair Clinic, Fix.com, Parts Town:** All confirmed to stock key Thermador/BSH refrigerator parts

Because parts are labeled "Bosch/Thermador/Gaggenau" at the distributor level, the supply chain is more resilient than single-brand proprietary parts ecosystems. The compressor part 00146098 is stocked at Parts Town and Thermador direct.[^18]

### BSH Parts Availability Commitment
In August 2023, BSH formally announced an extension of spare parts availability for large appliances from 10 years to **15 years** from production date, for all appliances manufactured after January 1, 2023. This guarantees availability of 350,000 original spare parts through seven global logistics centers and 22 regional warehouses. **This is the most favorable parts availability commitment in the luxury appliance segment.** For a Freedom Collection purchased in 2024–2026, this projects parts availability to approximately 2038–2041.[^45][^46]

**Important caveat:** Consumer experience at years 10–12 on pre-2023 production reveals that the previous 10-year commitment was not always honored in practice, with parts described as permanently backordered. The new 15-year commitment should be documented as a program commitment, not a guarantee of frictionless availability.[^33][^14][^15]

### Typical Lead Times
Most common repair parts (ice maker, control board, door seal, shelf components) are described as in stock or shipping within 1–6 days at major distributors. Less common parts (specific evaporator coils, Freedom Hinge components, specialized drawer assemblies) may require longer lead times. Compressor 00146098 is available at Parts Town without documented lead time issues.[^44]

### Service Network
Thermador operates **factory-certified service** through BSH's internal technicians plus an authorized service provider (ASP) network. The warranty document confirms service during "normal business hours" only through authorized providers. BSH globally has over 12,000 service technicians and partners, with 82% of issues resolved on the first visit. The ASP network for Thermador built-in refrigerators is well-established in major metro areas but can be thin in smaller markets. Technicians can check availability at thermador.com/service-locator.[^47][^48]

**Noteworthy:** The warranty explicitly states that using third-party parts or an non-authorized service provider does **not** automatically void the warranty, but any damage caused by non-authorized work is excluded. This is more favorable than some competitors' warranty terms.[^47]

***

## 8. Warranty — Full Analysis

### Term Structure (Current Effective January 1, 2023)

| Coverage Period | What's Covered |
|---|---|
| 1–2 Years | Entire appliance, parts and labor — manufacturing defects[^49][^50] |
| 3rd–6th Year | Sealed refrigeration system* — parts and labor[^51][^50] |
| 7th–12th Year | Sealed refrigeration system* — parts only, labor excluded[^51][^50] |
| Lifetime | Stainless steel rust-through, parts only[^49] |
| 60 Days | Cosmetic defects (scratches, paint blemishes, dents)[^47] |

*Sealed refrigeration system defined as: compressor, evaporator, condenser, dryer/strainer, and connection tubing[^51]

### Key Exclusions (from Official Warranty Document)
The warranty explicitly excludes:[^47]
- **Cosmetic damage** after the 60-day window (scratches, stainless blemishes, dents)
- **Improper installation** — customer is solely responsible for all structural, electrical, and plumbing connections
- **Negligence, misuse, abuse, accidents** — including user "exploration of the appliance's internal workings"
- **Non-authorized service damage** (unless pre-approved by Thermador)
- **Third-party damage** from lightning, power surges, floods, fires, extreme humidity
- **Remote location surcharge** — travel time beyond 100 miles from an authorized service provider is not covered (parts and basic labor still paid, but travel is customer's cost)
- **Difficult access surcharge** — if the product is installed in a difficult-to-access location, all costs to move or create access are the customer's sole responsibility
- **Trim and decorative panel removal** required for service access — not covered
- **Commercial use** of any kind

### Warranty and Professional Installation
Professional installation does **not** extend or increase warranty coverage. It is required to avoid voiding installation-related exclusions. Using a non-authorized installer does not automatically void the product warranty, but any damage caused by that installation is excluded.[^47]

### Warranty Execution — Consumer Experience
Technician and consumer feedback on warranty execution is mixed to negative:

- **Documented positives:** BSH resolves 82% of service calls on the first visit globally. Thermador has dedicated customer service and factory service teams rated as "amongst the best in the industry" by Yale.[^48][^1]
- **Documented negatives:** Consumer reports detail multiple no-show and rescheduled appointments, repeated parts waits, months of back-and-forth phone calls, and in at least one case, Thermador replacing both compressor and evaporator under warranty but the unit remaining non-functional — ultimately requiring full replacement. Parts on extended or indefinite backorder during out-of-warranty periods are a recurring complaint. The customer service scoreboard database shows overwhelmingly negative consumer ratings (100% negative reviews in the tracked sample).[^52][^14][^15][^33][^10]

***

## 9. Platform Sharing & Manufacturing

### Manufacturing Location
**Confirmed:** The Thermador Freedom Collection is manufactured at BSH's Çerkezköy, Tekirdağ plant in western Turkey. Yale Appliance directly states: "Their refrigeration is made in Turkey, along with Gaggenau, Bosch Benchmark, and Miele". Yale confirms this for the Freedom Collection specifically in its Sub-Zero vs. Thermador comparison. The Gaggenau reliability section of Yale's 2026 data also confirms: "Their refrigerators are built in the same Turkish factory as Thermador's". BSH has invested over €1 billion in this facility and designated it as a regional manufacturing and logistics base.[^53][^28][^1]

### Shared Components with Sibling Brands
| Component | Shared With | Confirmation |
|---|---|---|
| Compressor (sealed system) | Bosch Benchmark, Gaggenau | Part numbers 00146062, 00146189, 00146122, etc. cross-listed across brands |
| Ice maker module | Bosch (Thermador), Gaggenau | Part 00744441 / 20006138 labeled "Bosch (Thermador)"[^38][^40] |
| Main control unit (PCB) | Bosch, Gaggenau | Part 12011148 listed as "for Bosch, Thermador, and Gaggenau"[^18] |
| Dual evaporator architecture | Bosch Benchmark B36BT | Confirmed dual evaporator on Benchmark series[^26] |
| HomeConnect Wi-Fi platform | Bosch Benchmark, Gaggenau | BSH Group platform[^3] |
| Ethylene filter (part 17007000) | Likely cross-brand | BSH parts system |

### Genuine Differentiators vs. Sibling Brands
- **Freedom Hinge:** Thermador-specific spring-loaded assist + SoftClose damper. Bosch Benchmark uses OptiFlex Hinge (opens away from cabinetry, different mechanism).[^25][^26]
- **ThermaFlex convertible drawer:** Thermador-specific feature with 7 mode presets (not found on Bosch Benchmark)[^3]
- **TFT touchscreen control panel with LCD/color display:** Thermador's 900-series has a more feature-rich color touchscreen vs. Bosch Benchmark's more minimal display
- **Diamond Ice + Cocktail Ice dual ice system:** Thermador-specific marketing differentiation; Bosch Benchmark ice maker is single-format
- **Built-in cameras (4 on 48"):** Thermador-specific feature for remote viewing[^3]
- **1-2-Free promotional program:** Thermador-exclusive rebate structure offering significant purchase incentives[^54][^55]
- **Interior design:** Thermador prices at a premium to Bosch Benchmark and below Gaggenau; the stainless interior, lighting, and handle options differ cosmetically

### Corporate Financial Stability
BSH Hausgeräte GmbH is wholly owned by Robert Bosch GmbH. BSH generated **€15.0 billion in revenue in 2025**, making it Europe's largest home appliance manufacturer. Bosch Group overall generated **€91 billion in revenue in 2025**. BSH specifically called out growth in Thermador and Gaggenau as drivers of North America's 5%+ local-currency revenue increase in 2025. There are no ownership transitions, acquisition risks, or restructuring concerns at the corporate level relevant to long-term parts or service commitment. BSH is among the most financially stable appliance corporations in the world.[^56][^57][^58]

***

## 10. Professional & Expert Opinion

### Yale Appliance (Steve Sheinkopf)
Yale's verdict is the most data-informed public assessment of the Freedom Collection's competitive position:
- Grades Thermador "A" for integrated refrigeration[^1]
- Sub-Zero is 8% more reliable (1,500+ units)[^1]
- "Thermador has good storage on the door, a stainless interior, and some pretty cool controls"[^1]
- "Sub-Zero is still the best and most reliable built-in refrigerator" for food preservation, citing air scrubber, vacuum seal, and magnetic crispers[^1]
- "Servicing an integrated refrigerator is not easy. You may want to buy the brand with the best service in the area"[^1]
- Installation complexity is noted — 6-panel configurations add significant install time and cost[^59]
- In high-humidity environments, multi-door alignment issues may develop over time[^2]

### Repair Technician Community (r/appliancerepair, service industry)
- Sealed system repairs on R600a units require HC-certified equipment not universally available among independent techs; most service must go through factory or ASP network
- Drain tube clogs are underdiagnosed; frequently cleared as a first step before any sealed system work
- Ice maker freeze-up at the fill tube is described as a nuisance, not a replacement-level failure
- Parts availability at 10+ years is a recurring concern, with some commenting that BSH discontinued parts are "hard to source even through normal channels"

### Independent Reviewers
Consumer Reports reviews the Freedom Collection T36BB820SS and T30BB820SS but restricts scores to subscribers. CR evaluates temperature uniformity, thermostat performance, noise, energy, and ice maker quality — all relevant to this evaluation.[^30][^29]

### Kitchen Designer and Specifier Consensus
Based on dealer and specifier community input collected by Yale and Mountain High Appliance:
- **Recommend FOR:** Integrated kitchen designs where full-flush cabinetry is a priority; multi-appliance Thermador kitchens taking advantage of the 1-2-Free program; clients preferring advanced touch controls and IoT features; applications where stainless interior is a design priority
- **Recommend AGAINST:** Clients who prioritize maximum food preservation above aesthetics (Sub-Zero is the better recommendation); clients in smaller markets with limited Thermador ASP coverage; clients who need sub-60-day delivery (6-month lead times on certain models have been reported)[^1]
- **Neutral/Equivalent:** Clients where price is the primary constraint — Thermador is typically $1,500–$2,000 less than Sub-Zero for equivalent-size integrated units after 1-2-Free rebates[^1]

### Value Assessment
At $8,000–$18,000 for 36"–48" units, the Thermador Freedom Collection sits in the same pricing tier as Sub-Zero integrated columns. The 1-2-Free promotional structure can effectively reduce the all-in kitchen package cost significantly — one specifier documented $5,498 in free appliances on a four-appliance package. After rebates, Thermador delivers competitive value at the feature level. The core trade-off is: Thermador's superior technology, controls, and design flexibility versus Sub-Zero's superior food preservation and documented reliability edge.[^54]

***

## 11. Specific Questions — Verified Responses

| Question | Status | Verified Finding |
|---|---|---|
| Specific refrigerant (R600a vs. R134a)? | **Unconfirmed from primary source** | Strongly indicated R600a for current production; BSH-wide policy confirms R600a; actual Freedom Collection type plate data not found in public records. Verify from rating plate. |
| Compressor OEM (Secop vs. Embraco)? | **Unconfirmed** | Most probable: Secop (BSH's dominant residential OEM) or Embraco/Nidec. No teardown, service manual, or compressor nameplate data in public record confirming either. |
| Control boards shared with Gaggenau/Bosch Benchmark? | **Confirmed — Yes** | Part 12011148 explicitly labeled "for Bosch, Thermador, and Gaggenau"[^18]. Multiple control board part numbers cross-listed across BSH brands confirmed. |

***

## Data Gaps and Caveats

The following information was sought but could not be confirmed from primary sources:

1. **Specific refrigerant type plate data** for current production Freedom Collection units (T36BT, T42BT, T48BT) — verify from physical unit or BSH technical service documentation
2. **Compressor OEM brand** — Secop vs. Embraco vs. other; no service manual or teardown data found in public record
3. **Inverter board 00654622 manufacturer** — whether BSH in-house or third-party (Secop variable-speed drive)
4. **Freedom Hinge published cycle rating** — no manufacturer cycle count data found
5. **Consumer Reports specific score** for Freedom Collection — paywall-restricted
6. **Temperature stability test data** (±°F) from independent lab testing — CR data paywalled; only technician field report of ±5°F factory tolerance found[^27]
7. **Specific ice maker failure rate** for Freedom Collection — no brand-specific published data found

All monetary figures are USD unless noted. Repair cost ranges are indicative based on aggregated technician and service industry data; actual costs vary significantly by market, labor rate, and failure complexity.

---

## References

1. [Sub-Zero vs. Thermador Column Integrated Refrigerators](https://blog.yaleappliance.com/sub-zero-vs-thermador-integrated-refrigerator-columns) - According to our internal service numbers, based on over 1500 units sold, Sub-Zero is 8% more reliab...

2. [Thermador vs Sub-Zero: Bottom Mount Refrigerator Comparison](https://www.linkedin.com/posts/yaleappliance_bottommountrefrigerators-thermador-subzero-activity-7361018718455238658-R2ww) - All three styles are the same, but all three are different than what you're going to find with Therm...

3. [4 / 24](https://assets.coastappliances.com/product-assets/thermador/refrigerators-and-freezers/T48BT120NS/T48BT120NS-spec.pdf)

4. [Embraco Refrigeration Compressors - Nidec Motors](https://acim.nidec.com/en/motors/usmotors/Industry-Applications/HVAC/Embraco-Refrigeration-Compressors) - Compressors are critical to the operation of refrigeration systems, serving as the pump that distrib...

5. [K-Series Refrigeration Compressors for R600a - Secop](https://www.secop.com/products/highlights/k-series-for-r600a) - Secop's K-Series (formerly KAPPA) compressors ensure a unique combination of short-term savings, fas...

6. [1](https://digitalassets-cdn.thron.com/api/v1/content-delivery/shares/oolnjd/contents/do-84dab57e-40a8-452f-b9c8-4416e5f45028/pdf/Program-Chart.pdf)

7. [How to Choose the Best Bosch Refrigerator for Your Home - SmartBuy](https://smartbuy.alibaba.com/buyingguides/bosch-refrigerator) - Learn what to look for in a Bosch refrigerator, from size and features to energy efficiency and cust...

8. [ENERGY STAR Certified Refrigerators | Thermador - T48BT120NS](https://www.energystar.gov/productfinder/product/certified-residential-refrigerators/details/3417454) - Compare ENERGY STAR Certified Refrigerators, find rebates, and learn more.

9. [B36BT830NS Built-in Bottom Freezer Refrigerator | BOSCH US](https://www.bosch-home.com/us/en/product/B36BT830NS) - Intelligent Inverter Technology ensures a stable temperature control and efficient performance. Door...

10. [Need advice on my broken Thermador fridge : r/Appliances - Reddit](https://www.reddit.com/r/Appliances/comments/zwq64y/need_advice_on_my_broken_thermador_fridge/) - Their technician stated that when the compressor and evaporator work too hard, the capiliary line li...

11. [Thermador Built in refrigerator leak inside](https://www.reddit.com/r/Appliances/comments/xifhev/thermador_built_in_refrigerator_leak_inside/) - Thermador Built in refrigerator leak inside

12. [Thermadore Fridge making noises and condensation forms ice](https://www.reddit.com/r/Appliances/comments/17n7544/thermadore_fridge_making_noises_and_condensation/)

13. [Why Your Refrigerator Will Fail in 5 Years (The Sealed System Scam)](https://www.youtube.com/watch?v=PoDiaOyhs_w) - ... Refrigerator performance and lifespan can vary by model, usage, and maintenance. For accurate as...

14. [A warning to potential Thermador refrigeration buyers! - Reddit](https://www.reddit.com/r/thermador/comments/1nzp1jj/a_warning_to_potential_thermador_refrigeration/) - My issue with Thermidor is I have very expensive refrigerator that is about 10 years old and one of ...

15. [Thermador column freezer and range effectively obsolete after 12 ...](https://www.reddit.com/r/Appliances/comments/1pij2e0/thermador_column_freezer_and_range_effectively/) - We have a full Thermador kitchen, just over 12 years old. And apparently completely obsolete. The 48...

16. [How To: Bosch/Thermador/Gaggenau Control Board 00676960](https://www.youtube.com/watch?v=ZhcaX1WfG-w) - 2:47 Install New Board 3:19 Reassemble Door Panels How To Replace: Bosch/Thermador/Gaggenau Control ...

17. [How To: Bosch/Thermador/Gaggenau Control Assembly 00746432](https://www.youtube.com/watch?v=7huGhPNYgwo) - 0:00 Introduction and Safety 1:30 Remove Door Panel 3:45 Disconnect Wiring Harnesses 5:15 Remove Han...

18. [12011148 Bosch Refrigerator Control Unit - Reliable Parts](https://www.reliableparts.com/bos-12011148.html) - Maintain your refrigeration system with this high-quality control unit designed specifically for Bos...

19. [Bosch Part# 00686588 Main Control Board (OEM)](https://genuinereplacementparts.com/products/bosch-686588) - Compatible Models ; Bosch, B36IT71NNP/11, Bosch B36IT71NNP/11 36 Inch Built-In Fully Flush French Do...

20. [Thermador w/ door bottom freezer not producing ice](https://www.reddit.com/r/appliancerepair/comments/hfs24a/thermador_w_door_bottom_freezer_not_producing_ice/)

21. [Thermador Refrigerator Control Panel Replacement - Repair Clinic](https://www.repairclinic.com/Shop-For-Parts/a4b115c56i608/New/Thermador-Refrigerator-Panel-Control-Panel-Parts) - Find a Thermador Refrigerator Control Panel replacement at Repair Clinic with same-day shipping, 365...

22. [All-New Bottom Freezer Refrigeration Collection - Thermador](https://www.thermador.com/us/products/refrigeration/bottom-freezer-refrigeration) - Total Capacity 26.8 cu. ft. Refrigerator Capacity 17.7 cu. ft. Freezer Capacity 9.1 cu. ft. Ice Draw...

23. [A Key Material Driving High-Efficiency Refrigerator Insulation](https://junyuanpetroleumgroup.com/cyclopentane/cyclopentane-refrigerator-insulation-pu-foam-blowing-agent/) - Cyclopentane plays a vital role in high-performance polyurethane insulation foams for refrigerators,...

24. [42-inch Built-in Refrigerators - Thermador](https://www.thermador.com/us/products/refrigeration/42-inch-refrigeration) - thermador 42 inch refrigerator soft close drawer. SoftClose® Drawers. SoftClose® hinges enable an ul...

25. [Thermador® Freedom® 42 in. 22.3 Cu. Ft. Stainless Steel Built In ...](https://www.missourifurniture.com/product/thermador-freedom-42-in-223-cu-ft-stainless-steel-built-in-counter-depth-french-door-refrigerator-t42bt120ns-1316070) - Freedom® Hinge Enables True Flush Design. The Freedom® Hinge can be installed fully-flush, allowing ...

26. [Bosch B36BT830NS/51 All Models Spare Parts](https://originalrepairparts.com/products/bchb36bt830ns-51) - The Bosch Benchmark 36" Built In French Door Bottom-Freezer features dual evaporators, where refrige...

27. [Customer Reviews: Thermador Professional 20.8 Cu. Ft. French ...](https://www.bestbuy.com/site/reviews/thermador-professional-20-8-cu-ft-french-door-counter-depth-smart-refrigerator-silver/6455518) - Best Buy has honest and unbiased customer reviews for Thermador - Professional 20.8 Cu. Ft. French D...

28. [The Most Reliable Appliance Brands for 2026](https://blog.yaleappliance.com/the-least-serviced-most-reliable-appliance-brands) - We tracked 33,190 real service calls across Boston, Cape Cod, and Southern NH. Here are the 10 most ...

29. [Thermador Freedom Collection T36BB820SS Refrigerator Review - Consumer Reports](https://www.consumerreports.org/appliances/refrigerators/thermador-freedom-collection-t36bb820ss/m202503/) - We've tested and reviewed products since 1936. Read CR's review of the Thermador Freedom Collection ...

30. [Thermador Freedom Collection T30BB820SS Refrigerator Review - Consumer Reports](https://www.consumerreports.org/appliances/refrigerators/thermador-freedom-collection-t30bb820ss/m227025/) - We've tested and reviewed products since 1936. Read CR's review of the Thermador Freedom Collection ...

31. [Thermador T36IT71FN/01 stopped making ice; changed filter, still no ice](https://www.reddit.com/r/appliancerepair/comments/1c4a7n9/thermador_t36it71fn01_stopped_making_ice_changed/)

32. [Thermador freezer working, ice maker is not](https://www.reddit.com/r/appliancerepair/comments/10742f5/thermador_freezer_working_ice_maker_is_not/)

33. [My experience with Thermador](https://www.reddit.com/r/CustomerService/comments/1hi1d9z/my_experience_with_thermador/) - My experience with Thermador

34. [Thermador Refrigerator Compressor Replacement - Repair Clinic](https://www.repairclinic.com/Shop-For-Parts/a4b115c15i734/New/Thermador-Refrigerator-Compressor-Sealed-System-Compressor-Parts) - For Thermador refrigerators, you should expect to pay between $300 and $550 for the compressor itsel...

35. [Thermador Refrigerator Ice Maker Assembly Replacement | Repair Clinic](https://www.repairclinic.com/Shop-For-Parts/a4b115c47i187/New/Thermador-Refrigerator-Ice-Maker-Ice-Maker-Assembly-Parts) - Find a Thermador Refrigerator Ice Maker Assembly replacement at Repair Clinic with same-day shipping...

36. [How much are you charging for sealed system repairs? - Reddit](https://www.reddit.com/r/appliancerepair/comments/1f89d04/a_question_for_techs_how_much_are_you_charging/) - Where I work (lower income area) we start at around $350 for like a restricted filter drier up to $8...

37. [Servicer Finder - Thermador](https://www.thermador.ca/en/support/book-a-service) - If those requirements are not met, you will be charged a flat rate of $179 for the tech to visit the...

38. [Bosch (Thermador) Genuine OEM 20006138 - Ice Maker](https://www.appliancepartsgroup.com/products/bosch-thermador-20006138-ice-maker.html) - Buy a Genuine OEM Bosch (Thermador) 20006138. Buying the original manufacturer replacement part ensu...

39. [00744441 Bosch Refrigerator Ice Maker - Reliable Parts](https://www.reliableparts.com/bos-00744441.html) - 00744441 is an original equipment manufactured (OEM) part. Maintain your refrigerator's performance ...

40. [Ice Maker | 00744441 | Bosch - Lowes Appliance Parts](https://applianceparts.lowes.com/lowes-appliance-part/bsh/00744441) - Ice Maker. $276.50. Part Number: 00744441; Manufacturer/Brand: BOSCH; Availability: In Stock. Add to...

41. [Thermador Refrigerator Ice Makers | OEM Replacement Parts](https://www.partselect.com/Thermador-Refrigerator-Ice-Makers.htm) - Thermador Refrigerator Replacement Ice Maker ·.. 249 Reviews. PartSelect Number PS358591. Manufactur...

42. [Thermador Appliance Parts - OEM & Fast Shipping - Reliable Parts](https://www.reliableparts.com/brands/thermador/insulation.html) - Shop a wide selection of authentic OEM Thermador replacement parts and accessories for all your Ther...

43. [Thermador Appliance Parts - OEM & Fast Shipping](https://www.reliableparts.com/brands/thermador/freezer-parts--ice-maker.html) - Buy OEM Thermador Appliance Parts & Accessories at Reliable Parts, your #1 USA distributor for Therm...

44. [T18IF905SP/27 Thermador Built-in Freezer Column 18-Inch Panel Ready Replacement Parts](https://encompass.com/model/THET18IF905SP%7C27) - T18IF905SP/27 Thermador Built-in Freezer Column 18-Inch Panel Ready | Encompass replacement parts & ...

45. [[PDF] BSH Hausgeräte GmbH Extends Spare Part Availability to up to 15 ...](https://media3.bsh-group.com/Documents/22986951_230829-PI-Spare-Parts-Availability-Press-Information-EN-EXT-Final-v.pdf)

46. [3 Quick Facts | BSH Service | BSH Home Appliances Group](https://www.linkedin.com/posts/bsh-home-appliances-group_3-quick-facts-bsh-service-activity-7110956076849618945-WW90) - Since a repair is usually more #sustainable than a replacement of appliances, we want our consumers ...

47. [[PDF] STATEMENT OF LIMITED PRODUCT WARRANTY EFFECTIVE ...](https://media3.bsh-group.com/Documents/21052430_Thermador%20Warranty_En-Fr-SP.pdf)

48. [BSH Hausgeräte GmbH Extends Spare Part Availability to up to 15 ...](https://press.bsh-group.com/pressreleases/more-repairs-longer-lifetimes-bsh-hausgeraete-gmbh-extends-spare-part-availability-to-up-to-15-years-3367255) - More Repairs, Longer Lifetimes: BSH Hausgeräte GmbH Extends Spare Part Availability to up to 15 Year...

49. [Warranties](https://www.thermador.com/us/support/customer-care/warranties) - Learn and find out more about your Thermador appliance warranty.

50. [T24IR905SP](https://s1.img-b.com/build.com/mediabase/specifications/thermador/2024442/thermador-t24ir905s-t24id905r-specification-sheet.pdf)

51. [Statement of limited](https://static.pcrichard.com/docs/T24UW925RS_Warranty_01.pdf)

52. [Thermador customer service complaints, reviews, ratings and comments](https://www.customerservicescoreboard.com/Thermador) - Thermador customer service ranks based upon user reviews and complaints - compare Thermador customer...

53. [BSH sets up regional base in Türkiye, investing EUR 300 million](https://www.invest.gov.tr/en/news/news-from-turkey/pages/300513-bsh-sets-up-regional-base-in-turkey.aspx) - White goods manufacturer BSH expanding operations in Türkiye

54. [How to Get $8000 in FREE Thermador Appliances (2025 Guide)](https://blog.masterswholesale.com/thermador-one-two-free-rebate/)

55. [2026 Thermador One-Two-Free | Ferguson Home](https://www.fergusonhome.com/rebates/2023-thermador-one-two-free)

56. [Demonstrating resilience, investing in the future: BSH asserts itself ...](https://press.bsh-group.com/pressreleases/demonstrating-resilience-investing-in-the-future-bsh-asserts-itself-with-a-turnover-of-15-euro-billion-in-2025-in-a-challenging-environment-3439937) - 2026 (BSH) – BSH Home Appliances Group generated a turnover of €15.0 billion in the 2025 financial y...

57. [BSH increases turnover to 15.3 billion euros in 2024 and sets the ...](https://press.bsh-group.com/pressreleases/bsh-increases-turnover-to-15-punkt-3-billion-euros-in-2024-and-sets-the-course-for-further-growth-3380438) - BSH Home Appliances Group, with a total turnover of some EUR 15 billion and more than 56.000 employe...

58. [Bosch has set a course for the future in the difficult 2025 financial year](https://us.bosch-press.com/pressportal/us/en/press-release-29632.html) - Business developments in 2025: Sales revenue stable at 91 billion euros / EBIT margin from operation...

59. [Sub-Zero Classic vs Thermador Refrigerators - YouTube](https://www.youtube.com/watch?v=lS0HyDplYKg) - compare two of the most popular luxury refrigerator brands—Sub-Zero and Thermador—and break down the...

