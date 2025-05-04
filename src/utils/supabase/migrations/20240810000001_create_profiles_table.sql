-- Create profiles table for multi-profile functionality
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('primary', 'child', 'parent')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT max_profiles_per_user CHECK (
    (SELECT COUNT(*) FROM profiles WHERE profiles.user_id = user_id) <= 5
  )
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Users can view their own profiles" ON profiles;
CREATE POLICY "Users can view their own profiles"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own profiles" ON profiles;
CREATE POLICY "Users can insert their own profiles"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own profiles" ON profiles;
CREATE POLICY "Users can update their own profiles"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own profiles" ON profiles;
CREATE POLICY "Users can delete their own profiles"
  ON profiles FOR DELETE
  USING (auth.uid() = user_id);

-- Add to realtime publication
alter publication supabase_realtime add table profiles;
