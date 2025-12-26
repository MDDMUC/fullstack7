# Ticket: Admin Panel for Report Moderation

ID: TICKET-ADM-001
Owner: Eng/Product
Status: Proposed
Priority: P1
Workflow Path: Standard
Created: 2025-12-26
Last updated: 2025-12-26
Target window: Post-Launch Week 2-3
Related docs: `docs/MODERATION_PROTOCOL.md`, `IMPLEMENTATION_GUIDE_TNS001.md`

## Problem
Moderators currently must use SQL queries in Supabase to review and manage reports. This is inefficient, error-prone, and requires technical knowledge. We need a dedicated admin panel UI for report moderation.

## Goal
Build a web-based admin panel that allows moderators to efficiently review, action, and track reports without writing SQL queries.

## Scope

### Must Have (MVP)
- **Report Queue Dashboard**
  - List all reports with filters (status, type, priority)
  - Sort by created_at, priority, status
  - Show: reporter name, reported user/message, type, status, timestamp
  - Click to view full report details

- **Report Detail View**
  - Full report information (reporter, reported user/message, reason, type)
  - Reported message preview (if message report)
  - Reported user profile summary (join date, report history, block history)
  - Action buttons: Resolve, Escalate, Ban User, Suspend User, Warn User
  - Moderation notes textarea
  - Action log (who did what, when)

- **User Profile Viewer**
  - View user profile details (username, email, join date, photos)
  - Report history (as reporter and as reported user)
  - Block history (who they've blocked, who's blocked them)
  - Message activity summary (messages sent, threads participated in)
  - Quick actions: Suspend, Ban, View Messages

- **Moderator Authentication**
  - Login page (uses existing Supabase auth)
  - Check if logged-in user is in `moderators` table with `is_active = true`
  - Redirect to login if not authenticated or not a moderator
  - Show moderator name/email in top bar

### Nice to Have (Phase 2)
- Email template editor (edit warning/suspension/ban emails)
- Analytics dashboard (reports by type, resolution time, moderator performance)
- Bulk actions (resolve multiple reports at once)
- Search users by email or username
- Export reports to CSV
- Webhook notifications (Slack/Discord when new P0 report)

### Out of Scope
- User-facing appeals system (handled via email for MVP)
- Automated spam detection or AI moderation
- Multi-language support (English only for launch)

## User Stories

### As a moderator, I want to:
1. See all pending reports in one place, so I can prioritize my work
2. Click on a report to see full context (message, user profile, history), so I can make an informed decision
3. Take action on a report (warn, suspend, ban) with one click, so I don't need to write SQL queries
4. Add notes to a report, so other moderators understand my decision
5. See who else is reviewing a report, so we don't duplicate work
6. Filter reports by priority/type/status, so I can focus on urgent issues first

## Design

### Page Structure

```
/admin
├── /login                 # Admin login page
├── /dashboard             # Report queue (main page)
├── /reports/[id]          # Report detail view
└── /users/[id]            # User profile viewer
```

