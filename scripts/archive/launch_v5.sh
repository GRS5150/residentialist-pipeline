#!/bin/bash
cd /Users/Residentialist/.openclaw/workspace/residentialist
nohup node staging_full_clean_v5.js > outputs/staging_full_clean_v5_log.txt 2>&1 &
echo $!
