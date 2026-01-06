# Ticket: Analytics Tracking Spec (v1)

ID: TICKET-ANA-001
Owner: Product
Status: Ready for Implementation
Priority: P2
Created: 2025-12-22
Last updated: 2026-01-05
Target window: Pre-launch (Activation readiness)
Related docs: `STRATEGY_RESEARCH_DEMOGRAPHICS.md`, `PROJECT_CONTEXT.md`, `docs/EVENT_TAXONOMY.md`

## Problem
We do not have a final event taxonomy or tracking schema. Engineering cannot instrument analytics consistently without it.

## Goal
Define a clear v1 analytics taxonomy and property schema for the 8 required client events plus onboarding step events.

## Non-goals
- Do not add new event types beyond the required 8 plus onboarding step events.
- Do not collect PII beyond what is necessary for analysis.
- Defer onboarding_step_error to v1.1.

## Scope
- Event names, required properties, optional properties, and examples.
- Definitions for onboarding completion, app_open, match_created, message_sent, event_view, event_rsvp, invite_sent, invite_accepted.
- Add onboarding step events: onboarding_step_started, onboarding_step_completed.
- Design spec for an admin analytics dashboard (core metrics + onboarding funnel performance).

## Requirements
- Naming conventions documented.
- Properties defined for each event.
- Privacy and data minimization checklist.
- Step events include: step_id (enum), step_index (int), onboarding_version (string), duration_ms (int, only on completed).
- Dashboard design includes overview metrics, onboarding funnel/drop-off views, and step-level performance.

## Success metrics
- Tracking spec approved by Eng and Tech Lead.
- All required events have unambiguous definitions.
- Step-level onboarding events approved for v1.

## Dependencies
- None.

## Risks
- Ambiguous definitions lead to inconsistent analytics.
- Migration drift if live analytics schema is not captured in Supabase migrations.

## Open questions
- What identifiers are allowed in analytics_events? (Owner: Product/Tech Lead)
- Are any events server-side only? (Owner: Product/Eng)
- Drop-off inference rule for step events (timeout or session end)? (Owner: Product/Eng)
- Final step_id enum list aligned with onboarding steps? (Owner: Product/Eng)

## Decision log
- 2026-01-05: Add onboarding_step_started and onboarding_step_completed in v1 with minimal non-PII properties. Defer onboarding_step_error to v1.1.
- 2026-01-05: Keep analytics select restricted to service_role only (no admin_users dependency).
- 2026-01-05: Use baseline migration for live analytics schema, then extend event_name CHECK constraint in a new migration.

## Notes
- Taxonomy expects signup logged in SuccessStep, but current code logs in PledgeStep; reconcile during implementation.

## Definition of Done
- Tracking spec published and linked from ticket.
- Admin analytics dashboard design spec completed and linked from ticket: `docs/ADMIN_ANALYTICS_DASHBOARD_DESIGN.md`.
