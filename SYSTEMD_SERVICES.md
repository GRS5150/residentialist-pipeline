# Systemd Services — Mission Control Auto-Start

**Status**: ✅ Both services active and running  
**Date**: March 7, 2026

---

## Services Installed

### 1. residentialist-dashboard.service
- **Status**: `active (running)`
- **Description**: The Residentialist Mission Control Dashboard
- **Runs**: `npm run dev` in `/home/ubuntu/.openclaw/workspace/residentialist/mission-control/dashboard`
- **User**: ubuntu
- **Port**: 3000
- **Memory Limit**: 512MB
- **CPU Limit**: 50%
- **Auto-Restart**: Yes (10 second delay on failure)
- **Auto-Start on Boot**: Yes

### 2. residentialist-imap.service
- **Status**: `active (running)`
- **Description**: The Residentialist IMAP Monitor
- **Runs**: `node mission-control/scripts/imap_monitor.js`
- **User**: ubuntu
- **Memory Limit**: 256MB
- **CPU Limit**: 25%
- **Auto-Restart**: Yes (10 second delay on failure)
- **Auto-Start on Boot**: Yes

---

## Configuration

Both services:
- Load environment variables from `/home/ubuntu/.openclaw/workspace/residentialist/.env`
- Run as the `ubuntu` user
- Log to systemd journal (view with `journalctl`)
- Auto-restart on crash (restart delay: 10 seconds)
- Set resource limits to prevent runaway processes

### Service Files Location
```
/etc/systemd/system/residentialist-dashboard.service
/etc/systemd/system/residentialist-imap.service
```

### Backup Copies
```
/home/ubuntu/.openclaw/workspace/residentialist/systemd/residentialist-dashboard.service
/home/ubuntu/.openclaw/workspace/residentialist/systemd/residentialist-imap.service
```

---

## Managing Services

### Check Status
```bash
sudo systemctl status residentialist-dashboard.service
sudo systemctl status residentialist-imap.service
```

### View Logs
```bash
# Dashboard logs (last 50 lines, follow in real-time)
sudo journalctl -u residentialist-dashboard.service -n 50 -f

# IMAP logs (last 50 lines, follow in real-time)
sudo journalctl -u residentialist-imap.service -n 50 -f

# Both combined
sudo journalctl -u residentialist-dashboard.service -u residentialist-imap.service -n 100 -f
```

### Start/Stop Services
```bash
# Start
sudo systemctl start residentialist-dashboard.service
sudo systemctl start residentialist-imap.service

# Stop
sudo systemctl stop residentialist-dashboard.service
sudo systemctl stop residentialist-imap.service

# Restart
sudo systemctl restart residentialist-dashboard.service
sudo systemctl restart residentialist-imap.service

# Restart both
sudo systemctl restart residentialist-dashboard.service residentialist-imap.service
```

### Enable/Disable Auto-Start on Boot
```bash
# Enable (auto-start on boot)
sudo systemctl enable residentialist-dashboard.service
sudo systemctl enable residentialist-imap.service

# Disable (don't auto-start on boot)
sudo systemctl disable residentialist-dashboard.service
sudo systemctl disable residentialist-imap.service
```

### Reload Service Configuration
```bash
# If you edit the service files, reload systemd
sudo systemctl daemon-reload

# Then restart the services
sudo systemctl restart residentialist-dashboard.service residentialist-imap.service
```

---

## What's Running Now

### Dashboard
- **URL**: http://localhost:3000
- **Process**: `npm run dev` → Next.js dev server
- **Status**: 4 React components active (Queue, Pipeline, Completed, Review Queue)
- **Database**: Connected to `/home/ubuntu/.openclaw/workspace/residentialist/residentialist.db`
- **Memory**: ~324MB
- **CPU**: Active compilation and serving

### IMAP Monitor
- **Status**: Connected to danvandertel@gmail.com
- **Function**: Polls every 5 minutes for spec sheet emails
- **Database**: Connected and logging activity
- **Memory**: ~17.5MB
- **Last Action**: Opened INBOX, no new emails

