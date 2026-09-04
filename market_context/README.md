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
