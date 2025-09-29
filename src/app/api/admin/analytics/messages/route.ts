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

    // Message analytics
    const [
      totalMessages,
      newMessages,
      messagesToday,
      messagesThisWeek,
      messagesThisMonth,
      messageTrend,
      topClientsByMessages,
      averageMessageLength,
      peakHours
    ] = await Promise.all([
      prisma.message.count(),
      prisma.message.count({ where: { createdAt: { gte: startDate } } }),
      prisma.message.count({ 
        where: { 
          createdAt: { 
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      prisma.message.count({ 
        where: { 
          createdAt: { 
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      prisma.message.count({ 
        where: { 
          createdAt: { 
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),
      prisma.message.groupBy({
        by: ["createdAt"],
        _count: { id: true },
        where: { createdAt: { gte: startDate } },
        orderBy: { createdAt: "asc" }
      }),
      prisma.client.findMany({
        select: {
          id: true,
          name: true,
          domain: true,
          user: { select: { name: true, email: true } }
        },
        orderBy: { createdAt: "desc" },
        take: 10
      }),
      prisma.message.findMany({
        select: { content: true },
        take: 1000
      }),
      prisma.message.findMany({
        select: { createdAt: true },
        where: { createdAt: { gte: startDate } }
      })
    ]);

    // Process message trend
    const messageTrendData = messageTrend.map(item => ({
      date: item.createdAt.toISOString().split('T')[0],
      count: item._count.id
    }));

    // Calculate peak hours
    const hourlyDistribution = peakHours.reduce((acc, message) => {
      const hour = message.createdAt.getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const peakHour = Object.entries(hourlyDistribution)
      .sort(([,a], [,b]) => b - a)[0];

    // Calculate growth rates
    const previousPeriodStart = new Date(startDate);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - days);
    
    const previousPeriodMessages = await prisma.message.count({
      where: { 
        createdAt: { 
          gte: previousPeriodStart,
          lt: startDate
        }
      }
    });

    const messageGrowthRate = previousPeriodMessages > 0 
      ? ((newMessages - previousPeriodMessages) / previousPeriodMessages) * 100
      : 0;

    // Calculate average message length manually
    const averageLength = averageMessageLength.length > 0 
      ? Math.round(averageMessageLength.reduce((sum, msg) => sum + (msg.content?.length || 0), 0) / averageMessageLength.length)
      : 0;

    return NextResponse.json({
      metrics: {
        totalMessages,
        newMessages,
        messagesToday,
        messagesThisWeek,
        messagesThisMonth,
        averageLength,
        growthRate: Math.round(messageGrowthRate * 100) / 100
      },
      trends: {
        daily: messageTrendData,
        peakHour: peakHour ? { hour: peakHour[0], count: peakHour[1] } : null
      },
      topClients: await Promise.all(
        topClientsByMessages.map(async (client) => {
          const messageCount = await prisma.message.count({
            where: { clientId: client.id }
          });
          return {
            ...client,
            _count: { messages: messageCount }
          };
        })
      ),
      hourlyDistribution
    });
  } catch (error) {
    console.error("Error fetching message analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
