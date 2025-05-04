import { createClient } from "../../../../supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { userId, newRole } = await request.json();

    if (!userId || !newRole) {
      return NextResponse.json(
        { success: false, error: "User ID and new role are required" },
        { status: 400 },
      );
    }

    // Validate role
    if (!["admin", "coach", "player"].includes(newRole)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid role. Must be admin, coach, or player",
        },
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

    // Update user role
    const { error: updateError } = await supabase
      .from("users")
      .update({ role: newRole })
      .eq("id", userId);

    if (updateError) {
      console.error("Error updating user role:", updateError);
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 },
      );
    }

    // Create coach or player record if needed
    if (newRole === "coach") {
      // Check if coach record exists
      const { data: existingCoach } = await supabase
        .from("coaches")
        .select("id")
        .eq("id", userId)
        .maybeSingle();

      if (!existingCoach) {
        // Create coach record
        await supabase.from("coaches").insert({
          id: userId,
          specialization: "General",
          years_experience: 0,
          hourly_rate: 50,
          bio: "New coach",
          created_at: new Date().toISOString(),
        });
      }
    } else if (newRole === "player") {
      // Check if player record exists
      const { data: existingPlayer } = await supabase
        .from("players")
        .select("id")
        .eq("id", userId)
        .maybeSingle();

      if (!existingPlayer) {
        // Create player record
        await supabase.from("players").insert({
          id: userId,
          skill_level: "Beginner",
          years_playing: 0,
          created_at: new Date().toISOString(),
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in update-user-role:", error);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 },
    );
  }
}
