import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getActiveSubscriptionWhere } from "@/lib/subscriptions";
import {
  isHostedOnlyPath,
  SETUP_PATH_HOSTED_ONLY,
} from "@/lib/setup-path";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let onboarding = await prisma.onboarding.findUnique({
      where: { userId: session.user.id },
    });

    // Skip the hosted-vs-widget chooser: start with hosted path (widget can be added later).
    // New signups go straight to plan/pricing selection on /onboarding.
    if (!onboarding?.setupPath && !onboarding?.completedAt) {
      onboarding = await prisma.onboarding.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          planId: "free",
          setupPath: SETUP_PATH_HOSTED_ONLY,
        },
        update: { setupPath: SETUP_PATH_HOSTED_ONLY },
      });
    }

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
        planId: activeSubscription?.plan ?? onboarding?.planId,
        installAddonSku: onboarding?.installAddonSku,
        installAddonStatus: onboarding?.installAddonStatus,
        needsSiteRegistration: false,
        hasRegisteredSite: true,
        needsPhoneVerification: false,
        hasVerifiedPhone: true,
        needsInstallSetup: false,
        needsHostedSetup: false,
        needsPathSelection: false,
        setupPath: onboarding?.setupPath ?? null,
        firstClientId: null,
      });
    }
    const clients =
      orgIds.length > 0
        ? await prisma.client.findMany({
            where: { organizationId: { in: orgIds } },
            select: {
              id: true,
              hostedSlug: true,
              hostedEnabled: true,
            },
            orderBy: { createdAt: "asc" },
          })
        : [];
    const hasRegisteredSite = clients.length > 0;
    const firstClient = clients[0] ?? null;
    const firstClientId = firstClient?.id ?? null;
    const setupPath = onboarding?.setupPath ?? null;
    const hostedOnly = isHostedOnlyPath(setupPath);

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

    // Install setup: embed path only — install job still "To be confirmed"
    let needsInstallSetup = false;
    if (
      hasPaidPlan &&
      hasRegisteredSite &&
      hasVerifiedPhone &&
      firstClientId &&
      !hostedOnly
    ) {
      const installJob = await prisma.installJob.findFirst({
        where: { clientId: firstClientId },
        orderBy: { createdAt: "desc" },
        select: { platform: true },
      });
      needsInstallSetup = installJob?.platform === "To be confirmed";
    }

    // Hosted setup: hosted-only path — slug chosen and page published
    let needsHostedSetup = false;
    if (hasPaidPlan && hasRegisteredSite && hasVerifiedPhone && hostedOnly && firstClient) {
      needsHostedSetup =
        !firstClient.hostedSlug?.trim() || !firstClient.hostedEnabled;
    }

    // Path chooser removed from onboarding; setupPath defaults above when missing.
    const needsPathSelection = false;

    // Completed when: completedAt set AND (if paid) site + phone + path-specific setup done
    const completed =
      !!onboarding?.completedAt &&
      (!hasPaidPlan ||
        (hasRegisteredSite &&
          hasVerifiedPhone &&
          !needsInstallSetup &&
          !needsHostedSetup));

    // Paid users must register a site before onboarding is considered complete
    const needsSiteRegistration =
      hasPaidPlan && !hasRegisteredSite;

    // Paid users with site must verify phone before completing
    const needsPhoneVerification =
      hasPaidPlan && hasRegisteredSite && !hasVerifiedPhone;

    return NextResponse.json({
      completed,
      step: onboarding ? undefined : 1,
      // Prefer live subscription so Register Site UI matches keyword rules on POST /api/client
      planId: activeSubscription?.plan ?? onboarding?.planId ?? null,
      installAddonSku: onboarding?.installAddonSku,
      installAddonStatus: onboarding?.installAddonStatus,
      needsSiteRegistration,
      hasRegisteredSite,
      needsPhoneVerification,
      hasVerifiedPhone,
      needsInstallSetup,
      needsHostedSetup,
      needsPathSelection,
      setupPath,
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
