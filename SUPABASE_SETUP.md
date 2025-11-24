# Supabase Setup Guide

This guide will help you set up Supabase to capture all onboarding form fields.

## Option 1: Supabase Cloud (Recommended for Development)

### Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Name**: Your project name
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to you
5. Wait for project to be created (~2 minutes)

### Step 2: Get Your API Keys

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (under "Project URL")
   - **anon public** key (under "Project API keys")

### Step 3: Set Up Environment Variables

Create a `.env.local` file in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### Step 4: Create the Database Schema

1. Go to **SQL Editor** in your Supabase dashboard
2. Run the SQL migration file (see `supabase/migrations/001_profiles_table.sql`)
3. Or copy and paste the SQL from that file

### Step 5: Set Up Storage Bucket (for photos)

**Option A: Using SQL (Recommended)**
1. Go to **SQL Editor** in your Supabase dashboard
2. Run the SQL from `supabase/storage_setup.sql`
3. This creates the bucket and all policies automatically

**Option B: Using UI**
1. Go to **Storage** in your Supabase dashboard
2. Click "Create a new bucket"
3. Name it: `avatars`
4. Make it **Public**
5. Set file size limit to 5MB
6. Go to **SQL Editor** and run `supabase/storage_policies.sql` to set up policies

## Option 2: Local Supabase (Using Docker)

### Prerequisites
- Docker Desktop installed
- Supabase CLI installed: `npm install -g supabase`

### Step 1: Initialize Supabase Locally

```bash
# Initialize Supabase in your project
supabase init

# Start local Supabase
supabase start
```

This will give you:
- Local Supabase URL (usually `http://localhost:54321`)
- Local anon key

### Step 2: Set Up Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_local_anon_key_from_supabase_start
```

### Step 3: Run Migrations

```bash
# Apply the migration
supabase db reset
```

Or manually run the SQL from `supabase/migrations/001_profiles_table.sql`

## Database Schema

The `profiles` table includes all onboarding fields:

- **Basic Info**: username, age, bio, pronouns
- **Location**: city (homebase), original_from, distance
- **Preferences**: style, interests (tags), goals, lookingFor
- **Contact**: phone_number
- **Media**: avatar_url
- **Status**: status

## Storage Setup

### Create Storage Bucket

Run this SQL in Supabase SQL Editor:

```sql
-- Create avatars bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;
```

### Storage Policies

Run these SQL commands to allow authenticated users to upload:

```sql
-- Allow authenticated users to upload avatars
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow public read access
CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

## Testing the Setup

1. Start your Next.js dev server: `npm run dev`
2. Navigate to `/onboarding`
3. Complete the onboarding flow
4. Check your Supabase dashboard:
   - **Table Editor** → `profiles` table should show the new profile
   - **Storage** → `avatars` bucket should show uploaded photos

## Troubleshooting

### "Supabase is not configured" error
- Check that `.env.local` exists and has correct values
- Restart your dev server after adding env variables

### "relation 'profiles' does not exist"
- Run the migration SQL in Supabase SQL Editor

### Photo upload fails
- Make sure the `avatars` bucket exists and is public
- Check storage policies are set up correctly
- Verify user is authenticated

## Next Steps

After setup, you can:
- View profiles in Supabase Table Editor
- Query profiles using Supabase client
- Set up Row Level Security (RLS) policies for data protection

