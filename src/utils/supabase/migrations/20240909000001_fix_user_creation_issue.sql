-- Fix user creation issues by ensuring proper table structure and permissions

-- First ensure the users table exists with correct structure
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  name TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'player',
  approved BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,
  phone TEXT,
  avatar_url TEXT,
  level_confirmed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure RLS is enabled but with permissive policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public insert access" ON public.users;
DROP POLICY IF EXISTS "Public select access" ON public.users;
DROP POLICY IF EXISTS "Auth users can update their own profile" ON public.users;

-- Create permissive policies for sign-up flow
CREATE POLICY "Public insert access"
ON public.users
FOR INSERT
TO authenticated, anon
WITH CHECK (true);

CREATE POLICY "Public select access"
ON public.users
FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Auth users can update their own profile"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Grant necessary permissions
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.users TO anon;
GRANT ALL ON public.users TO service_role;

-- Ensure the table is part of the realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'users'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
  END IF;
END
$$;