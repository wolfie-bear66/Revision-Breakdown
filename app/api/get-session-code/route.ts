import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get('session_id')

  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('student_codes')
    .select('code, parent_user_id')
    .eq('stripe_session_id', sessionId)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Code not found' }, { status: 404 })
  }

  // Look up parent email for the resend-email UI
  const { data: parentRow } = await supabase
    .from('users')
    .select('email')
    .eq('id', data.parent_user_id)
    .single()

  return NextResponse.json({ code: data.code, parentEmail: parentRow?.email ?? null })
}
