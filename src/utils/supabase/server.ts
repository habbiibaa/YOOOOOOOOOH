"use server";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/supabase"; // optional if you have types

export async function createClient() {
  const cookieStore = cookies();
  
  // Use createServerClient instead of createServerComponentClient
  // This is the recommended approach for Next.js 14+
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => {
          const cookie = cookieStore.get(name);
          return cookie?.value;
        },
        set: (name, value, options) => {
          cookieStore.set({ name, value, ...options });
        },
        remove: (name, options) => {
          cookieStore.set({ name, value: "", ...options, maxAge: 0 });
        },
      },
    }
  );
  
  return supabase;
}

/**
 * Helper function to safely cast the result of a Supabase query to a specific type
 * This helps TypeScript understand the type of the data
 * @param column The column name to use for the equality check
 * @param value The value to compare against
 * @returns A strongly typed value for use in Supabase queries
 */
export async function safeEq<T extends string>(column: T, value: string): Promise<[T, string]> {
  return [column, value] as [T, string];
}

/**
 * Helper function to safely cast the result of a Supabase selection to a specific type
 * @param data The data returned from Supabase
 * @param defaultValue A default value to return if data is null or undefined
 * @returns The data cast to the specified type or the default value
 */
export async function safeCast<T>(data: any, defaultValue: T): Promise<T> {
  return (data as T) || defaultValue;
}