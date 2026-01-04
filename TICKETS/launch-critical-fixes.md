# Ticket: Launch Critical Fixes (Pre-launch)

ID: TICKET-UX-004
Title: Launch Critical Fixes (Pre-launch)
Owner: Product/Eng
Status: Proposed
Priority: P0
Workflow Path: Fast Lane
Created: 2026-01-04
Last updated: 2026-01-04
Target window: Pre-launch
Related docs: `PROJECT_CONTEXT.md`, `DEFINITION_OF_DONE.md`

## Problem
Small UI and UX defects can block onboarding and reduce activation right before launch.

## Goal
Identify and fix critical launch-blocking UI/UX issues quickly and safely.

## Non-goals
- New features or redesigns.
- Schema, auth, or API changes.
- Large refactors.

## Target user
- New users on mobile devices, especially small screens (320-430px widths).

## Scope
### Issue List
1) P0 - /signup: Password input hidden under the "Let's go" button on small screens; page does not scroll enough to reveal the field.
2) P0 - /home: Style chips duplicated after onboarding (e.g., "Bouldering" shown twice).
3) P0 - /chats: Sent/read notification icon is broken (shows a broken image).

## Requirements
- All form fields are visible or reachable via scroll on small screens.
- Primary CTA does not overlap inputs or obscure focused fields.
- Respect safe-area insets and mobile keyboard behavior.
- Use design tokens only (no hard-coded sizes/colors).

## Success metrics
- No form fields are obscured on 320-430px widths.
- QA confirms signup is usable on mobile with the keyboard open.

## Analytics / instrumentation
- None.

## Dependencies
- QA availability for quick verification.

## Risks
- Scope creep if non-critical polish items are added.

## Open questions
- None yet. Add as new issues are reported.

## Definition of Done
- All P0 issues in this ticket are fixed and verified.
- QA sign-off recorded.
- No new regressions introduced.

## Role addenda

### Design
- Flow and screens: Review any visual changes for consistency with the existing system.
- States and empty states: Ensure keyboard and safe-area states remain readable.
- Copy guidance: Keep existing copy unless a defect requires change.

### Technical Lead
- Schema changes: None expected.
- RLS and permissions: None expected.
- API contracts: None expected.

### Implementation
- Files to touch: Likely `src/app/signup/page.tsx` and related form components.
- Reuse components: Prefer existing input and layout components.
- Test plan: Verify on iOS Safari and Android Chrome at 320px and 375px widths.

### QA
- Risk review: Regression risk on signup flow and CTA placement.
- Test coverage gaps: Mobile keyboard overlap behavior.
- Acceptance checks: Password field visible and focusable; CTA not blocking inputs.

## Decision log
- 2026-01-04: Ticket created to track launch-critical P0 UI/UX fixes.
