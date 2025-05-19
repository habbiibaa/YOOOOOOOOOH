"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Clock, ShieldAlert } from "lucide-react";

interface CoachInfo {
  id: string;
  name: string;
  full_name: string;
  email: string;
  role: string;
  status?: string;
}

export function CoachImpersonation() {
  const supabase = createClient();
  const [coaches, setCoaches] = useState<CoachInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCoach, setSelectedCoach] = useState<string>("");
  const [impersonationReason, setImpersonationReason] = useState<string>("Schedule management");
  const [impersonationOpen, setImpersonationOpen] = useState(false);
  const [impersonationStatus, setImpersonationStatus] = useState<{
    success?: boolean;
    message?: string;
    coachData?: any;
  }>({});

  useEffect(() => {
    fetchCoaches();
  }, []);

  const fetchCoaches = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, full_name, email, role, approved")
        .eq("role", "coach")
        .order("full_name");

      if (error) {
        throw error;
      }

      if (data) {
        const formattedCoaches = data.map(coach => ({
          id: coach.id,
          name: coach.full_name,
          full_name: coach.full_name,
          email: coach.email,
          role: coach.role,
          status: coach.approved ? "approved" : "pending"
        }));
        setCoaches(formattedCoaches);
      }
    } catch (error) {
      console.error("Error fetching coaches:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImpersonateCoach = async () => {
    if (!selectedCoach) return;
    
    try {
      // Call the RPC function to impersonate the coach
      const { data, error } = await supabase.rpc('admin_impersonate_coach', {
        coach_id: selectedCoach,
        purpose: impersonationReason
      });
      
      if (error) {
        setImpersonationStatus({
          success: false,
          message: `Error: ${error.message}`
        });
        return;
      }
      
      // Store impersonation data temporarily
      setImpersonationStatus({
        success: true,
        message: "Coach impersonation successful",
        coachData: data
      });
      
      // Redirect to coach's schedule page with special token
      setTimeout(() => {
        window.location.href = `/dashboard/admin/coach-schedule?coach=${selectedCoach}&impersonation=true&token=${data.access_token || "temporary"}`;
      }, 1500);
      
    } catch (error) {
      console.error("Error impersonating coach:", error);
      setImpersonationStatus({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      });
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Coach Management Access</CardTitle>
          <ShieldAlert className="h-5 w-5 text-amber-500" />
        </div>
        <CardDescription>
          Temporarily access coach accounts to manage their schedules
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="coach-select">Select Coach</Label>
            <Select
              value={selectedCoach}
              onValueChange={setSelectedCoach}
            >
              <SelectTrigger id="coach-select">
                <SelectValue placeholder="Select a coach" />
              </SelectTrigger>
              <SelectContent>
                {coaches.map((coach) => (
                  <SelectItem key={coach.id} value={coach.id}>
                    <div className="flex items-center">
                      <span>{coach.name}</span>
                      {coach.status && (
                        <Badge className={`ml-2 ${
                          coach.status === "approved" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                        }`}>
                          {coach.status}
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Access</Label>
            <Input
              id="reason"
              value={impersonationReason}
              onChange={(e) => setImpersonationReason(e.target.value)}
              placeholder="Schedule management"
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Dialog open={impersonationOpen} onOpenChange={setImpersonationOpen}>
          <DialogTrigger asChild>
            <Button 
              className="w-full" 
              disabled={!selectedCoach || loading}
            >
              Manage Coach Schedule
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-amber-600">Access Coach Account</DialogTitle>
              <DialogDescription>
                You are about to temporarily access a coach's account for management purposes.
                This action will be logged for security.
              </DialogDescription>
            </DialogHeader>
            
            {selectedCoach && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Selected Coach</Label>
                  <div className="p-2 bg-gray-100 rounded-md flex items-center">
                    <User className="h-4 w-4 mr-2 text-gray-500" />
                    {coaches.find(c => c.id === selectedCoach)?.name || "Unknown Coach"}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Access Duration</Label>
                  <div className="p-2 bg-gray-100 rounded-md flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-gray-500" />
                    30 minutes
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Purpose</Label>
                  <div className="p-2 bg-gray-100 rounded-md">
                    {impersonationReason}
                  </div>
                </div>
                
                {impersonationStatus.message && (
                  <div className={`p-2 rounded-md ${
                    impersonationStatus.success 
                      ? "bg-green-50 text-green-700 border border-green-100" 
                      : "bg-red-50 text-red-700 border border-red-100"
                  }`}>
                    {impersonationStatus.message}
                  </div>
                )}
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setImpersonationOpen(false)}>
                Cancel
              </Button>
              <Button 
                className="bg-amber-600 hover:bg-amber-700"
                onClick={handleImpersonateCoach}
              >
                Confirm Access
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
} 