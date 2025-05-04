import DashboardNavbar from "@/components/dashboard-navbar";
import { Button } from "@/components/ui/button";
import { createClient } from "../../../../../utils/supabase/server";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  Users,
  Video,
  Calendar,
  Download,
} from "lucide-react";
import Link from "next/link";

export default async function UsageReportsPage() {
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

  if (userError || userData?.role !== "admin") {
    return redirect("/dashboard");
  }

  // Mock usage data
  const usageData = {
    totalUsers: 1250,
    activeUsers: 876,
    totalVideos: 342,
    totalSessions: 1893,
    monthlyActiveUsers: [
      { month: "Jan", count: 720 },
      { month: "Feb", count: 750 },
      { month: "Mar", count: 790 },
      { month: "Apr", count: 810 },
      { month: "May", count: 845 },
      { month: "Jun", count: 876 },
    ],
    videoUploads: [
      { month: "Jan", count: 42 },
      { month: "Feb", count: 51 },
      { month: "Mar", count: 63 },
      { month: "Apr", count: 58 },
      { month: "May", count: 67 },
      { month: "Jun", count: 61 },
    ],
    sessionBookings: [
      { month: "Jan", count: 267 },
      { month: "Feb", count: 289 },
      { month: "Mar", count: 312 },
      { month: "Apr", count: 325 },
      { month: "May", count: 341 },
      { month: "Jun", count: 359 },
    ],
  };

  return (
    <>
      <DashboardNavbar />
      <main className="w-full bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard/admin"
                className="text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-2xl font-bold">Usage Reports</h1>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export PDF
              </Button>
            </div>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Users</p>
                  <p className="text-2xl font-bold">{usageData.totalUsers}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 text-xs text-green-600 flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                  />
                </svg>
                <span>+12.5% from last month</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Active Users</p>
                  <p className="text-2xl font-bold">{usageData.activeUsers}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4 text-xs text-green-600 flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                  />
                </svg>
                <span>+3.7% from last month</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Videos</p>
                  <p className="text-2xl font-bold">{usageData.totalVideos}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <Video className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4 text-xs text-green-600 flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                  />
                </svg>
                <span>+8.9% from last month</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Sessions</p>
                  <p className="text-2xl font-bold">
                    {usageData.totalSessions}
                  </p>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                  <Calendar className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <div className="mt-4 text-xs text-green-600 flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                  />
                </svg>
                <span>+5.3% from last month</span>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Monthly Active Users</h2>
                <div className="flex items-center gap-2">
                  <select className="text-sm border border-gray-300 rounded-md px-2 py-1">
                    <option>Last 6 months</option>
                    <option>Last 12 months</option>
                    <option>Last 3 months</option>
                  </select>
                </div>
              </div>
              <div className="h-64 flex items-end justify-between">
                {usageData.monthlyActiveUsers.map((item) => (
                  <div key={item.month} className="flex flex-col items-center">
                    <div
                      className="w-12 bg-blue-500 rounded-t-md"
                      style={{ height: `${(item.count / 1000) * 200}px` }}
                    ></div>
                    <p className="text-xs mt-2">{item.month}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">
                  Video Uploads vs Session Bookings
                </h2>
                <div className="flex items-center gap-2">
                  <select className="text-sm border border-gray-300 rounded-md px-2 py-1">
                    <option>Last 6 months</option>
                    <option>Last 12 months</option>
                    <option>Last 3 months</option>
                  </select>
                </div>
              </div>
              <div className="h-64 flex items-end justify-between">
                {usageData.monthlyActiveUsers.map((item, index) => (
                  <div key={item.month} className="flex flex-col items-center">
                    <div className="flex items-end">
                      <div
                        className="w-5 bg-purple-500 rounded-t-md mr-1"
                        style={{
                          height: `${(usageData.videoUploads[index].count / 100) * 200}px`,
                        }}
                      ></div>
                      <div
                        className="w-5 bg-orange-500 rounded-t-md"
                        style={{
                          height: `${(usageData.sessionBookings[index].count / 400) * 200}px`,
                        }}
                      ></div>
                    </div>
                    <p className="text-xs mt-2">{item.month}</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-center mt-4 gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-xs">Video Uploads</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-xs">Session Bookings</span>
                </div>
              </div>
            </div>
          </div>

          {/* Usage Breakdown */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">
                Platform Usage Breakdown
              </h2>
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                      Feature
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                      Total Usage
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                      Active Users
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                      Growth
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4">Video Analysis</td>
                    <td className="py-3 px-4">342 uploads</td>
                    <td className="py-3 px-4">215 users</td>
                    <td className="py-3 px-4 text-green-600">+8.9%</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4">Session Booking</td>
                    <td className="py-3 px-4">1,893 bookings</td>
                    <td className="py-3 px-4">632 users</td>
                    <td className="py-3 px-4 text-green-600">+5.3%</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4">Training Library</td>
                    <td className="py-3 px-4">4,567 views</td>
                    <td className="py-3 px-4">789 users</td>
                    <td className="py-3 px-4 text-green-600">+12.1%</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4">Progress Tracking</td>
                    <td className="py-3 px-4">2,345 views</td>
                    <td className="py-3 px-4">512 users</td>
                    <td className="py-3 px-4 text-green-600">+7.2%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
