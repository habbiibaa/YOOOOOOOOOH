"use client";

import { useState, useEffect } from "react";
import { createClient } from "../../utils/supabase/client";
import { Calendar, Clock, User, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import PaymentForm from "./payment-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import BookingErrorHandler from "../booking-error-handler";

type Coach = {
  id: string;
  name: string;
  specialization: string;
  hourly_rate: number;
  years_experience: number;
  avatar_url?: string | null;
  schedules?: {
    day: string;
    start_time: string;
    end_time: string;
  }[];
};

type TimeSlot = {
  id: string;
  coach_id: string;
  branch_id: string;
  session_date: string;
  start_time: string;
  end_time: string;
  status: string;
  branch_name: string;
};

type Branch = {
  id: string;
  name: string;
  location: string;
};

interface BookSessionProps {
  onBookingComplete?: () => void;
}

export default function BookSession({ onBookingComplete }: BookSessionProps) {
  const supabase = createClient();
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [filteredTimeSlots, setFilteredTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCoach, setSelectedCoach] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [selectedSlotCoach, setSelectedSlotCoach] = useState<Coach | null>(null);
  const [errorType, setErrorType] = useState<"session_not_available" | "coach_not_available" | "payment_failed" | "database_error" | "conflict" | "unknown" | null>(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);

  // Fetch coaches, branches, and available time slots
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch coaches
        const { data: coachesData, error: coachesError } = await supabase.from(
          "coaches",
        ).select(`
            id,
            specialization,
            years_experience,
            hourly_rate,
            users:users!coaches_id_fkey(id, full_name, avatar_url),
            schedules:coach_schedules(day, start_time, end_time)
          `);

        if (coachesError) throw coachesError;

        if (coachesData) {
          const formattedCoaches = coachesData.map((coach) => ({
            id: coach.id,
            name: coach.users?.full_name || "Unknown Coach",
            specialization: coach.specialization,
            hourly_rate: coach.hourly_rate,
            years_experience: coach.years_experience,
            avatar_url: coach.users?.avatar_url,
            schedules: coach.schedules,
          }));
          setCoaches(formattedCoaches);
        }

        // Fetch branches
        const { data: branchesData, error: branchesError } = await supabase
          .from("branches")
          .select("id, name, location");

        if (branchesError) throw branchesError;

        if (branchesData) {
          setBranches(branchesData);
        }

        // Fetch available time slots
        const { data: slotsData, error: slotsError } = await supabase
          .from("coach_sessions")
          .select(
            `
            id,
            coach_id,
            branch_id,
            session_date,
            start_time,
            end_time,
            status,
            branch:branches(name)
          `,
          )
          .eq("status", "available");

        if (slotsError) throw slotsError;

        if (slotsData) {
          const formattedSlots = slotsData.map((slot) => ({
            id: slot.id,
            coach_id: slot.coach_id,
            branch_id: slot.branch_id,
            session_date: slot.session_date,
            start_time: slot.start_time,
            end_time: slot.end_time,
            status: slot.status,
            branch_name: slot.branch?.name || "Unknown Branch",
          }));
          setTimeSlots(formattedSlots);
          setFilteredTimeSlots(formattedSlots);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [supabase]);

  // Filter time slots based on selected criteria
  useEffect(() => {
    let filtered = [...timeSlots];

    if (selectedCoach) {
      filtered = filtered.filter((slot) => slot.coach_id === selectedCoach);
    }

    if (selectedBranch) {
      filtered = filtered.filter((slot) => slot.branch_id === selectedBranch);
    }

    if (selectedDate) {
      filtered = filtered.filter((slot) => slot.session_date === selectedDate);
    }

    if (selectedTime) {
      // Filter by time range (e.g., morning, afternoon, evening)
      const [hour] = selectedTime.split(":").map(Number);
      if (selectedTime === "morning") {
        filtered = filtered.filter((slot) => {
          const [slotHour] = slot.start_time.split(":").map(Number);
          return slotHour >= 6 && slotHour < 12;
        });
      } else if (selectedTime === "afternoon") {
        filtered = filtered.filter((slot) => {
          const [slotHour] = slot.start_time.split(":").map(Number);
          return slotHour >= 12 && slotHour < 17;
        });
      } else if (selectedTime === "evening") {
        filtered = filtered.filter((slot) => {
          const [slotHour] = slot.start_time.split(":").map(Number);
          return slotHour >= 17 && slotHour < 22;
        });
      } else {
        // Specific time
        filtered = filtered.filter((slot) => slot.start_time === selectedTime);
      }
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((slot) => {
        const coach = coaches.find((c) => c.id === slot.coach_id);
        return (
          coach?.name.toLowerCase().includes(query) ||
          coach?.specialization.toLowerCase().includes(query) ||
          slot.branch_name.toLowerCase().includes(query)
        );
      });
    }

    setFilteredTimeSlots(filtered);
  }, [
    timeSlots,
    selectedCoach,
    selectedBranch,
    selectedDate,
    selectedTime,
    searchQuery,
    coaches,
  ]);

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    return new Date(0, 0, 0, hours, minutes).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  // Get unique dates from available time slots
  const getUniqueDates = () => {
    const dates = timeSlots.map((slot) => slot.session_date);
    return [...new Set(dates)].sort();
  };

  // Get unique times from available time slots
  const getUniqueTimes = () => {
    const times = timeSlots.map((slot) => slot.start_time);
    return [...new Set(times)].sort();
  };

  // Initialize booking process
  const initBookSession = async (slot: TimeSlot) => {
    try {
      setSelectedSlot(slot);
      
      // Find coach data
      const coach = coaches.find((c) => c.id === slot.coach_id);
      setSelectedSlotCoach(coach || null);
      
      // Verify the slot is still available before proceeding
      const { data: currentSlot, error: slotCheckError } = await supabase
        .from("coach_sessions")
        .select("status")
        .eq("id", slot.id)
        .single();
        
      if (slotCheckError) {
        console.error("Error checking slot availability:", slotCheckError);
        setErrorType("database_error");
        setBookingError("Could not verify slot availability due to a system error.");
        setShowErrorDialog(true);
        return;
      }
      
      if (!currentSlot || currentSlot.status !== "available") {
        setErrorType("session_not_available");
        setBookingError("This session is no longer available. It may have been booked by another player.");
        setShowErrorDialog(true);
        return;
      }
      
      // Check for booking conflicts (user already has a session at this time)
      const { data: userSessions, error: conflictError } = await supabase
        .from("coach_sessions")
        .select("id")
        .eq("session_date", slot.session_date)
        .eq("start_time", slot.start_time)
        .eq("status", "booked")
        .eq("player_id", (await supabase.auth.getUser()).data.user?.id || "");
        
      if (conflictError) {
        console.error("Error checking booking conflicts:", conflictError);
      } else if (userSessions && userSessions.length > 0) {
        setErrorType("conflict");
        setBookingError("You already have a session booked at this time.");
        setShowErrorDialog(true);
        return;
      }
      
      // Mark session as pending while payment is processed
      const { error: updateError } = await supabase
        .from("coach_sessions")
        .update({ status: "pending" })
        .eq("id", slot.id);
        
      if (updateError) {
        console.error("Error updating session status:", updateError);
        setErrorType("database_error");
        setBookingError("Could not reserve this session temporarily. Please try again.");
        setShowErrorDialog(true);
        return;
      }
      
      // Proceed to payment
      setShowPaymentModal(true);
    } catch (error) {
      console.error("Error initiating booking:", error);
      setErrorType("unknown");
      setBookingError("An unexpected error occurred while starting the booking process.");
      setShowErrorDialog(true);
    }
  };

  // Handle payment completion
  const handlePaymentComplete = async (success: boolean) => {
    setShowPaymentModal(false);
    
    if (!selectedSlot) return;
    
    try {
      if (success) {
        // Confirm the booking
        const { error: bookingError } = await supabase
          .from("coach_sessions")
          .update({
            status: "booked",
            player_id: (await supabase.auth.getUser()).data.user?.id,
          })
          .eq("id", selectedSlot.id);
          
        if (bookingError) {
          console.error("Error confirming booking:", bookingError);
          setErrorType("database_error");
          setBookingError("Your payment was successful, but we couldn't confirm your booking. Please contact support.");
          setShowErrorDialog(true);
          return;
        }
        
        if (onBookingComplete) {
          onBookingComplete();
        }
      } else {
        // Payment failed - release the session
        const { error: releaseError } = await supabase
          .from("coach_sessions")
          .update({ status: "available" })
          .eq("id", selectedSlot.id);
          
        if (releaseError) {
          console.error("Error releasing session after payment failure:", releaseError);
        }
        
        setErrorType("payment_failed");
        setBookingError("Your payment could not be processed. The session has been released.");
        setShowErrorDialog(true);
      }
    } catch (error) {
      console.error("Error processing payment result:", error);
      setErrorType("unknown");
      setBookingError("An unexpected error occurred while finalizing your booking.");
      setShowErrorDialog(true);
    }
  };

  // Refresh available sessions
  const refreshAvailableSessions = async () => {
    try {
      const { data: updatedSlots, error: fetchError } = await supabase
        .from("coach_sessions")
        .select(
          `
          id,
          coach_id,
          branch_id,
          session_date,
          start_time,
          end_time,
          status,
          branch:branches(name)
        `,
        )
        .eq("status", "available");

      if (fetchError) throw fetchError;

      if (updatedSlots) {
        const formattedSlots = updatedSlots.map((slot) => ({
          id: slot.id,
          coach_id: slot.coach_id,
          branch_id: slot.branch_id,
          session_date: slot.session_date,
          start_time: slot.start_time,
          end_time: slot.end_time,
          status: slot.status,
          branch_name: slot.branch?.name || "Unknown Branch",
        }));
        setTimeSlots(formattedSlots);
        setFilteredTimeSlots(formattedSlots);
      }
    } catch (error) {
      console.error("Error refreshing sessions:", error);
    }
  };

  const getCoachScheduleInfo = (coachId: string) => {
    const coach = coaches.find(c => c.id === coachId);
    if (!coach) return "";
    
    if (coach.name === "Ahmed Fakhry") {
      return "Sunday & Tuesday: 4:30 PM - 9:45 PM";
    } else if (coach.name === "Ahmed Mahrous") {
      return "Saturday: 10:00 AM - 9:30 PM, Tuesday: 4:30 PM - 9:45 PM";
    } else if (coach.name === "Ahmed Magdy") {
      return "Monday: 4:30 PM - 9:45 PM";
    } else if (coach.name === "Alaa Taha") {
      return "Monday: 4:30 PM - 9:45 PM";
    } else if (coach.name === "Ahmed Maher") {
      return "Sunday: 4:30 PM - 9:45 PM, Wednesday: 3:30 PM - 9:30 PM";
    } else if (coach.name === "Omar Zaki") {
      return "Thursday: 3:30 PM - 9:30 PM, Friday: 1:30 PM - 4:30 PM, Saturday: 10:00 AM - 9:30 PM";
    } else if (coach.name === "Hussien Amr") {
      return "Wednesday: 3:30 PM - 9:30 PM";
    }
    
    return "Schedule not available";
  };

  const handleCloseErrorDialog = () => {
    setShowErrorDialog(false);
    setErrorType(null);
    setBookingError(null);
    
    // Refresh available sessions when an error dialog is closed
    refreshAvailableSessions();
  };

  const retryBooking = () => {
    if (selectedSlot) {
      setShowErrorDialog(false);
      initBookSession(selectedSlot);
    } else {
      handleCloseErrorDialog();
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1 bg-gray-900 rounded-xl p-6 border border-gray-800 h-fit sticky top-6">
        <h3 className="text-xl font-bold mb-4 text-white">Book Your Session</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="coach" className="text-white mb-2 block">
              Coach
            </Label>
            <Select
              value={selectedCoach || ""}
              onValueChange={(value) => setSelectedCoach(value)}
            >
              <SelectTrigger
                id="coach"
                className="bg-gray-800 border-gray-700 text-white"
              >
                <SelectValue placeholder="Select a coach" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white max-h-80">
                <SelectItem value="">All Coaches</SelectItem>
                {coaches.map((coach) => (
                  <SelectItem key={coach.id} value={coach.id} className="py-2">
                    <div>
                      <div className="font-semibold">{coach.name}</div>
                      <div className="text-xs text-gray-400">{getCoachScheduleInfo(coach.id)}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="branch" className="text-white mb-2 block">
              Branch
            </Label>
            <Select
              value={selectedBranch || ""}
              onValueChange={(value) => setSelectedBranch(value)}
            >
              <SelectTrigger
                id="branch"
                className="bg-gray-800 border-gray-700 text-white"
              >
                <SelectValue placeholder="Select a branch" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                <SelectItem value="">All Branches</SelectItem>
                {branches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="date" className="text-white mb-2 block">
              Date
            </Label>
            <Select
              value={selectedDate || ""}
              onValueChange={(value) => setSelectedDate(value)}
            >
              <SelectTrigger
                id="date"
                className="bg-gray-800 border-gray-700 text-white"
              >
                <SelectValue placeholder="Select a date" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white max-h-60">
                <SelectItem value="">All Dates</SelectItem>
                {getUniqueDates().map((date) => (
                  <SelectItem key={date} value={date}>
                    {formatDate(date)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="time" className="text-white mb-2 block">
              Time
            </Label>
            <Select
              value={selectedTime || ""}
              onValueChange={(value) => setSelectedTime(value)}
            >
              <SelectTrigger
                id="time"
                className="bg-gray-800 border-gray-700 text-white"
              >
                <SelectValue placeholder="Select a time" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white max-h-60">
                <SelectItem value="">All Times</SelectItem>
                <SelectItem value="morning">Morning (6AM - 12PM)</SelectItem>
                <SelectItem value="afternoon">
                  Afternoon (12PM - 5PM)
                </SelectItem>
                <SelectItem value="evening">Evening (5PM - 10PM)</SelectItem>
                {getUniqueTimes().map((time) => (
                  <SelectItem key={time} value={time}>
                    {formatTime(time)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="search" className="text-white mb-2 block">
              Search
            </Label>
            <div className="relative">
              <Search className="absolute left-2 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Search by coach or location"
                className="pl-8 bg-gray-800 border-gray-700 text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="md:col-span-2">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">
            Available Sessions {filteredTimeSlots.length > 0 && `(${filteredTimeSlots.length})`}
          </h2>
          <p className="text-gray-400">
            Select a session to book. All sessions are 45 minutes.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
          </div>
        ) : filteredTimeSlots.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredTimeSlots.map((slot) => {
              const coach = coaches.find((c) => c.id === slot.coach_id);
              return (
                <div
                  key={slot.id}
                  className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-red-600 transition duration-300 shadow-md"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-start gap-4">
                      <div className="relative flex-shrink-0">
                        {coach?.avatar_url ? (
                          <Image
                            src={coach.avatar_url}
                            alt={coach?.name || "Coach"}
                            width={56}
                            height={56}
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <div className="bg-red-600 h-14 w-14 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {coach?.name?.charAt(0) || "C"}
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white flex items-center">
                          {coach?.name || "Unknown Coach"} 
                          <span className="bg-red-600/20 text-red-500 text-xs px-2 py-1 rounded ml-2">
                            Coach
                          </span>
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {coach?.specialization || "Squash Coach"}
                          {coach?.years_experience && (
                            <span> · {coach.years_experience}+ years exp.</span>
                          )}
                        </p>
                        <p className="text-xs text-red-400 mt-1">
                          {getCoachScheduleInfo(slot.coach_id)}
                        </p>
                        <div className="flex items-center mt-1">
                          <Calendar className="h-4 w-4 text-gray-500 mr-1" />
                          <span className="text-gray-300 text-sm mr-3">
                            {formatDate(slot.session_date)}
                          </span>
                          <Clock className="h-4 w-4 text-gray-500 mr-1" />
                          <span className="text-gray-300 text-sm">
                            {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                          </span>
                        </div>
                        <div className="flex items-center mt-1">
                          <MapPin className="h-4 w-4 text-gray-500 mr-1" />
                          <span className="text-gray-400 text-sm">
                            {slot.branch_name}
                          </span>
                        </div>
                        {coach?.hourly_rate && (
                          <div className="mt-2">
                            <span className="text-white font-bold">${coach.hourly_rate}</span>
                            <span className="text-gray-400 text-sm"> per session</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      className="bg-red-600 hover:bg-red-700 w-full sm:w-auto whitespace-nowrap"
                      onClick={() => initBookSession(slot)}
                    >
                      Book Session
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
            <div className="mb-4">
              <User className="h-16 w-16 text-gray-600 mx-auto" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Available Sessions Found</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              Try adjusting your filters or selecting different dates to find available sessions.
            </p>
          </div>
        )}

        {bookingSuccess && (
          <div className="mt-6 bg-green-900/20 border border-green-800 rounded-xl p-4 text-center">
            <h3 className="text-xl font-bold text-white mb-2">Booking Successful!</h3>
            <p className="text-green-300">
              Your session has been booked and confirmed. You can view it in your dashboard.
            </p>
          </div>
        )}

        {bookingError && (
          <div className="mt-6 bg-red-900/20 border border-red-800 rounded-xl p-4">
            <h3 className="text-xl font-bold text-white mb-2">Booking Error</h3>
            <p className="text-red-300">{bookingError}</p>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="bg-gray-950 border-gray-800 text-white max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">Complete Your Booking</DialogTitle>
            <DialogDescription className="text-gray-400">
              Please complete the payment to confirm your booking.
            </DialogDescription>
          </DialogHeader>
          
          {selectedSlot && selectedSlotCoach && (
            <PaymentForm
              sessionId={selectedSlot.id}
              sessionDate={formatDate(selectedSlot.session_date)}
              sessionTime={`${formatTime(selectedSlot.start_time)} - ${formatTime(selectedSlot.end_time)}`}
              coachName={selectedSlotCoach.name}
              branchName={selectedSlot.branch_name}
              sessionPrice={selectedSlotCoach.hourly_rate || 50}
              onPaymentComplete={handlePaymentComplete}
            />
          )}
        </DialogContent>
      </Dialog>

      <BookingErrorHandler
        error={errorType}
        message={bookingError || undefined}
        sessionId={selectedSlot?.id}
        onRetry={retryBooking}
        onClose={handleCloseErrorDialog}
        showDialog={showErrorDialog}
      />
    </div>
  );
}
