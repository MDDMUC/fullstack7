# Troubleshooting: Email Confirmation "Missing confirmation code" Error

## Problem
When clicking email confirmation link, user sees:
```
Something went wrong
Missing confirmation code.
```

## Root Cause
The Supabase email confirmation link is not including the `code` parameter that the auth callback expects.

This happens when:
1. Supabase email template redirects to wrong URL
2. Auth flow type is misconfigured (magiclink vs pkce)
3. Email redirect URL doesn't match configured URLs

## Solution

### Step 1: Check Supabase Auth Settings

1. Go to Supabase Dashboard: https://supabase.com/dashboard
2. Select your DAB project
3. Go to **Authentication** → **URL Configuration**

#### Check These Settings:

**Site URL:**
- Should be: `https://your-domain.com` (production)
- Or: `http://localhost:3000` (development)
- **Must NOT have trailing slash**

**Redirect URLs (Add both):**
```
http://localhost:3000/auth/callback
https://your-production-domain.com/auth/callback
```

**Email Redirect URLs (deprecated but check):**
- Should match the callback URLs above

### Step 2: Check Email Templates

1. In Supabase Dashboard → **Authentication** → **Email Templates**
2. Click on **"Confirm signup"** template
3. Check the confirmation link format

**Expected format:**
```html
<a href="{{ .ConfirmationURL }}">Confirm your email</a>
```

**NOT:**
```html
<a href="{{ .SiteURL }}/auth/callback">Confirm</a>
```

**If the template is using `{{ .SiteURL }}` instead of `{{ .ConfirmationURL }}`, that's the problem!**

### Step 3: Verify Auth Flow Type

The code uses `exchangeCodeForSession()` which expects **PKCE flow**.

Check `supabase.auth.signUp()` is using correct flow:

**Current code (SignupStep.tsx:81-90):**
```typescript
const { error: signUpError } = await supabase.auth.signUp({
  email: formData.email,
  password: formData.password,
  options: {
    emailRedirectTo: `${window.location.origin}/auth/callback?next=/dab`,
    data: {
      name: formData.fullName,
    },
  },
})
```

This is correct ✅

### Step 4: Check Environment Variables

Verify `.env.local` has:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # or your production URL
```

**Important:** `NEXT_PUBLIC_SITE_URL` must match Supabase's Site URL setting

### Step 5: Test Email Confirmation Flow

After fixing Supabase settings:

1. Create a new test account
2. Check the confirmation email
3. Inspect the link URL - it should look like:
```
https://your-project.supabase.co/auth/v1/verify?
  token=xxxxx
  &type=signup
  &redirect_to=http://localhost:3000/auth/callback?next=/dab
```

4. Click the link
5. It should redirect to your callback with `code` parameter:
```
http://localhost:3000/auth/callback?code=xxxxx&next=/dab
```

## Quick Fix (If Above Doesn't Work)

### Option A: Use Magic Link Instead

Replace password signup with magic link (no password needed):

```typescript
// In SignupStep.tsx, replace handleSubmit with:
const { error } = await supabase.auth.signInWithOtp({
  email: formData.email,
  options: {
    emailRedirectTo: `${window.location.origin}/auth/callback?next=/dab`,
  },
})

if (!error) {
  router.push('/dab/confirm-email')
}
```

### Option B: Disable Email Confirmation (Development Only)

**WARNING: Not recommended for production**

1. Supabase Dashboard → Authentication → Settings
2. Scroll to "Email Auth"
3. Uncheck "Enable email confirmations"
4. Users will be auto-confirmed on signup

### Option C: Use OAuth Only (Google Sign-In)

Disable email/password signup and use Google OAuth only:
- Google OAuth doesn't require email confirmation
- Users click "Sign in with Google" and are immediately authenticated

## Debugging Steps

### 1. Check Email Link URL

When you receive the confirmation email, right-click the confirmation button and "Copy link address". Paste it here to inspect:

**Expected pattern:**
```
https://[project].supabase.co/auth/v1/verify?
  token=[long-token]
  &type=signup
  &redirect_to=http://localhost:3000/auth/callback?next=/dab
```

**If you see this instead (WRONG):**
```
http://localhost:3000/auth/callback?next=/dab
```
→ The email template is using `{{ .SiteURL }}` instead of `{{ .ConfirmationURL }}`

### 2. Check Browser Network Tab

1. Open browser DevTools (F12)
2. Go to Network tab
3. Click the email confirmation link
4. Look for redirects
5. Check final URL has `?code=` parameter

### 3. Check Supabase Logs

1. Supabase Dashboard → Logs → Auth Logs
2. Filter by your test email
3. Look for errors or warnings

## Common Issues and Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| "Missing confirmation code" | Email template wrong | Use `{{ .ConfirmationURL }}` in template |
| Link redirects to homepage | Site URL has trailing slash | Remove `/` from Site URL |
| "Invalid redirect URL" | Callback not in allowed list | Add callback URL to Redirect URLs |
| Link expired | Took too long to click | Request new confirmation email |
| "Email already registered" | Account exists | Use password reset instead |

## Recommended Settings (Production)

**Supabase Auth Settings:**
```
Site URL: https://your-domain.com
Redirect URLs:
  - https://your-domain.com/auth/callback
  - http://localhost:3000/auth/callback (for local dev)

Email Confirmations: Enabled
Auto-confirm: Disabled
Email Rate Limit: 4 emails per hour
```

**Email Templates:**
- Use default Supabase templates (they're correct)
- Or ensure custom templates use `{{ .ConfirmationURL }}`

## Testing Checklist

After fixing:
- [ ] Sign up with new email
- [ ] Receive confirmation email within 1 minute
- [ ] Email link includes Supabase verification URL
- [ ] Click link redirects to `/auth/callback?code=xxx`
- [ ] Auth callback successfully exchanges code for session
- [ ] User redirected to `/dab` onboarding
- [ ] User can complete onboarding
- [ ] User can log in again with email/password

## Next Steps

1. **Fix Supabase email template** (most likely issue)
2. **Verify redirect URLs** are configured
3. **Test signup flow** end-to-end
4. **Update this doc** with what fixed it for your case

## Related Files

- Auth callback: `src/app/auth/callback/page.tsx`
- Signup step: `src/app/dab/steps/SignupStep.tsx`
- Supabase client: `src/lib/supabaseClient.ts`

---

**Status:** Issue identified - awaiting Supabase configuration fix
**Blocker:** Email confirmation links not including `code` parameter
**Impact:** All new user signups blocked
**Priority:** 🔴 CRITICAL
