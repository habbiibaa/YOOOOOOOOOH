"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/utils/supabase/client";
import { CreditCard, CheckCircle, XCircle } from "lucide-react";

interface PaymentFormProps {
  sessionId: string;
  sessionDate: string;
  sessionTime: string;
  coachName: string;
  branchName: string;
  sessionPrice: number;
  onPaymentComplete: (success: boolean) => void;
}

export default function PaymentForm({
  sessionId,
  sessionDate,
  sessionTime,
  coachName,
  branchName,
  sessionPrice,
  onPaymentComplete,
}: PaymentFormProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("credit_card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const formatCardNumber = (value: string) => {
    // Remove non-digit characters
    const digits = value.replace(/\D/g, "");
    // Format as xxxx xxxx xxxx xxxx
    const formatted = digits.replace(/(\d{4})(?=\d)/g, "$1 ");
    return formatted.substring(0, 19); // Limit to 16 digits + 3 spaces
  };

  const formatExpiryDate = (value: string) => {
    // Remove non-digit characters
    const digits = value.replace(/\D/g, "");
    // Format as MM/YY
    if (digits.length > 2) {
      return `${digits.substring(0, 2)}/${digits.substring(2, 4)}`;
    }
    return digits;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("You must be logged in to make a payment");
        setLoading(false);
        return;
      }

      // In a real app, you would integrate with a payment gateway here
      // For this demo, we'll simulate a successful payment

      // 1. Create a payment record
      const { data: paymentData, error: paymentError } = await supabase
        .from("payments")
        .insert([
          {
            user_id: user.id,
            session_id: sessionId,
            amount: sessionPrice,
            payment_method: paymentMethod,
            status: "completed",
            transaction_id: `txn_${Math.random().toString(36).substring(2, 15)}`,
            payment_date: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (paymentError) {
        throw paymentError;
      }

      // 2. Update the session payment status
      const { error: sessionError } = await supabase
        .from("coach_sessions")
        .update({
          status: "booked",
          player_id: user.id,
          payment_status: "paid",
        })
        .eq("id", sessionId);

      if (sessionError) {
        throw sessionError;
      }

      // Display success message
      setPaymentSuccess(true);
      onPaymentComplete(true);

      // Delay to show success message
      setTimeout(() => {
        setPaymentSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Payment error:", error);
      setError("Failed to process payment. Please try again.");
      onPaymentComplete(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <div className="flex items-center mb-4">
        <CreditCard className="h-6 w-6 text-red-500 mr-2" />
        <h3 className="text-xl font-bold text-white">Payment Required</h3>
      </div>

      <div className="mb-4 p-4 bg-gray-800 rounded-lg">
        <h4 className="text-lg font-semibold text-white mb-2">Session Details</h4>
        <div className="space-y-1 text-sm text-gray-300">
          <p><span className="text-gray-400">Coach:</span> {coachName}</p>
          <p><span className="text-gray-400">Date:</span> {sessionDate}</p>
          <p><span className="text-gray-400">Time:</span> {sessionTime}</p>
          <p><span className="text-gray-400">Location:</span> {branchName}</p>
          <p className="text-lg font-bold text-white mt-2">Total: ${sessionPrice}</p>
        </div>
      </div>

      {paymentSuccess ? (
        <div className="bg-green-900/20 border border-green-800 rounded-lg p-4 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
          <h4 className="text-lg font-semibold text-white mb-1">Payment Successful!</h4>
          <p className="text-green-300">Your session has been booked and confirmed.</p>
        </div>
      ) : error ? (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 mb-4">
          <div className="flex items-start">
            <XCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-red-300">{error}</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="payment-method" className="text-white mb-2 block">
                Payment Method
              </Label>
              <Select
                value={paymentMethod}
                onValueChange={setPaymentMethod}
              >
                <SelectTrigger
                  id="payment-method"
                  className="bg-gray-800 border-gray-700 text-white"
                >
                  <SelectValue placeholder="Select a payment method" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="apple_pay">Apple Pay</SelectItem>
                  <SelectItem value="cash">Cash (Pay at Location)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {paymentMethod === "credit_card" && (
              <>
                <div>
                  <Label htmlFor="card-number" className="text-white mb-2 block">
                    Card Number
                  </Label>
                  <Input
                    id="card-number"
                    placeholder="1234 5678 9012 3456"
                    className="bg-gray-800 border-gray-700 text-white"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    maxLength={19}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="card-name" className="text-white mb-2 block">
                    Name on Card
                  </Label>
                  <Input
                    id="card-name"
                    placeholder="John Doe"
                    className="bg-gray-800 border-gray-700 text-white"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiry" className="text-white mb-2 block">
                      Expiry Date
                    </Label>
                    <Input
                      id="expiry"
                      placeholder="MM/YY"
                      className="bg-gray-800 border-gray-700 text-white"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                      maxLength={5}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvv" className="text-white mb-2 block">
                      CVV
                    </Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      className="bg-gray-800 border-gray-700 text-white"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
                      maxLength={4}
                      type="password"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {paymentMethod === "paypal" && (
              <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4 text-center">
                <p className="text-blue-300 mb-2">You'll be redirected to PayPal to complete your payment.</p>
              </div>
            )}

            {paymentMethod === "apple_pay" && (
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
                <p className="text-gray-300 mb-2">Complete your payment with Apple Pay.</p>
              </div>
            )}

            {paymentMethod === "cash" && (
              <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-4">
                <p className="text-yellow-300 mb-2">
                  Please note: Your booking will be pending until payment is received at the location.
                  Payment must be made at least 30 minutes before your session.
                </p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              disabled={loading}
            >
              {loading ? "Processing..." : `Pay $${sessionPrice}`}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
} 