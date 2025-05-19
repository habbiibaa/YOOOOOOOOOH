import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import fs from "fs";
import path from "path";

export async function POST() {
  try {
    const supabase = await createClient();

    // Verify admin user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (userError || userData?.role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can run migrations" },
        { status: 403 }
      );
    }

    // Migration files ordered by execution
    const migrationFiles = [
      "20240710000001_initial_schema.sql",
      "20240720000002_add_coach_data.sql",
      "20240901000001_add_branch_tables.sql",
      "20240910000001_add_coaches_and_schedules.sql",
      "20240930000002_update_coach_management.sql",
      "20240930000003_admin_user_management.sql",
      "20240930000004_regenerate_coach_sessions.sql",
    ];

    const migrationsDir = path.join(process.cwd(), "src", "utils", "supabase", "migrations");
    const results = [];

    for (const file of migrationFiles) {
      const filePath = path.join(migrationsDir, file);
      
      try {
        if (fs.existsSync(filePath)) {
          const sql = fs.readFileSync(filePath, "utf8");
          
          // Execute migration
          const { error } = await supabase.rpc("pgmigrate_sql", {
            sql_string: sql,
          });
          
          if (error) {
            results.push({
              file,
              success: false,
              error: error.message
            });
          } else {
            results.push({
              file,
              success: true
            });
          }
        } else {
          results.push({
            file,
            success: false,
            error: "File not found"
          });
        }
      } catch (fileError) {
        results.push({
          file,
          success: false,
          error: fileError instanceof Error ? fileError.message : String(fileError)
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    return NextResponse.json({
      success: true,
      message: `${successCount} migrations applied, ${failCount} failed`,
      details: results
    });
  } catch (error) {
    console.error("Error running migrations:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 