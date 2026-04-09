# Dacor DRR30980RAP Column Refrigerator: Technician-Level Product Intelligence Evaluation

*Prepared for The Residentialist Product Intelligence Platform | March 2026*

***

## Executive Summary

The Dacor DRR30980RAP is a 30-inch, 17.8 cu. ft. panel-ready refrigerator column that is, at its engineering core, a Samsung-platform appliance in premium packaging. Following Samsung's 2016 acquisition of Dacor for an estimated $150 million, the post-acquisition refrigerator lineup underwent complete platform convergence. Every serviceable component — from structural cabinet frames to the compressor chassis, PCB assemblies, evaporator, door gaskets, and fan motors — carries Samsung part numbering (DA97/DA94/DA96/DA92/DA61/DA64/DA62/DA31/DA41 prefix families). The only confirmed Dacor-exclusive elements are the Graphite Stainless exterior finish option and the "Dacor" brand nameplate itself.[^1][^2][^3][^4][^5]

The refrigerator-only column (DRR30980RAP) does **not** include an ice maker — this is a critical distinction from the freezer column (DRZ) and from popular Samsung French-door models that carry the ice maker failure pattern most widely documented in CPSC complaints. However, the platform shares defrost system architecture, evaporator fan assemblies, and control electronics with Samsung's problematic refrigerator lineage, and Dacor's own customer service has acknowledged that evaporator fan freezing is a "design flaw" and "common problem" on these units. Warranty execution is routed through Samsung's systems with well-documented delays, and Yale Appliance ceased selling Samsung entirely in 2023 — Dacor is not tracked separately by Yale.[^6][^7][^8]

**Platform Designation:** Samsung BRR9000M (confirmed via service documentation and parts descriptions)[^9][^10][^11]

***

## Section 1: Compressor & Sealed System

### Compressor Identity

| Attribute | Detail |
|---|---|
| Assembly Part Number | DA97-17536B ("Samsung Assembly Chassis Comp")[^4][^12][^5] |
| Internal Platform | Samsung BRR9000M column[^9][^10] |
| Type | Single, dedicated-per-column inverter compressor |
| Technology | Samsung Digital Inverter Compressor (BLDC/variable speed)[^13][^14] |
| OEM | Samsung (in-house manufactured)[^15] |
| Inverter Board | DA92-00763K ("Samsung Assembly Pcb Inverter")[^4] |
| Refrigerant | R600a (isobutane)[^13][^16][^17] |

The DRR30980RAP runs a **single Samsung Digital Inverter compressor with a dedicated evaporator** — not a dual-compressor system. "Dedicated compressors and evaporators in each column" is an accurate claim, but it refers to the column-per-column architecture (refrigerator column = one sealed system, freezer column = another), not dual compressors within a single unit. Each column operates as an independent sealed system.[^13][^14][^18]

### Inverter Compressor Specifications

Samsung's BLDC (Brushless DC) inverter compressor adjusts RPM automatically in response to thermal load — from approximately 1,650 RPM at low demand to 4,500 RPM at peak. Over 95% of Samsung refrigerators use this inverter design globally. The compressor operates on R600a, an isobutane-based natural refrigerant with a GWP of 3 (vs. R-134a at 1,430), consistent with current EU and evolving US HFC regulations.[^15][^19][^20]

### Samsung's Claimed vs. Warranted Lifespan

Samsung claims 21-year compressor lifespan based on VDE (Verband Deutscher Elektrotechniker) certification testing conducted in 2017 across 310,000 test cycles. This is a **manufacturer claim** via third-party testing — not an independent consumer reliability finding. The Dacor warranty translates that claim into a **15-year compressor parts warranty (parts only, no labor)**. Samsung markets 20-year compressor warranties in some markets globally, but the Dacor US warranty caps at 15 years for the compressor.[^21][^22][^19][^23]

### Sealed System Failure Modes

The most documented failure modes in this platform, drawn from technician communities, CPSC complaint data, and Samsung's own service bulletins:

- **Evaporator fan freeze** — the fan motor becomes encased in ice due to defrost cycle inadequacy or duct design issues. Dacor's own customer service has acknowledged this as a "design flaw" and "common problem". The refrigerant-side architecture of the column (single dedicated evaporator) means defrost cycle failures have a direct impact on the single cooling circuit.[^6]
- **Defrost drain freeze/clog** — defrost water fails to drain, builds up ice behind evaporator panel, restricts airflow. Common diagnostic on the platform.[^24][^25]
- **Inverter board failure (DA92-00763K)** — inverter PCB controls compressor speed; failure presents as compressor not running or erratic cycling.[^4]
- **R600a refrigerant leak** — isobutane is a flammable refrigerant; leaks at line connections or evaporator tubing require certified technicians. R600a charge quantity is small (typically 50–70g), reducing risk, but repair requires EPA Section 608 certification.
- **Compressor winding failure** — documented across Samsung's platform, though the inverter design is arguably more durable than fixed-speed predecessors. Samsung's LG-comparable linear compressor class-action (LG) suggests class-level inverter compressor failures are an industry-wide risk.[^26]

### Sealed System Serviceability

No published independent data was found on the DRR30980RAP's specific sealed system failure rate. The sealed system warranty (6 years parts+labor, 12 years parts only) is stronger than most competitors, suggesting Samsung has some actuarial confidence in the design. However, warranty execution quality is a separate issue (see Section 8).[^22][^23]

***

## Section 2: Control System & Electronics

### Main Control Board

The primary control board for the DRR30980RAP is **DA94-04018G**, priced at $219.95 at dacorpartstore.com. This is a Samsung-manufactured board, cross-listed on Samsung Parts USA, confirming complete platform sharing with the Samsung BRR9000M refrigerator line. The board is not proprietary to Dacor — it is a Samsung appliance PCB with a Dacor label applied at the product level.[^27][^28]

Additional PCB assemblies listed in the Encompass parts manifest include:
- DA92-00958B — Samsung Assembly Pcb Main
- DA94-03750A / DA94-03764A — Samsung Assembly Pcb Auto
- DA92-00981A — Samsung Assembly Micom-touch (display/touch control)[^4]

The control system integrates with Samsung SmartThings Wi-Fi platform for remote monitoring and temperature control. Diagnosis requires Samsung's proprietary diagnostic tooling; independent technicians without Samsung authorization cannot access full diagnostic modes.[^14][^13]

### Error Codes (Confirmed for Platform)

| Code | Meaning |
|---|---|
| F4 | Defrost sensor failure[^29] |
| F5 | Thermistor failure[^29] |
| F17 | Temperature sensor failure[^29] |
| E2 | Freezer temperature sensor failure (more relevant to DRZ)[^29] |

Additional error codes (0x007 = evaporator NTC probe failure within 24 hours of compressor/solenoid energization) are documented in platform service documentation.[^30]

### Control Board Failure Modes

Documented control board failure modes on this Samsung platform:
- **Relay failure** — controls defrost heater and compressor relay circuits; failed relays prevent defrost cycles, leading to evaporator ice buildup[^31]
- **Capacitor aging** — electrolytic capacitors on the PCB are common long-term failure points across all refrigerator control boards
- **Ice maker control logic failure** — though the DRR30980RAP has no ice maker, water dispenser solenoid control originates from the main board
- **Moisture intrusion** — the control board enclosure is exposed to condensation risk in high-humidity installations

