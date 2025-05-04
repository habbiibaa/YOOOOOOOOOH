import DashboardNavbar from "@/components/dashboard-navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "../../../utils/supabase/server";
import { redirect } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import ProfileImageForm from "./profile-image-form";

export default async function EditProfilePage() {
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
    return redirect("/dashboard");
  }

  // Get role-specific data
  let roleData = null;
  let roleTable = "";

  if (userData.role === "coach") {
    roleTable = "coaches";
    const { data, error } = await supabase
      .from("coaches")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!error) {
      roleData = data;
    }
  } else if (userData.role === "player") {
    roleTable = "players";
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!error) {
      roleData = data;
    }
  }

  // Redirect to appropriate dashboard based on role
  const dashboardPath =
    userData.role === "admin"
      ? "/dashboard/admin"
      : userData.role === "coach"
        ? "/dashboard/coach"
        : "/dashboard/player";

  return (
    <>
      <DashboardNavbar />
      <main className="w-full bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-2 mb-6">
            <Link
              href={dashboardPath}
              className="text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold">Edit Profile</h1>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-3xl mx-auto">
            <form
              action="/api/update-profile"
              method="POST"
              encType="multipart/form-data"
            >
              <input type="hidden" name="user_id" value={user.id} />
              <input type="hidden" name="role" value={userData.role} />
              <input type="hidden" name="redirect_path" value={dashboardPath} />

              <div className="space-y-6">
                {/* Profile Picture */}
                <div className="flex flex-col items-center mb-6">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden bg-blue-100 mb-4">
                    {userData.avatar_url ? (
                      <Image
                        src={userData.avatar_url}
                        alt={userData.full_name || "User"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-blue-600 font-bold text-2xl">
                        {userData.full_name
                          ?.split(" ")
                          .map((name) => name[0])
                          .join("")}
                      </div>
                    )}
                  </div>
                  <div>
                    {/* Client component for profile image upload */}
                    <ProfileImageForm
                      userId={user.id}
                      redirectPath={dashboardPath}
                    />
                  </div>
                </div>

                {/* Basic Information */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Basic Information</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        name="full_name"
                        defaultValue={userData.full_name || ""}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        defaultValue={userData.email || ""}
                        disabled
                      />
                      <p className="text-xs text-gray-500">
                        Email cannot be changed
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      defaultValue={userData.phone || ""}
                    />
                  </div>
                </div>

                {/* Role-specific fields */}
                {userData.role === "coach" && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Coach Details</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="specialization">Specialization</Label>
                        <Input
                          id="specialization"
                          name="specialization"
                          defaultValue={roleData?.specialization || ""}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="years_experience">
                          Years of Experience
                        </Label>
                        <Input
                          id="years_experience"
                          name="years_experience"
                          type="number"
                          min="0"
                          defaultValue={roleData?.years_experience || 0}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Biography</Label>
                      <Textarea
                        id="bio"
                        name="bio"
                        rows={4}
                        defaultValue={roleData?.bio || ""}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hourly_rate">Hourly Rate (USD)</Label>
                      <Input
                        id="hourly_rate"
                        name="hourly_rate"
                        type="number"
                        min="0"
                        defaultValue={roleData?.hourly_rate || 0}
                        disabled
                      />
                      <p className="text-xs text-gray-500">
                        Hourly rate can only be set by administrators
                      </p>
                    </div>
                  </div>
                )}

                {userData.role === "player" && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Player Details</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="skill_level">Skill Level</Label>
                        <select
                          id="skill_level"
                          name="skill_level"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          defaultValue={roleData?.skill_level || "Beginner"}
                        >
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                          <option value="Professional">Professional</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="years_playing">Years Playing</Label>
                        <Input
                          id="years_playing"
                          name="years_playing"
                          type="number"
                          min="0"
                          defaultValue={roleData?.years_playing || 0}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="goals">Goals</Label>
                      <Textarea
                        id="goals"
                        name="goals"
                        rows={4}
                        defaultValue={roleData?.goals || ""}
                      />
                    </div>
                  </div>
                )}

                {/* Password Change */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Change Password</h2>
                  <p className="text-sm text-gray-500">
                    Leave blank if you don't want to change your password
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="new_password">New Password</Label>
                      <Input
                        id="new_password"
                        name="new_password"
                        type="password"
                        placeholder="••••••••"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm_password">Confirm Password</Label>
                      <Input
                        id="confirm_password"
                        name="confirm_password"
                        type="password"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Link href={dashboardPath}>
                    <Button variant="outline" type="button">
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}
