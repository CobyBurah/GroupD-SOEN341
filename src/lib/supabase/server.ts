import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Supabase client for Server Components, Server Actions and Route Handlers.
// Create a new one per request — it reads the session from that request's cookies.
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // setAll was called from a Server Component, which can't write cookies.
            // Safe to ignore: src/proxy.ts refreshes the session on every request.
          }
        },
      },
    }
  )
}
