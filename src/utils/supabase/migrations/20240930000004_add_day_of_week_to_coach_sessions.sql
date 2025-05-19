-- Add day_of_week column to coach_sessions table if it doesn't exist
ALTER TABLE public.coach_sessions ADD COLUMN IF NOT EXISTS day_of_week TEXT;

-- Update existing records to set day_of_week based on session_date
DO $$
DECLARE
    session_record RECORD;
BEGIN
    FOR session_record IN
        SELECT id, session_date
        FROM public.coach_sessions
        WHERE day_of_week IS NULL
    LOOP
        UPDATE public.coach_sessions
        SET day_of_week = TO_CHAR(session_record.session_date, 'Day')
        WHERE id = session_record.id;
    END LOOP;
END $$; 