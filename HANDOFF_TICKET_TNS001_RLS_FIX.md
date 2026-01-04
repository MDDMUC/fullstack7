# Handoff: TICKET-TNS-001 RLS Block Enforcement Nuclear Fix

## Model
- **Name**: Claude Code (Claude Sonnet 4.5)
- **Version**: claude-sonnet-4-5-20250929

## Ticket
- **ID**: TICKET-TNS-001 (continued)
- **Title**: Safety and Moderation Readiness - RLS Block Enforcement FAILURE
- **File Path**: See SESSION_NOTES.md (2026-01-04 entry)
- **Priority**: P0 (Launch Blocker)

## Workflow Path
- **Full Pipeline** (requires Technical Lead sign-off for RLS/schema changes)

## Context

### Goal
Fix critical RLS policy failure on messages table that allows blocked users to send messages, violating safety requirements for launch.

### Current Status
Implementation complete, awaiting Technical Lead review and deployment.

### Problem Summary
QA automation (Test 2.2) consistently fails - blocked users can still send messages despite active blocks.

**Root Causes Identified**:
1. "Ghost policies" from earlier migrations creating permissive OR logic
2. Previous fixes used hardcoded policy names in DROP statements (missed some policies)
3. Previous fixes only checked one direction of blocking (incomplete)

### Files Created/Modified

**New Files**:
- `supabase/FIX_RLS_NUCLEAR.sql` - Comprehensive fix script with dynamic policy cleanup
- `supabase/APPLY_FIX_INSTRUCTIONS.md` - Step-by-step deployment guide
- `HANDOFF_TICKET_TNS001_RLS_FIX.md` - This handoff document

**Modified Files**:
- `SESSION_NOTES.md` - Added detailed implementation notes (lines 1-102)

## Decisions

### Key Technical Decisions

1. **Dynamic Policy Cleanup vs. Hardcoded Names**
   - **Decision**: Use `pg_policies` query with dynamic EXECUTE to drop ALL policies
   - **Rationale**: Hardcoded DROP statements in previous fixes missed ghost policies
   - **Implementation**: DO block queries pg_policies and executes DROP for each result

2. **SECURITY DEFINER Function for Block Checking**
   - **Decision**: Create SECURITY DEFINER function to bypass blocks table RLS
   - **Rationale**: Standard policies can't see blocks table due to RLS visibility constraints
   - **Security Consideration**: Function has SET search_path = public to prevent injection
   - **Requires**: Tech Lead review of security implications

3. **Bidirectional Block Enforcement**
   - **Decision**: Check BOTH directions (sender blocked by receiver AND sender has blocked receiver)
   - **Rationale**: Previous fix only checked if sender was blocked (one direction)
   - **Impact**: Prevents messages when ANY block relationship exists

4. **Single INSERT Policy Approach**
   - **Decision**: ONE comprehensive INSERT policy instead of multiple additive policies
   - **Rationale**: Multiple policies use OR logic - any permissive policy grants access
   - **Result**: Single restrictive policy = single source of truth

## Task

### For Technical Lead
1. **Review SECURITY DEFINER Function** (`is_sender_blocked_from_thread`)
   - Verify security implications of DEFINER permissions
   - Confirm search_path restriction is adequate
   - Validate bidirectional block logic is correct

2. **Review RLS Policy Logic** (`messages_insert_with_blocks_and_participants`)
   - Verify three-condition AND logic is complete
   - Confirm no edge cases or bypasses exist
   - Validate integration with thread_participants table

3. **Review Rate Limiting Trigger** (`check_message_rate_limit`)
   - Confirm 5 messages per 10 seconds is appropriate limit
   - Verify error handling (ERRCODE P0001) is correct
   - Validate trigger timing (BEFORE INSERT)

4. **Approve or Request Changes**
   - If approved: sign off for deployment and handoff to QA
   - If changes needed: document specific issues and hand back to Implementation Engineer

### After Tech Lead Sign-off
5. **Deploy Fix** (can be delegated to Implementation or Ops)
   - Follow steps in `supabase/APPLY_FIX_INSTRUCTIONS.md`
   - Run verification queries to confirm single INSERT policy exists

6. **Hand Off to QA**
   - QA should run: `npx tsx scripts/qa-safety-automation.ts <SERVICE_ROLE_KEY>`
   - Expected: All tests pass (Test 2.2, 3.1, 4.1)

## Handoff To
- **Role**: Technical Lead / Architect
- **Next Action**: Review RLS changes and SECURITY DEFINER function for security approval

## Constraints

### Do-Not-Do Rules for This Task
- ❌ Do NOT apply this fix to production without Tech Lead sign-off (schema/RLS changes)
- ❌ Do NOT modify the SECURITY DEFINER function without security review
- ❌ Do NOT create additional INSERT policies (would re-introduce OR logic issue)
- ❌ Do NOT skip QA automation tests before marking as resolved
- ❌ Do NOT change rate limit (5 messages/10s) without Product approval

