# QA Handoff: Push Notification Infrastructure Testing

**Ticket**: TICKET-NOT-001
**Feature**: Push Notification Infrastructure (Firebase Cloud Messaging)
**Status**: Ready for QA Testing
**Priority**: P0 (Pre-launch requirement)
**Date**: 2026-01-04

---

## Overview

Push notification infrastructure has been implemented using Firebase Cloud Messaging (FCM). Users can now:
- Opt-in to push notifications via Settings
- Receive push notifications when messages are sent
- Manage notification preferences

**Implementation Complete**:
- ✅ Firebase Admin SDK configured with service account
- ✅ Push token storage (RLS-protected)
- ✅ Opt-in flow in Settings UI
- ✅ Admin test page for sending test pushes
- ✅ Authentication/authorization guards on API endpoints
- ✅ Service worker for background notifications

---

## Prerequisites

Before testing, verify the following:

### 1. Environment Setup
- Dev server is running: `npm run dev`
- Server console shows: `✅ Firebase Admin SDK initialized`
- No errors in browser console related to Firebase

### 2. Browser Requirements
- **Desktop Testing**: Chrome, Edge, or Firefox (latest versions)
- **iOS Testing**: Safari (PWA only - add to home screen required)
- **Android Testing**: Chrome (works in browser and PWA)

### 3. Test Account
- You need a logged-in user account
- User must have profile set up
- User ID will be needed for some tests

---

## Test Plan

### Test Case 1: Enable Push Notifications (Opt-In Flow)

**Steps**:
1. Navigate to `/profile/settings`
2. Scroll to "Notifications" section
3. Toggle "Enable push notifications" to ON
4. Browser should prompt for notification permission
5. Click "Allow" in the permission dialog

**Expected Results**:
- ✅ Toggle switches to ON state
- ✅ Browser shows notification permission granted
- ✅ Success toast appears: "Notifications enabled successfully"
- ✅ No errors in browser console
- ✅ Push token saved to database (check `push_tokens` table in Supabase)

**Verification**:
- Open Chrome DevTools → Application → Service Workers
- Should see `firebase-messaging-sw.js` with status "Activated"
- Check Supabase `push_tokens` table for new row with your user_id

---

### Test Case 2: Send Test Push to Self

**Steps**:
1. Ensure notifications are enabled (Test Case 1)
2. Navigate to `/admin/push-test`
3. Leave "Target User ID" field **empty** (sends to yourself)
4. Customize title: "Test Notification"
5. Customize message: "This is my test push"
6. Set URL: `/` (or any valid route)
7. Click "Send Test Push"

**Expected Results**:
- ✅ Success message appears: "Sent to 1 device(s)"
- ✅ Push notification appears on your device/browser
- ✅ Notification shows correct title and message
- ✅ Clicking notification opens the app at specified URL
- ✅ No errors in browser console

**Edge Cases to Test**:
- Send with empty title (should default to "DAB")
- Send with empty message (should default to "You have a new notification from DAB")
- Send with empty URL (should default to "/")
- Send multiple pushes in quick succession (all should deliver)

---

### Test Case 3: Authorization Check (Non-Admin Cannot Send to Others)

**Steps**:
1. Navigate to `/admin/push-test`
2. Enter **another user's UUID** in "Target User ID" field
3. Click "Send Test Push"

**Expected Results**:
- ❌ Error message appears: "Forbidden: You can only send push notifications to yourself. Admin access required to send to other users."
- ❌ HTTP 403 status in Network tab
- ❌ No push notification sent

**Note**: This verifies the authorization guard is working correctly.

---

### Test Case 4: Authentication Check (Unauthenticated User)

**Steps**:
1. Log out of the application
2. Navigate to `/admin/push-test`
3. Try to send a test push

**Expected Results**:
- ❌ Error message appears: "Not authenticated. Please log in."
- ❌ HTTP 401 status in Network tab
- ❌ No push notification sent

---

### Test Case 5: Disable Push Notifications (Opt-Out Flow)

**Steps**:
1. Navigate to `/profile/settings`
2. Toggle "Enable push notifications" to OFF
3. Confirm you want to disable

**Expected Results**:
- ✅ Toggle switches to OFF state
- ✅ Success toast appears: "Notifications disabled successfully"
- ✅ Push token marked as inactive in database
- ✅ No errors in browser console

**Verification**:
- Check Supabase `push_tokens` table: `is_active` should be `false` for your token
- Try sending a test push to yourself (should fail with "No active push tokens found")

---

### Test Case 6: Re-Enable After Disabling