---

## Boot Behavior

Both services are **enabled** and will auto-start on system reboot:

```bash
# Verify enabled status
sudo systemctl is-enabled residentialist-dashboard.service
sudo systemctl is-enabled residentialist-imap.service

# Should output: enabled
```

On next reboot:
1. System starts up
2. Systemd loads both services
3. IMAP monitor starts first (no dependencies)
4. Dashboard starts after network is ready (After=network.target)
5. Both begin running immediately

---

## Crash Recovery

If either service crashes:

1. Systemd detects the process exit
2. Waits 10 seconds (RestartSec=10)
3. Automatically restarts the process
4. Logs the restart event to journal

**Example**: If IMAP monitor crashes, it will restart automatically within 10 seconds.

To check restart history:
```bash
sudo journalctl -u residentialist-imap.service | grep "Restart"
```

---

## Troubleshooting

### Service Won't Start
```bash
# Check detailed error
sudo journalctl -u residentialist-dashboard.service -n 50

# Common issues:
# - Port 3000 already in use
# - Database file permissions
# - Missing .env file
# - Node.js not in PATH
```

### Port 3000 Already in Use
```bash
# Find what's using port 3000
sudo lsof -i :3000

# Kill the process
sudo kill -9 <PID>

# Restart the service
sudo systemctl restart residentialist-dashboard.service
```

### Database Permission Errors
```bash
# Check database ownership
ls -la /home/ubuntu/.openclaw/workspace/residentialist/residentialist.db

# Should be owned by ubuntu
sudo chown ubuntu:ubuntu /home/ubuntu/.openclaw/workspace/residentialist/residentialist.db
sudo chmod 664 /home/ubuntu/.openclaw/workspace/residentialist/residentialist.db
```

### IMAP Monitor Won't Connect
```bash
# Check .env is readable
sudo journalctl -u residentialist-imap.service | grep -i "dotenv\|auth\|error"

# Verify credentials in .env
cat /home/ubuntu/.openclaw/workspace/residentialist/.env | grep EMAIL
```

---

## Resource Usage

Current limits:
- **Dashboard**: 512MB memory, 50% CPU
- **IMAP Monitor**: 256MB memory, 25% CPU

To adjust limits, edit the service files:
```bash
sudo nano /etc/systemd/system/residentialist-dashboard.service
```

Look for:
```
MemoryMax=512M
CPUQuota=50%
```

After editing, reload and restart:
```bash
sudo systemctl daemon-reload
sudo systemctl restart residentialist-dashboard.service
```

---

## Email Policy Reminder
- **Today**: Zero emails (blackout) ✅
- **Tomorrow onwards**: 1 email per day maximum
- IMAP monitor is watching, but no outbound emails until authorized

---

## Files & Paths

```
Service Files:
  /etc/systemd/system/residentialist-dashboard.service
  /etc/systemd/system/residentialist-imap.service

Backups:
  /home/ubuntu/.openclaw/workspace/residentialist/systemd/residentialist-dashboard.service
  /home/ubuntu/.openclaw/workspace/residentialist/systemd/residentialist-imap.service

Database:
  /home/ubuntu/.openclaw/workspace/residentialist/residentialist.db

Configuration:
  /home/ubuntu/.openclaw/workspace/residentialist/.env

Dashboard:
  http://localhost:3000
```

---

## Summary

✅ **Dashboard**: Running on port 3000, auto-restart enabled, auto-start on boot enabled  
✅ **IMAP Monitor**: Running and polling, auto-restart enabled, auto-start on boot enabled  
✅ **Both services**: Logging to systemd journal, resource limits set  
✅ **Environment**: Loading from shared .env file  
✅ **Boot behavior**: Both will start automatically on system restart  

System is production-ready with automatic recovery from crashes.

---

*Last Updated: March 7, 2026*  
*Managed via: systemctl*
