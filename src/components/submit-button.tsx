'use client';

import { signInAction as _signInAction } from '@/app/actions';
import { FormMessage } from "@/components/form-message";
import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from "@/components/ui/button";
import { type ComponentProps } from "react";
import { useFormStatus } from "react-dom";
import { Label } from '@/components/ui/label';

import Navbar from '@/components/navbar';
import Link from 'next/link';
type Props = ComponentProps<typeof Button> & {
  pendingText?: string;
};
export function SubmitButton({
  children,
  pendingText = "Submitting...",
  ...props
}: Props) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" aria-disabled={pending} {...props}>
      {pending ? pendingText : children}
    </Button>
  );
}
export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState(searchParams.get('message') || '');
  const [_, startTransition] = useTransition();

  async function signInAction(formData: FormData) {
    const supabase = createClient();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message || 'Invalid login credentials');
    } else {
      router.push('/dashboard'); // Update destination as needed
    }
  }

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8">
        <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-sm">
          <form
            className="flex flex-col space-y-6"
            action={(formData) => startTransition(() => signInAction(formData))}
          >
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-semibold tracking-tight">Sign in</h1>
              <p className="text-sm text-muted-foreground">
                Don&apos;t have an account?{' '}
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
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <Link
                    className="text-red-500 text-xs font-medium hover:text-red-400 hover:underline transition-all"
                    href="/(auth)/forgot-password"
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
                />
              </div>
            </div>

            <SubmitButton
              className="w-full bg-transparent border border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-300 font-bold"
              pendingText="Signing in..."
            >
              Sign in
            </SubmitButton>

            {message && <FormMessage message={{ message }} />}
          </form>
        </div>
      </div>
    </>
  );
}
