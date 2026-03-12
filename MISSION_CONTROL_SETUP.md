# Mission Control Setup & Operation Guide

**Status:** Infrastructure built and ready for configuration
**Date:** March 7, 2026

---

## What's Been Built

### 1. **Database Schema** (`mission-control/db/schema.sql`)
- Evaluations pipeline table (queue, status, scores, reports)
- Spec sheets ingestion table (review queue, extraction results)
- Activity log (real-time dashboard updates)
- Product catalog (cache from Airtable)
- Telegram command log

### 2. **Spec Sheet Parser** (`mission-control/scripts/spec_sheet_parser.js`)
- Extracts products from spec sheets across 16 categories:
  - Windows, Cabinets, Countertops, Flooring, Faucets, Sinks, Toilets, HVAC
  - Range/Cooktop, Oven, Refrigerator, Dishwasher, Microwave, Vent Hood, Paint, Hot water heater
- Identifies high-confidence products (brand mentions = 0.9 confidence)
- Flags ambiguous items for manual review
- Cross-references extracted products against product catalog

### 3. **IMAP Monitor** (`mission-control/scripts/imap_monitor.js`)
- Watches configured email folder for spec sheet attachments
- Fetches emails with mailparser
- Parses and stores results in SQLite
- Triggers Telegram notifications
- Polling-based (no server required) — works with any IMAP provider (Gmail, Yahoo, Outlook, etc.)

### 4. **Bot Orchestrator** (`mission-control/scripts/bot_orchestrator.js`)
- Creates and manages evaluation entries
- Spawns three-bot pipeline sequentially:
  - Bot 1 (Consensus Bot) → research + certification gate
  - Bot 2 (Evaluator Bot) → Quality/Durability/Performance scores
  - Bot 3 (Material Safety Bot) → health/safety assessment
- Handles handoff between bots (Bot 2 waits for Bot 1 completion)
- Extracts scores and stores in database
- Logs all activity for dashboard
- Ready for integration with OpenClaw sessions_spawn

### 5. **Windows Knowledge Files** (Saved to `/residentialist/windows/`)
- `windows_eval_knowledge_v1.1.md` — Source hierarchy, frame/glass/hardware hierarchies, calibration benchmarks
- `windows_material_safety_knowledge_v1.1.md` — Frame material evaluation, certification floors, healthy homes source hierarchy
- `windows_deterministic_rubrics_v5.md` — Scoring tables for all Performance, Quality, Durability metrics
- `residentialist_universal_rubric_principles_v1.1.md` — 14 universal principles governing all categories
- `henley_windows_packet_v1.1.md` — Operator instructions, bot prompts, validation checklist, calibration products

### 6. **Configuration Template** (`.env.example`)
- IMAP email credentials
- Telegram bot token and chat ID
- Airtable API credentials (for future setup)
- Bot model selections
- Database and file paths

---

## Setup Checklist

### Phase 1: Configuration (Do This First)

- [ ] Copy `.env.example` to `.env`
- [ ] Fill in IMAP credentials:
  - Email address and app password (not regular password)
  - IMAP server (e.g., `imap.gmail.com` for Gmail)
  - Email folder name (e.g., "Spec Sheets" or "INBOX")
- [ ] Get Telegram bot token from @BotFather
- [ ] Fill in Telegram chat ID (your personal chat with the bot)
- [ ] Database path (default: `./residentialist.db`)

### Phase 2: Initialize Database

```bash
sqlite3 ./residentialist.db < mission-control/db/schema.sql
```

This creates all tables. Safe to run multiple times (uses CREATE TABLE IF NOT EXISTS).

### Phase 3: IMAP Monitor Setup

```bash
cd mission-control/scripts
npm install imap mailparser sqlite3
```

Test the monitor:
```bash
node imap_monitor.js
```

This will:
1. Connect to your email account
2. Check for new emails with attachments
3. Parse and store spec sheets in the database
4. Send Telegram notification when new spec sheet arrives

