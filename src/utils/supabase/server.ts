"use server";

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'

export const createClient = () => {
  const cookieStore = cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `cookies().set()` method was called from a Server Component. Cookies can only be set
            // from a Server Action or Route Handler. This error message should be handled in a
            // production app with something like system logging or error reporting.
            console.warn('Error setting cookie:', error)
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options, maxAge: -1 })
          } catch (error) {
            // The `cookies().delete()` method was called from a Server Component. Cookies can only be
            // set from a Server Action or Route Handler. This error message should be handled in a
            // production app with something like system logging or error reporting.
            console.warn('Error removing cookie:', error)
          }
        },
      },
    }
  )
}

export const createAdminClient = () => {
  const cookieStore = cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `cookies().set()` method was called from a Server Component. Cookies can only be
            // set from a Server Action or Route Handler. This error message should be handled in a
            // production app with something like system logging or error reporting.
            console.warn('Error setting cookie:', error)
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options, maxAge: -1 })
          } catch (error) {
            // The `cookies().delete()` method was called from a Server Component. Cookies can only be
            // set from a Server Action or Route Handler. This error message should be handled in a
            // production app with something like system logging or error reporting.
            console.warn('Error removing cookie:', error)
          }
        },
      },
    }
  )
} 