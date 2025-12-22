# Ticket: Group Reporting + Message-level Reporting

ID: TICKET-TNS-002
Owner: Product/Eng
Status: Proposed
Priority: P1
Created: 2025-12-22
Last updated: 2025-12-22
Target window: Pre-launch readiness
Related docs: `PROJECT_CONTEXT.md`, `TICKET-TNS-001`

## Problem
Reporting is currently limited to direct chats and profile cards. Group chats (crew, gym, event) lack report entry points and there is no message-level reporting.

## Goal
Provide consistent report and block tools across all thread types to improve safety readiness.

## Non-goals
- No automated moderation or ML triage in v1.
- No new admin dashboards (can be added later).

## Target user
- Users participating in crew, gym, and event chats.

## Scope
- Add report actions to group chat message UI.
- Extend ReportModal to support message_id and optional user_id.
- Add block user action in group threads.
- Hide blocked users' messages where feasible.
- Ensure report entries are written to `reports` with type + reason.

## Requirements
- Report flows must work for direct and group threads.
- Users cannot report themselves.
- RLS must prevent users from reading others' reports.

## Success metrics
- Reports can be filed from any chat type.
- Reports are stored with correct user and message IDs.
- Blocked users no longer appear in message feeds.

## Analytics / instrumentation
- Defer to analytics phase (TICKET-ANA-001).

## Dependencies
- TICKET-TNS-001 moderation protocol.
- QA pass for safety flows.

## Risks
- Inconsistent UI entry points across thread types.
- Edge cases with deleted messages or missing sender profiles.

## Open questions
- Do we offer "report message" and "report user" separately in v1? (Owner: Product)

## Definition of Done
- Reference `DEFINITION_OF_DONE.md`

## Role addenda

### Design
- Flow and screens: Message action menu; report modal in group threads.
- States and empty states: Success state, error state, blocked state.
- Copy guidance: Keep report language clear and neutral.

### Technical Lead
- Schema changes: None expected.
- RLS and permissions: Confirm `reports` table policies.
- API contracts: None beyond existing `reportUser`/`reportMessage`.

### Implementation
- Files to touch: `src/components/ReportModal.tsx`, `src/app/chats/[id]/page.tsx`, `src/app/crew/detail/page.tsx`, `src/app/chats/page.tsx` (if needed).
- Reuse components: `ActionMenu`, `Modal`.
- Test plan: Report user, report message, block user in group threads.

### QA
- Risk review: report creation, block visibility, RLS coverage.
- Test coverage gaps: group threads and missing avatars.
- Acceptance checks: report entries saved; blocked content hidden.

## Decision log
- Date:
- Decision:
- Rationale:
