import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import EnhancedBookingSystem from "@/components/player/enhanced-booking-system";
import DashboardNavbar from "@/components/dashboard-navbar";
import { initializeCoachesAndSchedules, generateAvailableSessions } from "../actions";

export default async function BookingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/auth/sign-in");
  }

  // Initialize coaches and schedules if they don't exist
  await initializeCoachesAndSchedules();
  
  // Generate available sessions for the next 30 days
  await generateAvailableSessions(new Date());

  // Get user data
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  // Get player data
  const { data: playerData, error: playerError } = await supabase
    .from("players")
    .select("*")
    .eq("id", user.id)
    .single();

  const userName = userData?.full_name || user.email?.split("@")[0] || "Player";
  const playerLevel = playerData?.recommended_level || null;

  return (
    <>
      <DashboardNavbar />
      <main className="min-h-screen bg-gray-950 text-white">
        <div className="container mx-auto px-4 py-8">
          <EnhancedBookingSystem 
            userId={user.id} 
            userEmail={user.email || ""} 
            userName={userName}
            playerLevel={playerLevel}
          />
        </div>
      </main>
    </>
  );
} 