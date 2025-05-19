"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
const supabase = createClient();
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, MapPin, CalendarDays, User, Clock } from "lucide-react";
import BookingModal from "@/components/booking/booking-modal";
import { toast } from "sonner";
import { ExperienceCheck } from './ExperienceCheck';
import { checkAndCreatePlayerProfile } from '@/app/actions';

interface Session {
  id: string;
  coach_id: string;
  coach_name: string;
  court_id: string;
  session_date: string;
  start_time: string;
  end_time: string;
  status: string;
  booking_type: string;
  player_id?: string;
}

interface CoachSchedule {
  day_of_week: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

interface Session {
  id: string;
  coach_id: string;
  coach_name: string;
  court_id: string;
  session_date: string;
  start_time: string;
  end_time: string;
  status: string;
  booking_type: string;
}

export default function BookingPage() {
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedCoach, setSelectedCoach] = useState<string | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [coaches, setCoaches] = useState<Array<{id: string; email: string; first_name: string; last_name: string}>>([]);
  const [showExperienceCheck, setShowExperienceCheck] = useState(true);
  const [showVideoUpload, setShowVideoUpload] = useState(false);
  const [showAssessmentBooking, setShowAssessmentBooking] = useState(false);
  const [playerLevel, setPlayerLevel] = useState<number | null>(null);
  const [needsAssessment, setNeedsAssessment] = useState(false);
  const [needsVideoReview, setNeedsVideoReview] = useState(false);
  // Time slots from 7:00 AM to 10:00 PM in 30-minute increments
  const timeSlots = Array.from({ length: 30 }, (_, i) => {
    const hour = Math.floor(i / 2) + 7;
    const minute = (i % 2) * 30;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  });
  const [dateOptions, setDateOptions] = useState<string[]>([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [userId, setUserId] = useState<string | null>(null);


  useEffect(() => {
    const initializeUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };

    initializeUser();
    fetchData();
  }, []);

  useEffect(() => {
    if (sessions.length > 0) {
      // Generate the next 7 days for date selection
      const dates = [];
      const currentDate = new Date();

      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(currentDate.getDate() + i);
        const dateString = date.toISOString().split('T')[0];
        dates.push(dateString as never);
      }

      setDateOptions(dates);
      setSelectedDate(dates[0]);
    }
  }, [sessions]);

  useEffect(() => {
    if (selectedDate || selectedCoach) {
      fetchSessions();
    }
  }, [selectedDate, selectedCoach]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const supabase = createClient();

      // Fetch coaches
      const { data: coachData, error: coachError } = await supabase
        .from('users')
        .select('id, email, first_name, last_name')
        .eq('role', 'coach')
        .eq('approved', true);

      if (coachError) {
        throw new Error(`Failed to fetch coaches: ${coachError.message}`);
      }

      setCoaches(coachData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load booking data");
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    if (!selectedDate || !selectedCoach) return;

    try {
      const response = await fetch(`/api/booking/create-booking?coach_id=${selectedCoach}&date=${selectedDate}`);
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Convert coach schedule and existing bookings into available sessions
      const { schedule, existing_bookings } = data;

      if (!schedule || !schedule.is_available) {
        setSessions([]);
        return;
      }

      // Generate 30-minute slots between start and end time
      const slots: Session[] = [];
      let currentTime = new Date(`${selectedDate}T${schedule.start_time}`);
      const endTime = new Date(`${selectedDate}T${schedule.end_time}`);

      while (currentTime < endTime) {
        const slotEndTime = new Date(currentTime.getTime() + 30 * 60000);

        // Check if this slot overlaps with any existing booking
        const isBooked = existing_bookings?.some(booking => {
          const bookingStart = new Date(`${booking.session_date}T${booking.start_time}`);
          const bookingEnd = new Date(`${booking.session_date}T${booking.end_time}`);
          return currentTime < bookingEnd && slotEndTime > bookingStart;
        });

        if (!isBooked) {
          slots.push({
            id: `${selectedDate}-${currentTime.toTimeString().slice(0, 5)}`,
            coach_id: selectedCoach,
            coach_name: coaches.find(c => c.id === selectedCoach)?.first_name + ' ' +
              coaches.find(c => c.id === selectedCoach)?.last_name,
            court_id: 'default', // You might want to make this selectable
            session_date: selectedDate,
            start_time: currentTime.toTimeString().slice(0, 5),
            end_time: slotEndTime.toTimeString().slice(0, 5),
            status: 'available',
            booking_type: 'regular'
          });
        }

        currentTime = slotEndTime;
      }

      setSessions(slots);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error('Failed to fetch available sessions');
    }
  };

  const handleBookSession = async (session: Session) => {
    try {
      const response = await fetch('/api/booking/create-booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coach_id: session.coach_id,
          court_id: session.court_id,
          session_date: session.session_date,
          start_time: session.start_time,
          end_time: session.end_time,
          booking_type: session.booking_type
        }),
      });

      const data = await response.json();

      if (data.error) {
        toast.error(data.error);
        return;
      }

