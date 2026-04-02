# Range Hood Deep Dive Prompt Template
## Per-Product Perplexity Queries — Post Research

### Usage
Copy the master template below. Append the product-specific context paragraph for the product being researched. Run as a single Perplexity deep dive query.

### Source Priority
1. **HVI Certified Products Directory** — verified CFM and sone ratings
2. **Professional installer/design communities** — real-world performance consensus
3. **Repair technician communities (r/appliancerepair)** — motor longevity, failure modes
4. **Consumer Reports** — hood performance testing
5. **Fine Homebuilding / GreenBuildingAdvisor** — ventilation science
6. **Kitchen design professionals** — specification preferences

---

### Master Template

```
I'm building an independent product intelligence platform that scores residential range hoods on Quality, Performance, Durability, and Material Safety. I need a comprehensive deep dive on [PRODUCT NAME].

CRITICAL COMPONENT ANALYSIS — BLOWER SYSTEM:
1. What type of blower/motor is used? Centrifugal (squirrel cage) or axial? Ball bearing or sleeve bearing? What is the motor manufacturer/supplier?
2. What is the HVI-certified CFM rating at each speed setting? Is the CFM rating independently verified by HVI or only manufacturer-claimed?
3. What is the HVI-certified sone rating at each speed setting? What is the sone-to-CFM ratio compared to competitors?
4. Is the blower a single-speed, multi-speed, or variable/infinite speed design? What control mechanism (electronic, mechanical)?
5. For Vent-A-Hood products: describe the Magic Lung centrifugal capture system in detail. How does grease capture before the fan differ from traditional filter systems? What is the documented service life?
6. Is an external/remote or in-line blower option available? What blower model numbers? What are the CFM/sone specs with external vs internal?

CONSTRUCTION & MATERIALS (Quality):
7. What gauge and grade of stainless steel is the body? (18-gauge 304 vs 22-gauge 430 vs painted steel)
8. What is the construction method? Welded seamless, welded standard, or riveted/assembled?
9. What type of filters? Stainless steel baffle, aluminum baffle, aluminum mesh, or charcoal? Are filters dishwasher-safe?
10. What lighting system? LED (dimmable? CRI? lux output?), halogen, or incandescent? How many watts/lumens?
11. What is the recommended duct size? What duct transition adapters are included?

PERFORMANCE METRICS:
12. What is the capture area coverage vs standard cooktop widths? How many inches of overhang on each side?
13. What is the recommended CFM-to-BTU ratio for this hood? What cooktop BTU output does the manufacturer recommend pairing with?
14. What speed settings are available? Is there a heat sentry/auto-on feature?
15. What is the noise measurement methodology? (HVI 915, AMCA 300, other?)
16. Any independent performance test results? (Consumer Reports, Reviewed.com, CNET cooking capture tests?)

RELIABILITY & SERVICE (Durability):
17. What is the motor warranty period? Is it separate from the overall product warranty?
18. What are the documented motor failure modes? (bearing wear, capacitor failure, overheating from grease buildup?)
19. What is the expected motor service life? Any documented cases of long-term operation?
20. What parts are available? Where stocked? (manufacturer direct, Amazon, hardware stores)
21. What is the typical cost of the most common repair (motor replacement)? Parts + labor?
22. What is the service network? Factory-certified, independent, or any electrician/appliance tech?

BUSINESS MODEL & MANUFACTURING:
23. Where is this product manufactured? Single factory or multi-source?
24. Who is the corporate parent? Is the company publicly traded or private?
25. For BSH products (Thermador/Bosch): Does this hood share blower, controls, or filter components with other BSH hood models? Confirm platform sharing at component level.
26. For Vent-A-Hood: Confirm Houston TX manufacturing, family ownership, and year founded. What percentage of components are made in-house?
27. For Zephyr: Confirm San Francisco design, China manufacturing. Who are the OEM factory partners?

CERTIFICATIONS (Material Safety — report only):
28. UL 507 listed? By which testing lab?
29. ADA compliant models available?
30. Energy Star qualified? (if applicable)
31. Makeup air requirement per IRC M1503.4 — at what CFM threshold?

EXPERT & PROFESSIONAL OPINION:
32. What do kitchen designers prefer to specify for luxury kitchens? Why?
33. What do HVAC professionals say about this hood's real-world ventilation effectiveness?
34. What do repair technicians say about reliability and repairability?
35. What is the professional consensus hierarchy for range hood brands?

FIELD PERFORMANCE:
36. What do owners report about real-world noise levels?
37. What do owners report about grease capture effectiveness?
38. What are the most common owner complaints?
39. What are the documented failure patterns in the first 5 years of ownership?
40. Are there any safety recalls or CPSC complaints?

Cite all sources. Prioritize: HVI certified data, independent test results, repair technicians, kitchen design professionals. Skip marketing materials and manufacturer claims.
```

