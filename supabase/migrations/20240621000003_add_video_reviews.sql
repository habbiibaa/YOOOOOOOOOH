-- Create video_reviews table
CREATE TABLE IF NOT EXISTS video_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    player_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    coach_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    video_url TEXT NOT NULL,
    notes TEXT,
    coach_feedback TEXT,
    recommended_level INTEGER REFERENCES training_levels(level_number),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add RLS policies
ALTER TABLE video_reviews ENABLE ROW LEVEL SECURITY;

-- Players can view their own video reviews
CREATE POLICY "Players can view their own video reviews"
    ON video_reviews
    FOR SELECT
    TO authenticated
    USING (auth.uid() = player_id);

-- Players can create video reviews
CREATE POLICY "Players can create video reviews"
    ON video_reviews
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = player_id);

-- Coaches can view and update video reviews
CREATE POLICY "Coaches can view and update video reviews"
    ON video_reviews
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'coach'
            AND users.approved = true
        )
    );

-- Admins can view and manage all video reviews
CREATE POLICY "Admins can manage all video reviews"
    ON video_reviews
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for video_reviews
CREATE TRIGGER update_video_reviews_updated_at
    BEFORE UPDATE ON video_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 