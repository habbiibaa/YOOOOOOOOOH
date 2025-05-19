"use client";
import { useState, useEffect } from "react";
import BookingCalendar from "@/components/booking/BookingCalendar";
import FilterControls from "@/components/booking/FilterControls";

export default function BookingSlotSelector({ branches, coaches, userId }: { branches: any[]; coaches: any[]; userId: string }) {
  const [slots, setSlots] = useState<any[]>([]);
  const [level, setLevel] = useState("");
  const [branch, setBranch] = useState("");
  const [sessionType, setSessionType] = useState("individual");
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    if (level && branch && sessionType) {
      fetchAvailableSlots({ playerLevel: level, branchId: branch, sessionType }).then(setSlots);
    }
  }, [level, branch, sessionType]);

  async function fetchAvailableSlots({ playerLevel, branchId, sessionType }: { playerLevel: string; branchId: string; sessionType: string }) {
    const res = await fetch("/api/get_available_slots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerLevel, branchId, sessionType }),
    });
    const { slots } = await res.json();
    return slots;
  }

  const formattedDate = date.toISOString().split("T")[0];

  return (
    <div>
      <FilterControls
        branches={branches}
        coaches={coaches}
        currentBranch={branch}
        currentCoach={undefined}
        currentLevel={level}
        currentDate={formattedDate}
        onBranchChange={setBranch}
        onLevelChange={setLevel}
        onDateChange={setDate}
      />
      <div className="mt-8">
        <BookingCalendar sessions={slots} startDate={date} userId={userId} />
      </div>
      <div>
        <select>
          {slots.map((slot) => (
            <option key={slot.id} value={slot.id}>
              {slot.day_of_week} {slot.start_time}-{slot.end_time} ({slot.users?.full_name})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
} 