"use client";

import { regenerateCoachSessions } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function RegenerateSessionsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRegenerateSessions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setResult(null);
      
      const response = await regenerateCoachSessions();
      setResult(response);
      
      if (!response.success) {
        setError(response.error || "Failed to regenerate sessions");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-10 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Regenerate Coach Sessions</CardTitle>
          <CardDescription>
            Use this page to regenerate all available coach sessions based on the coach schedules.
            This is useful after modifying the coach_sessions table structure or after adding new coaches.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            <div>
              <p className="mb-4">
                Clicking the button below will:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Delete all future available sessions</li>
                <li>Generate new sessions for all coaches based on their schedules</li>
                <li>Sessions will be generated for the next 30 days</li>
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
                <div className="mt-2 text-sm">
                  <p>Total sessions generated: {result.totalSessions}</p>
                  <p>Sessions successfully created: {result.createdSessions}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleRegenerateSessions} 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Regenerating Sessions...
              </>
            ) : "Regenerate Coach Sessions"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 