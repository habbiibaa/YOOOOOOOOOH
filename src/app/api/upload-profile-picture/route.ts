import { createClient } from "../../../utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const userId = formData.get("user_id") as string;
    const imageFile = formData.get("profile_image") as File;
    const redirectPath = formData.get("redirect_path") as string;

    if (!userId || !imageFile) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // Upload the image to Supabase Storage
    const fileName = `profile-${userId}-${Date.now()}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("profile-pictures")
      .upload(fileName, imageFile, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error("Error uploading image:", uploadError);
      return NextResponse.json(
        { success: false, error: uploadError.message },
        { status: 500 },
      );
    }

    // Get the public URL for the uploaded image
    const { data: urlData } = supabase.storage
      .from("profile-pictures")
      .getPublicUrl(fileName);

    const avatarUrl = urlData.publicUrl;

    // Update the user's avatar_url in the database
    const { error: updateError } = await supabase
      .from("users")
      .update({
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (updateError) {
      console.error("Error updating user avatar:", updateError);
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 },
      );
    }

    // Check if this is a client-side fetch or a traditional form submission
    const acceptHeader = request.headers.get('accept');
    const isClientSideFetch = acceptHeader && acceptHeader.includes('application/json');
    
    if (isClientSideFetch) {
      // Return JSON response for client-side fetch
      return NextResponse.json({
        success: true,
        avatarUrl,
        redirect: redirectPath
      });
    } else {
      // Redirect for traditional form submission
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }
  } catch (error) {
    console.error("Error in upload-profile-picture:", error);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 },
    );
  }
}
