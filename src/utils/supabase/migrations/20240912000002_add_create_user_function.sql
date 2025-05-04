-- Create a stored procedure to handle user creation
CREATE OR REPLACE FUNCTION create_user_profile(
  user_id UUID,
  user_name TEXT,
  user_full_name TEXT,
  user_email TEXT,
  user_role TEXT,
  user_approved BOOLEAN
) RETURNS VOID AS $$
BEGIN
  -- Insert directly using SQL to bypass any potential issues
  INSERT INTO public.users (
    id, 
    name, 
    full_name, 
    email, 
    role, 
    approved, 
    email_verified, 
    created_at, 
    updated_at
  ) VALUES (
    user_id,
    user_name,
    user_full_name,
    user_email,
    user_role,
    user_approved,
    FALSE,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    approved = EXCLUDED.approved,
    updated_at = NOW();

EXCEPTION WHEN OTHERS THEN
  -- Log error details
  RAISE NOTICE 'Error creating user profile: %', SQLERRM;
  -- Re-raise the exception
  RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to necessary roles
GRANT EXECUTE ON FUNCTION create_user_profile TO service_role;
GRANT EXECUTE ON FUNCTION create_user_profile TO authenticated;