### Safety Constraints
- Must maintain RLS on messages table (do not disable)
- Must preserve rate limiting trigger
- Must not break existing legitimate message sends
- Must handle both direct and group thread types

## Definition of Done

### Pass/Fail Criteria

**Tech Lead Review** (must pass before deployment):
- [ ] SECURITY DEFINER function reviewed for security implications
- [ ] RLS policy logic validated for completeness
- [ ] Rate limiting trigger approved
- [ ] No unintended side effects identified
- [ ] Sign-off documented

**Deployment Verification** (must pass after SQL execution):
- [ ] `pg_policies` query shows ONLY 1 INSERT policy on messages table
- [ ] Policy name is `messages_insert_with_blocks_and_participants`
- [ ] Trigger `enforce_message_rate_limit` exists
- [ ] Function `is_sender_blocked_from_thread` exists with SECURITY DEFINER

**QA Automation Tests** (must pass):
- [ ] Test 2.2: Block Enforcement - PASS (blocked user message rejected)
- [ ] Test 3.1: Rate Limiting - PASS (5 messages sent, 6th rejected)
- [ ] Test 4.1: Reporting - PASS (report created successfully)

**Production Validation** (manual smoke test):
- [ ] Legitimate users can send messages in threads
- [ ] Blocked users CANNOT send messages
- [ ] Rate limiting triggers after 5 messages in 10 seconds
- [ ] No errors in Supabase logs

## Risks and Questions

### Risks
1. **SECURITY DEFINER Function Risk** (MEDIUM)
   - **Risk**: Function runs with elevated permissions, could be exploited if flawed
   - **Mitigation**: SET search_path = public, simple logic with no dynamic SQL
   - **Owner**: Tech Lead to validate

2. **Policy Compatibility Risk** (LOW)
   - **Risk**: Dynamic policy cleanup might affect non-INSERT policies
   - **Mitigation**: DO block filters for `cmd = 'INSERT'` only
   - **Owner**: Implementation Engineer (verified in script)

3. **Rate Limit False Positives** (LOW)
   - **Risk**: Legitimate rapid messages might be blocked
   - **Mitigation**: 5 messages/10s is reasonable for human users
   - **Owner**: Monitor production logs post-deployment

4. **Rollback Complexity** (MEDIUM)
   - **Risk**: If fix fails, rollback requires restoring previous (broken) policy
   - **Mitigation**: No good rollback path - fix must work or iterate
   - **Owner**: Tech Lead to ensure fix is correct before deployment

### Open Questions
1. **Q**: Should we add logging to the SECURITY DEFINER function for debugging?
   - **Owner**: Tech Lead
   - **Context**: Could help diagnose future block enforcement issues

2. **Q**: Should rate limit be configurable or hardcoded?
   - **Owner**: Product Strategist
   - **Context**: Current: 5 messages/10s hardcoded. Future: per-user limits?

3. **Q**: Do we need monitoring/alerts for block enforcement violations?
   - **Owner**: Tech Lead
   - **Context**: Would help detect if issue recurs

## Artifacts/Links

### Implementation Files
- **Fix Script**: `supabase/FIX_RLS_NUCLEAR.sql` (142 lines)
- **Deployment Guide**: `supabase/APPLY_FIX_INSTRUCTIONS.md`
- **Session Notes**: `SESSION_NOTES.md` (lines 1-102)

### Reference Files
- **QA Automation**: `scripts/qa-safety-automation.ts` (Test 2.2 on line 143)
- **Failed Fix 1**: `supabase/FIX_SAFETY_CRITICAL.sql` (reference only)
- **Failed Fix 2**: `supabase/FIX_BLOCK_VISIBILITY.sql` (reference only)

### Database Queries
- **Debug RLS State**: `supabase/DEBUG_RLS.sql` (view all policies on messages table)
- **Verification Queries**: Included in FIX_RLS_NUCLEAR.sql (lines 150-175)

### Related Tickets
- **TICKET-TNS-001**: Original safety and moderation readiness ticket
- **No follow-up tickets**: This is a critical fix, not a new feature

---

## Summary for Tech Lead

This is a P0 launch blocker fix for a critical RLS policy failure. The fix uses:
1. **Dynamic policy cleanup** to eliminate ghost policies
2. **SECURITY DEFINER function** to check bidirectional blocks (requires security review)
3. **Single restrictive INSERT policy** to enforce blocks at database level

**Action Required**: Review security implications of SECURITY DEFINER function and approve/reject for deployment.

**Timeline**: Blocking launch - needs immediate review and deployment upon approval.

**Risk Level**: Medium (SECURITY DEFINER function) - requires careful review.
