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

    // User analytics
    const [
      totalUsers,
      newUsers,
      activeUsers,
      bannedUsers,
      userRoles,
      userRegistrationTrend,
      topUsersByClients,
      userRetention
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: startDate } } }),
      prisma.user.count({ 
        where: { 
          sessions: { some: { expiresAt: { gte: new Date() } } }
        }
      }),
      prisma.user.count({ where: { banned: true } }),
      prisma.user.groupBy({
        by: ["role"],
        _count: { id: true }
      }),
      prisma.user.groupBy({
        by: ["createdAt"],
        _count: { id: true },
        where: { createdAt: { gte: startDate } },
        orderBy: { createdAt: "asc" }
      }),
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true
        },
        orderBy: { createdAt: "desc" },
        take: 10
      }),
      prisma.user.findMany({
        where: { createdAt: { gte: startDate } },
        select: {
          id: true,
          createdAt: true,
          sessions: {
            select: { createdAt: true },
            orderBy: { createdAt: "desc" },
            take: 1
          }
        }
      })
    ]);

    // Process registration trend
    const registrationTrend = userRegistrationTrend.map(item => ({
      date: item.createdAt.toISOString().split('T')[0],
      count: item._count.id
    }));

    // Calculate retention rate (users who logged in within 7 days of registration)
    const retentionRate = userRetention.length > 0 
      ? userRetention.filter(user => {
          const lastSession = user.sessions[0];
          if (!lastSession) return false;
          const daysDiff = (lastSession.createdAt.getTime() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24);
          return daysDiff <= 7;
        }).length / userRetention.length * 100
      : 0;

    // Role distribution
    const roleDistribution = userRoles.reduce((acc, role) => {
      acc[role.role || "user"] = role._count.id;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      metrics: {
        totalUsers,
        newUsers,
        activeUsers,
        bannedUsers,
        retentionRate: Math.round(retentionRate * 100) / 100
      },
      distribution: {
        roles: roleDistribution
      },
      trends: {
        registration: registrationTrend
      },
      topUsers: topUsersByClients
    });
  } catch (error) {
    console.error("Error fetching user analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
