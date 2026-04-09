# Motorized Shades — Per-Product Deep Dive Template

## Category: Motorized Shades
## Scope: Individual residential motorized shade/blind products. Interior only.

---

## Master Template (applies to all products)

```
I need a comprehensive technical deep dive on [PRODUCT NAME] motorized shades for an independent product intelligence platform. I'm scoring this product on Quality (motor, protocol, build), Performance (noise, speed, integration), Durability (cycle life, battery, warranty), and Material Safety. I need verifiable facts, not marketing claims.

1. MOTOR SPECIFICATIONS:
- Motor type: tubular, direct drive, or external/clamp-on? Motor manufacturer (Somfy OEM, Lutron proprietary, Hunter Douglas proprietary, generic)?
- Motor torque rating (Nm), noise level (dB at 1m under load), operational speed (RPM or inches/second for shade travel)
- Motor cycle life rating (number of full up/down cycles before expected failure)
- DC or AC motor? Voltage and power consumption?
- Gearbox type and construction? Known failure modes at the motor level?

2. CONTROL PROTOCOL & COMMUNICATION:
- What protocol: Lutron Clear Connect, Somfy RTS, Somfy io-homecontrol, Zigbee, Z-Wave, WiFi/Tuya, Bluetooth mesh, Thread/Matter?
- One-way or two-way communication? (Can the system confirm shade position?)
- RF frequency, range, and interference characteristics?
- Hub/gateway/processor required? What specific hardware?
- Maximum number of shades per hub/controller before degradation?
- Cloud dependency: which features require cloud? What stops working during internet outage?
- Local control capability: can the shade operate without internet/cloud?

3. BUILD QUALITY & CONSTRUCTION:
- Cassette/housing: material (aluminum, plastic, composite), finish quality, light-gap sealing
- Mounting hardware: brackets, screws — metal or plastic? Precision or stamped?
- Hembar design: weighted, magnetic, sealed? Light gap at bottom?
- Side channels available? Material and fit?
- Maximum shade width and height without center support
- Fabric options: how many fabrics, suppliers (Mermet, Phifer, Coulisse, proprietary?), GREENGUARD certification?
- Shade type(s) available: roller, cellular, sheer horizontal, Roman, woven wood?

4. POWER SYSTEM:
- Hardwired, battery, solar, or hybrid? Specific voltage (24V DC, etc.)?
- If battery: cell chemistry (lithium-ion, NiMH, AA?), capacity (mAh/Wh), recharge method (USB-C, proprietary dock?), real-world battery life with daily use (2 cycles/day)
- If solar: panel wattage, what window orientations/climates work, does solar fully sustain or only supplement?
- Battery replacement: user-replaceable or dealer service required? Cost?

5. INTEGRATION & AUTOMATION:
- Native integrations: which whole-home automation platforms? (Lutron HomeWorks, RadioRA 3, Savant, Control4, Crestron?)
- Third-party support: drivers, APIs, IFTTT, HomeKit, Alexa, Google?
- Scene control: multi-shade grouping, conditional logic, astronomical timeclock, daylight harvesting?
- App quality: iOS/Android, responsiveness, reliability of scheduling?

6. RELIABILITY & FIELD PERFORMANCE:
- Professional installer consensus on long-term reliability for this specific product
- Known failure modes: motor, battery, communication, fabric, brackets, limit drift?
- Documented firmware/software issues? OTA update failures?
- Expected system lifespan: what do installers report — 5-year, 10-year, 15-year, 20-year?
- Single points of failure: what breaks and takes the whole shade offline?

7. WARRANTY & SERVICE:
- Warranty term (years) for motor, electronics, fabric (separately if different)
- What's covered and what's excluded? Battery degradation covered?
- Serviceable by any installer or only by certified dealers? Programming lockout?
- Motor replacement: field-swappable or entire shade replacement?
- Parts availability: manufacturer direct, dealer stock, retail?

8. CORPORATE & MANUFACTURING:
- Parent company, ownership structure (public/private), headquarters
- Manufacturing location(s) — identified or unknown?
- Corporate stability: acquisitions, ownership changes, product line discontinuation history?
- Distribution model: dealer-only, retail, online direct-to-consumer?

9. PROFESSIONAL OPINIONS:
- What do CEDIA integrators and window treatment dealers say about this specific product vs competitors?
- Documented cases of dealers switching to or away from this product? Why?
- Builder specification frequency: how often specified in new construction?
- Luxury listing sightings: does this product appear in real estate marketing?

10. COST & VALUE POSITIONING:
- Typical per-shade installed cost range (including motor, fabric, installation)
- Cost per square foot for common sizes?
- Total cost of ownership including battery replacements, motor service, fabric replacement over 10-15 years?

Sources: Prioritize CEDIA integrator feedback, professional installer forums (r/homeautomation, r/smarthome, AVS Forum), window covering dealer communities, manufacturer technical documentation, UL/FCC certification data, CE Pro/Residential Systems. Cite all sources.
```

