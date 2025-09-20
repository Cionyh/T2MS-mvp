import { prisma } from "@/lib/prisma";

export interface PlanLimits {
  websites: number;
  messages: number;
  storage: number;
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  free: { websites: 1, messages: 4, storage: 0.1 },
  starter: { websites: 3, messages: 100, storage: 1 },
  pro: { websites: 10, messages: 1000, storage: 10 },
  enterprise: { websites: -1, messages: -1, storage: 100 }
};

export async function getUserPlan(userId: string): Promise<string> {
  try {
    // Get user's active subscription
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        // We'll need to join with subscriptions through stripeCustomerId
      }
    });

    if (!user) {
      return "free";
    }

    // Check if user has an active subscription
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

export async function getUserPlanLimits(userId: string): Promise<PlanLimits> {
  const plan = await getUserPlan(userId);
  return PLAN_LIMITS[plan] || PLAN_LIMITS.free;
}

export async function checkSiteLimit(userId: string): Promise<{ allowed: boolean; current: number; limit: number }> {
  try {
    const limits = await getUserPlanLimits(userId);
    const currentSites = await prisma.client.count({
      where: { userId }
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

export async function checkMessageLimit(userId: string, clientId: string): Promise<{ allowed: boolean; current: number; limit: number }> {
  try {
    const limits = await getUserPlanLimits(userId);
    
    // Count messages for this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const currentMessages = await prisma.message.count({
      where: {
        client: {
          userId: userId
        },
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      }
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
