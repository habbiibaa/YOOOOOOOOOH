-- Add coaches and their schedules
-- First, add the coaches to the users table
INSERT INTO users (id, email, full_name, role, created_at)
VALUES 
  (uuid_generate_v4(), 'ahmed.fakhry@rasa.com', 'Ahmed Fakhry', 'coach', NOW()),
  (uuid_generate_v4(), 'ahmed.mahrous@rasa.com', 'Ahmed Mahrous', 'coach', NOW()),
  (uuid_generate_v4(), 'ahmed.magdy@rasa.com', 'Ahmed Magdy', 'coach', NOW()),
  (uuid_generate_v4(), 'alaa.taha@rasa.com', 'Alaa Taha', 'coach', NOW()),
  (uuid_generate_v4(), 'ahmed.maher@rasa.com', 'Ahmed Maher', 'coach', NOW()),
  (uuid_generate_v4(), 'omar.zaki@rasa.com', 'Omar Zaki', 'coach', NOW()),
  (uuid_generate_v4(), 'abdelrahman.dahy@rasa.com', 'Abdelrahman Dahy', 'coach', NOW());

-- Get the Royal British School branch ID (all coaches are at this branch)
DO $$
DECLARE
  royal_british_id UUID;
BEGIN
  SELECT id INTO royal_british_id FROM branches WHERE name LIKE '%Royal British School%';

  -- Add to coaches table referencing users
  INSERT INTO coaches (id, name, specialties, available_levels, rating)
  SELECT id, full_name, ARRAY['Squash'], ARRAY['Beginner', 'Intermediate', 'Advanced'], 5.0
  FROM users
  WHERE role = 'coach' AND 
        (full_name = 'Ahmed Fakhry' OR 
         full_name = 'Ahmed Mahrous' OR 
         full_name = 'Ahmed Magdy' OR 
         full_name = 'Alaa Taha' OR 
         full_name = 'Ahmed Maher' OR 
         full_name = 'Omar Zaki' OR 
         full_name = 'Abdelrahman Dahy');

  -- Add schedules for each coach
  -- Ahmed Fakhry: Sunday and Tuesday, 4:30-9:45, 45 min sessions
  INSERT INTO coach_schedules (coach_id, branch_id, day_of_week, start_time, end_time, session_duration)
  SELECT id, royal_british_id, 'Sunday', '16:30', '21:45', 45
  FROM users WHERE full_name = 'Ahmed Fakhry';
  
  INSERT INTO coach_schedules (coach_id, branch_id, day_of_week, start_time, end_time, session_duration)
  SELECT id, royal_british_id, 'Tuesday', '16:30', '21:45', 45
  FROM users WHERE full_name = 'Ahmed Fakhry';
  
  -- Ahmed Mahrous: Saturday 10:00-21:30 and Tuesday 4:30-9:45, 45 min sessions
  INSERT INTO coach_schedules (coach_id, branch_id, day_of_week, start_time, end_time, session_duration)
  SELECT id, royal_british_id, 'Saturday', '10:00', '21:30', 45
  FROM users WHERE full_name = 'Ahmed Mahrous';
  
  INSERT INTO coach_schedules (coach_id, branch_id, day_of_week, start_time, end_time, session_duration)
  SELECT id, royal_british_id, 'Tuesday', '16:30', '21:45', 45
  FROM users WHERE full_name = 'Ahmed Mahrous';
  
  -- Ahmed Magdy: Monday 4:30-9:45, 45 min sessions
  INSERT INTO coach_schedules (coach_id, branch_id, day_of_week, start_time, end_time, session_duration)
  SELECT id, royal_british_id, 'Monday', '16:30', '21:45', 45
  FROM users WHERE full_name = 'Ahmed Magdy';
  
  -- Alaa Taha: Monday 4:30-9:45, 45 min sessions
  INSERT INTO coach_schedules (coach_id, branch_id, day_of_week, start_time, end_time, session_duration)
  SELECT id, royal_british_id, 'Monday', '16:30', '21:45', 45
  FROM users WHERE full_name = 'Alaa Taha';
  
  -- Ahmed Maher: Sunday 4:30-9:45 and Wednesday 3:30-9:30, 45 min sessions
  INSERT INTO coach_schedules (coach_id, branch_id, day_of_week, start_time, end_time, session_duration)
  SELECT id, royal_british_id, 'Sunday', '16:30', '21:45', 45
  FROM users WHERE full_name = 'Ahmed Maher';
  
  INSERT INTO coach_schedules (coach_id, branch_id, day_of_week, start_time, end_time, session_duration)
  SELECT id, royal_british_id, 'Wednesday', '15:30', '21:30', 45
  FROM users WHERE full_name = 'Ahmed Maher';
  
  -- Omar Zaki: Thursday 3:30-9:30, Friday 1:30-4:30, Saturday 10:00-21:30, 45 min sessions
  INSERT INTO coach_schedules (coach_id, branch_id, day_of_week, start_time, end_time, session_duration)
  SELECT id, royal_british_id, 'Thursday', '15:30', '21:30', 45
  FROM users WHERE full_name = 'Omar Zaki';
  
  INSERT INTO coach_schedules (coach_id, branch_id, day_of_week, start_time, end_time, session_duration)
  SELECT id, royal_british_id, 'Friday', '13:30', '16:30', 45
  FROM users WHERE full_name = 'Omar Zaki';
  
  INSERT INTO coach_schedules (coach_id, branch_id, day_of_week, start_time, end_time, session_duration)
  SELECT id, royal_british_id, 'Saturday', '10:00', '21:30', 45
  FROM users WHERE full_name = 'Omar Zaki';
  
  -- Abdelrahman Dahy: Wednesday 3:30-9:30, 45 min sessions
  INSERT INTO coach_schedules (coach_id, branch_id, day_of_week, start_time, end_time, session_duration)
  SELECT id, royal_british_id, 'Wednesday', '15:30', '21:30', 45
  FROM users WHERE full_name = 'Abdelrahman Dahy';
  
  -- Now create available session slots for each coach based on their schedules
  -- We'll generate sessions for the next 4 weeks
  INSERT INTO coach_sessions (coach_id, branch_id, session_date, start_time, end_time, status)
  SELECT 
    cs.coach_id, 
    cs.branch_id,
    (current_date + (n * 7 + (CASE 
      WHEN cs.day_of_week = 'Sunday' THEN 0
      WHEN cs.day_of_week = 'Monday' THEN 1
      WHEN cs.day_of_week = 'Tuesday' THEN 2
      WHEN cs.day_of_week = 'Wednesday' THEN 3
      WHEN cs.day_of_week = 'Thursday' THEN 4
      WHEN cs.day_of_week = 'Friday' THEN 5
      WHEN cs.day_of_week = 'Saturday' THEN 6
    END - extract(dow from current_date)) + 7) % 7)::date as session_date,
    session_start,
    (session_start + interval '45 minutes')::time as session_end,
    'available'
  FROM coach_schedules cs
  CROSS JOIN generate_series(0, 3) AS n -- Create for 4 weeks
  CROSS JOIN (
    SELECT (cs.start_time + (interval '45 minutes' * m))::time as session_start
    FROM coach_schedules cs
    CROSS JOIN generate_series(0, (EXTRACT(EPOCH FROM (cs.end_time - cs.start_time))/60/45)::integer - 1) as m
    GROUP BY cs.start_time, m
  ) as session_times
  WHERE session_start + interval '45 minutes' <= cs.end_time;

END $$; 