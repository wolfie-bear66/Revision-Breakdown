import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function POST(req: Request) {
  const { code } = await req.json()

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 })
  }

  // Keep dashes for the DB lookup — codes are stored as RB-XXXX-XXXX
  const normalised = code.trim().toUpperCase()
  // Strip dashes only for the internal fake email
  const codeNoDashes = normalised.replace(/-/g, '')
  const studentFakeEmail = `student-${codeNoDashes.toLowerCase()}@rb-internal.app`

  console.log('Student login attempt:', { normalised, codeNoDashes, studentFakeEmail })

  // 1. Verify the code exists
  const { data: codeRow, error: codeError } = await supabaseAdmin
    .from('student_codes')
    .select('code, student_user_id')
    .eq('code', normalised)
    .single()

  console.log('Code lookup result:', { codeRow, error: codeError })

  if (codeError || !codeRow) {
    return NextResponse.json(
      { error: 'Access code not found. Check the code and try again.' },
      { status: 404 }
    )
  }

  // 2. Generate a magic link OTP for the student's internal account
  const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email: studentFakeEmail,
  })

  if (linkError || !linkData?.properties?.email_otp) {
    console.error('Generate link error:', linkError)
    return NextResponse.json({ error: 'Failed to generate login token' }, { status: 500 })
  }

  // 3. Verify the OTP server-side using an anon client — avoids magic-link redirect
  //    chain and works regardless of whether the project uses PKCE or implicit flow.
  const supabaseAnon = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const { data: sessionData, error: verifyError } = await supabaseAnon.auth.verifyOtp({
    email: studentFakeEmail,
    token: linkData.properties.email_otp,
    type: 'magiclink',
  })

  console.log('OTP verify result:', { session: !!sessionData?.session, error: verifyError })

  if (verifyError || !sessionData?.session) {
    console.error('OTP verify error:', verifyError)
    return NextResponse.json({ error: 'Failed to establish session' }, { status: 500 })
  }

  // Return tokens for the client to call setSession() — no redirect chain needed
  return NextResponse.json({
    accessToken: sessionData.session.access_token,
    refreshToken: sessionData.session.refresh_token,
  })
}
