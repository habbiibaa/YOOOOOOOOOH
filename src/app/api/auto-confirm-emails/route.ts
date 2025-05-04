import { createClient } from "../../../utils/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();

    // Get all users
    const { data: users, error: usersError } =
      await supabase.auth.admin.listUsers();

    if (usersError) {
      return NextResponse.json(
        { success: false, error: usersError.message },
        { status: 500 },
      );
    }

    // Auto-confirm all emails
    const updates = [];
    for (const user of users.users) {
      if (!user.email_confirmed_at) {
        // Update both auth.users and public.users tables
        const { error: authError } = await supabase.auth.admin.updateUserById(
          user.id,
          {
            email_confirm: true,
          },
        );

        // Also update the email_verified field in the users table
        const { error: userError } = await supabase
          .from("users")
          .update({ email_verified: true })
          .eq("id", user.id);
        updates.push({
          email: user.email,
          success: !authError && !userError,
          error: authError?.message || userError?.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Attempted to confirm all user emails",
      updates,
    });
  } catch (error) {
    console.error("Error confirming emails:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
