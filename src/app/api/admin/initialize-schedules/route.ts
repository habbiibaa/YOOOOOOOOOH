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
      const newBranchId = uuidv4();
      const { error: createBranchError } = await supabase
        .from("branches")
        .insert({
          id: newBranchId,
          name: "Royal British School",
          location: "New Cairo",
          address: "Royal British School, New Cairo",
          is_members_only: false
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

    // Define coach data to create
    const coachesToCreate = [
      { name: "Ahmed Fakhry", email: "ahmed.fakhry@squash.academy" },
      { name: "Ahmed Mahrous", email: "ahmed.mahrous@squash.academy" },
      { name: "Ahmed Magdy", email: "ahmed.magdy@squash.academy" },
      { name: "Alaa Taha", email: "alaa.taha@squash.academy" },
      { name: "Omar Zaki", email: "omar.zaki@squash.academy" },
      { name: "Abdullah", email: "abdullah@squash.academy" }
    ];

    const createdCoaches = [];
    
    // Create coaches if they don't exist
    for (const coach of coachesToCreate) {
      // Check if coach exists by email
      const { data: existingCoach, error: coachCheckError } = await supabase
        .from("users")
        .select("id, full_name")
        .or(`email.eq.${coach.email},full_name.ilike.%${coach.name}%`)
        .eq("role", "coach")
        .maybeSingle();

      if (coachCheckError) {
        console.error(`Error checking coach ${coach.name}:`, coachCheckError);
        continue;
      }

      let coachId: string;

      if (!existingCoach) {
        // Create coach in users table
        const newCoachId = uuidv4();
        const { error: createUserError } = await supabase
          .from("users")
          .insert({
            id: newCoachId,
            full_name: coach.name,
            email: coach.email,
            role: "coach",
            approved: true
          });

        if (createUserError) {
          console.error(`Error creating user for coach ${coach.name}:`, createUserError);
          continue;
        }

        // Create coach in coaches table
        const { error: createCoachError } = await supabase
          .from("coaches")
          .insert({
            id: newCoachId,
            name: coach.name,
            specialties: ["Squash Training"],
            available_levels: ["Beginner", "Intermediate", "Advanced"],
            rating: 5.0
          });

        if (createCoachError) {
          console.error(`Error creating coach record for ${coach.name}:`, createCoachError);
          continue;
        }

        coachId = newCoachId;
      } else {
        coachId = existingCoach.id;
      }

      createdCoaches.push({
        id: coachId,
        name: coach.name
      });
    }

    // Default schedules for each coach
    const defaultSchedules = [
      {
        coach: "Ahmed Fakhry",
        days: ["Sunday", "Tuesday"],
        start_time: "15:30",
        end_time: "21:00",
        session_duration: 45
      },
      {
        coach: "Ahmed Mahrous",
        days: ["Saturday", "Tuesday"],
        start_time: "10:00",
        end_time: "21:30",
        session_duration: 45
      },
      {
        coach: "Alaa Taha",
        days: ["Monday", "Wednesday"],
        start_time: "15:30",
        end_time: "21:00",
        session_duration: 45
      },
      {
        coach: "Omar Zaki",
        days: ["Thursday", "Friday", "Saturday"],
        start_time: "10:00",
        end_time: "21:30",
        session_duration: 45
      },
      {
        coach: "Abdullah",
        days: ["Sunday", "Wednesday"],
        start_time: "15:30",
        end_time: "21:00",
        session_duration: 45
      },
      {
        coach: "Ahmed Magdy",
        days: ["Monday"],
        start_time: "15:30",
        end_time: "21:00",
        session_duration: 45
      }
    ];

    const createdSchedules = [];
    
    // Create schedules for each coach
    for (const schedule of defaultSchedules) {
      const coach = createdCoaches.find(c => c.name === schedule.coach);
      if (!coach) {
        console.error(`Coach ${schedule.coach} not found in created coaches`);
        continue;
      }

      for (const day of schedule.days) {
        // Check if schedule already exists
        const { data: existingSchedule, error: scheduleCheckError } = await supabase
          .from("coach_schedules")
          .select("id")
          .eq("coach_id", coach.id)
          .eq("branch_id", branchId)
          .eq("day_of_week", day)
          .maybeSingle();

        if (scheduleCheckError) {
          console.error(`Error checking schedule for ${coach.name} on ${day}:`, scheduleCheckError);
          continue;
        }

        if (!existingSchedule) {
          const { error: createScheduleError } = await supabase
            .from("coach_schedules")
            .insert({
              id: uuidv4(),
              coach_id: coach.id,
              branch_id: branchId,
              day_of_week: day,
              start_time: schedule.start_time,
              end_time: schedule.end_time,
              session_duration: schedule.session_duration
            });

          if (createScheduleError) {
            console.error(`Error creating schedule for ${coach.name} on ${day}:`, createScheduleError);
            continue;
          }

          createdSchedules.push({
            coach: coach.name,
            day,
            time: `${schedule.start_time} - ${schedule.end_time}`
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      branch: { id: branchId, name: "Royal British School" },
      coaches: createdCoaches,
      schedules: createdSchedules
    });
  } catch (error) {
    console.error("Error initializing schedules:", error);
    return NextResponse.json(
      { error: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 