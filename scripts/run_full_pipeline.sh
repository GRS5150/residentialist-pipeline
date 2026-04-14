#!/bin/bash
# =============================================================================
# run_full_pipeline.sh — Full category pipeline: Research → Deep Dives → Investigator
#
# Usage:  bash scripts/run_full_pipeline.sh <category>
# Example: nohup bash scripts/run_full_pipeline.sh tile > logs/tile.log 2>&1 &
#
# Phases:
#   1. Perplexity Research (4 passes)          — scripts/run_research.js
#   1b. Citation Extraction (0-citation files) — scripts/extract_citations.js
#   2. Per-Product Deep Dives                  — scripts/run_deep_dives.js
#   2b. Citation Extraction (0-citation dives) — scripts/extract_citations.js
#   3. Investigator Bot (reports + git push)   — scripts/run_investigator.js
# =============================================================================

set -euo pipefail

CATEGORY="${1:?Usage: bash scripts/run_full_pipeline.sh <category>}"
ROOT="/Users/Residentialist/.openclaw/workspace/residentialist"
NODE="/usr/local/bin/node"
LOG_PREFIX="[${CATEGORY}]"

cd "$ROOT"

# Load only the API keys we need (the .env has unquoted values that break `source`)
export PERPLEXITY_API_KEY=$(grep PERPLEXITY_API_KEY .env | cut -d= -f2)
export ANTHROPIC_API_KEY=$(grep ANTHROPIC_API_KEY .env | cut -d= -f2)
export TELEGRAM_BOT_TOKEN=$(grep TELEGRAM_BOT_TOKEN .env | cut -d= -f2)
export TELEGRAM_CHAT_ID=$(grep TELEGRAM_CHAT_ID .env | cut -d= -f2)

echo "${LOG_PREFIX} =========================================="
echo "${LOG_PREFIX} FULL PIPELINE START: $(date)"
echo "${LOG_PREFIX} Category: ${CATEGORY}"
echo "${LOG_PREFIX} =========================================="

# ─── Phase 1: Perplexity Research (Passes 1-4) ──────────────────────────────
echo ""
echo "${LOG_PREFIX} ── Phase 1: Research ──────────────────────"
echo "${LOG_PREFIX} Starting at $(date)"

if "${NODE}" scripts/run_research.js "${CATEGORY}"; then
    echo "${LOG_PREFIX} ✅ Phase 1 COMPLETE at $(date)"
else
    echo "${LOG_PREFIX} ❌ Phase 1 FAILED at $(date)"
    echo "${LOG_PREFIX} research exited with code $?"
    exit 1
fi

# ─── Phase 1b: Citation Extraction for 0-citation research files ─────────────
echo ""
echo "${LOG_PREFIX} ── Phase 1b: Citation Extraction (research) ─"
echo "${LOG_PREFIX} Checking for 0-citation research files..."
"${NODE}" scripts/extract_citations.js "${CATEGORY}" --batch || echo "${LOG_PREFIX} ⚠️  Citation extraction had errors (non-fatal)"

# ─── Phase 2: Per-Product Deep Dives ────────────────────────────────────────
echo ""
echo "${LOG_PREFIX} ── Phase 2: Deep Dives ────────────────────"
echo "${LOG_PREFIX} Starting at $(date)"

if "${NODE}" scripts/run_deep_dives.js "${CATEGORY}"; then
    echo "${LOG_PREFIX} ✅ Phase 2 COMPLETE at $(date)"
else
    echo "${LOG_PREFIX} ❌ Phase 2 FAILED at $(date)"
    echo "${LOG_PREFIX} deep_dives exited with code $?"
    exit 2
fi

# ─── Phase 2b: Citation Extraction for 0-citation deep dives ────────────────
echo ""
echo "${LOG_PREFIX} ── Phase 2b: Citation Extraction (deep dives) ─"
echo "${LOG_PREFIX} Checking for 0-citation deep dive files..."
"${NODE}" scripts/extract_citations.js "${CATEGORY}" --batch || echo "${LOG_PREFIX} ⚠️  Citation extraction had errors (non-fatal)"

# ─── Phase 3: Investigator Bot ──────────────────────────────────────────────
echo ""
echo "${LOG_PREFIX} ── Phase 3: Investigator ──────────────────"
echo "${LOG_PREFIX} Starting at $(date)"

if "${NODE}" scripts/run_investigator.js "${CATEGORY}"; then
    echo "${LOG_PREFIX} ✅ Phase 3 COMPLETE at $(date)"
else
    echo "${LOG_PREFIX} ❌ Phase 3 FAILED at $(date)"
    echo "${LOG_PREFIX} investigator exited with code $?"
    exit 3
fi

# ─── Done ────────────────────────────────────────────────────────────────────
echo ""
echo "${LOG_PREFIX} =========================================="
echo "${LOG_PREFIX} FULL PIPELINE COMPLETE: $(date)"
echo "${LOG_PREFIX} =========================================="
