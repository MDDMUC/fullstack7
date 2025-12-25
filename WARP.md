# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## 1. Required docs & workflow

This repo already has a rich agent workflow. Before making changes:

1. **Follow the read order** (from `AGENT_START.md`):
   - `AGENT_START.md` – mandatory entry point for any agent/model.
   - `PROJECT_CONTEXT.md` – single source of truth for product + technical context.
   - `AGENTS.md` – roles, handoff template, and global constraints.
   - Your role file (see `AGENTS.md`).
   - `TICKETS/README.md` and `TICKETS/INDEX.md` – task index and templates.
2. If there is no ticket, start from `TICKETS/TICKET_STARTER.md` and create one using `TICKETS/TEMPLATE_PRODUCT.md`, then add it to `TICKETS/INDEX.md`.
3. For any significant change:
   - Update `SESSION_NOTES.md` with what you did.
   - Add or update entries in `DECISIONS.md` when you change architecture, product direction, or constraints.
4. Use `DEFINITION_OF_DONE.md` as the checklist for finishing any task (product/UX, design system, data & security, testing, docs).

## 2. Core dev commands

This is a standard Next.js 16 + React 19 app using the App Router, with scripts defined in `package.json`.

```bash
# Start dev server (Turbopack)
npm run dev

# Lint TypeScript/JS with Next/ESLint
npm run lint

# Production build
npm run build

# Start production server (after build)
npm run start
```

Notes:
- **Env vars**: local development that hits Supabase requires at least:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Optionally `NEXT_PUBLIC_SITE_URL` for auth redirects.
- **Production build guard**: `next.config.ts` throws at build time if the Supabase env vars above are missing in `NODE_ENV=production`.
- **Tests**: there is **no JS test runner or `npm test` script configured**. Testing expectations are described in `DEFINITION_OF_DONE.md` (manual test plans and critical-flow verification per ticket).

Supabase schema and storage are managed via SQL files in `supabase/`:
- Use the Supabase dashboard SQL editor to run files like `supabase/storage_setup.sql`, `supabase/user_images_bucket.sql`, and `supabase/create_matches_table.sql`.
- `supabase/QUICK_FIX_SETUP.md` and `supabase/STORAGE_SETUP_GUIDE.md` document how to bring a new Supabase project up to parity (buckets, tables, policies).

## 3. High-level architecture

### 3.1 Application shell and routing

- **App Router** lives under `src/app/`.
  - `src/app/layout.tsx` defines the root layout: global fonts (Geist + Metal_Mania), `./globals.css`, and a `<Providers>` wrapper.
  - `src/components/Providers.tsx` wires global UI context (currently `ToastProvider` + `MessageToastListener`).
  - `src/components/ClientHeader.tsx` is rendered in the layout above all routes.
- **Entry pages** (non-exhaustive, but conceptually important):
  - `src/app/page.tsx` → marketing/landing page (renders `LandingPage`).
  - `src/app/dab/*` → multi-step onboarding flow/wizard.
  - `src/app/home/page.tsx` → core "dab" / discovery experience.
  - `src/app/chats/*` → chat hub (direct, gym, event, crew threads).
  - `src/app/events/*` → events list/detail and creation.
  - `src/app/crew/*` → crew (group) management and detail.
  - `src/app/gyms/page.tsx` → gyms discovery and occupancy.
  - `src/app/profile/*` → profile + setup flows.
  - `src/app/notifications/page.tsx` → in-app notifications.
  - `src/app/auth/callback/page.tsx`, `src/app/login/page.tsx`, `src/app/signup/page.tsx` → auth flows.

Navigation on mobile is standardized via:
- `src/components/MobileTopbar.tsx` – top bar with breadcrumb, profile avatar, gyms icon, and notifications bell (pulls Supabase data for avatar and notification badge state).
- `src/components/MobileNavbar.tsx` – bottom nav tabs (Events, Chats, Crew, Dab), with unread dots for chats/crews based on unified unread logic.

New user-facing pages are expected to integrate both `MobileTopbar` and `MobileNavbar` except the onboarding flow on mobile (desktop can include) (see `AGENT_START.md`/`AGENTS.md`).

