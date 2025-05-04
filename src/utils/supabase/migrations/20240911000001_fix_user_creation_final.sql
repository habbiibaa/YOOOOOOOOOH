-- Ensure users table exists with correct structure
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

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public access" ON public.users;
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;

-- Create more permissive policies for development
CREATE POLICY "Public access"
ON public.users FOR SELECT
USING (true);

CREATE POLICY "Users can update their own data"
ON public.users FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Service role can insert"
ON public.users FOR INSERT
WITH CHECK (true);

-- Ensure realtime is enabled
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.users;
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;

-- Grant necessary permissions
GRANT ALL ON public.users TO postgres;
GRANT ALL ON public.users TO service_role;
GRANT SELECT, UPDATE ON public.users TO authenticated;
GRANT SELECT ON public.users TO anon;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS users_email_idx ON public.users (email);
CREATE INDEX IF NOT EXISTS users_role_idx ON public.users (role);
