import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

// Stripe sends raw body, so we need to handle it
export async function POST(request: NextRequest) {
  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe not configured' },
      { status: 503 }
    )
  }

  const sig = request.headers.get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!sig || !webhookSecret) {
    return NextResponse.json(
      { error: 'Missing signature or webhook secret' },
      { status: 400 }
    )
  }

  let event

  try {
    const body = await request.text()
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook verification failed'
    console.error(`Webhook signature verification failed: ${message}`)
    return NextResponse.json({ error: message }, { status: 400 })
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object
      console.log(`Checkout completed: ${session.id}`)
      console.log(`Customer: ${session.customer}`)
      console.log(`Plan: ${session.metadata?.planId}`)
      // TODO: Provision user access based on plan
      // Store subscription info in your database
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object
      console.log(`Subscription updated: ${subscription.id}`)
      console.log(`Status: ${subscription.status}`)
      // TODO: Update user access level
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object
      console.log(`Subscription cancelled: ${subscription.id}`)
      // TODO: Downgrade user to free plan
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object
      console.log(`Payment failed for invoice: ${invoice.id}`)
      // TODO: Notify user, possibly restrict access
      break
    }

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
