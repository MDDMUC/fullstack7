# Ticket: Presence Feature Gating (Check-ins, Gym Chat, Partner Finder)

ID: TICKET-PRES-002
Owner: Product/Eng
Status: Proposed
Priority: P1
Created: 2025-12-22
Last updated: 2025-12-22
Target window: Pre-launch readiness
Related docs: `PROJECT_CONTEXT.md`, `AGENT_START.md`

## Problem
Public pages for Check-ins, Gym Chat, and Partner Finder are accessible via the site header and imply real-time presence and sponsorship. This conflicts with the current privacy and monetization constraints.

## Goal
Gate or hide presence-related concept pages until Phase 2 so pre-launch users are not exposed to realtime check-ins or sponsor content.

## Non-goals
- No removal of the Phase 2 concept entirely.
- No changes to mobile app core flows.

## Target user
- Pre-launch visitors and early users in Munich.

## Scope
- Remove presence-related links from `ClientHeader` in production.
- Add a feature flag (env or config) to enable these pages for internal preview.
- Redirect or show "Coming soon" state when disabled.
- Ensure no production flows rely on `checkins`, `gym_threads`, or `sessions` tables.

## Requirements
- Must respect the "no realtime check-ins" constraint until Phase 2.
- Sponsor content should not be visible in pre-launch builds.

## Success metrics
- Production builds do not show presence pages or sponsor content.
- Internal preview can still access the pages when flagged on.

## Analytics / instrumentation
- None.

## Dependencies
- None.

## Risks
- Hidden pages may still be indexed if not redirected.

## Open questions
- Do we prefer redirect to `/home` or a "Coming soon" page? (Owner: Product)

## Definition of Done
- Reference `DEFINITION_OF_DONE.md`

## Role addenda

### Design
- Flow and screens: "Coming soon" state if not redirecting.
- States and empty states: Locked state, preview state.
- Copy guidance: Emphasize privacy-first and Phase 2.

### Technical Lead
- Schema changes: None.
- RLS and permissions: None.
- API contracts: None.

### Implementation
- Files to touch: `src/components/ClientHeader.tsx`, `src/app/check-in/page.tsx`, `src/app/gym-chat/page.tsx`, `src/app/partner-finder/page.tsx`.
- Reuse components: `EmptyState` or a light "coming soon" view.
- Test plan: Flag on/off, verify routes and header links.

### QA
- Risk review: route exposure, SEO indexing.
- Test coverage gaps: deployment env flags.
- Acceptance checks: presence pages not accessible in production.

## Decision log
- Date:
- Decision:
- Rationale:
