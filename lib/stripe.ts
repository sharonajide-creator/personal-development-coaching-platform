// Phase 3 — Stripe helper (lazy init; null when keys absent so local dev
// without Stripe still builds and runs — booking flow reports "payments off").

import Stripe from "stripe";

const globalForStripe = globalThis as unknown as { stripe?: Stripe | null };

export function getStripe(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  if (globalForStripe.stripe === undefined) {
    globalForStripe.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return globalForStripe.stripe;
}

export function isPaymentsEnabled(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}