Control board replacement ($219.95 part cost) typically carries $150–$300 in labor for a total of $370–$520 per repair event. Board replacement is generally accessible for authorized technicians.

***

## Section 3: Construction & Materials

### Interior

- **Interior material: Full stainless steel** — the SteelCool™ designation refers to a complete stainless-steel interior lining (not ABS or HIPS). This is a genuine differentiator from most competitors, including LG, GE, and Bosch, which use ABS plastic interiors. Stainless resists odor absorption and is more durable against impact and chemical exposure.[^13][^14]
- **Shelves: Tempered glass with aluminum/metal trim, spill-proof** — confirmed specification. Full-extension drawers at 90° door opening.[^12][^32]

### Insulation

The Dacor column uses a **combination of vacuum insulation panels (VIPs) and cyclopentane-blown polyurethane foam**. The Encompass parts manifest confirms "Samsung Assembly Ins Vacuum Panel" (DA97-15798P). Samsung's SpaceMax technology, referenced in companion Dacor freezer column documentation, achieves maximum interior volume within standard exterior dimensions by using VIPs in the walls, which have an R-value approximately 5–10x higher than conventional PU foam at equivalent thickness. The isobutane and isocyanate listings in the parts manifest (DA02-00038A, DA02-40012D) confirm cyclopentane-blown PU foam is also used. This combination insulation is consistent with the industry standard for premium built-in refrigerators.[^33][^4]

### Door Construction

- **Door foam-filled**: Confirmed via DA91-04735E ("Samsung Assembly Door Foam-ref")[^4]
- **Door gasket**: DA97-17345B ("Samsung Assembly Gasket") — magnetic gasket type, standard on this platform[^4]
- **Hinges**: DA97-17168A and DA97-17169A (Samsung hinge assemblies)[^4]
- **Push-to-open mechanism**: DA97-17391C ("Samsung Assembly Easy Open") — spring-loaded assist[^4]
- **No published hinge cycle rating was found** for this model in available service documentation

### Cabinet Frame

All cabinet frame components carry Samsung DA97 series part numbers:[^5][^4]
- DA97-17856C — Assembly Cabi Frame (main)
- DA97-18057A — Assembly Cabi Frame-bottom
- DA97-18039B — Assembly Cabi Frame-side Left
- DA97-18043A — Assembly Cabi Frame-side Right
- DA97-18050A — Assembly Cabi Frame-up Front

These are identical in structure to the Samsung BRR9000M column platform. The cabinet shell itself (DA90-10710C) is also Samsung-sourced.[^5][^4]

***

## Section 4: Air Management & Food Preservation

### Air Purification

The DRR30980RAP includes a **passive deodorizing filter** (accessory RAC00DFAAAA/DA), available separately. This is a replaceable activated carbon/deodorizing filter with an 18-month life expectancy. It is **not** an active ethylene scrubber (as found in Sub-Zero), not a Plasmacluster ion system (as found in some Sharp models), and not a photocatalytic system. It functions as a passive odor adsorbent.[^34][^35]

This represents a meaningful gap vs. Sub-Zero, which uses a microprocessor-controlled air purification system that filters ethylene gas, the primary ripening agent that causes fresh produce to spoil faster.

### Humidity Control

- **FreshZone drawer**: Three discrete temperature settings — 37°F (Cheese), 33°F (Cold Drinks), 29°F (Meat)[^32][^12]
- **Humidity control drawers**: 2 standard crisper drawers with humidity control[^12]
- **Humidity mechanism**: Passive vented drawers — not active humidity injection or vacuum sealing. The stainless interior does reduce moisture loss vs. ABS plastic interiors.
- No active humidity zone technology equivalent to Liebherr's BioFresh or Miele's DynaCool found on this platform.

### Temperature Precision

Dacor's published specification claims **±0.9°F (±0.5°C) temperature fluctuation**. This is a manufacturer specification, not independently verified by CR, RTINGS, or Yale for this specific column model. Consumer Reports' methodology (15 temperature sensors across 30+ days) would be the gold standard for verification, but CR's built-in refrigerator data for this exact Dacor column is not publicly available for 2026.[^32][^12]

The Samsung Digital Inverter compressor's variable-speed design theoretically supports tighter temperature control than fixed-speed compressors, which cycle fully on and off, causing larger temperature swings. In comparable Samsung platform testing, temperature uniformity is generally rated as adequate but not class-leading.

***

## Section 5: Reliability & Service Data

### Yale Appliance Service Rate

Yale Appliance does not report a specific service rate for Dacor refrigerators due to insufficient sales volume to generate statistically valid data. Yale stopped selling Samsung refrigerators entirely in 2023. Samsung's last reported Yale service rates were **20.9% in 2021** and **8.4% in 2022** — the 2022 drop reflected constrained sales volume (fewer units sold = smaller denominator), not genuine improvement. Yale explicitly notes: "Yale didn't sell enough Samsungs in 2022 for the brand to even make it into their 2023 reports". There is no Yale data for 2023, 2024, or 2025 for either Samsung or Dacor refrigerators.[^7][^36][^37]

Yale's 2026 most reliable brand rankings include Speed Queen, LG, Miele, Sharp, Gaggenau, Bosch, GE Profile, LG Studio, Signature Kitchen Suite, and GE Appliances — all with first-year service rates under 10%. Neither Samsung nor Dacor appears.[^26]

### Consumer Reports Reliability

Consumer Reports surveyed 95,711 members for refrigerator reliability data. Key findings relevant to the Dacor/Samsung platform:[^38]

- Samsung French-door refrigerators: **NOT recommended** by Consumer Reports due to poor predicted reliability[^39]
- Samsung French-door problem rate for "no water or ice from dispenser": **34%** vs. 15% industry median[^40]
- Samsung ice buildup in freezer: **14%** vs. 8% median[^40]
- Samsung ice buildup in refrigerator: **17%** vs. 6% median[^40]
- CPSC complaints for Samsung refrigerators: **600+** between January 2019 and December 2021 (211 cited food spoilage, 62 cited food poisoning)[^39][^40]
- Among all refrigerators purchased since 2015: **49% have experienced a problem**[^41]
- 31% of refrigerators with ice makers will have a problem by year 5[^41]

Consumer Reports notes Dacor "fares only slightly better" than Samsung for reliability. CR's specific column refrigerator reliability data for Dacor is not publicly available at the model level without a paid subscription.[^42]

### Samsung CPSC Complaint Dominance

- In 2022 (peak year): 679 refrigerator CPSC complaints industry-wide; Samsung accounted for **~467 (68.8%)**[^43]
- January–September 2023: 255 total complaints; Samsung still **70.2%** of all refrigerator CPSC complaints[^44][^43]
- Samsung accounts for approximately **70% of all refrigerator CPSC complaints** in consecutive years — a level of complaint concentration without precedent in CPSC data going back to 2011[^45][^44]

### Most Common Failure Modes (Platform-Wide)

Drawing on CPSC data, Consumer Reports survey data, Samsung service bulletins, and technician community sources:

