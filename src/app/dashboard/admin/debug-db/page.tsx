"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function DebugDbPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Record<string, any>>({});

  const runDiagnostics = async () => {
    setIsLoading(true);
    setResults({});
    const supabase = createClient();
    const diagnosticResults: Record<string, any> = {};
    
    try {
      // 1. Check coach_schedules table - direct query
      console.log("Checking coach_schedules directly...");
      const { data: schedules, error: scheduleError } = await supabase
        .from("coach_schedules")
        .select("*")
        .limit(50);
        
      diagnosticResults.schedules = {
        success: !scheduleError,
        error: scheduleError?.message,
        count: schedules?.length || 0,
        data: schedules,
      };
      
      // 2. Check coaches table
      console.log("Checking coaches...");
      const { data: coaches, error: coachError } = await supabase
        .from("coaches")
        .select("*")
        .limit(10);
        
      diagnosticResults.coaches = {
        success: !coachError,
        error: coachError?.message,
        count: coaches?.length || 0,
        data: coaches,
      };
      
      // 3. Check branches table
      console.log("Checking branches...");
      const { data: branches, error: branchError } = await supabase
        .from("branches")
        .select("*")
        .limit(10);
        
      diagnosticResults.branches = {
        success: !branchError,
        error: branchError?.message,
        count: branches?.length || 0,
        data: branches,
      };
      
      // 4. Check coach sessions table
      console.log("Checking coach_sessions...");
      const { data: sessions, error: sessionError } = await supabase
        .from("coach_sessions")
        .select("*")
        .limit(10);
        
      diagnosticResults.sessions = {
        success: !sessionError,
        error: sessionError?.message,
        count: sessions?.length || 0,
        data: sessions,
      };
      
      // 5. Try joining coaches with schedules
      console.log("Joining coaches with schedules...");
      const { data: joinedData, error: joinError } = await supabase
        .from("coach_schedules")
        .select(`
          id,
          day_of_week,
          start_time,
          end_time,
          session_duration,
          coaches:coach_id (
            id,
            name
          )
        `)
        .limit(10);
        
      diagnosticResults.joined = {
        success: !joinError,
        error: joinError?.message,
        count: joinedData?.length || 0,
        data: joinedData,
      };
      
      // 6. Check row level security settings
      console.log("Checking if user has necessary permissions...");
      const { data: authData } = await supabase.auth.getSession();
      
      diagnosticResults.auth = {
        loggedIn: !!authData?.session,
        userId: authData?.session?.user?.id,
        userEmail: authData?.session?.user?.email,
      };
      
      if (authData?.session?.user?.id) {
        // Check user role
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("id, role, approved")
          .eq("id", authData.session.user.id)
          .single();
          
        diagnosticResults.user = {
          success: !userError,
          error: userError?.message,
          data: userData,
        };
      }
    } catch (error) {
      console.error("Error in diagnostics:", error);
      diagnosticResults.error = error instanceof Error ? error.message : "Unknown error";
    }
    
    setResults(diagnosticResults);
    setIsLoading(false);
  };
  
  // Function to create some test schedules if none exist
  const createTestSchedules = async () => {
    setIsLoading(true);
    const supabase = createClient();
    
    try {
      // Get coaches
      const { data: coaches, error: coachError } = await supabase
        .from("coaches")
        .select("id")
        .limit(5);
        
      if (coachError || !coaches || coaches.length === 0) {
        throw new Error("No coaches found or error accessing coach table");
      }
      
      // Get branch
      const { data: branches, error: branchError } = await supabase
        .from("branches")
        .select("id")
        .limit(1);
        
      if (branchError || !branches || branches.length === 0) {
        throw new Error("No branches found or error accessing branch table");
      }
      
      const branchId = branches[0].id;
      
      // Create test schedules for the first coach
      const coach = coaches[0];
      const days = ["Monday", "Wednesday", "Friday"];
      const schedulesToCreate = [];
      
      for (const day of days) {
        schedulesToCreate.push({
          id: crypto.randomUUID(),
          coach_id: coach.id,
          branch_id: branchId,
          day_of_week: day,
          start_time: "16:30",
          end_time: "20:30",
          session_duration: 45
        });
      }
      
      const { error: insertError } = await supabase
        .from("coach_schedules")
        .insert(schedulesToCreate);
        
      if (insertError) {
        throw new Error(`Failed to create schedules: ${insertError.message}`);
      }
      
      setResults(prev => ({
        ...prev,
        testSchedules: {
          success: true,
          message: `Created ${schedulesToCreate.length} test schedules for coach ${coach.id}`
        }
      }));
    } catch (error) {
      console.error("Error creating test schedules:", error);
      setResults(prev => ({
        ...prev,
        testSchedules: {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error"
        }
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Function to create a test session
  const createTestSession = async () => {
    setIsLoading(true);
    const supabase = createClient();
    
    try {
      // Get a coach
      const { data: coaches, error: coachError } = await supabase
        .from("coaches")
        .select("id")
        .limit(1);
        
      if (coachError || !coaches || coaches.length === 0) {
        throw new Error("No coaches found or error accessing coach table");
      }
      
      // Get a branch
      const { data: branches, error: branchError } = await supabase
        .from("branches")
        .select("id")
        .limit(1);
        
      if (branchError || !branches || branches.length === 0) {
        throw new Error("No branches found or error accessing branch table");
      }
      
      // Get a sample schedule
      const { data: schedules, error: scheduleError } = await supabase
        .from("coach_schedules")
        .select("id")
        .limit(1);
        
      const branchId = branches[0].id;
      const coachId = coaches[0].id;
      const scheduleId = schedules && schedules.length > 0 ? schedules[0].id : null;
      
      // Create a single test session for tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const sessionDate = tomorrow.toISOString().split('T')[0];
      
      const testSession = {
        id: crypto.randomUUID(),
        coach_id: coachId,
        branch_id: branchId,
        coach_schedule_id: scheduleId,
        session_date: sessionDate,
        start_time: "16:30",
        end_time: "17:15",
        status: "available",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log("Creating test session:", testSession);
      
      const { data, error: insertError } = await supabase
        .from("coach_sessions")
        .insert(testSession)
        .select();
        
      if (insertError) {
        console.error("Session insertion error:", insertError);
        throw new Error(`Failed to create test session: ${insertError.message}`);
      }
      
      setResults(prev => ({
        ...prev,
        testSession: {
          success: true,
          message: `Created test session for coach ${coachId}`,
          data: data
        }
      }));
    } catch (error) {
      console.error("Error creating test session:", error);
      setResults(prev => ({
        ...prev,
        testSession: {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error"
        }
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-10 max-w-6xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Database Diagnostics</CardTitle>
          <CardDescription>
            This tool directly queries the database to check schedules and related tables
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            {Object.keys(results).length > 0 ? (
              <div className="space-y-6">
                {Object.entries(results).map(([key, value]) => (
                  <div key={key} className="border rounded-lg p-4">
                    <h3 className="text-lg font-semibold capitalize mb-2">{key} Results</h3>
                    
                    {value.error && (
                      <div className="bg-red-50 border border-red-200 p-4 rounded-md mb-4">
                        <p className="text-red-800">{value.error}</p>
                      </div>
                    )}
                    
                    {value.success === false && !value.error && (
                      <div className="bg-red-50 border border-red-200 p-4 rounded-md mb-4">
                        <p className="text-red-800">Operation failed without specific error</p>
                      </div>
                    )}
                    
                    {value.message && (
                      <div className="bg-green-50 border border-green-200 p-4 rounded-md mb-4">
                        <p className="text-green-800">{value.message}</p>
                      </div>
                    )}
                    
                    {value.count !== undefined && (
                      <div className="mb-2">
                        <strong>Count:</strong> {value.count} records
                      </div>
                    )}
                    
                    {value.data && (
                      <div className="mt-2">
                        <p className="font-medium mb-1">Data:</p>
                        <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto max-h-96">
                          {JSON.stringify(value.data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <p>Click the button below to run database diagnostics</p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between flex-wrap gap-2">
          <Button 
            onClick={runDiagnostics} 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Running Diagnostics...
              </>
            ) : "Run Diagnostics"}
          </Button>
          
          <Button 
            onClick={createTestSchedules} 
            disabled={isLoading}
            variant="outline"
          >
            Create Test Schedules
          </Button>
          
          <Button 
            onClick={createTestSession} 
            disabled={isLoading}
            variant="outline"
          >
            Create Test Session
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 