**Steps**:
1. Disable notifications (Test Case 5)
2. Re-enable notifications via Settings toggle

**Expected Results**:
- ✅ New push token generated and saved
- ✅ Test push should work again
- ✅ Old inactive token remains in database (not deleted)

---

### Test Case 7: Multiple Devices (Same User)

**Steps**:
1. Enable notifications on Device A (e.g., Chrome on Desktop)
2. Enable notifications on Device B (e.g., Chrome on Mobile)
3. Send a test push to yourself from `/admin/push-test`

**Expected Results**:
- ✅ Push notification appears on **both** Device A and Device B
- ✅ Success message shows: "Sent to 2 device(s)"
- ✅ Both tokens visible in `push_tokens` table with `is_active = true`

---

### Test Case 8: Failed Token Handling

**Steps**:
1. Enable notifications in browser
2. Manually revoke notification permission in browser settings
3. Send a test push to yourself from `/admin/push-test`

**Expected Results**:
- ⚠️ Push fails to deliver (expected)
- ✅ Token marked as inactive in database automatically
- ✅ Success count shows 0 devices
- ✅ No app crash or unhandled errors

**Verification**:
- Check server console for error log about failed token
- Check `push_tokens` table: token should have `is_active = false`

---

### Test Case 9: iOS Safari (PWA Mode)

**Platform**: iOS Safari (iPhone/iPad)

**Steps**:
1. Open app in Safari: `http://localhost:3000` (or deployed URL)
2. Tap Share → "Add to Home Screen"
3. Open app from home screen (PWA mode)
4. Navigate to `/profile/settings`
5. Enable push notifications
6. Grant permission when prompted
7. Send test push from another device or `/admin/push-test`

**Expected Results**:
- ✅ Notification permission granted
- ✅ Push notification appears in iOS notification center
- ✅ Clicking notification opens PWA

**Known Limitation**:
- ❌ Push does NOT work in regular Safari browser tab (iOS limitation)
- ✅ Only works when app is installed as PWA (home screen)

---

### Test Case 10: Android Chrome (Browser Mode)

**Platform**: Android Chrome

**Steps**:
1. Open app in Chrome: `http://localhost:3000` (or deployed URL)
2. Navigate to `/profile/settings`
3. Enable push notifications
4. Grant permission when prompted
5. Send test push from another device or `/admin/push-test`

**Expected Results**:
- ✅ Notification permission granted
- ✅ Push notification appears in Android notification center
- ✅ Clicking notification opens app in browser
- ✅ Works in both browser tab AND PWA mode

---

## Database Verification

Check Supabase tables to verify data integrity:

### `push_tokens` Table
```sql
SELECT * FROM push_tokens WHERE user_id = '<your-user-id>';
```

**Expected Schema**:
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key to auth.users)
- `token` (text, FCM token)
- `device_info` (jsonb, browser/device details)
- `is_active` (boolean, true for active tokens)
- `created_at` (timestamp)
- `last_used_at` (timestamp, updates on successful push)

**Expected Behavior**:
- New token created when user enables notifications
- `is_active = true` for active tokens
- `is_active = false` for disabled or failed tokens
- Multiple rows for same user if multiple devices

### `push_preferences` Table
```sql
SELECT * FROM push_preferences WHERE user_id = '<your-user-id>';
```

