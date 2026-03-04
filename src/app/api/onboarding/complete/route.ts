import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { INSTALL_JOB_STATUS, ACCESS_METHOD } from "@/lib/job-status";
import { sendEmail } from "@/lib/sendgrid";
import { renderWelcomeEmail } from "@/lib/email-templates";

const REQUIRED_CONSENT_TEXT =
  "I confirm I have permission to message my contacts using T2MS and understand SMS compliance requirements (TCPA/CTIA).";

/**
 * PATCH /api/onboarding/complete
 * Complete onboarding. If install setup + SMS consent provided → create Customer + InstallJob and set consent.
 * Always sets Onboarding.completedAt.
 */
export async function PATCH(req: NextRequest) {
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
      smsConsentConfirmed,
      smsConsentText,
    } = body as {
      websiteUrls?: string[];
      platform?: string;
      installType?: string;
      preferredPlacement?: string;
      accessMethod?: string;
      accessCredentials?: unknown;
      notes?: string;
      smsConsentConfirmed?: boolean;
      smsConsentText?: string;
    };

    const now = new Date();

    // If install setup fields provided → create Customer + InstallJob (requires SMS consent per requirements)
    const hasInstallSetup =
      websiteUrls &&
      Array.isArray(websiteUrls) &&
      websiteUrls.length > 0 &&
      platform &&
      installType &&
      ["script", "iframe"].includes(installType) &&
      accessMethod;

    // SMS consent is required only when creating an Install Job (per requirements: "hard gate before we create the Install Job")
    if (hasInstallSetup) {
      if (!smsConsentConfirmed) {
        return NextResponse.json(
          { error: "SMS consent must be confirmed" },
          { status: 400 }
        );
      }
      if (
        typeof smsConsentText !== "string" ||
        smsConsentText.trim().toLowerCase() !== REQUIRED_CONSENT_TEXT.toLowerCase()
      ) {
        return NextResponse.json(
          { error: "SMS consent text must be typed exactly as shown" },
          { status: 400 }
        );
      }
    }

    if (hasInstallSetup) {
      // Validate access credentials only when provided (onboarding form may not send them yet)
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

      const urls = (websiteUrls as string[]).filter((u) => typeof u === "string" && u.trim());
      await prisma.installJob.create({
        data: {
          customerId: customer.id,
          platform,
          installType,
          websiteUrls: urls,
          preferredPlacement: preferredPlacement || null,
          accessMethod,
          accessCredentials: JSON.stringify(accessCredentials || {}),
          notes: notes || null,
          status: INSTALL_JOB_STATUS.QUEUED,
          priority: 0,
          checklistCompleted: false,
          proofUploaded: false,
        },
      });
    }

    // For paid plans: require at least one registered site before completing
    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        referenceId: session.user.id,
        status: { in: ["active", "trialing"] },
      },
    });
    const hasPaidPlan = !!activeSubscription;
    if (hasPaidPlan && !hasInstallSetup) {
      const members = await prisma.member.findMany({
        where: { userId: session.user.id },
        select: { organizationId: true },
      });
      const orgIds = members.map((m) => m.organizationId);
      const clients =
        orgIds.length > 0
          ? await prisma.client.findMany({
              where: { organizationId: { in: orgIds } },
              select: { id: true },
            })
          : [];
      if (clients.length === 0) {
        return NextResponse.json(
          {
            error:
              "You must register at least one site before completing onboarding.",
            needsSiteRegistration: true,
          },
          { status: 400 }
        );
      }
      const verifiedPhoneCount = await prisma.phoneNumber.count({
        where: {
          clientId: { in: clients.map((c) => c.id) },
          verified: true,
        },
      });
      if (verifiedPhoneCount === 0) {
        return NextResponse.json(
          {
            error:
              "You must verify at least one phone number for your site before completing onboarding.",
            needsPhoneVerification: true,
          },
          { status: 400 }
        );
      }
    }

    // Mark onboarding complete (plan/add-on flow)
    await prisma.onboarding.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        planId: "free",
        completedAt: now,
      },
      update: { completedAt: now },
    });

    // Welcome email: after successful signup and trial activation
    if (activeSubscription && session.user.email) {
      const dashboardLink =
        process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
      const firstName =
        (session.user.name ?? "").trim().split(/\s+/)[0] || "there";
      const { subject, html, text } = renderWelcomeEmail({
        first_name: firstName,
        dashboard_link: dashboardLink,
      });
      sendEmail({
        to: session.user.email,
        subject,
        html,
        text,
      }).catch((err) =>
        console.error("[onboarding/complete] Welcome email failed:", err)
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Onboarding complete error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
