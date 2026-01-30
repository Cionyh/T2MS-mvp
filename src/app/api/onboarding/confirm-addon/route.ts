import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  return new Stripe(key, { apiVersion: "2025-08-27.basil" });
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { sessionId } = body as { sessionId?: string };

    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json(
        { error: "Missing session_id" },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const stripeSession = await stripe.checkout.sessions.retrieve(
      sessionId,
      { expand: ["payment_intent"] }
    );

    if (stripeSession.payment_status !== "paid" || !stripeSession.metadata?.installAddonSku) {
      return NextResponse.json(
        { error: "Invalid or unpaid session" },
        { status: 400 }
      );
    }
    if (stripeSession.client_reference_id !== session.user.id) {
      return NextResponse.json(
        { error: "Session does not belong to this user" },
        { status: 403 }
      );
    }

    const paymentIntentId =
      typeof stripeSession.payment_intent === "object" && stripeSession.payment_intent
        ? stripeSession.payment_intent.id
        : stripeSession.payment_intent ?? null;

    await prisma.onboarding.update({
      where: { userId: session.user.id },
      data: {
        installAddonStatus: "paid",
        stripePaymentIntentId: paymentIntentId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Onboarding confirm-addon error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
