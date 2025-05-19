-- Drop and recreate coach_sessions table
DROP TABLE IF EXISTS public.coach_sessions CASCADE;

CREATE TABLE IF NOT EXISTS public.coach_sessions (
  id UUID PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES public.coaches(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  player_id UUID REFERENCES public.players(id) ON DELETE SET NULL,
  coach_schedule_id UUID REFERENCES public.coach_schedules(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'booked', 'cancelled', 'completed')),
  payment_status TEXT DEFAULT 'pending',
  reserved_at TIMESTAMPTZ,
  reservation_expires_at TIMESTAMPTZ,
  booked_at TIMESTAMPTZ,
  price DECIMAL(10, 2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recreate indexes
CREATE INDEX IF NOT EXISTS idx_coach_sessions_coach_id ON public.coach_sessions(coach_id);
CREATE INDEX IF NOT EXISTS idx_coach_sessions_player_id ON public.coach_sessions(player_id);
CREATE INDEX IF NOT EXISTS idx_coach_sessions_date ON public.coach_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_coach_sessions_status ON public.coach_sessions(status);
CREATE INDEX IF NOT EXISTS idx_coach_sessions_schedule_id ON public.coach_sessions(coach_schedule_id);
CREATE INDEX IF NOT EXISTS idx_coach_sessions_user_id ON public.coach_sessions(user_id);

-- Add a comment to remind users to run session generation
COMMENT ON TABLE public.coach_sessions IS 'Coach session table for appointments. Run generateAvailableSessions() server action to regenerate sessions.'; 