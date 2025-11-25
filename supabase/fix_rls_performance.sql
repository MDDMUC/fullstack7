-- Fix RLS performance issue with auth.uid() calls
-- Run this in Supabase SQL Editor to fix the performance warning

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert own profile" ON onboardingprofiles;
DROP POLICY IF EXISTS "Users can update own profile" ON onboardingprofiles;

-- Recreate policies with optimized auth.uid() calls using subqueries
-- This prevents re-evaluation for each row and improves performance

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON onboardingprofiles FOR INSERT
  WITH CHECK ((select auth.uid()) = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON onboardingprofiles FOR UPDATE
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);





