# Technical Proposal: Push Notification Infrastructure

**Ticket**: TICKET-NOT-001
**Author**: Implementation Engineer (Claude Code)
**Date**: 2026-01-04
**Status**: Awaiting Tech Lead Approval
**Priority**: P0 (Pre-Launch)

---

## Executive Summary

This proposal outlines the technical approach for implementing push notification infrastructure for DAB. The recommended approach uses **Firebase Cloud Messaging (FCM)** with native Web Push API for maximum compatibility and minimal cost.

**Key Decision Points Requiring Tech Lead Sign-off**:
1. Provider choice: FCM vs. OneSignal vs. Native Web Push
2. Token storage schema and RLS policies
3. iOS Safari limitations and mitigation strategy

---

## 1. Provider Options Analysis

### Option A: Firebase Cloud Messaging (FCM) ✅ RECOMMENDED

**Pros**:
- Free tier covers our needs (unlimited messages, no device limits)
- Excellent Web Push support via service workers
- Official Next.js integration available (`next-pwa`, `firebase` npm packages)
- Works on iOS Safari 16.4+ (with limitations documented below)
- Battle-tested, used by millions of apps
- Simple REST API for server-side sends
- Can upgrade to Firebase suite later (analytics, auth, etc.) if needed

**Cons**:
- Requires Firebase project setup (one-time, ~15 min)
- Adds ~50KB to bundle size (firebase SDK)
- Google dependency (vendor lock-in risk)

**Cost**: $0/month (free tier unlimited)

**Implementation Effort**: 2-3 days

---

### Option B: OneSignal

**Pros**:
- Feature-rich dashboard for non-technical users
- Built-in segmentation, scheduling, A/B testing
- Multi-platform support (web, iOS native, Android native)
- Better analytics than FCM

**Cons**:
- Free tier: 10,000 push subscribers limit (we may hit this quickly)
- Paid tier: $99/month when we exceed limits
- Overkill for our simple use case (opt-in only, no marketing)
- Larger SDK footprint (~80KB)

**Cost**: $0-$99/month (usage-based)

**Implementation Effort**: 2-3 days

---

### Option C: Native Web Push API (No Vendor)

**Pros**:
- Zero cost
- No vendor lock-in
- Minimal bundle size (browser native)
- Maximum control

**Cons**:
- No dashboard for testing/debugging
- Manual VAPID key management
- Requires custom server-side infrastructure to send pushes
- More complex implementation (service worker + server)
- No built-in delivery tracking or retry logic

**Cost**: $0/month

**Implementation Effort**: 4-5 days (includes custom server logic)

---

### Recommendation: Firebase Cloud Messaging (FCM)

**Rationale**:
1. **Free and scalable**: No cost concerns at any user volume
2. **Simple integration**: Well-documented Next.js patterns
3. **Sufficient features**: Covers opt-in, device tokens, test delivery
4. **Future-proof**: Can add analytics, A/B testing later if needed
5. **Low risk**: Widely used, stable, mature

**Trade-off Accepted**: Google vendor dependency (acceptable for free tier with simple API)

---

## 2. iOS Safari Web Push Constraints

### Current State (2026)

iOS Safari supports Web Push as of iOS 16.4+ (released March 2023), **but with limitations**:

1. **Home Screen Requirement**:
   - Push notifications ONLY work if the user has added the PWA to their home screen
   - Regular Safari browser tabs do NOT receive push notifications
   - **Impact**: Users must "Add to Home Screen" before push works

2. **Permission Prompt Restrictions**:
   - Permission must be requested from a user gesture (button click)
   - Cannot auto-prompt on page load
   - **Impact**: Requires explicit opt-in UI (already planned)

3. **Service Worker Limitations**:
   - Service worker must be registered from the app's origin
   - No cross-origin service workers
   - **Impact**: Must serve service-worker.js from our domain

4. **Background Limits**:
   - iOS may throttle background service worker execution
   - Push delivery may be delayed if device is low power mode
   - **Impact**: Not suitable for time-critical notifications

### Mitigation Strategy

