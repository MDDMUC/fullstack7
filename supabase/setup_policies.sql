-- Setup RLS Policies for onboardingprofiles table
-- Run this in Supabase SQL Editor if you're getting "Policies are required" error

-- First, ensure RLS is enabled
ALTER TABLE onboardingprofiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON onboardingprofiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON onboardingprofiles;
DROP POLICY IF EXISTS "Users can update own profile" ON onboardingprofiles;

-- Policy: Users can read all profiles (for matching/browsing)
CREATE POLICY "Public profiles are viewable by everyone"
  ON onboardingprofiles FOR SELECT
  USING (true);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON onboardingprofiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON onboardingprofiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Verify policies are created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'onboardingprofiles';

