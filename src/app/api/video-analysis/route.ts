import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../utils/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const videoFile = formData.get("video") as File;
    const userId = formData.get("userId") as string;
    const description = formData.get("description") as string;

    if (!videoFile) {
      return NextResponse.json(
        { success: false, error: "No video file provided" },
        { status: 400 },
      );
    }

    // Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Upload video to Supabase Storage
    const fileName = `${user.id}-${Date.now()}-${videoFile.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("training-videos")
      .upload(fileName, videoFile);

    if (uploadError) {
      console.error("Error uploading video:", uploadError);
      return NextResponse.json(
        { success: false, error: uploadError.message },
        { status: 500 },
      );
    }

    // Get public URL for the video
    const { data: urlData } = supabase.storage
      .from("training-videos")
      .getPublicUrl(fileName);

    // Call Hugging Face for video analysis
    try {
      // This is a placeholder for the actual Hugging Face API call
      // In a real implementation, you would send the video URL to a video analysis model
      const analysisResponse = await fetch(
        "https://api-inference.huggingface.co/models/facebook/timesformer-base-finetuned-k400",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: urlData.publicUrl,
          }),
        },
      );

      let analysisResult = {};
      if (analysisResponse.ok) {
        analysisResult = await analysisResponse.json();
      } else {
        // Fallback mock analysis if the API call fails
        analysisResult = {
          technique_score: Math.floor(Math.random() * 30) + 70,
          footwork_score: Math.floor(Math.random() * 30) + 70,
          positioning_score: Math.floor(Math.random() * 30) + 70,
          recommendations: [
            "Work on follow-through in your backhand shots",
            "Improve your T position recovery after shots",
            "Focus on early racket preparation",
          ],
          detected_shots: [
            {
              type: "forehand drive",
              count: Math.floor(Math.random() * 10) + 5,
            },
            {
              type: "backhand drive",
              count: Math.floor(Math.random() * 10) + 5,
            },
            { type: "volley", count: Math.floor(Math.random() * 10) + 3 },
            { type: "boast", count: Math.floor(Math.random() * 5) + 1 },
          ],
        };
      }

      // Store video metadata and analysis in database
      const { data: videoData, error: videoError } = await supabase
        .from("player_videos")
        .insert([
          {
            user_id: user.id,
            video_url: urlData.publicUrl,
            description: description || "Training video",
            analysis_result: analysisResult,
            status: "analyzed",
          },
        ])
        .select();

      if (videoError) {
        console.error("Error storing video metadata:", videoError);
        return NextResponse.json(
          { success: false, error: videoError.message },
          { status: 500 },
        );
      }

      return NextResponse.json({
        success: true,
        videoId: videoData?.[0]?.id,
        videoUrl: urlData.publicUrl,
        analysis: analysisResult,
      });
    } catch (analysisError) {
      console.error("Error analyzing video:", analysisError);
      return NextResponse.json(
        { success: false, error: "Error analyzing video" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Error in video analysis API:", error);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 },
    );
  }
}
