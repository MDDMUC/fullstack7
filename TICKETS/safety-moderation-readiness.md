# Ticket: Safety and Moderation Readiness

ID: TICKET-TNS-001
Owner: Product/Ops
Status: Done
Priority: P0
Workflow Path: Full Pipeline
Created: 2025-12-22
Last updated: 2026-01-04
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

### QA Testing Complete (2026-01-04)

**QA Handoff:** Gemini Flash (latest)

**Results:**
- Block enforcement: PASS. Bidirectional blocks enforced at RLS using a SECURITY DEFINER function.
- Rate limiting: PASS. 5 messages / 10 seconds trigger enforced.
- User reporting: PASS. Reports logged to database.

**Cleanup:**
- Temporary QA accounts removed.
- QA automation scripts removed from repo.
- RLS enabled and forced on `messages`.

**Status:** Ticket closed after QA verification.
