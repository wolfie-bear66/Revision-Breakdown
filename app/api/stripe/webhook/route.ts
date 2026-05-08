import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
})

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

function generateStudentCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // omits 0/O/1/I to avoid confusion
  const segment = (n: number) =>
    Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `RB-${segment(4)}-${segment(4)}`
}

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error('Webhook signature error:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const parentEmail = session.customer_details?.email
    const stripeCustomerId = session.customer as string

    if (!parentEmail) {
      console.error('No email on Stripe session')
      return NextResponse.json({ error: 'No email' }, { status: 400 })
    }

    try {
      const supabase = createAdminClient()
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

      // 1. Create parent auth account via invite link (auto-sends invite email with set-password link)
      let parentAuthId: string

      const { data: inviteData, error: inviteError } = await supabase.auth.admin.generateLink({
        type: 'invite',
        email: parentEmail,
        // Supabase PKCE flow: redirect to /auth/callback which exchanges the code,
        // then forwards to /set-password
        options: { redirectTo: `${siteUrl}/auth/callback?next=/set-password` },
      })

      if (inviteError) {
        // Account already exists — look it up from our users table by email
        const { data: existingParent, error: lookupError } = await supabase
          .from('users')
          .select('id')
          .eq('email', parentEmail)
          .eq('role', 'parent')
          .single()

        if (lookupError || !existingParent) {
          throw new Error(`Cannot create or find parent account: ${inviteError.message}`)
        }
        parentAuthId = existingParent.id
      } else {
        parentAuthId = inviteData.user.id
      }

      // 2. Upsert parent row in public.users
      await supabase.from('users').upsert({
        id: parentAuthId,
        email: parentEmail,
        role: 'parent',
        subscription_status: 'active',
        stripe_customer_id: stripeCustomerId,
        onboarding_complete: true,
      }, { onConflict: 'id' })

      // 3. Generate unique student access code
      let studentCode = generateStudentCode()
      for (let i = 0; i < 10; i++) {
        const { data: existing } = await supabase
          .from('student_codes')
          .select('id')
          .eq('code', studentCode)
          .single()
        if (!existing) break
        studentCode = generateStudentCode()
      }

      // 4. Create student auth account with a generated internal email (students never see this)
      const studentFakeEmail = `student-${studentCode.toLowerCase().replace(/-/g, '')}@rb-internal.app`
      const studentPassword = crypto.randomUUID()

      const { data: studentAuthData, error: studentAuthError } =
        await supabase.auth.admin.createUser({
          email: studentFakeEmail,
          password: studentPassword,
          email_confirm: true,
          user_metadata: { role: 'student' },
        })

      if (studentAuthError) throw studentAuthError
      const studentAuthId = studentAuthData.user.id

      // 5. Create student row in public.users
      await supabase.from('users').insert({
        id: studentAuthId,
        role: 'student',
        subscription_status: 'active',
        parent_id: parentAuthId,
        student_code: studentCode,
        onboarding_complete: false,
      })

      // 6. Store code in lookup table (keyed to stripe session so /payment-success can retrieve it)
      await supabase.from('student_codes').insert({
        code: studentCode,
        student_user_id: studentAuthId,
        parent_user_id: parentAuthId,
        stripe_session_id: session.id,
      })

      console.log(`✓ Fulfilment complete for ${parentEmail}, student code: ${studentCode}`)
      return NextResponse.json({ success: true })
    } catch (err: any) {
      console.error('Webhook fulfilment error:', err)
      return NextResponse.json({ error: err.message }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}
