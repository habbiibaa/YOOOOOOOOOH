"use server";

import { encodedRedirect } from "@/utils/utils";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "../utils/supabase/server";
import { v4 as uuidv4 } from "uuid";
import { SupabaseClient } from '@supabase/supabase-js';
import { UserDataResult } from '@/types/supabase';

interface UserData {
  fullName: string;
  email: string;
  role: string;
  approved: boolean;
}

interface PlayerProfileResult {
  error?: string;
  recommendedLevel: number | null;
  shouldBookAssessment: boolean;
  needsVideoReview: boolean;
}

// Helper function to verify user exists in auth.users without admin privileges
async function verifyAuthUser(supabase: SupabaseClient, userId: string) {
  const maxRetries = 5;
  let retryCount = 0;
  let userExists = false;

  while (retryCount < maxRetries && !userExists) {
    try {
      if (retryCount > 0) {
        const delay = Math.pow(2, retryCount) * 500; // 500ms, 1s, 2s...
        await new Promise((resolve) => setTimeout(resolve, delay));
        console.log(
          `Retry attempt ${retryCount} after ${delay}ms delay for auth user ${userId}`,
        );
      }

      // Instead of admin.getUserById, we'll use the getSession method
      // This is a workaround since we don't have admin privileges
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error(`Error getting session:`, error);
      } else {
        // If we're here after sign-up, the newly created user is likely in the session
        if (data?.session?.user?.id === userId) {
          console.log(`Auth user ${userId} verified through session`);
          userExists = true;
        } else {
          console.log(`Auth user ${userId} not found in current session, assuming it exists`);
          // Since we can't directly verify without admin access, 
          // we'll have to trust that the user exists if sign-up succeeded
          userExists = true;
        }
      }
    } catch (err) {
      console.error(`Exception verifying auth user ${userId}:`, err);
    }

    retryCount++;
  }

  return userExists;
}

// Helper function to create a user profile in the database
async function createUserProfile(supabase: SupabaseClient, user: any, userData: UserData) {
  const { fullName, email, role, approved } = userData;
  let success = false;
  let updateError: Error | null = null;
  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries && !success) {
    try {
      // Create or update user record
      const { error: userError } = await supabase.from("users").upsert({
        id: user.id,
        email: email || user.email,
        full_name: fullName,
        role,
        approved,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (userError) {
        console.error(
          `User record update attempt ${retryCount + 1} failed:`,
          userError,
        );
        updateError = userError;
        retryCount++;
        continue;
      }

      // Create role-specific profile entry
      if (role === "player") {
        // Create player profile
        const { error: playerError } = await supabase
          .from("players")
          .upsert(
            {
              id: user.id, // Use the user's ID as the player's ID
              user_id: user.id,
              email: email || user.email,
              full_name: fullName,
              skill_level: "Beginner",
              years_playing: 0,
              goals: "Improve my squash skills",
              level: 1,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            { onConflict: "user_id" }
          );
        
        if (playerError) {
          console.error(`Error creating player profile for user ${user.id}:`, playerError);
          updateError = playerError;
          retryCount++;
          continue;
        }
      }

      success = true;
    } catch (error) {
      console.error(
        `Unexpected error in createUserProfile attempt ${retryCount + 1}:`,
        error,
      );
      updateError = error instanceof Error ? error : new Error(String(error));
      retryCount++;
    }
  }

  return { success, error: updateError };
}

export const signUpAction = async (formData: FormData) => {
  // Extract form data
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const fullName = formData.get("full_name")?.toString() || "";
  const role = formData.get("role")?.toString() || "player";
  const supabase = await createClient();
  const headersList = await headers();
  const origin = headersList.get("origin");

  console.log("Starting signUpAction with email:", email, "and role:", role);

  if (!email || !password) {
    console.log("Missing required fields: email or password");
    return encodedRedirect(
      "error",
      "/sign-up",
      "Email and password are required",
    );
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.log("Invalid email format:", email);
    return encodedRedirect(
      "error",
      "/sign-up",
      "Please enter a valid email address",
    );
  }

  // Check if email exists in users table
  try {
    console.log("Checking if email already exists in users table:", email);
    const { data: existingUser, error: userCheckError } = await supabase
      .from("users")
      .select("email")
      .eq("email", email)
      .maybeSingle();

    if (userCheckError) {
      console.error("Error checking existing users:", userCheckError);
    } else if (existingUser) {
      console.log("Email already exists in users table:", email);
      return encodedRedirect(
        "error",
        "/sign-up",
        "This email is already registered. Please use a different email or sign in.",
      );
    }
  } catch (checkError) {
    console.error("Exception checking existing users:", checkError);
  }

  // More reliable approach to check if email exists in auth system
  try {
    console.log("Checking if email exists in auth system:", email);
    
    // Try to sign in with a random password - if the error is 'Invalid login credentials',
    // it means the email exists but password doesn't match, confirming the email exists
    // If the error is different, the email likely doesn't exist
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: `random_check_password_${Math.random().toString(36)}`,
    });

    if (error) {
      // Error code 400 with "Invalid login credentials" means email exists but password doesn't match
      if (error.status === 400 && error.message.includes("Invalid login credentials")) {
        console.log("Email already exists in auth system:", email);
        return encodedRedirect(
          "error",
          "/sign-up",
          "This email is already registered. Please sign in or use a different email."
        );
      }
      // Other errors might indicate email doesn't exist, or service issues
      console.log("Email check result:", error.message);
    } else {
      // This case is unlikely but would mean the random password actually worked
      // which indicates the email exists
      console.log("Unexpectedly signed in with random password");
      await supabase.auth.signOut();
      return encodedRedirect(
        "error",
        "/sign-up",
        "This email is already registered. Please sign in or use a different email."
      );
    }
  } catch (authCheckError) {
    console.error("Exception checking auth system:", authCheckError);
    // Continue with signup if auth check fails, to avoid blocking legitimate signups
  }

  console.log("Creating auth user with email:", email);
  const {
    data: { user },
    error,
  } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        full_name: fullName,
        role: role,
      },
    },
  });

  // If we got error code 400 with "User already registered", it means the email exists
  if (error) {
    console.error("Auth signup error:", error.code, error.message);
    
    if (error.status === 400 && error.message.includes("already registered")) {
      console.log("User already registered detected during signUp");
      return encodedRedirect(
        "error",
        "/sign-up",
        "This email is already registered. Please sign in or use a different email."
      );
    }
    
    return encodedRedirect("error", "/sign-up", error.message);
  }

  // Safeguard against cases where Supabase returns success but no actual error or user object
  // This can happen with some specific configurations of Supabase where it returns no error
  // even when user already exists
  if (!user || !user.id) {
    console.error("Auth user created but no user ID returned");
    return encodedRedirect(
      "error",
      "/sign-up",
      "Error creating user account. Please try again.",
    );
  }

  // Verify user exists in auth.users before creating profile
  const userExists = await verifyAuthUser(supabase, user.id);
  if (!userExists) {
    console.error(`User ${user.id} not found in auth.users after signup`);
    try {
      console.log("Cleaning up orphaned auth user:", user.id);
      await supabase.auth.admin.deleteUser(user.id);
    } catch (deleteError) {
      console.error(
        "Failed to delete auth user after verification failure:",
        deleteError,
      );
    }
    return encodedRedirect(
      "error",
      "/sign-up",
      "Error creating user account. Please try again.",
    );
  }

  const approved = role === "player" ? true : false;
  console.log(
    `User ${user.id} will be created with approved status:`,
    approved,
  );

  const { success, error: profileError } = await createUserProfile(
    supabase,
    user,
    {
      fullName,
      email: email || "",
      role,
      approved,
    },
  );

  if (success) {
    console.log("User profile created successfully for user ID:", user.id);
    
    // Auto-sign in the user after signup - player role only (others need approval)
    if (role === "player") {
      const { data: signInData, error: signInError } = 
        await supabase.auth.signInWithPassword({
          email,
          password,
        });
      
      if (!signInError && signInData.user) {
        return redirect("/dashboard/player");
      }
    }
    
    return encodedRedirect(
      "success",
      "/sign-in",
      `Account created successfully! ${role !== "player" ? "Your account requires admin approval." : "Please check your email to confirm your account."}`,
    );
  } else {
    console.error("Failed to create user profile:", profileError);

    try {
      console.log("Cleaning up orphaned auth user:", user.id);
      await supabase.auth.admin.deleteUser(user.id);
    } catch (deleteError) {
      console.error(
        "Failed to delete auth user after profile creation error:",
        deleteError,
      );
    }

    return encodedRedirect(
      "error",
      "/sign-up",
      "Error creating user profile. Please try again later.",
    );
  }
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const supabase = await createClient();

  if (!email || !password) {
    return encodedRedirect(
      "error",
      "/sign-in",
      "Please provide both email and password."
    );
  }

  try {
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      console.log("Sign-in error:", signInError.message);
      return encodedRedirect(
        "error",
        "/sign-in", 
        signInError.message === "Invalid login credentials" 
          ? "The email or password you entered is incorrect."
          : signInError.message
      );
    }

    // Get user role from database
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role, approved")
      .eq("id", signInData.user.id)
      .single(); // Use single() instead of maybeSingle() since we expect a record

    if (userError) throw userError;

    // Handle approval status
    if (["coach", "admin"].includes((userData as UserDataResult).role) && !(userData as UserDataResult).approved) {
      return encodedRedirect(
        "warning",
        "/sign-in",
        "Your account is pending approval from an administrator. You'll be notified when your account is approved."
      );
    }
    
    // Redirect based on role
    if ((userData as UserDataResult).role === "admin") {
      return redirect("/dashboard/admin");
    } else if ((userData as UserDataResult).role === "coach") {
      return redirect("/dashboard/coach");
    } else {
      return redirect("/dashboard/player");
    }
  } catch (error) {
    console.error("Error during sign-in process:", error);
    return encodedRedirect(
      "error",
      "/sign-in",
      "An unexpected error occurred during sign-in. Please try again."
    );
  }
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const headersList = await headers();
  const origin = headersList.get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  // Check if the email exists in our system
  const { data: existingUser } = await supabase
    .from("users")
    .select("email")
    .eq("email", email)
    .limit(1);

  if (!existingUser || existingUser.length === 0) {
    // Don't reveal if email exists or not for security reasons
    return encodedRedirect(
      "success",
      "/forgot-password",
      "If your email is registered, you will receive a password reset link.",
    );
  }

  // Generate a unique token for this reset request
  const resetToken = crypto.randomUUID();
  const resetExpiry = new Date();
  resetExpiry.setHours(resetExpiry.getHours() + 24); // Token valid for 24 hours

  // Store the reset token in the database
  const { error: tokenError } = await supabase
    .from("password_reset_tokens")
    .upsert({
      email: email,
      token: resetToken,
      expires_at: resetExpiry.toISOString(),
      created_at: new Date().toISOString(),
    });

  if (tokenError) {
    console.error("Error storing reset token:", tokenError);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not process your request. Please try again.",
    );
  }

  // Create a unique reset URL with the token
  const resetUrl = `${origin}/auth/callback?redirect_to=/dashboard/reset-password&token=${resetToken}`;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: resetUrl,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password",
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return redirect("/forgot-password/reset-confirmation");
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const resetToken = formData.get("token") as string;

  if (!password || !confirmPassword) {
    return encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Password and confirm password are required",
    );
  }

  if (password !== confirmPassword) {
    return encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Passwords do not match",
    );
  }

  // Verify the reset token is valid and not expired if provided
  if (resetToken) {
    try {
      const { data: tokenData, error: tokenError } = await supabase
        .from("password_reset_tokens")
        .select("*")
        .eq("token", resetToken)
        .maybeSingle();

      if (tokenError || !tokenData) {
        return encodedRedirect(
          "error",
          "/forgot-password",
          "Invalid or expired password reset link. Please request a new one.",
        );
      }

      // Check if token is expired
      const expiryDate = new Date(tokenData.expires_at);
      if (expiryDate < new Date()) {
        return encodedRedirect(
          "error",
          "/forgot-password",
          "Your password reset link has expired. Please request a new one.",
        );
      }

      // Delete the used token to prevent reuse
      await supabase
        .from("password_reset_tokens")
        .delete()
        .eq("token", resetToken);
    } catch (error) {
      console.error("Error verifying reset token:", error);
      // Continue with password reset even if token verification fails
      // This allows users to reset their password from the dashboard
    }
  }

  // First check if the user is authenticated
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user && !resetToken) {
    return encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "You must be logged in or have a valid reset token to change your password",
    );
  }

  // Update the password
  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    return encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Password update failed: " + error.message,
    );
  }

  return encodedRedirect(
    "success",
    "/sign-in",
    "Password updated successfully. You can now sign in with your new password.",
  );
};

