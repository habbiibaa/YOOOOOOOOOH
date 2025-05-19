-- Add missing columns to players table
ALTER TABLE players
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS level INTEGER REFERENCES training_levels(level_number),
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL;

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

-- Add RLS policies if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_policies 
        WHERE tablename = 'players' 
        AND policyname = 'Players can view their own profile'
    ) THEN
        CREATE POLICY "Players can view their own profile"
            ON players
            FOR SELECT
            TO authenticated
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM pg_policies 
        WHERE tablename = 'players' 
        AND policyname = 'Players can update their own profile'
    ) THEN
        CREATE POLICY "Players can update their own profile"
            ON players
            FOR UPDATE
            TO authenticated
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM pg_policies 
        WHERE tablename = 'players' 
        AND policyname = 'Coaches can view player profiles'
    ) THEN
        CREATE POLICY "Coaches can view player profiles"
            ON players
            FOR SELECT
            TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM users
                    WHERE users.id = auth.uid()
                    AND users.role = 'coach'
                    AND users.approved = true
                )
            );
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM pg_policies 
        WHERE tablename = 'players' 
        AND policyname = 'Admins can manage all player profiles'
    ) THEN
        CREATE POLICY "Admins can manage all player profiles"
            ON players
            FOR ALL
            TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM users
                    WHERE users.id = auth.uid()
                    AND users.role = 'admin'
                )
            );
    END IF;
END $$; 