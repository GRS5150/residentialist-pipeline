const fs = require("fs");
const filePath = "/Users/Residentialist/.openclaw/workspace/residentialist/bot_orchestrator_v3.js";
let code = fs.readFileSync(filePath, "utf8");

// Add Reddit searches after search 18
const oldSearchEnd = '18. Search: "[Product Name] VOC emissions indoor air quality certification Greenguard" — confirm or rule out air quality certifications';

const newSearchEnd = `18. Search: "[Product Name] VOC emissions indoor air quality certification Greenguard" — confirm or rule out air quality certifications

PHASE 3 — FIELD SOURCE RESEARCH (Reddit trade professionals):
19. Search: site:reddit.com "[Product Name]" window install review — find installer/contractor opinions
20. Search: site:reddit.com "[Manufacturer]" windows quality problems — find field complaints and praise
21. Search: site:reddit.com "[Product Name]" OR "[Manufacturer]" r/homeimprovement OR r/construction OR r/homebuilding — broader trade discussion
22. For each Reddit user found expressing a substantive product opinion, assess their qualification:
    - Check their karma (visible on profile), account age, and subreddit activity
    - Look for technical vocabulary (specific components, installation practices, failure modes)
    - Check if they discuss multiple brands (not single-brand advocate)
    - Disqualify if they show commercial affiliation, referral links, or astroturfing patterns
    - Pre-qualified users from verified_field_sources.json in the knowledge base do NOT need re-qualification
23. Record each qualified field source opinion with: username, estimated credibility (1-10), their product verdict, and key reasoning
24. If 3+ qualified field sources are found for this product, note the trimmed mean sentiment and whether it agrees or diverges from publication/certification signals`;

if (!code.includes(oldSearchEnd)) {
  console.log("ERROR: Could not find search 18 marker");
  process.exit(1);
}

code = code.replace(oldSearchEnd, newSearchEnd);

// Also add field source section to the output format
const oldCriticalTargets = "CRITICAL DATA TARGETS";
const newCriticalTargets = `7. FIELD SOURCE OPINIONS — qualified Reddit/forum professionals found, their product verdicts, credibility assessment, and whether field consensus agrees with or diverges from publication/certification signals. If no qualified field sources found, note "No qualified field sources identified for this product."

CRITICAL DATA TARGETS`;

code = code.replace(oldCriticalTargets, newCriticalTargets);

fs.writeFileSync(filePath, code);
console.log("PATCHED Bot 1: Added Reddit search queries (Phase 3) and field source output section");
