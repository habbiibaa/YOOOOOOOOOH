"use server";

import { createServerSupabaseClient, createAdminSupabaseClient } from "./auth";
import type { Database } from "@/types/supabase";

// Regular database operations
export async function getCoachSessions() {
  const supabase = await createServerSupabaseClient();
  return supabase
    .from("coach_sessions")
    .select("*")
    .eq("status", "available")
    .order("session_date", { ascending: true });
}

export async function getCoachSchedules() {
  const supabase = await createServerSupabaseClient();
  return supabase
    .from("coach_schedules")
    .select("*")
    .order("day_of_week", { ascending: true });
}

export async function getBranches() {
  const supabase = await createServerSupabaseClient();
  return supabase
    .from("branches")
    .select("*")
    .order("name", { ascending: true });
}

// Admin database operations
export async function createCoachSession(data: any) {
  const supabase = await createAdminSupabaseClient();
  return supabase
    .from("coach_sessions")
    .insert(data)
    .select()
    .single();
}

export async function updateCoachSession(id: string, data: any) {
  const supabase = await createAdminSupabaseClient();
  return supabase
    .from("coach_sessions")
    .update(data)
    .eq("id", id)
    .select()
    .single();
}

export async function deleteCoachSession(id: string) {
  const supabase = await createAdminSupabaseClient();
  return supabase
    .from("coach_sessions")
    .delete()
    .eq("id", id);
} 