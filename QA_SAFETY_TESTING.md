# QA Testing Guide: Safety and Moderation Features

**Ticket:** TICKET-TNS-001 - Safety and Moderation Readiness
**Test Date:** _________________
**Tester:** _________________
**Environment:** Production / Staging (circle one)

## Overview
This guide covers end-to-end testing of DAB's safety and moderation features including block enforcement, rate limiting, report flows, and safety pages.

## Prerequisites

### Test Accounts Required
You will need **3 test user accounts** for comprehensive testing:
- **User A** (Primary test user) - your main account
- **User B** (Secondary test user) - to test blocking/reporting
- **User C** (Third test user) - for group chat scenarios

### Setup Instructions
1. Create 3 accounts with different emails
2. Complete onboarding for all 3 accounts
3. Ensure all 3 users have matched with each other (swipe right on each)
4. Join the same gym chat or crew with all 3 users
5. Note down the user IDs for all 3 accounts (check profile or database)

---

## Test Suite 1: Safety Pages

### Test 1.1: Safety Page - Mobile
**Objective:** Verify `/safety` page renders correctly on mobile

**Steps:**
1. Open DAB on mobile browser (iOS Safari or Android Chrome)
2. Navigate to Profile page
3. Scroll to "Help & Safety" section
4. Click "Safety Tips" link

**Expected Results:**
- [ ] Page navigates to `/safety`
- [ ] MobileTopbar displays with "Safety" breadcrumb
- [ ] MobileNavbar visible at bottom
- [ ] All sections render: Emergency, Personal Safety, Climbing Safety, Reporting, Privacy
- [ ] Links to `safety@dab.app` are clickable
- [ ] Page scrolls smoothly
- [ ] No layout issues or broken styles

**Actual Results:**
_____________________________________________

---

### Test 1.2: Safety Page - Desktop
**Objective:** Verify `/safety` page renders correctly on desktop

**Steps:**
1. Open DAB on desktop browser (≥769px width)
2. Navigate to `/safety` directly or via footer link

**Expected Results:**
- [ ] MobileTopbar is **hidden**
- [ ] MobileNavbar is **hidden**
- [ ] Footer component is **visible** at bottom
- [ ] Footer links to Community Guidelines and Safety
- [ ] Page is centered with proper max-width
- [ ] All content renders correctly

**Actual Results:**
_____________________________________________

---

### Test 1.3: Community Guidelines Page - Mobile
**Objective:** Verify `/community-guidelines` page renders correctly on mobile

**Steps:**
1. Open DAB on mobile browser
2. Navigate to Profile page
3. Scroll to "Help & Safety" section
4. Click "Community Guidelines" link

**Expected Results:**
- [ ] Page navigates to `/community-guidelines`
- [ ] MobileTopbar displays with "Guidelines" breadcrumb
- [ ] MobileNavbar visible at bottom
- [ ] All sections render: Be Respectful, Be Authentic, Keep It Safe, No Spam, Content Standards, Reporting & Enforcement
- [ ] Email link to `safety@dab.app` works
- [ ] No design token violations (no hard-coded colors/spacing)

**Actual Results:**
_____________________________________________

---

### Test 1.4: Community Guidelines Page - Desktop
**Objective:** Verify `/community-guidelines` page renders correctly on desktop

**Steps:**
1. Open DAB on desktop browser (≥769px width)
2. Navigate to `/community-guidelines` via footer link

**Expected Results:**
- [ ] MobileTopbar is **hidden**
- [ ] MobileNavbar is **hidden**
- [ ] Footer component is **visible**
- [ ] Page renders with proper desktop layout
- [ ] All content is readable and properly spaced

**Actual Results:**
_____________________________________________

---

## Test Suite 2: Block Enforcement

### Test 2.1: Block User from Profile
**Objective:** Verify user can block another user from profile/chat

**Setup:**
- User A and User B are matched
- User A is logged in

**Steps:**
1. User A: Open direct chat with User B
2. Click three-dot menu in top-right
3. Select "Block User"
4. Confirm block action

**Expected Results:**
- [ ] Confirmation modal appears (styled modal, not browser alert)
- [ ] After confirming, user is redirected to `/chats`
- [ ] Direct thread with User B no longer appears in chats list
- [ ] Database check: New row in `blocks` table with `blocker_id = User A`, `blocked_id = User B`

