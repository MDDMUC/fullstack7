# TICKET-NOT-001: Service Account Blocker - Resolution Guide

**Status**: Implementation Complete - Waiting on Org Admin
**Priority**: P0 (Blocks server-side push sending)
**Updated**: 2026-01-04

---

## ✅ Implementation Engineer Tasks Complete

### 1. Updated Setup Guide
**File**: `FIREBASE_SETUP_GUIDE.md`

Added comprehensive Step 4 with:
- ✅ Instructions for getting service account JSON (3 options)
- ✅ Clear explanation of org policy blocker
- ✅ How to request exception from Org Admin
- ✅ Correct format for `FIREBASE_SERVICE_ACCOUNT_JSON` env var
- ✅ Newline handling instructions (`\n` must be preserved)

### 2. Added Admin Auth Guard
**File**: `src/app/api/push/send/route.ts`

Implemented:
- ✅ JWT token authentication check
- ✅ Authorization: Users can only send to themselves (unless admin)
- ✅ `ADMIN_USER_IDS` Set for granting admin access
- ✅ Returns 401 Unauthorized if no/invalid token
- ✅ Returns 403 Forbidden if non-admin tries to send to others

### 3. Updated Admin Test Page
**File**: `src/app/admin/push-test/page.tsx`

Fixed:
- ✅ Now includes `Authorization: Bearer <token>` header
- ✅ Gets session token from Supabase auth
- ✅ Shows error if not authenticated

---

## ⏳ Action Required: Get Firebase Service Account

### The Problem

Your Google Cloud organization has policy `constraints/iam.disableServiceAccountKeyCreation` enabled, which blocks you from creating service account keys.

**Impact**: Without the service account JSON, the Firebase Admin SDK cannot initialize, and **push notifications cannot be sent** (opt-in flow still works, but no actual pushes).

### The Solution

You need to work with your **Organization Administrator** to resolve this.

---

## 📋 Instructions for Org Admin Request

### Email Template (Copy-Paste)

```
Subject: Request: Firebase Service Account Key for DAB Push Notifications

Hi [Org Admin Name],

I'm working on implementing push notifications for our DAB application and need a Firebase service account key to send notifications server-side.

Current Blocker:
- Google Cloud Org Policy "disableServiceAccountKeyCreation" is preventing key creation
- Project: dabapp-f2db7 (Firebase project: "DAB app")
- Service Account: firebase-adminsdk-xxxxx@dabapp-f2db7.iam.gserviceaccount.com

Request:
Please help with ONE of the following options:

Option A (Preferred):
- Grant an exception to the org policy for project "dabapp-f2db7"
- This allows me to create the key myself from Firebase Console or GCP Console

Option B (Alternative):
- Create the service account key for me and share it securely
- I need the JSON file containing the private key

Use Case:
- Firebase Cloud Messaging (push notifications)
- Server-side only (not exposed to clients)
- Will be stored in .env.local (not committed to git)

Reference:
- https://cloud.google.com/resource-manager/docs/organization-policy/restricting-service-accounts

Let me know which option works best for your security requirements!

Thanks,
[Your Name]
```

---

## 🔐 Once You Get the Service Account JSON

### Step 1: Add to `.env.local`

1. Open the JSON file you received (e.g., `dabapp-f2db7-firebase-adminsdk-xxxxx.json`)

2. Open `.env.local` in your project

3. Find the line:
   ```env
   FIREBASE_SERVICE_ACCOUNT_JSON={"placeholder":"add_when_available"}
   ```

4. Replace it with the **entire JSON contents** from the file:
   ```env
   FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"dabapp-f2db7","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\nMIIEv...","client_email":"...","client_id":"..."}
   ```

**CRITICAL**:
- Copy the entire JSON as one line
- Keep the `\n` characters in `private_key` (literal backslash-n, not newlines)
- Don't modify quotes or escape anything
- Just paste the JSON file contents as-is

### Step 2: Restart Dev Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

You should see in the console:
```
✅ Firebase Admin SDK initialized
```

If you see `⚠️ FIREBASE_SERVICE_ACCOUNT_JSON not configured`, the JSON is malformed - check formatting.

### Step 3: Test Push Sending

1. Navigate to `http://localhost:3000/admin/push-test`

2. Make sure you have notifications enabled in Settings first

3. Leave "Target User ID" empty (sends to yourself)

4. Customize title and message

5. Click **"Send Test Push"**

6. **Expected**: Success message + push notification appears!

### Step 4: Verify in Supabase

Check browser console for errors. You should see:
- ✅ No "Firebase Admin SDK not initialized" errors
- ✅ "Sent to X device(s)" success message
- ✅ Actual push notification appears in browser/phone

---

## 🧪 QA Handoff (After Service Account Added)

Once you've verified the test push works, hand off to QA with this update:

```
BLOCKER RESOLVED: Firebase service account configured.

QA Tasks:
1. Verify /admin/push-test successfully sends push to opted-in user
2. Test on Android Chrome (should receive push)
3. Test on iOS Safari PWA (should receive push if installed as PWA)
4. Confirm no pushes sent without opt-in
5. Sign off on TICKET-NOT-001 Definition of Done

Expected Results:
- Push appears in browser/device notification center
- Title and message match what was sent
- Clicking notification opens app at specified URL
```

---

## 📊 Definition of Done (Remaining Items)

Current Status:
- ✅ Provider chosen and documented (FCM)
- ✅ Token storage + RLS approved and implemented
- ✅ Opt-in flow working and tested
- ✅ Settings UI complete
- ✅ Admin auth guard implemented
- ⏳ **Service account JSON configured** (BLOCKER)
- ⏳ **Test push delivered on Android Chrome** (waiting on service account)
- ⏳ **Test push delivered on iOS Safari PWA** (waiting on service account)
- ⏳ **QA sign-off** (waiting on service account)

---

## 🚨 Alternative: Accept Current State for MVP

If getting the service account takes too long, you CAN launch with:

**What Works**:
- ✅ Users can opt-in to notifications
- ✅ Tokens are saved and ready
- ✅ Infrastructure is in place

**What Doesn't Work**:
- ❌ Actual push notifications can't be sent yet

**Decision**:
- Users can enable notifications now
- When you get service account later, pushes start working immediately for all opted-in users
- No code changes needed - just add the env var and restart

**Trade-off**: Users opt in but won't receive pushes until service account is added. Depends on how critical push is for launch.

---

## 📞 Need Help?

**If Org Admin denies the request:**
- Escalate to Tech Lead/Product Lead
- Explain this blocks a P0 pre-launch requirement
- Alternative: Consider using Firebase legacy server key (deprecated but may work)

**If JSON format issues:**
- Check that `private_key` has `\n` (not actual newlines)
- Verify it's valid JSON (use jsonlint.com)
- Try wrapping in single quotes if issues persist

**If Admin SDK still doesn't initialize:**
- Check server console logs for parse errors
- Verify project_id matches "dabapp-f2db7"
- Ensure client_email is the firebase-adminsdk account

---

**Status**: Ready for Org Admin coordination. Implementation complete.
