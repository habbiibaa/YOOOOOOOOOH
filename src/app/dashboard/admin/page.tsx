import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  UsersIcon, 
  CalendarIcon, 
  TableIcon, 
  DatabaseIcon, 
  WrenchIcon, 
  BuildingIcon,
  ClipboardCheckIcon,
  FileTextIcon,
  BookIcon,
  BarChart2Icon,
  SettingsIcon,
  AlertCircleIcon,
  Database
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PendingApprovalsWrapper from "@/components/admin/pending-approvals-wrapper";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import DashboardNavbar from "@/components/dashboard-navbar";

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Verify user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Verify the user is an admin
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
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage all aspects of the Ramy Ashour Squash Academy</p>
        </div>

        <Tabs defaultValue="daily" className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Quick Access</h2>
            <TabsList>
              <TabsTrigger value="daily">Daily Operations</TabsTrigger>
              <TabsTrigger value="setup">Setup Tools</TabsTrigger>
              <TabsTrigger value="system">System Tools</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="daily" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link href="/dashboard/admin/users" className="h-full">
                <Card className="h-full hover:bg-muted/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>User Management</CardTitle>
                      <UsersIcon className="h-5 w-5 text-blue-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      View and manage all users, approve coach accounts, and adjust user roles
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/dashboard/admin/bookings" className="h-full">
                <Card className="h-full hover:bg-muted/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Booking Management</CardTitle>
                      <BookIcon className="h-5 w-5 text-green-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      View and manage all bookings, including approvals, cancellations, and reschedules
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/dashboard/admin/coach-schedule" className="h-full">
                <Card className="h-full hover:bg-muted/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Coach Schedules</CardTitle>
                      <CalendarIcon className="h-5 w-5 text-purple-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Manage recurring coach schedules and availability for all branches
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </TabsContent>

          <TabsContent value="setup" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link href="/dashboard/admin/create-coach-accounts" className="h-full">
                <Card className="h-full hover:bg-muted/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Coach Accounts</CardTitle>
                      <UsersIcon className="h-5 w-5 text-blue-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Create accounts for coaches with default passwords
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/dashboard/admin/import-royal-british-schedules" className="h-full">
                <Card className="h-full hover:bg-muted/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>RBS Schedules</CardTitle>
                      <CalendarIcon className="h-5 w-5 text-green-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Import schedules for Royal British School location
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/dashboard/admin/import-schedules" className="h-full">
                <Card className="h-full hover:bg-muted/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Import Schedules</CardTitle>
                      <TableIcon className="h-5 w-5 text-amber-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Import schedules for any branch using a generic approach
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Branch Management</CardTitle>
                    <BuildingIcon className="h-5 w-5 text-amber-500" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Set up new branches and configure branch settings.
                  </p>
                  <Link href="/dashboard/admin/branches">
                    <Button variant="outline" className="w-full">
                      Manage Branches
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Pricing & Plans</CardTitle>
                    <BarChart2Icon className="h-5 w-5 text-amber-500" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Configure subscription plans, pricing, and session packages.
                  </p>
                  <Link href="/dashboard/admin/plans">
                    <Button variant="outline" className="w-full">
                      Manage Plans
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="system" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link href="/dashboard/admin/test-database" className="h-full">
                <Card className="h-full hover:bg-muted/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Test Database</CardTitle>
                      <DatabaseIcon className="h-5 w-5 text-red-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Test database connection and table structure
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/dashboard/admin/database-setup" className="h-full">
                <Card className="h-full hover:bg-muted/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Database Setup</CardTitle>
                      <Database className="h-5 w-5 text-emerald-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Run database migrations, initialize coach schedules, and regenerate sessions
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/dashboard/admin/reports" className="h-full">
                <Card className="h-full hover:bg-muted/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>System Reports</CardTitle>
                      <FileTextIcon className="h-5 w-5 text-sky-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      View system usage reports and analytics
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/dashboard/admin/settings" className="h-full">
                <Card className="h-full hover:bg-muted/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>System Settings</CardTitle>
                      <SettingsIcon className="h-5 w-5 text-gray-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Configure global system settings and preferences
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">System Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-green-600 bg-gradient-to-br from-green-950/30 to-transparent">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <CardTitle>Booking System</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  The booking system is operating normally with no reported issues.
                </p>
              </CardContent>
              <CardFooter>
                <Link href="/dashboard/admin/bookings">
                  <Button variant="outline" size="sm">View Bookings</Button>
                </Link>
              </CardFooter>
            </Card>

            <PendingApprovalsWrapper />
          </div>
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-4">Quick Help</h2>
          <Card className="border-blue-600 bg-gradient-to-br from-blue-950/30 to-transparent">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <AlertCircleIcon className="h-5 w-5 text-blue-500" />
                <CardTitle>Admin Dashboard Guide</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Having trouble with the admin dashboard? Here are some quick tips:
              </p>
              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-2">
                <li>Use the <strong>Daily Operations</strong> tab for day-to-day management tasks</li>
                <li>The <strong>Setup Tools</strong> tab provides access to configuration tools</li>
                <li>Use <strong>System Tools</strong> for troubleshooting and maintenance</li>
                <li>Check the <strong>System Status</strong> section for any alerts or notices</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
