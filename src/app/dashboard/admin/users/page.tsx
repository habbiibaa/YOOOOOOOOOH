import DashboardNavbar from "@/components/dashboard-navbar";
import { Button } from "@/components/ui/button";
import { createClient } from "../../../../utils/supabase/server";
import { redirect } from "next/navigation";
import { UserCircle, Mail, Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function AdminUsersPage() {
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

  // Fetch all users
  const { data: users, error: usersError } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  if (usersError) {
    console.error("Error fetching users:", usersError);
  }

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
              <h1 className="text-2xl font-bold">All Users</h1>
            </div>
            <Link href="/dashboard/admin/coaches/new">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Add New User
              </Button>
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                      User
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                      Email
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                      Role
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                      Joined
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users && users.length > 0 ? (
                    users.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                              {user.avatar_url ? (
                                <img
                                  src={user.avatar_url}
                                  alt={user.full_name || "User"}
                                  className="object-cover"
                                />
                              ) : (
                                <UserCircle className="w-6 h-6 text-gray-400" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">
                                {user.full_name || "Unnamed User"}
                              </p>
                              <p className="text-xs text-gray-500">
                                ID: {user.id.substring(0, 8)}...
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span>{user.email}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              user.role === "admin"
                                ? "bg-purple-100 text-purple-800"
                                : user.role === "coach"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {user.role?.charAt(0).toUpperCase() +
                              user.role?.slice(1) || "User"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>
                              {new Date(user.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Link href={`/dashboard/admin/users/${user.id}`}>
                              <Button variant="outline" size="sm">
                                View
                              </Button>
                            </Link>
                            <Link
                              href={`/dashboard/admin/users/${user.id}/edit`}
                            >
                              <Button variant="outline" size="sm">
                                Edit
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-8 text-center text-gray-500"
                      >
                        {usersError ? "Error loading users" : "No users found"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
