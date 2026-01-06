### 2025-12-26: Blocked User Visibility Policy

**Decision:**
- Messages from blocked users are filtered out in the UI for all chat types.
- Direct threads with blocked users are hidden from the main chat list.
- Blocking a user in a direct chat automatically redirects the user away from the chat.

**Rationale:**
- Improves safety and reduces harassment by ensuring users don't have to see content from people they've blocked.
- Filtering at the UI level is a fast and effective way to achieve this without complex backend changes in v1.
- Hiding direct threads completely prevents accidental interaction with blocked users.

Lightweight ADR log for DAB. Add a new entry when a decision changes architecture, product direction, or constraints.

Template
- Date:
- Decision:
- Rationale:
- Impact:
- Links:

## 2026-01-05 - Add onboarding step analytics events in v1
- Decision: Add onboarding_step_started and onboarding_step_completed to analytics taxonomy in v1; defer onboarding_step_error to v1.1; keep analytics select restricted to service_role.
- Rationale: Need early visibility into onboarding drop-off with minimal data collection.
- Impact: Update tracking spec and event_name CHECK constraint; add step-level instrumentation and guard against duplicates.
- Links: `TICKETS/analytics-tracking-spec.md`, `docs/EVENT_TAXONOMY.md`

## 2025-12-22 - Use Next.js App Router
- Decision: Build the frontend with Next.js App Router.
- Rationale: Server Components reduce bundle size and layouts simplify mobile nav.
- Impact: Use `src/app/` routing and shared layouts.
- Links: `PROJECT_CONTEXT.md`

## 2025-12-22 - Use Supabase for backend
- Decision: Use Supabase for Postgres, Auth, Storage, and Realtime.
- Rationale: Fast iteration with built-in auth and RLS.
- Impact: Use Supabase client patterns and enforce RLS on new tables.
- Links: `PROJECT_CONTEXT.md`

## 2025-12-22 - Chat-centric product architecture
- Decision: Make chats the hub for events, gyms, crews, and DMs.
- Rationale: Simplifies navigation and mental model.
- Impact: Most interactions link to thread creation or viewing.
- Links: `PROJECT_CONTEXT.md`

## 2025-12-22 - City-by-city launch
- Decision: Launch city-by-city starting with Munich.
- Rationale: Avoid empty states and enable local density.
- Impact: Features must work with <100 users and allow seeding.
- Links: `PROJECT_CONTEXT.md`

## 2025-12-22 - No B2C monetization in H1 2026
- Decision: Defer monetization features until after growth targets are hit.
- Rationale: Early paywalls reduce network effects.
- Impact: Avoid paywalls, Pro tiers, or credits until criteria are met.
- Links: `PROJECT_CONTEXT.md`

## 2025-12-22 - Canonical messages schema
- Decision: Use sender_id, receiver_id, status as the canonical message columns; treat user_id as legacy-only.
- Rationale: Matches PROJECT_CONTEXT schema and current write paths.
- Impact: Normalize message reads/writes, unread logic, and notifications to sender_id/receiver_id.
- Links: `PROJECT_CONTEXT.md`, `TICKETS/messaging-schema-alignment.md`



## 2025-12-25 - Orchestrator CI trigger criteria (later)
- Decision: Defer orchestrator CI until clear volume threshold; document trigger criteria.
- Rationale: Setup/maintenance overhead vs. current ticket volume; automation only pays when handoff friction is recurring.
- Impact: Revisit when any trigger is met: 8-10 active tickets/week with 3+ roles; or 5+ handoffs/day; or 2+ handoff slips/week due to status ambiguity.
- Links: `AGENTS.md`, `TICKETS/INDEX.md`

## 2025-12-25 - Onboarding mobile nav exception
- Decision: Allow onboarding flow on mobile to omit MobileTopbar and MobileNavbar; desktop can still show top and bottom nav bars.
- Rationale: In order to make onboarding flow as seamless and fast as possible, the user does not need a top nav bar or mobile bottom nav bar before signup; these elements are non-interactive and can add confusion.
- Impact: Global constraint updated with this exception; onboarding mobile pages omit MobileTopbar/MobileNavbar and focus on completion.
- Links: `AGENT_START.md`, `AGENTS.md`, `PROJECT_CONTEXT.md`, `TICKETS/onboarding-flow-optimization.md`

## 2025-12-25 - Defer real-time check-ins until Phase II readiness gates
- Decision: Defer real-time check-ins (Friends in Gym Phase 2) until density, safety, and engagement thresholds are met.
- Rationale: Presence features need local density and trust; early rollout creates empty states and privacy risk.
- Impact: No availability or check-in features in MVP; Phase II gate: consistent peak-hour activity in 2-3 gyms, block/report stability for 4+ weeks, Day 7 retention >40%, match within 24h >60%.
- Links: `PROJECT_CONTEXT.md`, `AGENTS.md`

## 2025-12-25 - Defer Playwright automation until regression pain
- Decision: Keep QA manual for now; defer Playwright automation setup.
- Rationale: UI is still changing and test infra is not wired; automation would be brittle and slower than manual verification at current scale.
- Impact: Revisit when testing cost exceeds 2-3 hours/week, or 2+ regressions/week, or when launch smoke tests are needed.
- Links: `DEFINITION_OF_DONE.md`, `TICKETS/README.md`

## 2025-12-25 - Event creation public-first; defer invite-only
- Decision: Support user-created events as public by default; defer invite-only/private events.
- Rationale: Public events increase discovery and density; invite-only adds complexity (privacy rules, RLS edge cases) and fragments discovery before traction.
- Impact: Use Crews/DMs for private coordination; revisit unlisted or invite-only after demand or safety signals justify.
- Links: `PROJECT_CONTEXT.md`, `TICKETS/event-rsvp-flow.md`
