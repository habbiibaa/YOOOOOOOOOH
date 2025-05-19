"use client";

import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import ClientNavbar from "@/components/client-navbar"; // Use ClientNavbar for consistency
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormMessage, Message } from "@/components/form-message";

export default function SignInPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<Message | undefined>(() => {
    const error = searchParams.get("error");
    const success = searchParams.get("success");
    if (error) return { type: "error", text: decodeURIComponent(error) };
    if (success) return { type: "success", text: decodeURIComponent(success) };
    return undefined;
  });

  async function signInAction(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const supabase = createClient();

    setMessage(undefined); // Clear previous messages

    try {
      // Use the standard sign-in function without CAPTCHA
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setMessage({ type: "error", text: `Error: ${error.message}` });
        return;
      }

      if (!data || !data.user) {
        setMessage({ type: "error", text: "No user data returned" });
        return;
      }

      // Get user role from database
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("role, approved")
        .eq("id", data.user.id)
        .single();

      if (userError) {
        console.error("Error fetching user data:", userError);
        setMessage({ type: "error", text: "Error fetching user profile" });
        return;
      }

      // Handle approval status
      if (["coach", "admin"].includes(userData.role) && !userData.approved) {
        setMessage({
          type: "error",
          text: "Your account is pending approval from an administrator."
        });
        return;
      }

      setMessage({ type: "success", text: "Sign in successful! Redirecting..." });
      
      // Redirect based on role after a short delay to allow the success message to be seen
      setTimeout(() => {
        if (userData.role === "admin") {
          console.log("Redirecting to admin dashboard");
          router.replace("/dashboard/admin");
        } else if (userData.role === "coach") {
          console.log("Redirecting to coach dashboard");
          router.replace("/dashboard/coach");
        } else {
          console.log("Redirecting to player dashboard");
          router.replace("/dashboard/player");
        }
      }, 1000);
    } catch (error) {
      console.error("Sign-in error:", error);
      setMessage({ 
        type: "error", 
        text: error instanceof Error ? error.message : "An unexpected error occurred" 
      });
    }
  }

  return (
    <>
      <ClientNavbar />
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8">
        <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-sm">
          <form
            className="flex flex-col space-y-6"
            action={() => {
              startTransition(() => {
                const form = new FormData(document.querySelector('form') as HTMLFormElement);
                signInAction(form);
              });
            }}
          >
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-semibold tracking-tight">Sign in</h1>
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link
                  className="text-primary font-medium hover:underline transition-all"
                  href="/sign-up"
                >
                  Sign up
                </Link>
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  className="w-full"
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <Link
                    className="text-red-500 text-xs font-medium hover:text-red-400 hover:underline transition-all"
                    href="/forgot-password"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Your password"
                  required
                  className="w-full"
                  disabled={isPending}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-transparent border border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-300 font-bold"
              disabled={isPending}
            >
              {isPending ? "Signing in..." : "Sign in"}
            </Button>

            {message && <FormMessage message={message} />}
          </form>
        </div>
      </div>
    </>
  );
}