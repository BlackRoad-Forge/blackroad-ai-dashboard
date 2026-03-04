import { NextRequest, NextResponse } from 'next/server'
import { stripe, PLANS, type PlanId } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe is not configured. Set STRIPE_SECRET_KEY in environment.' },
      { status: 503 }
    )
  }

  try {
    const body = await request.json()
    const { planId, customerEmail } = body as {
      planId: PlanId
      customerEmail?: string
    }

    if (!planId || !(planId in PLANS)) {
      return NextResponse.json(
        { error: `Invalid plan. Choose: ${Object.keys(PLANS).join(', ')}` },
        { status: 400 }
      )
    }

    const plan = PLANS[planId]

    if (!plan.priceId) {
      return NextResponse.json(
        { error: 'Free plan does not require checkout' },
        { status: 400 }
      )
    }

    const origin = request.headers.get('origin') || 'http://localhost:3030'

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      ...(customerEmail ? { customer_email: customerEmail } : {}),
      success_url: `${origin}/?session_id={CHECKOUT_SESSION_ID}&plan=${planId}`,
      cancel_url: `${origin}/?canceled=true`,
      metadata: {
        planId,
      },
    })

    return NextResponse.json({ url: session.url, sessionId: session.id })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Checkout failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
