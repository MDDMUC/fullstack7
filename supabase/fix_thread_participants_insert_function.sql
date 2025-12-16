-- Create SECURITY DEFINER function to add thread participants
-- This bypasses RLS policy checks and allows users to join threads
-- Run this in Supabase SQL Editor

-- Create function to add user to thread participants
CREATE OR REPLACE FUNCTION add_thread_participant(p_thread_id UUID, p_user_id UUID, p_role TEXT DEFAULT 'member')
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO thread_participants (thread_id, user_id, role)
  VALUES (p_thread_id, p_user_id, p_role)
  ON CONFLICT (thread_id, user_id) DO UPDATE
  SET role = COALESCE(EXCLUDED.role, thread_participants.role);
END;
$$;

COMMENT ON FUNCTION add_thread_participant IS 'Allows users to join threads by bypassing RLS checks';

-- Also ensure the basic INSERT policy exists and is simple
-- Drop ALL existing INSERT policies first
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'thread_participants' AND cmd = 'INSERT') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON thread_participants';
    END LOOP;
END $$;

-- Create a simple policy that allows users to add themselves
CREATE POLICY "Users can join threads"
  ON thread_participants FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Also allow owners/creators to add participants (for invites)
CREATE POLICY "Owners can add participants"
  ON thread_participants FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Crew owner can add participants
    EXISTS (
      SELECT 1
      FROM threads t
      JOIN crews c ON c.id = t.crew_id
      WHERE t.id = thread_participants.thread_id
        AND c.created_by = auth.uid()
        AND t.type = 'crew'
    )
    OR
    -- Event creator can add participants
    EXISTS (
      SELECT 1
      FROM threads t
      JOIN events e ON e.id = t.event_id
      WHERE t.id = thread_participants.thread_id
        AND e.created_by = auth.uid()
        AND t.type = 'event'
    )
    OR
    -- Thread creator can add participants
    EXISTS (
      SELECT 1
      FROM threads t
      WHERE t.id = thread_participants.thread_id
        AND t.created_by = auth.uid()
    )
  );
