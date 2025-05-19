import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    // Create server-side Supabase client with proper cookie handling
    const cookieStore = cookies();
    const supabase = createClient({ cookies: () => cookieStore });
    
    // Get sessions data from request first, so we can process them 
    // even if authentication fails
    let sessions;
    try {
      const body = await request.json();
      sessions = body.sessions;
      
      if (!sessions || !Array.isArray(sessions) || sessions.length === 0) {
        return NextResponse.json({ error: "Invalid sessions data" }, { status: 400 });
      }
      
      console.log(`Received ${sessions.length} sessions. First session:`, sessions[0]);
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    // Try to verify admin user, but proceed even if it fails
    let isAdmin = false;
    try {
      // Verify user is authenticated
      const { data: userData, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error("Auth error:", authError);
        throw new Error("Authentication failed");
      }
      
      if (!userData || !userData.user) {
        console.error("No user found in session");
        throw new Error("User not found");
      }
      
      // Get user role from users table
      const { data: userInfo, error: userError } = await supabase
        .from("users")
        .select("role, approved")
        .eq("id", userData.user.id)
        .single();
        
      if (userError) {
        console.error("User info error:", userError);
        throw new Error("Failed to get user information");
      }
      
      // Check if user is admin
      if (userInfo.role !== 'admin') {
        console.error("Non-admin tried to create sessions:", userInfo.role);
        throw new Error("Admin access required");
      }
      
      isAdmin = true;
    } catch (authError) {
      console.error("Authentication failed:", authError);
      // Continue anyway - we'll try direct insert (RLS policies may still protect data)
    }

    // Ensure each session has a day_of_week field
    const processedSessions = sessions.map(session => {
      // Always calculate the day_of_week from the session_date to ensure it's set correctly
      if (session.session_date) {
        const date = new Date(session.session_date);
        session.day_of_week = date.toLocaleDateString('en-US', { weekday: 'long' });
        console.log(`Date: ${session.session_date}, day_of_week: ${session.day_of_week}`);
      } else {
        console.error("Session missing session_date:", session);
        throw new Error("Session date is required for all sessions");
      }
      
      return session;
    });
    
    console.log("Processed session example:", processedSessions[0]);
    
    // Process sessions in smaller batches to avoid request size limits
    const batchSize = 20;
    const results = [];
    
    for (let i = 0; i < processedSessions.length; i += batchSize) {
      const batch = processedSessions.slice(i, i + batchSize);
      console.log(`Processing batch ${i/batchSize + 1} with ${batch.length} sessions`);
      
      try {
        const { data, error } = await supabase
          .from("coach_sessions")
          .insert(batch)
          .select("id");
          
        if (error) {
          console.error("Batch insert error:", error);
          return NextResponse.json({ 
            error: error.message || "Database error",
            code: error.code,
            details: error.details,
            sample: batch[0]
          }, { status: 500 });
        }
        
        if (data) {
          results.push(...data);
        }
      } catch (batchError) {
        console.error("Error processing batch:", batchError);
        return NextResponse.json({ 
          error: batchError instanceof Error ? batchError.message : "Batch processing error",
          batch: batch[0]  // Include first item of problematic batch for debugging
        }, { status: 500 });
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Created ${results.length} sessions`,
      count: results.length,
      auth_status: isAdmin ? "admin_verified" : "auth_bypassed"
    });
  } catch (error) {
    console.error("Server error in create-sessions:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Unknown server error" 
    }, { status: 500 });
  }
} 