import { useState } from "react";
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

type Coach = {
  id: string;
  full_name: string;
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
};

interface BookSessionProps {
  sessions: Session[];
  coaches: Coach[];
  branches: Branch[];
  userId: string;
}

export default function BookSession({ sessions, coaches, branches, userId }: BookSessionProps) {
  const [selectedCoach, setSelectedCoach] = useState<string>("");
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [selectedSessionType, setSelectedSessionType] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [bookingSession, setBookingSession] = useState<Session | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

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
  const filteredSessions = sessions.filter(session => {
    let match = true;
    
    if (selectedCoach && session.coach_id !== selectedCoach) {
      match = false;
    }
    
    if (selectedBranch && session.branch_id !== selectedBranch) {
      match = false;
    }
    
    if (selectedDay && session.day_of_week !== selectedDay) {
      match = false;
    }
    
    if (selectedSessionType && session.type !== selectedSessionType) {
      match = false;
    }
    
    if (selectedLevel && session.level !== selectedLevel) {
      match = false;
    }
    
    return match;
  });

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

  return (
    <div className="space-y-6">
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
              <SelectItem value="">All Days</SelectItem>
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
              <SelectItem value="">All Types</SelectItem>
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
              <SelectItem value="">All Levels</SelectItem>
              {levels.map(level => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
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
                  
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-start gap-2">
                      <Users className="h-4 w-4 mt-0.5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Type</p>
                        <p className="font-medium">{session.type}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <Dumbbell className="h-4 w-4 mt-0.5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Level</p>
                        <p className="font-medium">{session.level}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between border-t pt-2 mt-2">
                    <div className="flex items-center gap-1">
                      <CreditCard className="h-4 w-4 text-primary" />
                      <span className="font-bold">${session.price.toFixed(2)}</span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{session.session_duration} minutes</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
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
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">No sessions found matching your filters.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setSelectedCoach("");
                setSelectedBranch("");
                setSelectedDay("");
                setSelectedSessionType("");
                setSelectedLevel("");
              }}
            >
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
      
      {bookingSession && (
        <BookingModal
          open={showBookingModal}
          onClose={handleCloseModal}
          session={bookingSession}
          userId={userId}
        />
      )}
    </div>
  );
} 