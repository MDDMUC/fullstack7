-- Comprehensive fix for crew creator auto-join issue
-- This ensures crew creators can automatically join their crew chat
-- Run this in Supabase SQL Editor

-- ===================================================
-- 1. Fix thread_participants RLS for crew creators
-- ===================================================

-- Drop existing INSERT policies that might be too restrictive
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'thread_participants' AND cmd = 'INSERT') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON thread_participants';
    END LOOP;
END $$;

-- Create comprehensive INSERT policy
-- Allows crew creators to add themselves, and users to join threads they're invited to
CREATE POLICY "Allow users to join threads"
  ON thread_participants FOR INSERT
  TO authenticated
  WITH CHECK (
    -- User can always add themselves
    user_id = auth.uid()
    OR
    -- Crew owners can add others to their crew threads
    EXISTS (
      SELECT 1
      FROM threads t
      JOIN crews c ON c.id = t.crew_id
      WHERE t.id = thread_participants.thread_id
        AND c.created_by = auth.uid()
        AND t.type = 'crew'
    )
    OR
    -- Event creators can add others
    EXISTS (
      SELECT 1
      FROM threads t
      JOIN events e ON e.id = t.event_id
      WHERE t.id = thread_participants.thread_id
        AND e.created_by = auth.uid()
        AND t.type = 'event'
    )
    OR
    -- Thread creators can add participants
    EXISTS (
      SELECT 1
      FROM threads t
      WHERE t.id = thread_participants.thread_id
        AND t.created_by = auth.uid()
    )
  );

-- ===================================================
-- 2. Fix messages RLS for thread participants
-- ===================================================

-- Drop existing INSERT policies on messages
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'messages' AND cmd = 'INSERT') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON messages';
    END LOOP;
END $$;

-- Create comprehensive INSERT policy for messages
CREATE POLICY "Allow thread participants to send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND sender_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM thread_participants tp
      WHERE tp.thread_id = messages.thread_id
        AND tp.user_id = auth.uid()
    )
  );

-- ===================================================
-- 3. Create trigger to auto-add crew creator
-- ===================================================

-- Function to automatically add crew creator to thread_participants
CREATE OR REPLACE FUNCTION auto_add_crew_creator_to_thread()
RETURNS TRIGGER AS $$
BEGIN
  -- Only for crew threads
  IF NEW.type = 'crew' AND NEW.crew_id IS NOT NULL THEN
    -- Get the crew creator
    INSERT INTO thread_participants (thread_id, user_id, role)
    SELECT
      NEW.id,
      c.created_by,
      'owner'
    FROM crews c
    WHERE c.id = NEW.crew_id
    ON CONFLICT (thread_id, user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS auto_add_crew_creator_trigger ON threads;

-- Create trigger
CREATE TRIGGER auto_add_crew_creator_trigger
  AFTER INSERT ON threads
  FOR EACH ROW
  WHEN (NEW.type = 'crew' AND NEW.crew_id IS NOT NULL)
  EXECUTE FUNCTION auto_add_crew_creator_to_thread();

-- ===================================================
-- 4. Verify policies
-- ===================================================

-- Check thread_participants policies
SELECT
  'thread_participants' as table_name,
  policyname,
  cmd,
  with_check
FROM pg_policies
WHERE tablename = 'thread_participants' AND cmd = 'INSERT';

-- Check messages policies
SELECT
  'messages' as table_name,
  policyname,
  cmd,
  with_check
FROM pg_policies
WHERE tablename = 'messages' AND cmd = 'INSERT';

-- ===================================================
-- 5. Fix existing crews missing thread participants
-- ===================================================

-- Add crew creators to their threads if they're missing
INSERT INTO thread_participants (thread_id, user_id, role)
SELECT DISTINCT
  t.id as thread_id,
  c.created_by as user_id,
  'owner' as role
FROM threads t
JOIN crews c ON c.id = t.crew_id
WHERE t.type = 'crew'
  AND NOT EXISTS (
    SELECT 1
    FROM thread_participants tp
    WHERE tp.thread_id = t.id
      AND tp.user_id = c.created_by
  )
ON CONFLICT (thread_id, user_id) DO NOTHING;

-- Verify the fix
SELECT
  'Fixed crews' as status,
  COUNT(*) as count
FROM thread_participants tp
JOIN threads t ON t.id = tp.thread_id
JOIN crews c ON c.id = t.crew_id
WHERE t.type = 'crew'
  AND tp.role = 'owner'
  AND tp.user_id = c.created_by;
