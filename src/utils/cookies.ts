import { cookies } from 'next/headers';

// Safe cookies utility function to ensure cookies are always awaited properly
export async function getCookie(name: string): Promise<string | undefined> {
  const cookieStore = cookies();
  const cookie = cookieStore.get(name);
  return cookie?.value;
}

export async function getCookies(): Promise<{ name: string; value: string }[]> {
  const cookieStore = cookies();
  return cookieStore.getAll().map(({ name, value }) => ({ name, value }));
}

// Helper specifically for Supabase auth cookies
export async function getSupabaseAuthCookie(): Promise<string | undefined> {
  const cookieStore = cookies();
  // Look for any Supabase auth cookie (they start with 'sb-')
  const supabaseCookies = cookieStore.getAll().filter(cookie => 
    cookie.name.startsWith('sb-') && cookie.name.endsWith('-auth-token')
  );
  return supabaseCookies[0]?.value;
}