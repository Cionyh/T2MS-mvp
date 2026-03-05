import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { checkSiteLimit } from "@/lib/plan-limits";
import { getActiveOrganization, isPhoneUsedByAnotherUser, normalizeKeyword, isKeywordTakenByUser } from "@/lib/organization-helpers";
import { INSTALL_JOB_STATUS } from "@/lib/job-status";

/* ----------  POST /api/client  ----------------------------------------- */
export async function POST(req: Request) {
  let normalizedDomain: string | undefined;
  let domain: string | undefined;
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, domain: domainValue, phone: phoneValue, keyword: keywordValue } = body;
    domain = domainValue;

    if (!name || !domain) {
      return NextResponse.json(
        { error: "Missing required fields: name and domain" },
        { status: 400 }
      );
    }

    // Keyword: required for new sites; used for SMS routing (KEYWORD: message)
    const rawKeyword = typeof keywordValue === "string" ? keywordValue.trim() : "";
    if (!rawKeyword) {
      return NextResponse.json(
        { error: "Keyword is required. It identifies this site when you text (e.g. BAKERY: your message)." },
        { status: 400 }
      );
    }
    // Allow letters, numbers, underscore; 1–50 chars
    if (!/^[A-Za-z0-9_]{1,50}$/.test(rawKeyword)) {
      return NextResponse.json(
        { error: "Keyword must be 1–50 characters, letters, numbers, or underscore only." },
        { status: 400 }
      );
    }
    const keyword = normalizeKeyword(rawKeyword);

    const taken = await isKeywordTakenByUser(session.user.id, keyword);
    if (taken) {
      return NextResponse.json(
        { error: `You already have a site with keyword "${keyword}". Choose a different keyword.` },
        { status: 409 }
      );
    }

    // Get active organization for the user
    const organizationId = await getActiveOrganization();
    if (!organizationId) {
      return NextResponse.json(
        { error: "No active organization. Please select or create an organization first." },
        { status: 400 }
      );
    }

    // Check site limit based on organization's plan
    const siteLimit = await checkSiteLimit(organizationId);
    if (!siteLimit.allowed) {
      return NextResponse.json(
        { 
          error: `Site limit exceeded. You can create up to ${siteLimit.limit === -1 ? 'unlimited' : siteLimit.limit} sites on your current plan. You currently have ${siteLimit.current} sites.`,
          limitExceeded: true,
          current: siteLimit.current,
          limit: siteLimit.limit
        },
        { status: 403 }
      );
    }

    // ✅ Normalize domain: remove protocol, www, and trailing slashes
    try {
      const url = new URL(
        domain.startsWith("http://") || domain.startsWith("https://")
          ? domain
          : `https://${domain}`
      );
      normalizedDomain = url.hostname.replace(/^www\./, "");
    } catch (err) {
      console.error("[DOMAIN_NORMALIZATION_ERROR]", err);
      return NextResponse.json(
        { error: "Invalid domain format" },
        { status: 400 }
      );
    }

    // normalizedDomain is guaranteed to be defined here since we return early on error
    if (!normalizedDomain) {
      return NextResponse.json(
        { error: "Invalid domain format" },
        { status: 400 }
      );
    }

    // Validate domain not already registered (don't create site if taken)
    const existingByDomain = await prisma.client.findUnique({
      where: { domain: normalizedDomain },
    });
    if (existingByDomain) {
      return NextResponse.json(
        { error: `The domain "${normalizedDomain}" is already registered.` },
        { status: 409 }
      );
    }

    // If phone provided (e.g. onboarding), validate it's not used by another user before creating site
    if (phoneValue && typeof phoneValue === "string" && phoneValue.trim()) {
      const usedByOther = await isPhoneUsedByAnotherUser(session.user.id, phoneValue.trim());
      if (usedByOther) {
        return NextResponse.json(
          {
            error:
              "This phone number is already used by another account. Each phone number can only be linked to one account.",
          },
          { status: 409 }
        );
      }
    }

    const client = await prisma.client.create({
      data: {
        name,
        domain: normalizedDomain,
        organizationId,
        keyword,
        // ✅ Defaults for widget
        defaultType: "banner",
        defaultBgColor: "#222",
        defaultTextColor: "#fff",
        defaultFont: "sans-serif",
        defaultDismissAfter: 5000,
        pinned: false,
      },
    });

    // Auto-create an install job (no payment required) so site shows "Installation In Progress"
    try {
      let customer = await prisma.customer.findUnique({
        where: { userId: session.user.id },
      });
      if (!customer) {
        customer = await prisma.customer.create({
          data: { userId: session.user.id },
        });
      }
      await prisma.installJob.create({
        data: {
          customerId: customer.id,
          clientId: client.id,
          platform: "To be confirmed",
          installType: "script",
          websiteUrls: [client.domain.startsWith("http") ? client.domain : `https://${client.domain}`],
          accessMethod: "instructions",
          accessCredentials: "{}",
          status: INSTALL_JOB_STATUS.QUEUED,
          priority: 0,
          checklistCompleted: false,
          proofUploaded: false,
        },
      });
    } catch (jobErr) {
      console.error("[CLIENT_POST] Auto-create install job failed:", jobErr);
      // Don't fail client creation if job creation fails
    }

    // Return all defaults along with id
    return NextResponse.json({
      id: client.id,
      defaultType: client.defaultType,
      defaultBgColor: client.defaultBgColor,
      defaultTextColor: client.defaultTextColor,
      defaultFont: client.defaultFont,
      defaultDismissAfter: client.defaultDismissAfter,
      pinned: client.pinned,
    });
  } catch (error) {
    if (error instanceof Error && (error as any).code === "P2002") {
      const target = (error as any).meta?.target;
      if (target === "Client_domain_key" || target.includes("domain")) {
        // Use normalizedDomain if available, otherwise use original domain
        const errorDomain = normalizedDomain || domain || "unknown";
        return NextResponse.json(
          { error: `The domain "${errorDomain}" is already registered.` },
          { status: 409 } // Conflict
        );
      }
    }

    console.error("[CLIENT_POST]", error);
    return NextResponse.json(
      { error: "Client creation failed. Please try again." },
      { status: 500 }
    );
  }
}

