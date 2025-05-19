-- Drop existing foreign key constraint
ALTER TABLE public.coach_sessions
DROP CONSTRAINT IF EXISTS coach_sessions_coach_id_fkey;

-- Ensure all coaches exist in the users table
INSERT INTO public.users (id, email, full_name, role)
SELECT DISTINCT c.id, c.id::text || '@placeholder.com', c.name, 'coach'
FROM public.coaches c
LEFT JOIN public.users u ON c.id = u.id
WHERE u.id IS NULL;

-- Update coach_sessions to ensure all coach_ids exist in coaches table
INSERT INTO public.coaches (id, name, specialties, available_levels, rating)
SELECT DISTINCT cs.coach_id, 'Coach ' || cs.coach_id::text, '{}', '{}', 5.0
FROM public.coach_sessions cs
LEFT JOIN public.coaches c ON cs.coach_id = c.id
WHERE c.id IS NULL;

-- Add new foreign key constraint with proper reference
ALTER TABLE public.coach_sessions
ADD CONSTRAINT coach_sessions_coach_id_fkey
FOREIGN KEY (coach_id)
REFERENCES public.coaches(id)
ON DELETE CASCADE;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_coach_sessions_coach_id ON public.coach_sessions(coach_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_coach_sessions_updated_at
    BEFORE UPDATE ON public.coach_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 