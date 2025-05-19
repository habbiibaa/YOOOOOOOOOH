"use client";

import { useState } from "react";
import DashboardNavbar from "@/components/dashboard-navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Database, RefreshCw, Play, Check, AlertTriangle, CalendarDays } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function DatabaseSetupPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState<string | null>(null);
  const [status, setStatus] = useState<{
    success: boolean;
    message: string;
    details?: string;
  } | null>(null);

  const runInitializeSchedules = async () => {
    try {
      setLoading("schedules");
      setStatus(null);
      
      const response = await fetch("/api/admin/initialize-schedules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to initialize schedules");
      }
      
      setStatus({
        success: true,
        message: "Schedules initialized successfully!",
        details: `Created ${data.results?.success || 0} schedules. ${data.results?.missingCoaches?.length || 0} coaches were not found.`,
      });
    } catch (error) {
      console.error("Error initializing schedules:", error);
      setStatus({
        success: false,
        message: "Failed to initialize schedules",
        details: error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setLoading(null);
    }
  };

  const runDatabaseMigrations = async () => {
    try {
      setLoading("migrations");
      setStatus(null);
      
      const response = await fetch("/api/admin/run-migrations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to run migrations");
      }
      
      setStatus({
        success: true,
        message: "Migrations completed successfully!",
        details: data.details || "All migrations were applied.",
      });
    } catch (error) {
      console.error("Error running migrations:", error);
      setStatus({
        success: false,
        message: "Failed to run migrations",
        details: error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setLoading(null);
    }
  };

  const regenerateSessions = async () => {
    try {
      setLoading("sessions");
      setStatus(null);
      
      // Call the RPC function directly using Supabase client
      const { data, error } = await supabase.rpc('regenerate_coach_sessions_for_next_days', {
        days_to_generate: 30
      });
      
      if (error) {
        throw error;
      }
      
      setStatus({
        success: true,
        message: "Sessions regenerated successfully!",
        details: "Created available sessions for the next 30 days based on coach schedules.",
      });
    } catch (error) {
      console.error("Error regenerating sessions:", error);
      setStatus({
        success: false,
        message: "Failed to regenerate sessions",
        details: error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      <DashboardNavbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <Link
            href="/dashboard/admin"
            className="text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold">Database Setup & Maintenance</h1>
        </div>

        {status && (
          <div className={`mb-6 p-4 rounded-lg ${status.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-start">
              {status.success ? (
                <Check className="w-5 h-5 text-green-500 mt-0.5 mr-2" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 mr-2" />
              )}
              <div>
                <p className={`font-medium ${status.success ? 'text-green-800' : 'text-red-800'}`}>
                  {status.message}
                </p>
                {status.details && (
                  <p className={`mt-1 text-sm ${status.success ? 'text-green-700' : 'text-red-700'}`}>
                    {typeof status.details === 'string' 
                      ? status.details 
                      : JSON.stringify(status.details)}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Initialize Schedules</CardTitle>
                <CalendarDays className="w-5 h-5 text-blue-500" />
              </div>
              <CardDescription>
                Create coach schedules for the Royal British School branch
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">
                This will create weekly schedules for all coaches at the Royal British School branch.
                If a coach or schedule already exists, it will be skipped.
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={runInitializeSchedules}
                className="w-full"
                disabled={loading !== null}
              >
                {loading === "schedules" ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Initializing...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Initialize Schedules
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Run Database Migrations</CardTitle>
                <Database className="w-5 h-5 text-purple-500" />
              </div>
              <CardDescription>
                Apply all database migrations to ensure schema is up to date
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">
                This will run all database migrations in the correct order.
                It's safe to run this multiple times as only new migrations will be applied.
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={runDatabaseMigrations}
                className="w-full"
                disabled={loading !== null}
              >
                {loading === "migrations" ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Running Migrations...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Run Migrations
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Regenerate Coach Sessions</CardTitle>
                <RefreshCw className="w-5 h-5 text-green-500" />
              </div>
              <CardDescription>
                Generate available sessions based on coach schedules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">
                This will delete all future available sessions and regenerate them based on 
                the current coach schedules. Any sessions that have already been booked will not be affected.
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={regenerateSessions}
                className="w-full"
                disabled={loading !== null}
              >
                {loading === "sessions" ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Regenerating Sessions...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Regenerate Sessions
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
} 