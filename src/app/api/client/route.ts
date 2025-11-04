import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { checkSiteLimit } from "@/lib/plan-limits";
import { getActiveOrganization } from "@/lib/organization-helpers";

/* ----------  POST /api/client  ----------------------------------------- */
export async function POST(req: Request) {
  let normalizedDomain: string | undefined;
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
    const { name, domain } = body;

    if (!name || !domain) {
      return NextResponse.json(
        { error: "Missing required fields: name and domain" },
        { status: 400 }
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

    const client = await prisma.client.create({
      data: {
        name,
        domain: normalizedDomain,
        organizationId,
        // ✅ Defaults for widget
        defaultType: "banner",
        defaultBgColor: "#222",
        defaultTextColor: "#fff",
        defaultFont: "sans-serif",
        defaultDismissAfter: 5000,
        pinned: false,
      },
    });

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
        const errorDomain = normalizedDomain || domain;
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

    /* 3️⃣ Fetch and return the organization's clients */
    const clients = await prisma.client.findMany({
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
      },
    });

    return NextResponse.json(clients);
  } catch (error) {
    console.error("[CLIENTS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}