import { createClient } from "./supabase/client";

export type BookingErrorType = 
  | "session_not_available" 
  | "coach_not_available" 
  | "payment_failed" 
  | "database_error" 
  | "conflict" 
  | "not_authenticated"
  | "unknown";

export interface BookingError {
  type: BookingErrorType;
  message: string;
  recoverable: boolean;
  sessionId?: string;
}

/**
 * Verifies that a session is available for booking
 * @param sessionId The ID of the session to verify
 * @returns Object with status and error if applicable
 */
export const verifySessionAvailability = async (sessionId: string): Promise<{ 
  available: boolean; 
  error?: BookingError;
}> => {
  const supabase = createClient();
  
  try {
    // First check authentication
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        available: false,
        error: {
          type: "not_authenticated",
          message: "You must be logged in to book a session",
          recoverable: false,
        }
      };
    }
    
    // Verify the session is available
    const { data: sessionData, error: sessionError } = await supabase
      .from("coach_sessions")
      .select("status, coach_id, session_date, start_time")
      .eq("id", sessionId)
      .single();
      
    if (sessionError) {
      console.error("Error checking session:", sessionError);
      return {
        available: false,
        error: {
          type: "database_error",
          message: "Could not verify session availability due to a system error",
          recoverable: true,
          sessionId
        }
      };
    }
    
    if (!sessionData) {
      return {
        available: false,
        error: {
          type: "session_not_available",
          message: "The requested session does not exist",
          recoverable: false,
        }
      };
    }
    
    if (sessionData.status !== "available") {
      return {
        available: false,
        error: {
          type: "session_not_available",
          message: `This session is not available (current status: ${sessionData.status})`,
          recoverable: false,
          sessionId
        }
      };
    }
    
    // Check for schedule conflicts
    const { data: conflicts, error: conflictError } = await supabase
      .from("coach_sessions")
      .select("id")
      .eq("session_date", sessionData.session_date)
      .eq("start_time", sessionData.start_time)
      .eq("status", "booked")
      .eq("player_id", user.id);
      
    if (conflictError) {
      console.error("Error checking for conflicts:", conflictError);
    } else if (conflicts && conflicts.length > 0) {
      return {
        available: false,
        error: {
          type: "conflict",
          message: "You already have a session booked at this time",
          recoverable: false,
          sessionId
        }
      };
    }
    
    // All checks passed
    return { available: true };
    
  } catch (error) {
    console.error("Exception in verifySessionAvailability:", error);
    return {
      available: false,
      error: {
        type: "unknown",
        message: "An unexpected error occurred while verifying session availability",
        recoverable: true,
        sessionId
      }
    };
  }
};

/**
 * Reserves a session temporarily while payment is processed
 * @param sessionId The ID of the session to reserve
 * @returns Object with status and error if applicable
 */
export const reserveSession = async (sessionId: string): Promise<{
  success: boolean;
  error?: BookingError;
}> => {
  const supabase = createClient();
  
  try {
    // First verify the session is available
    const { available, error: verifyError } = await verifySessionAvailability(sessionId);
    
    if (!available) {
      return { success: false, error: verifyError };
    }
    
    // Reserve the session
    const { error: updateError } = await supabase
      .from("coach_sessions")
      .update({ status: "pending" })
      .eq("id", sessionId);
      
    if (updateError) {
      console.error("Error reserving session:", updateError);
      return {
        success: false,
        error: {
          type: "database_error",
          message: "Could not reserve this session. Please try again.",
          recoverable: true,
          sessionId
        }
      };
    }
    
    return { success: true };
    
  } catch (error) {
    console.error("Exception in reserveSession:", error);
    return {
      success: false,
      error: {
        type: "unknown",
        message: "An unexpected error occurred while reserving the session",
        recoverable: true,
        sessionId
      }
    };
  }
};

/**
 * Confirms a booking after payment is complete
 * @param sessionId The ID of the session to confirm
 * @returns Object with status and error if applicable
 */
