import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CalendarClock, Clock, AlertTriangle } from "lucide-react";
import PaymentForm from "./payment-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BookingModalProps {
  session: {
    id: string;
    coach_id: string;
    coach_name: string;
    branch_id: string;
    branch_name: string;
    session_date: string;
    start_time: string;
    end_time: string;
    session_duration: number;
    court: string;
    level: string;
    price: number;
  };
  userId: string;
  onClose: () => void;
  onSuccess: () => void;
}

enum BookingStep {
  CONFIRMATION,
  PAYMENT,
  SUCCESS
}

export default function BookingModal({ session, userId, onClose, onSuccess }: BookingModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<BookingStep>(BookingStep.CONFIRMATION);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [selectedLevel, setSelectedLevel] = useState<string>(session.level);
  const [levels, setLevels] = useState<any[]>([]);

  useEffect(() => {
    fetchLevels();
  }, []);

  const fetchLevels = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('training_levels')
        .select('*')
        .order('level_number');

      if (error) throw error;
      setLevels(data || []);
    } catch (error) {
      console.error('Error fetching levels:', error);
      toast.error('Failed to load training levels');
    }
  };

  const handleBookSession = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const supabase = createClient();

      // First, check if the session is still available
      const { data: sessionData, error: sessionError } = await supabase
        .from('coach_sessions')
        .select('status')
        .eq('id', session.id)
        .single();

      if (sessionError) throw sessionError;

      if (sessionData.status !== 'available') {
        toast.error('This session is no longer available');
        onClose();
        return;
      }

      // Create the booking
      const { error: bookingError } = await supabase
        .from('bookings')
        .insert({
          session_id: session.id,
          user_id: userId,
          status: 'pending',
          level: selectedLevel,
          price: session.price
        });

      if (bookingError) throw bookingError;

      // Update session status
      const { error: updateError } = await supabase
        .from('coach_sessions')
        .update({ status: 'booked' })
        .eq('id', session.id);

      if (updateError) throw updateError;

      toast.success('Session booked successfully!');
      onSuccess();
      router.push('/dashboard/player');
    } catch (error) {
      console.error('Error booking session:', error);
      toast.error('Failed to book session');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePaymentSuccess = (data: any) => {
    // Navigate to success step and refresh coach sessions
    setStep(BookingStep.SUCCESS);
    toast.success("Booking confirmed! Your session has been reserved.");
    if (onSuccess) {
      onSuccess();
    }
  };
  
  const handlePaymentCancel = () => {
    // Return to confirmation step and reset payment data
    setPaymentData(null);
    setStep(BookingStep.CONFIRMATION);
    toast.info("Payment cancelled. Your session was not reserved.");
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
              <DialogTitle>Book Training Session</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="coach" className="text-right">
                  Coach
                </Label>
                <div className="col-span-3">
                  <p className="text-sm">{session.coach_name}</p>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right">
                  Location
                </Label>
                <div className="col-span-3">
                  <p className="text-sm">{session.branch_name}</p>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">
                  Date
                </Label>
                <div className="col-span-3">
                  <p className="text-sm">{new Date(session.session_date).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="time" className="text-right">
                  Time
                </Label>
                <div className="col-span-3">
                  <p className="text-sm">
                    {new Date(`2000-01-01T${session.start_time}`).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })} - {new Date(`2000-01-01T${session.end_time}`).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="level" className="text-right">
                  Level
                </Label>
                <div className="col-span-3">
                  <Select
                    value={selectedLevel}
                    onValueChange={setSelectedLevel}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {levels.map((level) => (
                        <SelectItem key={level.id} value={level.level_number.toString()}>
                          {level.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">
                  Price
                </Label>
                <div className="col-span-3">
                  <p className="text-sm font-medium">EGP {session.price}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button onClick={handleBookSession} disabled={isLoading}>
                {isLoading ? 'Booking...' : 'Confirm Booking'}
              </Button>
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
    <Dialog open={true} onOpenChange={(isOpen) => !isOpen && handleCloseModal()}>
      <DialogContent className={step === BookingStep.PAYMENT ? "sm:max-w-md p-0" : "sm:max-w-md"}>
        {renderStepContent()}
      </DialogContent>
    </Dialog>
  );
} 