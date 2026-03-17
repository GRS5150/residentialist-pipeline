#!/bin/bash
cd /Users/Residentialist/.openclaw/workspace/residentialist
export $(cat .env | xargs)
nohup node bot_orchestrator_v3.js "Loewen" DH > /tmp/loewen_rerun.log 2>&1 &
echo $!
