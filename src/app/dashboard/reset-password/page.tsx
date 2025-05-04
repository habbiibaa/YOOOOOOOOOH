import { resetPasswordAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import Navbar from "@/components/navbar";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "../../../utils/supabase/server";

export default async function ResetPassword(props: {
  searchParams: { token?: string; message?: string; type?: string };
}) {
  const token = props.searchParams.token;
  console.log("Reset password token:", token);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const message: Message = {};
  if (props.searchParams.message) {
    message.message = props.searchParams.message;
    message.type = props.searchParams.type as "error" | "success";
  }

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8">
        <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-sm">
          <form className="flex flex-col space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-semibold tracking-tight text-card-foreground">
                Reset password
              </h1>
              <p className="text-sm text-muted-foreground">
                Please enter your new password below.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-card-foreground"
                >
                  New password
                </Label>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="New password"
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-card-foreground"
                >
                  Confirm password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm password"
                  required
                  className="w-full"
                />
              </div>

              {token && <input type="hidden" name="token" value={token} />}
            </div>

            <SubmitButton
              formAction={resetPasswordAction}
              pendingText="Resetting password..."
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Reset password
            </SubmitButton>

            <FormMessage message={message} />
          </form>
        </div>
      </div>
    </>
  );
}
