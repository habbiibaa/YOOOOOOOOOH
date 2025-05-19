import { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import VideoUploader from "@/components/video-analysis/VideoUploader";
import VideoList from "@/components/video-analysis/VideoList";

export const metadata: Metadata = {
  title: "Video Analysis | Ramy Ashour Squash Academy",
  description: "Upload and analyze your squash training videos",
};

export default async function VideoAnalysisPage() {
  const supabase = await createClient();
  
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  
  // Get user's uploaded videos
  const { data: videos } = await supabase
    .from("training_videos")
    .select("*")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false });

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-2">Video Analysis</h1>
      <p className="text-gray-600 mb-6">
        Upload your training videos for professional analysis by our coaches
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <VideoUploader userId={user?.id || ''} />
        </div>
        <div>
          <VideoList videos={videos || []} />
        </div>
      </div>
    </div>
  );
} 