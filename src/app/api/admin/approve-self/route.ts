import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    // Create server-side client
    const supabase = await createClient();
    
    // Get current user
    let userData;
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Auth error:", error);
        return NextResponse.json({ error: "Authentication failed: " + error.message }, { status: 401 });
      }
      userData = data;
    } catch (authError) {
      console.error("Auth exception:", authError);
      return NextResponse.json({ 
        error: "Authentication error: " + (authError instanceof Error ? authError.message : "Unknown error") 
      }, { status: 401 });
    }
    
    if (!userData?.user) {
      console.error("No user found in session");
      return NextResponse.json({ error: "User not found in session" }, { status: 401 });
    }
    
    const userId = userData.user.id;
    
    // Get user role
    try {
      const { data: userInfo, error: userError } = await supabase
        .from("users")
        .select("role, approved")
        .eq("id", userId)
        .single();
        
      if (userError) {
        console.error("User info error:", userError);
        return NextResponse.json({ error: "Failed to get user information: " + userError.message }, { status: 500 });
      }
      
      // Check if user is admin
      if (userInfo.role !== 'admin') {
        return NextResponse.json({ error: "Only administrators can approve accounts" }, { status: 403 });
      }
      
      // Update the approved status to true
      const { data, error: updateError } = await supabase
        .from("users")
        .update({ approved: true })
        .eq("id", userId)
        .select();
        
      if (updateError) {
        console.error("Update error:", updateError);
        return NextResponse.json({ error: "Failed to update approval status: " + updateError.message }, { status: 500 });
      }
      
      console.log("Self-approved admin:", userId);
      
      return NextResponse.json({ 
        success: true, 
        message: "Your admin account has been approved", 
        user: data?.[0] 
      });
    } catch (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json({ 
        error: "Database error: " + (dbError instanceof Error ? dbError.message : "Unknown error") 
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Server error in approve-self:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Unknown server error" 
    }, { status: 500 });
  }
} 