# Viking 5 Series Built-In Column Refrigerator
## Technician-Level Product Intelligence Evaluation — FDRB5363 / VCRB5364

*Prepared for The Residentialist Product Intelligence Platform*
*Evaluation Date: March 2026 | Focus: Quality, Durability, Performance | Sources: Yale Appliance, Consumer Reports, CPSC, parts distributor data, repair technician communities*

***

## Executive Summary

The Viking 5 Series built-in column refrigerator (FDRB5363 / VCRB5364 family) is a technically capable premium appliance with genuine engineering merits — R600a refrigerant, variable-speed inverter compressor, Sharp-licensed Plasmacluster ion purification, and competitive sealed-system warranty language. On paper, it competes. In practice, it doesn't.

Yale Appliance — the most rigorously data-driven independent appliance retailer in the United States — documents a first-year service rate exceeding 60% for Viking refrigerators, sustained across multiple consecutive years. Consumer Reports ranks Viking dead last (#25 of 25) in its annual Appliance Brand Reliability Rankings, with a composite score of 34/100 and a 2/5 predicted reliability rating for refrigerators specifically. These numbers are not outliers. They represent the worst documented reliability profile in the premium built-in segment by a substantial margin.[^1][^2]

The 26North Partners acquisition (51% controlling interest in Middleby's Residential Kitchen division, $885M valuation, December 2025) introduces new ownership but no current evidence of operational improvement in refrigeration quality. Until verified service rate data confirms a trend reversal, this product cannot be responsibly specified for a high-value residential project.[^3][^4]

***

## 1. Compressor & Sealed System

### 1.1 Compressor Identity

Viking markets this compressor as the "Variable Speed DC Overdrive™ Compressor" — a proprietary marketing designation, not a manufacturer model reference. The parts diagram for the FDRB5363 lists the compressor under Viking part number **PM010620** (COMPRESSOR VCC AR), with an associated inverter assembly at part number **011666-000** (INVERTER, CMPR, ASM). The current replacement kit is **068640-000** (COMPRESSOR REPLACEMENT KIT), which supersedes PM010620.[^5][^6][^7]

**OEM identification:** Viking does not publicly disclose the compressor manufacturer. However, the available circumstantial and parts-cross-reference evidence strongly points to **Embraco (a Nidec company)**, specifically from the **VEG series** of variable-speed R600a inverter compressors. Key supporting evidence:

- The VCSB5483SS (a closely related 5 Series side-by-side) lists **"051587-000 VEGD 8H COMPRESSOR"** as its compressor part, using the standard Embraco model designation VEGD8H[^8]
- The Embraco VEG series is explicitly described as an inverter (variable-speed) compressor designed for R600a refrigerant, intended for premium residential refrigerators, and characterized by Embraco as providing "up to 40% more efficiency" vs conventional compressors with "much quieter" operation — language that directly mirrors Viking's marketing claims[^9]
- Embraco's VEGD8H (8.03 cm³ displacement, 230V, 46–133 Hz range) is confirmed in industrial parts catalogs as an Embraco unit[^10]

**Caveat:** No confirmed physical teardown data from a certified technician is publicly available for the FDRB5363 specifically. The PM010620 OEM identity cannot be stated with absolute certainty without factory documentation or teardown confirmation. The Secop VD-series (which also supports R600a in similar displacement ranges) remains a secondary candidate.[^11]

### 1.2 Compressor Architecture

This is a **single-compressor, single-evaporator** system with a variable-speed inverter. Viking is explicit: "Viking 5 Series refrigerators have one variable speed DC overdrive compressor." The Viking 7 Series (separate product) uses a dual-compressor architecture.[^12]

For a column all-refrigerator configuration (no freezer compartment), single-compressor single-evaporator is architecturally appropriate and not the primary concern. The absence of a shared freezer/fridge airflow problem inherent to combined units reduces some complexity. However, the single-compressor design means any compressor failure is a total loss of cooling.

### 1.3 Refrigerant

**R600a (isobutane)** — confirmed. This is a genuine engineering advantage:[^13][^14]

- COP (coefficient of performance) advantage of approximately 20–25% over R-134a under comparable conditions
- GWP of approximately 3 vs R-134a's ~1,300 — significant environmental differentiator
- Charge weight is lower (typically 50–100g range for this size unit vs 200g+ for R-134a)
- **Flammability consideration:** R600a is mildly flammable (Class A3). Sealed system work requires certified technicians with appropriate equipment and outdoor venting procedures. This is a serviceability complexity factor — not all HVAC technicians are certified or equipped for R600a systems.[^15]

### 1.4 Documented Sealed System Failure Modes

Based on parts diagrams, technician forums, and consumer complaint data:

- **Compressor failure / worn windings:** E1 error code (compressor fault — high/low amps). Most severe failure mode; requires full sealed system intervention[^16]
- **Evaporator icing / defrost failure:** Frost accumulation on evaporator from defrost heater or thermostat failure; related part 056483-000 (heater, evap, with fuse)[^5]
- **Refrigerant leak at copper connections:** Risk area common to systems using R600a; brazing joint failures at the evaporator tube extension (part 062792-000); confirmed leak detection risk noted in Embraco R600a service documentation[^15][^5]
- **Capillary tube restriction:** 055004-000 (TUBE CAPILLARY ASM AR 30/36) — blockage from moisture contamination or debris can prevent refrigerant flow[^5]
- **Condenser fouling:** Super Clog Resistant™ condenser is a marketing claim; condenser fan assembly 050903-000 and condenser PB920171 are serviceable. CL error code indicates dirty condenser coils[^16][^5]

### 1.5 Sealed System Lifespan

No manufacturer-published MTBF data is available. The warranty structure provides indirect evidence: Viking offers 6-year parts + labor, then 12-year parts-only coverage on the sealed system — suggesting confidence out to 6 years for full coverage but acknowledged risk after that point. A 2024 Reddit post in r/appliancerepair documents a 10-year-old Viking refrigerator requiring sealed system replacement at an estimated $1,400 (still under warranty for parts). This suggests sealed systems on pre-Middleby and early post-Middleby units do reach (and sometimes fail at) the 10-year mark. Insufficient longitudinal data exists for post-2016 re-engineered units to project reliably beyond that window.[^17][^18]

### 1.6 Inverter Board

Viking part **011666-000** (INVERTER, CMPR, ASM) is the inverter control assembly specific to the 5 Series. A 2018 service bulletin (2018-01P Parts Bulletin, referenced in the parts diagram) was issued for this component, indicating an early production change. Replacement cost: approximately $485. The inverter board converts AC to DC and controls compressor speed — failure prevents the compressor from starting, which presents as a no-cool condition with fans running.[^19][^7][^5]

***

## 2. Control System & Electronics

### 2.1 Main Control Board

The primary control board is **005319-000** "POWER CONTROL BOARD ASM 5 SERIES". A separate low-voltage board (**057309-000**) handles secondary functions. Service bulletin TR-0056-SP was issued for the 005319-000 board, confirming at least one known production correction. These boards are branded Viking but based on the post-Middleby re-engineering platform. Cross-compatibility with other Middleby Residential brands (U-Line, Lynx) has not been confirmed in publicly available documentation.[^5]

**Replacement cost:** $318–$436 for the 005319-000 board (OEM, available from Midwest Appliance Parts and others). Control board replacement total cost with labor: $400–$650.[^20][^21]

### 2.2 Control Board Failure Modes

From repair technician documentation and consumer complaint data:

- **Relay failure:** Intermittent control loss; most common documented board failure
- **Moisture intrusion:** Built-in installations can expose the control box area to condensation; Viking's motor control box (part 047016-000) with gasket (A3030361) is designed to seal this area, but moisture ingress remains a risk in humid climates[^5]
- **Inverter board failure:** Separate from the main board; prevents compressor start, can be misdiagnosed as compressor failure; diagnostics are complicated by requiring technician familiarity with the error code system[^16]
- **Display thermistor failure (E4 code):** Less common but documented[^16]

### 2.3 Diagnostic Modes and Error Codes

Viking 5 Series refrigerators support an on-board Service Mode accessible via button-combination entry (specific sequence documented in the built-in programming guide). Capabilities include:[^22]

- Reading thermistor temperatures in binary code format (Service Mode A)[^22]
- Adjusting defrost timing (Service Mode B)[^22]
- Setting compressor frequency VCC — required when replacing the low-voltage board[^22]

**Published error codes for 5 Series built-in columns:**[^16]

| Code | Meaning |
|------|---------|
| E1 | Compressor fault (high/low amps) |
| E2 | Condenser fan motor fault |
| E3 | Evaporator thermistor (Sensor B) out-of-range |
| E4 | Display thermistor (Sensor A) out-of-range |
| ED | Defrost sensor failure |
| CL | Dirty condenser coils |
| HI | Cabinet temperature too warm |
| LO | Cabinet temperature too cold |
| SA | Sabbath mode active |

Proprietary software: Service Mode A/B is documented in Viking's technician service guides and does not require proprietary diagnostic software beyond accessing the built-in mode, though the interpretation of binary thermistor output is non-intuitive and requires familiarity with Viking-specific documentation.[^22]

***

## 3. Construction & Materials

### 3.1 Interior

Interior liner material is ABS/HIPS thermoplastic — consistent with the Amana-heritage platform and industry standard for premium built-in column refrigerators. Viking does not publish specific liner specifications in consumer-facing materials.

Shelves are **3/8" tempered glass** (Spillproof Plus™ / Nano Technology) — a genuine quality differentiator at this tier. Shelf frames appear to be aluminum-edged glass based on product images and parts descriptions (Nano Shelf Assembly part 042673-000).[^23][^5]

### 3.2 Insulation

Cyclopentane-blown polyurethane foam insulation is standard for this class of appliance. No vacuum insulation panels (VIPs) are documented in Viking 5 Series column refrigerators. VIPs are used by some premium competitors (certain Sub-Zero configurations) to achieve thinner walls with equivalent insulation values.

### 3.3 Door Hinge

Viking markets this as **DuraHinge™**. The parts diagram identifies upper and lower hinge assemblies (044358-000 / 044359-000 upper; 044026-000 / 044046-000 lower). The hinge system includes door stop pins (044374-000), bushings, and a spring extension (003867-000) suggesting a spring-assisted closing mechanism. No published cycle rating is available. A prior recall (pre-2006, now resolved) involved top-hinge pivot plate screw shear on earlier built-in models, resulting in doors detaching — a historical quality issue, not current production.[^24][^23][^5]

### 3.4 Door Seal

Standard magnetic gasket — part **005447-000** (GASKET, ASM, 36, AFAR). No vacuum-sealed drawer system. Viking markets this as a standard magnetic compression seal. Sub-Zero's competing column uses a vacuum magnetic seal system, which is a documented food-preservation advantage.[^1][^5]

***

## 4. Air Management & Food Preservation

### 4.1 Plasmacluster Ion Air Purifier

This is **Sharp Corporation licensed technology** ("Plasmacluster is a trademark of Sharp Corporation"). Viking part number **010093-000**. The technology generates positive and negative ions to eliminate airborne bacteria, mold spores, and odors. Viking's marketing states it "functions at 100% capacity and never degrades or needs replacing". This is consistent with Sharp's published claims for Plasmacluster — it is an ionizer, not a filter, so there is no consumable media to replace.[^25][^26][^5]

**Performance qualification:** Plasmacluster is a documented technology with peer-reviewed efficacy data for airborne pathogen reduction. Its practical effect on produce freshness in a refrigerator compartment is less clearly differentiated from Sub-Zero's active air scrubber, which specifically targets ethylene gas — the primary driver of fruit ripening and vegetable senescence. Sub-Zero's system scrubs ethylene; Viking's ionizes bacteria and mold. These are different mechanisms addressing different spoilage pathways.[^1]

### 4.2 Humidity Control

**Two Humidity Zone™ Drawers** with adjustable humidity settings and soft-close slides. These are passive humidity zones using adjustable vent dampers — not sealed vacuum-magnetic drawers. Sub-Zero's competing design uses magnetized drawer seals that actively retain humidity. Viking's system is functionally adequate but less sophisticated than the benchmark in this regard.[^14][^1]

### 4.3 Temperature Precision

Viking claims temperature control within **±1°F**. The variable-speed compressor architecture supports this claim in principle — inverter compressors modulate speed to maintain setpoint rather than cycling on/off, which reduces temperature swings. This is a genuine technological advantage of the inverter design. No independent third-party laboratory test results for the FDRB5363 specifically were located in available public literature.[^1]

***

## 5. Reliability & Service Data

### 5.1 Yale Appliance Service Rate

Yale Appliance (Boston metro, 37,000+ annual service calls, in-house 23-technician service team) tracks service rates as service calls ÷ units sold per year:

**Viking refrigerators: >60% first-year service rate, sustained across multiple consecutive years.**[^1]

Steve Sheinkopf (Yale CEO): *"I originally was excited about the new Viking, but the service issues are perplexing, especially on a brand so reliant on their name recognition. We are lucky to have 23 techs on staff because the Viking service rate was over 60% in the first year. Four years later, the problems remain."*[^1]

To contextualize this figure, Yale's 2025 service rate data for the best-performing premium brands shows LG at 8.4%, Bosch at 12.5%, GE at 19.2%. Viking's >60% rate represents a failure multiplier of approximately 5–7x relative to best-in-class competitors and approximately 3–4x relative to the average built-in refrigerator category rate of ~12–21%.[^27][^28]

**Critical note:** Yale has not published a separate 2025 Viking refrigerator service rate update confirming improvement. The "four years later" framing from the January 2025 blog post indicates the rate was still elevated through at least late 2024.[^1]

### 5.2 Consumer Reports

Consumer Reports ranks Viking #25 of 25 in its fifth annual Appliance Brand Reliability Rankings — last place, with a composite reliability score of **34/100** and a refrigerator predicted reliability rating of **2/5**. This ranking is based on survey data from over 528,800 appliances purchased between 2012 and 2022. Notably, CR explicitly states that "the most reliable brand, Speed Queen, and the least reliable brand, Viking, maintained their positions at the top and bottom of our chart" — indicating Viking's last-place ranking is not a single-year anomaly.[^2]

### 5.3 Consumer and Technician Reports

**Reddit r/Homebuilding (2023):** A builder documented 100% defect rate across 6 Viking appliances in a new construction, including 33% outright failure rate. Viking's 2-year warranty covered most issues but involved months of service delays and multiple wrong parts sent.[^29]

**Reddit / consumer forums (multiple):** Consistent pattern of months-long delays to replace defective units under warranty, replacement units also defective, wrong parts sent repeatedly. A June 2025 Trustpilot review: "It's been months since I reported the issue, and Viking has done nothing to fix it. Customer service is practically nonexistent".[^30][^31]

**PissedConsumer.com:** Recurring themes include product failures across multiple Viking appliance categories, parts unavailability, poor and unresponsive customer service, disputed warranty coverage.[^32]

**BBB (Greenwood, MS):** Multiple open complaints documenting repeated unresolved defects in Viking refrigerators under factory warranty.[^33]

### 5.4 Dominant Failure Modes (from technician and consumer data)

No public registry disaggregates Viking's failure modes by component category. Based on available repair documentation, parts ordering patterns, and consumer reports, the most probable failure mode ranking is:

1. **Ice maker** — highest frequency single-part failure across premium refrigerator brands; Viking's ice maker (057731-000) is described as a commonly broken component with "break all the time" characterization in technician forums. This is likely the leading driver of first-year service calls.[^34]
2. **Control board (005319-000 / 011666-000 inverter board)** — moisture intrusion, relay failure, and inverter board failures. Multiple board repair services exist specifically for this part number, indicating high failure volume.[^35][^36]
3. **Compressor / sealed system** — less frequent in the first year but potentially catastrophic; E1 fault codes documented.[^37][^16]
4. **Defrost system** — heater (056483-000) and defrost thermostat failures leading to evaporator icing and cooling loss.[^5]
5. **Condenser fan** — E2 fault code; part 050903-000.[^5]

**Systemic vs. Component Failure:** The >60% first-year service rate is inconsistent with a single dominant component failure and more consistent with systemic quality control problems — multiple component failure modes occurring across the population, likely related to assembly process variation, supplier quality, and testing rigor rather than a single correctable defect.

***

## 6. Ice Maker

### 6.1 Identification and Serviceability

Viking 5 Series column refrigerator ice maker: **part number 057731-000** (shared with 7 Series bottom-mount). Available from AllVikingParts, Encompass, AppliancePartsGroup.[^38][^39][^40]

**Important note:** Part 057731-000 is "NO LONGER AN ASSEMBLY" — it has been superseded and is now ordered as separate sub-components (bail arm 082824-000, and other parts). This part fragmentation can complicate field replacement and increase risk of incomplete orders.[^41]

The ice maker is **modular and replaceable** — technicians describe replacement as a 5–10 minute job. It is not integrated into the sealed system.[^34]

### 6.2 Failure Modes

- **Frozen fill tube** — inlet valve pressure issues or temperature cycling; hot water flush can restore function temporarily[^42]
- **Wire bail arm displacement** — arm not properly seated in hole causes overproduction, documented as a known issue[^43]
- **Inlet valve failure** — no water reaching the mold; common after water supply interruptions[^42]
- **Motor failure** — requires full ice maker assembly replacement
- **Thermal cycling fatigue** — ice maker module failure from repeated freeze-thaw cycles; "they break all the time" per r/appliancerepair[^34]

### 6.3 Failure Rate

No model-specific ice maker failure rate is published. Industry-wide, Consumer Reports estimates 31% of refrigerators with ice makers experience a problem by year 5, and Yale identifies ice maker failures as the leading driver of first-year refrigerator service calls across brands. Given Viking's elevated baseline service rate, ice maker failures are presumed to occur at a rate substantially above the industry average.[^28][^44]

***

## 7. Parts Availability & Serviceability

### 7.1 Parts Distribution Network

Viking parts are available through multiple channels, including:

- **allvikingparts.com** — factory-authorized dealer, dedicated Viking parts specialist[^45]
- **Encompass** — major OEM distributor for 350+ manufacturers including Viking[^46][^47]
- **Midwest Appliance Parts** — stocked power control board, compressor kit[^48][^20]
- **AppliancePartsGroup** — full FDRB5363 parts diagram and inventory[^5]
- **Kimball Appliance Parts, Anderson Appliance Parts, iFixit** — compressor kit 068640-000[^7][^49][^50]

### 7.2 Key Part Pricing (OEM, 2025–2026)

| Component | Part Number | OEM Price Range |
|-----------|-------------|----------------|
| Compressor replacement kit | 068640-000 | $848–$1,212[^51] |
| Power control board | 005319-000 | $318–$436[^20] |
| Inverter board assembly | 011666-000 | ~$485[^7] |
| Ice maker (now sub-parts) | 057731-000 superseded | ~$100–$200 sub-parts |
| Compressor + labor total | — | $900–$2,000[^52] |
| Control board + labor total | — | $400–$650[^21] |

### 7.3 Parts Availability vs. Reality

Viking's marketing claims next-day parts availability through its dealer network. Consumer complaint data tells a contradictory story: multiple documented cases of wrong parts shipped, multi-week to multi-month delays, and parts shown "not available online / call for pricing" directly in the parts diagram (e.g., FDRB5363 parts show this notation on several items). A service network under >60% service rate pressure is structurally stressed — technician availability, parts throughput, and customer service queues are all impacted by abnormally high service volume.[^5]

### 7.4 Parts Availability Commitment

Viking's warranty language does not specify a post-discontinuation parts availability commitment. The Middleby acquisition and subsequent platform re-engineering (>90% of products redesigned) means the FDRB5363 parts from the immediate post-Middleby era may not be cross-compatible with current production variants, increasing obsolescence risk.[^53]

### 7.5 Service Network

Warranty service requires Viking-authorized technicians. Non-authorized service voids warranty. In markets with limited Viking-authorized coverage, this creates structural service delays. Viking's authorized service network is characterized by industry observers as relying primarily on independent authorized technicians rather than a factory-direct service force (unlike Sub-Zero's more integrated service infrastructure). Yale's in-house service team is able to service Viking units, but only because of their scale.[^18][^54][^1]

***

## 8. Warranty — Full Analysis

### 8.1 Coverage Structure

| Period | Coverage |
|--------|---------|
| Years 1–2 | Full warranty: all parts + labor on complete unit[^18] |
| Years 3–6 | Sealed system components: parts + labor (compressor, evaporator, condenser, tubing, dryer)[^18] |
| Years 7–12 | Sealed system: parts only (labor at owner's expense)[^18] |
| 90 days | Cosmetic parts only (glass, painted items, decorative)[^18] |

### 8.2 What the Warranty Actually Excludes

- Cosmetic damage after 90 days[^18]
- Damage from improper installation — significant risk in built-in applications where installation complexity is high[^18]
- Damage from power outages or power loss — eliminates warranty coverage for a common refrigerator damage scenario[^18]
- Commercial or "Residential Plus" use (reduces to 90 days)[^18]
- Consequential or incidental damages including food loss — explicitly disclaimed[^18]
- Labor at overtime or premium rates — technicians who respond urgently do not have labor covered[^18]
- Work performed by non-authorized technicians[^18]
- Products purchased as B-stock, liquidation, refurbished, or used[^18]

### 8.3 Warranty in Practice

The warranty language is competitive on paper. In practice, the >60% service rate creates structural warranty execution problems. When 60%+ of units require a service call in year 1, authorized technician availability is strained, dispatch times extend, and parts shortages emerge. Consumer documentation of this problem is extensive and consistent: months to obtain service, wrong parts, replacement units also defective.[^31][^30][^33]

The 6-year sealed system warranty is particularly relevant because sealed system failures cluster industry-wide in the years 4–7 window. However, labor costs for sealed system work (refrigerant recovery, compressor replacement, brazing) are only covered through year 6 — the exact period when failure risk begins to peak. After year 6, the owner bears full labor cost on what is often a $900–$2,000 total repair.[^55][^52]

***

## 9. Platform Sharing & Manufacturing

### 9.1 Manufacturing

All Viking refrigerators are assembled in **Greenwood, Mississippi** at the Viking Range campus. Viking moved refrigerator manufacturing from Amana/Maytag contract production to Greenwood in 2000 when it acquired Amana's high-end refrigerator equipment. The current post-Middleby platform represents a ground-up redesign: Kevin Brown directed re-engineering of over 90% of Viking products after the 2013 acquisition, and Viking released 70+ new products under his leadership. Assembly remains in Greenwood with approximately 700+ employees.[^56][^57][^58][^59][^53]

**Component sourcing:** The compressor is sourced externally (Embraco/Nidec most likely). The Plasmacluster ionizer is Sharp-sourced technology. Control electronics are assembled from externally sourced PCBs. The integration and quality control of these components happens in Greenwood.[^26]

### 9.2 Corporate Structure

**Middleby Corporation** (NASDAQ: MIDD) acquired Viking Range in February 2013 for $340 million from founder Fred Carl Jr.. In December 2025, **26North Partners** (Josh Harris, PE) agreed to acquire 51% controlling interest in Middleby's Residential Kitchen division (including Viking, AGA, Rangemaster, La Cornue, Lynx, U-Line, Kamado Joe, Masterbuilt) at an $885 million valuation. Middleby retains 49%. The transaction was announced December 3, 2025 and subject to regulatory approval.[^4][^60][^3][^1]

**26North's track record with appliance manufacturing** is not yet established — this is the firm's sixth PE deal in approximately one year and its first foray into premium appliance manufacturing. 26North is a PE firm, not an appliance operator. Whether the ownership transition will accelerate quality improvement, maintain the status quo, or result in further cost engineering is speculative at this stage.[^61]

### 9.3 Shared vs. Differentiated Components

**Shared within corporate family:** The Middleby/26North residential kitchen portfolio (Viking, Lynx, U-Line) likely shares some component suppliers and potentially inverter board formats. No confirmed cross-compatibility data is publicly available at the specific part number level.

**Genuinely differentiated:** The Plasmacluster ion system (Sharp license) is Viking-exclusive within the corporate family. The ProChill temperature management software and compressor control calibration are Viking-specific implementations, though built on the Embraco inverter platform.[^26]

### 9.4 The Middleby Lawsuit Context

When Middleby acquired Viking, it subsequently sued former Viking shareholders for $100 million, alleging that the prior owners had known about product defects and poor service records but did not disclose them during the sale. This lawsuit — regardless of its outcome — documents that Viking's quality and reliability problems predated the Middleby acquisition and were known internally. The post-Middleby re-engineering effort was a genuine attempt at correction; the lingering >60% service rate indicates that the correction has not yet fully materialized in refrigeration quality.[^62]

***

## 10. Professional & Expert Opinion

### 10.1 Yale Appliance

Yale does not currently recommend Viking built-in refrigerators. Their 2026 ranking of best built-in refrigerators features Sub-Zero, Miele, Thermador, Fisher & Paykel, JennAir, SKS, and True Residential — Viking is not included in any recommended tier. The direct quote from CEO Steve Sheinkopf is unambiguous: the >60% service rate, sustained over four-plus years, makes Viking refrigerators indefensible at their price point.[^63][^1]

### 10.2 Consumer Reports

Viking ranks last out of 25 brands in overall appliance reliability — a position it has held consistently across multiple survey cycles. Its refrigerator predicted reliability score of 2/5 places it in the bottom tier alongside Electrolux and Dacor. CR does not currently feature Viking in its recommended built-in refrigerator list.[^64][^2]

### 10.3 Independent Reviewers and Kitchen Designers

The professional consensus from kitchen designers and appliance specialists is bifurcated by category:

- **Viking ranges and cooking equipment:** Generally respected, specified routinely, and considered competitive in the professional residential segment
- **Viking refrigeration:** Actively cautioned against by multiple retailers and reviewers; the brand's cooking reputation masks refrigeration weakness in the eyes of consumers, which is a persistent problem for unsuspecting specifiers

Good Housekeeping's 2025 built-in refrigerator review features models from Miele, Dacor, Samsung, Sub-Zero, and Thermador — Viking is not among the recommended options.[^65]

### 10.4 Repair Technicians

Technicians working with Viking refrigerators note:
- The ice maker is a modular, easy-to-replace component but fails at high frequency[^34]
- Control board (005319-000) has sufficient failure volume to support multiple third-party repair services (Circuit Board Medics, UpFix, The Repair Shack) — a market signal for component failure volume[^66][^36][^35]
- R600a sealed system work requires technicians with appropriate certification and equipment, limiting the service provider pool[^15]
- The compressor frequency setting in Service Mode must be reconfigured when replacing the low-voltage board — a step that, if missed, causes operational problems and may drive unnecessary repeat service calls[^22]

### 10.5 Recommend For / Against

**Professional consensus: SPECIFY AGAINST for built-in refrigeration.** Specific scenarios where against is even more emphatic:

- **New construction / multi-unit builds:** A builder reporting 100% defect rate across 6 Viking appliances illustrates the cumulative risk in spec-and-ship scenarios where post-installation service is the builder's problem[^29]
- **Remote locations / limited service coverage:** Viking's authorized service network thinness amplifies the already-long wait times
- **High-use households:** No evidence that high duty cycles are handled better than the general population — the failure rate is a quality-control issue, not a use-intensity issue
- **Clients who will blame the designer:** The documented failure rate is well above any professional standard for a $9,000–$12,000 appliance and creates professional liability exposure for the specifier

**Viking refrigeration is most defensible when:**
- The client already owns Viking cooking equipment and insists on brand matching (aesthetic continuity argument only)
- The client is in a major metro with robust authorized service coverage and accepts the service rate reality with full disclosure
- The project timeline allows for close monitoring of early service calls within the 2-year warranty window
- The client explicitly prioritizes the Plasmacluster ion system or has specific reasons to prefer the Viking single-column form factor over alternatives

***

## 11. Specific Questions — Research Outcomes

### 11.1 Who Manufactures the Compressor?

The most likely answer is **Embraco (Nidec/Whirlpool)**, VEG-series variable-speed R600a inverter, based on the VEGD8H designation in Viking's own parts documentation for the closely related 5 Series side-by-side, Embraco's explicit characterization of the VEG series as designed for exactly this application, and the cross-reference of replacement kit 068640-000 superseding PM010620. **However, this is NOT confirmed by physical teardown documentation in any publicly available source reviewed.** A factory-certified technician inspection of the actual compressor nameplate would be required to confirm OEM identity with certainty.[^7][^8][^9]

### 11.2 Has the Service Rate Improved Under Kevin Brown / 26North?

Kevin Brown has been president since 2016. Yale's January 2025 blog post — written by Yale's CEO who has had ongoing service data access — explicitly states problems remain "four years later". The 26North acquisition closed (or was in closing) in early 2026 and is far too recent to have produced measurable quality improvements. **No publicly available data confirms any service rate improvement in Viking refrigerators.** The burden of proof must remain on Viking to demonstrate improved reliability through future service rate reporting.[^67][^1]

### 11.3 What Failure Modes Drive the Service Rate?

Based on available evidence, this appears to be a **systemic quality control problem rather than a single dominant component failure.** The most probable breakdown, in order of estimated frequency:

1. Ice maker failures (modular, common across all brands at elevated rate)
2. Control/inverter board failures (multiple repair services exist for 005319-000, suggesting high volume)
3. Defrost system failures (evaporator heater, thermostat)
4. Compressor/sealed system failures (lower frequency, higher severity)
5. Assembly defects (improper installation, wrong parts at factory, calibration errors)

The consumer record of wrong parts being shipped suggests production quality issues extending beyond just component failures into supply chain and order management.

### 11.4 Are Parts Actually Available Next-Day?

**No — not reliably.** The claimed next-day availability is contradicted by consistent consumer reports of weeks-to-months lead times and wrong parts shipped. The parts diagram itself flags multiple FDRB5363 components as "Not available online / Call for pricing and availability". A service network operating under 60%+ service demand inherently cannot maintain the inventory turns necessary for reliable next-day fulfillment.[^32][^31][^5]

### 11.5 What Is the Actual Sealed System Lifespan?

Insufficient longitudinal data exists for post-2016 re-engineered units. The only public data point: a 2024 Reddit post documents a 10-year-old Viking requiring sealed system replacement, consistent with the 6–12 year warranty window. Pre-2013 units are a different manufacturing generation. Until post-2016 units accumulate 8–12 years of real-world operation in sufficient sample size, sealed system durability for the current platform cannot be meaningfully projected. The 12-year parts coverage is the strongest honest signal available — Viking's own actuaries apparently anticipate sealed system claims in that window.[^17]

***

## 12. Platform Intelligence Summary: Scoring Input

| Dimension | Finding | Score Signal |
|-----------|---------|-------------|
| Compressor technology | Inverter R600a — genuine efficiency & precision advantage | Positive |
| Compressor architecture | Single compressor / single evaporator — appropriate for column but single point of failure | Neutral |
| Compressor OEM | Likely Embraco VEG (premium supplier) but unconfirmed | Neutral-Positive |
| Sealed system warranty | 6-year parts + labor / 12-year parts only — competitive language | Positive |
| Sealed system execution | Warranty operationally stressed by service volume; labor exclusion after year 6 | Negative |
| Air purification | Sharp Plasmacluster — documented ionization technology, no consumables | Positive |
| Humidity management | Adjustable passive zones — functional but below Sub-Zero benchmark | Neutral |
| Temperature precision | ±1°F claim supported by inverter design — plausible but not independently verified | Neutral-Positive |
| First-year service rate | >60% (Yale, sustained 4+ years) — worst in class by substantial margin | Severely Negative |
| 5-year reliability | CR ranked #25/25, score 34/100, refrigerators 2/5 | Severely Negative |
| Consumer complaint pattern | Systemic: multiple failure modes, wrong parts, multi-month warranty waits | Severely Negative |
| Parts availability | Wide distribution network but real-world availability undermined by demand volume | Mixed-Negative |
| Serviceability (R600a) | Limits technician pool; adds complexity and cost to sealed system work | Negative |
| Build quality (shelves, hinges) | 3/8" tempered glass, DuraHinge — marketed as premium; consistent with tier | Positive |
| Corporate stability | 26North acquisition introduces new ownership risk/opportunity; too early to assess | Uncertain |
| Manufacturing | Greenwood, MS (domestic assembly) — supply chain risk lower than import-only | Neutral |
| Professional consensus | Not recommended by Yale, CR; active "recommend against" stance | Severely Negative |

***

## Competitive Context

At the $9,000–$12,000 price point for a 36" built-in column refrigerator, the Viking 5 Series FDRB5363 competes directly against:

- **Sub-Zero Classic Column (CL3650U):** Dual compressor, vacuum-sealed drawers, ethylene scrubber, NASA-developed air purification, 20+ year expected lifespan, Sub-Zero's factory service network, CR 4/5 predicted reliability. Price-comparable. The benchmark in this category.[^68]
- **Thermador Freedom Column:** Dual compressors, fully flush integrated, Freedom Hinge (no frame visible), manufactured in same plant as Miele, CR top-tier reliability. Slightly higher price.[^69]
- **Miele MasterFresh Column:** DynaCool uniform temperature distribution, MasterFresh humidity system, Miele's vertically integrated manufacturing model, strong long-term parts availability commitment. Premium price.
- **True Residential Column:** Commercial-grade stainless construction (not ABS liner), all-stainless interior, 14 color options, high build quality — lacks smart features and column flexibility.[^70]
- **Fisher & Paykel (Haier corporate):** More value-oriented entry into column segment; F&P service rate has shown volatility (18.9% in 2024 per Yale).[^27]

**The honest professional assessment:** At this price point, with these service numbers, Viking's column refrigerator is the weakest option in the competitive set on the dimension that matters most to long-term client satisfaction: reliability.

***

*Research sources: Yale Appliance service data and blog, Consumer Reports Appliance Brand Reliability Rankings (fifth annual), CPSC enforcement actions, Viking Range warranty documentation (vikingrange.com), Viking parts diagrams (allvikingparts.com, appliancepartsgroup.com), Embraco product portfolio (embraco.com), Secop product portfolio, r/appliancerepair, r/Homebuilding, BBB complaint records, Trustpilot reviews, PissedConsumer reviews, BusinessWire/WSJ 26North acquisition announcements, TWICE Magazine, KBB Online, parts distributor pricing (Midwest Appliance Parts, Kimball Appliance Parts, AllVikingParts, iFixit), Armadillo/Angi compressor cost data.*

---

## References

1. [Viking vs. Sub-Zero Refrigerators - Yale Appliance Blog](https://blog.yaleappliance.com/viking-vs-subzero-refrigerators) - We are lucky to have 23 techs on staff because the Viking service rate was over 60% in the first yea...

2. [Which Brands Make the Most Reliable Appliances?](https://www.sksappliances.com/media/documents/consumer-reports-appliance-brand-reliability-rankings.pdf)

3. [Josh Harris's Firm Strikes Deal for Middleby Unit That Makes Viking ...](https://www.wsj.com/business/deals/josh-harriss-firm-near-deal-for-middleby-unit-that-makes-viking-stoves-50602c68) - 26North Partners will acquire a 51% stake in Middleby's kitchen-products division, valued at $885 mi...

4. [26North and The Middleby Corporation Agree to Form $885 Million ...](https://www.businesswire.com/news/home/20251204257596/en/26North-and-The-Middleby-Corporation-Agree-to-Form-$885-Million-Partnership-for-Residential-Kitchen-a-Leading-Collection-of-Premium-Cooking-Refrigeration-and-Outdoor-Living-Brands) - The Partnership Includes Storied Names such as Viking, AGA, Rangemaster, La Cornue, Lynx, U-Line, Ka...

5. [[PDF] FDRB5363 Refrigerator - Appliance Parts Group](https://www.appliancepartsgroup.com/content/VikingLookups/FDRB5363.pdf) - HARNESS LOW VOLT 5 SERIES 1. EA. 13. 057309-000. BOARD, LOW VOLTAGE. 1. EA ... COMPRESSOR VCC AR. 1....

6. [Viking FDRB5363L - Warners' Stellian](https://www.warnersstellian.com/product/10018/viking-professional-fdrb5363l) - Variable Speed DC Overdrive™ Compressor quickly chills food and saves energy · Single compressor sys...

7. [068640-000 COMPRESSOR KIT (011666-000) ( 054295-000 COMP ...](https://kimballapplianceparts.com/viking/068640-000/) - This Compressor Kit (011666-000) is a Genuine Viking replacement for Part Number 068640 ... Print. R...

8. [[PDF] VCSB5483SS01 - Viking Parts](https://allvikingparts.com/v/vspfiles/downloadables/VCSB5483SS01.pdf)

9. [Household - Embraco](https://www.embraco.com/en/solutions/household/) - Household solutions for residential refrigerators, freezers and mini-fridges, through a robust portf...

10. [VEGD8H Embraco - HVAC SPARE PARTS](https://hvacspareparts.com/vegd8h-embraco/compressors/194797) - VEGD8H Embraco Hermetic Compressors fos HVAC Spare Parts or new Refrigeration System. ; Displacement...

11. [Hermetic compressors & condesing units - Complete Portfolio - Secop](https://www.secop.com/products/product-portfolio) - Explore Secop’s complete product portfolio, featuring high-efficiency hermetic compressors and advan...

12. [Frequently Asked Questions about Viking Refrigeration Appliances](https://www.vikingrange.com/consumer/category/products/frequently-asked-questions/refrigeration-appliance-questions) - Viking Frequently Asked Questions: Refrigeration

13. [Viking Genuine OEM LX37020 - Compressor R600A Model Only](https://www.appliancepartsgroup.com/products/viking-lx37020-compressor-r600a-model-only.html?searchid=0&search_query=model+number) - Buy a Genuine OEM Viking LX37020. Buying the original manufacturer replacement part ensures durabili...

14. [Viking VCRB5364LCS 36 Inch Built-In Column Refrigerator Cast Black](https://www.plessers.com/viking/vcrb5364lcs) - 36 Inch Built-In Column Refrigerator with 22.8 Cu. Ft. Capacity, ProChill™ Temperature Management, P...

15. [embraco R600a Refrigerant Compressor User Manual](https://manuals.plus/m/830915bb289fd9f484a3ef9645f022d49abe2e38e96594c63968326614f6f802) - A comprehensive guide from Embraco on the safe use, handling, and servicing of R600a and R290 hydroc...

16. [Common Viking Refrigerator Error Codes](https://www.topappliancerepairnyc.com/services/common-viking-refrigerator-error-codes/) - Viking refrigerators are known for their quality, durability, and longevity, but they are still subj...

17. [replace sealed system of 10 year old Viking fridge for 1400 or buy a ...](https://www.reddit.com/r/appliancerepair/comments/1eh3uc2/sanity_check_replace_sealed_system_of_10_year_old/) - My 10 year old viking fridge needs a new sealed system. It's still under warranty but the service fr...

18. [Support and Docs | Warranty Information - Viking Range, LLC](https://vikingrange.com/support-and-documentation/warranty) - Explore Viking Range, LLC's support and warranty details for our high-end luxury appliances. Get the...

19. [Inverter Control Board (Refrigerator Compressor) | Repair & Replace](https://www.youtube.com/watch?v=4_c978da0ZQ) - Failed inverter control board? In this episode of Repair & Replace, Vance shows to install a new inv...

20. [005319-000 Vikingpower Control Board - Midwest Appliance Parts](https://midwestapplianceparts.com/products/005319-000-viking-005319-000-power-control-board) - For urgent shipping, choose Next Day or 2-Day Air by 10 am CST. $318.04 USD. Retail List Price $435....

21. [Viking Appliance Repair Costs—What's Normal?](https://vikingappliancerepairs.com/viking-appliance-repair-costs-what-to-expect/) - Repair costs are different for each kind of appliance and the problem you have. Viking refrigerators...

22. [Viking Built-In Refrigeration Programming Featureswww.uncleharrywizard.com › viking › programming-and-diagnostic](http://www.uncleharrywizard.com/nephewclub/wizardrange/viking/programming-and-diagnostic/Viking%20Built-In%20Programming%20Guide.pdf)

23. [Viking® 5 Series 36" 20.4 Cu. Ft. Stainless Steel Built In Bottom ...](https://www.allinc.com/product/viking-5-series-36-in-204-cu-ft-stainless-steel-built-in-bottom-freezer-refrigerator-vcbb5364rss-1714627) - 3/8" thick tempered glass shelves provide industry leading durability. ... Robust DuraHinge™ allows ...

24. [Refrigerator Recall - Viking Range, LLC](https://www.vikingrange.com/consumer/category/other/safety-recall-information/built-in-refrigerator-freezer-recall/learn-more) - Before Viking, home chefs had no options. With Viking, there is no other option. Over the past 30 ye...

25. [Viking Refrigeration Reviews: Written By Customers](https://www.consumeraffairs.com/homeowners/viking_refrigerator.html) - Its refrigerators are luxury models with commercial-grade technology and hardware, and they typicall...

26. [36" Built-In Column Freezerless Refrigerator, 22.8 cu. ft. Capacity](https://www.appliancepalace.com/products/viking-vcrb5364rna.html) - Viking 36" Built-In Column Freezerless Refrigerator, 22.8 cu. ft. Capacity in Nantucket · Two adjust...

27. [The Most (And Least) Reliable Refrigerator Brands in 2026](https://prudentreviews.com/reliable-refrigerator-brands/) - In this guide, I reveal the most reliable refrigerator brands. I also share the least reliable brand...

28. [Most Reliable Counter-Depth Refrigerators 2026: Based on REAL Service Calls](https://www.youtube.com/watch?v=_PHK0oq39xw) - Download our FREE Counter-Depth Refrigerator Buying Guide: https://blog.yaleappliance.com/free-count...

29. [Viking appliances: My experience in my new build. 100% defect rate ...](https://www.reddit.com/r/Homebuilding/comments/14be8m3/viking_appliances_my_experience_in_my_new_build/) - Viking has a two year warranty so problems that fell within that timeframe have been handled, but it...

30. [Viking Range Reviews 10 - Trustpilot](https://www.trustpilot.com/review/www.vikingrange.com) - How many stars would you give Viking Range? Join the 10 people who've already contributed. Your expe...

31. [The American-Made Appliance Brand That Isn't What It Used To Be ...](https://www.tastingtable.com/1899935/viking-appliance-brand-negative-reviews-reddit/) - Sometimes it's not safe to purchase from a well-respected brand like Viking Range. This all-American...

32. [159 Viking Range Reviews | vikingrange.com @ PissedConsumer](https://viking-range.pissedconsumer.com/review.html) - Recurring Viking Range customer complaints cite poor customer service and slow or missing responses ...

33. [Viking Range, LLC | BBB Complaints | Better Business Bureau](https://www.bbb.org/us/ms/greenwood/profile/appliances/viking-range-llc-0523-5001277/complaints?page=2) - My Viking refrigerator (model VCSB5483SS) is under factory warranty and has experienced repeated, un...

34. [How to troubleshoot Viking ice maker that just died? - Reddit](https://www.reddit.com/r/appliancerepair/comments/11y8vkq/how_to_troubleshoot_viking_ice_maker_that_just/) - The only glitch is sometimes you need to switch the wire bale from your old ice maker onto the new i...

35. [005319-000 Viking Refrigerator Power Control Board Repair](https://circuitboardmedics.com/005319-000-viking-refrigerator-power-control-board-repair/) - We can professionally repair your Viking refrigerator power control board, 005319-000, with a 1 busi...

36. [VIKING Refrigerator Circuit Board Repairs - UpFix](https://www.upfix.com/product-category/appliances/refrigerator/?make=VIKING&PAGEN_1=2) - sale! 005319000 GE Refrigerator Control Board Repair. $139.99 $249.99. Save: 44 ...

37. [Viking Refrigerator Error Codes](https://www.youtube.com/watch?v=wZPhhGC7NP0) - I need your assistance with Viking refrigerator error codes.

If the fridge, especially wine fridges...

38. [DFBB536](https://www.guaranteedparts.com/picture_library/Viking-residential/VIKING%20DFBB536.pdf)

39. [Viking 057731-000 - ICEMAKER - Appliance Parts Group](https://www.appliancepartsgroup.com/products/viking-057731-000-icemaker.html) - Buy a Genuine OEM Viking 057731-000. Buying the original manufacturer replacement part ensures durab...

40. [057731-000 Viking Icemaker](https://encompass.com/item/11632942/Viking/057731-000/) - 057731-000 Viking Icemaker from Encompass parts & accessories

41. [057731-000 ICEMAKER - Viking Parts by Viking](https://www.allvikingparts.com/057731_000_ICEMAKER_p/057731-000.htm) - 057731-000 ICEMAKER -- SUB FROM G50911851. ****THIS ITEM IS NO LONGER AN ASSEMBLY **** 082824-000 Ic...

42. [Ice Maker on my Viking Refrigerator Stopped Working and Started ...](https://www.reddit.com/r/fixit/comments/sood42/ice_maker_on_my_viking_refrigerator_stopped/) - If your evaporator coils iced up, the temperature may have risen enough to disable the ice maker. If...

43. [Question about the icemaker arm in my mom's Viking fridge model ...](https://www.reddit.com/r/appliancerepair/comments/ffo7y4/question_about_the_icemaker_arm_in_my_moms_viking/) - The icemaker's arm just flops around and doesn't seem to fit snugly into anything on the icemaker it...

44. [Most and Least Reliable Refrigerator Brands of 2026](https://www.consumerreports.org/appliances/refrigerators/most-and-least-reliable-refrigerator-brands-a8271265835/) - CR can help you find the most reliable refrigerator brands and the best combination of storage capac...

45. [Help - Viking Parts by Viking](https://www.allvikingparts.com/help.asp) - Need a part for a Viking Range, Stove, Oven, Grill, Refrigerator or Dishwasher? We stock thousands o...

46. [Encompass Parts: Replacement OEM Parts and Accessories](https://encompass.com) - We Provide Parts from Over 350 Manufacturers. Millions of parts available for fast shipping from all...

47. [Viking Appliance Replacement Parts and Accessories](https://encompass.com/brands/VIK/Viking/3) - Encompass is a market leading supplier of replacement parts and accessories for a diverse range of p...

48. [068640-000 Vikingcompressor Replacement Kit](https://midwestapplianceparts.com/collections/viking/products/068640-000-viking-068640-000-compressor-replacement-kit) - Authentic OEM part 068640-000 by Viking. We provide affordable shipping & factory warranty on everyt...

49. [Viking Refrigerator Compressors and Sealed Systems - iFixit](https://www.ifixit.com/Parts/Viking_Refrigerator/Compressors_and_Sealed_Systems) - Genuine replacement compressor for Viking refrigerators, includes overload, relay, and dryer compone...

50. [Viking 068640-000 Compressor Replacement Kit](https://andersonapplianceparts.com/shop/viking-068640-000-compressor-replacement-kit/) - 068640-000 Compressor Replacement Kit If you need help determining if this is the correct Viking Par...

51. [Viking Compressor Assembly s](https://www.allvikingparts.com/Compressor_Assembly_s_s/1333.htm?searching=Y&sort=4&cat=1333&show=120&page=1) - 062775-000 COMPRESSOR KIT · List Price: $1,017.79. Our Price: $848.16 ; 068640-000 COMPRESSOR REPLAC...

52. [Why Compressor Repairs Cost So Much – Fridge Repair Guide](https://centralminnesotaappliancerepair.com/fridge-compressor-replacement/) - The average cost to repair the refrigerator compressor is 400$ to 1200$ typically in Minneapolis Mn....

53. [A New Era At Viking](https://www.vikingrange.com/consumer/product/viking-dealer-blog/as-seen-in/a-new-era-at-viking) - Kitchen appliance veteran Kevin Brown named President of Viking Range.

54. [Will Viking Range Repair Void Your Warranty?](https://kimballapplianceservice.com/will-viking-range-repair-void-your-warranty/) - Will your Viking Range repair void the manufacturer’s warranty?

55. [Why Your Refrigerator Will Fail in 5 Years (The Sealed System Scam)](https://www.youtube.com/watch?v=PoDiaOyhs_w) - ... Refrigerator performance and lifespan can vary by model, usage, and maintenance. For accurate as...

56. [MMA > About Us > Board of Directors > Kevin Brown](https://mma-web.org/About-Us/Board-of-Directors/Kevin-Brown) - For more than 70 years, the Mississippi Manufacturers Association has been the clear and united voic...

57. [Made in Mississippi: Viking Range - YouTube](https://www.youtube.com/watch?v=Ta6aaeHj7p4) - Viking Range was started in 1987 by Fred Carl, Jr. The Greenwood-based company is a commercial manuf...

58. [[PDF] Viking Installation Guide - AJ Madison](https://assets.ajmadison.com/ajmadison/itemdocs/m840015_f20399.pdf) - Greenwood, Mississippi 38930 USA. (662) 455-1200. For product information call 1-888-VIKING1 (845-46...

59. [Viking Range Corporation - Company-Histories.com](https://www.company-histories.com/Viking-Range-Corporation-Company-History.html) - ... Viking Range was assembled in Greenwood in a 35,000-square-foot facility. By 1990 all production...

60. [Kirkland Advises 26North on Acquisition of Controlling Interest in ...](https://www.kirkland.com/news/press-release/2025/12/kirkland-advises-26north-on-acquisition-of-controlling-interest-in-residential-kitchen) - 05 December 2025. Kirkland & Ellis advised 26North Partners on an agreement to purchase a controllin...

61. [26North Partners Acquires Controlling Stake in Middleby's Kitchen ...](https://www.indexbox.io/blog/26north-partners-acquires-controlling-stake-in-middlebys-kitchen-division/) - 26North is set to own 51% of the unit that houses a number of luxury cookware-equipment brands, incl...

62. [The Taxpayers Channel, Inc. - News Flash](https://www.thetaxpayerschannel.org/news.php?news_id=73)

63. [Ranking the Best Built-In Refrigerators for 2026](https://www.youtube.com/watch?v=i8w9QuDLutk) - Download our FREE Counter-Depth Refrigerator Buying Guide: https://blog.yaleappliance.com/free-count...

64. [7 Best Built-In Refrigerators of 2026, Lab-Tested By Our Experts](https://www.consumerreports.org/appliances/refrigerators/best-built-in-refrigerators-of-the-year-a2639616687/) - The best built-in refrigerators from CR's extensive lab tests include models from Bosch, Sub-Zero, a...

65. [8 Best Built-in Refrigerators of 2025 - Good Housekeeping](https://www.goodhousekeeping.com/appliances/refrigerator-reviews/g37180186/best-built-in-refrigerators/) - For a seamless look and customizable options, consider a built-in fridge from brands like Miele, Dac...

66. [Viking Refrigerator Control Board 005319-000 Repair](https://www.therepairshack.com/viking-refrigerator-control-board-005319-000-repair.html) - We will correct all major failures, it's fast and easy to use, and we include a 2 year warranty that...

67. [Viking Promotes Kevin Brown To President - Twice](https://www.twice.com/industry/viking-promotes-kevin-brown-president-62049) - Viking Range has promoted operations and engineering VP Kevin Brown to president. In his new role, t...

68. [Comparing Sub-Zero vs Other Premium Built-In Refrigeration Brands](https://www.bekins.us/blog/comparing-sub-zero-vs-other-premium-refrigerator-brands) - Viking offers powerful performance and bold design, but many users find Sub-Zero leads in food prese...

69. [Best Integrated Refrigerators of 2025: Top Brands and Features](https://blog.yaleappliance.com/best-integrated-refrigerators) - The best integrated refrigerators are Sub-Zero, Thermador, Miele, Signature Kitchen Suite, and Fishe...

70. [Top 5 Built-In Pro Refrigerators for 2025 You Need to See! - YouTube](https://www.youtube.com/watch?v=x5XofBRgVFg) - Looking for a 42-inch built-in professional refrigerator in 2025? This video reviews ... True Known ...

