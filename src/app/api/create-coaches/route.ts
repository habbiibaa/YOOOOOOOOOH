import { createClient } from "../../../utils/supabase/server";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

// Interface for coach creation result
interface CoachResult {
  name: string;
  success: boolean;
  error?: string;
  message?: string;
  email?: string;
  password?: string;
  userId?: string;
  note?: string;
}

export async function GET() {
  try {
    const supabase = await createClient();
    const results: CoachResult[] = [];

    // Define list of coaches to create
    const coaches = [
      {
        name: "Ahmed Fakhry",
        email: "ahmed.fakhry@squashacademy.com",
      },
      {
        name: "Ahmed Mahrous",
        email: "ahmed.mahrous@squashacademy.com",
      },
      {
        name: "Ahmed Magdy",
        email: "ahmed.magdy@squashacademy.com",
      },
      {
        name: "Alaa Taha",
        email: "alaa.taha@squashacademy.com",
      },
      {
        name: "Ahmed Maher",
        email: "ahmed.maher@squashacademy.com",
      },
      {
        name: "Omar Zaki",
        email: "omar.zaki@squashacademy.com",
      },
      {
        name: "Abdelrahman Dahy",
        email: "abdelrahman.dahy@squashacademy.com",
      },
    ];

    // Process coaches sequentially
    for (const coach of coaches) {
      const result = await processCoach(supabase, coach.name, coach.email);
      results.push(result);
      // Add a delay between coach creations to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return NextResponse.json({
      success: true,
      message: "Coach creation process completed",
      results,
      summary: {
        total: coaches.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }
    });
  } catch (error) {
    console.error("Error in coach creation API:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Error processing coach creation",
        error: error.message 
      },
      { status: 500 },
    );
  }
}

// Helper function to process a single coach
async function processCoach(supabase, name, email): Promise<CoachResult> {
  try {
    // Generate a random password
    const password = `Coach${Math.floor(1000 + Math.random() * 9000)}!`;
    
    // Step 1: Create auth user first using Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          name: name,
          role: "coach"
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
      },
    });

    if (authError) {
      console.error(`Error creating auth user for coach ${name}:`, authError);
      return {
        name,
        success: false,
        error: authError.message,
        message: `Failed to create auth user: ${authError.message}`,
      };
    }

    // Wait for auth user to be properly created
    await new Promise(resolve => setTimeout(resolve, 1000));

    const userId = authData.user?.id;
    
    if (!userId) {
      return {
        name,
        success: false,
        error: "No user ID returned from authentication",
        message: "Failed to get user ID after authentication",
      };
    }

    // Step 2: Create user record with the auth user ID
    const { error: userError } = await supabase.from("users").upsert(
      {
        id: userId,
        email: email,
        full_name: name,
        role: "coach",
        created_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    if (userError) {
      console.error(`Error creating user for coach ${name}:`, userError.message);
      return {
        name,
        success: false,
        error: userError.message,
        message: `Failed to create user: ${userError.message}`,
      };
    }

    // Step 3: Create coach record with same ID
    const { error: coachError } = await supabase.from("coaches").upsert(
      {
        id: userId,
        name: name,
        specialties: ["Squash Training"],
        available_levels: ["Beginner", "Intermediate", "Advanced"],
        rating: 5.0
      },
      { onConflict: "id" }
    );

    if (coachError) {
      console.error(`Error creating coach ${name}:`, coachError.message);
      return {
        name,
        success: false,
        error: coachError.message,
        message: `Failed to create coach: ${coachError.message}`,
        userId,
      };
    }

    // Step 4: Get default branch (Royal British School) or create one if it doesn't exist
    let branchId;
    
    const { data: branchData, error: branchError } = await supabase
      .from("branches")
      .select("id")
      .eq("name", "Royal British School")
      .maybeSingle();
    
    if (branchError || !branchData) {
      // Create default branch if it doesn't exist
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
        console.error(`Error creating branch for coach ${name}:`, createBranchError);
        return {
          name,
          success: true,
          message: "Coach created but failed to create branch",
          email,
          password,
          userId,
          note: `Error creating branch: ${createBranchError.message}`,
        };
      } else {
        branchId = newBranchId;
      }
    } else {
      branchId = branchData.id;
    }
    
    // Step 5: Create coach schedules
    if (branchId) {
      try {
        // Create default coach schedule (Monday and Wednesday 4:30 PM - 8:30 PM)
        const scheduleEntries = [
          {
            id: uuidv4(), // Explicitly generate a UUID
            coach_id: userId,
            branch_id: branchId,
            day_of_week: "Monday",
            start_time: "16:30",
            end_time: "20:30",
            session_duration: 45
          },
          {
            id: uuidv4(), // Explicitly generate a UUID
            coach_id: userId,
            branch_id: branchId,
            day_of_week: "Wednesday",
            start_time: "16:30",
            end_time: "20:30",
            session_duration: 45
          }
        ];
        
        for (const schedule of scheduleEntries) {
          const { error: scheduleError } = await supabase
            .from("coach_schedules")
            .insert(schedule);
          
          if (scheduleError) {
            console.error(`Error creating schedule for coach ${name}:`, scheduleError);
            return {
              name,
              success: true,
              message: "Coach created but failed to create schedule",
              email,
              password,
              userId,
              note: `Error creating schedule: ${scheduleError.message}`,
            };
          }
        }
      } catch (scheduleErr) {
        console.error(`Exception processing schedule for ${name}:`, scheduleErr);
        return {
          name,
          success: true,
          message: "Coach created but exception in schedule creation",
          email,
          password,
          userId,
          note: `Schedule exception: ${scheduleErr instanceof Error ? scheduleErr.message : "Unknown error"}`,
        };
      }
    }

    return {
      name,
      success: true,
      message: "Coach account created successfully",
      email,
      password,
      userId,
    };
  } catch (err) {
    console.error(`Exception creating coach ${name}:`, err);
    return {
      name,
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
      message: `Exception: ${err instanceof Error ? err.message : "Unknown error"}`,
    };
  }
} 