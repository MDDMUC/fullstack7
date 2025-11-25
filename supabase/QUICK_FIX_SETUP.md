# Quick Fix: Missing Tables and Storage Bucket

Based on your console errors, you need to create:

1. ✅ **`avatars` storage bucket** (for photo uploads)
2. ✅ **`matches` table** (for the home page)

## Step 1: Create the Storage Bucket

Go to **Supabase Dashboard** → **SQL Editor** and run:

```sql
-- Create avatars bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = (select auth.uid())::text
);

CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = (select auth.uid())::text
)
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = (select auth.uid())::text
);

CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = (select auth.uid())::text
);
```

**OR** just run the entire `supabase/storage_setup.sql` file.

## Step 2: Create the Matches Table

Go to **Supabase Dashboard** → **SQL Editor** and run `supabase/create_matches_table.sql`:

```sql
-- Create matches table
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_b UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_a, user_b)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS matches_user_a_idx ON matches(user_a);
CREATE INDEX IF NOT EXISTS matches_user_b_idx ON matches(user_b);

-- Enable Row Level Security
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own matches
CREATE POLICY "Users can view own matches"
  ON matches FOR SELECT
  USING (
    (select auth.uid()) = user_a OR 
    (select auth.uid()) = user_b
  );

-- Policy: Users can insert matches (system creates them)
CREATE POLICY "Users can insert matches"
  ON matches FOR INSERT
  WITH CHECK (
    (select auth.uid()) = user_a OR 
    (select auth.uid()) = user_b
  );
```

**OR** just run the entire `supabase/create_matches_table.sql` file.

## Step 3: Verify

After running both SQL scripts:

1. **Check Storage:**
   - Go to **Storage** → Should see `avatars` bucket

2. **Check Tables:**
   - Go to **Table Editor** → Should see `matches` table

3. **Test Again:**
   - Refresh your app
   - Try uploading photos in onboarding
   - Check home page - should load without errors

## Alternative: Run All Setup Files

If you want to set up everything at once, run these files in order:

1. `supabase/storage_setup.sql` (or `supabase/user_images_bucket.sql`)
2. `supabase/create_matches_table.sql`

That's it! Your app should work now. 🎉

