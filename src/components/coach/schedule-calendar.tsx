"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, User, MapPin } from "lucide-react";
import SessionDetailsDialog from "./session-details-dialog";
import RescheduleDialog from "./reschedule-dialog";
import { createClient } from "@supabase/supabase-js";

const createClientComponentClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
};
import { Database } from "@/types/supabase";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

type Session = {
  id: string;
  date: string;
  time: string;
  duration: string;
  playerName: string | null;
  playerEmail: string | null;
  playerPhone?: string | null;
  type: string;
  status: string;
  branchName: string;
};

type Coach = {
  id: string;
  name: string;
  email: string;
};

type Branch = {
  id: string;
  name: string;
  location: string;
  is_members_only: boolean | null;
};

type CoachSchedule = {
  id: string;
  coach_id: string;
  branch_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  session_duration: number;
  branch?: Branch;
};

export default function ScheduleCalendar() {
  const supabase = createClientComponentClient<Database>();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [coach, setCoach] = useState<Coach | null>(null);
  const [schedules, setSchedules] = useState<CoachSchedule[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch coach data and schedules
  useEffect(() => {
    const fetchCoachData = async () => {
      setLoading(true);
      try {
        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        // Get coach data
        const { data: userData } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();

        if (userData) {
          setCoach({
            id: userData.id,
            name: userData.full_name || userData.name || "",
            email: userData.email || "",
          });
        }

        // Get branches
        const { data: branchData } = await supabase
          .from("branches")
          .select("*");

        if (branchData) {
          setBranches(branchData);
          if (branchData.length > 0 && !selectedBranch) {
            setSelectedBranch(branchData[0].id);
          }
        }

        // Get coach schedules
        const { data: scheduleData } = await supabase
          .from("coach_schedules")
          .select("*, branch:branches(*)")
          .eq("coach_id", user.id);

        if (scheduleData) {
          setSchedules(scheduleData);
        }

        // Get coach sessions
        await fetchSessions(user.id);
      } catch (error) {
        console.error("Error fetching coach data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoachData();
  }, [supabase]);

  // Fetch sessions when selected date changes
  useEffect(() => {
    if (coach && selectedDate) {
      fetchSessionsForDate(coach.id, selectedDate);
    }
  }, [selectedDate, coach]);

  // Fetch all sessions for the coach
  const fetchSessions = async (coachId: string) => {
    try {
      const { data, error } = await supabase
        .from("coach_sessions")
        .select(
          `
          id, 
          session_date, 
          start_time, 
          end_time, 
          status, 
          player:users!coach_sessions_player_id_fkey(id, full_name, email, phone),
          branch:branches(id, name)
        `,
        )
        .eq("coach_id", coachId);

      if (error) throw error;

      if (data) {
        const formattedSessions: Session[] = data.map((session) => ({
          id: session.id,
          date: session.session_date,
          time: session.start_time,
          duration: "45", // Fixed duration as per requirements
          playerName: session.player?.full_name || null,
          playerEmail: session.player?.email || null,
          playerPhone: session.player?.phone || null,
          type: "Training Session",
          status: session.status,
          branchName: session.branch?.name || "Unknown Branch",
        }));

        setSessions(formattedSessions);
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
    }
  };

  // Fetch sessions for a specific date
  const fetchSessionsForDate = async (coachId: string, date: Date) => {
    try {
      const formattedDate = formatDate(date);
      const { data, error } = await supabase
        .from("coach_sessions")
        .select(
          `
          id, 
          session_date, 
          start_time, 
          end_time, 
          status, 
          player:users!coach_sessions_player_id_fkey(id, full_name, email, phone),
          branch:branches(id, name)
        `,
        )
        .eq("coach_id", coachId)
        .eq("session_date", formattedDate);

      if (error) throw error;

      if (data) {
        const formattedSessions: Session[] = data.map((session) => ({
          id: session.id,
          date: session.session_date,
          time: session.start_time,
          duration: "45", // Fixed duration as per requirements
          playerName: session.player?.full_name || null,
          playerEmail: session.player?.email || null,
          playerPhone: session.player?.phone || null,
          type: "Training Session",
          status: session.status,
          branchName: session.branch?.name || "Unknown Branch",
        }));

        setSessions(formattedSessions);
      }
    } catch (error) {
      console.error("Error fetching sessions for date:", error);
    }
  };

  // Generate available time slots for a specific date
  const generateTimeSlots = (date: Date) => {
    if (!date || !coach) return [];

    const dayOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ][date.getDay()];

    // Find schedules for this day of week
    const daySchedules = schedules.filter(
      (schedule) =>
        schedule.day_of_week === dayOfWeek &&
        (!selectedBranch || schedule.branch_id === selectedBranch),
    );

    if (daySchedules.length === 0) return [];

    const slots: { time: string; endTime: string }[] = [];

    daySchedules.forEach((schedule) => {
      const [startHour, startMinute] = schedule.start_time
        .split(":")
        .map(Number);
      const [endHour, endMinute] = schedule.end_time.split(":").map(Number);

      let currentHour = startHour;
      let currentMinute = startMinute;

      // Generate slots until we reach end time
      while (
        currentHour < endHour ||
        (currentHour === endHour &&
          currentMinute + schedule.session_duration <= endMinute)
      ) {
        const startTime = `${String(currentHour).padStart(2, "0")}:${String(currentMinute).padStart(2, "0")}`;

        // Calculate end time
        let endTimeMinutes = currentMinute + schedule.session_duration;
        let endTimeHour = currentHour + Math.floor(endTimeMinutes / 60);
        endTimeMinutes = endTimeMinutes % 60;

        const endTime = `${String(endTimeHour).padStart(2, "0")}:${String(endTimeMinutes).padStart(2, "0")}`;

        slots.push({ time: startTime, endTime });

        // Move to next slot
        currentMinute += schedule.session_duration;
        if (currentMinute >= 60) {
          currentHour += Math.floor(currentMinute / 60);
          currentMinute = currentMinute % 60;
        }
      }
    });

    return slots;
  };

  // Create sessions for a specific date
  const createSessions = async () => {
    if (!selectedDate || !coach || !selectedBranch) return;

    try {
      setLoading(true);
      const formattedDate = formatDate(selectedDate);
      const timeSlots = generateTimeSlots(selectedDate);

      // Check if sessions already exist for this date
      const { data: existingSessions } = await supabase
        .from("coach_sessions")
        .select("id")
        .eq("coach_id", coach.id)
        .eq("session_date", formattedDate)
        .eq("branch_id", selectedBranch);

      if (existingSessions && existingSessions.length > 0) {
        alert(
          "Sessions already exist for this date and branch. Please delete them first if you want to recreate.",
        );
        setLoading(false);
        return;
      }

      // Create sessions for each time slot
      const sessionsToCreate = timeSlots.map((slot) => ({
        coach_id: coach.id,
        branch_id: selectedBranch,
        session_date: formattedDate,
        start_time: slot.time,
        end_time: slot.endTime,
        status: "available",
      }));

      if (sessionsToCreate.length === 0) {
        alert("No time slots available for this date and branch.");
        setLoading(false);
        return;
      }

      const { error } = await supabase
        .from("coach_sessions")
        .insert(sessionsToCreate);

      if (error) throw error;

      alert(
        `Successfully created ${sessionsToCreate.length} sessions for ${formattedDate}`,
      );
      fetchSessionsForDate(coach.id, selectedDate);
    } catch (error) {
      console.error("Error creating sessions:", error);
      alert("Failed to create sessions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get day of week for first day of month
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  // Format date as YYYY-MM-DD
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Get sessions for a specific date
  const getSessionsForDate = (date: Date) => {
    const formattedDate = formatDate(date);
    return sessions.filter((session) => session.date === formattedDate);
  };

  // Handle date selection
  const handleDateClick = (day: number) => {
    const newDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day,
    );
    setSelectedDate(newDate);
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-12"></div>);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const formattedDate = formatDate(date);
      const sessionsForDay = sessions.filter(
        (session) => session.date === formattedDate,
      );
      const hasSession = sessionsForDay.length > 0;
      const isSelected =
        selectedDate &&
        day === selectedDate.getDate() &&
        month === selectedDate.getMonth() &&
        year === selectedDate.getFullYear();

      days.push(
        <div
          key={`day-${day}`}
          className={`h-12 border border-gray-200 p-1 cursor-pointer transition-colors hover:bg-gray-700 ${isSelected ? "bg-gray-600" : ""}`}
          onClick={() => handleDateClick(day)}
        >
          <div className="flex flex-col h-full">
            <span className="text-sm text-white">{day}</span>
            {hasSession && (
              <div className="mt-auto">
                <span className="text-xs bg-primary text-white px-1 rounded-sm">
                  {sessionsForDay.length} session
                  {sessionsForDay.length !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>
        </div>,
      );
    }

    return days;
  };

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
    setSelectedDate(null);
  };

  // Navigate to next month
  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );
    setSelectedDate(null);
  };

  // Format time for display
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-800 text-white">
      <h2 className="text-xl font-semibold mb-4 text-white">Your Schedule</h2>

      <div className="flex items-center justify-between mb-4">
        <div>
          <select
            className="bg-gray-800 text-white border border-gray-700 rounded-md p-2"
            value={selectedBranch || ""}
            onChange={(e) => setSelectedBranch(e.target.value)}
          >
            <option value="">All Branches</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
        </div>
        {selectedDate && (
          <Button
            onClick={createSessions}
            disabled={loading || !selectedBranch}
            className="bg-primary hover:bg-primary/90"
          >
            {loading ? "Creating..." : "Create Sessions"}
          </Button>
        )}
      </div>

      {/* Time Slots Section - Prioritized */}
      <div className="mb-6 bg-gray-800 p-4 rounded-lg border border-gray-700">
        <h3 className="text-lg font-medium mb-3 text-white">
          Your Regular Time Slots
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {schedules.map((schedule, index) => (
            <div
              key={index}
              className="bg-gray-700 p-3 rounded-lg border border-gray-600"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-white">
                  {schedule.day_of_week}
                </span>
                <span className="text-xs bg-primary/80 text-white px-2 py-1 rounded-full">
                  {schedule.branch?.name || "Unknown Branch"}
                </span>
              </div>
              <div className="flex items-center text-sm text-gray-300">
                <Clock className="w-4 h-4 mr-1" />
                <span>
                  {schedule.start_time} - {schedule.end_time} (
                  {schedule.session_duration} min sessions)
                </span>
              </div>
            </div>
          ))}
          {schedules.length === 0 && (
            <div className="col-span-full text-center py-4 text-gray-400">
              <p>
                No regular time slots configured. Contact admin to set up your
                schedule.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={prevMonth}
          className="p-2 rounded-md hover:bg-gray-800 transition-colors text-white"
        >
          &lt; Prev
        </button>
        <h3 className="text-lg font-medium">
          {currentDate.toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </h3>
        <button
          onClick={nextMonth}
          className="p-2 rounded-md hover:bg-gray-800 transition-colors text-white"
        >
          Next &gt;
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-6">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="h-8 flex items-center justify-center font-medium text-sm text-gray-300"
          >
            {day}
          </div>
        ))}
        {generateCalendarDays()}
      </div>

      {/* Selected Date Sessions */}
      {selectedDate && (
        <div>
          <h3 className="text-lg font-medium mb-3 text-white">
            Sessions for{" "}
            {selectedDate.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </h3>

          <div className="space-y-3">
            {getSessionsForDate(selectedDate).length > 0 ? (
              getSessionsForDate(selectedDate).map((session) => (
                <div
                  key={session.id}
                  className="border border-gray-700 rounded-lg p-4 hover:bg-gray-800 transition-shadow"
                  data-session-id={session.id}
                  data-date={session.date}
                  data-time={session.time}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-white">{session.type}</h4>
                      <div className="flex items-center text-sm text-gray-400 mt-1">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>
                          {formatTime(session.time)} ({session.duration} min)
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-400 mt-1">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{session.branchName}</span>
                      </div>
                      {session.playerName && (
                        <div className="flex items-center text-sm text-gray-400 mt-1">
                          <User className="w-4 h-4 mr-1" />
                          <span>{session.playerName}</span>
                        </div>
                      )}
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        session.status === "booked"
                          ? "bg-green-900 text-green-100"
                          : "bg-blue-900 text-blue-100"
                      }`}
                    >
                      {session.status === "booked" ? "Booked" : "Available"}
                    </span>
                  </div>
                  {session.playerName && (
                    <div className="mt-3 flex justify-end space-x-2">
                      <SessionDetailsDialog session={session} />
                      <RescheduleDialog session={session} />
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto text-gray-600 mb-2" />
                <p>No sessions scheduled for this day</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
