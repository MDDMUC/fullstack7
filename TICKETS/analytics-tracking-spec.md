# Ticket: Analytics Tracking Spec (v1)

ID: TICKET-ANA-001
Owner: Product
Status: Proposed
Priority: P2
Created: 2025-12-22
Last updated: 2025-12-22
Target window: Post-launch (B2B readiness)
Related docs: `STRATEGY_RESEARCH_DEMOGRAPHICS.md`, `PROJECT_CONTEXT.md`

## Problem
We do not have a final event taxonomy or tracking schema. Engineering cannot instrument analytics consistently without it.

## Goal
Define a clear v1 analytics taxonomy and property schema for 8 required client events.

## Non-goals
- Do not add new event types beyond the required 8.
- Do not collect PII beyond what is necessary for analysis.

## Scope
- Event names, required properties, optional properties, and examples.
- Definitions for onboarding completion, app_open, match_created, message_sent, event_view, event_rsvp, invite_sent, invite_accepted.

## Requirements
- Naming conventions documented.
- Properties defined for each event.
- Privacy and data minimization checklist.

## Success metrics
- Tracking spec approved by Eng and Tech Lead.
- All 8 events have unambiguous definitions.

## Dependencies
- None.

## Risks
- Ambiguous definitions lead to inconsistent analytics.

## Open questions
- What identifiers are allowed in analytics_events? (Owner: Product/Tech Lead)
- Are any events server-side only? (Owner: Product/Eng)

## Definition of Done
- Tracking spec published and linked from ticket.

