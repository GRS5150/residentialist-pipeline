#!/bin/bash
cd /Users/Residentialist/.openclaw/workspace/residentialist
node auto_runner.js "$@" > /tmp/pipeline_test.log 2>&1
echo "EXIT_CODE=$?" >> /tmp/pipeline_test.log
