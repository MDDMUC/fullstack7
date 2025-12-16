-- Fix thread_participants INSERT policy to allow users to join any thread
-- This fixes the "new row violates row-level security policy" error
-- Run this in Supabase SQL Editor

-- First, drop ALL existing INSERT policies on thread_participants
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'thread_participants' AND cmd = 'INSERT') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON thread_participants';
    END LOOP;
END $$;

-- Create a single, comprehensive INSERT policy
-- This allows users to add themselves to ANY thread (event, crew, gym, direct)
CREATE POLICY "Allow users to join threads"
  ON thread_participants FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Primary condition: User can always add themselves to any thread
    user_id = auth.uid()
    OR
    -- Allow crew owners to add others to their crew threads
    EXISTS (
      SELECT 1
      FROM threads t
      JOIN crews c ON c.id = t.crew_id
      WHERE t.id = thread_participants.thread_id
        AND c.created_by = auth.uid()
        AND t.type = 'crew'
    )
    OR
    -- Allow event creators to add others to their event threads
    EXISTS (
      SELECT 1
      FROM threads t
      JOIN events e ON e.id = t.event_id
      WHERE t.id = thread_participants.thread_id
        AND e.created_by = auth.uid()
        AND t.type = 'event'
    )
    OR
    -- Allow thread creators to add participants
    EXISTS (
      SELECT 1
      FROM threads t
      WHERE t.id = thread_participants.thread_id
        AND t.created_by = auth.uid()
    )
    OR
    -- Allow existing participants to add others (for invites)
    EXISTS (
      SELECT 1
      FROM thread_participants tp
      WHERE tp.thread_id = thread_participants.thread_id
        AND tp.user_id = auth.uid()
    )
  );

-- Verify the policy was created
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'thread_participants' AND cmd = 'INSERT';
