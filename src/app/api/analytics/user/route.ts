import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const userIdParam = req.nextUrl.searchParams.get("userId");
    const days = parseInt(req.nextUrl.searchParams.get("days") || "30", 10);

    if (!userIdParam || userIdParam !== session.user.id) {
      return new NextResponse("Unauthorized or missing user ID", { status: 403 });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get overview stats
    const [totalSites, totalMessages, messagesThisWeek, messagesThisMonth] = await Promise.all([
      prisma.client.count({
        where: { userId: session.user.id }
      }),
      prisma.message.count({
        where: { client: { userId: session.user.id } }
      }),
      prisma.message.count({
        where: {
          client: { userId: session.user.id },
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      prisma.message.count({
        where: {
          client: { userId: session.user.id },
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ]);

    // Get site stats
    const siteStats = await prisma.client.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        name: true,
        domain: true,
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
          messageCount: site._count.messages,
          lastMessageDate: lastMessage?.createdAt || null,
          createdAt: site.createdAt
        };
      })
    );

    // Get message trends - fetch all messages and group them in JavaScript
    const allMessages = await prisma.message.findMany({
      where: {
        client: { userId: session.user.id },
        createdAt: { gte: startDate }
      },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' }
    });

    // Group messages by day
    const dailyTrends = allMessages.reduce((acc, message) => {
      const date = message.createdAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const dailyTrendsArray = Object.entries(dailyTrends).map(([date, count]) => ({
      date,
      count
    }));

    // Group messages by week
    const weeklyTrends = allMessages.reduce((acc, message) => {
      const date = new Date(message.createdAt);
      const year = date.getFullYear();
      const week = Math.ceil((date.getTime() - new Date(year, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
      const weekKey = `${year}-W${week.toString().padStart(2, '0')}`;
      acc[weekKey] = (acc[weekKey] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const weeklyTrendsArray = Object.entries(weeklyTrends).map(([week, count]) => ({
      week,
      count
    }));

    // Group messages by month
    const monthlyTrends = allMessages.reduce((acc, message) => {
      const date = new Date(message.createdAt);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      acc[monthKey] = (acc[monthKey] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const monthlyTrendsArray = Object.entries(monthlyTrends).map(([month, count]) => ({
      month,
      count
    }));

    // Get recent activity
    const recentMessages = await prisma.message.findMany({
      where: { client: { userId: session.user.id } },
      select: {
        id: true,
        content: true,
        createdAt: true,
        client: {
          select: {
            name: true,
            domain: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 10
    });

    const recentSites = await prisma.client.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        name: true,
        domain: true,
        createdAt: true
      },
      orderBy: { createdAt: "desc" },
      take: 5
    });

    const recentActivity = [
      ...recentMessages.map(msg => ({
        id: msg.id,
        type: 'message' as const,
        content: msg.content,
        siteName: msg.client.name,
        siteDomain: msg.client.domain,
        createdAt: msg.createdAt
      })),
      ...recentSites.map(site => ({
        id: site.id,
        type: 'site_created' as const,
        content: 'Site created',
        siteName: site.name,
        siteDomain: site.domain,
        createdAt: site.createdAt
      }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 15);

    const averageMessagesPerSite = totalSites > 0 ? Math.round(totalMessages / totalSites * 100) / 100 : 0;

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
        daily: dailyTrendsArray,
        weekly: weeklyTrendsArray,
        monthly: monthlyTrendsArray
      },
      recentActivity
    });
  } catch (error) {
    console.error("[USER_ANALYTICS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
