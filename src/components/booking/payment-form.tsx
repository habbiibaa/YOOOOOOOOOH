import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, ExclamationTriangle, Clock, CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";

interface PaymentFormProps {
  sessionDetails: any;
  paymentId: string;
  userId: string;
  expiresAt: string;
  onPaymentSuccess: (data: any) => void;
  onPaymentCancel: () => void;
}

export default function PaymentForm({
  sessionDetails,
  paymentId,
  userId,
  expiresAt,
  onPaymentSuccess,
  onPaymentCancel
}: PaymentFormProps) {
  const router = useRouter();
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [formattedTime, setFormattedTime] = useState<string>("00:00");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardholderName: "",
    expiryDate: "",
    cvv: ""
  });

  // Calculate and update time remaining
  useEffect(() => {
    if (!expiresAt) return;
    
    const calculateTimeRemaining = () => {
      const now = new Date();
      const expiryTime = new Date(expiresAt);
      const diff = Math.max(0, Math.floor((expiryTime.getTime() - now.getTime()) / 1000));
      
      setTimeRemaining(diff);
      
      const minutes = Math.floor(diff / 60);
      const seconds = diff % 60;
      setFormattedTime(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      
      return diff;
    };
    
    // Initial calculation
    const initialTimeRemaining = calculateTimeRemaining();
    
    // If already expired
    if (initialTimeRemaining <= 0) {
      handleExpiry();
      return;
    }
    
    // Set up interval to update countdown
    const intervalId = setInterval(() => {
      const remaining = calculateTimeRemaining();
      if (remaining <= 0) {
        handleExpiry();
        clearInterval(intervalId);
      }
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [expiresAt]);

  const handleExpiry = async () => {
    setErrorMessage("Your reservation has expired. Please try booking again.");
    try {
      // Cancel the payment to clean up the database
      await fetch('/api/booking/cancel-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentId, userId }),
      });
    } catch (error) {
      console.error("Error cancelling expired payment:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;
    
    // Format card number with spaces
    if (name === "cardNumber") {
      formattedValue = value.replace(/\s/g, "").replace(/(\d{4})/g, "$1 ").trim().slice(0, 19);
    }
    
    // Format expiry date with slash
    if (name === "expiryDate") {
      formattedValue = value.replace(/\//g, "").replace(/^(\d{2})(\d{0,2})/, function(match, p1, p2) {
        return p2 ? `${p1}/${p2}` : p1;
      }).slice(0, 5);
    }
    
    // Limit CVV to 3 or 4 digits
    if (name === "cvv") {
      formattedValue = value.replace(/\D/g, "").slice(0, 4);
    }
    
    setCardDetails({
      ...cardDetails,
      [name]: formattedValue
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (timeRemaining <= 0) {
      setErrorMessage("Your reservation has expired. Please try booking again.");
      return;
    }
    
    // Basic validation
    if (!cardDetails.cardNumber || !cardDetails.cardholderName || !cardDetails.expiryDate || !cardDetails.cvv) {
      setErrorMessage("Please fill in all card details");
      return;
    }
    
    setIsProcessing(true);
    setErrorMessage("");
    
    try {
      const response = await fetch('/api/booking/process-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId,
          userId,
          cardDetails
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Payment processing failed");
      }
      
      // Payment successful
      setPaymentSuccess(true);
      onPaymentSuccess(data);
      
    } catch (error) {
      console.error("Payment error:", error);
      setErrorMessage(error instanceof Error ? error.message : "Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    try {
      setIsProcessing(true);
      const response = await fetch('/api/booking/cancel-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentId, userId }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to cancel payment");
      }
      
      onPaymentCancel();
    } catch (error) {
      console.error("Cancel error:", error);
      setErrorMessage(error instanceof Error ? error.message : "Failed to cancel. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (paymentSuccess) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center text-green-600">
            <CheckCircle className="mr-2" /> Payment Successful
          </CardTitle>
          <CardDescription>Your booking has been confirmed!</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle>Booking Confirmed</AlertTitle>
            <AlertDescription>
              Your session has been booked successfully. You can view your booking details in your dashboard.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={() => router.push('/dashboard/my-sessions')}
          >
            View My Sessions
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (errorMessage && timeRemaining <= 0) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center text-amber-600">
            <ExclamationTriangle className="mr-2" /> Reservation Expired
          </CardTitle>
          <CardDescription>Your session reservation has expired</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <ExclamationTriangle className="h-4 w-4" />
            <AlertTitle>Reservation Time Expired</AlertTitle>
            <AlertDescription>
              {errorMessage}
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={() => router.push('/dashboard/book-session')}
          >
            Book Another Session
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Complete Payment</CardTitle>
          <div className="flex items-center text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-sm">
            <Clock className="h-4 w-4 mr-1" /> {formattedTime}
          </div>
        </div>
        <CardDescription>
          Your session is reserved for a limited time. Please complete payment before the timer expires.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {errorMessage && (
          <Alert variant="destructive" className="mb-4">
            <ExclamationTriangle className="h-4 w-4" />
            <AlertTitle>Payment Error</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        
        <div className="mb-4 p-3 bg-slate-50 rounded-lg">
          <h3 className="font-medium text-sm text-slate-500 mb-1">Session Details</h3>
          <p className="font-medium">{sessionDetails?.coach_name || 'Coach'}</p>
          <p className="text-sm text-slate-700">{sessionDetails?.day_of_week || 'Day'}, {sessionDetails?.start_time || '--:--'} - {sessionDetails?.end_time || '--:--'}</p>
          <p className="text-sm text-slate-700">{sessionDetails?.branch_name || 'Branch'}</p>
          <div className="mt-2 pt-2 border-t border-slate-200 flex justify-between">
            <span className="font-medium">Total:</span>
            <span className="font-bold">${sessionDetails?.price || '0.00'}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                name="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={cardDetails.cardNumber}
                onChange={handleInputChange}
                maxLength={19}
                disabled={isProcessing}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cardholderName">Cardholder Name</Label>
              <Input
                id="cardholderName"
                name="cardholderName"
                placeholder="John Doe"
                value={cardDetails.cardholderName}
                onChange={handleInputChange}
                disabled={isProcessing}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  name="expiryDate"
                  placeholder="MM/YY"
                  value={cardDetails.expiryDate}
                  onChange={handleInputChange}
                  maxLength={5}
                  disabled={isProcessing}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  name="cvv"
                  type="text"
                  inputMode="numeric"
                  placeholder="123"
                  value={cardDetails.cvv}
                  onChange={handleInputChange}
                  maxLength={4}
                  disabled={isProcessing}
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 mt-6">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1"
              onClick={handleCancel}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 gap-2"
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Pay Now"}
              <CreditCard className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 