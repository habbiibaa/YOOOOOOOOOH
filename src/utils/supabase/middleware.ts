import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export const updateSession = async (request: NextRequest) => {
  try {
    // Create an initial response object
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    // Create a helper object to collect cookies that need to be set
    const cookiesToSet = [];

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll().map(({ name, value }) => ({
              name,
              value,
            }));
          },
          set(name, value, options) {
            cookiesToSet.push({ name, value, options });
          },
          remove(name, options) {
            cookiesToSet.push({ name, value: '', options: { ...options, maxAge: 0 } });
          },
        },
      }
    );

    // This will refresh session if expired - required for Server Components
    // https://supabase.com/docs/guides/auth/server-side/nextjs
    const { data: { session, user }, error } = await supabase.auth.getSession();

    // Now apply all the cookies that were set during the request
    cookiesToSet.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options);
    });

    // Debug logging (you can remove this in production)
    console.log(`Middleware: Path ${request.nextUrl.pathname}, User: ${user?.id ? 'Authenticated' : 'Unauthenticated'}`);
    
    // Protected routes
    if (request.nextUrl.pathname.startsWith("/dashboard") && !user) {
      console.log("Redirecting to sign-in from dashboard route - user not authenticated");
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    // Don't redirect home page for authenticated users
    // The condition below would redirect authenticated users from "/" to "/" creating an infinite loop
    // if (request.nextUrl.pathname === "/" && user) {
    //   return NextResponse.redirect(new URL("/dashboard", request.url));
    // }

    return response;
  } catch (e) {
    console.error("Middleware error:", e);
    // If you are here, a Supabase client could not be created or another error occurred
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }
};
