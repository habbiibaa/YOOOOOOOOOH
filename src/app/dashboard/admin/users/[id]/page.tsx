import DashboardNavbar from "@/components/dashboard-navbar";
import { Button } from "@/components/ui/button";
import { createClient } from "../../../../../utils/supabase/server";
import { redirect } from "next/navigation";
import { ArrowLeft, Mail, Calendar, Phone, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { DeleteUserButton, UpdateRoleButton } from "./client-actions";

export default async function ViewUserPage({
  params,
}: {
  params: { id: string };
}) {
  const userId = params.id;
  const supabase = await createClient();

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  if (!currentUser) {
    return redirect("/sign-in");
  }

  // Get current user data to check if admin
  let { data: currentUserData, error: currentUserError } = await supabase
    .from("users")
    .select("*")
    .eq("id", currentUser.id);

  if (
    currentUserError ||
    !currentUserData ||
    currentUserData.length === 0 ||
    currentUserData[0]?.role !== "admin"
  ) {
    return redirect("/dashboard");
  }

  // Get user data for the requested user ID
  let { data: userData, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .limit(1);

  if (userError || !userData || userData.length === 0) {
    console.error("Error or empty result when fetching user data:", {
      userError,
      userData,
    });
    console.error("Error fetching user data:", userError);
    return (
      <>
        <DashboardNavbar />
        <main className="w-full bg-gray-50 min-h-screen">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center gap-2 mb-6">
              <Link
                href="/dashboard/admin/users"
                className="text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-2xl font-bold text-black">User Not Found</h1>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <p className="text-black">
                The requested user could not be found.
              </p>
              <Link href="/dashboard/admin/users" className="mt-4 inline-block">
                <Button>Back to Users</Button>
              </Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  // Get role-specific data
  let roleData = null;
  const userRecord = userData[0];
  if (userRecord?.role === "coach") {
    const { data, error: coachError } = await supabase
      .from("coaches")
      .select("*")
      .eq("id", userId)
      .limit(1);
    if (!coachError && data && data.length > 0) roleData = data[0];
  } else if (userRecord?.role === "player") {
    const { data, error: playerError } = await supabase
      .from("players")
      .select("*")
      .eq("id", userId)
      .limit(1);
    if (!playerError && data && data.length > 0) roleData = data[0];
  }

  return (
    <>
      <DashboardNavbar />
      <main className="w-full bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard/admin/users"
                className="text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-2xl font-bold text-black">User Profile</h1>
            </div>
            <div className="flex gap-2">
              <Link href={`/dashboard/admin/users/${userId}/edit`}>
                <Button className="bg-primary hover:bg-primary/90">
                  Edit User
                </Button>
              </Link>
              <DeleteUserButton userId={userId} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="relative w-24 h-24 rounded-full overflow-hidden bg-primary/10">
                {userRecord.avatar_url ? (
                  <Image
                    src={userRecord.avatar_url}
                    alt={userRecord.full_name || "User"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-primary font-bold text-2xl">
                    {userRecord.full_name
                      ?.split(" ")
                      .map((name: string) => name[0])
                      .join("") || <User className="w-12 h-12" />}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-black">
                  {userRecord.full_name}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <p className="text-black">{userRecord.email}</p>
                </div>
                {userRecord.phone && (
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <p className="text-black">{userRecord.phone}</p>
                  </div>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <p className="text-black">
                    Joined:{" "}
                    {new Date(userRecord.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      userRecord.role === "admin"
                        ? "bg-purple-100 text-purple-800"
                        : userRecord.role === "coach"
                          ? "bg-green-100 text-green-800"
                          : "bg-primary/20 text-primary"
                    }`}
                  >
                    {userRecord.role?.charAt(0).toUpperCase() +
                      userRecord.role?.slice(1) || "User"}
                  </span>
                  <UpdateRoleButton
                    userId={userId}
                    currentRole={userRecord.role}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Role-specific information */}
          {userRecord?.role === "coach" && roleData && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4 text-black">
                Coach Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-700">Specialization</h3>
                  <p className="text-black">
                    {roleData.specialization || "Not specified"}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">
                    Years of Experience
                  </h3>
                  <p className="text-black">
                    {roleData.years_experience || 0} years
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Hourly Rate</h3>
                  <p className="text-black">
                    ${roleData.hourly_rate || 0}/hour
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Bio</h3>
                  <p className="text-black">
                    {roleData.bio || "No bio available"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {userRecord?.role === "player" && roleData && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4 text-black">
                Player Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-700">Skill Level</h3>
                  <p className="text-black">
                    {roleData.skill_level || "Not specified"}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Years Playing</h3>
                  <p className="text-black">
                    {roleData.years_playing || 0} years
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Goals</h3>
                  <p className="text-black">
                    {roleData.goals || "No goals specified"}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Link href="/dashboard/admin/users">
              <Button variant="outline">Back to Users</Button>
            </Link>
            <Link href={`/dashboard/admin/users/${userId}/edit`}>
              <Button className="bg-primary hover:bg-primary/90">
                Edit User
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
