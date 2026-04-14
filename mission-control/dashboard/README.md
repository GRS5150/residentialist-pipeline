# Mission Control Dashboard

The Next.js dashboard for The Residentialist — provides real-time visibility into the evaluation pipeline and spec sheet review queue.

## Quick Start

### 1. Install Dependencies

```bash
cd /home/ubuntu/.openclaw/workspace/residentialist/mission-control/dashboard
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

The dashboard will be available at: **http://localhost:3000**

### 3. Build for Production

```bash
npm run build
npm start
```

## Features

### Queue Panel
- View all products waiting for evaluation
- Create new evaluations with:
  - Product name, product line, configuration
  - Category selection (Windows, Cabinets, HVAC, etc.)
  - Priority (Low, Normal, High)
- Real-time queue count

### Pipeline Panel
- See all active evaluations in progress
- Real-time bot status (Bot 1 Research → Bot 2 Scoring → Bot 3 Material Safety)
- Activity log showing every step of the pipeline
- Auto-refresh every 3 seconds when viewing an evaluation

### Completed Panel
- View all finished evaluations with final scores
- Calibration benchmarks (7 reference products)
- Display of:
  - Overall score and letter grade
  - Individual axis scores (Quality, Durability, Performance, Material Safety)
  - Rubric version for comparability
  - Sync status (Ready to Generate / Report Generated / Pending Sync / Synced)

### Review Queue Panel
- Incoming spec sheets pending human review
- For each spec sheet:
  - Property address, city, builder name
  - Extraction summary (products found by category)
  - Categories with product counts
  - Items flagged for manual review
- Approve or discard with optional notes
- Auto-updates when IMAP monitor receives new emails

## Database Connection

The dashboard connects to SQLite at:
```
/home/ubuntu/.openclaw/workspace/residentialist/residentialist.db
```

Database must be initialized first:
```bash
sqlite3 residentialist.db < mission-control/db/schema.sql
```

## API Routes

All data access goes through REST API routes in `pages/api/`:

- `GET /api/evaluations?status=queue` — Products in queue
- `GET /api/evaluations?status=pipeline` — Active evaluations
- `GET /api/evaluations?status=completed` — Finished evaluations
- `POST /api/evaluations` — Create new evaluation
- `GET /api/spec-sheets` — Spec sheets in review queue
- `GET /api/spec-sheets?id={spec_id}` — Full spec sheet details
- `POST /api/spec-sheets` — Approve/discard spec sheet
- `GET /api/activity` — Recent activity log
- `GET /api/activity?eval_id={eval_id}` — Activity for specific evaluation

## Auto-Refresh

- Main dashboard auto-refreshes every 10 seconds
- Activity log auto-updates every 3 seconds when selected
- Manual refresh button at top right

## Styling

The dashboard uses inline CSS with:
- Linear gradient header (purple/violet theme)
- Clean, minimal design
- Responsive layout for mobile/tablet
- Accessible form inputs and buttons

## Environment Variables

The dashboard reads from `.env` in the parent directory:
```
DATABASE_PATH=/home/ubuntu/.openclaw/workspace/residentialist/residentialist.db
```

## Troubleshooting

**"Cannot find module 'better-sqlite3'"**
- Run: `npm install better-sqlite3`
- May require build tools (g++, python3)

**"ENOENT: no such file or directory, open 'residentialist.db'"**
- Make sure database is initialized:
  ```bash
  sqlite3 /home/ubuntu/.openclaw/workspace/residentialist/residentialist.db < mission-control/db/schema.sql
  ```

**Port 3000 already in use**
- Change port: `npm run dev -- -p 3001`

**Spec sheets not showing in Review Queue**
- Make sure IMAP monitor is running and spec sheets are being parsed
- Check database: `sqlite3 residentialist.db "SELECT COUNT(*) FROM spec_sheets;"`

## Files Structure

```
dashboard/
├── pages/
│   ├── _app.jsx          # Next.js app wrapper
│   ├── index.jsx         # Main dashboard page
│   └── api/
│       ├── evaluations.js
│       ├── spec-sheets.js
│       └── activity.js
├── components/
│   ├── Queue.jsx         # Products waiting panel
│   ├── Pipeline.jsx      # Active evaluations panel
│   ├── Completed.jsx     # Finished evaluations panel
│   └── ReviewQueue.jsx   # Spec sheets review panel
├── lib/
│   └── db.js             # SQLite database wrapper
├── package.json
├── next.config.js
└── README.md
```

## Notes

- Dashboard is read-write for creating evaluations and reviewing spec sheets
- Pipeline and Completed panels are read-only (updates driven by bot orchestrator)
- All database writes are atomic (SQLite WAL mode)
- Activity log provides full audit trail of all changes

---

**Status**: Production-ready | **Last Updated**: March 7, 2026