Once working, this can run as a background service or cron job.

### Phase 4: Dashboard (Next Priority)

Next step is to build the Next.js dashboard. This will be a separate file.

Structure will be:
```
mission-control/
  dashboard/
    pages/
      _app.jsx
      index.jsx (main dashboard)
      api/
        evaluations.js (CRUD)
        spec-sheets.js (CRUD)
        activity.js (real-time log)
    components/
      Queue.jsx (products waiting)
      Pipeline.jsx (bot progress + logs)
      Completed.jsx (scores, sync status)
      ReviewQueue.jsx (spec sheets, edit, approve/discard)
    lib/
      db.js (SQLite wrapper)
      api-client.js (backend API calls)
    styles/
      globals.css
```

### Phase 5: Telegram Integration

The orchestrator will send notifications via the message tool when:
- New spec sheet arrives: "New spec sheet received — [address], [city] ([builder]). Extracted X of 16. Y need review."
- Evaluation completes: "Evaluation ready: [product]. Overall: [score]. Click to review."

Telegram commands will be handled by sessions_spawn for `/eval [name] [line] [config]`.

### Phase 6: Airtable Sync (Later)

Currently placeholders:
- `AIRTABLE_API_KEY` and `AIRTABLE_BASE_ID` need to be configured
- Sync buttons on dashboard will format data for manual copy-paste until API is wired

---

## Database Schema Overview

### evaluations table
```
eval_id (PK)          # Unique ID for this evaluation
product_name          # e.g., "Marvin Elevate"
product_line          # e.g., "Elevate Series"
configuration         # e.g., "Double-Hung" or "DH"
category              # e.g., "Windows"
priority              # High/Normal/Low
status                # Queued → Bot1_Running → Bot1_Done → ... → Synced
bot1_output           # JSON: Consensus Bot research
bot2_output           # JSON: Scoring results
bot3_output           # JSON: Material Safety assessment
quality_score         # 1-10
durability_score      # 1-10
performance_score     # 1-10
overall_score         # Average of above
material_safety_score # 1-10 or NULL
rubric_version        # e.g., "windows_v5"
report_frontend       # Client-facing markdown
report_backend        # Internal markdown (full bot outputs)
airtable_synced       # Boolean
airtable_record_id    # ID from Airtable Products table
created_at            # Timestamp
updated_at            # Timestamp
```

### spec_sheets table
```
spec_id (PK)            # Unique ID
source                  # "Email" or "Manual_Upload"
property_address        # Extracted/entered
property_city           # Extracted/entered
builder_name            # From email sender
extracted_products      # JSON: [{category, item, confidence}, ...]
extraction_summary      # JSON: {Windows: 3, Cabinets: 2, ...}
categories_found        # Integer count of categories found
items_needing_review    # Count of flagged items
status                  # Pending_Review → In_Review → Approved → synced to Airtable
edited_products         # JSON: user corrections/additions during review
review_notes            # Text notes from Ray or VA
reviewed_by             # User ID who approved
review_timestamp        # When approved
airtable_synced         # Boolean
```

### activity_log table
```
activity_type           # "eval_created", "bot1_started", "spec_sheet_parsed", etc.
actor                   # "System", "User", "Bot1", "Bot2", "Bot3"
status_before           # "Queued" → "Bot1_Running" (for visibility)
status_after            # "Bot1_Running" → "Bot1_Done"
message                 # Human-readable description
created_at              # Timestamp for dashboard real-time updates
```

---

## Operation Workflow

### For Product Evaluations (Dashboard)

