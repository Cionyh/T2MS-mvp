import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getActiveSubscriptionWhere } from "@/lib/subscriptions";

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

    // User is "paid" only when they have an active Stripe subscription (not just planId, which is set before payment)
    const activeSubscription = await prisma.subscription.findFirst({
      where: getActiveSubscriptionWhere(session.user.id),
    });
    const hasPaidPlan = !!activeSubscription;

    // Check if user has registered at least one site (Client in their orgs)
    const members = await prisma.member.findMany({
      where: { userId: session.user.id },
      select: { organizationId: true, role: true },
    });
    const orgIds = members.map((m) => m.organizationId);

    // Team members invited into an existing organization should not be forced
    // through the owner onboarding flow (plan/add-on/site setup).
    const isOwnerInAnyOrg = members.some((m) =>
      (m.role ?? "").toLowerCase().includes("owner")
    );
    if (members.length > 0 && !isOwnerInAnyOrg) {
      return NextResponse.json({
        completed: true,
        step: undefined,
        planId: onboarding?.planId,
        installAddonSku: onboarding?.installAddonSku,
        installAddonStatus: onboarding?.installAddonStatus,
        needsSiteRegistration: false,
        hasRegisteredSite: true,
        needsPhoneVerification: false,
        hasVerifiedPhone: true,
        needsInstallSetup: false,
        firstClientId: null,
      });
    }
    const clients =
      orgIds.length > 0
        ? await prisma.client.findMany({
            where: { organizationId: { in: orgIds } },
            select: { id: true },
            orderBy: { createdAt: "asc" },
          })
        : [];
    const hasRegisteredSite = clients.length > 0;
    const firstClientId = clients[0]?.id ?? null;

    // Check if any client has at least one verified phone number
    const verifiedPhoneCount =
      clients.length > 0
        ? await prisma.phoneNumber.count({
            where: {
              clientId: { in: clients.map((c) => c.id) },
              verified: true,
            },
          })
        : 0;
    const hasVerifiedPhone = verifiedPhoneCount > 0;

    // Install setup: first client's install job still has default platform "To be confirmed" → user must submit install form
    let needsInstallSetup = false;
    if (hasPaidPlan && hasRegisteredSite && hasVerifiedPhone && firstClientId) {
      const installJob = await prisma.installJob.findFirst({
        where: { clientId: firstClientId },
        orderBy: { createdAt: "desc" },
        select: { platform: true },
      });
      needsInstallSetup = installJob?.platform === "To be confirmed";
    }

    // Completed when: completedAt set AND (if paid) has site, verified phone, AND install setup submitted
    const completed =
      !!onboarding?.completedAt &&
      (!hasPaidPlan || (hasRegisteredSite && hasVerifiedPhone && !needsInstallSetup));

    // Paid users must register a site before onboarding is considered complete
    const needsSiteRegistration =
      hasPaidPlan && !hasRegisteredSite;

    // Paid users with site must verify phone before completing
    const needsPhoneVerification =
      hasPaidPlan && hasRegisteredSite && !hasVerifiedPhone;

    return NextResponse.json({
      completed,
      step: onboarding ? undefined : 1,
      planId: onboarding?.planId,
      installAddonSku: onboarding?.installAddonSku,
      installAddonStatus: onboarding?.installAddonStatus,
      needsSiteRegistration,
      hasRegisteredSite,
      needsPhoneVerification,
      hasVerifiedPhone,
      needsInstallSetup,
      firstClientId,
    });
  } catch (error) {
    console.error("Onboarding status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
