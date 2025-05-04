"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, UserCheck, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface CoachApprovalRequest {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
}

interface PendingApprovalsProps {
  initialData?: CoachApprovalRequest[];
  serverError?: string;
}

export default function PendingApprovals({ initialData = [], serverError }: PendingApprovalsProps) {
  const [pendingRequests, setPendingRequests] = useState<CoachApprovalRequest[]>(initialData);
  const [loading, setLoading] = useState(initialData.length === 0 && !serverError);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(serverError || null);
  
  // Create Supabase client wrapped in try-catch
  let supabase;
  try {
    supabase = createClient();
  } catch (err) {
    console.error("Failed to initialize Supabase client:", err instanceof Error ? err.message : "Unknown error");
    setError("Database connection failed");
  }

  useEffect(() => {
    // Only fetch data client-side if we don't have initial data and no server error
    if (initialData.length === 0 && !serverError) {
      fetchPendingApprovals();
    }
  }, [initialData, serverError]);

  const fetchPendingApprovals = async () => {
    setLoading(true);
    try {
      // Check if supabase client is initialized properly
      if (!supabase) {
        console.error("Supabase client not initialized");
        setError("Database connection failed");
        return;
      }

      // Fetch coaches that need approval
      const { data, error } = await supabase
        .from("users")
        .select("id, full_name, email, created_at, role")
        .eq("role", "coach")
        .eq("approved", false)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) {
        console.error("Supabase query error:", error.message);
        setError(`Database error: ${error.message}`);
        throw error;
      }
      
      console.log(`Found ${data?.length || 0} coaches needing approval`);
      setPendingRequests(data || []);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Error fetching pending approvals:", errorMessage);
      setError(`Could not load approval requests: ${errorMessage}`);
      // Set empty array to avoid undefined errors
      setPendingRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setLoadingId(id);
    try {
      if (!supabase) {
        console.error("Supabase client not initialized");
        setError("Database connection failed");
        return;
      }

      // Call the approve-coach API endpoint
      const response = await fetch('/api/admin/approve-coach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ coachId: id }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to approve coach');
      }

      // Update local state on success
      setPendingRequests(pendingRequests.filter(req => req.id !== id));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Error approving coach:", errorMessage);
      setError(`Could not approve coach: ${errorMessage}`);
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setLoadingId(id);
    try {
      if (!supabase) {
        console.error("Supabase client not initialized");
        setError("Database connection failed");
        return;
      }

      // Call the reject-coach API endpoint
      const response = await fetch('/api/admin/reject-coach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ coachId: id }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to reject coach');
      }

      // Update local state on success
      setPendingRequests(pendingRequests.filter(req => req.id !== id));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Error rejecting coach:", errorMessage);
      setError(`Could not reject coach: ${errorMessage}`);
    } finally {
      setLoadingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} days ago`;
    }
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pending Coach Approvals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-4 text-center">
            <AlertTriangle className="h-8 w-8 text-amber-500 mb-2" />
            <p className="text-muted-foreground">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2" 
              onClick={() => {
                setError(null);
                fetchPendingApprovals();
              }}
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pending Coach Approvals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center my-6">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-red-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (pendingRequests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pending Coach Approvals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <UserCheck className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-muted-foreground">No pending approval requests</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Pending Coach Approvals</CardTitle>
        <Badge variant="outline" className="bg-amber-900/20 text-amber-400 border-amber-900">
          {pendingRequests.length} pending
        </Badge>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {pendingRequests.map((request) => (
            <div 
              key={request.id} 
              className="flex items-center justify-between border-b border-muted-foreground/20 pb-3"
            >
              <div>
                <h3 className="font-medium">{request.full_name}</h3>
                <p className="text-sm text-muted-foreground">{request.email}</p>
                <div className="flex items-center mt-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>Requested {formatDate(request.created_at)}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-green-600 text-green-500 hover:bg-green-950/50 hover:text-green-400"
                  onClick={() => handleApprove(request.id)}
                  disabled={loadingId === request.id}
                >
                  {loadingId === request.id ? (
                    <div className="animate-spin h-4 w-4 border-2 border-green-600 border-t-transparent rounded-full" />
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-red-600 text-red-500 hover:bg-red-950/50 hover:text-red-400"
                  onClick={() => handleReject(request.id)}
                  disabled={loadingId === request.id}
                >
                  {loadingId === request.id ? (
                    <div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full" />
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-center">
        <Link href="/dashboard/admin/users">
          <Button variant="ghost" size="sm">
            View All Coaches
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
} 