      toast.success('Session booked successfully!');
      fetchSessions(); // Refresh the sessions
    } catch (error) {
      console.error('Error booking session:', error);
      toast.error('Failed to book session');
    }
  };

  const handleCloseModal = () => {
    setShowBookingModal(false);
    setSelectedSession(null);
  };
  
  const formatTime = (time: string) => {
    if (!time) return "";
    // Convert 24-hour format to 12-hour format with AM/PM
    const [hour, minute] = time.split(":");
    const hourNum = parseInt(hour, 10);
    const amPm = hourNum >= 12 ? "PM" : "AM";
    const hour12 = hourNum % 12 || 12;
    return `${hour12}:${minute} ${amPm}`;
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  const getFirstAvailableTimeIndex = (date: string, filteredSessions: Session[]) => {
    if (!filteredSessions || filteredSessions.length === 0) return -1;
    
    const firstSession = filteredSessions.find(session => session.session_date === date);
    if (!firstSession) return -1;
    
    return timeSlots.findIndex(time => time === firstSession.start_time);
  };
  
  const getSessionForTimeSlot = (date: string, time: string, filteredSessions: Session[]) => {
    if (!filteredSessions) return null;
    
    return filteredSessions.find(
      session => session.session_date === date && session.start_time === time
    );
  };
  
  const filteredSessions = selectedDate ? sessions : [];
  const firstTimeIndex = getFirstAvailableTimeIndex(selectedDate || '', filteredSessions);
  
  const handleExperienceComplete = async (data: { 
    level: number;
    needsAssessment: boolean;
    needsVideoReview: boolean;
    yearsPlaying: number;
    videoUrl?: string;
    videoNotes?: string;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to continue');
        return;
      }

      // Check and create player profile
      const result = await checkAndCreatePlayerProfile(
        user.id,
        data.yearsPlaying > 0, // hasPlayedBefore based on yearsPlaying
        data.yearsPlaying,
        data.needsVideoReview, // hasVideo
        data.videoUrl,
        data.videoNotes
      );

      setPlayerLevel(data.level);
      setNeedsAssessment(data.needsAssessment);
      setNeedsVideoReview(data.needsVideoReview);
      setShowExperienceCheck(false);

      if (data.needsVideoReview) {
        setShowVideoUpload(true);
        toast.info('Please upload a video of your playing style for review');
      } else if (data.needsAssessment) {
        setShowAssessmentBooking(true);
        toast.info('Please book an assessment session');
      }
    } catch (error) {
      console.error('Error handling experience check:', error);
      toast.error('Failed to process your experience information');
    }
  };
  
  if (showExperienceCheck) {
    return (
      <div className="container mx-auto py-8">
        <ExperienceCheck onComplete={handleExperienceComplete} />
      </div>
    );
  }

  if (needsVideoReview) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Video Review Submitted</CardTitle>
            <CardDescription>
              Your video has been submitted for review. A coach will analyze your playing style and provide feedback on your level.
              You'll be notified once the review is complete.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>While waiting for the review, you can:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Book an assessment session if you prefer immediate feedback</li>
                <li>Browse available sessions for your current level</li>
                <li>View your profile to check the review status</li>
              </ul>
              <Button onClick={() => setNeedsVideoReview(false)}>
                Continue to Booking
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (needsAssessment) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Assessment Required</CardTitle>
            <CardDescription>
              Before booking regular sessions, you'll need to complete an assessment session.
              This helps us determine your skill level and create the best training plan for you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>Please select an assessment session:</p>
              {/* Add assessment session selection UI here */}
              <Button onClick={() => setNeedsAssessment(false)}>
                Skip for now
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Book a Training Session</h1>
        <p className="text-gray-600">Select your preferred coach, location, and time slot</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div>
          <Label>Date</Label>
          <Select
            value={selectedDate || "none"}
            onValueChange={(value) => setSelectedDate(value === "none" ? null : value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select date" />
            </SelectTrigger>
            <SelectContent>
              {dateOptions.map((date) => (
                <SelectItem key={date} value={date}>
                  {formatDate(date)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Coach</Label>
          <Select
            value={selectedCoach || "none"}
            onValueChange={(value) => setSelectedCoach(value === "none" ? null : value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Coach" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">All Coaches</SelectItem>
              {coaches.map((coach) => (
                <SelectItem key={coach.id} value={coach.id}>
                  {`${coach.first_name} ${coach.last_name}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session) => (
            <Card key={session.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{session.coach_name}</CardTitle>
                <CardDescription>
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-1" />
                    Court {session.court_id}
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <CalendarDays className="h-4 w-4 mr-2 text-gray-500" />
                    {formatDate(session.session_date)}
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2 text-gray-500" />
                    {formatTime(session.start_time)} - {formatTime(session.end_time)}
                  </div>
                  <div className="flex items-center justify-between pt-2 mt-2 border-t">
                    <span className="text-sm font-medium">{session.booking_type}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() => handleBookSession(session)}
                  disabled={session.status !== 'available'}
                >
                  {session.status === 'available' ? 'Book Now' : 'Not Available'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {showBookingModal && selectedSession && (
        <BookingModal
          session={selectedSession}
          userId={userId!}
          onClose={handleCloseModal}
          onSuccess={() => {
            handleCloseModal();
            fetchSessions();
          }}
        />
      )}
    </div>
  );
}