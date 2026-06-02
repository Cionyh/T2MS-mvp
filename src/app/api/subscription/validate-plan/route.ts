import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import { CHURCH_PLAN_ID } from "@/lib/church-pricing"
import { canSubscribeToChurchPlan } from "@/lib/church-verification"
import { validateStripePlanConfigured } from "@/lib/stripe-config"

/**
 * POST /api/subscription/validate-plan
 * Server-side gate before Stripe checkout (church verification, etc.).
 */
export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { planId } = body as { planId?: string }

    if (!planId) {
      return NextResponse.json({ error: "planId is required" }, { status: 400 })
    }

    const priceCheck = validateStripePlanConfigured(planId)
    if (!priceCheck.ok) {
      return NextResponse.json(
        { error: priceCheck.error, code: priceCheck.code },
        { status: 400 }
      )
    }

    if (planId === CHURCH_PLAN_ID) {
      const onboarding = await prisma.onboarding.findUnique({
        where: { userId: session.user.id },
        select: { churchVerificationStatus: true },
      })

      if (!canSubscribeToChurchPlan(onboarding?.churchVerificationStatus)) {
        const status = onboarding?.churchVerificationStatus
        if (status === "pending") {
          return NextResponse.json(
            {
              error:
                "Your church verification is pending review. We'll notify you when you can subscribe at the intro rate.",
              code: "CHURCH_VERIFICATION_PENDING",
            },
            { status: 403 }
          )
        }
        if (status === "rejected") {
          return NextResponse.json(
            {
              error:
                "Church introductory pricing is not available for this account. Contact support@t2ms.biz for help.",
              code: "CHURCH_VERIFICATION_REJECTED",
            },
            { status: 403 }
          )
        }
        return NextResponse.json(
          {
            error:
              "Please complete church verification before subscribing to the church intro plan.",
            code: "CHURCH_VERIFICATION_REQUIRED",
          },
          { status: 403 }
        )
      }
    }

    return NextResponse.json({ allowed: true })
  } catch (error) {
    console.error("Validate plan error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
