-- Create player_videos table for storing video analysis data
CREATE TABLE IF NOT EXISTS player_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  video_url TEXT NOT NULL,
  description TEXT,
  analysis_result JSONB,
  coach_feedback TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable row level security
ALTER TABLE player_videos ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can view their own videos
DROP POLICY IF EXISTS "Users can view their own videos" ON player_videos;
CREATE POLICY "Users can view their own videos"
  ON player_videos FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own videos
DROP POLICY IF EXISTS "Users can insert their own videos" ON player_videos;
CREATE POLICY "Users can insert their own videos"
  ON player_videos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own videos
DROP POLICY IF EXISTS "Users can update their own videos" ON player_videos;
CREATE POLICY "Users can update their own videos"
  ON player_videos FOR UPDATE
  USING (auth.uid() = user_id);

-- Coaches can view all videos
DROP POLICY IF EXISTS "Coaches can view all videos" ON player_videos;
CREATE POLICY "Coaches can view all videos"
  ON player_videos FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND (users.role = 'coach' OR users.role = 'admin')
  ));

-- Coaches can update all videos (to add feedback)
DROP POLICY IF EXISTS "Coaches can update all videos" ON player_videos;
CREATE POLICY "Coaches can update all videos"
  ON player_videos FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND (users.role = 'coach' OR users.role = 'admin')
  ));

-- Enable realtime for this table
alter publication supabase_realtime add table player_videos;
