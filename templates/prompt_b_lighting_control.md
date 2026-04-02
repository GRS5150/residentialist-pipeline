# Lighting Control — Per-Product Deep Dive Template

## Category: Lighting Control Systems
## Date: 2026-04-02
## Prerequisite: Pass 2 component analysis completed

---

## Master Template

```
I need a comprehensive technical and professional assessment of the [PRODUCT NAME] lighting control system for an independent product rating platform. This is for the Residentialist — we rate residential building products on Quality, Performance, Durability, and Material Safety.

1. SYSTEM ARCHITECTURE & COMMUNICATION PROTOCOL:
- What communication protocol does this system use? (Clear Connect Type X, Clear Connect Type A, QS Link wired, Zigbee, Z-Wave, WiFi, Bluetooth mesh)
- What is the maximum device/zone capacity? Hard limits vs theoretical limits? What happens at capacity?
- Is there a dedicated processor or hub? Specs? Local processing or cloud-dependent?
- What is the communication reliability architecture? (wired backbone + wireless, wireless only, WiFi router dependency)
- Does this system use a dedicated frequency band or shared spectrum?
- What redundancy exists? If the processor fails, do the lights still work manually?

2. DIMMING TECHNOLOGY & LOAD MANAGEMENT:
- What dimming depth is achievable? (0.1%, 1%, 5%, 10%) Flicker-free?
- What dimming protocols are supported? (Forward-phase, reverse-phase, ELV, 0-10V, DALI)
- What is the load capacity per dimmer/module? (LED watts, incandescent watts, MLV, ELV)
- Does the system support tunable white or color temperature control? If so, what CCT range?
- LED compatibility: how many bulb models are tested? Is there a published compatibility database?
- Load derating rules: does LED load capacity decrease with multiple gangs?

3. KEYPAD & SWITCH AESTHETICS:
- What switch/keypad lines are available? (Model names, finish options, form factors)
- Custom engraving capability? Backlit buttons? Multi-button scene keypads?
- Total finish options count? Metal vs plastic construction? Flush-mount vs standard depth?
- Exclusive designs not available on other platforms?

4. SCENE PROGRAMMING & AUTOMATION:
- What programming software is used? (Lutron Designer, Savant Studio, Composer Pro, app-only)
- Scene complexity: multi-zone, conditional logic, astronomical timeclock, daylight harvesting?
- Can the homeowner create scenes or only the installer?
- Firmware update mechanism: OTA, dealer-only, manual?

5. INTEGRATION DEPTH:
- Native integrations: shading, AV, HVAC, security, surveillance?
- Third-party protocol support: API, driver-based, cloud-to-cloud?
- Voice assistant compatibility: Alexa, Google, Siri/HomeKit?
- Open API available or closed ecosystem?

6. RELIABILITY & FIELD PERFORMANCE:
- Professional installer consensus on long-term reliability
- Known firmware issues or communication problems documented in integrator forums
- What is the expected system lifespan? Do integrators report 10-year, 15-year, 20-year operational systems?
- Single points of failure: what component failure takes down the whole system?

7. WARRANTY & SERVICE:
- Warranty term (years) and coverage specifics
- Is the system serviceable by any electrician or only by certified dealers?
- Programming lockout: can homeowners access programming or is it dealer-locked?
- Parts availability: manufacturer direct, dealer stock, retail?
- Software/firmware support commitment: how long does the manufacturer support each generation?

8. CORPORATE & MANUFACTURING:
- Parent company, ownership structure (public/private), headquarters
- Manufacturing location(s) — identified or unknown?
- Corporate stability, acquisition history, product line continuity track record
- Distribution model: dealer-only, retail, online?

9. PROFESSIONAL OPINIONS:
- What do CEDIA integrators say about this system vs competitors?
- Are there documented cases of integrators switching TO or AWAY FROM this platform? Why?
- Builder specification frequency: how often does this system appear in new construction specs?
- Luxury listing sightings: does this system appear in real estate listings?

10. COST & VALUE POSITIONING:
- Typical whole-home system cost range ($500-$200K+)
- Cost per zone/device? Is there a significant per-zone premium vs competitors?
- Total cost of ownership including future programming changes and firmware support?

Sources: Prioritize CEDIA integrator feedback, professional installer forums (r/homeautomation, r/Lutron, AVS Forum, CEDIA community), CE Pro and Residential Systems magazine, manufacturer technical documentation, UL/FCC certification data. Cite all sources.
```

---

## Per-Product Context (append to master template)

### Lutron HomeWorks QSX (with Ketra)
```
PRODUCT: Lutron HomeWorks QSX with Ketra tunable lighting
TARGET: Tier 1 — flagship panelized lighting control with tunable spectrum technology
CONTEXT: HomeWorks QSX is Lutron's top-of-line system — panelized, wired QS Link backbone, Clear Connect Type X wireless, up to 10,000+ devices. Ketra (acquired by Lutron 2018) adds tunable white 1,400K-10,000K, 16.7M colors, >90 CRI, Color Lock technology (one-step MacAdam ellipse). Exclusive Palladiom and Alisse keypads. I need specific data on: Ketra multi-die emitter architecture (which LED driver ICs, thermal management), Color Lock optical feedback sensor precision and calibration lifetime, Natural Light circadian algorithm parameters, dimming to 0.1% methodology, and real-world performance from lighting designers who have commissioned Ketra installations.
```

