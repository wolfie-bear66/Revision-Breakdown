import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
})

export async function POST(req: Request) {
  const { priceId } = await req.json()

  if (!priceId) {
    return NextResponse.json({ error: 'Missing priceId' }, { status: 400 })
  }

  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    const is6Month = priceId === process.env.STRIPE_PRICE_6MONTH
    const mode: 'payment' | 'subscription' = is6Month ? 'subscription' : 'payment'

    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      mode,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${siteUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/upgrade`,
      allow_promotion_codes: true,
      payment_intent_data: mode === 'payment'
        ? { description: 'Revision Breakdown — Full Access' }
        : undefined,
    }

    // For one-time payments, always create a customer so the webhook has an email
    if (mode === 'payment') {
      sessionConfig.customer_creation = 'always'
    }

    const session = await stripe.checkout.sessions.create(sessionConfig)

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
