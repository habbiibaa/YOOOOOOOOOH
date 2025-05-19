-- Admin Impersonation and Coach Management

-- Function for admins to get coach credentials for management
CREATE OR REPLACE FUNCTION admin_get_coach_auth_details(coach_id UUID) 
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  access_token TEXT
) AS $$
DECLARE
  is_admin BOOLEAN;
  admin_role TEXT;
BEGIN
  -- Check if the current user is an admin
  SELECT role INTO admin_role FROM public.users WHERE id = auth.uid();
  
  IF admin_role != 'admin' THEN
    RAISE EXCEPTION 'Only administrators can access coach credentials';
  END IF;
  
  -- Generate a special temporary token for the coach
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.full_name,
    encode(gen_random_bytes(32), 'hex') as access_token
  FROM 
    public.users u
  WHERE 
    u.id = coach_id AND u.role = 'coach';
  
  -- Log this access for audit purposes
  INSERT INTO admin_access_logs (
    admin_id,
    accessed_user_id,
    action,
    created_at
  ) VALUES (
    auth.uid(),
    coach_id,
    'get_coach_auth_details',
    now()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit log table for admin actions
CREATE TABLE IF NOT EXISTS admin_access_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES auth.users(id),
  accessed_user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  details JSONB
);

-- Add RLS policy for admin logs
ALTER TABLE admin_access_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can read all logs" ON admin_access_logs FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Add admin impersonation function to assume coach roles temporarily
CREATE OR REPLACE FUNCTION admin_impersonate_coach(coach_id UUID, purpose TEXT DEFAULT 'schedule management')
RETURNS JSONB AS $$
DECLARE
  coach_data JSONB;
  is_admin BOOLEAN;
  session_duration INTERVAL := '30 minutes'::INTERVAL;
BEGIN
  -- Check if the current user is an admin
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  ) INTO is_admin;
  
  IF NOT is_admin THEN
    RAISE EXCEPTION 'Only administrators can impersonate coaches';
  END IF;
  
  -- Get coach data
  SELECT jsonb_build_object(
    'id', u.id,
    'email', u.email,
    'full_name', u.full_name,
    'impersonation_started', now(),
    'impersonation_expires', now() + session_duration
  ) INTO coach_data
  FROM public.users u
  WHERE u.id = coach_id AND u.role = 'coach';
  
  IF coach_data IS NULL THEN
    RAISE EXCEPTION 'Coach not found or invalid ID';
  END IF;
  
  -- Log this access for audit purposes
  INSERT INTO admin_access_logs (
    admin_id,
    accessed_user_id,
    action,
    created_at,
    details
  ) VALUES (
    auth.uid(),
    coach_id,
    'impersonate',
    now(),
    jsonb_build_object('purpose', purpose, 'duration', session_duration)
  );
  
  RETURN coach_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 