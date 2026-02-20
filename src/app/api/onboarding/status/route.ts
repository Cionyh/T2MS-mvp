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

    const completed = !!onboarding?.completedAt;

    // User is "paid" only when they have an active Stripe subscription (not just planId, which is set before payment)
    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        referenceId: session.user.id,
        status: { in: ["active", "trialing"] },
      },
    });
    const hasPaidPlan = !!activeSubscription;

    // Check if user has registered at least one site (Client in their orgs)
    const members = await prisma.member.findMany({
      where: { userId: session.user.id },
      select: { organizationId: true },
    });
    const orgIds = members.map((m) => m.organizationId);
    const clientCount =
      orgIds.length > 0
        ? await prisma.client.count({
            where: { organizationId: { in: orgIds } },
          })
        : 0;
    const hasRegisteredSite = clientCount > 0;

    // Paid users must register a site before onboarding is considered complete
    const needsSiteRegistration =
      hasPaidPlan && !completed && !hasRegisteredSite;

    return NextResponse.json({
      completed,
      step: onboarding ? undefined : 1,
      planId: onboarding?.planId,
      installAddonSku: onboarding?.installAddonSku,
      installAddonStatus: onboarding?.installAddonStatus,
      needsSiteRegistration,
      hasRegisteredSite,
    });
  } catch (error) {
    console.error("Onboarding status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
