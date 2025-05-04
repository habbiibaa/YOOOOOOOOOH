-- Update coach management structures

-- Ensure coach profiles have needed columns
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT FALSE;

-- Create function to handle coach approval
CREATE OR REPLACE FUNCTION approve_coach(coach_uuid UUID) RETURNS VOID AS $$
BEGIN
  UPDATE auth.users
  SET approved = TRUE
  WHERE id = coach_uuid AND role = 'coach';
END;
$$ LANGUAGE plpgsql;

-- Create function to reject coach
CREATE OR REPLACE FUNCTION reject_coach(coach_uuid UUID) RETURNS VOID AS $$
BEGIN
  UPDATE auth.users
  SET approved = FALSE
  WHERE id = coach_uuid AND role = 'coach';
END;
$$ LANGUAGE plpgsql;

-- Ensure coach_schedules table has all required fields for editing
ALTER TABLE coach_schedules ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE coach_schedules ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

-- Create policies for coach_schedules
ALTER TABLE coach_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coaches can view their own schedules"
ON coach_schedules FOR SELECT
TO authenticated
USING (auth.uid() = coach_id);

CREATE POLICY "Coaches can update their own schedules"
ON coach_schedules FOR UPDATE
TO authenticated
USING (auth.uid() = coach_id);

CREATE POLICY "Admin can view all coach schedules"
ON coach_schedules FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.role = 'admin'
  )
);

CREATE POLICY "Admin can update all coach schedules"
ON coach_schedules FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.role = 'admin'
  )
);

-- Create function to regenerate coach sessions when schedule is updated
CREATE OR REPLACE FUNCTION regenerate_coach_sessions() RETURNS TRIGGER AS $$
BEGIN
  -- Delete future sessions for this coach schedule that aren't booked
  DELETE FROM coach_sessions
  WHERE coach_schedule_id = NEW.id
    AND start_time > NOW()
    AND status IN ('available', 'reserved');
    
  -- Here would be logic to generate new sessions based on the updated schedule
  -- This would require a more complex implementation based on the application's logic
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for regenerating sessions when schedule is updated
DROP TRIGGER IF EXISTS regenerate_sessions_on_schedule_update ON coach_schedules;
CREATE TRIGGER regenerate_sessions_on_schedule_update
AFTER UPDATE ON coach_schedules
FOR EACH ROW
WHEN (NEW.day_of_week IS DISTINCT FROM OLD.day_of_week OR 
      NEW.start_time IS DISTINCT FROM OLD.start_time OR 
      NEW.end_time IS DISTINCT FROM OLD.end_time OR
      NEW.is_available IS DISTINCT FROM OLD.is_available)
EXECUTE FUNCTION regenerate_coach_sessions(); 