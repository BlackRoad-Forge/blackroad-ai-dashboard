import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY not set - Stripe features will be disabled')
}

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' })
  : null

// Stripe price IDs - configure in environment
export const PLANS = {
  free: {
    name: 'Free',
    priceId: null,
    price: 0,
    agents: 1,
    messagesPerDay: 10,
    features: ['1 agent access', '10 messages/day', 'Community support'],
  },
  pro: {
    name: 'Pro',
    priceId: process.env.STRIPE_PRO_PRICE_ID || '',
    price: 19,
    agents: 5,
    messagesPerDay: 500,
    features: ['5 agent access', '500 messages/day', 'Priority support', 'API access'],
  },
  enterprise: {
    name: 'Enterprise',
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || '',
    price: 49,
    agents: 9,
    messagesPerDay: -1, // unlimited
    features: ['All 9 agents', 'Unlimited messages', 'Dedicated support', 'Custom models', 'SLA guarantee'],
  },
} as const

export type PlanId = keyof typeof PLANS
