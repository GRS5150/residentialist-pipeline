const fs = require("fs");
const filePath = "/Users/Residentialist/.openclaw/workspace/residentialist/knowledge/Windows/windows_deterministic_rubrics_v6.md";
let content = fs.readFileSync(filePath, "utf8");

const oldSection = `### 1C. Professional Consensus on Quality (30% of Quality)

**Structured field intelligence tier (not numeric -- categorical):**

| Tier | Criteria | Score Range |
|---|---|---|
| Excellent | 5+ independent professional sources praise quality without qualification. No professional criticism of build quality documented. | 9-10 |
| Good | Professional consensus positive with minor caveats. 1-2 specific component criticisms but overall positive. | 7-8 |
| Mixed | Professional opinions split. Some praise, some criticize. Or limited professional data available. | 5-6 |
| Concerning | Multiple professional sources cite quality concerns. Pattern of complaints about specific components. | 3-4 |
| Poor | Professionals actively warn against. Widespread documented quality failures. | 1-2 |

**Professional Consensus Ceiling Rule:** If 2+ independent professional sources recommend specific competing products at the same or lower price, Professional Consensus cannot exceed 7.5.

**Source quality requirements:**
- "Professional source" = contractor, builder, building scientist, or independent consultant with verifiable credentials
- Forum posts from verified professionals count. Anonymous consumer complaints do not.
- Manufacturer marketing does not count as professional consensus.`;

const newSection = `### 1C. Professional Consensus on Quality (30% of Quality)

**Structured field intelligence tier (not numeric -- categorical):**

| Tier | Criteria | Score Range |
|---|---|---|
| Excellent | 5+ independent professional sources praise quality without qualification. No professional criticism of build quality documented. | 9-10 |
| Good | Professional consensus positive with minor caveats. 1-2 specific component criticisms but overall positive. | 7-8 |
| Mixed | Professional opinions split. Some praise, some criticize. Or limited professional data available. | 5-6 |
| Concerning | Multiple professional sources cite quality concerns. Pattern of complaints about specific components. | 3-4 |
| Poor | Professionals actively warn against. Widespread documented quality failures. | 1-2 |

**Professional Consensus Ceiling Rule:** If 2+ independent professional sources recommend specific competing products at the same or lower price, Professional Consensus cannot exceed 7.5.

**Source quality requirements:**
- "Professional source" = contractor, builder, building scientist, independent consultant with verifiable credentials, OR qualified Reddit field source (see below)
- Qualified Reddit field sources count as professional sources. See verified_field_sources.json for pre-qualified users and dynamic qualification criteria.
- Anonymous consumer complaints, unqualified homeowner reviews, and manufacturer marketing do not count.

**Field Source (Reddit) Integration Rules:**

Qualified field sources from Reddit trade forums are valid professional sources for this subscore. Their ceiling contribution depends on sample size:

| Qualified Field Sources Found | Professional Consensus Ceiling from Field Sources Alone |
|---|---|
| 1-2 qualified | Max 6.5 |
| 3-5 qualified | Max 7.5 |
| 6-9 qualified | Max 8.5 |
| 10+ qualified | No cap (max 10) |

When multiple qualified field sources express opinions on the same product, apply **trimmed mean**: drop the highest and lowest, average the rest. Below 4 sources, use simple mean.

Field source evidence combines with Expert Authority and Publication evidence — it does not replace them. If Expert Authorities (Jay Johnson, GBA, BSC) have evaluated the product, their assessment governs. Field sources strengthen or corroborate. If no Expert Authority or Publication evidence exists, field source evidence alone can establish Professional Consensus up to its sample-size ceiling.

**Divergence Flag:** If the field source consensus and the Expert Authority / Publication / Certification consensus disagree by more than 2 points on the Quality axis, generate a Yellow Finding: "Field professionals rate this product significantly [lower/higher] on Quality than [Expert Authority / Publication] sources suggest. This divergence may indicate [marketing narrative vs. field reality / publication bias / lab-vs-field performance gap]."`;

if (!content.includes(oldSection)) {
  console.log("ERROR: Could not find old Professional Consensus section");
  // Try to find partial match
  if (content.includes("### 1C. Professional Consensus on Quality")) {
    console.log("Found the header but full section match failed");
  }
  process.exit(1);
}

content = content.replace(oldSection, newSection);
fs.writeFileSync(filePath, content);
console.log("PATCHED: Professional Consensus rules updated with field source integration");
