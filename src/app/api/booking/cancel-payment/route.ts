import { createClient } from "../../../../utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// This endpoint cancels a pending payment and releases the reserved session
export async function POST(request: NextRequest) {
  try {
    const { paymentId, userId } = await request.json();

    if (!paymentId || !userId) {
      return NextResponse.json(
        { success: false, error: "Payment ID and User ID are required" },
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

    // Verify the current user is the one canceling the payment
    if (currentUser.id !== userId) {
      return NextResponse.json(
        { success: false, error: "User ID mismatch" },
        { status: 403 },
      );
    }

    // Check if the payment record exists and is still pending
    const { data: paymentData, error: paymentError } = await supabase
      .from("payments")
      .select("*")
      .eq("id", paymentId)
      .eq("user_id", userId)
      .eq("status", "pending")
      .single();

    if (paymentError || !paymentData) {
      return NextResponse.json(
        { success: false, error: "Payment not found or already processed" },
        { status: 404 },
      );
    }

    const now = new Date();

    // Update payment status to cancelled
    const { error: updatePaymentError } = await supabase
      .from("payments")
      .update({ 
        status: "cancelled",
        updated_at: now.toISOString(),
      })
      .eq("id", paymentId);

    if (updatePaymentError) {
      console.error("Error updating payment record:", updatePaymentError);
      return NextResponse.json(
        { success: false, error: "Failed to update payment record" },
        { status: 500 },
      );
    }

    // Release the session reservation
    const { error: updateSessionError } = await supabase
      .from("coach_sessions")
      .update({ 
        status: "available",
        user_id: null,
        reserved_at: null,
        reservation_expires_at: null
      })
      .eq("id", paymentData.session_id);

    if (updateSessionError) {
      console.error("Error updating session status:", updateSessionError);
      return NextResponse.json(
        { success: false, error: "Failed to release session reservation" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Payment cancelled and session released"
    });
  } catch (error) {
    console.error("Error in cancel-payment:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: `Server error: ${errorMessage}` },
      { status: 500 },
    );
  }
} 