/* ----------  GET /api/client - Get clients for active organization  ------------------------------- */
export async function GET(req: NextRequest) {
  try {
    /* 1️⃣ Retrieve the Better Auth session */
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    /* 2️⃣ Get active organization */
    const organizationId = await getActiveOrganization();
    if (!organizationId) {
      // Return empty array if no active organization
      return NextResponse.json([]);
    }

    /* 3️⃣ Fetch clients; include install job status if DB has clientId column (install_job) */
    let clients: Array<Record<string, unknown>>;
    try {
      const result = await prisma.client.findMany({
        where: { organizationId },
        include: {
          phoneNumbers: {
            where: { verified: true },
            select: {
              id: true,
              phone: true,
              verified: true,
            },
          },
          installJobs: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { id: true, status: true },
          },
        },
      });
      clients = result.map((client) => {
        const { installJobs, ...rest } = client;
        return {
          ...rest,
          installJob: installJobs?.[0] ?? null,
        };
      });
    } catch (includeError: unknown) {
      const code = (includeError as { code?: string })?.code;
      if (code === "P2022" || (includeError instanceof Error && includeError.message?.includes("clientId"))) {
        const result = await prisma.client.findMany({
          where: { organizationId },
          include: {
            phoneNumbers: {
              where: { verified: true },
              select: { id: true, phone: true, verified: true },
            },
          },
        });
        clients = result.map((client) => ({ ...client, installJob: null }));
      } else {
        throw includeError;
      }
    }

    return NextResponse.json(clients);
  } catch (error) {
    console.error("[CLIENTS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}