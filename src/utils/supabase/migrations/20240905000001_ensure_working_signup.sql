-- Ensure users table has the correct structure for sign-up
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY,
  email TEXT,
  name TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'player',
  approved BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Admin users can view all profiles" ON public.users;
DROP POLICY IF EXISTS "Admin users can update all profiles" ON public.users;
DROP POLICY IF EXISTS "Admin users can insert profiles" ON public.users;

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create simplified policies that won't cause recursion
CREATE POLICY "Public insert access"
ON public.users
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Public select access"
ON public.users
FOR SELECT
USING (true);

CREATE POLICY "Auth users can update their own profile"
ON public.users
FOR UPDATE
USING (auth.uid() = id);

-- Ensure the table is part of the realtime publication
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'users'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
    END IF;
END
$$;