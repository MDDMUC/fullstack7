-- Create reports table for user/message reporting
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reported_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reported_message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (
    (reported_user_id IS NOT NULL AND reported_message_id IS NULL) OR
    (reported_user_id IS NULL AND reported_message_id IS NOT NULL)
  )
);

-- Enable RLS
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own reports
CREATE POLICY "reports_select_own"
  ON reports FOR SELECT
  USING (auth.uid() = reporter_id);

-- RLS Policy: Users can insert reports (cannot report self)
CREATE POLICY "reports_insert_own"
  ON reports FOR INSERT
  WITH CHECK (
    auth.uid() = reporter_id
    AND (reported_user_id IS NULL OR reporter_id != reported_user_id)
  );

-- Indexes
CREATE INDEX IF NOT EXISTS reports_status_idx ON reports(status);
CREATE INDEX IF NOT EXISTS reports_reported_user_id_idx ON reports(reported_user_id);
CREATE INDEX IF NOT EXISTS reports_created_at_idx ON reports(created_at DESC);

-- Grant access to authenticated users
GRANT SELECT, INSERT ON reports TO authenticated;
