import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import BookSession from "@/components/booking/book-session";

export default async function BookSessionPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  // Fetch user details
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("id, full_name, email, role")
    .eq("id", user.id)
    .single();

  if (userError || !userData) {
    console.error("Error fetching user data:", userError);
    return redirect("/dashboard");
  }

  // Ensure role is appropriate
  if (userData.role !== "student") {
    return redirect("/dashboard");
  }

  // Fetch coaches
  const { data: coaches, error: coachError } = await supabase
    .from("users")
    .select("id, full_name")
    .eq("role", "coach")
    .eq("approved", true);

  if (coachError) {
    console.error("Error fetching coaches:", coachError);
  }

  // Fetch branches
  const { data: branches, error: branchError } = await supabase
    .from("branches")
    .select("id, name, location");

  if (branchError) {
    console.error("Error fetching branches:", branchError);
  }

  // Fetch available sessions
  const { data: sessions, error: sessionsError } = await supabase
    .from("coach_sessions")
    .select(`
      id,
      coach_id,
      users:coach_id (id, full_name),
      branch_id,
      branches:branch_id (id, name, location),
      day_of_week,
      start_time,
      end_time,
      session_duration,
      max_attendees,
      level,
      type,
      price,
      status
    `)
    .eq("status", "available")
    .order("day_of_week", { ascending: true })
    .order("start_time", { ascending: true });

  if (sessionsError) {
    console.error("Error fetching sessions:", sessionsError);
  }

  // Format sessions for display
  const formattedSessions = sessions?.map(session => ({
    id: session.id,
    coach_id: session.coach_id,
    coach_name: session.users?.full_name || "Unknown Coach",
    branch_id: session.branch_id,
    branch_name: session.branches?.name || "Unknown Branch",
    branch_location: session.branches?.location || "",
    day_of_week: session.day_of_week,
    start_time: session.start_time,
    end_time: session.end_time,
    session_duration: session.session_duration,
    max_attendees: session.max_attendees,
    level: session.level,
    type: session.type,
    price: session.price || 0,
    status: session.status
  })) || [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Book a Session</h1>
      <BookSession 
        sessions={formattedSessions} 
        coaches={coaches || []} 
        branches={branches || []} 
        userId={user.id}
      />
    </div>
  );
} 