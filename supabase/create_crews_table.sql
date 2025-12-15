-- Create crews table (mirrors events table structure)
CREATE TABLE IF NOT EXISTS crews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  location TEXT,
  description TEXT,
  start_at TIMESTAMPTZ,
  slots_total INTEGER,
  slots_open INTEGER,
  image_url TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for crews
CREATE INDEX IF NOT EXISTS crews_created_by_idx ON crews(created_by);
CREATE INDEX IF NOT EXISTS crews_created_at_idx ON crews(created_at DESC);
CREATE INDEX IF NOT EXISTS crews_start_at_idx ON crews(start_at DESC NULLS LAST);

-- Enable Row Level Security
ALTER TABLE crews ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can read all crews
CREATE POLICY "Crews are viewable by authenticated users"
  ON crews FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Users can insert crews (must set created_by to their own id)
CREATE POLICY "Users can insert own crews"
  ON crews FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Policy: Users can update crews they created
CREATE POLICY "Users can update own crews"
  ON crews FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Policy: Users can delete crews they created
CREATE POLICY "Users can delete own crews"
  ON crews FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- Add crew_id column to threads table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'threads' AND column_name = 'crew_id'
  ) THEN
    ALTER TABLE threads ADD COLUMN crew_id UUID REFERENCES crews(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS threads_crew_id_idx ON threads(crew_id);
  END IF;
END $$;

-- Update threads type to include 'crew'
-- Note: This assumes threads.type is a TEXT or VARCHAR field
-- If it's an enum, you'll need to alter the enum type instead
DO $$
BEGIN
  -- Check if 'crew' is already a valid type (this is informational, actual constraint may vary)
  -- The application code will handle the 'crew' type
  NULL;
END $$;

-- Add comments for documentation
COMMENT ON TABLE crews IS 'Crew groups created by users for friend groups';
COMMENT ON COLUMN crews.created_by IS 'User who created the crew';
COMMENT ON COLUMN crews.image_url IS 'Cover image URL for the crew';
COMMENT ON COLUMN threads.crew_id IS 'References crews.id for crew-specific threads';