### Lutron HomeWorks QSX (Standard)
```
PRODUCT: Lutron HomeWorks QSX without Ketra — standard dimming
TARGET: Tier 1 — same architecture, no tunable spectrum
CONTEXT: Same panelized QS Link + Clear Connect architecture as Ketra variant but with standard (non-tunable) lighting fixtures. Same Palladiom/Alisse keypads, same 10,000+ device capacity, same scene programming. The question: how much does losing Ketra affect the system's value proposition? What do integrators say about HomeWorks without Ketra vs RadioRA 3 — is the panelized architecture alone worth the premium over distributed wireless?
```

### Lutron RadioRA 3
```
PRODUCT: Lutron RadioRA 3
TARGET: Tier 2 — professional wireless retrofit system
CONTEXT: Lutron's professional-grade wireless system. Clear Connect Type X. 200 devices/processor. Sunnata, Maestro, seeTouch keypads. Requires Lutron-certified installer with Lutron Designer. Best retrofit system on the market. I need specific data on: Clear Connect Type X frequency specs and interference testing, processor hardware specs, actual maximum reliable device count (is 200 practical or do integrators hit issues at 150?), seeTouch keypad vs HomeWorks Palladiom keypad construction quality, and whether RadioRA 3 gets Ketra support (or if it's blocked to protect HomeWorks).
```

### Savant Lighting System
```
PRODUCT: Savant Lighting System (integrated with Savant whole-home automation)
TARGET: Tier 2 — premium whole-home platform with lighting layer
CONTEXT: Savant is a whole-home automation platform that includes its own lighting products. TrueImage switch displays, Bluetooth mesh protocol, Apple ecosystem alignment. CRITICAL QUESTION: Professional integrators frequently pair Savant brain + Lutron lighting hardware — this is reportedly the industry default for luxury homes. I need data on: Savant's own lighting hardware field reliability vs Lutron hardware, TrueImage display longevity, Bluetooth mesh interference characteristics, why integrators choose Lutron lighting over Savant's own switches, 3-year warranty vs Lutron 8-year, and Savant's track record with firmware updates.
```

### Control4 Lighting (Snap One)
```
PRODUCT: Control4 Lighting / Snap One ecosystem
TARGET: Tier 3 — automation platform with lighting capability
CONTEXT: Control4 is a comprehensive home automation platform with integrated lighting. Zigbee mesh. Dealer-channel only. Founded 2003, acquired by Snap One 2019, then Snap One acquired by Resideo Technologies 2024. CRITICAL: Two ownership changes in 5 years. I need data on: Zigbee mesh performance at scale (at what device density does it degrade?), comparison of Control4 dimming precision vs Lutron dimming precision, Custom Configurable Keypad construction quality, effect of Snap One/Resideo acquisitions on product development and dealer confidence, 2-year warranty adequacy, and whether integrators are moving away from Control4 lighting toward Lutron lighting within Control4 automation systems.
```

### Lutron Caseta
```
PRODUCT: Lutron Caseta (entry-level, DIY-friendly)
TARGET: Tier 3 — reliable entry-level with hard scalability limits
CONTEXT: Caseta is Lutron's most accessible system. 75 device limit. Clear Connect (Type A, not Type X). Smart Bridge hub. DIY installation. PD-6WCL (150W LED/600W inc), PD-5NE (250W LED). Pico wireless remotes. No neutral wire required on most dimmers. I need specific data on: Why the 75-device hard limit exists (hardware or artificial?), Smart Bridge failure rates, Pico remote battery life and replacement, Clear Connect Type A vs Type X technical differences, dimming quality comparison with RadioRA 3 (same LED, same bulb — does one dim smoother?), and whether Caseta owners upgrade to RadioRA 3 (and what triggers the upgrade decision).
```

### Leviton Decora Smart Wi-Fi
```
PRODUCT: Leviton Decora Smart Wi-Fi (DW6HD, DW15S, D215S)
TARGET: Tier 4 — individual WiFi switches, not a system
CONTEXT: Leviton is a respected 100+ year electrical manufacturer. Decora Smart is their WiFi-based smart switch line. No hub required — each switch connects to home WiFi router. My Leviton app. I need specific data on: WiFi connection stability (integration forums report dropout issues — how frequent?), maximum practical switch count on a single router (at what point does congestion cause failures?), dimming quality and LED compatibility (5% minimum vs Lutron 1%), cloud dependency (which features stop working if Leviton cloud goes down?), neutral wire requirement impact on retrofit compatibility, and professional integrator opinions on specifying WiFi switches in quality homes.
```
