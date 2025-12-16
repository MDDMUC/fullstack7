-- Update crew_invites UPDATE policy to allow owners to accept requests
-- Run this in Supabase SQL Editor

-- Drop the existing UPDATE policy
DROP POLICY IF EXISTS "Users can update their own invites" ON crew_invites;

-- Create new UPDATE policy that allows:
-- 1. Invitees to accept/decline invites sent to them
-- 2. Inviters (owners) to accept requests (where they are the inviter)
CREATE POLICY "Users can update relevant crew invites"
  ON crew_invites FOR UPDATE
  TO authenticated
  USING (
    -- Invitee can update invites sent to them
    invitee_id = auth.uid()
    OR
    -- Inviter can update invites they sent (to accept requests)
    (
      inviter_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM crews
        WHERE id = crew_invites.crew_id
        AND created_by = auth.uid()
      )
    )
  )
  WITH CHECK (
    -- Same conditions for the new values
    invitee_id = auth.uid()
    OR
    (
      inviter_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM crews
        WHERE id = crew_invites.crew_id
        AND created_by = auth.uid()
      )
    )
  );
