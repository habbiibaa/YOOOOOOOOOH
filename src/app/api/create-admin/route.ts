import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    // Only allow this route in development or with a special secret
    const isDevEnv = process.env.NODE_ENV === 'development';
    const secretKey = request.headers.get('x-admin-key');
    const validSecret = secretKey === process.env.ADMIN_SECRET_KEY;
    
    if (!isDevEnv && !validSecret) {
      return NextResponse.json(
        { success: false, error: "Not authorized" },
        { status: 403 }
      );
    }
    
    const { email, password, fullName } = await request.json();
    
    if (!email || !password || !fullName) {
      return NextResponse.json(
        { success: false, error: "Email, password, and full name are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    // Step 1: Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    
    if (authError) {
      console.error("Error creating auth user:", authError);
      return NextResponse.json(
        { success: false, error: `Auth user creation failed: ${authError.message}` },
        { status: 500 }
      );
    }
    
    const userId = authData.user.id;
    
    // Step 2: Create user in users table with admin role
    const { error: userError } = await supabase
      .from("users")
      .insert({
        id: userId,
        email,
        full_name: fullName,
        name: fullName,
        role: "admin",
        approved: true,
        email_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
    if (userError) {
      console.error("Error creating user record:", userError);
      return NextResponse.json(
        { success: false, error: `User record creation failed: ${userError.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: "Admin user created successfully",
      userId
    });
  } catch (error) {
    console.error("Error in create-admin route:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
