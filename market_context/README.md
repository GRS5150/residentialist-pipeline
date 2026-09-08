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

## Brand normalization rules (locked with Ray 2026-09-08)

### 1. Frequency never picks the canonical name
Which spelling is correct is knowledge the crawler data does not contain. The
crawler harvests listing copy, and listing copy misspells confidently: the data
prefers "Carrera" over "Carrara" and "Consentino" over "Cosentino". Counting rows
gets the canonical name backwards often enough to corrupt the brand taxonomy,
which is the asset.

The canonical name comes from the curated authority list in
`cleanup.py` (`CANONICAL_AUTHORITY`). Frequency is the fallback **only** when no
group member matches the list, and anything chosen that way should be reviewed
and promoted into the list. Do not replace this with a frequency heuristic, in
that script or any successor.

### 2. The one-typo merge rule
Merge two brand names when they differ only by spacing, punctuation, casing, or
one obvious typo, implemented as a single character edit on a name of six or more
characters. Spacing, punctuation, and casing collapse before comparison, so what
the rule actually tests is character edits.

Leave the pair flagged when the two names could plausibly be two different
companies. Small counts are not a reason to merge.

### 3. Locked-distinct names
Variants are matched with union-find, so chains collapse to one canonical rather
than a chain (`Remi-halo` -> `Rem-Halo` -> `Reme Halo` must end at `Reme Halo`).
Transitive closure can route around a blocked pair, so genuinely distinct names
that sit one edit apart are hard-excluded in `NEVER_MERGE_KEYS`:

- `WinDoor` — a real manufacturer, one edit from Windsor
- `Aquatic` / `Aquatica` — Aquatic Bath and Aquatica are separate firms
- `Belmont` / `Bellmont` — Bellmont Cabinets and Belmont, both plausible

### 4. Counting
Indexes are built **one count per home**, not one per spec row. Counting rows
inflates any brand that appears multiple times in a listing, and before the
Sept 8 dedupe it was inflating them from duplicate rows as well: Miele's
mid-band share and Crestron's were both duplication artifacts.

### 5. The public database number
Never quoted from memory. Recompute from the deduped listing count at publish
time, every time. The "more than 23,000 homes" line is retired; it counted
duplicate rows.
