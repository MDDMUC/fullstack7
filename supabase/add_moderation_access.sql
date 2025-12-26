-- Add moderation access path for reports
-- Allows moderators to view and update reports
-- Run this in Supabase SQL Editor

-- Create moderators table to track who has moderation access
CREATE TABLE IF NOT EXISTS moderators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  granted_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT TRUE
);

-- Enable RLS on moderators table
ALTER TABLE moderators ENABLE ROW LEVEL SECURITY;

-- Only moderators can view the moderators table
CREATE POLICY "moderators_select_moderators"
  ON moderators FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (SELECT user_id FROM moderators WHERE is_active = TRUE)
  );

-- Only active moderators can grant moderator status (INSERT)
CREATE POLICY "moderators_insert_moderators"
  ON moderators FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IN (SELECT user_id FROM moderators WHERE is_active = TRUE)
    AND granted_by = auth.uid()
  );

-- Only active moderators can revoke moderator status (UPDATE)
CREATE POLICY "moderators_update_moderators"
  ON moderators FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IN (SELECT user_id FROM moderators WHERE is_active = TRUE)
  );

-- Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE ON moderators TO authenticated;

-- Create helper function to check if user is a moderator
CREATE OR REPLACE FUNCTION is_moderator(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM moderators
    WHERE user_id = user_uuid
      AND is_active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION is_moderator(UUID) TO authenticated;

-- Add RLS policy for moderators to view all reports
CREATE POLICY "moderators_select_all_reports"
  ON reports FOR SELECT
  TO authenticated
  USING (
    -- User can see their own reports OR user is a moderator
    auth.uid() = reporter_id
    OR is_moderator(auth.uid())
  );

-- Add RLS policy for moderators to update reports (change status, add notes, etc.)
CREATE POLICY "moderators_update_reports"
  ON reports FOR UPDATE
  TO authenticated
  USING (is_moderator(auth.uid()))
  WITH CHECK (is_moderator(auth.uid()));

-- Drop the old reports_select_own policy since we have a more comprehensive one
DROP POLICY IF EXISTS "reports_select_own" ON reports;

-- Grant UPDATE permission on reports to authenticated users (moderators will use this)
GRANT UPDATE ON reports TO authenticated;

-- Add moderation_notes column to reports table if it doesn't exist
ALTER TABLE reports ADD COLUMN IF NOT EXISTS moderation_notes TEXT;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS moderator_id UUID REFERENCES auth.users(id);
ALTER TABLE reports ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;

-- Create index for moderator queries
CREATE INDEX IF NOT EXISTS reports_moderator_status_idx ON reports(status, created_at DESC);

-- Verify policies were created
SELECT
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename IN ('reports', 'moderators')
ORDER BY tablename, cmd;
