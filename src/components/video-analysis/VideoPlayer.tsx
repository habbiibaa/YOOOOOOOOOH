import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

interface VideoPlayerProps {
  videoUrl: string;
  videoId: string;
  userId: string;
}

interface Annotation {
  id: string;
  timestamp: number;
  note: string;
  created_at: string;
}

export default function VideoPlayer({ videoUrl, videoId, userId }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    loadAnnotations();
  }, [videoId]);

  const loadAnnotations = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('video_annotations')
      .select('*')
      .eq('video_id', videoId)
      .order('timestamp');
    
    if (data) {
      setAnnotations(data);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const addAnnotation = async () => {
    if (!newNote.trim()) return;

    const supabase = createClient();
    const { data, error } = await supabase
      .from('video_annotations')
      .insert({
        video_id: videoId,
        user_id: userId,
        timestamp: currentTime,
        note: newNote.trim(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding annotation:', error);
      return;
    }

    setAnnotations([...annotations, data]);
    setNewNote('');
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full aspect-video"
          onTimeUpdate={handleTimeUpdate}
          controls
        />
      </div>

      <div className="p-4">
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={handlePlayPause}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <span className="text-gray-600">{formatTime(currentTime)}</span>
        </div>

        <div className="space-y-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add a note at current timestamp..."
              className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={addAnnotation}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              Add Note
            </button>
          </div>

          <div className="space-y-2">
            {annotations.map((annotation) => (
              <div
                key={annotation.id}
                className="p-3 bg-gray-50 rounded border"
              >
                <div className="flex justify-between items-start">
                  <span className="text-sm font-medium text-gray-600">
                    {formatTime(annotation.timestamp)}
                  </span>
                  <button
                    onClick={() => {
                      if (videoRef.current) {
                        videoRef.current.currentTime = annotation.timestamp;
                        videoRef.current.play();
                      }
                    }}
                    className="text-blue-500 hover:text-blue-600 text-sm"
                  >
                    Jump to
                  </button>
                </div>
                <p className="mt-1 text-gray-700">{annotation.note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 