### Dashboard Wireframe (Report Queue)
```
┌─────────────────────────────────────────────────────────┐
│  DAB Admin Panel                          [Moderator: You] │
├─────────────────────────────────────────────────────────┤
│  Reports Queue                                           │
│                                                          │
│  [All] [Pending] [Reviewed] [Resolved]   [P0][P1][P2][P3] │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │ ID    │ Type      │ Reporter │ Reported │ Status │  │
│  ├──────────────────────────────────────────────────┤  │
│  │ abc123│ Harassment│ user_a   │ user_b   │ Pending│  │
│  │ def456│ Spam      │ user_c   │ msg_123  │ Pending│  │
│  │ ghi789│ Explicit  │ user_d   │ user_e   │Reviewed│  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Report Detail Wireframe
```
┌─────────────────────────────────────────────────────────┐
│  ← Back to Queue                                         │
├─────────────────────────────────────────────────────────┤
│  Report: abc123                           Status: Pending│
│                                                          │
│  Reporter: user_a (joined 2025-01-15)                   │
│  Reported User: user_b (joined 2025-02-20)              │
│  Type: Harassment                                        │
│  Reason: "This user keeps messaging me after I blocked" │
│  Created: 2025-12-26 14:32 CET                          │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Reported User Profile:                            │  │
│  │ - Username: climber_b                             │  │
│  │ - Reports received: 2 (1 resolved, 1 pending)    │  │
│  │ - Reports filed: 0                                │  │
│  │ - Blocked by: 3 users                             │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  Moderation Notes:                                       │
│  [Text area for notes]                                   │
│                                                          │
│  Actions:                                                │
│  [Warn User] [Suspend (24h)] [Suspend (7d)] [Ban]       │
│  [Resolve (No Action)] [Escalate to Lead]               │
│                                                          │
│  Action Log:                                             │
│  - 2025-12-26 14:35: Moderator_1 reviewed               │
└─────────────────────────────────────────────────────────┘
```

## Technical Approach

### Stack
- **Framework:** Next.js App Router (reuse existing setup)
- **Auth:** Supabase Auth + `is_moderator()` check
- **Database:** Supabase (use existing `reports`, `moderators`, `users` tables)
- **Styling:** Tailwind CSS v4 with design tokens

### Key Files to Create
- `src/app/admin/layout.tsx` - Admin layout with auth check
- `src/app/admin/page.tsx` - Report queue dashboard
- `src/app/admin/reports/[id]/page.tsx` - Report detail view
- `src/app/admin/users/[id]/page.tsx` - User profile viewer
- `src/components/AdminReportCard.tsx` - Report card component
- `src/components/AdminActionMenu.tsx` - Quick actions menu
- `src/lib/admin.ts` - Helper functions for moderator actions

### Database Functions Needed
```sql
-- Get all reports with user details (already have base queries)
-- Suspend user (create user_suspensions table)
-- Ban user (mark in users or create bans table)
-- Update report status and add moderator notes (already works)
```

### New Tables Required
```sql
-- User suspensions
CREATE TABLE user_suspensions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  suspended_by UUID REFERENCES auth.users(id) NOT NULL,
  reason TEXT NOT NULL,
  duration INTERVAL, -- NULL for permanent ban
  suspended_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE
);

-- Action log for audit trail
CREATE TABLE moderation_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  moderator_id UUID REFERENCES auth.users(id) NOT NULL,
  action_type TEXT NOT NULL, -- 'warn', 'suspend', 'ban', 'resolve', 'escalate'
  target_user_id UUID REFERENCES auth.users(id),
  report_id UUID REFERENCES reports(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Definition of Done
- [ ] Admin login page created (`/admin/login`)
- [ ] Moderator auth check enforced on all `/admin/*` pages
- [ ] Report queue dashboard shows all reports with filters
- [ ] Report detail view shows full context and action buttons
- [ ] User profile viewer shows user history and quick actions
- [ ] Actions (warn, suspend, ban, resolve) update database correctly
- [ ] Moderation notes save to `reports.moderation_notes`
- [ ] Action log records all moderator actions
- [ ] Pages use design tokens (no hard-coded values)
- [ ] Mobile-responsive (works on tablet/desktop, not phone)
- [ ] Build passes with no TypeScript errors
- [ ] Manual testing: Complete a full moderation workflow (pending → reviewed → resolved)

## Out of Scope for This Ticket
- Email sending automation (emails sent manually for MVP)
- Real-time notifications (Slack/Discord webhooks)
- Advanced analytics dashboard
- User appeal submission form (handled via email)

## Estimates
- Design: 0.5 day (wireframes and component spec)
- Implementation: 3-4 days (pages, components, database updates)
- Testing: 1 day (manual QA, moderator workflow testing)
- **Total: 4-5 days**

## Dependencies
- TICKET-TNS-001 must be complete (moderators table, reports structure)
- Moderation protocol approved and finalized

## Risks
- **Scope creep:** Keep MVP simple, defer nice-to-haves to Phase 2
- **Security:** Ensure only moderators can access `/admin/*` pages
- **Data privacy:** Be careful not to expose sensitive user data unnecessarily

## Follow-up Tickets
- TICKET-ADM-002: Email automation for moderation actions
- TICKET-ADM-003: Analytics dashboard for moderators
- TICKET-ANA-005: Track moderation metrics (response time, resolution rate)
