# Dashboard Deployment Guide

Get the Next.js dashboard live on port 3000 in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- Database initialized: `sqlite3 residentialist.db < mission-control/db/schema.sql`
- `.env` file configured in `/home/ubuntu/.openclaw/workspace/residentialist/`

## Quick Deploy

### Step 1: Install Dependencies

```bash
cd /home/ubuntu/.openclaw/workspace/residentialist/mission-control/dashboard
npm install
```

This installs:
- `next` (Next.js framework)
- `react` and `react-dom` (UI library)
- `better-sqlite3` (synchronous SQLite driver)
- `axios` (HTTP client for API calls)

**If `better-sqlite3` fails to build:**

```bash
sudo apt install build-essential python3
npm install --build-from-source better-sqlite3
```

### Step 2: Run Development Server

```bash
npm run dev
```

You should see:
```
> next dev -p 3000

  ▲ Next.js 14.0.0
  - Local:        http://localhost:3000
  - Environments: .env

✓ Ready in 1.2s
```

### Step 3: Open Dashboard

Visit: **http://localhost:3000**

You should see:
- Purple header with "The Residentialist — Mission Control"
- 4 tabs: Queue, Pipeline, Completed, Review Queue
- Forms and panels for managing evaluations and spec sheets

## Running in Background

To keep the dashboard running after you close the terminal:

```bash
nohup npm run dev > dashboard.log 2>&1 &
```

To view logs:
```bash
tail -f /home/ubuntu/.openclaw/workspace/residentialist/mission-control/dashboard/dashboard.log
```

To stop the server:
```bash
pkill -f "next dev"
```

## Production Deployment

For production (Nginx reverse proxy, PM2, etc.):

```bash
# Build optimized bundle
npm run build

# Start production server
npm start
```

Then configure Nginx/Apache to reverse proxy to `http://localhost:3000`.

## Dashboard Features Checklist

When dashboard is running, verify:

- [ ] **Queue panel**: Can create new evaluations
  - Test: Fill form and click "Start Evaluation"
  - Should appear in queue list
  
- [ ] **Pipeline panel**: Shows active evaluations
  - Test: Manually update status in database or trigger bot orchestrator
  - Should appear in pipeline with activity log
  
- [ ] **Completed panel**: Shows finished evaluations
  - Test: Set status to "Ready_To_Generate" in database
  - Should appear with scores and calibration comparison
  
- [ ] **Review Queue panel**: Shows spec sheets
  - Test: Email a test file to danvandertel@gmail.com
  - IMAP monitor should parse it
  - Should appear in Review Queue for approval

## API Endpoints

Test the API directly:

```bash
# Get queue
curl http://localhost:3000/api/evaluations?status=queue

# Get pipeline
curl http://localhost:3000/api/evaluations?status=pipeline

# Get completed
curl http://localhost:3000/api/evaluations?status=completed

# Get review queue
curl http://localhost:3000/api/spec-sheets

# Get activity log
curl http://localhost:3000/api/activity
```

## Database Inspection

Check what's in the database while the dashboard is running:

```bash
cd /home/ubuntu/.openclaw/workspace/residentialist

# List evaluations
sqlite3 residentialist.db "SELECT eval_id, product_name, status FROM evaluations LIMIT 5;"

# List spec sheets
sqlite3 residentialist.db "SELECT spec_id, property_address, status FROM spec_sheets LIMIT 5;"

# Check activity log
sqlite3 residentialist.db "SELECT activity_type, message, created_at FROM activity_log ORDER BY created_at DESC LIMIT 10;"
```

## Troubleshooting

### Dashboard won't start

```bash
# Clear Next.js cache
rm -rf .next

# Try again
npm run dev
```

### Port 3000 in use

```bash
# Find process using port 3000
lsof -i :3000

# Kill it
kill -9 <PID>

# Or use different port
npm run dev -- -p 3001
```

### API returns 500 error

Check the terminal logs for the actual error. Common issues:
- Database not initialized
- Database file permissions (should be rw for user)
- .env file missing DATABASE_PATH

### Spec sheets not showing in Review Queue

1. Make sure IMAP monitor is running: `node mission-control/scripts/imap_monitor.js`
2. Check database: `sqlite3 residentialist.db "SELECT COUNT(*) FROM spec_sheets;"`
3. Send a test email with an attachment to danvandertel@gmail.com
4. Wait 5 minutes for IMAP monitor to poll
5. Refresh dashboard

## Integration with Bot Orchestrator

When evaluations are started via dashboard:

1. Dashboard calls `POST /api/evaluations`
2. Creates evaluation record in database with status `Queued`
3. **Next step** (not yet automated): Bot orchestrator reads queued items and spawns Bot 1
4. Activity log tracks all bot progress
5. Completed panel shows final scores when done

Currently the bot spawning is manual. To automate it, wire up the orchestrator to:
- Poll for `status = 'Queued'` evaluations
- Call `orchestrator.startEvaluation(eval_id)` for each
- Monitor sub-agent completion and trigger handoffs

## File Locations

- **Dashboard**: `/home/ubuntu/.openclaw/workspace/residentialist/mission-control/dashboard/`
- **Database**: `/home/ubuntu/.openclaw/workspace/residentialist/residentialist.db`
- **Logs**: `/home/ubuntu/.openclaw/workspace/residentialist/mission-control/dashboard/dashboard.log`
- **Config**: `/home/ubuntu/.openclaw/workspace/residentialist/.env`

## What's Next

Once dashboard is running:

1. **Test queue panel**: Create a test evaluation
2. **Check database**: Verify it appears in evaluations table
3. **Wire up bot orchestrator**: Manually trigger Bot 1 on queued items
4. **Test spec sheet flow**: Email a spec sheet, approve it in Review Queue
5. **Monitor activity log**: See all state changes in real-time

---

**Status**: ✅ Ready to deploy  
**Port**: 3000  
**Database**: residentialist.db  

Run `npm run dev` to go live.
