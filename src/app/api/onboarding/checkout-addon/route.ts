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

const INSTALL_ADDON_AMOUNTS: Record<string, { amount: number; name: string }> = {
  standard: { amount: 999, name: "Standard website install (script embed)" },
  restricted: { amount: 999, name: "Restricted platform install (Google Sites / iframe)" },
};

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { installAddonSku, successUrl, cancelUrl } = body as {
      installAddonSku: string;
      successUrl?: string;
      cancelUrl?: string;
    };

    const addon = INSTALL_ADDON_AMOUNTS[installAddonSku];
    if (!addon) {
      return NextResponse.json(
        { error: "Invalid install add-on" },
        { status: 400 }
      );
    }

    const onboarding = await prisma.onboarding.findUnique({
      where: { userId: session.user.id },
    });
    if (!onboarding || onboarding.installAddonSku !== installAddonSku) {
      return NextResponse.json(
        { error: "Onboarding plan not set or add-on mismatch" },
        { status: 400 }
      );
    }
    if (onboarding.installAddonStatus === "paid") {
      return NextResponse.json(
        { error: "Install add-on already paid", alreadyPaid: true },
        { status: 400 }
      );
    }

    const origin = req.nextUrl.origin;
    const success = successUrl ?? `${origin}/onboarding?step=3`;
    const cancel = cancelUrl ?? `${origin}/onboarding?step=1`;

    const stripe = getStripe();
    const stripeSession = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: session.user.email ?? undefined,
      client_reference_id: session.user.id,
      metadata: {
        userId: session.user.id,
        type: "install_addon",
        installAddonSku,
      },
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: addon.amount,
            product_data: {
              name: addon.name,
              description: "One-time install add-on",
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${success}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancel,
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (error) {
    console.error("Onboarding checkout-addon error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