---

### Product-Specific Context Paragraphs

#### Vent-A-Hood PRH Series
```
PRODUCT CONTEXT: Vent-A-Hood PRH Series wall-mount or undercabinet range hood. Heritage brand since 1933, Houston TX. Patented "Magic Lung" centrifugal blower that captures grease before it reaches the fan. Industry professionals consider Vent-A-Hood the heritage premium brand. Key verification targets: Magic Lung centrifugal vs traditional filter architecture, motor service life claims (30+ years reported), 304 stainless construction, Houston TX manufacturing, lifetime motor warranty, HVI-certified CFM and sone ratings. Compare directly against Wolf Pro Ventilation as Tier 1 competitor.
```

#### Wolf Pro Ventilation
```
PRODUCT CONTEXT: Wolf Pro Ventilation (PW series) wall-mount, island, or insert hood. Sub-Zero/Wolf ecosystem. Internal centrifugal blower with dual-blower option on larger models. Designed specifically to pair with Wolf ranges. Key verification targets: centrifugal blower specifications (ball bearing? motor supplier?), stainless baffle filter design, CFM-to-BTU matching against Wolf range models, 2-year full warranty confirmation, manufacturing location (Fitchburg WI?), external blower availability, HVI certification. Compare against Vent-A-Hood PRH as Tier 1 competitor.
```

#### Zephyr Tempest II
```
PRODUCT CONTEXT: Zephyr Tempest II (AK7500 or similar) wall-mount range hood. San Francisco-based company. Appeared 26 times in luxury real estate listings. Key differentiator is external/remote blower option (BLB series). Key verification targets: internal vs external blower CFM/sone ratings, blower model numbers (BLB series specs), stainless baffle filter quality, LED lighting specs, 430 vs 304 stainless body, manufacturing location (China — confirm OEM partner), warranty terms, HVI certification status. Score is for internal blower configuration — external blower combo would be scored separately per Rule 19.
```

#### Thermador HPCN Series
```
PRODUCT CONTEXT: Thermador HPCN Series (e.g., HPCN36NS or HMWB30FS) chimney or wall-mount hood. BSH platform. Key verification targets: CONFIRM whether Thermador hoods share blower and/or filter components with Bosch hoods (BSH platform sharing is confirmed across dishwashers, refrigerators, wall ovens — does it extend to ventilation?). Also: centrifugal blower specs, stainless baffle filter type, CFM/sone at each speed, external blower availability, LED vs halogen lighting, warranty terms, BSH parts availability. Compare against Bosch 800 Series hoods for platform analysis.
```

#### Broan-NuTone Elite E60E30SS
```
PRODUCT CONTEXT: Broan-NuTone Elite E60E30SS (or current Elite equivalent) chimney wall-mount hood. Nortek subsidiary. Volume player's premium line. Key verification targets: body stainless gauge/grade, filter type (aluminum mesh? any baffle option?), blower type (centrifugal or axial?), CFM rating, sone rating at max, LED or halogen, construction method (welded or riveted?), HVI certification, external blower compatibility, warranty terms. Broan-NuTone is the largest US range hood manufacturer — this is the line between "good enough" and "premium."
```

#### Broan-NuTone F40000 Series
```
PRODUCT CONTEXT: Broan-NuTone F40000 Series 30-inch undercabinet hood (~$60 retail). Builder-grade floor product. Key verification targets: CFM rating (manufacturer claims ~210 CFM — HVI certified?), sone rating at max, body material (painted steel), filter type (aluminum mesh), lighting (incandescent), duct size, speed options, motor type (axial?), warranty terms. This is the de facto national builder standard for range ventilation — the cheapest hood a builder can specify. Verify whether 210 CFM can physically ventilate a 30-inch range during high-heat cooking (industry standard is 100 CFM per linear foot of range = 250 CFM minimum for 30-inch).
```

---

### Operational Notes
- Run each product as a separate Perplexity deep dive
- Expected output: 15-40K chars, 15-40+ sources per product
- Save raw output as markdown to `knowledge/range_hoods/`
- After all 6 deep dives: review for corrections, update calibration if needed
