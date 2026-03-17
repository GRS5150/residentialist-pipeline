#!/bin/bash
pkill -f telegram_listener 2>/dev/null
sleep 1
cd /Users/Residentialist/.openclaw/workspace/residentialist
nohup node telegram_listener.js >> /Users/Residentialist/telegram.log 2>&1 &
echo "telegram_listener started PID=$!"
