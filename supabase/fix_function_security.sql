-- Fix security issue with update_updated_at_column function
-- Run this in Supabase SQL Editor to fix the "role mutable search_path" warning

-- Drop and recreate the function with a fixed search_path
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Recreate the function with SET search_path for security
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

-- Recreate the trigger
CREATE TRIGGER update_onboardingprofiles_updated_at
  BEFORE UPDATE ON onboardingprofiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

