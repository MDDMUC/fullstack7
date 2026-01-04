# Firebase Setup Guide for Push Notifications

**Ticket**: TICKET-NOT-001
**Provider**: Firebase Cloud Messaging (FCM)
**Est. Time**: 15 minutes

---

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter project name: `DAB` (or `DAB-dev` for testing)
4. Disable Google Analytics (optional for push notifications)
5. Click **"Create project"**

---

## Step 2: Get Firebase Configuration

1. In Firebase Console, click the **gear icon** → **Project settings**
2. Scroll down to **"Your apps"** section
3. Click the **Web icon** (`</>`) to add a web app
4. Register app:
   - App nickname: `DAB Web`
   - Skip Firebase Hosting setup
5. Copy the `firebaseConfig` object values

---

## Step 3: Generate VAPID Key for Web Push

1. In Firebase Console → **Project settings** → **Cloud Messaging** tab
2. Scroll to **"Web Push certificates"** section
3. Click **"Generate key pair"** button
4. Copy the generated VAPID key (starts with `B...`)

---

## Step 4: Get Firebase Service Account JSON (Required for Server-Side Push Sending)

**⚠️ CRITICAL**: This step is **required** to send push notifications. Without it, users can opt-in but won't receive pushes.

### If You See "Key creation is not allowed" Error

Your organization has a policy blocking service account key creation. You need Org Admin help:

1. **Contact your Organization Administrator**

2. **Request** one of the following:
   - **Preferred**: Exception to `constraints/iam.disableServiceAccountKeyCreation` policy
   - **Alternative**: Ask Org Admin to create the key and share it securely

3. **Explain**: Needed for Firebase Cloud Messaging (push notifications for DAB app)

