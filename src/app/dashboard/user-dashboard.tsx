import { createClient } from "../../utils/supabase/server";
import { Database, Tables } from "@/types/supabase";
import { Calendar, Video, LineChart, BookOpen, Clock } from "lucide-react";

export default async function UserDashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="p-8 text-center">
        <p>Please sign in to view your dashboard</p>
      </div>
    );
  }

  // Get user data
  let userData = null;
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Error fetching user data:", error);
    } else {
      userData = data;
    }
  } catch (error) {
    console.error("Exception fetching user data:", error);
  }

  // If no user data found, create a default object with user's email
  if (!userData) {
    userData = {
      email: user.email,
      full_name: user.user_metadata?.full_name || "New User",
      role: user.user_metadata?.role || "user",
    };
  }

  // Mock data for sessions
  const sessions = [
    {
      date: "July 5, 2023",
      time: "10:00 AM",
      coach: "Coach Mike",
      type: "Technical Training",
      status: "Completed",
    },
    {
      date: "July 8, 2023",
      time: "2:00 PM",
      coach: "Coach Sarah",
      type: "Match Strategy",
      status: "Upcoming",
    },
    {
      date: "July 12, 2023",
      time: "11:00 AM",
      coach: "Coach David",
      type: "Fitness Training",
      status: "Upcoming",
    },
  ];

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* User Profile */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-blue-100">
              <div className="absolute inset-0 flex items-center justify-center text-blue-600 font-bold text-2xl">
                {userData?.full_name
                  ?.split(" ")
                  .map((name) => name[0])
                  .join("")}
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{userData?.full_name}</h2>
              <p className="text-gray-600">{userData?.email}</p>
              <div className="mt-2">
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {userData?.role?.charAt(0).toUpperCase() +
                    userData?.role?.slice(1)}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Membership</p>
                  <p className="font-medium">
                    {userData?.role === "admin" ? "Admin Account" : "Level 3"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Sessions This Month</p>
                  <p className="font-medium">8 / 12</p>
                </div>
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Upcoming Sessions</p>
                <p className="text-2xl font-bold">2</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Training Hours</p>
                <p className="text-2xl font-bold">24</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Videos Uploaded</p>
                <p className="text-2xl font-bold">5</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Video className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Progress Score</p>
                <p className="text-2xl font-bold">78</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <LineChart className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Sessions */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <h2 className="text-xl font-semibold mb-4">Your Sessions</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Date & Time
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Coach
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Type
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-3 px-4">
                      {session.date} • {session.time}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden bg-blue-100 mr-2">
                          <div className="absolute inset-0 flex items-center justify-center text-blue-600 font-bold text-xs">
                            {session.coach
                              .split(" ")
                              .map((name) => name[0])
                              .join("")}
                          </div>
                        </div>
                        <span>{session.coach}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">{session.type}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          session.status === "Completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {session.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button className="text-blue-600 hover:text-blue-800 mr-2">
                        Details
                      </button>
                      {session.status === "Upcoming" && (
                        <button className="text-red-600 hover:text-red-800">
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Training Content */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Recommended Training</h2>
            <button className="text-sm text-blue-600 hover:underline">
              View All
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Backhand Technique",
                coach: "Ramy Ashour",
                duration: "15 min",
                level: "Intermediate",
              },
              {
                title: "Match Strategy Basics",
                coach: "Coach Sarah",
                duration: "20 min",
                level: "Beginner",
              },
              {
                title: "Advanced Footwork",
                coach: "Coach Mike",
                duration: "25 min",
                level: "Advanced",
              },
            ].map((content, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <div className="relative aspect-video bg-gray-100">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BookOpen className="w-12 h-12 text-gray-400" />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-1">{content.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    By {content.coach} • {content.duration}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {content.level}
                    </span>
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      Watch Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
