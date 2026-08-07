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

const PLAN_ENV_KEYS: Record<
  string,
  { live: string; test: string }
> = {
  starter: {
    live: "STRIPE_STARTER_PRICE_ID",
    test: "STRIPE_TEST_STARTER_PRICE_ID",
  },
  pro: {
    live: "STRIPE_PRO_PRICE_ID",
    test: "STRIPE_TEST_PRO_PRICE_ID",
  },
  enterprise: {
    live: "STRIPE_ENTERPRISE_PRICE_ID",
    test: "STRIPE_TEST_ENTERPRISE_PRICE_ID",
  },
  church: {
    live: "STRIPE_CHURCH_STARTER_PRICE_ID",
    test: "STRIPE_TEST_CHURCH_STARTER_PRICE_ID",
  },
}

export function getStripePlanPriceId(planId: string): string | undefined {
  const ids = getStripePriceIds()
  switch (planId) {
    case "starter":
      return ids.starter
    case "pro":
      return ids.pro
    case "enterprise":
      return ids.enterprise
    case "church":
      return ids.church
    default:
      return undefined
  }
}

export function getMissingStripePlanEnvVar(planId: string): string | undefined {
  const keys = PLAN_ENV_KEYS[planId]
  if (!keys) return undefined
  return isLiveMode() ? keys.live : keys.test
}

export function validateStripePlanConfigured(planId: string):
  | { ok: true; priceId: string }
  | { ok: false; error: string; code: string } {
  const priceId = getStripePlanPriceId(planId)
  if (priceId) {
    return { ok: true, priceId }
  }

  const envVar = getMissingStripePlanEnvVar(planId)
  const mode = isLiveMode() ? "ON (production)" : "OFF (test/staging)"
  return {
    ok: false,
    code: "STRIPE_PLAN_PRICE_NOT_CONFIGURED",
    error: envVar
      ? `Stripe price is not configured for plan "${planId}" with LIVE_MODE=${mode}. Set ${envVar} in Railway and redeploy.`
      : `Unknown plan "${planId}".`,
  }
}

export type BetterAuthStripePlan = {
  name: string
  priceId: string
  limits: { websites: number; messages: number; storage: number }
  freeTrial?: { days: number }
}

/** Plans registered with Better Auth — only includes plans that have a price ID configured. */
export function buildBetterAuthStripePlans(): BetterAuthStripePlan[] {
  const ids = getStripePriceIds()
  const plans: BetterAuthStripePlan[] = []

  if (ids.starter) {
    plans.push({
      name: "starter",
      priceId: ids.starter,
      limits: { websites: 1, messages: 100, storage: 10 },
      freeTrial: { days: 14 },
    })
  }

  if (ids.pro) {
    plans.push({
      name: "pro",
      priceId: ids.pro,
      limits: { websites: 3, messages: 330, storage: 50 },
      freeTrial: { days: 14 },
    })
  }

  if (ids.enterprise) {
    plans.push({
      name: "enterprise",
      priceId: ids.enterprise,
      limits: { websites: -1, messages: -1, storage: 1000 },
    })
  }

  if (ids.church) {
    plans.push({
      name: "church",
      priceId: ids.church,
      limits: { websites: 1, messages: 100, storage: 10 },
      freeTrial: { days: 14 },
    })
  }

  return plans
}

export function getPublicChurchStripePriceId(): string | undefined {
  if (isLiveMode()) {
    return (
      process.env.NEXT_PUBLIC_STRIPE_CHURCH_STARTER_PRICE_ID?.trim() ||
      process.env.STRIPE_CHURCH_STARTER_PRICE_ID?.trim() ||
      undefined
    )
  }
  return (
    process.env.NEXT_PUBLIC_STRIPE_TEST_CHURCH_STARTER_PRICE_ID?.trim() ||
    // Server-side: allow non-public env (not bundled into the client)
    (typeof window === "undefined"
      ? process.env.STRIPE_TEST_CHURCH_STARTER_PRICE_ID?.trim()
      : undefined) ||
    undefined
  )
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
