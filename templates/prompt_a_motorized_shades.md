# Motorized Shades — Research Queries (Pass 1-4)

## Category: Motorized Shades
## Date: 2026-04-03
## Scope: Individual residential motorized shade/blind products — scored per product line, not per platform. Motor type, control protocol, integration depth, and build quality are spec fields. Interior motorized shades and blinds only (no exterior screens or awnings).

---

## Pass 1 — Testing Landscape

```
Who independently tests or evaluates residential motorized window treatments (motorized shades, motorized blinds, motorized rollers), and what do they measure?

I'm building a product intelligence platform that scores individual residential motorized shade products on Quality, Performance, Durability, and Material Safety. I need to understand the testing and evaluation landscape before I score anything.

Specifically:

1. What standardized tests or certifications exist for residential motorized window treatments? (UL listing for motors and power supplies, FCC for RF communication, ANSI/WCMA standards for window covering safety — especially child safety cord-free mandates, GREENGUARD or OEKO-TEX for fabric off-gassing, NFPA fire rating for fabrics, CPSC requirements for motorized window coverings, RF interference certifications)

2. What are the measurable performance specs with real numeric spread across products? I need continuous metrics, not binary pass/fail. Examples: motor cycle life (10,000 vs 50,000+ cycles), noise level in decibels (operational dB at 1m), shade travel speed (inches per second), battery life for battery-powered motors (months between charges), maximum shade width without center support, fabric UV protection factor (UPF ratings), fabric openness factor range (1% to 14%+), light gap performance (side channels, hem bar overlap, cassette sealing).

3. Who does independent comparative evaluation? (trade publications like CE Pro, Residential Systems, Window Fashion VISION, Window & Door Magazine, CEDIA integrator firms, interior designers doing head-to-head comparisons, consumer publications testing motorized shades)

4. What reliability data exists in the public domain? (motor failure rates by brand/product, battery degradation data, RF communication dropout reports, firmware issues, integrator and dealer consensus on long-term reliability — especially Somfy vs Lutron vs Hunter Douglas motors)

5. What are the key construction differentiators between premium and builder-grade motorized shades? (motor type — tubular vs external vs direct drive, motor manufacturer — Somfy OEM vs Lutron proprietary vs Hunter Douglas proprietary vs generic Chinese, control protocol — proprietary RF vs Zigbee vs WiFi vs hardwired, battery vs hardwired vs solar panel power, fabric system — cassette vs open roll vs recessed pocket, side channel light blocking, hembar design, brackets and mounting hardware quality)

6. Are there any independent reviewers doing product-level teardowns or side-by-side motor/construction analysis — someone comparing a Lutron Sivoia QS roller shade motor to a Somfy Sonesse motor to a Hunter Douglas PowerView motor at the component level? Anyone analogous to what StarCraft Reviews does for faucets?

Focus on sources that a product rating organization could cite with confidence. Skip marketing materials and manufacturer claims. I need the testing infrastructure and professional consensus, not the sales pitch.
```

**Save output as:** `knowledge/motorized_shades/motorized_shades_testing_framework.md`

---

## Pass 2 — Component & Motor Deep Dive

