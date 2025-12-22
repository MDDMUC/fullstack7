# Ticket: Analytics Views + Metrics Dashboard + CSV Export

ID: TICKET-ANA-003
Owner: Eng/Data
Status: Proposed
Priority: P2
Created: 2025-12-22
Last updated: 2025-12-22
Target window: Post-launch (B2B readiness)
Related docs: `PROJECT_CONTEXT.md`, TICKET-ANA-002

## Problem
We have no retention/funnel views or internal metrics dashboard for partnerships.

## Goal
Build retention/funnel views, /admin/metrics dashboard, and CSV export for sponsor decks.

## Non-goals
- No external analytics tooling.

## Scope
- SQL views: D1/D7/D30 retention, match->message funnel, event_view->rsvp funnel, invite funnel.
- /admin/metrics page with role gate.
- CSV export including summary and daily breakdown.

## Requirements
- Filters: date range, city, gym, source.
- Key metric cards: Day 7 retention, match <24h, chat start rate.

## Success metrics
- Dashboard loads with real data.
- CSV export works in Excel/Sheets.

## Dependencies
- TICKET-ANA-002 (events table + instrumentation).

## Risks
- Slow queries or incorrect cohorts.

## Open questions
- Final list of charts for v1. (Owner: Product/Eng)

## Definition of Done
- Dashboard live at /admin/metrics and CSV export validated.

