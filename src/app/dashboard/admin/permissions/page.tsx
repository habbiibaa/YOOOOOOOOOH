import DashboardNavbar from "@/components/dashboard-navbar";
import { Button } from "@/components/ui/button";
import { createClient } from "../../../../utils/supabase/server";
import { redirect } from "next/navigation";
import { ArrowLeft, Shield, Check, X } from "lucide-react";
import Link from "next/link";

export default async function PermissionsPage() {
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

  // Mock permission data
  const rolePermissions = [
    {
      role: "Admin",
      permissions: [
        { name: "Manage Users", granted: true },
        { name: "Manage Coaches", granted: true },
        { name: "Manage Content", granted: true },
        { name: "View Analytics", granted: true },
        { name: "System Settings", granted: true },
      ],
    },
    {
      role: "Coach",
      permissions: [
        { name: "Manage Users", granted: false },
        { name: "Manage Coaches", granted: false },
        { name: "Manage Content", granted: true },
        { name: "View Analytics", granted: true },
        { name: "System Settings", granted: false },
      ],
    },
    {
      role: "Player",
      permissions: [
        { name: "Manage Users", granted: false },
        { name: "Manage Coaches", granted: false },
        { name: "Manage Content", granted: false },
        { name: "View Analytics", granted: false },
        { name: "System Settings", granted: false },
      ],
    },
  ];

  return (
    <>
      <DashboardNavbar />
      <main className="w-full bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-2 mb-6">
            <Link
              href="/dashboard/admin"
              className="text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold">Manage Permissions</h1>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold">Role-Based Permissions</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                      Permission
                    </th>
                    {rolePermissions.map((role) => (
                      <th
                        key={role.role}
                        className="text-center py-3 px-4 text-sm font-medium text-gray-500"
                      >
                        {role.role}
                      </th>
                    ))}
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rolePermissions[0].permissions.map((permission, index) => (
                    <tr
                      key={permission.name}
                      className="border-b border-gray-100"
                    >
                      <td className="py-3 px-4 font-medium">
                        {permission.name}
                      </td>
                      {rolePermissions.map((role) => (
                        <td
                          key={`${role.role}-${permission.name}`}
                          className="text-center py-3 px-4"
                        >
                          {role.permissions[index].granted ? (
                            <Check className="w-5 h-5 text-green-600 mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-red-600 mx-auto" />
                          )}
                        </td>
                      ))}
                      <td className="py-3 px-4">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold mb-4">
              Custom User Permissions
            </h2>
            <p className="text-gray-600 mb-4">
              Assign specific permissions to individual users that override
              their role-based permissions.
            </p>

            <div className="flex justify-between items-center mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search users..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              <Button className="bg-blue-600 hover:bg-blue-700">
                Assign Custom Permission
              </Button>
            </div>

            <div className="text-center py-8 text-gray-500">
              No custom permissions assigned yet.
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
