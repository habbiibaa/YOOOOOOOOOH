-- Drop existing foreign key constraints if they exist
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'players_id_fkey' 
        AND table_name = 'players'
    ) THEN
        ALTER TABLE players DROP CONSTRAINT players_id_fkey;
    END IF;
END $$;

-- Drop existing primary key if it exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'players_pkey' 
        AND table_name = 'players'
    ) THEN
        ALTER TABLE players DROP CONSTRAINT players_pkey;
    END IF;
END $$;

-- Ensure all required columns exist with proper defaults
ALTER TABLE players
ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS skill_level TEXT DEFAULT 'Beginner',
ADD COLUMN IF NOT EXISTS years_playing INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS goals TEXT DEFAULT 'Improve squash skills',
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL;

-- Set primary key
ALTER TABLE players
ADD CONSTRAINT players_pkey PRIMARY KEY (id);

-- Add unique constraint on user_id
ALTER TABLE players
ADD CONSTRAINT players_user_id_key UNIQUE (user_id);

-- Update existing records to ensure they have all required fields
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
DROP POLICY IF EXISTS "Players can view their own profile" ON players;
CREATE POLICY "Players can view their own profile"
ON players
FOR SELECT
TO authenticated
USING (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Players can update their own profile" ON players;
CREATE POLICY "Players can update their own profile"
ON players
FOR UPDATE
TO authenticated
USING (auth.uid()::text = user_id::text)
WITH CHECK (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Coaches can view player profiles" ON players;
CREATE POLICY "Coaches can view player profiles"
ON players
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id::text = auth.uid()::text
        AND users.role = 'coach'
        AND users.approved = true
    )
);

DROP POLICY IF EXISTS "Admins can manage all player profiles" ON players;
CREATE POLICY "Admins can manage all player profiles"
ON players
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id::text = auth.uid()::text
        AND users.role = 'admin'
    )
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_players_user_id ON players(user_id);
CREATE INDEX IF NOT EXISTS idx_players_email ON players(email);
CREATE INDEX IF NOT EXISTS idx_players_full_name ON players(full_name);
CREATE INDEX IF NOT EXISTS idx_players_level ON players(level);
CREATE INDEX IF NOT EXISTS idx_players_skill_level ON players(skill_level); 