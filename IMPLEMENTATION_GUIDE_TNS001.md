# Implementation Guide: TICKET-TNS-001 - Safety & Moderation Readiness

## Overview
This document outlines the implementation of server-side safety features for the DAB platform, including block enforcement, rate limiting, and moderation access.

## What Was Implemented

### 1. Safety & Community Guidelines Pages ✅ COMPLETE
- Created `/safety` route with emergency contact info and safety guidelines
- Created `/community-guidelines` route with community standards
- Both pages include MobileTopbar/MobileNavbar on mobile, Footer on desktop
- Linked from landing page footer and profile page
- **Status**: Already deployed and working

### 2. Server-Side Block Enforcement 🔧 REQUIRES DB MIGRATION
**Files Created**:
- `supabase/enforce_blocks_on_messages.sql`

**What It Does**:
- Prevents blocked users from sending messages to each other at the database level
- Creates helper function `user_can_see_thread()` to check if user can access a thread
- Updates messages INSERT policy to enforce blocks

**Client Updates**:
- `src/app/chats/page.tsx` - Filters threads list to exclude blocked users
- `src/app/home/page.tsx` - Filters profile deck to exclude blocked users (both directions)

**To Deploy**:
1. Open Supabase SQL Editor
2. Run `supabase/enforce_blocks_on_messages.sql`
3. Verify policies with the SELECT query at the end of the file

### 3. Server-Side Rate Limiting 🔧 REQUIRES DB MIGRATION
**Files Created**:
- `supabase/enforce_rate_limiting.sql`

**What It Does**:
- Creates database trigger that enforces 5 messages per 10 seconds limit
- Raises exception if limit exceeded with user-friendly error message
- Cannot be bypassed by client refresh/multi-tab/direct API calls

**Client Updates**:
- Existing error handling in `src/app/chats/[id]/page.tsx` will catch and display server errors
- Client-side rate limiting remains as UX enhancement (prevents unnecessary requests)

**To Deploy**:
1. Open Supabase SQL Editor
2. Run `supabase/enforce_rate_limiting.sql`
3. Verify trigger with the SELECT query at the end of the file

### 4. Moderation Access Path 🔧 REQUIRES DB MIGRATION
**Files Created**:
- `supabase/add_moderation_access.sql`

**What It Does**:
- Creates `moderators` table to track who has moderation privileges
- Adds RLS policies allowing moderators to view and update all reports
- Adds `moderation_notes`, `moderator_id`, and `resolved_at` columns to reports table
- Creates helper function `is_moderator()` for permission checks

**To Deploy**:
1. Open Supabase SQL Editor
2. Run `supabase/add_moderation_access.sql`
3. Verify policies with the SELECT query at the end of the file
4. **IMPORTANT**: Grant initial moderator access using service role:
   ```sql
   -- Replace 'uuid-of-first-moderator' with actual user UUID
   INSERT INTO moderators (user_id, is_active)
   VALUES ('uuid-of-first-moderator', true);
   ```

### 5. Message Report Validation ✅ COMPLETE
**Files Updated**:
- `src/lib/reports.ts` - Added message ownership verification

**What It Does**:
- Verifies message exists before allowing report
- Verifies reporter is a participant in the thread (has access to the message)
- Prevents self-reporting
- Prevents arbitrary UUID guessing attacks

**Status**: Already deployed (TypeScript update, no DB migration needed)

## Database Migration Order

**IMPORTANT**: Run SQL files in this order to avoid dependency issues:

1. `supabase/enforce_rate_limiting.sql` (standalone, no dependencies)
2. `supabase/enforce_blocks_on_messages.sql` (modifies existing messages policies)
3. `supabase/add_moderation_access.sql` (creates new table, modifies reports policies)

## Definition of Done - Verification Checklist

### Manual Testing Required:

#### ✅ Block Enforcement
- [ ] Direct chat: Block user A from user B's profile
- [ ] Verify thread with user A disappears from user B's chats list
- [ ] Have user A attempt to send message to user B
- [ ] Verify message is rejected at server with policy violation error
- [ ] Verify user A does not appear in user B's home deck
- [ ] Verify user B does not appear in user A's home deck

#### ✅ Rate Limiting
- [ ] Open a direct or group chat
- [ ] Send 5 messages rapidly (within 10 seconds)
- [ ] Attempt to send 6th message
- [ ] Verify server rejects with error: "Rate limit exceeded. Please slow down..."
- [ ] Verify client displays error message
- [ ] Wait 10 seconds, verify messages can be sent again

