import { prisma } from "@/lib/prisma";

const ACTIVE_STATUSES = ["active", "trialing"];

export function getActiveSubscriptionWhere(referenceId: string) {
  const now = new Date();

  return {
    referenceId,
    status: { in: ACTIVE_STATUSES },
    OR: [
      { periodEnd: null },
      { periodEnd: { gt: now } },
    ],
  };
}

export async function getActiveSubscription(referenceId: string) {
  return prisma.subscription.findFirst({
    where: getActiveSubscriptionWhere(referenceId),
    orderBy: { periodStart: "desc" },
  });
}
