import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import {
  CHURCH_VERIFICATION_PENDING,
  CHURCH_VERIFICATION_VERIFIED,
  isChurchIntroAutoVerifyEnabled,
} from "@/lib/church-verification"

/**
 * POST /api/onboarding/church-verification
 * Submit church eligibility attestation before church plan checkout.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { organizationName, attestationConfirmed } = body as {
      organizationName?: string
      attestationConfirmed?: boolean
    }

    const name = organizationName?.trim()
    if (!name || name.length < 2) {
      return NextResponse.json(
        { error: "Please enter your church or organization name." },
        { status: 400 }
      )
    }

    if (!attestationConfirmed) {
      return NextResponse.json(
        {
          error:
            "Please confirm that you represent a verified church or religious organization.",
        },
        { status: 400 }
      )
    }

    const autoVerify = isChurchIntroAutoVerifyEnabled()
    const status = autoVerify
      ? CHURCH_VERIFICATION_VERIFIED
      : CHURCH_VERIFICATION_PENDING

    const onboarding = await prisma.onboarding.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        planId: "free",
        churchOrganizationName: name,
        churchVerificationStatus: status,
        churchVerifiedAt: autoVerify ? new Date() : null,
      },
      update: {
        churchOrganizationName: name,
        churchVerificationStatus: status,
        churchVerifiedAt: autoVerify ? new Date() : null,
      },
      select: {
        churchVerificationStatus: true,
        churchOrganizationName: true,
      },
    })

    return NextResponse.json({
      success: true,
      status: onboarding.churchVerificationStatus,
      organizationName: onboarding.churchOrganizationName,
      canCheckout: status === CHURCH_VERIFICATION_VERIFIED,
    })
  } catch (error) {
    console.error("Church verification error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * GET /api/onboarding/church-verification
 * Returns current church verification state for the signed-in user.
 */
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const onboarding = await prisma.onboarding.findUnique({
      where: { userId: session.user.id },
      select: {
        churchOrganizationName: true,
        churchVerificationStatus: true,
        churchVerifiedAt: true,
        churchPriceLockedUntil: true,
      },
    })

    return NextResponse.json({
      organizationName: onboarding?.churchOrganizationName ?? null,
      status: onboarding?.churchVerificationStatus ?? null,
      verifiedAt: onboarding?.churchVerifiedAt ?? null,
      priceLockedUntil: onboarding?.churchPriceLockedUntil ?? null,
    })
  } catch (error) {
    console.error("Church verification GET error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
