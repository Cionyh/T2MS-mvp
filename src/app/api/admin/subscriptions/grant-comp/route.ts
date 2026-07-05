import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { addMonths, formatCouponPlan } from "@/lib/coupons";
import { getActiveSubscriptionWhere } from "@/lib/subscriptions";
import { tryGetStripeServerClient } from "@/lib/stripe-config";

const COMP_PLANS = new Set(["starter", "pro", "church"]);

async function cancelActiveSubscriptions(
  userId: string,
  cancelStripeBilling: boolean
) {
  const now = new Date();
  const activeSubscriptions = await prisma.subscription.findMany({
    where: getActiveSubscriptionWhere(userId),
  });

  const stripe = cancelStripeBilling ? tryGetStripeServerClient() : null;
  const cancelledIds: string[] = [];

  for (const sub of activeSubscriptions) {
    const stripeSubId = sub.stripeSubscriptionId;
    if (cancelStripeBilling && stripe && stripeSubId) {
      try {
        await stripe.subscriptions.cancel(stripeSubId);
      } catch (error) {
        console.warn(
          "[GRANT_COMP] Stripe cancel failed for",
          stripeSubId,
          error
        );
      }
    }

    await prisma.subscription.update({
      where: { id: sub.id },
      data: {
        status: "canceled",
        cancelAtPeriodEnd: true,
        canceledAt: now,
        endedAt: now,
        updatedAt: now,
      },
    });

    if (sub.source === "coupon") {
      await prisma.couponRedemption.updateMany({
        where: { subscriptionId: sub.id, cancelledAt: null },
        data: {
          cancelledAt: now,
          cancellationReason: "Replaced by admin complimentary access",
        },
      });
    }

    cancelledIds.push(sub.id);
  }

  return cancelledIds;
}

/**
 * POST /api/admin/subscriptions/grant-comp
 * Grant complimentary plan access to an existing user.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const userId =
      typeof body.userId === "string" ? body.userId.trim() : "";
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const plan = typeof body.plan === "string" ? body.plan.trim() : "";
    const durationInMonths = Number.parseInt(String(body.durationInMonths), 10);
    const cancelExistingBilling = body.cancelExistingBilling !== false;

    if (!userId && !email) {
      return NextResponse.json(
        { error: "User ID or email is required" },
        { status: 400 }
      );
    }

    if (!COMP_PLANS.has(plan)) {
      return NextResponse.json(
        { error: "Plan must be starter, pro, or church" },
        { status: 400 }
      );
    }

    if (!Number.isFinite(durationInMonths) || durationInMonths < 1 || durationInMonths > 120) {
      return NextResponse.json(
        { error: "Duration must be between 1 and 120 months" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: userId ? { id: userId } : { email },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role === "admin") {
      return NextResponse.json(
        { error: "Cannot grant complimentary access to admin accounts" },
        { status: 400 }
      );
    }

    const cancelledSubscriptionIds = cancelExistingBilling
      ? await cancelActiveSubscriptions(user.id, true)
      : await (async () => {
          const existing = await prisma.subscription.findFirst({
            where: getActiveSubscriptionWhere(user.id),
          });
          if (existing) {
            return NextResponse.json(
              {
                error:
                  "User already has an active subscription. Enable cancel existing billing or cancel it manually first.",
              },
              { status: 409 }
            );
          }
          return [];
        })();

    if (cancelledSubscriptionIds instanceof NextResponse) {
      return cancelledSubscriptionIds;
    }

    const now = new Date();
    const periodEnd = addMonths(now, durationInMonths);
    const subscriptionId = crypto.randomUUID();

    const subscription = await prisma.$transaction(async (tx) => {
      const created = await tx.subscription.create({
        data: {
          id: subscriptionId,
          plan,
          referenceId: user.id,
          stripeCustomerId: null,
          stripeSubscriptionId: null,
          source: "admin_comp",
          status: "active",
          periodStart: now,
          periodEnd,
          cancelAtPeriodEnd: true,
          updatedAt: now,
        },
      });

      await tx.onboarding.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          planId: plan,
        },
        update: {
          planId: plan,
        },
      });

      return created;
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      subscription: {
        id: subscription.id,
        plan: subscription.plan,
        planLabel: formatCouponPlan(subscription.plan),
        source: subscription.source,
        status: subscription.status,
        periodStart: subscription.periodStart,
        periodEnd: subscription.periodEnd,
        durationInMonths,
      },
      cancelledSubscriptionIds,
    });
  } catch (error) {
    console.error("[GRANT_COMP]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
