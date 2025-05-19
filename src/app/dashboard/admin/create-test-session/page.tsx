"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export default function CreateTestSessionPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, any> | null>(null);
  const [sessionDate, setSessionDate] = useState<string>(
    new Date().toISOString().split('T')[0] // Today's date as default
  );
  
  // Function to create a simple test session
  const createTestSession = async () => {
    setLoading(true);
    setResult(null);
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
      
      const branchId = branches[0].id;
      const coachId = coaches[0].id;
      
      // Create a simple test session
      const testSession = {
        id: crypto.randomUUID(),
        coach_id: coachId,
        branch_id: branchId,
        session_date: sessionDate,
        start_time: "16:30",
        end_time: "17:15",
        status: "available",
        player_id: null,
        user_id: null,
        day_of_week: new Date(sessionDate).toLocaleDateString('en-US', { weekday: 'long' }),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log("Creating test session:", testSession);
      
      // Try server route first
      try {
        const response = await fetch('/api/admin/create-sessions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessions: [testSession]
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Server error: ${response.status}`);
        }
        
        const apiResult = await response.json();
        setResult({
          success: true,
          method: "API route",
          message: "Session created successfully via API",
          details: apiResult
        });
      } catch (apiError) {
        console.error("API approach failed:", apiError);
        
        // Fallback to direct insert
        console.log("Trying direct insert...");
        const { data, error: insertError } = await supabase
          .from("coach_sessions")
          .insert(testSession)
          .select();
          
        if (insertError) {
          console.error("Session insertion error:", insertError);
          throw new Error(`Failed to create test session: ${insertError.message}`);
        }
        
        setResult({
          success: true,
          method: "Direct Supabase",
          message: "Session created successfully via direct insert",
          data: data
        });
      }
    } catch (error) {
      console.error("Error creating test session:", error);
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-10 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create Test Session</CardTitle>
          <CardDescription>
            This tool will create a single coach session for testing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="session-date">Session Date</Label>
              <Input 
                id="session-date"
                type="date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
              />
            </div>
            
            {result && (
              <div className={`p-4 rounded-md mt-4 ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <h3 className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                  {result.success ? 'Success!' : 'Error'}
                </h3>
                <p className={result.success ? 'text-green-700' : 'text-red-700'}>
                  {result.message || result.error || "Operation completed"}
                </p>
                {result.details && (
                  <pre className="mt-2 text-xs bg-white p-2 rounded overflow-auto max-h-40">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={createTestSession}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : "Create Test Session"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 