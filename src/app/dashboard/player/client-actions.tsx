"use client";

import { useRouter } from "next/navigation";

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
