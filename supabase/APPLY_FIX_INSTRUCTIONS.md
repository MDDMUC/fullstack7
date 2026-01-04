# Apply RLS Nuclear Fix - Instructions

**Priority:** P0 (Launch Blocker)
**Ticket:** TICKET-TNS-001 (Block Enforcement Failure)
**Fix Script:** `supabase/FIX_RLS_NUCLEAR.sql`

## Problem Summary

The messages table RLS is failing to enforce block relationships due to:
1. **Ghost policies** from earlier migrations creating permissive OR logic
2. **Incomplete block checking** in previous fix attempts (only checking one direction)
3. **RLS visibility issues** on the blocks table preventing policy evaluation

## Solution Overview

The nuclear fix script (`FIX_RLS_NUCLEAR.sql`) resolves all three issues:

1. **Dynamic policy cleanup:** Queries `pg_policies` and drops ALL INSERT policies (no hardcoded names)
2. **Bidirectional block checking:** New SECURITY DEFINER function checks BOTH:
   - If sender is blocked by any thread participant
   - If sender has blocked any thread participant
3. **Single restrictive policy:** Creates ONE comprehensive INSERT policy that enforces all safety rules

## How to Apply the Fix

### Step 1: Open Supabase SQL Editor

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project: `sbygogkgwthgdzomaqgz`
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Copy and Execute the Fix Script

1. Open the file `supabase/FIX_RLS_NUCLEAR.sql` in your editor
2. Copy the ENTIRE contents (including BEGIN and COMMIT)
3. Paste into the Supabase SQL Editor
4. Click **Run** (or press Ctrl/Cmd + Enter)

### Step 3: Verify Success

The script includes verification queries at the end. You should see:

**Messages Policies:**
```
Only ONE INSERT policy should exist:
- Policy Name: messages_insert_with_blocks_and_participants
- Command: INSERT
```

**Rate Limiting Trigger:**
```
Trigger Name: enforce_message_rate_limit
Event: INSERT
```

**Security Function:**
```
Function Name: is_sender_blocked_from_thread
Security Type: DEFINER
```

### Step 4: Run QA Automation Tests

From your terminal in the project root:

```bash
# You'll need the SUPABASE_SERVICE_ROLE_KEY
# Get it from: Supabase Dashboard > Settings > API > service_role key (secret)

npx tsx scripts/qa-safety-automation.ts <YOUR_SERVICE_ROLE_KEY>
```

**Expected Results:**

- ✅ **Test 2.2 (Block Enforcement):** PASS - Message from blocked user is rejected
- ✅ **Test 3.1 (Rate Limiting):** PASS - Exactly 5 messages sent, 6th rejected
- ✅ **Test 4.1 (Reporting):** PASS - Report created successfully

### Step 5: Manual Verification (Optional)

If you want to manually verify the fix:

1. Create two test users (A and B)
2. Create a match between them
3. User A blocks User B
4. Try to send a message as User B
5. **Expected:** INSERT fails with RLS policy violation error

## Rollback Plan (If Needed)

If the fix causes issues, you can restore the previous policy by running:

```sql
-- This would restore the last attempted fix
-- Located in: supabase/FIX_BLOCK_VISIBILITY.sql
```

However, this is NOT recommended as it has the same bug. Instead, debug the specific issue.

## Technical Details

### Key Changes

**SECURITY DEFINER Function:**
```sql
is_sender_blocked_from_thread(p_thread_id UUID, p_sender_id UUID) -> BOOLEAN
```

This function:
- Runs with elevated permissions (bypasses RLS on blocks table)
- Checks both directions: `blocker->blocked` and `blocked->blocker`
- Returns TRUE if ANY block relationship exists between sender and thread participants

**INSERT Policy:**
```sql
messages_insert_with_blocks_and_participants
```

Enforces:
1. `auth.uid() = sender_id` (user must be sender)
2. User must be a participant in the thread
3. No block relationship exists (via SECURITY DEFINER function)

**Rate Limiting Trigger:**
- Max 5 messages per 10 seconds per user
- Fires BEFORE INSERT
- Returns ERRCODE 'P0001' with helpful hint

## Next Steps After Fix

1. ✅ Run QA automation and verify all tests pass
2. ✅ Update TICKET-TNS-001 status to "Ready for QA"
3. ✅ Notify stakeholders that P0 blocker is resolved
4. Monitor production logs for any edge cases after deployment

## Questions or Issues?

If tests still fail after applying this fix:
1. Check the verification queries output - ensure only 1 INSERT policy exists
2. Run `supabase/DEBUG_RLS.sql` to see exact policy state
3. Check for any custom RLS configurations in Supabase Dashboard
4. Escalate to Technical Lead for schema review
