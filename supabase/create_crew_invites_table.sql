-- Create crew_invites table for managing crew invitations
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS crew_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_id UUID NOT NULL REFERENCES crews(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_email TEXT, -- For inviting users not yet on platform
  status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'declined', 'expired'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- Optional: set expiration date
  accepted_at TIMESTAMPTZ,
  
  -- Ensure either invitee_id or invitee_email is set
  CONSTRAINT crew_invites_invitee_check CHECK (
    (invitee_id IS NOT NULL) OR (invitee_email IS NOT NULL)
  )
);

-- Create indexes
CREATE INDEX IF NOT EXISTS crew_invites_crew_id_idx ON crew_invites(crew_id);
CREATE INDEX IF NOT EXISTS crew_invites_inviter_id_idx ON crew_invites(inviter_id);
CREATE INDEX IF NOT EXISTS crew_invites_invitee_id_idx ON crew_invites(invitee_id);
CREATE INDEX IF NOT EXISTS crew_invites_invitee_email_idx ON crew_invites(invitee_email);
CREATE INDEX IF NOT EXISTS crew_invites_status_idx ON crew_invites(status);

-- Enable Row Level Security
ALTER TABLE crew_invites ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read invites for crews they're part of or invites sent to them
CREATE POLICY "Users can view relevant crew invites"
  ON crew_invites FOR SELECT
  TO authenticated
  USING (
    inviter_id = auth.uid() 
    OR invitee_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM thread_participants tp
      JOIN threads t ON t.id = tp.thread_id
      WHERE t.crew_id = crew_invites.crew_id
      AND tp.user_id = auth.uid()
    )
  );

-- Policy: Only crew creators can send invites
CREATE POLICY "Crew creators can send invites"
  ON crew_invites FOR INSERT
  TO authenticated
  WITH CHECK (
    inviter_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM crews
      WHERE id = crew_id
      AND created_by = auth.uid()
    )
  );

-- Policy: Users can update invites sent to them (accept/decline)
CREATE POLICY "Users can update their own invites"
  ON crew_invites FOR UPDATE
  TO authenticated
  USING (invitee_id = auth.uid())
  WITH CHECK (invitee_id = auth.uid());

-- Policy: Crew creators can delete invites they sent
CREATE POLICY "Crew creators can delete their invites"
  ON crew_invites FOR DELETE
  TO authenticated
  USING (
    inviter_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM crews
      WHERE id = crew_id
      AND created_by = auth.uid()
    )
  );

-- Add comments
COMMENT ON TABLE crew_invites IS 'Invitations to join crews';
COMMENT ON COLUMN crew_invites.inviter_id IS 'User who sent the invite (must be crew creator)';
COMMENT ON COLUMN crew_invites.invitee_id IS 'User invited to join (if they have an account)';
COMMENT ON COLUMN crew_invites.invitee_email IS 'Email of user invited (if they dont have an account yet)';
COMMENT ON COLUMN crew_invites.status IS 'pending, accepted, declined, or expired';

