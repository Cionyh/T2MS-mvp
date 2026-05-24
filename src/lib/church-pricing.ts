export const CHURCH_PLAN_ID = "church" as const

export function isChurchPlanEnabled(): boolean {
  return Boolean(process.env.STRIPE_CHURCH_STARTER_PRICE_ID?.trim())
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