```
I'm building an independent product intelligence platform that scores individual residential motorized shade products at the component level. I've already mapped the evaluation landscape and brand hierarchy. Now I need to understand the actual components inside these products — who makes them, how they differ, and what fails.

MOTORS — THE CRITICAL COMPONENT:
- Somfy: The dominant OEM motor manufacturer. Which specific shade brands/products use Somfy motors? (Hunter Douglas reportedly uses Somfy in some product lines — confirm which ones.) What specific Somfy motor models go into which products? (Sonesse 30, Sonesse 40, Sonesse ULTRA 50, Glydea ULTRA 60, R28 series — map these to end products.) DC vs AC motors — which products use which and why? Noise levels by motor model (measured dB at 1m)?
- Lutron: Uses proprietary motors in Sivoia QS, Triathlon, and Palladiom shade lines. Who manufactures these motors for Lutron? Motor specs: torque ratings, noise levels, cycle life testing methodology. How do Lutron shade motors compare to Somfy motors on noise, speed, and longevity?
- Hunter Douglas: PowerView Gen 3 motors — what's inside? Somfy OEM or proprietary or something else? Battery-powered vs hardwired motor differences across their product lines? Spring-assist mechanism in some products (Duette, Silhouette) — how does motor-assist-spring work and does it reduce motor stress?
- Rollease Acmeda: Automate brand motors — who makes them? Are these rebranded Somfy or independent manufacturer?
- Budget motors: What motors do IKEA FYRTUR/KADRILJ, Yoolax, Graywind, SmartWings use? Are these all the same Chinese motor platform (Dooya, A-OK, Tuya-compatible) or genuinely different? Motor specs — cycle life, noise, torque?

CONTROL PROTOCOLS & COMMUNICATION:
- Lutron Clear Connect: Same proprietary RF used in their lighting control — how does Sivoia QS shade motor integration work? Triathlon uses Clear Connect Type X — same as RadioRA 3 lighting.
- Somfy RTS (Radio Technology Somfy): 433 MHz one-way protocol. Limitations? Why is it still widely used despite being one-way?
- Somfy io-homecontrol: Two-way bidirectional feedback (shade position confirmation). Which products use io vs RTS?
- Hunter Douglas PowerView: Proprietary Bluetooth Low Energy mesh + WiFi hub. Gen 3 vs Gen 2 protocol differences? Maximum reliable device count before mesh degrades?
- Zigbee-based: Which motorized shade products offer native Zigbee motors? (IKEA FYRTUR uses Zigbee — what version?)
- WiFi/Tuya: Generic WiFi motors in budget shades — cloud dependency, local control options, firmware update risks, latency?
- Thread/Matter: Any motorized shade products shipping with Matter support? Who has announced it?

POWER SYSTEMS:
- Hardwired (low voltage): Voltage specs by brand? (Lutron Sivoia QS = 24V DC.) Wiring requirements — retrofit vs new construction only?
- Battery: Lithium-ion rechargeable packs vs disposable batteries. Real-world battery life by brand/product (not manufacturer claims). Recharge cycle count. What happens to shade when battery dies mid-travel?
- Solar panel: Hunter Douglas, Somfy, Lutron Triathlon solar options — real-world effectiveness. Which window orientations work? Panel wattage?

FABRIC & SHADE CONSTRUCTION:
- Fabric suppliers: Who are the major fabric manufacturers? (Mermet/Serge Ferrari, Phifer, Coulisse, TWF/Twitchell, Hunter Douglas proprietary fabrics) Premium vs commodity fabric specs (openness factor, UV protection, GREENGUARD certification, color fastness ratings)?
- Shade types and construction: Roller shades, cellular/honeycomb shades, Roman shades, woven wood shades, sheer horizontal shades (Silhouette-type) — which types work best with motorization? Which have the most motor problems?
- Cassette/housing: Open roll vs cassette vs recessed fascia — build quality differences. Aluminum vs plastic cassette materials.
- Light blocking: Side channels, light gaps, hembar overlap. Which products have the tightest light blocking? Specific gap measurements?
- Maximum width: Maximum shade widths by motor/product before needing center support or coupled shades.

FAILURE MODES & RELIABILITY:
- What breaks first? (Motor burnout, battery degradation, RF communication loss, fabric delamination/discoloration, bracket failure, clutch mechanism failure, limit-setting drift)
- Somfy motor warranty and failure data: 5-year warranty — what does it actually cover?
- Lutron shade motor reliability: Does it match the legendary reliability of their lighting products?
- Hunter Douglas PowerView: Battery degradation timelines, hub failures, Bluetooth mesh dropout reports
- Budget motor failures: Common failure modes for Dooya/A-OK/generic motors?

PLATFORM SHARING & OEM MAP:
- Which shade brands are essentially Somfy motors in different housings? (Map the full Somfy OEM ecosystem for shades)
- Which brands use the same motor across multiple shade types vs different motors per product line?
- Generic/white-label: Which budget brands are identical products from the same factory? (Yoolax vs Graywind vs SmartWings — same factory?)

Prioritize sources from: CEDIA integrator forums, window covering dealer communities, professional installer forums (r/homeautomation, r/smarthome, Somfy Pro forums), Somfy dealer/installer training documentation, CE Pro and Residential Systems, AVS Forum, shade installer trade groups. Cite all sources.
```

