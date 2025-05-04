-- Fix user registration issues by ensuring proper table structure
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

-- Add foreign key constraint if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'users_id_fkey' AND table_name = 'users'
  ) THEN
    BEGIN
      ALTER TABLE public.users
      ADD CONSTRAINT users_id_fkey
      FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
    EXCEPTION WHEN others THEN
      -- If it fails, continue without the constraint
      RAISE NOTICE 'Could not add foreign key constraint: %', SQLERRM;
    END;
  END IF;
END $$;

-- Realtime is already enabled for users table
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
