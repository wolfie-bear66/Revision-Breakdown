import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

/**
 * Supabase Auth PKCE callback handler.
 *
 * Invite-email and magic-link flows redirect here:
 *   /auth/callback?code=<code>&next=/set-password
 *
 * We exchange the one-time code for a session, then send the user
 * to `next` (defaulting to /set-password for invite flows).
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/set-password'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }

    console.error('Auth callback error:', error.message)
  }

  // Something went wrong — send to login
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
