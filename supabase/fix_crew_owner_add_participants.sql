-- Allow crew owners to add participants to their crew threads
-- This fixes the issue where owners can't accept invite requests
-- Run this in Supabase SQL Editor

-- Drop existing INSERT policy if it exists
DROP POLICY IF EXISTS "Users can add participants to threads they created or are part of" ON thread_participants;
DROP POLICY IF EXISTS "Crew owners can add participants" ON thread_participants;

-- Create policy that allows:
-- 1. Users to add themselves as participants (existing behavior)
-- 2. Crew owners to add participants to their crew threads
CREATE POLICY "Users and crew owners can add participants"
  ON thread_participants FOR INSERT
  TO authenticated
  WITH CHECK (
    -- User can add themselves
    user_id = auth.uid()
    OR
    -- Crew owner can add participants to their crew thread
    EXISTS (
      SELECT 1
      FROM threads t
      JOIN crews c ON c.id = t.crew_id
      WHERE t.id = thread_participants.thread_id
        AND c.created_by = auth.uid()
        AND t.type = 'crew'
    )
    OR
    -- Thread creator can add participants
    EXISTS (
      SELECT 1
      FROM threads t
      WHERE t.id = thread_participants.thread_id
        AND t.created_by = auth.uid()
    )
    OR
    -- Existing participants can add others (for invites from participants)
    EXISTS (
      SELECT 1
      FROM thread_participants tp
      WHERE tp.thread_id = thread_participants.thread_id
        AND tp.user_id = auth.uid()
    )
  );
