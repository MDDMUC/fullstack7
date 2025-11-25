-- Force PostgREST to refresh its schema cache
-- Run this in Supabase SQL Editor if you're getting "schema cache" errors

-- Method 1: Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';

-- Method 2: If using Supabase Cloud, you can also:
-- 1. Go to Settings → API
-- 2. Click "Reload schema" button (if available)
-- OR
-- 3. Restart your Supabase project (Settings → General → Restart project)

-- Method 3: Verify the table exists and is accessible
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE tablename = 'onboardingprofiles';

-- Method 4: Grant necessary permissions (if needed)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON TABLE public.onboardingprofiles TO anon, authenticated;




