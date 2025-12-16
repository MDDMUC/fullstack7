-- Allow users to join event threads and gym threads
-- This fixes the issue where users can't join event chats via "Join Chat" button
-- Run this in Supabase SQL Editor

-- Drop existing INSERT policy if it exists
DROP POLICY IF EXISTS "Users and crew owners can add participants" ON thread_participants;

-- Create comprehensive policy that allows:
-- 1. Users to add themselves to any thread
-- 2. Crew owners to add participants to their crew threads
-- 3. Thread creators to add participants
-- 4. Existing participants can add others (for invites from participants)
-- 5. Users can join event threads (event type)
-- 6. Users can join gym threads (gym type)
CREATE POLICY "Users can join threads and owners can add participants"
  ON thread_participants FOR INSERT
  TO authenticated
  WITH CHECK (
    -- User can add themselves to any thread
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
    -- Event creator can add participants to their event thread
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
    OR
    -- Existing participants can add others (for invites from participants)
    EXISTS (
      SELECT 1
      FROM thread_participants tp
      WHERE tp.thread_id = thread_participants.thread_id
        AND tp.user_id = auth.uid()
    )
  );
