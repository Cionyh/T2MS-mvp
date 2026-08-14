import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getChurchStripePriceId, CHURCH_PLAN_ID } from "@/lib/church-pricing";
import { getChurchPriceLockUntil } from "@/lib/church-verification";
import { getStripePriceIds, getStripeServerClient } from "@/lib/stripe-config";
import type Stripe from "stripe";

const churchPriceId = getChurchStripePriceId();
const stripePriceIds = getStripePriceIds();

const PLAN_PRICE_IDS = [
  stripePriceIds.starter,
  stripePriceIds.pro,
  stripePriceIds.enterprise,
  churchPriceId,
].filter(Boolean) as string[];

const PRICE_TO_PLAN: Record<string, string> = {
  ...(stripePriceIds.starter ? { [stripePriceIds.starter]: "starter" } : {}),
  ...(stripePriceIds.pro ? { [stripePriceIds.pro]: "pro" } : {}),
  ...(stripePriceIds.enterprise ? { [stripePriceIds.enterprise]: "enterprise" } : {}),
  ...(churchPriceId ? { [churchPriceId]: "church" } : {}),
};

function getPlanFromPriceId(
  priceId: string,
  stripeMetadata?: Stripe.Metadata | null
): string {
  const mapped = PRICE_TO_PLAN[priceId]
  if (mapped) return mapped
  if (
    stripeMetadata?.church_intro === "true" ||
    stripeMetadata?.plan === CHURCH_PLAN_ID
  ) {
    return CHURCH_PLAN_ID
  }
  return "starter"
}

/**
 * Sync subscriptions from Stripe to the database.
 * Fixes "Payment pending" when webhooks succeeded but the DB wasn't updated.
 */
export async function POST() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stripe = getStripeServerClient();
    const userId = session.user.id;

    let stripeCustomerId: string | null = null;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true, email: true },
    });

    if (user?.stripeCustomerId) {
      stripeCustomerId = user.stripeCustomerId;
    } else if (user?.email) {
      const customers = await stripe.customers.search({
        query: `email:"${user.email.replace(/"/g, '\\"')}" AND -metadata["customerType"]:"organization"`,
        limit: 1,
      });
      const customer = customers.data[0];
      if (customer) {
        stripeCustomerId = customer.id;
        await prisma.user.update({
          where: { id: userId },
          data: { stripeCustomerId: customer.id },
        });
      }
    }

    if (!stripeCustomerId) {
      return NextResponse.json(
        { synced: 0, message: "No Stripe customer found" },
        { status: 200 }
      );
    }

    const stripeSubscriptions = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: "all",
      limit: 10,
    });

    let synced = 0;

    for (const sub of stripeSubscriptions.data) {
      if (sub.status !== "active" && sub.status !== "trialing") continue;

      const item = sub.items.data[0];
      if (!item) continue;

      const priceId = item.price.id;
      if (!PLAN_PRICE_IDS.includes(priceId) && sub.metadata?.church_intro !== "true") {
        continue;
      }

      let plan = getPlanFromPriceId(priceId, sub.metadata);
      const onboarding = await prisma.onboarding.findUnique({
        where: { userId },
        select: { planId: true, churchVerificationStatus: true },
      });
      // Church checkout must not be stored as starter when price IDs overlap or webhook named it wrong
      if (
        plan === "starter" &&
        (onboarding?.planId === CHURCH_PLAN_ID ||
          onboarding?.churchVerificationStatus === "verified" ||
          sub.metadata?.church_intro === "true")
      ) {
        plan = CHURCH_PLAN_ID;
      }
      const periodStart = new Date(item.current_period_start * 1000);
      const periodEnd = new Date(item.current_period_end * 1000);
      const trialStart = sub.trial_start
        ? new Date(sub.trial_start * 1000)
        : null;
      const trialEnd = sub.trial_end ? new Date(sub.trial_end * 1000) : null;

      const subscriptionData = {
        plan,
        status: sub.status,
        referenceId: userId,
        stripeCustomerId,
        stripeSubscriptionId: sub.id,
        periodStart,
        periodEnd,
        trialStart,
        trialEnd,
        cancelAtPeriodEnd: sub.cancel_at_period_end ?? false,
        seats: item.quantity ?? 1,
      };

      const existing = await prisma.subscription.findFirst({
        where: {
          OR: [
            { stripeSubscriptionId: sub.id },
            { referenceId: userId, status: { in: ["active", "trialing"] } },
          ],
        },
        orderBy: { periodStart: "desc" },
      });

      if (existing) {
        await prisma.subscription.update({
          where: { id: existing.id },
          data: subscriptionData,
        });
      } else {
        await prisma.subscription.create({
          data: {
            id: sub.id,
            ...subscriptionData,
          },
        });
      }

      if (plan === CHURCH_PLAN_ID) {
        const priceLockedUntil = getChurchPriceLockUntil(new Date());
        await prisma.onboarding.upsert({
          where: { userId },
          create: {
            userId,
            planId: CHURCH_PLAN_ID,
            churchPriceLockedUntil: priceLockedUntil,
          },
          update: {
            planId: CHURCH_PLAN_ID,
            churchPriceLockedUntil: priceLockedUntil,
          },
        });

        try {
          await stripe.subscriptions.update(sub.id, {
            metadata: {
              church_intro: "true",
              price_lock_until: priceLockedUntil.toISOString(),
            },
          });
        } catch (metaErr) {
          console.warn("[subscription/sync] church metadata update failed:", metaErr);
        }
      }

      synced++;
    }

    return NextResponse.json({
      synced,
      message: synced > 0 ? "Subscription synced successfully" : "No active subscriptions to sync",
    });
  } catch (error) {
    console.error("Subscription sync error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Sync failed" },
      { status: 500 }
    );
  }
}
