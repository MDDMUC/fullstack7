# Email Notification System for Safety Reports

**Status:** Planning
**Owner:** Eng/Ops
**Created:** 2025-12-26
**Target:** Post-Launch Week 3-4

## Overview
Automate email notifications for new safety reports to ensure rapid response times and meet SLA commitments defined in `MODERATION_PROTOCOL.md`.

## Current State (MVP)
- Reports are created in database via `reportUser()` and `reportMessage()` functions
- No automated notifications
- Moderators must manually query database to check for new reports
- Risk of missing P0 reports that require 1-hour response time

## Goals
1. Notify moderators immediately when new reports are submitted
2. Route P0 reports to on-call moderator (urgent)
3. Send daily digest of pending reports to all moderators
4. Track response times and SLA compliance

## Email Notification Types

### 1. Immediate Alert (P0 Reports Only)
**Trigger:** New report with `report_type` in ['harassment', 'fraud', 'other'] AND reason contains keywords like "threat", "illegal", "violence", "harm"

**Recipients:**
- On-call moderator (primary)
- safety@dab.app (backup)

**Subject:** `[P0 URGENT] Safety Report Requires Immediate Action`

**Content:**
```
URGENT: A critical safety report has been submitted.

Report ID: [report_id]
Type: [report_type]
Reporter: [reporter_username]
Reported User: [reported_user_username or "Message #[id]"]
Reason: [truncated to 200 chars]

SLA: Initial review required within 1 hour.

View full report:
[Link to admin panel or Supabase query]

---
This is an automated alert. Reply to safety@dab.app if you need assistance.
```

### 2. Daily Digest (All Pending Reports)
**Trigger:** Daily at 9:00 AM CET (start of coverage hours)

**Recipients:** All active moderators

**Subject:** `DAB Moderation Digest - [X] Pending Reports`

**Content:**
```
Good morning,

You have [X] pending reports requiring review:

P0 (Critical): [count]
P1 (High): [count]
P2 (Medium): [count]
P3 (Low): [count]

Top 5 Oldest Reports:
1. [Report ID] - [Type] - [Age] - [Status]
2. ...

SLA Status:
- [X] reports nearing SLA deadline
- [X] reports past SLA deadline ⚠️

View full queue:
[Link to admin panel]

---
Sent by DAB Moderation System
```

### 3. SLA Warning (Reports Nearing Deadline)
**Trigger:** Report approaching SLA deadline (e.g., 75% of time elapsed)

**Recipients:** Assigned moderator (if available) or all moderators

**Subject:** `[SLA WARNING] Report [ID] nearing deadline`

**Content:**
```
A report is approaching its SLA deadline:

Report ID: [report_id]
Type: [report_type]
Priority: [P0/P1/P2/P3]
Created: [timestamp]
SLA Deadline: [timestamp]
Time Remaining: [X hours Y minutes]

Please review and action this report:
[Link to admin panel]

---
This is an automated SLA reminder.
```

### 4. Weekly Summary (Metrics Report)
**Trigger:** Every Monday at 9:00 AM CET

**Recipients:** Product Lead + all moderators

**Subject:** `DAB Moderation Weekly Summary - Week of [Date]`

**Content:**
```
Moderation Summary for Week [XX]

Reports Received: [count]
- P0: [count]
- P1: [count]
- P2: [count]
- P3: [count]

Reports Resolved: [count]
Average Resolution Time: [X hours]

SLA Compliance:
- P0: [XX]% (target: 100%)
- P1: [XX]% (target: 95%)
- P2: [XX]% (target: 90%)

Actions Taken:
- Warnings: [count]
- Suspensions: [count]
- Bans: [count]

Top Report Types:
1. [Type]: [count]
2. [Type]: [count]

View full analytics: [Link]

---
Sent by DAB Moderation System
```

## Technical Implementation

### Option 1: Supabase Database Webhooks (Recommended for MVP)
**Pros:**
- Built into Supabase
- No additional infrastructure
- Triggers on database events

**Cons:**
- Limited to HTTP webhooks (need email service)
- Requires external email service (Resend, SendGrid, etc.)

**Implementation:**
1. Create Supabase webhook on `reports` table INSERT
2. Webhook calls Next.js API route: `/api/moderation/notify`
3. API route:
   - Checks report priority/type
   - Determines recipient(s)
   - Sends email via Resend API
   - Logs notification in database

**Code Example:**
```typescript
// src/app/api/moderation/notify/route.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  const { record } = await request.json() // Supabase webhook payload

  // Determine priority based on report_type and reason
  const priority = determinePriority(record)

  // Get moderator emails
  const recipients = await getModeratorEmails(priority)

  // Send email
  await resend.emails.send({
    from: 'safety@dab.app',
    to: recipients,
    subject: `[${priority}] New Safety Report`,
    html: generateEmailHTML(record)
  })

  return Response.json({ success: true })
}
```

### Option 2: Supabase Edge Functions
**Pros:**
- Runs on Supabase infrastructure
- Serverless (scales automatically)
- Direct database access

**Cons:**
- Deno runtime (different from Node.js)
- Still needs external email service

**Implementation:**
1. Create Supabase Edge Function triggered on `reports` INSERT
2. Function fetches report details
3. Calls Resend API to send email

### Option 3: Cron Jobs (For Daily/Weekly Emails)
**Implementation:**
1. Use Vercel Cron Jobs (or Supabase pg_cron)
2. Create API routes for each cron task:
   - `/api/moderation/daily-digest` (runs daily at 9:00 AM)
   - `/api/moderation/weekly-summary` (runs weekly)
3. Each route queries database and sends emails

