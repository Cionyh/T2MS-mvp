import { getPublicChurchStripePriceId, getStripePriceIds } from "@/lib/stripe-config"

export const CHURCH_PLAN_ID = "church" as const

export const CHURCH_INTRO_PRICE_AMOUNT = 7.99

/**
 * Church / hosted-page Stripe price ID (mode-aware via LIVE_MODE).
 * Live: STRIPE_CHURCH_STARTER_PRICE_ID / NEXT_PUBLIC_STRIPE_CHURCH_STARTER_PRICE_ID
 * Test: STRIPE_TEST_CHURCH_STARTER_PRICE_ID / NEXT_PUBLIC_STRIPE_TEST_CHURCH_STARTER_PRICE_ID
 */
export function getChurchStripePriceId(): string | undefined {
  const ids = getStripePriceIds()
  return ids.church || getPublicChurchStripePriceId()
}

export function isChurchPlanEnabled(): boolean {
  return Boolean(getChurchStripePriceId())
}

/**
 * Static fallback only when Stripe is unreachable.
 * Prefer `useChurchIntroPrice` / `/api/church/price` (Stripe unit_amount for
 * STRIPE_TEST_CHURCH_STARTER_PRICE_ID or STRIPE_CHURCH_STARTER_PRICE_ID).
 */
export function getChurchIntroPriceLabel(): string {
  return `$${CHURCH_INTRO_PRICE_AMOUNT.toFixed(2)}`
}

export { CHURCH_PLAN_FEATURES } from "@/lib/plan-features"
