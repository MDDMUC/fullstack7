-- Debug script to check crew permissions and thread participants
-- Replace <CREW_ID> and <USER_ID> with actual values to debug
-- Run this in Supabase SQL Editor

-- Step 1: Check if the crew exists and who created it
SELECT
  id,
  title,
  created_by,
  created_at
FROM crews
WHERE id = '<CREW_ID>';

-- Step 2: Check if there's a thread for this crew
SELECT
  id,
  type,
  crew_id,
  created_by,
  created_at
FROM threads
WHERE crew_id = '<CREW_ID>' AND type = 'crew';

-- Step 3: Check all participants in the crew thread
SELECT
  tp.user_id,
  tp.role,
  tp.joined_at,
  p.username
FROM thread_participants tp
LEFT JOIN profiles p ON p.id = tp.user_id
WHERE tp.thread_id IN (
  SELECT id FROM threads WHERE crew_id = '<CREW_ID>' AND type = 'crew'
);

-- Step 4: Check if specific user is a participant
SELECT
  tp.user_id,
  tp.role,
  tp.joined_at,
  p.username,
  CASE WHEN tp.user_id IS NOT NULL THEN 'YES' ELSE 'NO' END as is_participant
FROM thread_participants tp
RIGHT JOIN profiles p ON p.id = tp.user_id AND tp.thread_id IN (
  SELECT id FROM threads WHERE crew_id = '<CREW_ID>' AND type = 'crew'
)
WHERE p.id = '<USER_ID>';

-- Step 5: Check crew invites for this user
SELECT
  id,
  status,
  created_at,
  accepted_at
FROM crew_invites
WHERE crew_id = '<CREW_ID>' AND invitee_id = '<USER_ID>';

-- Step 6: View current messages INSERT policy
SELECT
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'messages' AND cmd = 'INSERT';
