-- Enforce blocks at database layer for messages
-- This prevents blocked users from sending messages to each other server-side
-- Run this in Supabase SQL Editor

-- Drop existing INSERT policy on messages
DROP POLICY IF EXISTS "Allow thread participants to send messages" ON messages;

-- Create new INSERT policy that enforces blocks
CREATE POLICY "Allow thread participants to send messages (with block check)"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    -- User must be authenticated
    auth.uid() IS NOT NULL
    AND
    -- User must be the sender
    sender_id = auth.uid()
    AND
    -- User must be a participant in the thread
    EXISTS (
      SELECT 1
      FROM thread_participants tp
      WHERE tp.thread_id = messages.thread_id
        AND tp.user_id = auth.uid()
    )
    AND
    -- Sender must not be blocked by any participant in the thread
    NOT EXISTS (
      SELECT 1
      FROM thread_participants tp
      INNER JOIN blocks b ON b.blocker_id = tp.user_id
      WHERE tp.thread_id = messages.thread_id
        AND b.blocked_id = auth.uid()
        AND tp.user_id != auth.uid()
    )
    AND
    -- Sender must not have blocked any participant in the thread
    NOT EXISTS (
      SELECT 1
      FROM thread_participants tp
      INNER JOIN blocks b ON b.blocked_id = tp.user_id
      WHERE tp.thread_id = messages.thread_id
        AND b.blocker_id = auth.uid()
        AND tp.user_id != auth.uid()
    )
  );

-- Create helper function to filter threads based on blocks
-- This will be used by client-side queries to hide threads with blocked users
CREATE OR REPLACE FUNCTION user_can_see_thread(thread_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- User can see thread if they are a participant AND
  -- there are no blocks between them and other participants
  RETURN EXISTS (
    SELECT 1
    FROM thread_participants tp
    WHERE tp.thread_id = thread_uuid
      AND tp.user_id = user_uuid
  )
  AND NOT EXISTS (
    -- User is blocked by another participant
    SELECT 1
    FROM thread_participants tp
    INNER JOIN blocks b ON b.blocker_id = tp.user_id AND b.blocked_id = user_uuid
    WHERE tp.thread_id = thread_uuid
      AND tp.user_id != user_uuid
  )
  AND NOT EXISTS (
    -- User has blocked another participant
    SELECT 1
    FROM thread_participants tp
    INNER JOIN blocks b ON b.blocker_id = user_uuid AND b.blocked_id = tp.user_id
    WHERE tp.thread_id = thread_uuid
      AND tp.user_id != user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION user_can_see_thread(UUID, UUID) TO authenticated;

-- Verify the policy was created
SELECT
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename = 'messages' AND cmd = 'INSERT';
