-- Add recommended_level column to coaches table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'coaches' AND column_name = 'recommended_level') THEN
    ALTER TABLE coaches ADD COLUMN recommended_level INTEGER;
  END IF;
END $$;

-- Add recommended_level column to player_videos table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'player_videos' AND column_name = 'recommended_level') THEN
    ALTER TABLE player_videos ADD COLUMN recommended_level INTEGER;
  END IF;
END $$;

-- Add recommended_level and preferred_branch_id columns to players table if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'players' AND column_name = 'recommended_level') THEN
    ALTER TABLE players ADD COLUMN recommended_level INTEGER;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'players' AND column_name = 'preferred_branch_id') THEN
    ALTER TABLE players ADD COLUMN preferred_branch_id UUID REFERENCES branches(id);
  END IF;
END $$;

-- Insert coach data for the specified coaches
DO $$ 
DECLARE
  new_cairo_rbs_id UUID;
  new_cairo_sodic_id UUID;
  obour_golf_id UUID;
  maadi_club_one_id UUID;
  
  ahmed_fakhry_id UUID;
  ahmed_mahrous_id UUID;
  ahmed_magdy_id UUID;
  alaa_taha_id UUID;
  ahmed_maher_id UUID;
  omar_zaki_id UUID;
  hussien_amr_id UUID;
