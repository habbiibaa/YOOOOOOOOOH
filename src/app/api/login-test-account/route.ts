import { createClient } from "../../../utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { role } = await request.json();
    const supabase = await createClient();

    let email, password;

    switch (role) {
      case "admin":
        email = "admin@squashacademy.com";
        password = "Admin123!";
        break;
      case "coach":
        email = "coach@squashacademy.com";
        password = "Coach123!";
        break;
      case "player":
        email = "player@squashacademy.com";
        password = "Player123!";
        break;
      default:
        return NextResponse.json(
          { success: false, error: "Invalid role specified" },
          { status: 400 },
        );
    }

    // First try to auto-confirm the email if it's not confirmed yet
    try {
      await supabase.auth.admin.updateUserById(
        role === "admin"
          ? "admin-user-id"
          : role === "coach"
            ? "coach-user-id"
            : "player-user-id",
        { email_confirm: true },
      );
    } catch (err) {
      console.log("Could not auto-confirm email, continuing with login");
    }

    // Sign in with the test account
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error(`Error signing in as ${role}:`, error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully signed in as ${role}`,
      user: data.user,
    });
  } catch (error) {
    console.error("Error in login-test-account:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
