import DashboardNavbar from "@/components/dashboard-navbar";
import { redirect } from "next/navigation";
import { createClient } from "../../utils/supabase/server";
import { TestAccountButtons } from "./client-actions";
import UserDashboard from "./user-dashboard";
import Link from "next/link";

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Get user data including role
  let userData = null;
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (!error && data) {
      userData = data;
    }
  } catch (error) {
    console.error("Exception fetching user data:", error);
  }

  // If no user data in database, check user metadata
  if (!userData && user.user_metadata?.role) {
    userData = {
      role: user.user_metadata.role,
    };
  }

  // Determine which dashboard options to show
  const userRole = userData?.role || "player"; // Default to player if no role

  return (
    <>
      <DashboardNavbar />
      <div className="w-full bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 mb-8 text-white">
            <h1 className="text-3xl font-bold mb-2">
              Welcome, {userData?.full_name || user.email}
            </h1>
            <p className="text-lg opacity-90 mb-6">
              Your Ramy Ashour Squash Academy Dashboard
            </p>

            {/* Dashboard Selection Cards */}
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-4">Select Your Dashboard</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Admin Dashboard - Only show if user is admin */}
                {(userRole === "admin") && (
                  <Link href="/dashboard/admin" className="bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 rounded-lg p-6 flex flex-col items-center gap-3 group">
                    <div className="bg-white/20 p-3 rounded-full group-hover:bg-white/40 transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="font-medium text-xl">Admin Dashboard</span>
                    <span className="text-sm text-center opacity-80">Manage users, content, and system settings</span>
                  </Link>
                )}
                
                {/* Coach Dashboard - Only show if user is coach or admin */}
                {(userRole === "coach" || userRole === "admin") && (
                  <Link href="/dashboard/coach" className="bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 rounded-lg p-6 flex flex-col items-center gap-3 group">
                    <div className="bg-white/20 p-3 rounded-full group-hover:bg-white/40 transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <span className="font-medium text-xl">Coach Dashboard</span>
                    <span className="text-sm text-center opacity-80">Manage sessions, schedules, and player progress</span>
                  </Link>
                )}
                
                {/* Player Dashboard - Show for everyone */}
                <Link href="/dashboard/player" className="bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 rounded-lg p-6 flex flex-col items-center gap-3 group">
                  <div className="bg-white/20 p-3 rounded-full group-hover:bg-white/40 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="font-medium text-xl">Player Dashboard</span>
                  <span className="text-sm text-center opacity-80">Book sessions, view progress, and access training</span>
                </Link>
              </div>
            </div>
          </div>

          <UserDashboard />
        </div>
      </div>

      {/* Show development tools for everyone */}
      <div className="container mx-auto px-4 py-8 mt-8 bg-white rounded-xl shadow-sm border border-gray-100">
        <h2 className="font-semibold text-xl mb-4">Development Tools</h2>
        <p className="mb-4">
          Create test accounts and manage email verification:
        </p>
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <a
              href="/api/create-test-accounts"
              target="_blank"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Test Accounts
            </a>
            <a
              href="/api/auto-confirm-emails"
              target="_blank"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Auto-Confirm Emails
            </a>
            <a
              href="/api/verify-all-emails"
              target="_blank"
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Verify All Emails
            </a>
          </div>
          <p className="text-xs text-amber-600 mb-2">
            After creating accounts, click "Verify All Emails" to bypass email
            verification.
          </p>

          <TestAccountButtons />
        </div>

        <p className="text-sm text-muted-foreground">Account credentials:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-muted-foreground">
          <li>Admin: admin@squashacademy.com / Admin123!</li>
          <li>Coach: coach@squashacademy.com / Coach123!</li>
          <li>Player: player@squashacademy.com / Player123!</li>
        </ul>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-lg mb-2">Create Verified Admin</h3>
          <p className="mb-2">
            Click the button below to create a pre-verified admin account:
          </p>
          <a
            href="/api/create-admin"
            target="_blank"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Verified Admin
          </a>
          <div className="mt-3 bg-white p-3 rounded border border-gray-200">
            <p>
              <strong>Email:</strong> verified-admin@squashacademy.com
            </p>
            <p>
              <strong>Password:</strong> Admin123!
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
