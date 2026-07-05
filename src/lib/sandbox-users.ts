import { prisma } from "@/lib/prisma";
import { isLiveMode, tryGetStripeServerClient } from "@/lib/stripe-config";
import { getActiveSubscriptionWhere } from "@/lib/subscriptions";

export function shouldRegisterAsSandboxUser(): boolean {
  return !isLiveMode();
}

export async function migrateSandboxUserToLive(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      registeredFromSandbox: true,
      migratedToLiveAt: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.role === "admin") {
    throw new Error("Admin accounts cannot be migrated");
  }

  if (!user.registeredFromSandbox) {
    throw new Error("This user was not registered from sandbox");
  }

  if (user.migratedToLiveAt) {
    throw new Error("This user has already been migrated to live");
  }

  const now = new Date();
  const activeSubscriptions = await prisma.subscription.findMany({
    where: getActiveSubscriptionWhere(userId),
    select: {
      id: true,
      stripeSubscriptionId: true,
      source: true,
    },
  });

  const stripe = tryGetStripeServerClient();
  for (const sub of activeSubscriptions) {
    const stripeSubId = sub.stripeSubscriptionId;
    if (stripe && stripeSubId) {
      try {
        await stripe.subscriptions.cancel(stripeSubId);
      } catch (error) {
        console.warn(
          "[MIGRATE_SANDBOX_USER] Stripe cancel failed for",
          stripeSubId,
          error
        );
      }
    }
  }

  await prisma.$transaction(async (tx) => {
    for (const sub of activeSubscriptions) {
      await tx.subscription.update({
        where: { id: sub.id },
        data: {
          status: "canceled",
          cancelAtPeriodEnd: true,
          canceledAt: now,
          endedAt: now,
          updatedAt: now,
        },
      });

      if (sub.source === "coupon" || sub.source === "admin_comp") {
        await tx.couponRedemption.updateMany({
          where: { subscriptionId: sub.id, cancelledAt: null },
          data: {
            cancelledAt: now,
            cancellationReason: "Sandbox user migrated to live",
          },
        });
      }
    }

    await tx.user.update({
      where: { id: userId },
      data: {
        registeredFromSandbox: false,
        migratedToLiveAt: now,
        stripeCustomerId: null,
      },
    });
  });

  return {
    userId: user.id,
    email: user.email,
    migratedAt: now,
    canceledSubscriptionCount: activeSubscriptions.length,
  };
}

export async function markUserAsSandbox(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      registeredFromSandbox: true,
      migratedToLiveAt: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.role === "admin") {
    throw new Error("Admin accounts cannot be marked as sandbox");
  }

  if (user.registeredFromSandbox) {
    throw new Error("This user is already marked as sandbox");
  }

  if (user.migratedToLiveAt) {
    throw new Error("This user has already been migrated to live");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { registeredFromSandbox: true },
  });

  return {
    userId: user.id,
    email: user.email,
  };
}
