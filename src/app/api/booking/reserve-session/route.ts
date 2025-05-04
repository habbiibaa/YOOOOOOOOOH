import { createClient } from "../../../../utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

// This endpoint temporarily reserves a session slot for a user while they complete payment
export async function POST(request: NextRequest) {
  try {
    const { sessionId, userId, paymentAmount } = await request.json();

    if (!sessionId || !userId) {
      return NextResponse.json(
        { success: false, error: "Session ID and User ID are required" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 },
      );
    }

    // Verify the current user is the one making the reservation
    if (currentUser.id !== userId) {
      return NextResponse.json(
        { success: false, error: "User ID mismatch" },
        { status: 403 },
      );
    }

    // Check if the session exists and is available
    const { data: sessionData, error: sessionError } = await supabase
      .from("coach_sessions")
      .select("*")
      .eq("id", sessionId)
      .eq("status", "available")
      .single();

    if (sessionError || !sessionData) {
      return NextResponse.json(
        { success: false, error: "Session not found or not available" },
        { status: 404 },
      );
    }

    // Calculate expiration time (15 minutes from now)
    const expirationTime = new Date();
    expirationTime.setMinutes(expirationTime.getMinutes() + 15);

    // Create a payment record
    const paymentId = uuidv4();
    const { error: paymentError } = await supabase
      .from("payments")
      .insert({
        id: paymentId,
        user_id: userId,
        session_id: sessionId,
        amount: paymentAmount || 0,
        status: "pending",
        created_at: new Date().toISOString(),
        expires_at: expirationTime.toISOString(),
      });

    if (paymentError) {
      console.error("Error creating payment record:", paymentError);
      return NextResponse.json(
        { success: false, error: "Failed to create payment record" },
        { status: 500 },
      );
    }

    // Update session status to "reserved"
    const { error: updateError } = await supabase
      .from("coach_sessions")
      .update({
        status: "reserved",
        user_id: userId,
        reserved_at: new Date().toISOString(),
        reservation_expires_at: expirationTime.toISOString(),
      })
      .eq("id", sessionId);

    if (updateError) {
      console.error("Error updating session status:", updateError);
      return NextResponse.json(
        { success: false, error: "Failed to reserve session" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      paymentId,
      message: "Session reserved for payment",
      expiresAt: expirationTime.toISOString(),
    });
  } catch (error) {
    console.error("Error in reserve-session:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: `Server error: ${errorMessage}` },
      { status: 500 },
    );
  }
} 