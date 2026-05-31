export const CHURCH_PLAN_ID = "church" as const

export const CHURCH_INTRO_PRICE_AMOUNT = 7.99

/**
 * Church / hosted-page Stripe price ID.
 * Server: STRIPE_CHURCH_STARTER_PRICE_ID
 * Client (onboarding, pricing UI): NEXT_PUBLIC_STRIPE_CHURCH_STARTER_PRICE_ID — required for the card to show in the browser.
 */
export function getChurchStripePriceId(): string | undefined {
  const id =
    process.env.STRIPE_CHURCH_STARTER_PRICE_ID?.trim() ||
    process.env.NEXT_PUBLIC_STRIPE_CHURCH_STARTER_PRICE_ID?.trim()
  return id || undefined
}

export function isChurchPlanEnabled(): boolean {
  return Boolean(getChurchStripePriceId())
}

export function getChurchIntroPriceLabel(): string {
  return (
    process.env.NEXT_PUBLIC_CHURCH_INTRO_PRICE_LABEL?.trim() ||
    `$${CHURCH_INTRO_PRICE_AMOUNT.toFixed(2)}`
  )
}

export { CHURCH_PLAN_FEATURES } from "@/lib/plan-features"
