"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DatePicker } from "@/components/ui/date-picker";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

type Session = {
  id: string;
  date: string;
  time: string;
  duration: string;
  playerName: string;
  playerEmail: string;
  type: string;
  status: string;
};

export default function RescheduleDialog({ session }: { session: Session }) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date(session.date));
  const [time, setTime] = useState(session.time);

  const timeSlots = [
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
  ];

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const handleReschedule = () => {
    if (!date) return;

    alert(
      `Session rescheduled to ${format(date, "PPP")} at ${formatTime(time)}`,
    );

    // Update the session in the parent component
    document
      .querySelector(`[data-session-id="${session.id}"]`)
      ?.setAttribute("data-date", format(date, "yyyy-MM-dd"));
    document
      .querySelector(`[data-session-id="${session.id}"]`)
      ?.setAttribute("data-time", time);

    setOpen(false);

    // Force a refresh of the page to show the updated schedule
    window.location.reload();
  };

  return (
    <>
      <Button
        variant="link"
        className="text-gray-600 hover:text-gray-800 p-0 h-auto font-normal"
        onClick={() => setOpen(true)}
        data-reschedule-id={session.id}
      >
        Reschedule
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Reschedule Session</DialogTitle>
            <DialogDescription>
              Change the date and time for {session.playerName}'s {session.type}{" "}
              session
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <div className="font-medium">Select New Date</div>
              <DatePicker
                date={date}
                setDate={setDate}
                disabled={{ before: new Date() }}
              />
            </div>

            <div className="space-y-2">
              <div className="font-medium">Select New Time</div>
              <ScrollArea className="h-[150px]">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-1">
                  {timeSlots.map((slot) => (
                    <Button
                      key={slot}
                      variant={time === slot ? "default" : "outline"}
                      className={`flex items-center justify-center gap-2 ${time === slot ? "bg-blue-600" : ""}`}
                      onClick={() => setTime(slot)}
                    >
                      <Clock className="h-4 w-4" />
                      {formatTime(slot)}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div className="bg-blue-50 p-4 rounded-md">
              <div className="font-medium text-blue-800">Session Summary</div>
              <div className="text-sm text-blue-700 mt-2">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  <span>{date ? format(date, "PPP") : "Select a date"}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatTime(time)}</span>
                </div>
                <div className="mt-1">Duration: {session.duration} minutes</div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleReschedule}>Confirm Reschedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
