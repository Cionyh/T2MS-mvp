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

    // Get date range from query params
    const { searchParams } = req.nextUrl;
    const days = parseInt(searchParams.get("days") || "30");
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Fetch all data in parallel
    const [
      totalUsers,
      newUsers,
      totalClients,
      newClients,
      totalMessages,
      newMessages,
      totalSubscriptions,
      activeSubscriptions,
      revenueData,
      userGrowth,
      clientGrowth,
      messageGrowth
    ] = await Promise.all([
      // Total counts
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: startDate } } }),
      prisma.client.count(),
      prisma.client.count({ where: { createdAt: { gte: startDate } } }),
      prisma.message.count(),
      prisma.message.count({ where: { createdAt: { gte: startDate } } }),
      prisma.subscription.count(),
      prisma.subscription.count({ where: { status: "active" } }),

      // Revenue calculation
      prisma.subscription.findMany({
        where: { status: "active" },
        select: { plan: true, periodStart: true, periodEnd: true }
      }),

      // Growth data
      prisma.user.groupBy({
        by: ["createdAt"],
        _count: { id: true },
        where: { createdAt: { gte: startDate } },
        orderBy: { createdAt: "asc" }
      }),
      prisma.client.groupBy({
        by: ["createdAt"],
        _count: { id: true },
        where: { createdAt: { gte: startDate } },
        orderBy: { createdAt: "asc" }
      }),
      prisma.message.groupBy({
        by: ["createdAt"],
        _count: { id: true },
        where: { createdAt: { gte: startDate } },
        orderBy: { createdAt: "asc" }
      })
    ]);

    // Calculate revenue
    const planPrices: Record<string, number> = {
      "starter": 9.99,
      "pro": 29.99,
      "enterprise": 99.99,
    };

    const monthlyRevenue = revenueData
      .filter(sub => sub.plan.includes("monthly"))
      .reduce((sum, sub) => sum + (planPrices[sub.plan.replace("_monthly", "")] || 0), 0);

    const annualRevenue = revenueData
      .filter(sub => sub.plan.includes("annual"))
      .reduce((sum, sub) => sum + (planPrices[sub.plan.replace("_annual", "")] || 0), 0);

    // Process growth data
    const processGrowthData = (data: any[], label: string) => {
      const dailyData: Record<string, number> = {};
      data.forEach(item => {
        const date = item.createdAt.toISOString().split('T')[0];
        dailyData[date] = (dailyData[date] || 0) + item._count.id;
      });

      return Object.entries(dailyData).map(([date, count]) => ({
        date,
        [label]: count
      }));
    };

    const userGrowthData = processGrowthData(userGrowth, "users");
    const clientGrowthData = processGrowthData(clientGrowth, "clients");
    const messageGrowthData = processGrowthData(messageGrowth, "messages");

    // Calculate growth percentages
    const userGrowthPercent = totalUsers > 0 ? ((newUsers / totalUsers) * 100) : 0;
    const clientGrowthPercent = totalClients > 0 ? ((newClients / totalClients) * 100) : 0;
    const messageGrowthPercent = totalMessages > 0 ? ((newMessages / totalMessages) * 100) : 0;

    return NextResponse.json({
      overview: {
        totalUsers,
        newUsers,
        totalClients,
        newClients,
        totalMessages,
        newMessages,
        totalSubscriptions,
        activeSubscriptions,
        monthlyRevenue: Math.round(monthlyRevenue * 100) / 100,
        annualRevenue: Math.round(annualRevenue * 100) / 100,
      },
      growth: {
        users: userGrowthPercent,
        clients: clientGrowthPercent,
        messages: messageGrowthPercent,
      },
      charts: {
        userGrowth: userGrowthData,
        clientGrowth: clientGrowthData,
        messageGrowth: messageGrowthData,
      }
    });
  } catch (error) {
    console.error("Error fetching analytics overview:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
