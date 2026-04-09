# ADDENDUM TO UNIFIED SYSTEM DOC v4
## Curation File JSON Schema — March 30, 2026
## Add this as Section 12.5 (between File Locations and Prior System Reference)

---

## 12.5 CURATION FILE FORMAT (Pipeline JSON Schema)

The Sonnet structurer (Step 2) outputs curation files as JSON. All downstream pipeline steps — source verification, spec verification, human curation dashboard, tier classification, Haiku audit, and investigator bot — consume this format. Manually structured curation files must match this schema exactly.

### File Location
`curation/{product_slug}_{operation_type}_sources.json` (windows)
`curation/{product_slug}_sources.json` (cabinets, countertops, faucets)

### Complete Schema

```json
{
  "product": "Full Product Name",
  "report_date": "2026",
  "sources": [
    {
      "id": "SRC-001",
      "source_name": "Human-readable source name",
      "url": "https://...",
      "platform": "youtube|reddit|houzz|gba|other",
      "column": "expert|review|forum",
      "snippet": "Substantive finding text — what this source says about the product",
      "pool": "S|A|B|C",
      "classification": "score|report_only|quarantine",
      "classification_reason": "Why this classification was assigned",
      "topics": ["quality", "performance", "durability", "specs", "service"],
      "verification_relevance": "relevant"
    }
  ],
  "bottom_line": "Summary paragraph synthesizing all scored evidence into a coherent product assessment.",
  "scoring_notes": {
    "sources_scored": ["SRC-001", "SRC-002"],
    "sources_report_only": ["SRC-010"],
    "sources_quarantined": ["SRC-006"],
    "pool_distribution": {
      "pool_S": 0,
      "pool_A": 2,
      "pool_B": 7,
      "pool_C": 20
    }
  },
  "product_slug": "lowercase_underscore_name",
  "product_name": "Display Name",
  "manufacturer_slug": "lowercase_manufacturer",
  "operation_type": "casement|double_hung|null",
  "deep_dive_date": "2026-03-30",
  "structuring_duration_ms": 171408,
  "structuring_model": "claude-sonnet-4-6",
  "auto_classification_summary": {
    "total": 29,
    "score": 10,
    "report_only": 7,
    "quarantine": 12
  },
  "curation_status": "staged",
  "curation_date": null,
  "human_overrides": [],
  "structuring_cost_estimate": 0.16,
  "verification_date": "2026-03-23T19:45:07.877Z"
}
```

### Field Notes

**sources[].column:** Maps to the three-column structure.
- `expert` = Pool A/S sources (professional reviewers, building science experts, manufacturer specs)
- `review` = Pool B sources (trade publications, experienced reviewers, authorized dealers)
- `forum` = Pool C sources (Reddit, Houzz consumers, Yelp, BBB)

**sources[].classification:**
- `score` = Finding contributes to tier classification and scoring
- `report_only` = Finding appears in buyer report but does NOT affect score (lawsuits, warranty terms, corporate risk, finish care guidance, material safety)
- `quarantine` = Finding excluded from scoring due to source quality, relevance, or verification failure

**sources[].topics:** Array of relevant scoring axes. Valid values: `quality`, `performance`, `durability`, `specs`, `service`.

**sources[].pool:** Source weight pool assignment per methodology (S=1.50x, A=1.00x, B=0.75x, C=0.40x).

**operation_type:** Used for windows only (casement, double_hung). Set to `null` for categories without operation variants (cabinets, countertops, faucets).

**structuring_model:** Set to `claude-sonnet-4-6` for pipeline-generated files. Set to `manual_structuring` for hand-built curation files (e.g., cabinet calibration products structured from Perplexity browser output).

**structuring_duration_ms / structuring_cost_estimate:** Set to `0` for manually structured files. Pipeline fills these automatically.

**curation_status:** `staged` = ready for human review. `curated` = human has reviewed and approved classifications. `scored` = score has been calculated.

**verification_date:** Set by source verification step (Step 3). `null` if not yet verified.

### Manually Building Curation Files

When deep dives are run in Perplexity browser (not through the API), curation files must be manually structured to match this schema. The process:

1. Run Perplexity deep dive using category-specific prompt template
2. Save raw output as reference material
3. Structure each source finding into the `sources` array with correct pool, column, and classification
4. Write `bottom_line` summary
5. Populate `scoring_notes` with source ID lists and pool distribution counts
6. Set metadata fields (`product_slug`, `manufacturer_slug`, etc.)
7. Set `structuring_model` to `manual_structuring` and duration/cost to `0`
8. Validate JSON before placing in `curation/` directory

---

*This schema was documented March 30, 2026 based on inspection of production curation file: `marvin_signature_ultimate_double_hung_sources.json`*
