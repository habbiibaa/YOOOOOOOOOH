-- Create users if they don't exist
INSERT INTO public.users (id, email, full_name, name, role, user_id, token_identifier, created_at)
SELECT 
  auth.users.id,
  auth.users.email,
  auth.users.raw_user_meta_data->>'full_name',
  auth.users.raw_user_meta_data->>'full_name',
  (COALESCE(auth.users.raw_user_meta_data->>'role', 'player'))::public.user_role,
  auth.users.id,
  auth.users.id,
  auth.users.created_at
FROM auth.users
LEFT JOIN public.users ON auth.users.id = public.users.id
WHERE public.users.id IS NULL;
