import DashboardNavbar from "@/components/dashboard-navbar";
import { redirect } from "next/navigation";
import { createClient } from "../../../utils/supabase/server";
import { Calendar, Clock, Video, MessageSquare } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import VideoReviewDialog from "@/components/coach/video-review-dialog";

// Define coach data type based on database schema
interface CoachData {
  id: string;
  name: string;
  specialties: string[];
  available_levels: string[];
  rating: number;
}

export default async function CoachDashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Get user data including role
  let { data: userData, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (userError) {
    console.error("Error fetching user data:", userError);
  }

  // If no user data or wrong role, create default coach record
  if (!userData || userData.role !== "coach") {
    try {
      // Create or update user record with coach role
      const { error: userUpdateError } = await supabase.from("users").upsert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || "Coach User",
        role: "coach",
        created_at: new Date().toISOString(),
      });

      if (userUpdateError) {
        console.error("Error updating user record:", userUpdateError);
      }

      // Check if the coaches table exists and has the expected schema
      const { data: tableInfo, error: tableError } = await supabase
        .from('coaches')
        .select('*')
        .limit(1);
      
      // Only try to create coach record if the table exists
      if (!tableError) {
        // Create coach record if it doesn't exist
        // Match the schema from database.ts
        const { error: coachCreateError } = await supabase
          .from("coaches")
          .upsert({
            id: user.id,
            name: user.user_metadata?.full_name || "Coach User",
            specialties: ["Technical training"],
            available_levels: ["Beginner", "Intermediate", "Advanced"],
            rating: 5
          });

        if (coachCreateError) {
          console.error("Error creating coach record:", coachCreateError);
        }
      }

      // Refresh user data
      const { data: refreshedData } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (refreshedData) {
        userData = refreshedData;
      }
    } catch (err) {
      console.error("Error setting up coach account:", err);
    }
  }

  // Get coach details
  let coachData: CoachData | null = null;
  try {
    // First check if coach record exists and table is available
    const { count, error: countError } = await supabase
      .from("coaches")
      .select("*", { count: "exact", head: true })
      .eq("id", user.id);

    // Only try to fetch if record exists
    if (!countError && count && count > 0) {
      const { data, error } = await supabase
        .from("coaches")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!error) {
        coachData = data as CoachData;
      } else {
        console.error("Error fetching coach data:", error);
      }
    } else if (!countError) {
      // Create default coach record if it doesn't exist
      const { data, error } = await supabase
        .from("coaches")
        .upsert({
          id: user.id,
          name: userData?.full_name || user.email?.split("@")[0] || "Coach User",
          specialties: ["Technical training"],
          available_levels: ["Beginner", "Intermediate", "Advanced"],
          rating: 5
        })
        .select()
        .single();

      if (!error) {
        coachData = data as CoachData;
      } else {
        console.error("Error creating default coach record:", error);
      }
    }
  } catch (err) {
    console.error("Exception fetching coach data:", err);
  }

  // Create a mock video for the VideoReviewDialog
  const mockVideo = {
    id: "demo-video",
    playerName: "Demo Player",
    title: "Technique Demonstration",
    uploadDate: new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
  };

  return (
    <>
      <DashboardNavbar />
      <main className="w-full bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Header Section */}
          <header className="mb-8">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 animate-gradient-text">
              Welcome,{" "}
              {userData?.full_name || user.email?.split("@")[0] || "Coach"}
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your sessions, review player videos, and track progress
            </p>
          </header>

          {/* Coach Profile */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="relative w-24 h-24 rounded-full overflow-hidden bg-blue-100">
                {userData?.avatar_url ? (
                  <Image
                    src={userData.avatar_url}
                    alt={userData?.full_name || "User"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-blue-600 font-bold text-2xl">
                    {userData?.full_name
                      ?.split(" ")
                      .map((name) => name[0])
                      .join("")}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{userData?.full_name}</h2>
                <p className="text-gray-600">{userData?.email}</p>
                <div className="mt-2">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    Professional Coach
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Specialization</p>
                    <p className="font-medium">
                      {coachData?.specialties?.join(", ") || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Experience</p>
                    <p className="font-medium">
                      Professional Coach
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Rating</p>
                    <p className="font-medium">
                      {coachData?.rating || 5}/5
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Available Levels</p>
                    <p className="font-medium">
                      {coachData?.available_levels?.join(", ") || "All levels"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4 md:mt-0">
                <Link href="/dashboard/edit-profile">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Edit Profile
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    Upcoming Sessions
                  </p>
                  <p className="text-2xl font-bold">5</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Hours This Week</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Videos to Review</p>
                  <p className="text-2xl font-bold">8</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <Video className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Messages</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
                <div className="bg-amber-100 p-3 rounded-full">
                  <MessageSquare className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Placeholder for actual content */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
            <h2 className="text-xl font-semibold mb-4">Upcoming Sessions</h2>
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-gray-500">No upcoming sessions scheduled.</p>
              <Link href="/dashboard/coach/schedule">
                <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Manage Schedule
                </button>
              </Link>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
            <h2 className="text-xl font-semibold mb-4">Videos to Review</h2>
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-gray-500">No videos waiting for review.</p>
              <VideoReviewDialog video={mockVideo} />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
