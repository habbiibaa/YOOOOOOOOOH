-- Fix the foreign key constraint issue by ensuring users exist in auth.users before referencing them

-- Create missing users in the public.users table that exist in auth.users but not in public.users
INSERT INTO public.users (id, email, full_name, role)
SELECT 
  au.id, 
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name', au.email) as full_name,
  COALESCE(au.raw_user_meta_data->>'role', 'player') as role
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;

-- Enable realtime for users table
alter publication supabase_realtime add table users;