**Actual Results:**
_____________________________________________

---

### Test 2.2: Block Enforcement - Message Send Blocked (Database Level)
**Objective:** Verify blocked users cannot send messages to each other (server-side enforcement)

**Setup:**
- User A has blocked User B (from Test 2.1)
- User B is logged in

**Steps:**
1. User B: Navigate to `/chats`
2. User B: Check if thread with User A appears
3. User B: Try to access the thread directly via URL (if known) or database

**Expected Results:**
- [ ] User B **cannot see** thread with User A in chats list
- [ ] If User B tries to send a message via API/database, it should be **rejected** with RLS policy error
- [ ] Console error (if attempted): "new row violates row-level security policy"

**Database Verification:**
```sql
-- Run as User B (simulate message insert)
INSERT INTO messages (thread_id, sender_id, receiver_id, body)
VALUES ('[thread-id]', '[user-b-id]', '[user-a-id]', 'Test message');
-- Expected: Error - RLS policy violation
```

**Expected Database Result:**
- [ ] Insert fails with policy violation error

**Actual Results:**
_____________________________________________

---

### Test 2.3: Block Enforcement - Home Deck Filtering
**Objective:** Verify blocked users don't appear in home deck (bidirectional)

**Setup:**
- User A has blocked User B
- User A is logged in

**Steps:**
1. User A: Navigate to `/home` (swipe deck)
2. Swipe through all available profiles
3. Check if User B appears in the deck

**Expected Results:**
- [ ] User B does **not** appear in User A's swipe deck
- [ ] User A can see other users (User C, etc.)

**Switch Perspective:**
1. Login as User B
2. Navigate to `/home`
3. Check if User A appears in the deck

**Expected Results:**
- [ ] User A does **not** appear in User B's swipe deck (bidirectional filtering)

**Actual Results:**
_____________________________________________

---

### Test 2.4: Block Enforcement - Group Chat Messages Hidden
**Objective:** Verify messages from blocked users are filtered out in group chats

**Setup:**
- User A, User B, and User C are all in the same crew/gym chat
- User A has blocked User B

**Steps:**
1. User B: Send a message in the crew/gym chat: "Hello from User B"
2. User C: Verify the message appears
3. User A: Open the same crew/gym chat

**Expected Results:**
- [ ] User C sees User B's message
- [ ] User A does **not** see User B's message (filtered client-side)
- [ ] User A can see messages from User C
- [ ] No error messages or broken UI

**Actual Results:**
_____________________________________________

---

### Test 2.5: Unblock User
**Objective:** Verify user can unblock another user (future feature - may not be implemented)

**Steps:**
1. User A: Navigate to Settings/Profile (look for blocked users list)
2. If available, unblock User B

**Expected Results:**
- [ ] Unblock action succeeds OR
- [ ] Unblock UI not yet implemented (acceptable for MVP)
- [ ] If unblocked: Direct thread reappears in chats list
- [ ] If unblocked: User B appears in home deck again

**Actual Results:**
_____________________________________________

---

## Test Suite 3: Rate Limiting

### Test 3.1: Rate Limit - 5 Messages in 10 Seconds
**Objective:** Verify server-side rate limiting prevents spam (5 messages / 10 seconds)

**Setup:**
- User A is logged in
- User A has an active direct chat with User C (not blocked)

**Steps:**
1. User A: Open direct chat with User C
2. Send 5 messages rapidly (as fast as possible)
   - Message 1: "Test 1"
   - Message 2: "Test 2"
   - Message 3: "Test 3"
   - Message 4: "Test 4"
   - Message 5: "Test 5"
3. Immediately try to send a 6th message: "Test 6"

**Expected Results:**
- [ ] Messages 1-5 send successfully
- [ ] 6th message is **rejected** by server
- [ ] Error message appears in UI: "Rate limit exceeded. Please slow down and try again in a few seconds."
- [ ] Console shows database error with hint: "You can send up to 5 messages per 10 seconds."

**Database Verification:**
- [ ] Only 5 messages from User A appear in database (within last 10 seconds)
- [ ] 6th message was **not** inserted

**Actual Results:**
_____________________________________________

---

### Test 3.2: Rate Limit - Reset After 10 Seconds
**Objective:** Verify rate limit resets after 10 seconds

