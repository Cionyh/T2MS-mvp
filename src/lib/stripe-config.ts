import Stripe from "stripe"

export type StripeRuntimeMode = "live" | "test"

function normalizeMode(raw: string | undefined): StripeRuntimeMode {
  return raw?.trim().toUpperCase() === "ON" ? "live" : "test"
}

/**
 * Runtime Stripe mode controlled by LIVE_MODE.
 * ON => existing production Stripe env vars (unchanged names).
 * OFF => STRIPE_TEST_* vars for staging / test checkout.
 */
export function getStripeMode(): StripeRuntimeMode {
  const serverMode = normalizeMode(process.env.LIVE_MODE)
  const publicMode = normalizeMode(process.env.NEXT_PUBLIC_LIVE_MODE)
  return typeof window === "undefined" ? serverMode : publicMode
}

export function isLiveMode(): boolean {
  return getStripeMode() === "live"
}

export function getStripeSecretKey(): string | undefined {
  if (isLiveMode()) {
    return process.env.STRIPE_SECRET_KEY?.trim() || undefined
  }
  return process.env.STRIPE_TEST_SECRET_KEY?.trim() || undefined
}

export function getStripeWebhookSecret(): string | undefined {
  if (isLiveMode()) {
    return process.env.STRIPE_WEBHOOK_SECRET?.trim() || undefined
  }
  return process.env.STRIPE_TEST_WEBHOOK_SECRET?.trim() || undefined
}

export function getStripePriceIds() {
  if (isLiveMode()) {
    return {
      starter: process.env.STRIPE_STARTER_PRICE_ID?.trim() || undefined,
      pro: process.env.STRIPE_PRO_PRICE_ID?.trim() || undefined,
      enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID?.trim() || undefined,
      church: process.env.STRIPE_CHURCH_STARTER_PRICE_ID?.trim() || undefined,
    }
  }

  return {
    starter: process.env.STRIPE_TEST_STARTER_PRICE_ID?.trim() || undefined,
    pro: process.env.STRIPE_TEST_PRO_PRICE_ID?.trim() || undefined,
    enterprise: process.env.STRIPE_TEST_ENTERPRISE_PRICE_ID?.trim() || undefined,
    church: process.env.STRIPE_TEST_CHURCH_STARTER_PRICE_ID?.trim() || undefined,
  }
}

export function getPublicChurchStripePriceId(): string | undefined {
  if (isLiveMode()) {
    return (
      process.env.NEXT_PUBLIC_STRIPE_CHURCH_STARTER_PRICE_ID?.trim() ||
      process.env.STRIPE_CHURCH_STARTER_PRICE_ID?.trim() ||
      undefined
    )
  }
  return process.env.NEXT_PUBLIC_STRIPE_TEST_CHURCH_STARTER_PRICE_ID?.trim() || undefined
}

export function getStripeServerClient(): Stripe {
  const key = getStripeSecretKey()
  if (!key) {
    throw new Error(
      `Stripe secret key is not configured for ${getStripeMode()} mode (LIVE_MODE=${
        process.env.LIVE_MODE ?? "OFF"
      }).`
    )
  }
  return new Stripe(key, { apiVersion: "2025-08-27.basil" })
}

export function tryGetStripeServerClient(): Stripe | null {
  const key = getStripeSecretKey()
  if (!key) return null
  return new Stripe(key, { apiVersion: "2025-08-27.basil" })
}
