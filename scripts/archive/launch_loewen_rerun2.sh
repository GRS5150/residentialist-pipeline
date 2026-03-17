#!/bin/bash
cd /Users/Residentialist/.openclaw/workspace/residentialist
export $(cat .env | xargs)
nohup node bot_orchestrator_v3.js "Loewen" DH ./inputs/loewen_dh_supplemental_research.md > /tmp/loewen_rerun2.log 2>&1 &
echo $!
