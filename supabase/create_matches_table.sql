-- Create matches table for storing user matches
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_b UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_a, user_b)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS matches_user_a_idx ON matches(user_a);
CREATE INDEX IF NOT EXISTS matches_user_b_idx ON matches(user_b);
CREATE INDEX IF NOT EXISTS matches_created_at_idx ON matches(created_at DESC);

-- Enable Row Level Security
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own matches" ON matches;
DROP POLICY IF EXISTS "Users can create their own matches" ON matches;

-- Policy: Users can view matches they're part of
CREATE POLICY "Users can view their own matches"
  ON matches FOR SELECT
  USING (
    (select auth.uid()) = user_a OR 
    (select auth.uid()) = user_b
  );

-- Policy: Users can create matches (system will create them)
CREATE POLICY "Users can create their own matches"
  ON matches FOR INSERT
  WITH CHECK (
    (select auth.uid()) = user_a OR 
    (select auth.uid()) = user_b
  );

-- Verify the table was created
SELECT 
  table_name, 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'matches'
ORDER BY ordinal_position;





