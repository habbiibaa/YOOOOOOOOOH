import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createClient();

    // Verify admin user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify admin role
    const { data: userInfo, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (userError || userInfo?.role !== 'admin') {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Get schedule data from request
    const { coach_id, schedules } = await request.json();
    
    if (!coach_id || !schedules || !Array.isArray(schedules)) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
    }

    // Validate coach exists
    const { data: coachData, error: coachError } = await supabase
      .from("users")
      .select("id")
      .eq("id", coach_id)
      .eq("role", "coach")
      .single();

    if (coachError || !coachData) {
      return NextResponse.json({ error: "Coach not found" }, { status: 404 });
    }

    // Update coach schedules
    const { error: upsertError } = await supabase
      .from("coach_schedules")
      .upsert(
        schedules.map(schedule => ({
          coach_id,
          day_of_week: schedule.day_of_week,
          start_time: schedule.start_time,
          end_time: schedule.end_time,
          is_available: schedule.is_available
        }))
      );

    if (upsertError) {
      return NextResponse.json({ error: "Failed to update schedule" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in manage-coach-schedule:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createClient();

    // Get coach_id from URL params
    const { searchParams } = new URL(request.url);
    const coach_id = searchParams.get('coach_id');

    if (!coach_id) {
      return NextResponse.json({ error: "Coach ID is required" }, { status: 400 });
    }

    // Get coach schedules
    const { data: schedules, error } = await supabase
      .from("coach_schedules")
      .select("*")
      .eq("coach_id", coach_id)
      .order("day_of_week");

    if (error) {
      return NextResponse.json({ error: "Failed to fetch schedules" }, { status: 500 });
    }

    return NextResponse.json({ schedules });
  } catch (error) {
    console.error("Error in fetch coach schedule:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}
