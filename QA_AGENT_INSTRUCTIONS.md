# QA Testing Agent Instructions: Safety Features Testing

## Your Mission
Execute comprehensive end-to-end testing of DAB's safety and moderation features to verify they work correctly before production launch.

## What You're Testing
- Safety and Community Guidelines pages
- User blocking (database-enforced, cannot be bypassed)
- Rate limiting (5 messages per 10 seconds, server-side)
- User and message reporting
- Moderator access controls
- Edge cases and UX

## Prerequisites

### 1. Access Required
- [ ] Access to DAB application (production or staging environment)
- [ ] Access to Supabase SQL Editor for database verification
- [ ] Ability to create 3 test email accounts

### 2. Environment Setup
- [ ] Mobile browser (iOS Safari or Android Chrome)
- [ ] Desktop browser (Chrome, Firefox, or Safari at ≥769px width)
- [ ] Notepad or document to record results

## Setup Phase (15 minutes)

### Step 1: Create Test Accounts

Create **3 separate user accounts** with these details:

**User A (Primary Tester):**
- Email: `qa-test-a@[your-domain].com`
- Username: "QA_User_A"
- Complete full onboarding (photos, gym, interests, etc.)
- **RECORD USER ID:** _________________

**User B (Block Target):**
- Email: `qa-test-b@[your-domain].com`
- Username: "QA_User_B"
- Complete full onboarding
- **RECORD USER ID:** _________________

**User C (Third Party):**
- Email: `qa-test-c@[your-domain].com`
- Username: "QA_User_C"
- Complete full onboarding
- **RECORD USER ID:** _________________

### Step 2: Create Matches

All three users need to match with each other:

1. Login as User A → Swipe right on User B and User C
2. Login as User B → Swipe right on User A and User C
3. Login as User C → Swipe right on User A and User B
4. Verify all 6 matches created (3 pairs)

### Step 3: Join Shared Group

All three users join the same gym chat or crew:

1. Pick a gym chat (e.g., "Boulderwelt Munich")
2. Login as User A → Join gym chat
3. Login as User B → Join same gym chat
4. Login as User C → Join same gym chat
5. Each user sends 1 test message to confirm access

### Step 4: Get Moderator Access

You need to be granted moderator access for Test Suite 5:

1. Get your User A ID from Supabase:
```sql
SELECT id, email FROM auth.users WHERE email = 'qa-test-a@[your-domain].com';
```

2. Ask engineering to run this SQL or run it yourself:
```sql
INSERT INTO moderators (user_id, is_active, granted_by)
VALUES ('[your-user-a-id]', true, '[your-user-a-id]');
```

3. Verify moderator access:
```sql
SELECT * FROM moderators WHERE user_id = '[your-user-a-id]';
```

**✅ Setup Complete - You're ready to start testing**

---

## Testing Phase (60 minutes)

### Instructions
1. Open `QA_SAFETY_TESTING.md` in your editor
2. Execute each test suite sequentially (1 → 7)
3. Check ✓ the boxes as you verify each expected result
4. Record actual results in the provided spaces
5. If a test fails, document the failure clearly
6. Use database queries to verify server-side behavior

### Critical Path Tests (Must Execute)

These tests are **mandatory** - do not skip:

#### ✅ Test 2.2: Block Enforcement (Database Level)
**Why Critical:** Verifies blocks cannot be bypassed

**Steps:**
1. User A blocks User B
2. Attempt to send message from User B to User A (via API or database)
3. **Expected:** Message insert fails with RLS policy error

#### ✅ Test 3.1: Rate Limiting
**Why Critical:** Verifies spam prevention

**Steps:**
1. User A sends 5 messages rapidly in any chat
2. Attempt 6th message immediately
3. **Expected:** 6th message blocked with error: "Rate limit exceeded"

#### ✅ Test 4.1: Report User
**Why Critical:** Verifies reporting system works

**Steps:**
1. User A reports User C
2. Check database for new report row
3. **Expected:** Report exists with status='pending'

#### ✅ Test 5.1: Moderator Access
**Why Critical:** Verifies moderation permissions

**Steps:**
1. Query all reports as moderator (User A)
2. **Expected:** Can see all reports, not just your own

### How to Execute Tests

For each test in `QA_SAFETY_TESTING.md`:

1. **Read the Objective** - Understand what you're testing
2. **Follow Setup** - Complete any prerequisites
3. **Execute Steps** - Perform actions exactly as described
4. **Verify Expected Results** - Check each checkbox if result matches
5. **Record Actual Results** - Write what actually happened
6. **Run Database Verification** - Use provided SQL queries
7. **Move to Next Test** - Continue sequentially

### Example Test Execution

```
Test 3.1: Rate Limit - 5 Messages in 10 Seconds
Status: ✅ PASS

Steps Executed:
1. Logged in as User A
2. Opened direct chat with User C
3. Sent messages: "Test 1", "Test 2", "Test 3", "Test 4", "Test 5"
4. Attempted 6th message: "Test 6"

Expected Results:
✓ Messages 1-5 sent successfully
✓ 6th message rejected by server
✓ Error message: "Rate limit exceeded..."
✓ Console shows database error with hint

Actual Results:
All expected results matched. Rate limiting works correctly.
6th message blocked at 2.3 seconds after 1st message.
Error displayed in toast notification.

Database Verification:
SELECT COUNT(*) FROM messages
WHERE sender_id = '[user-a-id]'
  AND created_at > NOW() - INTERVAL '10 seconds';
Result: 5 messages (correct)

Screenshot: [Optional - attach if issue found]
```

### When You Find Issues

**For each issue found:**

