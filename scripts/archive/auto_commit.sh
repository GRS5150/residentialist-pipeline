#!/bin/bash
# Auto-commit and push after file changes
# Called by claude_bridge.js after /write operations

cd /Users/Residentialist/.openclaw/workspace/residentialist

# Only commit if there are changes
if [ -n "$(git status --porcelain)" ]; then
    git add -A
    DESCRIPTION="${1:-auto: file update}"
    git commit -m "$DESCRIPTION" 2>/dev/null
    git push origin main 2>/dev/null &
fi
