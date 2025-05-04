-- Ensure users table has the correct structure and permissions

-- Make sure the users table exists
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  full_name TEXT,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'player',
  approved BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure RLS is enabled but with permissive policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow full access to all users" ON public.users;

-- Create a permissive policy for all operations
CREATE POLICY "Allow full access to all users"
  ON public.users
  USING (true)
  WITH CHECK (true);

-- Grant all privileges to authenticated users
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.users TO service_role;

-- Ensure the table is part of the realtime publication
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime;
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
