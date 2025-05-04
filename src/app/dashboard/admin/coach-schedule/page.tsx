import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import CoachScheduleManager from "@/components/admin/coach-schedule-manager";
import DashboardNavbar from "@/components/dashboard-navbar";

export default async function CoachSchedulePage() {
  const supabase = await createClient();

  // Verify user is authenticated and has admin rights
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Check if user is admin
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userError || !userData || userData.role !== "admin") {
    return redirect("/dashboard");
  }

  return (
    <>
      <DashboardNavbar />
      <main className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Coach Schedule Management</h1>
          <CoachScheduleManager />
        </div>
      </main>
    </>
  );
} 