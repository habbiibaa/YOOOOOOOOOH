"use client";

import DashboardNavbar from "@/components/dashboard-navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, UserPlus } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function AddCoachPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const success = searchParams.get("success");

  return (
    <>
      <DashboardNavbar />
      <main className="w-full bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-2 mb-6">
            <Link
              href="/dashboard/admin/users"
              className="text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold">Add New Coach</h1>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-3xl mx-auto">
            <form action="/api/admin/create-coach" method="POST">
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Basic Information</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        name="full_name"
                        placeholder="John Doe"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="coach@example.com"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Coach Details */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Coach Details</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="specialization">Specialization</Label>
                      <Input
                        id="specialization"
                        name="specialization"
                        placeholder="e.g., Technical Training"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="years_experience">
                        Years of Experience
                      </Label>
                      <Input
                        id="years_experience"
                        name="years_experience"
                        type="number"
                        min="0"
                        defaultValue="5"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Biography</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      rows={4}
                      placeholder="Professional background and coaching philosophy"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hourly_rate">Hourly Rate (USD)</Label>
                    <Input
                      id="hourly_rate"
                      name="hourly_rate"
                      type="number"
                      min="0"
                      defaultValue="50"
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 text-red-700 p-3 rounded-md flex items-start gap-2">
                    <div>{error}</div>
                  </div>
                )}

                {success && (
                  <div className="bg-green-50 text-green-700 p-3 rounded-md flex items-start gap-2">
                    <div>
                      Coach account created successfully! A password reset email
                      has been sent to the new coach.
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <Link href="/dashboard/admin/users">
                    <Button variant="outline" type="button">
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    Create Coach Account
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}
