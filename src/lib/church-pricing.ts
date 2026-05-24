export const CHURCH_PLAN_ID = "church" as const

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
  return process.env.NEXT_PUBLIC_CHURCH_INTRO_PRICE_LABEL?.trim() || "$9.99"
}

export const CHURCH_PLAN_FEATURES = [
  "1 Hosted announcement page",
  "Shareable link (no widget install required)",
  "100 Messages per month",
  "Introductory church pricing",
  "14-Day Free Trial",
]
