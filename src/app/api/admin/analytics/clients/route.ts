import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    // Check admin authentication
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const days = parseInt(searchParams.get("days") || "30");
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Client analytics
    const [
      totalClients,
      newClients,
      activeClients,
      pinnedClients,
      widgetTypes,
      topClientsByMessages,
      clientGrowthTrend,
      domainDistribution
    ] = await Promise.all([
      prisma.client.count(),
      prisma.client.count({ where: { createdAt: { gte: startDate } } }),
      prisma.client.count({ 
        where: { 
          messages: { some: { createdAt: { gte: startDate } } }
        }
      }),
      prisma.client.count({ where: { pinned: true } }),
      prisma.client.groupBy({
        by: ["defaultType"],
        _count: { id: true }
      }),
      prisma.client.findMany({
        select: {
          id: true,
          name: true,
          domain: true,
          createdAt: true,
          user: { select: { name: true, email: true } }
        },
        orderBy: { createdAt: "desc" },
        take: 10
      }),
      prisma.client.groupBy({
        by: ["createdAt"],
        _count: { id: true },
        where: { createdAt: { gte: startDate } },
        orderBy: { createdAt: "asc" }
      }),
      prisma.client.findMany({
        select: { domain: true },
        distinct: ["domain"]
      })
    ]);

    // Process widget type distribution
    const widgetTypeDistribution = widgetTypes.reduce((acc, type) => {
      acc[type.defaultType || "banner"] = type._count.id;
      return acc;
    }, {} as Record<string, number>);

    // Process growth trend
    const growthTrend = clientGrowthTrend.map(item => ({
      date: item.createdAt.toISOString().split('T')[0],
      count: item._count.id
    }));

    // Extract domain patterns
    const domainPatterns = domainDistribution.map(client => {
      const domain = client.domain;
      if (domain.includes('localhost')) return 'localhost';
      if (domain.includes('vercel.app')) return 'vercel.app';
      if (domain.includes('netlify.app')) return 'netlify.app';
      if (domain.includes('github.io')) return 'github.io';
      if (domain.includes('wordpress.com')) return 'wordpress.com';
      if (domain.includes('wix.com')) return 'wix.com';
      if (domain.includes('squarespace.com')) return 'squarespace.com';
      return 'custom';
    });

    const domainDistributionCount = domainPatterns.reduce((acc, pattern) => {
      acc[pattern] = (acc[pattern] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      metrics: {
        totalClients,
        newClients,
        activeClients,
        pinnedClients
      },
      distribution: {
        widgetTypes: widgetTypeDistribution,
        domains: domainDistributionCount
      },
      trends: {
        growth: growthTrend
      },
      topClients: topClientsByMessages.map(client => ({
        ...client,
        messageCount: 0 // We'll calculate this separately if needed
      }))
    });
  } catch (error) {
    console.error("Error fetching client analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
