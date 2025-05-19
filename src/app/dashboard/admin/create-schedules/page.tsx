"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function CreateSchedulesPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Sample coach schedules data for all days
  const scheduleData = [
    { day: "Monday", startTime: "16:30", endTime: "20:30", duration: 45 },
    { day: "Tuesday", startTime: "16:30", endTime: "20:30", duration: 45 },
    { day: "Wednesday", startTime: "16:30", endTime: "20:30", duration: 45 },
    { day: "Thursday", startTime: "16:30", endTime: "20:30", duration: 45 },
    { day: "Friday", startTime: "16:30", endTime: "20:30", duration: 45 },
    { day: "Saturday", startTime: "10:00", endTime: "20:30", duration: 45 },
    { day: "Sunday", startTime: "16:30", endTime: "20:30", duration: 45 }
  ];

  // Function to create coach schedules and then generate sessions
  const createSchedulesAndSessions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setResult(null);
      
      const supabase = createClient();
      let schedulesCreated = 0;
      let sessionsCreated = 0;
      
      // 1. First check if the database is accessible
      const { data: coaches, error: coachError } = await supabase
        .from("coaches")
        .select("id, name")
        .limit(10);
        
      if (coachError) {
        throw new Error(`Cannot access coaches table: ${coachError.message}`);
      }
      
      if (!coaches || coaches.length === 0) {
        throw new Error("No coaches found in the database");
      }
      
      // 2. Get or create a branch
      const { data: branches, error: branchError } = await supabase
        .from("branches")
        .select("id, name")
        .limit(1);
      
      let branchId;
      if (branchError || !branches || branches.length === 0) {
        // Create a branch if none exists
        branchId = crypto.randomUUID();
        const { error: createBranchError } = await supabase
          .from("branches")
          .insert({
            id: branchId,
            name: "Main Branch",
            location: "Cairo",
            address: "123 Main St",
            is_members_only: false
          });
          
        if (createBranchError) {
          throw new Error(`Could not create branch: ${createBranchError.message}`);
        }
      } else {
        branchId = branches[0].id;
      }
      
      // 3. Create coach schedules for all coaches
      for (const coach of coaches) {
        // First clear any existing schedules for this coach
        const { error: deleteScheduleError } = await supabase
          .from("coach_schedules")
          .delete()
          .eq("coach_id", coach.id);
          
        if (deleteScheduleError) {
          console.warn(`Could not delete existing schedules for coach ${coach.name}:`, deleteScheduleError.message);
          // Continue anyway
        }
        
        // Create schedules for each day of the week
        for (const schedule of scheduleData) {
          try {
            const scheduleId = crypto.randomUUID();
            
            const { error: insertScheduleError } = await supabase
              .from("coach_schedules")
              .insert({
                id: scheduleId,
                coach_id: coach.id,
                branch_id: branchId,
                day_of_week: schedule.day,
                start_time: schedule.startTime,
                end_time: schedule.endTime,
                session_duration: schedule.duration
              });
              
            if (insertScheduleError) {
              console.error(`Error creating schedule for coach ${coach.name} on ${schedule.day}:`, insertScheduleError);
            } else {
              schedulesCreated++;
            }
          } catch (err) {
            console.error(`Error in schedule creation for ${coach.name}:`, err);
          }
        }
      }
      
      // 4. Clear existing available sessions
      const today = new Date().toISOString().split('T')[0];
      const { error: deleteSessionError } = await supabase
        .from("coach_sessions")
        .delete()
        .eq("status", "available")
        .gte("session_date", today);
        
      if (deleteSessionError) {
        console.warn("Could not delete existing sessions:", deleteSessionError.message);
        // Continue anyway
      }
      
      // 5. Generate sessions for each coach for the next 30 days
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
          
          // Get day of week
          const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
          const dayOfWeek = daysOfWeek[currentDate.getDay()];
          
          // Find schedule for this day
          const daySchedule = scheduleData.find(s => s.day === dayOfWeek);
          
          if (daySchedule) {
            // Parse start and end times
            const [startHour, startMinutes] = daySchedule.startTime.split(':').map(Number);
            const [endHour, endMinutes] = daySchedule.endTime.split(':').map(Number);
            
            // Calculate number of sessions that fit in the time range
            let currentHour = startHour;
            let currentMinute = startMinutes;
            
            while (
              currentHour < endHour || 
              (currentHour === endHour && currentMinute + daySchedule.duration <= endMinutes)
            ) {
              try {
                const startTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
                
                // Calculate end time
                let endHourCalc = currentHour;
                let endMinuteCalc = currentMinute + daySchedule.duration;
                
                if (endMinuteCalc >= 60) {
                  endHourCalc += Math.floor(endMinuteCalc / 60);
                  endMinuteCalc = endMinuteCalc % 60;
                }
                
                const endTime = `${endHourCalc.toString().padStart(2, '0')}:${endMinuteCalc.toString().padStart(2, '0')}`;
                
                // Generate a UUID for the session
                const sessionId = crypto.randomUUID();
                
                // Insert the session
                const { error: insertSessionError } = await supabase
                  .from("coach_sessions")
                  .insert({
                    id: sessionId,
                    coach_id: coach.id,
                    branch_id: branchId,
                    session_date: dateString,
                    start_time: startTime,
                    end_time: endTime,
                    status: "available",
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  });
                  
                if (insertSessionError) {
                  console.error(`Error creating session for coach ${coach.name} on ${dateString} at ${startTime}:`, insertSessionError);
                } else {
                  sessionsCreated++;
                }
                
                // Move to next time slot
                currentMinute += daySchedule.duration;
                if (currentMinute >= 60) {
                  currentHour += Math.floor(currentMinute / 60);
                  currentMinute = currentMinute % 60;
                }
              } catch (err) {
                console.error("Error in session creation:", err);
              }
            }
          }
        }
      }
      
      setResult({
        success: true,
        message: `Successfully created ${schedulesCreated} coach schedules and ${sessionsCreated} coach sessions`
      });
    } catch (err) {
      console.error("Error creating schedules and sessions:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-10 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create Coach Schedules & Sessions</CardTitle>
          <CardDescription>
            Use this page to recreate coach schedules and then generate sessions for booking.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
              <p className="text-yellow-800 font-bold mb-2">This tool will:</p>
              <ol className="list-decimal pl-5 space-y-1 text-yellow-800">
                <li>Delete any existing coach schedules for all coaches</li>
                <li>Create new schedules for each day of the week</li>
                <li>Delete any existing available coach sessions</li>
                <li>Generate new sessions for the next 30 days based on the new schedules</li>
              </ol>
              <p className="mt-4 text-yellow-800 font-bold">Standard schedule that will be created:</p>
              <ul className="list-disc pl-5 text-yellow-800">
                <li>Monday-Friday: 4:30 PM - 8:30 PM (45 min sessions)</li>
                <li>Saturday: 10:00 AM - 8:30 PM (45 min sessions)</li>
                <li>Sunday: 4:30 PM - 8:30 PM (45 min sessions)</li>
              </ul>
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
            onClick={createSchedulesAndSessions} 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Schedules & Sessions...
              </>
            ) : "Create Schedules & Sessions"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 