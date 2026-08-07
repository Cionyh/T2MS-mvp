import { unstable_cache } from "next/cache"
import {
  CHURCH_INTRO_PRICE_AMOUNT,
  getChurchStripePriceId,
} from "@/lib/church-pricing"
import { tryGetStripeServerClient } from "@/lib/stripe-config"

export type ChurchPriceDisplay = {
  /** Formatted for UI, e.g. "$7.99" */
  label: string
  amount: number
  currency: string
  enabled: boolean
  priceId: string | null
}

function formatUnitAmount(unitAmount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: (currency || "usd").toUpperCase(),
    minimumFractionDigits: 2,
  }).format(unitAmount / 100)
}

/**
 * Load church intro amount from Stripe for the configured price ID
 * (STRIPE_TEST_CHURCH_STARTER_PRICE_ID or STRIPE_CHURCH_STARTER_PRICE_ID
 * depending on LIVE_MODE).
 */
export async function getChurchPriceFromStripe(): Promise<ChurchPriceDisplay> {
  const fallbackLabel = `$${CHURCH_INTRO_PRICE_AMOUNT.toFixed(2)}`
  const priceId = getChurchStripePriceId()

  if (!priceId) {
    return {
      label: fallbackLabel,
      amount: CHURCH_INTRO_PRICE_AMOUNT,
      currency: "usd",
      enabled: false,
      priceId: null,
    }
  }

  const stripe = tryGetStripeServerClient()
  if (!stripe) {
    return {
      label: fallbackLabel,
      amount: CHURCH_INTRO_PRICE_AMOUNT,
      currency: "usd",
      enabled: false,
      priceId,
    }
  }

  try {
    const price = await stripe.prices.retrieve(priceId)
    if (price.unit_amount == null) {
      return {
        label: fallbackLabel,
        amount: CHURCH_INTRO_PRICE_AMOUNT,
        currency: price.currency || "usd",
        enabled: true,
        priceId,
      }
    }

    return {
      label: formatUnitAmount(price.unit_amount, price.currency),
      amount: price.unit_amount / 100,
      currency: price.currency || "usd",
      enabled: true,
      priceId,
    }
  } catch (error) {
    console.error("[church-price] Failed to retrieve Stripe price", {
      priceId,
      error,
    })
    return {
      label: fallbackLabel,
      amount: CHURCH_INTRO_PRICE_AMOUNT,
      currency: "usd",
      enabled: Boolean(priceId),
      priceId,
    }
  }
}

/** Cached Stripe lookup so funnels/onboarding don’t hit Stripe on every render. */
export function getCachedChurchPriceFromStripe(): Promise<ChurchPriceDisplay> {
  const priceId = getChurchStripePriceId() ?? "none"
  const mode = process.env.LIVE_MODE?.trim() || "OFF"
  return unstable_cache(
    () => getChurchPriceFromStripe(),
    ["church-stripe-price", mode, priceId],
    { revalidate: 3600 }
  )()
}
