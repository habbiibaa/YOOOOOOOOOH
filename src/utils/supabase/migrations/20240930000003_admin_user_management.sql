-- Admin User Management Functions

-- Create a function to update user role data including approval status
-- This allows updating both auth.users metadata and the public.users table in one operation
CREATE OR REPLACE FUNCTION admin_update_user_role(
  user_id UUID,
  update_role TEXT DEFAULT NULL,
  update_approved BOOLEAN DEFAULT NULL
) RETURNS void AS $$
DECLARE
  current_metadata JSONB;
BEGIN
  -- Get current user metadata
  SELECT raw_app_meta_data INTO current_metadata 
  FROM auth.users
  WHERE id = user_id;
  
  -- First update the auth.users table's metadata
  IF update_role IS NOT NULL OR update_approved IS NOT NULL THEN
    UPDATE auth.users
    SET raw_app_meta_data = 
      CASE 
        WHEN update_role IS NOT NULL AND update_approved IS NOT NULL THEN
          jsonb_set(
            jsonb_set(current_metadata, '{role}', to_jsonb(update_role)),
            '{approved}', to_jsonb(update_approved)
          )
        WHEN update_role IS NOT NULL THEN
          jsonb_set(current_metadata, '{role}', to_jsonb(update_role))
        WHEN update_approved IS NOT NULL THEN
          jsonb_set(current_metadata, '{approved}', to_jsonb(update_approved))
        ELSE current_metadata
      END
    WHERE id = user_id;
  END IF;
  
  -- Then update the public.users table to match
  IF update_role IS NOT NULL THEN
    UPDATE public.users
    SET role = update_role
    WHERE id = user_id;
  END IF;
  
  IF update_approved IS NOT NULL THEN
    UPDATE public.users
    SET approved = update_approved
    WHERE id = user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get pending coach approval requests
CREATE OR REPLACE FUNCTION get_pending_coach_approvals() 
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.full_name,
    u.created_at
  FROM 
    public.users u
  WHERE 
    u.role = 'coach' 
    AND (u.approved = false OR u.approved IS NULL)
  ORDER BY 
    u.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 