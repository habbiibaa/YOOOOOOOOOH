import { createClient } from "../../../../utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// This endpoint simulates a payment gateway processing
export async function POST(request: NextRequest) {
  try {
    const { paymentId, userId, cardDetails } = await request.json();

    if (!paymentId || !userId) {
      return NextResponse.json(
        { success: false, error: "Payment ID and User ID are required" },
        { status: 400 },
      );
    }

    // Basic validation for card details (in a real scenario, this would be handled by the payment gateway)
    if (!cardDetails || !cardDetails.cardNumber || !cardDetails.expiryDate || !cardDetails.cvv) {
      return NextResponse.json(
        { success: false, error: "Complete card details are required" },
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

    // Verify the current user is the one making the payment
    if (currentUser.id !== userId) {
      return NextResponse.json(
        { success: false, error: "User ID mismatch" },
        { status: 403 },
      );
    }

    // Check if the payment record exists and is still valid
    const { data: paymentData, error: paymentError } = await supabase
      .from("payments")
      .select("*, coach_sessions(*)")
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

    // Check if payment has expired
    const now = new Date();
    const expiryDate = new Date(paymentData.expires_at);
    if (now > expiryDate) {
      // Update payment status to expired
      await supabase
        .from("payments")
        .update({ status: "expired" })
        .eq("id", paymentId);

      // Release the session reservation
      await supabase
        .from("coach_sessions")
        .update({ 
          status: "available",
          user_id: null,
          reserved_at: null,
          reservation_expires_at: null
        })
        .eq("id", paymentData.session_id);

      return NextResponse.json(
        { success: false, error: "Payment reservation has expired" },
        { status: 400 },
      );
    }

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate payment success (95% success rate) - in real scenario, this would be the payment gateway response
    const isPaymentSuccessful = Math.random() < 0.95;

    if (!isPaymentSuccessful) {
      // Update payment status to failed
      await supabase
        .from("payments")
        .update({ 
          status: "failed",
          updated_at: now.toISOString(),
          payment_details: JSON.stringify({
            message: "Payment declined by issuing bank",
            code: "CARD_DECLINED",
            timestamp: now.toISOString()
          })
        })
        .eq("id", paymentId);

      // Release the session reservation
      await supabase
        .from("coach_sessions")
        .update({ 
          status: "available",
          user_id: null,
          reserved_at: null,
          reservation_expires_at: null
        })
        .eq("id", paymentData.session_id);

      return NextResponse.json(
        { success: false, error: "Payment was declined. Please try another payment method." },
        { status: 400 },
      );
    }

    // Payment successful - update payment record
    const { error: updatePaymentError } = await supabase
      .from("payments")
      .update({ 
        status: "completed",
        updated_at: now.toISOString(),
        payment_details: JSON.stringify({
          message: "Payment successful",
          transactionId: `tr_${Math.random().toString(36).substring(2, 15)}`,
          timestamp: now.toISOString()
        })
      })
      .eq("id", paymentId);

    if (updatePaymentError) {
      console.error("Error updating payment record:", updatePaymentError);
      return NextResponse.json(
        { success: false, error: "Failed to update payment record" },
        { status: 500 },
      );
    }

    // Update session status to booked
    const { error: updateSessionError } = await supabase
      .from("coach_sessions")
      .update({ 
        status: "booked",
        reserved_at: null,
        reservation_expires_at: null,
        booked_at: now.toISOString()
      })
      .eq("id", paymentData.session_id);

    if (updateSessionError) {
      console.error("Error updating session status:", updateSessionError);
      return NextResponse.json(
        { success: false, error: "Failed to update session status" },
        { status: 500 },
      );
    }

    // Create a booking record
    const { error: bookingError } = await supabase
      .from("bookings")
      .insert({
        user_id: userId,
        session_id: paymentData.session_id,
        payment_id: paymentId,
        status: "confirmed",
        created_at: now.toISOString()
      });

    if (bookingError) {
      console.error("Error creating booking record:", bookingError);
      return NextResponse.json(
        { success: false, error: "Payment successful but booking failed to finalize" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Payment successful",
      paymentId,
      sessionId: paymentData.session_id,
      receipt: {
        transactionId: `tr_${Math.random().toString(36).substring(2, 15)}`,
        amount: paymentData.amount,
        date: now.toISOString(),
        sessionDetails: paymentData.coach_sessions
      }
    });
  } catch (error) {
    console.error("Error in process-payment:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: `Server error: ${errorMessage}` },
      { status: 500 },
    );
  }
} 