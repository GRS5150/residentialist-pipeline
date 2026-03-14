# The Residentialist — Pipeline Roadmap

## Phase 6a — Source Parser (COMPLETE)
**Status:** Deployed March 14, 2026
**Commit:** c59c8e5

Checklist-driven per-source queries using Brave Search API. Each known source
type is queried individually, results classified into Pool A / B / C based on
domain rules. Integrates with auto_runner before pipeline execution. Merges
discovered sources into evidence files. Uses snippet text from search results
for source classification.

---

## Phase 6b — Full Page Fetching + AI Classification (FUTURE)

**Status:** Planned — revisit when snippet-based classification shows errors
**Priority:** Upgrade when needed — not urgent while snippets are accurate
**Trigger:** If source misclassification causes scoring errors, this is the fix

### What it does
Replace snippet-based source classification with full page fetching and AI-driven
content extraction. Instead of relying on the ~160-character snippet from Brave
search results, Phase 6b would:

1. Fetch the full HTML page for each discovered source URL
2. Extract the relevant content (article text, forum post, review body)
3. Send extracted content to an AI classifier to determine:
   - Pool classification (A/B/C) based on actual content, not just domain
   - Sentiment analysis from full context
   - Price-bias detection from complete text
   - Specific claims extraction (U-factors, complaint details, etc.)

### Why wait
- Snippets are working well enough for pool classification (domain-based rules)
- Full page fetching adds significant latency (fetch + parse per URL)
- AI classification per page adds cost (~$0.01-0.03 per page with Haiku)
- We need real error data to know WHERE snippets fail before optimizing

### When to build
- Source parser misclassifies Pool A content as Pool C (or vice versa)
- Sentiment derived from snippets contradicts what the full page says
- Bot 2 makes scoring errors traceable to incomplete source data
- Ray or the pipeline identifies a pattern of snippet-related inaccuracies

### Estimated scope
- URL fetching module with timeout, retry, robots.txt respect
- HTML-to-text extraction (readability algorithm)
- AI classification prompt (Haiku-class model)
- Integration with existing source_parser.js (swap snippet → full text)
- ~200-400 lines of new code, 1-2 day build

### Cost estimate
- Per product scored: ~15-30 page fetches × $0.01-0.03 each = $0.15-0.90 in AI
- Adds ~30-60 seconds of latency per product (page fetch + AI calls)
- Brave API cost unchanged (same queries, just fetching result URLs too)

---

## Other Planned Items

### Clad vs Non-Clad Separate Ratings
**Status:** Confirmed by Ray — needs implementation
Products with clad and non-clad variants should be rated separately (e.g.,
Marvin Ultimate vs Marvin Signature). Currently scored as a single product.

### Dashboard for Escalations
**Status:** Ray requested — not yet designed
Replace Telegram-based escalation alerts with a back-end dashboard that presents
decisions cleanly. Reduces Telegram clutter.

### Faucets Category
**Status:** On hold per Ray's instruction
Windows-only for now. Faucet scoring deferred.
