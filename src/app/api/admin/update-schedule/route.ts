import { createClient } from "../../../../utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { scheduleId, scheduleData } = await request.json();

    if (!scheduleId || !scheduleData) {
      return NextResponse.json(
        { success: false, error: "Schedule ID and data are required" },
        { status: 400 },
      );
    }

    // Validate required fields
    if (!scheduleData.coach_id || !scheduleData.branch_id || !scheduleData.day_of_week || 
        !scheduleData.start_time || !scheduleData.end_time || !scheduleData.session_duration) {
      return NextResponse.json(
        { success: false, error: "Missing required schedule fields" },
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

    // First check if schedule exists
    const { data: existingSchedule, error: checkError } = await supabase
      .from("coach_schedules")
      .select("id")
      .eq("id", scheduleId)
      .single();

    if (checkError || !existingSchedule) {
      return NextResponse.json(
        { success: false, error: "Schedule not found" },
        { status: 404 },
      );
    }

    // Update the schedule
    const { error: updateError } = await supabase
      .from("coach_schedules")
      .update({
        coach_id: scheduleData.coach_id,
        branch_id: scheduleData.branch_id,
        day_of_week: scheduleData.day_of_week,
        start_time: scheduleData.start_time,
        end_time: scheduleData.end_time,
        session_duration: scheduleData.session_duration
      })
      .eq("id", scheduleId);

    if (updateError) {
      console.error("Error updating schedule:", updateError);
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Schedule updated successfully"
    });
  } catch (error) {
    console.error("Error in update-schedule:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: `Server error: ${errorMessage}` },
      { status: 500 },
    );
  }
} 