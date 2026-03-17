#!/bin/bash
set -e
cd /Users/Residentialist/.openclaw/workspace/residentialist

# Configure git
git config user.email "residentialist@residentialist.com"
git config user.name "Residentialist Pipeline"

# 1. Stage dashboard files
git add dashboard/

# 2. Stage pipeline fixes (2A evidence hierarchy, reconciliation bot)
git add bot_orchestrator_v3.js
git add reconciliation_bot.js

# 3. Stage batch rescore infrastructure  
git add batch_rescore.js
git add start_dashboard.sh

# 4. Stage updated evidence files (rescored products)
git add evidence/*.json

# 5. Stage knowledge/correction memos
git add knowledge/

# 6. Stage updated inputs
git add inputs/

# 7. Stage bridge update (dashboard proxy route)
git add claude_bridge.js

# 8. Stage auto_runner changes
git add auto_runner.js

# Show what will be committed
echo "=== STAGED FILES ==="
git diff --cached --stat

echo ""
echo "=== COMMITTING ==="
git commit -m "Phase 9: Score dashboard + batch rescore + 2A evidence fix

Dashboard:
- Score oversight dashboard with admin/public toggle
- Score tree drill-down with axes breakdown (Q35/D35/P30)
- Source pool explorer with confidence levels
- Material safety section with flags
- Admin mode shows full source details (usernames, forums)
- Runs on port 7824, proxied through bridge at /scores
- Auto-start via launchd (com.residentialist.dashboard.plist)

Pipeline fixes:
- 2A evidence hierarchy: certification floor logic for undisclosed specs
- Reconciliation bot v3.1: proper scope handling
- Batch rescore infrastructure for full windows re-evaluation

Evidence:
- Updated evidence files from Phase 9 batch rescore
- New correction memos for resolved escalations"

echo ""
echo "=== PUSHING ==="
git push origin main 2>&1

echo ""
echo "=== DONE ==="
git log --oneline -3
