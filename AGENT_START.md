# AGENT_START.md

This is the mandatory entry point for any agent or model. Read this first.

Read order
1. AGENT_START.md (this file)
2. PROJECT_CONTEXT.md (source of truth)
3. AGENTS.md (roles, models, and handoff)
4. Your role file (see AGENTS.md)
5. Open the relevant ticket in `TICKETS/` (see `TICKETS/README.md`)
6. If no ticket exists, start with `TICKETS/TICKET_STARTER.md`

Model selection
- Use the preferred model listed in your role file.
- If unavailable, use the fallback listed in AGENTS.md and note it in your handoff.

If role is unclear
- Default to Product Strategist and ask the user to confirm the role.

Project snapshot
- DAB is a mobile-first dating/social app for climbers.
- Stack: Next.js 16, React 19, Tailwind CSS v4, Supabase.
- Chat-centric product with dark theme only.

Current phase
- Pre-launch activation and safety readiness (focus for live users).
- Onboarding flow optimization.
- Safety and moderation readiness.
- Push notification infrastructure ready.
- Pre-launch product readiness QA.
- Content seeding and legal readiness.
- Analytics is deferred to post-launch B2B readiness.

Non-negotiable constraints
- No monetization features in H1 2026.
- No realtime check-ins (Friends in Gym Phase 2).
- New pages must include MobileTopbar and MobileNavbar, except the onboarding flow on mobile (desktop can include).
- Use design tokens from src/app/tokens.css; no hard-coded UI values.
- All new tables must have RLS policies.
- Validate user input and permissions; rate limit mutations.

How to work
- Use the handoff template in AGENTS.md for any output.
- If there is no ticket, create one using `TICKETS/TEMPLATE_PRODUCT.md` and add it to `TICKETS/INDEX.md`.
- Reuse existing components and utilities before adding new ones.
- Update SESSION_NOTES.md for significant changes.
- Update DECISIONS.md for new decisions.

Key paths
- src/app/ (routes)
- src/components/ (UI)
- src/lib/ (Supabase and helpers)
- supabase/ (migrations and RLS)
