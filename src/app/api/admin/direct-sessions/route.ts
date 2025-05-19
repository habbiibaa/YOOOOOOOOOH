import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    // Get sessions data from request
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

    // Create server-side Supabase client with proper cookie handling
    const cookieStore = cookies();
    const supabase = createClient({ cookies: () => cookieStore });

    // Ensure each session has a day_of_week field
    const processedSessions = sessions.map(session => {
      // If day_of_week is missing, derive it from session_date
      if (!session.day_of_week && session.session_date) {
        const date = new Date(session.session_date);
        session.day_of_week = date.toLocaleDateString('en-US', { weekday: 'long' });
      }
      
      return session;
    });
    
    console.log("Processed session example:", processedSessions[0]);
    
    // This is a direct API endpoint that runs server-side with full permissions
    // and bypasses RLS policies - it allows admins to manage the system even if
    // their accounts are not fully approved yet
    
    try {
      // Try a simple query first to verify the Supabase client is working
      const { data: testData, error: testError } = await supabase
        .from("coach_sessions")
        .select("id")
        .limit(1);
        
      if (testError) {
        console.error("Error testing Supabase connection:", testError);
        return NextResponse.json({ 
          error: "Database connection error", 
          details: testError.message 
        }, { status: 500 });
      }
      
      console.log("Supabase connection test successful");
    } catch (connectionError) {
      console.error("Failed to connect to Supabase:", connectionError);
      return NextResponse.json({ 
        error: "Failed to connect to database", 
        details: connectionError instanceof Error ? connectionError.message : "Unknown error" 
      }, { status: 500 });
    }
    
    // Process sessions in smaller batches to avoid request size limits
    const batchSize = 10;
    const results = [];
    let insertedCount = 0;
    
    for (let i = 0; i < processedSessions.length; i += batchSize) {
      const batch = processedSessions.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i/batchSize) + 1} with ${batch.length} sessions`);
      
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
            sample: batch[0],
            inserted_count: insertedCount
          }, { status: 500 });
        }
        
        if (data) {
          results.push(...data);
          insertedCount += data.length;
        }
      } catch (batchError) {
        console.error("Error processing batch:", batchError);
        return NextResponse.json({ 
          error: batchError instanceof Error ? batchError.message : "Batch processing error",
          batch: batch[0],  // Include first item of problematic batch for debugging
          inserted_count: insertedCount
        }, { status: 500 });
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Created ${results.length} sessions`,
      count: results.length,
      admin_bypass: true
    });
  } catch (error) {
    console.error("Server error in direct-sessions:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Unknown server error" 
    }, { status: 500 });
  }
} 