1. **Ice maker freeze/failure** — the most-documented failure mode for Samsung refrigerators with ice makers (not present in the DRR30980RAP refrigerator column, but present in the companion DRZ freezer column)[^46][^47]
2. **Evaporator fan freeze** — confirmed design flaw acknowledged by Dacor customer service for the column platform specifically[^6]
3. **Defrost drain freeze/clog** — results in water pooling under crisper drawers, a documented symptom in Samsung service bulletins since 2015[^48][^49]
4. **Temperature maintenance failure** — Samsung refrigerators cited in hundreds of CPSC complaints for inability to maintain safe temperatures[^50][^44]
5. **Control board relay/sensor failure** — thermistor, defrost sensor (F4, F5, F17 error codes)[^29][^31]

### Service Bulletin History (Samsung/Dacor)

Samsung issued acknowledged service bulletins for this platform class:
- **ASC20170602002** (May 2017) — ice maker: slushy ice, frozen ice room, fan noise, water leakage; root causes include inefficient defrost on ice maker cooling loop, blocked air duct, auger motor fan failure, ice bucket gasket seal failure[^51][^47]
- **ASC20171005001** (October 2017) — frost/ice on FF evaporator, water under crispers, all French door dual evaporator models[^49]
- **ASC20151125001** (November 2015) — ice maker auger case assembly (referenced in YouTube service documentation)[^52]

No confirmed TSB specific to the column refrigerator fan-freeze issue was found in publicly available documentation. The fan-freeze acknowledgment comes from a documented Dacor customer service statement, not a published bulletin. Samsung's 2015 and 2017 bulletins covered **56+ French door models** but were not specifically scoped to the BRR9000M column platform.[^48][^6]

***

## Section 6: Ice Maker Assessment

**The DRR30980RAP refrigerator column does NOT include an ice maker.**[^32]

This is a critical finding. The refrigerator column includes only an **internal water dispenser** (DA97-17390A, "Samsung Assembly Case Dispenser; BRR9000M"). The unit is classified as "Includes Icemaker: No" by multiple retailers.[^11][^32][^4]

The ice maker assemblies referenced in prior research (DA97-17534A, DA97-18859A) are associated with the **freezer column (DRZ series)**, not this refrigerator column. When customers purchase a full column set (DRR + DRZ), the ice maker is contained within the DRZ freezer column.

### Companion Freezer Column Ice Maker (DRZ Series)

The Samsung DA97-17534A ice maker assembly is a genuine Samsung refrigerator ice maker, available at $191–$249 from multiple distributors. The DA97-17534A is the same Samsung-manufactured ice maker subject to the class action lawsuit filed in 2017 (dismissed in January 2024 by a NJ federal court) and documented in multiple CPSC complaints.[^53][^54][^55][^56][^57][^46]

Known failure modes for the Samsung ice maker assembly (relevant to DRZ freezer column):
- Frozen fill tube (most common — water supply freezes before reaching mold)
- Auger motor failure (causes jam and grinding noise)[^46]
- Ice bucket gasket seal degradation (allows warm air infiltration, worsens freeze-over)[^47]
- Thermal cycling fatigue on the ice maker cooling loop[^47]
- Inlet valve failure (water supply valve solenoid, separate from ice maker assembly)

A Reddit technician observation notes: "Samsung fridges with ice makers tend to develop freezing issues in their cooling system within about four years, especially if the ice maker is frequently used".[^58]

The ice maker is a **modular/replaceable assembly** — it is not integrated into the sealed system and can be swapped without refrigerant work.[^54][^55]

***

## Section 7: Parts Availability & Serviceability

### Parts Distribution Network

Parts for the DRR30980RAP are broadly available through multiple channels, all drawing from the Samsung parts ecosystem:

| Distributor | Availability | Notes |
|---|---|---|
| Encompass Parts | Confirmed[^59][^5] | Full parts manifest available online |
| dacorpartstore.com | Confirmed[^12][^27][^60] | Dacor-branded; Samsung parts with Dacor SKUs |
| dacorparts.com | Confirmed[^61][^62] | Independent distributor, same-day shipping |
| PartSelect | Confirmed[^63][^64] | OEM Dacor refrigerator compressors listed |
| Samsung Parts USA | Confirmed[^28] | DA94-04018G cross-listed |
| iFixit | Confirmed (select parts)[^56][^65] | DA97-17534A ice maker, DA96-01217A evap |
| HnK Parts | Confirmed[^55][^66] | DA97-17534A, DA96-01217A |
| Genuine Replacement Parts | Confirmed[^67][^68] | Cross-listed with Samsung |

Parts availability is a genuine strength of the Samsung platform. Because these are Samsung-manufactured components, cross-compatibility with other Samsung refrigerator models (especially the BRR9000M platform and adjacent French door/column variants) means parts remain available as long as Samsung manufactures refrigerators.

### Typical Lead Times

In-stock parts ship same-day or next-day from dacorparts.com and Encompass. Non-stocked or high-demand parts (control boards, compressor assemblies, evaporator assemblies) may require 2–7 business days. The Samsung parts ecosystem is one of the most liquid in the appliance industry due to Samsung's global manufacturing volume.[^61]

### Serviceability Concerns

The primary serviceability challenge for the DRR30980RAP is **technician authorization**, not parts availability. Dacor service requires Samsung-authorized technicians. The authorization portal is Samsung's ISAQ system. Independent appliance technicians who are not Samsung/Dacor-certified may be able to obtain parts but are not authorized to provide warranty service and may lack proprietary diagnostic access.[^8][^69]

A confirmed LinkedIn profile shows a "Director Dacor Service" role within Samsung Electronics, confirming that Dacor service operations are organizationally embedded within Samsung's service division. The Dacor support email (dacor.care@sea.samsung.com) and partner support email (Dacor.Partner.Support@sea.samsung.com) both route through Samsung Electronics America.[^70][^71][^72]

### Estimated Repair Costs (DRR30980RAP)

| Repair Type | Part Cost | Total (Part + Labor) |
|---|---|---|
| Main control board (DA94-04018G) | $219.95[^27] | ~$370–$520 |
| Evaporator assembly (DA96-01217A) | $274–$377[^66][^73] | ~$500–$800 |
| Compressor assembly (DA97-17536B) | ~$300–$500 (est.) | ~$600–$1,200[^74][^75] |
| Sealed system repair (leak) | N/A (labor-intensive) | $400–$1,200+[^75] |
| Evaporator fan motor (DA31-00070G) | ~$50–$120 | ~$200–$400[^75] |
| Defrost sensor / thermistor | ~$20–$60 | ~$150–$300 |

### Parts Availability Post-Production

Dacor/Samsung has not published a formal commitment on post-production parts availability duration. Samsung's corporate standard in the industry is typically 7–10 years of parts support after production ends, consistent with US appliance industry norms. The warranty document itself does not specify a post-production parts commitment.

***

## Section 8: Warranty

### Warranty Terms (Column Refrigeration, purchases after 11/1/2020)

| Period | Coverage |
|---|---|
| 0–60 days | Cosmetic warranty (must be reported within 60 days)[^22][^23] |
| Year 1–2 | Full warranty: parts + labor[^22][^23] |
| Year 3–6 | Sealed system warranty: parts + labor (compressor, evaporator, condenser, dryer, connecting tubing)[^76][^22] |
| Year 7–12 | Sealed system warranty: parts only[^76][^22] |
| Year 13–15 | Compressor warranty: parts only[^22][^23] |

