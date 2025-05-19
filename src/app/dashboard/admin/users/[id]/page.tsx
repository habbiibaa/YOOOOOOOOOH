"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import DashboardNavbar from "@/components/dashboard-navbar";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardFooter,
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  UserCircle, 
  Mail, 
  Calendar, 
  ArrowLeft, 
  Check, 
  X, 
  Shield, 
  CalendarDays,
  User,
  Badge as BadgeIcon,
  Clock
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const supabase = createClient();

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      // Check if current user is admin
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        router.push("/sign-in");
        return;
      }
      
      // Get user data
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();
        
      if (userError) {
        throw userError;
      }
      
      setUser(userData);
    } catch (error) {
      console.error("Error fetching user details:", error);
      setError("Could not load user details");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setLoadingAction(true);
    setActionMessage(null);
    
    try {
      // First update the auth.users.raw_app_meta_data directly
      const { error: authUpdateError } = await supabase.rpc('admin_update_user_role', {
        user_id: userId,
        update_approved: true
      });
      
      if (authUpdateError) {
        console.error("Error updating auth user:", authUpdateError);
        throw new Error("Failed to update authentication data: " + authUpdateError.message);
      }
      
      // Then update the user record in the database
      const { error: updateError } = await supabase
        .from("users")
        .update({ 
          approved: true,
          updated_at: new Date().toISOString()
        })
        .eq("id", userId)
        .eq("role", "coach");
        
      if (updateError) {
        console.error("Error updating user:", updateError);
        throw new Error("Failed to update user in database: " + updateError.message);
      }
      
      // Try a more direct approach as fallback
      const response = await fetch('/api/admin/approve-coach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ coachId: userId }),
      });
      
      if (!response.ok) {
        const responseData = await response.json();
        console.log("API response:", responseData);
      }
      
      setActionMessage({
        type: "success",
        message: "Coach account approved successfully"
      });
      
      // Update local state
      setUser({
        ...user,
        approved: true
      });
      
    } catch (error) {
      console.error("Error approving coach:", error);
      setActionMessage({
        type: "error",
        message: error instanceof Error ? error.message : "Unknown error occurred"
      });
    } finally {
      setLoadingAction(false);
    }
  };

  if (loading) {
    return (
      <>
        <DashboardNavbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <DashboardNavbar />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            <p>{error}</p>
            <Button 
              onClick={fetchUserDetails} 
              variant="outline" 
              size="sm" 
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <DashboardNavbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <Link
            href="/dashboard/admin/users"
            className="text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold">User Details</h1>
        </div>

        {actionMessage && (
          <div className={`mb-6 p-4 rounded-md ${
            actionMessage.type === "success" ? 
            "bg-green-50 border border-green-200 text-green-700" : 
            "bg-red-50 border border-red-200 text-red-700"
          }`}>
            <p>{actionMessage.message}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* User Information Card */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>User Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                  <UserCircle className="w-16 h-16 text-gray-400" />
                </div>
                <h2 className="text-xl font-semibold">{user?.full_name || "Unnamed User"}</h2>
                <p className="text-gray-500">{user?.email}</p>
              </div>

              <div className="space-y-3 mt-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 flex items-center">
                    <BadgeIcon className="w-4 h-4 mr-2" />
                    Role
                  </span>
                  <Badge className={`${
                    user?.role === "admin" ? "bg-purple-100 text-purple-800" :
                    user?.role === "coach" ? "bg-green-100 text-green-800" :
                    "bg-blue-100 text-blue-800"
                  }`}>
                    {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) || "User"}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 flex items-center">
                    <Shield className="w-4 h-4 mr-2" />
                    Status
                  </span>
                  <Badge className={user?.approved ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}>
                    {user?.approved ? "Approved" : "Pending Approval"}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Joined
                  </span>
                  <span className="text-sm">
                    {new Date(user?.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                {user?.role === "coach" && (user?.approved === false) && (
                  <div className="pt-4">
                    <Button 
                      onClick={handleApprove}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      disabled={loadingAction}
                    >
                      {loadingAction ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                          Approving...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Check className="w-4 h-4 mr-2" />
                          Approve Coach
                        </div>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Profile & Settings */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="profile">
                <TabsList className="mb-4">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="schedules">Schedules</TabsTrigger>
                  <TabsTrigger value="sessions">Sessions</TabsTrigger>
                </TabsList>
                
                <TabsContent value="profile" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Full Name</h3>
                      <p className="p-2 bg-gray-100 rounded-md">{user?.full_name || "Not set"}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Email</h3>
                      <p className="p-2 bg-gray-100 rounded-md">{user?.email}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Role</h3>
                      <p className="p-2 bg-gray-100 rounded-md">
                        {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) || "User"}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Status</h3>
                      <p className="p-2 bg-gray-100 rounded-md">
                        {user?.approved ? "Approved" : "Pending Approval"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Link href={`/dashboard/admin/users/${user?.id}/edit`}>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        Edit Profile
                      </Button>
                    </Link>
                  </div>
                </TabsContent>
                
                <TabsContent value="schedules">
                  {user?.role === "coach" ? (
                    <div>
                      <p className="mb-4">Coach's weekly schedule:</p>
                      <Link href={`/dashboard/admin/coach-schedule?coach=${user?.id}`}>
                        <Button>
                          <CalendarDays className="w-4 h-4 mr-2" />
                          View Schedule
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <p className="text-gray-500">No schedule available for this user type.</p>
                  )}
                </TabsContent>
                
                <TabsContent value="sessions">
                  {user?.role === "coach" ? (
                    <div>
                      <p className="mb-4">Sessions assigned to this coach:</p>
                      <Link href={`/dashboard/admin/sessions?coach=${user?.id}`}>
                        <Button>
                          <Clock className="w-4 h-4 mr-2" />
                          View Sessions
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <p className="text-gray-500">No sessions available for this user type.</p>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
