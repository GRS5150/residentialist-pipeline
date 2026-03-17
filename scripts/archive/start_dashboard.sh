#!/bin/bash
cd /Users/Residentialist/.openclaw/workspace/residentialist/dashboard
pkill -f "node dashboard_server.js" 2>/dev/null
sleep 1
nohup node dashboard_server.js > /Users/Residentialist/dashboard.log 2>&1 &
echo "Dashboard PID: $!"
sleep 2
cat /Users/Residentialist/dashboard.log | tail -5
curl -s http://localhost:7824/api/products | head -100