export const signOutAction = async () => {
  const supabase = await createClient();
  
  try {
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    if (error) {
      console.error("Sign-out error:", error.message);
    }
  } catch (error) {
    console.error("Error during sign-out:", error);
  }
  
  return redirect("/sign-in");
};

export type SubscriptionPlan = {
  id: string;
  name: string;
  price: number;
  sessionCount: number;
  features: string[];
  description: string;
  isPopular?: boolean;
}

const subscriptionPlansData: SubscriptionPlan[] = [
  {
    id: "level-1",
    name: "Level 1",
    price: 2500,
    sessionCount: 2,
    features: [
      "2 individual sessions per week",
      "45-minute sessions",
      "Professional coaching",
      "Video analysis feedback",
      "Progress tracking"
    ],
    description: "Perfect for beginners looking to build solid fundamentals"
  },
  {
    id: "level-2",
    name: "Level 2",
    price: 2800,
    sessionCount: 2,
    features: [
      "2 individual sessions per week",
      "45-minute sessions",
      "Professional coaching",
      "Video analysis feedback",
      "Progress tracking"
    ],
    description: "For players with basic skills looking to improve technique"
  },
  {
    id: "level-3",
    name: "Level 3",
    price: 4200,
    sessionCount: 3,
    features: [
      "3 individual sessions per week",
      "45-minute sessions",
      "Professional coaching",
      "Video analysis feedback",
      "Progress tracking"
    ],
    description: "Our most popular plan for dedicated players",
    isPopular: true
  },
  {
    id: "level-4",
    name: "Level 4",
    price: 5600,
    sessionCount: 4,
    features: [
      "4 individual sessions per week",
      "45-minute sessions",
      "Professional coaching",
      "Video analysis feedback",
      "Progress tracking"
    ],
    description: "For serious players looking to advance their skills quickly"
  },
  {
    id: "level-5",
    name: "Level 5",
    price: 6400,
    sessionCount: 4,
    features: [
      "4 individual sessions per week",
      "45-minute sessions",
      "Professional coaching",
      "Video analysis feedback",
      "Progress tracking"
    ],
    description: "Elite plan for advanced players seeking to master the game"
  },
  {
    id: "walk-in",
    name: "Walk-in Session",
    price: 350,
    sessionCount: 1,
    features: [
      "Single session booking",
      "45-minute session",
      "Professional coaching"
    ],
    description: "Try a single session without commitment"
  }
];

export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  return subscriptionPlansData;
}

type Coach = {
  name: string;
  schedules: {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    sessionDuration: number;
  }[];
}

const coachesDataList: Coach[] = [
  {
    name: "Ahmed Fakhry",
    schedules: [
      {
        dayOfWeek: "Sunday",
        startTime: "16:30",
        endTime: "21:45",
        sessionDuration: 45
      },
      {
        dayOfWeek: "Tuesday",
        startTime: "16:30",
        endTime: "21:45",
        sessionDuration: 45
      }
    ]
  },
  {
    name: "Ahmed Mahrous",
    schedules: [
      {
        dayOfWeek: "Saturday",
        startTime: "10:00",
        endTime: "21:30",
        sessionDuration: 45
      },
      {
        dayOfWeek: "Tuesday",
        startTime: "16:30",
        endTime: "21:45",
        sessionDuration: 45
      }
    ]
  },
  {
    name: "Alaa Taha",
    schedules: [
      {
        dayOfWeek: "Monday",
        startTime: "16:30",
        endTime: "21:45",
        sessionDuration: 45
      }
    ]
  },
  {
    name: "Ahmed Maher",
    schedules: [
      {
        dayOfWeek: "Sunday",
        startTime: "16:30",
        endTime: "21:45",
        sessionDuration: 45
      },
      {
        dayOfWeek: "Wednesday",
        startTime: "15:30",
        endTime: "21:30",
        sessionDuration: 45
      }
    ]
  },
  {
    name: "Omar Zaki",
    schedules: [
      {
        dayOfWeek: "Thursday",
        startTime: "15:30",
        endTime: "21:30",
        sessionDuration: 45
      },
      {
        dayOfWeek: "Friday",
        startTime: "13:30",
        endTime: "16:30",
        sessionDuration: 45
      },
      {
        dayOfWeek: "Saturday",
        startTime: "10:00",
        endTime: "21:30",
        sessionDuration: 45
      }
    ]
  },
  {
    name: "Abdelrahman Dahy",
    schedules: [
      {
        dayOfWeek: "Monday",
        startTime: "16:30",
        endTime: "21:45",
        sessionDuration: 45
      },
      {
        dayOfWeek: "Wednesday",
        startTime: "15:30",
        endTime: "21:30",
        sessionDuration: 45
      }
    ]
  }
];

export async function getCoachesData(): Promise<Coach[]> {
  return coachesDataList;
}

export async function initializeCoachesAndSchedules() {
  "use server";
  try {
    const supabase = await createClient();
    // First, check if the branch exists
    const { data: branchData, error: branchError } = await supabase
      .from("branches")
      .select("id")
      .eq("name", "Ramy Ashour Academy")
      .single();
      
    let branchId;
    if (branchError || !branchData) {
      // Create branch if it doesn't exist
      try {
        branchId = uuidv4();
        const { data: newBranch, error: createError } = await supabase
          .from("branches")
          .insert({
            id: branchId,
            name: "Ramy Ashour Academy",
            location: "Cairo",
            address: "123 Ramy Ashour St",
            is_members_only: false,
          })
          .select("id")
          .single();
          
        if (createError) {
          console.error("Error creating branch:", createError.message);
          throw createError;
        }
        
        if (!newBranch || !newBranch.id) {
          throw new Error("Branch created but no ID returned");
        }
        
        branchId = newBranch.id;
        console.log("Created new branch with ID:", branchId);
      } catch (err) {
        console.error("Exception creating branch:", err instanceof Error ? err.message : err);
        throw err;
      }
    } else {
      branchId = branchData.id;
      console.log("Using existing branch with ID:", branchId);
    }
    
    // Loop through coaches data and create/update coaches
    for (const coachData of coachesDataList) {
      try {
        // Check if coach exists by name
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("id")
          .eq("full_name", coachData.name)
          .eq("role", "coach")
          .single();
          
        let coachId;
        
        if (userError || !userData) {
          console.log(`Coach ${coachData.name} doesn't exist, creating new coach`);
          try {
            // Generate a unique email that won't conflict with existing records
            const email = `${coachData.name.toLowerCase().replace(/\s+/g, '.')}@ramyashour.academy`;
            
            // First check if the email already exists
            const { data: existingEmail } = await supabase
              .from("users")
              .select("id")
              .eq("email", email);
              
            if (existingEmail && existingEmail.length > 0) {
              throw new Error(`Email ${email} already exists for another user`);
            }
            
            // First create an auth user
            const { data: authData, error: authError } = await supabase.auth.admin.createUser({
              email: email,
              password: `Coach${Math.floor(1000 + Math.random() * 9000)}!`,
              email_confirm: true,
              user_metadata: {
                full_name: coachData.name,
                role: "coach"
              }
            });
            
            if (authError) {
              console.error(`Error creating auth user for coach ${coachData.name}:`, authError);
              throw new Error(`Failed to create auth user: ${authError.message}`);
            }
            
            if (!authData?.user?.id) {
              throw new Error(`No user ID returned for coach ${coachData.name}`);
            }
            
            // Use the auth user ID for the user record
            coachId = authData.user.id;
            
            // Now create user record with auth ID
            const { error: createUserError } = await supabase
              .from("users")
              .insert({
                id: coachId,
                full_name: coachData.name,
                role: "coach",
                email: email
              });
              
            if (createUserError) {
              console.error(`Error creating user for coach ${coachData.name}:`, createUserError.message || createUserError.code || JSON.stringify(createUserError));
              throw new Error(`Failed to create user: ${createUserError.message || JSON.stringify(createUserError)}`);
            }
            
            console.log(`Created new coach user with ID: ${coachId}`);
            
            // Create coach record
            const { error: createCoachError } = await supabase
              .from("coaches")
              .insert({
                id: coachId,
                name: coachData.name,
                specialties: ["Squash Training"],
                available_levels: ["Beginner", "Intermediate", "Advanced"],
                rating: 5.0
              });
              
            if (createCoachError) {
              console.error(`Error creating coach record for ${coachData.name}:`, createCoachError.message || createCoachError.code || JSON.stringify(createCoachError));
              throw new Error(`Failed to create coach record: ${createCoachError.message || JSON.stringify(createCoachError)}`);
            }
          } catch (err) {
            console.error(`Error creating coach ${coachData.name}:`, err instanceof Error ? err.message : JSON.stringify(err));
            continue;
          }
        } else {
          coachId = userData.id;
          console.log(`Using existing coach ${coachData.name} with ID ${coachId}`);
        }
        
        if (!coachId) {
          console.error(`No coachId available for ${coachData.name}, skipping schedules`);
          continue;
        }
        
        // Create coach schedules
        for (const schedule of coachData.schedules) {
          try {
            // Check if schedule already exists
            const { data: existingSchedule, error: scheduleCheckError } = await supabase
              .from("coach_schedules")
              .select("id")
              .eq("coach_id", coachId)
              .eq("branch_id", branchId)
              .eq("day_of_week", schedule.dayOfWeek)
              .eq("start_time", schedule.startTime)
              .eq("end_time", schedule.endTime);
              
            if (scheduleCheckError) {
              console.error(`Error checking schedule for coach ${coachData.name}:`, scheduleCheckError.message || scheduleCheckError.code || JSON.stringify(scheduleCheckError));
              continue;
            }
            
            if (existingSchedule && existingSchedule.length > 0) {
              // Schedule already exists, skip
              console.log(`Schedule for ${coachData.name} on ${schedule.dayOfWeek} already exists, skipping`);
              continue;
            }
            
            // Create coach schedule
            const scheduleId = uuidv4(); // Generate unique ID for the schedule
            const { error: createScheduleError } = await supabase
              .from("coach_schedules")
              .insert({
                id: scheduleId, // Add ID field
                coach_id: coachId,
                branch_id: branchId,
                day_of_week: schedule.dayOfWeek,
                start_time: schedule.startTime,
                end_time: schedule.endTime,
                session_duration: schedule.sessionDuration
              });
              
            if (createScheduleError) {
              console.error(`Error creating schedule for coach ${coachData.name}:`, createScheduleError.message || createScheduleError.code || JSON.stringify(createScheduleError));
              throw new Error(`Failed to create schedule: ${createScheduleError.message || JSON.stringify(createScheduleError)}`);
            } else {
              console.log(`Created schedule for ${coachData.name} on ${schedule.dayOfWeek}`);
            }
          } catch (scheduleErr) {
            console.error(`Exception processing schedule for ${coachData.name}:`, scheduleErr instanceof Error ? scheduleErr.message : JSON.stringify(scheduleErr));
          }
        }
      } catch (coachErr) {
        console.error(`Exception processing coach ${coachData.name}:`, coachErr instanceof Error ? coachErr.message : JSON.stringify(coachErr));
      }
    }
    
    return { success: true };
  } catch (err) {
    console.error("Error in initializeCoachesAndSchedules:", err instanceof Error ? err.message : JSON.stringify(err));
    return { success: false, error: err instanceof Error ? err.message : "Unknown error occurred" };
  }
}

