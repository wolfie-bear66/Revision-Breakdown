import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
});

export async function POST(request: Request) {
  const { priceId } = await request.json();

  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: currentUser, error: userError } = await supabase
    .from('users')
    .select('id, role, parent_id, stripe_customer_id, email')
    .eq('id', session.user.id)
    .single();

  if (userError || !currentUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  let billingUser = currentUser;

  if (currentUser.role === 'student' && currentUser.parent_id) {
    const { data: parentUser, error: parentError } = await supabase
      .from('users')
      .select('id, stripe_customer_id, email')
      .eq('id', currentUser.parent_id)
      .single();

    if (parentError || !parentUser) {
      return NextResponse.json({ error: 'Parent user not found' }, { status: 404 });
    }

    billingUser = parentUser;
  }

  let stripeCustomerId = billingUser.stripe_customer_id;

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: billingUser.email,
    });

    stripeCustomerId = customer.id;

    await supabase
      .from('users')
      .update({ stripe_customer_id: stripeCustomerId })
      .eq('id', billingUser.id);
  }

  const is6MonthPrice = priceId === process.env.STRIPE_PRICE_6MONTH;
  const mode: Stripe.Checkout.SessionCreateParams.Mode = is6MonthPrice
    ? 'subscription'
    : 'payment';

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    line_items: [{ price: priceId, quantity: 1 }],
    mode,
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/upgrade/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/upgrade`,
    metadata: {
      billing_user_id: billingUser.id,
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