1. **Ray opens Mission Control dashboard**
   - Sees Queue panel (products waiting)
   - Sees Completed panel with calibration benchmarks:
     - Alpen Zenith ZR-7 (CSM): 8.70 (A-)
     - Marvin Elevate (DH): 8.20 (B+)
     - Internorm KF 410 (CSM): 7.84 (B)
     - Pella Lifestyle (CSM): 7.80 (B)
     - Andersen 400 (DH): 7.47 (B-)
     - JW Siteline (DH): 7.00 (B-)
     - JW V-2500 (DH): 5.70 (C)
   - Clicks "New Evaluation"
   - Enters: Product name, Line, Configuration, Category, Priority
   - Clicks "Start"

2. **Dashboard triggers bot orchestrator**
   - Creates evaluation record in SQLite
   - Spawns Bot 1 (Consensus Bot) via sessions_spawn
   - Moves to Pipeline panel

3. **Bot 1 completes**
   - Consensus Bot research stored
   - Automatically spawns Bot 2 (Evaluator Bot)
   - Dashboard shows "Bot 1 Done, Bot 2 Running..."

4. **Bot 2 completes**
   - Scores extracted and displayed
   - Compared against calibration benchmarks
   - Automatically spawns Bot 3 (Material Safety Bot)

5. **Bot 3 completes**
   - Material Safety score extracted
   - Status changes to "Ready_To_Generate"
   - Dashboard notification: "Review and generate report"

6. **Ray clicks "Generate Report"**
   - System assembles two-layer report (client-facing + internal)
   - Status changes to "Report_Generated"
   - Ray can view/edit before final output
   - Rubric version noted for comparability

7. **Ray clicks "Sync to Airtable"**
   - Currently: Displays formatted JSON for copy-paste
   - Future: API call writes to Airtable Products and Evaluation Log tables

### For Spec Sheet Ingestion (Email → IMAP Monitor)

1. **Builder sends spec sheet attachment via email**
   - Subject: "123 Maple St, Austin TX - John Builder"
   - Attachment: PDF or DOCX with product list

2. **IMAP monitor polls (every 5 minutes by default)**
   - Fetches new emails with attachments
   - Parses spec sheet content (text extraction)
   - Runs parser: identifies products across 16 categories

3. **Results stored in Review Queue**
   - Property address, builder name extracted
   - Products identified with confidence scores
   - Ambiguous items flagged

4. **Telegram notification sent to Ray**
   - "New spec sheet received — 123 Maple St, Austin TX (John Builder)"
   - "Extracted 12 of 16 categories. 3 items need review."
   - Link to Mission Control Review Queue

5. **Ray reviews in Review Queue panel**
   - Sees extracted products by category
   - Can edit/add missing products
   - Can add notes
   - Clicks "Approve" or "Discard"

6. **If Approved**
   - Products not yet in catalog are added to evaluation queue automatically (with "from spec sheet" tag)
   - Property/builder/installation data ready for Airtable sync

---

## Telegram Commands

Once integrated (bot spawning):

- `/eval Marvin Elevate DH` — Triggers new evaluation for Marvin Elevate double-hung
- `/status` — Shows active evaluations (planned)
- `/queue` — Shows products waiting (planned)

Automatic notifications (no command needed):
- Spec sheet arrival: "New spec sheet received..."
- Evaluation completion: "Ready to review..."

---

## Files & Locations

```
/home/ubuntu/.openclaw/workspace/residentialist/
├── .env                              # Configuration (FILL THIS IN)
├── .env.example                      # Template
├── MISSION_CONTROL_SETUP.md          # This file
├── mission-control/
│   ├── db/
│   │   └── schema.sql                # Database schema
│   ├── scripts/
│   │   ├── spec_sheet_parser.js      # Parser (16 categories)
│   │   ├── imap_monitor.js           # Email monitoring
│   │   ├── bot_orchestrator.js       # Bot pipeline
│   │   └── telegram_handler.js       # [TO BUILD] Telegram commands
│   ├── dashboard/
│   │   ├── pages/                    # [TO BUILD] Next.js pages
│   │   ├── components/               # [TO BUILD] React components
│   │   └── lib/                      # [TO BUILD] Database & API wrappers
│   └── residentialist.db             # SQLite database (auto-created)
├── windows/
│   ├── windows_eval_knowledge_v1.1.md
│   ├── windows_material_safety_knowledge_v1.1.md
│   ├── windows_deterministic_rubrics_v5.md
│   ├── residentialist_universal_rubric_principles_v1.1.md
│   └── henley_windows_packet_v1.1.md
```

