import { NextResponse } from "next/server"
import { getCachedChurchPriceFromStripe } from "@/lib/church-stripe-price"

/**
 * Public: church partner price label from Stripe
 * (STRIPE_TEST_CHURCH_STARTER_PRICE_ID / STRIPE_CHURCH_STARTER_PRICE_ID).
 */
export async function GET() {
  try {
    const price = await getCachedChurchPriceFromStripe()
    return NextResponse.json(price, {
      headers: {
        // Short browser/CDN cache; server revalidation handled by unstable_cache
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
      },
    })
  } catch (error) {
    console.error("[api/church/price]", error)
    return NextResponse.json(
      {
        label: "$7.99",
        amount: 7.99,
        currency: "usd",
        enabled: false,
        priceId: null,
      },
      { status: 200 }
    )
  }
}
