import { createClient } from "../../../../utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { coachId } = await request.json();

    if (!coachId) {
      return NextResponse.json(
        { success: false, error: "Coach ID is required" },
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

    console.log(`Admin ${currentUser.id} is approving coach ${coachId}`);

    // Update the users table first - this is the primary source of truth
    const { error: updateUserError } = await supabase
      .from("users")
      .update({ 
        approved: true,
        updated_at: new Date().toISOString()
      })
      .eq("id", coachId);

    if (updateUserError) {
      console.error("Error updating user record:", updateUserError);
      return NextResponse.json(
        { success: false, error: updateUserError.message },
        { status: 500 },
      );
    }

    // Also add a record to coaches table if it doesn't exist
    const { data: existingCoach } = await supabase
      .from("coaches")
      .select("id")
      .eq("id", coachId)
      .single();

    if (!existingCoach) {
      const { error: coachInsertError } = await supabase
        .from("coaches")
        .insert({
          id: coachId,
          created_at: new Date().toISOString(),
        });

      if (coachInsertError) {
        console.error("Error creating coach record:", coachInsertError);
        // Continue anyway as the main approval is done
      }
    }

    // Also update auth.users directly
    try {
      // Get current user metadata first
      const { data: userData, error: getUserError } = await supabase.auth.admin.getUserById(coachId);
      
      if (!getUserError && userData && userData.user) {
        const currentAppMetadata = userData.user.app_metadata || {};
        const currentUserMetadata = userData.user.user_metadata || {};
        
        // Update both app_metadata and user_metadata to ensure approval is reflected
        const { error: updateUserError } = await supabase.auth.admin.updateUserById(
          coachId,
          {
            app_metadata: {
              ...currentAppMetadata,
              approved: true
            },
            user_metadata: {
              ...currentUserMetadata,
              approved: true
            }
          }
        );
        
        if (updateUserError) {
          console.error("Error updating auth user metadata:", updateUserError);
          // We still return success as the database update worked
        }
      }
    } catch (error) {
      console.error("Error updating auth user:", error);
      // Still return success as the database update worked
    }

    return NextResponse.json({ 
      success: true,
      message: "Coach approved successfully" 
    });
  } catch (error) {
    console.error("Error in approve-coach:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: `Server error: ${errorMessage}` },
      { status: 500 },
    );
  }
} 