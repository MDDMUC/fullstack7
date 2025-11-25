-- Fix lookingFor column name issue
-- PostgreSQL converts unquoted identifiers to lowercase, so lookingFor becomes lookingfor
-- This script renames the column to use quoted identifier to preserve camelCase

-- Check current column name
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'onboardingprofiles' 
AND column_name LIKE '%looking%';

-- If column exists as 'lookingfor' (lowercase), rename it to 'lookingFor' (camelCase)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'onboardingprofiles' 
    AND column_name = 'lookingfor'
  ) THEN
    ALTER TABLE onboardingprofiles RENAME COLUMN lookingfor TO "lookingFor";
    RAISE NOTICE 'Column renamed from lookingfor to lookingFor';
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'onboardingprofiles' 
    AND column_name = 'lookingFor'
  ) THEN
    RAISE NOTICE 'Column already exists as lookingFor';
  ELSE
    -- Column doesn't exist, create it
    ALTER TABLE onboardingprofiles ADD COLUMN "lookingFor" TEXT;
    RAISE NOTICE 'Column lookingFor created';
  END IF;
END $$;

-- Verify the column exists with correct name
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'onboardingprofiles' 
AND column_name = 'lookingFor';





