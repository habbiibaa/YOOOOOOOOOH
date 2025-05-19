import { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import BookingSlotSelector from "@/components/booking/BookingSlotSelector";
import { useState } from "react";

export const metadata: Metadata = {
  title: "Book a Session | Ramy Ashour Squash Academy",
  description: "Book a squash session with our coaches",
};
export default async function BookingSchedulePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const supabase = await createClient();
  
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  
  // Get all branches
  const { data: branches } = await supabase
    .from("branches")
    .select("id, name")
    .order("name");
  
  // Get all coaches
  const { data: coaches } = await supabase
    .from("users")
    .select("id, first_name, last_name")
    .eq("role", "coach")
    .order("first_name");

  const [level, setLevel] = useState("1");
  const [branch, setBranch] = useState(branches[0]?.id || "");

  console.log("BookingCalendar slots:", slots);

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-2">Book a Session</h1>
      <p className="text-gray-600 mb-6">Book a squash training session with one of our coaches</p>
      <BookingSlotSelector branches={branches || []} coaches={coaches || []} userId={user?.id || ''} />
      {data.slot && (
        <button
          className="mt-2 bg-green-500 text-white px-3 py-1 rounded"
          onClick={() => bookSlot(data.slot.id)}
        >
          Book this slot
        </button>
      )}
    </div>
  );
} 