**Vercel cron config (`vercel.json`):**
```json
{
  "crons": [
    {
      "path": "/api/moderation/daily-digest",
      "schedule": "0 9 * * *"
    },
    {
      "path": "/api/moderation/weekly-summary",
      "schedule": "0 9 * * 1"
    }
  ]
}
```

## Email Service Comparison

| Service | Price | Pros | Cons |
|---------|-------|------|------|
| **Resend** | 100 emails/day free, $20/mo for 50k | Modern API, React Email support, great DX | Newer service |
| **SendGrid** | 100 emails/day free, $15/mo for 40k | Established, reliable, good docs | Clunky UI |
| **Postmark** | 100 emails/mo free, $10/mo for 10k | Transactional focus, fast delivery | Lower free tier |
| **AWS SES** | $0.10 per 1000 emails | Cheapest at scale, AWS integration | Complex setup |

**Recommendation:** **Resend** for MVP (modern, easy setup, generous free tier)

## Database Changes Required

### Add notification tracking table
```sql
CREATE TABLE moderation_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES reports(id) NOT NULL,
  notification_type TEXT NOT NULL, -- 'immediate', 'digest', 'sla_warning', 'weekly'
  recipient_email TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  delivery_status TEXT, -- 'sent', 'delivered', 'failed'
  error_message TEXT
);

CREATE INDEX idx_notifications_report ON moderation_notifications(report_id);
CREATE INDEX idx_notifications_sent ON moderation_notifications(sent_at DESC);
```

### Add moderator on-call rotation
```sql
ALTER TABLE moderators ADD COLUMN on_call_start TIMESTAMPTZ;
ALTER TABLE moderators ADD COLUMN on_call_end TIMESTAMPTZ;

-- Function to get current on-call moderator
CREATE OR REPLACE FUNCTION get_on_call_moderator()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT user_id
    FROM moderators
    WHERE is_active = TRUE
      AND on_call_start <= NOW()
      AND (on_call_end IS NULL OR on_call_end > NOW())
    ORDER BY on_call_start DESC
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql;
```

## Rollout Plan

### Phase 1: Immediate Alerts (Week 3)
- [ ] Set up Resend account and API key
- [ ] Create `/api/moderation/notify` route
- [ ] Set up Supabase webhook on `reports` INSERT
- [ ] Test with dummy report
- [ ] Deploy to production
- [ ] Monitor for 48 hours

### Phase 2: Daily Digest (Week 4)
- [ ] Create `/api/moderation/daily-digest` route
- [ ] Set up Vercel cron job
- [ ] Test locally with sample data
- [ ] Deploy to production
- [ ] Verify email sent at 9:00 AM CET

### Phase 3: SLA Warnings (Week 5)
- [ ] Create `/api/moderation/sla-check` route
- [ ] Set up cron to run every 30 minutes
- [ ] Query reports nearing SLA deadline
- [ ] Send warnings to assigned moderator
- [ ] Deploy to production

### Phase 4: Weekly Summary (Week 6)
- [ ] Create analytics queries for weekly metrics
- [ ] Create `/api/moderation/weekly-summary` route
- [ ] Set up Vercel cron job (Mondays 9:00 AM)
- [ ] Test email template
- [ ] Deploy to production

## Security & Privacy Considerations

### PII in Emails
- DO NOT include full user emails in notification emails
- Use usernames or anonymized IDs only
- Link to admin panel for full details (behind auth)

### Email Security
- Use DKIM/SPF/DMARC for safety@dab.app domain
- Set up dedicated mailbox for safety@dab.app (Gmail or Fastmail)
- Monitor for bounces and spam reports

### Rate Limiting
- Prevent email bombing if webhook misfires
- Max 1 immediate alert per report
- Max 1 digest per day
- Log all sent emails in `moderation_notifications` table

## Testing Plan

### Unit Tests
- Test priority determination logic
- Test email template generation
- Test recipient selection (on-call vs all moderators)

### Integration Tests
- Create test report → verify email sent
- Simulate P0 report → verify urgent email
- Run daily digest manually → verify all moderators receive email

### Load Tests
- Simulate 100 reports in 1 minute → verify all emails sent
- Check for duplicate emails
- Verify SLA warning deduplication

## Monitoring & Alerts

### Metrics to Track
- Email delivery rate (via Resend webhooks)
- Average time from report → first email sent
- SLA compliance (% of reports actioned within SLA)
- Bounced emails (invalid moderator emails)

### Alerts
- Email to ops@dab.app if:
  - Daily digest fails to send
  - Immediate alert fails to send (P0 report)
  - Email delivery rate < 95%

## Cost Estimate

### MVP (100-200 users, ~10-20 reports/week)
- Resend: Free tier (100 emails/day)
- Vercel cron: Free (Hobby plan includes 1 cron)
- **Total: $0/month**

### At Scale (1000 users, ~100 reports/week)
- Resend: ~400 emails/month → Free tier sufficient
- Vercel cron: Free
- **Total: $0/month**

### At 10k users (~500 reports/week)
- Resend: ~2000 emails/month → $20/month (50k email tier)
- Vercel cron: Free
- **Total: $20/month**

## Fallback Plan

If email service is down or not ready:
1. Manual polling: Moderators check admin panel every hour
2. Slack webhook as backup notification channel
3. SMS alerts for P0 reports (Twilio)

## Next Steps
1. Create TICKET-ADM-002 for implementation
2. Get Product approval on email templates
3. Set up safety@dab.app mailbox
4. Configure Resend account
5. Implement Phase 1 (immediate alerts)

---

**Related Tickets:**
- TICKET-TNS-001: Safety and Moderation Readiness (Complete)
- TICKET-ADM-001: Admin Panel for Report Moderation (Proposed)
- TICKET-ADM-002: Email Automation for Moderation (To be created)
