import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getActiveOrganization } from "@/lib/organization-helpers";
import { displaySiteLabel } from "@/lib/site-display";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const days = parseInt(req.nextUrl.searchParams.get("days") || "30", 10);

    const organizationId = await getActiveOrganization();
    if (!organizationId) {
      return NextResponse.json({
        overview: {
          totalSites: 0,
          totalMessages: 0,
          messagesThisWeek: 0,
          messagesThisMonth: 0,
          averageMessagesPerSite: 0
        },
        siteStats: [],
        messageTrends: {
          timestamps: [],
          daily: [],
          weekly: [],
          monthly: []
        },
        recentActivity: []
      });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [totalSites, totalMessages, messagesThisWeek, messagesThisMonth] = await Promise.all([
      prisma.client.count({
        where: { organizationId }
      }),
      prisma.message.count({
        where: { client: { organizationId } }
      }),
      prisma.message.count({
        where: {
          client: { organizationId },
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      prisma.message.count({
        where: {
          client: { organizationId },
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ]);

    const siteStats = await prisma.client.findMany({
      where: { organizationId },
      select: {
        id: true,
        name: true,
        domain: true,
        hostedSlug: true,
        createdAt: true,
        _count: {
          select: { messages: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    const siteStatsWithLastMessage = await Promise.all(
      siteStats.map(async (site) => {
        const lastMessage = await prisma.message.findFirst({
          where: { clientId: site.id },
          orderBy: { createdAt: "desc" },
          select: { createdAt: true }
        });

        return {
          id: site.id,
          name: site.name,
          domain: site.domain,
          hostedSlug: site.hostedSlug,
          displayLabel: displaySiteLabel({
            domain: site.domain,
            hostedSlug: site.hostedSlug,
          }),
          messageCount: site._count.messages,
          lastMessageDate: lastMessage?.createdAt || null,
          createdAt: site.createdAt
        };
      })
    );

    const allMessages = await prisma.message.findMany({
      where: {
        client: { organizationId },
        createdAt: { gte: startDate }
      },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" }
    });

    const trendTimestamps = allMessages.map((m) => m.createdAt.toISOString());

    const recentMessages = await prisma.message.findMany({
      where: { client: { organizationId } },
      select: {
        id: true,
        content: true,
        createdAt: true,
        client: {
          select: {
            name: true,
            domain: true,
            hostedSlug: true,
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 10
    });

    const recentSites = await prisma.client.findMany({
      where: { organizationId },
      select: {
        id: true,
        name: true,
        domain: true,
        hostedSlug: true,
        createdAt: true
      },
      orderBy: { createdAt: "desc" },
      take: 5
    });

    const recentActivity = [
      ...recentMessages.map((msg) => ({
        id: msg.id,
        type: "message" as const,
        content: msg.content,
        siteName: msg.client.name,
        siteDomain: displaySiteLabel({
          domain: msg.client.domain,
          hostedSlug: msg.client.hostedSlug,
        }),
        createdAt: msg.createdAt
      })),
      ...recentSites.map((site) => ({
        id: site.id,
        type: "site_created" as const,
        content: "Site created",
        siteName: site.name,
        siteDomain: displaySiteLabel({
          domain: site.domain,
          hostedSlug: site.hostedSlug,
        }),
        createdAt: site.createdAt
      }))
    ]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 15);

    const averageMessagesPerSite =
      totalSites > 0
        ? Math.round((totalMessages / totalSites) * 100) / 100
        : 0;

    return NextResponse.json({
      overview: {
        totalSites,
        totalMessages,
        messagesThisWeek,
        messagesThisMonth,
        averageMessagesPerSite
      },
      siteStats: siteStatsWithLastMessage,
      messageTrends: {
        timestamps: trendTimestamps,
        // Kept for backward compatibility; UI prefers local bucketing from timestamps
        daily: [],
        weekly: [],
        monthly: []
      },
      recentActivity
    });
  } catch (error) {
    console.error("[USER_ANALYTICS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
