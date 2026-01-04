-- FIX_BLOCK_VISIBILITY.sql
-- Purpose: Fixes the "Invisible Block" security hole.
-- The blocked user cannot see the block record due to RLS, so the direct check fails.
-- We use a SECURITY DEFINER function to check the block status with elevated privileges.

BEGIN;

--------------------------------------------------------------------------------
-- 1. Create Secure Helper Function
--------------------------------------------------------------------------------

-- Function: check_if_sender_is_blocked
-- Returns TRUE if the executing user (sender) is blocked by the target receiver
-- or by any participant in the given thread.
-- Runs as SECURITY DEFINER (Admin) to bypass 'blocks' table RLS.

CREATE OR REPLACE FUNCTION check_if_sender_is_blocked(target_thread_id UUID, target_receiver_id UUID DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- Critical: Runs with owner permissions
SET search_path = public -- Secure search path
AS $$
DECLARE
  sender_uuid UUID;
  is_blocked BOOLEAN;
BEGIN
  sender_uuid := auth.uid();

  -- 1. Check Direct Block (if receiver is known)
  IF target_receiver_id IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1 FROM blocks
      WHERE blocker_id = target_receiver_id
        AND blocked_id = sender_uuid
    ) INTO is_blocked;
    
    IF is_blocked THEN
      RETURN TRUE;
    END IF;
  END IF;

  -- 2. Check Thread Participants Block
  -- (Am I blocked by anyone currently in this thread?)
  SELECT EXISTS (
    SELECT 1 
    FROM thread_participants tp
    JOIN blocks b ON b.blocker_id = tp.user_id
    WHERE tp.thread_id = target_thread_id
      AND tp.user_id != sender_uuid -- Don't check self
      AND b.blocked_id = sender_uuid
  ) INTO is_blocked;

  RETURN is_blocked;
END;
$$;

--------------------------------------------------------------------------------
-- 2. Apply Policy to Messages
--------------------------------------------------------------------------------

-- Drop the broken policies
DROP POLICY IF EXISTS "FINAL_SAFETY_POLICY" ON messages;
DROP POLICY IF EXISTS "Strict message insert policy (blocks + participants)" ON messages;
DROP POLICY IF EXISTS "Allow thread participants to send messages" ON messages;
DROP POLICY IF EXISTS "Allow thread participants to send messages (with block check)" ON messages;

-- Create the robust policy using the secure function
CREATE POLICY "SECURE_MESSAGE_INSERT"
ON messages
FOR INSERT
TO authenticated
WITH CHECK (
  -- User must be the sender
  auth.uid() = sender_id
  AND
  -- User must be a participant
  EXISTS (
    SELECT 1 FROM thread_participants tp
    WHERE tp.thread_id = messages.thread_id
      AND tp.user_id = auth.uid()
  )
  AND
  -- CRITICAL: Use the secure function to check blocks
  NOT check_if_sender_is_blocked(messages.thread_id, messages.receiver_id)
);

COMMIT;
