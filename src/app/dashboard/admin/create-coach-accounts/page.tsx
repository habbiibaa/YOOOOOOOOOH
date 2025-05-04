"use client";

import { useState } from "react";
import { createCoachAccounts } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, CheckCircleIcon, XCircleIcon } from "lucide-react";
import { redirect } from "next/navigation";
import DashboardNavbar from "@/components/dashboard-navbar";
import { createClient } from "@/utils/supabase/server";
import { Users, CheckCircle } from "lucide-react";
import Link from "next/link";
import { CreateCoachesButton } from "./create-coaches-button";

export default async function CreateCoachAccountsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Get user data including role
  let { data: userData, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (userError || userData?.role !== "admin") {
    return redirect("/dashboard");
  }

  // Get coaches that are already in the system
  const { data: coaches, error: coachesError } = await supabase
    .from("coaches")
    .select("id, name, rating, specialties")
    .order("name", { ascending: true })
    .limit(20);

  return (
    <>
      <DashboardNavbar />
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Create Coach Accounts</h1>
          <p className="text-muted-foreground mt-2">
            Set up new coach accounts with default credentials
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Coaches Creation Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Create New Coaches</CardTitle>
                  <Users className="h-5 w-5 text-blue-500" />
                </div>
                <CardDescription>
                  Automatically set up accounts for all default coaches
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert className="mb-4 bg-amber-50 text-amber-800 border-amber-200">
                  <AlertDescription>
                    This action will create coach accounts with the following emails:
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>ahmed.fakhry@squashacademy.com</li>
                      <li>ahmed.mahrous@squashacademy.com</li>
                      <li>ahmed.magdy@squashacademy.com</li>
                      <li>alaa.taha@squashacademy.com</li>
                      <li>ahmed.maher@squashacademy.com</li>
                      <li>omar.zaki@squashacademy.com</li>
                      <li>hussein.amr@squashacademy.com</li>
                    </ul>
                  </AlertDescription>
                </Alert>
                <p className="text-sm text-muted-foreground mb-4">
                  Each coach will be created with:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground mb-6">
                  <li>A random secure password</li>
                  <li>Default schedule (Monday & Wednesday, 4:30 PM - 8:30 PM)</li>
                  <li>Default specialties and training levels</li>
                </ul>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Link href="/dashboard/admin">
                  <Button variant="outline">Cancel</Button>
                </Link>
                <CreateCoachesButton />
              </CardFooter>
            </Card>
          </div>

          <div>
            {/* Existing Coaches Card */}
            <Card>
              <CardHeader>
                <CardTitle>Existing Coaches</CardTitle>
                <CardDescription>
                  {coachesError
                    ? "Error loading coaches"
                    : `${coaches?.length || 0} coaches in the system`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {coachesError ? (
                  <div className="flex items-center justify-center py-6 text-muted-foreground">
                    <XCircle className="h-5 w-5 mr-2 text-red-500" />
                    Error loading coaches
                  </div>
                ) : coaches?.length === 0 ? (
                  <div className="flex items-center justify-center py-6 text-muted-foreground">
                    No coaches found
                  </div>
                ) : (
                  <div className="space-y-3">
                    {coaches?.map((coach) => (
                      <div
                        key={coach.id}
                        className="flex items-center justify-between border-b border-muted pb-2"
                      >
                        <div>
                          <p className="font-medium">{coach.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {coach.specialties?.join(", ") || "No specialties"}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
} 