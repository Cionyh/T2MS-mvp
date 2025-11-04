import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getActiveOrganization } from "@/lib/organization-helpers";
import { getOrganizationPlanLimits } from "@/lib/plan-limits";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/plan/usage
 * Get plan usage statistics for the active organization
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Get active organization
    const organizationId = await getActiveOrganization();
    if (!organizationId) {
      return NextResponse.json({
        websitesCount: 0,
        messagesCount: 0,
        limits: {
          websites: 0,
          messages: 0,
        },
      });
    }

    // Get current websites count for organization
    const websitesCount = await prisma.client.count({
      where: { organizationId },
    });

    // Get current month messages count for organization
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const messagesCount = await prisma.message.count({
      where: {
        client: { organizationId },
        createdAt: { gte: startOfMonth, lte: endOfMonth },
      },
    });

    // Get plan limits for organization
    const limits = await getOrganizationPlanLimits(organizationId);

    return NextResponse.json({
      websitesCount,
      messagesCount,
      limits,
    });
  } catch (error) {
    console.error("Error fetching plan usage:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

