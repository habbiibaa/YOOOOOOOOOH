import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';

interface VideoUploaderProps {
  userId: string;
}

export default function VideoUploader({ userId }: VideoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      setError('Please upload a valid video file');
      return;
    }

    // Validate file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      setError('Video file size must be less than 100MB');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const supabase = createClient();
      
      // Upload video to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('training-videos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Save video metadata to database
      const { error: dbError } = await supabase
        .from('training_videos')
        .insert({
          user_id: userId,
          file_path: fileName,
          file_name: file.name,
          file_size: file.size,
          duration: 0, // This would need to be calculated client-side
          status: 'pending',
        });

      if (dbError) throw dbError;

      // Reset form
      event.target.value = '';
      setUploadProgress(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during upload');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Upload Training Video</h2>
      
      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            accept="video/*"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
            id="video-upload"
          />
          <label
            htmlFor="video-upload"
            className="cursor-pointer inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            {uploading ? 'Uploading...' : 'Select Video'}
          </label>
          <p className="mt-2 text-sm text-gray-500">
            Supported formats: MP4, MOV, AVI (Max 100MB)
          </p>
        </div>

        {uploading && (
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-500 h-2.5 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        )}

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}
      </div>
    </div>
  );
} 