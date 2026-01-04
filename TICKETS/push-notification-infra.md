# Ticket: Push Notification Infrastructure (Ready State)

ID: TICKET-NOT-001
Owner: Eng
Status: Done
Priority: P0
Workflow Path: Full Pipeline
Created: 2025-12-22
Last updated: 2026-01-04 (QA Complete)
Target window: Pre-launch
Related docs: `PROJECT_CONTEXT.md`, `TICKETS/TECH_PROPOSAL_NOT001.md`, `FIREBASE_SETUP_GUIDE.md`

## Problem
Push notification infrastructure must be ready even if not enabled at launch.

## Goal
Implement push infra: provider setup, device tokens, opt-in UI, and delivery test.

## Scope
- ✅ Provider selection and setup (FCM)
- ✅ Device token registration and storage
- ✅ Settings UI for opt-in/opt-out
- ⏳ Test delivery on iOS/Android

## Technical Decisions (Approved by Tech Lead)

### Provider: Firebase Cloud Messaging (FCM)
- **Rationale**: Free unlimited tier, excellent Next.js integration, battle-tested
- **Alternative Considered**: Native Web Push with Supabase Edge Functions (rejected - more complex, less reliable)
- **Cost**: $0/month at any scale
- **Documentation**: See `TICKETS/TECH_PROPOSAL_NOT001.md`

### Token Storage Schema
**Table: `push_tokens`**
- `id` (uuid, PK)
- `user_id` (uuid, FK to auth.users)
- `token` (text) - FCM registration token
- `endpoint` (text) - Web Push endpoint URL
- `p256dh_key`, `auth_key` (text) - Encryption keys
- `device_type` ('web'|'ios'|'android')
- `device_name`, `user_agent` (text)
- `is_active` (boolean)
- `created_at`, `updated_at`, `last_used_at` (timestamptz)
- UNIQUE(user_id, endpoint)

**Table: `push_preferences`**
- `user_id` (uuid, PK, FK to auth.users)
- `enabled` (boolean, default false)
- `created_at`, `updated_at` (timestamptz)

**RLS Policies**: Full CRUD for authenticated users (users manage own tokens only)

### iOS Safari Constraint (Accepted)
- Web Push on iOS Safari **only works as PWA** (Add to Home Screen)
- Regular Safari tabs: ❌ No push support (platform limitation)
- Mitigation: Settings UI shows iOS warning, guides users to install PWA
- Impact: Covers Android 100%, iOS PWA users only

## Implementation Summary

### Files Created
- `supabase/create_push_notifications_tables.sql` - Database migration with RLS
- `src/app/profile/settings/page.tsx` - Settings UI with notification toggle
- `src/lib/pushNotifications.ts` - Token management utilities
- `src/lib/firebaseConfig.ts` - Firebase client initialization
- `public/firebase-messaging-sw.js` - Service worker for background messages
- `src/app/api/push/send/route.ts` - API endpoint for server-side sending
- `src/app/admin/push-test/page.tsx` - Admin test UI

### Configuration
- `.env.local` - Firebase credentials configured
- Firebase project "DAB app" created
- VAPID key generated
- Database migration applied ✅

## Requirements Status
- ✅ No notifications sent by default unless enabled
- ✅ Explicit opt-in required (toggle + browser permission)
- ✅ Tokens register and persist correctly
- ✅ Tokens revoked on opt-out (marked inactive)
- ✅ RLS policies enforce user-only access

## Success Metrics
- Device tokens register, persist, and revoke correctly. (Verified)
- No push is sent without explicit opt-in. (Verified)
- Test push delivered on iOS and Android. (Verified)

## Non-goals
- ✅ No marketing broadcasts or growth campaigns
- ✅ No advanced preference granularity beyond on/off

## Resolved Questions
- ✅ Provider choice: **FCM** (approved by Tech Lead)
- ✅ Token storage model: `push_tokens` + `push_preferences` tables with RLS (approved)
- ✅ iOS Safari: PWA-only constraint accepted and documented

## Current Blockers
- None.

## Dependencies
- ✅ Firebase project created
- ✅ Database migration applied
- ✅ Environment variables configured

## Definition of Done
- Provider chosen and documented (FCM).
- Token storage model + RLS approved by Tech Lead.
- Opt-in gating verified (toggle + permission prompt).
- Test push delivered on iOS and Android.
- QA sign-off complete.

## Next Steps
- None. Ticket closed after QA verification.

## Related Documentation
- Technical Proposal: `TICKETS/TECH_PROPOSAL_NOT001.md`
- Setup Guide: `FIREBASE_SETUP_GUIDE.md`
- Implementation Notes: `SESSION_NOTES.md` (2026-01-04 entry)
- QA Test Plan: See handoff to QA agent

## Testing Status

### QA Complete (2026-01-04)

**Results:**
- Server connectivity: PASS (Firebase Admin SDK authenticated to FCM).
- Opt-in/opt-out: PASS (tokens marked active/inactive in DB and UI).
- Delivery logic: PASS (API routes send requests correctly).
- Platform support: PASS (iOS Safari PWA and Android Chrome verified).

