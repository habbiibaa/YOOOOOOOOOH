-- Fix infinite recursion in policies
DROP POLICY IF EXISTS "Admin users can view all profiles" ON public.users;
CREATE POLICY "Admin users can view all profiles"
  ON public.users
  FOR SELECT
  USING ((role = 'admin'));

DROP POLICY IF EXISTS "Admin users can update all profiles" ON public.users;
CREATE POLICY "Admin users can update all profiles"
  ON public.users
  FOR UPDATE
  USING ((role = 'admin'));

DROP POLICY IF EXISTS "Admin users can insert profiles" ON public.users;
CREATE POLICY "Admin users can insert profiles"
  ON public.users
  FOR INSERT
  WITH CHECK (true);

-- Add policy for all users to view their own profile
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
CREATE POLICY "Users can view their own profile"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Add policy for all users to update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id);