**For MVP (Opt-in Only)**:
1. Add "Install App" banner on iOS Safari (guides user to Add to Home Screen)
2. Show clear messaging: "Enable notifications after adding DAB to your home screen"
3. Detect if running as standalone PWA (`window.navigator.standalone`)
4. Only show notification opt-in toggle if PWA is installed OR not on iOS Safari

**For Post-Launch**:
- Consider native iOS app if push is mission-critical
- For now, web push covers Android (90%+ support) + iOS PWA users

**Documented Constraint**: iOS web push requires PWA installation (acceptable for MVP)

---

## 3. Database Schema: Token Storage

### New Table: `push_tokens`

```sql
CREATE TABLE push_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    device_type TEXT NOT NULL CHECK (device_type IN ('web', 'ios', 'android')),
    device_name TEXT,  -- e.g., "iPhone 14 Pro - Safari", "Chrome on Windows"
    endpoint TEXT NOT NULL,  -- Web Push endpoint URL
    p256dh_key TEXT NOT NULL,  -- Public key for encryption
    auth_key TEXT NOT NULL,  -- Authentication secret
    user_agent TEXT,  -- Browser/device user agent string
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_used_at TIMESTAMPTZ DEFAULT NOW(),

    -- Ensure one token per device per user (prevent duplicates)
    UNIQUE(user_id, endpoint)
);

-- Index for fast user lookups
CREATE INDEX idx_push_tokens_user_id ON push_tokens(user_id) WHERE is_active = TRUE;

-- Index for cleanup queries (inactive tokens)
CREATE INDEX idx_push_tokens_inactive ON push_tokens(is_active, last_used_at);
```

### RLS Policies

```sql
-- Enable RLS
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

-- Users can only view their own tokens
CREATE POLICY "Users can view own push tokens"
ON push_tokens
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own tokens
CREATE POLICY "Users can insert own push tokens"
ON push_tokens
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own tokens (e.g., mark inactive on logout)
CREATE POLICY "Users can update own push tokens"
ON push_tokens
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own tokens
CREATE POLICY "Users can delete own push tokens"
ON push_tokens
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
```

### Additional Table: `push_preferences`

```sql
CREATE TABLE push_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    enabled BOOLEAN DEFAULT FALSE,  -- Master opt-in toggle
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE push_preferences ENABLE ROW LEVEL SECURITY;

-- Users can only manage their own preferences
CREATE POLICY "Users can manage own push preferences"
ON push_preferences
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

### Migration File

File: `supabase/create_push_notifications_tables.sql`

---

## 4. Token Lifecycle Plan

### Registration Flow (Opt-In)

```
1. User clicks "Enable Notifications" in Settings
   ↓
2. Request notification permission (browser prompt)
   ↓
3. If granted:
   - Register service worker
   - Subscribe to push using FCM
   - Receive token object { endpoint, keys: { p256dh, auth } }
   ↓
4. Send token to backend:
   - INSERT INTO push_tokens (user_id, token, endpoint, p256dh_key, auth_key, ...)
   - UPSERT INTO push_preferences (user_id, enabled=true)
   ↓
5. Show success toast: "Notifications enabled ✓"
```

### Token Update Flow (Refresh)

```
1. On app load (if push enabled):
   - Check if service worker is registered
   - Get current subscription
   ↓
2. If token exists:
   - Update last_used_at in push_tokens table
   ↓
3. If token changed (rare, but possible):
   - UPDATE push_tokens SET token=new_token WHERE user_id=... AND endpoint=...
```

### Token Revocation Flow (Opt-Out)

```
1. User clicks "Disable Notifications" in Settings
   ↓
2. Unsubscribe from push:
   - subscription.unsubscribe()
   ↓
3. Mark tokens inactive:
   - UPDATE push_tokens SET is_active=false WHERE user_id=...
   - UPDATE push_preferences SET enabled=false WHERE user_id=...
   ↓
4. Show success toast: "Notifications disabled"
```

### Logout Flow

```
1. User logs out
   ↓
2. Clear session
   ↓
3. Optionally unsubscribe push (keep token for re-login):
   - UPDATE push_tokens SET is_active=false WHERE user_id=...

   OR

   - Fully delete tokens:
   - DELETE FROM push_tokens WHERE user_id=...