---

## Per-Product Context (append to master template)

### Lutron Sivoia QS Roller Shade (HomeWorks)
```
PRODUCT: Lutron Sivoia QS Roller Shade — hardwired, HomeWorks QSX integration
TARGET: Tier 1 — flagship motorized shade, integrator consensus #1
CONTEXT: Sivoia QS is Lutron's top-of-line motorized shade. Hardwired 24V DC, proprietary Lutron motor, QS Link wired backbone + Clear Connect wireless. Ultra-quiet (<40 dB per integrator reports), premium aluminum cassette/fascia, up to 144" width. Native scene integration with HomeWorks QSX for whole-home lighting + shading automation. 8-year warranty. 20,000+ motor cycles. I need specific data on: exact motor noise measurements (dB at 1m), motor torque specs, cycle life testing methodology, cassette construction details (aluminum grade, finish), maximum shade dimensions by fabric weight, and professional integrator field reliability data — how many years are the oldest Sivoia QS installations running successfully?
```

### Lutron Triathlon Roller Shade (RadioRA 3)
```
PRODUCT: Lutron Triathlon Roller Shade — battery/solar, RadioRA 3 compatible
TARGET: Tier 1 — best battery-powered motorized shade per integrators
CONTEXT: Triathlon is Lutron's wireless motorized shade. Battery with optional solar panel. Clear Connect Type X (same as RadioRA 3 lighting). Up to 12x12 ft (144" coupled). 3-5 year battery life claimed with solar. I need specific data on: battery chemistry and capacity (Wh), solar panel wattage and real-world charging effectiveness by window orientation, noise level comparison to hardwired Sivoia QS (~42 dB reported vs QS <40 dB), cycle life for battery motor vs hardwired motor, and real-world battery replacement data from dealers — how often are they actually replacing batteries?
```

### Lutron Palladiom Roller Shade
```
PRODUCT: Lutron Palladiom Roller Shade — ultra-modern exposed bracket design
TARGET: Tier 2 — premium aesthetic shade, same motor platform as Sivoia QS
CONTEXT: Palladiom uses Sivoia QS motor platform with ultra-modern exposed bracket design (no fascia/cassette cover). Wired or battery options. Exclusive to HomeWorks QSX/RadioRA 3. I need specific data on: how does the open bracket design affect light blocking compared to Sivoia QS cassette? Is the motor identical to Sivoia QS or a different variant? Fabric selection overlap with Sivoia QS? Why is Palladiom priced differently — is it the bracket engineering or limited production? Integrator opinions on Palladiom vs Sivoia QS for different interior styles.
```

### Hunter Douglas Silhouette PowerView Gen 3
```
PRODUCT: Hunter Douglas Silhouette with PowerView Gen 3 motorization
TARGET: Tier 2 — premium sheer horizontal shade, iconic Hunter Douglas product
CONTEXT: Silhouette is Hunter Douglas's signature product — sheer horizontal vanes suspended between two fabric panels. PowerView Gen 3 uses Bluetooth Low Energy mesh with Pebble hub. Proprietary fabrics with lifetime fabric warranty. I need specific data on: motor manufacturer (Somfy OEM or HD proprietary?), motor noise and cycle life for Silhouette specifically (sheer horizontal mechanism may differ from roller), BLE mesh maximum device count before degradation, Pebble hub reliability data, battery pack specs (chemistry, capacity, recharge cycles), and real-world battery replacement frequency from dealers. Also: how does the Silhouette vane mechanism affect motorized reliability compared to simpler roller shades?
```

