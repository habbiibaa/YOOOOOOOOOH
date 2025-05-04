// src/features/booking/components/AvailabilityCalendar/AvailabilityCalendar.tsx
import { useState, useEffect } from 'react';
import { format, addDays, isSameDay, parseISO } from 'date-fns';
import { TimeSlot } from '../types/bookingTypes';

interface AvailabilityCalendarProps {
  coachId: string;
  sessionDuration: number;
  playerLevel: string;
  onSlotSelect: (slot: TimeSlot) => void;
}

export const AvailabilityCalendar = ({
  coachId,
  sessionDuration,
  playerLevel,
  onSlotSelect
}: AvailabilityCalendarProps) => {
  const [dates, setDates] = useState<Date[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Generate next 14 days
    const today = new Date();
    const nextDates = Array.from({ length: 14 }, (_, i) => addDays(today, i));
    setDates(nextDates);
  }, []);

  useEffect(() => {
    if (selectedDate && coachId) {
      fetchTimeSlots();
    }
  }, [selectedDate, coachId]);

  const fetchTimeSlots = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/availability?coachId=${coachId}&date=${selectedDate?.toISOString()}&duration=${sessionDuration}&level=${playerLevel}`
      );
      const slots = await response.json();
      setTimeSlots(slots);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="availability-calendar">
      <h3>Select Date & Time</h3>
      
      <div className="date-selector">
        {dates.map(date => (
          <div
            key={date.toString()}
            className={`date-card ${selectedDate && isSameDay(date, selectedDate) ? 'selected' : ''}`}
            onClick={() => setSelectedDate(date)}
          >
            {format(date, 'EEE')}<br />
            {format(date, 'MMM d')}
          </div>
        ))}
      </div>
      
      {loading ? (
        <div className="loading-slots">Loading available times...</div>
      ) : (
        <div className="time-slots">
          {timeSlots.map(slot => (
            <button
              key={slot.start}
              className={`time-slot ${slot.available ? '' : 'unavailable'}`}
              disabled={!slot.available}
              onClick={() => onSlotSelect(slot)}
            >
              {format(parseISO(slot.start), 'h:mm a')}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};