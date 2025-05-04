import { createClient } from "../../../utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const userId = formData.get("user_id") as string;
    const role = formData.get("role") as string;
    const redirectPath = formData.get("redirect_path") as string;

    if (!userId || !role) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // Update basic user information
    const fullName = formData.get("full_name") as string;
    const phone = formData.get("phone") as string;

    // Check if there's an avatar URL from a previous upload
    const { data: userData } = await supabase
      .from("users")
      .select("avatar_url")
      .eq("id", userId)
      .single();

    // Check if the users table has a phone column before including it in the update
    const { data: hasPhoneColumn } = await supabase
      .from("users")
      .select("phone")
      .limit(1)
      .maybeSingle();

    const updateData: any = {
      full_name: fullName,
      name: fullName,
      avatar_url: userData?.avatar_url || null,
      updated_at: new Date().toISOString(),
    };

    // Only include phone if the column exists
    if (hasPhoneColumn !== null) {
      updateData.phone = phone;
    }

    const { error: userError } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", userId);

    if (userError) {
      console.error("Error updating user:", userError);
      return NextResponse.json(
        { success: false, error: userError.message },
        { status: 500 },
      );
    }

    // Update role-specific information
    if (role === "coach") {
      const specialization = formData.get("specialization") as string;
      const yearsExperience =
        parseInt(formData.get("years_experience") as string) || 0;
      const bio = formData.get("bio") as string;
      // Hourly rate is not updated from the profile form - only admins can change it

      const { error: coachError } = await supabase
        .from("coaches")
        .update({
          specialization,
          years_experience: yearsExperience,
          bio,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (coachError) {
        console.error("Error updating coach:", coachError);
        return NextResponse.json(
          { success: false, error: coachError.message },
          { status: 500 },
        );
      }
    } else if (role === "player") {
      const skillLevel = formData.get("skill_level") as string;
      const yearsPlaying =
        parseInt(formData.get("years_playing") as string) || 0;
      const goals = formData.get("goals") as string;

      const { error: playerError } = await supabase
        .from("players")
        .update({
          skill_level: skillLevel,
          years_playing: yearsPlaying,
          goals,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (playerError) {
        console.error("Error updating player:", playerError);
        return NextResponse.json(
          { success: false, error: playerError.message },
          { status: 500 },
        );
      }
    }

    // Update password if provided
    const newPassword = formData.get("new_password") as string;
    const confirmPassword = formData.get("confirm_password") as string;

    if (newPassword && confirmPassword && newPassword === confirmPassword) {
      const { error: passwordError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (passwordError) {
        console.error("Error updating password:", passwordError);
        return NextResponse.json(
          { success: false, error: passwordError.message },
          { status: 500 },
        );
      }
    }

    // Redirect back to dashboard
    return NextResponse.redirect(new URL(redirectPath, request.url));
  } catch (error) {
    console.error("Error in update-profile:", error);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 },
    );
  }
}
