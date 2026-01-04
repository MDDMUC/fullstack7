-- FIX_SAFETY_CRITICAL.sql
-- Purpose: Fixes critical safety failures (Block Enforcement & Rate Limiting)
-- found during QA automation.
-- Instructions: Run this entire script in Supabase SQL Editor.

BEGIN;

--------------------------------------------------------------------------------
-- 1. FIX BLOCK ENFORCEMENT
--------------------------------------------------------------------------------

-- Drop ALL existing INSERT policies on 'messages' to prevent permissive overrides.
-- We must ensure ONLY our strict policy exists.
DROP POLICY IF EXISTS "Allow thread participants to send messages" ON messages;
DROP POLICY IF EXISTS "Allow thread participants to send messages (with block check)" ON messages;
DROP POLICY IF EXISTS "Participants can insert messages" ON messages;
DROP POLICY IF EXISTS "Users can insert messages into threads they are part of" ON messages;
-- Add any other potential policy names found in previous migrations

-- Create the single, strict INSERT policy
CREATE POLICY "Strict message insert policy (blocks + participants)"
ON messages
FOR INSERT
TO authenticated
WITH CHECK (
  -- 1. User must be the sender
  auth.uid() = sender_id
  
  AND
  
  -- 2. User must be a participant in the thread
  EXISTS (
    SELECT 1 FROM thread_participants tp
    WHERE tp.thread_id = messages.thread_id
      AND tp.user_id = auth.uid()
  )
  
  AND

  -- 3. SENDER must NOT be blocked by any other participant
  NOT EXISTS (
    SELECT 1 FROM thread_participants tp
    JOIN blocks b ON b.blocker_id = tp.user_id
    WHERE tp.thread_id = messages.thread_id
      AND tp.user_id != auth.uid()    -- The other participant
      AND b.blocked_id = auth.uid()   -- Has blocked me (the sender)
  )
  
  AND

  -- 4. SENDER must NOT have blocked any other participant
  -- (Prevent sending messages to people you blocked)
  NOT EXISTS (
    SELECT 1 FROM thread_participants tp
    JOIN blocks b ON b.blocked_id = tp.user_id
    WHERE tp.thread_id = messages.thread_id
      AND tp.user_id != auth.uid()    -- The other participant
      AND b.blocker_id = auth.uid()   -- I (the sender) blocked them
  )
);

--------------------------------------------------------------------------------
-- 2. FIX RATE LIMITING
--------------------------------------------------------------------------------

-- Drop existing trigger/function to ensure clean slate
DROP TRIGGER IF EXISTS enforce_message_rate_limit ON messages;
DROP FUNCTION IF EXISTS check_message_rate_limit();

-- Re-create function with standard error code
CREATE OR REPLACE FUNCTION check_message_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  msg_count INTEGER;
BEGIN
  -- Count messages from this sender in last 10 seconds
  SELECT count(*)
  INTO msg_count
  FROM messages
  WHERE sender_id = NEW.sender_id
    AND created_at > (NOW() - INTERVAL '10 seconds');

  -- Limit is 5. If count is 5, this will be the 6th (rejected).
  IF msg_count >= 5 THEN
    RAISE EXCEPTION 'Rate limit exceeded' 
      USING ERRCODE = 'P0001', -- Standard custom error
            HINT = 'You can send up to 5 messages per 10 seconds.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-attach trigger
CREATE TRIGGER enforce_message_rate_limit
  BEFORE INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION check_message_rate_limit();

COMMIT;
