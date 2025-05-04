"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { AlertCircle, AlertTriangle, RefreshCw } from "lucide-react";

type ErrorType = 
  | "session_not_available" 
  | "coach_not_available" 
  | "payment_failed" 
  | "database_error" 
  | "conflict" 
  | "unknown";

interface BookingErrorHandlerProps {
  error: ErrorType | null;
  message?: string;
  sessionId?: string;
  onRetry?: () => void;
  onClose: () => void;
  showDialog: boolean;
}

export default function BookingErrorHandler({
  error, 
  message, 
  sessionId,
  onRetry,
  onClose,
  showDialog
}: BookingErrorHandlerProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [errorDetails, setErrorDetails] = useState<{
    title: string;
    description: string;
    isRecoverable: boolean;
  }>({
    title: "Booking Error",
    description: "An unknown error occurred during the booking process.",
    isRecoverable: false
  });

  useEffect(() => {
    if (!error) return;
    
    // Set error details based on error type
    switch(error) {
      case "session_not_available":
        setErrorDetails({
          title: "Session No Longer Available",
          description: message || "This session has already been booked by another player or is no longer available.",
          isRecoverable: false
        });
        break;
      case "coach_not_available":
        setErrorDetails({
          title: "Coach Unavailable",
          description: message || "The selected coach is no longer available for this time slot.",
          isRecoverable: false
        });
        break;
      case "payment_failed":
        setErrorDetails({
          title: "Payment Failed",
          description: message || "We couldn't process your payment. Please try again or use a different payment method.",
          isRecoverable: true
        });
        break;
      case "database_error":
        setErrorDetails({
          title: "System Error",
          description: message || "There was a problem with our database while processing your booking.",
          isRecoverable: true
        });
        break;
      case "conflict":
        setErrorDetails({
          title: "Booking Conflict",
          description: message || "There is a conflict with your booking. You may already have another session at this time.",
          isRecoverable: false
        });
        break;
      default:
        setErrorDetails({
          title: "Unexpected Error",
          description: message || "An unexpected error occurred while processing your booking. Please try again later.",
          isRecoverable: true
        });
    }
  }, [error, message]);

  const handleReleaseSession = async () => {
    if (!sessionId) return;
    
    setLoading(true);
    try {
      // If the session was partially booked, release it back to available
      const { error: updateError } = await supabase
        .from("coach_sessions")
        .update({ status: "available", player_id: null })
        .eq("id", sessionId);
        
      if (updateError) {
        console.error("Error releasing session:", updateError);
      }
    } catch (err) {
      console.error("Exception releasing session:", err);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  const handleRetry = () => {
    setLoading(true);
    
    // If onRetry is provided, call it
    if (onRetry) {
      onRetry();
    } else {
      // Otherwise just release the session and close
      handleReleaseSession();
    }
    
    setLoading(false);
  };

  return (
    <Dialog open={showDialog} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-500">
            <AlertTriangle className="h-5 w-5" />
            {errorDetails.title}
          </DialogTitle>
          <DialogDescription>
            {errorDetails.description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-red-950/20 p-4 rounded-md border border-red-900/50 text-sm text-red-200 flex gap-3 items-start mt-2">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium mb-1">Troubleshooting Steps:</p>
            <ul className="list-disc ml-4 space-y-1">
              <li>Check your internet connection</li>
              <li>Refresh the page and try again</li>
              <li>Try booking a different time slot</li>
              {error === "payment_failed" && (
                <li>Verify your payment details are correct</li>
              )}
            </ul>
          </div>
        </div>
        
        <DialogFooter className="flex justify-between sm:justify-between gap-3 mt-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          
          {errorDetails.isRecoverable && (
            <Button 
              onClick={handleRetry}
              className="gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 