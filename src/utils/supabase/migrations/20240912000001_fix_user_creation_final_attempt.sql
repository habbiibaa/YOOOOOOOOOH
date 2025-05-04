-- Fix user creation issues with a more permissive approach

-- Ensure users table exists with correct structure
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY,
  name TEXT,
  full_name TEXT,
  email TEXT,
  role TEXT DEFAULT 'player',
  approved BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS temporarily for development
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON public.users TO postgres;
GRANT ALL ON public.users TO service_role;
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.users TO anon;

-- Ensure the table is part of realtime
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
END $$;
