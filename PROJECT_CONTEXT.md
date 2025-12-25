# PROJECT_CONTEXT.md

**Purpose:** Single source of truth for AI agents working on DAB
**Last updated:** 2025-12-22
**Read this FIRST before working on any task**

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technical Architecture](#technical-architecture)
3. [Database Schema](#database-schema)
4. [Design System](#design-system)
5. [Current State](#current-state)
6. [Strategy & Business Context](#strategy--business-context)
7. [Key Decisions & Rationale](#key-decisions--rationale)
8. [Common Patterns & Components](#common-patterns--components)
9. [Development Workflow](#development-workflow)
10. [Important Constraints](#important-constraints)

---

## Project Overview

### What Is DAB?

**DAB** is a mobile-first dating/social app for climbers built with Next.js 16, React 19, and Supabase. The app uses Tailwind CSS v4 for styling with a custom dark theme design system.

**Core Value Proposition:** Climbing-first community utility with a light "dab" dating layer. Chats is the hub: events, gyms, crews, and DMs are all threads.

**Current Status:** MVP Complete ✓, Pre-Launch (Activation & Safety Readiness Next)

**Launch Strategy:** City-by-city density (Munich first), free-only, growth over monetization

### Product Philosophy

- **Mobile-first:** All design optimized for mobile (iOS Safari, Android Chrome)
- **Chat-centric:** Everything happens in threads (direct, gym, event, crew)
- **Permission-first:** Friends in Gym shows only mutual matches, no open directory
- **Safety-first:** Block/report, kick, rate limiting built in from day 1
- **Local density:** Launch city-by-city to avoid empty states

### H1 2026 North Star

**Goal:** Invite as many users as possible and maximize active users (growth >> monetization)

**Key Metrics:**
- Day 7 retention >40%
- Match within 24h >60%
- Chat start rate >40%
- Event RSVP rate >20%

**Target:** 200-500 engaged users in Munich → first B2B partnership (€500-€2k)

---

### Target Demographic (Working)

**Primary:** 22-35 (indoor bouldering + roped gym users, high social activity)
**Secondary:** 36-44 (still inside the dominant 20-49 gym band)

See `STRATEGY_RESEARCH_DEMOGRAPHICS.md` for sources and rationale.

## Technical Architecture

### Stack

**Frontend:**
- Next.js 16 (App Router)
- React 19
- Tailwind CSS v4
- TypeScript

**Backend:**
- Supabase (PostgreSQL + Auth + Storage + Realtime)

**Hosting:**
- Vercel (frontend)
- Supabase Cloud (backend)

**Key Libraries:**
- `@supabase/supabase-js` - Database client
- `@heroicons/react` - Icon library
- React Context - State management (OnboardingContext, ToastProvider)

### Directory Structure

```
src/
├── app/              # Next.js App Router pages
│   ├── dab/          # Onboarding flow (multi-step wizard)
│   ├── chats/        # Chat threads (direct, gym, crew, event)
│   ├── crew/         # Crew (group) management
│   ├── events/       # Event listings and creation
│   ├── home/         # Main discovery/swipe page
│   ├── gyms/         # Gym detail pages
│   ├── notifications/# Notifications page
│   ├── profile/      # User profile and settings
│   ├── layout.tsx    # Root layout
│   ├── globals.css   # Global styles
│   └── tokens.css    # Design tokens
├── components/       # Reusable React components
│   ├── Modal.tsx
│   ├── ActionMenu.tsx
│   ├── Avatar.tsx
│   ├── BackBar.tsx
│   ├── EmptyState.tsx
│   ├── LoadingState.tsx
│   ├── FriendTile.tsx
│   ├── ChatMessage.tsx
│   ├── GymFriendCard.tsx
│   ├── MobileTopbar.tsx
│   ├── MobileNavbar.tsx
│   ├── MobileFilterBar.tsx
│   ├── DropdownMenu.tsx
│   ├── UnreadDot.tsx
│   ├── ReportModal.tsx
│   ├── Toast.tsx
│   ├── MessageToastListener.tsx
│   └── Providers.tsx
├── contexts/         # React Context providers
│   └── OnboardingContext.tsx
├── hooks/            # Custom React hooks
│   └── useAuthSession.tsx
└── lib/              # Utilities and helpers
    ├── supabaseClient.ts
    ├── authUtils.ts
    ├── profiles.ts
    ├── messages.ts
    ├── matches.ts
    ├── blocks.ts
    ├── reports.ts
    └── gyms.ts
```

### Path Aliases

- `@/*` maps to `./src/*`
- Example: `import { Avatar } from '@/components/Avatar'`

### Key Patterns

**Authentication:**
- Uses Supabase Auth
- `useAuthSession` hook provides session state
- `RequireAuth` component protects routes
- See `src/lib/authUtils.ts` for user fetching utilities

**Supabase Client:**
- Singleton in `src/lib/supabaseClient.ts`
- Use `requireSupabase()` when client must exist
- Returns typed `SupabaseClient`

**Onboarding Flow:**
- Multi-step wizard at `/dab` using `OnboardingContext` for state
- Steps: BasicProfile, Location, Interests, Phone, Pledge, Success
- Profile data stored in `onboardingprofiles` table

**Mobile Layout:**
- `MobileTopbar` - Top navigation with breadcrumb, profile avatar, notifications bell, gyms icon
- `MobileNavbar` - Bottom navigation tabs (Events, Chats, Crew, Dab)
- Both components handle unread indicators via Supabase subscriptions

---

## Database Schema

### Key Tables (Supabase)

**Users & Profiles:**
```sql
-- Managed by Supabase Auth
auth.users (id, email, created_at)

-- User profile data (onboarding)
onboardingprofiles (
  id uuid PRIMARY KEY,
  username text,           -- First name or email prefix
  photo text,              -- Storage URL
  gender text,
  age integer,
  looking_for text[],      -- ['belay', 'partner', 'crew', 'dating']
  climbing_style text[],   -- ['bouldering', 'lead', 'sport', 'trad']
  gym text,                -- JSON array string: '["gym-uuid", "outside"]'
  homebase text,           -- City
  city text,
  bio text,
  created_at timestamptz
)

-- Lightweight profiles table (alternative/supplement)
profiles (
  id uuid PRIMARY KEY,
  avatar_url text,
  username text,
  created_at timestamptz
)
```

**Matching & Connections:**
```sql
-- Swipe actions
swipes (
  id uuid PRIMARY KEY,
  swiper uuid,             -- User who swiped
  swipee uuid,             -- User being swiped on
  action text,             -- 'like' or 'pass'
  created_at timestamptz
)

-- Mutual matches
matches (
  id uuid PRIMARY KEY,
  user1_id uuid,
  user2_id uuid,
  created_at timestamptz,
  UNIQUE(user1_id, user2_id)
)

-- Blocks
blocks (
  id uuid PRIMARY KEY,
  blocker_id uuid,
  blocked_id uuid,
  reason text,
  created_at timestamptz
)

-- Reports
reports (
  id uuid PRIMARY KEY,
  reporter_id uuid,
  reported_user_id uuid,
  reported_message_id uuid,
  report_type text,        -- 'harassment', 'inappropriate', 'spam', 'fraud', 'other'
  reason text,
  status text,             -- 'pending', 'reviewed', 'resolved'
  created_at timestamptz
)
```

**Messaging:**
```sql
-- Chat threads (direct, gym, event, crew)
threads (
  id uuid PRIMARY KEY,
  type text,               -- 'direct', 'gym', 'event', 'crew', null (legacy)
  title text,
  gym_id uuid,             -- FK to gyms(id) for gym threads
  event_id uuid,           -- FK to events(id) for event threads
  crew_id uuid,            -- FK to crews(id) for crew threads
  created_by uuid,
  created_at timestamptz,
  last_message_at timestamptz,
  UNIQUE(gym_id, title)
)

-- Thread participants (group membership)
thread_participants (
  id uuid PRIMARY KEY,
  thread_id uuid,          -- FK to threads(id)
  user_id uuid,
  joined_at timestamptz
)

-- Messages
messages (
  id uuid PRIMARY KEY,
  thread_id uuid,          -- FK to threads(id)
  sender_id uuid,
  receiver_id uuid,        -- For direct chats; sender for group chats
  body text,
  status text,             -- 'sent', 'delivered', 'read'
  created_at timestamptz
)
```

**Events & Crews:**
```sql
-- Events (time-bound gatherings)
events (
  id uuid PRIMARY KEY,
  title text,
  location text,
  description text,
  start_at timestamptz,
  slots_total integer,
  slots_open integer,
  image_url text,          -- Storage URL
  created_by uuid,
  created_at timestamptz
)

-- Crews (unlimited group chats)
crews (
  id uuid PRIMARY KEY,
  title text,
  location text,
  description text,
  image_url text,          -- Storage URL
  created_by uuid,
  created_at timestamptz
)

-- Crew invites
crew_invites (
  id uuid PRIMARY KEY,
  crew_id uuid,
  inviter_id uuid,
  invitee_id uuid,
  status text,             -- 'pending', 'accepted', 'declined'
  created_at timestamptz,
  accepted_at timestamptz
)
```

**Gyms:**
```sql
gyms (
  id uuid PRIMARY KEY,
  name text,
  slug text UNIQUE,
  area text,               -- Location (e.g., "Munich, Germany")
  avatar_url text,         -- Gym logo
  created_at timestamptz
)
```

### Storage Buckets

**crew-cover** - Crew cover images
**event-cover** - Event cover images
**user-images** - User profile photos and avatars

**RLS Policies:** All buckets allow authenticated users to upload/read

---

## Design System

### Design Tokens (`src/app/tokens.css`)

**Colors:**
```css
--color-surface-bg: #0c0e12        /* Page background */
--color-surface-panel: #11141c     /* Panel background */
--color-surface-card: #151927      /* Card background */
--color-border-default: #1f2633    /* Borders/strokes */
--color-primary: #5ce1e6           /* Accent cyan */
--color-secondary: #e68fff         /* Accent magenta */
--color-text-default: #e9eef7      /* Primary text */
--color-text-muted: #8ea0bd        /* Secondary text */
--color-state-red: #ff4444         /* Error/danger */
```

**Spacing Scale:**
```css
--space-xxs: 4px
--space-xs: 6px
--space-sm: 8px
--space-md: 12px
--space-lg: 16px
--space-xl: 24px
--space-xxl: 32px
```

**Border Radius:**
```css
--radius-sm: 6px
--radius-md: 10px
--radius-lg: 14px
--radius-full: 999px
```

**Typography:**
```css
--fontfamily-inter: 'Inter', sans-serif
--font-size-xs: 10px
--font-size-sm: 12px
--font-size-md: 14px
--font-size-lg: 16px
--font-size-xl: 18px
--font-weight-regular: 400
--font-weight-medium: 500
--font-weight-bold: 700
--font-weight-extra-bold: 800
```

**Component Sizes:**
```css
--avatar-size-xs: 20px
--avatar-size-sm: 34px
--avatar-size-md: 52px
--avatar-size-lg: 60px
--icon-size-sm: 16px
--icon-size-md: 20px
--icon-size-lg: 24px
--card-image-height-sm: 160px
--card-image-height-md: 200px
--btn-height-lg: 38px
```

### Design Conventions

**Always use design tokens** - No hard-coded colors, spacing, or sizes
**No Figma URLs in production** - Use local assets in `public/` or `src/assets/`; Figma/MCP links are for extraction only
**Mobile-first** - All designs optimized for mobile viewport
**Dark theme only** - No light mode (for now)
**Custom scrollbars** - Use `.custom-scrollbar` class for themed scrollbars

### Figma Integration

When implementing UI from Figma:
1. Use exact pixel values from Figma (no rounding)
2. Store reusable values in `tokens.css`
3. Use `data-node-id` attributes for Figma traceability

---

## Current State

### MVP Status: COMPLETE ✓

**Shipped Features:**
- ✅ Dab/matching system (swipe, match, direct threads)
- ✅ Chats (direct, gym, event, crew threads)
- ✅ Events (create, RSVP, browse)
- ✅ Crews (create, join, invite, kick)
- ✅ Gyms (detail pages, friends at gym, occupancy)
- ✅ Notifications (toasts, bell icon, /notifications page)
- ✅ Trust & Safety (block, report, rate limiting)
- ✅ Discovery (match scoring, filters, suggested partners)
- ✅ Engagement (unread indicators, Friends in Gym Phase 1)

### Current Sprint: Pre-Launch Activation & Safety Readiness

**Status:** In Progress (Week 1 of 2-3)

**Next Tasks:**
1. Onboarding flow optimization (Product + Design, 2-4 days)
2. Safety and moderation readiness (Product + Ops, 1-2 days)
3. Push notification infrastructure ready (Eng, 2-3 days)
4. Pre-launch product readiness QA (QA + Eng, 2-3 days)
5. Content seeding + legal readiness (Product + Ops, 2-3 days)

**Success Criteria:**
- Onboarding completion >80% in a test cohort
- No P0 issues on iOS Safari and Android Chrome
- Push infrastructure tested end-to-end
- Seed content present across gyms, events, and crews
- Legal documents live and linked

### Upcoming Steps (Post-Launch Stabilization)

**Step 1 (Deferred):** Analytics & partnerships readiness (2-3 weeks)
**Step 2:** Location-first discovery (1-2 weeks)
**Step 3:** Push notifications (2-3 weeks)
**Step 4:** Habit loops & retention (2-3 weeks)
**Step 5:** Friends in Gym Phase 2 (2-3 weeks, post-density)

### Blockers

**None** - All critical infrastructure is working

---

## Strategy & Business Context

### Phase Roadmap

**Phase A - MVP Launch (Now)**
- Free only, no monetization
- Seed user base in Munich (6 gyms)
- Target: 200-500 engaged users
- Metrics: Day 7 retention >40%, match <24h >60%

**Phase B - Brand Partnerships (Month 1-2)**
- First B2B deals with gyms/brands (€500-€2k)
- Use dashboard metrics for sponsor decks
- Validation, not revenue focus

**Phase C - Subscription (Month 3+)**
- Launch Pro tier (€8-€15/mo)
- Only after daily matches/RSVPs flowing
- Features: advanced filters, higher dab limits, rewind

**Phase D - Hybrid (Month 6+)**
- Add Credits for boosts, event promo
- Usage-based pricing on top of Pro

**Phase E - Outcome-based B2B (Month 12+)**
- Gyms/hosts pay per verified outcome (attendance)
- Requires verified check-in system

### Launch Cities (Priority Order)

1. **Munich** (Phase A target) - 6 gyms seeded
2. Berlin (Phase B expansion)
3. Hamburg (Phase B expansion)

### Monetization Rules

**Do NOT add B2C monetization in H1 2026**
- Charging early kills network effects
- Focus on proof-of-value and engagement first
- B2B partnerships come before Pro subscription

**Decision Framework:**
- Phase A → B: 200-500 MAU, Day 7 >40%, match <24h >60%, dashboard live
- Phase B → C: 1,000+ MAU, 1+ B2B deal, Day 30 >30%, daily matches flowing

---

## Key Decisions & Rationale

### Architecture Decisions

**Why Next.js App Router?**
- Server Components reduce bundle size
- Built-in layouts for MobileTopbar/MobileNavbar
- File-based routing simplifies structure

**Why Supabase?**
- PostgreSQL with full SQL capabilities
- Real-time subscriptions for chat/notifications
- Built-in auth and storage
- RLS for security

**Why Tailwind CSS v4?**
- Design token integration via CSS variables
- Utility-first approach matches Figma designs
- Dark theme via custom tokens

### Product Decisions

**Why chat-centric architecture?**
- All interactions (events, gyms, crews) lead to threads
- Simplifies navigation (everything in /chats)
- Reduces cognitive load (one mental model)

**Why city-by-city launch?**
- Avoids empty states (local density)
- Easier to seed content (6 gyms vs. 50)
- Enables gym partnerships at smaller scale

**Why Friends in Gym is matches-only?**
- Privacy-first approach (no open directory)
- Reduces stalking/harassment risk
- Builds on existing trust (mutual match)

**Why no realtime check-ins in MVP?**
- Privacy concerns too high for MVP
- Opt-in Phase 2 feature with strong guardrails
- Needs user feedback and trust first

### Technical Decisions

**Why unified unread logic in lib/messages.ts?**
- Group threads use `sender_id !== userId` check
- Direct threads use `receiver_id === userId && sender_id !== userId`
- Centralized in `isMessageUnread()` and `isThreadUnread()` helpers

**Why message status flow: sent → delivered → read?**
- Respects state machine (prevents read → sent transitions)
- Mark-read effect only updates `delivered` → `read` (not `sent` → `read`)
- Sender's own messages never marked read by sender

**Why rate limiting at 5 messages / 10 seconds?**
- Prevents spam and abuse
- Tested and confirmed not too restrictive for real users
- Applied globally (chat detail, crew detail)

---

## Common Patterns & Components

### Reusable Components

**Modal** (`src/components/Modal.tsx`)
```tsx
import { Modal } from '@/components/Modal'

<Modal
  open={isOpen}
  onClose={() => setIsOpen(false)}
  title="Modal Title"
  footer={<button>Action</button>}
>
  Modal content here
</Modal>
```

**ActionMenu** (`src/components/ActionMenu.tsx`)
```tsx
import { ActionMenu } from '@/components/ActionMenu'

<ActionMenu
  open={menuOpen}
  onClose={() => setMenuOpen(false)}
  items={[
    { label: 'Edit', onClick: handleEdit },
    { label: 'Delete', onClick: handleDelete, danger: true }
  ]}
/>
```

**Avatar** (`src/components/Avatar.tsx`)
```tsx
import { Avatar, DEFAULT_PLACEHOLDER } from '@/components/Avatar'

<Avatar
  src={user.avatar_url}
  alt={user.username}
  size="var(--avatar-size-md)"
  fallback={DEFAULT_PLACEHOLDER}
  showPlaceholder={true}
/>
```

**BackBar** (`src/components/BackBar.tsx`)
```tsx
import { BackBar } from '@/components/BackBar'

<BackBar
  backHref="/events"
  backText="back"
  rightSlot={<ActionMenu items={menuItems} />}
/>
```

**EmptyState / LoadingState**
```tsx
import { EmptyState } from '@/components/EmptyState'
import { LoadingState } from '@/components/LoadingState'

{loading && <LoadingState message="Loading events…" />}
{!loading && events.length === 0 && <EmptyState message="No events found" />}
```

**ChatMessage** (`src/components/ChatMessage.tsx`)
```tsx
import { ChatMessage } from '@/components/ChatMessage'

<ChatMessage
  message={msg}
  profile={profiles[msg.sender_id]}
  isOutgoing={msg.sender_id === userId}
  isDirect={threadType === 'direct'}
  hasLeft={leftUserIds.includes(msg.sender_id)}
/>
```

**FriendTile** (`src/components/FriendTile.tsx`)
```tsx
import { FriendTile, FriendTilesContainer } from '@/components/FriendTile'

<FriendTilesContainer>
  {participants.map(p => (
    <FriendTile
      key={p.id}
      profile={p}
      isHost={p.id === crew.created_by}
      canKick={isHost && p.id !== userId}
      onKick={() => handleKick(p.id)}
    />
  ))}
</FriendTilesContainer>
```

### Common Utilities

**Supabase Client:**
```tsx
import { requireSupabase } from '@/lib/supabaseClient'

const supabase = requireSupabase()
const { data, error } = await supabase.from('threads').select('*')
```

**Auth Session:**
```tsx
import { useAuthSession } from '@/hooks/useAuthSession'

const { session, userId } = useAuthSession()
```

**Profile Fetching:**
```tsx
import { fetchProfiles } from '@/lib/profiles'

const profiles = await fetchProfiles(supabase, [userId1, userId2])
// Returns: Record<string, Profile>
```

**Unread Messages:**
```tsx
import { isMessageUnread, isThreadUnread } from '@/lib/messages'

const unread = isMessageUnread(message, userId, isDirect)
const threadUnread = isThreadUnread(thread, userId, isDirect)
```

**Match Management:**
```tsx
import { ensureDirectThreadForMatch } from '@/lib/matches'

const threadId = await ensureDirectThreadForMatch(supabase, userId, otherUserId)
// Creates thread if doesn't exist, returns thread ID
```

**Block/Report:**
```tsx
import { blockUser } from '@/lib/blocks'
import { reportUser, reportMessage } from '@/lib/reports'

await blockUser(supabase, userId, blockedUserId, 'reason')
await reportUser(supabase, userId, reportedUserId, 'harassment', 'reason')
```

---

## Development Workflow

### Commands

```bash
npm run dev      # Start development server (Next.js with Turbopack)
npm run build    # Production build
npm run lint     # Run ESLint
npm run start    # Start production server
```

### Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # Optional, for auth redirects
```

### Git Workflow

**Branches:**
- `master` - Main branch (production-ready)

**Commit Messages:**
- Follow conventional commits (feat:, fix:, chore:, etc.)
- End with "🤖 Generated with Claude Code" attribution

**Recent Commits:**
- `85b007b feat: friends in gym phase 1`
- `b819b83 mega update to notifications and live messages and states. MVP DONE`

### Code Style

**TypeScript:**
- Use explicit types for function parameters
- Avoid `any` - use `unknown` or proper types
- Use `interface` for object shapes

**React:**
- Functional components only (no class components)
- Use hooks for state management
- Extract complex logic into custom hooks

**CSS:**
- Use design tokens (no hard-coded values)
- Follow BEM-like naming: `.component-element-modifier`
- Mobile-first (no desktop-specific styles yet)

**Imports:**
- Use path aliases: `@/components/Modal` not `../../components/Modal`
- Group imports: React, Next.js, third-party, local
- Alphabetize within groups

---

## Important Constraints

### What NOT to Do

**❌ Do NOT add monetization features (paywalls, Pro tier, Credits)**
- H1 2026 is growth-first, monetization comes later
- See STRATEGY_INDEX.md for phase transition criteria

**❌ Do NOT implement realtime check-ins (Friends in Gym Phase 2)**
- Requires 200+ active users and strong privacy guardrails
- Phase 2 feature, not MVP

**❌ Do NOT create new pages without mobile layouts**
- Must have MobileTopbar and MobileNavbar, except the onboarding flow on mobile (desktop can include)
- Must be responsive on iOS Safari and Android Chrome

**❌ Do NOT hard-code values (colors, spacing, sizes)**
- Always use design tokens from `tokens.css`
- Exception: One-off Figma-specific values (document in comment)

**❌ Do NOT skip RLS policies on new tables**
- All Supabase tables must have Row Level Security
- Users can only access their own data (or public data)

**❌ Do NOT use `next/image` for external URLs without config**
- Use `<img>` for Figma assets or add domains to `next.config.js`

**❌ Do NOT add features that increase empty states**
- Every new feature must work with <100 users
- Seed data if needed (gym threads, events, profiles)

### Security Rules

**Always validate user input** - Check for XSS, SQL injection, command injection
**Always check permissions** - User can only modify their own data
**Rate limit all mutations** - Prevent spam and abuse
**Never expose API keys** - Use `NEXT_PUBLIC_` prefix only for public keys

### Performance Rules

**Optimize images** - Use storage URLs, not base64
**Lazy load components** - Use `React.lazy()` for large components
**Debounce search inputs** - Prevent excessive API calls
**Use Supabase subscriptions wisely** - Clean up on unmount

---

## Quick Reference: Where to Find Things

**Strategy & Planning:**
- Overview: `STRATEGY_INDEX.md`
- Go-to-market: `strategy.md`
- Pricing: `pricingstrategy.md`
- Execution tasks: `TICKETS/INDEX.md`
- Technical history: `SESSION_NOTES.md`

**Code Patterns:**
- Components: `src/components/`
- Utilities: `src/lib/`
- Hooks: `src/hooks/`
- Pages: `src/app/`

**Database:**
- Schema: See "Database Schema" section above
- Migrations: `supabase/` folder
- RLS policies: `supabase/*.sql`

**Design:**
- Tokens: `src/app/tokens.css`
- Global styles: `src/app/globals.css`
- Figma: [Link to Figma project - add if available]

**Deployment:**
- Frontend: Vercel (auto-deploy from `master`)
- Backend: Supabase Cloud
- Storage: Supabase Storage buckets

---

## Context for AI Agents

### When Working on Features

1. **Read this file first** - Understand current state and constraints
2. **Check TICKETS/INDEX.md** - See what's in progress, avoid conflicts
3. **Review STRATEGY_INDEX.md** - Understand if feature aligns with strategy
4. **Use existing components** - Check `src/components/` before creating new ones
5. **Follow design tokens** - Use `tokens.css` values, not hard-coded
6. **Test mobile-first** - Verify on iOS Safari and Android Chrome
7. **Update SESSION_NOTES.md** - Document significant changes

### When Making Decisions

1. **Check "Key Decisions & Rationale"** - See if decision already made
2. **Check phase roadmap** - Ensure timing is right (e.g., no monetization yet)
3. **Check constraints** - Ensure not violating "What NOT to Do" rules
4. **Ask user if uncertain** - Use AskUserQuestion tool for clarification

### When Stuck

1. **Check SESSION_NOTES.md** - See how similar features were built
2. **Check common patterns** - Use existing component patterns
3. **Check database schema** - Ensure querying correct tables/columns
4. **Check design tokens** - Ensure using correct CSS variables

---

## Version History

**2025-12-22:** Initial creation
- Consolidated all project context into single file
- Includes technical, strategic, and business context
- Structured for AI agent consumption

---

**This file is the single source of truth for AI agents. Read it before starting any work on DAB.**
