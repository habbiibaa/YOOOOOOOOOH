-- Add the approved column to the users table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'approved') THEN
    ALTER TABLE users ADD COLUMN approved BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Update existing users to have appropriate approved values
UPDATE users SET approved = true WHERE role = 'player';
UPDATE users SET approved = false WHERE role IN ('coach', 'admin') AND approved IS NULL;
