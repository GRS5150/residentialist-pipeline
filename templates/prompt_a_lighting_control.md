# Lighting Control — Research Queries (Pass 1-4)

## Category: Lighting Control Systems
## Date: 2026-04-02
## Scope: Whole-home lighting control systems — scored as platforms, not individual switches

---

## Pass 1 — Testing Landscape

```
Who independently tests or evaluates residential whole-home lighting control systems, and what do they measure?

I'm building a product intelligence platform that scores residential lighting control systems on Quality, Performance, Durability, and Material Safety. I need to understand the testing and evaluation landscape before I score anything.

Specifically:

1. What standardized tests or certifications exist for residential lighting control systems? (UL listing, FCC, IEEE, ANSI, NFPA, Energy Star, Title 24, ADA compliance)

2. What are the measurable performance specs with real numeric spread across systems? I need continuous metrics, not binary pass/fail. Example: device capacity (75 vs 10,000+), dimming depth (5% vs 0.1%), color temperature range (fixed vs 1,400K-10,000K), scene complexity, communication latency.

3. Who does independent comparative evaluation? (trade publications like CE Pro, Residential Systems, CEDIA integration firms, independent AV/automation consultants doing head-to-head reviews)

4. What reliability data exists in the public domain? (system failure rates, communication dropout reports, firmware issues, integrator consensus on long-term reliability by brand)

5. What are the key architecture differentiators between premium and builder-grade systems? (panelized wired vs wireless mesh vs WiFi, proprietary RF vs Zigbee/Z-Wave, dedicated processor vs cloud-dependent hub, keypad aesthetics)

6. Are there any independent reviewers doing system-level comparisons or teardowns — someone evaluating Lutron HomeWorks vs RadioRA 3 vs Caseta at the architecture level, not just feature checklists?

Focus on sources that a product rating organization could cite with confidence. Skip marketing materials and manufacturer claims. I need the testing infrastructure and professional consensus, not the sales pitch.
```

---

## Pass 2 — Component & Architecture Deep Dive

```
I'm building an independent product intelligence platform that scores residential lighting control systems at the architecture and component level. I've already mapped the evaluation landscape and brand hierarchy. Now I need to understand the actual technology inside these systems — communication protocols, processor architectures, dimming engine design, and failure modes.

COMMUNICATION PROTOCOLS:
- Lutron Clear Connect (Type X vs Type A): What frequency bands? What makes it more reliable than WiFi/Zigbee? What is the published interference immunity? How does QS Link wired backbone work?
- Zigbee/Z-Wave mesh (Control4): Spectrum sharing with 2.4 GHz WiFi — documented interference cases? Mesh repeater architecture specifics? Maximum device density before degradation?
- Savant Bluetooth mesh: Protocol specifics? Range limitations? Interference characteristics?
- WiFi-based (Leviton, generic): Router dependency, maximum device count before congestion, firmware update failure modes?

DIMMING ENGINE & LOAD MANAGEMENT:
- Lutron patented dimming technology: How do they achieve 0.1% dimming depth flicker-free? What LED compatibility testing methodology do they use? Load derating details per dimmer model?
- Forward-phase vs reverse-phase vs 0-10V vs DALI dimming: Which systems support which protocols? Which perform best with modern LEDs?
- Load capacity per dimmer: PD-6WCL (150W LED/600W inc) vs RadioRA 3 dimmers vs HomeWorks panel-mounted modules. Actual tested capacities?

PROCESSOR & CONTROL ARCHITECTURE:
- HomeWorks QSX processor: Hardware specs, local processing vs cloud dependency, redundancy options, programming via Lutron Designer
- RadioRA 3 processor: same architecture family? Differences from HomeWorks processor?
- Savant Host: Apple-based. Hardware specs, local vs cloud processing split, update mechanism
- Control4 EA controllers: Linux-based. Processing power, database architecture, OS version
- Caseta Smart Bridge: Hardware limitations that cause 75-device cap?

KETRA TECHNOLOGY (Lutron-owned):
- Multi-die emitter architecture: Which LED driver ICs? Thermal management?
- Color Lock: optical feedback sensor — what sensor, what precision (MacAdam ellipse step), calibration lifetime?
- Natural Light algorithm: circadian shifting parameters? Astronomical clock precision?
- Vibrancy control: spectrum manipulation technique? R9/R13/R15 values?

FAILURE MODES & RELIABILITY:
- What breaks first in each system architecture? (processor failures, dimmer failures, communication failures, hub failures)
- Firmware update failures: documented cases where OTA updates bricked systems?
- Lutron Clear Connect reliability claims: "100x more reliable than WiFi" — what testing methodology?
- Zigbee mesh congestion: at what device density does performance degrade?
- WiFi smart switch dropout rates: documented by integrators?

Prioritize sources from: CEDIA integrator forums, professional installer communities, Lutron technical documentation, r/homeautomation and r/Lutron, CE Pro and Residential Systems magazine, AVS Forum. Cite all sources.
```

---

## Pass 3 — Competitive Hierarchy: Top

```
How do professional integrators rank the top residential lighting control systems against each other?

Specifically comparing Lutron HomeWorks QSX (with and without Ketra), Lutron RadioRA 3, Savant Lighting, and Control4 Lighting. What separates the best from the merely excellent?

Focus on:
- CEDIA-certified integrator opinions on which systems they specify for $3M+ homes
- Why professional integrators frequently pair Savant brain + Lutron lighting hardware — what does this say about each platform's lighting-specific capability?
- Is Ketra genuinely transformative or a premium upsell? What do lighting designers who've installed both Ketra and standard HomeWorks say?
- RadioRA 3 vs HomeWorks: is the architecture difference (distributed vs panelized) a meaningful quality difference or just a scalability difference?
- Savant vs Control4: which platform do luxury home integrators prefer and why?
- Long-term reliability: which systems are integrators confident will still work in 15-20 years?

Focus on professional installer opinions, independent integrator assessments, and architecture-level differences — not marketing claims. What do professionals who install these systems daily say about relative quality?
```

---

## Pass 4 — Competitive Hierarchy: Middle and Bottom

```
Where do professionals draw the line between a proper lighting control system and a box-checker for smart home features? Which brands sit on that line?

Specifically: How do professionals rank Lutron Caseta, Leviton Decora Smart, Inovelli, Zooz, TP-Link Kasa, Treatlife, and generic WiFi/Zigbee smart switches in the professional hierarchy?

I need:
- Where does Caseta sit in the Lutron hierarchy? Is it a "real" Lutron system or a consumer product riding the brand?
- Professional installer opinions on WiFi-based smart switches (Leviton, TP-Link, generic) — reliability, integration depth, failure modes
- Zigbee/Z-Wave enthusiast switches (Inovelli, Zooz) — do professionals respect these or avoid them?
- What's the floor of acceptable lighting control for a quality home? What systems do professional integrators refuse to specify?
- Known reliability problems by platform — WiFi dropout rates, hub failures, cloud dependency risks
- The line between "lighting control system" and "smart switches with an app"

Focus on the line between "system-level lighting control for a quality home" and "individual switches that happen to connect to the internet." What brands do CEDIA integrators refuse to specify?
```
