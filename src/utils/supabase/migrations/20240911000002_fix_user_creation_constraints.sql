-- Fix users table structure and permissions

-- Ensure users table exists with correct structure
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  full_name TEXT,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'player' CHECK (role IN ('player', 'coach', 'admin')),
  approved BOOLEAN DEFAULT FALSE,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drop existing publication for users table if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'users' AND schemaname = 'public') THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.users;
  END IF;
END $$;

-- Add users table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;

-- Create more permissive policies for development
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
CREATE POLICY "Users can view their own profile"
  ON public.users
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

-- Enable row level security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