**Save output as:** `knowledge/motorized_shades/motorized_shades_component_analysis.md`

---

## Pass 3 — Competitive Hierarchy: Top

```
How do professional integrators and window treatment specialists rank the top residential motorized shade products against each other?

Specifically comparing: Lutron Sivoia QS roller shades (HomeWorks QSX integration), Lutron Palladiom roller shades, Lutron Triathlon roller/cellular shades (battery/solar, RadioRA 3), Hunter Douglas Silhouette PowerView, Hunter Douglas Pirouette PowerView, Hunter Douglas Designer Roller Shades PowerView, Hunter Douglas Duette Architella PowerView, Somfy Sonesse-powered custom shades (through premium fabricators like The Shade Store), Mechoshade ThermoVeil/SolarTrac, and Crestron motorized shading.

What separates the best motorized shades from the merely excellent at the product level?

Focus on:
- CEDIA-certified integrator opinions on which specific shade products they specify for luxury homes ($3M+)
- Lutron Sivoia QS roller shade vs Somfy Sonesse-powered custom shade: head-to-head on motor noise, build quality, and reliability — which do luxury integrators prefer for a specific installation?
- Lutron Palladiom shading: Is this genuinely premium product construction or Lutron brand premium on Sivoia hardware?
- Hunter Douglas specific products: How does a motorized Silhouette compare to a motorized Designer Roller? Are all PowerView products equal quality or does the shade TYPE matter for motor reliability?
- Lutron Triathlon: Battery/solar roller shade — how does it compare to hardwired Sivoia QS on noise, reliability, and longevity?
- Mechoshade: Commercial crossover — do residential integrators specify Mechoshade and for which situations?
- Somfy through custom fabricators: How much does fabricator quality vary? Is a Shade Store Somfy shade the same quality as a local workroom Somfy shade?
- Motor noise comparison: dB levels for each product in real-world installations. Which products do integrators specify for bedrooms?
- Integration depth per product: Which specific products integrate tightest with whole-home automation? (Sivoia QS + HomeWorks = scene integration, PowerView + various platforms, Somfy + Control4/Savant)
- Long-term reliability per product: Which specific motorized shade products are dealers and integrators confident will still work in 15-20 years?

Focus on professional installer opinions, integrator assessments, and construction-level product differences — not marketing claims. What do people who install motorized shades daily say about which specific products are genuinely best?
```

**Save output as:** `knowledge/motorized_shades/motorized_shades_hierarchy_top.md`

---

## Pass 4 — Competitive Hierarchy: Middle and Bottom

