import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Refreshes the Supabase Auth session on every request and writes the
// refreshed cookies to both the request (for Server Components) and the
// response (for the browser).
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  // Always create a new client per request; never store it in a global.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
          // Cache headers stop CDNs from caching a response that carries a session.
          Object.entries(headers).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value)
          )
        },
      },
    }
  )

  // Do not run code between createServerClient and getClaims(), or users
  // may be randomly logged out. Use getClaims() (verifies the JWT), never
  // getSession(), when trusting the user on the server.
  await supabase.auth.getClaims()

  // TODO: redirect unauthenticated users to /login once the login page exists.

  // Return supabaseResponse as-is. If you build a new response, copy its
  // cookies over, or the browser and server sessions will drift apart.
  return supabaseResponse
}
