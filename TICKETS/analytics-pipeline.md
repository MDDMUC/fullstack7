# Ticket: Analytics Pipeline (events table + client instrumentation)

ID: TICKET-ANA-002
Owner: Eng
Status: Proposed
Priority: P2
Created: 2025-12-22
Last updated: 2025-12-22
Target window: Post-launch (B2B readiness)
Related docs: `PROJECT_CONTEXT.md`, TICKET-ANA-001

## Problem
We do not have a production analytics_events table or consistent client event logging.

## Goal
Create analytics_events table with RLS, add logging helper, and instrument the 8 required client events.

## Non-goals
- No dashboard or reporting in this ticket.

## Scope
- Supabase migration for analytics_events with RLS.
- Server logging helper.
- Instrument events: signup (onboarding completion), app_open, match_created, message_sent, event_view, event_rsvp, invite_sent, invite_accepted.

## Requirements
- RLS policies enforced.
- Event payloads follow tracking spec.
- Basic performance validated for inserts.

## Success metrics
- Events insert correctly from client and server.
- Event data matches schema and required properties.

## Dependencies
- TICKET-ANA-001 tracking spec.

## Risks
- Incorrect RLS could expose event data.

## Open questions
- Do we log server-side and client-side for all events? (Owner: Eng)

## Definition of Done
- Table, RLS, helper, and instrumentation merged.