```
Where do professionals draw the line between a quality motorized shade and a novelty gadget? Which specific products sit on that line?

Specifically: How do professional window treatment dealers and integrators rank these specific products: Lutron Serena roller shades (retail/online), Hunter Douglas PowerView cellular shades (entry-level Duette), Hunter Douglas SoftCell motorized (if different from PowerView), Somfy-powered budget fabricators, Rollease Acmeda Automate shades, Springs Window Fashions motorized (Bali, Graber brands), Budget Blinds motorized options, IKEA FYRTUR and KADRILJ, Yoolax motorized roller shades, Graywind motorized shades, SmartWings motorized roller shades, SwitchBot Blind Tilt (retrofit), AXIS Gear (retrofit motor), generic Tuya/WiFi motorized roller shades, and Amazon Basics motorized blinds (if they exist)?

I need:
- Lutron Serena: How does this consumer-direct Lutron shade compare to Sivoia QS from the same company? Same motor? Same build quality? Or genuinely downmarket hardware?
- Hunter Douglas entry-level motorized: Is a motorized Duette (cellular shade) through PowerView a "real" motorized shade or a consumer convenience product? How does motor reliability differ between their premium and entry-level shade types?
- Springs Window Fashions (Bali, Graber): These are builder/retail brands — do their motorized products use Somfy motors or something else? Quality level?
- Budget Blinds: Franchise model — what motorized products do they actually sell? Whose motors?
- IKEA FYRTUR/KADRILJ: Professional opinion on build quality, motor longevity, Zigbee reliability. Legitimate entry point or disposable after 2 years?
- Retrofit motorized solutions (SwitchBot Blind Tilt, AXIS Gear, MySmartBlinds): Do professionals take these seriously? Motor reliability? How long do retrofit adapters actually last?
- Generic WiFi/Tuya motorized (Yoolax, Graywind, SmartWings): Are these all from the same Chinese factories with different branding? Known failure modes? Cloud dependency — what happens when Tuya servers go down? What happens in 5 years?
- Zigbee/Z-Wave motors (Zemismart, Third Reality): Where do these sit? Better or worse than WiFi options?
- What is the floor of acceptable motorized shading for a quality home? What products do window treatment dealers refuse to sell or install?
- Known reliability problems by product — motor failure timelines, battery degradation rates, firmware bricking incidents, cloud service discontinuation risks
- The line between "motorized shade" and "a motor clamped to a roller" — what defines the boundary?

What products do CEDIA integrators and professional window treatment dealers refuse to specify? What do they see on the most warranty/service calls?
```

**Save output as:** `knowledge/motorized_shades/motorized_shades_hierarchy_bottom.md`

---

## Calibration Product Candidates (Pre-Research)

Pending confirmation after research results reviewed:

| Tentative Tier | Product | Notes |
|---|---|---|
| Tier 1 | Lutron Sivoia QS Roller Shade (HomeWorks) | Hardwired, proprietary motor, quietest, tightest integration, premium cassette |
| Tier 1-2 | Lutron Triathlon Roller Shade (RadioRA 3) | Battery/solar, Clear Connect Type X, newer platform |
| Tier 2 | Hunter Douglas Silhouette PowerView Gen 3 | Premium shade type, Bluetooth mesh, iconic product |
| Tier 2 | Somfy Sonesse (The Shade Store custom) | Best OEM motor + premium fabrication |
| Tier 3 | Lutron Serena Roller Shade (retail) | Lutron entry-level, consumer direct |
| Tier 3 | Hunter Douglas Duette Architella PowerView | Entry-level PowerView, cellular shade |
| Tier 4 | IKEA FYRTUR | Zigbee, affordable, limited options |
| Tier 4-5 | Yoolax / Graywind WiFi Roller Shade | Tuya/WiFi, cloud-dependent, unknown motor |

**Scope:** Individual residential interior motorized shade and blind products. No exterior screens or awnings. Motor, protocol, build quality, and integration are spec fields. Fabric selection is noted but not the primary scoring differentiator.

**Pool S candidates (pre-research):** Unknown. This category likely lacks a dominant independent tester. CEDIA integrator consensus and window covering dealer opinion may be the closest equivalent.

**Axis weight hypothesis (pre-research):**
- Quality: 0.40 — Motor type/manufacturer, control protocol, cassette/housing build quality, mounting hardware, manufacturing precision.
- Durability: 0.30 — Motor cycle life, battery longevity, fabric UV resistance, RF reliability over time, warranty reality.
- Performance: 0.30 — Noise level (dB), travel speed, battery life, max shade width, integration depth, light gap performance, group/scene control.

*Note: Weights are hypotheses. Research may shift if Performance (noise, speed) or Durability (motor life) dominates the professional hierarchy more than expected.*

---

*Run these four queries in Perplexity in order. Review all four outputs together before building config.*
