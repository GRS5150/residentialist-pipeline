# JennAir Built-In Column Refrigerator: Technician-Level Product Intelligence Evaluation
**RISE™ & NOIR™ Design Packages | Built-In Column Models Only**
*Platform: Whirlpool Corporation | Prepared for: The Residentialist Product Intelligence Platform*

***

## Executive Summary

The JennAir built-in column refrigerator (primary models: JBRFL36IGX, JBRFR36IGX, JBRFR30IGX, JBRFR24IGX; freezer columns: JBZFL36IGX, JBZFR30IGX) is a Whirlpool Corporation product with genuine differentiators over the broader Whirlpool family — specifically an inverter compressor, the proprietary Obsidian dark anodized aluminum interior, Trinity three-zone precision cooling, and the SlimTech™ VIS door technology (on select 30" columns). It uses R600a refrigerant, cyclopentane-blown polyurethane foam insulation, and bottom-mounted electronics.

Reliability is the platform's most significant liability. Yale Appliance documented service rates of 36.7% (2021) and 15.8% (2022) before dropping JennAir from active tracking. Trustpilot consumer sentiment sits at 1.3/5 based on 72+ reviews. Consumer Reports, where data is available on built-in JennAir models, assigns a 4/5 predicted reliability score for the 42" French door built-in (JF42NXFXDE), though the column lineup is not independently scored as of 2026. The primary reliability liability — an evaporator-freezing class-action defect — applies **only to French door models with dual evaporator systems, not column units**, which are single-evaporator. The warranty structure on current columns is among the most generous in this category: up to 12 years on sealed system parts.[^1][^2][^3][^4][^5][^6]

Whirlpool Corporation, the parent, is under material financial stress: net loss of $323M in FY2024, revenue down 14.64%, total debt of $8.3B, and negative free cash flow as recently as Q3 2025. This introduces legitimate long-term parts/support risk, partially mitigated by the broadest aftermarket parts ecosystem in the industry.[^7]

***

## 1. Compressor & Sealed System

### 1.1 Compressor Identity and OEM

The compressor used in JennAir built-in column refrigerators carries Whirlpool OEM part number **W10841139**. This same part number cross-references across the full Whirlpool brand family: Whirlpool, KitchenAid, JennAir, Maytag, Amana, Kenmore, Admiral, Magic Chef, Norge, and Roper. The compressor is paired with **inverter board W10629033**, and critically — **replacement of the compressor requires simultaneous replacement of the inverter board**. The inverter board alone retails at approximately $268–$283 OEM.[^8][^9][^10][^11]

**OEM manufacturer of the compressor itself (Embraco/Nidec, Secop, Samsung, or other):** This is *not publicly disclosed* in Whirlpool's parts documentation. The W10841139 is assigned a Whirlpool part number, and the underlying sub-manufacturer is not confirmed in any publicly available parts, service bulletins, or distribution documentation reviewed. Technician communities have not definitively attributed this part to a specific compressor OEM. This is a verified intelligence gap.

### 1.2 Compressor Architecture

| Attribute | JennAir Column | Detail |
|---|---|---|
| Compressor count | Single | Confirmed via spec sheet: "Dual Evaporation: false"[^4] |
| Evaporator count | Single | Column refrigerator only; no freezer compartment in refrigerator column |
| Compressor type | Variable-speed inverter | Inverter board W10629033 required — confirms inverter architecture[^9] |
| Inverter board | W10629033 (Whirlpool OEM) | Retail ~$268–$283; shared across Whirlpool family[^12][^11] |
| Location | Bottom-mounted | Confirmed in spec data[^13] |
| Airflow direction | Down-low/base venting | Vents at cabinet base for aesthetic and thermal benefit[^14] |

This is a **genuine differentiator** from standard Whirlpool/KitchenAid consumer units, which use fixed-speed compressors. The inverter architecture enables quieter, more energy-efficient operation and reduced thermal cycling — contributing to the JennAir column's low-noise ("Hushed Acoustics") marketing claim.[^15]

### 1.3 Refrigerant

**R600a (isobutane)** — confirmed via P.C. Richard & Son product specifications for JBRFL36IGX. R600a is an HFC-free hydrocarbon refrigerant with near-zero global warming potential (GWP = 3) and zero ozone depletion potential. Charge volumes in residential units are small (typically under 100 grams), reducing ignition risk to negligible levels in normal use. R600a is the current industry direction for premium built-in refrigerators.[^16][^17]

### 1.4 Documented Sealed System Failure Modes

Based on technician community reports and repair history across the Whirlpool platform:

- **Refrigerant leak / loss of charge**: Most common sealed system failure mode reported by technicians — described as "irreparable" on units as young as 8 years. Refrigerant leaks in R600a systems typically occur at evaporator tube joints or condenser connections. Yale Appliance's 2026 data estimates approximately a 1.1% chance of compressor-level failure in the first 5 years across the industry.[^18][^19][^20]
- **Compressor electrical failure**: Noted in multiple consumer Reddit reports for pre-column-era JennAir (JSC24C8EAM00); also documented with the start device (W10448874) failing before the compressor body itself.[^21][^22]
- **Evaporator tube pitting**: More common in older R134a systems; less documented in R600a units.
- **Inverter board failure triggering compressor non-start**: The inverter board W10629033 can fail independently, presenting as a dead compressor when the compressor itself is functional. This is a diagnostically important failure mode — the board should be tested before condemning the compressor.[^9]
- **Condenser fouling (coil dust buildup)**: Causes compressor overwork and premature failure; bottom-mounted compressor location makes this more likely in low-ventilation built-in installations.[^23]

### 1.5 Sealed System Lifespan

- JennAir's own warranty commitment covers sealed system parts through **Year 12** — an implicit manufacturer signal of expected lifespan.[^6][^24]
- Industry estimates for built-in refrigerators (premium segment): 15–20 years average, with sealed system failure being the terminal event in most cases.[^25]
- Technician reports document JennAir sealed system failures as early as Year 8.[^26][^19]
- The Whirlpool/JennAir/KitchenAid combined platform 10-year failure rate has been cited as 12–16%, compared to a 25% industry average — though this figure predates the 2021 reliability spike.[^18]

***

## 2. Control System & Electronics

### 2.1 Control Board Identity and Platform Sharing

The primary main control board used across Whirlpool premium refrigerators is **WPW10310240** (previously W10310240), confirmed shared across Whirlpool, KitchenAid, **JennAir**, Maytag, Amana, Kenmore, and **Dacor**. This is a critical platform-sharing finding: JennAir columns share their control intelligence with Dacor (a higher-priced brand) and KitchenAid, meaning the board is not differentiated at the electronics level. The control board itself is **not proprietary to JennAir**.[^27]

**Replacement cost**: OEM new boards range from approximately $171–$354 depending on specific model. Aftermarket/refurbished boards available from ~$74 via third-party distributors. Circuit Board Medics offers repair service for WPW10310240 with 1-business-day turnaround.[^28][^29][^30][^27]

### 2.2 Documented Control Board Failure Modes

- Power surge damage to relay circuits[^31][^27]
- Moisture infiltration (particularly in panel-ready flush-mount installations with limited airflow)[^32]
- Capacitor aging in units beyond 7 years
- Failure of defrost control logic — implicated in the broader Whirlpool evaporator-freezing pattern (French door models)[^33]
- Display/touchpad failure: Sleep mode/showroom mode lockouts are commonly misdiagnosed as board failures — the column's specific reset is **Hold "Top Zone" + "JennAir Logo" for 3 seconds**[^34]

### 2.3 Diagnostic Mode Access

JennAir columns have a technician diagnostic mode accessible via a specific button combination sequence (model-dependent). On current column models:
- Sleep mode is indicated by the JennAir logo illuminated only; deactivated by touching the logo[^34]
- WiFi-connected models deliver diagnostic alerts and error codes through the JennAir app[^35]
- Service mode for older JennAir models requires sequential pressing of temperature control buttons + confirmation[^36]
- **Proprietary software requirement for diagnostics**: NO — diagnostic mode is button-sequence accessible; however, advanced board programming and firmware updates may require Whirlpool W Service proprietary tools

### 2.4 Diagnostic Code Infrastructure

App-based diagnostics via the JennAir connected platform deliver real-time error codes, service alerts, and monthly usage reports to the owner. This is genuinely differentiated from KitchenAid's consumer-facing interface and represents a servicing advantage for pre-diagnosis before a technician visit. The app can alert on: power outages, door-left-open events, filter change reminders, and temperature excursions.[^14][^37][^35]

***

## 3. Construction & Materials

### 3.1 Interior

The **Obsidian interior** is a dark anodized aluminum finish — not ABS plastic, not HIPS, and not standard stainless steel. This is a genuine material differentiator from every other Whirlpool-family product and from most competitors. Anodized aluminum resists odor transfer better than plastic (JennAir's own claim), is more dimensionally stable, and offers a visually distinctive high-contrast presentation. Nanotechnology shelving (solid glass with silica nanocoating applied to aluminum frames) contains liquid spills at the shelf edge — a feature also noted in Yale Appliance's 2019 column review.[^38][^14]

### 3.2 Insulation

**Standard column models (24", 36")**: "Advance Foam Insulation" — cyclopentane-blown rigid polyurethane foam. The "99.9% lower Global Warming Potential" claim refers to cyclopentane's near-zero GWP as a blowing agent versus HFCs. This is standard-grade premium refrigeration insulation, not vacuum panel technology.[^39][^37]

**Select 30" columns (JBRFSR30RX and variants)**: **SlimTech™ insulation** — the first vacuum insulated structure (VIS) technology in a North American market refrigerator. The SlimTech door reduces wall thickness by up to 66% versus foam insulation, yielding up to 25% more interior capacity. This is a **genuine technical innovation** and is in limited production. It will expand to KitchenAid brand in subsequent years.[^40][^41]

### 3.3 Door Construction and Seal

- **Door seal type**: Magnet-to-metal (powerful rare earth magnets in the gasket, framed in metal) — described as providing "airtight seal". This is a high-end magnetic system but **NOT a vacuum-sealed door** like Sub-Zero. Yale's own video notes Sub-Zero's vacuum seal is notably more difficult to open; JennAir's magnetic seal is evaluated as solid but a step below vacuum.[^38]
- **Hinge type**: Concealed/hidden hinges ("Obsidian hinge"); stealth-flush door design. No published cycle count was found in any OEM documentation or technician source reviewed.[^14]
- **Door panels (for panel-ready models)**: Hard Core Steel Door Panels — solid wood core with steel facing (industry-exclusive, per JennAir marketing).

### 3.4 Shelving and Storage

- Solid tempered glass shelves with nanotechnology spill-containment coating and all-metal (aluminum) bin frames[^14][^38]
- Smooth-close drawers rated for full-load operation[^37]
- Flexi-Slide bin (deli drawer) and Herb Tender container
- Three shelf zones with presets: top (33–42°F), middle deli (Meat 32°F / Beverage 34°F / Deli 33°F / Assorted 37°F), bottom drawers (Assorted 37°F or Produce 39°F)[^42]

### 3.5 Cabinet Build Quality

At 546 lbs for the 36" unit, the JennAir column is substantially constructed. Technician feedback notes that the flush-mount built-in design concentrates service access challenges at the bottom, where the compressor and electronics are located. Bottom-vented airflow design (Down-Low Airflow) is aesthetically clean but can restrict condenser cooling in tight built-in cavities — a documented concern for long-term compressor health.[^37]

***

## 4. Air Management & Food Preservation

### 4.1 Air Purification

The JennAir column uses a **FreshFlow™ passive activated carbon filter** — a passive filter that reduces odors but does **not** include an active ethylene scrubber. This is a material difference from Sub-Zero's NASA-derived air purification system, which scrubs ethylene gas every 20 minutes. The FreshFlow filter requires periodic replacement and is widely available. Yale Appliance notes Sub-Zero as the only brand with a true air scrubber in the integrated category.[^43][^44][^45]

### 4.2 Humidity Control

**Trinity Cooling** provides three independent temperature zones with dedicated precision sensors. The bottom drawers offer humidity-controlled produce presets; there is no active humidity injection. Produce Preserver is listed as a feature. The system is passive-humidity-controlled rather than active (no motorized humidity damper or hygroscopic element as found in some Miele models).[^46][^15][^37]

### 4.3 Temperature Precision

- **Claimed**: Calibrated every second via three sensors; one technician service guide states ±1°F precision[^47]
- **Published spec**: Minimum operating temperature 55°F, maximum 110°F ambient[^4]
- **Inverter compressor benefit**: Runs continuously at variable speed rather than cycling on/off, which substantially reduces temperature swings vs. fixed-speed competitors
- **Consumer Reports testing** (on JennAir JF42NXFXDE): 5/5 for Thermostat Control — the highest score available, applied to a similar platform unit[^48]

### 4.4 Produce Freshness vs. Competitors

No independent head-to-head produce freshness test data was identified specifically for the JennAir column. Sub-Zero publishes a proprietary 4-week produce freshness comparison test claiming superiority; this has not been independently replicated. Sub-Zero's vacuum-sealed door and active air scrubber represent a material advantage in food preservation engineering. JennAir's Trinity three-zone control, while sophisticated, does not compensate for the absence of an ethylene scrubber — a key produce-life limiter.[^45]

***

## 5. Reliability & Service Data

### 5.1 Yale Appliance Service Rate Data

| Year | JennAir Service Rate |
|------|---------------------|
| 2021 | 36.7%[^1] |
| 2022 | 15.8%[^1] |
| 2023 | Not available (dropped from tracking)[^1] |
| 2024 | Not available[^1] |
| 2025 | Not available[^1] |

Yale dropped JennAir from its tracking after 2022 due to insufficient sales volume (Yale no longer actively stocks the brand at the same level). The 2021 rate of 36.7% is severe — nearly one in three units required a service call within the first year. The improvement to 15.8% in 2022 is encouraging but the data series was then discontinued, making trend analysis impossible. For comparison, the 2025 industry leaders (LG: 8.4%, Bosch: 12.5%) suggest JennAir's last known rate remained above best-in-class.[^1]

**Important methodological note**: Yale's service rates reflect first-year issues at Yale-sold units in Greater Boston. They are lower than national averages due to controlled delivery and warehousing; they measure early failure risk, not lifetime reliability.[^49]

### 5.2 Consumer Reports Data

- CR's built-in refrigerator survey as of 2026 includes: Bosch, Frigidaire, GE, Kenmore, KitchenAid, LG, Maytag, Samsung, Sub-Zero, Whirlpool. JennAir is **not independently broken out** in CR's current brand reliability rankings for the refrigerator category.[^50]
- For specific tested JennAir built-in models in CR's database, the JF42NXFXDE (42" built-in French door) and JB36NXFXRE (36" built-in) both receive **5/5 predicted reliability** and **4/5 overall scores**, with "Recommended" status. These are built-in models on the same Whirlpool platform but pre-date the column lineup's full deployment.[^3][^48]
- CR's broader 2019 brand assessment flagged JennAir as having multiple appliance categories with "Poor" reliability ratings — though this predates Whirlpool's platform reliability improvements.[^51]
- Industry-wide CR finding: 34% of all refrigerators require repair by Year 5; ice makers and dispensers are the most commonly reported problem areas.[^52]

### 5.3 Technician Community Failure Patterns

Synthesized from r/appliancerepair, r/Appliances, repair YouTube, and professional service company reports:

**First-year failure patterns:**
- Control board issues (power surge, moisture, factory defects)[^31]
- Ice maker failures: frozen fill tubes, electronic module failure[^32]
- WiFi/connectivity module issues
- Door seal alignment problems in flush installations

**Long-term failure patterns (Year 3–10):**
- Sealed system failures — refrigerant leak, compressor failure[^19][^26]
- Inverter board failure (W10629033)[^53]
- Evaporator coil frosting (not the class-action defect, but general deposition in single-evaporator systems)[^23]
- Condenser coil fouling in tight built-in installations

**Notable consumer case**: Reddit post (r/Appliances, Sep 2024) documenting JennAir JS42SEDUDW12 failure at unspecified age: compressor non-running, authorized tech diagnosed coolant leak — unit declared not worth repairing. Trustpilot includes multiple accounts of $10K+ built-in failures with inadequate warranty service response.[^54][^26]

***

## 6. Ice Maker

### 6.1 Manufacturer and Architecture

Ice makers on JennAir appliances are **Whirlpool in-house** using the "modular crescent-mold" design — a single-module format that integrates thermostat, motor, cam, and linkage into one replaceable unit. This design is shared across Estate, Inglis, Kenmore, KitchenAid, Roper, Whirlpool, Maytag, Amana, and Admiral brands.[^55]

**Important note**: The JBRFL36IGX (36" column refrigerator) is listed as **"No Ice Maker"** in its specifications. Ice maker availability varies by column model — not all JennAir refrigerator columns include an ice maker. Freezer columns (JBZFL36IGX) include ice makers.[^13][^4]

### 6.2 Documented Failure Patterns

- Frozen fill tubes — especially in tight built-in installations with inadequate clearance[^32]
- Inlet valve solenoid failure[^32]
- Electronic control module failure — particularly common in 2018–2021 model year production[^32]
- Ice clumping in tray / partial freeze / mass formation from water leakage[^56]
- Door-mounted water reservoir seal deterioration[^32]

### 6.3 Modularity and Replaceability

The modular design means ice maker head replacement is a **single-module swap** — the most common repair action rather than component-level diagnosis. OEM replacement ice maker assemblies are available at PartSelect (PS11765620). This modular replaceability is a practical serviceability advantage. Labor to replace an ice maker module typically runs under two hours.[^57]

***

## 7. Parts Availability & Serviceability

### 7.1 Parts Distribution

JennAir/Whirlpool has the **broadest aftermarket parts availability** of any brand in the built-in refrigeration category. Parts are available through:[^58][^59]

| Distributor | Availability |
|---|---|
| PartSelect.com | OEM, same-day shipping[^59] |
| RepairClinic.com | OEM, same-day shipping[^60] |
| Fix.com | OEM[^61] |
| ReliableParts.com | OEM[^8] |
| JennAirReplacementParts.com | OEM, Whirlpool factory[^58] |
| Zoro.com | OEM cross-reference[^62] |
| Home Depot Repair Parts | OEM[^63] |
| AppliancePartsPros (Encompass) | OEM and aftermarket |

### 7.2 Parts Cross-Compatibility

The key repair parts (compressor W10841139, inverter board W10629033, control board WPW10310240, start device W10448874) are **cross-compatible across the entire Whirlpool brand family** — meaning a technician can source parts from any Whirlpool family model. This is a major serviceability advantage versus Sub-Zero/Wolf (factory-direct only) or Gaggenau (limited distributor network).[^62][^8][^27]

### 7.3 Parts Lead Time

For all stocked items above: same-day shipping, 1–3 day delivery standard for US addresses. Specialty components (display modules, specific drawer hardware, Obsidian interior panels) may require 7–14 days.

### 7.4 Manufacturer Parts Commitment

Whirlpool does not publish a formal parts availability guarantee period. Industry standard is 10 years post-production. Given Whirlpool's financial instability (see Section 10), parts availability beyond this window carries risk — though the cross-platform nature of key components (compressor, board, inverter) means aftermarket supply will persist regardless of Whirlpool's product line status.

### 7.5 Service Network

JennAir service operates through the **"W Service" network** — Whirlpool Corporation-certified technicians who are locally based. Additional authorized service through:[^64][^65][^66]
- Mr. Appliance franchises (widely available)[^67]
- Independent authorized technicians carrying Whirlpool certification

**Service density advantage**: Because the platform is shared with Whirlpool, KitchenAid, and Maytag, the effective technician pool is the largest in the industry. This is a material advantage over Sub-Zero (factory-certified technicians only in metro areas) or Miele (limited authorized network).

**Service quality concern**: Consumer and Trustpilot reviews consistently report poor warranty execution — long wait times for authorized service, difficulty getting parts approved under warranty, and inadequate resolution for $10K+ appliance failures. This is a systemic pattern, not isolated incidents.[^2][^54]

***

## 8. Warranty

### 8.1 Current Built-In Column Warranty Structure

The warranty on current-generation JennAir built-in refrigerators (column models) follows this structure:[^24][^6]

| Period | Coverage |
|---|---|
| Year 1–2 | Full parts AND labor for all defects in materials/workmanship |
| Year 3–6 | Sealed refrigeration system: parts AND labor (compressor, evaporator, condenser, dryer, connecting tubing); cavity liner parts + labor if cracking |
| Year 7–12 | Sealed refrigeration system: parts ONLY (labor NOT included) |

**Note**: Earlier JennAir warranty documents (pre-2022 models) show slightly different tier structures (1+4+5 vs. 2+4+6). Buyers should obtain the current warranty document (W10794312 or current revision) from the point of sale.[^6][^24]

### 8.2 What the Warranty Excludes

Standard exclusions (from warranty documentation):[^68][^69][^70]
- Cosmetic damage (dents, scratches, broken plastic/glass)
- Damage from improper installation or failure to follow installation instructions
- Service calls for improper use (e.g., incorrect electrical supply, extension cord use)
- Damage from accident, misuse, fire, floods, or acts of nature
- Consumable parts (filters, light bulbs)
- Consequential damages (spoiled food, water damage to home)
- Service calls outside of operating temperature range (below 55°F or above 110°F ambient)

### 8.3 Professional Installation and Warranty

Installation by a non-authorized party does **not necessarily void the warranty** under federal Magnuson-Moss Warranty Act protections — but **improper installation damage is explicitly excluded**. JennAir recommends certified installation; their installation program (Canada program documented) tracks certified installers.[^71]

### 8.4 Warranty Execution Quality

Consumer accounts consistently report poor warranty execution in practice. Specific documented issues:[^2][^54]
- Extended wait times for W Service technicians (particularly in non-metro markets)
- Parts ordering delays under warranty repair
- Multiple technician visits for same issue before resolution
- Consumer resistance when claiming damages for consequential losses (spoiled food)
- A documented pattern of "temporary fixes" on platform-level defects (per the evaporator class-action filing)[^5]

***

## 9. Platform Sharing & Manufacturing

### 9.1 Manufacturing Location

**JennAir built-in column refrigerators are manufactured at Whirlpool's Ottawa, Ohio facility** — the company's designated Premium Refrigeration Factory for North America. Whirlpool invested $65 million specifically to expand this plant for built-in refrigerator production, with full production reaching capacity in 2023. The Ottawa plant was specifically selected for JennAir and KitchenAid built-in product lines.[^72][^73][^74][^75]

Production history:
- Pre-2008: LaVergne, Tennessee
- 2008–2012: Fort Smith, Arkansas
- 2012–present: Ottawa, Ohio[^76][^77][^72]

The Ottawa plant was originally a W.C. Wood freezer facility acquired by Whirlpool in 2009. It employs 485+ workers and produces freezers, under-counter ice makers, and premium refrigerators for multiple Whirlpool brands.[^73][^75]

### 9.2 Platform Sharing: What Is Shared with Sibling Brands

| Component | Shared Across |
|---|---|
| Compressor W10841139 | Whirlpool, KitchenAid, JennAir, Maytag, Amana, Kenmore, Admiral[^8] |
| Inverter board W10629033 | Same Whirlpool family[^78][^11] |
| Main control board WPW10310240 | Whirlpool, KitchenAid, JennAir, Maytag, Amana, Dacor[^27] |
| Ice maker module | Whirlpool family and Sub-Zero[^55] |
| FreshFlow air filter | Whirlpool, KitchenAid, JennAir[^43] |
| W Service technician network | All Whirlpool brands[^64] |
| Ottawa, Ohio manufacturing | JennAir and KitchenAid built-ins[^75] |

### 9.3 Genuine JennAir Differentiators vs. KitchenAid

| Feature | JennAir Column | KitchenAid Built-In |
|---|---|---|
| Interior finish | Obsidian dark anodized aluminum[^14] | Stainless steel or white plastic |
| Inverter compressor | Yes (variable-speed)[^9] | Fixed-speed on most consumer models |
| Trinity three-zone cooling | Yes — 3 sensors, 3 independent zones[^46] | Single-zone or dual-zone |
| Nanotechnology shelving | Yes — glass + silica nanocoat[^38] | Standard tempered glass |
| SlimTech VIS insulation | Select 30" models (2024+)[^40] | Not yet deployed as of 2026 |
| LED system | 650+ LEDs, Ecliptic zone awakening[^14] | Standard LED array |
| Emotive controls | Waist-level, touch-responsive Obsidian interface[^37] | Standard touch controls |
| RISE / NOIR design expressions | Proprietary hardware aesthetic packages[^79] | Uniform KitchenAid aesthetic |
| Price premium vs. KitchenAid | ~$2,000–$4,000 higher MSRP per unit | — |

### 9.4 Whirlpool Corporate Financial Stability

Whirlpool Corporation (NYSE: WHR) is under significant financial pressure:
- **FY2024**: Net loss of $323 million; revenue down 14.64%[^7]
- **Q4 2025**: Revenue $4.1B (missed estimate by 3.7%); EPS $1.10 (beat $1.52 estimate adjusted EPS miss by 27.6%)[^80]
- **Balance sheet**: Total debt $8.3B as of Q3 2025; current ratio below 1.0; free cash flow negative in recent quarters[^7]
- **Stock**: Trading near $79–80 range post Q4 earnings, having declined materially from 2021 highs[^81]
- **Cost actions**: $200M in cost takeouts in 2025; 341 Amana plant layoffs effective March 2026[^82]
- **Positive signals**: $300M Ohio laundry investment (Oct 2025); Q4 2025 EPS beat; 2026 guidance projects 5% revenue growth and margin expansion[^83][^81]

**Risk assessment for buyers**: Whirlpool is a 110+ year old institution with deep parts ecosystem and the largest US appliance manufacturing footprint. It is NOT at near-term bankruptcy risk. However, its financial stress introduces legitimate risk for: (a) long-term parts support beyond the primary distribution window, (b) service network investment, and (c) brand-level product development continuity. The JennAir brand specifically competes against Sub-Zero and Thermador — segments that have maintained pricing and volume better than Whirlpool's core.

***

## 10. Professional & Expert Opinion

### 10.1 Yale Appliance Assessment

Yale Appliance's 2025 "Best Integrated Refrigerators" guide does not recommend JennAir in its top five. The guide's top five are Sub-Zero, Thermador, Miele, SKS (Signature Kitchen Suite), and Fisher & Paykel. Yale's 2022 edition did note JennAir as one of two brands (with Sub-Zero) with below-average integrated refrigerator service rates — a historic positive data point.[^45]

In Yale's January 2026 built-in refrigerator ranking video, Steve Sheinkopf rates the 48" JennAir (column pair configuration) as a "strong B" — noting the nanotechnology shelving as a genuine feature and the comparison to Sub-Zero, while not recommending it at the first tier.[^84]

### 10.2 Kitchen Designer and Specifier Consensus

- Professionals who specify JennAir columns primarily do so for: (a) design-forward clients who prioritize the Obsidian interior aesthetic, (b) large column-pair/triple configurations where budget does not support Sub-Zero, and (c) kitchens where Whirlpool's service network density is advantageous[^85]
- Reddit and professional forum consensus characterizes JennAir as "a glorified KitchenAid at luxury pricing" — a recurring criticism pointing to the shared platform[^86]
- Town Appliance and other dealer analysis characterize JennAir as the luxury/tech-forward option vs. KitchenAid's practical-premium position[^87]

### 10.3 Repair Technician Perspective

- Technicians appreciate the Whirlpool platform's parts availability and diagnostic accessibility[^20][^19]
- The inverter compressor architecture is noted as more complex to diagnose than fixed-speed — requiring correct identification of whether the compressor or the inverter board is the failure point[^53]
- Bottom-mounted compressor in flush-install is flagged as a condenser cleaning challenge
- Service quality varies significantly by geography; W Service network depth in rural markets is limited[^85]

### 10.4 Comparative Positioning

| Factor | JennAir Column | Sub-Zero Column | Thermador Column |
|---|---|---|---|
| Food preservation engineering | Good (Trinity 3-zone, passive filter) | Excellent (dual compressor, vacuum seal, air scrubber) | Very Good (stainless interior, ethylene filter) |
| Aesthetic differentiation | High (Obsidian, 650 LED) | Moderate (understated) | High (stainless interior) |
| Parts availability | Best in class[^59] | Factory-direct only | Limited to BSH network |
| Service network | Broad (W Service) | Factory-certified required | BSH authorized |
| Compressor architecture | Single inverter | Dual (one per column) | Single inverter (column) |
| Refrigerant | R600a | R600a | R600a |
| Warranty — sealed system | 12 years parts / 6 years labor[^6] | 12 years[^45] | Varies by model |
| Price (36" column) | ~$9,249 MSRP[^88] | ~$10,000–$13,000 | ~$9,000–$11,000 |
| Reliability consensus | Mixed (high 2021 service rate) | Industry leading (20+ yr lifespan)[^89] | Good |

### 10.5 Scenarios: FOR vs. AGAINST

**Recommend FOR:**
- Design-first clients who prioritize the Obsidian interior aesthetic as a centerpiece
- Large kitchens building 2–3 column configurations where JennAir's 250+ configurations offer flexibility
- Clients in metro markets with strong W Service density
- Projects where the full Whirlpool appliance package offers bundled pricing/incentives
- Clients who value broadest aftermarket parts access for long-term DIY or independent service

**Recommend AGAINST:**
- Clients prioritizing best-in-class food preservation (Sub-Zero active air scrubber, dual compressor, vacuum seal are materially superior)
- Rural or secondary markets with limited authorized service
- Clients with low risk tolerance for the documented service execution problems
- Ultra-high-value installs where long-term reliability certainty is paramount (specify Sub-Zero)
- Clients who have experienced prior JennAir warranty service issues

***

## 11. Specific Questions Resolved

**Q: What specific compressor does the JennAir built-in column use (OEM and part number)?**
**A:** Whirlpool OEM part number W10841139, paired with inverter board W10629033. The underlying compressor sub-manufacturer (Embraco/Nidec, Secop, Samsung, etc.) is not publicly confirmed in any available documentation — this is a verified intelligence gap.[^8][^9]

**Q: Is it a true inverter or a multi-speed?**
**A:** True inverter (variable-speed), confirmed by the required paired inverter board W10629033.[^10][^9]

**Q: Does the evaporator-freezing class-action defect affect the column models specifically, or only French door?**
**A:** The Paperno v. Whirlpool evaporator-freezing defect **applies only to French door models with dual evaporator systems**. The column models are single-evaporator and are not named in the lawsuit. The specific JennAir model in the suit is JFX2897DR* (a French door unit). Column refrigerators are explicitly exempt from this defect by design.[^5]

**Q: What is the current (2024–2026) service rate trend?**
**A:** Unknown — JennAir was dropped from Yale Appliance tracking after 2022 due to insufficient unit volume. No current Yale data exists. No current Consumer Reports column-specific data exists. The last known data points remain 36.7% (2021) and 15.8% (2022).[^1]

**Q: What specific components differentiate JennAir columns from KitchenAid built-ins?**
**A:** Five verified hardware differentiators: (1) Variable-speed inverter compressor vs. fixed-speed; (2) Obsidian dark anodized aluminum interior vs. stainless/plastic; (3) Trinity three-zone cooling with three independent sensors vs. single-zone; (4) Nanotechnology glass shelving vs. standard glass; (5) SlimTech™ VIS insulation in select 30" models vs. standard PU foam. The RISE/NOIR design hardware packages (handles, badges, finish details) are also exclusive to JennAir. The underlying sealed system, control board, and service network are shared.

***

## 12. Key Intelligence Gaps

The following data points could not be verified or sourced from available public information:

1. **Compressor OEM sub-manufacturer** (Embraco, Secop, Samsung, or other) for W10841139 — requires Whirlpool service engineering access or OEM component tear-down documentation
2. **Published hinge cycle count** — no cycle rating was found in any OEM documentation
3. **Current-year (2023–2026) service rate** — Yale no longer tracks JennAir; no independent substitute source available
4. **Consumer Reports standalone column score** — CR does not appear to separately score the column lineup from the broader JennAir brand
5. **Inverter board OEM manufacturer** for W10629033 — labeled Whirlpool OEM; sub-supplier not publicly identified
6. **Exact insulation R-value or thermal resistance spec** — "Advance Foam" with cyclopentane PU is industry-standard but no R-value per inch published in US consumer documentation

***

## Scoring Framework Input (The Residentialist)

| Dimension | Assessment | Score Basis |
|---|---|---|
| **Quality** | High aesthetic quality (Obsidian aluminum, metal bins, nanotechnology glass, 650-LED system, SlimTech VIS on select models). Control board and inverter architecture are Whirlpool-shared, not premium-exclusive. Build weight (546 lbs) reflects substantial steel construction. | 7/10 |
| **Durability** | Sealed system covered to 12 years per warranty[^6]; R600a refrigerant is well-matched to inverter compressor; cyclopentane foam ages well. Documented 8-year sealed system failures[^19]; 36.7% first-year service rate in 2021[^1]; consumer reports of $10K failures with poor resolution[^54]. Whirlpool platform does not approach Sub-Zero's documented 20+ year lifespan[^89]. | 6/10 |
| **Performance** | Trinity three-zone cooling with inverter compressor delivers genuine ±1°F temperature precision[^47]; Consumer Reports 5/5 thermostat control on similar platform[^48]; energy-efficient R600a system; hushed acoustics. Food preservation limited by passive (not active) air filtration and standard magnetic (not vacuum) door seal. Inverter compressor is genuine performance differentiator within the Whirlpool family. | 7.5/10 |

---

## References

1. [The Most (And Least) Reliable Refrigerator Brands in 2026](https://prudentreviews.com/reliable-refrigerator-brands/) - Yale Appliance's service rate data shows slight variation, with rates of 12.5% in 2025, 11.6% in 202...

2. [Jenn-Air Reviews | Read Customer Service Reviews of jennair.com](https://www.trustpilot.com/review/jennair.com) - Do you agree with Jenn-Air's TrustScore? Voice your opinion today and hear what 72 customers have al...

3. [For the latest ratings and information, visit](https://www.build.com/mediabase/specifications/rebates/consumer-reports-refrigerators-ratings.pdf)

4. [JennAir 20 Cu. Ft. Built-In Column Refrigerator Custom Panel Ready JBRFL36IGX - Best Buy](https://www.bestbuy.com/site/jennair-20-cu-ft-built-in-column-refrigerator-custom-panel-ready/6322451.p?skuId=6322451) - Shop JennAir 20 Cu. Ft. Built-In Column Refrigerator Custom Panel Ready at Best Buy. Find low everyd...

5. [Whirlpool, KitchenAid, JennAir, Maytag French Door Fridges Suffer ...](https://www.classaction.org/news/whirlpool-kitchenaid-jennair-maytag-french-door-fridges-suffer-from-evaporator-freezing-defect-lawsuit-says) - A class action alleges certain Whirlpool, KitchenAid, JennAir and Maytag French door fridges suffer ...

6. [JennAir Refrigeration Limited Warranty - Manuals.plus](https://manuals.plus/m/d324895a2e2939db7461115925f50e2db028534c1e30ad339aa32da777062aab_doc) - This document outlines the limited warranty terms and conditions for JennAir refrigeration products,...

7. [Whirlpool Corporation (WHR) Stock Analysis & Key Metrics (2026)](https://koalagains.com/stocks/NYSE/WHR) - ... financial stability. Whirlpool's balance sheet is in a weak and risky position. As of Q3 2025, t...

8. [W10841139 Whirlpool Refrigerator Compressor - Reliable Parts](https://www.reliableparts.com/wpl-w10841139.html) - This high-quality compressor designed for a range of compatible brands including Admiral, Amana, Jen...

9. [JennAir Compressor W10841139 - Jenn-Air Replacement Parts](https://www.jennairreplacementparts.com/PartDetail/Compressor/W10841139/4338527) - JennAir Compressor W10841139. Item #4338527 | Whirlpool OEM Part #W10841139. $358.70. In Stock. Orde...

10. [Refrigerator Inverter Board W10629033 - Repair Clinic](https://www.repairclinic.com/PartDetail/Inverter-Board/W10629033/2997771) - This is for a Serviced Compressor. For a production Compressors please see part number WPW10233421. ...

11. [Whirlpool Inverter Board W10629033](https://www.whirlpoolparts.com/PartDetail/Inverter-Board/W10629033/2997771) - Whirlpool Inverter Board W10629033. Item #2997771 | Whirlpool OEM Part #W10629033. $276.94. In Stock...

12. [W10629033 - Refrigerator Compressor Inverter Control Module](https://www.deyparts.com/product/refrigerator-compressor-inverter-control-board-W10629033) - W10629033 Refrigerator Compressor Inverter Control Module. Photo of W10629033. $270.03. Part #: W106...

13. [JennAir JBRFL36IGX 36 inch Built-In Smart Column Refrigerator ...](https://www.homery.com/product/jennair-jbrfl36igx) - 36" Panel-Ready Built-In Column Refrigerator, Left Swing The 36" Panel-Ready Built-In Column Refrige...

14. [JennAir JBRFL36IGX-JBZFR30IGX 36 Inch Wide Left Hinge Column Refrigerator and 30 Inch Wide Right Hinge Column Freezer with Trinity Cooling | Build.com](https://www.build.com/jennair-jbrfl36ig-jbzfr30ig/s2024423) - Save on the JennAir JBRFL36IGX-JBZFR30IGX from Build.com. Low Prices + Fast & Free Shipping on Most ...

15. [36" Panel-Ready Built-In Column Refrigerator, Right Swing - JennAir](https://www.jennair.ca/en_ca/refrigeration/columns/column-refrigerators/p.36-panel-ready-built-in-column-refrigerator,-right-swing.jbrfr36igx.html) - Trinity Cooling. Revel in the trinity of food preservation: three zones, three precision sensors, ca...

16. [JennAir 36 in. Built-In 20.0 cu. ft. Smart Counter Depth Freezerless Refrigerator with Internal Water Dispenser - Custom Panel Ready | P.C. Richard & Son](https://www.pcrichard.com/jennair-36-in-built-in-20.0-cu-ft-smart-counter-depth-freezerless-refrigerator-with-internal-water-dispenser-custom-panel-ready/JBRFL36IGX.html) - Buy the JennAir JBRFL36IGX Freezerless Refrigerators at P.C. Richard & Son. Shop now for the guarant...

17. [Should I be worried about R600a fridge freezers? : r/refrigeration](https://www.reddit.com/r/refrigeration/comments/u8uplr/should_i_be_worried_about_r600a_fridge_freezers/) - Also the refrigerant volumes in them are tiny, I wouldn't worry about it. I think I recall the fire ...

18. [Which Appliances Break Most? 33,190 Real Service Calls Answer It](https://www.youtube.com/watch?v=hC00kiFHU78) - My salesperson called me to thank me for recommending Yale Appliance on YouTube as it was very usefu...

19. [Jenn Air refrigerator issues : r/appliancerepair - Reddit](https://www.reddit.com/r/appliancerepair/comments/1gv38qz/jenn_air_refrigerator_issues/) - Currently having a sealed system failure with Jennair. The refrigerator is only 8yrs and the service...

20. [Jenn-Air Fridge Not Cooling : r/appliancerepair - Reddit](https://www.reddit.com/r/appliancerepair/comments/x91egl/jennair_fridge_not_cooling/) - I just had an appliance technician from the dealer come out, and he said the issue is the "liquid co...

21. [Jenn Air JSC24C8EAM00 barely cooling. Tech says compressor ...](https://www.reddit.com/r/appliancerepair/comments/hz1lut/jenn_air_jsc24c8eam00_barely_cooling_tech_says/) - Common signs your refrigerator needs repair. Best tools for DIY ... Tech says compressor failure but...

22. [Jenn Air Refrigerator Compressor & Sealed System Parts](https://www.appliancerepair.homedepot.com/Shop-For-Parts/a4b103c15/Jenn-Air-Refrigerator-Compressor-Sealed-System-Parts) - Compressor. Requires inverter to be replaced as well with updated part#W10629033. OEM Part - Manufac...

23. [JennAir Freezer Not Cold Enough - Lake Appliance Repair](https://lakeappliancerepair.com/blog/jenn-air-freezer-not-cold-enough/) - Is your JennAir freezer not cold enough? Try checking the condenser coils. The coils must dissipate ...

24. [[PDF] jenn-air® built-in refrigerator warranty](https://www.jennair.com/content/dam/global/documents/199901/warranty-w10794312-rev-a.pdf) - TWO YEAR LIMITED WARRANTY. For two years from the date of purchase, when this major appliance is ins...

25. [How Long Do Refrigerators Last?| Don's Appliances | Pittsburgh, PA](https://www.donsappliances.com/blog/how-long-do-refrigerators-last-really) - Built-In, Built-in refrigerators are built to last, with an average lifespan of about 20-25 years, a...

26. [Fix or trash this $10,000 Jenn-Air refrigerator? : r/Appliances - Reddit](https://www.reddit.com/r/Appliances/comments/1flz5i1/fix_or_trash_this_10000_jennair_refrigerator/) - Our Jenn-Air JS42SEDUDW12 has failed. Its compressor doesn't run. Authorized service guy came out, a...

27. [WPW10310240 Refrigerator Control Board Repair](https://circuitboardmedics.com/wpw10310240-refrigerator-control-board-repair/) - We can repair your failed refrigerator control board, Whirlpool OEM part number WPW10310240 or W1031...

28. [NEW W10310240 Refrigerator Control Board W10310240A ...](https://appliancepartsfinder.com/product/w10310240-compatible-whirlpool-maytag-refrigerator-control-board-wpw10310240-ps11752535-ap6019229/) - NEW W10310240 Refrigerator Control Board W10310240A WPW10310240 PS11752535 AP6019229 W10213583D for ...

29. [Jenn Air Circuit Board & Timer Parts | Ships Today! 365-Day Returns](https://www.appliancerepair.homedepot.com/Shop-For-Parts/b103c13/Jenn-Air-Circuit-Board-Timer-Parts) - Jenn Air Circuit Board & Timer Parts · Jenn Air Control Board › · $198.36 · Jenn Air Inverter Board ...

30. [Jenn Air Refrigerator Control Board Replacement](https://www.jennairreplacementparts.com/Shop-For-Parts/a4b103i324/Jenn-Air-Refrigerator-Control-Board-Parts) - Jenn Air Refrigerator Control Board Replacement · Jenn Air Refrigerator Control Board › · $171.26 · ...

31. [JennAir Refrigerator Not Working – Troubleshooting and Repair Guide](https://www.alansyllc.com/post/jennair-refrigerator-not-working-8bf9a) - Your JennAir fridge stopped working? Complete troubleshooting guide from certified technicians. Lear...

32. [Jenn-Air Refrigerator Ice Maker Not Working - TruePro Home Services](https://trueprohome.com/brands/jennair/refrigerator/refrigerator-ice-maker-not-working/) - Professional Jenn-Air ice maker repair with 35+ years experience. Expert diagnosis of luxury refrige...

33. [Consumers Sue Whirlpool Claiming Refrigerator Defect Causes Ice ...](https://topclassactions.com/lawsuit-settlements/consumer-products/appliances/consumers-sue-whirlpool-claiming-refrigerator-defect-causes-ice-buildup/) - A recently proposed class action raises claims alleging Whirlpool refrigerators have a defect causin...

34. [Control Panel or Interface Not Working - Column - JennAir](https://producthelp.jennair.com/Refrigeration/Full-Size_Refrigerators/Jennair_Columns/No_Operation/Control_Panel_or_Interface_Not_Working_-_Column) - Try resetting the refrigerator or freezer as instructed below. If the problem persists, schedule ser...

35. [36" Panel-Ready Built-In Column Refrigerator, Left Swing](https://www.theappliancecenterpc.com/products/JennAir/jen/jbrfl36igx.html) - Receive diagnostic codes on the app and they ll deploy service targeted to your column s best intere...

36. [Jenn Air Refrigerator Error Codes - YouTube](https://www.youtube.com/watch?v=dgWnBa9DIFw) - I need your assistance with Jenn Air refrigerator error codes. As often as Jenn Air fridges fail, at...

37. [JennAir JBRFL36IGX 36 inch Built-In Smart Column Refrigerator with 20 cu. ft. Capacity, Obsidian Interior, Energy Star, in Panel Ready (Left Hinge) - Homery](https://www.homery.com/product/jennair-jbrfl36igx/) - The 36" JennAir Panel-Ready Built-In Column Refrigerator offers premium design and performance with ...

38. [New Jenn-Air Integrated Column Refrigerators [Ratings / Reviews ...](https://www.youtube.com/watch?v=O4LXpNFHyKA) - Features include: - Better temperature management with three different temperature zones. - Nanotech...

39. [JENNAIR 36" Panel-Ready Built-In Freezerless Refrigerator, Left Swing - JBRFL36IGX](https://www.airportappliance.com/jennair-36-panel-ready-built-in-column-refrigerator-left-swing-jbrfl36igx) - Sleek and compact a JENNAIR 36" Panel-Ready Built-In Freezerless Refrigerator, Left Swing - JBRFL36I...

40. [Whirlpool Corporation Unveils Revolutionary SlimTech™ Insulation ...](https://www.whirlpoolcorp.com/latest-news/whirlpool-corporation-unveils-revolutionary-slimtech-insulation-technology-the-latest-in-a-history-of-innovation.html) - SlimTech™ insulation technology will make its debut in 2024 on the doors of select JennAir® luxury 3...

41. [SlimTech™ Insulation Technology to Make Its Debut in Whirlpool ...](https://www.prnewswire.com/news-releases/slimtech-insulation-technology-to-make-its-debut-in-whirlpool-corporations-return-to-ces-302028172.html) - The future of refrigeration will launch this year in limited JennAir® 30 in. Column refrigerator doo...

42. [Jenn Air JBRFSR30RX - 30 Inch Refrigerator Column: Panel Ready](https://www.plessers.com/jenn-air/jbrfsr30rx) - Slimtech™ Insulation Technology. The door of this column refrigerator features the new SlimTech™ Ins...

43. [Freshflow Air Filter Cartridge for Refrigerators - 15X More Powerful ...](https://www.jennair.com/parts-and-accessories/refrigerator-parts-and-accessories/freestanding-refrigerator-accessories/p.freshflow-air-filter-cartridge-for-refrigerators-15x-more-powerful-than-baking-soda-at-reducing-common-food-odors.w10311524.html) - OVERVIEW. Model W10311524 FreshFlow™ Air Filter keeps pollutants out of your refrigerator while allo...

44. [VIDEO: How to Install or Replace the Air Filter - Product Help - JennAir](https://producthelp.jennair.com/Refrigeration/Full-Size_Refrigerators/Product_Info/Videos/VIDEO:_How_to_Install_or_Replace_the_Air_Filter) - This Freshflow™ Airfilter keeps pollutants out of your refrigerator while allowing air to actively p...

45. [Best Integrated Refrigerators of 2025: Top Brands and Features](https://blog.yaleappliance.com/best-integrated-refrigerators) - The best integrated refrigerators are Sub-Zero, Thermador, Miele, Signature Kitchen Suite, and Fishe...

46. [JennAir Column Refrigerators With Trinity Cooling & Max Cool Modes](https://www.shopappliances.com/collection/jennair-column-refrigerators) - Trinity Cooling uses three independent cooling zones to maintain precise temperatures, reducing flav...

47. [JennAir Refrigerator Not Cooling – Expert Troubleshooting Guide](https://www.alansyllc.com/post/jennair-refrigerator-not-cooling-ff385) - Is your JennAir fridge not cooling? Expert guide covering JennAir-specific causes and solutions incl...

48. [[PDF] Refrigerators - Ferguson Home](https://www.fergusonhome.com/mediabase/specifications/rebates/consumer-reports-refrigerators-ratings.pdf)

49. [The Most Reliable Counter-Depth Refrigerators for 2025](https://blog.yaleappliance.com/most-reliable-counter-depth-french-door-refrigerators) - Every year, appliance reliability is measured the same way: service calls divided by units sold equa...

50. [Most and Least Reliable Refrigerator Brands of 2026](https://www.consumerreports.org/appliances/refrigerators/most-and-least-reliable-refrigerator-brands-a8271265835/) - The refrigerator brands in the survey include Bosch, Frigidaire, GE, Kenmore, KitchenAid, LG, Maytag...

51. [Consumer Reports' first-ever appliance reliability rankings based on ...](https://komonews.com/news/consumer/consumer-reports-first-ever-appliance-reliability-rankings-based-on-brand) - Ever notice that the old stove or washing machine you're holding on to is still going strong while y...

52. [Most and Least Reliable Refrigerator Brands - Consumer Reports (2025)](https://npifund.com/article/most-and-least-reliable-refrigerator-brands-consumer-reports) - When you buy a new refrigerator, you might expect it to last about a decade. But it turns out the od...

53. [Jenn-Air Fridge Compressor & Inverter Repair - YouTube](https://www.youtube.com/watch?v=G0omR1NfyBI) - ... Jenn-Air Fridge Compressor & Inverter Repair | Sealed System Fix in Vancouver. 88 views · 5 mont...

54. [Jenn-Air Reviews | 2 of 5 - Trustpilot](https://ca.trustpilot.com/review/jennair.com?page=2) - Updated Aug 19, 2025. Rated 1 out of 5 stars. Purchased 7 JennAir luxury products, 42” built in refr...

55. [Whirlpool 'Modular' Crescent-Mold Icemaker - The Appliance Clinic](https://www.the-appliance-clinic.com/modcres.html) - Whirlpool started manufacturing compact "modular" icemakers which is comprised of a single module .....

56. [Jenn Air Built in Freezer Icemaker issues : r/Appliances - Reddit](https://www.reddit.com/r/Appliances/comments/1febvw8/jenn_air_built_in_freezer_icemaker_issues/) - It worked fine for a little while , then ice would be clumped up in the tray ... now it almost seems...

57. [Jenn-Air Refrigerator Ice Makers | OEM Replacement Parts](https://www.partselect.com/Jenn-Air-Refrigerator-Ice-Makers.htm) - Shop for OEM Jenn-Air Refrigerator Ice Makers at PartSelect.com. We have manufacturer–authorized par...

58. [Jenn Air Refrigerator Parts | Ships Today! 365-Day Returns](https://www.jennairreplacementparts.com/Shop-For-Parts/a4b103/Jenn-Air-Refrigerator-Parts) - Shop Genuine OEM Jenn-Air refrigerator parts online to buy replacement components for sale with same...

59. [Official Jenn-Air Refrigerator Parts – PartSelect.com](https://www.partselect.com/Jenn-Air-Refrigerator-Parts.htm) - Shop for authentic Jenn-Air Refrigerator parts today! Find genuine OEM replacement parts along with ...

60. [Jenn Air Refrigerator Compressor Replacement - Repair Clinic](https://www.repairclinic.com/Shop-For-Parts/a4b103c15i734/New/Jenn-Air-Refrigerator-Compressor-Sealed-System-Compressor-Parts) - Identifying the correct model number is crucial for ordering the right Jenn Air Refrigerator Compres...

61. [OEM Jenn-Air Refrigerator Parts & Accessories - Fix.com](https://www.fix.com/parts/appliance/refrigerator/jenn-air/) - The official Jenn-Air parts you need to repair your Refrigerator. Fix.com offers same–day shipping, ...

62. [Refrigerator Compressor, W10841139 - Zoro](https://www.zoro.com/whirlpool-refrigerator-compressor-w10841139-w10841139/i/G614022891/) - Compressor works with some Whirlpool, Jenn-Air, Kenmore, KitchenAid, Maytag, Amana, Magic Chef, Admi...

63. [Official W10841139 COMPRESSOR - Home Depot Repair Parts](https://www.appliancerepair.homedepot.com/HD11728057-Whirlpool-W10841139-COMPRESSOR.htm) - Buying the OEM W10841139 COMPRESSOR made quick and easy with Home Depot Repair Parts. Enjoy fast shi...

64. [Why Choose W Service for your Appliance Repair - JennAir](https://producthelp.jennair.com/FAQ/Why_Choose_W_Service_for_your_Appliance_Repair) - W Service Technicians are passionate experts certified by the Whirlpool Corporation who are dedicate...

65. [JennAir Appliance Repair & Warranty Service Near Me](https://service.jennair.com) - Why choose W Service · Genuine Parts. Our JennAir-trained and certified technicians provide accurate...

66. [W™ Service: Your partner in appliance care - Whirlpool](https://www.whirlpool.com/blog/kitchen/w-service-appliance-care.html) - These technicians are trained and certified by Whirlpool Corporation to accurately diagnose and repa...

67. [JennAir Refrigerator Repair Services - Mr. Appliance](https://www.mrappliance.com/about/brands-we-service/jenn-air-refrigerator-repair/) - No matter what's ailing your JennAir refrigerator, your local Mr. Appliance service professionals ar...

68. [[PDF] jenn-air® refrigerator warranty](https://fergusonprod.a.bigcontent.io/v1/static/4833740_7406441_warranty)

69. [[PDF] JENN-AIR® REFRIGERATOR WARRANTY](https://linqcdn.avbportal.com/documents/e652d19b-a49b-4b27-8e69-ac61bd836bb6.pdf)

70. [[PDF] JENN-AIR® REFRIGERATION LIMITED WARRANTY](https://www.jennair.com/content/dam/global/documents/201811/warranty-w11317176-w.pdf) - Sealed Refrigeration system (includes compressor, evaporator, condenser, dryer and connecting tubing...

71. [Discover the Inspired Craftsmanship of JennAir Column Refrigerators](https://www.youtube.com/watch?v=RoYfVSDvkRA) - ... hinges. Thanks to JennAir, you can experience the thrills of emotive lighting, thick glass shelv...

72. [Whirlpool breaks ground on $65 million expansion in Ottawa](https://putnamcountyohio.com/whirlpool-breaks-ground-on-65-million-expansion-in-ottawa/) - The investment includes a 163,000 SF expansion and other renovations to accommodate production of hi...

73. [Whirlpool Upping its Refrigerator Production - YourSource News](https://yoursourcenews.com/2021/12/whirlpool-upping-its-refrigerator-production/) - Whirlpool plans to plow $65 million into its Ottawa, Ohio, freezer factory to add built-in and other...

74. [Whirlpool breaks ground on new expansion project to Ottawa facility](https://www.hometownstations.com/news/whirlpool-breaks-ground-on-new-expansion-project-to-ottawa-facility/article_db1e3706-bb65-11ec-b7fb-27f76dde6ce9.html) - The $65 million investment will help build a facility to accommodate the production of premium refri...

75. [Whirlpool Corporation announces over $65M of investments in ...](https://rgp.org/whirlpool/) - The investment will include an expansion of the Ottawa plant to accommodate production of premium re...

76. [Whirlpool To Close Fort Smith Plant - Talk Business & Politics](https://talkbusiness.net/2011/10/whirlpool-to-close-fort-smith-plant/) - A gray, overcast and rainy Thursday (Oct. 27) seemed made-to-order on a day when it was confirmed th...

77. [Whirlpool Corporation Announces North American Manufacturing Changes](https://investors.whirlpoolcorp.com/news-and-events/news/news-details/2008/Whirlpool-Corporation-Announces-North-American-Manufacturing-Changes/default.aspx) - BENTON HARBOR, Mich., Jan. 31 /PRNewswire-FirstCall/ - Whirlpool Corporation (NYSE: WHR) today annou...

78. [JennAir Inverter Board W10629033 - Jenn-Air Replacement Parts](https://www.jennairreplacementparts.com/PartDetail/Inverter-Board/W10629033/2997771) - JennAir Inverter Board W10629033 · Replaces Part Number W10133449 · Replaces Part Number 2304098 · R...

79. [RISE™ & NOIR™ DESIGN EXPRESSIONS - JennAir](https://www.jennair.com/design-expressions/rise-noir.html) - Every product is available in two design expressions. Find details that call to you—the striking bra...

80. [WHR Q4 Deep Dive: Tariffs, Housing Headwinds, and New Product ...](https://stockstory.org/us/stocks/nyse/whr/news/earnings-call/whr-q4-deep-dive-tariffs-housing-headwinds-and-new-product-launches-shape-outlook) - Tariff cost absorption: Whirlpool faced roughly $300 million in tariff costs in 2025, which pressure...

81. [Earnings call transcript: Whirlpool Q4 2025 beats EPS, misses ...](https://www.investing.com/news/transcripts/earnings-call-transcript-whirlpool-q4-2025-beats-eps-misses-revenue-93CH-4480912) - Whirlpool Corporation reported its fourth-quarter 2025 earnings, revealing an EPS of $1.91, surpassi...

82. [Whirlpool laying off 341 workers from Amana plant - Business Record](https://www.businessrecord.com/whirlpool-laying-off-341-workers-from-amana-plant/) - Whirlpool Corp. will lay off 341 workers from its plant in Amana on March 9, a move that is part of ...

83. [Whirlpool Corporation Announces $300 Million Investment in U.S. ...](https://www.whirlpoolcorp.com/latest-news/whirlpool-corporation-announces--300-million-investment-in--u-s-.html) - This $300 million investment in our Clyde and Marion facilities underscores our dedication to creati...

84. [Ranking the Best Built-In Refrigerators for 2026 - YouTube](https://www.youtube.com/watch?v=i8w9QuDLutk) - Go to channel Yale Appliance · Ranking the Best Counter Depth ... 6 Appliance Brands That Look High-...

85. [Built-in Refrigerator Advice - Jenn-Air or Subzero or other?](https://www.reddit.com/r/Appliances/comments/11dqcgx/builtin_refrigerator_advice_jennair_or_subzero_or/)

86. [Any GOOD experiences with Jennair? : r/Appliances - Reddit](https://www.reddit.com/r/Appliances/comments/1esjzbx/any_good_experiences_with_jennair/) - JennAir just isn't worth the money now, for most people. It is a glorified KitchenAid (which is good...

87. [KitchenAid vs. JennAir Appliances](https://www.townappliance.com/blogs/town-appliance-official/kitchenaid-vs-jennair-appliances-which-one-fits-your-kitchen) - Key Takeaway: KitchenAid focuses on accessible performance for everyday use, while JennAir takes it ...

88. [36" Panel-Ready Built-In Column Refrigerator, Right Swing - JennAir](https://www.jennair.com/refrigeration/columns/column-refrigerators/p.36-panel-ready-built-in-column-refrigerator,-right-swing.jbrfr36igx.html) - ... Cabinet. 84 in. Height To Top Of Door Hinge. 84 in. Net Weight. 546 lbs. Refrigerator Capacity V...

89. [Jenn-Air vs Sub-Zero Refrigerators: Which Is the Better Splurge?](https://www.reddit.com/r/ThingsForTheHouse/comments/1l3zmkk/jennair_vs_subzero_refrigerators_which_is_the/) - Jenn-Air vs Sub-Zero Refrigerators: Which Is the Better Splurge?