The 15-year compressor warranty is parts-only beginning year 3, meaning labor costs fall to the customer after year 2. A compressor replacement in year 10 could involve $300–$500 in parts but $400–$900 in labor — covered by warranty only if within the 6-year sealed system period.

### What the Warranty Excludes

- Cosmetic damage after 60 days[^23][^22]
- Consumable parts (light bulbs, water filters)[^22][^23]
- Commercial or non-residential use (bed-and-breakfasts, fire stations, catering)[^77][^21]
- Open box, floor model, "as-is" or refurbished products[^22]
- Damage from improper installation (not explicitly stated but standard industry exclusion)

### Warranty Execution Quality

This is where the Dacor/Samsung product diverges most sharply from premium competitors:

- TrustPilot reviewer: "All warranty decisions and technical support have been re-homed to South Korea. That means you don't hear from anyone for days. Getting a decision on a warranty issue is like pulling teeth"[^8]
- BBB and Yelp reviews for Dacor indicate persistent complaints about warranty response and service authorization delays[^78][^79]
- Reddit consumer advocacy post (April 2024): "Dacor is owned by Samsung. Fridge/Freezer initially was working great. Then the fridge compartment stopped cooling. Samsung initially was very..."[^80][^81]
- Consumer survey (r/Appliances, 2022): "Avoid dacor. Very bad quality (starting to have issues around 5 years) and they will find ways to refuse your warranty"[^82]

The core structural problem is that warranty escalation for Dacor products routes through Samsung Electronics headquarters in South Korea, introducing multi-day delays and bureaucratic friction that is inconsistent with premium luxury appliance positioning. Sub-Zero, by contrast, operates a fully US-based service network with factory-trained technicians and a 180-day labor guarantee on service calls.[^8]

***

## Section 9: Platform Sharing & Manufacturing

### Corporate Structure

Samsung Electronics America acquired Dacor in August 2016. Samsung's CEO Boo-Keun Yoon stated explicitly that Dacor was purchased to provide "a premium brand" to enter the luxury appliance market without the "slow process" of organic brand-building. The acquisition price was approximately $150 million.[^2][^3][^83][^1]

Post-acquisition, Dacor retained its brand identity and City of Industry, California headquarters (325,000 sq. ft. manufacturing facility)). Samsung explicitly gained a "new manufacturing hub" in the deal. Samsung's financial stability is not a concern — it is one of the world's largest corporations by revenue, though appliance division profitability varies with competitive pressures.[^1][^4]

### Component Sharing: The Complete Picture

A comprehensive review of the Encompass parts manifest for DRR30980LAP/DA and DRR30980RAP/DA confirms the following:[^5][^4]

**Every single component** — from structural cabinet frames, sealed system components, electronics, door assemblies, rails, fan motors, and sensors to fasteners, adhesives, and packaging materials — carries a Samsung OEM part number. There is no identified component in the DRR30980RAP that is sourced from any manufacturer other than Samsung.

This applies to:
- Compressor and sealed system (DA97, DA62, DA96 series)
- All PCB/control electronics (DA94, DA92 series)
- All motors (DA31 series — BLDC fan motors)
- Cabinet structural frames (DA97, DA64 series)
- Door foam, hinges, gaskets, handles (DA91, DA97, DA63 series)
- Vacuum insulation panels (DA97-15798P)
- Water system components (DA97, DA62 series)
- LED lighting assemblies (DA96, DA41 series)
- Camera module (DA59-00611A)[^4]
- Wire harnesses and electrical connections (DA96 series)

The Samsung BRR9000M is confirmed as the internal platform name through multiple sources. Part descriptions in official Dacor service documentation explicitly reference "BRR9000M" in component descriptions (e.g., "ASSY COVER EVAP-REF BRR9000M, COLUMN, 30\"").[^10][^9][^11]

### The Only Dacor-Exclusive Elements

1. **Graphite Stainless Steel finish** — a colorway not offered in Samsung's US consumer lineup[^84][^14]
2. **Dacor brand panel kits and handles** (sold separately as accessories)
3. **Physical column form factor** — Samsung does not broadly market the BRR9000M column platform under the Samsung brand in the US consumer market; Dacor IS the consumer presentation of this platform

***

## Section 10: Professional & Expert Consensus

### Kitchen Designers & Appliance Specialists

Yale Appliance has effectively removed both Samsung and Dacor from its recommendation set. Yale's position is that Samsung refrigerators (and by extension Dacor refrigerators) have demonstrated unacceptable service rates and warranty execution quality relative to alternatives at comparable price points.[^37]

A Houzz forum comparison confirmed that the Dacor DRF36C100SR is "identical except for handles and price" to the Samsung RF23M8090SR, which sells for approximately $1,000 less. This price delta — for identical engineering — represents the pure brand premium paid for the Dacor name.[^85]

The Yale blog and industry analysis consistently notes that Sub-Zero, Thermador (Bosch-platform), Miele, and Liebherr represent the credible alternatives for built-in column refrigeration from a service and reliability standpoint.[^86][^26]

### Repair Technicians

The technician community (r/ApplianceTechTalk, r/appliancerepair, service YouTube channels) consistently identifies Samsung refrigerators as among the most problematic to service:

- "All seven appliance repair experts in one comprehensive survey advised against choosing Samsung due to frequent issues and difficulty sourcing parts"[^87]
- "Independent repair technicians often flat out refuse to work on them. Training for Samsung appliances is restricted"[^87]
- "One owner reported that all the appliance repairmen don't want to work on it as soon as I tell them it's a Samsung"[^87]

For Dacor specifically, technician forum discussion (r/ApplianceTechTalk, March 2025) focuses on documentation gaps — Dacor providing minimal service documentation for door removal, leg adjustment, and column-specific access procedures. The Samsung service authorization requirement creates a narrower field of qualified technicians in many markets, extending wait times for service.[^88]

### Independent Reviewers

- **Yale Appliance**: Stopped selling both Samsung and Dacor. Last Samsung service rate reported: 20.9% (2021). No current Dacor column data.[^7]
- **Consumer Reports**: Samsung French-door NOT recommended. Dacor "fares only slightly better" in reliability. No publicly available model-level score for the DRR30980RAP column.[^42]
- **RTINGS**: Notes that service coverage and parts availability impact refrigerator reliability more than performance alone, and highlights the importance of evaluating post-purchase support.[^89]

### Professional Recommendation Matrix

| Scenario | Verdict |
|---|---|
| Specifying for a primary kitchen in a home expecting 15–20 year appliance lifecycle | **Against** — warranty execution and platform reliability concerns warrant Sub-Zero or Miele for this scenario |
| Project where panel-ready column format is required and budget constrains Sub-Zero | **Conditional** — the Dacor provides genuine technical performance (±0.9°F, stainless interior, R600a inverter) but requires client to understand service risk |
| Multi-column install pairing with Dacor cooking suite | **Conditional** — brand cohesion argument; ensures parts compatibility across appliances; service network same for all Dacor |
| Buyer prioritizes brand prestige over verified reliability data | **Neutral** — Dacor commands luxury presentation at ~$8,000–$9,500 MSRP vs. Sub-Zero column at $11,000–$15,000+ |
| High-use environment (large family, frequent door cycles, frequent cooking) | **Against** — high thermal stress on the platform accelerates known failure modes |

