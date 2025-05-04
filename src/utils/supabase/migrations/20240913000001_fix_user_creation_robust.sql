-- Ensure the users table has the correct structure and constraints
ALTER TABLE IF EXISTS public.users
  ALTER COLUMN token_identifier DROP NOT NULL;

-- Drop the create_user_profile function if it exists to recreate it
DROP FUNCTION IF EXISTS public.create_user_profile;

-- Create an improved version of the function
CREATE OR REPLACE FUNCTION public.create_user_profile(
  user_id UUID,
  user_name TEXT,
  user_full_name TEXT,
  user_email TEXT,
  user_role TEXT,
  user_approved BOOLEAN
) RETURNS VOID AS $$
BEGIN
  -- First check if the user already exists to avoid duplicate key violations
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = user_id) THEN
    -- Insert the user with all required fields
    INSERT INTO public.users (
      id,
      name,
      full_name,
      email,
      role,
      approved,
      email_verified,
      created_at,
      token_identifier
    ) VALUES (
      user_id,
      user_name,
      user_full_name,
      user_email,
      user_role::public.user_role,
      user_approved,
      FALSE,
      NOW(),
      uuid_generate_v4()::text
    );
  END IF;
END;
$$ LANGUAGE plpgsql;
