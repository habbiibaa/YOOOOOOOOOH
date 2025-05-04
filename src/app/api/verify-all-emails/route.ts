import { createClient } from "../../../utils/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();

    // Get all users from the users table instead of auth.admin.listUsers
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, email, email_verified");

    if (usersError) {
      return NextResponse.json(
        { success: false, error: usersError.message },
        { status: 500 },
      );
    }

    // Verify all emails
    const updates = [];
    for (const user of users || []) {
      if (!user.email_verified) {
        try {
          // Update the email_verified field in the users table
          const { error } = await supabase
            .from("users")
            .update({ email_verified: true })
            .eq("id", user.id);

          // Try to update auth user if possible
          try {
            await supabase.auth.admin.updateUserById(user.id, {
              email_confirm: true,
            });
          } catch (authErr) {
            console.log("Could not update auth user, continuing", authErr);
          }

          updates.push({
            email: user.email,
            success: !error,
            error: error?.message,
          });
        } catch (err) {
          updates.push({
            email: user.email,
            success: false,
            error: err.message,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "All user emails have been verified",
      updates,
    });
  } catch (error) {
    console.error("Error verifying emails:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
