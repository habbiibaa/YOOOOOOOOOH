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
import { Calendar, Clock, MapPin, User, Phone } from "lucide-react";
import { useState } from "react";

type Session = {
  id: string;
  date: string;
  time: string;
  duration: string;
  playerName: string;
  playerEmail: string;
  playerPhone?: string;
  type: string;
  status: string;
  location?: string;
};

export default function SessionDetailsDialog({
  session,
}: {
  session: Session;
}) {
  const [open, setOpen] = useState(false);

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  // Default location if not provided
  const location =
    session.location || "Ramy Ashour Squash Academy - Obour Branch";

  return (
    <>
      <Button
        variant="link"
        className="text-blue-600 hover:text-blue-800 p-0 h-auto font-normal"
        onClick={() => setOpen(true)}
      >
        View Details
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Session Details</DialogTitle>
            <DialogDescription>
              Details for your scheduled training session
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="flex items-start gap-4 border-b pb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium">Date & Time</h3>
                <p className="text-gray-600">{formatDate(session.date)}</p>
                <p className="text-gray-600">
                  {formatTime(session.time)} ({session.duration} minutes)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 border-b pb-4">
              <div className="bg-green-100 p-3 rounded-full">
                <User className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium">Player Information</h3>
                <p className="text-gray-600">{session.playerName}</p>
                <p className="text-gray-600">{session.playerEmail}</p>
                {session.playerPhone && (
                  <p className="text-gray-600 flex items-center gap-1">
                    <Phone className="h-3 w-3" /> {session.playerPhone}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-4 border-b pb-4">
              <div className="bg-purple-100 p-3 rounded-full">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium">Session Type</h3>
                <p className="text-gray-600">{session.type}</p>
                <p className="text-gray-600">
                  Status:{" "}
                  <span
                    className={`inline-block px-2 py-1 text-xs rounded-full ${session.status === "Confirmed" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}`}
                  >
                    {session.status}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-orange-100 p-3 rounded-full">
                <MapPin className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Location</h3>
                <p className="text-gray-600 mb-3">{location}</p>
                <div className="w-full h-[250px] rounded-lg overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4127.264604520596!2d31.473828375558796!3d30.176627174857312!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14581a588fa8c30b%3A0xdc8ec73f51a8484c!2sRamy%20Ashour%20Squash%20Academy!5e1!3m2!1sen!2seg!4v1741657466885!5m2!1sen!2seg"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-between items-center">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="text-blue-600 border-blue-600"
                onClick={() => {
                  setOpen(false);
                  // This would ideally trigger the reschedule dialog
                  // For now we'll just show an alert
                  setTimeout(() => {
                    document
                      .querySelector(
                        '[data-reschedule-id="' + session.id + '"]',
                      )
                      ?.click();
                  }, 100);
                }}
              >
                Reschedule
              </Button>
              <Button variant="destructive">Cancel Session</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
