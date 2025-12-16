-- Create accept_crew_invite RPC function
-- This function handles when a user accepts an invite to join a crew
-- Run this in Supabase SQL Editor

CREATE OR REPLACE FUNCTION accept_crew_invite(invite_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invite RECORD;
  v_thread_id UUID;
BEGIN
  -- Get invite details
  SELECT crew_id, invitee_id, inviter_id, status
  INTO v_invite
  FROM crew_invites
  WHERE id = invite_id
    AND invitee_id = auth.uid()  -- User can only accept invites sent to them
    AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invite not found or already processed';
  END IF;
  
  -- Get the thread for this crew
  SELECT id INTO v_thread_id
  FROM threads
  WHERE crew_id = v_invite.crew_id
    AND type = 'crew'
  LIMIT 1;
  
  IF v_thread_id IS NULL THEN
    RAISE EXCEPTION 'Thread not found for this crew';
  END IF;
  
  -- Add user to thread_participants
  INSERT INTO thread_participants (thread_id, user_id, role)
  VALUES (v_thread_id, v_invite.invitee_id, 'member')
  ON CONFLICT (thread_id, user_id) DO NOTHING;
  
  -- Update invite status
  UPDATE crew_invites
  SET status = 'accepted',
      accepted_at = NOW()
  WHERE id = invite_id;
END;
$$;

COMMENT ON FUNCTION accept_crew_invite IS 'Allows a user to accept a crew invite and join the thread';
