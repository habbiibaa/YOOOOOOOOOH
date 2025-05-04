"use client";

import { useState, useEffect } from "react";
import ExperienceAssessment from "./experience-assessment";
import SubscriptionPlans from "./subscription-plans";
import BookSession from "./book-session";
import { SubscriptionPlan } from "@/app/actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { Calendar, Users, Video, Clock } from "lucide-react";

interface EnhancedBookingSystemProps {
  userId: string;
  userEmail: string;
  userName: string;
  playerLevel: number | null;
}

export default function EnhancedBookingSystem({
  userId,
  userEmail,
  userName,
  playerLevel,
}: EnhancedBookingSystemProps) {
  const [currentStep, setCurrentStep] = useState<number>(
    playerLevel ? 2 : 1
  );
  const [recommendedLevel, setRecommendedLevel] = useState<number | null>(
    playerLevel
  );
  const [needsAssessment, setNeedsAssessment] = useState<boolean>(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
    null
  );
  const [bookingComplete, setBookingComplete] = useState<boolean>(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const supabase = createClient();

  const handleAssessmentComplete = (
    level: number,
    shouldBookAssessment: boolean
  ) => {
    setRecommendedLevel(level);
    setNeedsAssessment(shouldBookAssessment);
    setCurrentStep(2);
  };

  const handlePlanSelected = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setCurrentStep(3);
  };

  const handleBookingComplete = async () => {
    setBookingComplete(true);
    
    // In a real app, you'd create a subscription record in your database
    if (selectedPlan) {
      try {
        const { error } = await supabase
          .from("players")
          .update({
            subscription: selectedPlan.id,
          })
          .eq("id", userId);
          
        if (error) {
          console.error("Error saving subscription:", error);
          setBookingError("Failed to save your subscription. Please contact support.");
        }
      } catch (err) {
        console.error("Error updating player subscription:", err);
      }
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <ExperienceAssessment
            userId={userId}
            email={userEmail}
            name={userName}
            onAssessmentComplete={handleAssessmentComplete}
          />
        );
      case 2:
        return (
          <SubscriptionPlans
            onSelectPlan={handlePlanSelected}
            recommendedLevel={recommendedLevel}
          />
        );
      case 3:
        return (
          <div className="w-full">
            <BookSession onBookingComplete={handleBookingComplete} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-500">
          Ramy Ashour Squash Academy Booking
        </h1>
        <p className="text-gray-400 mt-2 max-w-2xl mx-auto">
          Book your squash training sessions with our professional coaches
        </p>
      </div>

      {bookingComplete ? (
        <div className="bg-gray-900 p-8 rounded-xl shadow-lg max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Booking Successful!
          </h2>
          <p className="text-gray-300 mb-6">
            Your training session has been booked successfully. You can view your
            upcoming sessions in your dashboard.
          </p>
          {bookingError && (
            <div className="mb-6 p-4 bg-red-900/30 border border-red-800 rounded-md text-red-200">
              {bookingError}
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => window.location.href = "/dashboard"}
            >
              Go to Dashboard
            </Button>
            <Button
              variant="outline"
              className="border-red-600 text-red-600 hover:bg-red-950"
              onClick={() => {
                setBookingComplete(false);
                setCurrentStep(3);
              }}
            >
              Book Another Session
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-8">
            <div className="max-w-3xl mx-auto">
              <div className="relative">
                <div
                  className="absolute inset-0 flex items-center"
                  aria-hidden="true"
                >
                  <div className="w-full border-t border-gray-700" />
                </div>
                <div className="relative flex justify-between">
                  <div className="flex items-center">
                    <span
                      className={`${
                        currentStep >= 1
                          ? "bg-red-600 text-white"
                          : "bg-gray-800 text-gray-400"
                      } h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium`}
                    >
                      1
                    </span>
                    <span
                      className={`ml-2 text-sm font-medium ${
                        currentStep >= 1 ? "text-white" : "text-gray-500"
                      }`}
                    >
                      Assessment
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span
                      className={`${
                        currentStep >= 2
                          ? "bg-red-600 text-white"
                          : "bg-gray-800 text-gray-400"
                      } h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium`}
                    >
                      2
                    </span>
                    <span
                      className={`ml-2 text-sm font-medium ${
                        currentStep >= 2 ? "text-white" : "text-gray-500"
                      }`}
                    >
                      Subscription
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span
                      className={`${
                        currentStep >= 3
                          ? "bg-red-600 text-white"
                          : "bg-gray-800 text-gray-400"
                      } h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium`}
                    >
                      3
                    </span>
                    <span
                      className={`ml-2 text-sm font-medium ${
                        currentStep >= 3 ? "text-white" : "text-gray-500"
                      }`}
                    >
                      Book Sessions
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Features */}
          {currentStep === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-900 rounded-xl shadow p-6 border border-gray-800">
                <div className="flex flex-col items-center text-center">
                  <Calendar className="h-12 w-12 text-red-500 mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">Flexible Scheduling</h3>
                  <p className="text-gray-400">Book sessions with your preferred coach at convenient times</p>
                </div>
              </div>
              <div className="bg-gray-900 rounded-xl shadow p-6 border border-gray-800">
                <div className="flex flex-col items-center text-center">
                  <Video className="h-12 w-12 text-red-500 mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">Video Analysis</h3>
                  <p className="text-gray-400">Submit videos for professional analysis and improvement tips</p>
                </div>
              </div>
              <div className="bg-gray-900 rounded-xl shadow p-6 border border-gray-800">
                <div className="flex flex-col items-center text-center">
                  <Clock className="h-12 w-12 text-red-500 mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">45-Minute Sessions</h3>
                  <p className="text-gray-400">Perfect length for focused training and skill development</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
            {renderStepContent()}
          </div>
          
          {currentStep > 1 && (
            <div className="mt-6 flex justify-start">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                Back
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 