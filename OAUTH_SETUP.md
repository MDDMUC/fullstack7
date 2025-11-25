# OAuth Setup Guide for Google and Apple

This guide will help you set up Google and Apple OAuth authentication in Supabase.

## Prerequisites

1. A Supabase project (already set up)
2. Google Cloud Console account (for Google OAuth)
3. Apple Developer account (for Apple OAuth)

## Setting Up Google OAuth

### Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Choose **Web application** as the application type
6. Add authorized redirect URIs:
   - `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
   - For local development: `http://localhost:3000/auth/callback`
7. Copy the **Client ID** and **Client Secret**

### Step 2: Configure Google in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Providers**
3. Find **Google** and click to enable it
4. Enter your **Client ID** and **Client Secret** from Step 1
5. Click **Save**

### Step 3: Update Redirect URL (if needed)

The redirect URL should be:
```
https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
```

For local development, Supabase will handle this automatically.

## Setting Up Apple OAuth

### Step 1: Create Apple Service ID

1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Click **Identifiers** → **+** button
4. Select **Services IDs** → **Continue**
5. Enter a description and identifier (e.g., `com.yourcompany.yourapp`)
6. Check **Sign in with Apple** → **Configure**
7. Add your domain and redirect URL:
   - Primary App ID: Your app's bundle ID
   - Website URLs:
     - Domains: `YOUR_PROJECT_REF.supabase.co`
     - Return URLs: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
8. Save and continue

### Step 2: Create Apple Key

1. In Apple Developer Portal, go to **Keys**
2. Click **+** to create a new key
3. Name it (e.g., "Supabase OAuth Key")
4. Enable **Sign in with Apple**
5. Click **Configure** and select your Service ID
6. Click **Save** → **Continue** → **Register**
7. **Download the key file** (.p8) - you can only download it once!
8. Note the **Key ID**

### Step 3: Configure Apple in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Providers**
3. Find **Apple** and click to enable it
4. Enter:
   - **Services ID**: The identifier you created (e.g., `com.yourcompany.yourapp`)
   - **Secret Key**: The contents of the .p8 file you downloaded
   - **Key ID**: The Key ID from Step 2
   - **Team ID**: Your Apple Team ID (found in your Apple Developer account)
5. Click **Save**

## Testing OAuth

1. Go to your signup page
2. Click **Continue with Google** or **Continue with Apple**
3. You should be redirected to the provider's login page
4. After authentication, you'll be redirected back to `/auth/callback`
5. The callback handler will create your profile and redirect you appropriately

## Troubleshooting

### Google OAuth Issues

- **"redirect_uri_mismatch"**: Make sure the redirect URI in Google Cloud Console exactly matches: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
- **"invalid_client"**: Check that your Client ID and Client Secret are correct in Supabase
- **"access_denied"**: User cancelled the OAuth flow

### Apple OAuth Issues

- **"invalid_client"**: Verify your Services ID, Key ID, Team ID, and Secret Key are all correct
- **"invalid_request"**: Check that your redirect URL is properly configured in Apple Developer Portal
- **Key file issues**: Make sure you copied the entire .p8 file contents including the header and footer

### General Issues

- **Callback not working**: Ensure `/auth/callback` route exists (already created)
- **Profile not created**: Check browser console for errors
- **Redirect loops**: Verify your redirect URLs match exactly

## Environment Variables

No additional environment variables are needed - Supabase handles OAuth configuration through the dashboard.

## Next Steps

After setting up OAuth:

1. Test both Google and Apple sign-in flows
2. Verify profiles are created correctly
3. Check that onboarding data is applied if user had saved data
4. Test the redirect flow to onboarding or home page

## Notes

- Google OAuth is generally easier to set up than Apple
- Apple requires an active Apple Developer account ($99/year)
- Both providers require HTTPS in production (Supabase provides this)
- Local development works with `http://localhost` for Google, but Apple may require HTTPS even locally




