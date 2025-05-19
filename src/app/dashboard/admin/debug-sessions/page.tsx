"use client";

import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function DebugSessionsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>({});
  const [error, setError] = useState<string | null>(null);

  const runDiagnostics = async () => {
    setIsLoading(true);
    setError(null);
    setResults({});
    
    const supabase = createClient();
    const diagResults: any = {};
    
    try {
      // 1. Check coaches table
      console.log("Checking coaches table...");
      const { data: coaches, error: coachError } = await supabase
        .from("coaches")
        .select("id, name")
        .limit(5);
        
      diagResults.coaches = {
        success: !coachError,
        error: coachError?.message,
        count: coaches?.length,
        data: coaches
      };
      
      // 2. Check coach_schedules table
      console.log("Checking coach_schedules table...");
      const { data: schedules, error: scheduleError } = await supabase
        .from("coach_schedules")
        .select("id, coach_id, day_of_week, start_time, end_time, session_duration")
        .limit(5);
        
      diagResults.schedules = {
        success: !scheduleError,
        error: scheduleError?.message,
        count: schedules?.length,
        data: schedules
      };
      
      // 3. Check branches table
      console.log("Checking branches table...");
      const { data: branches, error: branchError } = await supabase
        .from("branches")
        .select("id, name")
        .limit(5);
        
      diagResults.branches = {
        success: !branchError,
        error: branchError?.message,
        count: branches?.length,
        data: branches
      };
      
      // 4. Check coach_sessions table structure
      console.log("Checking coach_sessions table structure...");
      try {
        // First, try a simple select to see if the table exists
        const { data: sessions, error: sessionError } = await supabase
          .from("coach_sessions")
          .select("id")
          .limit(1);
          
        if (sessionError) {
          diagResults.sessions = {
            success: false,
            error: sessionError.message,
          };
        } else {
          // If select works, then check columns by attempting to insert a test record
          const testId = crypto.randomUUID();
          let coachId = null;
          let branchId = null;
          
          // Get a valid coach ID and branch ID if available
          if (coaches && coaches.length > 0) {
            coachId = coaches[0].id;
          }
          
          if (branches && branches.length > 0) {
            branchId = branches[0].id;
          }
          
          if (!coachId || !branchId) {
            diagResults.sessions = {
              success: false,
              error: "Cannot test session insertion - missing coach or branch IDs",
              structure: "Unknown - cannot test without valid references"
            };
          } else {
            try {
              // Prepare tomorrow's date for the test session
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              const dateString = tomorrow.toISOString().split('T')[0];
              
              // Try to insert a test record with all fields
              const { error: insertError } = await supabase
                .from("coach_sessions")
                .insert({
                  id: testId,
                  coach_id: coachId,
                  branch_id: branchId,
                  coach_schedule_id: schedules?.[0]?.id,
                  session_date: dateString,
                  start_time: "10:00",
                  end_time: "10:45",
                  status: "available",
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                });
                
              if (insertError) {
                diagResults.sessions = {
                  success: false,
                  error: insertError.message,
                  code: insertError.code,
                  details: insertError.details,
                  structure: "Error - cannot insert record"
                };
              } else {
                // Delete the test record
                await supabase
                  .from("coach_sessions")
                  .delete()
                  .eq("id", testId);
                  
                diagResults.sessions = {
                  success: true,
                  structure: "OK - all required fields exist"
                };
              }
            } catch (err) {
              diagResults.sessions = {
                success: false,
                error: err instanceof Error ? err.message : "Unknown error",
                structure: "Error - exception during test"
              };
            }
          }
        }
      } catch (err) {
        diagResults.sessions = {
          success: false,
          error: err instanceof Error ? err.message : "Unknown error"
        };
      }
      
      // 5. Check foreign key constraints
      console.log("Checking FK relationships...");
      diagResults.relationships = {
        coaches_fk: diagResults.coaches.success ? "OK" : "Error - coaches table issue",
        branches_fk: diagResults.branches.success ? "OK" : "Error - branches table issue",
        schedules_fk: diagResults.schedules.success ? "OK" : "Error - coach_schedules table issue"
      };
      
      setResults(diagResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  return (
    <div className="container py-10 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Debug Session Generation</CardTitle>
          <CardDescription>
            This page helps diagnose issues with coach session generation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            {error && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-md text-red-800">
                <p className="font-bold">Error</p>
                <p>{error}</p>
              </div>
            )}
            
            {Object.keys(results).length > 0 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Diagnostic Results</h3>
                
                <div className="space-y-4">
                  {Object.entries(results).map(([key, value]: [string, any]) => (
                    <div key={key} className={`border p-4 rounded-md ${value.success === false ? 'border-red-300 bg-red-50' : 'border-green-300 bg-green-50'}`}>
                      <h4 className="font-bold text-md mb-2 capitalize">{key}</h4>
                      
                      {value.success === false && (
                        <div className="text-red-700 mb-2">
                          <p><strong>Error:</strong> {value.error}</p>
                          {value.code && <p><strong>Code:</strong> {value.code}</p>}
                          {value.details && <p><strong>Details:</strong> {value.details}</p>}
                        </div>
                      )}
                      
                      {value.structure && (
                        <p><strong>Structure:</strong> {value.structure}</p>
                      )}
                      
                      {value.count !== undefined && (
                        <p><strong>Count:</strong> {value.count} records found</p>
                      )}
                      
                      {value.data && (
                        <div className="mt-2">
                          <p><strong>Sample data:</strong></p>
                          <pre className="bg-slate-100 p-2 rounded text-xs overflow-auto max-h-40">
                            {JSON.stringify(value.data, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
                  <h4 className="font-bold">What to do next:</h4>
                  <ul className="list-disc pl-5 mt-2">
                    <li>Check that all tables exist and have the expected structure</li>
                    <li>Ensure there are coaches and coach schedules in the database</li>
                    <li>If foreign key constraints are failing, check that the referenced tables have appropriate data</li>
                    <li>Look for any error messages that indicate missing columns or constraints</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={runDiagnostics} 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Running Diagnostics...
              </>
            ) : "Run Diagnostics Again"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 