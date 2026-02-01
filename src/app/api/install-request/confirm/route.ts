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

/**
 * GET /api/install-request/confirm?session_id=xxx
 * Verify Stripe checkout session. If metadata.jobId present, update that InstallJob to QUEUED.
 * Returns { success: true }; client redirects to install-requests.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessionId = req.nextUrl.searchParams.get("session_id");
    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing session_id" },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);

    if (stripeSession.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment not completed" },
        { status: 400 }
      );
    }
    if (stripeSession.metadata?.type !== "install_job_request") {
      return NextResponse.json(
        { error: "Invalid session type" },
        { status: 400 }
      );
    }
    if (stripeSession.client_reference_id !== session.user.id) {
      return NextResponse.json(
        { error: "Session does not belong to this user" },
        { status: 403 }
      );
    }

    const jobId = stripeSession.metadata?.jobId;
    if (jobId) {
      const customer = await prisma.customer.findUnique({
        where: { userId: session.user.id },
        include: {
          installJobs: {
            where: { id: jobId, status: INSTALL_JOB_STATUS.PENDING_PAYMENT },
          },
        },
      });
      const job = customer?.installJobs?.[0];
      if (job) {
        await prisma.installJob.update({
          where: { id: job.id },
          data: { status: INSTALL_JOB_STATUS.QUEUED },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Install request confirm error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
