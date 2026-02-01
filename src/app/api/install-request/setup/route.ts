import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { INSTALL_JOB_STATUS, ACCESS_METHOD } from "@/lib/job-status";

const REQUIRED_CONSENT_TEXT =
  "I confirm I have permission to message my contacts using T2MS and understand SMS compliance requirements (TCPA/CTIA).";

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
      platform,
      installType,
      preferredPlacement,
      accessMethod,
      accessCredentials,
      notes,
      smsConsentText,
    } = body as {
      websiteUrls?: string[];
      platform?: string;
      installType?: string;
      preferredPlacement?: string;
      accessMethod?: string;
      accessCredentials?: unknown;
      notes?: string;
      smsConsentText?: string;
    };

    if (
      typeof smsConsentText !== "string" ||
      smsConsentText.trim().toLowerCase() !== REQUIRED_CONSENT_TEXT.toLowerCase()
    ) {
      return NextResponse.json(
        { error: "SMS consent text must be typed exactly as shown" },
        { status: 400 }
      );
    }

    if (
      !websiteUrls ||
      !Array.isArray(websiteUrls) ||
      websiteUrls.length === 0 ||
      !platform ||
      !installType ||
      !["script", "iframe"].includes(installType) ||
      !accessMethod
    ) {
      return NextResponse.json(
        { error: "Install setup fields (URLs, platform, install type, access method) are required" },
        { status: 400 }
      );
    }

    const urls = (websiteUrls as string[]).filter((u) => typeof u === "string" && u.trim());
    if (urls.length === 0) {
      return NextResponse.json(
        { error: "At least one valid website URL is required" },
        { status: 400 }
      );
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
        platform,
        installType,
        websiteUrls: urls,
        preferredPlacement: preferredPlacement || null,
        accessMethod,
        accessCredentials: JSON.stringify(accessCredentials || {}),
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
