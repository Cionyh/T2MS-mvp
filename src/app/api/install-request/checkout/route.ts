import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { INSTALL_JOB_STATUS } from "@/lib/job-status";
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
 * Create Stripe checkout for an install job. Requires jobId (InstallJob with PENDING_PAYMENT).
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
    const { installAddonSku, successUrl, cancelUrl, jobId } = body as {
      installAddonSku: string;
      successUrl?: string;
      cancelUrl?: string;
      jobId?: string;
    };

    if (!jobId || typeof jobId !== "string") {
      return NextResponse.json(
        { error: "jobId is required (submit the setup form first)" },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.findUnique({
      where: { userId: session.user.id },
      include: {
        installJobs: {
          where: { id: jobId, status: INSTALL_JOB_STATUS.PENDING_PAYMENT },
        },
      },
    });
    const job = customer?.installJobs?.[0];
    if (!job) {
      return NextResponse.json(
        { error: "Job not found or payment already completed. Please submit the setup form again." },
        { status: 400 }
      );
    }

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
        jobId,
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
