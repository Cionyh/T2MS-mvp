import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    // Check admin authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get subscriptions from the last 12 months
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const subscriptions = await prisma.subscription.findMany({
      where: {
        periodStart: {
          gte: twelveMonthsAgo,
        },
      },
      orderBy: { periodStart: "asc" },
    });

    // Monthly subscription growth
    const monthlyGrowth = Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (11 - i));
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const monthSubscriptions = subscriptions.filter(sub => {
        if (!sub.periodStart) return false;
        return sub.periodStart >= monthStart && sub.periodStart <= monthEnd;
      });

      return {
        month: monthStart.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        subscriptions: monthSubscriptions.length,
        active: monthSubscriptions.filter(sub => sub.status === "active").length,
        trials: monthSubscriptions.filter(sub => sub.status === "trialing").length,
      };
    });

    // Plan distribution for pie chart
    const planDistribution = subscriptions.reduce((acc, sub) => {
      const plan = sub.plan.split("_")[0]; // Extract base plan name
      acc[plan] = (acc[plan] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const planChartData = Object.entries(planDistribution).map(([plan, count]) => ({
      name: plan.charAt(0).toUpperCase() + plan.slice(1),
      value: count,
    }));

    // Status distribution for pie chart
    const statusDistribution = subscriptions.reduce((acc, sub) => {
      const status = sub.status || "unknown";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusChartData = Object.entries(statusDistribution).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
    }));

    // Revenue over time (mock data)
    const revenueData = monthlyGrowth.map(month => ({
      month: month.month,
      revenue: month.subscriptions * 29.99, // Mock average revenue per subscription
    }));

    // Trial conversion rate
    const totalTrials = subscriptions.filter(sub => sub.trialStart).length;
    const convertedTrials = subscriptions.filter(sub => 
      sub.trialStart && sub.status === "active"
    ).length;
    const conversionRate = totalTrials > 0 ? (convertedTrials / totalTrials) * 100 : 0;

    return NextResponse.json({
      monthlyGrowth,
      planChartData,
      statusChartData,
      revenueData,
      conversionRate: Math.round(conversionRate * 100) / 100,
    });
  } catch (error) {
    console.error("Error fetching subscription charts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