4. **Reference**: [Google Cloud Org Policy](https://cloud.google.com/resource-manager/docs/organization-policy/restricting-service-accounts)

### Option A: Firebase Console (Try This First)

1. Firebase Console → **Project settings** (gear icon) → **Service accounts** tab

2. Click **"Generate new private key"** button

3. Click **"Generate key"** in confirmation dialog

4. **Save** the downloaded JSON file (e.g., `dabapp-f2db7-firebase-adminsdk-xxxxx.json`)

### Option B: Google Cloud Console (If Firebase Blocked)

1. Go to [Google Cloud Console](https://console.cloud.google.com)

2. Select project "dabapp-f2db7"

3. **IAM & Admin** → **Service Accounts**

4. Find account ending with `@dabapp-f2db7.iam.gserviceaccount.com`

5. Click **⋮** → **Manage keys** → **Add Key** → **Create new key**

6. Select **JSON** → **Create**

7. **Save** the downloaded JSON file

### What to Do With the JSON File

The JSON file looks like this:

```json
{
  "type": "service_account",
  "project_id": "dabapp-f2db7",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIB...",
  "client_email": "firebase-adminsdk-xxxxx@dabapp-f2db7.iam.gserviceaccount.com",
  "client_id": "1234567890",
  ...
}
```

**IMPORTANT**: You'll add this **entire JSON** as a **single-line string** to `.env.local` in the next step.

---

## Step 5: Update Environment Variables

1. Open `.env.local` in the project root

2. Replace the placeholder values with your actual Firebase config:

```env
# From Step 2 (firebaseConfig object)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy... # Your actual API key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=dab-xxxxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=dab-xxxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=dab-xxxxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
NEXT_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:abcdef123456

# From Step 3 (VAPID key)
NEXT_PUBLIC_FIREBASE_VAPID_KEY=BNe... # Your VAPID public key
```

3. **Add the Service Account JSON** (from Step 4):

**CRITICAL**: The `private_key` field contains `\n` characters that **must be preserved**. Copy the entire JSON as-is:

```env
# Firebase Service Account (Server-side only, for sending pushes)
# From Step 4 - Paste the ENTIRE JSON file contents as a single line
# DO NOT escape quotes or newlines - paste exactly as downloaded
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"dabapp-f2db7","private_key_id":"abc123...","private_key":"-----BEGIN PRIVATE KEY-----\nMIIEvQIB...","client_email":"firebase-adminsdk-xxxxx@dabapp-f2db7.iam.gserviceaccount.com","client_id":"1234567890",...}
```

**How to format it correctly:**

- Open the JSON file in a text editor
- Copy the **entire contents** (all lines)
- Paste it **as-is** after `FIREBASE_SERVICE_ACCOUNT_JSON=`
- The newlines in `private_key` should stay as `\n` (literal backslash-n, not actual newlines)
- Keep all quotes and commas intact

4. Save the file

**⚠️ Security**: NEVER commit `.env.local` to git. It's already in `.gitignore`.

---

## Step 5: Update Service Worker with Firebase Config

1. Open `public/firebase-messaging-sw.js`
2. Replace the `firebaseConfig` object with your actual values:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",  // Same as NEXT_PUBLIC_FIREBASE_API_KEY
  authDomain: "dab-xxxxx.firebaseapp.com",
  projectId: "dab-xxxxx",
  storageBucket: "dab-xxxxx.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};
```

3. Save the file

**Note**: The service worker cannot access `.env.local`, so config must be hardcoded.

---

## Step 6: Apply Database Migration

1. Open [Supabase SQL Editor](https://supabase.com/dashboard)
2. Select your project: `sbygogkgwthgdzomaqgz`
3. Click **"New Query"**
4. Copy the contents of `supabase/create_push_notifications_tables.sql`
5. Paste into SQL Editor
6. Click **"Run"** (or Ctrl/Cmd + Enter)
7. Verify success message: `✅ Push notification tables created successfully!`

---

## Step 7: Test Configuration

1. Restart your dev server:
   ```bash
   npm run dev
   ```

2. Open browser console (F12)
3. Check for errors related to Firebase
4. Service worker should register at: `/firebase-messaging-sw.js`

---

## Step 8: Verify Service Worker Registration

1. Open Chrome DevTools → **Application** tab
2. Navigate to **Service Workers** (left sidebar)
3. You should see: `firebase-messaging-sw.js` with status **Activated**

If not registered:
- Check browser console for errors
- Verify `public/firebase-messaging-sw.js` exists
- Ensure dev server is running

---

## Troubleshooting

### Error: "Firebase: Error (auth/api-key-not-valid-please-pass-a-valid-api-key)"
**Solution**: Check `NEXT_PUBLIC_FIREBASE_API_KEY` in `.env.local` matches Firebase Console

### Error: "Messaging: We are unable to register the default service worker"
**Solution**:
1. Check `public/firebase-messaging-sw.js` has correct config
2. Clear browser cache and service workers
3. Restart dev server

### Error: "Failed to get FCM token"
**Solution**:
1. Verify VAPID key is correct
2. Check notification permission granted
3. Ensure service worker is active

### iOS Safari: Push not working
**Expected Behavior**:
- Regular Safari tab: Push does NOT work (by design)
- PWA (Add to Home Screen): Push DOES work
- Show user instructions to add to home screen

---

## Security Notes

1. **NEVER commit `.env.local`** - It's already in `.gitignore`
2. **Firebase API Key** - Safe to expose (client-side), but restrict in Firebase Console:
   - Go to **Google Cloud Console** → **APIs & Services** → **Credentials**
   - Edit API key and add **Application restrictions** (HTTP referrers)
   - Add: `https://yourdomain.com/*` and `http://localhost:3000/*`

3. **Service Worker Config** - Hardcoded config in `public/firebase-messaging-sw.js` is necessary and safe (same as client config)

---

## Next Steps After Setup

1. ✅ Firebase configured and .env.local updated
2. ⏳ Database migration applied
3. ⏳ Build Settings UI for notification toggle
4. ⏳ Test push delivery on iOS and Android

---

## Firebase Console Quick Links

- **Project Settings**: [console.firebase.google.com/project/YOUR_PROJECT_ID/settings/general](https://console.firebase.google.com/project/_/settings/general)
- **Cloud Messaging**: [console.firebase.google.com/project/YOUR_PROJECT_ID/settings/cloudmessaging](https://console.firebase.google.com/project/_/settings/cloudmessaging)
- **Usage & Billing**: [console.firebase.google.com/project/YOUR_PROJECT_ID/usage](https://console.firebase.google.com/project/_/usage)

---

**Status**: Setup guide ready. Complete Steps 1-7 to enable push notifications infrastructure.
