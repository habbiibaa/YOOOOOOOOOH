"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { initializeCoachesAndSchedules, generateAvailableSessions } from "../actions";

export function TestAccountButtons() {
  const router = useRouter();

  const loginAs = async (role: string) => {
    try {
      const response = await fetch("/api/login-test-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      if (response.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        console.error("Failed to login");
        alert("Failed to login. Please try creating the accounts first.");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      alert("Error logging in. Please try again.");
    }
  };

  return (
    <div className="flex flex-wrap gap-3 mt-2">
      <button
        onClick={() => loginAs("admin")}
        className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
      >
        Login as Admin
      </button>
      <button
        onClick={() => loginAs("coach")}
        className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
      >
        Login as Coach
      </button>
      <button
        onClick={() => loginAs("player")}
        className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
      >
        Login as Player
      </button>
    </div>
  );
}

export function AdminActions() {
  const router = useRouter();
  
  const handleInitializeBookings = async () => {
    try {
      await initializeCoachesAndSchedules();
      await generateAvailableSessions(new Date());
      alert("Bookings data initialized successfully!");
    } catch (error) {
      console.error("Error initializing bookings:", error);
      alert("Error initializing bookings. See console for details.");
    }
  };

  const navigateToCoachSetup = () => {
    router.push("/dashboard/admin/setup-coaches");
  };
  
  const navigateToCoachScheduling = () => {
    router.push("/dashboard/admin/coach-schedule");
  };

  return (
    <div className="mt-4 space-y-4">
      <div>
        <h3 className="text-lg font-medium mb-2">Bookings System</h3>
        <Button
          onClick={handleInitializeBookings}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
        >
          Initialize Bookings System
        </Button>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-2">Coach Management</h3>
        <div className="space-y-2">
          <Button
            onClick={navigateToCoachSetup}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            Setup Coaches & Schedules
          </Button>
          <p className="text-xs text-gray-400">
            Add coaches with pre-defined schedules at Royal British School
          </p>
          
          <Button
            onClick={navigateToCoachScheduling}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Advanced Schedule Management
          </Button>
          <p className="text-xs text-gray-400">
            Create and manage coach schedules and generate sessions
          </p>
        </div>
      </div>
    </div>
  );
}
