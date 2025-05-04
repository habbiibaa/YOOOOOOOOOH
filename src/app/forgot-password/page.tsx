import { createClient } from "../../supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";
import { forgotPasswordAction } from "../actions";

export default async function ForgotPasswordPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If user is already logged in, redirect to dashboard
  if (user) {
    return redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto bg-card p-8 rounded-xl shadow-lg border border-border">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-card-foreground mb-2">
              Reset Your Password
            </h1>
            <p className="text-muted-foreground">
              Enter your email address and we'll send you a link to reset your
              password.
            </p>
          </div>

          <form action={forgotPasswordAction} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-card-foreground"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-card-foreground"
                placeholder="your.email@example.com"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Send Reset Link
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/sign-in" className="text-primary hover:underline">
              Back to Sign In
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
