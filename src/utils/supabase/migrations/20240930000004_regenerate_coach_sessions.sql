-- Stored procedure to regenerate coach sessions for the next N days

-- Create or replace the function
CREATE OR REPLACE FUNCTION regenerate_coach_sessions_for_next_days(days_to_generate INTEGER DEFAULT 30)
RETURNS SETOF coach_sessions AS $$
DECLARE
    schedule coach_schedules%ROWTYPE;
    session_date DATE;
    session_start_time TIME;
    session_end_time TIME;
    session_id UUID;
    session_duration INTEGER;
    start_date DATE := CURRENT_DATE;
    end_date DATE := CURRENT_DATE + days_to_generate;
    time_cursor INTERVAL;
    coach_id UUID;
    branch_id UUID;
BEGIN
    -- Delete any future sessions that haven't been booked yet
    DELETE FROM coach_sessions
    WHERE session_date >= start_date
    AND status = 'available';
    
    -- For each schedule
    FOR schedule IN 
        SELECT * FROM coach_schedules
    LOOP
        coach_id := schedule.coach_id;
        branch_id := schedule.branch_id;
        session_duration := schedule.session_duration;
        
        -- For each date in the range
        FOR session_date IN 
            SELECT generate_series::DATE 
            FROM generate_series(start_date, end_date, '1 day')
        LOOP
            -- If the day of week matches
            IF EXTRACT(DOW FROM session_date) = 
               CASE 
                   WHEN schedule.day_of_week = 'Sunday' THEN 0
                   WHEN schedule.day_of_week = 'Monday' THEN 1
                   WHEN schedule.day_of_week = 'Tuesday' THEN 2
                   WHEN schedule.day_of_week = 'Wednesday' THEN 3
                   WHEN schedule.day_of_week = 'Thursday' THEN 4
                   WHEN schedule.day_of_week = 'Friday' THEN 5
                   WHEN schedule.day_of_week = 'Saturday' THEN 6
               END 
            THEN
                -- Generate sessions for this day
                time_cursor := '0 minutes'::INTERVAL;
                
                WHILE (schedule.start_time::TIME + time_cursor) < schedule.end_time::TIME LOOP
                    session_start_time := schedule.start_time::TIME + time_cursor;
                    session_end_time := session_start_time + (session_duration || ' minutes')::INTERVAL;
                    
                    -- If end time doesn't exceed schedule end time
                    IF session_end_time <= schedule.end_time::TIME THEN
                        session_id := uuid_generate_v4();
                        
                        -- Insert the session
                        INSERT INTO coach_sessions (
                            id,
                            coach_id,
                            branch_id,
                            coach_schedule_id,
                            session_date,
                            start_time,
                            end_time,
                            status,
                            created_at,
                            updated_at
                        ) VALUES (
                            session_id,
                            coach_id,
                            branch_id,
                            schedule.id,
                            session_date,
                            session_start_time::TEXT,
                            session_end_time::TEXT,
                            'available',
                            NOW(),
                            NOW()
                        )
                        RETURNING * INTO schedule;
                        
                        RETURN NEXT schedule;
                    END IF;
                    
                    -- Increment by session duration
                    time_cursor := time_cursor + (session_duration || ' minutes')::INTERVAL;
                END LOOP;
            END IF;
        END LOOP;
    END LOOP;
    
    RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 