import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addMonths, formatCouponPlan, normalizeCouponCode } from "@/lib/coupons";
import { getActiveSubscriptionWhere } from "@/lib/subscriptions";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const code = normalizeCouponCode(body.code);
    if (!code) {
      return NextResponse.json({ error: "Valid coupon code is required" }, { status: 400 });
    }

    const existingActiveSubscription = await prisma.subscription.findFirst({
      where: getActiveSubscriptionWhere(session.user.id),
    });
    if (existingActiveSubscription) {
      return NextResponse.json(
        { error: "User already has an active subscription" },
        { status: 409 }
      );
    }

    const existingActiveRedemption = await prisma.couponRedemption.findFirst({
      where: {
        userId: session.user.id,
        cancelledAt: null,
        expiresAt: { gt: new Date() },
      },
    });
    if (existingActiveRedemption) {
      return NextResponse.json(
        { error: "A coupon has already been redeemed for this user" },
        { status: 409 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const coupon = await tx.couponCode.findUnique({
        where: { code },
        include: {
          _count: {
            select: { redemptions: true },
          },
        },
      });

      if (!coupon || !coupon.isActive) {
        throw new Error("Coupon code not found");
      }
      if (coupon.expiresAt && coupon.expiresAt <= new Date()) {
        throw new Error("Coupon code has expired");
      }
      if (coupon._count.redemptions >= coupon.usageLimit) {
        throw new Error("Coupon code usage limit reached");
      }

      const now = new Date();
      const periodEnd = addMonths(now, coupon.durationInMonths);
      const subscriptionId = crypto.randomUUID();

      await tx.subscription.create({
        data: {
          id: subscriptionId,
          plan: coupon.plan,
          referenceId: session.user.id,
          stripeCustomerId: null,
          stripeSubscriptionId: null,
          source: "coupon",
          couponCodeId: coupon.id,
          status: "active",
          periodStart: now,
          periodEnd,
          cancelAtPeriodEnd: true,
          updatedAt: now,
        },
      });

      await tx.couponRedemption.create({
        data: {
          couponCodeId: coupon.id,
          userId: session.user.id,
          subscriptionId,
          redeemedAt: now,
          expiresAt: periodEnd,
        },
      });

      await tx.onboarding.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          planId: coupon.plan,
        },
        update: {
          planId: coupon.plan,
        },
      });

      return {
        code: coupon.code,
        plan: coupon.plan,
        planLabel: formatCouponPlan(coupon.plan),
        durationInMonths: coupon.durationInMonths,
        periodEnd,
      };
    });

    return NextResponse.json({ success: true, coupon: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong";
    console.error("[COUPON_REDEEM]", error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
