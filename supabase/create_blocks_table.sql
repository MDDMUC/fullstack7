-- Create blocks table for user-to-user blocking
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  blocked_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reason TEXT,
  UNIQUE(blocker_id, blocked_id),
  CHECK (blocker_id != blocked_id)
);

-- Enable RLS
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own blocks
CREATE POLICY "blocks_select_own"
  ON blocks FOR SELECT
  USING (auth.uid() = blocker_id);

-- RLS Policy: Users can insert their own blocks
CREATE POLICY "blocks_insert_own"
  ON blocks FOR INSERT
  WITH CHECK (auth.uid() = blocker_id);

-- RLS Policy: Users can delete their own blocks (unblock)
CREATE POLICY "blocks_delete_own"
  ON blocks FOR DELETE
  USING (auth.uid() = blocker_id);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS blocks_blocker_id_idx ON blocks(blocker_id);
CREATE INDEX IF NOT EXISTS blocks_blocked_id_idx ON blocks(blocked_id);

-- Grant access to authenticated users
GRANT SELECT, INSERT, DELETE ON blocks TO authenticated;
