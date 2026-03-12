# Email Sending Policy — CRITICAL

**Status:** Active | **Last Updated:** March 7, 2026

---

## Current Rules (STRICTLY ENFORCED)

### Phase 1: Today + Tomorrow (Blackout)
- **DO NOT SEND ANY EMAILS** — today or tomorrow
- This is a hard stop. Zero exceptions.
- System is monitoring and will block any outbound mail attempts.

### Phase 2: Launch (When Ray Says Go)
- **Maximum 1 email per day** until further instruction
- This is a hard cap. No exceptions.
- Wait 24+ hours between outbound emails.
- Only Ray can authorize increase in volume.

### Phase 3: Scale Up (When Instructed)
- Ray will explicitly say: "Increase to 2 per day" or "Remove limit"
- Do not guess or assume the new limit.
- Respond with confirmation before changing.
- Track current limit in this file.

---

## Why This Matters

The Residentialist sends personalized spec sheet requests and follow-ups to builders. Sending too much, too fast = spam filter blacklist + damaged sender reputation.

Volume must be calibrated over time:
1. **Day 1**: Monitor delivery + bounce rates at low volume
2. **Week 1**: Verify Gmail account health stays good
3. **Week 2+**: Gradually increase if metrics look good

Ray is testing the system and watching deliverability before scaling.

---

## Implementation

**If code tries to send email:**
- Check current limit in this file
- Count emails sent in last 24 hours
- If at limit: queue and retry tomorrow
- If over limit: error and log incident

**Current Limit:** 0 emails per day (until Ray authorizes)

---

## Verification

```bash
# Check email queue
sqlite3 residentialist.db "SELECT COUNT(*) FROM outbound_email_queue;"

# Check sent emails
sqlite3 residentialist.db "SELECT * FROM outbound_email_log ORDER BY sent_at DESC LIMIT 10;"
```

---

## Change Log

- **March 7, 2026** — Phase 1: Blackout initiated. Zero emails today/tomorrow.
- **TBD** — Phase 2: Ray authorizes launch. 1 email/day limit active.
- **TBD** — Phase 3: Ray increases limit.

---

## When Ray Says "Go"

Ray will message: "Email system is live. Start with 1 per day."

At that point:
- [ ] Remove blackout
- [ ] Set daily limit to 1
- [ ] Begin sending queued emails (1 per day, spread out)
- [ ] Log all sends to outbound_email_log table
- [ ] Monitor delivery + bounces

---

**Remember**: This policy exists because email reputation takes months to build but seconds to destroy.

No guessing. No "gradual ramp-up without permission." Ray sets the rules, we follow them exactly.

---

*Enforced by Henry — The Residentialist Email System*
