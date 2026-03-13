import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { INSTALL_JOB_STATUS, ACCESS_METHOD } from "@/lib/job-status";
import { verifyOrganizationAccess } from "@/lib/organization-helpers";

/**
 * POST /api/install-request/onboarding-setup
 * Updates the existing InstallJob for the given client (created during onboarding)
 * with website/access details. No payment; used after phone verification in onboarding.
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
    const {
      clientId,
      websiteUrls,
      platform,
      installType,
      preferredPlacement,
      accessMethod,
      accessCredentials,
      notes,
      smsConsentConfirmed,
    } = body as {
      clientId?: string;
      websiteUrls?: string[];
      platform?: string;
      installType?: string;
      preferredPlacement?: string;
      accessMethod?: string;
      accessCredentials?: unknown;
      notes?: string;
      smsConsentConfirmed?: boolean;
    };

    if (!clientId || typeof clientId !== "string") {
      return NextResponse.json(
        { error: "clientId is required" },
        { status: 400 }
      );
    }

    if (smsConsentConfirmed !== true) {
      return NextResponse.json(
        { error: "SMS consent must be confirmed." },
        { status: 400 }
      );
    }

    if (!platform || !accessMethod) {
      return NextResponse.json(
        { error: "Platform and access method are required" },
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

    const access = await verifyOrganizationAccess(session.user.id, client.organizationId);
    if (!access.hasAccess) {
      return NextResponse.json(
        { error: "You do not have access to this site" },
        { status: 403 }
      );
    }

    let urls: string[] = [];
    if (websiteUrls && Array.isArray(websiteUrls) && websiteUrls.length > 0) {
      urls = (websiteUrls as string[]).filter((u) => typeof u === "string" && u.trim());
    }
    if (urls.length === 0) {
      const base = client.domain.startsWith("http") ? client.domain : `https://${client.domain}`;
      urls = [base];
    }

    if (accessCredentials && typeof accessCredentials === "object" && Object.keys(accessCredentials as object).length > 0) {
      const creds = accessCredentials as Record<string, unknown>;
      if (accessMethod === ACCESS_METHOD.TEMPORARY_LOGIN) {
        if (!creds.adminUrl || !creds.username || !creds.password || !creds.expiry) {
          return NextResponse.json(
            { error: "All temporary login fields are required" },
            { status: 400 }
          );
        }
      } else if (accessMethod === ACCESS_METHOD.ADMIN_INVITE) {
        if (!creds.email) {
          return NextResponse.json(
            { error: "Invite email is required" },
            { status: 400 }
          );
        }
      } else if (accessMethod === ACCESS_METHOD.INSTRUCTIONS_ONLY) {
        if (!creds.steps || String(creds.steps).trim().length === 0) {
          return NextResponse.json(
            { error: "Instructions are required" },
            { status: 400 }
          );
        }
      }
    }

    const existingJob = await prisma.installJob.findFirst({
      where: { clientId },
      orderBy: { createdAt: "desc" },
      select: { id: true, status: true },
    });

    if (!existingJob) {
      return NextResponse.json(
        { error: "No install job found for this site. Please try again from the dashboard." },
        { status: 400 }
      );
    }

    if (existingJob.status !== INSTALL_JOB_STATUS.QUEUED) {
      return NextResponse.json(
        { error: "This install request can no longer be updated." },
        { status: 400 }
      );
    }

    const now = new Date();
    let customer = await prisma.customer.findUnique({
      where: { userId: session.user.id },
    });
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          userId: session.user.id,
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

    await prisma.installJob.update({
      where: { id: existingJob.id },
      data: {
        platform,
        installType: installType && ["script", "iframe"].includes(installType) ? installType : "script",
        websiteUrls: urls,
        preferredPlacement: preferredPlacement || null,
        accessMethod,
        accessCredentials: JSON.stringify(accessCredentials || {}),
        notes: notes || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Onboarding install setup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
