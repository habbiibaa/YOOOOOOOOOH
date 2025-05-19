import DashboardNavbar from "@/components/dashboard-navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "../../../../../../utils/supabase/server";
import { redirect } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

// Define correct types for Next.js Page
type Params = {
  id: string;
};

type Props = {
  params: Params;
};

export default async function EditUserPage({ params }: Props) {
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
    .eq("id", currentUser.id)
    .single();

  if (currentUserError || currentUserData?.role !== "admin") {
    return redirect("/dashboard");
  }

  // Get user data for the requested user ID
  let { data: userData, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (userError) {
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
              <h1 className="text-2xl font-bold">User Not Found</h1>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <p>The requested user could not be found.</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  // Get role-specific data
  let roleData = null;
  if (userData.role === "coach") {
    const { data } = await supabase
      .from("coaches")
      .select("*")
      .eq("id", userId)
      .single();
    roleData = data;
  } else if (userData.role === "player") {
    const { data } = await supabase
      .from("players")
      .select("*")
      .eq("id", userId)
      .single();
    roleData = data;
  }

  return (
    <>
      <DashboardNavbar />
      <main className="w-full bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-2 mb-6">
            <Link
              href={`/dashboard/admin/users/${userId}`}
              className="text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold">Edit User</h1>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-3xl mx-auto">
            <form action="/api/admin/update-user" method="POST">
              <input type="hidden" name="user_id" value={userId} />
              <input
                type="hidden"
                name="redirect_path"
                value={`/dashboard/admin/users/${userId}`}
              />

              <div className="space-y-6">
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

                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <select
                      id="role"
                      name="role"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      defaultValue={userData.role || "player"}
                    >
                      <option value="admin">Admin</option>
                      <option value="coach">Coach</option>
                      <option value="player">Player</option>
                    </select>
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
                      />
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

                <div className="flex justify-end space-x-4 pt-4">
                  <Link href={`/dashboard/admin/users/${userId}`}>
                    <Button variant="outline">Cancel</Button>
                  </Link>
                  <Button type="submit" className="flex items-center gap-2">
                    <Save className="w-4 h-4" /> Save Changes
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