export const confirmBooking = async (sessionId: string): Promise<{
  success: boolean;
  error?: BookingError;
}> => {
  const supabase = createClient();
  
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        success: false,
        error: {
          type: "not_authenticated",
          message: "You must be logged in to confirm a booking",
          recoverable: false,
        }
      };
    }
    
    // Check the session status
    const { data: sessionData, error: sessionError } = await supabase
      .from("coach_sessions")
      .select("status")
      .eq("id", sessionId)
      .single();
      
    if (sessionError) {
      console.error("Error checking session status:", sessionError);
      return {
        success: false,
        error: {
          type: "database_error",
          message: "Could not verify session status due to a system error",
          recoverable: true,
          sessionId
        }
      };
    }
    
    if (!sessionData) {
      return {
        success: false,
        error: {
          type: "session_not_available",
          message: "The requested session does not exist",
          recoverable: false,
        }
      };
    }
    
    if (sessionData.status !== "pending") {
      // The session is not in pending status
      return {
        success: false,
        error: {
          type: "session_not_available",
          message: `This session is not pending confirmation (current status: ${sessionData.status})`,
          recoverable: false,
          sessionId
        }
      };
    }
    
    // Confirm the booking
    const { error: updateError } = await supabase
      .from("coach_sessions")
      .update({ 
        status: "booked",
        player_id: user.id,
        booked_at: new Date().toISOString()
      })
      .eq("id", sessionId);
      
    if (updateError) {
      console.error("Error confirming booking:", updateError);
      return {
        success: false,
        error: {
          type: "database_error",
          message: "Could not confirm your booking due to a system error",
          recoverable: true,
          sessionId
        }
      };
    }
    
    return { success: true };
    
  } catch (error) {
    console.error("Exception in confirmBooking:", error);
    return {
      success: false,
      error: {
        type: "unknown",
        message: "An unexpected error occurred while confirming your booking",
        recoverable: true,
        sessionId
      }
    };
  }
};

/**
 * Releases a session back to available status
 * @param sessionId The ID of the session to release
 * @returns Object with status and error if applicable
 */
export const releaseSession = async (sessionId: string): Promise<{
  success: boolean;
  error?: BookingError;
}> => {
  const supabase = createClient();
  
  try {
    // Release the session back to available
    const { error: updateError } = await supabase
      .from("coach_sessions")
      .update({ 
        status: "available",
        player_id: null
      })
      .eq("id", sessionId);
      
    if (updateError) {
      console.error("Error releasing session:", updateError);
      return {
        success: false,
        error: {
          type: "database_error",
          message: "Could not release this session due to a system error",
          recoverable: false,
          sessionId
        }
      };
    }
    
    return { success: true };
    
  } catch (error) {
    console.error("Exception in releaseSession:", error);
    return {
      success: false,
      error: {
        type: "unknown",
        message: "An unexpected error occurred while releasing the session",
        recoverable: false,
        sessionId
      }
    };
  }
};

/**
 * Cancels a booked session
 * @param sessionId The ID of the session to cancel
 * @returns Object with status and error if applicable
 */
export const cancelBooking = async (sessionId: string): Promise<{
  success: boolean;
  error?: BookingError;
}> => {
  const supabase = createClient();
  
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        success: false,
        error: {
          type: "not_authenticated",
          message: "You must be logged in to cancel a booking",
          recoverable: false,
        }
      };
    }
    
    // Check if the session belongs to the user
    const { data: sessionData, error: sessionError } = await supabase
      .from("coach_sessions")
      .select("status, player_id")
      .eq("id", sessionId)
      .single();
      
    if (sessionError) {
      console.error("Error checking session:", sessionError);
      return {
        success: false,
        error: {
          type: "database_error",
          message: "Could not verify session ownership due to a system error",
          recoverable: true,
          sessionId
        }
      };
    }
    
    if (!sessionData) {
      return {
        success: false,
        error: {
          type: "session_not_available",
          message: "The requested session does not exist",
          recoverable: false,
        }
      };
    }
    
    if (sessionData.status !== "booked") {
      return {
        success: false,
        error: {
          type: "session_not_available",
          message: `This session cannot be cancelled (current status: ${sessionData.status})`,
          recoverable: false,
          sessionId
        }
      };
    }
    
    if (sessionData.player_id !== user.id) {
      return {
        success: false,
        error: {
          type: "not_authenticated",
          message: "You can only cancel your own bookings",
          recoverable: false,
          sessionId
        }
      };
    }
    
    // Cancel the booking
    const { error: updateError } = await supabase
      .from("coach_sessions")
      .update({ 
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
        cancelled_by: user.id
      })
      .eq("id", sessionId);
      
    if (updateError) {
      console.error("Error cancelling booking:", updateError);
      return {
        success: false,
        error: {
          type: "database_error",
          message: "Could not cancel your booking due to a system error",
          recoverable: true,
          sessionId
        }
      };
    }
    
    return { success: true };
    
  } catch (error) {
    console.error("Exception in cancelBooking:", error);
    return {
      success: false,
      error: {
        type: "unknown",
        message: "An unexpected error occurred while cancelling your booking",
        recoverable: true,
        sessionId
      }
    };
  }
}; 