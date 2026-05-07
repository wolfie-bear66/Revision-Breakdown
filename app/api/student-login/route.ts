import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function POST(req: Request) {
  const { code } = await req.json()

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 })
  }

  const normalised = code.trim().toUpperCase()

  const { data: codeRow, error } = await supabase
    .from('student_codes')
    .select('code, student_user_id')
    .eq('code', normalised)
    .single()

  if (error || !codeRow) {
    return NextResponse.json(
      { error: 'Access code not found. Check the code and try again.' },
      { status: 404 }
    )
  }

  // Derive the internal email from the code (must match what the webhook set)
  const studentFakeEmail = `student-${normalised.toLowerCase().replace(/-/g, '')}@rb-internal.app`

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email: studentFakeEmail,
    options: { redirectTo: `${siteUrl}/dashboard` },
  })

  if (linkError || !linkData?.properties?.action_link) {
    console.error('Magic link error:', linkError)
    return NextResponse.json({ error: 'Failed to generate login link' }, { status: 500 })
  }

  return NextResponse.json({ loginUrl: linkData.properties.action_link })
}