BEGIN
  -- Get branch IDs
  SELECT id INTO new_cairo_rbs_id FROM branches WHERE name = 'New Cairo - Royal British School';
  SELECT id INTO new_cairo_sodic_id FROM branches WHERE name = 'New Cairo - Sodic East Town';
  SELECT id INTO obour_golf_id FROM branches WHERE name = 'El Obour - Golf City Club';
  SELECT id INTO maadi_club_one_id FROM branches WHERE name = 'El Maadi - Club One';
  
  -- Create coach users if they don't exist
  -- Ahmed Fakhry
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'ahmed.fakhry@ramyashour.com') THEN
    INSERT INTO users (id, email, full_name, name, role, token_identifier, created_at)
    VALUES (uuid_generate_v4(), 'ahmed.fakhry@ramyashour.com', 'Ahmed Fakhry', 'Ahmed Fakhry', 'coach', uuid_generate_v4(), NOW())
    RETURNING id INTO ahmed_fakhry_id;
    
    INSERT INTO coaches (id, bio, specialization, years_experience, recommended_level)
    VALUES (ahmed_fakhry_id, 'Professional squash coach with expertise in technical training', 'Technical Training', 8, 3);
    
    -- Ahmed Fakhry schedule - Sunday and Tuesday
    INSERT INTO coach_schedules (coach_id, branch_id, day_of_week, start_time, end_time, session_duration)
    VALUES (ahmed_fakhry_id, new_cairo_rbs_id, 'Sunday', '16:30', '21:45', 45);
    
    INSERT INTO coach_schedules (coach_id, branch_id, day_of_week, start_time, end_time, session_duration)
    VALUES (ahmed_fakhry_id, new_cairo_rbs_id, 'Tuesday', '16:30', '21:45', 45);
  END IF;
  
  -- Ahmed Mahrous
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'ahmed.mahrous@ramyashour.com') THEN
    INSERT INTO users (id, email, full_name, name, role, token_identifier, created_at)
    VALUES (uuid_generate_v4(), 'ahmed.mahrous@ramyashour.com', 'Ahmed Mahrous', 'Ahmed Mahrous', 'coach', uuid_generate_v4(), NOW())
    RETURNING id INTO ahmed_mahrous_id;
    
    INSERT INTO coaches (id, bio, specialization, years_experience, recommended_level)
    VALUES (ahmed_mahrous_id, 'Experienced coach specializing in match strategy', 'Match Strategy', 7, 4);
    
    -- Ahmed Mahrous schedule - Saturday and Tuesday
    INSERT INTO coach_schedules (coach_id, branch_id, day_of_week, start_time, end_time, session_duration)
    VALUES (ahmed_mahrous_id, new_cairo_sodic_id, 'Saturday', '10:00', '21:30', 45);
    
    INSERT INTO coach_schedules (coach_id, branch_id, day_of_week, start_time, end_time, session_duration)
    VALUES (ahmed_mahrous_id, new_cairo_sodic_id, 'Tuesday', '16:30', '21:45', 45);
  END IF;
  
  -- Ahmed Magdy
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'ahmed.magdy@ramyashour.com') THEN
    INSERT INTO users (id, email, full_name, name, role, token_identifier, created_at)
    VALUES (uuid_generate_v4(), 'ahmed.magdy@ramyashour.com', 'Ahmed Magdy', 'Ahmed Magdy', 'coach', uuid_generate_v4(), NOW())
    RETURNING id INTO ahmed_magdy_id;
    
    INSERT INTO coaches (id, bio, specialization, years_experience, recommended_level)
    VALUES (ahmed_magdy_id, 'Fitness and conditioning specialist', 'Fitness Training', 6, 2);
    
    -- Ahmed Magdy schedule - Monday
    INSERT INTO coach_schedules (coach_id, branch_id, day_of_week, start_time, end_time, session_duration)
    VALUES (ahmed_magdy_id, obour_golf_id, 'Monday', '16:30', '21:45', 45);
  END IF;
  
  -- Alaa Taha
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'alaa.taha@ramyashour.com') THEN
    INSERT INTO users (id, email, full_name, name, role, token_identifier, created_at)
    VALUES (uuid_generate_v4(), 'alaa.taha@ramyashour.com', 'Alaa Taha', 'Alaa Taha', 'coach', uuid_generate_v4(), NOW())
    RETURNING id INTO alaa_taha_id;
    
    INSERT INTO coaches (id, bio, specialization, years_experience, recommended_level)
    VALUES (alaa_taha_id, 'Junior development coach with focus on fundamentals', 'Junior Development', 5, 1);
    
    -- Alaa Taha schedule - Monday
    INSERT INTO coach_schedules (coach_id, branch_id, day_of_week, start_time, end_time, session_duration)
    VALUES (alaa_taha_id, maadi_club_one_id, 'Monday', '16:30', '21:45', 45);
  END IF;
  
  -- Ahmed Maher
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'ahmed.maher@ramyashour.com') THEN
    INSERT INTO users (id, email, full_name, name, role, token_identifier, created_at)
    VALUES (uuid_generate_v4(), 'ahmed.maher@ramyashour.com', 'Ahmed Maher', 'Ahmed Maher', 'coach', uuid_generate_v4(), NOW())
    RETURNING id INTO ahmed_maher_id;
    
    INSERT INTO coaches (id, bio, specialization, years_experience, recommended_level)
    VALUES (ahmed_maher_id, 'Advanced technique and strategy coach', 'Advanced Technique', 9, 5);
    
    -- Ahmed Maher schedule - Sunday and Wednesday
    INSERT INTO coach_schedules (coach_id, branch_id, day_of_week, start_time, end_time, session_duration)
    VALUES (ahmed_maher_id, new_cairo_rbs_id, 'Sunday', '16:30', '21:45', 45);
    
    INSERT INTO coach_schedules (coach_id, branch_id, day_of_week, start_time, end_time, session_duration)
    VALUES (ahmed_maher_id, new_cairo_rbs_id, 'Wednesday', '15:30', '21:30', 45);
  END IF;
  
  -- Omar Zaki
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'omar.zaki@ramyashour.com') THEN
    INSERT INTO users (id, email, full_name, name, role, token_identifier, created_at)
    VALUES (uuid_generate_v4(), 'omar.zaki@ramyashour.com', 'Omar Zaki', 'Omar Zaki', 'coach', uuid_generate_v4(), NOW())
    RETURNING id INTO omar_zaki_id;
    
    INSERT INTO coaches (id, bio, specialization, years_experience, recommended_level)
    VALUES (omar_zaki_id, 'All-around coach with expertise in all aspects of the game', 'All-around Training', 10, 3);
    
    -- Omar Zaki schedule - Thursday, Friday, Saturday
    INSERT INTO coach_schedules (coach_id, branch_id, day_of_week, start_time, end_time, session_duration)
    VALUES (omar_zaki_id, maadi_club_one_id, 'Thursday', '15:30', '21:30', 45);
    
    INSERT INTO coach_schedules (coach_id, branch_id, day_of_week, start_time, end_time, session_duration)
    VALUES (omar_zaki_id, maadi_club_one_id, 'Friday', '13:30', '16:30', 45);
    
    INSERT INTO coach_schedules (coach_id, branch_id, day_of_week, start_time, end_time, session_duration)
    VALUES (omar_zaki_id, maadi_club_one_id, 'Saturday', '10:00', '21:30', 45);
  END IF;
  
  -- Hussein Amr
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'hussien.amr@ramyashour.com') THEN
    INSERT INTO users (id, email, full_name, name, role, token_identifier, created_at)
    VALUES (uuid_generate_v4(), 'hussien.amr@ramyashour.com', 'Hussein Amr', 'Hussein Amr', 'coach', uuid_generate_v4(), NOW())
    RETURNING id INTO hussien_amr_id;
    
    INSERT INTO coaches (id, bio, specialization, years_experience, recommended_level)
    VALUES (hussien_amr_id, 'Beginner-focused coach with patience and methodical approach', 'Beginner Development', 4, 1);
    
    -- Hussein Amr schedule - Wednesday
    INSERT INTO coach_schedules (coach_id, branch_id, day_of_week, start_time, end_time, session_duration)
    VALUES (hussien_amr_id, obour_golf_id, 'Wednesday', '15:30', '21:30', 45);
  END IF;
  
END $$;