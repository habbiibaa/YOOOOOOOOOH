-- Create storage bucket for training videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('training-videos', 'training-videos', false)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for the training-videos bucket
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