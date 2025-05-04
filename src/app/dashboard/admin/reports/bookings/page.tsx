import DashboardNavbar from "@/components/dashboard-navbar";
import { Button } from "@/components/ui/button";
import { createClient } from "../../../../../utils/supabase/server";
import { redirect } from "next/navigation";
import { ArrowLeft, Calendar, Download, BarChart3 } from "lucide-react";
import Link from "next/link";

export default async function BookingStatisticsPage() {
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

  // Mock booking data
  const bookingData = {
    totalBookings: 1893,
    completedSessions: 1562,
    cancelledSessions: 331,
    averageSessionLength: 60,
    monthlyBookings: [
      { month: "Jan", count: 267 },
      { month: "Feb", count: 289 },
      { month: "Mar", count: 312 },
      { month: "Apr", count: 325 },
      { month: "May", count: 341 },
      { month: "Jun", count: 359 },
    ],
    topCoaches: [
      { name: "Coach Mike", sessions: 423, rating: 4.9 },
      { name: "Coach Sarah", sessions: 387, rating: 4.8 },
      { name: "Coach David", sessions: 356, rating: 4.7 },
      { name: "Coach Emma", sessions: 298, rating: 4.9 },
      { name: "Coach John", sessions: 245, rating: 4.6 },
    ],
    popularSessionTypes: [
      { type: "Technical Training", count: 745 },
      { type: "Match Strategy", count: 523 },
      { type: "Fitness Training", count: 412 },
      { type: "Beginner Lessons", count: 213 },
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
              <h1 className="text-2xl font-bold">Booking Statistics</h1>
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
                  <p className="text-sm text-gray-500 mb-1">Total Bookings</p>
                  <p className="text-2xl font-bold">
                    {bookingData.totalBookings}
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Calendar className="w-6 h-6 text-blue-600" />
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

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    Completed Sessions
                  </p>
                  <p className="text-2xl font-bold">
                    {bookingData.completedSessions}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
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
                <span>+4.8% from last month</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    Cancelled Sessions
                  </p>
                  <p className="text-2xl font-bold">
                    {bookingData.cancelledSessions}
                  </p>
                </div>
                <div className="bg-red-100 p-3 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
              </div>
              <div className="mt-4 text-xs text-red-600 flex items-center gap-1">
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
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
                <span>-2.1% from last month</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    Avg. Session Length
                  </p>
                  <p className="text-2xl font-bold">
                    {bookingData.averageSessionLength} min
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-purple-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="mt-4 text-xs text-gray-500 flex items-center gap-1">
                <span>No change from last month</span>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Monthly Bookings</h2>
                <div className="flex items-center gap-2">
                  <select className="text-sm border border-gray-300 rounded-md px-2 py-1">
                    <option>Last 6 months</option>
                    <option>Last 12 months</option>
                    <option>Last 3 months</option>
                  </select>
                </div>
              </div>
              <div className="h-64 flex items-end justify-between">
                {bookingData.monthlyBookings.map((item) => (
                  <div key={item.month} className="flex flex-col items-center">
                    <div
                      className="w-12 bg-blue-500 rounded-t-md"
                      style={{ height: `${(item.count / 400) * 200}px` }}
                    ></div>
                    <p className="text-xs mt-2">{item.month}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Popular Session Types</h2>
                <div className="flex items-center gap-2">
                  <select className="text-sm border border-gray-300 rounded-md px-2 py-1">
                    <option>All Time</option>
                    <option>This Year</option>
                    <option>This Month</option>
                  </select>
                </div>
              </div>
              <div className="h-64 flex flex-col justify-center space-y-4">
                {bookingData.popularSessionTypes.map((item) => (
                  <div key={item.type} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{item.type}</span>
                      <span className="font-medium">{item.count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(item.count / 800) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Coaches */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
            <h2 className="text-lg font-semibold mb-6">
              Top Performing Coaches
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                      Coach
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                      Sessions Completed
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                      Average Rating
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                      Performance
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {bookingData.topCoaches.map((coach, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-3 px-4 font-medium">{coach.name}</td>
                      <td className="py-3 px-4">{coach.sessions}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <span className="mr-2">{coach.rating}</span>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                xmlns="http://www.w3.org/2000/svg"
                                className={`h-4 w-4 ${i < Math.floor(coach.rating) ? "text-yellow-400" : "text-gray-300"}`}
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{
                              width: `${(coach.sessions / 500) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Booking Trends */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Booking Trends</h2>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                View Detailed Report
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 border border-gray-100 rounded-lg">
                <h3 className="font-medium mb-2">Peak Booking Times</h3>
                <p className="text-gray-600 mb-2">
                  Most bookings occur between:
                </p>
                <ul className="space-y-1 text-sm">
                  <li className="flex justify-between">
                    <span>Weekdays</span>
                    <span className="font-medium">4:00 PM - 7:00 PM</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Weekends</span>
                    <span className="font-medium">9:00 AM - 12:00 PM</span>
                  </li>
                </ul>
              </div>
              <div className="p-4 border border-gray-100 rounded-lg">
                <h3 className="font-medium mb-2">Booking Lead Time</h3>
                <p className="text-gray-600 mb-2">
                  Average time before session:
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Same day</span>
                    <span className="font-medium">15%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>1-3 days</span>
                    <span className="font-medium">45%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>4-7 days</span>
                    <span className="font-medium">30%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>8+ days</span>
                    <span className="font-medium">10%</span>
                  </div>
                </div>
              </div>
              <div className="p-4 border border-gray-100 rounded-lg">
                <h3 className="font-medium mb-2">Cancellation Rate</h3>
                <div className="flex items-center justify-center h-32">
                  <div className="relative w-32 h-32">
                    <svg viewBox="0 0 36 36" className="w-full h-full">
                      <path
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#eee"
                        strokeWidth="3"
                      />
                      <path
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#f87171"
                        strokeWidth="3"
                        strokeDasharray="100, 100"
                        strokeDashoffset="82.5"
                      />
                      <text
                        x="18"
                        y="20.5"
                        className="text-lg font-medium"
                        textAnchor="middle"
                        fill="#374151"
                      >
                        17.5%
                      </text>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
