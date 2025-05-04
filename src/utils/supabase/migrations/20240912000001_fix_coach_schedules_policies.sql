-- Add RLS policies to coach_schedules table

-- Enable row level security
ALTER TABLE coach_schedules ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Admins have full access to coach schedules" ON coach_schedules;
DROP POLICY IF EXISTS "Coaches can manage their own schedules" ON coach_schedules;
DROP POLICY IF EXISTS "Public read access to coach schedules" ON coach_schedules;

-- Create permissive policies
-- Admins have full access
CREATE POLICY "Admins have full access to coach schedules"
  ON coach_schedules
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Coaches can manage their own schedules
CREATE POLICY "Coaches can manage their own schedules"
  ON coach_schedules
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.id = coach_id AND users.role = 'coach'
    )
  );

-- Everyone can read coach schedules
CREATE POLICY "Public read access to coach schedules"
  ON coach_schedules
  FOR SELECT
  USING (true);

-- Grant appropriate permissions
GRANT ALL ON coach_schedules TO authenticated;
GRANT SELECT ON coach_schedules TO anon;

-- Make sure table is in realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE coach_schedules; 