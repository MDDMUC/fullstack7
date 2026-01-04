-- Allow users to delete threads where they are a participant
-- For direct threads: user must be user_a or user_b
-- This enables "Leave Chat" functionality

-- Drop existing delete policy if it exists
DROP POLICY IF EXISTS "Users can delete their own threads" ON threads;

-- Create DELETE policy for threads
CREATE POLICY "Users can delete their own threads"
  ON threads FOR DELETE
  TO authenticated
  USING (
    -- For direct threads: user is either user_a or user_b
    (type = 'direct' AND (user_a = auth.uid() OR user_b = auth.uid()))
  );

-- Note: Group threads (event, gym, crew) should use thread_participants removal instead
-- Those threads should not be deleted when a user leaves, only their participation entry