1. **Severity:**
   - 🔴 **CRITICAL** - Feature completely broken, blocks launch
   - 🟡 **MAJOR** - Feature partially broken, workaround exists
   - 🟢 **MINOR** - Cosmetic issue, doesn't affect functionality

2. **Document:**
   - Test ID (e.g., "Test 3.1")
   - What you expected
   - What actually happened
   - Steps to reproduce
   - Screenshot (if UI issue)
   - Database state (if data issue)

3. **Example Issue Report:**
```
🔴 CRITICAL - Test 3.1 Failed

Expected: 6th message blocked with error
Actual: 6th message sent successfully, no error

Steps to Reproduce:
1. Login as User A
2. Open chat with User C
3. Send 6 messages rapidly (< 10 seconds)
4. All 6 messages appear in chat

Database Check:
SELECT COUNT(*) FROM messages
WHERE sender_id = '[user-a-id]'
  AND created_at > NOW() - INTERVAL '10 seconds';
Result: 6 messages (should be 5)

Hypothesis: Rate limit trigger not working
```

---

## Database Verification Queries

Copy these queries to Supabase SQL Editor as needed:

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

### Check Rate Limit (Replace [user-id])
```sql
SELECT
  COUNT(*) as message_count,
  sender_id,
  MAX(created_at) as last_message_time
FROM messages
WHERE sender_id = '[user-id]'
  AND created_at > NOW() - INTERVAL '10 seconds'
GROUP BY sender_id;
```

### Verify Moderator Status
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

---

## Deliverables

### What to Submit

1. **Completed Test Document**
   - `QA_SAFETY_TESTING.md` with all checkboxes marked
   - Actual results recorded for each test
   - Summary section filled out

2. **Test Results Summary**
   - Total: X/26 tests passed
   - List of failed tests (if any)
   - Critical issues found (with severity)
   - Minor issues found
   - Recommendations

3. **Final Status**
   - ✅ Ready for Production (all tests passed)
   - ⚠️ Ready with Caveats (minor issues only)
   - ❌ Not Ready (critical issues found)

### Submission Format

Create a summary report:

```
# QA Testing Summary - Safety Features

**Tester:** [Your Name]
**Date:** 2025-12-26
**Environment:** [Production/Staging]
**Duration:** [X minutes]

## Results Overview
- **Total Tests:** 26
- **Passed:** XX
- **Failed:** XX
- **Blocked:** XX

## Critical Tests Status
✅ Test 2.2 (Block Enforcement) - PASS
✅ Test 3.1 (Rate Limiting) - PASS
✅ Test 4.1 (Report User) - PASS
✅ Test 5.1 (Moderator Access) - PASS

## Issues Found

### Critical Issues (🔴)
1. [None] or [Description]

### Major Issues (🟡)
1. [None] or [Description]

### Minor Issues (🟢)
1. [None] or [Description]

## Recommendations
1. [Your recommendation 1]
2. [Your recommendation 2]

## Final Status
[✅ Ready / ⚠️ Ready with Caveats / ❌ Not Ready]

**Detailed test results:** See attached QA_SAFETY_TESTING.md
```

---

## Success Criteria

**Tests Pass If:**
- All expected results match actual results
- Database state matches expectations
- No errors in browser console (except expected rate limit errors)
- UI renders correctly on mobile and desktop
- All features work as documented in MODERATION_PROTOCOL.md

**Tests Fail If:**
- Expected result doesn't match actual result
- Database query shows incorrect data
- Feature is broken or inaccessible
- Errors appear that shouldn't be there
- User can bypass security measures (blocks, rate limits)

---

## Tips for Efficient Testing

1. **Use Browser Dev Tools**
   - Open Console to see errors
   - Use Network tab to see API calls
   - Check for failed requests

2. **Keep Browser Tabs Organized**
   - Tab 1: User A
   - Tab 2: User B
   - Tab 3: User C
   - Tab 4: Supabase SQL Editor

3. **Test Systematically**
   - Don't skip tests
   - Complete one suite before moving to next
   - Document as you go, not at the end

4. **Use Incognito Windows**
   - Prevents session conflicts
   - Each user in separate incognito window

5. **Take Screenshots**
   - Screenshot any failures
   - Screenshot unexpected behavior
   - Screenshots help engineering debug

---

## Timeline

**Estimated Time:**
- Setup (3 accounts + matching): 15 min
- Test Suite 1 (Safety Pages): 10 min
- Test Suite 2 (Block Enforcement): 15 min
- Test Suite 3 (Rate Limiting): 10 min
- Test Suite 4 (Report User): 15 min
- Test Suite 5 (Moderator Access): 5 min
- Test Suite 6 (Edge Cases): 10 min
- Test Suite 7 (Accessibility): 10 min
- Documentation & Summary: 10 min

**Total: ~90 minutes**

---

## Questions or Issues During Testing?

**If you get stuck:**
1. Re-read the test instructions carefully
2. Check the database state to understand what's happening
3. Try the test again in a fresh incognito window
4. Document the blocker and move to next test
5. Note which tests were blocked in your summary

**If engineering support is needed:**
1. Document exactly what you did
2. Provide the error message or unexpected behavior
3. Include database query results
4. Note which test ID is affected

---

## Start Testing Now

1. ✅ Confirm you have access to DAB and Supabase
2. ✅ Create 3 test accounts (User A, B, C)
3. ✅ Complete setup phase (matching, group chat)
4. ✅ Get moderator access for User A
5. ✅ Open `QA_SAFETY_TESTING.md`
6. ✅ Start with Test Suite 1
7. ✅ Execute all 26 tests
8. ✅ Submit summary report

**Good luck! Test thoroughly and document everything.** 🚀
