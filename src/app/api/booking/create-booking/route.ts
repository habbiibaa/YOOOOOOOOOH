import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const supabase = createClient();

    // Verify authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get booking data from request
    const { coach_id, court_id, session_date, start_time, end_time, booking_type } = await request.json();
    
    if (!coach_id || !court_id || !session_date || !start_time || !end_time || !booking_type) {
      return NextResponse.json({ error: "Missing required booking information" }, { status: 400 });
    }

    // Check if the coach is available at the requested time
    const dayOfWeek = new Date(session_date).toLocaleDateString('en-US', { weekday: 'long' });
    
    const { data: coachSchedule, error: scheduleError } = await supabase
      .from("coach_schedules")
      .select("*")
      .eq("coach_id", coach_id)
      .eq("day_of_week", dayOfWeek)
      .eq("is_available", true)
      .single();

    if (scheduleError || !coachSchedule) {
      return NextResponse.json({ error: "Coach is not available at this time" }, { status: 400 });
    }

    // Check if there's any conflicting booking
    const { data: existingBooking, error: bookingError } = await supabase
      .from("booking_sessions")
      .select("*")
      .eq("coach_id", coach_id)
      .eq("session_date", session_date)
      .or("status.eq.pending,status.eq.booked")
      .overlaps('timerange', `[${start_time},${end_time}]`)
      .maybeSingle();

    if (bookingError) {
      return NextResponse.json({ error: "Failed to check availability" }, { status: 500 });
    }

    if (existingBooking) {
      return NextResponse.json({ error: "This time slot is already booked" }, { status: 409 });
    }

    // Create the booking
    const { data: booking, error: createError } = await supabase
      .from("booking_sessions")
      .insert({
        coach_id,
        player_id: user.id,
        court_id,
        session_date,
        start_time,
        end_time,
        status: "pending",
        booking_type
      })
      .select()
      .single();

    if (createError) {
      return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
    }

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.error("Error in create-booking:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const supabase = createClient();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const coach_id = searchParams.get('coach_id');
    const date = searchParams.get('date');

    if (!coach_id || !date) {
      return NextResponse.json({ error: "Coach ID and date are required" }, { status: 400 });
    }

    // Get coach's schedule for the day
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    
    const { data: schedule, error: scheduleError } = await supabase
      .from("coach_schedules")
      .select("*")
      .eq("coach_id", coach_id)
      .eq("day_of_week", dayOfWeek)
      .eq("is_available", true)
      .single();

    if (scheduleError) {
      return NextResponse.json({ error: "Failed to fetch coach schedule" }, { status: 500 });
    }

    if (!schedule) {
      return NextResponse.json({ error: "Coach is not available on this day" }, { status: 404 });
    }

    // Get existing bookings for the day
    const { data: bookings, error: bookingsError } = await supabase
      .from("booking_sessions")
      .select("*")
      .eq("coach_id", coach_id)
      .eq("session_date", date)
      .or("status.eq.pending,status.eq.booked");

    if (bookingsError) {
      return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
    }

    return NextResponse.json({
      schedule,
      existing_bookings: bookings
    });
  } catch (error) {
    console.error("Error in get-availability:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}
