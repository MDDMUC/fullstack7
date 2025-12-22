# DECISIONS.md

Lightweight ADR log for DAB. Add a new entry when a decision changes architecture, product direction, or constraints.

Template
- Date:
- Decision:
- Rationale:
- Impact:
- Links:

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