### 3.2 Data & domain layer (Supabase-centric)

Supabase is the single backend for auth, Postgres, Realtime, and Storage.

- **Client bootstrap** – `src/lib/supabaseClient.ts`:
  - Reads `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
  - Exports a singleton `supabase` (nullable) and `requireSupabase()`; use `requireSupabase()` anywhere a hard failure is preferable to silently continuing without a client.
  - Also exposes `appUrl` (from `NEXT_PUBLIC_SITE_URL` or `window.location.origin`) for auth redirects.
- **Auth state** – `src/hooks/useAuthSession.ts`:
  - Client-side hook around `supabase.auth.getSession()` + `onAuthStateChange`.
  - Returns `{ session, loading }` for use in protected components, nav bars, etc.
- **Profiles & onboarding** – `src/lib/profiles.ts` and `src/contexts/OnboardingContext.tsx`:
  - `OnboardingContext` holds client-side onboarding data across the `/dab` wizard (identity, climbing profile, location, agreements, etc.).
  - `src/lib/applyOnboardingData.ts` writes collected onboarding data into Supabase via `upsertOnboardingProfile` / `upsertPublicProfile`.
  - `normalizeProfile()` in `profiles.ts` merges `profiles` + `onboardingprofiles` rows into a single `Profile` shape, handling legacy fields and string/JSON-array normalization.
  - Avatar resolution prefers Supabase Storage bucket `user-images` (or legacy `avatars`), using folder-per-user conventions and demo mappings; helpers compute public URLs via `getPublicUrl`.
- **Messaging & threads** – `src/lib/messages.ts`:
  - Defines `Thread`, `Message`, and helper types.
  - `fetchThreads()` and `fetchMessages()` read from `threads` / `messages` and join in lightweight profile info.
  - `sendMessage()` writes new `messages` rows using the current authenticated user.
  - `subscribeToThread()` uses Supabase Realtime channels to live-update message streams.
  - `isMessageUnread()` and `isThreadUnread()` implement **canonical unread logic** used across the app:
    - Direct chats: receiver is the current user, sender is someone else, status not `read`.
    - Group/gym/crew threads: any non-`read` message from someone else.
  - `MobileNavbar` consumes this logic to determine unread dots for chats and crews.
- **Other lib modules (by responsibility):
  - Matching & swipes: `src/lib/matches.ts`, `src/lib/swipes.ts` (creating direct threads for matches, dab/match state).
  - Safety: `src/lib/blocks.ts`, `src/lib/reports.ts` (block/report flows aligned with trust & safety requirements).
  - Gyms & occupancy: `src/lib/gymOccupancyData.ts`, `fetchGymsFromTable` / `fetchAllGyms*` utilities in `profiles.ts`.
  - Analytics and misc helpers: `src/lib/analytics.ts`, `src/lib/utils.ts`, `src/lib/blocks.ts`, etc.

The **Supabase schema & RLS policies** live in `supabase/` (migrations under `supabase/migrations/` and additional DDL/RLS files like `setup_policies.sql`, `storage_policies.sql`, and table-specific scripts). New tables and policies should follow these patterns.

### 3.3 UI layer & landing experience

- Reusable components under `src/components/` encapsulate most UI patterns:
  - Core primitives: `Modal`, `DropdownMenu`, `EmptyState`, `LoadingState`, `Avatar`, `ActionMenu`, `ReportModal`, `Toast`, `MessageToastListener`, `FriendTile`, `GymFriendCard`.
  - Navigation/layout: `MobileTopbar`, `MobileNavbar`, `MobileFilterBar`, `BackBar`, `ClientHeader`, `UserNav`.
- The public marketing/landing experience is implemented in `src/components/LandingPage.tsx` and consumed by `src/app/page.tsx`:
  - Fetches profiles via `fetchProfiles()` and renders featured climbers + a grid of cards with filters.
  - Implements animated "activity feed" and a signup form that delegates to Supabase auth (email/password or Google OAuth).

## 4. Design system & Cursor rules

The design system is dark-theme-only and token-driven.

- **Tokens & globals**:
  - `src/app/tokens.css` – central source of design tokens (colors, spacing, radii, typography, component sizes). All new UI must use these CSS variables instead of hard-coded values.
  - `src/app/globals.css` – global layout, typography, and component class definitions (including landing page and mobile UI classes).
- **Cursor / Figma workflow** (`.cursorrules`):
  - When implementing UI from Figma, the workflow is:
    1. Call `mcp_Figma_Desktop_get_variable_defs({ nodeId: "..." })` to extract variable definitions.
    2. Call `mcp_Figma_Desktop_get_design_context({ nodeId: "...", forceCode: true })` for detailed layout/styles.
    3. Optionally `mcp_Figma_Desktop_get_screenshot({ nodeId: "..." })` for visual verification only.
    4. Transcribe **exact** values (no rounding) into CSS/tokens (spacing, radius, font-size, colors, etc.).
    5. Save extracted classes/tokens into `UI_SYSTEM_LIBRARY.md` for reuse.
  - Explicit **"never"** rules:
    - Do not guess values from screenshots.
    - Do not use "close enough" approximations or round pixel values.
    - Do not assume colors – always extract from Figma.
  - `.cursorrules` also includes a quick reference for key design token values (colors, spacing, radii, type) which should match `tokens.css`.

When changing or adding UI, prefer:
- Existing tokenized classes in `globals.css` and patterns already documented in `UI_SYSTEM_LIBRARY.md`.
- Existing layout components (`MobileTopbar`, `MobileNavbar`, `BackBar`, etc.) over creating bespoke layouts.

## 5. Tickets, roles, and constraints

The project defines a structured multi-role workflow in `AGENTS.md` and `TICKETS/`.

- **Roles & handoff** (`AGENTS.md`):
  - Multiple role files (`role-*.md`) define expectations for Product Strategist, Experience Designer, Technical Lead, Implementation Engineer, QA, and Marketing.
  - All work should use the **handoff template** in `AGENTS.md` (model used, ticket, context, decisions, tasks, constraints, DoD, risks, artifacts).
- **Ticketing system** (`TICKETS/`):
  - `TICKETS/README.md` explains how tickets are structured, named, and progressed through statuses.
  - `TICKETS/INDEX.md` is the canonical list of active tickets.
  - Each ticket has role-specific addenda templates (`TEMPLATE_DESIGN.md`, `TEMPLATE_TECH_LEAD.md`, etc.) and there is a starter ticket template for new work.

Key non-negotiable constraints (summarized from `AGENT_START.md`, `AGENTS.md`, `PROJECT_CONTEXT.md`, and `DEFINITION_OF_DONE.md`):
- **Monetization & scope**:
  - No B2C monetization features (paywalls, Pro tiers, credits) in **H1 2026**.
  - No realtime check-ins / "Friends in Gym Phase 2" yet; that is explicitly deferred.
- **Navigation & UX**:
  - New user-facing pages must include `MobileTopbar` and `MobileNavbar` except the onboarding flow on mobile (desktop can include), and be mobile-first (iOS Safari + Android Chrome).
  - Avoid new empty states; seed data or provide fallbacks for new features.
- **Design system**:
  - Use design tokens from `tokens.css` for colors/spacing/sizing; do not introduce ad-hoc hard-coded values except where explicitly documented.
- **Data & security**:
  - All new Supabase tables or views must have RLS enabled and appropriate policies.
  - Follow existing patterns in `supabase/*.sql` for table structure and policies.
  - Input validation and rate limiting are required for user-facing mutations, especially around chat and safety features.
- **Process**:
  - Lint (`npm run lint`) and build (`npm run build`, when feasible) must pass.
  - For major work, update `SESSION_NOTES.md` and `DECISIONS.md`.
  - Testing expectations (automated where practical, otherwise manual plans) are in `DEFINITION_OF_DONE.md`.

This WARP-specific file is intentionally high-level. For deeper context on strategy, schema, and patterns, rely on `PROJECT_CONTEXT.md` and the role/ticket documents described above.
