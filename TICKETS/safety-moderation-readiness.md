# Ticket: Safety and Moderation Readiness

ID: TICKET-TNS-001
Owner: Product/Ops
Status: Implementation Complete - QA Testing Pending
Priority: P0
Workflow Path: Full Pipeline
Created: 2025-12-22
Last updated: 2025-12-26
Target window: Pre-launch
Related docs: `PROJECT_CONTEXT.md`, `QA_SAFETY_TESTING.md`, `QA_AGENT_INSTRUCTIONS.md`

## Problem
Safety flows and moderation protocol must be ready for launch.

## Goal
Verify block/report flows and document moderation processes.

## Scope
- End-to-end testing for block/report.
- Moderation protocol (owners, SLA, escalation).
- Rate limit test (5 messages / 10s).
- Content policy finalized and linked.
- Launch v1 `/safety` and `/community-guidelines` pages.

## Definition of Done
- Protocol documented and safety tests pass.
- `/safety` and `/community-guidelines` pages live with MobileTopbar/Navbar.

## Role addenda

### Design
- **Flow:** Accessible via Profile/Settings and footer of relevant landing/auth pages.
- **Layout:** Mobile-first, single-column text layout.
- **Components:**
  - `MobileTopbar`: Back button + Page Title.
  - `MobileNavbar`: Active on both pages.
  - Typography: Use standard tokens for headers and body.
- **Copy:** Design owns final UX polish to ensure "climber-first" tone.
- **States:** Loading state for fetching content (if dynamic), though v1 will likely be static.

### Technical Lead
- **Pages:** Create `src/app/safety/page.tsx` and `src/app/community-guidelines/page.tsx`.
- **Logic:** Ensure pages are accessible to both authenticated and unauthenticated users (if needed for landing page links), or behind auth if strictly in-app.
- **Protocol:** Define location for `MODERATION_PROTOCOL.md` (recommended `docs/`).

### Implementation
- Files to touch: `src/app/safety/page.tsx`, `src/app/community-guidelines/page.tsx`, `src/app/profile/page.tsx` (to link).
- Use `MobileTopbar` and `MobileNavbar`.

## Decision log
- 2025-12-26: Design to lead copy polish for user-facing safety pages. Moderation protocol to be stored in `docs/MODERATION_PROTOCOL.md`.

---

## Testing Status

### ✅ Implementation Complete
All safety and moderation features have been implemented:
- `/safety` and `/community-guidelines` pages with proper navigation
- Block/report flows fully functional
- Rate limiting (5 messages per 10 seconds) enforced at database level
- Moderation protocol documented in `docs/MODERATION_PROTOCOL.md`
- Moderator access controls and permissions
- Database RLS policies for privacy and security

### 🔴 QA Testing Pending

**Critical Bugs Fixed (2025-12-26):**
During initial testing setup, several blocking bugs were discovered and fixed:
1. Profile deck not rotating through users (home page)
2. RLS policy blocking message sends (thread_participants issue)
3. **CRITICAL SECURITY:** Notifications sent to wrong users (privacy violation)
4. Toast notifications missing sender avatars (UX enhancement)

All blocking issues are now resolved. See `SESSION_NOTES.md` for detailed root cause analysis.

**Comprehensive QA Required:**
The following testing has NOT yet been performed:

📋 **Test Plan:** `QA_SAFETY_TESTING.md` (26 test cases)
📖 **Instructions:** `QA_AGENT_INSTRUCTIONS.md`

**Test Coverage Needed:**
1. **Blocking System** (6 tests)
   - Block user and verify disappearance from all surfaces
   - Bidirectional blocking verification
   - Message send blocking enforcement (database-level)
   - Profile visibility after block/unblock

2. **Reporting System** (8 tests)
   - Report user profiles, messages, and content
   - Moderator report queue access and filtering
   - Report detail view and context
   - Moderator actions (warn, suspend, ban, dismiss)

3. **Rate Limiting** (4 tests)
   - 5 messages per 10 seconds enforcement
   - Database-level trigger verification
   - Error message display to users
   - Rate limit reset after window

4. **Moderation Features** (8 tests)
   - Moderator access controls and permissions
   - Report dashboard functionality
   - User profile moderation actions
   - Audit trail and logging
   - Moderator search and filtering
   - Content policy page accessibility

**Test Accounts Available:**
- User A: `6cf77ad4-3d9f-47ad-96bd-1b3485bc7b2e` (heymatvond@gmail.com) - **MODERATOR**
- User B: `27f2b2e5-1189-4249-8e58-cd2a1445b7d6`
- User C: `d3d9c441-e6f5-44c0-9d7a-070e6c626608`

**Next Steps:**
1. Execute all 26 test cases systematically using `QA_AGENT_INSTRUCTIONS.md`
2. Document any bugs or issues discovered
3. Verify all Definition of Done criteria are met
4. Update ticket status to "Done" once all tests pass

**Estimated Testing Time:** 2-3 hours for comprehensive testing

**Recommendation:**
Use the Task tool with a QA agent to systematically execute the test plan, or perform manual testing following the step-by-step instructions in `QA_AGENT_INSTRUCTIONS.md`.
