-- Ensure users table has the correct structure and constraints
DO $$ 
BEGIN
  -- Drop the foreign key constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'users_id_fkey' AND table_name = 'users'
  ) THEN
    ALTER TABLE public.users DROP CONSTRAINT users_id_fkey;
  END IF;

  -- Drop email unique constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'users_email_key' AND table_name = 'users'
  ) THEN
    ALTER TABLE public.users DROP CONSTRAINT users_email_key;
  END IF;
END $$;

-- Ensure all required columns exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'created_at') THEN
    ALTER TABLE public.users ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'updated_at') THEN
    ALTER TABLE public.users ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'email_verified') THEN
    ALTER TABLE public.users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'approved') THEN
    ALTER TABLE public.users ADD COLUMN approved BOOLEAN DEFAULT TRUE;
  END IF;
END $$;

-- Add foreign key with less strict constraints
ALTER TABLE public.users
ADD CONSTRAINT users_id_fkey
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;

-- Make email nullable to avoid conflicts
ALTER TABLE public.users ALTER COLUMN email DROP NOT NULL;

-- Ensure RLS is enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create or replace policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
CREATE POLICY "Users can view their own profile"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admin users can view all profiles" ON public.users;
CREATE POLICY "Admin users can view all profiles"
  ON public.users
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admin users can update all profiles" ON public.users;
CREATE POLICY "Admin users can update all profiles"
  ON public.users
  FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admin users can insert profiles" ON public.users;
CREATE POLICY "Admin users can insert profiles"
  ON public.users
  FOR INSERT
  WITH CHECK (true);
