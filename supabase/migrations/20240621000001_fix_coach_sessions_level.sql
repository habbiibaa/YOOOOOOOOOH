-- Drop existing foreign key constraint
ALTER TABLE public.coach_sessions
DROP CONSTRAINT IF EXISTS fk_coach_sessions_level;

-- Alter level column to INTEGER
ALTER TABLE public.coach_sessions
ALTER COLUMN level TYPE INTEGER USING level::INTEGER;

-- Add missing columns
ALTER TABLE public.coach_sessions
ADD COLUMN IF NOT EXISTS day_of_week TEXT,
ADD COLUMN IF NOT EXISTS court TEXT,
ADD COLUMN IF NOT EXISTS session_duration INTEGER DEFAULT 45;

-- Add foreign key constraint back
ALTER TABLE public.coach_sessions
ADD CONSTRAINT fk_coach_sessions_level
FOREIGN KEY (level)
REFERENCES public.training_levels(level_number)
ON DELETE RESTRICT;

-- Update existing sessions to have proper level values
UPDATE public.coach_sessions
SET level = 1
WHERE level IS NULL OR level::INTEGER NOT IN (SELECT level_number FROM public.training_levels);

-- Add index for level column
CREATE INDEX IF NOT EXISTS idx_coach_sessions_level ON public.coach_sessions(level); 