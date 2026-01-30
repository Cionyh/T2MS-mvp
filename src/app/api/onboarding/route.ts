import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/onboarding
 * Returns full onboarding details for the current user (for viewing/editing in dashboard)
 */
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const onboarding = await prisma.onboarding.findUnique({
      where: { userId: session.user.id },
    });

    if (!onboarding) {
      return NextResponse.json({ onboarding: null });
    }

    return NextResponse.json({
      onboarding: {
        planId: onboarding.planId,
        installAddonSku: onboarding.installAddonSku,
        installAddonStatus: onboarding.installAddonStatus,
        websiteUrls: onboarding.websiteUrls,
        platform: onboarding.platform,
        installType: onboarding.installType,
        preferredPlacement: onboarding.preferredPlacement,
        accessMethod: onboarding.accessMethod,
        notes: onboarding.notes,
        completedAt: onboarding.completedAt,
      },
    });
  } catch (error) {
    console.error("Onboarding GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
