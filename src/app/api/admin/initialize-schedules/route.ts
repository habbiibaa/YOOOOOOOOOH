import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Create Royal British School branch if it doesn't exist
    let branchId: string;
    const { data: existingBranch, error: branchCheckError } = await supabase
      .from("branches")
      .select("id")
      .eq("name", "Royal British School")
      .maybeSingle();

    if (branchCheckError) {
      return NextResponse.json(
        { error: `Error checking branch: ${branchCheckError.message}` },
        { status: 500 }
      );
    }

    if (!existingBranch) {
      // Create the branch
      const newBranchId = uuidv4();
      const { error: createBranchError } = await supabase
        .from("branches")
        .insert({
          id: newBranchId,
          name: "Royal British School",
          location: "New Cairo",
          address: "Royal British School, New Cairo",
          is_members_only: false,
        });

      if (createBranchError) {
        return NextResponse.json(
          { error: `Error creating branch: ${createBranchError.message}` },
          { status: 500 }
        );
      }

      branchId = newBranchId;
    } else {
      branchId = existingBranch.id;
    }

    // Get all coaches that exist in the users table
    const { data: existingCoaches, error: coachesError } = await supabase
      .from("users")
      .select("id, full_name, email")
      .eq("role", "coach");

    if (coachesError) {
      return NextResponse.json(
        { error: `Error fetching coaches: ${coachesError.message}` },
        { status: 500 }
      );
    }

    // Get existing schedules to avoid duplicates
    const { data: existingSchedules, error: schedulesError } = await supabase
      .from("coach_schedules")
      .select("coach_id, branch_id, day_of_week");

    if (schedulesError) {
      return NextResponse.json(
        { error: `Error fetching existing schedules: ${schedulesError.message}` },
        { status: 500 }
      );
    }

    // Schedule data by coach name
    const scheduleData = {
      "Ahmed Fakhry": [
        { day: "Sunday", startTime: "16:30", endTime: "21:45", duration: 45 },
        { day: "Tuesday", startTime: "16:30", endTime: "21:45", duration: 45 }
      ],
      "Ahmed Mahrous": [
        { day: "Saturday", startTime: "10:00", endTime: "21:30", duration: 45 },
        { day: "Tuesday", startTime: "16:30", endTime: "21:45", duration: 45 }
      ],
      "Alaa Taha": [
        { day: "Monday", startTime: "16:30", endTime: "21:45", duration: 45 }
      ],
      "Ahmed Maher": [
        { day: "Sunday", startTime: "16:30", endTime: "21:45", duration: 45 },
        { day: "Wednesday", startTime: "15:30", endTime: "21:30", duration: 45 }
      ],
      "Omar Zaki": [
        { day: "Thursday", startTime: "15:30", endTime: "21:30", duration: 45 },
        { day: "Friday", startTime: "13:30", endTime: "16:30", duration: 45 },
        { day: "Saturday", startTime: "10:00", endTime: "21:30", duration: 45 }
      ],
      "Abdelrahman Dahy": [
        { day: "Monday", startTime: "16:30", endTime: "21:45", duration: 45 },
        { day: "Wednesday", startTime: "15:30", endTime: "21:30", duration: 45 }
      ]
    };

    // Track results and errors
    const results = {
      success: 0,
      errors: [] as string[],
      createdSchedules: [] as any[],
      missingCoaches: [] as string[]
    };

    // Process each coach
    for (const [coachName, schedules] of Object.entries(scheduleData)) {
      // Find the coach ID from existing coaches
      const coach = existingCoaches?.find(c => 
        c.full_name?.toLowerCase() === coachName.toLowerCase()
      );

      if (!coach) {
        results.missingCoaches.push(coachName);
        continue;
      }

      const coachId = coach.id;

      // Create schedules for this coach
      for (const schedule of schedules) {
        // Check if this schedule already exists
        const isDuplicate = existingSchedules?.some(
          es => 
            es.coach_id === coachId && 
            es.branch_id === branchId && 
            es.day_of_week === schedule.day
        );

        if (isDuplicate) {
          console.log(`Schedule for ${coachName} on ${schedule.day} already exists, skipping`);
          continue;
        }

        // Create a new schedule
        const scheduleId = uuidv4();
        const { error: createError } = await supabase
          .from("coach_schedules")
          .insert({
            id: scheduleId,
            coach_id: coachId,
            branch_id: branchId,
            day_of_week: schedule.day,
            start_time: schedule.startTime,
            end_time: schedule.endTime,
            session_duration: schedule.duration,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (createError) {
          results.errors.push(`Error creating schedule for ${coachName} on ${schedule.day}: ${createError.message}`);
        } else {
          results.success++;
          results.createdSchedules.push({
            coach: coachName,
            day: schedule.day,
            time: `${schedule.startTime} - ${schedule.endTime}`
          });
        }
      }
    }

    // Now generate sessions based on these schedules
    if (results.success > 0) {
      try {
        const { error: generateError } = await supabase.rpc('regenerate_coach_sessions_for_next_days', {
          days_to_generate: 30
        });
        
        if (generateError) {
          results.errors.push(`Error generating sessions: ${generateError.message}`);
        }
      } catch (error) {
        results.errors.push(`Exception generating sessions: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Created ${results.success} schedules successfully`,
      results
    });
  } catch (error) {
    console.error("Error in initialize-schedules:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: `Unexpected error: ${error instanceof Error ? error.message : String(error)}` 
      },
      { status: 500 }
    );
  }
} 