**Setup:**
- User A just hit rate limit (from Test 3.1)

**Steps:**
1. Wait 10 seconds
2. User A: Send a new message: "Test 7"

**Expected Results:**
- [ ] Message sends successfully
- [ ] No rate limit error

**Actual Results:**
_____________________________________________

---

### Test 3.3: Rate Limit - Multi-Tab Bypass Prevention
**Objective:** Verify rate limit cannot be bypassed by opening multiple tabs

**Setup:**
- User A is logged in

**Steps:**
1. Open DAB in **2 separate browser tabs**
2. Tab 1: Open chat with User C, send 3 messages rapidly
3. Tab 2: Open same chat, send 3 messages rapidly
4. Check if 6th message is blocked

**Expected Results:**
- [ ] Rate limit enforced **across tabs** (server-side check)
- [ ] 6th message blocked regardless of which tab it came from
- [ ] Rate limit is **per-user**, not per-session

**Actual Results:**
_____________________________________________

---

## Test Suite 4: Report User

### Test 4.1: Report User from Profile/Chat
**Objective:** Verify user can report another user

**Setup:**
- User A and User C are matched
- User A is logged in

**Steps:**
1. User A: Open direct chat with User C
2. Click three-dot menu
3. Select "Report User"
4. Report modal appears
5. Select report type: "Harassment"
6. Enter reason: "This is a test report for QA"
7. Submit report

**Expected Results:**
- [ ] Report modal appears with design token styling
- [ ] Report types available: Harassment, Inappropriate, Spam, Fraud, Other
- [ ] Reason textarea is required
- [ ] Submit button is disabled until reason is entered
- [ ] After submit: Success toast/message appears
- [ ] Modal closes

**Database Verification:**
```sql
SELECT * FROM reports
WHERE reporter_id = '[user-a-id]'
  AND reported_user_id = '[user-c-id]'
ORDER BY created_at DESC LIMIT 1;
```

**Expected Database Result:**
- [ ] New report row exists
- [ ] `reporter_id` = User A
- [ ] `reported_user_id` = User C
- [ ] `reported_message_id` = NULL
- [ ] `report_type` = 'harassment'
- [ ] `reason` = "This is a test report for QA"
- [ ] `status` = 'pending'

**Actual Results:**
_____________________________________________

---

### Test 4.2: Report Message from Group Chat
**Objective:** Verify user can report specific messages in group chats

**Setup:**
- User A, User B (unblocked for this test), and User C are in same crew/gym chat
- User B sends a message: "This is an offensive test message"

**Steps:**
1. User A: Open the crew/gym chat
2. Locate User B's message: "This is an offensive test message"
3. Click three-dot menu on the message (if available)
4. Select "Report Message"
5. Select report type: "Inappropriate"
6. Enter reason: "Testing message-level reporting"
7. Submit report

**Expected Results:**
- [ ] Report modal appears with message preview
- [ ] Message body is shown in modal: "This is an offensive test message"
- [ ] Report type and reason fields available
- [ ] After submit: Success confirmation
- [ ] Modal closes

**Database Verification:**
```sql
SELECT * FROM reports
WHERE reporter_id = '[user-a-id]'
  AND reported_message_id IS NOT NULL
ORDER BY created_at DESC LIMIT 1;
```

**Expected Database Result:**
- [ ] New report row exists
- [ ] `reported_message_id` = ID of User B's message
- [ ] `report_type` = 'inappropriate'
- [ ] `status` = 'pending'

**Actual Results:**
_____________________________________________

---

### Test 4.3: Report Validation - Cannot Report Own Message
**Objective:** Verify users cannot report their own messages

**Setup:**
- User A is in a group chat
- User A has sent a message

**Steps:**
1. User A: Try to report their own message (if three-dot menu appears)

**Expected Results:**
- [ ] Three-dot menu does **not** appear on User A's own messages OR
- [ ] If report is attempted, server rejects with error: "Cannot report your own message"

**Actual Results:**
_____________________________________________

---

### Test 4.4: Report Validation - Cannot Report Self
**Objective:** Verify users cannot report themselves

**Setup:**
- User A is logged in

**Steps:**
1. User A: Navigate to their own profile
2. Try to access report action (should not be available)

