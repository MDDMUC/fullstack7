-- Ensure new onboarding fields exist
ALTER TABLE onboardingprofiles
  ADD COLUMN IF NOT EXISTS searchradius INTEGER,
  ADD COLUMN IF NOT EXISTS interest TEXT,
  ADD COLUMN IF NOT EXISTS photo TEXT,
  ADD COLUMN IF NOT EXISTS photos TEXT[];

-- Optional: keep updated_at trigger intact (no-op if already present)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_onboardingprofiles_updated_at ON onboardingprofiles;
CREATE TRIGGER update_onboardingprofiles_updated_at
  BEFORE UPDATE ON onboardingprofiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
