-- ============================================
-- Fix crew_invites RLS policy to allow users to request invites
-- ============================================

-- Drop existing INSERT policy
DROP POLICY IF EXISTS "Crew members can send invites" ON crew_invites;

-- Create new INSERT policy that allows both:
-- 1. Crew members sending invites (inviter_id = auth.uid())
-- 2. Users requesting invites (invitee_id = auth.uid())
CREATE POLICY "Users can send or request crew invites"
ON crew_invites FOR INSERT
TO authenticated
WITH CHECK (
  (
    -- User is sending an invite (they are the inviter)
    inviter_id = auth.uid()
    AND (
      -- User created the crew
      EXISTS (
        SELECT 1 FROM crews
        WHERE id = crew_invites.crew_id
        AND created_by = auth.uid()
      )
      OR
      -- User is a participant in the crew's thread
      EXISTS (
        SELECT 1 FROM threads t
        JOIN thread_participants tp ON tp.thread_id = t.id
        WHERE t.crew_id = crew_invites.crew_id
        AND tp.user_id = auth.uid()
      )
    )
  )
  OR
  (
    -- User is requesting an invite (they are the invitee)
    invitee_id = auth.uid()
    AND inviter_id IS NOT NULL
  )
);

-- Verify the policy
SELECT 
  policyname,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'crew_invites'
AND cmd = 'INSERT';