**Expected Results:**
- [ ] Report button/action is **not available** on own profile
- [ ] If attempted via API: Error "Cannot report yourself"

**Actual Results:**
_____________________________________________

---

## Test Suite 5: Moderator Access

### Test 5.1: Moderator Can View All Reports
**Objective:** Verify moderators can see all reports in database

**Setup:**
- You have moderator access (granted during migration)
- At least 2 reports exist from previous tests

**Steps:**
1. Open Supabase SQL Editor
2. Run query:
```sql
SELECT * FROM reports
WHERE status = 'pending'
ORDER BY created_at DESC;
```

**Expected Results:**
- [ ] Query returns **all** pending reports (not just your own)
- [ ] Reports from other users are visible
- [ ] All columns visible: `id`, `reporter_id`, `reported_user_id`, `reported_message_id`, `report_type`, `reason`, `status`, `created_at`, `moderation_notes`, `moderator_id`, `resolved_at`

**Actual Results:**
_____________________________________________

---

### Test 5.2: Moderator Can Update Report Status
**Objective:** Verify moderators can update reports

**Setup:**
- At least 1 pending report exists
- You have moderator access

**Steps:**
1. Get a report ID from previous query
2. Run update query:
```sql
UPDATE reports
SET status = 'reviewed',
    moderation_notes = 'QA test - reviewed during safety testing',
    moderator_id = '[your-user-id]',
    resolved_at = NOW()
WHERE id = '[report-id]';
```

**Expected Results:**
- [ ] Update succeeds (1 row affected)
- [ ] No RLS policy error
- [ ] Fields are updated correctly

**Verification Query:**
```sql
SELECT status, moderation_notes, moderator_id, resolved_at
FROM reports
WHERE id = '[report-id]';
```

**Expected Verification Result:**
- [ ] `status` = 'reviewed'
- [ ] `moderation_notes` = 'QA test - reviewed during safety testing'
- [ ] `moderator_id` = your user ID
- [ ] `resolved_at` = current timestamp

**Actual Results:**
_____________________________________________

---

### Test 5.3: Non-Moderator Cannot View All Reports
**Objective:** Verify regular users can only see their own reports

**Setup:**
- User A (regular user, not moderator) is logged in
- User A has created at least 1 report

**Steps:**
1. Get User A's auth token
2. Query reports as User A:
```sql
SELECT * FROM reports ORDER BY created_at DESC;
```

**Expected Results:**
- [ ] Query returns **only** User A's reports (where `reporter_id = user_a_id`)
- [ ] Reports from other users are **not visible**
- [ ] RLS policy enforces this restriction

**Actual Results:**
_____________________________________________

---

## Test Suite 6: Edge Cases

### Test 6.1: Block User Then Report User
**Objective:** Verify user can block and report in sequence

**Steps:**
1. User A: Block User B (if not already blocked)
2. User A: Try to report User B (from profile or last known chat)

**Expected Results:**
- [ ] Both actions succeed independently
- [ ] Report is created even though user is blocked
- [ ] No errors or conflicts

**Actual Results:**
_____________________________________________

---

### Test 6.2: Report User Then Block User
**Objective:** Verify user can report and then block

**Steps:**
1. User A: Report User C (from chat)
2. User A: Block User C (from same chat)

**Expected Results:**
- [ ] Both actions succeed
- [ ] Report remains in database
- [ ] Thread disappears from chats list after block

**Actual Results:**
_____________________________________________

---

### Test 6.3: Rate Limit in Group Chat
**Objective:** Verify rate limiting works in group chats (crew, gym, event)

**Steps:**
1. User A: Open crew or gym chat
2. Send 5 messages rapidly
3. Try to send 6th message

**Expected Results:**
- [ ] 6th message is blocked
- [ ] Rate limit error appears
- [ ] Rate limit enforced same as direct chats

**Actual Results:**
_____________________________________________

---

### Test 6.4: Multiple Users Hitting Rate Limit
**Objective:** Verify rate limit is per-user, not per-chat

**Setup:**
- User A and User C are in same group chat

**Steps:**
1. User A: Send 5 messages in group chat
2. User C: Send 5 messages in same group chat (within 10 seconds)

**Expected Results:**
- [ ] Both users can send 5 messages each
- [ ] Rate limit is **per sender**, not per chat
- [ ] Total of 10 messages appear in chat