```

**Decision Required**: Should logout disable tokens or delete them?
**Recommendation**: Disable (set `is_active=false`) to preserve token if user re-logs in on same device.

### Multi-Device Behavior

- **Each device gets its own row** in `push_tokens` table
- User can enable push on multiple devices simultaneously
- Sending a push: broadcast to all active tokens for user
- Cleanup: Tokens inactive for >90 days auto-deleted via cron job (future)

---

## 5. UI Surface Mapping

### 5.1 Settings Page: Opt-In Toggle

**Location**: `/profile/settings` (new page or section)

**Components Needed**:
- `MobileTopbar` (required per constraints)
- `MobileNavbar` (required per constraints)
- Toggle component (reuse existing or create)

**Layout**:
```
┌─────────────────────────────────────┐
│ ← Settings               [@] [🔔]   │  ← MobileTopbar
├─────────────────────────────────────┤
│                                     │
│  🔔 Notifications                   │
│                                     │
│  Enable push notifications  [ OFF ] │  ← Toggle
│                                     │
│  Stay updated on new matches,       │
│  messages, and events.              │
│                                     │
│  ⚠️ iOS users: Add DAB to your      │  ← Conditional (if iOS Safari)
│  home screen first.                 │
│                                     │
└─────────────────────────────────────┘
│ [Events] [Chats] [Crew] [Dab]      │  ← MobileNavbar
└─────────────────────────────────────┘
```

**Logic**:
```typescript
const handleToggle = async (enabled: boolean) => {
  if (enabled) {
    // Request permission
    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      // Register service worker and subscribe
      await registerPushSubscription()
    } else {
      // Show error toast
      showToast('Permission denied. Enable in browser settings.')
    }
  } else {
    // Unsubscribe
    await unsubscribePush()
  }
}
```

### 5.2 Permission Prompt Flow

**No custom UI needed** - Browser native permission dialog is sufficient.

**User Experience**:
1. User taps toggle
2. Browser shows native prompt: "Allow DAB to send you notifications?"
3. User taps "Allow" or "Block"
4. Our app handles response

**iOS PWA Check**:
```typescript
const isStandalone = window.navigator.standalone ||
                     window.matchMedia('(display-mode: standalone)').matches

const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)

