import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/set-password'
  const error = searchParams.get('error')

  console.log('Auth callback:', { hasCode: !!code, next, error })

  // Supabase sent an explicit error
  if (error) {
    console.error('Auth callback — error from Supabase:', error)
    return NextResponse.redirect(
      new URL(`/login?error=auth_callback_failed&reason=${encodeURIComponent(error)}`, origin)
    )
  }

  // PKCE flow — exchange the one-time code for a session
  if (code) {
    const supabase = await createClient()
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (!exchangeError) {
      console.log('Auth callback: PKCE code exchanged, redirecting to', next)
      return NextResponse.redirect(new URL(next, origin))
    }

    console.error('Auth callback: PKCE exchange failed:', exchangeError.message)
  }

  // Implicit flow — no code, so #access_token is in the URL hash.
  // The server never sees hash fragments, but browsers preserve them across
  // server-side redirects. /auth/confirm reads window.location.hash and calls setSession().
  console.log('Auth callback: no code, sending to /auth/confirm for implicit flow')
  const confirmUrl = new URL('/auth/confirm', origin)
  confirmUrl.searchParams.set('next', next)
  return NextResponse.redirect(confirmUrl)
}
