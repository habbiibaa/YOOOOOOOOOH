// This file contains SQL commands that need to be run on your Supabase project
// You can execute these in the SQL editor in the Supabase dashboard

/*
  Row Level Security (RLS) Policies for Squash Academy
  
  These policies define who can read, create, update, and delete records in each table.
  They are critical for securing your data even if your API keys are exposed.
*/

// Enable RLS on all critical tables
export const enableRLS = `
-- Enable RLS
ALTER TABLE coach_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
`;

// Coach Sessions Policies
export const coachSessionsPolicies = `
-- Coach Sessions Policies

-- Read access for coach sessions
-- Players can see available sessions and their own booked sessions
CREATE POLICY "Players can view available sessions and their own bookings"
ON coach_sessions
FOR SELECT
USING (
  status = 'available' OR 
  player_id = auth.uid()
);

-- Coaches can view their own sessions
CREATE POLICY "Coaches can view their own sessions"
ON coach_sessions
FOR SELECT
USING (
  coach_id = auth.uid()
);

-- Admins can view all sessions
CREATE POLICY "Admins can view all sessions"
ON coach_sessions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
    AND users.approved = true
  )
);

-- Update policies
-- Players can only book available sessions
CREATE POLICY "Players can book available sessions"
ON coach_sessions
FOR UPDATE
USING (
  status = 'available'
)
WITH CHECK (
  (NEW.status = 'booked' OR NEW.status = 'pending') AND
  NEW.player_id = auth.uid()
);

-- Players can cancel their own bookings
CREATE POLICY "Players can cancel their own bookings"
ON coach_sessions
FOR UPDATE
USING (
  status = 'booked' AND
  player_id = auth.uid()
)
WITH CHECK (
  NEW.status = 'available' AND
  NEW.player_id IS NULL
);

-- Coaches can update their own sessions
CREATE POLICY "Coaches can update their own sessions"
ON coach_sessions
FOR UPDATE
USING (
  coach_id = auth.uid()
);

-- Admins can update any session
CREATE POLICY "Admins can update any session"
ON coach_sessions
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
    AND users.approved = true
  )
);

-- Insert policies
-- Only admins and coaches can create sessions
CREATE POLICY "Only admins and coaches can create sessions"
ON coach_sessions
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() 
    AND (users.role = 'admin' OR users.role = 'coach')
    AND users.approved = true
  )
);

-- Delete policies
-- Only admins can delete sessions
CREATE POLICY "Only admins can delete sessions"
ON coach_sessions
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
    AND users.approved = true
  )
);
`;

// Coach Schedules Policies
export const coachSchedulesPolicies = `
-- Coach Schedules Policies

-- Read access for coach schedules
-- Anyone can view coach schedules
CREATE POLICY "Anyone can view coach schedules"
ON coach_schedules
FOR SELECT
USING (true);

-- Insert/Update/Delete policies for coach schedules
-- Only admins and the coach themselves can modify schedules
CREATE POLICY "Coaches can modify their own schedules"
ON coach_schedules
FOR ALL
USING (
  coach_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
    AND users.approved = true
  )
);
`;

// Execute these policies in your Supabase SQL editor
// You can also use these for documentation or as part of your setup scripts

// Export a function that generates a script to run all policies
export const generateFullRLSScript = () => {
  return `
${enableRLS}

${coachSessionsPolicies}

${coachSchedulesPolicies}

-- Add any additional policies below as needed
  `;
};

// To properly protect against CSRF, rate limiting, and support CAPTCHA
// Make sure to enable the following in your Supabase dashboard:
//
// 1. Authentication > Settings > Enable CAPTCHA protection
// 2. Database > Timeouts > Set statement_timeout to a reasonable value (e.g., 10000ms)
// 3. Set connection limits for different user roles
// 4. Set up rate limiting for API endpoints 