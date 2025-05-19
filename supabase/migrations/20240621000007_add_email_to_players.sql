-- Add email column to players table
ALTER TABLE players
ADD COLUMN IF NOT EXISTS email TEXT;

-- Update existing player records with email from users table
UPDATE players p
SET email = u.email
FROM users u
WHERE p.user_id = u.id
AND p.email IS NULL;

-- Add RLS policy for email
CREATE POLICY "Players can view their own email"
ON players
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_players_email ON players(email); 