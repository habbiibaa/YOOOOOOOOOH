-- Create user roles enum type
CREATE TYPE user_role AS ENUM ('player', 'coach', 'admin');

-- Add role column to users table
ALTER TABLE users ADD COLUMN role user_role NOT NULL DEFAULT 'player';

-- Create coaches table
CREATE TABLE IF NOT EXISTS coaches (
  id UUID PRIMARY KEY REFERENCES users(id),
  bio TEXT,
  specialization TEXT,
  years_experience INTEGER,
  hourly_rate DECIMAL(10, 2),
  availability JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create players table
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY REFERENCES users(id),
  skill_level TEXT,
  years_playing INTEGER,
  goals TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable realtime for new tables
alter publication supabase_realtime add table coaches;
alter publication supabase_realtime add table players;
