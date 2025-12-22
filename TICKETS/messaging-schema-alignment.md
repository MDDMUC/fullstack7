# Ticket: Messaging Schema Alignment + Unread Reliability

ID: TICKET-CHAT-001
Owner: Eng
Status: Proposed
Priority: P1
Created: 2025-12-22
Last updated: 2025-12-22
Target window: Pre-launch readiness
Related docs: `PROJECT_CONTEXT.md`, `TICKET-QA-001`, `TICKET-NOT-002`

## Problem
Message rows are queried with both user_id and sender_id/receiver_id across the app. This breaks unread logic and notifications and risks runtime errors if the schema does not match.

## Goal
Standardize on the canonical message schema and make unread and notification logic reliable in all thread types.

## Non-goals
- No new notification types or push behavior.
- No UI redesign of chat.

## Target user
- All logged-in users in chats, crews, and events.

## Scope
- Choose canonical columns for messages (sender_id, receiver_id, status).
- Update reads/writes to use the canonical fields.
- Fix group-thread read logic (crew detail uses receiver_id today).
- Fix event join system message status to use valid status.
- Align in-app notifications message query to the canonical schema.
- Add migration/backfill if the DB still has user_id-only rows.

## Requirements
- Unread rules must match `isMessageUnread` for direct and group threads.
- No schema changes without Tech Lead sign-off.
- No regressions in chat list ordering or unread badges.

## Success metrics
- Unread badges match message states in chats and crews.
- Notifications page consistently shows recent messages.
- No console errors for missing message columns.

## Analytics / instrumentation
- None (deferred to analytics phase).

## Dependencies
- Tech Lead decision on canonical message columns.
- QA pass on direct, gym, event, and crew threads.

## Risks
- Mixed historical data requires backfill or compatibility layer.
- RLS policies may need adjustments after schema alignment.

## Open questions
- Which message columns are authoritative in production (sender_id/receiver_id vs user_id)? (Owner: Tech Lead)

## Definition of Done
- Reference `DEFINITION_OF_DONE.md`

## Role addenda

### Design
- Flow and screens: N/A
- States and empty states: N/A
- Copy guidance: N/A

### Technical Lead
- Schema changes: Confirm canonical columns; define backfill if needed.
- RLS and permissions: Validate selects/updates for message status.
- API contracts: None beyond schema alignment.

### Implementation
- Files to touch: `src/lib/messages.ts`, `src/app/crew/page.tsx`, `src/app/crew/detail/page.tsx`, `src/app/notifications/page.tsx`, `src/app/events/detail/page.tsx`.
- Reuse components: `isMessageUnread` and `isThreadUnread`.
- Test plan: Direct chat, crew chat, gym chat, event chat; verify unread states and notifications.

### QA
- Risk review: unread counters, notifications feed, message status updates.
- Test coverage gaps: schema mismatch with existing data.
- Acceptance checks: unread badges match expected; no missing messages.

## Decision log
- Date:
- Decision:
- Rationale:
