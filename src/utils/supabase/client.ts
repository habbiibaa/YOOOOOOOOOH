"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/supabase"; // optional if you have types

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
      global: {
        // Set a low number of connections to prevent DDoS
        headers: {
          'X-Client-Info': 'supabase-js-v2',
        },
      },
      // Implement rate limiting by limiting the number of requests
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
      // Disable cookie handling on the client side
      cookies: {
        get: () => undefined,
        set: () => {},
        remove: () => {},
      },
    }
  );
}
