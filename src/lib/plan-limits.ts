import { prisma } from "@/lib/prisma";

export interface PlanLimits {
  websites: number;
  messages: number;
  storage: number;
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  free: { websites: 10, messages: 1000, storage: 10 },
  starter: { websites: 50, messages: 10000, storage: 50 },
  pro: { websites: 200, messages: 50000, storage: 200 },
  enterprise: { websites: -1, messages: -1, storage: 1000 }
};

/**
 * Get the plan for an organization by checking the owner's subscription
 */
export async function getOrganizationPlan(organizationId: string): Promise<string> {
  try {
    if (!organizationId) {
      return "free";
    }

    // Get the organization owner (member with 'owner' role)
    const owner = await prisma.$queryRaw<Array<{ userId: string }>>`
      SELECT "userId" 
      FROM member 
      WHERE "organizationId" = ${organizationId} AND role = 'owner'
      LIMIT 1
    `;

    if (!owner || owner.length === 0) {
      return "free";
    }

    const ownerUserId = owner[0].userId;

    // Get owner's user record to access stripeCustomerId
    const ownerUser = await prisma.user.findUnique({
      where: { id: ownerUserId },
      select: { stripeCustomerId: true }
    });

    if (!ownerUser?.stripeCustomerId) {
      return "free";
    }

    // Check if owner has an active subscription
    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        stripeCustomerId: ownerUser.stripeCustomerId,
        status: {
          in: ["active", "trialing"]
        }
      },
      orderBy: { periodStart: "desc" }
    });

    if (!activeSubscription) {
      return "free";
    }

    return activeSubscription.plan;
  } catch (error) {
    console.error("Error getting organization plan:", error);
    return "free";
  }
}

/**
 * Get plan limits for an organization
 */
export async function getOrganizationPlanLimits(organizationId: string): Promise<PlanLimits> {
  const plan = await getOrganizationPlan(organizationId);
  return PLAN_LIMITS[plan] || PLAN_LIMITS.free;
}

// Legacy function for backward compatibility (deprecated - use getOrganizationPlan instead)
export async function getUserPlan(userId: string): Promise<string> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true }
    });

    if (!user?.stripeCustomerId) {
      return "free";
    }

    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        stripeCustomerId: user.stripeCustomerId,
        status: {
          in: ["active", "trialing"]
        }
      },
      orderBy: { periodStart: "desc" }
    });

    if (!activeSubscription) {
      return "free";
    }

    return activeSubscription.plan;
  } catch (error) {
    console.error("Error getting user plan:", error);
    return "free";
  }
}

// Legacy function for backward compatibility (deprecated)
export async function getUserPlanLimits(userId: string): Promise<PlanLimits> {
  const plan = await getUserPlan(userId);
  return PLAN_LIMITS[plan] || PLAN_LIMITS.free;
}

/**
 * Check site limit for an organization
 */
export async function checkSiteLimit(organizationId: string): Promise<{ allowed: boolean; current: number; limit: number }> {
  try {
    if (!organizationId) {
      return { allowed: false, current: 0, limit: 0 };
    }

    const limits = await getOrganizationPlanLimits(organizationId);
    const currentSites = await prisma.client.count({
      where: { organizationId }
    });

    const limit = limits.websites === -1 ? Number.MAX_SAFE_INTEGER : limits.websites;
    
    return {
      allowed: currentSites < limit,
      current: currentSites,
      limit: limits.websites
    };
  } catch (error) {
    console.error("Error checking site limit:", error);
    return { allowed: false, current: 0, limit: 0 };
  }
}

/**
 * Check message limit for an organization
 */
export async function checkMessageLimit(organizationId: string, clientId?: string): Promise<{ allowed: boolean; current: number; limit: number }> {
  try {
    if (!organizationId) {
      return { allowed: false, current: 0, limit: 0 };
    }

    const limits = await getOrganizationPlanLimits(organizationId);
    
    // Count messages for this month across all organization clients
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const whereClause: any = {
      client: {
        organizationId: organizationId
      },
      createdAt: {
        gte: startOfMonth,
        lte: endOfMonth
      }
    };

    // Optionally filter by specific client
    if (clientId) {
      whereClause.client.id = clientId;
    }

    const currentMessages = await prisma.message.count({
      where: whereClause
    });

    const limit = limits.messages === -1 ? Number.MAX_SAFE_INTEGER : limits.messages;
    
    return {
      allowed: currentMessages < limit,
      current: currentMessages,
      limit: limits.messages
    };
  } catch (error) {
    console.error("Error checking message limit:", error);
    return { allowed: false, current: 0, limit: 0 };
  }
}

export function formatLimit(limit: number): string {
  if (limit === -1) return "Unlimited";
  if (limit === Number.MAX_SAFE_INTEGER) return "Unlimited";
  return limit.toString();
}
