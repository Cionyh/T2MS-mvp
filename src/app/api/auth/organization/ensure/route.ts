import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getActiveOrganization } from "@/lib/organization-helpers";

/**
 * POST /api/auth/organization/ensure
 * Ensures the user has an active organization (creates one if needed)
 * This is called from the client to ensure organization exists before using Better Auth's organization API
 */
export async function POST(req: NextRequest) {
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

    // This will automatically create an organization if user doesn't have one
    const organizationId = await getActiveOrganization();

    if (!organizationId) {
      return NextResponse.json(
        { error: "Failed to create or retrieve organization" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      organizationId,
    });
  } catch (error) {
    console.error("Error ensuring organization:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

