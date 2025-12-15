-- Create storage buckets for crew and event cover images
-- Run this in Supabase SQL Editor
-- This script safely checks for existing buckets and policies before creating them

-- Step 1: Create the crew-cover bucket (only if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'crew-cover') THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'crew-cover',
      'crew-cover',
      true,
      5242880, -- 5MB limit
      ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    );
    RAISE NOTICE 'Created crew-cover bucket';
  ELSE
    RAISE NOTICE 'crew-cover bucket already exists, skipping creation';
  END IF;
END $$;

-- Step 2: Create the event-cover bucket (only if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'event-cover') THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'event-cover',
      'event-cover',
      true,
      5242880, -- 5MB limit
      ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    );
    RAISE NOTICE 'Created event-cover bucket';
  ELSE
    RAISE NOTICE 'event-cover bucket already exists, skipping creation';
  END IF;
END $$;

-- Step 3: Storage Policies for crew-cover bucket
-- Drop existing policies if they exist, then create them (prevents duplicates)

DROP POLICY IF EXISTS "Users can upload crew cover images" ON storage.objects;
CREATE POLICY "Users can upload crew cover images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'crew-cover' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Public can view crew cover images" ON storage.objects;
CREATE POLICY "Public can view crew cover images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'crew-cover');

DROP POLICY IF EXISTS "Users can update own crew cover images" ON storage.objects;
CREATE POLICY "Users can update own crew cover images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'crew-cover' 
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'crew-cover' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users can delete own crew cover images" ON storage.objects;
CREATE POLICY "Users can delete own crew cover images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'crew-cover' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Step 4: Storage Policies for event-cover bucket
-- Drop existing policies if they exist, then create them (prevents duplicates)

DROP POLICY IF EXISTS "Users can upload event cover images" ON storage.objects;
CREATE POLICY "Users can upload event cover images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'event-cover' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Public can view event cover images" ON storage.objects;
CREATE POLICY "Public can view event cover images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'event-cover');

DROP POLICY IF EXISTS "Users can update own event cover images" ON storage.objects;
CREATE POLICY "Users can update own event cover images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'event-cover' 
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'event-cover' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users can delete own event cover images" ON storage.objects;
CREATE POLICY "Users can delete own event cover images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'event-cover' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Verify the buckets were created
SELECT * FROM storage.buckets WHERE id IN ('crew-cover', 'event-cover');

