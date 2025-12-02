-- SQL to add 'outside' to Yara's gym array in onboardingprofiles table
-- Run this in Supabase SQL Editor

-- Option 1: Update by username and location (if you know the exact username)
UPDATE onboardingprofiles
SET gym = CASE 
  WHEN gym IS NULL OR array_length(gym, 1) IS NULL THEN ARRAY['outside']
  WHEN 'outside' = ANY(gym) THEN gym  -- Already has 'outside', no change
  ELSE array_append(gym, 'outside')   -- Add 'outside' to existing array
END,
updated_at = NOW()
WHERE username ILIKE '%Yara%'
  AND (homebase ILIKE '%Hamburg%' OR city ILIKE '%Hamburg%')
RETURNING id, username, homebase, gym;

-- Option 2: Update by known user ID (from demo data: 1a518ec3-83f4-4c0b-a279-9195a983f4c1)
UPDATE onboardingprofiles
SET gym = CASE 
  WHEN gym IS NULL OR array_length(gym, 1) IS NULL THEN ARRAY['outside']
  WHEN 'outside' = ANY(gym) THEN gym  -- Already has 'outside', no change
  ELSE array_append(gym, 'outside')   -- Add 'outside' to existing array
END,
updated_at = NOW()
WHERE id = '1a518ec3-83f4-4c0b-a279-9195a983f4c1'
RETURNING id, username, homebase, gym;

-- Option 3: If you want to see what will be updated first (preview query)
SELECT 
  id,
  username,
  homebase,
  city,
  gym AS current_gym,
  CASE 
    WHEN gym IS NULL OR array_length(gym, 1) IS NULL THEN ARRAY['outside']
    WHEN 'outside' = ANY(gym) THEN gym
    ELSE array_append(gym, 'outside')
  END AS updated_gym
FROM onboardingprofiles
WHERE username ILIKE '%Yara%'
  AND (homebase ILIKE '%Hamburg%' OR city ILIKE '%Hamburg%');

-- Option 4: Simple version - just append 'outside' (will create duplicates if run multiple times)
-- UPDATE onboardingprofiles
-- SET gym = COALESCE(gym, ARRAY[]::TEXT[]) || ARRAY['outside'],
--     updated_at = NOW()
-- WHERE username ILIKE '%Yara%'
--   AND (homebase ILIKE '%Hamburg%' OR city ILIKE '%Hamburg%')
--   AND ('outside' = ANY(gym) IS FALSE OR gym IS NULL);

