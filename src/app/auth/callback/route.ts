import { createClient } from "../../../utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const redirect_to = requestUrl.searchParams.get("redirect_to");
  const token = requestUrl.searchParams.get("token");

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // URL to redirect to after sign in process completes
  let redirectTo = redirect_to || "/dashboard";

  // If token exists, append it to the redirect URL
  if (token) {
    redirectTo = `${redirectTo}?token=${token}`;
  }

  return NextResponse.redirect(new URL(redirectTo, requestUrl.origin));
}
