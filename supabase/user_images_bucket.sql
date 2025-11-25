-- Complete Storage Setup for User-Uploaded Images
-- Run this in Supabase SQL Editor to create a bucket for user images
-- This bucket can store avatars, photos, and other user-uploaded images

-- Step 1: Create the user-images bucket (if it doesn't exist)
-- This bucket will store all user-uploaded images (avatars, photos, etc.)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-images',
  'user-images',
  true, -- Public bucket so images can be accessed via URL
  10485760, -- 10MB limit per file
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif']
)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can upload own images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view user images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;

-- Step 3: Create Storage Policies with proper RLS

-- Policy 1: Allow authenticated users to upload their own images
-- Images are stored in folders named after the user's ID: {user-id}/filename.ext
CREATE POLICY "Users can upload own images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-images' 
  AND (storage.foldername(name))[1] = (select auth.uid())::text
);

-- Policy 2: Allow public read access to all images
-- This allows anyone to view images via public URLs
CREATE POLICY "Public can view user images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'user-images');

-- Policy 3: Allow users to update their own images
CREATE POLICY "Users can update own images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'user-images' 
  AND (storage.foldername(name))[1] = (select auth.uid())::text
)
WITH CHECK (
  bucket_id = 'user-images' 
  AND (storage.foldername(name))[1] = (select auth.uid())::text
);

-- Policy 4: Allow users to delete their own images
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-images' 
  AND (storage.foldername(name))[1] = (select auth.uid())::text
);

-- Step 4: Verify the bucket was created
SELECT 
  id, 
  name, 
  public, 
  file_size_limit, 
  allowed_mime_types,
  created_at
FROM storage.buckets 
WHERE id = 'user-images';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ User images bucket created successfully!';
  RAISE NOTICE '📁 Bucket ID: user-images';
  RAISE NOTICE '🌐 Public access: Enabled';
  RAISE NOTICE '📏 File size limit: 10MB';
  RAISE NOTICE '🔒 RLS policies: Configured';
END $$;

