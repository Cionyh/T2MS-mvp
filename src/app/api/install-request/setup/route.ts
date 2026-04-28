import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { INSTALL_JOB_STATUS, ACCESS_METHOD, type AccessMethod } from "@/lib/job-status";
import { getActiveOrganization } from "@/lib/organization-helpers";
import { checkSiteLimit } from "@/lib/plan-limits";

const VALID_ACCESS_METHODS: string[] = [ACCESS_METHOD.TEMPORARY_LOGIN, ACCESS_METHOD.ADMIN_INVITE, ACCESS_METHOD.INSTRUCTIONS_ONLY];

/**
 * POST /api/install-request/setup
 * Submit install setup form first. Creates Customer (if needed) and InstallJob with PENDING_PAYMENT.
 * Returns { jobId }. User then goes to payment; after payment, confirm API updates job to QUEUED.
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
      websiteUrls,
      clientId: requestClientId,
      platform,
      installType,
      preferredPlacement,
      accessMethod,
      accessCredentials,
      notes,
      smsConsentConfirmed,
    } = body as {
      websiteUrls?: string[];
      clientId?: string;
      platform?: string;
      installType?: string;
      preferredPlacement?: string;
      accessMethod?: string;
      accessCredentials?: unknown;
      notes?: string;
      smsConsentConfirmed?: boolean;
    };

    if (smsConsentConfirmed !== true) {
      return NextResponse.json(
        { error: "SMS consent must be confirmed." },
        { status: 400 }
      );
    }

    const installTypeValue = installType && ["script", "iframe"].includes(installType) ? installType : "script";
    const platformValue = platform && String(platform).trim() ? String(platform).trim() : "Customer will invite";
    const accessMethodValue: AccessMethod =
      typeof accessMethod === "string" && VALID_ACCESS_METHODS.includes(accessMethod)
        ? (accessMethod as AccessMethod)
        : ACCESS_METHOD.INSTRUCTIONS_ONLY;
    const isInviteOnly = platformValue === "Customer will invite" || accessMethodValue === ACCESS_METHOD.INSTRUCTIONS_ONLY;

    let urls: string[] = [];
    if (websiteUrls && Array.isArray(websiteUrls) && websiteUrls.length > 0) {
      urls = (websiteUrls as string[]).filter((u) => typeof u === "string" && u.trim());
    }

    let clientId: string | null = requestClientId && typeof requestClientId === "string" ? requestClientId : null;

    if (clientId) {
      const client = await prisma.client.findFirst({
        where: { id: clientId },
        select: { id: true, organizationId: true, domain: true },
      });
      if (!client?.organizationId) {
        return NextResponse.json({ error: "Site not found or not in your organization" }, { status: 400 });
      }
      if (urls.length === 0) {
        const base = (client as { domain: string }).domain?.startsWith("http")
          ? (client as { domain: string }).domain
          : `https://${(client as { domain: string }).domain}`;
        urls = [base];
      }
      const { verifyOrganizationAccess } = await import("@/lib/organization-helpers");
      const access = await verifyOrganizationAccess(session.user.id, client.organizationId);
      if (!access.hasAccess) {
        return NextResponse.json({ error: "You do not have access to this site" }, { status: 403 });
      }
    } else {
      if (urls.length === 0) {
        return NextResponse.json(
          { error: "Either clientId or at least one website URL is required" },
          { status: 400 }
        );
      }
      const organizationId = await getActiveOrganization();
      if (!organizationId) {
        return NextResponse.json(
          { error: "No active organization. Please complete onboarding first." },
          { status: 400 }
        );
      }
      const siteLimit = await checkSiteLimit(organizationId);
      if (!siteLimit.allowed) {
        return NextResponse.json(
          { error: `Site limit reached (${siteLimit.current}/${siteLimit.limit}). Upgrade to add more sites.` },
          { status: 403 }
        );
      }
      const rawUrl = urls[0];
      let normalizedDomain: string;
      try {
        const url = new URL(
          rawUrl.startsWith("http://") || rawUrl.startsWith("https://") ? rawUrl : `https://${rawUrl}`
        );
        normalizedDomain = url.hostname.replace(/^www\./, "");
      } catch {
        return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
      }
      const existing = await prisma.client.findUnique({
        where: { domain: normalizedDomain },
        select: { id: true, organizationId: true },
      });
      if (existing) {
        if (existing.organizationId !== organizationId) {
          return NextResponse.json(
            { error: "This domain is already registered to another account." },
            { status: 400 }
          );
        }
        clientId = existing.id;
      } else {
        const name = normalizedDomain.replace(/\.[a-z]+$/i, "").replace(/\./g, " ") || normalizedDomain;
        const newClient = await prisma.client.create({
          data: {
            name,
            domain: normalizedDomain,
            organizationId,
            defaultType: "banner",
            defaultBgColor: "#222",
            defaultTextColor: "#fff",
            defaultFont: "sans-serif",
            defaultDismissAfter: 0,
            pinned: false,
          },
        });
        clientId = newClient.id;
      }
    }

    if (!isInviteOnly && accessCredentials && typeof accessCredentials === "object" && Object.keys(accessCredentials as object).length > 0) {
      const creds = accessCredentials as Record<string, unknown>;
      if (accessMethodValue === ACCESS_METHOD.TEMPORARY_LOGIN) {
        if (!creds.adminUrl || !creds.username || !creds.password || !creds.expiry) {
          return NextResponse.json(
            { error: "All temporary login fields are required" },
            { status: 400 }
          );
        }
      } else if (accessMethodValue === ACCESS_METHOD.ADMIN_INVITE) {
        if (!creds.email) {
          return NextResponse.json(
            { error: "Invite email is required" },
            { status: 400 }
          );
        }
      } else if (accessMethodValue === ACCESS_METHOD.INSTRUCTIONS_ONLY) {
        if (!creds.steps || String(creds.steps).trim().length === 0) {
          return NextResponse.json(
            { error: "Instructions are required" },
            { status: 400 }
          );
        }
      }
    }

    const credentialsToStore = isInviteOnly ? {} : (accessCredentials && typeof accessCredentials === "object" ? accessCredentials : {});

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
          onboardingCompletedAt: now,
        },
      });
    }

    const job = await prisma.installJob.create({
      data: {
        customerId: customer.id,
        clientId: clientId || undefined,
        platform: platformValue,
        installType: installTypeValue,
        websiteUrls: urls,
        preferredPlacement: preferredPlacement || null,
        accessMethod: accessMethodValue,
        accessCredentials: JSON.stringify(credentialsToStore),
        notes: notes || null,
        status: INSTALL_JOB_STATUS.PENDING_PAYMENT,
        priority: 0,
        checklistCompleted: false,
        proofUploaded: false,
      },
    });

    return NextResponse.json({ jobId: job.id });
  } catch (error) {
    console.error("Install request setup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