### Somfy Sonesse Custom Shade (The Shade Store)
```
PRODUCT: Somfy Sonesse ULTRA motor in The Shade Store custom roller shade
TARGET: Tier 2 — best OEM motor + premium fabrication
CONTEXT: Somfy Sonesse ULTRA 50 is the industry benchmark OEM tube motor, paired with The Shade Store's premium custom fabrication. Both hardwired and battery options. Somfy io-homecontrol (two-way) or RTS (one-way) protocol. I need specific data on: exact Sonesse ULTRA 50 specs (torque Nm, noise dB, cycle life), io-homecontrol vs RTS technical differences and reliability, The Shade Store's specific fabrication quality (cassette material, fabric sourcing, what brands of fabric they carry), integration depth via Control4/Savant/Crestron drivers, and how fabricator quality variability affects end product — is a Shade Store Sonesse notably different from a local workroom using the same Somfy motor?
```

### Lutron Serena Roller Shade
```
PRODUCT: Lutron Serena Roller Shade — consumer direct, entry-level Lutron
TARGET: Tier 3 — Lutron quality DNA in a consumer-accessible package
CONTEXT: Serena is Lutron's consumer-direct motorized roller shade. Battery-only, Clear Connect RF, compatible with Caseta and RadioRA 3. Sold online/retail without dealer. CRITICAL QUESTIONS: Is Serena's motor genuinely different hardware from Sivoia QS (different motor, not just different packaging)? Noise level (~48 dB reported vs QS <40 dB) — what causes the difference? Cycle life for Serena motor vs Sivoia QS? Fabric selection compared to Sivoia QS? Battery specs (chemistry, capacity, recharge method). Is the Clear Connect in Serena Type X or Type A? Professional opinion — do integrators specify Serena for anything, or is it strictly consumer-DIY?
```

### Hunter Douglas Duette Architella PowerView
```
PRODUCT: Hunter Douglas Duette Architella with PowerView Gen 3
TARGET: Tier 3 — entry-level PowerView, cellular/honeycomb shade
CONTEXT: Duette Architella is a double-cell honeycomb shade (excellent insulation). PowerView Gen 3 Bluetooth mesh. Battery-powered. This is Hunter Douglas's entry into motorized — higher volume, lower price point than Silhouette/Pirouette. I need specific data on: motor specs for cellular shade (different from Silhouette sheer mechanism?), battery pack specs and real-world replacement frequency, spring-assist mechanism (does Duette use spring assist to reduce motor load?), fabric warranty terms for Architella specifically, energy efficiency quantified (R-value or U-value for double-cell honeycomb), and professional dealer opinion — is motorized Duette a stepping stone to Silhouette/Pirouette or a standalone product category?
```

### IKEA FYRTUR
```
PRODUCT: IKEA FYRTUR motorized roller shade
TARGET: Tier 4 — affordable Zigbee entry point, disposable quality
CONTEXT: FYRTUR is IKEA's budget motorized roller shade. Zigbee 3.0, DIRIGERA hub required. $100-180 price point. USB-C rechargeable battery. Limited sizes (standard window widths). I need specific data on: motor manufacturer (who makes the FYRTUR motor? Dooya?), motor noise level (reported as audible/buzzy), cycle life (no published spec — what's the real-world motor lifespan?), battery capacity and real-world life between charges, Zigbee 3.0 compatibility with non-IKEA hubs (Home Assistant, SmartThings), available sizes and maximum width, fabric composition (blackout polyester only?), and professional/enthusiast opinion — consensus seems to be "disposable after 2-3 years" but some users report longer. What drives failure — motor burnout, battery degradation, or Zigbee reliability?
```
