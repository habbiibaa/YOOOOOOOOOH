import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExclamationTriangle, CalendarClock, Clock } from "lucide-react";
import PaymentForm from "./payment-form";
import { useRouter } from "next/navigation";

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  session: any;
  userId: string;
}

enum BookingStep {
  CONFIRMATION,
  PAYMENT,
  SUCCESS
}

export default function BookingModal({ open, onClose, session, userId }: BookingModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<BookingStep>(BookingStep.CONFIRMATION);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<any>(null);
  
  const handleBookSession = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/booking/reserve-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: session.id,
          userId,
          paymentAmount: session.price || 0,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to reserve session");
      }
      
      setPaymentData(data);
      setStep(BookingStep.PAYMENT);
    } catch (error) {
      console.error("Booking error:", error);
      setError(error instanceof Error ? error.message : "Failed to reserve session");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePaymentSuccess = (data: any) => {
    // Navigate to success step and refresh coach sessions
    setStep(BookingStep.SUCCESS);
    router.refresh(); // Refresh the page data to update session availability
  };
  
  const handlePaymentCancel = () => {
    // Return to confirmation step and reset payment data
    setPaymentData(null);
    setStep(BookingStep.CONFIRMATION);
    router.refresh(); // Refresh the page data to update session availability
  };
  
  const handleCloseModal = () => {
    // Reset all state
    setStep(BookingStep.CONFIRMATION);
    setPaymentData(null);
    setError(null);
    onClose();
  };
  
  const renderStepContent = () => {
    switch (step) {
      case BookingStep.CONFIRMATION:
        return (
          <>
            <DialogHeader>
              <DialogTitle>Book Session</DialogTitle>
            </DialogHeader>
            <div className="p-4 space-y-4">
              {error && (
                <Alert variant="destructive">
                  <ExclamationTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="border rounded-lg p-4 space-y-2">
                <div className="font-medium">{session.coach_name || 'Coach'}</div>
                <div className="flex items-center text-sm text-gray-500">
                  <CalendarClock className="h-4 w-4 mr-2" />
                  <span>{session.day_of_week || 'Day'}, {session.start_time || '--:--'} - {session.end_time || '--:--'}</span>
                </div>
                <div className="text-sm text-gray-500">{session.branch_name || 'Branch'}</div>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>{session.session_duration || 60} minutes</span>
                </div>
                
                <div className="flex justify-between items-center pt-2 mt-2 border-t">
                  <span className="font-medium">Total:</span>
                  <span className="font-bold">${session.price || '0.00'}</span>
                </div>
              </div>
              
              <div className="text-sm text-gray-500">
                To secure this session, you'll need to complete the payment process. The slot will be temporarily reserved for you during payment.
              </div>
              
              <div className="flex space-x-2 pt-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={handleCloseModal}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1"
                  onClick={handleBookSession}
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : "Continue to Payment"}
                </Button>
              </div>
            </div>
          </>
        );
        
      case BookingStep.PAYMENT:
        return (
          <div className="p-0">
            <PaymentForm
              sessionDetails={session}
              paymentId={paymentData.paymentId}
              userId={userId}
              expiresAt={paymentData.expiresAt}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentCancel={handlePaymentCancel}
            />
          </div>
        );
        
      case BookingStep.SUCCESS:
        return (
          <>
            <DialogHeader>
              <DialogTitle>Booking Confirmed</DialogTitle>
            </DialogHeader>
            <div className="p-4 space-y-4">
              <div className="text-center py-4">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                  <svg
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Payment Successful</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Your session has been successfully booked.
                </p>
              </div>
              
              <div className="flex flex-col space-y-2">
                <Button onClick={() => router.push('/dashboard/my-sessions')}>
                  View My Sessions
                </Button>
                <Button variant="outline" onClick={handleCloseModal}>
                  Close
                </Button>
              </div>
            </div>
          </>
        );
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleCloseModal()}>
      <DialogContent className={step === BookingStep.PAYMENT ? "sm:max-w-md p-0" : "sm:max-w-md"}>
        {renderStepContent()}
      </DialogContent>
    </Dialog>
  );
} 