import { createClient } from "../../../../utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const { branchId } = await request.json();

    if (!branchId) {
      return NextResponse.json(
        { success: false, error: "Branch ID is required" },
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

    // Get coach schedules for the specified branch
    const { data: schedules, error: scheduleError } = await supabase
      .from("coach_schedules")
      .select("*")
      .eq("branch_id", branchId);

    if (scheduleError) {
      console.error("Error fetching coach schedules:", scheduleError);
      return NextResponse.json(
        { success: false, error: `Failed to fetch schedules: ${scheduleError.message}` },
        { status: 500 },
      );
    }

    if (!schedules || schedules.length === 0) {
      return NextResponse.json(
        { success: false, error: "No schedules found for this branch" },
        { status: 404 },
      );
    }

    // Generate sessions for the next 30 days
    const sessionsToCreate = [];
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 30);
    
    const dateMap = new Map();
    
    // Iterate through each day in the range
    for (let currentDate = new Date(startDate); currentDate <= endDate; currentDate.setDate(currentDate.getDate() + 1)) {
      const dayOfWeek = [
        "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
      ][currentDate.getDay()];
      
      // Find schedules for this day of the week
      const daySchedules = schedules.filter(
        schedule => schedule.day_of_week === dayOfWeek
      );
      
      // Iterate through each schedule for this day
      for (const schedule of daySchedules) {
        const sessionDate = new Date(currentDate);
        const dateString = sessionDate.toISOString().split('T')[0];
        
        // Create a unique key for this coach/date/time combination to avoid duplicates
        const sessionKey = `${schedule.coach_id}-${dateString}-${schedule.start_time}`;
        
        // Skip if we've already added this session
        if (dateMap.has(sessionKey)) continue;
        dateMap.set(sessionKey, true);
        
        sessionsToCreate.push({
          id: uuidv4(),
          coach_id: schedule.coach_id,
          branch_id: schedule.branch_id,
          coach_schedule_id: schedule.id,
          session_date: dateString,
          start_time: schedule.start_time,
          end_time: schedule.end_time,
          status: "available",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    }
    
    // If no sessions to create
    if (sessionsToCreate.length === 0) {
      return NextResponse.json(
        { success: true, message: "No new sessions to generate", count: 0 },
        { status: 200 },
      );
    }
    
    console.log(`Generating ${sessionsToCreate.length} sessions for branch ${branchId}`);
    
    // Delete existing sessions first (only future sessions)
    const today = new Date().toISOString().split('T')[0];
    const { error: deleteError } = await supabase
      .from("coach_sessions")
      .delete()
      .eq("branch_id", branchId)
      .gt("session_date", today)
      .eq("status", "available"); // Only delete available sessions
    
    if (deleteError) {
      console.error("Error deleting existing sessions:", deleteError);
      return NextResponse.json(
        { success: false, error: `Failed to clear existing sessions: ${deleteError.message}` },
        { status: 500 },
      );
    }
    
    // Insert new sessions in batches to avoid exceeding request size limits
    const batchSize = 100;
    let insertedCount = 0;
    
    for (let i = 0; i < sessionsToCreate.length; i += batchSize) {
      const batch = sessionsToCreate.slice(i, i + batchSize);
      const { data: insertedData, error: insertError } = await supabase
        .from("coach_sessions")
        .insert(batch)
        .select();
      
      if (insertError) {
        console.error(`Error inserting sessions batch ${i}:`, insertError);
        return NextResponse.json(
          { 
            success: false, 
            error: `Failed to insert sessions: ${insertError.message}`,
            partialCount: insertedCount
          },
          { status: 500 },
        );
      }
      
      insertedCount += insertedData ? insertedData.length : 0;
    }
    
    return NextResponse.json({
      success: true,
      message: `Successfully generated ${insertedCount} sessions`,
      count: insertedCount
    });
    
  } catch (error) {
    console.error("Error in generate-sessions:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: `Server error: ${errorMessage}` },
      { status: 500 },
    );
  }
} 