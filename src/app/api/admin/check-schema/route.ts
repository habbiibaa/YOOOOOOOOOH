import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // Create server-side Supabase client with proper cookie handling
    const cookieStore = cookies();
    const supabase = createClient({ cookies: () => cookieStore });
    
    // Get information about coach_sessions table columns
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('get_table_columns', { table_name: 'coach_sessions' });
    
    if (tableError) {
      // Fallback method if RPC is not available
      const { data: sampleRecord, error: sampleError } = await supabase
        .from('coach_sessions')
        .select('*')
        .limit(1);
        
      if (sampleError) {
        return NextResponse.json({ 
          error: "Failed to get schema information",
          details: sampleError 
        }, { status: 500 });
      }
      
      // Return column names from a sample record
      return NextResponse.json({
        columns: sampleRecord && sampleRecord.length > 0 
          ? Object.keys(sampleRecord[0]) 
          : [],
        sample: sampleRecord && sampleRecord.length > 0 
          ? sampleRecord[0]
          : null
      });
    }
    
    return NextResponse.json({ columns: tableInfo });
  } catch (error) {
    return NextResponse.json({ 
      error: "Server error checking schema",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
} 