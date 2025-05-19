import { createClient } from "../../../../utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("id");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // Check if current user is admin
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 },
      );
    }

    const { data: adminCheck } = await supabase
      .from("users")
      .select("role")
      .eq("id", currentUser.id)
      .single();

    if (!adminCheck || adminCheck.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Not authorized" },
        { status: 403 },
      );
    }

    // Delete related records first (coaches, players)
    await supabase.from("coaches").delete().eq("id", userId);
    await supabase.from("players").delete().eq("id", userId);

    // Delete user from users table
    const { error: userDeleteError } = await supabase
      .from("users")
      .delete()
      .eq("id", userId);

    if (userDeleteError) {
      console.error("Error deleting user record:", userDeleteError);
      return NextResponse.json(
        { success: false, error: userDeleteError.message },
        { status: 500 },
      );
    }

    // Delete user from auth.users
    const { error: authDeleteError } =
      await supabase.auth.admin.deleteUser(userId);

    if (authDeleteError) {
      console.error("Error deleting auth user:", authDeleteError);
      return NextResponse.json(
        { success: false, error: authDeleteError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in delete-user:", error);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 },
    );
  }
}
