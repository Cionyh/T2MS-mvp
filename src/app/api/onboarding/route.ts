import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/onboarding
 * Returns onboarding details from Onboarding table only: plan, add-on billing, completion.
 * Install setup data lives in Customer + InstallJob; use GET /api/install-jobs for install requests.
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
        completedAt: onboarding.completedAt,
      },
    });
  } catch (error: unknown) {
    console.error("Onboarding GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
