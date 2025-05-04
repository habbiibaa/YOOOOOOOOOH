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

    // Update user to set approved=true
    const { error: updateError } = await supabase
      .from("users")
      .update({ 
        approved: true,
        updated_at: new Date().toISOString()
      })
      .eq("id", coachId)
      .eq("role", "coach");

    if (updateError) {
      console.error("Error approving coach:", updateError);
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ 
      success: true,
      message: "Coach approved successfully" 
    });
  } catch (error) {
    console.error("Error in approve-coach:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: `Server error: ${errorMessage}` },
      { status: 500 },
    );
  }
} 