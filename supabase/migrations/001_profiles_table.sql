-- Create profiles table with all onboarding fields
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  age INTEGER,
  bio TEXT,
  pronouns TEXT,
  city TEXT,
  original_from TEXT,
  distance TEXT,
  style TEXT,
  grade TEXT,
  availability TEXT,
  tags TEXT[] DEFAULT '{}',
  goals TEXT,
  lookingFor TEXT,
  phone_number TEXT,
  avatar_url TEXT,
  photos TEXT, -- JSON array of all photo URLs
  status TEXT DEFAULT 'New member',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS profiles_city_idx ON profiles(city);
CREATE INDEX IF NOT EXISTS profiles_created_at_idx ON profiles(created_at DESC);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read all profiles (for matching/browsing)
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update updated_at on profile updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE profiles IS 'User profiles created during onboarding';
COMMENT ON COLUMN profiles.id IS 'References auth.users.id';
COMMENT ON COLUMN profiles.tags IS 'Array of interests/tags selected during onboarding';
COMMENT ON COLUMN profiles.lookingFor IS 'What user is looking for (Partnership, Friendship, etc.)';
COMMENT ON COLUMN profiles.distance IS 'Search radius in km (e.g., "100 km")';

