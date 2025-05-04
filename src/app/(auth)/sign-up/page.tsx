"use client";

import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import ClientNavbar from "@/components/client-navbar";
import { signUpAction } from "@/app/actions";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function SignUp() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [user, setUser] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState<string>("player");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const messageParam = params.get("message");
    if (messageParam) setMessage(messageParam);

    async function checkUser() {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setIsLoading(false);

      if (data.user) {
        router.push("/profiles");
      }
    }

    checkUser();
  }, [router]);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <>
      <ClientNavbar />
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8">
        <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-sm">
          <form
            className="flex flex-col space-y-6"
            action={(formData) => {
              formData.set("role", selectedRole);
              startTransition(async () => {
                await signUpAction(formData);
              });
            }}
          >
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-semibold tracking-tight">Sign up</h1>
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  className="text-primary font-medium hover:underline transition-all"
                  href="/sign-in"
                >
                  Sign in
                </Link>
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-sm font-medium">
                  Full Name
                </Label>
                <Input
                  id="full_name"
                  name="full_name"
                  type="text"
                  placeholder="John Doe"
                  required
                  className="w-full"
                  disabled={isPending}
                />
              </div>

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
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Your password"
                  minLength={6}
                  required
                  className="w-full"
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-medium">
                  Role
                </Label>
                <RadioGroup 
                  id="role"
                  name="role"
                  value={selectedRole}
                  onValueChange={setSelectedRole}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2 rounded-md border border-border p-3 transition-colors hover:bg-muted/50">
                    <RadioGroupItem value="player" id="player" />
                    <Label htmlFor="player" className="flex-1 cursor-pointer">Player</Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-md border border-border p-3 transition-colors hover:bg-muted/50">
                    <RadioGroupItem value="coach" id="coach" />
                    <Label htmlFor="coach" className="flex-1 cursor-pointer">Coach</Label>
                    <div className="text-xs text-muted-foreground">Requires approval</div>
                  </div>
                  <div className="flex items-center space-x-2 rounded-md border border-border p-3 transition-colors hover:bg-muted/50">
                    <RadioGroupItem value="admin" id="admin" />
                    <Label htmlFor="admin" className="flex-1 cursor-pointer">Admin</Label>
                    <div className="text-xs text-muted-foreground">Requires approval</div>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <SubmitButton
              pendingText="Signing up..."
              className="w-full bg-red-600 hover:bg-red-700 hover:shadow-lg transition-all duration-300 rounded-xl"
              disabled={isPending}
            >
              Sign up
            </SubmitButton>

            {message && <FormMessage message={{ type: "error", text: message }} />}

            <p className="text-xs text-center text-muted-foreground">
              By creating an account, you agree to our{" "}
              <Link
                href="/terms-of-service"
                className="text-primary hover:underline"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy-policy"
                className="text-primary hover:underline"
              >
                Privacy Policy
              </Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}