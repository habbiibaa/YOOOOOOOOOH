-- Drop existing sessions table and create new improved tables
DROP TABLE IF EXISTS sessions;

-- Coach availability/schedule table
CREATE TABLE coach_schedules (
    id SERIAL PRIMARY KEY,
    coach_id UUID REFERENCES auth.users(id),
    day_of_week TEXT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Booking sessions table
CREATE TABLE booking_sessions (
    id SERIAL PRIMARY KEY,
    coach_id UUID REFERENCES auth.users(id),
    player_id UUID REFERENCES auth.users(id),
    court_id TEXT NOT NULL,
    session_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('available', 'pending', 'booked', 'cancelled', 'completed')),
    booking_type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_coach_schedules_coach_id ON coach_schedules(coach_id);
CREATE INDEX idx_coach_schedules_day ON coach_schedules(day_of_week);
CREATE INDEX idx_booking_sessions_coach_id ON booking_sessions(coach_id);
CREATE INDEX idx_booking_sessions_player_id ON booking_sessions(player_id);
CREATE INDEX idx_booking_sessions_date ON booking_sessions(session_date);
CREATE INDEX idx_booking_sessions_status ON booking_sessions(status);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_coach_schedules_updated_at
    BEFORE UPDATE ON coach_schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_booking_sessions_updated_at
    BEFORE UPDATE ON booking_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