---

## Next Steps

1. **Fill in .env** with your email/Telegram credentials
2. **Initialize database**: `sqlite3 ./residentialist.db < mission-control/db/schema.sql`
3. **Test IMAP monitor**: `node mission-control/scripts/imap_monitor.js`
4. **Build Next.js dashboard** (separate task)
5. **Wire up Telegram `/eval` command** (sessions_spawn integration)
6. **Add Airtable API credentials** when ready for live sync

---

## Testing

### Test Spec Sheet Parser

```javascript
const SpecSheetParser = require('./mission-control/scripts/spec_sheet_parser.js');
const parser = new SpecSheetParser();

const testText = `
Project: 123 Maple St, Austin TX

Specifications:
- Windows: Marvin Elevate double-hung
- Counters: Caesarstone Blizzard
- Faucets: Kohler Artifacts
- HVAC: Carrier Infinity heat pump
`;

const result = parser.parse(testText);
console.log(result);
// {
//   extraction_summary: { Windows: 1, Cabinets: 0, ... Countertops: 1, ... Faucets: 1, ... HVAC: 1 },
//   extracted_products: [
//     { category: 'Windows', item: 'Marvin Elevate', confidence: 0.9, ... },
//     ...
//   ],
//   items_needing_review: []
// }
```

### Test IMAP Monitor

```bash
# Install deps
cd mission-control/scripts
npm install imap mailparser sqlite3 dotenv

# Create .env with your credentials
# Then test:
node imap_monitor.js
```

Watch console for:
- "IMAP Monitor started"
- "Connected to INBOX"
- "Found N new email(s)"
- "Spec sheet stored: spec_[id]"
- Telegram notification sent

---

## Troubleshooting

### IMAP Connection Fails
- Check email/password (use app-specific password, not regular password)
- Verify IMAP server (Gmail = imap.gmail.com, Yahoo = imap.mail.yahoo.com, etc.)
- Check if two-factor auth is enabled (requires app password)

### Parser Not Extracting Products
- Add missing brand names to `extractionPatterns` in `spec_sheet_parser.js`
- Check text extraction (PDF parsing needs `pdf-parse` library)
- Review confidence thresholds (currently 0.8 for keywords, 0.9 for brands)

### Database Errors
- Make sure SQLite is installed: `sudo apt install sqlite3`
- Check file permissions: `chmod 644 residentialist.db`
- Verify schema: `sqlite3 residentialist.db ".tables"`

---

## Architecture Notes

**Three-tier extraction** for spec sheets:
1. Email monitoring (IMAP)
2. Text parsing (spec_sheet_parser)
3. Human review (dashboard Review Queue)

**Bot pipeline cascade:**
- Sequential by design (Bot 2 waits for Bot 1 output)
- Allows re-running single bot without repeating pipeline
- Each bot is a separate sub-agent (sessions_spawn)
- Activity log tracks all handoffs

**SQLite choice:**
- Zero setup (embedded)
- ACID guarantees
- Fast for small-medium volume
- Scales well for 100s of evaluations
- Can migrate to PostgreSQL later if needed

---

## Ray's Notes
- IMAP provider-agnostic (Gmail, Yahoo, Outlook, etc.)
- Spec sheets stored with full extraction results (review before Airtable sync)
- Bots are stateless (can restart without losing progress)
- Dashboard is the single source of truth for status
- All activity logged for audit trail

---

*Mission Control Ready for Configuration*
*Last Updated: March 7, 2026*
