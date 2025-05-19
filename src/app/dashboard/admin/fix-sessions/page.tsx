"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function FixSessionsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Function to create sessions for the next 30 days
  const createSessions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setResult(null);
      
      const supabase = createClient();
      let sessionsCreated = 0;
      
      // 1. First check if the database is accessible
      const { data: coaches, error: coachError } = await supabase
        .from("coaches")
        .select("id, name")
        .limit(5);
        
      if (coachError) {
        throw new Error(`Cannot access coaches table: ${coachError.message}`);
      }
      
      if (!coaches || coaches.length === 0) {
        throw new Error("No coaches found in the database");
      }
      
      // 2. Get a branch ID
      const { data: branches, error: branchError } = await supabase
        .from("branches")
        .select("id, name")
        .limit(1);
        
      if (branchError || !branches || branches.length === 0) {
        throw new Error("Cannot find any branches");
      }
      
      const branchId = branches[0].id;
      
      // 3. Clear existing available sessions for a clean slate
      const today = new Date().toISOString().split('T')[0];
      const { error: deleteError } = await supabase
        .from("coach_sessions")
        .delete()
        .eq("status", "available")
        .gte("session_date", today);
        
      if (deleteError) {
        console.warn("Could not delete existing sessions:", deleteError.message);
        // Continue anyway
      }
      
      // 4. Generate sessions for each coach for the next 30 days
      // Using direct insertions to avoid complex logic
      for (const coach of coaches) {
        // Generate sessions for the next 30 days
        const startDate = new Date();
        const daysToGenerate = 30;
        
        for (let day = 0; day < daysToGenerate; day++) {
          // Get the date for the current iteration
          const currentDate = new Date(startDate);
          currentDate.setDate(currentDate.getDate() + day);
          
          // Format the date as YYYY-MM-DD
          const dateString = currentDate.toISOString().split('T')[0];
          
          // Generate sessions for the current day
          // Create 4 sessions per day (hourly slots from 4:30 PM to 8:30 PM)
          const startTimes = ["16:30", "17:30", "18:30", "19:30"];
          const endTimes = ["17:15", "18:15", "19:15", "20:15"];
          
          for (let i = 0; i < startTimes.length; i++) {
            try {
              // Generate a UUID for the session
              const sessionId = crypto.randomUUID();
              
              // Insert the session
              const { error: insertError } = await supabase
                .from("coach_sessions")
                .insert({
                  id: sessionId,
                  coach_id: coach.id,
                  branch_id: branchId,
                  session_date: dateString,
                  start_time: startTimes[i],
                  end_time: endTimes[i],
                  status: "available",
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                });
                
              if (insertError) {
                console.error(`Error creating session for coach ${coach.name} on ${dateString} at ${startTimes[i]}:`, insertError);
              } else {
                sessionsCreated++;
              }
            } catch (err) {
              console.error("Error in session creation:", err);
            }
          }
        }
      }
      
      setResult({
        success: true,
        message: `Successfully created ${sessionsCreated} coach sessions`
      });
    } catch (err) {
      console.error("Error creating sessions:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-10 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Fix Coach Sessions</CardTitle>
          <CardDescription>
            Use this page to regenerate coach sessions for booking with a simpler approach.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
              <p className="text-yellow-800">
                This tool will create coach sessions for the next 30 days with standard time slots 
                (4:30-5:15 PM, 5:30-6:15 PM, 6:30-7:15 PM, 7:30-8:15 PM) for all coaches. 
                It will first delete any existing available sessions.
              </p>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-md text-red-800">
                <p className="font-bold">Error</p>
                <p>{error}</p>
              </div>
            )}
            
            {result && result.success && (
              <div className="bg-green-50 border border-green-200 p-4 rounded-md text-green-800">
                <p className="font-bold">Success!</p>
                <p>{result.message}</p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={createSessions} 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Sessions...
              </>
            ) : "Create Coach Sessions"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 