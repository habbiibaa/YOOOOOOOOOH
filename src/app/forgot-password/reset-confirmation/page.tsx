import { createClient } from "../../../supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

export default async function ResetConfirmationPage() {
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
              Password Reset Email Sent
            </h1>
            <p className="text-muted-foreground">
              We've sent a password reset link to your email address. Please
              check your inbox and follow the instructions to reset your
              password.
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 border border-border mb-6">
            <div className="flex items-start">
              <CheckCircle className="w-5 h-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                If you don't see the email in your inbox, please check your spam
                or junk folder.
              </p>
            </div>
          </div>

          <div className="flex flex-col space-y-3">
            <Link href="/sign-in" className="w-full">
              <Button
                variant="outline"
                className="w-full border-border text-card-foreground hover:bg-accent"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Sign In
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
