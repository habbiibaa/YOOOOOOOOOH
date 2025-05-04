"use client";

import { useState } from "react";
import { testCreateCoachSession } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircleIcon, XCircleIcon } from "lucide-react";

export default function TestDatabasePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  
  const handleRunTest = async () => {
    setIsLoading(true);
    try {
      const result = await testCreateCoachSession();
      setResults(result);
    } catch (error) {
      console.error("Error running test:", error);
      setResults({
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Database Connection Test</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Database Connection</CardTitle>
          <CardDescription>
            This will test the database connection and structure by running several diagnostics
            and creating test data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleRunTest} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Running Tests..." : "Run Database Tests"}
          </Button>
        </CardContent>
      </Card>
      
      {results && (
        <Alert 
          variant={results.success ? "default" : "destructive"}
          className="mb-6"
        >
          <div className="flex items-center gap-2 mb-2">
            {results.success ? 
              <CheckCircleIcon className="h-5 w-5 text-green-500" /> : 
              <XCircleIcon className="h-5 w-5 text-red-500" />
            }
            <AlertTitle>{results.success ? "Tests Passed" : "Tests Failed"}</AlertTitle>
          </div>
          <AlertDescription>
            {results.success ? (
              <div className="space-y-2">
                <p>{results.message}</p>
                <div className="bg-gray-100 p-3 rounded-md">
                  <p className="text-sm text-gray-600">Session ID: {results.sessionId}</p>
                  <p className="text-sm text-gray-600">Coach ID: {results.coachId}</p>
                  <p className="text-sm text-gray-600">Branch ID: {results.branchId}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-red-500 font-medium">{results.error}</p>
                {results.details && (
                  <div className="bg-red-50 p-3 rounded-md">
                    <h3 className="text-sm font-medium">Error Details:</h3>
                    <pre className="text-xs mt-2 overflow-auto max-h-40">
                      {JSON.stringify(results.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Database Tables Needed</CardTitle>
          <CardDescription>
            These are the tables that should exist in your database for the coach schedule feature
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border rounded p-4">
              <h3 className="font-medium mb-2">coaches</h3>
              <p className="text-sm text-gray-500">Stores coach profiles and specialties</p>
            </div>
            
            <div className="border rounded p-4">
              <h3 className="font-medium mb-2">branches</h3>
              <p className="text-sm text-gray-500">Stores branch locations where coaches work</p>
            </div>
            
            <div className="border rounded p-4">
              <h3 className="font-medium mb-2">coach_sessions</h3>
              <p className="text-sm text-gray-500">Stores individual coaching sessions</p>
              <div className="mt-2 bg-gray-100 p-2 rounded text-xs">
                <p>Required fields:</p>
                <ul className="list-disc ml-4 mt-1">
                  <li>id (UUID)</li>
                  <li>coach_id (UUID)</li>
                  <li>branch_id (UUID)</li>
                  <li>session_date (Date)</li>
                  <li>start_time (Time)</li>
                  <li>end_time (Time)</li>
                  <li>status (String)</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 