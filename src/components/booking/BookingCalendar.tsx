"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { BookOpen, Clock, MapPin, CalendarIcon, User } from "lucide-react";
import { format, addDays } from "date-fns";
import { reserveSession } from "@/app/actions";

interface Session {
  id: string;
  session_date: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  status: string;
  court: string;
  level?: string | number;
  student_name?: string | null;
  coaches: {
    id: string;
    first_name: string;
    last_name: string;
  };
  branches: {
    id: string;
    name: string;
  };
}

interface BookingCalendarProps {
  sessions: Session[];
  startDate: Date;
  userId: string | undefined;
}

export default function BookingCalendar({ sessions, startDate, userId }: BookingCalendarProps) {
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  
  // Generate dates for the week
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(startDate, i);
    return {
      date,
      formattedDate: format(date, "yyyy-MM-dd"),
      dayName: format(date, "EEEE"),
      dayMonth: format(date, "MMM d")
    };
  });
  
  // Group sessions by date
  const sessionsByDate = dates.map(({ formattedDate, dayName, dayMonth }) => {
    const matchingSessions = sessions.filter(session => session.session_date === formattedDate);
    
    // Group sessions by time slot and court for better visualization
    const timeSlots: Record<string, Record<string, Session[]>> = {};
    
    matchingSessions.forEach(session => {
      const timeKey = `${session.start_time}-${session.end_time}`;
      if (!timeSlots[timeKey]) {
        timeSlots[timeKey] = {};
      }
      if (!timeSlots[timeKey][session.court]) {
        timeSlots[timeKey][session.court] = [];
      }
      timeSlots[timeKey][session.court].push(session);
    });
    
    return {
      date: formattedDate,
      dayName,
      dayMonth,
      sessions: matchingSessions,
      timeSlots
    };
  });
  
  const handleBookSession = async () => {
    if (!selectedSession) return;
    if (!userId) {
      toast.error("Please sign in to book a session");
      return;
    }
    
    setIsBooking(true);
    
    try {
      const result = await reserveSession({
        sessionId: selectedSession.id,
        userId: userId
      });
      
      if (result.success) {
        toast.success("Session booked successfully!");
        setIsBookingOpen(false);
        // Ideally we would refresh the sessions data here
      } else {
        toast.error(result.error || "Failed to book session");
      }
    } catch (error) {
      console.error("Error booking session:", error);
      toast.error("An error occurred while booking the session");
    } finally {
      setIsBooking(false);
    }
  };
  
  const getLevelColor = (level: string | number | undefined) => {
    if (!level) return "bg-gray-100 text-gray-800";
    
    switch (String(level)) {
      case "1": return "bg-blue-100 text-blue-800";
      case "2": return "bg-green-100 text-green-800";
      case "3": return "bg-pink-100 text-pink-800";
      case "4": return "bg-purple-100 text-purple-800";
      case "5": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  
  return (
    <>
      <Tabs defaultValue={dates[0].formattedDate} className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          {dates.map(({ formattedDate, dayName, dayMonth }) => (
            <TabsTrigger 
              key={formattedDate} 
              value={formattedDate}
              className="flex flex-col"
            >
              <span className="text-sm font-medium">{dayName.slice(0, 3)}</span>
              <span className="text-xs">{dayMonth}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        
        {sessionsByDate.map(({ date, sessions: dateSessions, timeSlots }) => (
          <TabsContent key={date} value={date} className="mt-4">
            {dateSessions.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-lg text-gray-500">No available sessions for this day</p>
                <p className="text-sm text-gray-400">Try another day or adjust your filters</p>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(timeSlots).map(([timeSlot, courts]) => {
                  const [startTime, endTime] = timeSlot.split('-');
                  return (
                    <div key={timeSlot} className="border rounded-lg p-4">
                      <div className="mb-3 flex items-center">
                        <Clock className="h-5 w-5 mr-2 text-gray-500" />
                        <h3 className="text-lg font-medium">{startTime} - {endTime}</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                        {/* For each court, display sessions or empty slots */}
                        {Object.entries(courts).map(([court, courtSessions]) => (
                          courtSessions.map((session) => (
                            <Card key={session.id} className="overflow-hidden">
                              <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <CardTitle className="text-lg">
                                      {session.coaches.first_name} {session.coaches.last_name}
                                    </CardTitle>
                                    <CardDescription>
                                      {court}, {format(new Date(session.session_date), "MMM d")}
                                    </CardDescription>
                                  </div>
                                  {session.level && (
                                    <div className={`px-2 py-1 rounded-md text-xs font-medium ${getLevelColor(session.level)}`}>
                                      Level {session.level}
                                    </div>
                                  )}
                                </div>
                              </CardHeader>
                              <CardContent className="pb-2">
                                <div className="space-y-2">
                                  <div className="flex items-center text-sm">
                                    <Clock className="h-4 w-4 mr-2 text-gray-500" />
                                    <span>
                                      {session.start_time} - {session.end_time}
                                    </span>
                                  </div>
                                  <div className="flex items-center text-sm">
                                    <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                                    <span>
                                      {session.branches.name}, {session.court}
                                    </span>
                                  </div>
                                </div>
                              </CardContent>
                              <CardFooter>
                                <Button 
                                  className="w-full"
                                  onClick={() => {
                                    setSelectedSession(session);
                                    setIsBookingOpen(true);
                                  }}
                                >
                                  Book Session
                                </Button>
                              </CardFooter>
                            </Card>
                          ))
                        ))}
                        
                        {/* Add empty slots for courts with no sessions */}
                        {["Court 1", "Court 2"].map(courtName => {
                          if (!courts[courtName]) {
                            return (
                              <Card key={`empty-${timeSlot}-${courtName}`} className="overflow-hidden border-dashed border-gray-300">
                                <CardHeader className="pb-2">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <CardTitle className="text-lg text-gray-400">
                                        Available Slot
                                      </CardTitle>
                                      <CardDescription>
                                        {courtName}, {format(new Date(date), "MMM d")}
                                      </CardDescription>
                                    </div>
                                  </div>
                                </CardHeader>
                                <CardContent className="pb-2">
                                  <div className="space-y-2">
                                    <div className="flex items-center text-sm text-gray-400">
                                      <Clock className="h-4 w-4 mr-2 text-gray-400" />
                                      <span>
                                        {startTime} - {endTime}
                                      </span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-400">
                                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                                      <span>
                                        Royal British School, {courtName}
                                      </span>
                                    </div>
                                  </div>
                                </CardContent>
                                <CardFooter>
                                  <Button 
                                    variant="outline"
                                    className="w-full text-gray-500 border-gray-300"
                                    disabled
                                  >
                                    No Session Available
                                  </Button>
                                </CardFooter>
                              </Card>
                            );
                          }
                          return null;
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
      
      {/* Booking confirmation dialog */}
      {selectedSession && (
        <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Booking</DialogTitle>
              <DialogDescription>
                You are about to book a session with {selectedSession.coaches.first_name} {selectedSession.coaches.last_name}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Date</p>
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
                    <p>{format(new Date(selectedSession.session_date), "EEEE, MMMM d, yyyy")}</p>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Time</p>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-gray-500" />
                    <p>{selectedSession.start_time} - {selectedSession.end_time}</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Coach</p>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-gray-500" />
                    <p>{selectedSession.coaches.first_name} {selectedSession.coaches.last_name}</p>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Location</p>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                    <p>{selectedSession.branches.name}, {selectedSession.court}</p>
                  </div>
                </div>
              </div>
              
              {selectedSession.level && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Level</p>
                  <div className="flex items-center">
                    <BookOpen className="h-4 w-4 mr-2 text-gray-500" />
                    <div className={`px-2 py-1 rounded-md text-xs font-medium ${getLevelColor(selectedSession.level)}`}>
                      Level {selectedSession.level}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsBookingOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleBookSession} disabled={isBooking || !userId}>
                {isBooking ? "Booking..." : "Confirm Booking"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
} 