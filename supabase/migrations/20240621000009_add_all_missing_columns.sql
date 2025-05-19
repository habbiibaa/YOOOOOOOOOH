-- Add all missing columns to players table
ALTER TABLE players
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS skill_level TEXT DEFAULT 'Beginner',
ADD COLUMN IF NOT EXISTS years_playing INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS goals TEXT DEFAULT 'Improve squash skills',
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL;

-- Update existing player records with data from users table
UPDATE players p
SET 
    email = u.email,
    full_name = u.full_name
FROM users u
WHERE p.user_id = u.id
AND (p.email IS NULL OR p.full_name IS NULL);

-- Create trigger for updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for players table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_trigger 
        WHERE tgname = 'update_players_updated_at'
    ) THEN
        CREATE TRIGGER update_players_updated_at
            BEFORE UPDATE ON players
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Add RLS policies
CREATE POLICY "Players can view their own profile"
ON players
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Players can update their own profile"
ON players
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_players_email ON players(email);
CREATE INDEX IF NOT EXISTS idx_players_full_name ON players(full_name);
CREATE INDEX IF NOT EXISTS idx_players_level ON players(level);
CREATE INDEX IF NOT EXISTS idx_players_skill_level ON players(skill_level); 