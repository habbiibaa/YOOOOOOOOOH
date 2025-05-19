-- Add full_name column to players table
ALTER TABLE players
ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Update existing player records with full_name from users table
UPDATE players p
SET full_name = u.full_name
FROM users u
WHERE p.user_id = u.id
AND p.full_name IS NULL;

-- Add RLS policy for full_name
CREATE POLICY "Players can view their own full_name"
ON players
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_players_full_name ON players(full_name); 