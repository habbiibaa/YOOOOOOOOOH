import DashboardNavbar from "@/components/dashboard-navbar";
import { Button } from "@/components/ui/button";
import { createClient } from "../../../../../utils/supabase/server";
import { redirect } from "next/navigation";
import { ArrowLeft, Download, BarChart3, Video, Clock } from "lucide-react";
import Link from "next/link";

export default async function AIMetricsPage() {
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

  // Mock AI metrics data
  const aiMetricsData = {
    totalVideosAnalyzed: 1256,
    averageProcessingTime: "2.3 minutes",
    accuracyRate: "94.7%",
    userSatisfaction: "4.8/5",
    monthlyAnalyses: [
      { month: "Jan", count: 156 },
      { month: "Feb", count: 178 },
      { month: "Mar", count: 203 },
      { month: "Apr", count: 215 },
      { month: "May", count: 242 },
      { month: "Jun", count: 262 },
    ],
    detectionCategories: [
      { category: "Technique Analysis", accuracy: 96.2 },
      { category: "Movement Tracking", accuracy: 94.5 },
      { category: "Shot Power", accuracy: 92.8 },
      { category: "Footwork", accuracy: 95.3 },
      { category: "Racket Position", accuracy: 93.9 },
    ],
    improvementAreas: [
      { area: "Backhand Technique", count: 423 },
      { area: "Footwork", count: 387 },
      { area: "Serve Technique", count: 356 },
      { area: "Court Positioning", count: 298 },
      { area: "Shot Selection", count: 245 },
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
              <h1 className="text-2xl font-bold">AI Performance Metrics</h1>
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
                  <p className="text-sm text-gray-500 mb-1">Videos Analyzed</p>
                  <p className="text-2xl font-bold">
                    {aiMetricsData.totalVideosAnalyzed}
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Video className="w-6 h-6 text-blue-600" />
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
                <span>+8.3% from last month</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Processing Time</p>
                  <p className="text-2xl font-bold">
                    {aiMetricsData.averageProcessingTime}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <Clock className="w-6 h-6 text-green-600" />
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
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
                <span>-0.2 min from last month</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Accuracy Rate</p>
                  <p className="text-2xl font-bold">
                    {aiMetricsData.accuracyRate}
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
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
                <span>+0.5% from last month</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    User Satisfaction
                  </p>
                  <p className="text-2xl font-bold">
                    {aiMetricsData.userSatisfaction}
                  </p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-yellow-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
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
                <span>+0.1 from last month</span>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">
                  Monthly Video Analyses
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
                {aiMetricsData.monthlyAnalyses.map((item) => (
                  <div key={item.month} className="flex flex-col items-center">
                    <div
                      className="w-12 bg-purple-500 rounded-t-md"
                      style={{ height: `${(item.count / 300) * 200}px` }}
                    ></div>
                    <p className="text-xs mt-2">{item.month}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">
                  Detection Accuracy by Category
                </h2>
                <div className="flex items-center gap-2">
                  <select className="text-sm border border-gray-300 rounded-md px-2 py-1">
                    <option>All Time</option>
                    <option>This Year</option>
                    <option>This Month</option>
                  </select>
                </div>
              </div>
              <div className="h-64 flex flex-col justify-center space-y-4">
                {aiMetricsData.detectionCategories.map((item) => (
                  <div key={item.category} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{item.category}</span>
                      <span className="font-medium">{item.accuracy}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${item.accuracy}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Common Improvement Areas */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
            <h2 className="text-lg font-semibold mb-6">
              Most Common Improvement Areas
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                      Area
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                      Occurrences
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                      Percentage
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                      Distribution
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {aiMetricsData.improvementAreas.map((area, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-3 px-4 font-medium">{area.area}</td>
                      <td className="py-3 px-4">{area.count}</td>
                      <td className="py-3 px-4">
                        {Math.round(
                          (area.count / aiMetricsData.totalVideosAnalyzed) *
                            100,
                        )}
                        %
                      </td>
                      <td className="py-3 px-4 w-1/3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(area.count / 500) * 100}%` }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI System Performance */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">AI System Performance</h2>
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
                <h3 className="font-medium mb-2">Processing Metrics</h3>
                <ul className="space-y-2">
                  <li className="flex justify-between text-sm">
                    <span>Average Queue Time</span>
                    <span className="font-medium">12.3 seconds</span>
                  </li>
                  <li className="flex justify-between text-sm">
                    <span>Video Processing</span>
                    <span className="font-medium">1.8 minutes</span>
                  </li>
                  <li className="flex justify-between text-sm">
                    <span>Analysis Generation</span>
                    <span className="font-medium">30.5 seconds</span>
                  </li>
                  <li className="flex justify-between text-sm">
                    <span>Total Processing</span>
                    <span className="font-medium">2.3 minutes</span>
                  </li>
                </ul>
              </div>
              <div className="p-4 border border-gray-100 rounded-lg">
                <h3 className="font-medium mb-2">System Load</h3>
                <p className="text-gray-600 mb-2">
                  Current system utilization:
                </p>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>CPU Usage</span>
                      <span className="font-medium">62%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: "62%" }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Memory Usage</span>
                      <span className="font-medium">78%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-600 h-2 rounded-full"
                        style={{ width: "78%" }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Storage Usage</span>
                      <span className="font-medium">45%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: "45%" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4 border border-gray-100 rounded-lg">
                <h3 className="font-medium mb-2">Model Versions</h3>
                <ul className="space-y-2">
                  <li className="flex justify-between text-sm">
                    <span>Technique Analysis</span>
                    <span className="font-medium">v2.3.1</span>
                  </li>
                  <li className="flex justify-between text-sm">
                    <span>Movement Tracking</span>
                    <span className="font-medium">v1.9.4</span>
                  </li>
                  <li className="flex justify-between text-sm">
                    <span>Shot Power</span>
                    <span className="font-medium">v1.5.2</span>
                  </li>
                  <li className="flex justify-between text-sm">
                    <span>Footwork Analysis</span>
                    <span className="font-medium">v2.1.0</span>
                  </li>
                  <li className="flex justify-between text-sm">
                    <span>Racket Position</span>
                    <span className="font-medium">v1.8.3</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
