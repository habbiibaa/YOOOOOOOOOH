import { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import VideoPlayer from "@/components/video-analysis/VideoPlayer";
import CoachFeedback from "@/components/video-analysis/CoachFeedback";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Video Analysis | Ramy Ashour Squash Academy",
  description: "Analyze training videos and provide feedback",
};

export default async function VideoAnalysisDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  
  // Get video details
  const { data: video } = await supabase
    .from("training_videos")
    .select(`
      *,
      users:user_id (
        first_name,
        last_name,
        email
      )
    `)
    .eq("id", params.id)
    .single();

  if (!video) {
    notFound();
  }

  // Get video URL from storage
  const { data: { publicUrl } } = supabase.storage
    .from("training-videos")
    .getPublicUrl(video.file_path);

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Video Analysis</h1>
        <p className="text-gray-600">
          Analyzing video for {video.users.first_name} {video.users.last_name}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <VideoPlayer
            videoUrl={publicUrl}
            videoId={video.id}
            userId={user?.id || ''}
          />
        </div>
        <div>
          <CoachFeedback
            videoId={video.id}
            userId={user?.id || ''}
            initialFeedback={video.coach_feedback}
            initialAssessment={video.skill_assessment}
          />
        </div>
      </div>
    </div>
  );
} 