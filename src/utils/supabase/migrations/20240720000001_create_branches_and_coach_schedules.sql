-- Create branches table
CREATE TABLE IF NOT EXISTS branches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  address TEXT,
  is_members_only BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create coach_schedules table
CREATE TABLE IF NOT EXISTS coach_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id UUID NOT NULL REFERENCES users(id),
  branch_id UUID NOT NULL REFERENCES branches(id),
  day_of_week TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  session_duration INTEGER NOT NULL DEFAULT 45,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create coach_sessions table
CREATE TABLE IF NOT EXISTS coach_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id UUID NOT NULL REFERENCES users(id),
  player_id UUID REFERENCES users(id),
  branch_id UUID NOT NULL REFERENCES branches(id),
  session_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'available',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert branch data
INSERT INTO branches (name, location, address, is_members_only) VALUES
('New Cairo - Royal British School', 'New Cairo', 'Royal British School, New Cairo', FALSE),
('New Cairo - Sodic East Town', 'New Cairo', 'Sodic East Town, New Cairo', TRUE),
('El Obour - Golf City Club', 'El Obour', 'Golf City Club, El Obour', FALSE),
('El Maadi - Club One', 'El Maadi', 'Club One, El Maadi', FALSE);

-- Enable realtime for branches
alter publication supabase_realtime add table branches;

-- Enable realtime for coach_schedules
alter publication supabase_realtime add table coach_schedules;

-- Enable realtime for coach_sessions
alter publication supabase_realtime add table coach_sessions;
