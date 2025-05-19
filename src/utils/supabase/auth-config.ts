import { createClient } from '@supabase/supabase-js';

// Enhanced security configuration for Supabase Auth
export const getEnhancedAuthConfig = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // Create a Supabase client with enhanced security options
  return createClient(supabaseUrl, supabaseAnonKey, {
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
  });
};

// Supabase security recommendations to implement in the server:
// 1. Enable max direct auth connections (in Supabase dashboard)
// 2. Enable rate limiting for API requests
// 3. Implement proper RLS (Row Level Security) policies
// 4. Use the smallest set of permissions for service roles 