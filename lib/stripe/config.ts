import Stripe from "stripe"

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set")
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
})

export const STRIPE_CONFIG = {
  priceId: process.env.STRIPE_PRICE_ID!, // Monthly subscription price ID
  successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
  cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?canceled=true`,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
}
