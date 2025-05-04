-- Generate available session time slots for all coaches
-- This script generates session slots for the next 4 weeks based on coach schedules

DO $$
DECLARE
  royal_british_id UUID;
  current_date_val DATE := CURRENT_DATE;
  next_month_date DATE := CURRENT_DATE + INTERVAL '28 days';
  coach_record RECORD;
  schedule_record RECORD;
  session_date DATE;
  session_start TIME;
  session_end TIME;
BEGIN
  -- Get the Royal British School branch ID
  SELECT id INTO royal_british_id FROM branches WHERE name LIKE '%Royal British School%';
  
  -- Clear any existing future available sessions for clean generation
  DELETE FROM coach_sessions 
  WHERE status = 'available' 
  AND session_date >= current_date_val;
  
  -- Loop through each coach
  FOR coach_record IN 
    SELECT c.id, u.full_name 
    FROM coaches c
    JOIN users u ON c.id = u.id
    WHERE u.role = 'coach'
  LOOP
    -- For each coach, loop through their schedules
    FOR schedule_record IN
      SELECT 
        day_of_week, 
        start_time, 
        end_time,
        session_duration
      FROM coach_schedules
      WHERE coach_id = coach_record.id
    LOOP
      -- Generate slots for each day the coach is available over the next 4 weeks
      session_date := current_date_val;
      
      WHILE session_date <= next_month_date LOOP
        -- Check if this date matches the day of week in the schedule
        IF TO_CHAR(session_date, 'Day') LIKE schedule_record.day_of_week || '%' THEN
          -- Generate time slots for this date
          session_start := schedule_record.start_time;
          
          WHILE session_start + (schedule_record.session_duration || ' minutes')::interval <= schedule_record.end_time LOOP
            session_end := session_start + (schedule_record.session_duration || ' minutes')::interval;
            
            -- Insert the session
            INSERT INTO coach_sessions (
              id,
              coach_id,
              branch_id,
              session_date,
              start_time,
              end_time,
              status,
              created_at,
              updated_at
            ) VALUES (
              uuid_generate_v4(),
              coach_record.id,
              royal_british_id,
              session_date,
              session_start,
              session_end,
              'available',
              NOW(),
              NOW()
            );
            
            -- Move to the next time slot
            session_start := session_end;
          END LOOP;
        END IF;
        
        -- Move to the next day
        session_date := session_date + INTERVAL '1 day';
      END LOOP;
    END LOOP;
  END LOOP;
  
  RAISE NOTICE 'Generated session slots for all coaches from % to %', current_date_val, next_month_date;
END $$; 