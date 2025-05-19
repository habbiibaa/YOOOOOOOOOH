-- Add user_id column to players table
ALTER TABLE players
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Add RLS policy for user_id
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

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_players_user_id ON players(user_id); 