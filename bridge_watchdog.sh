#!/bin/bash
# THE RESIDENTIALIST — bridge_watchdog.sh
# Monitors the bridge process and auto-restarts if it dies.
# Also watches ngrok. Run this ONCE and leave it running.
#
# Usage: nohup bash bridge_watchdog.sh >> ~/watchdog.log 2>&1 &

WORKSPACE="/Users/Residentialist/.openclaw/workspace/residentialist"
BRIDGE_PORT=7823
CHECK_INTERVAL=5  # seconds between checks

echo "[WATCHDOG] Started at $(date)"

while true; do
  # Check if bridge is listening on port
  if ! lsof -i :$BRIDGE_PORT -sTCP:LISTEN > /dev/null 2>&1; then
    echo "[WATCHDOG] $(date) — Bridge is DOWN. Restarting..."
    
    # Kill any zombie processes on the port
    kill $(lsof -ti:$BRIDGE_PORT) 2>/dev/null
    sleep 2
    
    # Start bridge
    cd "$WORKSPACE"
    nohup node claude_bridge.js >> ~/bridge.log 2>&1 &
    BRIDGE_PID=$!
    echo "[WATCHDOG] Bridge started (PID $BRIDGE_PID)"
    
    # Give it a moment to bind
    sleep 3
    
    # Verify it started
    if lsof -i :$BRIDGE_PORT -sTCP:LISTEN > /dev/null 2>&1; then
      echo "[WATCHDOG] Bridge confirmed running on port $BRIDGE_PORT"
    else
      echo "[WATCHDOG] WARNING: Bridge failed to start. Will retry in $CHECK_INTERVAL seconds."
    fi
  fi
  
  # Check if ngrok is running
  if ! pgrep -x ngrok > /dev/null 2>&1; then
    echo "[WATCHDOG] $(date) — ngrok is DOWN. Restarting..."
    nohup ngrok http $BRIDGE_PORT --domain=lavonne-instructorless-northwestwardly.ngrok-free.dev >> ~/ngrok.log 2>&1 &
    echo "[WATCHDOG] ngrok restarted"
    sleep 5
  fi
  
  sleep $CHECK_INTERVAL
done