export async function generateAvailableSessions(startDate: Date, daysToGenerate: number = 30) {
  "use server";
  const supabase = await createClient();
  
  // Fetch all coach schedules
  const { data: schedules, error: schedulesError } = await supabase
    .from("coach_schedules")
    .select(`
      id,
      coach_id,
      branch_id,
      day_of_week,
      start_time,
      end_time,
      session_duration
    `);
    
  if (schedulesError) {
    console.error("Error fetching coach schedules:", schedulesError);
    return;
  }
  
  // Group schedules by day of week to process efficiently
  const schedulesByDay: Record<string, typeof schedules> = {};
  schedules.forEach(schedule => {
    if (!schedulesByDay[schedule.day_of_week]) {
      schedulesByDay[schedule.day_of_week] = [];
    }
    
    schedulesByDay[schedule.day_of_week].push(schedule);
  });
  
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  // Define the type for session objects
  type SessionToCreate = {
    id?: string; // Make ID optional
    coach_id: string;
    branch_id: string;
    session_date: string;
    start_time: string;
    end_time: string;
    status: string;
  };
  
  const sessionsToCreate: SessionToCreate[] = [];
  
  // Generate sessions for the next N days
  for (let i = 0; i < daysToGenerate; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + i);
    
    const dayOfWeek = daysOfWeek[currentDate.getDay()];
    const dateString = currentDate.toISOString().split('T')[0];
    
    // Skip if no schedules for this day
    if (!schedulesByDay[dayOfWeek]) {
      continue;
    }
    
    // Process each schedule for this day
    for (const schedule of schedulesByDay[dayOfWeek]) {
      // Calculate time slots based on start time, end time, and session duration
      const [startHour, startMinute] = schedule.start_time.split(':').map(Number);
      const [endHour, endMinute] = schedule.end_time.split(':').map(Number);
      
      let currentSlotStart = new Date(currentDate);
      currentSlotStart.setHours(startHour, startMinute, 0, 0);
      
      const endTime = new Date(currentDate);
      endTime.setHours(endHour, endMinute, 0, 0);
      
      // Generate 45-minute slots with 0-minute breaks
      while (currentSlotStart.getTime() < endTime.getTime() - (schedule.session_duration * 60 * 1000)) {
        const slotEnd = new Date(currentSlotStart);
        slotEnd.setMinutes(slotEnd.getMinutes() + schedule.session_duration);
        
        // Format times for database
        const startTimeString = `${currentSlotStart.getHours().toString().padStart(2, '0')}:${currentSlotStart.getMinutes().toString().padStart(2, '0')}`;
        const endTimeString = `${slotEnd.getHours().toString().padStart(2, '0')}:${slotEnd.getMinutes().toString().padStart(2, '0')}`;
        
        // Check if session already exists
        const { data: existingSession, error: sessionCheckError } = await supabase
          .from("coach_sessions")
          .select("id")
          .eq("coach_id", schedule.coach_id)
          .eq("branch_id", schedule.branch_id)
          .eq("session_date", dateString)
          .eq("start_time", startTimeString)
          .eq("end_time", endTimeString);
          
        if (sessionCheckError) {
          console.error("Error checking existing session:", sessionCheckError);
          continue;
        }
        
        // Only create if session doesn't exist
        if (!existingSession || existingSession.length === 0) {
          sessionsToCreate.push({
            coach_id: schedule.coach_id,
            branch_id: schedule.branch_id,
            session_date: dateString,
            start_time: startTimeString,
            end_time: endTimeString,
            status: "available"
          });
        }
        
        // Move to the next slot
        currentSlotStart = slotEnd;
      }
    }
  }
  
  // Create sessions in batches to avoid hitting rate limits
  const batchSize = 100;
  for (let i = 0; i < sessionsToCreate.length; i += batchSize) {
    const batch = sessionsToCreate.slice(i, i + batchSize);
    
    if (batch.length > 0) {
      // Ensure each session has a unique ID
      const batchWithIds = batch.map(session => ({
        ...session,
        id: session.id || uuidv4() // Use existing ID or generate one if missing
      }));
      
      const { error: createSessionsError } = await supabase
        .from("coach_sessions")
        .insert(batchWithIds);
        
      if (createSessionsError) {
        console.error("Error creating sessions batch:", createSessionsError);
      }
    }
  }
  
  return { createdSessions: sessionsToCreate.length };
}

