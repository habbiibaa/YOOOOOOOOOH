-- Create user_role enum type
CREATE TYPE user_role AS ENUM ('admin', 'coach', 'player');

-- Create tables
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.players (
  id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  skill_level TEXT,
  years_playing INTEGER,
  goals TEXT
);

CREATE TABLE IF NOT EXISTS public.branches (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  address TEXT,
  is_members_only BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.coaches (
  id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  specialties TEXT[] DEFAULT '{}',
  available_levels TEXT[] DEFAULT '{}',
  rating NUMERIC DEFAULT 5.0
);

CREATE TABLE IF NOT EXISTS public.coach_schedules (
  id UUID PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES public.coaches(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  day_of_week TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  session_duration INTEGER DEFAULT 45
);

CREATE TABLE IF NOT EXISTS public.coach_availability (
  id UUID PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES public.coaches(id) ON DELETE CASCADE,
  day_of_week TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  session_duration INTEGER DEFAULT 45,
  max_sessions INTEGER DEFAULT 10
);

CREATE TABLE IF NOT EXISTS public.coach_sessions (
  id UUID PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES public.coaches(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  player_id UUID REFERENCES public.players(id) ON DELETE SET NULL,
  session_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT DEFAULT 'available'
);

CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  date_of_birth DATE,
  branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS public.training_levels (
  id SERIAL PRIMARY KEY,
  level_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.training_slots (
  id SERIAL PRIMARY KEY,
  level INTEGER NOT NULL,
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  is_group_session BOOLEAN DEFAULT FALSE,
  max_group_size INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  slot_id INTEGER NOT NULL REFERENCES public.training_slots(id) ON DELETE CASCADE,
  booking_date TIMESTAMPTZ NOT NULL,
  confirmed BOOLEAN DEFAULT FALSE,
  payment_status TEXT DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.assessments (
  id UUID PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  level INTEGER NOT NULL,
  assessment_date TIMESTAMPTZ NOT NULL,
  assessed_by UUID NOT NULL REFERENCES public.coaches(id) ON DELETE CASCADE,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  role user_role NOT NULL
);

CREATE TABLE IF NOT EXISTS public.player_videos (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  video_url TEXT NOT NULL,
  description TEXT,
  analysis_result JSONB,
  coach_feedback TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  used BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS public.refresh_tokens (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  used BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS public.leaked_passwords (
  id UUID PRIMARY KEY,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.credits_transactions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audits (
  id UUID PRIMARY KEY,
  tbl TEXT NOT NULL,
  row_id TEXT NOT NULL,
  before JSONB,
  after JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX idx_coach_sessions_coach_id ON public.coach_sessions(coach_id);
CREATE INDEX idx_coach_sessions_player_id ON public.coach_sessions(player_id);
CREATE INDEX idx_coach_sessions_date ON public.coach_sessions(session_date);
CREATE INDEX idx_coach_sessions_status ON public.coach_sessions(status);

CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);

CREATE INDEX idx_player_videos_user_id ON public.player_videos(user_id);
CREATE INDEX idx_player_videos_status ON public.player_videos(status); 