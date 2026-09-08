# Market Context Layer (added 2026-09-01)

Purpose: price-band market context for every product run through the scoring
pipeline. Answers "where does this product actually show up?" so reports can
flag out-of-band installs (premium product in a cheap house, builder-grade in
a $5M house).

## Files
- market-context-index.json — compact index distilled from the spec-crawler
  database: 813 brand×category combos, price-band counts + state distribution,
  from 21,859 listings / 243,851 sightings (crawler backup of 2026-09-01).
- lookup.py — query tool. Usage: python3 lookup.py "Marvin" "Windows"

## Rules (locked with Ray 2026-09-01)
1. REPORT-ONLY. Market context never affects the composite score (same class
   as Material Safety).
2. Minimum 15 priced sightings before quoting a band profile; below that the
   report says "insufficient market data."
3. Always described as "mention share in listing copy," never install share.
   Walked-home data is the only install-grade evidence.

## Refreshing the index
The crawler DB backs up nightly to
s3://residentialist-knowledge/backups/spec-crawler/latest/spec-crawler.json (~173MB).
To refresh: download it, run rebuild_index.py, commit the new index.

## co-occurrence-index.json (added 2026-09-02)
Which brands appear together in the same home. Built from 12,738 listings
with named specs; pairs kept only at >= 20 shared listings (defensibility
floor). Keys are "Category|Brand && Category|Brand" with the shared-listing
count. brand_listing_counts gives each brand's per-listing base (>=15) for
computing conditional rates ("of Sub-Zero homes that name windows, X% say
Marvin"). Same rules as the market index: mention share, report-only,
never install share.

## windows-cleaned.json (added 2026-09-04)
Windows category brand names normalized (spelling variants merged, e.g.
Andersen/Anderson, Jeld-Wen's four spellings) and non-window products
removed (window treatments, screens, film, automation -- Hunter Douglas,
Lutron, Phantom Screens, Storm Smart, Silhouette, Plantation shutters,
Levolor, Somfy, 3M/LLumar film, and others -- 253 of 1,302 raw sightings,
about a fifth of the category, were never windows). Per-brand totals plus
price-band breakdown. Same rules: mention share, report-only, min-sample
floors still apply per band. This is the source for any Windows report or
article; do not use the old uncleaned windows numbers from
market-context-index.json going forward.
