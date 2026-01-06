# Event Taxonomy & Tracking Schema

**Purpose:** Define all analytics events for DAB metrics dashboard
**Owner:** Product + Eng
**Created:** 2025-12-22

---

## Overview

This document defines the 8 core analytics events plus onboarding step events we track for:
- **Retention metrics** (Day 1/7/30)
- **Funnel analysis** (match → message, event browse → RSVP, invite → signup)
- **B2B sponsor decks** (DAU, engagement, activity metrics)

---

## Event Schema (Standard Fields)

Every event includes these standard fields:

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `event_name` | text | Event type identifier | `'signup'`, `'app_open'` |
| `event_ts` | timestamptz | Event timestamp (UTC) | `2025-12-22T14:30:00Z` |
| `user_id` | uuid | User who triggered event | `'abc-123-def'` |
| `session_id` | uuid | Session identifier | `'session-xyz'` |
| `properties` | jsonb | Event-specific data | `{"step_id": "basic_profile", "step_index": 1}` |
| `city_id` | text | User's city (optional) | `'Munich'` |
| `gym_id` | uuid | Related gym (optional) | `'gym-uuid'` |

---

## Onboarding Step IDs (v1)

Step IDs must match the current `/dab` flow order:

1. `basic_profile` (step_index 1)
2. `interests` (step_index 2)
3. `location` (step_index 3)
4. `pledge` (step_index 4)
5. `success` (step_index 5)

---

## Event Definitions

### 1. `signup` - User completes onboarding

**When:** User completes final step of onboarding (SuccessStep) and profile is saved

**Purpose:** Track new user acquisition, measure invite conversion

**Standard Fields:**
- `event_name`: `'signup'`
- `event_ts`: Timestamp when onboarding completed
- `user_id`: New user's ID
- `session_id`: Session UUID
- `city_id`: User's selected homebase/city
- `gym_id`: First gym in user's gym array (if exists)

**Properties (JSONB):**
```json
{
  "onboarding_step": 5,
  "onboarding_version": "v1",
  "completion_time_seconds": 120,
  "acquisition_source": "organic" | "invite" | "gym_qr" | "social",
  "invite_token": "invite-xyz",
  "gyms_count": 2,
  "climbing_styles": ["bouldering", "lead"],
  "looking_for": ["partner", "crew"]
}
```

**Triggers:**
- `src/app/dab/steps/SuccessStep.tsx` - After profile save success
- **Note:** Current code logs signup in `PledgeStep`; reconcile in implementation.

---

### 2. `app_open` - User starts a session

**When:** User visits any authenticated page (session detected)

**Purpose:** Track DAU/MAU, measure retention

**Standard Fields:**
- `event_name`: `'app_open'`
- `event_ts`: Page load timestamp
- `user_id`: Current user ID
- `session_id`: Session UUID (generate once per session, store in sessionStorage)
- `city_id`: User's city (from profile)
- `gym_id`: null (not applicable)

**Properties (JSONB):**
```json
{
  "page_path": "/home" | "/chats" | "/events" | "/crew" | "/gyms",
  "referrer": "https://previous-site.com" | "direct",
  "is_first_session": true | false,
  "days_since_signup": 7
}
```

**Triggers:**
- `src/app/layout.tsx` or `src/components/Providers.tsx` - On mount for authenticated users
- Throttle: Max 1 event per session (use sessionStorage flag)

---

### 3. `match_created` - Mutual like creates a match

**When:** Two users both like each other (reciprocal swipe detected)

**Purpose:** Measure matching success rate, time-to-first-match

**Standard Fields:**
- `event_name`: `'match_created'`
- `event_ts`: Match creation timestamp
- `user_id`: User who completed the mutual like (most recent swiper)
- `session_id`: Session UUID
- `city_id`: User's city
- `gym_id`: First mutual gym (if both users share a gym)

**Properties (JSONB):**
```json
{
  "match_id": "match-uuid",
  "matched_user_id": "other-user-uuid",
  "mutual_gyms_count": 2,
  "mutual_styles_count": 1,
  "match_score": 5,
  "hours_since_signup": 12,
  "is_first_match": true | false
}
```

**Triggers:**
- `src/app/home/page.tsx` - After successful mutual like detection and match creation

---

### 4. `message_sent` - User sends a chat message

**When:** User sends any message (direct, gym, event, crew thread)

**Purpose:** Measure chat engagement, 2-way message rate

**Standard Fields:**
- `event_name`: `'message_sent'`
- `event_ts`: Message sent timestamp
- `user_id`: Sender ID
- `session_id`: Session UUID
- `city_id`: User's city
- `gym_id`: Gym ID if thread type is 'gym', otherwise null

**Properties (JSONB):**
```json
{
  "thread_id": "thread-uuid",
  "thread_type": "direct" | "gym" | "event" | "crew",
  "message_length": 45,
  "is_first_message_in_thread": true | false,
  "is_first_message_ever": true | false,
  "hours_since_match": 2,
  "recipient_user_id": "other-user-uuid"
}
```

