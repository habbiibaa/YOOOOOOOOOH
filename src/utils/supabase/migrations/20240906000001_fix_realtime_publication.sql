-- Check if the users table is already a member of the supabase_realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'users'
  ) THEN
    -- Only add if it's not already a member
    ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
  END IF;
END
$$;