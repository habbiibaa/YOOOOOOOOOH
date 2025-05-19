-- Check if user_role type exists, if not create it
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('admin', 'coach', 'player');
    END IF;
END $$;

-- Create training_videos table if it doesn't exist
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

-- Create video_annotations table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.video_annotations (
  id uuid default uuid_generate_v4() primary key,
  video_id uuid references training_videos not null,
  user_id uuid references auth.users not null,
  timestamp float not null,
  note text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_training_videos_user_id') THEN
        CREATE INDEX idx_training_videos_user_id ON public.training_videos(user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_training_videos_status') THEN
        CREATE INDEX idx_training_videos_status ON public.training_videos(status);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_video_annotations_video_id') THEN
        CREATE INDEX idx_video_annotations_video_id ON public.video_annotations(video_id);
    END IF;
END $$;

-- Enable RLS if not already enabled
ALTER TABLE public.training_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_annotations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own videos" ON public.training_videos;
DROP POLICY IF EXISTS "Users can insert their own videos" ON public.training_videos;
DROP POLICY IF EXISTS "Coaches can view all videos" ON public.training_videos;
DROP POLICY IF EXISTS "Coaches can update videos" ON public.training_videos;

DROP POLICY IF EXISTS "Users can view their video annotations" ON public.video_annotations;
DROP POLICY IF EXISTS "Coaches can view all annotations" ON public.video_annotations;
DROP POLICY IF EXISTS "Coaches can insert annotations" ON public.video_annotations;

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

-- Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('training-videos', 'training-videos', false)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Users can upload their own videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own videos" ON storage.objects;
DROP POLICY IF EXISTS "Coaches can view all videos" ON storage.objects;

-- Create storage policies
CREATE POLICY "Users can upload their own videos"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'training-videos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view their own videos"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'training-videos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Coaches can view all videos"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'training-videos' AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'coach'
    )
  );

-- Enable realtime for new tables
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'training_videos'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.training_videos;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'video_annotations'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.video_annotations;
    END IF;
END $$; 