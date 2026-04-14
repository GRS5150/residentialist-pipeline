#!/bin/bash
export PATH=/usr/local/bin:/usr/bin:/bin
cd /Users/Residentialist/.openclaw/workspace/residentialist
export OPENCLAW_WORKSPACE=/Users/Residentialist/.openclaw/workspace/residentialist
set -a; source .env; set +a
export OPENCLAW_WORKSPACE=/Users/Residentialist/.openclaw/workspace/residentialist
/usr/local/bin/node deep_dive_pipeline.js "Pella 250 Series" "double_hung"
echo PIPELINE_DONE