**Actual Results:**
_____________________________________________

---

## Test Suite 7: Accessibility & UX

### Test 7.1: Safety Page Accessibility
**Objective:** Verify safety pages are accessible on mobile

**Steps:**
1. Open `/safety` on small mobile device (iPhone SE, Android small)
2. Check text readability
3. Check button/link tap targets
4. Scroll through entire page

**Expected Results:**
- [ ] All text is readable (min 14px font size)
- [ ] Links and buttons are tappable (min 44x44px tap target)
- [ ] No horizontal scroll
- [ ] Content fits within viewport
- [ ] Proper spacing between sections

**Actual Results:**
_____________________________________________

---

### Test 7.2: Report Modal on Small Screen
**Objective:** Verify report modal is usable on small screens

**Steps:**
1. Open DAB on small mobile device
2. Open report modal (report user or message)
3. Try to submit report

**Expected Results:**
- [ ] Modal appears centered
- [ ] All form fields are accessible
- [ ] Submit button is visible without scrolling
- [ ] Keyboard doesn't cover submit button
- [ ] Modal closes properly

**Actual Results:**
_____________________________________________

---

### Test 7.3: Block Confirmation Modal UX
**Objective:** Verify block confirmation modal is clear and user-friendly

**Steps:**
1. User A: Initiate block action on User B
2. Read confirmation modal carefully

**Expected Results:**
- [ ] Modal clearly states what will happen: "Block [username]?"
- [ ] Explains consequences: "They won't be able to message you, and you won't see them in your feed."
- [ ] Clear Cancel and Confirm buttons
- [ ] Uses design tokens (not browser confirm dialog)

**Actual Results:**
_____________________________________________

---

## Summary & Sign-off

### Test Results Overview

| Test Suite | Pass | Fail | Blocked | Notes |
|------------|------|------|---------|-------|
| 1. Safety Pages | __ / 4 | __ / 4 | __ / 4 | |
| 2. Block Enforcement | __ / 5 | __ / 5 | __ / 5 | |
| 3. Rate Limiting | __ / 3 | __ / 3 | __ / 3 | |
| 4. Report User | __ / 4 | __ / 4 | __ / 4 | |
| 5. Moderator Access | __ / 3 | __ / 3 | __ / 3 | |
| 6. Edge Cases | __ / 4 | __ / 4 | __ / 4 | |
| 7. Accessibility & UX | __ / 3 | __ / 3 | __ / 3 | |
| **TOTAL** | __ / 26 | __ / 26 | __ / 26 | |

### Critical Issues Found
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

### Minor Issues Found
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

### Recommendations
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

### Sign-off

**Tester Name:** _______________________________
**Date:** _______________________________
**Signature:** _______________________________

**Status:**
- [ ] ✅ All tests passed - Ready for production
- [ ] ⚠️ Minor issues found - Ready with caveats
- [ ] ❌ Critical issues found - Requires fixes before production

---

## Appendix: Useful Database Queries

### View All Reports
```sql
SELECT
  r.id,
  r.report_type,
  r.status,
  r.created_at,
  reporter.username as reporter_username,
  reported.username as reported_username
FROM reports r
LEFT JOIN onboardingprofiles reporter ON r.reporter_id = reporter.id
LEFT JOIN onboardingprofiles reported ON r.reported_user_id = reported.id
ORDER BY r.created_at DESC;
```

### View All Blocks
```sql
SELECT
  b.id,
  b.created_at,
  blocker.username as blocker_username,
  blocked.username as blocked_username,
  b.reason
FROM blocks b
LEFT JOIN onboardingprofiles blocker ON b.blocker_id = blocker.id
LEFT JOIN onboardingprofiles blocked ON b.blocked_id = blocked.id
ORDER BY b.created_at DESC;
```

### Check Rate Limit (Last 10 Seconds)
```sql
SELECT
  COUNT(*) as message_count,
  sender_id
FROM messages
WHERE sender_id = '[user-id]'
  AND created_at > NOW() - INTERVAL '10 seconds'
GROUP BY sender_id;
```

### Check Moderator Status
```sql
SELECT
  m.user_id,
  u.email,
  m.is_active,
  m.granted_at
FROM moderators m
JOIN auth.users u ON m.user_id = u.id
WHERE m.is_active = true;
```
