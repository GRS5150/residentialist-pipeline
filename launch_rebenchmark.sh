#!/bin/bash
cd /Users/Residentialist/.openclaw/workspace/residentialist
nohup node rebenchmark_batch.js > /Users/Residentialist/rebenchmark.log 2>&1 &
echo "PID: $!"
