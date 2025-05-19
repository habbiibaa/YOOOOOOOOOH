"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle, Clock, CreditCard, Wallet, Banknote, QrCode } from "lucide-react";
import { useRouter } from "next/navigation";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface PaymentFormProps {
  sessionDetails: any;
  paymentId: string;
  userId: string;
  expiresAt: string;
  onPaymentSuccess: (data: any) => void;
  onPaymentCancel: () => void;
}

type PaymentMethod = 'vodafone_cash' | 'fawry' | 'bank_transfer' | 'credit_card';

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
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('credit_card');
  const [paymentDetails, setPaymentDetails] = useState({
    phoneNumber: "",
    cardNumber: "",
    cardholderName: "",
    expiryDate: "",
    cvv: "",
    bankAccount: ""
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
    
    switch (name) {
      case "cardNumber":
        formattedValue = value.replace(/\s/g, "").replace(/(\d{4})/g, "$1 ").trim().slice(0, 19);
        break;
      case "expiryDate":
        formattedValue = value.replace(/\//g, "").replace(/^(\d{2})(\d{0,2})/, function(match, p1, p2) {
          return p2 ? `${p1}/${p2}` : p1;
        }).slice(0, 5);
        break;
      case "cvv":
        formattedValue = value.replace(/\D/g, "").slice(0, 4);
        break;
      case "phoneNumber":
        formattedValue = value.replace(/\D/g, "").slice(0, 11);
        break;
      case "bankAccount":
        formattedValue = value.replace(/\D/g, "").slice(0, 24);
        break;
    }
    
    setPaymentDetails({
      ...paymentDetails,
      [name]: formattedValue
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (timeRemaining <= 0) {
      setErrorMessage("Your reservation has expired. Please try booking again.");
      return;
    }
    
    // Validate based on payment method
    let isValid = true;
    switch (selectedPaymentMethod) {
      case 'credit_card':
        isValid = !!(paymentDetails.cardNumber && paymentDetails.cardholderName && 
                    paymentDetails.expiryDate && paymentDetails.cvv);
        break;
      case 'vodafone_cash':
        isValid = !!(paymentDetails.phoneNumber);
        break;
      case 'bank_transfer':
        isValid = !!(paymentDetails.bankAccount);
        break;
      case 'fawry':
        // Fawry doesn't need additional details
        isValid = true;
        break;
    }
    
    if (!isValid) {
      setErrorMessage("Please fill in all required payment details");
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
          paymentMethod: selectedPaymentMethod,
          paymentDetails
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
            <AlertTriangle className="mr-2" /> Reservation Expired
          </CardTitle>
          <CardDescription>Your session reservation has expired</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
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
        <CardTitle>Complete Your Payment</CardTitle>
        <CardDescription>
          Session with {sessionDetails.coach_name} on {new Date(sessionDetails.session_date).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {errorMessage && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
          
          <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-amber-600 mr-2" />
              <span className="text-sm text-amber-800">
                Time remaining: {formattedTime}
              </span>
            </div>
            <span className="text-lg font-bold text-amber-800">
              EGP {sessionDetails.price || '0.00'}
            </span>
          </div>

          <div className="space-y-4">
            <Label>Select Payment Method</Label>
            <RadioGroup
              value={selectedPaymentMethod}
              onValueChange={(value) => setSelectedPaymentMethod(value as PaymentMethod)}
              className="grid grid-cols-2 gap-4"
            >
              <div>
                <RadioGroupItem
                  value="credit_card"
                  id="credit_card"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="credit_card"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <CreditCard className="mb-3 h-6 w-6" />
                  <span>Credit Card</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="vodafone_cash"
                  id="vodafone_cash"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="vodafone_cash"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <Wallet className="mb-3 h-6 w-6" />
                  <span>Vodafone Cash</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="fawry"
                  id="fawry"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="fawry"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <QrCode className="mb-3 h-6 w-6" />
                  <span>Fawry</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="bank_transfer"
                  id="bank_transfer"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="bank_transfer"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <Banknote className="mb-3 h-6 w-6" />
                  <span>Bank Transfer</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {selectedPaymentMethod === 'credit_card' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    name="cardNumber"
                    value={paymentDetails.cardNumber}
                    onChange={handleInputChange}
                    placeholder="1234 5678 9012 3456"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cardholderName">Cardholder Name</Label>
                  <Input
                    id="cardholderName"
                    name="cardholderName"
                    value={paymentDetails.cardholderName}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      name="expiryDate"
                      value={paymentDetails.expiryDate}
                      onChange={handleInputChange}
                      placeholder="MM/YY"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      name="cvv"
                      value={paymentDetails.cvv}
                      onChange={handleInputChange}
                      placeholder="123"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {selectedPaymentMethod === 'vodafone_cash' && (
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Vodafone Cash Number</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  value={paymentDetails.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="01XXXXXXXXX"
                  required
                />
              </div>
            )}

            {selectedPaymentMethod === 'bank_transfer' && (
              <div className="space-y-2">
                <Label htmlFor="bankAccount">Bank Account Number</Label>
                <Input
                  id="bankAccount"
                  name="bankAccount"
                  value={paymentDetails.bankAccount}
                  onChange={handleInputChange}
                  placeholder="Enter your bank account number"
                  required
                />
              </div>
            )}

            {selectedPaymentMethod === 'fawry' && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  You will be redirected to Fawry's payment page. Please complete the payment there.
                </p>
              </div>
            )}

            <div className="flex space-x-2 pt-4">
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
                className="flex-1"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-white/60 border-t-white rounded-full" />
                    Processing...
                  </>
                ) : "Pay Now"}
              </Button>
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  );
} 