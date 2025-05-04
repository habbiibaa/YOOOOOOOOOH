import { createClient } from "../../../../utils/supabase/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const email = formData.get("email") as string;
    const fullName = formData.get("full_name") as string;
    const specialization = formData.get("specialization") as string;
    const yearsExperience =
      parseInt(formData.get("years_experience") as string) || 0;
    const hourlyRate = parseFloat(formData.get("hourly_rate") as string) || 50;
    const bio = formData.get("bio") as string;

    const supabase = createClient();

    // Check if current user is admin
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    if (!currentUser) {
      return NextResponse.redirect(
        new URL(
          "/dashboard/admin/coaches/new?error=Not authenticated",
          request.url,
        ),
      );
    }

    const { data: adminCheck } = await supabase
      .from("users")
      .select("role")
      .eq("id", currentUser.id)
      .single();

    if (!adminCheck || adminCheck.role !== "admin") {
      return NextResponse.redirect(
        new URL(
          "/dashboard/admin/coaches/new?error=Not authorized",
          request.url,
        ),
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.redirect(
        new URL(
          "/dashboard/admin/coaches/new?error=A user with this email already exists",
          request.url,
        ),
      );
    }

    // Create a temporary password
    const tempPassword =
      Math.random().toString(36).slice(-8) +
      Math.random().toString(36).slice(-8).toUpperCase() +
      "!1";

    // Create user in Auth
    const { data: authUser, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { full_name: fullName },
        password: tempPassword,
      });

    if (authError) {
      console.error("Error creating auth user:", authError);
      return NextResponse.redirect(
        new URL(
          `/dashboard/admin/coaches/new?error=${encodeURIComponent(authError.message)}`,
          request.url,
        ),
      );
    }

    if (!authUser.user) {
      return NextResponse.redirect(
        new URL(
          "/dashboard/admin/coaches/new?error=Failed to create user",
          request.url,
        ),
      );
    }

    // Create user record
    const { error: userError } = await supabase.from("users").insert({
      id: authUser.user.id,
      email,
      full_name: fullName,
      name: fullName,
      role: "coach",
      user_id: authUser.user.id,
      token_identifier: authUser.user.id,
      created_at: new Date().toISOString(),
    });

    if (userError) {
      console.error("Error creating user record:", userError);
      return NextResponse.redirect(
        new URL(
          `/dashboard/admin/coaches/new?error=${encodeURIComponent(userError.message)}`,
          request.url,
        ),
      );
    }

    // Create coach record
    const { error: coachError } = await supabase.from("coaches").insert({
      id: authUser.user.id,
      specialization,
      years_experience: yearsExperience,
      hourly_rate: hourlyRate,
      bio,
      created_at: new Date().toISOString(),
    });

    if (coachError) {
      console.error("Error creating coach record:", coachError);
      return NextResponse.redirect(
        new URL(
          `/dashboard/admin/coaches/new?error=${encodeURIComponent(coachError.message)}`,
          request.url,
        ),
      );
    }

    // Send password reset email
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(".supabase.co", "")}/dashboard/reset-password`,
      },
    );

    if (resetError) {
      console.error("Error sending password reset email:", resetError);
      // Still redirect to success but with a warning
      return NextResponse.redirect(
        new URL(
          "/dashboard/admin/coaches/new?success=true&error=Account created but failed to send password reset email",
          request.url,
        ),
      );
    }

    return NextResponse.redirect(
      new URL("/dashboard/admin/coaches/new?success=true", request.url),
    );
  } catch (error) {
    console.error("Error in create-coach:", error);
    return NextResponse.redirect(
      new URL("/dashboard/admin/coaches/new?error=Server error", request.url),
    );
  }
}
