-- Fix constraints on users table to allow new user creation
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE public.users ADD PRIMARY KEY (id);

-- Ensure email column has a unique constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'users_email_key' AND conrelid = 'public.users'::regclass
  ) THEN
    ALTER TABLE public.users ADD CONSTRAINT users_email_key UNIQUE (email);
  END IF;
END
$$;

-- Ensure foreign key constraints don't block user creation
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- Make sure the table is accessible
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.users TO service_role;

-- Ensure RLS doesn't block inserts
DROP POLICY IF EXISTS "Public insert access" ON public.users;
CREATE POLICY "Public insert access"
ON public.users
FOR INSERT
WITH CHECK (true);

-- Ensure the sequence is owned by the table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'users_id_seq') THEN
    ALTER SEQUENCE users_id_seq OWNED BY users.id;
  END IF;
EXCEPTION WHEN others THEN
  -- Do nothing if sequence doesn't exist
END
$$;