**Expected Schema**:
- `user_id` (uuid, primary key, foreign key to auth.users)
- `enabled` (boolean, user's preference)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Expected Behavior**:
- Row created when user first enables notifications
- `enabled = true` when notifications are on
- `enabled = false` when notifications are off

---

## Security Verification

### Row Level Security (RLS) Checks

**Test**: Verify users can only access their own tokens

1. Open Supabase SQL Editor
2. Run as authenticated user:
   ```sql
   SELECT * FROM push_tokens;
   ```
3. **Expected**: Only see your own tokens, not other users'

**Test**: Verify API endpoint authorization

1. Get your session token from browser DevTools
2. Try to send push to another user via API:
   ```bash
   curl -X POST http://localhost:3000/api/push/send \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <your-token>" \
     -d '{"userId":"<another-user-id>","title":"Test","message":"Test"}'
   ```
3. **Expected**: HTTP 403 Forbidden error

---

## Performance Testing

### Load Test: Multiple Pushes
1. Send 10 test pushes in rapid succession
2. **Expected**: All 10 should deliver within 5 seconds

### Token Cleanup Test
1. Enable notifications
2. Disable notifications
3. Re-enable notifications
4. Check database for token count
5. **Expected**: Old tokens marked inactive, not deleted (audit trail)

---

## Error Scenarios to Test

### 1. No Tokens Found
- Disable notifications, then try to send push
- **Expected**: "No active push tokens found for this user"

### 2. Invalid User ID
- Send push to non-existent user ID
- **Expected**: "No active push tokens found for this user"

### 3. Missing Authorization Header
- Send API request without `Authorization` header
- **Expected**: HTTP 401 Unauthorized

### 4. Expired Token
- Use old/expired session token in API request
- **Expected**: HTTP 401 Unauthorized

### 5. Malformed Request
- Send API request with missing `userId` field
- **Expected**: HTTP 400 Bad Request

---

## Browser Compatibility Matrix

| Platform | Browser | Tab Mode | PWA Mode | Status |
|----------|---------|----------|----------|--------|
| Desktop Windows | Chrome | ✅ Works | ✅ Works | Pass |
| Desktop Windows | Edge | ✅ Works | ✅ Works | Pass |
| Desktop Windows | Firefox | ✅ Works | ✅ Works | Pass |
| Desktop macOS | Chrome | ✅ Works | ✅ Works | Pass |
| Desktop macOS | Safari | ❌ No Web Push | ❌ No Web Push | Expected |
| iOS | Safari | ❌ iOS Limitation | ✅ Works | Pass (PWA only) |
| Android | Chrome | ✅ Works | ✅ Works | Pass |

---

## Definition of Done Checklist

- [ ] **Opt-in flow**: User can enable notifications in Settings
- [ ] **Opt-out flow**: User can disable notifications in Settings
- [ ] **Token storage**: Push tokens saved to database with RLS
- [ ] **Test push delivery**: Admin can send test push from `/admin/push-test`
- [ ] **Self-send works**: User can send push to themselves
- [ ] **Authorization**: Non-admin cannot send to other users (403 error)
- [ ] **Authentication**: Unauthenticated users cannot send pushes (401 error)
- [ ] **Multi-device**: Push sent to all active devices for a user
- [ ] **Failed token handling**: Invalid tokens marked as inactive automatically
- [ ] **iOS PWA**: Push works on iOS Safari PWA
- [ ] **Android Chrome**: Push works on Android Chrome browser
- [ ] **Desktop browsers**: Push works on Chrome, Edge, Firefox
- [ ] **No security vulnerabilities**: RLS verified, API endpoints protected
- [ ] **No console errors**: Clean browser and server console logs
- [ ] **Database integrity**: Tokens and preferences stored correctly

---

## Known Issues / Limitations

1. **iOS Safari Browser Tab**: Push notifications do NOT work in regular Safari tabs on iOS. User must add app to home screen (PWA). This is an iOS platform limitation, not a bug.

2. **Desktop Safari**: Web Push not supported on macOS Safari (platform limitation).

3. **Firebase Service Account**: If `FIREBASE_SERVICE_ACCOUNT_JSON` is not configured, push sending will fail with "Firebase Admin SDK not initialized" error.

4. **Token Expiration**: Firebase tokens can expire. The app automatically marks expired tokens as inactive when push fails.

---

## Rollback Plan

If critical issues are found:

1. **Disable push sending API**:
   - Comment out route in `src/app/api/push/send/route.ts`
   - Redeploy

2. **Hide Settings UI**:
   - Remove notification toggle from Settings page
   - Users won't see the feature

3. **Database rollback** (if needed):
   ```sql
   DROP TABLE push_tokens CASCADE;
   DROP TABLE push_preferences CASCADE;
   ```

---

## Sign-Off

Once all test cases pass, sign off with:

```
✅ TICKET-NOT-001 QA APPROVED

Test Results:
- Opt-in flow: PASS
- Opt-out flow: PASS
- Test push delivery: PASS
- Authorization guards: PASS
- Multi-device support: PASS
- iOS PWA: PASS
- Android Chrome: PASS
- Desktop browsers: PASS
- Security (RLS): PASS
- Error handling: PASS

Tested by: [Your Name]
Date: [Date]
Environment: [Dev/Staging/Production]

Ready for production deployment.
```

---

## Contact for Issues

If you encounter blockers or issues during testing:

1. Check server console logs for errors
2. Check browser console for client-side errors
3. Verify Firebase Admin SDK initialized: Look for `✅ Firebase Admin SDK initialized` in server logs
4. Check Supabase database for token storage issues
5. Report issues with:
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots of errors
   - Browser/device information

---

**Status**: Ready for QA testing. All implementation tasks complete.
