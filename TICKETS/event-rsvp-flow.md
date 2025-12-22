# Ticket: Event RSVP Flow + "I'm Going"

ID: TICKET-EVT-001
Owner: Product/Eng
Status: Proposed
Priority: P1
Created: 2025-12-22
Last updated: 2025-12-22
Target window: Pre-launch readiness
Related docs: `PROJECT_CONTEXT.md`, `TICKET-QA-001`

## Problem
Event detail has an "I'm Going" CTA but no RSVP logic. Slots do not update and users cannot see reliable attendance, which weakens event activation.

## Goal
Ship a lightweight RSVP flow that updates attendance and ties into event chats.

## Non-goals
- No paid ticketing or monetization.
- No advanced calendar integrations in v1.

## Target user
- Logged-in users browsing and joining events.

## Scope
- Add `event_rsvps` table (event_id, user_id, status, created_at) with RLS.
- Implement "I'm Going" CTA: create RSVP, update slots_open, and show RSVP state.
- Allow un-RSVP to free a slot.
- Update event detail and event list to reflect going counts.
- Ensure RSVP users can access the event chat (create thread if needed).

## Requirements
- Slots_open cannot go below zero.
- RSVP state must be idempotent per user per event.
- RLS: users can read their RSVPs and public counts.

## Success metrics
- Users can RSVP and see the updated count.
- RSVP state persists across refresh.
- Event list shows accurate going counts.

## Analytics / instrumentation
- Defer to analytics phase (TICKET-ANA-001).

## Dependencies
- Tech Lead sign-off for schema changes and RLS.
- QA pass on RSVP state and slot counts.

## Risks
- Off-by-one slot counts when RSVP and un-RSVP race.
- Existing events missing slots_open values.

## Open questions
- Do we show an attendee list or only counts in v1? (Owner: Product)

## Definition of Done
- Reference `DEFINITION_OF_DONE.md`

## Role addenda

### Design
- Flow and screens: Event detail RSVP state; event list badge.
- States and empty states: Sold out, RSVP saved, RSVP removed.
- Copy guidance: "I'm Going" vs "Leave".

### Technical Lead
- Schema changes: `event_rsvps` table and indexes.
- RLS and permissions: public read of counts, private read of own RSVPs.
- API contracts: RSVP create/delete endpoints via Supabase.

### Implementation
- Files to touch: `src/app/events/detail/page.tsx`, `src/app/events/page.tsx`, `src/lib/*`.
- Reuse components: `ButtonCta`, `EmptyState`, `LoadingState`.
- Test plan: RSVP add/remove, slot count updates, chat access.

### QA
- Risk review: race conditions, slot count accuracy, RLS exposure.
- Test coverage gaps: events without slots.
- Acceptance checks: RSVP persists, counts update, no console errors.

## Decision log
- Date:
- Decision:
- Rationale:
