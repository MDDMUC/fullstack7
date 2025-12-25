-- Fix messages table RLS policy to allow crew/group thread participants to send messages
-- This fixes the "new row violates row-level security policy for table messages" error
-- Run this in Supabase SQL Editor

-- First, drop existing INSERT policies on messages
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'messages' AND cmd = 'INSERT') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON messages';
    END LOOP;
END $$;

-- Create a comprehensive INSERT policy for messages
-- This allows users to send messages if they are participants in the thread
CREATE POLICY "Allow thread participants to send messages"
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
  );

-- Verify the policy was created
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'messages' AND cmd = 'INSERT';
