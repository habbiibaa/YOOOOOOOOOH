-- Create training_videos table
CREATE TABLE IF NOT EXISTS public.training_videos (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  file_path text not null,
  file_name text not null,
  file_size bigint not null,
  duration integer,
  status text not null default 'pending',
  coach_feedback text,
  skill_assessment jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create video_annotations table
CREATE TABLE IF NOT EXISTS public.video_annotations (
  id uuid default uuid_generate_v4() primary key,
  video_id uuid references training_videos not null,
  user_id uuid references auth.users not null,
  timestamp float not null,
  note text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add indexes for better performance
CREATE INDEX idx_training_videos_user_id ON public.training_videos(user_id);
CREATE INDEX idx_training_videos_status ON public.training_videos(status);
CREATE INDEX idx_video_annotations_video_id ON public.video_annotations(video_id);

-- Enable RLS
ALTER TABLE public.training_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_annotations ENABLE ROW LEVEL SECURITY;

-- Create policies for training_videos
CREATE POLICY "Users can view their own videos"
  ON public.training_videos
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own videos"
  ON public.training_videos
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Coaches can view all videos"
  ON public.training_videos
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'coach'
    )
  );

CREATE POLICY "Coaches can update videos"
  ON public.training_videos
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'coach'
    )
  );

-- Create policies for video_annotations
CREATE POLICY "Users can view their video annotations"
  ON public.video_annotations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.training_videos
      WHERE id = video_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Coaches can view all annotations"
  ON public.video_annotations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'coach'
    )
  );

CREATE POLICY "Coaches can insert annotations"
  ON public.video_annotations
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'coach'
    )
  );

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.training_videos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.video_annotations; 