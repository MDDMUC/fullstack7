-- Manually add a user to a crew thread as a participant
-- Use this if you need to quickly fix a user's access to a crew chat
-- Replace <CREW_ID> and <USER_ID> with actual values
-- Run this in Supabase SQL Editor

-- This will add the user to the thread_participants table for the crew
INSERT INTO thread_participants (thread_id, user_id, role)
SELECT
  t.id as thread_id,
  '<USER_ID>' as user_id,
  'member' as role
FROM threads t
WHERE t.crew_id = '<CREW_ID>'
  AND t.type = 'crew'
ON CONFLICT (thread_id, user_id) DO NOTHING;

-- Verify the user was added
SELECT
  tp.thread_id,
  tp.user_id,
  tp.role,
  tp.joined_at,
  p.username,
  c.title as crew_title
FROM thread_participants tp
JOIN profiles p ON p.id = tp.user_id
JOIN threads t ON t.id = tp.thread_id
JOIN crews c ON c.id = t.crew_id
WHERE t.crew_id = '<CREW_ID>'
  AND tp.user_id = '<USER_ID>';
