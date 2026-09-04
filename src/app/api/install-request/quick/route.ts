import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { INSTALL_JOB_STATUS, ACCESS_METHOD, INSTALL_TYPE } from "@/lib/job-status";
import { verifyOrganizationAccess } from "@/lib/organization-helpers";

/**
 * POST /api/install-request/quick
 * Create a queued install request immediately (no payment).
 *
 * Intended for the "Get Widget Installed" flow in the client dashboard.
 * Requires a clientId (existing site) and SMS consent.
 *
 * If an active (non-terminal) job already exists for the site, returns that jobId instead.
 * Exception: auto-created placeholder jobs (platform "To be confirmed", QUEUED) are upgraded
 * in place on first submit instead of returning reused.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await req.json();
    const { clientId, smsConsentConfirmed, platformAccessConfirmed } = body as {
      clientId?: string;
      smsConsentConfirmed?: boolean;
      platformAccessConfirmed?: boolean;
    };

    if (!clientId || typeof clientId !== "string") {
      return NextResponse.json({ error: "clientId is required" }, { status: 400 });
    }
    if (smsConsentConfirmed !== true) {
      return NextResponse.json(
        { error: "SMS consent must be confirmed." },
        { status: 400 }
      );
    }

    const client = await prisma.client.findFirst({
      where: { id: clientId },
      select: { id: true, organizationId: true, domain: true },
    });
    if (!client?.organizationId) {
      return NextResponse.json(
        { error: "Site not found or not in your organization" },
        { status: 400 }
      );
    }

    const access = await verifyOrganizationAccess(userId, client.organizationId);
    if (!access.hasAccess) {
      return NextResponse.json({ error: "You do not have access to this site" }, { status: 403 });
    }

    const baseUrl = client.domain.startsWith("http") ? client.domain : `https://${client.domain}`;

    async function touchCustomerConsent() {
      const now = new Date();
      let customer = await prisma.customer.findUnique({
        where: { userId },
      });
      if (!customer) {
        customer = await prisma.customer.create({
          data: {
            userId,
            smsConsentConfirmedAt: now,
            onboardingCompletedAt: now,
          },
        });
      } else {
        await prisma.customer.update({
          where: { id: customer.id },
          data: {
            smsConsentConfirmedAt: now,
            onboardingCompletedAt: customer.onboardingCompletedAt ?? now,
          },
        });
      }
      return customer;
    }

    /** Auto-created when registering a site; should be upgraded on first real submit, not treated as duplicate. */
    const PLACEHOLDER_PLATFORM = "To be confirmed";

    // Reuse active job if one already exists for this site (except placeholder QUEUED jobs)
    const existingActive = await prisma.installJob.findFirst({
      where: {
        clientId,
        status: {
          notIn: [INSTALL_JOB_STATUS.COMPLETED, INSTALL_JOB_STATUS.CANCELLED],
        },
      },
      orderBy: { createdAt: "desc" },
      select: { id: true, platform: true, status: true },
    });

    if (existingActive) {
      const isPlaceholder =
        existingActive.status === INSTALL_JOB_STATUS.QUEUED &&
        existingActive.platform === PLACEHOLDER_PLATFORM;

      if (isPlaceholder) {
        const customer = await touchCustomerConsent();
        await prisma.installJob.update({
          where: { id: existingActive.id },
          data: {
            customerId: customer.id,
            platform: "Customer will invite",
            installType: INSTALL_TYPE.SCRIPT,
            websiteUrls: [baseUrl],
            preferredPlacement: null,
            accessMethod: ACCESS_METHOD.INSTRUCTIONS_ONLY,
            accessCredentials: JSON.stringify({}),
            notes: null,
          },
        });
        return NextResponse.json({ jobId: existingActive.id, reused: false });
      }

      return NextResponse.json({ jobId: existingActive.id, reused: true });
    }

    const customer = await touchCustomerConsent();
    const job = await prisma.installJob.create({
      data: {
        customerId: customer.id,
        clientId,
        platform: "Customer will invite",
        installType: INSTALL_TYPE.SCRIPT,
        websiteUrls: [baseUrl],
        preferredPlacement: null,
        accessMethod: ACCESS_METHOD.INSTRUCTIONS_ONLY,
        accessCredentials: JSON.stringify({}),
        notes: null,
        status: INSTALL_JOB_STATUS.QUEUED,
        priority: 0,
        checklistCompleted: false,
        proofUploaded: false,
      },
    });

    return NextResponse.json({ jobId: job.id, reused: false });
  } catch (error) {
    console.error("Quick install request error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

