-- Add is_demo column to onboardingprofiles table to distinguish demo users from real users
-- Run this BEFORE running the migrateDemoUsers script

-- Add the column (defaults to false for existing users)
ALTER TABLE onboardingprofiles
ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT false;

-- Add an index for efficient querying of demo users
CREATE INDEX IF NOT EXISTS idx_onboardingprofiles_is_demo
ON onboardingprofiles(is_demo);

-- Add a comment to document the column
COMMENT ON COLUMN onboardingprofiles.is_demo IS 'Flag to identify demo/seed users for testing and development';
