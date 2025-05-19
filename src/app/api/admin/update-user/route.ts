import { createClient } from "../../../../utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const userId = formData.get("user_id") as string;
    const redirectPath = formData.get("redirect_path") as string;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // Check if current user is admin
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 },
      );
    }

    const { data: adminCheck } = await supabase
      .from("users")
      .select("role")
      .eq("id", currentUser.id)
      .single();

    if (!adminCheck || adminCheck.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Not authorized" },
        { status: 403 },
      );
    }

    // Get current user data to determine if role is changing
    const { data: currentUserData } = await supabase
      .from("users")
      .select("role")
      .eq("id", userId)
      .single();

    const newRole = formData.get("role") as string;
    const oldRole = currentUserData?.role;

    // Update basic user information
    const fullName = formData.get("full_name") as string;
    const phone = formData.get("phone") as string;

    const { error: userError } = await supabase
      .from("users")
      .update({
        full_name: fullName,
        name: fullName,
        phone: phone,
        role: newRole,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (userError) {
      console.error("Error updating user:", userError);
      return NextResponse.json(
        { success: false, error: userError.message },
        { status: 500 },
      );
    }

    // Handle role-specific updates
    if (newRole === "coach") {
      const specialization = formData.get("specialization") as string;
      const yearsExperience =
        parseInt(formData.get("years_experience") as string) || 0;
      const bio = formData.get("bio") as string;
      const hourlyRate = parseFloat(formData.get("hourly_rate") as string) || 0;

      // Check if coach record exists
      const { count } = await supabase
        .from("coaches")
        .select("*", { count: "exact", head: true })
        .eq("id", userId);

      if (count === 0) {
        // Create new coach record
        await supabase.from("coaches").insert({
          id: userId,
          specialization,
          years_experience: yearsExperience,
          bio,
          hourly_rate: hourlyRate,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      } else {
        // Update existing coach record
        await supabase
          .from("coaches")
          .update({
            specialization,
            years_experience: yearsExperience,
            bio,
            hourly_rate: hourlyRate,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);
      }
    } else if (newRole === "player") {
      const skillLevel = formData.get("skill_level") as string;
      const yearsPlaying =
        parseInt(formData.get("years_playing") as string) || 0;
      const goals = formData.get("goals") as string;

      // Check if player record exists
      const { count } = await supabase
        .from("players")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      if (count === 0) {
        // Create new player record
        await supabase.from("players").insert({
          user_id: userId,
          skill_level: skillLevel,
          years_playing: yearsPlaying,
          goals,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      } else {
        // Update existing player record
        await supabase
          .from("players")
          .update({
            skill_level: skillLevel,
            years_playing: yearsPlaying,
            goals,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId);
      }
    }

    // Redirect back to user profile
    return NextResponse.redirect(new URL(redirectPath, request.url));
  } catch (error) {
    console.error("Error in update-user:", error);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 },
    );
  }
}
