import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

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

    return NextResponse.json({
      completed: !!onboarding?.completedAt,
      step: onboarding ? undefined : 1,
      planId: onboarding?.planId,
      installAddonSku: onboarding?.installAddonSku,
      installAddonStatus: onboarding?.installAddonStatus,
    });
  } catch (error) {
    console.error("Onboarding status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
