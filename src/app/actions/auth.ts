"use server";

import { createClient, createAdminClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  redirect("/");
}

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { message: "Check your email to confirm your account" };
}

export async function signOut() {
  const supabase = await createClient();
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
      return { error: error.message };
    }
    
    // Clear any local storage or cookies if needed
    revalidatePath("/", "layout");
    return redirect("/");
  } catch (error) {
    console.error("Error during sign out:", error);
    return { error: "Failed to sign out" };
  }
}

export async function fetchUserData() {
  const supabase = await createClient();
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
    console.error("Error fetching session in fetchUserData:", sessionError);
    return { user: null, session: null };
  }

  const { data: user, error: userError } = await supabase.auth.getUser();

  if (userError) {
     console.error("Error fetching user in fetchUserData:", userError);
     return { user: null, session };
  }

  return { user: user, session: session };
}

export async function getSession() {
  const supabase = await createClient();
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

export async function getUser() {
  const supabase = await createClient();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error("Error getting user:", error);
    return null;
  }
}

export async function getUserProfile() {
  const supabase = await createClient();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    return profile;
  } catch (error) {
    console.error("Error getting user profile:", error);
    return null;
  }
}

export async function updateUserProfile(formData: FormData) {
  const supabase = await createClient();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No user found");

    const updates = {
      id: user.id,
      full_name: formData.get("full_name") as string,
      phone: formData.get("phone") as string,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("profiles")
      .upsert(updates);

    if (error) throw error;

    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { error: "Failed to update profile" };
  }
}

export async function updateUserAvatar(formData: FormData) {
  const supabase = await createClient();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No user found");

    const file = formData.get("avatar") as File;
    if (!file) throw new Error("No file uploaded");

    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", user.id);

    if (updateError) throw updateError;

    revalidatePath("/profile");
    return { success: true, avatarUrl: publicUrl };
  } catch (error) {
    console.error("Error updating avatar:", error);
    return { error: "Failed to update avatar" };
  }
}

export async function getAdminStats() {
  const supabase = await createAdminClient();
  try {
    const [
      { count: totalUsers },
      { count: totalSessions },
      { count: totalBookings },
      { count: totalPayments }
    ] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("sessions").select("*", { count: "exact", head: true }),
      supabase.from("bookings").select("*", { count: "exact", head: true }),
      supabase.from("payments").select("*", { count: "exact", head: true })
    ]);

    return {
      totalUsers,
      totalSessions,
      totalBookings,
      totalPayments
    };
  } catch (error) {
    console.error("Error getting admin stats:", error);
    return null;
  }
} 