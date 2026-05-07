import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh the session (required to keep auth alive)
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  const requiresParent = pathname.startsWith('/parent')
  const requiresStudent =
    pathname.startsWith('/dashboard') || pathname.startsWith('/onboarding')

  if (requiresParent || requiresStudent) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Look up role from DB
    const { data: userRow } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = userRow?.role

    if (requiresParent && role !== 'parent') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    if (requiresStudent && role !== 'student') {
      return NextResponse.redirect(new URL('/parent', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/parent/:path*', '/dashboard/:path*', '/onboarding/:path*'],
}
