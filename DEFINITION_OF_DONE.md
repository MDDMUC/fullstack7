# DEFINITION_OF_DONE.md

This is the checklist for finishing any task in DAB.

## Product and UX
- Requirements and acceptance criteria met.
- Mobile-first layout verified (iOS Safari, Android Chrome).
- New pages include MobileTopbar and MobileNavbar, except the onboarding flow on mobile (desktop can include).
- No new empty states without seed data or fallback.

## Design System
- Design tokens used for colors, spacing, and sizing.
- No hard-coded UI values unless explicitly documented.
- Dark theme only.

## Data, Security, and Permissions
- RLS enabled for any new tables or views.
- Input validation for user-provided data.
- Rate limiting applied to mutations where appropriate.
- No exposure of secrets; only public keys use NEXT_PUBLIC_ prefix.

## Code Quality
- Lint passes (`npm run lint`).
- Build not broken (`npm run build`) when feasible.
- Types are explicit; no `any`.
- Reused components and utilities before adding new ones.

## Testing
- Automated tests added when practical.
- If not, a manual test plan is written and executed.
- Critical flows verified: auth, chat, events, crews, profiles (as applicable).

## Observability (when relevant)
- Analytics events added/updated per tracking spec.
- Metrics or dashboards updated if task touches analytics.

## Documentation
- `SESSION_NOTES.md` updated for significant changes.
- `DECISIONS.md` updated for new architectural or product decisions.