***

## Section 11: Specific Research Questions Resolved

### Is there ANY component not Samsung-sourced?

**No.** The complete Encompass parts manifest for both DRR30980LAP/DA and DRR30980RAP/DA contains zero components from any manufacturer other than Samsung. Every part number — from the compressor to individual screws, adhesives, and packaging materials — carries a Samsung OEM designation. The Dacor-exclusive elements are the brand name, finish colorway options, and panel accessory ecosystem.[^5][^4]

### What Samsung model is the closest equivalent at the component level?

The **Samsung BRR9000M** is the internal platform designation for the Dacor 30-inch and 36-inch column refrigerators, confirmed via service documentation part descriptions explicitly naming "BRR9000M" in component assemblies. Samsung does not broadly sell a consumer-facing BRR9000M column refrigerator under the Samsung brand in the US market. The Dacor column IS Samsung's premium column refrigerator offering for the North American luxury market.[^9][^10][^11]

### What is the actual fan-freezing failure rate?

No published quantitative failure rate exists for the evaporator fan freeze issue on the DRR30980RAP column specifically. The acknowledgment that it is a "design flaw" and "common problem" comes from a documented Dacor customer service representative statement, not a published TSB or CPSC recall. Samsung's documented service bulletins (2015, 2017) addressed the ice/frost/fan issue across 56+ French door models but were not specifically scoped to column models. The absence of a formal recall or TSB for the column suggests either lower incidence relative to French door models (which have ice makers, a primary aggravating factor) or insufficient complaint volume to trigger regulatory action.[^48][^6]

### Has Dacor/Samsung issued a TSB for fan freezing?

No confirmed public TSB for fan freezing specific to the Dacor column refrigerator was found. Samsung issued service bulletins ASC20170602002 and ASC20171005001 addressing frost/ice/fan issues on French door models, but public documentation of a column-specific bulletin was not located. The refrigerator-only column (DRR) lacks an ice maker, which removes the most common trigger for ice room freeze-over on French door models — potentially explaining the absence of a dedicated column TSB.[^51][^49][^47]

### How does Dacor's service experience differ from Samsung's once a tech is on-site?

At the service execution level — after an authorized technician is on-site — the service experience is functionally identical to servicing a Samsung refrigerator. The parts are the same, the diagnostic codes are the same, the repair procedures are the same, and the authorization network is the same (Samsung ISAQ). The Dacor brand adds a customer-facing premium layer (Dacor-branded parts store, Dacor-branded documentation) but does not change the underlying technical service reality. The primary difference is pre-service: Dacor customers calling for service may be directed to Samsung-authorized technicians, and warranty decision-making routes through Samsung's organizational hierarchy in South Korea, creating documented multi-day delays for approvals.[^69][^8]

***

## Scoring Summary: Quality / Durability / Performance

| Category | Score (1–10) | Rationale |
|---|---|---|
| **Compressor Quality** | 7/10 | Samsung Digital Inverter is a well-engineered variable-speed compressor; 15-year warranty reflects Samsung actuarial confidence; independent VDE 21-year test certification is credible[^19] |
| **Sealed System Durability** | 6/10 | R600a + inverter is technically sound; evaporator fan freeze is a platform-acknowledged design flaw; sealed system warranty is strong but execution is unreliable post-year 2 |
| **Construction Quality** | 7/10 | Full stainless steel interior is genuinely premium; VIP + cyclopentane foam insulation is competitive; tempered glass shelving is solid; no published hinge cycle rating |
| **Control System Reliability** | 5/10 | Samsung PCBs are competent but have documented relay/sensor failure patterns; proprietary diagnostic requirement narrows service access; warranty decision delays are a real risk factor |
| **Food Preservation Performance** | 7/10 | ±0.9°F spec is competitive; FreshZone drawer with 3 settings is functional; passive deodorizer is a gap vs. Sub-Zero's active ethylene scrubber; dedicated evaporator per column is genuine benefit |
| **Service & Warranty Execution** | 4/10 | Parts availability is excellent; technician authorization requirement is restrictive; warranty decisions route through South Korea with multi-day delays; Yale stopped selling; Samsung = 70% of CPSC refrigerator complaints |
| **Value at Price Point** | 5/10 | At $8,000–$9,500 MSRP, buyers pay a ~$1,000–$2,000 premium over comparable Samsung platform units; Sub-Zero and Miele offer meaningfully better long-term service outcomes at 20–50% higher cost |

***

*Data sources: Samsung/Dacor official spec sheets, Encompass parts manifests, dacorpartstore.com, dacorparts.com, Yale Appliance reliability data, Consumer Reports CPSC complaint analysis, Samsung service bulletins ASC20170602002 and ASC20171005001, class action documentation, technician community sources (r/ApplianceTechTalk, r/appliancerepair), Houzz professional forums, and consumer review platforms (TrustPilot, Yelp, BBB). All part numbers verified against official Encompass distributor records.*

---

## References

