import { createClient } from "../../../../utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { coachId } = await request.json();

    if (!coachId) {
      return NextResponse.json(
        { success: false, error: "Coach ID is required" },
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

    // Delete the coach from the users table
    const { error: deleteError } = await supabase
      .from("users")
      .delete()
      .eq("id", coachId)
      .eq("role", "coach");

    if (deleteError) {
      console.error("Error rejecting coach:", deleteError);
      return NextResponse.json(
        { success: false, error: deleteError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ 
      success: true,
      message: "Coach rejected and removed successfully" 
    });
  } catch (error) {
    console.error("Error in reject-coach:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: `Server error: ${errorMessage}` },
      { status: 500 },
    );
  }
} 