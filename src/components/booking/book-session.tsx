"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  Card, 
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CalendarClock, Clock, MapPin, Users, Dumbbell, CreditCard } from "lucide-react";
import BookingModal from "./booking-modal";
import { createClient } from "@supabase/supabase-js";

type Coach = {
  id: string;
  full_name: string;
  schedules: {
    id: string;
    day_of_week: string;
    start_time: string;
    end_time: string;
    session_duration: number;
  }[];
};

type Branch = {
  id: string;
  name: string;
  location: string;
};

type Session = {
  id: string;
  coach_id: string;
  coach_name: string;
  branch_id: string;
  branch_name: string;
  branch_location: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  session_duration: number;
  max_attendees: number;
  level: string;
  type: string;
  price: number;
  status: string;
  court?: string;
};

interface BookSessionProps {
  sessions: Session[];
  rbsSessions: Session[];
  coaches: Coach[];
  branches: Branch[];
  userId: string;
}

export default function BookSession({ sessions, rbsSessions, coaches, branches, userId }: BookSessionProps) {
  const [selectedCoach, setSelectedCoach] = useState<string>("");
  const RBS_BRANCH_ID = "fbd9510e-14ab-4a6a-a129-e0430683ecaf";
  const [selectedBranch, setSelectedBranch] = useState<string>(RBS_BRANCH_ID);
  const [selectedDay, setSelectedDay] = useState<string>("all");
  const [selectedSessionType, setSelectedSessionType] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [bookingSession, setBookingSession] = useState<Session | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [isLevelOne, setIsLevelOne] = useState(false);

  // Get unique list of days
  const days = Array.from(new Set(sessions.map(session => session.day_of_week)))
    .sort((a, b) => {
      const order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
      return order.indexOf(a) - order.indexOf(b);
    });

  // Get unique list of session types
  const sessionTypes = Array.from(new Set(sessions.map(session => session.type)));

  // Get unique list of levels
  const levels = Array.from(new Set(sessions.map(session => session.level)));

  // Filter sessions based on selected filters
  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
      const matchesCoach = selectedCoach ? session.coach_id === selectedCoach : true;
      const matchesDay = selectedDay === "all" || session.day_of_week === selectedDay;
      const matchesType = selectedSessionType === "all" || session.type === selectedSessionType;
      const matchesLevel = isLevelOne ? true : (selectedLevel === "all" || session.level === selectedLevel);
      return matchesCoach && matchesDay && matchesType && matchesLevel;
    });
  }, [sessions, selectedCoach, selectedDay, selectedSessionType, selectedLevel, isLevelOne]);

  // Helper to check if RBS is selected
  const isRBS = selectedBranch === RBS_BRANCH_ID;

  // Filter RBS sessions for the schedule display
  const rbsSchedule = useMemo(() => {
    return sessions.filter(session => session.branch_id === RBS_BRANCH_ID);
  }, [sessions]);

  const handleBookSession = (session: Session) => {
    setBookingSession(session);
    setShowBookingModal(true);
  };

  const handleCloseModal = () => {
    setShowBookingModal(false);
    setBookingSession(null);
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

  const getCoachScheduleInfo = (coachId: string) => {
    const coach = coaches.find(c => c.id === coachId);
    if (!coach || !coach.schedules.length) return "No schedule available";
    
    const scheduleByDay = coach.schedules.reduce((acc, schedule) => {
      if (!acc[schedule.day_of_week]) {
        acc[schedule.day_of_week] = [];
      }
      acc[schedule.day_of_week].push(schedule);
      return acc;
    }, {} as Record<string, typeof coach.schedules>);

    return Object.entries(scheduleByDay)
      .map(([day, schedules]) => {
        const timeSlots = schedules.map(s => 
          `${formatTime(s.start_time)} - ${formatTime(s.end_time)}`
        ).join(", ");
        return `${day}: ${timeSlots}`;
      })
      .join(" | ");
  };

  // Set isLevelOne based on the player's level
  useEffect(() => {
    const checkPlayerLevel = async () => {
      try {
        const supabase = createClient();
        const { data: playerData, error } = await supabase
          .from('players')
          .select('level')
          .eq('id', userId)
          .single();

        if (error) throw error;
        setIsLevelOne(playerData?.level === 1);
        // If the player answered 'No' and is not level 1, set them to level 1
        if (playerData && playerData.level !== 1 && window.localStorage.getItem('played_before') === 'no') {
          await supabase
            .from('players')
            .update({ level: 1 })
            .eq('id', userId);
          setIsLevelOne(true);
        }
      } catch (error) {
        console.error('Error checking player level:', error);
      }
    };

    checkPlayerLevel();
  }, [userId]);

  console.log('RBS SESSIONS:', rbsSessions);

  return (
    <div className="space-y-6">
      {/* DEBUG: Show raw RBS sessions data */}
      <div className="bg-yellow-50 text-xs p-2 rounded mb-4">
        <strong>DEBUG: rbsSessions</strong>
        <pre>{JSON.stringify(rbsSessions, null, 2)}</pre>
      </div>
      {rbsSessions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-2">Royal British School Weekly Schedule</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-2 py-1 border">Day</th>
                  <th className="px-2 py-1 border">Time</th>
                  <th className="px-2 py-1 border">Coach</th>
                  <th className="px-2 py-1 border">Court</th>
                  <th className="px-2 py-1 border">Type</th>
                </tr>
              </thead>
              <tbody>
                {rbsSessions.map((session, idx) => {
                  const isAvailable = session.status === 'available';
                  return (
                    <tr
                      key={session.id || idx}
                      className={
                        isAvailable
                          ? "cursor-pointer hover:bg-blue-100 transition"
                          : "opacity-50 cursor-not-allowed"
                      }
                      onClick={() => isAvailable && handleBookSession(session)}
                      title={isAvailable ? "Click to book this session" : "Session not available"}
                    >
                      <td className="px-2 py-1 border">{session.day_of_week}</td>
                      <td className="px-2 py-1 border">{formatTime(session.start_time)} - {formatTime(session.end_time)}</td>
                      <td className="px-2 py-1 border">{session.coach_name}</td>
                      <td className="px-2 py-1 border">{session.court || '-'}</td>
                      <td className="px-2 py-1 border">{session.type}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {!isLevelOne && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <Label htmlFor="coach">Coach</Label>
            <Select
              value={selectedCoach}
              onValueChange={setSelectedCoach}
            >
              <SelectTrigger id="coach">
                <SelectValue placeholder="All Coaches" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Coaches</SelectItem>
                {coaches.map(coach => (
                  <SelectItem key={coach.id} value={coach.id}>
                    {coach.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="branch">Branch</Label>
            <Select
              value={selectedBranch}
              onValueChange={setSelectedBranch}
            >
              <SelectTrigger id="branch">
                <SelectValue placeholder="All Branches" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Branches</SelectItem>
                {branches.map(branch => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="day">Day</Label>
            <Select
              value={selectedDay}
              onValueChange={setSelectedDay}
            >
              <SelectTrigger id="day">
                <SelectValue placeholder="All Days" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Days</SelectItem>
                {days.map(day => (
                  <SelectItem key={day} value={day}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="type">Session Type</Label>
            <Select
              value={selectedSessionType}
              onValueChange={setSelectedSessionType}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {sessionTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="level">Level</Label>
            <Select
              value={selectedLevel}
              onValueChange={setSelectedLevel}
            >
              <SelectTrigger id="level">
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {levels.map(level => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
      
      {isLevelOne && (
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Welcome to Level 1!</h3>
          <p className="text-blue-600">
            As a new player, you can see all available sessions. Our coaches will help you get started with squash.
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSessions.length > 0 ? (
          filteredSessions.map(session => (
            <Card key={session.id} className="overflow-hidden">
              <CardHeader className="pb-2 bg-primary-50">
                <CardTitle className="text-lg">{session.coach_name}</CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <CalendarClock className="h-4 w-4" />
                  <span>{session.day_of_week}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 pb-2">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 mt-0.5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Time</p>
                      <p className="font-medium">{formatTime(session.start_time)} - {formatTime(session.end_time)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Branch</p>
                      <p className="font-medium">{session.branch_name}</p>
                      <p className="text-xs text-gray-500">{session.branch_location}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <CalendarClock className="h-4 w-4 mt-0.5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Coach's Schedule</p>
                      <p className="text-xs text-gray-600">{getCoachScheduleInfo(session.coach_id)}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-start gap-2">
                      <Users className="h-4 w-4 mt-0.5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Max Attendees</p>
                        <p className="font-medium">{session.max_attendees}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <Dumbbell className="h-4 w-4 mt-0.5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Level</p>
                        <p className="font-medium">{session.level}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <CreditCard className="h-4 w-4 mt-0.5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Price</p>
                        <p className="font-medium">${session.price}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <Button 
                  className="w-full" 
                  onClick={() => handleBookSession(session)}
                >
                  Book Session
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">No sessions available with the current filters.</p>
          </div>
        )}
      </div>
      
      {showBookingModal && bookingSession && (
        <BookingModal
          session={bookingSession}
          userId={userId}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
} 