**Triggers:**
- `src/app/chats/[id]/page.tsx` - After message insert success
- `src/app/crew/detail/page.tsx` - After message insert success

---

### 5. `event_view` - User views event detail page

**When:** User navigates to `/events/detail/[id]`

**Purpose:** Measure event browse → RSVP funnel

**Standard Fields:**
- `event_name`: `'event_view'`
- `event_ts`: Page view timestamp
- `user_id`: Viewer ID
- `session_id`: Session UUID
- `city_id`: User's city
- `gym_id`: null (event location stored in properties)

**Properties (JSONB):**
```json
{
  "event_id": "event-uuid",
  "event_title": "Friday Night Boulder Session",
  "event_location": "Boulderwelt Munich West",
  "event_start_at": "2025-12-27T19:00:00Z",
  "slots_open": 5,
  "creator_user_id": "host-uuid",
  "is_creator": true | false,
  "source": "events_list" | "notification" | "chat" | "direct_link"
}
```

**Triggers:**
- `src/app/events/detail/[id]/page.tsx` - On mount (useEffect)

---

### 6. `event_rsvp` - User RSVPs to an event

**When:** User clicks RSVP button and is added to event thread participants

**Purpose:** Measure event engagement, RSVP conversion rate

**Standard Fields:**
- `event_name`: `'event_rsvp'`
- `event_ts`: RSVP timestamp
- `user_id`: User who RSVP'd
- `session_id`: Session UUID
- `city_id`: User's city
- `gym_id`: null

**Properties (JSONB):**
```json
{
  "event_id": "event-uuid",
  "event_title": "Friday Night Boulder Session",
  "event_location": "Boulderwelt Munich West",
  "event_start_at": "2025-12-27T19:00:00Z",
  "slots_open_before": 5,
  "slots_open_after": 4,
  "creator_user_id": "host-uuid",
  "seconds_since_view": 30,
  "is_first_rsvp": true | false
}
```

**Triggers:**
- `src/app/events/detail/[id]/page.tsx` - After RSVP button click and thread_participants insert

---

### 7. `invite_sent` - User generates a referral invite

**When:** User creates/shares an invite link

**Purpose:** Measure viral growth, invite funnel

**Standard Fields:**
- `event_name`: `'invite_sent'`
- `event_ts`: Invite generation timestamp
- `user_id`: Inviter ID
- `session_id`: Session UUID
- `city_id`: User's city
- `gym_id`: null

**Properties (JSONB):**
```json
{
  "invite_token": "invite-xyz-123",
  "invite_channel": "copy_link" | "sms" | "whatsapp" | "instagram",
  "inviter_match_count": 5,
  "inviter_days_since_signup": 14
}
```

**Triggers:**
- `src/app/profile/page.tsx` or future invite flow - When invite link generated
- **Note:** Not yet implemented in MVP, prepare schema for future

---

### 8. `invite_accepted` - New user signs up via invite link

**When:** New user completes onboarding using an invite token

**Purpose:** Measure invite conversion rate

**Standard Fields:**
- `event_name`: `'invite_accepted'`
- `event_ts`: Signup completion timestamp
- `user_id`: New user ID
- `session_id`: Session UUID
- `city_id`: New user's city
- `gym_id`: null

**Properties (JSONB):**
```json
{
  "invite_token": "invite-xyz-123",
  "inviter_user_id": "inviter-uuid",
  "hours_since_invite_sent": 48,
  "acquisition_source": "invite"
}
```

**Triggers:**
- `src/app/dab/steps/SuccessStep.tsx` - If invite token detected in URL params
- **Note:** Not yet implemented in MVP, prepare schema for future

---

### 9. `onboarding_step_started` - User starts an onboarding step

**When:** User enters an onboarding step in `/dab`

**Purpose:** Measure step-level drop-off and engagement

**Standard Fields:**
- `event_name`: `'onboarding_step_started'`
- `event_ts`: Step entry timestamp
- `user_id`: Current user ID
- `session_id`: Session UUID
- `city_id`: null (not yet known for early steps)
- `gym_id`: null

**Properties (JSONB):**
```json
{
  "step_id": "basic_profile" | "interests" | "location" | "pledge" | "success",
  "step_index": 1,
  "onboarding_version": "v1"
}
```

**Triggers:**
- `src/app/dab/page.tsx` - On step entry/render

---

### 10. `onboarding_step_completed` - User completes an onboarding step

**When:** User completes a step and advances to the next step (or finishes on Success)

**Purpose:** Measure step completion and time-on-step

**Standard Fields:**
- `event_name`: `'onboarding_step_completed'`
- `event_ts`: Step completion timestamp
- `user_id`: Current user ID
- `session_id`: Session UUID
- `city_id`: null (early steps) or user's city when known
- `gym_id`: null

