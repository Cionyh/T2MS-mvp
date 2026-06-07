import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  CHURCH_VERIFICATION_PENDING,
  CHURCH_VERIFICATION_REJECTED,
  CHURCH_VERIFICATION_VERIFIED,
} from "@/lib/church-verification"

function requireAdmin(session: { user?: { id?: string; role?: string | null } | null } | null) {
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  return null
}

/**
 * GET /api/admin/church-verifications
 * List church verification requests for admin review.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    const forbidden = requireAdmin(session)
    if (forbidden) return forbidden

    const statusFilter = req.nextUrl.searchParams.get("status")?.trim()

    const requests = await prisma.onboarding.findMany({
      where: {
        churchVerificationStatus: {
          not: null,
          ...(statusFilter ? { equals: statusFilter } : {}),
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 100,
      select: {
        userId: true,
        churchOrganizationName: true,
        churchVerificationStatus: true,
        churchVerifiedAt: true,
        churchPriceLockedUntil: true,
        planId: true,
        updatedAt: true,
        user: {
          select: {
            name: true,
            email: true,
            businessCategory: true,
          },
        },
      },
    })

    return NextResponse.json({
      requests: requests.map((r) => ({
        userId: r.userId,
        organizationName: r.churchOrganizationName,
        status: r.churchVerificationStatus,
        verifiedAt: r.churchVerifiedAt,
        priceLockedUntil: r.churchPriceLockedUntil,
        planId: r.planId,
        updatedAt: r.updatedAt,
        userName: r.user.name,
        userEmail: r.user.email,
        businessCategory: r.user.businessCategory,
      })),
    })
  } catch (error) {
    console.error("[ADMIN_CHURCH_VERIFICATIONS_GET]", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

/**
 * PATCH /api/admin/church-verifications
 * Approve or reject a church verification request.
 * Body: { userId, status: "verified" | "rejected" }
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    const forbidden = requireAdmin(session)
    if (forbidden) return forbidden

    const body = await req.json()
    const { userId, status } = body as {
      userId?: string
      status?: string
    }

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    if (
      status !== CHURCH_VERIFICATION_VERIFIED &&
      status !== CHURCH_VERIFICATION_REJECTED &&
      status !== CHURCH_VERIFICATION_PENDING
    ) {
      return NextResponse.json(
        { error: "status must be verified, rejected, or pending" },
        { status: 400 }
      )
    }

    const onboarding = await prisma.onboarding.update({
      where: { userId },
      data: {
        churchVerificationStatus: status,
        churchVerifiedAt:
          status === CHURCH_VERIFICATION_VERIFIED ? new Date() : null,
      },
      select: {
        userId: true,
        churchOrganizationName: true,
        churchVerificationStatus: true,
        churchVerifiedAt: true,
      },
    })

    return NextResponse.json({ success: true, onboarding })
  } catch (error) {
    console.error("[ADMIN_CHURCH_VERIFICATIONS_PATCH]", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
