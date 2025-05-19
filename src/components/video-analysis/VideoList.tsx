import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';

interface Video {
  id: string;
  file_name: string;
  created_at: string;
  status: 'pending' | 'analyzing' | 'completed';
  coach_feedback?: string;
  skill_assessment?: {
    technique: number;
    footwork: number;
    consistency: number;
    tactical: number;
  };
}

interface VideoListProps {
  videos: Video[];
}

export default function VideoList({ videos }: VideoListProps) {
  const getStatusColor = (status: Video['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'analyzing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Your Training Videos</h2>
      
      {videos.length === 0 ? (
        <p className="text-gray-500 text-center py-4">
          No videos uploaded yet. Upload your first training video to get started!
        </p>
      ) : (
        <div className="space-y-4">
          {videos.map((video) => (
            <div
              key={video.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{video.file_name}</h3>
                  <p className="text-sm text-gray-500">
                    Uploaded on {formatDate(video.created_at)}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    video.status
                  )}`}
                >
                  {video.status.charAt(0).toUpperCase() + video.status.slice(1)}
                </span>
              </div>

              {video.status === 'completed' && video.coach_feedback && (
                <div className="mt-3">
                  <h4 className="text-sm font-medium text-gray-700">Coach Feedback:</h4>
                  <p className="text-sm text-gray-600 mt-1">{video.coach_feedback}</p>
                  
                  {video.skill_assessment && (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-gray-500">Technique</p>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${video.skill_assessment.technique}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Footwork</p>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${video.skill_assessment.footwork}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Consistency</p>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${video.skill_assessment.consistency}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Tactical</p>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${video.skill_assessment.tactical}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4">
                <Link
                  href={`/video-analysis/${video.id}`}
                  className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                >
                  View Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 