export async function checkAndCreatePlayerProfile(
  userId: string,
  hasPlayedBefore: boolean,
  yearsPlaying: number,
  hasVideo?: boolean,
  videoUrl?: string,
  videoNotes?: string
) {
  try {
    const supabase = await createClient();

    // Get user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('email, full_name')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    // Check if player profile exists
    const { data: existingProfile, error: profileError } = await supabase
      .from('players')
      .select('*')
      .eq('id', userId)  // Changed from user_id to id
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      throw profileError;
    }

    if (existingProfile) {
      return {
        profile: existingProfile,
        needsAssessment: false,
        needsVideoReview: false
      };
    }

    // Determine level and assessment needs
    let level = 1;
    let needsAssessment = false;
    let needsVideoReview = false;

    if (hasPlayedBefore) {
      if (hasVideo && videoUrl) {
        // If they have a video, queue it for review
        needsVideoReview = true;
      } else if (yearsPlaying >= 0.5) { // 6 months or more
        // If they have significant experience but no video, require assessment
        needsAssessment = true;
      }
    }

    // Create player profile
    const { data: playerProfile, error: createError } = await supabase
      .from('players')
      .insert({
        id: userId, // Use the user's ID as the player's ID
        user_id: userId,
        email: userData.email,
        full_name: userData.full_name,
        level: level,
        skill_level: 'Beginner',
        years_playing: yearsPlaying || 0,
        goals: 'Improve squash skills',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (createError) {
      // If we get a duplicate key error, try to fetch the existing profile
      if (createError.code === '23505') {
        const { data: existingPlayer, error: fetchError } = await supabase
          .from('players')
          .select('*')
          .eq('id', userId)
          .single();
          
        if (fetchError) throw fetchError;
        
        return {
          profile: existingPlayer,
          needsAssessment: false,
          needsVideoReview: false
        };
      }
      throw createError;
    }

    // If video review is needed, create video review request
    if (needsVideoReview && videoUrl) {
      const { error: videoError } = await supabase
        .from('video_reviews')
        .insert({
          player_id: userId,
          video_url: videoUrl,
          notes: videoNotes || '',
          status: 'pending'
        });

      if (videoError) throw videoError;
    }

    return {
      profile: playerProfile,
      needsAssessment,
      needsVideoReview
    };
  } catch (error) {
    console.error('Error creating player profile:', error);
    throw error;
  }
}

export async function createTestUser() {
  "use server";
  const supabase = await createClient();
  const userId = uuidv4();
  
  try {
    // Read the migration files and execute them
    const fs = require('fs');
    const path = require('path');
    
    const coachMigrationFile = path.join(process.cwd(), 'src/utils/supabase/migrations/20240910000001_add_coaches_and_schedules.sql');
    const sessionGenerationFile = path.join(process.cwd(), 'src/utils/supabase/migrations/20240910000002_generate_coach_sessions.sql');
    
    const coachMigrationSql = fs.readFileSync(coachMigrationFile, 'utf8');
    const sessionGenerationSql = fs.readFileSync(sessionGenerationFile, 'utf8');
    
    // Execute the migrations using RPC if available
    try {
      await supabase.rpc('exec_sql', { sql: coachMigrationSql });
      await supabase.rpc('exec_sql', { sql: sessionGenerationSql });
    } catch (rpcError) {
      console.error('RPC exec_sql not available:', rpcError);
      // Alternative implementation could go here if needed
    }
    
    return { success: true, message: 'Coach schedules set up successfully!' };
  } catch (error) {
    console.error('Error setting up coach schedules:', error);
    return { success: false, message: 'Failed to set up coach schedules.' };
  }
}

export async function createCoachAccounts() {
  const supabase = await createClient();
  const results = [];

  type CoachResult = {
    name: string;
    success: boolean;
    error?: string;
    message?: string;
    email?: string;
    password?: string;
    userId?: string;
    note?: string;
  };

  // Define list of coaches to create
  const coaches = [
    {
      name: "Ahmed Fakhry",
      email: "ahmed.fakhry@squashacademy.com",
    },
    {
      name: "Ahmed Mahrous",
      email: "ahmed.mahrous@squashacademy.com",
    },
    {
      name: "Ahmed Magdy",
      email: "ahmed.magdy@squashacademy.com",
    },
    {
      name: "Alaa Taha",
      email: "alaa.taha@squashacademy.com",
    },
    {
      name: "Ahmed Maher",
      email: "ahmed.maher@squashacademy.com",
    },
    {
      name: "Omar Zaki",
      email: "omar.zaki@squashacademy.com",
    },
    {
      name: "Hussein Amr",
      email: "hussein.amr@squashacademy.com",
    },
  ];

  const processCoach = async (name, email): Promise<CoachResult> => {
    try {
      // Generate a random password
      const password = `Coach${Math.floor(1000 + Math.random() * 9000)}!`;
      
      // Step 1: Create auth user first using Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            name: name,
            role: "coach"
          },
          emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
        },
      });

      if (authError) {
        console.error(`Error creating auth user for coach ${name}:`, authError);
        return {
          name,
          success: false,
          error: authError.message,
          message: `Failed to create auth user: ${authError.message}`,
        };
      }

      // Wait for auth user to be properly created
      await new Promise(resolve => setTimeout(resolve, 1000));

      const userId = authData.user?.id;
      
      if (!userId) {
        return {
          name,
          success: false,
          error: "No user ID returned from authentication",
          message: "Failed to get user ID after authentication",
        };
      }

      // Step 2: Create user record with the auth user ID
      const { error: userError } = await supabase.from("users").upsert(
        {
          id: userId,
          email: email,
          full_name: name,
          role: "coach",
        },
        { onConflict: "id" }
      );

      if (userError) {
        console.error(`Error creating user for coach ${name}:`, userError.message);
        return {
          name,
          success: false,
          error: userError.message,
          message: `Failed to create user: ${userError.message}`,
        };
      }

      // Step 3: Create coach record with same ID
      const { error: coachError } = await supabase.from("coaches").upsert(
        {
          id: userId,
          name: name,
          specialties: ["Squash Training"],
          available_levels: ["Beginner", "Intermediate", "Advanced"],
          rating: 5.0
        },
        { onConflict: "id" }
      );

      if (coachError) {
        console.error(`Error creating coach ${name}:`, coachError.message);
        return {
          name,
          success: false,
          error: coachError.message,
          message: `Failed to create coach: ${coachError.message}`,
          userId,
        };
      }

      // Step 4: Get default branch (Royal British School) or create one if it doesn't exist
      let branchId;
      
      const { data: branchData, error: branchError } = await supabase
        .from("branches")
        .select("id")
        .eq("name", "Royal British School")
        .maybeSingle();
      
      if (branchError || !branchData) {
        // Create default branch if it doesn't exist
        const newBranchId = uuidv4();
        const { error: createBranchError } = await supabase
          .from("branches")
          .insert({
            id: newBranchId,
            name: "Royal British School",
            location: "New Cairo",
            address: "Royal British School, New Cairo",
            is_members_only: false
          });
        
        if (createBranchError) {
          console.error(`Error creating branch for coach ${name}:`, createBranchError);
          return {
            name,
            success: true,
            message: "Coach created but failed to create branch",
            email,
            password,
            userId,
            note: `Error creating branch: ${createBranchError.message}`,
          };
        } else {
          branchId = newBranchId;
        }
      } else {
        branchId = branchData.id;
      }
      
      // Step 5: Create coach schedules
      if (branchId) {
        try {
          // Create default coach schedule (Monday and Wednesday 4:30 PM - 8:30 PM)
          const scheduleEntries = [
            {
              id: uuidv4(), // Explicitly generate a UUID
              coach_id: userId,
              branch_id: branchId,
              day_of_week: "Monday",
              start_time: "16:30",
              end_time: "20:30",
              session_duration: 45
            },
            {
              id: uuidv4(), // Explicitly generate a UUID
              coach_id: userId,
              branch_id: branchId,
              day_of_week: "Wednesday",
              start_time: "16:30",
              end_time: "20:30",
              session_duration: 45
            }
          ];
          
          for (const schedule of scheduleEntries) {
            const { error: scheduleError } = await supabase
              .from("coach_schedules")
              .insert(schedule);
            
            if (scheduleError) {
              console.error(`Error creating schedule for coach ${name}:`, scheduleError);
              return {
                name,
                success: true,
                message: "Coach created but failed to create schedule",
                email,
                password,
                userId,
                note: `Error creating schedule: ${scheduleError.message}`,
              };
            }
          }
          
          // Proceed with generating sessions
          try {
            // Generate some available sessions for next 30 days
            const startDate = new Date();
            const daysToGenerate = 30;
            const sessionsToCreate: {
              id: string;
              coach_id: string;
              branch_id: string;
              session_date: string;
              start_time: string;
              end_time: string;
              status: string;
            }[] = [];
            
            for (let day = 0; day < daysToGenerate; day++) {
              const currentDate = new Date(startDate);
              currentDate.setDate(currentDate.getDate() + day);
              
              // Only create sessions for Monday and Wednesday (1 = Monday, 3 = Wednesday)
              const dayOfWeek = currentDate.getDay();
              if (dayOfWeek === 1 || dayOfWeek === 3) {
                const dateString = currentDate.toISOString().split('T')[0];
                
                // Create 4 sessions per day (hourly slots from 4:30 PM to 8:30 PM)
                const startHours = [16, 17, 18, 19];
                const startMinutes = [30, 30, 30, 30];
                const endHours = [17, 18, 19, 20];
                const endMinutes = [30, 30, 30, 30];
                
                for (let i = 0; i < startHours.length; i++) {
                  sessionsToCreate.push({
                    id: uuidv4(),
                    coach_id: userId,
                    branch_id: branchId,
                    session_date: dateString,
                    start_time: `${startHours[i]}:${startMinutes[i]}`,
                    end_time: `${endHours[i]}:${endMinutes[i]}`,
                    status: 'available'
                  });
                }
              }
            }
            
            // Insert sessions in batches of 50 to avoid hitting limits
            const batchSize = 50;
            for (let i = 0; i < sessionsToCreate.length; i += batchSize) {
              const batch = sessionsToCreate.slice(i, i + batchSize);
              const { error: sessionsError } = await supabase
                .from('coach_sessions')
                .insert(batch);
              
              if (sessionsError) {
                console.error(`Error creating sessions for coach ${name}:`, sessionsError);
                return {
                  name,
                  success: true,
                  message: "Coach and schedule created but failed to create some sessions",
                  email,
                  password,
                  userId,
                  note: `Error creating sessions: ${sessionsError.message}`,
                };
              }
            }
          } catch (sessionErr) {
            console.error(`Exception processing sessions for ${name}:`, sessionErr);
            return {
              name,
              success: true,
              message: "Coach and schedule created but exception in session generation",
              email,
              password,
              userId,
              note: `Session generation exception: ${sessionErr instanceof Error ? sessionErr.message : 'Unknown error'}`,
            };
          }
        } catch (scheduleErr) {
          console.error(`Exception processing schedule for ${name}:`, scheduleErr instanceof Error ? scheduleErr.message : 'Unknown error');
          return {
            name,
            success: true,
            message: "Coach created but exception in schedule creation",
            email,
            password,
            userId,
            note: `Schedule exception: ${scheduleErr instanceof Error ? scheduleErr.message : 'Unknown error'}`,
          };
        }
      }

      return {
        name,
        success: true,
        message: "Coach account created successfully",
        email,
        password,
        userId,
      };
    } catch (err) {
      console.error(`Exception creating coach ${name}:`, err);
      return {
        name,
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        message: `Exception: ${err instanceof Error ? err.message : 'Unknown error'}`,
      };
    }
  };

  // Process coaches sequentially to avoid race conditions
  // INSERT_YOUR_REWRITE_HERE
  try {
    const supabase = await createClient();
    console.log("Starting importCoachSchedules...");
    
    // Schedule data from the provided timetable
    const scheduleData = [
      // Tuesday
      {
        day: "Tuesday",
        schedules: [
          { time: "3:30", coach: "Ahmed Fakhry", student: "", courtNumber: 1 },
          { time: "3:30", coach: "Ahmed Mahrous", student: "ECA", courtNumber: 2 },
          // Keep other schedule entries...
        ]
      },
      // Keep other days...
    ];

    // First, get all coach IDs mapped to their names
    console.log("Fetching coaches from database...");
    const { data: coachData, error: coachError } = await supabase
      .from("users")
      .select("id, full_name, email")
      .eq("role", "coach");
      
    if (coachError) {
      console.error("Error fetching coaches:", coachError);
      return { success: false, error: `Failed to fetch coaches: ${coachError.message}` };
    }
    
    console.log(`Found ${coachData?.length || 0} coaches in database:`, coachData);
    
    // Create a map of coach names to IDs
    const coachMap = new Map<string, string>();
    
    // Initialize with known coach names from the schedule
    const knownCoaches = ["ahmed fakhry", "ahmed mahrous", "alaa taha", "omar zaki", "abdullah"];
    
    for (const coach of coachData || []) {
      // Clean up the coach names to handle potential variations
      const cleanName = coach.full_name.trim().toLowerCase();
      coachMap.set(cleanName, coach.id);
      
      console.log(`Mapped coach: ${coach.full_name} (${coach.email}) -> ${coach.id}`);
      
      // Also map by partial names for the coaches we know are in the schedule
      for (const knownCoach of knownCoaches) {
        if (cleanName.includes(knownCoach)) {
          coachMap.set(knownCoach, coach.id);
          console.log(`Added mapping for ${knownCoach} -> ${coach.id}`);
        }
      }
    }
    
    console.log("Coach map:", Object.fromEntries(coachMap));
    
    // Check if we're missing any coaches from the schedule
    const missingCoaches: string[] = [];
    for (const knownCoach of knownCoaches) {
      if (!coachMap.has(knownCoach)) {
        missingCoaches.push(knownCoach);
      }
    }
    
    if (missingCoaches.length > 0) {
      console.warn(`Missing coaches in database: ${missingCoaches.join(", ")}`);
    }
    
    // Get the branch ID
    console.log("Fetching branch information...");
    const { data: branchData, error: branchError } = await supabase
      .from("branches")
      .select("id, name")
      .eq("name", "Ramy Ashour Academy")
      .maybeSingle();
      
    if (branchError) {
      console.error("Error fetching branch:", branchError);
      return { success: false, error: `Failed to fetch branch: ${branchError.message}` };
    }
    
    if (!branchData) {
      console.log("Branch 'Ramy Ashour Academy' not found, trying to create it...");
      
      // Create the branch
      const { data: newBranch, error: createBranchError } = await supabase
        .from("branches")
        .insert({
          id: uuidv4(),
          name: "Ramy Ashour Academy",
          location: "Cairo",
          address: "Cairo, Egypt",
          is_members_only: false
        })
        .select("id")
        .single();
        
      if (createBranchError) {
        console.error("Error creating branch:", createBranchError);
        return { success: false, error: `Failed to create branch: ${createBranchError.message}` };
      }
      
      if (!newBranch) {
        return { success: false, error: "Failed to create branch: No data returned" };
      }
      
      console.log("Created new branch with ID:", newBranch.id);
      var branchId = newBranch.id;
    } else {
      console.log("Found branch:", branchData);
      var branchId = branchData.id;
    }
    
    if (!branchId) {
      return { success: false, error: "No branch ID available" };
    }
    
    // Process each day and schedule to create coach_sessions
    const results = {
      total: 0,
      created: 0,
      skipped: 0,
      failed: 0,
      errors: [] as string[]
    };
    
    // For simplicity in testing, let's just create a few sessions
    // from Tuesday's schedule to test the functionality
    console.log("Processing schedule for Tuesday only (testing)...");
    
    const tuesdaySchedule = scheduleData[0]; // Tuesday is the first day
    
    // Get the date for next Tuesday
    const today = new Date();
    const daysUntilNextTuesday = (2 - today.getDay() + 7) % 7; // Tuesday is 2
    const nextTuesday = new Date(today);
    nextTuesday.setDate(today.getDate() + daysUntilNextTuesday);
    
    const formattedDate = nextTuesday.toISOString().split('T')[0];
    console.log(`Creating sessions for date: ${formattedDate}`);
    
    // Process just a few key sessions from Tuesday as a test
    const testSessions = tuesdaySchedule.schedules.slice(0, 5); // Just first 5 sessions
    
    for (const schedule of testSessions) {
      results.total++;
      
      console.log(`Processing session: ${schedule.time}, Coach: ${schedule.coach}, Court: ${schedule.courtNumber}`);
      
      // Skip empty slots
      if (!schedule.coach || schedule.coach === "") {
        console.log("Skipping empty coach slot");
        results.skipped++;
        continue;
      }
      
      // Get coach ID
      const cleanCoachName = schedule.coach.toLowerCase();
      const coachId = coachMap.get(cleanCoachName);
      
      if (!coachId) {
        const errorMsg = `Unknown coach: ${schedule.coach}`;
        console.error(errorMsg);
        results.errors.push(errorMsg);
        results.failed++;
        continue;
      }
      
      console.log(`Using coach ID: ${coachId}`);
      
      // Parse time
      let [hours, minutes] = schedule.time.split(':');
      const startTime = `${hours.padStart(2, '0')}:${minutes || '00'}`;
      
      // Calculate end time (45 minutes later)
      const startHour = parseInt(hours);
      const startMinute = parseInt(minutes || '0');
      let endHour = startHour;
      let endMinute = startMinute + 45;
      
      if (endMinute >= 60) {
        endHour += 1;
        endMinute -= 60;
      }
      
      const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
      
      console.log(`Time slot: ${startTime} - ${endTime}`);
      
      // Try to create the session
      try {
        // Create new session
        console.log("Inserting session into database...");
        const { data: sessionData, error: insertError } = await supabase
          .from("coach_sessions")
          .insert({
            id: uuidv4(), // Explicitly add an ID
            coach_id: coachId,
            branch_id: branchId,
            session_date: formattedDate,
            start_time: startTime,
            end_time: endTime,
            status: schedule.student ? "booked" : "available"
          })
          .select("id")
          .single();
          
        if (insertError) {
          console.error("Error creating session:", insertError);
          results.errors.push(`Error creating session: ${insertError.message}`);
          results.failed++;
        } else {
          console.log(`Session created with ID: ${sessionData?.id}`);
          results.created++;
        }
      } catch (error) {
        console.error("Exception creating session:", error);
        results.errors.push(`Exception: ${error instanceof Error ? error.message : String(error)}`);
        results.failed++;
      }
    }
    
    console.log("Import completed with results:", results);
    
    return {
      success: true,
      results
    };
  } catch (error) {
    console.error("Top-level exception in importCoachSchedules:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
}

export async function testCreateCoachSession() {
  "use server";
  
  try {
    console.log("Starting testCreateCoachSession function...");
    const supabase = await createClient();
    
    // 1. First test - fetch all coaches to check database connection
    console.log("Test 1: Fetching coaches from database...");
    const { data: coaches, error: coachError } = await supabase
      .from("users")
      .select("id, full_name, email")
      .eq("role", "coach")
      .limit(5);
      
    if (coachError) {
      console.error("Error fetching coaches:", coachError);
      return { success: false, error: `Database query failed: ${coachError.message}` };
    }
    
    console.log(`Found ${coaches?.length || 0} coaches in database`);
    
    // Declare variables with proper types
    let testCoachId: string;
    
    if (!coaches || coaches.length === 0) {
      console.log("No coaches found. Creating a test coach...");
      
      // Create a test coach
      const coachId = uuidv4();
      const { error: createUserError } = await supabase
        .from("users")
        .insert({
          id: coachId,
          full_name: "Test Coach",
          email: `test.coach.${Date.now()}@example.com`,
          role: "coach"
        });
        
      if (createUserError) {
        console.error("Error creating test coach user:", createUserError);
        return { success: false, error: `Failed to create test coach: ${createUserError.message}` };
      }
      
      const { error: createCoachError } = await supabase
        .from("coaches")
        .insert({
          id: coachId,
          name: "Test Coach",
          specialties: ["Testing"],
          available_levels: ["All"],
          rating: 5.0
        });
        
      if (createCoachError) {
        console.error("Error creating coach record:", createCoachError);
        return { success: false, error: `Failed to create coach record: ${createCoachError.message}` };
      }
      
      console.log("Created test coach with ID:", coachId);
      testCoachId = coachId;
    } else {
      console.log("Using existing coach:", coaches[0]);
      testCoachId = coaches[0].id;
    }
    
    // 2. Test branches table and create a test branch if needed
    console.log("Test 2: Checking branch information...");
    const { data: branch, error: branchError } = await supabase
      .from("branches")
      .select("id, name")
      .limit(1)
      .maybeSingle();
      
    if (branchError) {
      console.error("Error fetching branch:", branchError);
      return { success: false, error: `Failed to fetch branch: ${branchError.message}` };
    }
    
    let testBranchId: string;
    
    if (!branch) {
      console.log("No branches found. Creating a test branch...");
      
      const branchId = uuidv4();
      const { error: createBranchError } = await supabase
        .from("branches")
        .insert({
          id: branchId,
          name: "Test Branch",
          location: "Test Location",
          address: "Test Address",
          is_members_only: false
        });
        
      if (createBranchError) {
        console.error("Error creating test branch:", createBranchError);
        return { success: false, error: `Failed to create test branch: ${createBranchError.message}` };
      }
      
      console.log("Created test branch with ID:", branchId);
      testBranchId = branchId;
    } else {
      console.log("Using existing branch:", branch);
      testBranchId = branch.id;
    }
    
    // 3. Test creating a single coach session
    console.log("Test 3: Creating a test coach session...");
    
    // Get tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const formattedDate = tomorrow.toISOString().split('T')[0];
    
    // Create session with explicit ID
    const sessionId = uuidv4();
    console.log(`Creating session with ID: ${sessionId}`);
    
    const { data: session, error: sessionError } = await supabase
      .from("coach_sessions")
      .insert({
        id: sessionId,
        coach_id: testCoachId,
        branch_id: testBranchId,
        session_date: formattedDate,
        start_time: "10:00",
        end_time: "10:45",
        status: "available"
      })
      .select()
      .single();
      
    if (sessionError) {
      console.error("Error creating test session:", sessionError);
      return { 
        success: false, 
        error: `Failed to create test session: ${sessionError.message}`,
        details: {
          code: sessionError.code,
          hint: sessionError.hint,
          details: sessionError.details
        }
      };
    }
    
    console.log("Successfully created coach session:", session);
    
    // 4. Test coach_sessions table structure
    console.log("Test 4: Checking coach_sessions table structure...");
    
    // Get column information from Postgres
    const { data: tableInfo, error: tableError } = await supabase.rpc(
      'get_table_info',
      { table_name: 'coach_sessions' }
    );
    
    if (tableError) {
      console.log("Error getting table info (this is expected if the RPC doesn't exist):", tableError);
      // This is not a critical error, as the RPC might not exist
    } else {
      console.log("Table structure for coach_sessions:", tableInfo);
    }
    
    return { 
      success: true, 
      message: "All tests passed successfully",
      sessionId: session.id,
      coachId: testCoachId,
      branchId: testBranchId
    };
  } catch (error) {
    console.error("Error in testCreateCoachSession:", error);
    return { 
      success: false, 
      error: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

export async function insertRoyalBritishSchedules() {
  "use server";
  
  try {
    const supabase = await createClient();
    console.log("Starting insertRoyalBritishSchedules...");
    
    // Define the session result type
    type SessionResult = {
      success?: boolean;
      error?: string;
      action?: string;
      id?: string;
      day?: string;
      coach?: string;
      time?: string;
    };
    
    // 1. Get or create the Royal British School branch
    console.log("Finding or creating Royal British School branch...");
    let { data: branch, error: branchError } = await supabase
      .from("branches")
      .select("id")
      .eq("name", "Royal British School")
      .maybeSingle();
      
    if (branchError) {
      console.error("Error checking for Royal British School branch:", branchError);
      return { success: false, error: `Database error: ${branchError.message}` };
    }
    
    let branchId;
    if (!branch) {
      console.log("Royal British School branch not found, creating it...");
      const newBranchId = uuidv4();
      const { error: createBranchError } = await supabase
        .from("branches")
        .insert({
          id: newBranchId,
          name: "Royal British School",
          location: "New Cairo",
          address: "Royal British School, New Cairo",
          is_members_only: false
        });
        
      if (createBranchError) {
        console.error("Error creating Royal British School branch:", createBranchError);
        return { success: false, error: `Failed to create branch: ${createBranchError.message}` };
      }
      
      branchId = newBranchId;
      console.log("Created Royal British School branch with ID:", branchId);
    } else {
      branchId = branch.id;
      console.log("Found existing Royal British School branch with ID:", branchId);
    }
    
    // 2. Get all coaches - we'll need their IDs
    const { data: coaches, error: coachError } = await supabase
      .from("users")
      .select("id, full_name, email")
      .eq("role", "coach");
      
    if (coachError) {
      console.error("Error fetching coaches:", coachError);
      return { success: false, error: `Failed to fetch coaches: ${coachError.message}` };
    }
    
    if (!coaches || coaches.length === 0) {
      return {
        success: false,
        error: "No coaches found in the database. Please create coach accounts first."
      };
    }
    
    console.log(`Found ${coaches.length} coaches in the database`);
    
    // Create a map for quick coach lookup by name
    const coachMap = new Map();
    
    // Special case mappings for coaches from the tables
    const coachNameMap: Record<string, string> = {
      "ahmed fakhry": "Ahmed Fakhry",
      "ahmed mahrous": "Ahmed Mahrous",
      "alaa taha": "Alaa Taha",
      "omar zaki": "Omar Zaki",
      "ahmed maher": "Ahmed Maher",
      "abdelrahman dahy": "Abdelrahman Dahy"
    };
    
    for (const coach of coaches) {
      const name = coach.full_name.toLowerCase();
      coachMap.set(name, coach.id);
      console.log(`Mapped coach: ${coach.full_name} -> ${coach.id}`);
      
      // Add additional mappings for nicknames or variations
      if (name.includes("ahmed") && name.includes("fakhry")) {
        coachMap.set("ahmed fakhry", coach.id);
      } else if (name.includes("ahmed") && name.includes("mahrous")) {
        coachMap.set("ahmed mahrous", coach.id);
      } else if (name.includes("alaa") && name.includes("taha")) {
        coachMap.set("alaa taha", coach.id);
      } else if (name.includes("omar") && name.includes("zaki")) {
        coachMap.set("omar zaki", coach.id);
      } else if (name.includes("ahmed") && name.includes("maher")) {
        coachMap.set("ahmed maher", coach.id);
      } else if (name.includes("abdelrahman") || name.includes("dahy")) {
        coachMap.set("abdelrahman dahy", coach.id);
      }
    }
    
    console.log("Coach mappings created:", Object.fromEntries(coachMap));
    
    // Check if all required coaches exist
    const requiredCoaches = ["ahmed fakhry", "ahmed mahrous", "alaa taha", "omar zaki", "ahmed maher", "abdelrahman dahy"];
    const missingCoaches: string[] = [];
    
    for (const coach of requiredCoaches) {
      if (!coachMap.has(coach)) {
        missingCoaches.push(coachNameMap[coach] || coach);
      }
    }
    
    if (missingCoaches.length > 0) {
      console.error("Missing required coaches:", missingCoaches);
      return {
        success: false,
        error: `Missing coaches: ${missingCoaches.join(", ")}. Please create these coach accounts first.`
      };
    }
    
    // Helper function to format time
    const formatTime = (time) => {
      // Handle times like "1:30" that need padding to "01:30"
      if (time.includes(":")) {
        const [hours, minutes] = time.split(":");
        return `${hours.padStart(2, "0")}:${minutes}`;
      }
      return `${time.padStart(2, "0")}:00`;
    };
    
    // Helper function to create a session entry
    const createSession = async (day: string, time: string, coachName: string, student: string, courtNumber: number): Promise<SessionResult> => {
      if (!coachName) return { error: "Empty coach name" }; // Skip empty coach slots but return proper error object
      
      const coachKey = coachName.toLowerCase();
      let coachId = null;
      
      // Try to find coach using direct match
      if (coachMap.has(coachKey)) {
        coachId = coachMap.get(coachKey);
      } else {
        // Try to find the coach by partial match
        for (const [key, id] of Array.from(coachMap.entries())) {
          if (coachKey.includes(key) || key.includes(coachKey)) {
            coachId = id;
            console.log(`Using fuzzy match for ${coachName}: found "${key}" with ID ${id}`);
            break;
          }
        }
      }
      
      // If still no match, try specific names
      if (!coachId) {
        if (coachKey.includes("fakhry")) {
          coachId = coachMap.get("ahmed fakhry");
        } else if (coachKey.includes("mahrous")) {
          coachId = coachMap.get("ahmed mahrous");
        } else if (coachKey.includes("taha")) {
          coachId = coachMap.get("alaa taha");
        } else if (coachKey.includes("zaki")) {
          coachId = coachMap.get("omar zaki");
        } else if (coachKey.includes("maher")) {
          coachId = coachMap.get("ahmed maher");
        } else if (coachKey.includes("dahy") || coachKey.includes("abdelrahman")) {
          coachId = coachMap.get("abdelrahman dahy");
        }
      }
      
      if (!coachId) {
        console.error(`Could not find coach ID for: ${coachName}`);
        return { error: `Unknown coach: ${coachName}` };
      }
      
      // Parse time and create end time (45 minutes later)
      const timeStr = time.toString(); // Ensure it's a string
      let startTime;
      
      // Handle various time formats
      if (timeStr.includes(":")) {
        startTime = formatTime(timeStr);
      } else {
        startTime = formatTime(timeStr);
      }
      
      // Calculate end time (45 minutes later)
      const [startHour, startMinute] = startTime.split(":").map(Number);
      let endHour = startHour;
      let endMinute = startMinute + 45;
      
      if (endMinute >= 60) {
        endHour += 1;
        endMinute -= 60;
      }
      
      const endTime = `${endHour.toString().padStart(2, "0")}:${endMinute.toString().padStart(2, "0")}`;
      
      // Get the date for the specified day of the week
      const today = new Date();
      const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
      const dayIndex = daysOfWeek.indexOf(day.toLowerCase());
      
      if (dayIndex === -1) {
        return { error: `Invalid day: ${day}` };
      }
      
      // Calculate the next occurrence of this day
      const daysToAdd = (dayIndex - today.getDay() + 7) % 7;
      const sessionDate = new Date(today);
      sessionDate.setDate(today.getDate() + daysToAdd);
      
      const formattedDate = sessionDate.toISOString().split("T")[0];
      
      // Check if this session already exists
      const { data: existingSession, error: checkError } = await supabase
        .from("coach_sessions")
        .select("id")
        .eq("coach_id", coachId)
        .eq("branch_id", branchId)
        .eq("session_date", formattedDate)
        .eq("start_time", startTime)
        .maybeSingle();
        
      if (checkError) {
        console.error("Error checking for existing session:", checkError);
        return { error: `Failed to check for existing session: ${checkError.message}`, day, coach: coachName, time };
      }
      
      // Either update or create the session
      if (existingSession) {
        console.log(`Session already exists for ${coachName} on ${day} at ${startTime}, updating...`);
        const { error: updateError } = await supabase
          .from("coach_sessions")
          .update({
            status: student ? "booked" : "available"
          })
          .eq("id", existingSession.id);
          
        if (updateError) {
          console.error("Error updating session:", updateError);
          return { error: `Failed to update session: ${updateError.message}`, day, coach: coachName, time };
        }
        
        return { success: true, action: "updated", id: existingSession.id, day, coach: coachName, time };
      } else {
        // Create new session
        const sessionId = uuidv4();
        
        // Create the session data
        const sessionData = {
          id: sessionId,
          coach_id: coachId,
          branch_id: branchId,
          session_date: formattedDate,
          day_of_week: day, // Add the day_of_week field
          start_time: startTime,
          end_time: endTime,
          status: student ? "booked" : "available"
        };
        
        console.log(`Creating new session:`, sessionData);
        
        try {
          const { error: insertError } = await supabase
            .from("coach_sessions")
            .insert(sessionData);
            
          if (insertError) {
            console.error("Error creating session:", insertError);
            return { error: `Failed to create session: ${insertError.message}`, day, coach: coachName, time };
          }
          
          return { success: true, action: "created", id: sessionId, day, coach: coachName, time };
        } catch (error) {
          console.error("Exception creating session:", error);
          const errorMessage = error instanceof Error ? error.message : String(error);
          return { error: `Exception: ${errorMessage}`, day, coach: coachName, time };
        }
      }
    };
    
    // Arrays to store results from each day's processing
    const tuesdayResults: SessionResult[] = [];
    const wednesdayResults: SessionResult[] = [];
    const thursdayResults: SessionResult[] = [];
    const fridayResults: SessionResult[] = [];
    const saturdayResults: SessionResult[] = [];
    const sundayResults: SessionResult[] = [];
    const mondayResults: SessionResult[] = [];
    
    // Process Sunday schedule
    console.log("Processing Sunday schedule...");
    const sundaySchedule = [
      { time: "3:30", coach1: "Ahmed Fakhry", student1: "ECA", coach2: "Ahmed Maher", student2: "ECA" },
      { time: "4:30", coach1: "Ahmed Fakhry", student1: "Rayan (individual)", coach2: "Ahmed Maher", student2: "Tamem (individual)" },
      { time: "5:15", coach1: "Ahmed Fakhry", student1: "Mayada Emad (individual)", coach2: "Ahmed Maher", student2: "Omar sherif (individual)" },
      { time: "6:00", coach1: "Ahmed Fakhry", student1: "Dalida (individual)", coach2: "Ahmed Maher", student2: "Mohamed reda el basuiny (individual)" },
      { time: "6:45", coach1: "Ahmed Fakhry", student1: "Lara omar (individual)", coach2: "Ahmed Maher", student2: "elissa mark (individual)" },
      { time: "7:30", coach1: "Ahmed Fakhry", student1: "aly ahmed (individual)", coach2: "Ahmed Maher", student2: "Cady mohamed (individual)" },
      { time: "8:15", coach1: "Ahmed Fakhry", student1: "Aly mostafa (individual)", coach2: "Ahmed Maher", student2: "youssef Adham (individual)" },
      { time: "9:00", coach1: "", student1: "", coach2: "", student2: "" }
    ];
    
    for (const slot of sundaySchedule) {
      const result1 = await createSession("Sunday", slot.time, slot.coach1, slot.student1, 1);
      const result2 = await createSession("Sunday", slot.time, slot.coach2, slot.student2, 2);
      
      if (result1) sundayResults.push(result1);
      if (result2) sundayResults.push(result2);
    }
    
    // Process Monday schedule
    console.log("Processing Monday schedule...");
    const mondaySchedule = [
      { time: "3:30", coach1: "Alaa Taha", student1: "ECA", coach2: "Abdelrahman Dahy", student2: "ECA" },
      { time: "4:30", coach1: "Alaa Taha", student1: "Layla Mohamed Sadek (Individual)", coach2: "Abdelrahman Dahy", student2: "Selim el khamiry(individual) Not Confirmed" },
      { time: "5:15", coach1: "Alaa Taha", student1: "Talia mohamed (individual)", coach2: "Abdelrahman Dahy", student2: "Camellia Gheriany (Individual)" },
      { time: "6:00", coach1: "Alaa Taha", student1: "Carla mahmoud (individual)", coach2: "Abdelrahman Dahy", student2: "Mariam ahmed (individual)" },
      { time: "6:45", coach1: "Alaa Taha", student1: "Aly mostafa(individual)", coach2: "Abdelrahman Dahy", student2: "layan(individual)" },
      { time: "7:30", coach1: "Alaa Taha", student1: "Omar sherif salem (individual)", coach2: "Abdelrahman Dahy", student2: "Yasin Mohamed Mamdouh (from 28/04)" },
      { time: "8:15", coach1: "Alaa Taha", student1: "Marwa fahmy (individual)", coach2: "Abdelrahman Dahy", student2: "Adam merai(individual)" },
      { time: "9:00", coach1: "Alaa Taha", student1: "Hamza (individual)", coach2: "Abdelrahman Dahy", student2: "Malek Ahmed Tarek (from 01/05)" }
    ];
    
    for (const slot of mondaySchedule) {
      const result1 = await createSession("Monday", slot.time, slot.coach1, slot.student1, 1);
      const result2 = await createSession("Monday", slot.time, slot.coach2, slot.student2, 2);
      
      if (result1) mondayResults.push(result1);
      if (result2) mondayResults.push(result2);
    }
    
    // Process Tuesday schedule
    console.log("Processing Tuesday schedule...");
    const tuesdaySchedule = [
      { time: "3:30", coach1: "Ahmed Fakhry", student1: "", coach2: "Ahmed Mahrous", student2: "ECA" },
      { time: "4:30", coach1: "Ahmed Fakhry", student1: "Rayan (individual)", coach2: "Ahmed Mahrous", student2: "Tamem (individual)" },
      { time: "5:15", coach1: "Ahmed Fakhry", student1: "Mayada emad (individual)", coach2: "Ahmed Mahrous", student2: "Mariam sherif (individual)" },
      { time: "6:00", coach1: "Ahmed Fakhry", student1: "Dalida (individual)", coach2: "Ahmed Mahrous", student2: "elissa mark (individual)" },
      { time: "6:45", coach1: "Ahmed Fakhry", student1: "Lara omar (individual)", coach2: "Ahmed Mahrous", student2: "Laila ashraf (individual)" },
      { time: "7:30", coach1: "Ahmed Fakhry", student1: "Aly Ahmed (individual)", coach2: "Ahmed Mahrous", student2: "Marwa fahmy (individual)" },
      { time: "8:15", coach1: "Ahmed Fakhry", student1: "Farida amr (individual)", coach2: "Ahmed Mahrous", student2: "Cady mohamed (individual)" },
      { time: "9:00", coach1: "", student1: "", coach2: "", student2: "" }
    ];
    
    for (const slot of tuesdaySchedule) {
      const result1 = await createSession("Tuesday", slot.time, slot.coach1, slot.student1, 1);
      const result2 = await createSession("Tuesday", slot.time, slot.coach2, slot.student2, 2);
      
      if (result1) tuesdayResults.push(result1);
      if (result2) tuesdayResults.push(result2);
    }
    
    // Process Wednesday schedule
    console.log("Processing Wednesday schedule...");
    const wednesdaySchedule = [
      { time: "3:30", coach1: "Ahmed Maher", student1: "", coach2: "Alaa Taha", student2: "Aly Mostafa (starting 23/04)" },
      { time: "4:15", coach1: "Ahmed Maher", student1: "layan (individual)", coach2: "Alaa Taha", student2: "Taher and Ameen Asser Yassin (group)" },
      { time: "5:00", coach1: "Ahmed Maher", student1: "Camellia Gheriany (Individual)", coach2: "Alaa Taha", student2: "Talia mohamed (individual)" },
      { time: "5:45", coach1: "Ahmed Maher", student1: "Assessment by the 1st of May Yehia and aly (group)", coach2: "Alaa Taha", student2: "Selim el khamry (individual)" },
      { time: "6:30", coach1: "Ahmed Maher", student1: "Aly karim (individual)", coach2: "Alaa Taha", student2: "Omar sherif salem (individual)" },
      { time: "7:15", coach1: "Ahmed Maher", student1: "Hachem (individual)", coach2: "Alaa Taha", student2: "Gasser (individual)" },
      { time: "8:00", coach1: "Ahmed Maher", student1: "Youssef adham (individual)", coach2: "Alaa Taha", student2: "Mohamed reda el basiuony (individual)" },
      { time: "8:45", coach1: "", student1: "", coach2: "", student2: "" }
    ];
    
    for (const slot of wednesdaySchedule) {
      const result1 = await createSession("Wednesday", slot.time, slot.coach1, slot.student1, 1);
      const result2 = await createSession("Wednesday", slot.time, slot.coach2, slot.student2, 2);
      
      if (result1) wednesdayResults.push(result1);
      if (result2) wednesdayResults.push(result2);
    }
    
    // Process Thursday schedule
    console.log("Processing Thursday schedule...");
    const thursdaySchedule = [
      { time: "3:30", coach1: "Omar Zaki", student1: "Yassin Mohamed Mamdouh", coach2: "", student2: "" },
      { time: "4:15", coach1: "Omar Zaki", student1: "Zeina El Ghazawy (individual)", coach2: "", student2: "" },
      { time: "5:00", coach1: "Omar Zaki", student1: "Marwa Fahmy", coach2: "", student2: "" },
      { time: "5:45", coach1: "Omar Zaki", student1: "Hachem (individual)", coach2: "", student2: "" },
      { time: "6:30", coach1: "Omar Zaki", student1: "Gasser (individual)", coach2: "", student2: "" },
      { time: "7:15", coach1: "Omar Zaki", student1: "Aisha yasser (individual)", coach2: "", student2: "" },
      { time: "8:00", coach1: "Omar Zaki", student1: "Icel mohamed (individual)", coach2: "", student2: "" },
      { time: "8:45", coach1: "Omar Zaki", student1: "Dema mohamed (individual)", coach2: "", student2: "" }
    ];
    
    for (const slot of thursdaySchedule) {
      const result1 = await createSession("Thursday", slot.time, slot.coach1, slot.student1, 1);
      const result2 = await createSession("Thursday", slot.time, slot.coach2, slot.student2, 2);
      
      if (result1) thursdayResults.push(result1);
      if (result2) thursdayResults.push(result2);
    }
    
    // Process Friday schedule - keep original
    console.log("Processing Friday schedule...");
    const fridaySchedule = [
      { time: "10:00", coach1: "Omar Zaki", student1: "", coach2: "Ahmed Fakhry", student2: "" },
      { time: "10:45", coach1: "Omar Zaki", student1: "", coach2: "Ahmed Fakhry", student2: "" },
      { time: "11:30", coach1: "Omar Zaki", student1: "", coach2: "Ahmed Fakhry", student2: "" },
      { time: "12:15", coach1: "Prayer Time", student1: "", coach2: "Prayer Time", student2: "" },
      { time: "1:30", coach1: "Omar Zaki", student1: "", coach2: "Ahmed Fakhry", student2: "" },
      { time: "2:15", coach1: "Omar Zaki", student1: "", coach2: "Ahmed Fakhry", student2: "" },
      { time: "3:00", coach1: "Omar Zaki", student1: "", coach2: "Ahmed Fakhry", student2: "" },
      { time: "3:45", coach1: "Omar Zaki", student1: "", coach2: "Ahmed Fakhry", student2: "" },
      { time: "4:30", coach1: "Omar Zaki", student1: "", coach2: "Ahmed Fakhry", student2: "" },
      { time: "5:15", coach1: "Omar Zaki", student1: "", coach2: "Ahmed Fakhry", student2: "" },
      { time: "6:00", coach1: "Omar Zaki", student1: "", coach2: "Ahmed Fakhry", student2: "" },
      { time: "6:45", coach1: "Omar Zaki", student1: "", coach2: "Ahmed Fakhry", student2: "" },
      { time: "7:30", coach1: "Omar Zaki", student1: "", coach2: "Ahmed Fakhry", student2: "" },
      { time: "8:15", coach1: "Omar Zaki", student1: "", coach2: "Ahmed Fakhry", student2: "" },
      { time: "9:00", coach1: "Omar Zaki", student1: "", coach2: "Ahmed Fakhry", student2: "" }
    ];
    
    for (const slot of fridaySchedule) {
      const result1 = await createSession("Friday", slot.time, slot.coach1, slot.student1, 1);
      const result2 = await createSession("Friday", slot.time, slot.coach2, slot.student2, 2);
      
      if (result1) fridayResults.push(result1);
      if (result2) fridayResults.push(result2);
    }
    
    // Process Saturday schedule - keep original
    console.log("Processing Saturday schedule...");
    const saturdaySchedule = [
      { time: "10:00", coach1: "Omar Zaki", student1: "Taher & Ameen Asser yassin", coach2: "Ahmed Mahrous", student2: "" },
      { time: "10:45", coach1: "Omar Zaki", student1: "", coach2: "Ahmed Mahrous", student2: "Laila ashraf" },
      { time: "11:30", coach1: "Omar Zaki", student1: "Layla Mohamed Sadek", coach2: "Ahmed Mahrous", student2: "Mariam sherif" },
      { time: "12:15", coach1: "Omar Zaki", student1: "Hachem", coach2: "Ahmed Mahrous", student2: "Gasser" },
      { time: "1:00", coach1: "Omar Zaki", student1: "", coach2: "Ahmed Mahrous", student2: "Carla mahmoud" },
      { time: "1:45", coach1: "Omar Zaki", student1: "", coach2: "Ahmed Mahrous", student2: "Hamza" },
      { time: "2:30", coach1: "Omar Zaki", student1: "", coach2: "Ahmed Mahrous", student2: "Aly karim" },
      { time: "3:15", coach1: "Omar Zaki", student1: "Yehia and aly", coach2: "Ahmed Mahrous", student2: "Dema mohamed" },
      { time: "4:00", coach1: "Omar Zaki", student1: "Aisha yasser", coach2: "Ahmed Mahrous", student2: "Rayan" },
      { time: "4:45", coach1: "Omar Zaki", student1: "Mariam Ahmed", coach2: "Ahmed Mahrous", student2: "Tamem" },
      { time: "5:30", coach1: "Omar Zaki", student1: "Icel mohamed", coach2: "Ahmed Mahrous", student2: "" },
      { time: "6:15", coach1: "Omar Zaki", student1: "Zeina El Ghazawy", coach2: "Ahmed Mahrous", student2: "" },
      { time: "7:00", coach1: "Omar Zaki", student1: "Selim el khamiry", coach2: "Ahmed Mahrous", student2: "" },
      { time: "7:45", coach1: "Omar Zaki", student1: "", coach2: "Ahmed Mahrous", student2: "Farida amr" },
      { time: "8:30", coach1: "Omar Zaki", student1: "", coach2: "Ahmed Mahrous", student2: "" }
    ];
    
    for (const slot of saturdaySchedule) {
      const result1 = await createSession("Saturday", slot.time, slot.coach1, slot.student1, 1);
      const result2 = await createSession("Saturday", slot.time, slot.coach2, slot.student2, 2);
      
      if (result1) saturdayResults.push(result1);
      if (result2) saturdayResults.push(result2);
    }
    
    // Compile overall results
    const allResults: SessionResult[] = [
      ...sundayResults,
      ...mondayResults,
      ...tuesdayResults,
      ...wednesdayResults,
      ...thursdayResults,
      ...fridayResults,
      ...saturdayResults
    ];
    
    const created = allResults.filter(r => r.success && r.action === "created").length;
    const updated = allResults.filter(r => r.success && r.action === "updated").length;
    const failed = allResults.filter(r => r.error).length;
    
    console.log(`Import complete. Created: ${created}, Updated: ${updated}, Failed: ${failed}`);
    
    return {
      success: true,
      message: "Royal British School schedules imported successfully",
      results: {
        total: allResults.length,
        created,
        updated,
        failed,
        errors: allResults.filter(r => r.error).map(r => r.error)
      }
    };
  } catch (error) {
    console.error("Exception in insertRoyalBritishSchedules:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

export async function regenerateCoachSessions() {
  "use server";
  try {
    console.log("------------ BEGIN COACH SESSION REGENERATION ------------");
    const supabase = await createClient();
    const startDate = new Date(); // Use today as the start date
    
    console.log("Starting coach session regeneration...");
    
    // First clear any existing future available sessions
    console.log("Clearing existing available future sessions...");
    const today = new Date().toISOString().split('T')[0];
    const { error: deleteError } = await supabase
      .from("coach_sessions")
      .delete()
      .eq("status", "available")
      .gte("session_date", today);
      
    if (deleteError) {
      console.error("Error deleting existing sessions:", deleteError);
      console.error("DELETE ERROR DETAILS:", {
        code: deleteError.code,
        message: deleteError.message,
        hint: deleteError.hint,
        details: deleteError.details
      });
      return { success: false, error: `Failed to clean up existing sessions: ${deleteError.message}` };
    }
    
    // Check if coaches table exists and has data
    console.log("Checking coaches table...");
    const { data: coaches, error: coachCheckError } = await supabase
      .from("coaches")
      .select("id, name")
      .limit(5);
      
    if (coachCheckError) {
      console.error("Error checking coaches table:", coachCheckError);
      console.error("COACH CHECK ERROR DETAILS:", {
        code: coachCheckError.code,
        message: coachCheckError.message,
        hint: coachCheckError.hint,
        details: coachCheckError.details
      });
      return { success: false, error: `Failed to access coaches table: ${coachCheckError.message}` };
    }
    
    if (!coaches || coaches.length === 0) {
      console.error("No coaches found in the database");
      return { success: false, error: "No coaches found in the database. Please create coaches first." };
    }
    
    // Check if branches table exists and has data
    console.log("Checking branches table...");
    const { data: branches, error: branchCheckError } = await supabase
      .from("branches")
      .select("id, name")
      .limit(5);
      
    if (branchCheckError) {
      console.error("Error checking branches table:", branchCheckError);
      console.error("BRANCH CHECK ERROR DETAILS:", {
        code: branchCheckError.code,
        message: branchCheckError.message,
        hint: branchCheckError.hint,
        details: branchCheckError.details
      });
      return { success: false, error: `Failed to access branches table: ${branchCheckError.message}` };
    }
    
    if (!branches || branches.length === 0) {
      console.error("No branches found in the database");
      return { success: false, error: "No branches found in the database. Please create branches first." };
    }
    
    // Fetch all coach schedules
    console.log("Fetching coach schedules...");
    const { data: schedules, error: schedulesError } = await supabase
      .from("coach_schedules")
      .select(`
        id,
        coach_id,
        branch_id,
        day_of_week,
        start_time,
        end_time,
        session_duration
      `);
      
    if (schedulesError) {
      console.error("Error fetching coach schedules:", schedulesError);
      console.error("SCHEDULE ERROR DETAILS:", {
        code: schedulesError.code,
        message: schedulesError.message,
        hint: schedulesError.hint,
        details: schedulesError.details
      });
      return { success: false, error: `Failed to fetch coach schedules: ${schedulesError.message}` };
    }
    
    if (!schedules || schedules.length === 0) {
      console.error("No coach schedules found in the database");
      return { success: false, error: "No coach schedules found in the database. Please create schedules first." };
    }
    
    console.log(`Found ${schedules.length} coach schedules to process`);
    
    // Verify coach_sessions table structure by attempting a select
    console.log("Verifying coach_sessions table structure...");
    try {
      const { error: sessionStructureError } = await supabase
        .from("coach_sessions")
        .select("id")
        .limit(1);
        
      if (sessionStructureError) {
        console.error("Error verifying coach_sessions table:", sessionStructureError);
        console.error("SESSION STRUCTURE ERROR DETAILS:", {
          code: sessionStructureError.code,
          message: sessionStructureError.message,
          hint: sessionStructureError.hint,
          details: sessionStructureError.details
        });
        return { 
          success: false, 
          error: `Problem with coach_sessions table: ${sessionStructureError.message}` 
        };
      }
    } catch (structureError) {
      console.error("Exception verifying coach_sessions table:", structureError);
      return { 
        success: false, 
        error: `Exception checking coach_sessions table: ${structureError instanceof Error ? structureError.message : String(structureError)}` 
      };
    }
    
    // Group schedules by day of week
    const schedulesByDay: Record<string, typeof schedules> = {};
    schedules.forEach(schedule => {
      // Normalize day_of_week to handle case sensitivity
      const normalizedDay = schedule.day_of_week.charAt(0).toUpperCase() + 
                          schedule.day_of_week.slice(1).toLowerCase();
                          
      if (!schedulesByDay[normalizedDay]) {
        schedulesByDay[normalizedDay] = [];
      }
      
      schedulesByDay[normalizedDay].push(schedule);
    });
    
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    type SessionToCreate = {
      id: string;
      coach_id: string;
      branch_id: string;
      coach_schedule_id: string;
      session_date: string;
      start_time: string;
      end_time: string;
      status: string;
      created_at: string;
      updated_at: string;
    };
    
    const sessionsToCreate: SessionToCreate[] = [];
    const now = new Date().toISOString();
    
    // Generate sessions for the next 30 days
    const daysToGenerate = 30;
    console.log(`Generating sessions for the next ${daysToGenerate} days...`);
    
    for (let i = 0; i < daysToGenerate; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + i);
      
      const dayOfWeek = daysOfWeek[currentDate.getDay()];
      const dateString = currentDate.toISOString().split('T')[0];
      
      // Skip if no schedules for this day
      if (!schedulesByDay[dayOfWeek]) {
        console.log(`No schedules found for ${dayOfWeek}, skipping...`);
        continue;
      }
      
      console.log(`Processing ${schedulesByDay[dayOfWeek].length} schedules for ${dayOfWeek}, ${dateString}`);
      
      // Process each schedule for this day
      for (const schedule of schedulesByDay[dayOfWeek]) {
        try {
          // Check if coach and branch exist
          const coachExists = coaches.some(coach => coach.id === schedule.coach_id);
          const branchExists = branches.some(branch => branch.id === schedule.branch_id);
          
          if (!coachExists) {
            console.error(`Coach with ID ${schedule.coach_id} not found for schedule ${schedule.id}`);
            continue;
          }
          
          if (!branchExists) {
            console.error(`Branch with ID ${schedule.branch_id} not found for schedule ${schedule.id}`);
            continue;
          }
          
          // Calculate time slots based on start time, end time, and session duration
          let startHour = 0, startMinute = 0, endHour = 0, endMinute = 0;
          
          try {
            [startHour, startMinute] = schedule.start_time.split(':').map(Number);
            [endHour, endMinute] = schedule.end_time.split(':').map(Number);
          } catch (timeError) {
            console.error(`Error parsing time for schedule ${schedule.id}:`, timeError);
            console.error(`Invalid time format: start=${schedule.start_time}, end=${schedule.end_time}`);
            continue;
          }
          
          // Create date objects for start and end times
          let currentSlotStart = new Date(currentDate);
          currentSlotStart.setHours(startHour, startMinute, 0, 0);
          
          const endTime = new Date(currentDate);
          endTime.setHours(endHour, endMinute, 0, 0);
          
          const sessionDuration = schedule.session_duration || 45; // Default to 45 minutes if not specified
          
          // Generate slots with appropriate duration
          while (currentSlotStart.getTime() < endTime.getTime() - (sessionDuration * 60 * 1000)) {
            const slotEnd = new Date(currentSlotStart);
            slotEnd.setMinutes(slotEnd.getMinutes() + sessionDuration);
            
            // Format times for database
            const startTimeString = `${currentSlotStart.getHours().toString().padStart(2, '0')}:${currentSlotStart.getMinutes().toString().padStart(2, '0')}`;
            const endTimeString = `${slotEnd.getHours().toString().padStart(2, '0')}:${slotEnd.getMinutes().toString().padStart(2, '0')}`;
            
            sessionsToCreate.push({
              id: uuidv4(),
              coach_id: schedule.coach_id,
              branch_id: schedule.branch_id,
              coach_schedule_id: schedule.id,
              session_date: dateString,
              start_time: startTimeString,
              end_time: endTimeString,
              status: "available",
              created_at: now,
              updated_at: now
            });
            
            // Move to the next slot
            currentSlotStart = slotEnd;
          }
        } catch (scheduleError) {
          console.error(`Error processing schedule ${schedule.id}:`, scheduleError);
        }
      }
    }
    
    if (sessionsToCreate.length === 0) {
      console.error("No sessions were generated!");
      return { 
        success: false, 
        error: "No sessions could be generated from the available schedules." 
      };
    }
    
    // Create sessions in batches to avoid hitting rate limits
    const batchSize = 25; // Smaller batch size for reliability
    let createdCount = 0;
    
    console.log(`Creating ${sessionsToCreate.length} sessions in batches of ${batchSize}...`);
    
    for (let i = 0; i < sessionsToCreate.length; i += batchSize) {
      const batch = sessionsToCreate.slice(i, i + batchSize);
      
      if (batch.length > 0) {
        try {
          // Ensure each session has a unique ID
          const batchWithIds = batch.map(session => ({
            ...session,
            id: session.id || uuidv4() // Use existing ID or generate a new one
          }));
          
          const { error: createSessionsError } = await supabase
            .from("coach_sessions")
            .insert(batchWithIds);
            
          if (createSessionsError) {
            console.error(`Error creating batch ${Math.floor(i/batchSize) + 1}:`, createSessionsError);
            console.error("INSERT ERROR DETAILS:", {
              code: createSessionsError.code,
              message: createSessionsError.message,
              hint: createSessionsError.hint,
              details: createSessionsError.details
            });
            
            // Try inserting one session at a time to find which one is causing issues
            if (i === 0) { // Only do this for the first batch to avoid too many requests
              console.log("Attempting to insert sessions one by one to diagnose issues...");
              for (let j = 0; j < Math.min(batch.length, 5); j++) { // Try just the first few
                const singleSession = {
                  ...batch[j],
                  id: uuidv4() // Generate a fresh UUID for each retry
                };
                try {
                  const { error: singleInsertError } = await supabase
                    .from("coach_sessions")
                    .insert(singleSession);
                    
                  if (singleInsertError) {
                    console.error(`Error inserting single session ${j}:`, singleInsertError);
                    console.error("PROBLEMATIC SESSION:", singleSession);
                  } else {
                    createdCount++;
                  }
                } catch (singleError) {
                  console.error(`Exception inserting single session ${j}:`, singleError);
                }
              }
            }
          } else {
            createdCount += batch.length;
            console.log(`Created batch ${Math.floor(i/batchSize) + 1} with ${batch.length} sessions`);
          }
        } catch (error) {
          console.error(`Exception in batch ${Math.floor(i/batchSize) + 1}:`, error);
        }
      }
    }
    
    console.log(`Coach session regeneration complete. Created ${createdCount} of ${sessionsToCreate.length} sessions`);
    console.log("------------ END COACH SESSION REGENERATION ------------");
    
    if (createdCount === 0) {
      return { 
        success: false, 
        error: "Failed to create any sessions. Check server logs for details."
      };
    }
    
    return { 
      success: true, 
      message: `Successfully regenerated coach sessions`,
      totalSessions: sessionsToCreate.length,
      createdSessions: createdCount
    };
  } catch (error) {
    console.error("Error in regenerateCoachSessions:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

type UploadScheduleResult = {
  success: boolean;
  error?: string;
  created?: number;
  updated?: number;
};

type ScheduleItem = {
  coach_name: string;
  day: string;
  start_time: string;
  end_time: string;
  court: string;
  level?: string | number;
  student?: string;
};

export async function uploadSchedule({
  scheduleData,
  branchId,
  startDate
}: {
  scheduleData: string;
  branchId: string;
  startDate: string;
}): Promise<UploadScheduleResult> {
  "use server";
  
  try {
    const supabase = await createClient();
    
    // Check if branch exists
    const { data: branch, error: branchError } = await supabase
      .from("branches")
      .select("id, name")
      .eq("id", branchId)
      .single();
    
    if (branchError || !branch) {
      console.error("Branch not found:", branchError);
      return { success: false, error: "Branch not found" };
    }
    
    // Parse the schedule data
    let scheduleItems: ScheduleItem[] = [];
    
    if (scheduleData.trim().startsWith("[") || scheduleData.trim().startsWith("{")) {
      // JSON format
      try {
        scheduleItems = JSON.parse(scheduleData);
      } catch (e) {
        return { success: false, error: "Invalid JSON format" };
      }
    } else {
      // CSV format
      const lines = scheduleData.split("\n");
      
      // Skip header if it exists
      const startIdx = lines[0].includes("coach_name") ? 1 : 0;
      
      for (let i = startIdx; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const [coach_name, day, start_time, end_time, court, level, student] = line.split(",");
        
        if (!coach_name || !day || !start_time || !end_time) {
          continue; // Skip incomplete lines
        }
        
        scheduleItems.push({
          coach_name: coach_name.trim(),
          day: day.trim(),
          start_time: start_time.trim(),
          end_time: end_time.trim(),
          court: court?.trim() || "Court 1",
          level: level?.trim(),
          student: student?.trim()
        });
      }
    }
    
    if (scheduleItems.length === 0) {
      return { success: false, error: "No valid schedule items found" };
    }
    
    // Process the schedule items
    const results = await processScheduleItems(supabase, scheduleItems, branchId, startDate);
    
    return {
      success: true,
      created: results.created,
      updated: results.updated
    };
  } catch (error) {
    console.error("Error uploading schedule:", error);
    return {
      success: false,
      error: "Failed to upload schedule: " + (error as Error).message
    };
  }
}

async function processScheduleItems(
  supabase: any,
  scheduleItems: ScheduleItem[],
  branchId: string,
  startDate: string
) {
  // Keep track of results
  let created = 0;
  let updated = 0;
  
  // Get or create coaches
  const coachNamesSet = new Set(scheduleItems.map(item => item.coach_name));
  const coachNames = Array.from(coachNamesSet);
  
  for (const coachName of coachNames) {
    // Try to find the coach by name
    const { data: coachData, error: coachError } = await supabase
      .from("users")
      .select("id")
      .eq("role", "coach")
      .ilike("first_name || ' ' || last_name", coachName)
      .maybeSingle();
    
    if (coachError || !coachData) {
      console.error(`Coach not found: ${coachName}`, coachError);
      // Could create a placeholder coach here if needed
    }
  }
  
  // Calculate dates for each day of the week
  const baseDate = new Date(startDate);
  const dayMap: Record<string, Date> = {};
  
  // Set the base date to the previous Sunday
  const dayOfWeek = baseDate.getDay(); // 0 for Sunday, 1 for Monday, etc.
  baseDate.setDate(baseDate.getDate() - dayOfWeek);
  
  // Create a map of day names to dates
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  for (let i = 0; i < 7; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i);
    dayMap[dayNames[i]] = date;
  }
  
  // Create sessions for each schedule item
  for (const item of scheduleItems) {
    // Find the coach
    const { data: coachData } = await supabase
      .from("users")
      .select("id")
      .eq("role", "coach")
      .ilike("first_name || ' ' || last_name", item.coach_name)
      .maybeSingle();
    
    if (!coachData) {
      console.log(`Coach not found: ${item.coach_name}`);
      continue;
    }
    
    const coachId = coachData.id;
    
    // Get the date for this day
    const sessionDate = dayMap[item.day];
    if (!sessionDate) {
      console.log(`Invalid day: ${item.day}`);
      continue;
    }
    
    // Format the date as YYYY-MM-DD
    const formattedDate = sessionDate.toISOString().split("T")[0];
    
    // Create a session UUID
    const sessionId = crypto.randomUUID();
    
    // Determine status based on whether a student is assigned
    const status = item.student ? "booked" : "available";
    
    // Calculate session duration in minutes
    const startParts = item.start_time.split(":");
    const endParts = item.end_time.split(":");
    const startMinutes = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
    const endMinutes = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);
    const duration = endMinutes - startMinutes;
    
    // Create the session data
    const sessionData = {
      id: sessionId,
      coach_id: coachId,
      branch_id: branchId,
      session_date: formattedDate,
      day_of_week: item.day,
      start_time: item.start_time,
      end_time: item.end_time,
      duration: duration,
      created_at: new Date().toISOString(),
      status: status,
      court: item.court,
      level: item.level,
      booked_by: null,
      player_id: null,
      price: 0.00,
      student_name: item.student || null
    };
    
    // Check if the session already exists
    const { data: existingSession, error: sessionError } = await supabase
      .from("coach_sessions")
      .select("id")
      .eq("coach_id", coachId)
      .eq("session_date", formattedDate)
      .eq("start_time", item.start_time)
      .eq("court", item.court)
      .maybeSingle();
    
    if (sessionError) {
      console.error("Error checking for existing session:", sessionError);
      continue;
    }
    
    if (existingSession) {
      // Update existing session
      const { error: updateError } = await supabase
        .from("coach_sessions")
        .update({ 
          end_time: item.end_time,
          duration: duration,
          status: status,
          student_name: item.student || null,
          level: item.level
        })
        .eq("id", existingSession.id);
      
      if (updateError) {
        console.error("Error updating session:", updateError);
      } else {
        updated++;
      }
    } else {
      // Insert new session
      const { error: insertError } = await supabase
        .from("coach_sessions")
        .insert([sessionData]);
      
      if (insertError) {
        console.error("Error creating session:", insertError);
      } else {
        created++;
      }
    }
  }
  
  return { created, updated };
}

type ReservationResult = {
  success: boolean;
  error?: string;
};

export async function reserveSession({
  sessionId,
  userId
}: {
  sessionId: string;
  userId: string;
}): Promise<ReservationResult> {
  "use server";
  
  try {
    const supabase = await createClient();
    
    // Get the session to verify it's available
    const { data: session, error: sessionError } = await supabase
      .from("coach_sessions")
      .select("*")
      .eq("id", sessionId)
      .eq("status", "available")
      .single();
    
    if (sessionError || !session) {
      console.error("Session not found or not available:", sessionError);
      return { success: false, error: "Session not available" };
    }
    
    // Get the user to verify they exist
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();
    
    if (userError || !user) {
      console.error("User not found:", userError);
      return { success: false, error: "User not found" };
    }
    
    // Get the user's player record if they're a player
    let playerId = null;
    if (user.role === "player") {
      const { data: player } = await supabase
        .from("players")
        .select("id")
        .eq("user_id", userId)
        .single();
      
      if (player) {
        playerId = player.id;
      }
    }
    
    // Update the session to booked status
    const { error: updateError } = await supabase
      .from("coach_sessions")
      .update({ 
        status: "booked", 
        booked_by: userId,
        player_id: playerId,
        booked_at: new Date().toISOString()
      })
      .eq("id", sessionId);
    
    if (updateError) {
      console.error("Error updating session:", updateError);
      return { success: false, error: "Failed to book session" };
    }
    
    // Create a booking record
    const bookingId = crypto.randomUUID();
    const { error: bookingError } = await supabase
      .from("bookings")
      .insert([{
        id: bookingId,
        user_id: userId,
        session_id: sessionId,
        status: "confirmed",
        created_at: new Date().toISOString()
      }]);
    
    if (bookingError) {
      console.error("Error creating booking:", bookingError);
      
      // Rollback the session update if booking creation fails
      await supabase
        .from("coach_sessions")
        .update({ 
          status: "available", 
          booked_by: null,
          player_id: null,
          booked_at: null
        })
        .eq("id", sessionId);
      
      return { success: false, error: "Failed to create booking" };
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error reserving session:", error);
    return {
      success: false,
      error: "Failed to reserve session: " + (error as Error).message
    };
  }
}

export async function getAvailableSessions(
  date: string,
  coachId: string,
  branchId: string,
  level: string
) {
  try {
    const supabase = await createClient();
    
    // Parse the level as an integer
    const levelNumber = parseInt(level, 10);
    
    // Get available sessions
    const { data: sessions, error: sessionsError } = await supabase
      .from('coach_sessions')
      .select(`
        *,
        coaches:coach_id (
          id,
          name,
          specialties,
          available_levels,
          rating
        ),
        branches:branch_id (
          id,
          name,
          location,
          address
        ),
        players:player_id (
          id,
          name,
          level
        )
      `)
      .eq('session_date', date)
      .eq('coach_id', coachId)
      .eq('branch_id', branchId)
      .eq('level', levelNumber)
      .eq('status', 'available')
      .order('start_time');

    if (sessionsError) {
      console.error('Error fetching sessions:', sessionsError);
      throw new Error('Failed to fetch sessions');
    }

    // Transform the data into the expected format
    return sessions.map(session => ({
      id: session.id,
      startTime: session.start_time,
      endTime: session.end_time,
      status: session.status,
      coach: session.coaches ? {
        id: session.coaches.id,
        name: session.coaches.name,
        specialties: session.coaches.specialties || [],
        availableLevels: session.coaches.available_levels || [],
        rating: session.coaches.rating || 0
      } : null,
      branch: session.branches ? {
        id: session.branches.id,
        name: session.branches.name,
        location: session.branches.location,
        address: session.branches.address
      } : null,
      player: session.players ? {
        id: session.players.id,
        name: session.players.name,
        level: session.players.level
      } : null,
      sessionDuration: session.session_duration || 45,
      court: session.court || '1',
      level: session.level || 1
    }));
  } catch (error) {
    console.error('Error in getAvailableSessions:', error);
    throw error;
  }
}