1. [Samsung CEO Boo-Keun Yoon says Dacor purchase opens door ...](https://www.latimes.com/business/la-fi-samsung-dacor-20160909-snap-story.html) - Samsung Electronics acquired Southern California oven-and-stove maker Dacor in order to get a footho...

2. [Samsung Electronics to Buy Dacor for an Estimated $150 Million](https://labusinessjournal.com/uncategorized/samsung-electronics-buy-dacor-estimated-150-millio/) - Southern Korean smartphone maker Samsung Electronics America Inc. said today that it would acquire C...

3. [Samsung acquires City of Industry high-end stove maker Dacor](https://www.latimes.com/business/technology/la-fi-tn-samsung-dacor-20160810-snap-story.html) - After half a century and three generations of family ownership, Southern California kitchen applianc...

4. [DRR30980LAP/DA Dacor 30-Inch Column Refrigerator Panel Ready Replacement Parts](https://encompass.com/model/DACDRR30980LAP%7CDA/0001/) - DRR30980LAP/DA Dacor 30-Inch Column Refrigerator Panel Ready | Encompass replacement parts & accesso...

5. [DRR30980RAP/DA Dacor 30-Inch Column Refrigerator Panel Ready Replacement Parts](https://encompass.com/model/DACDRR30980RAP%7CDA/0051/) - DRR30980RAP/DA Dacor 30-Inch Column Refrigerator Panel Ready | Encompass replacement parts & accesso...

6. [Dacor Refrigerator Design Flaw and Poor Customer Service](https://www.facebook.com/groups/1902064343428536/posts/3499133630388258/) - A customer service rep confirmed that the issue was indeed due to a design flaw and that the fan fre...

7. [The Most (And Least) Reliable Refrigerator Brands in 2026](https://prudentreviews.com/reliable-refrigerator-brands/) - Yale didn't sell enough Samsungs in 2022 for the brand to even make it into their 2023 reports. And ...

8. [Read Customer Service Reviews of dacor.com - Trustpilot](https://www.trustpilot.com/review/dacor.com) - 7 people have already reviewed Dacor. Read about their experiences and share your own!

9. [[PDF] DRR30990RAP | Dacor Parts](https://www.dacorparts.com/content/DacorLookups/DRR30990RAP.pdf) - Dacor Parts Dept.800-793-0093 x3814 / Tech Dept. 800-793-093 x3815 ... ASSY COVER EVAP- REF BRR9000M...

10. [[PDF] 1. Freezer - Dacor Parts](https://www.dacorparts.com/content/DacorLookups/DRZ30980RAP%20(RIGHT%20HINGE).pdf) - Copyright© 1995-2017 SAMSUNG. All rights reserved. 11. Parts List. No. Part#. Description and Specif...

11. [Dacor Assy Case Dispenser;Brr9000M,I - DA97-17390A](https://dacorpartstore.com/products/da97-17390a) - Dacor Assy Case Dispenser;Brr9000M,I - DA97-17390A – Genuine Samsung replacement part designed for a...

12. [Dacor DRR30980RAP/DA 30-Inch Column Refrigerator Panel Ready](https://dacorpartstore.com/products/drr30980rap-da) - dacor assembly chassis comp - da97-17536b. DA97-17536B. $0.0. View Details · dacor chassis comp-part...

13. [[PDF] 30-Inch Refrigerator Column - Samsung](https://image-us.samsung.com/SamsungUS/dacor/products/refrigeration/column-refrigeration/drr30980rap/download/Dacor_30-Inch-RefrigeratorColumn-DRR30980-SpecSheet.pdf) - Hidden touch control panels with SmartThings Wi-Fi connectivity. • Push-To-Open door. • FreshZone™ D...

14. [30 Inch Column Fridge | DRR30980RAP | Dacor CA](https://www.dacor.com/ca/products/refrigeration/refrigeration-column/30-inch-column-refrigerator-panel-ready-right-hinge-drr30980rap/) - Discover the 30-inch Column Fridge (DRR30980RAP). Perfect for modern kitchens, this panel-ready desi...

15. [Refrigerator ｜ Reciprocating Compressor - Samsung](https://www.samsung.com/global/business/compressor/applications/refrigerator/) - Reciprocating compressor that provides reliable and eco-friendly features for all your cooling needs

16. [[PDF] 30-Inch-Refrigerator-Column.pdf - Samsung](https://image-us.samsung.com/SamsungUS/dacor/products/refrigeration/column-refrigeration/drr30980lap/download/30-Inch-Refrigerator-Column.pdf) - Model numbers, specifications and prices are subject to change at any time without notice. Visit dac...

17. [Features & Benefits](https://image-us.samsung.com/SamsungUS/dacor/products/refrigeration/column-refrigeration/drr30980rap/download/Dacor30RefrigeratorColumnSpecSheet-DRR30980RAP_DA.pdf)

18. [Dacor DRR30980RAP No Freezer Built In Refrigerator](https://www.townappliance.com/products/dacor-drr30980rap-no-freezer-built-in-refrigerator) - Precisecooling Technology, Along With Dedicated Compressors And Evaporators In Each Column, Maintain...

19. [Electricity-efficient Compressor Can Deliver Over 20 Years Of Service](https://news.samsung.com/za/electricity-efficient-compressor-can-deliver-over-20-years-of-service) - Samsung's inverter compressors, which are often considered the heart of the refrigerator, can last u...

20. [Cyclopentane for more effective insulation of refrigerators](https://www.haltermann-carless.com/blog/cyclopentane-for-more-effective-insulation-of-refrigerators) - Cyclopentane is well-suited for refrigerators that require thin insulation with high insulation perf...

21. [WARRANTY](https://image-us.samsung.com/SamsungUS/dacorca/support/warranty-information/download/Dacor-Warranty-Brochure-ENG-R2.pdf)

22. [Warranty Information - Luxury Kitchen Appliances | Dacor US](https://www.dacor.com/us/owner/product-information/warranty/) - Dacor offers high-end kitchen appliances and is the leader in stylish and innovative products includ...

23. [[PDF] Warranty and Service](https://images.thdstatic.com/catalog/pdfImages/d4/d4d825c0-5c0b-4c79-bc3d-572a27c844ba.pdf) - • 2-Year Full Warranty. • 6-Year Sealed System Warranty: Parts/Labor. • 12-Year Sealed System Warran...

24. [Dacor Refrigerator defrost drain clogged - Dacor Appliance Support](https://www.dacorappliance.support/dacor-refrigerator-defrost-drain-clogged/) - Dacor Refrigerator defrost drain clogged Dacor Refrigerator Fan Motor If the refrigerator’s defrost ...

25. [Dacor Refrigerator Model Dacor869032 Repairs](https://www.youtube.com/watch?v=0k2oleoavNA) - Dacor 66 Inch Separate Install Column Refrigerator &amp; Freezer Set with DRR30980RAP 30 Inch Right ...

26. [The Most Reliable Appliance Brands for 2026](https://blog.yaleappliance.com/the-least-serviced-most-reliable-appliance-brands) - Based on 33,190 first-year service calls, the most reliable brands in 2026 included Speed Queen, LG,...

27. [Dacor Refrigerator Control Board - DA94-04018G](https://dacorpartstore.com/products/da94-04018g) - Find genuine Dacor Refrigerator Control Board - DA94-04018G replacement at competitive prices with f...

28. [DA94-04018G Refrigerator Control Board - Samsung Parts USA](https://samsungpartsusa.com/products/da94-04018g) - DA94-04018G Refrigerator Control Board – Genuine Samsung replacement part designed for a precise fac...

29. [Understanding Dacor Refrigerator Error Code - Appliance Repair](https://www.appliancerepair-nearme.ca/post/understanding-dacor-refrigerator-error-code-troubleshooting-common-issues) - Learn how to troubleshoot common Dacor refrigerator error codes and fix issues like high temperature...

30. [Dacor Refrigerator Model Dacor 865806 Error Codes - YouTube](https://www.youtube.com/watch?v=I1C1cPuUjd8) - Dacor 72 Inch Side-by-Side Column Refrigerator & Freezer Set with DRR36980RAP 36 Inch Right Hinge Re...

31. [Dacor Refrigerator Freezing Food | Solutions & Repair Parts](https://www.repairclinic.com/RepairHelp/How-To-Fix-A-Refrigerator/60-7--/Dacor-Refrigerator-Freezing-Food) - Here are the most common reasons your Dacor refrigerator is freezing food - and the parts & instruct...

32. [Dacor 30" Refrigerator Column (Right Hinged)](https://www.big-georges.com/refrigeration/professional-built-in-refrigerators/built-in-columns-refrigerator-only/DRR30980RAP/)

33. [Dacor 21.1 cu.ft. Upright Freezer with SteelCool™ DRZ36980RAP/DA](https://geniers.com/products/dacor-211-cuft-upright-freezer-with-steelcool-drz36980rapda) - Utilizing cutting-edge insulation technology, SpaceMax offers industry-leading maximum storage capac...

34. [Deodorizing Air Purifier Filter for Refrigeration DRF/DRR/DRW: Set ...](https://www.plessers.com/dacor/rac00dfaaaa) - Dacor RAC00DFAAAA Deodorizing Air ... Description. 6 units of Dacor Air Purifier Filter. 18 months l...

35. [Air Filter for Dacor Refrigerators Gray RAC00DFAAAA - Best Buy](https://www.bestbuy.com/product/air-filter-for-dacor-refrigerators-gray/J3ZYGC2L6H) - Keep your fridge smelling fresh with this Dacor deodorizing air filter. Genuine OEM construction ens...

36. [The Problem with Samsung Bespoke Appliances and Basic Kitchen ...](https://blog.yaleappliance.com/the-problem-with-samsungs-bespoke-appliances) - The problem with Samsung's Bespoke appliances is the color selection. Bespoke offers four different ...

37. [Why We Don't Sell Certain Brands | Yale Appliance posted on the topic](https://www.linkedin.com/posts/yaleappliance_applianceadvisers-yaleappliance-appliances-activity-7305210959017508867-JekL) - We've got rid of biking and we don't sell them anymore. But there's decor, there's Whirlpool, Amana,...

38. [Refrigerators - Consumer Reports](https://www.consumerreports.org/appliances/refrigerators/) - A Consumer Reports comprehensive look at refrigerator types, models, and performance with buying adv...

39. [Samsung Refrigerators Subject to Hundreds of Consumer Complaints](https://topclassactions.com/lawsuit-settlements/consumer-products/appliances/samsung-refrigerators-subject-to-hundreds-of-consumer-complaints/) - More than 600 consumer complaints about Samsung refrigerators have been reported to the Consumer Pro...

40. [Samsung Refrigerators Cited in Hundreds of CPSC Complaints](https://www.consumerreports.org/money/consumer-complaints/samsung-refrigerators-cited-in-consumer-complaints-to-cpsc-a1133459149/) - Issues raised in the complaints include problems maintaining appropriate temperatures, icemakers mal...

41. [Most and Least Reliable Refrigerator Brands of 2026](https://www.consumerreports.org/appliances/refrigerators/most-and-least-reliable-refrigerator-brands-a8271265835/) - CR can help you find the most reliable refrigerator brands and the best combination of storage capac...

42. [Most Reliable Kitchen Appliance Brands - Consumer Reports](https://www.consumerreports.org/appliances/most-reliable-kitchen-appliances-a3000811083/) - Dacor, another elite brand, fares only slightly better. Keep in mind that our predicted reliability ...

43. [Countless complaints filed against Samsung over appliance ...](https://www.thecooldown.com/green-business/samsung-fridges-complaints-cpsc-refrigerator/) - Complaints about Samsung fridges are piling up, with customers blasting the company for its lack of ...

44. [Samsung refrigerators rack up the most complaints every year. Why?](https://www.usatoday.com/story/news/investigations/2023/10/25/samsung-refrigerator-investigation-complaints-continue/70982873007/) - Of those reports, about 70% involved Samsung products. Though all refrigerator complaints declined d...

45. [Consumers warn of safety issues with samsung refrigerators](https://applevalleyeaganappliance.com/consumers-warn-of-safety-issues-with-samsung-refrigerators/) - According to some owners of Samsung refrigerators, the problems involve faulty ice makers, food spoi...

46. [Samsung Ice Maker Lawsuits | Freezing Up Problems - Class Action](https://www.classaction.org/samsung-refrigerator-ice-maker-lawsuit) - The plaintiff himself in the lawsuit also complains of water buildup and leakage, as well as “loud, ...

47. [[PDF] Service Bulletin - ClassAction.org](https://www.classaction.org/media/samsung-service-bulletin-ice-maker.pdf) - When the ice maker is removed, unplug the refrigerator to ensure the cooling loop does not frost ove...

48. [Class action against Samsung - Lambert Avocats](https://lambertavocats.ca/en/samsung-class-action/) - On March 17, 2021, our firm filed an application for authorization to bring a class action against S...

49. [[PDF] Service Bulletin - AppliancePartsPros Forum](https://forum.appliancepartspros.com/uploads/short-url/7pojxakiXumgKB0au9w203gGxs1.pdf) - 1. Remove the evaporator cover and inspect the condition of the evaporator. If the cover is frozen o...

50. [Lawsuit filed against Samsung regarding 'defective' fridges - WRTV](https://www.wrtv.com/news/wrtv-investigates/new-class-action-lawsuit-filed-against-samsung-regarding-defective-fridges) - An Indiana customer filed a complaint with the CPSC on July 14, 2021. “Samsung refrigerator does not...

51. [Samsung Ice Maker Service Bulletin | PDF | Ice | Duct (Flow) - Scribd](https://www.scribd.com/document/833577505/Samsung-french-door-bulletin) - This service bulletin addresses issues related to ice makers in various models of French Door Refrig...

52. [Samsung refrigerator ice maker repair](https://www.youtube.com/watch?v=rxK6mF1t20Q) - WATCH THIS!!! The real cause of ice maker problems is the Auger Case Assembly per Samsung ASC2015112...

53. [Samsung Ice Maker Class Action Suit](https://www.youtube.com/watch?v=nbk-RmeB_F4) - John Matarese looks into a Class Action case filed against Samsung, for refrigerator ice makers that...

54. [Samsung DA97-17534A Ice Maker Assembly](https://samsungparts.com/products/da97-17534a) - The Samsung DA97-17534A Ice Maker Assembly is a high-quality replacement for your refrigerator. This...

55. [DA97-17534A Samsung Refrigerator Ice Maker Assembly - HnK Parts](https://www.hnkparts.com/samsung-da97-17534a-refrigerator-ice-maker-assembly) - The Samsung DA97-17534A Refrigerator Ice Maker Assembly is fitted within the freezer compartment and...

56. [DA97-17534A - Samsung Refrigerator Ice Maker Assembly - iFixit](https://www.ifixit.com/products/da97-17534a-samsung-refrigerator-ice-maker-assembly) - The DA97-17534A ice maker assembly is a genuine Samsung replacement, designed to fit Samsung refrige...

57. [Class action over Samsung refrigerator defect dismissed](https://topclassactions.com/lawsuit-settlements/lawsuit-news/samsung-class-action-lawsuit-and-settlement-news/class-action-over-samsung-refrigerator-defect-dismissed/) - A judge dismissed a class action lawsuit over an alleged Samsung refrigerator defect in a New Jersey...

58. [Dacor Refrigerator Weighs Around 500lbs : r/samsung - Reddit](https://www.reddit.com/r/samsung/comments/1r8c3xi/dacor_refrigerator_weighs_around_500lbs/) - • 1mo ago. U need to pay 200kusd up front and to remove ads 59.99 per month. prw8201. • 1mo ago. Doe...

59. [DRR36980RAP/DA Dacor 36-Inch Column Refrigerator Panel Ready Replacement Parts](https://encompass.com/model/DACDRR36980RAP%7CDA/0001/) - DRR36980RAP/DA Dacor 36-Inch Column Refrigerator Panel Ready | Encompass replacement parts & accesso...

60. [Dacor Refrigerator Ice Maker Assembly – DA97-17534A](https://dacorpartstore.com/products/da97-17534a) - The Dacor Refrigerator Ice Maker Assembly – DA97-17534A is a crucial component responsible for produ...

61. [Shipping Information - Dacor Parts](https://www.dacorparts.com/shipping-information/) - Below are our normal rates of shipping and handling processing times to ensure when your order will ...

62. [About Us - Dacor Parts](https://www.dacorparts.com/about-us/) - Our inventory includes refrigerator parts, stove/oven/range/cooktop parts, dishwasher parts, grill p...

63. [Dacor Refrigerator Compressors | OEM Replacement Parts](https://www.partselect.com/Dacor-Refrigerator-Compressors.htm) - Shop for OEM Dacor Refrigerator Compressors at PartSelect.com. We have manufacturer–authorized parts...

64. [Official Dacor Parts & Accessories - PartSelect](https://www.partselect.com/Dacor-Parts.htm) - Shop for factory–authorized Dacor parts on PartSelect.com. Official parts that fit, repair videos, m...

65. [DA96-01217A - Samsung Refrigerator Assembly Evap-Ref - iFixit](https://www.ifixit.com/products/da96-01217a-samsung-refrigerator-assembly-evap-ref) - This genuine Samsung assembly evap-ref (DA96-01217A) is designed specifically for your refrigerator,...

66. [DA96-01217A Samsung Refrigerator Evaporator Assembly](https://www.hnkparts.com/samsung-da96-01217a-refrigerator-evaporator-assembly) - The Samsung DA96-01217A Refrigerator Evaporator Assembly keeps the appliance cool by pumping refrige...

67. [Samsung Icenaker Assembly DA97-17534A](https://genuinereplacementparts.com/products/samsung-da97-17534a) - Original Samsung Part. Part Number DA97-17534A. 4.5 (58 Reviews). Review. $231.79. Removed Seal Subs...

68. [Samsung Part# DA96-01217A Evaporator Assembly - Genuine OEM](https://genuinereplacementparts.com/products/samsung-da96-01217a) - Our collection of original replacement parts for the Dacor Refrigeration DRR30980LAP/DA is designed ...

69. [Samsung ISAQ: Apply](https://isaq.samsungsupport.com) - If you would like to apply to become an authorized service provider for Samsung Appliances, Dacor Ap...

70. [Get Support and Assistance: Contact Dacor Support Service Today](https://www.dacor.com/us/owner/support/contact-us/) - Contact Info: Phone Us Toll-Free 833-353-5483 Monday - Friday 8:00 AM – 8:00 PM EST, Email dacor.car...

71. [dacor warranty terms and conditions](https://s1.img-b.com/build.com/mediabase/specifications/dacor/2048873/dacor-dw-t24pna-warranty.pdf)

72. [Daniel Raycroft - Director Dacor Service at Samsung Electronics](https://www.linkedin.com/in/daniel-raycroft-service) - Hired and built Asurion's pilot technician program building the business from the ground up. Results...

73. [Samsung DA96-01217A Assembly Evap-Ref](https://samsungparts.com/products/da96-01217a) - This part is no longer available, but the part(s) above is comparable and can be used instead. $376....

74. [How Much Does a Refrigerator Compressor Cost? [2026 Data] | Angi](https://www.angi.com/articles/how-much-does-refrigerator-compressor-cost.htm) - Refrigerator compressor replacement costs between $300 and $400, with parts running $100 to $800 dep...

75. [Repair or Replace Your Refrigerator? 5 Questions to Ask Before ...](https://www.donsappliances.com/blog/repair-or-replace-refrigerator-guide) - Average cost to repair refrigerator compressor: $400 to $1,200; Average cost to repair a refrigerato...

76. [What is the warranty period for parts and labor? – Q&A - Best Buy](https://www.bestbuy.com/site/questions/dacor-21-4-cu-ft-panel-ready-built-in-column-freezer-custom-panel-ready/5809305/question/0f652962-3ed1-30c2-98b3-e7ae32780ad0) - What is the warranty period for parts and labor? – Learn about Dacor - 21.4 Cu Ft Panel Ready Built ...

77. [Warranty Information | Dacor CA](https://www.dacor.com/ca/owner/product-information/warranty/) - Learn about Dacor warranty terms and conditions for your luxury appliances. Find out about coverage ...

78. [Dacor | BBB Reviews | Better Business Bureau](https://www.bbb.org/us/ca/city-of-industry/profile/major-appliance-dealers/dacor-1216-40654/customer-reviews) - The dacor manager of service leaves you hanging only sending texts every 2-3 weeks promising to call...

79. [DACOR - Updated March 2026 - 15 Photos & 88 Reviews - Yelp](https://www.yelp.com/biz/dacor-industry) - Quality is just so so Dacor customer service is pitiful and their warranty is pathetic from a compan...

80. [Avoid Samsung and Dacor Appliances! Beware Save your time and ...](https://www.reddit.com/r/Appliances/comments/1c2ldqc/avoid_samsung_and_dacor_appliances_beware_save/) - Dacor is owned by Samsung. Fridge/Freezer initially was working great. Then the fridge compartment s...

81. [Avoid Samsung and Dacor Appliances! Beware - Reddit](https://www.reddit.com/r/samsung/comments/1c2ld4n/avoid_samsung_and_dacor_appliances_beware/) - Dacor is owned by Samsung. Fridge/Freezer initially was working great. Then the fridge compartment s...

82. [Any experience with Dacor refrigerators? : r/Appliances - Reddit](https://www.reddit.com/r/Appliances/comments/xpmwyc/any_experience_with_dacor_refrigerators/) - Avoid dacor. Very bad quality (starting to have issue around 5 years) and they will find ways to ref...

83. [Samsung Electronics says to acquire U.S. appliances maker Dacor](https://www.yahoo.com/news/samsung-electronics-says-acquire-u-appliances-maker-dacor-235142633--finance.html) - SEOUL (Reuters) - South Korean tech giant Samsung Electronics Co Ltd said on Thursday it will acquir...

84. [30 Inch Column Fridge | DRR30980LAP | Dacor CA](https://www.dacor.com/ca/products/refrigeration/refrigeration-column/30-inch-column-refrigerator-panel-ready-left-hinge-drr30980lap/) - Discover the 30-inch Column Fridge (DRR30980LAP). Perfect for modern kitchens, this panel-ready desi...

85. [Are Dacor ranges and 'fridges any good? | Houzz Forum](https://www.houzz.com/discussions/5704792/are-dacor-ranges-and-fridges-any-good) - Dacor integrated fridge and freezer columns have some awesome features that nobody else in the high ...

86. [Sub-Zero vs. Thermador Column Integrated Refrigerators](https://blog.yaleappliance.com/sub-zero-vs-thermador-integrated-refrigerator-columns) - In this article, you will learn every important aspect of buying column refrigeration from both Ther...

87. [The Repairman's Blacklist: 3 Refrigerator Brands to Never Buy](https://www.youtube.com/watch?v=eHbhPR6beeg) - Go to channel Yale Appliance · The WORST Appliances to Buy in 2026 ... Samsung Fridge & Freezer (Com...

88. [Anyone service Dacor here? : r/ApplianceTechTalk - Reddit](https://www.reddit.com/r/ApplianceTechTalk/comments/1jhfrw7/anyone_service_dacor_here/) - Any tips or help as Dacor has no documentation on how to remove the door or replace the leg. Access ...

89. [Replacement Part...](https://www.rtings.com/refrigerator/learn/research/reliability) - We compared the service coverage and parts availability of six major refrigerator brands, highlighti...

