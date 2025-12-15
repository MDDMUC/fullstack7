-- Fix RLS policies for threads table to allow crew thread creation
-- Run this in Supabase SQL Editor

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can create crew threads" ON threads;
DROP POLICY IF EXISTS "Users can create event threads" ON threads;
DROP POLICY IF EXISTS "Users can create gym threads" ON threads;
DROP POLICY IF EXISTS "Users can create direct threads" ON threads;

-- Create policy to allow authenticated users to create crew threads
-- This policy allows any authenticated user to create a thread of type 'crew'
CREATE POLICY "Users can create crew threads"
ON threads FOR INSERT
TO authenticated
WITH CHECK (
  type = 'crew' 
  AND crew_id IS NOT NULL
);

-- Also ensure users can create event threads
CREATE POLICY "Users can create event threads"
ON threads FOR INSERT
TO authenticated
WITH CHECK (
  type = 'event' 
  AND event_id IS NOT NULL
);

-- Allow users to create gym threads
CREATE POLICY "Users can create gym threads"
ON threads FOR INSERT
TO authenticated
WITH CHECK (
  type = 'gym' 
  AND gym_id IS NOT NULL
);

-- Allow users to create direct threads
CREATE POLICY "Users can create direct threads"
ON threads FOR INSERT
TO authenticated
WITH CHECK (
  (type = 'direct' OR type IS NULL)
  AND (user_a = auth.uid() OR user_b = auth.uid())
);

-- Note: If you have other existing INSERT policies that conflict, you may need to check
-- your Supabase dashboard > Authentication > Policies and adjust them accordingly

