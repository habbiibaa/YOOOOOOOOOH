-- Add level column to coach_sessions table
ALTER TABLE public.coach_sessions
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;

-- Add foreign key constraint to training_levels table
ALTER TABLE public.coach_sessions
ADD CONSTRAINT fk_coach_sessions_level
FOREIGN KEY (level)
REFERENCES public.training_levels(level_number)
ON DELETE RESTRICT;

-- Add index for level column
CREATE INDEX IF NOT EXISTS idx_coach_sessions_level ON public.coach_sessions(level);

-- Update existing sessions to have proper level values
UPDATE public.coach_sessions
SET level = 1
WHERE level IS NULL; 