#### ✅ Report Access & Moderation
- [ ] Create report from home deck (report user)
- [ ] Create report from group chat (report message)
- [ ] Verify reports rows created with correct fields
- [ ] Grant moderator access to test user
- [ ] Login as moderator, query reports table
- [ ] Verify moderator can see all reports, not just their own
- [ ] Moderator updates report status to 'reviewing'
- [ ] Moderator adds moderation_notes
- [ ] Verify updates succeed

#### ✅ Safety Pages
- [ ] Navigate to `/safety` from landing page footer
- [ ] Verify page renders with MobileTopbar/MobileNavbar on mobile
- [ ] Verify page renders with Footer on desktop (≥769px)
- [ ] Navigate to `/community-guidelines` from landing page footer
- [ ] Verify page renders correctly on both mobile and desktop
- [ ] Verify all links work

## Known Limitations & Future Work

### Current Implementation:
- **Group/crew thread blocking**: Server blocks message sends, but client-side thread filtering for groups is limited. For full enforcement in groups, consider using the `user_can_see_thread()` RPC function.
- **Moderator UI**: No admin panel yet. Moderators must use SQL queries or service-role scripts to manage reports.
- **Rate limiting granularity**: Currently 5 messages per 10 seconds globally. Future: per-thread or per-user-pair limits.

### Recommendations for Phase 2:
1. Build admin panel UI for report moderation
2. Add email notifications for safety@dab.app on new reports
3. Implement automated spam detection (ML or rule-based)
4. Add user appeal process for blocks/suspensions
5. Create moderation playbook (separate from code repo)

## Rollback Plan

If issues arise after deployment:

### To Disable Rate Limiting:
```sql
DROP TRIGGER IF EXISTS enforce_message_rate_limit ON messages;
```

### To Disable Block Enforcement:
```sql
DROP POLICY IF EXISTS "Allow thread participants to send messages (with block check)" ON messages;

-- Restore original policy
CREATE POLICY "Allow thread participants to send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND sender_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM thread_participants tp
      WHERE tp.thread_id = messages.thread_id
        AND tp.user_id = auth.uid()
    )
  );
```

### To Disable Moderation Access:
```sql
DROP POLICY IF EXISTS "moderators_select_all_reports" ON reports;
DROP POLICY IF EXISTS "moderators_update_reports" ON reports;

-- Restore original policy
CREATE POLICY "reports_select_own"
  ON reports FOR SELECT
  USING (auth.uid() = reporter_id);
```

## Support & Questions

### Technical Lead Review Needed:
- ❓ Is there an existing backend service-role moderation tool for reports?
- ❓ Should we add webhook notifications for new reports?
- ❓ Where should moderation protocol live (repo doc vs ops playbook)?

### Product/Design Review Needed:
- ❓ Review copy for `/safety` and `/community-guidelines` pages
- ❓ Confirm moderation workflow and SLA expectations
- ❓ Define escalation path for urgent safety issues

## Files Modified/Created

### New SQL Files:
- `supabase/enforce_blocks_on_messages.sql`
- `supabase/enforce_rate_limiting.sql`
- `supabase/add_moderation_access.sql`

### Modified TypeScript Files:
- `src/lib/reports.ts` - Added message ownership verification
- `src/app/chats/page.tsx` - Added block filtering for threads list
- `src/app/home/page.tsx` - Added bidirectional block filtering for profile deck

### New Pages (Already Deployed):
- `src/app/safety/page.tsx`
- `src/app/community-guidelines/page.tsx`

### Modified Components:
- `src/components/Footer.tsx` - Extracted reusable footer

## Deployment Checklist

- [ ] Run SQL migrations in order (see "Database Migration Order" above)
- [ ] Grant initial moderator access to designated user(s)
- [ ] Test all DoD items (see "Manual Testing Required" above)
- [ ] Update SESSION_NOTES.md with deployment timestamp
- [ ] Update DECISIONS.md if any implementation decisions were made
- [ ] Notify Product/Design that safety pages are live
- [ ] Schedule follow-up meeting to discuss moderator workflow

---

**Implementation Date**: 2025-12-26
**Ticket**: TICKET-TNS-001
**Engineer**: Claude Code
**Status**: Ready for DB Migration & Testing
