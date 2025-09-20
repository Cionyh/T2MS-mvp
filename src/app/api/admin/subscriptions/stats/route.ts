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

    // Get all subscriptions
    const subscriptions = await prisma.subscription.findMany();

    // Calculate stats
    const totalSubscriptions = subscriptions.length;
    const activeSubscriptions = subscriptions.filter(sub => sub.status === "active").length;
    const trialSubscriptions = subscriptions.filter(sub => sub.status === "trialing").length;
    const cancelledSubscriptions = subscriptions.filter(sub => sub.status === "canceled").length;

    // Calculate revenue (mock calculation - you'll need to implement actual pricing)
    const monthlyRevenue = subscriptions
      .filter(sub => sub.status === "active" && sub.plan.includes("monthly"))
      .reduce((sum, sub) => {
        // Mock pricing based on plan
        const planPrices: Record<string, number> = {
          "basic_monthly": 9.99,
          "pro_monthly": 29.99,
          "enterprise_monthly": 99.99,
        };
        return sum + (planPrices[sub.plan] || 0);
      }, 0);

    const annualRevenue = subscriptions
      .filter(sub => sub.status === "active" && sub.plan.includes("annual"))
      .reduce((sum, sub) => {
        const planPrices: Record<string, number> = {
          "basic_annual": 99.99,
          "pro_annual": 299.99,
          "enterprise_annual": 999.99,
        };
        return sum + (planPrices[sub.plan] || 0);
      }, 0);

    // Calculate average seats
    const seatsSubscriptions = subscriptions.filter(sub => sub.seats && sub.seats > 0);
    const averageSeats = seatsSubscriptions.length > 0 
      ? seatsSubscriptions.reduce((sum, sub) => sum + (sub.seats || 0), 0) / seatsSubscriptions.length 
      : 0;

    // Plan distribution
    const planDistribution = subscriptions.reduce((acc, sub) => {
      acc[sub.plan] = (acc[sub.plan] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Status distribution
    const statusDistribution = subscriptions.reduce((acc, sub) => {
      const status = sub.status || "unknown";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      totalSubscriptions,
      activeSubscriptions,
      trialSubscriptions,
      cancelledSubscriptions,
      monthlyRevenue: Math.round(monthlyRevenue * 100) / 100,
      annualRevenue: Math.round(annualRevenue * 100) / 100,
      averageSeats: Math.round(averageSeats * 100) / 100,
      planDistribution,
      statusDistribution,
    });
  } catch (error) {
    console.error("Error fetching subscription stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
