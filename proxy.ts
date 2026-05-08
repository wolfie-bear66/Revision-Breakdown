import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Routes anyone can access without being logged in
const PUBLIC_ROUTES = new Set([
  '/',
  '/login',
  '/signup',
  '/upgrade',
  '/upgrade/success',
  '/payment-success',
  '/set-password',
  '/auth',          // covers /auth/callback and any other Supabase auth redirects
  '/free',
  '/api/stripe/webhook',
  '/api/create-checkout-session',
  '/api/get-session-code',
  '/api/student-login',
  '/api/blocks',
  '/block',
])

function isPublic(pathname: string): boolean {
  if (PUBLIC_ROUTES.has(pathname)) return true
  for (const route of PUBLIC_ROUTES) {
    if (route !== '/' && pathname.startsWith(route + '/')) return true
  }
  return false
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Public routes: allow through, no checks needed
  if (isPublic(pathname)) {
    // If authenticated user hits /login or /signup, redirect to their home
    if (user && (pathname === '/login' || pathname === '/signup')) {
      const { data: profile } = await supabase
        .from('users')
        .select('role, onboarding_complete')
        .eq('id', user.id)
        .single()

      if (profile?.role === 'parent') {
        return NextResponse.redirect(new URL('/parent', request.url))
      }
      if (profile?.role === 'student') {
        const dest = profile?.onboarding_complete ? '/dashboard' : '/onboarding'
        return NextResponse.redirect(new URL(dest, request.url))
      }
      // No profile or unknown role — let them reach /login
    }

    return supabaseResponse
  }

  // Protected routes: must be logged in
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Role-based routing
  const { data: profile } = await supabase
    .from('users')
    .select('role, onboarding_complete')
    .eq('id', user.id)
    .single()

  const role = profile?.role

  // /parent requires parent role
  if (pathname.startsWith('/parent')) {
    if (role !== 'parent') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return supabaseResponse
  }

  // /dashboard and /onboarding require student role
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/onboarding')) {
    if (role !== 'student') {
      return NextResponse.redirect(new URL('/parent', request.url))
    }

    // Onboarding gate for students
    if (!profile?.onboarding_complete && pathname !== '/onboarding' && !pathname.startsWith('/onboarding/')) {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }
    if (profile?.onboarding_complete && (pathname === '/onboarding' || pathname.startsWith('/onboarding/'))) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return supabaseResponse
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
