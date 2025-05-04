import { createClient } from "../../../utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Create admin account with regular signup instead of admin API
    const { data: adminData, error: adminError } = await supabase.auth.signUp({
      email: "admin@squashacademy.com",
      password: "Admin123!",
      options: {
        data: {
          full_name: "Admin User",
          role: "admin",
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/verify`,
      },
    });

    if (adminError) {
      console.error("Admin creation error:", adminError);
      // If user already exists, try to update instead
      if (adminError.message.includes("already exists")) {
        const { data: existingUser } = await supabase
          .from("users")
          .select("id")
          .eq("email", "admin@squashacademy.com")
          .single();

        if (existingUser) {
          await supabase
            .from("users")
            .update({
              role: "admin",
              full_name: "Admin User",
              name: "Admin User",
            })
            .eq("id", existingUser.id);
        }
      } else {
        throw adminError;
      }
    } else if (adminData.user) {
      // Update admin role in users table
      await supabase.from("users").upsert({
        id: adminData.user.id,
        email: "admin@squashacademy.com",
        full_name: "Admin User",
        name: "Admin User",
        role: "admin",
        user_id: adminData.user.id,
        token_identifier: adminData.user.id,
        created_at: new Date().toISOString(),
      });
    }

    // Create coach account
    const { data: coachData, error: coachError } = await supabase.auth.signUp({
      email: "coach@squashacademy.com",
      password: "Coach123!",
      options: {
        data: {
          full_name: "Coach User",
          role: "coach",
        },
      },
    });

    if (coachError) {
      console.error("Coach creation error:", coachError);
      // If user already exists, try to update instead
      if (coachError.message.includes("already exists")) {
        const { data: existingUser } = await supabase
          .from("users")
          .select("id")
          .eq("email", "coach@squashacademy.com")
          .single();

        if (existingUser) {
          await supabase
            .from("users")
            .update({
              role: "coach",
              full_name: "Coach User",
              name: "Coach User",
            })
            .eq("id", existingUser.id);

          // Check if coach details exist
          const { data: existingCoach } = await supabase
            .from("coaches")
            .select("id")
            .eq("id", existingUser.id)
            .single();

          if (!existingCoach) {
            await supabase.from("coaches").insert({
              id: existingUser.id,
              bio: "Professional squash coach with international experience",
              specialization: "Technical skills and match strategy",
              years_experience: 8,
              hourly_rate: 75.0,
              availability: JSON.stringify({
                monday: ["9:00-12:00", "14:00-18:00"],
                tuesday: ["9:00-12:00", "14:00-18:00"],
                wednesday: ["9:00-12:00", "14:00-18:00"],
                thursday: ["9:00-12:00", "14:00-18:00"],
                friday: ["9:00-12:00", "14:00-18:00"],
              }),
            });
          }
        }
      } else {
        throw coachError;
      }
    } else if (coachData.user) {
      // Update coach role in users table
      await supabase.from("users").upsert({
        id: coachData.user.id,
        email: "coach@squashacademy.com",
        full_name: "Coach User",
        name: "Coach User",
        role: "coach",
        user_id: coachData.user.id,
        token_identifier: coachData.user.id,
        created_at: new Date().toISOString(),
      });

      // Add coach details
      await supabase.from("coaches").upsert({
        id: coachData.user.id,
        bio: "Professional squash coach with international experience",
        specialization: "Technical skills and match strategy",
        years_experience: 8,
        hourly_rate: 75.0,
        availability: JSON.stringify({
          monday: ["9:00-12:00", "14:00-18:00"],
          tuesday: ["9:00-12:00", "14:00-18:00"],
          wednesday: ["9:00-12:00", "14:00-18:00"],
          thursday: ["9:00-12:00", "14:00-18:00"],
          friday: ["9:00-12:00", "14:00-18:00"],
        }),
      });
    }

    // Create player account
    const { data: playerData, error: playerError } = await supabase.auth.signUp(
      {
        email: "player@squashacademy.com",
        password: "Player123!",
        options: {
          data: {
            full_name: "Player User",
            role: "player",
          },
        },
      },
    );

    if (playerError) {
      console.error("Player creation error:", playerError);
      // If user already exists, try to update instead
      if (playerError.message.includes("already exists")) {
        const { data: existingUser } = await supabase
          .from("users")
          .select("id")
          .eq("email", "player@squashacademy.com")
          .single();

        if (existingUser) {
          await supabase
            .from("users")
            .update({
              role: "player",
              full_name: "Player User",
              name: "Player User",
            })
            .eq("id", existingUser.id);

          // Check if player details exist
          const { data: existingPlayer } = await supabase
            .from("players")
            .select("id")
            .eq("id", existingUser.id)
            .single();

          if (!existingPlayer) {
            await supabase.from("players").insert({
              id: existingUser.id,
              skill_level: "Intermediate",
              years_playing: 3,
              goals: "Improve technique and compete in local tournaments",
            });
          }
        }
      } else {
        throw playerError;
      }
    } else if (playerData.user) {
      // Update player role in users table
      await supabase.from("users").upsert({
        id: playerData.user.id,
        email: "player@squashacademy.com",
        full_name: "Player User",
        name: "Player User",
        role: "player",
        user_id: playerData.user.id,
        token_identifier: playerData.user.id,
        created_at: new Date().toISOString(),
      });

      // Add player details
      await supabase.from("players").upsert({
        id: playerData.user.id,
        skill_level: "Intermediate",
        years_playing: 3,
        goals: "Improve technique and compete in local tournaments",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Test accounts created or updated successfully",
      accounts: {
        admin: { email: "admin@squashacademy.com", password: "Admin123!" },
        coach: { email: "coach@squashacademy.com", password: "Coach123!" },
        player: { email: "player@squashacademy.com", password: "Player123!" },
      },
    });
  } catch (error) {
    console.error("Error creating test accounts:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
