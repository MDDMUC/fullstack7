-- Add missing columns to onboardingprofiles table
ALTER TABLE onboardingprofiles
  ADD COLUMN IF NOT EXISTS homebase TEXT,
  ADD COLUMN IF NOT EXISTS gender TEXT,
  ADD COLUMN IF NOT EXISTS gym TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS styles TEXT[] DEFAULT '{}';

-- Update photos to be TEXT[] if it's currently TEXT
-- Note: If photos is already TEXT[], this will be a no-op
DO $$
BEGIN
  -- Check if photos column exists and is TEXT (not TEXT[])
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'onboardingprofiles' 
    AND column_name = 'photos' 
    AND data_type = 'text'
    AND udt_name = 'text'
  ) THEN
    -- Convert TEXT to TEXT[] by first setting to null, then altering type
    ALTER TABLE onboardingprofiles ALTER COLUMN photos TYPE TEXT[] USING ARRAY[photos];
  END IF;
END $$;

-- Add index for homebase queries
CREATE INDEX IF NOT EXISTS onboardingprofiles_homebase_idx ON onboardingprofiles(homebase);

-- Add index for gym array queries (using GIN for array searches)
-- Use gin__array_ops operator class for TEXT[] arrays
CREATE INDEX IF NOT EXISTS onboardingprofiles_gym_idx ON onboardingprofiles USING GIN(gym gin__array_ops);