if (isIOS && !isStandalone) {
  showToast('Please add DAB to your home screen first')
  return
}
```

### 5.3 Test Delivery Admin UI (Optional)

**Location**: `/admin/push-test` (internal only, not for users)

**Purpose**: Send test push to verify infrastructure

**Components**:
- Input: User ID or email
- Button: "Send Test Push"
- Result display: Success/failure message

**Implementation**: Server action or API route that calls FCM send API

---

## 6. Implementation Plan

### Phase 1: Provider Setup & Service Worker (Day 1)

- [ ] Create Firebase project in Firebase Console
- [ ] Generate VAPID keys and save to `.env.local`
- [ ] Install dependencies: `npm install firebase`
- [ ] Create `public/service-worker.js` with FCM listener
- [ ] Register service worker in root layout (`src/app/layout.tsx`)
- [ ] Test service worker registration in browser console

### Phase 2: Database Schema (Day 1)

- [ ] Create migration file: `supabase/create_push_notifications_tables.sql`
- [ ] Add `push_tokens` table with RLS policies
- [ ] Add `push_preferences` table with RLS policies
- [ ] Run migration in Supabase SQL Editor
- [ ] Verify tables and policies created

### Phase 3: Settings UI (Day 2)

- [ ] Create `/profile/settings` page (or add section to existing profile page)
- [ ] Add `MobileTopbar` and `MobileNavbar` components
- [ ] Implement notification toggle component
- [ ] Add iOS PWA detection and conditional messaging
- [ ] Wire up toggle to permission request flow
- [ ] Test on desktop Chrome, Android Chrome, iOS Safari (PWA)

### Phase 4: Token Management (Day 2)

- [ ] Create `src/lib/pushNotifications.ts` utility:
  - `registerPushSubscription()` - Subscribe and save token
  - `unsubscribePush()` - Unsubscribe and mark inactive
  - `updateTokenIfNeeded()` - Refresh token on app load
- [ ] Integrate with Settings toggle
- [ ] Test token creation, update, deletion flows

### Phase 5: Server-Side Send (Day 3)

- [ ] Create API route: `/api/push/send` (protected, admin only)
- [ ] Implement FCM send logic using Firebase Admin SDK
- [ ] Add error handling and retry logic
- [ ] Create test UI at `/admin/push-test` (internal)
- [ ] Send test push to opted-in user on iOS and Android

### Phase 6: Testing & Documentation (Day 3)

- [ ] Test delivery on Android Chrome (should work)
- [ ] Test delivery on iOS Safari PWA (should work if installed)
- [ ] Test delivery on iOS Safari browser (should fail gracefully)
- [ ] Document test results in ticket
- [ ] Update `SESSION_NOTES.md` with implementation details
- [ ] Hand off to QA for verification

---

## 7. Open Questions for Tech Lead

### Q1: Provider Choice Confirmation
**Question**: Approve FCM as provider, or prefer OneSignal/Native Web Push?
**Recommendation**: FCM (free, simple, sufficient)
**Blocker**: Yes - cannot proceed without decision

### Q2: Token Storage RLS Policies
**Question**: Approve proposed schema and RLS policies?
**Recommendation**: Approve as-is (standard CRUD policies)
**Blocker**: Yes - required per constraints

### Q3: iOS Safari Strategy
**Question**: Accept PWA requirement for iOS, or defer iOS support?
**Recommendation**: Accept PWA requirement (document limitation)
**Blocker**: No - can proceed either way

### Q4: Logout Token Behavior
**Question**: On logout, disable tokens or delete them?
**Recommendation**: Disable (`is_active=false`) to preserve for re-login
**Blocker**: No - can be decided during implementation

### Q5: Multi-Device Token Limit
**Question**: Limit users to N devices, or allow unlimited?
**Recommendation**: Allow unlimited (prevent spam at send time, not storage)
**Blocker**: No - can iterate post-MVP

---

## 8. Success Criteria (Definition of Done)

Per ticket requirements:

1. **Provider chosen and documented** ✅ FCM recommended
2. **Token storage model + RLS approved by Tech Lead** ⏳ Awaiting approval
3. **Device tokens register, persist, revoke correctly** ⏳ Implementation pending
4. **Opt-in gating verified** ⏳ Implementation pending
5. **Successful test push delivered on iOS and Android** ⏳ Testing pending
6. **Ticket updated with implementation notes, test steps, and results** ⏳ Post-implementation

---

## 9. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| iOS Safari PWA requirement limits adoption | High | Medium | Document clearly; consider native app post-MVP |
| FCM vendor lock-in | Low | Medium | FCM API is standard Web Push; can migrate if needed |
| Token cleanup complexity (inactive devices) | Medium | Low | Defer to post-MVP cron job |
| Service worker caching issues | Medium | Medium | Use cache-busting versioning in SW file |
| Permission denial by user | High | Low | Show clear messaging; allow re-prompt |

---

## 10. Next Steps

**Immediate Action Required**:
1. **Tech Lead**: Review and approve this proposal (or request changes)
2. **Tech Lead**: Answer open questions (Q1-Q5 above)

**After Approval**:
3. **Implementation Engineer**: Execute implementation plan (Phases 1-6)
4. **QA**: Verify test delivery on iOS and Android
5. **Product**: Update user-facing documentation with iOS PWA requirement

---

## Appendix: Cost Projections

### FCM (Recommended)
- **Free tier**: Unlimited messages, unlimited devices
- **Paid tier**: N/A (we won't hit limits)
- **Total**: $0/month at any scale

### OneSignal (Alternative)
- **Free tier**: Up to 10,000 subscribers
- **Paid tier**: $99/month for 10,001-50,000 subscribers
- **Total**: $0-$99/month depending on growth

### Native Web Push (Alternative)
- **Free tier**: N/A (self-hosted)
- **Infrastructure**: Requires server to send pushes (existing Next.js API routes)
- **Total**: $0/month (uses existing infra)

**Conclusion**: FCM is the most cost-effective option with best developer experience.

---

**Status**: Awaiting Tech Lead sign-off on provider choice and token storage schema.

**Estimated Implementation Time**: 3 days after approval.

**Estimated QA Time**: 0.5 days (test on 2 devices).

**Total Time to Done**: 3.5 days.
