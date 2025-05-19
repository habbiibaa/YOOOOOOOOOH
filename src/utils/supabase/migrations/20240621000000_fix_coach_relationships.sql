-- Drop existing foreign key constraint
ALTER TABLE public.coach_sessions
DROP CONSTRAINT IF EXISTS coach_sessions_coach_id_fkey;

-- Add new foreign key constraint with proper reference
ALTER TABLE public.coach_sessions
ADD CONSTRAINT coach_sessions_coach_id_fkey
FOREIGN KEY (coach_id)
REFERENCES public.coaches(id)
ON DELETE CASCADE;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_coach_sessions_coach_id ON public.coach_sessions(coach_id); 