import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Stripe from "stripe";

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  return new Stripe(key, { apiVersion: "2025-08-27.basil" });
}

const INSTALL_ADDON_AMOUNTS: Record<string, { amount: number; name: string }> = {
  standard: { amount: 1999, name: "Standard website install (script embed)" },
  restricted: { amount: 3999, name: "Restricted platform install (Google Sites / iframe)" },
};

/**
 * POST /api/install-request/checkout
 * Create Stripe checkout for a new widget install job (from dashboard "Get Widget Installed").
 * Does not require onboarding record — this is a standalone install job with payment.
 */
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

    const origin = req.nextUrl.origin;
    const success = successUrl ?? `${origin}/app/install-request`;
    const cancel = cancelUrl ?? `${origin}/app/install-request`;

    const stripe = getStripe();
    const stripeSession = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: session.user.email ?? undefined,
      client_reference_id: session.user.id,
      metadata: {
        userId: session.user.id,
        type: "install_job_request",
        installAddonSku,
      },
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: addon.amount,
            product_data: {
              name: addon.name,
              description: "One-time widget install job",
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
    console.error("Install request checkout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
