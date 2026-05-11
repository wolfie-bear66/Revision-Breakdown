import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: 'No email' }, { status: 400 })

    const { origin: siteUrl } = new URL(req.url)

    // Generate a fresh set-password link
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: { redirectTo: `${siteUrl}/auth/callback?next=/set-password` },
    })

    if (linkError || !linkData?.properties?.action_link) {
      throw new Error(linkError?.message ?? 'Failed to generate link')
    }

    const setPasswordLink = linkData.properties.action_link

    // Get the student code for this parent
    const { data: parentRow } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .eq('role', 'parent')
      .single()

    if (!parentRow) return NextResponse.json({ error: 'Account not found' }, { status: 404 })

    const { data: codeRow } = await supabase
      .from('student_codes')
      .select('code')
      .eq('parent_user_id', parentRow.id)
      .single()

    const studentCode = codeRow?.code ?? 'Check your account dashboard'

    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: `Revision Breakdown <noreply@${process.env.RESEND_FROM_DOMAIN || 'resend.dev'}>`,
      to: email,
      subject: 'Your Revision Breakdown access — set your password',
      html: `
        <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px;">
          <h1 style="font-size: 24px; color: #111;">Set your password</h1>
          <p style="color: #555; margin-bottom: 16px;">Your child's access code is: <strong style="font-size: 20px; letter-spacing: 0.05em;">${studentCode}</strong></p>
          <a href="${setPasswordLink}" style="display: inline-block; background: #3dd9a4; color: #0e0e0e; font-weight: 700; padding: 14px 28px; border-radius: 99px; text-decoration: none;">
            Set my password →
          </a>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Resend email error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