**Properties (JSONB):**
```json
{
  "step_id": "basic_profile" | "interests" | "location" | "pledge" | "success",
  "step_index": 1,
  "onboarding_version": "v1",
  "duration_ms": 12000
}
```

**Triggers:**
- `src/app/dab/page.tsx` or step components - On step completion

---

## Database Schema (Supabase)

### Table: `analytics_events`

```sql
CREATE TABLE analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name text NOT NULL,
  event_ts timestamptz NOT NULL DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id uuid NOT NULL,
  properties jsonb DEFAULT '{}'::jsonb,
  city_id text,
  gym_id uuid REFERENCES gyms(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_event_name ON analytics_events(event_name);
CREATE INDEX idx_analytics_events_event_ts ON analytics_events(event_ts DESC);
CREATE INDEX idx_analytics_events_city_id ON analytics_events(city_id);
CREATE INDEX idx_analytics_events_session_id ON analytics_events(session_id);

-- GIN index for JSONB queries
CREATE INDEX idx_analytics_events_properties ON analytics_events USING gin(properties);
```

### RLS Policies

```sql
-- Enable RLS
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Select: service_role only (no client access)
-- Note: service_role bypasses RLS; do not introduce admin_users.

-- Insert: Authenticated users can insert their own events
CREATE POLICY "analytics_events_insert_own" ON analytics_events
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Update/Delete: None (events are immutable)
```

---

## Session ID Management

**Session ID Rules:**
- Generate once per browser session (not per page load)
- Store in `sessionStorage` (clears on tab close)
- Format: UUID v4
- Same session_id for all events in one browser session

**Implementation:**
```typescript
// src/lib/analytics.ts
function getOrCreateSessionId(): string {
  const STORAGE_KEY = 'dab_session_id'

  let sessionId = sessionStorage.getItem(STORAGE_KEY)

  if (!sessionId) {
    sessionId = crypto.randomUUID()
    sessionStorage.setItem(STORAGE_KEY, sessionId)
  }

  return sessionId
}
```

---

## Event Logging Helper

**Server-side helper** (`src/lib/analytics.ts`):

```typescript
import { requireSupabase } from './supabaseClient'

export interface AnalyticsEvent {
  event_name: string
  user_id: string
  session_id: string
  properties?: Record<string, any>
  city_id?: string | null
  gym_id?: string | null
}

export async function logEvent(event: AnalyticsEvent): Promise<void> {
  const supabase = requireSupabase()

  const { error } = await supabase
    .from('analytics_events')
    .insert({
      event_name: event.event_name,
      user_id: event.user_id,
      session_id: event.session_id,
      properties: event.properties || {},
      city_id: event.city_id || null,
      gym_id: event.gym_id || null,
      event_ts: new Date().toISOString()
    })

  if (error) {
    console.error('[Analytics] Failed to log event:', error)
    // Don't throw - analytics should not break app flow
  }
}

export function getOrCreateSessionId(): string {
  const STORAGE_KEY = 'dab_session_id'

  let sessionId = sessionStorage.getItem(STORAGE_KEY)

  if (!sessionId) {
    sessionId = crypto.randomUUID()
    sessionStorage.setItem(STORAGE_KEY, sessionId)
  }

  return sessionId
}
```

---

## Implementation Checklist

**Step 1: Database Setup**
- [ ] Create `analytics_events` table with schema above
- [ ] Create indexes (5 total)
- [ ] Enable RLS
- [ ] Create RLS policies (select via service_role only, insert for authenticated)

**Step 2: Analytics Library**
- [ ] Create `src/lib/analytics.ts` with `logEvent` and `getOrCreateSessionId`
- [ ] Add TypeScript types for core events + onboarding step events
- [ ] Add error handling (don't break app if analytics fails)

**Step 3: Instrument Events**
- [ ] `signup` - `src/app/dab/steps/SuccessStep.tsx`
- [ ] `app_open` - `src/app/layout.tsx` or `src/components/Providers.tsx`
- [ ] `match_created` - `src/app/home/page.tsx`
- [ ] `message_sent` - `src/app/chats/[id]/page.tsx` + `src/app/crew/detail/page.tsx`
- [ ] `event_view` - `src/app/events/detail/[id]/page.tsx`
- [ ] `event_rsvp` - `src/app/events/detail/[id]/page.tsx`
- [ ] `invite_sent` - Future implementation
- [ ] `invite_accepted` - Future implementation
- [ ] `onboarding_step_started` - `/dab` flow (step entry)
- [ ] `onboarding_step_completed` - `/dab` flow (step completion)

**Step 4: Testing**
- [ ] Create 20+ test users
- [ ] Simulate full user journeys
- [ ] Validate events appear in `analytics_events` table
- [ ] Verify properties JSONB contains expected fields
- [ ] Check RLS policies (no client select; service_role only)

---

**Next:** Create Supabase migration SQL file in `supabase/create_analytics_events_table.sql`
