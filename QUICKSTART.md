# Mission Control Quick Start

**Goal**: Get the system running in 30 minutes

---

## Step 1: Configure (5 min)

Copy the template:
```bash
cp residentialist/.env.example residentialist/.env
```

Edit `.env` with your details:

```bash
# Gmail example
EMAIL_ADDRESS=your.email@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop  # 16-char app password (NOT regular password)
IMAP_SERVER=imap.gmail.com
IMAP_PORT=993
EMAIL_FOLDER=INBOX

# Telegram
TELEGRAM_BOT_TOKEN=123456789:ABCDEfghijklmnopqrstuvwxyz-abcdef
TELEGRAM_CHAT_ID=987654321

# Database (leave as-is for now)
DATABASE_PATH=./residentialist.db
```

**Getting Gmail app password:**
1. Go to myaccount.google.com → Security
2. Enable 2-factor auth if not already on
3. Search for "app passwords"
4. Select "Mail" and "Windows"
5. Google generates a 16-character password
6. Copy and paste into `.env`

**Getting Telegram bot token:**
1. Message @BotFather on Telegram
2. `/newbot` → name your bot → choose a username
3. BotFather gives you the token
4. Paste into `.env`

**Getting your Telegram chat ID:**
1. Message your bot
2. Go to `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates`
3. Look for `"chat":{"id":987654321}`
4. Copy that number into `.env`

---

## Step 2: Initialize Database (2 min)

```bash
cd /home/ubuntu/.openclaw/workspace/residentialist
sqlite3 ./residentialist.db < mission-control/db/schema.sql
```

Verify it worked:
```bash
sqlite3 ./residentialist.db ".tables"
```

You should see: `activity_log evaluations products spec_sheets telegram_commands`

---

## Step 3: Install Dependencies (3 min)

```bash
cd mission-control/scripts
npm install imap mailparser sqlite3 dotenv
```

---

## Step 4: Test IMAP Monitor (10 min)

```bash
cd /home/ubuntu/.openclaw/workspace/residentialist
node mission-control/scripts/imap_monitor.js
```

You should see:
```
[IMAP] Database connected
[IMAP] Monitor started
[IMAP] Found 0 new email(s)
[IMAP] No new emails
```

Keep it running. Then in another terminal, send yourself a test email:

**Subject**: 123 Maple St, Austin TX - Test Build  
**Body**: Any text is fine  
**Attachment**: Any PDF, DOCX, or TXT file

Back in the first terminal, you should see (within 5 minutes):
```
[IMAP] Found 1 new email(s)
[IMAP] Processing email from your.email@gmail.com
[IMAP] Spec sheet stored: spec_1709821234_abc123def
[TELEGRAM] New spec sheet received — 123 Maple St, Austin TX (your.email@gmail.com)
Extracted 0 of 16 product categories.
0 items need review.
```

Great! The system is working.

---

## Step 5: Check the Database (5 min)

In a new terminal:
```bash
sqlite3 /home/ubuntu/.openclaw/workspace/residentialist/residentialist.db

# List spec sheets
SELECT spec_id, property_address, property_city, categories_found FROM spec_sheets;

# List activity
SELECT activity_type, actor, message, created_at FROM activity_log ORDER BY created_at DESC LIMIT 5;
```

You should see your test email parsed and stored.

---

## Next: Dashboard

The core system is now running. Next step is building the Next.js dashboard.

See `BUILD_SUMMARY.md` and `MISSION_CONTROL_SETUP.md` for complete documentation.

---

## Troubleshooting

### "Can't connect to IMAP server"
- Check email/password (Gmail app password, not regular password)
- Check IMAP_SERVER (Gmail = imap.gmail.com)
- Check IMAP_PORT (usually 993)
- Try: `telnet imap.gmail.com 993` to verify connectivity

### "No emails found after sending test"
- Make sure you're in the right email folder (INBOX is default)
- Check that the test email actually arrived
- IMAP monitor polls every 5 minutes — wait and try again

### "Spec sheet parsed but shows 0 categories"
- If your test email has no product names, that's expected
- Try an email with "Windows", "Cabinets", "Faucets", etc. in the body
- Parser looks for brand names (Marvin, Kohler, etc.) or category keywords

### "Telegram notification not showing up"
- Make sure you messaged your bot first (required before it can send to you)
- Check TELEGRAM_CHAT_ID is correct (should be a 9-10 digit number)
- Logs will show "[TELEGRAM]" messages even if UI doesn't show them yet

---

## What's Running

When the IMAP monitor is active:
- ✅ Email monitoring (polling every 5 minutes)
- ✅ Spec sheet parsing (16 categories)
- ✅ Database storage (SQLite)
- ✅ Activity logging (for dashboard)
- ⏳ Telegram notifications (logged, not yet connected to UI)
- ⏳ Dashboard (not built yet — Phase 2)
- ⏳ Bot orchestration (ready, needs dashboard trigger)
- ⏳ Telegram `/eval` command (ready, needs handler)

---

## Files to Know

- **`.env`** — Your configuration (never commit this)
- **`residentialist.db`** — Database (auto-created)
- **`mission-control/scripts/imap_monitor.js`** — Email monitoring (currently running)
- **`mission-control/scripts/bot_orchestrator.js`** — Bot pipeline (ready for dashboard)
- **`mission-control/db/schema.sql`** — Database schema (already initialized)

---

## What to Do Now

1. Keep IMAP monitor running in background:
   ```bash
   nohup node mission-control/scripts/imap_monitor.js > imap.log 2>&1 &
   ```

2. Start building the Next.js dashboard (contact me for that task)

3. As spec sheets arrive, they'll automatically be parsed and queued for review

---

**Status**: ✅ Core system online and running  
**Next Phase**: Dashboard (evaluations + review queue)

*Questions? See BUILD_SUMMARY.md or MISSION_CONTROL_SETUP.md*
